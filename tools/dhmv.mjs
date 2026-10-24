// The real height of every roof in Flanders, from the Digitaal Hoogtemodel Vlaanderen II (DHMV II):
// a 1 m grid of the surface (roofs, trees: the DSM) and of the bare ground (the DTM), from the
// flights of 2013-2015. Their difference is how high whatever stands there rises above the street.
// Downloaded from Digitaal Vlaanderen's open WCS in tiles, cached in tools/cache/<id>-dhmv.bin.
// Bron: Digitaal Vlaanderen, DHMV II, open data under the Modellicentie Gratis Hergebruik.
import fs from 'node:fs';

const WCS = 'https://geo.api.vlaanderen.be/DHMV/wcs';
const TILE = 1000; // metres per tile, 4 MB of float32 per layer

// ------------------------------------------------------------------ WGS84 -> Belgian Lambert 72

// WGS84 latitude/longitude to EPSG:31370 x/y in metres: to the BD72 datum (Hayford 1924) with the
// inverse of the 7-parameter shift EPSG:15929, then the Lambert conformal conic of Belgium.
export function lambert72(lat, lon) {
  const rad = Math.PI / 180;
  // WGS84 geodetic -> geocentric
  let a = 6378137, f = 1 / 298.257223563, e2 = f * (2 - f);
  let ph = lat * rad, la = lon * rad, N = a / Math.sqrt(1 - e2 * Math.sin(ph) ** 2);
  const X = N * Math.cos(ph) * Math.cos(la), Y = N * Math.cos(ph) * Math.sin(la), Z = N * (1 - e2) * Math.sin(ph);
  // WGS84 -> BD72: EPSG:15929 (BD72 -> WGS84, coordinate frame rotation) run backwards
  const tx = -106.8686, ty = 52.2978, tz = -103.7239, sec = rad / 3600;
  const rx = -0.3366 * sec, ry = 0.457 * sec, rz = -1.8422 * sec, s = 1 - 1.2747e-6;
  const x0 = X - tx, y0 = Y - ty, z0 = Z - tz;
  const Xb = s * (x0 - rz * y0 + ry * z0), Yb = s * (rz * x0 + y0 - rx * z0), Zb = s * (-ry * x0 + rx * y0 + z0);
  // geocentric -> Hayford 1924 geodetic
  a = 6378388; f = 1 / 297; e2 = f * (2 - f);
  const p = Math.hypot(Xb, Yb);
  la = Math.atan2(Yb, Xb);
  ph = Math.atan2(Zb, p * (1 - e2));
  for (let i = 0; i < 6; i++) {
    N = a / Math.sqrt(1 - e2 * Math.sin(ph) ** 2);
    ph = Math.atan2(Zb + e2 * N * Math.sin(ph), p);
  }
  // Lambert conformal conic, two standard parallels (EPSG:31370)
  const e = Math.sqrt(e2), ph1 = 49.8333339 * rad, ph2 = 51.1666672333 * rad, ph0 = 90 * rad, la0 = 4.367486666666666 * rad;
  const m = q => Math.cos(q) / Math.sqrt(1 - e2 * Math.sin(q) ** 2);
  const t = q => Math.tan(Math.PI / 4 - q / 2) / ((1 - e * Math.sin(q)) / (1 + e * Math.sin(q))) ** (e / 2);
  const n = (Math.log(m(ph1)) - Math.log(m(ph2))) / (Math.log(t(ph1)) - Math.log(t(ph2)));
  const F = m(ph1) / (n * t(ph1) ** n), r0 = a * F * t(ph0) ** n, r = a * F * t(ph) ** n, th = n * (la - la0);
  return [150000.013 + r * Math.sin(th), 5400088.438 + r0 - r * Math.cos(th)];
}

// ------------------------------------------------------------------ download

// One layer of one tile: the WCS answers with a multipart message, the second part an uncompressed
// float32 GeoTIFF, rows from north to south.
async function fetchTile(layer, x0, y0) {
  const url = `${WCS}?service=WCS&version=2.0.1&request=GetCoverage&coverageId=${layer}&format=image/tiff`
    + `&subset=x(${x0},${x0 + TILE})&subset=y(${y0},${y0 + TILE})`;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return readTiff(Buffer.from(await res.arrayBuffer()));
    } catch (err) {
      if (attempt >= 4) throw err;
      await new Promise(ok => setTimeout(ok, 3000 * attempt));
    }
  }
}

