// St Patrick's Cathedral on Fifth Avenue (James Renwick Jr., 1858-79, the spires 1888), modelled by hand
// in place of the map's blocks of it, in game metres (the real ones times 1.25), on the map's outlines:
// Gothic Revival in white Tuckahoe marble, its spires 100 m high, among the towers of Rockefeller Center:
//   the west front on Fifth Avenue: the two towers on their buttresses, their octagonal belfries and
//     their spires, the great portal and the rose window in the gable between them
//   the nave over its aisles, the pinnacles on the buttresses along them, the clerestory's windows
//   the transept with a rose in each end, the choir and its apse, and the Lady Chapel (1906) beyond
// Riders bump into it. The model's own metres: u east from the front (into the church), v south
// across it, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, gable, onMap, rect } from '../core/js/arcade.js';

const X = 524.95, Z = -592.8, TURN = -0.507;
const TOWER = 7, SQUARE = 62, BELFRY = 78, SPIRE = 125;
const NAVE = { u0: 14, u1: 117, hv: 11, eaves: 33, ridge: 48 }, AISLE = { hv: 23.6, eaves: 20 }, TRANSEPT = { u0: 53.6, u1: 82.4, hv: 28.5 };
const LADY = { u0: 117, u1: 140, hv: 7.5, eaves: 26, ridge: 36 };
const MARBLE = '#e4e0d6', MARBLE2 = '#cfcabd', SLATE = '#5f666c', DARK = '#2b3036', GLASS = '#3a4a6a';

// a wall's side as a path with its outside to its right: along u at v (outside towards sv)
const side = (u0, u1, v, sv) => (sv < 0 ? linePath(u0, v, u1, v) : linePath(u1, v, u0, v));

// pointed windows down a side, with a buttress and its pinnacle between each pair
function bays(kit, p, n, y0, y1, w, butt) {
  const bay = p.length / n;
  for (let k = 0; k < n; k++) wall(kit, p, pointedRing((k + 0.5) * bay, w, y0, y1, 1, 6), { o0: 0, o1: 0.12, hex: GLASS });
  if (butt) for (let k = 0; k <= n; k++) {
    const s = k * bay, a = p.at(Math.min(s, p.length - 0.01)), o = { x: a.tz, z: -a.tx };
    wall(kit, p, [[s - 0.6, 0], [s + 0.6, 0], [s + 0.6, butt], [s - 0.6, butt + 1]], { o0: 0, o1: 1.6, hex: MARBLE2 });
    kit.add(new THREE.ConeGeometry(0.55, 5, 4), MARBLE2, a.x + o.x * 0.8, butt + 3, a.z + o.z * 0.8, 0, Math.PI / 4);
  }
}

// a pointed roof's ridge over an apse: half an octagon of radius r round (u, 0), walls to eaves
function apse(kit, u, r, eaves, ridge) {
  kit.add(new THREE.CylinderGeometry(r, r, eaves, 8, 1, false, 0, Math.PI), MARBLE, u, eaves / 2, 0, 0, 0);
  kit.add(new THREE.ConeGeometry(r + 0.5, ridge - eaves, 8, 1, false, 0, Math.PI), SLATE, u, (eaves + ridge) / 2, 0);
  for (let k = 0; k < 4; k++) {
    const a = ((k + 0.5) / 4) * Math.PI, d = r * Math.cos(Math.PI / 8) + 0.05;
    kit.box(2, eaves * 0.5, 0.2, GLASS, u + d * Math.sin(a), eaves * 0.5, d * Math.cos(a), 0, a);
  }
}

