// The Campanile di San Marco (rebuilt 1903-12 as it was before it fell in 1902) and Sansovino's
// Loggetta at its foot, modelled by hand in place of the map's pieces of them, from their
// measurements and photos, in game metres (the real ones times 1.25), on the map's outline: a
// shaft 15 m square, its belfry at 64 m and the angel at 123 m.
//   the shaft of brick on a plinth of Istrian stone, each face four tall panels between lesenes
//     that meet in round arches under the belfry
//   the belfry, four arches to each side between columns of white stone, the bells in it, a railing
//   the attic over it, two faces with the lion of St Mark and two with Venice as Justice
//   the pyramid of green copper on top, and the golden archangel Gabriel turning in the wind
//   the Loggetta against its east face to the Palazzo Ducale: three arches between paired columns
//     of red and white marble, bronze gods in the niches, its attic, and the terrace in front of it
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, square, wall, column, archRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 163.7, Z = 290.2, TURN = 0.344; // its middle, and its east face turned from east (local +x)
const H = 7.6; // half the shaft's width
const SHAFT = 62.5, BELL = [64, 75.5], ATTIC = [76.6, 88.6], SPIRE = 117.6;
const BRICK = '#a85a42', BRICK2 = '#9b513c', ISTRIA = '#ece6d6', COPPER = '#6d9c86', GOLD = '#d8b24a';
const RED = '#b4675a', VERDE = '#5f7a66';

