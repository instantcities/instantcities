// Sint-Niklaaskerk from the inside, modelled by hand and simplified: Scheldt Gothic in blue-grey
// Tournai stone, with slender piers, bare walls above the arcades and the lantern tower
// open over the crossing. Concert chairs in the nave, the big organ over the west door, a baroque pulpit, the
// high altar in the choir and a few chapels behind it.
import * as THREE from 'three';
import { cruciform, floorMat } from './gothic.js';
import { saint, chandelier, candelabra, steps, sunburst, organ, pulpit, chairs } from './props.js';
import { darkPainting } from './lamgods.js';

const GOLD = 0xd2a94a, OAK = 0x7a4f2a, OAK_DARK = 0x5a3a1e, MARBLE = 0xe8e4da;

export const CONFIG = {
  pitch: 7.4, a: 5.6, aisle: 6.4, nave: 4, choir: 2, arm: 11,
  ySA: 8.5, rA: 3.6, ySV: 19, rV: 7, lantern: 15,
  seed: 4, organ: true, bareStone: true, door: 4.6,
  tint: { stone: 0x9aa5b0, pier: 0x909baa, vault: 0xd7dadb, rib: 0xa9b3bd, wall: 0xa3adb7 },
  floor: floorMat('#b9b4aa', '#8d8880', false, 1.8),
  chapels: [{ x: -5.2, w: 8, d: 7.5 }, { x: 5.2, w: 8, d: 7.5 }],
};

export function makeNiklaas() {
  const church = cruciform(CONFIG);
  const p = church.parts, { a, b, P, zW, zE, zA, TA, ySV, rV } = church;

  p.doors([-a, zW], [a, zW], a - 2.3, a + 2.3, 5.6, 2.2);

  // the organ over the west door, on its gallery
  organ(p, 0, zW + 0.8, 2 * a - 1.2, 9.5, 20.5);

  // concert chairs in the nave: two blocks with an aisle between, and across the west end
  for (const s of [-1, 1]) chairs(p, s > 0 ? 1.5 : -4.6, zW + 6, 4, 9);

  // iron-ringed chandeliers down the nave
  for (let k = 0; k < 4; k++) chandelier(p, 0, 14, -a - (k + 0.5) * P, 1.3, ySV + rV - 0.3, 12);
  for (let j = 0; j < 2; j++) chandelier(p, 0, 14, a + (j + 0.5) * P, 1.3, ySV + rV - 0.3, 12);

  // a baroque pulpit on the north pier of the second bay
  pulpit(p, -a + 2.2, -a - 2 * P);

  // the high altar: three steps, a white marble altar, a baroque retable in black and gold with St Nicholas
  {
    const z = zE - 3.6, zBack = zE - 1.0;
    steps(p, 0, z, 8.4, 6.8, 3, 0.28);
    p.marble.box(4.8, 1.1, 1.8, 0xf2efe6, 0, 0.84 + 0.55, z + 0.1);
    p.dark.box(6.2, 6.4, 0.6, 0x2b2a30, 0, 0.84 + 3.2, zBack);
    for (const cx of [-2.9, 2.9]) {
      p.marble.add(new THREE.CylinderGeometry(0.34, 0.38, 5.8, 10).translate(0, 2.9, 0), 0xf0ece2, cx, 0.84, zBack - 0.7);
      p.gold.add(new THREE.CylinderGeometry(0.5, 0.34, 0.45, 10).translate(0, 5.95, 0), GOLD, cx, 0.84, zBack - 0.7);
    }
    p.gold.box(7.4, 0.6, 1.6, GOLD, 0, 0.84 + 6.55, zBack - 0.4);
    p.marble.box(5.2, 0.5, 1.2, 0xf0ece2, 0, 0.84 + 7.1, zBack - 0.35);
    p.gold.box(2.4, 0.6, 0.8, GOLD, 0, 0.84 + 7.6, zBack - 0.3);
    sunburst(p, 0, 4.7, zBack - 0.4, 2.0, Math.PI);
    saint(p, 0, 2.8, zBack - 0.5, 1.7, Math.PI, { robe: 0xf0ece2 });
    for (const s of [-1, 1]) candelabra(p, s * 5.0, z + 1.2, 3.2);
    p.block(0, z, 4.2, 3.7);
  }

  // saints on the corbels of the nave's piers
  for (const s of [-1, 1]) for (let k = 1; k <= 3; k++) {
    const z = -a - k * P, x = s * (a - 1.5);
    p.stone.box(0.7, 0.8, 0.7, 0x909baa, x, 5.0, z);
    saint(p, x, 5.4, z, 1.2, -s * Math.PI / 2, { robe: 0xe6e3da });
  }

  // two side altars in the transept arms and a painting on each end wall, under the windows
  for (const s of [-1, 1]) {
    const x = s * (a + TA - 1.2);
    p.marble.box(1.2, 1.0, 3.0, MARBLE, x - s * 0.2, 0.5, 0);
    p.gold.box(0.4, 3.4, 3.0, GOLD, x + s * 0.4, 2.4, 0);
    p.block(x, 0, 0.9, 1.6);
    p.picture(darkPainting(1700 + s), 5.4, 3.6, s * (a + TA - 0.85), 4.5, 0, -s * Math.PI / 2 + Math.PI);
  }

  // candles by the pillars of the crossing
  for (const [x, z] of [[-a - 1.8, -a - 1.8], [a + 1.8, -a - 1.8]]) candelabra(p, x, z, 3.0);

  const g = new THREE.Group();
  g.add(p.mesh());
  return { group: g, foot: p.foot, church, door: { x: 0, z: zW + 1.8 } };
}
