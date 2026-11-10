// The Domtoren (1321-1382), modelled by hand in place of the map's stack of blocks of it, in game
// metres (the real ones times 1.25), on the map's outline: 112 m to the cross, the tallest church
// tower of the Netherlands. It stands on its own since the storm of 1674 blew down the nave that
// joined it to the Domkerk; the Domplein lies where the nave stood.
//   the lower square, 19 m across, of brick dressed with stone, its corner buttresses stepping in as
//     they rise, the passage right through it (the street still runs under the tower), tiers of tall
//     blind lancets up its faces, and the gallery round its top at 38 m
//   the second square, a little narrower, with its pairs of tall openings for the bells, its gallery
//     at 68 m, and the four pinnacles on its corners
//   the open octagonal lantern of stone on top, its tall openings two tiers high so the sky shows
//     through, the buttresses and pinnacles at its corners, its gallery, and the little crown of
//     ribs with the cross on it
// The tower's own metres: about its middle, x towards the Domkerk (+x east), the passage along x, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, polygon, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = -156.1, Z = 135.1, TURN = 0.318;
const H1 = 12.1, H2 = 10.5, S1 = 48, S2 = 85, LANTERN = 122, R = 8.8, TOP = 137; // the squares' half widths and tops, the lantern
const PASS = 3.3, PASS_TOP = 11; // half the passage's width, its crown
const BRICK = '#b59f80', BRICK2 = '#a48e70', STONE = '#d4c9b1', STONE2 = '#c2b69c', DARK = '#2a2826', GOLD = '#c9a64a';
const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

// a gallery round a ring of paths at y: the slab and its parapet of little pointed arches
function gallery(kit, paths, y, out = 0.8) {
  for (const p of paths) {
    const L = p.length, n = Math.max(2, Math.round(L / 1.7));
    sweep(kit, p, 0, L, [[-0.8, y - 0.6], [out, y - 0.6], [out, y], [-0.8, y]], STONE2, { step: L });
    const holes = Array.from({ length: n }, (_, k) => pointedRing(((k + 0.5) / n) * L, (L / n) * 0.62, y + 0.25, y + 1.4, 1, 4));
    wall(kit, p, [[0, y], [L, y], [L, y + 1.7], [0, y + 1.7]], { holes, o0: out - 0.3, o1: out, hex: STONE });
  }
}

// a pair of tall lancets under one arch on the path at s, from y0 to y1, w wide in all: a blind
// panel (hex) or an opening for the bells (dark, with its louvres)
function twin(kit, p, s, y0, y1, w, hex, open = false) {
  wall(kit, p, pointedRing(s, w + 0.8, y0 - 0.4, y1 + 0.6, 1, 7), { o0: 0, o1: 0.12, hex: STONE2 });
  for (const k of [-1, 1]) {
    wall(kit, p, pointedRing(s + (k * w) / 4, w / 2 - 0.3, y0, y1 - w * 0.45, 1, 6), { o0: 0.12, o1: 0.2, hex });
    if (open) for (let y = y0 + 1.4; y < y1 - w; y += 1.5) wall(kit, p, [[s + (k * w) / 4 - w / 4 + 0.2, y], [s + (k * w) / 4 + w / 4 - 0.2, y], [s + (k * w) / 4 + w / 4 - 0.2, y + 0.22], [s + (k * w) / 4 - w / 4 + 0.2, y + 0.22]], { o0: 0.2, o1: 0.3, hex: '#4b3f33' });
  }
}

