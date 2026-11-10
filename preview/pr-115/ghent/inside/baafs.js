// Sint-Baafskathedraal from the inside, modelled by hand and simplified: the six bays of the
// nave under the white rib vault, the black and white marble floor laid on the diagonal, the
// transept, the choir with its screen of arches and the ambulatory round it, and the chapels at the
// back, the middle one the shrine of the Lam Gods. Pews in the west bays, the Delvaux pulpit on a
// pier, the baroque high altar, saints on the piers, chandeliers, side altars and tombs.
import * as THREE from 'three';
import { cruciform, floorMat } from '../../core/js/inside/gothic.js';
import { saint, pew, chandelier, candelabra, steps, sunburst } from '../../core/js/inside/props.js';
import { lamGodsTexture, darkPainting } from '../../core/js/inside/lamgods.js';

const GOLD = 0xd2a94a, OAK = 0x7a4f2a, OAK_DARK = 0x5a3a1e, BLACK = 0x1c1b1e, MARBLE = 0xe8e4da;

export const CONFIG = {
  pitch: 8.75, a: 6.9, aisle: 8.1, nave: 6, choir: 3, arm: 17.5,
  ySA: 9.5, rA: 4.2, ySV: 21, rV: 8,
  seed: 2,
  tint: { stone: 0xd9d1c0, pier: 0xcfc7b4, vault: 0xf1ede3, rib: 0xd5cbb4, wall: 0xe9e3d5 },
  floor: floorMat('#e8e4da', '#26242a', true, 1.5),
  chapels: [{ x: -10, w: 8, d: 9 }, { x: 0, w: 10, d: 12, floor: floorMat('#d8d2c4', '#3a2d24', true, 1.5) }, { x: 10, w: 8, d: 9 }],
};

