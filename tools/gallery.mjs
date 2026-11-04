#!/usr/bin/env node
// The photos in the words of a landmark's page (`gallery` in _data/landmarks/<city>.json, shown
// between its paragraphs by _layouts/landmark.html), from Wikimedia Commons, with their credits.
//
//     node tools/gallery.mjs find pompeii casa-dei-vettii --category "House of the Vettii (Pompeii)"
//     node tools/gallery.mjs find pompeii forum --search "Pompeii forum"
//         the candidates: a numbered sheet of them, tools/cache/gallery/<city>/<id>.jpg, and their
//         file names in <id>.txt, to choose from (the category's subcategories one level down too)
//     node tools/gallery.mjs add pompeii casa-dei-vettii "File one.jpg=The atrium" "File two.jpg=The garden"
//         these files, in this order, with their captions: each to assets/img/photos/<city>/<id>-g<n>.jpg
//         (at most 1280 pixels along its longer side), its author, licence and source in `gallery`
//
// Only files under a free licence that allows reuse (CC0, CC BY, CC BY-SA, public domain) are taken.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const HEADERS = { 'User-Agent': 'Instant Cities gallery tool (https://instantcities.net)' };

const args = process.argv.slice(2), opts = {}, rest = [];
for (let k = 0; k < args.length; k++) {
  if (args[k].startsWith('--')) opts[args[k].slice(2)] = args[++k];
  else rest.push(args[k]);
}
const [cmd, city, id, ...files] = rest;
const DATA = path.join(ROOT, '_data', 'landmarks', `${city}.json`);
if (!['find', 'add'].includes(cmd) || !city || !id || !fs.existsSync(DATA)) {
  console.error('usage: node tools/gallery.mjs find <city> <id> [--category "..."] [--search "..."] [--n 40]\n       node tools/gallery.mjs add <city> <id> "File.jpg=caption" ...');
  process.exit(1);
}
const list = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const lm = list.find(l => l.id === id);
if (!lm) throw new Error(`no landmark "${id}" in ${DATA}`);

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
// a file from Commons' image server, again after a pause while it says too many requests
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

if (cmd === 'find') {
  const n = Number(opts.n ?? 40), titles = new Set();
  const members = async cat => (await api({ action: 'query', list: 'categorymembers', cmtitle: `Category:${cat}`, cmtype: 'file|subcat', cmlimit: '200' })).query.categorymembers;
  if (opts.category) {
    for (const c of opts.category.split('|')) {
      const top = await members(c);
      for (const m of top) if (m.ns === 6) titles.add(m.title);
      for (const s of top.filter(m => m.ns === 14).slice(0, 12)) for (const m of await members(s.title.slice(9))) if (m.ns === 6) titles.add(m.title);
    }
  }
  if (opts.search) for (const r of (await api({ action: 'query', list: 'search', srsearch: opts.search, srnamespace: '6', srlimit: '50' })).query.search) titles.add(r.title);
  const found = (await infos([...titles].filter(t => /\.(jpe?g|png)$/i.test(t)), 320))
    .filter(f => FREE.test(text(f.extmetadata ?? {}, 'LicenseShortName')) && Math.max(f.width, f.height) >= 1200)
    .slice(0, n);
  const dir = path.join(ROOT, 'tools', 'cache', 'gallery', city, id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const lines = [];
  for (const [k, f] of found.entries()) {
    const res = await get(f.thumburl);
    if (!res.ok) continue;
    await sleep(300);
    fs.writeFileSync(path.join(dir, `${String(k).padStart(2, '0')}.jpg`), Buffer.from(await res.arrayBuffer()));
    lines.push(`${k}\t${f.width}x${f.height}\t${text(f.extmetadata ?? {}, 'LicenseShortName')}\t${f.title.slice(5)}\t${text(f.extmetadata ?? {}, 'ImageDescription').slice(0, 140)}`);
  }
  const sheet = path.join(dir, '..', `${id}.jpg`);
  execFileSync('montage', ['-label', '%t', '-pointsize', '18', '-geometry', '320x240+4+4', '-tile', '6x', ...fs.readdirSync(dir).sort().map(f => path.join(dir, f)), sheet]);
  fs.writeFileSync(path.join(dir, '..', `${id}.txt`), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  console.log(`\n${sheet}`);
} else {
  const IMG = path.join(ROOT, 'assets', 'img', 'photos', city);
  fs.mkdirSync(IMG, { recursive: true });
  const asked = files.map(f => { const [file, ...cap] = f.split('='); return { file: file.replace(/^File:/, ''), caption: cap.join('=').trim() }; });
  const got = await infos(asked.map(a => `File:${a.file}`), 1600);
  const gallery = [];
  for (const [k, a] of asked.entries()) {
    const f = got.find(g => g.title.slice(5).replace(/ /g, '_') === a.file.replace(/ /g, '_'));
    if (!f) throw new Error(`no file "${a.file}" on Commons`);
    const m = f.extmetadata ?? {}, license = text(m, 'LicenseShortName');
    if (!FREE.test(license)) throw new Error(`${a.file}: licence "${license}" is not one we can use`);
    const res = await get(f.thumburl ?? f.url);
    if (!res.ok) throw new Error(`${a.file}: ${res.status}`);
    const name = `${id}-g${k + 1}.jpg`, tmp = path.join(IMG, `${name}.orig`);
    fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
    execFileSync('convert', [tmp, '-auto-orient', '-resize', '1280x1280>', '-strip', '-quality', '80', path.join(IMG, name)]);
    fs.rmSync(tmp);
    const [w, h] = execFileSync('identify', ['-format', '%w %h', path.join(IMG, name)]).toString().split(' ').map(Number);
    gallery.push({
      src: `/assets/img/photos/${city}/${name}`, w, h, caption: a.caption,
      author: (text(m, 'Artist') || 'Unknown').slice(0, 120), license, license_url: m.LicenseUrl?.value ?? '', source: f.descriptionurl,
    });
    console.error(`${name}: ${w}×${h}, ${license}, ${gallery.at(-1).author}`);
    await sleep(1500);
  }
  lm.gallery = gallery;
  fs.writeFileSync(DATA, JSON.stringify(list, null, 2) + '\n');
}
