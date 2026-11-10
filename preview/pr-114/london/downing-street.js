// No. 10 Downing Street, the Prime Minister's house since 1735, its front modelled by hand on the
// map's house (which stays behind it), from photos, in game metres (the real ones times 1.25), along
// the map's outline of its front on Downing Street, 27 m long:
//   the front of sooty black brick, three storeys of white sash windows with their glazing bars,
//     the stone bands between the storeys and the white cornice and parapet
//   the black door with the white 10, the brass lion's-head knocker and letterbox, in its white
//     doorcase of pilasters and an entablature under the fanlight
//   the area railings in front, black, and over the step the iron arch with its lantern
// Riders bump into the railings and the step.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = -223.5, Z = 112.3, TURN = -0.0147; // the middle of its front, which faces +z (the street)
const L = 13.6, DOOR = -7.7, FLOORS = [0, 4.6, 9.2, 13.2], TOP = 14.4;
const BRICK = '#2a2826', WHITE = '#ecebe4', STONE = '#cfcbbf', GLASS = '#1d242b', BLACK = '#121212', BRASS = '#c9a54a';

export function downingStreet() {
  const kit = new Kit();
  kit.box(2 * L, TOP, 0.4, BRICK, 0, TOP / 2, 0.2);
  for (const y of FLOORS.slice(1, -1)) kit.box(2 * L, 0.3, 0.12, STONE, 0, y, 0.46);
  kit.box(2 * L + 0.4, 0.5, 0.5, WHITE, 0, FLOORS[3] + 0.25, 0.4); // the cornice
  kit.box(2 * L, 0.7, 0.2, BRICK, 0, TOP - 0.35, 0.3);
  // the windows: seven bays, the door in the second
  const bays = 7, bay = (2 * L) / bays;
  for (let i = 0; i < bays; i++) {
    const u = -L + bay * (i + 0.5);
    for (const [k, h] of [[0, 2.5], [1, 2.6], [2, 1.9]]) {
      if (k === 0 && i === 1) continue;
      const y = FLOORS[k] + (k === 2 ? 1.1 : 1.2) + h / 2, w = 1.3;
      kit.box(w + 0.3, h + 0.3, 0.1, WHITE, u, y, 0.45);
      kit.box(w, h, 0.1, GLASS, u, y, 0.48);
      kit.box(0.07, h, 0.06, WHITE, u, y, 0.55);
      for (const f of [-0.25, 0, 0.25]) kit.box(w, 0.07, 0.06, WHITE, u, y + f * h, 0.55);
      kit.box(w + 0.5, 0.15, 0.25, STONE, u, FLOORS[k] + (k === 2 ? 1.1 : 1.2) - 0.08, 0.5); // the sill
    }
  }
  // the door in its doorcase, the fanlight over it
  kit.box(2.6, 4.3, 0.16, WHITE, DOOR, 2.15 + 0.15, 0.46);
  for (const s of [-1, 1]) kit.box(0.32, 3.3, 0.3, WHITE, DOOR + s * 1.05, 0.15 + 1.8, 0.55); // the pilasters
  kit.box(2.8, 0.45, 0.4, WHITE, DOOR, 3.75, 0.6); // the entablature
  kit.add(new THREE.CircleGeometry(0.62, 12, 0, Math.PI), GLASS, DOOR, 4.1, 0.56);
  kit.box(1.25, 2.95, 0.12, BLACK, DOOR, 0.15 + 1.48, 0.58); // the door
  for (const y of [0.9, 2.2]) kit.box(1.05, 0.05, 0.04, '#222', DOOR, y, 0.65);
  kit.box(0.05, 0.3, 0.03, WHITE, DOOR - 0.12, 2.5, 0.66); // the 1 and the 0, in white
  kit.add(new THREE.TorusGeometry(0.1, 0.03, 4, 10).scale(0.75, 1.4, 1), WHITE, DOOR + 0.1, 2.5, 0.66);
  kit.add(new THREE.SphereGeometry(0.12, 8, 6), BRASS, DOOR, 1.95, 0.68); // the lion's head knocker
  kit.box(0.4, 0.09, 0.04, BRASS, DOOR, 1.25, 0.66); // the letterbox
  kit.box(0.08, 0.08, 0.06, BRASS, DOOR + 0.45, 1.55, 0.66);
  kit.box(2.4, 0.16, 1, STONE, DOOR, 0.08, 0.9); // the step
  // the area railings, and the iron arch over the step with the lantern
  for (const [a, b] of [[-L, DOOR - 1.2], [DOOR + 1.2, L]]) {
    const n = Math.round((b - a) / 0.14);
    kit.box(b - a, 0.06, 0.06, BLACK, (a + b) / 2, 1.2, 1.9).box(b - a, 0.06, 0.06, BLACK, (a + b) / 2, 0.15, 1.9);
    for (let k = 0; k <= n; k++) kit.box(0.035, 1.3, 0.035, BLACK, a + ((b - a) * k) / n, 0.65, 1.9);
    for (let k = 0; k <= n; k += 4) kit.add(new THREE.ConeGeometry(0.05, 0.16, 4), BLACK, a + ((b - a) * k) / n, 1.38, 1.9);
  }
  const arch = new THREE.TorusGeometry(1.2, 0.05, 4, 16, Math.PI);
  kit.add(arch, BLACK, DOOR, 2.9, 1.9);
  for (const s of [-1, 1]) kit.box(0.08, 2.9, 0.08, BLACK, DOOR + s * 1.2, 1.45, 1.9);
  kit.add(new THREE.CylinderGeometry(0.22, 0.14, 0.55, 6), '#f3e2a6', DOOR, 3.7, 1.9); // the lantern
  kit.add(new THREE.ConeGeometry(0.3, 0.3, 6), BLACK, DOOR, 4.12, 1.9);
  return kit.mesh(kitMat(0.7));
}

const STRIP = onMap(X, Z, TURN, rect(-L, 0, L, 2));
export const DOWNING_STREET = [{
  id: 'downing-street', name: 'No. 10 Downing Street', x: X, z: Z, turn: TURN, reach: 120, area: [STRIP],
  foot: [onMap(X, Z, TURN, rect(-L, 0.4, L, 2)), onMap(X, Z, TURN, rect(DOOR - 1.2, 0.4, DOOR + 1.2, 1.4))],
  make: downingStreet,
}];
