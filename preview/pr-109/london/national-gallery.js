// The National Gallery (William Wilkins, 1832-38) along the north side of Trafalgar Square,
// modelled by hand in place of the map's low block, from photos, in game metres (the real ones
// times 1.25), on the map's outline of it (with the Sainsbury Wing in the west and the galleries
// behind): its front 177 m long.
//   the galleries behind, up to the height of the front, under their lead roofs and skylights
//   the long front of Portland stone: its rusticated base, Corinthian pilasters, the entablature
//     and the balustrade along the top
//   the portico in the middle: eight Corinthian columns on their podium with the steps up from the
//     square, and the pediment
//   either side of it the porches of the side entrances, four columns each
//   the dome on its drum behind the portico, and the two little domed turrets (the "pepper pots")
//     over the pavilions at the ends
// Riders bump into the building and the portico's podium.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { column, linePath, onMap, rect } from '../core/js/arcade.js';

const X = -285.7, Z = -626, TURN = 0.281; // the dome, the front running along +x and facing +z (the square)
const TOP = 17.4, CORNICE = 14.2, BASE = 2.6;
const STONE = '#e1d9c6', STONE2 = '#cdc4ae', LEAD = '#7d8487', GLASS = '#a8bcc4', DARK = '#3a3e42';
// the map's outline in the model's own metres, going round from the east end of the front
const OUTLINE = [[47.4, 1], [58.8, 1.2], [58.7, 3.6], [70, 3.9], [70.3, -3.1], [88.7, -2.3], [88.8, -22.9], [79.4, -23], [80.8, -74.8], [78.3, -77.1], [11.4, -78.7], [11.7, -90.7], [-8.9, -91.3], [-8.8, -93.3], [-18.9, -93.6], [-18.7, -95.6], [-26.5, -95.8], [-26.3, -97.7], [-32.1, -97.9], [-32.1, -95.8], [-40.6, -95.9], [-40.6, -100.7], [-41.9, -100.7], [-41, -133.2], [-96.3, -134.5], [-97.5, -85.4], [-84.5, -85.1], [-84.5, -80.9], [-87.8, -81.1], [-88.3, -60.5], [-83.9, -60.3], [-84.1, -26.2], [-87.9, -26.2], [-88.2, -5.9], [-70.4, -5.6], [-70.5, 0.9], [-58.7, 1.1], [-58.7, -1], [-20.7, -0.5], [-20.9, 2.7], [20.4, 3.6], [20.4, 0.7]];
// the front's sections, [u0, u1, v]: the wings, the pavilions, the ranges either side of the middle
const FRONT = [[-88.2, -70.4, -5.8], [-70.5, -58.7, 1], [-58.7, -20.8, -0.7], [-20.8, 20.4, 3.2], [20.4, 58.7, 1], [58.7, 70.1, 3.7], [70.2, 88.7, -2.7]];
const PORTICO = [-15, 3.2, 15, 14.2]; // its podium, [u0, v0, u1, v1]
const PORCHES = [[-47.6, -0.8, -32.1, 3.6], [31.9, 0.8, 47.4, 5.2]]; // the two side entrances' porches

