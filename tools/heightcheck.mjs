#!/usr/bin/env node
// Houses much lower than the rest of their street: in a city of row houses, a front two storeys or
// more below the fronts around it is most likely a mistake in the map (an outline that takes in a
// low shed, a house built after the height flights) rather than a real low house. Reads
// <city>/map.js and lists them by street, to look at in the game and in photos.
//
//     node tools/heightcheck.mjs ghent              # the whole city: writes tools/streets/ghent/HEIGHTS.md
//     node tools/heightcheck.mjs ghent Burgstraat   # one street: prints its low fronts
//
// A front is held against the other fronts of its street within 30 m of it (the middle height of
// them, so a run of two or three low houses still stands out). Its height is where its walls stop,
// as the game draws it: the measured eaves, else its storeys.
// Fronts drawn by hand (<city>/fronts.js, streets.js) are left out: they have been looked at.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [city, ...rest] = process.argv.slice(2);
if (!city || !fs.existsSync(path.join(HERE, '..', city ?? '', 'map.js'))) {
  console.error('usage: node tools/heightcheck.mjs <city> ["<street>"]');
  process.exit(1);
}
const only = rest.join(' ');
const { MAP } = await import(pathToFileURL(path.join(HERE, '..', city, 'map.js')));
const FLOOR = 3.4; // game metres a storey, as core/js/scenery.js
const LOWER = 2 * FLOOR; // this much below the street around it is suspect
const AROUND = 30, MIN = 4; // the fronts of the same street this near, and at least this many of them

// as tools/todo.mjs: a street's slug, a building's centre and its key in LOOKS, the fronts drawn by hand
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const centre = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
const drawn = ['fronts.js', 'streets.js'].flatMap(name => {
  const file = path.join(HERE, '..', city, name);
  return fs.existsSync(file) ? [...fs.readFileSync(file, 'utf8').matchAll(/\bat: \[(-?[\d.]+), (-?[\d.]+)\]/g)].map(m => [+m[1], +m[2]]) : [];
});
const byHand = c => drawn.some(([x, z]) => Math.hypot(x - c[0], z - c[1]) < 3);

// every front: its street, the middle of its front wall, its height
const fronts = [];
for (const b of MAP.buildings) {
  if (b.fe == null || b.st == null || b.h != null) continue; // towers stand on their own
  const n = b.p.length, e = 2 * b.fe, mid = [(b.p[e] + b.p[(e + 2) % n]) / 2, (b.p[e + 1] + b.p[(e + 3) % n]) / 2];
  fronts.push({ b, st: b.st, mid, h: b.e ?? b.f * FLOOR + 0.4, at: centre(b.p) });
}

// the street around each front (a grid keeps it quick), and the fronts well below its middle height
const cell = q => [Math.floor(q[0] / AROUND), Math.floor(q[1] / AROUND)], grid = new Map();
for (const f of fronts) { const k = cell(f.mid).join(); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(f); }
const lows = [];
for (const f of fronts) {
  const [gx, gz] = cell(f.mid), hs = [];
  for (let i = gx - 1; i <= gx + 1; i++) {
    for (let j = gz - 1; j <= gz + 1; j++) {
      for (const o of grid.get(`${i},${j}`) ?? []) if (o !== f && o.st === f.st && Math.hypot(o.mid[0] - f.mid[0], o.mid[1] - f.mid[1]) < AROUND) hs.push(o.h);
    }
  }
  if (hs.length < MIN) continue;
  const street = hs.sort((a, b) => a - b)[hs.length >> 1];
  if (f.h > street - LOWER || byHand(f.at)) continue;
  lows.push({ ...f, street: MAP.names[f.st], around: street, floors: Math.round((street - f.h) / FLOOR) });
}

const pos = ([x, z]) => `${x.toFixed(1)},${z.toFixed(1)}`;
const line = f => `${pos(f.at)}  walls ${f.h.toFixed(1)} m, the street around it ${f.around.toFixed(1)} m (${f.floors} storeys lower${f.b.t != null ? `, roof to ${f.b.t.toFixed(1)} m` : ''})`;
if (only) {
  const mine = lows.filter(f => slug(f.street) === slug(only));
  console.log(`${only}: ${mine.length} front${mine.length === 1 ? '' : 's'} much lower than the street around them`);
  for (const f of mine) console.log('  ' + line(f));
  process.exit(0);
}

// the whole city, by street, the streets with the most first
const byStreet = new Map();
for (const f of lows) byStreet.set(f.street, [...(byStreet.get(f.street) ?? []), f]);
const sorted = [...byStreet].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
const md = [
  '# Low fronts',
  '',
  `Written by \`node tools/heightcheck.mjs ${city}\`, do not edit by hand. Fronts at least two storeys lower than the`,
  'other fronts of their street around them, by street. In the game: `/' + city + '/?pos=x,z`.',
  '',
  `**${lows.length} of ${fronts.length} fronts, in ${byStreet.size} streets.**`,
  '',
  ...sorted.flatMap(([name, list]) => [`## ${name} (${list.length})`, '', ...list.map(f => `- ${line(f)}`), '']),
];
fs.writeFileSync(path.join(HERE, 'streets', city, 'HEIGHTS.md'), md.join('\n'));
console.log(`${lows.length} of ${fronts.length} fronts much lower than the street around them, in ${byStreet.size} streets; the worst:`);
for (const [name, list] of sorted.slice(0, 10)) console.log(`  ${name}: ${list.length}`);
