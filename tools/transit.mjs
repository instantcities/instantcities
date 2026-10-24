#!/usr/bin/env node
// The bus and tram stops and the bus lines, from OpenStreetMap, onto the streets of the city's
// map.js. Writes <city>/transit.js.
//
//     node tools/transit.mjs ghent            # uses the download in tools/cache/<city>-transit.json
//     node tools/transit.mjs ghent --fetch    # downloads it again first (Overpass)
//
// A stop is a platform (highway=bus_stop, public_transport=platform) next to a street or a tram
// track: a pole on the kerb, with a shelter when the map says it has one. A tram halts where the
// map has railway=tram_stop on its track. A bus line is a route=bus relation: its ways strung end
// to end, the stretches inside the map's zone and off the race routes kept, with where along them
// its platforms are.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
const CACHE = path.join(HERE, 'cache', `${city}-transit.json`);
if (!city || !fs.existsSync(path.join(DIR, 'map.js'))) { console.error('usage: node tools/transit.mjs <city> [--fetch]'); process.exit(1); }
const { area, MAP, game } = mapCoords(DIR, city);

if (process.argv.includes('--fetch') || !fs.existsSync(CACHE)) {
  const b = area.bbox.join(',');
  const q = `[out:json][timeout:120];(node[highway=bus_stop](${b});node[public_transport=platform](${b});node[railway=tram_stop](${b});relation[route~"^(bus|tram)$"](${b}););out geom;`;
  console.error('asking overpass');
  const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'User-Agent': 'instant-gent map tool' }, body: new URLSearchParams({ data: q }) });
  if (!res.ok) { console.error(`overpass ${res.status}`); process.exit(1); }
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, await res.text());
}
const els = JSON.parse(fs.readFileSync(CACHE, 'utf8')).elements;

const HW = (area.hw ?? 4.5) + 4; // keep this far off the race routes
const route = MAP.routes.flatMap(r => r.route);
const nearRoute = (x, z) => route.some(([rx, rz]) => (rx - x) ** 2 + (rz - z) ** 2 < HW * HW);
const inZone = (x, z) => {
  const p = MAP.zone;
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
const hash = s => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return (h % 1000) / 1000; };

// the nearest stretch of a set of lines ({ p: flat [x, z], w?, y? }) within reach of (x, z)
const nearest = (lines, x, z, reach) => {
  let best = null;
  for (const r of lines) {
    for (let k = 0; k + 3 < r.p.length; k += 2) {
      const [ax, az, bx, bz] = r.p.slice(k, k + 4), dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
      if (L2 < 1e-4 || x < Math.min(ax, bx) - reach || x > Math.max(ax, bx) + reach || z < Math.min(az, bz) - reach || z > Math.max(az, bz) + reach) continue;
      const f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)), cx = ax + dx * f, cz = az + dz * f, d = Math.hypot(x - cx, z - cz);
      if (d > reach || (best && d >= best.d)) continue;
      const L = Math.sqrt(L2);
      best = { d, x: cx, z: cz, w: r.w ?? 2.6, y: r.y ? r.y[k / 2] + (r.y[k / 2 + 1] - r.y[k / 2]) * f : 0, ux: dx / L, uz: dz / L };
    }
  }
  return best;
};
const roads = MAP.roads.filter(r => !r.foot), trams = MAP.trams ?? [];

// ------------------------------------------------------------------ the stops

const stops = [], left = { route: 0, far: 0 };
for (const n of els) {
  const t = n.tags ?? {};
  if (n.type !== 'node' || !(t.highway === 'bus_stop' || (t.public_transport === 'platform' && (t.bus === 'yes' || t.tram === 'yes')))) continue;
  const [x, z] = game(n.lat, n.lon);
  if (!inZone(x, z)) continue;
  if (stops.some(s => Math.hypot(s.x - x, s.z - z) < 4)) continue; // one platform mapped twice
  // the street (or the tram track) it stands beside, and which side of it
  const tram = t.tram === 'yes' && t.bus !== 'yes';
  const s = (tram && nearest(trams, x, z, 14)) || nearest(roads, x, z, 14);
  if (!s) { left.far++; continue; }
  if (nearRoute(s.x, s.z)) { left.route++; continue; }
  const side = (x - s.x) * -s.uz + (z - s.z) * s.ux >= 0 ? 1 : -1, off = s.w / 2 + 1.1;
  stops.push({
    x: r1(s.x - s.uz * off * side), z: r1(s.z + s.ux * off * side), y: r2(s.y),
    // the way the pole's sign faces: along the street, its back to the traffic on this side
    a: r2(Math.atan2(s.uz * side, s.ux * side)),
    name: (t.name ?? '').replace(/^Gent /, ''), kind: tram ? 'tram' : 'bus',
    shelter: t.shelter === 'yes' || (t.shelter !== 'no' && hash(n.id) < 0.4),
  });
}

// where the trams halt: the tram_stop points on their tracks
const halts = [];
for (const n of els) {
  if (n.type !== 'node' || n.tags?.railway !== 'tram_stop') continue;
  const [x, z] = game(n.lat, n.lon), s = nearest(trams, x, z, 3);
  if (s && inZone(x, z)) halts.push(r1(s.x), r1(s.z));
}

