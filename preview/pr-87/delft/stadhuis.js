// The Stadhuis at the west end of the Markt, modelled by hand in place of the map's blocks of it, in
// game metres (the real ones times 1.25), on the map's outline. After the fire of 1618 Hendrick de
// Keyser built it anew (1618-1620) round the one thing the fire had left, the medieval tower of Het
// Steen, the old prison of the counts of Holland:
//   the Renaissance front on the Markt, nine bays of tall cross windows with red shutters over three
//     storeys between pilasters, the middle three standing forward under a tall frontispiece with
//     its scrolls, its windows and Justice on top, and the perron in front with its two stairs
//   the hipped roof of slate with its dormers, and the low wing at the back
//   Het Steen (13th century) rising out of the back of the roof: its square of dark brick with a few
//     small windows, the battlements and corner turrets at its top, and its slate spire
// The Stadhuis's own metres: about its middle, x towards the Markt (the front at x = 16), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, square, wall, sweep, archRing, onMap, rect } from '../core/js/arcade.js';

const X = 36.6, Z = -132.2, TURN = 0.537;
const HU = 16, HV = 16.3, EAVES = 17, RIDGE = 29, BACK = -19.8; // half its length and width; the back wing's end
const FLOORS = [0, 6.2, 11.6, EAVES];
const STONE = '#e4dccb', STONE2 = '#cfc5b0', BRICK = '#7c3b2b', BRICK2 = '#69311f', SLATE = '#3d4247', GLASS = '#2a3038', RED = '#9c2a22', GOLD = '#c9a64a';
const TOWER = { u: -10.35, h: 5, body: 36, top: 50 }; // Het Steen: its middle along x, half its width, its brick's top and the spire's

// a cross window on the path at s from y0 to y1, w wide: its stone frame, the glass, the cross of the
// frame, and a red shutter folded back on either side
function crossWindow(kit, p, s, y0, y1, w, shutters = true) {
  wall(kit, p, [[s - w / 2 - 0.25, y0 - 0.25], [s + w / 2 + 0.25, y0 - 0.25], [s + w / 2 + 0.25, y1 + 0.25], [s - w / 2 - 0.25, y1 + 0.25]], { o0: 0, o1: 0.12, hex: STONE2 });
  wall(kit, p, [[s - w / 2, y0], [s + w / 2, y0], [s + w / 2, y1], [s - w / 2, y1]], { o0: 0.12, o1: 0.16, hex: GLASS });
  const ym = y0 + (y1 - y0) * 0.62;
  wall(kit, p, [[s - 0.09, y0], [s + 0.09, y0], [s + 0.09, y1], [s - 0.09, y1]], { o0: 0.16, o1: 0.22, hex: '#f2efe6' });
  wall(kit, p, [[s - w / 2, ym - 0.09], [s + w / 2, ym - 0.09], [s + w / 2, ym + 0.09], [s - w / 2, ym + 0.09]], { o0: 0.16, o1: 0.22, hex: '#f2efe6' });
  if (shutters) for (const k of [-1, 1]) wall(kit, p, [[s + k * (w / 2 + 0.3), y0], [s + k * (w / 2 + 0.3 + w / 2), y0], [s + k * (w / 2 + 0.3 + w / 2), ym], [s + k * (w / 2 + 0.3), ym]], { o0: 0.12, o1: 0.2, hex: RED });
}

