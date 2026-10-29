// The Basilica di Santa Croce (1294-1385, its front 1857-63, its bell tower 1842-65) on Piazza
// Santa Croce, modelled by hand in place of the map's pieces of it, from its measurements and photos,
// in game metres (the real ones times 1.25), on the map's outline: a nave and two aisles of seven
// bays, 115 m from the front to the end of the main chapel, the transept 74 m across:
//   the front of white marble with green and pink, three portals under their pointed gables, the
//     rose window, the tall middle part with its gable and the Star of David in it, the sides'
//     sloping tops and the four buttresses with their pinnacles
//   the sides of rough pietra forte, a tall pointed window to each bay between buttresses, the
//     nave's walls over the aisles, the roofs of red tiles
//   the transept, its gable ends, and the polygonal main chapel behind it
//   the bell tower behind the transept, Gothic like the front, its belfry and spire
//   Dante on his plinth beside the steps, left of the front
// It stands on its own, so riders bump into it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, square, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { MARBLE, VERDE, ROSA, GLASS, TILE, sides, panel, inlay, lancet, oculus, prism, shell, gable } from './marble.js';

const X = 959, Z = 315.7, TURN = -0.512; // the outline's middle, and the nave turned from east (local +x, to the chapel)
const VC = 4.85, TC = 0; // the nave's axis and the transept's middle (local z), as the map has them
const FRONT = -74.8, NAVE = [-72.3, 40.5], TRANS = [40.5, 67], APSE = 76;
const HW = 24.5, NW = 14, TW = 43; // the half widths: the aisles', the nave's, the transept's
const AISLE = 21, WALL = 31, RIDGE = 38.5; // the aisles' walls, the nave's and the transept's, the ridges
const FMID = 47.5, FTOP = 53, FSIDE = 27; // the front's middle, its gable's point, its sides
const TOWER = [69.7, 36.5], TH = 3.8, BELL = [60, 74], SPIRE = 97.5; // the bell tower
const PIETRA = '#a18a6a', DARK = '#87725a', STONE = shade(MARBLE, -0.06);

// the map's outline, in the model's metres
const FOOT = [[-72, -20.9], [40.6, -20.5], [40.7, -32.9], [53.2, -32.7], [53.1, -42.8], [67, -43.2], [67.1, 0.5], [69.6, 1], [72.1, 2.1], [74.8, 5.1], [75.8, 7.9], [75.6, 11.3], [74.9, 13.3], [72.4, 16.1], [69.4, 17.5], [66.4, 17.7], [65.8, 43.2], [40.2, 43], [40.3, 30], [-72.4, 29.4], [-72.4, 30.7], [-75.7, 30.7], [-75.5, -21.4], [-72, -21.4]];

// a side wall from s0 to s1 along the path: rough stone, a tall window to each bay, buttresses
function flank(kit, path, s0, s1, y1, bays, { windows = true } = {}) {
  const len = s1 - s0, step = len / bays;
  wall(kit, path, [[s0, 0], [s1, 0], [s1, y1], [s0, y1]], { o0: -1.4, o1: 0, hex: PIETRA });
  for (let y = 1.6; y < y1; y += 1.6) panel(kit, path, s0, s1, y - 0.06, y + 0.06, DARK, 0, 0.05);
  for (let k = 0; k < bays; k++) {
    const c = s0 + (k + 0.5) * step;
    if (windows) lancet(kit, path, c, Math.min(2.6, step * 0.22), y1 * 0.35, y1 - 2.6, { frame: shade(PIETRA, 0.12), rim: 0.45, r: 0.9 });
  }
  for (let k = 0; k <= bays; k++) {
    const s = Math.min(s1 - 0.8, Math.max(s0 + 0.8, s0 + k * step)), p = path.at(s);
    kit.box(1.6, y1 - 2, 1.4, DARK, p.x + 0.7 * p.tz, (y1 - 2) / 2, p.z - 0.7 * p.tx, 0, Math.atan2(-p.tz, p.tx));
  }
  panel(kit, path, s0, s1, y1 - 0.8, y1, DARK, 0, 0.5);
}

