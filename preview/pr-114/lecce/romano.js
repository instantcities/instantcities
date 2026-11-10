// Lecce's two Roman ruins, modelled by hand on the open ground the map leaves for them, from their
// measurements and photos, in game metres (the real ones times 1.25):
//   the Roman theatre (Augustan, found in 1929 among the courtyards south of Santa Chiara): the cavea,
//     its rows of seats in a half-ellipse round the orchestra with a walkway half way up and the wall
//     round its top, the low stage in front of it with its niches, and what is left of the stage
//     wall behind, its doors and the stumps of its columns
//   the amphitheatre (2nd century) in Piazza Sant'Oronzo: the part dug out in 1901-38, a third of it
//     (the rest lies under the buildings and streets south and east of it): the arena with the wall
//     round it and its doors, the lower rows of seats over that, and further out what is left of the
//     vaults that carried the upper seats: their radial walls broken off, and the two ring walls with
//     their arches
// Both lie sunk below the street in the city; the game's ground is flat, so here they stand on it,
// the arena and the orchestra at street level (the way Rome's Largo di Torre Argentina does).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, sweep, arcade, archRing, onMap, rect, column } from '../core/js/arcade.js';
import { rng } from '../core/js/facades.js';
import { prism, polyPath } from './outline.js';

const SEAT = '#d4c39b', SEAT2 = '#c8b68c', RUIN = '#c9b38a', RUIN2 = '#b9a37a', PAVE = '#ddd0b2', SAND = '#d9c69c', EARTH = '#b7a47f', DARK = '#4a4034';

// A cavea's ellipses: (a0, b0) round the arena or the orchestra and (a1, b1) round its back, about
// (0, 0) of the model; the point a share t of the way out from the one to the other, at angle th
// (from +u towards +v), y up
const at = (E, t, th, y = 0) => new THREE.Vector3((E.a0 + (E.a1 - E.a0) * t) * Math.cos(th), y, (E.b0 + (E.b1 - E.b0) * t) * Math.sin(th));
// the ring [[u, v], ...] between t0 and t1 from th0 to th1, n steps
const band = (E, t0, t1, th0, th1, n) => {
  const out = [];
  for (let k = 0; k <= n; k++) { const p = at(E, t1, th0 + ((th1 - th0) * k) / n); out.push([p.x, p.z]); }
  for (let k = n; k >= 0; k--) { const p = at(E, t0, th0 + ((th1 - th0) * k) / n); out.push([p.x, p.z]); }
  return out;
};
// a line of points along the ellipse at t, from th0 to th1
const arc = (E, t, th0, th1, n) => Array.from({ length: n + 1 }, (_, k) => { const p = at(E, t, th0 + ((th1 - th0) * k) / n); return [p.x, p.z]; });

// triangles facing `want` (turned round when they do not)
const A = new THREE.Vector3(), B = new THREE.Vector3();
function quad(pos, a, b, c, d, want) {
  for (const [p, q, r] of [[a, b, c], [a, c, d]]) {
    A.subVectors(q, p); B.subVectors(r, p);
    const flip = A.cross(B).dot(want) < 0;
    pos.push(p.x, p.y, p.z, ...(flip ? [r.x, r.y, r.z, q.x, q.y, q.z] : [q.x, q.y, q.z, r.x, r.y, r.z]));
  }
}

// A row of seats: the stone between t0 and t1 from th0 to th1, its top at y, its front (towards the
// middle) from y - rise up, its two ends down to the ground, and its back when `back`
function row(kit, E, t0, t1, th0, th1, y, rise, hex, { n = 40, back = false } = {}) {
  const pos = [], up = new THREE.Vector3(0, 1, 0);
  for (let k = 0; k < n; k++) {
    const a = th0 + ((th1 - th0) * k) / n, b = th0 + ((th1 - th0) * (k + 1)) / n, m = (a + b) / 2;
    const out = at(E, (t0 + t1) / 2, m).normalize();
    quad(pos, at(E, t0, a, y), at(E, t0, b, y), at(E, t1, b, y), at(E, t1, a, y), up);
    quad(pos, at(E, t0, a, y - rise), at(E, t0, b, y - rise), at(E, t0, b, y), at(E, t0, a, y), out.clone().negate());
    if (back) quad(pos, at(E, t1, a, 0), at(E, t1, b, 0), at(E, t1, b, y), at(E, t1, a, y), out);
  }
  for (const [th, s] of [[th0, -1], [th1, 1]]) {
    const tan = new THREE.Vector3(-(E.a0 + E.a1) * Math.sin(th) * s, 0, (E.b0 + E.b1) * Math.cos(th) * s);
    quad(pos, at(E, t0, th, 0), at(E, t1, th, 0), at(E, t1, th, y), at(E, t0, th, y), tan);
  }
  return kit.add(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)), hex);
}

