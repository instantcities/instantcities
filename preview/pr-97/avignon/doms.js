// Notre-Dame des Doms, Avignon's cathedral on the Rocher des Doms, north of the Palais des Papes,
// modelled by hand in place of the map's block of it, on the map's outline of it, in game metres (the
// real ones times 1.25). Romanesque, of the middle of the 12th century, in the same pale limestone
// as the palace:
//   the porch at its west end, with its pediment over a round arch, after the Roman temples of
//     Provence
//   the bell tower behind it, Romanesque below and rebuilt in the 15th century above, with its
//     belfry's pointed openings, and on top the statue of the Virgin, Notre-Dame des Doms herself,
//     6 m of gilded lead put up in 1859, shining out over the town
//   the nave under its low roof of curved tiles, the octagonal lantern over the bay before the
//     choir, the round apse at the east end, and the chapels added along both sides
// The model's own metres: u along the nave to the east, v across it to the south, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, gable, archRing, pointedRing } from '../core/js/arcade.js';
import { toLocal, sides, block, flat, box4 } from './outline.js';

const X = 318, Z = -624, TURN = 0.069;
// the map's outline of the cathedral (the city's metres)
const RING = [321.8,-645.2,321.8,-647.1,319.2,-647,319.3,-644.9,316,-644.8,315.9,-646.6,313.9,-646.5,313.9,-644.6,310.2,-644.4,310.1,-646.2,308.1,-646.1,308.2,-644.2,299.6,-643.9,299.5,-645.4,297.4,-645.3,297.5,-643.4,291.3,-643.2,289.9,-644,289.1,-642.7,290.6,-641.9,290.7,-637,282.9,-636.8,282.8,-638.1,284.2,-639.3,283.4,-640.3,282.2,-639.3,281.4,-640.3,281.3,-641,280,-640.9,280.1,-639.9,277.9,-639.7,277.7,-641.6,276.5,-641.4,276.7,-639.6,275.8,-638.8,274.9,-639.8,274,-639,273.3,-638.9,273.2,-639.8,271.9,-639.7,272,-638.9,273,-628.6,265.5,-627.9,266.9,-613.4,274.2,-614.1,274.6,-609.4,277.5,-609.7,278.2,-602.6,288.3,-603.6,287.7,-610.1,294.1,-610.7,294.4,-607.8,300.4,-608.3,300.8,-603.9,303.9,-601.2,309.5,-601.4,312,-604.8,311.7,-609.3,315.8,-609.6,316.6,-597.6,337.9,-599.1,336.5,-619.2,340.1,-619.5,341,-618.3,342.2,-619.2,341.1,-620.7,342,-621.3,342.9,-622.8,343.2,-623.4,344.5,-622.9,345.2,-624.7,343.6,-625.3,344,-626.5,343.9,-627.8,343.7,-628.6,345.4,-629.1,344.7,-631.2,342.6,-630.6,342.3,-631.6,342,-631.9,341,-632.7,340.2,-633,340.9,-635,339.3,-635.6,338.8,-634.2,334.9,-634,334.7,-637.3,330.2,-637.1,330.1,-639.6,336.7,-639.9,336.8,-637.3,349.3,-637.9,349.5,-635.1,371.3,-636.1,371,-642.5,378.3,-642.8,378.1,-647.9];
const NAVE = { u0: -32, u1: 18, v: -1.5, hw: 7.5, eaves: 21, ridge: 25 };
const TOWER = { u0: -44.6, u1: -32, v0: -7.5, v1: 6, h: 40 };
const STONE = '#ddcca8', SHADE = '#cbb894', ROOF = '#b5714f', DARK = '#2d2824', GOLD = '#e0b84a';

