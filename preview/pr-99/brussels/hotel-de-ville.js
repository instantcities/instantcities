// The Hôtel de Ville on the Grand-Place (1401-55), modelled by hand in place of the map's block of
// it and its tower's parts, on the map's outline, in game metres (the real ones times 1.25): its
// front 61 m long on the square, the tower 96 m high. Brabantine Gothic in pale stone:
//   the gallery of pointed arches along the foot of the front, the two storeys of cross windows over
//     it with the statues in their niches between them, the parapet of battlements and the octagonal
//     turrets at the corners, the steep slate roof with its rows of dormers
//   Jan van Ruysbroeck's tower, square to over the roof with its doorway under, then octagonal in
//     open stages with pinnacles round each, the openwork spire, and Saint Michael in gilt on top
// The model's own metres: the map's, from (X, Z); the front runs from F0 to F1 with the square to
// its right.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, archRing, polygon } from '../core/js/arcade.js';
import { MAP } from './map.js';

const X = 70, Z = 12;
const F0 = [55.3 - X, -19.1 - Z], F1 = [102.6 - X, 39 - Z], TOWER = [70.3 - X, 11.7 - Z];
const STONE = '#ddd5c2', STONE2 = '#cbc2ad', SLATE = '#4f565e', DARK = '#2f3034', GOLD = '#d2ab48';
const EAVES = 24, RIDGE = 40, DEEP = 18;

const mid = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
const CIVIC = MAP.buildings.find(b => b.k === 'civic' && Math.hypot(mid(b.p)[0] - 74.9, mid(b.p)[1] - 25.6) < 3)?.p ?? [];
const PARTS = MAP.buildings.filter(b => b.k === 'part' && Math.hypot(mid(b.p)[0] - 70.4, mid(b.p)[1] - 11.7) < 10).map(b => b.p);