// ---------------------------------------------------------------- the theatre
// +u along the stage, +v south into the cavea; (0, 0) the middle of the orchestra
const TX = 190.4, TZ = 328.3, TTURN = 0.1527;
const THEATRE = { a0: 7, b0: 7.4, a1: 19.5, b1: 26.5 };
const TH0 = 0.12, TH1 = Math.PI - 0.12; // the cavea's two ends, a little short of the orchestra's middle line

export function teatro() {
  const kit = new Kit(), E = THEATRE;
  // the orchestra's paving, in a half-ellipse
  prism(kit, [[E.a0 + 1.5, -0.4], [-E.a0 - 1.5, -0.4], ...arc({ ...E, a0: E.a0 + 0.2, b0: E.b0 + 0.2 }, 0, Math.PI, 0, 24)], 0, 0.06, PAVE);
  // the rows of seats: a low step round the orchestra, two flights of rows with the walkway between
  const rows = [[0, 0.04, 0.45]];
  for (let k = 0, t = 0.04, y = 0.45; k < 15; k++) {
    const walk = k === 7, d = walk ? 0.09 : 0.055;
    y += walk ? 0.3 : 0.38;
    rows.push([t, t + d, y]);
    t += d;
  }
  rows.forEach(([t0, t1, top], k) => row(kit, E, t0, t1, TH0, TH1, top, k ? top - rows[k - 1][2] : top, k % 2 ? SEAT : SEAT2, { n: 36 }));
  // the wall round the top of the cavea, standing a little higher than the last row
  const last = rows.at(-1);
  row(kit, E, last[1], 1, TH0, TH1, last[2] + 1.4, last[2] + 1.4, RUIN, { n: 36, back: true });
  // the stairs up the cavea: five flights of narrow steps, a lighter stone
  for (const th of [0.55, 1.1, Math.PI / 2, Math.PI - 1.1, Math.PI - 0.55]) rows.slice(1).forEach(([t0, t1, top]) => row(kit, E, t0, t1, th - 0.012, th + 0.012, top + 0.04, 0.42, '#e3d6b6', { n: 1 }));
  // the stage: its low front with the niches, its floor, and the stage wall behind it, broken off
  const R = rng(41);
  kit.box(32, 1.3, 5.2, RUIN, 0, 0.65, -3.0);
  for (let u = -14; u <= 14; u += 3.5) kit.box(Math.abs(u) % 7 < 1 ? 1.6 : 1.0, 0.8, 0.3, DARK, u, 0.6, -0.3);
  const back = linePath(16, -6.2, -16, -6.2), top = [];
  for (let s = 0; s <= 32; s += 2) top.push([s, 2.4 + R() * 2.2]);
  wall(kit, back, [[0, 0], [32, 0], ...top.reverse()], { o0: -0.5, o1: 0.5, hex: RUIN2, holes: [archRing(16, 2.6, 1.3, 4.0, 8), archRing(7.5, 1.6, 1.3, 3.2, 6), archRing(24.5, 1.6, 1.3, 3.2, 6)] });
  for (const u of [-11, -8, -4.5, 4.5, 8, 11]) column(kit, linePath(u - 1, -5.0, u + 1, -5.0), 1, 0, 1.3, 1.3 + 1.2 + R() * 2.4, 0.36, '#e6dcc4', 'tuscan');
  return kit.mesh(kitMat(0.9, 0));
}

// ---------------------------------------------------------------- the amphitheatre
// not turned; (0, 0) the middle of the arena, on the line where the buildings to the south cut it
const AX = 432, AZ = 214;
const AMPHI = { a0: 30, b0: 40, a1: 64, b1: 74 };
// what is dug out: from the arena's west end (short of the street along the cut to the south) round
// by the north to where the street along its east side cuts it
const AH0 = Math.PI + 0.2, AH1 = 2 * Math.PI - Math.acos(5 / 64);
const SEATS = 0.42; // the rows of seats reach this far out; the vaults beyond

