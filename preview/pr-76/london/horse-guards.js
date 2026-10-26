// Horse Guards (William Kent and John Vardy, 1750-59) on Whitehall, modelled by hand in place of the
// map's blocks of it, from photos, in game metres (the real ones times 1.25), on the map's outlines:
// the courtyard open to Whitehall in the east, Horse Guards Parade behind it in the west.
//   the central block of Portland stone: its rusticated ground floor with the three arches through
//     it (the carriage arch between two for walkers), the windows over them, the pediment towards
//     Whitehall and the slate roof
//   the clock tower on top: the square stage with a white clock face on each side, the lantern of
//     columns on it, the lead dome and the weathervane
//   the two wings forward to Whitehall either side of the courtyard, with their pavilions at the
//     ends under pyramid roofs and pediments over the courtyard
//   at the gate on Whitehall, the two sentry boxes, a mounted trooper of the Life Guards in each
// Riders ride through the arches and into the courtyard, and bump into the rest.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = -191.8, Z = -87.7, TURN = 0.199; // the clock tower, the passage running along +x to Whitehall
const STONE = '#e3ddcc', STONE2 = '#d0c9b6', SLATE = '#4c5156', GLASS = '#2b3238', WHITE = '#f3f0e6', LEAD = '#7e868a', GOLD = '#c9a54a';
// the blocks, [u0, v0, u1, v1, the top of their walls]: the central block either side of the arches,
// its porches towards the parade, the wings and their pavilions, the corners of the courtyard
const CENTRAL = [-14.3, -20.7, 15.2, 18.7, 14];
const BLOCKS = [
  [-15.9, -20.8, -7, -11.6, 7], [-15.8, 11.7, -6.8, 20.7, 10.5],
  [2, -42.6, 32, -19.2, 10.5], [2, 18.6, 32, 41.7, 10.5],
  [32, -51.8, 47.6, -19.2, 11.5], [32, 18.6, 47.6, 51.2, 11.5],
  [11.7, -19.3, 20.6, -12.1, 9], [12, 11.5, 20.6, 18.7, 9],
];
const PASS = [2.6, 3.2, 6]; // the carriage arch's half width, then the piers, then the walkers' arches

// the windows along one side of a block, from (a0) to (a1) along it: n of them w wide and h high,
// their sills at y, on the face at `at` (u for a side facing east or west, v for north or south),
// facing out along +1 or -1; round-headed if arched, and none in the bays skipped
function windows(kit, side, at, out, a0, a1, n, w, h, y, { arched = false, skip = () => false } = {}) {
  const alongU = side === 'v', step = (a1 - a0) / n;
  for (let i = 0; i < n; i++) {
    if (skip(a0 + step * (i + 0.5))) continue;
    const a = a0 + step * (i + 0.5), place = (geo, hex, d, yy) => {
      const g = alongU ? geo : geo.rotateY(Math.PI / 2);
      if (out < 0) g.rotateY(Math.PI);
      kit.add(g, hex, alongU ? a : at + out * d, yy, alongU ? at + out * d : a);
    };
    place(new THREE.BoxGeometry(w + 0.5, h + 0.4, 0.12), STONE2, 0.04, y + h / 2);
    place(new THREE.BoxGeometry(w, h, 0.12), GLASS, 0.08, y + h / 2);
    place(new THREE.BoxGeometry(w + 0.8, 0.2, 0.3), STONE2, 0.12, y - 0.1);
    if (arched) {
      place(new THREE.CircleGeometry(w / 2 + 0.25, 10, 0, Math.PI), STONE2, 0.105, y + h);
      place(new THREE.CircleGeometry(w / 2, 10, 0, Math.PI), GLASS, 0.14, y + h);
    }
  }
}