export function domtoren() {
  const kit = new Kit();
  // the lower square: two halves either side of the passage, and the vault over it
  // (a little inside the faces, which get a skin of their own with the passage's arch cut through)
  for (const k of [-1, 1]) kit.box(2 * H1 - 0.6, S1, H1 - 0.3 - PASS, BRICK, 0, S1 / 2, k * (H1 - 0.3 + PASS) / 2);
  kit.box(2 * H1 - 0.6, S1 - PASS_TOP, 2 * PASS, BRICK, 0, (S1 + PASS_TOP) / 2, 0);
  square(H1).forEach((p, f) => {
    const L = p.length, through = f % 2 === 1;
    // the faces' skin, with the passage's arch through the east and west ones
    wall(kit, p, [[0, 0], [L, 0], [L, S1], [0, S1]], { holes: through ? [pointedRing(L / 2, 2 * PASS, 0, PASS_TOP, 1, 8)] : [], o0: -0.4, o1: 0, hex: BRICK });
    if (through) {
      wall(kit, p, [[L / 2 - PASS - 0.9, 0], [L / 2 - PASS, 0], ...pointedRing(L / 2, 2 * PASS, 0, PASS_TOP, 1, 8).slice(2).reverse(), [L / 2 + PASS, 0], [L / 2 + PASS + 0.9, 0], ...pointedRing(L / 2, 2 * PASS + 1.8, 0, PASS_TOP + 1.2, 1, 8).slice(2)], { o0: 0, o1: 0.35, hex: STONE });
    }
    for (const y of [13.2, 30, S1 - 2.4]) wall(kit, p, [[0, y], [L, y], [L, y + 0.6], [0, y + 0.6]], { o0: 0, o1: 0.3, hex: STONE });
    for (const s of [L * 0.22, L * 0.5, L * 0.78]) {
      twin(kit, p, s, 15.4, 28.6, 4.6, BRICK2);
      twin(kit, p, s, 32, S1 - 3.4, 4.6, s === L / 2 ? DARK : BRICK2);
    }
  });
  // the corner buttresses: two to a corner, stepping in as they rise, each step weathered with stone
  for (const [sx, sz] of CORNERS) for (const [y0, y1, d] of [[0, 14, 2.2], [14, 31, 1.6], [31, S1 - 1, 1]]) {
    kit.box(d, y1 - y0, 1.9, BRICK2, sx * (H1 + d / 2), (y0 + y1) / 2, sz * (H1 - 0.95)).box(1.9, y1 - y0, d, BRICK2, sx * (H1 - 0.95), (y0 + y1) / 2, sz * (H1 + d / 2));
    kit.box(d + 0.2, 0.35, 2.1, STONE, sx * (H1 + d / 2), y1, sz * (H1 - 0.95)).box(2.1, 0.35, d + 0.2, STONE, sx * (H1 - 0.95), y1, sz * (H1 + d / 2));
  }
  gallery(kit, square(H1 + 0.2), S1);
  // the second square: its pairs of openings for the bells, its buttresses, its gallery
  kit.box(2 * H2, S2 - S1, 2 * H2, BRICK, 0, (S1 + S2) / 2, 0);
  square(H2).forEach(p => {
    const L = p.length;
    for (const y of [S1 + 3, S2 - 2]) wall(kit, p, [[0, y], [L, y], [L, y + 0.6], [0, y + 0.6]], { o0: 0, o1: 0.3, hex: STONE });
    for (const s of [L * 0.3, L * 0.7]) twin(kit, p, s, S1 + 5, S2 - 3.4, 5.6, DARK, true);
  });
  for (const [sx, sz] of CORNERS) {
    kit.box(1.4, S2 - S1 - 1, 1.6, BRICK2, sx * (H2 + 0.7), (S1 + S2 - 1) / 2, sz * (H2 - 0.8)).box(1.6, S2 - S1 - 1, 1.4, BRICK2, sx * (H2 - 0.8), (S1 + S2 - 1) / 2, sz * (H2 + 0.7));
  }
  gallery(kit, square(H2 + 0.2), S2);
  // the four pinnacles on the corners of the second square, and the flyers from them to the lantern
  for (const [sx, sz] of CORNERS) {
    const x = sx * (H2 - 1), z = sz * (H2 - 1);
    kit.box(1.9, 12, 1.9, STONE2, x, S2 + 6, z, 0, Math.PI / 4);
    kit.add(new THREE.ConeGeometry(1.25, 6, 4), STONE2, x, S2 + 15, z);
    const a = Math.atan2(sz, sx), cx = (R - 0.4) * Math.cos(a), cz = (R - 0.4) * Math.sin(a);
    kit.rod([x, S2 + 9, z], [cx * 0.98, S2 + 14, cz * 0.98], 0.3, STONE2, 5);
  }
  // the open lantern: its eight sides with their tall openings (nothing inside, so the sky shows
  // through), the mullions and transoms of their tracery, the buttresses and pinnacles on its corners
  const start = Math.PI / 8, mid = (S2 + LANTERN) / 2;
  kit.box(2 * H2 - 1, 0.8, 2 * H2 - 1, STONE2, 0, S2 + 0.2, 0);
  for (const p of polygon(R, 8, start)) {
    const L = p.length, s = L / 2, w = L * 0.66;
    const holes = [pointedRing(s, w, S2 + 2, mid - 0.8, 1, 6), pointedRing(s, w, mid + 0.8, LANTERN - 2, 1, 8)];
    wall(kit, p, [[0, S2], [L, S2], [L, LANTERN], [0, LANTERN]], { holes, o0: -0.7, o1: 0, hex: STONE, ends: false });
    for (const [y0, y1] of [[S2 + 2, mid - 3], [mid + 0.8, LANTERN - 4.5]]) wall(kit, p, [[s - 0.13, y0], [s + 0.13, y0], [s + 0.13, y1], [s - 0.13, y1]], { o0: -0.5, o1: -0.2, hex: STONE });
  }
  for (let k = 0; k < 8; k++) {
    const a = start + (k / 8) * 2 * Math.PI, x = (R + 0.4) * Math.cos(a), z = (R + 0.4) * Math.sin(a);
    kit.box(1.1, LANTERN - S2, 1.1, STONE2, x, mid, z, 0, -a);
    kit.add(new THREE.ConeGeometry(0.7, 4, 4), STONE2, x, LANTERN + 2.7, z);
  }
  gallery(kit, polygon(R + 0.2, 8, start), LANTERN, 0.6);
  // the crown: a ring, eight ribs bending in to the top, the ball and the cross
  const r = R - 2.6;
  kit.add(new THREE.CylinderGeometry(r, r, 1.6, 8).rotateY(-start), STONE2, 0, LANTERN + 0.8, 0);
  for (let k = 0; k < 8; k++) {
    const a = start + (k / 8) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a);
    const pts = [[r, LANTERN + 1.6], [r * 0.85, LANTERN + 6], [r * 0.5, LANTERN + 10.5], [0.4, TOP - 1]];
    for (let q = 0; q + 1 < pts.length; q++) kit.rod([pts[q][0] * c, pts[q][1], pts[q][0] * s], [pts[q + 1][0] * c, pts[q + 1][1], pts[q + 1][0] * s], 0.28, STONE, 5);
  }
  kit.add(new THREE.SphereGeometry(0.6, 8, 6), GOLD, 0, TOP, 0);
  kit.rod([0, TOP, 0], [0, TOP + 3.4, 0], 0.1, GOLD, 4).box(1.6, 0.16, 0.16, GOLD, 0, TOP + 2.5, 0);
  return kit.mesh(kitMat(0.9));
}

// riders bump into its two halves, and ride through the passage between them along the street
export const DOMTOREN = [{
  id: 'domtoren', name: 'Domtoren', x: X, z: Z, turn: TURN, reach: 170,
  area: [onMap(X, Z, TURN, rect(-H1 - 2, -H1 - 2, H1 + 2, H1 + 0.5))],
  foot: [onMap(X, Z, TURN, rect(-H1 - 2.2, -H1 - 2.2, H1 + 2.2, -PASS)), onMap(X, Z, TURN, rect(-H1 - 2.2, PASS, H1 + 2.2, H1 + 2.2))],
  make: domtoren,
}];
