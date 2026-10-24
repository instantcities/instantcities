#!/usr/bin/env node
// Real 3D models of Ghent's landmarks for a map, from Stad Gent's open 3D model "Gent in 3D":
// every building as a LOD2 mesh (roofs, towers and spires from a LiDAR scan, walls on the GRB
// outlines), in 1 km² tiles of AutoCAD DWG in Belgian Lambert 72.
//
//     node tools/gent3d.mjs ghent       # ghent/landmarks.json -> ghent/landmarks.js
//
// Needs dwgread from LibreDWG (brew install libredwg). Each landmark is given by the OSM ways of its
// outline (from the map's OSM cache); every Gent in 3D mesh standing inside them is kept. Run it
// again after the map is rebuilt: the models are placed in that map's game coordinates.
// A landmark built after the scan (the 2009 one, in the inner city) can take "source": "dhmv": its
// roof is then made from the DHMV II heights, see dhmvRoof below; a plain tower can take "source":
// "flat" (and a "height" in real metres), see flatModel. The hollows in landmarks.json are
// the squares that lie lower than their streets, see hollow below.
// Bron: Stad Gent, Gent in 3D (data.stad.gent/explore/dataset/gent-in-3d), Modellicentie Gratis
// Hergebruik.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { lambert72, surface, terrain } from './dhmv.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(HERE, 'cache', 'gent3d');
const LIST = 'https://data.stad.gent/api/explore/v2.1/catalog/datasets/gent-in-3d/records';
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
if (!city || !fs.existsSync(path.join(DIR, 'landmarks.json'))) {
  console.error('usage: node tools/gent3d.mjs <city>   (the city folder, e.g. ghent, with a landmarks.json)');
  process.exit(1);
}
const conf = JSON.parse(fs.readFileSync(path.join(DIR, 'landmarks.json'), 'utf8'));
const area = JSON.parse(fs.readFileSync(path.join(DIR, 'area.json'), 'utf8'));
const S = area.scale ?? 1.25;

// ------------------------------------------------------------------ the map's game coordinates

// The builder projects lat/lon around the middle of the bbox, scales by S and shifts everything by
// (cx, cz) so the first route is centred. The map's zone is the zone points put through all that,
// which gives the shift away.
const src = fs.readFileSync(path.join(DIR, 'map.js'), 'utf8');
const MAP = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const [bs, bw, bn, be] = area.bbox;
const lat0 = (bs + bn) / 2, lon0 = (bw + be) / 2;
const kx = 111320 * Math.cos((lat0 * Math.PI) / 180), kz = 110574;
const scaled = (lat, lon) => [(lon - lon0) * kx * S, -(lat - lat0) * kz * S];
const shift = (() => {
  const zp = area.zone_points.map(([la, lo]) => scaled(la, lo));
  const z = [MAP.zone[0], MAP.zone[1]];
  for (const p of zp) {
    const o = [p[0] - z[0], p[1] - z[1]];
    const hits = zp.filter(q => Array.from({ length: MAP.zone.length / 2 }, (_, i) => i)
      .some(i => Math.hypot(q[0] - o[0] - MAP.zone[2 * i], q[1] - o[1] - MAP.zone[2 * i + 1]) < 0.2)).length;
    if (hits >= Math.min(3, zp.length)) return o;
  }
  throw new Error('cannot place the map: its zone does not match the zone points of ' + city);
})();
const game = (lat, lon) => { const p = scaled(lat, lon); return [p[0] - shift[0], p[1] - shift[1]]; };

// Lambert 72 -> game, as an affine map fitted around a point: exact enough over a few hundred metres
// (it takes up the turn between the Lambert grid and the map's north).
function fitAround(lat, lon) {
  const rows = [];
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const la = lat + i * 0.002, lo = lon + j * 0.003;
    rows.push([lambert72(la, lo), game(la, lo)]);
  }
  const [mx, my] = [0, 1].map(k => rows.reduce((a, r) => a + r[0][k], 0) / rows.length);
  // least squares for out = a*(x-mx) + b*(y-my) + c, for each output axis
  const solve = k => {
    let sxx = 0, sxy = 0, syy = 0, sxo = 0, syo = 0, so = 0;
    for (const [[x, y], o] of rows) {
      const dx = x - mx, dy = y - my;
      sxx += dx * dx; sxy += dx * dy; syy += dy * dy; sxo += dx * o[k]; syo += dy * o[k]; so += o[k];
    }
    const det = sxx * syy - sxy * sxy;
    return [(sxo * syy - syo * sxy) / det, (syo * sxx - sxo * sxy) / det, so / rows.length];
  };
  const [ax, az] = [solve(0), solve(1)];
  return (x, y) => [ax[0] * (x - mx) + ax[1] * (y - my) + ax[2], az[0] * (x - mx) + az[1] * (y - my) + az[2]];
}

