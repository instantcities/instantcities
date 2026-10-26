// The Westertoren (Hendrick de Keyser, finished 1638), the tower of the Westerkerk, the tallest in
// Amsterdam, modelled by hand in place of the map's stack of it, from its measurements and photos,
// in game metres (the real ones times 1.25), on the map's outline: 14 m square, the crown at 106 m.
// The church stays the map's.
//   the square brick shaft with its bands and corners of sandstone
//   the stone storey over it, the clock in each face, its balustrade and corner vases
//   the two octagonal storeys of stone and wood, narrowing, their columns and their balconies
//   the lantern, and on top the imperial crown of Maximilian in blue, red and gold
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, polygon, wall, sweep, archRing, onMap, rect } from '../core/js/arcade.js';

const X = -591.4, Z = -553.7, TURN = -0.053; // its middle, and its faces turned from east
const H = 6.9, SHAFT = 50, CLOCK = [50, 65], OCT = [[65, 80, 5.6], [80, 90, 4]], LANTERN = [90, 99];
const BRICK = '#9d4f39', SAND = '#ddd2b6', SAND2 = '#cdbf9e', WOOD = '#e2dccd', BLUE = '#3769b5', GOLD = '#d7ad3e', RED = '#b8312b', DARK = '#2b2622';

export function westertoren() {
  const kit = new Kit();
  // the shaft: brick, its sandstone bands and quoins, its windows
  kit.box(2 * H, SHAFT, 2 * H, BRICK, 0, SHAFT / 2, 0);
  square(H).forEach(path => {
    const len = path.length;
    for (const y of [0.6, 12, 24, 36, 48]) sweep(kit, path, 0, len, [[-0.1, y - 0.6], [0.25, y - 0.6], [0.25, y], [-0.1, y]], SAND, { step: len });
    for (const y of [16, 28, 40]) {
      const ring = archRing(len / 2, 1.8, y, y + 4.6, 6);
      wall(kit, path, ring, { o0: 0, o1: 0.05, hex: DARK });
      wall(kit, path, [[len / 2 - 1.3, y - 0.4], [len / 2 + 1.3, y - 0.4], [len / 2 + 1.3, y], [len / 2 - 1.3, y]], { o0: 0, o1: 0.2, hex: SAND });
    }
  });
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) for (let y = 0; y < SHAFT; y += 2.4) {
    kit.box(1.2, 1.2, 1.2, SAND, sx * (H - 0.5), y + 0.6, sz * (H - 0.5));
  }
  // the stone storey with the clocks, its balustrade and the vases at its corners
  kit.box(2 * H - 1.6, CLOCK[1] - CLOCK[0], 2 * H - 1.6, SAND, 0, (CLOCK[0] + CLOCK[1]) / 2, 0);
  square(H - 0.8).forEach(path => {
    const len = path.length, m = len / 2, disc = (r, o, hex) => wall(kit, path, Array.from({ length: 28 }, (_, k) => [m + r * Math.cos((k / 28) * 2 * Math.PI), 58 + r * Math.sin((k / 28) * 2 * Math.PI)]), { o0: o, o1: o + 0.08, hex });
    disc(3, 0, BLUE);
    disc(2.6, 0.08, '#2f5799');
    for (const [a, l] of [[1.2, 1.6], [2.6, 2.3]]) wall(kit, path, [[m - 0.08, 58], [m + 0.08, 58], [m + l * Math.cos(a) + 0.08, 58 + l * Math.sin(a)], [m + l * Math.cos(a) - 0.08, 58 + l * Math.sin(a)]], { o0: 0.16, o1: 0.22, hex: GOLD });
    for (const s of [0.8, len - 0.8]) wall(kit, path, [[s - 0.5, CLOCK[0]], [s + 0.5, CLOCK[0]], [s + 0.5, CLOCK[1]], [s - 0.5, CLOCK[1]]], { o0: 0, o1: 0.4, hex: SAND2 });
  });
  kit.box(2 * H + 0.6, 0.8, 2 * H + 0.6, SAND2, 0, SHAFT + 0.4, 0);
  for (const path of square(H)) for (let k = 0; k <= 12; k++) {
    const p = path.at((k / 12) * path.length);
    kit.add(new THREE.CylinderGeometry(0.12, 0.17, 1.1, 5), SAND, p.x, SHAFT + 1.35, p.z);
  }
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.add(new THREE.SphereGeometry(0.6, 8, 6).scale(1, 1.4, 1), SAND2, sx * H, SHAFT + 2.2, sz * H);
  kit.box(2 * H - 0.8, 0.8, 2 * H - 0.8, SAND2, 0, CLOCK[1] + 0.4, 0);
  // the two octagonal storeys: a core, columns at the corners, a balcony round each
  for (const [y0, y1, r] of OCT) {
    kit.add(new THREE.CylinderGeometry(r - 0.9, r - 0.9, y1 - y0, 8).rotateY(Math.PI / 8), WOOD, 0, (y0 + y1) / 2, 0);
    for (const path of polygon(r - 0.85, 8, Math.PI / 8)) wall(kit, path, archRing(path.length / 2, path.length * 0.5, y0 + 1.6, y1 - 2.2, 6), { o0: 0, o1: 0.05, hex: DARK });
    for (let k = 0; k < 8; k++) {
      const a = Math.PI / 8 + (k / 8) * 2 * Math.PI;
      kit.add(new THREE.CylinderGeometry(0.32, 0.36, y1 - y0 - 1.4, 8), SAND, r * Math.cos(a), y0 + (y1 - y0 - 1.4) / 2 + 0.6, r * Math.sin(a));
    }
    kit.add(new THREE.CylinderGeometry(r + 0.6, r + 0.6, 0.8, 8).rotateY(Math.PI / 8), SAND2, 0, y1 - 0.4, 0);
    kit.add(new THREE.TorusGeometry(r + 0.4, 0.07, 3, 8).rotateX(Math.PI / 2).rotateY(Math.PI / 8), DARK, 0, y0 + 1.1, 0);
  }
  // the lantern and the crown
  kit.add(new THREE.CylinderGeometry(2.2, 2.6, LANTERN[1] - LANTERN[0], 8), WOOD, 0, (LANTERN[0] + LANTERN[1]) / 2, 0);
  kit.add(new THREE.CylinderGeometry(2.8, 2.8, 0.5, 8), SAND2, 0, LANTERN[1] + 0.25, 0);
  const c = LANTERN[1] + 0.5;
  kit.add(new THREE.CylinderGeometry(2.4, 2.2, 1.6, 12), GOLD, 0, c + 0.8, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    kit.rod([2.2 * Math.cos(a), c + 1.6, 2.2 * Math.sin(a)], [0.2 * Math.cos(a), c + 5.2, 0.2 * Math.sin(a)], 0.22, GOLD, 5);
    kit.add(new THREE.SphereGeometry(0.28, 6, 4), k % 2 ? RED : BLUE, 2.3 * Math.cos(a), c + 1.1, 2.3 * Math.sin(a));
  }
  kit.add(new THREE.SphereGeometry(1.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), BLUE, 0, c + 1.6, 0);
  kit.add(new THREE.SphereGeometry(0.5, 8, 6), GOLD, 0, c + 5.4, 0);
  kit.box(0.2, 1.4, 0.2, GOLD, 0, c + 6.5, 0).box(0.9, 0.2, 0.2, GOLD, 0, c + 6.7, 0);
  return kit.mesh(kitMat(0.8, 0.05));
}

export const WESTERTOREN = [{
  id: 'westertoren', name: 'Westertoren', x: X, z: Z, turn: TURN, reach: 200,
  area: [onMap(X, Z, TURN, rect(-H - 1, -H - 1, H + 1, H + 1))],
  foot: [onMap(X, Z, TURN, rect(-H, -H, H, H))],
  make: westertoren,
}];
