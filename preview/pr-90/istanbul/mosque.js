// The parts Istanbul's mosques have in common, for the ones modelled by hand (ayasofya.js,
// sultanahmet.js, yeni-cami.js): a dome of lead on its drum with a ring of windows between little
// buttresses, a half-dome leaning against a bigger dome, a minaret with its şerefe balconies and
// its tall pencil cap of lead, the gilded alem on top of each, rows of windows on a wall, and the
// courtyard with its portico of little domes round the ablution fountain. Every piece goes into a
// Kit (core/js/kit.js), in the model's own metres: u (x) towards the qibla, v (z) across, y up.
import * as THREE from 'three';

export const LEAD = '#8b9297', LEAD2 = '#7b8287', GOLD = '#c9a64a', DARK = '#33302c';
export const STONE = '#e6e0d2', STONE2 = '#d5cdbb', MARBLE = '#ece8de';

// a solid of revolution round (x, z): its profile [[r, y], ...] from the bottom up
export const lathe = (kit, pts, hex, x = 0, z = 0, n = 32) => kit.add(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n), hex, x, 0, z);

// the alem: the gilded finial on a dome or a minaret's cap, a rod with two balls and the crescent
export function alem(kit, x, y, z, s = 1) {
  kit.rod([x, y, z], [x, y + 2.2 * s, z], 0.12 * s, GOLD, 6);
  kit.add(new THREE.SphereGeometry(0.38 * s, 8, 6), GOLD, x, y + 0.6 * s, z);
  kit.add(new THREE.SphereGeometry(0.28 * s, 8, 6), GOLD, x, y + 1.35 * s, z);
  kit.add(new THREE.TorusGeometry(0.42 * s, 0.09 * s, 4, 12, Math.PI * 1.4), GOLD, x, y + 2.55 * s, z, 0, 0, Math.PI * 0.8);
}

// The ring of a dome's profile from its eaves at y, r across, rising `rise` (r for a half sphere,
// less for a flatter one), with the little lip of its eaves
const cap = (r, y, rise, n = r > 6 ? 12 : 6) => [[0.01, y], [r + 0.35, y], [r + 0.35, y + 0.35], ...Array.from({ length: n + 1 }, (_, k) => {
  const t = (k / n) * (Math.PI / 2);
  return [Math.max(0.01, r * Math.cos(t)), y + 0.35 + rise * Math.sin(t)];
})];

// `n` things round a circle r out from (x, z) at height y: each gets its angle and the box turn that
// faces it outward
const round = (n, f, phase = 0) => { for (let k = 0; k < n; k++) { const a = phase + (k / n) * 2 * Math.PI; f(a, Math.PI / 2 - a); } };

// A dome on its drum at (x, z): the drum r across from y0 to y1 with `windows` windows round it,
// little buttresses between them standing out `fin`, then the dome of lead rising `rise` over its
// eaves, and the alem on top.
export function dome(kit, { x = 0, z = 0, r, y0, y1, rise = r, windows = 16, hex = STONE, lead = LEAD, fin = 0.6, finial = 1, win = DARK }) {
  if (y1 > y0) {
    kit.add(new THREE.CylinderGeometry(r, r, y1 - y0, r > 8 ? 40 : 16), hex, x, (y0 + y1) / 2, z);
    const h = Math.min(y1 - y0 - 0.8, r * 0.5), w = Math.min((2 * Math.PI * r) / windows * 0.42, 2.6);
    round(windows, (a, ry) => {
      kit.box(w, h, 0.3, win, x + (r + 0.02) * Math.cos(a), (y0 + y1) / 2, z + (r + 0.02) * Math.sin(a), 0, ry);
      if (fin) kit.box(0.5, y1 - y0, fin * 2, hex, x + (r + fin * 0.6) * Math.cos(a + Math.PI / windows), (y0 + y1) / 2, z + (r + fin * 0.6) * Math.sin(a + Math.PI / windows), 0, ry - Math.PI / windows);
    });
  }
  lathe(kit, cap(r, y1, rise), lead, x, z, r > 8 ? 40 : r > 4 ? 20 : 12);
  if (finial) alem(kit, x, y1 + 0.35 + rise, z, finial);
}

// A half-dome leaning against a bigger dome: centred on (x, z), bulging out the way of angle a (from
// u towards v), r across: its half drum from y0 to y1 with a few windows, the half-dome of lead over it
export function halfDome(kit, { x = 0, z = 0, a, r, y0, y1, rise = r, windows = 5, hex = STONE, lead = LEAD, win = DARK }) {
  const ry = Math.PI / 2 - a;
  if (y1 > y0) {
    kit.add(new THREE.CylinderGeometry(r, r, y1 - y0, 24, 1, false, -Math.PI / 2, Math.PI), hex, x, (y0 + y1) / 2, z, 0, ry);
    kit.box(2 * r, y1 - y0, 0.2, hex, x, (y0 + y1) / 2, z, 0, ry); // its flat back
    const h = Math.min(y1 - y0 - 0.8, r * 0.45), w = Math.min((Math.PI * r) / windows * 0.4, 2.4);
    for (let k = 0; k < windows; k++) {
      const b = a - Math.PI / 2 + ((k + 0.5) / windows) * Math.PI;
      kit.box(w, h, 0.3, win, x + (r + 0.02) * Math.cos(b), (y0 + y1) / 2, z + (r + 0.02) * Math.sin(b), 0, Math.PI / 2 - b);
    }
  }
  const g = new THREE.SphereGeometry(r + 0.3, 24, 8, 0, Math.PI, 0, Math.PI / 2).scale(1, rise / (r + 0.3), 1);
  kit.add(g, lead, x, y1, z, 0, ry);
  // the flat face against the dome, should it show over the drum
  kit.add(new THREE.CircleGeometry(r + 0.3, 16, 0, Math.PI).scale(1, rise / (r + 0.3), 1), lead, x, y1, z, 0, ry + Math.PI);
}

