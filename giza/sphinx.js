// The Great Sphinx (about 2500 BC), carved out of the bedrock of the plateau, and the temple in front
// of it, modelled by hand in real metres (scaled to game metres, 1.25, at the end), the Sphinx lying
// with its head to the east (+x), 73 m long and 20 m high: a lion's body, the haunches and the tail
// curled along its flank, the front paws stretched out 15 m, the neck, and the head in the royal
// headcloth (the nemes) with the face worn flat where the nose was. The temple in front is a low
// block of limestone with two rows of rectangular pillars. Riders bump into the body and the temple.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';
import { S, game } from './frame.js';

const ROCK = '#c4aa78', ROCK2 = '#b99f6e', PALE = '#d2bb8a', DARK = '#8a7450';

// an ellipsoid of half-axes (a, b, c) at (x, y, z)
const ball = (kit, a, b, c, hex, x, y, z, ry = 0) => kit.add(new THREE.SphereGeometry(1, 14, 10).scale(a, b, c), hex, x, y, z, 0, ry, 0);

export function sphinx() {
  const kit = new Kit(), r = rng(9);
  // the pit it lies in: a hollow of bedrock round it, its floor 6 m below the plateau; the plateau's rim as low walls
  kit.box(112, 2.4, 4, ROCK2, -2, 1.2, -29);
  kit.box(112, 2.4, 4, ROCK2, -2, 1.2, 29);
  kit.box(4, 2.4, 58, ROCK2, -58, 1.2, 0);
  kit.box(110, 0.3, 56, '#cdb88a', -2, 0.15, 0);
  // the body: from the haunches (x = -32) to the chest (x = 8), 12 m wide, rising to 10 m
  ball(kit, 22, 8, 7.5, ROCK, -14, 6.5, 0);
  ball(kit, 14, 7, 7, shade(ROCK, 0.03), -26, 6, 0); // the haunches
  ball(kit, 10, 6, 6.5, ROCK, 3, 7.5, 0); // the chest
  kit.box(34, 4, 12, ROCK2, -10, 2, 0); // the rock under it
  // the tail along the right flank
  ball(kit, 12, 1.1, 1.1, ROCK2, -30, 3.2, 7.2);
  // the front paws, side by side, 15 m long, 3 m wide, and the neck rising out of the chest
  for (const side of [-1, 1]) {
    ball(kit, 9, 2.2, 1.8, shade(ROCK, 0.04), 15, 2.6, side * 4.6);
    ball(kit, 2.2, 2.6, 2.2, ROCK, 22.5, 2.6, side * 4.6); // the paw's end
    ball(kit, 5, 4, 2.6, ROCK2, 7, 5, side * 4.8); // the foreleg
  }
  ball(kit, 5, 9, 5, shade(ROCK, 0.02), 9, 14, 0); // the neck
  // the head: the nemes (a wide box of headcloth with its two lappets), the face, the worn nose
  kit.box(9.5, 10, 11, PALE, 12, 22, 0); // the headcloth over the head
  kit.box(7, 4, 16, PALE, 9, 15.5, 0); // the lappets either side of the neck
  kit.box(3, 9, 5.6, shade(ROCK, 0.06), 17.2, 21, 0); // the face
  kit.box(1.5, 1.8, 1.4, DARK, 18.4, 20.5, 0); // the nose is gone: a hole
  kit.box(1.3, 0.6, 1.1, DARK, 18, 22.6, 1.6); // the eyes
  kit.box(1.3, 0.6, 1.1, DARK, 18, 22.6, -1.6);
  kit.box(1.2, 0.5, 3.2, DARK, 18.2, 18.6, 0); // the mouth
  kit.box(6, 1.4, 12.6, DARK, 10, 27.2, 0); // the top of the headcloth
  // the temple in front, east of the paws: a platform with two rows of pillars
  const tx = 40;
  kit.box(40, 1.2, 26, PALE, tx, 0.6, 0);
  for (const row of [-6, 6]) for (let k = 0; k < 6; k++) kit.box(1.8, 6, 1.8, ROCK, tx - 14 + k * 5.4, 4.2, row);
  for (const row of [-6, 6]) kit.box(32, 1.2, 2.4, shade(PALE, -0.05), tx, 7.8, row);
  const m = kit.mesh(kitMat(0.94));
  m.scale.setScalar(S);
  void r;
  return m;
}

const [X, Z] = game(29.97530, 31.13760);
// It stands in for the map's pieces of the Sphinx and its temple (area); riders bump into the body
// and the temple's platform (foot).
export const SPHINX = [{
  id: 'sphinx', name: 'The Sphinx', x: X, z: Z, turn: 0, reach: 900,
  area: [onMap(X, Z, 0, rect(-80 * S, -34 * S, 66 * S, 34 * S))],
  foot: [onMap(X, Z, 0, rect(-34 * S, -7.5 * S, 12 * S, 7.5 * S)), onMap(X, Z, 0, rect(20 * S, -13 * S, 60 * S, 13 * S))],
  make: sphinx,
}];
