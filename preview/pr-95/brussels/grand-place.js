// The Grand-Place's other three sides, round the Hôtel de Ville, as fronts standing along the square's
// edges in front of the map's buildings (which have no fronts of their own here), in game metres
// (the real ones times 1.25), with the streets left free at the corners:
//   the Maison du Roi opposite the Hôtel de Ville, rebuilt in Gothic in 1873-95, which the map lacks:
//     its block between the Rue des Harengs and the Rue Chair et Pain, the two arcades one over the
//     other, the windows above, the steep roof and its openwork lantern
//   the guild houses rebuilt in stone after the bombardment of 1695, each with its Baroque gable and
//     its gilding: on the north-west side the Roy d'Espagne with its dome and Fame on top, the
//     Brouette, the Sac, the Louve with its phoenix, the Cornet with its gable like a ship's stern
//     and the Renard; on the south the Étoile, the Cygne and the Arbre d'Or with its gilt horseman
//   on the south-east side the six houses behind one front of the Maison des Ducs de Brabant: giant
//     pilasters, the gilt busts of the dukes, the attic and its pediment
// Each side is a path along the square's edge, the square to its right.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, archRing } from '../core/js/arcade.js';

const X = 125, Z = 5; // the square's middle; the model's metres are the map's from here
const side = (a, b) => linePath(a[0] - X, a[1] - Z, b[0] - X, b[1] - Z);
// a path moved d out from the square (to its left)
const moved = (p, d) => ({ length: p.length, closed: false, at: s => { const q = p.at(s); return { ...q, x: q.x - q.tz * d, z: q.z + q.tx * d }; } });
const SIDES = { roi: moved(side([195, 27], [123, -44]), 14), north: side([96, -75], [51, -30]), brabant: side([150, 67], [195, 27]), south: side([103, 39], [140, 68]) };
const STONE = '#ddd6c6', STONE2 = '#c9c0ab', GREY = '#bdb7ab', DARK = '#2f3033', GOLD = '#d4ad47', SLATE = '#4f555c';

// the guild houses along a side: [name, width, height, gable kind, colour]
const NORTH = [['roy', 13, 25, 'dome', STONE], ['brouette', 8, 23, 'scroll', '#d8cfb9'], ['sac', 8, 24, 'scroll', '#cfc5ae'], ['louve', 8.5, 25, 'phoenix', '#e0d8c5'], ['cornet', 8.5, 26, 'stern', '#d3c9b2'], ['renard', 8, 24, 'scroll', '#d9cfb6']];
const SOUTH = [['arbre-d-or', 12, 26, 'horseman', '#d7cdb4'], ['cygne', 12, 22, 'mansard', '#ddd5c2'], ['etoile', 7, 20, 'scroll', '#d2c8b0']];

