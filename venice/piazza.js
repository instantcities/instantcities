// Three smaller landmarks round the Piazza and the Palazzo Ducale, modelled by hand in game metres
// (the real ones times 1.25), the map having no buildings of their own for them:
//   the Ponte dei Sospiri (1600-03), the closed bridge of white Istrian stone from the Ducale across
//     the Rio di Palazzo to the prisons, high over the water, its two barred windows each side, its
//     arch under it and the scrolls and crest on top
//   the Torre dell'Orologio (1496-99) at the Mercerie's mouth on the Piazza, in place of the map's
//     block of it: the archway through it, the great clock face of blue and gold with the zodiac,
//     the Madonna's niche, the winged lion on its starry blue, the terrace with the bell and the two
//     bronze Moors who strike the hours
//   the two granite columns on the Piazzetta by the water, Saint Mark's lion on one and Saint
//     Theodore on his crocodile on the other
//   the three flagpoles in front of the Basilica on their bronze pedestals, with the flags of Saint
//     Mark, and the two square pillars from Acre by its south side (the map makes little houses of
//     all five)
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, archRing, onMap, rect } from '../core/js/arcade.js';

const WHITE = '#efece4', WHITE2 = '#dcd8cd', DARK = '#34312e', BLUE = '#23417c', GOLD = '#d3ad48', BRONZE = '#4b3d2c';

// ------------------------------------------------------------------ the Ponte dei Sospiri

const SX = 345.5, SZ = 301.4, STURN = 0.25, SL = 14, SW = 5.2, SY = 6.5; // its middle, its turn, length across the rio, width, underside

export function sospiri() {
  const kit = new Kit();
  // its two sides, each with its arch underneath and two barred windows
  for (const sv of [-1, 1]) {
    const p = sv > 0 ? linePath(SL / 2, SW / 2, -SL / 2, SW / 2) : linePath(-SL / 2, -SW / 2, SL / 2, -SW / 2); // outside to the right
    const bottom = [];
    for (let k = 0; k <= 12; k++) { const s = (k / 12) * SL; bottom.push([s, SY + 1.6 * Math.sin((k / 12) * Math.PI)]); }
    const top = [[SL, SY + 6.4], [SL - 1, SY + 6.8], [1, SY + 6.8], [0, SY + 6.4]];
    const holes = [SL * 0.32, SL * 0.68].map(s => [[s - 1, SY + 3], [s + 1, SY + 3], [s + 1, SY + 5], [s - 1, SY + 5]]);
    wall(kit, p, [...bottom, ...top], { o0: -0.5, o1: 0, hex: WHITE, holes });
    for (const s of [SL * 0.32, SL * 0.68]) {
      wall(kit, p, [[s - 1, SY + 3], [s + 1, SY + 3], [s + 1, SY + 5], [s - 1, SY + 5]], { o0: -0.4, o1: -0.35, hex: DARK });
      for (const d of [-0.5, 0, 0.5]) wall(kit, p, [[s + d - 0.06, SY + 3], [s + d + 0.06, SY + 3], [s + d + 0.06, SY + 5], [s + d - 0.06, SY + 5]], { o0: -0.35, o1: 0, hex: WHITE2 });
      wall(kit, p, [[s - 1, SY + 3.95], [s + 1, SY + 3.95], [s + 1, SY + 4.05], [s - 1, SY + 4.05]], { o0: -0.35, o1: 0, hex: WHITE2 });
      wall(kit, p, [[s - 1.4, SY + 2.6], [s + 1.4, SY + 2.6], [s + 1.4, SY + 5.4], [s - 1.4, SY + 5.4]], { o0: 0, o1: 0.2, hex: WHITE2, holes: [[[s - 1, SY + 3], [s + 1, SY + 3], [s + 1, SY + 5], [s - 1, SY + 5]]] });
    }
    // the archivolt along its underside, and the pilasters at its ends
    const band = bottom.map(([s, y]) => [s, y]).concat(bottom.slice().reverse().map(([s, y]) => [s, y + 0.7]));
    wall(kit, p, band, { o0: 0, o1: 0.25, hex: WHITE2 });
    for (const s of [0.4, SL - 0.4]) wall(kit, p, [[s - 0.4, SY], [s + 0.4, SY], [s + 0.4, SY + 6.4], [s - 0.4, SY + 6.4]], { o0: 0, o1: 0.35, hex: WHITE2 });
  }
  // its floor and its roof, the arch's underside
  kit.box(SL, 0.5, SW, WHITE2, 0, SY + 1.8, 0).box(SL + 0.4, 0.5, SW + 0.6, WHITE, 0, SY + 6.95, 0);
  for (let k = 0; k < 12; k++) {
    const s0 = -SL / 2 + (k / 12) * SL, s1 = s0 + SL / 12, y0 = SY + 1.6 * Math.sin((k / 12) * Math.PI), y1 = SY + 1.6 * Math.sin(((k + 1) / 12) * Math.PI);
    kit.add(new THREE.BoxGeometry(Math.hypot(s1 - s0, y1 - y0), 0.3, SW), WHITE2, (s0 + s1) / 2, (y0 + y1) / 2, 0, 0, 0, Math.atan2(y1 - y0, s1 - s0));
  }
  // the scrolls and the crest on top
  for (const s of [-SL / 2 + 1.5, SL / 2 - 1.5]) kit.add(new THREE.TorusGeometry(0.6, 0.22, 4, 10), WHITE, s, SY + 7.8, 0, 0, Math.PI / 2);
  kit.box(1.8, 1.8, 0.6, WHITE, 0, SY + 8.1, 0).add(new THREE.SphereGeometry(0.45, 8, 6), WHITE2, 0, SY + 9.3, 0);
  return kit.mesh(kitMat(0.85));
}

