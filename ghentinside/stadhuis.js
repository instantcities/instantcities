// The Stadhuis from the inside, modelled by hand and simplified, as three halls in a row: the
// entrance hall with its pillars, the Pacificatiezaal under its coffered oak ceiling, with the
// council table, the great fireplace and the tapestries, where the Pacification of Ghent was signed
// in 1576, and the wedding hall at the back, with a wedding going on.
import * as THREE from 'three';
import { Parts, floorMat, archOutline } from './gothic.js';
import { saint, chandelier, candelabra, chairs } from './props.js';
import { darkPainting } from './lamgods.js';
import { tapestry, plaque, arms } from './pictures.js';
import { wedding } from '../ghent/wedding.js';

const GOLD = 0xd2a94a, OAK = 0x7a4f2a, OAK_DARK = 0x4a2f1c, RED = 0x7a1f2b;

const TINT = { stone: 0xe6dcc6, pier: 0xe4dccb, vault: 0xf2ecde, rib: 0xd9cfba, wall: 0xe6dcc6 };

// the walls of the three rooms: from z = -26 to -12 the entrance hall (x ±10, 8 high), -12 to 12 the
// Pacificatiezaal (x ±13, 10.5 high), 12 to 28 the wedding hall (x ±9, 8 high)
const V = { x: 10, z0: -26, z1: -12, h: 8 }, H = { x: 13, z0: -12, z1: 12, h: 10.5 }, T = { x: 9, z0: 12, z1: 28, h: 8 };

// a tall window in a wall: arched, clear leaded glass
const win = (u0, u1, y0, y1) => archOutline(u0, u1, y0, y1 - (u1 - u0) * 0.5, (u1 - u0) * 0.5, 8, 0.2);

