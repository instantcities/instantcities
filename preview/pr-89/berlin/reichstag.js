// The Reichstag (Wallot, 1884-94; rebuilt by Foster, 1995-99), modelled by hand in place of the
// map's pieces of it, from its measurements and photos, in game metres (the real ones times 1.25),
// on the map's outlines: a block of grey-yellow sandstone 137 m by 94 m, its cornice at 25 m.
//   the rusticated ground floor, the tall windows of the main floors between pilasters, the
//     mezzanine's small windows, the cornice and the balustrade on top
//   the west front's portico on its steps: six Corinthian columns, the frieze that reads DEM
//     DEUTSCHEN VOLKE (a band of bronze letters) and the pediment; a plainer portico on the east
//   the four corner towers, a big arched window on each face, and the German flag over each
//   Foster's dome of glass on the flat roof: its steel ribs and rings, the cone of mirrors inside
//     that throws daylight down into the chamber, and the two ramps winding up round it
// The model's own metres: +u east, +v south (it is not turned); the west front is at u = -65.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, sweep, linePath, column, archRing } from '../core/js/arcade.js';
import { buildings, nearest, mid, inside, local, box, sides, prism, cornice, windows, pediment } from './outline.js';

const X = -794.8, Z = -516.2, TURN = 0; // the dome's middle
const MAIN = nearest('part', -793.8, -516, 6)?.p ?? [];
const PARTS = MAIN.length ? buildings('part', X, Z, 110).filter(b => b.p !== MAIN && inside(mid(b.p), MAIN)) : [];
const TOWERS = PARTS.filter(b => (b.b ?? 0) > 25 && (b.b ?? 0) < 40 && b.h < 55); // the corner towers
const DOME = PARTS.find(b => b.h > 55); // the dome's foot on the roof
const WEST = -56.1, EAST = 55; // the walls behind the porticoes
const ROOF = 31.3, CORNICE = 28.6, BASE = 9.5;
const STONE = '#d3cbb7', STONE2 = '#c2b9a4', RUSTIC = '#b9b09c', DARK = '#33373b', ROOFC = '#8d8f8c', BRONZE = '#6f5a35';
const STEEL = '#c5cbd0', MIRROR = '#d9e1e6';

// a portico of n Corinthian columns across the front at u = u0 (facing -u when dir is -1), w wide,
// on steps up to y0, its deck back to the wall at u = back
function portico(kit, u0, back, dir, w, n, y0, { pedimentRise = 6.5, letters = false } = {}) {
  const front = u0, colU = u0 - dir * 3;
  // the steps, and the deck the columns stand on
  for (let k = 0; k < 6; k++) {
    const y = ((k + 1) / 6) * y0, uu = front - dir * k * 0.35;
    kit.box(Math.abs(back - uu), y0 / 6, w + 2, k % 2 ? STONE2 : STONE, (uu + back) / 2, y - y0 / 12, 0);
  }
  const path = linePath(colU, w / 2, colU, -w / 2); // runs north when dir is -1: its right is west
  const top = ROOF - 5.2;
  for (let k = 0; k < n; k++) column(kit, path, (k / (n - 1)) * (w - 3) + 1.5, 0, y0, top, 0.95, STONE, 'corinthian');
  // the entablature: the architrave, the frieze with its letters, the cornice; the pediment on it
  const deep = Math.abs(back - colU) + 1.2, eu = (colU + dir * 1.2 + back) / 2;
  kit.box(deep, 1.3, w + 0.8, STONE2, eu, top + 0.65, 0);
  kit.box(deep, 2.1, w + 0.8, STONE, eu, top + 2.35, 0);
  if (letters) {
    // DEM DEUTSCHEN VOLKE, 17 letters and the two gaps between the words, in bronze
    const word = 'DEM DEUTSCHEN VOLKE';
    for (let k = 0; k < word.length; k++) {
      if (word[k] === ' ') continue;
      kit.box(0.12, 1.2, 0.85, BRONZE, colU + dir * 1.3, top + 2.35, -((k - (word.length - 1) / 2) * 1.32));
    }
  }
  kit.box(deep + 0.8, 0.8, w + 1.6, STONE2, eu, top + 3.8, 0);
  pediment(kit, eu, 0, w + 1.4, top + 4.2, pedimentRise, deep + 0.4, STONE, Math.PI / 2);
  kit.box(0.2, pedimentRise * 0.4, w * 0.36, STONE2, colU + dir * 1.5, top + 4.2 + pedimentRise * 0.27, 0); // the tympanum's relief
}

