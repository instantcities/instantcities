#!/usr/bin/env node
// Turn a neighbourhood from OpenStreetMap into a map for the game (<city>/map.js).
//
//     node tools/osm_map.mjs ghent            # uses the cached download in tools/cache/
//     node tools/osm_map.mjs ghent --fetch    # downloads the area again first
//
// The area is described in <city>/area.json: the city and the race routes, each an id and its
// street names in riding order ({ "routes": [{ "id", "route": [...] }] }, or one "route": [...]).
// Optional: bbox [s, w, n, e] (found from the first route and written back when missing),
// zone_roads (the roads that enclose the neighbourhood) or zone_points (the corners of it as
// [lat, lon]; else everything near the routes is kept), scale, hw, corner, margin, heights
// ("dhmv": every roof at its measured height, Flanders only, see tools/dhmv.mjs), roofs ("flat":
// no pitched roof unless OSM gives the building a roof:shape), floors (the most storeys guessed for
// a building OSM gives none), gables (false: old houses get no Flemish stepped gable; Ghent's and
// Amsterdam's do), car_free (street names closed to cars that OSM doesn't tag so), bridges
// ({ name: "arched" | "grand" } for the bridges that are not level with the street, see BRIDGES). The builder
// itself is tools/osmbuild.mjs. Map data © OpenStreetMap contributors, available under the ODbL.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMap, MapError } from './osmbuild.mjs';
import { locateRoute, fetchArea } from './osmfetch.mjs';
import { surface } from './dhmv.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const id = process.argv[2];
if (!id || id.startsWith('-')) {
  console.error(`usage: node tools/osm_map.mjs <city> [--fetch]   (cities: ${fs.readdirSync(path.join(HERE, '..')).filter(d => fs.existsSync(path.join(HERE, '..', d, 'area.json'))).join(', ')})`);
  process.exit(1);
}
// An area's own streets: `streets` in area.json, for places where OpenStreetMap has no streets to
// race along that join up (the paths of a garden, say). Each is { name, highway?, surface?, points: [[x, z]] },
// in metres east and south of `origin` ([lat, lon]); streets that share a point meet there.
function addStreets(data, area) {
  if (!area.streets?.length) return;
  const [lat0, lon0] = area.origin;
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180), kz = 110540;
  const at = new Map();
  let next = -1;
  const node = ([x, z]) => {
    const key = x + ',' + z;
    if (!at.has(key)) {
      at.set(key, String(next--));
      data.nodes[at.get(key)] = { lat: lat0 - z / kz, lon: lon0 + x / kx };
    }
    return at.get(key);
  };
  // in steps of at most 20 m, as the builder looks a street's surface and height up by the pieces it is made of
  const steps = pts => pts.flatMap((a, k) => {
    if (!k) return [a];
    const b = pts[k - 1], n = Math.max(1, Math.ceil(Math.hypot(a[0] - b[0], a[1] - b[1]) / 20));
    return Array.from({ length: n }, (_, j) => [b[0] + ((a[0] - b[0]) * (j + 1)) / n, b[1] + ((a[1] - b[1]) * (j + 1)) / n]);
  });
  for (const [i, st] of area.streets.entries()) {
    data.ways.push({ id: -1000 - i, nodes: steps(st.points).map(node), tags: { highway: st.highway ?? 'pedestrian', surface: st.surface ?? 'paving_stones', name: st.name } });
  }
}

