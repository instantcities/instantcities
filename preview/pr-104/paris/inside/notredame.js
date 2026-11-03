// Notre-Dame de Paris from the inside, as it was reopened in December 2024, its stone cleaned
// pale: the nave of ten bays under the vault 33 m up, the double aisles, the short transept with the
// north and south rose windows, the new bronze altar at the crossing, the choir with its stalls and
// Coustou's Pietà at the end, the great organ under the west rose. Pews down the nave.
//
// Game metres, x across and z towards the altar, from the middle of the crossing; the west doors
// (to the Parvis) at -z.
import * as THREE from 'three';
import { cruciform, floorMat } from '../../core/js/inside/gothic.js';
import { saint, organ, candelabra, steps, chandelier } from '../../core/js/inside/props.js';
import { pews, rose } from '../../core/js/inside/church.js';
import { roseWindow } from '../../core/js/inside/art.js';
import { visitors, rope } from '../../core/js/inside/rooms.js';

const GOLD = 0xd2a94a, BRONZE = 0x6a5236, OAK = 0x6b4526;

export const CONFIG = {
  pitch: 8, a: 7.5, aisle: 12, nave: 9, choir: 5, arm: 8,
  ySA: 13, rA: 5, ySV: 29, rV: 12,
  seed: 3, organ: true, door: 6,
  tint: { stone: 0xebe4d6, pier: 0xe4dccd, vault: 0xf4f0e6, rib: 0xe0d6c2, wall: 0xeee8dc },
  floor: floorMat('#e4dccc', '#9a9284', false, 1.6),
  chapels: [{ x: -12, w: 9, d: 7 }, { x: 0, w: 10, d: 9 }, { x: 12, w: 9, d: 7 }],
};

export function makeNotreDame() {
  const church = cruciform(CONFIG);
  const p = church.parts, { a, b, P, zW, zE, zA, TA, ySV, rV } = church;
  const g = new THREE.Group();

  p.doors([-a, zW], [a, zW], a - 3, a + 3, 6.2, 2.4);
  // the great organ over the west door, the west rose over it; the north and south roses at the transept's ends
  organ(p, 0, zW + 0.8, 2 * a - 1.4, 10, 22);
  rose(p, roseWindow(5), 11, 0, 30, zW + 0.9, 0);
  for (const s of [-1, 1]) rose(p, roseWindow(s > 0 ? 2 : 1), 14, s * (a + TA - 0.9), 24, 0, -s * Math.PI / 2);

  // pews down the nave, chairs' worth of people in some of them
  pews(p, zW + 8, -a - 6, 5, 1.8);
  for (let k = 0; k < 8; k++) chandelier(p, 0, 17, -a - (k + 0.5) * P, 1.6, ySV + rV - 0.3, 14);

  // the new altar at the crossing (Guillaume Bardet, 2024): a round bronze table on a dais, the
  // ambo and the cathedra in the same bronze
  steps(p, 0, 0, 2 * a - 1, 2 * a - 1, 2, 0.3);
  p.dark.add(new THREE.CylinderGeometry(1.6, 1.4, 1.1, 24).translate(0, 0.6 + 0.55, 0), BRONZE, 0, 0, 0);
  p.dark.box(1.0, 1.4, 0.8, BRONZE, a - 3, 1.3, -a + 2.5);
  p.dark.box(1.2, 1.8, 1.0, BRONZE, 0, 1.5, a - 2);
  p.block(0, 0, a - 0.6);

  // the choir: oak stalls either side, the Pietà with the gold cross at its end, kings kneeling by it
  for (const s of [-1, 1]) {
    const x = s * (a - 1.6), z0 = a + 3, z1 = zE - 8;
    p.wood.box(1.6, 1.0, z1 - z0, OAK, x, 0.5, (z0 + z1) / 2);
    p.wood.box(0.35, 3.2, z1 - z0, 0x4a2f1c, x + s * 0.8, 1.6, (z0 + z1) / 2);
    p.block(x, (z0 + z1) / 2, 0.9, (z1 - z0) / 2);
  }
  {
    const z = zE - 3.5;
    steps(p, 0, z, 7, 5, 3, 0.3);
    p.marble.box(3.6, 1.6, 1.6, 0xf4f0e6, 0, 0.9 + 0.8, z);
    saint(p, -0.4, 2.5, z, 1.4, Math.PI, { halo: false, robe: 0xf2eee6 }); // the Virgin, her son across her knees
    p.marble.box(1.8, 0.4, 0.5, 0xf2eee6, 0.3, 3.3, z - 0.4, 0, 0, 0.3);
    p.gold.box(0.3, 7, 0.3, GOLD, 0, 6.2, z + 1.2);
    p.gold.box(3.6, 0.3, 0.3, GOLD, 0, 7.8, z + 1.2);
    for (const s of [-1, 1]) saint(p, s * 4, 0.9, z, 1.3, Math.PI + s * 0.6, { halo: false, robe: 0xf0ece2 });
    p.block(0, z, 4, 3);
    rope(p, [-a + 1, z - 4.4], [a - 1, z - 4.4]);
  }
  // the Virgin of Paris, on the south-east pier of the crossing, candles before her
  saint(p, a - 1.4, 2.4, a - 1.4, 1.5, -Math.PI * 0.75, { robe: 0xf4f0e6 });
  p.stone.box(1.4, 2.4, 1.4, 0xe4dccd, a - 1.4, 1.2, a - 1.4);
  for (let q = 0; q < 12; q++) p.glow.add(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 5), 0xfff0c0, a - 3.2 + (q % 6) * 0.3, 1.0, a - 2.8 + Math.floor(q / 6) * 0.3);
  candelabra(p, -a + 1.6, -a + 1.6, 3.2);

  // visitors along the aisles and in the crossing
  let s = 13;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const spots = [];
  for (let k = 0; k < 30; k++) { const side = rnd() < 0.5 ? -1 : 1; spots.push([side * (a + 2 + rnd() * (b - a - 4)), zW + 6 + rnd() * (zE - zW - 12), rnd() * Math.PI * 2]); }
  g.add(visitors(spots, 23));

  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: zW + 1.8 } };
}
