// The Castello di Carlo V, modelled by hand in place of the map's outline of it, from its measurements
// and photos, in game metres (the real ones times 1.25): the fortress Charles V had built round the
// older castle in 1539-49 against the Ottomans, just east of the old town, in a paler, harder stone.
//   the bastioned walls: a broad square with an arrow-shaped bastion at each corner, 13 m high, their
//     foot battered outwards, the round cordon of stone running all the way round half way up and the
//     parapet on top with its rounded coping; gun ports low in the bastions' faces
//   behind them, along a narrow yard that runs round three sides, the older castle: its ranges round
//     an inner courtyard, two storeys of windows looking into both
//   the gate in the middle of the west front, under the emperor's arms
// The map has the castle as one outline; its yard and courtyard (OpenStreetMap's inner rings) are
// left open here. Riders bump into the outline, as before.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, sweep, archRing } from '../core/js/arcade.js';
import { nearest, local, sides, prism, windows, placeFront } from './outline.js';
import { blk, slab, archShape, archFrame, DOOR } from './baroque.js';

const X = 652.6, Z = 183.3; // the middle of the map's outline; the model is not turned
const CASTLE = nearest('castle', X, Z, 4)?.p ?? [];
const STONE = '#ddcfae', STONE2 = '#cbbb96', CAP = '#e6dcc2', DARK = '#3a352d';
const H = 16.2, CORDON = 8.2;
// the yard between the walls and the older castle, and the older castle's courtyard, from
// OpenStreetMap (the map fills them in), in the city's metres
const YARD = [639.5, 140, 639.6, 132.3, 674.9, 130.7, 675.2, 137.5, 701.5, 136.9, 701.6, 129.4, 721.6, 127.9, 721.3, 135.2, 719.4, 135.2,
  719.5, 141.8, 712, 142.1, 711.8, 200.8, 711.6, 243.7, 709.9, 243.7, 709.7, 254.5, 649.7, 235.6, 650.7, 232.9, 633.1, 227.1, 610.9, 220.8,
  611.9, 204.9, 619.9, 205.8, 619.5, 212.2, 627, 212.9, 625.7, 217.6, 689.8, 238, 694, 224.2, 698.4, 210.2, 696.8, 209.5, 697.4, 200.9,
  700.1, 157.7, 700.1, 157.1, 692.2, 157.4, 691.7, 142.3, 674.7, 142.9, 674.9, 149, 629.4, 150.6, 628.2, 167.4, 630.1, 167.5, 629.5, 172.8,
  625.5, 172.4, 624.7, 179, 615, 178.1, 618.4, 140.7];
const COURT = [667.4, 166.5, 667.4, 161.2, 684.2, 160.4, 682.9, 182.2, 676.7, 182, 676, 196.8, 675.7, 202.9, 639.7, 193.8, 640.6, 186.9, 643, 167.2];

// the gate: a round arch in a frame of rusticated blocks, the emperor's arms over it
function gate() {
  const f = new Kit();
  blk(f, -4.8, 4.8, 0, 13.4, -1.4, 0, STONE2); // standing out over the battered foot
  slab(f, archShape(0, 4.2, 0, 6.4), -0.4, 0.02, DOOR);
  archFrame(f, 0, 4.2, 0, 6.4, 1.1, 0, 0.5, CAP);
  for (let y = 0.4; y < 6; y += 1.1) for (const s of [-1, 1]) blk(f, s * 3.4 - 0.7, s * 3.4 + 0.7, y, y + 0.8, 0, 0.6, STONE2);
  blk(f, -3.6, 3.6, 7.6, 8.1, 0, 0.7, CAP);
  blk(f, -1.8, 1.8, 8.6, 12.8, 0, 0.35, STONE2);
  f.add(new THREE.SphereGeometry(1.2, 8, 6).scale(1, 1.3, 0.4), '#b9a27a', 0, 10.6, 0.4); // the arms, the eagle's shield
  f.add(new THREE.ConeGeometry(0.7, 0.9, 6), '#b9a27a', 0, 12.4, 0.35); // and the crown over it
  return f;
}

export function castello() {
  const kit = new Kit(), ring = local(CASTLE, X, Z, 0), yard = local(YARD, X, Z, 0), court = local(COURT, X, Z, 0);
  prism(kit, ring, 0, H, STONE, [yard, court]);
  for (const path of sides(ring, 0.5)) {
    const L = path.length;
    // the battered foot, out from the wall, up to the cordon; the cordon; the parapet's coping
    sweep(kit, path, 0, L, [[-0.1, 0], [1.2, 0], [0, CORDON - 0.4], [-0.1, CORDON - 0.4]], STONE2, { step: L });
    sweep(kit, path, 0, L, [[-0.1, CORDON - 0.45], [0.35, CORDON - 0.35], [0.55, CORDON], [0.35, CORDON + 0.35], [-0.1, CORDON + 0.45]], CAP, { step: L });
    sweep(kit, path, 0, L, [[-0.1, H - 0.1], [0.3, H - 0.1], [0.3, H + 0.6], [0, H + 1.0], [-0.6, H + 1.1], [-0.6, H - 0.1]], CAP, { step: L });
    // gun ports in the long faces, low down
    if (L > 14) for (let s = 7; s < L - 6; s += 14) wall(kit, path, archRing(s, 0.9, 4.4, 5.6, 4), { o0: -0.1, o1: 0.62, hex: DARK });
    // a few small windows high up
    if (L > 20) for (let s = 10; s < L - 8; s += 16) wall(kit, path, [[s - 0.6, 11], [s + 0.6, 11], [s + 0.6, 12.6], [s - 0.6, 12.6]], { o0: -0.1, o1: 0.08, hex: DARK });
  }
  // round the yard and the courtyard: a parapet, two storeys of windows
  for (const [r, opts] of [[yard, { hole: true }], [court, { hole: true }]]) {
    for (const path of sides(r, 0.5, true)) sweep(kit, path, 0, path.length, [[-0.6, H - 0.1], [0.25, H - 0.1], [0.25, H + 0.7], [-0.6, H + 0.7]], CAP, { step: path.length });
    windows(kit, r, { bay: 5.5, w: 1.3, y0: 3, y1: 5.6, sill: CAP, head: 'flat', min: 4, ...opts });
    windows(kit, r, { bay: 5.5, w: 1.4, y0: 9.6, y1: 12.6, sill: CAP, head: 'flat', min: 4, ...opts });
  }
  // the gate, in the middle of the west curtain wall (from (601.4, 214.9) to (608, 147.8))
  placeFront(kit, gate(), 604.7 - X - 1.25 * 0.9955, 181.35 - Z - 1.25 * 0.098, -0.9955, -0.098);
  return kit.mesh(kitMat(0.88, 0));
}

export const CASTELLO = CASTLE.length ? [{
  id: 'castello-carlo-v', name: 'Castello di Carlo V', x: X, z: Z, turn: 0, reach: 380,
  area: [CASTLE], foot: [CASTLE], make: castello,
}] : [];
