// The three monuments still standing on the spina of the Hippodrome (At Meydanı), which the map has
// no buildings of, modelled by hand from their measurements and photos, in game metres (the real
// ones times 1.25), in a line along the old racecourse from north-east to south-west:
//   the Egyptian Obelisk (Dikilitaş): Thutmose III's obelisk of red granite from Karnak (about 1450
//     BC), its top 19.6 m set up here by Theodosius I in 390 on four bronze cubes, over the marble
//     base carved with the emperor watching the races from his box
//   the Serpent Column (Yılanlı Sütun): the bronze of three twisted snakes the Greeks cast after
//     Plataea (479 BC), brought from Delphi by Constantine; 5.5 m of it left, headless, in its pit
//     behind a railing
//   the Walled Obelisk (Örme Dikilitaş): 32 m of rough ashlar, stripped of the gilded bronze plates
//     Constantine VII put on it in the 10th century, the holes of their pins still in it
// Riders bump into their bases and the railing.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const TURN = 0.997; // the spina's line turned from east (local +u runs north-east along it)
const EGYPT = { x: -98.7, z: 741 }, SERPENT = { x: -119.2, z: 771.7 }, WALLED = { x: -148.3, z: 817.7 };
const MARBLE = '#e4ddd0', MARBLE2 = '#d2c9b8', GRANITE = '#b06a5a', BRONZE = '#5b5040', RAIL = '#3a3a38', ASHLAR = '#a99b84';

// a railing of posts and two rails round a square hw either side of the middle
function railing(kit, hw, h = 1.1) {
  for (const [a, b] of [[[-hw, -hw], [hw, -hw]], [[hw, -hw], [hw, hw]], [[hw, hw], [-hw, hw]], [[-hw, hw], [-hw, -hw]]]) {
    const n = Math.round((2 * hw) / 0.9);
    for (let k = 0; k < n; k++) {
      const t = k / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
      kit.rod([x, 0, z], [x, h, z], 0.035, RAIL, 4);
    }
    for (const y of [0.25, h]) kit.rod([a[0], y, a[1]], [b[0], y, b[1]], 0.04, RAIL, 4);
  }
}

export function egyptian() {
  const kit = new Kit(), S = 2.45, SHAFT = 24.5;
  // the low wall and railing round the base, which stands lower than the square now
  railing(kit, 5.6);
  kit.box(7.4, 0.5, 7.4, MARBLE2, 0, 0.25, 0);
  // Theodosius's base: the lower block with its reliefs of the races, the cornice, the upper block
  kit.box(5.6, 3.4, 5.6, MARBLE, 0, 2.2, 0);
  for (const [dx, dz, ry] of [[0, 2.82, 0], [0, -2.82, 0], [2.82, 0, Math.PI / 2], [-2.82, 0, Math.PI / 2]]) {
    kit.box(4.4, 2.4, 0.08, shade(MARBLE, -0.14), dx, 2.2, dz, 0, ry);
    for (let k = 0; k < 7; k++) kit.box(0.3, 0.9 + (k % 3) * 0.2, 0.12, shade(MARBLE, -0.28), dx + (dz ? -1.8 + k * 0.6 : 0), 2.1, dz + (dx ? -1.8 + k * 0.6 : 0), 0, ry);
  }
  kit.box(6, 0.5, 6, MARBLE2, 0, 4.15, 0);
  kit.box(5, 2.2, 5, MARBLE, 0, 5.5, 0);
  kit.box(5.4, 0.4, 5.4, MARBLE2, 0, 6.8, 0);
  // the four bronze cubes, and the obelisk on them, its hieroglyphs in three columns on each face
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.box(0.9, 0.9, 0.9, BRONZE, sx * 1.15, 7.45, sz * 1.15);
  const y0 = 7.9;
  kit.frustum(S, S, S * 0.66, S * 0.66, SHAFT, GRANITE, 0, y0, 0);
  kit.frustum(S * 0.66, S * 0.66, 0, 0, 1.7, shade(GRANITE, 0.06), 0, y0 + SHAFT, 0);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    for (const c of [-0.55, 0, 0.55]) for (let j = 0; j < 14; j++) {
      const y = y0 + 1.2 + j * 1.6, w = S * (1 - (0.34 * (y - y0)) / SHAFT), o = w / 2 + 0.01;
      kit.box(0.28, 0.7, 0.04, shade(GRANITE, -0.25), Math.sin(a) * o + Math.cos(a) * c * w / S, y, Math.cos(a) * o - Math.sin(a) * c * w / S, 0, a);
    }
  }
  return kit.mesh(kitMat(0.85));
}

