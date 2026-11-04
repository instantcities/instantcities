// The Basilica di Santa Maria Novella (1279-1360, its front by Alberti 1458-70) on Piazza Santa
// Maria Novella, modelled by hand in place of the map's block of it, from its measurements and
// photos, in game metres (the real ones times 1.25), on the map's outline: the nave and its aisles
// running north from the piazza, the transept, the chapels behind it and the bell tower in the
// corner of the west arm:
//   Alberti's front of white and green marble: the Gothic tomb niches along its foot, the side doors
//     under their pointed arches, the round-arched middle portal between its columns, the striped
//     corner columns, the band of inlaid squares, the upper storey with its rose window between
//     pilasters, the pediment with the sun in it, and the great scrolls with their discs either side
//   the plain walls of the church behind it, a tall pointed window to each bay, the roofs of red tiles
//   the bell tower, Romanesque, of stone with white corners, its two-light openings and its spire
// It stands on its own, so riders bump into it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, archRing, onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { MARBLE, VERDE, GLASS, TILE, sides, panel, inlay, lancet, oculus, prism, gable } from './marble.js';

const X = -395.4, Z = -550, TURN = 1.542; // the outline's middle, and the nave turned from east (local +x, northwards from the front)
const FRONT = -64.1, VC = -5.05, HW = 20.75; // the front, the nave's axis, its half width with the aisles
const NW = 9.5; // the nave's half width over the aisles
const TRANS = [10, 40], TW = 38.3, CHOIR = [40, 64.1, -14.5, 23.5]; // the transept, its half width, the chapels behind it
const AISLE = 19, WALL = 30, RIDGE = 37.5; // the aisles' walls, the nave's, the ridges
const LOW = 20, BAND = 25.5, UPPER = 40, TOP = 48; // the front's lower storey, its band, its upper storey, the pediment's point
const MID = 11.2; // the half width of the front's upper storey
const TOWER = [35.7, -33.7], TH = 4.1, BELL = [52, 63], SPIRE = 78;
const STONE = '#b29c7c', DARK = shade(STONE, -0.15), WHITE = shade(MARBLE, -0.03);

// the map's outline, in the model's metres
const FOOT = [[57.7, -14.4], [49.3, -14.4], [49.4, -22.5], [49.7, -31.6], [39.9, -32], [39.9, -29.7], [31.4, -29.9], [31.6, -37.8], [10.2, -38.3], [9.7, -23.9], [-62.4, -26], [-64.1, -25.8], [-64, -5.3], [-64, 15.7], [-16.8, 15.9], [17.6, 15.9], [18.4, 38.3], [44.4, 32.7], [45, 23.6], [58.2, 23.5], [58.1, 6.5], [64.1, 6.1], [64.1, -14.5]];

// a plain wall along the path: its stone, tall windows to `bays` bays, its cornice
function flank(kit, path, y1, bays, windows = true) {
  const len = path.length, step = len / bays;
  wall(kit, path, [[0, 0], [len, 0], [len, y1], [0, y1]], { o0: -1.2, o1: 0, hex: STONE });
  if (windows) for (let k = 0; k < bays; k++) lancet(kit, path, (k + 0.5) * step, Math.min(2.4, step * 0.24), y1 * 0.4, y1 - 2.4, { frame: WHITE, rim: 0.4, r: 0.9 });
  for (let k = 0; k <= bays; k++) panel(kit, path, Math.max(0, k * step - 0.7), Math.min(len, k * step + 0.7), 0, y1 - 1, DARK, 0, 0.7);
  panel(kit, path, 0, len, y1 - 0.8, y1, WHITE, 0, 0.45);
}

