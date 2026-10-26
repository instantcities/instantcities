// The Piazza del Duomo, the square closed on three sides that you enter from the Via Vittorio Emanuele
// through a narrow gap in its north side, modelled by hand in place of the map's outlines, from their
// measurements and photos, in game metres (the real ones times 1.25), all in pietra leccese:
//   the Duomo (Santa Maria Assunta, rebuilt 1659-70 by Giuseppe Zimbalo) on the east side, with its
//     two fronts: the main one to the west, sober, two orders of pilasters round the door and a window;
//     and the showier one on its north side, facing you as you come in: a triumphal arch round the door
//     between pairs of columns and saints in niches, a balcony over it, the upper order with Sant'Oronzo
//     in his niche and a balustrade of saints on top. Behind them the nave under a low roof of tiles,
//     the transept's north arm and the aisles round them.
//   the campanile (Zimbalo, 1661-82), 70 m in five storeys, each a little narrower than the one under
//     it with a balustrade round its foot, an arched opening in each face of the upper four, and on
//     top an octagonal lantern with its little dome and the statue of Sant'Oronzo
//   the Palazzo del Seminario (Giuseppe Cino, 1694-1709) on the west side: its front banded all over in
//     rusticated stone, the portal with the balcony over it, the rich frames of the upper windows, the
//     balustrade along its top; round its courtyard, and Cino's carved well in the middle of it
//   the Palazzo Vescovile at the back (south) of the square, its front only (the rest of its block is
//     the map's): the loggia of arches along the ground floor, the windows over it, the balustrade and
//     the clock in the middle
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { gable, column, onMap, rect } from '../core/js/arcade.js';
import { nearest, local, sides, prism, cornice, windows, shrink, figure, placeFront, box } from './outline.js';
import { STONE, STONE2, LIGHT, SHADOW, DARK, blk, slab, archShape, archFrame, col, pil, entab, balustrade, flame, volute, portal, niche, win, carving } from './baroque.js';

const ROOFC = '#b06a45';

// ---------------------------------------------------------------- the Duomo
// the nave runs east from the main front (+u), +v across it (south); the north front looks to -v
const DX = 68.3, DZ = 284.5, DTURN = 0.27;
const CHURCH = nearest('church', DX, DZ, 4)?.p ?? [];
const AISLE = 16, NAVE = 24;

// the main front, to the west: 18 m wide in its middle, two orders of pilasters, the door, a window
function westFront() {
  const f = new Kit(), h = 9.2;
  blk(f, -h - 4.5, h + 4.5, 0, AISLE, -1, 0, STONE);
  blk(f, -h, h, 0, 25, -1, 0.3, STONE);
  blk(f, -h - 4.5, h + 4.5, 0, 0.6, 0, 0.6, STONE2);
  for (const x of [-h + 0.5, -4.6, 4.6, h - 0.5]) pil(f, x, 0.6, 11.6, 1.1, LIGHT, { z: 0.3, d: 0.4 });
  for (const x of [-h - 4, h + 4]) pil(f, x, 0.6, AISLE - 1.2, 0.9, STONE2);
  portal(f, 0, 3.4, 7.2, 0.8, STONE, { pediment: 'tri', frame: 0.6, arch: false });
  for (const s of [-1, 1]) niche(f, s * 6.9, 2.2, 1.8, 4.6, 0.6, STONE);
  entab(f, -h - 0.2, h + 0.2, 11.6, 1.4, 1.0, STONE);
  // the upper order, narrower, with its window and two saints, scrolls down to the lower cornice
  for (const x of [-6.2, -3.2, 3.2, 6.2]) pil(f, x, 13, 21.2, 0.9, LIGHT, { z: 0.3, d: 0.4 });
  win(f, 0, 14.2, 2.6, 4.4, 0.6, STONE, { arch: true, pediment: 'curve' });
  for (const s of [-1, 1]) {
    niche(f, s * 4.7, 14.4, 1.4, 3.8, 0.5, STONE);
    volute(f, s * 7.7, 14.2, 1.1, 0.6, s, STONE2);
  }
  entab(f, -6.8, 6.8, 21.2, 1.3, 0.9, STONE);
  balustrade(f, -6.8, 6.8, 22.5, 1.1, 0.6, LIGHT, { post: 3.4, tops: 2.2 });
  balustrade(f, -h - 0.2, -6.8, 13, 1.0, 0.8, LIGHT, { post: 2.4, tops: 'vase' });
  balustrade(f, 6.8, h + 0.2, 13, 1.0, 0.8, LIGHT, { post: 2.4, tops: 'vase' });
  return f;
}

