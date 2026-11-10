// The Empire State Building on Fifth Avenue at 34th Street (Shreve, Lamb & Harmon, 1930-31), built up
// by hand on the map's stack of OpenStreetMap's parts of it, in game metres (the real ones times
// 1.25): 381 m to its roof, 443 m to the tip of its antenna:
//   the base on the whole lot and the tower stepping back from it, setback by setback, as the map has
//     them, dressed in Indiana limestone with its windows and their spandrels of aluminium running
//     up in unbroken stripes between the piers, and a band along every setback's edge
//   the 86th floor's observatory under the mast, which was drawn as a mooring mast for airships: its
//     octagonal tiers with their ribs of steel, the lantern of the 102nd floor and the antenna
// Riders bump into its base. The model's own metres: x and z as on the map, from X, Z (no turn).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { prism, stripes, placed } from './deco.js';

const X = -417, Z = 834.5;
const ESB_PARTS = [
  [362.5, 387.5, [-17, -27.2, -32.3, -0.2, -31.4, 3, -21.1, 8.8, -18.9, 10, 0.9, 21, 3.1, 22.2, 13.7, 28.2, 16.8, 27.5, 32, 0.7, 30.7, -3.4, 20.7, -9, 18.5, -10.2, -1.3, -21.2, -3.4, -22.4, -13.5, -28]],
  [143.8, 318.8, [-18.1, -39.5, -3, -31.1, 2.6, -28, -1.3, -21.2, 18.5, -10.2, 22.4, -17, 27.7, -14, 42.7, -5.7, 38.8, 1.2, 21.5, 31.9, 17.5, 39, 2.6, 30.7, -2.9, 27.7, 0.9, 21, -18.9, 10, -22.7, 16.7, -28.1, 13.7, -43.3, 5.2, -39.2, -2, -21.9, -32.6]],
  [112.5, 143.8, [42.7, -5.7, 38.8, 1.2, 45.5, 4.9, 41.1, 12.7, 32.1, 28.8, 28.2, 35.6, 21.5, 31.9, 17.5, 39, 2.6, 30.7, -2.9, 27.7, -22.7, 16.7, -28.1, 13.7, -43.3, 5.2, -39.2, -2, -45.8, -5.6, -41.8, -12.8, -28.5, -36.3, -21.9, -32.6, -18.1, -39.5, -3, -31.1, 2.6, -28, 22.4, -17, 27.7, -14]],
  [318.8, 362.5, [-21.1, 8.8, -23.6, 13.3, -26.7, 11.6, -39.9, 4.3, -37, -0.7, -19.8, -31.4, -17.1, -36.1, -0.8, -27, -3.4, -22.4, -1.3, -21.2, 18.5, -10.2, 20.7, -9, 23.4, -13.6, 26.5, -11.9, 39.3, -4.8, 36.6, 0, 19.4, 30.7, 16.5, 35.6, 3.6, 28.5, 0.5, 26.7, 3.1, 22.2, 0.9, 21, -18.9, 10]],
  [0, 93.8, [-38.7, -50.9, -26.4, -44.1, -23.7, -48.9, -0.3, -35.9, -3, -31.1, 2.6, -28, 22.4, -17, 27.7, -14, 30.5, -18.9, 53.9, -5.9, 51.1, -1.1, 64, 6.1, 38.9, 50.8, 26, 43.7, 23.1, 48.8, -0.3, 35.8, 2.6, 30.7, -2.9, 27.7, -22.7, 16.7, -28.1, 13.7, -31, 18.9, -54.5, 5.9, -51.5, 0.6, -63.8, -6.2]],
  [93.8, 112.5, [53.9, -5.9, 51.1, -1.1, 42.8, 13.7, 41.1, 12.7, 32.1, 28.8, 33.8, 29.8, 26, 43.7, 23.1, 48.8, -0.3, 35.8, 2.6, 30.7, -2.9, 27.7, -22.7, 16.7, -28.1, 13.7, -31, 18.9, -54.5, 5.9, -51.5, 0.6, -43.4, -13.7, -41.8, -12.8, -33, -28.4, -34.7, -29.3, -26.4, -44.1, -23.7, -48.9, -0.3, -35.9, -3, -31.1, 2.6, -28, 22.4, -17, 27.7, -14, 30.5, -18.9]],
  [0, 412.5, [-14.9, -20.8, -25.8, -1.4, -25.1, 0.9, 12.2, 21.6, 14.8, 20.9, 25.7, 1.6, 25, -0.9, -12.2, -21.6]],
  [0, 400, [-16.3, -26, -30.9, 0, -30.3, 2.2, 13.7, 26.7, 16.1, 26.2, 30.1, 1.5, 28.8, -3, -13.6, -26.6]],
];
const STONE = '#d3ccbc', STEEL = '#7b8288', BAND = '#e4dfd2', GLASS = '#3d4a55', SILVER = '#c9ced2';
const ROOF = 412.5, LANTERN = 487.5, TIP = 554; // the mast's foot, the 102nd floor's roof and the antenna's tip

