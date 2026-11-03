// De Opera (Louis Roelandt, 1840) on the Schouwburgstraat, between the Kouter and the Koophandelsplein,
// modelled by hand on the map's two outlines (the front wing on the street with its rounded middle,
// the auditorium and the stage behind it, down to the Ketelvest) and drawn from Mapillary photos:
// pale grey stone all round; on the street and on the Koophandelsplein a rusticated ground floor of
// tall round-arched windows with dark green frames, above it a floor of tall windows with little
// pediments and balustrades between pilasters, a row of smaller windows, a deep cornice and a
// balustrade along the top; the walls to the back and down to the water plainer, rows of small
// windows over the rusticated base. A flat zinc roof. It joins the statues (ghent/monuments.js) in
// place of the map's boxes, which made it a beige office block.
import * as THREE from 'three';
import { MAP } from './map.js';
import { ashlar, roundArch, stringCourse, balustrade, pilaster, shade } from '../core/js/facades.js';
import { slab, tiled, mat, mesh, inside } from './blocks.js';

const H = 26; // game metres to the top of the balustrade (the map has 26)
const BAY = 5.8; // metres of front to a bay
const STONE = '#d3cdbf', SIDE_STONE = '#c4beb0', GLASS = '#2a3236', FRAME = '#2f4a3c';

// the map's building with its middle (the mean of its corners) nearest to (x, z)
function outline(x, z) {
  let best = null, dist = Infinity;
  for (const b of MAP.buildings) {
    const n = b.p.length / 2;
    let cx = 0, cz = 0;
    for (let k = 0; k < n; k++) { cx += b.p[2 * k] / n; cz += b.p[2 * k + 1] / n; }
    const d = Math.hypot(cx - x, cz - z);
    if (d < dist) { dist = d; best = b.p; }
  }
  return dist < 3 ? best : null;
}

// the wing on the Schouwburgstraat, and the auditorium and stage behind it
const FRONT = outline(-152.9, 526.3), BACK = outline(-175.6, 535);
const RINGS = [FRONT, BACK].filter(Boolean);

// ------------------------------------------------------------------ the drawings

const textures = {};
const tex = (key, make) => (textures[key] ??= make());

// the rusticated ground floor: deep joints between the courses, the blocks staggered
function rustic(g, w, y0, y1, S) {
  ashlar(g, 0, y0, w, y1, S, { course: 0.75, seed: 17, vary: 0.04 });
  g.fillStyle = shade(S, -0.38);
  for (let y = y0 + 0.75; y < y1; y += 0.75) g.fillRect(0, y - 0.09, w, 0.09);
}

// a bay of the front: the arched window below, the tall pedimented window over a balustrade, the
// small window above, between pilasters, under the cornice and the top balustrade
const frontBay = () => tex('front', () => tiled(BAY, H, 20, (g, w, h) => {
  const S = STONE, c = w / 2;
  ashlar(g, 0, 0, w, h, S, { course: 0.6, seed: 23, vary: 0.035 });
  rustic(g, w, 0, 8.4, S);
  g.fillStyle = shade(S, -0.3);
  g.fillRect(0, 0, w, 0.6); // the plinth
  // the round-arched window, its voussoirs and keystone, the green frame in it
  roundArch(g, c, 0.6, 3.6, 7, shade(S, 0.1));
  roundArch(g, c, 0.6, 3.0, 6.7, GLASS);
  g.fillStyle = FRAME;
  g.fillRect(c - 1.5, 0.6, 0.14, 5.2); g.fillRect(c + 1.36, 0.6, 0.14, 5.2);
  g.fillRect(c - 0.07, 0.6, 0.14, 6.6);
  g.fillRect(c - 1.5, 3.4, 3, 0.14); g.fillRect(c - 1.5, 5.25, 3, 0.18);
  g.fillStyle = shade(S, 0.16);
  g.fillRect(c - 0.35, 6.9, 0.7, 1.1); // the keystone
  stringCourse(g, 0, w, 8.6, S, 0.6);
  // the first floor: pilasters, the tall window over its little balustrade, a pediment on top
  for (const x of [0.35, w - 0.35]) pilaster(g, x, 8.9, 21.3, 0.7, S);
  balustrade(g, c - 1.6, c + 1.6, 9, 1.1, S, 0.55);
  g.fillStyle = shade(S, -0.28);
  g.fillRect(c - 1.25, 10.05, 2.5, 5.6);
  g.fillStyle = GLASS;
  g.fillRect(c - 1.0, 10.1, 2.0, 5.35);
  g.fillStyle = shade(GLASS, 0.2);
  g.fillRect(c - 0.85, 13.6, 0.7, 1.6); g.fillRect(c + 0.15, 13.6, 0.7, 1.6);
  g.fillStyle = shade(S, 0.12);
  g.fillRect(c - 0.07, 10.1, 0.14, 5.35); g.fillRect(c - 1, 13.2, 2, 0.14);
  g.fillStyle = shade(S, 0.1);
  g.fillRect(c - 1.5, 15.7, 3, 0.35);
  g.beginPath(); g.moveTo(c - 1.6, 16.05); g.lineTo(c, 17); g.lineTo(c + 1.6, 16.05); g.closePath(); g.fill();
  g.fillStyle = shade(S, -0.25);
  g.beginPath(); g.moveTo(c - 1.15, 16.15); g.lineTo(c, 16.7); g.lineTo(c + 1.15, 16.15); g.closePath(); g.fill();
  stringCourse(g, 0.8, w - 0.8, 17.6, S, 0.4);
  // the second floor's smaller window
  g.fillStyle = shade(S, -0.28);
  g.fillRect(c - 1.05, 18.15, 2.1, 2.7);
  g.fillStyle = GLASS;
  g.fillRect(c - 0.85, 18.25, 1.7, 2.5);
  g.fillStyle = shade(S, 0.12);
  g.fillRect(c - 0.07, 18.25, 0.14, 2.5);
  // the entablature: a plain frieze, dentils and the deep cornice; the balustrade along the top
  g.fillStyle = shade(S, 0.06);
  g.fillRect(0, 21.3, w, 1.3);
  stringCourse(g, 0, w, 21.4, S, 0.4);
  g.fillStyle = shade(S, -0.32);
  for (let x = 0.1; x < w; x += 0.4) g.fillRect(x, 22.6, 0.2, 0.3);
  stringCourse(g, 0, w, 23.3, S, 0.8);
  balustrade(g, 0, w, 23.7, 1.7, S, 0.5);
  g.fillStyle = shade(S, 0.1);
  g.fillRect(0, h - 0.6, w, 0.6);
}));

