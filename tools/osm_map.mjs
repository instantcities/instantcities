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
