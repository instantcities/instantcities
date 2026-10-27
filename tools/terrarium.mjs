// How high the ground lies anywhere on Earth, from the Terrarium elevation tiles (Mapzen's, on AWS
// open data: s3://elevation-tiles-prod, made from SRTM, the EU-DEM, national models and others):
// PNG tiles of 256 by 256 whose red, green and blue spell the height, metres = R * 256 + G + B / 256
// - 32768. For a city outside Flanders, where tools/dhmv.mjs has nothing. At zoom 15 a pixel is
// about 3.6 m at Pompeii's latitude, though the model underneath is coarser (some 30 m in Italy):
// streets and walls are not in it, the lie of the land is. Tiles are cached in
// tools/cache/terrarium/<z>-<x>-<y>.png.
// Bron: Mapzen terrain tiles (https://github.com/tilezen/joerd/blob/master/docs/attribution.md).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const CACHE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'cache', 'terrarium');
const URL = (z, x, y) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;

// a PNG of 8-bit RGB or RGBA, not interlaced (what the tiles are), as { w, h, px (RGB per pixel) }
function readPng(buf) {
  let o = 8, w = 0, h = 0, type = 0;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o), kind = buf.toString('ascii', o + 4, o + 8), data = buf.subarray(o + 8, o + 8 + len);
    if (kind === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); type = data[9]; if (data[8] !== 8 || data[12]) throw new Error('png: only 8-bit, not interlaced'); }
    else if (kind === 'IDAT') idat.push(data);
    o += 12 + len;
  }
  const bpp = type === 6 ? 4 : type === 2 ? 3 : 0;
  if (!bpp) throw new Error(`png: colour type ${type}`);
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, px = new Uint8Array(w * h * 3), prev = new Uint8Array(stride), row = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? row[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      row[i] = (line[i] + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f]) & 255;
    }
    for (let x = 0; x < w; x++) for (let k = 0; k < 3; k++) px[(y * w + x) * 3 + k] = row[x * bpp + k];
    prev.set(row);
  }
  return { w, h, px };
}

// the tiles over [south, west, north, east] at zoom z, and a function from (lat, lon) to metres above
// sea level, bilinear between the pixels
export async function terrarium([s, w, n, e], z = 15) {
  const N = 2 ** z;
  const tx = lon => ((lon + 180) / 360) * N;
  const ty = lat => ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * N;
  const x0 = Math.floor(tx(w)) - 1, x1 = Math.floor(tx(e)) + 1, y0 = Math.floor(ty(n)) - 1, y1 = Math.floor(ty(s)) + 1;
  fs.mkdirSync(CACHE, { recursive: true });
  const tiles = new Map();
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const file = path.join(CACHE, `${z}-${x}-${y}.png`);
    if (!fs.existsSync(file)) {
      const res = await fetch(URL(z, x, y));
      if (!res.ok) throw new Error(`terrarium ${z}/${x}/${y}: ${res.status}`);
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    }
    tiles.set(`${x},${y}`, readPng(fs.readFileSync(file)));
  }
  console.error(`${tiles.size} terrarium tiles at zoom ${z}`);
  const at = (X, Y) => { // the height of pixel (X, Y) of the whole zoom level
    const t = tiles.get(`${Math.floor(X / 256)},${Math.floor(Y / 256)}`);
    if (!t) return NaN;
    const k = ((Y % 256) * 256 + (X % 256)) * 3;
    return t.px[k] * 256 + t.px[k + 1] + t.px[k + 2] / 256 - 32768;
  };
  return (lat, lon) => {
    const X = tx(lon) * 256 - 0.5, Y = ty(lat) * 256 - 0.5, i = Math.floor(X), j = Math.floor(Y), fx = X - i, fy = Y - j;
    return (1 - fy) * ((1 - fx) * at(i, j) + fx * at(i + 1, j)) + fy * ((1 - fx) * at(i, j + 1) + fx * at(i + 1, j + 1));
  };
}
