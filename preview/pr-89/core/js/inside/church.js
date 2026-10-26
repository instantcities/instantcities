// What every church inside is furnished with, on top of gothic.js's cruciform plan: how much floor
// the plan covers (a city's inside.js needs it before the church is built), pews down the nave,
// a high altar on its steps, a rose window, chandeliers down the middle.
import * as THREE from 'three';
import { pew, chandelier, candelabra, steps } from './props.js';

const GOLD = 0xd2a94a;

// the floor a cruciform plan covers, [x0, z0, x1, z1], with a margin
export function cruciformBox({ pitch: P, a, aisle, nave, choir, arm, chapels = [] }) {
  const zW = -a - nave * P, zA = a + choir * P + aisle, deep = Math.max(0, ...chapels.map(c => c.d));
  return [-(a + arm) - 2, zW - 2, a + arm + 2, zA + deep + 2];
}

// pews in two blocks either side of the middle aisle, from z0 to z1, each `len` long
export function pews(p, z0, z1, len = 4, gap = 1.6) {
  const zs = [];
  for (let z = z0; z < z1; z += 2.2) zs.push(z);
  for (const z of zs) for (const s of [-1, 1]) pew(p, s * (gap + len / 2), z, len, 0);
  for (const s of [-1, 1]) p.block(s * (gap + len / 2), (zs[0] + zs.at(-1)) / 2, len / 2 + 0.1, (zs.at(-1) - zs[0]) / 2 + 0.7);
}

// a high altar at z on three steps: the table, a cross and candles on it, a candelabra each side
export function highAltar(p, z, { w = 6, color = 0xf0ece2, cross = true } = {}) {
  steps(p, 0, z, w + 3, 5.4, 3, 0.26);
  p.marble.box(w * 0.6, 1.1, 1.6, color, 0, 0.78 + 0.55, z);
  p.gold.box(w * 0.62, 0.1, 1.7, GOLD, 0, 0.78 + 1.12, z);
  if (cross) {
    p.gold.box(0.12, 1.4, 0.12, GOLD, 0, 0.78 + 1.9, z);
    p.gold.box(0.7, 0.12, 0.12, GOLD, 0, 0.78 + 2.3, z);
  }
  for (const s of [-1, 1]) {
    p.marble.add(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), 0xf4f0e6, s * w * 0.22, 0.78 + 1.4, z);
    p.glow.add(new THREE.SphereGeometry(0.08, 5, 4), 0xfff0c0, s * w * 0.22, 0.78 + 1.7, z);
    candelabra(p, s * (w / 2 + 1), z + 1.2, 3.0);
  }
  p.block(0, z, (w + 3) / 2, 2.7);
}

// a rose window: its glass (art.js roseWindow) w across, its middle at (x, y, z), facing ry, set in a
// stone ring
export function rose(p, tex, w, x, y, z, ry = 0) {
  p.picture(tex, w, w, x, y, z, ry);
  p.stone.add(new THREE.TorusGeometry(w / 2, 0.35, 6, 40).rotateY(ry), 0xd8d0c0, x, y, z);
}

// chandeliers down the middle at height y, hanging from `top`
export function chandeliers(p, zs, y, top, r = 1.4) {
  for (const z of zs) chandelier(p, 0, y, z, r, top, 12);
}
