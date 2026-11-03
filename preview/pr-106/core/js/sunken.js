// Streets sunk below the ground the houses stand on (THEME.sunken: how far, in metres). In Pompeii
// the streets lie a good step lower than the pavements and the houses, so that the rainwater and
// what the town threw out ran down the street and not indoors. Here the ground stays at 0, with the
// houses, and each street is a trench in it: a hole in the ground (the stencil, as for the canals in
// js/scenery.js), a floor of lava blocks D lower, and walls of basalt kerbstones wherever street
// meets ground. Where two streets meet their trenches run into one, with no wall between. The
// pavements are a strip of grit either side, at the ground's level, with the kerbstones' tops along
// the edge.
//
// The streets: the map's Roman streets (pedestrian streets in OpenStreetMap, as they are footpaths
// for the visitors now: the named ones, a Via or a Vicolo, as wide as a street), each with a
// carriageway in the middle and a pavement sidewalkWidth(w) wide either side; and the race routes,
// their carriageway (hw) and pavements (theme.pavement). The race route lies D lower too (its rise,
// js/game/worlds.js), and riders and walkers go down into the streets and up out of them
// (depth, for js/relief.js).
import * as THREE from 'three';
import { kerbTexture, KERB_TILE } from './track.js';
import { onGround, GROUND } from './ground.js';

const WIDE = 5; // a pedestrian street at least as wide as this is a street with pavements
const SIDES = 16; // the corners of the polygon round each joint of a street
const PIECE = 0.25; // the walls are found in pieces this long
const KERB = 0.32; // how wide a kerbstone's top is
const CELL = 8;

// Which of the map's roads are Roman streets: their names, and how wide they are (and not in the
// town of today round the ruins, rd.m).
export function sunkenStreet(map) {
  return rd => rd.foot && rd.w >= WIDE && !rd.y && !rd.br && !rd.m && /^(Via|Vicolo) /.test(map.names[rd.n] ?? '');
}

// How wide the pavements of a street w wide are: in Pompeii a little over a fifth of the street each.
export const sidewalkWidth = w => Math.min(1.8, w * 0.22);

// The ground's materials leave the streets open (the same stencil as the canals' holes).
export const cutStencil = m => Object.assign(m, { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp });

