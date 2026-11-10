// The Hôtel de Ville (1873-92, rebuilt after the Commune burnt the old one), modelled by hand in
// place of the map's block of it, from its measurements, in game metres (the real ones times 1.25),
// on the map's outline, 179 by 111 here. Neo-Renaissance, in pale stone under blue-grey slate:
//   the long front on the square with its pavilions: the middle one with the clock and the campanile
//     over its dome-like roof and the flags, the two between and the two at the corners, each under
//     its own tall steep roof with gilt crests, the wings between them under mansards
//   three storeys of windows, round-headed on the ground floor, and the niches with the statues of
//     famous Parisians between them
//   the same corner pavilions and wings round the sides and the back
// The model's own metres: u along the front from north to south, v out towards the square (west), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = 566.6, Z = 35, TURN = -1.918;
const HU = 89.7, HV = 55.7; // half the front's length, half the depth
const STONE = '#e6dfcf', STONE2 = '#d4ccba', SLATE = '#56606a', DARK = '#33373c', GOLD = '#cfa94b';
const EAVES = 30, MANSARD = 40;

export function hotelDeVille() {
  const kit = new Kit();
  // the body, its mansard all round, and the flat top over the courtyards
  kit.box(2 * HU - 4, EAVES, 2 * HV - 4, STONE, 0, EAVES / 2, 0);
  kit.box(2 * HU - 3, 1.4, 2 * HV - 3, STONE2, 0, EAVES + 0.2, 0);
  kit.frustum(2 * HU - 3, 2 * HV - 3, 2 * HU - 15, 2 * HV - 15, MANSARD - EAVES, SLATE, 0, EAVES + 0.9, 0);
  // windows along every side: three storeys, and dormers in the mansard
  const sides = [[0, HV - 2, 0, 2 * HU - 4], [0, -HV + 2, Math.PI, 2 * HU - 4], [HU - 2, 0, Math.PI / 2, 2 * HV - 4], [-HU + 2, 0, -Math.PI / 2, 2 * HV - 4]];
  for (const [cu, cv, ang, len] of sides) {
    const c = Math.cos(ang), s = Math.sin(ang), n = Math.floor(len / 4.6);
    // a point a along the side, d out from it
    const at = (a, d) => [cu + a * c + d * s, cv - a * s + d * c];
    for (let k = 0; k < n; k++) {
      const a = -len / 2 + (k + 0.5) * (len / n);
      for (const [y, h] of [[4.5, 5.2], [13.5, 5], [21.5, 4.4]]) {
        const [u, v] = at(a, 0.1);
        kit.box(2, h, 0.4, DARK, u, y, v, 0, ang);
      }
      if (k % 2 === 0) {
        const [u, v] = at(a, -3), [u2, v2] = at(a, -2.6);
        kit.box(2.2, 3.4, 1.6, STONE2, u, EAVES + 4, v, 0, ang);
        kit.box(1.3, 2.2, 0.3, DARK, u2, EAVES + 3.8, v2, 0, ang);
        kit.frustum(2.4, 1.8, 0, 1.8, 1.4, SLATE, u, EAVES + 5.7, v, ang);
      }
      // the niches with their statues between the first floor's windows
      if (k % 3 === 1) {
        const [u, v] = at(a + 2.3, 0.35);
        kit.box(0.8, 2.6, 0.6, '#efe9dc', u, 13.6, v, 0, ang);
      }
    }
    // the cornices under the windows
    for (const y of [9.4, 18.2, 26]) {
      const [u, v] = at(0, 0.3);
      kit.box(len, 0.7, 0.6, STONE2, u, y, v, 0, ang);
    }
  }

  // a pavilion: its block standing out of the front, its tall roof, and the gilt crest on top
  const pavilion = (u, v, w, d, wall, roof, top) => {
    kit.box(w, wall, d, STONE, u, wall / 2, v);
    kit.box(w + 1, 1.4, d + 1, STONE2, u, wall + 0.4, v);
    kit.frustum(w + 0.6, d + 0.6, top, top * (d / w), roof, SLATE, u, wall + 1.1, v);
    kit.box(top + 0.4, 0.5, top * (d / w) + 0.4, GOLD, u, wall + 1.1 + roof + 0.25, v);
    for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.add(new THREE.ConeGeometry(0.3, 2.2, 4), GOLD, u + su * top / 2, wall + roof + 2.4, v + sv * top * (d / w) / 2);
    // its pilasters at the corners, and windows on its faces
    for (const su of [-1, 1]) for (const sv of [-1, 1]) kit.box(1.4, wall, 1.4, STONE2, u + su * (w / 2 - 0.5), wall / 2, v + sv * (d / 2 - 0.5));
    for (const [y, h] of [[4.5, 5.2], [13.5, 5], [22, 4.6]]) for (const du of [-w / 4, w / 4]) {
      kit.box(2.2, h, 0.4, DARK, u + du, y, v + d / 2 + 0.1);
      kit.box(2.2, h, 0.4, DARK, u + du, y, v - d / 2 - 0.1);
      kit.box(0.4, h, 2.2, DARK, u + w / 2 + 0.1, y, v + du * (d / w));
      kit.box(0.4, h, 2.2, DARK, u - w / 2 - 0.1, y, v + du * (d / w));
    }
  };
  // the corners, front and back
  for (const su of [-1, 1]) for (const sv of [-1, 1]) pavilion(su * (HU - 10), sv * (HV - 10), 20, 20, EAVES + 3, 20, 4);
  // the two between on the front, and the middle one
  for (const su of [-1, 1]) pavilion(su * 46, HV - 6, 15, 12, EAVES + 1.5, 15, 3);
  pavilion(0, HV - 6, 26, 12, EAVES + 4, 14, 9);
  // the middle pavilion's clock, under a pediment, and the campanile with the flags on top
  kit.add(new THREE.CylinderGeometry(2.6, 2.6, 0.5, 24), '#f1ede4', 0, 29, HV + 0.35, Math.PI / 2);
  kit.add(new THREE.TorusGeometry(2.6, 0.25, 4, 24), GOLD, 0, 29, HV + 0.6);
  kit.box(0.2, 1.8, 0.2, DARK, 0, 29.6, HV + 0.7).box(1.4, 0.2, 0.2, DARK, 0.5, 29, HV + 0.7);
  const ped = new THREE.Shape([new THREE.Vector2(-8, 0), new THREE.Vector2(8, 0), new THREE.Vector2(0, 4)]);
  kit.add(new THREE.ExtrudeGeometry(ped, { depth: 1, bevelEnabled: false }), STONE2, 0, 33.5, HV - 0.2);
  const CT = EAVES + 4 + 1.1 + 14; // the top of the middle roof
  kit.box(6, 2, 6, STONE2, 0, CT + 1, HV - 6);
  for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.box(0.7, 6, 0.7, STONE2, su * 2.4, CT + 5, HV - 6 + sv * 2.4);
  kit.box(6.4, 1, 6.4, STONE2, 0, CT + 8.3, HV - 6);
  kit.add(new THREE.SphereGeometry(3, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), SLATE, 0, CT + 8.8, HV - 6);
  kit.add(new THREE.CylinderGeometry(0.4, 0.6, 2.4, 6), GOLD, 0, CT + 12.6, HV - 6);
  for (const du of [-9, 9]) {
    kit.rod([du, EAVES + 6, HV + 0.5], [du, EAVES + 14, HV + 0.5], 0.12, '#888', 4);
    ['#24418f', '#f4f4f4', '#d0323a'].forEach((hex, k) => kit.box(0.08, 2.2, 1.1, hex, du, EAVES + 12.7, HV + 1.1 + k * 1.1));
  }
  return kit.mesh(kitMat(0.88));
}

export const HOTEL_DE_VILLE = [{
  id: 'hotel-de-ville', name: 'Hôtel de Ville', x: X, z: Z, turn: TURN, reach: 120,
  area: [onMap(X, Z, TURN, rect(-HU - 2, -HV - 2, HU + 2, HV + 2))],
  foot: [onMap(X, Z, TURN, rect(-HU, -HV, HU, HV))],
  streets: [onMap(X, Z, TURN, rect(-HU - 1, -HV - 1, HU + 1, HV + 1))], // the service road into its courtyard
  make: hotelDeVille,
}];
