#!/usr/bin/env node
// Each city's guide pages on the site, from _data/about/<city>.json: /<city>/about-the-city/
// (_layouts/about.html) and /<city>/places-and-landmarks/ (_layouts/places.html), with their two maps.
//
//     node tools/about.mjs                       # every city with a _data/about/<city>.json
//     node tools/about.mjs rome
//     node tools/about.mjs where rome "Via del Corso" "Piazza Navona"   # where a street of the game's map lies
//
// It writes, per city: the two little index.html pages; assets/maps/<city>.svg, the city centre
// drawn from the game's own map (<city>/map.js: water, parks, buildings and streets), framed on the
// places of the guide; and _data/maps/<city>.json, where each place of the guide lies on that
// drawing (a pin, and for a street or a waterway found by name in the map, its line). The country
// maps, the country's outline with its cities and its capital, go to _data/countries.json, from
// Natural Earth's countries at 1:50m (public domain, the same download as tools/europe.mjs).
//
// A guide (_data/about/<city>.json): { intro (a paragraph, on the city's page under "This is …"),
// famous (a few short lines: what the city is known for), facts ([label, value]), overview, setting,
// today (paragraphs), history ([{ title, text: paragraphs }]), timeline ([when, what]), places
// ([{ id, name, local?, kind ('street' | 'square' | 'waterway' | 'bridge' | 'quarter' | 'park' |
// 'gate' | 'building'), lat, lon, blurb, landmark? (the id of the landmark it is, for its link) }]),
// links ([{ title, url, note }]) }.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, '_data', 'about');
const args = process.argv.slice(2);

const loadMap = city => mapCoords(path.join(ROOT, city), city);

// The streets of the map called name (or local), as lists of game points
function roadsNamed(MAP, ...names) {
  const idx = new Set(names.filter(Boolean).map(n => MAP.names.indexOf(n)).filter(i => i >= 0));
  return MAP.roads.filter(r => idx.has(r.n)).map(r => pairs(r.p));
}
const pairs = flat => Array.from({ length: flat.length / 2 }, (_, i) => [flat[2 * i], flat[2 * i + 1]]);

// the point halfway along a set of lines
function middle(lines) {
  const segs = [];
  let total = 0;
  for (const l of lines) for (let i = 1; i < l.length; i++) {
    const d = Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]);
    segs.push([l[i - 1], l[i], d]);
    total += d;
  }
  let at = total / 2;
  for (const [a, b, d] of segs) {
    if (at <= d) return [a[0] + ((b[0] - a[0]) * at) / (d || 1), a[1] + ((b[1] - a[1]) * at) / (d || 1)];
    at -= d;
  }
  return lines[0][0];
}

if (args[0] === 'where') {
  const [, city, ...names] = args;
  const { MAP, latLon } = loadMap(city);
  for (const name of names) {
    const lines = roadsNamed(MAP, name);
    if (!lines.length) {
      const near = MAP.names.filter(n => n.toLowerCase().includes(name.toLowerCase().split(' ').pop())).slice(0, 8);
      console.log(`${name}: not in the map${near.length ? ` (perhaps: ${near.join(', ')})` : ''}`);
      continue;
    }
    const [lat, lon] = latLon(...middle(lines));
    console.log(`${name}: ${lat.toFixed(5)}, ${lon.toFixed(5)} (${lines.length} pieces)`);
  }
  process.exit(0);
}

const cities = args.length ? args : fs.readdirSync(DATA).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
const guides = {};
for (const city of cities) {
  const G = JSON.parse(fs.readFileSync(path.join(DATA, city + '.json'), 'utf8'));
  guides[city] = G;
  const ids = new Set();
  for (const p of G.places) {
    if (!/^[a-z0-9-]+$/.test(p.id)) throw new Error(`${city}: place id "${p.id}" is not a-z, 0-9 and -`);
    if (ids.has(p.id)) throw new Error(`${city}: place id "${p.id}" twice`);
    ids.add(p.id);
  }
  for (const [page, layout] of [['about-the-city', 'about'], ['places-and-landmarks', 'places']]) {
    fs.mkdirSync(path.join(ROOT, city, page), { recursive: true });
    fs.writeFileSync(path.join(ROOT, city, page, 'index.html'), `---\nlayout: ${layout}\ncity: ${city}\n---\n`);
  }
  centreMap(city, G);
}
await countryMaps();

