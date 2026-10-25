#!/usr/bin/env node
// The game seen from where a street's photos were taken, without and with <city>/looks.js, to set
// beside the photos: is a street's look any closer to the real one? For each photo id it writes
// tools/cache/lookshots/<id>-before.jpg and -after.jpg, square, from the photo's spot, heading and
// field of view. Needs serve.py running on :8321 and Playwright; one headless browser, closed after.
//
//     node tools/lookshots.mjs ghent cederstraat 1679674822584439-297 555420827522740-213
//
// THREE_DIR=<an unpacked three@0.170.0 npm package> serves three.js from there instead of the CDN
// (for a sandbox without it). BEFORE_MAP=<an older map.js> makes "before" the game on that map, with
// looks.js, to show a change to the map (heights) rather than to the colours. Parked cars between
// the camera and the kerb are left out (the near plane stops just short of the front), and with them
// the street in the foreground.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { mapCoords } from './mapcoords.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(HERE, '..');
const [city, slug, ...IDS] = process.argv.slice(2);
if (!city || !slug || !IDS.length) { console.error('usage: node tools/lookshots.mjs <city> <street slug> <photo id>...'); process.exit(1); }
const street = JSON.parse(fs.readFileSync(path.join(HERE, 'streets', city, slug, 'street.json'), 'utf8'));
const { game } = mapCoords(path.join(ROOT, city), city);
const OUT = path.join(HERE, 'cache', 'lookshots');
fs.mkdirSync(OUT, { recursive: true });
const shots = IDS.map(id => {
  const [lat, lon, compass, focal] = street.photos[id].cam;
  const [x, z] = game(lat, lon), a = compass * Math.PI / 180;
  // how far ahead the photo's front stands, game metres: the near plane goes just short of it, past
  // the parked cars between the camera and the kerb
  const f = street.fronts.find(f => f.photos?.some(p => p.id === id)), [fx, fz] = game(...f.latLon);
  const depth = (fx - x) * Math.sin(a) - (fz - z) * Math.cos(a);
  return { id, x, z, dx: Math.sin(a), dz: -Math.cos(a), fov: 2 * Math.atan(0.5 / focal) * 180 / Math.PI, near: Math.max(0.3, depth - 3.5) };
});
const THREE_DIR = process.env.THREE_DIR;
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  for (const variant of ['before', 'after']) {
    const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
    page.on('pageerror', e => console.log('pageerror', e.message.slice(0, 200)));
    if (THREE_DIR) await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', r => {
      const rel = new URL(r.request().url()).pathname.replace('/npm/three@0.170.0/', '');
      r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(`${THREE_DIR}/${rel}`) });
    });
    await page.route(/googletagmanager/, r => r.abort());
    if (variant === 'before' && process.env.BEFORE_MAP) await page.route(`**/${city}/map.js*`, r => r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(process.env.BEFORE_MAP) }));
    else if (variant === 'before') await page.route(`**/${city}/looks.js*`, r => r.fulfill({ contentType: 'text/javascript', body: 'export const LOOKS = {};' }));
    const s0 = shots[0];
    await page.goto(`http://localhost:8321/${city}/play/?pos=${(s0.x - 15 * s0.dx).toFixed(1)},${(s0.z - 15 * s0.dz).toFixed(1)}`);
    await page.waitForFunction(() => window.__pr?.world && window.__pr.game.state !== 'menu', null, { timeout: 240000, polling: 2000 });
    for (const s of shots) {
      await page.evaluate(([x, z]) => window.__pr.teleport({ x, z }), [s.x - 15 * s.dx, s.z - 15 * s.dz]);
      await page.waitForTimeout(12000); // the tiles round it get built
      const url = await page.evaluate(s => {
        const { renderer, scene } = window.ghent3d;
        const C = Object.getPrototypeOf(window.ghent3d.menuCam).constructor;
        const cam = new C(s.fov, 1, s.near, 1300);
        cam.layers.mask = window.ghent3d.menuCam.layers.mask;
        const y = (window.__pr.world.relief?.at(s.x, s.z) ?? 0) + 2.5; // about 2 m real: a car's roof
        cam.position.set(s.x, y, s.z);
        cam.lookAt(s.x + s.dx * 10, y, s.z + s.dz * 10);
        cam.updateMatrixWorld();
        const size = 768;
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, size / renderer.getPixelRatio(), size / renderer.getPixelRatio());
        renderer.render(scene, cam);
        const src = renderer.domElement, out = document.createElement('canvas');
        out.width = out.height = size;
        out.getContext('2d').drawImage(src, 0, src.height - size, size, size, 0, 0, size, size);
        return out.toDataURL('image/jpeg', 0.9);
      }, s);
      fs.writeFileSync(path.join(OUT, `${s.id}-${variant}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
      console.log(variant, s.id);
    }
    await page.close();
  }
} finally { await browser.close(); }
