// The towers of the Týn church (Our Lady before Týn, 14th-16th century) over the Old Town Square,
// modelled by hand in place of the map's pieces of them, from their measurements and photos, in game
// metres (the real ones times 1.25), on the map's outlines: two dark towers 12 m square, their
// spires to 100 m. The nave behind them stays the map's.
//   each tower's shaft of dark stone, a little narrower on the north (Adam) than the south (Eve),
//     its storeys of small pointed windows
//   the steep black spire on each, four corner turrets round its foot and four more pinnacles
//     half way up, every one with its gilded ball
//   the stepped gable between them, with the golden Madonna in its niche
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, linePath, wall, sweep, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = 390.3, Z = 10.2, TURN = 0.316; // between the two towers, and the nave's axis turned from east (local +x)
const TV = 12.6, SHAFT = 68.8, SPIRE = 100; // the towers out from the middle, their shafts' top, the spires' tips
const STONE = '#5f5953', STONE2 = '#6e6760', SLATE = '#2c2f33', GOLD = '#d1aa44', DARK = '#1f1e1d';

function tower(kit, v, h) {
  kit.box(2 * h - 0.6, SHAFT, 2 * h - 0.6, DARK, 0, SHAFT / 2, v);
  square(h, h, 0.4).forEach((path, f) => {
    const len = path.length, off = f % 2 ? -0.4 : 0, holes = [];
    for (const y of [18, 31, 44, 56]) holes.push(pointedRing(h + off, y > 50 ? 2.6 : 1.6, y, y + (y > 50 ? 9 : 6), 1, 6));
    const shifted = { length: len, at: s => { const p = path.at(s); return { ...p, z: p.z + v }; } };
    wall(kit, shifted, [[0, 0], [len, 0], [len, SHAFT], [0, SHAFT]], { holes, o0: -0.4, o1: 0, hex: STONE });
    for (const y of [12, 25, 38, 51, SHAFT - 0.6]) sweep(kit, shifted, 0, len, [[-0.1, y], [0.35, y], [0.35, y + 0.5], [-0.1, y + 0.5]], STONE2, { step: len });
  });
  // the spire, its corner turrets and the pinnacles half way up, their gilded balls
  const spire = new THREE.ConeGeometry(h * Math.SQRT2 - 0.6, SPIRE - SHAFT - 3, 4).rotateY(Math.PI / 4);
  kit.add(spire, SLATE, 0, (SHAFT + SPIRE + 3) / 2 - 1.5 + 1.5, v);
  kit.box(2 * h + 0.6, 1.4, 2 * h + 0.6, STONE2, 0, SHAFT + 0.7, v);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const x = sx * (h - 0.2), z = v + sz * (h - 0.2);
    kit.add(new THREE.CylinderGeometry(1.1, 1.1, 5, 8), STONE2, x, SHAFT + 3.3, z);
    kit.add(new THREE.ConeGeometry(1.25, 9.5, 8), SLATE, x, SHAFT + 10.5, z);
    kit.add(new THREE.SphereGeometry(0.4, 8, 6), GOLD, x, SHAFT + 15.5, z);
  }
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x = dx * h * 0.55, z = v + dz * h * 0.55;
    kit.box(1.6, 3.4, 1.6, SLATE, x, 82, z);
    kit.add(new THREE.ConeGeometry(1.1, 6, 4).rotateY(Math.PI / 4), SLATE, x, 86.7, z);
    kit.add(new THREE.SphereGeometry(0.32, 8, 6), GOLD, x, 90, z);
  }
  kit.add(new THREE.SphereGeometry(0.6, 10, 8), GOLD, 0, SPIRE + 0.3, v);
  kit.box(0.15, 2.4, 0.15, GOLD, 0, SPIRE + 1.8, v);
}

export function tyn() {
  const kit = new Kit();
  tower(kit, -TV, 5.8); // Adam, to the north
  tower(kit, TV, 6.1); // Eve, to the south
  // the gable between them, stepped, with the Madonna's niche
  const path = linePath(-6, TV - 6.1, -6, -TV + 5.8), len = path.length, steps = [];
  for (let k = 0; k <= 6; k++) steps.push([(k / 12) * len, 44 + k * 3], [((k + 1) / 12) * len, 44 + k * 3]);
  const ring = [[0, 0], [len, 0], [len, 44], ...steps.map(([s, y]) => [len - s, y]).slice(0, -1), ...steps.slice(0, -1).reverse()];
  wall(kit, path, ring.filter(([, y], i, a) => i === 0 || a[i - 1][0] !== ring[i][0] || a[i - 1][1] !== y), { holes: [pointedRing(len / 2, 4, 12, 30, 1, 7)], o0: -1.2, o1: 0, hex: STONE });
  wall(kit, path, pointedRing(len / 2, 4, 12, 30, 1, 7), { o0: -1.1, o1: -1, hex: DARK });
  wall(kit, path, pointedRing(len / 2, 2.4, 40, 46, 1, 6), { o0: -0.4, o1: -0.3, hex: DARK });
  const p = path.at(len / 2);
  kit.add(new THREE.CylinderGeometry(0.4, 0.7, 3, 8), GOLD, p.x - 0.1, 41.8, p.z);
  kit.add(new THREE.SphereGeometry(0.32, 8, 6), GOLD, p.x - 0.1, 43.6, p.z);
  return kit.mesh(kitMat(0.85));
}

export const TYN = [{
  id: 'tyn', name: 'Týnský chrám', x: X, z: Z, turn: TURN, reach: 200,
  area: [onMap(X, Z, TURN, rect(-8.5, -TV - 8.5, 8, -TV + 8.5)), onMap(X, Z, TURN, rect(-8.5, TV - 8.5, 8, TV + 8.5))],
  foot: [onMap(X, Z, TURN, rect(-5.8, -TV - 5.8, 5.8, -TV + 5.8)), onMap(X, Z, TURN, rect(-6.1, TV - 6.1, 6.1, TV + 6.1))],
  make: tyn,
}];