export function novella() {
  const kit = new Kit();
  prism(kit, FOOT, 0, 0.5, shade(STONE, -0.1));
  const [t0, t1] = TRANS;
  // the aisles, the nave's walls over them, the roofs
  for (const side of [-1, 1]) {
    const v = VC + side * HW, path = side < 0 ? linePath(FRONT, v, t0, v) : linePath(t0, v, FRONT, v);
    flank(kit, path, AISLE, 6);
    const nv = VC + side * NW, up = side < 0 ? linePath(FRONT + 2, nv, t0, nv) : linePath(t0, nv, FRONT + 2, nv);
    wall(kit, up, [[0, AISLE], [up.length, AISLE], [up.length, WALL], [0, WALL]], { o0: -1, o1: 0, hex: STONE });
    for (let k = 0; k < 6; k++) oculus(kit, up, (k + 0.5) * (up.length / 6), (AISLE + WALL) / 2 + 1.5, 1.5, { frame: WHITE, rim: 0.4 });
    panel(kit, up, 0, up.length, WALL - 0.8, WALL, WHITE, 0, 0.45);
    const lean = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(HW - NW + 0.5, 0), new THREE.Vector2(0, (HW - NW) * 0.38)]);
    const geo = new THREE.ExtrudeGeometry(lean, { depth: t0 - FRONT - 2, bevelEnabled: false }).rotateY(-Math.PI / 2); // shape x across, extruded along -u
    if (side < 0) geo.scale(1, 1, -1);
    kit.add(geo, TILE, t0, AISLE, nv);
  }
  gable(kit, (FRONT + 2 + t0) / 2, WALL, VC, t0 - FRONT - 2, 2 * NW + 1.2, RIDGE - WALL, TILE);
  // the transept and the chapels behind it
  for (const path of sides([[t0, -TW], [t1, -TW], [t1, TW], [t0, TW]])) flank(kit, path, WALL, Math.max(1, Math.round(path.length / 11)));
  gable(kit, (t0 + t1) / 2, WALL, 0, 2 * TW + 1.2, t1 - t0 + 1.2, RIDGE - WALL, TILE, Math.PI / 2);
  for (const side of [-1, 1]) {
    const end = side < 0 ? linePath(t0, -TW, t1, -TW) : linePath(t1, TW, t0, TW), len = end.length;
    wall(kit, end, [[0, WALL], [len, WALL], [len / 2, RIDGE + 0.6]], { o0: -1.2, o1: 0, hex: STONE });
    oculus(kit, end, len / 2, WALL + 2.4, 1.6, { frame: WHITE, rim: 0.4 });
  }
  const [c0, c1, w0, w1] = CHOIR;
  for (const path of sides([[c0, w0], [c1, w0], [c1, w1], [c0, w1]]).slice(0, 3)) flank(kit, path, WALL - 4, Math.max(1, Math.round(path.length / 9)));
  gable(kit, (c0 + c1) / 2, WALL - 4, (w0 + w1) / 2, c1 - c0 + 1, w1 - w0 + 1, 6, TILE);
  front(kit);
  tower(kit);
  return kit.mesh(kitMat(0.88));
}

