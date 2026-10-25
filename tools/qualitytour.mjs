#!/usr/bin/env node
// A quality tour: flies the city's Tour in a headless browser, takes a picture every so many metres
// (and at every stop), looks left and right from street level at the same places, and puts them
// in contact sheets (tools/cache/quality/<city>/) for someone, or Claude, to look through for
// anything off: bare walls, floating things, holes in the ground, gaps in a row of houses.
// With a MAPILLARY_TOKEN it fetches the nearest real street photo looking the same way beside each,
// to compare with.
//
//     node tools/qualitytour.mjs ghent                       # flight + street views every 40 m
//     node tools/qualitytour.mjs ghent --every 25 --views flight,left,right,ahead
//     node tools/qualitytour.mjs ghent --from 800 --to 1600  # just that stretch of the path (metres)
//     node tools/qualitytour.mjs ghent --no-mapillary
//
// Output, in tools/cache/quality/<city>/:
//   frames/NNN-<view>.jpg   every picture
//   ref/NNN.jpg             the Mapillary photo nearest to it, looking the same way (token needed)
//   shots.json              for each stop on the path: s, x, z, lat/lon, street, the heading, the
//                           flat-wall score of each view and the Mapillary photo's link
//   sheet-NN.jpg, index.html   contact sheets (shot | reference) and a page to page through them
//
// Needs Playwright (npm i -g playwright) and three.js, which the game loads from a CDN: that is
// fetched once from npm into tools/cache/three/ and served to the page from there, so this
// works offline from the CDN too. The local server it starts is its own (no serve.py needed).
// Read tools/QUALITY.md (or the quality-tour skill) for what to look for and how to fix it.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(HERE, '..');
const args = process.argv.slice(2), opts = {}, pos = [];
for (let k = 0; k < args.length; k++) {
  if (args[k].startsWith('--no-')) opts[args[k].slice(5)] = false;
  else if (args[k].startsWith('--')) opts[args[k].slice(2)] = args[++k];
  else pos.push(args[k]);
}
const city = pos[0];
if (!city || !fs.existsSync(path.join(ROOT, city, 'area.json'))) {
  console.error('usage: node tools/qualitytour.mjs <city> [--every 40] [--views flight,left,right] [--from m] [--to m] [--no-mapillary]');
  process.exit(1);
}
const EVERY = +(opts.every ?? 40), VIEWS = (opts.views ?? 'flight,left,right').split(',');
if (!Number.isFinite(EVERY) || EVERY <= 0 || VIEWS.some(v => !['flight', 'left', 'right', 'ahead'].includes(v))) {
  console.error('--every must be positive and --views must contain flight,left,right,ahead');
  process.exit(1);
}
const OUT = path.join(HERE, 'cache', 'quality', city);
const W = +(opts.width ?? 960), H = Math.round(W * 9 / 16), EYE = 1.7;

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

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'ref'), { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
await page.route(u => !/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(u.href), route => route.abort()); // fonts, analytics: not needed (routes added later win, so this is first)
await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**', route => {
  const rel = new URL(route.request().url()).pathname.replace('/npm/three@0.170.0/', '');
  const f = path.join(threeDir, 'node_modules', 'three', rel);
  return fs.existsSync(f) ? route.fulfill({ body: fs.readFileSync(f), contentType: 'text/javascript' }) : route.abort();
});
page.on('pageerror', e => console.error('page error:', e.message));
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.addInitScript(() => { try { localStorage.setItem('instantgent', '{}'); } catch {} });
await page.goto(`${base}/${city}/play/?menu=tour`, { waitUntil: 'load' });
await page.waitForFunction(() => window.ghent3d?.game && document.getElementById('startBtn')?.textContent, null, { timeout: 120000 });
await page.evaluate(() => { const g = window.ghent3d; g.game.tourMode = 'auto'; g.setKind('tour'); document.getElementById('startBtn').click(); });
await page.waitForFunction(() => window.ghent3d.game.state === 'tour' && window.ghent3d.tour, null, { timeout: 120000 });
const info = await page.evaluate(() => {
  const g = window.ghent3d, t = g.tour;
  // the same light everywhere (the tour's own skies are night, rain, snow), and no bus in the way
  t.skies = []; t.busRun = null; t.fallRun = null;
  g.setSky('day:clear', false);
  return { length: t.length, stops: t.stops.map(s => ({ s: s.s, id: s.sight ?? s.emoji ?? 'stop' })), names: t.names.map(n => ({ s: n.s, name: n.name })) };
});
console.log(`tour: ${Math.round(info.length)} m, ${info.stops.length} stops`);