// the north front, facing the way in: a triumphal arch round the door, the balcony over it,
// Sant'Oronzo high up in his niche between the columns, and saints along the balustrade on top
function northFront() {
  const f = new Kit(), h = 11.1;
  blk(f, -h, h, 0, 27.5, -1.2, 0, STONE);
  blk(f, -h - 0.2, h + 0.2, 0, 0.7, 0, 0.7, STONE2);
  // the lower order: two pairs of columns either side of the arch, saints in niches between them
  for (const x of [-9.8, -6.6, 6.6, 9.8]) col(f, x, 0.7, 13.2, 0.6, 1.05, LIGHT, { ped: 2.6, pedHex: STONE2, bands: 1 });
  for (const s of [-1, 1]) niche(f, s * 8.2, 3.6, 1.8, 5.2, 0.4, STONE);
  // the great arch: its deep frame, the door in it under a curved pediment, a carved band round it
  slab(f, archShape(0, 7.4, 0.7, 12.4), -0.3, 0.02, SHADOW);
  archFrame(f, 0, 7.4, 0.7, 12.4, 0.9, 0, 0.9, STONE2);
  portal(f, 0, 3.0, 6.4, 0.6, STONE, { pediment: 'curve', frame: 0.5 });
  win(f, 0, 8.8, 2.2, 2.4, 0.4, STONE, { arch: true });
  f.add(new THREE.SphereGeometry(0.75, 8, 6).scale(1, 1.3, 0.5), LIGHT, 0, 12.9, 1.0);
  entab(f, -h, h, 13.2, 1.6, 1.2, STONE);
  // the balcony over the arch on its brackets, with its balustrade
  for (const x of [-3.6, -1.8, 0, 1.8, 3.6]) f.box(0.5, 1.1, 1.5, STONE2, x, 14.4, 1.5);
  blk(f, -4.6, 4.6, 14.8, 15.3, 0, 2.3, STONE2);
  balustrade(f, -4.6, 4.6, 15.3, 1.1, 2.2, LIGHT, { post: 2.3 });
  // the upper order: four columns, Sant'Oronzo in the middle, two more saints, the scrolls
  for (const x of [-7.4, -4.4, 4.4, 7.4]) col(f, x, 14.8, 25.4, 0.48, 0.8, LIGHT, { ped: 1.4, pedHex: STONE2 });
  slab(f, archShape(0, 3.4, 17, 24.2), -0.3, 0.05, SHADOW);
  archFrame(f, 0, 3.4, 17, 24.2, 0.5, 0, 0.6, STONE2);
  figure(f, 0, 17.2, 0.5, 4.8, LIGHT);
  carving(f, -3.2, 3.2, 24.6, 25.3, LIGHT, 0.7);
  for (const s of [-1, 1]) {
    niche(f, s * 5.9, 17.6, 1.5, 4.4, 0.4, STONE);
    volute(f, s * 9.4, 16.4, 1.5, 0.5, s, STONE2);
    const sh = new THREE.Shape();
    sh.moveTo(s * 8.0, 14.8); sh.lineTo(s * h, 14.8); sh.quadraticCurveTo(s * 9.2, 17.5, s * 8.0, 21.5); sh.closePath();
    slab(f, sh, -0.9, 0.2, STONE);
  }
  entab(f, -8.2, 8.2, 25.4, 1.4, 0.9, STONE);
  balustrade(f, -8.2, 8.2, 26.8, 1.1, 0.5, LIGHT, { post: 2.73, tops: 2.4 });
  for (const s of [-1, 1]) flame(f, s * 10.4, 14.8, 0.6, 1.8, STONE2);
  return f;
}

