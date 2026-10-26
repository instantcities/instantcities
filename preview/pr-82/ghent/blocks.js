// What the buildings modelled by hand on their real outlines are put together from (the stations,
// ghent/stations.js, and De Krook, ghent/krook.js): upright walls along an outline wearing a
// drawn front, flat slabs on an outline, and the lines a platform or a track runs along. An outline
// is a flat ring [x, z, x, z, ...] in the city's metres, or in a model's own when moved by (ox, oz).
import * as THREE from 'three';

export const S = 1.25; // game metres to a real metre, as the map is drawn (ghent/area.json)

// the walls along a ring, from y0 to y1: each side wears the drawing `bay` metres wide a whole
// number of times (at least once), stretched up its height, so the windows fit each side
export function walls(ring, y0, y1, bay, ox = 0, oz = 0) {
  const pos = [], uv = [], n = ring.length / 2;
  for (let k = 0; k < n; k++) {
    const ax = ring[2 * k] - ox, az = ring[2 * k + 1] - oz, bx = ring[(2 * k + 2) % ring.length] - ox, bz = ring[(2 * k + 3) % ring.length] - oz;
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.05) continue;
    const u = bay ? Math.max(1, Math.round(L / bay)) : L / 4;
    pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y0, az, bx, y1, bz, ax, y1, az);
    uv.push(0, 0, u, 0, u, 1, 0, 0, u, 1, 0, 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

// a slab on a ring from y0 up to y1, its top and bottom as groups 0 and its sides as group 1
export function slab(ring, y0, y1, ox = 0, oz = 0) {
  const shape = new THREE.Shape();
  for (let k = 0; k < ring.length; k += 2) (k ? shape.lineTo : shape.moveTo).call(shape, ring[k] - ox, -(ring[k + 1] - oz));
  const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false });
  g.rotateX(-Math.PI / 2).translate(0, y0, 0);
  // the top in true metres, for a paved texture
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 4, p.getZ(i) / 4);
  return g;
}

// a ring grown (d > 0) or shrunk about its middle by d metres, near enough for an outline that
// is roughly round or square
export function grow(ring, d) {
  const n = ring.length / 2;
  let cx = 0, cz = 0;
  for (let k = 0; k < n; k++) { cx += ring[2 * k] / n; cz += ring[2 * k + 1] / n; }
  return ring.map((v, k) => {
    const x = ring[k - (k % 2)], z = ring[k - (k % 2) + 1], r = Math.hypot(x - cx, z - cz) || 1;
    return k % 2 ? cz + (z - cz) * (1 + d / r) : cx + (x - cx) * (1 + d / r);
  });
}

export function inside(x, z, p) {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
}

// A long thin outline's spine (a platform, curving with its tracks): points every `step` metres
// along its long axis, each { x, z, w: how wide it is there, a: which way it runs (radians, from +x
// towards +z) }.
export function spine(ring, step = 8) {
  const n = ring.length / 2;
  let cx = 0, cz = 0;
  for (let k = 0; k < n; k++) { cx += ring[2 * k] / n; cz += ring[2 * k + 1] / n; }
  let sxx = 0, sxz = 0, szz = 0;
  for (let k = 0; k < n; k++) { const dx = ring[2 * k] - cx, dz = ring[2 * k + 1] - cz; sxx += dx * dx; sxz += dx * dz; szz += dz * dz; }
  const a = 0.5 * Math.atan2(2 * sxz, sxx - szz), ux = Math.cos(a), uz = Math.sin(a);
  const along = k => (ring[2 * k] - cx) * ux + (ring[2 * k + 1] - cz) * uz;
  let lo = Infinity, hi = -Infinity;
  for (let k = 0; k < n; k++) { lo = Math.min(lo, along(k)); hi = Math.max(hi, along(k)); }
  const pts = [];
  for (let t = lo + step / 2; t < hi; t += step) {
    // where the line across the outline at t cuts its sides
    const cuts = [];
    for (let k = 0; k < n; k++) {
      const j = (k + 1) % n, ta = along(k), tb = along(j);
      if ((ta > t) === (tb > t)) continue;
      const f = (t - ta) / (tb - ta);
      const x = ring[2 * k] + (ring[2 * j] - ring[2 * k]) * f, z = ring[2 * k + 1] + (ring[2 * j + 1] - ring[2 * k + 1]) * f;
      cuts.push((x - cx) * -uz + (z - cz) * ux);
    }
    if (cuts.length < 2) continue;
    const s0 = Math.min(...cuts), s1 = Math.max(...cuts), s = (s0 + s1) / 2;
    pts.push({ x: cx + ux * t - uz * s, z: cz + uz * t + ux * s, w: s1 - s0, a });
  }
  // the way each point runs, from its neighbours (the outline bends)
  pts.forEach((p, k) => {
    const q0 = pts[Math.max(0, k - 1)], q1 = pts[Math.min(pts.length - 1, k + 1)];
    if (q0 !== q1) p.a = Math.atan2(q1.z - q0.z, q1.x - q0.x);
  });
  return pts;
}

