// The Palazzo Vecchio (1299-1314) on Piazza della Signoria, modelled by hand in place of the map's
// block of it, from its measurements and photos, in game metres (the real ones times 1.25), on the
// map's outline: Arnolfo's block of about 40 m by 42 m to the piazza, the later wings behind it to Via
// dei Leoni, and the tower of 94 m. Of rough pietra forte:
//   the old block, its courses of rustication, two storeys of two-light windows under round arches
//     of white stone, the door under the tower with its frieze
//   the gallery standing out on its corbels all round the top, the coats of arms painted in the
//     arches between them, the gallery's own wall and its square Guelph merlons
//   the tower rising from the gallery over the front, its clock, its own gallery with Ghibelline
//     swallowtail merlons, the belfry on four piers, a second gallery and the little cupola with the
//     lion and its flag on top
//   the wings behind, lower and plainer, with three rows of windows and their roofs of red tiles
// It stands on its own, so riders bump into the whole of it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, archRing, onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { GLASS, TILE, sides, panel, lancet, prism, shell } from './marble.js';

const X = 328.6, Z = 195.4, TURN = -0.437; // the outline's middle, and its long axis turned from east (local +x)
const WALL = 41, GALLERY = [44.5, 51], MERLON = 54; // the old block's walls, its gallery, its merlons
const WING = 38; // the wings behind
const PIETRA = '#a8906c', DARK = '#8f785a', LIGHT = '#d9d0bd', ROOF = shade(TILE, -0.08);

// the map's outline of the whole palace, in the model's metres
const FOOT = [[-69.6, -7.2], [-64.1, -8.7], [-34.5, -15.2], [-30, -17.2], [-28.1, -18], [-27.6, -18.2], [-19.4, -21.9], [-4.6, -28.5], [7.6, -33.9], [69.4, -53.2], [69.4, 18.9], [61.5, 53.3], [25.5, 44.6], [-0.1, 45.9], [-14.7, 45.7], [-19.8, 45.8], [-23.2, 46], [-56.6, 47.2], [-59.1, 36.9], [-63.2, 19.6], [-68.4, -1.5]];
// Arnolfo's block: its front to the piazza (D to A), its north side (A to B), its back and south side
const OLD = [[-69.6, -7.2], [-19.4, -21.9], [-3, 45.9], [-56.6, 47.2]];
// the wings behind it, up to the outline's far side
const WINGS = [[-19.4, -21.9], [-4.6, -28.5], [7.6, -33.9], [69.4, -53.2], [69.4, 18.9], [61.5, 53.3], [25.5, 44.6], [-0.1, 45.9], [-3, 45.9]];
// the tower: its middle and its half width, square to the front
const TOWER = [-57.6, 25.6], TH = 5.6, T1 = 84, BELL = [92.5, 103], T2 = 107.5, CUPOLA = 113;

// a ring pushed out by d (a convex one, its sides with the outside to their right: see sides)
function grow(ring, d) {
  const n = ring.length, lines = ring.map((p, i) => {
    const q = ring[(i + 1) % n], L = Math.hypot(q[0] - p[0], q[1] - p[1]), tx = (q[0] - p[0]) / L, tz = (q[1] - p[1]) / L;
    return [p[0] + d * tz, p[1] - d * tx, tx, tz];
  });
  return lines.map((a, i) => {
    const b = lines[(i + n - 1) % n], det = a[2] * b[3] - a[3] * b[2];
    const t = ((a[0] - b[0]) * b[3] - (a[1] - b[1]) * b[2]) / (det || 1);
    return [a[0] - a[2] * t, a[1] - a[3] * t];
  });
}
const area2 = ring => ring.reduce((sum, [u, v], i) => { const [u2, v2] = ring[(i + 1) % ring.length]; return sum + u * v2 - u2 * v; }, 0);
const outward = ring => (area2(ring) > 0 ? ring : ring.slice().reverse());

// a box on the path at s, standing out from o to o + d, from y0 to y1, w wide along it
function block(kit, path, s, o, d, y0, y1, w, hex) {
  const p = path.at(s), x = p.x + (o + d / 2) * p.tz, z = p.z - (o + d / 2) * p.tx;
  return kit.box(w, y1 - y0, d, hex, x, (y0 + y1) / 2, z, 0, Math.atan2(-p.tz, p.tx));
}

