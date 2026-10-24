#!/usr/bin/env node
// The tram lines, routed over the map's tram tracks. Writes <city>/tramlines.js from
// <city>/tramlines.json:
//
//     node tools/tramlines.mjs ghent
//
// tramlines.json names each line by the places it runs past ([lat, lon], in order, one end of the
// line to the other); this finds the way there and back along the tracks, one way on the right-hand
// track as trams drive in Belgium, with the stops along it. Where the tracks are missing from
// OpenStreetMap (taken up during works), `gaps` lays them along the streets in between, [lat, lon]
// from one track to the next (or down the middle of a race route: `route`, its id): they are drawn
// like the others and the lines run over them; `links` joins two tracks where the curve between
// them is missing. `stops` names streets the lines stop at where the map has no tram halt, or puts a
// stop on the spot, { name, at: [lat, lon], width? (its platform's, metres) }: that one wins over a
// halt of the map's close by (one that moved). Each stop
// gets a De Lijn sign to wait at, the map's own (transit.js) where there is one.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';
import { tramNetwork } from '../core/js/tramnet.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const city = process.argv[2];
const DIR = path.join(HERE, '..', city ?? '');
if (!city || !fs.existsSync(path.join(DIR, 'tramlines.json'))) { console.error('usage: node tools/tramlines.mjs <city>'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(path.join(DIR, 'tramlines.json'), 'utf8'));
const { MAP, game } = mapCoords(DIR, city);
const { STOPS, TRAM_HALTS } = await import(path.join(DIR, 'transit.js'));

const r1 = v => Math.round(v * 10) / 10;
const LANE = 1.6 * 1.25; // the two tracks of a double track lie this far either side of the street's middle, game metres
const JOIN = 1.2, TURN = 0.75; // as in core/js/tramnet.js: track ends this near are joined, and the sharpest bend
const GAP_END = 15; // metres: a gap's tracks stop this far short of the street's ends, for the curve onto the tracks there

// ------------------------------------------------------------------ the gaps

// the way along the streets from (ax, az) to (bx, bz): the shortest, over the map's roads
const roadKey = (x, z) => `${Math.round(x)},${Math.round(z)}`;
const roadNodes = new Map();
for (const r of MAP.roads) {
  if (r.foot) continue;
  for (let k = 0; k + 3 < r.p.length; k += 2) {
    const a = roadKey(r.p[k], r.p[k + 1]), b = roadKey(r.p[k + 2], r.p[k + 3]), w = Math.hypot(r.p[k + 2] - r.p[k], r.p[k + 3] - r.p[k + 1]);
    for (const [u, v] of [[a, b], [b, a]]) (roadNodes.get(u) ?? roadNodes.set(u, []).get(u)).push([v, w]);
  }
}
function roadPath(ax, az, bx, bz) {
  const snap = (x, z) => [...roadNodes.keys()].reduce((best, k) => {
    const [kx, kz] = k.split(',').map(Number), d = Math.hypot(kx - x, kz - z);
    return d < best[1] ? [k, d] : best;
  }, [null, Infinity])[0];
  const s = snap(ax, az), t = snap(bx, bz), dist = new Map([[s, 0]]), prev = new Map(), open = [[0, s]];
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [d, u] = open.shift();
    if (u === t) break;
    if (d > dist.get(u)) continue;
    for (const [v, w] of roadNodes.get(u) ?? []) {
      if (d + w < (dist.get(v) ?? Infinity)) { dist.set(v, d + w); prev.set(v, u); open.push([d + w, v]); }
    }
  }
  if (!prev.has(t)) throw new Error(`no streets lead from ${s} to ${t}`);
  const keys = [t];
  while (keys[0] !== s) keys.unshift(prev.get(keys[0]));
  return keys.map(k => k.split(',').map(Number));
}

// a line [[x, z], ...] moved off sideways by off (right of the way it runs, x east and z south)
function offset(pts, off) {
  return pts.map(([x, z], i) => {
    const [ax, az] = pts[Math.max(0, i - 1)], [bx, bz] = pts[Math.min(pts.length - 1, i + 1)], L = Math.hypot(bx - ax, bz - az) || 1;
    return [x - ((bz - az) / L) * off, z + ((bx - ax) / L) * off];
  });
}

