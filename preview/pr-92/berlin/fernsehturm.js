// The Fernsehturm on the Alexanderplatz (1965-69), modelled by hand in place of the map's stack of
// prisms of it, from its measurements and photos, in game metres (the real ones times 1.25): 460 m
// to the tip of its antenna, so it is seen from all over the map.
//   the shaft of grey concrete, tapering up, on its three-legged foot, and the lift's light strip
//   the sphere of steel facets, its two rings of windows (the viewing floor and the restaurant
//     that turns), and the cross of light the sun throws on it
//   the shaft going on through it and up, and the antenna in red and white
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';

const X = 2026.5, Z = -824; // its middle
const SPHERE = 265, R = 20, SHAFT_TOP = 312, TIP = 460;
const CONCRETE = '#cfccc6', CONCRETE2 = '#bdbab3', STEEL = '#9fa6ad', GLASS = '#2f3a45', RED = '#c8392e', WHITE = '#efeeea';

export function fernsehturm() {
  const kit = new Kit();
  // the three legs at its foot, and the shaft
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    kit.box(4, 22, 10, CONCRETE2, 7.2 * Math.cos(a), 11, 7.2 * Math.sin(a), 0, -a);
  }
  kit.add(new THREE.CylinderGeometry(5.6, 8.8, SPHERE - R + 2, 32), CONCRETE, 0, (SPHERE - R + 2) / 2, 0);
  kit.box(0.6, SPHERE - R - 28, 1.2, '#8b9299', 0, (SPHERE - R + 28) / 2, 5.9 + 1.2); // the lift's shaft of glass
  // the sphere, its facets, its windows, and the platform under it
  kit.add(new THREE.CylinderGeometry(R * 0.55, 5.6, 8, 32), CONCRETE, 0, SPHERE - R + 2, 0);
  kit.add(new THREE.SphereGeometry(R, 24, 16), STEEL, 0, SPHERE, 0);
  for (const [y, h] of [[SPHERE - 4.6, 3.4], [SPHERE - 9.6, 2.6]]) {
    const r = Math.sqrt(R * R - (y - SPHERE) ** 2) + 0.7;
    kit.add(new THREE.CylinderGeometry(r, r - 0.3, h, 24, 1, true), GLASS, 0, y, 0);
  }
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    kit.add(new THREE.TorusGeometry(R + 0.05, 0.12, 3, 32, Math.PI), '#b8bec4', 0, SPHERE, 0, 0, a, Math.PI / 2);
  }
  // the shaft on up through it, and the antenna
  kit.add(new THREE.CylinderGeometry(3.4, 4.4, SHAFT_TOP - SPHERE, 24), CONCRETE, 0, (SPHERE + SHAFT_TOP) / 2, 0);
  const bands = 12, ant = TIP - SHAFT_TOP;
  for (let k = 0; k < bands; k++) {
    const y0 = SHAFT_TOP + (k / bands) * ant, r = 2.4 - (k / bands) * 1.9;
    kit.add(new THREE.CylinderGeometry(r - 0.15, r, ant / bands, 12), k % 2 ? WHITE : RED, 0, y0 + ant / bands / 2, 0);
  }
  kit.add(new THREE.SphereGeometry(0.7, 8, 6), RED, 0, TIP, 0);
  return kit.mesh(kitMat(0.6, 0.2));
}

const ring = (r, n = 24) => Array.from({ length: n }, (_, k) => [X + r * Math.cos((k / n) * 2 * Math.PI), Z + r * Math.sin((k / n) * 2 * Math.PI)]).flat().map(v => Math.round(v * 10) / 10);
export const FERNSEHTURM = [{ id: 'fernsehturm', name: 'Fernsehturm', x: X, z: Z, reach: 900, area: [ring(12)], foot: [ring(10.5)], make: fernsehturm }];
