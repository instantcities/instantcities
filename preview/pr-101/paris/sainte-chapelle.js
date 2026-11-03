// The Sainte-Chapelle (1242-48), Saint Louis's palace chapel in the courtyard of the Palais de
// Justice, modelled by hand in place of the map's building parts of it, from its measurements, in
// game metres (the real ones times 1.25), on the map's outline: 36 m long with its apse, 14.5 m wide,
// the roof's ridge at 52.5 m and the spire at 94 m. A glass house of Rayonnant Gothic:
//   the lower chapel's squat windows, and over it the upper chapel's walls nearly all window, tall
//     lancets of dark stained glass between the buttresses and their pinnacles, round the apse too
//   the west front: the two-storey porch, the great flamboyant rose and the gable between two
//     octagonal turrets with their spirelets
//   the steep lead roof with its gilt cresting, the slender openwork spire with its gilt bands, and
//     the angel on the apse
// The model's own metres: u along the axis from its middle towards the apse, v across it, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = -115.6, Z = 181.9, TURN = -0.536;
const STONE = '#e0d8c6', STONE2 = '#cec5b1', GLASS = '#2d3654', LEAD = '#5f6a74', GOLD = '#c9a64a';
const HW = 7.25, FRONT = -18.2, APSE = 11, WALL = 37, RIDGE = 52.5, SPIRE = 93.8, LOW = 10.5;

