// The Loggia del Mercato Nuovo (Giovanni Battista del Tasso, 1547-51) and Il Porcellino on its
// south side, modelled by hand in place of the map's solid block of the loggia, from their
// measurements and photos, in game metres (the real ones times 1.25), on the map's outline:
// 29 m by 39 m, open on all four sides, the market stalls under it.
//   the arcade, three bays by four, on piers with Corinthian half-columns, and the niches with
//     statues at its corners; the free columns inside holding up its vaults; its hipped tile roof
//   the bronze boar (Pietro Tacca's, 1633; a copy), sitting on his base over his little basin, his
//     snout rubbed bright by everyone who wants to come back to Florence
// Riders ride in under it, between its piers and columns.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, wall, column, archRing, onMap, rect } from '../core/js/arcade.js';

const X = 89, Z = 93.1, TURN = -0.069; // its middle, and its short side turned from east (local +z is south)
const HX = 14.5, HZ = 19.5, CROWN = 11.2, ENT = 14.4, RIDGE = 19.5;
const STONE = '#b8a789', STONE2 = '#a69576', TILE = '#b0603f', BRONZE = '#4f4a36', SHINE = '#c9a45a';
const BAYS = [3, 4, 3, 4]; // along each side, from the front (-z) round by +x

export function porcellino() {
  const kit = new Kit();
  square(HX, HZ, 1.6).forEach((path, f) => {
    const len = path.length, n = BAYS[f], inset = f % 2 ? 1.6 : 0, full = len + 2 * inset, bay = full / n;
    const holes = Array.from({ length: n }, (_, k) => archRing(-inset + (k + 0.5) * bay, bay - 2.2, 0, CROWN, 10));
    wall(kit, path, [[0, 0], [len, 0], [len, ENT - 1.8], [0, ENT - 1.8]], { holes, o0: -1.6, o1: 0, hex: STONE });
    for (let k = 0; k <= n; k++) {
      const s = -inset + k * bay;
      if (s > 0.5 && s < len - 0.5) column(kit, path, s, 0.2, 0, ENT - 1.8, 0.5, STONE2, 'corinthian');
    }
    // the niches with statues at the corner piers
    for (const s of [0.35 * bay - inset, len + inset - 0.35 * bay]) if (f % 2 === 0) {
      wall(kit, path, archRing(s, 0.9, 2, 5.2, 6), { o0: 0, o1: 0.05, hex: '#4b4236' });
    }
  });
  // the entablature, the cornice, the hipped roof
  kit.box(2 * HX + 0.6, 1.8, 2 * HZ + 0.6, STONE, 0, ENT - 0.9, 0).box(2 * HX + 1.4, 0.4, 2 * HZ + 1.4, STONE2, 0, ENT + 0.2, 0);
  const roof = new THREE.ConeGeometry(1, RIDGE - ENT - 0.4, 4).rotateY(Math.PI / 4);
  roof.scale((2 * HX + 1.4) / Math.SQRT2, 1, (2 * HZ + 1.4) / Math.SQRT2);
  kit.add(roof, TILE, 0, (ENT + 0.4 + RIDGE) / 2, 0);
  kit.box(2 * HX - 3, 0.6, 2 * HZ - 3, STONE2, 0, CROWN + 0.6, 0); // the vaults' underside
  // the free columns inside
  for (const [x, z] of layout().inner) {
    kit.add(new THREE.CylinderGeometry(0.45, 0.5, CROWN + 0.3, 10), STONE2, x, (CROWN + 0.3) / 2, z);
    kit.box(1.3, 0.5, 1.3, STONE, x, CROWN + 0.3, z);
  }
  // the boar on his base over his basin, outside the middle of the south side
  const bz = HZ + 1.7;
  kit.box(2.6, 0.7, 1.6, STONE, 0, 0.35, bz).box(2, 1.3, 1.1, STONE2, 0, 1.35, bz - 0.15);
  kit.box(2.2, 0.1, 1.2, '#93c8d2', 0, 0.75, bz + 0.1);
  const y = 2;
  kit.add(new THREE.SphereGeometry(1, 10, 8).scale(1.1, 0.75, 0.6), BRONZE, -0.2, y + 0.6, bz - 0.2);
  kit.box(0.7, 0.55, 0.5, BRONZE, 0.85, y + 0.75, bz - 0.15, 0, 0, -0.3);
  kit.box(0.35, 0.3, 0.3, SHINE, 1.25, y + 0.62, bz - 0.15); // the snout, rubbed bright
  for (const [x, z] of [[0.55, -0.4], [0.55, 0.15], [-0.75, -0.4], [-0.75, 0.15]]) kit.box(0.2, 0.6, 0.2, BRONZE, x, y + 0.1, bz + z - 0.15);
  return kit.mesh(kitMat(0.85, 0.05));
}

// where its piers stand round the sides, and its free columns inside, in its own metres
function layout() {
  const piers = [], inner = [];
  square(HX, HZ, 1.6).forEach((path, f) => {
    const len = path.length, inset = f % 2 ? 1.6 : 0, bay = (len + 2 * inset) / BAYS[f];
    for (let k = 0; k <= BAYS[f]; k++) {
      const p = path.at(Math.min(len, Math.max(0, -inset + k * bay)));
      piers.push([p.x, p.z]);
    }
  });
  for (const x of [-HX / 3, HX / 3]) for (const z of [-HZ / 2, 0, HZ / 2]) inner.push([x, z]);
  return { piers, inner };
}

// riders bump into its piers, its columns and the boar's base, and ride in under it
const { piers: PIERS, inner: INNER } = layout();
export const PORCELLINO = [{
  id: 'porcellino', name: 'Il Porcellino', x: X, z: Z, turn: TURN, reach: 90,
  area: [onMap(X, Z, TURN, rect(-HX - 1, -HZ - 1, HX + 1, HZ + 1))],
  foot: [
    ...PIERS.map(([x, z]) => onMap(X, Z, TURN, rect(x - 1.1, z - 1.1, x + 1.1, z + 1.1))),
    ...INNER.map(([x, z]) => onMap(X, Z, TURN, rect(x - 0.5, z - 0.5, x + 0.5, z + 0.5))),
    onMap(X, Z, TURN, rect(-1.3, HZ + 0.9, 1.3, HZ + 2.5)),
  ],
  make: porcellino,
}];
