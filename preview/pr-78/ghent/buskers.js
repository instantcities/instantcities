// Buskers along the Belfortstraat, only for the tour: a guitarist with his case open, a woman with an
// accordion, a violinist and a saxophonist, each with their back to the houses on the pavement, a hat
// or case for the coins in front of them and a few people stopped to listen (hand-written).
// Each musician is one merged mesh, swaying a little to the music; the listeners are one mesh together.
import * as THREE from 'three';
import { person, add, std } from './wedding.js';
import { bake } from './stroppen.js';

const S = 1.25; // game metres to a real metre
const LINE = [[175, -181], [251, -261], [312, -325]]; // the Belfortstraat's middle, from the Botermarkt
const SIDE = 5.6; // metres from its middle to where they stand, on the pavement

const coins = (g, x, z) => { for (let k = 0; k < 5; k++) add(g, new THREE.CylinderGeometry(0.012, 0.012, 0.004, 8), std(0xd8b04a, 0.3), x + (k % 3) * 0.03 - 0.03, 0.05, z + Math.floor(k / 3) * 0.03); };

function guitarist() {
  const p = person({ top: 0x5a6b3a, legs: 0x2e3b55, skin: 0xe2b896, hair: 0x5a3a22, long: true, arms: ['front', 'front'] });
  const wood = std(0xb5651d, 0.6);
  add(p.g, new THREE.CylinderGeometry(0.2, 0.2, 0.09, 16), wood, 0.02, 1.0, 0.24, Math.PI / 2, 0, 0.5); // the body, across him
  add(p.g, new THREE.CylinderGeometry(0.06, 0.06, 0.095, 12), std(0x1a1210), 0.02, 1.0, 0.25, Math.PI / 2, 0, 0.5); // its hole
  add(p.g, new THREE.BoxGeometry(0.05, 0.5, 0.03), std(0x4a2a14, 0.6), -0.22, 1.22, 0.24, 0, 0, 0.95); // the neck
  // the case open on the stones in front, its lining red
  add(p.g, new THREE.BoxGeometry(0.4, 0.06, 1.0), std(0x1a1a1c, 0.7), 0, 0.03, 0.9);
  add(p.g, new THREE.BoxGeometry(0.34, 0.02, 0.92), std(0x8a1c2a, 0.9), 0, 0.055, 0.9);
  coins(p.g, 0, 0.8);
  return p.g;
}

function accordionist() {
  const p = person({ top: 0x2a4a6a, skirt: [0x3a2a4a, 0.55, 0.12], skin: 0xefcfb4, hair: 0xc9a35e, long: true, arms: ['front', 'front'] });
  add(p.g, new THREE.BoxGeometry(0.44, 0.36, 0.22), std(0xa3172b, 0.4), 0, 1.12, 0.26); // the accordion on her chest
  add(p.g, new THREE.BoxGeometry(0.06, 0.34, 0.2), std(0xf2efe8, 0.5), -0.24, 1.12, 0.26); // its keys
  for (let k = 0; k < 4; k++) add(p.g, new THREE.BoxGeometry(0.45, 0.012, 0.23), std(0x1a1a1c), 0, 0.98 + k * 0.09, 0.26); // the bellows' folds
  hat(p.g);
  return p.g;
}

function violinist() {
  const p = person({ top: 0x1c1c1e, legs: 0x1c1c1e, skin: 0xd49f7c, hair: 0x1a1412, arms: ['up', 'front'], tall: 1.03 });
  p.arms[0].rotation.set(-1.9, 0, -0.6); // the left hand up at the violin's neck
  add(p.g, new THREE.BoxGeometry(0.17, 0.06, 0.36), std(0x8a3e12, 0.5), -0.12, 1.5, 0.22, 0.3, 0.5, 0); // the violin under his chin
  add(p.g, new THREE.CylinderGeometry(0.006, 0.006, 0.7, 4), std(0xd8c79a), 0.08, 1.32, 0.4, 0, 0, 1.2); // the bow
  hat(p.g);
  return p.g;
}

function saxophonist() {
  const p = person({ top: 0x6b2f1f, legs: 0x26262a, skin: 0x7a4b32, hair: 0x1a1412, arms: ['front', 'front'] });
  const brass = std(0xd4a017, 0.3, { metalness: 0.7 });
  add(p.g, new THREE.CylinderGeometry(0.03, 0.05, 0.6, 10), brass, 0.02, 1.25, 0.22, -0.35); // the body, down from his mouth
  add(p.g, new THREE.CylinderGeometry(0.1, 0.05, 0.16, 12), brass, 0.02, 0.93, 0.3, 0.6); // the bell, turned up
  add(p.g, new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), std(0x1a1a1c), 0.02, 1.58, 0.16, 1.2); // the mouthpiece
  hat(p.g);
  return p.g;
}

