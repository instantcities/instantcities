import { CAR_TYPES, heightAt, randomCar } from './cars.js';

// Cars parked nose to tail along both kerbs of the one-way stretches of a race route. The two outer
// lanes run over their roofs: jump up at the front of a row, ride along the roofs, drop off the end.

export const BAND = 2.1; // width of a parking lane, from the kerb inwards
const SPACE = 0.6; // between two parked cars
const START_CLEAR = 25; // metres either side of the start (and finish) line without parked cars
const MAX_ROW = 70; // a row of cars this long, then a gap
const GAP = 7;
const BENT = 0.5; // a turn this sharp (radians over 12 m) ends a row: no parking on corners

// flags: one-way (1) or not (0) for each route control point; free: car-free (1) or not, likewise.
// clear: track fractions to keep free, e.g. where a barrier stands across the whole street. No
// parking in front of a side street, nor on a car-free square (track.paved).
export function parkingRows(track, control, flags, clear = [], mouths = null, free = null) {
  const n = track.n, sp = track.spacing;
  const ok = new Uint8Array(n), oneway = new Uint8Array(n), lineless = new Uint8Array(n);
  const margin = Math.round(2 / sp);
  const nearMouth = i => !!mouths && [-margin, 0, margin].some(d => mouths.at[track.wrap(i + d)] !== 0);
  for (let i = 0; i < n; i++) {
    const p = track.points[i];
    let best = 0, bestD = Infinity;
    control.forEach(([x, z], k) => {
      const d = (x - p.x) ** 2 + (z - p.z) ** 2;
      if (d < bestD) { bestD = d; best = k; }
    });
    const along = track.fromGate(i);
    const look = Math.round(6 / sp), a = track.tangents[track.wrap(i - look)], b = track.tangents[track.wrap(i + look)];
    const bend = Math.acos(Math.max(-1, Math.min(1, a.x * b.x + a.z * b.z)));
    const blocked = clear.some(f => Math.abs(track.delta(track.atFrac(f), i)) * sp < 5);
    oneway[i] = flags[best];
    lineless[i] = flags[best] || free?.[best] ? 1 : 0; // no centre line where nobody drives either
    ok[i] = flags[best] && along > START_CLEAR && bend < BENT && !blocked && !nearMouth(i) && !track.paved?.[i] ? 1 : 0;
  }
  // rows: runs of parking samples, cut into lengths with a gap now and then
  const rowAt = new Int16Array(n).fill(-1), sAt = new Float32Array(n), rows = [];
  // rows: runs of parking samples, cut into lengths with a gap now and then. Each kerb of a row
  // gets its own cars, nose to tail; no vans or lorries, they are too tall to step onto from another car.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = () => randomCar(rand, { low: true });
  const cars = [];
  let i = 0;
  while (i < n) {
    if (!ok[i]) { i++; continue; }
    let j = i;
    while (j < n && ok[j]) j++;
    const len = (j - i) * sp;
    for (let s0 = 0; s0 < len - 5; s0 += MAX_ROW + GAP) {
      const rlen = Math.min(MAX_ROW, len - s0), i0 = i + Math.round(s0 / sp), row = { i0, len: 0, sides: {} };
      for (const side of [1, -1]) {
        const list = [];
        for (let at = 0.3; ;) {
          const car = pick(), L = CAR_TYPES[car.type].len;
          if (at + L > rlen) break;
          list.push({ s0: at, type: car.type });
          const idx = track.wrap(i0 + Math.round((at + L / 2) / sp)), p = track.at(idx, side * (track.hw - BAND / 2));
          cars.push({ x: p.x, y: p.y, z: p.z, yaw: track.yawAt(idx), ...car });
          at += L + SPACE;
        }
        row.sides[side] = list;
        if (list.length) row.len = Math.max(row.len, list.at(-1).s0 + CAR_TYPES[list.at(-1).type].len);
      }
      if (row.len < 8) continue;
      const k = rows.length;
      rows.push(row);
      for (let q = i0; q < i0 + Math.round(row.len / sp) && q < j; q++) {
        rowAt[q] = k;
        sAt[q] = (q - i0) * sp;
      }
    }
    i = j;
  }
  return { rows, rowAt, sAt, cars, oneway, lineless };
}

// Height of the car under a point s metres along one kerb of a row.
function profile(cars, s) {
  for (const c of cars) if (s >= c.s0 && s <= c.s0 + CAR_TYPES[c.type].len) return heightAt(c.type, s - c.s0);
  return 0;
}

// What a rider at sample idx, lat metres from the centerline, stands on: 0 for the street.
// A horse is long enough to bridge the gap between two cars, so it takes the highest point under it.
// Up on the roofs a horse keeps its footing until half its body is past the cars' inner edge.
export function groundAt(parking, track, idx, lat, up = false) {
  if (!parking) return 0;
  const row = parking.rowAt[idx];
  if (row < 0 || Math.abs(lat) < track.hw - BAND - (up ? 0.5 : 0)) return 0;
  const cars = parking.rows[row].sides[lat > 0 ? 1 : -1], s = parking.sAt[idx];
  return Math.max(profile(cars, s - 1), profile(cars, s), profile(cars, s + 1));
}

// Metres to the end of the row a rider on the roofs is on, and from there to the next row's start.
export function rowEnd(parking, track, idx) {
  const row = parking?.rowAt[idx] ?? -1;
  if (row < 0) return null;
  const r = parking.rows[row], end = r.i0 + Math.round(r.len / track.spacing);
  const toEnd = track.delta(idx, end) * track.spacing;
  const next = parking.rows[(row + 1) % parking.rows.length];
  if (track.open && row === parking.rows.length - 1) return { toEnd, gap: Infinity }; // the last row: none after it
  return { toEnd, gap: track.delta(end, next.i0) * track.spacing };
}

// Where the next row of cars starts ahead of sample idx, within dist metres (or -1).
export function rowAhead(parking, track, idx, dist) {
  if (!parking) return -1;
  let best = -1, bestD = dist;
  for (const r of parking.rows) {
    const d = track.delta(idx, r.i0) * track.spacing;
    if (d > 0 && d < bestD) { bestD = d; best = r.i0; }
  }
  return best;
}
