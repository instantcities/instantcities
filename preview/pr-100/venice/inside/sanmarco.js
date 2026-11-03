// St Mark's Basilica (San Marco) from the inside, simplified: a Greek cross of five square bays,
// each under its dome on four great arches, every vault and dome covered in gold mosaic (8,500 m² of
// it), the floor of marble laid in patterns and gone wavy over the centuries, the marble iconostasis
// with its statues across the choir, and behind the high altar the Pala d'Oro, gold set with enamels,
// pearls and gems.
//
// Game metres, x across and z towards the altar, from the middle of the central bay; the door from
// the narthex (to Piazza San Marco) at -z.
import * as THREE from 'three';
import { Parts, floorMat } from '../../core/js/inside/gothic.js';
import { saint, chandelier, candelabra, steps } from '../../core/js/inside/props.js';
import { goldMosaic, palaDoro } from '../../core/js/inside/art.js';
import { framed, visitors, rope } from '../../core/js/inside/rooms.js';

const S = 18, HALF = S / 2, PIER = 4, ARCH = 15, DOME = 8.4; // a bay's width, the piers, the arches' springing, the domes
const TINT = { stone: 0xd8c8a8, pier: 0xc8b898, vault: 0xc9a24a, rib: 0xb8963c, wall: 0xc9a24a };
const GOLD = 0xc9a24a, MARBLE = 0xd8d0c0;
// the five bays: the middle one, west (the entrance), east (the choir), north and south
const BAYS = [[0, 0], [0, -S], [0, S], [-S, 0], [S, 0]];

export const SIZE = [-1.5 * S - 2, -1.5 * S - 2, 1.5 * S + 2, 1.5 * S + 2];
const inCross = (x, z) => (Math.abs(x) <= HALF && Math.abs(z) <= 1.5 * S) || (Math.abs(z) <= HALF && Math.abs(x) <= 1.5 * S);