// A ribbon along a line (flat [x, z, ...]): `w` wide, lying at height y, or upright from y to y + h
// when h is given, offset `side` metres to the left of the line. v runs along in metres / `rep`.
export function ribbon(line, w, y, { h = 0, side = 0, rep = 1, ox = 0, oz = 0 } = {}) {
  const pos = [], uv = [], n = line.length / 2;
  let run = 0;
  const at = k => {
    const k0 = Math.max(0, k - 1), k1 = Math.min(n - 1, k + 1);
    const dx = line[2 * k1] - line[2 * k0], dz = line[2 * k1 + 1] - line[2 * k0 + 1], L = Math.hypot(dx, dz) || 1;
    return [line[2 * k] - ox, line[2 * k + 1] - oz, -dz / L, dx / L]; // the point, and the way to its left
  };
  for (let k = 0; k + 1 < n; k++) {
    const [ax, az, lax, laz] = at(k), [bx, bz, lbx, lbz] = at(k + 1);
    const L = Math.hypot(bx - ax, bz - az), v0 = run / rep, v1 = (run + L) / rep;
    run += L;
    if (h) {
      const A = [ax + lax * side, az + laz * side], B = [bx + lbx * side, bz + lbz * side];
      pos.push(A[0], y, A[1], B[0], y, B[1], B[0], y + h, B[1], A[0], y, A[1], B[0], y + h, B[1], A[0], y + h, A[1]);
      uv.push(0, v0, 0, v1, 1, v1, 0, v0, 1, v1, 1, v0);
    } else {
      const l = side + w / 2, r = side - w / 2;
      const AL = [ax + lax * l, az + laz * l], AR = [ax + lax * r, az + laz * r], BL = [bx + lbx * l, bz + lbz * l], BR = [bx + lbx * r, bz + lbz * r];
      pos.push(AR[0], y, AR[1], BL[0], y, BL[1], AL[0], y, AL[1], AR[0], y, AR[1], BR[0], y, BR[1], BL[0], y, BL[1]);
      uv.push(0, v0, 1, v1, 1, v0, 0, v0, 0, v1, 1, v1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

// points every `every` metres along a line, each [x, z, a] with a the way it runs there
export function along(line, every, start = every / 2) {
  const out = [];
  let need = start;
  for (let k = 0; k + 3 < line.length; k += 2) {
    const ax = line[k], az = line[k + 1], dx = line[k + 2] - ax, dz = line[k + 3] - az, L = Math.hypot(dx, dz);
    for (; need <= L; need += every) out.push([ax + (dx * need) / L, az + (dz * need) / L, Math.atan2(dz, dx)]);
    need -= L;
  }
  return out;
}

// a canvas texture painted in metres (see core/js/facades.js elevation), repeating both ways
export function tiled(w, h, px, draw) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * px);
  c.height = Math.ceil(h * px);
  const g = c.getContext('2d');
  g.setTransform(px, 0, 0, -px, 0, h * px);
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

export const mat = (opts) => new THREE.MeshStandardMaterial({ roughness: 0.85, side: THREE.DoubleSide, ...opts });

export function mesh(geo, material, shadow = true) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}