// ------------------------------------------------------------------ Gent in 3D tiles

// Every polyface mesh in a tile: [{ v: [[x, y, z]], f: [[i, j, k(, l)]] }] with 0-based indices, in
// Lambert 72. Read from the DWG by LibreDWG's dwgread as JSON (its dwg2dxf leaves out the meshes on
// a layer it does not like, a quarter of some tiles, the Sint-Jacobskerk's among them), then kept
// in tools/cache/gent3d/ as just the meshes.
let links = null;
async function tileMeshes(tx, ty) {
  const name = `${tx}_${ty}`, kept = path.join(CACHE, `Geb_${name}.meshes.json`);
  if (fs.existsSync(kept)) return JSON.parse(fs.readFileSync(kept, 'utf8'));
  fs.mkdirSync(CACHE, { recursive: true });
  if (!links) {
    links = new Map();
    for (let off = 0; ; off += 100) {
      const page = await (await fetch(`${LIST}?limit=100&offset=${off}`)).json();
      for (const r of page.results) links.set(r.vaknummer, r.link_naar_open_data);
      if (off + 100 >= page.total_count) break;
    }
  }
  const url = links.get(`${String(tx).padStart(3, '0')}_${ty}`);
  if (!url) throw new Error(`no Gent in 3D tile ${name}`);
  console.error(`downloading tile ${name}`);
  const zip = path.join(CACHE, `${name}.zip`), dir = path.join(CACHE, name), json = path.join(CACHE, `${name}.json`);
  fs.writeFileSync(zip, Buffer.from(await (await fetch(url)).arrayBuffer()));
  execFileSync('unzip', ['-oq', zip, '-d', dir]);
  const dwg = fs.readdirSync(dir).find(f => f.startsWith('Geb_') && f.endsWith('.dwg'));
  execFileSync('dwgread', ['-O', 'JSON', '-o', json, path.join(dir, dwg)], { stdio: 'ignore' });
  const meshes = await readMeshes(json);
  fs.writeFileSync(kept, JSON.stringify(meshes));
  for (const f of [dir, zip, json]) fs.rmSync(f, { recursive: true });
  return meshes;
}

// The meshes in dwgread's JSON, read line by line (it runs to half a gigabyte a tile): each vertex
// and face record says whose it is by its owner's handle, in the order they come.
async function readMeshes(json) {
  const meshes = new Map(), lines = readline.createInterface({ input: fs.createReadStream(json), crlfDelay: Infinity });
  let rec = null, list = null;
  const last = s => { const l = s.slice(0, s.lastIndexOf(']')); return Number(l.slice(l.lastIndexOf(',') + 1)); }; // [code, ..., handle]
  const done = () => {
    if (!rec) return;
    if (rec.kind === 'POLYLINE_PFACE') meshes.set(rec.handle, { v: [], f: [] });
    const m = meshes.get(rec.owner);
    if (m && rec.kind === 'VERTEX_PFACE' && rec.point) m.v.push(rec.point);
    if (m && rec.kind === 'VERTEX_PFACE_FACE' && rec.vertind) {
      const f = rec.vertind.filter(i => i).map(i => Math.abs(i) - 1);
      if (f.length >= 3) m.f.push(f);
    }
    rec = null;
  };
  for await (const raw of lines) {
    const line = raw.trim();
    if (list) {
      // the face's vertex numbers, one to a line
      if (line.startsWith(']')) { rec.vertind = list; list = null; } else list.push(parseInt(line, 10));
      continue;
    }
    // a new record: an entity, or an object (a layer, a block: not ours, but it ends the last one)
    const kind = line.match(/^"(entity|object)": "([A-Z_0-9]+)"/);
    if (kind) { done(); rec = { kind: kind[2] }; continue; }
    if (!rec) continue;
    if (line.startsWith('"handle":')) rec.handle = last(line);
    else if (line.startsWith('"ownerhandle":')) rec.owner = last(line);
    else if (line.startsWith('"point":')) rec.point = JSON.parse(line.slice(8).replace(/,$/, '').trim());
    else if (line.startsWith('"vertind":')) {
      if (line.includes(']')) rec.vertind = JSON.parse(line.slice(10).replace(/,$/, '').trim());
      else list = [];
    }
  }
  done();
  return [...meshes.values()].filter(m => m.v.length && m.f.length);
}

// ------------------------------------------------------------------ the landmarks

const osm = JSON.parse(fs.readFileSync(path.join(HERE, 'cache', city + '.json'), 'utf8'));
const ways = new Map(osm.ways.map(w => [w.id, w]));
const inside = (x, y, p) => {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if ((p[i][1] > y) !== (p[j][1] > y) && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
  }
  return c;
};
const r1 = v => Math.round(v * 10) / 10;
const tiles = new Map();

