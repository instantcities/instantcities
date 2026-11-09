// The Fontana di Trevi (Nicola Salvi, 1732-62), modelled by hand against the front of the Palazzo
// Poli on the map, from its measurements and photos, in game metres (the real ones times 1.25):
// 26 m high and 49 m wide, over the map's basin (a pool sunk below the square, core/js/scenery.js).
//   the palace front in travertine: a triumphal arch in the middle, standing forward, with four
//     Corinthian columns, the big niche between the middle two and the smaller niches of Abundance
//     and Health between the outer pairs, with their reliefs over them; either side three bays of
//     windows in two rows between giant pilasters; the entablature over it all, and the attic with
//     its inscription, the four statues of the seasons and the pope's arms held up on top
//   in the big niche Oceanus on his shell, and below him on the rocks the two sea horses, one wild
//     and one calm, each led by a triton
//   the scogliera, the cliff of rough travertine across the whole foot of the front, down into the
//     water, and the basin's rim round the front of the pool
// Riders bump into the front and the rocks, and into the rim.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep, archRing, onMap, rect } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';

const X = 507.9, Z = -309.5, TURN = 0.3375; // the middle of its front, and the front turned from east
const W = 29, H = 32.6; // half its width, and the attic's top
const ENT = [22, 25.4]; // the entablature
const TRAV = '#e2d8c2', TRAV2 = '#d6cbb2', ROCK = ['#cbbf9f', '#bfb393', '#d3c8ab', '#b5a888'], MARBLE = '#f1ede3', DARK = '#5f584c';
const COLS = [-11.2, -4.8, 4.8, 11.2], PIL = [13.6, 18.7, 23.9, W - 0.6]; // the columns, and the wings' pilasters out from the middle

// the map's points in the city's metres, as points [u, v] of the model's own (u along its front, v
// out from it towards the square)
const local = (x, z) => { const c = Math.cos(TURN), s = Math.sin(TURN), dx = x - X, dz = z - Z; return [dx * c - dz * s, dx * s + dz * c]; };
// the basin's rim along the edge of the map's pool, from the front at its west end round to its east end
const RIM = [[488.6, -303.6], [488, -297], [490.4, -291.6], [491.4, -286.7], [494.3, -283.9], [497.9, -281.1], [500.9, -280.3], [503.9, -280.6],
  [524.6, -288], [527.9, -290.1], [529.6, -292.3], [530.6, -295], [530.8, -300.9], [531.6, -309], [532.3, -316.4]].map(p => local(...p));

// a path along a line of points [u, v], as arcade.js's paths: s along it, its normal to the right
// (rome/navona.js lays its basins' rims along one too)
export function polyPath(pts) {
  const len = [0];
  for (let k = 1; k < pts.length; k++) len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  return {
    length: len.at(-1), closed: false,
    at(s) {
      let k = 1;
      while (k < pts.length - 1 && len[k] < s) k++;
      const [x0, z0] = pts[k - 1], [x1, z1] = pts[k], d = len[k] - len[k - 1] || 1, t = (s - len[k - 1]) / d;
      return { x: x0 + (x1 - x0) * t, z: z0 + (z1 - z0) * t, tx: (x1 - x0) / d, tz: (z1 - z0) / d };
    },
  };
}