// Just enough TIFF for what this WCS sends: little-endian, one band of float32 in strips.
export function readTiff(buf) {
  const at = buf.indexOf('II*\0', 0, 'latin1');
  if (at < 0) throw new Error('no TIFF in the answer: ' + buf.subarray(0, 300).toString());
  const b = buf.subarray(at);
  const tags = {};
  const ifd = b.readUInt32LE(4), count = b.readUInt16LE(ifd);
  for (let i = 0; i < count; i++) {
    const o = ifd + 2 + i * 12, tag = b.readUInt16LE(o), type = b.readUInt16LE(o + 2), n = b.readUInt32LE(o + 4);
    const size = { 3: 2, 4: 4 }[type];
    if (!size) continue;
    const base = n * size <= 4 ? o + 8 : b.readUInt32LE(o + 8);
    tags[tag] = Array.from({ length: n }, (_, k) => (size === 2 ? b.readUInt16LE(base + 2 * k) : b.readUInt32LE(base + 4 * k)));
  }
  const w = tags[256][0], h = tags[257][0];
  if (tags[259][0] !== 1 || tags[258][0] !== 32 || tags[339]?.[0] !== 3) throw new Error('unexpected TIFF: compressed, or not float32');
  const out = new Float32Array(w * h);
  if (tags[324]) {
    // in square tiles, row by row; the ones on the right and bottom edges padded
    const tw = tags[322][0], th = tags[323][0], across = Math.ceil(w / tw);
    tags[324].forEach((off, i) => {
      const x0 = (i % across) * tw, y0 = Math.floor(i / across) * th;
      for (let r = 0; r < th && y0 + r < h; r++) {
        for (let c = 0; c < tw && x0 + c < w; c++) out[(y0 + r) * w + x0 + c] = b.readFloatLE(off + 4 * (r * tw + c));
      }
    });
  } else {
    let k = 0;
    tags[273].forEach((off, i) => {
      const len = tags[279][i] / 4;
      for (let j = 0; j < len; j++) out[k++] = b.readFloatLE(off + 4 * j);
    });
  }
  return { w, h, data: out };
}

// The height above the ground everywhere in the bounding box [s, w, n, e], from the cache or the
// WCS: heightAt(lat, lon) in metres, or NaN where there is no data.
export async function surface(bbox, cacheFile, progress = () => {}) {
  const [s, w, n, e] = bbox;
  const corners = [[s, w], [s, e], [n, w], [n, e]].map(([la, lo]) => lambert72(la, lo));
  const X0 = Math.floor(Math.min(...corners.map(c => c[0])) / TILE) * TILE, Y0 = Math.floor(Math.min(...corners.map(c => c[1])) / TILE) * TILE;
  const nx = Math.ceil((Math.max(...corners.map(c => c[0])) - X0) / TILE), ny = Math.ceil((Math.max(...corners.map(c => c[1])) - Y0) / TILE);
  const W = nx * TILE, H = ny * TILE;
  let grid;
  if (fs.existsSync(cacheFile)) {
    const raw = fs.readFileSync(cacheFile);
    grid = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
    if (grid.length !== W * H) grid = null;
  }
  if (!grid) {
    grid = new Float32Array(W * H);
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        progress(j * nx + i + 1, nx * ny);
        const x0 = X0 + i * TILE, y0 = Y0 + j * TILE;
        const [dsm, dtm] = await Promise.all([fetchTile('DHMVII_DSM_1m', x0, y0), fetchTile('DHMVII_DTM_1m', x0, y0)]);
        if (dsm.w !== TILE || dsm.h !== TILE || dtm.w !== TILE || dtm.h !== TILE) throw new Error(`tile of ${dsm.w}x${dsm.h}`);
        // row 0 of the grid is the north edge, like the tiles
        const top = (ny - 1 - j) * TILE;
        for (let r = 0; r < TILE; r++) {
          for (let c = 0; c < TILE; c++) {
            const k = r * TILE + c, a = dsm.data[k], g = dtm.data[k];
            grid[(top + r) * W + i * TILE + c] = a < -1000 || g < -1000 ? NaN : a - g;
          }
        }
      }
    }
    fs.writeFileSync(cacheFile, Buffer.from(grid.buffer));
  }
  const Ytop = Y0 + H;
  return (lat, lon) => {
    const [x, y] = lambert72(lat, lon);
    const c = Math.floor(x - X0), r = Math.floor(Ytop - y);
    return c < 0 || r < 0 || c >= W || r >= H ? NaN : grid[r * W + c];
  };
}

// The height of the bare ground itself (the DTM, in metres above sea level) over a small box
// [x0, y0, x1, y1] of Lambert 72 metres, from the cache or the WCS: groundAt(x, y), NaN where
// there is no data. For the squares that lie lower than their streets.
export async function terrain([x0, y0, x1, y1], cacheFile) {
  [x0, y0, x1, y1] = [Math.floor(x0), Math.floor(y0), Math.ceil(x1), Math.ceil(y1)];
  const W = x1 - x0, H = y1 - y0;
  let grid;
  if (fs.existsSync(cacheFile)) {
    const raw = fs.readFileSync(cacheFile);
    grid = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
    if (grid.length !== W * H) grid = null;
  }
  if (!grid) {
    const url = `${WCS}?service=WCS&version=2.0.1&request=GetCoverage&coverageId=DHMVII_DTM_1m&format=image/tiff`
      + `&subset=x(${x0},${x1})&subset=y(${y0},${y1})`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`DTM: ${res.status} ${res.statusText}`);
    const t = readTiff(Buffer.from(await res.arrayBuffer()));
    if (t.w !== W || t.h !== H) throw new Error(`DTM tile of ${t.w}x${t.h}, not ${W}x${H}`);
    grid = t.data.map(v => (v < -1000 ? NaN : v));
    fs.writeFileSync(cacheFile, Buffer.from(grid.buffer));
  }
  // row 0 is the north edge
  return (x, y) => {
    const c = Math.floor(x - x0), r = Math.floor(y1 - y);
    return c < 0 || r < 0 || c >= W || r >= H ? NaN : grid[r * W + c];
  };
}
