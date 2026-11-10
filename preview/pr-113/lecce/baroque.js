// The parts of Lecce's baroque fronts (Santa Croce, the Duomo, Santa Chiara, the Seminario, the
// Bishop's Palace), all in the honey-coloured pietra leccese, built in a front's own frame: x to the
// right as you stand before it, y up, z out towards you, the wall's face at z = 0 (put on a model
// with outline.js's placeFront). Columns on pedestals, entablatures, arched doors under broken
// pediments, niches with their saints, balustrades, the rose window, scrolls, flames and the carved
// figures under a balcony: the carving that makes the stone look like lace is left to the shapes
// standing out from the wall, a few to each part.
import * as THREE from 'three';
import { figure } from './outline.js';

export const STONE = '#e2c893', STONE2 = '#d3b47e', LIGHT = '#ecd8a8', SHADOW = '#9c8158', DARK = '#3a2f25', GLASS = '#29303c', DOOR = '#4b3322';

// a block from x0 to x1, y0 to y1, z0 to z1
export const blk = (f, x0, x1, y0, y1, z0, z1, hex) => f.box(x1 - x0, y1 - y0, z1 - z0, hex, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);

// an outline in (x, y) (a THREE.Shape) made solid from z0 to z1
export function slab(f, shape, z0, z1, hex) {
  return f.add(new THREE.ExtrudeGeometry(shape, { depth: z1 - z0, bevelEnabled: false, curveSegments: 10 }), hex, 0, 0, z0);
}

// a round-headed opening's outline: w wide, from y0 to its crown at y1
export function archShape(x, w, y0, y1) {
  const r = w / 2, spring = Math.max(y0, y1 - r), s = new THREE.Shape();
  s.moveTo(x - r, y0); s.lineTo(x + r, y0); s.lineTo(x + r, spring);
  s.absarc(x, spring, r, 0, Math.PI, false);
  s.lineTo(x - r, y0);
  return s;
}

// a frame t wide round a round-headed opening (w wide, y0 to y1): the ring of stone between them
export function archFrame(f, x, w, y0, y1, t, z0, z1, hex) {
  const s = archShape(x, w + 2 * t, y0, y1 + t), r = w / 2, spring = Math.max(y0, y1 - r), h = new THREE.Path();
  h.moveTo(x - r, y0); h.lineTo(x + r, y0); h.lineTo(x + r, spring); h.absarc(x, spring, r, 0, Math.PI, false); h.lineTo(x - r, y0);
  s.holes.push(h);
  return slab(f, s, z0, z1, hex);
}

// A column standing at x from y0 to y1, its shaft r thick, z out from the wall (its middle): its
// base, its shaft, a capital (Corinthian: a flared bell of leaves under the abacus; Ionic: a
// cushion with its scrolls), and on a pedestal `ped` high when given. `bands`: carved rings round
// the shaft (Santa Croce's are carved all over, fruit and leaves; here a few rings stand for it).
export function col(f, x, y0, y1, r, z, hex, { order = 'corinthian', ped = 0, pedHex = hex, bands = 0 } = {}) {
  if (ped) {
    blk(f, x - r * 1.6, x + r * 1.6, y0, y0 + ped, z - r * 1.6, z + r * 1.6, pedHex);
    blk(f, x - r * 1.8, x + r * 1.8, y0 + ped - 0.3, y0 + ped, z - r * 1.8, z + r * 1.8, hex);
    y0 += ped;
  }
  const h = y1 - y0, base = r * 0.8, cap = order === 'corinthian' ? r * 2.2 : r * 1.1;
  f.add(new THREE.CylinderGeometry(r * 1.3, r * 1.4, base, 10), hex, x, y0 + base / 2, z);
  f.add(new THREE.CylinderGeometry(r * 0.88, r, h - base - cap, 10), hex, x, y0 + base + (h - base - cap) / 2, z);
  for (let k = 1; k <= bands; k++) f.add(new THREE.CylinderGeometry(r * 1.06, r * 1.06, r * 0.5, 10), STONE2, x, y0 + base + ((h - base - cap) * k) / (bands + 1), z);
  if (order === 'corinthian') {
    f.add(new THREE.CylinderGeometry(r * 1.45, r * 0.92, cap * 0.85, 10), hex, x, y1 - cap / 2 - cap * 0.07, z);
    blk(f, x - r * 1.6, x + r * 1.6, y1 - cap * 0.18, y1, z - r * 1.6, z + r * 1.6, hex);
  } else {
    blk(f, x - r * 1.5, x + r * 1.5, y1 - cap, y1 - cap * 0.3, z - r * 1.1, z + r * 1.1, hex);
    for (const s of [-1, 1]) f.add(new THREE.CylinderGeometry(cap * 0.38, cap * 0.38, r * 2, 8).rotateX(Math.PI / 2), hex, x + s * r * 1.45, y1 - cap * 0.65, z);
    blk(f, x - r * 1.4, x + r * 1.4, y1 - cap * 0.3, y1, z - r * 1.3, z + r * 1.3, hex);
  }
  return f;
}