export function croce() {
  const kit = new Kit();
  prism(kit, FOOT, 0, 0.6, shade(PIETRA, -0.1));
  const [n0, n1] = NAVE, [t0, t1] = TRANS;
  // the aisles' outer walls, seven bays each, and the nave's walls over them
  for (const side of [-1, 1]) {
    const v = VC + side * HW, path = side < 0 ? linePath(n0, v, n1, v) : linePath(n1, v, n0, v);
    flank(kit, path, 0, path.length, AISLE, 7);
    const nv = VC + side * NW, up = side < 0 ? linePath(n0, nv, t0, nv) : linePath(t0, nv, n0, nv);
    wall(kit, up, [[0, AISLE], [up.length, AISLE], [up.length, WALL], [0, WALL]], { o0: -1.2, o1: 0, hex: PIETRA });
    for (let k = 0; k < 7; k++) oculus(kit, up, (k + 0.5) * (up.length / 7), (AISLE + WALL) / 2 + 2, 1.4, { frame: shade(PIETRA, 0.12), rim: 0.4 });
    panel(kit, up, 0, up.length, WALL - 0.8, WALL, DARK, 0, 0.5);
    // the aisle's roof sloping up to the nave's wall
    const lean = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(HW - NW + 0.6, 0), new THREE.Vector2(0, (HW - NW) * 0.36)]);
    const geo = new THREE.ExtrudeGeometry(lean, { depth: t0 - n0, bevelEnabled: false }).rotateY(-Math.PI / 2); // shape x across, extruded along -u
    if (side < 0) geo.scale(1, 1, -1);
    kit.add(geo, TILE, t0, AISLE, nv);
  }
  gable(kit, (n0 + t0) / 2, WALL, VC, t0 - n0, 2 * NW + 1.4, RIDGE - WALL, TILE);
  // the transept: its long walls, its gable ends north and south, its roof across the nave
  for (const side of [-1, 1]) {
    const v = TC + side * TW;
    const end = side < 0 ? linePath(t0, v, t1, v) : linePath(t1, v, t0, v);
    flank(kit, end, 0, end.length, WALL, 2);
    const len = end.length;
    wall(kit, end, [[0, WALL], [len, WALL], [len / 2, RIDGE + 0.6]], { o0: -1.4, o1: 0, hex: PIETRA });
    oculus(kit, end, len / 2, WALL + 2.6, 1.8, { frame: shade(PIETRA, 0.12), rim: 0.5 });
    const u0 = side < 0 ? linePath(t0, VC + side * HW, t0, v) : linePath(t0, v, t0, VC + side * HW); // the transept's west wall beside the aisle
    flank(kit, u0, 0, u0.length, WALL, 1, { windows: false });
    const u1 = side < 0 ? linePath(t1, v, t1, VC - 9) : linePath(t1, VC + 9, t1, v); // its east wall, the chapels behind it
    flank(kit, u1, 0, u1.length, WALL, 5);
  }
  gable(kit, (t0 + t1) / 2, WALL, TC, 2 * TW + 1.4, t1 - t0 + 1.4, RIDGE - WALL, TILE, Math.PI / 2);
  // the main chapel: five sides of an octagon behind the transept
  const R = 9.6, apse = Array.from({ length: 6 }, (_, k) => {
    const a = -Math.PI / 2 + (k / 5) * Math.PI;
    return [t1 + R * 0.95 * Math.cos(a) * (k === 0 || k === 5 ? 0 : 1), VC + R * Math.sin(a)];
  });
  for (const path of sides(apse).slice(0, 5)) flank(kit, path, 0, path.length, WALL - 2, 1);
  shell(kit, [[R * 0.95, WALL - 2], [0, RIDGE - 2]], TILE, { cx: t1, cz: VC, n: 10, start: 0 });
  front(kit);
  tower(kit);
  // Dante on his plinth, left of the steps
  const dv = VC - HW - 4; // (as DANTE below)
  kit.box(4.4, 0.6, 4.4, STONE, FRONT - 6, 0.3, dv).box(3, 5.4, 3, MARBLE, FRONT - 6, 3.3, dv).box(3.6, 0.6, 3.6, STONE, FRONT - 6, 6.3, dv);
  kit.add(new THREE.CylinderGeometry(0.7, 1.1, 4.2, 8), MARBLE, FRONT - 6, 8.7, dv);
  kit.add(new THREE.SphereGeometry(0.5, 8, 6), MARBLE, FRONT - 6, 11.2, dv);
  for (const [dx, dz] of [[-2.6, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6]]) kit.add(new THREE.SphereGeometry(0.9, 8, 6), MARBLE, FRONT - 6 + dx, 1.3, dv + dz); // the lions round it
  return kit.mesh(kitMat(0.88));
}

