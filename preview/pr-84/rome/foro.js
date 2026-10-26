// The ruins of the Foro Romano that still stand up out of it, modelled by hand in place of the map's
// boxes for them, each on the map's outline of it, from their measurements and photos, in game
// metres (the real ones times 1.25). Each is a monument of its own, put up as it comes into sight:
//   the Curia Iulia, the senate house of brick, its bronze doors up its steps and the three windows
//     over them under the gable
//   the Arco di Settimio Severo (AD 203): three arches, four columns on each face, the attic with its
//     inscription
//   the Tempio di Saturno: the eight Ionic columns of grey and red granite on the high podium, under
//     their entablature with SENATVS POPVLVSQVE ROMANVS INCENDIO CONSVMPTVM RESTITVIT
//   the Tempio di Vespasiano: the three Corinthian columns of its corner, under their piece of
//     entablature
//   the Colonna di Foca (AD 608), the last monument of the Forum, on its stepped base
//   the Tempio dei Dioscuri (Castor and Pollux): the three columns standing on its podium's core
//   the Tempio di Vesta, round, the piece of it rebuilt in the 1930s
//   the Tempio di Antonino e Faustina: its portico of ten columns of cipollino up its steps, and
//     behind it the baroque front of San Lorenzo in Miranda (the map's church behind stays)
//   the Tempio del Divo Romolo: its round hall under the dome, the bronze doors between their two
//     porphyry columns
//   the Basilica di Massenzio (AD 308-312): the north aisle, the three great barrel vaults open to
//     the nave, the apse in the middle one
//   and the rest of the Forum's ruins, the map's walls, stumps of columns and podiums (the Basilica
//     Iulia's piers, the Basilica Aemilia's columns, the Regia, the House of the Vestals), which the
//     game would otherwise put up as houses with windows and roofs: low walls of brick and tuff on
//     their outlines, stumps of marble, podiums
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, archRing, onMap, rect } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';
import { MAP } from './map.js';

const MARBLE = '#e6e0d1', MARBLE2 = '#d6cebb', TRAV = '#d3c6a8', TUFF = '#9b8e77', CORE = '#8f8371', BRICK = '#a06e52', BRICK2 = '#93644b', BRONZE = '#4f4a3a';

// a frame: the city's (x, z) as the model's own (u, v), turned as the game turns it
const frame = (X, Z, turn) => (x, z) => { const c = Math.cos(turn), s = Math.sin(turn), dx = x - X, dz = z - Z; return [dx * c - dz * s, dx * s + dz * c]; };

// a column at (u, v) from y0, h high, r thick: its base, the shaft, the capital in its order
// ('corinthian', 'ionic'), the abacus
function column(kit, u, v, y0, h, r, shaft, order = 'corinthian', cap = MARBLE) {
  kit.add(new THREE.CylinderGeometry(r * 1.3, r * 1.45, r * 0.9, 12), cap, u, y0 + r * 0.45, v);
  const top = y0 + h - r * (order === 'ionic' ? 0.9 : 1.8);
  kit.add(new THREE.CylinderGeometry(r * 0.86, r, top - y0 - r * 0.9, 12), shaft, u, (y0 + r * 0.9 + top) / 2, v);
  if (order === 'ionic') {
    kit.box(r * 2.9, r * 0.6, r * 1.5, cap, u, top + r * 0.3, v);
    for (const k of [-1, 1]) kit.add(new THREE.CylinderGeometry(r * 0.42, r * 0.42, r * 1.5, 10).rotateX(Math.PI / 2), cap, u + k * r * 1.25, top + r * 0.2, v);
  } else kit.add(new THREE.CylinderGeometry(r * 1.45, r * 0.88, r * 1.5, 12), cap, u, top + r * 0.75, v);
  kit.box(r * 2.8, r * 0.3, r * 2.8, cap, u, y0 + h - r * 0.15, v);
}
// a flat outline [[u, v], ...] stood up from y0 to y1
function block(kit, pts, y0, y1, hex) {
  const shape = new THREE.Shape(pts.map(([u, v]) => new THREE.Vector2(u, -v)));
  return kit.add(new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false }).rotateX(-Math.PI / 2), hex, 0, y0, 0);
}
// letters of an inscription standing out of a face at v, centred on u, their tops at y
function letters(kit, text, u, v, y, size, hex) {
  const step = size * 0.78, u0 = u - ((text.length - 1) * step) / 2;
  [...text].forEach((ch, i) => { if (ch !== ' ') kit.box(size * 0.55, size, 0.12, hex, u0 + i * step, y - size / 2, v); });
}
// an entablature beam from (u0, v0) to (u1, v1), from y0 to y1, its cornice standing out
function beam(kit, u0, v0, u1, v1, y0, y1, hex = MARBLE) {
  kit.box(u1 - u0, y1 - y0 - 0.7, v1 - v0, hex, (u0 + u1) / 2, (y0 + y1 - 0.7) / 2, (v0 + v1) / 2);
  kit.box(u1 - u0 + 1, 0.7, v1 - v0 + 1, shade(hex, -0.05), (u0 + u1) / 2, y1 - 0.35, (v0 + v1) / 2);
}
const circle = (r, n = 32, cu = 0, cv = 0) => Array.from({ length: n }, (_, k) => [cu + r * Math.cos((k / n) * 2 * Math.PI), cv + r * Math.sin((k / n) * 2 * Math.PI)]);
// a monument of this file: its middle, turn, how far it reaches, the ground it stands in for and
// what riders bump into, all in its own metres
const monument = (id, name, X, Z, turn, reach, area, foot, make) => ({
  id, name, x: X, z: Z, turn, reach, area: area.map(p => onMap(X, Z, turn, p)), foot: foot.map(p => onMap(X, Z, turn, p)), make,
});