// The city centre as a drawing, framed on the guide's places that lie in the game's map
function centreMap(city, G) {
  const { MAP, game, area } = loadMap(city);
  const zone = pairs(MAP.zone);
  const zx = zone.map(p => p[0]), zz = zone.map(p => p[1]);
  const inZone = ([x, z]) => x > Math.min(...zx) && x < Math.max(...zx) && z > Math.min(...zz) && z < Math.max(...zz);
  // where each place lies: along its street when the map has one by that name, else its lat and lon
  const at = {};
  for (const p of G.places) {
    const lines = ['street', 'waterway', 'bridge', 'square'].includes(p.kind) ? roadsNamed(MAP, p.name, p.local, p.osm) : [];
    const pt = p.lat != null ? game(p.lat, p.lon) : lines.length ? middle(lines) : null;
    if (pt && inZone(pt)) at[p.id] = { pt, lines: ['street', 'waterway'].includes(p.kind) ? lines : [] };
  }
  const pts = Object.values(at).map(a => a.pt);
  if (pts.length < 2) throw new Error(`${city}: fewer than two places of the guide lie in the game's map`);
  // the frame: around the pins, at least 900 m (game metres are S times real ones) and not too long
  const S = area.scale ?? 1.25, pad = 140 * S, min = 900 * S;
  let [x0, x1] = [Math.min(...pts.map(p => p[0])) - pad, Math.max(...pts.map(p => p[0])) + pad];
  let [z0, z1] = [Math.min(...pts.map(p => p[1])) - pad, Math.max(...pts.map(p => p[1])) + pad];
  const grow = (a, b, to) => { const c = (a + b) / 2; return b - a >= to ? [a, b] : [c - to / 2, c + to / 2]; };
  [x0, x1] = grow(x0, x1, Math.max(min, (z1 - z0) / 1.6));
  [z0, z1] = grow(z0, z1, Math.max(min * 0.75, (x1 - x0) / 1.6));
  // and inside the map, where there is something to draw
  const fit = (a, b, lo, hi) => (b - a >= hi - lo ? [lo, hi] : a < lo ? [lo, lo + b - a] : b > hi ? [hi - (b - a), hi] : [a, b]);
  [x0, x1] = fit(x0, x1, Math.min(...zx), Math.max(...zx));
  [z0, z1] = fit(z0, z1, Math.min(...zz), Math.max(...zz));

  const W = 1000, k = W / (x1 - x0), H = Math.round((z1 - z0) * k);
  const P = ([x, z]) => [Math.round((x - x0) * k), Math.round((z - z0) * k)];
  const inFrame = l => l.some(([x, z]) => x > x0 - 60 && x < x1 + 60 && z > z0 - 60 && z < z1 + 60);
  const d = (l, close) => {
    const out = [];
    for (const q of l.map(P)) {
      const last = out[out.length - 1];
      if (!last || Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]) >= 2) out.push(q);
    }
    if (out.length < 2) return '';
    return 'M' + out.map(p => p.join(' ')).join('L') + (close ? 'Z' : '');
  };
  const polys = (list, close) => list.map(p => pairs(p)).filter(inFrame).map(l => d(l, close)).join('');
  const area_ = kind => polys(MAP.areas.filter(a => kind.includes(a.k)).map(a => a.p), true);
  // the roads by width, so a road is drawn as wide as it is
  const roads = {};
  for (const r of MAP.roads) {
    const l = pairs(r.p);
    if (!inFrame(l)) continue;
    const w = Math.max(1.5, Math.round(r.w * k * 2) / 2);
    roads[w] = (roads[w] ?? '') + d(l, false);
  }
  const rivers = MAP.water.filter(w => inFrame(pairs(w.p)))
    .map(w => `<path d="${d(pairs(w.p), false)}" stroke-width="${Math.round(w.w * k)}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`
    + `<!-- ${city}: drawn by tools/about.mjs from the game's map. Map data © OpenStreetMap contributors (ODbL). -->`
    + `<rect width="${W}" height="${H}" fill="#f1eee8"/>`
    + `<path fill="#d4e6c3" d="${area_(['green', 'wood', 'allotments', 'pitch'])}"/>`
    + `<path fill="#e8e3da" d="${area_(['paved', 'sand'])}"/>`
    + `<path fill="#a9cde3" d="${area_(['water'])}"/>`
    + `<g fill="none" stroke="#a9cde3" stroke-linecap="round" stroke-linejoin="round">${rivers}</g>`
    + `<path fill="#d9d3c8" d="${polys(MAP.buildings.map(b => b.p), true)}"/>`
    + `<g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">`
    + Object.entries(roads).map(([w, dd]) => `<path stroke-width="${w}" d="${dd}"/>`).join('')
    + `</g></svg>\n`;
  fs.mkdirSync(path.join(ROOT, 'assets', 'maps'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'assets', 'maps', city + '.svg'), svg);
  const pins = {};
  for (const [id, { pt, lines }] of Object.entries(at)) {
    pins[id] = { x: P(pt)[0], y: P(pt)[1] };
    const line = lines.filter(inFrame).map(l => d(l, false)).join('');
    if (line) pins[id].line = line;
  }
  fs.mkdirSync(path.join(ROOT, '_data', 'maps'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, '_data', 'maps', city + '.json'), JSON.stringify({ width: W, height: H, pins }) + '\n');
  const left = G.places.filter(p => !at[p.id]).map(p => p.id);
  console.error(`${city}: ${(svg.length / 1024).toFixed(0)} kB map, ${Object.keys(pins).length} of ${G.places.length} places on it${left.length ? ` (not: ${left.join(', ')})` : ''}`);
}

