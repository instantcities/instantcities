// The Old Town Bridge Tower (Staroměstská mostecká věž, Parler, c. 1380) at the east end of the
// Charles Bridge, modelled by hand in place of the map's pieces of it, from its measurements and
// photos, in game metres (the real ones times 1.25), on the map's outline: 14 m square, its roof's
// tip at 62 m. The map has it solid from the ground; the bridge goes through it.
//   the gateway along the bridge, pointed, and over it on the east face the sculptures: the kings
//     of Bohemia's arms, Charles IV and Wenceslas IV seated with Saint Vitus between them, and over
//     them the patron saints Adalbert and Sigismund, all under their pinnacled canopies
//   the gallery round the top on its corbels, the four little corner turrets, and the steep roof of
//     slate with its gilded finials
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, linePath, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = -397, Z = 215.7, TURN = -0.264; // its middle, and the bridge's way through it turned from east (local x, the Old Town to +x)
const H = 6.9, BODY = 32.5, GALLERY = 38.8, ROOF = 62.5, GATE = 3.4;
const STONE = '#6b635a', STONE2 = '#7d746a', SLATE = '#2e3135', GOLD = '#d0a944', DARK = '#211f1c';

function figure(kit, x, y, z, h, hex = STONE2) {
  kit.add(new THREE.CylinderGeometry(h * 0.16, h * 0.24, h * 0.8, 7), hex, x, y + h * 0.4, z);
  kit.add(new THREE.SphereGeometry(h * 0.12, 7, 5), hex, x, y + h * 0.88, z);
}

export function mosteckaVez() {
  const kit = new Kit();
  const gate = linePath(H, -H, H, H);
  wall(kit, gate, [[0, 0], [2 * H, 0], [2 * H, BODY], [0, BODY]], { holes: [pointedRing(H, 2 * GATE, 0, 10.5, 0.9, 8)], o0: -2 * H, o1: 0, hex: STONE });
  square(H).forEach((path, f) => {
    const len = path.length, mid = len / 2;
    for (const y of [12, 21.5, BODY - 0.6]) sweep(kit, path, 0, len, [[-0.1, y], [0.35, y], [0.35, y + 0.5], [-0.1, y + 0.5]], STONE2, { step: len });
    if (f === 1) {
      // the east face, towards the Old Town: the arms, the kings and Saint Vitus, the patron saints
      for (let k = 0; k < 7; k++) wall(kit, path, [[1 + k * 1.8, 12.6], [2.4 + k * 1.8, 12.6], [2.4 + k * 1.8, 14.2], [1 + k * 1.8, 14.2]], { o0: 0, o1: 0.15, hex: k % 2 ? '#a33a2c' : '#c9c1b1' });
      for (const [s, h] of [[mid - 3.6, 3.2], [mid, 3.6], [mid + 3.6, 3.2]]) {
        wall(kit, path, pointedRing(s, 2.4, 15, 15 + h + 2, 1, 5), { o0: -0.3, o1: -0.2, hex: DARK });
        const p = path.at(s), x = p.x + 0.2 * p.tz, z = p.z - 0.2 * p.tx;
        figure(kit, x, 15.2, z, h);
        kit.add(new THREE.ConeGeometry(0.9, 2.6, 4).rotateY(Math.PI / 4), STONE2, x, 15 + h + 3.4, z);
      }
      for (const s of [mid - 2.4, mid + 2.4]) {
        wall(kit, path, pointedRing(s, 2.2, 23, 29.5, 1, 5), { o0: -0.3, o1: -0.2, hex: DARK });
        const p = path.at(s);
        figure(kit, p.x + 0.2 * p.tz, 23.2, p.z - 0.2 * p.tx, 3.4);
      }
    } else if (f === 3) {
      for (const s of [mid - 2.6, mid + 2.6]) wall(kit, path, pointedRing(s, 1.4, 16, 21, 1, 5), { o0: -0.3, o1: -0.2, hex: DARK });
    } else {
      for (const y of [16, 25]) wall(kit, path, pointedRing(mid, 1.3, y, y + 4, 1, 5), { o0: -0.3, o1: -0.2, hex: DARK });
    }
  });
  // the gallery on its corbels, its parapet, the corner turrets
  for (const path of square(H)) for (let k = 0; k <= 6; k++) {
    const p = path.at((k / 6) * path.length);
    kit.box(0.6, 1.4, 0.6, STONE2, p.x + 0.45 * p.tz, BODY - 0.7, p.z - 0.45 * p.tx);
  }
  kit.box(2 * H + 1.8, 0.7, 2 * H + 1.8, STONE2, 0, BODY + 0.35, 0);
  square(H + 0.9).forEach(path => {
    const len = path.length;
    wall(kit, path, [[0, BODY + 0.7], [len, BODY + 0.7], [len, GALLERY - 2.6], [0, GALLERY - 2.6]], { holes: Array.from({ length: 6 }, (_, k) => pointedRing((k + 0.5) * (len / 6), 1, BODY + 1.2, GALLERY - 3.1, 1, 4)), o0: -0.3, o1: 0, hex: STONE });
  });
  kit.box(2 * H - 0.6, GALLERY - BODY, 2 * H - 0.6, STONE, 0, (BODY + GALLERY) / 2, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = sx * (H + 0.5), z = sz * (H + 0.5);
    kit.add(new THREE.CylinderGeometry(1.1, 0.9, 9, 8), STONE, x, 30 + 4.5, z);
    kit.add(new THREE.ConeGeometry(1.25, 8.5, 8), SLATE, x, 43.25, z);
    kit.add(new THREE.SphereGeometry(0.28, 6, 4), GOLD, x, 47.6, z);
  }
  // the steep roof, its dormers, the finials
  const roof = new THREE.ConeGeometry(1, ROOF - GALLERY, 4).rotateY(Math.PI / 4);
  roof.scale((2 * H + 0.4) / Math.SQRT2, 1, (2 * H + 0.4) / Math.SQRT2);
  kit.add(roof, SLATE, 0, (GALLERY + ROOF) / 2, 0);
  for (const [dx, dz, ry] of [[1, 0, Math.PI / 2], [-1, 0, Math.PI / 2], [0, 1, 0], [0, -1, 0]]) {
    kit.box(1.4, 1.8, 1.4, SLATE, dx * 4.6, GALLERY + 3.4, dz * 4.6, 0, ry);
    kit.add(new THREE.ConeGeometry(1, 1.6, 4).rotateY(Math.PI / 4), SLATE, dx * 4.6, GALLERY + 5.1, dz * 4.6);
  }
  kit.rod([0, ROOF - 1, 0], [0, ROOF + 2.6, 0], 0.1, GOLD);
  kit.add(new THREE.SphereGeometry(0.45, 8, 6), GOLD, 0, ROOF + 0.6, 0);
  return kit.mesh(kitMat(0.85));
}

// riders bump into its two sides and go through the gateway along the bridge
export const MOSTECKA_VEZ = [{
  id: 'mostecka-vez', name: 'Staroměstská mostecká věž', x: X, z: Z, turn: TURN, reach: 140,
  area: [onMap(X, Z, TURN, rect(-H - 1.6, -H - 1.6, H + 1.6, H + 1.6))],
  foot: [-1, 1].map(k => onMap(X, Z, TURN, rect(-H, Math.min(k * GATE, k * H), H, Math.max(k * GATE, k * H)))),
  make: mosteckaVez,
}];
