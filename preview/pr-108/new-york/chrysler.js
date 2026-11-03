// The Chrysler Building on Lexington Avenue at 42nd Street (William Van Alen, 1928-30), built up by
// hand on the map's stack of OpenStreetMap's parts of its shaft and wings, with its crown and spire
// modelled in place of the map's pile of squares, in game metres (the real ones times 1.25): 319 m
// to the tip, for eleven months the tallest building in the world:
//   the shaft of white brick with the dark stripes of its windows, its wings stepping down to the
//     street, the band along every setback's edge
//   the four steel eagles at the corners of the 61st floor, looking out over the city
//   the crown of stainless steel: seven arches on each face, each smaller and higher than the one
//     under it, the triangular windows fanning out round them like the spokes of a wheel
//   the needle of the spire, put together in secret inside the crown and raised in 90 minutes
// Riders bump into its base. The model's own metres: x and z as on the map, from X, Z (no turn); the
// crown in its own frame along the street grid.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { prism, stripes, placed } from './deco.js';

const X = 673, Z = 395;
const CHRYSLER_PARTS = [
  [0, 248.8, [20.5, -13.3, 18.7, -14.3, 1.3, -23.9, -0.4, -24.9, -0.6, -24.4, -1.4, -23, -3.3, -19.5, -8.2, -18.4, -9.5, -19.1, -9.8, -19.2, -10.9, -17.4, -11.7, -15.9, -19.7, -1.6, -20.6, 0, -21.5, 1.6, -21, 1.8, -19.6, 2.7, -18.3, 8, -20.3, 11.8, -20.9, 13, -21.2, 13.5, -19.3, 14.5, -2, 24.1, -0.4, 24.9, -0.2, 24.5, 0.6, 23, 2.7, 19, 8, 18.4, 9.1, 19.1, 9.5, 19.3, 10.6, 17.3, 11.4, 15.9, 19.6, 1.2, 20.5, -0.3, 21.3, -1.7, 20.9, -1.9, 19.7, -2.8, 18, -8, 19.7, -11.7, 20.2, -12.7]],
  [0, 100, [-12.6, -38.4, 38.5, -10.2, 32.4, 0.8, 22.8, -4.4, 26, -10.2, 26.8, -11.6, 27.1, -12.2, 26.4, -12.6, -3.4, -29, -4.1, -29.4, -4.4, -28.8, -5.2, -27.5, -8.4, -21.7, -18.7, -27.4]],
  [0, 62.5, [-18.7, -27.4, -21.7, -29.1, -28, -32.6, -16.7, -52.8, 53.1, -14.3, 47.7, -4.8, 38.7, 4.2, 35.4, 2.4, 32.4, 0.8, 38.5, -10.2, -12.6, -38.4]],
  [0, 112.5, [-5.2, -27.5, -4.4, -28.8, -4.1, -29.4, -3.4, -29, 26.4, -12.6, 27.1, -12.2, 26.8, -11.6, 26, -10.2, 20.5, -13.3, 18.7, -14.3, 1.3, -23.9, -0.4, -24.9]],
  [0, 112.5, [-26.5, 10.5, -21.2, 13.5, -19.3, 14.5, -2, 24.1, -0.4, 24.9, 4.7, 27.8, 3.6, 29.9, 3.2, 30.6, 2.5, 30.3, -27.3, 13.9, -28.1, 13.4, -27.7, 12.8]],
  [0, 100, [-34.1, 0.4, -40.1, 11.3, 8.9, 37.8, 16.3, 28.1, 7.4, 23.1, 4.7, 27.8, 3.6, 29.9, 3.2, 30.6, 2.5, 30.3, -27.3, 13.9, -28.1, 13.4, -27.7, 12.8, -26.5, 10.5, -23.9, 6]],
  [0, 231.3, [20.5, -13.3, 26, -10.2, 22.8, -4.4, 21.3, -1.7, 20.9, -1.9, 19.7, -2.8, 18, -8, 19.7, -11.7, 20.2, -12.7]],
  [0, 87.5, [6.6, 40.8, 8.9, 37.8, -40.1, 11.3, -34.1, 0.4, -37.2, -1.3, -44.6, 12.3]],
  [0, 231.3, [-0.4, 24.9, -0.2, 24.5, 0.6, 23, 2.7, 19, 8, 18.4, 9.1, 19.1, 9.5, 19.3, 7.4, 23.1, 4.7, 27.8]],
  [0, 231.3, [-26.5, 10.5, -21.2, 13.5, -20.9, 13, -20.3, 11.8, -18.3, 8, -19.6, 2.7, -21, 1.8, -21.5, 1.6, -23.9, 6]],
  [0, 231.3, [-5.2, -27.5, -8.4, -21.7, -9.8, -19.2, -9.5, -19.1, -8.2, -18.4, -3.3, -19.5, -1.4, -23, -0.6, -24.4, -0.4, -24.9]],
  [0, 62.5, [-43.5, -4.7, -37.2, -1.3, -34.1, 0.4, -40.1, 11.3, 8.9, 37.8, 6.6, 40.8, 3.8, 44.4, 1.8, 47.1, -8.7, 41.2, -54.7, 15.5]],
  [0, 87.5, [-21.7, -29.1, -14, -43.2, 42.9, -11.3, 35.4, 2.4, 32.4, 0.8, 38.5, -10.2, -12.6, -38.4, -18.7, -27.4]],
  [248.8, 250, [-19.3, -1.4, -20.8, 1.4, -19.2, 2.4, -17.8, 8, -20.4, 13.2, -0.6, 24.3, 2.6, 18.3, 8, 17.9, 9.2, 18.6, 10.9, 15.6, 11.4, 15.9, 10.6, 17.3, 9.5, 19.3, 9.1, 19.1, 8, 18.4, 2.7, 19, 0.6, 23, -0.2, 24.5, -0.4, 24.9, -2, 24.1, -19.3, 14.5, -21.2, 13.5, -20.9, 13, -20.3, 11.8, -18.3, 8, -19.6, 2.7, -21, 1.8, -21.5, 1.6, -20.6, 0, -19.7, -1.6]],
];
const GRID = 0.507; // the way the streets run: the crown's faces look along and across them
const BRICK = '#dedcd5', GREY = '#a9aaa8', DARK = '#3a4047', STEEL = '#eceff1', BAND = '#8e9396';
const SHAFT = 248.8, TIERS = 7, R0 = 15, STEP = 13, SPIRE = 352, TIP = 399;