// the path's points to shoot: every EVERY metres from --from to --to, and at each stop
const from = +(opts.from ?? 0), to = Math.min(+(opts.to ?? info.length), info.length);
const marks = new Map();
for (let s = from; s <= to; s += EVERY) marks.set(Math.round(s), null);
for (const st of info.stops) if (st.s >= from && st.s <= to) marks.set(Math.round(st.s), st.id);
const list = [...marks].sort((a, b) => a[0] - b[0]);

// ---- take the pictures. In the page: put the tour at s, give the camera time to settle, render,
// and read the canvas. Street views stand on the path at eye height and look 90° aside.
const flat = `(() => {
  // flat-wall score: the share of the picture's cells (a 12 x 6 grid of the lower two thirds) with next to no detail
  const c = document.createElement('canvas'); c.width = 192; c.height = 108;
  const g = c.getContext('2d', { willReadFrequently: true });
  return src => { g.drawImage(src, 0, 0, c.width, c.height); const d = g.getImageData(0, 0, c.width, c.height).data;
    const lum = i => d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11, cols = 12, rows = 6, cw = c.width / cols, ch = (c.height * 2 / 3) / rows;
    let low = 0, cells = 0;
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
      let e = 0, n = 0;
      for (let y = Math.floor(c.height / 3 + r * ch); y < Math.floor(c.height / 3 + (r + 1) * ch) - 1; y++)
        for (let x = Math.floor(q * cw); x < Math.floor((q + 1) * cw) - 1; x++) { const i = (y * c.width + x) * 4; e += Math.abs(lum(i) - lum(i + 4)) + Math.abs(lum(i) - lum(i + c.width * 4)); n++; }
      cells++; if (e / n < 2.2) low++;
    }
    return +(low / cells).toFixed(2); };
})()`;
await page.evaluate(`window.__flat = ${flat}`);

const shots = [];
for (const [s, stopId] of list) {
  const frames = {};
  for (const view of VIEWS) {
    const r = await page.evaluate(async ({ s, view, EYE }) => {
      const g = window.ghent3d, t = g.tour, cam = g.menuCam;
      t.reset();
      t.t = 99; // no welcome
      t.s = s;
      t.next = t.stops.findIndex(st => st.s >= s);
      if (t.next < 0) t.next = t.stops.length;
      const p0 = t.at(s - 3), p1 = t.at(s + 3), yaw = Math.atan2(p1.x - p0.x, p1.z - p0.z);
      const turn = { flight: 0, ahead: 0, left: Math.PI / 2, right: -Math.PI / 2 }[view];
        if (view === 'flight') {
        t.aim = null;
        for (let i = 0; i < 15; i++) { t.s = s; g.step(1 / 30); } // the spring turns to where it looks
        t.s = s; t.v = 0; g.step(0.0001); g.render();
      } else {
        const p = t.at(s), y = (g.world.relief?.at(p.x, p.z) ?? 0) + EYE;
        const look = () => { cam.position.set(p.x, y, p.z); cam.lookAt(p.x + Math.sin(yaw + turn) * 20, y - 0.5, p.z + Math.cos(yaw + turn) * 20); cam.fov = 70; g.menuLook.set(p.x, 1.5, p.z); };
        for (let i = 0; i < 2; i++) { t.s = s; t.v = 0; g.step(0.0001); look(); g.render(); }
      }
      const cv = g.renderer.domElement;
      return { img: cv.toDataURL('image/jpeg', 0.85), flat: window.__flat(cv), yaw, x: t.at(s).x, z: t.at(s).z, hgt: Math.round(cam.position.y) };
    }, { s, view, EYE });
    frames[view] = { flat: r.flat, hgt: r.hgt };
    shots.meta ??= {};
    shots.meta[s] = { x: r.x, z: r.z, yaw: r.yaw };
    fs.writeFileSync(path.join(OUT, 'frames', `${String(s).padStart(5, '0')}-${view}.jpg`), Buffer.from(r.img.split(',')[1], 'base64'));
  }
  const m = shots.meta[s];
  const street = [...info.names].reverse().find(n => n.s <= s + 5)?.name ?? '';
  shots.push({ s, stop: stopId, street, x: Math.round(m.x * 10) / 10, z: Math.round(m.z * 10) / 10, heading: Math.round(((Math.atan2(Math.sin(m.yaw), -Math.cos(m.yaw)) * 180 / Math.PI) + 360) % 360), frames });
  process.stdout.write(`\r${shots.length}/${list.length} shots (s = ${s} m)   `);
}
console.log();
await browser.close();
server.close();
if (errors.length) console.log(`${errors.length} console errors, first: ${errors[0].slice(0, 200)}`);

