// Santa Maria del Fiore (1296-1436, its front 1871-87), Florence's cathedral, modelled by hand in
// place of the map's pieces of it, from its measurements and photos, in game metres (the real ones
// times 1.25), on the map's outline: 153 m from the front to the end of the east tribune, 90 m across
// the tribunes, the dome's lantern at 114.5 m. White marble from Carrara, green from Prato and pink
// from the Maremma, laid in panels:
//   the nave of four great bays with its two aisles, tall two-light windows between buttresses, a
//     round window to each bay high in the nave's walls, roofs of red tiles
//   the front of the 19th century: three portals with their mosaics, a row of niches, three rose
//     windows, the gable with the Virgin, and the four buttresses topped with tabernacles
//   the octagon of the crossing, its three tribunes of chapels round it, each a half octagon with a
//     sloping roof, and the four little round exedrae in its corners
//   the drum with a round window in each of its eight faces, and Brunelleschi's dome: a pointed
//     octagonal vault of red tiles between eight white ribs, up to the lantern with its buttresses,
//     its cone, the gilded ball and the cross
// It stands on its own, so riders bump into the whole of it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { MARBLE, VERDE, ROSA, GLASS, TILE, sides, panel, inlay, lancet, oculus, prism, ngon, shell, gable } from './marble.js';

const X = 324.1, Z = -336.6, TURN = -0.0236; // on the nave's axis, which runs east (local +x) from the front to the tribunes
const FRONT = -97.3, CROSS = 3.2, HW = 27.4; // the front, where the nave meets the octagon, the nave's half width
const NAVE = 12.2; // the half width of the nave's upper walls, over the arcades
const AISLE = 29, CLERE = 50, RIDGE = 57; // the aisles' walls, the nave's, its ridge
const OC = 37, OA = 33.5; // the octagon's middle along the axis, its apothem
const DRUM = [52.5, 68.75], DA = 32, DOME = 45, DOME_A = 31, TOP_A = 6.2; // the drum, the dome's rise and apothems
const LANTERN = DRUM[1] + DOME; // where the lantern stands
const TRIB = 36; // the tribunes' walls
const STONE = shade(MARBLE, -0.06);

// the outline, in the model's metres (from the map's outline of it)
const FOOT = [[-97.3, -27.5], [-97.3, 27.4], [-0.6, 27.4], [3, 27.3], [4, 28.9], [9.3, 33.9], [14.2, 33.7], [13.8, 47.4], [28.3, 61.3], [47.7, 61.5], [59.8, 47.7], [59.5, 34.4], [63.8, 34.3], [70.4, 29.1], [70.5, 23], [83.1, 23.3], [96.9, 10.3], [97.3, -8.9], [84.2, -22.3], [70.2, -22.4], [69.7, -29], [64.8, -33.6], [60.4, -33.7], [60.5, -45.7], [47.4, -59.1], [27.7, -59], [15.2, -46.4], [14.8, -34.5], [9.5, -34.6], [4.4, -30.7], [3, -27.6], [-1.7, -27.6]];

// a bay of a marble wall from s0 to s1, y0 to y1: its panels, and a tall two-light window or not
function bay(kit, path, s0, s1, y0, y1, { window = true, rows = 4 } = {}) {
  inlay(kit, path, s0, s1, y0, y1, { cols: 3, rows, w: 0.45 });
  if (!window) return;
  const c = (s0 + s1) / 2, w = Math.min(5.4, (s1 - s0) * 0.32), wy0 = y0 + (y1 - y0) * 0.42, wy1 = y1 - 2.2;
  panel(kit, path, c - w / 2 - 1.2, c + w / 2 + 1.2, wy0 - 1.2, wy1 + 1, MARBLE, 0.1, 0.12);
  lancet(kit, path, c, w, wy0, wy1, { frame: ROSA, rim: 0.55, o: 0.22 });
  panel(kit, path, c - 0.25, c + 0.25, wy0, wy1 - w * 0.6, MARBLE, 0.42, 0.12); // the mullion
}