export function grandPlace() {
  const kit = new Kit();
  const slab = (p, s0, s1, y1, hex) => wall(kit, p, [[s0, 0], [s1, 0], [s1, y1], [s0, y1]], { o0: -1, o1: 0, hex });
  const at = (p, s, o) => { const q = p.at(s); return [q.x + q.tz * o, q.z - q.tx * o]; };
  const ang = (p, s) => { const q = p.at(s); return Math.atan2(-q.tz, q.tx); };

  // a guild house: its storeys of windows between pilasters, gilt bands, and its gable
  const house = (p, s0, w, h, kind, hex) => {
    const s1 = s0 + w, m = s0 + w / 2, top = h - 6;
    slab(p, s0, s1, top, hex);
    wall(kit, p, [[s0, 0], [s1, 0], [s1, 4.2], [s0, 4.2]], { o0: 0, o1: 0.3, hex: GREY });
    wall(kit, p, archRing(m, Math.min(3.2, w - 3), 0, 3.8, 8), { o0: 0.3, o1: 0.35, hex: '#4a3a2c' });
    const cols = Math.max(2, Math.round(w / 2.8));
    for (const [y0, y1] of [[5.2, 9.4], [10.6, 14.4], [15.4, top - 0.8]]) {
      for (let k = 0; k < cols; k++) {
        const s = s0 + (k + 0.5) * (w / cols);
        wall(kit, p, [[s - 0.6, y0], [s + 0.6, y0], [s + 0.6, y1], [s - 0.6, y1]], { o0: 0, o1: 0.08, hex: DARK });
      }
      for (let k = 0; k <= cols; k++) {
        const s = s0 + k * (w / cols);
        wall(kit, p, [[s - 0.25, y0 - 0.5], [s + 0.25, y0 - 0.5], [s + 0.25, y1 + 0.3], [s - 0.25, y1 + 0.3]], { o0: 0, o1: 0.3, hex: STONE2 });
      }
      wall(kit, p, [[s0, y1 + 0.3], [s1, y1 + 0.3], [s1, y1 + 0.9], [s0, y1 + 0.9]], { o0: 0, o1: 0.45, hex: y1 > 14 ? GOLD : STONE2 });
    }
    // the gable
    if (kind === 'dome') {
      const [x, z] = at(p, m, -4);
      slab(p, s0, s1, top + 2, hex);
      kit.add(new THREE.CylinderGeometry(3.2, 3.6, 3.6, 8), hex, x, top + 3.8, z);
      kit.add(new THREE.SphereGeometry(3.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), SLATE, x, top + 5.6, z);
      kit.add(new THREE.CylinderGeometry(0.4, 0.5, 2.2, 6), GOLD, x, top + 10, z).box(2, 0.3, 0.3, GOLD, x, top + 10.6, z, 0, ang(p, m));
      for (const d of [-w / 2 + 1, w / 2 - 1]) { const [sx, sz] = at(p, m + d, 0.3); kit.add(new THREE.CylinderGeometry(0.3, 0.35, 1.8, 6), GOLD, sx, top + 3, sz); }
    } else if (kind === 'mansard') {
      const [x, z] = at(p, m, -3);
      kit.frustum(w, 6, w - 3, 3, 4, SLATE, x, top, z, ang(p, m));
      const [gx, gz] = at(p, m, 0.5);
      kit.box(1.4, 0.9, 0.5, GOLD, gx, top - 1.4, gz, 0, ang(p, m)); // the swan
    } else {
      // a Baroque gable: stepped in to a narrow top, scrolls at its shoulders, a figure on top
      const g = [[s0, top], [s1, top], [s1, top + 1.5], [s1 - w * 0.2, top + 2], [s1 - w * 0.25, top + 4.5], [m + w * 0.12, top + 5], [m + w * 0.12, top + 6.5], [m, top + 7.2], [m - w * 0.12, top + 6.5], [m - w * 0.12, top + 5], [s0 + w * 0.25, top + 4.5], [s0 + w * 0.2, top + 2], [s0, top + 1.5]];
      if (kind === 'stern') g.splice(5, 5, [m + w * 0.18, top + 6.2], [m, top + 7.4], [m - w * 0.18, top + 6.2]);
      wall(kit, p, g, { o0: -1, o1: 0, hex });
      wall(kit, p, [[m - 0.9, top + 2.2], [m + 0.9, top + 2.2], [m + 0.9, top + 4.2], [m - 0.9, top + 4.2]], { o0: 0, o1: 0.08, hex: DARK });
      for (const d of [-w * 0.22, w * 0.22]) { const [sx, sz] = at(p, m + d, 0.2); kit.add(new THREE.TorusGeometry(0.5, 0.18, 4, 8), STONE2, sx, top + 2.4, sz, 0, ang(p, m)); }
      const [fx, fz] = at(p, m, -0.4);
      if (kind === 'phoenix') kit.box(1.8, 0.9, 0.3, GOLD, fx, top + 8, fz, 0, ang(p, m)).box(0.5, 0.9, 0.5, GOLD, fx, top + 7.4, fz);
      else if (kind === 'horseman') kit.box(2.2, 1, 0.7, GOLD, fx, top + 8.2, fz, 0, ang(p, m)).box(0.6, 1.3, 0.6, GOLD, fx, top + 9.3, fz).box(0.3, 1, 0.3, GOLD, fx - 0.6, top + 7.4, fz).box(0.3, 1, 0.3, GOLD, fx + 0.6, top + 7.4, fz);
      else kit.add(new THREE.CylinderGeometry(0.3, 0.4, 1.6, 6), GOLD, fx, top + 8, fz);
    }
  };
  const row = (p, houses) => {
    let s = start(p, houses);
    for (const [, w, h, kind, hex] of houses) { house(p, s, w, h, kind, hex); s += w; }
  };
  row(SIDES.north, NORTH);
  row(SIDES.south, SOUTH);

  // the Maison des Ducs de Brabant: one front over six houses
  {
    const p = SIDES.brabant, L = p.length, w = 50, s0 = (L - w) / 2, s1 = s0 + w, top = 21;
    slab(p, s0, s1, top + 2, '#d8cfb8');
    wall(kit, p, [[s0, 0], [s1, 0], [s1, 5], [s0, 5]], { o0: 0, o1: 0.3, hex: GREY });
    for (let k = 0; k < 6; k++) wall(kit, p, archRing(s0 + (k + 0.5) * (w / 6), 3, 0, 4.2, 8), { o0: 0.3, o1: 0.35, hex: '#4a3a2c' });
    for (let k = 0; k <= 18; k++) {
      const s = s0 + k * (w / 18);
      wall(kit, p, [[s - 0.45, 5.5], [s + 0.45, 5.5], [s + 0.45, top], [s - 0.45, top]], { o0: 0, o1: 0.5, hex: STONE });
      if (k < 18) for (const [y0, y1] of [[7, 11.5], [13.5, 18.5]]) {
        const sm = s + w / 36;
        wall(kit, p, [[sm - 0.6, y0], [sm + 0.6, y0], [sm + 0.6, y1], [sm - 0.6, y1]], { o0: 0, o1: 0.08, hex: DARK });
      }
      if (k % 3 === 1) { const [x, z] = at(p, s, 0.9); kit.box(0.8, 1.2, 0.6, STONE2, x, 6.1, z).add(new THREE.SphereGeometry(0.42, 8, 6), GOLD, x, 7.1, z); }
    }
    wall(kit, p, [[s0, top], [s1, top], [s1, top + 1.2], [s0, top + 1.2]], { o0: 0, o1: 0.8, hex: STONE2 });
    wall(kit, p, [[s0, top + 1.2], [s1, top + 1.2], [s1, top + 3], [s0, top + 3]], { o0: -0.5, o1: 0.2, hex: STONE });
    wall(kit, p, [[L / 2 - 9, top + 3], [L / 2 + 9, top + 3], [L / 2, top + 8.5]], { o0: -0.5, o1: 0.5, hex: STONE });
    wall(kit, p, [[L / 2 - 3, top + 4.2], [L / 2 + 3, top + 4.2], [L / 2, top + 6.6]], { o0: 0.5, o1: 0.55, hex: GOLD });
    for (const d of [-9, 0, 9]) { const [x, z] = at(p, L / 2 + d, -0.2); kit.add(new THREE.CylinderGeometry(0.35, 0.45, 2, 6), GOLD, x, top + (d ? 4 : 9.5), z); }
  }

  // the Maison du Roi: its two arcades, the windows over them, the roof and its lantern
  {
    const p = SIDES.roi, [s0, s1] = ROI, w = s1 - s0, m = (s0 + s1) / 2, top = 22;
    const [bx, bz] = at(p, m, -9);
    kit.box(w, top, 18, '#d6d0c2', bx, top / 2, bz, 0, ang(p, m));
    const n = 7, bay = w / n;
    wall(kit, p, [[s0, 0], [s1, 0], [s1, 6.5], [s0, 6.5]], { o0: 0, o1: 0.05, hex: '#4a443d' });
    wall(kit, p, [[s0, -0.5], [s1, -0.5], [s1, 7], [s0, 7]], { o0: 0.05, o1: 1.4, hex: STONE, holes: Array.from({ length: n }, (_, k) => pointedRing(s0 + (k + 0.5) * bay, bay - 1.1, -0.3, 6.2, 1, 7)) });
    wall(kit, p, [[s0, 7], [s1, 7], [s1, 13.5], [s0, 13.5]], { o0: 0, o1: 0.05, hex: '#4a443d' });
    wall(kit, p, [[s0, 7], [s1, 7], [s1, 14], [s0, 14]], { o0: 0.05, o1: 1, hex: STONE, holes: Array.from({ length: 2 * n }, (_, k) => pointedRing(s0 + (k + 0.5) * (bay / 2), bay / 2 - 0.7, 8.2, 13.2, 1, 6)) });
    for (let k = 0; k < 2 * n; k++) { const s = s0 + (k + 0.5) * (bay / 2); wall(kit, p, pointedRing(s, 1.4, 15.2, 20.2, 1, 6), { o0: 0, o1: 0.1, hex: DARK }); }
    wall(kit, p, [[s0, top - 0.8], [s1, top - 0.8], [s1, top + 0.8], [s0, top + 0.8]], { o0: 0, o1: 0.8, hex: STONE2 });
    const [rx, rz] = at(p, m, -7);
    kit.frustum(w, 14, w - 6, 0.1, 13, SLATE, rx, top, rz, ang(p, m));
    for (const s of [s0 + 0.6, s1 - 0.6]) { const [x, z] = at(p, s, 0.5); kit.add(new THREE.CylinderGeometry(0.8, 0.8, top + 5, 8), STONE2, x, (top + 5) / 2, z).add(new THREE.ConeGeometry(1, 4, 8), SLATE, x, top + 7, z); }
    const [lx, lz] = at(p, m, -7);
    kit.add(new THREE.CylinderGeometry(2, 2.2, 6, 8), STONE2, lx, top + 15, lz).add(new THREE.ConeGeometry(2.1, 12, 8), SLATE, lx, top + 24, lz).add(new THREE.SphereGeometry(0.3, 6, 4), GOLD, lx, top + 30.3, lz);
  }
  return kit.mesh(kitMat(0.85));
}

