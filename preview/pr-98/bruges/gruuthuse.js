// The Gruuthusepaleis (15th century), the town palace of the lords of Gruuthuse on the Dijver, modelled
// by hand in place of the map's one block of it, on that block's outline, in game metres (the real
// ones times 1.25): its brick wings round the courtyard under steep slate roofs, the stepped gables
// at their ends, the stone-framed cross windows, the tall chimneys, and the slender octagonal stair
// tower in the courtyard's corner, and the courtyard's paving over the canal the map runs under it.
// The model's own metres: u along the Dijver side from its west corner, v in from it, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = 15.8, Z = 171.5, TURN = 0.522;
const BRICK = '#a3694a', BRICK2 = '#8f5b40', STONE = '#d9cfb9', SLATE = '#4b5258', DARK = '#2c2a28';
// the wings: [u0, v0, u1, v1, eaves, ridge, along u?]
const WINGS = [[0, 0, 37.9, 12, 12.5, 22, true], [26, 12, 37.9, 29.7, 12.5, 21, false], [0, 21.5, 26, 29.7, 8, 14, true]];

export function gruuthuse() {
  const kit = new Kit();
  for (const [u0, v0, u1, v1, eaves, ridge, alongU] of WINGS) {
    const w = u1 - u0, d = v1 - v0, um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
    kit.box(w, eaves, d, BRICK, um, eaves / 2, vm);
    const span = alongU ? d : w, len = alongU ? w : d;
    const roof = new THREE.Shape([new THREE.Vector2(-span / 2 - 0.4, 0), new THREE.Vector2(span / 2 + 0.4, 0), new THREE.Vector2(0, ridge - eaves)]);
    const g = new THREE.ExtrudeGeometry(roof, { depth: len, bevelEnabled: false });
    if (alongU) kit.add(g, SLATE, u0, eaves, vm, 0, Math.PI / 2);
    else kit.add(g, SLATE, um, eaves, v0);
    // the cross windows along both long sides
    const n = Math.floor(len / 4.2);
    for (let k = 0; k < n; k++) for (const y of [3.5, eaves - 3.8]) for (const side of [-1, 1]) {
      const t = (alongU ? u0 : v0) + (k + 0.5) * (len / n), o = side * (span / 2 + 0.1);
      const [x, z] = alongU ? [t, vm + o] : [um + o, t];
      const [bw, bd] = alongU ? [2, 0.3] : [0.3, 2];
      kit.box(bw + 0.5, 3.4, bd, STONE, x, y, z).box(bw - 0.3, 2.8, bd + 0.05, DARK, x, y, z);
      kit.box(alongU ? bw : bd + 0.1, 0.25, alongU ? bd + 0.1 : bw, STONE, x, y + 0.3, z).box(alongU ? 0.25 : bd + 0.1, 2.8, alongU ? bd + 0.1 : 0.25, STONE, x, y, z);
    }
  }
  // the stepped gables at the wings' ends, and the chimneys
  const gable = (x, z, along, span, eaves, ridge) => {
    const steps = 5;
    for (let k = 0; k < steps; k++) {
      const w = span * (1 - k / steps) + 0.6, h = (ridge - eaves) / steps;
      kit.box(along ? 0.8 : w, h + 0.4, along ? w : 0.8, BRICK2, x, eaves + k * h + h / 2, z);
    }
  };
  gable(-0.2, 6, true, 12, 12.5, 22);
  gable(32, 29.9, false, 11.9, 12.5, 21);
  gable(-0.2, 25.6, true, 8.2, 8, 14);
  for (const [x, z, h] of [[10, 3, 25], [24, 9, 24.5], [31, 22, 23.5]]) kit.box(1.4, h, 1.4, BRICK2, x, h / 2, z).box(1.8, 0.5, 1.8, STONE, x, h, z);
  // the courtyard's paving (the map's canal runs on under the palace)
  kit.box(26, 0.4, 9.5, '#9d968b', 13, 0.2, 16.75);
  // the octagonal stair tower in the courtyard's corner, its windows and spire
  kit.add(new THREE.CylinderGeometry(2.4, 2.4, 31, 8), BRICK, 24.6, 15.5, 13.6);
  for (const y of [6, 12, 18, 24, 29]) kit.box(0.6, 1.6, 0.3, DARK, 24.6 - 2.45 * 0.38, y, 13.6 + 2.45 * 0.92, 0, -1.18);
  kit.add(new THREE.CylinderGeometry(2.7, 2.7, 0.6, 8), STONE, 24.6, 31.2, 13.6);
  kit.add(new THREE.ConeGeometry(2.5, 8, 8), SLATE, 24.6, 35.5, 13.6);
  return kit.mesh(kitMat(0.9));
}

export const GRUUTHUSE = [{
  id: 'gruuthuse', name: 'Gruuthusepaleis', x: X, z: Z, turn: TURN, reach: 50,
  area: [onMap(X, Z, TURN, rect(-1, -1, 39, 31))],
  foot: [...WINGS.map(([u0, v0, u1, v1]) => rect(u0, v0, u1, v1)), rect(22.2, 11.2, 27, 16)].map(r => onMap(X, Z, TURN, r)),
  make: gruuthuse,
}];
