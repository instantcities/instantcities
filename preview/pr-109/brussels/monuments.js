// Four more of Brussels's landmarks, modelled by hand in game metres (the real ones times 1.25):
//   the Bourse (1868-73) on the Place de la Bourse, in place of the map's block of it: its portico of
//     six Corinthian columns over the wide stair with the lions, the pediment, the dome over the middle
//     with its sculpture, the arched windows between pilasters, the mansards at the corners
//   the west front of the Cathedral of Saints Michael and Gudula, in place of the map's two blocks of
//     its towers: the two square towers with their tall lancets and their flat tops behind
//     balustrades and pinnacles, and between them the gable with its great window over three portals
//   the Galeries Royales Saint-Hubert (1847) along the map's gallery streets, in place of the map's
//     blocks over them: the two sides' shopfronts in round arches, the pilastered storeys over them
//     and the cornice, the glass vault on its iron ribs, and the entrance with its pediment on the
//     Rue du Marché aux Herbes
//   the Manneken Pis at the corner of the Rue de l'Étuve and the Rue du Chêne, in his niche over the
//     basin behind its railing
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, archRing, onMap, rect } from '../core/js/arcade.js';
import { MAP } from './map.js';

const STONE = '#ddd6c6', STONE2 = '#cac1ad', SLATE = '#4f565d', DARK = '#2f3033', GOLD = '#d3ac47', BRONZE = '#4d4232';
const mid = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
const find = (test, x, z, r = 3) => MAP.buildings.filter(b => test(b) && Math.hypot(mid(b.p)[0] - x, mid(b.p)[1] - z) < r).map(b => b.p);

// ------------------------------------------------------------------ the Bourse

// its middle, and its turn: local -x is its front towards the Place, local z along it
const BX = -64.9, BZ = -173.2, BTURN = -0.578, BHX = 52.6, BHZ = 27.8, BH = 22;

