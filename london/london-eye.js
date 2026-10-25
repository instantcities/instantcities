// The London Eye (2000) on the South Bank, modelled by hand in place of the map's 300 pieces of it,
// from its measurements and photos, in game metres (the real ones times 1.25): a wheel 150 m across
// on its hub 87 m up, standing over the edge of the Thames, the plane of the wheel the map's.
//   the rim, two rings braced to each other, and the cable spokes to the ends of the hub
//   the thirty-two glass capsules round the outside of the rim
//   the A-frame of white tubes that holds the hub up from the bank, and its back-stay cables
//   the boarding pier in the river at its foot
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = 468.3, Z = 111.5, TURN = 1.442; // the hub over the ground, and the wheel's plane turned from east (local x; the land is local +z)
const HUB = 87, R = 75, PODS = 32;
const WHITE = '#e9ecef', STEEL = '#c4cbd1', GLASS = '#bcd9e3', CABLE = '#9aa3aa';

export function londonEye() {
  const kit = new Kit();
  // the rim: two rings, braced
  for (const v of [-2.4, 2.4]) kit.add(new THREE.TorusGeometry(R, 0.55, 5, 128), WHITE, 0, HUB, v);
  for (let k = 0; k < 128; k++) {
    const a = (k / 128) * 2 * Math.PI, b = ((k + 1) / 128) * 2 * Math.PI, side = k % 2 ? 2.4 : -2.4;
    kit.rod([R * Math.cos(a), HUB + R * Math.sin(a), side], [R * Math.cos(b), HUB + R * Math.sin(b), -side], 0.18, STEEL, 4);
  }
  // the spokes, from either end of the hub
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * 2 * Math.PI, v = k % 2 ? 6 : -6;
    kit.rod([0, HUB, v], [R * Math.cos(a), HUB + R * Math.sin(a), Math.sign(v) * 2.4], 0.08, CABLE, 3);
  }
  kit.add(new THREE.CylinderGeometry(2.6, 2.6, 14, 16).rotateX(Math.PI / 2), STEEL, 0, HUB, 0);
  kit.add(new THREE.CylinderGeometry(4.2, 4.2, 3, 16).rotateX(Math.PI / 2), WHITE, 0, HUB, 0);
  // the capsules round the rim
  for (let k = 0; k < PODS; k++) {
    const a = (k / PODS) * 2 * Math.PI + 0.05, x = (R + 3.6) * Math.cos(a), y = HUB + (R + 3.6) * Math.sin(a);
    kit.add(new THREE.SphereGeometry(1, 12, 8).scale(2.3, 2.3, 4.4), GLASS, x, y, 0);
    for (const v of [-4.1, 4.1]) kit.add(new THREE.SphereGeometry(1.35, 8, 6), WHITE, x, y, v);
    kit.rod([R * Math.cos(a), HUB + R * Math.sin(a), 0], [x, y, 0], 0.25, WHITE, 4);
  }
  // the A-frame down to the bank, and the back-stays
  for (const u of [-22, 22]) {
    kit.rod([0, HUB, 6.5], [u, 0, 30], 1.5, WHITE, 10);
    kit.box(5, 2, 5, '#bcb6aa', u, 1, 30);
  }
  kit.rod([-14.7, 58, 15.5], [14.7, 58, 15.5], 0.8, WHITE, 8);
  for (const u of [-8, 8]) kit.rod([u * 0.2, HUB, 6.8], [u, 0, 70], 0.25, CABLE, 4);
  // the boarding pier in the river
  kit.box(34, 1, 16, '#d8d8d4', 0, 0.5, -1);
  for (let k = 0; k <= 16; k++) kit.box(0.12, 1.1, 0.12, '#55595c', -17 + (k / 16) * 34, 1.55, -9);
  return kit.mesh(kitMat(0.6, 0.15));
}

// it stands in for the map's pieces of the wheel and the pier, from the river to the A-frame's feet;
// riders bump into those feet
export const LONDON_EYE = [{
  id: 'london-eye', name: 'London Eye', x: X, z: Z, turn: TURN, reach: 500,
  area: [onMap(X, Z, TURN, rect(-86, -15, 86, 31))],
  foot: [-22, 22].map(u => onMap(X, Z, TURN, rect(u - 2.5, 27.5, u + 2.5, 32.5))),
  make: londonEye,
}];