// A minaret at (x, z): its square foot `w` wide up to `base`, the shaft of sixteen sides r0 across
// up to its first şerefe and r1 above, a balcony on its corbels at each height in `balconies`, the
// short top storey (the petek) up to `top`, the pencil cap of lead `capH` tall and its alem.
export function minaret(kit, { x, z, w = 4.4, base = 0, r0 = 1.9, r1 = r0 * 0.9, balconies = [], top, capH = 10, hex = STONE, rail = MARBLE, lead = LEAD }) {
  if (base > 0) {
    kit.box(w, base, w, hex, x, base / 2, z);
    kit.box(w + 0.4, 0.5, w + 0.4, STONE2, x, base - 0.25, z);
    kit.add(new THREE.CylinderGeometry(r0 * 1.05, w * 0.62, 1.6, 16), hex, x, base + 0.8, z); // the shoulder (pabuç)
  }
  const ys = [base + 1.6, ...balconies, top];
  ys.slice(0, -1).forEach((y, k) => {
    const y1 = ys[k + 1], r = k ? r1 : r0;
    kit.add(new THREE.CylinderGeometry(r * 0.97, r, y1 - y, 16), hex, x, (y + y1) / 2, z);
    // the flutes, as thin ribs up the shaft
    if (y1 - y > 6) round(8, (a, ry) => kit.box(0.18, y1 - y - 1.4, 0.18, STONE2, x + r * 0.99 * Math.cos(a), (y + y1) / 2, z + r * 0.99 * Math.sin(a), 0, ry));
  });
  for (const y of balconies) {
    const r = r0 * 1.75;
    kit.add(new THREE.CylinderGeometry(r, r0 * 0.98, 1.6, 16), hex, x, y - 0.8, z); // the stalactite corbels
    kit.add(new THREE.CylinderGeometry(r + 0.1, r + 0.1, 0.3, 16), STONE2, x, y + 0.15, z);
    kit.add(new THREE.CylinderGeometry(r, r, 1.1, 16, 1, true), rail, x, y + 0.85, z); // the pierced parapet
    kit.add(new THREE.TorusGeometry(r, 0.09, 4, 24).rotateX(Math.PI / 2), STONE2, x, y + 1.4, z);
  }
  kit.add(new THREE.CylinderGeometry(r1 * 1.12, r1 * 1.12, 0.4, 16), STONE2, x, top + 0.2, z);
  kit.add(new THREE.ConeGeometry(r1 * 1.08, capH, 16), lead, x, top + 0.4 + capH / 2, z);
  alem(kit, x, top + 0.4 + capH - 0.2, z, 0.8);
}

// a row of windows on a block's face: the face square to `axis` ('u' or 'v') at `at`, the windows
// spread along the other axis from a to b, n of them w wide and h high at each height in ys, a
// round head on each when `arch`
export function windows(kit, axis, at, a, b, n, ys, w, h, { hex = DARK, arch = true } = {}) {
  for (const y of ys) for (let k = 0; k < n; k++) {
    const c = a + ((k + 0.5) * (b - a)) / n, [x, z] = axis === 'u' ? [at, c] : [c, at];
    const [bw, bd] = axis === 'u' ? [0.3, w] : [w, 0.3];
    kit.box(bw, h, bd, hex, x, y, z);
    if (arch) kit.add(new THREE.CylinderGeometry(w / 2, w / 2, 0.3, 8, 1, false, 0, Math.PI), hex, x, y + h / 2, z, 0, axis === 'u' ? 0 : Math.PI / 2, Math.PI / 2);
  }
}

