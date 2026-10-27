// The Old-New Synagogue (Staronová synagoga, about 1270), the oldest working synagogue in Europe,
// on Červená in Josefov, modelled by hand in place of the map's block of it, from its measurements
// and photos, in game metres (the real ones times 1.25), on the map's outline: the Gothic hall 16 m
// by 10 m in the middle, its walls 10 m high and its steep roof to 20 m, and round it the low annexes
// of the vestibule on the south and the women's galleries on the west and north.
//   the hall's walls of grey plaster with their buttresses and the narrow pointed windows high up
//   the steep tiled roof and on both ends the tall brick gable, stepped up its sides, with its
//     blind pointed niches
//   the annexes under their lean-to roofs against the hall, the doorway in the vestibule
// The model's own metres: +u runs east along the hall (its ark at the east end), +v south.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep, gable, pointedRing } from '../core/js/arcade.js';
import { outlines, local, sides, prism, roof } from './outline.js';

const X = 48.2, Z = -322.8, TURN = 0.1; // the middle of the map's outline, and the hall turned from east
const OUTLINE = outlines('synagogue', 48.2, -324.5, 6)[0] ?? [];
const U0 = -8, U1 = 12, V0 = -9, V1 = 4; // the hall
const ANNEX = 6.5, LEAN = 9, EAVES = 13, RIDGE = 25;
const PLASTER = '#d3cbbb', PLASTER2 = '#c1b8a6', TILE = '#5e4a3e', BRICK = '#a4563b', BRICK2 = '#7c3d29', DARK = '#2b2926';

export function staronova() {
  const kit = new Kit();
  const ring = local(OUTLINE, X, Z, TURN), hall = [[U0, V0], [U1, V0], [U1, V1], [U0, V1]];
  // the annexes on the map's outline, under lean-tos rising to the hall's walls
  prism(kit, ring, 0, ANNEX, PLASTER2);
  const corners = [[-15.1, 12], [-10.6, -12.2], [14.9, -12.5], [12.3, 12.8]]; // SW, NW, NE, SE of the outline
  roof(kit, corners.map(([u, v]) => [u + Math.sign(u) * 0.4, v + Math.sign(v) * 0.4]), [[U0, V1], [U0, V0], [U1, V0], [U1, V1]], ANNEX, LEAN, TILE, { cap: false });
  for (const path of sides(ring, 3)) {
    const len = path.length;
    sweep(kit, path, 0, len, [[-0.1, ANNEX - 0.5], [0.3, ANNEX - 0.5], [0.3, ANNEX], [-0.1, ANNEX]], PLASTER, { step: len });
    // small pointed windows along the annexes, a buttress between every two
    const n = Math.floor(len / 4.5);
    for (let k = 0; k < n; k++) {
      const s = (k + 0.5) * (len / n);
      wall(kit, path, pointedRing(s, 0.8, 2.6, 4.6, 1, 5), { o0: 0, o1: 0.06, hex: DARK });
      if (k) wall(kit, path, [[s - len / n / 2 - 0.45, 0], [s - len / n / 2 + 0.45, 0], [s - len / n / 2 + 0.45, ANNEX - 1.2], [s - len / n / 2 - 0.45, ANNEX - 2.2]], { o0: 0, o1: 0.9, hex: PLASTER });
    }
  }
  // the vestibule's doorway on Červená, towards its west end
  const south = linePath(12.3, 12.8 + 0.02, -15.1, 12 + 0.02);
  wall(kit, south, pointedRing(south.length - 6, 2.4, 0, 4.2, 1, 6), { o0: 0, o1: 0.08, hex: '#3e2c20' });
  wall(kit, south, [[south.length - 7.6, 0], [south.length - 4.4, 0], [south.length - 4.4, 5], [south.length - 7.6, 5]], { holes: [pointedRing(south.length - 6, 2.4, 0, 4.2, 1, 6)], o0: 0, o1: 0.25, hex: PLASTER });

  // the hall: its walls, buttresses and high windows
  prism(kit, hall, 0, EAVES, PLASTER);
  const long = [linePath(U0, V0, U1, V0), linePath(U1, V1, U0, V1)]; // north and south, outside to the right
  for (const path of long) {
    const len = path.length;
    for (const s of [0.6, len / 3, (2 * len) / 3, len - 0.6]) wall(kit, path, [[s - 0.6, ANNEX], [s + 0.6, ANNEX], [s + 0.6, EAVES - 2.4], [s - 0.6, EAVES - 1.2]], { o0: 0, o1: 1.3, hex: PLASTER2 });
    for (const s of [len / 6, len / 2, (5 * len) / 6]) wall(kit, path, pointedRing(s, 0.7, 9.6, 12.2, 1, 5), { o0: 0, o1: 0.06, hex: DARK });
    sweep(kit, path, 0, len, [[-0.1, EAVES - 0.6], [0.4, EAVES - 0.6], [0.4, EAVES], [-0.1, EAVES]], PLASTER2, { step: len });
  }
  // the east end's buttresses and its two windows over the ark
  const east = linePath(U1, V0, U1, V1);
  for (const s of [0.6, east.length / 2, east.length - 0.6]) wall(kit, east, [[s - 0.6, 0], [s + 0.6, 0], [s + 0.6, EAVES - 2.4], [s - 0.6, EAVES - 1.2]], { o0: 0, o1: 1.4, hex: PLASTER2 });
  for (const s of [east.length * 0.3, east.length * 0.7]) wall(kit, east, pointedRing(s, 0.8, 8.4, 11.6, 1, 5), { o0: 0, o1: 0.06, hex: DARK });

  // the steep roof, and the brick gables over both ends
  gable(kit, U0 - 0.3, U1 + 0.3, (V1 - V0) / 2 + 0.5, EAVES - 0.4, RIDGE, TILE, { z: (V0 + V1) / 2 });
  for (const path of [linePath(U0 - 0.1, V1, U0 - 0.1, V0), east]) brickGable(kit, path);
  return kit.mesh(kitMat(0.88));
}

