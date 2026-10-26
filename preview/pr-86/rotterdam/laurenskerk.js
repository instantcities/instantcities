// The Grote of Sint-Laurenskerk (1449-1525), the one building of the medieval city that stood up out of
// the fire of 14 May 1940, burnt out, and was rebuilt by 1968. Modelled by hand in place of the map's
// flat block of it, in game metres (the real ones times 1.25), on the map's outline:
//   the west tower, 64.5 m, of pale stone on its buttresses, its tall belfry openings, the
//     balustrade round its top and the low stone cap of 1650
//   the nave under its steep roof, its clerestory over the aisles' roofs, the tall pointed windows of
//     the aisles between their buttresses
//   the transept with a great window in each end gable, and the choir with its apse, the
//     ambulatory round it lower down
// Riders bump into it. The model's own metres: u along the nave from the tower (west) to the choir
// (east), v across it, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, square, wall, pointedRing, gable, onMap, rect } from '../core/js/arcade.js';

const X = 31.1, Z = -295.9, TURN = 0.266;
const TOWER = { u: -48.5, h: 10.5, body: 60, top: 74, cap: 81 };
const NAVE = { u0: -38, u1: 42, hv: 11, eaves: 30, ridge: 47 }, AISLE = { hv: 26, eaves: 16, top: 25 };
const TRANSEPT = { u0: -6, u1: 16, hv: 33 };
const STONE = '#cfc3a5', STONE2 = '#b9ad8f', SLATE = '#4a5157', DARK = '#2c2f33';

// windows down a wall from s0 to s1, n of them, pointed, from y0 to y1, w wide, with buttresses between
function bays(kit, p, s0, s1, n, y0, y1, w, butt = 0) {
  const bay = (s1 - s0) / n;
  for (let k = 0; k < n; k++) wall(kit, p, pointedRing(s0 + (k + 0.5) * bay, w, y0, y1, 1, 6), { o0: 0, o1: 0.15, hex: DARK });
  if (butt) for (let k = 0; k <= n; k++) wall(kit, p, [[s0 + k * bay - 0.7, 0], [s0 + k * bay + 0.7, 0], [s0 + k * bay + 0.7, butt], [s0 + k * bay - 0.7, butt + 1.2]], { o0: 0, o1: 1.6, hex: STONE2 });
}