export function empireState() {
  const kit = new Kit();
  for (const part of ESB_PARTS) {
    prism(kit, part, STONE);
    stripes(kit, part, { hex: STEEL, cap: Math.min(1.6, (part[1] - part[0]) / 4), capHex: BAND, from: part[0] + (part[0] ? 1.2 : 8) });
  }
  // the shop fronts and the entrance under the stripes, round the base
  stripes(kit, ESB_PARTS.find(p => !p[0] && p[1] < 100), { every: 6, w: 4.4, hex: '#2f3337', from: 0, to: 6.5, out: 0.2 });
  // the mast: its octagonal tiers, ribbed, set back one over the other, and the 102nd floor's lantern
  const oct = (r0, r1, y0, y1, hex) => kit.add(new THREE.CylinderGeometry(r1, r0, y1 - y0, 8), hex, 0, (y0 + y1) / 2, 0, 0, Math.PI / 8);
  oct(10, 10, ROOF, ROOF + 12, STONE);
  oct(10.6, 10.6, ROOF + 12, ROOF + 13, BAND);
  oct(8.2, 7.6, ROOF + 13, ROOF + 52, SILVER);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, r0 = 8.4, r1 = 7.8;
    kit.rod([r0 * Math.cos(a), ROOF + 13, r0 * Math.sin(a)], [r1 * Math.cos(a), ROOF + 50, r1 * Math.sin(a)], 0.35, '#e9ecee', 4);
  }
  for (let y = ROOF + 18; y < ROOF + 50; y += 6) oct(8.3 - ((y - ROOF) / 52) * 0.6, 8.3 - ((y - ROOF) / 52) * 0.6, y, y + 2.4, GLASS);
  oct(7.6, 5.6, ROOF + 52, ROOF + 60, SILVER);
  oct(5.6, 4.6, ROOF + 60, LANTERN - 4, GLASS);
  oct(4.6, 2, LANTERN - 4, LANTERN, SILVER);
  // the antenna, thinning to its tip
  kit.add(new THREE.CylinderGeometry(1.1, 1.6, 26, 8), SILVER, 0, LANTERN + 13, 0);
  kit.add(new THREE.CylinderGeometry(0.4, 0.9, TIP - LANTERN - 26, 6), SILVER, 0, (LANTERN + 26 + TIP) / 2, 0);
  kit.add(new THREE.SphereGeometry(0.6, 8, 6), '#d8413a', 0, TIP, 0);
  return kit.mesh(kitMat(0.6, 0.15));
}

const BASE = ESB_PARTS.find(p => !p[0] && p[1] < 100)[2];
export const EMPIRE_STATE = [{
  id: 'empire-state', name: 'Empire State Building', x: X, z: Z, reach: 900,
  area: [placed(X, Z, BASE.map((v, k) => v * 1.04))], foot: [placed(X, Z, BASE)],
  make: empireState,
}];