export function stadhuis() {
  const kit = new Kit();
  kit.box(2 * HU, EAVES, 2 * HV, STONE, 0, EAVES / 2, 0);
  // the low wing at the back, and the hipped roof with its dormers
  kit.box(-HU - BACK, 9, 2 * HV, STONE2, (BACK - HU) / 2, 4.5, 0);
  kit.frustum(-HU - BACK, 2 * HV, 0, 2 * HV - 6, 3, SLATE, (BACK - HU) / 2, 9, 0);
  kit.frustum(2 * HU + 0.8, 2 * HV + 0.8, 2 * HU - 16, 0.6, RIDGE - EAVES, SLATE, 0, EAVES + 0.3, 0);
  sweep(kit, linePath(HU, -HV, HU, HV), 0, 2 * HV, [[-0.2, EAVES - 0.6], [0.6, EAVES - 0.6], [0.6, EAVES + 0.3], [-0.2, EAVES + 0.3]], STONE2, { step: 2 * HV });
  for (const v of [-11, -6.5, 6.5, 11]) for (const u of [HU - 2.4, -HU + 2.4]) {
    kit.box(1.6, 2.4, 2.4, STONE, u, EAVES + 3.2, v).box(1.8, 0.4, 2.6, SLATE, u, EAVES + 4.5, v);
    kit.box(0.1, 1.3, 1.3, GLASS, u + Math.sign(u) * 0.82, EAVES + 3.2, v);
  }
  // the front on the Markt (+x) and the two sides, with their rows of windows (the back wing hides the back)
  const faces = [linePath(-HU, -HV, HU, -HV), linePath(HU, -HV, HU, HV), linePath(HU, HV, -HU, HV)];
  faces.forEach((p, f) => {
    const L = p.length, front = f === 1, n = front ? 9 : 8, bay = L / n;
    for (const y of FLOORS.slice(1, -1)) sweep(kit, p, 0, L, [[-0.1, y - 0.3], [0.3, y - 0.3], [0.3, y + 0.15], [-0.1, y + 0.15]], STONE2, { step: L });
    sweep(kit, p, 0, L, [[-0.1, 0], [0.4, 0], [0.4, 1.2], [-0.1, 1.2]], STONE2, { step: L });
    for (let i = 0; i < n; i++) {
      const s = (i + 0.5) * bay;
      for (let k = 0; k < 3; k++) {
        if (front && k === 0 && i === 4) continue;
        crossWindow(kit, p, s, FLOORS[k] + (k ? 1 : 1.8), FLOORS[k + 1] - 1.1, bay * 0.42, front);
      }
      if (front && i) wall(kit, p, [[i * bay - 0.3, 1.2], [i * bay + 0.3, 1.2], [i * bay + 0.3, EAVES - 0.6], [i * bay - 0.3, EAVES - 0.6]], { o0: 0, o1: (i === 3 || i === 6) ? 0.9 : 0.3, hex: STONE2 });
    }
    if (!front) return;
    // the middle three bays stand forward, and the doorway in the middle of them
    wall(kit, p, [[3 * bay, 0], [6 * bay, 0], [6 * bay, EAVES], [3 * bay, EAVES]], { o0: 0, o1: 0.6, hex: STONE });
    wall(kit, p, archRing(L / 2, 2.6, 1.8, 6, 10), { o0: 0.6, o1: 0.7, hex: '#3a2c22' });
    // the frontispiece over them: two storeys of windows between scrolls, the pediment, Justice
    const fp = linePath(HU + 0.6, -1.5 * bay, HU + 0.6, 1.5 * bay), W = 3 * bay, y = EAVES;
    wall(kit, fp, [[0, y], [W, y], [W, y + 5.2], [W - 1.6, y + 5.2], [W - 1.6, y + 9.6], [W / 2, y + 12.6], [1.6, y + 9.6], [1.6, y + 5.2], [0, y + 5.2]], { o0: -1.6, o1: 0, hex: STONE });
    for (const s of [W * 0.25, W * 0.5, W * 0.75]) crossWindow(kit, fp, s, y + 1, y + 4.4, 1.3, false);
    crossWindow(kit, fp, W / 2, y + 6, y + 9, 1.3, false);
    for (const [s, k] of [[0, 1], [W, -1]]) {
      const q = fp.at(s);
      kit.add(new THREE.TorusGeometry(1, 0.28, 5, 10, Math.PI).rotateY(Math.PI / 2), STONE2, q.x - 0.4, y + 5.2, q.z + k * 1);
    }
    sweep(kit, fp, 0, W, [[-0.2, y + 5], [0.4, y + 5], [0.4, y + 5.5], [-0.2, y + 5.5]], STONE2, { step: W });
    kit.add(new THREE.CylinderGeometry(0.3, 0.4, 2, 6), GOLD, HU - 0.2, y + 13.6, 0).add(new THREE.SphereGeometry(0.28, 6, 4), GOLD, HU - 0.2, y + 14.9, 0);
    kit.rod([HU - 0.2, y + 14, -0.9], [HU - 0.2, y + 14, 0.9], 0.06, GOLD, 4);
  });
  // the perron: the landing before the door, its balustrade, and a flight of steps down either side
  kit.box(2.4, 1.8, 7, STONE2, HU + 1.2, 0.9, 0);
  for (const k of [-1, 1]) {
    kit.box(0.25, 1, 7, STONE, HU + 2.3, 2.3, 0).box(2.4, 1, 0.25, STONE, HU + 1.2, 2.3, k * 3.5);
    for (let st = 0; st < 5; st++) kit.box(2.4, 0.36 * (st + 1), 0.5, STONE2, HU + 1.2, 0.18 * (st + 1), k * (3.5 + 0.5 * (5 - st) - 0.25));
  }
  // Het Steen, rising out of the back of the roof
  const { u, h, body, top } = TOWER;
  kit.box(2 * h, body, 2 * h, BRICK, u, body / 2, 0);
  square(h).forEach(p => {
    const q = linePath(p.at(0).x + u, p.at(0).z, p.at(p.length).x + u, p.at(p.length).z), L = q.length;
    for (const y of [22, 29]) wall(kit, q, archRing(L / 2, 1.1, y, y + 2.4, 6), { o0: 0, o1: 0.08, hex: GLASS });
    wall(kit, q, [[0, body - 3], [L, body - 3], [L, body - 2.4], [0, body - 2.4]], { o0: 0, o1: 0.2, hex: STONE2 });
    // the battlements
    const n = 4;
    for (let k = 0; k < n; k++) wall(kit, q, [[(k / n) * L, body], [((k + 0.55) / n) * L, body], [((k + 0.55) / n) * L, body + 1.6], [(k / n) * L, body + 1.6]], { o0: -0.4, o1: 0, hex: BRICK2 });
  });
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    kit.add(new THREE.CylinderGeometry(0.8, 0.8, 4, 8), BRICK2, u + sx * h, body + 1, sz * h);
    kit.add(new THREE.ConeGeometry(0.95, 3.4, 8), SLATE, u + sx * h, body + 4.7, sz * h);
  }
  kit.add(new THREE.ConeGeometry(h - 0.6, top - body - 1, 8).rotateY(Math.PI / 8), SLATE, u, body + (top - body + 1) / 2, 0);
  kit.add(new THREE.SphereGeometry(0.3, 6, 4), GOLD, u, top + 0.3, 0);
  kit.rod([u, top, 0], [u, top + 2, 0], 0.06, GOLD, 4);
  return kit.mesh(kitMat(0.85));
}

// riders bump into it all round and into the perron on the Markt
export const STADHUIS = [{
  id: 'stadhuis', name: 'Stadhuis', x: X, z: Z, turn: TURN, reach: 90,
  area: [onMap(X, Z, TURN, rect(BACK - 0.4, -HV - 0.5, HU + 0.5, HV + 0.5))],
  foot: [onMap(X, Z, TURN, rect(BACK, -HV, HU, HV)), onMap(X, Z, TURN, rect(HU, -4.8, HU + 2.4, 4.8))],
  make: stadhuis,
}];
