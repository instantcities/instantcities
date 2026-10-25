#!/usr/bin/env node
// The wall colour of every front along a street, read off its photos: after tools/street.mjs has
// found the fronts and fetched the photos (tools/streets/<city>/<street>/street.json), this samples
// the wall in each photo and writes it to <city>/looks.js, which the game reads to colour those
// houses (core/js/scenery.js snaps it to the nearest of the city's own wall colours).
//
//     node tools/looks.mjs ghent korenlei
//
// In each photo it takes the front's slice (street.json's span, the middle 60% of it), from just
// over the ground floor up to under the eaves, leaves out dark pixels (windows, shade), the sky
// (any colour, see skyline), leaves and blown-out white,
// and takes the commonest colour, lightened as far as the photo's whites are grey and made more
// colourful (a dull day greys both); a front seen in three photos or more takes their median, in two the one with the most wall. An entry of looks.js that says "hand": true is not sampled again (fixed by eye), and a type ("t": house, shop, block,
// stone) set by hand is kept. Also draws tools/cache/looks/<city>-<street>.jpg: each photo with the
// box it sampled and the colour it found, to check them by eye.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readImage, writeJpeg } from './img.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [city, street] = process.argv.slice(2);
const dir = path.join(HERE, 'streets', city ?? '', street ?? '');
if (!city || !street || !fs.existsSync(path.join(dir, 'street.json'))) {
  console.error('usage: node tools/looks.mjs <city> <street slug>   (after node tools/street.mjs <city> <street>)');
  process.exit(1);
}
const S = JSON.parse(fs.readFileSync(path.join(HERE, '..', city, 'area.json'), 'utf8')).scale ?? 1.25;
const { photos, fronts, slug } = JSON.parse(fs.readFileSync(path.join(dir, 'street.json'), 'utf8'));

const R = 6371000, rad = d => (d * Math.PI) / 180;
// metres east and north from a to b
const offset = ([la1, lo1], [la2, lo2]) => [rad(lo2 - lo1) * Math.cos(rad((la1 + la2) / 2)) * R, rad(la2 - la1) * R];
const CAM_H = 2; // metres: a car's roof, a walker's hand
const FLOOR = 3.4; // game metres a storey
const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

// the buildings drawn by hand (<city>/fronts.js, and the specs of <city>/streets.js): their middles,
// the way core/js/fronts.js finds them, to leave them out
const drawn = ['fronts.js', 'streets.js'].flatMap(name => {
  const file = path.join(HERE, '..', city, name);
  return fs.existsSync(file) ? [...fs.readFileSync(file, 'utf8').matchAll(/\bat: \[(-?[\d.]+), (-?[\d.]+)\]/g)].map(m => [+m[1], +m[2]]) : [];
});
const byHand = f => drawn.some(([x, z]) => Math.hypot(x - f.centre[0], z - f.centre[1]) < 3);

// the box of the photo the front's wall fills: [x0, x1, y0, y1] in pixels, or null
function box(f, p, img) {
  const s = f.photos.find(q => q.id === p.id).span, [lat, lon, compass, focal] = photos[p.id].cam;
  const [e, n] = offset([lat, lon], f.latLon), depth = e * Math.sin(rad(compass)) + n * Math.cos(rad(compass));
  if (depth < 2) return null;
  // real metres: at least two storeys, the height model often has eaves far too low
  const F = focal * img.w, top = Math.max(f.eaves ?? 0, (f.floors ?? 2) * FLOOR, 2 * FLOOR) / S;
  const h0 = 2.6, h1 = top * 0.9; // over the doors, under the eaves
  const y = h => Math.round(img.h / 2 - (F * (h - CAM_H)) / depth);
  const x0 = Math.round((s[0] + (s[1] - s[0]) * 0.2) * img.w), x1 = Math.round((s[1] - (s[1] - s[0]) * 0.2) * img.w);
  const b = [Math.max(0, x0), Math.min(img.w, x1), Math.max(0, y(h1)), Math.min(img.h, y(h0))];
  return b[1] - b[0] >= 6 && b[3] - b[2] >= 6 ? b : null;
}

