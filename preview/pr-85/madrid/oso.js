// El Oso y el Madroño (Antonio Navarro Santafé, 1967) at the Puerta del Sol, the bear of Madrid's
// arms reaching up into its strawberry tree, modelled by hand from its measurements and photos, in
// game metres (the real ones times 1.25). It has no outline on the map: it stands on its own
// pedestal of stone, which riders bump into.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { rng, shade } from '../core/js/facades.js';

const X = 561, Z = 121; // its middle, from the site's landmark page
const STONE = '#cfc8b8', BRONZE = '#5c4a32', BERRY = '#9b3a24';

export function oso() {
  const kit = new Kit(), r = rng(9);
  // the pedestal, its plinth and the plaque
  kit.box(3.6, 0.4, 3.6, shade(STONE, -0.08), 0, 0.2, 0).box(3, 1.9, 3, STONE, 0, 1.35, 0).box(3.3, 0.25, 3.3, shade(STONE, 0.06), 0, 2.4, 0);
  kit.box(1.4, 0.6, 0.06, '#7d6a48', 0, 1.4, 1.52);
  const y = 2.52;
  // the strawberry tree: its trunk and its crown
  kit.add(new THREE.CylinderGeometry(0.22, 0.32, 3.4, 7), BRONZE, 0.35, y + 1.7, -0.6);
  for (let k = 0; k < 9; k++) {
    const a = r() * Math.PI * 2, d = r() * 0.9;
    kit.add(new THREE.IcosahedronGeometry(0.55 + r() * 0.4, 0), shade(BRONZE, (r() - 0.5) * 0.1), 0.35 + Math.cos(a) * d, y + 3.6 + r() * 1.1, -0.6 + Math.sin(a) * d);
  }
  for (let k = 0; k < 10; k++) {
    const a = r() * Math.PI * 2;
    kit.add(new THREE.SphereGeometry(0.1, 5, 4), BERRY, 0.35 + Math.cos(a) * 1.1, y + 3.4 + r() * 1.3, -0.6 + Math.sin(a) * 1.1);
  }
  // the bear, up on its hind legs, its paws on the trunk, eating the fruit
  kit.add(new THREE.CylinderGeometry(0.5, 0.62, 1.7, 9), BRONZE, -0.05, y + 1.4, 0.15, 0.25);
  kit.add(new THREE.SphereGeometry(0.6, 9, 7), BRONZE, -0.05, y + 0.55, 0.3);
  kit.add(new THREE.SphereGeometry(0.4, 9, 7), BRONZE, 0.05, y + 2.45, -0.15);
  kit.box(0.28, 0.25, 0.4, BRONZE, 0.1, y + 2.4, -0.5); // the snout
  for (const k of [-1, 1]) {
    kit.add(new THREE.SphereGeometry(0.12, 6, 4), BRONZE, k * 0.28, y + 2.82, -0.1); // the ears
    kit.rod([k * 0.38, y + 1.95, 0.05], [0.35 + k * 0.25, y + 2.35, -0.45], 0.16, BRONZE, 6); // the forepaws, up the trunk
    kit.rod([k * 0.3, y + 0.5, 0.35], [k * 0.32, y + 0.05, 0.1], 0.2, BRONZE, 6); // the hind legs
  }
  return kit.mesh(kitMat(0.6, 0.15));
}

export const OSO = [{ id: 'oso-y-madrono', name: 'El Oso y el Madroño', x: X, z: Z, turn: 0, size: 3.6, reach: 60, make: oso }];
