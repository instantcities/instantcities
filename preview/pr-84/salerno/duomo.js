// The Duomo of Salerno, the Cattedrale di San Matteo (1080-85, built by Robert Guiscard over the
// apostle Matthew's tomb), modelled by hand in place of the map's block of it, on the map's outline of
// it, in game metres (the real ones times 1.25):
//   the atrium before it, the quadriportico: a courtyard ringed by porticoes of round arches on
//     columns taken from Paestum, the arches in pale and dark stone, under a storey of paired windows,
//     with the old granite basin in the middle; riders ride in through the Porta dei Leoni in the
//     middle of its west side, between the two lions, and round the courtyard
//   the bell tower on the atrium's south-east corner, 56 m of the middle of the 12th century: three
//     square storeys narrowing as they rise, with their paired windows, and on top the round belfry
//     ringed by interlaced arches of yellow tufa and dark lava, under its little dome
//   the church: its nave under a long tiled roof rising over the aisles, the transept across the
//     east end, and the three apses
// The town climbs the hill behind it, but the game's ground is flat, so it stands at street level and
// without the flight of steps up to the gate. The model's own metres: u along the nave to the east, v
// across it to the south, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, sweep, column, gable, archRing, onMap } from '../core/js/arcade.js';
import { toLocal, sides, block, box4 } from './outline.js';

const X = 95, Z = -305, TURN = -0.243;
// the map's outline of the cathedral and its atrium (the city's metres)
const RING = [30,-348.5,28.7,-343.2,26.5,-332.9,25.7,-328.9,25,-325.7,20.9,-304.8,20.7,-293.4,50,-285.9,49.6,-284,58.4,-282.2,60.3,-291.2,60.7,-292.9,62.6,-292.6,64.5,-292.2,63.7,-286.5,119.1,-270.7,133.9,-266.5,150.7,-261.9,152.3,-263.1,154.9,-264.9,156.9,-266.7,158.4,-269.5,159.8,-272.1,160.3,-274.8,159.2,-277.8,161.5,-278.5,164.4,-279.6,167,-281.8,168.9,-284.4,170.2,-287.4,170.9,-290.9,170.6,-294.3,169.1,-296.9,166.4,-299.8,168.1,-301.5,169.7,-303.9,170.1,-306.6,169.5,-308.9,168.5,-310.7,166.4,-312.5,145.9,-320.3,137.2,-323.1,138.1,-325.6,133.6,-326.8,90.1,-338.6,80.2,-341.3,78.8,-337,64.7,-340.4];
// the atrium (its outside, and the courtyard in it), the gate's v, the church's west front's u
const ATRIUM = [[-73.6, -26.6], [-27, -27.2], [-27, 29.6], [-69.3, 29.4]], COURT = box4(-63, -18, -36, 20), GATE = 1, CHURCH = -27;
const TOWER = { u: -34.5, v: 25.5 };
const NAVE = { u0: -25, u1: 50, v: -1.5, hw: 10, eaves: 24, ridge: 30 }, TRANSEPT = { u0: 50, u1: 66, hw: 28, eaves: 24, ridge: 29 };
const WHITE = '#e9e2d2', TUFA = '#d6b77a', LAVA = '#4a4642', STUCCO = '#dccfb6', STONE = '#bfae90', ROOF = '#a8603f', DARK = '#2c2826';

