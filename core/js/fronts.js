// Single houses drawn by hand (the Graslei's guild houses), standing in for the box the map would
// build from their outline: its walls and a roof on the outline, and in front, the front drawn from
// photos with its own gable, stepped, bell-shaped or pointed. The map's box still stops riders.
import * as THREE from 'three';
import { elevation, brick, ashlar } from './facades.js';

const FLOOR = 3.4; // game metres a storey, as the map's houses

// Adds the houses in `fronts` (<city>/fronts.js) that stand in `map`. Returns their
// outlines, so the map leaves their boxes out.
export function addFronts(group, map, fronts, place = (x, z, r, make) => group.add(make())) {
  const rings = [];
  const roofs = {}, sides = {};
  for (const d of fronts) {
    const b = map.buildings.find(b => Math.hypot(...centroid(b.p).map((v, k) => v - d.at[k])) < 3);
    if (!b) continue;
    rings.push(b.p);
    const [cx, cz] = centroid(b.p);
    let r = 0;
    for (let k = 0; k < b.p.length; k += 2) r = Math.max(r, Math.hypot(b.p[k] - cx, b.p[k + 1] - cz));
    place(cx, cz, r + 10, () => {
      const f = frontEdge(b.p, map.water, d.faces, d.line);
      const eaves = d.eaves ?? b.e ?? b.f * FLOOR + 0.4, top = d.top ?? (rowOf(d.gable) ? eaves + rowRise(d.gable, f.w) : b.t ?? eaves + f.w * 0.75);
      const house = new THREE.Group();
      house.name = d.id;
      // the walls on the outline up to the eaves, and a roof with its ridge running back from the
      // front (the houses share these, so when one is let go its wall texture stays)
      const side = (sides[d.wall] ??= new THREE.MeshStandardMaterial({ map: wallTexture(d.wall), roughness: 0.92, side: THREE.DoubleSide }));
      side.map.userData.shared = true;
      house.add(mesh(walls(b.p, eaves), side));
      const roof = (roofs[d.roof] ??= new THREE.MeshStandardMaterial({ color: d.roof, roughness: 0.85, flatShading: true, side: THREE.DoubleSide }));
      house.add(mesh(gableRoof(f, eaves, top), roof));
      // the front: its outline, the drawing on it
      const tex = elevation(f.w, top, d.px ?? 20, (g, w, h) => d.draw(g, w, h, eaves));
      house.add(mesh(frontGeometry(f, outline(d.gable, f.w, eaves, top)), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, side: THREE.DoubleSide })));
      d.props?.(house, f, top);
      return house;
    });
  }
  return rings;
}

function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function centroid(p) {
  let x = 0, z = 0;
  for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; }
  return [(2 * x) / p.length, (2 * z) / p.length];
}