// The sky, also a grey or white one (a dull day): per column, everything from the top of the photo
// down that is grey or blue, not too dark, and smooth (each pixel close to the one above it). A wall touching
// the top of the photo is left in as soon as a window, a joint or a cornice breaks the run.
function skyline(img) {
  if (img.sky) return img.sky;
  const at = (x, y) => { const i = (y * img.w + x) * 3; return [img.data[i], img.data[i + 1], img.data[i + 2]]; };
  const skyish = ([r, g, b]) => 0.3 * r + 0.59 * g + 0.11 * b >= 60 && (Math.max(r, g, b) - Math.min(r, g, b) < 30 || b > r + 10);
  const near = (c, d, t) => Math.abs(c[0] - d[0]) + Math.abs(c[1] - d[1]) + Math.abs(c[2] - d[2]) <= t;
  const sky = new Int32Array(img.w);
  for (let x = 0; x < img.w; x++) {
    // a panorama's cut-out can start with a dark strip at the top: the sky may start a little lower
    let y = 0, prev = null;
    while (y < img.h * 0.08 && !skyish(at(x, y))) y++;
    if (y >= img.h * 0.08) y = 0;
    while (y < img.h) {
      const c = at(x, y);
      if (skyish(c) && (!prev || near(c, prev, 24))) { prev = c; y++; continue; }
      // a wire or a twig across the sky: the sky goes on a few pixels further down
      let on = 0;
      if (prev) for (let d = 1; d <= 6 && y + d < img.h; d++) if (skyish(at(x, y + d)) && near(at(x, y + d), prev, 30)) { on = d; break; }
      if (!on) break;
      y += on;
    }
    sky[x] = y;
  }
  return (img.sky = sky);
}

// the commonest colour in the box, leaving out what is too dark to be wall and the sky: [rgb, share of the box]
function wallColour(img, [x0, x1, y0, y1]) {
  const bins = new Map(), px = [], sky = skyline(img);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (y < sky[x]) continue;
      const i = (y * img.w + x) * 3, r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
      const lum = 0.3 * r + 0.59 * g + 0.11 * b;
      if (lum < 40 || (lum > 150 && b > r + 25)) continue; // glass and shade, blue sky
      if (g > r + 6 && g >= b) continue; // leaves: a hedge, a tree in front (a green wall is rare)
      if (Math.min(r, g, b) > 245) continue; // blown out: a white sky, a sunlit window
      const k = (r >> 4) * 256 + (g >> 4) * 16 + (b >> 4);
      bins.set(k, (bins.get(k) ?? 0) + 1);
      px.push([r, g, b, k]);
    }
  }
  if (px.length < 30) return null;
  const near = (k, l) => Math.abs((k >> 8) - (l >> 8)) <= 1 && Math.abs(((k >> 4) & 15) - ((l >> 4) & 15)) <= 1 && Math.abs((k & 15) - (l & 15)) <= 1;
  let best = -1, most = -1;
  for (const k of bins.keys()) {
    let n = 0;
    for (const [l, c] of bins) if (near(k, l)) n += c;
    if (n > most) { most = n; best = k; }
  }
  const sum = [0, 0, 0];
  let n = 0;
  for (const [r, g, b, k] of px) if (near(k, best)) { sum[0] += r; sum[1] += g; sum[2] += b; n++; }
  return [sum.map(v => v / n), n / ((x1 - x0) * (y1 - y0))];
}

// A dull day makes white plaster grey: the brightest things under the horizon (window frames, white
// plaster) are taken as white, and the photo lightened to match, by at most 1.35 times (more, and
// every colour comes out pale: most of Mapillary's photos would take the most there is).
function gain(img) {
  const n = new Array(256).fill(0);
  let all = 0;
  for (let y = img.h >> 1; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    const i = (y * img.w + x) * 3;
    n[Math.round(0.3 * img.data[i] + 0.59 * img.data[i + 1] + 0.11 * img.data[i + 2])]++;
    all++;
  }
  let v = 255;
  for (let seen = 0; v > 0 && (seen += n[v]) < all * 0.01; v--);
  return Math.min(1.35, Math.max(1, 235 / Math.max(1, v)));
}

// and greys the colours: brick reads grey-brown (with the mortar between), a blue wall grey-blue.
// Each is taken half as far again from the grey it is as light as.
const vivid = c => { const m = (c[0] + c[1] + c[2]) / 3; return c.map(v => Math.max(0, m + (v - m) * 1.5)); };

const out = path.join(HERE, '..', city, 'looks.js');
const src = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
const all = src ? JSON.parse(src.slice(src.indexOf('{', src.indexOf('LOOKS')), src.lastIndexOf('}') + 1)) : {};
const before = all[slug] ?? {}, mine = {};
const tiles = []; // for the contact sheet: [photo, box, colour]
const cache = new Map(), image = id => { if (!cache.has(id)) cache.set(id, readImage(path.join(dir, photos[id].file))); return cache.get(id); };

