#!/usr/bin/env node
// Photos of the police cars, buses, trams and other vehicles in the game, one per model, from
// Wikimedia Commons, for the models pages (/<lang>/<city>/models/, _layouts/models.html) where each
// stands next to its model in the game. The models and where on Commons to look for them are in
// _data/vehicles.json (`category`: Commons categories, | between them, the files in them and in their
// subcategories one level down; `search`: words to search the files for); the photo chosen goes there too.
//
//     node tools/vehicles.mjs find police-nl            # the candidates: a numbered sheet of them,
//     node tools/vehicles.mjs find all                  #   tools/cache/vehicles/<id>.jpg, their files in <id>.txt
//     node tools/vehicles.mjs add police-nl "File.jpg"  # that one: assets/img/vehicles/<id>.jpg (1024 px
//                                                       #   at most) and <id>-s.jpg (640), its credits in the data
//     node tools/vehicles.mjs cities                    # which models each city has (core/js/fleets.js,
//                                                       #   and its TRAFFIC.mix) into the data's `cities`
//     node tools/vehicles.mjs shots [id...]             # a picture of each model in the game (all of them, or
//                                                       #   these), assets/img/vehicles/<id>-model.webp: core/models.html
//                                                       #   in one headless browser (serve.py running on :8321)
//
// Only files under a free licence that allows reuse (CC0, CC BY, CC BY-SA, public domain) are taken.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, '_data', 'vehicles.json');
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const HEADERS = { 'User-Agent': 'Instant Cities vehicles tool (https://instantcities.net)' };

