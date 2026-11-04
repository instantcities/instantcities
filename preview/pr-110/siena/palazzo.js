// The Palazzo Pubblico (1297-1310) on the Piazza del Campo, Siena's town hall, with the Torre del
// Mangia (1338-48) at its east end and the Cappella di Piazza (1352-76) at the tower's foot, modelled by
// hand in place of the map's block and pieces of them, from their measurements and photos, in game
// metres (the real ones times 1.25), on the map's outline:
//   the front on the Campo, bent a little to follow the square's curve: a ground storey of grey-white
//     travertine with its Sienese arches, and over it brick, with rows of three-light windows on white
//     columns; the middle part a storey higher than the wings, the big disc with St Bernardino's
//     monogram IHS high up in it, and crenellations all along the top
//   the wings and courtyards behind it, plain brick under the tiles, out to the Piazza del Mercato
//   the Torre del Mangia, 88 m to its top and 102 m to the tip of its lightning rod: a slender brick
//     shaft, the white crown of travertine standing out on its corbels, the belfry over it with the
//     great bell, its own crown, and the little cage on top
//   the Cappella di Piazza, the stone loggia at the tower's foot, built after the Black Death: four
//     piers with their statues, and the Renaissance top over its arches
// The Campo slopes down to the palazzo, but the game's ground is flat. Riders bump into all of it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { panel, lancet, oculus, prism, sides } from '../florence/marble.js';
import { DARK, bayRing } from '../pisa/romanico.js';

const X = 242.8, Z = -31.1, TURN = 0.886; // the corner of the front at the tower's foot; the front runs west-south-west (local -x)
export const BRICK = '#a85d40', TRAVERTINE = '#ddd5c2', TILE = '#a9583a';
const STONE = shade(TRAVERTINE, -0.08);
// the map's outline of the whole palazzo, in the model's metres
const RING = [[-65.8, 37], [-31.1, 42.3], [-25.7, 42.5], [-25.4, 56.2], [-26.8, 56], [-34.9, 101.4], [-36.7, 101.3], [-37.5, 105], [-35.8, 108.1], [-33.2, 107.3], [-16.2, 109.8], [-11.2, 104.6], [-8.5, 104.8], [0.8, 56.8], [0, 0], [-30.8, 0], [-54.5, -4.1], [-72.3, -11.7], [-87.6, 29], [-83, 30.7]];
const LOW = 9, WING = 26, MID = 33, BACK = 22; // the stone storey's top, the wings', the middle part's and the back's
const T = { u0: -11.3, u1: 0, v0: 0, v1: 9.2 }; // the tower's foot
const SHAFT = 92, CROWN = 106, BELL = 119, TIP = 127.5;

// merlons along the path's top at y: square ones, w wide, one every `step` metres
function crenels(kit, path, y, { w = 0.9, h = 1.5, step = 1.8, o = 0, hex = BRICK } = {}) {
  const n = Math.max(1, Math.round(path.length / step));
  for (let k = 0; k < n; k++) {
    const c = ((k + 0.5) * path.length) / n;
    panel(kit, path, c - w / 2, c + w / 2, y, y + h, hex, o - 0.5, 0.5);
  }
}

// a Gothic three-light window at s: its pointed arch of stone, the two white columns in it
function trifora(kit, path, s, y, w = 3.2, h = 4) {
  lancet(kit, path, s, w, y, y + h, { frame: TRAVERTINE, glass: DARK, rim: 0.35, r: 0.9, o: 0.02 });
  for (const d of [-w / 6, w / 6]) panel(kit, path, s + d - 0.1, s + d + 0.1, y, y + h - w * 0.45, '#f1ece0', 0.18, 0.15);
  panel(kit, path, s - w / 2 - 0.4, s + w / 2 + 0.4, y - 0.4, y, TRAVERTINE, 0, 0.3);
}

