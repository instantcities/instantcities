// Quays that lie lower than the street beside them, down nearer the water, which the map has
// level with it: a lane along the water with the street up on the other side of a low wall. Each is
// a hollow (core/js/hollows.js) along the lane, from the street's kerb to the water's edge, `down`
// metres under the street and climbing back up over `ramp` metres at either end of it. Hand-written,
// game metres.
//   lane: a point on the lane along the water (the street nearest it), street: the street up
//   beside it, which stays where it is, down: how far under the street the quay lies, ramp: how
//   far it takes at either end to come up level with the street.
// Or, where the map has no lane of its own but one street from the houses to the water (the
// Graslei), the strip between that street and the water goes down:
//   edge: a point on the street, from, to: points along it where the low strip begins and ends,
//   band: how wide the low strip is, from the water's edge, step: how far it takes to come down to
//   it from the street (a slope rather than a wall), down, ramp. The street itself stays up.
import { lineHollow } from '../core/js/hollows.js';
import { WATER } from '../core/js/ground.js';

const QUAYS = [
  // the cobbled lane along the Voorhoutkaai, down by the Handelsdok, from the Spanjaardstraat to
  // the Schoolkaai at Portus Ganda
  { id: 'voorhoutkaai', lane: [1008, -10], street: 'Voorhoutkaai', down: 0.7, ramp: 14 },
  // the Graslei's lower quay, along the Leie from the Sint-Michielsbrug to the Grasbrug: a step
  // down from the street to the cobbles by the water, where people sit with their legs over the
  // edge (about a metre down, halfway to the water)
  { id: 'graslei-laag', edge: [-262, -190], street: 'Graslei', from: [-262.5, -110], to: [-230, -270], band: 4, step: 2.5, down: 1.2, ramp: 6 },
];
const UNDER = -WATER + 0.15; // out over the water the hollow's ground lies just under its surface, out of sight

const ease = t => t * t * (3 - 2 * t);
const segDist = (x, z, ax, az, bx, bz) => {
  const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
  return Math.hypot(x - ax - t * dx, z - az - t * dz);
};
const lineDist = (x, z, p) => { let m = Infinity; for (let k = 0; k + 3 < p.length; k += 2) m = Math.min(m, segDist(x, z, p[k], p[k + 1], p[k + 2], p[k + 3])); return m; };
const inside = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
const boxOf = p => { let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity; for (let k = 0; k < p.length; k += 2) { x0 = Math.min(x0, p[k]); x1 = Math.max(x1, p[k]); z0 = Math.min(z0, p[k + 1]); z1 = Math.max(z1, p[k + 1]); } return [x0, z0, x1, z1]; };

// The quays as hollows, on the map's roads, areas and waterways. Each is marked `quay`: the water
// beside it stays (js/hollows.js), and so does its quay wall, down from the quay's own height.
export function lowQuays(map) {
  const hollows = [];
  for (const q of QUAYS) {
    if (q.edge) {
      const h = edgeQuay(map, q);
      if (h) hollows.push(h);
      continue;
    }
    let li = -1, best = Infinity;
    map.roads.forEach((rd, i) => {
      if (rd.foot || rd.br || map.names[rd.n] === q.street) return;
      const d = lineDist(...q.lane, rd.p);
      if (d < best) { best = d; li = i; }
    });
    if (li < 0 || best > 5) continue;
    const lane = map.roads[li], p = lane.p, [bx0, bz0, bx1, bz1] = boxOf(p), reach = lane.w / 2 + 4;
    let total = 0;
    for (let k = 2; k < p.length; k += 2) total += Math.hypot(p[k] - p[k - 2], p[k + 1] - p[k - 1]);
    const near = b => b[2] > bx0 - reach && b[0] < bx1 + reach && b[3] > bz0 - reach && b[1] < bz1 + reach;
    // the street up beside it (its kerbs stay up), and the water
    const street = map.roads.filter(rd => map.names[rd.n] === q.street && near(boxOf(rd.p)));
    const pools = map.areas.filter(a => a.k === 'water' && near(boxOf(a.p))).map(a => ({ p: a.p, box: boxOf(a.p) }));
    const lines = map.water.filter(w => near(boxOf(w.p)));
    const inWater = (x, z) => pools.some(({ p: a, box: b }) => x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3] && inside(x, z, a)) || lines.some(w => lineDist(x, z, w.p) < w.w / 2);
    const wet = (x, z) => (inWater(x, z) ? -UNDER : 0);
    const depth = (s, d, x, z) => {
      if (inWater(x, z)) return -UNDER;
      if (street.some(rd => lineDist(x, z, rd.p) < rd.w / 2 + 1.3 + 0.2)) return 0;
      return -q.down * ease(Math.max(0, Math.min(1, Math.min(s, total - s) / q.ramp)));
    };
    hollows.push(lineHollow({ id: q.id, name: q.street, p, reach, depth, outside: wet, quay: true }));
  }
  return hollows;
}

