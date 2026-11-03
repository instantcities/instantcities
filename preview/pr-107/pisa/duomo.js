// The Duomo di Pisa, Santa Maria Assunta (begun 1063 by Buscheto, the front by Rainaldo in the 12th
// century), the first great church of the Pisan Romanesque, modelled by hand in place of the map's
// pieces of it, from its measurements and photos, in game metres (the real ones times 1.25), on the
// map's outline: a Latin cross 110 m from the front to the end of the apse, the transept 82 m across.
// White marble with thin grey bands, and roofs of lead:
//   the nave with its four aisles: the outer aisles' walls in a row of tall blind arches on
//     pilasters, the galleries over the inner aisles set back with a row of smaller ones, and the
//     nave's walls over them with their little windows, under its long gable roof
//   the front: seven blind arches on half-columns below, with the three bronze doors, and over them
//     four open loggias of little columns, each narrower than the last, their sloping shoulders over
//     the aisles' roofs, under the gable with the Madonna on its top
//   the transept's two arms, each a church of its own, ending in its round apse
//   the choir and the great apse to the east, in the same two rows of blind arches
//   the elliptical dome over the crossing, on its drum with a ring of little arches, its lantern
// It stands on its own on the lawn, so riders bump into it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, ellipsePath, arcade, wall, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { panel, lancet, oculus, prism, gable } from '../florence/marble.js';
import { MARBLE, LEAD, DARK, BRONZE, moved, blind, loggia, bands, strip, slope } from './romanico.js';

const X = -251, Z = -646.5, TURN = -0.006; // the middle of the crossing; the nave runs east (local +x) to it
const FRONT = -88, TR = 22, CHOIR = 36.4; // the front, the transept's half width, where the apse begins
const HW = 29.5, GW = 22.6, NW = 10.5, TW = 47.5, CW = 17; // half widths: aisles, galleries, nave, transept, choir
const AISLE = 16, GALLERY = 29, CLERE = 38, RIDGE = 43; // the walls' tops and the nave's ridge
const STONE = shade(MARBLE, -0.07);
const D = [11.6, 8.5]; // the dome's half axes, along the nave and across it
const DRUM = CLERE + 7.5, DOME = DRUM + 10.5;

// a little round-headed window in a blind arch
const window = (kit, path, h) => (i, c, w, top) => lancet(kit, path, c, Math.min(1.4, w * 0.3), top - h - 2, top - 1.4, { frame: STONE, glass: DARK, rim: 0.25, round: true, o: 0.05 });

// the walls of one run from s0 to s1 along path: the lower row of blind arches up to `low` (with
// the grey bands behind them), and the upper row up to `high` when there is one
function orders(kit, path, s0, s1, low, high, n) {
  bands(kit, path, s0, s1, 0.6, low - 1);
  blind(kit, path, s0, s1, 0, low, n, { arch: 0.74, win: window(kit, path, 3.4) });
  panel(kit, path, s0, s1, low - 0.7, low, STONE, 0, 0.8);
  if (!high) return;
  blind(kit, path, s0, s1, low, high, 2 * n, { arch: 0.66, win: (i, c, w, top) => i % 2 || lancet(kit, path, c, w * 0.35, top - 4, top - 1.2, { frame: STONE, glass: DARK, rim: 0.2, round: true, o: 0.05 }) });
  panel(kit, path, s0, s1, high - 0.6, high, STONE, 0, 0.8);
}

// a straight wall's path from (u0, v0) to (u1, v1), its outside to the right
const run = (u0, v0, u1, v1) => linePath(u0, v0, u1, v1);