// a bay of the plainer walls: the rusticated base with a small window, two rows of windows
// in plain frames, the cornice
const sideBay = () => tex('side', () => tiled(BAY, H, 16, (g, w, h) => {
  const S = SIDE_STONE, c = w / 2;
  ashlar(g, 0, 0, w, h, S, { course: 0.6, seed: 29, vary: 0.04 });
  rustic(g, w, 0, 6.6, S);
  g.fillStyle = shade(S, -0.3);
  g.fillRect(0, 0, w, 0.6);
  g.fillStyle = shade(S, -0.3); g.fillRect(c - 1.05, 2.15, 2.1, 3.1);
  g.fillStyle = GLASS; g.fillRect(c - 0.85, 2.3, 1.7, 2.8);
  stringCourse(g, 0, w, 6.8, S, 0.5);
  for (const [y, hh] of [[8.6, 4.6], [15, 3.6]]) {
    g.fillStyle = shade(S, -0.28); g.fillRect(c - 1.15, y - 0.15, 2.3, hh + 0.3);
    g.fillStyle = GLASS; g.fillRect(c - 0.95, y, 1.9, hh);
    g.fillStyle = shade(S, 0.12); g.fillRect(c - 0.07, y, 0.14, hh); g.fillRect(c - 1.3, y - 0.3, 2.6, 0.2);
  }
  g.fillStyle = shade(S, 0.05); g.fillRect(0, 21.3, w, 1.3);
  stringCourse(g, 0, w, 23.3, S, 0.8);
  g.fillStyle = shade(S, 0.08); g.fillRect(0, 23.7, w, h - 23.7);
  g.fillStyle = shade(S, -0.2); g.fillRect(0, h - 0.5, w, 0.12);
}));

// ------------------------------------------------------------------ the model

// The walls along a ring up to y, the drawing `bay` metres wide a whole number of times on each
// side, sorted by which way the side looks: to the street (north) and the Koophandelsplein (west)
// the front's drawing, the rest the plainer one. A side against the other ring is left out.
function sides(ring, others, y, ox, oz) {
  const out = { front: { pos: [], uv: [] }, side: { pos: [], uv: [] } }, n = ring.length / 2;
  for (let k = 0; k < n; k++) {
    const ax = ring[2 * k], az = ring[2 * k + 1], bx = ring[(2 * k + 2) % ring.length], bz = ring[(2 * k + 3) % ring.length];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.05) continue;
    let nx = -(bz - az) / L, nz = (bx - ax) / L;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (inside(mx + nx * 0.3, mz + nz * 0.3, ring)) { nx = -nx; nz = -nz; } // outwards
    if (others.some(r => inside(mx + nx * 1, mz + nz * 1, r))) continue;
    const o = nz < -0.5 || nx < -0.7 ? out.front : out.side, u = Math.max(1, Math.round(L / BAY));
    o.pos.push(ax - ox, 0, az - oz, bx - ox, 0, bz - oz, bx - ox, y, bz - oz, ax - ox, 0, az - oz, bx - ox, y, bz - oz, ax - ox, y, az - oz);
    o.uv.push(0, 0, u, 0, u, 1, 0, 0, u, 1, 0, 1);
  }
  return Object.fromEntries(Object.entries(out).map(([key, { pos, uv }]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return [key, g];
  }));
}

function opera(ox, oz) {
  const g = new THREE.Group();
  const front = mat({ map: frontBay() }), side = mat({ map: sideBay() });
  const zinc = mat({ color: 0x6d7276, roughness: 0.6 }), ledge = mat({ color: 0xd8d2c4 });
  for (const ring of RINGS) {
    const s = sides(ring, RINGS.filter(r => r !== ring), H, ox, oz);
    g.add(mesh(s.front, front));
    g.add(mesh(s.side, side));
    g.add(mesh(slab(ring, H - 0.4, H - 0.1, ox, oz), [zinc, ledge]));
  }
  return g;
}

const [X, Z] = (() => {
  const p = RINGS.flat(), n = p.length / 2;
  let x = 0, z = 0;
  for (let k = 0; k < n; k++) { x += p[2 * k] / n; z += p[2 * k + 1] / n; }
  return [x, z];
})();

export const OPERA = RINGS.length === 2 ? [{ id: 'opera', name: 'Opera Gent', x: X, z: Z, turn: 0, reach: 100, area: RINGS, foot: RINGS, make: () => opera(X, Z) }] : [];
