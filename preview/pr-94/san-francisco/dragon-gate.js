// The Dragon Gate (Clayton Lee, 1970), Chinatown's gateway across Grant Avenue at Bush Street,
// modelled by hand from its measurements and photos, in game metres (the real ones times 1.25):
//   three openings, the middle one over the street and a smaller one over each pavement, between
//     four piers of grey stone on their plinths
//   over each opening a roof of green glazed tiles with its eaves turned up at the corners, the
//     middle one higher, carrying the two dragons on its ridge with the pearl between them and a
//     carp at each end
//   the gilded board under the middle roof with Sun Yat-sen's 天下為公, "all under heaven is for
//     the people", and the red and gold bands under the eaves
// Riders and the traffic ride through its three openings; the piers stop them.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = -664.6, Z = 429, TURN = 0.159; // across Grant Avenue just south of Bush Street, turned with the street grid
const PIERS = [[-10.4, 1.2], [-5.4, 1.4], [5.4, 1.4], [10.4, 1.2]]; // each pier's middle across the street, and its width
const D = 1.6; // the piers' depth
const STONE = '#d8d3c7', STONE2 = '#bfb8aa', GREEN = '#3d7a52', GREEN2 = '#2f6442', RED = '#b33a2c', GOLD = '#d6ad45';

// a roof of green tiles from u0 to u1 at y, d deep, h high to its ridge, the eaves turned up at the
// corners, and the bands of red and gold under it
function roof(kit, u0, u1, y, d, h) {
  const w = u1 - u0, c = (u0 + u1) / 2;
  kit.box(w - 0.4, 0.6, d - 0.8, RED, c, y - 0.3, 0);
  kit.box(w - 0.2, 0.25, d - 0.6, GOLD, c, y - 0.72, 0);
  kit.frustum(w + 1.6, d + 1.6, w - 1.2, 0.5, h, GREEN, c, y, 0);
  kit.box(w - 0.6, 0.5, 0.6, GREEN2, c, y + h + 0.1, 0); // the ridge
  for (const su of [-1, 1]) for (const sv of [-1, 1]) {
    kit.box(1.4, 0.3, 0.5, GREEN2, c + su * (w / 2 + 0.6), y + 0.45, sv * (d / 2 + 0.6), 0, su * sv * 0.785, su * 0.5); // the turned-up corner
  }
  for (const su of [-1, 1]) kit.box(0.4, 0.9, 0.4, GREEN2, c + su * (w / 2 - 0.4), y + h + 0.6, 0, 0, 0, -su * 0.3); // the ridge's ends
}

// a dragon on the ridge at u, facing the middle (the way of `face`): its body in a wave of green
// and gold, its head and its tail up
function dragon(kit, u, y, face) {
  for (let k = 0; k < 7; k++) {
    const t = k / 6, x = u - face * (t * 3.2), lift = Math.sin(t * Math.PI * 2) * 0.35;
    kit.box(0.6, 0.45, 0.45, k % 2 ? GOLD : GREEN, x, y + 0.4 + lift, 0, 0, 0, face * Math.cos(t * Math.PI * 2) * 0.5);
  }
  kit.box(0.7, 0.6, 0.55, GOLD, u + face * 0.4, y + 0.9, 0, 0, 0, face * 0.3); // the head
  kit.box(0.5, 0.25, 0.2, RED, u + face * 0.85, y + 0.85, 0); // the jaws
  kit.box(0.3, 0.9, 0.2, GOLD, u - face * 3.4, y + 1, 0, 0, 0, -face * 0.5); // the tail
}

export function dragonGate() {
  const kit = new Kit();
  // the piers on their plinths
  for (const [u, w] of PIERS) {
    const h = Math.abs(u) > 8 ? 6.6 : 9.2;
    kit.box(w + 0.5, 0.9, D + 0.5, STONE2, u, 0.45, 0);
    kit.box(w, h, D, STONE, u, h / 2, 0);
    kit.box(w + 0.2, 0.3, D + 0.2, STONE2, u, h - 0.6, 0);
  }
  // the beams over the openings, and the board between the middle piers
  for (const s of [-1, 1]) kit.box(5.4, 0.9, D - 0.2, RED, s * 7.9, 6.1, 0);
  kit.box(10.8, 1, D - 0.2, RED, 0, 8.6, 0);
  kit.box(6.2, 1.6, 0.3, GOLD, 0, 9.9, D / 2 - 0.1).box(6.2, 1.6, 0.3, GOLD, 0, 9.9, -D / 2 + 0.1);
  for (const side of [-1, 1]) for (let k = 0; k < 4; k++) kit.box(0.9, 1, 0.12, '#3a2a1c', -2.1 + k * 1.4, 9.9, side * (D / 2 + 0.07)); // its four characters
  kit.box(10.8, 0.6, D - 0.2, RED, 0, 11, 0);
  // the roofs: the two side ones, the middle one over them, and on it the dragons and the pearl
  for (const s of [-1, 1]) roof(kit, s > 0 ? 5.3 : -10.9, s > 0 ? 10.9 : -5.3, 7, 3.4, 1.7);
  roof(kit, -6.4, 6.4, 11.6, 4.2, 2.3);
  for (const s of [-1, 1]) dragon(kit, s * 1.5, 14.1, -s);
  kit.add(new THREE.SphereGeometry(0.45, 10, 8), GOLD, 0, 14.9, 0); // the pearl
  for (const s of [-1, 1]) kit.box(0.5, 1.2, 0.3, GOLD, s * 5.6, 14.8, 0, 0, 0, s * 0.4); // the carps at the ridge's ends
  return kit.mesh(kitMat(0.7));
}

// Riders and cars go through the three openings; the piers stop them (foot).
export const DRAGON_GATE = [{
  id: 'dragon-gate', name: 'Dragon Gate', x: X, z: Z, turn: TURN, reach: 120,
  foot: PIERS.map(([u, w]) => onMap(X, Z, TURN, rect(u - w / 2 - 0.25, -D / 2 - 0.25, u + w / 2 + 0.25, D / 2 + 0.25))),
  make: dragonGate,
}];
