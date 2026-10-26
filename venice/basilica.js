// The Basilica di San Marco (1063-94, its domes raised and its front dressed in Gothic in the 13th
// to 15th centuries), modelled by hand in place of the map's building parts of it, from the map's
// outlines and heights, in game metres (the real ones times 1.25):
//   the Greek cross of its arms under the five domes, each on its drum with a ring of little arched
//     windows, raised high in lead like a bulb, with its lantern and cross
//   the narthex round the west and north, and the west front on the Piazza: five portals in deep
//     round arches between bundles of marble columns, the gold of the mosaics in their lunettes
//   the terrace over them with the four bronze horses, and above it five arches with gold mosaics
//     under ogee crowns of Gothic leaves, the saints and the gilt lion between them, Saint Mark on top
// The model's own metres: u along the axis from the middle dome east, v across it (south), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, archRing, onMap, rect } from '../core/js/arcade.js';

const X = 247.6, Z = 217, TURN = 0.30;
const STONE = '#e6dccb', MARBLE = '#d7c4b6', BRICK = '#c9a68e', LEAD = '#7f888d', GOLD = '#d4ac45', DARK = '#3a3532', BLUE = '#2f4c7d', BRONZE = '#8c6b3a';
const FRONT = -55.6, BODY = 30;
const DOMES = [[0, 0, 8.6, 37.5, 56.3, 63.1], [-23.5, 0, 7.6, 37.5, 51.3, 58.1], [0, -24.7, 7.6, 37.5, 51.3, 58.1], [0, 25.2, 7.6, 37.5, 51.3, 58.1], [22.4, 1.2, 7.6, 37.5, 51.3, 58.1]]; // [u, v, radius, drum top, dome top, lantern top]

