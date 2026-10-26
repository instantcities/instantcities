// St Stephen's Cathedral (Stephansdom) from the inside, simplified: a hall church, its aisles nearly
// as tall as its nave, grey sandstone gone dark with age, Anton Pilgram's stone pulpit on a nave pier
// (he looks out of a window under its stair), statues on the piers, the baroque high altar of black
// marble with the stoning of St Stephen, the gilded Wiener Neustadt altar in the north choir.
//
// Game metres, x across and z towards the altar, from the middle of the crossing; the Giant's Door
// (to Stephansplatz) at -z.
import * as THREE from 'three';
import { cruciform, floorMat } from '../../core/js/inside/gothic.js';
import { saint, pulpit, chandelier, steps, candelabra } from '../../core/js/inside/props.js';
import { pews } from '../../core/js/inside/church.js';
import { darkPainting } from '../../core/js/inside/lamgods.js';
import { visitors, rope } from '../../core/js/inside/rooms.js';

const GOLD = 0xd2a94a, BLACK = 0x1e1c20;

export const CONFIG = {
  pitch: 7.5, a: 6.2, aisle: 6.5, nave: 7, choir: 3, arm: 3,
  ySA: 18, rA: 5, ySV: 23, rV: 6,
  seed: 0, door: 5,
  tint: { stone: 0xa89e8c, pier: 0x9a907e, vault: 0xd8d0c0, rib: 0xa89e8c, wall: 0xb0a694 },
  floor: floorMat('#c8c0b0', '#8a8478', false, 1.5),
  chapels: [{ x: -9, w: 8, d: 6 }, { x: 9, w: 8, d: 6 }],
};

export function makeStephansdom() {
  const church = cruciform(CONFIG);
  const p = church.parts, { a, b, P, zW, zE, zA, ySV, rV } = church;
  const g = new THREE.Group();
  p.doors([-a, zW], [a, zW], a - 2.5, a + 2.5, 6.2, 2.4);
  pews(p, zW + 8, -a - 3, 4.2, 1.6);
  for (let k = 0; k < 6; k++) chandelier(p, 0, 15, -a - (k + 0.5) * P, 1.5, ySV + rV - 0.3, 14);

  // statues on brackets on the piers of the nave, under little stone canopies
  for (const s of [-1, 1]) for (let k = 1; k <= 6; k++) {
    const x = s * (a - 1.3), z = -a - k * P;
    p.stone.box(0.8, 0.5, 0.8, 0x9a907e, x, 6.2, z);
    saint(p, x, 6.4, z, 1.2, -s * Math.PI / 2, { halo: false, robe: 0xb8ae9c });
    p.stone.add(new THREE.ConeGeometry(0.6, 1.6, 6), 0x9a907e, x, 9.4, z);
  }
  // Pilgram's pulpit on the third pier on the north side
  pulpit(p, -a + 2.2, -a - 3 * P);

  // the high altar (1647): black marble on steps, the painting of the stoning of St Stephen in it
  {
    const z = zE - 3;
    steps(p, 0, z - 1.5, 9, 5, 3, 0.3);
    p.dark.box(8, 11, 1.2, BLACK, 0, 5.5 + 0.9, z);
    p.picture(darkPainting(1647), 5, 6.6, 0, 6.4, z - 0.65, Math.PI);
    for (const sx of [-3.4, 3.4]) { p.dark.add(new THREE.CylinderGeometry(0.4, 0.45, 9, 10).translate(0, 4.5, 0), 0x2a2628, sx, 0.9, z - 0.9); saint(p, sx, 10, z - 0.9, 1.2, Math.PI, { robe: 0xf0ece2 }); }
    p.gold.box(6, 0.6, 1.4, GOLD, 0, 12.2, z - 0.4);
    for (const s of [-1, 1]) candelabra(p, s * 4.8, z - 3, 3.0);
    p.block(0, z - 1.5, 4.6, 3);
    rope(p, [-a + 1, z - 6], [a - 1, z - 6]);
  }
  // the Wiener Neustadt altar (1447) in the north choir: a winged altar, opened, all carved and gilt
  {
    const x = -a - (b - a) / 2, z = a + 1.6 * P;
    p.marble.box(3.4, 1.2, 1.6, 0xd8d2c4, x, 0.6, z);
    p.gold.box(3.4, 4.4, 0.5, GOLD, x, 3.4, z + 0.6);
    for (const s of [-1, 1]) p.gold.box(1.7, 4.0, 0.2, 0xc8963c, x + s * 2.6, 3.3, z + 0.3, 0, -s * 0.5, 0);
    for (let q = 0; q < 3; q++) saint(p, x - 1 + q, 1.8, z + 0.25, 0.8, Math.PI, { robe: [0x2f56b8, 0xd2a94a, 0xa3202c][q] });
    p.gold.add(new THREE.ConeGeometry(1.1, 4.4, 5), GOLD, x, 7.8, z + 0.6);
    p.block(x, z, 2.2, 1.1);
  }

  let s = 17;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const spots = [];
  for (let k = 0; k < 26; k++) spots.push([(rnd() < 0.5 ? -1 : 1) * (a + 1.5 + rnd() * (b - a - 3)), zW + 5 + rnd() * (zE - zW - 10), rnd() * Math.PI * 2]);
  g.add(visitors(spots, 47));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: zW + 1.8 } };
}
