#!/usr/bin/env node
// Screenshots for the App Store: the game in a phone- or iPad-sized headless browser, at the sizes
// App Store Connect takes, in app/app-store-assets/screenshots/<lang>/<device>/NN-<city>-<what>.png.
//
//     node tools/storeshots.mjs                      # every shot, nl and en, iphone and ipad
//     node tools/storeshots.mjs --lang nl --device iphone --only 1
//
// A shot is a city and what is on screen: the menu over the city, riding, or the tour. One headless
// browser, closed when done (CLAUDE.md); a shot takes about half a minute on the CPU.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(HERE, '..');
const args = process.argv.slice(2), opts = {};
for (let k = 0; k < args.length; k++) if (args[k].startsWith('--')) opts[args[k].slice(2)] = args[++k];

// iPhone 6.3" (1206 x 2622) and iPad 13" (2064 x 2752): the CSS size times the pixel ratio
const DEVICES = {
  iphone: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  ipad: { viewport: { width: 1032, height: 1376 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
// play: seconds of game time to step through before the picture (headless, the game runs slow)
// what: 'menu' the menu over the city, 'ride' riding (after "Tap to ride"), 'tour' the tour flying past the sights
const SHOTS = [
  { city: 'paris', what: 'tour', play: 45 },
  { city: 'venice', what: 'ride', play: 4 },
  { city: 'rome', what: 'menu' },
  { city: 'amsterdam', what: 'ride', play: 4 },
  { city: 'ghent', what: 'tour', play: 70 },
  { city: 'new-york', what: 'ride', play: 4 },
];

const require = createRequire(import.meta.url);
function load(name) {
  for (const p of [undefined, '/node-tools/node_modules', path.join(process.env.HOME ?? '', 'node_modules'), execFileSync('npm', ['root', '-g']).toString().trim()]) {
    try { return require(p ? path.join(p, name) : name); } catch {}
  }
  throw new Error(`${name} not found: npm i -g ${name}`);
}
const { chromium } = load('playwright');
const threeDir = path.join(HERE, 'cache', 'three'); // three.js from npm, as tools/demo.mjs keeps it
if (!fs.existsSync(path.join(threeDir, 'node_modules', 'three'))) {
  fs.mkdirSync(threeDir, { recursive: true });
  fs.writeFileSync(path.join(threeDir, 'package.json'), '{"private":true}');
  execFileSync('npm', ['i', 'three@0.170.0', '--no-audit', '--no-fund'], { cwd: threeDir, stdio: 'inherit' });
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const f = fs.existsSync(file) && fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file;
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] ?? 'application/octet-stream' }).end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const langs = opts.lang ? [opts.lang] : ['nl', 'en'];
const devices = opts.device ? [opts.device] : Object.keys(DEVICES);
const shots = SHOTS.map((s, i) => ({ ...s, n: i + 1 })).filter(s => !opts.only || opts.only.split(',').map(Number).includes(s.n));

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  for (const device of devices) for (const lang of langs) {
    const dir = path.join(ROOT, 'app', 'app-store-assets', 'screenshots', lang, device);
    fs.mkdirSync(dir, { recursive: true });
    for (const s of shots) {
      const ctx = await browser.newContext({ ...DEVICES[device], locale: lang });
      const page = await ctx.newPage();
      await page.route(u => !/^(http:\/\/127\.0\.0\.1|data:|blob:|https:\/\/fonts\.(googleapis|gstatic)\.com|https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.170\.0\/)/.test(u.href), route => route.abort());
      await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', route => {
        const f = path.join(threeDir, 'node_modules', 'three', new URL(route.request().url()).pathname.replace('/npm/three@0.170.0/', ''));
        return fs.existsSync(f) ? route.fulfill({ body: fs.readFileSync(f), contentType: 'text/javascript' }) : route.abort();
      });
      page.on('pageerror', e => console.error(`${s.city}: page error:`, e.message));
      await page.addInitScript(lang => { try { localStorage.setItem('ghent3d.settings.v1', JSON.stringify({ lang })); } catch {} }, lang);
      await page.goto(`${base}/${s.city}/play/?lang=${lang}${s.what === 'tour' ? '&tour=auto' : ''}`, { waitUntil: 'load' });
      await page.waitForFunction(() => !document.body.classList.contains('booting'), null, { timeout: 240000 });
      await page.evaluate(() => document.fonts.ready);
      if (s.what === 'ride') { await page.tap('#startBtn'); await page.keyboard.down('ArrowUp'); }
      await page.evaluate(sec => { for (let t = 0; t < sec; t += 0.05) window.ghent3d.step(0.05); }, s.play ?? 0);
      await page.waitForTimeout(3000); // a few frames drawn
      const file = path.join(dir, `${String(s.n).padStart(2, '0')}-${s.city}-${s.what}.png`);
      await page.screenshot({ path: file, timeout: 240000 });
      console.log(path.relative(ROOT, file));
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
