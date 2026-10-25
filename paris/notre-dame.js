// Notre-Dame de Paris (1163-1345, its spire Viollet-le-Duc's, rebuilt after the fire of 2019),
// modelled by hand in place of the map's pieces of it, from its measurements and photos, in game
// metres (the real ones times 1.25), on the map's outline: 150 m from its front to its apse, its
// towers 86 m and its spire 120 m.
//   the west front: its three deep portals, the Gallery of Kings over them, the great rose between
//     the towers' paired windows, the open gallery of the chimeras, and the two towers with their
//     tall belfry openings
//   the nave between its aisles and chapels, its clerestory and lead roof, the transept with a rose
//     at each end, the choir and the round apse
//   the flying buttresses, a row of them down each side and fanning round the apse, each from a
//     pinnacled pier over the aisles to the nave's wall
//   the spire over the crossing, of lead on its oak frame
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep, gable, pointedRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = 321, Z = 505.3, TURN = -0.431; // the middle of the map's outline, and its axis turned from east (local +x to the apse)
const FRONT = -77, TOWERS = -54, CROSS = [2, 19.2], APSE = 58, END = 71; // along it
const NAVE = 8.6, AISLES = 17.6, CHAPELS = 25, TRANSEPT = 29.8; // half widths
const EAVES = 41.3, RIDGE = 56.3, TOWER = 86.3, SPIRE = 120;
const STONE = '#ddd3bb', STONE2 = '#cfc4a9', LEAD = '#7c8388', DARK = '#2f3134', GLASS = '#3d4a63';

// a rose window at s on the path, its middle at y, r across: the frame, the glass, the tracery
function rose(kit, path, s, y, r, o) {
  const ring = n => Array.from({ length: 32 }, (_, k) => [s + n * Math.cos((k / 32) * 2 * Math.PI), y + n * Math.sin((k / 32) * 2 * Math.PI)]);
  wall(kit, path, ring(r + 0.8), { o0: o, o1: o + 0.3, hex: STONE2 });
  wall(kit, path, ring(r), { o0: o + 0.3, o1: o + 0.35, hex: GLASS });
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, c = Math.cos(a), d = Math.sin(a);
    wall(kit, path, [[s + 0.6 * c - 0.12 * d, y + 0.6 * d + 0.12 * c], [s + r * c - 0.12 * d, y + r * d + 0.12 * c], [s + r * c + 0.12 * d, y + r * d - 0.12 * c], [s + 0.6 * c + 0.12 * d, y + 0.6 * d - 0.12 * c]], { o0: o + 0.35, o1: o + 0.45, hex: STONE2 });
  }
  wall(kit, path, ring(1), { o0: o + 0.35, o1: o + 0.5, hex: STONE2 });
}

// a flying buttress at u across from the pier at v1 (its top at y1) to the wall at v0 (at y0)
function flyer(kit, u, v1, y1, v0, y0) {
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(u, y1, v1), new THREE.Vector3(u, y0 + 1.6, (v0 + v1) / 2 + Math.sign(v1) * 2), new THREE.Vector3(u, y0, v0));
  kit.add(new THREE.TubeGeometry(curve, 8, 0.55, 4, false), STONE);
}

