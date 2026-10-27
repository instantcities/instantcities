// The tower of the Nieuwe Kerk on the Markt (1396-1496), modelled by hand in place of the map's stack
// of blocks of it (the church behind stays the map's), in game metres (the real ones times 1.25), on
// the map's outline: a square of pale stone 12.5 m across, 108.75 m to the top, the second tallest
// church tower of the Netherlands after the Dom in Utrecht.
//   the square body to 37 m, its corner buttresses stepping in as they rise, the doorway towards the
//     Markt, the tall blind lancets up its sides and the stone bands between its storeys
//   the gallery round the top of the square, and the four slender pinnacles on its corners
//   three octagonal storeys, each narrower than the one under it, with their tall openings for the
//     bells and their galleries
//   the openwork spire that P.J.H. Cuypers put back on it after the lightning of 1872: eight ribs
//     with their crockets, rings of tracery between them, the crown and the ball on top
// The tower's own metres: about its middle, x along the church (+x towards the choir, -x the Markt),
// y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, polygon, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = 188.3, Z = -220.6, TURN = 0.569;
const H = 7.8; // half the square's width, without its buttresses
const SQUARE = 46, OCT = [[46, 70, 7.2], [70, 90, 5.7], [90, 104, 4.6]], TOP = 131; // the octagons: from, to, out to a corner
const STONE = '#cdc6b4', STONE2 = '#bcb4a0', DARK = '#2b2a28', GOLD = '#c9a64a';
const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

// a gallery round a ring of paths at y: the slab and its parapet of little arches
function gallery(kit, paths, y, out = 0.6) {
  for (const p of paths) {
    const L = p.length, n = Math.max(2, Math.round(L / 1.6));
    sweep(kit, p, 0, L, [[-0.6, y - 0.5], [out, y - 0.5], [out, y], [-0.6, y]], STONE2, { step: L });
    const holes = Array.from({ length: n }, (_, k) => pointedRing(((k + 0.5) / n) * L, (L / n) * 0.6, y + 0.25, y + 1.3, 1, 4));
    wall(kit, p, [[0, y], [L, y], [L, y + 1.6], [0, y + 1.6]], { holes, o0: out - 0.25, o1: out, hex: STONE });
  }
}

// an octagonal storey from y0 to y1, r out to its corners: its walls with a tall opening in each
// side (the dark core behind), a crocketed pinnacle on every corner, the gallery round its top
function octagon(kit, y0, y1, r) {
  const start = Math.PI / 8, paths = polygon(r, 8, start);
  kit.add(new THREE.CylinderGeometry(r * 0.7, r * 0.7, y1 - y0, 8).rotateY(-start), DARK, 0, (y0 + y1) / 2, 0);
  for (const p of paths) {
    const L = p.length, s = L / 2;
    wall(kit, p, [[0, y0], [L, y0], [L, y1], [0, y1]], { holes: [pointedRing(s, L * 0.56, y0 + 2, y1 - 2, 1.1, 7)], o0: -0.7, o1: 0, hex: STONE, ends: false });
    // the mullion up the opening, and the transom of tracery across it
    wall(kit, p, [[s - 0.12, y0 + 2], [s + 0.12, y0 + 2], [s + 0.12, y1 - 4], [s - 0.12, y1 - 4]], { o0: -0.6, o1: -0.3, hex: STONE2 });
    wall(kit, p, [[s - L * 0.28, (y0 + y1) / 2 - 0.2], [s + L * 0.28, (y0 + y1) / 2 - 0.2], [s + L * 0.28, (y0 + y1) / 2 + 0.2], [s - L * 0.28, (y0 + y1) / 2 + 0.2]], { o0: -0.6, o1: -0.3, hex: STONE2 });
  }
  for (let k = 0; k < 8; k++) {
    const a = start + (k / 8) * 2 * Math.PI, x = (r + 0.25) * Math.cos(a), z = (r + 0.25) * Math.sin(a);
    kit.box(0.8, y1 - y0, 0.8, STONE2, x, (y0 + y1) / 2, z, 0, -a);
    kit.add(new THREE.ConeGeometry(0.55, 3.4, 4), STONE2, x, y1 + 1.7, z);
  }
  gallery(kit, polygon(r + 0.2, 8, start), y1);
}

