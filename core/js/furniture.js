// Street furniture all over the city, not only along the race routes: a street lamp every 28 m
// on every street (slim anthracite ones, black lanterns in the old centre), bollards ("paaltjes")
// at the mouths of the pedestrian streets and along the narrow old streets, litter bins, benches
// in the parks and on the squares, and red bpost post boxes. Where OpenStreetMap has them
// (<city>/furniture.js) they stand where it says; the rest is placed here, off the race
// routes, clear of buildings, trees and water. One instanced mesh per kind of thing, which
// js/tiles.js then cuts into tiles so that what is out of view is not drawn.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ID, FURNITURE, SQUARES, MONUMENTS } from './city.js';
import { sunk } from './hollows.js';

const LAMP_EVERY = 28;   // metres between two lamps along a street
const LAMP_GAP = 12;     // and no two lamps closer than this anywhere (junctions, dual roads)
const OLD_TOWN = 700;    // the lanterns stand within this of the middle of the first race route
const CELL = 16;

const hash = (a, b = 0) => ((Math.imul(a + 1, 2654435761) ^ Math.imul(b + 7, 40503)) >>> 0) / 4294967296;

// a few points to look up near another point
class Grid {
  constructor() { this.cells = new Map(); }
  key(x, z) { return (Math.floor(x / CELL) + 4096) * 8192 + Math.floor(z / CELL) + 4096; }
  add(x, z, item) {
    const k = this.key(x, z);
    if (!this.cells.has(k)) this.cells.set(k, []);
    this.cells.get(k).push(item);
  }
  // anything within r (r <= CELL) of (x, z) that passes test
  any(x, z, r, test = () => true) {
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      for (const it of this.cells.get(this.key(x + i * CELL, z + j * CELL)) ?? []) {
        if (Math.hypot(it.x - x, it.z - z) < r && test(it)) return true;
      }
    }
    return false;
  }
}

// ------------------------------------------------------------------ the models

// a piece of a model, painted one colour
function part(geo, col, x = 0, y = 0, z = 0) {
  geo = geo.toNonIndexed();
  geo.deleteAttribute('uv');
  geo.translate(x, y, z);
  const c = new THREE.Color(col), arr = new Float32Array(geo.attributes.position.count * 3);
  for (let k = 0; k < arr.length; k += 3) c.toArray(arr, k);
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}
const cyl = (r0, r1, h, n = 6) => new THREE.CylinderGeometry(r0, r1, h, n);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

const ANTHRACITE = 0x2c3034, BLACK = 0x18191a, GLOW = 0xfff1c8;
const CANDELABRA_LANTERNS = [[-0.8, 5.35], [0, 5.75], [0.8, 5.35]]; // where its lanterns hang: across, up
const GLASS = { lamp: [6.54, 0.5], lantern: [4.48, 0] }; // where the light of a lamp and a lantern is: up, out

// The squares that have no streets across them to bring lamps, ringed with lanterns by hand: p the
// line the ring stands on (flat [x, z, ...], a few metres in from the streets round it), and the
// statue in the middle (a MONUMENTS id) that a floodlight lights at night.
const LIT_SQUARES = {
  ghent: [
    // the Vrijdagmarkt, inside the streets round it and west of the lane across its east end
    { name: 'Vrijdagmarkt', statue: 'artevelde', inset: 6.5, p: [100, -497.6, 104.7, -484.9, 117.2, -476.1, 174, -436.3, 171.6, -458.2, 210.7, -509.5, 181.8, -531.2, 191.5, -536.3, 162.3, -560.1, 145.9, -561.3, 121.8, -533, 102, -505.4] },
  ],
};

