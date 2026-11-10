// The Colosseo (the Flavian amphitheatre, AD 72-80), modelled by hand in place of the map's pieces
// of it, from its measurements and photos, in game metres (the real ones times 1.25). One ellipse of
// 188 by 156 m, and every ring of it an offset of that ellipse, so the 80 bays of each ring stand
// one behind the other:
//   the outer ring, travertine, standing only on the north side: three storeys of arches between
//     Tuscan, Ionic and Corinthian half-columns, and over them the attic of Corinthian pilasters
//     with a small window in every other bay and the brackets that held the masts of the awning;
//     at its west end Valadier's brick buttress (1820s), stepping down, at its east end Stern's
//     sloping one (1807); on the south side, where it fell in the earthquake of 1349, only its stumps
//   the second ring, plainer, three storeys high on the north, broken off on the south
//   the third ring, of brick and tuff, under the seats
//   the seats, long gone: a slope of brick and tuff in three tiers, the stumps of its radial walls
//     standing out of it, down to the podium round the arena
//   the arena: its floor gone, so the walls of the hypogeum (the passages under it) stand open,
//     with the stretch of floor rebuilt in wood at the east end, and the cross on the north side
// Its axis is the map's (OpenStreetMap's building:parts of it), turned 0.335 rad from east.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { ellipsePath, arcade, sweep, wall, fin } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';

const X = 1444.5, Z = 1192.4, TURN = -0.335; // its middle, and its long axis turned from east
const A = 117.5, B = 97.5; // half its length and half its width
const BAYS = 80;
const ARENA = -63.8; // the podium round the arena, from the outer wall's face

const TRAVERTINE = ['#dccdae', '#d4c4a3', '#cdbd9c', '#ddd0b4', '#c8b795'];
const BRICK = ['#9e6a50', '#94614a', '#a6755a', '#8e5f49'];
const TUFF = ['#918371', '#877967', '#9a8d7b'];
const pick = (list, seed) => list[Math.floor(rng(Math.abs(Math.round(seed * 9301)) + 49297)() * list.length) % list.length];

// the outer ring's storeys: arches in the first three, the attic over them
const OUTER = [
  { h: 13.1, arch: 0.62, crown: 8.9, frieze: 1.7, order: 'tuscan' },
  { h: 14.8, arch: 0.6, sill: 1.9, crown: 10.6, frieze: 1.8, order: 'ionic', plinth: 1.9 },
  { h: 14.5, arch: 0.6, sill: 1.9, crown: 10.4, frieze: 1.8, order: 'corinthian', plinth: 1.9 },
  { h: 17.4, frieze: 1.6, order: 'pilaster', window: { w: 1.9, y0: 6.4, y1: 9.2, every: 2 }, corbels: 3 },
];
// the inner rings' storeys, at the same floors so the galleries between them are level
const SECOND = [
  { h: 13.1, arch: 0.56, crown: 9.4 },
  { h: 14.8, arch: 0.56, sill: 0.6, crown: 10.8 },
  { h: 14.5, arch: 0.56, sill: 0.6, crown: 10.6 },
];
const THIRD = [{ h: 13.1, arch: 0.5, crown: 8.4 }, { h: 14.8, arch: 0.5, crown: 9.6 }];
const FLOORS = [13.1, 27.9, 42.4];

// the outer ring: north (bays 40 to 79, s from half way round) travertine, with Valadier's
// buttress at the west end (bays 40, 41) and Stern's after the last bay at the east end (78)
const outerStands = (i, k) => {
  if (i === 40) return [1, 1, 0.55, 0][k];
  if (i === 41) return [1, 1, 1, 0.45][k];
  if (i >= 42 && i <= 78) return 1;
  if (i === 79 || i === 0) return 0; // under Stern's buttress
  return k === 0 ? 0.09 : 0; // the stumps of the fallen south side
};
const outerStone = (i, k) => (i <= 41 && i >= 40 ? pick(BRICK, i * 4 + k) : shade(pick(TRAVERTINE, i * 4 + k), k === 0 ? -0.06 : 0));