export function basilica() {
  const kit = new Kit();
  // the cross: its middle, the four arms, the apse; the narthex round the west and north, lower
  kit.box(28, BODY, 28, BRICK, 0, BODY / 2, 0);
  kit.box(28, BODY, 32, BRICK, -28, BODY / 2, 0);
  kit.box(18, BODY, 32, BRICK, 23, BODY / 2, 0);
  kit.add(new THREE.CylinderGeometry(10, 10, BODY - 4, 12, 1, false, 0, Math.PI), BRICK, 32, (BODY - 4) / 2, 0);
  kit.box(32, BODY, 26, BRICK, 0, BODY / 2, -26.5);
  kit.box(32, BODY, 26, BRICK, 0, BODY / 2, 25.5);
  kit.box(14, 22, 68, STONE, FRONT + 7, 11, 3.5);
  kit.box(28, 22, 10, STONE, -28, 11, -34.5);
  for (const [w, d, x, z] of [[28, 28, 0, 0], [28, 32, -28, 0], [18, 32, 23, 0], [32, 26, 0, -26.5], [32, 26, 0, 25.5]]) kit.box(w + 0.6, 0.8, d + 0.6, LEAD, x, BODY + 0.4, z);
  kit.box(14.6, 0.8, 68.6, LEAD, FRONT + 7, 22.4, 3.5).box(28.6, 0.8, 10.6, LEAD, -28, 22.4, -34.5);

  // the domes: drum, the ring of windows, the raised bulb, the lantern, the cross
  for (const [u, v, r, drum, top, lantern] of DOMES) {
    kit.add(new THREE.CylinderGeometry(r, r + 0.3, drum - BODY, 16), BRICK, u, (BODY + drum) / 2, v);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      kit.box(0.3, 2.6, 1.3, DARK, u + (r + 0.05) * Math.cos(a), drum - 3, v + (r + 0.05) * Math.sin(a), 0, -a);
    }
    kit.add(new THREE.CylinderGeometry(r + 0.5, r + 0.5, 0.8, 16), LEAD, u, drum + 0.4, v);
    const bulb = new THREE.SphereGeometry(r + 0.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    bulb.scale(1, (top - drum - 2.5) / (r + 0.4), 1);
    kit.add(bulb, LEAD, u, drum + 0.8, v);
    kit.add(new THREE.CylinderGeometry(1.2, 1.4, 2.6, 8), LEAD, u, top - 1.1, v);
    kit.add(new THREE.SphereGeometry(1.2, 8, 6), LEAD, u, top + 0.8, v);
    kit.rod([u, top + 1.8, v], [u, lantern, v], 0.12, GOLD, 4).box(0.2, 0.2, 1.6, GOLD, u, lantern - 1, v).box(1.6, 0.2, 0.2, GOLD, u, lantern - 1, v);
  }

  // the west front: five portals in deep round arches, the columns between, gold in the lunettes
  const W = 34.5, face = linePath(FRONT, W + 3.5, FRONT, -W + 3.5), mid = W; // s 0 at the south end
  const PORTALS = [[mid, 11, 17], [mid - 13.5, 8, 14], [mid + 13.5, 8, 14], [mid - 26, 7, 13], [mid + 26, 7, 13]];
  for (const [s, w, h] of PORTALS) {
    wall(kit, face, [[s - w / 2 - 1.2, -0.01], [s - w / 2, -0.01], ...archRing(s, w, 0, h, 12).slice(2).reverse(), [s + w / 2, -0.01], [s + w / 2 + 1.2, -0.01], ...archRing(s, w + 2.4, 0, h + 1.2, 12).slice(2)], { o0: 0, o1: 1.6, hex: MARBLE });
    wall(kit, face, archRing(s, w, 0, h, 12), { o0: 0, o1: 0.1, hex: GOLD });
    wall(kit, face, [[s - w / 2 + 0.6, 0], [s + w / 2 - 0.6, 0], [s + w / 2 - 0.6, h - w / 2 - 0.5], [s - w / 2 + 0.6, h - w / 2 - 0.5]], { o0: 0.1, o1: 0.2, hex: '#5a4636' });
    for (const d of [-1, 1]) for (let k = 0; k < 3; k++) {
      const p = face.at(s + d * (w / 2 + 0.6 + k * 0.55)), x = p.x - 0.3 - k * 0.3, z = p.z;
      kit.add(new THREE.CylinderGeometry(0.28, 0.3, h - w / 2 - 0.6, 6), k % 2 ? '#b98f84' : '#cfc2b0', x, (h - w / 2 - 0.6) / 2, z);
    }
  }
  // the terrace and its railing, the four horses
  kit.box(4, 0.8, 2 * W + 4, STONE, FRONT - 1, 18, 3.5);
  kit.box(0.4, 1.2, 2 * W + 4, MARBLE, FRONT - 2.8, 19, 3.5);
  for (const dv of [-4.5, -1.5, 1.5, 4.5]) {
    const v = 3.5 + dv, u = FRONT - 1.4;
    kit.box(2.6, 1.3, 0.8, BRONZE, u, 20.6, v);
    kit.box(0.8, 1.4, 0.6, BRONZE, u - 1.4, 21.6, v, 0, 0, 0.5);
    kit.box(0.7, 0.45, 0.45, BRONZE, u - 1.9, 22.2, v);
    for (const du of [-1, 1]) kit.box(0.3, 1.3, 0.3, BRONZE, u + du, 19.65, v);
  }
  // the upper arches: gold mosaics under ogee crowns, the saints and the lion
  for (const [s, w, h0, h1] of [[mid, 13, 18.6, 31], [mid - 13.5, 9.5, 18.6, 28], [mid + 13.5, 9.5, 18.6, 28], [mid - 26, 8.5, 18.6, 27], [mid + 26, 8.5, 18.6, 27]]) {
    wall(kit, face, archRing(s, w, h0, h1, 12), { o0: 0, o1: 0.3, hex: s === mid ? BLUE : GOLD });
    const crown = [[s - w / 2 - 0.8, h1 - w / 2], [s + w / 2 + 0.8, h1 - w / 2]];
    for (let k = 0; k <= 10; k++) { const t = k / 10; crown.push([s + w / 2 + 0.8 - t * (w + 1.6), h1 - w / 2 + Math.sin(t * Math.PI) * (w / 2 + 0.6) + (t > 0.35 && t < 0.65 ? 1.5 : 0)]); }
    wall(kit, face, [[s - w / 2 - 0.8, h1 - w / 2 - 0.6], [s + w / 2 + 0.8, h1 - w / 2 - 0.6], ...crown.slice(1).map(([a, b]) => [a, b + 0.8])], { o0: 0.3, o1: 0.7, hex: STONE, holes: [archRing(s, w, h1 - w / 2 - 0.3, h1, 12)] });
    const p = face.at(s);
    kit.add(new THREE.CylinderGeometry(0.4, 0.5, 2.4, 6), s === mid ? GOLD : '#efe9df', p.x - 0.5, h1 + 2.6, p.z);
    kit.add(new THREE.SphereGeometry(0.35, 6, 4), s === mid ? GOLD : '#efe9df', p.x - 0.5, h1 + 4, p.z);
    for (const d of [-1, 1]) {
      const q = face.at(s + d * (w / 2 + 1.6));
      kit.add(new THREE.CylinderGeometry(0.7, 0.9, 4, 6), STONE, q.x - 0.5, h1 - w / 2 + 3, q.z);
      kit.add(new THREE.ConeGeometry(0.8, 2.6, 6), STONE, q.x - 0.5, h1 - w / 2 + 6.3, q.z);
    }
  }
  // the gilt lion on the blue of the middle arch
  const lp = face.at(mid);
  kit.box(0.4, 1.6, 3, GOLD, lp.x - 0.35, 25.5, lp.z).box(0.4, 1, 1, GOLD, lp.x - 0.35, 26.6, lp.z - 1.6);
  // the upper storey's wall behind the arches
  kit.box(3, 14, 2 * W - 2, STONE, FRONT + 1.5, 25, 3.5);
  return kit.mesh(kitMat(0.85));
}

export const BASILICA = [{
  id: 'basilica-di-san-marco', name: 'Basilica di San Marco', x: X, z: Z, turn: TURN, reach: 100,
  area: [onMap(X, Z, TURN, rect(FRONT - 2, -40, 34, 39))],
  foot: [onMap(X, Z, TURN, rect(FRONT - 1, -39.5, 33, 38.5))],
  make: basilica,
}];