export function duomo() {
  const kit = new Kit();
  // the plinth and the steps all round
  prism(kit, rect(FRONT - 2.2, -HW - 1.2, TR + 1.2, HW + 1.2), 0, 0.5, shade(MARBLE, -0.12));
  prism(kit, rect(-TR - 1.2, -TW - 1.2, TR + 1.2, TW + 1.2), 0, 0.5, shade(MARBLE, -0.12));
  // the solid bodies: aisles, galleries, transept, choir, nave
  prism(kit, rect(FRONT, -HW, -TR, HW), 0, AISLE, MARBLE);
  prism(kit, rect(FRONT, -GW, -TR, GW), 0, GALLERY, MARBLE);
  prism(kit, rect(-TR, -TW, TR, TW), 0, GALLERY, MARBLE);
  prism(kit, rect(TR, -CW, CHOIR, CW), 0, GALLERY, MARBLE);
  prism(kit, rect(FRONT, -NW, CHOIR, NW), 0, CLERE, MARBLE);
  prism(kit, rect(-NW, -TW, NW, TW), 0, CLERE, MARBLE);
  for (const side of [-1, 1]) {
    // the outer aisle (two rows of arches where the galleries rise over it)
    const aisle = side < 0 ? run(FRONT, -HW, -TR, -HW) : run(-TR, HW, FRONT, HW);
    orders(kit, aisle, 0, aisle.length, AISLE, 0, 10);
    const gal = side < 0 ? run(FRONT, -GW, -TR, -GW) : run(-TR, GW, FRONT, GW);
    blind(kit, gal, 0, gal.length, AISLE, GALLERY, 20, { arch: 0.62, win: (i, c, w, top) => i % 2 || lancet(kit, gal, c, 0.9, top - 4, top - 1.2, { frame: STONE, glass: DARK, rim: 0.2, round: true, o: 0.05 }) });
    panel(kit, gal, 0, gal.length, GALLERY - 0.6, GALLERY, STONE, 0, 0.8);
    // the nave's upper walls, west and east of the crossing, and the transept's
    for (const [u0, u1] of [[FRONT, -TR], [TR, CHOIR]]) {
      const nave = side < 0 ? run(u0, -NW, u1, -NW) : run(u1, NW, u0, NW);
      blind(kit, nave, 0, nave.length, GALLERY, CLERE, Math.round(nave.length / 3.3), { arch: 0.6, win: (i, c, w, top) => lancet(kit, nave, c, 0.8, top - 3.6, top - 1, { frame: STONE, glass: DARK, rim: 0.2, round: true, o: 0.05 }) });
      panel(kit, nave, 0, nave.length, CLERE - 0.6, CLERE, STONE, 0, 0.8);
    }
    // the transept's upper walls, west and east, from the crossing out to its end
    for (const up of side < 0 ? [run(-NW, -NW, -NW, -TW), run(NW, -TW, NW, -NW)] : [run(-NW, TW, -NW, NW), run(NW, NW, NW, TW)]) {
      blind(kit, up, 0, up.length, GALLERY + 2, CLERE, 9, { arch: 0.6 });
      panel(kit, up, 0, up.length, CLERE - 0.6, CLERE, STONE, 0, 0.8);
    }
    // the transept's arm: its two side walls and its end, in two rows, with its apse
    const west = side < 0 ? run(-TR, -HW, -TR, -TW) : run(-TR, TW, -TR, HW);
    const east = side < 0 ? run(TR, -TW, TR, -CW) : run(TR, CW, TR, TW);
    const end = side < 0 ? run(-TR, -TW, TR, -TW) : run(TR, TW, -TR, TW);
    orders(kit, west, 0, west.length, AISLE, GALLERY, 3);
    orders(kit, east, 0, east.length, AISLE, GALLERY, 5);
    orders(kit, end, 0, end.length, AISLE, GALLERY, 7);
    oculus(kit, end, end.length / 2, GALLERY + 4.6, 2.2, { frame: STONE, glass: DARK, rim: 0.5, o: 0 });
    const cv = side * (TW - 3.5), ap = moved(ellipsePath(8.05, 8.05), 0, cv);
    kit.add(new THREE.CylinderGeometry(8, 8, 22, 24), MARBLE, 0, 11, cv);
    bands(kit, ap, 0, ap.length, 0.6, 21);
    blind(kit, ap, 0, ap.length, 0, 22, 14, { arch: 0.66, win: window(kit, ap, 4) });
    kit.add(new THREE.ConeGeometry(8.6, 3.6, 24), LEAD, 0, 23.8, cv);
    // the choir's sides
    const choir = side < 0 ? run(TR, -CW, CHOIR, -CW) : run(CHOIR, CW, TR, CW);
    orders(kit, choir, 0, choir.length, AISLE, GALLERY, 2);
    // the roofs: the aisle's lean-to, the gallery's, the transept arm's lean-tos
    slope(kit, [FRONT, AISLE, side * HW], [-TR, AISLE, side * HW], [-TR, AISLE + 2.6, side * GW], [FRONT, AISLE + 2.6, side * GW], LEAD);
    slope(kit, [FRONT, GALLERY, side * GW], [-TR, GALLERY, side * GW], [-TR, GALLERY + 3, side * NW], [FRONT, GALLERY + 3, side * NW], LEAD);
    for (const [u0, u1] of [[-TR, -NW], [TR, NW]]) slope(kit, [u0, GALLERY, side * NW], [u0, GALLERY, side * TW], [u1, GALLERY + 3, side * TW], [u1, GALLERY + 3, side * NW], LEAD);
    slope(kit, [TR, GALLERY, side * CW], [CHOIR, GALLERY, side * CW], [CHOIR, GALLERY + 2, side * NW], [TR, GALLERY + 2, side * NW], LEAD);
  }
  // the long roofs over the nave and over the transept
  gable(kit, (FRONT + CHOIR) / 2, CLERE, 0, CHOIR - FRONT, 2 * NW + 1, RIDGE - CLERE, LEAD);
  gable(kit, 0, CLERE, 0, 2 * TW + 1, 2 * NW + 1, RIDGE - CLERE, LEAD, Math.PI / 2);
  apse(kit);
  front(kit);
  dome(kit);
  return kit.mesh(kitMat(0.85));
}