export function bourse() {
  const kit = new Kit();
  kit.box(2 * BHX, BH, 2 * BHZ, STONE, 0, BH / 2, 0);
  kit.box(2 * BHX + 1, 1.4, 2 * BHZ + 1, STONE2, 0, BH, 0);
  kit.box(2 * BHX - 6, 1, 2 * BHZ - 6, SLATE, 0, BH + 1, 0);
  // the mansards at the corners
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.frustum(14, 14, 7, 7, 8, SLATE, sx * (BHX - 7), BH + 0.7, sz * (BHZ - 7));
  // the arched windows and pilasters round its sides
  for (const [px, pz, len, along] of [[-BHX, 0, 2 * BHZ, 'z'], [BHX, 0, 2 * BHZ, 'z'], [0, -BHZ, 2 * BHX, 'x'], [0, BHZ, 2 * BHX, 'x']]) {
    const n = Math.floor(len / 5);
    for (let k = 0; k < n; k++) {
      const t = -len / 2 + (k + 0.5) * (len / n);
      for (const [y, h] of [[6, 6], [15, 5]]) {
        const [x, z] = along === 'z' ? [px + Math.sign(px) * 0.15, t] : [t, pz + Math.sign(pz) * 0.15];
        kit.box(along === 'z' ? 0.3 : 2, h, along === 'z' ? 2 : 0.3, DARK, x, y, z);
        kit.add(new THREE.CylinderGeometry(1, 1, 0.3, 8, 1, false, 0, Math.PI), DARK, x, y + h / 2, z, 0, along === 'z' ? 0 : Math.PI / 2, Math.PI / 2);
      }
      const [x, z] = along === 'z' ? [px + Math.sign(px) * 0.3, t + len / n / 2] : [t + len / n / 2, pz + Math.sign(pz) * 0.3];
      if (k < n - 1) kit.box(along === 'z' ? 0.6 : 1, BH - 2, along === 'z' ? 1 : 0.6, STONE2, x, BH / 2, z);
    }
  }
  // the stair, the portico, its pediment and the lions
  for (let k = 0; k < 6; k++) kit.box(10 - k * 1.2, 0.5, 40, STONE2, -BHX - 5 + k * 0.6, 0.25 + k * 0.5, 0);
  kit.box(8, 1, 32, STONE, -BHX - 3, 3.2, 0);
  for (let k = 0; k < 6; k++) {
    const z = -12.5 + k * 5;
    kit.add(new THREE.CylinderGeometry(0.9, 1, 15, 12), '#eee8db', -BHX - 5, 3.7 + 7.5, z);
    kit.add(new THREE.CylinderGeometry(1.3, 0.9, 1.4, 8), '#eee8db', -BHX - 5, 19.9, z);
  }
  kit.box(8.4, 2.4, 33, STONE2, -BHX - 3, 21.8, 0);
  const ped = new THREE.Shape([new THREE.Vector2(-17, 0), new THREE.Vector2(17, 0), new THREE.Vector2(0, 6.5)]);
  kit.add(new THREE.ExtrudeGeometry(ped, { depth: 1.4, bevelEnabled: false }), STONE, -BHX - 7.2, 23, 0, 0, -Math.PI / 2);
  kit.add(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-12, 0), new THREE.Vector2(12, 0), new THREE.Vector2(0, 4.5)]), { depth: 0.3, bevelEnabled: false }), '#c9bfa8', -BHX - 7.3, 23.6, 0, 0, -Math.PI / 2);
  for (const z of [-17, 17]) {
    kit.box(4, 2, 2.6, STONE2, -BHX - 9, 1, z).box(3, 1.5, 1.6, BRONZE, -BHX - 9, 2.75, z).box(1, 1.3, 1.2, BRONZE, -BHX - 10.2, 3.6, z);
  }
  // the dome over the middle, and the group on top of it
  kit.box(18, 6, 18, STONE, 0, BH + 3, 0);
  kit.add(new THREE.SphereGeometry(9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), SLATE, 0, BH + 6, 0);
  kit.add(new THREE.CylinderGeometry(1.4, 2, 3, 8), STONE2, 0, BH + 16, 0).add(new THREE.SphereGeometry(1.2, 8, 6), '#e8e1d0', 0, BH + 18.4, 0);
  for (const z of [-12.5, 12.5]) kit.add(new THREE.CylinderGeometry(0.4, 0.5, 2.4, 6), '#e8e1d0', -BHX - 2, BH + 3, z);
  return kit.mesh(kitMat(0.85));
}

// ------------------------------------------------------------------ the cathedral's west front

const CX = 711.5, CZ = -157.7, CTURN = 0.03; // the front's middle; its outside is local -x
const TOWERS = [[8.6, -14.9], [7.5, 14.9]]; // the towers' middles from there