const args = process.argv.slice(2), opts = {}, rest = [];
for (let k = 0; k < args.length; k++) {
  if (args[k].startsWith('--')) opts[args[k].slice(2)] = args[++k];
  else rest.push(args[k]);
}
const [cmd, id, file] = rest;
const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const save = () => fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + '\n');
const model = id => data.models.find(m => m.id === id) ?? (() => { throw new Error(`no model "${id}" in ${DATA}`); })();

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function api(params) {
  for (let wait = 4000; ; wait *= 2) {
    const res = await fetch(`${COMMONS}?${new URLSearchParams({ format: 'json', ...params })}`, { headers: HEADERS });
    const body = await res.text();
    if (res.status !== 429 && !/too many requests/i.test(body)) return JSON.parse(body);
    if (wait > 120000) throw new Error('Commons keeps saying too many requests');
    await sleep(wait);
  }
}
async function get(url) {
  let res;
  for (let wait = 2000; (res = await fetch(url, { headers: HEADERS })).status === 429 && wait < 120000; wait *= 2) await sleep(wait);
  return res;
}
const FREE = /^(cc0|cc[ -]by(-sa)?( \d\.\d)?|public domain|pd\b)/i;
const text = (m, k) => (m[k]?.value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
async function infos(titles, width) {
  const out = [];
  for (let k = 0; k < titles.length; k += 40) {
    const q = await api({ action: 'query', titles: titles.slice(k, k + 40).join('|'), prop: 'imageinfo', iiprop: 'url|size|extmetadata|mime', iiurlwidth: String(width) });
    for (const p of Object.values(q.query?.pages ?? {})) if (p.imageinfo) out.push({ title: p.title, ...p.imageinfo[0] });
  }
  return out;
}

async function find(m, n) {
  const titles = new Set();
  const members = async cat => (await api({ action: 'query', list: 'categorymembers', cmtitle: `Category:${cat}`, cmtype: 'file|subcat', cmlimit: '200', cmsort: 'timestamp', cmdir: 'desc' })).query?.categorymembers ?? [];
  for (const c of (m.category ?? '').split('|').filter(Boolean)) {
    const top = await members(c);
    for (const t of top) if (t.ns === 6) titles.add(t.title);
    for (const s of top.filter(t => t.ns === 14).slice(0, 25)) for (const t of await members(s.title.slice(9))) if (t.ns === 6) titles.add(t.title);
  }
  if (m.search) for (const r of (await api({ action: 'query', list: 'search', srsearch: m.search, srnamespace: '6', srlimit: '50' })).query.search) titles.add(r.title);
  // the newest first (the fleet as it is now), landscape photos big enough to show
  const found = (await infos([...titles].filter(t => /\.jpe?g$/i.test(t)).slice(0, 400), 320))
    .filter(f => FREE.test(text(f.extmetadata ?? {}, 'LicenseShortName')) && f.width >= 1200 && f.width > f.height * 1.15)
    .sort((a, b) => (text(b.extmetadata, 'DateTimeOriginal') || text(b.extmetadata, 'DateTime')).localeCompare(text(a.extmetadata, 'DateTimeOriginal') || text(a.extmetadata, 'DateTime')))
    .slice(0, n);
  const dir = path.join(ROOT, 'tools', 'cache', 'vehicles', m.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const lines = [];
  for (const [k, f] of found.entries()) {
    const res = await get(f.thumburl);
    if (!res.ok) continue;
    await sleep(250);
    fs.writeFileSync(path.join(dir, `${String(k).padStart(2, '0')}.jpg`), Buffer.from(await res.arrayBuffer()));
    lines.push(`${k}\t${f.width}x${f.height}\t${text(f.extmetadata ?? {}, 'LicenseShortName')}\t${(text(f.extmetadata ?? {}, 'DateTimeOriginal') || '').slice(0, 10)}\t${f.title.slice(5)}`);
  }
  fs.writeFileSync(path.join(dir, '..', `${m.id}.txt`), lines.join('\n') + '\n');
  const shots = fs.readdirSync(dir).sort().map(f => path.join(dir, f));
  if (shots.length) execFileSync('montage', ['-label', '%t', '-pointsize', '18', '-geometry', '320x220+4+4', '-tile', '6x', ...shots, path.join(dir, '..', `${m.id}.jpg`)]);
  console.log(`${m.id}: ${lines.length} of ${titles.size} files → tools/cache/vehicles/${m.id}.jpg`);
}

if (cmd === 'find' && id) {
  for (const m of id === 'all' ? data.models.filter(m => !m.photo) : [model(id)]) await find(m, Number(opts.n ?? 24));
} else if (cmd === 'add' && id && file) {
  const m = model(id), name = file.replace(/^File:/, '');
  const [f] = await infos([`File:${name}`], 1600);
  if (!f) throw new Error(`no file "${name}" on Commons`);
  const meta = f.extmetadata ?? {}, license = text(meta, 'LicenseShortName');
  if (!FREE.test(license)) throw new Error(`${name}: licence "${license}" is not one we can use`);
  const res = await get(f.thumburl ?? f.url);
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  const IMG = path.join(ROOT, 'assets', 'img', 'vehicles'), tmp = path.join(IMG, `${id}.orig`);
  fs.mkdirSync(IMG, { recursive: true });
  fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  // the crop: --crop WxH+X+Y in the original's pixels, to keep the vehicle and lose the rest
  const crop = opts.crop ? ['-crop', opts.crop.replace(/\d+/g, v => Math.round(+v * (1600 / f.width)))] : [];
  execFileSync('convert', [tmp, '-auto-orient', ...crop, '+repage', '-resize', '1024x1024>', '-strip', '-quality', '76', path.join(IMG, `${id}.jpg`)]);
  execFileSync('convert', [path.join(IMG, `${id}.jpg`), '-resize', '640x640>', '-strip', '-quality', '78', path.join(IMG, `${id}-s.jpg`)]);
  fs.rmSync(tmp);
  const [w, h] = execFileSync('identify', ['-format', '%w %h', path.join(IMG, `${id}.jpg`)]).toString().split(' ').map(Number);
  m.photo = {
    src: `/assets/img/vehicles/${id}.jpg`, w, h,
    author: (text(meta, 'Artist') || 'Unknown').slice(0, 120), license, license_url: meta.LicenseUrl?.value ?? '', source: f.descriptionurl,
  };
  save();
  console.log(`${id}: ${w}×${h}, ${license}, ${m.photo.author}`);
} else if (cmd === 'cities') {
  const { FLEETS } = await import(pathToFileURL(path.join(ROOT, 'core', 'js', 'fleets.js')));
  const ids = [...fs.readFileSync(path.join(ROOT, '_data', 'cities.yml'), 'utf8').matchAll(/^- id: (\S+)$/gm)].map(m => m[1]);
  data.cities = {};
  for (const c of ids) {
    const f = FLEETS[c];
    if (!f) continue;
    const js = fs.readFileSync(path.join(ROOT, c, 'city.js'), 'utf8');
    const traffic = js.match(/^export const TRAFFIC = (.*);$/m)?.[1] ?? '';
    const mix = [...traffic.matchAll(/\['(\w+)', [\d.]+\]/g)].map(m => m[1]);
    const taxi = traffic.match(/taxi: \{ type: '(\w+)'/)?.[1];
    const list = [f.tram && `tram-${f.tram}`, f.bus && (f.bus === 'double' ? 'double' : `bus-${f.bus}`), `police-${f.police}`,
      ...mix.filter(t => t !== 'double'), taxi === 'cab' ? 'cab' : c === 'new-york' ? 'taxi-ny' : null];
    data.cities[c] = [...new Set(list.filter(m => m && data.models.some(d => d.id === m)))];
  }
  save();
  for (const [c, l] of Object.entries(data.cities)) console.log(`${c}: ${l.join(', ')}`);
} else if (cmd === 'shots') {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  let chromium;
  try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright'))); }
  const ids = rest.length > 1 ? rest.slice(1) : data.models.map(m => m.id);
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
    page.on('pageerror', e => console.log('pageerror', e.message.slice(0, 300)));
    for (const m of ids) {
      await page.goto(`http://localhost:8321/core/models.html?model=${m}`);
      await page.waitForFunction(() => document.body.dataset.ready, null, { timeout: 60000 });
      const png = path.join(ROOT, 'tools', 'cache', 'vehicles', `${m}-model.png`), out = path.join(ROOT, 'assets', 'img', 'vehicles', `${m}-model.webp`);
      await page.locator('canvas').screenshot({ path: png, omitBackground: true });
      execFileSync('convert', [png, '-trim', '+repage', '-resize', '720x400>', '-quality', '82', out]);
      console.log(`${m}: ${path.relative(ROOT, out)}`);
    }
  } finally { await browser.close(); }
} else {
  console.error('usage: node tools/vehicles.mjs find <id|all> [--n 24]\n       node tools/vehicles.mjs add <id> "File.jpg" [--crop WxH+X+Y]\n       node tools/vehicles.mjs cities');
  process.exit(1);
}
