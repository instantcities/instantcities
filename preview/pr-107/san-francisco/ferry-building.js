// The Ferry Building (A. Page Brown, 1896-98) at the foot of Market Street on the Embarcadero,
// modelled by hand in place of the map's block and tower parts of it, from its measurements and
// photos, in game metres (the real ones times 1.25), on the map's outline: 201 m long along the
// waterfront, in grey Colusa sandstone.
//   the long front on the Embarcadero: the arcade of round arches along the street, the row of
//     arched windows over it, the cornice and its balustrade, the end pavilions a little higher
//   the middle pavilion with its three tall arches into the nave, and the clock tower over it,
//     75 m high, modelled on the Giralda of Seville: the shaft with a clock 7 m across on each face,
//     then the stages of arched openings narrowing upwards, the lantern and the flagpole
//   the nave's long roof with its skylight along the ridge
// Riders bump into the whole of it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 669.8, Z = -264.5, TURN = 2.206; // the outline's middle, and its length (local +u, to the north-north-west) turned from east
const L = 125.6, FRONT = -24, BACK = 35, MID = [-25.8, 28.2, -35]; // its half length, its front and back, the middle pavilion
const T = { u: 0.7, v: -17.9, w: 18 }; // the tower's middle and width
const EAVES = 19;
const SAND = '#ddd5c2', SAND2 = '#ccc2ac', DARK = '#3d3a36', ROOF = '#6d776f', GLASS = '#8fa2ac', CLOCK = '#f1ede2';

// arched openings on a face square to v at `at`, facing the way `out` (-1 the front, 1 the back):
// n of them from a to b along u, w wide from y0 up to the crown at y1
function arches(kit, at, out, a, b, n, w, y0, y1, hex = DARK) {
  for (let k = 0; k < n; k++) {
    const u = a + ((k + 0.5) * (b - a)) / n;
    kit.box(w, y1 - y0 - w / 2, 0.3, hex, u, y0 + (y1 - y0 - w / 2) / 2, at + out * 0.1);
    kit.add(new THREE.CylinderGeometry(w / 2, w / 2, 0.3, 10, 1, false, 0, Math.PI), hex, u, y1 - w / 2, at + out * 0.1, 0, Math.PI / 2, Math.PI / 2);
  }
}

// a stage of the tower: a square block w wide from y0 to y1 with `n` arched openings on each face,
// a cornice on top and a little pinnacle at each corner
function stage(kit, w, y0, y1, n, { pinnacles = true } = {}) {
  kit.box(w, y1 - y0, w, SAND, T.u, (y0 + y1) / 2, T.v);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2, c = Math.cos(a), s = Math.sin(a), ow = Math.min(2.4, (w * 0.6) / n);
    for (let j = 0; j < n; j++) {
      const x = -w / 2 + ((j + 0.5) * w) / n, h = (y1 - y0) * 0.62;
      kit.box(ow, h, 0.3, DARK, T.u + c * (w / 2 + 0.05) - s * x, y0 + (y1 - y0) * 0.18 + h / 2, T.v + s * (w / 2 + 0.05) + c * x, 0, Math.PI / 2 - a);
    }
  }
  kit.box(w + 1, 0.8, w + 1, SAND2, T.u, y1 + 0.4, T.v);
  if (pinnacles) for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    kit.box(0.9, 1.6, 0.9, SAND2, T.u + su * (w / 2), y1 + 1.6, T.v + sv * (w / 2));
    kit.add(new THREE.SphereGeometry(0.5, 8, 6), SAND2, T.u + su * (w / 2), y1 + 2.7, T.v + sv * (w / 2));
  }
}

