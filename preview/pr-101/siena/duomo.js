// The Duomo di Siena, Santa Maria Assunta (built 1215-1263, its front by Giovanni Pisano from 1284 and
// finished after 1376), and its bell tower (1313), modelled by hand in place of the map's pieces of
// them, from their measurements and photos, in game metres (the real ones times 1.25), on the map's
// outline: 89 m from the front to the end of the choir, 24 m across the aisles, the dome's lantern at
// 49 m and the tower 77 m high. White marble from Carrara banded with dark green-black marble from
// Prato, Siena's colours, under roofs of lead:
//   the nave and its aisles, striped, with tall pointed windows between buttresses and round
//     windows high in the nave's walls; the transept and the choir out past the dome
//   the front: Giovanni Pisano's lower half with its three round-arched portals under their gables,
//     and the Gothic upper half with the great rose window in its square frame, the three gables
//     with their gold mosaics, and the turrets between them ending in spires
//   the dome over the crossing: its striped twelve-sided drum, the gallery of little columns round
//     its top, the dome of lead and its lantern
//   the bell tower, striped all the way up, its windows growing from one light to six storey by
//     storey, and its spire between four little ones
// It stands on its own up its steps, so riders bump into it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, ellipsePath, arcade, wall, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { panel, lancet, oculus, prism, gable, shell } from '../florence/marble.js';
import { LEAD, DARK, strip } from '../pisa/romanico.js';

const X = -79.4, Z = 41, TURN = 0.9275; // the dome's middle; the nave runs from the front (local -x) to the choir (+x)
const FRONT = -59, END = 50, HW = 17.3, NW = 8.4; // the front, the choir's end, the aisles' and the nave's half widths
const TR = [-10, 22.5], TW = 33; // the transept, from u to u, and its half width
const AISLE = 32.5, CLERE = 41, RIDGE = 44.5; // the aisles' walls, the nave's, its ridge
const C = [-13.5, 19], CH = 5.3, BASE = 30, SPIRE = 80, TIP = 94.8; // the bell tower: middle, half width, heights
export const WHITE = '#ebe6da', BLACK = '#2f3532', GOLD = '#c9a24a';
const STONE = shade(WHITE, -0.08), PINK = '#d9b9a8';

// the black bands on a wall from s0 to s1, y0 to y1: every other metre
function stripes(kit, path, s0, s1, y0, y1, o = 0) {
  for (let y = y0 + 1; y + 0.95 < y1; y += 2) strip(kit, path, s0, s1, y, y + 0.95, BLACK, o, 0.05);
}

// a straight wall from (u0, v0) to (u1, v1), its outside to the right
const run = (u0, v0, u1, v1) => linePath(u0, v0, u1, v1);

// a buttress at s on the path, standing out `out` metres, up to y, with a little spire on it
function buttress(kit, path, s, y, w = 1.8, out = 1.4) {
  const p = path.at(s), x = p.x + (out / 2) * p.tz, z = p.z - (out / 2) * p.tx, turn = Math.atan2(-p.tz, p.tx);
  for (let k = 0; y > k; k += 1) kit.box(w, Math.min(1, y - k), out, k % 2 ? BLACK : WHITE, x, k + Math.min(1, y - k) / 2, z, 0, turn);
  kit.add(new THREE.ConeGeometry(w * 0.6, 3.4, 4).rotateY(Math.PI / 4), WHITE, x, y + 1.7, z, 0, turn);
}

// a wall's run of bays: tall two-light windows between buttresses, the black bands, the cornice
function aisle(kit, path, h, n, { windows = true, top = true } = {}) {
  const len = path.length, bay = len / n;
  stripes(kit, path, 0, len, 0.6, h - 1);
  for (let k = 0; k < n; k++) {
    const c = (k + 0.5) * bay;
    if (windows) {
      lancet(kit, path, c, Math.min(3, bay * 0.4), h * 0.35, h - 4, { frame: WHITE, glass: DARK, rim: 0.4, r: 0.9, o: 0.06 });
      panel(kit, path, c - 0.12, c + 0.12, h * 0.35, h - 6, WHITE, 0.2, 0.12);
    }
    if (top) buttress(kit, path, Math.min(len - 0.9, Math.max(0.9, k * bay)), h + 0.6);
  }
  panel(kit, path, 0, len, h - 0.8, h, STONE, 0, 0.7);
}