// game -> lat/lon, the way back of game()
const latLon = (gx, gz) => [lat0 - (gz + shift[1]) / S / kz, lon0 + (gx + shift[0]) / S / kx];

// Smallest rectangle around a ring of [x, y]: { o: corner, u, v: its sides as vectors }.
function box(ring) {
  let best = null;
  for (let k = 0; k + 1 < ring.length; k++) {
    const a = Math.atan2(ring[k + 1][1] - ring[k][1], ring[k + 1][0] - ring[k][0]), c = Math.cos(a), s = Math.sin(a);
    const us = ring.map(p => p[0] * c + p[1] * s), vs = ring.map(p => -p[0] * s + p[1] * c);
    const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)];
    if (!best || (u1 - u0) * (v1 - v0) < best.area) {
      best = { area: (u1 - u0) * (v1 - v0), o: [u0 * c - v0 * s, u0 * s + v0 * c], u: [(u1 - u0) * c, (u1 - u0) * s], v: [-(v1 - v0) * s, (v1 - v0) * c] };
    }
  }
  return best;
}

// A roof built after the Gent in 3D scan, from the DHMV II heights (2013-2015) instead: a shell
// following the measured roof over the outline's rectangle, on a pillar near each corner, open
// underneath (the LiDAR only sees the top). Returns { v, i, top, pillars, skin } in game metres,
// the pillars as outlines: riders ride in under the roof, and only the pillars stop them.
async function dhmvRoof(lm, lring, toGame) {
  const at = await surface(area.bbox, path.join(HERE, 'cache', city + '-dhmv.bin'));
  const { o, u, v: w } = box(lring), lu = Math.hypot(...u), lw = Math.hypot(...w);
  const nu = Math.max(2, Math.round(lu)), nw = Math.max(2, Math.round(lw));
  const P = (a, b) => [o[0] + u[0] * a + w[0] * b, o[1] + u[1] * a + w[1] * b]; // a, b in 0..1
  // the middle of the roof heights around each grid point: what the LiDAR saw of the ground or the
  // square beside the roof (below `low`) left out, and points that saw no roof at all filled in
  // from their neighbours, so the edge does not sag down to the street
  const raw = (a, b) => at(...latLon(...toGame(...P(a, b))));
  let peak = 0;
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nw; j++) peak = Math.max(peak, raw(i / nu, j / nw) || 0);
  const low = peak * 0.45, H = [];
  for (let i = 0; i <= nu; i++) {
    H.push([]);
    for (let j = 0; j <= nw; j++) {
      const hs = [];
      for (const da of [-1, 0, 1]) for (const db of [-1, 0, 1]) {
        const h = raw((i + da) / nu, (j + db) / nw);
        if (h > low) hs.push(h);
      }
      H[i].push(hs.length >= 3 ? hs.sort((x, y) => x - y)[hs.length >> 1] : NaN);
    }
  }
  for (let pass = 0, empty = true; empty && pass < 20; pass++) {
    empty = false;
    const was = H.map(row => [...row]);
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nw; j++) {
      if (!Number.isNaN(was[i][j])) continue;
      const nb = [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]].map(([p, q]) => was[p]?.[q]).filter(h => h > 0);
      if (nb.length) H[i][j] = nb.reduce((x, y) => x + y) / nb.length;
      else empty = true;
    }
  }
  // one cross-section the whole length of the roof (the Stadshal's two gables): the middle of the
  // heights along each line, along whichever side explains them best, which also smooths out the
  // LiDAR's noise on a glass roof
  const median = a => [...a].sort((x, y) => x - y)[a.length >> 1];
  const along = [...Array(nu + 1).keys()].map(i => median(H[i])), across = [...Array(nw + 1).keys()].map(j => median(H.map(row => row[j])));
  let errAlong = 0, errAcross = 0;
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nw; j++) { errAlong += Math.abs(H[i][j] - along[i]); errAcross += Math.abs(H[i][j] - across[j]); }
  const smooth = p => p.map((_, k) => median([p[k - 1] ?? p[k], p[k], p[k + 1] ?? p[k]]));
  const profile = smooth(errAlong < errAcross ? along : across);
  // The roof as a hood over that cross-section, `gables` side by side (the Stadshal has two): the
  // eaves at both sides, each gable's ridge where the measured profile is highest and the valley
  // between two where it is lowest, on upright sides down to its underside `under` m above the
  // street; one shell `thick` m thick and open at both ends, so you see the timber inside.
  // `skin` names what each triangle is: g the glass outside, w the timber inside, e its edges,
  // p the concrete pillars.
  const flip = errAlong < errAcross; // does the profile run along u (and the roof along w)?
  const len = flip ? lu : lw, n = profile.length - 1;
  const meas = flip ? along : across, pt = k => [(k / n) * len, meas[k]], g = lm.gables ?? 1;
  const extreme = (k0, k1, sign) => { let b = k0; for (let k = k0; k <= k1; k++) if (sign * (meas[k] - meas[b]) > 0) b = k; return b; };
  const ridges = [...Array(g).keys()].map(q => extreme(Math.round((q * n) / g) + 1, Math.round(((q + 1) * n) / g) - 1, 1));
  const eave = median([meas[1], meas[2], meas[n - 2], meas[n - 1]]);
  const tops = ridges.flatMap((k, q) => (q ? [pt(extreme(ridges[q - 1], k, -1)), pt(k)] : [pt(k)]));
  const under = lm.under ?? low, thick = lm.thick ?? 1;
  const outer = [[0, under], [0, eave], ...tops, [len, eave], [len, under]];
  const inner = outer.map((q, k) => {
    // the inside: every corner moved in by `thick`, square to both its sides (a mitre)
    const nOf = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [dy / L, -dx / L]; };
    const n1 = k > 0 ? nOf(outer[k - 1], q) : null, n2 = k < outer.length - 1 ? nOf(q, outer[k + 1]) : null;
    const [a, b] = [n1 ?? n2, n2 ?? n1], d = 1 + a[0] * b[0] + a[1] * b[1];
    return [q[0] + (thick * (a[0] + b[0])) / d, q[1] + (thick * (a[1] + b[1])) / d];
  });
  const V = [], I = [];
  let skin = '';
  const vert = (x, y, h) => { const [gx, gz] = toGame(x, y); V.push(r1(gx), r1(h * S), r1(gz)); return V.length / 3 - 1; };
  const at2 = ([s, h], along) => vert(...(flip ? P(s / len, along) : P(along, s / len)), h);
  const quad = (kind, a, b, c, d) => { I.push(a, b, c, a, c, d); skin += kind + kind; };
  for (let k = 0; k + 1 < outer.length; k++) {
    quad('g', at2(outer[k], 0), at2(outer[k + 1], 0), at2(outer[k + 1], 1), at2(outer[k], 1));
    quad('w', at2(inner[k], 0), at2(inner[k], 1), at2(inner[k + 1], 1), at2(inner[k + 1], 0));
    for (const e of [0, 1]) quad('e', at2(outer[k], e), at2(inner[k], e), at2(inner[k + 1], e), at2(outer[k + 1], e));
  }
  for (const k of [0, outer.length - 1]) quad('e', at2(outer[k], 0), at2(outer[k], 1), at2(inner[k], 1), at2(inner[k], 0));
  // a square pillar near each corner, up to the underside of the shell
  const side = (lm.pillar ?? 0.9) / S, pillars = [];
  for (const [a, b] of [[0.12, 0.2], [0.88, 0.2], [0.12, 0.8], [0.88, 0.8]]) {
    const ua = side / 2 / lu, wb = side / 2 / lw;
    const cs = [[a - ua, b - wb], [a + ua, b - wb], [a + ua, b + wb], [a - ua, b + wb]].map(([p, q]) => P(p, q));
    const lo = cs.map(c => vert(...c, 0)), hi = cs.map(c => vert(...c, under));
    pillars.push(cs.flatMap(c => toGame(...c).map(r1)));
    for (let k = 0; k < 4; k++) quad('p', lo[k], lo[(k + 1) % 4], hi[(k + 1) % 4], hi[k]);
  }
  console.error(`${lm.name}: cross-section ${outer.map(([s, h]) => `${s.toFixed(1)}/${h.toFixed(1)}`).join(' ')} (metres across/up)`);
  return { v: V, i: I, top: peak * S, pillars, skin };
}