// The models stand on the ground at (0, 0, 0), local +z towards the street.
function models() {
  return {
    // modern: a tall slim pole, the flat head reaching out over the street
    lamp: mergeGeometries([
      part(cyl(0.14, 0.15, 0.5), ANTHRACITE, 0, 0.25),
      part(cyl(0.055, 0.09, 6.6), ANTHRACITE, 0, 3.3),
      part(box(0.2, 0.1, 1.05), ANTHRACITE, 0, 6.6, 0.4),
    ]),
    lampGlass: part(box(0.15, 0.03, 0.7), GLOW, 0, GLASS.lamp[0], GLASS.lamp[1]),
    // historic: a black post with a lantern on top
    lantern: mergeGeometries([
      part(cyl(0.15, 0.2, 0.7, 8), BLACK, 0, 0.35),
      part(cyl(0.055, 0.08, 3.4), BLACK, 0, 2.4),
      part(cyl(0.11, 0.09, 0.12), BLACK, 0, 4.15),
      part(cyl(0.04, 0.33, 0.24), BLACK, 0, 4.87),
      part(cyl(0.01, 0.04, 0.22, 4), BLACK, 0, 5.1),
    ]),
    lanternGlass: part(cyl(0.25, 0.14, 0.55), GLOW, 0, GLASS.lantern[0]),
    // on the balustrade of a grand bridge (Sint-Michielsbrug): a stone pier, a tall cast-iron
    // column and three lanterns, one on top and two on curled arms (their glass is candelabraGlass)
    candelabra: mergeGeometries([
      part(box(0.8, 1.4, 0.8), 0x9b9184, 0, 0.7),
      part(box(0.9, 0.12, 0.9), 0x8c8376, 0, 1.46),
      part(cyl(0.2, 0.26, 0.6, 8), BLACK, 0, 1.82),
      part(cyl(0.07, 0.11, 3.6, 8), BLACK, 0, 3.9),
      part(cyl(0.14, 0.1, 0.2, 8), BLACK, 0, 5.2),
      part(box(1.6, 0.07, 0.07), BLACK, 0, 5.05),
      ...CANDELABRA_LANTERNS.flatMap(([x, y]) => [
        part(cyl(0.12, 0.09, 0.1, 8), BLACK, x, y - 0.3),
        part(cyl(0.04, 0.3, 0.22, 8), BLACK, x, y + 0.36),
        part(cyl(0.01, 0.04, 0.2, 4), BLACK, x, y + 0.57),
      ]),
    ]),
    candelabraGlass: mergeGeometries(CANDELABRA_LANTERNS.map(([x, y]) => part(cyl(0.22, 0.13, 0.5, 8), GLOW, x, y))),
    bollard: mergeGeometries([
      part(cyl(0.075, 0.085, 0.8), 0x3a3531, 0, 0.4),
      part(cyl(0.087, 0.087, 0.06), 0xb8b8b0, 0, 0.68),
      part(cyl(0.04, 0.075, 0.08), 0x3a3531, 0, 0.84),
    ]),
    bin: mergeGeometries([
      part(cyl(0.26, 0.23, 0.82, 8), 0x2e4636, 0, 0.41),
      part(cyl(0.22, 0.27, 0.09, 8), 0x3b3f43, 0, 0.86),
    ]),
    // a wooden seat and back on two steel frames, facing +z
    bench: mergeGeometries([
      part(box(1.8, 0.06, 0.46), 0x8b5e3c, 0, 0.45),
      part(box(1.8, 0.34, 0.05).rotateX(-0.18), 0x8b5e3c, 0, 0.78, -0.23),
      ...[-0.75, 0.75].flatMap(x => [
        part(box(0.06, 0.42, 0.42), ANTHRACITE, x, 0.21),
        part(box(0.05, 0.42, 0.05), ANTHRACITE, x, 0.7, -0.25),
      ]),
    ]),
    // bpost: a red box with a rounded top on a grey foot, the slot facing +z
    postBox: mergeGeometries([
      part(box(0.26, 0.5, 0.22), 0x404244, 0, 0.25),
      part(box(0.46, 0.68, 0.36), 0xd2281c, 0, 0.84),
      part(new THREE.CylinderGeometry(0.23, 0.23, 0.46, 8, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).scale(1, 0.6, 0.78), 0xd2281c, 0, 1.18),
      part(box(0.26, 0.03, 0.02), BLACK, 0, 1.04, 0.185),
    ]),
  };
}

