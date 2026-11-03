// The raised pavements of a Roman town (THEME.raised: how high, in metres): in Pompeii the streets
// lie a step below their pavements, a step as high as a knee, so that the rainwater and what the
// town threw out ran down the street and not into the houses. A pavement is edged along the street
// with long kerbstones of dark basalt and topped with grit; it stops where another street comes in,
// with a face across its end, and the street goes on between, at the street's own level.
//
// The map's Roman streets are pedestrian streets in OpenStreetMap (they are footpaths for the
// visitors now): the named ones, a Via or a Vicolo, as wide as a street. Each gets its carriageway in
// the middle and a pavement sidewalkWidth(w) wide either side. The race route draws its own, with
// its own street (js/track.js, raisedPavements), so here they keep out of it.
import * as THREE from 'three';
import { kerbTexture, KERB_TILE } from './track.js';
import { inPolygon } from './collide.js';

const WIDE = 5; // a pedestrian street at least as wide as this is a street with pavements
const KERB = 0.36; // how wide a kerbstone's top is
const STEP = 1; // metres between the samples along a street
const ON = 5; // how far a street's carriageway reaches on past its end, into the street it meets

// Which of the map's roads are Roman streets: their names, and how wide they are.
export function sidewalkStreet(map) {
  return rd => rd.foot && rd.w >= WIDE && !rd.y && !rd.br && /^(Via|Vicolo) /.test(map.names[rd.n] ?? '');
}

// How wide the pavements of a street w wide are: in Pompeii a little over a fifth of the street each.
export const sidewalkWidth = w => Math.min(1.8, w * 0.22);