// The strip between a street and the water, lower than the street: a hollow along the street, on
// its water side only, `band` metres wide from the water's edge (never into the street).
function edgeQuay(map, q) {
  let li = -1, best = Infinity;
  map.roads.forEach((rd, i) => {
    if (rd.foot || rd.br || map.names[rd.n] !== q.street) return;
    const d = lineDist(...q.edge, rd.p);
    if (d < best) { best = d; li = i; }
  });
  if (li < 0 || best > 5) return null;
  const road = map.roads[li], p = road.p, at = [0];
  for (let k = 2; k < p.length; k += 2) at.push(at[at.length - 1] + Math.hypot(p[k] - p[k - 2], p[k + 1] - p[k - 1]));
  // where along the street a point lies, and which side of it (the sign of the cross product)
  const along = (x, z) => {
    let bd = Infinity, bs = 0, side = 0;
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], dx = p[k + 2] - ax, dz = p[k + 3] - az, L = dx * dx + dz * dz || 1e-9;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L)), d = Math.hypot(x - ax - t * dx, z - az - t * dz);
      if (d < bd) { bd = d; bs = at[k / 2] + t * (at[k / 2 + 1] - at[k / 2]); side = Math.sign(dx * (z - az) - dz * (x - ax)); }
    }
    return { s: bs, side };
  };
  const [bx0, bz0, bx1, bz1] = boxOf(p), reach = road.w / 2 + q.band + q.step + 8;
  const near = b => b[2] > bx0 - reach && b[0] < bx1 + reach && b[3] > bz0 - reach && b[1] < bz1 + reach;
  const pools = map.areas.filter(a => a.k === 'water' && near(boxOf(a.p))).map(a => ({ p: a.p, box: boxOf(a.p) }));
  const lines = map.water.filter(w => near(boxOf(w.p)));
  const inWater = (x, z) => pools.some(({ p: a, box: b }) => x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3] && inside(x, z, a)) || lines.some(w => lineDist(x, z, w.p) < w.w / 2);
  // the water's side: that of the nearest water to the street's middle point
  const s0 = along(...q.from).s, s1 = along(...q.to).s, mid = (s0 + s1) / 2;
  let wet = 0;
  for (let k = 0; k + 3 < p.length && !wet; k += 2) {
    if (at[k / 2 + 1] < mid) continue;
    const ax = p[k], az = p[k + 1], dx = p[k + 2] - ax, dz = p[k + 3] - az, L = Math.hypot(dx, dz) || 1;
    // (a point off to the left of the street's way, sd = 1, has a positive cross product)
    for (const sd of [1, -1]) for (let o = road.w / 2; o < reach && !wet; o += 1) if (inWater(ax - (dz / L) * o * sd, az + (dx / L) * o * sd)) wet = sd;
  }
  if (!wet) return null;
  // how far from the water's edge (the river's lines and the pools' outlines)
  // (only the edges near the stretch: the river's outline is long)
  const box = [Infinity, Infinity, -Infinity, -Infinity];
  for (let k = 0; k < p.length; k += 2) {
    if (at[k / 2] < s0 - 20 || at[k / 2] > s1 + 20) continue;
    box[0] = Math.min(box[0], p[k] - reach); box[1] = Math.min(box[1], p[k + 1] - reach);
    box[2] = Math.max(box[2], p[k] + reach); box[3] = Math.max(box[3], p[k + 1] + reach);
  }
  const edges = [], by = (w = 0) => (ax, az, bx, bz) => {
    if (Math.max(ax, bx) + w > box[0] && Math.min(ax, bx) - w < box[2] && Math.max(az, bz) + w > box[1] && Math.min(az, bz) - w < box[3]) edges.push([ax, az, bx, bz, w]);
  };
  for (const w of lines) for (let k = 0; k + 3 < w.p.length; k += 2) by(w.w / 2)(w.p[k], w.p[k + 1], w.p[k + 2], w.p[k + 3]);
  for (const { p: a } of pools) for (let k = 0; k < a.length; k += 2) by()(a[k], a[k + 1], a[(k + 2) % a.length], a[(k + 3) % a.length]);
  const fromWater = (x, z) => {
    let m = Infinity;
    for (const [ax, az, bx, bz, w] of edges) m = Math.min(m, segDist(x, z, ax, az, bx, bz) - w);
    return m;
  };
  // out over the water the ground drops well under it, so the strip's edge comes out a wall down
  // to the water (a slope from the strip to just under the water would show above it)
  const DEEP = -WATER + 1.2;
  const depth = (s, d, x, z) => {
    if (d < road.w / 2 + 0.2 || along(x, z).side !== wet) return 0;
    if (inWater(x, z)) return -DEEP;
    const across = Math.max(0, Math.min(1, (q.band + q.step - fromWater(x, z)) / q.step, (d - road.w / 2 - 0.2) / q.step));
    return -q.down * ease(across) * ease(Math.max(0, Math.min(1, Math.min(s - s0, s1 - s) / q.ramp)));
  };
  // (no railing along its edge, as on the real one: rails, none of its own)
  return lineHollow({ id: q.id, name: q.street, p, s0, s1, reach, per: 100, depth, outside: (x, z) => (inWater(x, z) ? -UNDER : 0), quay: true, rails: [] });
}
