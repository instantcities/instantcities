// The Loggia della Mercanzia (1417-44, by Sano di Matteo, its upper storey added in the 17th
// century), the merchants' loggia at the Croce del Travaglio, where Banchi di Sopra, Banchi di Sotto
// and Via di Città meet behind the Campo, modelled by hand in place of the map's piece of it, from
// its measurements and photos, in game metres (the real ones times 1.25), on the map's outline:
//   three round arches to the street and one to each side, on piers with Gothic niches holding the
//     saints of Vecchietta and Federighi (Peter and Paul, Ansanus, Savinus and Victor)
//   the marble benches along its sides, its vaults
//   the frieze over the arches, the upper storey of plaster with its three windows, the tiled roof
// Riders ride in under it between its piers.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { panel, lancet } from '../florence/marble.js';
import { bayRing } from '../pisa/romanico.js';
import { TRAVERTINE, TILE } from './palazzo.js';

const X = 133.65, Z = -119.1, TURN = 0.7097; // the middle of its front, which looks out to local -z
const HL = 14.4, D = 11.4, P = 2.4; // half its width, its depth, the piers' width
const ARCH = 16, FRIEZE = 18.5, TOP = 26, RIDGE = 29; // the frieze's foot and top, the walls' top, the ridge
const STONE = shade(TRAVERTINE, -0.06), PLASTER = '#d9b48a', SHADOW = '#6d6458';

// a niche with its statue on a pier's face at s, from y
function niche(kit, path, s, y) {
  lancet(kit, path, s, 1.1, y, y + 2.8, { frame: STONE, glass: SHADOW, rim: 0.2, r: 0.9, o: 0.02 });
  wall(kit, path, [[s - 0.8, y + 3], [s + 0.8, y + 3], [s, y + 4.4]], { o0: 0, o1: 0.25, hex: TRAVERTINE });
  const p = path.at(s);
  kit.add(new THREE.CylinderGeometry(0.28, 0.36, 2.2, 6), shade(TRAVERTINE, 0.06), p.x + 0.3 * p.tz, y + 1.2, p.z - 0.3 * p.tx);
  kit.add(new THREE.SphereGeometry(0.2, 6, 4), shade(TRAVERTINE, 0.06), p.x + 0.3 * p.tz, y + 2.5, p.z - 0.3 * p.tx);
}

export function mercanzia() {
  const kit = new Kit();
  const front = linePath(-HL, 0, HL, 0), len = front.length, bay = len / 3; // its outside towards -z
  const east = linePath(HL, 0, HL, D), west = linePath(-HL, D, -HL, 0);
  // the piers on the front, and the arches between them with the spandrels over them
  for (let k = 0; k < 3; k++) wall(kit, front, bayRing(k * bay, (k + 1) * bay, 0, FRIEZE, (k + 0.5) * bay, bay - P, ARCH - 0.6), { o0: -1.6, o1: 0, hex: TRAVERTINE });
  for (let k = 0; k <= 3; k++) {
    const s = Math.min(len - P / 2, Math.max(P / 2, k * bay));
    panel(kit, front, s - P / 2 - 0.1, s + P / 2 + 0.1, 0, 0.8, STONE, 0, 0.3);
    niche(kit, front, s, 4.4);
  }
  // the side arches, and the back wall (the palazzo's) inside
  for (const path of [east, west]) {
    wall(kit, path, bayRing(0, D, 0, FRIEZE, D / 2, D - 2 * P, ARCH - 1.6), { o0: -1.6, o1: 0, hex: TRAVERTINE });
    niche(kit, path, path === east ? P / 2 : D - P / 2, 4.4);
  }
  kit.box(2 * HL, FRIEZE, 0.6, shade(TRAVERTINE, -0.14), 0, FRIEZE / 2, D - 0.3);
  // the benches along the sides and the back, the ceiling of its vaults
  for (const u of [-HL + 2.2, HL - 2.2]) kit.box(0.8, 0.9, D - 3.6, '#e6e0d2', u, 0.45, D / 2);
  kit.box(2 * HL - 4, 0.9, 0.8, '#e6e0d2', 0, 0.45, D - 1);
  kit.box(2 * HL - 2, 0.4, D - 1.6, shade(TRAVERTINE, -0.2), 0, ARCH + 1.2, D / 2);
  // the frieze, the upper storey with its three windows, the cornice and the roof
  for (const path of [front, east, west]) {
    panel(kit, path, -0.3, path.length + 0.3, FRIEZE - 0.6, FRIEZE + 0.3, STONE, 0, 0.6);
    wall(kit, path, [[0, FRIEZE], [path.length, FRIEZE], [path.length, TOP], [0, TOP]], { o0: -0.6, o1: 0, hex: PLASTER });
    panel(kit, path, -0.3, path.length + 0.3, TOP - 0.6, TOP, STONE, 0, 0.7);
  }
  for (let k = 0; k < 3; k++) {
    const s = (k + 0.5) * bay;
    panel(kit, front, s - 1.5, s + 1.5, FRIEZE + 2, FRIEZE + 6, STONE, 0, 0.15);
    panel(kit, front, s - 1.1, s + 1.1, FRIEZE + 2.3, FRIEZE + 5.7, '#2e3236', 0.1, 0.1);
    panel(kit, front, s - 1.8, s + 1.8, FRIEZE + 6, FRIEZE + 6.5, STONE, 0, 0.35);
  }
  kit.box(2 * HL, TOP - FRIEZE, 0.6, PLASTER, 0, (FRIEZE + TOP) / 2, D - 0.3);
  kit.frustum(2 * HL + 1.2, D + 1.2, 2 * HL - D, 0.01, RIDGE - TOP, TILE, 0, TOP, D / 2);
  return kit.mesh(kitMat(0.85));
}

// it stands in for the map's piece of it (area); riders bump into its piers and ride in between (foot)
const piers = [-HL, -HL / 3, HL / 3, HL].map(u => rect(Math.max(-HL, u - P / 2), 0, Math.min(HL, u + P / 2), 1.6));
const FOOT = [...piers, rect(-HL, D - P, -HL + 1.6, D), rect(HL - 1.6, D - P, HL, D), rect(-HL, D - 0.6, HL, D)].map(r => onMap(X, Z, TURN, r));
export const MERCANZIA = [{
  id: 'loggia-della-mercanzia', name: 'Loggia della Mercanzia', x: X, z: Z, turn: TURN, reach: 90,
  area: [onMap(X, Z, TURN, [[-HL - 0.5, -0.5], [HL + 0.5, -0.5], [HL + 0.5, D - 0.2], [-HL - 0.5, D - 0.2]])], foot: FOOT,
  make: mercanzia,
}];