// ------------------------------------------------------------------ where they stand

// How high a street is at a point s metres into its segment k (bridges, ramps).
const heightAt = (rd, k, f) => (rd.y ? rd.y[k] + (rd.y[k + 1] - rd.y[k]) * f : 0);

// Walk along a street, calling at(x, z, tx, tz, y, n) every `step` metres (n counts the stops).
function along(rd, step, start, at) {
  const p = rd.p;
  let next = start, run = 0, n = 0;
  for (let k = 0; k + 3 < p.length; k += 2) {
    const ax = p[k], az = p[k + 1], L = Math.hypot(p[k + 2] - ax, p[k + 3] - az);
    if (L < 0.01) continue;
    const tx = (p[k + 2] - ax) / L, tz = (p[k + 3] - az) / L;
    for (; next < run + L; next += step) {
      const s = next - run;
      at(ax + tx * s, az + tz * s, tx, tz, heightAt(rd, k / 2, s / L), n++);
    }
    run += L;
  }
}

// The streets raised onto bridges, to keep the lamps of the streets below from poking through.
function raised(map) {
  const g = new Grid();
  for (const rd of map.roads) {
    if (!rd.y) continue;
    along(rd, 3, 0, (x, z, tx, tz, y) => { if (y > 0.3) g.add(x, z, { x, z, y, r: rd.w / 2 + 1.8 }); });
  }
  return g;
}

function setup(ctx, map) {
  const trees = new Grid();
  for (let k = 0; k < map.trees.length; k += 2) trees.add(map.trees[k], map.trees[k + 1], { x: map.trees[k], z: map.trees[k + 1] });
  const route = map.route, mid = route.reduce((m, [x, z]) => [m[0] + x / route.length, m[1] + z / route.length], [0, 0]);
  const green = map.areas.filter(a => a.k === 'green' || a.k === 'wood').map(a => ({ p: a.p, b: bounds(a.p) }));
  return {
    ctx, map, trees, raised: raised(map), taken: new Grid(), lamps: new Grid(), green,
    old: (x, z) => Math.hypot(x - mid[0], z - mid[1]) < OLD_TOWN,
    out: { lamp: [], lantern: [], candelabra: [], bollard: [], bin: [], bench: [], postBox: [] },
  };
}

function bounds(p) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let k = 0; k < p.length; k += 2) { x0 = Math.min(x0, p[k]); x1 = Math.max(x1, p[k]); z0 = Math.min(z0, p[k + 1]); z1 = Math.max(z1, p[k + 1]); }
  return [x0, z0, x1, z1];
}
const inPoly = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
const inGreen = (w, x, z) => w.green.some(({ p, b }) => x > b[0] && x < b[2] && z > b[1] && z < b[3] && inPoly(x, z, p));

// Can something of radius r stand at (x, z)? Off the routes, out of buildings, water and the
// streets, away from trees and from what already stands there. (ox, oz) points away from the
// street it stands beside, so the test does not trip over that street.
function room(w, x, z, r, ox = 0, oz = 0) {
  const { ctx } = w;
  if (!ctx.free(x, z, 2) || !ctx.clear(x, z)) return false;
  if (!ctx.clear(x + ox * (r + 0.4), z + oz * (r + 0.4)) || !ctx.clear(x - oz * (r + 0.3), z + ox * (r + 0.3)) || !ctx.clear(x + oz * (r + 0.3), z - ox * (r + 0.3))) return false;
  return !w.trees.any(x, z, r + 1.2) && !w.taken.any(x, z, r + 0.6);
}

