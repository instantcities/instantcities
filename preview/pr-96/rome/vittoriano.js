// The Vittoriano (the Altare della Patria, Giuseppe Sacconi, 1885-1935) on Piazza Venezia, modelled
// by hand in place of the map's stack of building parts, on their outlines and at their heights, in
// game metres (the real ones times 1.25), all in white Botticino marble:
//   the flight of steps up from the square, the two gilded groups of Thought and Action either side
//     of its foot, and the landing in front of
//   the Altare della Patria: the curved wall of reliefs with the goddess Roma in her niche of gold
//     in the middle, the tomb of the Unknown Soldier at her feet, and the stairs either side up to
//     the terrace of the equestrian statue of Victor Emmanuel II in bronze, on its high pedestal
//   the great base behind, and on it the long curved portico: sixteen Corinthian columns on their
//     stylobate, the attic over them with a statue of a region of Italy above each column
//   at its two ends the propylaea, temple fronts of four columns with PATRIAE UNITATI and CIVIUM
//     LIBERTATI over them, each crowned with its bronze quadriga driven by a winged Victory
// Riders bump into it from the foot of its steps.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 495, Z = 617, TURN = 0.2975; // the middle of the portico, and the portico turned from east (its front to -v)
const MARBLE = '#f1eee6', MARBLE2 = '#e2ddd0', MARBLE3 = '#d3cdbe', BRONZE = '#4a4f42', GOLD = '#c9a24e', DARK = '#6e6a60';
const TERRACE = 25, BASE = 31.3, FLOOR = 43.8, COLTOP = 65, ATTIC = 75, PROP = 68.8, PROPTOP = 77.5; // its levels

// the map's outlines, in the model's own metres (u along the portico, v back from its front)
const BASE_P = [[78.9, 53.5], [45.4, 52], [47.5, 26.2], [-3.4, 25.7], [-53.3, 23.3], [-54.1, 31], [-61.2, 37.6], [-86.8, 32.5], [-87.4, -17.6], [-80.5, -17.7],
  [-80.5, -47.5], [-72.2, -47.4], [-72.1, -52.7], [-42.7, -52.7], [-42.7, -46.4], [44.4, -45.5], [44.5, -55.6], [70.7, -56.2], [70.8, -44.6], [78.4, -44.5],
  [78.3, -12.9], [93.9, -12.6], [94.5, 16.1], [91.1, 16.2], [91.3, 50.7], [78.9, 50.5]];
const ALTAR_P = [[-21.3, -67.4], [-21.3, -70.2], [-18.1, -70.4], [-14.9, -73.7], [-10.9, -75.5], [-7, -77], [0.1, -78.2], [8.4, -76.5], [11.7, -75.4], [18, -70.6], [20.7, -70.7], [20.6, -66.4], [20.4, -45.8], [-21.7, -46.4]];
const LANDING_P = [[23.6, -110], [-24.1, -110.1], [-30.5, -108.5], [-36.1, -105.4], [-40, -102.2], [-42.3, -99.2], [-46.1, -99.3], [-46.4, -64.9], [-42.7, -65], [-42.7, -67.3],
  [20.6, -66.4], [44.7, -66.3], [44.7, -63.9], [46.8, -64], [46.8, -99.4], [41.2, -99.4], [37, -104.4], [30.2, -108.6]];
const WINGS = [[[-70.6, -52.8], [-70.7, -99.2], [-46.1, -99.3], [-42.7, -52.7]], [[70.7, -56.2], [70.4, -99.3], [46.8, -99.4], [44.5, -55.6]]]; // the low terraces either side
const STYLOBATE_P = [[42.9, -7.7], [25.6, -4], [4.7, -1.9], [-4.7, -2.1], [-25.3, -4.1], [-43.7, -9.1], [-42.9, 13.9], [-20.4, 13.5], [0.5, 14.4], [17.3, 13.7], [43.2, 14.8]];
const COLS = [-38.6, -32.9, -26.5, -21.1, -15.5, -9.5, -3.9, 1.4, 6.1, 11.1, 16.3, 21.6, 26.3, 30.7, 35.3, 40.1];
const curve = u => 2.1 - 0.00355 * (u - 0.75) ** 2; // the portico's columns' line, bowing back in the middle