// The edge the front stands on: the longest one looking out over the water (or towards `faces`,
// degrees: 0 east, 90 south), as { a: its left end seen from outside, right, n: outwards, w: its
// length, d: how deep the house goes behind it }. `line` [x0, z0, x1, z1] (a front's `line`) picks the
// stretch of wall by hand, for a front the outline cuts into many short edges, or a wall of several buildings.
function frontEdge(p, water, faces, line) {
  const n = p.length / 2, c = centroid(p);
  if (line) {
    const [x0, z0, x1, z1] = line, L = Math.hypot(x1 - x0, z1 - z0);
    let nx = (z1 - z0) / L, nz = -(x1 - x0) / L; // a normal; turn it to look towards `faces`, else away from the middle
    const look = faces != null ? [Math.cos((faces * Math.PI) / 180), Math.sin((faces * Math.PI) / 180)] : [(x0 + x1) / 2 - c[0], (z0 + z1) / 2 - c[1]];
    if (nx * look[0] + nz * look[1] < 0) { nx = -nx; nz = -nz; }
    const right = [nz, -nx], [a, b] = x0 * right[0] + z0 * right[1] < x1 * right[0] + z1 * right[1] ? [[x0, z0], [x1, z1]] : [[x1, z1], [x0, z0]];
    let d = 0;
    for (let k = 0; k < n; k++) d = Math.max(d, -((p[2 * k] - a[0]) * nx + (p[2 * k + 1] - a[1]) * nz));
    return { a, right, n: [nx, nz], w: L, d };
  }
  let sign = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) sign += p[2 * j] * p[2 * i + 1] - p[2 * i] * p[2 * j + 1];
  let look;
  if (faces != null) look = [Math.cos((faces * Math.PI) / 180), Math.sin((faces * Math.PI) / 180)];
  else {
    let best = Infinity;
    for (const wt of water) for (let k = 0; k + 3 < wt.p.length; k += 2) {
      const [x, z] = nearest(c, wt.p[k], wt.p[k + 1], wt.p[k + 2], wt.p[k + 3]), dd = Math.hypot(x - c[0], z - c[1]);
      if (dd < best) { best = dd; look = [(x - c[0]) / dd, (z - c[1]) / dd]; }
    }
  }
  let f = null;
  for (let k = 0; k < n; k++) {
    const ax = p[2 * k], az = p[2 * k + 1], bx = p[((k + 1) % n) * 2], bz = p[((k + 1) % n) * 2 + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 1) continue;
    const nx = (sign > 0 ? bz - az : az - bz) / L, nz = (sign > 0 ? ax - bx : bx - ax) / L; // outwards
    const score = (nx * look[0] + nz * look[1]) > 0.5 ? L : -1;
    if (!f || score > f.score) f = { score, k, ax, az, bx, bz, nx, nz, L };
  }
  // the map often breaks a straight front into pieces: carry on along the edges either side that
  // run (nearly) the same way, so the drawing covers the whole front
  const dir = k => { const ax = p[2 * (k % n)], az = p[2 * (k % n) + 1], bx = p[((k + 1) % n) * 2], bz = p[((k + 1) % n) * 2 + 1], L = Math.hypot(bx - ax, bz - az) || 1; return [(bx - ax) / L, (bz - az) / L]; };
  const [ux, uz] = dir(f.k), along = k => { const [dx, dz] = dir(k); return dx * ux + dz * uz > 0.985; };
  let k0 = f.k, k1 = f.k;
  while (k1 - f.k < n - 1 && along(k1 + 1)) k1++;
  while (f.k - k0 < n - 1 - (k1 - f.k) && along(k0 - 1 + n)) k0--;
  if (k0 !== f.k || k1 !== f.k) {
    const s0 = ((k0 % n) + n) % n, s1 = (k1 + 1) % n;
    Object.assign(f, { ax: p[2 * s0], az: p[2 * s0 + 1], bx: p[2 * s1], bz: p[2 * s1 + 1] });
    f.L = Math.hypot(f.bx - f.ax, f.bz - f.az);
    f.nx = (sign > 0 ? f.bz - f.az : f.az - f.bz) / f.L; f.nz = (sign > 0 ? f.ax - f.bx : f.bx - f.ax) / f.L;
  }
  const right = [f.nz, -f.nx];
  const [a, b] = f.ax * right[0] + f.az * right[1] < f.bx * right[0] + f.bz * right[1] ? [[f.ax, f.az], [f.bx, f.bz]] : [[f.bx, f.bz], [f.ax, f.az]];
  let d = 0;
  for (let k = 0; k < n; k++) d = Math.max(d, -((p[2 * k] - a[0]) * f.nx + (p[2 * k + 1] - a[1]) * f.nz));
  return { a, right, n: [f.nx, f.nz], w: f.L, d };
}

function nearest([px, pz], ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2));
  return [ax + dx * t, az + dz * t];
}

// The front's outline as [u, y] points, u across from its left end:
//   'stepped'   a stepped gable (trapgevel), `steps` steps up each side
//   'bell'      a Baroque bell gable: a neck with curved shoulders
//   'point'     a plain pointed gable
//   'flat'      straight up to the top, a cornice across
//   ['row', [{ gable, share?, rise? }, ...]]  several houses side by side under one map outline, each
//               with its own gable: `share` of the width (1), `rise` above the eaves (flat 2.4, else 0.9 of its width)
export function outline(gable, w, e, top) {
  const [kind, steps = 5] = [].concat(gable);
  const rise = top - e, pts = [[0, 0], [w, 0], [w, e]];
  if (kind === 'row') {
    // each house's own outline above the eaves, right to left, side by side
    for (const p of rowParts(gable, w).reverse()) for (const [u, y] of outline(p.gable, p.w, e, e + p.rise).slice(3, -1)) pts.push([p.u0 + u, y]);
  } else if (kind === 'stepped') {
    // up and in, step by step, to a top step as wide as the others; then down the other side
    const sw = w / (2 * steps + 1), sh = rise / (steps + 1);
    for (let k = 0; k < steps; k++) pts.push([w - k * sw, e + (k + 1) * sh], [w - (k + 1) * sw, e + (k + 1) * sh]);
    pts.push([w - steps * sw, top], [steps * sw, top]);
    for (let k = steps; k > 0; k--) pts.push([k * sw, e + k * sh], [(k - 1) * sw, e + k * sh]);
  } else if (kind === 'bell') {
    // round shoulders up to a neck, the neck ending in a round top
    const neck = w * 0.36, sh = e + rise * 0.5, r = neck / 2, side = w / 2 - r;
    for (let a = 1; a <= 8; a++) { const t = a / 8; pts.push([w - side * (1 - Math.cos((t * Math.PI) / 2)), e + (sh - e) * Math.sin((t * Math.PI) / 2)]); }
    for (let a = 0; a <= 12; a++) { const t = (a / 12) * Math.PI; pts.push([w / 2 + r * Math.cos(t), top - r + r * Math.sin(t)]); }
    for (let a = 8; a >= 1; a--) { const t = a / 8; pts.push([side * (1 - Math.cos((t * Math.PI) / 2)), e + (sh - e) * Math.sin((t * Math.PI) / 2)]); }
  } else if (kind === 'point') {
    pts.push([w / 2, top]);
  } else {
    pts.push([w, top], [0, top]);
  }
  pts.push([0, e]);
  return pts;
}

