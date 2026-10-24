#!/usr/bin/env node
// The traffic lights and the crossings painted on the streets, from the OpenStreetMap download in
// tools/cache/<city>.json (made by tools/osm_map.mjs), onto the streets of the city's map.js.
// Writes <city>/crossings.js.
//
//     node tools/crossings.mjs ghent
//
// A light stands where the map has highway=traffic_signals on a street cars drive on. The way the
// street runs there and which way its traffic goes (traffic_signals:direction, else towards the
// junction) say where its poles go. Lights within JOIN metres of each other are one junction,
// and take turns by the way their street runs. A crossing is highway=crossing with stripes
// (zebra) or squares (a bike crossing) on such a street.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
const CACHE = path.join(HERE, 'cache', `${city}.json`);
if (!city || !fs.existsSync(path.join(DIR, 'map.js')) || !fs.existsSync(CACHE)) {
  console.error('usage: node tools/crossings.mjs <city>   (needs tools/cache/<city>.json: node tools/osm_map.mjs <city> --fetch)');
  process.exit(1);
}
const { area, MAP, game } = mapCoords(DIR, city);
const data = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
const CARS = new Set(['primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'living_street', 'service',
  'primary_link', 'secondary_link', 'tertiary_link', 'trunk', 'trunk_link']);
const JOIN = 40;           // game metres: lights this close together are one junction
const SNAP = 4;            // game metres from the map's street line, at most
const HW = (area.hw ?? 4.5) + 3; // keep this far off the race routes (the track draws its own street)

// every node on a street cars drive on: the way it is on and where along it
const onWay = new Map();
for (const w of data.ways) {
  if (!CARS.has(w.tags?.highway)) continue;
  w.nodes.forEach((id, k) => {
    const key = String(id);
    if (!onWay.has(key)) onWay.set(key, []);
    onWay.get(key).push([w, k]);
  });
}
// the way the OSM way runs at its k-th node, in game coordinates (a unit vector)
const heading = (w, k) => {
  const at = i => { const n = data.nodes[String(w.nodes[i])]; return n ? game(n.lat, n.lon) : null; };
  const a = at(Math.max(0, k - 1)), b = at(Math.min(w.nodes.length - 1, k + 1));
  if (!a || !b) return null;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return L < 0.01 ? null : [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
};

// the nearest stretch of the map's streets cars drive on: its width, height there and direction.
// With h, the way the node's own street runs, only a stretch running about the same way: by a
// bridge the nearest is often the end of the bridge's ramp, across the street, and well up.
const roads = MAP.roads.filter(r => !r.foot);
const snap = (x, z, h = null) => {
  let best = null;
  for (const r of roads) {
    for (let k = 0; k + 3 < r.p.length; k += 2) {
      const [ax, az, bx, bz] = r.p.slice(k, k + 4), dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
      if (L2 < 1e-4 || x < Math.min(ax, bx) - SNAP || x > Math.max(ax, bx) + SNAP || z < Math.min(az, bz) - SNAP || z > Math.max(az, bz) + SNAP) continue;
      const f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)), cx = ax + dx * f, cz = az + dz * f, d = Math.hypot(x - cx, z - cz);
      if (d > SNAP || (best && d >= best.d)) continue;
      if (h && Math.abs(dx * h[0] + dz * h[1]) < Math.sqrt(L2) * 0.7) continue;
      const L = Math.sqrt(L2), y = r.y ? r.y[k / 2] + (r.y[k / 2 + 1] - r.y[k / 2]) * f : 0;
      best = { d, x: cx, z: cz, y, w: r.w, ux: dx / L, uz: dz / L };
    }
  }
  return best;
};
const route = MAP.routes.flatMap(r => r.route);
const nearRoute = (x, z) => route.some(([rx, rz]) => (rx - x) ** 2 + (rz - z) ** 2 < HW * HW);
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;