// The Curia Iulia: its front to +v on the Forum, 33 m across with its buttresses and 38 deep
function curia() {
  const kit = new Kit(), H = 26, path = linePath(-14, 0, 14, 0), s = u => u + 14;
  // the front: the door up its steps, the three windows over it, cut through a skin of brick
  const door = [[s(-2.5), 3], [s(2.5), 3], [s(2.5), 12], [s(-2.5), 12]];
  const windows = [-6.6, 0, 6.6].map(u => archRing(s(u), 3.6, 16.2, 23.4, 8));
  wall(kit, path, [[0, 0], [28, 0], [28, H], [0, H]], { holes: [door, ...windows], o0: 0, o1: 1.4, hex: BRICK });
  kit.box(28, H, 32.4, BRICK2, 0, H / 2, -17.6);
  kit.box(5, 9, 0.3, BRONZE, 0, 7.5, -1.2);
  kit.box(0.15, 9, 0.4, shade(BRONZE, 0.2), 0, 7.5, -1.1);
  kit.box(6.8, 10.6, 0.5, TRAV, 0, 7.3, 0.1);
  for (const u of [-6.6, 0, 6.6]) kit.box(3.6, 7, 0.2, '#3f3a33', u, 19.8, -1.3);
  // the stucco that once covered the brick, left on its foot, and the cornice on its brackets
  for (const k of [-1, 1]) kit.box(9.4, 13.8, 0.2, '#cdbfa6', k * 9, 6.9, 0.1);
  kit.box(29.6, 0.9, 1.6, TRAV, 0, H + 0.45, -0.4);
  for (let u = -13.5; u <= 13.5; u += 1.5) kit.box(0.4, 0.5, 0.9, TRAV, u, H - 0.25, 0.2);
  // the gable over the front and the roof of tiles back from it
  const gable = 5.4, slope = Math.atan2(gable, 14.6), run = Math.hypot(gable, 14.6);
  wall(kit, path, [[s(-14.6), H + 0.9], [s(14.6), H + 0.9], [s(0), H + 0.9 + gable]], { o0: 0.3, o1: 33.6, hex: BRICK });
  for (const k of [-1, 1]) {
    kit.box(run + 0.6, 0.7, 1.4, TRAV, (k * 14.6) / 2, H + 0.9 + gable / 2 + 0.25, -0.2, 0, 0, -k * slope);
    kit.box(run + 0.8, 0.4, 34.4, '#9a5a3d', (k * 14.6) / 2, H + 0.9 + gable / 2 + 0.3, -17, 0, 0, -k * slope);
  }
  // the buttresses at its corners, and the high windows down its sides
  for (const k of [-1, 1]) {
    for (const v of [-1.3, -32.6]) kit.box(2.6, H - 3, 2.6, BRICK2, k * 15.3, (H - 3) / 2, v);
    for (const v of [-9, -17, -25]) kit.box(0.2, 6.4, 3.2, '#3f3a33', k * 14.05, 20, v);
  }
  // the steps up to the door
  for (let k = 0; k < 6; k++) kit.box(9 - k * 0.2, 0.5 * (k + 1), 4.5 - k * 0.75, TRAV, 0, 0.25 * (k + 1), 0.25 + (4.5 - k * 0.75) / 2);
  return kit.mesh(kitMat(0.92));
}

