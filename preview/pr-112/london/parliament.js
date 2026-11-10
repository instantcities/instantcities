// The Houses of Parliament, the Palace of Westminster (Charles Barry and Augustus Pugin, 1840-70,
// with Westminster Hall of 1097), modelled by hand in place of the map's hundreds of pieces of it,
// from its measurements and photos, in game metres (the real ones times 1.25), on the map's
// outlines: 331 m along the river, fitted to the Elizabeth Tower (elizabeth-tower.js) at its north
// end. Of the same honey-coloured Anston limestone as the tower, under roofs of grey cast iron:
//   the river front: four storeys of pointed windows between buttresses that rise through the
//     parapet as pinnacles, the middle a little higher, and at either end two pavilions under tall
//     pyramid roofs with turrets at their corners, a lower range between them
//   the Victoria Tower at the south-west corner, 120 m to the tops of its corner turrets: its
//     panelled storeys, the great arch of the Sovereign's Entrance, the parapet, the iron roof
//     and the flagstaff with the Union flag
//   the Central Tower over the Central Lobby: the octagonal lantern of tall windows and the
//     spire, between the Commons to the north and the Lords to the south
//   Westminster Hall on the west, its walls buttressed, its steep roof, and its north front of
//     the great window between two towers; St Stephen's Porch and Hall leading in from it
//   the ranges round the courtyards inside, the Royal Gallery along Old Palace Yard
// Riders bump into it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, onMap, rect } from '../core/js/arcade.js';
import { range, roof, pinnacle, turret, gable, sides } from './gothic.js';

const X = 25.2, Z = 657.3, TURN = -0.12; // the Central Tower, the river front along +z on the east
const STONE = '#cdbb8c', STONE2 = '#bfac7d', DARK = '#3b3a37', IRON = '#56616c', GOLD = '#caa24c';
const look = { stone: STONE, stone2: STONE2, glass: DARK, roofHex: IRON };
const FLOORS = h => [0, 7, 13.5, 19.5, h].filter((y, k, a) => k === a.length - 1 || y < h - 4);

// the ranges, [u0, v0, u1, v1, the top of their walls, their ridge], with their bays
const RIVER = [[46, -154.4, 59.2, -38.6, 25, 31], [46.3, -38.6, 59, 39, 27.5, 34.5], [46, 39, 58.8, 129.9, 25, 31]];
const PAVILIONS = [[58.5, -165.6, 73, -154.4], [58.9, -140.2, 73, -129.5], [57.7, 129.7, 72, 140.5], [57.1, 154.7, 71.8, 165.6]];
const LINKS = [[59.2, -154.4, 72, -140.2], [59, 140.5, 71.1, 154.7]];
const RANGES = [
  [-8.4, -165.3, 58.5, -154.1, 24, 30], // the north front, the Speaker's House
  [-15, -173, 3.3, -108.7, 24, 30], // along New Palace Yard to the Elizabeth Tower
  [27, -129, 46, -46, 24, 30], // behind the river front, north
  [-43.7, -108.4, -15, -99.7, 24, 30],
  [-10, -111.3, 16.4, -52.5, 27, 35], // the House of Commons
  [-19.5, -57.5, 46, -38.6, 26, 33], // the Commons' lobby and the range across to the river
  [-3.5, -38.6, 3.5, -12.6, 26, 32], [-3.5, 12.6, 3.5, 46, 26, 32], // the corridors either side of the Central Lobby
  [12.6, -7, 46.3, 7.5, 26, 33], // to the river front
  [-52.5, -9.2, -12.6, 6.5, 26, 35], // St Stephen's Hall
  [-36.9, 46, 46, 54.5, 24, 30],
  [-10.3, 54.5, 9.9, 145.5, 24, 30], // the House of Lords
  [-48.5, 7, -36.9, 140, 24, 30], // the Royal Gallery along Old Palace Yard
  [28.2, 54.5, 46, 129.9, 22, 28], // behind the river front, south
  [-25.3, 150, 57.2, 164.6, 24, 30], // the south front, to the Victoria Tower
  [43.4, 129.9, 57.7, 154.7, 24, 28.8],
];
// lower blocks in the courtyards, [u0, v0, u1, v1, height]
const LOW = [
  [-41.8, -99.7, -31, -61.2, 20], [-51.5, -50.5, -16.5, -9.2, 13], [-15.5, -103.2, -10, -58.1, 11], [3.5, -38.6, 46.3, -7, 11],
  [3.5, 7.5, 46.3, 46, 11], [-36.9, 6.5, -3.5, 46, 12], [-28.5, 54.5, 28.2, 150, 12], [-36.9, 54.5, -28.5, 131, 18],
  [27, -154.1, 46, -129, 11], [-54.8, 66.8, -48.5, 79.3, 10.5], [-101, -106.5, -81, -91.7, 9],
];
const PORCH = [-88.4, -11.7, -52.5, 4.6, 28, 35]; // St Stephen's Porch, its great window to the west
const VICTORIA = [-37.1, 152.15, 11.8]; // the Victoria Tower's middle and half its width
const HALL = { x: -64.1, z: -58, turn: -0.0597, w: 14.3, l: 46 }; // Westminster Hall, its middle, its turn and half its sides

