// What stands beside the way to the temple: the two libraries either side of it (the Northern and
// the Southern Library, each a cross of two gabled halls on a low platform) and the Terrace of
// Honour in front of the temple's west side, a low cross-shaped terrace the way runs over. In game
// metres, on the outlines the map has of them (frame.js).
import { Kit, kitMat } from '../core/js/kit.js';
import { gable, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { game } from './frame.js';

const STONE = ['#8f8271', '#867a69', '#978a77'], DARK = '#2f2a24';
// their middles and sizes in game metres, from the map's outlines
const LIBRARIES = [[-84, 123], [-83, 43]].map(([x, z]) => ({ x, z, w: 48, d: 34 }));
const TERRACE = { x: 183, z: 85, w: 46, d: 26 };

function library(kit, { x, z, w, d }) {
  kit.box(w, 1.4, d, shade(STONE[1], -0.05), x, 0.7, z);
  kit.box(w + 1, 0.4, d + 1, shade(STONE[0], 0.08), x, 1.5, z);
  // the cross: a long hall along the way and a shorter one across it, each under its own gable
  const a = [w * 0.62, d * 0.36], b = [w * 0.3, d * 0.74], H = 8.5;
  for (const [hw, hd, turn] of [[a[0], a[1], 0], [b[0], b[1], Math.PI / 2]]) {
    kit.box(turn ? b[0] : a[0], H, turn ? b[1] : a[1], STONE[turn ? 2 : 0], x, 1.7 + H / 2, z);
    gable(kit, -hw / 2, hw / 2, hd / 2 + 0.6, 1.7 + H, 1.7 + H + 4.5, shade(STONE[1], -0.1), { x, z, turn });
    // dark niches in the end walls
    for (const sgn of [-1, 1]) {
      kit.box(turn ? hd * 0.35 : 0.3, 4, turn ? 0.3 : hd * 0.35, DARK, x + (turn ? 0 : sgn * (hw / 2)), 1.7 + 2.6, z + (turn ? sgn * (hw / 2) : 0));
    }
  }
  // steps up to the doors on the two sides of the long hall
  for (const sgn of [-1, 1]) for (let k = 0; k < 4; k++) kit.box(0.8, 0.35, 8, STONE[2], x + sgn * (a[0] / 2 + 0.8 + k * 0.4 + 0.4), 0.15 + k * 0.35, z);
}

export function avenue() {
  const kit = new Kit();
  for (const l of LIBRARIES) library(kit, l);
  // the Terrace of Honour: a cross of two low slabs with a coping
  const { x, z, w, d } = TERRACE;
  kit.box(w, 0.4, d * 0.5, STONE[2], x, 0.2, z);
  kit.box(w * 0.45, 0.4, d, STONE[2], x, 0.2, z);
  kit.box(w + 0.8, 0.12, d * 0.5 + 0.8, shade(STONE[0], 0.12), x, 0.42, z);
  kit.box(w * 0.45 + 0.8, 0.12, d + 0.8, shade(STONE[0], 0.12), x, 0.43, z);
  return kit.mesh(kitMat(0.95));
}

const box = ({ x, z, w, d }, m = 0) => [x - w / 2 - m, z - d / 2 - m, x + w / 2 + m, z - d / 2 - m, x + w / 2 + m, z + d / 2 + m, x - w / 2 - m, z + d / 2 + m];

// They stand in for the map's three outlines (area); riders bump into the libraries (foot), and
// ride over the terrace.
export const AVENUE = [{
  id: 'avenue', name: 'The libraries', x: 0, z: 0, turn: 0, reach: 700,
  area: [...LIBRARIES, TERRACE].map(b => box(b, 2)),
  foot: LIBRARIES.map(b => box(b)),
  make: avenue,
}];