function put(w, kind, x, y, z, rot, r) {
  w.out[kind].push({ x, y: y + sunk(x, z), z, rot });
  w.taken.add(x, z, { x, z });
  return { x, z, r };
}

// A lamp every LAMP_EVERY metres along the car streets, on one pavement of a narrow street and
// staggered on both of a wide one; on the pedestrian streets along their edges. Now and then a
// bin beside it, and a post box in every few blocks.
function streetLamps(w) {
  const posts = [], boxCells = new Set();
  w.map.roads.forEach((rd, i) => {
    const pedestrian = rd.foot && rd.w >= 5;
    if ((rd.foot && !pedestrian) || rd.br === 3) return; // a grand bridge has lamps of its own
    const wide = rd.w >= 10 || pedestrian, side0 = hash(i) < 0.5 ? 1 : -1;
    const off = pedestrian ? rd.w / 2 - 0.6 : rd.w / 2 + (rd.bay ? 3.1 : 0.45); // behind the parking bays of a bay street
    along(rd, LAMP_EVERY, 6 + hash(i, 1) * 10, (x0, z0, tx, tz, y, n) => {
      const side = wide && n % 2 ? -side0 : side0, nx = -tz * side, nz = tx * side;
      const x = x0 + nx * off, z = z0 + nz * off, old = w.old(x, z);
      if (!room(w, x, z, 0.2, nx, nz) || w.lamps.any(x, z, LAMP_GAP)) return;
      if (w.raised.any(x, z, 10, s => s.y > y + 1 && Math.hypot(s.x - x, s.z - z) < s.r)) return;
      put(w, old ? 'lantern' : 'lamp', x, y, z, Math.atan2(-nx, -nz), 0.15);
      w.lamps.add(x, z, { x, z });
      posts.push({ x, z, r: 0.15, h: 99 });
      const bx = x + tx * 1.4, bz = z + tz * 1.4;
      if (hash(i, n) < (old || pedestrian ? 0.3 : 0.08) && room(w, bx, bz, 0.3, nx, nz)) posts.push({ ...put(w, 'bin', bx, y, bz, 0, 0.3), h: 1 });
      const cell = `${Math.floor(x / 380)},${Math.floor(z / 380)}`, px = x - tx * 1.6, pz = z - tz * 1.6;
      if (!pedestrian && !boxCells.has(cell) && hash(n, i) < 0.5 && room(w, px, pz, 0.35, nx, nz)) {
        boxCells.add(cell);
        posts.push({ ...put(w, 'postBox', px, y, pz, Math.atan2(-nx, -nz), 0.35), h: 1.3 });
      }
    });
  });
  return posts;
}

// The lamps on the balustrades of a grand bridge (rd.br 3), across from each other every 12 m.
// Nobody rides into them: the balustrade is in the way.
function bridgeLamps(w) {
  for (const rd of w.map.roads) {
    if (rd.br !== 3) continue;
    const off = (rd.foot ? rd.w : rd.w + 2.6) / 2, L = rd.p.reduce((a, _, k) => (k + 3 < rd.p.length && k % 2 === 0 ? a + Math.hypot(rd.p[k + 2] - rd.p[k], rd.p[k + 3] - rd.p[k + 1]) : a), 0);
    const n = Math.max(1, Math.round(L / 12)), step = L / n;
    along(rd, step, step / 2, (x, z, tx, tz, y) => {
      for (const s of [1, -1]) {
        const nx = -tz * s, nz = tx * s;
        w.out.candelabra.push({ x: x + nx * off, y, z: z + nz * off, rot: Math.atan2(-nx, -nz) });
        w.lamps.add(x + nx * off, z + nz * off, { x: x + nx * off, z: z + nz * off });
      }
    });
  }
}

