// The Arco di Costantino (AD 315), between the Colosseo and the Palatine, modelled by hand in place
// of the map's block of it, from its measurements and photos, in game metres (the real ones times
// 1.25): 32 m wide, 26 m high, its long axis the map's. One wall of marble with its three arches cut
// through it, the big one in the middle and the two small ones either side, and on each face:
//   four Corinthian columns of yellow giallo antico on their carved pedestals, standing free of the
//     wall, the entablature breaking forward over each of them
//   over each small arch a band of Constantine's frieze and the pair of Hadrian's roundels
//   the attic, its inscription in the middle and two relief panels either side of it, and a captive
//     Dacian standing on top of each column
// Riders go through the three arches; its four piers stop them.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep, column, archRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 1272.9, Z = 1253.6, TURN = -0.222; // its middle, and its long axis turned from east
const W = 32, FACE = 3.1; // its width, and its faces out from the middle
const MARBLE = '#e4ddcc', GREY = '#d2c9b6', GIALLO = '#d9c18c', PAVONAZZETTO = '#c9bdb0';

const MID = { w: 8.1, crown: 14.4 }, SIDE = { w: 4.2, crown: 9.3, at: 9.6 };
const COLS = [-13.4, -5.9, 5.9, 13.4]; // along it
const PED = 4.1, ENT = [17.2, 19.4], TOP = 26.3; // the pedestals' top, the entablature, the attic's top

// a slab in front of a face: o from the face (at side * FACE) out by d, as wall()'s o0, o1
const proud = (side, from, d) => { const a = side * from, b = side * (from + d); return { o0: Math.min(a, b), o1: Math.max(a, b) }; };
// a section drawn for the face at +o, mirrored for the other one (still anticlockwise)
const mirror = (side, pts) => (side > 0 ? pts : pts.map(([o, y]) => [-o, y]).reverse());

