#!/usr/bin/env node
// The hills under a city: how high the bare ground lies everywhere on the map, from the
// Digitaal Hoogtemodel Vlaanderen's 5 m terrain model (DHMV I DTM, the ground without houses or
// trees), smoothed into gentle slopes and written to <city>/terrain.js for the game. Only the hill
// its area.json names ("hill") is kept, the rest of the city lies flat.
//
//     node tools/terrain.mjs ghent
//
// The map is flat; the game lifts everything drawn by the height found here (see
// core/js/terrain.js), so in Ghent the streets climb from the Leie (8 m above sea level at the
// Korenmarkt) up the Blandijnberg to the Boekentoren (28 m). The canals and rivers are taken out
// first and filled in from their banks, so the water lies level with its quays (the game sinks it
// below them itself), and the squares lying lower than their streets are left to the hollows.
// Run it again after the map is rebuilt. Bron: Digitaal Vlaanderen, DHMV I, open data under the
// Modellicentie Gratis Hergebruik.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lambert72, readTiff } from './dhmv.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
if (!city || !fs.existsSync(path.join(DIR, 'area.json'))) {
  console.error('usage: node tools/terrain.mjs <city>   (a city\'s folder in Flanders, e.g. ghent)');
  process.exit(1);
}
const area = JSON.parse(fs.readFileSync(path.join(DIR, 'area.json'), 'utf8'));
const S = area.scale ?? 1.25;
const src = fs.readFileSync(path.join(DIR, 'map.js'), 'utf8');
const MAP = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));

const FINE = 4; // game metres between the samples worked on
const CELL = 16; // and between the heights written out
const SMOOTH = 28; // game metres: how far the bumps are smoothed out (the sigma of a gaussian)
const FADE = 100; // game metres: how far the hill's edge is blurred (the sigma of a gaussian)
const MARGIN = 400; // round the streets

// ------------------------------------------------------------------ the map's game coordinates

// as in tools/gent3d.mjs: the builder projects lat/lon round the middle of the bbox, scales by S
// and shifts it all so the first route is centred; the zone points put through that give the shift
const [bs, bw, bn, be] = area.bbox;
const lat0 = (bs + bn) / 2, lon0 = (bw + be) / 2;
const kx = 111320 * Math.cos((lat0 * Math.PI) / 180), kz = 110574;
const scaled = (lat, lon) => [(lon - lon0) * kx * S, -(lat - lat0) * kz * S];
const shift = (() => {
  const zp = area.zone_points.map(([la, lo]) => scaled(la, lo));
  for (const p of zp) {
    const o = [p[0] - MAP.zone[0], p[1] - MAP.zone[1]];
    const hits = zp.filter(q => Array.from({ length: MAP.zone.length / 2 }, (_, i) => i)
      .some(i => Math.hypot(q[0] - o[0] - MAP.zone[2 * i], q[1] - o[1] - MAP.zone[2 * i + 1]) < 0.2)).length;
    if (hits >= Math.min(3, zp.length)) return o;
  }
  throw new Error('cannot place the map: its zone does not match the zone points of ' + city);
})();
const latLon = (gx, gz) => [lat0 - (gz + shift[1]) / S / kz, lon0 + (gx + shift[0]) / S / kx];

// ------------------------------------------------------------------ the terrain model

