// Carving a statue: its body as a few soft shapes (round cones from joint to joint, ellipsoids)
// melted into one another, as a sculptor's clay would be, then turned into a smooth mesh (a distance
// field, polygonised with surface nets). Far rounder and more alive than the plain cylinders and
// spheres the furniture is made of; each figure is carved once and kept (statues.js uses it).
//
//     carve('venus', () => [cone(a, b, ra, rb), egg(c, [rx, ry, rz]), ...], { step, blend })
//
// gives a geometry in the figure's own metres, feet at y = 0, facing +z; its normals from the field,
// so it shades smoothly. A shape may carry its own blend (k): how softly it melts into the rest.
import * as THREE from 'three';

// a round cone from a to b ([x, y, z]), ra thick at a and rb at b: a limb, a neck, a fold of cloth
export const cone = (a, b, ra, rb = ra, k) => ({ t: 0, a, b, ra, rb, k });
// an ellipsoid at c with radii [rx, ry, rz], turned by ry about the vertical: a head, a breast, a hip
export const egg = (c, r, k, turn = 0, tilt = 0) => ({ t: 1, c, r, k, turn, tilt });
// a box with rounded edges: centre c, half sizes h, rounding r, turned by turn about the vertical
export const slab = (c, h, r = 0.02, k, turn = 0) => ({ t: 2, c, h, r, k, turn });

const CACHE = new Map();

export function carve(key, shapes, { step = 0.02, blend = 0.04 } = {}) {
  if (CACHE.has(key)) return CACHE.get(key);
  const S = (typeof shapes === 'function' ? shapes() : shapes).map(prep);
  // the box round it all
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const s of S) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], s.lo[i]); hi[i] = Math.max(hi[i], s.hi[i]); }
  for (let i = 0; i < 3; i++) { lo[i] -= 2 * step + blend; hi[i] += 2 * step + blend; }
  const n = lo.map((v, i) => Math.ceil((hi[i] - v) / step) + 1), [nx, ny, nz] = n;
  const field = new Float32Array(nx * ny * nz), id = (i, j, k) => i + nx * (j + ny * k);
  // block by block, with only the shapes that come near it: a block nothing comes near is all
  // outside; one whose middle lies well clear of the surface is all on that side of it (only the
  // cells the surface passes through need the true distances); the rest point by point
  const B = 4, half = (B / 2) * step, reach = 1.5 * Math.sqrt(3) * half + 2 * step;
  const kMax = Math.max(blend, ...S.map(s => s.k ?? 0)), m = kMax + reach + half;
  for (let K = 0; K < nz; K += B) for (let J = 0; J < ny; J += B) for (let I = 0; I < nx; I += B) {
    const cx = lo[0] + I * step + half, cy = lo[1] + J * step + half, cz = lo[2] + K * step + half;
    const near = S.filter(s => cx > s.lo[0] - m && cy > s.lo[1] - m && cz > s.lo[2] - m && cx < s.hi[0] + m && cy < s.hi[1] + m && cz < s.hi[2] + m);
    const d = near.length ? sdf(near, cx, cy, cz, blend) : 2 * reach, far = Math.abs(d) > reach;
    for (let k = K; k < Math.min(nz, K + B); k++) for (let j = J; j < Math.min(ny, J + B); j++) for (let i = I; i < Math.min(nx, I + B); i++) {
      field[id(i, j, k)] = far ? d : sdf(near, lo[0] + i * step, lo[1] + j * step, lo[2] + k * step, blend);
    }
  }
  const geo = nets(field, n, lo, step);
  CACHE.set(key, geo);
  return geo;
}

// a shape's bounds and the numbers its distance needs
function prep(s) {
  const pad = 0.001;
  if (s.t === 0) {
    const r = Math.max(s.ra, s.rb);
    return { ...s, lo: [0, 1, 2].map(i => Math.min(s.a[i], s.b[i]) - r - pad), hi: [0, 1, 2].map(i => Math.max(s.a[i], s.b[i]) + r + pad) };
  }
  const R = s.t === 1 ? Math.max(...s.r) : Math.hypot(...s.h) + s.r;
  return { ...s, cos: Math.cos(s.turn ?? 0), sin: Math.sin(s.turn ?? 0), ct: Math.cos(s.tilt ?? 0), st: Math.sin(s.tilt ?? 0), lo: s.c.map(v => v - R - pad), hi: s.c.map(v => v + R + pad) };
}