// the fronts' feet, a metre deep along their sides
const foot = (p, s0, s1) => {
  const a = p.at(s0), b = p.at(s1), n = [a.tz, -a.tx];
  return [[a.x, a.z], [b.x, b.z], [b.x - n[0], b.z - n[1]], [a.x - n[0], a.z - n[1]]].flatMap(([x, z]) => [x + X, z + Z]);
};
const ROI = [64, 99]; // the Maison du Roi's stretch of its side, between the two streets
// where a row of houses starts along its side: clear of the corner the race leaves the square by
function start(p, houses) { return p === SIDES.north ? 12 : (p.length - houses.reduce((t, h) => t + h[1], 0)) / 2; }
const span = (p, ws) => { const s = start(p, ws); return [s, s + ws.reduce((t, h) => t + h[1], 0)]; };
const block = (p, s0, s1, d) => { const a = p.at(s0), b = p.at(s1); return [[a.x, a.z, 0], [b.x, b.z, 0], [b.x, b.z, d], [a.x, a.z, d]].flatMap(([x, z, o]) => [x - a.tz * o + X, z + a.tx * o + Z]); };

export const GRAND_PLACE = [{
  id: 'grand-place', name: 'Grand-Place', x: X, z: Z, reach: 110, area: [],
  foot: [foot(SIDES.north, ...span(SIDES.north, NORTH)), foot(SIDES.south, ...span(SIDES.south, SOUTH)), foot(SIDES.brabant, (SIDES.brabant.length - 50) / 2, (SIDES.brabant.length + 50) / 2), block(SIDES.roi, ...ROI, 18)],
  make: grandPlace,
}];
