import * as THREE from 'three';

// People who stand or sit still (waiting at the bus and tram stops, sitting on the terraces, on the
// cobbles and the quays) as targets for the paintball gun (car+paintball mode, main.js). A target is
// { at() -> { x, y (feet), z, h (how tall), r (how wide) } in the city, down, hit(x0, z0), reset() }: hit
// by a shot from (x0, z0), it is covered in blue and falls over, and stays down until reset (a new round).

// The first target a paintball flying from (x0, z0) to (x1, z1) at height y hits, knocked over.
// Returns { x, y, z } or null.
export function splatHit(targets, x0, z0, x1, z1, y) {
  const dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz || 1;
  let best = null, bu = Infinity;
  for (const t of targets ?? []) {
    if (t.down) continue;
    const p = t.at();
    if (Math.abs(p.x - x0) > 30 || Math.abs(p.z - z0) > 30) continue; // a shot flies 1 m or so a frame
    const u = Math.max(0, Math.min(1, ((p.x - x0) * dx + (p.z - z0) * dz) / L2)), h = y - p.y;
    // generous in height: well over the head counts (the gun is held at shoulder height, those sitting
    // are lower), and below the feet (a tram platform, a slope: the ground under them is not the shooter's)
    if (u < bu && Math.hypot(p.x - x0 - dx * u, p.z - z0 - dz * u) < p.r && h > -1.2 && h < p.h + 0.9) { best = { t, p }; bu = u; }
  }
  if (!best) return null;
  best.t.down = true;
  best.t.hit(x0, z0);
  return { x: best.p.x, y: Math.min(y, best.p.y + best.p.h * 0.7), z: best.p.z };
}

const BLUE = 0x1e66f5, blob = new THREE.SphereGeometry(1, 6, 5), paint = new THREE.MeshStandardMaterial({ color: BLUE, roughness: 0.5 });
const falling = []; // { g, t }: the standers on their way down

// Someone standing, instance i of the instanced meshes ims (legs, body, head, in that order), coloured
// c ([pants, shirt, skin]). Hit, they are folded away and a figure of their own (the same parts, a
// splash of blue on the chest) topples over where they stood, away from the shooter.
export function stander(ims, i, c) {
  const m = new THREE.Matrix4(), pos = new THREE.Vector3(), q = new THREE.Quaternion(), scale = new THREE.Vector3();
  let p = null, fallen = null;
  const keep = new THREE.Matrix4();
  const world = () => { ims[0].updateWorldMatrix(true, false); ims[0].getMatrixAt(i, m); m.premultiply(ims[0].matrixWorld).decompose(pos, q, scale); };
  return {
    down: false,
    at() {
      if (p) return p;
      world();
      return (p = { x: pos.x, y: pos.y, z: pos.z, h: 1.77 * scale.y, r: 0.45 * scale.x + 0.3 });
    },
    hit(x0, z0) {
      world();
      ims[0].getMatrixAt(i, keep); // to stand them up again (reset)
      const none = new THREE.Matrix4().makeScale(0, 0, 0);
      for (const im of ims) { im.setMatrixAt(i, none); im.instanceMatrix.needsUpdate = true; }
      const g = new THREE.Group(), body = new THREE.Group();
      g.position.copy(pos);
      g.rotation.order = 'YXZ';
      g.rotation.y = Math.atan2(pos.x - x0, pos.z - z0); // it falls along +z: away from the shooter
      body.quaternion.copy(q).premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -g.rotation.y, 0)));
      body.scale.copy(scale);
      ims.forEach((im, k) => {
        const part = new THREE.Mesh(im.geometry, new THREE.MeshStandardMaterial({ color: c[k], roughness: 0.8 }));
        part.castShadow = true;
        body.add(part);
      });
      g.add(body);
      // the splash, on the side the shot came from (-z of g): flat blobs on the chest and the face
      for (const [x, y, s] of [[0, 1.2, 0.17], [0.13, 1.02, 0.1], [-0.1, 1.35, 0.08], [0.05, 1.62, 0.07]]) {
        const b = new THREE.Mesh(blob, paint);
        b.position.set(x * scale.x, y * scale.y, -0.14 * scale.z);
        b.scale.set(s, s, s * 0.35);
        g.add(b);
      }
      ims[0].parent.add(g);
      g.position.applyMatrix4(new THREE.Matrix4().copy(ims[0].parent.matrixWorld).invert());
      falling.push({ g, t: 0 });
      fallen = g;
    },
    reset() {
      if (!fallen) return;
      fallen.removeFromParent();
      const k = falling.findIndex(f => f.g === fallen);
      if (k >= 0) falling.splice(k, 1);
      fallen = null;
      for (const im of ims) { im.setMatrixAt(i, keep); im.instanceMatrix.needsUpdate = true; }
      this.down = false;
    },
  };
}

// A new round: everyone hit stands (or sits) up again, and the paint comes off the cars and trams
export function resetSplats(targets) {
  for (const t of targets ?? []) if (t.down) { t.reset?.(); t.down = false; }
  for (const m of stuck) m.removeFromParent();
  stuck.length = 0;
}