// The countries of the cities with a guide: each outline fitted into a box, its neighbours around
// it, and where its cities and its capital lie
async function countryMaps() {
  const SRC = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';
  const CACHE = path.join(ROOT, 'tools', 'cache', 'countries-50m.json');
  if (!fs.existsSync(CACHE)) {
    fs.mkdirSync(path.dirname(CACHE), { recursive: true });
    fs.writeFileSync(CACHE, await (await fetch(SRC)).text());
  }
  const topo = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
  const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => [(x += dx) * sx + tx, (y += dy) * sy + ty]); });
  const arc = i => (i >= 0 ? arcs[i] : [...arcs[~i]].reverse());
  const shapes = g => (g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []).map(poly => poly.map(r => r.flatMap(arc)));
  // Natural Earth's names for the countries in _data/cities.yml, and their capitals
  const NE = { 'United Kingdom': 'United Kingdom', 'Czech Republic': 'Czechia', Czechia: 'Czechia', 'United States': 'United States of America' };
  const CAPITALS = {
    Italy: ['Rome', 41.9028, 12.4964], France: ['Paris', 48.8566, 2.3522], Spain: ['Madrid', 40.4168, -3.7038],
    'United Kingdom': ['London', 51.5072, -0.1276], Netherlands: ['Amsterdam', 52.3676, 4.9041],
    Belgium: ['Brussels', 50.8503, 4.3517], Germany: ['Berlin', 52.52, 13.405], Austria: ['Vienna', 48.2082, 16.3738],
    Denmark: ['Copenhagen', 55.6761, 12.5683], 'Czech Republic': ['Prague', 50.0755, 14.4378], Czechia: ['Prague', 50.0755, 14.4378],
    Turkey: ['Ankara', 39.9334, 32.8597], 'United States': ['Washington', 38.9072, -77.0369],
  };
  const yml = fs.readFileSync(path.join(ROOT, '_data', 'cities.yml'), 'utf8');
  const all = yml.split(/^- /m).slice(1).map(block => {
    const get = key => block.match(new RegExp(`^\\s*${key}: (.+)$`, 'm'))?.[1].trim().replace(/^"|"$/g, '');
    return { id: get('id'), name: get('name'), country: get('country'), lat: Number(get('lat')), lon: Number(get('lon')) };
  });
  const out = {};
  const countries = [...new Set(all.filter(c => fs.existsSync(path.join(DATA, c.id + '.json'))).map(c => c.country))];
  for (const country of countries) {
    const geo = topo.objects.countries.geometries.find(g => g.properties.name === (NE[country] ?? country));
    if (!geo) throw new Error(`no outline for ${country}`);
    // the mainland, and islands bigger than a speck, near enough to it (no French Guiana)
    const rings = shapes(geo).map(p => p[0]);
    const size = r => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] - r[i][0]) * (r[j][1] + r[i][1]); return Math.abs(a / 2); };
    const main = rings.reduce((a, b) => (size(b) > size(a) ? b : a));
    const mc = [main.reduce((s, p) => s + p[0], 0) / main.length, main.reduce((s, p) => s + p[1], 0) / main.length];
    const keep = rings.filter(r => r === main || (size(r) > 0.004 && Math.hypot(r[0][0] - mc[0], r[0][1] - mc[1]) < 12));
    const lons = keep.flat().map(p => p[0]), lats = keep.flat().map(p => p[1]);
    let [w, e, s, n] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
    const lat0 = (s + n) / 2, cos = Math.cos((lat0 * Math.PI) / 180);
    // a little room around it, and a box no flatter than 4:3
    const mx = (e - w) * 0.08 + 0.3, my = (n - s) * 0.08 + 0.2;
    [w, e, s, n] = [w - mx, e + mx, s - my, n + my];
    const BOX = 400, k = BOX / Math.max((e - w) * cos, n - s);
    const Wd = Math.round((e - w) * cos * k), Hd = Math.round((n - s) * k);
    const P = ([lo, la]) => [Math.round(((lo - w) * cos * k) * 10) / 10, Math.round(((n - la) * k) * 10) / 10];
    const near = r => r.some(([lo, la]) => lo > w - 3 && lo < e + 3 && la > s - 3 && la < n + 3);
    // a ring cut off a little beyond the frame: points pressed against its edge, and a run of them
    // along one edge kept as its two ends
    const edge = p => p[0] === -20 || p[0] === Wd + 20 || p[1] === -20 || p[1] === Hd + 20;
    const sameEdge = (a, b, c) => [0, 1].some(i => a[i] === b[i] && b[i] === c[i] && edge(b));
    const d = r => {
      const pts = [];
      for (const q of r.map(P)) {
        const c = [Math.max(-20, Math.min(Wd + 20, q[0])), Math.max(-20, Math.min(Hd + 20, q[1]))], last = pts[pts.length - 1];
        if (last && pts.length > 1 && sameEdge(pts[pts.length - 2], last, c)) pts[pts.length - 1] = c;
        else if (!last || Math.hypot(c[0] - last[0], c[1] - last[1]) >= 1.2) pts.push(c);
      }
      return pts.length > 2 ? 'M' + pts.map(p => p.join(' ')).join('L') + 'Z' : '';
    };
    let land = '';
    for (const g of topo.objects.countries.geometries) {
      if (g === geo) continue;
      for (const poly of shapes(g)) for (const r of poly) if (near(r)) land += d(r);
    }
    const self = keep.map(d).join('');
    const cap = CAPITALS[country];
    out[country] = {
      width: Wd, height: Hd, land, country: self,
      capital: cap && { name: cap[0], at: P([cap[2], cap[1]]) },
      cities: Object.fromEntries(all.filter(c => c.country === country).map(c => [c.id, P([c.lon, c.lat])])),
    };
  }
  fs.writeFileSync(path.join(ROOT, '_data', 'countries.json'), JSON.stringify(out) + '\n');
  console.error(`_data/countries.json: ${countries.join(', ')}, ${(JSON.stringify(out).length / 1024).toFixed(0)} kB`);
}
