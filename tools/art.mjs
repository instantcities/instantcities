#!/usr/bin/env node
// The famous paintings, statues and treasures in the buildings you can go into, on the site: the
// page of them all at /art/ (art/index.html, _layouts/art.html) and a page for each at /art/<id>/
// (_layouts/artwork.html), from _data/art.json. Each piece's photo comes from Wikimedia Commons (its
// `commons` file): assets/img/art/<id>.jpg (at most 1280 pixels along its longer side, for its page
// and to hang in the game, core/js/inside/photo.js) and <id>-s.jpg (at most 480, for the cards), its
// author, licence and source kept in _data/art_photos.json for the credit line.
//
//     node tools/art.mjs                 # the pages; pages of pieces no longer in the list go
//     node tools/art.mjs photos          # fetch the photos not yet there
//     node tools/art.mjs photos mona-lisa primavera   # fetch these again
//
// A piece: { id, title, local? (its name in its own language, or its other name), artist, date, kind
// ('painting' | 'fresco' | 'sculpture' | 'artefact'), medium, size, museum (a museum's id: the
// building's id in <city>/inside.js), room, commons (the file on Commons, without "File:"),
// view: [x, z, tx, tz] (where you stand in the building, in its own metres, and what you look at:
// the game's ?inside=<museum>&view=), blurb, text (paragraphs) }. A piece out in the open (its
// museum has `at`) has no view but pos: [x, z, yaw?] in the city's game metres, the game's
// ?pos=x,z&yaw=: with yaw, where you stand and the way you face (radians, 0: +z); without, where the
// piece stands, and the game puts you on a street a little way off, looking at it. With no pos
// either, the link is its museum's ?at=.
// A museum: { id, city, name, blurb, at? (a sight's id in <city>/site-sights.js: not a building
// you go into but a square, its link ?at=<sight>) }.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, '_data', 'art.json'), CREDITS = path.join(ROOT, '_data', 'art_photos.json');
const IMG = path.join(ROOT, 'assets', 'img', 'art'), PAGES = path.join(ROOT, 'art');
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const HEADERS = { 'User-Agent': 'Instant Cities art tool (https://instantcities.net)' };

const { museums, pieces } = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const [cmd, ...only] = process.argv.slice(2);

const ids = new Set();
for (const a of pieces) {
  if (!/^[a-z0-9-]+$/.test(a.id)) throw new Error(`art id "${a.id}" is not a-z, 0-9 and -`);
  if (ids.has(a.id)) throw new Error(`art id "${a.id}" twice`);
  const m = museums.find(m => m.id === a.museum);
  if (!m) throw new Error(`${a.id}: no museum "${a.museum}"`);
  if (!m.at && a.view?.length !== 4) throw new Error(`${a.id}: view is not [x, z, tx, tz]`);
  if (a.pos && a.pos.length !== 2 && a.pos.length !== 3) throw new Error(`${a.id}: pos is not [x, z] or [x, z, yaw]`);
  ids.add(a.id);
}
for (const m of museums) {
  if (m.at && !fs.readFileSync(path.join(ROOT, m.city, 'site-sights.js'), 'utf8').includes(`"id":"${m.at}"`)) throw new Error(`${m.id}: no sight "${m.at}" in ${m.city}/site-sights.js`);
}

if (cmd === 'photos') await photos(only.length ? pieces.filter(a => only.includes(a.id)) : pieces.filter(a => !fs.existsSync(path.join(IMG, a.id + '.jpg'))));
else pages();

function pages() {
  fs.mkdirSync(PAGES, { recursive: true });
  fs.writeFileSync(path.join(PAGES, 'index.html'), '---\nlayout: art\n---\n');
  for (const a of pieces) {
    fs.mkdirSync(path.join(PAGES, a.id), { recursive: true });
    fs.writeFileSync(path.join(PAGES, a.id, 'index.html'), `---\nlayout: artwork\nart: ${a.id}\n---\n`);
  }
  for (const old of fs.readdirSync(PAGES)) {
    if (old !== 'index.html' && !ids.has(old)) fs.rmSync(path.join(PAGES, old), { recursive: true });
  }
  const missing = pieces.filter(a => !fs.existsSync(path.join(IMG, a.id + '.jpg'))).map(a => a.id);
  console.error(`${pieces.length} pieces in ${museums.length} buildings and squares${missing.length ? `; no photo yet: ${missing.join(', ')} (node tools/art.mjs photos)` : ''}`);
}

// Each piece's photo from Commons, scaled down by Commons and then by sips (macOS) or ImageMagick,
// and its credit
async function photos(list) {
  fs.mkdirSync(IMG, { recursive: true });
  const credits = fs.existsSync(CREDITS) ? JSON.parse(fs.readFileSync(CREDITS, 'utf8')) : {};
  for (const a of list) {
    const q = new URLSearchParams({ action: 'query', format: 'json', titles: `File:${a.commons}`, prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '1600' });
    const page = Object.values((await (await fetch(`${COMMONS}?${q}`, { headers: HEADERS })).json()).query.pages)[0];
    const info = page.imageinfo?.[0];
    if (!info) { console.error(`${a.id}: no file ${a.commons} on Commons`); continue; }
    const res = await fetch(info.thumburl ?? info.url, { headers: HEADERS });
    if (!res.ok) { console.error(`${a.id}: ${res.status} for ${info.thumburl}`); continue; }
    const src = path.join(IMG, `${a.id}-orig`);
    fs.writeFileSync(src, Buffer.from(await res.arrayBuffer()));
    scale(src, path.join(IMG, `${a.id}.jpg`), 1280);
    scale(src, path.join(IMG, `${a.id}-s.jpg`), 480);
    fs.rmSync(src);
    const m = info.extmetadata ?? {}, text = k => (m[k]?.value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    credits[a.id] = {
      // a painting in the public domain is the painter's, whoever photographed it
      author: /^public domain/i.test(text('LicenseShortName')) ? a.artist : text('Artist') || 'Unknown',
      license: text('LicenseShortName') || 'See source',
      license_url: m.LicenseUrl?.value ?? '',
      source: info.descriptionurl,
    };
    console.error(`${a.id}: ${info.width}×${info.height}, ${credits[a.id].license}, ${credits[a.id].author}`);
  }
  const sorted = Object.fromEntries(Object.entries(credits).filter(([id]) => ids.has(id)).sort(([x], [y]) => x.localeCompare(y)));
  fs.writeFileSync(CREDITS, JSON.stringify(sorted, null, 2) + '\n');
}

function scale(from, to, max) {
  if (process.platform === 'darwin') execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', String(max), from, '--out', to], { stdio: 'ignore' });
  else execFileSync('convert', [from, '-resize', `${max}x${max}>`, '-quality', '82', to], { stdio: 'ignore' });
}