// a buttress at s: a pier standing out of the wall, with a little tabernacle on top
function buttress(kit, path, s, y1, w = 2.2, out = 1.6, top = true) {
  const p = path.at(s), x = p.x + (out / 2) * p.tz, z = p.z - (out / 2) * p.tx, turn = Math.atan2(-p.tz, p.tx);
  kit.box(w, y1, out, MARBLE, x, y1 / 2, z, 0, turn);
  for (let y = 6; y < y1 - 2; y += 7.5) kit.box(w + 0.1, 0.6, out + 0.1, VERDE, x, y, z, 0, turn);
  if (!top) return;
  kit.box(w + 0.6, 0.6, out + 0.6, STONE, x, y1 + 0.3, z, 0, turn);
  kit.add(new THREE.ConeGeometry(w * 0.55, 4.2, 4).rotateY(Math.PI / 4), MARBLE, x, y1 + 2.7, z, 0, turn);
}

export function duomo() {
  const kit = new Kit();
  // the plinth all round and the steps of the parvis before the front
  prism(kit, FOOT, 0, 1, shade(MARBLE, -0.12));
  for (let k = 0; k < 3; k++) kit.box(2.6 - 0.8 * k, 0.35 * (k + 1), 2 * HW + 4, shade(MARBLE, -0.1), FRONT - 1.3 + 0.4 * k, 0.175 * (k + 1), 0);
  nave(kit);
  front(kit);
  octagon(kit);
  dome(kit);
  return kit.mesh(kitMat(0.85));
}

// the aisles' walls, four bays to a side, the nave's upper walls with their round windows, the roofs
function nave(kit) {
  const len = CROSS - FRONT, step = len / 4;
  for (const side of [-1, 1]) {
    const path = side < 0 ? linePath(FRONT, -HW, CROSS, -HW) : linePath(CROSS, HW, FRONT, HW);
    wall(kit, path, [[0, 1], [len, 1], [len, AISLE], [0, AISLE]], { o0: -2, o1: 0, hex: MARBLE });
    for (let k = 0; k < 4; k++) bay(kit, path, k * step + 1.4, (k + 1) * step - 1.4, 1.5, AISLE - 2, { rows: 5 });
    for (let k = 0; k <= 4; k++) buttress(kit, path, Math.min(len - 1.1, Math.max(1.1, k * step)), AISLE + 1);
    // the cornice on its little arches, and the balustrade of the aisle's roof
    panel(kit, path, 0, len, AISLE - 1.6, AISLE, STONE, 0, 0.5);
    for (let s = 1; s < len; s += 2) panel(kit, path, s, s + 1, AISLE - 3, AISLE - 1.6, VERDE, 0, 0.3);
    // the nave's upper wall, its round windows and its cornice
    const up = side < 0 ? linePath(FRONT + 1, -NAVE, CROSS, -NAVE) : linePath(CROSS, NAVE, FRONT + 1, NAVE), ulen = up.length;
    wall(kit, up, [[0, AISLE], [ulen, AISLE], [ulen, CLERE], [0, CLERE]], { o0: -1.6, o1: 0, hex: MARBLE });
    inlay(kit, up, 0, ulen, AISLE + 4, CLERE - 1, { cols: 8, rows: 2, w: 0.4 });
    for (let k = 0; k < 4; k++) oculus(kit, up, (k + 0.5) * (ulen / 4), (AISLE + 4 + CLERE) / 2 + 1, 3, { rim: 0.8, o: 0.1 });
    panel(kit, up, 0, ulen, CLERE - 1, CLERE + 0.4, STONE, 0, 0.6);
    // the aisle's roof sloping up to the nave's wall
    const lean = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(HW - NAVE + 0.6, 0), new THREE.Vector2(0, (HW - NAVE) * 0.32)]);
    const geo = new THREE.ExtrudeGeometry(lean, { depth: len, bevelEnabled: false }).rotateY(Math.PI / 2);
    // shape x outward from the nave's wall, extruded along +u
    if (side > 0) geo.scale(1, 1, -1);
    kit.add(geo, TILE, FRONT, AISLE, side * NAVE);
  }
  gable(kit, (FRONT + CROSS) / 2 + 0.5, CLERE + 0.3, 0, CROSS - FRONT - 1, 2 * NAVE + 1.4, RIDGE - CLERE, TILE);
}

