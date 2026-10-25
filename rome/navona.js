// Piazza Navona: its three fountains in their basins (the map's pools, sunk below the square) and
// Sant'Agnese in Agone on its west side, modelled by hand from their measurements and photos, in
// game metres (the real ones times 1.25):
//   in the middle Bernini's Fontana dei Quattro Fiumi (1651): the cliff of travertine open on four
//     sides, the four river gods on it (the Nile, the Ganges, the Danube, the Río de la Plata) with
//     the palm, the lion and the horse, and on top Domitian's obelisk with the Pamphilj dove
//   at the south end the Fontana del Moro: the Moor wrestling his dolphin on a shell (Bernini's,
//     1653) in the middle of the basin, the four tritons round him
//   at the north end the Fontana del Nettuno: Neptune fighting the octopus (1878), the nereids and
//     sea horses round him
//   Borromini's front of Sant'Agnese (1653-66): the concave middle between its two bell towers, the
//     giant order, the pediment over the door, and the dome on its drum behind it; the map's church
//     stays behind the front, and the dome rises out of it
// Riders bump into the basins' rims and into the church's front.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { sweep, wall, archRing, onMap, rect } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';
import { polyPath } from './trevi.js';
import { MAP } from './map.js';

const TRAV = '#e2d6ba', TRAV2 = '#d4c7a8', MARBLE = '#f1ede3', ROCK = ['#cfc3a3', '#c2b594', '#d8ccae', '#b9ab8b'], GRANITE = '#b08a7a', LEAD = '#8d908f';
const TURN = 0.06; // the square's long axis turned from north

// the city's (x, z) as the model's own (u, v)
const frame = (X, Z) => (x, z) => { const c = Math.cos(TURN), s = Math.sin(TURN), dx = x - X, dz = z - Z; return [dx * c - dz * s, dx * s + dz * c]; };
const centre = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
// the map's pool whose middle is nearest (x, z), its outline in the model's own metres, running with
// the water on its left so the rim's profile stands out to the right of it
function pool(x, z) {
  const near = MAP.areas.filter(a => a.k === 'water' && Math.hypot(...centre(a.p).map((c, i) => c - [x, z][i])) < 6);
  const a = near.sort((p, q) => q.p.length - p.p.length)[0], f = frame(x, z);
  const pts = [];
  for (let k = 0; k < a.p.length; k += 2) pts.push(f(a.p[k], a.p[k + 1]));
  let sum = 0;
  pts.forEach(([u, v], i) => { const [u2, v2] = pts[(i + 1) % pts.length]; sum += u * v2 - u2 * v; });
  if (sum < 0) pts.reverse();
  return [...pts, pts[0]];
}
// the rim round a pool, its foot down to the water
const RIM = [[-0.3, -2.8], [0, -2.8], [0, 0], [1.5, 0], [1.5, 0.75], [-0.3, 0.75]];
const rim = (kit, edge) => { const p = polyPath(edge); sweep(kit, p, 0, p.length, RIM, TRAV2, { step: 1 }); };
// the rim's footprint: a strip along the pool's edge, out and back
function rimRing(edge) {
  const p = polyPath(edge), out = [], back = [];
  for (let s = 0; s <= p.length; s += 1.2) {
    const a = p.at(Math.min(s, p.length - 0.01));
    out.push([a.x + 1.5 * a.tz, a.z - 1.5 * a.tx]);
    back.push([a.x - 0.3 * a.tz, a.z + 0.3 * a.tx]);
  }
  return [...out, ...back.reverse()];
}
// a figure from its feet at (u, y, v), h high: a body, the shoulders, the head, an arm raised
function figure(kit, u, y, v, h, hex = MARBLE, ry = 0, reach = 0.9) {
  kit.add(new THREE.CylinderGeometry(h * 0.1, h * 0.13, h * 0.62, 8), hex, u, y + h * 0.31, v);
  kit.box(h * 0.32, h * 0.11, h * 0.15, hex, u, y + h * 0.64, v, 0, ry, 0);
  kit.add(new THREE.SphereGeometry(h * 0.08, 8, 6), hex, u, y + h * 0.78, v);
  kit.add(new THREE.CylinderGeometry(h * 0.035, h * 0.04, h * 0.36, 6), hex, u + Math.cos(ry) * h * 0.2, y + h * 0.74, v - Math.sin(ry) * h * 0.2, 0, ry, -reach);
}
// a river god reclining on the rock at (u, y, v), his head towards the corner he looks out from
function reclining(kit, u, y, v, ry, h = 4.6) {
  const g = new Kit();
  g.add(new THREE.CylinderGeometry(h * 0.12, h * 0.15, h * 0.75, 8).rotateZ(Math.PI / 2 - 0.35), MARBLE, 0, h * 0.2, 0);
  g.add(new THREE.SphereGeometry(h * 0.09, 8, 6), MARBLE, h * 0.4, h * 0.42, 0);
  g.add(new THREE.CylinderGeometry(h * 0.04, h * 0.045, h * 0.4, 6), MARBLE, h * 0.2, h * 0.5, h * 0.12, 0.6, 0, -0.4);
  g.add(new THREE.CylinderGeometry(h * 0.06, h * 0.05, h * 0.55, 6).rotateZ(Math.PI / 2 + 0.2), MARBLE, -h * 0.45, h * 0.05, h * 0.1);
  const geo = g.geometry();
  geo.rotateY(ry);
  geo.translate(u, y, v);
  kit.pieces.push(geo);
}
const rocks = (kit, r, n, place) => {
  for (let k = 0; k < n; k++) {
    const [u, y, v, size] = place(r);
    kit.add(new THREE.IcosahedronGeometry(size, 0).scale(1.2, 0.85, 1.1), ROCK[k % ROCK.length], u, y, v, r() * 3, r() * 3, 0);
  }
};