export function laurenskerk() {
  const kit = new Kit(), N = NAVE, A = AISLE, T = TRANSEPT;
  // the aisles, the nave over them, the transept, each with its windows
  kit.box(N.u1 - N.u0, A.eaves, 2 * A.hv, STONE, (N.u0 + N.u1) / 2, A.eaves / 2, 0);
  for (const sv of [-1, 1]) {
    const side = sv < 0 ? linePath(N.u0, -A.hv, N.u1, -A.hv) : linePath(N.u1, A.hv, N.u0, A.hv);
    bays(kit, side, 0, side.length, 10, 3, A.eaves - 2.5, 3.6, A.eaves - 1);
    // the aisle's roof, leaning against the nave
    const slope = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([
      N.u0, A.eaves, sv * A.hv, N.u1, A.eaves, sv * A.hv, N.u1, A.top, sv * N.hv, N.u0, A.eaves, sv * A.hv, N.u1, A.top, sv * N.hv, N.u0, A.top, sv * N.hv], 3));
    kit.add(slope, SLATE);
  }
  kit.box(N.u1 - N.u0, N.eaves, 2 * N.hv, STONE, (N.u0 + N.u1) / 2, N.eaves / 2, 0);
  for (const sv of [-1, 1]) {
    const side = sv < 0 ? linePath(N.u0, -N.hv, N.u1, -N.hv) : linePath(N.u1, N.hv, N.u0, N.hv);
    bays(kit, side, 0, side.length, 10, A.top + 0.5, N.eaves - 1.2, 3);
  }
  gable(kit, N.u0, N.u1, N.hv + 0.6, N.eaves, N.ridge, SLATE);
  kit.box(T.u1 - T.u0, N.eaves, 2 * T.hv, STONE, (T.u0 + T.u1) / 2, N.eaves / 2, 0);
  gable(kit, -T.hv, T.hv, (T.u1 - T.u0) / 2 + 0.6, N.eaves, N.ridge, SLATE, { x: (T.u0 + T.u1) / 2, turn: Math.PI / 2 });
  for (const sv of [-1, 1]) {
    const end = sv < 0 ? linePath(T.u0, -T.hv, T.u1, -T.hv) : linePath(T.u1, T.hv, T.u0, T.hv);
    const L = end.length;
    wall(kit, end, pointedRing(L / 2, 9, 6, 27, 1, 8), { o0: 0, o1: 0.15, hex: DARK });
    // the gable's stone end over it, and its buttresses
    wall(kit, end, [[0, N.eaves], [L, N.eaves], [L / 2, N.ridge]], { o0: -0.3, o1: 0.3, hex: STONE });
    for (const s of [0.8, L - 0.8]) wall(kit, end, [[s - 1, 0], [s + 1, 0], [s + 1, N.eaves + 2], [s - 1, N.eaves + 2]], { o0: 0, o1: 2, hex: STONE2 });
  }
  // the choir's apse and the lower ambulatory round it
  kit.add(new THREE.CylinderGeometry(18, 18, A.eaves, 8, 1, false, 0, Math.PI), STONE, N.u1, A.eaves / 2, 0);
  kit.add(new THREE.ConeGeometry(18.6, 22, 8, 1, false, 0, Math.PI), SLATE, N.u1, A.eaves + 11, 0); // its point hidden in the choir
  kit.add(new THREE.CylinderGeometry(N.hv, N.hv, N.eaves, 8, 1, false, 0, Math.PI), STONE, N.u1, N.eaves / 2, 0);
  kit.add(new THREE.ConeGeometry(N.hv + 0.6, N.ridge - N.eaves, 8, 1, false, 0, Math.PI), SLATE, N.u1, (N.eaves + N.ridge) / 2, 0);
  for (let k = 0; k < 4; k++) {
    const a = ((k + 0.5) / 4) * Math.PI, r = 18 * Math.cos(Math.PI / 8) + 0.05, rr = N.hv * Math.cos(Math.PI / 8) + 0.05;
    kit.box(3, 9, 0.2, DARK, N.u1 + r * Math.sin(a), 8, r * Math.cos(a), 0, a);
    kit.box(2.4, 4.5, 0.2, DARK, N.u1 + rr * Math.sin(a), A.top + 2.8, rr * Math.cos(a), 0, a);
  }
  // the tower: its body on its stepped corner buttresses, the belfry, the balustrade and the cap
  const { u, h, body, top, cap } = TOWER;
  kit.box(2 * h, body, 2 * h, STONE, u, body / 2, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) for (const [y0, y1, d] of [[0, 22, 2.6], [22, 42, 2], [42, body, 1.4]]) {
    kit.box(d, y1 - y0, d, STONE2, u + sx * (h + d / 2 - 0.5), (y0 + y1) / 2, sz * (h - d / 2)).box(d, y1 - y0, d, STONE2, u + sx * (h - d / 2), (y0 + y1) / 2, sz * (h + d / 2 - 0.5));
  }
  square(h, h).forEach(p => {
    const L = p.length;
    const at = linePath(p.at(0).x + u, p.at(0).z, p.at(L).x + u, p.at(L).z);
    for (const [y0, y1] of [[24, 36], [42, 56]]) for (const s of [L * 0.33, L * 0.67]) wall(kit, at, pointedRing(s, 2.8, y0, y1, 1, 6), { o0: 0, o1: 0.15, hex: y0 > 40 ? DARK : STONE2 });
    for (const y of [22, 42]) wall(kit, at, [[0, y], [L, y], [L, y + 0.9], [0, y + 0.9]], { o0: 0, o1: 0.5, hex: STONE2 });
    wall(kit, at, pointedRing(L / 2, 5, 4, 18, 1, 8), { o0: 0, o1: 0.15, hex: DARK });
  });
  // the belfry stage, set in, its openings, and over it the balustrade and the cap
  kit.box(2 * h - 3, top - body, 2 * h - 3, STONE, u, (body + top) / 2, 0);
  square(h - 1.5, h - 1.5).forEach(p => {
    const L = p.length, at = linePath(p.at(0).x + u, p.at(0).z, p.at(L).x + u, p.at(L).z);
    for (const s of [L * 0.3, L * 0.7]) wall(kit, at, pointedRing(s, 3.2, body + 2, top - 2.5, 1, 6), { o0: 0, o1: 0.15, hex: DARK });
  });
  kit.box(2 * h + 0.6, 1.2, 2 * h + 0.6, STONE2, u, body + 0.6, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.box(1.4, 4, 1.4, STONE2, u + sx * (h - 0.4), body + 2.8, sz * (h - 0.4)).add(new THREE.ConeGeometry(0.9, 2.4, 4), STONE2, u + sx * (h - 0.4), body + 6, sz * (h - 0.4), 0, Math.PI / 4);
  kit.box(2 * h - 2.2, 1, 2 * h - 2.2, STONE2, u, top + 0.5, 0);
  kit.frustum(2 * h - 4, 2 * h - 4, 3, 3, cap - top - 2, STONE2, u, top + 1, 0);
  kit.box(3, 1.6, 3, STONE, u, cap - 0.6, 0).rod([u, cap + 0.2, 0], [u, cap + 3, 0], 0.12, '#b89a4a', 4);
  return kit.mesh(kitMat(0.85));
}

export const LAURENSKERK = [{
  id: 'laurenskerk', name: 'Laurenskerk', x: X, z: Z, turn: TURN, reach: 140,
  area: [onMap(X, Z, TURN, rect(-62, -29, 62, 38))], // (not the low annex along its south side)
  foot: [
    rect(TOWER.u - TOWER.h - 1, -TOWER.h - 1, TOWER.u + TOWER.h, TOWER.h + 1),
    rect(NAVE.u0, -AISLE.hv - 1, NAVE.u1, AISLE.hv + 1),
    rect(TRANSEPT.u0 - 2, -TRANSEPT.hv - 2, TRANSEPT.u1 + 2, TRANSEPT.hv + 2),
    [[NAVE.u1, -18], [NAVE.u1 + 12.7, -12.7], [NAVE.u1 + 18, 0], [NAVE.u1 + 12.7, 12.7], [NAVE.u1, 18]],
  ].map(r => onMap(X, Z, TURN, r)),
  make: laurenskerk,
}];