// a flat outline [[u, v], ...] stood up from y0 to y1
function block(kit, pts, y0, y1, hex) {
  const shape = new THREE.Shape(pts.map(([u, v]) => new THREE.Vector2(u, -v)));
  return kit.add(new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false }).rotateX(-Math.PI / 2), hex, 0, y0, 0);
}
// a flight of n steps across u0..u1, from v0 (at y0) to v1 (at y1)
function stairs(kit, u0, u1, v0, v1, y0, y1, n, hex) {
  for (let k = 0; k < n; k++) {
    const a = v0 + ((v1 - v0) * k) / n, y = y0 + ((y1 - y0) * (k + 1)) / n;
    kit.box(u1 - u0, y - y0, Math.abs(v1 - a), shade(hex, k % 2 ? 0 : -0.03), (u0 + u1) / 2, (y0 + y) / 2, (a + v1) / 2);
  }
}
// a Corinthian column at (u, v) from y0 to y1, r thick
function column(kit, u, v, y0, y1, r, hex = MARBLE) {
  kit.add(new THREE.CylinderGeometry(r * 1.3, r * 1.4, 1.2, 12), MARBLE2, u, y0 + 0.6, v);
  kit.add(new THREE.CylinderGeometry(r * 0.88, r, y1 - y0 - 3.6, 12), hex, u, (y0 + 1.2 + y1 - 2.4) / 2, v);
  kit.add(new THREE.CylinderGeometry(r * 1.5, r * 0.9, 2.4, 12), MARBLE2, u, y1 - 1.2, v);
}
// a figure from its feet at (u, y, v), h high, in hex: a robe, the shoulders, the head
function figure(kit, u, y, v, h, hex, wings = false) {
  kit.add(new THREE.CylinderGeometry(h * 0.11, h * 0.17, h * 0.66, 8), hex, u, y + h * 0.33, v);
  kit.box(h * 0.32, h * 0.1, h * 0.16, hex, u, y + h * 0.66, v);
  kit.add(new THREE.SphereGeometry(h * 0.08, 8, 6), hex, u, y + h * 0.8, v);
  if (wings) for (const k of [-1, 1]) kit.box(h * 0.08, h * 0.5, h * 0.3, hex, u + k * h * 0.14, y + h * 0.78, v + h * 0.1, 0, 0, -k * 0.5);
}
// a horse at (u, y, v) facing -v, h high at the withers
function horse(kit, u, y, v, h, hex, ry = 0) {
  const g = new Kit();
  g.add(new THREE.CylinderGeometry(h * 0.28, h * 0.26, h * 1.1, 8).rotateX(Math.PI / 2), hex, 0, h * 0.78, 0);
  g.box(h * 0.24, h * 0.62, h * 0.3, hex, 0, h * 1.15, -h * 0.52, -0.5, 0, 0);
  g.box(h * 0.2, h * 0.22, h * 0.5, hex, 0, h * 1.42, -h * 0.75, 0.35, 0, 0);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.box(h * 0.1, h * 0.62, h * 0.1, hex, a * h * 0.15, h * 0.31, b * h * 0.4);
  const geo = g.geometry();
  geo.rotateY(ry);
  geo.translate(u, y, v);
  kit.pieces.push(geo);
}