export function makeStadhuis() {
  const p = new Parts(TINT);

  // ---- floors
  p.floor(-V.x, V.z0, V.x, V.z1, floorMat('#e8e4da', '#26242a', false, 2));
  p.floor(-H.x, H.z0, H.x, H.z1, floorMat('#a9774a', '#8e6038', true, 1.2));
  p.floor(-T.x, T.z0, T.x, T.z1, floorMat('#cdbd9c', '#b8a681', false, 1.6));

  // ---- the walls
  const wallOf = (a, b, room, color, holes = [], panes = [], solid = true) => p.rectWall(a, b, { y1: room.h + 0.3, holes, panes, color, solid });
  const doorway = (u, w = 2.2) => archOutline(u - w, u + w, 0, 4.2, 1.8, 8, 0.4);
  // the entrance hall: the door out in the south wall, windows each side of it and in the side walls
  wallOf([-V.x, V.z0], [V.x, V.z0], V, 0xe6dcc6, [doorway(V.x), win(2, 4.6, 2.4, 6.6), win(15.4, 18, 2.4, 6.6)], [[1, 5], [2, 5]]);
  p.doors([-V.x, V.z0], [V.x, V.z0], V.x - 2.0, V.x + 2.0, 4.2, 1.8);
  for (const s of [-1, 1]) wallOf([s * V.x, V.z0], [s * V.x, V.z1], V, 0xe6dcc6, [win(2.6, 5.2, 2.4, 6.6), win(8.8, 11.4, 2.4, 6.6)], [[0, 5], [1, 5]]);
  // between it and the hall: a double doorway
  p.rectWall([-H.x, H.z0], [H.x, H.z0], { y1: H.h + 0.3, holes: [doorway(H.x, 2.4)], color: 0xcdb98c, solid: false });
  // the Pacificatiezaal: four tall windows in the west wall, fireplace and tapestries on the east wall
  wallOf([-H.x, H.z0], [-H.x, H.z1], H, 0xcdb98c, [-9, -3, 3, 9].map(z => win(z + 12 - 1.4, z + 12 + 1.4, 2.4, 9.0)), [[0, 5], [1, 5], [2, 5], [3, 5]]);
  wallOf([H.x, H.z0], [H.x, H.z1], H, 0xcdb98c, [win(1.2, 3.4, 2.4, 8.6), win(20.6, 22.8, 2.4, 8.6)], [[0, 5], [1, 5]]);
  // between it and the wedding hall: a double doorway
  p.rectWall([-H.x, H.z1], [H.x, H.z1], { y1: H.h + 0.3, holes: [doorway(H.x, 2.4)], color: 0xcdb98c, solid: false });
  // the wedding hall
  for (const s of [-1, 1]) wallOf([s * T.x, T.z0], [s * T.x, T.z1], T, 0xe9d9c0, [win(2.2, 4.8, 2.4, 6.6), win(11.2, 13.8, 2.4, 6.6)], [[0, 6], [1, 6]]);
  wallOf([-T.x, T.z1], [T.x, T.z1], T, 0xe9d9c0);
  // the doorways are open: only their sides stop riders (the wall above them does not)
  for (const z of [H.z0, H.z1]) {
    p.wallRing([-H.x, z], [-2.4, z], 0.9);
    p.wallRing([2.4, z], [H.x, z], 0.9);
  }

  // ---- ceilings: white beams and plaster in the two lower halls, oak and gold in the Pacificatiezaal
  p.ceiling(-V.x, V.z0, V.x, V.z1, V.h, { color: 0xf4efe2, beam: 0xe2d8c4, bx: 5, bz: 4.67, w: 0.4 });
  p.ceiling(-H.x, H.z0, H.x, H.z1, H.h, { color: 0x6a4426, beam: OAK_DARK, bx: 4.33, bz: 4, w: 0.6, drop: 0.6 });
  p.ceiling(-T.x, T.z0, T.x, T.z1, T.h, { color: 0xf6f0e4, beam: 0xe6dcc6, bx: 4.5, bz: 4, w: 0.4 });

  // ---- wainscot: oak panelling along the Pacificatiezaal's walls, 2.4 m high
  const wain = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(x1 - x0, z1 - z0);
    p.wood.box(0.16, 2.4, L, OAK, (x0 + x1) / 2, 1.2, (z0 + z1) / 2, 0, ang + Math.PI / 2, 0);
    p.wood.box(0.22, 0.14, L, OAK_DARK, (x0 + x1) / 2, 2.45, (z0 + z1) / 2, 0, ang + Math.PI / 2, 0);
  };
  wain(-H.x + 0.52, H.z0 + 0.5, -H.x + 0.52, H.z1 - 0.5);
  wain(H.x - 0.52, H.z0 + 0.5, H.x - 0.52, H.z1 - 0.5);
  wain(-H.x + 0.5, H.z0 + 0.52, -2.9, H.z0 + 0.52); wain(2.9, H.z0 + 0.52, H.x - 0.5, H.z0 + 0.52);
  wain(-H.x + 0.5, H.z1 - 0.52, -2.9, H.z1 - 0.52); wain(2.9, H.z1 - 0.52, H.x - 0.5, H.z1 - 0.52);

  // ---- the entrance hall: four pillars, two statues each side of the door, red banners
  for (const [x, z] of [[-5.2, -22], [5.2, -22], [-5.2, -16], [5.2, -16]]) p.column(x, z, 0.85, 6.9);
  for (const s of [-1, 1]) {
    p.stone.box(1.2, 0.9, 1.2, 0xd2cab8, s * 7.6, 0.45, -24.4);
    saint(p, s * 7.6, 0.9, -24.4, 1.5, 0, { robe: 0xf0ece2, halo: false });
    p.block(s * 7.6, -24.4, 0.7);
    p.dark.box(1.8, 4.6, 0.08, 0x8a1f2b, s * 7.0, 4.4, V.z1 - 0.5);
    p.gold.box(1.95, 0.14, 0.12, GOLD, s * 7.0, 6.8, V.z1 - 0.5);
    p.gold.box(1.95, 0.14, 0.12, GOLD, s * 7.0, 2.1, V.z1 - 0.5);
  }
  p.picture(plaque(['STADHUIS', 'GENT'], 640, 256), 4.6, 1.8, 0, 6.4, V.z1 - 0.52, Math.PI);
  chandelier(p, 0, 5.2, -19, 1.5, V.h, 14);

  // ---- the Pacificatiezaal: the long council table with its chairs, the fireplace, tapestries, paintings, chandeliers
  {
    p.wood.box(3.2, 0.16, 16.4, OAK, 0, 1.05, 0);
    p.dark.box(2.2, 0.03, 15.0, 0x6b1a24, 0, 1.15, 0); // a red cloth down the middle
    for (const dx of [-1.3, 1.3]) for (const dz of [-7.4, -2.5, 2.5, 7.4]) p.wood.box(0.25, 1.0, 0.25, OAK_DARK, dx, 0.5, dz);
    for (let q = 0; q < 8; q++) for (const s of [-1, 1]) {
      const z = -7 + q * 2, x = s * 2.3;
      p.wood.box(0.75, 0.1, 0.7, OAK, x, 0.65, z);
      p.dark.box(0.08, 1.5, 0.7, RED, x + s * 0.36, 1.3, z);
      p.gold.box(0.12, 0.1, 0.74, GOLD, x + s * 0.36, 2.1, z);
      for (const [lx, lz] of [[-0.3, -0.28], [0.3, -0.28], [-0.3, 0.28], [0.3, 0.28]]) p.wood.box(0.07, 0.65, 0.07, OAK_DARK, x + lx, 0.33, z + lz);
    }
    for (const s of [-1, 1]) {
      const z = s * 8.9;
      p.wood.box(0.8, 0.1, 0.8, OAK, 0, 0.65, z);
      p.dark.box(0.8, 1.7, 0.08, RED, 0, 1.4, z + s * 0.38);
    }
    p.block(0, 0, 3.4, 9.4);
    for (const z of [-7, 0, 7]) chandelier(p, 0, 7.4, z, 2.0, H.h, 18);
    // the fireplace in the east wall: stone jambs, a lintel and a mantel shelf under a carved overmantel
    const fx = H.x - 0.5;
    p.stone.box(1.8, 4.6, 1.1, 0xd8cdb0, fx - 0.5, 2.3, -2.3);
    p.stone.box(1.8, 4.6, 1.1, 0xd8cdb0, fx - 0.5, 2.3, 2.3);
    p.stone.box(2.0, 1.1, 5.7, 0xd8cdb0, fx - 0.5, 5.15, 0);
    p.stone.box(2.4, 0.3, 6.6, 0xe6dcc0, fx - 0.7, 5.85, 0);
    p.dark.box(0.3, 4.6, 3.6, 0x14100e, fx + 0.15, 2.3, 0);
    p.stone.box(1.6, 0.25, 3.8, 0x9a948a, fx - 0.5, 0.15, 0);
    for (let q = 0; q < 6; q++) p.glow.add(new THREE.ConeGeometry(0.28 + (q % 3) * 0.07, 0.9 + (q % 2) * 0.5, 5), 0xff9a2a, fx - 0.3, 0.7, -1.2 + q * 0.48);
    p.picture(arms(), 3.0, 3.5, fx + 0.06, 8.1, 0, -Math.PI / 2);
    for (const s of [-1, 1]) { p.stone.box(1.0, 0.9, 1.0, 0xd2cab8, fx - 0.6, 0.45, s * 5.0); saint(p, fx - 0.6, 0.9, s * 5.0, 1.5, -Math.PI / 2, { halo: false, robe: 0xf0ece2 }); p.block(fx - 0.6, s * 5.0, 0.6); }
    p.block(fx - 0.6, 0, 1.2, 3.5);
    // tapestries each side of it, paintings on the other walls, the plaque over the door to the wedding hall
    p.picture(tapestry(3, '#1f3a5a'), 6.4, 4.2, H.x - 0.52, 5.4, -8.4, -Math.PI / 2);
    p.picture(tapestry(5, '#5a1f26'), 6.4, 4.2, H.x - 0.52, 5.4, 8.4, -Math.PI / 2);
    for (const s of [-1, 1]) {
      p.picture(darkPainting(1576 + s), 5.4, 3.7, s * 8.2, 5.6, H.z0 + 0.52, 0);
      p.picture(darkPainting(1456 + s), 5.4, 3.7, s * 8.2, 5.6, H.z1 - 0.52, Math.PI);
    }
    p.picture(plaque(['PACIFICATIE VAN GENT', '8 november 1576'], 768, 288), 6.4, 2.4, 0, 8.4, H.z1 - 0.52, Math.PI);
    p.picture(plaque(['PACIFICATIEZAAL'], 640, 160), 4.8, 1.2, 0, 8.4, H.z0 + 0.52, 0);
    for (const s of [-1, 1]) candelabra(p, s * 11.4, -9.5, 3.4);
  }

  // ---- the wedding hall: a red carpet, chairs each side, the registrar's table before the city's arms, a wedding in front of it
  {
    p.dark.box(3.4, 0.04, 15.2, 0x8a1f2b, 0, 0.09, 19.6);
    p.gold.box(0.12, 0.05, 15.2, GOLD, -1.78, 0.1, 19.6);
    p.gold.box(0.12, 0.05, 15.2, GOLD, 1.78, 0.1, 19.6);
    chairs(p, -6.2, T.z0 + 2.2, 4, 5);
    chairs(p, 2.6, T.z0 + 2.2, 4, 5);
    p.wood.box(5.6, 0.16, 1.5, OAK, 0, 1.1, 25.7);
    p.marble.box(5.6, 1.0, 1.3, 0xf4f0e6, 0, 0.6, 25.7);
    p.block(0, 25.7, 2.9, 0.9);
    for (const x of [-1.6, 0, 1.6]) { p.wood.box(0.8, 0.1, 0.8, OAK, x, 0.7, 27.0); p.dark.box(0.8, 1.7, 0.08, RED, x, 1.5, 27.4); }
    p.picture(arms(), 3.4, 4.0, 0, 5.4, T.z1 - 0.52, Math.PI);
    p.picture(plaque(['TROUWZAAL'], 640, 160), 4.0, 1.0, 0, 7.3, T.z1 - 0.52, Math.PI);
    // flags on poles beside the arms, flowers in tall pots
    for (const [s, c1, c2] of [[-1, 0xe8c04a, 0x1a1612], [1, 0xa3202c, 0xf4efe2]]) {
      p.gold.rod([s * 5.6, 0, 26.8], [s * 5.6, 6.6, 26.8], 0.07, GOLD, 5);
      p.dark.box(0.06, 1.7, 2.1, c1, s * 5.6, 5.5, 26.8 - 1.1);
      p.dark.box(0.07, 0.5, 2.1, c2, s * 5.6, 4.5, 26.8 - 1.1);
    }
    for (const x of [-3.6, 3.6]) {
      p.marble.add(new THREE.CylinderGeometry(0.45, 0.35, 1.5, 8).translate(0, 0.75, 0), 0xd8d2c4, x, 0, 26.8);
      for (let q = 0; q < 9; q++) p.glow.add(new THREE.SphereGeometry(0.28, 5, 4), [0xf4a7b9, 0xffffff, 0xf2d3d8][q % 3], x + Math.cos(q) * 0.45, 2.0 + (q % 3) * 0.25, 26.8 + Math.sin(q) * 0.45);
      p.block(x, 26.8, 0.5);
    }
    for (const z of [17, 24]) chandelier(p, 0, 6.2, z, 1.6, T.h, 14);
  }

  const g = new THREE.Group();
  g.add(p.mesh());
  // the wedding party in front of the registrar's table, turned to face the chairs
  const party = wedding();
  party.position.set(0, 0.07, 23.4);
  party.rotation.y = Math.PI;
  g.add(party);
  p.block(0, 22.2, 3.0, 2.2);
  return { group: g, foot: p.foot, door: { x: 0, z: V.z0 + 1.5 } };
}
