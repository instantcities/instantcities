// The two buildings on the Bebelplatz modelled by hand in place of the map's outlines of them, from
// their measurements and photos, in game metres (the real ones times 1.25):
//   St. Hedwig's Cathedral (1747-73), in the square's south-east corner: the round church after the
//     Pantheon, its wall of sandstone with niches, the shallow copper-green dome on it and the
//     lantern with its cross, the portico of six Ionic columns and the pediment with its relief
//     facing the square, and the round sacristy behind it
//   the Staatsoper Unter den Linden (Knobelsdorff, 1741-43), along the square's east side: the
//     front to Unter den Linden with its portico of six Corinthian columns on the raised ground floor
//     and its pediment, the long body of pink plaster with its two rows of windows, the cornice and
//     its statues, the hipped roof, and the stage house rising over the south end
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, sweep, linePath, column, rect, archRing, ellipsePath } from '../core/js/arcade.js';
import { nearest, buildings, local, box, sides, prism, roof, shrink, cornice, windows, dome, drum, lantern, figure, portico } from './outline.js';

const SAND = '#d9ccae', SAND2 = '#c4b593', COPPER = '#6c9a86', COPPER2 = '#5b8875', GOLD = '#d4b04a', DARK = '#33363a', ROOFC = '#6c7576';

// ---- St. Hedwig's: +u out through the portico to the square (north-west), +v across it
const HX = 792.9, HZ = -127, HTURN = 2.157;
const ROTUNDA = nearest('part', 793.7, -124.2, 5), PORCH = nearest('part', 777.6, -150.2, 5), SACRISTY = nearest('part', 811.3, -98.5, 5);
const LANTERN = nearest('part', 793.5, -126.7, 3);
const HEDWIG = [ROTUNDA, PORCH, SACRISTY, LANTERN].filter(Boolean);
const WALL = 21, DOME_H = 17.5;

export function hedwig() {
  const kit = new Kit();
  const rb = ROTUNDA ? box(local(ROTUNDA.p, HX, HZ, HTURN)) : { u: 0, v: 0, r: 24.4 };
  const R = rb.r;
  // the round wall, its plinth, its niches and windows, its cornice and the step ring over it
  drum(kit, rb.u, rb.v, R - 0.3, 0, WALL - 1.2, SAND, { n: 48, win: 12, w: 2.2, wy0: 7, wy1: 15.5 });
  kit.add(new THREE.CylinderGeometry(R, R + 0.2, 1.4, 48), SAND2, rb.u, 0.7, rb.v);
  const path = ellipsePath(R - 0.3, R - 0.3), round = { length: path.length, closed: true, at: s => { const p = path.at(s); return { ...p, x: p.x + rb.u, z: p.z + rb.v }; } };
  for (let k = 0; k < 12; k++) {
    const s = (k / 12) * path.length;
    wall(kit, round, archRing(s, 1.8, 1.8, 5.4, 6), { o0: -0.1, o1: 0.06, hex: '#a89a7c' }); // the niches low down
  }
  sweep(kit, round, 0, path.length, [[-0.2, WALL - 1.2], [0.9, WALL - 1.2], [0.9, WALL], [-0.2, WALL]], SAND2, { step: 2.5 });
  kit.add(new THREE.CylinderGeometry(R - 1.6, R - 0.8, 1.8, 48), SAND, rb.u, WALL + 0.9, rb.v);
  // the dome and its ribs, the lantern and the cross
  dome(kit, rb.u, rb.v, R - 1.6, WALL + 1.8, DOME_H, COPPER, { n: 48, rows: 10, ribs: 24, ribHex: COPPER2 });
  const top = WALL + 1.8 + DOME_H;
  lantern(kit, rb.u, rb.v, 3, top - 0.6, 4.2, top + 11, SAND, COPPER, GOLD);
  // the portico to the square
  if (PORCH) {
    const pb = box(local(PORCH.p, HX, HZ, HTURN));
    kit.box(5, 20.8, pb.dv - 0.6, SAND, pb.u0 + 2.5, 10.4, pb.v); // its back, against the round wall
    portico(kit, linePath(pb.u1, pb.v0, pb.u1, pb.v1), 0, pb.dv, { n: 6, y0: 1.6, y1: 17.4, r: 0.95, order: 'ionic', deep: pb.du - 0.4, rise: 6.4, steps: 4, hex: SAND, hex2: SAND2 });
  }
  // the round sacristy behind
  if (SACRISTY) {
    const sb = box(local(SACRISTY.p, HX, HZ, HTURN));
    drum(kit, sb.u, sb.v, sb.r, 0, 17, SAND, { n: 32, win: 6, w: 1.6, wy0: 5, wy1: 12 });
    kit.add(new THREE.CylinderGeometry(sb.r + 0.5, sb.r + 0.5, 1.1, 32), SAND2, sb.u, 17, sb.v);
    dome(kit, sb.u, sb.v, sb.r, 17.5, 8, COPPER, { n: 32, rows: 6, ribs: 12, ribHex: COPPER2 });
  }
  return kit.mesh(kitMat(0.86));
}