export function makeBaafs() {
  const church = cruciform(CONFIG);
  const p = church.parts, { a, b, P, zW, zE, zA, TA, ySV, rV } = church;
  const foot = p.foot;

  // ---- the west doors, shut: ride into them to go out into the Sint-Baafsplein
  p.doors([-a, zW], [a, zW], a - 2.7, a + 2.7, 6.2, 2.4);

  // ---- pews in the three west bays, two blocks with the middle aisle between them
  const pewZ = [];
  for (let z = zW + 5; z < zW + 26; z += 2.2) pewZ.push(z);
  for (const z of pewZ) for (const s of [-1, 1]) pew(p, s * 3.5, z, 4, 0);
  for (const s of [-1, 1]) p.block(s * 3.5, (pewZ[0] + pewZ.at(-1)) / 2, 2.1, (pewZ.at(-1) - pewZ[0]) / 2 + 0.7);

  // ---- saints on brackets on the faces of the nave's piers
  for (const s of [-1, 1]) {
    for (let k = 1; k <= 5; k++) {
      const z = -a - k * P, x = s * (a - 1.7);
      p.stone.box(0.8, 0.9, 0.8, 0xcfc7b4, x, 5.5, z);
      saint(p, x, 5.95, z, 1.3, -s * Math.PI / 2, { robe: k % 2 ? 0xf0ece2 : 0xe6dfd0 });
    }
  }

  // ---- chandeliers over the middle of the nave, the crossing and the choir
  for (let k = 0; k < 6; k++) chandelier(p, 0, 15.5, -a - (k + 0.5) * P, 1.5, ySV + rV - 0.3, 14);
  chandelier(p, 0, 15.5, 0, 1.7, ySV + rV - 0.3, 16);
  for (let j = 0; j < 3; j++) chandelier(p, 0, 15.5, a + (j + 0.5) * P, 1.5, ySV + rV - 0.3, 14);

  // ---- the pulpit, on the pier of the third bay on the north side: an oak tree for its foot,
  // the basket held up by it, two white figures leaning on the rim, a sounding board with an angel
  {
    const x = -a + 2.6, z = -a - 3 * P, wood = p.wood;
    wood.add(new THREE.CylinderGeometry(0.75, 1.2, 3.4, 8).translate(0, 1.7, 0), OAK_DARK, x, 0, z);
    for (let q = 0; q < 6; q++) {
      const t = (q / 6) * Math.PI * 2;
      wood.rod([x + Math.cos(t) * 0.5, 0.3, z + Math.sin(t) * 0.5], [x + Math.cos(t) * 1.7, 0.05, z + Math.sin(t) * 1.7], 0.28, OAK_DARK, 5);
      wood.rod([x, 3.2, z], [x + Math.cos(t) * 1.5, 4.4, z + Math.sin(t) * 1.5], 0.18, OAK, 5);
    }
    wood.add(new THREE.CylinderGeometry(1.9, 1.5, 1.5, 8).translate(0, 4.65, 0), OAK, x, 0, z);
    p.gold.add(new THREE.TorusGeometry(1.9, 0.12, 5, 16).rotateX(Math.PI / 2), GOLD, x, 5.45, z);
    saint(p, x + 0.9, 4.0, z + 1.9, 1.05, Math.PI * 0.8, { halo: false, robe: 0xf2eee6 });
    saint(p, x + 0.9, 4.0, z - 1.9, 1.05, Math.PI * 0.2, { halo: false, robe: 0xf2eee6 });
    wood.add(new THREE.CylinderGeometry(0.4, 3.0, 1.2, 8, 1, true).translate(0, 9.2, 0), OAK, x, 0, z);
    wood.rod([x, 9.7, z], [x, 13, z], 0.12, OAK_DARK, 5);
    p.gold.add(new THREE.SphereGeometry(0.4, 6, 5), GOLD, x, 13.1, z);
    saint(p, x, 9.7, z, 0.8, 0, { robe: 0xf6f2ea });
    // the stair winding up round it
    for (let q = 0; q < 12; q++) {
      const t = 0.5 + q * 0.32, r = 3.0;
      wood.box(1.1, 0.14, 0.55, OAK, x + Math.cos(t) * r, 0.3 + q * 0.26, z + Math.sin(t) * r, 0, -t + Math.PI / 2, 0);
    }
    p.block(x, z, 2.2);
  }

  // ---- the high altar in the choir: three steps, the altar table, a retable of black columns under
  // a gilded pediment with a sunburst and St Bavo
  {
    const z = zE - 4.6, zBack = zE - 1.2;
    steps(p, 0, z, 9.6, 8.2, 3, 0.28);
    p.marble.box(5.4, 1.15, 2.1, 0xf0ece2, 0, 0.84 + 0.58, z + 0.2);
    p.gold.box(5.6, 0.12, 2.3, GOLD, 0, 0.84 + 1.2, z + 0.2);
    p.dark.box(7.2, 7.2, 0.7, 0x3a2224, 0, 0.84 + 3.6, zBack);
    for (const cx of [-3.4, -1.9, 1.9, 3.4]) {
      p.dark.add(new THREE.CylinderGeometry(0.38, 0.42, 6.4, 10).translate(0, 3.2, 0), 0x1f1c1f, cx, 0.84, zBack - 0.8);
      p.gold.add(new THREE.CylinderGeometry(0.55, 0.38, 0.5, 10).translate(0, 6.65, 0), GOLD, cx, 0.84, zBack - 0.8);
    }
    p.gold.box(8.4, 0.7, 1.9, GOLD, 0, 0.84 + 7.2, zBack - 0.5);
    p.marble.box(7.2, 0.6, 1.5, 0xf0ece2, 0, 0.84 + 7.85, zBack - 0.5);
    p.gold.box(5.2, 0.6, 1.2, GOLD, 0, 0.84 + 8.4, zBack - 0.4);
    p.gold.box(2.8, 0.7, 0.9, GOLD, 0, 0.84 + 8.95, zBack - 0.3);
    sunburst(p, 0, 5.3, zBack - 0.45, 2.3, Math.PI);
    saint(p, 0, 3.1, zBack - 0.6, 1.9, Math.PI, { robe: 0xf0ece2 });
    for (const s of [-1, 1]) {
      saint(p, s * 2.7, 4.0, zBack - 0.5, 1.2, Math.PI, { robe: 0xece6d8 });
      candelabra(p, s * 6.0, z + 1.5, 3.4);
    }
    p.block(0, z, 4.8, 4.3);
  }

  // ---- the choir stalls along both sides of the choir
  for (const s of [-1, 1]) {
    const x = s * (a - 1.5), z0 = a + 4, z1 = zE - 10;
    p.wood.box(1.5, 1.0, z1 - z0, OAK, x, 0.5, (z0 + z1) / 2);
    p.wood.box(0.35, 3.0, z1 - z0, OAK_DARK, x + s * 0.75, 1.5, (z0 + z1) / 2);
    p.wood.box(1.7, 0.2, z1 - z0, OAK_DARK, x + s * 0.4, 3.1, (z0 + z1) / 2);
    for (let z = z0 + 1; z < z1; z += 1.7) p.gold.box(0.3, 0.7, 0.3, GOLD, x + s * 0.75, 3.55, z);
    p.block(x, (z0 + z1) / 2, 0.85, (z1 - z0) / 2);
  }

  // ---- baroque side altars against the aisles' outer walls, under the windows
  for (const [s, z] of [[-1, -a - 2.5 * P], [1, -a - 4.5 * P], [-1, -a - 4.5 * P], [1, -a - 1.5 * P], [-1, a + 1.5 * P], [1, a + 1.5 * P]]) {
    const x = s * (b - 1.1);
    p.marble.box(1.4, 1.1, 3.4, MARBLE, x, 0.55, z);
    p.dark.box(0.6, 3.0, 3.0, 0x2a2024, s * (b - 0.5), 2.3, z);
    p.gold.box(0.5, 0.5, 3.4, GOLD, s * (b - 0.55), 3.9, z);
    p.gold.rod([s * (b - 0.9), 1.4, z - 1.3], [s * (b - 0.9), 3.4, z - 1.3], 0.1, GOLD, 5);
    p.gold.rod([s * (b - 0.9), 1.4, z + 1.3], [s * (b - 0.9), 3.4, z + 1.3], 0.1, GOLD, 5);
    p.glow.add(new THREE.SphereGeometry(0.09, 5, 4), 0xfff0c0, x, 1.5, z - 1.0);
    p.glow.add(new THREE.SphereGeometry(0.09, 5, 4), 0xfff0c0, x, 1.5, z + 1.0);
    saint(p, s * (b - 0.9), 1.1, z, 1.0, -s * Math.PI / 2 + Math.PI, { robe: 0xf0ece2 });
    p.block(x, z, 0.9, 1.8);
  }

  // ---- the tombs of two bishops in the ambulatory, black marble with a white figure kneeling on it
  for (const s of [-1, 1]) {
    const x = s * 9, z = zE + 4.1;
    p.dark.box(1.8, 1.3, 3.4, BLACK, x, 0.65, z);
    p.marble.box(2.1, 0.2, 3.7, 0xe8e4da, x, 1.4, z);
    saint(p, x, 1.5, z, 0.8, s > 0 ? Math.PI : Math.PI, { robe: 0xf0ece2, halo: false });
    p.block(x, z, 1.2, 2.0);
  }

  // ---- Rubens's big dark painting on the south end of the transept, under the window
  p.picture(darkPainting(), 8.4, 5.6, TA + a - 0.85, 3.7, 0, -Math.PI / 2);
  for (const dy of [-2.9, 2.9]) p.gold.box(0.25, 0.3, 8.9, GOLD, TA + a - 0.74, 3.7 + dy, 0);
  for (const dz of [-4.3, 4.3]) p.gold.box(0.25, 6.1, 0.3, GOLD, TA + a - 0.74, 3.7, dz);

  // ---- the shrine of the Lam Gods in the middle chapel at the back: the polyptych open on the east wall,
  // in a case of bronze and glass on a marble plinth, lit from above, behind a rope
  {
    const ch = CONFIG.chapels[1], z1 = zA + ch.d, wz = z1 - 0.85;
    p.picture(lamGodsTexture(), 8.0, 4.7, 0, 4.4, wz, Math.PI);
    p.marble.box(9.2, 1.3, 1.5, 0xd8d2c4, 0, 0.65, wz - 0.5);
    p.dark.box(0.18, 6.9, 0.18, 0x3a3226, -4.1, 3.6, wz - 0.25);
    p.dark.box(0.18, 6.9, 0.18, 0x3a3226, 4.1, 3.6, wz - 0.25);
    p.dark.box(8.4, 0.2, 0.3, 0x3a3226, 0, 7.05, wz - 0.25);
    p.dark.box(8.4, 0.2, 0.3, 0x3a3226, 0, 1.3, wz - 0.25);
    p.glow.box(7.6, 0.08, 0.5, 0xfff0d0, 0, 6.85, wz - 0.7);
    for (const s of [-1, 1]) for (let q = 0; q < 3; q++) {
      p.dark.rod([s * (1.5 + q * 1.4), 0, z1 - 3.4], [s * (1.5 + q * 1.4), 1.1, z1 - 3.4], 0.07, 0x2a2620, 5);
      p.gold.add(new THREE.SphereGeometry(0.12, 6, 5), GOLD, s * (1.5 + q * 1.4), 1.15, z1 - 3.4);
    }
    p.block(0, z1 - 1.3, 4.7, 1.3);
  }

  const g = new THREE.Group();
  g.add(p.mesh());
  // the doors out: a little way inside the west doors, which way is into the church
  return { group: g, foot, church, door: { x: 0, z: zW + 1.8 } };
}
