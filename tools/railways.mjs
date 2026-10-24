#!/usr/bin/env node
// The railway stations' tracks, platforms and platform roofs, from OpenStreetMap, for the stations
// modelled by hand (<city>/stations.js): every rail, platform and roof inside each station's box
// in <city>/railways.json, the rails cut off where they leave the box's yard (its `yard`, a ring
// of game metres: beyond it they cross the streets on bridges, which the flat map does not have).
// The platforms are cut off at the yard too, and the roofs kept are those over a platform.
// Written to <city>/railways.js; the download is kept in tools/cache/<city>-railways.json.
//
//     node tools/railways.mjs ghent
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
if (!city || !fs.existsSync(path.join(DIR, 'railways.json'))) {
  console.error('usage: node tools/railways.mjs <city>   (the city folder, with a railways.json)');
  process.exit(1);
}
const conf = JSON.parse(fs.readFileSync(path.join(DIR, 'railways.json'), 'utf8'));
const { game } = mapCoords(DIR, city);
const MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
const HEADERS = { 'User-Agent': 'instant-gent map tool' };

async function download() {
  const file = path.join(HERE, 'cache', `${city}-railways.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const boxes = conf.stations.map(s => s.bbox.join(','));
  const q = `[out:json][timeout:90];(${boxes.map(b => `way["railway"~"^(rail|platform)$"](${b});way["building"="roof"](${b});`).join('')});out tags geom;`;
  for (const url of MIRRORS) {
    try {
      const res = await fetch(url, { method: 'POST', headers: HEADERS, body: new URLSearchParams({ data: q }), signal: AbortSignal.timeout(150000) });
      if (!res.ok) { console.error(`${url}: ${res.status}`); continue; }
      const data = await res.json();
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(data));
      return data;
    } catch (e) { console.error(`${url}: ${e.message}`); }
  }
  throw new Error('no Overpass server answered');
}

const inside = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
const r1 = v => Math.round(v * 10) / 10;
const flatOf = geom => geom.flatMap(({ lat, lon }) => game(lat, lon).map(r1));

// A line cut into the pieces of it that lie inside the ring (a point is kept or not as a whole: the
// lines have their points every few metres in a station's yard).
function clip(p, ring) {
  const pieces = [];
  let cur = [];
  for (let k = 0; k < p.length; k += 2) {
    if (inside(p[k], p[k + 1], ring)) cur.push(p[k], p[k + 1]);
    else { if (cur.length >= 4) pieces.push(cur); cur = []; }
  }
  if (cur.length >= 4) pieces.push(cur);
  return pieces;
}

// A ring (flat [x, z, ...]) cut to the convex ring `by`, Sutherland-Hodgman.
function clipRing(p, by) {
  let pts = Array.from({ length: p.length / 2 }, (_, k) => [p[2 * k], p[2 * k + 1]]);
  const n = by.length / 2, area = Array.from({ length: n }, (_, k) => by[2 * k] * by[(2 * k + 3) % by.length] - by[(2 * k + 2) % by.length] * by[2 * k + 1]).reduce((a, b) => a + b);
  for (let e = 0; e < n && pts.length; e++) {
    const a = [by[2 * e], by[2 * e + 1]], b = [by[(2 * e + 2) % by.length], by[(2 * e + 3) % by.length]];
    const side = q => Math.sign(area) * ((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]));
    const next = [];
    pts.forEach((q, k) => {
      const r = pts[(k + 1) % pts.length], sq = side(q), sr = side(r);
      if (sq >= 0) next.push(q);
      if ((sq >= 0) !== (sr >= 0)) { const t = sq / (sq - sr); next.push([q[0] + (r[0] - q[0]) * t, q[1] + (r[1] - q[1]) * t]); }
    });
    pts = next;
  }
  return pts.length >= 3 ? pts.flatMap(q => q.map(r1)) : null;
}
const centre = p => [0, 1].map(o => (2 * p.reduce((s, v, k) => (k % 2 === o ? s + v : s), 0)) / p.length);

const { elements } = await download();
const out = {};
for (const st of conf.stations) {
  const [s, w, n, e] = st.bbox;
  const ways = elements.filter(el => el.geometry.some(g => g.lat >= s && g.lat <= n && g.lon >= w && g.lon <= e));
  const rails = ways.filter(el => el.tags.railway === 'rail' && el.tags.tunnel !== 'yes').flatMap(el => clip(flatOf(el.geometry), st.yard));
  const platforms = ways.filter(el => el.tags.railway === 'platform' && el.tags.area === 'yes')
    .map(el => ({ p: clipRing(flatOf(el.geometry).slice(0, -2), st.yard), ref: el.tags.ref ?? '' }))
    .filter(pl => pl.p);
  const onPlatform = p => platforms.some(pl => inside(...centre(p), pl.p) || inside(...centre(pl.p), p));
  const roofs = ways.filter(el => el.tags.building === 'roof' && el.tags.amenity !== 'bicycle_parking')
    .map(el => ({ id: el.id, p: flatOf(el.geometry).slice(0, -2) })).filter(rf => inside(...centre(rf.p), st.yard) && onPlatform(rf.p));
  out[st.id] = { rails, platforms, roofs };
  console.error(`${st.id}: ${rails.length} rails, ${platforms.length} platforms, ${roofs.length} roofs`);
}
fs.writeFileSync(path.join(DIR, 'railways.js'), `// ${city}'s station tracks, platforms and platform roofs: made from railways.json by\n`
  + `// \`node tools/railways.mjs ${city}\`, do not edit by hand. Data © OpenStreetMap contributors, ODbL.\n`
  + `export const RAILWAYS = ${JSON.stringify(out)};\n`);