// The Arco di Settimio Severo: 29 m across and 26 high, its long axis the map's
function severo() {
  const kit = new Kit(), W = 29.1, F = 5.9, path = linePath(-W / 2, 0, W / 2, 0), s = u => u + W / 2;
  const MID = { w: 8.8, crown: 15 }, SIDE = { w: 3.9, crown: 9.6, at: 9.4 }, PED = 4.6, ENT = [17.6, 20.1], TOP = 26.1;
  const holes = [archRing(s(0), MID.w, 0, MID.crown, 14), ...[-1, 1].map(k => archRing(s(k * SIDE.at), SIDE.w, 0, SIDE.crown))];
  wall(kit, path, [[0, 0], [W, 0], [W, ENT[0]], [0, ENT[0]]], { holes, o0: -F, o1: F, hex: MARBLE2 });
  for (const side of [-1, 1]) {
    const face = side * F;
    for (const u of [-12.6, -5.9, 5.9, 12.6]) {
      kit.box(2.4, PED, 2.4, MARBLE, u, PED / 2, face + side * 1.3);
      kit.box(2.2, PED - 1.2, 0.1, shade(MARBLE, -0.1), u, PED / 2, face + side * 2.52); // the reliefs of captives on the pedestals
      column(kit, u, face + side * 1.3, PED, ENT[0] - PED, 0.68, MARBLE);
      kit.box(2.6, ENT[1] - ENT[0], 2.8, MARBLE, u, (ENT[0] + ENT[1]) / 2, face + side * 1.2);
    }
    // the big reliefs of the Parthian wars over the side arches, the Victories over the middle one
    for (const k of [-1, 1]) {
      kit.box(6, 5.2, 0.25, shade(MARBLE2, -0.08), k * SIDE.at, 12.6, face + side * 0.12);
      kit.box(2.4, 1.6, 0.3, MARBLE, k * 2.9, 14.6, face + side * 0.15, 0, 0, -k * 0.45);
    }
    letters(kit, 'IMP CAES LVCIO SEPTIMIO', 0, face + side * 0.06, 25, 0.9, '#7d7464');
    for (let line = 0; line < 4; line++) {
      const y = 24.2 - line * 1.05, half = 9.5 - (line === 3 ? 3 : 0);
      kit.box(2 * half, 0.5, 0.15, '#7d7464', 0, y, face + side * 0.06);
    }
  }
  // the entablature along it and the attic over it, its cornice
  kit.box(W + 0.6, ENT[1] - ENT[0], 2 * F + 0.6, MARBLE, 0, (ENT[0] + ENT[1]) / 2, 0);
  kit.box(W, TOP - 0.8 - ENT[1], 2 * F, MARBLE2, 0, (TOP - 0.8 + ENT[1]) / 2, 0);
  kit.box(W + 0.8, 0.8, 2 * F + 0.8, MARBLE, 0, TOP - 0.4, 0);
  // the steps down to the old level of the Forum on its east side
  kit.box(W + 2, 0.5, 2 * F + 3, TRAV, 0, 0.25, 0);
  return kit.mesh(kitMat(0.9));
}

