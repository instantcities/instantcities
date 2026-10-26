// The Forum of Pompeii and the Temple of Jupiter at its north end, modelled by hand in place of
// the map's boxes, in game metres (the real ones times 1.25), on the outline the map has of the
// Forum: a long square, 145 by 42, its axis turned from north a little towards the east, its
// south end (+v here) towards the Via dell'Abbondanza:
//   the paving, light travertine
//   a colonnade along both long sides: Doric columns of cream stucco under an architrave and a
//     low tiled roof, as the porticoes had, the way into the streets between them left open
//   the Temple of Jupiter, Juno and Minerva: its podium with the flight of steps, the six
//     Corinthian columns across the front and the six behind them, the cella with its
//     gabled roof of terracotta tiles; Mount Vesuvius stands behind it in the sky
// Riders bump into the temple's podium and ride between the columns of the colonnades.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { gable, onMap, rect } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';

const X = -137, Z = 143.5, TURN = 0.4;
const HL = 72, HW = 29; // half its length and half its width, the colonnades' 8 m depth included
const STUCCO = '#ece6d6', STONE = '#d4cbb6', TILE = '#9a6a4c', PAVE = '#c4bba6', DARK = '#3d3128', WALL = '#8a7f6c', BRICKS = ['#9a6a52', '#a77a5c', '#8c6048'];

function column(kit, x, z, h, r) {
  kit.add(new THREE.CylinderGeometry(r * 0.82, r, h, 10), STUCCO, x, h / 2, z);
  kit.box(r * 2.9, 0.5, r * 2.9, STONE, x, h + 0.25, z);
}

export function forum() {
  const kit = new Kit();
  kit.box(HW * 2 - 10, 0.25, HL * 2, PAVE, 0, 0.12, 0);
  // the colonnades, one on each long side, 8 m deep: white columns standing along the open square
  // with a stretch of architrave over some of them and a second, lighter tier of columns on top
  // here and there; the roof long gone. The back wall is rough grey-brown masonry, patched in brick.
  const r = rng(17);
  for (const side of [-1, 1]) {
    const cx = side * (HW - 8);
    for (let v = -HL + 6; v <= HL - 6; v += 4.6) column(kit, cx, v, 6, 0.55);
    // architrave over runs of five to eight columns, with the second tier on those
    for (let v = -HL + 6; v < HL - 12; v += 4.6 * (5 + Math.floor(r() * 4)) + 4.6 * 3) {
      const len = 4.6 * (4 + Math.floor(r() * 3));
      kit.box(1.5, 1.1, len + 1.2, STONE, cx, 6.6, v + len / 2);
      for (let q = 0; q * 4.6 <= len; q++) {
        kit.add(new THREE.CylinderGeometry(0.4, 0.46, 4.4 - r() * 1.4, 10), STUCCO, cx, 7.2 + 2.0, v + q * 4.6);
        kit.box(1.1, 0.3, 1.1, STONE, cx, 7.15, v + q * 4.6);
      }
      kit.box(1.3, 0.8, len + 0.8, shade(STONE, 0.05), cx, 11.8, v + len / 2);
    }
    // the back wall: rough masonry, broken along its top, with patches of brick
    for (let v = -HL + 4; v < HL - 4; v += 7 + 7 * r()) {
      const seg = Math.min(HL - 4 - v, 7 + 7 * r()), hh = 4.2 + 2.6 * r();
      kit.box(1.4, hh, seg, shade(WALL, (r() - 0.5) * 0.12), side * (HW - 0.6), hh / 2, v + seg / 2);
      if (r() < 0.4) kit.box(1.5, 1.8, 2.4, BRICKS[Math.floor(r() * 3) % 3], side * (HW - 0.6), hh - 0.9, v + 1.5 + r() * (seg - 3));
    }
  }
  // the bases and pedestals standing about in the square, of brick courses with a stone cap, and fallen drums
  for (let k = 0; k < 14; k++) {
    const v = -HL + 8 + (k / 13) * (HL * 2 - 16), x = (r() - 0.5) * (HW * 2 - 24), h = 1.0 + 1.4 * r();
    kit.box(2.2, h, 2.2, BRICKS[k % 3], x, h / 2, v);
    kit.box(2.5, 0.35, 2.5, STONE, x, h + 0.18, v);
    if (k % 3 === 0) kit.add(new THREE.CylinderGeometry(0.55, 0.55, 1.6, 10), STUCCO, x + 2.6, 0.55, v + 1, 0, 0, Math.PI / 2); // a drum lying down
  }
  // the Temple of Jupiter: podium, steps, two rows of columns, cella and roof
  const v0 = -HL - 4, depth = 34, w = 24, ph = 3.6; // the podium's front edge, depth, width and height
  kit.box(w, ph, depth, STONE, 0, ph / 2, v0 - depth / 2);
  kit.box(w + 1.2, 0.5, depth + 1.2, shade(STONE, 0.08), 0, ph + 0.25, v0 - depth / 2);
  for (let k = 0; k < 6; k++) kit.box(12, 0.6, 1.2, shade(STONE, 0.05), 0, 0.3 + 0.6 * k, v0 + 3.6 - 0.6 * k);
  const top = ph + 0.5;
  for (const row of [0, 1]) for (let k = 0; k < 6; k++) {
    const x = -8.5 + k * 3.4, z = v0 - 3.4 - row * 4.6;
    kit.add(new THREE.CylinderGeometry(0.75, 0.95, 11.5, 12), STUCCO, x, top + 5.75, z);
    kit.add(new THREE.CylinderGeometry(1.35, 0.8, 1.4, 12), STONE, x, top + 11.5 + 0.7, z);
    kit.box(2.2, 0.3, 2.2, STONE, x, top + 12.35, z);
  }
  kit.box(w - 1.5, 1.8, 14, STONE, 0, top + 12.5 + 0.9, v0 - 8.2); // the entablature over the front
  const cv = v0 - 14; // the cella behind the columns
  kit.box(w - 5, 14, depth - 16, '#dccba5', 0, top + 7, cv - (depth - 16) / 2 + 0.2);
  kit.box(5, 7, 0.4, DARK, 0, top + 3.5, cv + 0.15);
  gable(kit, -(depth - 6) / 2, (depth - 6) / 2, (w - 1) / 2, top + 14.4, top + 20.2, TILE, { x: 0, z: v0 - depth / 2 + 3, turn: Math.PI / 2 });
  return kit.mesh(kitMat(0.9));
}

const ring = pts => onMap(X, Z, TURN, pts);

// It stands in for the map's pieces of the Temple of Jupiter and the Forum's sides (area); riders
// bump into the podium (foot).
export const FORUM = [{
  id: 'forum', name: 'Forum', x: X, z: Z, turn: TURN, reach: 260,
  area: [ring(rect(-HW - 5, -HL - 42, HW + 5, HL + 4))],
  foot: [ring(rect(-12, -HL - 38, 12, -HL - 3))],
  make: forum,
}];