// the 19th-century front, facing west (local -x)
function front(kit) {
  const path = linePath(FRONT, HW + 0.4, FRONT, -HW - 0.4), len = path.length; // s from south to north
  const C = len / 2, MID = NAVE + 0.6; // the middle part as wide as the nave
  const outline = [[0, 0], [len, 0], [len, AISLE + 10], [C + MID, AISLE + 10], [C + MID, RIDGE + 1], [C, RIDGE + 11], [C - MID, RIDGE + 1], [C - MID, AISLE + 10], [0, AISLE + 10]];
  wall(kit, path, outline, { o0: -2.6, o1: 0, hex: MARBLE });
  // the marble's panels: tall ones below, smaller over the niches, round the roses
  for (const [a, b] of [[1.6, C - MID - 1.2], [C + MID + 1.2, len - 1.6]]) {
    inlay(kit, path, a, b, 1, 22, { cols: 2, rows: 3, w: 0.5 });
    inlay(kit, path, a, b, 26, AISLE + 9, { cols: 2, rows: 2, w: 0.45, hex: ROSA });
  }
  inlay(kit, path, C - MID + 1, C + MID - 1, 26, RIDGE, { cols: 4, rows: 5, w: 0.45 });
  // the three portals: their jambs, their mosaics in the lunettes, the bronze doors
  for (const [c, w, h] of [[C, 7.6, 15.5], [C - 18.5, 4.6, 11], [C + 18.5, 4.6, 11]]) {
    lancet(kit, path, c, w + 3, 1, h + 2.6, { frame: ROSA, glass: MARBLE, rim: 0.6, round: false, r: 0.9, o: 0.1 });
    lancet(kit, path, c, w, 1, h, { frame: VERDE, glass: '#3e3426', rim: 0.4, round: true, o: 0.3 });
    lancet(kit, path, c, w * 0.8, h - w * 0.35, h + 1.8, { frame: '#c9a64a', glass: '#c9a64a', rim: 0.1, round: false, r: 0.9, o: 0.55 });
    panel(kit, path, c - w / 2 - 2.2, c + w / 2 + 2.2, h + 3.4, h + 5, '#d2c7b2', 0.1, 0.4); // the gable's cornice
  }
  // the row of niches with their statues across the whole front
  panel(kit, path, 0.6, len - 0.6, 22.5, 23.2, STONE, 0, 0.7);
  for (let k = 0; k < 15; k++) {
    const s = 3 + (k * (len - 6)) / 14;
    lancet(kit, path, s, 1.5, 23.4, 26.6, { frame: ROSA, glass: shade(MARBLE, -0.25), rim: 0.3, round: true, o: 0.1 });
    const p = path.at(s);
    kit.add(new THREE.CylinderGeometry(0.32, 0.42, 2.4, 6), shade(MARBLE, 0.04), p.x - 0.5, 24.6, p.z);
  }
  // the rose windows: the big one over the middle portal, the two small ones over the side portals
  oculus(kit, path, C, 38.5, 5.4, { frame: ROSA, rim: 1.4, o: 0.1 });
  oculus(kit, path, C, 38.5, 3.6, { frame: '#3c6a8c', glass: '#6c4f6c', rim: 0.6, o: 0.4 });
  for (const s of [C - 18.5, C + 18.5]) oculus(kit, path, s, 31.5, 2.4, { frame: ROSA, rim: 0.8, o: 0.1 });
  // the row of the apostles under the gable, the gable's tondo of the Virgin, its cornice
  panel(kit, path, C - MID, C + MID, RIDGE - 7, RIDGE - 6.3, STONE, 0, 0.7);
  for (let k = 0; k < 9; k++) lancet(kit, path, C - MID + 1.6 + (k * (2 * MID - 3.2)) / 8, 1.2, RIDGE - 6, RIDGE - 2.6, { frame: VERDE, glass: shade(MARBLE, -0.2), rim: 0.25, round: true, o: 0.1 });
  wall(kit, path, [[C - MID - 0.4, RIDGE + 0.6], [C + MID + 0.4, RIDGE + 0.6], [C, RIDGE + 11.5]], { o0: -0.2, o1: 0.6, hex: STONE });
  wall(kit, path, [[C - MID + 1.2, RIDGE + 1.4], [C + MID - 1.2, RIDGE + 1.4], [C, RIDGE + 10]], { o0: 0.6, o1: 0.7, hex: MARBLE });
  oculus(kit, path, C, RIDGE + 4.6, 2.4, { frame: '#c9a64a', glass: '#4a6fa0', rim: 0.5, o: 0.7 });
  kit.add(new THREE.CylinderGeometry(0.3, 0.6, 2.4, 6), MARBLE, FRONT - 0.3, RIDGE + 12.6, 0); // the cross's plinth
  kit.box(0.3, 2.4, 0.3, MARBLE, FRONT - 0.3, RIDGE + 14.4, 0).box(0.3, 0.3, 1.5, MARBLE, FRONT - 0.3, RIDGE + 14.8, 0);
  // the side parts' tops: a balustrade of little arches
  for (const [a, b] of [[0, C - MID], [C + MID, len]]) for (let s = a + 0.6; s < b - 0.6; s += 1.3) panel(kit, path, s, s + 0.7, AISLE + 10, AISLE + 11.4, MARBLE, -0.8, 0.5);
  // the four buttresses, with their tabernacles on top
  for (const [s, h] of [[1.2, AISLE + 13], [C - MID, RIDGE + 1], [C + MID, RIDGE + 1], [len - 1.2, AISLE + 13]]) {
    const p = path.at(s), x = p.x - 1.2;
    kit.box(2.6, h, 2.8, MARBLE, x, h / 2, p.z);
    for (let y = 4; y < h; y += 6.5) kit.box(2.7, 0.7, 2.9, VERDE, x, y, p.z);
    for (let y = 9; y < h - 3; y += 13) kit.box(0.2, 3.2, 1.2, ROSA, x - 1.35, y, p.z);
    kit.box(3.2, 0.7, 3.4, STONE, x, h + 0.35, p.z);
    for (const [dx, dz] of [[-1.1, -1.2], [1.1, -1.2], [-1.1, 1.2], [1.1, 1.2]]) kit.box(0.5, 3, 0.5, MARBLE, x + dx, h + 2.2, p.z + dz);
    kit.add(new THREE.ConeGeometry(2, 6, 4).rotateY(Math.PI / 4), MARBLE, x, h + 6.7, p.z);
  }
}

