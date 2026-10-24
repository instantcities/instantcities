#!/usr/bin/env node
// The shops, cafés and restaurants the game puts in its buildings (map.js's b.shop), each with what
// OpenStreetMap calls it (shop=* or amenity=*) and its address, for the places list on the developer
// page (places.html). The address is the shop's own, else the building's it stands in, from the
// cached download (tools/cache/<city>.json); written to <city>/places.json.
//
//     node tools/places.mjs ghent
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';
import { SHOP_KINDS } from './osmbuild.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
const cache = path.join(HERE, 'cache', `${city}.json`);
if (!city || !fs.existsSync(cache)) { console.error('usage: node tools/places.mjs <city> (needs tools/cache/<city>.json)'); process.exit(1); }
const { MAP, game } = mapCoords(DIR, city);
const { nodes, ways } = JSON.parse(fs.readFileSync(cache, 'utf8'));

const CELL = 20;
const grid = new Map();
const put = (x, z, v) => { const k = `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`; if (!grid.has(k)) grid.set(k, []); grid.get(k).push(v); };
const near = (x, z, r = 1) => {
  const out = [];
  for (let i = Math.floor(x / CELL) - r; i <= Math.floor(x / CELL) + r; i++) {
    for (let j = Math.floor(z / CELL) - r; j <= Math.floor(z / CELL) + r; j++) out.push(...(grid.get(`${i},${j}`) ?? []));
  }
  return out;
};
const inside = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
const address = t => (t['addr:street'] && t['addr:housenumber'] ? `${t['addr:street']} ${t['addr:housenumber']}` : null);

// the shop points, as osmbuild takes them, and the buildings with an address
for (const n of Object.values(nodes)) {
  const t = n.tags ?? {}, type = t.shop ?? t.amenity;
  if (!type || (!t.shop && !SHOP_KINDS[type])) continue;
  const [x, z] = game(n.lat, n.lon);
  put(x, z, { shop: true, x, z, name: t.name ?? '', type, addr: address(t) });
}
for (const w of ways) {
  const t = w.tags ?? {};
  if (!t.building || !address(t)) continue;
  const p = w.nodes.map(id => nodes[id]).filter(Boolean).flatMap(n => game(n.lat, n.lon));
  if (p.length < 6) continue;
  let x = 0, z = 0;
  for (let i = 0; i < p.length; i += 2) { x += p[i]; z += p[i + 1]; }
  put(x / (p.length / 2), z / (p.length / 2), { p, addr: address(t) });
}

const centre = p => { let x = 0, z = 0; for (let i = 0; i < p.length; i += 2) { x += p[i]; z += p[i + 1]; } return [x / (p.length / 2), z / (p.length / 2)]; };
const places = [];
let addressed = 0;
for (const b of MAP.buildings) {
  if (!b.shop) continue;
  const [kind, name] = b.shop, [cx, cz] = centre(b.p);
  // the shop point: the nearest one of that name
  const pt = near(cx, cz, 2).filter(v => v.shop && v.name === name).sort((a, c) => Math.hypot(a.x - cx, a.z - cz) - Math.hypot(c.x - cx, c.z - cz))[0];
  const [x, z] = pt ? [pt.x, pt.z] : [cx, cz];
  const addr = pt?.addr ?? near(x, z).find(v => v.p && inside(x, z, v.p))?.addr ?? null;
  if (addr) addressed++;
  const street = b.st != null ? MAP.names[b.st] : null;
  places.push([kind, name, pt?.type ?? kind, addr ?? (street ? `${street} (no number)` : ''), +x.toFixed(1), +z.toFixed(1)]);
}
places.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
console.log(`${places.length} places, ${addressed} with a full address`);
fs.writeFileSync(path.join(DIR, 'places.json'), `{"note":"${city}: made by node tools/places.mjs ${city}, do not edit by hand. Each place is [game kind, name, OpenStreetMap type, address, x, z].",\n"places":[\n${places.map(p => JSON.stringify(p)).join(',\n')}\n]}\n`);