for (const f of fronts) {
  const key = `${f.centre[0]},${f.centre[1]}`, old = before[key];
  if (old?.hand) { mine[key] = old; continue; }
  if (byHand(f)) { console.log(`  ${f.id}  drawn by hand`); continue; }
  const found = [];
  for (const p of f.photos) {
    const img = image(p.id), b = box(f, p, img), c = b && wallColour(img, b);
    tiles.push([img, b, c && c[1] > 0.15 ? c[0] : null, f.id]); // a colour left out (too little wall in the box) shows blank
    if (c && c[1] > 0.15) { const k = gain(img); found.push(Object.assign(vivid(c[0]).map(v => Math.min(255, v * k)), { share: c[1] })); }
  }
  if (!found.length) { console.log(`  ${f.id}  -`); continue; }
  // three or more: their median; else the one that saw the most wall (the other may be a lamp post, a car)
  const c = found.length >= 3 ? [0, 1, 2].map(k => found.map(v => v[k]).sort((a, b) => a - b)[found.length >> 1]) : found.sort((a, b) => b.share - a.share)[0];
  mine[key] = { id: f.id, c: hex(c), ...(old?.t ? { t: old.t } : {}) };
  console.log(`  ${f.id}  ${mine[key].c}  (${found.length} photo${found.length > 1 ? 's' : ''})`);
}
all[slug] = mine;

const body = Object.entries(all).sort(([a], [b]) => a.localeCompare(b)).map(([st, looks]) =>
  `  ${JSON.stringify(st)}: {\n${Object.entries(looks).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n').replace(/,$/, '')}\n  }`).join(',\n');
fs.writeFileSync(out, `// The wall colours of house fronts along streets, read off Mapillary photos by tools/looks.mjs
// (written by it: run it again for a street rather than editing by hand, except to fix one, then
// with "hand": true). By street; each front by the middle of its building's outline in map.js (the
// average of its corners, to 0.1 m): { id, c: wall colour, t?: house | shop | block | stone, hand? }.
// core/js/scenery.js snaps c to the nearest of the city's wall colours, so a house keeps the look of
// the rest of the city.
export const LOOKS = {
${body}
};
`);
console.log(`${Object.keys(mine).length} of ${fronts.length} fronts -> ${path.relative(process.cwd(), out)}`);

// the contact sheet: 6 across, 192 px a photo, the box in white and the colour found under it
const T = 192, cols = 6, rows = Math.ceil(tiles.length / cols), sheet = { w: cols * T, h: rows * (T + 24), data: new Uint8Array(cols * T * rows * (T + 24) * 3).fill(255) };
const put = (x, y, c) => { if (x < 0 || y < 0 || x >= sheet.w || y >= sheet.h) return; const i = (y * sheet.w + x) * 3; sheet.data[i] = c[0]; sheet.data[i + 1] = c[1]; sheet.data[i + 2] = c[2]; };
tiles.forEach(([img, b, c], n) => {
  const ox = (n % cols) * T, oy = Math.floor(n / cols) * (T + 24), k = Math.max(img.w, img.h) / T;
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const sx = Math.floor(x * k), sy = Math.floor(y * k);
    if (sx < img.w && sy < img.h) { const i = (sy * img.w + sx) * 3; put(ox + x, oy + y, [img.data[i], img.data[i + 1], img.data[i + 2]]); }
  }
  if (b) {
    const [x0, x1, y0, y1] = b.map(v => Math.round(v / k));
    for (let x = x0; x < x1; x++) for (const y of [y0, y1 - 1]) { put(ox + x, oy + y, [255, 255, 255]); put(ox + x, oy + y + 1, [0, 0, 0]); }
    for (let y = y0; y < y1; y++) for (const x of [x0, x1 - 1]) { put(ox + x, oy + y, [255, 255, 255]); put(ox + x + 1, oy + y, [0, 0, 0]); }
  }
  for (let y = T + 2; y < T + 22; y++) for (let x = 2; x < T - 2; x++) put(ox + x, oy + y, c ?? [255, 255, 255]);
});
if (tiles.length) {
  fs.mkdirSync(path.join(HERE, 'cache', 'looks'), { recursive: true });
  const sheetFile = path.join(HERE, 'cache', 'looks', `${city}-${slug}.jpg`);
  writeJpeg(sheet, sheetFile, 80);
  console.log(`-> ${path.relative(process.cwd(), sheetFile)}`);
}