export function duomo() {
  const kit = new Kit(), ring = local(CHURCH, DX, DZ, DTURN);
  // the aisles, chapels and the arms round the nave: the whole outline, a storey of windows, its cornice
  prism(kit, ring, 0, AISLE, STONE2);
  for (const path of sides(ring, 4)) {
    const L = path.length, n = Math.max(1, Math.floor(L / 5));
    for (let k = 0; k <= n; k++) column(kit, path, Math.min(Math.max((k * L) / n, 0.4), L - 0.4), 0.2, 0.5, AISLE - 1.4, 0.4, STONE, 'pilaster');
  }
  windows(kit, ring, { bay: 5, w: 1.5, y0: 7, y1: 11.5, arch: true, sill: STONE, min: 4, skip: (u, v) => u < -37 || (v < -8 && u < -7) });
  cornice(kit, ring, AISLE, STONE, { out: 0.6, h: 1.1, rail: 1.0, railHex: LIGHT, min: 1 });
  // the nave from the west front to the apse, its clerestory, a low roof of tiles over it
  const nave = [[-39, 3], [26, 3], [26, 20.6], [-39, 20.6]];
  prism(kit, nave, AISLE, NAVE, STONE2);
  windows(kit, nave, { bay: 6.5, w: 1.6, y0: AISLE + 1.8, y1: NAVE - 1.6, arch: true, sill: STONE, skip: u => u < -36 });
  cornice(kit, nave, NAVE, STONE, { out: 0.5, h: 0.9 });
  gable(kit, -38.6, 25.6, 9.2, NAVE, NAVE + 3.6, ROOFC, { z: 11.8 });
  // the transept's north arm, as high as the nave's walls, its roof running north
  const arm = [[-1.5, 3.2], [23.4, 3.2], [23.4, -24.5], [-1.5, -24.5]];
  prism(kit, arm, AISLE, NAVE - 1, STONE2);
  cornice(kit, arm, NAVE - 1, STONE, { out: 0.5, h: 0.9 });
  gable(kit, -3.2, 24.5, 12.4, NAVE - 1, NAVE + 2.6, ROOFC, { x: 10.95, turn: Math.PI / 2 });
  // the fronts: the main one on the west, the showy one on the north side
  placeFront(kit, westFront(), -39.7, 11.8, -1, 0.033);
  placeFront(kit, northFront(), -19.9, -11.2, -0.036, -1);
  return kit.mesh(kitMat(0.85, 0));
}

// ---------------------------------------------------------------- the campanile
const CX = 61.65, CZ = 252.8, CTURN = 0.353;
const TOWER = nearest('tower', CX, CZ, 4)?.p ?? [];
// the storeys: [foot, top, half its width]
const STOREYS = [[0, 21, 6.1], [21, 37, 5.55], [37, 52, 5.0], [52, 65, 4.5], [65, 76, 4.0]];

// one face of a storey, w wide from its foot to h: corner pilasters, the arched opening (dark), the
// balustrade along its foot (but the lowest)
function storeyFace(w, h, k) {
  const f = new Kit(), half = w / 2;
  for (const s of [-1, 1]) pil(f, s * (half - 0.45), 0, h - 1.3, 0.9, LIGHT, { d: 0.35 });
  if (k === 0) {
    portal(f, 0, 2.2, 4.4, 0.4, STONE, { pediment: 'tri', frame: 0.45, arch: false });
    for (const y of [9, 15]) win(f, 0, y, 1.0, 1.8, 0.25, STONE);
    for (let y = 0.6; y < h - 2; y += 1.4) for (const s of [-1, 1]) blk(f, s * (half - 1.5) - 0.4, s * (half - 1.5) + 0.4, y, y + 0.6, 0, 0.12, STONE2);
  } else {
    const ww = Math.min(w * 0.38, 3.2), top = h - 2.6;
    slab(f, archShape(0, ww, 2.2, top), -0.4, 0.02, DARK);
    archFrame(f, 0, ww, 2.2, top, 0.4, 0, 0.35, STONE2);
    blk(f, -ww / 2 - 0.6, ww / 2 + 0.6, 1.9, 2.2, 0, 0.45, STONE2);
    for (const s of [-1, 1]) col(f, s * (ww / 2 + 0.8), 1.4, h - 1.3, 0.3, 0.55, LIGHT, { order: 'ionic' });
  }
  entab(f, -half, half, h - 1.3, 1.3, 0.7, STONE);
  return f;
}

