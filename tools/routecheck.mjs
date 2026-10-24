#!/usr/bin/env node
// Help for writing a route in <city>/area.json: what a street meets, and whether it is in
// one piece. Reads the download in tools/cache/<city>.json (run tools/osm_map.mjs <city> --fetch first).
//
//     node tools/routecheck.mjs lecce "Via Giuseppe Libertini" "Via Adua"   # those streets
//     node tools/routecheck.mjs lecce --route leccecentro                   # a route's streets, in order
//
// For each street: its OSM highway kinds and oneway tags, how many unconnected pieces it is in (more
// than one: a route may not get from one end to the other along it, e.g. a dual carriageway), and
// the named streets it shares a node with. With --route it also says, for each pair in riding order,
// whether they meet: the builder needs every street to share a node with the next.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROAD_WIDTH, fromElements } from './osmbuild.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [city, ...rest] = process.argv.slice(2);
if (!city) {
  console.error('usage: node tools/routecheck.mjs <city> <street>... | --route <id>');
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(path.join(HERE, 'cache', city + '.json'), 'utf8'));
const ways = Array.isArray(data.elements) ? fromElements(data.elements).ways : data.ways;

// the streets the builder can ride: named highways of the kinds it has a width for
const byNode = new Map(), info = new Map();
for (const w of ways) {
  const t = w.tags ?? {};
  if (!(t.highway in ROAD_WIDTH) || !t.name) continue;
  if (!info.has(t.name)) info.set(t.name, { kinds: new Set(), oneway: new Set(), ways: [] });
  const s = info.get(t.name);
  s.kinds.add(t.highway);
  s.oneway.add(t.oneway ?? 'no');
  s.ways.push(w.nodes);
  for (const n of w.nodes) {
    if (!byNode.has(n)) byNode.set(n, new Set());
    byNode.get(n).add(t.name);
  }
}

function pieces(name) {
  const up = new Map(), find = x => { while (up.get(x) !== x) x = up.get(x); return x; };
  for (const ns of info.get(name).ways) {
    for (const n of ns) if (!up.has(n)) up.set(n, n);
    for (let i = 0; i + 1 < ns.length; i++) up.set(find(ns[i]), find(ns[i + 1]));
  }
  return new Set([...up.keys()].map(find)).size;
}
function meets(name) {
  const out = new Set();
  for (const ns of info.get(name).ways) for (const n of ns) for (const o of byNode.get(n)) if (o !== name) out.add(o);
  return out;
}

let streets = rest;
if (rest[0] === '--route') {
  const area = JSON.parse(fs.readFileSync(path.join(HERE, '..', city, 'area.json'), 'utf8'));
  const rt = area.routes.find(r => r.id === rest[1]);
  if (!rt) { console.error(`no route ${rest[1]} in ${city}/area.json`); process.exit(1); }
  streets = rt.route;
}
for (const name of streets) {
  if (!info.has(name)) { console.log(`✗ ${name}: not a street in the download`); continue; }
  const s = info.get(name), k = pieces(name);
  console.log(`${k > 1 ? '!' : '·'} ${name} [${[...s.kinds]}; oneway ${[...s.oneway]}] ${k} piece${k > 1 ? 's' : ''}`);
  console.log(`    meets: ${[...meets(name)].sort().join(' | ')}`);
}
if (rest[0] === '--route') {
  for (let i = 0; i + 1 < streets.length; i++) {
    const a = streets[i], b = streets[i + 1];
    if (info.has(a) && info.has(b)) console.log(`${meets(a).has(b) ? '✓' : '✗'} ${a} → ${b}`);
  }
}