const signals = [], crossings = [];
const skipped = { route: 0, snap: 0 };
for (const [id, n] of Object.entries(data.nodes)) {
  const t = n.tags;
  if (!t || !onWay.has(id)) continue;
  const light = t.highway === 'traffic_signals';
  const marks = t['crossing:markings'] ?? (['zebra', 'marked', 'traffic_signals', 'uncontrolled'].includes(t.crossing) ? 'zebra' : 'no');
  const crossing = (t.highway === 'crossing' || t.crossing === 'traffic_signals') && marks !== 'no' && t.crossing !== 'unmarked' ? (/dash|dot/.test(marks) ? 'bike' : 'zebra') : null;
  if (!light && !crossing) continue;
  const [w, k] = onWay.get(id)[0], h = heading(w, k), [x, z] = game(n.lat, n.lon);
  const s = (h && snap(x, z, h)) ?? snap(x, z);
  if (!s || !h) { skipped.snap++; continue; }
  if (nearRoute(s.x, s.z)) { skipped.route++; continue; }
  // the map's street direction, turned to run the way the OSM way does
  const sign = s.ux * h[0] + s.uz * h[1] < 0 ? -1 : 1, ux = s.ux * sign, uz = s.uz * sign;
  const a = r2(Math.atan2(uz, ux));
  if (crossing) crossings.push({ x: r1(s.x), z: r1(s.z), y: r2(s.y), a, w: r1(s.w), k: crossing });
  if (light) {
    const dir = t['traffic_signals:direction'] ?? t.direction;
    signals.push({ x: r1(s.x), z: r1(s.z), y: r2(s.y), a, w: r1(s.w), d: dir === 'forward' ? 1 : dir === 'backward' ? -1 : 0, ped: t.crossing === 'traffic_signals' || t.highway === 'crossing' });
  }
}

// junctions: lights near each other, joined up
const parent = signals.map((_, i) => i);
const root = i => (parent[i] === i ? i : (parent[i] = root(parent[i])));
for (let i = 0; i < signals.length; i++) for (let j = i + 1; j < signals.length; j++) {
  if (Math.hypot(signals[i].x - signals[j].x, signals[i].z - signals[j].z) < JOIN) parent[root(i)] = root(j);
}
const groups = new Map();
signals.forEach((s, i) => { const g = root(i); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(s); });
let j = 0, both = 0;
for (const list of groups.values()) {
  const cx = list.reduce((v, s) => v + s.x, 0) / list.length, cz = list.reduce((v, s) => v + s.z, 0) / list.length;
  const a0 = list[0].a;
  for (const s of list) {
    s.j = j;
    // the first light's street goes first, the streets across it second
    s.ph = Math.abs(Math.cos(s.a - a0)) > 0.7 ? 0 : 1;
    // no direction on the map: the traffic going towards the junction (both ways at its middle)
    if (!s.d && Math.hypot(cx - s.x, cz - s.z) > 6) s.d = Math.cos(s.a) * (cx - s.x) + Math.sin(s.a) * (cz - s.z) > 0 ? 1 : -1;
    if (!s.d) both++;
  }
  j++;
}

// a light just before a crossing stops the traffic before its stripes: back is how far before the
// light (along the traffic) the stop line goes
const ZEBRA = 4;
for (const s of signals) {
  s.back = 0.6;
  if (!s.d) continue;
  const ux = Math.cos(s.a) * s.d, uz = Math.sin(s.a) * s.d;
  for (const c of crossings) {
    const dx = c.x - s.x, dz = c.z - s.z, t = dx * ux + dz * uz;
    if (t > -3 && t < 10 && Math.abs(dx * uz - dz * ux) < 3) s.back = Math.max(s.back, r1(ZEBRA / 2 + 1 - t));
  }
}

console.log(`${signals.length} lights at ${j} junctions (${both} for both ways), ${crossings.length} crossings (${crossings.filter(c => c.k === 'bike').length} for bikes); left out: ${skipped.route} on the race routes, ${skipped.snap} off the map's streets`);
fs.writeFileSync(path.join(DIR, 'crossings.js'), `// ${city}: the traffic lights and crossings, made by \`node tools/crossings.mjs ${city}\`, do not edit by hand.
// Map data © OpenStreetMap contributors, available under the Open Database License (ODbL).
// x, z, y: game metres, on the street's middle line. a: the way the street runs (radians, atan2(z, x)),
// w: its width. A light's d: the traffic it is for runs along a (1), against it (-1) or both (0);
// j: its junction, ph: its turn there (0 or 1), ped: a crossing for people on foot too, back: how
// far before it (along its traffic) the stop line is.
// A crossing's k: 'zebra' (stripes) or 'bike' (squares along both edges).
export const SIGNALS = ${JSON.stringify(signals)};
export const CROSSINGS = ${JSON.stringify(crossings)};
`);
