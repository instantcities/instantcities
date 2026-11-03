// The Astronomical Tower of the Klementinum (Kaňka, 1722), the old Jesuit college by the Charles
// Bridge, modelled by hand in place of the map's pieces of it, from its measurements and photos, in
// game metres (the real ones times 1.25), on the map's outline: a square shaft 7 m wide in the
// middle of the college, 42 m to its cornice (the map's height for it), and over that the octagonal
// lantern under its domed roof, crowned by Atlas with the celestial sphere at about 54 m. The
// college's wings round it stay the map's.
//   the shaft of pale plaster with ochre corner strips and string courses, its windows getting
//     taller towards the top where it stands free of the wings, the clock faces under the cornice
//   the balcony round the top on its cornice, with its iron railing
//   the octagonal lantern with an arched window in every face, the bell-shaped roof of green copper
//     with its little lantern, and Atlas of lead carrying the sphere on his shoulders
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, wall, sweep, archRing, onMap, rect } from '../core/js/arcade.js';

const X = -140.1, Z = 148.5, TURN = 0; // the tower's middle on the map's outline, its faces square to the compass
const H = 4.35, SHAFT = 50.5, CORNICE = 52.5, LANTERN = 59.5, DOME = 64.5;
const PLASTER = '#ece2cb', OCHRE = '#d6bf8e', COPPER = '#6f9a86', LEAD = '#626567', DARK = '#2a2826', IRON = '#2c2d2e', GOLD = '#d2ad4a', WHITE = '#f4f0e6';