// one part of the front from a to b (model metres), h high: its stone storey with Sienese arches,
// its brick storeys with a row of trifore each, its crenellations
function front(kit, a, b, h, bays) {
  const path = linePath(...a, ...b), len = path.length, bay = len / bays;
  const floors = Math.round((h - LOW) / 6.3), fh = (h - LOW) / floors;
  panel(kit, path, 0, len, 0, LOW, TRAVERTINE, 0, 0.2);
  for (let k = 0; k < bays; k++) {
    const c = (k + 0.5) * bay;
    lancet(kit, path, c, Math.min(3.4, bay * 0.55), 0.4, LOW - 2, { frame: STONE, glass: k % 3 === 1 ? '#4a3626' : DARK, rim: 0.5, r: 0.9, o: 0.2 });
    for (let f = 0; f < floors; f++) trifora(kit, path, c, LOW + f * fh + 1.3, Math.min(3.4, bay * 0.6), fh - 2.4);
  }
  panel(kit, path, 0, len, LOW - 0.3, LOW + 0.2, STONE, 0, 0.4);
  // the corbelled band under the crenellations
  for (let s = 0.4; s < len; s += 1.2) panel(kit, path, s, s + 0.6, h - 1.6, h - 0.6, shade(BRICK, -0.08), 0, 0.5);
  panel(kit, path, 0, len, h - 0.6, h, BRICK, 0, 0.7);
  crenels(kit, path, h, { o: 0.6 });
}

export function palazzo() {
  const kit = new Kit();
  // the back: the whole outline in brick, with rows of windows round its sides, under the tiles
  prism(kit, RING, 0, BACK, BRICK);
  prism(kit, RING, BACK, BACK + 0.6, TILE);
  for (const path of sides(RING, 4)) {
    const n = Math.floor(path.length / 4.5);
    for (let k = 0; k < n; k++) for (const y of [2.5, 9, 15.5]) lancet(kit, path, ((k + 0.5) * path.length) / n, 1.4, y, y + 3, { frame: TRAVERTINE, glass: DARK, rim: 0.3, r: 0.9, o: 0.02 });
  }
  // the front's three parts: the east wing (beside the tower), the middle, the west wing
  const E = [[-30.8, 0], [T.u0, 0]], M = [[-54.5, -4.1], [-30.8, 0]], W = [[-72.3, -11.7], [-54.5, -4.1]];
  prism(kit, [[-30.8, 0], [T.u0, 0], [T.u0, 15], [-30.8, 15]], 0, WING, BRICK);
  prism(kit, [[-54.5, -4.1], [-30.8, 0], [-30.8, 15], [-54.5, 15]], 0, MID, BRICK);
  prism(kit, [[-72.3, -11.7], [-54.5, -4.1], [-54.5, 15], [-77.4, 2]], 0, WING, BRICK);
  for (const [a, b, h, n] of [[...E, WING, 5], [...M, MID, 6], [...W, WING, 5]]) front(kit, a, b, h, n);
  // the middle part's disc of St Bernardino with the IHS, and the bell over its top
  const mid = linePath(...M[0], ...M[1]), c = mid.length / 2;
  oculus(kit, mid, c, MID - 3.4, 2.3, { frame: '#c9a24a', glass: '#2f4a6a', rim: 0.5, o: 0.3 });
  panel(kit, mid, c - 0.9, c + 0.9, MID - 3.8, MID - 3, '#d8b04a', 0.6, 0.1);
  wall(kit, mid, [[c - 1.6, MID + 1.5], [c + 1.6, MID + 1.5], [c + 1.6, MID + 4], [c, MID + 5.2], [c - 1.6, MID + 4]], { holes: [[[c - 0.7, MID + 1.8], [c + 0.7, MID + 1.8], [c + 0.7, MID + 3.6], [c - 0.7, MID + 3.6]]], o0: 0, o1: 0.6, hex: TRAVERTINE });
  // the roofs of the front parts
  for (const [ring, h] of [[[[-30.8, 0.4], [T.u0, 0.4], [T.u0, 14.6], [-30.8, 14.6]], WING], [[[-54.5, -3.7], [-30.8, 0.4], [-30.8, 14.6], [-54.5, 14.6]], MID], [[[-72, -11], [-54.5, -3.7], [-54.5, 14.6], [-77, 2]], WING]]) prism(kit, ring, h - 0.6, h - 0.3, TILE);
  tower(kit);
  cappella(kit);
  return kit.mesh(kitMat(0.9));
}

