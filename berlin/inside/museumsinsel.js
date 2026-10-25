// Two buildings on Berlin's Museum Island, each a few of its key rooms rather than its real plan.
// The Neues Museum as David Chipperfield rebuilt it (2009): the grand stair hall in raw brick and
// pale concrete, the Egyptian courtyard, and the north dome room, where the bust of Nefertiti stands
// alone in her case. The Pergamon Museum: the hall of the Pergamon Altar, its stair and colonnade
// and the gods' battle frieze, and the Ishtar Gate of Babylon in blue glazed brick with the
// Processional Way before it.
//
// Game metres, x across and z along; each building's door out at -z.
import * as THREE from 'three';
import { Parts, floorMat } from '../../core/js/inside/gothic.js';
import { hall, skylight, framed, bench, plinth, rope, vitrine, roundWall, visitors, crowd } from '../../core/js/inside/rooms.js';
import { frieze, ishtar, egyptWall } from '../../core/js/inside/art.js';
import { nefertiti, pergamonAltar, sarcophagus, roman, ramesses } from '../../core/js/inside/statues.js';
import { plaque } from '../../core/js/inside/pictures.js';

const TINT = { stone: 0xc8a888, pier: 0xb89878, vault: 0xe8e0d4, rib: 0xd0c4b0, wall: 0xc8b8a0 };
const BRICK = 0xb08a6a, CONCRETE = 0xd8d4cc;

// ------------------------------------------------------------------ the Neues Museum

export const NEUES_SIZE = [-12, -18, 36, 33];

export function makeNeuesMuseum() {
  const p = new Parts(TINT), g = new THREE.Group();
  // ---- the stair hall: brick walls, the concrete stair rising up the middle to the landing
  {
    const H = { x0: -10, z0: -16, x1: 10, z1: 10, h: 20 };
    p.floor(H.x0, H.z0, H.x1, H.z1, floorMat('#d8d4cc', '#c8c4bc', false, 2.4));
    hall(p, { ...H, color: BRICK, doors: { s: [[10, 4, 5]], n: [[10, 5, 6]], e: [[18, 5, 6]] } });
    skylight(p, H.x0, H.z0, H.x1, H.z1, H.h, { color: CONCRETE, glass: 0.5 });
    for (const s of [-1, 1]) p.dark.box(1.9, 5, 0.14, 0x2a2622, s * 1, 2.5, H.z0 - 0.1);
    p.wallRing([-2, H.z0], [2, H.z0], 0.4);
    const top = 7, z0 = -9, z1 = 3;
    for (let q = 0; q < 16; q++) { const z = z0 + ((z1 - z0) * q) / 16; p.stone.box(7, (top * (q + 1)) / 16, (z1 - z0) / 16 + 0.02, CONCRETE, 0, (top * (q + 1)) / 16 / 2, z + (z1 - z0) / 32); }
    for (const s of [-1, 1]) p.stone.box(0.5, top + 1, z1 - z0, CONCRETE, s * 3.7, (top + 1) / 2, (z0 + z1) / 2);
    p.block(0, (z0 + z1) / 2, 4, (z1 - z0) / 2);
    p.picture(plaque(['NEUES MUSEUM'], 640, 160), 5, 1.25, 0, 9, H.z0 + 0.47, 0);
    g.add(visitors([[-6, -12, 0.4], [6, -10, -0.5], [-5, 6, 2.6], [5, 7, -2.8]], 111));
  }
  // ---- the north dome room: round, under its dome, Nefertiti alone in her case in the middle
  {
    const x = 0, z = 22, r = 9.5, h = 10;
    p.floor(x - r, z - r, x + r, z + r, floorMat('#d8d0c0', '#c8c0b0', false, 1.6));
    const gap = Math.asin(2.6 / r);
    p.stone.add(new THREE.CylinderGeometry(r, r, h, 40, 1, true, Math.PI + gap, Math.PI * 2 - 2 * gap).translate(0, h / 2, 0), 0xc8b8a0, x, 0, z);
    p.stone.add(new THREE.CylinderGeometry(r, r, h - 6, 8, 1, true, Math.PI - gap, 2 * gap).translate(0, 6 + (h - 6) / 2, 0), 0xc8b8a0, x, 0, z);
    roundWall(p, x, z, r, 36, [[Math.PI - gap, Math.PI + gap]]);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 36, 10, 0, Math.PI * 2, 0.18, Math.PI / 2 - 0.18), new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.9, side: THREE.DoubleSide }));
    dome.position.set(x, h, z);
    g.add(dome);
    p.daylight.add(new THREE.CircleGeometry(r * Math.sin(0.18), 20).rotateX(Math.PI / 2), 0xf6f2e6, x, h + r * Math.cos(0.18) - 0.05, z);
    p.floor(-2.6, 10, 2.6, z - r + 0.5, floorMat('#d8d0c0', '#c8c0b0', false, 1.6));
    for (const s of [-1, 1]) p.rectWall([s * 2.6, 10.4], [s * 2.6, z - r + 0.6], { y1: 6, color: BRICK }); // the passage from the stair hall
    const base = vitrine(p, x, z, 1.6, 1.6, 2.8, 1.2);
    nefertiti(p, x, base, z, Math.PI, 2.2);
    rope(p, [x - 3, z - 3.2], [x + 3, z - 3.2]);
    g.add(crowd(x, z, 10, 3.6, 6.5, Math.PI * 0.55, Math.PI * 1.45, 113));
  }
  // ---- the Egyptian courtyard: sandstone reliefs, sarcophagi, Ramesses, statues of the gods
  {
    const C = { x0: 10.9, z0: -8, x1: 34, z1: 12, h: 12 };
    p.floor(C.x0, C.z0, C.x1, C.z1, floorMat('#d8c8a8', '#c8b898', false, 2));
    hall(p, { ...C, color: 0xd8c4a0, doors: { w: [[2 - C.z0, 5, 6]] } });
    skylight(p, C.x0, C.z0, C.x1, C.z1, C.h, { color: 0xe8e0d0, glass: 0.6 });
    const relief = egyptWall();
    relief.repeat.set(4, 1);
    for (const [z, ry] of [[C.z0 + 0.47, 0], [C.z1 - 0.47, Math.PI]]) p.picture(relief, C.x1 - C.x0 - 2, 3, (C.x0 + C.x1) / 2, 7.5, z, ry);
    sarcophagus(p, 20, -3, Math.PI / 2); sarcophagus(p, 27, 6, Math.PI / 2, 1.25, 0x3a3a3e);
    ramesses(p, 31, -2, -Math.PI / 2, 1.1);
    for (const x of [16, 24]) { const h = plinth(p, x, C.z1 - 2, 1.4, 1.4, 1.0, 0x5a5a5e); roman(p, x, h, C.z1 - 2, 2.2, Math.PI, 1); }
  }
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: -16 + 1.6 } };
}

