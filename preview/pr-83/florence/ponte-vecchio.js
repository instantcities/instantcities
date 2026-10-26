// The Ponte Vecchio (1345) over the Arno, modelled by hand in place of the map's blocks on it, from
// its measurements and photos, in game metres (the real ones times 1.25), along the map's footway
// over it: three spans between two piers, the shops along both sides, and Vasari's corridor (1565)
// over the upstream row. The river in the game runs only a few metres under the deck, so the arches
// show as a band of dark openings between the piers' cutwaters:
//   the shops, little houses of ochre, red and yellow plaster, two and three storeys, their wooden
//     shutters on the street and their back rooms hanging out over the river on wooden brackets
//   the corridor over the upstream (east) row, its small windows and its roof, carried over the
//     middle of the bridge on three round arches
//   the open terrace in the middle on the downstream side, its railing, and the bust of Cellini on
//     its pedestal
// Riders ride over it along the street between the shops, and bump into the shops.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, archRing, onMap, rect } from '../core/js/arcade.js';
import { shade, rng } from '../core/js/facades.js';
import { GLASS, TILE, panel, prism } from './marble.js';

const X = -17.7, Z = 365.4, TURN = -2.062; // the middle of the street over it, which runs from the north bank (local -x) to the south
const L = 56, ROAD = 3.9, ROW = 13.6; // half its length, the street's half width, how far out the shops reach
const GAP = 7.5; // half the open middle
const PIERS = [-20, 20], WATER = -2.4;
const CORRIDOR = [8.6, 13.2]; // Vasari's corridor's floor and eaves
const STONE = '#b49a74', WOOD = '#5a3a24', PLASTERS = ['#d9a35a', '#c0703f', '#e2c070', '#d99a80', '#e8d6b0', '#cf8a4c', '#e0b070'];
const SHUTTER = '#4f6b45';

// a row of shops along one side (side -1 east, upstream, 1 west), from u0 to u1
function shops(kit, side, u0, u1, seed, corridor) {
  const r = rng(seed);
  // the street front: a path along the row's inner face, with the outside (the street) to its right
  const front = side > 0 ? linePath(u0, ROAD, u1, ROAD) : linePath(u1, -ROAD, u0, -ROAD);
  const back = side > 0 ? linePath(u1, ROW - 2, u0, ROW - 2) : linePath(u0, -(ROW - 2), u1, -(ROW - 2));
  let u = u0;
  while (u < u1 - 0.5) {
    const w = Math.min(u1 - u, 3.2 + r() * 2.4), hex = PLASTERS[Math.floor(r() * PLASTERS.length)];
    const h = corridor ? CORRIDOR[0] : 7 + Math.floor(r() * 3) * 1.8;
    const v0 = side * ROAD, v1 = side * (ROW - 2);
    prism(kit, [[u, Math.min(v0, v1)], [u + w, Math.min(v0, v1)], [u + w, Math.max(v0, v1)], [u, Math.max(v0, v1)]], 0, h, hex);
    // its roof: a low slope of tiles out towards the river
    if (!corridor) {
      const lean = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(ROW - 2 - ROAD + 0.8, 0), new THREE.Vector2(0, 1.6)]);
      // shape x out from the street (v), extruded along -u
      const geo = new THREE.ExtrudeGeometry(lean, { depth: w + 0.3, bevelEnabled: false }).rotateY(-Math.PI / 2);
      if (side < 0) geo.scale(1, 1, -1);
      kit.add(geo, TILE, u + w + 0.15, h, side * (ROAD - 0.4));
    }
    // the shop on the street: its wooden shutter box, the windows over it with their shutters
    const s0 = side > 0 ? u - u0 : u1 - u - w, c = s0 + w / 2;
    panel(kit, front, s0 + 0.3, s0 + w - 0.3, 0, 3.4, WOOD, 0, 0.45);
    panel(kit, front, s0 + 0.6, s0 + w - 0.6, 0.4, 3, '#6b5338', 0.45, 0.06); // the shop window behind its open shutters
    panel(kit, front, s0 + 0.2, s0 + w - 0.2, 3.4, 3.8, shade(WOOD, -0.1), 0, 0.6);
    for (let y = 4.8; y + 2 < h; y += 2.8) {
      panel(kit, front, c - 0.6, c + 0.6, y, y + 1.6, GLASS, 0, 0.08);
      for (const a of [c - 1.2, c + 0.6]) panel(kit, front, a, a + 0.6, y, y + 1.6, SHUTTER, 0, 0.12);
    }
    // the back room hanging out over the river on its brackets, now and then
    const bs = side > 0 ? u1 - u - w : u - u0;
    if (r() < 0.7) {
      const y0 = 1.2 + r() * 1.4, y1 = Math.min(h - 0.6, y0 + 3.4 + r() * 2), out = 1.2 + r() * 1;
      const vb = side * (ROW - 2 + out / 2);
      kit.box(w - 0.4, y1 - y0, out, shade(hex, -0.06), u + w / 2, (y0 + y1) / 2, vb);
      kit.box(w - 0.2, 0.3, out + 0.3, TILE, u + w / 2, y1 + 0.15, vb);
      panel(kit, back, bs + w / 2 - 0.5, bs + w / 2 + 0.5, y0 + 1.2, y0 + 2.6, GLASS, out, 0.08);
      for (const d of [0.4, w - 0.4]) kit.rod([u + d, WATER + 1.2, side * (ROW - 2.2)], [u + d, y0, side * (ROW - 2 + out)], 0.12, WOOD, 4);
    } else panel(kit, back, bs + w / 2 - 0.6, bs + w / 2 + 0.6, 4, 5.8, GLASS, 0, 0.08);
    u += w;
  }
}