export function duomo() {
  const kit = new Kit();
  // the bodies: aisles from the front to the choir's end, the transept, the nave above them
  prism(kit, rect(FRONT, -HW, END, HW), 0, AISLE, WHITE);
  prism(kit, rect(TR[0], -TW, TR[1], TW), 0, AISLE, WHITE);
  prism(kit, rect(FRONT, -NW, END, NW), 0, CLERE, WHITE);
  prism(kit, rect(C[0] - 7.5, HW - 0.2, C[0] + 7.5, HW + 9.4), 0, BASE, WHITE); // the old block at the tower's foot
  for (const side of [-1, 1]) {
    for (const [u0, u1] of [[FRONT, TR[0]], [TR[1], END]]) {
      const p = side < 0 ? run(u0, -HW, u1, -HW) : run(u1, HW, u0, HW);
      aisle(kit, p, AISLE, Math.round(p.length / 7));
      const up = side < 0 ? run(u0, -NW, u1, -NW) : run(u1, NW, u0, NW);
      stripes(kit, up, 0, up.length, AISLE, CLERE);
      const n = Math.round(up.length / 7);
      for (let k = 0; k < n; k++) oculus(kit, up, (k + 0.5) * (up.length / n), (AISLE + CLERE) / 2 + 0.4, 1.6, { frame: WHITE, glass: DARK, rim: 0.4, o: 0.06 });
      panel(kit, up, 0, up.length, CLERE - 0.6, CLERE, STONE, 0, 0.6);
    }
    // the transept's arm: its two sides and its end, and its gable
    const v0 = side * HW, v1 = side * TW;
    const arm = side < 0 ? [run(TR[0], v0, TR[0], v1), run(TR[0], v1, TR[1], v1), run(TR[1], v1, TR[1], v0)] : [run(TR[1], v0, TR[1], v1), run(TR[1], v1, TR[0], v1), run(TR[0], v1, TR[0], v0)];
    arm.forEach((p, k) => aisle(kit, p, AISLE, Math.max(2, Math.round(p.length / 7)), { top: k !== 1 }));
    const end = arm[1];
    wall(kit, end, [[0, AISLE], [end.length, AISLE], [end.length / 2, AISLE + 7]], { o0: -0.6, o1: 0, hex: WHITE });
    stripes(kit, end, 0, end.length, AISLE, AISLE + 5);
    oculus(kit, end, end.length / 2, AISLE + 2.6, 1.8, { frame: WHITE, glass: DARK, rim: 0.4, o: 0.06 });
  }
  // the old block at the tower's foot, striped
  for (const p of [run(C[0] + 7.5, HW + 9.4, C[0] - 7.5, HW + 9.4), run(C[0] - 7.5, HW + 9.4, C[0] - 7.5, HW), run(C[0] + 7.5, HW, C[0] + 7.5, HW + 9.4)]) stripes(kit, p, 0, p.length, 0.6, BASE - 0.5);
  prism(kit, rect(C[0] - 7.7, HW - 0.2, C[0] + 7.7, HW + 9.6), BASE, BASE + 0.6, STONE);
  // the choir's flat end wall over the baptistery, and its round window
  const back = run(END, -HW, END, HW);
  aisle(kit, back, AISLE, 4, { windows: false });
  wall(kit, run(END, -NW, END, NW), [[0, AISLE], [2 * NW, AISLE], [2 * NW, CLERE], [NW, RIDGE + 1.5], [0, CLERE]], { o0: -0.6, o1: 0, hex: WHITE });
  oculus(kit, back, HW, AISLE - 9, 3.4, { frame: WHITE, glass: '#4a5f8a', rim: 0.8, o: 0.06 });
  // the roofs: the aisles' and the transept's low ones, the nave's gable
  prism(kit, rect(FRONT + 1, -HW + 0.4, END - 0.4, HW - 0.4), AISLE, AISLE + 0.8, LEAD);
  prism(kit, rect(TR[0] + 0.4, -TW + 0.4, TR[1] - 0.4, TW - 0.4), AISLE, AISLE + 0.8, LEAD);
  for (const side of [-1, 1]) gable(kit, (TR[0] + TR[1]) / 2, AISLE, side * (TW + HW) / 2, TW - HW, TR[1] - TR[0], 5.5, LEAD, Math.PI / 2);
  gable(kit, (FRONT + END) / 2, CLERE, 0, END - FRONT - 1, 2 * NW + 1, RIDGE - CLERE, LEAD);
  front(kit);
  dome(kit);
  tower(kit);
  return kit.mesh(kitMat(0.85));
}