// what a sub-model built in its own frame adds to the kit, turned by ry and moved to (x, z)
function placed(kit, make, x, z, ry) {
  const sub = new Kit();
  make(sub);
  const m = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z);
  for (const g of sub.pieces) kit.pieces.push(g.applyMatrix4(m));
}

// Westminster Hall in its own frame: x across it, z along it from the north front (-l) to the south
function hall(kit) {
  const { w, l } = HALL, top = 17, ridge = 35;
  range(kit, [-w, -l, w, l], { h: top, storeys: [6, top], bay: 7.6, faces: 'ew', walls: 'esw', pinnacles: false, ...look });
  roof(kit, [-w + 0.2, -l, w - 0.2, l], top + 1, ridge, IRON, { along: 'v' });
  // the buttresses down the west side, stepping out
  for (let z = -l + 7.6; z < l - 1; z += 7.6) {
    kit.box(3.4, 12, 2, STONE2, -w - 1.7, 6, z).box(2, 6, 2, STONE2, -w - 1, 15, z);
    pinnacle(kit, -w - 1, 18, z, 1.4, 4, STONE2);
  }
  // the north front: the great window, the door under it, the gable, the two towers
  const north = sides([-w, -l, w, l])[0];
  wall(kit, north, [[0, 0], [north.length, 0], [north.length, top + 1.3], [0, top + 1.3]], {
    holes: [pointedRing(w, 11, 8.5, top + 0.5, 1, 10), pointedRing(w, 5.4, 0, 6.6, 1, 8)], o0: -0.8, o1: 0.2, hex: STONE });
  kit.box(5, 6.4, 0.6, '#4a3a2c', 0, 3.2, -l + 0.4);
  gable(kit, north, top + 1.3, ridge + 0.6, STONE, { holes: [pointedRing(w, 6, top + 2.5, ridge - 4, 1, 8)] });
  for (let k = -2; k <= 2; k++) kit.box(0.3, top - 9, 0.3, STONE2, k * 1.9, 8.5 + (top - 9) / 2, -l - 0.15); // the window's mullions
  for (const s of [-1, 1]) {
    const box = [s * w - 5, -l - 9.5, s * w + 5, -l + 2];
    range(kit, box, { h: 28, storeys: [0, 9, 18, 28], bay: 5, pinnacles: false, ...look });
    for (const [du, dv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) turret(kit, s * w + du * 4.6, -l - 3.75 + dv * 5.4, 0, 31, 1.1, STONE2, STONE2, { cap: 3.6 });
  }
}

// the Victoria Tower in its own frame, its middle at the origin
function victoria(kit) {
  const H = VICTORIA[2], BODY = 91.3;
  range(kit, [-H, -H, H, H], { h: BODY, storeys: [0, 20, 33, 43, 53, 63, 73, 82, BODY], bay: 4.7, win: 0.5, pinnacles: false, ...look });
  // the Sovereign's Entrance: a great arch on the south and the west, its doors deep in it
  for (const [path, s] of [[sides([-H, -H, H, H])[2], 1], [sides([-H, -H, H, H])[3], 1]]) {
    wall(kit, path, pointedRing(H, 10, 0.2, 19, 1, 10), { o0: 0.05, o1: 0.45, hex: STONE2 });
    wall(kit, path, pointedRing(H, 8, 0.2, 17.5, 1, 10), { o0: 0.46, o1: 0.5, hex: '#2c2a27' });
  }
  // the corner turrets, the parapet, the pinnacles between, the roof and the flagstaff
  for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    turret(kit, su * (H - 0.4), sv * (H - 0.4), 0, 108, 2.2, STONE, STONE2, { cap: 11.4, slit: DARK });
    kit.add(new THREE.CylinderGeometry(2.7, 2.7, 1, 8).rotateY(Math.PI / 8), STONE2, su * (H - 0.4), BODY + 1, sv * (H - 0.4));
    kit.add(new THREE.SphereGeometry(0.45, 6, 4), GOLD, su * (H - 0.4), 120.3, sv * (H - 0.4));
  }
  sides([-H, -H, H, H]).forEach(path => {
    const len = path.length, holes = [];
    for (let k = 0; k < 6; k++) holes.push(pointedRing(3.5 + k * ((len - 7) / 5), 2, BODY + 1.4, BODY + 5.6, 1, 5));
    wall(kit, path, [[2.6, BODY], [len - 2.6, BODY], [len - 2.6, BODY + 7], [2.6, BODY + 7]], { holes, o0: -0.6, o1: 0.1, hex: STONE });
    for (const f of [1 / 3, 2 / 3]) {
      const p = path.at(len * f);
      pinnacle(kit, p.x, BODY + 7, p.z, 1.3, 6.5, STONE2);
    }
  });
  roof(kit, [-H + 1, -H + 1, H - 1, H - 1], BODY, 110.6, IRON, { hip: true });
  kit.rod([0, 110.6, 0], [0, 140, 0], 0.3, '#e9e6dc', 8);
  kit.add(new THREE.SphereGeometry(0.5, 8, 6), GOLD, 0, 140.3, 0);
  // the Union flag, flying to the north
  const F = 0.02;
  kit.box(F, 6, 12, '#1f3a7a', 0.3, 136.5, -6.2);
  kit.box(F * 2, 1.7, 12, '#ffffff', 0.3, 136.5, -6.2).box(F * 2, 6, 2.8, '#ffffff', 0.3, 136.5, -6.2);
  kit.box(F * 3, 1, 12, '#c8102e', 0.3, 136.5, -6.2).box(F * 3, 6, 1.6, '#c8102e', 0.3, 136.5, -6.2);
  for (const a of [Math.atan2(6, 12), -Math.atan2(6, 12)]) {
    kit.box(F * 1.5, 1.4, 13.4, '#ffffff', 0.3, 136.5, -6.2, a);
    kit.box(F * 2.5, 0.5, 13.4, '#c8102e', 0.3, 136.5, -6.2, a);
  }
}