// The Tempio di Saturno: its front of six columns to -v, two more going back at the corners
function saturno() {
  const kit = new Kit(), P = 8.5, H = 13.75, R = 0.9, FRONT = [-11.84, -7.1, -2.37, 2.37, 7.1, 11.84];
  // the podium: tuff, the travertine courses round it, the core where its facing is gone
  block(kit, [[-14, -1.8], [14, -1.8], [14, 9], [9, 16], [4, 32], [-9, 32], [-14, 20]], 0, P - 0.7, TUFF);
  kit.box(28.6, 0.7, 11.4, TRAV, 0, P - 0.35, 3.8);
  for (let y = 1.6; y < P - 1; y += 1.6) kit.box(28.2, 0.3, 0.2, shade(TUFF, 0.08), 0, y, -1.9);
  kit.box(2.4, 3, 0.2, '#3d3830', 4, 1.5, -1.9); // the door of the treasury in its front
  for (const u of FRONT) column(kit, u, 0, P, H, R, '#8f8b86', 'ionic', MARBLE);
  for (const u of [-11.84, 11.84]) column(kit, u, 4.6, P, H, R, '#9e7266', 'ionic', MARBLE);
  // the entablature on them: along the front, and back over the two corner columns
  const y0 = P + H, y1 = y0 + 3.3;
  beam(kit, -13, -1.1, 13, 1.1, y0, y1);
  for (const k of [-1, 1]) beam(kit, k * 11.84 - 1.1, 1.1, k * 11.84 + 1.1, 5.7, y0, y1);
  letters(kit, 'SENATVS POPVLVSQVE ROMANVS', 0, -1.17, y0 + 2.2, 0.62, '#6f685b');
  letters(kit, 'INCENDIO CONSVMPTVM RESTITVIT', 0, -1.17, y0 + 1.2, 0.62, '#6f685b');
  return kit.mesh(kitMat(0.9));
}

// The Tempio di Vespasiano: the corner column at the middle, one more along its front (-u), one
// along its side (+v), its front to -v
function vespasiano() {
  const kit = new Kit(), P = 2, H = 19, R = 1;
  block(kit, [[-7.5, -2.2], [2.4, -2.2], [2.4, 7.4], [-7.5, 7.4]], 0, P, TUFF);
  for (const [u, v] of [[0, 0], [-4.6, 0], [0, 4.6]]) column(kit, u, v, P, H, R, MARBLE);
  const y0 = P + H, y1 = y0 + 3.8;
  beam(kit, -6, -1.3, 1.4, 1.3, y0, y1);
  beam(kit, -1.3, 1.3, 1.3, 6, y0, y1);
  // the frieze of the instruments of sacrifice along its front
  for (let u = -5.4; u < 1; u += 1.3) kit.box(0.9, 0.9, 0.12, shade(MARBLE, -0.1), u, y0 + 1.9, -1.36);
  return kit.mesh(kitMat(0.9));
}

// The Colonna di Foca on its steps
function foca() {
  const kit = new Kit();
  for (let k = 0; k < 6; k++) kit.box(9.6 - k * 1.1, 0.58, 9.6 - k * 1.1, k % 2 ? '#8d7f6b' : '#968874', 0, 0.29 + k * 0.58, 0);
  kit.box(3.6, 3.2, 3.6, MARBLE, 0, 3.48 + 1.6, 0);
  kit.box(4, 0.5, 4, MARBLE2, 0, 3.48 + 3.45, 0);
  column(kit, 0, 0, 7.2, 17, 0.75, MARBLE);
  return kit.mesh(kitMat(0.9));
}

// The Tempio dei Dioscuri: its three columns down its east side, on the core of its podium (the
// map's outline of it), the temple's front to -v
const CASTOR = frame(764.7, 993.8, -0.4257);
const CASTOR_P = [[740.7, 981.6], [747, 984.6], [748.9, 980.5], [742.6, 977.6], [747.5, 967.2], [765.6, 975.6], [760.9, 985.6], [754.4, 982.7], [752.9, 985.9],
  [759.6, 989], [763.9, 991], [765.7, 987.2], [769.4, 988.9], [763.8, 1000.9], [756.4, 997.5], [749.4, 1012.6], [730.4, 1003.8]].map(p => CASTOR(...p));
