// The New York Public Library's main building on Fifth Avenue (Carrère and Hastings, 1902-11), modelled
// by hand in place of the map's parts of it, in game metres (the real ones times 1.25), on the map's
// outlines: 119 m along Fifth Avenue, of white Vermont marble:
//   the Fifth Avenue front: the portico of three arches between its Corinthian columns, the attic over
//     it with its six statues, the wings either side with their tall arched windows over the
//     ground floor's banded stone, and the pavilions at the ends
//   the terrace and the steps up to the portico, and the two lions on their plinths either side of
//     them, Patience and Fortitude (Edward Clark Potter, 1911)
//   behind, over Bryant Park, the Rose Main Reading Room's wing standing higher, its row of fifteen
//     tall arched windows, and the block between the two courtyards
// Riders bump into it, the steps and the lions' plinths. The model's own metres: u east (out of the
// front), v along Fifth Avenue (south), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, archRing, column, onMap, rect } from '../core/js/arcade.js';

const X = -55.7, Z = 171.4, TURN = -0.507;
const FRONT = 49.5, HV = 70.5, CORNICE = 25, TOP = 27.5, HIGH = 40, MID = 1.6; // MID: the portico's middle along v
const MARBLE = '#e8e3d8', MARBLE2 = '#d6d0c2', DARK = '#2c3238', ROOF = '#7b7d7e', LION = '#d8c9ae';