// the Central Lobby and the Central Tower over it, at the origin
function centralTower(kit) {
  const oct = (r, h, y, hex) => kit.add(new THREE.CylinderGeometry(r, r, h, 8).rotateY(Math.PI / 8), hex, 0, y + h / 2, 0);
  oct(13.2, 31.3, 0, STONE);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, c = Math.cos(Math.PI / 8);
    kit.box(0.25, 12, 3, DARK, 13.2 * c * Math.cos(a), 22, 13.2 * c * Math.sin(a), 0, -a);
    const ca = a + Math.PI / 8;
    pinnacle(kit, 13.6 * Math.cos(ca), 31.3, 13.6 * Math.sin(ca), 1.2, 4.5, STONE2);
  }
  oct(13.6, 0.8, 31.3, STONE2);
  // the lantern: two tall windows on each side, buttresses at the corners rising as pinnacles
  oct(10, 30, 31.3, STONE);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, r = 10 * Math.cos(Math.PI / 8) + 0.05, ca = a + Math.PI / 8;
    for (const d of [-1.05, 1.05]) kit.box(0.2, 15, 1.4, DARK, r * Math.cos(a) - d * Math.sin(a), 46, r * Math.sin(a) + d * Math.cos(a), 0, -a);
    kit.box(1.6, 30, 1.6, STONE2, 10.3 * Math.cos(ca), 31.3 + 15, 10.3 * Math.sin(ca), 0, -ca);
    turret(kit, 10.3 * Math.cos(ca), 10.3 * Math.sin(ca), 61.3, 63, 0.9, STONE2, STONE2, { cap: 5 });
  }
  oct(10.6, 1, 61.3, STONE2);
  // the spire, its lucarnes, the finial
  kit.add(new THREE.ConeGeometry(9, 34, 8).rotateY(Math.PI / 8), STONE, 0, 62.3 + 17, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, r = 6.2;
    kit.box(1.4, 3, 1.4, STONE2, r * Math.cos(a), 69.5, r * Math.sin(a), 0, -a);
    kit.add(new THREE.ConeGeometry(1.1, 2.6, 4).rotateY(Math.PI / 4 - a), STONE2, r * Math.cos(a), 72.3, r * Math.sin(a));
  }
  kit.rod([0, 96, 0], [0, 99.5, 0], 0.2, GOLD).add(new THREE.SphereGeometry(0.45, 8, 6), GOLD, 0, 99.5, 0);
}

