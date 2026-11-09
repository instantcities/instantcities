// The Yeni Cami (the New Mosque, begun for Safiye Sultan in 1597, finished for Turhan Sultan in
// 1665), at Eminönü by the Galata Bridge, modelled by hand in place of the map's flat block of it,
// from its measurements and photos, in game metres (the real ones times 1.25), on the map's outline:
// its prayer hall with its qibla to the south-east and its courtyard on the north-west, towards the
// Golden Horn. In grey stone under domes of lead:
//   the cascade of domes like the Blue Mosque's: the central dome, 17.5 m across and 36 m high, on
//     its drum of windows, the four half-domes on the hall's axes with their exedrae, the corner
//     domes and the turrets over the piers
//   the two-storey galleries along the hall's sides, under their roofs of lead
//   the courtyard with its portico of little domes and the fountain in the middle
//   its two minarets with three şerefe each, at the corners where the courtyard meets the hall
// Riders ride in through the courtyard's gates and bump into the hall, the portico and the minarets.
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { LEAD, STONE, STONE2, dome, halfDome, minaret, windows, courtyard, courtyardWalls, fountain } from './mosque.js';

const X = -436.5, Z = -799.5, TURN = -0.858; // the outline's middle, and the qibla (local +u) turned from east towards the south
const C = 25.7, H = 22, WALL = 22; // the hall's middle along u, its half width, its walls
const GREY = '#d6d0c3', GREY2 = '#c6bfb0';
const COURT = { u0: -48.4, u1: 3.7, v0: -23.3, v1: 26.7 };
const GATES = [['u0', 1.7, 6], ['v0', -22, 4.5], ['v1', -22, 4.5]];
const MINARETS = [[2.4, -25.6], [2.4, 29]].map(([u, v]) => ({ u, v, base: 10, balconies: [34, 44, 52], top: 56, capH: 10 }));

export function yeniCami() {
  const kit = new Kit();
  // the hall and its windows
  kit.box(2 * H, WALL, 2 * H, GREY, C, WALL / 2, 0);
  kit.box(2 * H + 1, 0.7, 2 * H + 1, GREY2, C, WALL - 0.35, 0);
  windows(kit, 'u', C + H + 0.05, -H + 3, H - 3, 6, [5, 11, 17], 1.7, 3.2);
  // the galleries along its sides, two storeys of arches under a lean-to roof
  for (const s of [-1, 1]) {
    kit.box(2 * H, 13, 12, GREY2, C, 6.5, s * (H + 6));
    windows(kit, 'v', s * (H + 12.05), C - H + 2, C + H - 2, 8, [3.4, 9.4], 2.6, 4.2, { hex: '#4a443c' });
    kit.frustum(2 * H + 0.6, 12.6, 2 * H + 0.6, 2, 3.2, LEAD, C, 13, s * (H + 6) - s * 0.2);
  }
  // the corner domes, the turrets over the piers, the half-domes and their exedrae
  for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    dome(kit, { x: C + su * 15.5, z: sv * 15.5, r: 4.5, y0: WALL, y1: WALL + 2, rise: 3.6, windows: 8, fin: 0, hex: GREY, finial: 0.6 });
    dome(kit, { x: C + su * 11.6, z: sv * 11.6, r: 2, y0: WALL, y1: 36, rise: 1.8, windows: 8, fin: 0.25, hex: GREY, finial: 0.5 });
  }
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2, cu = C + 11 * Math.cos(a), cv = 11 * Math.sin(a);
    for (const d of [-0.95, 0.95]) {
      const b = a + d;
      halfDome(kit, { x: cu + 10 * Math.cos(b), z: cv + 10 * Math.sin(b), a: b, r: 4.2, y0: WALL, y1: WALL + 2, rise: 3, windows: 3, hex: GREY });
    }
    halfDome(kit, { x: cu, z: cv, a, r: 11, y0: WALL, y1: 27, rise: 7.5, windows: 5, hex: GREY });
  }
  // the central dome on its drum
  kit.box(26, 5, 26, GREY, C, WALL + 2.5, 0);
  dome(kit, { x: C, r: 11.6, y0: 27, y1: 33, rise: 9.5, windows: 24, fin: 0.7, hex: GREY, finial: 1.1 });
  // the courtyard, its gate, its fountain, and the minarets
  courtyard(kit, { ...COURT, h: 9.5, depth: 7.2, bay: 7.4, gates: GATES, hex: GREY });
  for (const s of [-1, 1]) kit.box(9, 15, 1.4, GREY2, COURT.u0 + 3.6, 7.5, 1.7 + s * 3.7);
  kit.box(9, 5, 8.8, GREY2, COURT.u0 + 3.6, 12.5, 1.7);
  fountain(kit, -25.8, 3.9, 3, STONE);
  for (const m of MINARETS) minaret(kit, { x: m.u, z: m.v, w: 4.2, r0: 1.8, r1: 1.6, ...m, hex: STONE, rail: STONE2 });
  return kit.mesh(kitMat(0.9));
}

// It stands in for the map's block of it (area); riders bump into the hall and its galleries, the
// courtyard's walls and portico (left open at the gates), the fountain and the minarets (foot).
export const YENI_CAMI = [{
  id: 'yeni-cami', name: 'Yeni Cami', x: X, z: Z, turn: TURN, reach: 380,
  area: [onMap(X, Z, TURN, rect(-49.5, -35.5, 49.5, 35))],
  foot: [onMap(X, Z, TURN, rect(C - H, -H - 12, C + H, H + 12)),
    ...courtyardWalls({ ...COURT, depth: 7.2, gates: GATES }).map(({ box: [u0, v0, u1, v1] }) => onMap(X, Z, TURN, rect(u0, v0, u1, v1))),
    onMap(X, Z, TURN, rect(-28.8, 0.9, -22.8, 6.9)),
    ...MINARETS.map(m => onMap(X, Z, TURN, rect(m.u - 2.2, m.v - 2.2, m.u + 2.2, m.v + 2.2)))],
  make: yeniCami,
}];