function castore() {
  const kit = new Kit(), P = 8.75, H = 15.6, R = 0.9, r = rng(23);
  block(kit, CASTOR_P, 0, P, CORE);
  for (let k = 0; k < 26; k++) {
    const [u, v] = CASTOR_P[k % CASTOR_P.length];
    kit.box(1 + r() * 3, 0.6 + r() * 1.6, 1 + r() * 3, shade(CORE, r() * 0.1 - 0.05), u * 0.85, P, v * 0.85 + r() * 2);
  }
  const cols = [[766.4, 990], [764.7, 993.8], [763, 997.5]].map(p => CASTOR(...p));
  for (const [u, v] of cols) {
    kit.box(2.6, 0.8, 2.6, MARBLE2, u, P + 0.4, v);
    column(kit, u, v, P + 0.8, H, R, MARBLE);
  }
  // their piece of entablature, its cornice of lions' heads and leaves standing out on both sides
  const y0 = P + 0.8 + H, [u] = cols[1], v0 = Math.min(...cols.map(c => c[1])) - 1.6, v1 = Math.max(...cols.map(c => c[1])) + 1.6;
  kit.box(2.6, 2.8, v1 - v0, MARBLE, u, y0 + 1.4, (v0 + v1) / 2);
  kit.box(3.6, 0.9, v1 - v0 + 0.6, MARBLE2, u, y0 + 3.25, (v0 + v1) / 2);
  return kit.mesh(kitMat(0.9));
}

// The Tempio di Vesta: round, its podium all round, the rebuilt piece of it on its west side
function vesta() {
  const kit = new Kit(), R = 6.8, P = 2.3, H = 8.2, A0 = -2.142, A1 = -2.89;
  kit.add(new THREE.CylinderGeometry(7.6, 7.8, P, 32), CORE, 0, P / 2, 0);
  kit.add(new THREE.CylinderGeometry(7.7, 7.7, 0.4, 32), TRAV, 0, P - 0.2, 0);
  const at = (a, r) => [r * Math.cos(a), r * Math.sin(a)];
  for (let k = 0; k < 4; k++) {
    const [u, v] = at(A0 + ((A1 - A0) * k) / 3, R);
    column(kit, u, v, P, H, 0.42, MARBLE);
  }
  // the piece of the cella's wall behind them, and the entablature over them
  const ring = (r0, r1, a0, a1, y0, y1, hex, n = 10) => {
    const pts = [];
    for (let k = 0; k <= n; k++) pts.push(at(a0 + ((a1 - a0) * k) / n, r1));
    for (let k = n; k >= 0; k--) pts.push(at(a0 + ((a1 - a0) * k) / n, r0));
    block(kit, pts, y0, y1, hex);
  };
  ring(4.4, 5.3, A0 + 0.15, A1 - 0.15, P, P + H - 0.4, TRAV);
  ring(5.6, 7.4, A0 + 0.12, A1 - 0.12, P + H, P + H + 1.5, MARBLE);
  ring(5.4, 7.7, A0 + 0.12, A1 - 0.12, P + H + 1.5, P + H + 1.9, MARBLE2);
  return kit.mesh(kitMat(0.9));
}

// The Tempio di Antonino e Faustina: the portico's front to +v up its steps, the church's front
// behind it at -v
function antonino() {
  const kit = new Kit(), P = 4.5, H = 21, R = 1.05, CIPOLLINO = '#b4b9a4', D = 10.7;
  kit.box(25.4, P, D + 1.6, TUFF, 0, P / 2, -D / 2 + 0.3);
  for (let k = 0; k < 9; k++) kit.box(14, 0.5 * (k + 1), 7.2 - k * 0.8, TRAV, 0, 0.25 * (k + 1), 0.9 + (7.2 - k * 0.8) / 2);
  const front = [-11.25, -6.75, -2.25, 2.25, 6.75, 11.25];
  for (const u of front) column(kit, u, -1.2, P, H, R, CIPOLLINO);
  for (const u of [-11.25, 11.25]) for (const v of [-5.7, -10.2]) column(kit, u, v, P, H, R, CIPOLLINO);
  // the entablature: the frieze of griffins and candelabra, the inscription, the cornice
  const y0 = P + H;
  kit.box(25.4, 1.6, D + 1.6, MARBLE2, 0, y0 + 0.8, -D / 2 + 0.3);
  kit.box(25.4, 1.6, D + 1.6, MARBLE, 0, y0 + 2.4, -D / 2 + 0.3);
  for (let u = -11; u <= 11; u += 2.2) kit.box(1.3, 1, 0.12, shade(MARBLE, -0.12), u, y0 + 2.4, 1.16);
  letters(kit, 'DIVO ANTONINO ET DIVAE FAVSTINAE', 0, 1.17, y0 + 1.45, 0.55, '#6f685b');
  kit.box(26.6, 0.8, D + 2.8, MARBLE, 0, y0 + 3.6, -D / 2 + 0.3);
  // the cella's front wall of peperino with San Lorenzo in Miranda's baroque front set in it:
  // pilasters, the door, the upper storey with its volutes and pediment
  kit.box(23, y0, 1.2, '#8f8676', 0, y0 / 2, -D - 0.6);
  kit.box(10, y0 - P, 0.3, '#eae2d2', 0, P + (y0 - P) / 2, -D + 0.1);
  kit.box(3, 6.5, 0.4, '#5a4a3a', 0, P + 3.25, -D + 0.3);
  for (const u of [-4.5, -1.8, 1.8, 4.5]) kit.box(0.9, y0 - P - 1, 0.5, '#f2ece0', u, P + (y0 - P) / 2, -D + 0.4);
  const top = y0 + 4;
  kit.box(10, 6.5, 1.2, '#eae2d2', 0, top + 3.25, -D - 0.2);
  for (const k of [-1, 1]) {
    kit.box(3.2, 1.4, 1, '#eae2d2', k * 6.2, top + 0.9, -D - 0.2, 0, 0, -k * 0.5);
    kit.box(1, 6.5, 0.6, '#f2ece0', k * 4.3, top + 3.25, -D + 0.3);
  }
  kit.box(2.2, 3, 0.3, '#5d564a', 0, top + 3.2, -D + 0.45);
  const slope = Math.atan2(2.8, 5.6), run = Math.hypot(2.8, 5.6);
  for (const k of [-1, 1]) kit.box(run + 0.4, 0.6, 1.4, '#f2ece0', (k * 5.6) / 2, top + 6.5 + 1.4, -D, 0, 0, -k * slope);
  kit.add(new THREE.ConeGeometry(0.4, 1.6, 6), '#f2ece0', 0, top + 10.4, -D);
  return kit.mesh(kitMat(0.9));
}