// A landmark Gent in 3D does not have (its tile has a hole there, like the Sint-Jacobskerk's), from
// the DHMV II heights instead: upright walls on its outline, and a roof that follows the measured
// surface over a grid of `cell` m, cut off at the outline. Each grid point takes the middle of what
// the LiDAR saw around it inside the outline; those outside take their neighbours', so the roof
// does not sag to the street at the walls. Returns { v, i, skin, top } in game metres, the skin
// r for the roof (and nothing for the walls: they wear the landmark's look).
async function dsmModel(lm, lrings, toGame) {
  const at = await surface(area.bbox, path.join(HERE, 'cache', city + '-dhmv.bin'));
  const raw = (x, y) => at(...latLon(...toGame(x, y)));
  const inAny = (x, y) => lrings.some(r => inside(x, y, r));
  const xs = lrings.flat().map(p => p[0]), ys = lrings.flat().map(p => p[1]), cell = lm.cell ?? 1;
  const X0 = Math.min(...xs) - cell, Y0 = Math.min(...ys) - cell;
  const nx = Math.ceil((Math.max(...xs) - X0) / cell) + 1, ny = Math.ceil((Math.max(...ys) - Y0) / cell) + 1;
  const median = a => [...a].sort((p, q) => p - q)[a.length >> 1];
  let H = [];
  for (let j = 0; j <= ny; j++) {
    H.push([]);
    for (let i = 0; i <= nx; i++) {
      const hs = [];
      for (const dx of [-0.5, 0, 0.5]) for (const dy of [-0.5, 0, 0.5]) {
        const x = X0 + i * cell + dx * cell, y = Y0 + j * cell + dy * cell, h = raw(x, y);
        if (inAny(x, y) && h > 1) hs.push(h);
      }
      H[j].push(hs.length >= 3 ? median(hs) : NaN);
    }
  }
  for (let pass = 0, empty = true; empty && pass < 30; pass++) {
    empty = false;
    const was = H.map(row => [...row]);
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      if (!Number.isNaN(was[j][i])) continue;
      const nb = [[j - 1, i], [j + 1, i], [j, i - 1], [j, i + 1]].map(([q, p]) => was[q]?.[p]).filter(h => h > 0);
      if (nb.length) H[j][i] = nb.reduce((a, b) => a + b) / nb.length;
      else empty = true;
    }
  }
  // the roof's height anywhere: on the plane of the grid triangle under the point
  const roofAt = (x, y) => {
    const fx = Math.min(nx - 1e-6, Math.max(0, (x - X0) / cell)), fy = Math.min(ny - 1e-6, Math.max(0, (y - Y0) / cell));
    const i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j;
    const a = H[j][i], b = H[j][i + 1], c = H[j + 1][i + 1], d = H[j + 1][i];
    return u >= v ? a + (b - a) * u + (c - b) * v : a + (c - d) * u + (d - a) * v;
  };
  const V = [], I = [], seen = new Map();
  let skin = '';
  // one vertex for every point, however many triangles share it
  const vert = (x, y, h) => {
    const [gx, gz] = toGame(x, y), key = [r1(gx), r1(h * S), r1(gz)];
    if (!seen.has(key.join())) { V.push(...key); seen.set(key.join(), V.length / 3 - 1); }
    return seen.get(key.join());
  };
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([p, q]) => [X0 + p * cell, Y0 + q * cell]);
      for (const tri of [[c[0], c[1], c[2]], [c[0], c[2], c[3]]]) {
        for (const ring of lrings) {
          const piece = clipToTriangle(ring, tri);
          if (!piece) continue;
          const ids = piece.map(([x, y]) => vert(x, y, roofAt(x, y)));
          for (const [a, b, d] of earClip(piece)) { I.push(ids[a], ids[b], ids[d]); skin += 'r'; }
        }
      }
    }
  }
  // the walls, along the outline in pieces of about a cell
  for (const ring of lrings) {
    for (let k = 0; k + 1 < ring.length; k++) {
      const [ax, ay] = ring[k], [bx, by] = ring[k + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / cell));
      for (let s = 0; s < n; s++) {
        const p = [ax + ((bx - ax) * s) / n, ay + ((by - ay) * s) / n], q = [ax + ((bx - ax) * (s + 1)) / n, ay + ((by - ay) * (s + 1)) / n];
        const lo = [vert(...p, 0), vert(...q, 0)], hi = [vert(...p, roofAt(...p)), vert(...q, roofAt(...q))];
        I.push(lo[0], lo[1], hi[1], lo[0], hi[1], hi[0]);
        skin += '  ';
      }
    }
  }
  return { v: V, i: I, skin, top: Math.max(...H.flat().filter(h => h > 0)) * S };
}