// a flat pilaster at x from y0 to y1, w wide, standing d proud of the wall (or of z)
export function pil(f, x, y0, y1, w, hex, { z = 0, d = 0.3 } = {}) {
  blk(f, x - w / 2, x + w / 2, y0, y1, z, z + d, hex);
  blk(f, x - w * 0.62, x + w * 0.62, y1 - 0.45, y1, z, z + d + 0.12, hex);
  blk(f, x - w * 0.62, x + w * 0.62, y0, y0 + 0.4, z, z + d + 0.12, hex);
  return f;
}

// an entablature from x0 to x1 with its foot at y, h deep in all: architrave, frieze and the
// cornice standing out over them, out to z (its face) from the wall
export function entab(f, x0, x1, y, h, z, hex, hex2 = STONE2) {
  blk(f, x0, x1, y, y + h * 0.3, -0.2, z, hex2);
  blk(f, x0, x1, y + h * 0.3, y + h * 0.62, -0.2, z - 0.12, hex);
  blk(f, x0 - 0.15, x1 + 0.15, y + h * 0.62, y + h * 0.8, -0.2, z + 0.25, hex2);
  blk(f, x0 - 0.35, x1 + 0.35, y + h * 0.8, y + h, -0.2, z + 0.6, hex);
  return f;
}

// a balustrade from x0 to x1 on y, h high, its face at z: a plinth rail, the bottle-shaped balusters
// and the handrail, with a post every `post` metres (and a vase or a statue on them: `tops`)
export function balustrade(f, x0, x1, y, h, z, hex, { post = 0, tops = null, step = 0.5 } = {}) {
  const d = 0.55;
  blk(f, x0, x1, y, y + 0.22, z - d, z, hex);
  blk(f, x0 - 0.05, x1 + 0.05, y + h - 0.2, y + h, z - d - 0.05, z + 0.06, hex);
  const n = Math.max(1, Math.round((x1 - x0) / step));
  for (let k = 0; k < n; k++) {
    const x = x0 + ((k + 0.5) * (x1 - x0)) / n;
    f.add(new THREE.CylinderGeometry(0.1, 0.15, h - 0.42, 6), hex, x, y + 0.22 + (h - 0.42) / 2, z - d / 2);
  }
  if (post) {
    const m = Math.max(1, Math.round((x1 - x0) / post));
    for (let k = 0; k <= m; k++) {
      const x = x0 + ((x1 - x0) * k) / m;
      blk(f, x - 0.3, x + 0.3, y, y + h + 0.1, z - d - 0.05, z + 0.06, hex);
      if (tops === 'vase') flame(f, x, y + h + 0.1, z - d / 2, 1.2, hex);
      else if (tops) figure(f, x, y + h + 0.1, z - d / 2, tops, hex);
    }
  }
  return f;
}

// a flaming urn or a pinnacle with a ball, `h` high, on (x, y, z): the finials of the top
export function flame(f, x, y, z, h, hex) {
  f.add(new THREE.CylinderGeometry(h * 0.16, h * 0.2, h * 0.16, 6), hex, x, y + h * 0.08, z);
  f.add(new THREE.SphereGeometry(h * 0.22, 7, 5), hex, x, y + h * 0.38, z);
  f.add(new THREE.ConeGeometry(h * 0.14, h * 0.4, 6), hex, x, y + h * 0.78, z);
  return f;
}

// a scroll r across in the wall's plane at (x, y), standing out to z: a coil of stone curling
// inwards (dir 1: its tail running off to the right, -1: to the left), and the tail
export function volute(f, x, y, r, z, dir, hex) {
  const t = Math.max(0.12, r * 0.22);
  f.add(new THREE.TorusGeometry(r, t, 5, 14, Math.PI * 1.6).rotateZ(dir > 0 ? Math.PI * 0.9 : -Math.PI * 0.5), hex, x, y, z);
  f.add(new THREE.TorusGeometry(r * 0.45, t * 0.9, 5, 10), hex, x, y, z);
  f.add(new THREE.SphereGeometry(r * 0.25, 6, 5), hex, x, y, z + t * 0.5);
  return f;
}

