// The two fronts on the south side of the Burg, dressed by hand on the map's measured blocks of them,
// in game metres (the real ones times 1.25):
//   the Stadhuis (1376-1421), one of the oldest Gothic town halls of the Low Countries: its two
//     tiers of tall pointed windows, the statues of the counts of Flanders in their niches between
//     them, the parapet of tracery and battlements, the three slender octagonal turrets standing up
//     out of it, and its steep slate roof
//   the Heilig-Bloedbasiliek's front in the corner beside it (1529-34): three round arches at the
//     foot of the stair to the upper chapel, the gilded figures, the balcony over them, its stepped
//     gable, and the chapel's little hexagonal tower with its spire behind; the map's one tall block
//     of the basilica and the buildings round it is lowered to the chapel's walls, and the chapel
//     gets its steep roof
// Each front's own metres: x along it, z into the building, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, archRing } from '../core/js/arcade.js';
import { MAP } from './map.js';

const STONE = '#d9d1bf', STONE2 = '#c7bea9', SLATE = '#4c535b', DARK = '#2e2f33', GOLD = '#cfa847', GLASS = '#3b4352';

// ------------------------------------------------------------------ the Stadhuis

const SX = 202.3, SZ = -229.8, STURN = 0.576, SW = 16, SD = 21, EAVES = 19, RIDGE = 33;

export function stadhuis() {
  const kit = new Kit();
  kit.box(2 * SW, EAVES, SD, STONE, 0, EAVES / 2, SD / 2);
  const roof = new THREE.Shape([new THREE.Vector2(-SD / 2 - 0.5, 0), new THREE.Vector2(SD / 2 + 0.5, 0), new THREE.Vector2(0, RIDGE - EAVES)]);
  kit.add(new THREE.ExtrudeGeometry(roof, { depth: 2 * SW, bevelEnabled: false }), SLATE, -SW, EAVES, SD / 2, 0, Math.PI / 2);
  for (const sx of [-1, 1]) kit.add(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-SD / 2, 0), new THREE.Vector2(SD / 2, 0), new THREE.Vector2(0, RIDGE - EAVES)]), { depth: 0.6, bevelEnabled: false }), STONE, sx > 0 ? SW - 0.6 : -SW, EAVES, SD / 2, 0, Math.PI / 2);
  // the front, its outside towards the Burg (local -z) to the right
  const f = linePath(-SW, 0, SW, 0), L = 2 * SW, n = 6, bay = L / n;
  for (let k = 0; k < n; k++) {
    const s = (k + 0.5) * bay;
    for (const [y0, y1] of [[3.6, 10.4], [11.6, 17.6]]) {
      wall(kit, f, pointedRing(s, bay - 2, y0, y1, 1, 7), { o0: 0, o1: 0.25, hex: STONE2 });
      wall(kit, f, pointedRing(s, bay - 2.6, y0 + 0.3, y1 - 0.3, 1, 7), { o0: 0.25, o1: 0.3, hex: GLASS });
      wall(kit, f, [[s - 0.1, y0 + 0.3], [s + 0.1, y0 + 0.3], [s + 0.1, y1 - 1.6], [s - 0.1, y1 - 1.6]], { o0: 0.3, o1: 0.45, hex: STONE2 });
    }
    // the niches between the windows, each with its count under a canopy
    if (k) for (const y of [6.5, 14.4]) {
      const p = f.at(k * bay), x = p.x + p.tz * 0.6, z = p.z - p.tx * 0.6;
      kit.add(new THREE.CylinderGeometry(0.3, 0.38, 2, 6), y > 10 ? '#d2b48a' : '#c9a37c', x, y, z).add(new THREE.SphereGeometry(0.24, 6, 4), '#e6d3b4', x, y + 1.2, z);
      kit.add(new THREE.ConeGeometry(0.55, 1.6, 6), STONE2, x, y + 2.4, z);
    }
  }
  wall(kit, f, [[0, 0], [L, 0], [L, 3], [0, 3]], { o0: 0, o1: 0.3, hex: STONE2 });
  for (const s of [L * 0.33, L * 0.67]) wall(kit, f, archRing(s, 2.2, 0, 3.4, 8), { o0: 0.3, o1: 0.35, hex: '#4a3a2c' });
  // the parapet: a band of tracery, then the battlements
  wall(kit, f, [[0, EAVES - 1], [L, EAVES - 1], [L, EAVES + 1], [0, EAVES + 1]], { o0: 0, o1: 0.5, hex: STONE2 });
  for (let s = 0.8; s < L; s += 1.6) wall(kit, f, [[s - 0.5, EAVES + 1], [s + 0.5, EAVES + 1], [s + 0.5, EAVES + 2], [s - 0.5, EAVES + 2]], { o0: 0, o1: 0.5, hex: STONE2 });
  // the three turrets, at the corners and in the middle, octagonal with their spirelets
  for (const x of [-SW + 0.6, 0, SW - 0.6]) {
    kit.add(new THREE.CylinderGeometry(0.9, 0.9, EAVES + 7, 8), STONE2, x, (EAVES + 7) / 2, -0.6);
    kit.add(new THREE.CylinderGeometry(1.15, 1.15, 0.5, 8), STONE2, x, EAVES + 7, -0.6);
    kit.add(new THREE.ConeGeometry(1.05, 4.5, 8), SLATE, x, EAVES + 9.5, -0.6);
    kit.add(new THREE.SphereGeometry(0.22, 6, 4), GOLD, x, EAVES + 11.9, -0.6);
  }
  // the dormers in the roof
  for (const x of [-9, -3, 3, 9]) {
    kit.box(1.8, 2.4, 2, STONE, x, EAVES + 3.5, 3.6).box(1, 1.4, 0.2, GLASS, x, EAVES + 3.4, 2.55);
    kit.add(new THREE.ConeGeometry(1.4, 1.6, 4).rotateY(Math.PI / 4), SLATE, x, EAVES + 5.5, 3.6);
  }
  return kit.mesh(kitMat(0.85));
}

