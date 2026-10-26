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
import { shade } from '../core/js/facades.js';

const X = -137, Z = 143.5, TURN = 0.4;
const HL = 72, HW = 29; // half its length and half its width, the colonnades' 8 m depth included
const STUCCO = '#e9dcbc', STONE = '#d8cdb2', TILE = '#b4623c', PAVE = '#cfc3a6', DARK = '#3d3128';

function column(kit, x, z, h, r) {
  kit.add(new THREE.CylinderGeometry(r * 0.82, r, h, 10), STUCCO, x, h / 2, z);
  kit.box(r * 2.9, 0.5, r * 2.9, STONE, x, h + 0.25, z);
}

export function forum() {
  const kit = new Kit();
  kit.box(HW * 2 - 10, 0.25, HL * 2, PAVE, 0, 0.12, 0);
  // the colonnades, one on each long side, 8 m deep, 6 m high to the architrave: the columns on the
  // side of the open square, the back wall on the street's
  for (const side of [-1, 1]) {
    for (let v = -HL + 6; v <= HL - 6; v += 4.6) column(kit, side * (HW - 8), v, 6, 0.55);
    kit.box(1.4, 1.1, HL * 2 - 8, STONE, side * (HW - 8), 6.9, 0);
    kit.box(8.6, 0.5, HL * 2 - 8, shade(TILE, -0.05), side * (HW - 3.6), 7.9, 0);
    kit.box(8, 0.3, HL * 2 - 8, '#7a5a40', side * (HW - 4), 7.5, 0); // the ceiling of the portico
    kit.box(1.2, 6.6, HL * 2 - 8, '#d8c7a0', side * (HW - 0.6), 3.3, 0); // the back wall
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