// The Fontana dei Quattro Fiumi, on the map's pool in the middle of the square
const FIUMI = { X: -548.2, Z: -16.7 };
function fiumi() {
  const kit = new Kit(), r = rng(31), edge = pool(FIUMI.X, FIUMI.Z);
  rim(kit, edge);
  // the cliff: four legs of rock at its corners with the grotto open between them, the rock they
  // carry over it, the ledges the river gods lie on, the rocks round its foot in the water
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    rocks(kit, r, 22, r => [a * 3.5 + (r() - 0.5) * 2.4, -2.2 + r() * 10, b * 3.5 + (r() - 0.5) * 2.4, 0.6 + r() * 0.6]);
    rocks(kit, r, 6, r => [a * 5.2 + (r() - 0.5) * 1.6, 2 + r() * 2.4, b * 5.2 + (r() - 0.5) * 1.6, 0.6 + r() * 0.5]);
  }
  kit.box(9.6, 2.2, 9.6, ROCK[1], 0, 9.2, 0);
  rocks(kit, r, 30, r => { const a = r() * 2 * Math.PI, d = 3.6 + r() * 1.4; return [d * Math.cos(a), 8.4 + r() * 2.2, d * Math.sin(a), 0.55 + r() * 0.5]; });
  rocks(kit, r, 26, r => { const a = r() * 2 * Math.PI, d = 6.5 + r() * 2.5; return [d * Math.cos(a), -2.5 + r() * 1.2, d * Math.sin(a), 0.6 + r() * 0.7]; });
  // the obelisk on its base, the dove on top
  kit.box(3.6, 1.4, 3.6, TRAV, 0, 10.9, 0);
  kit.box(3, 1.4, 3, MARBLE, 0, 12.3, 0);
  const shaft = new THREE.CylinderGeometry(0.95, 1.3, 20.6, 4, 1).rotateY(Math.PI / 4);
  kit.add(shaft, GRANITE, 0, 13 + 10.3, 0);
  kit.add(new THREE.ConeGeometry(0.95, 1.4, 4).rotateY(Math.PI / 4), GRANITE, 0, 34.3, 0);
  kit.add(new THREE.SphereGeometry(0.45, 8, 6).scale(1, 0.8, 1.6), '#4a463c', 0, 35.3, 0);
  kit.box(1.6, 0.12, 0.5, '#4a463c', 0, 35.4, 0);
  // the four rivers at the corners, the palm, the lion coming out of the grotto, the horse
  for (const [a, b, ry] of [[-1, -1, 0.8], [1, -1, 2.35], [1, 1, -2.35], [-1, 1, -0.8]]) reclining(kit, a * 5.6, 4.6, b * 5.6, ry);
  kit.rod([-3.6, 8, 2.8], [-4.6, 13.5, 3.4], 0.25, '#bfb79f', 5);
  for (let k = 0; k < 6; k++) kit.box(2.6, 0.12, 0.5, '#8f9a76', -4.6 + Math.cos(k) * 1.1, 13.4, 3.4 + Math.sin(k) * 1.1, 0, k * 1.05, -0.4);
  kit.box(1.4, 1.2, 3, MARBLE, -4.4, 1.4, 0);
  kit.add(new THREE.SphereGeometry(0.75, 8, 6), MARBLE, -4.4, 2.2, -1.6);
  kit.box(1.2, 1.4, 3.2, MARBLE, 4.6, 2.2, 0.4, -0.4, 0, 0);
  kit.box(0.7, 1.6, 0.8, MARBLE, 4.6, 3.6, -1.3, 0.5, 0, 0);
  return kit.mesh(kitMat(0.88));
}

