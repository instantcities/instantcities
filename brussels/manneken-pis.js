// The Manneken Pis (Hiëronymus Duquesnoy the Elder, 1619; a copy since 1965) on the corner of the
// Rue de l'Étuve and the Rue du Chêne, modelled by hand from its measurements and photos, in game
// metres (the real ones times 1.25): a little bronze boy, 70 cm here, on his pedestal in the stone
// niche at the corner of the house, over his basin behind the railing.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';

const X = -116.9, Z = 234.4, TURN = -0.05; // in front of the house's corner, facing the crossing (local +z)
const STONE = '#c9bea8', STONE2 = '#b3a78f', BRONZE = '#6a5534', WATER = '#9ccbd6', IRON = '#2a2a28';

export function mannekenPis() {
  const kit = new Kit();
  // the niche against the corner: its back, its frame, its shell on top
  kit.box(3.2, 4.8, 0.6, STONE2, 0, 2.4, -1.1);
  for (const x of [-1.45, 1.45]) kit.box(0.5, 4.8, 0.8, STONE, x, 2.4, -0.8);
  kit.box(3.6, 0.6, 1, STONE, 0, 5, -0.8);
  kit.add(new THREE.SphereGeometry(0.9, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), STONE, 0, 5.3, -0.9);
  // the basin, the pedestal, the boy and his stream
  kit.add(new THREE.CylinderGeometry(1.3, 1.2, 0.8, 16, 1, false, -Math.PI / 2, Math.PI), STONE, 0, 0.4, -0.7);
  kit.add(new THREE.CylinderGeometry(1.1, 1.1, 0.1, 16, 1, false, -Math.PI / 2, Math.PI), WATER, 0, 0.75, -0.7);
  kit.add(new THREE.CylinderGeometry(0.32, 0.4, 2, 8), STONE, 0, 1.8, -0.8);
  kit.box(0.7, 0.2, 0.7, STONE2, 0, 2.9, -0.8);
  const y = 3;
  kit.add(new THREE.CylinderGeometry(0.11, 0.13, 0.32, 7), BRONZE, 0, y + 0.42, -0.8);
  for (const d of [-0.06, 0.06]) kit.rod([d, y, -0.8], [d, y + 0.28, -0.8], 0.045, BRONZE, 4);
  kit.add(new THREE.SphereGeometry(0.11, 7, 5), BRONZE, 0, y + 0.66, -0.8);
  const stream = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, y + 0.3, -0.7), new THREE.Vector3(0, y + 0.4, -0.2), new THREE.Vector3(0, 0.8, -0.1));
  kit.add(new THREE.TubeGeometry(stream, 8, 0.025, 3, false), WATER);
  // the railing round it
  for (let k = 0; k <= 12; k++) {
    const a = Math.PI + (k / 12) * Math.PI;
    kit.box(0.05, 1.1, 0.05, IRON, 1.9 * Math.cos(a), 0.55, -0.7 - 1.9 * Math.sin(a));
  }
  kit.add(new THREE.TorusGeometry(1.9, 0.04, 3, 16, Math.PI).rotateX(Math.PI / 2), IRON, 0, 1.1, -0.7);
  return kit.mesh(kitMat(0.7, 0.1));
}

export const MANNEKEN_PIS = [{ id: 'manneken-pis', name: 'Manneken Pis', x: X, z: Z, turn: TURN, size: [4, 2.6], reach: 40, make: mannekenPis }];
