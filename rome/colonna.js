// The Colonna di Marco Aurelio (AD 180-193) on Piazza Colonna, modelled by hand in place of the
// map's pedestal and column, from its measurements and photos, in game metres (the real ones times
// 1.25): a column of a hundred Roman feet (29.6 m) of Carrara marble, 3.7 m across.
//   the pedestal Domenico Fontana rebuilt for Sixtus V (1589), on its steps, with the inscriptions
//     on its faces under the cornice
//   the column: its round base, the shaft with the band of reliefs of the emperor's wars against the
//     Marcomanni and the Sarmatians winding up it in 21 turns, the slits lighting the stair inside,
//     the Doric capital
//   on top the drum, its railing, and the bronze St Paul that took the emperor's place in 1589
// Riders bump into the pedestal.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 166.7, Z = -278.7, TURN = 0.289; // its middle, and its pedestal's sides turned from east
const P = 3.8; // half the pedestal's width
const BASE = 13, CAP = 48.5, R = 2.3; // the column's foot and the capital's foot, its radius
const MARBLE = '#e7e1d3', MARBLE2 = '#d9d0bd', BRONZE = '#4d5a4c';

export function colonna() {
  const kit = new Kit();
  // the steps, the pedestal, its inscriptions and cornice
  kit.box(2 * P + 2.4, 0.35, 2 * P + 2.4, MARBLE2, 0, 0.18, 0);
  kit.box(2 * P + 1.2, 0.35, 2 * P + 1.2, MARBLE2, 0, 0.52, 0);
  kit.box(2 * P + 0.6, 1.2, 2 * P + 0.6, MARBLE, 0, 1.3, 0);
  kit.box(2 * P, 9.4, 2 * P, MARBLE, 0, 6.6, 0);
  for (const [dx, dz, ry] of [[0, P, 0], [0, -P, 0], [P, 0, Math.PI / 2], [-P, 0, Math.PI / 2]]) {
    kit.box(5.4, 5.6, 0.12, shade(MARBLE, -0.05), dx, 6.4, dz, 0, ry, 0);
    for (let line = 0; line < 6; line++) kit.box(line % 3 === 2 ? 3 : 4.4, 0.32, 0.18, '#7c7466', dx * 1.002, 8.4 - line * 0.75, dz * 1.002, 0, ry, 0);
  }
  kit.box(2 * P + 0.9, 0.7, 2 * P + 0.9, MARBLE2, 0, 11.65, 0);
  kit.box(2 * P + 0.4, 0.5, 2 * P + 0.4, MARBLE, 0, 12.25, 0);
  kit.box(2 * P - 0.6, 0.5, 2 * P - 0.6, MARBLE2, 0, 12.75, 0);
  // the column's base, the shaft, the band of reliefs winding up it and the stair's slits
  kit.add(new THREE.CylinderGeometry(R + 0.35, R + 0.6, 1.3, 24), MARBLE2, 0, BASE + 0.65, 0);
  kit.add(new THREE.CylinderGeometry(R - 0.2, R, CAP - BASE - 1.3, 24), MARBLE, 0, BASE + 1.3 + (CAP - BASE - 1.3) / 2, 0);
  const turns = 21, y0 = BASE + 1.6, y1 = CAP - 0.4;
  const helix = new THREE.Curve();
  helix.getPoint = (t, out = new THREE.Vector3()) => {
    const a = t * turns * 2 * Math.PI, r = R - 0.2 * t + 0.05;
    return out.set(r * Math.cos(a), y0 + (y1 - y0) * t, -r * Math.sin(a));
  };
  kit.add(new THREE.TubeGeometry(helix, turns * 20, 0.12, 4, false), MARBLE2);
  for (let k = 0; k < 28; k++) {
    const a = k * 2.4, y = BASE + 3 + k * 1.15, r = R - 0.2 * ((y - BASE) / (CAP - BASE));
    kit.box(0.18, 0.6, 0.12, '#5c564b', r * Math.cos(a), y, -r * Math.sin(a), 0, a + Math.PI / 2, 0);
  }
  // the capital, the drum on it with its railing, and St Paul with his sword
  kit.add(new THREE.CylinderGeometry(R + 0.55, R - 0.2, 1.3, 24), MARBLE2, 0, CAP + 0.65, 0);
  kit.box(2 * R + 1.4, 0.8, 2 * R + 1.4, MARBLE, 0, CAP + 1.7, 0);
  kit.add(new THREE.CylinderGeometry(1.25, 1.4, 1.5, 16), MARBLE2, 0, CAP + 2.85, 0);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * 2 * Math.PI;
    kit.box(0.08, 1, 0.08, '#3d3a34', (R + 0.4) * Math.cos(a), CAP + 2.6, (R + 0.4) * Math.sin(a));
  }
  kit.add(new THREE.TorusGeometry(R + 0.4, 0.05, 4, 24).rotateX(Math.PI / 2), '#3d3a34', 0, CAP + 3.1, 0);
  const foot = CAP + 3.6;
  kit.add(new THREE.CylinderGeometry(0.42, 0.62, 2.4, 10), BRONZE, 0, foot + 1.2, 0);
  kit.box(1.2, 0.4, 0.55, BRONZE, 0, foot + 2.4, 0);
  kit.add(new THREE.SphereGeometry(0.3, 8, 6), BRONZE, 0, foot + 2.9, 0);
  kit.rod([0.55, foot + 2.2, 0.1], [0.75, foot + 4, 0.1], 0.07, BRONZE, 4);
  return kit.mesh(kitMat(0.85));
}

// It stands in for the map's pedestal and column (area), and riders bump into its pedestal (foot).
export const COLONNA = [{
  id: 'colonna-di-marco-aurelio', name: 'Colonna di Marco Aurelio', x: X, z: Z, turn: TURN, reach: 70,
  area: [onMap(X, Z, TURN, rect(-P - 2, -P - 2, P + 2, P + 2))],
  foot: [onMap(X, Z, TURN, rect(-P - 0.6, -P - 0.6, P + 0.6, P + 0.6))],
  make: colonna,
}];