// A door at x, w wide and its crown h high: the dark doors in their recess, a frame of stone round
// them, standing out to z, and over them a pediment: 'tri', 'curve' or 'broken' (two halves of a
// triangle with a carved shield between them)
export function portal(f, x, w, h, z, hex, { pediment = 'broken', frame = 0.6, arch = true } = {}) {
  if (arch) {
    slab(f, archShape(x, w, 0, h), -0.25, 0.05, DOOR);
    archFrame(f, x, w, 0, h, frame, 0, z, hex);
  } else {
    blk(f, x - w / 2, x + w / 2, 0, h, -0.25, 0.05, DOOR);
    blk(f, x - w / 2 - frame, x - w / 2, 0, h + frame, 0, z, hex);
    blk(f, x + w / 2, x + w / 2 + frame, 0, h + frame, 0, z, hex);
    blk(f, x - w / 2 - frame, x + w / 2 + frame, h, h + frame, 0, z, hex);
  }
  const y = h + frame, ww = w + 2 * frame + 0.8;
  blk(f, x - ww / 2, x + ww / 2, y, y + 0.35, 0, z + 0.3, STONE2);
  if (pediment === 'tri' || pediment === 'broken') {
    for (const s of [-1, 1]) {
      const sh = new THREE.Shape();
      const a = pediment === 'broken' ? 0.22 : 0;
      sh.moveTo(x + s * ww / 2, y + 0.35); sh.lineTo(x + s * ww * a, y + 0.35); sh.lineTo(x + s * ww * a, y + 0.35 + ww * 0.3 * (1 - 2 * a)); sh.closePath();
      slab(f, sh, 0, z + 0.25, hex);
    }
    if (pediment === 'broken') {
      // the carved shield between the halves, under a crown of leaves
      blk(f, x - ww * 0.16, x + ww * 0.16, y + 0.35, y + 0.35 + ww * 0.32, 0, z + 0.15, STONE2);
      f.add(new THREE.SphereGeometry(ww * 0.11, 8, 6).scale(1, 1.25, 0.5), LIGHT, x, y + 0.35 + ww * 0.17, z + 0.2);
      flame(f, x, y + 0.35 + ww * 0.32, z * 0.5, ww * 0.18, hex);
    }
  } else if (pediment === 'curve') {
    const sh = new THREE.Shape();
    sh.moveTo(x - ww / 2, y + 0.35); sh.absarc(x, y + 0.35, ww / 2, Math.PI, 0, true); sh.closePath();
    slab(f, sh.clone(), 0, z + 0.25, hex);
  }
  return f;
}

// a niche at x from y0, w wide and h high, with a saint standing in it on a bracket (its stone
// `statueHex`), a shell in its head, and a frame round it standing out to z
export function niche(f, x, y0, w, h, z, hex, statueHex = LIGHT) {
  const sh = archShape(x, w, y0, y0 + h);
  slab(f, sh, -0.05, 0.08, SHADOW);
  archFrame(f, x, w, y0, y0 + h, 0.3, 0, z, hex);
  blk(f, x - w * 0.42, x + w * 0.42, y0 - 0.1, y0 + 0.2, 0, z + 0.35, hex);
  // the shell: ribs fanning out in the niche's head
  for (let k = 1; k < 6; k++) {
    const a = (k / 6) * Math.PI;
    f.box(0.12, w * 0.4, 0.12, STONE2, x + Math.cos(a) * w * 0.22, y0 + h - w / 2 + Math.sin(a) * w * 0.22, 0.12, 0, 0, a - Math.PI / 2);
  }
  figure(f, x, y0 + 0.2, 0.35, Math.min(h - w * 0.55, w * 2.6), statueHex);
  return f;
}

