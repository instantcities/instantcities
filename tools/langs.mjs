// The site's languages and where a city's pages are in each (_data/home.yml: langs, _data/lang/<lang>.yml:
// cities: <id>: { slug }, paths): /<lang>/<slug>/ for a city's page, /<lang>/<slug>/<paths.guide>/ for its
// guide, <paths.places> for its places and landmarks and <paths.landmark>/<id>/ for a landmark. Shared by
// tools/langpages.mjs, about.mjs and landmarks.mjs, which write those pages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

export const langs = read('_data/home.yml').match(/^langs: \[(.+?)\]/m)[1].split(',').map(l => l.trim());

const slugsOf = Object.fromEntries(langs.map(lang => [lang,
  Object.fromEntries([...read(`_data/lang/${lang}.yml`).matchAll(/^ {2}([a-z-]+): \{ slug: ([a-z-]+),/gm)].map(m => [m[1], m[2]]))]));
const pathsOf = Object.fromEntries(langs.map(lang => {
  const m = read(`_data/lang/${lang}.yml`).match(/^paths: \{ guide: (\S+), places: (\S+), landmark: (\S+) \}/m);
  return [lang, { guide: m[1].replace(/,$/, ''), places: m[2].replace(/,$/, ''), landmark: m[3] }];
}));

// the folder of a city's page in a language, from the site's root: fr/gand
export const cityDir = (lang, id) => `${lang}/${slugsOf[lang][id] ?? id}`;
// the folder of one of its other pages: page 'guide', 'places' or 'landmark' (then with the landmark's id)
export const pageDir = (lang, id, page, landmark) => `${cityDir(lang, id)}/${pathsOf[lang][page]}${landmark ? `/${landmark}` : ''}`;

export function write(file, text) {
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, file), text);
}
// a page of the site in a language (its words and where it lies are in front matter only)
export const front = (fields) => `---\n${Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n`;
