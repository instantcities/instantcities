// The cathedral group of Florence, modelled by hand in place of the map's pieces of it, from
// measurements and photos, in game metres (the real ones times 1.25), on the map's outlines. All of
// it in the white marble of Carrara, the green of Prato and the pink of the Maremma, laid out in
// panels:
//   Santa Maria del Fiore: the nave with its aisles and their tall windows, the 19th-century front
//     with its three portals, rose windows and pinnacles; the octagonal drum with a round window in
//     each face, the three tribunes round it with their little domes, and Brunelleschi's dome of red
//     tiles between its eight white ribs, with the lantern, the gilded ball and the cross on top
//   Giotto's Campanile at the front's south corner: five storeys of panelling between its corner
//     piers, the two-light windows of the middle storeys, the tall three-light ones at the top, and
//     the cornice on its brackets (the map has only its top, floating at 100 m)
//   the Baptistery of San Giovanni across the square: its octagon in three storeys of panels and
//     blind arches, the low white pyramid of its roof and the lantern, the gilded Gates of Paradise
//     to the cathedral and the scarsella, its square apse, to the west
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, square, polygon, wall, sweep, pointedRing, archRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const WHITE = '#ece7da', GREEN = '#4c6a55', PINK = '#cf9a8f', TILE = '#b5603e', TILE2 = '#a85536', DARK = '#3a3a3c', GOLD = '#d4ad4a';
const TURN = -0.035; // the cathedral's axis, and the others with it, turned from east

// The marble panels on a stretch of wall: green strips round `cols` by `rows` panels from s0 to s1
// and y0 to y1, standing a little proud of its face at o, and a pink one inside every other panel.
function panels(kit, path, s0, s1, y0, y1, cols, rows, o = 0, pink = true) {
  const w = (s1 - s0) / cols, h = (y1 - y0) / rows, t = Math.min(0.35, w * 0.08), slab = { o0: o, o1: o + 0.08 };
  for (let c = 0; c <= cols; c++) {
    const s = s0 + c * w;
    wall(kit, path, [[s - t, y0], [s + t, y0], [s + t, y1], [s - t, y1]], { ...slab, hex: GREEN });
  }
  for (let r = 0; r <= rows; r++) {
    const y = y0 + r * h;
    wall(kit, path, [[s0, y - t], [s1, y - t], [s1, y + t], [s0, y + t]], { ...slab, hex: GREEN });
  }
  if (pink) for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) if ((c + r) % 2 === 0) {
    const s = s0 + (c + 0.5) * w, y = y0 + (r + 0.5) * h, a = Math.min(w, h) * 0.22;
    wall(kit, path, [[s, y - a], [s + a, y], [s, y + a], [s - a, y]], { o0: o, o1: o + 0.06, hex: PINK });
  }
}

// a gable roof over a rectangle from u0 to u1 along x, half-width hw, its eaves at y and ridge at top
function gable(kit, u0, u1, hw, y, top, hex) {
  const g = new THREE.BufferGeometry(), pos = [];
  const P = (u, v, h) => [u, h, v];
  const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d);
  quad(P(u0, -hw, y), P(u0, 0, top), P(u1, 0, top), P(u1, -hw, y));
  quad(P(u1, hw, y), P(u1, 0, top), P(u0, 0, top), P(u0, hw, y));
  pos.push(...P(u0, -hw, y), ...P(u0, hw, y), ...P(u0, 0, top), ...P(u1, hw, y), ...P(u1, -hw, y), ...P(u1, 0, top));
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  kit.add(g, hex);
}

// ---- Santa Maria del Fiore ----
const DX = 362.2, DZ = -334.6; // the middle of the dome
const FRONT = -135.5, NAVE = -26, HW = 23.5, AISLE = 34, CLERE = 46, RIDGE = 55;
const DRUM = 34, DRUM_TOP = 70, DOME_R = 31.5;