// Alberti's front, facing south (local -x), s from east (+z) to west
function front(kit) {
  const v0 = VC - HW, v1 = VC + HW, path = linePath(FRONT, v1, FRONT, v0), len = path.length, C = len / 2;
  // the wall: the lower storey the whole width, the upper storey and the pediment over the middle
  wall(kit, path, [[0, 0], [len, 0], [len, BAND], [C + MID, BAND], [C + MID, UPPER], [C, TOP], [C - MID, UPPER], [C - MID, BAND], [0, BAND]], { o0: -2.4, o1: 0, hex: WHITE });
  // the lower storey: the tomb niches along the foot, the side doors, the middle portal
  for (let k = 0; k < 8; k++) {
    const sk = 2.6 + k * ((len - 5.2) / 7);
    if (Math.abs(sk - C) < 6) continue;
    lancet(kit, path, sk, 2.2, 0.6, 5.2, { frame: VERDE, glass: shade(MARBLE, -0.14), rim: 0.4, r: 0.85, o: 0.1 });
  }
  for (const s of [C - 11.5, C + 11.5]) lancet(kit, path, s, 3.2, 0.6, 9.5, { frame: VERDE, glass: '#3e3426', rim: 0.5, r: 0.85, o: 0.1 });
  inlay(kit, path, 3, C - 6.5, 6.4, LOW - 1, { cols: 3, rows: 2, w: 0.5 });
  inlay(kit, path, C + 6.5, len - 3, 6.4, LOW - 1, { cols: 3, rows: 2, w: 0.5 });
  panel(kit, path, C - 5, C + 5, 0, 14.6, shade(MARBLE, -0.08), 0.1, 0.3);
  wall(kit, path, archRing(C, 5.6, 0.6, 13, 12), { o0: 0.4, o1: 0.55, hex: '#3e3426' });
  wall(kit, path, [...archRing(C, 7.6, 0.6, 14.4, 12).slice(2), ...archRing(C, 5.6, 0.6, 13, 12).slice(2).reverse()], { o0: 0.4, o1: 0.7, hex: VERDE });
  // the striped columns: two at the corners, two by the portal
  for (const s of [1.2, C - 6.2, C + 6.2, len - 1.2]) {
    const p = path.at(s);
    for (let y = 0; y < LOW - 1.2; y += 1.4) kit.add(new THREE.CylinderGeometry(0.85, 0.85, 0.7, 10), VERDE, p.x - 0.7, y + 0.35, p.z).add(new THREE.CylinderGeometry(0.85, 0.85, 0.7, 10), WHITE, p.x - 0.7, y + 1.05, p.z);
    kit.box(2.2, 1.2, 2.2, WHITE, p.x - 0.7, LOW - 0.6, p.z);
  }
  // the entablature, and the band of inlaid squares over it
  panel(kit, path, 0, len, LOW, LOW + 1.2, WHITE, 0, 0.9);
  panel(kit, path, 0, len, LOW + 1.2, BAND - 0.6, shade(MARBLE, -0.05), 0, 0.3);
  for (let s = 1.4; s < len - 1.4; s += 2.4) {
    panel(kit, path, s, s + 1.6, LOW + 1.8, BAND - 1.4, VERDE, 0.3, 0.08);
    panel(kit, path, s + 0.4, s + 1.2, LOW + 2.4, BAND - 2, WHITE, 0.38, 0.06);
  }
  panel(kit, path, 0, len, BAND - 0.6, BAND, WHITE, 0, 0.7);
  // the upper storey: pilasters, the panels between them, the rose window, the frieze
  for (const s of [C - MID + 0.8, C - MID / 2.4, C + MID / 2.4, C + MID - 0.8]) panel(kit, path, s - 0.8, s + 0.8, BAND, UPPER - 1, VERDE, 0, 0.5);
  inlay(kit, path, C - MID + 1.6, C + MID - 1.6, BAND + 1, UPPER - 1.6, { cols: 4, rows: 3, w: 0.35 });
  oculus(kit, path, C, (BAND + UPPER) / 2 + 0.4, 3.4, { frame: VERDE, rim: 1, o: 0.2 });
  oculus(kit, path, C, (BAND + UPPER) / 2 + 0.4, 2.3, { frame: '#b8423a', glass: '#4a6fa0', rim: 0.4, o: 0.45 });
  panel(kit, path, C - MID - 0.3, C + MID + 0.3, UPPER - 1, UPPER + 0.3, WHITE, 0, 0.8);
  // the pediment: its edges, the sun in it
  for (const d of [-1, 1]) {
    const p = path.at(C + d * (MID + 0.3)), q = path.at(C);
    kit.rod([p.x - 0.5, UPPER + 0.2, p.z], [q.x - 0.5, TOP + 0.4, q.z], 0.5, WHITE, 4);
  }
  const sun = Array.from({ length: 24 }, (_, k) => { const r = k % 2 ? 1.4 : 2.1, a = (k / 24) * 2 * Math.PI; return [C + r * Math.cos(a), UPPER + 3.2 + r * Math.sin(a)]; });
  wall(kit, path, sun, { o0: 0.1, o1: 0.3, hex: '#d4b04a' });
  oculus(kit, path, C, UPPER + 3.2, 0.9, { frame: '#d4b04a', glass: VERDE, rim: 0.1, o: 0.3 });
  // the scrolls either side of the upper storey, curving in from the corners of the lower one, with
  // their discs and the curls at their feet
  for (const d of [-1, 1]) {
    const inner = C + d * MID, outer = C + d * (HW - 0.6), ry = 10.5, at = f => inner + (outer - inner) * f;
    const curve = Array.from({ length: 13 }, (_, k) => {
      const t = (k / 12) * (Math.PI / 2);
      return [outer - (outer - inner) * Math.sin(t), BAND + ry - ry * Math.cos(t)];
    });
    wall(kit, path, [[inner, BAND], ...curve, [inner, BAND + ry]], { o0: -1.4, o1: 0.2, hex: WHITE });
    const ring = (r, c, y) => Array.from({ length: 16 }, (_, k) => [c + r * Math.cos((k / 16) * 2 * Math.PI), y + r * Math.sin((k / 16) * 2 * Math.PI)]);
    wall(kit, path, ring(1.9, at(0.3), BAND + 2.6), { o0: 0.2, o1: 0.35, hex: VERDE });
    wall(kit, path, ring(1.1, at(0.3), BAND + 2.6), { o0: 0.35, o1: 0.45, hex: WHITE });
    wall(kit, path, ring(1.1, at(0.93), BAND + 1.1), { o0: 0.2, o1: 0.45, hex: VERDE });
  }
}

