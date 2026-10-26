// Notre-Dame de Paris (1163-1345, its spire rebuilt in 2024), modelled by hand in place of the
// map's building parts of it, from its measurements, in game metres (the real ones times 1.25), on
// the map's outline: 128 m from the west front to the apse (160 here), the towers 69 m, the spire
// 96 m. In pale limestone under a roof of grey lead:
//   the west front: its three portals, the Gallery of Kings, the rose window between two pairs of
//     lancets, the Grand Gallery's open arcade, and the two square towers with their tall belfry
//     windows and flat tops behind a balustrade
//   the nave and the choir under their high roof, the double aisles and the chapels along them, the
//     transept with a rose window at each end, and the round apse
//   the flying buttresses along the nave and the choir and radiating round the apse, each on its pier
//     with a pinnacle
//   the spire over the crossing, its lancets at the bottom and its needle, and the apostles in green
//     copper coming down the roof towards it
// The model's own metres: u along the axis from the crossing towards the apse (east), v across it
// (south), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = 330.3, Z = 510.8, TURN = -0.464; // the crossing, and the axis turned from east
const STONE = '#ddd5c3', STONE2 = '#cbc2ae', DARK = '#3b3a3a', LEAD = '#6c7479', COPPER = '#6f9c88';
const WEST = -85, TOWERS = -66, APSE = 52; // the west front, the back of the towers, the apse's middle
const NAVE = 7.5, INNER = 19, OUTER = 31; // half the width of the nave, of the inner aisles, of the chapels
const VAULT = 41, RIDGE = 54, GALLERY = 56, TOWER = 86;