// a two-light window under a round arch of white stone, at s
function bifora(kit, path, s, y0, w = 3.2, h = 6.6) {
  lancet(kit, path, s, w, y0, y0 + h, { frame: LIGHT, glass: GLASS, rim: 0.55, round: true, o: 0.05 });
  panel(kit, path, s - 0.13, s + 0.13, y0, y0 + h - w / 2 - 0.2, LIGHT, 0.25, 0.15);
  wall(kit, path, archRing(s, w * 0.36, y0 + h - w / 2 - 0.3, y0 + h - w / 2 + 1, 8), { o0: 0.25, o1: 0.4, hex: LIGHT }); // the little rose in the arch
  panel(kit, path, s - w / 2 - 0.8, s + w / 2 + 0.8, y0 - 0.7, y0 - 0.2, LIGHT, 0, 0.35); // the sill
}

// the gallery on its corbels round a ring at the walls' top y, the painted arms between them, the
// gallery's wall and its merlons (square, or swallowtailed)
function gallery(kit, ring, y, [g0, g1], top, out, swallow = false) {
  const outer = grow(ring, out);
  for (const path of sides(ring)) {
    const len = path.length, n = Math.max(2, Math.round(len / 2.8)), step = len / n;
    for (let k = 0; k <= n; k++) {
      const s = Math.min(len - 0.4, Math.max(0.4, k * step));
      block(kit, path, s, 0, out * 0.45, y, g0, 0.9, DARK);
      block(kit, path, s, 0, out * 0.75, y + (g0 - y) * 0.35, g0, 0.9, DARK);
      block(kit, path, s, 0, out, y + (g0 - y) * 0.7, g0, 0.9, DARK);
    }
    for (let k = 0; k < n; k++) {
      const c = (k + 0.5) * step;
      wall(kit, path, archRing(c, step - 1, y + 0.2, g0 - 0.3, 8), { o0: 0, o1: 0.08, hex: shade(PIETRA, -0.2) });
      panel(kit, path, c - 0.55, c + 0.55, y + 0.6, y + 1.9, ['#b8423a', LIGHT, '#3f5f9a'][k % 3], 0.08, 0.06); // a coat of arms
    }
  }
  prism(kit, outer, g0, g0 + 0.5, DARK);
  // the gallery's wall standing on the corbels, with its little windows, and the merlons on it
  for (const path of sides(outer)) {
    const len = path.length;
    wall(kit, path, [[0, g0 + 0.5], [len, g0 + 0.5], [len, g1], [0, g1]], { o0: -0.8, o1: 0, hex: PIETRA });
    for (let s = 2.4; s < len - 1.6; s += 4.8) panel(kit, path, s - 0.5, s + 0.5, g0 + 2.2, g0 + 4, GLASS, 0, 0.1);
    panel(kit, path, 0, len, g1 - 0.4, g1, DARK, 0, 0.25);
    const n = Math.max(2, Math.round(len / 2.6)), step = len / n;
    for (let k = 0; k < n; k++) {
      const c = (k + 0.5) * step, w = step * 0.55;
      if (!swallow) block(kit, path, c, -0.8, 0.8, g1, top, w, PIETRA);
      else for (const d of [-1, 1]) {
        block(kit, path, c + d * w * 0.3, -0.8, 0.8, g1, top - 0.6, w * 0.4, PIETRA);
        block(kit, path, c + d * w * 0.38, -0.8, 0.8, top - 0.6, top, w * 0.24, PIETRA);
      }
    }
  }
}

export function palazzo() {
  const kit = new Kit();
  oldBlock(kit);
  wings(kit);
  tower(kit);
  return kit.mesh(kitMat(0.92));
}

// where along a path the point (u, v) comes
const along = (path, [u, v]) => { const p = path.at(0); return (u - p.x) * p.tx + (v - p.z) * p.tz; };

