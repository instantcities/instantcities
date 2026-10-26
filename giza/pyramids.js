// The three great pyramids of Giza and the three queens' pyramids beside the biggest, modelled by
// hand from their measurements, in real metres and scaled to game metres (1.25) at the end, each on
// its square base lined up north and south:
//   Khufu (the Great Pyramid, about 2560 BC): 230 m a side, 138.5 m high now (146.6 m once), in about
//     210 courses of limestone, the smooth casing long gone except at the foot, the top missing
//   Khafre: 215 m a side, 136.4 m high, standing on higher ground so it looks the taller; the smooth
//     casing is still on the top 40 m, and a course of granite round its foot
//   Menkaure: 102 m a side, 65 m high, the lowest 16 courses faced in red granite, the rest rough
//   the queens' pyramids: three small ones east of Khufu's, 46 m a side, broken off at about 20 m
// Riders bump into the pyramids' feet.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';
import { S, game } from './frame.js';
import { MAP } from './map.js';

const STONE = ['#c6ad7c', '#bfa675', '#cdb585', '#b89f6e', '#c9b27f', '#bba377'], CASING = '#e2dabf', GRANITE = '#85584a';

// a stepped pyramid: `courses` slices from the base half-width a to the top half-width t, each a
// little shaken so the edges are not ruler-straight
function pyramid(kit, { base, top, height, courses, seed, tint = 0, casingFrom = 2, granite = 0 }) {
  const r = rng(seed * 11 + 5), hStep = height / courses;
  for (let k = 0; k < courses; k++) {
    const t0 = k / courses, t1 = (k + 1) / courses, w0 = base + (top - base) * t0, w1 = base + (top - base) * t1;
    const smooth = t0 >= casingFrom ? true : false;
    let hex = STONE[Math.floor(r() * STONE.length) % STONE.length];
    if (k < granite) hex = GRANITE;
    else if (smooth) hex = CASING;
    hex = shade(hex, tint + (r() - 0.5) * 0.08);
    // a course is a frustum, a little stepped out at its foot so the faces show their courses
    const step = smooth ? 0 : 0.18 + 0.14 * r();
    kit.frustum(w0 + step, w0 + step, w1 + step * 0.4, w1 + step * 0.4, hStep * 0.98, hex, 0, k * hStep, 0);
  }
}

// each pyramid is a monument of its own, so only the ones in sight are built
// the middle of the map's outline of it, where there is one near (lat, lon), else the point itself
const pairs = p => Array.from({ length: p.length / 2 }, (_, i) => [p[2 * i], p[2 * i + 1]]);
const middle = (lat, lon, base) => {
  const g = game(lat, lon);
  let best = null, bd = 80;
  for (const b of MAP.buildings) {
    const q = pairs(b.p), xs = q.map(v => v[0]), zs = q.map(v => v[1]), w = Math.max(...xs) - Math.min(...xs);
    if (Math.abs(w - base * S) > base * S * 0.25) continue;
    const c = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2], d = Math.hypot(c[0] - g[0], c[1] - g[1]);
    if (d < bd) { bd = d; best = c; }
  }
  return best ?? g;
};
const mk = (id, name, lat, lon, spec, at) => {
  const [x, z] = at ?? middle(lat, lon, spec.base), half = (spec.base / 2) * S;
  return {
    id, name, x, z, turn: 0, reach: 1800, far: 14, loom: 1.2,
    area: [onMap(x, z, 0, rect(-half - 20, -half - 20, half + 20, half + 20))],
    foot: [onMap(x, z, 0, rect(-half, -half, half, half))],
    make: () => { const kit = new Kit(); pyramid(kit, spec); const m = kit.mesh(kitMat(0.96)); m.scale.setScalar(S); return m; },
  };
};

export const PYRAMIDS = [
  mk('khufu', 'The Great Pyramid', 29.97917, 31.13417, { base: 230.3, top: 6, height: 138.5, courses: 110, seed: 1, casingFrom: 2 }),
  mk('khafre', 'Pyramid of Khafre', 29.97611, 31.13083, { base: 215.3, top: 8, height: 136.4, courses: 100, seed: 2, casingFrom: 0.7 }),
  mk('menkaure', 'Pyramid of Menkaure', 29.97194, 31.12833, { base: 102.2, top: 4, height: 65, courses: 60, seed: 3, casingFrom: 2, granite: 16 }),
  // the queens' pyramids stand in a row north to south, where the map has them
  ...[0, 1, 2].map(q => mk(`queen-${q + 1}`, `Queen's pyramid ${q + 1}`, 0, 0, { base: 46, top: 12, height: 20 + q * 2, courses: 24, seed: 10 + q, casingFrom: 2 }, [434.7, -341 + 64.5 * q])),
];