export function makeSanMarco() {
  const p = new Parts(TINT), g = new THREE.Group();
  const mosaic = goldMosaic();
  mosaic.repeat.set(3, 1);
  for (const [x, z] of BAYS) p.floor(x - HALF, z - HALF, x + HALF, z + HALF, floorMat('#d8d0c0', '#7a3a3a', true, 1.2));

  // the outer walls of the cross, gold mosaic above the marble panelling, the door in the west end
  const E = 1.5 * S;
  const outline = [[-HALF, -E], [HALF, -E], [HALF, -HALF], [E, -HALF], [E, HALF], [HALF, HALF], [HALF, E], [-HALF, E], [-HALF, HALF], [-E, HALF], [-E, -HALF], [-HALF, -HALF]];
  outline.forEach((a, k) => {
    const b = outline[(k + 1) % outline.length], west = k === 0;
    p.rectWall(a, b, { y1: ARCH + 0.5, t: 1.2, color: MARBLE, holes: west ? [[[HALF - 2, 0], [HALF + 2, 0], [HALF + 2, 5], [HALF - 2, 5]]] : [], solid: !west });
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
    // the way into the church from this wall
    let nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L;
    if (!inCross(mx + nx, mz + nz)) { nx = -nx; nz = -nz; }
    const along = Math.abs(nz) > 0.5; // the wall runs along x
    p.picture(mosaic, L - 0.2, ARCH - 6, mx + nx * 0.62, 6 + (ARCH - 6) / 2, mz + nz * 0.62, Math.atan2(nx, nz));
    p.marble.box(along ? L : 0.2, 6, along ? 0.2 : L, k % 2 ? 0xb8a890 : 0xa89a80, mx + nx * 0.65, 3, mz + nz * 0.65);
  });
  p.wallRing([-HALF, -E], [-2, -E], 1.2);
  p.wallRing([2, -E], [HALF, -E], 1.2);
  for (const s of [-1, 1]) p.dark.box(1.9, 5, 0.12, 0x5a4a30, s * 1, 2.5, -E - 0.1);

  // the four great piers of the middle bay, and the arches over everything, gold underneath
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    p.marble.box(PIER, ARCH, PIER, 0xc8b8a0, sx * (HALF - PIER / 2), ARCH / 2, sz * (HALF - PIER / 2));
    p.block(sx * (HALF - PIER / 2), sz * (HALF - PIER / 2), PIER / 2 + 0.1);
  }
  for (const [x, z] of BAYS) {
    // the ceiling ring each dome stands on, gold, and the dome itself, its mosaic and its windows
    p.gold.box(S, 1.0, 1.4, GOLD, x, ARCH + 0.5, z - HALF + 0.7);
    p.gold.box(S, 1.0, 1.4, GOLD, x, ARCH + 0.5, z + HALF - 0.7);
    p.gold.box(1.4, 1.0, S, GOLD, x - HALF + 0.7, ARCH + 0.5, z);
    p.gold.box(1.4, 1.0, S, GOLD, x + HALF - 0.7, ARCH + 0.5, z);
    // the ceiling of the bay round the dome's foot: a square of gold with the round hole in it
    const roof = new THREE.Shape([[-HALF, -HALF], [HALF, -HALF], [HALF, HALF], [-HALF, HALF]].map(([u, v]) => new THREE.Vector2(u, v)));
    roof.holes.push(new THREE.Path().absarc(0, 0, DOME, 0, Math.PI * 2, true));
    p.plaster.add(new THREE.ShapeGeometry(roof, 24).rotateX(Math.PI / 2), GOLD, x, ARCH + 1.0, z);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(DOME, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: mosaic, roughness: 0.4, metalness: 0.45, side: THREE.DoubleSide }));
    dome.position.set(x, ARCH + 1.0, z);
    g.add(dome);
    for (let k = 0; k < 16; k++) { const t = (k / 16) * Math.PI * 2; p.daylight.add(new THREE.CircleGeometry(0.45, 8).rotateY(t + Math.PI), 0xf6f0dc, x + Math.sin(t) * (DOME - 0.05), ARCH + 1.6, z + Math.cos(t) * (DOME - 0.05)); }
    chandelier(p, x, 9, z, 2.2, ARCH + 1, 16);
  }

  // the iconostasis across the choir: red marble columns, the cross in the middle, the apostles on top
  const iz = HALF + 1;
  for (let k = -3; k <= 3; k++) { if (k === 0) continue; p.marble.add(new THREE.CylinderGeometry(0.3, 0.3, 4.6, 10).translate(0, 2.3 + 0.9, 0), 0x8a3a3a, k * 1.9, 0, iz); }
  p.marble.box(14, 0.9, 0.9, MARBLE, 0, 0.45, iz);
  p.marble.box(14, 0.7, 1.0, MARBLE, 0, 5.85, iz);
  for (let k = -6; k <= 6; k++) saint(p, k * 1.05, 6.2, iz, 0.9, Math.PI, { robe: 0xf0ece2, halo: false });
  p.gold.box(0.25, 3, 0.25, GOLD, 0, 8.2, iz); p.gold.box(1.6, 0.25, 0.25, GOLD, 0, 9.0, iz);
  p.wallRing([-7, iz], [-1.6, iz], 1.0);
  p.wallRing([1.6, iz], [7, iz], 1.0);
  // the high altar under its canopy on four alabaster columns, the Pala d'Oro behind it
  {
    const z = S + 3;
    steps(p, 0, z, 8, 6, 3, 0.3);
    p.marble.box(3.6, 1.2, 1.8, 0xf0ece2, 0, 0.9 + 0.6, z);
    for (const [cx, cz] of [[-2, -1.6], [2, -1.6], [-2, 1.6], [2, 1.6]]) p.marble.add(new THREE.CylinderGeometry(0.3, 0.3, 4.4, 10).translate(0, 2.2 + 0.9, 0), 0xf0e8dc, cx, 0, z + cz);
    p.marble.box(5, 1.4, 4.2, 0xf0ece2, 0, 6.0, z);
    framed(p, palaDoro(), 4.2, 2.4, 0, 3.4, z + 2.6, Math.PI, { f: 0.2, color: GOLD, label: false });
    for (const s of [-1, 1]) candelabra(p, s * 3.4, z - 2, 3.0);
    p.block(0, z, 4, 3.2);
    rope(p, [-4, iz + 2.4], [4, iz + 2.4]);
  }

  let s = 37;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const spots = [];
  for (let k = 0; k < 30; k++) { const [x, z] = BAYS[k % 4 === 3 ? 3 : k % 4]; spots.push([x + (rnd() - 0.5) * (S - 6), z + (rnd() - 0.5) * (S - 6), rnd() * Math.PI * 2]); }
  g.add(visitors(spots, 61));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: -E + 1.8 } };
}
