// Nelson's Column (William Railton, 1840-43) in the middle of Trafalgar Square, modelled by hand in
// place of the map's rings of it, from its measurements and photos, in game metres (the real ones
// times 1.25), on the map's outline: its steps 16 m square and Nelson's hat 65 m up.
//   the granite steps, and the pedestal on them with a bronze relief of a battle on each side,
//     cast from captured French cannon
//   the four bronze lions by Landseer, lying on their plinths out from the corners
//   the fluted granite column, its bronze Corinthian capital and the drum on top
//   Nelson in sandstone, in his bicorne hat, leaning on his sword, a coil of rope behind him
// Riders ride round it: the steps and the lions' plinths stop them.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = -252.3, Z = -499.5, TURN = 0.269; // its middle, and its sides turned to the map's square
const STEPS = 7.85, DIE = 3.95, COLUMN = [13.6, 53.4], TOP = 66;
const GRANITE = '#c3bdb0', GRANITE2 = '#aea89b', BRONZE = '#3e3b33', MANE = '#33302a', SAND = '#a9a497';

// a lion lying on its plinth at (x, z), facing the way a (from +x towards +z), its paws at y
function lion(kit, x, z, y, a) {
  const c = Math.cos(a), s = Math.sin(a);
  // a piece at f along its body, up above the plinth, side across it, turned with it
  const at = (geo, hex, f, up, side) => kit.add(geo, hex, x + f * c - side * s, y + up, z + f * s + side * c, 0, -a);
  const ball = (sx, sy, sz) => new THREE.SphereGeometry(1, 12, 8).scale(sx, sy, sz);
  at(new THREE.CapsuleGeometry(0.95, 3.2, 4, 10).rotateZ(Math.PI / 2).scale(1, 1, 1.15), BRONZE, -0.7, 1.05, 0); // the body
  at(ball(1.1, 0.95, 1.25), BRONZE, -2.3, 1, 0); // the haunches
  at(ball(1.05, 1.3, 1.2), MANE, 1.5, 1.95, 0); // the mane
  at(ball(0.72, 0.75, 0.66), BRONZE, 2.25, 2.15, 0); // the head, looking out
  at(new THREE.BoxGeometry(0.75, 0.5, 0.6), BRONZE, 2.85, 1.95, 0); // the muzzle
  for (const side of [-0.45, 0.45]) at(new THREE.ConeGeometry(0.18, 0.4, 4), MANE, 1.95, 2.95, side); // the ears
  for (const side of [-0.6, 0.6]) {
    at(new THREE.BoxGeometry(2.3, 0.45, 0.55), BRONZE, 2.6, 0.23, side); // the forelegs, stretched out
    at(new THREE.BoxGeometry(1.1, 0.45, 0.6), BRONZE, -1.7, 0.23, side * 1.85); // the hind paws, tucked in
  }
  at(new THREE.BoxGeometry(1.8, 0.25, 0.28), BRONZE, -3.6, 0.15, 0.9); // the tail
}

