// The Chiesa di Santa Chiara (Giuseppe Cino, 1687-91) on the Piazza Vittorio Emanuele II, modelled
// by hand in place of the map's outline of it, from its measurements and photos, in game metres (the
// real ones times 1.25):
//   the front, towards the square: the lower order of four columns on tall pedestals, the door under
//     its broken pediment between them and a saint in a niche either side; the upper order narrower,
//     the big window in its carved frame between two columns, scrolls stepping down to the lower
//     cornice, and the curved crown on top with its vases and the cross
//   behind it the church round its elongated octagon of a nave, higher than the chapels round it,
//     under a low roof of tiles
// The model's own metres: +u runs east to the square, along the church; +v across it (south).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { column } from '../core/js/arcade.js';
import { nearest, local, sides, prism, cornice, windows, roof, shrink, placeFront } from './outline.js';
import { STONE, STONE2, LIGHT, blk, col, pil, entab, balustrade, flame, volute, portal, niche, win, carving } from './baroque.js';

const X = 273.6, Z = 276.2, TURN = 0.333;
const CHURCH = nearest('church', X, Z, 4)?.p ?? [];
const LOW = 13.5, HIGH = 19;

function front() {
  const f = new Kit(), h = 9.6;
  blk(f, -h, h, 0, 12, -1.2, 0, STONE);
  blk(f, -6.4, 6.4, 12, 21, -1.2, 0, STONE);
  blk(f, -h - 0.2, h + 0.2, 0, 0.6, 0, 0.6, STONE2);
  // the lower order
  for (const x of [-8.2, -4.2, 4.2, 8.2]) col(f, x, 0.6, 10.8, 0.5, 0.9, LIGHT, { ped: 2.2, pedHex: STONE2, bands: 1 });
  for (const x of [-h + 0.35, h - 0.35]) pil(f, x, 0.6, 10.8, 0.7, STONE2);
  portal(f, 0, 3.0, 6.6, 0.6, STONE, { pediment: 'broken', frame: 0.55 });
  carving(f, -2.6, 2.6, 9.4, 10.6, LIGHT, 0.7);
  for (const s of [-1, 1]) niche(f, s * 6.2, 2.8, 1.7, 4.8, 0.4, STONE);
  entab(f, -h, h, 10.8, 1.4, 1.0, STONE);
  // the upper order, its window and the scrolls
  for (const x of [-5.4, -2.9, 2.9, 5.4]) col(f, x, 12.2, 19.6, 0.42, 0.6, LIGHT, { ped: 1.0, pedHex: STONE2 });
  win(f, 0, 13.6, 2.2, 4.0, 0.6, STONE, { arch: true, pediment: 'curve', frame: 0.5 });
  for (const s of [-1, 1]) {
    win(f, s * 4.15, 14.2, 0.9, 2.0, 0.3, STONE, { arch: true });
    volute(f, s * 7.6, 13.6, 1.2, 0.4, s, STONE2);
    const sh = new THREE.Shape();
    sh.moveTo(s * 6.4, 12.2); sh.lineTo(s * h, 12.2); sh.quadraticCurveTo(s * 7.2, 14.4, s * 6.4, 18.4); sh.closePath();
    f.add(new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 6 }), STONE, 0, 0, -0.9);
    flame(f, s * (h - 0.3), 12.2, 0.6, 1.5, STONE2);
  }
  balustrade(f, -h, -6.4, 12.2, 0.9, 0.8, LIGHT);
  balustrade(f, 6.4, h, 12.2, 0.9, 0.8, LIGHT);
  entab(f, -6.4, 6.4, 19.6, 1.3, 0.8, STONE);
  // the crown: a curved gable over the middle, vases at its feet, the cross on top
  const crown = new THREE.Shape();
  crown.moveTo(-5.4, 20.9); crown.lineTo(5.4, 20.9); crown.quadraticCurveTo(4.4, 22.8, 2.4, 23.4); crown.quadraticCurveTo(0, 24.4, -2.4, 23.4); crown.quadraticCurveTo(-4.4, 22.8, -5.4, 20.9);
  f.add(new THREE.ExtrudeGeometry(crown, { depth: 1, bevelEnabled: false, curveSegments: 6 }), STONE, 0, 0, -0.6);
  f.add(new THREE.SphereGeometry(0.8, 8, 6).scale(1, 1.25, 0.45), LIGHT, 0, 22.2, 0.45);
  for (const s of [-1, 1]) flame(f, s * 5.6, 20.9, 0.2, 1.5, STONE2);
  blk(f, -0.12, 0.12, 24.2, 26.2, -0.2, 0.05, STONE2);
  blk(f, -0.6, 0.6, 25.3, 25.55, -0.2, 0.05, STONE2);
  return f;
}

export function santaChiara() {
  const kit = new Kit(), ring = local(CHURCH, X, Z, TURN);
  // the chapels round the nave: the whole outline, its windows, cornice and balustrade
  prism(kit, ring, 0, LOW, STONE2);
  for (const path of sides(ring, 4)) {
    const L = path.length, n = Math.max(1, Math.floor(L / 5));
    for (let k = 0; k <= n; k++) column(kit, path, Math.min(Math.max((k * L) / n, 0.4), L - 0.4), 0.2, 0.5, LOW - 1.3, 0.4, STONE, 'pilaster');
  }
  windows(kit, ring, { bay: 5, w: 1.4, y0: 6.5, y1: 10, arch: true, sill: STONE, min: 4, skip: u => u > 15 });
  cornice(kit, ring, LOW, STONE, { out: 0.6, h: 1.1, rail: 0.9, railHex: LIGHT, min: 1 });
  // the nave, an elongated octagon, higher, its windows and a low roof of tiles
  const oct = [[-15, -1], [-9, -8], [6, -8], [11, -3], [11, 8], [6, 13], [-10, 13], [-15, 8]];
  prism(kit, oct, LOW, HIGH, STONE2);
  windows(kit, oct, { bay: 7, w: 1.4, y0: LOW + 1.2, y1: HIGH - 1.2, arch: true, sill: STONE });
  cornice(kit, oct, HIGH, STONE, { out: 0.5, h: 0.9 });
  roof(kit, shrink(oct, -0.03), shrink(oct, 0.7), HIGH, HIGH + 3.4, '#b06a45');
  placeFront(kit, front(), 16.9, 1.9, 0.996, 0.088);
  return kit.mesh(kitMat(0.85, 0));
}

export const SANTA_CHIARA = CHURCH.length ? [{
  id: 'santa-chiara', name: 'Chiesa di Santa Chiara', x: X, z: Z, turn: TURN, reach: 240,
  area: [CHURCH], foot: [CHURCH], make: santaChiara,
}] : [];