// Houses to fill the gaps in a walled town whose excavated blocks OpenStreetMap maps only in part
// (area.fill: { wall (the way id of the town wall), angle (degrees: how the town's lots are turned),
// lot ([width, depth] metres), gap, clear (metres kept clear beside a street), skip (the share of lots left empty), seed, exclude ([[x, z, r]] in game metres: squares and gardens left
// open) }; needs geo). Lots on a grid turned to the streets, each one only where it stands clear of
// the streets, the buildings already there, the map's gardens and woods, and the exclusions.
function fillBlocks(map, area, data) {
  const f = area.fill, g = map.geo;
  if (!f || !g) return 0;
  const toGame = n => [(n.lon - g.lon) * g.kx * g.s - g.cx, -(n.lat - g.lat) * g.kz * g.s - g.cz];
  const wall = data.ways.find(w => w.id === f.wall).nodes.map(i => toGame(data.nodes[i]));
  const inside = (x, z, poly) => { let hit = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit; } return hit; };
  const pairs = p => Array.from({ length: p.length / 2 }, (_, i) => [p[2 * i], p[2 * i + 1]]);
  const box = p => { const xs = p.filter((_, i) => !(i % 2)), zs = p.filter((_, i) => i % 2); return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)]; };
  const segDist = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L)); return Math.hypot(px - ax - t * dx, pz - az - t * dz); };
  const roads = map.roads.map(rd => ({ p: rd.p, half: rd.w / 2 + (f.clear ?? 2.2), b: box(rd.p) }));
  const built = map.buildings.map(b => box(b.p));
  const greens = map.areas.filter(a => a.k === 'green' || a.k === 'wood' || a.k === 'water').map(a => ({ poly: pairs(a.p), b: box(a.p) }));
  let seed = f.seed ?? 1;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const th = (f.angle * Math.PI) / 180, c = Math.cos(th), sn = Math.sin(th);
  const [wx0, wz0, wx1, wz1] = box(wall.flat());
  const us = [], vs = [];
  for (const [x, z] of [[wx0, wz0], [wx1, wz0], [wx1, wz1], [wx0, wz1]]) { us.push(x * c + z * sn); vs.push(-x * sn + z * c); }
  const [lw, ld] = f.lot, gap = f.gap ?? 2.2;
  let added = 0;
  for (let u = Math.min(...us); u < Math.max(...us); u += lw + gap) {
    for (let v = Math.min(...vs); v < Math.max(...vs); v += ld + gap) {
      const w = lw * (0.65 + 0.35 * rnd()), d = ld * (0.6 + 0.4 * rnd()), skip = rnd() < (f.skip ?? 0.12);
      const cu = u + w / 2, cv = v + d / 2;
      const pts = [[0, 0], [w, 0], [w, d], [0, d]].map(([a, b]) => [(u + a) * c - (v + b) * sn, (u + a) * sn + (v + b) * c]);
      const mid = [cu * c - cv * sn, cu * sn + cv * c];
      if (skip || !pts.every(([x, z]) => inside(x, z, wall)) || (f.exclude ?? []).some(([x, z, r]) => Math.hypot(mid[0] - x, mid[1] - z) < r)) continue;
      const bx = [Math.min(...pts.map(p => p[0])) - 0.5, Math.min(...pts.map(p => p[1])) - 0.5, Math.max(...pts.map(p => p[0])) + 0.5, Math.max(...pts.map(p => p[1])) + 0.5];
      if (built.some(b => b[0] < bx[2] && b[2] > bx[0] && b[1] < bx[3] && b[3] > bx[1])) continue;
      const samples = [...pts, mid, ...pts.map((p, i) => [(p[0] + pts[(i + 1) % 4][0]) / 2, (p[1] + pts[(i + 1) % 4][1]) / 2])];
      if (samples.some(([x, z]) => greens.some(gr => x > gr.b[0] && x < gr.b[2] && z > gr.b[1] && z < gr.b[3] && inside(x, z, gr.poly)))) continue;
      let clear = true;
      for (const rd of roads) {
        if (bx[2] < rd.b[0] - rd.half || bx[0] > rd.b[2] + rd.half || bx[3] < rd.b[1] - rd.half || bx[1] > rd.b[3] + rd.half) continue;
        for (let k = 0; k + 3 < rd.p.length && clear; k += 2) if (samples.some(([x, z]) => segDist(x, z, rd.p[k], rd.p[k + 1], rd.p[k + 2], rd.p[k + 3]) < rd.half)) clear = false;
        if (!clear) break;
      }
      if (!clear) continue;
      map.buildings.push({ p: pts.flat().map(v => Math.round(v * 10) / 10), f: rnd() < 0.2 ? 2 : 1, r: null, k: 'yes' });
      built.push(bx);
      added++;
    }
  }
  return added;
}

const dir = path.join(HERE, '..', id);
const areaFile = path.join(dir, 'area.json');
const area = JSON.parse(fs.readFileSync(areaFile, 'utf8'));
const cache = path.join(HERE, 'cache', id + '.json');
const out = path.join(dir, 'map.js');

