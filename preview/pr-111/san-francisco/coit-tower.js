// Coit Tower (Arthur Brown Jr. and Henry Howard, 1933) on top of Telegraph Hill, built with the money
// Lillie Hitchcock Coit left "to add to the beauty of the city", modelled by hand in place of the
// map's tower and base of it, from its measurements and photos, in game metres (the real ones times
// 1.25), on the map's outline of its base: 64 m high, of unpainted reinforced concrete.
//   the low base round its foot, where the murals of 1934 are, with its doors and windows
//   the fluted column, 11.3 m across, plain and smooth between its flutes
//   the crown: the ring of tall arched openings round the viewing gallery near the top, and the
//     cornice over it
// The hill itself is flat in the game. Riders bump into the base.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';

const X = -689.9, Z = -1212.6; // its middle
const R = 6.85, BASE = 8, CROWN = 66, TOP = 80;
const CONCRETE = '#e3ded2', CONCRETE2 = '#d2ccbe', DARK = '#3b3934';
// the base's outline, from the map's (game metres about its middle)
const OUTLINE = [[-10.3, -11.4], [-9.5, -8.3], [-13.1, -7.4], [-12.2, -4.1], [-13.4, -3.8], [-13.9, -0.1], [-13.5, 3.2], [-12, 7], [-9.8, 10], [-8.7, 9.7], [-7.7, 13.2], [-4.1, 12.3], [-3.3, 13.9], [1.8, 14], [6.9, 12.4], [9.9, 10.5], [9.5, 8.8], [13.5, 7.8], [12.6, 4.2], [14.2, 3.8], [14, -1.4], [12.8, -6.5], [10.6, -10], [9, -9.6], [8.1, -12.8], [4.2, -11.8], [3.4, -14.9], [0.5, -14.2], [-6.9, -12.3]];

// a flat ring [[x, z], ...] raised from y0 to y1, as a solid block
function prism(kit, ring, y0, y1, hex) {
  const shape = new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(x, -z)));
  kit.add(new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false }).rotateX(-Math.PI / 2), hex, 0, y0, 0);
}

export function coitTower() {
  const kit = new Kit();
  // the base, its parapet, and the doors and windows round it
  prism(kit, OUTLINE, 0, BASE, CONCRETE2);
  prism(kit, OUTLINE.map(([x, z]) => [x * 1.02, z * 1.02]), BASE, BASE + 0.8, CONCRETE);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI + Math.PI / 8, r = 12.4;
    kit.box(k % 2 ? 1.6 : 2.6, k % 2 ? 2.4 : 4, 0.3, DARK, r * Math.cos(a), k % 2 ? 4 : 2, r * Math.sin(a), 0, Math.PI / 2 - a);
  }
  // the column and its flutes
  kit.add(new THREE.CylinderGeometry(R, R + 0.15, CROWN - BASE, 32), CONCRETE, 0, (BASE + CROWN) / 2, 0);
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * 2 * Math.PI;
    kit.box(0.35, CROWN - BASE - 1, 0.35, CONCRETE2, (R + 0.05) * Math.cos(a), (BASE + CROWN) / 2, (R + 0.05) * Math.sin(a), 0, Math.PI / 2 - a);
  }
  // the crown: the arched openings of the viewing gallery between their piers, the cornice, the roof
  kit.add(new THREE.CylinderGeometry(R - 0.2, R, TOP - CROWN - 2, 32), CONCRETE, 0, (CROWN + TOP - 2) / 2, 0);
  for (let k = 0; k < 16; k++) {
    const a = ((k + 0.5) / 16) * 2 * Math.PI, w = 1.3;
    kit.box(w, 7, 0.3, DARK, (R - 0.05) * Math.cos(a), CROWN + 4.5, (R - 0.05) * Math.sin(a), 0, Math.PI / 2 - a);
    kit.add(new THREE.CylinderGeometry(w / 2, w / 2, 0.3, 8, 1, false, 0, Math.PI), DARK, (R - 0.05) * Math.cos(a), CROWN + 8, (R - 0.05) * Math.sin(a), 0, Math.PI / 2 - a + Math.PI / 2, Math.PI / 2);
  }
  kit.add(new THREE.CylinderGeometry(R + 0.6, R - 0.2, 1.4, 32), CONCRETE2, 0, TOP - 1.3, 0);
  kit.add(new THREE.CylinderGeometry(R - 0.6, R - 0.4, 1.2, 32), CONCRETE, 0, TOP + 0.0, 0);
  return kit.mesh(kitMat(0.92));
}

// It stands in for the map's tower and base (area); riders bump into the base (foot).
const ring = pts => pts.flatMap(([x, z]) => [Math.round((X + x) * 10) / 10, Math.round((Z + z) * 10) / 10]);
export const COIT_TOWER = [{
  id: 'coit-tower', name: 'Coit Tower', x: X, z: Z, reach: 600,
  area: [ring(OUTLINE.map(([x, z]) => [x * 1.15, z * 1.15]))],
  foot: [ring(OUTLINE)],
  make: coitTower,
}];
