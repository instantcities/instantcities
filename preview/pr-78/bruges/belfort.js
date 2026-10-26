// The Belfort (13th-15th century) on the Markt, modelled by hand in place of the map's block of it,
// from its measurements and photos, in game metres (the real ones times 1.25), on the map's
// outline: 18 m square at its foot and 104 m to the top. Of weathered brick and yellow-white stone:
//   the two square storeys, the gateway into the Halle courtyard in the Markt face, tall pointed
//     windows and blind arcades between the corner buttresses, the clock high on the Markt face
//   the gallery round the top of the square, and the four corner turrets with their spires
//   the octagon on it in pale stone, two storeys of tall pointed openings for the carillon's bells,
//     pinnacles at its corners, its parapet, and the little roof with the gilded lion on top
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, polygon, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 7, Z = -213.5, TURN = 0.644; // its middle, and its Markt face turned from east (the Markt is local -z)
const H = 8; // half the square's width, its buttresses standing out to the map's outline
const SQUARE = [0, 24, 55], OCT = [58.4, 78.4, 95.4], TOP = 103.8, OR = 7; // the storeys; the octagon's corners
const BRICK = '#b59a76', BRICK2 = '#a88d6a', STONE = '#ddd3bb', STONE2 = '#cfc4aa', DARK = '#2f2c28', SLATE = '#4a4f55', GOLD = '#cda64a';

