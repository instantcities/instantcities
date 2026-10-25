#!/usr/bin/env node
// The city's banners: the tall coloured flag Stad Gent hangs out over the pavement at its schools,
// crèches and museums, the white "gent:" logo at the top, the name in white down the middle and a
// white foot. One for each school, crèche and museum in OpenStreetMap, hung on the street front of
// the building it is in (or the nearest one), so they are easy to find from the street.
//
//     node tools/banners.mjs ghent      # -> ghent/banners.js
//
// The places come from Overpass (amenity=school, kindergarten, childcare and tourism=museum in the
// area's bbox), kept in tools/cache/banners-<city>.json; --fetch downloads them again. When Overpass
// cannot be reached and nothing is cached, the museums and schools of the map's index (famous.js)
// stand in. Either way the map's school buildings that no named place is near get a banner too,
// with just what they are on it (OpenStreetMap does not name them).
// Map data © OpenStreetMap contributors, available under the ODbL.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
if (!city || !fs.existsSync(path.join(DIR, 'area.json'))) {
  console.error('usage: node tools/banners.mjs <city>   (the city folder, e.g. ghent)');
  process.exit(1);
}
const { MAP, game, area } = mapCoords(DIR, city);
const FLOOR = 3.4; // game metres a storey, as the map's houses

// ------------------------------------------------------------------ the places

const cacheFile = path.join(HERE, 'cache', `banners-${city}.json`);
async function download() {
  const [s, w, n, e] = area.bbox, b = `${s},${w},${n},${e}`;
  const q = `[out:json][timeout:90];(nwr[amenity~"^(school|kindergarten|childcare)$"](${b});nwr[tourism=museum](${b}););out center tags;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'User-Agent': 'instant-gent map tool' }, body: new URLSearchParams({ data: q }), signal: AbortSignal.timeout(120000) });
  const text = await res.text();
  if (!res.ok || !text.startsWith('{')) throw new Error(`overpass ${res.status}`);
  return JSON.parse(text).elements;
}
let elements = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : null;
if (!elements || process.argv.includes('--fetch')) {
  try {
    elements = await download();
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(elements));
  } catch (e) {
    console.error(`Overpass not reached (${e.message}): the map's index stands in`);
  }
}

const kindOf = t => (t.tourism === 'museum' ? 'museum' : t.amenity);
let places;
if (elements) {
  places = elements.filter(el => el.tags?.name).map(el => {
    const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
    const [x, z] = game(lat, lon);
    return { name: el.tags.name, kind: kindOf(el.tags), x, z, area: el.type !== 'node' };
  });
} else {
  const { FAMOUS } = await import(pathToFileURL(path.join(DIR, 'famous.js')));
  places = FAMOUS.filter(f => f.kind === 'museum' || f.kind === 'school').map(f => ({ name: f.name, kind: f.kind, x: f.x, z: f.z, area: true }));
}
// the same place mapped twice (a school as a point and as its grounds): keep one
places = places.filter((p, i) => !places.slice(0, i).some(q => q.name === p.name && Math.hypot(q.x - p.x, q.z - p.z) < 150));

// the map's school buildings no named place is near, one banner for each group of them
const SCHOOLS = { school: 'school', college: 'school', kindergarten: 'kindergarten' };
const centre = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
const groups = [];
for (const b of MAP.buildings) {
  if (!SCHOOLS[b.k]) continue;
  const [x, z] = centre(b.p);
  if (places.some(p => Math.hypot(p.x - x, p.z - z) < 120)) continue;
  const g = groups.find(g => g.kind === SCHOOLS[b.k] && g.at.some(([gx, gz]) => Math.hypot(gx - x, gz - z) < 60));
  if (g) g.at.push([x, z]);
  else groups.push({ kind: SCHOOLS[b.k], at: [[x, z]] });
}
for (const g of groups) places.push({ name: '', kind: g.kind, x: g.at.reduce((a, v) => a + v[0], 0) / g.at.length, z: g.at.reduce((a, v) => a + v[1], 0) / g.at.length, area: true });

// ------------------------------------------------------------------ where each one hangs

const inside = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
const nearOnSeg = (x, z, ax, az, bx, bz) => {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
  return [ax + dx * t, az + dz * t, t];
};
const edge = (p, k) => {
  const n = p.length / 2;
  return [p[2 * k], p[2 * k + 1], p[((k + 1) % n) * 2], p[((k + 1) % n) * 2 + 1]];
};
// the outline's outward normal of edge k
const outward = (p, k) => {
  const n = p.length / 2;
  let sign = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) sign += p[2 * j] * p[2 * i + 1] - p[2 * i] * p[2 * j + 1];
  const [ax, az, bx, bz] = edge(p, k), L = Math.hypot(bx - ax, bz - az) || 1;
  return sign > 0 ? [(bz - az) / L, (ax - bx) / L] : [(az - bz) / L, (bx - ax) / L];
};

