// The public buildings of Pompeii, modelled by hand on the outlines the map has of them, in place
// of the plain houses it would build there (in game metres, the real ones times 1.25):
//   the Great Theatre and the Odeon: a half-circle of seats in tiers, the orchestra, and the stage
//     building with its niches (the Great Theatre held 5,000, the roofed Odeon 1,000)
//   the Basilica: its walls, the two rows of columns inside it, broken at different heights, and
//     the tribunal at its end
//   the Temple of Apollo: the colonnade round its court and the temple on its podium
//   the Macellum, the Building of Eumachia, the Temple of Vespasian, the Granaries, the Temple of
//     Isis, the Stabian Baths and the Lupanare: their walls broken off at different heights, open
//     to the sky, as the excavation has them
// Riders bump into what stands, and not into the open middle of a court.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep, archRing } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';
import { MAP } from './map.js';

const BRICK = ['#a8614a', '#b26e50', '#9c5a44', '#b97a58'], STUCCO = '#dccaa2', STONE = '#d8cdb2', MARBLE = '#ece5d3', DARK = '#2c241c', TILE = '#b4623c';

const area = p => Math.abs(p.reduce((s, v, i) => (i % 2 ? s : s + v * p[(i + 3) % p.length] - p[(i + 2) % p.length] * p[i + 1]), 0)) / 2;
const centre = p => [p.filter((_, i) => !(i % 2)).reduce((s, v) => s + v, 0) / (p.length / 2), p.filter((_, i) => i % 2).reduce((s, v) => s + v, 0) / (p.length / 2)];
const pairs = p => Array.from({ length: p.length / 2 }, (_, i) => [p[2 * i], p[2 * i + 1]]);
const signed = pts => pts.reduce((s, [x, z], i) => s + x * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * z, 0);

// the map's outline nearest (x, z), if it is one of the bigger ones
const find = (x, z, min = 120) => MAP.buildings.filter(b => area(b.p) > min).map(b => ({ b, d: Math.hypot(...centre(b.p).map((v, i) => v - [x, z][i])) })).filter(o => o.d < 26).sort((a, b) => a.d - b.d)[0]?.b.p;
// clockwise on the map: the outside on each edge's right-hand side
const outline = p => { const pts = pairs(p); return signed(pts) < 0 ? pts.reverse() : pts; };

const column = (kit, x, z, h, r, hex = STUCCO) => {
  kit.add(new THREE.CylinderGeometry(r * 0.82, r, h, 10), hex, x, h / 2, z);
  if (h > 5) kit.box(r * 2.8, 0.5, r * 2.8, STONE, x, h + 0.25, z);
};

// walls round an outline, t thick, broken off along their tops between 55 and 100 per cent of h, and
// here and there down to a doorway
function ruin(kit, pts, h, t, seed) {
  const r = rng(seed);
  pts.forEach(([x, z], i) => {
    const [x2, z2] = pts[(i + 1) % pts.length], path = linePath(x, z, x2, z2), L = path.length;
    if (L < 1.5) return;
    const top = [];
    for (let s = L; s > 0; s -= 3 + 3 * r()) top.push([s, h * (0.5 + 0.5 * r()) + (r() < 0.12 ? -h * 0.5 : 0)]);
    top.push([0, h * (0.5 + 0.5 * r())]);
    wall(kit, path, [[0, 0], [L, 0], ...top.map(([s, y]) => [s, Math.max(0.6, y)])], { o0: -t, o1: 0, hex: BRICK[Math.floor(r() * BRICK.length)] });
  });
}

// the points round an outline, d apart, moved d0 inwards (a rectilinear one)
function ring(pts, d0, d) {
  const dir = signed(pts) > 0 ? 1 : -1, out = [];
  pts.forEach(([x, z], i) => {
    const [x2, z2] = pts[(i + 1) % pts.length], L = Math.hypot(x2 - x, z2 - z), ux = (x2 - x) / L, uz = (z2 - z) / L;
    const nx = -uz * dir, nz = ux * dir;
    for (let s = d0; s < L - d0; s += d) out.push([x + ux * s + nx * d0, z + uz * s + nz * d0]);
  });
  return out;
}

// the principal direction of an outline: its longest edge, as [ux, uz]
function axis(pts) {
  let best = 0, u = [1, 0];
  pts.forEach(([x, z], i) => { const [x2, z2] = pts[(i + 1) % pts.length], l = Math.hypot(x2 - x, z2 - z); if (l > best) { best = l; u = [(x2 - x) / l, (z2 - z) / l]; } });
  return u;
}