// the Torre del Mangia on its foot at the front's east end
function tower(kit) {
  const cu = (T.u0 + T.u1) / 2, cv = (T.v0 + T.v1) / 2, hu = (T.u1 - T.u0) / 2, hv = (T.v1 - T.v0) / 2;
  const box = (a, b, y0, y1, hex) => kit.box(2 * a, y1 - y0, 2 * b, hex, cu, (y0 + y1) / 2, cv);
  const faces = (a, b) => sides([[cu - a, cv - b], [cu + a, cv - b], [cu + a, cv + b], [cu - a, cv + b]]);
  box(hu, hv, 0, SHAFT, BRICK);
  box(hu + 0.05, hv + 0.05, 0, LOW, TRAVERTINE);
  // the shaft's lesenes at the corners, its slit windows, the white band at its top
  for (const path of faces(hu, hv)) {
    const len = path.length;
    for (const s of [0.6, len - 0.6]) panel(kit, path, s - 0.6, s + 0.6, LOW, SHAFT, shade(BRICK, 0.04), 0, 0.25);
    for (let y = 20; y < SHAFT - 8; y += 14) lancet(kit, path, len / 2, 0.7, y, y + 2.6, { frame: TRAVERTINE, glass: DARK, rim: 0.2, r: 0.9, o: 0.02 });
    lancet(kit, path, len / 2, 2.2, SHAFT - 9, SHAFT - 3, { frame: TRAVERTINE, glass: DARK, rim: 0.35, r: 0.9, o: 0.02 });
  }
  // the crown: corbels with little arches between them, the parapet with its windows and merlons
  const CA = hu + 0.9, CB = hv + 0.9;
  for (const path of faces(CA - 0.45, CB - 0.45)) {
    for (let s = 0.4; s < path.length; s += 1.5) panel(kit, path, s, s + 0.5, SHAFT - 1.5, SHAFT + 1.6, TRAVERTINE, -0.6, 0.6);
  }
  box(CA, CB, SHAFT + 1.6, CROWN, TRAVERTINE);
  for (const path of faces(CA, CB)) {
    const len = path.length;
    for (const s of [len * 0.3, len * 0.7]) lancet(kit, path, s, 1.6, SHAFT + 4, CROWN - 3, { frame: STONE, glass: DARK, rim: 0.25, o: 0.02 });
    crenels(kit, path, CROWN, { w: 1.1, h: 1.8, step: 2.4, hex: TRAVERTINE, o: 0.02 });
  }
  // the belfry, its arches, the bell, its own corbels and merlons, the cage and the tip
  const BA = 3.85, BB = 2.75;
  box(BA - 0.5, BB - 0.5, CROWN, BELL, shade(TRAVERTINE, -0.25));
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.box(1, BELL - CROWN, 1, TRAVERTINE, cu + x * (BA - 0.5), (CROWN + BELL) / 2, cv + z * (BB - 0.5));
  kit.add(new THREE.CylinderGeometry(0.8, 1.5, 2, 10), '#6e5a35', cu, BELL - 5, cv);
  for (const path of faces(BA, BB)) {
    wall(kit, path, [[0, BELL - 4], [path.length, BELL - 4], [path.length, BELL], [0, BELL]], { o0: -1, o1: 0, hex: TRAVERTINE });
    for (let s = 0.3; s < path.length; s += 1.2) panel(kit, path, s, s + 0.45, BELL - 1, BELL + 0.6, TRAVERTINE, 0, 0.5);
    crenels(kit, path, BELL + 0.6, { w: 0.7, h: 1.2, step: 1.4, hex: TRAVERTINE, o: 0.5 });
  }
  box(BA + 0.5, BB + 0.5, BELL, BELL + 0.6, TRAVERTINE);
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.rod([cu + x * 1.6, BELL + 0.6, cv + z * 1.2], [cu, TIP - 3.2, cv], 0.1, '#3a3a38', 4);
  kit.add(new THREE.CylinderGeometry(0.2, 0.5, TIP - BELL - 3.2, 6), TRAVERTINE, cu, (BELL + TIP - 3.2) / 2 + 0.3, cv);
  kit.add(new THREE.SphereGeometry(0.5, 8, 6), '#3a3a38', cu, TIP - 2.8, cv);
  kit.box(0.12, 2.6, 0.12, '#3a3a38', cu, TIP - 1.3, cv);
}

