// The Monument a Colom (Gaietà Buïgas, for the Exposition of 1888) at the foot of La Rambla, by the
// port, modelled by hand in place of the map's rings of it, from its measurements and photos, in
// game metres (the real ones times 1.25), on the map's outline: its steps 35 m across and Columbus
// 75 m up:
//   the round steps up from the plaça, and on them the eight bronze lions on their pedestals
//   the octagonal stone base: its bronze reliefs of the voyage, and at four of its sides the
//     buttresses with the seated figures and the crests of Catalonia, Aragon, Castile and León
//   the Corinthian column of cast iron on it, its crown of the four continents' figures
//   the globe, and on it Columbus in bronze, his right arm out towards the sea
// Riders ride round it: the steps and everything on them stop them.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 316.7, Z = 807.5; // its middle
const SEA = Math.atan2(0.44, 0.9); // the way Columbus points, from east towards +z (to the port)
const STEPS = 17.3, BASE = 7.9, COLUMN = [20.4, 62.4], TOP = 75;
const STONE = '#d9cfbb', STONE2 = '#c9bea8', BRONZE = '#4f4a38', IRON = '#3f3d39', GOLD = '#b99a4c';

export function colom() {
  const kit = new Kit();
  // the round steps up from the plaça to the base
  for (let k = 0; k < 5; k++) kit.add(new THREE.CylinderGeometry(STEPS - k * 1.2, STEPS - k * 1.2, 0.5, 48), k % 2 ? STONE2 : STONE, 0, 0.25 + k * 0.5, 0);
  kit.add(new THREE.CylinderGeometry(11.3, 11.3, 0.4, 48), STONE, 0, 2.7, 0);
  // the eight lions on their pedestals round the base
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI + Math.PI / 8, x = 10 * Math.cos(a), z = 10 * Math.sin(a), turn = -a;
    kit.box(2.2, 1.8, 3.6, STONE2, x, 3.8, z, 0, turn + Math.PI / 2);
    kit.box(1.2, 1.3, 2.6, BRONZE, x, 5.35, z, 0, turn + Math.PI / 2);
    kit.box(1.2, 1.4, 1.1, BRONZE, x + 1.2 * Math.cos(a), 6, z + 1.2 * Math.sin(a), 0, turn + Math.PI / 2); // the head, looking out
  }
  // the octagonal base, its reliefs, and the four buttresses with their figures and crests
  const oct = r => new THREE.CylinderGeometry(r, r, 1, 8).rotateY(Math.PI / 8);
  kit.add(oct(BASE).scale(1, 2.2, 1), STONE2, 0, 4, 0);
  kit.add(oct(BASE - 0.8).scale(1, 11, 1), STONE, 0, 5.1 + 5.5, 0);
  kit.add(oct(BASE - 0.3).scale(1, 0.8, 1), STONE2, 0, 16.4, 0);
  kit.add(oct(BASE - 1.6).scale(1, 3.4, 1), STONE, 0, 18.5, 0);
  kit.add(oct(BASE - 1.2).scale(1, 0.6, 1), STONE2, 0, COLUMN[0] - 0.3, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI, r = (BASE - 0.8) * Math.cos(Math.PI / 8), x = r * Math.cos(a), z = r * Math.sin(a);
    if (k % 2) {
      // a bronze relief of the voyage
      kit.box(0.2, 4.6, 3.8, BRONZE, x, 10.6, z, 0, -a);
    } else {
      // a buttress with a figure seated on it, a crest under him
      const bx = (r + 1.4) * Math.cos(a), bz = (r + 1.4) * Math.sin(a);
      kit.box(2.8, 10.2, 2.6, STONE, bx, 10.2, bz, 0, -a);
      kit.box(1.3, 1.6, 0.25, GOLD, bx + 1.42 * Math.cos(a), 11.4, bz + 1.42 * Math.sin(a), 0, -a + Math.PI / 2);
      kit.add(new THREE.CylinderGeometry(0.6, 0.9, 2.6, 8), BRONZE, bx, 16.6, bz);
      kit.add(new THREE.SphereGeometry(0.45, 8, 6), BRONZE, bx, 18.2, bz);
    }
  }
  // the column, fluted, on its base, and its capital
  const shaft = COLUMN[1] - COLUMN[0] - 4;
  kit.add(new THREE.CylinderGeometry(2.9, 3.4, 1.6, 20), IRON, 0, COLUMN[0] + 0.8, 0);
  kit.add(new THREE.CylinderGeometry(2.3, 2.75, shaft, 20), IRON, 0, COLUMN[0] + 1.6 + shaft / 2, 0);
  for (let k = 0; k < 20; k++) {
    const a = (k / 20) * 2 * Math.PI;
    kit.rod([2.72 * Math.cos(a), COLUMN[0] + 2, 2.72 * Math.sin(a)], [2.28 * Math.cos(a), COLUMN[0] + 1.6 + shaft - 0.4, 2.28 * Math.sin(a)], 0.09, shade(IRON, 0.15), 4);
  }
  const cap = COLUMN[0] + 1.6 + shaft;
  kit.add(new THREE.CylinderGeometry(3.4, 2.4, 2.4, 20), shade(IRON, 0.1), 0, cap + 1.2, 0);
  kit.box(7.2, 0.6, 7.2, IRON, 0, cap + 2.7, 0);
  // the crown over the capital: the four continents' figures, holding up the globe
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * 2 * Math.PI + Math.PI / 4;
    kit.add(new THREE.CylinderGeometry(0.4, 0.6, 2.6, 7), BRONZE, 2.3 * Math.cos(a), cap + 4.3, 2.3 * Math.sin(a));
  }
  kit.add(new THREE.CylinderGeometry(2.6, 2.2, 1.6, 16), IRON, 0, cap + 3.8, 0);
  // the globe, and Columbus on it pointing to the sea
  const g = cap + 6.6;
  kit.add(new THREE.SphereGeometry(2.4, 18, 12), shade(BRONZE, 0.1), 0, g, 0);
  kit.add(new THREE.TorusGeometry(2.42, 0.1, 4, 24).rotateX(Math.PI / 2), GOLD, 0, g, 0);
  const y = g + 2.2, c = Math.cos(SEA), s = Math.sin(SEA);
  kit.add(new THREE.CylinderGeometry(0.75, 1.05, 4.4, 10), BRONZE, 0, y + 2.2, 0); // his cloak
  kit.add(new THREE.CylinderGeometry(0.55, 0.65, 1.6, 8), BRONZE, 0, y + 5.1, 0);
  kit.add(new THREE.SphereGeometry(0.55, 10, 8), BRONZE, 0, y + 6.3, 0);
  kit.rod([0.2 * c, y + 5.4, 0.2 * s], [3.1 * c, y + 6, 3.1 * s], 0.24, BRONZE, 6); // his arm out
  kit.rod([-0.6 * s, y + 4.6, 0.6 * c], [-0.8 * s, y + 2.6, 0.8 * c], 0.24, BRONZE, 6);
  return kit.mesh(kitMat(0.85));
}

const ring = (r, n = 48) => onMap(X, Z, 0, Array.from({ length: n }, (_, k) => [r * Math.cos((k / n) * 2 * Math.PI), r * Math.sin((k / n) * 2 * Math.PI)]));
export const COLOM = [{
  id: 'monument-a-colom', name: 'Monument a Colom', x: X, z: Z, reach: 140,
  area: [ring(STEPS + 1)], foot: [ring(STEPS)], paths: [ring(STEPS + 0.5)], make: colom, // the footway round it on its steps goes
}];