// the second ring: whole on the north; on the south its top storey broken off, in long stretches
// higher and lower, down into its arches in places, standing whole again near the ends
const south = i => (i > 2 && i < 38 ? Math.max(0, 1 - Math.min(i - 2, 38 - i) / 7) : 1); // 1 near the ends
const secondStands = (i, k) => {
  if (k < 2 || i >= 40 || i <= 2 || i >= 38) return 1;
  const wave = 0.5 + 0.5 * Math.sin(i * 0.45 + 1.3);
  return Math.min(1, 0.45 + 0.45 * wave + 0.1 * rng(i * 31 + 7)() + south(i));
};
// how high the seats' slope reaches at the back: up to the attic on the north, lower behind the
// broken south side
const back = i => (i >= 40 || i <= 2 || i >= 38 ? 40.5 : 33 + 7.5 * south(i));

export function colosseo() {
  const kit = new Kit(), path = ellipsePath(A, B), L = path.length, bay = L / BAYS;

  arcade(kit, path, { bays: BAYS, storeys: OUTER, o: 0, depth: 3, r: 0.85, hex: outerStone, stand: outerStands });
  // the two steps it stands on
  sweep(kit, path, 39.5 * bay, 78.5 * bay, [[-0.5, 0], [1.6, 0], [1.6, 0.4], [0.8, 0.4], [0.8, 0.8], [-0.5, 0.8]], TRAVERTINE[2], { step: bay / 2 });
  arcade(kit, path, { bays: BAYS, storeys: SECOND, o: -9.5, depth: 2.4, hex: (i, k) => shade(pick(TRAVERTINE, i * 3 + k + 500), -0.04), stand: secondStands });
  arcade(kit, path, { bays: BAYS, storeys: THIRD, o: -17, depth: 2.4, hex: (i, k) => pick([...TUFF, ...TUFF, BRICK[0]], i * 2 + k + 900) });

  // Stern's buttress: a wedge of brick against the east end of the outer ring, from its top down
  const sA = 78.5 * bay;
  wall(kit, path, [[sA, 0], [sA + 1.7 * bay, 0], [sA + 0.25 * bay, 59.8], [sA, 59.8]], { o0: -9.5, o1: 1.6, hex: BRICK[2] });

  // the galleries' floors between the rings: between the outer and the second ring only where the
  // outer one stands, between the second and the third all round
  // (the top one not over Valadier's last bay, which is broken off below it)
  for (const y of FLOORS) sweep(kit, path, (y > 40 ? 40.5 : 39.5) * bay, 78.5 * bay, [[-9.5, y - 1.2], [-3, y - 1.2], [-3, y], [-9.5, y]], shade(TUFF[0], -0.1), { step: bay / 2 });
  sweep(kit, path, 0, L, [[-17, 11.9], [-11.9, 11.9], [-11.9, 13.1], [-17, 13.1]], shade(TUFF[1], -0.1), { step: bay / 2 });

  // the seats' slope in three tiers, bay by bay in its patches of brick and tuff, closed underneath
  // down to the third ring and the podium
  for (let i = 0; i < BAYS; i++) {
    const s0 = (i - 0.5) * bay, T = back(i);
    const cavea = [
      [-11.9, T], [-14, T], [-27, 31], [-29, 31], [-30, 28.5], [-46, 17], [-48, 17], [-49, 15.5],
      [-61.5, 7.5], [ARENA, 7.5], [ARENA, 0], [-19.4, 0], [-19.4, 27.9], [-11.9, 27.9],
    ];
    sweep(kit, path, s0, s0 + bay, cavea, pick([...TUFF, ...TUFF, BRICK[0], BRICK[3]], i + 300), { step: bay / 2 });
    // the stump of the radial wall at the bay's side, standing out of the slope, broken off unevenly
    const r = rng(i * 17 + 3), up = () => 0.8 + 2.2 * r();
    fin(kit, path, s0, [[-14, T], [-27, 31], [-46, 17], [-61, 7.6], [-61, 7.6 + up()], [-46, 17 + up()], [-27, 31 + up()], [-14, T + up()]], 1.1, pick(BRICK, i + 700));
  }
  // the podium's parapet
  sweep(kit, path, 0, L, [[ARENA, 7.5], [ARENA + 0.7, 7.5], [ARENA + 0.7, 8.7], [ARENA, 8.7]], '#d6cfbe', { step: bay / 2 });

  hypogeum(kit, path, bay);

  // the cross on the north side of the podium
  const c = path.at(60 * bay), cx = c.x + (ARENA + 1.6) * c.tz, cz = c.z - (ARENA + 1.6) * c.tx;
  kit.box(0.45, 5.2, 0.45, '#3b2d22', cx, 7.5 + 2.6, cz).box(2.8, 0.42, 0.42, '#3b2d22', cx, 7.5 + 3.8, cz, 0, Math.atan2(-c.tz, c.tx));

  return kit.mesh(kitMat(0.92));
}