// the front, facing west-south-west (local -x): s from the south corner to the north one
function front(kit) {
  const path = run(FRONT, HW, FRONT, -HW), len = path.length, M = len / 2, CW = 9; // CW: the middle part's half width
  const LOW = 21, SIDE = 30, MID = 35, APEX = 48, SAPEX = 37;
  wall(kit, path, [[0, 0], [len, 0], [len, SIDE], [M + CW, SIDE], [M + CW, MID], [M, APEX], [M - CW, MID], [M - CW, SIDE], [0, SIDE]], { o0: -2, o1: 0, hex: WHITE });
  // the side gables over the aisles, with their mosaics
  for (const [a, b] of [[0.6, M - CW - 0.4], [M + CW + 0.4, len - 0.6]]) {
    wall(kit, path, [[a, SIDE], [b, SIDE], [(a + b) / 2, SAPEX]], { o0: -0.8, o1: 0.3, hex: WHITE });
    wall(kit, path, [[a + 1.4, SIDE + 0.6], [b - 1.4, SIDE + 0.6], [(a + b) / 2, SAPEX - 1.4]], { o0: 0.3, o1: 0.4, hex: GOLD });
  }
  // the lower half: three round-arched portals in their deep frames, a gable over each
  for (const [c, w, h] of [[M - 10.8, 3.8, 10], [M, 5, 12.4], [M + 10.8, 3.8, 10]]) {
    for (let k = 3; k >= 0; k--) lancet(kit, path, c, w + k * 1.1, 0.6, h + k * 0.55, { frame: k % 2 ? PINK : WHITE, glass: k ? WHITE : '#5a4430', rim: 0, round: true, o: 0.15 * (4 - k) });
    lancet(kit, path, c, w * 0.75, h - w * 0.45, h - 0.2, { frame: GOLD, glass: GOLD, rim: 0, round: true, o: 0.7 });
    wall(kit, path, [[c - w / 2 - 2.6, h + 2], [c + w / 2 + 2.6, h + 2], [c, LOW - 0.6]], { o0: 0, o1: 0.9, hex: WHITE });
    for (const d of [-1, 1]) {
      const p = path.at(c + d * (w / 2 + 2.1));
      kit.add(new THREE.CylinderGeometry(0.35, 0.4, h + 1.4, 8), d < 0 ? BLACK : PINK, p.x - 0.7, (h + 1.4) / 2, p.z);
    }
  }
  panel(kit, path, 0, len, LOW, LOW + 0.8, STONE, 0, 1);
  // the statues of prophets and sibyls along the lower half's top
  for (let k = 0; k < 10; k++) {
    const p = path.at(2 + (k * (len - 4)) / 9);
    kit.add(new THREE.CylinderGeometry(0.4, 0.55, 2.6, 6), shade(WHITE, 0.04), p.x - 0.6, LOW + 2.1, p.z);
  }
  // the upper half: the rose window in its square frame of busts, the arcading beside it
  panel(kit, path, M - 7, M + 7, LOW + 1.4, MID - 0.6, STONE, 0, 0.3);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * 2 * Math.PI;
    panel(kit, path, M + 6 * Math.cos(a) - 0.4, M + 6 * Math.cos(a) + 0.4, LOW + 7.6 + 6 * Math.sin(a) - 0.5, LOW + 7.6 + 6 * Math.sin(a) + 0.5, PINK, 0.3, 0.3);
  }
  oculus(kit, path, M, LOW + 7.6, 4.4, { frame: WHITE, glass: '#4a5f8a', rim: 0.8, o: 0.35 });
  for (const [a, b] of [[1.6, M - CW - 1.4], [M + CW + 1.4, len - 1.6]]) {
    for (let k = 0; k < 3; k++) {
      const c = a + ((k + 0.5) * (b - a)) / 3;
      lancet(kit, path, c, 1.3, LOW + 2.4, SIDE - 1.6, { frame: PINK, glass: shade(WHITE, -0.25), rim: 0.25, o: 0.06 });
    }
  }
  // the great gable with the Coronation of the Virgin in gold
  wall(kit, path, [[M - CW + 0.4, MID + 0.6], [M + CW - 0.4, MID + 0.6], [M, APEX - 1.6]], { o0: 0.1, o1: 0.25, hex: GOLD });
  oculus(kit, path, M, MID + 4.2, 1.6, { frame: WHITE, glass: '#3e5c8a', rim: 0.4, o: 0.3 });
  // the turrets between the parts and at the corners, ending in spires; the angel on the top
  for (const [s, top] of [[1.2, SIDE + 6], [M - CW, MID + 7], [M + CW, MID + 7], [len - 1.2, SIDE + 6]]) {
    const p = path.at(s), x = p.x - 1;
    for (let y = 0; y < top; y += 1) kit.box(2.4, 1, 2.4, y % 2 && y < LOW ? BLACK : WHITE, x, y + 0.5, p.z);
    for (const [dx, dz] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) kit.box(0.4, 2.2, 0.4, WHITE, x + dx, top + 1.1, p.z + dz);
    kit.add(new THREE.ConeGeometry(1.6, 6, 4).rotateY(Math.PI / 4), WHITE, x, top + 5.2, p.z);
  }
  const p = path.at(M);
  kit.add(new THREE.CylinderGeometry(0.4, 0.6, 2.6, 6), GOLD, p.x - 0.3, APEX + 1.3, p.z);
}