export function stPatricks() {
  const kit = new Kit(), N = NAVE, A = AISLE, T = TRANSEPT, L = LADY;
  // the aisles with their windows and pinnacles, and the nave's roof over the clerestory
  kit.box(N.u1 - N.u0, A.eaves, 2 * A.hv, MARBLE, (N.u0 + N.u1) / 2, A.eaves / 2, 0);
  kit.box(N.u1 - N.u0, A.eaves + 0.6, 2 * A.hv - 4, SLATE, (N.u0 + N.u1) / 2, (A.eaves + 0.6) / 2, 0);
  kit.box(N.u1 - N.u0, N.eaves, 2 * N.hv, MARBLE, (N.u0 + N.u1) / 2, N.eaves / 2, 0);
  gable(kit, N.u0, N.u1, N.hv + 0.6, N.eaves, N.ridge, SLATE);
  for (const sv of [-1, 1]) {
    for (const [u0, u1, n] of [[N.u0, T.u0, 5], [T.u1, N.u1, 4]]) bays(kit, side(u0, u1, sv * A.hv, sv), n, 4, A.eaves - 3, 3.2, A.eaves - 1);
    for (const [u0, u1, n] of [[N.u0, T.u0, 5], [T.u1, N.u1, 4]]) bays(kit, side(u0, u1, sv * N.hv, sv), n, A.eaves + 2, N.eaves - 1.5, 3, 0);
    kit.box(N.u1 - N.u0, 1, 1, MARBLE2, (N.u0 + N.u1) / 2, N.eaves + 0.5, sv * (N.hv + 0.3));
  }
  // the transept and its two rose windows
  kit.box(T.u1 - T.u0, N.eaves, 2 * T.hv, MARBLE, (T.u0 + T.u1) / 2, N.eaves / 2, 0);
  gable(kit, -T.hv, T.hv, (T.u1 - T.u0) / 2 + 0.6, N.eaves, N.ridge, SLATE, { x: (T.u0 + T.u1) / 2, turn: Math.PI / 2 });
  for (const sv of [-1, 1]) {
    const end = side(T.u0, T.u1, sv * T.hv, sv), W = end.length;
    wall(kit, end, [[0, N.eaves], [W, N.eaves], [W / 2, N.ridge]], { o0: -0.3, o1: 0.3, hex: MARBLE });
    wall(kit, end, pointedRing(W / 2, 6, 4, 16, 1, 6), { o0: 0, o1: 0.15, hex: DARK });
    const m = end.at(W / 2), o = { x: m.tz, z: -m.tx };
    kit.add(new THREE.CylinderGeometry(6, 6, 0.4, 24), GLASS, m.x + o.x * 0.2, 25, m.z + o.z * 0.2, Math.PI / 2, Math.atan2(o.x, o.z));
    kit.add(new THREE.TorusGeometry(6.2, 0.45, 6, 24), MARBLE2, m.x + o.x * 0.3, 25, m.z + o.z * 0.3, 0, Math.atan2(o.x, o.z));
    for (const s of [0.9, W - 0.9]) {
      const q = end.at(s);
      kit.box(2, N.eaves + 4, 2, MARBLE2, q.x + o.x * 0.6, (N.eaves + 4) / 2, q.z + o.z * 0.6).add(new THREE.ConeGeometry(1.2, 7, 4), MARBLE2, q.x + o.x * 0.6, N.eaves + 7.5, q.z + o.z * 0.6, 0, Math.PI / 4);
    }
  }
  // the choir's apse with the ambulatory round it, and the Lady Chapel beyond
  apse(kit, N.u1 - 2, A.hv - 1, A.eaves, A.eaves + 6);
  apse(kit, N.u1 - 2, N.hv, N.eaves, N.ridge);
  kit.box(L.u1 - L.u0, L.eaves, 2 * L.hv, MARBLE, (L.u0 + L.u1) / 2, L.eaves / 2, 0);
  gable(kit, L.u0, L.u1, L.hv + 0.5, L.eaves, L.ridge, SLATE);
  for (const sv of [-1, 1]) bays(kit, side(L.u0, L.u1, sv * L.hv, sv), 4, 5, L.eaves - 3, 2.6, L.eaves - 1);
  apse(kit, L.u1, L.hv, L.eaves, L.ridge);
  // the front between the towers: the portal, the rose and the gable
  const west = linePath(0, 9.5, 0, -9.5); // running north, its outside to the west
  kit.box(N.u0, N.eaves + 2, 19, MARBLE, N.u0 / 2, (N.eaves + 2) / 2, 0);
  wall(kit, west, [[0, N.eaves + 2], [19, N.eaves + 2], [9.5, N.ridge + 4]], { o0: -N.u0 + 0.5, o1: 0, hex: MARBLE });
  wall(kit, west, pointedRing(9.5, 7, 0, 17, 1.1, 8), { o0: -0.1, o1: 0.4, hex: DARK });
  wall(kit, west, [[5, 17.5], [14, 17.5], [9.5, 23]], { o0: 0, o1: 0.5, hex: MARBLE2 });
  kit.add(new THREE.CylinderGeometry(5, 5, 0.4, 24), GLASS, -0.25, 29, 0, Math.PI / 2, -Math.PI / 2);
  kit.add(new THREE.TorusGeometry(5.2, 0.45, 6, 24), MARBLE2, -0.4, 29, 0, 0, -Math.PI / 2);
  kit.add(new THREE.ConeGeometry(0.9, 5, 4), MARBLE2, -0.3, N.ridge + 6, 0, 0, Math.PI / 4);
  // the towers: their square bodies on corner buttresses, the windows, the belfries and the spires
  for (const sv of [-1, 1]) {
    const v = sv * 16.5;
    kit.box(2 * TOWER, SQUARE, 2 * TOWER, MARBLE, TOWER, SQUARE / 2, v);
    for (const [a, b] of [[0, -1], [0, 1], [2, -1], [2, 1]]) {
      const u = a * TOWER, w = v + b * TOWER;
      kit.box(2.4, SQUARE - 4, 2.4, MARBLE2, u - (a ? -0.6 : 0.6), (SQUARE - 4) / 2, w + b * 0.6);
      kit.add(new THREE.ConeGeometry(1.3, 9, 4), MARBLE2, u - (a ? -0.6 : 0.6), SQUARE + 0.5, w + b * 0.6, 0, Math.PI / 4);
    }
    const tw = linePath(0, v + TOWER, 0, v - TOWER);
    wall(kit, tw, pointedRing(TOWER, 5, 0, 13, 1.1, 8), { o0: -0.1, o1: 0.3, hex: DARK });
    for (const [y0, y1] of [[24, 36], [42, 58]]) wall(kit, tw, pointedRing(TOWER, 4, y0, y1, 1, 6), { o0: 0, o1: 0.12, hex: y0 > 40 ? DARK : GLASS });
    // the octagonal belfry with its tall openings and gablets, then the spire
    kit.add(new THREE.CylinderGeometry(6, 6.4, BELFRY - SQUARE, 8), MARBLE, TOWER, (SQUARE + BELFRY) / 2, v, 0, Math.PI / 8);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2, d = 6;
      kit.box(1.8, 11, 0.25, DARK, TOWER + d * Math.cos(a), SQUARE + 7.5, v + d * Math.sin(a), 0, Math.PI / 2 - a);
      kit.add(new THREE.ConeGeometry(1.4, 4, 4), MARBLE2, TOWER + (d + 0.2) * Math.cos(a), BELFRY + 1.6, v + (d + 0.2) * Math.sin(a), 0, Math.PI / 4 - a);
    }
    kit.add(new THREE.ConeGeometry(6, SPIRE - BELFRY, 8), MARBLE, TOWER, (BELFRY + SPIRE) / 2, v, 0, Math.PI / 8);
    for (let y = BELFRY + 8; y < SPIRE - 6; y += 7) for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8, r = 6 * (1 - (y - BELFRY) / (SPIRE - BELFRY)) * Math.cos(Math.PI / 8) + 0.1;
      kit.box(0.5, 0.8, 0.5, MARBLE2, TOWER + r * Math.cos(a), y, v + r * Math.sin(a)); // the crockets
    }
    kit.box(0.25, 3, 0.25, '#c9a64a', TOWER, SPIRE + 1.5, v).box(1.6, 0.25, 0.25, '#c9a64a', TOWER, SPIRE + 2, v);
  }
  return kit.mesh(kitMat(0.8));
}

export const ST_PATRICKS = [{
  id: 'st-patricks', name: "St Patrick's Cathedral", x: X, z: Z, turn: TURN, reach: 300,
  area: [onMap(X, Z, TURN, rect(-2, -31, 150, 31))],
  foot: [
    rect(-1.5, -AISLE.hv - 1, NAVE.u1, AISLE.hv + 1), rect(TRANSEPT.u0, -TRANSEPT.hv - 1, TRANSEPT.u1, TRANSEPT.hv + 1),
    rect(NAVE.u1 - 2, -AISLE.hv + 1, NAVE.u1 + AISLE.hv - 1, AISLE.hv - 1), rect(LADY.u0, -LADY.hv - 1, LADY.u1 + LADY.hv, LADY.hv + 1),
  ].map(r => onMap(X, Z, TURN, r)),
  make: stPatricks,
}];
