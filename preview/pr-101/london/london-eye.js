// The London Eye (Marks Barfield, 1999-2000) on the South Bank, modelled by hand in place of the
// map's hundreds of little pieces of it, from its measurements and photos, in game metres (the real
// ones times 1.25), on the map's outline: the wheel 150 m across and 168 m to the top of its
// highest capsule, its plane along the river.
//   the rim: a truss of three steel tubes, braced all the way round
//   the 64 spokes of cable from the two ends of the hub out to the rim, like a bicycle wheel's
//   the hub and the spindle, held up on one side only by the A-frame of two raking legs on the
//     land, braced across near the top, and its back stays
//   the 32 egg-shaped glass capsules on the outside of the rim
//   the boarding platform under the wheel, on its piles at the edge of the river
// Riders bump into the feet of the legs.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = 462.3, Z = 113, TURN = -0.127; // under the hub, its plane along local z, the legs to +x (inland)
const HUB = 91, R = 70, CAPSULE = 74.5, FEET = [40, 14]; // the hub's height, the rim's and the capsules' radii, and where the legs stand
const WHITE = '#e9ecef', GREY = '#c4cad0', GLASS = '#a9c3d2', DARK = '#4f5961';

export function londonEye() {
  const kit = new Kit();
  const on = (r, a, x = 0) => [x, HUB + r * Math.sin(a), r * Math.cos(a)];
  // the rim's three tubes and the bracing between them
  const ring = (r, tube) => new THREE.TorusGeometry(r, tube, 5, 160).rotateY(Math.PI / 2);
  kit.add(ring(R, 0.55), WHITE, 1.5, HUB, 0).add(ring(R, 0.55), WHITE, -1.5, HUB, 0).add(ring(R - 3.2, 0.45), WHITE, 0, HUB, 0);
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * 2 * Math.PI, b = ((k + 0.5) / 64) * 2 * Math.PI;
    const o1 = on(R, a, 1.5), o2 = on(R, a, -1.5), i = on(R - 3.2, a), i2 = on(R - 3.2, b);
    kit.rod(o1, i, 0.14, GREY, 4).rod(o2, i, 0.14, GREY, 4).rod(o1, o2, 0.12, GREY, 4);
    kit.rod(o1, i2, 0.1, GREY, 4).rod(o2, i2, 0.1, GREY, 4);
    // a spoke from either end of the hub, crossing over to the far tube
    kit.rod(k % 2 ? [7, HUB, 0] : [-7, HUB, 0], on(R - 3.2, a, k % 2 ? -0.3 : 0.3), 0.07, GREY, 3);
  }
  // the hub, and the spindle on to the top of the A-frame
  kit.add(new THREE.CylinderGeometry(3, 3, 14, 16).rotateZ(Math.PI / 2), WHITE, 0, HUB, 0);
  kit.add(new THREE.CylinderGeometry(4.2, 4.2, 1.2, 16).rotateZ(Math.PI / 2), GREY, 7, HUB, 0).add(new THREE.CylinderGeometry(4.2, 4.2, 1.2, 16).rotateZ(Math.PI / 2), GREY, -7, HUB, 0);
  kit.add(new THREE.CylinderGeometry(1.8, 1.8, 9, 12).rotateZ(Math.PI / 2), WHITE, 11.5, HUB, 0);
  // the A-frame: two legs from the land up to the spindle, a strut across them, the back stays
  const top = [15, HUB, 0];
  for (const s of [-1, 1]) {
    const foot = [FEET[0], 0, s * FEET[1]];
    kit.rod(foot, [top[0], top[1], s * 1.6], 1.7, WHITE, 10);
    kit.box(5, 1.6, 5, GREY, foot[0], 0.8, foot[2]);
    kit.rod([FEET[0] + 18, 0, s * 9], [top[0], top[1] - 2, s * 0.8], 0.18, DARK, 4); // a back stay
    kit.box(2, 1.2, 2, GREY, FEET[0] + 18, 0.6, s * 9);
  }
  const at = t => [FEET[0] + (top[0] - FEET[0]) * t, HUB * t, FEET[1] * (1 - t) + 1.6 * t];
  kit.rod(at(0.62), [at(0.62)[0], at(0.62)[1], -at(0.62)[2]], 0.9, WHITE, 8);
  kit.add(new THREE.SphereGeometry(3.2, 12, 8), WHITE, top[0], top[1], top[2]);
  // the capsules: glass eggs on the outside of the rim, each on its mounting ring
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * 2 * Math.PI, [, y, z] = on(CAPSULE, a), [, ry, rz] = on(R + 0.6, a);
    kit.add(new THREE.SphereGeometry(1, 14, 8).scale(4.2, 2.2, 2.3), GLASS, 0, y, z);
    kit.add(new THREE.CylinderGeometry(2.35, 2.35, 0.5, 12).rotateZ(Math.PI / 2), WHITE, 3.2, y, z).add(new THREE.CylinderGeometry(2.35, 2.35, 0.5, 12).rotateZ(Math.PI / 2), WHITE, -3.2, y, z);
    kit.box(7.4, 0.35, 0.35, WHITE, 0, y - 2.1, z);
    kit.rod([0, ry, rz], [0, y + (ry - y) * 0.45, z + (rz - z) * 0.45], 0.3, GREY, 4);
  }
  // the boarding platform under the wheel, on its piles in the river
  kit.box(21, 0.8, 78, GREY, 4.5, 9.6, -1.5);
  kit.box(21.4, 1.1, 0.25, WHITE, 4.5, 10.6, 37.5).box(21.4, 1.1, 0.25, WHITE, 4.5, 10.6, -40.5);
  kit.box(0.25, 1.1, 78, WHITE, -6, 10.6, -1.5);
  for (let z = -38; z <= 36; z += 9.25) for (const x of [-5, 4.5, 14]) kit.add(new THREE.CylinderGeometry(0.5, 0.5, 12.6, 6), DARK, x, 3, z);
  for (const z of [-30, 26]) kit.box(4, 4.5, 7, GREY, 12, 12.2, z); // the ticket booths at either end
  return kit.mesh(kitMat(0.6, 0.1));
}

export const LONDON_EYE = [{
  id: 'london-eye', name: 'London Eye', x: X, z: Z, turn: TURN, reach: 400,
  area: [onMap(X, Z, TURN, rect(-14, -88, 14, 88)), onMap(X, Z, TURN, rect(14, -22, 62, 22))],
  foot: [-1, 1].map(s => onMap(X, Z, TURN, rect(FEET[0] - 2.5, s * FEET[1] - 2.5, FEET[0] + 2.5, s * FEET[1] + 2.5))),
  make: londonEye,
}];