export function nationalGallery() {
  const kit = new Kit();
  // the galleries behind the front, up to the cornice, and their roofs
  const shape = new THREE.Shape(OUTLINE.map(([u, v]) => new THREE.Vector2(u, -v)));
  kit.add(new THREE.ExtrudeGeometry(shape, { depth: CORNICE, bevelEnabled: false }).rotateX(-Math.PI / 2), STONE, 0, 0, 0);
  kit.add(new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: false }).rotateX(-Math.PI / 2), LEAD, 0, CORNICE, 0);
  for (const [u0, u1, v0, v1] of [[-80, -25, -70, -10], [-15, 75, -70, -10], [-90, -45, -128, -92]]) {
    for (let v = v0 + 5; v < v1; v += 10) {
      kit.add(new THREE.CylinderGeometry(2.6, 2.6, u1 - u0, 3).rotateZ(Math.PI / 2), GLASS, (u0 + u1) / 2, CORNICE + 1.2, v); // a skylight's glass ridge
    }
  }
  // the front, section by section: the base, the pilasters with the blind panels between them, the
  // entablature, the balustrade
  for (const [u0, u1, v] of FRONT) {
    const len = u1 - u0, mid = (u0 + u1) / 2, n = Math.max(2, Math.round(len / 5.4)), bay = len / n;
    kit.box(len + 0.4, BASE, 0.6, STONE2, mid, BASE / 2, v + 0.3);
    for (let y = 0.65; y < BASE; y += 0.65) kit.box(len + 0.5, 0.08, 0.66, '#bdb39c', mid, y, v + 0.3);
    kit.box(len + 0.6, CORNICE - 12.6 + 1.4, 0.9, STONE, mid, 12.6 + (CORNICE - 12.6 + 1.4) / 2 - 0.7, v + 0.45); // the entablature
    kit.box(len + 1, 0.5, 1.3, STONE2, mid, CORNICE + 0.6, v + 0.55); // the cornice
    kit.box(len, 0.35, 0.5, STONE2, mid, CORNICE + 0.95, v + 0.2);
    kit.box(len, 0.3, 0.5, STONE2, mid, TOP - 0.15, v + 0.2);
    for (let k = 0; k <= n * 3; k++) kit.add(new THREE.CylinderGeometry(0.16, 0.2, TOP - CORNICE - 1.5, 6), STONE, u0 + (len * k) / (n * 3), CORNICE + 1.1 + (TOP - CORNICE - 1.5) / 2, v + 0.2); // the balusters
    const path = linePath(u0, v + 0.3, u1, v + 0.3);
    for (let k = 0; k <= n; k++) column(kit, path, bay * k, 0.3, BASE, 12.6, 0.42, STONE, 'pilaster');
    for (let k = 0; k < n; k++) {
      const u = u0 + bay * (k + 0.5);
      kit.box(bay - 2.2, 6.4, 0.15, STONE2, u, BASE + 1.4 + 3.2, v + 0.08); // a blind panel
      kit.box(1.4, 1.5, 0.14, DARK, u, BASE / 2 + 0.2, v + 0.62); // a window in the base
      kit.box(bay - 2.6, 1.6, 0.15, STONE2, u, 10.6, v + 0.08);
    }
  }
  // the portico: its podium and steps, the columns, the pediment
  const [pu0, pv0, pu1, pv1] = PORTICO, pm = (pu0 + pu1) / 2;
  kit.box(pu1 - pu0, BASE, pv1 - pv0, STONE2, pm, BASE / 2, (pv0 + pv1) / 2);
  for (let k = 0; k < 4; k++) kit.box(pu1 - pu0 - 6, BASE - k * 0.65, 0.7, STONE, pm, (BASE - k * 0.65) / 2, pv1 + 0.35 + k * 0.7);
  const row = linePath(pu0 + 1.6, pv1 - 1.2, pu1 - 1.6, pv1 - 1.2), back = linePath(pu0 + 1.6, pv0 + 3.2, pu1 - 1.6, pv0 + 3.2);
  for (let k = 0; k < 8; k++) column(kit, row, (row.length * k) / 7, 0, BASE, 12.6, 0.62, STONE, 'corinthian');
  for (const k of [0, 7]) column(kit, back, (back.length * k) / 7, 0, BASE, 12.6, 0.62, STONE, 'corinthian');
  kit.box(pu1 - pu0, CORNICE - 12.6, pv1 - pv0 + 0.4, STONE, pm, (12.6 + CORNICE) / 2, (pv0 + pv1) / 2);
  kit.box(pu1 - pu0 + 1, 0.5, pv1 - pv0 + 1.2, STONE2, pm, CORNICE + 0.25, (pv0 + pv1) / 2 + 0.2);
  const gable = new THREE.Shape([new THREE.Vector2(pu0 - 0.5, 0), new THREE.Vector2(pu1 + 0.5, 0), new THREE.Vector2(pm, 4.6)]);
  kit.add(new THREE.ExtrudeGeometry(gable, { depth: pv1 - pv0 + 1, bevelEnabled: false }), STONE, 0, CORNICE + 0.5, pv0);
  // the side entrances' porches: four columns under an entablature and a balustrade
  for (const [u0, v0, u1, v1] of PORCHES) {
    const m = (u0 + u1) / 2, d = v1 - v0, line = linePath(u0 + 1, v1 - 0.6, u1 - 1, v1 - 0.6);
    kit.box(u1 - u0, BASE, d, STONE2, m, BASE / 2, (v0 + v1) / 2);
    for (let k = 0; k < 4; k++) column(kit, line, (line.length * k) / 3, 0, BASE, 12.6, 0.5, STONE, 'corinthian');
    kit.box(u1 - u0, CORNICE - 12.6, d, STONE, m, (12.6 + CORNICE) / 2, (v0 + v1) / 2);
    kit.box(u1 - u0 + 0.8, 0.5, d + 0.6, STONE2, m, CORNICE + 0.25, (v0 + v1) / 2 + 0.3);
    for (let k = 0; k <= 12; k++) kit.add(new THREE.CylinderGeometry(0.16, 0.2, 1.6, 6), STONE, u0 + 0.3 + ((u1 - u0 - 0.6) * k) / 12, CORNICE + 1.3, v1 - 0.2);
    kit.box(u1 - u0, 0.3, 0.5, STONE2, m, CORNICE + 2.25, v1 - 0.2);
  }
  // the dome on its drum, the lantern
  kit.add(new THREE.CylinderGeometry(6, 6, 2, 16), STONE2, 0, CORNICE + 1, 0);
  kit.add(new THREE.CylinderGeometry(5.4, 5.4, 4.8, 16), STONE, 0, CORNICE + 4.4, 0);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * 2 * Math.PI;
    kit.add(new THREE.CylinderGeometry(0.28, 0.3, 4.6, 6), STONE2, 5.7 * Math.cos(a), CORNICE + 4.4, 5.7 * Math.sin(a));
    if (k % 2) kit.box(0.9, 2.4, 0.2, DARK, 5.42 * Math.cos(a), CORNICE + 4.4, 5.42 * Math.sin(a), 0, -a + Math.PI / 2);
  }
  kit.add(new THREE.CylinderGeometry(6.2, 6.2, 0.6, 16), STONE2, 0, CORNICE + 7.1, 0);
  kit.add(new THREE.SphereGeometry(5.6, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.25, 1), LEAD, 0, CORNICE + 7.4, 0);
  kit.add(new THREE.CylinderGeometry(1.1, 1.3, 2.6, 8), STONE, 0, CORNICE + 15, 0);
  kit.add(new THREE.SphereGeometry(1.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), LEAD, 0, CORNICE + 16.3, 0);
  kit.add(new THREE.ConeGeometry(0.3, 2.2, 6), LEAD, 0, CORNICE + 18.4, 0);
  // the pepper pots over the end pavilions
  for (const u of [-64.4, 64.4]) {
    kit.box(4.6, 2.4, 4.6, STONE, u, TOP + 1.2, -5);
    kit.add(new THREE.CylinderGeometry(1.9, 1.9, 2.6, 12), STONE, u, TOP + 3.7, -5);
    for (let k = 0; k < 8; k++) kit.add(new THREE.CylinderGeometry(0.16, 0.16, 2.6, 5), STONE2, u + 2.05 * Math.cos((k * Math.PI) / 4), TOP + 3.7, -5 + 2.05 * Math.sin((k * Math.PI) / 4));
    kit.add(new THREE.SphereGeometry(2.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.3, 1), LEAD, u, TOP + 5, -5);
    kit.add(new THREE.CylinderGeometry(0.4, 0.5, 1.4, 6), STONE, u, TOP + 8.4, -5);
    kit.add(new THREE.ConeGeometry(0.3, 1.2, 6), LEAD, u, TOP + 9.7, -5);
  }
  return kit.mesh(kitMat(0.88));
}

const OUTER = onMap(X, Z, TURN, OUTLINE), PODIUM = onMap(X, Z, TURN, rect(PORTICO[0], PORTICO[1] - 0.5, PORTICO[2], PORTICO[3] + 2.8));
export const NATIONAL_GALLERY = [{
  id: 'national-gallery', name: 'National Gallery', x: X, z: Z, turn: TURN, reach: 260,
  area: [OUTER, PODIUM, ...PORCHES.map(([u0, v0, u1, v1]) => onMap(X, Z, TURN, rect(u0 - 0.5, v0, u1 + 0.5, v1 + 0.5)))],
  foot: [OUTER, PODIUM, ...PORCHES.map(([u0, v0, u1, v1]) => onMap(X, Z, TURN, rect(u0, v0, u1, v1)))],
  make: nationalGallery,
}];