// the nearest point on the map's tracks to (x, z)
function onTracks(x, z) {
  let best = [Infinity, x, z];
  for (const t of MAP.trams) {
    for (let k = 0; k + 3 < t.p.length; k += 2) {
      const [ax, az, bx, bz] = t.p.slice(k, k + 4), dx = bx - ax, dz = bz - az;
      const f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))), cx = ax + dx * f, cz = az + dz * f;
      const d = Math.hypot(x - cx, z - cz);
      if (d < best[0]) best = [d, cx, cz];
    }
  }
  return best;
}

// Each gap: a track each way along the streets, the right-hand one each way. They stop short of the
// tracks at either end; the curves onto those are laid below, with the network's joins.
const extra = [];
for (const g of spec.gaps ?? []) {
  const at = [g.from, ...(g.via ?? []), g.to].map(([lat, lon]) => game(lat, lon));
  for (const [x, z] of [at[0], at.at(-1)]) {
    if (onTracks(x, z)[0] > 25) throw new Error(`gap ${g.about}: an end lies ${Math.round(onTracks(x, z)[0])} m off the tracks`);
  }
  const street = [];
  if (g.route) {
    // down the middle of a race route (its streets are not among the map's roads), from and to the
    // points of it nearest the ends
    const rt = MAP.routes.find(r => r.id === g.route).route, nearest = ([x, z]) => rt.reduce((b, p, i) => (Math.hypot(p[0] - x, p[1] - z) < Math.hypot(rt[b][0] - x, rt[b][1] - z) ? i : b), 0);
    const i = nearest(at[0]), j = nearest(at.at(-1));
    street.push(...(i < j ? rt.slice(i, j + 1) : rt.slice(j, i + 1).reverse()));
  } else for (let k = 0; k + 1 < at.length; k++) street.push(...roadPath(...at[k], ...at[k + 1]).slice(k ? 1 : 0));
  const pts = street.filter((p, i) => i === 0 || i === street.length - 1 || Math.hypot(p[0] - street[i - 1][0], p[1] - street[i - 1][1]) > 2);
  for (const way of [pts, pts.slice().reverse()]) {
    const lane = offset(way, LANE).filter(([x, z], i, all) => Math.hypot(x - all[0][0], z - all[0][1]) > GAP_END && Math.hypot(x - all.at(-1)[0], z - all.at(-1)[1]) > GAP_END);
    extra.push({ p: lane.flat().map(r1), gap: true });
  }
}

// ------------------------------------------------------------------ the routes

// The tracks as one-way segments, joined where one ends near another or on it: the network's
// own idea of which way each track runs (tramnet.js), the gaps one way each.
const net = tramNetwork([...MAP.trams, ...extra.map(({ p }) => ({ p }))], TRAM_HALTS);
const ways = net.edges.map(e => ({ pts: e.pts.map(([x, , z]) => [x, z]), dirs: e.dir ? [e.dir] : [1, -1], gap: e.id >= MAP.trams.length }));
for (const w of ways) if (w.gap) w.dirs = [1];
// cut every way where another way starts or ends on it, so trams can leave and join anywhere
const ends = ways.flatMap(w => [w.pts[0], w.pts.at(-1)]);
for (const w of ways) {
  for (const [x, z] of ends) {
    for (let k = 0; k + 1 < w.pts.length; k++) {
      const [ax, az] = w.pts[k], [bx, bz] = w.pts[k + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1e-9;
      const f = ((x - ax) * dx + (z - az) * dz) / L2;
      if (f <= 0.01 || f >= 0.99) continue;
      const cx = ax + dx * f, cz = az + dz * f;
      if (Math.hypot(x - cx, z - cz) <= JOIN && Math.hypot(cx - ax, cz - az) > 0.3 && Math.hypot(cx - bx, cz - bz) > 0.3) { w.pts.splice(k + 1, 0, [cx, cz]); break; }
    }
  }
}
// the segments, each one way
const segs = [];
for (const w of ways) {
  for (const dir of w.dirs) {
    const pts = dir > 0 ? w.pts : w.pts.slice().reverse();
    let last = null;
    for (let k = 0; k + 1 < pts.length; k++) {
      const [ax, az] = pts[k], [bx, bz] = pts[k + 1], L = Math.hypot(bx - ax, bz - az);
      if (L < 1e-3) continue;
      const s = { a: pts[k], b: pts[k + 1], L, ux: (bx - ax) / L, uz: (bz - az) / L, next: [], way: w };
      last?.next.push(s); // along the same track, whatever the bend
      segs.push((last = s));
    }
  }
}
const C = 20, grid = new Map(), cell = (x, z) => `${Math.floor(x / C)},${Math.floor(z / C)}`;
for (const s of segs) (grid.get(cell(...s.a)) ?? grid.set(cell(...s.a), []).get(cell(...s.a))).push(s);
for (const s of segs) {
  const [x, z] = s.b, [i, j] = cell(x, z).split(',').map(Number);
  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      for (const n of grid.get(`${i + di},${j + dj}`) ?? []) {
        if (n === s || s.next.includes(n) || Math.hypot(n.a[0] - x, n.a[1] - z) > JOIN) continue;
        if (s.ux * n.ux + s.uz * n.uz > Math.cos(TURN)) s.next.push(n);
      }
    }
  }
}

