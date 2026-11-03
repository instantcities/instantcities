// The Markthal on the Binnenrotte (MVRDV, 2009-14), modelled by hand in place of the map's flat block
// of it, from its measurements and photos, in game metres (the real ones times 1.25), on the map's
// outline: 120 m long, 70 m wide and 40 m high (150 by 87.5 by 50 here):
//   the horseshoe arch of 228 flats, its skin of grey stone with its grid of square windows running
//     up one side, over the top and down the other
//   inside, Arno Coenen's Hoorn des Overvloeds over the whole vault: fruit, vegetables, flowers and
//     insects as big as houses against the sky, with the flats' windows looking down through it
//   the two ends closed by walls of glass hung on a net of steel cables, with a door in each
//   the market's stalls in two rows down the hall
// Riders ride in through the doors in the glass ends, under the painted vault, and bump into the
// stalls and the arch's feet. The model's own metres: u along the hall (towards the Blaak's east
// end), v across it, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, sweep, wall, onMap, rect } from '../core/js/arcade.js';

const X = 157.4, Z = -94.9, TURN = -2.849;
const HU = 74, HV = 43.5, H = 50, SIDE = 12, TOP = 10, N = 2.6; // half its length and width, its height, how deep the flats are at the feet and at the top, how square the arch is
const DOOR = 5; // half the width of the doors in the glass ends
const STONE = '#a7a6a1', STONE2 = '#8f8e8a', WIN = '#2a3138', FRAME = '#d6d4cf', GLASS = '#8aa6b8', CABLE = '#dfe3e6', SKY = '#4f9ccc';
const PAINT = ['#4f9ccc', '#6bb3d9', '#3d86b8', '#4f9ccc', '#e8742a', '#d93b2b', '#f2c12e', '#5aa83c', '#8a3f8f', '#f08fb0', '#7bc96b', '#e3502f', '#f6dd6b'];

// a point of the arch's outline, a superellipse a wide and b high, at angle t (0 at the right foot),
// and its outward normal
function arch(a, b, t) {
  const c = Math.cos(t), s = Math.sin(t), e = 2 / N;
  const o = a * Math.sign(c) * Math.abs(c) ** e, y = b * Math.abs(s) ** e;
  const no = (Math.sign(o) * Math.abs(o / a) ** (N - 1)) / a, ny = Math.abs(y / b) ** (N - 1) / b, l = Math.hypot(no, ny) || 1;
  return { o, y, no: no / l, ny: ny / l };
}

// a thin plate on the arch's face at u along the hall and angle t, w by h, standing off it by `off`
// (outward when positive) and `thick` thick, its face along the normal
function plate(kit, a, b, u, t, w, h, off, thick, hex) {
  const p = arch(a, b, t);
  // in the model's metres the arch's o runs along -z (linePath along +x has its normal to -z)
  kit.box(w, h, thick, hex, u, p.y + p.ny * off, -(p.o + p.no * off), Math.atan2(-p.ny, -p.no), 0, 0);
}

// the glass of the ends, which lets the painting be seen from the square
const GLASS_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });

