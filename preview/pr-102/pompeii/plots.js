// Where the houses of houses.js stand: each on its own block of the map, given by its streets. A
// plot is the ground between the edges of the street its door is on (front) and of the streets
// either side (left and right) and behind it (back), found where those edges meet. Without a left or
// right street the plot runs `width` metres along the front from where `from` says (metres from the
// left street, or from the street's point nearest `inside` if there is none); without a back street
// it is `depth` deep. `inside`: a point inside the block, to tell which side of each street it lies
// on. All in game metres (the real ones times 1.25).
//
// A plot has its own frame: x along the front from its left corner, z into the block, so a house is
// drawn as if its door were in the south wall. at(x, z) gives the map's metres of a point; turn and
// the left corner are how the house's model is put on the map (js/landmarks.js).
import { MAP } from './map.js';

const segments = name => MAP.roads.filter(rd => MAP.names[rd.n] === name).flatMap(rd => {
  const out = [];
  for (let k = 0; k + 3 < rd.p.length; k += 2) out.push({ ax: rd.p[k], az: rd.p[k + 1], bx: rd.p[k + 2], bz: rd.p[k + 3], half: rd.w / 2 });
  return out;
});

const dist = (s, x, z) => {
  const dx = s.bx - s.ax, dz = s.bz - s.az, L = dx * dx + dz * dz || 1e-9, t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / L));
  return Math.hypot(x - s.ax - t * dx, z - s.az - t * dz);
};

// the edge of a street on the side towards (x, z), from its piece nearest there: a point and a direction
function edge(name, x, z) {
  const segs = segments(name);
  if (!segs.length) throw new Error(`plots.js: no street ${name}`);
  const s = segs.reduce((a, b) => (dist(a, x, z) <= dist(b, x, z) ? a : b));
  const L = Math.hypot(s.bx - s.ax, s.bz - s.az), ux = (s.bx - s.ax) / L, uz = (s.bz - s.az) / L;
  const nx = -uz, nz = ux, side = Math.sign((x - s.ax) * nx + (z - s.az) * nz) || 1;
  return { px: s.ax + nx * side * s.half, pz: s.az + nz * side * s.half, ux, uz };
}

// where two lines meet
function meet(a, b) {
  const det = a.ux * -b.uz - a.uz * -b.ux, dx = b.px - a.px, dz = b.pz - a.pz;
  const t = (dx * -b.uz - dz * -b.ux) / det;
  return [a.px + a.ux * t, a.pz + a.uz * t];
}

export function plot({ front, left, right, back, inside: [ix, iz], from = 0, width, depth }) {
  const F = edge(front, ix, iz);
  // the front's ends: at the side streets, or along it from the point nearest the inside
  const t0 = (ix - F.px) * F.ux + (iz - F.pz) * F.uz, base = [F.px + F.ux * t0, F.pz + F.uz * t0];
  let A = left ? meet(F, edge(left, ix, iz)) : null, B = right ? meet(F, edge(right, ix, iz)) : null;
  // which way along the front is "right": away from the left street, or towards the right one
  let dir = A ? Math.sign((base[0] - A[0]) * F.ux + (base[1] - A[1]) * F.uz) || 1 : B ? Math.sign((B[0] - base[0]) * F.ux + (B[1] - base[1]) * F.uz) || 1 : 1;
  let ux = F.ux * dir, uz = F.uz * dir, vx = -uz, vz = ux;
  // the block on the plot's left: if it lies the other way, the plot is mirrored (x the other way)
  if ((ix - F.px) * vx + (iz - F.pz) * vz < 0) {
    [A, B] = [B, A];
    ux = -ux; uz = -uz; vx = -uz; vz = ux;
  }
  if (!A) A = B ? [B[0] - ux * (width ?? 20), B[1] - uz * (width ?? 20)] : [base[0] - ux * (width ?? 20) / 2, base[1] - uz * (width ?? 20) / 2];
  const full = B ? Math.hypot(B[0] - A[0], B[1] - A[1]) : from + (width ?? 20);
  const x0 = Math.max(0, from), W = Math.min(width ?? full, full - x0);
  const corner = [A[0] + ux * x0, A[1] + uz * x0];
  // how deep: to the back street's edge, at the middle of the plot
  let D = depth;
  if (back) {
    const Bk = edge(back, ix, iz), mid = { px: corner[0] + ux * W / 2, pz: corner[1] + uz * W / 2, ux: vx, uz: vz };
    const m = meet(mid, Bk);
    D = Math.min(depth ?? Infinity, Math.hypot(m[0] - mid.px, m[1] - mid.pz));
  }
  const at = (x, z) => [corner[0] + ux * x + vx * z, corner[1] + uz * x + vz * z];
  return {
    x: corner[0], z: corner[1], W, D, turn: Math.atan2(-uz, ux), at,
    ring: (x0, z0, x1, z1) => [at(x0, z0), at(x1, z0), at(x1, z1), at(x0, z1)].flat().map(v => Math.round(v * 100) / 100),
  };
}
