// The Brandenburger Tor (Langhans, 1788-91), modelled by hand in place of the map's pieces of it,
// from its measurements and photos, in game metres (the real ones times 1.25), on the map's outline:
// 41 m across Unter den Linden's end and 15 m deep, its walls and columns where the map has them.
// Of sandstone:
//   five passages between six walls, the middle one the widest, on a low step, and in front of the
//     wall ends on each side the six Doric columns
//   the entablature over them, its frieze of triglyphs, and the stepped attic with its relief
//   on top, facing east to the city, Schadow's quadriga in green copper: four horses abreast, the
//     chariot, and Victoria with her staff, the eagle and the iron cross
// Riders go through the five passages; the walls and the columns stop them.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, column, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = -658.75, Z = -195.6, TURN = -1.461; // its middle, and its length turned from east (local -z is east)
const WALLS = [-4.5, 4.5, -11.6, 11.6]; // the walls between the passages, along it
const END = [17.6, 20.6]; // the end walls, from and to
const COLS = [-19, -11.6, -4.5, 4.5, 11.6, 19];
const COL = 5.2, DEEP = 4; // the columns out from the middle, the walls' half depth
const SHAFT = [0.6, 17], ENT = 21.3, ATTIC = 23.6, CROWN = 25.2;
const SAND = '#ddd2b8', SHADE = '#cbbd9f', COPPER = '#5d9a80', COPPER2 = '#4e8a70';

// a horse of the quadriga at (x, z), facing -z
function horse(kit, x, y, z, rear) {
  const c = rear ? COPPER2 : COPPER;
  kit.box(0.85, 1.05, 2.4, c, x, y + 1.75, z);
  kit.box(0.6, 1.3, 0.6, c, x, y + 2.55, z - 1.25, -0.5); // the neck, rearing up
  kit.box(0.5, 0.55, 1.05, c, x, y + 3.15, z - 1.75, 0.35); // the head
  for (const [dx, dz, lift] of [[-0.28, -0.95, rear ? 0.7 : 0.4], [0.28, -0.95, 0], [-0.28, 0.95, 0], [0.28, 0.95, 0]]) {
    kit.box(0.22, 1.3 - lift * 0.5, 0.24, c, x + dx, y + 0.65 + lift * 0.5, z + dz - lift * 0.5, lift);
  }
  kit.box(0.18, 0.9, 0.18, c, x, y + 1.6, z + 1.35, -0.6); // the tail
}