// A landmark with plain upright walls and a flat top ("source": "flat", the Boekentoren's shaft): a
// prism on its outline, `height` real metres tall (else its OSM height tag), the top in concrete.
// The LiDAR roof of such a tower comes out ragged, as its edges catch the ground beside it.
function flatModel(lm, lrings, toGame, tags) {
  const h = Number(lm.height ?? tags?.height) * S, V = [], I = [];
  let skin = '';
  const vert = (x, y, up) => { const [gx, gz] = toGame(x, y); V.push(r1(gx), r1(up), r1(gz)); return V.length / 3 - 1; };
  for (const ring of lrings) {
    const pts = ring.slice(0, ring.length - (ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1] ? 1 : 0));
    const lo = pts.map(p => vert(...p, 0)), hi = pts.map(p => vert(...p, h));
    for (let k = 0; k < pts.length; k++) {
      const j = (k + 1) % pts.length;
      I.push(lo[k], lo[j], hi[j], lo[k], hi[j], hi[k]);
      skin += '  ';
    }
    for (const [a, b, c] of earClip(pts)) { I.push(hi[a], hi[b], hi[c]); skin += 'p'; }
  }
  return { v: V, i: I, skin, top: h };
}

// Ring (a list of [x, y], closed or not) clipped to the convex triangle tri, Sutherland-Hodgman.
function clipToTriangle(ring, tri) {
  let pts = ring.slice(0, ring.length - (ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1] ? 1 : 0));
  const turn = Math.sign((tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1]) - (tri[1][1] - tri[0][1]) * (tri[2][0] - tri[0][0]));
  for (let e = 0; e < 3 && pts.length; e++) {
    const [a, b] = [tri[e], tri[(e + 1) % 3]], side = q => turn * ((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]));
    const next = [];
    pts.forEach((q, k) => {
      const r = pts[(k + 1) % pts.length], sq = side(q), sr = side(r);
      if (sq >= 0) next.push(q);
      if ((sq >= 0) !== (sr >= 0)) { const t = sq / (sq - sr); next.push([q[0] + (r[0] - q[0]) * t, q[1] + (r[1] - q[1]) * t]); }
    });
    pts = next.filter((q, k) => Math.hypot(q[0] - next[(k + 1) % next.length][0], q[1] - next[(k + 1) % next.length][1]) > 1e-6);
  }
  return pts.length >= 3 ? pts : null;
}

