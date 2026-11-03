// Piet Blom's cube houses over the Overblaak (1978-84) and the Blaaktoren beside them, modelled by hand
// in place of the map's hundreds of little pieces of them, in game metres (the real ones times 1.25):
//   the Kubuswoningen: 38 houses, each a cube tipped onto one corner so that the line from that corner
//     to the opposite one stands upright, on a hexagonal pillar holding the stairs; a forest of them,
//     their faces yellow below and grey above with windows on every face, and the two big cubes at
//     the ends (one of them the youth hostel). Each one stands where the map has the three faces of
//     its top: where three of those meet, at their blunt corners, is the cube's top corner
//   the Blaaktoren, 't Potlood (1984), on its hexagonal plan under the pencil's point of zinc
// Riders ride in under the cubes between their pillars, and bump into the pillars and the Blaaktoren.
// The model's own metres: x east and z south as on the map (no turn), from X, Z.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { polygon, wall } from '../core/js/arcade.js';

const X = 450, Z = -120;
// the houses' top corners, from X, Z, and the two big cubes'
const CUBES = [[-34.2, -2.7], [-43.9, -7.6], [-53.5, -12.5], [42.6, 36.6], [4.2, 16.9], [13.9, 21.8], [-5.4, 12], [-15, 7.1], [-24.6, 2.2], [-35.3, -24.2],
  [-26.2, -30], [-44.9, -29.1], [-44.4, -18.4], [-45.4, -39.9], [-36.4, -45.7], [34.6, 64.1], [43.7, 58.2], [12.8, 0.4], [24, 27.5], [32.5, 20.9],
  [41.6, 15.1], [13.3, 11.2], [3.1, -4.5], [22.4, 5.3], [32, 10.2], [-5.9, 1.6], [-6.4, -9.2], [0.9, -47.5], [-27.9, -62.2],
  [51.7, 30.8], [60.8, 24.9], [69.9, 19], [52.8, 52.4], [52.2, 41.6], [51.2, 20], [70.4, 29.8], [61.8, 46.5], [71.4, 51.4], [70.9, 40.6]];
const BIG = [[24, 47], [-17.9, -44]];
// round all the map's pieces of them, from X, Z
const GROUND = [[-60, -16], [-52, -43], [-35, -66], [-28, -70], [1, -55], [7, -52], [76, 15], [77, 26], [78, 55], [72, 59], [35, 71], [28, 68], [9, 58], [-60, -8]];
const R = 6.24, BIG_R = 17; // the hexagon's radius seen from above: a cube's edge is R times 1.22
const PILLAR = 6.5, BIG_TOP = 32.5; // where a house's lowest corner sits, and how high the big cubes reach
const LATTICE = Math.atan2(4.9, 9.63); // the way the rows run, as the map has them
const YELLOW = '#e3b22e', GREY = '#8d9196', WIN = '#26303a', FRAME = '#f1efe8', CONCRETE = '#cdc8bd';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
// a cube on its corner: from its own axes to the world's, its top corner straight up, the corners
// below turned to match the map's (a lower corner points LATTICE - 150 degrees round from east)
const TILT = new THREE.Quaternion().setFromUnitVectors(V(1, 1, 1).normalize(), V(0, 1, 0));
const LOW = V(1, -1, -1).applyQuaternion(TILT), YAW = Math.atan2(LOW.z, LOW.x) - (LATTICE - (150 * Math.PI) / 180);
const TURN = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), YAW).multiply(TILT);
const FACES = [V(1, 0, 0), V(0, 1, 0), V(0, 0, 1), V(-1, 0, 0), V(0, -1, 0), V(0, 0, -1)];
const Z0 = V(0, 0, 1);

// a piece in the cube's own frame (y along n out of a face) put into the world at the cube's middle c
function onCube(geo, n, at, c) {
  geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Z0, n)).translate(at.x, at.y, at.z);
  return geo.applyQuaternion(TURN).translate(c.x, c.y, c.z);
}

