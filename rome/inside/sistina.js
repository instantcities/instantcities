// The Sistine Chapel from the inside, simplified: one tall hall (40.9 × 13.4 m, 20.7 m high) under
// its low barrel vault, Michelangelo's ceiling laid over it, the Last Judgment over the altar at the
// far end, the marble screen across the floor of Cosmatesque roundels, the walls in three tiers:
// painted curtains, the frescoes of the lives of Moses and of Christ, the windows with the popes
// between them. Tourists stand about looking up.
//
// Game metres, x across and z along, from the middle of the floor; the door out in the east wall
// (here at -z), the altar at +z.
import * as THREE from 'three';
import { Parts } from '../../core/js/inside/gothic.js';
import { hall, framed, bench, paintedVault, patternFloor, visitors, rope } from '../../core/js/inside/rooms.js';
import { sistineCeiling, lastJudgment, chapelFresco, drapery, cosmati, oldMaster } from '../../core/js/inside/art.js';
import { plaque } from '../../core/js/inside/pictures.js';
import { steps, candelabra } from '../../core/js/inside/props.js';

const X = 8.4, Z = 25.5, WALL = 17, RISE = 8.5; // half its width and length, where the vault springs, how high it rises
const TINT = { stone: 0xe6dcc8, pier: 0xdcd2bc, vault: 0xf2ecde, rib: 0xd9cfba, wall: 0xe8dcc4 };

export function makeSistina() {
  const p = new Parts(TINT), g = new THREE.Group();
  p.floor(-X, -Z, X, Z, patternFloor(cosmati(), 1.6));

  // the walls, six windows high up along each side, the door out in the middle of the east end
  const windows = Array.from({ length: 6 }, (_, k) => [4.3 + k * 8.5, 2.6, 11.6, 15.8, 5]);
  hall(p, { x0: -X, z0: -Z, x1: X, z1: Z, h: WALL, color: 0xe8dcc4, doors: { s: [[X, 3.6, 5]] }, windows: { w: windows, e: windows } });
  for (const s of [-1, 1]) p.dark.box(1.75, 5, 0.14, 0x4a3426, s * 0.9, 2.5, -Z - 0.1); // the doors, shut
  p.wallRing([-1.8, -Z], [1.8, -Z], 0.4);
  p.picture(plaque(['CAPPELLA SISTINA', 'Silenzio · No photo'], 640, 220), 4.4, 1.5, 0, 6.4, -Z + 0.47, 0);

  // the vault: Michelangelo's ceiling, the lunettes' ends closing it off over the end walls
  g.add(paintedVault(-X + 0.45, -Z + 0.45, X - 0.45, Z - 0.45, WALL, RISE, sistineCeiling(), { flat: 0.35 }));
  for (const z of [-Z + 0.45, Z - 0.45]) {
    const shape = new THREE.Shape();
    shape.moveTo(-X, 0);
    for (let i = 0; i <= 24; i++) { const a = Math.PI * (i / 24); shape.lineTo(-X * Math.cos(a), Math.pow(Math.sin(a), 0.65) * RISE); }
    p.plaster.add(new THREE.ShapeGeometry(shape).translate(0, WALL, z), 0xd8ccb0);
  }

  // the tiers of the side walls: curtains below, frescoes in the middle, popes between the windows
  const curtains = drapery();
  curtains.repeat.set(10, 1);
  for (const [x, ry] of [[-X + 0.47, Math.PI / 2], [X - 0.47, -Math.PI / 2]]) {
    p.picture(curtains, 2 * Z - 1.2, 5, x + Math.sign(-x) * 0.02, 2.6, 0, ry);
    for (let k = 0; k < 6; k++) {
      const z = -Z + 4.3 + k * 8.5;
      framed(p, chapelFresco(k + (x < 0 ? 0 : 6)), 7.6, 4.6, x, 8.0, z, ry, { f: 0.22, color: 0xc8a870, label: false });
      if (k < 5) framed(p, oldMaster(5 * (k + 7)), 1.5, 2.6, x, 13.6, z + 4.25, ry, { f: 0.15, color: 0xc8a870, label: false }); // a pope in his niche
    }
    p.stone.box(0.5, 0.4, 2 * Z - 1.2, 0xd8c8a8, x + Math.sign(-x) * 0.2, 5.4, 0); // the cornices between the tiers
    p.stone.box(0.5, 0.4, 2 * Z - 1.2, 0xd8c8a8, x + Math.sign(-x) * 0.2, 10.8, 0);
  }

  // the altar wall: the Last Judgment from the floor up into the lunettes, the altar on its steps before it
  p.picture(lastJudgment(), 2 * X - 1.4, 18.5, 0, WALL / 2 + 1.6, Z - 0.5, Math.PI);
  steps(p, 0, Z - 3.2, 6.4, 4.0, 2, 0.3);
  p.marble.box(3.4, 1.2, 1.3, 0xf0ece2, 0, 0.6 + 0.6, Z - 3.0);
  p.gold.box(0.12, 1.1, 0.12, 0xd2a94a, 0, 2.4, Z - 3.0);
  p.gold.box(0.6, 0.1, 0.1, 0xd2a94a, 0, 2.7, Z - 3.0);
  for (const s of [-1, 1]) candelabra(p, s * 1.4, Z - 3.0, 1.6);
  p.block(0, Z - 3.2, 3.4, 2.2);
  rope(p, [-X + 1, Z - 6.4], [X - 1, Z - 6.4]);

  // the marble screen across the chapel, with its gate open in the middle, and the singers' gallery on the south wall
  const sz = -6;
  for (const s of [-1, 1]) {
    p.marble.box(X - 1.9, 1.4, 0.4, 0xf0ece2, s * (X + 1.9) / 2, 0.7, sz);
    for (let x = 2.1; x < X - 0.2; x += 0.45) p.gold.rod([s * x, 1.4, sz], [s * x, 3.3, sz], 0.04, 0x8a6a2a, 4); // the bronze grille
    p.gold.box(X - 1.9, 0.12, 0.12, 0x8a6a2a, s * (X + 1.9) / 2, 3.3, sz);
    for (let q = 0; q < 6; q++) p.marble.add(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 6), 0xf0ece2, s * (2 + q * 1.2), 3.6, sz);
    p.wallRing([s * 1.9, sz], [s * X, sz], 0.5);
  }
  p.marble.box(1.4, 0.8, 4.4, 0xe8e2d4, X - 1.2, 5.6, 2); // the cantoria
  p.marble.box(0.1, 1.0, 4.4, 0xf0ece2, X - 1.9, 6.4, 2);

  // the benches along the walls, the tourists looking up
  for (const s of [-1, 1]) for (const z of [-18, -10, 4, 12]) bench(p, s * (X - 1.4), z, 5, Math.PI / 2);
  let seed = 9;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const spots = [];
  for (let k = 0; k < 34; k++) spots.push([(rnd() - 0.5) * (2 * X - 5), -Z + 4 + rnd() * (2 * Z - 13), rnd() * Math.PI * 2]);
  g.add(visitors(spots, 77));

  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: -Z + 1.6 } };
}