// The Fontana del Nettuno, on the map's pool at the north end
const NETTUNO = { X: -554.9, Z: -133.4 };
function nettuno() {
  const kit = new Kit(), r = rng(43), edge = pool(NETTUNO.X, NETTUNO.Z);
  rim(kit, edge);
  rocks(kit, r, 14, r => [(r() - 0.5) * 3.2, -2.4 + r() * 2.6, (r() - 0.5) * 3.2, 0.6 + r() * 0.6]);
  figure(kit, 0, 0.4, 0, 5, MARBLE, 0.3, 1.4);
  kit.rod([0.9, 2.2, 0.2], [1.2, 6.6, 0.3], 0.07, '#5b5a52', 4);
  for (let k = 0; k < 4; k++) kit.add(new THREE.TorusGeometry(0.8, 0.18, 5, 8, Math.PI * 1.3), MARBLE, Math.cos(k * 1.6) * 0.9, 1 + k * 0.3, Math.sin(k * 1.6) * 0.9, 0, k * 1.6, 0);
  // the nereids and the sea horses in the four lobes of the basin
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    rocks(kit, r, 4, r => [a * 5.2 + (r() - 0.5) * 2, -2.3 + r(), b * 5.6 + (r() - 0.5) * 2, 0.7 + r() * 0.5]);
    kit.box(1, 1, 2.6, MARBLE, a * 5.2, -0.6, b * 5.6, -0.3, a * b * 0.6, 0);
    figure(kit, a * 5.6, -0.6, b * 6.4, 2.6, MARBLE, a * 0.7, 1.1);
  }
  return kit.mesh(kitMat(0.88));
}

// The Fontana del Moro, on the map's pool at the south end
const MORO = { X: -541.3, Z: 99.6 };
function moro() {
  const kit = new Kit(), r = rng(57), edge = pool(MORO.X, MORO.Z);
  rim(kit, edge);
  // the shell on its pedestal in the middle, the Moor on it with his dolphin
  kit.add(new THREE.CylinderGeometry(1.1, 1.6, 2.6, 10), TRAV, 0, -1.1, 0);
  kit.add(new THREE.CylinderGeometry(3.2, 1.2, 1, 14), MARBLE, 0, 0.7, 0);
  rocks(kit, r, 5, r => [(r() - 0.5) * 1.4, 1.4 + r() * 0.6, (r() - 0.5) * 1.4, 0.4 + r() * 0.3]);
  figure(kit, 0, 1.8, 0, 3.6, MARBLE, -0.4, 1.2);
  kit.add(new THREE.CylinderGeometry(0.25, 0.4, 2.4, 6).rotateZ(1.1), MARBLE, 0.9, 2.7, 0.5);
  kit.add(new THREE.TorusGeometry(0.5, 0.18, 5, 8, Math.PI), MARBLE, 1.9, 3.3, 0.5);
  // the four tritons on the rim's lobes, blowing their shells
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    kit.add(new THREE.CylinderGeometry(0.7, 0.9, 2.6, 8), TRAV, a * 5.6, -1.1, b * 5.6);
    figure(kit, a * 5.6, 0.2, b * 5.6, 2.8, MARBLE, a * b * 0.8, 2.2);
    kit.add(new THREE.ConeGeometry(0.25, 0.8, 6).rotateZ(Math.PI / 2), MARBLE, a * 5.6 + 0.6, 2.4, b * 5.6);
  }
  return kit.mesh(kitMat(0.88));
}

