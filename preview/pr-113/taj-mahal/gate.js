// The Great Gate (Darwaza-i-Rauza), the red sandstone gateway into the garden, finished in 1648.
// Modelled by hand in real metres (scaled to game metres, 1.25, at the end), its garden side
// towards -z: a block 41 m wide and 31 m deep, 30 m high, the way through it a pointed passage 8 m
// wide, over it the pishtaq with its arch and its inlay of white marble; either side two storeys of
// recessed arches, and along the top the 22 small white chhatris (one for each year it took to
// build the Taj), 11 along each side. Riders go through the passage and bump into the two halves.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { S } from './taj.js';

const SAND = '#b4523a', SAND2 = '#a24b36', MARBLE = '#f1ede3', DARK = '#3d2219', GOLD = '#d9a72e';
const W = 41, D = 31, H = 30, PASS = 8.4; // width, depth, height, the passage's width
const X = -91.3, Z = 196; // the middle of the gate, in the map's metres (the garden's wall runs along its garden side)

function chhatri(kit, x, y, z) {
  for (const [dx, dz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) kit.add(new THREE.CylinderGeometry(0.12, 0.14, 1.9, 5), MARBLE, x + dx, y + 0.95, z + dz);
  kit.add(new THREE.CylinderGeometry(0.85, 0.85, 0.25, 8), MARBLE, x, y + 1.9, z);
  kit.add(new THREE.SphereGeometry(0.95, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), MARBLE, x, y + 2.0, z);
  kit.add(new THREE.CylinderGeometry(0.04, 0.06, 0.9, 4), GOLD, x, y + 3.3, z);
}

// one side of the gate: the front wall (o0 behind, o1 the face), its path running along the face with the outside to its right
function side(kit, path, z) {
  const c = W / 2, niches = (s0, s1) => {
    const mid = (s0 + s1) / 2, w = (s1 - s0) * 0.5;
    return [pointedRing(mid, w, 1.4, 11.8, 1.25), pointedRing(mid, w, 14.2, 24.5, 1.25)];
  };
  const holes = [pointedRing(c, PASS, 0, 16, 1.25), ...niches(0, c - 10), ...niches(c + 10, W), pointedRing(c, 7, 19, 27.5, 1.25)];
  wall(kit, path, [[0, 0], [W, 0], [W, H], [c + 10.5, H], [c + 10.5, H + 4.2], [c - 10.5, H + 4.2], [c - 10.5, H], [0, H]], { holes, o0: -1.4, o1: 0, hex: SAND });
  // inlay round the passage, the arches and the pishtaq's arch
  for (const [s, w, y0, y1] of [[c, PASS, 0, 16], [c, 7, 19, 27.5], ...[0, 1].flatMap(k => [[k ? (c + 10 + W) / 2 : (c - 10) / 2, ((k ? W - c - 10 : c - 10) * 0.5), 1.4, 11.8], [k ? (c + 10 + W) / 2 : (c - 10) / 2, ((k ? W - c - 10 : c - 10) * 0.5), 14.2, 24.5]])]) {
    wall(kit, path, pointedRing(s, w + 1.2, y0, y1 + 0.8, 1.25), { holes: [pointedRing(s, w, y0, y1, 1.25)], o0: -0.05, o1: 0.2, hex: MARBLE });
  }
  // the 11 little chhatris along the top
  for (let k = 0; k < 11; k++) chhatri(kit, -W / 2 + 2 + k * ((W - 4) / 10), H, z);
}

export function gate() {
  const kit = new Kit(), hw = W / 2;
  // the faces: garden side to -z (path running along +x has its outside towards -z), street side to +z
  side(kit, linePath(-hw, -D / 2, hw, -D / 2), -D / 2 + 0.7); // x grows with s
  side(kit, linePath(hw, D / 2, -hw, D / 2), D / 2 - 0.7);
  // the two halves behind the faces, and the roof deck over the passage with its parapet
  for (const sx of [-1, 1]) kit.box(hw - PASS / 2, H, D - 2.6, SAND2, sx * ((hw + PASS / 2) / 2), H / 2, 0);
  kit.box(PASS + 0.4, H - 16, D - 2.6, SAND2, 0, 16 + (H - 16) / 2, 0);
  kit.box(W, 0.6, D, shade(SAND, 0.1), 0, H + 0.1, 0);
  // the passage: its floor and its dark roof
  kit.box(PASS, 0.1, D, '#b9a07c', 0, 0.06, 0);
  const m = kit.mesh(kitMat(0.88));
  m.scale.setScalar(S);
  return m;
}

const ring = pts => onMap(X, Z, 0, pts.map(([u, v]) => [u * S, v * S]));

// It stands in for the map's piece of the gate (area); riders bump into the two halves, not the
// passage between them (foot).
export const GATE = [{
  id: 'great-gate', name: 'Darwaza-i-Rauza', x: X, z: Z, turn: 0, reach: 420,
  area: [ring(rect(-24, -19, 24, 19))],
  foot: [ring(rect(-W / 2, -D / 2, -PASS / 2, D / 2)), ring(rect(PASS / 2, -D / 2, W / 2, D / 2))],
  make: gate,
}];