// A ring of lanterns round a square that has none in its middle (LIT_SQUARES), every 14 m or so,
// and four round its statue where the market stalls leave room.
function squareLanterns(w) {
  const posts = [], one = (x, z) => {
    if (!room(w, x, z, 0.2) || w.lamps.any(x, z, 8) || inMonument(x, z)) return false;
    put(w, 'lantern', x, 0, z, hash(Math.round(x), Math.round(z)) * 6.28, 0.15);
    w.lamps.add(x, z, { x, z });
    posts.push({ x, z, r: 0.15, h: 99 });
    return true;
  };
  for (const sq of LIT_SQUARES[ID] ?? []) {
    const p = sq.p;
    for (let k = 0; k < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], bx = p[(k + 2) % p.length], bz = p[(k + 3) % p.length], L = Math.hypot(bx - ax, bz - az);
      const tx = (bx - ax) / L, tz = (bz - az) / L, n = Math.max(1, Math.round(L / 14)), step = L / n;
      let nx = -tz, nz = tx;
      if (!inPoly(ax + tx * L / 2 + nx, az + tz * L / 2 + nz, p)) { nx = -nx; nz = -nz; }
      for (let s = step / 2; s < L; s += step) {
        // where it should stand, or a little along or in from there
        for (const [ds, di] of [[0, 0], [2, 0], [-2, 0], [0, 1.5], [0, -1.5]]) {
          if (one(ax + tx * (s + ds) + nx * (sq.inset + di), az + tz * (s + ds) + nz * (sq.inset + di))) break;
        }
      }
    }
    const mo = MONUMENTS?.find(m => m.id === sq.statue);
    if (!mo) continue;
    const r = monumentRadius(mo) + 2.5;
    for (let a = 0; a < 4; a++) {
      const t = (mo.turn ?? 0) + Math.PI / 4 + (a * Math.PI) / 2;
      one(mo.x + Math.sin(t) * r, mo.z + Math.cos(t) * r);
    }
  }
  return posts;
}
const monumentRadius = mo => (Array.isArray(mo.size) ? Math.hypot(mo.size[0], mo.size[1]) / 2 : (mo.size ?? 2) / 2);
const inMonument = (x, z) => (MONUMENTS ?? []).some(mo => Math.abs(mo.x - x) < 20 && Math.abs(mo.z - z) < 20 && Math.hypot(mo.x - x, mo.z - z) < monumentRadius(mo) + 1);

// Bollards: a row across the mouth of every pedestrian street where it meets a car street, and a
// line of them along the kerbs of half the narrow streets of the old centre.
function bollards(w) {
  const posts = [], one = (x, z, y, ox = 0, oz = 0) => {
    if (room(w, x, z, 0.1, ox, oz)) posts.push({ ...put(w, 'bollard', x, y, z, 0, 0.1), h: 0.9 });
  };
  const ends = new Grid();
  w.map.roads.forEach(rd => { if (!rd.foot) along(rd, 2, 0, (x, z) => ends.add(x, z, { x, z, r: rd.w / 2 + 1.3 })); });
  for (const rd of w.map.roads) {
    if (!rd.foot || rd.w < 5) continue;
    const p = rd.p, n = p.length;
    for (const [ex, ez, qx, qz] of [[p[0], p[1], p[2], p[3]], [p[n - 2], p[n - 1], p[n - 4], p[n - 3]]]) {
      if (!ends.any(ex, ez, 10, s => Math.hypot(s.x - ex, s.z - ez) < s.r + 0.5)) continue;
      const L = Math.hypot(qx - ex, qz - ez) || 1, ux = (qx - ex) / L, uz = (qz - ez) / L;
      // just inside the pedestrian street, clear of the car street's pavement
      let d = 1;
      while (d < Math.min(L, 9) && ends.any(ex + ux * d, ez + uz * d, 10, s => Math.hypot(s.x - ex - ux * d, s.z - ez - uz * d) < s.r)) d += 0.5;
      const cx = ex + ux * (d + 0.4), cz = ez + uz * (d + 0.4);
      for (let a = -rd.w / 2 + 0.8; a <= rd.w / 2 - 0.8; a += 1.6) one(cx - uz * a, cz + ux * a, 0);
    }
  }
  w.map.roads.forEach((rd, i) => {
    if (rd.foot || rd.w > 8 || rd.br || hash(i, 3) < 0.5 || !w.old(rd.p[0], rd.p[1])) return;
    for (const side of [1, -1]) {
      along(rd, 3, 1.5, (x0, z0, tx, tz, y) => {
        const nx = -tz * side, nz = tx * side;
        one(x0 + nx * (rd.w / 2 + 0.4), z0 + nz * (rd.w / 2 + 0.4), y, nx, nz);
      });
    }
  });
  return posts;
}