// ------------------------------------------------------------------ the bus lines

// a relation's ways strung into one line of [lat, lon] points, each way turned to follow on
function string(rel) {
  const ways = rel.members.filter(m => m.type === 'way' && m.geometry && !/platform/.test(m.role)).map(m => m.geometry.map(g => [g.lat, g.lon]));
  const same = (a, b) => Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7;
  const lines = [];
  let line = null;
  for (const w of ways) {
    if (line && same(line.at(-1), w[0])) line.push(...w.slice(1));
    else if (line && same(line.at(-1), w.at(-1))) line.push(...w.slice(0, -1).reverse());
    else if (line && line.length === ways[0].length && same(line[0], w[0])) { line.reverse(); line.push(...w.slice(1)); }
    else if (line && line.length === ways[0].length && same(line[0], w.at(-1))) { line.reverse(); line.push(...w.slice(0, -1).reverse()); }
    else lines.push((line = w.slice()));
  }
  return lines;
}

const lines = [], seen = new Set();
for (const rel of els) {
  if (rel.type !== 'relation' || rel.tags?.route !== 'bus') continue;
  const platforms = rel.members.filter(m => m.type === 'node' && /platform/.test(m.role)).map(m => game(m.lat, m.lon));
  for (const ll of string(rel)) {
    // the stretches inside the zone and off the race routes, a point every few metres at most
    let cur = [];
    const pieces = [cur];
    for (const [lat, lon] of ll) {
      const [x, z] = game(lat, lon), last = cur.at(-1);
      const ok = inZone(x, z) && !nearRoute(x, z);
      if (last && ok) {
        // check the stretch in between too
        const n = Math.ceil(Math.hypot(x - last[0], z - last[1]) / 4);
        let fine = true;
        for (let q = 1; q < n && fine; q++) fine = !nearRoute(last[0] + ((x - last[0]) * q) / n, last[1] + ((z - last[1]) * q) / n);
        if (!fine) pieces.push((cur = []));
      }
      if (ok) cur.push([x, z]);
      else if (cur.length) pieces.push((cur = []));
    }
    for (const pts of pieces) {
      const cum = [0];
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      if (pts.length < 2 || cum.at(-1) < 150) continue;
      const key = `${rel.tags.ref}:${pts[0].map(Math.round)}:${pts.at(-1).map(Math.round)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      // where along it the platforms are, and how far right of the middle the bus keeps (by the street's width)
      const at = [], widths = [];
      for (const [px, pz] of platforms) {
        let best = null;
        for (let k = 0; k + 1 < pts.length; k++) {
          const [ax, az] = pts[k], [bx, bz] = pts[k + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1e-9;
          const f = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2)), d = Math.hypot(px - ax - dx * f, pz - az - dz * f);
          if (d < 16 && (!best || d < best[0])) best = [d, cum[k] + f * (cum[k + 1] - cum[k])];
        }
        if (best && best[1] > 25 && best[1] < cum.at(-1) - 25) at.push(r1(best[1]));
      }
      const ys = pts.map(([x, z]) => nearest(roads, x, z, 3));
      for (const s of ys) if (s) widths.push(s.w);
      widths.sort((a, b) => a - b);
      const w = widths[widths.length >> 1] ?? 7;
      const line = { ref: rel.tags.ref ?? '', p: pts.flat().map(r1), stops: [...new Set(at)].sort((a, b) => a - b), lane: r1(Math.max(1.2, Math.min(2.2, w / 4))) };
      if (ys.some(s => s?.y > 0.05)) line.y = ys.map(s => r2(s?.y ?? 0));
      lines.push(line);
    }
  }
}

console.log(`${stops.length} stops (${stops.filter(s => s.kind === 'tram').length} tram, ${stops.filter(s => s.shelter).length} with a shelter; left out ${left.route} on the race routes, ${left.far} off the streets), ${halts.length / 2} tram halts, ${lines.length} bus line stretches (${Math.round(lines.reduce((n, l) => { let s = 0; for (let k = 0; k + 3 < l.p.length; k += 2) s += Math.hypot(l.p[k + 2] - l.p[k], l.p[k + 3] - l.p[k + 1]); return n + s; }, 0) / 1000)} km) with ${lines.reduce((n, l) => n + l.stops.length, 0)} stops along them`);
fs.writeFileSync(path.join(DIR, 'transit.js'), `// ${city}: the bus and tram stops and the bus lines, made by \`node tools/transit.mjs ${city}\`, do not edit by hand.
// Map data © OpenStreetMap contributors, available under the Open Database License (ODbL).
// STOPS: { x, z, y (game metres, on the kerb), a (the way the sign faces, radians, atan2(z, x)), name, kind: 'bus' | 'tram', shelter }
// TRAM_HALTS: flat [x, z, ...] on the tram tracks, where the trams halt.
// BUS_LINES: { ref, p: flat [x, z, ...] along the middle of the street, y?: heights, stops: metres along p, lane: metres right of the middle }
export const STOPS = ${JSON.stringify(stops)};
export const TRAM_HALTS = ${JSON.stringify(halts)};
export const BUS_LINES = ${JSON.stringify(lines)};
`);
