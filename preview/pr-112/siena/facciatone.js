// The Facciatone, the front of the Duomo Nuovo: in 1339 Siena began a new nave so big that the
// cathedral of today would have been only its transept, and the Black Death of 1348 stopped it. The
// front wall was left standing on its own, open to the sky through its great window, and its top is
// a terrace with a view over the town. Modelled by hand in place of the map's piece of it, which
// floats as a roof, from its measurements and photos, in game metres (the real ones times 1.25):
//   the wall of grey stone, 20 m wide, its piers banded black and white at the edges
//   the great pointed window, open right through, and the walled-up portal under it
//   the stair turret at its north end, and the railing round the terrace on top
// Riders bump into it.
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { panel, lancet, prism } from '../florence/marble.js';
import { WHITE, BLACK } from './duomo.js';

const X = -0.4, Z = 109, TURN = 0.9275; // the wall's middle; it runs along the Duomo's axis (duomo.js), its outside to local +z
const U0 = -4, U1 = 12.6, V0 = -2.2, V1 = 1.4, H = 41; // the wall: from u to u, its inner and outer faces, its top
const T = [-12.1, -4, -2.2, 4.5], TH = 44; // the stair turret: u0, u1, v0, v1, its top
const STONE = '#b8ae9b', IRON = '#33322f';

// a pier banded black and white from y0 to y1, w wide, at (u, v)
function pier(kit, u, v, w, d, y0, y1) {
  for (let y = y0; y < y1; y += 1) kit.box(w, Math.min(1, y1 - y), d, (y - y0) % 2 ? BLACK : WHITE, u, y + Math.min(1, y1 - y) / 2, v);
}

export function facciatone() {
  const kit = new Kit();
  // the wall, the window cut right through it, from the outside (+v) and the piazza's side (-v)
  const out = linePath(U1, V1, U0, V1), len = out.length, c = len / 2 - 2; // s from the south end
  const win = pointedRing(c, 7.4, 11, 35, 0.9);
  wall(kit, out, [[0, 0], [len, 0], [len, H], [0, H]], { holes: [win], o0: -(V1 - V0), o1: 0, hex: STONE });
  // its frames, banded, on both faces; the walled-up portal under it with its gable
  for (const [path, o] of [[out, 0], [linePath(U0, V0, U1, V0), 0]]) {
    const s = path === out ? c : len - c;
    const w = pointedRing(s, 7.4 + 2, 10, 36.2, 0.9), w0 = pointedRing(s, 7.4, 11, 35, 0.9);
    wall(kit, path, w, { holes: [w0], o0: o, o1: o + 0.5, hex: WHITE });
    for (let y = 12; y < 30; y += 2) panel(kit, path, s - 4.7, s - 3.7, y, y + 1, BLACK, o + 0.5, 0.05), panel(kit, path, s + 3.7, s + 4.7, y, y + 1, BLACK, o + 0.5, 0.05);
    lancet(kit, path, s, 4.6, 0.4, 8, { frame: WHITE, glass: shade(STONE, -0.2), rim: 0.6, r: 0.9, o: o });
  }
  // the banded piers at both ends, the cornice
  pier(kit, U1 - 0.9, (V0 + V1) / 2, 1.8, V1 - V0 + 0.8, 0, H + 0.6);
  kit.box(U1 - T[1] + 0.4, 0.6, V1 - V0 + 0.6, shade(STONE, -0.08), (U1 + T[1]) / 2, H - 0.3, (V0 + V1) / 2);
  // the stair turret, its slit windows, its top
  prism(kit, rect(T[0], T[2], T[1], T[3]), 0, TH, STONE);
  pier(kit, T[0] + 0.8, T[3] - 0.8, 1.8, 1.8, 0, TH + 0.4);
  pier(kit, T[0] + 0.8, T[2] + 0.8, 1.8, 1.8, 0, TH + 0.4);
  const side = linePath(T[1], T[3], T[0], T[3]);
  for (let y = 6; y < TH - 4; y += 7) lancet(kit, side, side.length / 2, 0.8, y, y + 2.4, { frame: WHITE, glass: '#2a2a28', rim: 0.2, r: 0.9, o: 0.02 });
  // the railings round the terraces on top
  for (const [u0, u1, v0, v1, y] of [[T[1], U1, V0, V1, H], [T[0], T[1], T[2], T[3], TH]]) {
    for (const [a, b] of [[[u0, v0], [u1, v0]], [[u1, v0], [u1, v1]], [[u1, v1], [u0, v1]], [[u0, v1], [u0, v0]]]) {
      kit.rod([a[0], y + 1.1, a[1]], [b[0], y + 1.1, b[1]], 0.05, IRON, 4);
      const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.5);
      for (let k = 0; k <= n; k++) kit.box(0.08, 1.1, 0.08, IRON, a[0] + ((b[0] - a[0]) * k) / n, y + 0.55, a[1] + ((b[1] - a[1]) * k) / n);
    }
  }
  return kit.mesh(kitMat(0.9));
}

// it stands in for the map's floating piece of it (area), and riders bump into the wall and the turret (foot)
const FOOT = [rect(U0, V0, U1, V1), rect(T[0], T[2], T[1], T[3])].map(r => onMap(X, Z, TURN, r));
export const FACCIATONE = [{
  id: 'facciatone', name: 'Facciatone', x: X, z: Z, turn: TURN, reach: 110,
  area: [onMap(X, Z, TURN, rect(T[0] - 1, V0 - 1, U1 + 1, T[3] + 1))], foot: FOOT,
  make: facciatone,
}];