export function trevi() {
  const kit = new Kit();
  // the palace behind the front, as deep as the map's block of it lets it show
  kit.box(2 * W, H - 0.4, 12, TRAV2, 0, (H - 0.4) / 2, -6);
  // the front, along a path from east to west so that o is out towards the square (+v)
  const path = linePath(W, 0, -W, 0), s = u => W - u;
  const windows = [];
  for (const side of [-1, 1]) {
    for (let b = 0; b < 3; b++) {
      const u = side * (PIL[b] + PIL[b + 1]) / 2;
      for (const y of [8.2, 15]) windows.push([[s(u) - 1.3, y], [s(u) + 1.3, y], [s(u) + 1.3, y + 3.8], [s(u) - 1.3, y + 3.8]]);
    }
  }
  wall(kit, path, [[0, 0], [2 * W, 0], [2 * W, ENT[0]], [0, ENT[0]]], { holes: windows, o0: -0.5, o1: 1, hex: TRAV });
  for (const ring of windows) {
    // the windows dark behind their glass, with a frame and a pediment over each
    const [[a, y]] = ring, sc = a + 1.3, u = W - sc;
    kit.box(2.6, 3.8, 0.2, DARK, u, y + 1.9, 0.1);
    kit.box(3.3, 0.35, 0.5, TRAV2, u, y - 0.15, 1.2);
    kit.box(3.5, 0.45, 0.6, TRAV2, u, y + 4.2, 1.25);
    if (y > 10) for (const k of [-1, 1]) kit.box(2, 0.3, 0.55, TRAV2, u + k * 0.85, y + 4.75, 1.25, 0, 0, -k * 0.35);
  }
  // the wings' giant pilasters, and the plinth course they stand on over the rocks
  for (const side of [-1, 1]) for (const p of PIL) {
    kit.box(1.5, ENT[0] - 5, 0.6, TRAV2, side * p, 5 + (ENT[0] - 5) / 2, 1.3);
    kit.box(2, 1.3, 0.9, MARBLE, side * p, ENT[0] - 0.65, 1.4);
  }
  kit.box(2 * W, 1, 0.8, TRAV2, 0, 5, 1.4);
  // the triumphal arch standing forward in the middle, its big niche cut through it
  const mid = linePath(12.5, 3.2, -12.5, 3.2), m = u => 12.5 - u;
  const niche = archRing(m(0), 8.2, 3, 19.5, 12), small = [-8, 8].map(u => archRing(m(u), 3.1, 5.2, 12.2, 8));
  wall(kit, mid, [[0, 0], [25, 0], [25, ENT[0]], [0, ENT[0]]], { holes: [niche, ...small], o0: 1, o1: 3.2, hex: TRAV });
  // the niches' backs and half-domes, in shadow
  kit.box(8.2, 16.5, 0.4, shade(TRAV2, -0.22), 0, 11.2, 0.9);
  kit.add(new THREE.SphereGeometry(4.1, 12, 6, 0, Math.PI, 0, Math.PI / 2).rotateX(-Math.PI / 2).scale(1, 1, 0.55), shade(TRAV2, -0.15), 0, 15.4, 1.1);
  for (const u of [-8, 8]) {
    kit.box(3.1, 7, 0.3, shade(TRAV2, -0.2), u, 8.7, 1.2);
    statue(kit, u, 5.6, 1.9, 3.6, u < 0 ? 0.25 : -0.25); // Abundance and Health
    kit.box(5, 3.4, 0.4, shade(TRAV, -0.08), u, 15.3, 3.4); // the reliefs over them
    kit.box(4.4, 2.8, 0.25, shade(MARBLE, -0.1), u, 15.3, 3.65);
  }
  for (const u of COLS) {
    kit.add(new THREE.CylinderGeometry(0.85, 0.95, ENT[0] - 6.5, 12), TRAV, u, 5.2 + (ENT[0] - 6.5) / 2, 4.4);
    kit.box(2.4, 1.2, 2.4, TRAV2, u, 5.6, 4.4);
    kit.add(new THREE.CylinderGeometry(1.35, 0.85, 1.6, 12), MARBLE, u, ENT[0] - 0.8, 4.4);
  }
  // the entablature over the whole front, breaking forward over the arch
  kit.box(2 * W + 0.6, ENT[1] - ENT[0], 1.6, TRAV, 0, (ENT[0] + ENT[1]) / 2, 1.2);
  kit.box(2 * W + 1.4, 0.7, 2.4, TRAV2, 0, ENT[1] - 0.35, 1.3);
  kit.box(26, ENT[1] - ENT[0], 3, TRAV, 0, (ENT[0] + ENT[1]) / 2, 4);
  kit.box(27, 0.8, 3.8, TRAV2, 0, ENT[1] - 0.4, 4.1);
  // the attic: over the wings low, with small windows and a balustrade; over the arch high, with
  // the inscription, the statues and the arms
  kit.box(2 * W, 3.4, 1.4, TRAV, 0, ENT[1] + 1.7, 0.7);
  for (const side of [-1, 1]) for (let b = 0; b < 3; b++) kit.box(1.6, 1.4, 0.2, DARK, side * (PIL[b] + PIL[b + 1]) / 2, ENT[1] + 1.6, 1.45);
  for (let u = -W + 0.6; u <= W - 0.6; u += 0.9) if (Math.abs(u) > 12.6) kit.box(0.35, 1.1, 0.35, TRAV2, u, ENT[1] + 3.95, 0.6);
  kit.box(2 * W, 0.3, 0.8, TRAV2, 0, ENT[1] + 4.6, 0.6);
  kit.box(25, H - ENT[1], 3.4, TRAV, 0, (H + ENT[1]) / 2, 3.2);
  kit.box(26, 0.7, 3.8, TRAV2, 0, H - 0.35, 3.3);
  kit.box(15, 3.4, 0.2, shade(TRAV, -0.06), 0, ENT[1] + 3.3, 4.95);
  for (let line = 0; line < 3; line++) for (let k = -16; k <= 16; k++) if (rng(line * 40 + k + 99)() > 0.18) kit.box(0.35, 0.55, 0.08, '#6c6455', k * 0.42, ENT[1] + 4.3 - line * 0.95, 5.07);
  for (const u of COLS) statue(kit, u, H, 3.8, 3.4, -u * 0.02);
  // the pope's arms: the shield with the keys and the tiara, two Fames holding it up
  kit.box(4.2, 4.6, 1.2, MARBLE, 0, H + 2.6, 3.6);
  kit.add(new THREE.CylinderGeometry(0.9, 1.3, 2, 10), MARBLE, 0, H + 5.6, 3.6);
  kit.add(new THREE.SphereGeometry(0.6, 8, 6), MARBLE, 0, H + 6.9, 3.6);
  for (const k of [-1, 1]) {
    kit.add(new THREE.CylinderGeometry(0.4, 0.65, 3.4, 8), MARBLE, k * 3, H + 1.7, 3.8, 0, 0, k * 0.5);
    kit.add(new THREE.SphereGeometry(0.38, 8, 6), MARBLE, k * 3.9, H + 3.3, 3.8);
  }

  // Oceanus on his shell in the big niche, the sea horses and the tritons below him
  kit.add(new THREE.SphereGeometry(2.6, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.2, 0.5, 1), MARBLE, 0, 5.4, 4);
  statue(kit, 0, 5.8, 3, 6.6, 0);
  kit.box(2.4, 0.5, 0.9, MARBLE, 0.6, 9.4, 3.6, 0, 0, -0.25); // his cloak flying out
  for (const k of [-1, 1]) {
    horse(kit, k * 5.4, 2.6, 7.6, k, k < 0);
    statue(kit, k * 8.4, 2.2, 8.4, 3.8, k * 0.3, true);
  }

  // the scogliera: rough rocks heaped across the foot of the front, highest in the middle,
  // spilling down into the pool, and a ledge of them along the water
  const r = rng(7);
  for (let k = 0; k < 320; k++) {
    const u = (r() * 2 - 1) * (W - 0.5), v = 0.3 + r() * (Math.abs(u) < 13 ? 10 : 6), top = (Math.abs(u) < 13 ? 5.2 : 3.8) - v * 0.5;
    const size = 0.6 + r() * 1.1, y = Math.max(-2.6, top * r() - 0.4);
    kit.add(new THREE.IcosahedronGeometry(size, 0).scale(1.3, 0.7, 1), ROCK[k % ROCK.length], u, y, v, r() * 3, r() * 3, 0);
  }
  for (let k = 0; k < 60; k++) {
    const u = (r() * 2 - 1) * 22, v = 8.5 + r() * 5 - Math.abs(u) * 0.12;
    kit.add(new THREE.IcosahedronGeometry(0.6 + r() * 0.8, 0).scale(1.4, 0.6, 1), ROCK[k % ROCK.length], u, -2.3 + r() * 0.7, v, r() * 3, r() * 3, 0);
  }
  // the basin's rim, its foot down to the water, along the pool's edge
  sweep(kit, polyPath(RIM), 0, polyPath(RIM).length, [[-1.7, 0], [0, 0], [0, -2.8], [0.3, -2.8], [0.3, 0.6], [-1.7, 0.6]], TRAV2, { step: 1.5 });
  return kit.mesh(kitMat(0.9));
}

