// The Altes Museum (Schinkel, 1823-30) on the Lustgarten, modelled by hand in place of the map's two
// prisms of it, from its measurements and photos, in game metres (the real ones times 1.25), on the
// map's outlines: a block 87 m by 55 m on a podium.
//   the front to the Lustgarten: eighteen Ionic columns the whole width, between two corner piers,
//     on the podium with the broad flight of steps up the middle; behind them the open hall and its
//     back wall with the doors; the entablature with its inscription band, and the eagles on it
//   the plain sides and back, their two rows of windows over the podium
//   the square attic over the middle that hides the rotunda's dome, and the Dioscuri with their
//     horses at its front corners
// The model's own metres: +u runs along the front (north-east), +v out of it to the Lustgarten.
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, sweep, linePath, column, rect } from '../core/js/arcade.js';
import { nearest, local, box, sides, prism, cornice, windows, figure } from './outline.js';

const X = 1126.6, Z = -635.3, TURN = 0.557;
const BLOCK = nearest('part', 1140.2, -636.6, 5), ATTIC = nearest('part', 1128.3, -635.3, 4);
const STONE = '#e3d9c3', STONE2 = '#cfc3a8', DARK = '#3a3d40', BRONZE = '#5d5a4f';
const PODIUM = 3.6, COLS = 19.4, ENT = 23.2, TOP = 25.4, CUBE = 33;

export function altesMuseum() {
  const kit = new Kit();
  const ring = local(BLOCK.p, X, Z, TURN), b = box(ring);
  const front = b.v1, edge = front - 4.2, hall = front - 13; // the foot of the steps, the podium's edge, the open hall's back wall
  const sw = 7 * ((b.du - 8.8) / 18); // the steps: seven bays wide
  // the block behind the hall, and the podium under all of it
  const back = [[b.u0, b.v0], [b.u1, b.v0], [b.u1, hall], [b.u0, hall]];
  prism(kit, rect(b.u0, b.v0, b.u1, edge), 0, PODIUM, STONE2);
  for (const [u0, u1] of [[b.u0, b.u - sw / 2], [b.u + sw / 2, b.u1]]) prism(kit, rect(u0, edge, u1, front), 0, PODIUM, STONE2);
  prism(kit, back, PODIUM, TOP - 1.2, STONE);
  for (const p of sides(back, 4)) sweep(kit, p, 0, p.length, [[-0.1, PODIUM + 5.6], [0.3, PODIUM + 5.6], [0.3, PODIUM + 6.2], [-0.1, PODIUM + 6.2]], STONE2, { step: p.length });
  windows(kit, back, { bay: 5.2, w: 1.9, y0: PODIUM + 1.6, y1: PODIUM + 4.8, hex: DARK, min: 30, skip: (u, v) => v > hall - 1 });
  windows(kit, back, { bay: 5.2, w: 2.2, y0: PODIUM + 8.4, y1: PODIUM + 14.6, hex: DARK, sill: STONE2, min: 30, skip: (u, v) => v > hall - 1 });
  cornice(kit, back, TOP, STONE2, { out: 0.8, h: 1.4 });
  // the two corner piers that close the colonnade at its ends
  for (const [u0, u1] of [[b.u0, b.u0 + 4.4], [b.u1 - 4.4, b.u1]]) prism(kit, rect(u0, hall, u1, edge), PODIUM, ENT, STONE);
  // the steps up the middle, from the Lustgarten to the podium
  for (let k = 0; k < 9; k++) {
    const y = ((k + 1) / 9) * PODIUM, v1 = front - k * 0.467;
    kit.box(sw, y, v1 - edge, k % 2 ? STONE2 : STONE, b.u, y / 2, (edge + v1) / 2);
  }
  // the eighteen Ionic columns, and the doors in the hall's back wall
  const line = linePath(b.u0 + 4.4, edge - 1.2, b.u1 - 4.4, edge - 1.2); // runs along the front, its right to -v (inward)
  const span = line.length;
  for (let k = 0; k < 18; k++) column(kit, line, ((k + 0.5) / 18) * span, 0, PODIUM, COLS, 0.92, STONE, 'ionic');
  const wallLine = linePath(b.u1, hall, b.u0, hall); // its right to +v, the hall
  for (const s of [b.du / 2 - 4, b.du / 2 + 4]) wall(kit, wallLine, [[s - 1.6, PODIUM], [s + 1.6, PODIUM], [s + 1.6, PODIUM + 6.4], [s - 1.6, PODIUM + 6.4]], { o0: -0.1, o1: 0.1, hex: '#4a3a2c' });
  wall(kit, wallLine, [[0, PODIUM], [b.du, PODIUM], [b.du, ENT], [0, ENT]], { o0: -0.1, o1: 0.04, hex: '#b7ab91' }); // the hall's back wall, in the shade
  wall(kit, wallLine, [[b.du / 2 - 2.5, PODIUM + 8], [b.du / 2 + 2.5, PODIUM + 8], [b.du / 2 + 2.5, COLS - 1.4], [b.du / 2 - 2.5, COLS - 1.4]], { o0: -0.1, o1: 0.08, hex: '#8f8a7e' }); // the frescoes' panel
  // the entablature over the colonnade, its inscription band and cornice, the ceiling of the hall
  const across = edge - hall + 0.4, mv = (edge + hall) / 2;
  kit.box(b.du, ENT - COLS, across, STONE, b.u, (COLS + ENT) / 2, mv);
  kit.box(b.du - 14, 1.1, 0.12, BRONZE, b.u, COLS + 2.2, edge + 0.27);
  kit.box(b.du + 1.2, 0.8, across + 1.2, STONE2, b.u, ENT + 0.4, mv);
  kit.box(b.du, TOP - ENT - 0.8, across, STONE, b.u, (ENT + 0.8 + TOP) / 2, mv);
  for (let k = 0; k < 18; k++) { // the eagles along the top
    const u = b.u0 + 4.4 + ((k + 0.5) / 18) * span;
    kit.box(1.4, 1, 0.5, BRONZE, u, TOP + 0.5, edge - 0.2);
  }
  // the attic over the rotunda, and the Dioscuri at its front corners
  if (ATTIC) {
    const at = local(ATTIC.p, X, Z, TURN), ab = box(at);
    prism(kit, at, TOP - 1.2, CUBE - 1, STONE);
    cornice(kit, at, CUBE, STONE2, { out: 0.7, h: 1.2 });
    for (const u of [ab.u0 + 1.6, ab.u1 - 1.6]) {
      kit.box(3.2, 1.2, 1.4, BRONZE, u, CUBE + 0.6 + 1.2, ab.v1 - 1.4);
      kit.box(1.1, 2.2, 3.2, BRONZE, u, CUBE + 1.6, ab.v1 - 1.6); // the horse, rearing
      kit.box(0.7, 1.2, 0.7, BRONZE, u, CUBE + 3.1, ab.v1 - 3);
      figure(kit, u + (u < ab.u ? 1.6 : -1.6), CUBE, ab.v1 - 1.2, 3.4, BRONZE);
    }
  }
  return kit.mesh(kitMat(0.88));
}

export const ALTES_MUSEUM = BLOCK ? [{
  id: 'altes-museum', name: 'Altes Museum', x: X, z: Z, turn: TURN, reach: 260,
  area: [BLOCK.p, ...(ATTIC ? [ATTIC.p] : [])], foot: [BLOCK.p], make: altesMuseum,
}] : [];
