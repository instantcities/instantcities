// The Pont Neuf (1578-1607), the oldest bridge across the Seine in Paris, in its two arms over the
// tip of the Île de la Cité, and Henri IV on his horse between them, modelled by hand along the
// map's roads of it, in game metres (the real ones times 1.25). The river lies only a little below
// the streets in the game, so the arches show as their crowns just over the water; what makes the
// bridge are its sides:
//   seven arches in the long arm to the right bank, five in the short one to the left, a ring of
//     voussoirs round each, the piers' cutwaters
//   over every pier a half-moon bastion standing out of the side, with its bench and its lamp
//   the cornice on its row of corbels, the grotesque mascarons, and the stone parapet
//   the bronze Henri IV on his pedestal on the Place du Pont-Neuf, looking towards the Place Dauphine
// The bridge's deck and its streets stay the map's.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep } from '../core/js/arcade.js';

const X = -447, Z = -86; // the model's metres are the map's, from here
const ARMS = [[[-362.8, -234.8], [-441.5, -88.2], 7], [[-488.6, -9.7], [-530.7, 63.1], 5]]; // each arm's ends and its arches
const HALF = 12.4, LOW = -2.9, DECK = 0.3, PIER = 5;
const HENRI = [-476, -55], FACING = Math.atan2(0.49, 0.87); // the statue, and the way it looks (east)
const STONE = '#d6cdb7', STONE2 = '#c3b9a2', DARK = '#2c3236', BRONZE = '#3f4b40';

