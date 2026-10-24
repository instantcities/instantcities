#!/usr/bin/env node
// The map of Europe on the home page: the land and the borders as SVG paths, and where each city of
// _data/cities.yml (its lat and lon) sits on it, written to _data/europe.json for _includes/europe.html.
//
//     node tools/europe.mjs
//
// Run it after adding a city (or changing its lat/lon). The outlines are Natural Earth's countries at
// 1:50m (public domain), from the world-atlas package, downloaded once into tools/cache/. Projected
// with a Lambert conformal conic fitted to Europe, so Scandinavia keeps its shape.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';
const CACHE = path.join(ROOT, 'tools', 'cache', 'countries-50m.json');

if (!fs.existsSync(CACHE)) {
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, await (await fetch(SRC)).text());
}
const topo = JSON.parse(fs.readFileSync(CACHE, 'utf8'));

// Lambert conformal conic: standard parallels 40° and 60°, centred on 12° E, 52° N
const rad = d => (d * Math.PI) / 180;
const [p1, p2, lon0, lat0] = [rad(40), rad(60), rad(12), rad(52)];
const n = Math.log(Math.cos(p1) / Math.cos(p2)) / Math.log(Math.tan(Math.PI / 4 + p2 / 2) / Math.tan(Math.PI / 4 + p1 / 2));
const F = (Math.cos(p1) * Math.tan(Math.PI / 4 + p1 / 2) ** n) / n;
const rho = lat => F / Math.tan(Math.PI / 4 + rad(lat) / 2) ** n;
const rho0 = rho(52);
const lambert = (lon, lat) => {
  const r = rho(Math.max(-80, Math.min(85, lat))), t = n * (rad(lon) - lon0);
  return [r * Math.sin(t), rho0 - r * Math.cos(t)];
};

// The frame: from Portugal to the Black Sea, from Sicily to the south of Scandinavia
const W = 1000, H = 760;
const corners = [[-9.5, 36.5], [24, 36.5], [-9.5, 59], [24, 59], [7, 36], [7, 59.5]].map(([lo, la]) => lambert(lo, la));
const [x0, x1] = [Math.min(...corners.map(c => c[0])), Math.max(...corners.map(c => c[0]))];
const [y0, y1] = [Math.min(...corners.map(c => c[1])), Math.max(...corners.map(c => c[1]))];
const k = Math.min(W / (x1 - x0), H / (y1 - y0));
const px = (lon, lat) => {
  const [x, y] = lambert(lon, lat);
  return [(x - x0) * k + (W - (x1 - x0) * k) / 2, H - ((y - y0) * k + (H - (y1 - y0) * k) / 2)];
};

// TopoJSON: the arcs, delta-encoded on a quantized grid
const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
const arcs = topo.arcs.map(a => {
  let x = 0, y = 0;
  return a.map(([dx, dy]) => [(x += dx) * sx + tx, (y += dy) * sy + ty]);
});
const arc = i => (i >= 0 ? arcs[i] : [...arcs[~i]].reverse());
const M = 40; // pixels beyond the frame where the outlines are cut off (pressed against the edge)
const clamp = ([x, y]) => [Math.max(-M, Math.min(W + M, x)), Math.max(-M, Math.min(H + M, y))];
const ring = idx => {
  const pts = [];
  for (const i of idx) pts.push(...arc(i).map(([lo, la]) => clamp(px(lo, la))));
  const out = [];
  for (const [x, y] of pts) {
    const q = [Math.round(x), Math.round(y)], last = out[out.length - 1];
    if (!last || Math.hypot(q[0] - last[0], q[1] - last[1]) >= 2) out.push(q);
  }
  // a ring wholly outside the frame collapses onto its edge: leave it out
  const inside = out.some(([x, y]) => x > 0 && x < W && y > 0 && y < H);
  return inside && out.length > 2 ? 'M' + out.map(p => p.join(' ')).join('L') + 'Z' : '';
};
let land = '';
for (const g of topo.objects.countries.geometries) {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
  for (const poly of polys) for (const r of poly) land += ring(r);
}

// the cities, from _data/cities.yml: each block's id, name, lat and lon
const yml = fs.readFileSync(path.join(ROOT, '_data', 'cities.yml'), 'utf8');
const cities = {};
for (const block of yml.split(/^- /m).slice(1)) {
  const get = key => block.match(new RegExp(`^\\s*${key}: (.+)$`, 'm'))?.[1].trim();
  const id = get('id'), lat = Number(get('lat')), lon = Number(get('lon'));
  if (!id) continue;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error(`_data/cities.yml: ${id} has no lat and lon`);
  cities[id] = px(lon, lat).map(v => Math.round(v * 10) / 10);
}

fs.writeFileSync(path.join(ROOT, '_data', 'europe.json'), JSON.stringify({ width: W, height: H, land, cities }) + '\n');
console.error(`_data/europe.json: ${(land.length / 1024).toFixed(0)} kB of outlines, ${Object.keys(cities).length} cities`);