// the bell tower in the corner of the west arm
function tower(kit) {
  const [tu, tv] = TOWER;
  kit.box(2 * TH, BELL[0], 2 * TH, STONE, tu, BELL[0] / 2, tv);
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.box(1.1, BELL[1], 1.1, WHITE, tu + x * (TH - 0.2), BELL[1] / 2, tv + z * (TH - 0.2));
  for (const path of sides([[tu - TH, tv - TH], [tu + TH, tv - TH], [tu + TH, tv + TH], [tu - TH, tv + TH]])) {
    const len = path.length;
    for (const y of [22, 34, 44]) panel(kit, path, 0, len, y, y + 0.5, WHITE, 0, 0.25);
    for (let k = 0; k < 4; k++) panel(kit, path, 0.6 + k * (len - 1.2) / 4, 0.6 + (k + 0.5) * (len - 1.2) / 4, BELL[0] - 1.6, BELL[0] - 0.8, WHITE, 0, 0.2);
    lancet(kit, path, len / 2, 0.9, 36, 41, { frame: WHITE, rim: 0.25, round: true });
    wall(kit, path, [[0, BELL[0]], [len, BELL[0]], [len, BELL[1]], [0, BELL[1]]], { o0: -0.6, o1: 0, hex: STONE });
    for (const d of [-1.3, 1.3]) lancet(kit, path, len / 2 + d, 1.6, BELL[0] + 2, BELL[1] - 2, { frame: WHITE, glass: GLASS, rim: 0.3, round: true });
    panel(kit, path, 0, len, BELL[1] - 0.6, BELL[1], WHITE, 0, 0.5);
  }
  const spire = new THREE.ConeGeometry(TH * 0.95, SPIRE - BELL[1], 8);
  kit.add(spire, shade(STONE, -0.08), tu, (SPIRE + BELL[1]) / 2, tv);
  kit.box(0.2, 2.4, 0.2, WHITE, tu, SPIRE + 1, tv).box(0.2, 0.2, 1.2, WHITE, tu, SPIRE + 1.4, tv);
}

// it stands in for the map's blocks of the church and its tower (area), and riders bump into its outline (foot)
const RING = onMap(X, Z, TURN, FOOT), TOWER_FOOT = onMap(X, Z, TURN, [[TOWER[0] - TH, TOWER[1] - TH], [TOWER[0] + TH, TOWER[1] - TH], [TOWER[0] + TH, TOWER[1] + TH], [TOWER[0] - TH, TOWER[1] + TH]]);
export const SANTA_MARIA_NOVELLA = [{
  id: 'santa-maria-novella', name: 'Santa Maria Novella', x: X, z: Z, turn: TURN, reach: 160, area: [RING, TOWER_FOOT], foot: [RING, TOWER_FOOT],
  make: novella,
}];
