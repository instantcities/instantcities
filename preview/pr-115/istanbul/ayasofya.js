// The Ayasofya (Hagia Sophia, Justinian's church of 532-537, a mosque since 1453), modelled by hand
// in place of the map's stack of building parts, from its measurements and photos, in game metres
// (the real ones times 1.25), on the map's outline of it: 82 m from the narthexes to the apse, 73 m
// across, its axis turned from east some 33 degrees towards the south. In pinkish ochre plaster:
//   the great dome, 32 m across and 56 m high, flattened, on its ring of forty windows between
//     little buttresses, over the square core whose north and south walls fill the great arches
//   the two half-domes east and west of it, each with its two smaller exedrae under it, and the
//     apse at the east end under its own half-dome
//   the aisles and galleries all round in one block, the two narthexes along the west front, and
//     the four heavy buttresses that stand out north and south where the great arches come down
//   the four minarets, all different: the two thick ones Sinan built at the west corners with two
//     şerefe each, the slender one at the north-east and Mehmed II's of red brick at the south-east
// Riders bump into the whole of it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { LEAD, STONE, dome, halfDome, minaret, windows } from './mosque.js';

const X = 402.3, Z = 368.8, TURN = -0.578; // the dome's middle, and the axis turned from east towards the south
const PLASTER = '#d9a47e', BUTTRESS = '#cc946d', TRIM = '#ebcdaa', BRICK = '#a8644a';
const WALL = 31.3, ATTIC = 33.5, CORE = 51.3; // the aisles' and galleries' roof, the nave's attic, the core's top
const R = 20.6, RING = 56, TOP = 70; // the dome
const HALF = [[-22.3, Math.PI], [24.1, 0]]; // the half-domes' middles along the axis, and the way each bulges
const BUTTRESSES = [-18.8, 18.5]; // where the great arches come down, along the axis
const MINARETS = [
  { u: -66.7, v: 41.3, r0: 3, r1: 2.3, base: 13, balconies: [42, 58], top: 64, capH: 14 }, // Sinan's, south-west
  { u: -66.8, v: -48.8, r0: 3, r1: 2.3, base: 13, balconies: [42, 58], top: 64, capH: 14 }, // and north-west
  { u: 65.9, v: -49.4, r0: 1.9, r1: 1.7, base: 11, balconies: [52], top: 58, capH: 13 }, // Bayezid II's, north-east
  { u: 54.1, v: 41, r0: 2.4, r1: 2, base: 8, balconies: [50], top: 56, capH: 12, hex: BRICK }, // Mehmed II's, of brick
];