// the 19th-century front, facing west (local -x), s from south (+z) to north
function front(kit) {
  const v0 = -21.4, v1 = 30.7, path = linePath(FRONT, v1, FRONT, v0), len = path.length;
  const C = v1 - VC, M = 10.9; // the middle's centre along the path, its half width
  const outline = [[0, 0], [len, 0], [len, FSIDE], [C + M + 1, FSIDE + 11], [C + M, FMID], [C, FTOP], [C - M, FMID], [C - M - 1, FSIDE + 11], [0, FSIDE]];
  wall(kit, path, outline, { o0: -2.4, o1: 0, hex: MARBLE });
  // the panels: green frames below, pink and green above
  inlay(kit, path, 1, C - M - 1.6, 1, FSIDE - 1, { cols: 2, rows: 3, w: 0.5 });
  inlay(kit, path, C + M + 1.6, len - 1, 1, FSIDE - 1, { cols: 2, rows: 3, w: 0.5 });
  inlay(kit, path, C - M + 1, C + M - 1, 18, FMID - 2, { cols: 4, rows: 4, w: 0.45, hex: ROSA });
  for (const y of [FSIDE - 0.6, 17]) panel(kit, path, 0, len, y - 0.5, y + 0.4, VERDE, 0, 0.4);
  // the three portals under their pointed gables, with their lunettes
  for (const [c, w, h] of [[C, 6.6, 13.4], [C - 15.6, 4.2, 9.6], [C + 15.6, 4.2, 9.6]]) {
    lancet(kit, path, c, w + 3.4, 0.6, h + 2.8, { frame: VERDE, glass: MARBLE, rim: 0.5, r: 0.8, o: 0.1 });
    lancet(kit, path, c, w, 0.6, h, { frame: ROSA, glass: '#3e3426', rim: 0.45, r: 0.8, o: 0.3 });
    lancet(kit, path, c, w * 0.75, h - w * 0.55, h - 0.6, { frame: '#c9a64a', glass: '#4a6fa0', rim: 0.15, r: 0.8, o: 0.55 });
    wall(kit, path, [[c - w / 2 - 2.6, h + 1.8], [c + w / 2 + 2.6, h + 1.8], [c, h + 1.8 + w * 0.9]], { o0: 0.1, o1: 0.6, hex: STONE }); // the gable over it
  }
  // the rose window, the gable's Star of David, the side parts' little roses
  oculus(kit, path, C, 30.5, 4.6, { frame: VERDE, rim: 1.2, o: 0.1 });
  oculus(kit, path, C, 30.5, 3, { frame: ROSA, glass: '#5c4a6a', rim: 0.5, o: 0.35 });
  oculus(kit, path, C, FMID + 1.8, 2.2, { frame: '#c9a64a', glass: '#2f4f8f', rim: 0.4, o: 0.1 });
  for (const k of [0, 1]) {
    const pts = Array.from({ length: 3 }, (_, j) => { const a = Math.PI / 2 + k * Math.PI + (j / 3) * 2 * Math.PI; return [C + 1.6 * Math.cos(a), FMID + 1.8 + 1.6 * Math.sin(a)]; });
    wall(kit, path, pts, { o0: 0.3, o1: 0.4, hex: '#d8b84a' });
  }
  for (const s of [C - 15.6, C + 15.6]) oculus(kit, path, s, FSIDE - 6, 1.6, { frame: ROSA, rim: 0.5, o: 0.1 });
  // the edges of the sloping tops and the gable, and the four buttresses with their pinnacles
  for (const [a, b] of [[[0, FSIDE], [C - M - 1, FSIDE + 11]], [[len, FSIDE], [C + M + 1, FSIDE + 11]], [[C - M, FMID], [C, FTOP]], [[C + M, FMID], [C, FTOP]]]) {
    const p = path.at(a[0]), q = path.at(b[0]);
    kit.rod([p.x - 0.4, a[1], p.z], [q.x - 0.4, b[1], q.z], 0.45, STONE, 4);
  }
  for (const [s, h] of [[0.9, FSIDE + 1.6], [C - M - 0.4, 43.8], [C + M + 0.4, 43.8], [len - 0.9, FSIDE + 1.6]]) {
    const p = path.at(s), x = p.x - 0.9;
    kit.box(2.2, h, 2.2, MARBLE, x, h / 2, p.z);
    for (let y = 5; y < h - 2; y += 6) kit.box(2.3, 0.5, 2.3, VERDE, x, y, p.z);
    kit.add(new THREE.ConeGeometry(1.5, 5.6, 4).rotateY(Math.PI / 4), MARBLE, x, h + 2.8, p.z);
  }
  // the steps of the parvis
  for (let k = 0; k < 3; k++) kit.box(3 - k, 0.3 * (k + 1), len + 2, shade(MARBLE, -0.1), FRONT - 1.5 + k / 2, 0.15 * (k + 1), (v0 + v1) / 2);
  kit.box(0.3, 2.8, 0.3, MARBLE, FRONT - 0.3, FTOP + 1.4, VC).box(0.3, 0.3, 1.6, MARBLE, FRONT - 0.3, FTOP + 2, VC);
}