// the octagon of the crossing up to the drum, the three tribunes and the four exedrae round it
function octagon(kit) {
  const ring = ngon(OA, 8, Math.PI / 8, OC, 0);
  for (const path of sides(ring)) {
    const len = path.length;
    wall(kit, path, [[0, 1], [len, 1], [len, DRUM[0]], [0, DRUM[0]]], { o0: -2.5, o1: 0, hex: MARBLE });
    inlay(kit, path, 0.6, len - 0.6, TRIB + 4, DRUM[0] - 1, { cols: 4, rows: 2, w: 0.45 });
    panel(kit, path, 0, len, DRUM[0] - 1.2, DRUM[0], STONE, 0, 0.6);
  }
  // the tribunes, north, east and south: half octagons of five chapels each
  const TRI = [[0, -23], [13, -23], [27, -9.8], [27, 9.8], [13, 23], [0, 23]];
  for (const turn of [Math.PI / 2, 0, -Math.PI / 2]) {
    const c = Math.cos(turn), s = Math.sin(turn);
    // t outward from the octagon's face, w across: to the model's u, v
    const at = ([t, w]) => [OC + (OA + t) * c + w * s, (OA + t) * -s + w * c];
    const pts = TRI.map(at);
    for (const path of sides(pts).slice(0, 5)) {
      const len = path.length;
      wall(kit, path, [[0, 1], [len, 1], [len, TRIB], [0, TRIB]], { o0: -2, o1: 0, hex: MARBLE });
      bay(kit, path, 1, len - 1, 1.5, TRIB - 2, { rows: 4 });
      panel(kit, path, 0, len, TRIB - 1.4, TRIB, STONE, 0, 0.5);
    }
    for (const p of pts.slice(1, -1)) kit.box(2.4, TRIB + 1, 2.4, MARBLE, p[0], (TRIB + 1) / 2, p[1]);
    // its roof, sloping from the walls up against the octagon
    const roof = [], hi = TRIB + 10, top = TRI.map(([t, w]) => [Math.max(0, t - 18), Math.max(-12, Math.min(12, w * 0.55))]);
    for (let k = 0; k < 5; k++) {
      const a = [...at(TRI[k])], b = [...at(TRI[k + 1])], a2 = at(top[k]), b2 = at(top[k + 1]);
      roof.push([a, TRIB], [b, TRIB], [b2, hi], [a, TRIB], [b2, hi], [a2, hi]);
    }
    const pos = roof.flatMap(([[x, z], y]) => [x, y, z]);
    const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    kit.add(geo, TILE);
    const back = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos.slice(), 3));
    const arr = back.attributes.position.array;
    for (let i = 0; i < arr.length; i += 9) for (let j = 0; j < 3; j++) [arr[i + 3 + j], arr[i + 6 + j]] = [arr[i + 6 + j], arr[i + 3 + j]];
    kit.add(back, TILE); // its other face, so the roof shows whichever way its triangles wind
    // the little lantern over the tribune's roof
    const [lx, lz] = at([6, 0]);
    shell(kit, [[3.4, hi - 1], [3.4, hi + 3], [3.9, hi + 3], [3.9, hi + 3.6], [2.4, hi + 6], [0.3, hi + 8], [0, hi + 8.2]], MARBLE, { cx: lx, cz: lz });
  }
  // the four little round exedrae in the octagon's corners, against its diagonal faces
  for (const a of [Math.PI / 4, 3 * Math.PI / 4, -Math.PI / 4, -3 * Math.PI / 4]) {
    const r = OA + 3.4, x = OC + r * Math.cos(a), z = r * Math.sin(a);
    if (x < CROSS + 2) continue;
    kit.add(new THREE.CylinderGeometry(5.4, 5.4, 15, 14), MARBLE, x, 8.5, z);
    for (let y = 3; y < 15; y += 4.5) kit.add(new THREE.CylinderGeometry(5.5, 5.5, 0.5, 14), VERDE, x, y, z);
    kit.add(new THREE.SphereGeometry(5.4, 14, 6, 0, 2 * Math.PI, 0, Math.PI / 2), TILE, x, 16, z);
  }
}