export function ponte() {
  const kit = new Kit();
  // the bridge's body under the street and the shops, the band of its arches on both sides
  kit.box(2 * L, 6, 2 * (ROW - 1.6), STONE, 0, -3, 0);
  for (const side of [-1, 1]) {
    const path = side > 0 ? linePath(L, ROW - 1.6, -L, ROW - 1.6) : linePath(-L, -(ROW - 1.6), L, -(ROW - 1.6));
    for (const [a, b] of [[-L + 2, PIERS[0] - 3], [PIERS[0] + 3, PIERS[1] - 3], [PIERS[1] + 3, L - 2]]) {
      const s = side > 0 ? L - (a + b) / 2 : (a + b) / 2 + L, w = b - a;
      // a low segment of a circle, from the water a little under it up to just under the street
      const rise = 2.1, R = ((w / 2) ** 2 + rise ** 2) / (2 * rise), cy = -0.7 - R, half = Math.asin(w / 2 / R);
      const arc = Array.from({ length: 13 }, (_, k) => { const t = half - (k / 12) * 2 * half; return [s + R * Math.sin(t), cy + R * Math.cos(t)]; });
      wall(kit, path, [[s - w / 2, -6], [s + w / 2, -6], ...arc], { o0: 0, o1: 0.08, hex: '#3a3a36' });
      panel(kit, path, s - w / 2, s + w / 2, -0.7, -0.2, shade(STONE, 0.08), 0, 0.3);
    }
    panel(kit, path, 0, 2 * L, -0.25, 0.2, shade(STONE, 0.1), 0, 0.4);
  }
  // the piers' cutwaters, pointed up and down the river
  for (const u of PIERS) for (const side of [-1, 1]) {
    const v = side * (ROW - 1.6), tip = side * (ROW + 3.2);
    prism(kit, [[u - 3, v], [u + 3, v], [u, tip]], -6, 0, STONE);
    prism(kit, [[u - 3.3, v], [u + 3.3, v], [u, tip + side * 0.5]], 0, 0.3, shade(STONE, 0.08));
  }
  // the shops, the corridor over the upstream ones, the terraces in the middle
  shops(kit, 1, -L, -GAP, 11, false);
  shops(kit, 1, GAP, L, 23, false);
  shops(kit, -1, -L, -GAP, 37, true);
  shops(kit, -1, GAP, L, 41, true);
  corridor(kit);
  terrace(kit);
  return kit.mesh(kitMat(0.9));
}

