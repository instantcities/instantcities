// Çemberlitaş, the Column of Constantine (330), on the Divan Yolu by the Forum of Constantine,
// modelled by hand in place of the map's tower of it, from its measurements and photos, in game
// metres (the real ones times 1.25): 35 m high now.
//   the railing round it and the stepped base, the pedestal the Ottomans cased in masonry after the
//     fire of 1779
//   the column of drums of dark red porphyry from Egypt, 2.9 m across, each joint held by an iron
//     ring cast as a wreath of laurel (the rings, çember, give it its name)
//   on top the courses of marble and brick Manuel I Komnenos put in place of the statue of
//     Constantine as Apollo, after a storm threw it down in 1106
// Riders bump into the railing.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = -518.2, Z = 365.3, TURN = -0.083;
const STONE = '#d9cfbb', STONE2 = '#c7bba3', PORPHYRY = '#6a4140', IRON = '#3d3a35', BRICK = '#a6634a', RAIL = '#34332f';
const HW = 7.9, R = 1.85, FOOT = 9.6, DRUMS = 7, DRUM = 3.75; // the railing's half width, the column, its foot and drums

export function cemberlitas() {
  const kit = new Kit();
  // the parapet and railing round it
  for (const [a, b] of [[[-HW, -HW], [HW, -HW]], [[HW, -HW], [HW, HW]], [[HW, HW], [-HW, HW]], [[-HW, HW], [-HW, -HW]]]) {
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1]) + 0.5, along = a[0] === b[0];
    kit.box(along ? 0.5 : len, 0.6, along ? len : 0.5, STONE2, mx, 0.3, mz);
    for (let k = 0; k < 18; k++) {
      const t = k / 18, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
      kit.rod([x, 0.6, z], [x, 1.7, z], 0.04, RAIL, 4);
    }
    kit.rod([a[0], 1.7, a[1]], [b[0], 1.7, b[1]], 0.05, RAIL, 4);
  }
  // the steps, the cased pedestal with its cornice, the column's base
  kit.box(10, 0.5, 10, STONE2, 0, 0.25, 0).box(8.6, 0.5, 8.6, STONE2, 0, 0.75, 0);
  kit.box(6.8, FOOT - 2.4, 6.8, STONE, 0, 1 + (FOOT - 2.4) / 2, 0);
  for (let y = 2.4; y < FOOT - 1.6; y += 1.1) kit.box(6.86, 0.06, 6.86, shade(STONE, -0.1), 0, y, 0); // its courses
  kit.box(7.4, 0.5, 7.4, STONE2, 0, FOOT - 1.15, 0);
  kit.frustum(6.4, 6.4, 4.8, 4.8, 0.9, STONE, 0, FOOT - 0.9, 0);
  kit.add(new THREE.CylinderGeometry(R + 0.2, R + 0.5, 0.8, 24), STONE2, 0, FOOT + 0.4, 0);
  // the porphyry drums and the laurel rings at their joints
  for (let k = 0; k < DRUMS; k++) {
    const y0 = FOOT + 0.8 + k * DRUM;
    kit.add(new THREE.CylinderGeometry(R - 0.03 * (k + 1), R - 0.03 * k, DRUM, 24), shade(PORPHYRY, ((k * 3) % 5) * 0.02 - 0.03), 0, y0 + DRUM / 2, 0);
    if (k) {
      kit.add(new THREE.TorusGeometry(R - 0.03 * k + 0.12, 0.32, 6, 24).rotateX(Math.PI / 2), IRON, 0, y0, 0);
      for (let j = 0; j < 12; j++) {
        const a = (j / 12) * 2 * Math.PI;
        kit.box(0.5, 0.22, 0.12, shade(IRON, 0.1), (R - 0.03 * k + 0.4) * Math.cos(a), y0, (R - 0.03 * k + 0.4) * Math.sin(a), 0.5, Math.PI / 2 - a);
      }
    }
  }
  // Komnenos's courses on top, of marble between bands of brick, and their cornice
  const top = FOOT + 0.8 + DRUMS * DRUM, r = R - 0.03 * DRUMS;
  kit.add(new THREE.CylinderGeometry(r - 0.05, r - 0.05, 6.6, 24), STONE, 0, top + 3.3, 0);
  for (const y of [1.6, 3.3, 5]) kit.add(new THREE.CylinderGeometry(r - 0.02, r - 0.02, 0.3, 24), BRICK, 0, top + y, 0);
  kit.add(new THREE.CylinderGeometry(r + 0.3, r, 0.5, 24), STONE2, 0, top + 6.85, 0);
  return kit.mesh(kitMat(0.8));
}

// It stands in for the map's column and its square (area); riders bump into the railing (foot).
export const CEMBERLITAS = [{
  id: 'cemberlitas', name: 'Çemberlitaş', x: X, z: Z, turn: TURN, reach: 200,
  area: [onMap(X, Z, TURN, rect(-HW - 1, -HW - 1, HW + 1, HW + 1))],
  foot: [onMap(X, Z, TURN, rect(-HW, -HW, HW, HW))],
  make: cemberlitas,
}];