// extents of an outline along its axis u and across it: [u0, u1, v0, v1]
function extents(pts, u) {
  const e = [Infinity, -Infinity, Infinity, -Infinity];
  for (const [x, z] of pts) { const a = x * u[0] + z * u[1], b = -x * u[1] + z * u[0]; e[0] = Math.min(e[0], a); e[1] = Math.max(e[1], a); e[2] = Math.min(e[2], b); e[3] = Math.max(e[3], b); }
  return e;
}
const at = (u, a, b) => [a * u[0] - b * u[1], a * u[1] + b * u[0]];

function basilica(kit, pts) {
  const r = rng(11), u = axis(pts), [u0, u1, v0, v1] = extents(pts, u), L = u1 - u0, W = v1 - v0;
  ruin(kit, pts, 10, 2.2, 21);
  const c = at(u, (u0 + u1) / 2, (v0 + v1) / 2), turn = Math.atan2(u[1], u[0]);
  const place = (a, b) => at(u, (u0 + u1) / 2 + a, (v0 + v1) / 2 + b);
  kit.add(new THREE.BoxGeometry(L - 3, 0.3, W - 3), '#cfc3a6', c[0], 0.15, c[1], 0, -turn);
  // two rows of columns, a nave between, broken off at different heights; and the tribunal at the far end
  for (const side of [-1, 1]) for (let a = -L / 2 + 8; a < L / 2 - 6; a += 4.4) {
    const [x, z] = place(a, side * (W / 2 - 8));
    column(kit, x, z, r() < 0.45 ? 9 : 2.5 + 5 * r(), 0.7);
  }
  const [tx, tz] = place(L / 2 - 6, 0);
  kit.add(new THREE.BoxGeometry(8, 2.4, W - 14), STONE, tx, 1.2, tz, 0, -turn);
  for (const b of [-W / 2 + 10, W / 2 - 10]) { const [x, z] = place(L / 2 - 10, b * 0.4); column(kit, x, z, 6, 0.6); }
}

function apollo(kit, pts) {
  const r = rng(5), u = axis(pts), [u0, u1, v0, v1] = extents(pts, u);
  ruin(kit, pts, 5.5, 1.6, 31);
  const place = (a, b) => at(u, a, b), turn = Math.atan2(u[1], u[0]);
  // the colonnade round the court, 3.5 m in from the walls
  for (const [x, z] of ring(pts, 4, 4.2)) column(kit, x, z, r() < 0.55 ? 6.4 : 2 + 4 * r(), 0.55);
  // the temple on its podium in the middle of the court, with its six columns across the front
  const cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, [px, pz] = place(cu, cv);
  kit.add(new THREE.BoxGeometry((u1 - u0) * 0.4, 3.4, (v1 - v0) * 0.34), STONE, px, 1.7, pz, 0, -turn);
  for (let k = 0; k < 6; k++) { const [x, z] = place(cu - (u1 - u0) * 0.2 + 2, cv + (k - 2.5) * 3.6); column(kit, x, z, 10, 0.8, MARBLE); }
}

// the Great Theatre and the Odeon: the stage building along the outline's straight side, the seats in tiers on the half circle
function theatre(kit, pts, seats) {
  const u = axis(pts), [u0, u1, v0, v1] = extents(pts, u), L = u1 - u0, W = v1 - v0;
  // the flat side is the stage's: the side of the outline whose points lie nearer a straight line. The half-circle's
  // middle is where the outline bulges furthest from its longest edge.
  const edge = pts.reduce((best, [x, z], i) => { const [x2, z2] = pts[(i + 1) % pts.length], l = Math.hypot(x2 - x, z2 - z); return l > best.l ? { l, x, z, x2, z2 } : best; }, { l: 0 });
  const mx = (edge.x + edge.x2) / 2, mz = (edge.z + edge.z2) / 2;
  // the far point from the long edge's middle: where the seats' back is
  let far = pts[0], fd = 0;
  for (const p of pts) { const d = Math.hypot(p[0] - mx, p[1] - mz); if (d > fd) { fd = d; far = p; } }
  const R = fd * 0.98, dirx = (far[0] - mx) / fd, dirz = (far[1] - mz) / fd, a0 = Math.atan2(dirz, dirx) - Math.PI / 2;
  const cx = mx, cz = mz;
  const arc = { length: R * Math.PI, closed: false, at: s => { const t = a0 + s / R; return { x: cx + R * Math.cos(t), z: cz + R * Math.sin(t), tx: -Math.sin(t), tz: Math.cos(t) }; } };
  // the tiers: a solid slope in steps from the orchestra's edge up to the back
  const H = seats.h, step = (o, y) => [o, y];
  const prof = [[0, 0], [0, H], [-4, H], [-4, H * 0.72], [-R * 0.3, H * 0.72 - 3], [-R * 0.3, H * 0.5], [-R * 0.55, H * 0.28], [-R * 0.55, H * 0.18], [-R * 0.62, H * 0.06], [-R * 0.62, 0]];
  void step;
  sweep(kit, arc, 0, arc.length, prof, shade(STONE, -0.08), { step: 3 });
  // the radial stairs: darker wedges up the slope
  for (let k = 1; k < seats.wedges; k++) {
    const s = (k * arc.length) / seats.wedges, p = arc.at(s), nx = p.tz, nz = -p.tx;
    kit.box(1.2, 0.2, R * 0.58, '#9d917a', p.x - nx * R * 0.3, H * 0.4, p.z - nz * R * 0.3, 0, -Math.atan2(nz, nx) + Math.PI / 2, 0);
  }
  // the orchestra's floor and the stage building along the long edge
  kit.add(new THREE.CircleGeometry(R * 0.38, 28, 0, Math.PI).rotateX(-Math.PI / 2).rotateY(-a0 - Math.PI), '#d6c8a4', cx, 0.1, cz);
  const sx = Math.cos(a0 + Math.PI), sz = Math.sin(a0 + Math.PI);
  kit.box(R * 1.9, seats.stage, 7, shade(BRICK[0], -0.05), cx - dirx * 4, seats.stage / 2, cz - dirz * 4, 0, -Math.atan2(edge.z2 - edge.z, edge.x2 - edge.x), 0);
  void sx; void sz; void L; void W; void v0; void v1;
}