export function markthal() {
  const kit = new Kit(), pane = new Kit(), path = linePath(-HU, 0, HU, 0), M = 64;
  // the arch: its outer skin, then back along the inside of the vault
  const outer = Array.from({ length: M + 1 }, (_, k) => arch(HV, H, (k / M) * Math.PI)).map(p => [p.o, p.y]);
  const inner = Array.from({ length: M + 1 }, (_, k) => arch(HV - SIDE, H - TOP, Math.PI - (k / M) * Math.PI)).map(p => [p.o, p.y]);
  sweep(kit, path, 0, 2 * HU, [...outer, ...inner], STONE, { step: 2 * HU }); // (s runs from 0 at u = -HU)
  // the windows in their grid on the outside: storeys up the sides, rows over the top
  const len = Math.PI, rows = 34, cols = 30;
  for (let r = 1; r < rows; r++) {
    const t = (r / rows) * len;
    for (let k = 0; k < cols; k++) {
      const u = -HU + 2.5 + ((k + 0.5) * (2 * HU - 5)) / cols;
      plate(kit, HV, H, u, t, 2.9, 2.9, 0.05, 0.3, FRAME);
      plate(kit, HV, H, u, t, 2.3, 2.3, 0.2, 0.2, WIN);
    }
  }
  // the ends of the arch: a frame of darker stone round the glass
  const frame = [...outer.map(([o, y]) => [o * 1.008, y * 1.008]), ...arcInner(0.6)];
  sweep(kit, path, -0.3, 1, frame, STONE2, { step: 5 });
  sweep(kit, path, 2 * HU - 1, 2 * HU + 0.3, frame, STONE2, { step: 5 });
  // the painting inside: tiles of colour over the whole vault, and the flats' windows through it
  let seed = 17;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const vr = 30, vc = 36;
  for (let r = 0; r < vr; r++) {
    const t = ((r + 0.5) / vr) * Math.PI;
    for (let k = 0; k < vc; k++) {
      const u = -HU + ((k + 0.5) * 2 * HU) / vc, sky = rnd() < 0.42;
      plate(kit, HV - SIDE, H - TOP, u, t, (2 * HU) / vc + 0.05, 5, -0.15, 0.2, sky ? SKY : PAINT[Math.floor(rnd() * PAINT.length)]);
      if (rnd() < 0.18) plate(kit, HV - SIDE, H - TOP, u, t, 1.6, 1.6, -0.3, 0.15, WIN);
    }
  }
  // the glass ends on their net of cables, each with its door: the glass's outline in the end's
  // own s (0 at one foot, W at the other), the door cut up into it from the ground
  const W = 2 * (HV - SIDE);
  const glass = [...Array.from({ length: M + 1 }, (_, k) => arch(HV - SIDE, H - TOP, (k / M) * Math.PI)).map(p => [HV - SIDE + p.o, p.y]),
    [W / 2 - DOOR, 0], [W / 2 - DOOR, 5], [W / 2 + DOOR, 5], [W / 2 + DOOR, 0]];
  for (const su of [-1, 1]) {
    // s runs along -z from z = HV - SIDE, so s = HV - SIDE + o
    wall(pane, linePath(su * (HU - 0.3), HV - SIDE, su * (HU - 0.3), -(HV - SIDE)), glass, { o0: -0.15, o1: 0.15, hex: GLASS });
    const x = su * (HU - 0.05);
    for (let o = -(HV - SIDE) + 3; o < HV - SIDE - 1; o += 3) kit.rod([x, Math.abs(o) < DOOR ? 5 : 0, -o], [x, heightAt(o) - 0.2, -o], 0.06, CABLE, 4);
    for (let y = 5; y < H - TOP - 1; y += 3.5) kit.rod([x, y, -halfWidth(y)], [x, y, halfWidth(y)], 0.06, CABLE, 4);
  }
  // the stalls: two rows down the hall, each a counter under a roof
  for (const v of [-11, 11]) for (let k = 0; k < 9; k++) {
    const u = -48 + k * 12;
    kit.box(8, 2.6, 5, '#efe9df', u, 1.3, v).box(8.6, 0.3, 5.6, k % 2 ? '#3c3f44' : '#9b2f2a', u, 3.6, v);
    for (const [a, b] of [[-4, -2.5], [4, -2.5], [-4, 2.5], [4, 2.5]]) kit.box(0.15, 1, 0.15, '#3c3f44', u + a, 3, v + b);
  }
  const g = new THREE.Group(), glassy = pane.mesh(GLASS_MAT);
  glassy.castShadow = false;
  g.add(kit.mesh(kitMat(0.75, 0.05)), glassy);
  return g;
}

// the arch's inner outline backwards, a little in from the glass (for the dark frame round the ends)
function arcInner(by) {
  const M = 64;
  return Array.from({ length: M + 1 }, (_, k) => arch(HV - SIDE - by, H - TOP - by, Math.PI - (k / M) * Math.PI)).map(p => [p.o, p.y]);
}

// how high the inside of the arch reaches at o from the middle
function heightAt(o) {
  const a = HV - SIDE, b = H - TOP;
  return b * Math.max(0, 1 - Math.abs(o / a) ** N) ** (1 / N);
}

// how far either side of the middle the inside of the arch reaches at height y
function halfWidth(y) {
  const b = H - TOP, a = HV - SIDE, f = Math.min(1, y / b);
  return a * (1 - f ** N) ** (1 / N);
}

const feet = [rect(-HU, -HV, HU, -HV + SIDE), rect(-HU, HV - SIDE, HU, HV)];
const glass = [-1, 1].flatMap(su => [rect(su * HU - 0.6, -(HV - SIDE), su * HU + 0.6, -DOOR), rect(su * HU - 0.6, DOOR, su * HU + 0.6, HV - SIDE)]);
const stalls = [-11, 11].map(v => rect(-52.3, v - 2.8, 52.3, v + 2.8));

export const MARKTHAL = [{
  id: 'markthal', name: 'Markthal', x: X, z: Z, turn: TURN, reach: 160,
  area: [onMap(X, Z, TURN, rect(-HU - 4, -HV - 4, HU + 4, HV + 4))],
  paths: [onMap(X, Z, TURN, rect(-HU - 1, -HV, HU + 1, HV))], // the footways the map draws over the market's floor
  foot: [...feet, ...glass, ...stalls].map(r => onMap(X, Z, TURN, r)),
  make: markthal,
}];