export function klementinum() {
  const kit = new Kit();
  kit.box(2 * H - 0.6, CORNICE, 2 * H - 0.6, DARK, 0, CORNICE / 2, 0);
  square(H, H, 0.4).forEach((path, f) => {
    const len = path.length, mid = len / 2 + (f % 2 ? -0.4 : 0), holes = [];
    // a window a storey from the wings' roofs up, the top ones tall and arched
    for (const [y0, y1] of [[22, 25], [28, 31], [34, 38.5], [41.5, 47.5]]) holes.push(archRing(mid, y1 - y0 > 4 ? 2 : 1.5, y0, y1, 8));
    wall(kit, path, [[0, 0], [len, 0], [len, SHAFT], [0, SHAFT]], { holes, o0: -0.4, o1: 0, hex: PLASTER });
    // the ochre strips at the corners, the string courses, the cornice
    for (const s of [0.6, len - 0.6]) wall(kit, path, [[s - 0.6, 0], [s + 0.6, 0], [s + 0.6, SHAFT], [s - 0.6, SHAFT]], { o0: 0, o1: 0.15, hex: OCHRE });
    for (const y of [20.5, 26.8, 32.8, 40]) sweep(kit, path, 0, len, [[-0.1, y], [0.3, y], [0.3, y + 0.5], [-0.1, y + 0.5]], OCHRE, { step: len });
    sweep(kit, path, 0, len, [[-0.1, SHAFT], [0.5, SHAFT], [0.9, SHAFT + 1.2], [0.9, CORNICE], [-0.1, CORNICE]], OCHRE, { step: len });
    // the clock face under the cornice
    const disc = (r, o, hex) => wall(kit, path, Array.from({ length: 20 }, (_, k) => [mid + r * Math.cos((k / 20) * 2 * Math.PI), 49 + r * Math.sin((k / 20) * 2 * Math.PI)]), { o0: o, o1: o + 0.08, hex });
    disc(1.1, 0, GOLD);
    disc(0.95, 0.08, WHITE);
    wall(kit, path, [[mid - 0.06, 49], [mid + 0.06, 49], [mid + 0.06, 49.8], [mid - 0.06, 49.8]], { o0: 0.16, o1: 0.2, hex: DARK });
  });
  // the balcony round the top: its floor standing out on the cornice and the iron railing
  kit.box(2 * H + 1.8, 0.4, 2 * H + 1.8, OCHRE, 0, CORNICE + 0.2, 0);
  square(H + 0.8).forEach(path => {
    const len = path.length;
    sweep(kit, path, 0, len, [[-0.06, CORNICE + 1.3], [0.06, CORNICE + 1.3], [0.06, CORNICE + 1.4], [-0.06, CORNICE + 1.4]], IRON, { step: len });
    for (let s = 0; s < len; s += 0.6) {
      const p = path.at(s);
      kit.box(0.06, 1, 0.06, IRON, p.x, CORNICE + 0.9, p.z);
    }
  });
  // the octagonal lantern, an arched window in every face, its cornice
  const R = 3.1 / Math.cos(Math.PI / 8); // the map's octagon, 3.1 m from the middle to each face
  kit.add(new THREE.CylinderGeometry(R, R, LANTERN - CORNICE - 0.4, 8).rotateY(Math.PI / 8), PLASTER, 0, (CORNICE + 0.4 + LANTERN) / 2, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, x = Math.cos(a) * 3.16, z = Math.sin(a) * 3.16;
    kit.box(1.1, 3.6, 0.12, DARK, x, CORNICE + 4, z, 0, -a + Math.PI / 2);
    kit.box(0.7, 0.4, 0.12, DARK, x, CORNICE + 6, z, 0, -a + Math.PI / 2);
    kit.box(0.5, LANTERN - CORNICE - 0.4, 0.3, OCHRE, Math.cos(a + Math.PI / 8) * R, (CORNICE + 0.4 + LANTERN) / 2, Math.sin(a + Math.PI / 8) * R, 0, -a - Math.PI / 8 + Math.PI / 2);
  }
  kit.add(new THREE.CylinderGeometry(R + 0.45, R + 0.1, 0.7, 8).rotateY(Math.PI / 8), OCHRE, 0, LANTERN - 0.35, 0);
  // the bell-shaped roof of copper, its little lantern and the cap
  const bell = [[R + 0.3, 0], [R + 0.1, 0.8], [R - 0.6, 1.8], [R - 1.6, 2.7], [1.6, 3.4], [1.1, 4.2], [0.8, 5]].map(([r, y]) => new THREE.Vector2(r, y));
  kit.add(new THREE.LatheGeometry(bell, 8).rotateY(Math.PI / 8), COPPER, 0, LANTERN, 0);
  kit.add(new THREE.CylinderGeometry(0.8, 0.8, 1.2, 8).rotateY(Math.PI / 8), PLASTER, 0, DOME + 0.6, 0);
  kit.add(new THREE.ConeGeometry(1.05, 0.8, 8).rotateY(Math.PI / 8), COPPER, 0, DOME + 1.6, 0);
  // Atlas, bent under the sphere on his shoulders
  const y = DOME + 2;
  kit.box(1.2, 0.5, 1.2, LEAD, 0, y + 0.25, 0);
  for (const s of [-0.28, 0.28]) kit.rod([s, y + 0.5, 0.1], [s * 0.8, y + 1.5, -0.1], 0.2, LEAD);
  kit.rod([0, y + 1.4, -0.1], [0, y + 2.6, 0.15], 0.36, LEAD);
  kit.add(new THREE.SphereGeometry(0.24, 8, 6), LEAD, 0, y + 2.7, 0.45);
  for (const s of [-1, 1]) kit.rod([s * 0.35, y + 2.5, 0.1], [s * 0.6, y + 3.2, 0], 0.13, LEAD);
  kit.add(new THREE.SphereGeometry(0.95, 14, 10), LEAD, 0, y + 3.9, 0);
  kit.add(new THREE.TorusGeometry(0.97, 0.05, 4, 24), GOLD, 0, y + 3.9, 0, Math.PI / 2 - 0.4);
  kit.add(new THREE.TorusGeometry(0.97, 0.05, 4, 24), GOLD, 0, y + 3.9, 0, 0, 0.6);
  return kit.mesh(kitMat(0.85));
}

export const KLEMENTINUM = [{
  id: 'klementinum', name: 'Klementinum', x: X, z: Z, turn: TURN, reach: 220,
  area: [onMap(X, Z, TURN, rect(-H - 0.4, -H - 0.4, H + 0.4, H + 0.4))],
  foot: [onMap(X, Z, TURN, rect(-H, -H, H, H))],
  make: klementinum,
}];
