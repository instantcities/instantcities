// The Eiffel Tower (1887-89) on the Champ de Mars, modelled by hand in place of the map's stack of
// building parts, from its measurements, in game metres (the real ones times 1.25), on the map's
// outline of its four legs: a base 125 m square (156 here), the first floor at 57.6 m, the second at
// 115.7 m, the third at 276 m, the top at 300 m and the antennas up to 330 m. Puddled iron, in its
// brown paint:
//   the four legs, each a lattice box of four chords braced in crosses on every face, curving in
//     from their stone feet until they meet above the second floor
//   the four big arches between the legs under the first floor, in the plane of the outer faces
//   the first floor's gallery round an open middle, its frieze and its pavilions
//   the second floor's platform, the one shaft of lattice above it narrowing to the third floor's
//     closed cabin, and the lantern and antennas on top
//   the TDF transmitter's low pavilion beside the south leg
// Riders ride in under it between the legs and bump into the legs' feet.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = -4746.4, Z = -218.2, TURN = Math.PI / 4 + 0.018; // its middle, and its sides turned so a leg points north
const F1 = 72, F2 = 144.6, F3 = 345, TOP = 375, MAST = 412.5; // the floors, the top and the antennas
const IRON = '#7a6853', DARK = '#594b3c', LIGHT = '#8c7a63', STONE = '#c9bfab', GLASS = '#a7b8bf';

// how far out from the middle the legs' outer edges (W) and inner edges (I) stand at height y, along
// each side: the curve of the tower, from points measured on it, between them exponential
const OUT = [[0, 77], [36, 57], [F1, 42], [110, 30], [F2, 22.5], [250, 15], [F3, 10.5], [TOP, 6]];
const IN = [[0, 44], [36, 32], [F1, 22], [110, 10], [F2, 0]];
const curve = pts => y => {
  if (y <= pts[0][0]) return pts[0][1];
  for (let k = 1; k < pts.length; k++) {
    const [y0, a] = pts[k - 1], [y1, b] = pts[k];
    if (y <= y1) {
      const t = (y - y0) / (y1 - y0);
      return b > 0 && a > 0 ? a * Math.pow(b / a, t) : a + (b - a) * t;
    }
  }
  return pts.at(-1)[1];
};
const W = curve(OUT), I = curve(IN);