export function campanile() {
  const kit = new Kit();
  // the plinth, and the brick shaft: a core with the lesenes and their arches standing out of it
  kit.box(2 * H + 0.8, 1.2, 2 * H + 0.8, ISTRIA, 0, 0.6, 0);
  kit.box(2 * H - 0.8, SHAFT - 1.2, 2 * H - 0.8, BRICK2, 0, (SHAFT + 1.2) / 2, 0);
  square(H, H, 0.4).forEach((path, k) => {
    const len = path.length, off = k % 2 ? -0.4 : 0, panel = (2 * H - 5 * 1.4) / 4;
    const holes = [0, 1, 2, 3].map(j => archRing(1.4 + panel / 2 + j * (panel + 1.4) + off, panel, 1.6, SHAFT - 2.2, 10));
    wall(kit, path, [[0, 1.2], [len, 1.2], [len, SHAFT], [0, SHAFT]], { holes, o0: -0.4, o1: 0, hex: BRICK });
  });
  // the belfry floor with its railing, the belfry's arches and columns, the bells
  kit.box(2 * H + 0.6, BELL[0] - SHAFT, 2 * H + 0.6, ISTRIA, 0, (SHAFT + BELL[0]) / 2, 0);
  square(H - 0.2, H - 0.2, 0.6).forEach((path, k) => {
    const len = path.length, off = k % 2 ? -0.6 : 0, w = 2.4, step = (2 * (H - 0.2)) / 4;
    const holes = [0, 1, 2, 3].map(j => archRing(step / 2 + j * step + off, w, BELL[0], BELL[1] - 2.2, 10));
    wall(kit, path, [[0, BELL[0]], [len, BELL[0]], [len, BELL[1]], [0, BELL[1]]], { holes, o0: -0.6, o1: 0, hex: ISTRIA });
    for (let j = 1; j < 4; j++) column(kit, path, j * step + off, 0.25, BELL[0], BELL[1] - 2.2 - w / 2, 0.35, ISTRIA, 'ionic');
    for (let j = 0; j <= 16; j++) {
      const p = path.at(Math.min(len, Math.max(0, (j / 16) * len))), x = p.x + 0.55 * p.tz, z = p.z - 0.55 * p.tx;
      kit.box(0.14, 1.1, 0.14, '#3b3b38', x, BELL[0] + 0.55, z);
    }
  });
  for (const [x, z, r] of [[-2.4, -2.4, 1], [2.4, 2.4, 0.9], [2.4, -2.4, 0.8], [-2.4, 2.4, 1.1], [0, 0, 1.3]]) {
    kit.add(new THREE.CylinderGeometry(r * 0.55, r, r * 1.5, 10), '#6e5a35', x, BELL[1] - 3.4 - r * 0.75, z);
  }
  kit.box(2 * H - 0.6, 0.8, 2 * H - 0.6, ISTRIA, 0, BELL[1] - 0.4, 0); // the belfry's ceiling
  kit.box(2 * H + 0.8, 0.6, 2 * H + 0.8, ISTRIA, 0, BELL[1] + 0.3, 0).box(2 * H + 0.2, 0.5, 2 * H + 0.2, ISTRIA, 0, BELL[1] + 0.85, 0);
  // the attic, its reliefs: the lion of St Mark east and west, Venice as Justice north and south
  kit.box(2 * H - 0.8, ATTIC[1] - ATTIC[0], 2 * H - 0.8, ISTRIA, 0, (ATTIC[0] + ATTIC[1]) / 2, 0);
  square(H - 0.4).forEach((path, k) => {
    const len = path.length, lion = k % 2 === 1;
    wall(kit, path, [[1.2, ATTIC[0] + 1.6], [len - 1.2, ATTIC[0] + 1.6], [len - 1.2, ATTIC[1] - 1.8], [1.2, ATTIC[1] - 1.8]], { o0: 0, o1: 0.15, hex: shade(ISTRIA, -0.12) });
    const c = len / 2, y = ATTIC[0] + 4.5;
    if (lion) wall(kit, path, [[c - 3.2, y - 1.2], [c + 3.4, y - 1.2], [c + 3.4, y + 1], [c + 1.2, y + 1.4], [c + 0.6, y + 3.4], [c - 0.6, y + 3.6], [c - 1.4, y + 1.2], [c - 3.2, y + 1]], { o0: 0.15, o1: 0.45, hex: GOLD });
    else wall(kit, path, [[c - 1.1, y - 1.6], [c + 1.1, y - 1.6], [c + 0.7, y + 3.2], [c, y + 4.2], [c - 0.7, y + 3.2]], { o0: 0.15, o1: 0.45, hex: shade(ISTRIA, 0.1) });
  });
  kit.box(2 * H + 0.4, 0.8, 2 * H + 0.4, ISTRIA, 0, ATTIC[1] + 0.4, 0);
  // the pyramid and the archangel on his little gilded plinth
  const spire = new THREE.ConeGeometry((2 * H - 1.4) / Math.SQRT2, SPIRE - ATTIC[1] - 0.8, 4).rotateY(Math.PI / 4);
  kit.add(spire, COPPER, 0, (SPIRE + ATTIC[1] + 0.8) / 2, 0);
  kit.box(1.2, 1, 1.2, GOLD, 0, SPIRE + 0.2, 0);
  kit.add(new THREE.CylinderGeometry(0.4, 0.7, 3.4, 8), GOLD, 0, SPIRE + 2.4, 0);
  kit.add(new THREE.SphereGeometry(0.4, 8, 6), GOLD, 0, SPIRE + 4.5, 0);
  for (const k of [-1, 1]) kit.box(0.14, 2.6, 1.3, GOLD, k * 0.6, SPIRE + 3.6, 0.5, 0.4, 0, k * 0.3);
  loggetta(kit);
  return kit.mesh(kitMat(0.88));
}

