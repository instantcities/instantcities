// The plaster casts of the people of Pompeii. The ash that buried the town set hard round the
// bodies, which rotted away and left hollows in it; in 1863 Giuseppe Fiorelli had plaster poured into
// the hollows, and what came out had the shape of the person as they died. Modelled by hand, a
// person lying curled on their side with the arms over the face, face down, on their back with the
// limbs drawn up, a child, and the dog, in plaster white on the dark ash:
//   the Garden of the Fugitives at the end of the Vicolo dei Fuggiaschi: thirteen people who got no
//     further than this garden, a low wall round it
//   the Forum Granaries: a few of them set on stone plinths
// Real metres, scaled by 1.25 like the rest of the map. Riders bump into the casts.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { WallBatch, ruinWall, ruinTexture } from '../core/js/roman.js';

const S = 1.25, PLASTER = ['#d8d0bf', '#d2c9b6', '#dcd5c6', '#cdc3ae'], ASH = '#6f6556';

// One person, lying with their head towards +x of their own frame, turned yaw about the vertical, at
// (x, z). pose: curled (on one side, knees up, hands at the face), prone (face down, arms bent by the
// head), drawn (on the back, arms and knees drawn up), huddled (curled round a smaller one: with
// `child`). side: -1 lies on the other side (a mirror). s: the size (a child's is 0.55).
function person(kit, x, z, yaw, pose, { side = 1, s = 1, tone = 0 } = {}) {
  const hex = PLASTER[tone % PLASTER.length], c = Math.cos(yaw), n = Math.sin(yaw), k = S * s;
  const P = (lx, ly, lz) => [x + (lx * c - lz * side * n) * k, ly * k, z + (lx * n + lz * side * c) * k];
  const ball = (lx, ly, lz, rx, ry = rx, rz = rx, spin = 0) => kit.add(new THREE.SphereGeometry(1, 10, 8).scale(rx * k, ry * k, rz * k), hex, ...P(lx, ly, lz), 0, -yaw + spin, 0);
  const limb = (a, b, r, rb = r * 0.8) => { // a rod from a to b, thinning, with a ball at the far end
    kit.rod(P(...a), P(...b), r * k, hex, 7);
    ball(...b, rb);
  };
  const head = (lx, ly, lz) => { ball(lx, ly, lz, 0.1, 0.115, 0.095); ball(lx + 0.08, ly - 0.05, lz, 0.05, 0.04, 0.06); }; // the head, and the jaw below it
  if (pose === 'curled') {
    ball(-0.05, 0.17, 0, 0.36, 0.15, 0.2); // the back and chest
    ball(-0.36, 0.17, 0, 0.17, 0.16, 0.2); // the hips
    head(0.45, 0.14, 0.08);
    limb([-0.36, 0.17, 0.05], [-0.02, 0.17, 0.3], 0.085, 0.07); // the thigh
    limb([-0.02, 0.17, 0.3], [-0.4, 0.09, 0.36], 0.065, 0.05); // the shin back
    limb([0.22, 0.2, 0.1], [0.4, 0.27, 0.24], 0.06, 0.05); // the upper arm
    limb([0.4, 0.27, 0.24], [0.52, 0.2, 0.1], 0.05, 0.06); // the forearm to the face
  } else if (pose === 'prone') {
    ball(0, 0.12, 0, 0.32, 0.12, 0.21);
    ball(-0.3, 0.1, 0, 0.16, 0.1, 0.19);
    head(0.46, 0.1, 0.03);
    limb([-0.3, 0.09, 0.09], [-0.72, 0.07, 0.15], 0.085, 0.07); limb([-0.72, 0.07, 0.15], [-1.12, 0.06, 0.1], 0.065, 0.05);
    limb([-0.3, 0.09, -0.09], [-0.65, 0.08, -0.2], 0.085, 0.07); limb([-0.65, 0.08, -0.2], [-0.95, 0.15, -0.3], 0.065, 0.05); // one leg drawn up
    limb([0.24, 0.12, 0.21], [0.4, 0.1, 0.32], 0.06, 0.05); limb([0.4, 0.1, 0.32], [0.52, 0.1, 0.15], 0.05, 0.06);
    limb([0.24, 0.12, -0.21], [0.42, 0.1, -0.3], 0.06, 0.05); limb([0.42, 0.1, -0.3], [0.56, 0.09, -0.14], 0.05, 0.06);
  } else if (pose === 'drawn') { // on the back, the limbs drawn up as the heat drew them
    ball(0, 0.13, 0, 0.32, 0.13, 0.21);
    ball(-0.3, 0.12, 0, 0.16, 0.12, 0.19);
    head(0.47, 0.13, 0);
    limb([-0.3, 0.13, 0.09], [-0.62, 0.38, 0.14], 0.085, 0.07); limb([-0.62, 0.38, 0.14], [-0.9, 0.1, 0.2], 0.065, 0.05);
    limb([-0.3, 0.13, -0.09], [-0.7, 0.3, -0.16], 0.085, 0.07); limb([-0.7, 0.3, -0.16], [-1.02, 0.08, -0.24], 0.065, 0.05);
    limb([0.24, 0.15, 0.2], [0.4, 0.36, 0.3], 0.06, 0.05); limb([0.4, 0.36, 0.3], [0.55, 0.46, 0.18], 0.05, 0.06);
    limb([0.24, 0.15, -0.2], [0.36, 0.3, -0.32], 0.06, 0.05); limb([0.36, 0.3, -0.32], [0.5, 0.2, -0.2], 0.05, 0.06);
  } else if (pose === 'dog') { // on its back, the legs in the air, the head thrown back
    ball(0, 0.2, 0, 0.3, 0.15, 0.14);
    ball(0.4, 0.26, 0.04, 0.09, 0.08, 0.08); ball(0.48, 0.22, 0.04, 0.07, 0.04, 0.045); // the head and the muzzle, mouth open
    limb([0.22, 0.24, 0.08], [0.3, 0.55, 0.14], 0.03, 0.03); limb([0.22, 0.24, -0.08], [0.18, 0.5, -0.16], 0.03, 0.03);
    limb([-0.2, 0.24, 0.08], [-0.28, 0.52, 0.2], 0.035, 0.03); limb([-0.2, 0.24, -0.08], [-0.34, 0.45, -0.1], 0.035, 0.03);
    limb([-0.3, 0.2, 0], [-0.55, 0.14, 0.1], 0.025, 0.02); // the tail
  }
}