export function campanile() {
  const kit = new Kit();
  STOREYS.forEach(([y0, y1, hw], k) => {
    kit.box(2 * hw, y1 - y0, 2 * hw, STONE, 0, (y0 + y1) / 2, 0);
    for (let q = 0; q < 4; q++) {
      const a = (q * Math.PI) / 2, nu = Math.cos(a), nv = Math.sin(a);
      placeFront(kit, storeyFace(2 * hw, y1 - y0, k), nu * hw, nv * hw, nu, nv, y0);
    }
    if (k) {
      // the balustrade round its foot, on the ledge of the storey below, with vases at the corners
      const r = STOREYS[k - 1][2] - 0.1;
      for (let q = 0; q < 4; q++) {
        const a = (q * Math.PI) / 2, nu = Math.cos(a), nv = Math.sin(a), f = new Kit();
        balustrade(f, -r, r, 0, 1.1, 0, LIGHT, { step: 0.55 });
        flame(f, -r + 0.3, 1.1, -0.3, 1.2, STONE2);
        placeFront(kit, f, nu * r, nv * r, nu, nv, y0);
      }
    }
  });
  // the octagonal lantern, its dome with the ribs, and the saint on top
  const top = 76;
  kit.add(new THREE.CylinderGeometry(3.6, 3.6, 0.6, 8), STONE2, 0, top + 0.3, 0);
  kit.add(new THREE.CylinderGeometry(3.0, 3.0, 4.2, 8), STONE, 0, top + 2.7, 0);
  for (let q = 0; q < 8; q++) {
    const a = ((q + 0.5) / 8) * Math.PI * 2;
    kit.box(1.1, 2.4, 0.3, DARK, Math.cos(a) * 2.8, top + 2.6, Math.sin(a) * 2.8, 0, -a + Math.PI / 2);
    kit.box(0.45, 4.2, 0.45, LIGHT, Math.cos(a - Math.PI / 8) * 3.0, top + 2.7, Math.sin(a - Math.PI / 8) * 3.0);
  }
  kit.add(new THREE.CylinderGeometry(3.4, 3.4, 0.5, 8), STONE2, 0, top + 5.05, 0);
  kit.add(new THREE.SphereGeometry(2.9, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.1, 1), '#c7a46c', 0, top + 5.3, 0);
  kit.add(new THREE.CylinderGeometry(0.6, 0.8, 1.2, 8), STONE2, 0, top + 8.9, 0);
  figure(kit, 0, top + 9.4, 0, 2.6, '#c8b48a');
  return kit.mesh(kitMat(0.85, 0));
}

// ---------------------------------------------------------------- the Seminario
// its front to the square looks along +u
const SX = -40, SZ = 276, STURN = 0.2864;
const SEMINARIO = nearest('yes', -45.8, 280.6, 4)?.p ?? [];
// its courtyard, from OpenStreetMap (the map fills it in), in the city's metres
const YARD = [-53.1, 288.4, -59, 267.6, -28, 258.8, -22.1, 279.6];
const SH = 19.5; // the top of its cornice

// the front to the square: bands of rusticated stone all over, the portal with the balcony over it,
// the rich frames of the upper windows
function seminarioFront(w) {
  const half = w / 2, n = 9, bay = w / n, wall = new Kit();
  // the rustication: the face stands out, its courses parted by deep joints
  blk(wall, -half, half, 0, SH - 1.4, 0, 0.3, STONE);
  for (let y = 1.2; y < SH - 1.6; y += 0.9) blk(wall, -half, half, y, y + 0.12, 0.3, 0.34, SHADOW);
  // the rest stands on that face
  const f = new Kit();
  blk(f, -half - 0.2, half + 0.2, 0, 0.5, 0, 0.5, STONE2);
  blk(f, -half, half, 8.8, 9.6, 0, 0.6, STONE); // the string course between the storeys
  for (const s of [-1, 1]) for (let y = 0.5; y < SH - 1; y += 1.4) blk(f, s * (half - 0.8) - 0.8, s * (half - 0.8) + 0.8, y, y + 0.8, 0, 0.35, LIGHT);
  for (let i = 0; i < n; i++) {
    const x = -half + (i + 0.5) * bay;
    if (i === (n - 1) / 2) {
      portal(f, x, 3.0, 6.0, 0.7, STONE, { pediment: 'none', frame: 0.7 });
      for (const s of [-1, 1]) col(f, x + s * 2.6, 0.5, 8.4, 0.38, 0.6, LIGHT, { order: 'ionic' });
      for (const xb of [-1.6, 0, 1.6]) f.box(0.45, 0.9, 1.3, STONE2, x + xb, 9.2, 1.0);
      blk(f, x - 2.8, x + 2.8, 9.6, 10.0, 0, 2.0, STONE2);
      balustrade(f, x - 2.8, x + 2.8, 10.0, 1.0, 1.95, LIGHT, { post: 2.8 });
      win(f, x, 10.0, 1.9, 4.2, 0.6, LIGHT, { pediment: 'curve', frame: 0.5 });
      carving(f, x - 1.6, x + 1.6, 16.5, 17.6, LIGHT, 0.6);
    } else {
      win(f, x, 2.6, 1.3, 3.0, 0.35, STONE, { pediment: 'none' });
      win(f, x, 11.2, 1.6, 3.6, 0.5, LIGHT, { pediment: i % 2 ? 'tri' : 'curve', frame: 0.45 });
      carving(f, x - 0.8, x + 0.8, 16.9, 17.5, LIGHT, 0.55);
    }
  }
  entab(f, -half, half, SH - 1.4, 1.4, 0.9, STONE);
  balustrade(f, -half, half, SH, 1.1, 0.3, LIGHT, { post: bay, tops: 'vase' });
  for (const p of f.pieces) wall.pieces.push(p.translate(0, 0, 0.34));
  return wall;
}

