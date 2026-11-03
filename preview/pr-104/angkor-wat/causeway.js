// The way in to Angkor Wat: the outer gopura at the west end of the causeway (Kok Ta Reach), a long
// gallery on a platform with the way through it in the middle and a tower on each wing and over
// the way, and the balustrades along the causeway that crosses the moat to it and runs on 350 m from it to the
// temple, which keep riders off the water. Modelled by hand in real metres (scaled to game metres,
// 1.25, at the end).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, gable, onMap, rect } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';
import { S, game } from './frame.js';

const STONE = ['#8f8271', '#867a69', '#978a77', '#7e7364'], DARK = '#2f2a24';
const HALF = 117, W = 19; // the gopura: half its length (along z) and half its thickness (along x)
const PASS = 6; // half the way through its middle
const C = [-565, -3]; // its middle in OpenStreetMap's metres, east and south of the map's origin
const [GX, GZ] = game(...C);

function tower(kit, x, z, y0, y1, w, hex) {
  let y = y0, ww = w;
  const step = (y1 - y0) * 0.62 / 4;
  for (let k = 0; k < 4; k++) {
    kit.box(ww, step * 0.6, ww, shade(hex, k % 2 ? -0.05 : 0.02), x, y + step * 0.3, z);
    kit.frustum(ww * 0.96, ww * 0.96, ww * 0.8, ww * 0.8, step * 0.4, shade(hex, -0.08), x, y + step * 0.6, z);
    for (const [dx, dz, ry] of [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]]) kit.box(ww * 0.28, step * 0.4, 0.25, DARK, x + (dx * ww) / 2, y + step * 0.26, z + (dz * ww) / 2, 0, ry);
    y += step; ww *= 0.8;
  }
  const bud = y1 - y, r = ww * 0.56, pts = [[0.1, y + bud], [r * 0.2, y + bud * 0.86], [r * 0.52, y + bud * 0.62], [r * 0.86, y + bud * 0.3], [r, y + bud * 0.08], [r * 0.85, y]];
  kit.add(new THREE.LatheGeometry(pts.map(([q, v]) => new THREE.Vector2(q, v)).reverse(), 12), shade(hex, 0.05), x, 0, z);
  kit.add(new THREE.CylinderGeometry(0.08, 0.22, 2.4, 5), shade(hex, 0.15), x, y + bud + 0.8, z);
}

export function gopura() {
  const kit = new Kit(), T = k => STONE[k % STONE.length];
  kit.box(W * 2 + 3, 2.4, HALF * 2 + 3, shade(T(1), -0.05), 0, 1.2, 0);
  // the two wings: a gallery each, windows along both long sides
  for (const sgn of [-1, 1]) {
    const z0 = sgn > 0 ? PASS + 8 : -HALF, z1 = sgn > 0 ? HALF : -PASS - 8;
    kit.box(W * 2 - 4, 8, z1 - z0, shade(T(0), -0.02), 0, 2.4 + 4, (z0 + z1) / 2);
    for (const [ax, az, bx, bz] of [[-W + 2, z1, -W + 2, z0], [W - 2, z0, W - 2, z1]]) {
      const path = linePath(ax, az, bx, bz), L = path.length, holes = [];
      for (let s = 5; s < L - 3; s += 5.2) holes.push([[s - 1, 3.6], [s + 1, 3.6], [s + 1, 8], [s - 1, 8]]);
      wall(kit, path, [[0, 2.4], [L, 2.4], [L, 9.4], [0, 9.4]], { holes, o0: -1, o1: 0.1, hex: T(2), ends: false });
    }
    kit.box(W * 2 - 2, 1.4, z1 - z0 + 1, shade(T(3), -0.04), 0, 2.4 + 8.4, (z0 + z1) / 2);
    kit.box(W * 2 - 8, 1.6, z1 - z0 - 2, shade(T(1), 0.08), 0, 2.4 + 9.8, (z0 + z1) / 2);
    tower(kit, 0, sgn * (HALF - 14), 12.2, 29, 12, T(sgn > 0 ? 1 : 2));
  }
  // the middle: the block over the way, its gabled roof, the passage through it, the tower
  for (const sgn of [-1, 1]) kit.box(W * 2 - 4, 12, 8, T(2), 0, 2.4 + 6, sgn * (PASS + 4));
  kit.box(W * 2 - 4, 2.5, PASS * 2, T(3), 0, 2.4 + 11.25, 0);
  gable(kit, -W + 1, W - 1, PASS + 9, 14.4, 20.4, shade(T(1), -0.08), { x: 0, z: 0, turn: 0 });
  tower(kit, 0, 0, 20, 38, 12, T(0));
  const m = kit.mesh(kitMat(0.95));
  m.scale.setScalar(S);
  return m;
}

// the balustrades: a low stone wall either side of the causeway from the moat's far side past the
// gopura to the temple's terrace, with a post and a stone ball every few metres, and the pavements of the causeway between
export function balustrades() {
  const kit = new Kit(), A = -790, B = -190, L = B - A;
  for (const side of [-1, 1]) {
    kit.box(L, 1.0, 0.9, STONE[2], 0, 0.5, side * 5.7);
    kit.box(L, 0.25, 1.3, shade(STONE[0], 0.1), 0, 1.1, side * 5.7);
    for (let x = -L / 2 + 4; x < L / 2; x += 8) kit.box(1.1, 1.5, 1.1, STONE[1], x, 0.85, side * 5.7);
  }
  const m = kit.mesh(kitMat(0.95));
  m.scale.setScalar(S);
  return m;
}

const at = (x, z, pts) => onMap(...game(x, z), 0, pts.map(([u, v]) => [u * S, v * S]));
const BX = (-790 - 190) / 2, BL = 600;

// The gopura stands in for the map's pieces of it (area); riders bump into its two halves, not the
// way through. The balustrades keep them on the causeway.
export const CAUSEWAY = [
  {
    id: 'gopura', name: 'Kok Ta Reach', x: GX, z: GZ, turn: 0, reach: 700,
    area: [at(...C, rect(-W - 3, -HALF - 3, W + 3, HALF + 3))],
    foot: [at(...C, rect(-W, -HALF, W, -PASS)), at(...C, rect(-W, PASS, W, HALF))],
    make: gopura,
  },
  {
    id: 'balustrades', name: 'Causeway', x: game(BX, -4)[0], z: game(BX, -4)[1], turn: 0, reach: 700,
    area: [], foot: [at(BX, -4, rect(-BL / 2, -6.4, BL / 2, -5.0)), at(BX, -4, rect(-BL / 2, 5.0, BL / 2, 6.4))],
    make: balustrades,
  },
];
