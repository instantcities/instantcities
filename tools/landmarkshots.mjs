#!/usr/bin/env node
// Pictures of a landmark in the game, to check one modelled by hand (<city>/<landmark>.js): each view
// looks at a point from a heading, a distance and a height, into tools/cache/landmarkshots/<city>/.
// Needs serve.py running on :8321 and Playwright. One headless browser for all the views, closed after;
// a lock (tools/cache/landmarkshots.lock) makes a second run wait for the first, so two never draw at
// once (see CLAUDE.md).
//
//     node tools/landmarkshots.mjs pisa torre:-179,-608 duomo:-120,-640:200:90:30
//
// A view is name:x,z[:heading:distance:height]: the point looked at (game metres, its middle a third
// of the height up), the compass heading the camera looks along (degrees, 0 = north, -z; default 30),
// how far back it stands (default 70) and how high (default 25). The game is the city's play page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const [city, ...VIEWS] = process.argv.slice(2);
if (!city || !VIEWS.length) { console.error('usage: node tools/landmarkshots.mjs <city> name:x,z[:heading:distance:height] ...'); process.exit(1); }
const views = VIEWS.map(v => {
  const [name, at, hd = '30', dist = '70', h = '25'] = v.split(':'), [x, z] = at.split(',').map(Number), a = (+hd * Math.PI) / 180;
  const dx = Math.sin(a), dz = -Math.cos(a);
  return { name, x, z, h: +h, cx: x - dx * +dist, cz: z - dz * +dist };
});
const OUT = path.join(HERE, 'cache', 'landmarkshots', city), LOCK = path.join(HERE, 'cache', 'landmarkshots.lock');
fs.mkdirSync(OUT, { recursive: true });

// wait for the lock: a folder, made by one run at a time (a stale one, over 15 minutes old, is taken over)
for (;;) {
  try { fs.mkdirSync(LOCK); break; } catch {
    try { if (Date.now() - fs.statSync(LOCK).mtimeMs > 15 * 60e3) { fs.rmSync(LOCK, { recursive: true }); continue; } } catch {}
    await new Promise(r => setTimeout(r, 5000));
  }
}
const free = () => { try { fs.rmSync(LOCK, { recursive: true }); } catch {} };
process.on('SIGINT', () => { free(); process.exit(130); });

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  page.on('pageerror', e => console.log('pageerror', e.message.slice(0, 300)));
  page.on('console', m => { if (m.type() === 'error') console.log('console', m.text().slice(0, 300)); });
  await page.route(/googletagmanager/, r => r.abort());
  const v0 = views[0];
  await page.goto(`http://localhost:8321/${city}/play/?pos=${v0.cx.toFixed(1)},${v0.cz.toFixed(1)}`);
  await page.waitForFunction(() => window.__pr?.world && window.__pr.game.state !== 'menu', null, { timeout: 240000, polling: 2000 });
  for (const v of views) {
    await page.evaluate(([x, z]) => window.__pr.teleport({ x, z }), [v.x, v.z]);
    await page.waitForTimeout(10000); // the tiles and the monuments round it get built
    const url = await page.evaluate(v => {
      const { renderer, scene } = window.ghent3d;
      const C = Object.getPrototypeOf(window.ghent3d.menuCam).constructor;
      const cam = new C(55, 1.5, 0.5, 2500);
      cam.layers.mask = window.ghent3d.menuCam.layers.mask;
      const g = window.__pr.world.relief?.at(v.x, v.z) ?? 0;
      cam.position.set(v.cx, g + v.h, v.cz);
      cam.lookAt(v.x, g + v.h / 3, v.z);
      cam.updateMatrixWorld();
      const W = 900, H = 600, pr = renderer.getPixelRatio();
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, W / pr, H / pr);
      renderer.render(scene, cam);
      const src = renderer.domElement, out = document.createElement('canvas');
      out.width = W; out.height = H;
      out.getContext('2d').drawImage(src, 0, src.height - H, W, H, 0, 0, W, H);
      return out.toDataURL('image/jpeg', 0.85);
    }, v);
    const file = path.join(OUT, `${v.name}.jpg`);
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
    console.log(file);
  }
} finally { await browser.close(); free(); }