// Vasari's corridor along the upstream row: its walls, little windows, roof, and its three arches
// over the middle of the bridge
function corridor(kit) {
  const [y0, y1] = CORRIDOR, v0 = -ROAD - 0.4, v1 = -ROW + 1.2, CREAM = '#e3c890';
  prism(kit, [[-L, v1], [L, v1], [L, v0], [-L, v0]], y0, y1, CREAM);
  for (const [path, out] of [[linePath(L, v0, -L, v0), 0], [linePath(-L, v1, L, v1), 0]]) {
    const len = path.length;
    panel(kit, path, 0, len, y0 - 0.3, y0 + 0.3, STONE, out, 0.3);
    for (let s = 2; s < len - 1; s += 4.4) panel(kit, path, s - 0.45, s + 0.45, y0 + 1.6, y0 + 2.7, GLASS, out, 0.1);
    panel(kit, path, 0, len, y1 - 0.5, y1, shade(CREAM, -0.1), out, 0.5);
  }
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(v1 - 0.6, 0), new THREE.Vector2(v0 + 0.6, 0), new THREE.Vector2((v0 + v1) / 2, 1.8)]), { depth: 2 * L, bevelEnabled: false });
  kit.add(geo.rotateY(-Math.PI / 2), TILE, L, y1, 0); // shape x across (v), extruded along -u
  // over the middle: the corridor on its three arches, open to the river, on four piers
  const path = linePath(-GAP, v1, GAP, v1), len = path.length, bay = len / 3;
  wall(kit, path, [[0, 0], [len, 0], [len, y0], [0, y0]], { holes: [0, 1, 2].map(k => archRing((k + 0.5) * bay, bay - 1.2, 0.2, y0 - 1.2, 10)), o0: -(ROW - 1.2 - ROAD - 0.4), o1: 0, hex: STONE });
}

// the downstream terrace in the middle, its railing, and the bust of Cellini on its pedestal
function terrace(kit) {
  const v1 = ROW - 1.6;
  kit.box(2 * GAP, 0.3, v1 - ROAD, shade(STONE, 0.1), 0, 0.15, (ROAD + v1) / 2);
  for (let u = -GAP + 0.3; u <= GAP - 0.3; u += 0.6) kit.box(0.12, 1, 0.12, '#3b3b38', u, 0.8, v1 - 0.2);
  kit.box(2 * GAP, 0.12, 0.16, '#3b3b38', 0, 1.3, v1 - 0.2);
  kit.box(1.6, 2.4, 1.6, '#e8e2d4', 0, 1.5, v1 - 3).box(2, 0.3, 2, '#e8e2d4', 0, 2.85, v1 - 3);
  kit.add(new THREE.CylinderGeometry(0.45, 0.6, 0.9, 8), '#5a5640', 0, 3.45, v1 - 3);
  kit.add(new THREE.SphereGeometry(0.38, 8, 6), '#5a5640', 0, 4.2, v1 - 3);
}

// it stands in for the map's blocks on the bridge (area), and riders bump into the two rows and the
// terraces (foot), keeping to the street between them
export const PONTE_VECCHIO = [{
  id: 'ponte-vecchio', name: 'Ponte Vecchio', x: X, z: Z, turn: TURN, reach: 140,
  // (the map's downstream row reaches further out than the upstream one)
  area: [onMap(X, Z, TURN, rect(-L, -ROW - 4, L, -ROAD + 0.3)), onMap(X, Z, TURN, rect(-L, ROAD - 0.3, L, ROW + 8))],
  foot: [onMap(X, Z, TURN, rect(-L, -ROW, L, -ROAD)), onMap(X, Z, TURN, rect(-L, ROAD, L, ROW))],
  make: ponte,
}];
