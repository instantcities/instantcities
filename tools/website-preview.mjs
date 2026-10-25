#!/usr/bin/env node
// Compile a city's separate website-preview.json into a silent, cacheable MP4.
// node tools/website-preview.mjs [ghent rome ...] [--headless]
// Requires ffmpeg, Chrome and playwright or playwright-core. One browser, sequential cities.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2), headless = args.includes('--headless');
const cities = args.filter(a => !a.startsWith('--'));
if (!cities.length) cities.push('ghent', 'rome', 'paris', 'london', 'barcelona');
const definitions = cities.map(city => {
  if (!/^[a-z]+$/.test(city)) throw new Error(`Invalid city: ${city}`);
  const def = JSON.parse(fs.readFileSync(path.join(root, city, 'website-preview.json')));
  const duration = def.shots.reduce((n, s) => n + s.seconds, 0);
  if (!(duration >= 10 && duration <= 20) || def.shots.some(s => !(s.seconds > 0) || !(s.speed > 0) || !Array.isArray(s.at) || s.at.length !== 2 || !s.at.every(Number.isFinite))) throw new Error(`${city}: expected valid shots totalling 10–20 seconds`);
  for (const shot of def.shots) {
    if (shot.before != null && (!Number.isFinite(shot.before) || shot.before < 0)) throw new Error(`${city}: invalid before distance`);
    if (shot.cameraFrom || shot.cameraTo || shot.look) {
      if (![shot.cameraFrom, shot.cameraTo, shot.look].every(v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite))) throw new Error(`${city}: cameraFrom, cameraTo and look must all be [x, y, z]`);
    }
  }
  return { city, def, duration };
});
const require = createRequire(import.meta.url);
let chromium;
for (const base of ['', execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()]) {
  for (const name of ['playwright', 'playwright-core']) {
    try { chromium = require(base ? path.join(base, name) : name).chromium; } catch {}
  }
}
if (!chromium) throw new Error('Install playwright or playwright-core first.');
execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const fps = 24, width = 960, height = 540;
try {
  browser = await chromium.launch({ channel: 'chrome', headless, args: ['--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  for (const { city, def, duration } of definitions) {
    const dir = path.join(root, 'tools/cache/website-preview', city);
    const out = path.join(root, 'assets/previews');
    fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(out, { recursive: true });
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    try {
      await page.addInitScript(() => {
        const raf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = fn => raf(t => { if (!window.__previewRecording) fn(t); });
      });
      page.on('pageerror', e => console.error(`${city}: ${e.message}`));
      await page.goto(`http://127.0.0.1:${server.address().port}/${city}/play/?watch`, { waitUntil: 'load' });
      await page.waitForFunction(() => window.ghent3d?.tour && !document.body.classList.contains('booting'), null, { timeout: 180000 });
      await page.evaluate(() => {
        window.__previewRecording = true;
        const g = window.ghent3d;
        g.tour.skies = []; g.tour.busRun = null; g.tour.fallRun = null;
        g.setSky('day:clear', false);
        g.renderer.setPixelRatio(1);
      });
      let frame = 0;
      for (const shot of def.shots) {
        await page.evaluate(shot => {
          const g = window.ghent3d, t = g.tour;
          t.seek({ s: Math.max(1, t.along(shot.at) - (shot.before ?? 35)) });
          g.game.tourSpeed = shot.speed;
          const s = t.s;
          for (let i = 0; i < 30; i++) { t.s = s; g.step(1 / 30); }
        }, shot);
        for (let i = 0; i < Math.round(shot.seconds * fps); i++) {
          const data = await page.evaluate(({ dt, shot, progress }) => {
            const g = window.ghent3d;
            g.step(dt);
            if (shot.cameraFrom) {
              const position = shot.cameraFrom.map((v, k) => v + (shot.cameraTo[k] - v) * progress);
              g.menuCam.position.set(...position);
              g.menuCam.lookAt(...shot.look);
            }
            g.render();
            return g.renderer.domElement.toDataURL('image/jpeg', .88).split(',')[1];
          }, { dt: 1 / fps, shot, progress: i / Math.max(1, Math.round(shot.seconds * fps) - 1) });
          fs.writeFileSync(path.join(dir, `${String(frame++).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'));
        }
        console.log(`${city}: ${shot.name} (${frame / fps}/${duration}s)`);
      }
      const temporary = path.join(dir, 'preview.mp4');
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, '%05d.jpg'), '-frames:v', String(frame), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', temporary], { stdio: 'inherit' });
      fs.copyFileSync(temporary, path.join(out, `${city}.mp4`));
      fs.copyFileSync(path.join(dir, '00000.jpg'), path.join(out, `${city}.jpg`));
      console.log(`Created assets/previews/${city}.mp4`);
    } finally { await page.close(); }
  }
} finally { await browser?.close(); server.close(); }
