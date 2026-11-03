// Westminster Abbey from the inside, simplified: the tallest Gothic nave in England, narrow and
// high, the grave of the Unknown Warrior inside the west door in its border of poppies, the
// Coronation Chair in its case, the quire screen with the organ on it across the nave, chairs rather
// than pews, the high altar before its gilded screen, and Poets' Corner in the south transept, its
// walls full of busts and plaques.
//
// Game metres, x across and z towards the altar, from the middle of the crossing; the great west
// door (to Broad Sanctuary) at -z.
import * as THREE from 'three';
import { cruciform, floorMat } from '../../core/js/inside/gothic.js';
import { organ, chandelier, chairs, saint } from '../../core/js/inside/props.js';
import { highAltar } from '../../core/js/inside/church.js';
import { plaque } from '../../core/js/inside/pictures.js';
import { bust } from '../../core/js/inside/statues.js';
import { visitors, rope, vitrine } from '../../core/js/inside/rooms.js';

const GOLD = 0xd2a94a, OAK = 0x6b4526;

export const CONFIG = {
  pitch: 6.5, a: 6.2, aisle: 6, nave: 11, choir: 4, arm: 15,
  ySA: 12, rA: 5, ySV: 30, rV: 9,
  seed: 1, door: 5,
  tint: { stone: 0xd2c8b4, pier: 0x9a8c80, vault: 0xeee8da, rib: 0xc8bca6, wall: 0xd8cebc },
  floor: floorMat('#e8e4da', '#2a282c', false, 1.4),
  chapels: [{ x: 0, w: 10, d: 12 }],
};

export function makeAbbey() {
  const church = cruciform(CONFIG);
  const p = church.parts, { a, b, P, zW, zE, TA, ySV, rV } = church;
  const g = new THREE.Group();
  p.doors([-a, zW], [a, zW], a - 2.5, a + 2.5, 6.2, 2.4);

  // the Unknown Warrior: a slab of black marble set in the floor, the poppies all round it
  {
    const z = zW + 7;
    p.dark.box(2.2, 0.08, 3.4, 0x141214, 0, 0.1, z);
    for (let q = 0; q < 40; q++) { const t = (q / 40) * Math.PI * 2; p.glow.add(new THREE.SphereGeometry(0.12, 5, 4), 0xc8201c, Math.cos(t) * 1.6, 0.16, z + Math.sin(t) * 2.2); }
    p.block(0, z, 1.4, 2.0);
  }
  // the Coronation Chair (1300), in its case by the west door
  {
    const x = -b + 2, z = zW + 5, base = vitrine(p, x, z, 2.4, 2.4, 3.6, 0.6);
    p.wood.box(1.2, 0.8, 1.0, OAK, x, base + 0.6, z);
    p.wood.box(1.2, 2.2, 0.15, OAK, x, base + 1.5, z + 0.45);
    p.gold.add(new THREE.ConeGeometry(0.25, 0.8, 4), GOLD, x, base + 3.0, z + 0.45);
    p.stone.box(1.1, 0.4, 0.9, 0x9a8a7a, x, base + 0.2, z); // the Stone of Scone's place under the seat
  }
  // chairs in the nave, the quire screen with the organ across it
  for (const s of [-1, 1]) chairs(p, s > 0 ? 1.4 : -5.4, zW + 11, 5, 14);
  const qz = -a - 3 * P;
  p.stone.box(2 * a, 7, 2.4, 0xc8bca6, 0, 3.5, qz);
  p.stone.box(3, 5, 2.6, 0x2a2420, 0, 2.5, qz); // its doorway, dark
  organ(p, 0, qz - 1.2, 2 * a - 2, 7, 15, { wall: -1 });
  p.wallRing([-a, qz], [-1.6, qz], 2.4);
  p.wallRing([1.6, qz], [a, qz], 2.4);
  for (let k = 0; k < 4; k++) chandelier(p, 0, 18, zW + 8 + k * 2 * P, 1.6, ySV + rV - 0.3, 14);
  // the quire's stalls, then the high altar before its screen of gold
  for (const s of [-1, 1]) {
    const x = s * (a - 1.5), z0 = qz + 2, z1 = -a - 0.6;
    p.wood.box(1.6, 1.0, z1 - z0, OAK, x, 0.5, (z0 + z1) / 2);
    p.wood.box(0.3, 4.2, z1 - z0, 0x4a2f1c, x + s * 0.8, 2.1, (z0 + z1) / 2);
    for (let z = z0 + 1; z < z1; z += 1.6) p.gold.add(new THREE.ConeGeometry(0.22, 1.2, 4), GOLD, x + s * 0.8, 4.8, z);
    p.block(x, (z0 + z1) / 2, 0.9, (z1 - z0) / 2);
  }
  highAltar(p, zE - 6, { w: 7 });
  p.gold.box(2 * a - 1, 7, 0.6, GOLD, 0, 3.5 + 0.8, zE - 2);
  for (let k = -3; k <= 3; k++) saint(p, k * 1.6, 3.6, zE - 2.5, 0.9, Math.PI, { robe: 0xe8dcc0 });
  rope(p, [-a + 1, zE - 10], [a - 1, zE - 10]);
  // Poets' Corner, the south transept: busts on brackets and plaques all over its walls
  {
    const x1 = a + TA - 0.9, names = [['GEOFFREY CHAUCER', '1343–1400'], ['WILLIAM SHAKESPEARE'], ['JANE AUSTEN', '1775–1817'], ['CHARLES DICKENS', '1812–1870'], ['THE BRONTË SISTERS'], ['LEWIS CARROLL'], ['T. S. ELIOT'], ['STEPHEN HAWKING', '1942–2018']];
    names.forEach((lines, k) => {
      const z = -a + 1.2 + (k % 4) * ((2 * a - 2.4) / 3), y = 3 + Math.floor(k / 4) * 2.6;
      p.picture(plaque(lines, 512, 200), 1.8, 0.7, x1, y, z, -Math.PI / 2);
    });
    for (const z of [-a + 2, 0, a - 2]) bust(p, x1 - 1.2, z, 1.25);
    saint(p, x1 - 0.8, 1.6, -a + 3.5, 1.4, -Math.PI / 2, { halo: false, robe: 0xf0ece2 }); // Shakespeare, leaning on his books
    p.stone.box(1.4, 1.6, 1.4, 0xd8cebc, x1 - 0.8, 0.8, -a + 3.5);
    p.block(x1 - 0.8, -a + 3.5, 0.9);
  }

  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const spots = [];
  for (let k = 0; k < 24; k++) spots.push([(rnd() < 0.5 ? -1 : 1) * (a + 1.5 + rnd() * (b - a - 3)), zW + 5 + rnd() * (qz - zW - 6), rnd() * Math.PI * 2]);
  for (let k = 0; k < 8; k++) spots.push([a + 3 + rnd() * (TA - 6), -a + 1 + rnd() * (2 * a - 2), Math.PI / 2 + (rnd() - 0.5)]);
  g.add(visitors(spots, 33));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: zW + 1.8 } };
}
