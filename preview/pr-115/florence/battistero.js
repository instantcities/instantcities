// The Baptistery of San Giovanni (11th-12th century) on Piazza San Giovanni, facing the Duomo,
// modelled by hand in place of the map's pieces of it, from its measurements and photos, in game
// metres (the real ones times 1.25), on the map's outline: an octagon 34 m across with the scarsella,
// its square apse, to the west. White marble from Carrara with green from Prato, in three registers:
//   at the bottom each face three tall panels between pilasters, under a cornice
//   in the middle three round arches on pilasters to each face, a window in each with a pediment
//   the attic, striped, and over it the low white pyramid of the roof and the lantern on top
//   striped pilasters at the corners, the whole height
//   the three bronze doors: Ghiberti's gilded Gates of Paradise to the east, towards the Duomo,
//     Andrea Pisano's to the south and Ghiberti's first pair to the north, in marble frames with
//     their bronze groups over them
// It stands on its own, so riders bump into it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, archRing, onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { MARBLE, VERDE, GLASS, sides, panel, inlay, lancet, prism, ngon, shell } from './marble.js';

const X = 171.1, Z = -338.8, TURN = 0.002; // the octagon's middle, and its east face turned from east (local +x)
const A = 21; // the octagon's apothem
const LOW = 16, MID = 27.5, ATTIC = 33.5, ROOF = 39.5, LANTERN = 46; // the registers' tops, the roof's top, the lantern's
const SC = [-A - 6, -8.2, -A + 1, 8.2]; // the scarsella: u0, v0, u1, v1
const STONE = shade(MARBLE, -0.06), BRONZE = '#6a5a3a', GOLD = '#c9a24a';

// the register of a face (or of the scarsella's sides) from s0 to s1
function registers(kit, path, s0, s1, top = ATTIC) {
  const len = s1 - s0, third = len / 3;
  // the bottom: three tall panels between pilasters
  inlay(kit, path, s0 + 0.6, s1 - 0.6, 1.4, LOW - 1.6, { cols: 3, rows: 1, w: 0.7 });
  for (let k = 0; k < 3; k++) inlay(kit, path, s0 + 0.6 + k * third + 1.2, s0 + (k + 1) * third - 1.8, 3, LOW - 3.4, { cols: 1, rows: 1, w: 0.3 });
  panel(kit, path, s0, s1, LOW - 1.6, LOW, STONE, 0, 0.6);
  panel(kit, path, s0, s1, LOW - 2.4, LOW - 1.6, VERDE, 0, 0.3);
  // the middle: three round arches on pilasters, each over a window with its pediment
  for (let k = 0; k < 3; k++) {
    const c = s0 + (k + 0.5) * third, w = third - 1.4;
    const out = archRing(c, w + 0.8, LOW + 0.2, MID - 1, 12), inn = archRing(c, w, LOW + 0.2, MID - 1.6, 12);
    wall(kit, path, [...out.slice(2), ...inn.slice(2).reverse()], { o0: 0, o1: 0.35, hex: VERDE });
    panel(kit, path, c - w / 2 - 0.4, c - w / 2 + 0.4, LOW + 0.2, MID - 1 - w / 2, VERDE, 0, 0.35);
    panel(kit, path, c + w / 2 - 0.4, c + w / 2 + 0.4, LOW + 0.2, MID - 1 - w / 2, VERDE, 0, 0.35);
    lancet(kit, path, c, 1.8, LOW + 3, LOW + 6.4, { frame: MARBLE, glass: GLASS, rim: 0.35, round: true, o: 0.1 });
    wall(kit, path, [[c - 1.8, LOW + 6.9], [c + 1.8, LOW + 6.9], [c, LOW + 8.3]], { o0: 0, o1: 0.45, hex: STONE });
  }
  if (top === MID) return;
  panel(kit, path, s0, s1, MID - 0.8, MID, STONE, 0, 0.6);
  // the attic's stripes
  for (let s = s0 + 0.6; s < s1 - 0.6; s += 1.2) panel(kit, path, s, s + 0.6, MID + 0.8, ATTIC - 1.4, VERDE, 0, 0.12);
  panel(kit, path, s0, s1, ATTIC - 1.2, ATTIC, STONE, 0, 0.8);
}

// a door with its marble frame and the bronze group over it: gilded for the Gates of Paradise
function door(kit, path, hex) {
  const c = path.length / 2;
  panel(kit, path, c - 3.6, c + 3.6, 1, 12.4, MARBLE, 0.3, 0.4);
  inlay(kit, path, c - 3.6, c + 3.6, 1, 12.4, { cols: 1, rows: 1, w: 0.6, o: 0.7 });
  panel(kit, path, c - 2.6, c + 2.6, 1, 11.2, hex, 0.7, 0.2);
  for (let k = 1; k < 5; k++) panel(kit, path, c - 2.6, c + 2.6, 1 + k * 2.04 - 0.1, 1 + k * 2.04 + 0.1, shade(hex, -0.2), 0.9, 0.05);
  panel(kit, path, c - 0.06, c + 0.06, 1, 11.2, shade(hex, -0.3), 0.9, 0.05);
  panel(kit, path, c - 4.2, c + 4.2, 12.4, 13.3, STONE, 0.3, 1.1);
  for (const d of [-1.6, 0, 1.6]) {
    const p = path.at(c + d), o = 1.1;
    kit.add(new THREE.CylinderGeometry(0.38, 0.5, 2.6, 6), BRONZE, p.x + o * p.tz, 14.6, p.z - o * p.tx);
  }
}

