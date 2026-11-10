// The Berliner Dom (Raschdorff, 1894-1905), modelled by hand in place of the map's stack of prisms
// of it, from its measurements and photos, in game metres (the real ones times 1.25), on the map's
// outlines of its parts: a church of grey Silesian sandstone on the Lustgarten, its great dome to
// 98 m.
//   the body with its rusticated ground floor, the tall round-headed windows over it between
//     pilasters, the cornice and balustrade; the lower parts round it a storey high
//   the west front to the Lustgarten: the big arched portal in the middle, the two pairs of
//     Corinthian columns on their tall pedestals either side of it, the attics over them with their
//     statues, and the two statues before them
//   the drum: a ring of columns before its arched windows, its balustrade; the dome of green
//     copper over it with its ribs, and the lantern on top with its gilded orb and cross
//   the four corner towers: the two in front with their arched openings, their copper domes and
//     lanterns, the two lower ones behind
// The model's own metres: +u runs east along the axis from the front to the apse, +v across it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, sweep, linePath, column, archRing } from '../core/js/arcade.js';
import { buildings, nearest, local, box, sides, prism, roof, shrink, cornice, windows, dome as cupola, colonnade, drum, lantern, figure } from './outline.js';

const X = 1323.8, Z = -591.6, TURN = 0.56; // the dome's middle, and the axis turned from east
const MAIN = nearest('part', 1312.2, -590, 4)?.p ?? [];
const PARTS = MAIN.length ? buildings('part', X, Z, 72).filter(b => b.p !== MAIN) : [];
const STONE = '#cdc6b3', STONE2 = '#b8b09c', DARK = '#2f3337', COPPER = '#6f9d88', COPPER2 = '#5d8a76', GOLD = '#d2b04f', ROOFC = '#7c8a84';
const BODY = 33.6; // the body's cornice; its balustrade up to 35, where the map's upper parts start

const kind = b => {
  const lo = b.b ?? 0, n = b.p.length / 2;
  if (lo > 90) return 'lantern';
  if (lo > 60) return 'dome';
  if (lo > 50) return 'towerdome';
  if (lo >= 35 && b.h > 60) return 'drum';
  if (lo >= 35 && b.h > 50) return 'tower';
  if (lo > 40 && n > 12) return 'reardome';
  if (lo >= 35 && b.h < 42 && n <= 10 && local(b.p, X, Z, TURN)[0][0] > 20) return 'reartower'; // behind, at the apse end
  if (lo >= 39) return 'statue';
  if (lo >= 35) return 'attic';
  if (lo > 30) return 'entablature';
  if (lo > 10) return 'column';
  if (b.h < 11 && n <= 6) return 'plinth';
  return 'low';
};

// a path along the front at u from v1 to v0, its right (its face) to -u
const front = (u, v0, v1) => linePath(u, v1, u, v0); // runs to -v, its right to -u