// ------------------------------------------------------------------ the Pergamon Museum

export const PERGAMON_SIZE = [-24, -16, 24, 56];

export function makePergamon() {
  const p = new Parts(TINT), g = new THREE.Group();
  // ---- the altar hall: the altar's front on the far side of the room, its frieze round the walls
  {
    const H = { x0: -22, z0: -14, x1: 22, z1: 30, h: 20 };
    p.floor(H.x0, H.z0, H.x1, H.z1, floorMat('#c8c0b0', '#b8b0a0', false, 2.6));
    hall(p, { ...H, color: 0xc8b8a0, doors: { s: [[22, 4, 5]], n: [[22, 7, 9]] } });
    skylight(p, H.x0, H.z0, H.x1, H.z1, H.h, { color: 0xe0d8c8, glass: 0.6 });
    for (const s of [-1, 1]) p.dark.box(1.9, 5, 0.14, 0x2a2622, s * 1, 2.5, H.z0 - 0.1);
    p.wallRing([-2, H.z0], [2, H.z0], 0.4);
    pergamonAltar(p, 0, -2, 30, 0); // (narrower than the room, so you can walk round it to the gate)
    const strip = frieze();
    strip.repeat.set(4, 1);
    for (const [x, ry] of [[H.x0 + 0.47, Math.PI / 2], [H.x1 - 0.47, -Math.PI / 2]]) p.picture(strip, H.z1 - H.z0 - 2, 2.6, x, 3.4, (H.z0 + H.z1) / 2, ry);
    p.picture(plaque(['PERGAMONMUSEUM'], 640, 160), 5, 1.25, 0, 8, H.z0 + 0.47, 0);
    g.add(visitors([[-8, -10, 0.2], [6, -9, -0.3], [-14, -6, 0.6], [12, -4, -0.8], [0, -8, 0], [-3, -11, 0.1]], 117));
  }
  // ---- the Ishtar Gate: the walls of the Processional Way in blue brick with their lions, and the
  // gate itself across the end, its arch the way through
  {
    const W = { x0: -14, z0: 30.9, x1: 14, z1: 54, h: 18 };
    p.floor(W.x0, W.z0, W.x1, W.z1, floorMat('#b8a888', '#a89878', false, 1.4));
    hall(p, { ...W, color: 0x2a4a8a, doors: { s: [[14, 7, 9]] } });
    skylight(p, W.x0, W.z0, W.x1, W.z1, W.h, { color: 0xd8d0c0, glass: 0.5 });
    const brick = ishtar();
    brick.repeat.set(3, 1);
    for (const [x, ry] of [[W.x0 + 0.47, Math.PI / 2], [W.x1 - 0.47, -Math.PI / 2]]) p.picture(brick, W.z1 - W.z0 - 1, 6, x, 4, (W.z0 + W.z1) / 2, ry);
    // the gate: two towers and the arch between, blue, a band of aurochs and dragons, crenellations
    const gz = W.z1 - 3;
    for (const s of [-1, 1]) { p.stone.box(8, 15, 4, 0x2a4a8a, s * 8, 7.5, gz); p.picture(brick, 7.8, 6, s * 8, 6, gz - 2.05, 0); p.block(s * 8, gz, 4.1, 2.1); }
    p.stone.box(8, 5, 4, 0x2a4a8a, 0, 12.5, gz);
    p.picture(brick, 7.8, 4.5, 0, 12.5, gz - 2.05, 0);
    p.dark.box(8, 10, 0.2, 0x141820, 0, 5, gz + 1.9);
    for (let k = -9; k <= 9; k++) p.stone.box(1, 1.2, 4, 0x2a4a8a, k * 1.9, 15.6, gz);
    p.block(0, gz + 1.9, 4, 0.3);
    g.add(crowd(0, gz - 2, 12, 5, 11, Math.PI * 0.6, Math.PI * 1.4, 119));
  }
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: -14 + 1.6 } };
}