// The pieces of a courtyard's walls from u0 to u1 and v0 to v1, each with the portico `depth` deep
// behind it, broken by its gates: [side, at, width] with side 'u0', 'u1', 'v0' or 'v1' and at where
// along it. Each piece { axis, at, out, s0, s1, box: [u0, v0, u1, v1] }: the box is what riders bump
// into, for the monument's foot.
export function courtyardWalls({ u0, u1, v0, v1, depth = 8, gates = [] }) {
  const sides = {
    u0: { a: v0, b: v1, at: u0, axis: 'u', out: -1 }, u1: { a: v0, b: v1, at: u1, axis: 'u', out: 1 },
    v0: { a: u0, b: u1, at: v0, axis: 'v', out: -1 }, v1: { a: u0, b: u1, at: v1, axis: 'v', out: 1 },
  };
  return Object.entries(sides).flatMap(([key, { a, b, at, axis, out }]) => {
    const cuts = gates.filter(g => g[0] === key).map(([, c, w]) => [c - w / 2, c + w / 2]).sort((p, q) => p[0] - q[0]);
    const pieces = [];
    let s = a;
    for (const [c0, c1] of cuts) { pieces.push([s, c0]); s = c1; }
    pieces.push([s, b]);
    const lo = Math.min(at, at - out * depth), hi = Math.max(at, at - out * depth);
    return pieces.filter(([p, q]) => q - p > 0.1).map(([s0, s1]) => ({ axis, at, out, s0, s1, box: axis === 'u' ? [lo, s0, hi, s1] : [s0, lo, s1, hi] }));
  });
}

// A courtyard (avlu) laid out as courtyardWalls() has it: its outer wall `h` high with a window to
// each bay, the portico of columns along the inside under a row of little domes.
export function courtyard(kit, { u0, u1, v0, v1, h = 10, depth = 8, bay = 8, gates = [], hex = STONE, lead = LEAD }) {
  for (const { axis, at, out, s0, s1 } of courtyardWalls({ u0, u1, v0, v1, depth, gates })) {
    if (axis === 'u') kit.box(1.6, h, s1 - s0, hex, at - out * 0.8, h / 2, (s0 + s1) / 2);
    else kit.box(s1 - s0, h, 1.6, hex, (s0 + s1) / 2, h / 2, at - out * 0.8);
    windows(kit, axis, at + out * 0.05, s0, s1, Math.max(1, Math.round((s1 - s0) / bay)), [h * 0.4], 1.4, 2.4);
  }
  // the portico: its roof, the columns along its inner edge and a little dome over each bay
  const inner = [u0 + depth, v0 + depth, u1 - depth, v1 - depth], ph = h - 1.2;
  kit.box(u1 - u0 - 1.6, 1.2, depth, STONE2, (u0 + u1) / 2, ph + 0.6, v0 + depth / 2 + 0.4);
  kit.box(u1 - u0 - 1.6, 1.2, depth, STONE2, (u0 + u1) / 2, ph + 0.6, v1 - depth / 2 - 0.4);
  kit.box(depth, 1.2, v1 - v0 - 1.6, STONE2, u0 + depth / 2 + 0.4, ph + 0.6, (v0 + v1) / 2);
  kit.box(depth, 1.2, v1 - v0 - 1.6, STONE2, u1 - depth / 2 - 0.4, ph + 0.6, (v0 + v1) / 2);
  const ring = [];
  const nu = Math.max(2, Math.round((u1 - u0) / bay)), nv = Math.max(2, Math.round((v1 - v0) / bay));
  for (let k = 0; k <= nu; k++) { const u = inner[0] + ((inner[2] - inner[0]) * k) / nu; ring.push([u, inner[1]], [u, inner[3]]); }
  for (let k = 1; k < nv; k++) { const v = inner[1] + ((inner[3] - inner[1]) * k) / nv; ring.push([inner[0], v], [inner[2], v]); }
  for (const [u, v] of ring) {
    kit.add(new THREE.CylinderGeometry(0.4, 0.45, ph - 0.6, 10), MARBLE, u, (ph - 0.6) / 2, v);
    kit.box(1.1, 0.6, 1.1, STONE2, u, ph - 0.3, v);
  }
  const r = depth * 0.42, domeAt = [];
  for (let k = 0; k < nu + 1; k++) { const u = u0 + depth / 2 + ((u1 - u0 - depth) * k) / nu; domeAt.push([u, v0 + depth / 2], [u, v1 - depth / 2]); }
  for (let k = 1; k < nv; k++) { const v = v0 + depth / 2 + ((v1 - v0 - depth) * k) / nv; domeAt.push([u0 + depth / 2, v], [u1 - depth / 2, v]); }
  for (const [u, v] of domeAt) dome(kit, { x: u, z: v, r, y0: ph + 1.2, y1: ph + 2, rise: r * 0.8, windows: 0, fin: 0, finial: 0.5, hex, lead });
}

// the ablution fountain (şadırvan) at (x, z): its basin, the columns and the roof on them
export function fountain(kit, x, z, r = 3.4, hex = MARBLE) {
  kit.add(new THREE.CylinderGeometry(r * 0.7, r * 0.75, 1.4, 8), hex, x, 0.7, z);
  round(8, (a) => kit.add(new THREE.CylinderGeometry(0.16, 0.18, 3.6, 6), hex, x + r * 0.95 * Math.cos(a), 1.8, z + r * 0.95 * Math.sin(a)), Math.PI / 8);
  kit.add(new THREE.CylinderGeometry(r * 1.25, r * 1.2, 0.5, 8), STONE2, x, 3.85, z);
  kit.add(new THREE.ConeGeometry(r * 1.2, 1.6, 8), LEAD, x, 4.9, z);
  alem(kit, x, 5.6, z, 0.5);
}