export function nelson() {
  const kit = new Kit();
  // the steps, the pedestal and its reliefs
  for (let k = 0; k < 3; k++) kit.box(2 * (STEPS - k * 0.6), 0.6, 2 * (STEPS - k * 0.6), k % 2 ? GRANITE2 : GRANITE, 0, 0.3 + k * 0.6, 0);
  kit.box(2 * DIE + 1.8, 1.2, 2 * DIE + 1.8, GRANITE2, 0, 2.4, 0);
  kit.box(2 * DIE, 8.6, 2 * DIE, GRANITE, 0, 7.3, 0);
  kit.box(2 * DIE + 1, 1, 2 * DIE + 1, GRANITE2, 0, 12.1, 0);
  kit.box(2 * DIE + 0.4, 1, 2 * DIE + 0.4, GRANITE, 0, 13.1, 0);
  for (const [dx, dz, ry] of [[1, 0, Math.PI / 2], [-1, 0, Math.PI / 2], [0, 1, 0], [0, -1, 0]]) {
    kit.box(5.6, 4.4, 0.2, BRONZE, dx * (DIE + 0.08), 6.6, dz * (DIE + 0.08), 0, ry);
    kit.box(6.6, 0.4, 0.3, GRANITE2, dx * (DIE + 0.1), 9.6, dz * (DIE + 0.1), 0, ry);
  }
  // the lions on their plinths, out from the corners of the steps
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2, c = Math.cos(a), s = Math.sin(a);
    kit.box(11.6, 2.4, 3.6, GRANITE2, 13.6 * c, 1.2, 13.6 * s, 0, -a);
    kit.box(11.9, 0.3, 3.9, GRANITE, 13.6 * c, 2.55, 13.6 * s, 0, -a);
    lion(kit, 13.9 * c, 13.9 * s, 2.7, a);
  }
  // the column: its base, the fluted shaft and the bronze capital
  kit.add(new THREE.CylinderGeometry(2.6, 2.8, 1.2, 24), GRANITE2, 0, COLUMN[0] + 0.6, 0);
  kit.add(new THREE.TorusGeometry(2.25, 0.4, 6, 24).rotateX(Math.PI / 2), GRANITE, 0, COLUMN[0] + 1.5, 0);
  kit.add(new THREE.CylinderGeometry(1.65, 2.05, COLUMN[1] - COLUMN[0] - 1.6, 20), GRANITE, 0, (COLUMN[0] + 1.6 + COLUMN[1]) / 2, 0);
  kit.add(new THREE.TorusGeometry(1.7, 0.18, 4, 20).rotateX(Math.PI / 2), GRANITE2, 0, COLUMN[1] - 0.1, 0);
  kit.add(new THREE.CylinderGeometry(2.7, 1.7, 3.6, 16), BRONZE, 0, COLUMN[1] + 1.8, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    kit.add(new THREE.ConeGeometry(0.55, 1.5, 4), BRONZE, 2.3 * Math.cos(a), COLUMN[1] + 3, 2.3 * Math.sin(a), 0.5 * Math.sin(a), 0, -0.5 * Math.cos(a)); // the acanthus leaves curling out
  }
  kit.box(5.2, 0.9, 5.2, BRONZE, 0, COLUMN[1] + 4.05, 0);
  kit.add(new THREE.CylinderGeometry(1.8, 2, 1.4, 16), GRANITE2, 0, COLUMN[1] + 5.2, 0);
  // Nelson, facing down Whitehall towards the Admiralty and the sea (the square's south side, +z)
  const y = COLUMN[1] + 5.9;
  for (const x of [-0.38, 0.38]) kit.add(new THREE.CylinderGeometry(0.33, 0.3, 2.5, 8), SAND, x, y + 1.25, 0.1);
  kit.add(new THREE.CylinderGeometry(0.62, 0.92, 2.3, 10), SAND, 0, y + 2.9, 0); // the coat, its skirts flaring
  kit.add(new THREE.CylinderGeometry(0.72, 0.62, 1.5, 10), SAND, 0, y + 4.6, 0); // the shoulders
  kit.add(new THREE.SphereGeometry(0.44, 10, 8), SAND, 0, y + 5.75, 0.05);
  kit.box(1.45, 0.42, 0.55, SAND, 0, y + 6.25, 0); // the bicorne, worn athwart
  kit.add(new THREE.ConeGeometry(0.3, 0.5, 4), SAND, 0, y + 6.55, 0);
  kit.rod([0.75, y + 5.1, 0.1], [0.95, y + 1, 0.4], 0.17, SAND); // his left arm (facing +z, his left is +x), down to the sword
  kit.rod([1, y + 3.4, 0.4], [0.6, y + 0.1, 0.8], 0.08, SAND, 4); // the sword
  kit.add(new THREE.TorusGeometry(0.5, 0.22, 6, 10).rotateX(Math.PI / 2), SAND, 0.4, y + 0.25, -0.9); // the coil of rope
  return kit.mesh(kitMat(0.85));
}

const AREA = onMap(X, Z, TURN, rect(-21, -21, 21, 21));
// the steps, and each lion's plinth: four corners out along its diagonal
const plinth = a => {
  const c = Math.cos(a), s = Math.sin(a), p = (f, w) => [f * c - w * s, f * s + w * c];
  return onMap(X, Z, TURN, [p(7.6, -1.8), p(19.4, -1.8), p(19.4, 1.8), p(7.6, 1.8)]);
};
export const NELSON = [{
  id: 'nelson', name: "Nelson's Column", x: X, z: Z, turn: TURN, reach: 220, area: [AREA], paths: [AREA],
  foot: [onMap(X, Z, TURN, rect(-STEPS, -STEPS, STEPS, STEPS)), ...[0, 1, 2, 3].map(k => plinth(Math.PI / 4 + (k * Math.PI) / 2))],
  make: nelson,
}];
