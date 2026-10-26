// The statue of Philip III on horseback in the middle of the Plaza Mayor (Giambologna and Pietro
// Tacca, 1616; on the square since 1848), modelled by hand from its measurements and photos, in game
// metres (the real ones times 1.25). It has no outline on the map: it stands on its pedestal, behind
// its low railing, which riders bump into.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';

const X = 116, Z = 328, TURN = 0; // the middle of the square
const STONE = '#c9c1b0', STONE2 = '#b5ac98', BRONZE = '#4d4535', IRON = '#2a2a28';

export function felipe() {
  const kit = new Kit();
  // the steps, the pedestal with its inscriptions, its cornice
  kit.box(7.6, 0.4, 5.2, STONE2, 0, 0.2, 0).box(6.8, 0.4, 4.4, STONE, 0, 0.6, 0);
  kit.box(5.2, 3.6, 2.8, STONE, 0, 2.6, 0);
  for (const z of [-1.42, 1.42]) kit.box(3, 1.2, 0.05, '#7c7462', 0, 2.6, z);
  kit.box(5.8, 0.5, 3.4, STONE2, 0, 4.65, 0);
  // the horse, pacing, and the king with his baton
  const y = 4.9;
  kit.box(3.6, 1.4, 1.2, BRONZE, 0, y + 2.1, 0);
  kit.box(1.1, 1.6, 0.8, BRONZE, 1.9, y + 3, 0, 0, 0, -0.6); // the neck
  kit.box(1.1, 0.6, 0.55, BRONZE, 2.6, y + 3.7, 0, 0, 0, 0.5); // the head
  for (const [x, z, lift] of [[1.4, -0.4, 0.6], [1.4, 0.4, 0], [-1.4, -0.4, 0], [-1.4, 0.4, 0.3]]) {
    kit.box(0.28, 1.5, 0.28, BRONZE, x + lift * 0.4, y + 0.75 + lift * 0.3, z, 0, 0, lift * 0.9);
  }
  kit.box(0.25, 1.4, 0.25, BRONZE, -1.95, y + 1.6, 0, 0, 0, -0.3); // the tail
  kit.add(new THREE.CylinderGeometry(0.42, 0.55, 1.7, 8), BRONZE, 0.1, y + 3.6, 0);
  kit.add(new THREE.SphereGeometry(0.3, 8, 6), BRONZE, 0.15, y + 4.7, 0);
  kit.add(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 8), BRONZE, 0.15, y + 5, 0); // his hat
  kit.rod([0.4, y + 3.9, 0.3], [1.2, y + 4.5, 0.5], 0.06, BRONZE, 4); // the baton
  for (const z of [-0.6, 0.6]) kit.box(0.25, 1, 0.25, BRONZE, 0.1, y + 2.6, z); // his legs
  // the railing round it
  for (let k = 0; k <= 32; k++) {
    const a = (k / 32) * Math.PI * 2;
    kit.box(0.05, 1, 0.05, IRON, 4.6 * Math.cos(a), 0.5, 3.4 * Math.sin(a));
  }
  return kit.mesh(kitMat(0.7, 0.1));
}

export const FELIPE = [{ id: 'felipe-iii', name: 'Felipe III', x: X, z: Z, turn: TURN, size: [9.4, 7], reach: 70, make: felipe }];