export function duomo() {
  const kit = new Kit();
  // the atrium: the porticoes' floor and their back walls (the outside), the upper storey over them
  const court = sides(COURT, { hole: true });
  block(kit, ATRIUM, 7.6, 8.4, WHITE, [COURT]);
  block(kit, ATRIUM, 8.4, 13.4, WHITE, [COURT]);
  block(kit, ATRIUM, 13.4, 14, ROOF, [COURT]);
  for (const p of sides(ATRIUM)) {
    const L = p.length, mid = p.at(L / 2), west = mid.x < -65;
    const holes = west ? [archRing(L / 2 + (GATE - mid.z) / mid.tz, 4.4, 0, 6.2, 10)] : [];
    wall(kit, p, [[0, 0], [L, 0], [L, 7.6], [0, 7.6]], { o0: -0.8, o1: 0, hex: WHITE, holes });
    if (west) {
      // the Porta dei Leoni: its frame, and the two lions on either side
      const s = L / 2 + (GATE - mid.z) / mid.tz;
      wall(kit, p, [[s - 3.4, 0], [s + 3.4, 0], [s + 3.4, 7.6], [s - 3.4, 7.6]], { o0: 0, o1: 0.5, hex: STONE, holes: [archRing(s, 4.4, 0, 6.2, 10)] });
      for (const d of [-4.4, 4.4]) {
        const q = p.at(s + d), x = q.x + 1.4 * q.tz, z = q.z - 1.4 * q.tx, a = Math.atan2(-q.tz, q.tx);
        kit.box(1.4, 1.2, 2.6, STONE, x, 0.6, z, 0, a);
        kit.box(1, 1.2, 2.2, '#cbbfa8', x, 1.8, z, 0, a);
        kit.box(1.1, 1.1, 1, '#cbbfa8', x + 0.8 * q.tz, 2.5, z - 0.8 * q.tx, 0, a);
      }
    }
  }
  // the porticoes round the courtyard: arches in pale and dark stone on the columns, and the paired
  // windows of the storey over them
  for (const p of court) {
    const L = p.length, n = Math.round(L / 4.6), b = L / n;
    wall(kit, p, [[0, 0], [L, 0], [L, 7.6], [0, 7.6]], { o0: 0, o1: 0.7, hex: WHITE, holes: Array.from({ length: n }, (_, k) => archRing((k + 0.5) * b, b - 1.1, 0, 6.4, 10)) });
    for (let k = 0; k <= n; k++) column(kit, p, k * b, 0.95, 0, 4.6, 0.32, '#d8d2c6', 'corinthian');
    for (let k = 0; k < n; k++) {
      const sc = (k + 0.5) * b, w = b - 1.1, r = w / 2;
      for (let j = 0; j < 9; j++) {
        const a0 = (j / 9) * Math.PI, a1 = ((j + 1) / 9) * Math.PI, sp = 6.4 - r;
        const ring = [[sc + r * Math.cos(a0), sp + r * Math.sin(a0)], [sc + (r + 0.7) * Math.cos(a0), sp + (r + 0.7) * Math.sin(a0)], [sc + (r + 0.7) * Math.cos(a1), sp + (r + 0.7) * Math.sin(a1)], [sc + r * Math.cos(a1), sp + r * Math.sin(a1)]];
        wall(kit, p, ring, { o0: 0.7, o1: 0.78, hex: j % 2 ? LAVA : TUFA });
      }
      for (const d of [-0.7, 0.7]) wall(kit, p, archRing(sc + d, 1, 9.6, 12.4, 6), { o0: 0, o1: 0.05, hex: DARK });
    }
    sweep(kit, p, 0, L, [[0, 13.2], [0.5, 13.2], [0.5, 13.8], [0, 13.8]], WHITE, { step: L });
  }
  // the granite basin in the middle of the courtyard
  const [cu, cv] = [(COURT[0][0] + COURT[1][0]) / 2, (COURT[0][1] + COURT[2][1]) / 2];
  kit.add(new THREE.CylinderGeometry(2.6, 2.2, 1.1, 16), '#8c8a86', cu, 0.55, cv);
  kit.add(new THREE.CylinderGeometry(2.25, 2.25, 0.1, 16), '#3f6f86', cu, 1.05, cv);

  // the church: aisles, nave, transept, apses
  const ring = toLocal(RING, X, Z, TURN).filter(([u]) => u > CHURCH + 0.5);
  block(kit, ring, 0, 15, STUCCO);
  block(kit, ring, 15, 15.6, ROOF);
  for (const p of sides(ring, { min: 6 })) {
    const L = p.length;
    for (let s = 4; s < L - 2; s += 7) wall(kit, p, archRing(s, 1.8, 7, 11.5, 6), { o0: 0, o1: 0.05, hex: DARK });
  }
  const N = NAVE, T = TRANSEPT;
  kit.box(N.u1 - N.u0, N.eaves, 2 * N.hw, STUCCO, (N.u0 + N.u1) / 2, N.eaves / 2, N.v);
  gable(kit, N.u0 - 0.6, N.u1, N.hw + 0.8, N.eaves, N.ridge, ROOF, { z: N.v });
  for (const p of sides(box4(N.u0, N.v - N.hw, N.u1, N.v + N.hw))) if (p.length > 30) for (let s = 5; s < p.length - 3; s += 7.5) wall(kit, p, archRing(s, 2, 17.5, 22, 6), { o0: 0, o1: 0.05, hex: DARK });
  // the nave's front over the atrium: its round window and the gable's face
  kit.add(new THREE.CylinderGeometry(2.2, 2.2, 0.3, 16).rotateZ(Math.PI / 2), DARK, N.u0 - 0.1, 19, N.v);
  kit.add(new THREE.TorusGeometry(2.4, 0.3, 4, 16).rotateY(Math.PI / 2), WHITE, N.u0 - 0.2, 19, N.v);
  const ped = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, N.eaves, N.v - N.hw, 0, N.eaves, N.v + N.hw, 0, N.ridge - 0.2, N.v], 3));
  kit.add(ped, STUCCO, N.u0 - 0.55, 0, 0);
  kit.box(T.u1 - T.u0, T.eaves, 2 * T.hw - 4, STUCCO, (T.u0 + T.u1) / 2, T.eaves / 2, N.v);
  gable(kit, -T.hw + 1, T.hw - 1, (T.u1 - T.u0) / 2 + 0.8, T.eaves, T.ridge, ROOF, { x: (T.u0 + T.u1) / 2, z: N.v, turn: Math.PI / 2 });
  // the three apses, under their half cones, with their blind arcading
  for (const [v, r, h] of [[N.v, 8, 20], [-17, 6.5, 14], [16, 6.5, 14]]) {
    kit.add(new THREE.CylinderGeometry(r, r, h, 16, 1, false, 0, Math.PI), STUCCO, T.u1, h / 2, v);
    kit.add(new THREE.ConeGeometry(r + 0.6, 3.5, 16, 1, false, 0, Math.PI), ROOF, T.u1, h + 1.75, v);
    for (let k = 1; k < 8; k++) {
      const a = (k / 8) * Math.PI;
      kit.box(0.3, h - 6, 1.2, k % 2 ? TUFA : LAVA, T.u1 + r * Math.sin(a), h / 2 + 1, v + r * Math.cos(a), 0, a + Math.PI / 2);
    }
  }

  // the bell tower: three square storeys, each a little narrower, then the round belfry
  const { u, v } = TOWER;
  let y = 0;
  for (const [hw, h, pairs] of [[5.8, 24, 0], [5.4, 12, 1], [5, 12, 2]]) {
    kit.box(2 * hw, h, 2 * hw, y ? STONE : '#b2a284', u, y + h / 2, v);
    for (const p of sides(box4(u - hw, v - hw, u + hw, v + hw))) {
      const L = p.length;
      wall(kit, p, [[-0.3, y + h - 0.8], [L + 0.3, y + h - 0.8], [L + 0.3, y + h], [-0.3, y + h]], { o0: -0.1, o1: 0.4, hex: WHITE });
      if (!pairs) wall(kit, p, archRing(L / 2, 0.9, 12, 15, 6), { o0: 0, o1: 0.05, hex: DARK });
      for (let k = 0; k < pairs; k++) {
        const s = L * (pairs === 1 ? 0.5 : k ? 0.68 : 0.32);
        for (const d of [-0.75, 0.75]) wall(kit, p, archRing(s + d, 1.2, y + 3, y + h - 3, 6), { o0: 0, o1: 0.05, hex: DARK });
        wall(kit, p, archRing(s, 3.6, y + 2.6, y + h - 2.2, 8), { o0: 0, o1: 0.03, hex: TUFA });
      }
    }
    y += h;
  }
  // the round belfry: its drum, the ring of interlaced arches in tufa and lava, the openings, the dome
  const R = 4.6, BH = 11;
  kit.add(new THREE.CylinderGeometry(R, R, BH, 20), TUFA, u, y + BH / 2, v);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    kit.box(0.5, BH - 1, 0.5, k % 2 ? LAVA : WHITE, u + (R + 0.15) * Math.cos(a), y + BH / 2, v + (R + 0.15) * Math.sin(a), 0, -a);
    if (k % 2 === 0) kit.box(0.2, 4.2, 1.3, DARK, u + (R + 0.05) * Math.cos(a + Math.PI / 16), y + 5, v + (R + 0.05) * Math.sin(a + Math.PI / 16), 0, -a - Math.PI / 16);
  }
  kit.add(new THREE.TorusGeometry(R + 0.2, 0.3, 4, 24).rotateX(Math.PI / 2), LAVA, u, y + BH - 1.5, v);
  kit.add(new THREE.CylinderGeometry(R + 0.4, R + 0.4, 0.6, 20), WHITE, u, y + BH + 0.3, v);
  kit.add(new THREE.SphereGeometry(R - 0.4, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), STONE, u, y + BH + 0.6, v);
  kit.rod([u, y + BH + R - 0.2, v], [u, y + BH + R + 2.6, v], 0.12, '#555', 4);
  return kit.mesh(kitMat(0.88));
}

// the ground it stands in for, and what riders bump into: the church, the bell tower, and the
// atrium's four wings, with the way in through the gate left open
const at = pts => onMap(X, Z, TURN, pts);
const FOOT = [
  at(toLocal(RING, X, Z, TURN).filter(([u]) => u > CHURCH + 0.5)),
  at(box4(TOWER.u - 5.8, TOWER.v - 5.8, TOWER.u + 5.8, TOWER.v + 5.8)),
  at([[-73.6, -26.6], [-27, -27.2], [-27, -18], [-63, -18]]), // north wing
  at([[-36, -18], [-27, -18], [-27, 29.6], [-36, 20]]), // east wing
  at([[-63, 20], [-36, 20], [-27, 29.6], [-69.3, 29.4]]), // south wing
  at([[-73.6, -26.6], [-63, -18], [-63, GATE - 2.8], [-72.6, GATE - 2.8]]), // west wing, north of the gate
  at([[-72.5, GATE + 2.8], [-63, GATE + 2.8], [-63, 20], [-69.3, 29.4]]), // and south of it
];

export const DUOMO = [{ id: 'duomo', name: 'Duomo di San Matteo', x: X, z: Z, turn: TURN, reach: 110, area: [RING], foot: FOOT, make: duomo }];