// ------------------------------------------------------------------ the Torre dell'Orologio

const OX = 153.2, OZ = 193, OTURN = 0.553, OW = 3.8, OD = 5.25, OH = 25; // its middle, turn (its front to local +z), half its width and depth, the terrace

export function orologio() {
  const kit = new Kit();
  // the tower round its archway, the front's storeys of white stone
  for (const sx of [-1, 1]) kit.box(OW - 2, OH, 2 * OD, WHITE, sx * (OW + 2) / 2, OH / 2, 0);
  kit.box(4, OH - 7.4, 2 * OD, WHITE, 0, 7.4 + (OH - 7.4) / 2, 0);
  for (const sz of [-1, 1]) {
    const p = sz > 0 ? linePath(OW, OD, -OW, OD) : linePath(-OW, -OD, OW, -OD); // outside to the right
    wall(kit, p, [[0, -0.3], [2 * OW, -0.3], [2 * OW, 7.8], [0, 7.8]], { o0: 0, o1: 0.4, hex: WHITE2, holes: [archRing(OW, 4, -0.1, 7.4, 12)] });
  }
  kit.add(new THREE.CylinderGeometry(2, 2, 2 * OD, 12, 1, false, Math.PI / 2, Math.PI), WHITE2, 0, 5.4, 0, Math.PI / 2, 0, 0);
  // the clock face: its square frame, the blue dial, the zodiac ring in gold, the sun on its hand
  kit.box(7.2, 7.2, 0.4, WHITE2, 0, 12.4, OD + 0.2);
  kit.add(new THREE.CylinderGeometry(3.3, 3.3, 0.3, 32), BLUE, 0, 12.4, OD + 0.45, Math.PI / 2);
  kit.add(new THREE.TorusGeometry(3.1, 0.2, 4, 32), GOLD, 0, 12.4, OD + 0.6);
  kit.add(new THREE.TorusGeometry(2.1, 0.12, 4, 32), GOLD, 0, 12.4, OD + 0.6);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; kit.add(new THREE.SphereGeometry(0.22, 6, 4), GOLD, 2.6 * Math.cos(a), 12.4 + 2.6 * Math.sin(a), OD + 0.65); }
  kit.add(new THREE.CylinderGeometry(1.1, 1.1, 0.25, 16), '#2f2f4a', 0, 12.4, OD + 0.6, Math.PI / 2);
  kit.box(0.25, 2.8, 0.15, GOLD, 0.8, 13.5, OD + 0.75, 0, 0, -0.6).add(new THREE.SphereGeometry(0.45, 8, 6), GOLD, 1.6, 14.6, OD + 0.8);
  // the Madonna's niche and the two doors of the Magi either side of it
  kit.box(7.2, 4.6, 0.5, WHITE2, 0, 18.4, OD + 0.25);
  kit.box(1.9, 3.2, 0.3, BLUE, 0, 18.4, OD + 0.55).add(new THREE.CylinderGeometry(0.45, 0.6, 2.2, 8), GOLD, 0, 18.1, OD + 0.75);
  for (const sx of [-1, 1]) kit.box(1.3, 2.4, 0.3, BLUE, sx * 2.5, 18.2, OD + 0.55);
  // the winged lion on its blue field with the gold stars
  kit.box(7.2, 4.6, 0.5, WHITE2, 0, 23, OD + 0.25);
  kit.box(6, 3.6, 0.3, BLUE, 0, 23, OD + 0.55);
  for (let k = 0; k < 14; k++) kit.add(new THREE.SphereGeometry(0.1, 4, 3), GOLD, -2.7 + (k % 7) * 0.9, 21.6 + Math.floor(k / 7) * 2.8, OD + 0.75);
  kit.box(2.4, 1.2, 0.3, GOLD, 0, 22.8, OD + 0.8).box(0.9, 0.9, 0.3, GOLD, 1.3, 23.6, OD + 0.8).box(1.8, 0.4, 0.2, GOLD, -0.3, 23.9, OD + 0.85, 0, 0, 0.5);
  // the terrace, its balustrade, the bell on its frame and the two Moors
  kit.box(2 * OW + 0.8, 0.8, 2 * OD + 0.8, WHITE2, 0, OH + 0.4, 0);
  for (const [w, d, x, z] of [[2 * OW + 0.8, 0.3, 0, OD + 0.25], [2 * OW + 0.8, 0.3, 0, -OD - 0.25], [0.3, 2 * OD + 0.8, OW + 0.25, 0], [0.3, 2 * OD + 0.8, -OW - 0.25, 0]]) kit.box(w, 1.2, d, WHITE, x, OH + 1.4, z);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) kit.rod([sx * 1.4, OH + 0.8, sz * 1.4], [0, OH + 6.5, 0], 0.12, BRONZE, 4);
  kit.add(new THREE.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), BRONZE, 0, OH + 4.4, 0);
  kit.add(new THREE.CylinderGeometry(1.5, 1.6, 1.4, 12), BRONZE, 0, OH + 3.8, 0);
  for (const sx of [-1, 1]) {
    const x = sx * 2.4;
    kit.box(0.7, 1.2, 0.5, BRONZE, x, OH + 1.4, 0).box(0.8, 1.4, 0.6, BRONZE, x, OH + 2.7, 0);
    kit.add(new THREE.SphereGeometry(0.35, 8, 6), BRONZE, x, OH + 3.75, 0);
    kit.rod([x, OH + 3, 0], [x - sx * 1.1, OH + 4.4, 0], 0.12, BRONZE, 4);
  }
  return kit.mesh(kitMat(0.8));
}

