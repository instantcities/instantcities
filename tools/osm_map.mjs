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
// open), plan (a file of rings of [lat, lon]: the parts of the town that are built, even-odd; see
// tools/pompeii-plan.py) }; needs geo). Lots on a grid turned to the streets, each one only where it
// stands clear of the streets, the buildings already there, the map's gardens and woods, and the
// exclusions. With a plan, only inside it, the lots side by side as in a town's blocks (gap apart,
// none skipped), and the strips the whole lots leave along the streets and round the buildings
// already there filled after with half and quarter ones.
function fillBlocks(map, area, data) {
  const f = area.fill, g = map.geo;
  if (!f || !g) return 0;
  const toGame = n => [(n.lon - g.lon) * g.kx * g.s - g.cx, -(n.lat - g.lat) * g.kz * g.s - g.cz];
  const wall = data.ways.find(w => w.id === f.wall).nodes.map(i => toGame(data.nodes[i]));
  const inside = (x, z, poly) => { let hit = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit; } return hit; };
  const pairs = p => Array.from({ length: p.length / 2 }, (_, i) => [p[2 * i], p[2 * i + 1]]);
  const box = p => { const xs = p.filter((_, i) => !(i % 2)), zs = p.filter((_, i) => i % 2); return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)]; };
  const segDist = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L)); return Math.hypot(px - ax - t * dx, pz - az - t * dz); };
  const cross = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); };
  const roads = map.roads.map(rd => ({ p: rd.p, half: rd.w / 2 + (f.clear ?? 2.2), b: box(rd.p) }));
  // the buildings there already, by their outlines (a lot may stand in the corner a turned one leaves)
  const built = map.buildings.map(b => ({ poly: pairs(b.p), b: box(b.p) }));
  const greens = map.areas.filter(a => a.k === 'green' || a.k === 'wood' || a.k === 'water').map(a => ({ poly: pairs(a.p), b: box(a.p) }));
  // the plan: rings of [lat, lon] in a file, as game metres
  const plan = f.plan ? JSON.parse(fs.readFileSync(path.join(HERE, '..', f.plan), 'utf8')).rings.map(r => { const poly = r.map(([lat, lon]) => toGame({ lat, lon })); return { poly, b: box(poly.flat()) }; }) : null;
  const planned = (x, z) => plan.reduce((n, r) => n + (x > r.b[0] && x < r.b[2] && z > r.b[1] && z < r.b[3] && inside(x, z, r.poly) ? 1 : 0), 0) % 2 === 1;
  let seed = f.seed ?? 1;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const th = (f.angle * Math.PI) / 180, c = Math.cos(th), sn = Math.sin(th);
  const [wx0, wz0, wx1, wz1] = box(wall.flat());
  const us = [], vs = [];
  for (const [x, z] of [[wx0, wz0], [wx1, wz0], [wx1, wz1], [wx0, wz1]]) { us.push(x * c + z * sn); vs.push(-x * sn + z * c); }
  const gap = f.gap ?? 2.2;
  // whole lots first; with a plan then half and quarter ones in what is left
  const sizes = plan ? [[1, 1], [0.5, 1], [1, 0.5], [0.5, 0.5], [0.5, 0.25], [0.25, 0.5]] : [[1, 1]];
  let added = 0;
  for (const [fw, fd] of sizes) {
    const lw = f.lot[0] * fw, ld = f.lot[1] * fd;
    for (let u = Math.min(...us); u < Math.max(...us); u += lw + gap) {
      for (let v = Math.min(...vs); v < Math.max(...vs); v += ld + gap) {
        const w = plan ? lw : lw * (0.65 + 0.35 * rnd()), d = plan ? ld : ld * (0.6 + 0.4 * rnd()), skip = !plan && rnd() < (f.skip ?? 0.12);
        const cu = u + w / 2, cv = v + d / 2;
        const pts = [[0, 0], [w, 0], [w, d], [0, d]].map(([a, b]) => [(u + a) * c - (v + b) * sn, (u + a) * sn + (v + b) * c]);
        const mid = [cu * c - cv * sn, cu * sn + cv * c];
        if (skip || !pts.every(([x, z]) => inside(x, z, wall)) || (f.exclude ?? []).some(([x, z, r]) => Math.hypot(mid[0] - x, mid[1] - z) < r)) continue;
        const samples = [...pts, mid, ...pts.map((p, i) => [(p[0] + pts[(i + 1) % 4][0]) / 2, (p[1] + pts[(i + 1) % 4][1]) / 2])];
        if (plan && !samples.every(([x, z]) => planned(x, z))) continue;
        const bx = [Math.min(...pts.map(p => p[0])) - 0.5, Math.min(...pts.map(p => p[1])) - 0.5, Math.max(...pts.map(p => p[0])) + 0.5, Math.max(...pts.map(p => p[1])) + 0.5];
        // clear of the buildings: none of its points in one, none of theirs in it, no edges crossing
        // (the lot grown by half a metre all round, so that houses do not touch)
        const grown = [[-0.5, -0.5], [w + 0.5, -0.5], [w + 0.5, d + 0.5], [-0.5, d + 0.5]].map(([a, b]) => [(u + a) * c - (v + b) * sn, (u + a) * sn + (v + b) * c]);
        const hits = bd => bd.b[0] < bx[2] && bd.b[2] > bx[0] && bd.b[1] < bx[3] && bd.b[3] > bx[1]
          && (samples.some(([x, z]) => inside(x, z, bd.poly)) || bd.poly.some(([x, z]) => inside(x, z, grown))
            || bd.poly.some((p, i) => grown.some((q, j) => cross(p, bd.poly[(i + 1) % bd.poly.length], q, grown[(j + 1) % 4]))));
        if (built.some(hits)) continue;
        if (samples.some(([x, z]) => greens.some(gr => x > gr.b[0] && x < gr.b[2] && z > gr.b[1] && z < gr.b[3] && inside(x, z, gr.poly)))) continue;
        let clear = true;
        for (const rd of roads) {
          if (bx[2] < rd.b[0] - rd.half || bx[0] > rd.b[2] + rd.half || bx[3] < rd.b[1] - rd.half || bx[1] > rd.b[3] + rd.half) continue;
          for (let k = 0; k + 3 < rd.p.length && clear; k += 2) {
            const a = [rd.p[k], rd.p[k + 1]], b = [rd.p[k + 2], rd.p[k + 3]];
            // near the street at one of its points, or the street running through it between them
            if (samples.some(([x, z]) => segDist(x, z, a[0], a[1], b[0], b[1]) < rd.half) || inside(a[0], a[1], pts)
              || pts.some((q, j) => cross(a, b, q, pts[(j + 1) % 4]))) clear = false;
          }
          if (!clear) break;
        }
        if (!clear) continue;
        map.buildings.push({ p: pts.flat().map(v => Math.round(v * 10) / 10), f: rnd() < 0.2 ? 2 : 1, r: null, k: 'yes' });
        built.push({ poly: pts, b: box(pts.flat()) });
        added++;
      }
    }
  }
  // vineyards (fill.vineyards: { plot: [length, width] metres, gap }): on the parts of the town the
  // plan has still buried, as on the site today, in plots turned like the lots, the rows of vines
  // along a plot's length (its first edge; js/scenery.js plants them), half plots in what is left
  if (plan && f.vineyards) {
    const [pl, pw] = f.vineyards.plot, vgap = f.vineyards.gap ?? 4;
    const margin = f.vineyards.clear ?? 3, near = (x, z) => roads.some(rd => {
      if (x < rd.b[0] - rd.half - margin || x > rd.b[2] + rd.half + margin || z < rd.b[1] - rd.half - margin || z > rd.b[3] + rd.half + margin) return false;
      for (let k = 0; k + 3 < rd.p.length; k += 2) if (segDist(x, z, rd.p[k], rd.p[k + 1], rd.p[k + 2], rd.p[k + 3]) < rd.half + margin) return true;
      return false;
    });
    let plots = 0;
    for (const [fl, fw] of [[1, 1], [0.5, 1], [1, 0.5], [0.5, 0.5]]) {
      const w = pl * fl, d = pw * fw;
      for (let u = Math.min(...us); u < Math.max(...us); u += w + vgap) {
        for (let v = Math.min(...vs); v < Math.max(...vs); v += d + vgap) {
          const pts = [[0, 0], [w, 0], [w, d], [0, d]].map(([a, b]) => [(u + a) * c - (v + b) * sn, (u + a) * sn + (v + b) * c]);
          const samples = [];
          for (let i = 0; i <= 4; i++) for (let j = 0; j <= 3; j++) samples.push([(u + (w * i) / 4) * c - (v + (d * j) / 3) * sn, (u + (w * i) / 4) * sn + (v + (d * j) / 3) * c]);
          const mid = samples[7];
          if (!samples.every(([x, z]) => inside(x, z, wall) && !planned(x, z))) continue;
          if ((f.exclude ?? []).some(([x, z, r]) => Math.hypot(mid[0] - x, mid[1] - z) < r + Math.hypot(w, d) / 2)) continue;
          if (samples.some(([x, z]) => near(x, z) || greens.some(gr => x > gr.b[0] && x < gr.b[2] && z > gr.b[1] && z < gr.b[3] && inside(x, z, gr.poly)))) continue;
          const bx = box(pts.flat()), grown = pts;
          const hits = bd => bd.b[0] < bx[2] + 2 && bd.b[2] > bx[0] - 2 && bd.b[1] < bx[3] + 2 && bd.b[3] > bx[1] - 2
            && (samples.some(([x, z]) => inside(x, z, bd.poly)) || bd.poly.some(([x, z]) => inside(x, z, grown))
              || bd.poly.some((p, i) => grown.some((q, j) => cross(p, bd.poly[(i + 1) % bd.poly.length], q, grown[(j + 1) % 4]))));
          if (built.some(hits)) continue;
          // a road running through it between the samples
          if (roads.some(rd => { for (let k = 0; k + 3 < rd.p.length; k += 2) { const a = [rd.p[k], rd.p[k + 1]], b = [rd.p[k + 2], rd.p[k + 3]]; if (inside(a[0], a[1], pts) || pts.some((q, j) => cross(a, b, q, pts[(j + 1) % 4]))) return true; } return false; })) continue;
          map.areas.push({ k: 'vineyard', p: pts.flat().map(v => Math.round(v * 10) / 10) });
          built.push({ poly: pts, b: bx });
          plots++;
        }
      }
    }
    console.error(`${plots} vineyards planted where the town is still buried`);
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
