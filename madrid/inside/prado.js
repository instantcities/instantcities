// The Prado from the inside, as four of its key rooms rather than its real plan: the Velázquez
// entrance hall, the long Central Gallery under its skylit vault with Titian and Rubens, the
// Velázquez room with Las Meninas, the dark room of Goya's Black Paintings with Saturn, and the
// Bosch room with the Garden of Earthly Delights.
//
// Game metres, x across and z along; the door out at -z.
import * as THREE from 'three';
import { Parts, floorMat } from '../../core/js/inside/gothic.js';
import { hall, skylight, barrel, framed, bench, rope, visitors, crowd, wanderers } from '../../core/js/inside/rooms.js';
import { lasMeninas, saturn, gardenOfDelights, oldMaster, masterSize } from '../../core/js/inside/art.js';
import { roman } from '../../core/js/inside/statues.js';
import { plinth } from '../../core/js/inside/rooms.js';
import { plaque } from '../../core/js/inside/pictures.js';

const TINT = { stone: 0xd8ccb4, pier: 0xc8b898, vault: 0xf2ecde, rib: 0xd9cfba, wall: 0xe0d6c2 };
const OCHRE = 0x8a6a4a, DARK = 0x2a2624, GREEN = 0x4a5a48;

export const ENTRY = { x0: -10, z0: -12, x1: 10, z1: 0, h: 10 };
const CENTRAL = { x0: -7, z0: 0.9, x1: 7, z1: 80, h: 11 };
const VELAZQUEZ = { x0: -30, z0: 30, x1: -7.9, z1: 50, h: 11 };
const GOYA = { x0: 7.9, z0: 12, x1: 26, z1: 28, h: 7 };
const BOSCH = { x0: 7.9, z0: 52, x1: 26, z1: 68, h: 8 };

