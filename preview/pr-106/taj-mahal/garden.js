// The garden's red sandstone wall with its pavilions: a wall along its two long sides and the
// south, where the great gate stands in it, and six octagonal pavilions with white domes at the
// corners (the four of the garden and the two at the river end of the terrace). Modelled by hand in
// real metres (scaled to game metres, 1.25, at the end) round the tomb's middle. Riders bump into
// the walls and the pavilions.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { S } from './taj.js';

const SAND = '#b4523a', SAND2 = '#a24b36', MARBLE = '#f1ede3', GOLD = '#d9a72e';
const TOMB = [-91.3, -253.8];
const WALL_H = 3.4, T = 1.6; // the wall's height and thickness
// the wall's sides as rectangles [x0, z0, x1, z1] from the tomb's middle in real metres (the garden
// runs from z = 57 to 343): west, east and the two halves of the south wall either side of the gate
const WALLS = [[-150, 57, -148.4, 344], [148.4, 57, 150, 344], [-150, 342.4, -20.5, 344], [20.5, 342.4, 150, 344]];
// the pavilions' middles, from the tomb's middle
const PAVILIONS = [[-145, 350], [151, 350], [-145, 50], [151, 50], [-147, -54], [149, -54]];

function pavilion(kit, x, z) {
  kit.add(new THREE.CylinderGeometry(7.2, 7.8, 1.2, 8), SAND2, x, 0.6, z, 0, Math.PI / 8);
  kit.add(new THREE.CylinderGeometry(6.2, 6.5, 6.4, 8), SAND, x, 4.4, z, 0, Math.PI / 8);
  kit.add(new THREE.CylinderGeometry(6.8, 6.8, 0.6, 8), MARBLE, x, 7.9, z, 0, Math.PI / 8);
  // blind arches round it, dark
  for (let k = 0; k < 8; k++) {
    const t = (k / 8) * 2 * Math.PI;
    kit.box(2.6, 4.2, 0.2, '#6e3023', x + 6.2 * Math.cos(t), 3.8, z + 6.2 * Math.sin(t), 0, -t + Math.PI / 2);
  }
  kit.add(new THREE.CylinderGeometry(3.8, 4.8, 1.4, 8), MARBLE, x, 8.9, z, 0, Math.PI / 8);
  kit.add(new THREE.SphereGeometry(4.4, 12, 7, 0, Math.PI * 2, 0, Math.PI / 1.8), MARBLE, x, 9.4, z);
  kit.add(new THREE.CylinderGeometry(0.12, 0.2, 3, 5), GOLD, x, 15.4, z);
}

export function garden() {
  const kit = new Kit();
  for (const [x0, z0, x1, z1] of WALLS) {
    kit.box(x1 - x0, WALL_H, z1 - z0, SAND, (x0 + x1) / 2, WALL_H / 2, (z0 + z1) / 2);
    kit.box(x1 - x0 + (x1 - x0 < 5 ? 0.5 : 0), 0.4, z1 - z0 + (z1 - z0 < 5 ? 0.5 : 0), MARBLE, (x0 + x1) / 2, WALL_H + 0.2, (z0 + z1) / 2);
  }
  for (const [x, z] of PAVILIONS) pavilion(kit, x, z);
  const m = kit.mesh(kitMat(0.9));
  m.scale.setScalar(S);
  return m;
}

const ring = pts => onMap(TOMB[0], TOMB[1], 0, pts.map(([u, v]) => [u * S, v * S]));
const around = (x, z, r) => ring(rect(x - r, z - r, x + r, z + r));

export const GARDEN = [{
  id: 'garden-wall', name: 'Garden wall', x: TOMB[0], z: TOMB[1], turn: 0, reach: 520,
  area: PAVILIONS.map(([x, z]) => around(x, z, 11)),
  foot: [...WALLS.map(([x0, z0, x1, z1]) => ring(rect(x0, z0, x1, z1))), ...PAVILIONS.map(([x, z]) => around(x, z, 6.5))],
  make: garden,
}];
