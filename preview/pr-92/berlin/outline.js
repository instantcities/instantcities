// The parts Berlin's landmarks share, on top of core/js/arcade.js (the way prague/outline.js does it
// for the Rudolfinum): a map building's outline in a monument's own metres, its sides as paths, a
// block raised on it and a roof from one ring up to a smaller one; and for the domes of the
// Reichstag, the Dom, the Gendarmenmarkt's towers and St. Hedwig's: a dome on a round drum, its
// ribs, a ring of columns round it and a lantern on top.
import * as THREE from 'three';
import { linePath, ellipsePath, column, wall, sweep, archRing } from '../core/js/arcade.js';
import { MAP } from './map.js';

// the middle of a flat [x, z, ...] ring
export const mid = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };

// whether (x, z) lies inside the flat ring p
export function inside([x, z], p) {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  return c;
}

// the map's buildings of kind k whose middles lie within r of (x, z)
export const buildings = (k, x, z, r) => MAP.buildings.filter(b => b.k === k && Math.hypot(mid(b.p)[0] - x, mid(b.p)[1] - z) < r);
// the one nearest (x, z) within r, or none
export const nearest = (k, x, z, r = 4) => buildings(k, x, z, r).sort((a, b) => Math.hypot(mid(a.p)[0] - x, mid(a.p)[1] - z) - Math.hypot(mid(b.p)[0] - x, mid(b.p)[1] - z))[0];

// a flat ring in the city's metres as [[u, v], ...] in a monument's own, at (X, Z) turned by `turn`
// (the inverse of arcade.js's onMap)
export function local(p, X, Z, turn) {
  const c = Math.cos(turn), s = Math.sin(turn), out = [];
  for (let k = 0; k < p.length; k += 2) { const dx = p[k] - X, dz = p[k + 1] - Z; out.push([dx * c - dz * s, dx * s + dz * c]); }
  return out;
}

// a ring [[u, v], ...]'s middle, its size along u and v, and its radius when round
export function box(ring) {
  const us = ring.map(p => p[0]), vs = ring.map(p => p[1]);
  const u0 = Math.min(...us), u1 = Math.max(...us), v0 = Math.min(...vs), v1 = Math.max(...vs);
  return { u: (u0 + u1) / 2, v: (v0 + v1) / 2, du: u1 - u0, dv: v1 - v0, u0, u1, v0, v1, r: (u1 - u0 + v1 - v0) / 4 };
}

const area2 = ring => ring.reduce((sum, [u, v], i) => { const [u2, v2] = ring[(i + 1) % ring.length]; return sum + u * v2 - u2 * v; }, 0);

// the sides of a ring, each a straight path with the outside to its right, leaving out the ones
// shorter than `min`
export function sides(ring, min = 0.4) {
  const r = area2(ring) > 0 ? ring : ring.slice().reverse();
  return r.map((p, i) => linePath(...p, ...r[(i + 1) % r.length])).filter(path => path.length >= min);
}

// a ring [[u, v], ...] raised from y0 to y1, as a solid block
export function prism(kit, ring, y0, y1, hex) {
  const shape = new THREE.Shape(ring.map(([u, v]) => new THREE.Vector2(u, -v)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false }).rotateX(-Math.PI / 2);
  return kit.add(geo, hex, 0, y0, 0);
}

// A roof from the ring `low` at y0 up to `high` at y1, two rings of as many corners, in the same
// order: a hipped roof. Its faces look up.
export function roof(kit, low, high, y0, y1, hex, { cap = true } = {}) {
  const pos = [], n = low.length, A = new THREE.Vector3(), B = new THREE.Vector3();
  const tri = (p, q, r) => {
    A.subVectors(q, p); B.subVectors(r, p);
    const [a, b, c] = A.cross(B).y < 0 ? [p, r, q] : [p, q, r];
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  };
  const L = low.map(([u, v]) => new THREE.Vector3(u, y0, v)), H = high.map(([u, v]) => new THREE.Vector3(u, y1, v));
  for (let k = 0; k < n; k++) { const j = (k + 1) % n; tri(L[k], L[j], H[j]); tri(L[k], H[j], H[k]); }
  if (cap) for (const [i, j, k] of THREE.ShapeUtils.triangulateShape(high.map(([u, v]) => new THREE.Vector2(u, v)), [])) tri(H[i], H[j], H[k]);
  const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return kit.add(geo, hex);
}

// a ring drawn towards its middle by `f` (0: as it is, 1: to a point; less than 0: out)
export function shrink(ring, f) {
  const [cu, cv] = ring.reduce(([a, b], [u, v]) => [a + u / ring.length, b + v / ring.length], [0, 0]);
  return ring.map(([u, v]) => [u + (cu - u) * f, v + (cv - v) * f]);
}