const corners = [[bs, bw], [bs, be], [bn, bw], [bn, be]].map(c => lambert72(...c));
const X0 = Math.floor(Math.min(...corners.map(c => c[0])) / 5) * 5 - 500, X1 = Math.ceil(Math.max(...corners.map(c => c[0])) / 5) * 5 + 500;
const Y0 = Math.floor(Math.min(...corners.map(c => c[1])) / 5) * 5 - 500, Y1 = Math.ceil(Math.max(...corners.map(c => c[1])) / 5) * 5 + 500;
const cacheFile = path.join(HERE, 'cache', `${city}-dtm5.bin`);
let dtm;
if (fs.existsSync(cacheFile)) dtm = readTiff(fs.readFileSync(cacheFile));
else {
  console.error('downloading the DHMV I terrain model (5 m)');
  const url = 'https://geo.api.vlaanderen.be/DHMV/wcs?service=WCS&version=2.0.1&request=GetCoverage&coverageId=DHMVI_DTM_5m'
    + `&format=image/tiff&subset=x(${X0},${X1})&subset=y(${Y0},${Y1})`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`DTM: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  dtm = readTiff(buf);
  fs.writeFileSync(cacheFile, buf);
}
if (dtm.w !== (X1 - X0) / 5 || dtm.h !== (Y1 - Y0) / 5) throw new Error(`DTM of ${dtm.w}x${dtm.h}, not ${(X1 - X0) / 5}x${(Y1 - Y0) / 5}`);
// metres above sea level at Lambert 72 (x, y), between the 5 m samples; NaN where there is none
function above(x, y) {
  const c = (x - X0) / 5 - 0.5, r = (Y1 - y) / 5 - 0.5, c0 = Math.floor(c), r0 = Math.floor(r), fc = c - c0, fr = r - r0;
  const at = (i, j) => (i < 0 || j < 0 || i >= dtm.w || j >= dtm.h ? NaN : dtm.data[j * dtm.w + i]);
  const v = (1 - fr) * ((1 - fc) * at(c0, r0) + fc * at(c0 + 1, r0)) + fr * ((1 - fc) * at(c0, r0 + 1) + fc * at(c0 + 1, r0 + 1));
  return v < -100 ? NaN : v;
}

// ------------------------------------------------------------------ sampled on the map

let gx0 = Infinity, gz0 = Infinity, gx1 = -Infinity, gz1 = -Infinity;
for (const rd of MAP.roads) {
  for (let k = 0; k < rd.p.length; k += 2) {
    gx0 = Math.min(gx0, rd.p[k]); gx1 = Math.max(gx1, rd.p[k]);
    gz0 = Math.min(gz0, rd.p[k + 1]); gz1 = Math.max(gz1, rd.p[k + 1]);
  }
}
gx0 = Math.floor((gx0 - MARGIN) / CELL) * CELL; gz0 = Math.floor((gz0 - MARGIN) / CELL) * CELL;
const nx = Math.ceil((gx1 + MARGIN - gx0) / CELL), nz = Math.ceil((gz1 + MARGIN - gz0) / CELL);
const W = (nx * CELL) / FINE + 1, H = (nz * CELL) / FINE + 1;
const h = new Float32Array(W * H);
for (let j = 0; j < H; j++) {
  for (let i = 0; i < W; i++) {
    const [la, lo] = latLon(gx0 + i * FINE, gz0 + j * FINE);
    h[j * W + i] = above(...lambert72(la, lo)) * S; // game metres, as the houses are
  }
}
console.error(`${W} x ${H} samples of ${FINE} m`);

// the water out: the rivers' and canals' areas, and the narrow ones drawn as lines
function polygon(p, set) {
  const zs = [];
  for (let k = 1; k < p.length; k += 2) zs.push(p[k]);
  const j0 = Math.max(0, Math.ceil((Math.min(...zs) - gz0) / FINE)), j1 = Math.min(H - 1, Math.floor((Math.max(...zs) - gz0) / FINE));
  const n = p.length / 2;
  for (let j = j0; j <= j1; j++) {
    const z = gz0 + j * FINE, xs = [];
    for (let a = 0, b = n - 1; a < n; b = a++) {
      const za = p[2 * a + 1], zb = p[2 * b + 1];
      if ((za > z) !== (zb > z)) xs.push(p[2 * a] + ((z - za) * (p[2 * b] - p[2 * a])) / (zb - za));
    }
    xs.sort((u, v) => u - v);
    for (let q = 0; q + 1 < xs.length; q += 2) {
      for (let i = Math.max(0, Math.ceil((xs[q] - gx0) / FINE)); i <= Math.min(W - 1, Math.floor((xs[q + 1] - gx0) / FINE)); i++) set(i, j);
    }
  }
}
function line(p, half, set) {
  for (let k = 0; k + 3 < p.length; k += 2) {
    const ax = p[k], az = p[k + 1], bx = p[k + 2], bz = p[k + 3], dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
    for (let j = Math.max(0, Math.floor((Math.min(az, bz) - half - gz0) / FINE)); j <= Math.min(H - 1, Math.ceil((Math.max(az, bz) + half - gz0) / FINE)); j++) {
      for (let i = Math.max(0, Math.floor((Math.min(ax, bx) - half - gx0) / FINE)); i <= Math.min(W - 1, Math.ceil((Math.max(ax, bx) + half - gx0) / FINE)); i++) {
        const x = gx0 + i * FINE, z = gz0 + j * FINE, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
        if (Math.hypot(x - ax - t * dx, z - az - t * dz) <= half) set(i, j);
      }
    }
  }
}
const wet = (i, j) => { h[j * W + i] = NaN; };
for (const a of MAP.areas) if (a.k === 'water') polygon(a.p, wet);
for (const wl of MAP.water) line(wl.p, wl.w / 2 + 2, wet);

// the holes filled in from round them: each unknown sample gets the mean of the known ones round
// it, from ever coarser levels (pull-push)
function fill(v, w, hgt) {
  if (!v.some(Number.isNaN)) return v;
  const cw = Math.ceil(w / 2), ch = Math.ceil(hgt / 2), coarse = new Float32Array(cw * ch);
  for (let j = 0; j < ch; j++) {
    for (let i = 0; i < cw; i++) {
      let s = 0, n = 0;
      for (const [di, dj] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const a = 2 * i + di, b = 2 * j + dj;
        if (a < w && b < hgt && !Number.isNaN(v[b * w + a])) { s += v[b * w + a]; n++; }
      }
      coarse[j * cw + i] = n ? s / n : NaN;
    }
  }
  const up = w * hgt === 1 ? coarse : fill(coarse, cw, ch);
  return v.map((x, k) => (Number.isNaN(x) ? up[Math.floor(Math.floor(k / w) / 2) * cw + Math.floor((k % w) / 2)] : x));
}
const filled = fill(h, W, H);
if (filled.some(Number.isNaN)) throw new Error('no ground heights at all');

// the dips (sunken squares, ditches, cuttings) lifted to their rims: the highest within 8 m
function dilate(v, r) {
  const out = new Float32Array(v.length), tmp = new Float32Array(v.length);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    let m = -Infinity;
    for (let d = -r; d <= r; d++) if (i + d >= 0 && i + d < W) m = Math.max(m, v[j * W + i + d]);
    tmp[j * W + i] = m;
  }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    let m = -Infinity;
    for (let d = -r; d <= r; d++) if (j + d >= 0 && j + d < H) m = Math.max(m, tmp[(j + d) * W + i]);
    out[j * W + i] = m;
  }
  return out;
}
function blur(v, sigma) {
  const r = Math.ceil(3 * sigma), wts = Array.from({ length: 2 * r + 1 }, (_, k) => Math.exp(-((k - r) ** 2) / (2 * sigma * sigma)));
  const pass = (src, dst, step, n, count, stride) => {
    for (let o = 0; o < count; o++) {
      for (let a = 0; a < n; a++) {
        let s = 0, ws = 0;
        for (let k = -r; k <= r; k++) {
          const b = Math.max(0, Math.min(n - 1, a + k));
          s += src[o * stride + b * step] * wts[k + r]; ws += wts[k + r];
        }
        dst[o * stride + a * step] = s / ws;
      }
    }
  };
  const tmp = new Float32Array(v.length), out = new Float32Array(v.length);
  pass(v, tmp, 1, W, H, W);
  pass(tmp, out, W, H, W, 1);
  return out;
}
const smooth = blur(dilate(filled, 2), SMOOTH / FINE);

// Everywhere else lies flat: little rises (quays, ramps, a square a step up) only made the city
// bumpy. Within the hill's outline what lies higher than its foot ("from", metres above sea level)
// stays, "up" times as high as it is, or the climb barely shows with the map stretched sideways;
// round the outline it fades away. Without a "hill" the city is flat.
const hill = area.hill;
const keep = new Float32Array(W * H);
if (hill) polygon(hill.around.flatMap(([la, lo]) => { const [x, z] = scaled(la, lo); return [x - shift[0], z - shift[1]]; }), (i, j) => { keep[j * W + i] = 1; });
const fade = blur(keep, FADE / FINE);
for (let k = 0; k < smooth.length; k++) smooth[k] = Math.max(0, smooth[k] - (hill?.from ?? 0) * S) * (hill?.up ?? 1) * fade[k];

// ------------------------------------------------------------------ written out

const step = CELL / FINE, out = [];
for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) out.push(smooth[j * step * W + i * step]);
const low = out.reduce((a, v) => Math.min(a, v), Infinity), high = out.reduce((a, v) => Math.max(a, v), -Infinity);
const mm = new Uint16Array(out.map(v => Math.round((v - low) * 1000)));
const b64 = Buffer.from(mm.buffer).toString('base64');
let steepest = 0;
for (let j = 0; j <= nz; j++) for (let i = 0; i < nx; i++) steepest = Math.max(steepest, Math.abs(mm[j * (nx + 1) + i + 1] - mm[j * (nx + 1) + i]) / 1000 / CELL);
console.error(`${nx} x ${nz} cells of ${CELL} m, ${(high - low).toFixed(1)} m from the lowest to the highest (game metres), steepest ${(steepest * 100).toFixed(1)}%`);
const head = `// ${city}: generated by tools/terrain.mjs, do not edit by hand.\n`
  + '// Heights: Digitaal Vlaanderen, Digitaal Hoogtemodel Vlaanderen I (DHMV I, DTM 5 m), open data.\n'
  + `// How high the ground lies, in game millimetres above the lowest point: ${nx + 1} by ${nz + 1} corners of\n`
  + `// ${CELL} m cells from (x0, z0), row by row, as little-endian uint16 in base64. See core/js/terrain.js.\n`;
fs.writeFileSync(path.join(DIR, 'terrain.js'), head
  + `export const TERRAIN = { x0: ${gx0}, z0: ${gz0}, cell: ${CELL}, nx: ${nx}, nz: ${nz},\n  mm: '${b64}' };\n`);
console.error(`wrote ${path.join(DIR, 'terrain.js')} (${Math.round(b64.length / 1024)} kB)`);
