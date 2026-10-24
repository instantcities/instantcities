#!/usr/bin/env node
// Each city's game pages, in its play/ folder (played at /<city>/play/; the city's own page at
// /<city>/ is the site's, _layouts/city.html), from the shared ones in core/: the game
// (core/game.html -> <city>/play/index.html), the developer's asset viewer (core/dev.html ->
// <city>/play/dev.html), the facade lab where the city has fronts to draw (core/facade-lab.html, if
// <city>/spots.json is there), the list of its shops and restaurants (core/places.html, reading
// <city>/places.json from tools/places.mjs) and the offline worker (<city>/play/sw.js, which runs
// core/sw.js). The words that differ per city, its name and what search
// engines and shares show, come from <city>/page.json, and the loading screen's scene from
// <city>/loader.html; {{key}} in a page is that key's value.
//
//     node tools/pages.mjs            # every city (a folder with a page.json)
//     node tools/pages.mjs lecce
//
// Run it after changing anything in core/*.html or a page.json; the pages it writes are checked in,
// as the site has no build step (GitHub Pages serves the folders as they are).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// the site's address (url in _config.yml), for the page's canonical and share links: {{site}}
const SITE = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8').match(/^url:\s*(\S+)/m)[1];
const cities = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(ROOT).filter(d => fs.existsSync(path.join(ROOT, d, 'page.json')));

// the template's own comment at the top gives way to one saying where the page comes from
const fill = (html, page, file) => html
  .replace(/^<!doctype html>\n<!--.*?-->\n/is, `<!doctype html>\n<!-- ${page.id}: made from core/${file} by \`node tools/pages.mjs\`, do not edit by hand. -->\n`)
  .replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in page)) throw new Error(`${page.id}/page.json has no "${k}" (asked for by ${file})`);
    return page[k];
  });

for (const id of cities) {
  const dir = path.join(ROOT, id), play = path.join(dir, 'play');
  fs.mkdirSync(play, { recursive: true });
  // style: CSS for the page's head, e.g. the city's colours (the variables at the top of
  // core/style.css); loader: the scene on the loading screen, from <city>/loader.html
  const page = { style: '', site: SITE, ...JSON.parse(fs.readFileSync(path.join(dir, 'page.json'), 'utf8')), loader: fs.readFileSync(path.join(dir, 'loader.html'), 'utf8') };
  const pages = [['game.html', 'index.html'], ['dev.html', 'dev.html'], ['places.html', 'places.html']];
  if (fs.existsSync(path.join(dir, 'spots.json'))) pages.push(['facade-lab.html', 'facade-lab.html']);
  for (const [from, to] of pages) {
    fs.writeFileSync(path.join(play, to), fill(fs.readFileSync(path.join(ROOT, 'core', from), 'utf8'), page, from));
  }
  fs.writeFileSync(path.join(play, 'sw.js'), `// ${id}: made by \`node tools/pages.mjs\`, do not edit by hand. The offline copy of this city's game
// (core/sw.js), registered from here so that it looks after this folder (the game), not the city's page.
importScripts('../../core/sw.js');
`);
  console.error(`${id}/play/: ${pages.map(p => p[1]).join(', ')}, sw.js`);
}
