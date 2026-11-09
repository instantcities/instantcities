// The Pestsäule on the Graben (the Plague Column, Fischer von Erlach and Burnacini, 1682-94), the
// emperor's thanks for the end of the plague of 1679, modelled by hand from its measurements and
// photos, in game metres (the real ones times 1.25). It has no outline on the map: it stands in the
// middle of the Graben, on its steps behind their railing, which riders bump into.
//   the three-sided pedestal of white marble, its three lobes for the Trinity, with the reliefs and
//     the crests of the Habsburg lands, and Leopold I kneeling in prayer on its front
//   the pyramid of clouds rising from it, crowded with angels and cherubs
//   the gilded Holy Trinity at the top, in its burst of golden rays
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { rng, shade } from '../core/js/facades.js';

const X = 286, Z = -347, TURN = -0.745; // on the Graben, and along it (local x)
const MARBLE = '#ece8df', CLOUD = '#e6e2d8', GOLD = '#d6ae45', IRON = '#2d2c2a';

// a little figure, for the angels in the clouds
const angel = (kit, x, y, z, h, hex = MARBLE) => {
  kit.add(new THREE.CylinderGeometry(h * 0.15, h * 0.22, h * 0.75, 6), hex, x, y + h * 0.37, z);
  kit.add(new THREE.SphereGeometry(h * 0.12, 6, 4), hex, x, y + h * 0.85, z);
  kit.box(h * 0.7, h * 0.35, h * 0.06, hex, x, y + h * 0.65, z, 0.2, Math.atan2(x, z));
};

export function pestsaeule() {
  const kit = new Kit(), r = rng(1693);
  // the steps and the railing round them
  kit.add(new THREE.CylinderGeometry(6.2, 6.4, 0.4, 3).rotateY(Math.PI / 6), shade(MARBLE, -0.12), 0, 0.2, 0);
  kit.add(new THREE.CylinderGeometry(5.6, 5.8, 0.4, 3).rotateY(Math.PI / 6), shade(MARBLE, -0.06), 0, 0.6, 0);
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * 2 * Math.PI;
    kit.box(0.06, 1, 0.06, IRON, 4.3 * Math.cos(a), 1.3, 4.3 * Math.sin(a));
  }
  kit.add(new THREE.TorusGeometry(4.3, 0.05, 4, 48).rotateX(Math.PI / 2), IRON, 0, 1.8, 0);
  // the pedestal, three lobes round a triangular core, its reliefs and crests
  kit.add(new THREE.CylinderGeometry(2.4, 2.6, 5.6, 3).rotateY(Math.PI / 6), MARBLE, 0, 3.6, 0);
  for (let k = 0; k < 3; k++) {
    const a = Math.PI / 6 + (k / 3) * 2 * Math.PI + Math.PI / 3, x = 1.6 * Math.cos(a), z = 1.6 * Math.sin(a);
    kit.add(new THREE.CylinderGeometry(1.6, 1.7, 5.6, 12), MARBLE, x, 3.6, z);
    kit.add(new THREE.CylinderGeometry(1.75, 1.75, 0.4, 12), shade(MARBLE, -0.05), x, 6.6, z);
    kit.box(0.08, 2, 1.6, shade(MARBLE, -0.15), x + 1.62 * Math.cos(a), 3.6, z + 1.62 * Math.sin(a), 0, -a);
    kit.box(0.1, 0.9, 0.7, GOLD, x + 1.66 * Math.cos(a), 5.4, z + 1.66 * Math.sin(a), 0, -a);
  }
  // the emperor kneeling on the front, facing up the Graben
  kit.add(new THREE.CylinderGeometry(0.45, 0.7, 1.5, 8), MARBLE, 0, 7.6, 2.2);
  kit.add(new THREE.SphereGeometry(0.3, 8, 6), MARBLE, 0, 8.6, 2.15);
  // the pyramid of clouds, lumps getting smaller as they go up, and the angels in them
  const top = 23.4;
  for (let k = 0; k < 120; k++) {
    const t = r(), y = 6.8 + t * (top - 7.4), w = 2.6 * (1 - t) + 0.5, a = r() * Math.PI * 2, d = r() * w;
    kit.add(new THREE.IcosahedronGeometry(0.6 + (1 - t) * 0.9 * r() + 0.3, 0), shade(CLOUD, (r() - 0.5) * 0.08), d * Math.cos(a), y, d * Math.sin(a), r(), r(), r());
  }
  for (let k = 0; k < 14; k++) {
    const t = r() * 0.85, y = 7.4 + t * (top - 9), w = 2.8 * (1 - t) + 0.9, a = r() * Math.PI * 2;
    angel(kit, w * Math.cos(a), y, w * Math.sin(a), 1.3 - t * 0.5, k % 4 ? MARBLE : GOLD);
  }
  // the Trinity in gold, and the rays round it
  kit.add(new THREE.CylinderGeometry(0.4, 0.6, 1.8, 8), GOLD, -0.6, top + 0.9, 0);
  kit.add(new THREE.CylinderGeometry(0.4, 0.6, 1.8, 8), GOLD, 0.6, top + 0.9, 0);
  kit.add(new THREE.SphereGeometry(0.28, 8, 6), GOLD, -0.6, top + 2, 0).add(new THREE.SphereGeometry(0.28, 8, 6), GOLD, 0.6, top + 2, 0);
  kit.box(0.9, 0.2, 0.5, GOLD, 0, top + 2.9, 0); // the dove
  kit.add(new THREE.SphereGeometry(0.5, 10, 8), GOLD, 0, top + 1.4, 0.2); // the globe between them
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, l = k % 2 ? 1.6 : 2.4;
    kit.rod([0, top + 2.2, -0.3], [l * Math.cos(a), top + 2.2 + l * Math.sin(a), -0.3], 0.06, GOLD, 4);
  }
  return kit.mesh(kitMat(0.7, 0.05));
}

export const PESTSAEULE = [{ id: 'pestsaeule', name: 'Pestsäule', x: X, z: Z, turn: TURN, size: 9.6, reach: 90, make: pestsaeule }];