// The Tempio del Divo Romolo: the round hall, its front to +v
function romolo() {
  const kit = new Kit(), R = 8.9, H = 14.5;
  kit.add(new THREE.CylinderGeometry(R, R, H, 32), BRICK, 0, H / 2, 0);
  kit.add(new THREE.CylinderGeometry(R + 0.4, R + 0.4, 0.8, 32), TRAV, 0, H + 0.4, 0);
  kit.add(new THREE.SphereGeometry(R - 0.6, 24, 8, 0, 2 * Math.PI, 0, Math.PI / 2).scale(1, 0.62, 1), '#8a837a', 0, H + 0.8, 0);
  kit.add(new THREE.CylinderGeometry(1.4, 1.6, 1.8, 12), TRAV, 0, H + 0.8 + (R - 0.6) * 0.62 + 0.6, 0);
  // the door and its bronze leaves, the two porphyry columns and their entablature
  kit.box(5, 8.6, 0.6, MARBLE, 0, 4.3, R - 0.1);
  kit.box(3.2, 7, 0.4, '#5f5a3c', 0, 3.5, R + 0.15);
  for (const k of [-1, 1]) column(kit, k * 3.4, R + 0.9, 0, 7.8, 0.5, '#6e3d3b', 'corinthian', MARBLE);
  kit.box(8.4, 1.1, 2.6, MARBLE, 0, 8.35, R + 0.6);
  // the curved front's four niches
  for (const a of [-0.9, -0.55, 0.55, 0.9]) kit.box(2, 5, 0.4, '#5a4a3e', R * Math.sin(a), 4, R * Math.cos(a) + 0.1, 0, a, 0);
  return kit.mesh(kitMat(0.9));
}

