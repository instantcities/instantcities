#!/usr/bin/env node
// Pictures inside Pompeii's houses (pompeii/houses.js), at eye height, to check them: each view
// stands at a point in a house's own frame (x along its street, z into it) and looks at another, into
// tools/cache/houseshots/. Needs serve.py running on :8321 and Playwright; one headless browser for all
// the views, closed after (see CLAUDE.md).
//
//     node tools/houseshots.mjs faun-atrium:faun:13,9:13,22 vettii-room:vettii:24,33:24,39:1.7
//
// A view is name:house:x,z:tx,tz[:height]: where you stand, what you look at, the eye's height
// (default 1.7 m; the point looked at is at 1.6 m).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }
const views = process.argv.slice(2).map(v => {
  const [name, house, at, to, h = '1.7'] = v.split(':');
  return { name, house, at: at.split(',').map(Number), to: to.split(',').map(Number), h: +h };
});
if (!views.length) { console.error('usage: node tools/houseshots.mjs name:house:x,z:tx,tz[:height] ...'); process.exit(1); }
const OUT = path.join(HERE, 'cache', 'houseshots');
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  page.on('pageerror', e => console.log('pageerror', e.message.slice(0, 300)));
  page.on('console', m => { if (m.type() === 'error') console.log('console', m.text().slice(0, 300)); });
  await page.route(/googletagmanager/, r => r.abort());
  await page.goto(`http://localhost:8321/pompeii/play/?at=house-${views[0].house}`);
  await page.waitForFunction(() => window.__pr?.world && window.__pr.game.state !== 'menu', null, { timeout: 240000, polling: 2000 });
  const { HOUSE_FRAMES } = await page.evaluate(() => import('/pompeii/houses.js').then(m => ({ HOUSE_FRAMES: Object.fromEntries(Object.entries(m.HOUSE_FRAMES).map(([k, p]) => [k, { x: p.x, z: p.z, turn: p.turn }])) })));
  let last = null;
  for (const v of views) {
    const f = HOUSE_FRAMES[v.house], ux = Math.cos(f.turn), uz = -Math.sin(f.turn);
    const at = ([x, z]) => [f.x + ux * x - uz * z, f.z + uz * x + ux * z];
    const [ex, ez] = at(v.at), [tx, tz] = at(v.to);
    if (last !== v.house) {
      // the player out of the picture: well behind the camera
      const L = Math.hypot(tx - ex, tz - ez) || 1;
      await page.evaluate(([x, z]) => window.__pr.teleport({ x, z }), [ex - ((tx - ex) / L) * 30, ez - ((tz - ez) / L) * 30]);
      await page.waitForTimeout(9000); // the house and the tiles round it get built, the photos come in
      last = v.house;
    }
    const url = await page.evaluate(([ex, ez, tx, tz, h]) => {
      const { renderer, scene } = window.ghent3d;
      const C = Object.getPrototypeOf(window.ghent3d.menuCam).constructor;
      const cam = new C(62, 1.5, 0.1, 2500);
      cam.layers.mask = window.ghent3d.menuCam.layers.mask;
      const g = window.__pr.world.relief?.at(ex, ez) ?? 0;
      cam.position.set(ex, g + h, ez);
      cam.lookAt(tx, g + 1.6, tz);
      cam.updateMatrixWorld();
      const W = 900, H = 600, pr = renderer.getPixelRatio();
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, W / pr, H / pr);
      renderer.render(scene, cam);
      const src = renderer.domElement, out = document.createElement('canvas');
      out.width = W; out.height = H;
      out.getContext('2d').drawImage(src, 0, src.height - H, W, H, 0, 0, W, H);
      return out.toDataURL('image/jpeg', 0.85);
    }, [ex, ez, tx, tz, v.h]);
    const file = path.join(OUT, `${v.name}.jpg`);
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
    console.log(file);
  }
} finally { await browser.close(); }