// a person on a low stone plinth: a case in a museum, without its glass
function onPlinth(kit, x, z, yaw, pose, opts) {
  kit.box(2.4, 0.5, 1.6, '#9c9078', x, 0.25, z, 0, -yaw);
  kit.box(2.5, 0.12, 1.7, '#bcb095', x, 0.56, z, 0, -yaw);
  const sub = new Kit();
  person(sub, 0, 0, yaw, pose, opts);
  sub.pieces.forEach(g => { g.translate(x, 0.62, z); kit.pieces.push(g); });
}

// the garden: where it stands, the way its alley runs, and who lies where in it (u across, v along,
// in metres: the people as they were found, close together at the garden's far end)
const GARDEN = { x: 738, z: 162, turn: 0.99 };
const LYING = [
  [-3.4, 3.1, 0.3, 'curled'], [-1.6, 3.7, 2.9, 'drawn', { side: -1 }], [0.2, 3.3, -0.2, 'prone'], [1.9, 3.8, 3.2, 'curled', { side: -1 }],
  [-4.0, 0.9, 1.1, 'prone'], [-2.0, 1.4, 0.2, 'drawn'], [3.4, 1.0, -0.6, 'curled'],
  [-0.3, 0.2, 3.0, 'curled', { s: 0.55 }], [0.9, 0.6, -2.6, 'curled', { s: 0.6, side: -1 }], [2.6, -1.2, 0.5, 'drawn', { s: 0.9 }],
  [-3.1, -1.4, 1.9, 'prone', { s: 0.95 }], [1.6, -2.2, 3.0, 'curled'], [-1.0, -2.6, -0.4, 'dog'],
];