try {
  if (!area.bbox) {
    console.error(`finding the route in ${area.city}`);
    area.bbox = (await locateRoute(area.city, area.route ?? area.routes[0].route, area.margin)).map(v => Math.round(v * 1e5) / 1e5);
    fs.writeFileSync(areaFile, JSON.stringify(area, null, 2) + '\n');
  }
  if (process.argv.includes('--fetch') || !fs.existsSync(cache)) {
    const data = await fetchArea(area.bbox, (how, i, n) => console.error(how === 'tiles' ? `tile ${i}/${n}` : 'asking overpass'));
    fs.mkdirSync(path.dirname(cache), { recursive: true });
    fs.writeFileSync(cache, JSON.stringify({ nodes: Object.fromEntries(data.nodes), ways: data.ways }));
  }
  if (area.heights === 'dhmv') {
    area.surface = await surface(area.bbox, path.join(HERE, 'cache', id + '-dhmv.bin'), (i, n) => console.error(`heights: tile ${i}/${n}`));
  }
  const data = JSON.parse(fs.readFileSync(cache, 'utf8'));
  addStreets(data, area);
  // ways to leave out, by OpenStreetMap id (a park drawn over the moat, say)
  if (area.drop?.length) data.ways = data.ways.filter(w => !area.drop.includes(w.id));
  // ruins drawn as sites, not buildings (Pompeii's houses are historic=archaeological_site): the closed
  // ones up to `max` metres across become buildings, but not the open squares, gardens and palaestrae
  if (area.ruins_as_buildings) {
    const { max = 100, skip = '^(Foro|Palestra|Giardino|Orto|Area|Piazza)' } = area.ruins_as_buildings, kx = 111320 * Math.cos((area.origin?.[0] ?? area.bbox[0]) * Math.PI / 180);
    for (const w of data.ways) {
      const t = w.tags;
      if (!t || t.building || !['archaeological_site', 'ruins'].includes(t.historic) || w.nodes[0] !== w.nodes.at(-1) || t.highway || t.leisure || t.tourism === 'picnic_site') continue;
      if (t.name && new RegExp(skip, 'i').test(t.name)) continue;
      const p = w.nodes.map(i => data.nodes[i]).filter(Boolean);
      if (p.length < 4) continue;
      const lat = p.map(q => q.lat), lon = p.map(q => q.lon);
      if (Math.max((Math.max(...lat) - Math.min(...lat)) * 110540, (Math.max(...lon) - Math.min(...lon)) * kx) <= max) t.building = 'yes';
    }
  }
  // a surface for the streets that have none tagged or only a plain one ('sett': basalt blocks, for Pompeii)
  if (area.default_surface) for (const w of data.ways) if (w.tags?.highway && (!w.tags.surface || ['asphalt', 'paved', 'concrete', 'compacted', 'ground', 'dirt', 'gravel', 'unpaved'].includes(w.tags.surface))) w.tags.surface = area.default_surface;
  // only the buildings that are something: named, a part of one, historic or a place of worship
  if (area.only_named_buildings) data.ways = data.ways.filter(w => !w.tags?.building || w.tags.name || w.tags['name:en'] || w.tags.historic || w.tags.amenity === 'place_of_worship' || w.tags['building:part']);
  const { map, info } = buildMap(data, area);
  const filled = fillBlocks(map, area, data);
  if (filled) info.buildings += filled, console.error(`${filled} houses added to fill the gaps`);
  for (const rt of info.routes) {
    console.error(`route ${rt.id}: ${rt.length.toFixed(0)} m, one-way stretches:`, rt.oneway.map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join(', ') || 'none');
  }
  console.error(`${info.buildings} buildings (${info.dropped} cleared off the routes), `
    + `${info.measured} measured, ${info.roads} roads, ${info.areas} areas, ${info.water} waterways, ${info.trams} tram tracks, ${info.cobbled} cobbled roads, ${info.carFree} car-free streets, ${info.stepped} stepped gables, ${info.trees} trees, shops placed: ${info.shops}`);
  fs.writeFileSync(out, `// ${id}: generated by tools/osm_map.mjs, do not edit by hand.\n`
    + '// Map data © OpenStreetMap contributors, available under the Open Database License (ODbL).\n'
    + (area.heights === 'dhmv' ? '// Heights: Digitaal Vlaanderen, Digitaal Hoogtemodel Vlaanderen II (DHMV II), open data.\n' : '')
    + `export const MAP = ${JSON.stringify(map)};\n`);
} catch (e) {
  if (!(e instanceof MapError)) throw e;
  const why = { missing: 'these streets are not in the map', apart: 'these streets do not meet', noloop: 'the route does not join up: no way along this street from the one before it to the one after it (it may be in unconnected pieces; try tools/routecheck.mjs)', zone: 'the zone roads are not in the map', city: 'city not found', big: 'these streets are too far apart' };
  console.error(`${why[e.code]}: ${e.streets.join(', ')}`);
  process.exit(1);
}