// Benches along the paths through the parks and the pedestrian streets, each with a bin, and
// round the edges of the squares, looking in.
function benches(w) {
  const posts = [], bench = (x, z, y, rot, bx, bz) => {
    posts.push({ ...put(w, 'bench', x, y, z, rot, 0.5), h: 0.9 });
    if (bx !== undefined && room(w, bx, bz, 0.3)) posts.push({ ...put(w, 'bin', bx, y, bz, 0, 0.3), h: 1 });
  };
  w.map.roads.forEach((rd, i) => {
    if (!rd.foot) return;
    const park = rd.w < 5, step = park ? 45 : 60;
    along(rd, step, 10 + hash(i) * 20, (x0, z0, tx, tz, y, n) => {
      if (park && !inGreen(w, x0, z0)) return;
      const side = n % 2 ? 1 : -1, nx = -tz * side, nz = tx * side, off = park ? rd.w / 2 + 0.7 : rd.w / 2 - 0.9;
      const x = x0 + nx * off, z = z0 + nz * off;
      if (!room(w, x, z, 0.9, park ? nx : 0, park ? nz : 0)) return;
      bench(x, z, y, Math.atan2(-nx, -nz), n % 2 ? x + tx * 1.5 : undefined, z + tz * 1.5);
    });
  });
  for (const sq of SQUARES) {
    const p = sq.p;
    for (let k = 0; k < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], bx = p[(k + 2) % p.length], bz = p[(k + 3) % p.length], L = Math.hypot(bx - ax, bz - az);
      for (let s = 8; s < L - 8; s += 22) {
        const tx = (bx - ax) / L, tz = (bz - az) / L;
        let nx = -tz, nz = tx;
        if (!inPoly(ax + tx * s + nx * 3, az + tz * s + nz * 3, p)) { nx = -nx; nz = -nz; }
        const x = ax + tx * s + nx * 3, z = az + tz * s + nz * 3;
        if (room(w, x, z, 0.9)) bench(x, z, 0, Math.atan2(nx, nz));
      }
    }
  }
  return posts;
}

// Where OpenStreetMap has them, off the routes and out of the buildings.
function mapped(w) {
  const posts = [], kinds = { bollards: ['bollard', 0.1, 0.9], postBoxes: ['postBox', 0.35, 1.3], benches: ['bench', 0.5, 0.9], bins: ['bin', 0.3, 1] };
  for (const [key, [kind, r, h]] of Object.entries(kinds)) {
    const list = FURNITURE?.[key] ?? [];
    for (let k = 0; k < list.length; k += 2) {
      const x = list[k], z = list[k + 1];
      if (!w.ctx.free(x, z, 2) || !w.ctx.clear(x, z) || w.taken.any(x, z, r + 0.3)) continue;
      posts.push({ ...put(w, kind, x, 0, z, hash(k) * 6.28, r), h });
    }
  }
  return posts;
}

// ------------------------------------------------------------------ drawing them