function cube(kit, x, z, r, bottom) {
  const e = r * Math.sqrt(1.5), h = e / 2, c = V(x, bottom + h * Math.sqrt(3), z);
  for (const n of FACES) {
    const up = n.x + n.y + n.z > 0; // the three faces round the top corner
    kit.add(onCube(new THREE.PlaneGeometry(e, e), n, n.clone().multiplyScalar(h), c), up ? GREY : YELLOW);
    // the windows: four on a face below, one high up on a face above
    const [t1, t2] = FACES.filter(f => Math.abs(f.dot(n)) < 0.5 && f.x + f.y + f.z > 0);
    const spots = up ? [[0.12, 0.12]] : [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([a, b]) => [a + 0.05, b + 0.05]);
    for (const [a, b] of spots) {
      const at = n.clone().multiplyScalar(h).addScaledVector(t1, a * e).addScaledVector(t2, b * e);
      const w = e * (up ? 0.2 : 0.24);
      kit.add(onCube(new THREE.BoxGeometry(w + 0.35, w + 0.35, 0.12), n, at.clone().addScaledVector(n, 0.06), c), FRAME);
      kit.add(onCube(new THREE.BoxGeometry(w, w, 0.12), n, at.clone().addScaledVector(n, 0.12), c), WIN);
    }
  }
}

export function kubuswoningen() {
  const kit = new Kit();
  for (const [x, z] of CUBES) {
    kit.add(new THREE.CylinderGeometry(1.7, 1.9, PILLAR + 1, 6), CONCRETE, x, (PILLAR + 1) / 2, z);
    cube(kit, x, z, R, PILLAR);
  }
  for (const [x, z] of BIG) {
    const e = BIG_R * Math.sqrt(1.5), bottom = BIG_TOP - e * Math.sqrt(3);
    // the big ones sit with their lowest corner in a block of concrete
    kit.add(new THREE.CylinderGeometry(9, 9.5, bottom + 9, 6), CONCRETE, x, (bottom + 9) / 2, z);
    cube(kit, x, z, BIG_R, bottom);
  }
  return kit.mesh(kitMat(0.7));
}

// The Blaaktoren: a hexagonal tower of pale concrete with its bands of windows, under its point
const BLAAK = { x: 375.3, z: -151.6, r: 16.2, body: 44, tip: 76 };
export function blaaktoren() {
  const kit = new Kit(), { r, body, tip } = BLAAK;
  kit.add(new THREE.CylinderGeometry(r - 0.3, r - 0.3, body, 6), '#d3cec2', 0, body / 2, 0);
  polygon(r - 0.3, 6, Math.PI / 6).forEach(p => {
    for (let y = 4; y < body - 2; y += 3.4) wall(kit, p, [[1.2, y], [p.length - 1.2, y], [p.length - 1.2, y + 1.7], [1.2, y + 1.7]], { o0: 0, o1: 0.15, hex: WIN });
  });
  kit.add(new THREE.CylinderGeometry(r + 0.6, r + 0.6, 1, 6), '#b9b4a8', 0, body, 0);
  kit.add(new THREE.ConeGeometry(r + 0.4, tip - body, 6), '#79828a', 0, body + (tip - body) / 2, 0);
  // the dormers in the point, a row on each face
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 6 + (k + 0.5) * (Math.PI / 3), d = (r + 0.4) * Math.cos(Math.PI / 6);
    for (const [y, f] of [[body + 6, 0.8], [body + 14, 0.55]]) kit.box(4, 2.2, 0.4, WIN, Math.cos(a) * d * f, y, Math.sin(a) * d * f, 0, Math.PI / 2 - a);
  }
  return kit.mesh(kitMat(0.8));
}

// a hexagon of radius r round (x, z), its corners as on the cubes' (or from `start`), flat for area and foot
const hexagon = (x, z, r, start = LATTICE + Math.PI / 6) => Array.from({ length: 6 }, (_, k) => {
  const a = start + (k * Math.PI) / 3;
  return [x + r * Math.cos(a), z + r * Math.sin(a)];
}).flat().map(q => Math.round(q * 10) / 10);

export const KUBUS = [
  {
    id: 'kubuswoningen', name: 'Kubuswoningen', x: X, z: Z, reach: 110,
    area: [GROUND.flatMap(([x, z]) => [X + x, Z + z])],
    foot: [...CUBES.map(([x, z]) => hexagon(X + x, Z + z, 1.9)), ...BIG.map(([x, z]) => hexagon(X + x, Z + z, 9.5))],
    make: kubuswoningen,
  },
  {
    id: 'blaaktoren', name: 'Blaaktoren', x: BLAAK.x, z: BLAAK.z, reach: 200,
    area: [hexagon(BLAAK.x, BLAAK.z, BLAAK.r + 2, Math.PI / 6)], foot: [hexagon(BLAAK.x, BLAAK.z, BLAAK.r, Math.PI / 6)],
    make: blaaktoren,
  },
];
