// Het Witte Huis on the Wijnhaven (Willem Molenbroek, 1897-98), modelled by hand in place of the map's
// block of it, in game metres (the real ones times 1.25), on the map's outline: Europe's first
// skyscraper, 43 m and ten storeys of offices, which came through the bombing of 1940:
//   the walls of white glazed brick in bays between pilasters, the ground floor's tall round arches
//   the cornice, and over it the steep dark roof with its dormers, a lantern on its ridge
//   the four corner turrets rising out of the roof, each under its own pointed cap
// Riders bump into it. The model's own metres: u along its long side, v across, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, wall, archRing, onMap, rect } from '../core/js/arcade.js';

const X = 565.7, Z = 83.1, TURN = -1.31;
const HU = 12.9, HV = 12.4, EAVES = 38, RIDGE = 50;
const WHITE = '#f2f0ea', STONE = '#d9d4c8', SLATE = '#3d4247', DARK = '#2b3138', GOLD = '#b89a4a';

export function witteHuis() {
  const kit = new Kit();
  kit.box(2 * HU, EAVES, 2 * HV, WHITE, 0, EAVES / 2, 0);
  kit.box(2 * HU + 0.6, 6.5, 2 * HV + 0.6, STONE, 0, 3.25, 0);
  square(HU, HV).forEach(p => {
    const L = p.length, bays = 5, bay = L / bays;
    for (let k = 0; k < bays; k++) {
      const s = (k + 0.5) * bay;
      // the ground floor's arches, then a pair of windows to a bay on each storey above
      wall(kit, p, archRing(s, bay * 0.62, 0.6, 5.6, 8), { o0: 0.2, o1: 0.45, hex: DARK });
      for (let y = 7.5; y < EAVES - 3; y += 3.6) for (const d of [-0.22, 0.22]) {
        const top = y + 2.3;
        wall(kit, p, y > EAVES - 7 ? archRing(s + d * bay, bay * 0.3, y, top, 6) : [[s + d * bay - bay * 0.15, y], [s + d * bay + bay * 0.15, y], [s + d * bay + bay * 0.15, top], [s + d * bay - bay * 0.15, top]], { o0: 0, o1: 0.1, hex: DARK });
      }
      // the pilasters between the bays, and the bands at every other storey
      if (k) wall(kit, p, [[k * bay - 0.35, 6.5], [k * bay + 0.35, 6.5], [k * bay + 0.35, EAVES], [k * bay - 0.35, EAVES]], { o0: 0, o1: 0.3, hex: WHITE });
    }
    for (const y of [6.5, 14.5, 21.7, 28.9]) wall(kit, p, [[0, y], [L, y], [L, y + 0.5], [0, y + 0.5]], { o0: 0, o1: 0.25, hex: STONE });
    wall(kit, p, [[-0.6, EAVES - 0.8], [L + 0.6, EAVES - 0.8], [L + 0.6, EAVES + 0.6], [-0.6, EAVES + 0.6]], { o0: 0, o1: 0.9, hex: STONE });
  });
  // the roof, its dormers and the lantern on the ridge
  kit.frustum(2 * HU, 2 * HV, 2 * HU - 15, 2 * HV - 17, RIDGE - EAVES, SLATE, 0, EAVES + 0.6, 0);
  for (const [a, b, ry] of [[0, -1, 0], [0, 1, 0], [-1, 0, Math.PI / 2], [1, 0, Math.PI / 2]]) for (const d of [-4.5, 4.5]) {
    const x = a ? a * (HU - 2.6) : d, z = b ? b * (HV - 2.6) : d;
    kit.box(2.4, 3, 2.4, WHITE, x, EAVES + 2.5, z, 0, ry).box(1.4, 1.8, 2.6, DARK, x, EAVES + 2.4, z, 0, ry);
    kit.add(new THREE.ConeGeometry(1.9, 1.6, 4), SLATE, x, EAVES + 4.8, z, 0, Math.PI / 4 + ry);
  }
  kit.box(4, 3, 4, WHITE, 0, RIDGE + 1.5, 0).add(new THREE.ConeGeometry(3, 4, 4), SLATE, 0, RIDGE + 5, 0, 0, Math.PI / 4);
  kit.rod([0, RIDGE + 6.5, 0], [0, RIDGE + 9, 0], 0.12, GOLD, 4);
  // the corner turrets, each with its windows and its pointed cap
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = sx * (HU - 1.6), z = sz * (HV - 1.6);
    kit.box(4.4, 13, 4.4, WHITE, x, EAVES + 6.5 - 4, z);
    for (const [a, b] of [[sx, 0], [0, sz]]) kit.box(a ? 0.2 : 1.6, 3.2, b ? 0.2 : 1.6, DARK, x + a * 2.2, EAVES + 4, z + b * 2.2);
    kit.box(5, 0.6, 5, STONE, x, EAVES + 2.8, z);
    kit.add(new THREE.ConeGeometry(3.4, 7, 4), SLATE, x, EAVES + 9 + 3.5, z, 0, Math.PI / 4);
    kit.rod([x, EAVES + 15.5, z], [x, EAVES + 17.5, z], 0.1, GOLD, 4);
  }
  return kit.mesh(kitMat(0.7));
}

export const WITTE_HUIS = [{
  id: 'witte-huis', name: 'Witte Huis', x: X, z: Z, turn: TURN, reach: 90,
  area: [onMap(X, Z, TURN, rect(-HU - 2, -HV - 2, HU + 2, HV + 2))],
  foot: [onMap(X, Z, TURN, rect(-HU - 0.3, -HV - 0.3, HU + 0.3, HV + 0.3))],
  make: witteHuis,
}];