// The Loggetta, against the east face (local +x): its front 19 m along the face, 7 m out from it,
// and its terrace another 5.8 m in front
const LW = 18.9, LD = 6.9, TERRACE = 5.8, LTOP = 12.4;
function loggetta(kit) {
  const x0 = H + LD, path = linePath(x0, -LW / 2, x0, LW / 2); // its front, facing +x
  const bay = LW / 3, w = 3.1, crown = 7.4;
  const holes = [0, 1, 2].map(j => archRing(bay / 2 + j * bay, w, 1.1, crown, 10));
  wall(kit, path, [[0, 0], [LW, 0], [LW, 8.4], [0, 8.4]], { holes, o0: -LD, o1: 0, hex: RED });
  // the paired columns, with a niche and its bronze god between each pair
  for (let j = 0; j <= 3; j++) {
    const s = j * bay, c = Math.min(LW - 0.9, Math.max(0.9, s));
    for (const d of [-0.75, 0.75]) column(kit, path, Math.min(LW - 0.3, Math.max(0.3, c + d)), 0.45, 1.6, 8.4, 0.3, ISTRIA, 'corinthian');
    kit.box(0.7, 0.5, 2.6, ISTRIA, x0 + 0.45, 1.35, -LW / 2 + c);
    wall(kit, path, archRing(c, 1, 2.3, 6.1, 8), { o0: 0, o1: 0.05, hex: '#4a3a2a' });
    kit.add(new THREE.CylinderGeometry(0.22, 0.32, 2.6, 7), '#5a5038', x0 + 0.2, 3.6, -LW / 2 + c);
  }
  // the entablature, the attic with its reliefs, the balustrade on top
  kit.box(LD + 0.4, 1.2, LW + 0.4, ISTRIA, H + LD / 2, 9, 0);
  kit.box(LD, LTOP - 9.6, LW, RED, H + LD / 2, (9.6 + LTOP) / 2, 0);
  for (let j = 0; j < 3; j++) kit.box(0.12, 2, bay - 1.8, shade(ISTRIA, -0.06), x0 + 0.05, 11, -LW / 2 + bay / 2 + j * bay);
  kit.box(LD + 0.3, 0.4, LW + 0.3, ISTRIA, H + LD / 2, LTOP + 0.2, 0);
  for (let j = 0; j <= 24; j++) kit.add(new THREE.CylinderGeometry(0.1, 0.14, 0.8, 5), ISTRIA, x0 - 0.1, LTOP + 0.8, -LW / 2 + 0.3 + (j / 24) * (LW - 0.6));
  kit.box(0.4, 0.2, LW, ISTRIA, x0 - 0.1, LTOP + 1.3, 0);
  // the terrace in front, of verde antico and white, its balustrade and the bronze gate
  kit.box(TERRACE, 1.1, LW, shade(ISTRIA, -0.08), x0 + TERRACE / 2, 0.55, 0);
  for (const [a, b] of [[-LW / 2, -1.6], [1.6, LW / 2]]) {
    const n = Math.round((b - a) / 0.45);
    for (let j = 0; j < n; j++) kit.add(new THREE.CylinderGeometry(0.1, 0.15, 0.9, 5), VERDE, x0 + TERRACE - 0.25, 1.55, a + ((j + 0.5) / n) * (b - a));
    kit.box(0.45, 0.2, b - a, ISTRIA, x0 + TERRACE - 0.25, 2.1, (a + b) / 2);
  }
  for (const k of [-1, 1]) {
    const n = Math.round(TERRACE / 0.45);
    for (let j = 0; j < n; j++) kit.add(new THREE.CylinderGeometry(0.1, 0.15, 0.9, 5), VERDE, x0 + ((j + 0.5) / n) * TERRACE, 1.55, k * (LW / 2 - 0.25));
    kit.box(TERRACE, 0.2, 0.45, ISTRIA, x0 + TERRACE / 2, 2.1, k * (LW / 2 - 0.25));
  }
  kit.box(0.15, 1.6, 3.2, '#4d4433', x0 + TERRACE - 0.25, 1.9, 0); // the gate
}

// it stands in for the map's pieces of the tower and the Loggetta (area), and the footways drawn
// across the Loggetta's terrace go (paths)
const AREA = onMap(X, Z, TURN, rect(-H - 1, -H - 1, H + LD + TERRACE + 0.5, H + 1));
export const CAMPANILE = [{
  id: 'campanile-di-san-marco', name: 'Campanile di San Marco', x: X, z: Z, turn: TURN, reach: 140, area: [AREA], paths: [AREA],
  foot: [onMap(X, Z, TURN, rect(-H - 0.4, -H - 0.4, H, H + 0.4)), onMap(X, Z, TURN, rect(H, -LW / 2, H + LD + TERRACE, LW / 2))],
  make: campanile,
}];
