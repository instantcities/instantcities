// Bernini's Fontana dei Quattro Fiumi (1651) in the middle of Piazza Navona, modelled by hand from
// its measurements and photos, in game metres (the real ones times 1.25). It has no outline on the
// map: it stands in its oval basin, which riders bump into.
//   the basin, its rim of travertine and its water
//   the hollow rock in the middle, open through its grotto, with the four river gods on it, the
//     Nile with his head veiled, the Ganges with his oar, the Danube and the Río de la Plata, and the
//     palm, the lion and the horse coming out of the rock
//   the Egyptian obelisk on the rock, and the dove of the Pamphilj with its olive branch on top
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { rng, shade } from '../core/js/facades.js';

const X = -549, Z = -26, TURN = 0; // the middle of the piazza, its long axis along local z
const TRAV = '#ddd4c0', ROCK = '#cbc1aa', MARBLE = '#ece7dc', GRANITE = '#b8aa98', WATER = '#93c8d2', BRONZE = '#5b4e38';

function god(kit, x, y, z, turn) {
  kit.box(1.4, 1.1, 2.6, MARBLE, x, y + 0.55, z, 0, turn).box(1.1, 1.6, 1, MARBLE, x + 0.5 * Math.sin(turn), y + 1.6, z + 0.5 * Math.cos(turn), 0, turn);
  kit.add(new THREE.SphereGeometry(0.4, 8, 6), MARBLE, x + 0.5 * Math.sin(turn), y + 2.7, z + 0.5 * Math.cos(turn));
  kit.rod([x, y + 2, z], [x + 1.6 * Math.cos(turn), y + 2.9, z - 1.6 * Math.sin(turn)], 0.17, MARBLE, 5); // an arm out
}

export function navona() {
  const kit = new Kit(), r = rng(1651);
  // the oval basin
  const oval = (rx, rz, h, y, hex) => kit.add(new THREE.CylinderGeometry(1, 1, h, 40).scale(rx, 1, rz), hex, 0, y, 0);
  oval(10.4, 13.2, 1, 0.5, TRAV);
  oval(9.8, 12.6, 0.1, 1, WATER);
  // the rock, open through the middle, and the creatures coming out of it
  for (let k = 0; k < 60; k++) {
    const a = r() * Math.PI * 2, t = r(), d = 2.4 + r() * 2.6 * (1 - t);
    if (Math.abs(Math.cos(a)) > 0.9 && t < 0.5) continue; // the grotto through it
    kit.add(new THREE.DodecahedronGeometry(0.8 + r() * 1.2, 0), shade(ROCK, (r() - 0.5) * 0.12), d * Math.cos(a), 0.9 + t * 6.4, d * Math.sin(a) * 1.1, r(), r(), r());
  }
  kit.box(4.4, 1.2, 4.4, ROCK, 0, 7.6, 0);
  god(kit, 3.4, 4.2, 2.8, 0.7);
  god(kit, -3.4, 4.2, 2.8, -0.7);
  god(kit, 3.4, 4.2, -2.8, 2.4);
  god(kit, -3.4, 4.2, -2.8, -2.4);
  kit.add(new THREE.CylinderGeometry(0.2, 0.3, 5, 6), '#8a7a52', -2.6, 6.4, 0.6, 0.25, 0, 0.3); // the palm
  for (let k = 0; k < 6; k++) kit.box(0.2, 0.15, 2.2, '#6f7a4a', -3.3, 8.8, 1, 0.3, (k / 6) * Math.PI * 2, 0.5);
  kit.box(2.2, 1.1, 1, MARBLE, 2.8, 2.3, -0.2).box(0.9, 1, 0.9, MARBLE, 3.9, 2.8, -0.2); // the lion
  kit.box(2.4, 1.2, 1, MARBLE, -2.8, 2.3, -1, 0, 0.2, 0.4).box(0.8, 1.3, 0.7, MARBLE, -4, 3.3, -1.2, 0, 0, 0.6); // the horse
  // the obelisk, its pedestal, the dove
  kit.box(2.6, 1.6, 2.6, GRANITE, 0, 9, 0);
  const ob = new THREE.CylinderGeometry(0.75, 1.15, 20.6, 4).rotateY(Math.PI / 4);
  kit.add(ob, GRANITE, 0, 9.8 + 10.3, 0);
  kit.add(new THREE.ConeGeometry(0.8, 1.6, 4).rotateY(Math.PI / 4), GRANITE, 0, 31.2, 0);
  kit.box(0.5, 0.4, 1, BRONZE, 0, 32.3, 0).box(1.4, 0.1, 0.4, BRONZE, 0, 32.4, 0);
  return kit.mesh(kitMat(0.8, 0.05));
}

export const NAVONA = [{ id: 'fontana-dei-quattro-fiumi', name: 'Fontana dei Quattro Fiumi', x: X, z: Z, turn: TURN, size: [20.8, 26.4], reach: 120, make: navona }];