export function ferryBuilding() {
  const kit = new Kit();
  // the long block, its cornice and balustrade, its roof and the skylight along the ridge
  kit.box(2 * L, EAVES, BACK - FRONT, SAND, 0, EAVES / 2, (FRONT + BACK) / 2);
  kit.box(2 * L + 0.8, 0.9, BACK - FRONT + 0.8, SAND2, 0, EAVES + 0.45, (FRONT + BACK) / 2);
  kit.box(2 * L + 0.2, 1.1, 0.4, SAND2, 0, EAVES + 1.45, FRONT + 0.2);
  kit.frustum(2 * L - 4, BACK - FRONT - 4, 2 * L - 6, 8, 6, ROOF, 0, EAVES + 0.9, (FRONT + BACK) / 2);
  kit.box(2 * L - 8, 1.6, 6, GLASS, 0, EAVES + 7.6, (FRONT + BACK) / 2);
  kit.frustum(2 * L - 8, 6.4, 2 * L - 8, 0.4, 1.8, ROOF, 0, EAVES + 8.4, (FRONT + BACK) / 2);
  // the arcade along the front and the arched windows over it, both sides of the middle pavilion; the
  // back towards the piers plainer
  for (const [a, b] of [[-L + 13, MID[0]], [MID[1], L - 13]]) {
    const n = Math.round((b - a) / 7.4);
    arches(kit, FRONT, -1, a, b, n, 5, 0, 8.6);
    arches(kit, FRONT, -1, a, b, n, 2.6, 10.5, 16.2);
    kit.box(b - a, 0.6, 0.5, SAND2, (a + b) / 2, 9.4, FRONT - 0.25);
  }
  arches(kit, BACK, 1, -L + 4, L - 4, 30, 3, 9.5, 16, shade(DARK, 0.1));
  // the end pavilions, higher, under low hipped roofs
  for (const s of [-1, 1]) {
    const u = s * (L - 6.5);
    kit.box(13, EAVES + 3, BACK - FRONT + 1, SAND, u, (EAVES + 3) / 2, (FRONT + BACK) / 2);
    kit.frustum(13.6, BACK - FRONT + 1.6, 4, BACK - FRONT - 8, 4, ROOF, u, EAVES + 3, (FRONT + BACK) / 2);
    arches(kit, FRONT - 0.5, -1, u - 4, u + 4, 2, 2.8, 4, 15);
  }
  // the middle pavilion and its three tall arches
  kit.box(MID[1] - MID[0], EAVES + 3, FRONT - MID[2], SAND, (MID[0] + MID[1]) / 2, (EAVES + 3) / 2, (FRONT + MID[2]) / 2);
  kit.box(MID[1] - MID[0] + 0.8, 1, FRONT - MID[2] + 0.8, SAND2, (MID[0] + MID[1]) / 2, EAVES + 3.5, (FRONT + MID[2]) / 2);
  arches(kit, MID[2], -1, MID[0] + 6, MID[1] - 6, 3, 8, 0, 15);
  for (const s of [-1, 1]) arches(kit, MID[2], -1, (MID[0] + MID[1]) / 2 + s * 23, (MID[0] + MID[1]) / 2 + s * 23 + 0.1, 1, 2.4, 5, 16);
  // the tower: its shaft with the pilasters at its corners, the four clocks, the stages over it
  const SHAFT = 56;
  kit.box(T.w, SHAFT, T.w, SAND, T.u, SHAFT / 2, T.v);
  for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.box(1.6, SHAFT - 2, 1.6, SAND2, T.u + su * (T.w / 2 - 0.4), SHAFT / 2, T.v + sv * (T.w / 2 - 0.4));
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2, c = Math.cos(a), s = Math.sin(a), o = T.w / 2 + 0.15;
    const x = T.u + c * o, z = T.v + s * o, ry = Math.PI / 2 - a;
    kit.add(new THREE.CylinderGeometry(4.6, 4.6, 0.3, 32), SAND2, x, 47, z, Math.PI / 2, ry, 0);
    kit.add(new THREE.CylinderGeometry(4.1, 4.1, 0.4, 32), CLOCK, x + c * 0.1, 47, z + s * 0.1, Math.PI / 2, ry, 0);
    kit.box(0.35, 3.2, 0.2, DARK, x + c * 0.35, 48.4, z + s * 0.35, 0, ry); // the minute hand
    kit.box(0.4, 2.2, 0.2, DARK, x + c * 0.35 - s * 0.7, 47.2, z + s * 0.35 + c * 0.7, 0, ry, 1.1); // the hour hand
    // the windows down the shaft
    for (const y of [12, 20, 28, 36]) kit.box(1.4, 3.6, 0.3, DARK, T.u + c * (T.w / 2 + 0.05), y, T.v + s * (T.w / 2 + 0.05), 0, ry);
  }
  kit.box(T.w + 1.6, 1.2, T.w + 1.6, SAND2, T.u, SHAFT + 0.6, T.v);
  stage(kit, 14.4, SHAFT + 1.2, 66, 3);
  stage(kit, 11, 66.8, 75, 2);
  kit.add(new THREE.CylinderGeometry(3.8, 4.2, 6.5, 8), SAND, T.u, 79, T.v);
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) / 8) * 2 * Math.PI;
    kit.box(1.2, 3.6, 0.3, DARK, T.u + 4 * Math.cos(a), 79, T.v + 4 * Math.sin(a), 0, Math.PI / 2 - a);
  }
  kit.add(new THREE.CylinderGeometry(4.6, 4.4, 0.7, 8), SAND2, T.u, 82.6, T.v);
  kit.add(new THREE.SphereGeometry(3.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), ROOF, T.u, 83, T.v);
  kit.rod([T.u, 86.5, T.v], [T.u, 100, T.v], 0.18, '#d9d4c6', 6);
  return kit.mesh(kitMat(0.88));
}

// It stands in for the map's block and tower (area); riders bump into the whole of it (foot).
export const FERRY_BUILDING = [{
  id: 'ferry-building', name: 'Ferry Building', x: X, z: Z, turn: TURN, reach: 500,
  area: [onMap(X, Z, TURN, rect(-L - 1.5, MID[2] - 1.5, L + 1.5, BACK - 1))],
  foot: [onMap(X, Z, TURN, rect(-L, FRONT, L, BACK)), onMap(X, Z, TURN, rect(MID[0], MID[2], MID[1], FRONT))],
  make: ferryBuilding,
}];
