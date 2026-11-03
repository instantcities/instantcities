// The Annie Vande Wielebrug (2023), the fiets- and footbridge over the Watersportbaan by the
// Topsporthal, drawn from photos: all in light blue steel, its deck's edges and underside, a railing
// along both sides, and along its west side the arched girder it hangs from, low at the ends and
// some 5 m over the deck in the middle, its web a row of slanting ribs with long openings between.
// It joins the statues (ghent/monuments.js) along the map's deck (OpenStreetMap's bridge, lifted as
// an arched one by area.json), with no foot of its own: riders ride over the map's deck.
import * as THREE from 'three';
import { MAP } from './map.js';
import { Kit, kitMat } from '../core/js/kit.js';

const BLUE = 0xb2e0f0, PALE = 0xd2eef6;
const RISE = 5; // how high the girder's top stands over the deck in the middle
const RIB = 1.6; // metres between the ribs of its web
const SIDE = 1; // which side the girder is on (1: the left going north to south, the west)

// the deck: the map's bridge of that name, its pieces joined end to end, with its heights
function deck() {
  const n = MAP.names.indexOf('Annie Vande Wielebrug');
  const rd = MAP.roads.find(r => r.n === n && r.br && r.y);
  return rd ? { p: rd.p, y: rd.y, w: rd.w } : null;
}

function bridge({ p, y, w }, ox, oz) {
  const kit = new Kit(), n = p.length / 2;
  const run = [0];
  for (let k = 1; k < n; k++) run.push(run[k - 1] + Math.hypot(p[2 * k] - p[2 * k - 2], p[2 * k + 1] - p[2 * k - 1]));
  const T = run[n - 1];
  // where the deck is s metres along it: the point, its height, and the way it runs
  const at = s => {
    let k = 0;
    while (k < n - 2 && run[k + 1] < s) k++;
    const f = Math.max(0, Math.min(1, (s - run[k]) / (run[k + 1] - run[k] || 1)));
    const ax = p[2 * k], az = p[2 * k + 1], bx = p[2 * k + 2], bz = p[2 * k + 3], L = Math.hypot(bx - ax, bz - az) || 1;
    return { x: ax + (bx - ax) * f - ox, z: az + (bz - az) * f - oz, y: y[k] + (y[k + 1] - y[k]) * f, tx: (bx - ax) / L, tz: (bz - az) / L };
  };
  // a beam from a to b ({x, y, z}), `h` high and `d` deep across
  const beam = (a, b, h, d, hex) => {
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, L = Math.hypot(dx, dz);
    kit.box(Math.hypot(L, dy) + 0.04, h, d, hex, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, 0, -Math.atan2(dz, dx), Math.atan2(dy, L));
  };
  // a point off the deck's middle line, `off` metres to its left, `up` over the deck
  const off = (q, o, up = 0) => ({ x: q.x + q.tz * o, y: q.y + up, z: q.z - q.tx * o });
  const top = s => RISE * Math.sin((Math.PI * Math.max(0, Math.min(T, s))) / T);
  const STEP = 3;
  for (let s = 0; s < T - 0.01; s += STEP) {
    const a = at(s), b = at(Math.min(T, s + STEP));
    // the edges, cladding the map's parapets in blue steel, a handrail over them, and the underside
    for (const side of [1, -1]) {
      beam(off(a, (side * w) / 2, -0.1), off(b, (side * w) / 2, -0.1), 2.1, 0.24, BLUE);
      beam(off(a, (side * w) / 2, 1.2), off(b, (side * w) / 2, 1.2), 0.07, 0.07, PALE);
    }
    beam(off(a, 0, -1.12), off(b, 0, -1.12), 0.12, w + 0.3, BLUE);
    // the girder's top chord, curving up over the deck
    const o = SIDE * (w / 2 + 0.55);
    beam(off(a, o, top(s)), off(b, o, top(s + STEP)), 0.5, 1.1, BLUE);
    beam(off(a, o, -0.2), off(b, o, -0.2), 1.2, 1.1, BLUE);
  }
  // the railing's posts, every 1.5 m
  for (let s = 0.75; s < T; s += 1.5) {
    const q = at(s);
    for (const side of [1, -1]) {
      const b = off(q, (side * w) / 2, 0.9);
      kit.box(0.06, 0.32, 0.06, PALE, b.x, b.y + 0.15, b.z);
    }
  }
  // the girder's web: ribs leaning along the bridge from its bottom chord up to the top chord, the
  // openings between them long and slanting
  for (let s = RIB; s < T - RIB; s += RIB) {
    const q = at(s), h = top(s + 0.6) - 0.1;
    if (h < 0.7) continue;
    const lean = 0.45, o = SIDE * (w / 2 + 0.55);
    const a = off(q, o, 0.4), len = Math.hypot(h - 0.4, (h - 0.4) * Math.tan(lean));
    const dx = q.tx * (h - 0.4) * Math.tan(lean), dz = q.tz * (h - 0.4) * Math.tan(lean);
    kit.box(0.28, len, 1.0, BLUE, a.x + dx / 2, a.y + (h - 0.4) / 2, a.z + dz / 2, 0, -Math.atan2(q.tz, q.tx), -lean);
  }
  return kit.mesh(kitMat(0.45, 0.35));
}

const D = deck();
const [X, Z] = D ? [(D.p[0] + D.p.at(-2)) / 2, (D.p[1] + D.p.at(-1)) / 2] : [0, 0];

export const VANDEWIELEBRUG = D ? [{ id: 'annie-vande-wielebrug', name: 'Annie Vande Wielebrug', x: X, z: Z, turn: 0, size: 0.2, foot: [], reach: 120, make: () => bridge(D, X, Z) }] : [];
