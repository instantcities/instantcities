// The tower of the Hôtel de Ville on the Grand-Place (Jan van Ruysbroeck, 1449-55), modelled by hand
// in place of the map's pieces of it, from its measurements and photos, in game metres (the real ones
// times 1.25): 13 m square at its foot, Saint Michael at 117 m. The wings either side stay the map's.
//   the square foot, the pointed passage through it into the courtyard, and its rows of niches with
//     their statues, storey over storey, up to the balustrade with the four corner turrets
//   the three openwork stages of the octagon over it, each narrower, with pinnacles round them
//   the openwork spire, and gilded Saint Michael slaying the dragon on top
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, polygon, linePath, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = 70.3, Z = 11.7, TURN = 0.686; // the tower's middle, and its passage turned from east (local x, towards the square)
const H = 6.4, BASE = 46.3, STAGES = [[46.3, 62, 4.8], [62, 76, 4], [76, 89, 3.2]], TIP = 111;
const STONE = '#c8bb9f', STONE2 = '#b6a98c', DARK = '#292622', GOLD = '#d4ad48';

export function tower() {
  const kit = new Kit();
  // the foot, with the passage through it
  const gate = linePath(H, -H, H, H);
  wall(kit, gate, [[0, 0], [2 * H, 0], [2 * H, BASE], [0, BASE]], { holes: [pointedRing(H, 4.2, 0, 8.4, 1, 8)], o0: -2 * H, o1: 0, hex: STONE });
  square(H).forEach((path, f) => {
    const len = path.length;
    // the rows of niches, a statue in each
    for (let row = 0; row < 4; row++) {
      const y = 12 + row * 8.4, n = 3;
      for (let k = 0; k < n; k++) {
        const s = (k + 0.5) * (len / n);
        if (row === 0 && (f === 1 || f === 3) && k === 1) continue; // over the passage
        wall(kit, path, pointedRing(s, 1.5, y, y + 5, 1, 5), { o0: -0.3, o1: -0.2, hex: '#7c705d' });
        const p = path.at(s), x = p.x + 0.05 * p.tz, z = p.z - 0.05 * p.tx;
        kit.add(new THREE.CylinderGeometry(0.28, 0.36, 2.6, 6), STONE2, x, y + 1.3, z);
        kit.add(new THREE.SphereGeometry(0.24, 6, 4), STONE2, x, y + 2.8, z);
        kit.add(new THREE.ConeGeometry(0.6, 1.6, 4).rotateY(Math.PI / 4), STONE2, x, y + 5.6, z);
      }
      sweep(kit, path, 0, len, [[-0.1, y - 1], [0.35, y - 1], [0.35, y - 0.6], [-0.1, y - 0.6]], STONE2, { step: len });
    }
  });
  // the balustrade and the corner turrets
  kit.box(2 * H + 1.2, 0.8, 2 * H + 1.2, STONE2, 0, BASE + 0.4, 0);
  for (const path of square(H + 0.6)) {
    const len = path.length;
    wall(kit, path, [[0, BASE + 0.8], [len, BASE + 0.8], [len, BASE + 2.2], [0, BASE + 2.2]], { holes: Array.from({ length: 8 }, (_, k) => pointedRing((k + 0.5) * (len / 8), 0.9, BASE + 1, BASE + 2, 1, 4)), o0: -0.3, o1: 0, hex: STONE });
  }
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = sx * (H + 0.2), z = sz * (H + 0.2);
    kit.add(new THREE.CylinderGeometry(1.2, 1.2, 18.7, 8), STONE, x, BASE + 9.35, z);
    kit.add(new THREE.ConeGeometry(1.3, 6, 8), STONE2, x, BASE + 21.7, z);
    kit.add(new THREE.SphereGeometry(0.3, 6, 4), GOLD, x, BASE + 24.9, z);
  }
  // the three openwork stages of the octagon, their pinnacles, and the spire
  for (const [y0, y1, r] of STAGES) {
    kit.add(new THREE.CylinderGeometry(r - 1.2, r - 1.2, y1 - y0, 8).rotateY(Math.PI / 8), DARK, 0, (y0 + y1) / 2, 0);
    for (const path of polygon(r, 8, Math.PI / 8)) {
      const len = path.length;
      wall(kit, path, [[0, y0], [len, y0], [len, y1], [0, y1]], { holes: [pointedRing(len / 2, len - 1, y0 + 1.2, y1 - 1.6, 1, 6)], o0: -0.5, o1: 0, hex: STONE, ends: false });
      wall(kit, path, [[len / 2 - 0.1, y0 + 1.2], [len / 2 + 0.1, y0 + 1.2], [len / 2 + 0.1, y1 - 3], [len / 2 - 0.1, y1 - 3]], { o0: -0.45, o1: -0.1, hex: STONE });
      sweep(kit, path, 0, len, [[-0.2, y1 - 0.6], [0.35, y1 - 0.6], [0.35, y1], [-0.2, y1]], STONE2, { step: len });
    }
    for (let k = 0; k < 8; k++) {
      const a = Math.PI / 8 + (k / 8) * 2 * Math.PI;
      kit.add(new THREE.ConeGeometry(0.4, 4.4, 4), STONE2, (r + 0.2) * Math.cos(a), y1 + 1.8, (r + 0.2) * Math.sin(a));
    }
  }
  const s0 = STAGES[2][1];
  kit.add(new THREE.ConeGeometry(2.6, TIP - s0, 8).rotateY(Math.PI / 8), STONE, 0, (s0 + TIP) / 2, 0);
  for (let k = 0; k < 4; k++) kit.add(new THREE.TorusGeometry(2.3 - k * 0.5, 0.15, 4, 8).rotateX(Math.PI / 2), STONE2, 0, s0 + 3 + k * 4.4, 0);
  // Saint Michael and the dragon
  kit.add(new THREE.CylinderGeometry(0.35, 0.55, 3, 8), GOLD, 0, TIP + 1.5, 0);
  kit.add(new THREE.SphereGeometry(0.32, 8, 6), GOLD, 0, TIP + 3.3, 0);
  for (const k of [-1, 1]) kit.box(0.1, 1.6, 0.9, GOLD, k * 0.45, TIP + 2.6, -0.3, 0.3, 0, k * 0.35);
  kit.rod([0.3, TIP + 2.6, 0], [0.9, TIP + 0.4, 0.6], 0.07, GOLD, 4);
  kit.box(1.6, 0.4, 0.5, GOLD, 0.5, TIP + 0.2, 0.6);
  return kit.mesh(kitMat(0.85));
}

export const TOUR = [{
  id: 'tour-hotel-de-ville', name: "Tour de l'Hôtel de Ville", x: X, z: Z, turn: TURN, reach: 200,
  area: [onMap(X, Z, TURN, rect(-H - 1.4, -H - 1.4, H + 1.4, H + 1.4))],
  foot: [-1, 1].map(k => onMap(X, Z, TURN, rect(-H, Math.min(k * 2.1, k * H), H, Math.max(k * 2.1, k * H)))),
  make: tower,
}];
