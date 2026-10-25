// The tower of the Onze-Lieve-Vrouwekerk (13th century), the tallest thing in Bruges, modelled by
// hand in place of the map's single block of it, from its measurements and photos, in game metres
// (the real ones times 1.25), on the map's outline: 20 m square, its spire's tip at 144 m. The
// church round it stays the map's.
//   the square brick tower in its storeys of tall blind arches and lancets, between the stepped
//     buttresses at its corners, its belfry openings near the top
//   the four slender turrets at its corners, each with its own spire
//   the octagonal brick spire on it, with its little spirelets round its foot
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, polygon, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = -32.5, Z = 255.7, TURN = 0.405; // its middle, and its faces turned from east
const H = 9.6, STOREYS = [0, 20, 40, 58, 76, 86], SPIRE = 144.5;
const BRICK = '#a96b4d', BRICK2 = '#9a5f43', STONE = '#d6cdb7', SLATE = '#5a4a40', DARK = '#2d2624';

export function olvToren() {
  const kit = new Kit();
  const top = STOREYS.at(-1);
  kit.box(2 * H - 0.8, top, 2 * H - 0.8, DARK, 0, top / 2, 0);
  square(H, H, 0.4).forEach((path, f) => {
    const len = path.length, off = f % 2 ? -0.4 : 0, mid = H + off;
    for (let k = 0; k + 1 < STOREYS.length; k++) {
      const [y0, y1] = [STOREYS[k], STOREYS[k + 1]], holes = [];
      if (k === 3) for (const d of [-1, 1]) holes.push(pointedRing(mid + d * 3.4, 3, y0 + 2, y1 - 1.6, 1, 6));
      wall(kit, path, [[0, y0], [len, y0], [len, y1], [0, y1]], { holes, o0: -0.4, o1: 0, hex: BRICK });
      if (k < 3) for (const d of [-1, 0, 1]) {
        const ring = pointedRing(mid + d * 4.8, 3.2, y0 + 1.6, y1 - 1.4, 1, 6);
        wall(kit, path, ring, { o0: -0.35, o1: -0.25, hex: BRICK2 });
        if (d === 0 && k > 0) wall(kit, path, pointedRing(mid, 1, y0 + 6, y1 - 4, 1, 4), { o0: -0.24, o1: -0.2, hex: DARK });
      }
      if (k === 4) for (const d of [-1, 1]) wall(kit, path, pointedRing(mid + d * 2.4, 1.6, y0 + 1.6, y1 - 1.6, 1, 5), { o0: -0.3, o1: -0.2, hex: DARK });
      sweep(kit, path, 0, len, [[-0.1, y1 - 0.5], [0.3, y1 - 0.5], [0.3, y1], [-0.1, y1]], STONE, { step: len });
    }
  });
  // the stepped buttresses, and the four corner turrets with their spires
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    for (const [ax, az] of [[1, 0], [0, 1]]) for (const [y0, y1, d] of [[0, 40, 2.2], [40, 76, 1.5]]) {
      kit.box(ax ? d : 1.4, y1 - y0, az ? d : 1.4, BRICK, sx * (H - 0.4 + ax * d / 2), (y0 + y1) / 2, sz * (H - 0.4 + az * d / 2));
    }
    const x = sx * (H + 0.2), z = sz * (H + 0.2);
    kit.add(new THREE.CylinderGeometry(1.6, 1.6, 16, 8), BRICK, x, 76 + 8, z);
    kit.add(new THREE.ConeGeometry(1.8, 14, 8), SLATE, x, 92 + 7, z);
  }
  kit.box(2 * H + 0.8, 1, 2 * H + 0.8, STONE, 0, top + 0.5, 0);
  // the octagonal spire and its spirelets
  const R = H * 0.95, base = top + 1;
  for (const path of polygon(R, 8, Math.PI / 8)) {
    const len = path.length;
    wall(kit, path, [[0, base], [len, base], [len, base + 6], [len / 2, base + 9], [0, base + 6]], { holes: [pointedRing(len / 2, 1.6, base + 1, base + 5.4, 1, 4)], o0: -0.5, o1: 0, hex: BRICK, ends: false });
  }
  kit.add(new THREE.CylinderGeometry(R - 0.6, R - 0.6, 6, 8).rotateY(Math.PI / 8), DARK, 0, base + 3, 0);
  kit.add(new THREE.ConeGeometry(R, SPIRE - base - 6, 8).rotateY(Math.PI / 2 - Math.PI / 8), BRICK2, 0, (SPIRE + base + 6) / 2, 0);
  for (let k = 0; k < 8; k++) {
    const a = Math.PI / 8 + (k / 8) * 2 * Math.PI;
    kit.add(new THREE.ConeGeometry(0.9, 8, 6), BRICK, (R + 0.2) * Math.cos(a), base + 10, (R + 0.2) * Math.sin(a));
  }
  kit.rod([0, SPIRE - 1, 0], [0, SPIRE + 2.4, 0], 0.1, '#c9a54a');
  return kit.mesh(kitMat(0.9));
}

export const OLV_TOREN = [{
  id: 'olv-toren', name: 'Onze-Lieve-Vrouwetoren', x: X, z: Z, turn: TURN, reach: 220,
  area: [onMap(X, Z, TURN, rect(-H - 1.5, -H - 1.5, H + 1.5, H + 1.5))],
  foot: [onMap(X, Z, TURN, rect(-H - 0.6, -H - 0.6, H + 0.6, H + 0.6))],
  make: olvToren,
}];
