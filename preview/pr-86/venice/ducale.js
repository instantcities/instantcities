// The Palazzo Ducale (1340-1442), modelled by hand in place of the map's building parts of it, on
// the map's outlines of its three wings round the courtyard, in game metres (the real ones times
// 1.25). Its two famous fronts, on the lagoon and on the Piazzetta, are the world turned upside down
// that Ruskin loved: the light below, the heavy above:
//   the portico of pointed arches on their short columns along the ground
//   over it the loggia, twice as many arches, with the quatrefoils of its tracery between them
//   the great wall of pink and white stone over all that, with its few tall windows, the balcony
//     window in the middle of each front, and along the top the white cresting of merlons
// The model's own metres: the map's, from (X, Z).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing } from '../core/js/arcade.js';

const X = 296, Z = 341;
const WINGS = [
  [[-63.6, -69.3], [-60.4, -70.3], [-57.1, -71.2], [-41.9, -75.4], [-41.5, -74.0], [-25.3, -14.4], [-41.9, 9.6], [-60.9, -59.5]], // on the Piazzetta
  [[-37.6, 23.1], [-34.5, 22.3], [7.1, 10.6], [34.4, 2.9], [51.0, -1.8], [44.0, -26.3], [24.3, -20.5], [16.7, -26.3], [-25.3, -14.4], [-41.9, 9.6], [-38.1, 21.8]], // on the lagoon
  [[32.6, -79.2], [38.5, -55.0], [39.8, -50.0], [46.0, -26.9], [44.0, -26.3], [24.3, -20.5], [16.7, -26.3], [4.5, -71.7]], // on the canal
];
// the two fronts, each running with the outside to its right: the lagoon's from its east end, the Piazzetta's from the corner
const FRONTS = [linePath(51, -1.8, -37.6, 23.1), linePath(-37.6, 23.1, -63.6, -69.3)];
const TOP = 31.5, PORTICO = 9, LOGGIA = 17.5;
const WHITE = '#f1ece2', PINK = '#e8c6b8', DARK = '#33302e', LEAD = '#878d90';