// the great apse to the east, half an ellipse in two rows of arches, the nave's upper apse over it
function apse(kit) {
  const half = (a, b, n = 16) => Array.from({ length: n + 1 }, (_, k) => { const t = -Math.PI / 2 + (k / n) * Math.PI; return [CHOIR + a * Math.cos(t), b * Math.sin(t)]; });
  prism(kit, half(13.5, CW), 0, GALLERY, MARBLE);
  prism(kit, half(NW, NW), 0, CLERE, MARBLE);
  const low = moved(ellipsePath(13.5 + 0.05, CW + 0.05), CHOIR, 0), up = moved(ellipsePath(NW + 0.05, NW + 0.05), CHOIR, 0);
  const q = low.length / 4, uq = up.length / 4;
  bands(kit, low, -q, q, 0.6, AISLE - 1);
  blind(kit, low, -q, q, 0, AISLE, 12, { arch: 0.74, win: window(kit, low, 3.4) });
  blind(kit, low, -q, q, AISLE, GALLERY, 16, { arch: 0.66 });
  for (const y of [AISLE, GALLERY]) strip(kit, low, -q, q, y - 0.7, y, STONE, 0, 0.8);
  blind(kit, up, -uq, uq, GALLERY + 3, CLERE, 10, { arch: 0.6, win: (i, c, w, top) => lancet(kit, up, c, 0.8, top - 3.6, top - 1, { frame: STONE, glass: DARK, rim: 0.2, round: true, o: 0.05 }) });
  strip(kit, up, -uq, uq, CLERE - 0.6, CLERE, STONE, 0, 0.8);
  const roof = (r, rz, h, y) => kit.add(new THREE.ConeGeometry(1, 1, 24, 1, false, 0, Math.PI).scale(r, h, rz), LEAD, CHOIR, y + h / 2, 0);
  roof(13.9, CW + 0.4, 3, GALLERY);
  roof(NW + 0.4, NW + 0.4, RIDGE - CLERE, CLERE);
}

// Rainaldo's front, facing west (local -x): s from the south corner to the north one
function front(kit) {
  const path = run(FRONT, HW, FRONT, -HW), len = path.length, C = len / 2;
  const T = [AISLE, 22.5, 28.5, 34.5, 39.5], APEX = 46; // the loggias' floors, the gable's top
  const g = C - GW, n = C - NW; // where the second and the third loggia begin
  wall(kit, path, [[0, 0], [len, 0], [len, T[1]], [len - g, T[2]], [len - n, T[3]], [len - n, T[4]], [C, APEX], [n, T[4]], [n, T[3]], [g, T[2]], [0, T[1]]], { o0: -1.6, o1: 0, hex: MARBLE });
  // the ground storey: seven blind arches on half-columns, the bronze doors in three of them
  bands(kit, path, 0, len, 0.6, T[0] - 1.5);
  blind(kit, path, 0, len, 0, T[0] - 0.8, 7, {
    arch: 0.74, depth: 0.9, crown: T[0] - 2.2,
    win: (i, c, w, top) => {
      if (i % 2) {
        const big = i === 3, dw = big ? 4.6 : 3.4, dh = big ? 9.4 : 7.6;
        panel(kit, path, c - dw / 2 - 0.6, c + dw / 2 + 0.6, 0.5, dh + 0.7, STONE, 0, 0.5);
        panel(kit, path, c - dw / 2, c + dw / 2, 0.5, dh, BRONZE, 0.3, 0.3);
        panel(kit, path, c - 0.06, c + 0.06, 0.5, dh, shade(BRONZE, -0.3), 0.6, 0.05);
        oculus(kit, path, c, dh + 2.6, 1.3, { frame: STONE, glass: '#b89a5a', rim: 0.3, o: 0.05 });
      } else {
        // the inlaid lozenges and rosettes of the closed bays
        const y = top - 3.6;
        wall(kit, path, [[c, y - 1.6], [c + 1.2, y], [c, y + 1.6], [c - 1.2, y]], { o0: 0.05, o1: 0.12, hex: '#6f7d78' });
      }
    },
  });
  for (let i = 0; i <= 7; i++) {
    const s = Math.min(len - 0.6, Math.max(0.6, (i * len) / 7)), p = path.at(s);
    kit.add(new THREE.CylinderGeometry(0.5, 0.55, T[0] - 2.6, 10), MARBLE, p.x - 1.1, (T[0] - 2.6) / 2 + 0.4, p.z);
  }
  panel(kit, path, 0, len, T[0] - 0.8, T[0], STONE, 0, 1.4);
  // the four loggias, and the shoulders of solid marble beside the upper three
  loggia(kit, path, 0.4, len - 0.4, T[0], T[1], 19);
  loggia(kit, path, g, len - g, T[1], T[2], 17);
  loggia(kit, path, n, len - n, T[2], T[3], 8);
  loggia(kit, path, n, len - n, T[3], T[4], 8);
  // the gable over the top loggia: its oculus, its cornice, the Madonna and the two angels
  oculus(kit, path, C, T[4] + 2.4, 1.1, { frame: STONE, glass: DARK, rim: 0.3, o: 0.05 });
  for (const [s, y, h] of [[C, APEX, 3.2], [n - 0.4, T[4] + 0.2, 2.4], [len - n + 0.4, T[4] + 0.2, 2.4], [0.8, T[1] + 0.2, 2.2], [len - 0.8, T[1] + 0.2, 2.2]]) {
    const p = path.at(s);
    kit.add(new THREE.CylinderGeometry(0.35, 0.55, h, 6), shade(MARBLE, 0.04), p.x - 0.6, y + h / 2, p.z);
    kit.add(new THREE.SphereGeometry(0.4, 6, 5), shade(MARBLE, 0.04), p.x - 0.6, y + h + 0.3, p.z);
  }
}