export function duomo() {
  const kit = new Kit();
  // the aisles' walls along both sides, their tall windows, panels, and the cornice
  for (const side of [-1, 1]) {
    const path = side < 0 ? linePath(FRONT, -HW, NAVE, -HW) : linePath(NAVE, HW, FRONT, HW), len = path.length;
    const bays = 4, bay = len / bays, holes = [];
    for (let b = 0; b < bays; b++) holes.push(pointedRing((b + 0.5) * bay, 3.2, 14, 27, 1, 6));
    wall(kit, path, [[0, 0], [len, 0], [len, AISLE], [0, AISLE]], { holes, o0: -1.2, o1: 0, hex: WHITE });
    for (const ring of holes) wall(kit, path, ring, { o0: -1, o1: -0.8, hex: DARK });
    for (let b = 0; b < bays; b++) {
      panels(kit, path, b * bay + 0.6, b * bay + bay * 0.5 - 2.2, 1, AISLE - 3, 2, 5);
      panels(kit, path, b * bay + bay * 0.5 + 2.2, (b + 1) * bay - 0.6, 1, AISLE - 3, 2, 5);
    }
    sweep(kit, path, 0, len, [[-0.2, AISLE - 1], [0.6, AISLE - 1], [0.6, AISLE], [-0.2, AISLE]], WHITE, { step: len });
    // the clerestory over the aisle, its round windows
    const cp = side < 0 ? linePath(FRONT + 6, -11, NAVE, -11) : linePath(NAVE, 11, FRONT + 6, 11), cl = cp.length;
    const oculi = Array.from({ length: 4 }, (_, b) => archRing((b + 0.5) * (cl / 4), 3.4, CLERE - 7.6, CLERE - 4.2, 10)).map(r => [...r, ...r.slice(2).map(([s, y]) => [s, 2 * (CLERE - 5.9) - y]).reverse()].filter((p, i, a) => i === 0 || p[1] !== a[i - 1][1] || p[0] !== a[i - 1][0]));
    wall(kit, cp, [[0, AISLE], [cl, AISLE], [cl, CLERE], [0, CLERE]], { o0: -1, o1: 0, hex: WHITE });
    panels(kit, cp, 0.5, cl - 0.5, AISLE + 0.6, CLERE - 0.6, 8, 2, 0, false);
    for (let b = 0; b < 4; b++) {
      const s = (b + 0.5) * (cl / 4), ring = Array.from({ length: 16 }, (_, k) => [s + 1.7 * Math.cos((k / 16) * 2 * Math.PI), CLERE - 5.9 + 1.7 * Math.sin((k / 16) * 2 * Math.PI)]);
      wall(kit, cp, ring, { o0: 0, o1: 0.1, hex: DARK });
    }
  }
  // the aisles' and the nave's roofs
  gable(kit, FRONT + 1, NAVE, HW + 0.6, AISLE, AISLE + 4, TILE2);
  kit.box(NAVE - FRONT - 1, CLERE - AISLE, 22, WHITE, (FRONT + 1 + NAVE) / 2, (AISLE + CLERE) / 2, 0);
  gable(kit, FRONT + 6, NAVE, 12, CLERE, RIDGE, TILE);
  // the front: its three portals, the rose windows, the pinnacles, the gable on top
  const fp = linePath(FRONT, HW, FRONT, -HW), fl = fp.length, mid = fl / 2;
  wall(kit, fp, [[0, 0], [fl, 0], [fl, AISLE + 4], [mid + 11, AISLE + 4], [mid + 11, CLERE + 2], [mid + 3, CLERE + 8], [mid, 61], [mid - 3, CLERE + 8], [mid - 11, CLERE + 2], [mid - 11, AISLE + 4], [0, AISLE + 4]], { o0: -2, o1: 0, hex: WHITE });
  for (const [s, w, h] of [[mid, 7, 15], [mid - 14.5, 4, 11], [mid + 14.5, 4, 11]]) {
    wall(kit, fp, pointedRing(s, w + 2.4, 0, h + 4.6, 1, 8), { o0: 0, o1: 0.4, hex: PINK });
    wall(kit, fp, pointedRing(s, w, 0, h, 1, 8), { o0: 0.4, o1: 0.5, hex: '#5c4630' });
    wall(kit, fp, [[s - w / 2 - 1.2, h + 3.2], [s + w / 2 + 1.2, h + 3.2], [s, h + 8]], { o0: 0, o1: 0.45, hex: WHITE });
  }
  for (const [s, y, r] of [[mid, 29, 4.2], [mid - 14.5, 24, 2], [mid + 14.5, 24, 2], [mid, 47, 2.2]]) {
    const ring = n => Array.from({ length: 24 }, (_, k) => [s + n * Math.cos((k / 24) * 2 * Math.PI), y + n * Math.sin((k / 24) * 2 * Math.PI)]);
    wall(kit, fp, ring(r + 0.9), { o0: 0, o1: 0.3, hex: GREEN });
    wall(kit, fp, ring(r), { o0: 0.3, o1: 0.4, hex: '#33444f' });
  }
  panels(kit, fp, 1, fl - 1, 19, AISLE + 3, 12, 2, 0, false);
  for (const s of [1.2, mid - 9.6, mid - 4.6, mid + 4.6, mid + 9.6, fl - 1.2]) {
    const p = fp.at(s), x = p.x + 0.8 * p.tz, z = p.z - 0.8 * p.tx, top = Math.abs(s - mid) < 6 ? CLERE + 4 : AISLE + 6;
    kit.box(1.6, top, 1.6, WHITE, x, top / 2, z);
    kit.add(new THREE.ConeGeometry(1.1, 4.4, 4).rotateY(Math.PI / 4), WHITE, x, top + 2.2, z);
    for (let y = 3; y < top - 1; y += 4) kit.box(1.65, 0.4, 1.65, GREEN, x, y, z);
  }
  // the octagonal drum, its round windows, and the tribunes round it to the north, east and south
  kit.add(new THREE.CylinderGeometry(DRUM - 2, DRUM - 2, DRUM_TOP, 8).rotateY(Math.PI / 8), WHITE, 0, DRUM_TOP / 2, 0);
  for (const path of polygon(DRUM, 8, Math.PI / 8)) {
    const len = path.length, m = len / 2;
    wall(kit, path, [[0, 46], [len, 46], [len, DRUM_TOP], [0, DRUM_TOP]], { o0: -2.2, o1: 0, hex: WHITE, ends: false });
    panels(kit, path, 0.6, len - 0.6, 47, DRUM_TOP - 1, 6, 2, 0, false);
    const ring = n => Array.from({ length: 24 }, (_, k) => [m + n * Math.cos((k / 24) * 2 * Math.PI), 58 + n * Math.sin((k / 24) * 2 * Math.PI)]);
    wall(kit, path, ring(4.6), { o0: 0, o1: 0.3, hex: WHITE });
    wall(kit, path, ring(3.3), { o0: 0.3, o1: 0.4, hex: '#33444f' });
    sweep(kit, path, 0, len, [[-0.4, DRUM_TOP - 1.2], [0.8, DRUM_TOP - 1.2], [0.8, DRUM_TOP], [-0.4, DRUM_TOP]], WHITE, { step: len });
  }
  for (const [cx, cz] of [[0, -38], [38, 0], [0, 38]]) {
    const a = Math.atan2(cz, cx), turnIt = (x, z) => [cx + x * Math.cos(a) - z * Math.sin(a), cz + x * Math.sin(a) + z * Math.cos(a)];
    kit.add(new THREE.CylinderGeometry(20, 20, 40, 8).rotateY(Math.PI / 8 - a), WHITE, cx, 20, cz);
    for (const path of polygon(21, 8, Math.PI / 8 + a)) {
      const p0 = path.at(0), p1 = path.at(path.length);
      if (Math.hypot((p0.x + p1.x) / 2 + cx, (p0.z + p1.z) / 2 + cz) < 26) continue; // the sides against the drum
      const shifted = linePath(p0.x + cx, p0.z + cz, p1.x + cx, p1.z + cz), len = shifted.length;
      wall(kit, shifted, [[0, 0], [len, 0], [len, 40], [0, 40]], { holes: [pointedRing(len / 2, 2.6, 13, 26, 1, 6)], o0: -1.2, o1: 0, hex: WHITE, ends: false });
      wall(kit, shifted, pointedRing(len / 2, 2.6, 13, 26, 1, 6), { o0: -1, o1: -0.9, hex: DARK });
      panels(kit, shifted, 0.6, len - 0.6, 1, 39, 2, 5, 0, true);
    }
    kit.add(new THREE.CylinderGeometry(21.6, 21.6, 1.2, 8).rotateY(Math.PI / 8 - a), WHITE, cx, 40.6, cz);
    kit.add(new THREE.ConeGeometry(20.5, 8, 8).rotateY(Math.PI / 8 - a), TILE2, cx, 45.2, cz);
    // the little dome over each tribune
    const [lx, lz] = turnIt(-8, 0);
    kit.add(new THREE.CylinderGeometry(6.5, 6.5, 6, 8), WHITE, lx, 44, lz);
    kit.add(new THREE.SphereGeometry(6.5, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), TILE, lx, 47, lz);
    kit.add(new THREE.CylinderGeometry(0.8, 1, 3, 8), WHITE, lx, 54, lz);
  }
  // the dome: eight red sails between the white ribs, pointed in the quinto acuto, and the lantern
  const prof = [], Rc = 1.6 * DOME_R, cx = DOME_R - Rc, rise = Math.sqrt(Rc * Rc - cx * cx), N = 14;
  for (let k = 0; k <= N; k++) {
    const a = (k / N) * Math.asin(rise / Rc);
    prof.push(new THREE.Vector2(Math.max(0.01, cx + Rc * Math.cos(a)) * (k === N ? 0 : 1) + (k === N ? 4.2 : 0), DRUM_TOP + Rc * Math.sin(a)));
  }
  const top = DRUM_TOP + rise;
  kit.add(new THREE.LatheGeometry(prof, 8).rotateY(Math.PI / 8), TILE);
  for (let k = 0; k < 8; k++) {
    // a rib up each of the lathe's corners, which stand where the drum's do
    const ang = Math.PI / 8 + (k / 8) * 2 * Math.PI, rib = new THREE.Curve();
    rib.getPoint = (t, out = new THREE.Vector3()) => {
      const b = t * Math.asin(rise / Rc), r = Math.max(0, cx + Rc * Math.cos(b)) + 0.2;
      return out.set(r * Math.cos(ang), DRUM_TOP + Rc * Math.sin(b), r * Math.sin(ang));
    };
    kit.add(new THREE.TubeGeometry(rib, 16, 0.9, 4, false), WHITE);
  }
  kit.add(new THREE.CylinderGeometry(5.6, 5.6, 1.4, 8), WHITE, 0, top - 0.6, 0);
  kit.add(new THREE.CylinderGeometry(3.8, 4.4, 9, 8), WHITE, 0, top + 4.4, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    kit.box(1, 7, 2.4, WHITE, 5 * Math.cos(a), top + 3.2, 5 * Math.sin(a), 0, -a); // the lantern's buttresses
  }
  kit.add(new THREE.ConeGeometry(3.6, 8, 8), WHITE, 0, top + 12.9, 0);
  kit.add(new THREE.SphereGeometry(1.4, 12, 10), GOLD, 0, top + 18.2, 0);
  kit.box(0.4, 3, 0.4, GOLD, 0, top + 21, 0).box(1.6, 0.4, 0.4, GOLD, 0, top + 21.6, 0);
  return kit.mesh(kitMat(0.85));
}