// A simple polygon's triangles (indices into it), by cutting off ears.
function earClip(p) {
  const area = p.reduce((s, q, k) => s + q[0] * p[(k + 1) % p.length][1] - p[(k + 1) % p.length][0] * q[1], 0), sign = Math.sign(area) || 1;
  const cross = (a, b, c) => sign * ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  const idx = p.map((_, k) => k), tris = [];
  for (let guard = 0; idx.length > 3 && guard < 1000; guard++) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const [a, b, c] = [idx[(k + idx.length - 1) % idx.length], idx[k], idx[(k + 1) % idx.length]];
      if (cross(p[a], p[b], p[c]) <= 1e-12) continue;
      if (idx.some(m => m !== a && m !== b && m !== c && cross(p[a], p[b], p[m]) > 0 && cross(p[b], p[c], p[m]) > 0 && cross(p[c], p[a], p[m]) > 0)) continue;
      tris.push([a, b, c]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) tris.push(idx);
  return tris;
}

// A way the map's cache does not have (the outer way of a multipolygon, like the Stadhuis's, has no
// tags of its own, so the map never fetched it): from the OSM API, cached in tools/cache/osm-ways/.
async function fetchWay(id) {
  const file = path.join(HERE, 'cache', 'osm-ways', `${id}.json`);
  if (!fs.existsSync(file)) {
    console.error(`fetching OSM way ${id}`);
    const res = await fetch(`https://api.openstreetmap.org/api/0.6/way/${id}/full.json`);
    if (!res.ok) throw new Error(`OSM way ${id}: ${res.status}`);
    const els = (await res.json()).elements, nodes = new Map(els.filter(e => e.type === 'node').map(e => [e.id, e]));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(els.find(e => e.type === 'way').nodes.map(n => [nodes.get(n).lat, nodes.get(n).lon])));
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const out = [];
for (const lm of conf.landmarks) {
  const rings = await Promise.all(lm.osm.map(async id => {
    const w = ways.get(id);
    return w ? w.nodes.map(n => osm.nodes[n]).map(v => [v.lat, v.lon]) : fetchWay(id);
  }));
  const all = rings.flat(), lat = all.reduce((a, p) => a + p[0], 0) / all.length, lon = all.reduce((a, p) => a + p[1], 0) / all.length;
  const toGame = fitAround(lat, lon);
  const lrings = rings.map(r => r.map(([la, lo]) => lambert72(la, lo)));
  const foot = rings.map(r => r.flatMap(([la, lo]) => game(la, lo).map(r1)));
  if (lm.source === 'dhmv') {
    const roof = await dhmvRoof(lm, lrings.flat(), toGame);
    console.error(`${lm.name}: roof from the DHMV heights, ${roof.v.length / 3} vertices, ${roof.i.length / 3} triangles, ${roof.top.toFixed(1)} m high (game metres)`);
    out.push({ id: lm.id, name: lm.name, look: lm.look ?? 'stone', osm: lm.osm, foot, open: roof.pillars, v: roof.v, i: roof.i, skin: roof.skin });
    continue;
  }
  if (lm.source === 'flat') {
    const m = flatModel(lm, lrings, toGame, ways.get(lm.osm[0])?.tags);
    console.error(`${lm.name}: upright walls and a flat top, ${m.top.toFixed(1)} m high (game metres)`);
    out.push({ id: lm.id, name: lm.name, look: lm.look ?? 'stone', osm: lm.osm, foot, v: m.v, i: m.i, skin: m.skin });
    continue;
  }
  const need = new Set(lrings.flat().map(([x, y]) => `${Math.floor(x / 1000)}_${Math.floor(y / 1000)}`));
  const picked = [];
  for (const t of need) {
    if (!tiles.has(t)) {
      const [tx, ty] = t.split('_').map(Number);
      tiles.set(t, await tileMeshes(tx, ty));
    }
    for (const m of tiles.get(t)) {
      const cx = m.v.reduce((a, v) => a + v[0], 0) / m.v.length, cy = m.v.reduce((a, v) => a + v[1], 0) / m.v.length;
      // its middle inside the outline, or a good part of it (the Lakenhalle's middle lies out in its yard)
      const share = m.v.filter(v => lrings.some(r => inside(v[0], v[1], r))).length / m.v.length;
      if (lrings.some(r => inside(cx, cy, r)) || share >= 0.4) picked.push(m);
    }
  }
  if (!picked.length || lm.source === 'dsm') {
    // not in Gent in 3D (built after the scan, or a hole in its tile): from the LiDAR heights
    const m = await dsmModel(lm, lrings, toGame);
    console.error(`${lm.name}: from the DHMV heights, ${m.v.length / 3} vertices, ${m.i.length / 3} triangles, ${m.top.toFixed(1)} m high (game metres)`);
    out.push({ id: lm.id, name: lm.name, look: lm.look ?? 'stone', osm: lm.osm, foot, v: m.v, i: m.i, skin: m.skin });
    continue;
  }
  // heights above the lowest ground of the landmark; each mesh's own bottom is pulled down to the
  // game's flat ground, so nothing floats where the real ground rises: the foot of every wall (the
  // lowest corner where it stands, within FOOT of the mesh's lowest), not just the lowest of them all
  const FOOT = 4;
  const base = Math.min(...picked.flatMap(m => m.v.map(v => v[2])));
  const v = [], idx = [];
  let top = 0;
  for (const m of picked) {
    const bottom = Math.min(...m.v.map(q => q[2])), first = v.length / 3;
    const spot = (x, y) => `${Math.round(x * 20)},${Math.round(y * 20)}`, low = new Map();
    for (const [x, y, z] of m.v) low.set(spot(x, y), Math.min(low.get(spot(x, y)) ?? Infinity, z));
    for (const [x, y, z] of m.v) {
      const foot = z - bottom < 0.05 || (z - low.get(spot(x, y)) < 0.05 && z - bottom < FOOT);
      const [gx, gz] = toGame(x, y), gy = foot ? 0 : (z - base) * S;
      v.push(r1(gx), r1(gy), r1(gz));
      top = Math.max(top, gy);
    }
    for (const f of m.f) for (let k = 1; k + 1 < f.length; k++) idx.push(first + f[0], first + f[k], first + f[k + 1]);
  }
  console.error(`${lm.name}: ${picked.length} parts, ${v.length / 3} vertices, ${idx.length / 3} triangles, ${top.toFixed(1)} m high (game metres)`);
  out.push({ id: lm.id, name: lm.name, look: lm.look ?? 'stone', osm: lm.osm, foot, v, i: idx });
}

// ------------------------------------------------------------------ the hollows

// A square lying lower than its streets (the Emile Braunplein's lawns slope down to the cellar
// under the Stadshal), from the DHMV II's bare ground: how far below the streets around it every
// point of its box [x0, z0, x1, z1] (game metres) lies. The streets' own heights are a plane
// fitted to the ground under them, as the map is flat; the hollow starts `min` m below that (less is
// the plane not quite fitting), and the ground at the houses is left at the street. Returns { id, name, x0, z0,
// cell, nx, nz, d }: d the depths in decimetres (game), at the nx + 1 by nz + 1 corners of the
// cells, row by row.
async function hollow(h) {
  const [x0, z0, x1, z1] = h.box, cell = h.cell ?? 1.5, pad = 40;
  const corners = [[x0 - pad, z0 - pad], [x1 + pad, z0 - pad], [x0 - pad, z1 + pad], [x1 + pad, z1 + pad]].map(c => lambert72(...latLon(...c)));
  const ground = await terrain([Math.min(...corners.map(c => c[0])), Math.min(...corners.map(c => c[1])),
    Math.max(...corners.map(c => c[0])), Math.max(...corners.map(c => c[1]))], path.join(HERE, 'cache', `${city}-dtm-${h.id}.bin`));
  const dtm = (x, z) => ground(...lambert72(...latLon(x, z)));
  // the plane through the streets around it, by least squares (the footpaths across it left out)
  const pts = [];
  for (const rd of MAP.roads) {
    if (rd.foot) continue;
    for (let k = 0; k + 3 < rd.p.length; k += 2) {
      for (let t = 0; t <= 1; t += 0.1) {
        const x = rd.p[k] + (rd.p[k + 2] - rd.p[k]) * t, z = rd.p[k + 1] + (rd.p[k + 3] - rd.p[k + 1]) * t, y = dtm(x, z);
        if (x > x0 - pad && x < x1 + pad && z > z0 - pad && z < z1 + pad && !Number.isNaN(y)) pts.push([x, z, y]);
      }
    }
  }
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], B = [0, 0, 0];
  for (const [x, z, y] of pts) {
    const v = [x, z, 1];
    for (let i = 0; i < 3; i++) { B[i] += v[i] * y; for (let j = 0; j < 3; j++) A[i][j] += v[i] * v[j]; }
  }
  const det = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const [a, b, c] = [0, 1, 2].map(i => det(A.map((row, r) => row.map((v, k) => (k === i ? B[r] : v)))) / det(A));
  // the houses' outlines, and a little round them (not the open landmarks: the ground runs on under those)
  const open = out.filter(lm => lm.open).flatMap(lm => lm.foot);
  const houses = MAP.buildings.map(bd => bd.p).filter(p => p.some((v, k) => k % 2 === 0 && v > x0 - 20 && v < x1 + 20 && p[k + 1] > z0 - 20 && p[k + 1] < z1 + 20))
    .filter(p => !open.some(f => inside(...centreOf(p), pairs(f))));
  const nearHouse = (x, z) => houses.some(p => inside(x, z, pairs(p)) || pairs(p).some((q, k, r) => segDist(x, z, q, r[(k + 1) % r.length]) < 1.2));
  const nx = Math.ceil((x1 - x0) / cell), nz = Math.ceil((z1 - z0) / cell), d = [];
  const median = v => [...v].sort((p, q) => p - q)[v.length >> 1];
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const x = x0 + i * cell, z = z0 + j * cell;
      const y = median([[0, 0], [0.6, 0], [-0.6, 0], [0, 0.6], [0, -0.6]].map(([dx, dz]) => dtm(x + dx, z + dz)));
      const below = (y - (a * x + b * z + c)) * S;
      const dip = Math.min(0, below + (h.min ?? 0.45) * S);
      d.push(dip < 0 && !nearHouse(x, z) ? Math.round(dip * 10) : 0);
    }
  }
  // a wall comes out of the scan smeared over a metre or two: every corner on one goes to its top
  // or its foot, whichever is nearer, so it stands up in one go (its neighbours range over more
  // than `wall` m)
  const at = (i, j) => d[Math.max(0, Math.min(nz, j)) * (nx + 1) + Math.max(0, Math.min(nx, i))];
  const crisp = d.map((v, k) => {
    const i = k % (nx + 1), j = Math.floor(k / (nx + 1)), around = [];
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) around.push(at(i + di, j + dj));
    const hi = Math.max(...around), lo = Math.min(...around);
    return hi - lo > (h.wall ?? 1) * S * 10 ? (v - lo < hi - v ? lo : hi) : v;
  });
  d.splice(0, d.length, ...crisp);
  console.error(`${h.name}: ${nx} x ${nz} cells of ${cell} m, down to ${(Math.min(...d) / 10).toFixed(1)} m (game metres)`);
  return { id: h.id, name: h.name, x0, z0, cell, nx, nz, d };
}
const pairs = p => Array.from({ length: p.length / 2 }, (_, k) => [p[2 * k], p[2 * k + 1]]);
const centreOf = p => [0, 1].map(o => (2 * p.reduce((s, v, k) => (k % 2 === o ? s + v : s), 0)) / p.length);
function segDist(x, z, [ax, az], [bx, bz]) {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1e-9)));
  return Math.hypot(x - ax - t * dx, z - az - t * dz);
}
const hollows = [];
for (const h of conf.hollows ?? []) hollows.push(await hollow(h));

const dest = path.join(DIR, 'landmarks.js');
fs.writeFileSync(dest, `// ${city} landmarks: generated by tools/gent3d.mjs from landmarks.json, do not edit by hand.\n`
  + '// 3D models: Stad Gent, Gent in 3D, open data under the Modellicentie Gratis Hergebruik.\n'
  + (conf.landmarks.some(lm => lm.source === 'dhmv') || hollows.length ? '// Heights: Digitaal Vlaanderen, Digitaal Hoogtemodel Vlaanderen II (DHMV II), open data.\n' : '')
  + `export const LANDMARKS = ${JSON.stringify(out)};\n`
  + `export const HOLLOWS = ${JSON.stringify(hollows)};\n`);
