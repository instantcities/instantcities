// The Loggia dei Lanzi (1376-82) on Piazza della Signoria, modelled by hand in place of the map's
// block of it, from its measurements and photos, in game metres (the real ones times 1.25), on the
// map's outline: 49 m along the piazza and 17 m deep. All of pietra forte:
//   three wide round arches to the piazza and one at each end, on compound piers with Corinthian
//     half-columns, raised on a floor of five steps along the front
//   the quatrefoils of the four Virtues, on blue, over the front piers
//   the entablature on its brackets, and the balustrade of the Uffizi's roof terrace round the top
//   under the arches Cellini's bronze Perseus on the left, Giambologna's Rape of the Sabines on the
//     right, Hercules and Nessus at the back, and the two Medici lions at the top of the steps
// It stands raised on its steps, so riders bump into the whole of it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, column, archRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 221.3, Z = 207.9, TURN = -0.397; // its middle, and its front turned from east
const L = 49, D = 17.3, T = 2.6; // its length, its depth, how thick its piers are
const FLOOR = 1.4, SPRING = 13.6, CROWN = 19.4, TOP = 25.6; // the floor, the arches, the entablature's top
const PIER = 4.2; // how wide the piers are along the front
const STONE = '#c2ab84', DARK = '#a8916c', MARBLE = '#e8e3d8', BRONZE = '#5a5640';

// a figure on its pedestal at (x, z): a draped body and a head, as plain shapes
function statue(kit, x, z, h, hex, base = STONE, ph = 2.4) {
  kit.box(1.8, ph, 1.8, base, x, FLOOR + ph / 2, z).box(2.1, 0.25, 2.1, shade(base, 0.08), x, FLOOR + ph, z);
  const y = FLOOR + ph;
  kit.add(new THREE.CylinderGeometry(0.42, 0.62, h * 0.78, 8), hex, x, y + h * 0.39, z);
  kit.add(new THREE.SphereGeometry(h * 0.09, 8, 6), hex, x, y + h * 0.86, z);
  kit.add(new THREE.CylinderGeometry(0.12, 0.12, h * 0.5, 5), hex, x + 0.5, y + h * 0.8, z, 0, 0, -0.6); // an arm raised
}

