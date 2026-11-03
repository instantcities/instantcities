// Santa Maria della Spina (1230, made over in Gothic from 1325), the little oratory on the Lungarno
// Gambacorti that kept a thorn of Christ's crown, taken down stone by stone in 1871 and put up again
// a metre higher, out of reach of the Arno's floods. Modelled by hand in place of the map's block of
// it, from its measurements and photos, in game metres (the real ones times 1.25), on the map's
// outline: a box 18 m by 9 m of white marble banded in grey, bristling with spires:
//   the front to the west with its two doors, each under a gable with a rose window, and the
//     three tall tabernacles between and beside them
//   the long side to the river, a row of pointed windows below and a row of little gabled
//     tabernacles along its top, each with its statue, a spire between each two
//   the east end's three gables, and the lead roof
// It stands on the riverside walk, so riders bump into it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { panel, lancet, oculus, prism, gable } from '../florence/marble.js';
import { MARBLE, LEAD, DARK, bands } from './romanico.js';

const X = -175.4, Z = 468.5, TURN = 0.4397; // its middle; its long axis runs east-north-east (local +x)
const HL = 11.2, HW = 5.5, WALL = 11, RIDGE = 15.5; // half its length and width, the walls' top, the ridge
const STONE = shade(MARBLE, -0.07), VERDE = '#5f6f68';

// a spire at (u, v) from y: a slender shaft and its pointed top
function spire(kit, u, v, y, h, w = 0.7) {
  kit.box(w, h * 0.5, w, MARBLE, u, y + h * 0.25, v);
  kit.add(new THREE.ConeGeometry(w * 0.75, h * 0.5, 4).rotateY(Math.PI / 4), MARBLE, u, y + h * 0.75, v);
  kit.add(new THREE.SphereGeometry(w * 0.3, 6, 4), STONE, u, y + h + 0.1, v);
}

// a gabled tabernacle on the wall's top at s: its niche with a statue, its gable, w wide
function tabernacle(kit, path, s, w, y, h) {
  wall(kit, path, [[s - w / 2, y], [s + w / 2, y], [s + w / 2, y + h * 0.45], [s, y + h], [s - w / 2, y + h * 0.45]], { o0: -0.4, o1: 0.3, hex: MARBLE });
  lancet(kit, path, s, w * 0.5, y + 0.3, y + h * 0.6, { frame: VERDE, glass: shade(DARK, 0.25), rim: 0.15, o: 0.3 });
  const p = path.at(s);
  kit.add(new THREE.CylinderGeometry(w * 0.11, w * 0.14, h * 0.4, 6), shade(MARBLE, 0.05), p.x + 0.55 * p.tz, y + 0.3 + h * 0.2, p.z - 0.55 * p.tx);
}

export function spina() {
  const kit = new Kit();
  prism(kit, rect(-HL - 0.6, -HW - 0.6, HL + 0.6, HW + 0.6), 0, 0.6, STONE);
  prism(kit, rect(-HL, -HW, HL, HW), 0.6, WALL, MARBLE);
  const north = linePath(-HL, -HW, HL, -HW), south = linePath(HL, HW, -HL, HW);
  const west = linePath(-HL, HW, -HL, -HW), east = linePath(HL, -HW, HL, HW);
  for (const path of [north, south, west, east]) bands(kit, path, 0, path.length, 0.6, WALL - 0.5, { step: 1.2, h: 0.4 });
  // the long sides: pointed windows below, the tabernacles and spires along the top
  for (const path of [north, south]) {
    const len = path.length, n = 6, bay = len / n;
    for (let k = 0; k < n; k++) {
      const c = (k + 0.5) * bay;
      lancet(kit, path, c, 1.1, 3.4, 8.2, { frame: VERDE, glass: DARK, rim: 0.3, o: 0.04 });
      tabernacle(kit, path, c, bay * 0.7, WALL, 4.4);
    }
    for (let k = 0; k <= n; k++) {
      const p = path.at(Math.min(len - 0.4, Math.max(0.4, k * bay)));
      spire(kit, p.x + 0.2 * p.tz, p.z - 0.2 * p.tx, WALL, k % n ? 5 : 8, k % n ? 0.6 : 1);
    }
    panel(kit, path, 0, len, WALL - 0.5, WALL + 0.2, STONE, 0, 0.5);
  }
  // the front: two doors under their gables with rose windows, three tabernacles round them
  const len = west.length;
  for (const c of [len * 0.28, len * 0.72]) {
    lancet(kit, west, c, 2.4, 0.6, 5.6, { frame: VERDE, glass: '#4a3626', rim: 0.45, o: 0.04 });
    wall(kit, west, [[c - 2.6, WALL - 0.2], [c + 2.6, WALL - 0.2], [c, WALL + 4.2]], { o0: -0.3, o1: 0.35, hex: MARBLE });
    oculus(kit, west, c, WALL + 1.2, 0.8, { frame: VERDE, glass: DARK, rim: 0.2, o: 0.35 });
    oculus(kit, west, c, 7.8, 1.1, { frame: VERDE, glass: DARK, rim: 0.3, o: 0.04 });
  }
  for (const s of [0.3, len / 2, len - 0.3]) {
    const p = west.at(s);
    spire(kit, p.x - 0.4, p.z, WALL - 1, s === len / 2 ? 10 : 9, 1.3);
  }
  // the east end's three gables over the walls, and its spires
  const elen = east.length;
  for (const [c, w, h] of [[elen * 0.2, elen * 0.36, 2.8], [elen / 2, elen * 0.4, 4.2], [elen * 0.8, elen * 0.36, 2.8]]) {
    wall(kit, east, [[c - w / 2, WALL - 0.2], [c + w / 2, WALL - 0.2], [c, WALL + h]], { o0: -0.3, o1: 0.3, hex: MARBLE });
  }
  lancet(kit, east, elen / 2, 1.4, 4, 8.6, { frame: VERDE, glass: DARK, rim: 0.3, o: 0.04 });
  // the roof: one gable along it, and the stripes of its marble ends
  gable(kit, 0, WALL, 0, 2 * HL - 0.4, 2 * HW + 0.6, RIDGE - WALL, LEAD);
  wall(kit, west, [[0.4, WALL], [len - 0.4, WALL], [len / 2, RIDGE + 0.3]], { o0: -0.6, o1: -0.2, hex: MARBLE });
  return kit.mesh(kitMat(0.85));
}

// it stands in for the map's block of it (area), and riders bump into it (foot)
const FOOT = onMap(X, Z, TURN, rect(-HL - 0.6, -HW - 0.6, HL + 0.6, HW + 0.6));
export const SPINA = [{
  id: 'santa-maria-della-spina', name: 'Santa Maria della Spina', x: X, z: Z, turn: TURN, reach: 90,
  area: [onMap(X, Z, TURN, rect(-HL - 2, -HW - 2, HL + 2, HW + 2))], foot: [FOOT],
  make: spina,
}];
