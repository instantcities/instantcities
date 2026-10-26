// Grand Central Terminal on 42nd Street (Reed & Stem and Warren & Wetmore, 1903-13), modelled by hand in
// place of the map's block of it, in game metres (the real ones times 1.25), on the map's outline:
//   its 42nd Street front of pale stone, centred on Park Avenue: the three great arched windows,
//     18 m tall, between their pairs of columns, the entablature and the attic over them
//   the clock of Tiffany glass, 4 m across, and over it Jules-Félix Coutan's group of Mercury between
//     Hercules and Minerva, with the eagle, 15 m high
//   the wings either side with their rows of windows under the cornice, and behind the front the roof
//     of the Main Concourse standing over the rest
// Riders bump into it. The model's own metres: u along 42nd Street (east), v out of the front
// (south, the building lies at v < 0), y up; u = 0 on Park Avenue's axis.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, archRing, column, onMap, rect } from '../core/js/arcade.js';
import { prism } from './deco.js';

const X = 449.1, Z = 313.0, TURN = -0.507;
// the map's outline, in the model's metres
const OUTLINE = [[-90.5, -0.2], [-90.5, -11.6], [-88.8, -76.3], [-87.5, -128.7], [60.3, -128.8], [60.3, -95.2], [60.6, 0.1]];
const CORNICE = 34, ATTIC = 44, ARCH = 12.5, BAY = 21;
const STONE = '#d9cfb8', STONE2 = '#c6bba2', DARK = '#29313a', FRAME = '#59636b', ROOF = '#6f8a80', BRONZE = '#7f8f7c', STATUE = '#b8ae97';

export function grandCentral() {
  const kit = new Kit(), front = linePath(60.6, 0, -90.5, 0); // running west, so that its outside is south
  // the building on its outline, and the concourse's roof over the middle
  prism(kit, [0, CORNICE, OUTLINE.flatMap(([u, v]) => [u, v])], STONE);
  kit.box(96, 12, 70, STONE, -8, CORNICE + 6, -62).frustum(96, 70, 90, 22, 8, ROOF, -8, CORNICE + 12, -62);
  for (let u = -52; u <= 36; u += 11) kit.box(5, 7, 0.3, DARK, u, CORNICE + 6, -26.9);
  // the cornice along the front and the wings' three rows of windows
  wall(kit, front, [[-0.5, CORNICE - 1.6], [151.6, CORNICE - 1.6], [151.6, CORNICE + 0.4], [-0.5, CORNICE + 0.4]], { o0: 0, o1: 1.2, hex: STONE2 });
  for (const [s0, s1] of [[2, 24], [97, 149]]) for (let s = s0; s < s1; s += 4.5) for (const y of [7, 16, 24]) {
    wall(kit, front, [[s, y], [s + 2, y], [s + 2, y + 4.2], [s, y + 4.2]], { o0: 0, o1: 0.1, hex: DARK });
  }
  // the middle: stepped forward, its three arches between the pairs of columns, the entablature
  const mid = linePath(33, 1.2, -33, 1.2), s0 = 33;
  kit.box(66, ATTIC, 8, STONE, 0, ATTIC / 2, -2.8);
  for (const k of [-1, 0, 1]) {
    const s = s0 + k * BAY;
    wall(kit, mid, archRing(s, ARCH, 2.5, 31, 12), { o0: 0, o1: 0.1, hex: DARK });
    // the window's frame of steel: its mullions and transoms
    for (const d of [-ARCH / 3, 0, ARCH / 3]) kit.box(0.35, 28, 0.3, FRAME, k * BAY + d, 2.5 + 14, 1.4);
    for (let y = 6; y < 30; y += 4) kit.box(ARCH, 0.3, 0.3, FRAME, k * BAY, y, 1.4);
    kit.box(ARCH + 1, 0.8, 1, STONE2, k * BAY, 2.4, 1.6); // the doors' lintel under it
  }
  for (const u of [-31.5, -10.5, 10.5, 31.5]) for (const d of [-1.6, 1.6]) column(kit, mid, s0 + u + d, 1.4, 3, 30.5, 0.95, STONE, 'corinthian');
  for (const u of [-31.5, -10.5, 10.5, 31.5]) kit.box(5.4, 3, 2.8, STONE2, u, 1.5, 2.2);
  wall(kit, mid, [[-1, 30.5], [67, 30.5], [67, 34.5], [-1, 34.5]], { o0: -1.2, o1: 2.6, hex: STONE2 });
  wall(kit, mid, [[0, 34.5], [66, 34.5], [66, ATTIC], [0, ATTIC]], { o0: -1.2, o1: 0.6, hex: STONE });
  wall(kit, mid, [[-1, ATTIC - 0.6], [67, ATTIC - 0.6], [67, ATTIC + 0.6], [-1, ATTIC + 0.6]], { o0: -1.2, o1: 1.4, hex: STONE2 });
  // the clock in its bronze ring
  kit.add(new THREE.CylinderGeometry(3.1, 3.1, 0.4, 24), BRONZE, 0, 38.5, 2.1, Math.PI / 2);
  kit.add(new THREE.CylinderGeometry(2.5, 2.5, 0.4, 24), '#efe2b8', 0, 38.5, 2.3, Math.PI / 2);
  kit.box(0.25, 2, 0.2, DARK, 0, 39.3, 2.6).box(1.6, 0.25, 0.2, DARK, 0.7, 38.5, 2.6);
  // the sculpture over it: Mercury standing in the middle, his winged hat and his staff, Hercules
  // reclining to the west and Minerva to the east, and the eagle at Mercury's feet
  const y0 = ATTIC + 0.6;
  kit.box(16, 3, 4, STATUE, 0, y0 + 1.5, 0);
  kit.add(new THREE.CylinderGeometry(1.1, 1.6, 9, 8), STATUE, 0, y0 + 7.5, 0);
  kit.add(new THREE.SphereGeometry(1.1, 10, 8), STATUE, 0, y0 + 12.8, 0);
  for (const d of [-1, 1]) kit.box(0.2, 1, 1.4, STATUE, d * 1.2, y0 + 13.1, 0, 0, 0, d * 0.5);
  kit.rod([1.8, y0 + 3, 0.6], [2.6, y0 + 13, 0.6], 0.15, STATUE, 4);
  for (const d of [-1, 1]) {
    kit.box(7, 2.4, 2.6, STATUE, d * 6, y0 + 4, 0, 0, 0, d * 0.35);
    kit.add(new THREE.SphereGeometry(0.95, 8, 6), STATUE, d * 8.6, y0 + 6.6, 0);
  }
  kit.box(3, 1.6, 1.4, STATUE, 0, y0 + 3.6, 1.8).box(5, 0.3, 1.2, STATUE, 0, y0 + 4.2, 1.8);
  return kit.mesh(kitMat(0.85));
}

export const GRAND_CENTRAL = [{
  id: 'grand-central', name: 'Grand Central Terminal', x: X, z: Z, turn: TURN, reach: 160,
  area: [onMap(X, Z, TURN, rect(-92, -130, 62, 3))],
  // the concourse's footways inside its outline go, and riders bump into the front
  paths: [onMap(X, Z, TURN, rect(-92, -130, 62, 0))],
  foot: [onMap(X, Z, TURN, [...OUTLINE, [33, 0.1], [33, 3.6], [-33, 3.6], [-33, 0.1]])],
  make: grandCentral,
}];