// ------------------------------------------------------------------ the Heilig-Bloedbasiliek's front

const HX = 180.9, HZ = -216.1, HTURN = 0.56, HW = 9.4, HTOP = 17;

// the map's block of the basilica and the buildings round it, which this lowers
const mid = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
const BLOCK = MAP.buildings.find(b => b.k === 'basilica' && Math.hypot(mid(b.p)[0] - 172, mid(b.p)[1] + 195) < 4)?.p ?? [];

export function heiligBloed() {
  const kit = new Kit();
  // the block, on its outline in the map's metres turned back into the front's, 14 high
  {
    const c = Math.cos(HTURN), s = Math.sin(HTURN), ring = [];
    for (let k = 0; k < BLOCK.length; k += 2) { const dx = BLOCK[k] - HX, dz = BLOCK[k + 1] - HZ; ring.push([dx * c - dz * s, dx * s + dz * c]); }
    const r = ring.reduce((a, [p, q], i) => { const [u, v] = ring[(i + 1) % ring.length]; return a + p * v - u * q; }, 0) > 0 ? ring : ring.reverse(), pos = [], H = 14;
    r.forEach((p, i) => { const q = r[(i + 1) % r.length]; pos.push(p[0], 0, p[1], q[0], H, q[1], q[0], 0, q[1], p[0], 0, p[1], p[0], H, p[1], q[0], H, q[1]); });
    if (r.length) for (const [i, j, k] of THREE.ShapeUtils.triangulateShape(r.map(p => new THREE.Vector2(...p)), [])) {
      const [a, b, d] = [r[i], r[j], r[k]], up = (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]) > 0;
      for (const p of up ? [a, d, b] : [a, b, d]) pos.push(p[0], H, p[1]);
    }
    kit.add(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)), '#cbc0a6');
    // the chapel's steep roof behind the front
    const roof = new THREE.Shape([new THREE.Vector2(-HW, 0), new THREE.Vector2(HW, 0), new THREE.Vector2(0, 10)]);
    kit.add(new THREE.ExtrudeGeometry(roof, { depth: 24, bevelEnabled: false }), SLATE, 0, H, 0.5);
  }
  const f = linePath(-HW, 0, HW, 0), L = 2 * HW; // its outside towards the Burg (local -z) to the right
  wall(kit, f, [[0, 0], [L, 0], [L, HTOP], [L / 2, HTOP + 5.5], [0, HTOP]], { o0: -0.6, o1: 0, hex: '#d6cbb2' });
  // the three round arches at the foot, their columns, the gilding in their spandrels
  for (let k = 0; k < 3; k++) {
    const s = (k + 0.5) * (L / 3);
    wall(kit, f, archRing(s, 4.2, 0, 6.6, 12), { o0: 0, o1: 0.1, hex: '#3c3029' });
    wall(kit, f, [[s - 2.6, 0], [s - 2.1, 0], ...archRing(s, 4.2, 0, 6.6, 12).slice(2).reverse(), [s + 2.1, 0], [s + 2.6, 0], ...archRing(s, 5.2, 0, 7.2, 12).slice(2)], { o0: 0, o1: 0.4, hex: STONE });
    const p = f.at(s);
    kit.add(new THREE.SphereGeometry(0.4, 6, 4), GOLD, p.x, 7.9, p.z - 0.5);
  }
  for (let k = 0; k <= 3; k++) {
    const p = f.at(k * (L / 3));
    kit.add(new THREE.CylinderGeometry(0.3, 0.3, 6.6, 8), '#e2d8c2', p.x, 3.3, p.z - 0.5);
  }
  // the balcony and its gilded balustrade, the windows and the figures over it
  wall(kit, f, [[0, 8.4], [L, 8.4], [L, 9.2], [0, 9.2]], { o0: 0, o1: 1.4, hex: STONE });
  wall(kit, f, [[0, 9.2], [L, 9.2], [L, 10.3], [0, 10.3]], { o0: 1.2, o1: 1.4, hex: GOLD });
  for (let k = 0; k < 3; k++) {
    const s = (k + 0.5) * (L / 3);
    wall(kit, f, archRing(s, 2.6, 10.4, 15.4, 10), { o0: 0, o1: 0.1, hex: GLASS });
  }
  for (let k = 0; k <= 3; k++) {
    const p = f.at(k * (L / 3));
    kit.add(new THREE.CylinderGeometry(0.28, 0.35, 2.2, 6), GOLD, p.x, 13.4, p.z - 0.5).add(new THREE.SphereGeometry(0.22, 6, 4), GOLD, p.x, 14.7, p.z - 0.5);
  }
  // the stepped gable's edges and the gilt figure on top
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) {
    const x = sx * (HW - k * 2.2), y = HTOP + k * 1.4;
    kit.box(1.2, 1.4, 0.8, STONE, x - sx * 0.6, y + 0.7, -0.4);
  }
  kit.add(new THREE.CylinderGeometry(0.3, 0.4, 2, 6), GOLD, 0, HTOP + 6.3, -0.3);
  // the chapel's hexagonal tower behind, with its open lantern and spire
  const tx = -HW + 1, tz = 12;
  kit.add(new THREE.CylinderGeometry(2.2, 2.2, 26, 6), '#cfc3a6', tx, 13, tz);
  kit.add(new THREE.CylinderGeometry(1.7, 1.9, 4, 6), STONE2, tx, 28, tz);
  kit.add(new THREE.ConeGeometry(1.9, 7, 6), SLATE, tx, 33.5, tz);
  return kit.mesh(kitMat(0.85));
}

export const BURG = [
  { id: 'stadhuis', name: 'Stadhuis', x: SX, z: SZ, turn: STURN, reach: 60, area: [], foot: [], make: stadhuis },
  { id: 'heilig-bloedbasiliek', name: 'Heilig-Bloedbasiliek', x: HX, z: HZ, turn: HTURN, reach: 60, area: BLOCK.length ? [BLOCK] : [], foot: BLOCK.length ? [BLOCK] : [], make: heiligBloed },
];
