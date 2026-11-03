// The Elizabeth Tower (Barry and Pugin, 1843-59), Big Ben's tower at the north end of the Palace of
// Westminster, modelled by hand in place of the map's pieces of it, from its measurements and
// photos, in game metres (the real ones times 1.25), on the map's outline: 15 m square, its clocks'
// middles at 70 m and the cross on its spire at 120 m. Of honey-coloured Anston limestone:
//   the shaft on its plinth, each face panelled in three bays of Gothic tracery, storey over storey,
//     between the corner buttresses
//   the clock stage, standing out a little: on each face the gilded frame, the dial of opal glass
//     with its black hands, the band of lettering under it and the pointed gable over it
//   the belfry, three tall pointed openings to a side with Big Ben and the quarter bells in them
//   the steep spire of cast iron, its gablets and the Ayrton light near the top, gilded, and the
//     orb and cross
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = 38.4, Z = 475.6, TURN = -0.112; // its middle, and its faces turned from east
const H = 7.5; // half the shaft's width
const SHAFT = 63.4, CLOCK = [63.4, 79], BELFRY = [79, 90.5], SPIRE = [90.5, 113.5], TOP = 120;
const STONE = '#cdbb8c', STONE2 = '#bfac7d', DARK = '#3b3a37', GOLD = '#caa24c', IRON = '#3d4753', DIAL = '#efeadb';