// the tower's frame: its middle and its two axes, square to the front (D to A)
const [FA, FD] = [OLD[0], OLD[3]], FL = Math.hypot(FA[0] - FD[0], FA[1] - FD[1]);
const FX = (FA[0] - FD[0]) / FL, FZ = (FA[1] - FD[1]) / FL; // along the front, northwards
const T_FOOT = [FD[0] + ((TOWER[1] - FD[1]) / FZ) * FX, TOWER[1]]; // on the front, abreast of the map's tower
// in from the front so its face stands on the gallery's outer face
const TC = [T_FOOT[0] - FZ * (TH - 1.8), T_FOOT[1] + FX * (TH - 1.8)];
const square = (h, [cu, cv] = TC) => outward([[-h, -h], [h, -h], [h, h], [-h, h]].map(([p, q]) => [cu - p * FZ + q * FX, cv + p * FX + q * FZ]));

function oldBlock(kit) {
  const ring = outward(OLD);
  for (const path of sides(ring)) {
    const len = path.length, front = path.at(0).tz < -0.9; // the front faces -u
    wall(kit, path, [[0, 0], [len, 0], [len, GALLERY[0]], [0, GALLERY[0]]], { o0: -0.6, o1: 0, hex: PIETRA });
    // the courses of the rustication, rougher at the bottom
    for (let y = 1.4; y < WALL - 0.5; y += y < 14 ? 1.25 : 1.6) panel(kit, path, 0, len, y - 0.1, y + 0.1, DARK, 0, 0.08);
    for (let y = 0.6; y < 13; y += 1.25) for (let s = (y * 3.1) % 2.6; s < len - 1; s += 2.6) panel(kit, path, s, s + 2.3, y - 0.5, y + 0.5, shade(PIETRA, ((s * 7 + y * 13) % 5 - 2) * 0.025), 0.08, 0.25);
    panel(kit, path, 0, len, 16.6, 17.3, LIGHT, 0, 0.3);
    panel(kit, path, 0, len, 27.9, 28.6, LIGHT, 0, 0.3);
    // the windows: two storeys of two-light windows, small square ones low down
    const n = Math.max(2, Math.round(len / 9.5)), step = len / n, door = front ? along(path, T_FOOT) : -99;
    for (let k = 0; k < n; k++) {
      const s = (k + 0.5) * step;
      if (Math.abs(s - door) < TH + 1.6) continue; // the tower stands over this one
      bifora(kit, path, s, 18.2);
      bifora(kit, path, s, 29.5);
      panel(kit, path, s - 0.8, s + 0.8, 8.5, 10.4, GLASS, 0.1, 0.1);
    }
    if (front) {
      // the door under the tower, its frieze, and the windows over it
      panel(kit, path, door - 3.2, door + 3.2, 0, 8.6, LIGHT, 0.08, 0.4);
      panel(kit, path, door - 2.2, door + 2.2, 0, 7.4, '#4a3524', 0.4, 0.15);
      panel(kit, path, door - 3.8, door + 3.8, 8.6, 10.2, '#c4a54c', 0.08, 0.45);
      panel(kit, path, door - 1, door + 1, 8.9, 9.9, '#3f5f9a', 0.5, 0.08);
      bifora(kit, path, door, 18.2);
      bifora(kit, path, door, 29.5);
    }
  }
  gallery(kit, ring, WALL, GALLERY, MERLON, 1.8);
  prism(kit, grow(ring, -2.4), GALLERY[0] + 0.5, GALLERY[0] + 2.6, ROOF); // its roof inside the gallery
}

function wings(kit) {
  const ring = outward(WINGS);
  for (const path of sides(ring)) {
    const len = path.length;
    wall(kit, path, [[0, 0], [len, 0], [len, WING], [0, WING]], { o0: -0.6, o1: 0, hex: shade(PIETRA, 0.06) });
    if (len < 6) continue;
    panel(kit, path, 0, len, 0, 1.2, DARK, 0, 0.3);
    const n = Math.max(1, Math.round(len / 5.6)), step = len / n;
    for (let k = 0; k < n; k++) {
      const s = (k + 0.5) * step;
      panel(kit, path, s - 0.9, s + 0.9, 5, 8.4, GLASS, 0.05, 0.1);
      for (const y of [14.5, 25]) {
        panel(kit, path, s - 1.4, s + 1.4, y - 0.5, y + 6, LIGHT, 0.02, 0.12);
        panel(kit, path, s - 1, s + 1, y, y + 5.5, GLASS, 0.1, 0.1);
        panel(kit, path, s - 1.7, s + 1.7, y + 6, y + 6.6, LIGHT, 0.02, 0.3);
      }
    }
    panel(kit, path, 0, len, WING - 1.4, WING, LIGHT, 0, 0.9);
  }
  prism(kit, ring, WING, WING + 0.4, LIGHT);
  prism(kit, grow(ring, -2), WING + 0.4, WING + 2.6, ROOF);
}