// the distance to the figure: its shapes melted together (a polynomial smooth minimum)
function sdf(S, x, y, z, blend) {
  let d = 1e9;
  for (const s of S) {
    const k = s.k ?? blend;
    // far outside a shape's box it cannot change the result
    if (x < s.lo[0] - k || y < s.lo[1] - k || z < s.lo[2] - k || x > s.hi[0] + k || y > s.hi[1] + k || z > s.hi[2] + k) {
      if (d < 1e8) continue;
    }
    const e = s.t === 0 ? roundCone(s, x, y, z) : s.t === 1 ? ellipsoid(s, x, y, z) : roundBox(s, x, y, z);
    if (d > 1e8) { d = e; continue; }
    const h = Math.max(k - Math.abs(d - e), 0) / k;
    d = Math.min(d, e) - h * h * k * 0.25;
  }
  return d;
}

function roundCone(s, x, y, z) {
  const [ax, ay, az] = s.a, [bx, by, bz] = s.b;
  const ex = bx - ax, ey = by - ay, ez = bz - az, L2 = ex * ex + ey * ey + ez * ez || 1e-9;
  const t = Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey + (z - az) * ez) / L2));
  return Math.hypot(ax + ex * t - x, ay + ey * t - y, az + ez * t - z) - (s.ra + (s.rb - s.ra) * t);
}

function local(s, x, y, z) {
  // into the shape's own frame: turned about y, then tipped about x
  let dx = x - s.c[0], dy = y - s.c[1], dz = z - s.c[2];
  const lx = dx * s.cos - dz * s.sin, lz = dx * s.sin + dz * s.cos;
  return [lx, dy * s.ct - lz * s.st, dy * s.st + lz * s.ct];
}

function ellipsoid(s, x, y, z) {
  const [px, py, pz] = local(s, x, y, z), [a, b, c] = s.r;
  const k0 = Math.hypot(px / a, py / b, pz / c), k1 = Math.hypot(px / (a * a), py / (b * b), pz / (c * c));
  return k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(a, b, c);
}

function roundBox(s, x, y, z) {
  const p = local(s, x, y, z), q = p.map((v, i) => Math.abs(v) - s.h[i]);
  return Math.hypot(...q.map(v => Math.max(v, 0))) + Math.min(Math.max(...q), 0) - s.r;
}

// Surface nets: a vertex in every cell the surface passes through (where the corners' signs
// differ, at the mean of where it crosses the cell's edges), and a quad across every edge it cuts.
function nets(F, [nx, ny, nz], lo, h) {
  const at = (i, j, k) => F[i + nx * (j + ny * k)];
  const vid = new Int32Array(nx * ny * nz).fill(-1), pos = [], nor = [], idx = [];
  const CORNERS = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const v = new Float64Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let neg = 0;
    for (let c = 0; c < 8; c++) { const C = CORNERS[c]; v[c] = at(i + C[0], j + C[1], k + C[2]); if (v[c] < 0) neg++; }
    if (neg === 0 || neg === 8) continue;
    let sx = 0, sy = 0, sz = 0, m = 0;
    for (const [p, q] of EDGES) {
      if ((v[p] < 0) === (v[q] < 0)) continue;
      const t = v[p] / (v[p] - v[q]), A = CORNERS[p], B = CORNERS[q];
      sx += A[0] + (B[0] - A[0]) * t; sy += A[1] + (B[1] - A[1]) * t; sz += A[2] + (B[2] - A[2]) * t; m++;
    }
    const x = lo[0] + (i + sx / m) * h, y = lo[1] + (j + sy / m) * h, z = lo[2] + (k + sz / m) * h;
    vid[i + nx * (j + ny * k)] = pos.length / 3;
    pos.push(x, y, z);
    // its normal: the way the field rises across the cell
    const gx = v[1] - v[0] + v[3] - v[2] + v[5] - v[4] + v[7] - v[6], gy = v[2] - v[0] + v[3] - v[1] + v[6] - v[4] + v[7] - v[5], gz = v[4] - v[0] + v[5] - v[1] + v[6] - v[2] + v[7] - v[3], gl = Math.hypot(gx, gy, gz) || 1;
    nor.push(gx / gl, gy / gl, gz / gl);
  }
  // the quads: each edge of the grid the surface cuts joins the four cells round it
  const cell = (i, j, k) => vid[i + nx * (j + ny * k)];
  const quad = (a, b, c, d, flip) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d);
  };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const v0 = at(i, j, k), inside = v0 < 0;
    if (inside !== (at(i + 1, j, k) < 0)) quad(cell(i, j - 1, k - 1), cell(i, j, k - 1), cell(i, j, k), cell(i, j - 1, k), !inside);
    if (inside !== (at(i, j + 1, k) < 0)) quad(cell(i - 1, j, k - 1), cell(i - 1, j, k), cell(i, j, k), cell(i, j, k - 1), !inside);
    if (inside !== (at(i, j, k + 1) < 0)) quad(cell(i - 1, j - 1, k), cell(i, j - 1, k), cell(i, j, k), cell(i - 1, j, k), !inside);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}