// ------------------------------------------------------------------ the columns of the Piazzetta

const COLUMNS = [[247.9, 385.3, 'lion'], [223.2, 394.2, 'theodore']];

export function colonne() {
  const kit = new Kit();
  for (const [x, z, who] of COLUMNS.map(([x, z, w]) => [x - COLUMNS[0][0], z - COLUMNS[0][1], w])) {
    // the steps, the base, the granite shaft, the capital and the plinth for its statue
    for (let k = 0; k < 3; k++) kit.add(new THREE.CylinderGeometry(3.4 - k * 0.6, 3.4 - k * 0.6, 0.5, 8), WHITE2, x, 0.25 + k * 0.5, z);
    kit.add(new THREE.CylinderGeometry(1.5, 1.7, 1.6, 8), WHITE, x, 2.3, z);
    kit.add(new THREE.CylinderGeometry(0.95, 1.1, 14, 12), who === 'lion' ? '#8f8a86' : '#a28f86', x, 10.1, z);
    kit.add(new THREE.CylinderGeometry(1.4, 0.95, 1.4, 8), WHITE, x, 17.8, z).box(2.6, 0.8, 2.6, WHITE, x, 18.9, z);
    if (who === 'lion') {
      kit.box(2.6, 1.2, 1, BRONZE, x, 19.9, z).box(0.9, 1.1, 0.9, BRONZE, x + 1.2, 20.8, z);
      kit.box(1.4, 1.4, 0.1, BRONZE, x - 0.3, 21, z + 0.6, 0, 0, 0.6).box(1.4, 1.4, 0.1, BRONZE, x - 0.3, 21, z - 0.6, 0, 0, 0.6);
    } else {
      kit.box(2.4, 0.5, 0.7, '#9da48c', x, 19.55, z); // the crocodile
      kit.add(new THREE.CylinderGeometry(0.35, 0.45, 2.2, 8), WHITE, x, 20.9, z).add(new THREE.SphereGeometry(0.3, 8, 6), WHITE, x, 22.2, z);
      kit.rod([x + 0.4, 19.8, z], [x + 0.4, 22.8, z], 0.06, WHITE2, 4);
    }
  }
  return kit.mesh(kitMat(0.8));
}

