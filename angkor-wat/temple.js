// Angkor Wat (Suryavarman II, early 12th century), modelled by hand in place of the map's stack of
// building parts, on the measurements OpenStreetMap has of its tiers. Built in real metres and
// scaled to game metres (1.25) at the end, round the middle of the third level, its main front
// (and the way in over the causeway) towards -x, the west:
//   the first level: a platform 4 m high, with the outer gallery on it, 210 by 177 m, its roof
//     vaulted in half, windows with balusters all along, an entrance pavilion in the middle of
//     every side with gabled roofs in a cross, a tower on each corner
//   the second level: a platform 11 m up and its gallery, 130 by 100 m, joined to the first by
//     steep flights of steps on every side
//   the third level, 23 m up: the gallery 55 m across with the cross of galleries inside it, the
//     four towers at its corners, 43 m up, and over the middle the central tower, 62 m: lotus buds
//     on tiers that step in, the tallest of them standing on the sanctuary
// The causeway across the moat and the outer gopura at its west end are in causeway.js.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep, gable, onMap, rect } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';
import { S, game } from './frame.js';

const [X, Z] = game(-7.5, 5.5); // the middle of the third level, in the map's metres

const STONE = ['#8f8271', '#867a69', '#978a77', '#7e7364', '#9a8d79'], DARK = '#2f2a24', MOSS = '#6f7258';
const pick = (list, k) => list[Math.floor(rng(Math.abs(Math.round(k * 7919)) + 331)() * list.length) % list.length];

// a plain block, its sides in the stone of its place
const slab = (kit, x0, z0, x1, z1, y0, y1, hex) => kit.box(x1 - x0, y1 - y0, z1 - z0, hex, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);

// A gallery round a rectangle, walls t thick from y0 to y0 + h: each side a wall with a row of
// windows (with a dark room behind) and a vaulted roof, `doors` the middle of each side left bare
// for its entrance pavilion.
function gallery(kit, [x0, z0, x1, z1], y0, h, t, hex, { win = 5.4, gap = 0 } = {}) {
  const sides = [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]];
  sides.forEach(([ax, az, bx, bz], i) => {
    const path = linePath(ax, az, bx, bz), L = path.length, holes = [], mid = L / 2;
    for (let s = win; s < L - win * 0.6; s += win) {
      if (Math.abs(s - mid) < gap) continue;
      holes.push([[s - 1.1, y0 + 1.5], [s + 1.1, y0 + 1.5], [s + 1.1, y0 + h - 1.2], [s - 1.1, y0 + h - 1.2]]);
    }
    const ring = [[0, y0], [L, y0], [L, y0 + h], [0, y0 + h]];
    wall(kit, path, ring, { holes, o0: -1.2, o1: 0, hex: shade(hex, i % 2 ? -0.03 : 0), ends: false });
    wall(kit, path, ring, { o0: -t, o1: -1.2, hex: DARK, ends: false });
    sweep(kit, path, 0, L, [[-t, y0 + h], [0.7, y0 + h], [0.7, y0 + h + 0.7], [-t * 0.3, y0 + h + 2.7], [-t, y0 + h + 0.7]], shade(hex, -0.08), { step: 12 });
    // a band of carving along the foot and under the roof
    sweep(kit, path, 0, L, [[0, y0], [0.5, y0], [0.5, y0 + 0.6], [0, y0 + 0.6]], shade(hex, 0.07), { step: 12 });
  });
}

