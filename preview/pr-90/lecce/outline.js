// The parts Lecce's landmarks share, on top of core/js/arcade.js (the way berlin/outline.js and
// prague/outline.js do it): a map building's outline in a monument's own metres, its sides as paths,
// a block raised on it (with its courtyards left open), a roof from one ring up to a smaller one, a
// cornice with a balustrade, rows of windows, a dome on a drum and its lantern; a ring cut off along
// a straight line; and a front built in a frame of its own and stood on the model.
import * as THREE from 'three';
import { linePath, wall, sweep, archRing } from '../core/js/arcade.js';
import { MAP } from './map.js';

// the middle of a flat [x, z, ...] ring
export const mid = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };

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

// a ring [[u, v], ...]'s middle, and its size along u and v
export function box(ring) {
  const us = ring.map(p => p[0]), vs = ring.map(p => p[1]);
  const u0 = Math.min(...us), u1 = Math.max(...us), v0 = Math.min(...vs), v1 = Math.max(...vs);
  return { u: (u0 + u1) / 2, v: (v0 + v1) / 2, du: u1 - u0, dv: v1 - v0, u0, u1, v0, v1 };
}

const area2 = ring => ring.reduce((sum, [u, v], i) => { const [u2, v2] = ring[(i + 1) % ring.length]; return sum + u * v2 - u2 * v; }, 0);

// the sides of a ring, each a straight path with the outside to its right (`hole`: a courtyard's
// ring, whose outside is the yard), leaving out the ones shorter than `min`
export function sides(ring, min = 0.4, hole = false) {
  const r = (area2(ring) > 0) !== hole ? ring : ring.slice().reverse();
  return r.map((p, i) => linePath(...p, ...r[(i + 1) % r.length])).filter(path => path.length >= min);
}

// a ring [[u, v], ...] raised from y0 to y1 as a solid block, with its courtyards (`holes`) left open
export function prism(kit, ring, y0, y1, hex, holes = []) {
  const shape = new THREE.Shape(ring.map(([u, v]) => new THREE.Vector2(u, -v)));
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(([u, v]) => new THREE.Vector2(u, -v))));
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
// when `rail` (its height). `hole`: the ring is a courtyard's.
export function cornice(kit, ring, y, hex, { out = 0.7, h = 1.2, rail = 0, railHex = hex, min = 0.4, hole = false } = {}) {
  for (const path of sides(ring, min, hole)) {
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
// round-headed when `arch`, dark panels standing just proud of the wall, with a sill under each and
// a lintel or a little pediment over it when `head` ('flat' or 'tri'). skip(u, v): none there.
export function windows(kit, ring, { bay, w, y0, y1, arch = false, hex = '#3a3129', sill, head, min = 0, hole = false, skip = () => false }) {
  for (const path of sides(ring, Math.max(min, bay * 0.8), hole)) {
    const L = path.length, n = Math.max(1, Math.floor(L / bay)), b = L / n;
    for (let i = 0; i < n; i++) {
      const s = (i + 0.5) * b, at = path.at(s);
      if (skip(at.x, at.z)) continue;
      wall(kit, path, arch ? archRing(s, w, y0, y1, 8) : [[s - w / 2, y0], [s + w / 2, y0], [s + w / 2, y1], [s - w / 2, y1]], { o0: -0.1, o1: 0.08, hex });
      if (sill) wall(kit, path, [[s - w / 2 - 0.25, y0 - 0.3], [s + w / 2 + 0.25, y0 - 0.3], [s + w / 2 + 0.25, y0], [s - w / 2 - 0.25, y0]], { o0: -0.1, o1: 0.32, hex: sill });
      if (sill && head === 'flat') wall(kit, path, [[s - w / 2 - 0.35, y1 + 0.15], [s + w / 2 + 0.35, y1 + 0.15], [s + w / 2 + 0.35, y1 + 0.55], [s - w / 2 - 0.35, y1 + 0.55]], { o0: -0.1, o1: 0.35, hex: sill });
      if (sill && head === 'tri') wall(kit, path, [[s - w / 2 - 0.4, y1 + 0.15], [s + w / 2 + 0.4, y1 + 0.15], [s, y1 + 0.2 + w * 0.42]], { o0: -0.1, o1: 0.35, hex: sill });
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
      const t = (j / 6) * (Math.PI / 2) * 0.96, rr = (r + 0.1) * Math.cos(t);
      pts.push([u + rr * Math.cos(a), y0 + (h + 0.1) * Math.sin(t), v + rr * Math.sin(a)]);
    }
    for (let j = 0; j < 6; j++) kit.rod(pts[j], pts[j + 1], Math.max(0.1, r * 0.03), ribHex, 4);
  }
  return kit;
}

// a standing figure (a statue) h high at (x, y, z) of whatever frame it is built in, on a little
// plinth, an arm raised a little forward (+z)
export function figure(kit, x, y, z, h, hex) {
  kit.box(h * 0.36, h * 0.12, h * 0.36, hex, x, y + h * 0.06, z);
  kit.add(new THREE.CylinderGeometry(h * 0.12, h * 0.19, h * 0.62, 7), hex, x, y + h * 0.43, z);
  kit.box(h * 0.34, h * 0.12, h * 0.18, hex, x, y + h * 0.74, z);
  kit.add(new THREE.SphereGeometry(h * 0.09, 7, 5), hex, x, y + h * 0.88, z);
  kit.box(h * 0.07, h * 0.3, h * 0.07, hex, x + h * 0.18, y + h * 0.78, z + h * 0.08, -0.7, 0, -0.35);
  return kit;
}

// a ring [[u, v], ...] cut off along a straight line: what lies where a*u + b*v <= c is kept
export function clip(ring, a, b, c) {
  const out = [], side = ([u, v]) => c - (a * u + b * v);
  ring.forEach((p, k) => {
    const q = ring[(k + 1) % ring.length], sp = side(p), sq = side(q);
    if (sp >= 0) out.push(p);
    if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  });
  return out;
}

// a path along a line of points [u, v], as arcade.js's paths: s along it, its normal to the right
export function polyPath(pts) {
  const len = [0];
  for (let k = 1; k < pts.length; k++) len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  return {
    length: len.at(-1), closed: false,
    at(s) {
      let k = 1;
      while (k < pts.length - 1 && len[k] < s) k++;
      const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], d = len[k] - len[k - 1] || 1, t = (s - len[k - 1]) / d;
      return { x: x0 + (x1 - x0) * t, z: z0 + (z1 - z0) * t, tx: (x1 - x0) / d, tz: (z1 - z0) / d };
    },
  };
}

// Puts the pieces of `front`, a Kit built in a front's own frame (x to the right as you stand
// before it, y up, z out towards you, the wall's face at z = 0), into `kit` with the middle of its
// foot at (u, v) of the model's own metres and its face looking along (nu, nv).
export function placeFront(kit, front, u, v, nu, nv, y = 0) {
  const n = Math.hypot(nu, nv), a = nu / n, b = nv / n;
  const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(b, 0, -a), new THREE.Vector3(0, 1, 0), new THREE.Vector3(a, 0, b)).setPosition(u, y, v);
  for (const g of front.pieces) kit.pieces.push(g.applyMatrix4(m));
  return kit;
}
