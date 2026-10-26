// The Torre di Pisa, the Duomo's bell tower (begun 1173, its belfry finished 1372), modelled by hand
// in place of the map's hundreds of pieces of it (OpenStreetMap draws every column), from its
// measurements and photos, in game metres (the real ones times 1.25): a round shaft 15.5 m across,
// 56.7 m high to the top of the belfry, leaning 4° to the south since it began to sink into the soft
// ground while it was being built. White marble from San Giuliano, with thin grey bands:
//   the ground storey, fifteen tall blind arches on half-columns round a solid wall, the door
//   six storeys of open galleries, thirty arches each on slender columns, round the inner shaft,
//     each on a projecting floor that is the walkway's
//   the belfry, narrower, with its twelve arched openings and the seven bells inside, under the
//     flat roof and its railing
// It stands on its own on the lawn of the Piazza dei Miracoli, so riders bump into its foot; the top
// leans out some 5 m over the grass to the south.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { ellipsePath, arcade, sweep, column, onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { ngon } from '../florence/marble.js';

const X = -179.1, Z = -607.7, TURN = 0; // the middle of its foot; it leans towards +z (south)
const LEAN = 0.0693; // 3.97°
const R = 9.7, CORE = 7.6; // the outer face of the arcades, the inner shaft's
const GROUND = 14.3, STOREY = 7.5, LOGGIAS = 6; // the ground storey's top, each gallery's height
const BELFRY = GROUND + LOGGIAS * STOREY, BR = 6.3, TOP = 70.8; // the belfry's floor, its radius, its top
const MARBLE = '#e9e1cd', GREY = '#a7a297', DARK = '#4a4640', BRONZE = '#6e5a35';
const STONE = shade(MARBLE, -0.07);

// a cornice round the path at y, standing `out` metres proud
const cornice = (kit, path, y, out, h = 0.6, hex = STONE) =>
  sweep(kit, path, 0, path.length, [[-0.6, y - h], [out * 0.6, y - h], [out, y - h * 0.3], [out, y], [-0.6, y]], hex, { step: 1 });