function tower(kit) {
  const ring = square(TH), G0 = T1 + 2.4;
  prism(kit, ring, WALL, G0, PIETRA);
  for (const path of sides(ring)) {
    const len = path.length;
    for (let y = GALLERY[1] + 1.6; y < T1; y += 1.6) panel(kit, path, 0, len, y - 0.08, y + 0.08, DARK, 0, 0.06);
    panel(kit, path, len / 2 - 0.5, len / 2 + 0.5, 66, 68.6, GLASS, 0, 0.1);
    // the clock, low on the shaft
    const disc = r => Array.from({ length: 20 }, (_, k) => [len / 2 + r * Math.cos((k / 20) * 2 * Math.PI), 58 + r * Math.sin((k / 20) * 2 * Math.PI)]);
    wall(kit, path, disc(2.6), { o0: 0, o1: 0.15, hex: '#c4a54c' });
    wall(kit, path, disc(2.1), { o0: 0, o1: 0.22, hex: '#2c4a7a' });
    panel(kit, path, len / 2 - 0.08, len / 2 + 0.08, 58, 59.8, '#c4a54c', 0.22, 0.05);
  }
  gallery(kit, ring, T1, [G0, T1 + 6.4], BELL[0], 1.2, true);
  // the belfry: four piers under round arches, the bell, a second gallery over it
  const inner = square(TH - 0.3), turn = Math.atan2(-FX, -FZ);
  for (const [u, v] of inner) kit.box(2.2, BELL[1] - G0, 2.2, PIETRA, u, (G0 + BELL[1]) / 2, v, 0, turn);
  for (const path of sides(inner)) {
    const len = path.length, c = len / 2;
    wall(kit, path, [[0, BELL[1] - 2.4], [len, BELL[1] - 2.4], [len, BELL[1]], [0, BELL[1]]], { o0: -0.6, o1: 0, hex: PIETRA });
    const out = archRing(c, len, BELL[1] - 2.4 - len / 2 + 1, BELL[1] - 2.4, 10).slice(2), inn = archRing(c, len - 2.2, BELL[1] - 2.4 - len / 2 + 1, BELL[1] - 3.2, 10).slice(2);
    wall(kit, path, [...out, ...inn.reverse()], { o0: -0.6, o1: 0, hex: PIETRA });
  }
  kit.add(new THREE.CylinderGeometry(0.9, 1.6, 2.2, 10), '#6e5a35', ...[TC[0], BELL[1] - 5, TC[1]]);
  prism(kit, inner, BELL[1], BELL[1] + 1.4, DARK);
  gallery(kit, square(TH - 0.9), BELL[1], [BELL[1] + 1.4, T2 - 1.6], T2, 0.9, true);
  // the little cupola, the lion on its pole and the flag
  shell(kit, [[2.4, T2 - 1.6], [2.4, T2 + 1.6], [2.8, T2 + 1.6], [2.8, T2 + 2], [2.2, T2 + 2.4], [1.2, CUPOLA - 0.6], [0.3, CUPOLA], [0, CUPOLA]], PIETRA, { cx: TC[0], cz: TC[1] });
  kit.add(new THREE.CylinderGeometry(0.08, 0.08, 4.4, 5), '#3b3b38', TC[0], CUPOLA + 2.2, TC[1]);
  kit.box(0.7, 1.2, 1.4, '#c4a54c', TC[0], CUPOLA + 1.6, TC[1]);
  kit.box(0.06, 1.3, 2.2, '#b8423a', TC[0], CUPOLA + 3.6, TC[1] + 1.15);
}

// it stands in for the map's block of the palace and of the tower (area), and riders bump into its outline (foot)
const RING = onMap(X, Z, TURN, FOOT);
export const PALAZZO_VECCHIO = [{
  id: 'palazzo-vecchio', name: 'Palazzo Vecchio', x: X, z: Z, turn: TURN, reach: 200, area: [RING], foot: [RING],
  make: palazzo,
}];