export function nieuweKerkToren() {
  const kit = new Kit();
  kit.box(2 * H, SQUARE, 2 * H, STONE, 0, SQUARE / 2, 0);
  // the corner buttresses: two to a corner, stepping in at the bands
  for (const [sx, sz] of CORNERS) for (const [y0, y1, d] of [[0, 18, 2.9], [18, 33, 2.1], [33, SQUARE - 1, 1.3]]) {
    kit.box(d, y1 - y0, 2.1, STONE2, sx * (H + d / 2), (y0 + y1) / 2, sz * (H - 1.05)).box(2.1, y1 - y0, d, STONE2, sx * (H - 1.05), (y0 + y1) / 2, sz * (H + d / 2));
    kit.add(new THREE.ConeGeometry(0.9, 1.4, 4).rotateY(Math.PI / 4), STONE2, sx * (H + d / 2), y1 + 0.7, sz * (H - 1.05));
  }
  square(H, H).forEach((p, f) => {
    const L = p.length, west = f === 3;
    // the stone bands between the storeys
    for (const y of [12, 18, 33]) wall(kit, p, [[0, y], [L, y], [L, y + 0.7], [0, y + 0.7]], { o0: 0, o1: 0.35, hex: STONE2 });
    // the doorway towards the Markt, the tall window over it; blind lancets on the other faces
    if (west) {
      wall(kit, p, pointedRing(L / 2, 4.4, 0, 9, 1, 8), { o0: 0, o1: 0.3, hex: STONE2 });
      wall(kit, p, pointedRing(L / 2, 3.6, 0, 8.2, 1, 8), { o0: 0.3, o1: 0.35, hex: '#3a2e26' });
      wall(kit, p, pointedRing(L / 2, 4.6, 19.6, 31.4, 1.1, 8), { o0: 0, o1: 0.15, hex: DARK });
      wall(kit, p, [[L / 2 - 0.12, 19.6], [L / 2 + 0.12, 19.6], [L / 2 + 0.12, 28], [L / 2 - 0.12, 28]], { o0: 0.15, o1: 0.3, hex: STONE2 });
    } else for (const s of [L * 0.32, L * 0.68]) wall(kit, p, pointedRing(s, 2.6, 19.6, 31.4, 1.1, 6), { o0: 0, o1: 0.2, hex: STONE2 });
    for (const s of [L * 0.25, L * 0.5, L * 0.75]) wall(kit, p, pointedRing(s, 1.8, 34.6, 44, 1.1, 6), { o0: 0, o1: 0.2, hex: s === L / 2 ? DARK : STONE2 });
    for (const s of [L * 0.25, L * 0.75]) if (!west) wall(kit, p, pointedRing(s, 1.6, 4, 11, 1, 5), { o0: 0, o1: 0.2, hex: STONE2 });
  });
  gallery(kit, square(H + 0.3), SQUARE, 0.9);
  // the four pinnacles on the corners of the square, flanking the first octagon
  for (const [sx, sz] of CORNERS) {
    const x = sx * (H - 1.1), z = sz * (H - 1.1);
    kit.box(2.2, 18, 2.2, STONE2, x, SQUARE + 9, z, 0, Math.PI / 4);
    for (const y of [SQUARE + 6, SQUARE + 12]) kit.box(2.5, 0.4, 2.5, STONE, x, y, z, 0, Math.PI / 4);
    kit.add(new THREE.ConeGeometry(1.4, 7, 4), STONE2, x, SQUARE + 21.5, z);
    kit.add(new THREE.SphereGeometry(0.3, 6, 4), STONE2, x, SQUARE + 25.2, z);
  }
  for (const [y0, y1, r] of OCT) octagon(kit, y0, y1, r);
  // the openwork spire: eight ribs with their crockets from the last gallery to the crown, rings of
  // tracery between them, and a slender dark shaft inside so the light shows through the openings
  const R = OCT[2][2] - 0.3, y0 = OCT[2][1] + 1.6, start = Math.PI / 8;
  const at = (k, t) => { const a = start + (k / 8) * 2 * Math.PI, r = R * (1 - t); return [r * Math.cos(a), y0 + (TOP - y0) * t, r * Math.sin(a)]; };
  kit.add(new THREE.ConeGeometry(R * 0.35, TOP - y0, 8), DARK, 0, (y0 + TOP) / 2, 0);
  for (let k = 0; k < 8; k++) {
    kit.rod(at(k, 0), at(k, 1), 0.32, STONE, 5);
    for (let t = 0.08; t < 0.95; t += 0.1) { const [x, y, z] = at(k, t); kit.box(0.5, 0.35, 0.5, STONE2, x * 1.08, y, z * 1.08); }
  }
  for (const t of [0.12, 0.3, 0.48, 0.64, 0.78]) for (let k = 0; k < 8; k++) kit.rod(at(k, t), at(k + 1, t), 0.16, STONE, 4);
  // the crown, the ball and the cross on top
  kit.add(new THREE.CylinderGeometry(0.9, 0.5, 1.2, 8), STONE2, 0, TOP - 0.4, 0);
  kit.add(new THREE.SphereGeometry(0.55, 8, 6), GOLD, 0, TOP + 0.6, 0);
  kit.rod([0, TOP + 1, 0], [0, TOP + 4, 0], 0.08, GOLD, 4).box(1.2, 0.12, 0.12, GOLD, 0, TOP + 3.1, 0);
  return kit.mesh(kitMat(0.9));
}

// riders bump into its buttresses; the church's porch on its north side stays the map's
export const NIEUWE_KERK = [{
  id: 'nieuwe-kerk-toren', name: 'Nieuwe Kerk', x: X, z: Z, turn: TURN, reach: 160,
  area: [onMap(X, Z, TURN, rect(-11.5, -11.5, 11.5, 10.6))],
  foot: [onMap(X, Z, TURN, rect(-H - 2.9, -H - 2.9, H + 2.9, H + 2.9))],
  make: nieuweKerkToren,
}];
