#!/usr/bin/env node
// Where a landmark stands on a city's map, and the map's buildings there: to place a monument modelled
// by hand (<city>/<landmark>.js) on the map's outline of it, with its x, z and turn, and to see which
// of the map's blocks its `area` should take in.
//
//     node tools/near.mjs delft nieuwe-kerk          # a landmark of _data/landmarks/<city>.json
//     node tools/near.mjs delft 52.0123,4.36079 60   # a lat,lon, and how far round it to look (m)
//     node tools/near.mjs delft 237,-249 --game      # game metres
//
// Each building: its middle, its smallest rotated rectangle (length along `turn`, width across, game
// metres), its floors (f), measured eaves (e) and top (t), kind (k), and with --rings its outline (--all: past the nearest 30).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), flags = new Set(args.filter(a => a.startsWith('--'))), [city, at, r = '50'] = args.filter(a => !a.startsWith('--'));
if (!city || !at) { console.error('usage: node tools/near.mjs <city> <landmark id | lat,lon | x,z --game> [radius] [--rings]'); process.exit(1); }
const { MAP, game, S } = mapCoords(path.join(ROOT, city), city);
let x, z, name = at;
if (/^-?[\d.]+,-?[\d.]+$/.test(at)) {
  const [a, b] = at.split(',').map(Number);
  [x, z] = flags.has('--game') ? [a, b] : game(a, b);
} else {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, '_data', 'landmarks', `${city}.json`), 'utf8'));
  const lm = (Array.isArray(d) ? d : d.landmarks).find(l => l.id === at);
  if (!lm) { console.error(`no landmark ${at} in _data/landmarks/${city}.json`); process.exit(1); }
  [x, z] = game(lm.lat, lm.lon); name = lm.name;
}
console.log(`${name}: x ${x.toFixed(1)}, z ${z.toFixed(1)} (game metres, ${S} per real metre)`);

// the smallest rotated rectangle round a ring: [cx, cz, turn, length, width]
function box(p) {
  let best = null;
  for (let i = 0; i < p.length; i += 2) {
    const j = (i + 2) % p.length, a = Math.atan2(p[j + 1] - p[i + 1], p[j] - p[i]), c = Math.cos(a), s = Math.sin(a);
    let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
    for (let k = 0; k < p.length; k += 2) {
      const u = p[k] * c + p[k + 1] * s, v = -p[k] * s + p[k + 1] * c;
      u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v);
    }
    if (!best || (u1 - u0) * (v1 - v0) < best.area) {
      const um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
      best = { area: (u1 - u0) * (v1 - v0), cx: um * c - vm * s, cz: um * s + vm * c, turn: a, L: u1 - u0, W: v1 - v0 };
    }
  }
  if (best.L < best.W) Object.assign(best, { L: best.W, W: best.L, turn: best.turn + Math.PI / 2 });
  best.turn = Math.atan2(Math.sin(best.turn), Math.cos(best.turn));
  return best;
}
const near = MAP.buildings.map(b => ({ b, bx: box(b.p) })).map(o => ({ ...o, d: Math.hypot(o.bx.cx - x, o.bx.cz - z) }))
  .filter(o => o.d < +r).sort((a, b) => a.d - b.d);
// the little parts (columns, pinnacles: Pisa's map has every column of the tower) only counted
const small = near.filter(o => o.bx.L < 2), shown = near.filter(o => o.bx.L >= 2);
for (const { b, bx, d } of shown.slice(0, flags.has('--all') ? Infinity : 30)) {
  const f = (v) => v.toFixed(1);
  console.log(`  at ${f(bx.cx)}, ${f(bx.cz)} (${f(d)} m off): ${f(bx.L)} x ${f(bx.W)}, turn ${bx.turn.toFixed(3)}, f ${b.f}${b.e ? `, e ${b.e}` : ''}${b.t ? `, t ${b.t}` : ''}${b.h ? `, h ${b.h}` : ''}, ${b.k}${b.p.length > 8 ? `, ${b.p.length / 2} points` : ''}`);
  if (flags.has('--rings')) console.log('    ' + JSON.stringify(b.p));
}
if (shown.length > 30 && !flags.has('--all')) console.log(`  ... and ${shown.length - 30} more (--all)`);
if (small.length) console.log(`  and ${small.length} small parts under 2 m (columns, pinnacles)`);
const ways = (MAP.roads ?? []).filter(rd => rd.n && (rd.p ?? []).some((v, k) => k % 2 === 0 && Math.hypot(v - x, rd.p[k + 1] - z) < +r));
if (ways.length) console.log('streets: ' + [...new Set(ways.map(rd => MAP.names?.[rd.n] ?? rd.n))].join(', '));