export function pontNeuf() {
  const kit = new Kit();
  for (const [[ax, az], [bx, bz], n] of ARMS) {
    const L = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / L, tz = (bz - az) / L;
    const span = (L - (n - 1) * PIER - 6) / n;
    for (const side of [1, -1]) {
      // the side's path, running so its right is outward
      const ox = tz * side * HALF, oz = -tx * side * HALF;
      const p = side > 0 ? linePath(ax - X + ox, az - Z + oz, bx - X + ox, bz - Z + oz) : linePath(bx - X + ox, bz - Z + oz, ax - X + ox, az - Z + oz);
      const at = k => (side > 0 ? 3 + k * (span + PIER) : L - 3 - k * (span + PIER) - span); // where arch k starts along p
      const holes = Array.from({ length: n }, (_, k) => flatArch(at(k), span, LOW - 0.2, -0.7));
      wall(kit, p, [[0, LOW - 1], [L, LOW - 1], [L, DECK], [0, DECK]], { holes, o0: -1.4, o1: 0, hex: STONE });
      // the voussoirs round each arch, standing a little out of the wall
      for (let k = 0; k < n; k++) {
        const outer = flatArch(at(k) - 0.7, span + 1.4, LOW - 0.2, -0.05).slice(2), inner = flatArch(at(k), span, LOW - 0.2, -0.7).slice(2).reverse();
        wall(kit, p, [...outer, ...inner], { o0: 0, o1: 0.25, hex: STONE2 });
      }
      // the cornice on its corbels, the mascarons between, and the parapet
      sweep(kit, p, 0, L, [[-1.4, DECK], [0.7, DECK], [0.7, DECK + 0.6], [-1.4, DECK + 0.6]], STONE2, { step: L });
      sweep(kit, p, 0, L, [[-0.6, DECK + 0.6], [0.3, DECK + 0.6], [0.3, DECK + 1.7], [-0.6, DECK + 1.7]], STONE, { step: L });
      for (let s = 1.2; s < L - 1; s += 2.4) {
        const q = p.at(s), x = q.x + q.tz * 0.35, z = q.z - q.tx * 0.35;
        kit.box(0.6, 0.55, 0.7, STONE2, x, DECK - 0.28, z, 0, Math.atan2(-q.tz, q.tx));
        if (Math.round(s / 2.4) % 2) kit.add(new THREE.SphereGeometry(0.3, 6, 4), '#b5aa92', q.x + q.tz * 0.75, DECK - 0.3, q.z - q.tx * 0.75);
      }
      // the piers: a cutwater under each, a half-moon bastion over it with its bench and lamp
      for (let k = 0; k + 1 < n; k++) {
        const s = at(k) + (side > 0 ? span + PIER / 2 : -PIER / 2), q = p.at(s), nx = q.tz, nz = -q.tx;
        const cx = q.x + nx * 0.2, cz = q.z + nz * 0.2, ang = Math.atan2(nx, nz);
        kit.add(new THREE.CylinderGeometry(PIER / 2 + 0.6, PIER / 2 + 0.6, DECK - LOW, 10, 1, false, 0, Math.PI), STONE, cx, (DECK + LOW) / 2, cz, 0, ang - Math.PI / 2);
        kit.add(new THREE.CylinderGeometry(PIER / 2 + 1.1, PIER / 2 + 1.1, 0.6, 10, 1, false, 0, Math.PI), STONE2, cx, DECK + 0.3, cz, 0, ang - Math.PI / 2);
        kit.add(new THREE.CylinderGeometry(PIER / 2 + 0.9, PIER / 2 + 0.9, 1.1, 10, 1, true, 0, Math.PI), STONE, cx, DECK + 1.15, cz, 0, ang - Math.PI / 2);
        kit.add(new THREE.CylinderGeometry(PIER / 2 + 0.2, PIER / 2 + 0.2, 0.5, 10, 1, false, 0, Math.PI), STONE2, cx, DECK + 0.85, cz, 0, ang - Math.PI / 2);
        kit.add(new THREE.ConeGeometry(PIER / 2 + 0.3, 3, 3).rotateY(Math.PI / 6), STONE2, cx + nx * 1.5, LOW + 1.2, cz + nz * 1.5);
        // the lamp: its post and the lantern on it
        const lx = cx + nx * 2.4, lz = cz + nz * 2.4;
        kit.rod([lx, DECK + 0.6, lz], [lx, DECK + 5, lz], 0.13, DARK, 6);
        kit.box(0.6, 0.9, 0.6, '#f2e6b5', lx, DECK + 5.5, lz).add(new THREE.ConeGeometry(0.5, 0.6, 4).rotateY(Math.PI / 4), DARK, lx, DECK + 6.25, lz);
      }
    }
  }
  // Henri IV, bronze, on his horse, on his pedestal
  const [hx, hz] = [HENRI[0] - X, HENRI[1] - Z], c = Math.cos(FACING), s = Math.sin(FACING);
  const put = (geo, hex, a, y, b, rx = 0, rz = 0) => kit.add(geo, hex, hx + a * c - b * s, y, hz + a * s + b * c, rx, -FACING, rz);
  put(new THREE.BoxGeometry(7, 1, 4.2), STONE2, 0, 0.5, 0);
  put(new THREE.BoxGeometry(6, 4.4, 3.2), STONE, 0, 3.2, 0);
  put(new THREE.BoxGeometry(6.6, 0.6, 3.8), STONE2, 0, 5.7, 0);
  // the horse, walking, its left foreleg raised
  put(new THREE.BoxGeometry(3.6, 1.4, 1.2), BRONZE, 0, 7.7, 0);
  put(new THREE.SphereGeometry(0.75, 8, 6), BRONZE, 1.6, 7.75, 0);
  put(new THREE.SphereGeometry(0.75, 8, 6), BRONZE, -1.6, 7.8, 0);
  for (const [a, b, rz] of [[1.4, 0.4, 0], [-1.4, 0.4, 0.15], [-1.4, -0.4, -0.1]]) put(new THREE.BoxGeometry(0.32, 1.9, 0.32), BRONZE, a, 6.95, b, 0, rz);
  put(new THREE.BoxGeometry(0.32, 1.1, 0.32), BRONZE, 1.75, 6.9, -0.4, 0, -1.1);
  put(new THREE.BoxGeometry(0.32, 0.9, 0.32), BRONZE, 2.1, 6.45, -0.4, 0, 0);
  put(new THREE.BoxGeometry(0.7, 1.9, 0.75), BRONZE, 2.15, 8.75, 0, 0, -0.55); // the neck
  put(new THREE.BoxGeometry(1.25, 0.55, 0.55), BRONZE, 2.85, 9.3, 0, 0, -0.75); // the head
  put(new THREE.BoxGeometry(0.15, 0.4, 0.15), BRONZE, 2.55, 9.95, 0.15);
  put(new THREE.BoxGeometry(0.15, 0.4, 0.15), BRONZE, 2.55, 9.95, -0.15);
  put(new THREE.BoxGeometry(0.35, 1.6, 0.3), BRONZE, -2.2, 7.2, 0, 0, 0.35); // the tail
  // the king: his legs either side, his cloak, his baton held out, his hat with its plume
  for (const b of [0.5, -0.5]) put(new THREE.BoxGeometry(0.9, 0.35, 0.3), BRONZE, 0.1, 8.25, b, 0, -0.3);
  put(new THREE.BoxGeometry(0.75, 1.5, 0.8), BRONZE, -0.1, 9.25, 0, 0, 0.1);
  put(new THREE.BoxGeometry(0.4, 1.4, 1.1), BRONZE, -0.6, 8.9, 0, 0, 0.25);
  put(new THREE.SphereGeometry(0.33, 8, 6), BRONZE, -0.05, 10.3, 0);
  put(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 10), BRONZE, -0.05, 10.62, 0);
  put(new THREE.CylinderGeometry(0.28, 0.3, 0.35, 8), BRONZE, -0.05, 10.82, 0);
  put(new THREE.BoxGeometry(0.5, 0.18, 0.18), BRONZE, -0.2, 11.0, 0.15, 0, 0.6);
  put(new THREE.BoxGeometry(1.2, 0.22, 0.22), BRONZE, 0.55, 9.6, 0.45, 0, -0.25);
  put(new THREE.BoxGeometry(0.9, 0.14, 0.14), BRONZE, 1.3, 9.85, 0.45, 0, -0.6);
  return kit.mesh(kitMat(0.9));
}

// a flattened arch's opening as a ring in (s, y): w wide from s, its sides going down below y0 into
// the water, its crown at y1
function flatArch(s, w, y0, y1, n = 12) {
  const ring = [[s, y0 - 0.5], [s + w, y0 - 0.5]];
  for (let k = 0; k <= n; k++) {
    const t = (k / n) * Math.PI;
    ring.push([s + w / 2 + (w / 2) * Math.cos(t), y0 + (y1 - y0) * Math.sin(t)]);
  }
  return ring;
}

const pedestal = (r) => {
  const c = Math.cos(FACING), s = Math.sin(FACING);
  return [[-r - 1, -r / 2 - 1], [r + 1, -r / 2 - 1], [r + 1, r / 2 + 1], [-r - 1, r / 2 + 1]].flatMap(([a, b]) => [HENRI[0] + a * c - b * s, HENRI[1] + a * s + b * c]);
};

export const PONT_NEUF = [{
  id: 'pont-neuf', name: 'Pont Neuf', x: X, z: Z, reach: 120,
  area: [pedestal(3)], foot: [pedestal(2.5)],
  make: pontNeuf,
}];
