// What Avignon's landmarks share (palais.js, doms.js, horloge.js): each is built on the map's own
// outline of it, taken into the model's metres, its sides as paths (core/js/arcade.js) to lay walls
// and arches along, and the whole raised as a block with its roof on top.
import * as THREE from 'three';
import { linePath } from '../core/js/arcade.js';

// a flat [x, z, ...] ring of the map's, as points [u, v] in the model's own metres about (x, z),
// turned by `turn` (the inverse of arcade.js's onMap)
export function toLocal(p, x, z, turn) {
  const c = Math.cos(turn), s = Math.sin(turn), out = [];
  for (let k = 0; k < p.length; k += 2) {
    const dx = p[k] - x, dz = p[k + 1] - z;
    out.push([dx * c - dz * s, dx * s + dz * c]);
  }
  return out;
}

const area2 = ring => ring.reduce((sum, [u, v], i) => { const [u2, v2] = ring[(i + 1) % ring.length]; return sum + u * v2 - u2 * v; }, 0);

// The sides of a ring of [u, v] as straight paths, each with the outside to its right (as
// arcade.js's square): `hole` true for a courtyard's ring, so its sides face into the courtyard.
// Sides shorter than `min` are left out.
export function sides(ring, { hole = false, min = 0 } = {}) {
  const r = (area2(ring) > 0) !== hole ? ring : ring.slice().reverse();
  return r.map((a, i) => linePath(a[0], a[1], ...r[(i + 1) % r.length])).filter(p => p.length >= min);
}

// a block on the ring from y0 up to y1, with courtyards (`holes`, rings too) left open through it
export function block(kit, ring, y0, y1, hex, holes = []) {
  const shape = new THREE.Shape(ring.map(([u, v]) => new THREE.Vector2(u, v)));
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(([u, v]) => new THREE.Vector2(u, v))));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false });
  // the shape's (u, v) on the ground, its depth upwards
  geo.rotateX(Math.PI / 2).translate(0, y1, 0);
  return kit.add(geo, hex);
}

// a flat roof on the ring at y, facing up (the shape drawn with v turned over, so that turning it
// to lie flat brings v back the right way round and its face upwards)
export function flat(kit, ring, y, hex, holes = []) {
  const shape = new THREE.Shape(ring.map(([u, v]) => new THREE.Vector2(u, -v)));
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(([u, v]) => new THREE.Vector2(u, -v))));
  return kit.add(new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2).translate(0, y, 0), hex);
}

// a rectangle's ring of [u, v]
export const box4 = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
