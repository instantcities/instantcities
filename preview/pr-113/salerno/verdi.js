// The Teatro Municipale Giuseppe Verdi on the Piazza Matteo Luciani, beside the Villa Comunale,
// modelled by hand in place of the map's block of it, on the map's outline of it (65 by 38 m, 81 by
// 48 here), in game metres (the real ones times 1.25). Built 1863-72 by Antonio D'Amora and Giuseppe
// Manichini on the proportions of the San Carlo in Naples, and opened with Rigoletto:
//   the front on the piazza standing forward of the body: three round arches on the rusticated
//     ground floor, the loggia of the first floor between its paired columns, and the attic over it
//     with the theatre's name and the statues along the top
//   the body in pale yellow plaster with white stone round its windows, the auditorium under a
//     hipped roof, and the stage's tall fly tower behind it, at the far end
// The model's own metres: u across the front, to the east, v along the building, to the south (the
// front is at its north end), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, sweep, column, archRing } from '../core/js/arcade.js';
import { toLocal, sides, block, box4 } from './outline.js';

const X = -728, Z = -131, TURN = -0.098;
// the map's outline of the theatre (the city's metres)
const RING = [-734,-180.5,-734.7,-172.8,-746.9,-174,-756.7,-93,-743.1,-91.3,-743.9,-83,-720.8,-80.7,-720,-88.7,-708.7,-87.6,-700.4,-167.4,-710.7,-168.8,-709.8,-178.2];
const EAVES = 20, FLY = 31, FRONT = { u0: -10.8, u1: 13.5, v0: -48.7, v1: -40.9 };
const PLASTER = '#ecd9a8', WHITE = '#f1ebdd', RUST = '#d9cfbd', ROOF = '#a85f40', DARK = '#2e2b29', GREY = '#b9b2a6';