// The joins the works cut: a track that ends with another starting a little way on (a station's
// platforms cut off from the tracks either side, a gap's tracks) is joined to it by a smooth curve,
// and a gap's track is joined onto from the track it leaves.
const BRIDGE = 120;
const comesInto = n => segs.some(o => o.next.includes(n));
function bridge(s, n) {
  // a Hermite curve from the end of s to the start of n, leaving and arriving along each
  const d = Math.hypot(n.a[0] - s.b[0], n.a[1] - s.b[1]), pts = [];
  for (let k = 0; k <= 12; k++) {
    const t = k / 12, h1 = 2 * t ** 3 - 3 * t ** 2 + 1, h2 = t ** 3 - 2 * t ** 2 + t, h3 = -2 * t ** 3 + 3 * t ** 2, h4 = t ** 3 - t ** 2;
    pts.push([h1 * s.b[0] + h2 * s.ux * d + h3 * n.a[0] + h4 * n.ux * d, h1 * s.b[1] + h2 * s.uz * d + h3 * n.a[1] + h4 * n.uz * d]);
  }
  let prev = s;
  for (let k = 0; k + 1 < pts.length; k++) {
    const [ax, az] = pts[k], [bx, bz] = pts[k + 1], L = Math.hypot(bx - ax, bz - az);
    const b = { a: pts[k], b: pts[k + 1], L, ux: (bx - ax) / L, uz: (bz - az) / L, next: [] };
    segs.push(b);
    prev.next.push(b);
    prev = b;
  }
  prev.next.push(n);
  extra.push({ p: pts.flat().map(r1) });
}
// The way a track runs at its end (or start), over its last (first) 10 m: a short bend at the
// very end says little about where it goes.
const before = new Map();
for (const s of segs) for (const n of s.next) before.set(n, s);
function along(s, back) {
  let p = back ? s.b : s.a, q = p, cur = s, len = 0;
  while (cur && len < 10) {
    q = back ? cur.a : cur.b;
    len += cur.L;
    cur = back ? before.get(cur) : cur.next[0];
  }
  const dx = (q[0] - p[0]) * (back ? -1 : 1), dz = (q[1] - p[1]) * (back ? -1 : 1), L = Math.hypot(dx, dz) || 1;
  return [dx / L, dz / L];
}
// how well s carries on into n: on ahead of the one, coming into the other, and not turning back
// (higher is better), or null
function fit(s, n) {
  const dx = n.a[0] - s.b[0], dz = n.a[1] - s.b[1], d = Math.hypot(dx, dz);
  if (d <= JOIN || d > BRIDGE) return null;
  const [sx, sz] = along(s, true), [nx, nz] = along(n, false);
  const out = (dx * sx + dz * sz) / d, into = (dx * nx + dz * nz) / d;
  if (out < 0.25 || into < 0.25 || sx * nx + sz * nz < -0.2) return null;
  return out + into - d / BRIDGE;
}
for (const w of ways) if (w.gap) for (const s of segs) if (s.way === w) s.lane = true;
const deadEnds = segs.filter(s => !s.next.length), starts = segs.filter(s => !comesInto(s));
// the best of list by score (higher is better; null: not at all)
const best = (list, score) => list.reduce((b, x) => { const f = score(x); return f !== null && (!b || f > b[0]) ? [f, x] : b; }, null)?.[1];
// a track that just ends: on into each track starting out of nowhere a little way on
for (const s of deadEnds) for (const n of starts) if (n !== s && fit(s, n) !== null) bridge(s, n);
// the curves tramlines.json names (`links`: [lat, lon] on the track coming in and on the one going
// out): from the nearest piece of the one, round to the nearest of the other
const toward = (s, x, z) => { const [sx, sz] = along(s, true), dx = x - s.b[0], dz = z - s.b[1]; return (dx * sx + dz * sz) / (Math.hypot(dx, dz) || 1); };
for (const l of spec.links ?? []) {
  const [fx, fz] = game(...l.from), [tx, tz] = game(...l.to);
  const dist = (p, x, z) => Math.hypot(p[0] - x, p[1] - z);
  const s = segs.filter(s => !s.lane && toward(s, tx, tz) > 0).sort((a, b) => dist(a.b, fx, fz) - dist(b.b, fx, fz))[0];
  const n = segs.filter(n => !n.lane && dist(n.a, tx, tz) < 15 && n !== s).sort((a, b) => dist(a.a, tx, tz) - dist(b.a, tx, tz))
    .find(n => { const [nx, nz] = along(n, false), dx = n.a[0] - s.b[0], dz = n.a[1] - s.b[1]; return dx * nx + dz * nz > 0; });
  if (!s || !n || dist(s.b, fx, fz) > 15) throw new Error(`link ${l.about}: no tracks there to join`);
  bridge(s, n);
}
// and a track that still just ends, with a track going its way close ahead: onto that (the curve
// between them left out)
for (const s of deadEnds.filter(s => !s.next.length)) {
  const n = best(segs.filter(n => n !== s && Math.hypot(n.a[0] - s.b[0], n.a[1] - s.b[1]) < 40), n => fit(s, n));
  if (n) bridge(s, n);
}
// a gap's track that still ends in nothing: onto the nearest track going its way
for (const s of segs.filter(s => s.lane && !s.next.length)) {
  const n = best(segs.filter(n => !n.lane && n.next.length), n => fit(s, n));
  if (n) bridge(s, n);
}
// and a gap's track that nothing leads into yet: off the nearest track going its way
for (const n of segs.filter(n => n.lane && !comesInto(n))) {
  const s = best(segs.filter(s => !s.lane), s => fit(s, n));
  if (s) bridge(s, n);
}