// a tower of lotus-bud tiers on a square base w wide, from y0 up to y1
function prang(kit, x, z, y0, y1, w, hex) {
  const total = y1 - y0, tiers = 5, body = total * 0.62, bud = total - body;
  let y = y0, ww = w;
  for (let k = 0; k < tiers; k++) {
    const th = (body / tiers) * (k ? 1 : 1.25), next = ww * 0.82;
    kit.box(ww, th * 0.6, ww, shade(hex, k % 2 ? -0.05 : 0.02), x, y + th * 0.3, z);
    kit.frustum(ww * 0.96, ww * 0.96, next, next, th * 0.4, shade(hex, -0.08), x, y + th * 0.6, z);
    kit.box(ww * 1.04, 0.35, ww * 1.04, shade(hex, 0.1), x, y + th * 0.6, z);
    // a false door on every face of the tier, a dark niche
    for (const [dx, dz, ry] of [[0, 1, 0], [0, -1, Math.PI], [1, 0, Math.PI / 2], [-1, 0, -Math.PI / 2]]) {
      kit.box(ww * 0.3, th * 0.42, 0.25, DARK, x + (dx * ww) / 2, y + th * 0.28, z + (dz * ww) / 2, 0, ry);
    }
    y += th; ww = next;
  }
  // the bud: a rounded cone of petals, a ring at its foot and a spire
  const r = ww * 0.56, pts = [[0.1, y + bud], [r * 0.2, y + bud * 0.86], [r * 0.52, y + bud * 0.62], [r * 0.86, y + bud * 0.3], [r, y + bud * 0.08], [r * 0.85, y]];
  kit.add(new THREE.LatheGeometry(pts.map(([q, v]) => new THREE.Vector2(q, v)).reverse(), 14), shade(hex, 0.05), x, 0, z);
  kit.add(new THREE.CylinderGeometry(r * 0.95, r * 1.05, 0.6, 14), shade(hex, 0.12), x, y + 0.2, z);
  kit.add(new THREE.CylinderGeometry(0.08, 0.25, 3, 5), shade(hex, 0.15), x, y + bud + 1, z);
}