export function makePrado() {
  const p = new Parts(TINT), g = new THREE.Group();
  const floor = floorMat('#8a5a32', '#7a4e2a', true, 0.55);

  {
    const E = ENTRY;
    p.floor(E.x0, E.z0, E.x1, E.z1, floorMat('#e0d4bc', '#a89a84', false, 2));
    hall(p, { ...E, color: 0xe8e0d0, doors: { s: [[10, 4, 5]], n: [[10, 6, 7]] } });
    p.ceiling(E.x0, E.z0, E.x1, E.z1, E.h, { color: 0xf2ecde, beam: 0xd8cfbd, bx: 5, bz: 4, w: 0.6 });
    for (const s of [-1, 1]) p.dark.box(1.9, 5, 0.14, 0x2a2622, s * 1, 2.5, E.z0 - 0.1);
    p.wallRing([-2, E.z0], [2, E.z0], 0.4);
    p.picture(plaque(['MUSEO NACIONAL DEL PRADO'], 768, 160), 6.6, 1.4, 0, 7.6, E.z1 - 0.47, Math.PI);
    for (const s of [-1, 1]) { const h = plinth(p, s * 6, -6, 1.4, 1.4, 1.2); roman(p, s * 6, h, -6, 2.3, -s * Math.PI / 2, 2); }
  }
  {
    const C = CENTRAL;
    p.floor(C.x0, C.z0, C.x1, C.z1, floor);
    hall(p, { ...C, color: OCHRE, doors: { s: [[7, 6, 7]], w: [[40 - C.z0, 5, 6]], e: [[20 - C.z0, 4, 6], [60 - C.z0, 4, 6]] } });
    barrel(p, C.x0, C.z0, C.x1, C.z1, C.h, 4.5, { color: 0xf2ecde, band: 0xd8cfbd, bay: 9.9, skylight: 0.35 });
    let seed = 900;
    for (const [x, ry, doors] of [[C.x0 + 0.47, Math.PI / 2, [40]], [C.x1 - 0.47, -Math.PI / 2, [20, 60]]]) for (let z = C.z0 + 4; z < C.z1 - 3; z += 6) {
      if (doors.some(d => Math.abs(z - d) < 4)) continue;
      const sd = seed++, [w, h] = masterSize(sd);
      framed(p, oldMaster(sd), w * 1.3, h * 1.3, x, 3.8, z, ry);
    }
    for (let z = 10; z < 78; z += 16) { const h = plinth(p, 0, z, 1.2, 1.2, 1.0); roman(p, 0, h, z, 2.0, z % 32 < 16 ? 0 : Math.PI, z); }
    g.add(visitors([[2, 8, 1.4], [-3, 24, -1.6], [3, 36, 1.5], [-2, 52, -1.5], [1, 70, 0]], 101));
  }
  {
    const V = VELAZQUEZ;
    p.floor(V.x0, V.z0, V.x1, V.z1, floor);
    hall(p, { ...V, color: 0x8a3a2a, doors: { e: [[40 - V.z0, 5, 6]] } });
    skylight(p, V.x0, V.z0, V.x1, V.z1, V.h, { color: 0xe8e4dc, along: 'x', glass: 0.5 });
    framed(p, lasMeninas(), 3.45, 4.0, V.x0 + 0.47, 3.6, 40, Math.PI / 2, { f: 0.35 });
    for (const [z, ry] of [[V.z0 + 0.47, 0], [V.z1 - 0.47, Math.PI]]) for (const x of [-24, -14]) framed(p, oldMaster(5 * (Math.abs(x) + (ry ? 1 : 0))), 2.2, 2.9, x, 3.6, z, ry);
    rope(p, [V.x0 + 3, 36], [V.x0 + 3, 44]);
    bench(p, -16, 40, 4, Math.PI / 2);
    g.add(crowd(V.x0, 40, 10, 4, 8, Math.PI * 0.15, Math.PI * 0.85, 103));
  }
  {
    const G = GOYA;
    p.floor(G.x0, G.z0, G.x1, G.z1, floorMat('#5a4a3a', '#4a3a2a', false, 1));
    hall(p, { ...G, color: DARK, doors: { w: [[20 - G.z0, 4, 6]] } });
    p.ceiling(G.x0, G.z0, G.x1, G.z1, G.h, { color: 0x3a3634, beam: 0x2a2624, bx: 6, bz: 6, w: 0.3, rosettes: false });
    framed(p, saturn(), 1.46 * 1.25, 0.83 * 1.25 * 520 / 320 * 1.1, G.x1 - 0.47, 2.8, 20, -Math.PI / 2, { f: 0.12, color: 0x3a2a1a });
    for (const [x, z, ry] of [[(G.x0 + G.x1) / 2 - 4, G.z0 + 0.47, 0], [(G.x0 + G.x1) / 2 + 4, G.z0 + 0.47, 0], [(G.x0 + G.x1) / 2, G.z1 - 0.47, Math.PI]]) framed(p, oldMaster(912 + Math.round(x)), 3.4, 1.8, x, 2.8, z, ry, { f: 0.12, color: 0x3a2a1a });
    p.daylight.box(2, 0.1, 2, 0xd8d0c0, G.x1 - 3, G.h - 0.1, 20);
    g.add(crowd(G.x1, 20, 5, 3, 5, -Math.PI * 0.8, -Math.PI * 0.2, 107));
  }
  {
    const B = BOSCH, cx = (B.x0 + B.x1) / 2;
    p.floor(B.x0, B.z0, B.x1, B.z1, floor);
    hall(p, { ...B, color: GREEN, doors: { w: [[60 - B.z0, 4, 6]] } });
    skylight(p, B.x0, B.z0, B.x1, B.z1, B.h, { color: 0xe8e4dc, along: 'x', glass: 0.5 });
    // the triptych open on a stand in the middle of the room, so you can walk round it
    p.dark.box(9.4, 0.8, 1.0, 0x2a2622, cx, 0.4, 62);
    p.dark.box(9.6, 4.8, 0.3, 0x2a2622, cx, 3.2, 62.3);
    framed(p, gardenOfDelights(), 9.2, 2.75 * 1.25 * 1.3, cx, 3.2, 62.1, Math.PI, { f: 0.15, color: 0x6a4a2a, label: false });
    p.block(cx, 62, 4.9, 0.7);
    rope(p, [cx - 5, 59.4], [cx + 5, 59.4]);
    g.add(crowd(cx, 62, 9, 3.4, 6.5, Math.PI * 0.6, Math.PI * 1.4, 109));
  }
  g.add(wanderers(p, 29));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: ENTRY.z0 + 1.6 } };
}
