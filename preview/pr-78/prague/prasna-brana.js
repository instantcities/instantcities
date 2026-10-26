// The Prašná brána (the Powder Tower, 1475, its Gothic dress from Mocker's restoration of 1875-86)
// at the head of Celetná, modelled by hand in place of the map's pieces of it, from its measurements
// and photos, in game metres (the real ones times 1.25), on the map's outline: 15 m square and 81 m
// to the top of its roof, Celetná passing through it. All of sandstone gone dark with age:
//   the gateway through it, pointed, and over it the row of Bohemian kings in their niches
//   on each face the tall traceried windows of its two upper storeys between the corner buttresses
//     with their pinnacles, the string courses between the storeys
//   the gallery round the top on its corbels, and at its corners the four little turrets
//   the steep slate roof with its dormers, and the gilded finials on top
// Riders go through the gateway along Celetná; its two sides stop them.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 866.4, Z = 67.2, TURN = -0.3; // its middle, and Celetná's way through it turned from east (local x)
const HX = 7.55, HZ = 7.4; // half its size along Celetná and across
const GATE = 3.6, ARCH = 12.4, GALLERY = 55, EAVES = 58.8, RIDGE = 78.5;
const STONE = '#554c44', STONE2 = '#4b433c', LIGHT = '#6e655b', SLATE = '#3c4045', GOLD = '#c9a648', DARK = '#26221f';

// the four faces, each running with its outside to its right: the two the gate goes through (x = ±HX)
// and the two sides (z = ±HZ)
const FACES = [
  { path: linePath(HX, -HZ, HX, HZ), gate: true }, { path: linePath(HX, HZ, -HX, HZ) },
  { path: linePath(-HX, HZ, -HX, -HZ), gate: true }, { path: linePath(-HX, -HZ, HX, -HZ) },
];

// a figure standing in a niche at s on the face, from y
function king(kit, path, s, y, h) {
  wall(kit, path, pointedRing(s, 1.4, y, y + h + 0.9, 1, 6), { o0: 0, o1: 0.08, hex: DARK });
  const p = path.at(s), x = p.x + 0.5 * p.tz, z = p.z - 0.5 * p.tx;
  kit.add(new THREE.CylinderGeometry(0.3, 0.42, h * 0.8, 7), LIGHT, x, y + h * 0.4, z);
  kit.add(new THREE.SphereGeometry(0.24, 7, 5), LIGHT, x, y + h * 0.88, z);
  kit.add(new THREE.ConeGeometry(0.55, 0.9, 6), LIGHT, x, y + h + 0.9, z); // the canopy over him
}

