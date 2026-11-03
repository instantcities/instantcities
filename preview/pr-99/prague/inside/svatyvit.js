// St Vitus Cathedral (Katedrála svatého Víta) in Prague Castle from the inside, simplified: the
// tall Gothic choir of Peter Parler and the nave finished only in 1929, Alfons Mucha's window of
// Saints Cyril and Methodius in the north aisle, the silver tomb of St John of Nepomuk in the
// ambulatory (two tonnes of it, angels holding up the canopy), and the St Wenceslas Chapel, its
// walls set with jasper and amethyst.
//
// Game metres, x across and z towards the altar, from the middle of the crossing; the west door (to
// the castle's third courtyard) at -z.
import * as THREE from 'three';
import { cruciform, floorMat } from '../../core/js/inside/gothic.js';
import { saint, chandelier } from '../../core/js/inside/props.js';
import { pews, highAltar, rose } from '../../core/js/inside/church.js';
import { roseWindow } from '../../core/js/inside/art.js';
import { visitors, rope } from '../../core/js/inside/rooms.js';

const SILVER = 0xd8d8e0, GOLD = 0xd2a94a;

export const CONFIG = {
  pitch: 7, a: 6.5, aisle: 6, nave: 6, choir: 4, arm: 8,
  ySA: 12, rA: 4.5, ySV: 28, rV: 9,
  seed: 2, door: 5, organ: true,
  tint: { stone: 0xddd6c8, pier: 0xd2cab8, vault: 0xf2eee4, rib: 0xd8d0c0, wall: 0xe4ddd0 },
  floor: floorMat('#d8d2c4', '#a8a090', false, 1.5),
  chapels: [{ x: -11, w: 7, d: 6 }, { x: 0, w: 8, d: 8 }, { x: 11, w: 7, d: 6 }],
};

export function makeSvatyVit() {
  const church = cruciform(CONFIG);
  const p = church.parts, { a, b, P, zW, zE, zA, TA, ySV, rV } = church;
  const g = new THREE.Group();
  p.doors([-a, zW], [a, zW], a - 2.5, a + 2.5, 6.2, 2.4);
  rose(p, roseWindow(7), 10, 0, 22, zW + 0.9, 0); // the west rose, the Creation (1925–27)
  pews(p, zW + 6, -a - 3, 4.4, 1.6);
  for (let k = 0; k < 5; k++) chandelier(p, 0, 16, -a - (k + 0.5) * P, 1.5, ySV + rV - 0.3, 12);
  highAltar(p, zE - 5, { w: 7 });

  // Mucha's window, in the third chapel of the north aisle: a big pane of colour over a little altar
  {
    const x = -b + 0.6, z = -a - 2.5 * P;
    p.picture(roseWindow(12), 4.6, 4.6, x + 0.2, 6, z, Math.PI / 2);
    p.marble.box(1.2, 1.1, 2.6, 0xe8e2d4, x + 0.8, 0.55, z);
    p.block(x + 0.8, z, 0.7, 1.4);
  }
  // the tomb of St John of Nepomuk: silver on a silver plinth, the saint kneeling, four angels with
  // the canopy on poles over him, in the ambulatory on the south side
  {
    const x = a + (b - a) / 2, z = zE + (zA - zE) / 2 - 1;
    p.gold.box(4.2, 1.6, 2.6, SILVER, x, 0.8, z);
    p.gold.box(3.4, 0.8, 2.0, SILVER, x, 2.0, z);
    saint(p, x, 2.4, z, 1.1, -Math.PI / 2, { robe: SILVER, base: SILVER });
    for (const [dx, dz] of [[-1.8, -1.1], [1.8, -1.1], [-1.8, 1.1], [1.8, 1.1]]) { p.gold.rod([x + dx, 1.6, z + dz], [x + dx, 6, z + dz], 0.08, SILVER, 5); saint(p, x + dx, 1.6, z + dz, 0.7, 0, { robe: SILVER, halo: false }); }
    p.dark.box(4.4, 0.4, 3.0, 0x8a1f2b, x, 6.2, z);
    p.gold.box(4.6, 0.3, 3.2, GOLD, x, 6.5, z);
    p.block(x, z, 2.3, 1.5);
    rope(p, [x - 2.6, z - 2.2], [x + 2.6, z - 2.2]);
  }
  // the St Wenceslas Chapel, the north transept's end: walls inlaid with jasper and amethyst in gilt
  // plaster, the saint's statue (Parler, 1373) over his tomb
  {
    const x = -(a + TA) + 1.2;
    p.dark.box(0.3, 6, 2 * a - 2, 0x5a2a3a, x - 0.4, 3.2, 0);
    for (let q = 0; q < 90; q++) p.gold.add(new THREE.SphereGeometry(0.12, 5, 4), [0x8a2a8a, 0xa84a2a, GOLD, 0x3a6a5a][q % 4], x - 0.2, 0.8 + (q % 9) * 0.6, -a + 1.4 + Math.floor(q / 9) * ((2 * a - 2.8) / 10));
    p.dark.box(1.4, 1.2, 2.6, 0x3a2a2a, x + 1.6, 0.6, 0);
    saint(p, x + 0.6, 4, 0, 1.4, Math.PI / 2, { robe: 0xb8a070 });
    p.block(x + 1.6, 0, 0.9, 1.5);
  }

  let s = 29;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const spots = [];
  for (let k = 0; k < 24; k++) spots.push([(rnd() < 0.5 ? -1 : 1) * (a + 1.5 + rnd() * (b - a - 3)), zW + 5 + rnd() * (zE - zW - 10), rnd() * Math.PI * 2]);
  g.add(visitors(spots, 53));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: zW + 1.8 } };
}
