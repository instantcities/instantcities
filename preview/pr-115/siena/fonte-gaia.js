// The Fonte Gaia at the top of the Campo, Jacopo della Quercia's fountain (1409-19), the copy by
// Tito Sarrocchi (1858-69) in its place since the worn marble went into Santa Maria della Scala,
// modelled by hand from its measurements and photos, in game metres (the real ones times 1.25): a
// basin 11 m by 5 m, open towards the square:
//   the back wall of white marble with its seven niches, the Madonna in the middle between the
//     Virtues, the reliefs of Adam and Eve at the ends, its cornice
//   the side walls stepping down towards the square, ending in Rhea Silvia and Acca Larentia, the
//     mothers of Rome, with their children
//   the two she-wolves spouting water into the basin, and the low railing of iron across its front
// Riders bump into the basin's rim.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { panel, lancet } from '../florence/marble.js';

const X = 159.1, Z = -84.7, TURN = 0.82; // its middle; it opens towards the Campo's middle (local +z)
const HW = 6.8, HD = 3.2; // half its width and depth
const MARBLE = '#e6e0d2', WATER = '#5f8f9a', IRON = '#2f2f2c';
const STONE = shade(MARBLE, -0.08);

// a statue standing at (x, z) from y: a draped figure of a few shapes
function figure(kit, x, y, z, h, hex = shade(MARBLE, 0.04)) {
  kit.add(new THREE.CylinderGeometry(h * 0.12, h * 0.2, h * 0.75, 7), hex, x, y + h * 0.375, z);
  kit.add(new THREE.SphereGeometry(h * 0.1, 7, 5), hex, x, y + h * 0.85, z);
}

export function fonteGaia() {
  const kit = new Kit();
  // the basin's floor and water, its rim along the front
  kit.box(2 * HW, 0.3, 2 * HD, STONE, 0, 0.15, 0);
  kit.box(2 * HW - 0.8, 0.1, 2 * HD - 0.6, WATER, 0, 0.75, 0.1);
  kit.box(2 * HW, 0.9, 0.5, STONE, 0, 0.45, HD - 0.25);
  // the back wall, its seven niches with their figures, the reliefs at its ends, the cornice
  const back = linePath(HW, -HD, -HW, -HD); // its face looking into the basin, towards +z
  const len = back.length;
  wall(kit, back, [[0, 0], [len, 0], [len, 4], [0, 4]], { o0: -0.9, o1: 0, hex: MARBLE });
  for (let k = 0; k < 7; k++) {
    const s = 2.2 + (k * (len - 4.4)) / 6;
    lancet(kit, back, s, 1.05, 1, 3.2, { frame: STONE, glass: shade(MARBLE, -0.2), rim: 0.15, round: true, o: 0.02 });
    const p = back.at(s);
    figure(kit, p.x + 0.25 * p.tz, 1, p.z - 0.25 * p.tx, k === 3 ? 2.1 : 1.8);
  }
  for (const s of [0.7, len - 0.7]) panel(kit, back, s - 0.55, s + 0.55, 1, 3.4, shade(MARBLE, -0.12), 0, 0.15);
  panel(kit, back, -0.2, len + 0.2, 3.9, 4.4, STONE, -0.95, 1.2);
  // the side walls stepping down to the statues of Rhea Silvia and Acca Larentia
  for (const side of [-1, 1]) {
    const path = side < 0 ? linePath(-HW, -HD, -HW, HD) : linePath(HW, HD, HW, -HD); // facing in
    const l = path.length;
    wall(kit, path, [[0, 0], [l, 0], [l, side < 0 ? 2.2 : 4], [0, side < 0 ? 4 : 2.2]], { o0: -0.9, o1: 0, hex: MARBLE });
    lancet(kit, path, l / 2, 1, 0.9, 2.6, { frame: STONE, glass: shade(MARBLE, -0.2), rim: 0.15, round: true, o: 0.02 });
    const x = side * (HW - 0.45), z = HD - 0.4;
    kit.box(1.4, 2.4, 1.4, STONE, x, 1.2, z);
    figure(kit, x, 2.4, z, 2.2);
    figure(kit, x + side * 0.4, 2.4, z + 0.5, 0.9);
    // the she-wolf spouting into the basin
    kit.box(0.5, 0.5, 1.3, '#cfc6b2', side * (HW - 2), 1.2, -HD + 0.75);
    kit.box(0.35, 0.35, 0.4, '#cfc6b2', side * (HW - 2), 1.45, -HD + 1.5);
    kit.rod([side * (HW - 2), 1.4, -HD + 1.7], [side * (HW - 2.2), 0.8, -HD + 2.6], 0.05, '#9cc3cc', 4);
  }
  // the railing across the front, between little stone posts
  for (let k = 0; k <= 8; k++) kit.box(0.3, 1.3, 0.3, STONE, -HW + 1.4 + (k * (2 * HW - 2.8)) / 8, 0.65, HD + 0.7);
  for (const y of [0.5, 1.1]) kit.box(2 * HW - 2.8, 0.06, 0.06, IRON, 0, y, HD + 0.7);
  return kit.mesh(kitMat(0.8));
}

// it stands on the Campo's open paving: riders bump into the basin and its railing
const BASIN = onMap(X, Z, TURN, rect(-HW - 0.3, -HD - 0.9, HW + 0.3, HD + 0.9));
export const FONTE_GAIA = [{
  id: 'fonte-gaia', name: 'Fonte Gaia', x: X, z: Z, turn: TURN, reach: 70,
  area: [BASIN], foot: [BASIN],
  make: fonteGaia,
}];
