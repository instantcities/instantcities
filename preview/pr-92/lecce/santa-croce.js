// The Basilica di Santa Croce (1549-1695: Gabriele Riccardi below, Giuseppe Zimbalo and Cesare Penna
// above), modelled by hand in place of the map's outline of it, from its measurements and photos, in
// game metres (the real ones times 1.25): the high point of the Lecce baroque, its front towards the
// Via Umberto I carved all over in the honey-coloured pietra leccese.
//   the lower order: six columns on their pedestals, their shafts ringed with carving; the main door
//     under its broken pediment with the shield, a smaller door on either side, niches with saints
//   the balcony across the whole front on its thirteen carved figures and beasts, and its balustrade
//   the upper order: the great rose window in its wreath of fruit and cherubs between four columns,
//     the saints Benedict and Celestine in their niches either side, scrolls down to the balcony
//   the top: the entablature, a balustrade with vases, the carved crown with its shield and the cross
//   behind it the church: its aisles and the higher nave under a low roof of tiles, the windows along
//     its sides between pilasters, and the dome on its drum over the crossing
// The model's own metres: +u runs east from the front along the nave, +v across it (south).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { gable, column } from '../core/js/arcade.js';
import { nearest, local, sides, prism, cornice, windows, dome, placeFront } from './outline.js';
import { STONE, STONE2, LIGHT, blk, col, pil, entab, balustrade, flame, volute, portal, niche, win, rose, telamons, carving } from './baroque.js';

const X = 483.2, Z = -117.1, TURN = 0.0846; // the middle of the map's outline, and the nave turned from east
const CHURCH = nearest('church', X, Z, 4)?.p ?? [];
const FRONT = -37.5, MIDV = -4.6, W = 29.6; // the front's line, its middle across and its width
const AISLE = 15, NAVE = 21.5, ROOFC = '#b06a45';

// the front, in its own frame (x across, y up, z out to the street)
function front() {
  const f = new Kit(), h = W / 2;
  // the wall behind it all, and the plinth along its foot
  blk(f, -h, h, 0, 15, -1.2, 0, STONE);
  blk(f, -11.6, 11.6, 15, 28, -1.2, 0, STONE);
  blk(f, -h - 0.2, h + 0.2, 0, 0.6, 0, 0.6, STONE2);
  // the lower order: six columns on pedestals, carved rings on their shafts
  for (const x of [-13.2, -9, -4.4, 4.4, 9, 13.2]) col(f, x, 0.6, 12.4, 0.55, 0.95, LIGHT, { ped: 2.4, pedHex: STONE2, bands: 3 });
  for (const x of [-h + 0.4, h - 0.4]) pil(f, x, 0.6, 12.4, 0.8, STONE2);
  // the doors: the great one in the middle, a smaller one in each side bay with a window over it
  portal(f, 0, 3.4, 7.4, 0.55, STONE, { pediment: 'broken', frame: 0.65 });
  carving(f, -3.6, 3.6, 10.2, 12.2, LIGHT, 0.8);
  for (const s of [-1, 1]) {
    portalAt(f, s * 6.7);
    niche(f, s * 11.1, 2.6, 1.9, 4.6, 0.35, STONE);
    win(f, s * 11.1, 8.4, 1.3, 2.2, 0.3, STONE, { pediment: 'curve' });
  }
  // the entablature, the carved figures in its frieze holding up the balcony, the balcony itself
  entab(f, -h, h, 12.4, 1.5, 1.0, STONE);
  telamons(f, -13.2, 13.2, 12.5, 14.4, 1.7, 2.2, STONE2);
  blk(f, -h - 0.3, h + 0.3, 14.4, 14.9, -0.5, 2.0, STONE2);
  balustrade(f, -h - 0.2, h + 0.2, 14.9, 1.25, 1.95, LIGHT, { post: 2.45 });
  // the upper order: four columns, the rose window between the middle two, a saint in a niche
  // between each outer pair, and the scrolls stepping down to the balcony's ends
  for (const x of [-9.6, -5.7, 5.7, 9.6]) col(f, x, 15.1, 26.3, 0.5, 0.7, LIGHT, { ped: 1.3, pedHex: STONE2, bands: 2 });
  for (const x of [-11.2, 11.2]) pil(f, x, 15.1, 26.3, 0.7, STONE2);
  blk(f, -4.9, 4.9, 16.4, 26.0, 0, 0.12, STONE2);
  rose(f, 0, 21.3, 3.0, 0.5, STONE, { spokes: 16, heads: 16 });
  for (const s of [-1, 1]) {
    niche(f, s * 7.65, 16.8, 2.0, 5.0, 0.35, STONE);
    carving(f, s * 7.65 - 1.2, s * 7.65 + 1.2, 23, 25.6, LIGHT, 0.75);
    volute(f, s * 12.6, 17.2, 1.4, 0.4, s, STONE2);
    const sh = new THREE.Shape();
    sh.moveTo(s * 11.6, 15); sh.lineTo(s * 14.4, 15); sh.quadraticCurveTo(s * 12.2, 17.5, s * 11.6, 21.5); sh.closePath();
    f.add(new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 6 }), STONE, 0, 0, -0.9);
    flame(f, s * 14.1, 15.0, 1.5, 1.6, STONE2);
  }
  // the top: its entablature, a balustrade with vases on its posts, and the carved crown in the middle
  entab(f, -11.6, 11.6, 26.3, 1.5, 0.9, STONE);
  balustrade(f, -11.6, 11.6, 27.8, 1.1, 0.4, LIGHT, { post: 3.87, tops: 'vase' });
  const crown = new THREE.Shape();
  crown.moveTo(-3.8, 27.8); crown.lineTo(3.8, 27.8); crown.lineTo(3.8, 30.2); crown.quadraticCurveTo(2.6, 30.4, 1.6, 31.6);
  crown.quadraticCurveTo(0.8, 32.6, 0, 32.8); crown.quadraticCurveTo(-0.8, 32.6, -1.6, 31.6); crown.quadraticCurveTo(-2.6, 30.4, -3.8, 30.2); crown.closePath();
  f.add(new THREE.ExtrudeGeometry(crown, { depth: 1.0, bevelEnabled: false, curveSegments: 6 }), STONE, 0, 0, -0.6);
  f.add(new THREE.SphereGeometry(1.0, 8, 6).scale(1, 1.25, 0.4), LIGHT, 0, 30.2, 0.5);
  for (const s of [-1, 1]) volute(f, s * 3.1, 29.2, 0.7, 0.5, -s, STONE2);
  blk(f, -0.12, 0.12, 32.8, 35.0, -0.25, 0.0, STONE2);
  blk(f, -0.7, 0.7, 34.0, 34.25, -0.25, 0.0, STONE2);
  return f;
}