export function chrysler() {
  const kit = new Kit(), crown = new Kit();
  for (const part of CHRYSLER_PARTS) {
    if (part[1] - part[0] < 2) continue;
    prism(kit, part, part[1] > 200 && part[1] < 240 ? GREY : BRICK);
    stripes(kit, part, { every: 2.4, w: 1, hex: DARK, cap: 1, capHex: BAND, from: part[0] + (part[0] ? 1 : 7) });
  }
  // the crown: seven arches over each face, each tier a pair of crossed vaults on the one under it
  for (let k = 0; k < TIERS; k++) {
    const r = R0 - k * 1.9, spring = SHAFT + 1 + k * STEP, foot = k ? spring - STEP + 2 : SHAFT;
    const shape = new THREE.Shape().moveTo(-r, foot).lineTo(r, foot).lineTo(r, spring).absarc(0, spring, r, 0, Math.PI, false).lineTo(-r, foot);
    for (const turn of [0, Math.PI / 2]) {
      crown.add(new THREE.ExtrudeGeometry(shape, { depth: 2 * r, bevelEnabled: false, curveSegments: 16 }).translate(0, 0, -r).rotateY(turn), STEEL);
      // the triangular windows fanning round each arch, on both its faces
      for (const side of [-1, 1]) for (let j = 1; j < 10; j++) {
        const a = (j / 10) * Math.PI, rr = r - 1.6, x = rr * Math.cos(a), y = spring + rr * Math.sin(a);
        const geo = new THREE.BoxGeometry(0.7, 2.4, 0.2).rotateZ(a - Math.PI / 2).translate(x, y, side * (r + 0.05)).rotateY(turn);
        crown.add(geo, DARK);
      }
    }
  }
  // the spire: a slender stage over the crown, then the needle
  crown.add(new THREE.CylinderGeometry(2.2, 2.8, SPIRE - (SHAFT + TIERS * STEP), 4), STEEL, 0, (SPIRE + SHAFT + TIERS * STEP) / 2, 0, 0, Math.PI / 4);
  crown.add(new THREE.CylinderGeometry(0.15, 1.8, TIP - SPIRE, 8), STEEL, 0, (SPIRE + TIP) / 2, 0);
  // the eagles at the corners of the 61st floor, each a steel body and head looking out diagonally
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const a = Math.atan2(sz * 21, sx * 17), c = Math.cos(a), s = Math.sin(a), x = sx * 16.5, z = sz * 20.5;
    crown.add(new THREE.BoxGeometry(6, 1.6, 2), STEEL, x + c * 2, SHAFT - 2, z + s * 2, 0, -a, -0.25);
    crown.add(new THREE.BoxGeometry(1.8, 1.4, 1.2), STEEL, x + c * 5.4, SHAFT - 1, z + s * 5.4, 0, -a);
  }
  const g = new THREE.Group(), top = crown.mesh(kitMat(0.35, 0.2));
  top.rotation.y = -GRID; // its x along the cross streets
  g.add(kit.mesh(kitMat(0.7, 0.05)), top);
  return g;
}

export const CHRYSLER = [{
  id: 'chrysler', name: 'Chrysler Building', x: X, z: Z, reach: 900,
  area: [...CHRYSLER_PARTS.filter(p => !p[0]).map(p => placed(X, Z, p[2])), placed(X, Z, [-30, -30, 30, -30, 30, 30, -30, 30])],
  foot: CHRYSLER_PARTS.filter(p => !p[0] && p[1] > 60).map(p => placed(X, Z, p[2])),
  make: chrysler,
}];