export function library() {
  const kit = new Kit();
  // the blocks: the whole building to its cornice, the reading room's wing and the middle block higher
  kit.box(FRONT + 49.7, TOP, 2 * HV, MARBLE, (FRONT - 49.7) / 2, TOP / 2, 0);
  kit.box(38, HIGH, 121, MARBLE, -30.65, HIGH / 2, 2.95).frustum(38, 121, 30, 113, 3, ROOF, -30.65, HIGH, 2.95);
  kit.box(64, HIGH - 4, 38, MARBLE, 2, (HIGH - 4) / 2, 3).frustum(64, 38, 58, 32, 3, ROOF, 2, HIGH - 4, 3);
  // the front: banded stone below, the arched windows of the main floor, the cornice and balustrade
  const front = linePath(FRONT, -HV, FRONT, HV); // running south, its outside to the east
  for (let y = 1.5; y < 10; y += 1.5) wall(kit, front, [[0, y], [2 * HV, y], [2 * HV, y + 0.25], [0, y + 0.25]], { o0: 0, o1: 0.12, hex: MARBLE2 });
  for (const [s0, s1, n] of [[21, 50, 4], [92, 120, 4]]) {
    const bay = (s1 - s0) / n;
    for (let k = 0; k < n; k++) {
      const s = s0 + (k + 0.5) * bay;
      wall(kit, front, archRing(s, bay * 0.5, 11, 22, 8), { o0: 0, o1: 0.1, hex: DARK });
      wall(kit, front, [[s - 1, 4], [s + 1, 4], [s + 1, 7.5], [s - 1, 7.5]], { o0: 0, o1: 0.1, hex: DARK });
      if (k) column(kit, front, s0 + k * bay, 0.6, 10, CORNICE - 1, 0.6, MARBLE, 'pilaster');
    }
  }
  // the end pavilions, standing a little forward
  for (const sv of [-1, 1]) {
    kit.box(2, TOP + 1.5, 20, MARBLE, FRONT + 1, (TOP + 1.5) / 2, sv * (HV - 10));
    const p = linePath(FRONT + 2, sv * (HV - 10) - 10, FRONT + 2, sv * (HV - 10) + 10);
    wall(kit, p, archRing(10, 6, 11, 23, 10), { o0: 0, o1: 0.1, hex: DARK });
    for (const s of [2.5, 17.5]) column(kit, p, s, 0.6, 10, CORNICE, 0.7, MARBLE, 'corinthian');
  }
  wall(kit, front, [[-0.5, CORNICE], [2 * HV + 0.5, CORNICE], [2 * HV + 0.5, CORNICE + 1.2], [-0.5, CORNICE + 1.2]], { o0: 0, o1: 1, hex: MARBLE2 });
  for (let s = 1; s < 2 * HV; s += 1.1) kit.box(0.35, 1.2, 0.35, MARBLE2, FRONT + 0.4, TOP - 0.6, -HV + s);
  kit.box(0.6, 0.4, 2 * HV, MARBLE2, FRONT + 0.4, TOP, 0);
  // the portico: stepped out, its three arches, the columns before it, the entablature and the attic
  const por = linePath(FRONT + 4, MID - 18, FRONT + 4, MID + 18);
  kit.box(4, TOP + 3, 36, MARBLE, FRONT + 2, (TOP + 3) / 2, MID);
  for (const d of [-10, 0, 10]) {
    wall(kit, por, archRing(18 + d, 6.4, 2, 19, 10), { o0: 0, o1: 0.1, hex: DARK });
    kit.box(0.3, 1.2, 6.8, MARBLE2, FRONT + 4.2, 10, MID + d);
  }
  const cols = [-16.5, -14.3, -5, 5, 14.3, 16.5];
  for (const c of cols) column(kit, por, 18 + c, 3.2, 1.5, 22, 0.75, MARBLE, 'corinthian');
  kit.box(5, 2.6, 36, MARBLE2, FRONT + 5.5, 23.3, MID).box(4.4, 4.5, 34, MARBLE, FRONT + 5.2, 26.85, MID);
  for (const c of cols) {
    kit.box(1.4, 1.4, 1.4, MARBLE2, FRONT + 6.4, 29.8, MID + c);
    kit.add(new THREE.CylinderGeometry(0.5, 0.6, 3.6, 6), MARBLE2, FRONT + 6.4, 32.3, MID + c);
    kit.add(new THREE.SphereGeometry(0.5, 6, 5), MARBLE2, FRONT + 6.4, 34.5, MID + c);
  }
  // the terrace and the steps, and the lions on their plinths either side
  for (const [u, h] of [[4, 1.5], [6, 1], [8, 0.5]]) kit.box(u, h, 40, MARBLE2, FRONT + 4 + u / 2, h / 2, MID);
  for (const sv of [-1, 1]) {
    const v = MID + sv * 23;
    kit.box(6, 2.4, 2.6, MARBLE2, FRONT + 9, 1.2, v).box(6.4, 0.3, 3, MARBLE, FRONT + 9, 2.55, v);
    kit.box(4.4, 1.3, 1.7, LION, FRONT + 8.8, 3.35, v); // lying down, its paws out in front
    kit.box(1.6, 0.35, 1.5, LION, FRONT + 11.6, 2.9, v);
    kit.add(new THREE.SphereGeometry(1.05, 10, 8), LION, FRONT + 10.7, 4.3, v);
    kit.add(new THREE.SphereGeometry(0.62, 8, 6), LION, FRONT + 11.5, 4.3, v);
    kit.box(1.6, 0.25, 0.3, LION, FRONT + 6.2, 2.85, v + 0.6);
  }
  // the reading room's windows over Bryant Park
  const back = linePath(-49.7, 63.5, -49.7, -57.5); // running north, its outside to the west
  for (let k = 0; k < 15; k++) wall(kit, back, archRing(((k + 0.5) * 121) / 15, 4.2, 24, 37, 8), { o0: 0, o1: 0.1, hex: DARK });
  for (let k = 0; k < 15; k++) wall(kit, back, [[((k + 0.5) * 121) / 15 - 1.2, 6], [((k + 0.5) * 121) / 15 + 1.2, 6], [((k + 0.5) * 121) / 15 + 1.2, 18], [((k + 0.5) * 121) / 15 - 1.2, 18]], { o0: 0, o1: 0.1, hex: DARK });
  return kit.mesh(kitMat(0.8));
}

export const LIBRARY = [{
  id: 'public-library', name: 'New York Public Library', x: X, z: Z, turn: TURN, reach: 140,
  area: [onMap(X, Z, TURN, rect(-52, -HV - 2, 60, HV + 2))],
  foot: [rect(-49.7, -HV, FRONT + 2, HV), rect(FRONT, MID - 20, FRONT + 12, MID + 20), ...[-1, 1].map(sv => rect(FRONT + 6, MID + sv * 23 - 1.3, FRONT + 12, MID + sv * 23 + 1.3))].map(r => onMap(X, Z, TURN, r)),
  make: library,
}];
