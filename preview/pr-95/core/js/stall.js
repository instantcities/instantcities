// A flower seller's market stall (a marktkraam), as on the Kouter's Sunday flower market: four
// poles under a striped canvas roof, a trestle table and tiered shelves full of zinc buckets of
// cut flowers and potted plants, and the seller behind it all in a green apron. 3.2 m wide along
// x, 2.2 m deep, the customers' side towards +z. One mesh a stall.
import * as THREE from 'three';
import { Kit, kitMat } from './kit.js';
import { rng } from './facades.js';

const W = 3.2, D = 2.2, H = 2.35; // width, depth, height at the front edge of the roof
const CANVAS = [[0xc62828, 0xf5f1e8], [0x2e7d32, 0xf5f1e8], [0x1565c0, 0xf5f1e8], [0xf9a825, 0xf5f1e8], [0x6a1b9a, 0xf5f1e8]];
const BLOOMS = [0xd81b60, 0xe53935, 0xfdd835, 0xffffff, 0xff7043, 0x8e24aa, 0xf48fb1, 0xffb300, 0x7e57c2, 0xc62828];
const SKINS = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
const WOOD = 0x8d6e4a, POLE = 0x8a8f94, ZINC = 0x9ea7ad, LEAF = 0x3e7d32;

const cache = new Map();

// a bucket of flowers: the zinc bucket, the stems sticking out and the blooms on top
function bucket(k, r, x, y, z) {
  const bloom = BLOOMS[Math.floor(r() * BLOOMS.length)], tall = 0.28 + r() * 0.22;
  k.add(new THREE.CylinderGeometry(0.15, 0.12, 0.3, 8), ZINC, x, y + 0.15, z);
  k.add(new THREE.ConeGeometry(0.17, tall, 6), LEAF, x, y + 0.3 + tall / 2, z);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + r(), d = 0.06 + r() * 0.05;
    k.add(new THREE.IcosahedronGeometry(0.075 + r() * 0.03, 0), bloom, x + Math.cos(a) * d, y + 0.3 + tall * (0.75 + r() * 0.3), z + Math.sin(a) * d);
  }
}

// a plant in a pot: terracotta pot, a ball of leaves, a few flowers on it
function potted(k, r, x, y, z) {
  const bloom = BLOOMS[Math.floor(r() * BLOOMS.length)];
  k.add(new THREE.CylinderGeometry(0.11, 0.08, 0.16, 8), 0xb5643c, x, y + 0.08, z);
  k.add(new THREE.IcosahedronGeometry(0.14, 0), LEAF, x, y + 0.24, z);
  for (let i = 0; i < 3; i++) k.add(new THREE.IcosahedronGeometry(0.05, 0), bloom, x + (r() - 0.5) * 0.18, y + 0.3 + r() * 0.06, z + (r() - 0.5) * 0.18);
}

function geometry(seed) {
  const k = new Kit(), r = rng(seed * 7919 + 13);
  const [c1, c2] = CANVAS[seed % CANVAS.length];
  // the four poles, the back ones taller so the roof slopes to the front
  for (const sx of [-1, 1]) {
    k.rod([sx * (W / 2 - 0.05), 0, D / 2 - 0.05], [sx * (W / 2 - 0.05), H, D / 2 - 0.05], 0.03, POLE);
    k.rod([sx * (W / 2 - 0.05), 0, -D / 2 + 0.05], [sx * (W / 2 - 0.05), H + 0.45, -D / 2 + 0.05], 0.03, POLE);
  }
  // the striped canvas roof, sloping down to the front, and its valance hanging at the front
  const slope = Math.atan2(0.45, D), len = Math.hypot(D, 0.45) + 0.3, n = 8;
  for (let i = 0; i < n; i++) {
    const x = -W / 2 - 0.1 + ((i + 0.5) * (W + 0.2)) / n, c = i % 2 ? c2 : c1;
    k.box((W + 0.2) / n, 0.03, len, c, x, H + 0.25, 0.1, slope);
    k.box((W + 0.2) / n, 0.26, 0.02, c, x, H - 0.1, D / 2 + 0.2);
  }
  // the trestle table along the front, a green cloth over it, and two tiers of shelves behind
  k.box(W - 0.2, 0.05, 0.8, WOOD, 0, 0.78, D / 2 - 0.5);
  k.box(W - 0.16, 0.5, 0.02, 0x2e5d32, 0, 0.55, D / 2 - 0.09);
  for (const sx of [-1, 1]) k.box(0.05, 0.78, 0.7, WOOD, sx * (W / 2 - 0.25), 0.39, D / 2 - 0.5);
  k.box(W - 0.2, 0.05, 0.45, WOOD, 0, 1.08, -0.15);
  k.box(W - 0.2, 0.05, 0.4, WOOD, 0, 1.38, -0.55);
  for (const sx of [-1, 1]) {
    k.box(0.05, 1.08, 0.05, WOOD, sx * (W / 2 - 0.2), 0.54, -0.15);
    k.box(0.05, 1.38, 0.05, WOOD, sx * (W / 2 - 0.2), 0.69, -0.55);
  }
  // flowers everywhere: buckets on the table and the shelves, pots on the ground in front
  for (let x = -W / 2 + 0.45; x < W / 2 - 0.3; x += 0.36) {
    bucket(k, r, x, 0.8, D / 2 - 0.65);
    if (r() < 0.8) bucket(k, r, x + 0.12, 1.1, -0.15);
    if (r() < 0.7) bucket(k, r, x - 0.05, 1.4, -0.55);
  }
  for (let x = -W / 2 + 0.3; x < W / 2 - 0.2; x += 0.32) if (r() < 0.75) potted(k, r, x, 0, D / 2 + 0.25 + r() * 0.15);
  // the seller, behind the stall to one side, in a green apron
  const sx = (r() < 0.5 ? -1 : 1) * 0.9, skin = SKINS[Math.floor(r() * SKINS.length)], z = -D / 2 - 0.35;
  for (const lx of [-0.1, 0.1]) k.box(0.14, 0.82, 0.15, 0x37474f, sx + lx, 0.41, z);
  k.box(0.42, 0.62, 0.24, [0xf5f5f5, 0x1e88e5, 0xe53935, 0x6d4c41][Math.floor(r() * 4)], sx, 1.13, z);
  k.box(0.38, 0.75, 0.02, 0x2e7d32, sx, 0.98, z + 0.13);
  for (const lx of [-0.28, 0.28]) k.box(0.1, 0.56, 0.11, skin, sx + lx, 1.12, z + 0.08, -0.35);
  k.add(new THREE.SphereGeometry(0.15, 8, 6), skin, sx, 1.6, z);
  k.add(new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), [0x2b1d14, 0x5d4037, 0xd7b56d, 0xb0a99f][Math.floor(r() * 4)], sx, 1.64, z - 0.01);
  return k.geometry();
}

// The stall's footprint, [along, across], for what riders bump into.
export const STALL_SIZE = [W + 0.2, D + 0.6];

export function flowerStall(seed = 1) {
  const key = seed % 12; // a dozen different stalls is plenty
  if (!cache.has(key)) cache.set(key, geometry(key + 1));
  const m = new THREE.Mesh(cache.get(key), kitMat(0.85));
  m.castShadow = m.receiveShadow = true;
  return m;
}
