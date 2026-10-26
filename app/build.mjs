#!/usr/bin/env node
// The native app's copy of the game (app/www/, which Capacitor puts in the iOS app), laid out as the
// website is, so the game's own paths (core/ two folders up, the city one up, a door to
// /ghentinside/play/) work unchanged: every city's code in <city>/, its game page in <city>/play/,
// the shared code and sounds in core/, and at the root a page to pick a city (made here from
// _data/cities.yml). What the website loads from the internet is kept here instead, so the app plays
// without a network from its first start: Three.js (vendor/three/) and the fonts (fonts/). The game
// pages lose what only the website needs: the offline worker (sw.js) and the links
// to the website, which lead back to the city picker instead.
//
//     npm run build        # app/www/ from the checked-in game, then `npx cap sync ios`
//     npm run ios          # the same, synced, and opened in Xcode
//
// The pages are made here from core/game.html, as tools/pages.mjs makes <city>/play/index.html,
// rather than taken from those: a checked-in copy that lags behind the template once froze the
// Ghent app on its loading screen.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(APP, '..');
const WWW = path.join(APP, 'www');
const MODULES = path.join(APP, 'node_modules');
const SITE = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8').match(/^url:\s*(\S+)/m)[1];

const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
};

fs.rmSync(WWW, { recursive: true, force: true });

// the cities: a folder with a page.json (ghentinside too, the inside of Ghent's churches, which the
// picker leaves out: the game goes there through a church door)
const cities = fs.readdirSync(ROOT).filter(d => fs.existsSync(path.join(ROOT, d, 'page.json')));