export function dom() {
  const kit = new Kit(), ring = local(MAIN, X, Z, TURN);
  // the body
  prism(kit, ring, 0, BODY, STONE);
  for (const path of sides(ring, 1.5)) {
    const L = path.length;
    wall(kit, path, [[0, 0], [L, 0], [L, 10], [0, 10]], { o0: -0.1, o1: 0.3, hex: STONE2 });
    sweep(kit, path, 0, L, [[-0.1, 10], [0.6, 10], [0.6, 10.9], [-0.1, 10.9]], STONE2, { step: L });
  }
  windows(kit, ring, { bay: 6.5, w: 1.8, y0: 3.2, y1: 7.6, hex: DARK, min: 4, skip: u => u < -42 });
  windows(kit, ring, { bay: 6.5, w: 3, y0: 13.5, y1: 27, arch: true, hex: DARK, sill: STONE2, min: 4, skip: u => u < -42 });
  for (const path of sides(ring, 4)) {
    const L = path.length, n = Math.max(1, Math.floor(L / 6.5));
    for (let k = 0; k <= n; k++) column(kit, path, Math.min(Math.max((k * L) / n, 0.5), L - 0.5), 0.3, 10.9, BODY - 2.2, 0.5, STONE, 'pilaster');
  }
  cornice(kit, ring, BODY, STONE2, { out: 1, h: 2.2, rail: 1.2, railHex: STONE });
  prism(kit, shrink(ring, 0.02), BODY - 0.4, BODY + 0.4, ROOFC);
  // the portal: the big arch in the middle of the front, its frame and the doors at its foot
  const portal = front(-44.4, -8, 8);
  wall(kit, portal, archRing(8, 13, 0, 29, 14), { o0: -0.1, o1: 0.35, hex: STONE2 });
  wall(kit, portal, archRing(8, 11, 0, 27.6, 14), { o0: -0.1, o1: 0.5, hex: '#454a4e' });
  wall(kit, portal, archRing(8, 5.2, 0, 9, 8), { o0: -0.1, o1: 0.6, hex: '#3a2f26' });
  wall(kit, portal, archRing(8, 8.4, 11.5, 24, 10), { o0: -0.1, o1: 0.6, hex: '#2b3036' }); // the window over the doors
  for (const b of PARTS) {
    const r = local(b.p, X, Z, TURN), bx = box(r), lo = b.b ?? 0, h = b.h;
    switch (kind(b)) {
      case 'drum': {
        // the drum behind its ring of columns, the entablature and balustrade over them
        drum(kit, bx.u, bx.v, bx.r - 2.4, lo, h, STONE, { n: 32, win: 16, w: 3.2, wy0: 5, wy1: 18.5 });
        colonnade(kit, bx.u, bx.v, bx.r - 1, 32, lo + 1.2, h - 6.6, 0.75, STONE, { ent: 1.8, entHex: STONE2 });
        kit.add(new THREE.CylinderGeometry(bx.r - 0.2, bx.r - 0.2, 1.2, 32), STONE2, bx.u, lo + 0.6, bx.v);
        kit.add(new THREE.CylinderGeometry(bx.r - 0.2, bx.r - 0.2, 1.6, 32, 1, true), STONE, bx.u, h - 4, bx.v);
        kit.add(new THREE.CylinderGeometry(bx.r - 3.2, bx.r - 2.4, 2.6, 32), STONE2, bx.u, h - 1.3, bx.v);
        break;
      }
      case 'dome':
        cupola(kit, bx.u, bx.v, bx.r, lo, h - lo, COPPER, { n: 32, rows: 10, ribs: 8, ribHex: COPPER2 });
        // the round dormers low on the dome, between the ribs
        for (let k = 0; k < 8; k++) {
          const a = ((k + 0.5) / 8) * Math.PI * 2, rr = bx.r * 0.93;
          kit.add(new THREE.CylinderGeometry(1.1, 1.1, 1.2, 10).rotateZ(Math.PI / 2).rotateY(-a), GOLD, bx.u + rr * Math.cos(a), lo + (h - lo) * 0.33, bx.v + rr * Math.sin(a));
        }
        break;
      case 'lantern':
        lantern(kit, bx.u, bx.v, bx.r, lo + 1, 14, 121, STONE, COPPER, GOLD);
        break;
      case 'tower': {
        prism(kit, r, BODY, h - 1.5, STONE);
        for (const path of sides(r, 4)) {
          const L = path.length;
          wall(kit, path, archRing(L / 2, L * 0.36, BODY + 3, h - 5, 10), { o0: -0.1, o1: 0.08, hex: DARK });
          for (const s of [0.8, L - 0.8]) column(kit, path, s, 0.35, BODY + 0.6, h - 2.4, 0.55, STONE, 'corinthian');
        }
        cornice(kit, r, h, STONE2, { out: 0.8, h: 1.6 });
        break;
      }
      case 'towerdome':
        drum(kit, bx.u, bx.v, bx.r * 0.82, lo, lo + 2.4, STONE, { n: 16 });
        cupola(kit, bx.u, bx.v, bx.r * 0.82, lo + 2.4, h - lo + 1, COPPER, { n: 16, rows: 6, ribs: 8, ribHex: COPPER2 });
        lantern(kit, bx.u, bx.v, 1.3, h + 2.6, 3.4, h + 11, STONE, COPPER, GOLD);
        break;
      case 'reartower':
        prism(kit, r, BODY, h - 1, STONE);
        for (const path of sides(r, 4)) wall(kit, path, archRing(path.length / 2, 2.4, BODY + 1.2, h - 2.4, 8), { o0: -0.1, o1: 0.08, hex: DARK });
        cornice(kit, r, h, STONE2, { out: 0.6, h: 1.1 });
        break;
      case 'reardome':
        cupola(kit, bx.u, bx.v, bx.r * 0.9, lo, h - lo + 1, COPPER, { n: 16, rows: 6, ribs: 8, ribHex: COPPER2 });
        lantern(kit, bx.u, bx.v, 0.9, h + 0.9, 2.2, h + 6.5, STONE, COPPER, GOLD);
        break;
      case 'attic':
        prism(kit, r, BODY, h - 0.8, STONE);
        cornice(kit, r, h, STONE2, { out: 0.6, h: 1.1 });
        break;
      case 'statue':
        figure(kit, bx.u, lo - 0.4, bx.v, h - lo + 3.2, '#a9a291');
        break;
      case 'entablature':
        prism(kit, r, lo, h - 0.8, STONE2);
        cornice(kit, r, h, STONE2, { out: 0.7, h: 1 });
        break;
      case 'column':
        column(kit, linePath(bx.u, bx.v + 1, bx.u, bx.v - 1), 1, 0, lo, h, Math.min(bx.du, bx.dv) / 2, STONE, 'corinthian');
        break;
      case 'plinth':
        prism(kit, r, 0, 4.6, STONE2);
        figure(kit, bx.u, 4.6, bx.v, h - 4.6, '#9e9887');
        break;
      default:
        // the lower parts round the body, a storey or two high
        prism(kit, r, 0, h - 1, lo > 0 ? STONE2 : STONE);
        if (bx.du > 5 && bx.dv > 5) windows(kit, r, { bay: 5.5, w: 1.8, y0: 4, y1: h - 5, arch: true, hex: DARK, min: 4 });
        cornice(kit, r, h, STONE2, { out: 0.6, h: 1.2 });
        if (bx.du > 8 && bx.dv > 8) roof(kit, shrink(r, -0.01), shrink(r, 0.5), h, h + 2.5, ROOFC);
    }
  }
  return kit.mesh(kitMat(0.84, 0.05));
}

export const DOM = [{
  id: 'berliner-dom', name: 'Berliner Dom', x: X, z: Z, turn: TURN, reach: 420,
  area: [MAIN, ...PARTS.map(b => b.p)].filter(p => p.length),
  foot: MAIN.length ? [MAIN, ...PARTS.filter(b => !b.b).map(b => b.p)] : [], // the body, and the parts that stand on the ground round it
  make: dom,
}];
