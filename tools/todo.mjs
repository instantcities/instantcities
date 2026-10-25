#!/usr/bin/env node
// What is left to colour from photos: every street of the map with house fronts on it, by wijk
// (tools/streets/<city>/wijken.json), and how far along it is. Writes tools/streets/<city>/TODO.md
// and prints the totals.
//
//     node tools/todo.mjs ghent
//
// A street's state, worked out from what is on disk:
//   todo        nothing yet
//   photos      tools/street.mjs has found its fronts (street.json), tools/looks.mjs not run yet
//   no photos   street.json, but Mapillary has no photo of any of its fronts
//   partial     in <city>/looks.js, but under half of its fronts have a colour
//   sampled     in <city>/looks.js
//   hand-drawn  (nearly) all its fronts are drawn by hand (<city>/fronts.js, streets.js)
// The box in front of a street is for checking it by eye (the contact sheet of tools/looks.mjs,
// then in the game): tick it in TODO.md, and it stays ticked the next time this runs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { standIns } from './nothree.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const dir = path.join(HERE, 'streets', city ?? '');
if (!city || !fs.existsSync(path.join(dir, 'wijken.json'))) {
  console.error('usage: node tools/todo.mjs <city>   (needs tools/streets/<city>/wijken.json)');
  process.exit(1);
}
const { MAP } = await import(pathToFileURL(path.join(HERE, '..', city, 'map.js')));
const looksFile = path.join(HERE, '..', city, 'looks.js');
const LOOKS = fs.existsSync(looksFile) ? (await import(pathToFileURL(looksFile))).LOOKS : {};
const { wijken } = JSON.parse(fs.readFileSync(path.join(dir, 'wijken.json'), 'utf8'));
const out = path.join(dir, 'TODO.md');

// as tools/street.mjs names a street's folder, and core/js/scenery.js keys a building in LOOKS
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const centre = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
const key = ([x, z]) => `${+x.toFixed(1)},${+z.toFixed(1)}`;
const coloured = new Set(Object.values(LOOKS).flatMap(Object.keys));

// the fronts drawn by hand, as tools/looks.mjs finds them
const drawn = ['fronts.js', 'streets.js'].flatMap(name => {
  const file = path.join(HERE, '..', city, name);
  return fs.existsSync(file) ? [...fs.readFileSync(file, 'utf8').matchAll(/\bat: \[(-?[\d.]+), (-?[\d.]+)\]/g)].map(m => [+m[1], +m[2]]) : [];
});
const byHand = c => drawn.some(([x, z]) => Math.hypot(x - c[0], z - c[1]) < 3);

// every street with house fronts: how many, how many have a colour, how many are drawn by hand
const streets = new Map();
for (const b of MAP.buildings) {
  if (b.fe == null || b.st == null) continue;
  const name = MAP.names[b.st], c = centre(b.p);
  const s = streets.get(name) ?? { name, fronts: 0, coloured: 0, hand: 0, at: [] };
  s.fronts++; s.at.push(c);
  if (coloured.has(key(c))) s.coloured++;
  else if (byHand(c)) s.hand++;
  streets.set(name, s);
}

// a street's middle: of its road on the map, or else of its houses
const roadPts = new Map();
for (const r of MAP.roads) {
  if (r.n == null) continue;
  const a = roadPts.get(MAP.names[r.n]) ?? [0, 0, 0];
  for (let k = 0; k < r.p.length; k += 2) { a[0] += r.p[k]; a[1] += r.p[k + 1]; a[2]++; }
  roadPts.set(MAP.names[r.n], a);
}
const middle = name => {
  const r = roadPts.get(name), s = streets.get(name);
  return r ? [r[0] / r[2], r[1] / r[2]] : s ? [s.at.reduce((a, c) => a + c[0], 0) / s.fronts, s.at.reduce((a, c) => a + c[1], 0) / s.fronts] : null;
};
const anchors = Object.entries(wijken).flatMap(([w, names]) => names.map(n => {
  const m = middle(n);
  if (!m) console.warn(`wijken.json: ${n} (${w}) is not on the map`);
  return m && [w, ...m];
}).filter(Boolean));
const nearest = ([x, z]) => {
  let best = null, bd = Infinity;
  for (const [w, ax, az] of anchors) { const d = Math.hypot(ax - x, az - z); if (d < bd) { bd = d; best = w; } }
  return best;
};
// the wijk most of a street's houses are in (a long road runs through several)
const wijkOf = s => {
  const votes = new Map();
  for (const c of s.at) { const w = nearest(c); votes.set(w, (votes.get(w) ?? 0) + 1); }
  return [...votes].sort((a, b) => b[1] - a[1])[0][0];
};