export function battistero() {
  const kit = new Kit();
  const ring = ngon(A, 8, Math.PI / 8);
  prism(kit, ngon(A + 1.4, 8, Math.PI / 8), 0, 0.5, shade(MARBLE, -0.14));
  prism(kit, ngon(A + 0.7, 8, Math.PI / 8), 0.5, 1, shade(MARBLE, -0.1));
  for (const path of sides(ring)) {
    const len = path.length, m = path.at(len / 2);
    wall(kit, path, [[0, 1], [len, 1], [len, ATTIC], [0, ATTIC]], { o0: -2.4, o1: 0, hex: MARBLE });
    registers(kit, path, 0.9, len - 0.9);
    const nx = m.tz, nz = -m.tx; // its outward normal
    if (nx > 0.9) door(kit, path, GOLD); // east, the Gates of Paradise
    else if (Math.abs(nz) > 0.9) door(kit, path, BRONZE); // north and south
  }
  // the striped pilasters at the corners
  for (const [x, z] of ring) {
    const t = Math.atan2(z, x), px = x + 0.3 * Math.cos(t), pz = z + 0.3 * Math.sin(t);
    for (let y = 1; y < ATTIC; y += 1.6) kit.box(2, 0.8, 2, VERDE, px, y + 0.4, pz, 0, -t).box(2, 0.8, 2, MARBLE, px, y + 1.2, pz, 0, -t);
  }
  // the scarsella to the west, up to the middle register, with its sloping roof
  const [u0, v0, u1, v1] = SC;
  const sc = sides([[u1, v0], [u0, v0], [u0, v1], [u1, v1]]).slice(0, 3); // without its side against the octagon
  for (const path of sc) {
    wall(kit, path, [[0, 1], [path.length, 1], [path.length, MID], [0, MID]], { o0: -1.6, o1: 0, hex: MARBLE });
    registers(kit, path, 0.5, path.length - 0.5, MID);
    panel(kit, path, 0, path.length, MID - 0.8, MID, STONE, 0, 0.6);
  }
  prism(kit, [[u0 - 0.5, v0 - 0.5], [u1, v0 - 0.5], [u1, v1 + 0.5], [u0 - 0.5, v1 + 0.5]], MID, MID + 0.6, STONE);
  const lean = new THREE.Shape([new THREE.Vector2(u0 - 0.5, 0), new THREE.Vector2(u1 + 0.5, 0), new THREE.Vector2(u1 + 0.5, 3.2)]);
  kit.add(new THREE.ExtrudeGeometry(lean, { depth: v1 - v0 + 1, bevelEnabled: false }), STONE, 0, MID + 0.6, v0 - 0.5);
  // the roof: the cornice, the low white pyramid, the lantern with its columns, its cone and ball
  shell(kit, [[A + 0.9, ATTIC], [A - 0.2, ATTIC], [A - 0.2, ATTIC + 0.4], [4.6, ROOF], [3.4, ROOF]], MARBLE);
  for (let k = 0; k < 8; k++) {
    const t = Math.PI / 8 + (k / 8) * 2 * Math.PI, R = (A - 0.2) / Math.cos(Math.PI / 8);
    kit.rod([R * Math.cos(t), ATTIC + 0.4, R * Math.sin(t)], [4.6 / Math.cos(Math.PI / 8) * Math.cos(t), ROOF, 4.6 / Math.cos(Math.PI / 8) * Math.sin(t)], 0.35, STONE, 4);
  }
  shell(kit, [[3.4, ROOF], [3.4, ROOF + 0.6], [2.9, ROOF + 0.6], [2.9, LANTERN - 2.2], [3.5, LANTERN - 2.2], [3.5, LANTERN - 1.6], [1, LANTERN], [0, LANTERN + 0.2]], MARBLE);
  for (let k = 0; k < 8; k++) {
    const t = (k / 8) * 2 * Math.PI;
    kit.add(new THREE.CylinderGeometry(0.22, 0.22, LANTERN - ROOF - 2.8, 6), STONE, 3.2 * Math.cos(t), (ROOF + LANTERN - 1.6) / 2, 3.2 * Math.sin(t));
  }
  kit.add(new THREE.SphereGeometry(0.7, 10, 8), GOLD, 0, LANTERN + 0.8, 0);
  kit.box(0.2, 2, 0.2, GOLD, 0, LANTERN + 2.3, 0).box(0.2, 0.2, 1.1, GOLD, 0, LANTERN + 2.7, 0);
  return kit.mesh(kitMat(0.85));
}

// it stands in for the map's pieces of it (area), and riders bump into the octagon and the scarsella (foot)
const OCT = onMap(X, Z, TURN, ngon(A + 1.4, 8, Math.PI / 8)), APSE = onMap(X, Z, TURN, [[SC[0], SC[1]], [SC[2], SC[1]], [SC[2], SC[3]], [SC[0], SC[3]]]);
export const BATTISTERO = [{
  id: 'battistero', name: 'Battistero di San Giovanni', x: X, z: Z, turn: TURN, reach: 110, area: [OCT, APSE], foot: [OCT, APSE],
  make: battistero,
}];