// ---- the Staatsoper: +v runs south along it from the front on Unter den Linden, +u east
const OX = 785, OZ = -253, OTURN = 0.098;
const OPERA = nearest('opera_house', 784.7, -244.7, 6)?.p ?? [];
const PINK = '#e6bfae', PINK2 = '#d9ab98', EAVE = 22.5;

export function staatsoper() {
  // the outline without the portico, which stands in front of it
  const kit = new Kit(), ring = local(OPERA, OX, OZ, OTURN).map(([u, v]) => [u, u > -13.2 && u < 10.2 ? Math.max(v, -56.8) : v]);
  prism(kit, ring, 0, EAVE - 1.6, PINK);
  for (const p of sides(ring, 1.5)) {
    const L = p.length;
    wall(kit, p, [[0, 0], [L, 0], [L, 7.2], [0, 7.2]], { o0: -0.1, o1: 0.25, hex: PINK2 });
    for (const y of [1.8, 3.6, 5.4]) wall(kit, p, [[0, y], [L, y], [L, y + 0.12], [0, y + 0.12]], { o0: 0.25, o1: 0.28, hex: '#c99a87' });
    sweep(kit, p, 0, L, [[-0.1, 7.2], [0.5, 7.2], [0.5, 7.9], [-0.1, 7.9]], SAND, { step: L });
  }
  windows(kit, ring, { bay: 4.2, w: 1.6, y0: 2.4, y1: 5.8, arch: true, hex: DARK, min: 3, skip: (u, v) => v < -55 });
  windows(kit, ring, { bay: 4.2, w: 1.9, y0: 9.4, y1: 15.6, arch: true, hex: DARK, sill: SAND, min: 3, skip: (u, v) => v < -55 });
  windows(kit, ring, { bay: 4.2, w: 1.6, y0: 17, y1: 19.2, hex: DARK, min: 3 });
  cornice(kit, ring, EAVE, SAND, { out: 0.9, h: 1.6, rail: 1.1, railHex: '#efe4d2' });
  // its statues along the balustrade
  for (const p of sides(ring, 12)) for (let s = 5; s < p.length - 3; s += 9) { const q = p.at(s); figure(kit, q.x - q.tz * 0.3, EAVE + 1.2, q.z + q.tx * 0.3, 2.4, '#e8e1d2'); }
  // the hipped roof over the body, and the stage house over its south end
  const body = rect(-21.6, -56.4, 19, 47.6);
  roof(kit, shrink(body, -0.02), rect(-2.2, -42, -0.4, 33), EAVE, EAVE + 7.5, ROOFC);
  const stage = rect(-20, 12, 17.4, 46);
  prism(kit, stage, EAVE, 36, PINK);
  windows(kit, stage, { bay: 4.4, w: 1.6, y0: EAVE + 3, y1: EAVE + 9, arch: true, hex: DARK });
  cornice(kit, stage, 36.6, SAND, { out: 0.7, h: 1.2 });
  roof(kit, shrink(stage, -0.02), shrink(stage, 0.45), 36.6, 41.5, COPPER);
  // the portico on the front, its six columns over the raised ground floor
  const front = linePath(-12.7, -61.2, 9.7, -61.2); // runs east, its right to the north
  for (const s of [4, 11.2, 18.4]) wall(kit, front, archRing(s, 3, 0, 5.6, 8), { o0: -0.1, o1: 0.12, hex: DARK }); // the doors in the raised ground floor under it
  portico(kit, front, 0, 22.4, { n: 6, y0: 7.2, y1: 20.8, r: 0.85, order: 'corinthian', deep: 4.6, rise: 6, steps: 0, hex: SAND, hex2: SAND2 });
  return kit.mesh(kitMat(0.86));
}

export const BEBELPLATZ = [
  ...(ROTUNDA ? [{
    id: 'st-hedwig', name: 'St.-Hedwigs-Kathedrale', x: HX, z: HZ, turn: HTURN, reach: 260,
    area: HEDWIG.map(b => b.p), foot: HEDWIG.filter(b => !b.b).map(b => b.p), make: hedwig,
  }] : []),
  ...(OPERA.length ? [{
    id: 'staatsoper', name: 'Staatsoper Unter den Linden', x: OX, z: OZ, turn: OTURN, reach: 240,
    area: [OPERA], foot: [OPERA], make: staatsoper,
  }] : []),
];