// the dome over the crossing: its striped drum, the gallery round its top, the lead dome, the lantern
function dome(kit) {
  const R = 14.2, D0 = 46, D1 = 51, TOP = 61.3, drum = ellipsePath(R, R);
  kit.add(new THREE.CylinderGeometry(R - 0.3, R - 0.3, D1 - AISLE, 24), WHITE, 0, (D1 + AISLE) / 2, 0);
  arcade(kit, drum, { bays: 36, start: 0, depth: 0.4, r: 0.18, hex: () => WHITE, storeys: [{ h: D0 }, { h: D1 - D0, arch: 0.7, crown: D1 - D0 - 0.6, sill: 0.3, order: 'tuscan' }] });
  stripes(kit, drum, 0, drum.length, AISLE, D0);
  kit.add(new THREE.CylinderGeometry(R + 0.4, R + 0.4, 0.8, 24), STONE, 0, D1 + 0.4, 0);
  const prof = Array.from({ length: 9 }, (_, k) => { const t = (k / 8) * (Math.PI / 2) * 0.9; return [(R - 0.6) * Math.cos(t), D1 + 0.8 + (TOP - D1 - 0.8) * Math.sin(t) / Math.sin(Math.PI / 2 * 0.9)]; });
  shell(kit, prof, LEAD, { n: 12 });
  // the lantern
  kit.add(new THREE.CylinderGeometry(2, 2.2, 4, 12), WHITE, 0, TOP + 1.6, 0);
  for (let y = TOP; y < TOP + 3.4; y += 1.4) kit.add(new THREE.CylinderGeometry(2.25, 2.25, 0.6, 12), BLACK, 0, y + 0.3, 0);
  kit.add(new THREE.ConeGeometry(2.4, 2.4, 12), LEAD, 0, TOP + 4.8, 0);
  kit.add(new THREE.SphereGeometry(0.5, 8, 6), GOLD, 0, TOP + 6.3, 0);
  kit.box(0.16, 1.6, 0.16, GOLD, 0, TOP + 7.4, 0).box(0.16, 0.16, 0.9, GOLD, 0, TOP + 7.8, 0);
}

