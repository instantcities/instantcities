#!/usr/bin/env node
// The street furniture OpenStreetMap knows of: its bollards, post boxes, benches and litter bins
// inside the zone, from the cached download (tools/cache/<city>.json), written to
// <city>/furniture.js. The game fills in the rest itself (js/furniture.js).
//
//     node tools/furniture.mjs ghent
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
const cache = path.join(HERE, 'cache', `${city}.json`);
if (!city || !fs.existsSync(cache)) { console.error('usage: node tools/furniture.mjs <city> (needs tools/cache/<city>.json)'); process.exit(1); }
const { MAP, game } = mapCoords(DIR, city);
const { nodes } = JSON.parse(fs.readFileSync(cache, 'utf8'));

const inside = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
const KINDS = {
  bollards: t => t.barrier === 'bollard' && t.bollard !== 'removable' && t.bollard !== 'rising',
  postBoxes: t => t.amenity === 'post_box',
  benches: t => t.amenity === 'bench',
  bins: t => t.amenity === 'waste_basket',
};
const out = Object.fromEntries(Object.keys(KINDS).map(k => [k, []]));
for (const n of Object.values(nodes)) {
  if (!n.tags) continue;
  const kind = Object.keys(KINDS).find(k => KINDS[k](n.tags));
  if (!kind) continue;
  const [x, z] = game(n.lat, n.lon);
  if (inside(x, z, MAP.zone)) out[kind].push(+x.toFixed(1), +z.toFixed(1));
}
for (const k in out) console.log(`${k}: ${out[k].length / 2}`);
fs.writeFileSync(path.join(DIR, 'furniture.js'), `// ${city}: the street furniture OpenStreetMap has, made by \`node tools/furniture.mjs ${city}\`, do not edit by hand.
// Each kind is a flat [x, z, ...] in game metres.
export const FURNITURE = ${JSON.stringify(out)};
`);