// a corner tower over the roof on its ring, from the roof up to `h`
function tower(kit, ring, h) {
  const b = box(ring), top = h - 3.8;
  prism(kit, ring, ROOF - 1, top, STONE);
  for (const path of sides(ring, 4)) {
    const L = path.length;
    wall(kit, path, archRing(L / 2, 6.2, ROOF + 1.5, top - 2.6, 10), { o0: -0.1, o1: 0.1, hex: DARK });
    wall(kit, path, archRing(L / 2, 7.4, ROOF + 1.2, top - 2.1, 10), { o0: -0.1, o1: 0.05, hex: STONE2 });
    for (const s of [1.1, L - 1.1, L / 2 - 4.6, L / 2 + 4.6]) column(kit, path, s, 0.3, ROOF - 0.2, top - 1.4, 0.55, STONE, 'pilaster');
  }
  cornice(kit, ring, top, STONE2, { out: 0.9, h: 1.4, rail: 1.2, railHex: STONE });
  // its low attic and the round base of the flagpole on top, and the flag, black, red and gold
  kit.box(b.du * 0.62, 2.6, b.dv * 0.62, STONE2, b.u, top + 1.3, b.v);
  kit.add(new THREE.CylinderGeometry(b.r * 0.5, b.r * 0.55, 1.2, 16), STONE, b.u, top + 3.2, b.v);
  const poleTop = h + 9;
  kit.rod([b.u, top + 3.8, b.v], [b.u, poleTop, b.v], 0.12, '#e8e8e4', 6);
  const fw = 5.4, fh = 3.2; // the flag blows east (towards +u) from the pole
  ['#1d1d1d', '#d22f27', '#f0c419'].forEach((c, k) => kit.box(fw, fh / 3, 0.06, c, b.u + fw / 2 + 0.1, poleTop - 0.5 - fh / 6 - (k * fh) / 3, b.v, 0, 0, 0));
}

// Foster's dome: steel ribs and rings over the glass (the glass is its own mesh, see below), the
// mirror cone and the ramps
function dome(kit, r, y0, h) {
  const ribs = 24, rings = 17;
  const at = (t, a) => [r * Math.cos(t) * Math.cos(a), y0 + h * Math.sin(t), r * Math.cos(t) * Math.sin(a)];
  const tTop = Math.acos(0.17); // the opening at the top, a ring 8 m across
  for (let k = 0; k < ribs; k++) {
    const a = (k / ribs) * Math.PI * 2;
    for (let j = 0; j < 8; j++) kit.rod(at((j / 8) * tTop, a), at(((j + 1) / 8) * tTop, a), 0.16, STEEL, 4);
  }
  for (let j = 1; j <= rings; j++) {
    const t = (j / rings) * tTop, rr = r * Math.cos(t), y = y0 + h * Math.sin(t);
    kit.add(new THREE.TorusGeometry(rr, 0.1, 3, 48).rotateX(Math.PI / 2), STEEL, 0, y, 0);
  }
  kit.add(new THREE.TorusGeometry(r * 0.17, 0.35, 4, 24).rotateX(Math.PI / 2), STEEL, 0, y0 + h * Math.sin(tTop), 0);
  kit.add(new THREE.CylinderGeometry(r + 0.6, r + 0.9, 1.2, 48), STONE2, 0, y0 + 0.6, 0); // its foot
  // the cone of mirrors, from the chamber's ceiling up into the dome, widening upwards
  kit.add(new THREE.CylinderGeometry(r * 0.38, r * 0.06, h * 0.72, 30, 1, true), MIRROR, 0, y0 + h * 0.36 - 1, 0);
  kit.add(new THREE.CylinderGeometry(r * 0.38, r * 0.38, 0.4, 30), STEEL, 0, y0 + h * 0.72 - 1, 0);
  // the two ramps winding up along the glass, half a turn apart, each with its rail
  for (const start of [0, Math.PI]) {
    const steps = 64, turns = 1.5;
    for (let k = 0; k < steps; k++) {
      const f = k / steps, a = start + f * turns * Math.PI * 2, y = y0 + 1.6 + f * (h * 0.78);
      const t = Math.asin(Math.min(0.98, (y - y0) / h)), rr = r * Math.cos(t) - 1.6;
      const len = (rr * turns * Math.PI * 2) / steps + 0.3;
      kit.box(2.1, 0.25, len, '#e6e8ea', rr * Math.cos(a), y, rr * Math.sin(a), 0, -a, 0);
      kit.box(0.1, 1, len, '#bfc6cc', (rr - 1.05) * Math.cos(a), y + 0.6, (rr - 1.05) * Math.sin(a), 0, -a, 0);
    }
  }
}

