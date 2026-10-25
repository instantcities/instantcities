#!/usr/bin/env node
// A map of how far the Facadinator has got: every building of <city>/map.js from above, the house
// fronts coloured from photos (<city>/looks.js) in their wall colour, the ones drawn by hand
// (fronts.js, streets.js) in gold, the fronts still to do in grey, on a dark ground with the
// roads and the water. Writes tools/cache/donemap-<city>.jpg (or --out).
//
//     node tools/donemap.mjs ghent                                   the whole map, 0.6 px a metre
//     node tools/donemap.mjs ghent --around -1700,600 --size 1500     a square 1500 m wide, 2 px a metre
//     node tools/donemap.mjs ghent --scale 1 --out /tmp/map.jpg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeJpeg } from './img.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), city = args[0];
const opt = name => { const i = args.indexOf(`--${name}`); return i > 0 ? args[i + 1] : undefined; };
if (!city || !fs.existsSync(path.join(HERE, '..', city, 'map.js'))) {
  console.error('usage: node tools/donemap.mjs <city> [--around x,z --size m] [--scale px-a-metre] [--out file.jpg]');
  process.exit(1);
}
const { MAP } = await import(pathToFileURL(path.join(HERE, '..', city, 'map.js')));
const looksFile = path.join(HERE, '..', city, 'looks.js');
const LOOKS = fs.existsSync(looksFile) ? Object.assign({}, ...Object.values((await import(pathToFileURL(looksFile))).LOOKS)) : {};

// as core/js/scenery.js keys a building in LOOKS, and tools/looks.mjs finds the fronts drawn by hand
const centre = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
const key = ([x, z]) => `${+x.toFixed(1)},${+z.toFixed(1)}`;
const drawn = ['fronts.js', 'streets.js'].flatMap(name => {
  const file = path.join(HERE, '..', city, name);
  return fs.existsSync(file) ? [...fs.readFileSync(file, 'utf8').matchAll(/\bat: \[(-?[\d.]+), (-?[\d.]+)\]/g)].map(m => [+m[1], +m[2]]) : [];
});
const byHand = c => drawn.some(([x, z]) => Math.hypot(x - c[0], z - c[1]) < 3);

// the part of the map to draw: a square around a point, or else every building with a house front
let x0, z0, x1, z1, scale;
if (opt('around')) {
  const [cx, cz] = opt('around').split(',').map(Number), half = +(opt('size') ?? 1500) / 2;
  [x0, z0, x1, z1] = [cx - half, cz - half, cx + half, cz + half];
  scale = +(opt('scale') ?? 2);
} else {
  [x0, z0, x1, z1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const b of MAP.buildings) {
    if (b.fe == null) continue;
    for (let k = 0; k < b.p.length; k += 2) {
      x0 = Math.min(x0, b.p[k]); x1 = Math.max(x1, b.p[k]); z0 = Math.min(z0, b.p[k + 1]); z1 = Math.max(z1, b.p[k + 1]);
    }
  }
  [x0, z0, x1, z1] = [x0 - 50, z0 - 50, x1 + 50, z1 + 50];
  scale = +(opt('scale') ?? 0.6);
}
const w = Math.round((x1 - x0) * scale), h = Math.round((z1 - z0) * scale);
const data = new Uint8Array(w * h * 3);
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const GROUND = rgb('#15181d'), ROAD = rgb('#23272e'), WATER = rgb('#1a3550'), OTHER = rgb('#1f2329'),
  TODO = rgb('#3a4049'), HAND = rgb('#f2c14e');
for (let i = 0; i < w * h; i++) data.set(GROUND, i * 3);

// fill a polygon (flat [x, z, x, z, ...] in metres), even-odd, one scanline at a time
function fill(p, c) {
  const n = p.length / 2, ys = [];
  for (let k = 0; k < n; k++) ys.push((p[2 * k + 1] - z0) * scale);
  const top = Math.max(0, Math.floor(Math.min(...ys))), bottom = Math.min(h - 1, Math.ceil(Math.max(...ys)));
  for (let y = top; y <= bottom; y++) {
    const yc = y + 0.5, xs = [];
    for (let k = 0, j = n - 1; k < n; j = k++) {
      const ya = ys[k], yb = ys[j];
      if ((ya > yc) === (yb > yc)) continue;
      const xa = (p[2 * k] - x0) * scale, xb = (p[2 * j] - x0) * scale;
      xs.push(xa + ((yc - ya) / (yb - ya)) * (xb - xa));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = Math.max(0, Math.round(xs[k])); x < Math.min(w, Math.round(xs[k + 1])); x++) data.set(c, (y * w + x) * 3);
    }
  }
}
// a line of width wd metres along a flat [x, z, ...] path, as one quad a segment
function line(p, wd, c) {
  for (let k = 0; k + 3 < p.length; k += 2) {
    const [ax, az, bx, bz] = [p[k], p[k + 1], p[k + 2], p[k + 3]], len = Math.hypot(bx - ax, bz - az) || 1;
    const nx = (-(bz - az) / len) * wd / 2, nz = ((bx - ax) / len) * wd / 2;
    fill([ax + nx, az + nz, bx + nx, bz + nz, bx - nx, bz - nz, ax - nx, az - nz], c);
  }
}
const inView = p => { for (let k = 0; k < p.length; k += 2) if (p[k] > x0 && p[k] < x1 && p[k + 1] > z0 && p[k + 1] < z1) return true; return false; };

for (const a of MAP.areas) if (a.k === 'water' && inView(a.p)) fill(a.p, WATER);
for (const r of MAP.water) if (inView(r.p)) line(r.p, r.w ?? 10, WATER);
for (const r of MAP.roads) if (inView(r.p)) line(r.p, Math.max(r.w ?? 4, 2 / scale), ROAD);
const count = { photo: 0, hand: 0, todo: 0 };
for (const b of MAP.buildings) {
  if (!inView(b.p)) continue;
  const c = centre(b.p), look = LOOKS[key(c)];
  if (look) { fill(b.p, rgb(look.c)); count.photo++; }
  else if (b.fe != null && byHand(c)) { fill(b.p, HAND); count.hand++; }
  else if (b.fe != null) { fill(b.p, TODO); count.todo++; }
  else fill(b.p, OTHER);
}

const out = opt('out') ?? path.join(HERE, 'cache', `donemap-${city}.jpg`);
fs.mkdirSync(path.dirname(out), { recursive: true });
writeJpeg({ w, h, data }, out, 85);
console.log(`${w}x${h} px: ${count.photo} fronts coloured from photos, ${count.hand} drawn by hand, ${count.todo} to do -> ${path.relative(process.cwd(), out)}`);