export function hotelDeVille() {
  const kit = new Kit();
  // the block on the map's outline, flat-topped behind the front wing
  const ring = [];
  for (let k = 0; k < CIVIC.length; k += 2) ring.push([CIVIC[k] - X, CIVIC[k + 1] - Z]);
  const area = ring.reduce((a, [p, q], i) => { const [u, v] = ring[(i + 1) % ring.length]; return a + p * v - u * q; }, 0);
  const r = area > 0 ? ring : ring.slice().reverse(), pos = [];
  r.forEach((p, i) => { const q = r[(i + 1) % r.length]; pos.push(p[0], 0, p[1], q[0], EAVES, q[1], q[0], 0, q[1], p[0], 0, p[1], p[0], EAVES, p[1], q[0], EAVES, q[1]); });
  for (const [i, j, k] of r.length ? THREE.ShapeUtils.triangulateShape(r.map(p => new THREE.Vector2(...p)), []) : []) {
    const [a, b, c] = [r[i], r[j], r[k]], up = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0;
    for (const p of up ? [a, c, b] : [a, b, c]) pos.push(p[0], EAVES, p[1]);
  }
  kit.add(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)), STONE);

  // the front: its path, the square to the right
  const f = linePath(...F0, ...F1), L = f.length, ang = Math.atan2(-(F1[1] - F0[1]), F1[0] - F0[0]);
  const at = (s, o) => { const p = f.at(s); return [p.x + p.tz * o, p.z - p.tx * o]; };
  // the roof over the front wing, a slab along the front sloping up to its ridge
  const roof = new THREE.Shape([new THREE.Vector2(-DEEP / 2 - 0.6, 0), new THREE.Vector2(DEEP / 2 + 0.6, 0), new THREE.Vector2(0, RIDGE - EAVES)]);
  const [rx, rz] = at(0, -DEEP / 2);
  kit.add(new THREE.ExtrudeGeometry(roof, { depth: L, bevelEnabled: false }), SLATE, rx, EAVES, rz, 0, ang + Math.PI / 2);
  // the gallery of pointed arches along the foot, dark behind
  const n = 17, bay = L / n;
  wall(kit, f, [[0, 0], [L, 0], [L, 8], [0, 8]], { o0: 0, o1: 0.05, hex: '#4a443d' });
  wall(kit, f, [[0, -0.5], [L, -0.5], [L, 8.6], [0, 8.6]], { o0: 0.05, o1: 1.6, hex: STONE, holes: Array.from({ length: n }, (_, k) => pointedRing((k + 0.5) * bay, bay - 1.2, -0.3, 7.4, 1, 7)) });
  // two storeys of cross windows, the statues between them, the parapet
  const m = Math.round(L / 2.4);
  for (let k = 0; k < m; k++) {
    const s = (k + 0.5) * (L / m);
    for (const y0 of [10, 16.4]) {
      wall(kit, f, [[s - 0.75, y0], [s + 0.75, y0], [s + 0.75, y0 + 4], [s - 0.75, y0 + 4]], { o0: 0, o1: 0.1, hex: DARK });
      wall(kit, f, [[s - 0.08, y0], [s + 0.08, y0], [s + 0.08, y0 + 4], [s - 0.08, y0 + 4]], { o0: 0.1, o1: 0.2, hex: STONE2 });
      wall(kit, f, [[s - 0.75, y0 + 2.6], [s + 0.75, y0 + 2.6], [s + 0.75, y0 + 2.8], [s - 0.75, y0 + 2.8]], { o0: 0.1, o1: 0.2, hex: STONE2 });
    }
    if (k % 2) for (const y of [11.2, 17.6]) {
      const [x, z] = at(s + L / m / 2, 0.5);
      kit.add(new THREE.CylinderGeometry(0.28, 0.34, 1.9, 6), '#e8e1d0', x, y, z).add(new THREE.ConeGeometry(0.5, 1.4, 6), STONE2, x, y + 1.7, z);
    }
  }
  for (const y of [9.2, 15.6, 21.8]) wall(kit, f, [[0, y], [L, y], [L, y + 0.5], [0, y + 0.5]], { o0: 0, o1: 0.6, hex: STONE2 });
  wall(kit, f, [[0, EAVES - 1.6], [L, EAVES - 1.6], [L, EAVES], [0, EAVES]], { o0: 0, o1: 0.8, hex: STONE2 });
  for (let s = 0.6; s < L; s += 1.5) wall(kit, f, [[s - 0.45, EAVES], [s + 0.45, EAVES], [s + 0.45, EAVES + 1.1], [s - 0.45, EAVES + 1.1]], { o0: 0, o1: 0.8, hex: STONE2 });
  // the corner turrets and the ones along the front, and the dormers
  for (const s of [0.8, L * 0.25, L * 0.5, L * 0.75, L - 0.8]) {
    const [x, z] = at(s, 0.6);
    kit.add(new THREE.CylinderGeometry(0.9, 0.9, EAVES + 6, 8), STONE2, x, (EAVES + 6) / 2, z).add(new THREE.ConeGeometry(1.1, 4.5, 8), SLATE, x, EAVES + 8.2, z);
  }
  for (let s = 3; s < L - 2; s += 5) for (const [o, y] of [[-3.5, EAVES + 3.5], [-6.5, EAVES + 8.5]]) {
    const [x, z] = at(s, o);
    kit.box(1.6, 2.6, 1.6, STONE, x, y, z, 0, ang).add(new THREE.ConeGeometry(1.2, 1.6, 4).rotateY(Math.PI / 4), SLATE, x, y + 2.1, z, 0, ang);
    const [wx, wz] = at(s, o + 0.82);
    kit.box(0.9, 1.4, 0.1, DARK, wx, y, wz, 0, ang);
  }

  // the tower: square to above the roof, then the octagonal open stages and the spire
  const [tx, tz] = TOWER;
  kit.box(13, 46, 13, STONE, tx, 23, tz, 0, ang);
  const [dx, dz] = at(L * 0.33, 0.9);
  kit.add(new THREE.CylinderGeometry(2.4, 2.4, 0.4, 12, 1, false, 0, Math.PI), DARK, dx, 9, dz, 0, ang + Math.PI / 2, Math.PI / 2);
  for (const [y0, y1, r] of [[46, 57, 6], [57, 66, 5], [66, 74, 4]]) {
    kit.add(new THREE.CylinderGeometry(r, r + 0.4, y1 - y0, 8), STONE2, tx, (y0 + y1) / 2, tz);
    polygon(r + 0.05, 8).map(p => moved(p, tx, tz)).forEach(p => wall(kit, p, pointedRing(p.length / 2, p.length - 1.2, y0 + 1, y1 - 1, 1.2, 6), { o0: 0, o1: 0.05, hex: DARK }));
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2, x = tx + (r + 0.6) * Math.cos(a), z = tz + (r + 0.6) * Math.sin(a);
      kit.add(new THREE.CylinderGeometry(0.4, 0.4, 3, 6), STONE2, x, y1 + 1.5, z).add(new THREE.ConeGeometry(0.45, 2.4, 6), STONE2, x, y1 + 4.2, z);
    }
  }
  kit.add(new THREE.ConeGeometry(3.6, 32, 8), STONE2, tx, 74 + 16, tz);
  for (const y of [80, 88, 96]) kit.add(new THREE.CylinderGeometry(3.6 * (1 - (y - 74) / 32) + 0.3, 3.6 * (1 - (y - 74) / 32) + 0.3, 0.6, 8), STONE, tx, y, tz);
  // Saint Michael slaying the dragon, in gilt
  kit.add(new THREE.CylinderGeometry(0.5, 0.7, 3, 8), GOLD, tx, 107.5, tz).add(new THREE.SphereGeometry(0.45, 8, 6), GOLD, tx, 109.5, tz);
  kit.box(3.2, 1.6, 0.15, GOLD, tx, 108.6, tz, 0, ang).rod([tx, 108, tz], [tx + 1.2, 111.5, tz], 0.1, GOLD, 4);
  kit.box(1.8, 0.5, 0.6, GOLD, tx, 105.8, tz, 0, ang);
  return kit.mesh(kitMat(0.85));
}

// a path moved by (dx, dz)
function moved(p, dx, dz) {
  return { length: p.length, closed: p.closed, at: s => { const q = p.at(s); return { ...q, x: q.x + dx, z: q.z + dz }; } };
}

export const HOTEL_DE_VILLE = [{
  id: 'hotel-de-ville', name: 'Hôtel de Ville', x: X, z: Z, reach: 90,
  area: [CIVIC, ...PARTS].filter(p => p.length), foot: CIVIC.length ? [CIVIC] : [],
  make: hotelDeVille,
}];
