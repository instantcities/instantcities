// The Palais des Papes, the popes' palace of 1335-64 over the Place du Palais, modelled by hand in
// place of the map's block of it, on the map's outline of it (175 by 111 m, 219 by 139 here), in
// game metres (the real ones times 1.25). The largest Gothic palace there is, a fortress more than a
// house: Benedict XII's Palais Vieux round its cloister in the north and Clement VI's Palais Neuf
// round the Cour d'Honneur in the south, built as one block of pale limestone:
//   the sheer walls, about 30 m high, cut into tall pointed blind arches between their buttresses,
//     with the machicolations along the top, under the parapet and its merlons
//   the square towers that rise over them: the Tour de Trouillas in the north, the tallest at 52 m,
//     the Tour des Anges (the pope's own tower) and the Tour de la Garde-Robe on the east side, and
//     lower ones at the corners
//   the front on the square: the Porte des Champeaux, the gate in the middle of it, under the arms
//     of Clement VI, and the two slender turrets with their stone spires that stand out over it on
//     their corbels
//   the Cour d'Honneur and the cloister, open to the sky in the middle of the block, and the long
//     roof of the Grande Chapelle over the south wing
// The model's own metres: u across the front, east into the palace, v along it to the south, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, sweep, gable, pointedRing } from '../core/js/arcade.js';
import { toLocal, sides, block, flat, box4 } from './outline.js';

const X = 302, Z = -516, TURN = -0.279;
// the map's outline of the palace (the city's metres)
const RING = [354.9,-460.7,380.2,-526.5,387.3,-546,389.7,-545.3,390.2,-546.4,390.7,-547.6,387.2,-550,382,-553.6,375.6,-557.9,390.5,-598.6,373.7,-602.1,367.9,-603.4,363.3,-589.4,348.7,-590.3,348.5,-588.3,298.1,-588.6,277.2,-591,270.1,-529.3,263.1,-530.8,262.8,-529.9,261.1,-530.3,235.5,-536.4,232.6,-524.3,233,-521.2,238.1,-519.8,233.6,-501.4,227.2,-475.4,225.9,-475.7,223.3,-465.6,222.6,-463.1,221,-463.3,214.9,-438.9,218,-438.1,223.6,-436.7,249.7,-430.4,252.1,-429.7,254.3,-428.6,256,-427.3,257,-426.7,258,-425.9,258.8,-424.9,259.4,-423.8,259.7,-423.1,259.9,-422.8,260.1,-421.6,260.2,-420.3,260.2,-420.1,260.3,-418.7,260.5,-417.6,261.1,-416.4,261.8,-415.4,262.8,-414.6,263.8,-413.8,265.1,-413.4,268.2,-412.5,285.2,-408.9,288.4,-411,289.1,-414.2,286.9,-414.4,288,-419,290.3,-418.7,291.4,-422.8,289,-423.3,289.6,-426.2,293.8,-447,298.7,-448.8,318.4,-449.3,323.4,-449.5,352.3,-454.4,353.9,-458.3];
const H = 36; // the walls' top, the merlons over it
const COUR = box4(-48, 20, -4, 80), CLOITRE = box4(6, -62, 40, -24); // the Cour d'Honneur and the cloister
// the towers: their rings and heights
const TOWERS = [
  [box4(40, -103, 61, -86), 64], // Trouillas
  [box4(54, -54, 75, -32), 57], // the Tour des Anges
  [box4(58, -31, 72, -14), 48], // the Garde-Robe
  [box4(48, 30, 64, 46), 46],
  [box4(-43, -66, -28, -51), 48],
  [box4(-4, 92, 13, 108), 46],
  [box4(-63, 84, -48, 98), 44],
];
const GATE = 46; // the gate's v on the front
const STONE = '#dccaa3', SHADE = '#c4b08a', LEDGE = '#e4d5b2', ROOF = '#b77a5b', DARK = '#2e2925', GOLD = '#c9a64a';

// A wall's skin of tall blind arches along each side, `proud` out from the block, its piers about
// `bay` apart, the arches' points `drop` under its top; then the machicolations' ledge on its
// corbels, and the merlons.
function skin(kit, paths, top, { proud = 1, bay = 8.5, drop = 6 } = {}) {
  for (const p of paths) {
    const L = p.length, n = Math.max(1, Math.round(L / bay)), b = L / n;
    const holes = L > 5 ? Array.from({ length: n }, (_, k) => pointedRing((k + 0.5) * b, b - 2.4, 0, top - drop, 1, 6)) : [];
    wall(kit, p, [[0, 0], [L, 0], [L, top], [0, top]], { holes, o0: 0, o1: proud, hex: STONE });
    sweep(kit, p, 0, L, [[proud, top - 3.2], [proud + 0.9, top - 3.2], [proud + 0.9, top - 1.9], [proud, top - 1.9]], LEDGE, { step: L });
    for (let s = 0.6; s < L - 0.3; s += 1.4) {
      const q = p.at(s);
      kit.box(0.5, 0.9, 0.9, LEDGE, q.x + (proud + 0.45) * q.tz, top - 3.65, q.z - (proud + 0.45) * q.tx, 0, Math.atan2(-q.tz, q.tx));
    }
    for (let s = 1; s < L - 0.6; s += 2.6) {
      const q = p.at(s);
      kit.box(1.3, 1.7, 0.8, STONE, q.x + (proud - 0.4) * q.tz, top + 0.85, q.z - (proud - 0.4) * q.tx, 0, Math.atan2(-q.tz, q.tx));
    }
  }
}