// a block of Portland stone: its walls with a cornice, the windows on its two floors, rustication
// under the first floor's sills, and a hipped slate roof (a pyramid on a pavilion)
function block(kit, [u0, v0, u1, v1, top], { pyramid = false, floors = [1.4, top * 0.55], faces = 'nesw' } = {}) {
  const cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, du = u1 - u0, dv = v1 - v0;
  kit.box(du, top, dv, STONE, cu, top / 2, cv);
  kit.box(du + 0.6, 0.6, dv + 0.6, STONE2, cu, top - 0.3, cv);
  for (let y = 0.9; y < floors[1] - 0.6; y += 0.9) kit.box(du + 0.08, 0.1, dv + 0.08, STONE2, cu, y, cv); // the rustication's joints
  kit.box(du + 0.3, 0.35, dv + 0.3, STONE2, cu, floors[1] - 0.35, cv);
  const roofH = Math.min(du, dv) * (pyramid ? 0.45 : 0.32);
  const roof = pyramid
    ? new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).scale(du + 0.4, roofH, dv + 0.4)
    : hipRoof(du + 0.4, dv + 0.4, roofH);
  kit.add(roof, SLATE, cu, top + roofH / 2, cv);
  for (const f of faces) {
    const along = f === 'n' || f === 's', [a0, a1] = along ? [u0, u1] : [v0, v1];
    const at = { n: v0, s: v1, e: u1, w: u0 }[f], out = f === 'n' || f === 'w' ? -1 : 1;
    const n = Math.max(1, Math.round((a1 - a0) / 3.6));
    windows(kit, along ? 'v' : 'u', at, out, a0 + 0.8, a1 - 0.8, n, 1.2, floors[1] - floors[0] - 2.2, floors[0] + 0.4);
    windows(kit, along ? 'v' : 'u', at, out, a0 + 0.8, a1 - 0.8, n, 1.2, top - floors[1] - 2.2, floors[1] + 0.6);
  }
}

// a hipped roof w by d, h high, its ridge along the longer side, its foot at y = -h/2
function hipRoof(w, d, h) {
  const long = w >= d, half = (long ? d : w) / 2, ridge = Math.max(0, (long ? w : d) / 2 - half);
  const P = (a, y, b) => (long ? [a, y, b] : [b, y, a]); // a along the ridge
  const [L, S] = long ? [w / 2, d / 2] : [d / 2, w / 2];
  const lo = -h / 2, hi = h / 2;
  const c = [P(-L, lo, -S), P(L, lo, -S), P(L, lo, S), P(-L, lo, S)], r = [P(-ridge, hi, 0), P(ridge, hi, 0)];
  const tris = [[c[0], r[0], r[1]], [c[0], r[1], c[1]], [c[2], r[1], r[0]], [c[2], r[0], c[3]], [c[1], r[1], c[2]], [c[3], r[0], c[0]]];
  const pos = [];
  for (const [a, b, q] of tris) {
    // each triangle facing outwards, away from the roof's foot
    const n = new THREE.Vector3().crossVectors(new THREE.Vector3(...b).sub(new THREE.Vector3(...a)), new THREE.Vector3(...q).sub(new THREE.Vector3(...a)));
    const mid = new THREE.Vector3(...a).add(new THREE.Vector3(...b)).add(new THREE.Vector3(...q)).divideScalar(3).setY(0);
    pos.push(...a, ...(n.dot(mid) >= 0 ? [...b, ...q] : [...q, ...b]));
  }
  return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
}

// a trooper of the Life Guards on his black horse, facing +x, at (x, z)
function trooper(kit, x, z) {
  const HORSE = '#1b1a19', RED = '#a3201f', STEEL = '#d9dcdf';
  kit.box(2.3, 1, 0.8, HORSE, x, 1.7, z);
  for (const [dx, dz] of [[-0.9, -0.28], [-0.9, 0.28], [0.85, -0.28], [0.85, 0.28]]) kit.box(0.22, 1.3, 0.22, HORSE, x + dx, 0.65, z + dz);
  kit.box(0.9, 0.45, 0.42, HORSE, x + 1.35, 2.45, z, 0, 0, -0.9); // the neck
  kit.box(0.75, 0.32, 0.32, HORSE, x + 1.75, 2.8, z, 0, 0, 0.5); // the head
  kit.box(0.2, 1, 0.12, HORSE, x - 1.2, 1.5, z, 0, 0, 0.3); // the tail
  kit.box(0.45, 0.85, 0.5, RED, x - 0.05, 2.65, z); // the tunic
  kit.box(0.4, 0.4, 0.48, STEEL, x + 0.04, 2.7, z); // the cuirass
  for (const dz of [-0.2, 0.2]) kit.box(0.5, 0.22, 0.18, '#f2f0ea', x + 0.25, 2.2, z + dz); // the white breeches, the boots below
  kit.add(new THREE.SphereGeometry(0.17, 8, 6), '#e3c4a8', x, 3.22, z);
  kit.add(new THREE.CylinderGeometry(0.19, 0.21, 0.28, 8), STEEL, x, 3.38, z); // the helmet
  kit.add(new THREE.ConeGeometry(0.14, 0.5, 6).rotateX(Math.PI), '#ffffff', x - 0.05, 3.62, z); // the plume
}