export function cathedrale() {
  const kit = new Kit(), TH = 80;
  for (const [x, z] of TOWERS) {
    kit.box(17, TH - 3, 16, '#d8d0bd', x, (TH - 3) / 2, z);
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      kit.box(1.8, TH - 1, 1.8, STONE2, x + sx * 8, (TH - 1) / 2, z + sz * 7.5);
      kit.add(new THREE.ConeGeometry(1.1, 6, 4).rotateY(Math.PI / 4), STONE2, x + sx * 8, TH + 2, z + sz * 7.5);
    }
    // the lancets up its west face, the belfry's pair near the top, the balustrade round its flat top
    const face = linePath(x - 8.55, z + 6.5, x - 8.55, z - 6.5);
    for (const [y0, y1] of [[22, 34], [38, 52]]) wall(kit, face, pointedRing(6.5, 4, y0, y1, 1.1, 6), { o0: 0, o1: 0.1, hex: DARK });
    for (const s of [3.8, 9.2]) wall(kit, face, pointedRing(s, 2.6, 56, 72, 1.2, 6), { o0: 0, o1: 0.1, hex: DARK });
    for (const y of [20, 36, 54]) kit.box(17.6, 0.8, 16.6, STONE2, x, y, z);
    kit.box(17.8, 2, 16.8, STONE2, x, TH - 2, z).box(16, 0.4, 14.6, SLATE, x, TH - 2.8, z);
  }
  // between the towers: the front's wall, three portals, the great window, the gable
  const f = linePath(0, 7, 0, -7);
  wall(kit, f, [[0, 0], [14, 0], [14, 36], [7, 46], [0, 36]], { o0: -1, o1: 0, hex: '#d8d0bd' });
  wall(kit, f, pointedRing(7, 6.4, 0, 12, 1, 8), { o0: 0, o1: 0.6, hex: STONE2 });
  wall(kit, f, pointedRing(7, 5, 0, 11, 1, 8), { o0: 0.6, o1: 0.65, hex: '#3b2f28' });
  wall(kit, f, pointedRing(7, 10, 15, 34, 1, 10), { o0: 0, o1: 0.15, hex: '#2c3550' });
  for (const s of [4.6, 7, 9.4]) wall(kit, f, [[s - 0.15, 15], [s + 0.15, 15], [s + 0.15, 28], [s - 0.15, 28]], { o0: 0.15, o1: 0.3, hex: STONE2 });
  kit.add(new THREE.ConeGeometry(0.6, 3.6, 6), STONE2, -0.4, 47.5, 0);
  for (const [x, z] of TOWERS) wall(kit, linePath(x - 8.6, z + 6.5, x - 8.6, z - 6.5), pointedRing(6.5, 4, 0, 9, 1, 6), { o0: 0, o1: 0.5, hex: STONE2 });
  return kit.mesh(kitMat(0.85));
}

// ------------------------------------------------------------------ the Galeries Royales Saint-Hubert

const GALLERY = [[276, -24], [279, -30], [329, -136], [333, -143], [337, -152], [342, -160], [360, -188], [384, -226], [391, -237], [400, -251]];
const PRINCES = [[360, -188], [306, -224], [301, -228]];
const GX = 330, GZ = -140, GW = 5, GY = 15.5;