export function sainteChapelle() {
  const kit = new Kit();
  const lancet = (path, s, w, y0, y1, r = 1.1) => {
    wall(kit, path, pointedRing(s, w, y0, y1, r, 7), { o0: 0, o1: -0.3, hex: GLASS });
    wall(kit, path, [[s - 0.15, y0], [s + 0.15, y0], [s + 0.15, y1 - 3], [s - 0.15, y1 - 3]], { o0: -0.3, o1: -0.45, hex: STONE2 });
    for (const y of [y0 + (y1 - y0) * 0.33, y0 + (y1 - y0) * 0.6]) wall(kit, path, [[s - w / 2, y - 0.12], [s + w / 2, y - 0.12], [s + w / 2, y + 0.12], [s - w / 2, y + 0.12]], { o0: -0.3, o1: -0.4, hex: STONE2 });
  };
  const buttress = (x, z, nx, nz) => {
    const d = 2.6, bx = x + nx * d / 2, bz = z + nz * d / 2, ang = Math.atan2(-nz, nx);
    kit.box(d, WALL, 1.6, STONE, bx, WALL / 2, bz, 0, ang);
    kit.box(d - 1, 3, 1.4, STONE, x + nx * 0.8, WALL + 1.5, z + nz * 0.8, 0, ang);
    kit.add(new THREE.ConeGeometry(0.8, 5, 4).rotateY(Math.PI / 4), STONE2, x + nx * 0.8, WALL + 5.5, z + nz * 0.8);
  };

  // the body, its two storeys of windows along both sides between the buttresses
  kit.box(APSE - FRONT, WALL, 2 * HW, STONE, (APSE + FRONT) / 2, WALL / 2, 0);
  const BAYS = 4, bay = (APSE - FRONT) / BAYS;
  for (const sv of [-1, 1]) {
    const side = sv > 0 ? linePath(FRONT, HW, APSE, HW) : linePath(APSE, -HW, FRONT, -HW);
    for (let k = 0; k < BAYS; k++) {
      const s = (k + 0.5) * bay;
      lancet(side, s, bay - 2.6, LOW + 1.5, WALL - 1.5);
      wall(kit, side, pointedRing(s, 3, 2, 7, 1, 5), { o0: 0, o1: -0.3, hex: GLASS });
    }
    for (let k = 0; k <= BAYS; k++) buttress(FRONT + k * bay, sv * HW, 0, sv);
    kit.box(APSE - FRONT, 1, 0.8, STONE2, (APSE + FRONT) / 2, LOW, sv * (HW + 0.3));
    kit.box(APSE - FRONT, 1.4, 0.6, STONE2, (APSE + FRONT) / 2, WALL + 0.7, sv * (HW - 0.2));
  }
  // the apse: seven sides of a polygon, a window in each, a buttress at each corner
  const N = 7, corner = k => { const a = -Math.PI / 2 + (k / N) * Math.PI; return [APSE + HW * Math.cos(a), HW * Math.sin(a)]; };
  kit.add(new THREE.CylinderGeometry(HW - 0.05, HW - 0.05, WALL, N, 1, false, 0, Math.PI), STONE, APSE, WALL / 2, 0);
  for (let k = 0; k < N; k++) {
    const [x0, z0] = corner(k), [x1, z1] = corner(k + 1), side = linePath(x1, z1, x0, z0);
    lancet(side, side.length / 2, side.length - 1.8, LOW + 1.5, WALL - 1.5, 1.4);
    if (k > 0) { const n = Math.hypot(x0 - APSE, z0); buttress(x0, z0, (x0 - APSE) / n, z0 / n); }
  }

  // the roof, steep, with its gilt cresting, over the body and the apse
  const shape = new THREE.Shape([new THREE.Vector2(-HW - 0.4, 0), new THREE.Vector2(HW + 0.4, 0), new THREE.Vector2(0, RIDGE - WALL)]);
  kit.add(new THREE.ExtrudeGeometry(shape, { depth: APSE - FRONT, bevelEnabled: false }), LEAD, FRONT, WALL, 0, 0, Math.PI / 2);
  kit.add(new THREE.ConeGeometry(HW + 0.4, RIDGE - WALL, N, 1, false, 0, Math.PI), LEAD, APSE, (WALL + RIDGE) / 2, 0);
  kit.box(APSE - FRONT, 0.5, 0.4, GOLD, (APSE + FRONT) / 2, RIDGE + 0.2, 0);
  for (let u = FRONT + 1.5; u < APSE; u += 1.6) kit.add(new THREE.ConeGeometry(0.25, 1.3, 4), GOLD, u, RIDGE + 1, 0);
  // the angel on the apse
  kit.add(new THREE.CylinderGeometry(0.35, 0.5, 2.2, 6), GOLD, APSE + 0.5, RIDGE - 1, 0);
  kit.box(0.3, 1.4, 2.2, GOLD, APSE + 0.5, RIDGE - 0.6, 0);

  // the west front: the porch of two storeys, the rose over it, the gable between the turrets
  const P = FRONT - 3.2;
  kit.box(3.2, 16, 2 * HW, STONE, (FRONT + P) / 2, 8, 0);
  const porch = linePath(P, HW, P, -HW);
  for (let k = 0; k < 3; k++) wall(kit, porch, pointedRing(HW * 2 * (k + 0.5) / 3, 3.4, 0, 6.5, 1, 6), { o0: 0, o1: 0.3, hex: '#463e38' });
  for (let k = 0; k < 3; k++) wall(kit, porch, pointedRing(HW * 2 * (k + 0.5) / 3, 3.4, 8, 14.5, 1, 6), { o0: 0, o1: 0.3, hex: GLASS });
  kit.box(3.6, 1, 2 * HW + 0.4, STONE2, (FRONT + P) / 2, 16.3, 0);
  const front = linePath(FRONT, HW, FRONT, -HW);
  wall(kit, front, pointedRing(HW, 12.4, 17.5, WALL - 0.5, 1.1, 10), { o0: 0, o1: 0.25, hex: STONE2 });
  kit.add(new THREE.CylinderGeometry(5.4, 5.4, 0.5, 28), GLASS, FRONT - 0.4, 27, 0, 0, 0, Math.PI / 2);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    kit.rod([FRONT - 0.7, 27, 0], [FRONT - 0.7, 27 + 5.3 * Math.sin(a), 5.3 * Math.cos(a)], 0.16, STONE2, 4);
  }
  kit.add(new THREE.TorusGeometry(2.4, 0.18, 4, 18), STONE2, FRONT - 0.7, 27, 0, 0, Math.PI / 2);
  const gable = new THREE.Shape([new THREE.Vector2(-HW, 0), new THREE.Vector2(HW, 0), new THREE.Vector2(0, RIDGE - WALL + 1)]);
  kit.add(new THREE.ExtrudeGeometry(gable, { depth: 0.9, bevelEnabled: false }), STONE, FRONT - 0.9, WALL, 0, 0, Math.PI / 2);
  kit.add(new THREE.ConeGeometry(0.5, 2.6, 4), STONE2, FRONT - 0.5, RIDGE + 2.4, 0);
  for (const sv of [-1, 1]) {
    const z = sv * (HW + 0.6);
    kit.add(new THREE.CylinderGeometry(1.7, 1.9, 47.5, 8), STONE, FRONT - 1.2, 47.5 / 2, z);
    for (const y of [16.5, 30, 44]) kit.add(new THREE.CylinderGeometry(2.05, 2.05, 0.6, 8), STONE2, FRONT - 1.2, y, z);
    kit.add(new THREE.ConeGeometry(1.8, 10, 8), STONE2, FRONT - 1.2, 47.5 + 5, z);
  }

  // the spire: its lantern of open lancets and pinnacles, the needle with its gilt bands
  const SU = 3, SB = RIDGE - 4;
  kit.add(new THREE.CylinderGeometry(2.4, 2.6, 14, 8), STONE2, SU, SB + 7, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    kit.box(0.3, 7, 1.1, GLASS, SU + 2.5 * Math.cos(a), SB + 9, 2.5 * Math.sin(a), 0, -a);
    const b = a - Math.PI / 8;
    kit.add(new THREE.ConeGeometry(0.35, 4, 4), STONE2, SU + 2.9 * Math.cos(b), SB + 16, 2.9 * Math.sin(b));
  }
  kit.add(new THREE.ConeGeometry(2.4, SPIRE - SB - 14, 8), LEAD, SU, (SB + 14 + SPIRE) / 2, 0);
  for (const t of [0.15, 0.35, 0.55]) {
    const y = SB + 14 + t * (SPIRE - SB - 14), r = 2.4 * (1 - t) + 0.2;
    kit.add(new THREE.CylinderGeometry(r, r, 0.6, 8), GOLD, SU, y, 0);
  }
  kit.rod([SU, SPIRE - 0.5, 0], [SU, SPIRE + 2.5, 0], 0.12, GOLD, 4).box(1.2, 0.2, 0.2, GOLD, SU, SPIRE + 1.6, 0);
  return kit.mesh(kitMat(0.85));
}

export const SAINTE_CHAPELLE = [{
  id: 'sainte-chapelle', name: 'Sainte-Chapelle', x: X, z: Z, turn: TURN, reach: 70,
  area: [onMap(X, Z, TURN, rect(FRONT - 6, -HW - 4, APSE + HW + 4, HW + 4))],
  foot: [onMap(X, Z, TURN, rect(FRONT - 3.4, -HW - 2.6, APSE + HW + 2, HW + 2.6))],
  make: sainteChapelle,
}];
