// The Pandhof, the Dom's cloister (about 1390-1440), modelled by hand in place of the map's block of
// its galleries, in game metres (the real ones times 1.25), on the map's outline: four low Gothic
// galleries round a square garden on the south side of the Domkerk.
//   the galleries, each under its own pitched roof of slate, with a traceried pointed arch in every
//     bay on the garden side and plain walls with small windows outside; the north gallery runs along
//     the church, and an archway through the west one lets riders in from the Domplein
//   the garden: the herb garden laid out in 1966 after a medieval one, its low box hedges round the
//     beds, and the little fountain in the middle with the canon writing in his book (1915)
// The cloister's own metres are the Domkerk's (domkerk.js): about its crossing, x along the choir
// (+x east), z along the transept (+z south), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep, gable, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = -78.15, Z = 109.3, TURN = 0.335;
const EAVES = 8, RIDGE = 13, GATE = [40, 44.5]; // the galleries' eaves and ridges; the archway through the west one, along z
// the galleries as rectangles [u0, v0, u1, v1], their garden sides facing the garden
const WINGS = { west: [-5.6, 31.4, 3, 65.4], south: [3, 59.5, 39.4, 65.6], east: [32.4, 33.4, 39.4, 59.5], north: [3, 33.4, 32.4, 38.5] };
const GARDEN = [3, 38.5, 32.4, 59.5];
const STONE = '#cfc3a6', STONE2 = '#bcae8f', BRICK = '#8a5f48', DARK = '#2c2a28', SLATE = '#4a5057', GREEN = '#6f9a4e', BOX = '#3f6b34';

// the four sides of [u0, v0, u1, v1], each a path with the outside to its right: north, east, south, west
const sides = ([u0, v0, u1, v1]) => [linePath(u0, v0, u1, v0), linePath(u1, v0, u1, v1), linePath(u1, v1, u0, v1), linePath(u0, v1, u0, v0)];

// a gallery's wall on the path: on the garden side an open pointed arch in every bay of about 3.6 m
// with its tracery, outside a plain wall with a small window in every other bay; `gate` cuts an
// archway through it (from s0 to s1)
function side(kit, p, garden, gate) {
  const L = p.length, n = Math.max(1, Math.round(L / 3.6)), b = L / n, holes = [];
  for (let i = 0; i < n; i++) {
    const s = b * (i + 0.5);
    if (gate && s > gate[0] - 1 && s < gate[1] + 1) continue;
    if (garden) holes.push(pointedRing(s, b - 1.1, 0.9, EAVES - 1.2, 1, 6));
    else if (i % 2) holes.push(pointedRing(s, 1.1, 3, 5.8, 1, 5));
  }
  if (gate) holes.push(pointedRing((gate[0] + gate[1]) / 2, gate[1] - gate[0], 0, 5.6, 1, 7));
  wall(kit, p, [[0, 0], [L, 0], [L, EAVES], [0, EAVES]], { holes, o0: -0.7, o1: 0, hex: garden ? STONE : BRICK });
  sweep(kit, p, 0, L, [[-0.1, EAVES - 0.4], [0.3, EAVES - 0.4], [0.3, EAVES], [-0.1, EAVES]], STONE2, { step: L });
  if (!garden) {
    for (const ring of holes) if (!gate || ring !== holes.at(-1)) wall(kit, p, ring, { o0: -0.7, o1: -0.6, hex: DARK });
    return;
  }
  // the tracery in the arches: a mullion, and a ring of stone in the head
  for (const ring of holes) {
    const s = (ring[0][0] + ring[1][0]) / 2, w = ring[1][0] - ring[0][0];
    if (gate && s > gate[0] && s < gate[1]) continue;
    wall(kit, p, [[s - 0.1, 0.9], [s + 0.1, 0.9], [s + 0.1, EAVES - 2.4], [s - 0.1, EAVES - 2.4]], { o0: -0.5, o1: -0.25, hex: STONE });
    const cy = EAVES - 2.4, r = w * 0.22;
    wall(kit, p, Array.from({ length: 12 }, (_, k) => [s + r * Math.cos((k / 12) * 2 * Math.PI), cy + r * Math.sin((k / 12) * 2 * Math.PI)]), { o0: -0.45, o1: -0.3, hex: STONE });
    wall(kit, p, [[s - w / 2, 0.9], [s + w / 2, 0.9], [s + w / 2, 1.3], [s - w / 2, 1.3]], { o0: -0.7, o1: 0, hex: STONE2 });
  }
  // the buttresses between the bays
  for (let i = 1; i < n; i++) {
    const q = p.at(b * i), x = q.x + 0.35 * q.tz, z = q.z - 0.35 * q.tx;
    if (gate && b * i > gate[0] - 1 && b * i < gate[1] + 1) continue;
    kit.box(0.6, EAVES - 1, 0.7, STONE2, x, (EAVES - 1) / 2, z, 0, Math.atan2(-q.tz, q.tx));
  }
}