export function galeries() {
  const kit = new Kit();
  const vault = (pts, trims) => {
    for (let i = 0; i + 1 < pts.length; i++) {
      const [ax, az] = [pts[i][0] - GX, pts[i][1] - GZ], [bx, bz] = [pts[i + 1][0] - GX, pts[i + 1][1] - GZ];
      const L = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / L, tz = (bz - az) / L, ang = Math.atan2(-tz, tx);
      const glass = new THREE.CylinderGeometry(GW, GW, L, 12, 1, true, 0, Math.PI).rotateZ(Math.PI / 2);
      kit.add(glass, '#c9dde3', (ax + bx) / 2, GY, (az + bz) / 2, 0, ang);
      kit.add(glass.clone().scale(1, 1, -1), '#b9d2da', (ax + bx) / 2, GY, (az + bz) / 2, 0, ang); // seen from under it
      for (let s = 0; s < L; s += 2.6) kit.add(new THREE.TorusGeometry(GW, 0.12, 4, 12, Math.PI), '#4a4f52', ax + tx * s, GY, az + tz * s, 0, ang + Math.PI / 2);
      // the two sides: a block each, its shopfronts and storeys towards the gallery, its cornice
      const [t0, t1] = trims(i, L);
      if (t1 - t0 < 3) continue;
      for (const side of [-1, 1]) {
        const nx = tz * side, nz = -tx * side, m = (t0 + t1) / 2, len = t1 - t0;
        const cx = ax + tx * m, cz = az + tz * m;
        kit.box(len, GY, 10, '#e2dacb', cx + nx * (GW + 5), GY / 2, cz + nz * (GW + 5), 0, ang);
        kit.box(len, 0.8, 1.2, STONE2, cx + nx * (GW + 0.2), GY - 0.4, cz + nz * (GW + 0.2), 0, ang);
        const n = Math.floor(len / 4);
        for (let k = 0; k < n; k++) {
          const s = t0 + (k + 0.5) * (len / n), x = ax + tx * s + nx * (GW - 0.05), z = az + tz * s + nz * (GW - 0.05);
          kit.box(2.8, 3.6, 0.2, '#5b4a3a', x, 1.8, z, 0, ang).add(new THREE.CylinderGeometry(1.4, 1.4, 0.2, 10, 1, false, 0, Math.PI), '#5b4a3a', x, 3.6, z, 0, ang + Math.PI / 2, Math.PI / 2);
          kit.box(2.4, 2.6, 0.2, '#93b4c0', x, 1.9, z, 0, ang);
          for (const y of [8, 12.2]) kit.box(1.6, 2.8, 0.2, DARK, x, y, z, 0, ang);
          const px = ax + tx * (s + len / n / 2) + nx * (GW - 0.2), pz = az + tz * (s + len / n / 2) + nz * (GW - 0.2);
          if (k < n - 1) kit.box(0.6, GY - 1, 0.4, STONE2, px, (GY - 1) / 2, pz, 0, ang);
        }
      }
    }
  };
  // the sides stop short of the corners, and well short where the Galerie des Princes leaves
  const JOIN = 6;
  vault(GALLERY, (i, L) => [i === 6 ? JOIN + 2 : 1.5, i === 5 ? L - JOIN - 2 : L - 1.5]);
  vault(PRINCES, (i, L) => [i === 0 ? JOIN + 2 : 1.5, L - 1.5]);
  // the entrance on the Rue du Marché aux Herbes: the arch through its front, the columns, the pediment
  const [ex, ez] = [GALLERY[0][0] - GX, GALLERY[0][1] - GZ], dx = GALLERY[1][0] - GALLERY[0][0], dz = GALLERY[1][1] - GALLERY[0][1], dl = Math.hypot(dx, dz);
  const ux = dz / dl, uz = -dx / dl, front = linePath(ex + ux * 9, ez + uz * 9, ex - ux * 9, ez - uz * 9); // its outside, up the street, to the right
  wall(kit, front, [[0, -0.5], [18, -0.5], [18, 22], [0, 22]], { o0: -1.2, o1: 0, hex: '#e5ddca', holes: [archRing(9, 2 * GW - 1, -0.3, 14, 14)] });
  for (const d of [-7, -5.6, 5.6, 7]) kit.add(new THREE.CylinderGeometry(0.4, 0.45, 14, 8), '#f1ecdf', ex + ux * d - (dx / dl) * 0.6, 7, ez + uz * d - (dz / dl) * 0.6);
  const ped = new THREE.Shape([new THREE.Vector2(-9.5, 0), new THREE.Vector2(9.5, 0), new THREE.Vector2(0, 3.6)]);
  kit.add(new THREE.ExtrudeGeometry(ped, { depth: 1.6, bevelEnabled: false }), STONE, ex - (dx / dl) * 1, 22, ez - (dz / dl) * 1, 0, Math.atan2(-dz, dx) + Math.PI / 2);
  return kit.mesh(kitMat(0.7, 0.1));
}

// ------------------------------------------------------------------ the Manneken Pis

const MX = -105, MZ = 238.5, MTURN = 0; // against the corner house (local +x), looking west at the crossing

