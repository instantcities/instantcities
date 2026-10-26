// Stonehenge as it stands today, modelled by hand from its plan, in real metres and scaled to game
// metres (1.25) at the end, round the middle of the circle (x east, z south); the axis runs
// north-east, 49.6 degrees from north, to the Heel Stone and the midsummer sunrise:
//   the sarsen circle: 30 uprights 4.1 m high, 2.1 m across and 1.1 m thick, on a circle 33 m across,
//     of which 17 stand, with lintels on the north-east side where the ring is still whole
//   the horseshoe of five trilithons, open to the north-east: pairs of uprights, 6 to 7.3 m high,
//     with a lintel across each (three stand whole; the great one in the middle has one upright left
//     and one fallen)
//   the bluestones: a ring and a horseshoe of smaller stones, about 2 m high, many missing
//   the Altar Stone lying in the middle, the Heel Stone out on the axis, the Slaughter Stone fallen
//     by the entrance, the four Station Stones, the ring of Aubrey holes and the bank and ditch
// Riders bump into the stones that stand.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';
import { S, CENTRE } from './frame.js';

const AXIS = (49.6 * Math.PI) / 180; // from north towards the east
const SARSEN = ['#8f8c82', '#86837a', '#979388', '#7f7c72', '#9a968a'];
const BLUE = ['#6f7478', '#666b6f', '#757a7d', '#5f6468'];
const MOSS = '#7d8458', DIRT = '#6a5f48', CHALK = '#d9d6c8';

// a rough block: a box with every vertex shaken a little, so no two stones are alike and the faces are not flat
function block(kit, w, h, d, hex, x, y, z, ry, seed, tilt = 0) {
  const geo = new THREE.BoxGeometry(w, h, d, 3, Math.max(3, Math.round(h)), 3);
  const r = rng(seed), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const edge = Math.abs(p.getY(i)) / (h / 2);
    p.setXYZ(i, p.getX(i) + (r() - 0.5) * w * 0.07, p.getY(i) + (r() - 0.5) * 0.1, p.getZ(i) + (r() - 0.5) * d * 0.09);
    if (edge > 0.99) p.setY(i, p.getY(i) - r() * 0.18); // a worn top
  }
  geo.computeVertexNormals();
  kit.add(geo, hex, x, y + h / 2, z, tilt, ry, 0);
}

// where a point at (u along the axis, v across it) is, east and south of the middle
const world = (u, v) => [u * Math.sin(AXIS) + v * Math.cos(AXIS), -u * Math.cos(AXIS) + v * Math.sin(AXIS)];

