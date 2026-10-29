// The Area Sacra of Largo di Torre Argentina: the four temples of the Republic dug out below the
// square in the 1920s, modelled by hand on their outlines (OpenStreetMap's, as the map has only a
// few columns of them), in game metres (the real ones times 1.25). The square is flat in the game,
// so the dig is not sunk: the temples stand on its floor at street level, inside the railing round
// its edge. From north to south, all facing east:
//   Temple A (3rd century BC), its peristyle of tufa columns standing along its north side and its
//     front, stumps on the south, and on its podium the two apses of the church of San Nicola
//   Temple B, the round one (101 BC), its six columns on the west side of its podium, its steps
//   Temple C, the oldest (about 300 BC), its high podium of tufa and the stumps of its cella's walls
//   Temple D, the largest, only the north edge of its podium out from under Via Florida
//   and behind B the platform of tufa where the Curia of Pompey stood, where Caesar was killed
// Riders bump into the podiums and the railing, which has two ways in.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';

const X = -160, Z = 480; // the middle of the dig, its sides the city's (no turn)
const TUFF = '#a59c8a', TUFF2 = '#958b78', TRAV = '#d5c9ad', BRICK = '#a3765c', IRON = '#3b3a36';
const at = (x, z) => [x - X, z - Z];
const A = [[-179.8, 430.7], [-144.9, 427.9], [-143.3, 449.2], [-178.2, 451.9]].map(p => at(...p)); // NW, NE, SE, SW
const B = { c: at(-161, 479), r: 11.4 };
const C = [[-181.1, 501], [-153.3, 498.6], [-151.6, 517.9], [-179.4, 520.4]].map(p => at(...p));
const D = [[-192.6, 530.1], [-141.6, 526.1], [-141.3, 534.3], [-192.3, 534.3]].map(p => at(...p));
const POMPEY = [[-191.6, 470.3], [-183, 470.3], [-183, 500.4], [-191.6, 500.4]].map(p => at(...p));
// the dig's edge (the map's square round it), with the two ways in left open in its railing
const EDGE = [[-117.3, 503.2], [-124.8, 503.7], [-123.6, 520.5], [-130.7, 521.2], [-130.8, 534.5], [-163.8, 534.6], [-186.1, 534.5], [-189, 528.3], [-189.3, 512.4],
  [-191.7, 507.8], [-191.2, 470.3], [-190.7, 425.7], [-187.3, 419.1], [-183, 417.6], [-141.6, 415.7], [-129, 415.8], [-124.6, 419.5], [-121.3, 457.7], [-120.1, 471.5], [-117.3, 503.2]].map(p => at(...p));
const GAPS = [[1, 2], [15, 16]]; // the stretches left open: one on the east side, one on the north

// a point of a four-cornered outline [NW, NE, SE, SW]: a from west to east, b from north to south
const quad = (q, a, b) => [0, 1].map(i => (1 - b) * ((1 - a) * q[0][i] + a * q[1][i]) + b * ((1 - a) * q[3][i] + a * q[2][i]));
// a flat outline [[x, z], ...] stood up from y0 to y1
function block(kit, pts, y0, y1, hex) {
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  return kit.add(new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false }).rotateX(-Math.PI / 2), hex, 0, y0, 0);
}
// a column of tufa coated in stucco, from y0, h high (a stump when short), its capital only when whole
function column(kit, x, z, y0, h, r, whole) {
  kit.add(new THREE.CylinderGeometry(r * 1.25, r * 1.35, 0.5, 10), TRAV, x, y0 + 0.25, z);
  kit.add(new THREE.CylinderGeometry(r * 0.88, r, h - (whole ? 1.6 : 0.5), 10), shade(TUFF, -0.04), x, y0 + 0.5 + (h - (whole ? 1.6 : 0.5)) / 2, z);
  if (whole) {
    kit.add(new THREE.CylinderGeometry(r * 1.35, r * 0.9, 0.8, 10), TRAV, x, y0 + h - 0.7, z);
    kit.box(r * 2.7, 0.3, r * 2.7, TRAV, x, y0 + h - 0.15, z);
  }
}

