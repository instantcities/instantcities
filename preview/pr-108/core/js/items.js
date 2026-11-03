import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createBunny } from './bunny.js';

// The three things you can pick up. `weight` is how often a pickup spot rolls that item.
export const ITEMS = {
  bunny: { emoji: '🐰', name: 'Bunny', weight: 55, ring: 0xff7eb6 },
  hedgehog: { emoji: '🦔', name: 'Hedgehog', weight: 30, ring: 0xffa040 },
  cloud: { emoji: '🌧️', name: 'Rain cloud', weight: 15, ring: 0x5cc0ff },
};

export function rollItem() {
  const total = Object.values(ITEMS).reduce((s, i) => s + i.weight, 0);
  let x = Math.random() * total;
  for (const [key, it] of Object.entries(ITEMS)) if ((x -= it.weight) < 0) return key;
  return 'bunny';
}

const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

let shared = null;
function getShared() {
  if (shared) return shared;
  // Spikes: small cones on the back half of a dome, merged into a single geometry.
  const cones = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let k = 0; k < 90; k++) {
    const y = 1 - (k / 89) * 1.15, rad = Math.sqrt(Math.max(0, 1 - y * y));
    const a = k * 2.39996;
    const n = new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad);
    if (n.y < -0.05 || (n.z > 0.45 && n.y < 0.55)) continue; // keep the face and belly clear
    const cone = new THREE.ConeGeometry(0.075, 0.34, 5);
    cone.translate(0, 0.17, 0);
    cone.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, n));
    cone.translate(n.x * 0.42, n.y * 0.36 + 0.32, n.z * 0.42 - 0.05);
    cones.push(cone);
  }
  shared = {
    spikes: mergeGeometries(cones),
    spikeMat: std(0x5a3d2b, 0.9),
    fur: std(0x8d6e56, 0.9),
    face: std(0xe8c9a0, 0.8),
    dark: std(0x151515, 0.3),
    dome: new THREE.SphereGeometry(0.44, 16, 12),
    snout: new THREE.SphereGeometry(0.2, 12, 10),
    dot: new THREE.SphereGeometry(0.045, 8, 6),
    ear: new THREE.SphereGeometry(0.07, 8, 6),
    puff: new THREE.SphereGeometry(1, 14, 10),
    cloudMat: std(0xf4f7fb, 1, { emissive: 0x5f6f80, emissiveIntensity: 0.35 }),
    cloudDark: std(0x8793a3, 1, { emissive: 0x2c3440, emissiveIntensity: 0.3 }),
    drop: new THREE.SphereGeometry(0.12, 8, 6),
    dropMat: new THREE.MeshBasicMaterial({ color: 0x4fb3ff }),
    mouth: new THREE.TorusGeometry(0.16, 0.035, 6, 12, Math.PI),
    bolt: boltGeometry(),
    boltMat: new THREE.MeshBasicMaterial({ color: 0xffe14d }),
  };
  return shared;
}

function part(parent, geo, material, x, y, z, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  parent.add(m);
  return m;
}

// A curled-up hedgehog with a little face, facing +Z.
export function createHedgehog() {
  const s = getShared();
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  part(body, s.dome, s.fur, 0, 0.32, -0.05, 1, 0.82, 1.05);
  part(body, s.spikes, s.spikeMat, 0, 0, 0);
  part(body, s.snout, s.face, 0, 0.24, 0.38, 0.9, 0.8, 1.25);
  part(body, s.dot, s.dark, 0, 0.25, 0.64);
  part(body, s.dot, s.dark, 0.13, 0.38, 0.45, 0.9, 0.9, 0.9);
  part(body, s.dot, s.dark, -0.13, 0.38, 0.45, 0.9, 0.9, 0.9);
  part(body, s.ear, s.face, 0.2, 0.52, 0.3);
  part(body, s.ear, s.face, -0.2, 0.52, 0.3);
  for (const x of [-0.18, 0.18]) part(body, s.ear, s.face, x, 0.04, 0.25, 1.1, 0.6, 1.4);
  return { group, body };
}

// A grumpy little rain cloud with a face, facing +Z.
export function createCloud() {
  const s = getShared();
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const puffs = [[0, 0, 0, 0.9], [-0.85, -0.15, 0, 0.65], [0.85, -0.12, 0, 0.7], [-0.4, 0.45, -0.1, 0.6], [0.45, 0.4, -0.1, 0.62], [0, -0.1, -0.5, 0.75]];
  for (const [x, y, z, r] of puffs) part(body, s.puff, s.cloudMat, x, y, z, r, r * 0.85, r);
  part(body, s.puff, s.cloudDark, 0, -0.45, -0.1, 1.3, 0.35, 0.8);
  part(body, s.dot, s.dark, 0.28, 0.12, 0.86, 1.5, 1.5, 1.5);
  part(body, s.dot, s.dark, -0.28, 0.12, 0.86, 1.5, 1.5, 1.5);
  const mouth = part(body, s.mouth, s.dark, 0, -0.15, 0.84);
  mouth.rotation.z = 0; // arc opens downwards: a frown
  for (const x of [-0.33, 0.33]) {
    const brow = part(body, s.dot, s.dark, x, 0.3, 0.84, 2.6, 0.5, 0.6);
    brow.rotation.z = x > 0 ? 0.45 : -0.45;
  }
  const drops = [];
  for (let k = 0; k < 3; k++) drops.push(part(body, s.drop, s.dropMat, (k - 1) * 0.45, -0.8, 0.1, 0.8, 1.3, 0.8));
  return { group, body, drops };
}

export function createBolt() {
  const s = getShared();
  return new THREE.Mesh(s.bolt, s.boltMat);
}

function boltGeometry() {
  const shape = new THREE.Shape();
  const pts = [[0, 0], [0.5, -2.2], [0.05, -2.2], [0.6, -4.6], [-0.5, -1.8], [-0.05, -1.8], [-0.45, 0]];
  shape.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts.slice(1)) shape.lineTo(x, y);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
  geo.translate(0, 0, -0.06);
  return geo;
}

export function createItemModel(kind) {
  if (kind === 'hedgehog') return createHedgehog();
  if (kind === 'cloud') return createCloud();
  return createBunny();
}
