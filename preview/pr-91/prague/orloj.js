// The tower of the Old Town Hall (1364) on the Old Town Square, with the Orloj (1410) on its south
// face, modelled by hand in place of the map's pieces of them, from their measurements and photos,
// in game metres (the real ones times 1.25): the map has only the tower's gallery, turrets and
// spire, floating over the square from 50 m up, and a box where the clock is.
//   the tower's shaft of pale stone, its pointed windows and string courses
//   the gallery round its top on corbels, the four corner turrets with their spires, and the steep
//     roof with its dormers and the finial
//   the Orloj in its Gothic frame: the astronomical dial in blue and gold with its zodiac ring and
//     hands, the calendar dial under it, the two windows over it where the apostles go by on the
//     hour, the figures either side (Death rings his bell) and the stone hood and pinnacle on top
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, linePath, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = 233.6, Z = 94.7, TURN = 0.423; // the tower's middle, and its faces turned from east (local +z is south, the clock's side)
const H = 5.9, SHAFT = 51.3, GALLERY = 55, ROOF = 80;
const STONE = '#c3b9a6', STONE2 = '#b0a690', SLATE = '#2f3236', GOLD = '#d3ad48', BLUE = '#2d4f86', DARK = '#26241f';

export function orloj() {
  const kit = new Kit();
  kit.box(2 * H - 0.6, SHAFT, 2 * H - 0.6, DARK, 0, SHAFT / 2, 0);
  square(H, H, 0.4).forEach((path, f) => {
    const len = path.length, off = f % 2 ? -0.4 : 0, holes = [];
    for (const y of [24, 33, 42]) holes.push(pointedRing(H + off, 1.8, y, y + 5.4, 1, 6));
    if (f !== 2) holes.push(pointedRing(H + off, 1.4, 14, 18, 1, 5));
    wall(kit, path, [[0, 0], [len, 0], [len, SHAFT], [0, SHAFT]], { holes, o0: -0.4, o1: 0, hex: STONE });
    for (const y of [22, 31, 40, 49]) sweep(kit, path, 0, len, [[-0.1, y], [0.3, y], [0.3, y + 0.45], [-0.1, y + 0.45]], STONE2, { step: len });
  });
  // the gallery on its corbels, its parapet, and the turrets at its corners
  for (const path of square(H)) for (let k = 0; k <= 6; k++) {
    const p = path.at((k / 6) * path.length);
    kit.box(0.6, 1.6, 0.6, STONE2, p.x + 0.5 * p.tz, SHAFT - 0.8, p.z - 0.5 * p.tx);
  }
  kit.box(2 * H + 3, 0.8, 2 * H + 3, STONE2, 0, SHAFT + 0.4, 0);
  square(H + 1.5).forEach(path => {
    const len = path.length;
    wall(kit, path, [[0, SHAFT + 0.8], [len, SHAFT + 0.8], [len, GALLERY], [0, GALLERY]], { holes: Array.from({ length: 6 }, (_, k) => pointedRing((k + 0.5) * (len / 6), 1, SHAFT + 1.5, GALLERY - 0.6, 1, 4)), o0: -0.4, o1: 0, hex: STONE });
  });
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = sx * (H + 1.2), z = sz * (H + 1.2);
    kit.add(new THREE.CylinderGeometry(1.3, 1, 15, 8), STONE, x, 50 + 7.5, z);
    kit.add(new THREE.ConeGeometry(1.45, 6, 8), SLATE, x, 68, z);
    kit.add(new THREE.SphereGeometry(0.3, 6, 4), GOLD, x, 71.2, z);
  }
  // the roof, its dormers, the finial
  const roof = new THREE.ConeGeometry((2 * H + 1) / Math.SQRT2, ROOF - GALLERY + 1, 4).rotateY(Math.PI / 4);
  kit.add(roof, SLATE, 0, (GALLERY - 1 + ROOF) / 2, 0);
  for (const [dx, dz, ry] of [[1, 0, Math.PI / 2], [-1, 0, Math.PI / 2], [0, 1, 0], [0, -1, 0]]) {
    kit.box(1.6, 2, 1.6, SLATE, dx * 4, GALLERY + 4, dz * 4, 0, ry);
    kit.add(new THREE.ConeGeometry(1.2, 2, 4).rotateY(Math.PI / 4), SLATE, dx * 4, GALLERY + 6, dz * 4);
  }
  kit.rod([0, ROOF - 1, 0], [0, ROOF + 4.4, 0], 0.12, GOLD);
  kit.add(new THREE.SphereGeometry(0.5, 8, 6), GOLD, 0, ROOF + 1.2, 0);
  orlojClock(kit);
  return kit.mesh(kitMat(0.85));
}