export function palais() {
  const kit = new Kit(), ring = toLocal(RING, X, Z, TURN);
  block(kit, ring, 0, H - 2, SHADE, [COUR, CLOITRE]);
  flat(kit, ring, H - 2, ROOF, [COUR, CLOITRE]);
  skin(kit, sides(ring, { min: 2 }), H);
  // the roof of the Grande Chapelle over the south wing, the one long ridge over the parapets
  gable(kit, -60, -6, 9, H - 2, H + 5, ROOF, { z: 90 });
  // the courtyards' walls: plainer, with rows of narrow pointed windows
  for (const c of [COUR, CLOITRE]) for (const p of sides(c, { hole: true })) {
    const L = p.length, n = Math.round(L / 6), holes = [];
    for (let k = 0; k < n; k++) for (const [y0, y1] of [[6, 11], [16, 22], [26, 30]]) holes.push(pointedRing((k + 0.5) * (L / n), 1.6, y0, y1, 1, 4));
    wall(kit, p, [[0, 0], [L, 0], [L, H], [0, H]], { o0: 0, o1: 0.3, hex: STONE });
    for (const h of holes) wall(kit, p, h, { o0: 0.3, o1: 0.35, hex: DARK });
  }
  // the towers
  for (const [r, h] of TOWERS) {
    block(kit, r, 0, h - 2, SHADE);
    flat(kit, r, h - 2, LEDGE);
    skin(kit, sides(r), h, { proud: 1.6, bay: 7, drop: 8 });
    // a few windows high up on each side
    for (const p of sides(r)) for (const y of [h - 14, h - 22]) wall(kit, p, pointedRing(p.length / 2, 1.4, y, y + 3.6, 1, 4), { o0: 1.6, o1: 1.66, hex: DARK });
  }

  // the front's gate under the arms of Clement VI, and its two turrets on their corbels
  const front = sides(ring, { min: 20 }).find(p => { const q = p.at(p.length / 2); return q.z > 20 && q.z < 70 && q.x < -55; });
  const mid = front.at(front.length / 2), sg = front.length / 2 + (GATE - mid.z) / mid.tz; // the gate's s along it
  wall(kit, front, pointedRing(sg, 4.6, 0, 8.5, 1, 6), { o0: 1, o1: 1.05, hex: DARK });
  wall(kit, front, [[sg - 1.4, 10], [sg + 1.4, 10], [sg + 1.4, 13], [sg - 1.4, 13]], { o0: 1, o1: 1.3, hex: LEDGE });
  wall(kit, front, [[sg - 0.6, 10.6], [sg + 0.6, 10.6], [sg + 0.6, 12.4], [sg - 0.6, 12.4]], { o0: 1.3, o1: 1.36, hex: GOLD });
  for (const ds of [-6.5, 6.5]) {
    const q = front.at(sg + ds), o = 3.2, x = q.x + o * q.tz, z = q.z - o * q.tx;
    kit.add(new THREE.ConeGeometry(2.3, 5, 8).rotateX(Math.PI), STONE, x, 15.5, z);
    kit.add(new THREE.CylinderGeometry(2.2, 2.2, H - 14, 8), STONE, x, 18 + (H - 18) / 2 + 2, z);
    for (const y of [24, 31]) kit.box(0.6, 2.6, 0.6, DARK, x + 2.15 * q.tz, y, z - 2.15 * q.tx, 0, Math.atan2(-q.tz, q.tx));
    kit.add(new THREE.CylinderGeometry(2.6, 2.4, 1.2, 8), LEDGE, x, H + 2.6, z);
    kit.add(new THREE.ConeGeometry(2.3, 10, 8), STONE, x, H + 3.2 + 5, z);
    kit.add(new THREE.SphereGeometry(0.35, 6, 4), STONE, x, H + 13.4, z);
  }
  return kit.mesh(kitMat(0.92));
}

export const PALAIS = [{ id: 'palais-des-papes', name: 'Palais des Papes', x: X, z: Z, turn: TURN, reach: 140, area: [RING], foot: [RING], make: palais }];
