// The Rundetårn (Christian IV's round tower, 1637-42), modelled by hand in place of the map's
// pieces of it, from its measurements and photos, in game metres (the real ones times 1.25), on
// the map's outline: 19 m across, its platform at 43.5 m, against the Trinitatis church.
//   a drum of red brick on a plinth of sandstone, with string courses, its windows climbing round
//     it the way the ramp inside it winds up, seven and a half turns
//   the door to Købmagergade, and over it the king's gilded rebus in its sandstone frame
//   the cornice, the platform's wrought-iron railing, and the observatory on top: a white drum with
//     its slit and a copper dome
// The tower stands on the map's own place; only the church is left to the map.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { ellipsePath, wall, sweep, onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = -422, Z = -473.4, R = 9.65; // its middle and its radius
const TOP = 43.5, DOOR = 2.46; // the platform, and the way the door faces (radians from east, towards +z)
const BRICK = '#a5513a', BRICK2 = '#97492f', SAND = '#d9c9a3', GLASS = '#353b40', IRON = '#2c2c2a';
const SEGS = 24, LEVELS = 8;

export function rundetaarn() {
  const kit = new Kit(), path = ellipsePath(R, R), L = path.length, seg = L / SEGS;
  const door = Math.round((DOOR * R) / seg) % SEGS;
  // the inside, dark behind the windows
  kit.add(new THREE.CylinderGeometry(R - 0.6, R - 0.6, TOP - 1, 32), GLASS, 0, (TOP - 1) / 2 + 0.5, 0);
  // the drum, segment by segment, the windows climbing round it
  for (let j = 0; j < SEGS; j++) {
    const s0 = j * seg, c = s0 + seg / 2, holes = [];
    for (let k = 0; k < LEVELS; k++) {
      const y = 4.8 + k * 4.8;
      if (j === door && y > 20 && y < 31) continue; // the rebus
      if (((j - door - 3 * k) % 8 + 16) % 8 === 4 || ((j - door - 3 * k) % 8 + 16) % 8 === 0) holes.push([[c - 0.6, y], [c + 0.6, y], [c + 0.6, y + 2.1], [c, y + 2.5], [c - 0.6, y + 2.1]]);
    }
    if (j === door) holes.push([[c - 0.9, 1.2], [c + 0.9, 1.2], [c + 0.9, 3.6], [c, 4.3], [c - 0.9, 3.6]]);
    const ring = [[s0, 1.2], [s0 + seg, 1.2], [s0 + seg, TOP - 1.6], [s0, TOP - 1.6]];
    wall(kit, path, ring, { holes: j === door ? holes.slice(0, -1) : holes, o0: -0.7, o1: 0, hex: shade(j % 3 ? BRICK : BRICK2, 0.02 * (j % 2)), ends: false });
    if (j === door) {
      // the door below a solid stretch for the rebus, its frame of sandstone
      wall(kit, path, [[c - 1.3, 1.2], [c + 1.3, 1.2], [c + 1.3, 4.6], [c, 5.4], [c - 1.3, 4.6]], { holes: [holes.at(-1)], o0: 0, o1: 0.25, hex: SAND });
      wall(kit, path, [[c - 1.15, 24.6], [c + 1.15, 24.6], [c + 1.15, 30], [c - 1.15, 30]], { o0: 0, o1: 0.3, hex: SAND });
      wall(kit, path, [[c - 0.8, 25.2], [c + 0.8, 25.2], [c + 0.8, 29.4], [c - 0.8, 29.4]], { o0: 0.3, o1: 0.42, hex: '#2f3a33' });
      for (let q = 0; q < 4; q++) wall(kit, path, [[c - 0.6, 25.6 + q], [c + 0.6, 25.6 + q], [c + 0.6, 26.1 + q], [c - 0.6, 26.1 + q]], { o0: 0.42, o1: 0.5, hex: '#d6ad45' });
    }
  }
  // the plinth, the string courses and the cornice, of sandstone
  sweep(kit, path, 0, L, [[-0.8, 0], [0.35, 0], [0.35, 1.2], [0.1, 1.5], [-0.8, 1.5]], SAND, { step: seg / 2 });
  for (const y of [14.4, 28.8]) sweep(kit, path, 0, L, [[-0.4, y], [0.15, y], [0.15, y + 0.35], [-0.4, y + 0.35]], shade(SAND, -0.05), { step: seg / 2 });
  sweep(kit, path, 0, L, [[-0.8, TOP - 1.6], [0.2, TOP - 1.6], [0.55, TOP - 0.8], [0.55, TOP], [-0.8, TOP]], SAND, { step: seg / 2 });
  // the platform's lattice railing
  kit.add(new THREE.CylinderGeometry(R - 0.4, R - 0.4, 0.3, 32), '#8c8a84', 0, TOP + 0.15, 0);
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * 2 * Math.PI, x = (R + 0.3) * Math.cos(a), z = (R + 0.3) * Math.sin(a);
    kit.box(0.08, 1.3, 0.08, IRON, x, TOP + 0.65, z);
    const b = a + (2 * Math.PI) / 64, xb = (R + 0.3) * Math.cos(b), zb = (R + 0.3) * Math.sin(b);
    kit.rod([x, TOP + 0.1, z], [xb, TOP + 1.25, zb], 0.03, IRON, 4).rod([xb, TOP + 0.1, zb], [x, TOP + 1.25, z], 0.03, IRON, 4);
  }
  kit.add(new THREE.TorusGeometry(R + 0.3, 0.06, 4, 64).rotateX(Math.PI / 2), IRON, 0, TOP + 1.3, 0);
  // the observatory: its drum, the slit, the dome
  kit.add(new THREE.CylinderGeometry(3.9, 3.9, 5.2, 24), '#e9e4d8', 0.9, TOP + 2.6, 0);
  kit.box(0.7, 5, 0.3, '#3c3f42', 0.9 + 0.1, TOP + 2.8, -3.85);
  kit.add(new THREE.SphereGeometry(4.05, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), '#7fa69a', 0.9, TOP + 5.2, 0);
  kit.box(0.6, 4, 0.5, '#5d8578', 0.9, TOP + 7.2, -2.2, 0.75); // the dome's shutter
  return kit.mesh(kitMat(0.9));
}

const ring = (r, n = 40) => onMap(X, Z, 0, Array.from({ length: n }, (_, k) => [r * Math.cos((k / n) * 2 * Math.PI), r * Math.sin((k / n) * 2 * Math.PI)]));
export const RUNDETAARN = [{
  id: 'rundetaarn', name: 'Rundetårn', x: X, z: Z, reach: 100,
  area: [ring(R + 2)], foot: [ring(R + 0.35)], make: rundetaarn,
}];