export function temple() {
  const kit = new Kit(), r = rng(7);
  const T = (k, tint = 0) => shade(pick(STONE, k), tint);

  // the platforms, each a stone block with a foot and a coping
  const P1 = [-127.5, -108.5, 106.5, 100.5], P2 = [-74.5, -64.5, 67.5, 61.5], P3 = [-43.5, -38.5, 39.5, 38.5];
  slab(kit, ...P1.slice(0, 2), ...P1.slice(2), 0, 4, T(1, -0.05));
  slab(kit, P1[0] - 0.6, P1[1] - 0.6, P1[2] + 0.6, P1[3] + 0.6, 3.5, 4.1, T(2, 0.08));
  slab(kit, ...P2.slice(0, 2), ...P2.slice(2), 4, 11, T(3, -0.04));
  slab(kit, P2[0] - 0.5, P2[1] - 0.5, P2[2] + 0.5, P2[3] + 0.5, 10.6, 11.2, T(2, 0.08));
  slab(kit, ...P3.slice(0, 2), ...P3.slice(2), 11, 23, T(4, -0.03));
  slab(kit, P3[0] - 0.5, P3[1] - 0.5, P3[2] + 0.5, P3[3] + 0.5, 22.6, 23.2, T(2, 0.08));

  // the galleries: the outer one on the first platform, the middle one, the inner one
  const G1 = [-118.5, -89.5, 91.5, 87.5], G2 = [-71.5, -52.5, 58.5, 48.5], G3 = [-27.5, -28.5, 27.5, 27.5];
  gallery(kit, G1, 4, 7, 6, T(0), { gap: 12 });
  gallery(kit, G2, 11, 6.5, 5, T(1), { gap: 10 });
  gallery(kit, G3, 23, 7, 4.5, T(2), { gap: 8, win: 4.6 });

  // the cross of galleries inside the third level, and the sanctuary at its middle
  for (const [x0, z0, x1, z1] of [[-27.5, -2, 27.5, 2], [-2, -28.5, 2, 27.5]]) {
    slab(kit, x0, z0, x1, z1, 23, 30, T(3, 0.03));
    kit.box(x1 - x0 + 0.8, 1, z1 - z0 + 0.8, T(2, 0.1), (x0 + x1) / 2, 30.4, (z0 + z1) / 2);
  }
  slab(kit, -9, -9, 9, 9, 23, 39, T(4));
  slab(kit, -10, -10, 10, 10, 38.4, 39.4, T(2, 0.1));

  // steep flights of steps up the four sides of each platform, at the middle of the sides
  const stairs = (x0, z0, x1, z1, y0, y1, w, out) => {
    // out: 0 west, 1 east, 2 north, 3 south: the side it climbs
    const n = Math.round((y1 - y0) / 0.9), run = 0.55;
    for (let k = 0; k < n; k++) {
      const y = y0 + (k + 0.5) * ((y1 - y0) / n), off = (n - k) * run;
      const [cx, cz] = [[x0 - off - 0.2, (z0 + z1) / 2], [x1 + off + 0.2, (z0 + z1) / 2], [(x0 + x1) / 2, z0 - off - 0.2], [(x0 + x1) / 2, z1 + off + 0.2]][out];
      kit.box(out < 2 ? run * 2 : w, (y1 - y0) / n, out < 2 ? w : run * 2, T(4, 0.04), cx, y, cz);
    }
  };
  for (let o = 0; o < 4; o++) {
    stairs(...P1, 0, 4, 16, o);
    stairs(...P2, 4, 11, 12, o);
    stairs(...P3, 11, 23, 10, o);
  }

  // the entrance pavilions in the middle of the first gallery's sides: gabled halls in a cross,
  // one through the wall and one across it
  const [mx, mz] = [(G1[0] + G1[2]) / 2, (G1[1] + G1[3]) / 2];
  for (const [px, pz, alongX] of [[G1[0] + 3, mz, true], [G1[2] - 3, mz, true], [mx, G1[1] + 3, false], [mx, G1[3] - 3, false]]) {
    const [long, cross, wid] = [26, 22, 11];
    kit.box(alongX ? long : wid, 11, alongX ? wid : long, T(2, 0.02), px, 9.5, pz);
    kit.box(alongX ? wid : cross, 11, alongX ? cross : wid, T(3, 0.02), px, 9.5, pz);
    gable(kit, -long / 2, long / 2, wid / 2, 15, 21, T(1, -0.08), { x: px, z: pz, turn: alongX ? 0 : Math.PI / 2 });
    gable(kit, -cross / 2, cross / 2, wid / 2, 15, 21, T(1, -0.08), { x: px, z: pz, turn: alongX ? Math.PI / 2 : 0 });
  }
  // the corner pavilions of the first gallery and the second
  for (const [x, z] of [[G1[0] + 3, G1[1] + 3], [G1[2] - 3, G1[1] + 3], [G1[0] + 3, G1[3] - 3], [G1[2] - 3, G1[3] - 3]]) prang(kit, x, z, 14, 29, 10, T(0));
  for (const [x, z] of [[G2[0] + 2.5, G2[1] + 2.5], [G2[2] - 2.5, G2[1] + 2.5], [G2[0] + 2.5, G2[3] - 2.5], [G2[2] - 2.5, G2[3] - 2.5]]) prang(kit, x, z, 17.5, 28, 7, T(1));

  // the five towers on the third level: four at the corners, the tallest over the sanctuary
  for (const [x, z] of [[-24.5, -24], [24.5, -24], [-24.5, 24], [24.5, 24]]) prang(kit, x, z, 30, 43.5, 13, T(2));
  prang(kit, 0, 0, 39.4, 62.5, 15, T(0, 0.04));

  // here and there a patch of moss on the steps and the galleries' feet
  for (let k = 0; k < 40; k++) kit.box(2 + 4 * r(), 0.1, 1 + 2 * r(), MOSS, P1[0] + (P1[2] - P1[0]) * r(), 4.15, P1[1] + (P1[3] - P1[1]) * r());

  const m = kit.mesh(kitMat(0.95));
  m.scale.setScalar(S);
  return m;
}

const ring = pts => onMap(X, Z, 0, pts.map(([u, v]) => [u * S, v * S]));

// It stands in for the map's pieces of the temple (area); riders bump into the platform (foot).
export const TEMPLE = [{
  id: 'angkor-wat', name: 'Angkor Wat', x: X, z: Z, turn: 0, reach: 900,
  area: [ring(rect(-132, -112, 112, 104))],
  foot: [ring(rect(-127.5, -108.5, 106.5, 100.5))],
  make: temple,
}];