export function doms() {
  const kit = new Kit(), ring = toLocal(RING, X, Z, TURN);
  // the chapels along the sides, and the low buildings at the east end, under flat roofs
  block(kit, ring, 0, 12, SHADE);
  flat(kit, ring, 12, ROOF);
  for (const p of sides(ring, { min: 4 })) wall(kit, p, [[0, 11.4], [p.length, 11.4], [p.length, 12.4], [0, 12.4]], { o0: 0, o1: 0.4, hex: STONE });

  // the nave, its round windows high up, and its roof
  const { u0, u1, v, hw, eaves, ridge } = NAVE;
  kit.box(u1 - u0, eaves, 2 * hw, STONE, (u0 + u1) / 2, eaves / 2, v);
  for (const p of sides(box4(u0, v - hw, u1, v + hw))) if (p.length > 30) {
    for (let s = 6; s < p.length - 4; s += 8) wall(kit, p, archRing(s, 1.6, 14.5, 18.5, 6), { o0: 0, o1: 0.06, hex: DARK });
    wall(kit, p, [[0, eaves - 0.8], [p.length, eaves - 0.8], [p.length, eaves], [0, eaves]], { o0: 0, o1: 0.5, hex: SHADE });
  }
  gable(kit, u0, u1, hw + 0.8, eaves, ridge, ROOF, { z: v });
  // the round apse at the east end, under its half cone
  kit.add(new THREE.CylinderGeometry(7.5, 7.5, 19, 14, 1, false, 0, Math.PI), STONE, u1, 9.5, v);
  kit.add(new THREE.ConeGeometry(8.2, 4, 14, 1, false, 0, Math.PI), ROOF, u1, 21, v);
  for (const a of [0.5, 1.57, 2.64]) kit.box(0.3, 4, 1.3, DARK, u1 + 7.5 * Math.sin(a), 12, v + 7.5 * Math.cos(a), 0, a + Math.PI / 2);
  // the octagonal lantern over the bay before the choir
  const lu = 9;
  kit.box(13, 5, 13, STONE, lu, eaves + 2, v);
  kit.add(new THREE.CylinderGeometry(5.2, 5.6, 6, 8), STONE, lu, eaves + 7.5, v);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    kit.box(1, 2.6, 0.3, DARK, lu + 5.35 * Math.cos(a), eaves + 7.8, v + 5.35 * Math.sin(a), 0, -a - Math.PI / 2);
  }
  kit.add(new THREE.ConeGeometry(6.2, 3.4, 8), ROOF, lu, eaves + 12.2, v);
  kit.add(new THREE.CylinderGeometry(1, 1, 2.2, 8), STONE, lu, eaves + 14.6, v);
  kit.add(new THREE.ConeGeometry(1.3, 1.4, 8), ROOF, lu, eaves + 16.4, v);

  // the bell tower: its plain lower storeys, the belfry, the cornice, and the Virgin on her pedestal
  const T = TOWER, tu = (T.u0 + T.u1) / 2, tv = (T.v0 + T.v1) / 2;
  kit.box(T.u1 - T.u0, T.h, T.v1 - T.v0, STONE, tu, T.h / 2, tv);
  for (const p of sides(box4(T.u0, T.v0, T.u1, T.v1))) {
    const L = p.length;
    for (const y of [16, 27]) wall(kit, p, [[0, y], [L, y], [L, y + 0.7], [0, y + 0.7]], { o0: 0, o1: 0.4, hex: SHADE });
    wall(kit, p, archRing(L / 2, 1.2, 20, 23.5, 6), { o0: 0, o1: 0.06, hex: DARK });
    for (const s of [L * 0.3, L * 0.7]) wall(kit, p, pointedRing(s, 2.4, 29, 36.5, 1, 6), { o0: 0, o1: 0.06, hex: DARK });
    wall(kit, p, [[-0.4, T.h - 1.2], [L + 0.4, T.h - 1.2], [L + 0.4, T.h + 0.6], [-0.4, T.h + 0.6]], { o0: -0.2, o1: 0.7, hex: SHADE });
  }
  kit.add(new THREE.CylinderGeometry(3.2, 3.8, 3.4, 8), STONE, tu, T.h + 2.3, tv);
  kit.add(new THREE.CylinderGeometry(1.7, 2.1, 3, 8), SHADE, tu, T.h + 5.5, tv);
  // the statue: her robe flaring to the ground, her arms, her head with its crown
  const y0 = T.h + 7;
  kit.add(new THREE.CylinderGeometry(0.75, 1.35, 5.4, 10), GOLD, tu, y0 + 2.7, tv);
  kit.add(new THREE.CylinderGeometry(0.95, 0.75, 1.1, 10), GOLD, tu, y0 + 5.9, tv);
  for (const s of [-1, 1]) kit.box(0.4, 2.6, 0.4, GOLD, tu, y0 + 4.8, tv + s * 0.95, s * 0.35, 0, 0);
  kit.add(new THREE.SphereGeometry(0.55, 8, 6), GOLD, tu, y0 + 7, tv);
  kit.add(new THREE.CylinderGeometry(0.5, 0.42, 0.45, 8), GOLD, tu, y0 + 7.65, tv);

  // the porch at the west end: its walls, the round arch, the columns and the pediment
  const P = { u0: -52, u1: T.u0, v0: -7.2, v1: 6.8, h: 11 };
  const pv = (P.v0 + P.v1) / 2;
  kit.box(P.u1 - P.u0, P.h, P.v1 - P.v0, STONE, (P.u0 + P.u1) / 2, P.h / 2, pv);
  const west = sides(box4(P.u0, P.v0, P.u1, P.v1)).find(p => p.at(0).x < P.u0 + 0.1 && p.at(p.length).x < P.u0 + 0.1);
  wall(kit, west, archRing(west.length / 2, 5, 0, 8, 10), { o0: 0, o1: 0.08, hex: DARK });
  for (const ds of [-3.6, 3.6]) {
    const q = west.at(west.length / 2 + ds);
    kit.add(new THREE.CylinderGeometry(0.45, 0.5, 8, 10), SHADE, q.x - 0.6, 4.3, q.z);
  }
  gable(kit, P.u0 - 0.6, P.u1, (P.v1 - P.v0) / 2 + 0.6, P.h, P.h + 4, ROOF, { z: pv });
  // the pediment's stone face over the arch, a little out from the roof's end
  const ped = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, P.h, P.v0 - 0.2, 0, P.h, P.v1 + 0.2, 0, P.h + 3.8, pv], 3));
  kit.add(ped, STONE, P.u0 - 0.65, 0, 0);
  kit.box(0.8, 0.6, P.v1 - P.v0 + 1, SHADE, P.u0 - 0.3, P.h - 0.2, pv);
  return kit.mesh(kitMat(0.88));
}

export const DOMS = [{ id: 'notre-dame-des-doms', name: 'Notre-Dame des Doms', x: X, z: Z, turn: TURN, reach: 90, area: [RING], foot: [RING], make: doms }];