// The pavements along the Roman streets of the map, added to group. track: { distTo, hw } of the
// race routes, pav their pavements' width. Returns the ledges to step up onto (js/relief.js).
export function raisedSidewalks(group, map, H, track, pav, pavement) {
  const roman = sidewalkStreet(map);
  const streets = map.roads.filter(roman);
  if (!streets.length) return [];

  // what a pavement keeps out of: the other streets' carriageways (a Roman street's run on a little
  // past its end, across the pavement of the street it meets), the car streets, the race route's
  // street and the big squares
  const segs = [], CELL = 16, grid = new Map(), key = (i, j) => i * 65536 + j;
  const addSeg = (ax, az, bx, bz, half, rd) => {
    const s = { ax, az, bx, bz, half, rd };
    for (let i = Math.floor((Math.min(ax, bx) - half) / CELL); i <= Math.floor((Math.max(ax, bx) + half) / CELL); i++) {
      for (let j = Math.floor((Math.min(az, bz) - half) / CELL); j <= Math.floor((Math.max(az, bz) + half) / CELL); j++) {
        if (!grid.has(key(i, j))) grid.set(key(i, j), []);
        grid.get(key(i, j)).push(s);
      }
    }
    segs.push(s);
  };
  for (const rd of map.roads) {
    const p = rd.p, n = p.length / 2;
    if (n < 2) continue;
    const isRoman = roman(rd);
    if (rd.foot && !isRoman) continue;
    const half = isRoman ? rd.w / 2 - sidewalkWidth(rd.w) : rd.w / 2 + 1.3;
    for (let k = 0; k + 3 < p.length; k += 2) addSeg(p[k], p[k + 1], p[k + 2], p[k + 3], half, rd);
    if (!isRoman) continue;
    for (const [e, f] of [[0, 1], [n - 1, n - 2]]) { // on past each end
      const dx = p[2 * e] - p[2 * f], dz = p[2 * e + 1] - p[2 * f + 1], L = Math.hypot(dx, dz);
      if (L > 0.01) addSeg(p[2 * e], p[2 * e + 1], p[2 * e] + (dx / L) * ON, p[2 * e + 1] + (dz / L) * ON, half, rd);
    }
  }
  // the pieces of the same street running on from one another: they do not cut each other's pavements
  const ends = rd => { const p = rd.p, n = p.length / 2; return [[p[0], p[1], p[2] - p[0], p[3] - p[1]], [p[2 * n - 2], p[2 * n - 1], p[2 * n - 4] - p[2 * n - 2], p[2 * n - 3] - p[2 * n - 1]]]; };
  const runsOn = (a, b) => ends(a).some(([ax, az, adx, adz]) => ends(b).some(([bx, bz, bdx, bdz]) => {
    if (Math.hypot(ax - bx, az - bz) > 0.6) return false;
    const c = (adx * bdx + adz * bdz) / (Math.hypot(adx, adz) * Math.hypot(bdx, bdz) || 1);
    return c < -0.8; // the two run away from the shared point in opposite directions: straight on
  }));
  const squares = map.areas.filter(a => a.k === 'paved' && area(a.p) > 600).map(a => a.p);
  const routeEdge = track.hw + pav + 0.1;
  const blocked = (x, z, rd) => {
    if (track.distTo(x, z) < routeEdge) return true;
    for (const s of grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL))) ?? []) {
      if (s.rd === rd) continue;
      const dx = s.bx - s.ax, dz = s.bz - s.az, L = dx * dx + dz * dz || 1e-9;
      const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / L));
      if (Math.hypot(x - s.ax - t * dx, z - s.az - t * dz) < s.half + 0.15 && !runsOn(rd, s.rd)) return true;
    }
    return squares.some(p => inPolygon(x, z, p));
  };

  const tops = [], kerbTops = [], faces = [], ledges = [];
  const quad = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d); // corners [x, y, z, u, v]
  for (const rd of streets) {
    const pts = resample(rd.p, STEP), P = sidewalkWidth(rd.w), m = pts.length;
    if (m < 2) continue;
    for (const side of [1, -1]) {
      const inner = side * (rd.w / 2 - P), outer = side * (rd.w / 2), mid = side * (rd.w / 2 - P / 2);
      const at = (j, off) => [pts[j].x + pts[j].nx * off, pts[j].z + pts[j].nz * off];
      const keep = [];
      for (let j = 0; j + 1 < m; j++) {
        const c = { x: (pts[j].x + pts[j + 1].x) / 2, z: (pts[j].z + pts[j + 1].z) / 2, nx: (pts[j].nx + pts[j + 1].nx) / 2, nz: (pts[j].nz + pts[j + 1].nz) / 2 };
        keep.push(![inner, mid, outer].some(off => blocked(c.x + c.nx * off, c.z + c.nz * off, rd)));
      }
      // a piece of pavement shorter than 2 m is left out: a stub between two side streets
      for (let j = 0; j < keep.length;) {
        if (!keep[j]) { j++; continue; }
        let e = j;
        while (e < keep.length && keep[e]) e++;
        if (e - j < 2 * STEP) for (let k = j; k < e; k++) keep[k] = false;
        j = e;
      }
      for (let j = 0; j < keep.length; j++) {
        if (!keep[j]) continue;
        const u0 = pts[j].s / KERB_TILE, u1 = pts[j + 1].s / KERB_TILE;
        const [ix0, iz0] = at(j, inner), [ix1, iz1] = at(j + 1, inner);
        const [kx0, kz0] = at(j, inner + side * KERB), [kx1, kz1] = at(j + 1, inner + side * KERB);
        const [ox0, oz0] = at(j, outer), [ox1, oz1] = at(j + 1, outer);
        quad(kerbTops, [ix0, H + 0.004, iz0, u0, 0], [ix1, H + 0.004, iz1, u1, 0], [kx1, H + 0.004, kz1, u1, 1], [kx0, H + 0.004, kz0, u0, 1]);
        quad(tops, [kx0, H, kz0, kx0 / 3, kz0 / 3], [kx1, H, kz1, kx1 / 3, kz1 / 3], [ox1, H, oz1, ox1 / 3, oz1 / 3], [ox0, H, oz0, ox0 / 3, oz0 / 3]);
        for (const [x0, z0, x1, z1] of [[ix0, iz0, ix1, iz1], [ox0, oz0, ox1, oz1]]) quad(faces, [x0, -0.05, z0, u0, 0], [x1, -0.05, z1, u1, 0], [x1, H, z1, u1, H], [x0, H, z0, u0, H]);
        // across its ends
        for (const [end, k] of [[j, j - 1], [j + 1, j + 1]]) {
          if (k >= 0 && k < keep.length && keep[k]) continue;
          const [ax, az] = at(end, inner), [bx, bz] = at(end, outer);
          quad(faces, [ax, -0.05, az, 0, 0], [bx, -0.05, bz, P / KERB_TILE, 0], [bx, H, bz, P / KERB_TILE, H], [ax, H, az, 0, H]);
        }
      }
      // the ledges: each run of pavement in pieces of 3 m, drawn in by half the pavement's width at
      // its ends (a ledge reaches that far round its ends, js/relief.js)
      const lerp = (t, off) => { const j = Math.min(m - 2, Math.floor(t)), f = t - j, [ax, az] = at(j, off), [bx, bz] = at(j + 1, off); return [ax + (bx - ax) * f, az + (bz - az) * f]; };
      for (let j = 0; j < keep.length;) {
        if (!keep[j]) { j++; continue; }
        let e = j;
        while (e < keep.length && keep[e]) e++;
        const a = j + P / 2 / STEP, b = e - P / 2 / STEP;
        for (let t = a; t < b; t += 3) {
          const [ax, az] = lerp(t, mid), [bx, bz] = lerp(Math.min(b, t + 3), mid);
          ledges.push([ax, az, bx, bz, H, H, P / 2]);
        }
        j = e;
      }
    }
  }
  const kerbMat = new THREE.MeshStandardMaterial({ map: kerbTexture(), roughness: 0.85, side: THREE.DoubleSide });
  add(group, tops, pavement, false);
  add(group, kerbTops, kerbMat, false);
  add(group, faces, kerbMat, true);
  return ledges;
}