// each city's code: its .js files, in subfolders too (its .json files are only what tools/ makes
// those from; play/ has the website's pages and worker; its other folders are site pages). The app
// serves its root index.html (the picker) for any address without a file name, so a door to a
// city's game, like ghentinside's back out to /ghent/play/?pos=…, names the page.
for (const id of cities) {
  for (const f of fs.readdirSync(path.join(ROOT, id), { recursive: true })) {
    if (!f.endsWith('.js') || f.startsWith('play/')) continue;
    copy(path.join(ROOT, id, f), path.join(WWW, id, f));
    const js = fs.readFileSync(path.join(WWW, id, f), 'utf8');
    if (/\/play\/[?`'"]/.test(js)) fs.writeFileSync(path.join(WWW, id, f), js.replace(/\/play\/(?=[?`'"])/g, '/play/index.html'));
  }
}
// the shared code, its stylesheet, pictures and sounds (not the page templates, nor the dev pages' code),
// and the paintings and statues that hang inside (core/js/inside/photo.js)
copy(path.join(ROOT, 'core/style.css'), path.join(WWW, 'core/style.css'));
copy(path.join(ROOT, 'core/sounds'), path.join(WWW, 'core/sounds'));
copy(path.join(ROOT, 'core/img'), path.join(WWW, 'core/img'));
copy(path.join(ROOT, 'assets/img/art'), path.join(WWW, 'assets/img/art'));
copy(path.join(ROOT, 'assets/logo.svg'), path.join(WWW, 'assets/logo.svg'));
for (const f of fs.readdirSync(path.join(ROOT, 'core/js'), { recursive: true })) {
  if (!['dev.js', 'facade-lab.js', 'places.js'].includes(f) && fs.statSync(path.join(ROOT, 'core/js', f)).isFile()) {
    copy(path.join(ROOT, 'core/js', f), path.join(WWW, 'core/js', f));
  }
}

// Three.js, and only the addons the game imports (examples/jsm is tens of MB)
copy(path.join(MODULES, 'three/build/three.module.js'), path.join(WWW, 'vendor/three/build/three.module.js'));
const code = fs.readdirSync(WWW, { recursive: true }).filter(f => f.endsWith('.js')).map(f => path.join(WWW, f));
const addons = new Set(code.flatMap(f => [...fs.readFileSync(f, 'utf8').matchAll(/three\/addons\/([\w/.-]+\.js)/g)].map(m => m[1])));
for (const a of addons) copy(path.join(MODULES, 'three/examples/jsm', a), path.join(WWW, 'vendor/three/examples/jsm', a));

// the fonts, as the website asks Google for them: Inter 400-800, Nunito 700/800/900, Lilita One and
// Source Serif 4 600/700, Latin letters (with the accents of the game's languages), woff2 only
// (every iOS that runs Capacitor reads it). Taken from <weight>.css, as only that one gives each
// face its unicode-range: without it, the fonts claim every character and the emoji come out as boxes.
const fonts = [['inter', 400], ['inter', 500], ['inter', 600], ['inter', 700], ['inter', 800],
  ['nunito', 700], ['nunito', 800], ['nunito', 900], ['lilita-one', 400], ['source-serif-4', 600], ['source-serif-4', 700]];
let css = '';
for (const [name, weight] of fonts) {
  const all = fs.readFileSync(path.join(MODULES, '@fontsource', name, `${weight}.css`), 'utf8');
  for (const subset of ['latin', 'latin-ext']) {
    const face = all.match(new RegExp(`/\\* ${name}-${subset}-${weight}-normal \\*/\\s*@font-face \\{[^}]*\\}`))?.[0]
      .replace(/src: url\(\.\/files\/([\w-]+\.woff2)\) format\('woff2'\)[^;]*;/, (_, file) => {
        copy(path.join(MODULES, '@fontsource', name, 'files', file), path.join(WWW, 'fonts', file));
        return `src: url(${file}) format('woff2');`;
      });
    if (!face?.includes("format('woff2');") || !face.includes('unicode-range')) {
      throw new Error(`@fontsource/${name} ${weight}.css has no ${subset} face to keep`);
    }
    css += face + '\n';
  }
}
fs.writeFileSync(path.join(WWW, 'fonts/fonts.css'), css);

// each city's game page: core/game.html filled in the way tools/pages.mjs does it. The links to the
// website (the corner link, the menu's 🌐 chip and the pause menu's way back) go to the city picker.
const template = fs.readFileSync(path.join(ROOT, 'core/game.html'), 'utf8');
// the menu's own city picker ({{city_links}}): every city with a game, in the site's order, as
// tools/pages.mjs makes it, but naming each page (see above)
const playable = [...fs.readFileSync(path.join(ROOT, '_data/cities.yml'), 'utf8').matchAll(/^- id: (\S+)\n {2}name: (.+)$/gm)]
  .map(([, id, name]) => ({ id, name: name.replace(/^["']|["']$/g, '') }))
  .filter(c => cities.includes(c.id));
const cityLinks = id => playable.map(c => `<a class="chip${c.id === id ? ' on' : ''}" role="option" href="../../${c.id}/play/index.html">${c.name}</a>`).join('');
const pages = {};
for (const id of cities) {
  const page = { style: '', site: SITE, loader_jokes: [], ...JSON.parse(fs.readFileSync(path.join(ROOT, id, 'page.json'), 'utf8')),
    loader: fs.readFileSync(path.join(ROOT, id, 'loader.html'), 'utf8') };
  page.city ??= page.name.replace(/^Instant /, '');
  page.city_links = cityLinks(id);
  pages[id] = page;
  let html = template
    .replace(/^<!doctype html>\n<!--.*?-->\n/is, `<!doctype html>\n<!-- The iOS app's copy of ${id}/play/index.html: made by \`npm run build\` in app/, do not edit by hand. -->\n`)
    .replace(/\{\{(\w+)\}\}/g, (_, k) => {
      if (!(k in page)) throw new Error(`${id}/page.json has no "${k}" (asked for by core/game.html)`);
      return typeof page[k] === 'string' ? page[k] : JSON.stringify(page[k]);
    });
  const edit = (what, from, to) => {
    const next = html.replace(from, to);
    if (next === html) throw new Error(`core/game.html: could not find ${what}, has it changed?`);
    html = next;
  };
  edit('the site icons', /\s*<link rel="icon"[^>]*>\s*<link rel="apple-touch-icon"[^>]*>/, '');
  edit('the Google Fonts links', /\s*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">[\s\S]*?<link href="https:\/\/fonts\.googleapis\.com[^>]*>/,
    '\n  <link rel="stylesheet" href="../../fonts/fonts.css">');
  edit('Three.js from the CDN', '"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"', '"../../vendor/three/build/three.module.js"');
  edit('the Three.js addons from the CDN', '"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"', '"../../vendor/three/examples/jsm/"');
  edit('the dev link', /\s*<a class="site-link dev-link"[^>]*>Dev<\/a>/, '');
  edit('the links to the website', /<a class="site-link" href="\.\.\/" data-site-link data-i18n="site\.back"><\/a>/g,
    '<a class="site-link" href="../../index.html">← Cities</a>');
  edit("the menu's website chip", '<a class="chip site-chip" href="../" data-site-link data-i18n="site.chip"></a>',
    '<a class="chip site-chip" href="../../index.html">🏙️ Cities</a>');
  edit("the pause menu's way back to the website", /<span class="long" data-i18n="pause\.site"><\/span><span class="short" data-i18n="pause\.siteShort"><\/span>/,
    '<span class="long">Back</span><span class="short">Back</span>'); // (to the in-app page the game was opened from)
  edit('the offline worker', /\s*<script>\s*\/\/ Keep a copy of the game for playing offline[\s\S]*?<\/script>/, '');
  const at = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '').replace(/<(meta|link rel="canonical")[^>]*>/g, '');
  const net = at.match(/https?:\/\/(?!www\.openstreetmap\.org\/copyright)[^\s"'<]+/g)?.filter(u => !u.startsWith(SITE));
  if (net?.length) throw new Error(`${id}: the app page still loads something from the internet: ${net.join(', ')}`);
  fs.mkdirSync(path.join(WWW, id, 'play'), { recursive: true });
  fs.writeFileSync(path.join(WWW, id, 'play/index.html'), html);
}

// the city picker, the app's first page: the cities in the site's order (_data/cities.yml, the
// best-known first), each with its country and the line from its card on the site's cities page
const listed = fs.readFileSync(path.join(ROOT, '_data/cities.yml'), 'utf8').split(/^- /m).slice(1).map(block => {
  const field = k => block.match(new RegExp(`^\\s*${k}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1];
  return { id: field('id'), name: field('name'), country: field('country'), card: field('card'), soon: field('soon') === 'true' };
}).filter(c => !c.soon && pages[c.id]);
if (listed.length < 2) throw new Error('_data/cities.yml: found no cities, has it changed?');
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// each city's pages from the website, inside the app: its own page (_layouts/city.html, the
// picker's About), its landmarks' pages, "About the city" and the list of its places, the art in
// its museums, and the site's about, privacy and terms pages, built by Jekyll into app/build/site/
// and kept at the same addresses, as index.html. Their links stay in the app for every page it
// has (the game, the picker for the home and cities pages); only the links to other sites (the
// photos' sources, OpenStreetMap) leave it. The pictures they show come along, the lettering comes
// from fonts/ instead of Google, and each landmark's and painting's card gets a button straight
// into the game where the place is in it. Jekyll needs the site's gems (`bundle install` in the
// repo); Homebrew's Ruby 3.3 has them where it is there.
const SITE_OUT = path.join(APP, 'build/site');
const ruby33 = '/opt/homebrew/opt/ruby@3.3/bin';
execFileSync('bundle', ['exec', 'jekyll', 'build', '--quiet', '--destination', SITE_OUT], { cwd: ROOT, stdio: 'inherit',
  env: { ...process.env, LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8', PATH: (fs.existsSync(ruby33) ? `${ruby33}:` : '') + process.env.PATH } });
const inApp = new Set(listed.map(c => c.id));
const sitePages = [...listed.map(c => c.id), 'art', 'about', 'privacy', 'terms'].flatMap(dir =>
  fs.readdirSync(path.join(SITE_OUT, dir), { recursive: true }).map(f => path.join(dir, f))
    .filter(f => f.endsWith('index.html') && !f.includes('/play/')));
const included = new Set(sitePages);
const pictures = new Set();
const local = url => {
  const [, where, rest = ''] = url.match(/^([^?#]*)(.*)$/);
  if (where.startsWith('/assets/')) { pictures.add(where); return where; }
  if (where.startsWith('/fonts/')) return where;
  if (where === '/' || where === '/cities/') return '/index.html';
  const game = where.match(/^\/([a-z0-9-]+)\/play\/$/);
  if (game && inApp.has(game[1])) return `${where}index.html${rest}`;
  if (where.endsWith('/') && included.has(`${where.slice(1)}index.html`)) return `${where}index.html${rest}`;
  return SITE + url;
};
// the game's address for a landmark's or a painting's page, where the place is in the game (a
// position, a sight or a building to go inside, not only the city)
const in3d = href => {
  const file = path.join(SITE_OUT, href, 'index.html');
  const play = fs.existsSync(file) && fs.readFileSync(file, 'utf8').match(/<a class="play" href="([^"]+)"/)?.[1];
  return play && /[?&](pos|at|inside)=/.test(play) ? play.replace(/&amp;/g, '&') : null;
};
const cardButtons = `
  <style>
    .card-3d { display: flex; flex-direction: column; gap: 6px; }
    .card-3d > .card { flex: 1; }
    .card-3d > .in-3d-btn { display: block; text-align: center; padding: 8px; border: 1.5px solid var(--ink); border-radius: 6px; font-size: 14px; font-weight: 600; color: var(--ink); text-decoration: none; }
  </style>`;
for (const f of sitePages) {
  let html = fs.readFileSync(path.join(SITE_OUT, f), 'utf8');
  const fonts = html.replace(/\s*<link rel="preconnect" href="https:\/\/fonts\.g[^>]*>/g, '')
    .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="/fonts/fonts.css">');
  if (fonts === html || fonts.includes('fonts.googleapis')) throw new Error(`${f}: could not find the Google Fonts links, has _includes/head.html changed?`);
  html = fonts.replace(/<a class="card (landmark-card|art-card)" href="([^"]+)">([\s\S]*?)<\/a>/g, (card, _, href) => {
    const play = in3d(href);
    return play ? `<div class="card-3d">${card}<a class="in-3d-btn" href="${play.replace(/&/g, '&amp;')}">Visit in 3D</a></div>` : card;
  }).replace('</head>', `${cardButtons}\n</head>`);
  html = html.replace(/\b(href|src|data-src)="(\/[^"]*)"/g, (_, attr, url) => `${attr}="${local(url)}"`);
  copy(path.join(SITE_OUT, f), path.join(WWW, f));
  fs.writeFileSync(path.join(WWW, f), html.replace(/^<!doctype html>\n?/i,
    `<!doctype html>\n<!-- The iOS app's copy of the website's /${path.dirname(f)}/: made by \`npm run build\` in app/, do not edit by hand. -->\n`));
}
// the game's way back to the page it was opened from (core/js/game/menu.js, ?from=<landmark> or
// ?from=art:<piece>) names the page too
const menu = path.join(WWW, 'core/js/game/menu.js');
const back = fs.readFileSync(menu, 'utf8').replace('`../../art/${art}/`', '`../../art/${art}/index.html`').replace('`../landmark/${from}/`', '`../landmark/${from}/index.html`');
if (!back.includes('art/${art}/index.html') || !back.includes('landmark/${from}/index.html')) throw new Error("core/js/game/menu.js: could not find siteBack()'s pages, has it changed?");
fs.writeFileSync(menu, back);
for (const p of pictures) if (fs.existsSync(path.join(SITE_OUT, p))) copy(path.join(SITE_OUT, p), path.join(WWW, p));

// a square photo per city for its card in the picker: its first landmark with one (_data/landmarks/<city>.json)
const thumb = id => {
  const file = path.join(ROOT, '_data/landmarks', `${id}.json`);
  const src = fs.existsSync(file) && JSON.parse(fs.readFileSync(file, 'utf8')).find(l => l.photo)?.photo.src.replace(/\.jpg$/, '-s.jpg');
  if (!src || !fs.existsSync(path.join(ROOT, src))) return '';
  copy(path.join(ROOT, src), path.join(WWW, src));
  return `<img src="${src.slice(1)}" alt="" width="72" height="72">`;
};
fs.writeFileSync(path.join(WWW, 'index.html'), `<!doctype html>
<!-- The iOS app's first page, the city picker: made by \`npm run build\` in app/, do not edit by hand. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
  <title>Instant Cities</title>
  <link rel="stylesheet" href="fonts/fonts.css">
  <style>
    :root { color-scheme: light dark; --bg: #fff; --ink: #111; --muted: #6b6b6b; --line: #111; --press: #f0f0f0; }
    @media (prefers-color-scheme: dark) { :root { --bg: #111; --ink: #f4f4f4; --muted: #a0a0a0; --line: #f4f4f4; --press: #222; } }
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { margin: 0; height: 100%; overflow: hidden; background: var(--bg); color: var(--ink); font-family: Inter, system-ui, sans-serif; -webkit-user-select: none; user-select: none; }
    /* the app keeps its web view from scrolling (capacitor.config.json, for the game), so the list scrolls in here */
    main { position: fixed; inset: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
    .page { max-width: 960px; margin: 0 auto; padding: calc(env(safe-area-inset-top) + 24px) calc(env(safe-area-inset-right) + 16px) calc(env(safe-area-inset-bottom) + 24px) calc(env(safe-area-inset-left) + 16px); }
    header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    header img { width: 40px; height: 40px; }
    h1 { font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -.3px; }
    header p { margin: 1px 0 0; color: var(--muted); font-size: 14px; font-weight: 500; }
    ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }
    li { display: grid; grid-template-columns: 72px 1fr; gap: 6px 12px; padding: 12px; border: 1.5px solid var(--line); border-radius: 6px; }
    li > img { width: 72px; height: 72px; border-radius: 4px; object-fit: cover; grid-row: span 2; }
    strong { display: block; font-size: 19px; font-weight: 700; }
    small { display: block; color: var(--muted); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .6px; }
    p { margin: 3px 0 0; font-size: 14px; line-height: 1.35; }
    .btns { grid-column: 2; display: flex; gap: 8px; margin-top: 4px; }
    .btns a { flex: 1; text-align: center; padding: 8px 0; border: 1.5px solid var(--line); border-radius: 4px; font-size: 14px; font-weight: 700; color: var(--ink); text-decoration: none; }
    .btns a.play { background: var(--ink); color: var(--bg); }
    .btns a:active { opacity: .7; }
  </style>
</head>
<body>
  <main><div class="page">
    <header>
      <img src="assets/logo.svg" alt="">
      <div><h1>Instant Cities</h1><p>Pick a city to play</p></div>
    </header>
    <ul>
${listed.map(c => `      <li>${thumb(c.id)}<div><small>${esc(c.country)}</small><strong>${esc(c.name)}</strong><p>${esc(c.card)}</p></div><div class="btns"><a class="play" href="${c.id}/play/index.html">Play</a><a href="${c.id}/index.html">About</a></div></li>`).join('\n')}
    </ul>
  </div></main>
</body>
</html>
`);

const size = dir => fs.readdirSync(dir, { withFileTypes: true, recursive: true })
  .filter(e => e.isFile()).reduce((n, e) => n + fs.statSync(path.join(e.parentPath, e.name)).size, 0);
console.error(`app/www: ${(size(WWW) / 1e6).toFixed(1)} MB, ${listed.length} cities in the picker (${cities.length} game pages), addons: ${[...addons].join(', ') || 'none'}`);