export function prasnaBrana() {
  const kit = new Kit();
  // the body, with the gateway right through it
  const gate = linePath(HX, -HZ, HX, HZ);
  wall(kit, gate, [[0, 0], [2 * HZ, 0], [2 * HZ, GALLERY], [0, GALLERY]], { holes: [pointedRing(HZ, 2 * GATE, 0, ARCH, 0.9, 10)], o0: -2 * HX, o1: 0, hex: STONE2 });
  for (const { path, gate } of FACES) {
    const len = path.length, mid = len / 2, slab = { o0: 0, o1: 0.25 };
    if (gate) {
      // the gateway's mouldings, and the kings over it
      const out = pointedRing(mid, 2 * GATE + 1.6, 0, ARCH + 1.2, 0.9, 10).slice(2), inn = pointedRing(mid, 2 * GATE, 0, ARCH, 0.9, 10).slice(2);
      wall(kit, path, [[mid + GATE + 0.8, 0], ...out, [mid - GATE - 0.8, 0], [mid - GATE, 0], ...inn.reverse(), [mid + GATE, 0]], { ...slab, hex: STONE });
      for (let k = -2; k <= 2; k++) king(kit, path, mid + k * 2.3, ARCH + 2.6, 2.4);
    } else {
      // the side faces: a blind arcade low down where the gateway's sides are
      for (const k of [-1, 1]) wall(kit, path, pointedRing(mid + k * 3.4, 3.4, 2, 10.5, 1, 6), { o0: -0.15, o1: 0.05, hex: shade(STONE2, -0.1) });
    }
    // the two upper storeys: a tall window with its tracery and two niches, then two windows
    wall(kit, path, pointedRing(mid, 4.4, 23.6, 36.5, 1, 8), { o0: -0.35, o1: 0.05, hex: DARK });
    for (const d of [-1.1, 1.1]) wall(kit, path, [[mid + d - 0.12, 23.6], [mid + d + 0.12, 23.6], [mid + d + 0.12, 33.8], [mid + d - 0.12, 33.8]], { o0: -0.3, o1: 0.08, hex: LIGHT });
    wall(kit, path, [[mid - 2.2, 29.2], [mid + 2.2, 29.2], [mid + 2.2, 29.5], [mid - 2.2, 29.5]], { o0: -0.3, o1: 0.08, hex: LIGHT });
    for (const k of [-1, 1]) king(kit, path, mid + k * 4.4, 26, 2.6);
    for (const k of [-1, 1]) {
      wall(kit, path, pointedRing(mid + k * 2.4, 2.6, 40.5, 52, 1, 8), { o0: -0.35, o1: 0.05, hex: DARK });
      wall(kit, path, [[mid + k * 2.4 - 0.1, 40.5], [mid + k * 2.4 + 0.1, 40.5], [mid + k * 2.4 + 0.1, 49.8], [mid + k * 2.4 - 0.1, 49.8]], { o0: -0.3, o1: 0.08, hex: LIGHT });
    }
    // the string courses, and a gable of tracery over each storey's window
    for (const y of [ARCH + 1.6, 22.4, 38.6]) sweep(kit, path, 0, len, [[-0.1, y], [0.45, y], [0.45, y + 0.3], [0.2, y + 0.6], [-0.1, y + 0.6]], LIGHT, { step: len });
    wall(kit, path, [[mid - 2.8, 36], [mid + 2.8, 36], [mid, 39.6]], { o0: 0, o1: 0.3, hex: LIGHT });
  }
  // the corner buttresses, stepping in, with their pinnacles
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    for (const [y0, y1, w] of [[0, 22.4, 1.6], [22.4, 38.6, 1.3], [38.6, GALLERY - 1.5, 1]]) {
      kit.box(w, y1 - y0, w, STONE, sx * (HX + w / 2 - 0.4), (y0 + y1) / 2, sz * (HZ + w / 2 - 0.4));
      kit.add(new THREE.ConeGeometry(w * 0.55, 2.2, 4).rotateY(Math.PI / 4), LIGHT, sx * (HX + w / 2 - 0.4), y1 + 1.1, sz * (HZ + w / 2 - 0.4));
    }
  }
  // the gallery on its corbels, with its parapet of tracery
  for (const { path } of FACES) {
    const len = path.length;
    for (let k = 0; k <= 10; k++) {
      const p = path.at((k / 10) * len), x = p.x + 0.5 * p.tz, z = p.z - 0.5 * p.tx;
      kit.box(0.6, 1.4, 0.6, STONE, x, GALLERY - 0.7, z);
    }
    const holes = Array.from({ length: 8 }, (_, k) => pointedRing(1.6 + (k + 0.5) * ((len - 3.2) / 8), 1, GALLERY + 1.2, EAVES - 0.4, 1, 5));
    wall(kit, path, [[-0.9, GALLERY], [len + 0.9, GALLERY], [len + 0.9, EAVES], [-0.9, EAVES]], { holes, o0: 0.6, o1: 1.1, hex: STONE });
  }
  kit.box(2 * HX + 2, 0.6, 2 * HZ + 2, STONE, 0, GALLERY + 0.3, 0);
  // the four turrets at the gallery's corners
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = sx * (HX + 0.4), z = sz * (HZ + 0.4);
    kit.add(new THREE.CylinderGeometry(1.25, 1.1, 8.4, 8), STONE, x, 53.8 + 4.2, z);
    for (let k = 0; k < 4; k++) kit.box(0.3, 2.2, 0.3, DARK, x + 1.2 * Math.cos(k * Math.PI / 2 + 0.4), 59.4, z + 1.2 * Math.sin(k * Math.PI / 2 + 0.4));
    kit.add(new THREE.ConeGeometry(1.4, 5.6, 8), SLATE, x, 62.2 + 2.8, z);
    kit.add(new THREE.SphereGeometry(0.25, 6, 4), GOLD, x, 67.6, z);
  }
  // the steep roof, its dormers, the finials on top
  const roof = new THREE.ConeGeometry(1, RIDGE - EAVES, 4).rotateY(Math.PI / 4);
  roof.scale((2 * HX - 0.6) / Math.SQRT2, 1, (2 * HZ - 0.6) / Math.SQRT2);
  kit.add(roof, SLATE, 0, (EAVES + RIDGE) / 2, 0);
  for (const [dx, dz, ry] of [[1, 0, 0], [-1, 0, Math.PI], [0, 1, -Math.PI / 2], [0, -1, Math.PI / 2]]) {
    for (const [y, out] of [[EAVES + 3.4, 4.2], [EAVES + 9.2, 2.6]]) {
      const x = dx * out, z = dz * out;
      kit.box(1.4, 1.6, 1.4, SLATE, x, y, z, 0, ry);
      kit.add(new THREE.ConeGeometry(1, 1.4, 4).rotateY(Math.PI / 4), SLATE, x, y + 1.5, z);
      kit.box(0.08, 0.9, 0.7, DARK, x + dx * 0.7, y, z + dz * 0.7, 0, ry);
    }
  }
  kit.rod([0, RIDGE - 0.5, 0], [0, RIDGE + 2.8, 0], 0.12, GOLD);
  kit.add(new THREE.SphereGeometry(0.4, 8, 6), GOLD, 0, RIDGE + 1.4, 0);
  return kit.mesh(kitMat(0.9));
}

export const PRASNA_BRANA = [{
  id: 'prasna-brana', name: 'Prašná brána', x: X, z: Z, turn: TURN, reach: 110,
  area: [onMap(X, Z, TURN, rect(-HX - 1.6, -HZ - 1.6, HX + 1.6, HZ + 1.6))],
  foot: [-1, 1].map(k => onMap(X, Z, TURN, rect(-HX - 0.5, Math.min(k * GATE, k * (HZ + 0.5)), HX + 0.5, Math.max(k * GATE, k * (HZ + 0.5))))),
  make: prasnaBrana,
}];