// the bell tower: a shaft of pietra forte with white corners, the belfry with its two-light openings,
// the gabled top and the octagonal spire
function tower(kit) {
  const [tu, tv] = TOWER;
  kit.box(2 * TH, BELL[0], 2 * TH, PIETRA, tu, BELL[0] / 2, tv);
  square(TH, TH, 0).forEach(sq => {
    const path = linePath(sq.at(0).x + tu, sq.at(0).z + tv, sq.at(sq.length).x + tu, sq.at(sq.length).z + tv), len = path.length;
    for (let y = 8; y < BELL[0]; y += 13) {
      panel(kit, path, 0, len, y, y + 0.6, MARBLE, 0, 0.3);
      lancet(kit, path, len / 2, 1, y + 4, y + 8.5, { frame: MARBLE, rim: 0.3, r: 0.9 });
    }
    wall(kit, path, [[0, BELL[0]], [len, BELL[0]], [len, BELL[1]], [0, BELL[1]]], { o0: -0.8, o1: 0, hex: MARBLE });
    lancet(kit, path, len / 2, 4.2, BELL[0] + 2, BELL[1] - 2.4, { frame: VERDE, glass: GLASS, rim: 0.45, r: 0.85 });
    panel(kit, path, len / 2 - 0.15, len / 2 + 0.15, BELL[0] + 2, BELL[1] - 4.6, MARBLE, 0.2, 0.15);
    wall(kit, path, [[-0.4, BELL[1]], [len + 0.4, BELL[1]], [len / 2, BELL[1] + 5]], { o0: -0.4, o1: 0.2, hex: MARBLE }); // its gable
  });
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    kit.box(1.1, BELL[1] + 1, 1.1, MARBLE, tu + x * TH, (BELL[1] + 1) / 2, tv + z * TH);
    kit.add(new THREE.ConeGeometry(0.75, 4.2, 4).rotateY(Math.PI / 4), MARBLE, tu + x * TH, BELL[1] + 3.1, tv + z * TH);
  }
  shell(kit, [[TH - 0.3, BELL[1]], [TH - 0.3, BELL[1] + 3.4], [0, SPIRE]], shade(PIETRA, -0.05), { cx: tu, cz: tv });
}

// it stands in for the map's pieces of the church and of its bell tower (area), and riders bump
// into its outline and the tower's square (foot)
const DANTE = onMap(X, Z, TURN, rect(FRONT - 8.4, VC - HW - 6.4, FRONT - 3.6, VC - HW - 1.6));
const RING = onMap(X, Z, TURN, FOOT), TOWER_FOOT = onMap(X, Z, TURN, rect(TOWER[0] - TH - 0.6, TOWER[1] - TH - 0.6, TOWER[0] + TH + 0.6, TOWER[1] + TH + 0.6));
export const SANTA_CROCE = [{
  id: 'santa-croce', name: 'Basilica di Santa Croce', x: X, z: Z, turn: TURN, reach: 170, area: [RING, TOWER_FOOT], foot: [RING, TOWER_FOOT, DANTE],
  make: croce,
}];