// the drum, the dome and its lantern
function dome(kit) {
  const ring = ngon(DA, 8, Math.PI / 8, OC, 0);
  for (const path of sides(ring)) {
    const len = path.length, c = len / 2;
    wall(kit, path, [[0, DRUM[0]], [len, DRUM[0]], [len, DRUM[1]], [0, DRUM[1]]], { o0: -2.5, o1: 0, hex: MARBLE });
    inlay(kit, path, 0.4, len - 0.4, DRUM[0] + 0.5, DRUM[1] - 1.4, { cols: 6, rows: 1, w: 0.5 });
    oculus(kit, path, c, (DRUM[0] + DRUM[1]) / 2, 3.6, { rim: 1.1, o: 0.15 });
    panel(kit, path, 0, len, DRUM[1] - 1.6, DRUM[1], STONE, 0, 0.9);
  }
  // the vault: every section an octagon, its apothem on a pointed arc of radius RHO from the
  // springing (DOME_A) to the lantern's ring (TOP_A)
  const RHO = (DOME * DOME + (DOME_A - TOP_A) ** 2) / (2 * (DOME_A - TOP_A));
  const prof = Array.from({ length: 17 }, (_, k) => {
    const y = (k / 16) * DOME;
    return [DOME_A - RHO + Math.sqrt(RHO * RHO - y * y), DRUM[1] + y];
  });
  shell(kit, prof, TILE, { cx: OC });
  // the eight white ribs on its corners, and the ring of the eye under the lantern
  const corner = (a, y, k) => {
    const R = a / Math.cos(Math.PI / 8) + 0.35, t = Math.PI / 8 + (k / 8) * 2 * Math.PI;
    return [OC + R * Math.cos(t), y, R * Math.sin(t)];
  };
  for (let k = 0; k < 8; k++) for (let j = 0; j + 1 < prof.length; j++) kit.rod(corner(...prof[j], k), corner(...prof[j + 1], k), 1, MARBLE, 4);
  // the bands of little round windows in the vault's lower part
  shell(kit, [[DOME_A + 0.2, DRUM[1]], [DOME_A + 0.2, DRUM[1] + 1.2], [DOME_A - 0.1, DRUM[1] + 1.2]], MARBLE, { cx: OC });
  shell(kit, [[TOP_A + 1.4, LANTERN - 0.6], [TOP_A + 1.4, LANTERN + 1], [TOP_A - 0.4, LANTERN + 1]], MARBLE, { cx: OC });
  // the lantern: its eight faces with their tall openings, the buttresses with their volutes, the
  // cone, the ball and the cross
  const L0 = LANTERN + 1, L1 = L0 + 11, LA = 4.6;
  shell(kit, [[LA, L0], [LA, L1], [LA + 0.8, L1], [LA + 0.8, L1 + 1.2], [LA - 0.4, L1 + 1.2]], MARBLE, { cx: OC });
  for (const path of sides(ngon(LA, 8, Math.PI / 8, OC, 0))) lancet(kit, path, path.length / 2, 1.5, L0 + 2, L1 - 1.6, { frame: shade(MARBLE, -0.1), rim: 0.3, round: true });
  for (let k = 0; k < 8; k++) {
    const t = Math.PI / 8 + (k / 8) * 2 * Math.PI, R = LA / Math.cos(Math.PI / 8);
    const x = OC + (R + 1.3) * Math.cos(t), z = (R + 1.3) * Math.sin(t);
    kit.box(2.6, L1 - L0, 0.9, MARBLE, x, (L0 + L1) / 2, z, 0, -t);
    kit.box(2.4, 2, 0.8, MARBLE, OC + (R + 2.6) * Math.cos(t), L0 + 1, (R + 2.6) * Math.sin(t), 0, -t, 0.5); // the volute at its foot
  }
  shell(kit, [[LA - 0.4, L1 + 1.2], [LA - 1.4, L1 + 4], [1.2, L1 + 11], [0.6, L1 + 13], [0, L1 + 13.4]], MARBLE, { cx: OC, n: 16 });
  kit.add(new THREE.SphereGeometry(1.7, 12, 8), '#d4b04a', OC, L1 + 15, 0);
  kit.box(0.35, 4.6, 0.35, '#d4b04a', OC, L1 + 18.6, 0).box(0.35, 0.35, 2, '#d4b04a', OC, L1 + 19.6, 0);
}

// it stands in for the map's pieces of the cathedral (area), and riders bump into its outline (foot)
const RING = onMap(X, Z, TURN, FOOT);
export const DUOMO = [{
  id: 'duomo', name: 'Santa Maria del Fiore', x: X, z: Z, turn: TURN, reach: 220, area: [RING], foot: [RING],
  make: duomo,
}];