// the Cappella di Piazza in front of the tower's foot: its four piers with their statues in niches,
// the round arches between them and the Renaissance top with its frieze
function cappella(kit) {
  const u0 = -11.4, u1 = -0.2, v0 = -8.3, v1 = 0, H = 9.5, TOP = 13.5;
  for (const u of [u0 + 0.8, (2 * u0 + u1) / 3 + 0.3, (u0 + 2 * u1) / 3 - 0.3, u1 - 0.8]) {
    kit.box(1.6, H, 1.6, TRAVERTINE, u, H / 2, v0 + 0.8);
    kit.box(0.9, 2.2, 0.5, shade(TRAVERTINE, 0.06), u, 4.6, v0 - 0.1);
  }
  for (const u of [u0 + 0.8, u1 - 0.8]) kit.box(1.6, H, 1.6, TRAVERTINE, u, H / 2, v1 - 1.2);
  const face = linePath(u0, v0, u1, v0); // its front, to the Campo
  const len = face.length, bay = len / 3;
  for (let k = 0; k < 3; k++) wall(kit, face, bayRing(k * bay, (k + 1) * bay, 0, H, (k + 0.5) * bay, bay - 1.6, H - 0.8), { o0: -0.1, o1: 0.4, hex: TRAVERTINE });
  for (const path of [face, linePath(u1, v0, u1, v1), linePath(u0, v1, u0, v0)]) {
    panel(kit, path, 0, path.length, H, H + 1.6, shade(TRAVERTINE, -0.06), 0, 0.5);
    panel(kit, path, 0, path.length, H + 1.6, H + 2.4, TRAVERTINE, 0, 0.9);
  }
  kit.box(u1 - u0 + 0.4, 0.4, v1 - v0 + 0.4, TRAVERTINE, (u0 + u1) / 2, H + 2.6, (v0 + v1) / 2);
  wall(kit, face, [[len * 0.25, H + 2.8], [len * 0.75, H + 2.8], [len / 2, TOP]], { o0: -0.2, o1: 0.4, hex: TRAVERTINE });
  kit.box(u1 - u0 - 1, 0.3, v1 - v0 - 1, shade(TRAVERTINE, -0.3), (u0 + u1) / 2, 0.15, (v0 + v1) / 2);
}

// it stands in for the map's block and the tower's and chapel's pieces (area), and riders bump into it (foot)
// (with the strip along the front, where the map has the merlons and the tower's top as pieces of
// their own, and a little square round the middle of the map's outline, which lies outside it)
const FOOT = onMap(X, Z, TURN, RING);
const CHAPEL = onMap(X, Z, TURN, [[-11.6, -8.6], [0, -8.6], [0, 0], [-11.6, 0]]);
const STRIP = onMap(X, Z, TURN, [[3, -15], [3, 12], [-14, 12], [-14, 1], [-30.8, 1], [-54.5, -3], [-76, -9], [-76, -25], [-54.5, -16], [-30.8, -15]]);
export const PALAZZO = [{
  id: 'palazzo-pubblico', name: 'Palazzo Pubblico', x: X, z: Z, turn: TURN, reach: 260,
  area: [FOOT, STRIP, onMap(X, Z, TURN, rect(-36, 66, -32, 70))], foot: [FOOT, CHAPEL],
  make: palazzo,
}];
