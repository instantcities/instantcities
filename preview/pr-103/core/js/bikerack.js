// A bike rack: a steel rail on two feet with a row of bikes parked either side of it, the front
// wheels in the rail. 3.6 m across and 0.7 m for every bike along it. One draw call each: the bikes are
// one instanced mesh of a single merged bike, tinted per bike.
import * as THREE from 'three';

const STEP = 0.7;   // between two bikes
const WIDE = 3.6;   // across the rack, both rows
const COLOURS = [0xc0392b, 0x2f6f9f, 0x3b3b3b, 0xd9d4c5, 0x4a7f4f, 0xd9a02f, 0x6a4a8a, 0x2b2b2b];

// one bike pointing along +z, lying on the ground: wheels, frame, saddle, handlebar. Dark parts are
// vertex colour black-ish, the frame white (so the instance colour tints only the frame).
let bikeGeo, railGeo, mats;
function parts() {
  if (bikeGeo) return;
  const pieces = [];
  const add = (geo, x, y, z, rx = 0, rz = 0, col = 0xffffff) => {
    geo = geo.clone();
    if (rx) geo.rotateX(rx);
    if (rz) geo.rotateZ(rz);
    geo.translate(x, y, z);
    const c = new THREE.Color(col), n = geo.attributes.position.count, arr = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) c.toArray(arr, k * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    pieces.push(geo);
  };
  const wheel = new THREE.TorusGeometry(0.33, 0.03, 4, 12).rotateY(Math.PI / 2);
  add(wheel, 0, 0.36, -0.62, 0, 0, 0x1c1c1c);
  add(wheel, 0, 0.36, 0.62, 0, 0, 0x1c1c1c);
  const bar = (len, x, y, z, rx) => add(new THREE.BoxGeometry(0.075, 0.075, len), x, y, z, rx);
  bar(0.78, 0, 0.62, 0.15, -0.23);                         // top tube
  bar(0.7, 0, 0.5, -0.12, 0.8);                            // seat tube-ish
  bar(0.7, 0, 0.5, -0.38, -0.5);                           // rear stay
  bar(0.55, 0, 0.62, 0.55, 0.5);                           // fork
  add(new THREE.BoxGeometry(0.14, 0.04, 0.26), 0, 0.98, -0.2, 0, 0, 0x222222);   // the saddle
  add(new THREE.BoxGeometry(0.5, 0.04, 0.05), 0, 1.0, 0.6, 0, 0, 0x222222);      // the handlebar
  add(new THREE.BoxGeometry(0.34, 0.03, 0.5), 0, 0.72, -0.78, 0, 0, 0x222222);   // a rear rack
  bikeGeo = merge(pieces);
  const rails = [];
  rails.push(new THREE.BoxGeometry(1, 0.09, 0.09).translate(0, 0.32, 0));
  railGeo = rails[0];
  mats = {
    bike: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.3 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x6d7378, roughness: 0.5, metalness: 0.6 }),
  };
}

// merge a few indexed or plain geometries into one (position, normal, color)
function merge(list) {
  const pos = [], nor = [], col = [];
  for (const g of list) {
    const ng = g.index ? g.toNonIndexed() : g;
    pos.push(...ng.attributes.position.array); nor.push(...ng.attributes.normal.array); col.push(...ng.attributes.color.array);
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return out;
}

// `bikes` per row (the rack is bikes * STEP long), with a seed for who is parked in it
export function bikeRack(bikes = 8, seed = 1) {
  parts();
  const len = bikes * STEP, g = new THREE.Group();
  const rail = new THREE.Mesh(railGeo, mats.steel);
  rail.scale.x = len;
  rail.castShadow = true;
  g.add(rail);
  for (const x of [-len / 2 + 0.2, len / 2 - 0.2]) {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.06), mats.steel);
    foot.position.set(x, 0.17, 0);
    g.add(foot);
  }
  const inst = new THREE.InstancedMesh(bikeGeo, mats.bike, bikes * 2);
  inst.castShadow = true;
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
  let i = 0;
  for (const side of [1, -1]) for (let k = 0; k < bikes; k++, i++) {
    if (rnd() < 0.18) { m.makeScale(0, 0, 0); inst.setMatrixAt(i, m); continue; } // an empty place
    // a bike lies across the rack: its front wheel at the rail, the bike pointing away from it, a little crooked
    q.setFromEuler(new THREE.Euler(0, (side > 0 ? 0 : Math.PI) + Math.PI + (rnd() - 0.5) * 0.12, 0));
    m.compose(new THREE.Vector3(-len / 2 + STEP * (k + 0.5), 0, side * 0.8), q, one);
    inst.setMatrixAt(i, m);
    inst.setColorAt(i, new THREE.Color(COLOURS[Math.floor(rnd() * COLOURS.length)]));
  }
  g.add(inst);
  g.userData = { length: len, width: WIDE };
  return g;
}