export function ducale() {
  const kit = new Kit();
  // the wings: walls up from their outlines, and a flat top of lead
  for (const r0 of WINGS) {
    const r = area(r0) > 0 ? r0 : r0.slice().reverse(), pos = [];
    r.forEach((p, i) => {
      const q = r[(i + 1) % r.length];
      pos.push(p[0], 0, p[1], q[0], TOP, q[1], q[0], 0, q[1], p[0], 0, p[1], p[0], TOP, p[1], q[0], TOP, q[1]);
    });
    for (const [i, j, k] of THREE.ShapeUtils.triangulateShape(r.map(p => new THREE.Vector2(...p)), [])) {
      const [a, b, c] = [r[i], r[j], r[k]], up = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0;
      for (const p of up ? [a, c, b] : [a, b, c]) pos.push(p[0], TOP, p[1]);
    }
    kit.add(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)), PINK);
  }
  for (const f of FRONTS) {
    const L = f.length, n = Math.round(L / 5.4), bay = L / n, line = (y0, y1, o0, o1, hex) => wall(kit, f, [[0, y0], [L, y0], [L, y1], [0, y1]], { o0, o1, hex });
    // the portico: the dark behind, the arches on their columns in front
    line(0, LOGGIA, 0.5, 0.55, '#4a443e');
    wall(kit, f, [[0, -0.5], [L, -0.5], [L, PORTICO], [0, PORTICO]], { o0: 0.55, o1: 1.6, hex: WHITE, holes: Array.from({ length: n }, (_, k) => pointedRing((k + 0.5) * bay, bay - 1.3, -0.3, PORTICO - 0.9, 1, 8)) });
    // the loggia: a balustrade, twice as many arches, the quatrefoils over them
    line(PORTICO, PORTICO + 1.1, 0.55, 1.9, WHITE);
    const holes = [];
    for (let k = 0; k < 2 * n; k++) holes.push(pointedRing((k + 0.5) * (bay / 2), bay / 2 - 0.8, PORTICO + 1.2, LOGGIA - 2.6, 1.2, 6));
    for (let k = 1; k < 2 * n; k++) holes.push(Array.from({ length: 8 }, (_, j) => [k * (bay / 2) + 0.95 * Math.cos((j / 8) * Math.PI * 2), LOGGIA - 1.3 + 0.95 * Math.sin((j / 8) * Math.PI * 2)]));
    wall(kit, f, [[0, PORTICO + 1.1], [L, PORTICO + 1.1], [L, LOGGIA], [0, LOGGIA]], { o0: 0.55, o1: 1.3, hex: WHITE, holes });
    line(LOGGIA, LOGGIA + 0.7, 0.5, 1.5, WHITE);
    line(LOGGIA + 0.7, TOP, 0.45, 0.5, PINK);
    // the great wall's lozenges: rows of lighter diamonds over the pink
    for (let y = LOGGIA + 2; y < TOP - 1.5; y += 2.2) for (let s = ((y / 2.2) % 2) * 1.1 + 0.8; s < L - 0.8; s += 2.2) {
      const p = f.at(s);
      kit.box(0.9, 0.9, 0.1, '#f3e6dc', p.x + p.tz * 0.53, y, p.z - p.tx * 0.53, 0, Math.atan2(-p.tz, p.tx), Math.PI / 4);
    }
    // the tall windows, and the balcony window in the middle under its tabernacle
    for (let k = 0; k < 6; k++) {
      const s = L * (k < 3 ? 0.12 + k * 0.13 : 0.62 + (k - 3) * 0.13);
      wall(kit, f, pointedRing(s, 4, LOGGIA + 3, LOGGIA + 10, 1, 6), { o0: 0.5, o1: 0.8, hex: WHITE });
      wall(kit, f, pointedRing(s, 3, LOGGIA + 3.4, LOGGIA + 9.4, 1, 6), { o0: 0.8, o1: 0.85, hex: DARK });
    }
    wall(kit, f, pointedRing(L / 2, 6, LOGGIA + 0.8, TOP - 1, 1, 8), { o0: 0.5, o1: 1.1, hex: WHITE });
    wall(kit, f, pointedRing(L / 2, 3.6, LOGGIA + 2, LOGGIA + 10.5, 1, 6), { o0: 1.1, o1: 1.15, hex: DARK });
    wall(kit, f, [[L / 2 - 3.4, LOGGIA + 1.2], [L / 2 + 3.4, LOGGIA + 1.2], [L / 2 + 3.4, LOGGIA + 2.6], [L / 2 - 3.4, LOGGIA + 2.6]], { o0: 0.5, o1: 2.6, hex: WHITE }); // its balcony
    // the cresting along the top
    for (let s = 0.8; s < L; s += 1.6) {
      const p = f.at(s), x = p.x + p.tz * 0.9, z = p.z - p.tx * 0.9;
      kit.box(0.9, 1.4, 0.4, WHITE, x, TOP + 0.7, z, 0, Math.atan2(-p.tz, p.tx));
      kit.add(new THREE.ConeGeometry(0.5, 1.2, 4).rotateY(Math.PI / 4), WHITE, x, TOP + 2, z);
    }
  }
  // the corner where the two fronts meet: its pinnacle
  kit.add(new THREE.CylinderGeometry(0.8, 0.8, 4, 8), WHITE, -37.6, TOP + 2, 23.1).add(new THREE.ConeGeometry(0.9, 3, 8), WHITE, -37.6, TOP + 5.5, 23.1);
  return kit.mesh(kitMat(0.88));
}

function area(r) {
  return r.reduce((s, [a, b], i) => { const [c, d] = r[(i + 1) % r.length]; return s + a * d - c * b; }, 0);
}

const world = r => r.flatMap(([u, v]) => [X + u, Z + v]);
export const DUCALE = [{
  id: 'palazzo-ducale', name: 'Palazzo Ducale', x: X, z: Z, reach: 110,
  area: WINGS.map(world), foot: WINGS.map(world),
  make: ducale,
}];