export function notreDame() {
  const kit = new Kit();
  // the aisles and chapels along both sides of nave and choir, their windows, and the flyers
  for (const side of [-1, 1]) {
    const path = side < 0 ? linePath(TOWERS, -CHAPELS, APSE, -CHAPELS) : linePath(APSE, CHAPELS, TOWERS, CHAPELS), len = path.length;
    const bays = 13, bay = len / bays, holes = [];
    for (let b = 0; b < bays; b++) {
      const s = (b + 0.5) * bay;
      if (Math.abs((side < 0 ? TOWERS + s : APSE - s) - (CROSS[0] + CROSS[1]) / 2) > 10) holes.push(pointedRing(s, 3.4, 5, 16, 1, 6));
    }
    wall(kit, path, [[0, 0], [len, 0], [len, 19], [0, 19]], { holes, o0: -1, o1: 0, hex: STONE });
    for (const h of holes) wall(kit, path, h, { o0: -0.9, o1: -0.8, hex: GLASS });
    sweep(kit, path, 0, len, [[-0.2, 18.4], [0.5, 18.4], [0.5, 19.4], [-0.2, 19.4]], STONE2, { step: len });
    for (let b = 0; b <= bays; b++) {
      const u = TOWERS + b * bay;
      if (u > CROSS[0] - 1 && u < CROSS[1] + 1) continue;
      kit.box(2.2, 30, 2.2, STONE2, u, 15, side * (CHAPELS + 1.1));
      kit.add(new THREE.ConeGeometry(1.3, 5, 4).rotateY(Math.PI / 4), STONE2, u, 32.5, side * (CHAPELS + 1.1));
      flyer(kit, u, side * (CHAPELS + 0.6), 28, side * (NAVE + 0.6), 36);
    }
  }
  // the aisles' roofs, the nave's and choir's walls with the clerestory, and the lead roof
  for (const side of [-1, 1]) {
    gable(kit, TOWERS, APSE, CHAPELS - NAVE, 19, 26, LEAD, { z: side * ((CHAPELS + NAVE) / 2), turn: 0 });
    const path = side < 0 ? linePath(TOWERS, -NAVE, APSE, -NAVE) : linePath(APSE, NAVE, TOWERS, NAVE), len = path.length;
    const holes = [];
    for (let b = 0; b < 13; b++) {
      const s = (b + 0.5) * (len / 13), u = side < 0 ? TOWERS + s : APSE - s;
      if (u < CROSS[0] - 2 || u > CROSS[1] + 2) holes.push(pointedRing(s, 2.6, 28, 38, 1, 6));
    }
    wall(kit, path, [[0, 19], [len, 19], [len, EAVES], [0, EAVES]], { holes, o0: -1, o1: 0, hex: STONE });
    for (const h of holes) wall(kit, path, h, { o0: -0.9, o1: -0.8, hex: GLASS });
    sweep(kit, path, 0, len, [[-0.2, EAVES - 0.8], [0.6, EAVES - 0.8], [0.6, EAVES], [-0.2, EAVES]], STONE2, { step: len });
  }
  gable(kit, TOWERS, APSE, NAVE + 0.6, EAVES, RIDGE, LEAD);
  // the transept, its two roses and gables, its roof
  for (const side of [-1, 1]) {
    const v = side * TRANSEPT, path = side < 0 ? linePath(CROSS[1], v, CROSS[0], v) : linePath(CROSS[0], v, CROSS[1], v), len = path.length;
    wall(kit, path, [[0, 0], [len, 0], [len, EAVES], [len / 2, RIDGE], [0, EAVES]], { holes: [pointedRing(len / 2, 6, 0, 13, 1, 8)], o0: -1.2, o1: 0, hex: STONE });
    wall(kit, path, pointedRing(len / 2, 6, 0, 13, 1, 8), { o0: -2.4, o1: -2.2, hex: '#5b4a35' });
    rose(kit, path, len / 2, 28.5, 6.4, 0);
    for (const s of [-0.6, len + 0.6]) {
      const p = path.at(Math.max(0, Math.min(len, s)));
      kit.box(1.6, EAVES + 6, 1.6, STONE2, p.x, (EAVES + 6) / 2, p.z);
      kit.add(new THREE.ConeGeometry(1.1, 6, 4).rotateY(Math.PI / 4), STONE2, p.x, EAVES + 9, p.z);
    }
  }
  kit.box(CROSS[1] - CROSS[0], EAVES, 2 * TRANSEPT - 2, STONE2, (CROSS[0] + CROSS[1]) / 2, EAVES / 2, 0);
  gable(kit, -TRANSEPT, TRANSEPT, (CROSS[1] - CROSS[0]) / 2 + 0.6, EAVES, RIDGE, LEAD, { x: (CROSS[0] + CROSS[1]) / 2, turn: Math.PI / 2 });
  // the apse: the chapels' half ring, the choir's half ring over it, its half-cone roof, the flyers
  const half = (r, y0, y1, hex) => kit.add(new THREE.CylinderGeometry(r, r, y1 - y0, 14, 1, false, 0, Math.PI), hex, APSE, (y0 + y1) / 2, 0);
  half(CHAPELS, 0, 19, STONE);
  kit.add(new THREE.ConeGeometry(CHAPELS, 7, 14, 1, false, 0, Math.PI), LEAD, APSE, 22.5, 0);
  half(NAVE, 19, EAVES, STONE);
  kit.add(new THREE.ConeGeometry(NAVE + 0.6, RIDGE - EAVES, 14, 1, false, 0, Math.PI), LEAD, APSE, (EAVES + RIDGE) / 2, 0);
  for (let k = 1; k < 7; k++) {
    const a = (k / 7) * Math.PI, c = Math.sin(a), d = Math.cos(a); // round the east end, in local (x, z)
    const px = APSE + (CHAPELS + 1.1) * c, pz = (CHAPELS + 1.1) * d;
    kit.box(2.2, 30, 2.2, STONE2, px, 15, pz);
    kit.add(new THREE.ConeGeometry(1.3, 5, 4).rotateY(Math.PI / 4), STONE2, px, 32.5, pz);
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(px, 28, pz), new THREE.Vector3(APSE + 17 * c, 37.6, 17 * d), new THREE.Vector3(APSE + (NAVE + 0.6) * c, 36, (NAVE + 0.6) * d));
    kit.add(new THREE.TubeGeometry(curve, 8, 0.55, 4, false), STONE);
  }
  // the west front
  const W = 2 * (CHAPELS + 4.5), fp = linePath(FRONT, W / 2, FRONT, -W / 2), mid = W / 2, slab = { o0: -1, o1: 0 };
  kit.box(TOWERS - FRONT, 56, W, STONE2, (FRONT + TOWERS) / 2, 28, 0);
  wall(kit, fp, [[0, 0], [W, 0], [W, 56], [0, 56]], { ...slab, hex: STONE });
  for (const [s, w, h] of [[mid, 8.6, 15], [mid - 18.2, 6.8, 13], [mid + 18.2, 6.8, 13]]) {
    for (let k = 4; k >= 0; k--) wall(kit, fp, pointedRing(s, w + k * 1.1, 0, h + k * 1.3, 1, 8), { o0: 0 - k * 0.35, o1: 0.05 - k * 0.35 + 0.35, hex: k % 2 ? STONE2 : STONE });
    wall(kit, fp, [[s - w / 2, 0], [s + w / 2, 0], [s + w / 2, h * 0.55], [s - w / 2, h * 0.55]], { o0: -1.8, o1: -1.7, hex: '#5b4a35' });
    wall(kit, fp, pointedRing(s, w, h * 0.55, h, 1, 8).map(([a, b]) => [a, Math.max(b, h * 0.55)]), { o0: -1.8, o1: -1.65, hex: STONE2 });
  }
  // the Gallery of Kings
  wall(kit, fp, [[1, 21.6], [W - 1, 21.6], [W - 1, 22.2], [1, 22.2]], { o0: 0, o1: 0.6, hex: STONE2 });
  for (let k = 0; k < 28; k++) {
    const s = 2 + (k + 0.5) * ((W - 4) / 28), p = fp.at(s), x = p.x + 0.35 * p.tz, z = p.z - 0.35 * p.tx;
    wall(kit, fp, pointedRing(s, 1.4, 22.2, 26.2, 1, 4), { o0: -0.3, o1: -0.2, hex: shade(STONE, -0.25) });
    kit.add(new THREE.CylinderGeometry(0.28, 0.36, 2.4, 6), STONE2, x, 23.4, z);
    kit.add(new THREE.SphereGeometry(0.24, 6, 4), STONE2, x, 24.8, z);
  }
  wall(kit, fp, [[1, 26.6], [W - 1, 26.6], [W - 1, 27.2], [1, 27.2]], { o0: 0, o1: 0.6, hex: STONE2 });
  // the great rose and the towers' paired windows, then the gallery of the chimeras
  rose(kit, fp, mid, 35.2, 6.8, 0);
  for (const k of [-1, 1]) for (const d of [-2.2, 2.2]) {
    wall(kit, fp, pointedRing(mid + k * 18.2 + d, 3, 29, 41, 1, 6), { o0: -0.4, o1: -0.3, hex: GLASS });
    wall(kit, fp, pointedRing(mid + k * 18.2 + d, 4, 28.6, 42.2, 1, 6), { o0: 0, o1: 0.15, hex: STONE2 });
  }
  wall(kit, fp, [[0, 44], [W, 44], [W, 44.7], [0, 44.7]], { o0: 0, o1: 0.8, hex: STONE2 });
  const arcade = Array.from({ length: 22 }, (_, k) => pointedRing(1.5 + (k + 0.5) * ((W - 3) / 22), 1.5, 45.4, 54.4, 1, 5));
  wall(kit, fp, [[0, 44.7], [W, 44.7], [W, 56], [0, 56]], { holes: arcade, o0: -0.2, o1: 0.5, hex: STONE });
  // the towers above the gallery, their tall belfry openings, their parapets
  for (const k of [-1, 1]) {
    const cv = k * 18.2, hw = 11.5;
    kit.box(2 * hw - 3, TOWER - 57.2, 2 * hw - 3, DARK, (FRONT + TOWERS) / 2, (56 + TOWER - 1.2) / 2, cv); // dark behind the openings
    for (const [path, mid2] of [
      [linePath(FRONT, cv + hw, FRONT, cv - hw), hw], [linePath(TOWERS, cv - hw, TOWERS, cv + hw), hw],
      [linePath(FRONT, cv + hw * k, TOWERS, cv + hw * k), (TOWERS - FRONT) / 2],
    ]) {
      const len = path.length, holes = [-1, 1].map(d => pointedRing(mid2 + d * 3.2, 4, 59, 80, 1, 7));
      wall(kit, path, [[0, 56], [len, 56], [len, TOWER], [0, TOWER]], { holes, o0: -1.4, o1: 0, hex: STONE });
    }
    const inner = linePath(TOWERS, cv - hw * k, FRONT, cv - hw * k), len = inner.length;
    wall(kit, inner, [[0, 56], [len, 56], [len, TOWER], [0, TOWER]], { holes: [-1, 1].map(d => pointedRing(len / 2 + d * 3.2, 4, 59, 80, 1, 7)), o0: -1.4, o1: 0, hex: STONE });
    kit.box(TOWERS - FRONT + 1, 1.2, 2 * hw + 1, STONE2, (FRONT + TOWERS) / 2, TOWER - 0.6, cv);
    for (const [du, dv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.box(1.4, 3, 1.4, STONE2, (FRONT + TOWERS) / 2 + du * ((TOWERS - FRONT) / 2), TOWER + 1.5, cv + dv * hw);
  }
  // the spire over the crossing: its octagonal base, the spire itself, and the cock on top
  const sx = (CROSS[0] + CROSS[1]) / 2;
  kit.add(new THREE.CylinderGeometry(4, 4.4, 12, 8), LEAD, sx, RIDGE + 4, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    kit.add(new THREE.ConeGeometry(0.6, 6, 4), LEAD, sx + 4.6 * Math.cos(a), RIDGE + 11, 4.6 * Math.sin(a));
  }
  kit.add(new THREE.ConeGeometry(3.6, SPIRE - RIDGE - 10, 8), LEAD, sx, (RIDGE + 10 + SPIRE) / 2, 0);
  kit.box(0.2, 2, 0.2, '#b99a4c', sx, SPIRE + 0.6, 0).box(0.8, 0.5, 0.2, '#b99a4c', sx, SPIRE + 1.6, 0);
  return kit.mesh(kitMat(0.88));
}

// It stands in for the map's pieces of it, but for the low base the map draws round it and its
// sacristy, whose middle (by its corners) falls by the choir at (25.8, 16.9): the area leaves a
// little square round that point out
const HOLE = [24.8, 15.9, 26.8, 17.9], AT = (u0, v0, u1, v1) => onMap(X, Z, TURN, rect(u0, v0, u1, v1));
export const NOTRE_DAME = [{
  id: 'notre-dame', name: 'Notre-Dame', x: X, z: Z, turn: TURN, reach: 260,
  area: [
    AT(FRONT - 2, -TRANSEPT - 3, HOLE[0], TRANSEPT + 3), AT(HOLE[2], -TRANSEPT - 3, END + 3, TRANSEPT + 3),
    AT(HOLE[0], -TRANSEPT - 3, HOLE[2], HOLE[1]), AT(HOLE[0], HOLE[3], HOLE[2], TRANSEPT + 3),
  ],
  foot: [onMap(X, Z, TURN, rect(FRONT, -CHAPELS - 2.2, APSE, CHAPELS + 2.2)), onMap(X, Z, TURN, rect(CROSS[0], -TRANSEPT, CROSS[1], TRANSEPT)), onMap(X, Z, TURN, rect(APSE, -CHAPELS, END, CHAPELS))],
  make: notreDame,
}];