// the buildings, in a grid for looking up what is near, and the roads' stretches likewise
const CELL = 50, grid = new Map(), roadGrid = new Map();
const put = (g, x, z, v) => { const key = `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`; if (!g.has(key)) g.set(key, []); g.get(key).push(v); };
MAP.buildings.forEach((b, i) => { if (b.k !== 'part') put(grid, ...centre(b.p), i); });
for (const rd of MAP.roads) for (let k = 0; k + 3 < rd.p.length; k += 2) put(roadGrid, (rd.p[k] + rd.p[k + 2]) / 2, (rd.p[k + 1] + rd.p[k + 3]) / 2, [rd.p[k], rd.p[k + 1], rd.p[k + 2], rd.p[k + 3], rd.w ?? 6]);
const near = (g, x, z, r) => {
  const out = [];
  for (let gx = Math.floor((x - r) / CELL); gx <= Math.floor((x + r) / CELL); gx++) {
    for (let gz = Math.floor((z - r) / CELL); gz <= Math.floor((z + r) / CELL); gz++) out.push(...(g.get(`${gx},${gz}`) ?? []));
  }
  return out;
};
// how far (x, z) is from the nearest road's edge
const offRoad = (x, z) => Math.min(Infinity, ...near(roadGrid, x, z, 40).map(([ax, az, bx, bz, w]) => { const [px, pz] = nearOnSeg(x, z, ax, az, bx, bz); return Math.hypot(px - x, pz - z) - w / 2; }));
// the building's street front: its longest wall (2.5 m or longer) that looks out on a road, 4 m
// from it at most; else the wall nearest a road. (Not the map's fe: on some outlines that is a
// sliver of a wall, a few centimetres long.)
const fronts = new Map();
const frontOf = b => {
  if (fronts.has(b)) return fronts.get(b);
  let best = null;
  for (let k = 0; k < b.p.length / 2; k++) {
    const [ax, az, bx, bz] = edge(b.p, k), L = Math.hypot(bx - ax, bz - az);
    if (L < 2.5) continue;
    const [ox, oz] = outward(b.p, k), d = offRoad((ax + bx) / 2 + ox, (az + bz) / 2 + oz);
    const score = d < 4 ? 1000 + L : -d;
    if (!best || score > best.score) best = { k, d, score };
  }
  fronts.set(b, best);
  return best;
};

const left = []; // what found no building
// The places given by their address (<city>/banners.json): the street's ways joined into one
// line, counted from the end nearest the middle of town; the house at that number is the one so
// many along on its side of the street (odd on the left going out of town, even on the right, as
// Belgian streets are numbered), taking the map's houses facing the street as one number each.
const TOWN = [100, -60]; // the middle of town (by the Belfort), where house numbers start from
const extraFile = path.join(DIR, 'banners.json');
for (const ex of fs.existsSync(extraFile) ? JSON.parse(fs.readFileSync(extraFile, 'utf8')).extra ?? [] : []) {
  const n = MAP.names.indexOf(ex.street);
  const ways = MAP.roads.filter(rd => rd.n === n).map(rd => { const pts = []; for (let k = 0; k < rd.p.length; k += 2) pts.push([rd.p[k], rd.p[k + 1]]); return pts; });
  if (!ways.length) { left.push(`${ex.name} (no ${ex.street} in the map)`); continue; }
  // join the ways end to end, as far as they go, starting from the longest
  const len = l => l.reduce((a, v, k) => a + (k ? Math.hypot(v[0] - l[k - 1][0], v[1] - l[k - 1][1]) : 0), 0);
  ways.sort((a, b) => len(b) - len(a));
  let line = ways.shift();
  for (let grew = true; grew;) {
    grew = false;
    for (let k = 0; k < ways.length; k++) {
      const w = ways[k], [a, b] = [line[0], line[line.length - 1]], close = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1.5;
      if (close(b, w[0])) line = line.concat(w.slice(1));
      else if (close(b, w[w.length - 1])) line = line.concat(w.slice(0, -1).reverse());
      else if (close(a, w[w.length - 1])) line = w.slice(0, -1).concat(line);
      else if (close(a, w[0])) line = w.slice(1).reverse().concat(line);
      else continue;
      ways.splice(k--, 1);
      grew = true;
    }
  }
  const d0 = Math.hypot(line[0][0] - TOWN[0], line[0][1] - TOWN[1]), d1 = Math.hypot(line.at(-1)[0] - TOWN[0], line.at(-1)[1] - TOWN[1]);
  if (d1 < d0) line.reverse();
  // where a point is along the line, and on which side (left > 0, going out of town)
  const along = (x, z) => {
    let best = null, s0 = 0;
    for (let k = 0; k + 1 < line.length; k++) {
      const [ax, az] = line[k], [bx, bz] = line[k + 1], L = Math.hypot(bx - ax, bz - az);
      const [px, pz, t] = nearOnSeg(x, z, ax, az, bx, bz), d = Math.hypot(px - x, pz - z);
      if (!best || d < best.d) best = { d, s: s0 + t * L, side: (bx - ax) * (z - az) - (bz - az) * (x - ax) };
      s0 += L;
    }
    return best;
  };
  // the houses along it: a front within 14 m of the street's middle
  const [mx, mz] = line[Math.floor(line.length / 2)], reach = len(line) / 2 + 40;
  const houses = [];
  for (const i of new Set(near(grid, mx, mz, reach))) {
    const b = MAP.buildings[i], f = frontOf(b);
    if (!f || b.k === 'shed' || b.k === 'garage' || b.k === 'garages') continue;
    const [ax, az, bx, bz] = edge(b.p, f.k), at = along((ax + bx) / 2, (az + bz) / 2);
    if (at.d < 14) houses.push({ i, ...at, mid: [(ax + bx) / 2, (az + bz) / 2] });
  }
  // in three.js's x right, z down (south), the cross product's sign is turned: left of the way is < 0
  const side = houses.filter(h => (ex.number % 2 ? h.side < 0 : h.side > 0)).sort((a, b) => a.s - b.s);
  const h = side[Math.min(side.length - 1, Math.ceil(ex.number / 2) - 1)];
  if (!h) { left.push(`${ex.name} (no houses along ${ex.street})`); continue; }
  // a point just inside that house, behind the middle of its front
  const [cx, cz] = centre(MAP.buildings[h.i].p);
  places.push({ name: ex.name, sub: ex.sub, kind: ex.kind, x: h.mid[0] + (cx - h.mid[0]) * 0.2, z: h.mid[1] + (cz - h.mid[1]) * 0.2, area: false, street: ex.street });
}

