// The Kunsthistorisches Museum from the inside, as three of its key rooms rather than its real plan:
// the grand staircase with Canova's Theseus on its landing and Klimt's paintings between the columns
// high up, the cupola hall under its dome (the café is there), and the Bruegel room, which has the
// most Bruegels in the world: the Tower of Babel, the Hunters in the Snow, the Peasant Wedding.
//
// Game metres, x across and z along; the door out (to Maria-Theresien-Platz) at -z.
import * as THREE from 'three';
import { Parts, floorMat } from '../../core/js/inside/gothic.js';
import { hall, skylight, framed, bench, plinth, rope, visitors, crowd, roundWall, patternFloor, wanderers } from '../../core/js/inside/rooms.js';
import { towerOfBabel, huntersInSnow, peasantWedding, oldMaster, masterSize, pantheonFloor, famous } from '../../core/js/inside/art.js';
import { roman } from '../../core/js/inside/statues.js';
import { chandelier } from '../../core/js/inside/props.js';
import { plaque } from '../../core/js/inside/pictures.js';

const TINT = { stone: 0xd8ccb4, pier: 0xc8b898, vault: 0xf2ecde, rib: 0xd9cfba, wall: 0xe0d6c2 };
const GOLD = 0xd2a94a, MARBLE = 0xd8c8a8, RED = 0x7a2a2a;

export const STAIR = { x0: -12, z0: -14, x1: 12, z1: 30, h: 20 };
const CUPOLA = { x: 0, z: 43, r: 12.5 };
const BRUEGEL = { x0: 12.9, z0: 32, x1: 40, z1: 54, h: 9 };