export function torre() {
  const kit = new Kit();
  const outer = ellipsePath(R, R);
  // the plinth, reaching a little under the ground, as its north side lifts with the lean
  kit.add(new THREE.CylinderGeometry(R + 0.6, R + 0.8, 2.4, 40), STONE, 0, -1.1, 0);
  // the ground storey: the solid wall with its grey bands, the blind arcade in front of it
  kit.add(new THREE.CylinderGeometry(R - 0.5, R - 0.5, GROUND, 40), MARBLE, 0, GROUND / 2, 0);
  for (let y = 1.4; y < GROUND - 3; y += 1.5) kit.add(new THREE.CylinderGeometry(R - 0.45, R - 0.45, 0.22, 40), GREY, 0, y, 0);
  arcade(kit, outer, {
    bays: 15, start: 0, depth: 0.5, r: 0.42, hex: () => MARBLE,
    storeys: [{ h: GROUND - 0.8, arch: 0.72, crown: GROUND - 2.2, sill: 0.1 }],
  });
  for (let k = 0; k < 15; k++) column(kit, outer, ((k - 0.5) * outer.length) / 15, 0.1, 0.1, GROUND - 2.2 - (0.72 * outer.length) / 30, 0.42, MARBLE, 'corinthian');
  // the door to the stairs, facing the Duomo (south of west)
  kit.box(0.6, 5.4, 2.6, DARK, -R + 0.45, 2.7, 1.5);
  cornice(kit, outer, GROUND, 0.9, 0.8);
  // the six galleries: the inner shaft, the floor of each walkway, its arcade on thirty columns
  kit.add(new THREE.CylinderGeometry(CORE, CORE, BELFRY - GROUND, 36), shade(MARBLE, -0.03), 0, (GROUND + BELFRY) / 2, 0);
  const bay = outer.length / 30;
  for (let k = 0; k < LOGGIAS; k++) {
    const y0 = GROUND + k * STOREY;
    // the dark doorways from the walkway into the shaft, one in every other bay
    for (let i = 0; i < 30; i += 3) {
      const t = ((i + 0.25) / 30) * 2 * Math.PI;
      kit.box(0.2, 2.6, 1.1, DARK, (CORE + 0.05) * Math.cos(t), y0 + 1.6, (CORE + 0.05) * Math.sin(t), 0, -t);
    }
    arcade(kit, outer, {
      bays: 30, start: bay / 2, depth: 0.45, hex: () => MARBLE,
      storeys: [{ h: STOREY, arch: 0.8, crown: STOREY - 1.1, sill: 0.3 }],
    });
    const spring = y0 + STOREY - 1.1 - (0.8 * bay) / 2;
    for (let i = 0; i < 30; i++) column(kit, outer, i * bay, -0.2, y0 + 0.3, spring, 0.2, MARBLE, 'corinthian');
    cornice(kit, outer, y0 + 0.3, 0.5, 0.5);
    cornice(kit, outer, y0 + STOREY, 0.75, 0.7);
    // the walkway's floor between the arcade and the shaft
    kit.add(new THREE.CylinderGeometry(R - 0.3, R - 0.3, 0.3, 36), STONE, 0, y0 + 0.15, 0);
  }
  // the belfry: its floor's parapet, its wall with twelve arches, the bells, the roof's railing
  const bell = ellipsePath(BR, BR);
  kit.add(new THREE.CylinderGeometry(R - 0.2, R - 0.2, 0.4, 36), STONE, 0, BELFRY + 0.2, 0);
  for (let k = 0; k < 48; k++) {
    const t = (k / 48) * 2 * Math.PI;
    kit.box(0.2, 1.1, 0.2, DARK, (R - 0.5) * Math.cos(t), BELFRY + 0.9, (R - 0.5) * Math.sin(t));
  }
  arcade(kit, bell, {
    bays: 12, start: 0, depth: 0.9, hex: () => MARBLE,
    storeys: [{ h: TOP - BELFRY - 2.4, arch: 0.62, crown: TOP - BELFRY - 3.6, sill: 0.4 }],
  });
  for (let i = 0; i < 12; i++) column(kit, bell, ((i + 0.5) * bell.length) / 12, 0.05, BELFRY + 0.4, TOP - 5.8, 0.28, MARBLE, 'corinthian');
  for (const [a, r, y] of [[0.3, 1.1, 3.6], [1.2, 0.9, 3.4], [2.1, 1.3, 3.8], [3.2, 0.8, 3.2], [4.1, 1, 3.6], [5.2, 0.9, 3.4]]) {
    kit.add(new THREE.CylinderGeometry(r * 0.55, r, r * 1.5, 10), BRONZE, 3.6 * Math.cos(a), BELFRY + y, 3.6 * Math.sin(a));
  }
  kit.add(new THREE.CylinderGeometry(1.4 * 0.55, 1.4, 2.1, 10), BRONZE, 0, BELFRY + 4.2, 0); // l'Assunta, the biggest
  kit.add(new THREE.CylinderGeometry(BR - 0.6, BR - 0.6, 0.6, 30), STONE, 0, TOP - 2.7, 0); // the bells' ceiling
  cornice(kit, bell, TOP - 1.8, 0.7, 0.8);
  kit.add(new THREE.CylinderGeometry(BR + 0.2, BR + 0.2, 1.8, 30), MARBLE, 0, TOP - 0.9, 0);
  kit.add(new THREE.CylinderGeometry(BR - 0.6, BR - 0.6, 0.3, 30), GREY, 0, TOP + 0.15, 0);
  for (let k = 0; k < 32; k++) {
    const t = (k / 32) * 2 * Math.PI;
    kit.box(0.12, 1.1, 0.12, DARK, (BR - 0.1) * Math.cos(t), TOP + 0.55, (BR - 0.1) * Math.sin(t));
  }
  // the whole tower leaning south about its foot
  const geo = kit.geometry().rotateX(LEAN);
  const m = new THREE.Mesh(geo, kitMat(0.85));
  m.castShadow = m.receiveShadow = true;
  return m;
}

// it stands in for the map's pieces of the tower (area: all its columns), and riders bump into its
// round foot
const FOOT = onMap(X, Z, TURN, ngon(R + 0.8, 16));
export const TORRE = [{
  id: 'torre', name: 'Torre di Pisa', x: X, z: Z, turn: TURN, reach: 150, area: [onMap(X, Z, TURN, ngon(R + 3.5, 16))], foot: [FOOT],
  make: torre,
}];