export function argentina() {
  const kit = new Kit(), r = rng(19);
  // Temple A: its podium, the peristyle (six by nine), the apses of San Nicola on the back of it
  block(kit, A, 0, 2.4, TUFF2);
  const ia = 1.6 / 35, ib = 1.6 / 21;
  const spot = (a, b) => quad(A, a, b);
  for (let k = 0; k < 9; k++) {
    const a = ia + ((1 - 2 * ia) * k) / 8;
    const [xn, zn] = spot(a, ib), [xs, zs] = spot(a, 1 - ib);
    column(kit, xn, zn, 2.4, k < 2 ? 4 + r() * 3 : 11.5, 0.62, k >= 2);
    column(kit, xs, zs, 2.4, 0.8 + r() * 2.2, 0.62, false);
  }
  for (let k = 1; k < 5; k++) {
    const [x, z] = spot(1 - ia, ib + ((1 - 2 * ib) * k) / 5);
    column(kit, x, z, 2.4, k < 3 ? 11.5 : 1.5 + r() * 2, 0.62, k < 3);
  }
  for (const [cx, cz, rad] of [[-175, 439, 4.4], [-174.4, 447.8, 2.9]]) {
    const [x, z] = at(cx, cz);
    kit.add(new THREE.CylinderGeometry(rad, rad, 7.5, 16, 1, false, Math.PI, Math.PI), BRICK, x, 2.4 + 3.75, z);
    kit.add(new THREE.SphereGeometry(rad, 12, 6, -Math.PI / 2, Math.PI, 0, Math.PI / 2), shade(BRICK, -0.08), x, 9.9, z);
  }
  // Temple B: the round podium, its steps to the east, the six columns, the stump of its cella's wall
  kit.add(new THREE.CylinderGeometry(B.r, B.r, 2.6, 32), TUFF2, B.c[0], 1.3, B.c[1]);
  for (let k = 0; k < 6; k++) kit.box(3 - k * 0.4, 0.43 * (k + 1), 10, TRAV, B.c[0] + B.r + 3.6 - k * 0.5, 0.215 * (k + 1), B.c[1]);
  for (let k = 0; k < 6; k++) {
    const a = 1.76 + k * 0.396;
    column(kit, B.c[0] + 9.3 * Math.cos(a), B.c[1] + 9.3 * Math.sin(a), 2.6, 10.5, 0.62, true);
  }
  for (let k = 0; k < 18; k++) {
    if (k > 4 && k < 13) continue;
    const a = 1.76 + 1.98 + k * 0.349;
    column(kit, B.c[0] + 9.3 * Math.cos(a), B.c[1] + 9.3 * Math.sin(a), 2.6, 0.6 + r() * 1.6, 0.62, false);
  }
  kit.add(new THREE.CylinderGeometry(7.2, 7.4, 2.2, 28, 1, true), shade(TUFF, -0.1), B.c[0], 3.7, B.c[1]);
  // Temple C: its high podium, its front steps gone, the stumps of the cella's walls on it
  block(kit, C, 0, 4.6, TUFF);
  const c = (a, b) => quad(C, a, b);
  for (const [a0, b0, a1, b1] of [[0.12, 0.2, 0.62, 0.2], [0.12, 0.8, 0.62, 0.8], [0.12, 0.2, 0.12, 0.8]]) {
    const [x0, z0] = c(a0, b0), [x1, z1] = c(a1, b1), L = Math.hypot(x1 - x0, z1 - z0);
    kit.box(L, 1.6 + r() * 1.6, 1.1, BRICK, (x0 + x1) / 2, 4.6 + 1.1, (z0 + z1) / 2, 0, -Math.atan2(z1 - z0, x1 - x0), 0);
  }
  // Temple D's podium's north edge, the platform of the Curia of Pompey
  block(kit, D, 0, 2, TRAV);
  block(kit, POMPEY, 0, 1.6, TUFF);
  kit.box(1.2, 2.6, 30, TUFF2, POMPEY[0][0] + 1, 2.9, (POMPEY[0][1] + POMPEY[2][1]) / 2);
  // the railing round the edge on its low wall
  EDGE.forEach(([x0, z0], k) => {
    if (k === EDGE.length - 1 || GAPS.some(([a]) => a === k)) return;
    const [x1, z1] = EDGE[k + 1], L = Math.hypot(x1 - x0, z1 - z0), ry = -Math.atan2(z1 - z0, x1 - x0);
    kit.box(L, 0.7, 0.6, TRAV, (x0 + x1) / 2, 0.35, (z0 + z1) / 2, 0, ry, 0);
    kit.box(L, 0.08, 0.08, IRON, (x0 + x1) / 2, 1.6, (z0 + z1) / 2, 0, ry, 0);
    for (let s = 0; s < L; s += 0.9) kit.box(0.05, 0.9, 0.05, IRON, x0 + ((x1 - x0) * s) / L, 1.15, z0 + ((z1 - z0) * s) / L);
  });
  return kit.mesh(kitMat(0.92));
}

// the railing's footprint, a strip along each of its stretches
const strips = EDGE.slice(0, -1).flatMap(([x0, z0], k) => {
  if (GAPS.some(([a]) => a === k)) return [];
  const [x1, z1] = EDGE[k + 1], L = Math.hypot(x1 - x0, z1 - z0), nx = (-(z1 - z0) / L) * 0.4, nz = ((x1 - x0) / L) * 0.4;
  return [[[x0 - nx, z0 - nz], [x1 - nx, z1 - nz], [x1 + nx, z1 + nz], [x0 + nx, z0 + nz]]];
});
const ring = pts => onMap(X, Z, 0, pts);
const disc = Array.from({ length: 24 }, (_, k) => [B.c[0] + B.r * Math.cos((k / 24) * 2 * Math.PI), B.c[1] + B.r * Math.sin((k / 24) * 2 * Math.PI)]);

// It stands in for the map's columns and apses in the dig (area), and riders bump into the podiums
// and the railing (foot).
export const ARGENTINA = [{
  id: 'largo-di-torre-argentina', name: 'Largo di Torre Argentina', x: X, z: Z, turn: 0, reach: 100,
  area: [ring(EDGE)], foot: [ring(A), ring(disc), ring(C), ring(D), ring(POMPEY), ...strips.map(ring)], make: argentina,
}];