// ---- Giotto's Campanile ----
const CX = 235.8, CZ = -297.6, CH = 7.6, CTOP = 102;
const LEVELS = [0, 16, 32, 50, 68, 97];

export function giotto() {
  const kit = new Kit();
  kit.box(2 * CH - 0.6, CTOP, 2 * CH - 0.6, DARK, 0, CTOP / 2, 0); // the inside, dark behind the windows
  square(CH, CH, 0.5).forEach((path, f) => {
    const len = path.length, off = f % 2 ? -0.5 : 0, mid = CH + off;
    for (let l = 0; l + 1 < LEVELS.length; l++) {
      const [y0, y1] = [LEVELS[l], LEVELS[l + 1]], holes = [];
      if (l === 2 || l === 3) for (const k of [-1, 1]) holes.push(pointedRing(mid + k * 2.6, 3.4, y0 + 4, y1 - 2.4, 1, 7));
      if (l === 4) holes.push(pointedRing(mid, 7.2, y0 + 4, y1 - 4, 1, 9));
      wall(kit, path, [[0, y0], [len, y0], [len, y1], [0, y1]], { holes, o0: -0.5, o1: 0, hex: WHITE });
      for (const ring of holes) wall(kit, path, ring, { o0: -0.45, o1: -0.35, hex: DARK });
      if (l === 4) for (const d of [-1.2, 1.2]) wall(kit, path, [[mid + d - 0.15, y0 + 4], [mid + d + 0.15, y0 + 4], [mid + d + 0.15, y1 - 8], [mid + d - 0.15, y1 - 8]], { o0: -0.45, o1: 0, hex: WHITE });
      if (l === 2 || l === 3) for (const k of [-1, 1]) wall(kit, path, [[mid + k * 2.6 - 0.12, y0 + 4], [mid + k * 2.6 + 0.12, y0 + 4], [mid + k * 2.6 + 0.12, y1 - 5], [mid + k * 2.6 - 0.12, y1 - 5]], { o0: -0.45, o1: 0, hex: WHITE });
      if (l < 2) {
        panels(kit, path, 1.6, len - 1.6, y0 + 1, y1 - 1, l === 0 ? 4 : 5, 2);
        if (l === 0) for (let k = 0; k < 4; k++) { // the reliefs in their hexagons
          const s = 1.6 + (k + 0.5) * ((len - 3.2) / 4), y = y0 + 11, hex = Array.from({ length: 6 }, (_, q) => [s + 1.1 * Math.cos((q / 6) * 2 * Math.PI), y + 1.1 * Math.sin((q / 6) * 2 * Math.PI)]);
          wall(kit, path, hex, { o0: 0, o1: 0.15, hex: '#c9c2b0' });
        }
      } else if (l < 4) {
        panels(kit, path, 1.6, mid - 4.9, y0 + 1, y1 - 1, 1, 3, 0, false);
        panels(kit, path, mid + 4.9, len - 1.6, y0 + 1, y1 - 1, 1, 3, 0, false);
      } else {
        panels(kit, path, 1.6, mid - 4.4, y0 + 1, y1 - 1, 1, 5, 0, false);
        panels(kit, path, mid + 4.4, len - 1.6, y0 + 1, y1 - 1, 1, 5, 0, false);
      }
      sweep(kit, path, 0, len, [[-0.1, y1 - 0.6], [0.35, y1 - 0.6], [0.35, y1], [-0.1, y1]], GREEN, { step: len });
    }
  });
  // the corner piers, panelled, and the cornice on its brackets, and its parapet
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    kit.add(new THREE.CylinderGeometry(0.95, 0.95, LEVELS[5], 8), WHITE, sx * (CH - 0.2), LEVELS[5] / 2, sz * (CH - 0.2));
    for (const y of LEVELS.slice(1, 5)) kit.add(new THREE.CylinderGeometry(1, 1, 0.6, 8), GREEN, sx * (CH - 0.2), y - 0.3, sz * (CH - 0.2));
  }
  kit.box(2 * CH + 2.4, 1.6, 2 * CH + 2.4, WHITE, 0, LEVELS[5] + 0.8, 0);
  square(CH + 1.2).forEach(path => {
    for (let k = 0; k <= 12; k++) {
      const p = path.at((k / 12) * path.length);
      kit.box(0.5, 1.2, 0.5, PINK, p.x - 0.3 * p.tz, LEVELS[5] - 0.6, p.z + 0.3 * p.tx);
    }
    const len = path.length;
    wall(kit, path, [[0, LEVELS[5] + 1.6], [len, LEVELS[5] + 1.6], [len, CTOP + 1.8], [0, CTOP + 1.8]], { holes: Array.from({ length: 10 }, (_, k) => archRing((k + 0.5) * (len / 10), 1, LEVELS[5] + 2.4, CTOP + 1, 5)), o0: -0.5, o1: 0, hex: WHITE });
  });
  return kit.mesh(kitMat(0.85));
}