// Builds the sunken streets into ctx.group. tracks: the race routes, pav their pavements' width,
// pavement and lava the materials of the pavements and of the street. Returns depth(x, z): how far
// below the ground the street at (x, z) lies (0 off the streets).
export function sunkenStreets(ctx, map, tracks, D, pav, pavement, lava) {
  const roman = sunkenStreet(map);
  const ways = map.roads.filter(roman).map(rd => ({ p: rd.p, half: rd.w / 2 - sidewalkWidth(rd.w), outer: rd.w / 2 }));
  for (const t of tracks) {
    const p = [];
    for (let i = 0; i < t.n; i += 4) p.push(t.points[i].x, t.points[i].z);
    if (!t.open) p.push(t.points[0].x, t.points[0].z);
    else p.push(t.points[t.n - 1].x, t.points[t.n - 1].z);
    ways.push({ p, half: t.hw, outer: t.hw + pav });
  }
  if (!ways.length) return () => 0;

  // the street as pieces: a rectangle along each segment and a polygon round each joint and end,
  // its sides touching a circle as wide as the street (so it covers the rectangles' ends)
  const rects = [], joints = [], grid = new Map(), key = (i, j) => i * 65536 + j;
  const file = (o, x0, z0, x1, z1) => {
    for (let i = Math.floor(x0 / CELL); i <= Math.floor(x1 / CELL); i++) {
      for (let j = Math.floor(z0 / CELL); j <= Math.floor(z1 / CELL); j++) {
        if (!grid.has(key(i, j))) grid.set(key(i, j), []);
        grid.get(key(i, j)).push(o);
      }
    }
  };
  for (const w of ways) {
    const p = w.p, R = w.half / Math.cos(Math.PI / SIDES);
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], bx = p[k + 2], bz = p[k + 3], L = Math.hypot(bx - ax, bz - az);
      if (L < 0.01) continue;
      const r = { ax, az, bx, bz, L, ux: (bx - ax) / L, uz: (bz - az) / L, half: w.half };
      rects.push(r);
      file(r, Math.min(ax, bx) - w.half, Math.min(az, bz) - w.half, Math.max(ax, bx) + w.half, Math.max(az, bz) + w.half);
    }
    for (let k = 0; k < p.length; k += 2) {
      const j = { x: p[k], z: p[k + 1], half: w.half, R };
      joints.push(j);
      file(j, j.x - R, j.z - R, j.x + R, j.z + R);
    }
  }
  const inside = (o, x, z) => {
    if (o.L !== undefined) {
      const dx = x - o.ax, dz = z - o.az, s = dx * o.ux + dz * o.uz;
      return s >= 0 && s <= o.L && Math.abs(dx * o.uz - dz * o.ux) < o.half;
    }
    const dx = x - o.x, dz = z - o.z;
    if (dx * dx + dz * dz > o.R * o.R) return false;
    for (let k = 0; k < SIDES; k++) {
      const a = ((k + 0.5) * 2 * Math.PI) / SIDES;
      if (dx * Math.cos(a) + dz * Math.sin(a) > o.half) return false;
    }
    return true;
  };
  const inStreet = (x, z) => (grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL))) ?? []).some(o => inside(o, x, z));
  const corners = j => Array.from({ length: SIDES }, (_, k) => [j.x + Math.cos((k * 2 * Math.PI) / SIDES) * j.R, j.z + Math.sin((k * 2 * Math.PI) / SIDES) * j.R]);

  // the floor, and the hole in the ground over it: the same pieces, D lower and at the ground
  const floor = [], hole = [], tri = (out, y, a, b, c) => { for (const [x, z] of [a, b, c]) out.push(x, y, z, x / 6, z / 6); };
  for (const out of [floor, hole]) {
    const y = out === floor ? -D + 0.03 : 0;
    for (const r of rects) {
      const nx = -r.uz * r.half, nz = r.ux * r.half;
      const a = [r.ax + nx, r.az + nz], b = [r.ax - nx, r.az - nz], c = [r.bx - nx, r.bz - nz], d = [r.bx + nx, r.bz + nz];
      tri(out, y, a, b, c); tri(out, y, a, c, d);
    }
    for (const j of joints) {
      const cs = corners(j);
      for (let k = 0; k < SIDES; k++) tri(out, y, [j.x, j.z], cs[k], cs[(k + 1) % SIDES]);
    }
  }
  add(ctx.group, floor, lava, { up: true });
  const mask = add(ctx.group, hole, new THREE.MeshBasicMaterial({
    colorWrite: false, depthWrite: false, depthTest: false,
    stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
  }), { up: true });
  mask.renderOrder = -10;
  mask.userData.bend = 0.05; // on hills only its edges need to follow the ground closely (js/terrain.js)
  mask.receiveShadow = false;

  // the walls: every outline of every piece, in short lengths, keeping those with street on one side
  // and ground on the other, run together; with a kerbstone's top along each on the ground's side
  const walls = [], tops = [];
  const outline = (ax, az, bx, bz) => {
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) return;
    const n = Math.max(1, Math.ceil(L / PIECE)), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    let run = -1, side = 0;
    const close = i => {
      if (run < 0) return;
      const x0 = ax + ux * (L * run) / n, z0 = az + uz * (L * run) / n, x1 = ax + ux * (L * i) / n, z1 = az + uz * (L * i) / n;
      const u0 = (x0 * ux + z0 * uz) / KERB_TILE, u1 = u0 + (L * (i - run)) / n / KERB_TILE;
      walls.push(x0, -D, z0, u0, 0, x1, -D, z1, u1, 0, x1, 0.01, z1, u1, D, x0, -D, z0, u0, 0, x1, 0.01, z1, u1, D, x0, 0.01, z0, u0, D);
      // the kerbstone's top, out over the ground (side: which way the ground lies)
      const kx = nx * side * KERB, kz = nz * side * KERB, y = 0.032;
      tops.push(x0, y, z0, u0, 0, x1, y, z1, u1, 0, x1 + kx, y, z1 + kz, u1, 1, x0, y, z0, u0, 0, x1 + kx, y, z1 + kz, u1, 1, x0 + kx, y, z0 + kz, u0, 1);
      run = -1;
    };
    for (let i = 0; i < n; i++) {
      const mx = ax + ux * (L * (i + 0.5)) / n, mz = az + uz * (L * (i + 0.5)) / n;
      const left = inStreet(mx + nx * 0.05, mz + nz * 0.05), right = inStreet(mx - nx * 0.05, mz - nz * 0.05);
      const s = left === right ? 0 : left ? -1 : 1;
      if (s !== side) { close(i); side = s; }
      if (s && run < 0) run = i;
    }
    close(n);
  };
  for (const r of rects) {
    const nx = -r.uz * r.half, nz = r.ux * r.half;
    outline(r.ax + nx, r.az + nz, r.bx + nx, r.bz + nz);
    outline(r.ax - nx, r.az - nz, r.bx - nx, r.bz - nz);
  }
  for (const j of joints) {
    const cs = corners(j);
    for (let k = 0; k < SIDES; k++) outline(...cs[k], ...cs[(k + 1) % SIDES]);
  }
  const kerb = kerbTexture();
  add(ctx.group, walls, new THREE.MeshStandardMaterial({ map: kerb, roughness: 0.85, side: THREE.DoubleSide }), { shadow: true });
  add(ctx.group, tops, cutStencil(onGround(new THREE.MeshStandardMaterial({ map: kerb, roughness: 0.85 }), 0.032)), { up: true });

  // the pavements: a strip of grit along both sides of each street, as wide as the street and its
  // pavements, the street's own hole cut out of it
  const walks = [];
  for (const w of ways) {
    const p = w.p, R = w.outer / Math.cos(Math.PI / SIDES);
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], bx = p[k + 2], bz = p[k + 3], L = Math.hypot(bx - ax, bz - az);
      if (L < 0.01) continue;
      const nx = (-(bz - az) / L) * w.outer, nz = ((bx - ax) / L) * w.outer;
      const a = [ax + nx, az + nz], b = [ax - nx, az - nz], c = [bx - nx, bz - nz], d = [bx + nx, bz + nz];
      tri(walks, GROUND.kerbs, a, b, c); tri(walks, GROUND.kerbs, a, c, d);
    }
    for (let k = 0; k < p.length; k += 2) {
      const cs = corners({ x: p[k], z: p[k + 1], R });
      for (let s = 0; s < SIDES; s++) tri(walks, GROUND.kerbs, [p[k], p[k + 1]], cs[s], cs[(s + 1) % SIDES]);
    }
  }
  for (let k = 3; k < walks.length; k += 5) { walks[k] *= 2; walks[k + 1] *= 2; } // the grit's tile: 3 m
  add(ctx.group, walks, cutStencil(onGround(pavement.clone(), GROUND.kerbs)), { up: true });
  if (ctx.groundPlane) cutStencil(ctx.groundPlane.material);

  return (x, z) => (inStreet(x, z) ? -D : 0);
}

// One mesh of triangles from [x, y, z, u, v] corners, flat-shaded; up: turn each triangle to face up.
function add(group, list, material, { shadow = false, up = false } = {}) {
  const n = list.length / 5, pos = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    pos.set(list.slice(i * 5, i * 5 + 3), i * 3);
    uv.set(list.slice(i * 5 + 3, i * 5 + 5), i * 2);
  }
  if (up) {
    for (let i = 0; i < n; i += 3) {
      const [ax, , az, bx, , bz, cx, cy, cz] = pos.slice(i * 3, i * 3 + 9);
      if ((bz - az) * (cx - ax) - (bx - ax) * (cz - az) < 0) {
        pos.set([cx, cy, cz, bx, pos[i * 3 + 4], bz], i * 3 + 3);
        const u = uv.slice(i * 2 + 2, i * 2 + 6);
        uv.set([u[2], u[3], u[0], u[1]], i * 2 + 2);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  mesh.castShadow = shadow;
  mesh.userData.still = true; // it never changes, so js/tiles.js may cut it up
  group.add(mesh);
  return mesh;
}
