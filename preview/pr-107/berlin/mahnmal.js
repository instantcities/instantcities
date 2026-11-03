// The Memorial to the Murdered Jews of Europe (Eisenman, 2005), in place of the map's slabs of it,
// which it put up as little houses of two and three storeys with windows and roofs: the field of
// concrete stelae, each on the map's own outline of it (0.95 m by 2.38 m, in game metres the real
// ones times 1.25), in their rows with the narrow ways between them.
//   the stelae of dark grey concrete, each a little different in tone and a little out of plumb,
//     low at the edges of the field (a step high) and rising towards its middle to 4.7 m, in slow
//     waves, as the real ones do over the ground that sinks under them (the game's ground is flat)
// Riders walk in between them along the ways, as before; the stelae stop them.
import { Kit, kitMat } from '../core/js/kit.js';
import { rng, shade } from '../core/js/facades.js';
import { MAP } from './map.js';
import { mid } from './outline.js';

const X = -574, Z = 132;
const area = p => { let a = 0; for (let i = 0; i < p.length; i += 2) { const j = (i + 2) % p.length; a += p[i] * p[j + 1] - p[j] * p[i + 1]; } return Math.abs(a / 2); };
// the stelae: the map's little blocks round the field (a few drawn with a corner or two more)
const STELAE = MAP.buildings.filter(b => b.k === 'yes' && b.p.length <= 12 && area(b.p) < 7 && Math.hypot(mid(b.p)[0] - X, mid(b.p)[1] - Z) < 170).map(b => b.p);

// the field's outline, the hull round all their corners, to measure how far in each stele stands
function hull(pts) {
  pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of pts) { while (lo.length >= 2 && cross(lo.at(-2), lo.at(-1), q) <= 0) lo.pop(); lo.push(q); }
  for (const q of pts.slice().reverse()) { while (up.length >= 2 && cross(up.at(-2), up.at(-1), q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function edgeDistance(x, z, ring) {
  let d = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % ring.length], dx = bx - ax, dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    d = Math.min(d, Math.hypot(x - ax - t * dx, z - az - t * dz));
  }
  return d;
}

export function mahnmal() {
  const kit = new Kit(), field = hull(STELAE.flatMap(p => [[p[0], p[1]], [p[2], p[3]], [p[4], p[5]], [p[6], p[7]]]));
  for (const [i, p] of STELAE.entries()) {
    const [x, z] = mid(p), r = rng(i * 7919 + 13);
    r(); r();
    // its long side and its short one, from its outline
    const a = Math.hypot(p[2] - p[0], p[3] - p[1]), b = Math.hypot(p[4] - p[2], p[5] - p[3]);
    const [lx, lz] = a >= b ? [p[2] - p[0], p[3] - p[1]] : [p[4] - p[2], p[5] - p[3]];
    const len = Math.max(a, b), wid = Math.min(a, b);
    // how high: low at the edge, up to 5.9 m (4.7 real) inside, in slow waves
    const inward = Math.min(1, edgeDistance(x, z, field) / 42), ease = inward * inward * (3 - 2 * inward);
    const wave = 0.78 + 0.22 * Math.sin((x - X) * 0.075 + 1.3) * Math.cos((z - Z) * 0.06 - 0.4);
    const h = Math.max(0.25, 0.25 + 5.65 * ease * wave + (r() - 0.5) * 0.5 * ease);
    const tilt = (r() - 0.5) * 0.035 * ease, lean = (r() - 0.5) * 0.035 * ease;
    kit.box(len, h, wid, shade('#7d7e7a', (r() - 0.5) * 0.16), x - X, h / 2, z - Z, lean, Math.atan2(-lz, lx), tilt);
  }
  return kit.mesh(kitMat(0.95));
}

export const MAHNMAL = STELAE.length ? [{
  id: 'holocaust-mahnmal', name: 'Denkmal für die ermordeten Juden Europas', x: X, z: Z, reach: 260,
  area: STELAE, foot: STELAE, make: mahnmal,
}] : [];