export function verdi() {
  const kit = new Kit(), ring = toLocal(RING, X, Z, TURN);
  block(kit, ring, 0, EAVES, PLASTER);
  block(kit, ring, EAVES, EAVES + 0.4, WHITE);
  // the body's sides: the rusticated ground floor, the cornices, two storeys of framed windows
  for (const p of sides(ring, { min: 6 })) {
    const L = p.length, n = Math.floor(L / 4.6), q = p.at(L / 2);
    if (q.z < FRONT.v1 + 0.2 && q.x > FRONT.u0 && q.x < FRONT.u1) continue; // the front, below
    wall(kit, p, [[0, 0], [L, 0], [L, 6], [0, 6]], { o0: 0, o1: 0.3, hex: RUST });
    for (const y of [6, 13.2]) wall(kit, p, [[0, y], [L, y], [L, y + 0.6], [0, y + 0.6]], { o0: 0, o1: 0.45, hex: WHITE });
    sweep(kit, p, 0, L, [[0, EAVES - 1.2], [0.9, EAVES - 0.6], [0.9, EAVES], [0, EAVES]], WHITE, { step: L });
    for (let k = 0; k < n; k++) {
      const s = (k + 0.5) * (L / n);
      wall(kit, p, archRing(s, 2, 1.5, 4.8, 6), { o0: 0.3, o1: 0.35, hex: DARK });
      for (const [y0, y1] of [[7.8, 12.2], [14.8, 18]]) {
        wall(kit, p, [[s - 1.4, y0 - 0.4], [s + 1.4, y0 - 0.4], [s + 1.4, y1 + 0.5], [s - 1.4, y1 + 0.5]], { o0: 0, o1: 0.2, hex: WHITE });
        wall(kit, p, [[s - 0.9, y0], [s + 0.9, y0], [s + 0.9, y1], [s - 0.9, y1]], { o0: 0.2, o1: 0.25, hex: DARK });
      }
    }
  }
  // the auditorium's hipped roof, and the stage's fly tower at the south end under its low gable
  kit.frustum(47, 48, 20, 20, 6, ROOF, 0, EAVES + 0.4, -16);
  kit.box(40, FLY - EAVES, 30, PLASTER, 0, (EAVES + FLY) / 2, 25);
  kit.box(41, 0.8, 31, WHITE, 0, FLY, 25);
  kit.frustum(41, 31, 41, 0.4, 3, ROOF, 0, FLY + 0.4, 25);
  for (const u of [-14, -7, 0, 7, 14]) kit.box(1.6, 3.4, 0.3, DARK, u, EAVES + 6, 10 - 0.1);

  // the front: rusticated ground floor with its three arches, the loggia between paired columns,
  // and the attic with the name and its statues
  const F = FRONT, fu = (F.u0 + F.u1) / 2, fw = F.u1 - F.u0, face = sides(box4(F.u0, F.v0, F.u1, F.v1))[0];
  const L = face.length;
  wall(kit, face, [[0, 0], [L, 0], [L, 8], [0, 8]], { o0: 0, o1: 0.4, hex: RUST, holes: [-1, 0, 1].map(k => archRing(L / 2 + k * 6.6, 3.6, 0, 6.4, 10)) });
  for (let y = 1.2; y < 8; y += 1.2) wall(kit, face, [[0, y - 0.12], [L, y - 0.12], [L, y + 0.12], [0, y + 0.12]], { o0: 0.4, o1: 0.42, hex: GREY });
  kit.box(fw - 1, 7.6, 0.3, DARK, fu, 3.8, F.v0 - 0.17);
  wall(kit, face, [[-0.4, 8], [L + 0.4, 8], [L + 0.4, 8.9], [-0.4, 8.9]], { o0: 0, o1: 0.8, hex: WHITE });
  for (const k of [-1, 0, 1]) {
    const s = L / 2 + k * 6.6;
    wall(kit, face, archRing(s, 2.8, 9.6, 15.6, 8), { o0: 0, o1: 0.05, hex: DARK });
    wall(kit, face, [[s - 2, 9], [s + 2, 9], [s + 2, 9.6], [s - 2, 9.6]], { o0: 0, o1: 0.7, hex: WHITE });
  }
  for (const s of [0.9, 2.1, 7.6, 9.8, L - 9.8, L - 7.6, L - 2.1, L - 0.9]) column(kit, face, s, 0.55, 8.9, 17, 0.38, WHITE, 'ionic');
  sweep(kit, face, -0.5, L + 0.5, [[-0.2, 17], [1.1, 17], [1.1, 18.2], [-0.2, 18.2]], WHITE, { step: L });
  wall(kit, face, [[0, 18.2], [L, 18.2], [L, 22.6], [0, 22.6]], { o0: -2, o1: 0.4, hex: PLASTER });
  wall(kit, face, [[L / 2 - 7, 19.4], [L / 2 + 7, 19.4], [L / 2 + 7, 21.4], [L / 2 - 7, 21.4]], { o0: 0.4, o1: 0.5, hex: WHITE });
  for (let k = 0; k < 9; k++) wall(kit, face, [[L / 2 - 6.2 + k * 1.4, 20], [L / 2 - 5.5 + k * 1.4, 20], [L / 2 - 5.5 + k * 1.4, 20.8], [L / 2 - 6.2 + k * 1.4, 20.8]], { o0: 0.5, o1: 0.55, hex: '#6b5a3a' });
  sweep(kit, face, -0.3, L + 0.3, [[-2, 22.6], [0.7, 22.6], [0.7, 23.3], [-2, 23.3]], WHITE, { step: L });
  // the statues on the attic, over the columns
  for (const s of [1.5, 8.7, L - 8.7, L - 1.5]) {
    const q = face.at(s), x = q.x + 0.2 * q.tz, z = q.z - 0.2 * q.tx;
    kit.box(1.1, 0.8, 1.1, WHITE, x, 23.7, z);
    kit.add(new THREE.CylinderGeometry(0.35, 0.5, 2.2, 8), WHITE, x, 25.2, z);
    kit.add(new THREE.SphereGeometry(0.3, 6, 4), WHITE, x, 26.6, z);
  }
  return kit.mesh(kitMat(0.88));
}

export const VERDI = [{ id: 'teatro-verdi', name: 'Teatro Verdi', x: X, z: Z, turn: TURN, reach: 80, area: [RING], foot: [RING], make: verdi }];
