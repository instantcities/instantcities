// Single houses drawn by hand (the Graslei's guild houses), standing in for the box the map would
// build from their outline: its walls and a roof on the outline, and in front, the front drawn from
// photos with its own gable, stepped, bell-shaped or pointed. The map's box still stops riders.
import * as THREE from 'three';
import { elevation, brick, ashlar, shade, letGo } from './facades.js';

const FLOOR = 3.4; // game metres a storey, as the map's houses

// Adds the houses in `fronts` (<city>/fronts.js) that stand in `map`. Returns their
// outlines, so the map leaves their boxes out.
export function addFronts(group, map, fronts, place = (x, z, r, make) => group.add(make())) {
  const rings = [];
  const roofs = {}, sides = {}, backs = {};
  // the buildings' middles, in a grid of 8 m cells to find the one 3 m from a house's quickly
  const middles = map.buildings.map(b => centroid(b.p)), cells = new Map(), cellOf = (x, z) => `${Math.floor(x / 8)},${Math.floor(z / 8)}`;
  middles.forEach(([x, z], i) => { const k = cellOf(x, z); if (!cells.has(k)) cells.set(k, []); cells.get(k).push(i); });
  // the outlines of the buildings with a middle within r of (x, z), to see what stands against a wall
  const near = (x, z, r) => {
    const out = [], c = Math.ceil(r / 8);
    for (let a = -c; a <= c; a++) for (let b = -c; b <= c; b++) for (const j of cells.get(cellOf(x + a * 8, z + b * 8)) ?? []) out.push(map.buildings[j].p);
    return out;
  };
  for (const d of fronts) {
    let i = -1; // the first such building, as the map lists them
    for (let a = -8; a <= 8; a += 8) {
      for (let c = -8; c <= 8; c += 8) {
        for (const j of cells.get(cellOf(d.at[0] + a, d.at[1] + c)) ?? []) {
          if ((i < 0 || j < i) && Math.hypot(middles[j][0] - d.at[0], middles[j][1] - d.at[1]) < 3) i = j;
        }
      }
    }
    if (i < 0) continue;
    const b = map.buildings[i];
    rings.push(b.p);
    const [cx, cz] = middles[i];
    let r = 0;
    for (let k = 0; k < b.p.length; k += 2) r = Math.max(r, Math.hypot(b.p[k] - cx, b.p[k + 1] - cz));
    place(cx, cz, r + 10, () => {
      const f = frontEdge(b.p, map.water, d.faces, d.line);
      const eaves = d.eaves ?? b.e ?? b.f * FLOOR + 0.4, top = d.top ?? (rowOf(d.gable) ? eaves + rowRise(d.gable, f.w) : b.t ?? eaves + f.w * 0.75);
      const house = new THREE.Group();
      house.name = d.id;
      // the walls on the outline up to the eaves, and a roof with its ridge running back from the
      // front (the houses share these, so when one is let go its wall texture stays)
      // (with a window a storey on the walls, as a side or a back that looks out onto a street or
      // the water has them; plain brick in the gable at the back)
      const side = (sides[d.wall] ??= new THREE.MeshStandardMaterial({ map: wallTexture(d.wall, true), roughness: 0.92, side: THREE.DoubleSide }));
      side.map.userData.shared = true;
      house.add(mesh(walls(b.p, eaves), side));
      const back = (backs[d.wall] ??= new THREE.MeshStandardMaterial({ map: wallTexture(d.wall), roughness: 0.92, side: THREE.DoubleSide }));
      back.map.userData.shared = true;
      house.add(mesh(backGable(f, eaves, top), back));
      const roof = (roofs[d.roof] ??= new THREE.MeshStandardMaterial({ color: d.roof, roughness: 0.85, flatShading: true, side: THREE.DoubleSide }));
      house.add(mesh(gableRoof(f, eaves, top), roof));
      // the front: its outline, the drawing on it
      // (each drawing's canvas let go once it is on the GPU: the houses round the camera hold hundreds)
      const tex = drawing(f.w, top, d.px ?? 20, (g, w, h) => d.draw(g, w, h, eaves));
      house.add(mesh(frontGeometry(f, outline(d.gable, f.w, eaves, top)), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, side: THREE.DoubleSide })));
      // the walls round the back and side that show (a corner house's, the end of a row) wear its windows
      // too, at half the front's pixels a metre: they are seen from further off, and there are more of them
      if (d.side) {
        for (const w of sideWalls(b.p, f, near(cx, cz, r + 30))) {
          const tex2 = drawing(w.w, eaves, (d.px ?? 20) / 2, (g, ww, h) => d.side(g, ww, h, eaves, f.w));
          house.add(mesh(frontGeometry(w, [[0, 0], [w.w, 0], [w.w, eaves], [0, eaves]]), new THREE.MeshStandardMaterial({ map: tex2, roughness: 0.88, side: THREE.DoubleSide })));
        }
      }
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

// The walls of an outline other than the front f's that stand in the open: edges of 4 m or more that
// have no other building within 0.7 m outside them and are not the front's own line, each as a front
// (a, right, n, w) to draw on.
function sideWalls(p, f, others) {
  const n = p.length / 2, out = [];
  let sign = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) sign += p[2 * j] * p[2 * i + 1] - p[2 * i] * p[2 * j + 1];
  const inside = (x, z, q) => {
    let c = false;
    for (let i = 0, j = q.length - 2; i < q.length; j = i, i += 2) if ((q[i + 1] > z) !== (q[j + 1] > z) && x < ((q[j] - q[i]) * (z - q[i + 1])) / (q[j + 1] - q[i + 1]) + q[i]) c = !c;
    return c;
  };
  for (let k = 0; k < n; k++) {
    const ax = p[2 * k], az = p[2 * k + 1], bx = p[((k + 1) % n) * 2], bz = p[((k + 1) % n) * 2 + 1], L = Math.hypot(bx - ax, bz - az);
    if (L < 4) continue;
    const nx = (sign > 0 ? bz - az : az - bz) / L, nz = (sign > 0 ? ax - bx : bx - ax) / L, mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (nx * f.n[0] + nz * f.n[1] > 0.95 && Math.abs((mx - f.a[0]) * f.n[0] + (mz - f.a[1]) * f.n[1]) < 0.6) continue; // the front's own wall
    const px = mx + nx * 0.7, pz = mz + nz * 0.7, qx = mx + nx * 0.7 + (bx - ax) / L * (L / 2 - 1), qz = mz + nz * 0.7 + (bz - az) / L * (L / 2 - 1);
    if (others.some(q => q !== p && (inside(px, pz, q) || inside(qx, qz, q)))) continue; // a party wall
    const right = [nz, -nx], [a] = ax * right[0] + az * right[1] < bx * right[0] + bz * right[1] ? [[ax, az]] : [[bx, bz]];
    out.push({ a, right, n: [nx, nz], w: L });
  }
  return out;
}

// elevation(), its canvas let go once uploaded (and drawn again should the GPU lose it)
function drawing(w, h, px, draw) {
  const tex = letGo(elevation(w, h, px, draw), () => { tex.image = elevation(w, h, px, draw).image; });
  return tex;
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
//   ['arc', shoulder]  straight up `shoulder` metres (0), then a segmental curve across to its crown at the
//               top (a baroque front's curved gable)
//   'flat'      straight up to the top, a cornice across
//   ['mansard', inL, inR]  a mansard roof's slope above the eaves, drawn on: in by inL and inR metres at
//               the top (0 where it runs on into the next front, as the parts of one building do)
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
  } else if (kind === 'arc') {
    // straight up `shoulder` metres (none by default), then a segmental curve across to its crown at the top
    const shoulder = [].concat(gable)[1] ?? 0;
    pts.push([w, e + shoulder]);
    for (let a = 1; a < 16; a++) { const t = a / 16; pts.push([w * (1 - t), e + shoulder + (rise - shoulder) * Math.sin(t * Math.PI)]); }
    pts.push([0, e + shoulder]);
  } else if (kind === 'mansard') {
    const [, inL = 1, inR = 1] = [].concat(gable);
    pts.push([w - inR, top], [inL, top]);
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

// the outline's walls, up to the eaves; the texture in true metres along them, a storey high
function walls(p, h) {
  const n = p.length / 2, pos = [], uv = [];
  let along = 0;
  for (let k = 0; k < n; k++) {
    const ax = p[2 * k], az = p[2 * k + 1], bx = p[((k + 1) % n) * 2], bz = p[((k + 1) % n) * 2 + 1];
    const L = Math.hypot(bx - ax, bz - az), u0 = along / 4, u1 = (along + L) / 4, v = h / FLOOR;
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
// front over the house's depth (closed at the back by backGable)
const roofPoint = (f, u, y, dd) => [f.a[0] + f.right[0] * u - f.n[0] * dd, y, f.a[1] + f.right[1] * u - f.n[1] * dd];
function gableRoof(f, e, top) {
  const P = (u, y, dd) => roofPoint(f, u, y, dd);
  const w = f.w, d = f.d;
  const [l0, r0, t0, l1, r1, t1] = [P(0, e, 0), P(w, e, 0), P(w / 2, top, 0), P(0, e, d), P(w, e, d), P(w / 2, top, d)];
  const tri = [l0, t0, t1, l0, t1, l1, r0, r1, t1, r0, t1, t0];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(tri.flat(), 3));
  geo.computeVertexNormals();
  return geo;
}

// the gable at the back, under the roof's end: in the walls' brick, not the roof's colour
function backGable(f, e, top) {
  const w = f.w, P = (u, y) => roofPoint(f, u, y, f.d);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([P(0, e), P(w / 2, top), P(w, e)].flat(), 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, e / 4, w / 8, top / 4, w / 4, e / 4], 2));
  geo.computeVertexNormals();
  return geo;
}

// the side and back walls: brick of a colour, or ashlar ('stone:#hex'); with windows, 4 m of wall a
// storey high with a window in it, else 4 m square
function wallTexture(kind = '#8c3b2a', windows = false) {
  const [type, hex] = kind.startsWith('stone:') ? ['stone', kind.slice(6)] : ['brick', kind];
  const H = windows ? FLOOR : 4;
  const tex = drawing(4, H, 32, g => {
    if (type === 'stone') ashlar(g, -2, 0, 2, H, hex, { course: 0.5 });
    else brick(g, -2, 0, 2, H, hex);
    if (!windows) return;
    g.fillStyle = shade(hex, type === 'stone' ? -0.25 : 0.45); // the frame, in stone or pale against brick
    g.fillRect(-0.65, 0.85, 1.3, 1.8);
    g.fillStyle = '#2c3540';
    g.fillRect(-0.55, 0.95, 1.1, 1.6);
    g.fillStyle = shade(hex, type === 'stone' ? -0.25 : 0.45);
    g.fillRect(-0.05, 0.95, 0.1, 1.6);
    g.fillRect(-0.55, 1.95, 1.1, 0.08);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