export function parliament() {
  const kit = new Kit();
  // the river front, its pavilions, the ranges between them
  for (const [u0, v0, u1, v1, h, ridge] of RIVER) range(kit, [u0, v0, u1, v1], { h, ridge, storeys: FLOORS(h), bay: 4.2, faces: 'ens', along: 'v', ...look });
  for (const b of PAVILIONS) {
    range(kit, b, { h: 32, storeys: FLOORS(32), bay: 4.4, pinnacles: false, ...look });
    roof(kit, [b[0] + 0.6, b[1] + 0.6, b[2] - 0.6, b[3] - 0.6], 32, 41.3, IRON, { hip: true });
    for (const [u, v] of [[b[2], b[1]], [b[2], b[3]], [b[0] + 0.6, b[1]], [b[0] + 0.6, b[3]]]) turret(kit, u, v, 0, 39, 1.25, STONE, IRON, { cap: 6 });
    const cu = (b[0] + b[2]) / 2, cv = (b[1] + b[3]) / 2;
    kit.rod([cu, 41.3, cv], [cu, 44.5, cv], 0.15, GOLD);
  }
  for (const b of LINKS) range(kit, b, { h: 26, ridge: 32.5, storeys: FLOORS(26), bay: 4.4, ...look });
  // a row of little vents with their spirelets along the river front's ridge
  for (let v = -140; v <= 120; v += 20) {
    const u = 52.6, y = v > -38.6 && v < 39 ? 34.5 : 31;
    kit.box(1.6, 2.4, 1.6, STONE2, u, y + 0.6, v);
    kit.add(new THREE.ConeGeometry(1.3, 3.2, 4).rotateY(Math.PI / 4), IRON, u, y + 3.4, v);
  }
  // the ranges round the courtyards, their windows plainer, and the low blocks in them plain
  for (const [u0, v0, u1, v1, h, ridge] of RANGES) range(kit, [u0, v0, u1, v1], { h, ridge, storeys: FLOORS(h), bay: 5.6, seg: 2, ...look });
  for (const [u0, v0, u1, v1, h] of LOW) range(kit, [u0, v0, u1, v1], { h, faces: '', pinnacles: false, parapet: 0.8, ...look });
  // St Stephen's Porch: its great west window under the gable
  const [pu0, pv0, pu1, pv1, ph, pr] = PORCH;
  range(kit, [pu0, pv0, pu1, pv1], { h: ph, ridge: pr, storeys: FLOORS(ph), bay: 5, walls: 'nes', along: 'u', ...look });
  const west = sides([pu0, pv0, pu1, pv1])[3];
  wall(kit, west, [[0, 0], [west.length, 0], [west.length, ph + 1.3], [0, ph + 1.3]], {
    holes: [pointedRing(west.length / 2, 9, 8, 25.5, 1, 10), pointedRing(west.length / 2, 5, 0, 6.4, 1, 8)], o0: -0.8, o1: 0.3, hex: STONE });
  gable(kit, west, ph + 1.3, pr + 0.6, STONE);
  for (const v of [pv0, pv1]) turret(kit, pu0, v, 0, 33, 1.5, STONE, STONE2, { cap: 5 });
  kit.box(1, 6.2, 4.6, '#4a3a2c', pu0 + 0.3, 3.1, (pv0 + pv1) / 2);
  // Westminster Hall, the Victoria Tower, the Central Tower
  placed(kit, hall, HALL.x, HALL.z, HALL.turn);
  placed(kit, victoria, VICTORIA[0], VICTORIA[1], 0);
  centralTower(kit);
  return kit.mesh(kitMat(0.85));
}

const R = ([u0, v0, u1, v1]) => onMap(X, Z, TURN, rect(u0, v0, u1, v1));
const hallRing = (() => {
  const { x, z, turn, w, l } = HALL, c = Math.cos(turn), s = Math.sin(turn);
  return onMap(X, Z, TURN, [[-w - 3.4, -l], [w, -l], [w, l], [-w - 3.4, l]].map(([a, b]) => [x + a * c + b * s, z - a * s + b * c]));
})();
const OCT = onMap(X, Z, TURN, Array.from({ length: 8 }, (_, k) => [13.3 * Math.cos(((k + 0.5) / 8) * Math.PI * 2), 13.3 * Math.sin(((k + 0.5) / 8) * Math.PI * 2)]));
const [vu, vv, vh] = VICTORIA;
export const PARLIAMENT = [{
  id: 'parliament', name: 'Houses of Parliament', x: X, z: Z, turn: TURN, reach: 450,
  area: [R([-56, -166.5, 74.5, 167]), R([-16, -173.1, 4, -166.5]), R([-101, -115, -56, 7])],
  foot: [...RIVER, ...PAVILIONS, ...LINKS, ...RANGES, ...LOW, PORCH].map(R).concat([hallRing, OCT, R([vu - vh, vv - vh, vu + vh, vv + vh]),
    ...[-1, 1].map(s => {
      const { x, z, turn, w, l } = HALL, c = Math.cos(turn), sn = Math.sin(turn), pts = [[s * w - 5, -l - 9.5], [s * w + 5, -l - 9.5], [s * w + 5, -l], [s * w - 5, -l]];
      return onMap(X, Z, TURN, pts.map(([a, b]) => [x + a * c + b * sn, z - a * sn + b * c]));
    })]),
  make: parliament,
}];