// the tracks nearest (x, z), both ways where it is a double track: within 40 m, and within a few
// metres of the nearest (or 25 m)
function near(x, z) {
  const d = segs.map(s => {
    const dx = s.b[0] - s.a[0], dz = s.b[1] - s.a[1], f = Math.max(0, Math.min(1, ((x - s.a[0]) * dx + (z - s.a[1]) * dz) / (s.L * s.L)));
    return Math.hypot(x - s.a[0] - dx * f, z - s.a[1] - dz * f);
  });
  const min = Math.min(...d);
  return min > 40 ? [] : segs.filter((s, i) => d[i] < Math.max(min + 8, 25));
}

// a priority queue of [cost, ...], cheapest first
function heap() {
  const h = [];
  return {
    size: () => h.length,
    push(e) {
      h.push(e);
      for (let i = h.length - 1; i > 0;) { const p = (i - 1) >> 1; if (h[p][0] <= h[i][0]) break; [h[p], h[i]] = [h[i], h[p]]; i = p; }
    },
    pop() {
      const top = h[0], last = h.pop();
      if (h.length) {
        h[0] = last;
        for (let i = 0; ;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < h.length && h[l][0] < h[m][0]) m = l;
          if (r < h.length && h[r][0] < h[m][0]) m = r;
          if (m === i) break;
          [h[m], h[i]] = [h[i], h[m]];
          i = m;
        }
      }
      return top;
    },
  };
}

// A line one way: the shortest way over the joins from its first place, past each in turn, to its
// last. A place is passed on any track near it; the search goes over (segment, places passed so far).
function runOf(places, label) {
  // a place is [lat, lon], or a list of them: either will do (where the tracks each way part)
  const sets = places.map(pl => new Set((Array.isArray(pl[0]) ? pl : [pl]).flatMap(([lat, lon]) => near(...game(lat, lon)))));
  segs.forEach((s, i) => (s.i = i));
  sets.forEach((set, k) => { if (!set.size) throw new Error(`${label}: no tracks near [${places[k]}]`); });
  const passed = (s, k) => { while (k < sets.length && sets[k].has(s)) k++; return k; };
  let most = 0;
  const key = (s, k) => `${s.i}:${k}`, dist = new Map(), prev = new Map(), open = heap();
  for (const s of sets[0]) { const k = passed(s, 0); dist.set(key(s, k), s.L); open.push([s.L, s, k]); }
  while (open.size()) {
    const [d, s, k] = open.pop();
    most = Math.max(most, k);
    if (d > dist.get(key(s, k))) continue;
    if (k === sets.length) {
      const path = [s];
      for (let c = key(s, k); prev.has(c);) { const [ps, pk] = prev.get(c); path.unshift(ps); c = key(ps, pk); }
      const p = [path[0].a, ...path.map(q => q.b)];
      return p.filter((q, i) => i === 0 || Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) > 0.05);
    }
    for (const n of s.next) {
      const nk = passed(n, k), c = key(n, nk);
      if (d + n.L < (dist.get(c) ?? Infinity)) { dist.set(c, d + n.L); prev.set(c, [s, k]); open.push([d + n.L, n, nk]); }
    }
  }
  throw new Error(`${label}: no tracks lead on from [${places[most - 1]}] past [${places[most]}]`);
}

