// The Hôtel de Ville on the Place de l'Horloge and the Tour du Jacquemart behind it, modelled by hand
// in place of the map's block, on the map's outline of it, in game metres (the real ones times 1.25):
//   the town hall of 1845-56, in pale stone: its front on the square with the arcade of round arches
//     on the ground floor, the tall windows of the first floor, the middle part standing a little
//     forward under its columns, the balustrade along the top, and the low roof of tiles behind
//   the Tour du Jacquemart rising out of the middle of it, the Gothic tower of the 14th century that
//     gives the square its name: its pointed windows, the clock face on the side towards the square,
//     and on top, under a cage of wrought iron, the bell that Jacquet and Jacquette, the two painted
//     figures beside it, strike every hour
// The model's own metres: u east towards the square, v to the south, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, archRing, pointedRing } from '../core/js/arcade.js';
import { toLocal, sides, block, flat, box4 } from './outline.js';

const X = 75.5, Z = -310, TURN = 0;
// the map's outline of the Hôtel de Ville (the city's metres)
const RING = [109.2,-285.4,109.4,-302.4,109.5,-311.4,109.5,-319.5,109.7,-336.5,109.7,-339.5,108.3,-339.5,108.3,-340.3,96.2,-340.4,96.2,-339.7,72.3,-339.9,72.3,-340.3,58.7,-340.4,58.7,-339.6,41.9,-339.8,41.8,-339.2,41.7,-329.2,58.8,-329,58.4,-290.7,41.5,-290.9,41.4,-280.3,59.5,-280.1,59.5,-279.3,71.8,-279.2,71.8,-279.8,108.3,-279.4,108.4,-280.1,109.2,-280.1,109.2,-280.8];
const EAVES = 20, FRONT = 34; // the cornice's height; the front's u
const TOWER = { u: 6, v: 0, h: 5.5, top: 41 }; // the tower's middle, half its side, its platform
const STONE = '#e9dcc0', SHADE = '#d3c29f', ROOF = '#b77352', DARK = '#2f2b28', IRON = '#2a2a2a', BLUE = '#3b5f86', RED = '#a8423a';