export function makeKHM() {
  const p = new Parts(TINT), g = new THREE.Group();

  // ---- the staircase hall: marble, the stair rising north to its landing with Theseus on it,
  // Klimt's spandrels and lunettes up between the columns of the gallery round it
  {
    const S = STAIR;
    p.floor(S.x0, S.z0, S.x1, S.z1, floorMat('#e0d4bc', '#a88a6a', true, 1.2));
    hall(p, { ...S, color: 0xe0d6c2, doors: { s: [[12, 4, 5]], n: [[12, 6, 7]] } });
    skylight(p, S.x0, S.z0, S.x1, S.z1, S.h, { color: 0xe8dcc0, glass: 0.4 });
    for (const s of [-1, 1]) p.dark.box(1.9, 5, 0.14, 0x2a2622, s * 1, 2.5, S.z0 - 0.1);
    p.wallRing([-2, S.z0], [2, S.z0], 0.4);
    // the stair, in two flights either side of the landing's front, Theseus on top
    const top = 6, z0 = 0, z1 = 12;
    for (let q = 0; q < 16; q++) { const z = z0 + ((z1 - z0) * q) / 16; p.marble.box(10, (top * (q + 1)) / 16, (z1 - z0) / 16 + 0.02, q % 2 ? 0xe8e0d0 : 0xdcd2c0, 0, (top * (q + 1)) / 16 / 2, z + (z1 - z0) / 32); }
    p.marble.box(2 * S.x1 - 1, top, S.z1 - z1 - 6, 0xdcd2c0, 0, top / 2, (z1 + S.z1 - 6) / 2);
    p.block(0, (z0 + S.z1 - 6) / 2, S.x1 - 0.5, (S.z1 - 6 - z0) / 2);
    const ph = plinth(p, 0, 15, 3, 2.2, 1.2);
    p.marble.box(3, ph, 2.2, MARBLE, 0, top + ph / 2, 15);
    roman(p, -0.6, top + ph, 15, 2.6, Math.PI, 0); roman(p, 0.8, top + ph, 15.4, 2.0, Math.PI - 0.6, 3); // Theseus over the centaur
    // the gallery's columns round the top, the Klimts between them
    for (const s of [-1, 1]) for (let k = 0; k < 6; k++) {
      const z = S.z0 + 4 + k * 7.6;
      p.marble.add(new THREE.CylinderGeometry(0.45, 0.5, 6, 10).translate(0, 3, 0), 0x9a4a3a, s * (S.x1 - 1.2), 10, z);
      if (k < 5) framed(p, oldMaster(5 * (k + 90) + 4), 2.0, 2.4, s * (S.x1 - 0.47), 13.2, z + 3.8, -s * Math.PI / 2, { f: 0.15, color: GOLD, label: false });
    }
    p.picture(plaque(['KUNSTHISTORISCHES MUSEUM'], 768, 160), 7, 1.4, 0, 4.4, S.z0 + 0.47, 0);
    g.add(visitors([[-4, -6, 0.2], [3, -3, -0.4], [6, -9, 0.6], [-6, -2, 0.1]], 81));
  }
  // ---- the cupola hall: round under its dome, the café's tables, the dome's oculus
  {
    const { x, z, r } = CUPOLA, h = 14;
    p.floor(-3.2, STAIR.z1 - 0.5, 3.2, z - r + 1, floorMat('#e0d4bc', '#a88a6a', true, 1.2)); // the doorway from the stair
    p.floor(x - r, z - r, x + r, z + r, patternFloor(pantheonFloor(), 2));
    const gap = Math.asin(3.2 / r);
    // its wall, with the doorways from the stair (south) and to the Bruegels (east), and the wall over them
    p.plaster.add(new THREE.CylinderGeometry(r, r, h, 48, 1, true, Math.PI / 2 + gap, Math.PI / 2 - 2 * gap).translate(0, h / 2, 0), 0xe0d6c2, x, 0, z);
    p.plaster.add(new THREE.CylinderGeometry(r, r, h, 48, 1, true, Math.PI + gap, Math.PI * 1.5 - 2 * gap).translate(0, h / 2, 0), 0xe0d6c2, x, 0, z);
    for (const a of [Math.PI / 2, Math.PI]) p.plaster.add(new THREE.CylinderGeometry(r, r, h - 6, 12, 1, true, a - gap, 2 * gap).translate(0, 6 + (h - 6) / 2, 0), 0xe0d6c2, x, 0, z);
    roundWall(p, x, z, r, 40, [[Math.PI / 2 - gap, Math.PI / 2 + gap], [Math.PI - gap, Math.PI + gap]]);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 12, 0, Math.PI * 2, 0.22, Math.PI / 2 - 0.22), new THREE.MeshStandardMaterial({ color: 0xf0e8d6, roughness: 0.9, side: THREE.DoubleSide }));
    dome.position.set(x, h, z);
    g.add(dome);
    p.gold.add(new THREE.TorusGeometry(r - 0.3, 0.35, 4, 48).rotateX(Math.PI / 2), GOLD, x, h, z);
    p.daylight.add(new THREE.CircleGeometry(r * Math.sin(0.22), 24).rotateX(Math.PI / 2), 0xf6f2e6, x, h + r * Math.cos(0.22) - 0.05, z);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + 0.3, tx = x + Math.sin(a) * 6.5, tz = z + Math.cos(a) * 6.5;
      p.marble.add(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 14).translate(0, 0.95, 0), 0xf4f0e6, tx, 0, tz);
      p.dark.add(new THREE.CylinderGeometry(0.06, 0.06, 0.95, 5).translate(0, 0.47, 0), 0x2a2622, tx, 0, tz);
      p.block(tx, tz, 0.8);
    }
    chandelier(p, x, 9, z, 2.4, h + r * 0.9, 18);
    g.add(visitors([[x - 6, z - 2, 1.2], [x + 5, z + 3, -2.0], [x + 1, z - 7, 0.1], [x - 3, z + 6, 2.8]], 85));
  }
  // ---- the Bruegel room: red silk walls, his three most famous on them
  {
    const B = BRUEGEL, cz = (B.z0 + B.z1) / 2;
    p.floor(B.x0, B.z0, B.x1, B.z1, floorMat('#8a5a32', '#7a4e2a', true, 0.55));
    hall(p, { ...B, color: RED, doors: { w: [[CUPOLA.z - B.z0, 5, 6]] } });
    skylight(p, B.x0, B.z0, B.x1, B.z1, B.h, { color: 0xe8e4dc, along: 'x', glass: 0.5 });
    framed(p, towerOfBabel(), 1.55 * 1.25, 1.14 * 1.25, B.x1 - 0.47, 3.0, cz, -Math.PI / 2, { f: 0.22 });
    framed(p, huntersInSnow(), 1.62 * 1.25, 1.17 * 1.25, (B.x0 + B.x1) / 2, 3.0, B.z1 - 0.47, Math.PI, { f: 0.22 });
    framed(p, peasantWedding(), 1.64 * 1.25, 1.14 * 1.25, (B.x0 + B.x1) / 2, 3.0, B.z0 + 0.47, 0, { f: 0.22 });
    // beside them his Children's Games, and Vermeer's Art of Painting
    framed(p, famous('childrens-games', 2.5, 1.83), 2.5, 1.83, B.x0 + 6, 3.0, B.z1 - 0.47, Math.PI, { f: 0.22 });
    framed(p, famous('the-art-of-painting', 1.6, 1.92), 1.6, 1.92, B.x0 + 6, 3.0, B.z0 + 0.47, 0, { f: 0.25 });
    for (const [x, z, ry, n] of [[B.x1 - 6, B.z1 - 0.47, Math.PI, 709], [B.x1 - 6, B.z0 + 0.47, 0, 719]]) { const [w, h] = masterSize(n); framed(p, oldMaster(n), w * 0.9, h * 0.9, x, 3.0, z, ry); }
    bench(p, (B.x0 + B.x1) / 2, cz, 4, Math.PI / 2);
    g.add(crowd(B.x1, cz, 7, 3.4, 6, -Math.PI * 0.8, -Math.PI * 0.2, 87));
  }
  g.add(wanderers(p, 41));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: STAIR.z0 + 1.6 } };
}
