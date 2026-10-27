// The parts the Rudolfinum and the Old-New Synagogue share, on top of core/js/arcade.js: a map
// building's outline in a monument's own metres, its sides as paths, a block raised on it, and a
// roof from one ring up to a smaller one.
import * as THREE from 'three';
import { linePath } from '../core/js/arcade.js';
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
// the same, as their flat [x, z, ...] rings
export const outlines = (k, x, z, r) => buildings(k, x, z, r).map(b => b.p);

// a flat ring in the city's metres as [[u, v], ...] in a monument's own, at (X, Z) turned by `turn`
// (the inverse of arcade.js's onMap)
export function local(p, X, Z, turn) {
  const c = Math.cos(turn), s = Math.sin(turn), out = [];
  for (let k = 0; k < p.length; k += 2) { const dx = p[k] - X, dz = p[k + 1] - Z; out.push([dx * c - dz * s, dx * s + dz * c]); }
  return out;
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
// order: a hipped roof, or the lean-tos round a hall rising out of its annexes. Its faces look up.
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

// a ring drawn towards its middle by `f` (0: as it is, 1: to a point)
export function shrink(ring, f) {
  const [cu, cv] = ring.reduce(([a, b], [u, v]) => [a + u / ring.length, b + v / ring.length], [0, 0]);
  return ring.map(([u, v]) => [u + (cu - u) * f, v + (cv - v) * f]);
}