function draw(ctx, w) {
  const geos = models(), material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.25 });
  const shadow = { lamp: true, lantern: true, candelabra: true, postBox: true };
  const d = new THREE.Object3D();
  for (const [kind, items] of Object.entries(w.out)) {
    if (!items.length) continue;
    const im = new THREE.InstancedMesh(geos[kind], material, items.length);
    items.forEach((it, i) => {
      d.position.set(it.x, it.y, it.z);
      d.rotation.set(0, it.rot, 0);
      d.updateMatrix();
      im.setMatrixAt(i, d.matrix);
    });
    im.computeBoundingSphere();
    im.castShadow = !!shadow[kind];
    im.receiveShadow = true;
    im.name = `furniture:${kind}`;
    im.userData.still = true; // js/tiles.js cuts it up by where they stand
    ctx.group.add(im);
    if (kind === 'candelabra') ctx.group.add(...candelabraLight(geos.candelabraGlass, items, d));
    if (kind === 'lamp' || kind === 'lantern') ctx.group.add(glassOf(geos[`${kind}Glass`], items, d, kind));
  }
  const lights = streetLight(w, d);
  if (lights.length) ctx.group.add(...lights); // (a city with no lamps, indoors, has none)
}

// The lamps, dim by day and lit at night (furnitureNight): the glass of every lamp, lantern and
// candelabra, a halo round each, a pool of light on the ground below, and a floodlight on the
// statue in the middle of a lit square.
const lit = { glass: null, halos: [], pools: [], spots: [] };

// one glass for them all, lit up at night
function glassMaterial() {
  return (lit.glass ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, emissive: 0x6b6040 }));
}

// the glass of every lamp of a kind, one instanced mesh
function glassOf(geo, items, d, kind) {
  const im = new THREE.InstancedMesh(geo, glassMaterial(), items.length);
  items.forEach((it, i) => {
    d.position.set(it.x, it.y, it.z);
    d.rotation.set(0, it.rot, 0);
    d.updateMatrix();
    im.setMatrixAt(i, d.matrix);
  });
  im.computeBoundingSphere();
  im.name = `furniture:${kind}Glass`;
  return im;
}

// The night light of the street lamps and lanterns: a halo at the glass of each (one cloud of
// points), a pool of light on the street under each (one instanced mesh, with the pools round the
// lit squares' statues), and one floodlight per lit square on its statue.
function streetLight(w, d) {
  const glows = [], pools = [];
  for (const kind of ['lamp', 'lantern']) {
    const [up, reach] = GLASS[kind], ahead = reach ? reach + 0.8 : 0;
    for (const it of w.out[kind]) {
      const sx = Math.sin(it.rot), cx = Math.cos(it.rot);
      glows.push(it.x + sx * reach, it.y + up - 0.08, it.z + cx * reach);
      // under the head reaching out over the street, or round the post
      pools.push({ x: it.x + sx * ahead, y: it.y, z: it.z + cx * ahead, r: kind === 'lamp' ? 6 : 5 });
    }
  }
  const out = [];
  if (glows.length) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(glows, 3));
    geo.computeBoundingSphere();
    const halos = new THREE.Points(geo, new THREE.PointsMaterial({
      map: glowTexture(), color: 0xffd38a, size: 2.6, sizeAttenuation: true, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    halos.name = 'furniture:lampHalos';
    halos.visible = false;
    lit.halos.push(halos);
    out.push(halos);
  }
  // the floodlit statues: a warm glow round the foot of the pedestal, and the light on it from
  // the ground in front, off by day (its intensity 0, so that the lights the materials are built
  // for stay the same between day and night)
  for (const sq of LIT_SQUARES[ID] ?? []) {
    const mo = MONUMENTS?.find(m => m.id === sq.statue);
    if (!mo) continue;
    const y = sunk(mo.x, mo.z), r = monumentRadius(mo), t = mo.turn ?? 0;
    for (let a = 0; a < 3; a++) {
      const u = t + (a * 2 * Math.PI) / 3;
      pools.push({ x: mo.x + Math.sin(u) * (r * 0.6 + 1), y, z: mo.z + Math.cos(u) * (r * 0.6 + 1), r: 3.5 });
    }
    const spot = new THREE.SpotLight(0xffd9a0, 0, 30, 0.42, 0.6, 1.6);
    spot.position.set(mo.x + Math.sin(t) * (r + 6), y + 0.6, mo.z + Math.cos(t) * (r + 6));
    spot.target.position.set(mo.x, y + 5, mo.z);
    spot.name = `furniture:floodlight:${mo.id}`;
    lit.spots.push(spot);
    out.push(spot, spot.target);
  }
  if (pools.length) out.push(poolsOf(pools, d, 0.4, 'furniture:lampPools', 12));
  return out;
}

// pools of light on the ground, {x, y, z, r} each: one instanced mesh, hidden by day (sides: of
// each disc, few for the thousands of street lamps, the glow fades out before the edge anyway)
function poolsOf(list, d, opacity, name, sides = 24) {
  const pools = new THREE.InstancedMesh(new THREE.CircleGeometry(1, sides).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
    map: glowTexture(), color: 0xffc46b, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -4,
  }), list.length);
  list.forEach((p, i) => {
    d.position.set(p.x, p.y + 0.1, p.z);
    d.rotation.set(0, 0, 0);
    d.scale.setScalar(p.r);
    d.updateMatrix();
    pools.setMatrixAt(i, d.matrix);
  });
  d.scale.setScalar(1);
  pools.computeBoundingSphere();
  pools.material.visible = false; // by its material, so the tiles it is cut into (tiles.js) go too
  pools.renderOrder = 1;
  pools.name = name;
  pools.userData.still = true; // cut into tiles: only the ones near the camera are drawn
  lit.pools.push(pools.material);
  return pools;
}