const BANNER = 3.6, LOW = 3.6; // how long a banner hangs, and how high its foot is on a tall house
const used = new Map(); // building -> how many banners on its front already
const banners = [];
for (const pl of places) {
  // the building the place is in, else (a school's grounds, a point by the door) the nearest one,
  // a school building before any other; only a front that looks out on a road
  const reach = pl.area ? (pl.name ? 130 : 90) : 40;
  let best = null;
  for (const i of near(grid, pl.x, pl.z, reach)) {
    const b = MAP.buildings[i], f = frontOf(b);
    if (!f || f.d > 15) continue;
    const [ax, az, bx, bz] = edge(b.p, f.k);
    const [nx, nz] = nearOnSeg(pl.x, pl.z, ax, az, bx, bz);
    const d = inside(pl.x, pl.z, b.p) ? -100 : Math.hypot(nx - pl.x, nz - pl.z) - (SCHOOLS[b.k] && pl.kind !== 'museum' ? 40 : 0);
    if (!best || d < best.d) best = { i, d, fe: f.k, dist: Math.hypot(nx - pl.x, nz - pl.z) };
  }
  if (!best || best.dist > reach) { left.push(pl.name || pl.kind); continue; }
  const b = MAP.buildings[best.i];
  const [ax, az, bx, bz] = edge(b.p, best.fe), L = Math.hypot(bx - ax, bz - az);
  const [ox, oz] = outward(b.p, best.fe);
  // near one end of the front, by where a door would be; a second banner on the same front at the other end
  const k = used.get(best.i) ?? 0;
  if (k >= (pl.name ? 2 : 1)) continue;
  used.set(best.i, k + 1);
  const t = L < 6 ? 0.5 : k ? 1 - 1.4 / L : 1.4 / L;
  const top = b.e ?? b.f * FLOOR;
  const y = Math.max(2.4, Math.min(LOW, top - 0.5 - BANNER));
  const h = Math.min(BANNER, Math.max(1.6, top - 0.5 - y));
  banners.push({
    name: pl.name, ...(pl.sub ? { sub: pl.sub } : {}), ...(pl.street ? { street: pl.street } : {}), kind: pl.kind,
    x: +(ax + (bx - ax) * t).toFixed(2), z: +(az + (bz - az) * t).toFixed(2),
    // the way it sticks out from the wall: 0 east, as the game turns things (rotation.y)
    turn: +Math.atan2(-oz, ox).toFixed(3), y: +y.toFixed(1), h: +h.toFixed(1),
  });
}

banners.sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name) || a.x - b.x);
const out = `// ${city}: generated by tools/banners.mjs, do not edit by hand.
// Map data © OpenStreetMap contributors, available under the Open Database License (ODbL).
// The city's banners on its schools, crèches and museums: { name ('' when the map has none), sub?:
// the thin line beside it, street?: the street it was placed in by address, kind (school,
// kindergarten, childcare, museum), x, z: where it meets the wall, turn: the way it sticks out
// (rotation.y), y: how high its foot is, h: how long it hangs }, in game metres.
export const BANNERS = [
${banners.map(b => '  ' + JSON.stringify(b)).join(',\n')},
];
`;
fs.writeFileSync(path.join(DIR, 'banners.js'), out);
const count = {};
for (const b of banners) count[b.kind] = (count[b.kind] ?? 0) + 1;
console.log(`${banners.length} banners (${Object.entries(count).map(([k, n]) => `${n} ${k}`).join(', ')}), from ${elements ? 'Overpass' : "the map's index"}`);
if (left.length) console.log(`no building near: ${left.join(', ')}`);
