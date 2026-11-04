// The front of the Gran Teatro La Fenice (1792, rebuilt after the fires of 1836 and 1996) towards the
// Campo San Fantin, dressed by hand on the map's block of it, in game metres (the real ones times
// 1.25). The lane runs right along it, so its portico stands flat against the wall:
//   the rusticated ground floor with its three doors
//   the four Corinthian columns, the entablature with the theatre's name, the phoenix in gold over
//     the middle door, the statues of Tragedy and Comedy in their niches
//   the upper storey's windows under their pediments, and the pediment over the whole front
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, archRing } from '../core/js/arcade.js';

const A = [-353.4, 325.6], B = [-377.3, 334.6]; // the front's ends: from B to A its outside (north) is to the right
const X = (A[0] + B[0]) / 2, Z = (A[1] + B[1]) / 2;
const FACE = '#ece4d2', STONE = '#dcd2bc', DARK = '#3a3430', GOLD = '#d1ab48';

export function fenice() {
  const kit = new Kit();
  const p = linePath(B[0] - X, B[1] - Z, A[0] - X, A[1] - Z), L = p.length, m = L / 2;
  const band = (y0, y1, o0, o1, hex) => wall(kit, p, [[0, y0], [L, y0], [L, y1], [0, y1]], { o0, o1, hex });
  band(0, 26, 0.2, 0.4, FACE);
  // the rusticated ground floor: its courses, the three doors
  for (let y = 0.9; y < 6.5; y += 0.9) band(y - 0.08, y, 0.4, 0.5, STONE);
  for (const d of [-6.2, 0, 6.2]) wall(kit, p, archRing(m + d, d ? 2.4 : 3, 0, d ? 4.6 : 5.4, 10), { o0: 0.4, o1: 0.55, hex: '#4b3a2c' });
  band(6.5, 7.2, 0.4, 1, STONE);
  // the four columns on their bases, the entablature and the name in its frieze
  for (const d of [-4.6, -1.55, 1.55, 4.6]) {
    const q = p.at(m + d), x = q.x + q.tz * 1.1, z = q.z - q.tx * 1.1;
    kit.box(1.4, 1.2, 1.4, STONE, x, 7.8, z).add(new THREE.CylinderGeometry(0.55, 0.62, 7.6, 10), '#f3eee3', x, 12.2, z);
    kit.add(new THREE.CylinderGeometry(0.8, 0.55, 1, 8), '#f3eee3', x, 16.5, z).box(1.6, 0.4, 1.6, STONE, x, 17.2, z);
  }
  wall(kit, p, [[m - 6, 17.4], [m + 6, 17.4], [m + 6, 19.6], [m - 6, 19.6]], { o0: 0.4, o1: 1.9, hex: STONE });
  wall(kit, p, [[m - 4.8, 18], [m + 4.8, 18], [m + 4.8, 19], [m - 4.8, 19]], { o0: 1.9, o1: 1.95, hex: DARK });
  for (let k = 0; k < 14; k++) wall(kit, p, [[m - 4.4 + k * 0.66, 18.25], [m - 4.0 + k * 0.66, 18.25], [m - 4.0 + k * 0.66, 18.75], [m - 4.4 + k * 0.66, 18.75]], { o0: 1.95, o1: 2, hex: GOLD });
  // the phoenix in gold over the middle door, and Tragedy and Comedy in their niches
  wall(kit, p, [[m - 1.4, 9], [m + 1.4, 9], [m + 2.2, 10.4], [m, 11.6], [m - 2.2, 10.4]], { o0: 0.4, o1: 0.6, hex: GOLD });
  for (const d of [-8.4, 8.4]) {
    wall(kit, p, archRing(m + d, 2, 8.4, 13.6, 8), { o0: 0.4, o1: 0.45, hex: '#bfb39b' });
    const q = p.at(m + d), x = q.x + q.tz * 0.8, z = q.z - q.tx * 0.8;
    kit.add(new THREE.CylinderGeometry(0.35, 0.5, 2.8, 8), '#f4f0e6', x, 10.2, z).add(new THREE.SphereGeometry(0.3, 8, 6), '#f4f0e6', x, 11.9, z);
  }
  // the upper storey: its windows under their pediments, the cornice, the pediment on top
  for (const d of [-9.2, -4.6, 0, 4.6, 9.2]) {
    wall(kit, p, [[m + d - 0.9, 20.6], [m + d + 0.9, 20.6], [m + d + 0.9, 23.6], [m + d - 0.9, 23.6]], { o0: 0.4, o1: 0.45, hex: DARK });
    wall(kit, p, [[m + d - 1.3, 23.8], [m + d + 1.3, 23.8], [m + d, 24.6]], { o0: 0.4, o1: 0.7, hex: STONE });
  }
  band(25.4, 26.3, 0.4, 1.3, STONE);
  wall(kit, p, [[m - 11, 26.3], [m + 11, 26.3], [m, 30.4]], { o0: 0.2, o1: 1, hex: FACE });
  wall(kit, p, [[m - 11.5, 26.3], [m + 11.5, 26.3], [m + 11.5, 26.6], [m - 11.5, 26.6]], { o0: 0.2, o1: 1.4, hex: STONE });
  return kit.mesh(kitMat(0.85));
}

export const FENICE = [{
  id: 'la-fenice', name: 'Gran Teatro La Fenice', x: X, z: Z, reach: 50, area: [], foot: [], make: fenice,
}];