export function mannekenPis() {
  const kit = new Kit();
  // the niche in the corner, the basin, the shell, the boy, the railing
  kit.box(1, 6, 4, '#bfb6a0', 0.6, 3, 0).box(0.4, 3.4, 2.4, '#8f8573', 0.05, 3.2, 0);
  kit.add(new THREE.CylinderGeometry(1.5, 1.3, 1.1, 12, 1, false, Math.PI, Math.PI), '#cfc7b4', -0.1, 0.55, 0);
  kit.box(0.8, 0.6, 1, '#cfc7b4', -0.2, 2.2, 0);
  kit.add(new THREE.CylinderGeometry(0.18, 0.2, 0.55, 8), BRONZE, -0.3, 2.85, 0).add(new THREE.SphereGeometry(0.15, 8, 6), BRONZE, -0.3, 3.25, 0);
  for (const s of [-1, 1]) kit.rod([-0.3, 2.55, s * 0.08], [-0.3, 2.15, s * 0.1], 0.06, BRONZE, 4);
  kit.rod([-0.45, 2.6, 0], [-1.3, 1.1, 0], 0.025, '#bfe0ef', 4); // the stream
  for (let k = 0; k <= 10; k++) {
    const a = Math.PI / 2 + (k / 10) * Math.PI, x = 2.6 * Math.cos(a) + 0.3, z = 2.6 * Math.sin(a);
    kit.rod([x, 0, z], [x, 1.2, z], 0.04, '#24272a', 4);
  }
  kit.add(new THREE.TorusGeometry(2.6, 0.05, 4, 16, Math.PI), '#24272a', 0.3, 1.2, 0, Math.PI / 2, 0, Math.PI / 2);
  return kit.mesh(kitMat(0.7));
}

// the map's blocks over the gallery streets, and the two sides' feet along them
const onGallery = (x, z) => [GALLERY, PRINCES].some(pts => pts.slice(1).some((b, i) => {
  const a = pts[i], L2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2, t = Math.max(0, Math.min(1, ((x - a[0]) * (b[0] - a[0]) + (z - a[1]) * (b[1] - a[1])) / L2));
  return Math.hypot(x - a[0] - t * (b[0] - a[0]), z - a[1] - t * (b[1] - a[1])) < 1.5;
}));
const GALLERY_BLOCKS = MAP.buildings.filter(b => b.k !== 'part' && onGallery(...mid(b.p))).map(b => b.p);
const GALLERY_SIDES = [[GALLERY, (i, L) => [i === 6 ? 8 : 1.5, i === 5 ? L - 8 : L - 1.5]], [PRINCES, (i, L) => [i === 0 ? 8 : 1.5, L - 1.5]]].flatMap(([pts, trims]) => pts.slice(1).flatMap((b, i) => {
  const a = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), tx = (b[0] - a[0]) / L, tz = (b[1] - a[1]) / L, [t0, t1] = trims(i, L);
  if (t1 - t0 < 3) return [];
  return [-1, 1].map(side => {
    const nx = tz * side, nz = -tx * side;
    return [[t0, GW], [t1, GW], [t1, GW + 10], [t0, GW + 10]].flatMap(([t, o]) => [a[0] + tx * t + nx * o, a[1] + tz * t + nz * o]);
  });
}));
const BOURSE = find(b => b.k === 'public', BX, BZ, 4), CATHEDRAL_TOWERS = find(b => b.k === 'part' && b.h === 80, 719.5, -157.7, 18);
export const BRUSSELS_MONUMENTS = [
  { id: 'bourse', name: 'Bourse', x: BX, z: BZ, turn: BTURN, reach: 90, area: BOURSE, foot: [onMap(BX, BZ, BTURN, rect(-BHX - 10, -BHZ, BHX, BHZ))], make: bourse },
  { id: 'cathedrale', name: 'Cathédrale des Saints-Michel-et-Gudule', x: CX, z: CZ, turn: CTURN, reach: 70, area: CATHEDRAL_TOWERS, foot: TOWERS.map(([x, z]) => onMap(CX, CZ, CTURN, rect(x - 9.5, z - 8.5, x + 9, z + 8.5))).concat([onMap(CX, CZ, CTURN, rect(-1, -7, 0.5, 7))]), make: cathedrale },
  { id: 'galeries-saint-hubert', name: 'Galeries Royales Saint-Hubert', x: GX, z: GZ, reach: 160, area: GALLERY_BLOCKS, foot: GALLERY_SIDES, make: galeries },
  { id: 'manneken-pis', name: 'Manneken Pis', x: MX, z: MZ, turn: MTURN, reach: 25, area: [], foot: [onMap(MX, MZ, MTURN, rect(-1.3, -2.7, 1, 2.7))], make: mannekenPis },
];
