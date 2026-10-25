#!/usr/bin/env node
// Where the tour's camera goes through a building, or grazes one: the path of <city>/tour.js flown
// metre by metre the way the game does (core/js/tour.js: the curve through its points, and the climb
// between the stops), against the outlines and heights in <city>/map.js. No browser needed.
//
//     node tools/tourcheck.mjs ghent
//
// Each stretch: where along the path, the camera's height there, the building (its index in
// map.js, a corner of it, its roof top) and how far under that top the camera is. Fix it in the
// path's points: higher, or out over the street. The landmarks' models are not checked (the tour
// flies close round the Belfort on purpose), nor the hand-drawn blocks of infill.js.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Tour } from '../core/js/tour.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
if (!city || !fs.existsSync(path.join(DIR, 'tour.js'))) {
  console.error('usage: node tools/tourcheck.mjs <city>');
  process.exit(1);
}
const { TOUR } = await import(pathToFileURL(path.join(DIR, 'tour.js')));
const src = fs.readFileSync(path.join(DIR, 'map.js'), 'utf8');
const MAP = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));

const GRAZE = 1.5; // metres from a wall that count as grazing it
const FLOOR = 3.4;
// a building's highest point: its measured roof top, or its walls and a guess at the roof
const topOf = b => b.t ?? b.h ?? (b.e ?? b.f * FLOOR + 0.4) + (b.r ? 3 : 0);

// the buildings by 20 m cell, to look up the few near each point
const CELL = 20, grid = new Map();
MAP.buildings.forEach((b, i) => {
  if (b.gone) return;
  const xs = b.p.filter((_, k) => k % 2 === 0), zs = b.p.filter((_, k) => k % 2 === 1);
  for (let cx = Math.floor((Math.min(...xs) - GRAZE) / CELL); cx <= Math.floor((Math.max(...xs) + GRAZE) / CELL); cx++) {
    for (let cz = Math.floor((Math.min(...zs) - GRAZE) / CELL); cz <= Math.floor((Math.max(...zs) + GRAZE) / CELL); cz++) {
      const key = cx + ',' + cz;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(i);
    }
  }
});
const inside = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
const edgeDist = (x, z, p) => {
  let d = Infinity;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const ax = p[j], az = p[j + 1], dx = p[i] - ax, dz = p[i + 1] - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    d = Math.min(d, Math.hypot(x - ax - t * dx, z - az - t * dz));
  }
  return d;
};

const tour = new Tour(TOUR);
const hits = []; // { kind, i, from, to, y, top, deepest }
for (let s = 0; s <= tour.length; s += 1) {
  const pos = tour.at(s), y = pos.y + tour.soar(s);
  for (const i of grid.get(Math.floor(pos.x / CELL) + ',' + Math.floor(pos.z / CELL)) ?? []) {
    const b = MAP.buildings[i], top = topOf(b);
    if (y >= top + 0.5) continue;
    const kind = inside(pos.x, pos.z, b.p) ? 'through' : edgeDist(pos.x, pos.z, b.p) < GRAZE ? 'grazes' : null;
    if (!kind) continue;
    const last = hits.findLast(h => h.i === i && h.kind === kind);
    if (last && s - last.to <= 2) { last.to = s; last.deepest = Math.max(last.deepest, top - y); }
    else hits.push({ kind, i, from: s, to: s, x: pos.x, z: pos.z, y, top, deepest: top - y });
  }
}
hits.sort((a, b) => a.from - b.from);
for (const h of hits) {
  const b = MAP.buildings[h.i];
  console.log(`${String(h.from).padStart(5)}-${String(h.to).padEnd(5)} m  ${h.kind.padEnd(7)}  camera at ${h.x.toFixed(0)},${h.z.toFixed(0)} height ${h.y.toFixed(1)}  building #${h.i} (${b.p[0]},${b.p[1]}) top ${h.top.toFixed(1)}: ${h.deepest.toFixed(1)} m under it`);
}
console.log(hits.length ? `\n${hits.length} stretches` : 'the camera clears every building');
