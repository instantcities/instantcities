// The Porcellino (Pietro Tacca, 1633; the one in place a copy of 2008) on the south side of the Loggia
// del Mercato Nuovo, modelled by hand from photos, in game metres (the real ones times 1.25): the
// bronze boar sitting up on his haunches, his snout rubbed to gold for luck, on his bronze base on a
// marble plinth, the little basin in front where the coins go. Riders bump into his plinth.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';

const X = 86.9, Z = 113.6, TURN = -0.069; // in front of the loggia, facing south, away from it (local +z)
const BRONZE = '#4d4a35', GOLD = '#d9b45a', MARBLE = '#e6e0d2', WATER = '#3d5a5a';

export function porcellino() {
  const kit = new Kit();
  // the plinth, the basin in front of it, the bronze base with its plants and creatures
  kit.box(2.4, 1.2, 1.5, MARBLE, 0, 0.6, 0).box(2.6, 0.15, 1.7, MARBLE, 0, 1.25, 0);
  kit.box(2, 0.55, 0.9, MARBLE, 0, 0.28, 1.15).box(1.7, 0.05, 0.6, WATER, 0, 0.56, 1.15);
  kit.box(2, 0.32, 1.3, BRONZE, 0, 1.48, 0);
  for (const [x, z] of [[-0.8, 0.45], [0.75, 0.5], [-0.7, -0.45], [0.8, -0.4]]) kit.add(new THREE.SphereGeometry(0.13, 6, 4), shade(BRONZE, 0.08), x, 1.7, z); // the frogs and snails
  // the boar: his haunches, his body sloping up to the shoulders, his forelegs, his head and snout
  const y = 1.64;
  kit.add(new THREE.SphereGeometry(0.5, 10, 8).scale(1, 0.85, 1.1), BRONZE, 0, y + 0.42, -0.35);
  kit.add(new THREE.SphereGeometry(0.42, 10, 8).scale(1, 1.55, 1), BRONZE, 0, y + 0.85, 0.05, -0.45, 0, 0);
  for (const s of [-1, 1]) {
    kit.rod([s * 0.2, y, 0.42], [s * 0.2, y + 0.75, 0.3], 0.09, BRONZE, 6); // a foreleg
    kit.add(new THREE.SphereGeometry(0.2, 8, 6).scale(1, 0.7, 1.4), BRONZE, s * 0.36, y + 0.12, -0.1); // a hind leg folded under him
  }
  kit.add(new THREE.SphereGeometry(0.3, 10, 8).scale(0.95, 1, 1.35), BRONZE, 0, y + 1.18, 0.36);
  kit.box(0.08, 0.16, 0.9, shade(BRONZE, -0.05), 0, y + 1.32, -0.02, -0.75, 0, 0); // the bristles along his back
  const snout = new THREE.CylinderGeometry(0.11, 0.25, 0.78, 10).rotateX(Math.PI / 2 - 0.22);
  kit.add(snout, BRONZE, 0, y + 1.2, 0.84);
  kit.add(new THREE.CylinderGeometry(0.115, 0.115, 0.07, 10).rotateX(Math.PI / 2 - 0.22), GOLD, 0, y + 1.29, 1.23); // the shining snout
  for (const s of [-1, 1]) {
    kit.add(new THREE.ConeGeometry(0.09, 0.26, 5), BRONZE, s * 0.18, y + 1.44, 0.2, -0.7, 0, s * 0.45); // an ear
    kit.add(new THREE.ConeGeometry(0.025, 0.14, 4), '#e8e2cc', s * 0.13, y + 1.1, 1.0); // a tusk
  }
  return kit.mesh(kitMat(0.45, 0.35));
}

const shade = (hex, d) => '#' + new THREE.Color(hex).offsetHSL(0, 0, d).getHexString();

export const PORCELLINO = [{ id: 'il-porcellino', name: 'Il Porcellino', x: X, z: Z, turn: TURN, size: 2.6, reach: 40, make: porcellino }];
