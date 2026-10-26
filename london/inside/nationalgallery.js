// The National Gallery from the inside, as four of its key rooms rather than its real plan: the
// entrance hall with Boris Anrep's mosaic floor, the Central Hall under its skylit vault, the Van Eyck
// room with the Arnolfini Portrait, the British room with the Hay Wain and the Fighting Temeraire, and
// at the far end the room with Van Gogh's Sunflowers and Monet's water lilies.
//
// Game metres, x across and z along; the door out (to Trafalgar Square) in the hall's south wall.
import * as THREE from 'three';
import { Parts, floorMat } from '../../core/js/inside/gothic.js';
import { hall, skylight, barrel, framed, bench, rope, visitors, crowd, wanderers } from '../../core/js/inside/rooms.js';
import { sunflowers, hayWain, arnolfini, temeraire, oldMaster, masterSize, famous } from '../../core/js/inside/art.js';
import { plaque } from '../../core/js/inside/pictures.js';

const TINT = { stone: 0xe4dccc, pier: 0xd8cfbd, vault: 0xf2ecde, rib: 0xd9cfba, wall: 0xe8e0d0 };
const RED = 0x7a2a2a, GREEN = 0x3a5a4a, GREY = 0x8a8478;

export const HALL = { x0: -10, z0: -12, x1: 10, z1: 0, h: 10 };
const CENTRAL = { x0: -7, z0: 0.9, x1: 7, z1: 40, h: 10 };
const EYCK = { x0: -26, z0: 6, x1: -7.9, z1: 22, h: 8 };
const BRITISH = { x0: 7.9, z0: 4, x1: 30, z1: 26, h: 9 };
const IMPRESSION = { x0: -12, z0: 40.9, x1: 12, z1: 64, h: 9 };

// a painted lily pond for the walls: Monet's water lilies, blue and green and pink in patches
function waterLilies() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 320;
  const g = c.getContext('2d');
  g.fillStyle = '#5a7aa0'; g.fillRect(0, 0, 1024, 320);
  let s = 1916;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 600; k++) { g.fillStyle = ['#6a8ab8', '#4a6a8a', '#8aa8c8', '#5a8a7a', '#3a5a6a'][k % 5]; g.fillRect(rnd() * 1024, rnd() * 320, 20 + rnd() * 30, 4 + rnd() * 6); }
  for (let k = 0; k < 40; k++) { const x = rnd() * 1024, y = 60 + rnd() * 240; g.fillStyle = '#4a7a4a'; g.beginPath(); g.ellipse(x, y, 30, 10, 0, 0, 7); g.fill(); g.fillStyle = ['#e8a0b0', '#f0e8f0', '#e8c070'][k % 3]; g.beginPath(); g.arc(x, y - 3, 5, 0, 7); g.fill(); }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.userData.shared = true;
  return tex;
}