// a figure standing (or, on the rocks, striding), from its feet at (u, y, v), h high, a little
// turned: a robe or a body, the shoulders, the head
function statue(kit, u, y, v, h, lean, bare = false) {
  const body = h * 0.62;
  kit.add(new THREE.CylinderGeometry(h * 0.1, bare ? h * 0.11 : h * 0.16, body, 8), MARBLE, u, y + body / 2, v, 0, 0, lean * 0.2);
  kit.box(h * 0.3, h * 0.1, h * 0.14, MARBLE, u + lean * 0.3, y + body, v);
  kit.add(new THREE.SphereGeometry(h * 0.075, 8, 6), MARBLE, u + lean * 0.35, y + body + h * 0.13, v);
  kit.add(new THREE.CylinderGeometry(h * 0.035, h * 0.04, h * 0.32, 6), MARBLE, u + h * 0.2, y + body * 0.85, v + 0.2, 0, 0, -0.9 - lean);
}

// a sea horse rearing out of the rocks at (u, y, v), facing out of the front, turned to side k; the
// wild one with its forelegs up
function horse(kit, u, y, v, k, wild) {
  const rear = wild ? -0.45 : -0.15, ry = k * 0.35;
  kit.add(new THREE.CylinderGeometry(0.8, 0.7, 3.2, 8).rotateX(Math.PI / 2), MARBLE, u, y + 1.1, v, rear, ry, 0);
  kit.add(new THREE.CylinderGeometry(0.45, 0.65, 2, 8), MARBLE, u + k * 0.45, y + 2.4 + (wild ? 0.5 : 0), v + 1.6, wild ? 0.55 : 0.35, 0, 0);
  kit.box(0.7, 0.75, 1.6, MARBLE, u + k * 0.55, y + 3.5 + (wild ? 0.6 : 0), v + 2.4, 0.4, ry, 0);
  for (const s of [-1, 1]) kit.box(0.35, 1.6, 0.35, MARBLE, u + s * 0.5, y + (wild ? 1.5 : 0.4), v + 1.9, wild ? -1.2 : -0.35, 0, 0);
  // its tail of a fish, curling back into the rocks
  kit.add(new THREE.TorusGeometry(1.1, 0.35, 6, 10, Math.PI * 1.2), MARBLE, u - k * 0.4, y + 0.4, v - 2, 0, Math.PI / 2, 0);
}

// the rim's footprint: a strip along the pool's edge, its outer side and back along its inner one
function rimRing() {
  const p = polyPath(RIM), out = [], back = [];
  for (let s = 0; s <= p.length; s += 1.5) {
    const a = p.at(Math.min(s, p.length - 0.01));
    out.push([a.x - 1.7 * a.tz, a.z + 1.7 * a.tx]);
    back.push([a.x + 0.3 * a.tz, a.z - 0.3 * a.tx]);
  }
  return [...out, ...back.reverse()];
}

// It stands in for the map's bits in front of the palace (area), and riders bump into the front,
// the rocks and the rim of the basin (foot).
export const TREVI = [{
  id: 'fontana-di-trevi', name: 'Fontana di Trevi', x: X, z: Z, turn: TURN, reach: 80,
  area: [onMap(X, Z, TURN, rect(-W - 1, -0.5, W + 1, 28))],
  foot: [onMap(X, Z, TURN, rect(-W, -12, W, 4)), onMap(X, Z, TURN, rect(-13, 3, 13, 9)), onMap(X, Z, TURN, rimRing())],
  make: trevi,
}];
