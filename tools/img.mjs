// Pixels of a photo, for the tools that look at Mapillary's: macOS sips turns a JPEG into a plain
// BMP and back, so reading and writing one needs no package (elsewhere ImageMagick's convert does). An image is { w, h, data } with
// data r, g, b, r, g, b, ... row by row from the top.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const MAC = process.platform === 'darwin';
const tmp = () => path.join(os.tmpdir(), `img-${process.pid}-${Math.random().toString(36).slice(2)}.bmp`);

export function readImage(file) {
  const bmp = tmp();
  if (MAC) execFileSync('sips', ['-s', 'format', 'bmp', file, '--out', bmp], { stdio: 'ignore' });
  else execFileSync('convert', [file, '-type', 'TrueColor', `BMP3:${bmp}`], { stdio: 'ignore' });
  const b = fs.readFileSync(bmp);
  fs.rmSync(bmp);
  const off = b.readUInt32LE(10), w = b.readInt32LE(18), hh = b.readInt32LE(22), bpp = b.readUInt16LE(28) / 8;
  const h = Math.abs(hh), stride = Math.ceil((w * bpp) / 4) * 4, data = new Uint8Array(w * h * 3);
  for (let y = 0; y < h; y++) {
    const row = off + (hh < 0 ? y : h - 1 - y) * stride; // a positive height runs bottom-up
    for (let x = 0; x < w; x++) {
      const s = row + x * bpp, d = (y * w + x) * 3;
      data[d] = b[s + 2]; data[d + 1] = b[s + 1]; data[d + 2] = b[s]; // BGR
    }
  }
  return { w, h, data };
}

export function writeJpeg({ w, h, data }, file, quality = 60) {
  const stride = Math.ceil((w * 3) / 4) * 4, b = Buffer.alloc(54 + stride * h);
  b.write('BM', 0); b.writeUInt32LE(b.length, 2); b.writeUInt32LE(54, 10);
  b.writeUInt32LE(40, 14); b.writeInt32LE(w, 18); b.writeInt32LE(-h, 22); b.writeUInt16LE(1, 26); b.writeUInt16LE(24, 28);
  b.writeUInt32LE(stride * h, 34);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 3, d = 54 + y * stride + x * 3;
      b[d] = data[s + 2]; b[d + 1] = data[s + 1]; b[d + 2] = data[s];
    }
  }
  const bmp = tmp();
  fs.writeFileSync(bmp, b);
  if (MAC) execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality), bmp, '--out', file], { stdio: 'ignore' });
  else execFileSync('convert', [bmp, '-quality', String(quality), file], { stdio: 'ignore' });
  fs.rmSync(bmp);
}

// A flat view out of an equirectangular panorama (2:1, its middle column looking `centre` compass
// degrees): `w` by `h` pixels, looking `heading` compass degrees, level, `fov` degrees across.
export function panoView(pano, centre, heading, { w = 512, h = 512, fov = 90 } = {}) {
  const F = w / 2 / Math.tan((fov * Math.PI) / 360), out = new Uint8Array(w * h * 3);
  const turn = ((heading - centre) * Math.PI) / 180;
  for (let v = 0; v < h; v++) {
    for (let u = 0; u < w; u++) {
      const x = (u + 0.5 - w / 2) / F, y = (h / 2 - v - 0.5) / F;
      const yaw = turn + Math.atan(x), pitch = Math.atan2(y, Math.hypot(x, 1));
      const px = ((((yaw / (2 * Math.PI) + 0.5) % 1) + 1) % 1) * pano.w, py = (0.5 - pitch / Math.PI) * pano.h;
      const s = (Math.min(pano.h - 1, Math.floor(py)) * pano.w + Math.min(pano.w - 1, Math.floor(px))) * 3, d = (v * w + u) * 3;
      out[d] = pano.data[s]; out[d + 1] = pano.data[s + 1]; out[d + 2] = pano.data[s + 2];
    }
  }
  return { w, h, data: out };
}