// the Orloj, standing out from the tower's south face (local +z)
function orlojClock(kit) {
  const path = linePath(3.6, H + 2.2, -3.6, H + 2.2), len = path.length, mid = len / 2;
  kit.box(7.2, 19, 2.2, STONE2, 0, 4 + 9.5, H + 1.1);
  const disc = (y, r, o, hex, n = 32) => wall(kit, path, Array.from({ length: n }, (_, k) => [mid + r * Math.cos((k / n) * 2 * Math.PI), y + r * Math.sin((k / n) * 2 * Math.PI)]), { o0: o, o1: o + 0.08, hex });
  // the astronomical dial: the blue sky over the brown earth, the gold rings, the zodiac, the hands
  disc(12.4, 2.7, 0, GOLD);
  disc(12.4, 2.45, 0.08, BLUE);
  wall(kit, path, [[mid - 2.4, 11.6], [mid + 2.4, 11.6], [mid + 2.1, 10.6], [mid - 2.1, 10.6]], { o0: 0.16, o1: 0.2, hex: '#6d4a2c' });
  wall(kit, path, Array.from({ length: 32 }, (_, k) => [mid + 0.4 + 1.5 * Math.cos((k / 32) * 2 * Math.PI), 13 + 1.5 * Math.sin((k / 32) * 2 * Math.PI)]), { o0: 0.2, o1: 0.26, hex: GOLD });
  wall(kit, path, Array.from({ length: 32 }, (_, k) => [mid + 0.4 + 1.25 * Math.cos((k / 32) * 2 * Math.PI), 13 + 1.25 * Math.sin((k / 32) * 2 * Math.PI)]), { o0: 0.26, o1: 0.3, hex: BLUE });
  for (const [a, l] of [[1.1, 2.3], [2.4, 1.8]]) {
    const ex = mid + l * Math.cos(a), ey = 12.4 + l * Math.sin(a);
    wall(kit, path, [[mid - 0.08, 12.4], [mid + 0.08, 12.4], [ex + 0.08, ey], [ex - 0.08, ey]], { o0: 0.3, o1: 0.36, hex: GOLD });
  }
  // the calendar dial under it
  disc(6.4, 1.9, 0, GOLD);
  disc(6.4, 1.6, 0.08, '#e8e0c8');
  disc(6.4, 0.6, 0.16, GOLD, 16);
  // the apostles' windows, the hood and the pinnacle over it all
  for (const d of [-1.2, 1.2]) wall(kit, path, pointedRing(mid + d, 1.2, 16.4, 19, 1, 5), { o0: 0, o1: 0.08, hex: DARK });
  wall(kit, path, [[0, 20.6], [len, 20.6], [mid, 25.4]], { o0: -2, o1: 0.2, hex: STONE });
  kit.add(new THREE.ConeGeometry(0.7, 9, 6), STONE, 0, 30, H + 1.4);
  // the figures either side of the dial: Vanity, the Miser, Death with his bell, the Turk
  for (const [u, y, hex] of [[-3.1, 14.4, '#c9b28e'], [-3.1, 10.2, '#c9b28e'], [3.1, 14.4, '#efe9dc'], [3.1, 10.2, '#c9b28e']]) {
    kit.add(new THREE.CylinderGeometry(0.22, 0.32, 1.5, 6), hex, -u, y, H + 2.6);
    kit.add(new THREE.SphereGeometry(0.2, 6, 4), hex, -u, y + 0.95, H + 2.6);
  }
}

export const ORLOJ = [{
  id: 'orloj', name: 'Staroměstská radnice', x: X, z: Z, turn: TURN, reach: 160,
  area: [onMap(X, Z, TURN, rect(-H - 3, -H - 3, H + 3, H + 4))],
  foot: [onMap(X, Z, TURN, rect(-H - 0.3, -H - 0.3, H + 0.3, H + 0.3)), onMap(X, Z, TURN, rect(-3.6, H, 3.6, H + 2.2))],
  make: orloj,
}];