function garden() {
  const kit = new Kit(), walls = new WallBatch(), { x, z, turn } = GARDEN;
  const c = Math.cos(turn), n = Math.sin(turn), at = (u, v) => [x + (u * c - v * n) * S, z + (u * n + v * c) * S];
  // the ash they lay in: a darker patch of ground, the garden's earth
  [[0, 0, 5.2, 4.6, ASH], [-1.5, 1, 3.4, 3, '#7a6e5c'], [2, -1.2, 2.6, 2.2, '#5f574a']].forEach(([u, v, a, b, hex], i) => {
    const [px, pz] = at(u, v);
    kit.add(new THREE.CircleGeometry(1, 20).scale(a * S, b * S, 1).rotateX(-Math.PI / 2), hex, px, 0.05 + i * 0.01, pz, 0, -turn);
  });
  // a low wall round three sides of it: the garden of a house, its fourth side open to the alley
  const W = 6.6 * S * 1.2, D = 6 * S * 1.2;
  const pts = [[-W, -D], [-W, D], [W, D], [W, -D]];
  const corner = ([u, v]) => at(u / S, v / S);
  [[0, 1], [1, 2], [2, 3]].forEach(([a, b], i) => {
    const [ax, az] = corner(pts[a]), [bx, bz] = corner(pts[b]), L = Math.hypot(bx - ax, bz - az);
    ruinWall(walls, ax, az, bx, bz, (bz - az) / L, -(bx - ax) / L, L, 0, 2.4, 61 + i, 0, L / 9, 0.9);
  });
  LYING.forEach(([u, v, yaw, pose, o], i) => { const [px, pz] = at(u, v); person(kit, px, pz, yaw + turn, pose, { tone: i, ...o }); });
  const group = new THREE.Group();
  group.add(kit.mesh(kitMat(0.95)), walls.mesh(ruinTexture(5, '', 62)));
  return group;
}

// the Granaries of the Forum: four of them on plinths in the open middle of the building
const GRANARY = [[-4.6, -2, 0.4, 'curled'], [-1.5, 3, 2.4, 'drawn', { side: -1 }], [1.6, -2.4, 0.0, 'prone'], [4.6, 2.4, 2.8, 'curled', { side: -1 }]];
function granaries() {
  const kit = new Kit(), at = [-204, 101];
  GRANARY.forEach(([dx, dz, yaw, pose, o], i) => onPlinth(kit, at[0] + dx * 1.25, at[1] + dz * 1.25, yaw, pose, { tone: i + 1, ...o }));
  return kit.mesh(kitMat(0.95));
}

// what riders bump into: a patch round each person
const patch = ([x, z], r = 0.9) => onMap(x, z, 0, rect(-r, -r, r, r));
const gardenAt = (u, v) => { const c = Math.cos(GARDEN.turn), n = Math.sin(GARDEN.turn); return [GARDEN.x + (u * c - v * n) * S, GARDEN.z + (u * n + v * c) * S]; };

export const CASTS = [
  { id: 'casts-garden', name: 'Garden of the Fugitives', x: 0, z: 0, turn: 0, reach: 520, make: garden, foot: LYING.map(([u, v, , , o]) => patch(gardenAt(u, v), 0.7 + (o?.s ?? 1) * 0.5)) },
  { id: 'casts-granaries', name: 'Forum Granaries', x: 0, z: 0, turn: 0, reach: 420, make: granaries, foot: GRANARY.map(([dx, dz]) => patch([-204 + dx * 1.25, 101 + dz * 1.25], 1.6)) },
];
export const CASTS_AT = GARDEN;