export function reichstag() {
  // the block's outline without the porticoes, which stand in front of it
  const kit = new Kit(), ring = local(MAIN, X, Z, TURN).map(([u, v]) => [Math.abs(v) < 21.5 ? Math.min(Math.max(u, WEST), EAST) : u, v]);
  // the block: the rusticated ground floor, the main floors and their windows, the cornice, the roof
  prism(kit, ring, 0, CORNICE, STONE);
  for (const path of sides(ring, 1.2)) {
    const L = path.length;
    wall(kit, path, [[0, 0], [L, 0], [L, BASE], [0, BASE]], { o0: -0.1, o1: 0.3, hex: RUSTIC });
    for (const y of [2.4, 4.8, 7.2]) wall(kit, path, [[0, y], [L, y], [L, y + 0.14], [0, y + 0.14]], { o0: 0.3, o1: 0.33, hex: STONE2 });
    sweep(kit, path, 0, L, [[-0.1, BASE], [0.6, BASE], [0.6, BASE + 0.8], [-0.1, BASE + 0.8]], STONE2, { step: L });
    sweep(kit, path, 0, L, [[-0.1, 21.4], [0.4, 21.4], [0.4, 22], [-0.1, 22]], STONE2, { step: L });
  }
  windows(kit, ring, { bay: 5.6, w: 1.7, y0: 3, y1: 7, hex: DARK, min: 3 });
  windows(kit, ring, { bay: 5.6, w: 2.2, y0: 11.6, y1: 19.6, arch: true, hex: DARK, sill: STONE2, min: 3 });
  windows(kit, ring, { bay: 5.6, w: 1.8, y0: 23, y1: 25.6, hex: DARK, min: 3 });
  // the pilasters between the bays of the main floors
  for (const path of sides(ring, 3)) {
    const L = path.length, n = Math.max(1, Math.floor(L / 5.6));
    for (let k = 0; k <= n; k++) column(kit, path, Math.min(Math.max((k * L) / n, 0.5), L - 0.5), 0.3, BASE + 0.8, 26.4, 0.45, STONE2, 'pilaster');
  }
  cornice(kit, ring, CORNICE, STONE2, { out: 1, h: 2.2, rail: 1.4, railHex: STONE });
  prism(kit, ring.map(([u, v]) => [u * 0.995, v * 0.995]), CORNICE - 0.5, ROOF - 1.2, ROOFC);
  // the two porticoes
  portico(kit, -64.6, WEST, -1, 36, 6, 6.2, { letters: true });
  portico(kit, 65.2, EAST, 1, 34, 6, 5.2, { pedimentRise: 5 });
  // the corner towers
  for (const t of TOWERS) tower(kit, local(t.p, X, Z, TURN), t.h);
  // the dome
  const d = DOME ? box(local(DOME.p, X, Z, TURN)) : { u: 0, v: 0, r: 23.3 };
  kit.add(new THREE.CylinderGeometry(d.r + 2.5, d.r + 2.5, 0.6, 48), '#a4a7a6', d.u, ROOF - 0.9, d.v); // the roof terrace round it
  const steel = new Kit();
  dome(steel, d.r, ROOF, (DOME?.h ?? 60) - ROOF);
  const group = new THREE.Group();
  const stone = kit.mesh(kitMat(0.88)), frame = steel.mesh(kitMat(0.35, 0.6));
  frame.position.set(d.u, 0, d.v);
  // the glass: a shell over the ribs, see-through
  const t = Math.acos(0.17), h = (DOME?.h ?? 60) - ROOF;
  const glass = new THREE.Mesh(new THREE.SphereGeometry(d.r - 0.05, 48, 16, 0, Math.PI * 2, Math.PI / 2 - t, t).scale(1, h / d.r, 1),
    new THREE.MeshStandardMaterial({ color: '#c8dde6', roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }));
  glass.position.set(d.u, ROOF, d.v);
  group.add(stone, frame, glass);
  return group;
}

export const REICHSTAG = [{
  id: 'reichstag', name: 'Reichstag', x: X, z: Z, turn: TURN, reach: 320,
  area: [MAIN, ...PARTS.map(b => b.p)].filter(p => p.length), foot: MAIN.length ? [MAIN] : [],
  make: reichstag,
}];