export function horseGuards() {
  const kit = new Kit();
  const [u0, v0, u1, v1, top] = CENTRAL;
  // the central block, either side of the arches, and over them
  block(kit, [u0, v0, u1, -PASS[2], top], { faces: 'new' });
  block(kit, [u0, PASS[2], u1, v1, top], { faces: 'esw' });
  kit.box(u1 - u0, top - 6.3, 2 * PASS[2], STONE, (u0 + u1) / 2, (top + 6.3) / 2, 0);
  kit.box(u1 - u0 + 0.6, 0.6, 2 * PASS[2], STONE2, (u0 + u1) / 2, top - 0.3, 0);
  for (const s of [-1, 1]) {
    kit.box(u1 - u0, 6.3, PASS[1] - PASS[0], STONE, (u0 + u1) / 2, 3.15, s * (PASS[0] + PASS[1]) / 2); // the piers
    kit.box(u1 - u0, 6.3 - 4.4, PASS[2] - PASS[1], STONE, (u0 + u1) / 2, (6.3 + 4.4) / 2, s * (PASS[1] + PASS[2]) / 2);
  }
  kit.add(hipRoof(u1 - u0 + 0.4, 2 * PASS[2] + 0.2, 3), SLATE, (u0 + u1) / 2, top + 1.5, 0);
  // the arches' rims on both fronts, the windows over them, and the pediment towards Whitehall
  for (const [u, out] of [[u0, -1], [u1, 1]]) {
    const ry = out > 0 ? Math.PI / 2 : -Math.PI / 2;
    kit.add(new THREE.TorusGeometry(PASS[0], 0.35, 4, 12, Math.PI).rotateY(ry), STONE2, u + out * 0.1, 6.3 - PASS[0], 0);
    for (const s of [-1, 1]) kit.add(new THREE.TorusGeometry((PASS[2] - PASS[1]) / 2, 0.25, 4, 10, Math.PI).rotateY(ry), STONE2, u + out * 0.1, 4.4 - (PASS[2] - PASS[1]) / 2, s * (PASS[1] + PASS[2]) / 2);
    windows(kit, 'u', u, out, -PASS[2], PASS[2], 3, 1.3, 3, 7.6, { arched: true });
    windows(kit, 'u', u, out, -PASS[2], PASS[2], 3, 1.2, 1.5, 11.2);
  }
  const ped = new THREE.Shape([new THREE.Vector2(-9, 0), new THREE.Vector2(9, 0), new THREE.Vector2(0, 3.2)]);
  kit.add(new THREE.ExtrudeGeometry(ped, { depth: 1, bevelEnabled: false }).rotateY(Math.PI / 2), STONE, u1 - 0.6, top, 0);
  kit.add(new THREE.ExtrudeGeometry(ped, { depth: 1, bevelEnabled: false }).rotateY(Math.PI / 2), STONE, u0 - 0.4, top, 0);
  // the clock tower: its stage with the four clocks, the lantern, the dome and the vane
  const T = 15.2, C = 3.4;
  kit.box(2 * C, 7.8, 2 * C, WHITE, 0, T + 3.9, 0);
  kit.box(2 * C + 0.6, 0.5, 2 * C + 0.6, STONE2, 0, T + 7.8, 0);
  for (const [dx, dz, ry] of [[1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2], [0, 1, 0], [0, -1, Math.PI]]) {
    kit.add(new THREE.CircleGeometry(2.1, 20).rotateY(ry), '#f8f6ef', dx * (C + 0.05), T + 4.6, dz * (C + 0.05));
    kit.add(new THREE.RingGeometry(2.1, 2.4, 20).rotateY(ry), GOLD, dx * (C + 0.06), T + 4.6, dz * (C + 0.06));
    kit.box(0.12, 1.6, 0.06, '#151515', dx * (C + 0.12), T + 5.1, dz * (C + 0.12), 0, ry);
    kit.box(0.12, 1.1, 0.06, '#151515', dx * (C + 0.12) + (dz ? 0.4 : 0), T + 4.4, dz * (C + 0.12) + (dx ? 0.4 : 0), 0, ry, 1.2);
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI + Math.PI / 8;
    kit.add(new THREE.CylinderGeometry(0.22, 0.22, 4.4, 6), WHITE, 2.4 * Math.cos(a), T + 10.4, 2.4 * Math.sin(a));
  }
  kit.add(new THREE.CylinderGeometry(1.8, 1.8, 4.4, 8), '#3a3d40', 0, T + 10.4, 0);
  kit.add(new THREE.CylinderGeometry(2.9, 2.9, 0.6, 8), WHITE, 0, T + 12.9, 0);
  kit.add(new THREE.SphereGeometry(2.7, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.3, 1), LEAD, 0, T + 13.2, 0);
  kit.add(new THREE.CylinderGeometry(0.5, 0.7, 1.6, 8), WHITE, 0, T + 17.3, 0);
  kit.rod([0, T + 18, 0], [0, 37.5, 0], 0.08, GOLD);
  kit.box(1.4, 0.4, 0.06, GOLD, 0.3, 36.8, 0);
  // the wings, their pavilions, the courtyard's corners
  for (const b of BLOCKS) block(kit, b, { pyramid: b[4] === 11.5 });
  for (const s of [-1, 1]) {
    const v = s > 0 ? 18.6 : -19.2;
    kit.add(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-6, 0), new THREE.Vector2(6, 0), new THREE.Vector2(0, 2.4)]), { depth: 0.8, bevelEnabled: false }), STONE, 39.8, 11.5, v - (s > 0 ? 0.4 : 0.4));
  }
  // the sentry boxes at the gate on Whitehall, and the troopers in them
  for (const s of [-1, 1]) {
    const v = s * 9.8, u = 44.6;
    kit.box(3.2, 4.4, 0.4, STONE, u, 2.2, v - 1.6).box(3.2, 4.4, 0.4, STONE, u, 2.2, v + 1.6).box(0.4, 4.4, 3.6, STONE, u - 1.4, 2.2, v);
    kit.box(3.6, 0.5, 4, STONE2, u, 4.6, v);
    kit.add(new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4).scale(3.8, 1.2, 4.2), SLATE, u, 5.45, v);
    trooper(kit, u - 0.2, v);
  }
  return kit.mesh(kitMat(0.85));
}

const R = ([u0, v0, u1, v1]) => onMap(X, Z, TURN, rect(u0, v0, u1, v1));
const SOLID = [[CENTRAL[0], CENTRAL[1], CENTRAL[2], -PASS[2]], [CENTRAL[0], PASS[2], CENTRAL[2], CENTRAL[3]], ...[-1, 1].map(s => [CENTRAL[0], s > 0 ? PASS[0] : -PASS[1], CENTRAL[2], s > 0 ? PASS[1] : -PASS[0]]), ...BLOCKS];
const BOXES = [-1, 1].map(s => [42.8, s * 9.8 - 1.8, 46.4, s * 9.8 + 1.8]);
export const HORSE_GUARDS = [{
  id: 'horse-guards', name: 'Horse Guards', x: X, z: Z, turn: TURN, reach: 200,
  area: [CENTRAL, ...BLOCKS, ...BOXES].map(([u0, v0, u1, v1]) => R([u0 - 0.3, v0 - 0.3, u1 + 0.3, v1 + 0.3])),
  foot: [...SOLID, ...BOXES].map(R),
  make: horseGuards,
}];