export function belfort() {
  const kit = new Kit();
  kit.box(2 * H - 0.8, SQUARE[2], 2 * H - 0.8, BRICK2, 0, SQUARE[2] / 2, 0);
  square(H, H, 0.4).forEach((path, f) => {
    const len = path.length, off = f % 2 ? -0.4 : 0, mid = H + off, front = f === 0;
    // the lower storey: the gateway on the Markt, a pair of tall windows on the other faces
    const low = front ? [pointedRing(mid, 5.6, 0, 11.6, 1, 8), pointedRing(mid, 4, 14.4, 22.4, 1, 6)]
      : [-1, 1].map(k => pointedRing(mid + k * 3.4, 2.6, 8, 21.6, 1, 6));
    wall(kit, path, [[0, 0], [len, 0], [len, SQUARE[1]], [0, SQUARE[1]]], { holes: low, o0: -0.4, o1: 0, hex: BRICK });
    // the upper storey: three tall blind arcades, the middle one a window
    const up = [-1, 0, 1].map(k => pointedRing(mid + k * 4.6, 3.4, SQUARE[1] + 2.4, SQUARE[2] - (front ? 9.6 : 3), 1, 7));
    wall(kit, path, [[0, SQUARE[1]], [len, SQUARE[1]], [len, SQUARE[2]], [0, SQUARE[2]]], { holes: up, o0: -0.4, o1: 0, hex: BRICK });
    for (const [k, ring] of up.entries()) wall(kit, path, ring, { o0: -0.4, o1: -0.25, hex: k === 1 ? DARK : shade(BRICK2, -0.12) });
    for (const y of [SQUARE[1], SQUARE[1] + 0.5]) sweep(kit, path, 0, len, [[-0.1, y], [0.25, y], [0.25, y + 0.35], [-0.1, y + 0.35]], STONE, { step: len });
    if (front) {
      // the clock, and the balcony over the gateway
      const cy = SQUARE[2] - 4.6, dial = Array.from({ length: 32 }, (_, k) => [mid + 3 * Math.cos((k / 32) * 2 * Math.PI), cy + 3 * Math.sin((k / 32) * 2 * Math.PI)]);
      wall(kit, path, dial.map(([s, y]) => [mid + (s - mid) * 1.18, cy + (y - cy) * 1.18]), { o0: 0, o1: 0.15, hex: GOLD });
      wall(kit, path, dial, { o0: 0.15, o1: 0.25, hex: '#1f2a3a' });
      for (const [a, l] of [[Math.PI * 0.35, 1.7], [Math.PI * 0.95, 2.5]]) {
        const ex = mid + l * Math.cos(a), ey = cy + l * Math.sin(a), nx = -Math.sin(a) * 0.1, ny = Math.cos(a) * 0.1;
        wall(kit, path, [[mid + nx, cy + ny], [mid - nx, cy - ny], [ex - nx, ey - ny], [ex + nx, ey + ny]], { o0: 0.25, o1: 0.32, hex: GOLD });
      }
      wall(kit, path, [[mid - 3.2, 13.2], [mid + 3.2, 13.2], [mid + 3.2, 14.1], [mid - 3.2, 14.1]], { o0: 0, o1: 1.2, hex: STONE });
    }
  });
  // the corner buttresses
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    for (const [ax, az] of [[1, 0], [0, 1]]) kit.box(ax ? 1.6 : 1.1, SQUARE[2] - 2, az ? 1.6 : 1.1, BRICK, sx * (H - 0.3 + ax * 0.6), (SQUARE[2] - 2) / 2, sz * (H - 0.3 + az * 0.6));
  }
  // the gallery round the top of the square, its crenellated parapet, and the corner turrets
  kit.box(2 * H + 1.6, 0.8, 2 * H + 1.6, STONE, 0, SQUARE[2] + 0.4, 0);
  square(H + 0.8).forEach(path => {
    const len = path.length, n = 9;
    const ring = [[0, SQUARE[2] + 0.8]];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * len, b = ((k + 0.55) / n) * len;
      ring.push([a, SQUARE[2] + 3], [b, SQUARE[2] + 3], [b, SQUARE[2] + 2.2], [((k + 1) / n) * len, SQUARE[2] + 2.2]);
    }
    ring.splice(-1, 1, [len, SQUARE[2] + 3], [len, SQUARE[2] + 0.8]);
    wall(kit, path, ring.reverse(), { o0: -0.4, o1: 0, hex: STONE });
  });
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = sx * (H + 0.2), z = sz * (H + 0.2);
    kit.add(new THREE.CylinderGeometry(1.5, 1.3, 12, 8), STONE2, x, SQUARE[2] - 2 + 6, z);
    for (let k = 0; k < 4; k++) kit.box(0.25, 2.4, 0.25, DARK, x + 1.45 * Math.cos(k * Math.PI / 2 + 0.4), SQUARE[2] + 6.4, z + 1.45 * Math.sin(k * Math.PI / 2 + 0.4));
    kit.add(new THREE.ConeGeometry(1.7, 6.5, 8), SLATE, x, SQUARE[2] + 10 + 3.25, z);
    kit.add(new THREE.SphereGeometry(0.25, 6, 4), GOLD, x, SQUARE[2] + 16.7, z);
  }
  // the octagon: its core, two storeys of openings, the pinnacles at its corners
  const start = Math.PI / 8;
  kit.add(new THREE.CylinderGeometry(OR - 1.6, OR - 1.6, OCT[2] - SQUARE[2], 8).rotateY(start), DARK, 0, (SQUARE[2] + OCT[2]) / 2, 0);
  kit.add(new THREE.CylinderGeometry(OR + 0.6, OR + 0.6, OCT[0] - SQUARE[2] - 0.8, 8).rotateY(Math.PI / 2 - start), STONE2, 0, (SQUARE[2] + 0.8 + OCT[0]) / 2, 0);
  for (const path of polygon(OR, 8, start)) {
    const len = path.length, mid = len / 2;
    for (const [y0, y1] of [[OCT[0], OCT[1]], [OCT[1], OCT[2]]]) {
      wall(kit, path, [[0, y0], [len, y0], [len, y1], [0, y1]], { holes: [pointedRing(mid, len - 2, y0 + 1.6, y1 - 1.6, 1, 7)], o0: -0.8, o1: 0, hex: STONE, ends: false });
      wall(kit, path, [[mid - 0.12, y0 + 1.6], [mid + 0.12, y0 + 1.6], [mid + 0.12, y1 - 4.4], [mid - 0.12, y1 - 4.4]], { o0: -0.7, o1: -0.2, hex: STONE });
      sweep(kit, path, 0, len, [[-0.2, y1 - 0.5], [0.3, y1 - 0.5], [0.3, y1], [-0.2, y1]], STONE2, { step: len });
    }
  }
  for (let k = 0; k < 8; k++) {
    const a = start + (k / 8) * 2 * Math.PI, x = (OR + 0.2) * Math.cos(a), z = (OR + 0.2) * Math.sin(a);
    kit.box(0.9, OCT[2] - OCT[0], 0.9, STONE2, x, (OCT[0] + OCT[2]) / 2, z, 0, -a);
    for (const y of [OCT[1], OCT[2]]) kit.add(new THREE.ConeGeometry(0.55, 3, 4), STONE2, x, y + 1.5, z);
  }
  // the parapet, the little roof, the lion
  kit.add(new THREE.CylinderGeometry(OR + 0.5, OR + 0.5, 1.4, 8).rotateY(Math.PI / 2 - start), STONE, 0, OCT[2] + 0.7, 0);
  kit.add(new THREE.ConeGeometry(OR - 1, TOP - OCT[2] - 2.6, 8).rotateY(Math.PI / 2 - start), SLATE, 0, OCT[2] + 1.4 + (TOP - OCT[2] - 2.6) / 2, 0);
  kit.rod([0, TOP - 1.4, 0], [0, TOP, 0], 0.1, GOLD);
  kit.box(1, 0.6, 0.3, GOLD, 0.3, TOP - 0.1, 0);
  return kit.mesh(kitMat(0.9));
}

// riders bump into it up to its buttresses, short of the Markt's footway along its face
export const BELFORT = [{
  id: 'belfort', name: 'Belfort', x: X, z: Z, turn: TURN, reach: 140,
  area: [onMap(X, Z, TURN, rect(-H - 2, -H - 2, H + 2, H + 2))],
  foot: [onMap(X, Z, TURN, rect(-H - 0.8, -H - 0.8, H + 0.8, H + 0.8))],
  make: belfort,
}];