export function stonehenge() {
  const kit = new Kit(), r = rng(3);
  const feet = [];
  const pick = (list, k) => list[Math.floor(rng(k * 31 + 5)() * list.length) % list.length];

  // the sarsen circle: 30 uprights, a lintel over each gap between two; which stand and which lintels are in place
  const R = 15.3, UP = 4.1;
  const standing = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 22, 23, 24, 26, 28]); // 17 of the 30
  const lintels = new Set([0, 1, 2, 3, 4, 5, 22, 23, 24]); // the lintel from stone i to the next, where both stand
  const fallen = [13, 14, 15, 16, 17, 20, 25].filter(i => !standing.has(i));
  for (let i = 0; i < 30; i++) {
    const a = AXIS + (i / 30) * 2 * Math.PI, [x, z] = [R * Math.sin(a), -R * Math.cos(a)];
    if (standing.has(i)) {
      block(kit, 2.1, UP, 1.1, pick(SARSEN, i), x, 0, z, -a, i + 100, (r() - 0.5) * 0.03);
      feet.push([x, z, 1.3]);
    } else if (fallen.includes(i)) {
      block(kit, 2.1, 1.1, 4.1, pick(SARSEN, i), x * 1.12, 0, z * 1.12, -a + (r() - 0.5), i + 200, 0.1); // lying on its side
    }
  }
  // lintels over the pairs: each a curved block 3.4 m long on top of two uprights
  for (const i of lintels) {
    const a0 = AXIS + (i / 30) * 2 * Math.PI, a1 = AXIS + ((i + 1) / 30) * 2 * Math.PI, a = (a0 + a1) / 2;
    if (!standing.has(i) || !standing.has((i + 1) % 30)) continue;
    block(kit, 3.7, 0.9, 1.15, pick(SARSEN, i + 7), (R + 0.0) * Math.sin(a), UP, -(R + 0.0) * Math.cos(a), -a, i + 300);
  }

  // the horseshoe of five trilithons, open to the north-east: (u, v, height, whole, which upright stands)
  const TRI = [
    [-1.0, -7.2, 6.0, 'one'], // T1: one upright left
    [-6.3, -5.6, 6.7, 'whole'],
    [-8.8, 0.0, 7.3, 'fallen'], // the great trilithon: one upright standing, one fallen
    [-6.3, 5.6, 6.7, 'whole'],
    [-1.0, 7.2, 6.0, 'whole'],
  ];
  TRI.forEach(([u, v, h, state], k) => {
    const [cx, cz] = world(u, v), face = Math.atan2(-cz, -cx) + Math.PI / 2; // each pair faces the middle
    const along = (s) => [cx + s * Math.cos(face), cz + s * Math.sin(face)];
    const [lx, lz] = along(-1.15), [rx, rz] = along(1.15);
    block(kit, 2.1, h, 1.3, pick(SARSEN, k + 40), lx, 0, lz, -face, k + 400);
    feet.push([lx, lz, 1.4]);
    if (state === 'whole') {
      block(kit, 2.1, h, 1.3, pick(SARSEN, k + 50), rx, 0, rz, -face, k + 410);
      block(kit, 5.4, 1.1, 1.3, pick(SARSEN, k + 60), cx, h, cz, -face, k + 420);
      feet.push([rx, rz, 1.4]);
    } else if (state === 'fallen') {
      block(kit, 2.1, 1.3, h, pick(SARSEN, k + 70), rx + 2, 0, rz + 1, -face + 0.9, k + 430, 0.12); // lying on the ground
      block(kit, 5.4, 1.1, 1.3, pick(SARSEN, k + 80), cx + 3.5, 0, cz + 4, -face + 0.3, k + 440, 0.05);
    }
  });

  // the bluestones: a ring inside the circle's trilithons' outside and a horseshoe inside them, a good many gone
  for (let i = 0; i < 62; i++) {
    if (r() < 0.45) continue;
    const a = (i / 62) * 2 * Math.PI, rr = 11.4 + (r() - 0.5) * 0.5;
    const x = rr * Math.sin(a), z = -rr * Math.cos(a), standingUp = r() < 0.7;
    if (standingUp) { block(kit, 0.9 + r() * 0.4, 1.5 + r() * 0.8, 0.7 + r() * 0.3, pick(BLUE, i), x, 0, z, a, i + 500, (r() - 0.5) * 0.18); feet.push([x, z, 0.8]); }
    else block(kit, 1.1, 0.7, 1.9, pick(BLUE, i), x, 0, z, a + 0.3, i + 520);
  }
  for (let i = 0; i < 19; i++) {
    if (r() < 0.3) continue;
    const t = -1.15 + (i / 18) * 2.3;
    const [x, z] = world(-4.5 - 4.0 * Math.cos(t * 1.25), 5.0 * Math.sin(t * 1.25 * 0.9));
    block(kit, 0.8, 1.7 + r() * 0.5, 0.6, pick(BLUE, i + 9), x, 0, z, -AXIS + t, i + 560, (r() - 0.5) * 0.12);
  }

  // the Altar Stone, the big flat one in the middle, half buried
  {
    const [x, z] = world(-4.0, 0.3);
    block(kit, 4.8, 0.7, 1.0, '#7c7466', x, 0, z, -AXIS + 0.2, 600);
  }
  // the Heel Stone, on the axis 77 m out, leaning to the middle; the Slaughter Stone, fallen by the entrance
  {
    const [hx, hz] = world(75.5, 0);
    block(kit, 2.4, 4.9, 2.4, '#8a867a', hx, 0, hz, 0.4, 610, -0.07);
    feet.push([hx, hz, 1.8]);
    const [sx, sz] = world(23.5, -3.8);
    block(kit, 1.9, 1.0, 6.9, '#8a867a', sx, 0, sz, -AXIS + 0.1, 620, 0.04);
  }
  // the four Station Stones, on the circle of the Aubrey holes: two with a mound round them
  for (const [u, v] of [[-31.5, -30.5], [31.5, 30.5], [-30.0, 39.5], [30.0, -39.5]].map(p => p)) {
    const [x, z] = world(u * 0.75, v * 0.9);
    block(kit, 1.1, 1.0, 1.1, '#8a867a', x, 0, z, 0.2, 630 + Math.round(u));
  }
  // Aubrey holes: 56 pits in a ring 87 m across, marked in the turf with white discs
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * 2 * Math.PI, x = 43.5 * Math.sin(a), z = -43.5 * Math.cos(a);
    kit.add(new THREE.CylinderGeometry(0.75, 0.75, 0.04, 10), CHALK, x, 0.03, z);
  }
  // the ditch and the bank, a low ring a little under the Heel Stone's distance
  const ring = (r0, r1, y, hex) => { const s = new THREE.Shape(); for (let k = 0; k <= 64; k++) s[k ? 'lineTo' : 'moveTo'](r1 * Math.cos((k / 64) * 2 * Math.PI), r1 * Math.sin((k / 64) * 2 * Math.PI)); const h = new THREE.Path(); for (let k = 0; k <= 64; k++) h[k ? 'lineTo' : 'moveTo'](r0 * Math.cos((k / 64) * 2 * Math.PI), r0 * Math.sin((k / 64) * 2 * Math.PI)); s.holes.push(h); kit.add(new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2), hex, 0, y, 0); };
  ring(50.5, 53.5, 0.05, '#c9c6b4'); // the ditch's chalk
  ring(53.5, 57, 0.11, '#9a9a6a'); // the bank
  const m = kit.mesh(kitMat(0.96));
  m.scale.setScalar(S);
  return { mesh: m, feet };
}

// the feet of the standing stones as rings in the map's metres, from the same layout
const ring8 = (x, z, r) => Array.from({ length: 8 }, (_, k) => [x + r * Math.cos((k / 8) * 2 * Math.PI), z + r * Math.sin((k / 8) * 2 * Math.PI)]);

let model = null;
const get = () => (model ??= stonehenge());

export const STONEHENGE = [{
  id: 'stonehenge', name: 'Stonehenge', x: CENTRE[0], z: CENTRE[1], turn: 0, reach: 600,
  area: [onMap(CENTRE[0], CENTRE[1], 0, ring8(0, 0, 64 * S).map(([x, z]) => [x, z]))],
  get foot() { return get().feet.map(([x, z, rr]) => onMap(CENTRE[0], CENTRE[1], 0, ring8(x * S, z * S, rr * S))); },
  make: () => get().mesh.clone(),
}];