function candelabraLight(geo, items, d) {
  const im = glassOf(geo, items, d, 'candelabra');
  const tex = glowTexture(), halo = new THREE.SpriteMaterial({ map: tex, color: 0xffd38a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  const halos = new THREE.Group();
  for (const it of items) {
    for (const [x, y] of CANDELABRA_LANTERNS) {
      const sp = new THREE.Sprite(halo);
      sp.position.set(it.x + Math.cos(it.rot) * x, it.y + y, it.z - Math.sin(it.rot) * x);
      sp.scale.setScalar(1.6);
      halos.add(sp);
    }
  }
  halos.visible = false;
  lit.halos.push(halos);
  // the pool of light on the deck, a little in from the balustrade (local +z faces the street)
  const pools = poolsOf(items.map(it => ({ x: it.x + Math.sin(it.rot) * 2.5, y: it.y, z: it.z + Math.cos(it.rot) * 2.5, r: 6 })), d, 0.55, 'furniture:candelabraPools');
  return [im, halos, pools];
}

let glowTex = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d'), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

// Light the lanterns for the night, or dim them by day: on from 0 (day) to 1 (night), so they come
// on and go out gradually as the sky fades.
const DIM = new THREE.Color(0x6b6040), LIT = new THREE.Color(0xffd38a);
export function furnitureNight(on) {
  const k = +on;
  if (lit.glass) {
    lit.glass.emissive.copy(DIM).lerp(LIT, k);
    lit.glass.emissiveIntensity = 1 + 1.2 * k;
  }
  const fade = m => { if (m) m.opacity = (m.userData.full ??= m.opacity) * k; };
  for (const h of lit.halos) {
    h.visible = k > 0.01;
    fade(h.material ?? h.children[0]?.material);
  }
  for (const m of lit.pools) {
    m.visible = k > 0.01;
    fade(m);
  }
  for (const s of lit.spots) s.intensity = 120 * k;
}



// Returns what a rider bumps into: [{x, z, r, h}] (see collide.js).
export function addFurniture(ctx, map) {
  const w = setup(ctx, map);
  bridgeLamps(w);
  const posts = [...mapped(w), ...streetLamps(w), ...squareLanterns(w), ...bollards(w), ...benches(w)];
  draw(ctx, w);
  return posts;
}
