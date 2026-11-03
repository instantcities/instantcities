// The towers of the Conciergerie along the Quai de l'Horloge, the river front of the old royal
// palace on the Île de la Cité, modelled by hand in place of the map's building parts of them, from
// their measurements, in game metres (the real ones times 1.25), on the map's outlines:
//   the Tour César and the Tour d'Argent, the twin round towers, their machicolations and their
//     tall pointed slate roofs
//   the Tour de l'Horloge on the corner of the Boulevard du Palais, square under its hipped roof
//     with its corner turret, and on its face the oldest public clock in Paris, blue with gold
//     fleurs-de-lis, between its two figures under a little roof
// The palace's long fronts between the towers stay the map's.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = -52, Z = 46; // between the towers; the model's metres are the map's, from here
const ROUND = [[-75.8, 34.5], [-90.6, 26.8]], R = 5.6; // the Tour César and the Tour d'Argent
const CLOCK = [-15.8, 65.5], TURN = -0.435, HL = 5.5, HW = 3.4; // the Tour de l'Horloge: middle, turn, half its sides
const STONE = '#d9cfb9', STONE2 = '#c5baa2', SLATE = '#4d555d', DARK = '#3a3836', GOLD = '#d1ad4d', BLUE = '#2a4a8a';

export function conciergerie() {
  const kit = new Kit();
  for (const [x, z] of ROUND.map(([x, z]) => [x - X, z - Z])) {
    kit.add(new THREE.CylinderGeometry(R, R + 0.3, 26, 20), STONE, x, 13, z);
    kit.add(new THREE.CylinderGeometry(R + 0.7, R + 0.3, 2, 20), STONE2, x, 27, z);
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      kit.box(0.5, 1.6, 0.6, STONE2, x + (R + 0.2) * Math.cos(a), 25.4, z + (R + 0.2) * Math.sin(a), 0, -a);
    }
    kit.add(new THREE.ConeGeometry(R + 0.9, 14, 20), SLATE, x, 28 + 7, z);
    kit.rod([x, 41.5, z], [x, 43.5, z], 0.12, '#888', 4);
    // its narrow windows up the side towards the river
    for (const y of [8, 14, 20]) {
      const a = -Math.PI / 2 - 0.25;
      kit.box(0.3, 3, 1.3, DARK, x + R * Math.cos(a), y, z + R * Math.sin(a), 0, -a);
    }
  }

  // the Tour de l'Horloge, built in its own turned metres
  const c = Math.cos(TURN), s = Math.sin(TURN), cx = CLOCK[0] - X, cz = CLOCK[1] - Z;
  const put = (geo, hex, u, y, v, ry = 0) => kit.add(geo, hex, cx + u * c + v * s, y, cz - u * s + v * c, 0, TURN + ry);
  const box = (w, h, d, hex, u, y, v) => put(new THREE.BoxGeometry(w, h, d), hex, u, y, v);
  box(2 * HL, 34, 2 * HW, STONE, 0, 17, 0);
  box(2 * HL + 0.8, 1.4, 2 * HW + 0.8, STONE2, 0, 34, 0);
  // the hipped roof
  const roof = new THREE.ConeGeometry(1, 1, 4).rotateY(Math.PI / 4);
  roof.scale(HL * 1.42 + 0.6, 13, HW * 1.42 + 0.6);
  put(roof, SLATE, 0, 34.7 + 6.5, 0);
  // the turret on its corner, and its spirelet
  put(new THREE.CylinderGeometry(1.6, 1.6, 12, 10), STONE, -HL + 1, 40, -HW + 1);
  put(new THREE.ConeGeometry(1.9, 8, 10), SLATE, -HL + 1, 50, -HW + 1);
  // windows up the tower
  for (const y of [14, 22, 29]) for (const v of [-1.6, 1.6]) box(0.3, 3, 1.1, DARK, HL + 0.05, y, v);
  // the clock on the face towards the boulevard: its blue face with gold lilies and the gold dial,
  // the two figures either side, the little roof over it all
  box(0.5, 8.6, 6.4, STONE2, HL + 0.25, 11, 0);
    box(0.3, 4.6, 4.6, BLUE, HL + 0.55, 10.5, 0);
  put(new THREE.TorusGeometry(1.9, 0.15, 4, 24).rotateY(Math.PI / 2), GOLD, HL + 0.75, 10.5, 0);
  box(0.2, 1.7, 0.18, GOLD, HL + 0.8, 11.1, 0);
  for (const v of [-2.9, 2.9]) {
    box(0.6, 3.6, 0.8, '#e5ddc9', HL + 0.7, 9.6, v);
    put(new THREE.SphereGeometry(0.4, 6, 4), '#e5ddc9', HL + 0.7, 11.8, v);
  }
  box(1.8, 0.35, 7.4, SLATE, HL + 0.9, 15.6, 0);
  return kit.mesh(kitMat(0.85));
}

const ring = ([x, z], r) => Array.from({ length: 12 }, (_, k) => [x + r * Math.cos((k / 12) * Math.PI * 2), z + r * Math.sin((k / 12) * Math.PI * 2)]).flat();
const clockAt = (r) => onMap(CLOCK[0], CLOCK[1], TURN, rect(-HL - r, -HW - r, HL + r, HW + r));

export const CONCIERGERIE = [{
  id: 'conciergerie', name: 'Conciergerie', x: X, z: Z, reach: 70,
  area: [...ROUND.map(p => ring(p, R + 2)), clockAt(2.5)],
  foot: [...ROUND.map(p => ring(p, R + 0.3)), clockAt(0.4)],
  make: conciergerie,
}];