export function tor() {
  const kit = new Kit(), path = linePath(-21, 0, 21, 0);
  // the step it stands on
  kit.box(43.6, 0.3, 15.6, shade(SAND, -0.06), 0, 0.15, 0).box(42.8, 0.3, 14.6, SHADE, 0, 0.45, 0);
  // the walls between the passages and at the ends, with a relief panel on each side of each
  for (const u of WALLS) {
    kit.box(2.2, ENT - 4.3 - SHAFT[0], DEEP * 2, SAND, u, SHAFT[0] + (ENT - 4.3 - SHAFT[0]) / 2, 0);
    for (const k of [-1, 1]) kit.box(0.12, 3.4, 4.4, shade(SAND, 0.08), u + k * 1.12, 10.5, 0);
  }
  for (const k of [-1, 1]) {
    const a = k * END[0], b = k * END[1];
    kit.box(END[1] - END[0], ENT - 4.3 - SHAFT[0], DEEP * 2, SAND, (a + b) / 2, SHAFT[0] + (ENT - 4.3 - SHAFT[0]) / 2, 0);
    kit.box(0.12, 3.4, 4.4, shade(SAND, 0.08), a - k * 0.06, 10.5, 0);
  }
  // the twelve Doric columns, fluted, on both faces
  for (const side of [-1, 1]) for (const u of COLS) {
    column(kit, path, u + 21, side * COL, SHAFT[0], SHAFT[1], 1.05, SAND, 'tuscan');
    for (let f = 0; f < 10; f++) {
      const a = (f / 10) * 2 * Math.PI;
      kit.box(0.14, SHAFT[1] - SHAFT[0] - 2.4, 0.14, SHADE, u + Math.cos(a) * 0.98, (SHAFT[0] + SHAFT[1]) / 2 - 0.3, side * COL + Math.sin(a) * 0.98);
    }
  }
  // the entablature: the architrave, the frieze of triglyphs and metopes, the cornice
  kit.box(42.4, 1.7, 12.8, SAND, 0, SHAFT[1] + 0.85, 0);
  kit.box(42.2, 1.7, 12.6, SHADE, 0, SHAFT[1] + 2.55, 0);
  for (let u = -20.4; u <= 20.4 + 1e-6; u += 40.8 / 27) {
    for (const side of [-1, 1]) kit.box(0.75, 1.6, 0.2, SAND, u, SHAFT[1] + 2.55, side * 6.35);
  }
  for (let v = -5.8; v <= 5.8 + 1e-6; v += 11.6 / 7) for (const k of [-1, 1]) kit.box(0.2, 1.6, 0.75, SAND, k * 21.15, SHAFT[1] + 2.55, v);
  kit.box(43.4, 0.6, 13.8, SAND, 0, ENT - 0.6, 0).box(43.8, 0.3, 14.2, shade(SAND, 0.05), 0, ENT - 0.15, 0);
  // the attic, stepping up in the middle, its relief of the procession of peace on both faces
  kit.box(41, ATTIC - ENT, 11.4, SAND, 0, (ENT + ATTIC) / 2, 0);
  kit.box(41.6, 0.4, 12, SHADE, 0, ATTIC - 0.2, 0);
  kit.box(11.3, CROWN - ATTIC, 10.4, SAND, 0, (ATTIC + CROWN) / 2, 0).box(11.9, 0.35, 11, SHADE, 0, CROWN - 0.17, 0);
  for (const side of [-1, 1]) {
    kit.box(18, 1.5, 0.15, shade(SAND, -0.12), 0, ENT + 1.1, side * 5.72);
    for (const k of [-1, 1]) kit.box(7.5, 1.3, 0.15, shade(SAND, -0.08), k * 13.5, ENT + 1.1, side * 5.72);
  }
  // the quadriga, facing east, on its plinth
  const y = CROWN + 0.6;
  kit.box(7.6, 0.6, 6.4, SHADE, 0, CROWN + 0.3, 0);
  for (const [k, u] of [-2.6, -0.9, 0.9, 2.6].entries()) horse(kit, u, y, -0.9 + (k === 0 || k === 3 ? 0.3 : 0), k === 1 || k === 2);
  kit.box(2.4, 1.4, 1.6, COPPER2, 0, y + 1.1, 1.6); // the chariot
  for (const k of [-1, 1]) kit.add(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 12), COPPER2, k * 1.25, y + 0.7, 1.7, 0, 0, Math.PI / 2);
  kit.add(new THREE.CylinderGeometry(0.4, 0.6, 2.8, 8), COPPER, 0, y + 3.2, 1.7); // Victoria
  kit.add(new THREE.SphereGeometry(0.3, 8, 6), COPPER, 0, y + 4.85, 1.7);
  for (const k of [-1, 1]) kit.box(0.12, 1.9, 1.1, COPPER, k * 0.55, y + 4.1, 2.25, 0.35, 0, k * 0.4); // her wings
  kit.rod([0.7, y + 2.2, 1.4], [0.9, y + 7.4, 0.8], 0.06, COPPER2); // the staff
  kit.add(new THREE.TorusGeometry(0.45, 0.08, 6, 14), COPPER2, 0.9, y + 6.6, 0.85);
  kit.box(0.7, 0.7, 0.12, COPPER2, 0.9, y + 6.6, 0.85); // the iron cross in the wreath
  kit.box(0.9, 0.5, 0.4, COPPER2, 0.92, y + 7.6, 0.8); // the eagle
  return kit.mesh(kitMat(0.9));
}

// riders bump into the walls and the columns and go through the passages
const r = 1.1;
export const TOR = [{
  id: 'brandenburger-tor', name: 'Brandenburger Tor', x: X, z: Z, turn: TURN, reach: 70,
  area: [onMap(X, Z, TURN, rect(-21.2, -8, 21.2, 8))],
  foot: [
    ...WALLS.map(u => onMap(X, Z, TURN, rect(u - 1.1, -DEEP, u + 1.1, DEEP))),
    ...[-1, 1].map(k => onMap(X, Z, TURN, rect(Math.min(k * END[0], k * END[1]), -DEEP, Math.max(k * END[0], k * END[1]), DEEP))),
    ...COLS.flatMap(u => [-1, 1].map(side => onMap(X, Z, TURN, rect(u - r, side * COL - r, u + r, side * COL + r)))),
  ],
  make: tor,
}];