// A cornice round a ring at y (its top), standing `out` proud, `h` deep, and a balustrade on it
// when `rail` (its height).
export function cornice(kit, ring, y, hex, { out = 0.7, h = 1.2, rail = 0, railHex = hex, min = 0.4 } = {}) {
  for (const path of sides(ring, min)) {
    const L = path.length;
    sweep(kit, path, 0, L, [[-0.2, y - h], [out * 0.4, y - h], [out * 0.4, y - h * 0.45], [out, y - h * 0.2], [out, y], [-0.2, y]], hex, { step: L });
    if (rail) {
      wall(kit, path, [[0, y], [L, y], [L, y + rail], [0, y + rail]], { o0: -0.35, o1: -0.05, hex: railHex });
      wall(kit, path, [[0, y + rail], [L, y + rail], [L, y + rail + 0.25], [0, y + rail + 0.25]], { o0: -0.45, o1: 0.05, hex });
    }
  }
  return kit;
}

// Windows along each side of a ring longer than `min`: one every `bay` metres, w wide from y0 to y1,
// round-headed when `arch`, dark panels standing just proud of the wall, with a sill under each.
export function windows(kit, ring, { bay, w, y0, y1, arch = false, hex = '#33373b', sill, min = 0, skip = () => false }) {
  // skip(u, v): leave out the window there (behind a portico)
  for (const [k, path] of sides(ring, Math.max(min, bay * 0.8)).entries()) {
    const L = path.length, n = Math.max(1, Math.floor(L / bay)), b = L / n;
    for (let i = 0; i < n; i++) {
      const s = (i + 0.5) * b, at = path.at(s);
      if (skip(at.x, at.z)) continue;
      wall(kit, path, arch ? archRing(s, w, y0, y1, 8) : [[s - w / 2, y0], [s + w / 2, y0], [s + w / 2, y1], [s - w / 2, y1]], { o0: -0.1, o1: 0.08, hex });
      if (sill) wall(kit, path, [[s - w / 2 - 0.2, y0 - 0.25], [s + w / 2 + 0.2, y0 - 0.25], [s + w / 2 + 0.2, y0], [s - w / 2 - 0.2, y0]], { o0: -0.1, o1: 0.3, hex: sill });
    }
  }
  return kit;
}

// A dome at (u, v): its foot r across at y0, h high, a shell of `n` sides, and `ribs` ribs up it
// standing out a little (in ribHex); squashed or raised as h is less or more than r.
export function dome(kit, u, v, r, y0, h, hex, { n = 24, ribs = 0, ribHex = hex, rows = 8 } = {}) {
  kit.add(new THREE.SphereGeometry(r, n, rows, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, h / r, 1), hex, u, y0, v);
  for (let k = 0; k < ribs; k++) {
    const a = (k / ribs) * Math.PI * 2, pts = [];
    for (let j = 0; j <= 6; j++) {
      const t = (j / 6) * (Math.PI / 2) * 0.96, rr = (r + 0.12) * Math.cos(t);
      pts.push([u + rr * Math.cos(a), y0 + (h + 0.12) * Math.sin(t), v + rr * Math.sin(a)]);
    }
    for (let j = 0; j < 6; j++) kit.rod(pts[j], pts[j + 1], Math.max(0.12, r * 0.025), ribHex, 4);
  }
  return kit;
}

// A ring of `n` columns round (u, v) at radius r, from y0 to y1, in an order, with the entablature
// over them (a ring `ent` deep) when `ent`.
export function colonnade(kit, u, v, r, n, y0, y1, cr, hex, { order = 'corinthian', ent = 0, entHex = hex } = {}) {
  const path = ellipsePath(r, r), moved = { length: path.length, closed: true, at: s => { const p = path.at(s); return { ...p, x: p.x + u, z: p.z + v }; } };
  for (let k = 0; k < n; k++) column(kit, moved, (k / n) * path.length, 0, y0, y1, cr, hex, order);
  if (ent) sweep(kit, moved, 0, path.length, [[-cr * 1.4, y1], [cr * 1.4, y1], [cr * 1.4, y1 + ent], [-cr * 1.4, y1 + ent]], entHex, { step: Math.max(1, r * 0.3) });
  return kit;
}

// A drum at (u, v): a round wall r across from y0 to y1 of `n` sides, with `win` round-headed windows
// round it (w wide, from wy0 to wy1 above y0).
export function drum(kit, u, v, r, y0, y1, hex, { n = 24, win = 0, w = 1.4, wy0 = 1, wy1, winHex = '#2e3236' } = {}) {
  kit.add(new THREE.CylinderGeometry(r, r, y1 - y0, n), hex, u, (y0 + y1) / 2, v);
  if (win) {
    const path = ellipsePath(r, r), moved = { length: path.length, closed: true, at: s => { const p = path.at(s); return { ...p, x: p.x + u, z: p.z + v }; } };
    for (let k = 0; k < win; k++) {
      const s = ((k + 0.5) / win) * path.length;
      wall(kit, moved, archRing(s, w, y0 + wy0, y0 + (wy1 ?? (y1 - y0) * 0.8), 6), { o0: -0.1, o1: 0.06, hex: winHex });
    }
  }
  return kit;
}

