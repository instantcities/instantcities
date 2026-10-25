#!/usr/bin/env node
// Films the demo (<city>/demo.js, played by core/js/demo.js): the game with ?demo=record in a
// headless browser, stepped a frame at a time (so it plays as smoothly as on a fast computer however
// slow this one renders), a picture of each frame, and the music put under it with ffmpeg.
//
//     node tools/demo.mjs ghent                      # tools/cache/demo/ghent.mp4, 1280x720, 30 fps
//     node tools/demo.mjs ghent --width 1920 --fps 60
//     node tools/demo.mjs ghent --every 15 --no-video # a picture every 15 frames to look through, no film
//     node tools/demo.mjs ghent --lang en
//     node tools/demo.mjs ghent --shots 6-8 --every 10   # only those shots of the script (from 0), to try them
//     node tools/demo.mjs ghent --window             # in a Chrome window, drawn on the graphics card
//
// Pictures in tools/cache/demo/<city>/NNNNN.jpg. Headless, it renders the WebGL on the CPU: a minute
// of film takes a couple of hours (see CLAUDE.md: one browser, closed when done, and not on a laptop
// that runs hot). With --window it opens a Chrome window of its own instead and draws on the
// computer's graphics card, which is many times faster: leave the window be until it is done.
// Needs Playwright (npm i -g playwright) and ffmpeg; three.js, which the game loads from a CDN, is
// fetched once from npm into tools/cache/three/ and served from there.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(HERE, '..');
const args = process.argv.slice(2), opts = {}, pos = [];
for (let k = 0; k < args.length; k++) {
  if (args[k].startsWith('--no-')) opts[args[k].slice(5)] = false;
  else if (args[k].startsWith('--')) opts[args[k].slice(2)] = args[k + 1] && !args[k + 1].startsWith('--') ? args[++k] : true; // (--window: a flag)
  else pos.push(args[k]);
}
const city = pos[0];
if (!city || !fs.existsSync(path.join(ROOT, city, 'demo.js'))) {
  console.error('usage: node tools/demo.mjs <city> [--width 1280] [--fps 30] [--every 1] [--lang nl] [--shots a-b] [--window] [--no-video]');
  process.exit(1);
}
const W = +(opts.width ?? 1280), H = Math.round(W * 9 / 16), FPS = +(opts.fps ?? 30), EVERY = +(opts.every ?? 1);
const OUT = path.join(HERE, 'cache', 'demo'), FRAMES = path.join(OUT, city);
const { DEMO: SCRIPT } = await import(path.join(ROOT, city, 'demo.js'));
const SHOTS = opts.shots?.split('-').map(Number);
const DEMO = SHOTS ? { ...SCRIPT, shots: SCRIPT.shots.slice(SHOTS[0], (SHOTS[1] ?? SHOTS[0]) + 1) } : SCRIPT;

// ---- playwright and three.js, wherever they are
const require = createRequire(import.meta.url);
function load(name) {
  for (const p of [undefined, ...(process.env.NODE_PATH ?? '').split(':').filter(Boolean), '/node-tools/node_modules', path.join(process.env.HOME ?? '', 'node_modules'), execFileSync('npm', ['root', '-g']).toString().trim()]) {
    try { return require(p ? path.join(p, name) : name); } catch {}
  }
  throw new Error(`${name} not found: npm i -g ${name}`);
}
const { chromium } = load('playwright');
const threeDir = path.join(HERE, 'cache', 'three');
if (!fs.existsSync(path.join(threeDir, 'node_modules', 'three'))) {
  fs.mkdirSync(threeDir, { recursive: true });
  fs.writeFileSync(path.join(threeDir, 'package.json'), '{"private":true}');
  execFileSync('npm', ['i', 'three@0.170.0', '--no-audit', '--no-fund'], { cwd: threeDir, stdio: 'inherit' });
}

// ---- a static server for the repo
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const f = fs.existsSync(file) && fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file;
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

fs.rmSync(FRAMES, { recursive: true, force: true });
fs.mkdirSync(FRAMES, { recursive: true });

const WINDOW = !!opts.window;
const browser = await chromium.launch(WINDOW
  ? { headless: false, args: ['--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] } // the graphics card, and on even when the window is behind another
  : { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); // the CPU
try {
  const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  // only the game itself and its fonts; no analytics
  await page.route(u => !/^(http:\/\/127\.0\.0\.1|data:|blob:|https:\/\/fonts\.(googleapis|gstatic)\.com)/.test(u.href), route => route.abort());
  await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', route => {
    const rel = new URL(route.request().url()).pathname.replace('/npm/three@0.170.0/', '');
    const f = path.join(threeDir, 'node_modules', 'three', rel);
    return fs.existsSync(f) ? route.fulfill({ body: fs.readFileSync(f), contentType: 'text/javascript' }) : route.abort();
  });
  page.on('pageerror', e => console.error('page error:', e.message));
  // in the language asked for (the settings the game keeps), otherwise the game's own
  if (opts.lang) await page.addInitScript(lang => { try { localStorage.setItem('ghent3d.settings.v1', JSON.stringify({ lang })); } catch {} }, opts.lang);
  await page.goto(`${base}/${city}/play/?demo=record${SHOTS ? `&shots=${SHOTS[0]}-${SHOTS[1] ?? SHOTS[0]}` : ''}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.ghent3d?.demo && !document.body.classList.contains('booting'), null, { timeout: 180000 });
  await page.evaluate(() => document.fonts.ready);

  const total = Math.ceil(DEMO.shots.reduce((t, s) => t + s.for, 0) * FPS);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    await page.evaluate(([dt, draw]) => window.ghent3d.demoFrame(dt, draw), [1 / FPS, i % EVERY === 0]);
    if (i % EVERY) continue;
    await page.screenshot({ path: path.join(FRAMES, `${String(i / EVERY).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92, timeout: 180000 }); // (the first takes a while)
    if (i % (FPS * 2) === 0) {
      const left = (Date.now() - t0) / (i + 1) * (total - i - 1) / 1000;
      console.log(`${(i / FPS).toFixed(1)} s of ${(total / FPS).toFixed(1)}   (${Math.round(left / 60)} min to go)`);
    }
  }
} finally {
  await browser.close();
  server.close();
}

// ---- the film: the pictures, and the music from where the script says, fading out at the end
if (opts.video !== false && EVERY === 1) {
  const length = DEMO.shots.reduce((t, s) => t + s.for, 0), m = DEMO.music ?? {}, out = m.out ?? 2;
  const file = path.join(OUT, `${city}${opts.lang ? '-' + opts.lang : ''}.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error',
    '-framerate', String(FPS), '-i', path.join(FRAMES, '%05d.jpg'),
    '-ss', String(m.from ?? 0), '-i', path.join(ROOT, 'core', 'sounds', `${m.name ?? 'tour'}.mp3`),
    '-t', String(length), '-map', '0:v', '-map', '1:a',
    '-af', `afade=t=in:d=0.5,afade=t=out:st=${length - out}:d=${out}`,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', file], { stdio: 'inherit' });
  console.log(path.relative(process.cwd(), file));
} else console.log(path.relative(process.cwd(), FRAMES));
