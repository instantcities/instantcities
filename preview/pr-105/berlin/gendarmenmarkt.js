// The Gendarmenmarkt's three buildings, modelled by hand in place of the map's outlines of them,
// from their measurements and photos, in game metres (the real ones times 1.25):
//   Schinkel's Konzerthaus (1818-21) on the west side of the square: its wings, two storeys of tall
//     windows between flat pilasters, and the higher middle block under its pitched roof, its
//     pediments at both ends with Apollo's chariot on the east one; in front, the portico of six
//     Ionic columns on its broad steps
//   the French church (north) and the German church (south), each a low church with its rounded
//     ends under a hipped roof, and east of it Gontard's tower (1781-85) facing the square: a square
//     block with a portico of six Corinthian columns and a pediment on three of its sides, the drum
//     ringed by columns over it, the dome, the lantern and the gilded figure on top, 70 m up
// The three stand turned alike, a little off north: +u runs east (to the square), +v south.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, sweep, linePath, column, gable, rect } from '../core/js/arcade.js';
import { nearest, buildings, local, box, sides, prism, roof, shrink, cornice, windows, dome, colonnade, drum, lantern, figure, pediment, portico } from './outline.js';

const TURN = 0.095;
const STONE = '#e2d6bf', STONE2 = '#cdbfa4', PLASTER = '#e8dcc6', DARK = '#33363a', ROOFC = '#6f7778', COPPER = '#6c9a86', COPPER2 = '#5b8875', GOLD = '#d4b04a';

// a straight path from (u0, v0) to (u1, v1) in a model's own metres
const line = (u0, v0, u1, v1) => linePath(u0, v0, u1, v1);

// ---- the Konzerthaus
const KX = 540, KZ = 176;
const KONZERT = nearest('theatre', 535.3, 177.1, 6)?.p ?? [];
const HALL = [-31.7, -28.4, 26.9, 27.7]; // the middle block: u0, v0, u1, v1
const WING = 22, EAVES = 31, RIDGE = 38.5;

export function konzerthaus() {
  // the outline without the portico, which stands in front of it
  const kit = new Kit(), ring = local(KONZERT, KX, KZ, TURN).map(([u, v]) => [Math.abs(v) < 17.6 ? Math.min(u, HALL[2]) : u, v]);
  // the wings: the whole outline up to their cornice, their two storeys of windows
  prism(kit, ring, 0, WING - 1.4, PLASTER);
  for (const path of sides(ring, 1.5)) {
    const L = path.length;
    wall(kit, path, [[0, 0], [L, 0], [L, 4.2], [0, 4.2]], { o0: -0.1, o1: 0.25, hex: STONE2 });
    sweep(kit, path, 0, L, [[-0.1, 9.6], [0.4, 9.6], [0.4, 10.3], [-0.1, 10.3]], STONE2, { step: L });
    const n = Math.max(1, Math.floor(L / 3.6));
    for (let k = 0; k <= n; k++) column(kit, path, Math.min(Math.max((k * L) / n, 0.45), L - 0.45), 0.2, 4.2, WING - 2.6, 0.45, STONE, 'pilaster');
  }
  windows(kit, ring, { bay: 3.6, w: 1.6, y0: 5.2, y1: 9, hex: DARK, min: 2.6 });
  windows(kit, ring, { bay: 3.6, w: 1.8, y0: 11.4, y1: 18.2, hex: DARK, min: 2.6 });
  cornice(kit, ring, WING, STONE2, { out: 0.9, h: 1.4 });
  prism(kit, shrink(ring, 0.01), WING - 0.4, WING + 0.6, ROOFC);
  // the middle block over them, its upper windows, its roof and pediments, Apollo on the east one
  const hall = rect(...HALL);
  prism(kit, hall, WING, EAVES - 1.4, PLASTER);
  windows(kit, hall, { bay: 3.6, w: 1.8, y0: WING + 1.6, y1: EAVES - 3.2, hex: DARK });
  for (const path of sides(hall, 2)) {
    const L = path.length, n = Math.max(1, Math.floor(L / 3.6));
    for (let k = 0; k <= n; k++) column(kit, path, Math.min(Math.max((k * L) / n, 0.45), L - 0.45), 0.2, WING + 0.6, EAVES - 1.8, 0.45, STONE, 'pilaster');
  }
  cornice(kit, hall, EAVES, STONE2, { out: 1, h: 1.6 });
  gable(kit, HALL[0] - 0.6, HALL[2] + 0.6, (HALL[3] - HALL[1]) / 2 + 0.6, EAVES, RIDGE, ROOFC, { z: (HALL[1] + HALL[3]) / 2 });
  for (const u of [HALL[0] - 0.1, HALL[2] + 0.1]) pediment(kit, u, (HALL[1] + HALL[3]) / 2, HALL[3] - HALL[1] + 0.4, EAVES, RIDGE - EAVES - 0.2, 0.6, STONE, Math.PI / 2);
  // Apollo in his chariot drawn by griffins, on the east pediment's peak
  const cu = HALL[2] - 0.6, cv = (HALL[1] + HALL[3]) / 2;
  kit.box(2.2, 1.2, 3, COPPER2, cu, RIDGE + 0.6, cv);
  for (const d of [-0.6, 0.6]) kit.box(2.6, 1.4, 0.7, COPPER, cu + 2, RIDGE + 1.2, cv + d);
  figure(kit, cu - 0.2, RIDGE + 1.1, cv, 2.6, COPPER);
  // the portico on the east front, on its steps
  portico(kit, line(35.5, -17.4, 35.5, 16.8), 0, 34.2, { n: 6, y0: 6.8, y1: 20.4, r: 0.95, order: 'ionic', deep: 8.6, rise: 6.2, hex: STONE, hex2: STONE2, steps: 8 });
  return kit.mesh(kitMat(0.88));
}

