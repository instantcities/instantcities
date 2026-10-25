// The Colonna di Marco Aurelio (AD 180-193) in the middle of Piazza Colonna, modelled by hand from
// its measurements and photos, in game metres (the real ones times 1.25): it has no outline on the
// map, so it stands on its own square base, 7 m across, which riders bump into.
//   the pedestal, Fontana's of 1589, with its inscription panels and cornice
//   the column of Carrara marble, a hundred Roman feet, its torus at the foot and its Doric capital,
//     the band of reliefs of the wars on the Danube winding up it twenty-one times
//   the drum on top, and the bronze Saint Paul that Sixtus V put there in 1589
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { shade } from '../core/js/facades.js';

const X = 168, Z = -300; // its middle, from the site's landmark page
const PED = 10.2, SHAFT = [PED + 1.6, PED + 1.6 + 33.5], R = 2.3;
const MARBLE = '#e6dfcf', GREY = '#d6ceba', BRONZE = '#5b4d34';

export function colonna() {
  const kit = new Kit();
  // the pedestal on its steps, its panels and its cornice
  kit.box(8.4, 0.5, 8.4, GREY, 0, 0.25, 0).box(7.4, PED - 1.4, 7.4, MARBLE, 0, 0.5 + (PED - 1.4) / 2, 0);
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    kit.box(dx ? 0.15 : 5.4, 5.6, dz ? 0.15 : 5.4, shade(MARBLE, -0.08), dx * 3.72, 4.6, dz * 3.72);
    for (let line = 0; line < 4; line++) kit.box(dx ? 0.17 : 3.8, 0.28, dz ? 0.17 : 3.8, '#8c8270', dx * 3.73, 6.3 - line * 0.9, dz * 3.73);
  }
  kit.box(8, 0.7, 8, MARBLE, 0, PED - 0.55, 0).box(7, 0.6, 7, GREY, 0, PED + 0.1, 0);
  // the column: its base, the shaft, the relief winding up it, the capital
  kit.add(new THREE.CylinderGeometry(R + 0.55, R + 0.7, 1.2, 24), MARBLE, 0, PED + 1, 0);
  kit.add(new THREE.CylinderGeometry(R * 0.93, R, SHAFT[1] - SHAFT[0], 24), MARBLE, 0, (SHAFT[0] + SHAFT[1]) / 2, 0);
  const turns = 21, h = SHAFT[1] - SHAFT[0] - 0.6;
  const helix = new THREE.Curve();
  helix.getPoint = (t, out = new THREE.Vector3()) => {
    const a = t * turns * 2 * Math.PI, r = R * (1 - 0.07 * t) + 0.02;
    return out.set(r * Math.cos(a), SHAFT[0] + 0.3 + t * h, r * Math.sin(a));
  };
  kit.add(new THREE.TubeGeometry(helix, turns * 24, 0.16, 4, false), GREY);
  kit.add(new THREE.CylinderGeometry(R + 0.35, R * 0.93, 0.8, 24), MARBLE, 0, SHAFT[1] + 0.4, 0);
  kit.box(2 * R + 1.4, 0.8, 2 * R + 1.4, MARBLE, 0, SHAFT[1] + 1.2, 0);
  // the drum and Saint Paul with his sword
  const top = SHAFT[1] + 1.6;
  kit.add(new THREE.CylinderGeometry(1.4, 1.6, 1.6, 16), GREY, 0, top + 0.8, 0);
  kit.add(new THREE.CylinderGeometry(0.55, 0.85, 3.2, 10), BRONZE, 0, top + 3.2, 0);
  kit.add(new THREE.SphereGeometry(0.42, 10, 8), BRONZE, 0, top + 5.2, 0);
  kit.rod([0.6, top + 2.4, 0.2], [0.75, top + 5.6, 0.25], 0.08, BRONZE, 5);
  return kit.mesh(kitMat(0.88));
}

export const COLONNA = [{ id: 'colonna-di-marco-aurelio', name: 'Colonna di Marco Aurelio', x: X, z: Z, turn: 0, size: 8.4, reach: 120, make: colonna }];