export function arco() {
  const kit = new Kit(), path = linePath(-W / 2, 0, W / 2, 0), s = u => u + W / 2;
  // the wall, its three arches through it, on a low step
  const holes = [archRing(s(0), MID.w, 0, MID.crown, 14), ...[-1, 1].map(k => archRing(s(k * SIDE.at), SIDE.w, 0, SIDE.crown))];
  wall(kit, path, [[0, 0], [W, 0], [W, ENT[0]], [0, ENT[0]]], { holes, o0: -FACE, o1: FACE, hex: MARBLE });
  sweep(kit, path, -0.4, W + 0.4, [[-FACE - 0.4, 0], [FACE + 0.4, 0], [FACE + 0.4, 0.5], [-FACE - 0.4, 0.5]], GREY, { step: W });
  for (const side of [-1, 1]) {
    // the arches' imposts and archivolts, standing a little proud of the wall
    for (const [u, w, crown] of [[0, MID.w, MID.crown], [-SIDE.at, SIDE.w, SIDE.crown], [SIDE.at, SIDE.w, SIDE.crown]]) {
      const spring = crown - w / 2;
      for (const k of [-1, 1]) {
        const e = s(u + k * w / 2);
        sweep(kit, path, Math.min(e, e + k * 0.9), Math.max(e, e + k * 0.9), mirror(side, [[FACE, spring - 0.4], [FACE + 0.36, spring - 0.4], [FACE + 0.36, spring], [FACE, spring]]), GREY, { step: 4 });
      }
      const ring = archRing(s(u), w + 1.4, spring, crown + 0.7, 12).slice(2), inner = archRing(s(u), w, spring, crown, 12).slice(2);
      wall(kit, path, [...ring, ...inner.reverse()], { ...proud(side, FACE, 0.18), hex: GREY });
    }
    // over each small arch the frieze and the two roundels
    for (const k of [-1, 1]) {
      const u = k * SIDE.at;
      wall(kit, path, [[s(u - 3.1), 10.4], [s(u + 3.1), 10.4], [s(u + 3.1), 11.6], [s(u - 3.1), 11.6]], { ...proud(side, FACE, 0.18), hex: shade(GREY, -0.08) });
      for (const d of [-1.75, 1.75]) {
        const c = archRing(s(u + d), 2.9, 12.3, 15.2, 8).slice(2), disc = [...c, ...c.slice(1, -1).map(([a, b]) => [2 * s(u + d) - a, 2 * 13.75 - b])];
        wall(kit, path, disc, { ...proud(side, FACE, 0.27), hex: shade(MARBLE, -0.12) });
      }
    }
    // the columns on their pedestals, and the entablature breaking forward over them
    for (const u of COLS) {
      sweep(kit, path, s(u) - 1.05, s(u) + 1.05, mirror(side, [[FACE, 0.5], [FACE + 1.5, 0.5], [FACE + 1.5, PED], [FACE, PED]]), GREY, { step: 4 });
      sweep(kit, path, s(u) - 1.2, s(u) + 1.2, mirror(side, [[FACE, PED - 0.35], [FACE + 1.7, PED - 0.35], [FACE + 1.7, PED], [FACE, PED]]), MARBLE, { step: 4 });
      column(kit, path, s(u), side * (FACE + 0.75), PED, ENT[0], 0.62, GIALLO, 'corinthian');
      column(kit, path, s(u), side * (FACE + 0.1), PED, ENT[0], 0.55, GREY, 'pilaster'); // on the wall behind it
      sweep(kit, path, s(u) - 1.2, s(u) + 1.2, mirror(side, [[FACE, ENT[0]], [FACE + 1.7, ENT[0]], [FACE + 1.7, ENT[1] - 0.5], [FACE + 2, ENT[1] - 0.5], [FACE + 2, ENT[1]], [FACE, ENT[1]]]), MARBLE, { step: 4 });
      // the captive Dacian on top, in his cloak of pavonazzetto, standing against the attic
      const x = s(u) - W / 2, z = -side * (FACE + 0.6);
      kit.box(1.3, 0.35, 1.3, GREY, x, ENT[1] + 0.18, z);
      kit.add(new THREE.CylinderGeometry(0.45, 0.6, 3.1, 8), PAVONAZZETTO, x, ENT[1] + 1.9, z);
      kit.add(new THREE.CylinderGeometry(0.3, 0.38, 0.75, 8), MARBLE, x, ENT[1] + 3.8, z);
    }
    // the attic's inscription, its letters once bronze, and the relief panels either side of it
    wall(kit, path, [[s(-5.2), 20.4], [s(5.2), 20.4], [s(5.2), 25], [s(-5.2), 25]], { ...proud(side, FACE - 0.3, 0.4), hex: MARBLE });
    for (let line = 0; line < 4; line++) {
      const y = 24.1 - line * 0.95, half = line === 3 ? 2.6 : 4.4;
      wall(kit, path, [[s(-half), y - 0.42], [s(half), y - 0.42], [s(half), y], [s(-half), y]], { ...proud(side, FACE, 0.13), hex: '#6f6556' });
    }
    for (const [a, b] of [[-12.4, -7], [7, 12.4]]) wall(kit, path, [[s(a), 20.6], [s(b), 20.6], [s(b), 24.6], [s(a), 24.6]], { ...proud(side, FACE - 0.3, 0.35), hex: shade(MARBLE, -0.1) });
  }
  // the entablature along the wall, and the attic over it with its cornice
  sweep(kit, path, -0.3, W + 0.3, [[-FACE - 0.3, ENT[0]], [FACE + 0.3, ENT[0]], [FACE + 0.3, ENT[1] - 0.5], [FACE + 0.6, ENT[1] - 0.5], [FACE + 0.6, ENT[1]], [-FACE - 0.6, ENT[1]], [-FACE - 0.6, ENT[1] - 0.5], [-FACE - 0.3, ENT[1] - 0.5]], MARBLE, { step: W });
  wall(kit, path, [[0, ENT[1]], [W, ENT[1]], [W, TOP - 0.9], [0, TOP - 0.9]], { o0: -FACE + 0.3, o1: FACE - 0.3, hex: GREY });
  sweep(kit, path, -0.4, W + 0.4, [[-FACE, TOP - 0.9], [FACE, TOP - 0.9], [FACE + 0.1, TOP - 0.3], [FACE - 0.2, TOP], [-FACE + 0.2, TOP], [-FACE - 0.1, TOP - 0.3]], MARBLE, { step: W });
  return kit.mesh(kitMat(0.9));
}

// riders bump into its four piers, with the columns in front of them, and go through the arches
const PIERS = [[-W / 2, -SIDE.at - SIDE.w / 2], [-SIDE.at + SIDE.w / 2, -MID.w / 2], [MID.w / 2, SIDE.at - SIDE.w / 2], [SIDE.at + SIDE.w / 2, W / 2]];
export const ARCO = [{
  id: 'arco-di-costantino', name: 'Arco di Costantino', x: X, z: Z, turn: TURN, reach: 60,
  area: [onMap(X, Z, TURN, rect(-W / 2 - 1, -FACE - 2.5, W / 2 + 1, FACE + 2.5))],
  foot: PIERS.map(([a, b]) => onMap(X, Z, TURN, rect(a, -FACE - 1.5, b, FACE + 1.5))),
  make: arco,
}];