// ---- the two churches and their towers
// one of them: the tower's building (outline), its drum's ring (the map's part), the church's outline
function church(tw, part, nave, X, Z) {
  const T = tw ? local(tw.p, X, Z, TURN) : [], tb = box(T);
  const drumAt = part ? box(local(part.p, X, Z, TURN)) : { u: 0, v: 0, r: 8.8 };
  const N = nave ? local(nave.p, X, Z, TURN) : [];
  return function make() {
    const kit = new Kit();
    // the church: its walls, its tall windows, and its hipped roof
    if (N.length) {
      prism(kit, N, 0, 14.5, PLASTER);
      windows(kit, N, { bay: 4.6, w: 2, y0: 4, y1: 12, arch: true, hex: DARK, min: 3 });
      cornice(kit, N, 15.5, STONE2, { out: 0.8, h: 1.2 });
      roof(kit, shrink(N, -0.02), shrink(N, 0.55), 15.5, 23, ROOFC);
    }
    // the tower's square block, from the church's side to the square
    const block = rect(Math.max(tb.u0, -26.8), -15.8, 15.5, 15.5);
    prism(kit, block, 0, 25.6, STONE);
    windows(kit, block, { bay: 5, w: 1.6, y0: 4, y1: 8, hex: DARK, min: 3 });
    windows(kit, block, { bay: 5, w: 1.8, y0: 11, y1: 19, arch: true, hex: DARK, min: 3 });
    cornice(kit, block, 26.4, STONE2, { out: 0.8, h: 1.6, rail: 1.2, railHex: STONE });
    prism(kit, shrink(block, 0.02), 25.6, 26.8, ROOFC);
    // the porticoes on its north, east and south sides
    const P = { n: 6, y0: 3.4, y1: 20.6, r: 0.95, deep: 6.6, rise: 6, steps: 6, hex: STONE, hex2: STONE2 };
    portico(kit, line(-15.7, -22.3, 15.5, -22.3), 0, 31.2, P); // north: runs east, its right to -v
    portico(kit, line(22.1, -15.8, 22.1, 15.5), 0, 31.3, P); // east: runs south, its right to +u
    portico(kit, line(15.5, 21.9, -15.7, 21.9), 0, 31.2, P); // south: runs west, its right to +v
    // the drum ringed by columns, its balustrade, the attic over it, the dome and the lantern
    const { u, v } = drumAt, R = Math.max(drumAt.r, 8.6);
    drum(kit, u, v, R - 1.6, 26.8, 47, STONE, { n: 24, win: 12, w: 1.8, wy0: 4, wy1: 15 });
    kit.add(new THREE.CylinderGeometry(R + 0.8, R + 1, 1.6, 24), STONE2, u, 27.6, v);
    colonnade(kit, u, v, R, 24, 28.4, 43.4, 0.62, STONE, { ent: 1.8, entHex: STONE2 });
    kit.add(new THREE.CylinderGeometry(R + 0.6, R + 0.6, 1.3, 24, 1, true), STONE, u, 46.2, v); // the balustrade
    drum(kit, u, v, R - 2.2, 47, 53.4, STONE, { n: 24, win: 8, w: 1.2, wy0: 1.4, wy1: 5 });
    kit.add(new THREE.CylinderGeometry(R - 1.6, R - 1.6, 0.8, 24), STONE2, u, 53.4, v);
    dome(kit, u, v, R - 2.2, 53.8, 13.2, COPPER, { n: 24, rows: 8, ribs: 12, ribHex: COPPER2 });
    lantern(kit, u, v, 2.2, 66.6, 5.4, 74.6, STONE, COPPER, GOLD);
    figure(kit, u, 75.4, v, 5.6, GOLD); // the gilded figure on top, 70 m up
    kit.add(new THREE.CylinderGeometry(0.8, 1, 1, 8), GOLD, u, 75, v);
    return kit.mesh(kitMat(0.86));
  };
}

const FRZ = nearest('church', 586.7, 63.3, 6), DTZ = nearest('church', 612.7, 291.4, 6);
const FRZ_NAVE = nearest('church', 540.5, 67.1, 6), DTZ_NAVE = nearest('church', 571.1, 295.5, 6);
const FX = 585, FZ = 63.7, DX = 608.5, DZ = 291.9;
// the map's rings of the drum and dome over a tower, and the widest of them
const parts = (x, z) => buildings('part', x, z, 4).map(b => b.p);
const outer = (x, z) => buildings('part', x, z, 4).sort((a, b) => box(local(b.p, x, z, 0)).r - box(local(a.p, x, z, 0)).r)[0];

export const GENDARMENMARKT = [
  {
    id: 'konzerthaus', name: 'Konzerthaus', x: KX, z: KZ, turn: TURN, reach: 260,
    area: KONZERT.length ? [KONZERT] : [], foot: KONZERT.length ? [KONZERT] : [], make: konzerthaus,
  },
  ...[[FRZ, FRZ_NAVE, FX, FZ, 'franzoesischer-dom', 'Französischer Dom'], [DTZ, DTZ_NAVE, DX, DZ, 'deutscher-dom', 'Deutscher Dom']]
    .filter(([tw]) => tw)
    .map(([tw, nave, x, z, id, name]) => ({
      id, name, x, z, turn: TURN, reach: 380,
      area: [tw.p, ...(nave ? [nave.p] : []), ...parts(x, z)],
      foot: [tw.p, ...(nave ? [nave.p] : [])],
      make: church(tw, outer(x, z), nave, x, z),
    })),
];