// ------------------------------------------------------------------ the flagpoles and the pillars

const POLES = [[154.3, 227.2], [162.3, 243.3], [170.3, 259.4]], PILLARS = [[217.2, 265.3], [222.9, 263.9]];

export function pili() {
  const kit = new Kit();
  const [ox, oz] = POLES[1];
  for (const [x, z] of POLES.map(([x, z]) => [x - ox, z - oz])) {
    kit.add(new THREE.CylinderGeometry(1.3, 1.6, 2.6, 8), BRONZE, x, 1.3, z).add(new THREE.CylinderGeometry(0.9, 1.3, 1, 8), BRONZE, x, 3.1, z);
    kit.rod([x, 3.6, z], [x, 21, z], 0.18, '#a5322c', 6).add(new THREE.SphereGeometry(0.35, 8, 6), GOLD, x, 21.2, z);
    kit.box(0.08, 3.2, 4.8, '#b8322c', x, 18.6, z + 2.5).box(0.1, 1.2, 1.4, GOLD, x, 18.8, z + 2.2);
  }
  for (const [x, z] of PILLARS.map(([x, z]) => [x - ox, z - oz])) {
    kit.box(1.5, 0.6, 1.5, WHITE2, x, 0.3, z).box(1.2, 4.8, 1.2, WHITE, x, 3, z).box(1.5, 0.5, 1.5, WHITE2, x, 5.65, z);
  }
  return kit.mesh(kitMat(0.7));
}

const ring = (x, z, r) => Array.from({ length: 8 }, (_, k) => [x + r * Math.cos((k / 8) * Math.PI * 2), z + r * Math.sin((k / 8) * Math.PI * 2)]).flat();
const towerPiers = [-1, 1].map(sx => onMap(OX, OZ, OTURN, rect(Math.min(sx * 2, sx * OW), -OD, Math.max(sx * 2, sx * OW), OD)));

export const PIAZZA = [
  { id: 'ponte-dei-sospiri', name: 'Ponte dei Sospiri', x: SX, z: SZ, turn: STURN, reach: 30, area: [], foot: [], make: sospiri },
  { id: 'torre-dell-orologio', name: "Torre dell'Orologio", x: OX, z: OZ, turn: OTURN, reach: 40, area: [onMap(OX, OZ, OTURN, rect(-OW - 0.5, -OD - 0.5, OW + 0.5, OD + 0.5))], foot: towerPiers, make: orologio },
  { id: 'pili-di-san-marco', name: 'Pili di San Marco', x: POLES[1][0], z: POLES[1][1], reach: 40, area: [...POLES, ...PILLARS].map(([x, z]) => ring(x, z, 2.6)), foot: [...POLES.map(([x, z]) => ring(x, z, 1.6)), ...PILLARS.map(([x, z]) => ring(x, z, 0.8))], make: pili },
  { id: 'colonne-di-san-marco', name: 'Colonne di San Marco e San Todaro', x: COLUMNS[0][0], z: COLUMNS[0][1], reach: 50, area: COLUMNS.map(([x, z]) => ring(x, z, 3.5)), foot: COLUMNS.map(([x, z]) => ring(x, z, 2.4)), make: colonne },
];