// The Basilica di Massenzio's north aisle: along its north wall (u, from its west end), the nave to +v
function massenzio() {
  const kit = new Kit(), BAY = 38, U0 = -2.4, D = 27.4, BACK = 3.5, CROWN = 30.6, TOP = 33.5, r = rng(17);
  const L = 3 * BAY, path = linePath(U0, 0, U0 + L, 0); // its normal is to -v: o = -v
  // the three bays under their vaults, open to the nave: one block with its three arches cut through
  const holes = [0, 1, 2].map(k => archRing(BAY * k + BAY / 2, BAY - 7, 0, CROWN, 18));
  wall(kit, path, [[0, 0], [L, 0], [L, TOP], [0, TOP]], { holes, o0: -D, o1: -BACK, hex: BRICK });
  // the coffers of the vaults, rows of them round under each arch
  for (let k = 0; k < 3; k++) {
    const cu = U0 + BAY * k + BAY / 2, rad = (BAY - 7) / 2, spring = CROWN - rad;
    for (let a = 0.25; a < Math.PI - 0.2; a += 0.3) {
      for (let v = BACK + 2.5; v < D - 1; v += 3.2) {
        const x = cu + (rad - 0.05) * Math.cos(a), y = spring + (rad - 0.05) * Math.sin(a);
        kit.box(1.9, 0.12, 2.2, shade(BRICK, -0.18), x, y, v, 0, 0, a - Math.PI / 2);
      }
    }
  }
  // the north wall behind them, its windows in two rows; the apse in the middle bay
  const windows = [];
  for (const k of [0, 2]) for (const du of [-9, 0, 9]) for (const [y0, y1] of [[4, 11], [18, 26]]) windows.push(archRing(BAY * k + BAY / 2 + du, 4.2, y0, y1, 8));
  wall(kit, path, [[0, 0], [L, 0], [L, TOP - 1], [0, TOP - 1]], { holes: windows, o0: -BACK, o1: 0, hex: BRICK2 });
  const apse = new THREE.CylinderGeometry(12.2, 12.2, 24, 20, 1, false, Math.PI / 2, Math.PI);
  kit.add(apse, BRICK2, U0 + BAY * 1.5, 12, 0.2);
  kit.add(new THREE.SphereGeometry(12.2, 16, 6, Math.PI, Math.PI, 0, Math.PI / 2).scale(1, 0.5, 1), shade(BRICK2, -0.1), U0 + BAY * 1.5, 24, 0.2);
  // the end walls, and the broken top of it all
  kit.box(3, TOP, D, BRICK2, U0 - 1.5, TOP / 2, D / 2);
  kit.box(7.4, TOP - 3, D - 2, BRICK2, U0 + L + 3.7, (TOP - 3) / 2, D / 2 + 1);
  for (let k = 0; k < 40; k++) kit.box(2 + r() * 5, 0.6 + r() * 2.4, 3 + r() * 8, shade(BRICK, r() * 0.1 - 0.06), U0 + r() * L, TOP + 0.3, 2 + r() * (D - 6));
  return kit.mesh(kitMat(0.95));
}

const MAX = { X: 992.2, Z: 908.1, TURN: -0.4243, BAY: 38, U0: -2.4, D: 27.4 };
const piers = [0, 1, 2, 3].map(k => rect(MAX.U0 + MAX.BAY * k - 3.5, 3, MAX.U0 + MAX.BAY * k + 3.5, MAX.D));

const STANDING = [
  monument('curia-iulia', 'Curia Iulia', 712.6, 823.45, -0.864, 70, [rect(-18, -40, 18, 6)], [rect(-16.6, -34.4, 16.6, 0.4), rect(-4.6, 0, 4.6, 4.8)], curia),
  monument('arco-di-settimio-severo', 'Arco di Settimio Severo', 658.9, 829.2, 0.9356, 60, [rect(-16, -8, 16, 8)],
    [[-14.55, -11.35], [-7.45, -4.4], [4.4, 7.45], [11.35, 14.55]].map(([a, b]) => rect(a, -8.6, b, 8.6)), severo),
  monument('tempio-di-saturno', 'Tempio di Saturno', 603.15, 874.35, -0.6177, 60, [rect(-15, -3, 15, 33)], [[[-14, -1.8], [14, -1.8], [14, 9], [9, 16], [4, 32], [-9, 32], [-14, 20]]], saturno),
  monument('tempio-di-vespasiano', 'Tempio di Vespasiano', 584.3, 858.6, -2.178, 50, [rect(-8, -3, 3, 8)], [rect(-7.5, -2.2, 2.4, 7.4)], vespasiano),
  monument('colonna-di-foca', 'Colonna di Foca', 670.2, 882.9, 0, 50, [rect(-9, -5, 7, 9)], [rect(-4.8, -4.8, 4.8, 4.8)], foca),
  monument('tempio-dei-dioscuri', 'Tempio dei Dioscuri', 764.7, 993.8, -0.4257, 60, [CASTOR_P, rect(-1.5, -5, 1.5, 5)], [CASTOR_P], castore),
  monument('tempio-di-vesta', 'Tempio di Vesta', 810.5, 986.5, 0, 40, [circle(8.6)], [circle(7.8)], vesta),
  monument('tempio-di-antonino-e-faustina', 'Tempio di Antonino e Faustina', 855, 933.75, -0.5598, 60, [rect(-14, -12, 14, 9)], [rect(-12.7, -11.6, 12.7, 0.2), rect(-7, 0, 7, 8.1)], antonino),
  monument('tempio-del-divo-romolo', 'Tempio del Divo Romolo', 915.8, 960.3, -0.4115, 50, [circle(10.5)], [circle(8.9), rect(-4.4, 8, 4.4, 10.8)], romolo),
  monument('basilica-di-massenzio', 'Basilica di Massenzio', MAX.X, MAX.Z, MAX.TURN, 110, [rect(-8, -3, 121, 29)],
    [rect(MAX.U0 - 3, 0, MAX.U0 + 3 * MAX.BAY + 7.4, 3.5), ...piers, rect(MAX.U0 + 3 * MAX.BAY, 3, MAX.U0 + 3 * MAX.BAY + 7.4, MAX.D)], massenzio),
];

