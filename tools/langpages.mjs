// Each city's page in each of the site's languages (_layouts/city.html): en/<id>/index.html,
// fr/<slug>/index.html, nl/<slug>/index.html, the slug its name in that language where
// _data/lang/<lang>.yml gives one (cities: <id>: { slug: ... }), else its id; and <id>/index.html,
// its address without a language, which sends a visitor on to theirs (_layouts/lang-redirect.html).
// They are only front matter; the words are in _data/cities.yml and _data/i18n/<lang>/<id>.yml.
//
//     node tools/langpages.mjs
//
// Run it after adding a city to _data/cities.yml, or a language or a slug to _data/lang/.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, text) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, f), text);
};

const ids = [...read('_data/cities.yml').matchAll(/^- id: (\S+)$/gm)].map(m => m[1]);
const langs = read('_data/home.yml').match(/^langs: \[(.+?)\]/m)[1].split(',').map(l => l.trim());

for (const lang of langs) {
  const yml = read(`_data/lang/${lang}.yml`);
  const slugs = Object.fromEntries([...yml.matchAll(/^ {2}([a-z-]+): \{ slug: ([a-z-]+),/gm)].map(m => [m[1], m[2]]));
  for (const id of ids) {
    write(`${lang}/${slugs[id] ?? id}/index.html`, `---\nlayout: city\ncity: ${id}\nlang: ${lang}\nref: city\n---\n`);
  }
  console.log(`${lang}/: ${ids.map(id => slugs[id] ?? id).join(', ')}`);
}
for (const id of ids) write(`${id}/index.html`, `---\nlayout: lang-redirect\nref: city\ncity: ${id}\n---\n`);
console.log(`${ids.length} cities, ${langs.length} languages`);