const named = MAP.roads.filter(r => 'n' in r);
function streetName(x, z) {
  let best = [Infinity, ''];
  for (const r of named) {
    for (let k = 0; k + 3 < r.p.length; k += 2) {
      const [ax, az, bx, bz] = r.p.slice(k, k + 4), dx = bx - ax, dz = bz - az;
      const f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))), d = Math.hypot(x - ax - dx * f, z - az - dz * f);
      if (d < best[0]) best = [d, MAP.names[r.n]];
    }
  }
  return best[1];
}
// The stops along a run: the tram halts on it, named after the nearest stop sign or else the
// street; and where it crosses or passes one of the streets tramlines.json names under `stops`
// (stops the map has no halt for, along the gaps), named after that street.
function stopsAlong(pts) {
  const cum = [0];
  for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  const along = (x, z) => {
    let best = [Infinity, 0];
    for (let k = 0; k + 1 < pts.length; k++) {
      const [ax, az] = pts[k], [bx, bz] = pts[k + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1e-9;
      const f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)), d = Math.hypot(x - ax - dx * f, z - az - dz * f);
      if (d < best[0]) best = [d, cum[k] + f * (cum[k + 1] - cum[k])];
    }
    return best;
  };
  const point = s => {
    let k = 0;
    while (k < pts.length - 2 && cum[k + 1] < s) k++;
    const f = (s - cum[k]) / (cum[k + 1] - cum[k] || 1);
    return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f];
  };
  const found = [];
  for (let k = 0; k < TRAM_HALTS.length; k += 2) {
    const [d, s] = along(TRAM_HALTS[k], TRAM_HALTS[k + 1]);
    if (d < 2.5) {
      const [x, z] = point(s);
      let sign = null, sd = 45;
      for (const st of STOPS) { const dd = Math.hypot(st.x - x, st.z - z); if (dd < sd && st.name) { sd = dd; sign = st; } }
      found.push({ at: s, name: sign?.name ?? streetName(x, z) });
    }
  }
  for (const st of spec.stops ?? []) {
    if (typeof st !== 'string') {
      const [d, s] = along(...game(...st.at));
      if (d < 15) found.push({ at: s, name: st.name, width: st.width, fixed: true });
      continue;
    }
    const street = st, n = MAP.names.indexOf(street);
    let best = [Infinity, 0];
    for (const r of MAP.roads) if (r.n === n) for (let k = 0; k < r.p.length; k += 2) { const a = along(r.p[k], r.p[k + 1]); if (a[0] < best[0]) best = a; }
    if (best[0] < 40) found.push({ at: best[1], name: street });
  }
  found.sort((a, b) => a.at - b.at);
  const out = [];
  for (const f of found) {
    if (f.at < 20 || f.at > cum.at(-1) - 5) continue;
    // one platform mapped twice, both ends of one, or one stop over a stretch of the same street
    // (one put on the spot wins over the map's)
    if (out.length && (f.at - out.at(-1).at < 60 || (f.name === out.at(-1).name && f.at - out.at(-1).at < 400))) {
      if (f.fixed && !out.at(-1).fixed) out[out.length - 1] = f;
      continue;
    }
    out.push(f);
  }
  return { len: cum.at(-1), stops: out.map(f => ({ at: r1(f.at), name: f.name, ...(f.width ? { width: f.width } : {}) })) };
}

// how high the track lies at (x, z): over a bridge the map's tracks say, elsewhere on the street
const heights = MAP.trams.filter(t => t.y).flatMap(t => t.y.map((y, k) => [t.p[k * 2], t.p[k * 2 + 1], y]));
const heightAt = (x, z) => {
  let best = [2, 0];
  for (const [hx, hz, y] of heights) { const d = Math.hypot(hx - x, hz - z); if (d < best[0]) best = [d, y]; }
  return best[1];
};

