// Each city's page in each of the site's languages (_layouts/city.html): en/<id>/index.html,
// fr/<slug>/index.html, nl/<slug>/index.html, the slug its name in that language where
// _data/lang/<lang>.yml gives one (cities: <id>: { slug: ... }), else its id; and <id>/index.html,
// its address without a language, which sends a visitor on to theirs (_layouts/lang-redirect.html); and
// each city's guide and its places and landmarks. They are only front matter; the words are in
// _data/cities.yml and _data/i18n/<lang>/ (<id>.yml, guide/<id>.yml, landmarks/<id>.yml).
//
//     node tools/langpages.mjs
//
// A city's landmark pages are written by tools/landmarks.mjs (they need to know where the landmark lies in the game).
// Run it after adding a city to _data/cities.yml, or a language or a slug to _data/lang/.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, langs, cityDir, pageDir, write, front } from './langs.mjs';

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const ids = [...read('_data/cities.yml').matchAll(/^- id: (\S+)$/gm)].map(m => m[1]);

for (const lang of langs) {
  for (const id of ids) write(`${cityDir(lang, id)}/index.html`, front({ layout: 'city', city: id, lang, ref: 'city' }));
  console.log(`${lang}/: ${ids.map(id => cityDir(lang, id).slice(3)).join(', ')}`);
}
for (const id of ids) write(`${id}/index.html`, front({ layout: 'lang-redirect', ref: 'city', city: id }));

// a city's guide and its places and landmarks (_data/about/<id>.json), in each language, and at their old addresses
// (/ghent/about-the-city/, /ghent/places-and-landmarks/) a page that sends a visitor on to theirs
for (const id of ids.filter(id => fs.existsSync(path.join(ROOT, '_data', 'about', `${id}.json`)))) {
  for (const [page, layout, old] of [['guide', 'about', 'about-the-city'], ['places', 'places', 'places-and-landmarks']]) {
    for (const lang of langs) write(`${pageDir(lang, id, page)}/index.html`, front({ layout, city: id, lang, ref: page }));
    write(`${id}/${old}/index.html`, front({ layout: 'lang-redirect', ref: page, city: id }));
  }
}
console.log(`${ids.length} cities, ${langs.length} languages`);
