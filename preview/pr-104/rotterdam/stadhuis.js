// The tower of the Stadhuis on the Coolsingel (Henri Evers, 1914-20), modelled by hand over the middle
// of the town hall's front, which stays the map's block, in game metres (the real ones times 1.25):
// 71 m, of the same pale sandstone as the hall, one of the few buildings of the centre that came
// through the bombing of 1940:
//   the square shaft with its corner piers and tall narrow windows, the clock on each side
//   the open belfry, its arches on columns, and the balustrade round it
//   the stepped top under its green copper cupola, the lantern and the spire
// Riders bump into the town hall, as before. The model's own metres: u along the front, v back into
// the building, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, wall, archRing, onMap, rect } from '../core/js/arcade.js';

const X = -499.1, Z = -460.5, TURN = 0.289;
const H = 7.5, SHAFT = 58, BELFRY = 70, TOP = 89;
const STONE = '#d6c9a6', STONE2 = '#c2b48f', DARK = '#2e3135', COPPER = '#5f9c86', GOLD = '#c9a64a', CLOCK = '#f1ede2';

export function stadhuisToren() {
  const kit = new Kit();
  kit.box(2 * H, SHAFT, 2 * H, STONE, 0, SHAFT / 2, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.box(2.2, SHAFT + 1, 2.2, STONE2, sx * (H - 0.6), (SHAFT + 1) / 2, sz * (H - 0.6));
  square(H, H).forEach(p => {
    const L = p.length;
    for (const s of [L * 0.38, L * 0.62]) wall(kit, p, archRing(s, 1.6, 24, 44, 6), { o0: 0, o1: 0.12, hex: DARK });
    for (const y of [22, 46]) wall(kit, p, [[0, y], [L, y], [L, y + 0.8], [0, y + 0.8]], { o0: 0, o1: 0.4, hex: STONE2 });
    // the clock
    const m = p.at(L / 2);
    const out = { x: m.tz, z: -m.tx };
    kit.add(new THREE.CylinderGeometry(3, 3, 0.3, 24), CLOCK, m.x + out.x * 0.5, 51.5, m.z + out.z * 0.5, Math.PI / 2, Math.atan2(out.x, out.z), 0);
    kit.add(new THREE.CylinderGeometry(3.4, 3.4, 0.2, 24), GOLD, m.x + out.x * 0.35, 51.5, m.z + out.z * 0.35, Math.PI / 2, Math.atan2(out.x, out.z), 0);
  });
  // the belfry: a deck, the columns round its open stage, the roof slab and the balustrade
  kit.box(2 * H + 1, 1, 2 * H + 1, STONE2, 0, SHAFT + 0.5, 0);
  kit.box(2 * H - 5, BELFRY - SHAFT, 2 * H - 5, DARK, 0, (SHAFT + BELFRY) / 2, 0);
  for (let k = 0; k < 4; k++) for (let j = 0; j < 4; j++) {
    const t = -H + 1 + (j * (2 * H - 2)) / 3, [x, z] = [[t, -H + 1], [H - 1, t], [-t, H - 1], [-H + 1, -t]][k];
    kit.add(new THREE.CylinderGeometry(0.55, 0.65, BELFRY - SHAFT - 2, 8), STONE, x, SHAFT + 1 + (BELFRY - SHAFT - 2) / 2, z);
  }
  kit.box(2 * H, 1.6, 2 * H, STONE2, 0, BELFRY - 0.8, 0);
  kit.box(2 * H + 0.8, 1.2, 2 * H + 0.8, STONE, 0, BELFRY + 0.6, 0);
  // the stepped top, the cupola, the lantern and the spire
  kit.box(2 * H - 3, 4, 2 * H - 3, STONE, 0, BELFRY + 3, 0);
  kit.add(new THREE.CylinderGeometry(4.2, 5.4, 3, 8), STONE2, 0, BELFRY + 6.5, 0);
  kit.add(new THREE.SphereGeometry(4.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), COPPER, 0, BELFRY + 8, 0);
  kit.add(new THREE.CylinderGeometry(1.3, 1.5, 3, 8), COPPER, 0, BELFRY + 13, 0);
  kit.add(new THREE.ConeGeometry(1.4, TOP - BELFRY - 14.5, 8), COPPER, 0, (BELFRY + 14.5 + TOP) / 2, 0);
  kit.add(new THREE.SphereGeometry(0.5, 8, 6), GOLD, 0, TOP, 0);
  return kit.mesh(kitMat(0.8));
}

export const STADHUIS = [{
  id: 'stadhuistoren', name: 'Stadhuis', x: X, z: Z, turn: TURN, reach: 200,
  area: [onMap(X, Z, TURN, rect(-H, -H, H, H))], // (the town hall's block has its middle far off: it stays)
  foot: [onMap(X, Z, TURN, rect(-H, -H, H, H))],
  make: stadhuisToren,
}];