// a side door: smaller, under a curved pediment, a little window over it
function portalAt(f, x) {
  const g = new Kit();
  portal(g, 0, 2.0, 5.2, 0.4, STONE, { pediment: 'curve', frame: 0.45 });
  for (const p of g.pieces) f.pieces.push(p.translate(x, 0, 0));
  win(f, x, 8.0, 1.4, 2.4, 0.3, STONE, { arch: true });
}

export function santaCroce() {
  const kit = new Kit(), ring = local(CHURCH, X, Z, TURN);
  // the aisles and chapels: the whole outline, its cornice, windows along its sides
  prism(kit, ring, 0, AISLE, STONE2);
  for (const path of sides(ring, 4)) {
    const L = path.length, n = Math.max(1, Math.floor(L / 5));
    for (let k = 0; k <= n; k++) column(kit, path, Math.min(Math.max((k * L) / n, 0.4), L - 0.4), 0.2, 0.5, AISLE - 1.4, 0.4, STONE, 'pilaster');
  }
  windows(kit, ring, { bay: 5, w: 1.6, y0: 6.5, y1: 10.5, arch: true, sill: STONE, min: 4, skip: u => u < FRONT + 2 });
  cornice(kit, ring, AISLE, STONE, { out: 0.6, h: 1.1, min: 1 });
  // the nave, higher, its clerestory windows and a low roof of tiles over it
  const nave = [[FRONT + 0.5, MIDV - 7.5], [33, MIDV - 7.5], [33, MIDV + 7.5], [FRONT + 0.5, MIDV + 7.5]];
  prism(kit, nave, AISLE, NAVE, STONE2);
  windows(kit, nave, { bay: 6, w: 1.6, y0: AISLE + 1.6, y1: NAVE - 1.4, arch: true, sill: STONE, skip: u => u < FRONT + 3 || (u > 0 && u < 13) });
  cornice(kit, nave, NAVE, STONE, { out: 0.5, h: 0.9 });
  gable(kit, FRONT + 1, 33, 7.6, NAVE, NAVE + 3.4, ROOFC, { z: MIDV });
  // the transept's arms either side of the crossing, and the dome over it on its drum, its lantern
  for (const s of [-1, 1]) {
    prism(kit, [[0.6, MIDV + s * 7.5], [12.6, MIDV + s * 7.5], [12.6, MIDV + s * 12.5], [0.6, MIDV + s * 12.5]], AISLE, NAVE - 1, STONE2);
    cornice(kit, [[0.6, MIDV + s * 7.5], [12.6, MIDV + s * 7.5], [12.6, MIDV + s * 12.5], [0.6, MIDV + s * 12.5]], NAVE - 1, STONE, { out: 0.4, h: 0.7 });
  }
  const cu = 6.6, cv = MIDV;
  kit.add(new THREE.CylinderGeometry(6.2, 6.2, 5.2, 8), STONE, cu, NAVE + 2.6, cv);
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) / 8) * Math.PI * 2;
    kit.box(1.3, 2.6, 0.3, '#3a3129', cu + Math.cos(a) * 5.85, NAVE + 2.8, cv + Math.sin(a) * 5.85, 0, -a + Math.PI / 2);
    kit.box(0.6, 5.2, 0.6, STONE2, cu + Math.cos(a - Math.PI / 8) * 6.2, NAVE + 2.6, cv + Math.sin(a - Math.PI / 8) * 6.2);
  }
  kit.add(new THREE.CylinderGeometry(6.7, 6.7, 0.6, 8), STONE2, cu, NAVE + 5.4, cv);
  dome(kit, cu, cv, 5.9, NAVE + 5.7, 5.4, '#c9a873', { n: 16, rows: 6, ribs: 8, ribHex: STONE2 });
  kit.add(new THREE.CylinderGeometry(1.1, 1.1, 2.2, 8), STONE, cu, NAVE + 12.1, cv);
  dome(kit, cu, cv, 1.3, NAVE + 13.2, 1.2, '#c9a873', { n: 8, rows: 4 });
  flame(kit, cu, NAVE + 14.3, cv, 1.4, STONE2);
  // the front
  placeFront(kit, front(), FRONT, MIDV, -1, 0);
  return kit.mesh(kitMat(0.85, 0));
}

export const SANTA_CROCE = CHURCH.length ? [{
  id: 'santa-croce', name: 'Basilica di Santa Croce', x: X, z: Z, turn: TURN, reach: 320,
  area: [CHURCH], foot: [CHURCH], make: santaCroce,
}] : [];