// A street's points every `step` metres, each with the way to its left (mitred at the bends) and how
// far along it lies.
function resample(p, step) {
  const out = [];
  let s = 0;
  for (let k = 0; k + 3 < p.length; k += 2) {
    const ax = p[k], az = p[k + 1], dx = p[k + 2] - ax, dz = p[k + 3] - az, L = Math.hypot(dx, dz);
    if (L < 0.01) continue;
    const n = Math.max(1, Math.round(L / step));
    for (let i = out.length ? 1 : 0; i <= n; i++) out.push({ x: ax + (dx * i) / n, z: az + (dz * i) / n, s: s + (L * i) / n, tx: dx / L, tz: dz / L });
    s += L;
  }
  // at a bend the two segments' directions are averaged, and the offset made longer to keep the width
  for (let j = 0; j < out.length; j++) {
    const a = out[Math.max(0, j - 1)], b = out[Math.min(out.length - 1, j + 1)], c = out[j];
    let tx = a.tx + b.tx + c.tx, tz = a.tz + b.tz + c.tz;
    const L = Math.hypot(tx, tz) || 1;
    tx /= L; tz /= L;
    const miter = 1 / Math.max(0.6, tx * c.tx + tz * c.tz);
    c.nx = -tz * miter; c.nz = tx * miter;
  }
  return out;
}

function area(p) {
  let a = 0;
  for (let k = 0; k < p.length; k += 2) {
    const j = (k + 2) % p.length;
    a += p[k] * p[j + 1] - p[j] * p[k + 1];
  }
  return Math.abs(a / 2);
}

// One mesh of triangles from [x, y, z, u, v] corners, flat-shaded.
function add(group, list, material, shadow) {
  if (!list.length) return;
  const n = list.length / 5, pos = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    pos.set(list.slice(i * 5, i * 5 + 3), i * 3);
    uv.set(list.slice(i * 5 + 3, i * 5 + 5), i * 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  // tops facing up, whichever way round their corners came
  for (let i = 0; i < n; i += 3) {
    const [ax, ay, az, bx, by, bz, cx, cy, cz] = pos.slice(i * 3, i * 3 + 9);
    if (ay === by && by === cy && (bz - az) * (cx - ax) - (bx - ax) * (cz - az) < 0) {
      pos.set([cx, cy, cz, bx, by, bz], i * 3 + 3);
      const u = uv.slice(i * 2 + 2, i * 2 + 6);
      uv.set([u[2], u[3], u[0], u[1]], i * 2 + 2);
    }
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  mesh.castShadow = shadow;
  mesh.userData.still = true; // it never changes, so js/tiles.js may cut it up
  group.add(mesh);
}
