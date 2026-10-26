// The parts that come back in Pisa's landmarks modelled by hand (duomo.js, battistero.js,
// camposanto.js, spina.js) and in Siena's (siena/*.js), on top of core/js/arcade.js and
// florence/marble.js: the blind arches on pilasters that run round every wall of the Pisan
// Romanesque, the open loggias of little columns stacked up its fronts, the grey bands in the white
// marble, a piece of a path, a sloping roof between two lines, and a path moved off the origin.
import * as THREE from 'three';
import { linePath, wall, archRing, column } from '../core/js/arcade.js';
import { panel } from '../florence/marble.js';

export const MARBLE = '#ebe5d6', GREY = '#9d998f', LEAD = '#8f9391', DARK = '#3c3a36', BRONZE = '#6a5a3a';

// the stretch of a straight path from s0 to s1, as a path of its own
export function sub(path, s0, s1) {
  const a = path.at(s0), b = path.at(s1);
  return linePath(a.x, a.z, b.x, b.z);
}

// a path moved by (dx, dz): an ellipse round the apse's middle rather than the origin
export function moved(path, dx, dz) {
  return { length: path.length, closed: path.closed, at: s => { const p = path.at(s); return { ...p, x: p.x + dx, z: p.z + dz }; } };
}

// the outline of a bay from a to b, y0 to y1, with an arch w wide at c up to `top` cut out of it from
// the bottom: a pier on each side and the arch's curve between them
export function bayRing(a, b, y0, y1, c, w, top) {
  const arch = archRing(c, w, y0, top, 10); // [left foot, right foot, right spring, ...curve..., left spring]
  return [[a, y0], [c - w / 2, y0], ...arch.slice(2).reverse(), [c + w / 2, y0], [b, y0], [b, y1], [a, y1]];
}

// A row of n blind arches from s0 to s1 between y0 and y1, standing `depth` out of the wall at o: each
// bay a pier-and-arch slab with the arch's opening cut through it, so the wall behind shows in the
// arch. arch: its width as a share of the bay, crown: its top above y0 (the storey's top less a bit
// when not given). win(i, c, w): what to put in the arch of bay i, centred at c, w wide.
export function blind(kit, path, s0, s1, y0, y1, n, { arch = 0.7, crown, depth = 0.4, o = 0, hex = MARBLE, win } = {}) {
  const bay = (s1 - s0) / n, w = arch * bay, top = y0 + (crown ?? y1 - y0 - Math.min(1.2, (y1 - y0) * 0.12));
  for (let i = 0; i < n; i++) {
    const a = s0 + i * bay, c = a + bay / 2;
    wall(kit, path, bayRing(a, a + bay, y0, y1, c, w, top), { o0: o, o1: o + depth, hex });
    win?.(i, c, w, top);
  }
}

// a slab on the wall's face from s0 to s1 (panel in florence/marble.js), cut in pieces of at most
// `step` metres when the path is curved (an ellipse's), so it follows it
export function strip(kit, path, s0, s1, y0, y1, hex, o = 0, d = 0.12, step = 2.5) {
  const n = path.closed ? Math.max(1, Math.ceil((s1 - s0) / step)) : 1;
  for (let k = 0; k < n; k++) panel(kit, path, s0 + ((s1 - s0) * k) / n, s0 + ((s1 - s0) * (k + 1)) / n, y0, y1, hex, o, d);
}

// An open loggia from s0 to s1 between y0 and y1: the wall behind in shadow, its floor, and in front
// of it at o a row of n little arches on columns.
export function loggia(kit, path, s0, s1, y0, y1, n, { o = 1.1, hex = MARBLE, back = '#b9b3a4' } = {}) {
  strip(kit, path, s0, s1, y0, y1, back, 0, 0.06);
  strip(kit, path, s0, s1, y0, y0 + 0.4, hex, 0, o + 0.5);
  const bay = (s1 - s0) / n, w = 0.78 * bay, crown = y1 - 0.5;
  for (let i = 0; i < n; i++) {
    const a = s0 + i * bay, c = a + bay / 2;
    wall(kit, path, bayRing(a, a + bay, y0 + 0.4, y1, c, w, crown), { o0: o, o1: o + 0.35, hex });
  }
  for (let i = 0; i <= n; i++) column(kit, path, s0 + i * bay, o + 0.17, y0 + 0.4, crown - w / 2, Math.min(0.32, bay * 0.12), hex, 'corinthian');
  strip(kit, path, s0, s1, y1 - 0.1, y1 + 0.5, hex, o - 0.2, 0.8); // its cornice
}

// grey bands across a wall from s0 to s1, y0 to y1, every `step` metres, on its face at o
export function bands(kit, path, s0, s1, y0, y1, { step = 1.4, h = 0.28, o = 0, hex = GREY } = {}) {
  for (let y = y0 + step / 2; y + h < y1; y += step) strip(kit, path, s0, s1, y, y + h, hex, o, 0.04);
}

// a flat sloping quad between the points a, b, c, d ([x, y, z]), seen from both sides: a lean-to roof
export function slope(kit, a, b, c, d, hex) {
  const pos = [a, b, c, a, c, d, a, c, b, a, d, c].flat();
  const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return kit.add(geo, hex);
}
