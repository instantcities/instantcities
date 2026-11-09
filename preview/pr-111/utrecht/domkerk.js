// The Domkerk (1254-1517), what the storm of 1674 left of it: the choir and the transept, modelled by
// hand in place of the map's two flat blocks of them, in game metres (the real ones times 1.25), on
// the map's outline. The nave between the transept and the Domtoren came down in the storm and was
// never rebuilt; the Domplein lies where it stood.
//   the transept, its arms with their tall pointed windows between buttresses and pinnacles, the
//     great windows and gables at the north and south ends, the steep slate roof, the little spire
//     on the crossing, and the wall that closed the crossing on the Domplein side after 1674 with
//     the outline of the nave's arch in it
//   the choir to the east, its tall windows over the roofs of the ambulatory and the chapels round
//     it, its five-sided apse, and the flying buttresses that hold it up
//   the ambulatory and the chapels on the map's lower outline round the choir, with their windows
//     and their flat leaded roofs behind a parapet
// The church's own metres: about the crossing, x along the choir (+x east), z along the transept
// (+z south), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep, gable, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = -78.15, Z = 109.3, TURN = 0.335;
const TU = 7.3, TV = 29.1, CV = 7, CU = 36.3, EAVES = 36, RIDGE = 52, LOW = 20; // the transept's half sides, the choir's half width and its end (the apse's middle)
const STONE = '#cfc3a6', STONE2 = '#bcae8f', GLASS = '#2b3138', SLATE = '#4a5057', LEAD = '#6b7176', GOLD = '#c9a64a';
// the map's lower outline round the choir: the ambulatory, the chapels and the rooms off them
const LOWER = [[40, -28.2], [40.6, -15.6], [45.9, -12.7], [50.1, -9.8], [52.1, -5], [53.5, -0.1], [52.1, 5.1], [50.2, 10.3], [46, 13.5], [42.2, 16], [38.9, 16.6], [39.2, 32.4], [31.4, 32.8], [31.2, 21.1], [19.2, 20.7], [19.1, 28.6], [-23.4, 28.5], [-23.7, 16.2], [-6.8, 16.4], [-6.8, -28.2]];
// the five sides of the apse round (CU, 0)
const APSE = [-90, -45, 0, 45, 90].map(a => [CU + CV * Math.cos((a * Math.PI) / 180), CV * Math.sin((a * Math.PI) / 180)]);

// a pinnacle at (x, z) from y: its shaft and its spirelet
function pinnacle(kit, x, y, z, w, h, hex = STONE2) {
  kit.box(w, h * 0.45, w, hex, x, y + h * 0.225, z);
  kit.add(new THREE.ConeGeometry(w * 0.72, h * 0.55, 4).rotateY(Math.PI / 4), hex, x, y + h * 0.725, z);
}

// A wall along the path from y0 to y1, with a tall pointed window in every bay of about `bay` metres
// from wy0 to wy1 (none in the bays that `skip` names), a buttress between the bays standing up past
// the eaves as a pinnacle, a string course under the windows and the parapet along its top.
function bays(kit, p, { y0 = 0, y1 = EAVES, wy0, wy1, bay = 7.3, skip = () => false, buttress = true, glass = GLASS }) {
  const L = p.length, n = Math.max(1, Math.round(L / bay)), b = L / n, holes = [];
  for (let i = 0; i < n; i++) if (!skip(i, n) && wy1 > wy0) holes.push(pointedRing(b * (i + 0.5), Math.min(b * 0.55, 4.6), wy0, wy1, 1, 7));
  wall(kit, p, [[0, y0], [L, y0], [L, y1 + 1.2], [0, y1 + 1.2]], { holes, o0: -0.6, o1: 0, hex: STONE });
  for (const ring of holes) {
    const s = (ring[0][0] + ring[1][0]) / 2;
    wall(kit, p, ring, { o0: -0.6, o1: -0.5, hex: glass });
    wall(kit, p, [[s - 0.1, wy0], [s + 0.1, wy0], [s + 0.1, wy1 - 2], [s - 0.1, wy1 - 2]], { o0: -0.5, o1: -0.3, hex: STONE2 });
  }
  if (wy1 > wy0) sweep(kit, p, 0, L, [[-0.1, wy0 - 0.5], [0.3, wy0 - 0.5], [0.3, wy0], [-0.1, wy0]], STONE2, { step: L });
  sweep(kit, p, 0, L, [[-0.2, y1 - 0.3], [0.4, y1 - 0.3], [0.4, y1 + 0.2], [-0.2, y1 + 0.2]], STONE2, { step: L });
  if (buttress) for (let i = 0; i <= n; i++) {
    const q = p.at(b * i), x = q.x + 0.6 * q.tz, z = q.z - 0.6 * q.tx;
    kit.box(1.1, y1 - y0, 1.2, STONE2, x, (y0 + y1) / 2, z, 0, Math.atan2(-q.tz, q.tx));
    pinnacle(kit, x, y1, z, 1.1, 5);
  }
}