export function elizabethTower() {
  const kit = new Kit();
  kit.box(2 * H + 1, 1.6, 2 * H + 1, STONE2, 0, 0.8, 0);
  kit.box(2 * H - 0.6, SHAFT - 1.6, 2 * H - 0.6, STONE2, 0, (SHAFT + 1.6) / 2, 0);
  // the shaft's faces: three bays of panels, storey over storey, a window in the middle bay of some
  const storeys = [1.6, 10.6, 18.6, 26.6, 34.6, 42.6, 50.6, SHAFT];
  square(H, H, 0.3).forEach((path, f) => {
    const len = path.length, off = f % 2 ? -0.3 : 0, bay = (2 * H - 2.4) / 3, holes = [];
    for (let k = 0; k + 1 < storeys.length; k++) {
      for (let b = 0; b < 3; b++) holes.push(pointedRing(1.2 + bay * (b + 0.5) + off, bay - 0.7, storeys[k] + 0.6, storeys[k + 1] - 0.5, 1, 6));
    }
    wall(kit, path, [[0, 1.6], [len, 1.6], [len, SHAFT], [0, SHAFT]], { holes, o0: -0.3, o1: 0, hex: STONE });
    for (let k = 1; k + 1 < storeys.length; k++) {
      sweep(kit, path, 0, len, [[-0.1, storeys[k] - 0.25], [0.2, storeys[k] - 0.25], [0.2, storeys[k] + 0.1], [-0.1, storeys[k] + 0.1]], STONE, { step: len });
      if (k % 2 === 0) wall(kit, path, pointedRing(len / 2, 1.2, storeys[k] + 2, storeys[k + 1] - 1.6, 1, 5), { o0: -0.35, o1: -0.25, hex: DARK });
    }
  });
  // the corner buttresses with their pinnacles at the top
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    kit.box(1.3, SHAFT - 1.6, 1.3, STONE, sx * (H - 0.2), (SHAFT + 1.6) / 2, sz * (H - 0.2));
  }
  // the clock stage, standing out, and on each face the clock under its gable
  const C = H + 0.8, cy = 70.6;
  kit.box(2 * C, CLOCK[1] - CLOCK[0] - 3, 2 * C, STONE, 0, CLOCK[0] + (CLOCK[1] - CLOCK[0] - 3) / 2, 0);
  sweep(kit, square(C)[0], -0.1, 2 * C + 0.1, [[-0.4, CLOCK[0]], [0.3, CLOCK[0]], [0.3, CLOCK[0] + 0.6], [-0.4, CLOCK[0] + 0.6]], STONE2, { step: 2 * C });
  square(C).forEach(path => {
    const len = path.length, mid = len / 2;
    wall(kit, path, [[mid - 5.4, cy - 5.4], [mid + 5.4, cy - 5.4], [mid + 5.4, cy + 5.4], [mid - 5.4, cy + 5.4]], { o0: 0, o1: 0.2, hex: GOLD });
    const dial = Array.from({ length: 36 }, (_, k) => [mid + 4.4 * Math.cos((k / 36) * 2 * Math.PI), cy + 4.4 * Math.sin((k / 36) * 2 * Math.PI)]);
    wall(kit, path, dial, { o0: 0.2, o1: 0.32, hex: DIAL });
    for (let h = 0; h < 12; h++) {
      const a = (h / 12) * 2 * Math.PI, x = mid + 3.8 * Math.cos(a), y = cy + 3.8 * Math.sin(a);
      wall(kit, path, [[x - 0.18, y - 0.18], [x + 0.18, y - 0.18], [x + 0.18, y + 0.18], [x - 0.18, y + 0.18]], { o0: 0.32, o1: 0.38, hex: DARK });
    }
    // the hands, at ten past ten (s runs to the left as you look at the face)
    for (const [a, l] of [[Math.PI * 0.19, 2.6], [Math.PI * 0.833, 3.8]]) {
      const ex = mid + l * Math.cos(a), ey = cy + l * Math.sin(a), nx = -Math.sin(a) * 0.12, ny = Math.cos(a) * 0.12;
      wall(kit, path, [[mid + nx, cy + ny], [mid - nx, cy - ny], [ex - nx, ey - ny], [ex + nx, ey + ny]], { o0: 0.38, o1: 0.48, hex: DARK });
    }
    wall(kit, path, [[mid - 5.4, cy - 6.6], [mid + 5.4, cy - 6.6], [mid + 5.4, cy - 5.6], [mid - 5.4, cy - 5.6]], { o0: 0, o1: 0.15, hex: GOLD }); // DOMINE SALVAM FAC
    wall(kit, path, [[0, CLOCK[1] - 3], [len, CLOCK[1] - 3], [mid, CLOCK[1] + 2.2]], { o0: -0.6, o1: 0, hex: STONE }); // the gable
    wall(kit, path, [[mid - 1.2, CLOCK[1] - 2.6], [mid + 1.2, CLOCK[1] - 2.6], [mid, CLOCK[1] - 0.4]], { o0: 0, o1: 0.1, hex: GOLD });
  });
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = sx * (C - 0.5), z = sz * (C - 0.5);
    kit.box(1.4, 6, 1.4, STONE, x, CLOCK[1] - 3, z);
    kit.add(new THREE.ConeGeometry(0.9, 3.6, 4).rotateY(Math.PI / 4), STONE, x, CLOCK[1] + 1.8, z);
    kit.add(new THREE.SphereGeometry(0.25, 6, 4), GOLD, x, CLOCK[1] + 3.7, z);
  }
  // the belfry, its three openings a side, the bells in it
  kit.box(2 * H - 3, BELFRY[1] - BELFRY[0], 2 * H - 3, DARK, 0, (BELFRY[0] + BELFRY[1]) / 2, 0);
  square(H - 0.4, H - 0.4, 0.8).forEach((path, f) => {
    const len = path.length, off = f % 2 ? -0.8 : 0, step = (2 * (H - 0.4)) / 3;
    const holes = [0, 1, 2].map(b => pointedRing(step * (b + 0.5) + off, step - 1.3, BELFRY[0] + 1.6, BELFRY[1] - 1.4, 1, 7));
    wall(kit, path, [[0, BELFRY[0]], [len, BELFRY[0]], [len, BELFRY[1]], [0, BELFRY[1]]], { holes, o0: -0.8, o1: 0, hex: STONE });
    for (let k = 0; k <= 14; k++) {
      const p = path.at(Math.min(len, (k / 14) * len)), x = p.x + 0.5 * p.tz, z = p.z - 0.5 * p.tx;
      kit.box(0.2, 1.2, 0.2, GOLD, x, BELFRY[0] + 0.6, z);
    }
  });
  kit.add(new THREE.CylinderGeometry(1.2, 2.1, 2.8, 12), '#5e4c2e', 0, BELFRY[0] + 4.6, 0); // Big Ben
  for (const [x, z] of [[-3.2, -3.2], [3.2, 3.2], [3.2, -3.2], [-3.2, 3.2]]) kit.add(new THREE.CylinderGeometry(0.6, 1, 1.4, 10), '#5e4c2e', x, BELFRY[0] + 6.6, z);
  kit.box(2 * H + 0.4, 0.8, 2 * H + 0.4, STONE2, 0, BELFRY[1] + 0.4, 0);
  // the spire, its gablets, the Ayrton light, the orb and the cross
  const spire = new THREE.ConeGeometry((2 * H - 1) / Math.SQRT2, SPIRE[1] - SPIRE[0] - 0.8, 4).rotateY(Math.PI / 4);
  kit.add(spire, IRON, 0, (SPIRE[0] + 0.8 + SPIRE[1]) / 2, 0);
  for (const [dx, dz, ry] of [[1, 0, Math.PI / 2], [-1, 0, Math.PI / 2], [0, 1, 0], [0, -1, 0]]) {
    for (const [y, out, w] of [[SPIRE[0] + 3, 5.2, 3.4], [SPIRE[0] + 9.5, 3.4, 2.2]]) {
      kit.box(w, w * 0.9, w, IRON, dx * out, y, dz * out, 0, ry);
      kit.add(new THREE.ConeGeometry(w * 0.72, w * 1.1, 4).rotateY(Math.PI / 4), IRON, dx * out, y + w, dz * out);
      kit.box(w * 0.3, w * 0.6, w + 0.1, GOLD, dx * out, y, dz * out, 0, ry + Math.PI / 2);
    }
  }
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    kit.rod([sx * (H - 0.6), BELFRY[1] + 0.8, sz * (H - 0.6)], [sx * (H - 0.6), BELFRY[1] + 6.4, sz * (H - 0.6)], 0.35, IRON, 6);
    kit.add(new THREE.SphereGeometry(0.35, 6, 4), GOLD, sx * (H - 0.6), BELFRY[1] + 6.6, sz * (H - 0.6));
  }
  kit.add(new THREE.CylinderGeometry(1.5, 1.7, 2.6, 8), GOLD, 0, SPIRE[1] - 7, 0); // the Ayrton light
  kit.add(new THREE.CylinderGeometry(1.2, 1.2, 2.2, 8), '#f2e3a8', 0, SPIRE[1] - 4.6, 0);
  kit.rod([0, SPIRE[1] - 3.4, 0], [0, TOP - 2.4, 0], 0.3, GOLD);
  kit.add(new THREE.SphereGeometry(0.75, 10, 8), GOLD, 0, TOP - 2.4, 0);
  kit.box(0.3, 2.2, 0.3, GOLD, 0, TOP - 1.1, 0).box(1.4, 0.3, 0.3, GOLD, 0, TOP - 0.9, 0);
  return kit.mesh(kitMat(0.85));
}

const AREA = onMap(X, Z, TURN, rect(-H - 1.2, -H - 1.2, H + 1.2, H + 1.2));
export const ELIZABETH_TOWER = [{
  id: 'elizabeth-tower', name: 'Elizabeth Tower', x: X, z: Z, turn: TURN, reach: 150, area: [AREA], paths: [AREA],
  foot: [onMap(X, Z, TURN, rect(-H - 0.5, -H - 0.5, H + 0.5, H + 0.5))],
  make: elizabethTower,
}];