// a window at x from y0, w wide and h high: dark glass in a frame standing out to z, a sill, and
// over it a pediment ('tri', 'curve' or none) or round-headed when `arch`
export function win(f, x, y0, w, h, z, hex, { arch = false, pediment = 'none', frame = 0.35 } = {}) {
  if (arch) {
    slab(f, archShape(x, w, y0, y0 + h), -0.1, 0.06, GLASS);
    archFrame(f, x, w, y0, y0 + h, frame, 0, z, hex);
  } else {
    blk(f, x - w / 2, x + w / 2, y0, y0 + h, -0.1, 0.06, GLASS);
    blk(f, x - w / 2 - frame, x - w / 2, y0, y0 + h, 0, z, hex);
    blk(f, x + w / 2, x + w / 2 + frame, y0, y0 + h, 0, z, hex);
    blk(f, x - w / 2 - frame, x + w / 2 + frame, y0 + h, y0 + h + frame, 0, z, hex);
  }
  blk(f, x - w / 2 - frame - 0.2, x + w / 2 + frame + 0.2, y0 - 0.3, y0, 0, z + 0.2, STONE2);
  const y = y0 + h + frame, ww = w + 2 * frame + 0.4;
  if (pediment === 'tri') {
    const sh = new THREE.Shape();
    sh.moveTo(x - ww / 2, y); sh.lineTo(x + ww / 2, y); sh.lineTo(x, y + ww * 0.3); sh.closePath();
    slab(f, sh, 0, z + 0.15, hex);
  } else if (pediment === 'curve') {
    const sh = new THREE.Shape();
    sh.moveTo(x - ww / 2, y); sh.absarc(x, y, ww / 2, Math.PI, 0, true); sh.closePath();
    slab(f, sh, 0, z + 0.15, hex);
  }
  return f;
}

// A rose window r across at (x, y): the dark glass, the stone tracery of spokes and rings, and a
// broad carved frame round it with a wreath of fruit and leaves and a ring of cherubs' heads
export function rose(f, x, y, r, z, hex, { spokes = 16, heads = 14 } = {}) {
  f.add(new THREE.CylinderGeometry(r, r, 0.2, 28).rotateX(Math.PI / 2), GLASS, x, y, -0.05);
  for (let k = 0; k < spokes; k++) {
    const a = (k / spokes) * Math.PI * 2;
    f.box(0.16, r * 0.66, 0.2, LIGHT, x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, 0.08, 0, 0, a - Math.PI / 2);
  }
  f.add(new THREE.TorusGeometry(r * 0.3, 0.16, 5, 18), LIGHT, x, y, 0.1);
  f.add(new THREE.CylinderGeometry(r * 0.16, r * 0.16, 0.3, 12).rotateX(Math.PI / 2), STONE2, x, y, 0.12);
  f.add(new THREE.TorusGeometry(r, 0.24, 5, 28), hex, x, y, 0.12);
  f.add(new THREE.TorusGeometry(r + 0.55, 0.38, 6, 28), STONE2, x, y, 0.2);
  f.add(new THREE.TorusGeometry(r + 1.2, 0.3, 6, 28), hex, x, y, 0.32 + z * 0.2);
  for (let k = 0; k < heads; k++) {
    const a = (k / heads) * Math.PI * 2;
    f.add(new THREE.SphereGeometry(0.32, 6, 5), LIGHT, x + Math.cos(a) * (r + 0.85), y + Math.sin(a) * (r + 0.85), 0.5);
  }
  return f;
}

// the carved figures holding up a balcony, from x0 to x1 every `step`: each a bracket of stone
// leaning out from the wall from y0 up to the slab at y1, a beast's or a man's head on it
export function telamons(f, x0, x1, y0, y1, out, step, hex) {
  const n = Math.max(1, Math.round((x1 - x0) / step));
  for (let k = 0; k <= n; k++) {
    const x = x0 + ((x1 - x0) * k) / n, h = y1 - y0;
    f.box(0.55, h * 0.75, 0.6, hex, x, y0 + h * 0.4, out * 0.35, 0.45, 0, 0);
    f.box(0.75, h * 0.3, out * 0.9, hex, x, y1 - h * 0.15, out * 0.5);
    f.add(new THREE.SphereGeometry(0.34, 6, 5), k % 2 ? LIGHT : STONE2, x, y1 - h * 0.42, out * 0.82);
  }
  return f;
}

// a band of carving between x0 and x1, y0 and y1: knobs of leaves and fruit standing out a little
export function carving(f, x0, x1, y0, y1, hex, step = 0.9) {
  const nx = Math.max(1, Math.round((x1 - x0) / step)), ny = Math.max(1, Math.round((y1 - y0) / step));
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const x = x0 + ((i + 0.5 + (j % 2 ? 0.25 : -0.25)) * (x1 - x0)) / nx, y = y0 + ((j + 0.5) * (y1 - y0)) / ny;
    f.add(new THREE.SphereGeometry(step * 0.3, 5, 4).scale(1, 1, 0.6), (i + j) % 3 ? hex : STONE2, x, y, 0.08);
  }
  return f;
}