export function pandhof() {
  const kit = new Kit();
  for (const [name, box] of Object.entries(WINGS)) {
    const [u0, v0, u1, v1] = box, along = u1 - u0 > v1 - v0 ? 'u' : 'v';
    // the floor and ceiling of the walk, dark inside
    kit.box(u1 - u0 - 1.2, 0.3, v1 - v0 - 1.2, '#8f8676', (u0 + u1) / 2, 0.15, (v0 + v1) / 2);
    kit.box(u1 - u0 - 0.4, 0.4, v1 - v0 - 0.4, '#5b5148', (u0 + u1) / 2, EAVES - 0.2, (v0 + v1) / 2);
    sides(box).forEach((p, f) => {
      // which side faces the garden, and which ones the other galleries hide
      // (the north gallery's back is against the church)
      const facing = { west: 1, south: 0, east: 3, north: 2 }[name], hidden = { west: [], south: [3], east: [0, 2], north: [0, 1, 3] }[name];
      if (hidden.includes(f)) return;
      const gate = name === 'west' && (f === 1 || f === 3) ? (f === 1 ? [GATE[0] - v0, GATE[1] - v0] : [v1 - GATE[1], v1 - GATE[0]]) : null;
      side(kit, p, f === facing, gate);
    });
    // the pitched roof along the gallery, and its ends
    if (along === 'u') gable(kit, u0 - 0.3, u1 + 0.3, (v1 - v0) / 2 + 0.5, EAVES, RIDGE, SLATE, { z: (v0 + v1) / 2 });
    else gable(kit, -(v1 + 0.3), -(v0 - 0.3), (u1 - u0) / 2 + 0.5, EAVES, RIDGE, SLATE, { x: (u0 + u1) / 2, turn: Math.PI / 2 });
  }
  // the garden: its lawn, the box hedges round the beds, the fountain with the canon in the middle
  const [g0, h0, g1, h1] = GARDEN, gu = (g0 + g1) / 2, gv = (h0 + h1) / 2;
  kit.box(g1 - g0, 0.12, h1 - h0, GREEN, gu, 0.06, gv);
  for (const [du, dv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const cu = gu + du * (g1 - g0) * 0.25, cv = gv + dv * (h1 - h0) * 0.25, w = (g1 - g0) * 0.36, d = (h1 - h0) * 0.36;
    for (const k of [-1, 1]) kit.box(w, 0.6, 0.45, BOX, cu, 0.3, cv + (k * d) / 2).box(0.45, 0.6, d, BOX, cu + (k * w) / 2, 0.3, cv);
    kit.box(w - 1, 0.25, d - 1, '#6b5a3e', cu, 0.15, cv);
  }
  kit.add(new THREE.CylinderGeometry(1.9, 2.1, 0.8, 12), STONE2, gu, 0.4, gv);
  kit.add(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 12), '#5f7f8c', gu, 0.82, gv);
  kit.add(new THREE.CylinderGeometry(0.35, 0.45, 2.2, 8), STONE, gu, 1.9, gv);
  kit.add(new THREE.CylinderGeometry(0.45, 0.55, 1.4, 8), '#5a5f52', gu, 3.7, gv).add(new THREE.SphereGeometry(0.32, 8, 6), '#5a5f52', gu, 4.6, gv);
  return kit.mesh(kitMat(0.9));
}

// riders bump into the galleries, and come into the garden through the archway in the west one
const W = WINGS;
export const PANDHOF = [{
  id: 'pandhof', name: 'Pandhof', x: X, z: Z, turn: TURN, reach: 80,
  area: [onMap(X, Z, TURN, rect(-6, 31, 40, 66))],
  foot: [
    onMap(X, Z, TURN, rect(W.west[0], W.west[1], W.west[2], GATE[0])), onMap(X, Z, TURN, rect(W.west[0], GATE[1], W.west[2], W.west[3])),
    onMap(X, Z, TURN, rect(...W.south)), onMap(X, Z, TURN, rect(...W.east)), onMap(X, Z, TURN, rect(...W.north)),
  ],
  make: pandhof,
}];
