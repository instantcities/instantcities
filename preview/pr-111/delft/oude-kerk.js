// The tower of the Oude Kerk, "de Oude Jan" (about 1325-1350), modelled by hand in place of the map's
// blocks of it (the church stays the map's), in game metres (the real ones times 1.25), on the map's
// outline: 75 m to the top. It was built on the filled-in bed of a canal, began to sink while it went
// up, and has leant ever since: its top stands some 2 m out of plumb towards the Oude Delft.
//   the square body of dark red brick to 45 m, with tiers of tall blind lancets up its faces, stone
//     bands between them, and the openings for the bells at the top
//   the parapet round the top of the square, and the four octagonal corner turrets with their
//     spirelets
//   the tall slender spire of slate between them, its four dormers at the foot, the ball and the vane
// The tower's own metres: about its middle, x along the church (+x towards the choir, -x the canal),
// y up; the whole tower leans over towards -x.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, wall, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = -221.2, Z = -279.2, TURN = 0.17;
const HX = 7.4, HZ = 7.9, BODY = 56, TOP = 93.8, LEAN = 0.03; // half its sides; the brick's top, the spire's; the lean (radians)
const BRICK = '#7a4635', BRICK2 = '#673a2c', STONE = '#cbbfa6', DARK = '#2a2624', SLATE = '#40464b', GOLD = '#c9a64a';
const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

export function oudeJan() {
  const kit = new Kit();
  kit.box(2 * HX, BODY, 2 * HZ, BRICK, 0, BODY / 2, 0);
  square(HX, HZ).forEach(p => {
    const L = p.length;
    // the stone bands, and the tiers of blind lancets between them, two or three to a face
    for (const y of [9, 24, 38, BODY - 1.2]) wall(kit, p, [[0, y], [L, y], [L, y + 0.6], [0, y + 0.6]], { o0: 0, o1: 0.3, hex: STONE });
    for (const [y0, y1, n] of [[11, 22.5, 3], [26, 36.5, 3]]) for (let k = 0; k < n; k++) {
      wall(kit, p, pointedRing(((k + 0.5) / n) * L, L / n - 1.6, y0, y1, 1.1, 6), { o0: 0, o1: 0.15, hex: BRICK2 });
    }
    // the openings for the bells: two tall lancets, dark behind their louvres
    for (const s of [L * 0.33, L * 0.67]) {
      wall(kit, p, pointedRing(s, 2.8, 40, 53.4, 1.1, 7), { o0: 0, o1: 0.12, hex: DARK });
      for (let y = 41.5; y < 51; y += 1.6) wall(kit, p, [[s - 1.3, y], [s + 1.3, y], [s + 1.3, y + 0.25], [s - 1.3, y + 0.25]], { o0: 0.12, o1: 0.2, hex: '#4a3a30' });
    }
  });
  // the low doorway on the canal side
  const west = square(HX, HZ)[3];
  wall(kit, west, pointedRing(west.length / 2, 2.6, 0, 5.4, 1, 6), { o0: 0, o1: 0.15, hex: '#3a2c24' });
  // the parapet round the top of the square
  kit.box(2 * HX + 0.8, 0.6, 2 * HZ + 0.8, STONE, 0, BODY + 0.3, 0);
  square(HX + 0.4, HZ + 0.4).forEach(p => {
    const L = p.length, ring = [[0, BODY + 0.6]], n = Math.round(L / 1.5);
    for (let k = 0; k < n; k++) ring.push([(k / n) * L, BODY + 2.2], [((k + 0.5) / n) * L, BODY + 2.2], [((k + 0.5) / n) * L, BODY + 1.6], [((k + 1) / n) * L, BODY + 1.6]);
    ring.splice(-1, 1, [L, BODY + 2.2], [L, BODY + 0.6]);
    wall(kit, p, ring.reverse(), { o0: -0.35, o1: 0, hex: BRICK2 });
  });
  // the four corner turrets, standing out over the corners on corbels, with their spirelets
  for (const [sx, sz] of CORNERS) {
    const x = sx * (HX - 0.3), z = sz * (HZ - 0.3);
    kit.add(new THREE.CylinderGeometry(1.5, 0.6, 2.4, 8), BRICK2, x, BODY - 3.2, z);
    kit.add(new THREE.CylinderGeometry(1.5, 1.5, 9, 8).rotateY(Math.PI / 8), BRICK, x, BODY - 2 + 4.5, z);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * 2 * Math.PI + Math.PI / 4;
      kit.box(0.3, 2.2, 0.1, DARK, x + 1.47 * Math.cos(a), BODY + 4.6, z + 1.47 * Math.sin(a), 0, -a + Math.PI / 2);
    }
    kit.add(new THREE.ConeGeometry(1.75, 7.5, 8).rotateY(Math.PI / 8), SLATE, x, BODY + 7 + 3.75, z);
    kit.add(new THREE.SphereGeometry(0.22, 6, 4), GOLD, x, BODY + 14.7, z);
  }
  // the spire: its octagonal foot, the four dormers round it, the slate needle, ball and vane
  const R = 4.7, foot = BODY + 3;
  kit.add(new THREE.CylinderGeometry(R, R, 3, 8).rotateY(Math.PI / 8), SLATE, 0, BODY + 1.5, 0);
  kit.add(new THREE.ConeGeometry(R, TOP - foot - 1.5, 8).rotateY(Math.PI / 8), SLATE, 0, foot + (TOP - foot - 1.5) / 2, 0);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a), r = R * 0.72;
    kit.box(1.6, 2.4, 2.2, SLATE, r * c, foot + 2.4, r * s, 0, -a);
    kit.box(0.9, 1.4, 0.1, DARK, (r + 1.12) * c, foot + 2.3, (r + 1.12) * s, 0, -a + Math.PI / 2);
    kit.add(new THREE.ConeGeometry(1.2, 1.6, 4).rotateY(Math.PI / 4), SLATE, r * c, foot + 4.4, r * s, 0, -a);
  }
  kit.add(new THREE.SphereGeometry(0.45, 8, 6), GOLD, 0, TOP - 1.1, 0);
  kit.rod([0, TOP - 1.2, 0], [0, TOP + 2, 0], 0.07, GOLD, 4).box(1.4, 0.7, 0.06, GOLD, 0.5, TOP + 1.2, 0);
  // the lean: everything tips over about its foot towards -x; a course of brick under it closes the
  // gap that opens on the high side
  for (const g of kit.pieces) g.rotateZ(LEAN);
  kit.box(2 * HX + 0.4, 1.2, 2 * HZ + 0.2, BRICK2, 0, 0, 0);
  return kit.mesh(kitMat(0.9));
}

// riders bump into its foot; the two stair turrets on its church side stay the map's
export const OUDE_KERK = [{
  id: 'oude-kerk-toren', name: 'Oude Kerk', x: X, z: Z, turn: TURN, reach: 120,
  area: [onMap(X, Z, TURN, rect(-HX - 1.5, -HZ - 1.5, 5.5, HZ + 1.5))],
  foot: [onMap(X, Z, TURN, rect(-HX - 0.2, -HZ - 0.1, HX + 0.2, HZ + 0.1))],
  make: oudeJan,
}];