export function makeNationalGallery() {
  const p = new Parts(TINT), g = new THREE.Group();
  const parquet = floorMat('#8a5a32', '#7a4e2a', true, 0.55);

  // ---- the entrance hall: the mosaic floor, columns, the stair's foot ahead
  {
    const H = HALL;
    p.floor(H.x0, H.z0, H.x1, H.z1, floorMat('#e0d4b8', '#8a6a4a', true, 0.7));
    hall(p, { ...H, color: 0xe8e0d0, doors: { s: [[10, 4, 5]], n: [[10, 6, 7]] } });
    p.ceiling(H.x0, H.z0, H.x1, H.z1, H.h, { color: 0xf2ecde, beam: 0xd8cfbd, bx: 5, bz: 4, w: 0.6 });
    for (const s of [-1, 1]) for (const z of [-8, -4]) { p.marble.add(new THREE.CylinderGeometry(0.6, 0.65, 9, 12).translate(0, 4.5, 0), 0xc8b898, s * 6, 0, z); p.block(s * 6, z, 0.75); }
    for (const s of [-1, 1]) p.dark.box(1.9, 5, 0.14, 0x2a2622, s * 1, 2.5, H.z0 - 0.1);
    p.wallRing([-2, H.z0], [2, H.z0], 0.4);
    p.picture(plaque(['THE NATIONAL GALLERY'], 768, 160), 6, 1.25, 0, 8, H.z1 - 0.47, Math.PI);
  }
  // ---- the Central Hall: red walls, old masters close-hung, benches down the middle
  {
    const C = CENTRAL;
    p.floor(C.x0, C.z0, C.x1, C.z1, parquet);
    hall(p, { ...C, color: RED, doors: { s: [[7, 6, 7]], n: [[7, 6, 7]], w: [[14 - C.z0, 4, 6]], e: [[15 - C.z0, 4, 6]] } });
    barrel(p, C.x0, C.z0, C.x1, C.z1, C.h, 4.5, { color: 0xf2ecde, band: 0xd8cfbd, bay: 9.8, skylight: 0.4 });
    let seed = 500;
    for (const [x, ry] of [[C.x0 + 0.47, Math.PI / 2], [C.x1 - 0.47, -Math.PI / 2]]) for (let z = C.z0 + 4; z < C.z1 - 3; z += 5.5) {
      if (Math.abs(z - 14.5) < 3.5) continue;
      if (x > 0 && Math.abs(z - 26.9) < 0.1) { framed(p, famous('the-rokeby-venus', 2.2, 1.55), 2.2, 1.55, x, 3.4, z, ry); continue; } // Velázquez's Venus at her mirror
      const sd = seed++, [w, h] = masterSize(sd);
      framed(p, oldMaster(sd), w * 1.2, h * 1.2, x, 3.6, z, ry);
    }
    for (const z of [10, 28]) bench(p, 0, z, 3.6, Math.PI / 2);
    g.add(visitors([[2, 8, 1.4], [-2, 20, -1.5], [1, 32, 0.2], [-3, 36, -1.6]], 71));
  }
  // ---- the Van Eyck room: grey-green, small, the Arnolfini on its own wall
  {
    const E = EYCK;
    p.floor(E.x0, E.z0, E.x1, E.z1, parquet);
    hall(p, { ...E, color: GREEN, doors: { e: [[14 - E.z0, 4, 6]] } });
    skylight(p, E.x0, E.z0, E.x1, E.z1, E.h, { color: 0xe8e4dc, along: 'x', glass: 0.5 });
    framed(p, arnolfini(), 1.0, 1.2, E.x0 + 0.47, 2.4, 14, Math.PI / 2, { f: 0.18 });
    rope(p, [E.x0 + 2.4, 12], [E.x0 + 2.4, 16]);
    for (const [z, sd] of [[E.z0 + 0.47, 0], [E.z1 - 0.47, Math.PI]]) for (let k = 0; k < 3; k++) { const n = 604 + k * 5 + (sd ? 1 : 0); if (!(sd && k === 1)) framed(p, oldMaster(n), 1.4, 1.8, E.x0 + 4 + k * 5, 2.8, z, sd); }
    framed(p, famous('the-ambassadors', 2.6, 2.6), 2.6, 2.6, E.x0 + 9, 3.0, E.z1 - 0.47, Math.PI, { f: 0.25 }); // Holbein's Ambassadors across from it
    g.add(crowd(E.x0, 14, 5, 3.2, 5.4, Math.PI * 0.15, Math.PI * 0.85, 73));
  }
  // ---- the British room: Constable's Hay Wain and Turner's Temeraire facing each other
  {
    const B = BRITISH, cx = (B.x0 + B.x1) / 2;
    p.floor(B.x0, B.z0, B.x1, B.z1, parquet);
    hall(p, { ...B, color: RED, doors: { w: [[15 - B.z0, 4, 6]] } });
    skylight(p, B.x0, B.z0, B.x1, B.z1, B.h, { color: 0xe8e4dc, along: 'x', glass: 0.5 });
    framed(p, hayWain(), 4.6, 3.1, cx, 3.2, B.z1 - 0.47, Math.PI, { f: 0.35 });
    framed(p, temeraire(), 3.0, 2.3, cx, 3.0, B.z0 + 0.47, 0, { f: 0.35 });
    framed(p, famous('whistlejacket', 2.5, 3.0), 2.5, 3.0, B.x1 - 0.47, 3.4, 15, -Math.PI / 2); // Stubbs's Whistlejacket, rearing up life size
    bench(p, cx, 15, 4, 0);
    g.add(crowd(cx, B.z1, 6, 3.2, 6, Math.PI * 0.7, Math.PI * 1.3, 79));
  }
  // ---- the Impressionists: Sunflowers in the middle of the end wall, the water lilies along the side
  {
    const I = IMPRESSION;
    p.floor(I.x0, I.z0, I.x1, I.z1, parquet);
    hall(p, { ...I, color: GREY, doors: { s: [[12, 6, 7]] } });
    skylight(p, I.x0, I.z0, I.x1, I.z1, I.h, { color: 0xe8e4dc, glass: 0.5 });
    framed(p, sunflowers(), 1.15, 1.15 * 480 / 380, 0, 2.6, I.z1 - 0.47, Math.PI, { f: 0.2 });
    framed(p, waterLilies(), 8, 2.5, I.x0 + 0.47, 3.2, 52, Math.PI / 2, { f: 0.25 });
    framed(p, famous('bathers-at-asnieres', 3.6, 2.42), 3.6, 2.42, I.x1 - 0.47, 3.0, 46, -Math.PI / 2); // Seurat's bathers
    framed(p, famous('the-water-lily-pond', 1.5, 1.42), 1.5, 1.42, I.x1 - 0.47, 2.8, 58, -Math.PI / 2); // and Monet's own bridge over his pond
    rope(p, [-3, I.z1 - 3], [3, I.z1 - 3]);
    bench(p, 0, 50, 4, 0);
    g.add(crowd(0, I.z1, 10, 3.8, 7.5, Math.PI * 0.65, Math.PI * 1.35, 83));
  }
  g.add(wanderers(p, 23));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: HALL.z0 + 1.6 } };
}