export function eiffel() {
  const kit = new Kit();
  const rod = (a, b, r, hex = IRON) => kit.rod(a, b, r, hex, 4);
  // a lattice box between two levels: its four corners at each, given as [u, v] at y0 and at y1,
  // with chords along the corners, a cross on every face and ties round the top
  const panel = (lo, hi, y0, y1, chord, brace) => {
    for (let k = 0; k < 4; k++) {
      const a0 = [lo[k][0], y0, lo[k][1]], a1 = [hi[k][0], y1, hi[k][1]];
      const b0 = [lo[(k + 1) % 4][0], y0, lo[(k + 1) % 4][1]], b1 = [hi[(k + 1) % 4][0], y1, hi[(k + 1) % 4][1]];
      rod(a0, a1, chord);
      rod(a0, b1, brace, DARK);
      rod(b0, a1, brace, DARK);
      rod(a1, b1, brace);
    }
  };
  const ring = (lo, hi, su, sv) => [[su * lo, sv * lo], [su * hi, sv * lo], [su * hi, sv * hi], [su * lo, sv * hi]];

  // the legs, up to the second floor, and their stone feet
  const LEGS = [0, 9, 18, 27, 36, 46, 56, 64, F1, 82, 93, 104, 116, 130, F2];
  for (const [su, sv] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) {
    for (let k = 0; k + 1 < LEGS.length; k++) {
      const y0 = LEGS[k], y1 = LEGS[k + 1];
      panel(ring(I(y0), W(y0), su, sv), ring(I(y1), W(y1), su, sv), y0, y1, 1.5 - y0 / 200, 0.45);
    }
    const m = (I(0) + W(0)) / 2, w = W(0) - I(0);
    kit.box(w + 2, 1.2, w + 2, STONE, su * m, 0.6, sv * m);
    kit.box(w, 0.6, w, shade(STONE), su * m, 1.5, sv * m);
  }

  // the four arches under the first floor, between the legs on each side, each a band of two arcs
  // with ties across it, and the struts from its crown up to the gallery
  const YS = 4, APEX = 54, R = I(YS) + 4;
  for (let side = 0; side < 4; side++) {
    const turn = (side * Math.PI) / 2, c = Math.cos(turn), s = Math.sin(turn);
    const at = (u, y, inset) => { const v = W(y) - inset; return [u * c + v * s, y, -u * s + v * c]; };
    const arc = (t, d) => [(R - d) * Math.cos(t), YS + (APEX - YS - d) * Math.sin(t)];
    const N = 24;
    for (let k = 0; k < N; k++) {
      const t0 = (k / N) * Math.PI, t1 = ((k + 1) / N) * Math.PI;
      for (const d of [0, 3.5]) {
        const [u0, y0] = arc(t0, d), [u1, y1] = arc(t1, d);
        rod(at(u0, y0, 1.5), at(u1, y1, 1.5), 1.3, LIGHT);
      }
      const [uo, yo] = arc(t1, 0), [ui, yi] = arc(t0, 3.5), [um, ym] = arc(t1, 3.5);
      rod(at(uo, yo, 1.5), at(ui, yi, 1.5), 0.45, IRON);
      rod(at(uo, yo, 1.5), at(um, ym, 1.5), 0.45, IRON);
    }
    // the spandrels: struts from the arch up to the gallery's beam
    for (let k = 3; k <= N - 3; k += 2) {
      const [u, y] = arc((k / N) * Math.PI, 0);
      if (y < F1 - 10) rod(at(u, y, 1.5), at(u, F1 - 8, 1.5), 0.4, DARK);
    }
  }

  // the first floor: its deck round the open middle, the frieze with the scientists' names (a band
  // of panels), the railing, and the pavilions on the deck
  const G1 = W(F1) + 3, G0 = I(F1) - 2;
  for (let side = 0; side < 4; side++) {
    const turn = (side * Math.PI) / 2;
    const put = (w, h, d, hex, u, y, v) => {
      const c = Math.cos(turn), s = Math.sin(turn);
      kit.box(w, h, d, hex, u * c + v * s, y, -u * s + v * c, 0, turn);
    };
    put(2 * G1, 1.2, G1 - G0, LIGHT, 0, F1 - 0.6, (G1 + G0) / 2);
    put(2 * G1, 7, 0.8, IRON, 0, F1 - 4.5, G1);
    for (let k = 0; k < 15; k++) put(2 * G1 / 15 - 1.4, 4.2, 0.4, DARK, -G1 + ((k + 0.5) / 15) * 2 * G1, F1 - 4.3, G1 + 0.5);
    put(2 * G1, 7, 0.8, DARK, 0, F1 - 4.5, G0);
    put(2 * G1, 1.4, 0.25, DARK, 0, F1 + 0.8, G1 - 0.2);
    put(28, 6.5, 8, '#6f6150', 0, F1 + 3.25, G1 - 9);
    put(26, 3.2, 8.2, GLASS, 0, F1 + 3.8, G1 - 9);
  }

  // the second floor: its platform, a band round it, the railing, and the cabin on it
  const G2 = W(F2) + 3.5;
  kit.box(2 * G2, 1.4, 2 * G2, LIGHT, 0, F2 - 0.7, 0);
  kit.box(2 * G2 + 0.6, 4.5, 2 * G2 + 0.6, IRON, 0, F2 - 3.6, 0);
  kit.box(26, 6, 26, '#6f6150', 0, F2 + 3, 0);
  kit.box(26.4, 2.6, 26.4, GLASS, 0, F2 + 3.6, 0);
  for (let side = 0; side < 4; side++) {
    const turn = (side * Math.PI) / 2, c = Math.cos(turn), s = Math.sin(turn);
    kit.box(2 * G2, 1.4, 0.25, DARK, G2 * s, F2 + 0.8, G2 * c, 0, turn);
  }

  // the shaft, one lattice box from the second floor to the third, with a tie every few panels
  const SHAFT = [];
  for (let y = F2; y < F3 - 1; y += y < 250 ? 13 : 11) SHAFT.push(y);
  SHAFT.push(F3);
  const sq = h => [[h, h], [-h, h], [-h, -h], [h, -h]];
  for (let k = 0; k + 1 < SHAFT.length; k++) {
    panel(sq(W(SHAFT[k])), sq(W(SHAFT[k + 1])), SHAFT[k], SHAFT[k + 1], 1.1 - k * 0.03, 0.38);
  }
  // the inner diagonals of the shaft, crossing it so it reads solid from afar
  for (let k = 0; k + 1 < SHAFT.length; k += 2) {
    const a = W(SHAFT[k]), b = W(SHAFT[k + 1]);
    rod([a, SHAFT[k], a], [-b, SHAFT[k + 1], -b], 0.3, DARK);
    rod([-a, SHAFT[k], a], [b, SHAFT[k + 1], -b], 0.3, DARK);
  }

  // the third floor: the closed cabin with its windows all round, the terrace over it and its rail
  const C3 = W(F3) + 1.5;
  kit.box(2 * C3, 1, 2 * C3, LIGHT, 0, F3 - 0.5, 0);
  kit.box(2 * C3 - 1, 8, 2 * C3 - 1, '#665848', 0, F3 + 4, 0);
  kit.box(2 * C3 - 0.6, 3.4, 2 * C3 - 0.6, GLASS, 0, F3 + 4.4, 0);
  kit.box(2 * C3 + 1, 0.8, 2 * C3 + 1, LIGHT, 0, F3 + 8.4, 0);

  // the lantern: a smaller lattice box up to the top, the lighthouse's drum and the antennas
  const L0 = F3 + 8.8, L1 = TOP - 6;
  panel(sq(8), sq(5), L0, L1, 0.7, 0.3);
  kit.box(10, 1, 10, LIGHT, 0, L1 + 0.5, 0);
  kit.add(new THREE.CylinderGeometry(3.2, 3.6, 5, 8), '#665848', 0, L1 + 3.5, 0);
  kit.add(new THREE.CylinderGeometry(3.4, 3.4, 1.6, 8), GLASS, 0, L1 + 3.6, 0);
  kit.add(new THREE.CylinderGeometry(1.4, 2.4, 4, 8), IRON, 0, TOP + 2, 0);
  kit.add(new THREE.CylinderGeometry(0.5, 1.2, MAST - TOP - 4, 6), '#d9d5cc', 0, (MAST + TOP + 4) / 2, 0);
  for (const y of [TOP + 9, TOP + 15, TOP + 22]) kit.add(new THREE.CylinderGeometry(1.5, 1.5, 2.2, 8), '#e8e4dc', 0, y, 0);
  kit.add(new THREE.SphereGeometry(0.6, 6, 4), '#c0392b', 0, MAST, 0);

  // the TDF transmitter's pavilion beside the south leg, low under its glass roof (the map makes
  // three storeys of its outline)
  kit.box(44, 4, 32, '#d8d0bf', -103, 2, 58);
  kit.box(42, 0.6, 30, GLASS, -103, 4.3, 58);
  return kit.mesh(kitMat(0.7, 0.2));
}

// a darker shade of a colour, for the edge of the stone feet
function shade(hex) {
  return '#' + new THREE.Color(hex).multiplyScalar(0.85).getHexString();
}

// a leg's foot, as a rectangle from (lo, lo) to (hi, hi) towards the corner (su, sv)
const foot = (su, sv, lo, hi) => rect(Math.min(su * lo, su * hi), Math.min(sv * lo, sv * hi), Math.max(su * lo, su * hi), Math.max(sv * lo, sv * hi));

export const EIFFEL = [{
  // seen from across the city, hazy on the horizon: its fog 14 times as far off, and from the
  // centre twice as large as it would be (js/skyline.js)
  id: 'tour-eiffel', name: 'Tour Eiffel', x: X, z: Z, turn: TURN, reach: 115, far: 14, loom: 2,
  area: [onMap(X, Z, TURN, rect(-82, -82, 82, 82)), onMap(X, Z, TURN, rect(-128, 40, -79, 77))],
  foot: [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([su, sv]) => onMap(X, Z, TURN, foot(su, sv, 44, 78.5)))
    .concat([onMap(X, Z, TURN, rect(-125, 42, -81, 74))]),
  make: eiffel,
}];