export function serpent() {
  const kit = new Kit(), H = 6.8;
  // the pit's rim and the railing round it
  railing(kit, 2.6);
  kit.box(5.4, 0.3, 5.4, MARBLE2, 0, 0.15, 0);
  kit.box(1.5, 0.5, 1.5, MARBLE, 0, 0.55, 0);
  // the three snakes twisting round one another, thinning as they rise
  for (let s = 0; s < 3; s++) {
    const curve = new THREE.Curve();
    curve.getPoint = (t, out = new THREE.Vector3()) => {
      const a = t * 29 * Math.PI / 3 + (s * 2 * Math.PI) / 3, r = 0.3 - 0.06 * t;
      return out.set(r * Math.cos(a), 0.8 + t * H, r * Math.sin(a));
    };
    kit.add(new THREE.TubeGeometry(curve, 90, 0.24, 6, false), BRONZE);
  }
  // the necks parting at the top, where the heads were broken off
  for (let s = 0; s < 3; s++) {
    const a = (s * 2 * Math.PI) / 3;
    kit.rod([0.15 * Math.cos(a), H + 0.6, 0.15 * Math.sin(a)], [0.55 * Math.cos(a), H + 1.1, 0.55 * Math.sin(a)], 0.17, BRONZE, 6);
  }
  return kit.mesh(kitMat(0.6, 0.3));
}

export function walled() {
  const kit = new Kit(), Y0 = 4.4, TOP = 40;
  // its pedestal on its step, and the shaft of rough blocks, tapering, in courses
  kit.box(6.6, 0.6, 6.6, MARBLE2, 0, 0.3, 0);
  kit.box(5.4, Y0 - 0.6, 5.4, shade(MARBLE, -0.06), 0, (Y0 + 0.6) / 2, 0);
  kit.box(5.8, 0.4, 5.8, MARBLE2, 0, Y0 - 0.2, 0);
  const W0 = 4.4, W1 = 2.3, courses = 30;
  for (let k = 0; k < courses; k++) {
    const t0 = k / courses, t1 = (k + 1) / courses, w0 = W0 + (W1 - W0) * t0, w1 = W0 + (W1 - W0) * t1;
    kit.frustum(w0, w0, w1, w1, (TOP - Y0) / courses, shade(ASHLAR, ((k * 37) % 7) * 0.012 - 0.04), 0, Y0 + t0 * (TOP - Y0), 0);
  }
  kit.frustum(W1, W1, 0, 0, 2.4, ASHLAR, 0, TOP, 0);
  // the holes where the bronze plates were pinned
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    for (let j = 0; j < 11; j++) for (const c of [-0.3, 0.3]) {
      const y = Y0 + 2 + j * 3.1, w = W0 + ((W1 - W0) * (y - Y0)) / (TOP - Y0), o = w / 2 + 0.01;
      kit.box(0.22, 0.22, 0.04, '#5a5246', Math.sin(a) * o + Math.cos(a) * c * w, y, Math.cos(a) * o - Math.sin(a) * c * w, 0, a);
    }
  }
  return kit.mesh(kitMat(0.95));
}

const square = (at, hw) => onMap(at.x, at.z, TURN, rect(-hw, -hw, hw, hw));
export const HIPODROM = [
  { id: 'dikilitas', name: 'Dikilitaş', ...EGYPT, turn: TURN, reach: 150, foot: [square(EGYPT, 5.6)], make: egyptian },
  { id: 'yilanli-sutun', name: 'Yılanlı Sütun', ...SERPENT, turn: TURN, reach: 60, foot: [square(SERPENT, 2.6)], make: serpent },
  { id: 'orme-dikilitas', name: 'Örme Dikilitaş', ...WALLED, turn: TURN, reach: 200, foot: [square(WALLED, 3.3)], make: walled },
];