export function domkerk() {
  const kit = new Kit();
  // the ambulatory and the chapels: walls round the map's lower outline, the leaded roof inside it
  for (let k = 0; k < LOWER.length; k++) {
    const [a, b] = [LOWER[k], LOWER[(k + 1) % LOWER.length]];
    if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5) continue;
    // the outline runs round with its outside to the right of each side
    if (a[0] === -6.8 && b[0] === -6.8) continue; // the side inside the transept
    bays(kit, linePath(a[0], a[1], b[0], b[1]), { y1: LOW, wy0: 4, wy1: LOW - 4, bay: 6, buttress: Math.hypot(b[0] - a[0], b[1] - a[1]) > 4 });
  }
  kit.add(new THREE.ShapeGeometry(new THREE.Shape(LOWER.map(([u, v]) => new THREE.Vector2(u, -v)))).rotateX(-Math.PI / 2), LEAD, 0, LOW + 0.1, 0);
  // the transept: its four walls, the crossing's on the Domplein side closed with the nave's arch in it
  kit.box(2 * TU - 1, EAVES, 2 * TV - 1, GLASS, 0, EAVES / 2, 0);
  const west = linePath(-TU, TV, -TU, -TV), east = linePath(TU, -TV, TU, TV);
  const crossing = (i, n) => Math.abs(((i + 0.5) / n) * 2 * TV - TV) < CV + 1;
  bays(kit, west, { wy0: 9, wy1: EAVES - 4, skip: crossing });
  const s0 = TV - CV - 1;
  wall(kit, west, [[s0, 6], [2 * TV - s0, 6], ...pointedRing(TV, 2 * CV + 2, 6, EAVES - 1, 1, 8).slice(2)], { o0: 0, o1: 0.35, hex: STONE2 });
  wall(kit, west, pointedRing(TV, 2 * CV - 0.4, 6.4, EAVES - 2.4, 1, 8), { o0: 0.35, o1: 0.45, hex: '#c6b99c' });
  for (const [s, w] of [[TV - 3, 2], [TV + 3, 2]]) wall(kit, west, pointedRing(s, w, 12, 28, 1, 6), { o0: 0.45, o1: 0.5, hex: GLASS });
  bays(kit, east, { wy0: LOW + 2, wy1: EAVES - 4, skip: crossing });
  // the ends of the arms: the great window, the gable over it, its pinnacles
  for (const [p, sign] of [[linePath(TU, TV, -TU, TV), 1], [linePath(-TU, -TV, TU, -TV), -1]]) {
    const L = p.length;
    wall(kit, p, [[0, 0], [L, 0], [L, EAVES + 1.2], [L / 2, RIDGE + 1], [0, EAVES + 1.2]], { holes: [pointedRing(L / 2, 8.4, 9, EAVES - 1.5, 1, 9)], o0: -0.6, o1: 0, hex: STONE });
    wall(kit, p, pointedRing(L / 2, 8.4, 9, EAVES - 1.5, 1, 9), { o0: -0.6, o1: -0.5, hex: GLASS });
    for (const s of [L / 2 - 2.1, L / 2, L / 2 + 2.1]) wall(kit, p, [[s - 0.12, 9], [s + 0.12, 9], [s + 0.12, EAVES - 6], [s - 0.12, EAVES - 6]], { o0: -0.5, o1: -0.3, hex: STONE2 });
    wall(kit, p, archRose(L / 2, EAVES + 6.5, 2.2), { o0: 0, o1: 0.1, hex: GLASS });
    if (sign > 0) wall(kit, p, pointedRing(L / 2, 3.4, 0, 6.5, 1, 7), { o0: 0, o1: 0.1, hex: '#3a2c22' });
    for (const s of [0, L]) {
      const q = p.at(s);
      kit.box(1.6, EAVES + 3, 1.6, STONE2, q.x, (EAVES + 3) / 2, q.z + sign * 0.5);
      pinnacle(kit, q.x, EAVES + 3, q.z + sign * 0.5, 1.6, 8);
    }
    const m = p.at(L / 2);
    pinnacle(kit, m.x, RIDGE, m.z, 0.9, 4.4);
  }
  gable(kit, -TV + 0.3, TV - 0.3, TU + 0.6, EAVES + 1, RIDGE, SLATE, { turn: Math.PI / 2 });
  // the choir: its walls with the tall windows over the ambulatory's roof, the apse, the roof
  kit.box(CU - TU, EAVES, 2 * CV - 1, GLASS, (CU + TU) / 2, EAVES / 2, 0);
  kit.add(new THREE.CylinderGeometry(CV - 0.5, CV - 0.5, EAVES, 8), GLASS, CU, EAVES / 2, 0);
  for (const p of [linePath(TU, -CV, CU, -CV), linePath(CU, CV, TU, CV)]) bays(kit, p, { y0: LOW - 1, wy0: LOW + 2, wy1: EAVES - 2.5, bay: 7.3, buttress: false });
  for (let k = 0; k + 1 < APSE.length; k++) bays(kit, linePath(...APSE[k], ...APSE[k + 1]), { y0: LOW - 1, wy0: LOW + 2, wy1: EAVES - 2.5, bay: 6, buttress: false });
  gable(kit, TU, CU, CV + 0.6, EAVES + 1, RIDGE, SLATE);
  kit.add(new THREE.ConeGeometry(CV + 0.6, RIDGE - EAVES - 1, 8), SLATE, CU, (EAVES + 1 + RIDGE) / 2, 0);
  // the flying buttresses: a pier with its pinnacle on the ambulatory's roof, and a flyer up from it
  // to the choir's wall between each pair of windows
  const piers = [];
  for (const u of [TU + 7.3, TU + 14.6, TU + 21.9, CU]) for (const k of [-1, 1]) piers.push([u, k * CV, 0, k]);
  for (const a of [-45, 0, 45]) piers.push([CU + CV * Math.cos((a * Math.PI) / 180), CV * Math.sin((a * Math.PI) / 180), (a * Math.PI) / 180, 0]);
  for (const [u, v, a, k] of piers) {
    const [du, dv] = k ? [0, k] : [Math.cos(a), Math.sin(a)], pu = u + du * 6, pv = v + dv * 6;
    kit.box(1.4, 9, 1.4, STONE2, pu, LOW + 4.5, pv);
    pinnacle(kit, pu, LOW + 9, pv, 1.4, 6);
    kit.rod([pu - du * 0.7, LOW + 7.5, pv - dv * 0.7], [u + du * 0.3, EAVES - 3, v + dv * 0.3], 0.35, STONE2, 5);
    kit.rod([pu - du * 0.7, LOW + 5.5, pv - dv * 0.7], [u + du * 0.3, EAVES - 6, v + dv * 0.3], 0.25, STONE2, 5);
  }
  // the little spire on the crossing
  kit.add(new THREE.CylinderGeometry(1.4, 1.6, 6, 8), STONE2, 0, RIDGE + 1, 0);
  kit.add(new THREE.ConeGeometry(1.5, 11, 8), SLATE, 0, RIDGE + 9.5, 0);
  kit.add(new THREE.SphereGeometry(0.3, 6, 4), GOLD, 0, RIDGE + 15.2, 0);
  return kit.mesh(kitMat(0.9));
}

// a round window as a ring in (s, y): its middle at (s, y), r across
const archRose = (s, y, r) => Array.from({ length: 20 }, (_, k) => [s + r * Math.cos((k / 20) * 2 * Math.PI), y + r * Math.sin((k / 20) * 2 * Math.PI)]);

// riders bump into its walls all round; the Domplein stays open where the nave stood
export const DOMKERK = [{
  id: 'domkerk', name: 'Domkerk', x: X, z: Z, turn: TURN, reach: 110,
  area: [onMap(X, Z, TURN, rect(-24, -29.6, 54, 33))],
  foot: [onMap(X, Z, TURN, LOWER), onMap(X, Z, TURN, rect(-TU, -TV, TU, TV))],
  make: domkerk,
}];