// A lantern on top of a dome at (u, v): a little round drum r across from y0, `h` high, with its
// openings, its cap, and the orb and cross (or a figure's place) on top up to `tip`.
export function lantern(kit, u, v, r, y0, h, tip, hex, capHex, gold) {
  colonnade(kit, u, v, r * 0.85, 8, y0, y0 + h, Math.max(0.12, r * 0.12), hex, { order: 'tuscan' });
  kit.add(new THREE.CylinderGeometry(r * 0.6, r * 0.6, h, 8), '#2d3135', u, y0 + h / 2, v);
  kit.add(new THREE.CylinderGeometry(r * 1.05, r * 1.05, h * 0.12, 12), hex, u, y0 + h * 1.06, v);
  dome(kit, u, v, r, y0 + h * 1.12, r * 0.9, capHex, { n: 12, rows: 4 });
  const top = y0 + h * 1.12 + r * 0.9;
  if (tip > top) {
    kit.rod([u, top - 0.1, v], [u, tip, v], Math.max(0.08, r * 0.08), gold, 6);
    kit.add(new THREE.SphereGeometry(Math.max(0.25, r * 0.22), 8, 6), gold, u, top + (tip - top) * 0.35, v);
    kit.box(Math.max(0.6, r * 0.5), Math.max(0.1, r * 0.07), Math.max(0.1, r * 0.07), gold, u, tip - (tip - top) * 0.18, v);
  }
  return kit;
}

// a standing figure (a statue) h high at (x, y, z)
export function figure(kit, x, y, z, h, hex) {
  kit.add(new THREE.CylinderGeometry(h * 0.14, h * 0.2, h * 0.78, 7), hex, x, y + h * 0.39, z);
  kit.add(new THREE.SphereGeometry(h * 0.11, 7, 5), hex, x, y + h * 0.86, z);
  return kit;
}

// a triangular pediment over a front w wide (along u, its face towards -v... turned by `turn`), its
// foot at y, `rise` high, `deep` deep, standing at (u, v)
export function pediment(kit, u, v, w, y, rise, deep, hex, turn = 0) {
  const shape = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, rise)]);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: deep, bevelEnabled: false }).translate(0, 0, -deep / 2).rotateY(turn);
  return kit.add(geo, hex, u, y, v);
}

// A portico of `n` columns across a front, on `steps` steps up to y0: `path` runs along the front's
// line with its right to the outside, from s0 to s1; the columns stand behind the top step, from y0
// to y1, and carry an entablature and a pediment (`rise` high) back to the wall, `deep` in.
export function portico(kit, path, s0, s1, { n = 6, y0, y1, r, order = 'corinthian', deep, rise, hex, hex2, steps = 0 }) {
  const w = s1 - s0, mid = path.at((s0 + s1) / 2), turn = Math.atan2(-mid.tz, mid.tx); // a box's x along the path
  const at = (s, o, y) => { const p = path.at(s); return [p.x + o * p.tz, y, p.z - o * p.tx]; };
  // the steps up, from the front's line in
  for (let k = 0; k < Math.max(1, steps); k++) {
    const o = -k * 0.45, oIn = -deep, y = y0 * ((k + 1) / Math.max(1, steps));
    const [x, , z] = at((s0 + s1) / 2, (o + oIn) / 2, 0);
    kit.box(w + 2 - k * 0.2, y0 / Math.max(1, steps), Math.abs(oIn - o), k % 2 ? hex2 : hex, x, y - y0 / Math.max(1, steps) / 2, z, 0, turn);
  }
  const oc = -(steps * 0.45 + r * 1.6);
  for (let k = 0; k < n; k++) column(kit, path, s0 + r * 2 + (k / (n - 1)) * (w - r * 4), oc, y0, y1, r, hex, order);
  // the entablature from the columns back to the wall, and the pediment on it
  const [ex, , ez] = at((s0 + s1) / 2, (oc + r * 1.4 - deep) / 2, 0), ed = deep + oc + r * 1.4;
  kit.box(w + 0.6, 1.4, Math.abs(ed), hex2, ex, y1 + 0.7, ez, 0, turn);
  kit.box(w + 0.6, 1.4, Math.abs(ed), hex, ex, y1 + 2.1, ez, 0, turn);
  kit.box(w + 1.4, 0.6, Math.abs(ed) + 0.6, hex2, ex, y1 + 3.1, ez, 0, turn);
  pediment(kit, ex, ez, w + 1.2, y1 + 3.4, rise, Math.abs(ed) + 0.4, hex, turn);
  const [tx, , tz] = at((s0 + s1) / 2, oc + r * 1.4 + 0.3, 0);
  kit.box(w * 0.4, rise * 0.3, 0.25, hex2, tx, y1 + 3.4 + rise * 0.25, tz, 0, turn); // the tympanum's relief
}