export function loggia() {
  const kit = new Kit();
  // the four sides, each running so its outside is to its right (o > 0): the front along the
  // piazza (local -z), the right end, the back, the left end
  const sides = [
    { path: linePath(-L / 2, -D / 2, L / 2, -D / 2), arches: 3 },
    { path: linePath(L / 2, -D / 2 + T, L / 2, D / 2 - T), arches: 1, inset: T },
    { path: linePath(L / 2, D / 2, -L / 2, D / 2), arches: 0 },
    { path: linePath(-L / 2, D / 2 - T, -L / 2, -D / 2 + T), arches: 1, inset: T },
  ];
  for (const { path, arches, inset = 0 } of sides) {
    const len = path.length, pier = inset ? PIER - T : PIER;
    const bay = (len - 2 * pier - (arches - 1) * PIER) / Math.max(1, arches);
    const centres = Array.from({ length: arches }, (_, k) => pier + bay / 2 + k * (bay + PIER));
    const holes = centres.map(c => archRing(c, bay, FLOOR, CROWN, 14));
    wall(kit, path, [[0, 0], [len, 0], [len, TOP - 3.2], [0, TOP - 3.2]], { holes, o0: -T, o1: 0, hex: STONE });
    // the half-columns on the piers, on the face and on the arches' jambs
    const piers = [-inset + PIER / 2, ...centres.slice(0, -1).map(c => c + bay / 2 + PIER / 2), len + inset - PIER / 2];
    if (arches) {
      for (const s of piers) column(kit, path, s, 0.35, FLOOR, SPRING, 0.62, DARK, 'corinthian');
      for (const c of centres) for (const k of [-1, 1]) column(kit, path, c + k * (bay / 2 + 0.3), -T / 2, FLOOR, SPRING, 0.45, DARK, 'corinthian');
      // the archivolts round the arches
      for (const c of centres) {
        const out = archRing(c, bay + 1.6, SPRING, CROWN + 0.8, 14).slice(2), inn = archRing(c, bay, SPRING, CROWN, 14).slice(2);
        wall(kit, path, [...out, ...inn.reverse()], { o0: 0, o1: 0.3, hex: DARK });
      }
    } else {
      // the back: blind arches in the wall
      for (let k = 0; k < 3; k++) {
        const c = (len / 3) * (k + 0.5), w = len / 3 - PIER;
        wall(kit, path, archRing(c, w, FLOOR, CROWN, 14), { o0: -T - 0.05, o1: -T + 0.25, hex: shade(STONE, -0.1) });
      }
    }
    // the quatrefoils of the Virtues over the front's piers
    if (arches === 3) {
      for (const s of piers) {
        const r = 1.6, c = [s, CROWN + 0.9], lobes = [];
        for (let k = 0; k < 48; k++) {
          const a = (k / 48) * 2 * Math.PI, rr = r * (0.72 + 0.28 * Math.abs(Math.cos(2 * a)));
          lobes.push([c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a)]);
        }
        wall(kit, path, lobes.reverse(), { o0: 0, o1: 0.2, hex: '#4f6a94' });
        wall(kit, path, [[s - 0.3, c[1] - 1], [s + 0.3, c[1] - 1], [s + 0.3, c[1] + 0.8], [s - 0.3, c[1] + 0.8]], { o0: 0, o1: 0.32, hex: MARBLE });
      }
    }
  }
  // the entablature on its brackets, the cornice, and the balustrade round the roof terrace
  kit.box(L + 0.6, 3.2, D + 0.6, STONE, 0, TOP - 1.6, 0);
  kit.box(L + 1.6, 0.6, D + 1.6, shade(STONE, 0.08), 0, TOP + 0.3, 0);
  for (let u = -L / 2 + 1; u <= L / 2 - 1 + 1e-6; u += (L - 2) / 24) for (const z of [-1, 1]) kit.box(0.5, 0.7, 0.9, DARK, u, TOP - 0.3, z * (D / 2 + 0.45));
  for (let v = -D / 2 + 1; v <= D / 2 - 1 + 1e-6; v += (D - 2) / 8) for (const x of [-1, 1]) kit.box(0.9, 0.7, 0.5, DARK, x * (L / 2 + 0.45), TOP - 0.3, v);
  const bal = (w, d, x, z, along) => {
    kit.box(along ? w : 0.5, 0.3, along ? 0.5 : d, STONE, x, TOP + 0.75, z).box(along ? w : 0.55, 0.25, along ? 0.55 : d, shade(STONE, 0.08), x, TOP + 1.95, z);
    const n = Math.round((along ? w : d) / 0.55);
    for (let k = 0; k < n; k++) {
      const t = -0.5 + (k + 0.5) / n;
      kit.add(new THREE.CylinderGeometry(0.14, 0.2, 0.95, 6), STONE, along ? x + t * w : x, TOP + 1.35, along ? z : z + t * d);
    }
  };
  bal(L, 0, 0, -D / 2 - 0.3, true); bal(L, 0, 0, D / 2 + 0.3, true); bal(0, D, -L / 2 - 0.3, 0, false); bal(0, D, L / 2 + 0.3, 0, false);
  // the ceiling of its cross vaults, the floor and the steps up to it along the front
  kit.box(L - 2 * T, 1.2, D - 2 * T, shade(STONE, -0.15), 0, CROWN + 1.4, 0);
  kit.box(L, FLOOR, D, shade(STONE, -0.05), 0, FLOOR / 2, 0);
  for (let k = 0; k < 4; k++) kit.box(L - 2 * PIER + 2, FLOOR * (k + 1) / 5, 0.45, shade(STONE, 0.05), 0, FLOOR * (k + 1) / 10, -D / 2 - 0.45 * (4 - k) + 0.2);
  // the sculptures under the arches, and the lions at the top of the steps
  const bay = (L - 4 * PIER) / 3, front = -D / 2 + T + 1.6;
  statue(kit, bay + PIER, front, 5.5, BRONZE, MARBLE, 2.9); // Perseus with Medusa's head, on the side of the Uffizi
  statue(kit, -(bay + PIER), front, 5.4, MARBLE, MARBLE, 2.4); // the Rape of the Sabines
  statue(kit, -bay * 0.6, D / 2 - T - 1.8, 3.6, MARBLE, MARBLE, 1.6); // Hercules and Nessus
  for (const k of [-1, 1]) {
    const x = k * (bay / 2 + PIER / 2), z = -D / 2 - 1;
    kit.box(1.4, FLOOR + 1.5, 3, MARBLE, x, (FLOOR + 1.5) / 2, z);
    kit.box(1.1, 1.3, 2.4, '#ddd6c8', x, FLOOR + 2.1, z + 0.1).box(1, 1.2, 0.9, '#ddd6c8', x, FLOOR + 2.6, z - 1.1);
  }
  return kit.mesh(kitMat(0.9));
}

// it stands in for the map's block (area), and the bit of the piazza's footway drawn on its floor goes (paths)
const AREA = onMap(X, Z, TURN, rect(-L / 2 - 1, -D / 2 - 3, L / 2 + 1, D / 2 + 1));
export const LOGGIA = [{
  id: 'loggia-dei-lanzi', name: 'Loggia dei Lanzi', x: X, z: Z, turn: TURN, reach: 80, area: [AREA], paths: [AREA],
  foot: [onMap(X, Z, TURN, rect(-L / 2, -D / 2 - 1.6, L / 2, D / 2))],
  make: loggia,
}];
