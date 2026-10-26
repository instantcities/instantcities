// The mosque and the Jawab (the "answer"), the two red sandstone buildings either side of the tomb
// on the terrace, built so the view of the tomb is symmetrical. The Jawab is the mosque's twin,
// without a mihrab. Modelled by hand in real metres (scaled to game metres, 1.25, at the end), the
// front of each towards the tomb (+x in the model, turned round for the Jawab on the east):
//   a red sandstone body 55 m long, 23 m deep and 15 m high on a low plinth, its front pierced by
//     seven pointed arches, the middle one in a taller pishtaq, each edged with white marble inlay
//   on the roof three white marble domes on drums (the middle one bigger), and a small chhatri
//     over each end and either side of the pishtaq
// Riders bump into the whole of each.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { S } from './taj.js';

const SAND = '#b4523a', SAND2 = '#a24b36', MARBLE = '#f1ede3', DARK = '#47281f', GOLD = '#d9a72e';
const L = 55, D = 23, H = 15, PL = 1.2; // length (along z), depth (along x), height, plinth
const TOMB = [-91.3, -253.8]; // the middle of the tomb, in the map's metres
const MOSQUE_X = -138.3, JAWAB_X = 138.3; // their middles from the tomb's, in real metres (the Taj's own axis is x = 0)

const lathe = (kit, pts, hex, n = 24, x = 0, z = 0) => kit.add(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n), hex, x, 0, z);

function dome(kit, x, z, r, drum) {
  const y = H + 1.2;
  kit.add(new THREE.CylinderGeometry(r * 0.78, r * 0.82, drum, 16), MARBLE, x, y + drum / 2, z);
  kit.add(new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.5, 16), MARBLE, x, y + 0.25, z);
  const up = y + drum;
  const pts = [[r * 0.8, 0], [r * 0.95, 0.5], [r * 1.02, 1.5], [r * 0.98, 2.6], [r * 0.8, 3.8], [r * 0.55, 4.8], [r * 0.3, 5.5], [r * 0.12, 5.9]];
  lathe(kit, pts.map(([q, v]) => [q, up + v * (r / 5)]), MARBLE, 24, x, z);
  kit.add(new THREE.CylinderGeometry(0.12, 0.2, 2.4, 5), GOLD, x, up + 6 * (r / 5) + 1, z);
}

function chhatri(kit, x, y, z, r) {
  kit.add(new THREE.CylinderGeometry(r + 0.3, r + 0.3, 0.4, 8), MARBLE, x, y + 0.2, z);
  for (let k = 0; k < 4; k++) {
    const t = (k / 4) * 2 * Math.PI + Math.PI / 4;
    kit.add(new THREE.CylinderGeometry(0.22, 0.25, 3.4, 5), MARBLE, x + r * Math.cos(t), y + 2.1, z + r * Math.sin(t));
  }
  kit.add(new THREE.CylinderGeometry(r + 0.3, r + 0.3, 0.4, 8), MARBLE, x, y + 3.9, z);
  lathe(kit, [[r + 0.1, y + 4.1], [r + 0.5, y + 4.7], [r * 0.7, y + 6], [0.2, y + 6.8]], MARBLE, 12, x, z);
}

// the building at the origin, its front towards +x
function building() {
  const kit = new Kit(), front = linePath(D / 2, L / 2, D / 2, -L / 2); // runs towards -z, so its outside (to the right) is +x
  // the plinth and the body behind the front wall
  kit.box(D + 1.6, PL, L + 1.6, shade(SAND, 0.08), 0, PL / 2, 0);
  kit.box(D - 2.2, H - PL, L, SAND2, -1.1, (H + PL) / 2, 0);
  // the front: seven pointed arches through a wall 2.2 deep, their inlay round them, a dark room behind
  const c = L / 2, arches = [-3, -2, -1, 0, 1, 2, 3].map(k => ({ s: c + k * 7.4, w: k ? 4 : 5.6, top: k ? PL + 9.2 : PL + 12.6 }));
  wall(kit, front, [[0, PL], [L, PL], [L, H], [c + 4.2, H], [c + 4.2, H + 3.2], [c - 4.2, H + 3.2], [c - 4.2, H], [0, H]], {
    holes: arches.map(a => pointedRing(a.s, a.w, PL + 0.2, a.top, 1.25)), o0: -1, o1: 1.2, hex: SAND,
  });
  for (const a of arches) wall(kit, front, pointedRing(a.s, a.w + 1.1, PL + 0.2, a.top + 0.7, 1.25), { holes: [pointedRing(a.s, a.w, PL + 0.2, a.top, 1.25)], o0: 1.1, o1: 1.3, hex: MARBLE });
  kit.box(0.4, H - PL, L - 1, DARK, D / 2 - 3.6, (H + PL) / 2, 0);
  // white marble bands along the top, and a plinth course
  kit.box(1.2, 0.7, L + 0.8, MARBLE, D / 2, H + 0.1, 0);
  kit.box(1.2, 0.5, L + 0.8, MARBLE, D / 2, PL + 0.2, 0);
  // the roof: three domes, a chhatri at each end and either side of the pishtaq
  kit.box(D - 2, 0.5, L - 0.4, SAND2, -0.5, H + 0.2, 0);
  dome(kit, -1.6, 0, 6.2, 3.2);
  for (const z of [-16.6, 16.6]) dome(kit, -1.6, z, 4.6, 2.6);
  for (const z of [-L / 2 + 2, L / 2 - 2, -9, 9]) chhatri(kit, D / 2 - 2, H, z, 1.6);
  return kit;
}

export function mosque() {
  const m = building().mesh(kitMat(0.88));
  m.scale.setScalar(S);
  return m;
}

const ring = (x, pts) => onMap(TOMB[0] + x * S, TOMB[1], 0, pts.map(([u, v]) => [u * S, v * S]));

// They stand in for the map's pieces of them (area); riders bump into the bodies (foot).
export const MOSQUES = [
  { id: 'mosque', name: 'Taj Mahal Masjid', x: TOMB[0] + MOSQUE_X * S, z: TOMB[1], turn: 0, reach: 420, area: [ring(MOSQUE_X, rect(-20, -34, 20, 34))], foot: [ring(MOSQUE_X, rect(-D / 2 - 1, -L / 2 - 1, D / 2 + 1, L / 2 + 1))], make: mosque },
  { id: 'jawab', name: 'Jawab', x: TOMB[0] + JAWAB_X * S, z: TOMB[1], turn: Math.PI, reach: 420, area: [ring(JAWAB_X, rect(-20, -34, 20, 34))], foot: [ring(JAWAB_X, rect(-D / 2 - 1, -L / 2 - 1, D / 2 + 1, L / 2 + 1))], make: mosque },
];