// the bell tower: striped, its six storeys of windows from one light to six, the spire
function tower(kit) {
  const [cx, cz] = C, sides4 = [run(cx - CH, cz - CH, cx + CH, cz - CH), run(cx + CH, cz - CH, cx + CH, cz + CH), run(cx + CH, cz + CH, cx - CH, cz + CH), run(cx - CH, cz + CH, cx - CH, cz - CH)];
  kit.box(2 * CH - 0.1, SPIRE, 2 * CH - 0.1, WHITE, cx, SPIRE / 2, cz);
  const st = (SPIRE - 2 - BASE) / 6;
  for (const path of sides4) {
    const len = path.length;
    stripes(kit, path, 0.2, len - 0.2, 0, SPIRE - 2);
    for (let k = 0; k < 6; k++) {
      const y0 = BASE + k * st + 1.6, y1 = y0 + st - 3.6, n = k + 1, w = Math.min(1.5, (len - 3) / n - 0.3);
      for (let j = 0; j < n; j++) {
        const s = 1.5 + ((j + 0.5) * (len - 3)) / n;
        lancet(kit, path, s, w, y0, y1, { frame: WHITE, glass: DARK, rim: 0.2, round: true, o: 0.06 });
      }
      panel(kit, path, 1.2, len - 1.2, y0 - 0.5, y0 - 0.1, WHITE, 0, 0.4);
    }
    for (let s = 0.3; s < len; s += 1.1) panel(kit, path, s, s + 0.5, SPIRE - 2.4, SPIRE - 0.4, WHITE, 0, 0.6);
  }
  kit.box(2 * CH + 1.2, 0.8, 2 * CH + 1.2, STONE, cx, SPIRE, cz);
  // the octagonal spire, and the four little ones round it
  shell(kit, [[CH - 0.4, SPIRE + 0.4], [CH - 0.4, SPIRE + 2.2], [0.3, TIP - 1], [0, TIP - 0.8]], WHITE, { n: 8, cx, cz });
  for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    kit.box(1.2, 2.6, 1.2, WHITE, cx + dx * (CH - 0.4), SPIRE + 1.7, cz + dz * (CH - 0.4));
    kit.add(new THREE.ConeGeometry(0.85, 4, 8), WHITE, cx + dx * (CH - 0.4), SPIRE + 5, cz + dz * (CH - 0.4));
  }
  kit.add(new THREE.SphereGeometry(0.35, 6, 5), GOLD, cx, TIP - 0.4, cz);
  kit.box(0.12, 1.2, 0.12, GOLD, cx, TIP + 0.5, cz);
}

// it stands in for the map's pieces of it (area: the cathedral's and its platform's), and riders bump
// into its cross and the tower's foot (foot)
const RINGS = [rect(FRONT - 1, -HW, END, HW), rect(TR[0], -TW, TR[1], TW), rect(C[0] - 7.5, HW - 0.2, C[0] + 7.5, HW + 9.4)].map(r => onMap(X, Z, TURN, r));
export const DUOMO = [{
  id: 'duomo', name: 'Duomo di Siena', x: X, z: Z, turn: TURN, reach: 220,
  area: [rect(FRONT - 14, -HW - 3, END + 4, HW + 3), rect(TR[0] - 3, -TW - 3, TR[1] + 3, TW + 3), rect(C[0] - 9, HW, C[0] + 9, HW + 11)].map(r => onMap(X, Z, TURN, r)), foot: RINGS,
  make: duomo,
}];