// The arena's floor gone: the walls of the passages under it, the long ones along the axis, the
// short ones between them, and the curved ones round them, on the bare ground; the floor rebuilt in
// wood over the east end.
function hypogeum(kit, path, bay) {
  const a = A + ARENA, b = B + ARENA, H = 5.2, r = rng(41);
  const floor = new THREE.Shape();
  for (let k = 0; k <= 48; k++) floor[k ? 'lineTo' : 'moveTo'](a * Math.cos((k / 48) * 2 * Math.PI), -b * Math.sin((k / 48) * 2 * Math.PI));
  kit.add(new THREE.ShapeGeometry(floor).rotateX(-Math.PI / 2), '#8f7c63', 0, 0.06, 0);
  const lanes = [-25, -20.5, -16, -11.5, -7, -2.2, 2.2, 7, 11.5, 16, 20.5, 25];
  const reach = z => (a - 7) * Math.sqrt(Math.max(0, 1 - (z / (b - 4.5)) ** 2));
  for (const z of lanes) {
    const half = reach(z);
    if (half > 2) kit.box(2 * half, H, 0.8, pick(TUFF, z * 10 + 5), 0, H / 2, z);
  }
  for (let j = 0; j < lanes.length - 1; j++) {
    const z0 = lanes[j], z1 = lanes[j + 1], half = Math.min(reach(z0), reach(z1));
    for (let x = -half + 2.5; x < half - 1; x += 5.5) {
      if (j === 5 || r() < 0.3) continue; // the middle passage runs through, and here and there a doorway
      kit.box(0.7, H, z1 - z0, pick(BRICK, x * 3 + j), x, H / 2, (z0 + z1) / 2);
    }
  }
  // the curved walls round them, in pieces with gaps
  for (const o of [ARENA - 3.2, ARENA - 6.6]) {
    for (let i = 0; i < BAYS; i++) {
      if (r() < 0.25) continue;
      const s0 = (i - 0.5) * bay;
      wall(kit, path, [[s0, 0], [s0 + bay, 0], [s0 + bay, H], [s0, H]], { o0: o - 0.8, o1: o, hex: pick(BRICK, i + 50 + o) });
    }
  }
  // the rebuilt floor, planks over the east end
  const deck = new THREE.Shape(), t = Math.acos(0.5);
  for (let k = 0; k <= 24; k++) {
    const th = -t + (2 * t * k) / 24;
    deck[k ? 'lineTo' : 'moveTo'](a * Math.cos(th) - 0.6, -b * Math.sin(th) * 0.97);
  }
  kit.add(new THREE.ExtrudeGeometry(deck, { depth: 0.45, bevelEnabled: false }).rotateX(-Math.PI / 2), '#8a6a47', 0, H, 0);
}

// the outline in the city's metres, an ellipse k times the outer wall's, as a flat ring
const ring = (k, n = 64) => Array.from({ length: n }, (_, j) => {
  const t = (j / n) * 2 * Math.PI, u = A * k * Math.cos(t), v = B * k * Math.sin(t);
  return [X + u * Math.cos(-TURN) - v * Math.sin(-TURN), Z + u * Math.sin(-TURN) + v * Math.cos(-TURN)];
}).flat().map(c => Math.round(c * 10) / 10);

// It stands in for the map's pieces of it (area), riders bump into its outer wall (foot), and the
// map's footways round its inside are left out (paths).
export const COLOSSEO = [{ id: 'colosseo', name: 'Colosseo', x: X, z: Z, turn: TURN, reach: 150, area: [ring(1.03)], foot: [ring(1)], paths: [ring(1.005)], make: colosseo }];
