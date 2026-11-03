// The Amphitheatre of Pompeii (about 70 BC, the oldest stone one there is), modelled by hand in place
// of the map's outline of it, on its measurements in game metres (the real ones times 1.25): an
// ellipse 175 by 130 m, its outer wall about 10 m high with its pilasters and a cornice, and inside
// it the slope of seats up to the top of the wall, the arena in sand and the podium round it.
// Its long axis is the map's, turned 66 degrees from east towards south. Riders bump into its wall.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { ellipsePath, arcade, sweep, onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 952, Z = -126, TURN = -1.152; // its middle, and its long axis turned from east
const A = 88, B = 66; // half its length and half its width, to the outer wall
const WALL = 10.5;
const TUFF = ['#b9a88a', '#b0a081', '#c2b394'], SAND = '#d9c79b';

export function amphitheatre() {
  const kit = new Kit(), path = ellipsePath(A, B), L = path.length;
  const bays = 72, bay = L / bays;
  arcade(kit, path, { bays, storeys: [{ h: WALL, order: 'pilaster', frieze: 0.9 }], o: 0, depth: 2.2, hex: (i) => TUFF[i % 3] });
  // the seats: a solid slope from the wall's top down to the podium, in three tiers
  sweep(kit, path, 0, L, [[0, 0], [0, WALL], [-3, WALL], [-14, 8.2], [-15, 7.2], [-27, 4.6], [-28, 3.6], [-33, 2.4], [-35, 2.4], [-35, 0]], shade(TUFF[0], -0.06), { step: bay / 2 });
  // the podium's wall round the arena
  sweep(kit, path, 0, L, [[-35, 0], [-35, 3], [-36, 3], [-36, 0]], shade(TUFF[1], 0.08), { step: bay / 2 });
  // the arena: a floor of sand
  const arena = new THREE.Shape();
  for (let k = 0; k <= 64; k++) arena[k ? 'lineTo' : 'moveTo']((A - 36) * Math.cos((k / 64) * 2 * Math.PI), -(B - 36) * Math.sin((k / 64) * 2 * Math.PI));
  kit.add(new THREE.ShapeGeometry(arena).rotateX(-Math.PI / 2), SAND, 0, 0.08, 0);
  return kit.mesh(kitMat(0.92));
}

const ring = (k, n = 64) => Array.from({ length: n }, (_, j) => {
  const t = (j / n) * 2 * Math.PI;
  return [A * k * Math.cos(t), B * k * Math.sin(t)];
});

// It stands in for the map's outline (area); riders bump into its outer wall (foot).
export const AMPHITHEATRE = [{
  id: 'amphitheatre', name: 'Anfiteatro', x: X, z: Z, turn: TURN, reach: 320,
  area: [onMap(X, Z, TURN, ring(1.12))],
  foot: [onMap(X, Z, TURN, ring(1))],
  make: amphitheatre,
}];