// ---- the Baptistery ----
const BX = 171.1, BZ = -338.8, BR = 22.6, BTOP = 26.4;

export function battistero() {
  const kit = new Kit(), start = Math.PI / 8;
  kit.add(new THREE.CylinderGeometry(BR - 1.6, BR - 1.6, BTOP, 8).rotateY(Math.PI / 2 - start), WHITE, 0, BTOP / 2, 0);
  polygon(BR, 8, start).forEach((path, k) => {
    const len = path.length, m = len / 2, n = path.at(m), out = Math.atan2(n.x, n.z);
    const east = Math.abs(Math.sin(out) - 1) < 0.1, door = east || Math.abs(Math.cos(out)) > 0.95;
    // the ground storey: pilasters and panels, and the doors on three sides
    wall(kit, path, [[0, 0], [len, 0], [len, BTOP], [0, BTOP]], { o0: -1.6, o1: 0, hex: WHITE, ends: false });
    for (const s of [0.6, m, len - 0.6]) wall(kit, path, [[s - 0.5, 0.8], [s + 0.5, 0.8], [s + 0.5, 10.6], [s - 0.5, 10.6]], { o0: 0, o1: 0.4, hex: GREEN });
    if (door && !(Math.abs(Math.sin(out) + 1) < 0.1)) {
      wall(kit, path, [[m - 2.8, 0.4], [m + 2.8, 0.4], [m + 2.8, 8], [m - 2.8, 8]], { o0: 0, o1: 0.3, hex: east ? GOLD : '#7a6234' });
      for (let q = 0; q < 5; q++) wall(kit, path, [[m - 2.6, 0.8 + q * 1.45], [m + 2.6, 0.8 + q * 1.45], [m + 2.6, 0.95 + q * 1.45], [m - 2.6, 0.95 + q * 1.45]], { o0: 0.3, o1: 0.35, hex: shade(GOLD, -0.3) });
      wall(kit, path, [[m - 3.4, 8], [m + 3.4, 8], [m + 3.4, 9], [m - 3.4, 9]], { o0: 0, o1: 0.5, hex: WHITE });
    } else {
      panels(kit, path, 1.2, m - 0.6, 1, 10.4, 1, 2, 0, false);
      panels(kit, path, m + 0.6, len - 1.2, 1, 10.4, 1, 2, 0, false);
    }
    // the middle storey: three blind arches with windows, and the attic of panels
    sweep(kit, path, 0, len, [[-0.1, 11], [0.6, 11], [0.6, 11.6], [-0.1, 11.6]], WHITE, { step: len });
    for (let a = 0; a < 3; a++) {
      const s = (a + 0.5) * (len / 3);
      const outer = archRing(s, len / 3 - 0.9, 11.8, 21).slice(2), inner = archRing(s, len / 3 - 2, 11.8, 20.2).slice(2);
      wall(kit, path, [...outer, ...inner.reverse()], { o0: 0, o1: 0.3, hex: GREEN });
      wall(kit, path, [[s - 0.9, 14], [s + 0.9, 14], [s + 0.9, 17.4], [s, 18.4], [s - 0.9, 17.4]], { o0: 0, o1: 0.1, hex: DARK });
    }
    for (const s of [0.4, len / 3, (2 * len) / 3, len - 0.4]) wall(kit, path, [[s - 0.35, 11.6], [s + 0.35, 11.6], [s + 0.35, 20.6], [s - 0.35, 20.6]], { o0: 0, o1: 0.4, hex: GREEN });
    sweep(kit, path, 0, len, [[-0.1, 21.2], [0.6, 21.2], [0.6, 21.8], [-0.1, 21.8]], WHITE, { step: len });
    panels(kit, path, 0.4, len - 0.4, 22, BTOP - 0.4, 6, 1, 0, false);
    void k;
  });
  // the roof, the lantern, and the scarsella to the west
  kit.add(new THREE.CylinderGeometry(BR + 0.6, BR + 0.6, 0.8, 8).rotateY(Math.PI / 2 - start), WHITE, 0, BTOP + 0.4, 0);
  kit.add(new THREE.ConeGeometry(BR, 7.2, 8).rotateY(Math.PI / 2 - start), '#e4dfd2', 0, BTOP + 4.4, 0);
  kit.add(new THREE.CylinderGeometry(3.2, 3.2, 6, 8), WHITE, 0, BTOP + 10, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    kit.box(0.5, 4.8, 0.5, GREEN, 3.25 * Math.cos(a), BTOP + 10, 3.25 * Math.sin(a));
  }
  kit.add(new THREE.ConeGeometry(3.6, 3.4, 8), WHITE, 0, BTOP + 14.7, 0);
  kit.add(new THREE.SphereGeometry(0.7, 10, 8), GOLD, 0, BTOP + 16.8, 0);
  kit.box(10.4, 17.6, 16.4, WHITE, -(BR - 1) - 4.7, 8.8, 0);
  const sp = linePath(-(BR - 1) - 9.9, 8.2, -(BR - 1) - 9.9, -8.2);
  panels(kit, sp, 0.6, 15.8, 1, 16.6, 4, 3);
  gable(kit, -(BR - 1) - 9.9, -(BR - 1) + 0.5, 8.6, 17.6, 20.2, '#e4dfd2');
  return kit.mesh(kitMat(0.85));
}

