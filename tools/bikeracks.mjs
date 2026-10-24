#!/usr/bin/env node
// Where the bike racks stand: <city>/bikeracks.json says how many go on which street,
// this finds the spots (or takes a block of them laid out by hand, `grid`) (beside the street, outside every building, off the race routes, apart from
// each other) and writes <city>/bikeracks.js.
//
//     node tools/bikeracks.mjs ghent
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
if (!city || !fs.existsSync(path.join(DIR, 'bikeracks.json'))) { console.error('usage: node tools/bikeracks.mjs <city>'); process.exit(1); }
const src = fs.readFileSync(path.join(DIR, 'map.js'), 'utf8');
const MAP = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const conf = JSON.parse(fs.readFileSync(path.join(DIR, 'bikeracks.json'), 'utf8'));

const inside = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
// a rack is 3.6 m across and up to 6 m long: its corners and middle must clear every building
// (`clear` in bikeracks.json, metres, for a narrow street)
const bbox = p => { const xs = p.filter((_, k) => k % 2 === 0), zs = p.filter((_, k) => k % 2); return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)]; };
const boxes = MAP.buildings.map(b => ({ p: b.p, b: bbox(b.p) }));
const blocked = (x, z, r) => boxes.some(({ p, b }) => x > b[0] - r && x < b[2] + r && z > b[1] - r && z < b[3] + r && (inside(x, z, p) || p.some((_, k) => k % 2 === 0 && Math.hypot(p[k] - x, p[k + 1] - z) < r)));
const route = MAP.routes.flatMap(r => r.route);
const water = MAP.water ?? [];

const racks = [];
for (const { street, count, clear = 4.2, near, grid } of conf.racks) {
  // a block of them set out by hand: a rack at every x of grid.x on every z of grid.z, all turned alike
  if (grid) {
    for (const z of grid.z) for (const x of grid.x) racks.push({ street, x, z, turn: grid.turn });
    console.log(`${street}: ${grid.x.length * grid.z.length} in a block`);
    continue;
  }
  const idx = MAP.names.indexOf(street);
  if (idx < 0) { console.error(`no street ${street}`); continue; }
  const cands = [];
  for (const r of MAP.roads.filter(r => r.n === idx)) {
    let carry = 0;
    for (let k = 0; k + 3 < r.p.length; k += 2) {
      const [ax, az, bx, bz] = [r.p[k], r.p[k + 1], r.p[k + 2], r.p[k + 3]], L = Math.hypot(bx - ax, bz - az);
      if (L < 0.1) continue;
      const tx = (bx - ax) / L, tz = (bz - az) / L;
      for (let s = 10 - carry; s < L; s += 9) {
        for (const side of [1, -1]) {
          const off = r.w / 2 + Math.min(3.4, clear * 0.8 + 0.2), x = ax + tx * s - tz * off * side, z = az + tz * s + tx * off * side;
          cands.push({ x, z, turn: Math.atan2(-tz, tx) });
        }
      }
      carry = (L - (10 - carry)) % 9;
    }
  }
  const ok = cands.filter(c => (!near || Math.hypot(c.x - near[0], c.z - near[1]) < near[2]) && !blocked(c.x, c.z, clear)
    && ![-3, 0, 3].some(d => blocked(c.x + Math.cos(-c.turn) * d, c.z + Math.sin(-c.turn) * d, clear * 0.76))
    && !route.some(([x, z]) => Math.hypot(x - c.x, z - c.z) < 7)
    && !racks.some(o => Math.hypot(o.x - c.x, o.z - c.z) < 9));
  // spread them along the street: take every k-th candidate
  const step = Math.max(1, Math.floor(ok.length / count));
  const take = ok.filter((_, k) => k % step === 0).slice(0, count);
  for (const c of take) racks.push({ street, x: +c.x.toFixed(1), z: +c.z.toFixed(1), turn: +c.turn.toFixed(3) });
  console.log(`${street}: ${take.length} of ${count} (${ok.length} spots)`);
}
fs.writeFileSync(path.join(DIR, 'bikeracks.js'), `// ${city}: the bike racks, made from bikeracks.json by \`node tools/bikeracks.mjs ${city}\`, do not edit by hand.
// { street, x, z (game metres), turn (radians, as the statues') }
export const BIKE_RACKS = ${JSON.stringify(racks)};
`);