// the drum with its ring of little arches, the elliptical dome of lead, its lantern
function dome(kit) {
  const drum = ellipsePath(D[0], D[1]);
  kit.add(new THREE.CylinderGeometry(1, 1, DRUM - RIDGE + 2, 32).scale(D[0] - 0.4, 1, D[1] - 0.4), MARBLE, 0, (DRUM + RIDGE - 2) / 2, 0);
  arcade(kit, drum, { bays: 28, start: 0, depth: 0.35, hex: () => MARBLE, storeys: [{ h: RIDGE - 2 }, { h: DRUM - RIDGE + 2, arch: 0.72, crown: DRUM - RIDGE + 0.6, sill: 0.4, order: 'tuscan' }], r: 0.18 });
  // the Gothic crown of little gables round its foot
  for (let k = 0; k < 28; k++) {
    const p = drum.at(((k + 0.5) * drum.length) / 28), x = p.x + 0.5 * p.tz, z = p.z - 0.5 * p.tx;
    kit.add(new THREE.ConeGeometry(0.35, 2.4, 4), MARBLE, x, RIDGE + 0.6, z);
  }
  kit.add(new THREE.CylinderGeometry(1, 1, 0.8, 32).scale(D[0] + 0.5, 1, D[1] + 0.5), STONE, 0, DRUM + 0.4, 0);
  kit.add(new THREE.SphereGeometry(1, 28, 10, 0, 2 * Math.PI, 0, Math.PI / 2).scale(D[0], DOME - DRUM - 0.8, D[1]), shade(LEAD, 0.08), 0, DRUM + 0.8, 0);
  for (let k = 0; k < 16; k++) {
    const t = (k / 16) * 2 * Math.PI;
    const pts = Array.from({ length: 7 }, (_, j) => { const a = (j / 6) * (Math.PI / 2) * 0.93; return [Math.cos(t) * D[0] * Math.cos(a) * 1.01, DRUM + 0.8 + (DOME - DRUM - 0.8) * Math.sin(a), Math.sin(t) * D[1] * Math.cos(a) * 1.01]; });
    for (let j = 0; j < 6; j++) kit.rod(pts[j], pts[j + 1], 0.22, STONE, 4);
  }
  // the lantern
  kit.add(new THREE.CylinderGeometry(1.6, 1.8, 3.2, 12), MARBLE, 0, DOME + 1.2, 0);
  kit.add(new THREE.ConeGeometry(2, 1.8, 12), LEAD, 0, DOME + 3.7, 0);
  kit.add(new THREE.SphereGeometry(0.45, 8, 6), '#c9a24a', 0, DOME + 5, 0);
  kit.box(0.18, 1.6, 0.18, '#c9a24a', 0, DOME + 6, 0).box(0.18, 0.18, 0.9, '#c9a24a', 0, DOME + 6.3, 0);
}

// it stands in for the map's pieces of it (area), and riders bump into its cross (foot)
const RINGS = [rect(FRONT - 2.2, -HW - 1.2, -TR, HW + 1.2), rect(-TR - 1.2, -TW - 4.5, TR + 1.2, TW + 4.5), rect(TR, -CW, CHOIR + 13.5, CW)].map(r => onMap(X, Z, TURN, r));
export const DUOMO = [{
  id: 'duomo', name: 'Duomo di Pisa', x: X, z: Z, turn: TURN, reach: 220,
  area: [onMap(X, Z, TURN, rect(FRONT - 4, -TW - 6, CHOIR + 16, TW + 6))], foot: RINGS,
  make: duomo,
}];