const octagon = (x, z, r, n = 16) => onMap(x, z, TURN, Array.from({ length: n }, (_, k) => [r * Math.cos((k / n) * 2 * Math.PI), r * Math.sin((k / n) * 2 * Math.PI)]));
// The cathedral stands in for the nave's, the tribunes' and the dome's pieces, the campanile for its
// floating top, the baptistery for its octagon, its lantern's bits and the scarsella
export const DUOMO = [
  {
    id: 'santa-maria-del-fiore', name: 'Santa Maria del Fiore', x: DX, z: DZ, turn: TURN, reach: 260,
    area: [onMap(DX, DZ, TURN, rect(FRONT - 1.5, -HW - 2, NAVE, HW + 2)), octagon(DX, DZ, 66)],
    foot: [onMap(DX, DZ, TURN, rect(FRONT, -HW, NAVE, HW)), octagon(DX, DZ, 58, 24)],
    make: duomo,
  },
  {
    id: 'campanile-di-giotto', name: 'Campanile di Giotto', x: CX, z: CZ, turn: TURN, reach: 200,
    area: [onMap(CX, CZ, TURN, rect(-CH - 2, -CH - 2, CH + 2, CH + 2))], foot: [onMap(CX, CZ, TURN, rect(-CH - 0.7, -CH - 0.7, CH + 0.7, CH + 0.7))],
    make: giotto,
  },
  {
    id: 'battistero-di-san-giovanni', name: 'Battistero di San Giovanni', x: BX, z: BZ, turn: TURN, reach: 140,
    area: [octagon(BX, BZ, BR + 2), onMap(BX, BZ, TURN, rect(-BR - 12, -9.5, -BR + 2, 9.5))],
    foot: [octagon(BX, BZ, BR + 0.4), onMap(BX, BZ, TURN, rect(-BR - 9.9, -8.2, -BR + 2, 8.2))],
    make: battistero,
  },
];