// a small triumphal arch: brick-faced, 11 m high, a passage 3.6 m wide through the short way
function arch(kit, pts) {
  pts.forEach(([x, z], i) => {
    const [x2, z2] = pts[(i + 1) % pts.length], path = linePath(x, z, x2, z2), L = path.length;
    const passage = L > 6 ? [archRing(L / 2, Math.min(3.8, L * 0.4), 0, 7.4)] : [];
    wall(kit, path, [[0, 0], [L, 0], [L, 11], [0, 11]], { holes: passage, o0: -3.4, o1: 0, hex: BRICK[i % BRICK.length] });
  });
}

// what is modelled, at their middles in game metres: the map's outline there is replaced
const JOBS = [
  { name: 'Basilica', at: [-176, 226], make: basilica },
  { name: 'Arch of Caligula', at: [-207, -53], make: arch, min: 20 },
  { name: 'Arch of Honour', at: [-168, 34], make: arch, min: 40 },
  { name: 'Temple of Apollo', at: [-183, 160], make: apollo },
  { name: 'Great Theatre', at: [237, 214], make: (k, p) => theatre(k, p, { h: 22, wedges: 9, stage: 9 }) },
  { name: 'Odeon', at: [302, 212], make: (k, p) => theatre(k, p, { h: 12, wedges: 5, stage: 7 }) },
  { name: 'Macellum', at: [-109, 41], make: (k, p) => ruin(k, p, 5, 1.5, 41) },
  { name: 'Eumachia', at: [-59, 132], make: (k, p) => ruin(k, p, 6, 1.6, 42) },
  { name: 'Vespasian', at: [-101, 107], make: (k, p) => ruin(k, p, 4.5, 1.4, 43) },
  { name: 'Granai', at: [-204, 101], make: (k, p) => ruin(k, p, 4, 1.3, 44) },
  { name: 'Isis', at: [223, 164], make: (k, p) => ruin(k, p, 6, 1.5, 45) },
  { name: 'Stabian Baths', at: [148, 52], make: (k, p) => ruin(k, p, 6.5, 1.6, 46) },
  { name: 'Lupanare', at: [68, 11], make: (k, p) => ruin(k, p, 5, 1.2, 47) },
];

const box = p => { const xs = p.filter((_, i) => !(i % 2)), zs = p.filter((_, i) => i % 2); return [Math.min(...xs) - 2, Math.min(...zs) - 2, Math.max(...xs) + 2, Math.min(...zs) - 2, Math.max(...xs) + 2, Math.max(...zs) + 2, Math.min(...xs) - 2, Math.max(...zs) + 2].map(v => Math.round(v * 10) / 10); };

// Each stands in for the map's outline of it (area); riders bump into the outline (foot). Their meshes
// are made in the map's own metres, so each monument stands at the origin.
export const PUBLICS = JOBS.flatMap(j => {
  const p = find(...j.at, j.min);
  if (!p) return [];
  return [{
    id: 'public-' + j.name.toLowerCase().replace(/[^a-z]+/g, '-'), name: j.name, x: 0, z: 0, turn: 0, reach: 380,
    area: [box(p)],
    foot: [p.map(v => Math.round(v * 10) / 10)],
    make: () => { const kit = new Kit(); j.make(kit, outline(p)); return kit.mesh(kitMat(0.92)); },
  }];
});