const lines = [];
for (const l of spec.lines) {
  for (const [places, to, from] of [[l.via, l.to, l.from], [l.via.slice().reverse(), l.from, l.to]]) {
    const pts = runOf(places, `line ${l.ref} to ${to}`);
    const { len, stops } = stopsAlong(pts);
    const line = { ref: l.ref, colour: l.colour, to, from, p: pts.flat().map(r1), stops };
    const y = pts.map(([x, z]) => r1(heightAt(x, z)));
    if (y.some(v => v > 0.05)) line.y = y;
    lines.push(line);
    console.log(`line ${l.ref} to ${to}: ${(len / 1250).toFixed(1)} km, ${stops.length} stops: ${stops.map(s => s.name).join(', ')}`);
  }
}

// ------------------------------------------------------------------ the stop signs

// Where to wait for each stop: by the sign that is there (a stop sign on the kerb on the side the
// trams that way open their doors, the right), or else a new one put on that kerb. One sign serves
// every line stopping there going that way. TRAM_STOPS lists them all; the new ones get drawn.
const roads = MAP.roads.filter(r => !r.foot);
function kerb(x, z, rx, rz) {
  // the street the track runs down, and how far right of the track its kerb lies
  let best = null;
  for (const r of roads) {
    for (let k = 0; k + 3 < r.p.length; k += 2) {
      const [ax, az, bx, bz] = r.p.slice(k, k + 4), dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1e-9;
      const f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)), cx = ax + dx * f, cz = az + dz * f, d = Math.hypot(x - cx, z - cz);
      if (d < 10 && (!best || d < best.d)) best = { d, w: r.w, side: (x - cx) * rx + (z - cz) * rz };
    }
  }
  return best ? best.w / 2 + 1.1 - best.side : 6; // no street found (a race route's): beside its usual width
}
const signs = [];
lines.forEach((l, run) => {
  const pts = [];
  for (let k = 0; k < l.p.length; k += 2) pts.push([l.p[k], l.p[k + 1]]);
  const cum = [0];
  for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  for (const st of l.stops) {
    let k = 0;
    while (k < pts.length - 2 && cum[k + 1] < st.at) k++;
    const L = cum[k + 1] - cum[k] || 1, f = (st.at - cum[k]) / L, ux = (pts[k + 1][0] - pts[k][0]) / L, uz = (pts[k + 1][1] - pts[k][1]) / L;
    const x = pts[k][0] + ux * L * f, z = pts[k][1] + uz * L * f, rx = -uz, rz = ux; // right of the way it goes
    // a sign there already, on this side: a De Lijn stop of the map's, or one put up for another line
    const mine = s => Math.hypot(s.x - x, s.z - z) < 25 && (s.x - x) * rx + (s.z - z) * rz > 0.5;
    let sign = signs.find(mine);
    if (!sign) {
      const old = STOPS.filter(mine).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z))[0];
      const off = kerb(x, z, rx, rz);
      sign = old
        ? { x: old.x, z: old.z, y: old.y, a: old.a, name: st.name, serves: [] }
        : { x: r1(x + rx * off), z: r1(z + rz * off), y: r1(heightAt(x, z)), a: Math.round(Math.atan2(uz, ux) * 100) / 100, name: st.name, serves: [], put: true };
      signs.push(sign);
    }
    sign.serves.push([run, st.at]);
    if (st.width) sign.w = st.width;
  }
});
console.log(`${signs.length} stop signs, ${signs.filter(s => s.put).length} of them new`);

fs.writeFileSync(path.join(DIR, 'tramlines.js'), `// ${city}: the tram lines, made from tramlines.json by \`node tools/tramlines.mjs ${city}\`, do not edit by hand.
// Map data © OpenStreetMap contributors, available under the Open Database License (ODbL).
// TRAM_TRACKS: the tracks laid over the gaps, { p: flat [x, z, ...] }, drawn and driven like the map's own.
// TRAM_LINES: each line each way, { ref, colour, to, from, p: flat [x, z, ...] along the track it runs on,
//   y?: heights, stops: { at: metres along p, name } }
// TRAM_STOPS: where to wait, by a stop sign: { x, z, y, a (the way the sign faces, as in transit.js), name,
//   serves: [line (its index in TRAM_LINES), metres along it], put: a new sign, not one of transit.js's,
//   w?: how wide its platform is, metres }
export const TRAM_TRACKS = ${JSON.stringify(extra.map(({ p }) => ({ p })))};
export const TRAM_LINES = ${JSON.stringify(lines)};
export const TRAM_STOPS = ${JSON.stringify(signs.map(s => ({ ...s, serves: s.serves.map(([run, at]) => [run, r1(at)]) })))};
`);