// the houses of a ['row', [...]] gable: where each starts (u0), how wide, its gable and rise
export const rowOf = gable => Array.isArray(gable) && gable[0] === 'row';
export function rowParts(gable, w) {
  const subs = gable[1], total = subs.reduce((t, s) => t + (s.share ?? 1), 0);
  let u0 = 0;
  return subs.map(s => {
    const pw = (w * (s.share ?? 1)) / total, g = s.gable ?? 'flat';
    const part = { ...s, u0, w: pw, gable: g, rise: s.rise ?? ([].concat(g)[0] === 'flat' ? 2.4 : pw * 0.9) };
    u0 += pw;
    return part;
  });
}
const rowRise = (gable, w) => Math.max(...rowParts(gable, w).map(p => p.rise));

// the outline stood up on the front edge, a hand's breadth proud of the wall, uv over the drawing
function frontGeometry(f, pts) {
  const shape = new THREE.Shape(pts.map(([u, y]) => new THREE.Vector2(u, y)));
  const geo = new THREE.ShapeGeometry(shape);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  let top = 0;
  for (const [, y] of pts) top = Math.max(top, y);
  for (let k = 0; k < pos.count; k++) {
    const u = pos.getX(k), y = pos.getY(k);
    uv.setXY(k, u / f.w, y / top);
    pos.setXYZ(k, f.a[0] + f.right[0] * u + f.n[0] * 0.08, y, f.a[1] + f.right[1] * u + f.n[1] * 0.08);
  }
  geo.computeVertexNormals();
  return geo;
}

// the outline's walls, up to the eaves; the texture in true metres along them
function walls(p, h) {
  const n = p.length / 2, pos = [], uv = [];
  let along = 0;
  for (let k = 0; k < n; k++) {
    const ax = p[2 * k], az = p[2 * k + 1], bx = p[((k + 1) % n) * 2], bz = p[((k + 1) % n) * 2 + 1];
    const L = Math.hypot(bx - ax, bz - az), u0 = along / 4, u1 = (along + L) / 4, v = h / 4;
    pos.push(ax, 0, az, bx, 0, bz, bx, h, bz, ax, 0, az, bx, h, bz, ax, h, az);
    uv.push(u0, 0, u1, 0, u1, v, u0, 0, u1, v, u0, v);
    along += L;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  return geo;
}

// a pitched roof from the eaves on both sides up to a ridge in the middle, running back from the
// front over the house's depth, closed at the back
function gableRoof(f, e, top) {
  const P = (u, y, dd) => [f.a[0] + f.right[0] * u - f.n[0] * dd, y, f.a[1] + f.right[1] * u - f.n[1] * dd];
  const w = f.w, d = f.d;
  const [l0, r0, t0, l1, r1, t1] = [P(0, e, 0), P(w, e, 0), P(w / 2, top, 0), P(0, e, d), P(w, e, d), P(w / 2, top, d)];
  const tri = [l0, t0, t1, l0, t1, l1, r0, r1, t1, r0, t1, t0, l1, t1, r1];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(tri.flat(), 3));
  geo.computeVertexNormals();
  return geo;
}

// the side and back walls: brick of a colour, or ashlar ('stone:#hex')
function wallTexture(kind = '#8c3b2a') {
  const [type, hex] = kind.startsWith('stone:') ? ['stone', kind.slice(6)] : ['brick', kind];
  const tex = elevation(4, 4, 32, (g, w, h) => (type === 'stone' ? ashlar(g, -2, 0, 2, 4, hex, { course: 0.5 }) : brick(g, -2, 0, 2, 4, hex)));
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
