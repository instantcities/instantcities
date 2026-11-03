// The two great brick towers over Bruges's roofs, modelled by hand in place of the map's blocks of
// them (the churches themselves stay the map's), in game metres (the real ones times 1.25):
//   the Onze-Lieve-Vrouwekerk's (13th-15th century), at 115.6 m the tallest brick tower but one in
//     the world: its square body with the buttresses at its corners and the blind lancets up its
//     sides, the belfry's openings, the four turrets at the top of the square, and the slender spire
//   Sint-Salvator's (12th-19th century), broad and plain below with its bands of blind arcading, the
//     neo-Romanesque crown put on it in 1846 with its round-arched openings, its corner turrets and
//     its spire
// Each tower's own metres: about its middle, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, wall, pointedRing, archRing, onMap, rect } from '../core/js/arcade.js';

const BRICK = '#a8724f', BRICK2 = '#956446', STONE = '#d8cfbb', DARK = '#2f2a27', SLATE = '#4d5359';

const OLV = { x: -32.5, z: 255.7, turn: -2.737, h: 9.6 }, SALVATOR = { x: -324.6, z: 174.2, turn: -1.249, hx: 10.2, hz: 7.8 };

export function olvTower() {
  const kit = new Kit(), H = OLV.h, BODY = 92, TOP = 144.5;
  kit.box(2 * H, BODY, 2 * H, BRICK, 0, BODY / 2, 0);
  // the corner buttresses, stepping in as they rise
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) for (const [y0, y1, d] of [[0, 40, 2.4], [40, 75, 1.8], [75, BODY, 1.2]]) {
    kit.box(d, y1 - y0, d, BRICK2, sx * (H + d / 2 - 0.4), (y0 + y1) / 2, sz * (H - d / 2)).box(d, y1 - y0, d, BRICK2, sx * (H - d / 2), (y0 + y1) / 2, sz * (H + d / 2 - 0.4));
  }
  // the stone bands, the blind lancets and the belfry's openings on each side
  square(H, H).forEach(p => {
    const L = p.length;
    for (const y of [30, 55, 75]) wall(kit, p, [[0, y], [L, y], [L, y + 0.8], [0, y + 0.8]], { o0: 0, o1: 0.4, hex: STONE });
    for (const [y0, y1] of [[34, 53], [58, 73]]) for (const s of [L * 0.3, L * 0.5, L * 0.7]) wall(kit, p, pointedRing(s, 2.2, y0, y1, 1.2, 6), { o0: 0, o1: 0.15, hex: BRICK2 });
    for (const s of [L * 0.36, L * 0.64]) wall(kit, p, pointedRing(s, 2.6, 77, 89, 1.2, 6), { o0: 0, o1: 0.1, hex: DARK });
    wall(kit, p, [[0, BODY - 1], [L, BODY - 1], [L, BODY + 1.4], [0, BODY + 1.4]], { o0: 0, o1: 0.6, hex: STONE });
  });
  // the four turrets at the top of the square, and the spire between them
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    kit.add(new THREE.CylinderGeometry(1.5, 1.5, 12, 8), BRICK, sx * (H - 1), BODY + 6, sz * (H - 1));
    kit.add(new THREE.ConeGeometry(1.7, 8, 8), SLATE, sx * (H - 1), BODY + 16, sz * (H - 1));
  }
  kit.add(new THREE.CylinderGeometry(6.8, 7.6, 6, 8), BRICK2, 0, BODY + 3, 0);
  kit.add(new THREE.ConeGeometry(6.8, TOP - BODY - 6, 8), BRICK2, 0, (BODY + 6 + TOP) / 2, 0);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 8, r = 5.2;
    kit.box(1.4, 3, 1.4, BRICK, r * Math.cos(a), BODY + 12, r * Math.sin(a), 0, -a).add(new THREE.ConeGeometry(1, 2, 4), SLATE, r * Math.cos(a), BODY + 14.5, r * Math.sin(a));
  }
  kit.rod([0, TOP - 0.5, 0], [0, TOP + 3, 0], 0.15, '#c9a64a', 4);
  return kit.mesh(kitMat(0.9));
}

export function salvatorTower() {
  const kit = new Kit(), { hx, hz } = SALVATOR, BODY = 72, CROWN = 86, TOP = 118;
  kit.box(2 * hx, BODY, 2 * hz, BRICK, 0, BODY / 2, 0);
  square(hx, hz).forEach(p => {
    const L = p.length, n = Math.max(3, Math.round(L / 3.2));
    // the bands of blind arcading up its sides
    for (const [y0, y1] of [[18, 28], [36, 48], [56, 68]]) {
      for (let k = 0; k < n; k++) wall(kit, p, archRing((k + 0.5) * (L / n), L / n - 0.8, y0, y1, 8), { o0: 0, o1: 0.2, hex: BRICK2 });
      wall(kit, p, [[0, y1 + 0.6], [L, y1 + 0.6], [L, y1 + 1.2], [0, y1 + 1.2]], { o0: 0, o1: 0.4, hex: STONE });
    }
  });
  // the crown: its storey of round-arched openings, the corner turrets, the octagonal spire
  kit.box(2 * hx - 2, CROWN - BODY, 2 * hz - 2, BRICK, 0, (BODY + CROWN) / 2, 0);
  square(hx - 1, hz - 1).forEach(p => {
    const L = p.length;
    for (const s of [L * 0.3, L * 0.5, L * 0.7]) wall(kit, p, archRing(s, 2, BODY + 3, CROWN - 3, 8), { o0: 0, o1: 0.1, hex: DARK });
  });
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    kit.add(new THREE.CylinderGeometry(1.6, 1.6, CROWN - BODY + 4, 8), BRICK2, sx * (hx - 0.4), (BODY + CROWN + 4) / 2, sz * (hz - 0.4));
    kit.add(new THREE.ConeGeometry(1.9, 7, 8), SLATE, sx * (hx - 0.4), CROWN + 5.5, sz * (hz - 0.4));
  }
  kit.add(new THREE.CylinderGeometry(5.4, 6, 4, 8), BRICK2, 0, CROWN + 2, 0);
  kit.add(new THREE.ConeGeometry(5.4, TOP - CROWN - 4, 8), SLATE, 0, (CROWN + 4 + TOP) / 2, 0);
  kit.rod([0, TOP - 0.5, 0], [0, TOP + 3, 0], 0.15, '#c9a64a', 4);
  return kit.mesh(kitMat(0.9));
}

export const TOWERS = [
  { id: 'onze-lieve-vrouwetoren', name: 'Onze-Lieve-Vrouwekerk', x: OLV.x, z: OLV.z, turn: OLV.turn, reach: 40, area: [onMap(OLV.x, OLV.z, OLV.turn, rect(-12, -12, 12, 12))], foot: [onMap(OLV.x, OLV.z, OLV.turn, rect(-OLV.h - 2, -OLV.h - 2, OLV.h + 2, OLV.h + 2))], make: olvTower },
  { id: 'sint-salvatorstoren', name: 'Sint-Salvatorskathedraal', x: SALVATOR.x, z: SALVATOR.z, turn: SALVATOR.turn, reach: 40, area: [onMap(SALVATOR.x, SALVATOR.z, SALVATOR.turn, rect(-11, -9, 11, 9))], foot: [onMap(SALVATOR.x, SALVATOR.z, SALVATOR.turn, rect(-SALVATOR.hx, -SALVATOR.hz, SALVATOR.hx, SALVATOR.hz))], make: salvatorTower },
];