// a hat upside down on the stones in front, a few coins in it
function hat(g) {
  add(g, new THREE.CylinderGeometry(0.15, 0.11, 0.1, 14, 1, true), std(0x3a2e22, 0.9, { side: THREE.DoubleSide }), 0, 0.05, 0.75);
  add(g, new THREE.CylinderGeometry(0.11, 0.11, 0.01, 14), std(0x3a2e22, 0.9), 0, 0.005, 0.75);
  coins(g, 0, 0.73);
}

// [metres along LINE, side (1: on the right going up it, -1: the left), the musician, listeners [x, z, turn, person]
// in the musician's own metres: x to their left, z in front]
const SKINS = [0xe9c3a3, 0xd49f7c, 0xa8724f, 0xf0d0b5];
const SPOTS = [
  [24, 1, guitarist, [[-1.1, 1.9, 2.7, { top: 0xd94f70, legs: 0x26262a, long: true }], [0.9, 2.1, 3.5, { top: 0x2f5d8c, legs: 0x3b3b3b }]]],
  [62, -1, accordionist, [[1.2, 1.8, 3.6, { top: 0xf2c94c, skirt: [0x3a3a3a, 0.5, 0.1], long: true }]]],
  [118, 1, violinist, [[-1, 2, 2.8, { top: 0x5b7f4a, legs: 0x2a2a2e }], [-0.2, 2.4, 3.1, { top: 0x7a5230, legs: 0x3b3b3b, tall: 0.6 }], [1.1, 1.9, 3.5, { top: 0x9fc5e8, skirt: [0x9fc5e8, 0.6, 0.15], long: true }]]],
  [160, -1, saxophonist, [[1, 2, 3.5, { top: 0x8a2f2f, legs: 0x26262a }]]],
];

export function buskers() {
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 });
  const cum = [0];
  for (let k = 1; k < LINE.length; k++) cum.push(cum[k - 1] + Math.hypot(LINE[k][0] - LINE[k - 1][0], LINE[k][1] - LINE[k - 1][1]));
  const crowd = new THREE.Group(), players = [];
  SPOTS.forEach(([d, side, make, listeners], i) => {
    let k = 1;
    while (k < LINE.length - 1 && cum[k] < d) k++;
    const [ax, az] = LINE[k - 1], [bx, bz] = LINE[k], L = cum[k] - cum[k - 1], t = (d - cum[k - 1]) / L, dx = (bx - ax) / L, dz = (bz - az) / L;
    const x = ax + (bx - ax) * t + dz * side * SIDE, z = az + (bz - az) * t - dx * side * SIDE; // (dz, -dx): right of the way up
    const face = Math.atan2(-dz * side, dx * side); // towards the street
    const m = new THREE.Mesh(bake(make()), mat);
    m.castShadow = true;
    m.position.set(x, 0, z);
    m.rotation.y = face;
    m.scale.setScalar(S);
    g.add(m);
    players.push(m);
    // those listening, in front of the musician, turned towards them
    const spot = new THREE.Group();
    spot.position.set(x, 0, z);
    spot.rotation.y = face;
    spot.scale.setScalar(S);
    listeners.forEach(([lx, lz, turn, o], j) => {
      const p = person({ skin: SKINS[(i + j) % SKINS.length], hair: [0x2b1d14, 0x5a3a22, 0xc9a35e][(i + j) % 3], ...o });
      p.g.position.set(lx, 0, lz);
      p.g.rotation.y = turn;
      spot.add(p.g);
    });
    crowd.add(spot);
  });
  const listening = new THREE.Mesh(bake(crowd), mat);
  listening.castShadow = true;
  g.add(listening);
  // on the ground where they stand, and swaying a little to the music
  let placed = false;
  g.userData.update = (tour, t, ground) => {
    g.position.set(0, 0, 0); // (they are put in the world's own metres)
    g.rotation.set(0, 0, 0);
    if (!placed) {
      placed = true;
      for (const m of players) m.position.y = ground(m.position.x, m.position.z);
      listening.position.y = ground(LINE[1][0], LINE[1][1]);
    }
    players.forEach((m, i) => { m.rotation.z = Math.sin(t * 2.2 + i * 1.7) * 0.035; });
  };
  return g;
}

export const BUSKERS = { id: 'buskers', x: LINE[0][0], z: LINE[0][1], make: buskers };
