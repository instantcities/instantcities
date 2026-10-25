// The Fontana di Trevi (Salvi, 1732-62) against the south face of Palazzo Poli, modelled by hand
// from its measurements and photos, in game metres (the real ones times 1.25), along the map's face
// of the palace (38 m) and over the map's basin, which stays the map's water. Of travertine:
//   the triumphal arch in the middle, its four Corinthian columns, and in its great niche Oceanus
//     on his shell, drawn by a calm and a wild sea-horse that tritons lead out over the rocks
//   Abundance and Health in the niches either side, and the reliefs over them
//   the palace front either side, two storeys of windows between giant pilasters
//   the attic with its inscription, the four Virtues on it, and the papal arms with two Fames
//   the rocks of the scogliera spilling down into the basin, and the water falling over them
// It has nothing for riders to bump into but the palace behind it and the basin's rim.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, column, archRing } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';

const X = 508, Z = -309.5, TURN = 0.338; // the middle of the palace's face, and the face turned from east (local +z is the basin)
const W = 38, H = 33, ENT = 25.8; // its width and height, the entablature's top
const BASIN = -2.4; // the water in the map's basin (core/js/ground.js WATER)
const TRAV = '#e3dac6', TRAV2 = '#d5cbb4', ROCK = '#cbbfa5', WATER = '#9fd2dc', MARBLE = '#efeadf';

// a figure: a draped body and a head, standing at (x, y, z)
function figure(kit, x, y, z, h, hex = MARBLE) {
  kit.add(new THREE.CylinderGeometry(h * 0.12, h * 0.17, h * 0.8, 8), hex, x, y + h * 0.4, z);
  kit.add(new THREE.SphereGeometry(h * 0.09, 8, 6), hex, x, y + h * 0.88, z);
}

export function trevi() {
  const kit = new Kit(), path = linePath(W / 2, 0.3, -W / 2, 0.3), s = u => W / 2 - u; // running so its outside is the basin
  // the front of the palace either side, and the arch in the middle with its niche
  wall(kit, path, [[0, 0], [W, 0], [W, ENT], [0, ENT]], { holes: [archRing(s(0), 7.4, 6.2, 20.4, 12)], o0: 0, o1: 1.2, hex: TRAV });
  wall(kit, path, archRing(s(0), 7.4, 6.2, 20.4, 12), { o0: -0.1, o1: 0.05, hex: TRAV2 }); // the niche's back, shallow: the palace stands behind it
  kit.box(7.4, 0.4, 1.2, TRAV2, 0, 20.3, 0.9);
  for (const k of [-1, 1]) {
    // the side niches with Abundance and Health, and the reliefs over them
    wall(kit, path, archRing(s(k * 7.6), 2.8, 6.4, 13.4, 8), { o0: 1.1, o1: 1.25, hex: shade(TRAV2, -0.15) });
    figure(kit, k * 7.6, 6.4, 1.9, 5.6);
    wall(kit, path, [[s(k * 7.6) - 2, 15], [s(k * 7.6) + 2, 15], [s(k * 7.6) + 2, 18.4], [s(k * 7.6) - 2, 18.4]], { o0: 1.2, o1: 1.45, hex: shade(TRAV, -0.08) });
    // the palace front's windows, two storeys, between the pilasters
    for (const u of [13.2, 17]) for (const [y0, y1] of [[8, 12.4], [16.2, 20.2]]) {
      wall(kit, path, [[s(k * u) - 1, y0], [s(k * u) + 1, y0], [s(k * u) + 1, y1], [s(k * u) - 1, y1]], { o0: 1.15, o1: 1.3, hex: '#4b4a44' });
      wall(kit, path, [[s(k * u) - 1.5, y1 + 0.2], [s(k * u) + 1.5, y1 + 0.2], [s(k * u), y1 + 1.4]], { o0: 1.2, o1: 1.6, hex: TRAV });
    }
    for (const u of [11.1, 15.1, 18.9]) column(kit, path, s(k * u), 1.35, 4.2, ENT - 2.6, 0.55, TRAV, 'pilaster');
    // the two columns either side of the niche
    for (const u of [4.6, 10.6]) column(kit, path, s(k * u), 2.2, 4.2, ENT - 2.6, 0.85, TRAV, 'corinthian');
  }
  // the ground storey's rusticated base, the entablature, the attic and its statues and arms
  kit.box(W, 4.2, 0.5, shade(TRAV, -0.05), 0, 2.1, 1.7);
  kit.box(W + 0.6, 2.6, 2.6, TRAV, 0, ENT - 1.3, 1.6).box(W + 1.2, 0.5, 3.2, TRAV2, 0, ENT + 0.1, 1.6);
  kit.box(W, H - ENT - 2.6, 1.6, TRAV, 0, ENT + (H - ENT - 2.6) / 2 + 0.35, 1.1);
  kit.box(12, 3, 1.8, TRAV, 0, ENT + 1.6, 1.2);
  for (let line = 0; line < 3; line++) kit.box(9.5 - line * 2, 0.4, 0.1, '#7a705e', 0, ENT + 2.6 - line * 0.8, 2.15);
  for (const u of [-9.6, -4.6, 4.6, 9.6]) figure(kit, u, ENT + 0.35, 2.2, 3.8);
  kit.box(5.2, 4.6, 1.2, TRAV, 0, H - 0.6, 1.2); // the papal arms
  kit.add(new THREE.CylinderGeometry(1.4, 1.4, 0.4, 14), TRAV2, 0, H - 0.4, 2, Math.PI / 2);
  for (const k of [-1, 1]) figure(kit, k * 3.6, H - 2.8, 1.6, 3.2);
  // Oceanus on his shell, the sea-horses and the tritons
  kit.add(new THREE.CylinderGeometry(2.4, 0.6, 1.4, 12, 1, false, 0, Math.PI), MARBLE, 0, 7.2, 0.2);
  figure(kit, 0, 7.6, 0.4, 5.6);
  for (const k of [-1, 1]) {
    kit.box(1.3, 1.7, 3.6, MARBLE, k * 3.1, 4.6, 4.6, k * 0.25).box(0.9, 1.4, 1.4, MARBLE, k * 3.1, 6, 6.3, -0.5);
    figure(kit, k * 5.2, 3.2, 5.2, 3.4);
  }
  // the scogliera: rocks spilling down into the basin, sunk to the map's water, and the water
  // falling over them
  const r = rng(77);
  for (let k = 0; k < 70; k++) {
    const u = (r() - 0.5) * (W - 6), v = 1.5 + r() * 8 * (1 - Math.abs(u) / W), h = (1 - (v - 1.5) / 9) * (2.2 + r() * 3.2);
    kit.add(new THREE.DodecahedronGeometry(1.1 + r() * 1.4, 0), shade(ROCK, (r() - 0.5) * 0.12), u, BASIN + h * 0.7, v, r(), r(), r());
  }
  for (const [u, w] of [[0, 4.6], [-4.2, 1.6], [4.2, 1.6]]) kit.box(w, 6.6, 0.25, WATER, u, 2.2, 3.6, -0.35);
  return kit.mesh(kitMat(0.85));
}

export const TREVI = [{ id: 'fontana-di-trevi', name: 'Fontana di Trevi', x: X, z: Z, turn: TURN, reach: 90, make: trevi }];
