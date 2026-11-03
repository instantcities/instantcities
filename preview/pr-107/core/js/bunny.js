import * as THREE from 'three';

let shared = null;

function getShared() {
  if (!shared) shared = {
    fur: new THREE.MeshStandardMaterial({ color: 0xfaf6f0, roughness: 0.95 }),
    pink: new THREE.MeshStandardMaterial({ color: 0xffa3c0, roughness: 0.8 }),
    eye: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2 }),
    body: new THREE.SphereGeometry(0.42, 16, 12),
    head: new THREE.SphereGeometry(0.3, 16, 12),
    ear: new THREE.CapsuleGeometry(0.075, 0.42, 4, 8),
    earInner: new THREE.CapsuleGeometry(0.045, 0.34, 4, 8),
    dot: new THREE.SphereGeometry(0.045, 8, 6),
    tail: new THREE.SphereGeometry(0.14, 10, 8),
    foot: new THREE.SphereGeometry(0.12, 10, 8),
  };
  return shared;
}

// A small white bunny facing +Z, sitting on y = 0. All bunnies share geometry and materials.
export function createBunny() {
  const s = getShared();
  const group = new THREE.Group();
  group.rotation.order = 'YXZ';
  const add = (geo, material, parent, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    parent.add(m);
    return m;
  };
  add(s.body, s.fur, group, 0, 0.42, -0.05, 0.95, 0.9, 1.1);
  add(s.head, s.fur, group, 0, 0.82, 0.3);
  add(s.dot, s.eye, group, 0.13, 0.9, 0.53);
  add(s.dot, s.eye, group, -0.13, 0.9, 0.53);
  add(s.dot, s.pink, group, 0, 0.8, 0.6);
  add(s.tail, s.fur, group, 0, 0.45, -0.52);
  add(s.foot, s.fur, group, 0.18, 0.08, 0.22, 1, 0.55, 1.6);
  add(s.foot, s.fur, group, -0.18, 0.08, 0.22, 1, 0.55, 1.6);
  const ears = [1, -1].map(side => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.11, 1.02, 0.22);
    pivot.rotation.set(-0.2, 0, -side * 0.2);
    group.add(pivot);
    add(s.ear, s.fur, pivot, 0, 0.28, 0, 1, 1, 0.6);
    add(s.earInner, s.pink, pivot, 0, 0.28, 0.035, 1, 1, 0.4);
    return pivot;
  });
  return { group, ears };
}