// Cino's well in the courtyard: a round basin on steps, two columns carrying a carved lintel and a
// crown of leaves and fruit over it
function well(kit, u, v) {
  kit.add(new THREE.CylinderGeometry(2.6, 2.8, 0.4, 16), STONE2, u, 0.2, v);
  kit.add(new THREE.CylinderGeometry(1.7, 1.8, 1.3, 16), STONE, u, 1.05, v);
  kit.add(new THREE.CylinderGeometry(1.4, 1.4, 0.1, 16), '#2f3a3c', u, 1.68, v);
  for (const s of [-1, 1]) {
    kit.add(new THREE.CylinderGeometry(0.28, 0.32, 3.6, 8), LIGHT, u + s * 1.9, 2.1, v);
    kit.add(new THREE.SphereGeometry(0.5, 7, 5), STONE2, u + s * 1.9, 4.1, v);
  }
  kit.box(4.6, 0.7, 0.8, STONE, u, 4.4, v);
  kit.add(new THREE.SphereGeometry(1.1, 8, 6).scale(1.4, 0.9, 0.6), LIGHT, u, 5.3, v);
  flame(kit, u, 5.9, v, 1.4, STONE2);
}

export function seminario() {
  const kit = new Kit(), ring = local(SEMINARIO, SX, SZ, STURN), yard = local(YARD, SX, SZ, STURN);
  prism(kit, ring, 0, SH - 1.4, STONE2, [yard]);
  // its other sides and the courtyard's: two storeys of plain windows, the cornice and balustrade
  windows(kit, ring, { bay: 4.6, w: 1.3, y0: 2.6, y1: 5.6, sill: STONE, head: 'flat', min: 4, skip: u => u > 32 });
  windows(kit, ring, { bay: 4.6, w: 1.5, y0: 11.2, y1: 14.8, sill: STONE, head: 'tri', min: 4, skip: u => u > 32 });
  windows(kit, yard, { bay: 4.6, w: 1.3, y0: 2.6, y1: 5.6, sill: STONE, head: 'flat', hole: true });
  windows(kit, yard, { bay: 4.6, w: 1.5, y0: 11.2, y1: 14.8, sill: STONE, head: 'flat', hole: true });
  cornice(kit, ring, SH, STONE, { out: 0.8, h: 1.4, rail: 1.1, railHex: LIGHT });
  cornice(kit, yard, SH, STONE, { out: 0.5, h: 1.0, hole: true });
  prism(kit, shrink(ring, 0.01), SH - 1.4, SH - 0.9, '#cbbd9f', [yard]);
  const y = box(yard);
  well(kit, y.u, y.v);
  placeFront(kit, seminarioFront(45.4), 33.9, -1.8, 1, 0);
  return kit.mesh(kitMat(0.85, 0));
}

// ---------------------------------------------------------------- the Palazzo Vescovile's front
// its front along the south side of the square, looking north (-v), the map's block behind it
const VX = 20.25, VZ = 317.65, VTURN = 0.1553, VW = 31.4, VH = 19;

