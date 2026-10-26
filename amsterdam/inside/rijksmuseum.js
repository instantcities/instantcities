// The Rijksmuseum from the inside, as three of its key rooms rather than its real plan: the atrium
// under its glass roof, the Gallery of Honour with the Dutch Golden Age in its alcoves (Vermeer,
// Hals, Steen), and at its end the Night Watch room, Rembrandt's militia on the end wall.
//
// Game metres, x across and z along; the door out at -z.
import * as THREE from 'three';
import { Parts, floorMat } from '../../core/js/inside/gothic.js';
import { hall, skylight, barrel, framed, bench, rope, visitors, crowd, wanderers } from '../../core/js/inside/rooms.js';
import { nightWatch, oldMaster, masterSize, famous } from '../../core/js/inside/art.js';
import { plaque } from '../../core/js/inside/pictures.js';

const TINT = { stone: 0xd8ccb4, pier: 0xc8b898, vault: 0xf2ecde, rib: 0xd9cfba, wall: 0xe0d6c2 };
const GREY = 0x6a6a68, DARK = 0x3a3a3c;

export const ATRIUM = { x0: -14, z0: -14, x1: 14, z1: 0, h: 16 };
const HONOUR = { x0: -7, z0: 0.9, x1: 7, z1: 70, h: 11 };
const WATCH = { x0: -12, z0: 70.9, x1: 12, z1: 95, h: 12 };

export function makeRijksmuseum() {
  const p = new Parts(TINT), g = new THREE.Group();
  const floor = floorMat('#d8d0c0', '#c8c0b0', false, 2.4);

  // ---- the atrium: pale stone, the glass roof, the info desk
  {
    const A = ATRIUM;
    p.floor(A.x0, A.z0, A.x1, A.z1, floor);
    hall(p, { ...A, color: 0xeae4d8, doors: { s: [[14, 4, 5]], n: [[14, 6, 7]] } });
    skylight(p, A.x0, A.z0, A.x1, A.z1, A.h, { color: 0xeae4d8, along: 'x', glass: 0.8 });
    for (const s of [-1, 1]) p.dark.box(1.9, 5, 0.14, 0x2a2622, s * 1, 2.5, A.z0 - 0.1);
    p.wallRing([-2, A.z0], [2, A.z0], 0.4);
    p.wood.box(8, 1.1, 1.6, 0x3a3a3e, -6, 0.55, -6); p.block(-6, -6, 4.2, 1);
    p.picture(plaque(['RIJKSMUSEUM', 'Eregalerij · Nachtwacht'], 768, 220), 6, 1.7, 0, 9, A.z1 - 0.47, Math.PI);
    g.add(visitors([[4, -8, 0.4], [6, -5, -0.6], [-2, -3, 0], [9, -10, 1.0], [-9, -10, 0.6]], 91));
  }
  // ---- the Gallery of Honour: alcoves of arches down both sides, a painting in each, the vault
  // painted and skylit; the Night Watch framed in the arch at its end
  {
    const H = HONOUR;
    p.floor(H.x0, H.z0, H.x1, H.z1, floor);
    hall(p, { ...H, color: GREY, doors: { s: [[7, 6, 7]], n: [[7, 7, 8]] } });
    barrel(p, H.x0, H.z0, H.x1, H.z1, H.h, 4, { color: 0xe8dcc0, band: 0xb88a5a, bay: 7.7, skylight: 0.3 });
    // the famous ones in their alcoves, as they hang: Asselijn's swan the first on the left, Vermeer's
    // Milkmaid and Little Street, Rembrandt's Jewish Bride ([id, w, h, y] by side and alcove)
    const FAMOUS = { w0: ['the-threatened-swan', 2.3, 1.95, 3.4], w5: ['the-milkmaid', 0.85, 0.95, 2.4], e4: ['the-little-street', 0.85, 1.05, 2.4], e7: ['the-jewish-bride', 2.3, 1.68, 3.2] };
    let seed = 800;
    for (const [x, ry] of [[H.x0 + 0.47, Math.PI / 2], [H.x1 - 0.47, -Math.PI / 2]]) for (let k = 0; k < 9; k++) {
      const z = H.z0 + 3.9 + k * 7.7, sd = seed++, [w, h] = masterSize(sd), real = FAMOUS[`${x < 0 ? 'w' : 'e'}${k}`];
      if (real) framed(p, famous(real[0], real[1], real[2]), real[1], real[2], x, real[3], z, ry, { f: real[1] < 1 ? 0.18 : 0.3 });
      else framed(p, oldMaster(sd), w * 1.1, h * 1.1, x, 3.4, z, ry);
      p.stone.box(1.2, H.h, 1.2, 0xb88a5a, x + Math.sign(-x) * 0.4, H.h / 2, z + 3.85); // the pillars between the alcoves
      p.block(x + Math.sign(-x) * 0.4, z + 3.85, 0.7);
    }
    for (const z of [18, 40, 58]) bench(p, 0, z, 3.6, Math.PI / 2);
    g.add(visitors([[2, 10, -1.5], [-2.5, 22, 1.5], [1, 34, 0], [-1.5, 48, 1.4], [2.5, 62, -1.5], [0, 66, 0.1]], 93));
  }
  // ---- the Night Watch room: the painting on its end wall, behind the rope, the crowd before it
  {
    const W = WATCH;
    p.floor(W.x0, W.z0, W.x1, W.z1, floor);
    hall(p, { ...W, color: DARK, doors: { s: [[12, 7, 8]] } });
    skylight(p, W.x0, W.z0, W.x1, W.z1, W.h, { color: 0xd8d0c0, along: 'x', glass: 0.5 });
    framed(p, nightWatch(), 5.5, 4.55, 0, 3.5, W.z1 - 0.47, Math.PI, { f: 0.4 });
    rope(p, [-5, W.z1 - 4], [5, W.z1 - 4]);
    for (const [x, ry] of [[W.x0 + 0.47, Math.PI / 2], [W.x1 - 0.47, -Math.PI / 2]]) for (const z of [77, 87]) framed(p, oldMaster(5 * (Math.round(z) + (x < 0 ? 0 : 1))), 2.2, 2.8, x, 3.4, z, ry);
    bench(p, 0, 80, 5, 0);
    g.add(crowd(0, W.z1, 18, 4.6, 9, Math.PI * 0.62, Math.PI * 1.38, 97));
  }
  g.add(wanderers(p, 11));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: ATRIUM.z0 + 1.6 } };
}