// move the standers on their way down: a moment's staggering back, then flat on their back
export function updateSplats(dt) {
  for (let k = falling.length - 1; k >= 0; k--) {
    const f = falling[k];
    f.t += dt;
    const fall = Math.min(1, Math.max(0, (f.t - 0.35) * 2.5));
    f.g.rotation.x = Math.sin(f.t * 18) * 0.08 * (1 - fall) + fall * fall * (Math.PI / 2 - 0.08);
    if (fall >= 1) falling.splice(k, 1);
  }
}

// Cars, buses and trams take paint too: a splash of blue sticks to the side (or the roof, or the
// nose) where the shot hit, and rides along with it. A box: { x, y, z (the middle of its floor),
// yaw (its length along +z, turned), len, w, h, holder() } where holder() is the Object3D that moves
// with it, its origin there and turned with it, for the paint to stick to. Returns { x, y, z, box } or null.
// A box with a `mesh` (a tram's section, its nose rounded and sloping) is hit on the mesh itself: the
// shot's step is a ray against it, and the splash lies flat on the face it hits.
const stuck = []; // every blob stuck on a vehicle, the oldest first (there is a limit)
const MAX_STUCK = 400;
const ray = new THREE.Raycaster(), from = new THREE.Vector3(), dir = new THREE.Vector3(), out = new THREE.Vector3(0, 0, 1), turn = new THREE.Quaternion();
export function vehicleSplat(boxes, x0, z0, x1, z1, y) {
  // the meshes first: the nearest face along the step
  const L = Math.hypot(x1 - x0, z1 - z0);
  let best = null;
  if (L > 0) {
    from.set(x0, y, z0);
    dir.set((x1 - x0) / L, 0, (z1 - z0) / L);
    ray.set(from, dir);
    ray.far = L + 0.2;
    for (const b of boxes) {
      if (!b.mesh) continue;
      const hit = ray.intersectObject(b.mesh, false)[0];
      if (hit?.face && (!best || hit.distance < best.hit.distance)) best = { hit, b };
    }
  }
  if (best) {
    const { hit, b } = best, holder = b.holder(), size = 0.22 + Math.random() * 0.12;
    const at = holder.worldToLocal(hit.point.clone()), n = hit.face.normal; // (the face's normal is in the mesh's own frame)
    turn.setFromUnitVectors(out, n);
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(blob, paint), r = k ? size * (0.3 + Math.random() * 0.25) : size;
      m.quaternion.copy(turn);
      m.position.copy(at).addScaledVector(n, 0.015);
      // the drops round it, in the plane of the face
      if (k) m.position.add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.6) * 0.4, 0).applyQuaternion(turn));
      m.scale.set(r, r, r * 0.2);
      holder.add(m);
      stuck.push(m);
    }
    while (stuck.length > MAX_STUCK) stuck.shift().removeFromParent();
    return { x: hit.point.x, y: hit.point.y, z: hit.point.z, box: b };
  }
  for (const f of [0.34, 0.67, 1]) { // a few points along the shot's step: a fast shot could skip a car
    const x = x0 + (x1 - x0) * f, z = z0 + (z1 - z0) * f;
    for (const b of boxes) {
      if (b.mesh) continue;
      const dx = x - b.x, dz = z - b.z, s = Math.sin(b.yaw), c = Math.cos(b.yaw);
      const along = dx * s + dz * c, side = dx * c - dz * s, up = y - b.y;
      if (Math.abs(along) > b.len / 2 || Math.abs(side) > b.w / 2 || up < 0 || up > b.h) continue;
      // onto the nearest face: a side, an end or the roof
      const ds = b.w / 2 - Math.abs(side), da = b.len / 2 - Math.abs(along), dt = b.h - up;
      const p = new THREE.Vector3(side, up, along), squash = new THREE.Vector3(1, 1, 1);
      if (ds <= da && ds <= dt) { p.x = Math.sign(side) * (b.w / 2 + 0.01); squash.x = 0.2; }
      else if (da <= dt) { p.z = Math.sign(along) * (b.len / 2 + 0.01); squash.z = 0.2; }
      else { p.y = b.h + 0.01; squash.y = 0.2; }
      const holder = b.holder(), size = 0.2 + Math.random() * 0.12;
      for (let k = 0; k < 3; k++) {
        const m = new THREE.Mesh(blob, paint), r = k ? size * (0.3 + Math.random() * 0.25) : size;
        m.position.copy(p);
        if (k) m.position.add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.6) * 0.4, (Math.random() - 0.5) * 0.5).multiply(new THREE.Vector3(1, 1, 1).sub(squash).divideScalar(0.8)));
        m.scale.copy(squash).multiplyScalar(r);
        holder.add(m);
        stuck.push(m);
      }
      while (stuck.length > MAX_STUCK) stuck.shift().removeFromParent();
      return { x, y, z, box: b };
    }
  }
  return null;
}
