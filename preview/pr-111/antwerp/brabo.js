// The Brabo fountain on the Grote Markt (Jef Lambeaux, 1887), modelled by hand from its measurements
// and photos, in game metres (the real ones times 1.25). It has no outline on the map: it stands on
// the square in its shallow basin, which riders bump into.
//   the pile of rough rock rising out of the basin, the water running down it, and round its foot
//     the mermaids, the sea creatures and the river god
//   on top, in bronze, Silvius Brabo throwing the giant Antigoon's hand into the Scheldt
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { rng, shade } from '../core/js/facades.js';

const X = 34, Z = -193, TURN = 0.9; // its middle, and the way Brabo throws (local -x, to the river)
const STONE = '#7f776c', BRONZE = '#4a4434', WATER = '#8cc3cf', RIM = '#b9b0a0';

export function brabo() {
  const kit = new Kit(), r = rng(1887);
  // the basin and its water
  kit.add(new THREE.CylinderGeometry(6.2, 6.4, 0.7, 24), RIM, 0, 0.35, 0);
  kit.add(new THREE.CylinderGeometry(5.7, 5.7, 0.15, 24), WATER, 0, 0.62, 0);
  // the rock, lumps getting smaller as they go up, with water down its sides
  for (let k = 0; k < 46; k++) {
    const t = r(), a = r() * Math.PI * 2, d = (1 - t) * 3.2 * r();
    kit.add(new THREE.DodecahedronGeometry(0.9 + (1 - t) * 1.3 * r() + 0.4, 0), shade(STONE, (r() - 0.5) * 0.12), d * Math.cos(a), 0.6 + t * 6.4, d * Math.sin(a), r(), r(), r());
  }
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    kit.box(0.6, 4.2, 0.12, WATER, 2.2 * Math.cos(a), 2.6, 2.2 * Math.sin(a), 0.3, -a + Math.PI / 2);
  }
  // the figures round its foot
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2, x = 3.6 * Math.cos(a), z = 3.6 * Math.sin(a);
    kit.add(new THREE.CylinderGeometry(0.28, 0.4, 1.4, 7), BRONZE, x, 1.4, z, 0.4 * Math.sin(a), 0, -0.4 * Math.cos(a));
    kit.add(new THREE.SphereGeometry(0.26, 7, 5), BRONZE, x * 1.05, 2.2, z * 1.05);
  }
  // Brabo on top, his arm back with the giant's hand
  const y = 7.2;
  for (const d of [-0.25, 0.25]) kit.rod([d, y, 0], [d * 1.4, y + 1.6, 0.1], 0.2, BRONZE, 6);
  kit.add(new THREE.CylinderGeometry(0.4, 0.34, 1.7, 8), BRONZE, 0, y + 2.4, 0);
  kit.add(new THREE.SphereGeometry(0.3, 8, 6), BRONZE, 0, y + 3.5, 0);
  kit.rod([0.3, y + 3, 0], [1.4, y + 4.2, 0.2], 0.12, BRONZE, 5); // the throwing arm, back
  kit.box(0.5, 0.25, 0.7, BRONZE, 1.5, y + 4.3, 0.2); // the hand
  kit.rod([-0.3, y + 3, 0], [-1, y + 2.4, -0.3], 0.12, BRONZE, 5);
  kit.box(0.15, 1.4, 0.7, BRONZE, -0.2, y + 2.4, -0.5, 0, 0.3); // his cloak
  return kit.mesh(kitMat(0.75, 0.1));
}

export const BRABO = [{ id: 'brabofontein', name: 'Brabofontein', x: X, z: Z, turn: TURN, size: 12.8, reach: 80, make: brabo }];