export function vittoriano() {
  const kit = new Kit();
  // the steps up from the square, the landing, the low terraces either side and the groups on them
  stairs(kit, -24.1, 23.6, -132.4, -110, 0, 3.5, 10, MARBLE2);
  block(kit, LANDING_P, 0, 3.5, MARBLE2);
  for (const w of WINGS) {
    block(kit, w, 0, 7.5, MARBLE);
    const u = (w[0][0] + w[2][0]) / 2;
    kit.box(Math.abs(w[0][0] - w[2][0]) + 0.8, 0.8, 47, MARBLE3, u, 7.9, -76);
  }
  for (const k of [-1, 1]) {
    // Thought and Action, gilded bronze, on their pedestals at the foot of the steps
    kit.box(8, 9, 8, MARBLE, k * 23.6, 4.5, -107.6);
    kit.box(9, 1, 9, MARBLE2, k * 23.6, 9.5, -107.6);
    figure(kit, k * 23.6, 10, -107.6, 8.5, GOLD, true);
    figure(kit, k * 23.6 - 2, 10, -106, 5.5, GOLD);
    figure(kit, k * 23.6 + 2.2, 10, -108.8, 4.5, GOLD);
  }

  // the Altare della Patria: the curved wall of the altar, its frieze and the goddess Roma
  block(kit, ALTAR_P, 3.5, 17, MARBLE);
  block(kit, ALTAR_P.map(([u, v]) => [u, v + 1.2]), 17, TERRACE, MARBLE2);
  for (let k = -10; k <= 10; k++) {
    if (Math.abs(k) < 2) continue;
    const u = k * 1.85, v = -78.2 + 0.0056 * (u * 1.4) ** 2 + (Math.abs(u) > 14 ? (Math.abs(u) - 14) * 0.6 : 0);
    kit.box(1.7, 4.6, 0.25, k % 2 ? shade(GOLD, -0.12) : shade(MARBLE, -0.08), u, 11.5, v - 0.15);
  }
  kit.box(6.2, 11, 1.5, GOLD, 0, 9.3, -78.4);
  kit.box(7.4, 1, 2.2, MARBLE2, 0, 14.6, -78.6);
  figure(kit, 0, 6, -78.9, 7.5, MARBLE);
  // the tomb of the Unknown Soldier at her feet, and its two flames in their braziers
  kit.box(7, 2.2, 1.6, MARBLE3, 0, 4.6, -79.5);
  for (const k of [-1, 1]) {
    kit.add(new THREE.CylinderGeometry(0.7, 0.4, 1.6, 8), BRONZE, k * 6, 4.3, -80.5);
    kit.add(new THREE.ConeGeometry(0.45, 1.1, 6), '#f0a030', k * 6, 5.6, -80.5);
  }
  // the stairs either side of the altar up to the statue's terrace
  stairs(kit, -42.7, -21.3, -67.3, -46.4, 3.5, TERRACE, 18, MARBLE2);
  stairs(kit, 20.6, 44.7, -66.4, -45.8, 3.5, TERRACE, 18, MARBLE2);
  // the equestrian statue on its pedestal, the reliefs of the Italian cities round its foot
  kit.box(11, 6.3, 18, MARBLE, -0.6, TERRACE + 3.15, -60);
  kit.box(8.6, 7.5, 16.6, MARBLE2, -0.6, BASE + 3.75, -60);
  for (const k of [-1, 1]) kit.box(0.2, 3.4, 13, shade(MARBLE, -0.12), -0.6 + k * 4.35, BASE + 3.6, -60);
  kit.box(9.4, 0.9, 17.4, MARBLE, -0.6, BASE + 7.95, -60);
  horse(kit, -0.6, BASE + 8.4, -60, 9.2, BRONZE);
  kit.add(new THREE.CylinderGeometry(1.2, 1.6, 4.6, 8), BRONZE, -0.6, BASE + 8.4 + 11.4, -59.2);
  kit.add(new THREE.SphereGeometry(1, 8, 6), BRONZE, -0.6, BASE + 8.4 + 14.4, -59.4);
  kit.add(new THREE.CylinderGeometry(1.25, 1.25, 0.8, 8), BRONZE, -0.6, BASE + 8.4 + 15.3, -59.4);

  // the great base, its cornice, the stairs up its front to the portico
  block(kit, BASE_P, 0, BASE - 1.2, MARBLE);
  block(kit, BASE_P, BASE - 1.2, BASE, MARBLE2);
  for (let k = 0; k < 10; k++) kit.box(84, 0.5, 0.3, shade(MARBLE, -0.05), 0.9, 4 + k * 2.6, -46.3); // the courses of its front
  stairs(kit, -20, 22, -46, -26, TERRACE, BASE, 6, MARBLE2);
  stairs(kit, -36, 38, -24, -9, BASE, FLOOR, 12, MARBLE2);

  // the portico: its stylobate, the sixteen columns, the wall behind them, the attic and its statues
  block(kit, STYLOBATE_P, BASE, FLOOR, MARBLE);
  block(kit, STYLOBATE_P.map(([u, v]) => [u, Math.max(v, curve(u) + 3.5)]), FLOOR, COLTOP, MARBLE3);
  for (const u of COLS) column(kit, u, curve(u), FLOOR, COLTOP - 2.4, 1.3);
  const attic = STYLOBATE_P.map(([u, v]) => [u, Math.max(v, curve(u) - 2.2)]);
  block(kit, attic, COLTOP - 2.4, COLTOP, MARBLE2);
  block(kit, attic, COLTOP, ATTIC - 1, MARBLE);
  block(kit, attic.map(([u, v]) => [u * 1.01, v - 0.5]), ATTIC - 1, ATTIC, MARBLE2);
  for (const u of COLS) {
    kit.box(1.8, 3.2, 0.2, shade(MARBLE, -0.08), u, COLTOP + 4.5, curve(u) - 2.3); // the panels between the eagles
    figure(kit, u, ATTIC, curve(u) - 0.8, 4.8, MARBLE);
  }

  // the two propylaea, each on its base: four columns in front and the side ones, the attic with
  // its inscription, the steps of the quadriga's base, the quadriga
  for (const k of [-1, 1]) {
    const m = k * 57.4, w = 29.5; // its middle, and its width
    block(kit, [[m - w / 2, -13], [m + w / 2, -13], [m + w / 2, 16], [m - w / 2, 16]], BASE, FLOOR, MARBLE);
    stairs(kit, m - 11, m + 11, -33.3, -13, BASE, FLOOR, 12, MARBLE2);
    kit.box(w - 6, PROP - FLOOR, 22, MARBLE3, m, (FLOOR + PROP) / 2, 4); // the cella behind the columns
    for (const u of [-61.8, -53.1]) for (const v of [-21, -14.7]) column(kit, k * -u + (k > 0 ? -0.6 : 0), v, FLOOR, PROP - 3, 1.3);
    for (const v of [-9.8, -4.7, 0.6, 6.2]) column(kit, m + k * 11.6, v, FLOOR, PROP - 3, 1.2);
    for (const a of [-1, 1]) kit.box(2.6, PROP - FLOOR, 10.4, MARBLE, m + a * (w / 2 - 2.6), (FLOOR + PROP) / 2, -17.6); // the antae
    kit.box(w + 1, 3, 40, MARBLE2, m, PROP - 1.5, -3.5);
    kit.box(w + 1.6, PROPTOP - PROP, 41, MARBLE, m, (PROP + PROPTOP) / 2, -3.5);
    const words = k < 0 ? 'CIVIVM LIBERTATI' : 'PATRIAE VNITATI';
    [...words].forEach((ch, i) => { if (ch !== ' ') kit.box(0.9, 1.4, 0.15, GOLD, m + (i - (words.length - 1) / 2) * 1.35, PROP + 4.6, -24.1); });
    for (let s = 0; s < 4; s++) kit.box(24 - s * 4.5, 2.5, 24 - s * 4.5, s % 2 ? MARBLE2 : MARBLE, m, PROPTOP + 1.25 + s * 2.5, 2);
    // the quadriga: four horses abreast, the chariot behind them, Victory in it
    const top = PROPTOP + 10;
    for (let h = 0; h < 4; h++) horse(kit, m + (h - 1.5) * 2.1, top, -0.5, 3.6, BRONZE);
    kit.box(4.6, 2.6, 3, BRONZE, m, top + 1.6, 3.4);
    figure(kit, m, top + 2.5, 3.6, 6, BRONZE, true);
  }
  return kit.mesh(kitMat(0.85));
}

// It stands in for the map's parts of it (area), and riders bump into it from the foot of its steps
// (foot).
const ring = pts => onMap(X, Z, TURN, pts);
export const VITTORIANO = [{
  id: 'vittoriano', name: 'Vittoriano', x: X, z: Z, turn: TURN, reach: 220,
  area: [ring(rect(-96, -134, 96, 20)), ring(BASE_P)],
  foot: [ring(BASE_P), ring(ALTAR_P), ring(LANDING_P), ...WINGS.map(ring), ring(rect(-24.1, -132.4, 23.6, -109)), ...[-1, 1].map(k => ring(rect(k * 23.6 - 4, -111.6, k * 23.6 + 4, -103.6)))],
  make: vittoriano,
}];
