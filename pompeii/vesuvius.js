// Mount Vesuvius, which buried the town in AD 79, standing on the horizon where it really is (8 km
// north-west of Pompeii: far: it is drawn shrunk and fogged like a distant monument, js/skyline.js).
// Two cones: the great one with its crater, and the broken rim of Monte Somma behind it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { game } from './frame.js';

const S = 1.25;
const SLOPE = '#8a7a64', ROCK = '#6f6252', GREEN = '#7f8a56';

function vesuvius() {
  const kit = new Kit();
  const cone = (pts, hex, x = 0, z = 0) => kit.add(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r * S, y * S)), 40), hex, x * S, 0, z * S);
  // The foot, green with vineyards and woods, then the bare cone. A buried skirt
  // continues below the far horizon so the mountain has no floating lower edge.
  cone([[4800, -1200], [3800, 0], [3100, 140], [2600, 320], [2100, 520], [1700, 760]], GREEN);
  cone([[1700, 760], [1100, 980], [700, 1170], [430, 1281], [330, 1240], [250, 1180]], SLOPE);
  cone([[250, 1180], [330, 1240], [430, 1281]], ROCK);
  // Monte Somma, the older rim, round the north-east side of it
  cone([[4200, -1200], [3300, 0], [2400, 400], [1400, 900], [900, 1132], [600, 1132]], ROCK, 1300, -1400);
  const m = kit.mesh(kitMat(1));
  m.scale.y = 1.25; // a little steeper than it is: far off it would not read
  return m;
}

// 40.8214 N, 14.4260 E
const [X, Z] = game(40.8214, 14.4260);
export const VESUVIUS = [{ id: 'vesuvio', name: 'Vesuvio', x: X, z: Z, turn: 0, reach: 100, far: 10, loom: 1.2, make: vesuvius }];