export function ayasofya() {
  const kit = new Kit();
  // the aisles and galleries in one block, their two rows of windows, the lead of their roofs
  kit.box(96.4, WALL, 92, PLASTER, 0, WALL / 2, -0.4);
  kit.box(97.4, 0.8, 93, TRIM, 0, WALL - 0.4, -0.4);
  kit.box(95.6, 0.4, 91.2, LEAD, 0, WALL + 0.2, -0.4);
  for (const v of [-46.4, 45.6]) windows(kit, 'v', v + Math.sign(v) * 0.05, -46, 46, 14, [8, 20], 2, 4.2);
  windows(kit, 'u', 48.25, -44, 44, 10, [8, 20], 2, 4.2);
  // the nave's attic, the core over it with its tympanum windows under the great arches north and south
  kit.box(96, ATTIC - WALL, 56, PLASTER, 0, (WALL + ATTIC) / 2, 0);
  kit.box(50, CORE - ATTIC, 56, PLASTER, 0, (ATTIC + CORE) / 2, 0);
  kit.box(51, 0.8, 57, TRIM, 0, CORE - 0.4, 0);
  for (const side of [-1, 1]) {
    windows(kit, 'v', side * 28.05, -15, 15, 7, [37.5], 2.2, 4);
    windows(kit, 'v', side * 28.05, -10, 10, 5, [44.5], 2.2, 3.6);
    kit.add(new THREE.TorusGeometry(21.5, 0.9, 4, 24, Math.PI), TRIM, 0, 30, side * 28.2); // the great arch
  }
  // the four buttresses, stepping in as they rise, north and south
  for (const u of BUTTRESSES) for (const side of [-1, 1]) {
    kit.box(9, 22, 10, BUTTRESS, u, 11, side * 46);
    kit.box(8, 23, 7, BUTTRESS, u, 33.5, side * 40.5);
    kit.box(7.6, 9, 12, BUTTRESS, u, 40.5, side * 32);
    kit.frustum(8, 7, 7, 0.5, 2.5, shade(BUTTRESS, -0.08), u, 45, side * 40.5);
  }
  // the exedrae, the half-domes and the apse with its own half-dome
  for (const [u, a] of HALF) {
    for (const side of [-1, 1]) halfDome(kit, { x: Math.cos(a) * 32.3, z: side * 17.6, a: Math.atan2(side, Math.cos(a)), r: 7.8, y0: ATTIC, y1: ATTIC + 2.4, rise: 4.6, windows: 3, hex: PLASTER });
    halfDome(kit, { x: u, z: 0, a, r: R, y0: ATTIC, y1: 41, rise: 9, windows: 5, hex: PLASTER });
  }
  halfDome(kit, { x: 46.7, z: 0, a: 0, r: 8.8, y0: 0, y1: 28, rise: 4.5, windows: 3, hex: PLASTER });
  windows(kit, 'u', 55.6, -4, 4, 3, [12, 20], 1.8, 4);
  // the narthex and the exonarthex in front of it, their windows and roofs
  kit.box(13.7, 24, 92, PLASTER, -55.05, 12, -0.4);
  kit.frustum(14.5, 92.8, 4, 92, 3, LEAD, -55.05, 24, -0.4);
  kit.box(9.5, 12, 80.8, shade(PLASTER, -0.05), -66.6, 6, -3.7);
  kit.frustum(10, 81, 2, 81, 2, LEAD, -66.6, 12, -3.7);
  windows(kit, 'u', -71.4, -40, 33, 9, [6], 1.8, 3);
  windows(kit, 'u', -61.9, -44, 44, 10, [17], 2, 4);
  for (let k = 0; k < 6; k++) kit.box(1.4, 11, 1.6, BUTTRESS, -71.6, 5.5, -40 + (k * 73) / 5); // the exonarthex's little buttresses
  // the two stair turrets at the core's west corners
  for (const v of [-12.6, 13]) dome(kit, { x: -44, z: v, r: 2, y0: ATTIC, y1: 42, rise: 1.6, windows: 4, fin: 0, finial: 0.4, hex: PLASTER });
  // the great dome on its ring of forty windows
  dome(kit, { r: R, y0: CORE, y1: RING, rise: TOP - RING - 0.35, windows: 40, fin: 1.4, hex: PLASTER, finial: 1.3 });
  for (const m of MINARETS) minaret(kit, { x: m.u, z: m.v, w: m.r0 * 2.6, ...m, hex: m.hex ?? STONE });
  return kit.mesh(kitMat(0.9));
}

// It stands in for the map's parts of it (area), and riders bump into the block, the buttresses and
// the minarets' feet (foot).
export const AYASOFYA = [{
  id: 'ayasofya', name: 'Ayasofya', x: X, z: Z, turn: TURN, reach: 420,
  area: [onMap(X, Z, TURN, rect(-74, -57, 72, 52))],
  foot: [onMap(X, Z, TURN, rect(-71.5, -46.4, 48.2, 45.6)), onMap(X, Z, TURN, rect(48, -9, 55.6, 9)),
    ...BUTTRESSES.flatMap(u => [-1, 1].map(side => onMap(X, Z, TURN, rect(u - 4.5, side > 0 ? 41 : -51, u + 4.5, side > 0 ? 51 : -41)))),
    ...MINARETS.map(m => onMap(X, Z, TURN, rect(m.u - m.r0 * 1.3, m.v - m.r0 * 1.3, m.u + m.r0 * 1.3, m.v + m.r0 * 1.3)))],
  make: ayasofya,
}];