// ---- the real street photos, where there is a token (and the network)
const { latLon } = mapCoords(path.join(ROOT, city), city);
for (const sh of shots) [sh.lat, sh.lon] = latLon(sh.x, sh.z).map(v => +v.toFixed(6));
const token = process.env.MAPILLARY_TOKEN;
if (token && opts.mapillary !== false) {
  const have = new Map(); // tile -> photos
  const tile = (lat, lon) => [Math.floor(lat / 0.002), Math.floor(lon / 0.002)];
  const get = async (ti, tj) => {
    const key = ti + ',' + tj;
    if (!have.has(key)) {
      const bbox = [tj * 0.002, ti * 0.002, (tj + 1) * 0.002, (ti + 1) * 0.002].map(v => v.toFixed(6)).join(',');
      const res = await fetch(`https://graph.mapillary.com/images?${new URLSearchParams({ bbox, limit: '2000', fields: 'id,thumb_1024_url,computed_geometry,computed_compass_angle,captured_at,is_pano,creator' })}`, { headers: { Authorization: 'OAuth ' + token } }).catch(() => null);
      have.set(key, res?.ok ? (await res.json()).data.filter(i => !i.is_pano && i.computed_geometry && i.computed_compass_angle != null) : []);
    }
    return have.get(key);
  };
  const kx = 111320 * Math.cos(51.05 * Math.PI / 180), kz = 110574;
  let found = 0;
  for (const sh of shots) {
    const [ti, tj] = tile(sh.lat, sh.lon), cands = (await Promise.all([[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => get(ti + a, tj + b)))).flat();
    // the one that looks the way the camera looks (the 'ahead' of the path), nearest, newest of equals
    let best = null;
    for (const i of cands) {
      const [lo, la] = i.computed_geometry.coordinates, d = Math.hypot((lo - sh.lon) * kx, (la - sh.lat) * kz);
      const dh = Math.abs(((i.computed_compass_angle - sh.heading + 540) % 360) - 180);
      if (d > 30 || dh > 35) continue;
      const score = d + dh * 0.3 - (i.captured_at ?? 0) / 3e12;
      if (!best || score < best.score) best = { score, i, d };
    }
    if (!best) continue;
    const img = await fetch(best.i.thumb_1024_url).then(r => r.arrayBuffer()).catch(() => null);
    if (!img) continue;
    fs.writeFileSync(path.join(OUT, 'ref', `${String(sh.s).padStart(5, '0')}.jpg`), Buffer.from(img));
    sh.ref = { id: best.i.id, metres: Math.round(best.d), captured: best.i.captured_at && new Date(best.i.captured_at).toISOString().slice(0, 10), page: `https://www.mapillary.com/app/?pKey=${best.i.id}` };
    found++;
  }
  console.log(`Mapillary: a photo for ${found} of ${shots.length} shots`);
} else {
  console.log('Mapillary skipped (' + (token ? 'switched off' : 'no MAPILLARY_TOKEN') + ')');
}
fs.writeFileSync(path.join(OUT, 'shots.json'), JSON.stringify({ city, every: EVERY, length: Math.round(info.length), shots }, null, 1));

// ---- contact sheets: each row a spot: its views side by side, then the reference. 4 rows to a sheet.
const rows = shots.map(sh => {
  const imgs = VIEWS.map(v => ({ label: v, flat: sh.frames[v].flat, src: path.join(OUT, 'frames', `${String(sh.s).padStart(5, '0')}-${v}.jpg`) }));
  const ref = path.join(OUT, 'ref', `${String(sh.s).padStart(5, '0')}.jpg`);
  if (fs.existsSync(ref)) imgs.push({ label: 'mapillary ' + (sh.ref.captured ?? ''), src: ref });
  return { title: `s=${sh.s} m  ${sh.street}${sh.stop ? '  ★ ' + sh.stop : ''}  (${sh.lat}, ${sh.lon})  heading ${sh.heading}°`, imgs };
});
const PER = +(opts.rows ?? 4), COLS = Math.max(...rows.map(r => r.imgs.length)), CW = Math.floor(1600 / COLS), CH = Math.round(CW * 9 / 16);
const b2 = await chromium.launch(), p2 = await b2.newPage();
const sheets = [];
for (let n = 0; n * PER < rows.length; n++) {
  const part = rows.slice(n * PER, (n + 1) * PER).map(r => ({ ...r, imgs: r.imgs.map(i => ({ ...i, data: 'data:image/jpeg;base64,' + fs.readFileSync(i.src).toString('base64') })) }));
  const url = await p2.evaluate(async ({ part, CW, CH, COLS }) => {
    const cv = document.createElement('canvas'); cv.width = CW * COLS; cv.height = part.length * (CH + 26);
    const g = cv.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, cv.width, cv.height); g.font = '15px sans-serif'; g.textBaseline = 'middle';
    for (const [r, row] of part.entries()) {
      const y = r * (CH + 26);
      g.fillStyle = '#fff'; g.fillText(row.title, 6, y + 13);
      for (const [c, im] of row.imgs.entries()) {
        const el = new Image(); el.src = im.data; await el.decode();
        g.drawImage(el, c * CW + 1, y + 26, CW - 2, CH);
        g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(c * CW + 1, y + 26, 150, 20); g.fillStyle = im.flat >= 0.4 ? '#ff6' : '#fff';
        g.fillText(im.label + (im.flat != null ? '  flat ' + im.flat : ''), c * CW + 5, y + 36);
      }
    }
    return cv.toDataURL('image/jpeg', 0.82);
  }, { part, CW, CH, COLS });
  const name = `sheet-${String(n + 1).padStart(2, '0')}.jpg`;
  fs.writeFileSync(path.join(OUT, name), Buffer.from(url.split(',')[1], 'base64'));
  sheets.push(name);
}
await b2.close();
const flatTop = shots.flatMap(sh => VIEWS.map(v => ({ s: sh.s, v, flat: sh.frames[v].flat }))).filter(f => f.flat >= 0.4).sort((a, b) => b.flat - a.flat);
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Quality tour ${city}</title>
<body style="font:14px sans-serif;background:#111;color:#eee;margin:16px"><h1>Quality tour: ${city} (${shots.length} spots, every ${EVERY} m)</h1>
<p>Most bare-looking views first (flat score = share of the lower picture with hardly any detail): ${flatTop.slice(0, 25).map(f => `s=${f.s} ${f.v} (${f.flat})`).join(', ') || 'none over 0.4'}</p>
${sheets.map(n => `<img src="${n}" style="width:100%;margin-bottom:8px">`).join('\n')}</body>`);
console.log(`${shots.length} spots, ${sheets.length} sheets -> ${path.relative(process.cwd(), OUT)}/ (open index.html; shots.json has the data)`);