// The rest of the Forum's ruins: every plain building of the map in the valley of the Forum (a ring
// round it, from the Tabularium's foot to the Basilica di Massenzio and the Palatine's) that is
// not one of the monuments above, a church or a shelter, stood up as a ruin on its outline.
const SITE = [[552, 860], [600, 808], [660, 808], [700, 780], [760, 800], [860, 860], [950, 880], [1000, 905], [1120, 955], [1110, 1000],
  [1000, 1040], [930, 1075], [800, 1065], [700, 1040], [600, 990], [560, 930]];
function within(x, z, ring) {
  let c = false;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    if ((ring[i + 1] > z) !== (ring[j + 1] > z) && x < ((ring[j] - ring[i]) * (z - ring[i + 1])) / (ring[j + 1] - ring[i + 1]) + ring[i]) c = !c;
  }
  return c;
}
const centre = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
const site = SITE.flat(), taken = STANDING.flatMap(mo => mo.area);
const RUINS = MAP.buildings.filter(b => ['yes', 'ruins', 'temple'].includes(b.k) && !b.h && !b.shop && within(...centre(b.p), site) && !taken.some(r => within(...centre(b.p), r))).map(b => b.p);
const RX = 820, RZ = 930; // the middle of the Forum

function ruins() {
  const kit = new Kit();
  for (const p of RUINS) {
    const pts = [];
    let area = 0, edge = 0;
    for (let k = 0; k < p.length; k += 2) {
      const j = (k + 2) % p.length;
      pts.push([p[k] - RX, p[k + 1] - RZ]);
      area += p[k] * p[j + 1] - p[j] * p[k + 1];
      edge += Math.hypot(p[j] - p[k], p[j + 1] - p[k + 1]);
    }
    area = Math.abs(area) / 2;
    const r = rng(Math.round(Math.abs(p[0] * 31 + p[1] * 17)))(), thin = area / (edge * edge) < 0.035;
    // a stump of a column, a wall, a block of masonry, or the low podium of something bigger
    const [h, hex] = area < 8 ? [1.2 + 2.6 * r, r < 0.5 ? MARBLE : TRAV] : thin ? [2.4 + 4 * r, r < 0.6 ? BRICK : TUFF] : area < 150 ? [1.8 + 2.6 * r, r < 0.5 ? BRICK2 : TUFF] : [1.4 + 1.4 * r, CORE];
    block(kit, pts.map(([u, v]) => [u, v]), 0, h, shade(hex, r * 0.08 - 0.04));
  }
  return kit.mesh(kitMat(0.95));
}

// Each ruin stands in for its building of the map (area: a little square round the building's
// middle, which is how the map's buildings are matched, even an L-shaped one's that lies outside
// its outline), and riders bump into its outline (foot).
const dot = p => { const [x, z] = centre(p); return [x - 0.3, z - 0.3, x + 0.3, z - 0.3, x + 0.3, z + 0.3, x - 0.3, z + 0.3]; };
export const FORO = [...STANDING, { id: 'foro-romano', name: 'Foro Romano', x: RX, z: RZ, turn: 0, reach: 300, area: RUINS.map(dot), foot: RUINS, make: ruins }];
