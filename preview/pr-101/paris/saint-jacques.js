// The Tour Saint-Jacques (1509-23), all that is left of the church of Saint-Jacques-de-la-Boucherie,
// in its square off the rue de Rivoli, modelled by hand in place of the map's block of it, from its
// measurements and photos, in game metres (the real ones times 1.25), on the map's outline: 16 m by
// 15 m with its buttresses, 65 m to its terrace. Flamboyant Gothic, in pale limestone:
//   the ground floor open on all four sides under tall pointed arches, Pascal's statue in it
//   three storeys of tall traceried windows, blind, between the corner buttresses that step in at
//     each storey, every step crowned with pinnacles
//   the pierced balustrade round the terrace, the big pinnacles at its corners, and on them Saint
//     James and the beasts of three of the Evangelists, the lion, the ox and the eagle
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 235.7, Z = -182.2, TURN = -0.376; // its middle, and its faces turned from east
const HX = 6.4, HZ = 5.9; // half the core's size
const STOREYS = [10.4, 26.2, 42, 58], TOP = 58;
const STONE = '#ddd7c8', STONE2 = '#cdc6b4', DARK = '#3e3c38';

export function saintJacques() {
  const kit = new Kit();
  // the core, open underneath
  kit.box(2 * HX - 1, TOP - STOREYS[0], 2 * HZ - 1, STONE2, 0, (STOREYS[0] + TOP) / 2, 0);
  square(HX, HZ, 0.8).forEach((path, f) => {
    const len = path.length, off = f % 2 ? -0.8 : 0, mid = len / 2 + off, w = (f % 2 ? 2 * HZ : 2 * HX) - 4.6;
    wall(kit, path, [[0, 0], [len, 0], [len, STOREYS[0]], [0, STOREYS[0]]], { holes: [pointedRing(mid, w, 0, STOREYS[0] - 0.8, 0.9, 8)], o0: -0.8, o1: 0, hex: STONE });
    // the storeys' windows, two lights each under the arch, and the tracery's mullion
    for (let k = 0; k < 3; k++) {
      const y0 = STOREYS[k] + 1.6, y1 = STOREYS[k + 1] - 1.4;
      wall(kit, path, [[0, STOREYS[k]], [len, STOREYS[k]], [len, STOREYS[k + 1]], [0, STOREYS[k + 1]]], { holes: [pointedRing(mid, w - 0.6, y0, y1, 1, 8)], o0: -0.8, o1: 0, hex: STONE });
      wall(kit, path, pointedRing(mid, w - 0.6, y0, y1, 1, 8), { o0: -0.75, o1: -0.55, hex: shade(STONE2, -0.15) });
      for (const d of [-1, 1]) wall(kit, path, pointedRing(mid + (d * (w - 0.6)) / 4, (w - 0.6) / 2 - 0.4, y0, y1 - 2.6, 1, 6), { o0: -0.55, o1: -0.45, hex: DARK });
      wall(kit, path, [[mid - 0.16, y0], [mid + 0.16, y0], [mid + 0.16, y1 - 2.4], [mid - 0.16, y1 - 2.4]], { o0: -0.55, o1: -0.2, hex: STONE });
      sweep(kit, path, 0, len, [[-0.1, STOREYS[k] - 0.3], [0.3, STOREYS[k] - 0.3], [0.3, STOREYS[k] + 0.2], [-0.1, STOREYS[k] + 0.2]], STONE, { step: len });
      // the finial over the window's point
      const p = path.at(mid), x = p.x + 0.25 * p.tz, z = p.z - 0.25 * p.tx;
      kit.add(new THREE.ConeGeometry(0.4, 2.2, 4).rotateY(Math.PI / 4), STONE, x, y1 + 0.9, z);
    }
  });
  // the corner buttresses, two to a corner, stepping in at each storey, their pinnacles
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    for (const [k, [y0, y1]] of [[0, STOREYS[1]], [STOREYS[1], STOREYS[2]], [STOREYS[2], TOP]].entries()) {
      const d = 1.9 - k * 0.45;
      for (const [ax, az] of [[1, 0], [0, 1]]) {
        const x = sx * (HX - 0.6 + ax * d / 2), z = sz * (HZ - 0.6 + az * d / 2);
        kit.box(ax ? d : 1.2, y1 - y0, az ? d : 1.2, STONE, x, (y0 + y1) / 2, z);
        kit.add(new THREE.ConeGeometry(0.55, 2.8, 4).rotateY(Math.PI / 4), STONE, sx * (HX - 0.6 + ax * d), y1 + 1.4, sz * (HZ - 0.6 + az * d));
      }
    }
  }
  // the terrace's pierced balustrade
  kit.box(2 * HX + 1.2, 0.5, 2 * HZ + 1.2, STONE, 0, TOP + 0.25, 0);
  square(HX + 0.6, HZ + 0.6).forEach(path => {
    const len = path.length, n = Math.round(len / 1.1);
    wall(kit, path, [[0, TOP + 0.5], [len, TOP + 0.5], [len, TOP + 2], [0, TOP + 2]], { holes: Array.from({ length: n }, (_, k) => pointedRing(((k + 0.5) / n) * len, len / n - 0.35, TOP + 0.8, TOP + 1.8, 1, 4)), o0: -0.3, o1: 0, hex: STONE });
  });
  // the four great pinnacles, and Saint James and the beasts on them
  const beasts = [['james', 1, -1], ['lion', 1, 1], ['ox', -1, 1], ['eagle', -1, -1]];
  for (const [who, sx, sz] of beasts) {
    const x = sx * (HX + 0.4), z = sz * (HZ + 0.4);
    kit.box(2.2, 3, 2.2, STONE, x, TOP + 1.5, z);
    if (who === 'james') {
      kit.add(new THREE.CylinderGeometry(0.5, 0.75, 3.2, 8), STONE, x, TOP + 4.6, z);
      kit.add(new THREE.SphereGeometry(0.38, 8, 6), STONE, x, TOP + 6.5, z);
      kit.rod([x + 0.6, TOP + 3.1, z], [x + 0.6, TOP + 7.3, z], 0.08, STONE); // his pilgrim's staff
    } else if (who === 'eagle') {
      kit.box(0.8, 1.4, 0.8, STONE, x, TOP + 3.7, z).box(2.4, 0.9, 0.3, STONE, x, TOP + 4.1, z, 0, Math.PI / 4);
    } else {
      kit.box(1, 1.2, 2, STONE, x, TOP + 3.6, z, 0, Math.PI / 4).box(0.8, 0.9, 0.8, STONE, x + sx * 0.6, TOP + 4.4, z - sz * 0.6);
    }
  }
  // Pascal, sitting on his pedestal under the tower
  kit.box(2.2, 2, 2.2, '#ece7dc', 0, 1, 0);
  kit.add(new THREE.CylinderGeometry(0.6, 0.85, 2, 8), '#ece7dc', 0, 3, 0);
  kit.add(new THREE.SphereGeometry(0.35, 8, 6), '#ece7dc', 0, 4.3, 0);
  return kit.mesh(kitMat(0.9));
}

export const SAINT_JACQUES = [{
  id: 'tour-saint-jacques', name: 'Tour Saint-Jacques', x: X, z: Z, turn: TURN, reach: 120,
  area: [onMap(X, Z, TURN, rect(-HX - 2.4, -HZ - 2.4, HX + 2.4, HZ + 2.4))],
  foot: [onMap(X, Z, TURN, rect(-HX - 1.4, -HZ - 1.4, HX + 1.4, HZ + 1.4))],
  make: saintJacques,
}];