// a gable of brick on the end wall: stepped up both sides above the roof, to a little spike at the
// top, with tall blind niches in it
function brickGable(kit, path) {
  const len = path.length, mid = len / 2, n = 6, w = (mid - 0.4) / n, rise = RIDGE - EAVES, ring = [[0, EAVES - 1.5], [len, EAVES - 1.5]];
  const right = [];
  for (let k = 0; k < n; k++) {
    const s = len - k * w, y = EAVES + (k / n) * rise + 1.8;
    right.push([s, y], [s - w, y]);
  }
  ring.push(...right, [mid + 0.4, RIDGE + 2.4], [mid, RIDGE + 3.6], [mid - 0.4, RIDGE + 2.4], ...right.map(([s, y]) => [len - s, y]).reverse());
  wall(kit, path, ring, { o0: -0.6, o1: 0.5, hex: BRICK });
  for (const [d, y0, y1] of [[0, 15, 23.5], [-1.7, 15, 20.5], [1.7, 15, 20.5], [-3.4, 14, 17.5], [3.4, 14, 17.5]]) {
    wall(kit, path, pointedRing(mid + d, 0.9, y0, y1, 1.1, 5), { o0: 0.5, o1: 0.55, hex: BRICK2 });
  }
  wall(kit, path, [[0, EAVES - 1.5], [len, EAVES - 1.5], [len, EAVES - 1.1], [0, EAVES - 1.1]], { o0: 0.5, o1: 0.65, hex: BRICK2 });
}

export const STARONOVA = [{
  id: 'staronova-synagoga', name: 'Staronová synagoga', x: X, z: Z, turn: TURN, reach: 140,
  area: OUTLINE.length ? [OUTLINE] : [], foot: OUTLINE.length ? [OUTLINE] : [],
  make: staronova,
}];