function vescovileFront() {
  const f = new Kit(), half = VW / 2, n = 7, bay = VW / n;
  blk(f, -half, half, 0, VH, -10, 0, STONE2);
  blk(f, -half - 0.2, half + 0.2, 0, 1.1, 0, 1.2, STONE2); // the podium the loggia stands on
  // the loggia: a row of arches on piers along the ground floor, dark behind
  for (let i = 0; i < n; i++) {
    const x = -half + (i + 0.5) * bay;
    slab(f, archShape(x, bay * 0.66, 1.1, 7.6), -0.6, 0.02, SHADOW);
    archFrame(f, x, bay * 0.66, 1.1, 7.6, 0.3, 0, 0.35, LIGHT);
    blk(f, x - 0.35, x + 0.35, 6.9, 7.9, 0, 0.5, STONE2); // the keystone
    win(f, x, 10.0, 1.6, 3.6, 0.45, LIGHT, { pediment: i === (n - 1) / 2 ? 'curve' : 'tri' });
    blk(f, x - 1.4, x + 1.4, 9.4, 9.7, 0, 0.9, STONE2); // a balcony shelf under each window
  }
  for (let i = 0; i <= n; i++) pil(f, -half + i * bay, 1.1, 8.4, 0.8, STONE, { d: 0.4 });
  entab(f, -half, half, 8.4, 1.0, 0.8, STONE);
  for (let i = 0; i <= n; i++) pil(f, -half + i * bay, 9.4, VH - 1.3, 0.7, STONE, { d: 0.3 });
  entab(f, -half, half, VH - 1.3, 1.3, 0.8, STONE);
  balustrade(f, -half, half, VH, 1.0, 0.3, LIGHT, { post: bay, tops: 'vase' });
  // the clock in the middle over the balustrade, under a little curved pediment and its bell
  blk(f, -2.6, 2.6, VH, VH + 4.2, -1.0, 0.2, STONE);
  f.add(new THREE.CylinderGeometry(1.4, 1.4, 0.3, 20).rotateX(Math.PI / 2), '#f2ead6', 0, VH + 2.2, 0.3);
  f.add(new THREE.TorusGeometry(1.45, 0.14, 4, 20), STONE2, 0, VH + 2.2, 0.45);
  f.box(0.1, 1.0, 0.1, DARK, 0.25, VH + 2.6, 0.5, 0, 0, -0.5);
  f.box(0.1, 0.7, 0.1, DARK, -0.2, VH + 2.0, 0.5, 0, 0, 2.2);
  for (const s of [-1, 1]) volute(f, s * 3.2, VH + 1.0, 0.8, 0, s, STONE2);
  const sh = new THREE.Shape();
  sh.moveTo(-2.9, VH + 4.2); sh.absarc(0, VH + 4.2, 2.9, Math.PI, 0, true); sh.closePath();
  slab(f, sh, -1.0, 0.3, STONE);
  f.add(new THREE.SphereGeometry(0.5, 7, 5), '#7a6a50', 0, VH + 5.6, -0.4);
  return f;
}

export function vescovile() {
  const kit = new Kit();
  placeFront(kit, vescovileFront(), 0, 0, 0, -1);
  return kit.mesh(kitMat(0.85, 0));
}

export const DUOMO = [
  ...(CHURCH.length ? [{ id: 'duomo', name: 'Duomo di Lecce', x: DX, z: DZ, turn: DTURN, reach: 320, area: [CHURCH], foot: [CHURCH], make: duomo }] : []),
  ...(TOWER.length ? [{ id: 'campanile', name: 'Campanile del Duomo', x: CX, z: CZ, turn: CTURN, reach: 520, area: [TOWER], foot: [TOWER], make: campanile }] : []),
  ...(SEMINARIO.length ? [{ id: 'seminario', name: 'Palazzo del Seminario', x: SX, z: SZ, turn: STURN, reach: 280, area: [SEMINARIO], foot: [SEMINARIO], make: seminario }] : []),
  // the front stands against the map's block, which stays: its area takes in no building of the map
  { id: 'vescovile', name: 'Palazzo Vescovile', x: VX, z: VZ, turn: VTURN, reach: 260, area: [onMap(VX, VZ, VTURN, rect(-VW / 2, -1.3, VW / 2, 0.2))], foot: [onMap(VX, VZ, VTURN, rect(-VW / 2, -1.3, VW / 2, 0.2))], make: vescovile },
];
