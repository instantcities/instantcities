// Paths that run down under a bridge where the map has them crossing it level. OpenStreetMap marks
// both as bridges but gives no heights, so the map lays the two decks at the same height and the
// path's railings cut across the street. Here the path goes down into a trench instead (a hollow,
// core/js/hollows.js): level with the street at its ends, sloping down to `down` metres under it,
// flat for `flat` metres either side of the bridge, walls either side with a railing on top. The
// bridge's own deck stays where it was, over it. Hand-written, game metres.
//   path: a point on the path (the bridge of a path nearest it), under: the street it passes under,
//   down: how far under the street it goes, flat: how far either side of the crossing it stays
//   down, ramp: how far it then takes to climb back up, half: half the trench's width.
import { lineHollow } from '../core/js/hollows.js';

const UNDERPASSES = [
  // the fietsbrug along the Coupure Links, down by the water under the Papegaaibrug (the
  // Papegaaistraat over the Coupure), so the bikes along the canal need not cross the junction
  { id: 'papegaaibrug', path: [-1170, 387.6], under: 'Papegaaistraat', down: 3, flat: 11, ramp: 26, half: 2.3 },
];
const CELL = 0.5;

const ease = t => t * t * (3 - 2 * t);
// where on segment a-b point (x, z) comes nearest: [distance, t]
const near = (x, z, ax, az, bx, bz) => {
  const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
  return [Math.hypot(x - ax - t * dx, z - az - t * dz), t];
};
// where segments a-b and c-d cross, as t along a-b, or null
const cross = (ax, az, bx, bz, cx, cz, dx, dz) => {
  const den = (bx - ax) * (dz - cz) - (bz - az) * (dx - cx);
  if (Math.abs(den) < 1e-9) return null;
  const t = ((cx - ax) * (dz - cz) - (cz - az) * (dx - cx)) / den, u = ((cx - ax) * (bz - az) - (cz - az) * (bx - ax)) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : null;
};

// The map's roads with each underpass's path taken off its deck (it is no bridge any more: it lies
// in the trench, and core/js/hollows.js lowers it into it), and the trenches as hollows.
export function withUnderpasses(roads, names) {
  const out = [...roads], hollows = [];
  for (const u of UNDERPASSES) {
    // the path: the footway bridge nearest the given point
    let pi = -1, best = Infinity;
    out.forEach((rd, i) => {
      if (!rd.foot || !rd.br) return;
      for (let k = 0; k + 3 < rd.p.length; k += 2) {
        const [d] = near(...u.path, ...rd.p.slice(k, k + 4));
        if (d < best) { best = d; pi = i; }
      }
    });
    if (pi < 0 || best > 5) continue;
    const p = out[pi].p, at = [0]; // how far along the path each of its points lies
    for (let k = 2; k < p.length; k += 2) at.push(at[at.length - 1] + Math.hypot(p[k] - p[k - 2], p[k + 1] - p[k - 1]));
    // where it passes under the street: the middle of the stretch it crosses the street's bridge
    const hits = [];
    for (const rd of out) {
      if (!rd.br || rd.foot || names[rd.n] !== u.under) continue;
      for (let k = 0; k + 3 < p.length; k += 2) {
        for (let m = 0; m + 3 < rd.p.length; m += 2) {
          const t = cross(...p.slice(k, k + 4), ...rd.p.slice(m, m + 4));
          if (t !== null) hits.push(at[k / 2] + t * (at[k / 2 + 1] - at[k / 2]));
        }
      }
    }
    if (!hits.length) continue;
    const mid = hits.reduce((a, b) => a + b, 0) / hits.length, reach = u.flat + u.ramp;
    const depth = s => -u.down * ease(Math.max(0, Math.min(1, (reach - Math.abs(s - mid)) / u.ramp)));
    // the trench: under the path the depth of the nearest point of it, 0 beside it
    const hollow = lineHollow({ id: u.id, name: u.under, p, s0: mid - reach, s1: mid + reach, reach: u.half, cell: CELL, depth: depth });
    // the railings along the trench's edges, where it is deep enough for a wall, a line each side
    const rails = [1, -1].map(side => {
      const line = [];
      for (let k = 0; k < p.length; k += 2) {
        if (depth(at[k / 2]) > -0.6) continue;
        const a = Math.max(0, k - 2), b = Math.min(p.length - 2, k + 2), L = Math.hypot(p[b] - p[a], p[b + 1] - p[a + 1]) || 1;
        line.push(p[k] - ((p[b + 1] - p[a + 1]) / L) * side * (u.half + 0.1), p[k + 1] + ((p[b] - p[a]) / L) * side * (u.half + 0.1));
      }
      return line;
    });
    hollows.push({ ...hollow, rails });
    const { br, y, ...path } = out[pi];
    out[pi] = path;
  }
  return { roads: out, hollows };
}