export function horloge() {
  const kit = new Kit(), ring = toLocal(RING, X, Z, TURN);
  block(kit, ring, 0, EAVES, STONE);
  flat(kit, ring, EAVES, ROOF);
  // the hipped roof over the main block, east of the courtyard notch
  kit.frustum(50, 59, 22, 31, 5, ROOF, 8.5, EAVES, -0.5);
  // round the sides: the cornice, the balustrade, and two storeys of windows and the attic's
  for (const p of sides(ring, { min: 6 })) {
    const L = p.length, front = p.at(L / 2).x > FRONT - 1, n = Math.floor(L / 4.4);
    wall(kit, p, [[0, EAVES - 1.2], [L, EAVES - 1.2], [L, EAVES], [0, EAVES]], { o0: 0, o1: 0.6, hex: SHADE });
    for (let s = 0.4; s < L; s += 0.75) {
      const q = p.at(s);
      kit.box(0.35, 1.1, 0.35, SHADE, q.x + 0.3 * q.tz, EAVES + 0.55, q.z - 0.3 * q.tx);
    }
    wall(kit, p, [[0, EAVES + 1.1], [L, EAVES + 1.1], [L, EAVES + 1.5], [0, EAVES + 1.5]], { o0: -0.1, o1: 0.5, hex: SHADE });
    wall(kit, p, [[0, 7.6], [L, 7.6], [L, 8.3], [0, 8.3]], { o0: 0, o1: 0.4, hex: SHADE });
    for (let k = 0; k < n; k++) {
      const s = (k + 0.5) * (L / n);
      // on the front the arcade of the ground floor, elsewhere plain windows
      wall(kit, p, front ? archRing(s, 3, 0, 6.6, 8) : [[s - 0.9, 2], [s + 0.9, 2], [s + 0.9, 5.4], [s - 0.9, 5.4]], { o0: 0, o1: 0.05, hex: DARK });
      wall(kit, p, [[s - 1, 9.6], [s + 1, 9.6], [s + 1, 14.6], [s - 1, 14.6]], { o0: 0, o1: 0.05, hex: DARK });
      wall(kit, p, [[s - 1.4, 14.9], [s + 1.4, 14.9], [s + 1.4, 15.5], [s - 1.4, 15.5]], { o0: 0, o1: 0.4, hex: SHADE });
      wall(kit, p, [[s - 0.8, 16.4], [s + 0.8, 16.4], [s + 0.8, 18.2], [s - 0.8, 18.2]], { o0: 0, o1: 0.05, hex: DARK });
    }
  }
  // the middle of the front, standing forward under its four columns and its pediment
  kit.box(1.2, EAVES + 1.5, 16, STONE, FRONT + 0.6, (EAVES + 1.5) / 2, 0);
  for (const v of [-6.5, -2.2, 2.2, 6.5]) kit.add(new THREE.CylinderGeometry(0.45, 0.5, 9.6, 10), SHADE, FRONT + 1.7, 13.2, v);
  const ped = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 8.4, 0, 0, -8.4, 0, 3.4, 0], 3));
  kit.add(ped, SHADE, FRONT + 1.3, EAVES + 1.5, 0);

  // the Tour du Jacquemart
  const { u, v, h, top } = TOWER;
  kit.box(2 * h, top, 2 * h, SHADE, u, top / 2, v);
  for (const p of sides(box4(u - h, v - h, u + h, v + h))) {
    const L = p.length, east = p.at(L / 2).x > u + h - 0.1;
    for (const y of [24, 31]) wall(kit, p, pointedRing(L / 2, 1.8, y, y + 4.4, 1, 6), { o0: 0, o1: 0.06, hex: DARK });
    wall(kit, p, [[-0.5, top - 1.3], [L + 0.5, top - 1.3], [L + 0.5, top], [-0.5, top]], { o0: -0.2, o1: 0.7, hex: STONE });
    for (let s = 0.6; s < L; s += 1.2) {
      const q = p.at(s);
      kit.box(0.4, 0.9, 0.6, STONE, q.x + 0.4 * q.tz, top - 1.75, q.z - 0.4 * q.tx, 0, Math.atan2(-q.tz, q.tx));
    }
    // the clock towards the square
    if (east) {
      kit.add(new THREE.CylinderGeometry(2.6, 2.6, 0.3, 24).rotateZ(Math.PI / 2), BLUE, u + h + 0.15, 36.5, v);
      kit.add(new THREE.TorusGeometry(2.6, 0.18, 4, 24).rotateY(Math.PI / 2), '#d8b24a', u + h + 0.3, 36.5, v);
      kit.box(0.1, 1.9, 0.22, '#d8b24a', u + h + 0.35, 37.3, v);
      kit.box(0.1, 0.22, 1.4, '#d8b24a', u + h + 0.35, 36.5, v - 0.6);
    }
  }
  // the balustrade on the platform, the iron cage with the bell, and Jacquet and Jacquette
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.box(0.7, 1.4, 0.7, STONE, u + a * (h - 0.4), top + 0.7, v + b * (h - 0.4));
  const base = top + 1, peak = top + 8.5;
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.rod([u + a * 2.6, base, v + b * 2.6], [u, peak, v], 0.08, IRON, 4);
  for (const y of [base + 2.4, base + 4.6]) kit.add(new THREE.TorusGeometry((2.6 * (peak - y)) / (peak - base) * 1.41, 0.06, 3, 4).rotateX(Math.PI / 2).rotateY(Math.PI / 4), IRON, u, y, v);
  kit.add(new THREE.CylinderGeometry(0.5, 1.1, 1.5, 10), '#8a6a3a', u, base + 2.4, v);
  kit.rod([u, peak, v], [u, peak + 1.6, v], 0.05, IRON, 4);
  for (const [s, coat] of [[-1, RED], [1, BLUE]]) {
    kit.add(new THREE.CylinderGeometry(0.35, 0.5, 1.8, 8), coat, u + 0.6, base + 0.9, v + s * 1.7);
    kit.add(new THREE.SphereGeometry(0.3, 6, 4), '#e2c7a6', u + 0.6, base + 2.1, v + s * 1.7);
  }
  return kit.mesh(kitMat(0.86));
}

export const HORLOGE = [{ id: 'hotel-de-ville', name: 'Hôtel de Ville', x: X, z: Z, turn: TURN, reach: 90, area: [RING], foot: [RING], make: horloge }];