const ticked = new Set(fs.existsSync(out) ? [...fs.readFileSync(out, 'utf8').matchAll(/^- \[x\] (.+?) · /gim)].map(m => m[1]) : []);
function stateOf(s) {
  const file = path.join(dir, slug(s.name), 'street.json');
  if (s.hand >= s.fronts * 0.9) return 'hand-drawn';
  if (LOOKS[slug(s.name)]) return s.coloured < (s.fronts - s.hand) / 2 ? 'partial' : 'sampled';
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')).fronts.some(f => f.photos?.length) ? 'photos' : 'no photos';
  return 'todo';
}

const DONE = new Set(['sampled', 'hand-drawn']);
const groups = new Map(Object.keys(wijken).map(w => [w, []]));
for (const s of streets.values()) {
  s.state = stateOf(s);
  s.done = s.state === 'hand-drawn' ? s.fronts : s.coloured + s.hand;
  groups.get(wijkOf(s)).push(s);
}
// What else of each wijk is in the game, for the overview: the city's own lists, as the game puts
// them together (core/js/city.js, with stand-ins for three.js and the browser: tools/nothree.mjs),
// each thing where it stands
standIns(city);
let C = {};
try { C = await import('../core/js/city.js'); } catch (e) { console.warn(`the overview leaves out landmarks and the like: ${e.message}`); }
const things = []; // { kind, name, at }
for (const l of C.LANDMARKS ?? []) if (l.foot?.[0]) things.push({ kind: 'landmark', name: l.name, at: centre(l.foot[0]) });
for (const q of C.SQUARES ?? []) if (q.p) things.push({ kind: 'square', name: q.name, at: centre(q.p) });
for (const m of C.MONUMENTS ?? []) if (m.name && m.x != null) things.push({ kind: 'monument', name: m.name, at: [m.x, m.z] });
for (const t of C.SIGHTS ?? []) things.push({ kind: 'sight', name: t.text?.nl?.name ?? t.text?.en?.name ?? t.id, at: [t.x, t.z] });
for (const f of C.FAMOUS ?? []) things.push({ kind: 'famous', name: f.name, at: [f.x, f.z] });
// the quarters whose ordinary houses have a front of their own
const quarters = (C.QUARTERS ?? []).filter(q => q.ring);
const inside = ([x, z], p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
const byWijk = new Map(Object.keys(wijken).map(w => [w, []]));
for (const t of things) byWijk.get(nearest(t.at))?.push(t);
const kindOf = (w, kind) => [...new Set(byWijk.get(w).filter(t => t.kind === kind).map(t => t.name))];
const names = (list, most = 10) => [...new Set(list)].slice(0, most).join(', ') + (new Set(list).size > most ? `, and ${new Set(list).size - most} more` : '');

const sum = (list, f) => list.reduce((a, s) => a + f(s), 0);
const pct = (a, b) => `${b ? Math.round((100 * a) / b) : 0}%`;
const all = [...streets.values()];
const order = [...groups].filter(([, list]) => list.length).sort((a, b) => sum(b[1], s => s.fronts) - sum(a[1], s => s.fronts));

const lines = [
  `# Gevels in kleur: ${city}`,
  '',
  `Written by \`node tools/todo.mjs ${city}\`; run it again after each street. Tick a street once its colours`,
  'are checked by eye (the contact sheet in tools/cache/looks/, then in the game): ticks are kept.',
  '',
  'One street: `node tools/street.mjs ' + city + ' "<street>"`, then `node tools/looks.mjs ' + city + ' <street-slug>`.',
  '',
  `**${sum(all, s => s.done)} / ${sum(all, s => s.fronts)} fronts done (${pct(sum(all, s => s.done), sum(all, s => s.fronts))})**, ` +
    `${all.filter(s => DONE.has(s.state)).length} / ${all.length} streets.`,
  '',
  '',
  '## The wijken on the map',
  '',
  `${order.length} of the city's ${Object.keys(wijken).length} wijken have house fronts on the map (the others lie outside it). ` +
    'Per wijk: how many streets and house fronts, how many of those are done (coloured from photos, ' +
    'or drawn by hand), and what is modelled in it on purpose: 3D landmarks (landmarks.js), squares with ' +
    'their own paving and drawn walls (squares.js), monuments (monuments.js), the sights on the tour ' +
    '(sights.js) and the places named on the big map (famous.js).',
  '',
  '| Wijk | Streets | Fronts | Done | Photo | By hand | Landmarks | Squares | Monuments | Sights | Named places |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ...order.map(([w, list]) => `| ${w} | ${list.length} | ${sum(list, s => s.fronts)} | ${pct(sum(list, s => s.done), sum(list, s => s.fronts))} | ` +
    `${sum(list, s => s.coloured)} | ${sum(list, s => s.hand)} | ${kindOf(w, 'landmark').length} | ${kindOf(w, 'square').length} | ` +
    `${kindOf(w, 'monument').length} | ${kindOf(w, 'sight').length} | ${kindOf(w, 'famous').length} |`),
];
for (const [w, list] of order) {
  const fronts = sum(list, s => s.fronts);
  lines.push('', `## ${w}`, '', `${list.length} streets, ${fronts} house fronts; ${sum(list, s => s.done)} done (${pct(sum(list, s => s.done), fronts)}): ` +
    `${sum(list, s => s.coloured)} coloured from photos, ${sum(list, s => s.hand)} drawn by hand` +
    (sum(list, s => s.done) > sum(list, s => s.coloured + s.hand) ? ', and streets drawn by hand all but a front or two.' : '.'), '');
  // its houses: in a quarter's own style, or Ghent's ordinary fronts
  const styled = quarters.map(q => [q, sum(list, s => s.at.filter(c => inside(c, q.ring)).length)]).filter(([, n]) => n);
  lines.push(`- **Houses:** besides the ones drawn by hand, ${styled.length ? styled.map(([q, n]) => `${n} stand in the ${q.name} quarter, with its own '${q.front}' fronts, and the rest have`).join(', ') : 'they have'} Ghent's ordinary fronts, in a colour picked by a hash unless coloured from photos.`);
  for (const [kind, label] of [['landmark', '3D landmarks'], ['square', 'Squares'], ['monument', 'Monuments'], ['sight', 'Tour sights'], ['famous', 'Named on the big map']]) {
    const found = kindOf(w, kind);
    if (found.length) lines.push(`- **${label}:** ${names(found, kind === 'famous' ? 8 : 12)}`);
  }
  lines.push('');
  for (const s of list.sort((a, b) => b.fronts - a.fronts || a.name.localeCompare(b.name))) {
    const detail = [s.coloured && `${s.coloured} coloured`, s.hand && s.state !== 'hand-drawn' && `${s.hand} by hand`].filter(Boolean).join(', ');
    lines.push(`- [${ticked.has(s.name) ? 'x' : ' '}] ${s.name} · ${s.fronts} front${s.fronts === 1 ? '' : 's'} · ${s.state}${detail ? ` (${detail})` : ''}`);
  }
}
fs.writeFileSync(out, lines.join('\n') + '\n');

console.log(`${sum(all, s => s.done)} / ${sum(all, s => s.fronts)} fronts done, ${all.length} streets -> ${path.relative(process.cwd(), out)}`);
for (const [w, list] of order) console.log(`  ${w.padEnd(60)} ${String(list.length).padStart(4)} streets ${String(sum(list, s => s.fronts)).padStart(6)} fronts ${pct(sum(list, s => s.done), sum(list, s => s.fronts)).padStart(5)}`);
