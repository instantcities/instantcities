// The Sainte-Chapelle's upper chapel (1248), simplified: one hall whose walls are nearly all glass,
// fifteen windows 15 m high telling the Bible from Genesis to the Passion, slender piers between
// them with the apostles standing on them, the blue vault strewn with gold stars, the rose window
// over the door, and the painted arcade of the lower wall in red, blue and gold.
//
// Game metres, x across and z towards the apse, from the middle of the floor; the door at -z.
import * as THREE from 'three';
import { Parts, floorMat, archOutline, pointed } from '../../core/js/inside/gothic.js';
import { saint } from '../../core/js/inside/props.js';
import { rose } from '../../core/js/inside/church.js';
import { roseWindow } from '../../core/js/inside/art.js';
import { visitors } from '../../core/js/inside/rooms.js';

const X = 6.7, Z = 20.5, BAY = 5.9, SPRING = 21, RISE = 4.6; // half its width and length, a bay, the vault
const TINT = { stone: 0x8a7a6a, pier: 0x3a4a8a, vault: 0x24357a, rib: 0xc9a24a, wall: 0x3a4a8a };
const BLUE = 0x2a3a8a, RED = 0x9a2a2a, GOLD = 0xc9a24a;

export const SIZE = [-X - 2, -Z - 2, X + 2, Z + 2];

export function makeSainteChapelle() {
  const p = new Parts(TINT), g = new THREE.Group();
  p.floor(-X, -Z, X, Z, floorMat('#c8b89a', '#8a5a3a', true, 1.1));
  const bays = Math.round((2 * Z) / BAY), step = (2 * Z) / bays;

  // the side walls: a bay each, a tall lancet of glass filling it above the lower arcade
  let variant = 0;
  for (const s of [-1, 1]) {
    for (let k = 0; k < bays; k++) {
      const z0 = -Z + k * step, z1 = z0 + step, win = archOutline(0.55, step - 0.55, 4.2, SPRING - 1.5, 3.2, 8, 0.9);
      p.panel([s * X, z0], [s * X, z1], { ySpring: SPRING, rise: RISE, t: 0.8, holes: [win], panes: [[0, variant++ % 5]], kit: p.stone, color: BLUE });
      // the slender pier between two windows, painted blue with gold, an apostle on it
      p.stone.box(0.7, SPRING, 0.7, BLUE, s * (X - 0.5), SPRING / 2, z0);
      for (let y = 1; y < SPRING; y += 2.2) p.gold.box(0.75, 0.12, 0.75, GOLD, s * (X - 0.5), y, z0);
      if (k > 0) { p.stone.box(0.9, 0.4, 0.9, GOLD, s * (X - 0.9), 6.0, z0); saint(p, s * (X - 0.9), 6.2, z0, 1.2, -s * Math.PI / 2, { robe: [0xa3202c, 0x2f56b8, 0xe8dcc0][k % 3] }); }
      // the painted blind arcade below the window, red and blue under gold arches
      p.dark.box(0.15, 3.6, step - 0.8, k % 2 ? RED : BLUE, s * (X - 0.45), 2.0, (z0 + z1) / 2);
      p.gold.box(0.2, 0.25, step - 0.8, GOLD, s * (X - 0.45), 3.9, (z0 + z1) / 2);
      // the vault over this bay, deep blue, gold ribs, stars
      if (s > 0) p.vault(-X, z0, X, z1, SPRING, RISE, { color: 0x24357a, rib: GOLD });
    }
  }
  for (let q = 0; q < 160; q++) {
    const x = (((q * 37) % 100) / 100 - 0.5) * 2 * (X - 0.8), z = -Z + (((q * 53) % 100) / 100) * 2 * Z;
    const k = Math.min(bays - 1, Math.floor((z + Z) / step)), sz = ((z + Z - k * step) / step) * 2 - 1; // where in its bay's vault
    const y = SPRING + RISE * Math.max(pointed(x / X), pointed(sz)) - 0.12;
    p.daylight.add(new THREE.SphereGeometry(0.1, 4, 3), 0xf0c860, x, y, z);
  }
  // the ends: the apse's three windows at +z, the door under the rose at -z
  p.panel([-X, Z], [X, Z], { ySpring: SPRING, rise: RISE, t: 0.8, holes: [archOutline(1.0, 3.9, 4.2, SPRING - 2, 2.2, 8, 0.9), archOutline(5.2, 8.2, 4.2, SPRING - 1, 2.4, 8, 0.9), archOutline(9.5, 12.4, 4.2, SPRING - 2, 2.2, 8, 0.9)], panes: [[0, 1], [1, 2], [2, 3]], kit: p.stone, color: BLUE });
  p.panel([-X, -Z], [X, -Z], { ySpring: SPRING, rise: RISE, t: 0.8, holes: [archOutline(X - 1.7, X + 1.7, 0, 4.4, 1.4, 8, 0.9)], kit: p.stone, color: BLUE, solid: false });
  p.wallRing([-X, -Z], [X, -Z], 0.8);
  for (const s of [-1, 1]) p.dark.box(1.6, 4.4, 0.12, 0x4a3426, s * 0.85, 2.2, -Z - 0.1);
  rose(p, roseWindow(9), 9.6, 0, 14.5, -Z + 0.6, 0);
  // the shrine's tribune at the apse: a canopy on steps where the Crown of Thorns was kept
  p.stone.box(5, 1.0, 3, GOLD, 0, 0.5, Z - 3);
  p.dark.box(4.2, 3.6, 0.2, RED, 0, 3.3, Z - 1.4);
  for (const sx of [-1.8, 1.8]) p.gold.add(new THREE.CylinderGeometry(0.15, 0.15, 5, 6).translate(0, 2.5, 0), GOLD, sx, 1.0, Z - 3.8);
  p.gold.box(4.4, 0.6, 1.2, GOLD, 0, 6.3, Z - 3.8);
  p.block(0, Z - 3, 2.8, 1.9);

  g.add(visitors([[-2, -12, 0.3], [1.5, -8, -0.2], [-3, -2, 1.2], [3, 2, -1.4], [0, 8, 0], [-2.5, 12, 0.6], [2, 14, 0.2]], 43));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: -Z + 1.6 } };
}
