import * as THREE from 'three';
import { stander } from './splat.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { tinted } from './cars.js';

// The bus and tram stops (<city>/transit.js, made by tools/transit.mjs): De Lijn's grey
// pole on the kerb with its white sign and yellow top, a timetable box under it, and at the busier
// ones a glass shelter with a bench behind the pole. A few people wait at each. Everything is one
// instanced mesh per part for all the stops.

const POLE = 0x8b9196, SIGN = 0xf7f7f5, YELLOW = 0xffc400, FRAME = 0x3b4045, GLASS = 0xbcd4e0;
const SHIRTS = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xff7043, 0x8e24aa, 0x26c6da, 0xf5f5f5, 0x37474f, 0xad1457, 0x6d4c41];
const PANTS = [0x283593, 0x3e2723, 0x212121, 0x546e7a, 0x8d6e63, 0x1565c0];
const SKINS = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];

const box = (w, h, d, x, y, z, hex) => tinted(new THREE.BoxGeometry(w, h, d).translate(x, y, z), hex);

// The pole at the origin, its sign facing +z (along the street) and readable from both sides.
function poleGeometry() {
  return mergeGeometries([
    tinted(new THREE.CylinderGeometry(0.045, 0.05, 2.9, 8).translate(0, 1.45, 0), POLE),
    box(0.05, 0.62, 0.5, 0, 2.55, 0, SIGN).rotateY(Math.PI / 2),
    box(0.055, 0.14, 0.5, 0, 2.9, 0, YELLOW).rotateY(Math.PI / 2),
    box(0.3, 0.42, 0.08, 0, 1.55, -0.07, 0xe9e9e6),     // the timetable
  ]);
}

// The shelter, 3.6 m along the kerb (x) and 1.4 deep, open towards the street (+z): a dark frame,
// glass at the back and the ends, a flat roof and a bench.
function shelterGeometry() {
  const parts = [];
  for (const x of [-1.75, 1.75]) for (const z of [-0.65, 0.6]) parts.push(box(0.07, 2.35, 0.07, x, 1.175, z, FRAME));
  parts.push(box(3.8, 0.1, 1.6, 0, 2.4, 0, FRAME));           // the roof
  parts.push(box(1.2, 0.08, 0.38, 0.6, 0.48, -0.42, 0x5d4a3a)); // the bench
  parts.push(box(1.2, 0.04, 0.06, 0.6, 0.2, -0.5, FRAME));
  parts.push(box(0.9, 1.8, 0.04, -1.2, 1.25, -0.66, 0x2b4a6b)); // an ad panel in the back wall
  return mergeGeometries(parts);
}
function glassGeometry() {
  return mergeGeometries([
    new THREE.BoxGeometry(3.5, 2.05, 0.02).translate(0, 1.2, -0.65),
    new THREE.BoxGeometry(0.02, 2.05, 1.2).translate(-1.75, 1.2, -0.03),
    new THREE.BoxGeometry(0.02, 2.05, 1.2).translate(1.75, 1.2, -0.03),
  ]);
}

// Somebody standing about: legs, a body with the arms down, a head. Three parts, each tinted.
export const PERSON = {
  legs: new THREE.BoxGeometry(0.34, 0.82, 0.16).translate(0, 0.41, 0),
  body: new THREE.BoxGeometry(0.5, 0.64, 0.25).translate(0, 1.14, 0),
  head: new THREE.SphereGeometry(0.15, 8, 6).translate(0, 1.62, 0),
};

// ctx: the city's context (group, r); stops: the city's STOPS.
export function addStops(ctx, stops) {
  if (!stops?.length) return;
  const { r, group } = ctx, d = ctx.dummy;
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.2 });
  const make = (geo, mat, list, place, shadow = true) => {
    const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
    list.forEach((s, i) => { place(s); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
    im.count = list.length;
    im.castShadow = shadow;
    im.receiveShadow = true;
    im.name = 'stops';
    group.add(im);
    return im;
  };
  // the sign faces along the street; the shelter stands behind the pole, its back to the houses
  const at = (s, along, back, turn) => {
    const ux = Math.cos(s.a), uz = Math.sin(s.a);
    // the street is on the left of the way the sign faces: the houses on its right
    const hx = -uz, hz = ux;
    d.position.set(s.x + ux * along + hx * back, s.y + 0.03, s.z + uz * along + hz * back);
    d.rotation.set(0, Math.atan2(ux, uz) + turn, 0);
    d.scale.set(1, 1, 1);
  };
  make(poleGeometry(), material, stops, s => at(s, 0, 0, 0));
  const sheltered = stops.filter(s => s.shelter);
  make(shelterGeometry(), material, sheltered, s => at(s, -2.6, 1.1, Math.PI / 2));
  make(glassGeometry(), new THREE.MeshStandardMaterial({ color: GLASS, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.28, depthWrite: false }),
    sheltered, s => at(s, -2.6, 1.1, Math.PI / 2), false);

  // people waiting, looking up the street for their bus
  const people = [];
  for (const s of stops) {
    const n = Math.floor(r() * (s.shelter ? 4 : 3));
    for (let k = 0; k < n; k++) {
      people.push({ s, along: -0.6 - r() * 3.5, back: 0.2 + r() * 0.9, turn: Math.PI + (r() - 0.5) * 1.6, size: 0.9 + r() * 0.2,
        c: dressed(r) });
    }
  }
  addWaiting(ctx, people, p => { at(p.s, p.along, p.back, p.turn); d.scale.setScalar(p.size); });
}

// People standing about at the stops (and on the tram platforms, tramstops.js), each { c: [pants, shirt, skin] },
// put in place by place(p), which sets ctx.dummy: one instanced mesh per part. Each is a target for the
// paintball gun (ctx.targets, see splat.js).
export function addWaiting(ctx, people, place) {
  if (!people.length) return;
  const d = ctx.dummy, plain = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), c = new THREE.Color();
  const ims = ['legs', 'body', 'head'].map((part, k) => {
    const im = new THREE.InstancedMesh(PERSON[part], plain, people.length);
    people.forEach((p, i) => { place(p); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, c.setHex(p.c[k])); });
    im.castShadow = im.receiveShadow = true;
    im.name = 'stops';
    ctx.group.add(im);
    return im;
  });
  people.forEach((p, i) => ctx.targets?.push(stander(ims, i, p.c)));
}

// the colours of somebody waiting: [pants, shirt, skin] (also on the tram platforms, tramplatform.js)
export const dressed = r => [PANTS[Math.floor(r() * PANTS.length)], SHIRTS[Math.floor(r() * SHIRTS.length)], SKINS[Math.floor(r() * SKINS.length)]];