export function notreDame() {
  const kit = new Kit();
  // a gable roof along u from u0 to u1 (or along v when `across`), w wide, from y0 up to its ridge y1
  const roof = (a0, a1, w, y0, y1, hex = LEAD, across = false) => {
    const shape = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, y1 - y0)]);
    const g = new THREE.ExtrudeGeometry(shape, { depth: a1 - a0, bevelEnabled: false });
    if (across) kit.add(g, hex, 0, y0, a0);
    else kit.add(g, hex, a0, y0, 0, 0, Math.PI / 2);
  };
  // a dark window or a portal on a wall along a path, standing a little out of it
  const opening = (path, ring, o = 0.25, hex = DARK) => wall(kit, path, ring, { o0: 0, o1: o, hex });

  // the nave and the choir, its clerestory windows, and its roof
  kit.box(APSE - TOWERS, VAULT, 2 * NAVE, STONE, (APSE + TOWERS) / 2, VAULT / 2, 0);
  roof(TOWERS, APSE, 2 * NAVE + 1.4, VAULT, RIDGE);
  // the aisles: the inner ones with their galleries, the outer ones with the chapels, flat-roofed
  for (const sv of [-1, 1]) {
    kit.box(APSE - TOWERS, 24, INNER - NAVE, STONE2, (APSE + TOWERS) / 2, 12, sv * (NAVE + INNER) / 2);
    kit.box(APSE - TOWERS, 1.2, INNER - NAVE + 1, LEAD, (APSE + TOWERS) / 2, 24.6, sv * (NAVE + INNER) / 2);
    kit.box(APSE - TOWERS - 4, 15, OUTER - INNER, STONE, (APSE + TOWERS) / 2 + 2, 7.5, sv * (INNER + OUTER) / 2);
    kit.box(APSE - TOWERS - 4, 1, OUTER - INNER + 1, LEAD, (APSE + TOWERS) / 2 + 2, 15.5, sv * (INNER + OUTER) / 2);
    // the windows: the clerestory's over the galleries, the chapels' along the outside
    const high = linePath(TOWERS + 1, sv * NAVE, APSE, sv * NAVE), low = linePath(TOWERS + 3, sv * OUTER, APSE - 2, sv * OUTER);
    const hi = sv > 0 ? high : linePath(APSE, -NAVE, TOWERS + 1, -NAVE), lo = sv > 0 ? low : linePath(APSE - 2, -OUTER, TOWERS + 3, -OUTER);
    for (let s = 4.4; s < hi.length - 3; s += 8.75) if (Math.abs(TOWERS + 1 + (sv > 0 ? s : hi.length - s)) > 10) opening(hi, pointedRing(s, 3.6, 27, 38, 1, 6), -0.25);
    for (let s = 4.4; s < lo.length - 3; s += 8.75) if (Math.abs(TOWERS + 3 + (sv > 0 ? s : lo.length - s)) > 10) opening(lo, pointedRing(s, 3.4, 3, 12.5, 1, 6), -0.25);
  }

  // the transept across the crossing, a rose window and a portal under a gable at each end
  kit.box(17.5, VAULT, 2 * OUTER + 3, STONE, 0, VAULT / 2, 0);
  roof(-OUTER - 1.5, OUTER + 1.5, 18.9, VAULT, RIDGE, LEAD, true);
  for (const sv of [-1, 1]) {
    const v = sv * (OUTER + 1.5), face = sv > 0 ? linePath(8.75, v, -8.75, v) : linePath(-8.75, v, 8.75, v);
    kit.add(new THREE.CylinderGeometry(7.2, 7.2, 0.5, 24), STONE2, 0, 28, v + sv * 0.2, Math.PI / 2);
    kit.add(new THREE.CylinderGeometry(6.4, 6.4, 0.6, 24), DARK, 0, 28, v + sv * 0.35, Math.PI / 2);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      kit.rod([0, 28, v + sv * 0.7], [6.3 * Math.cos(a), 28 + 6.3 * Math.sin(a), v + sv * 0.7], 0.22, STONE2, 4);
    }
    kit.add(new THREE.CylinderGeometry(1.4, 1.4, 0.8, 12), STONE2, 0, 28, v + sv * 0.6, Math.PI / 2);
    opening(face, pointedRing(8.75, 6, 0, 13, 1, 8), 0.4);
    kit.box(17.5, 1.2, 1.2, STONE2, 0, 18, v + sv * 0.5);
    for (const su of [-1, 1]) {
      kit.box(1.8, VAULT + 4, 1.8, STONE2, su * 8.75, (VAULT + 4) / 2, v);
      kit.add(new THREE.ConeGeometry(1.1, 5, 4).rotateY(Math.PI / 4), STONE2, su * 8.75, VAULT + 6.5, v);
    }
  }

  // the apse: the choir's round end with its roof, and the aisles and chapels round it
  kit.add(new THREE.CylinderGeometry(NAVE, NAVE, VAULT, 10, 1, false, 0, Math.PI), STONE, APSE, VAULT / 2, 0);
  kit.add(new THREE.ConeGeometry(NAVE + 0.7, RIDGE - VAULT, 10, 1, false, 0, Math.PI), LEAD, APSE, (VAULT + RIDGE) / 2, 0);
  kit.add(new THREE.CylinderGeometry(INNER, INNER, 24, 14, 1, false, 0, Math.PI), STONE2, APSE, 12, 0);
  kit.add(new THREE.CylinderGeometry(INNER + 0.5, INNER + 0.5, 1.2, 14, 1, false, 0, Math.PI), LEAD, APSE, 24.6, 0);
  kit.add(new THREE.CylinderGeometry(OUTER - 2, OUTER - 2, 15, 16, 1, false, 0, Math.PI), STONE, APSE, 7.5, 0);
  kit.add(new THREE.CylinderGeometry(OUTER - 1.5, OUTER - 1.5, 1, 16, 1, false, 0, Math.PI), LEAD, APSE, 15.5, 0);

  // the flying buttresses: a pier with its pinnacle, and two flyers up to the walls, bay by bay along
  // both sides and radiating round the apse
  const flyer = (px, pz, wx, wz, gx, gz) => {
    kit.box(2.2, 30, 2.2, STONE2, px, 15, pz);
    kit.add(new THREE.ConeGeometry(1.3, 7, 4).rotateY(Math.PI / 4), STONE2, px, 33.5, pz);
    kit.rod([px, 29, pz], [wx, 37, wz], 0.7, STONE2, 4);
    kit.rod([px, 21, pz], [gx, 24, gz], 0.6, STONE2, 4);
  };
  for (let u = TOWERS + 6; u < APSE; u += 8.75) {
    if (Math.abs(u) < 11) continue;
    for (const sv of [-1, 1]) flyer(u, sv * (OUTER + 0.5), u, sv * (NAVE + 0.5), u, sv * INNER);
  }
  for (let k = 1; k < 8; k++) {
    const a = -Math.PI / 2 + (k / 8) * Math.PI, c = Math.cos(a), s = Math.sin(a);
    flyer(APSE + (OUTER + 0.5) * c, (OUTER + 0.5) * s, APSE + (NAVE + 0.5) * c, (NAVE + 0.5) * s, APSE + INNER * c, INNER * s);
  }

  // the west front: the middle up to the Grand Gallery, the towers either side
  const TW = 25.6, TI = 6.8; // the towers' outer and inner sides, from the axis
  kit.box(TOWERS - WEST, GALLERY, 2 * TI, STONE, (WEST + TOWERS) / 2, GALLERY / 2, 0);
  for (const sv of [-1, 1]) {
    kit.box(TOWERS - WEST, TOWER, TW - TI, STONE, (WEST + TOWERS) / 2, TOWER / 2, sv * (TW + TI) / 2);
    // its buttresses up the front, and the balustrade and corner turrets round its flat top
    for (const v of [TI + 0.6, TW - 0.8]) kit.box(1.6, GALLERY, 2, STONE2, WEST - 0.8, GALLERY / 2, sv * v);
    kit.box(TOWERS - WEST + 1, 1.6, TW - TI + 1, STONE2, (WEST + TOWERS) / 2, TOWER + 0.8, sv * (TW + TI) / 2);
    kit.box(TOWERS - WEST - 3, 0.6, TW - TI - 3, LEAD, (WEST + TOWERS) / 2, TOWER + 0.3, sv * (TW + TI) / 2);
    for (const u of [WEST + 0.5, TOWERS - 0.5]) for (const v of [TI + 0.5, TW - 0.5]) {
      kit.box(1.4, 3.4, 1.4, STONE2, u, TOWER + 1.7, sv * v);
      kit.add(new THREE.ConeGeometry(0.9, 2.6, 4).rotateY(Math.PI / 4), STONE2, u, TOWER + 4.7, sv * v);
    }
    // the belfry: two tall lancets in each of its faces
    const faces = [
      linePath(WEST, sv * TW, WEST, sv * TI), linePath(TOWERS, sv * TI, TOWERS, sv * TW),
      linePath(TOWERS, sv * TW, WEST, sv * TW), linePath(WEST, sv * TI, TOWERS, sv * TI),
    ].map(p => (sv > 0 ? p : flip(p)));
    for (const face of faces) for (const d of [-1, 1]) opening(face, pointedRing(face.length / 2 + d * 4.4, 3.6, GALLERY + 3, TOWER - 4, 1.1, 6), 0.3);
    // the pairs of lancets beside the rose window
    const front = sv > 0 ? linePath(WEST, TW, WEST, TI) : linePath(WEST, -TI, WEST, -TW);
    for (const d of [-1, 1]) opening(front, pointedRing(front.length / 2 + d * 3.6, 3, 29, 41, 1, 6), 0.3);
  }
  // the front's face, from south to north: the three portals, the Gallery of Kings, the rose window
  // and the Grand Gallery's arcade
  const face = linePath(WEST - 0.1, TW, WEST - 0.1, -TW), mid = TW;
  for (const [s, w, h] of [[mid - 16.3, 8, 17], [mid, 9.5, 19], [mid + 16.3, 8, 17]]) {
    wall(kit, face, pointedRing(s, w + 2.6, 0, h + 2.2, 1, 8), { o0: 0, o1: 0.5, hex: STONE2 });
    opening(face, pointedRing(s, w, 0, h, 1, 8), 0.6);
    opening(face, [[s - w / 2, 0], [s + w / 2, 0], [s + w / 2, 7], [s - w / 2, 7]], 0.75, '#4a3328'); // its wooden doors
  }
  kit.box(1.2, 1, 2 * TW, STONE2, WEST - 0.6, 21, 0);
  opening(face, [[1, 22], [2 * TW - 1, 22], [2 * TW - 1, 26.5], [1, 26.5]], 0.3);
  for (let k = 0; k < 28; k++) {
    const v = TW - 1.8 - (k / 27) * (2 * TW - 3.6);
    kit.box(0.8, 3.4, 1.1, STONE, WEST - 0.6, 24, v);
    kit.add(new THREE.SphereGeometry(0.42, 6, 4), STONE, WEST - 0.6, 26.1, v);
  }
  kit.box(1.2, 1, 2 * TW, STONE2, WEST - 0.6, 27.2, 0);
  kit.add(new THREE.CylinderGeometry(6.6, 6.6, 0.6, 28), STONE2, WEST - 0.3, 36, 0, 0, 0, Math.PI / 2);
  kit.add(new THREE.CylinderGeometry(5.8, 5.8, 0.6, 28), DARK, WEST - 0.5, 36, 0, 0, 0, Math.PI / 2);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    kit.rod([WEST - 0.9, 36, 0], [WEST - 0.9, 36 + 5.8 * Math.sin(a), 5.8 * Math.cos(a)], 0.2, STONE2, 4);
  }
  kit.add(new THREE.CylinderGeometry(3.2, 3.2, 0.5, 20), STONE2, WEST - 0.85, 36, 0, 0, 0, Math.PI / 2);
  kit.add(new THREE.CylinderGeometry(2.6, 2.6, 0.5, 20), DARK, WEST - 1, 36, 0, 0, 0, Math.PI / 2);
  kit.box(1.4, 1, 2 * TW + 1, STONE2, WEST - 0.7, 44.5, 0);
  for (let k = 0; k < 18; k++) {
    const s = 1.6 + (k / 17) * (2 * TW - 3.2);
    opening(face, pointedRing(s, 1.9, 46, 54, 1.2, 5), 0.3);
  }
  kit.box(1.4, 1.2, 2 * TW + 1, STONE2, WEST - 0.7, GALLERY + 0.6, 0);

  // the spire over the crossing: its lancets, the needle, the cross and the rooster
  const SB = RIDGE - 2;
  kit.add(new THREE.CylinderGeometry(4.6, 5.2, 16, 8), STONE2, 0, SB + 8, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8, c = Math.cos(a), s = Math.sin(a);
    kit.box(0.6, 10, 2, DARK, 4.85 * c, SB + 8, 4.85 * s, 0, -a);
    kit.add(new THREE.ConeGeometry(0.6, 6, 4), STONE2, 5.6 * Math.cos(a - Math.PI / 8), SB + 18, 5.6 * Math.sin(a - Math.PI / 8));
  }
  kit.add(new THREE.ConeGeometry(4.6, 48, 8), LEAD, 0, SB + 16 + 24, 0);
  for (const y of [SB + 24, SB + 34, SB + 44]) kit.add(new THREE.CylinderGeometry(4.6 * (1 - (y - SB - 16) / 48) + 0.4, 4.6 * (1 - (y - SB - 16) / 48) + 0.4, 0.8, 8), STONE2, 0, y, 0);
  kit.rod([0, 117, 0], [0, 121.5, 0], 0.18, '#c9a64a', 4).box(1.8, 0.25, 0.25, '#c9a64a', 0, 120.2, 0);
  // the twelve apostles and the four beasts, in green copper, coming down the roof's four slopes
  for (const [du, dv] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (let k = 0; k < 4; k++) {
      const d = 9 + k * 2.6, y = RIDGE - 1 - k * 1.7, side = du ? [d * du, y, 3.2] : [3.2, y, d * dv];
      kit.box(0.9, 2.4, 0.9, COPPER, ...side);
    }
  }
  return kit.mesh(kitMat(0.9));
}

// a straight path run the other way round
function flip(p) {
  const a = p.at(0), b = p.at(p.length);
  return linePath(b.x, b.z, a.x, a.z);
}

export const NOTRE_DAME = [{
  id: 'notre-dame', name: 'Notre-Dame de Paris', x: X, z: Z, turn: TURN, reach: 110,
  area: [onMap(X, Z, TURN, rect(WEST - 4, -OUTER - 5, APSE + OUTER + 3, OUTER + 5))],
  foot: [onMap(X, Z, TURN, rect(WEST, -OUTER - 1, APSE, OUTER + 1)), onMap(X, Z, TURN, [[APSE, -OUTER], [APSE + 22, -22], [APSE + OUTER, 0], [APSE + 22, 22], [APSE, OUTER]])],
  make: notreDame,
}];
