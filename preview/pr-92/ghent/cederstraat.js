// The Cederstraat in the Brugse Poort, drawn closer to life than the streets round it (hand-written).
// Seen from its bend at the Sparrestraat's far end, looking up the long straight stretch:
//   FULL_PARKING  streets where every spot along the kerb is taken (core/js/scenery.js osmCars)
//   PARKED_CARS   cars parked by hand, on the right just past the corner house: a small white one,
//                 a grey saloon behind it ({ x, z, yaw, type, c }, game metres)
//   CEDERSTRAAT   the monument (see monuments.js) on the pavement before number 62, in the street's
//                 first stretch, just before the bend into the long straight one: a family out on the
//                 street, the mother in a short red dress, the father with short dark brown hair in
//                 a yellow running shirt and black shorts, their blonde daughter in a white top and
//                 navy skirt with her toy pony, their big light brown cat, and their blue long tail
//                 parked against the front behind them.
import * as THREE from 'three';
import { person, add, std } from './wedding.js';
import { longTailFrame, LONG_TAIL } from '../core/js/bikers.js';

export const FULL_PARKING = ['Cederstraat'];

const YAW = 0.726; // facing up the street, the way its one-way traffic goes
export const PARKED_CARS = [
  { x: -2295.1, z: -947.7, yaw: YAW, type: 'mini', c: 0xf4f4f2 },
  { x: -2292.0, z: -944.3, yaw: YAW, type: 'sedan', c: 0x8d9296 },
];

const S = 1.25; // game metres to a real metre

// a toy pony: a pastel body on four short legs, a mane and tail in pink, about 30 cm long, facing +z
function toyPony() {
  const g = new THREE.Group(), coat = std(0xd9c6ef, 0.5), mane = std(0xf27fb2, 0.6);
  add(g, new THREE.CapsuleGeometry(0.055, 0.14, 4, 10).rotateX(Math.PI / 2), coat, 0, 0.11, 0);
  add(g, new THREE.CapsuleGeometry(0.03, 0.08, 4, 8), coat, 0, 0.17, 0.09, 0.6);
  add(g, new THREE.SphereGeometry(0.045, 10, 8), coat, 0, 0.22, 0.13).scale.set(0.85, 0.9, 1.3);
  add(g, new THREE.BoxGeometry(0.025, 0.08, 0.1), mane, 0, 0.2, 0.06, 0.5);
  add(g, new THREE.CapsuleGeometry(0.02, 0.1, 4, 6), mane, 0, 0.1, -0.13, -0.5);
  for (const [x, z] of [[-0.03, 0.06], [0.03, 0.06], [-0.03, -0.06], [0.03, -0.06]]) add(g, new THREE.CylinderGeometry(0.015, 0.015, 0.07, 6), coat, x, 0.035, z);
  return g;
}

// a light brown cat sitting up, its tail curled round its feet, facing +z
function cat() {
  const g = new THREE.Group(), fur = std(0xc49a6c, 0.9), white = std(0xf3ece2, 0.9);
  add(g, new THREE.SphereGeometry(0.09, 12, 10), fur, 0, 0.1, -0.02).scale.set(0.9, 1.25, 1.05);
  add(g, new THREE.SphereGeometry(0.05, 10, 8), white, 0, 0.12, 0.05).scale.set(1, 1.3, 0.6);
  add(g, new THREE.SphereGeometry(0.06, 12, 10), fur, 0, 0.25, 0.03);
  for (const s of [-1, 1]) {
    add(g, new THREE.ConeGeometry(0.022, 0.05, 4), fur, s * 0.035, 0.31, 0.03, 0, 0, -s * 0.25);
    add(g, new THREE.SphereGeometry(0.008, 6, 5), std(0x3f6b2a, 0.3), s * 0.022, 0.26, 0.085);
    add(g, new THREE.SphereGeometry(0.025, 8, 6), white, s * 0.03, 0.02, 0.07);
  }
  add(g, new THREE.TorusGeometry(0.1, 0.018, 6, 12, Math.PI * 1.1).rotateX(Math.PI / 2), fur, 0, 0.02, 0, 0, 0.3);
  return g;
}

// their long tail, a mid blue, on its stand, facing +z
function longTail() {
  const g = new THREE.Group();
  add(g, longTailFrame(), new THREE.MeshStandardMaterial({ color: 0x3f74ad, roughness: 0.4, vertexColors: true }));
  const tyre = std(0x1d1a17, 0.9), wheel = new THREE.TorusGeometry(LONG_TAIL.wheel, 0.05, 8, 20).rotateY(Math.PI / 2);
  for (const z of LONG_TAIL.axles) add(g, wheel, tyre, 0, LONG_TAIL.wheel + 0.04, z);
  g.rotation.z = 0.06; // leaning a little on its stand
  return g;
}

// The family, in their own real metres: +x along the street (away from the bend), +z towards
// the house, facing 0 is +z. The pavement is narrow here, about 2 m from the kerb to the front.
function family() {
  const outer = new THREE.Group(), g = new THREE.Group();
  outer.add(g);
  const mum = person({ top: 0xc0262d, skirt: [0xc0262d, 0.5, 0.2], skin: 0xefcfb4, hair: 0x5a3a22, long: true, shoes: 0x5a1a1a, arms: ['down', 'front'] });
  mum.g.position.set(-0.6, 0, -0.2);
  mum.g.rotation.y = 2.0;
  const dad = person({ top: 0xf5d21f, shorts: 0x17181a, short: true, skin: 0xe9c3a3, hair: 0x3b2516, shoes: 0x3a3f46, tall: 1.04 });
  dad.g.position.set(0.6, 0, -0.25);
  dad.g.rotation.y = -2.1;
  const girl = person({ top: 0xf6f5f1, skirt: [0x1f2a4d, 0.5, 0.18], skin: 0xf3d6c0, hair: 0xf0d27a, long: true, arms: ['front', 'front'], tall: 0.62 });
  girl.g.position.set(0, 0, -0.55);
  girl.g.rotation.y = 0.1;
  const pony = toyPony();
  pony.position.set(0, 1.0, 0.3); // in her arms, before her (her own metres, she is scaled)
  pony.rotation.y = Math.PI / 2;
  girl.g.add(pony);
  const kitty = cat();
  kitty.position.set(-1.15, 0, -0.5);
  kitty.scale.setScalar(1.7); // a big cat, to be seen from the street
  kitty.rotation.y = 0.6;
  const bike = longTail();
  bike.position.set(0.2, 0, 0.55);
  bike.rotation.y = -Math.PI / 2; // along the front, its nose up the street
  g.add(mum.g, dad.g, girl.g, kitty, bike);
  outer.scale.setScalar(S);
  return outer;
}

// on the pavement before number 62 (OpenStreetMap's address there: 51.06052 N, 3.69776 E), between
// the kerb and its front, facing the street
export const CEDERSTRAAT = { id: 'cederstraat-gezin', x: -2284.6, z: -997.4, turn: 0.873, size: [3.4, 2.2], make: family };