export function anfiteatro() {
  const kit = new Kit(), E = AMPHI, R = rng(73);
  // the arena's sand, out to the cuts
  const a = at(E, 0, AH0), b = at(E, 0, AH1);
  prism(kit, [...arc(E, 0, AH0, AH1, 40), [b.x, a.z]], 0, 0.08, SAND);
  // the wall round the arena, its doors to the passages under the seats, its coping
  const podium = polyPath(arc(E, 0, AH0, AH1, 60)), L = podium.length;
  const doors = [];
  for (let s = 6; s < L - 4; s += 9.5) doors.push(archRing(s, 1.9, 0, 2.3, 8));
  wall(kit, podium, [[0, 0], [L, 0], [L, 2.9], [0, 2.9]], { o0: 0, o1: 1.3, hex: RUIN, holes: doors });
  sweep(kit, podium, 0, L, [[-0.15, 2.9], [1.4, 2.9], [1.4, 3.25], [-0.15, 3.25]], '#e0d3b4', { step: 2 });
  // the lower rows of seats over it
  let y = 3.25;
  for (let k = 0; k < 8; k++) {
    const t0 = 0.04 + k * 0.0475;
    y += 0.36;
    row(kit, E, t0, t0 + 0.0475, AH0, AH1, y, 0.36, k % 2 ? SEAT : SEAT2, { n: 48, back: k === 7 });
  }
  // beyond them the ground the upper seats stood on, now rubble and grass, and the vaults' walls
  prism(kit, band(E, SEATS, 1, AH0, AH1, 48), 0, 0.35, EARTH);
  const inner = polyPath(arc(E, 0.66, AH0, AH1, 60)), outer = polyPath(arc(E, 1, AH0, AH1, 60));
  for (const [path, h, bays] of [[inner, 4.6, 16], [outer, 4.0, 22]]) {
    arcade(kit, path, { bays, start: path.length / bays / 2, depth: 1.0, o: 0.5, hex: () => RUIN,
      storeys: [{ h, arch: 0.5, crown: h - 1.1 }],
      stand: i => (i % 5 === 2 ? 0.45 : i % 3 === 1 ? 0.7 : 1) });
  }
  // the radial walls between the vaults, from the top row out to the outer wall, broken off
  const n = 18;
  for (let k = 0; k <= n; k++) {
    const th = AH0 + ((AH1 - AH0) * k) / n, p = at(E, SEATS, th), q = at(E, 1, th);
    const len = p.distanceTo(q), dir = q.clone().sub(p).normalize();
    const h0 = k === 0 || k === n ? y : 2.2 + R() * 3.2, h1 = k === 0 || k === n ? 3.4 : 1.6 + R() * 2.2;
    const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(len, 0), new THREE.Vector2(len, h1), new THREE.Vector2(len * 0.6, (h0 + h1) / 2 + R() * 0.8), new THREE.Vector2(0, h0)]);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.9, bevelEnabled: false }).translate(0, 0, -0.45);
    kit.add(geo, k % 2 ? RUIN : RUIN2, p.x, 0, p.z, 0, Math.atan2(-dir.z, dir.x), 0);
  }
  return kit.mesh(kitMat(0.9, 0));
}

// the cavea's outline and the stage's, in the city's metres
const T = THEATRE, theatreRing = band(T, 0, 1, TH0, TH1, 24);

export const ROMANO = [
  { id: 'teatro-romano', name: 'Teatro Romano', x: TX, z: TZ, turn: TTURN, reach: 200,
    area: [onMap(TX, TZ, TTURN, theatreRing), onMap(TX, TZ, TTURN, rect(-16, -6.8, 16, -0.4))],
    foot: [onMap(TX, TZ, TTURN, theatreRing), onMap(TX, TZ, TTURN, rect(-16, -6.8, 16, -0.4))],
    make: teatro },
  { id: 'anfiteatro', name: 'Anfiteatro Romano', x: AX, z: AZ, turn: 0, reach: 240,
    area: [onMap(AX, AZ, 0, band(AMPHI, 0, 1, AH0, AH1, 48))],
    foot: [onMap(AX, AZ, 0, band(AMPHI, 0, 1, AH0, AH1, 48))],
    make: anfiteatro },
];
