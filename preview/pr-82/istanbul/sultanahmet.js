// The Sultanahmet Camii (the Blue Mosque, Sedefkâr Mehmed Ağa for Ahmed I, 1609-1616), modelled by
// hand in place of the map's stack of building parts, from its measurements and photos, in game
// metres (the real ones times 1.25), on the map's outline of it: the prayer hall of 53 m by 51 m
// with its qibla to the south-east, and its courtyard as big as the hall on the north-west. In grey
// limestone under domes of lead:
//   the cascade of domes: the central one, 23.5 m across and 43 m high on its drum of windows, the
//     four half-domes round it on the hall's axes, each with three exedrae under it, the four small
//     domes at the hall's corners, and the four octagonal turrets over the great piers ("elephant
//     feet") between them
//   the hall's walls with their rows of windows, the portal from the courtyard
//   the courtyard: its walls, the portico of thirty little domes on columns round it, the main gate on
//     the north-west and the two side gates, and the hexagonal fountain in the middle
//   its six slender fluted minarets, the thing that made it famous: four at the hall's corners with
//     three şerefe each, two at the courtyard's far corners with two
// Riders ride in through the courtyard's three gates, round the fountain, and bump into the hall,
// the portico and the minarets.
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { STONE, STONE2, dome, halfDome, minaret, windows, courtyard, courtyardWalls, fountain } from './mosque.js';

const X = 69.7, Z = 821.5, TURN = -0.752; // the central dome's middle, and the qibla (local +u) turned from east towards the south
const H = 34, WALL = 28; // the hall's half width, its walls
const GREY = '#dcd7cb', GREY2 = '#cdc6b6';
const COURT = { u0: -104, u1: -34, v0: -40.6, v1: 40.8 };
const GATES = [['u0', 0, 7], ['v0', -69, 5], ['v1', -69, 5]]; // the main gate and the two side gates
const MINARETS = [
  ...[[-32.2, 38.7], [-30.8, -36.5], [35.7, -37.2], [36, 39.7]].map(([u, v]) => ({ u, v, base: WALL, balconies: [42, 54, 64], top: 69, capH: 11 })),
  ...[[-102.9, 38.7], [-101.6, -39.6]].map(([u, v]) => ({ u, v, base: 11, balconies: [38, 50], top: 56, capH: 11 })),
];

export function sultanahmet() {
  const kit = new Kit();
  // the hall: its walls, the windows in three rows, the cornice
  kit.box(2 * H, WALL, 2 * H, GREY, 0, WALL / 2, 0);
  kit.box(2 * H + 1, 0.8, 2 * H + 1, GREY2, 0, WALL - 0.4, 0);
  for (const s of [-1, 1]) {
    windows(kit, 'u', s * (H + 0.05), -H + 3, H - 3, 9, [5, 12, 20], 1.8, 3.4);
    windows(kit, 'v', s * (H + 0.05), -H + 3, H - 3, 9, [5, 12, 20], 1.8, 3.4);
  }
  // the portal on the courtyard's side, standing proud and higher than the portico, with its half-dome
  kit.box(10.5, 24, 9, GREY2, -H - 4.5, 12, 0);
  kit.box(0.3, 16, 6, '#5e5144', -H - 9.9, 8, 0);
  // the four corner domes and the turrets over the great piers
  for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    dome(kit, { x: su * 25.5, z: sv * 25.5, r: 5.4, y0: WALL, y1: WALL + 2.6, rise: 4.2, windows: 8, fin: 0, hex: GREY, finial: 0.7 });
    dome(kit, { x: su * 19.3, z: sv * 19.3, r: 2.4, y0: WALL, y1: 47, rise: 2.2, windows: 8, fin: 0.3, hex: GREY, finial: 0.6 });
  }
  // the half-domes on the four axes, each with its three exedrae under it
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2, cu = 17.5 * Math.cos(a), cv = 17.5 * Math.sin(a);
    for (const d of [-0.95, 0, 0.95]) {
      const b = a + d, r = d ? 5.2 : 5.8;
      halfDome(kit, { x: cu + 12.6 * Math.cos(b), z: cv + 12.6 * Math.sin(b), a: b, r, y0: WALL, y1: WALL + 2.4, rise: r * 0.7, windows: 3, hex: GREY });
    }
    halfDome(kit, { x: cu, z: cv, a, r: 13.5, y0: WALL, y1: 37, rise: 9, windows: 5, hex: GREY });
  }
  // the central dome on its drum of windows, over a low square base between the half-domes
  kit.box(36, 4, 36, GREY, 0, WALL + 2, 0);
  dome(kit, { r: 16.5, y0: 37, y1: 43.5, rise: 10.5, windows: 28, fin: 0.9, hex: GREY, finial: 1.2 });
  // the courtyard, its fountain, and the minarets
  courtyard(kit, { ...COURT, h: 10.5, depth: 8.2, bay: 8.3, gates: GATES, hex: GREY });
  // the main gate over the opening in the wall: its two piers and the arch over the way through
  for (const s of [-1, 1]) kit.box(11, 17, 1.6, GREY2, COURT.u0 + 4.5, 8.5, s * 4.3);
  kit.box(11, 6, 10.2, GREY2, COURT.u0 + 4.5, 14, 0);
  dome(kit, { x: COURT.u0 + 4.5, z: 0, r: 3.2, y0: 17, y1: 18, rise: 2.6, windows: 0, fin: 0, hex: GREY, finial: 0.6 });
  fountain(kit, -60.9, -8.1, 3.4, shade(STONE, 0.02));
  for (const m of MINARETS) minaret(kit, { x: m.u, z: m.v, w: 4.6, r0: 1.95, r1: 1.75, ...m, hex: STONE, rail: STONE2 });
  return kit.mesh(kitMat(0.9));
}


// It stands in for the map's parts of it (area); riders bump into the hall, the portal, the
// courtyard's walls and portico (left open at the gates), the fountain and the minarets (foot).
export const SULTANAHMET = [{
  id: 'sultanahmet-camii', name: 'Sultanahmet Camii', x: X, z: Z, turn: TURN, reach: 420,
  area: [onMap(X, Z, TURN, rect(-107, -44, 40, 44))],
  foot: [onMap(X, Z, TURN, rect(-H - 9, -H, H, H)), ...courtyardWalls({ ...COURT, depth: 8.2, gates: GATES }).map(({ box: [u0, v0, u1, v1] }) => onMap(X, Z, TURN, rect(u0, v0, u1, v1))),
    onMap(X, Z, TURN, rect(-64.3, -11.5, -57.5, -4.7)),
    ...MINARETS.map(m => onMap(X, Z, TURN, rect(m.u - 2.4, m.v - 2.4, m.u + 2.4, m.v + 2.4)))],
  make: sultanahmet,
}];
