import * as THREE from 'three';
import { carGroup, flashBeacons, randomCar } from './cars.js';

// Things lying across the track. Jump over them; ride into them and your horse stumbles.
// Barriers span the whole street and can be crashed through; the rest are solid and only block part of it.
export const OBSTACLE_TYPES = {
  // road works across the whole street, parked cars and big flower planters at the side
  barrier: { height: 1.15, depth: 1.0, solid: false },
  car: { height: 1.45, depth: 4.4, solid: true },
  planters: { height: 1.2, depth: 1.9, solid: true },
};

const mat = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

let shared = null;
function getShared() {
  if (shared) return shared;
  const stripes = document.createElement('canvas');
  stripes.width = 128;
  stripes.height = 32;
  const sg = stripes.getContext('2d');
  sg.fillStyle = '#ffffff';
  sg.fillRect(0, 0, 128, 32);
  sg.fillStyle = '#d32f2f';
  for (let x = -32; x < 128; x += 32) {
    sg.beginPath();
    sg.moveTo(x, 32); sg.lineTo(x + 16, 32); sg.lineTo(x + 32, 0); sg.lineTo(x + 16, 0);
    sg.fill();
  }
  const stripeTex = new THREE.CanvasTexture(stripes);
  stripeTex.colorSpace = THREE.SRGBColorSpace;
  stripeTex.wrapS = THREE.RepeatWrapping;

  shared = {
    stripeTex,
    concrete: mat(0xb9b5ad, 0.95),
    white: mat(0xf7f5ef, 0.5),
  };
  return shared;
}

function addMesh(group, geo, material, x, y, z) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
}

const PLANTER_FLOWERS = [0xe53935, 0xfdd835, 0xff80ab, 0xffffff, 0x8e24aa, 0xff7043];

// Models are built in a local frame: x runs across the track, +z is the riding direction.
const BUILDERS = {
  barrier(g, w, s) {
    const tex = s.stripeTex.clone();
    tex.repeat.set(w / 2, 1);
    tex.needsUpdate = true;
    const board = mat(0xffffff, 0.6, { map: tex });
    for (const y of [0.55, 1.0]) addMesh(g, new THREE.BoxGeometry(w, 0.3, 0.06), board, 0, y, 0);
    // trestle legs every few metres, and blinking amber lamps on top
    const legs = Math.max(2, Math.round(w / 4) + 1), lamps = [];
    for (let k = 0; k < legs; k++) {
      const x = -w / 2 + 0.2 + (k * (w - 0.4)) / (legs - 1);
      for (const z of [-0.35, 0.35]) {
        const leg = addMesh(g, new THREE.BoxGeometry(0.08, 1.25, 0.08), s.white, x, 0.6, z);
        leg.rotation.x = z > 0 ? -0.28 : 0.28;
      }
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.2, 10), new THREE.MeshBasicMaterial({ color: 0xffb300 }));
      lamp.position.set(x, 1.27, 0);
      g.add(lamp);
      lamps.push(lamp);
    }
    let t = Math.random();
    return dt => {
      t += dt;
      const on = Math.floor(t * 2.5) % 2 === 0;
      for (const l of lamps) l.material.color.setHex(on ? 0xffd740 : 0x6d4c00);
    };
  },
  car(g) {
    const c = randomCar(Math.random, { low: true, short: true }); // the obstacle is only so tall
    g.add(carGroup(c.type, c.c));
    return () => flashBeacons();
  },
  planters(g, w, s) {
    const count = Math.max(1, Math.round(w / 2.4));
    const bloom = new THREE.IcosahedronGeometry(0.22, 0);
    for (let k = 0; k < count; k++) {
      const x = -w / 2 + (k + 0.5) * (w / count);
      addMesh(g, new THREE.BoxGeometry(1.9, 0.85, 1.9), s.concrete, x, 0.43, 0);
      const bush = addMesh(g, new THREE.IcosahedronGeometry(0.8, 1), mat(0x4f8f3a, 0.9, { flatShading: true }), x, 1.05, 0);
      bush.scale.y = 0.6;
      for (let f = 0; f < 7; f++) {
        const a = f * 0.9 + k;
        const flower = new THREE.Mesh(bloom, mat(PLANTER_FLOWERS[(f + k) % PLANTER_FLOWERS.length], 0.7));
        flower.position.set(x + Math.cos(a) * 0.55, 1.2 + (f % 2) * 0.12, Math.sin(a) * 0.55);
        g.add(flower);
      }
    }
  },
};

export function createObstacle(track, def) {
  const [latMin, latMax] = def.lat ?? [-track.hw, track.hw];
  const idx = track.atFrac(def.at);
  const p = track.at(idx, (latMin + latMax) / 2);
  const w = latMax - latMin, type = OBSTACLE_TYPES[def.type];
  const group = new THREE.Group();
  group.rotation.order = 'YXZ'; // so the wobble tilts around the obstacle's own axis
  group.position.set(p.x, p.y, p.z);
  group.rotation.y = track.yawAt(idx);
  const tick = BUILDERS[def.type](group, w, getShared());
  return {
    kind: def.type, group, x: p.x, z: p.z, w, idx, latMin, latMax, full: !def.lat,
    height: type.height, depth: type.depth, solid: type.solid,
    tick: typeof tick === 'function' ? tick : undefined,
  };
}