// Sant'Agnese in Agone: its front to +u on the square, from the north tower (-v) to the south one
const AGNESE = { X: -583, Z: 1, TURN: 0.014 }; // its front turned from north a little less than the square
const T0 = [-25.6, -14.7], T1 = [13.1, 25.6]; // the towers, along the front
function agnese() {
  const kit = new Kit(), ENT = 22, ATTIC = 25.6;
  // the block behind the front, standing above the map's church
  kit.box(9, ATTIC + 2, T1[1] - T0[0], TRAV2, -5.6, (ATTIC + 2) / 2, (T0[0] + T1[1]) / 2);
  // the concave middle between the towers, its door and windows, along an arc bowing in
  const arc = [];
  for (let k = 0; k <= 16; k++) {
    const v = T0[1] + ((T1[0] - T0[1]) * k) / 16, t = (2 * (v - T0[1])) / (T1[0] - T0[1]) - 1;
    arc.push([2 - 3.2 * (1 - t * t), v]);
  }
  const path = polyPath(arc), L = path.length, mid = L / 2;
  const holes = [[[mid - 2, 0.6], [mid + 2, 0.6], [mid + 2, 8.8], [mid - 2, 8.8]], archRing(mid, 3, 11.5, 17.5, 8),
    ...[0.22, 0.78].flatMap(f => [[[L * f - 1.3, 3], [L * f + 1.3, 3], [L * f + 1.3, 8], [L * f - 1.3, 8]], archRing(L * f, 2.4, 12, 17, 8)])];
  // in short pieces, so the wall follows the curve (a piece is flat between its ends), each with the
  // openings that fall in it
  const cuts = [0, L * 0.1, L * 0.22 - 1.6, L * 0.22 + 1.6, L * 0.34, mid - 2.4, mid + 2.4, L * 0.66, L * 0.78 - 1.6, L * 0.78 + 1.6, L * 0.9, L];
  for (let k = 0; k + 1 < cuts.length; k++) {
    const a = cuts[k], b = cuts[k + 1], inside = holes.filter(h => h.every(([q]) => q > a && q < b));
    wall(kit, path, [[a, 0], [b, 0], [b, ENT], [a, ENT]], { holes: inside, o0: -1.2, o1: 0, hex: TRAV, ends: k === 0 || k === cuts.length - 2 });
  }
  for (const ring of holes) {
    const s = (ring[0][0] + ring[1][0]) / 2, a = path.at(s), [ys] = [ring[0][1]];
    const top = Math.max(...ring.map(p => p[1]));
    kit.box(0.2, top - ys, ring[1][0] - ring[0][0], ys < 1 ? '#5c4a38' : '#3e3a34', a.x - 0.5 * a.tz, (ys + top) / 2, a.z + 0.5 * a.tx, 0, Math.atan2(a.tx, a.tz), 0);
  }
  // the giant columns along the middle, the pediment over the door
  for (const f of [0.04, 0.36, 0.64, 0.96]) {
    const a = path.at(L * f);
    kit.add(new THREE.CylinderGeometry(0.62, 0.72, ENT - 2.6, 10), TRAV, a.x + 0.8, (ENT - 2.6) / 2 + 0.6, a.z);
    kit.box(1.8, 0.6, 1.8, TRAV2, a.x + 0.8, 0.3, a.z);
    kit.add(new THREE.CylinderGeometry(0.95, 0.65, 1.6, 10), MARBLE, a.x + 0.8, ENT - 1.2, a.z);
  }
  const front = path.at(mid);
  kit.box(1.6, 1.8, 9.6, TRAV, front.x + 0.6, ENT + 0.9, front.z);
  const slope = Math.atan2(3.4, 5.6), run = Math.hypot(3.4, 5.6);
  for (const k of [-1, 1]) kit.box(1.6, 0.7, run + 0.6, TRAV, front.x + 0.8, ENT + 1.8 + 1.7, front.z + (k * 5.6) / 2, k * slope, 0, 0);
  // the entablature along it all, the attic and its balustrade over the middle
  kit.box(3.6, 2, T1[1] - T0[0] + 0.8, TRAV2, 0.6, ENT + 1, (T0[0] + T1[1]) / 2);
  kit.box(2.4, ATTIC - ENT - 2, T1[0] - T0[1], TRAV, -0.6, ENT + 2 + (ATTIC - ENT - 2) / 2, (T0[1] + T1[0]) / 2);
  for (let v = T0[1] + 0.6; v < T1[0]; v += 0.8) kit.box(0.3, 1, 0.3, TRAV2, 0.4, ATTIC + 0.5, v);
  // the towers: the giant order up to the entablature, then two storeys of their own and the cap
  for (const [a, b] of [T0, T1]) {
    const v = (a + b) / 2, w = b - a;
    kit.box(4, ENT, w, TRAV, 0.4, ENT / 2, v);
    for (const d of [-1, 1]) kit.box(1.4, ENT - 1, 1.2, TRAV2, 2.5, ENT / 2, v + d * (w / 2 - 0.8));
    kit.box(1.6, 7.2, 2.6, '#3e3a34', 2.35, 9.6, v);
    kit.box(w - 0.8, 8.4, w - 0.8, TRAV, -1.4, ENT + 2 + 4.2, v);
    kit.box(1, 5, 2.8, '#3e3a34', 3, ENT + 6.4, v);
    for (const [du, dv] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) kit.add(new THREE.CylinderGeometry(0.38, 0.42, 8, 8), TRAV2, -1.4 + du * (w / 2 - 0.7), ENT + 6.2, v + dv * (w / 2 - 0.7));
    kit.box(w, 0.8, w, TRAV2, -1.4, ENT + 10.8, v);
    kit.box(w - 3, 5.6, w - 3, TRAV, -1.4, ENT + 14, v);
    kit.box(1, 2.6, 1.6, '#3e3a34', 2.15, ENT + 14, v);
    kit.add(new THREE.ConeGeometry((w - 3) * 0.6, 3.2, 4).rotateY(Math.PI / 4), LEAD, -1.4, ENT + 18.4, v);
    kit.rod([-1.4, ENT + 20, v], [-1.4, ENT + 22, v], 0.08, '#4a463c', 4);
  }
  // the dome on its drum behind the front: the paired columns round the drum, the windows, the
  // ribbed dome of lead and the lantern
  const DU = -18, DR = 9.6, D0 = 14, D1 = 36;
  kit.add(new THREE.CylinderGeometry(DR, DR, D1 - D0, 24), TRAV, DU, (D0 + D1) / 2, 0);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * 2 * Math.PI, x = DU + (DR + 0.4) * Math.cos(a), z = (DR + 0.4) * Math.sin(a);
    kit.add(new THREE.CylinderGeometry(0.32, 0.36, 8, 6), TRAV2, x, D1 - 5.6, z);
    if (k % 2) kit.box(0.3, 4.2, 1.8, '#3e3a34', DU + (DR + 0.05) * Math.cos(a), D1 - 6, (DR + 0.05) * Math.sin(a), 0, -a, 0);
  }
  kit.add(new THREE.CylinderGeometry(DR + 0.9, DR + 0.9, 1, 24), TRAV2, DU, D1 + 0.5, 0);
  kit.add(new THREE.SphereGeometry(DR, 24, 10, 0, 2 * Math.PI, 0, Math.PI / 2).scale(1, 1.25, 1), LEAD, DU, D1 + 1, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    kit.add(new THREE.TorusGeometry(DR + 0.05, 0.22, 4, 12, Math.PI / 2).scale(1, 1.25, 1), TRAV2, DU, D1 + 1, 0, 0, a, 0);
  }
  kit.add(new THREE.CylinderGeometry(1.8, 2.1, 4.2, 12), TRAV, DU, D1 + 1 + DR * 1.25 + 1.8, 0);
  kit.add(new THREE.ConeGeometry(1.9, 2.4, 12), LEAD, DU, D1 + 1 + DR * 1.25 + 5.1, 0);
  kit.add(new THREE.SphereGeometry(0.45, 8, 6), '#b89a52', DU, D1 + 1 + DR * 1.25 + 6.6, 0);
  return kit.mesh(kitMat(0.88));
}

const fountain = (id, name, at, reach, make) => {
  const edge = pool(at.X, at.Z);
  return { id, name, x: at.X, z: at.Z, turn: TURN, reach, area: [onMap(at.X, at.Z, TURN, rect(-4, -4, 4, 4))], foot: [onMap(at.X, at.Z, TURN, rimRing(edge))], make };
};
// The fountains stand in for the map's bits in their basins (area), and riders bump into their rims
// (foot). Sant'Agnese stands in for nothing: the map's church stays behind it, its front stops riders.
export const NAVONA = [
  fountain('fontana-dei-quattro-fiumi', 'Fontana dei Quattro Fiumi', FIUMI, 90, fiumi),
  fountain('fontana-del-nettuno', 'Fontana del Nettuno', NETTUNO, 50, nettuno),
  fountain('fontana-del-moro', 'Fontana del Moro', MORO, 50, moro),
  { id: 'sant-agnese-in-agone', name: "Sant'Agnese in Agone", x: AGNESE.X, z: AGNESE.Z, turn: AGNESE.TURN, reach: 110, area: [],
    foot: [onMap(AGNESE.X, AGNESE.Z, AGNESE.TURN, rect(-1.6, T0[0], 2.6, T1[1]))], make: agnese },
];
