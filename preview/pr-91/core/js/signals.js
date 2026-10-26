import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { tinted } from './cars.js';
import { squareAt } from './squares.js';

// Traffic lights and the crossings painted on the streets (<city>/crossings.js, made by
// tools/crossings.mjs from OpenStreetMap). A light is a grey pole on the right-hand kerb with a
// black head of three lamps on a black board with a white rim, as in Belgium, facing the traffic
// it stops, and a smaller head for the people crossing, facing over the street. The lights of a
// junction take turns: first the one street, then the streets across it; a light on its own lets
// the people on foot cross now and then. Cars stop at red (see stopAt, for js/traffic.js).

const GREEN = 14, AMBER = 3, ALL_RED = 2; // seconds
const ON = { r: 0xff2a14, y: 0xffa400, g: 0x2bff6a }, OFF = { r: 0x3a1210, y: 0x3a2a0c, g: 0x0d2a16 };
const POLE = 0x7d8288, BLACK = 0x1b1d1f, WHITE = 0xf2f2f2;
const PAINT_Y = 0.047; // over the asphalt (0.04) and the kerbs
const ZEBRA = 4;       // metres along the street, the stripes 0.5 wide with 0.5 between them

// The pole and both heads, standing at the origin: the car head faces +z, the people's head -x
// (over the street, when the pole stands on the right of the traffic coming at it).
let poleGeo;
const LAMPS = [3.27, 2.93, 2.59];   // the car head's lamps' heights, red, amber and green
const PED = [2.36, 2.04];           // the people's head: the standing man and the walking man
function poleGeometry() {
  if (poleGeo) return poleGeo;
  const box = (w, h, d, x, y, z, hex) => tinted(new THREE.BoxGeometry(w, h, d).translate(x, y, z), hex);
  const parts = [
    tinted(new THREE.CylinderGeometry(0.06, 0.07, 3.55, 8).translate(0, 1.775, 0), POLE),
    box(0.76, 1.36, 0.02, 0, 2.93, -0.15, WHITE),   // the board's white rim
    box(0.6, 1.2, 0.03, 0, 2.93, -0.13, BLACK),   // the board
    box(0.34, 1.02, 0.24, 0, 2.93, 0, BLACK),       // the head
    box(0.2, 0.6, 0.3, -0.12, 2.2, 0, BLACK),       // the people's head
    box(0.1, 0.16, 0.1, 0, 1.15, -0.09, 0xd9b400),  // the push button
  ];
  for (const y of LAMPS) parts.push(box(0.27, 0.025, 0.17, 0, y + 0.14, 0.2, BLACK)); // the visors
  return (poleGeo = mergeGeometries(parts));
}

// A little man for the people's lamps, white on clear: standing, or walking.
function manTexture(walking) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.strokeStyle = '#fff';
  g.lineCap = 'round';
  g.beginPath();
  g.arc(32, 12, 6, 0, Math.PI * 2);
  g.fill();
  const limb = (x0, y0, x1, y1, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  limb(32, 22, 32, 40, 10); // the body
  if (walking) {
    limb(32, 40, 22, 58, 7); limb(32, 40, 42, 58, 7);
    limb(32, 25, 22, 38, 5); limb(32, 25, 42, 36, 5);
  } else {
    limb(29, 40, 28, 59, 7); limb(35, 40, 36, 59, 7);
    limb(27, 25, 25, 40, 5); limb(37, 25, 39, 40, 5);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Flat quads painted on the street: centre, the street's direction (ux, uz), half length along it
// and half width across it.
class Paint {
  constructor() { this.pos = []; }
  quad(x, y, z, ux, uz, along, across) {
    const rx = -uz, rz = ux, P = [];
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) P.push([x + ux * along * a + rx * across * b, y, z + uz * along * a + rz * across * b]);
    for (const k of [0, 2, 1, 0, 3, 2]) this.pos.push(...P[k]);
  }
  mesh(group) {
    if (!this.pos.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    geo.computeVertexNormals();
    // whichever way round the triangles came, they face up
    const n = geo.attributes.normal;
    for (let i = 0; i < n.count; i++) n.setY(i, 1), n.setX(i, 0), n.setZ(i, 0);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.75, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.receiveShadow = true;
    group.add(m);
  }
}

// The stripes of the crossings, and a stop line before each light.
function paintCrossings(group, crossings, signals) {
  const paint = new Paint();
  for (const c of crossings) {
    if (squareAt(c.x, c.z)) continue;
    const ux = Math.cos(c.a), uz = Math.sin(c.a), rx = -uz, rz = ux, y = c.y + PAINT_Y, half = c.w / 2 - 0.3;
    if (c.k === 'zebra') {
      for (let t = -half; t + 0.5 <= half; t += 1) paint.quad(c.x + rx * (t + 0.25), y, c.z + rz * (t + 0.25), ux, uz, ZEBRA / 2, 0.25);
    } else {
      // a bike crossing: a row of squares along both edges
      for (const e of [-1.4, 1.4]) for (let t = -half; t + 0.5 <= half; t += 1) paint.quad(c.x + ux * e + rx * (t + 0.25), y, c.z + uz * e + rz * (t + 0.25), ux, uz, 0.25, 0.25);
    }
  }
  for (const s of signals) {
    if (!s.d || squareAt(s.x, s.z)) continue;
    // across the lane coming at the light, from the middle of the street to the kerb
    const ux = Math.cos(s.a) * s.d, uz = Math.sin(s.a) * s.d, rx = -uz, rz = ux, back = s.back;
    paint.quad(s.x - ux * back + rx * s.w / 4, s.y + PAINT_Y, s.z - uz * back + rz * s.w / 4, ux, uz, 0.2, s.w / 4 - 0.1);
  }
  paint.mesh(group);
}

// ctx: the city's context (group, updaters); list: the city's SIGNALS, crossings its CROSSINGS.
// Returns { stopAt } for the cars, or null without lights.
export function addSignals(ctx, list, crossings) {
  paintCrossings(ctx.group, crossings ?? [], list ?? []);
  if (!list?.length) return null;
  // each junction its own moment in the cycle; one whose lights all go together has a turn for the
  // people on foot instead of the streets across
  const junctions = new Map();
  for (const s of list) {
    if (!junctions.has(s.j)) junctions.set(s.j, { off: ((s.j * 7.31) % 1) * 60, two: false });
    if (s.ph) junctions.get(s.j).two = true;
  }
  const lights = list.map(s => ({ ...s, ux: Math.cos(s.a), uz: Math.sin(s.a), jn: junctions.get(s.j), state: '', walk: null, poles: [] }));

  // the poles: one on the right of each way the light stops traffic
  const d = new THREE.Object3D(), poles = [];
  for (const l of lights) {
    for (const dir of l.d ? [l.d] : [1, -1]) {
      const ux = l.ux * dir, uz = l.uz * dir, rx = -uz, rz = ux, side = l.w / 2 + 0.65;
      d.position.set(l.x + rx * side + ux * 0.4, l.y, l.z + rz * side + uz * 0.4);
      d.rotation.set(0, Math.atan2(-ux, -uz), 0); // facing the traffic coming at it
      d.updateMatrix();
      l.poles.push(poles.length);
      poles.push(d.matrix.clone());
    }
  }
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.3 });
  const pole = new THREE.InstancedMesh(poleGeometry(), material, poles.length);
  pole.castShadow = true;
  pole.name = 'traffic lights';
  poles.forEach((m, i) => pole.setMatrixAt(i, m));
  ctx.group.add(pole);

  // the lamps, three for the cars and two for the people per pole, lit by their colour
  const lamp = (geo, map, count) => {
    const im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ map, transparent: !!map, alphaTest: map ? 0.4 : 0 }), count);
    im.name = 'traffic lamps';
    ctx.group.add(im);
    return im;
  };
  const car = lamp(new THREE.CircleGeometry(0.11, 12), null, poles.length * 3);
  const man = new THREE.PlaneGeometry(0.17, 0.17).rotateY(-Math.PI / 2);
  const stand = lamp(man, manTexture(false), poles.length), walk = lamp(man, manTexture(true), poles.length);
  const local = new THREE.Matrix4(), out = new THREE.Matrix4();
  poles.forEach((m, i) => {
    LAMPS.forEach((y, k) => car.setMatrixAt(i * 3 + k, out.multiplyMatrices(m, local.makeTranslation(0, y, 0.125))));
    stand.setMatrixAt(i, out.multiplyMatrices(m, local.makeTranslation(-0.225, PED[0], 0)));
    walk.setMatrixAt(i, out.multiplyMatrices(m, local.makeTranslation(-0.225, PED[1], 0)));
  });
  const colour = new THREE.Color();
  const paint = (im, i, hex) => im.setColorAt(i, colour.setHex(hex));
  // where a light is in its junction's cycle: 'g', 'y' or 'r', and whether people may cross
  const cycle = l => (l.jn.two ? 2 : 1) * (GREEN + AMBER + ALL_RED) + (l.jn.two ? 0 : 10);
  const show = (l, t) => {
    const P = cycle(l), turn = l.ph ? GREEN + AMBER + ALL_RED : 0, tau = (((t + l.jn.off - turn) % P) + P) % P;
    const state = tau < GREEN ? 'g' : tau < GREEN + AMBER ? 'y' : 'r', go = tau > GREEN + AMBER + 1.5 && tau < P - 3;
    if (state === l.state && go === l.walk) return false;
    l.state = state;
    l.walk = go;
    for (const i of l.poles) {
      ['r', 'y', 'g'].forEach((c, k) => paint(car, i * 3 + k, c === state ? ON[c] : OFF[c]));
      paint(stand, i, go ? OFF.r : ON.r);
      paint(walk, i, go ? ON.g : OFF.g);
    }
    return true;
  };
  const update = t => {
    let changed = false;
    for (const l of lights) changed = show(l, t) || changed;
    if (changed) for (const im of [car, stand, walk]) im.instanceColor.needsUpdate = true;
  };
  let clock = 0;
  update(0);
  ctx.updaters.push(dt => update((clock += Math.min(dt, 0.1))));

  // a grid of the lights, to find the ones near a car
  const C = 30, grid = new Map(), cell = (x, z) => `${Math.floor(x / C)},${Math.floor(z / C)}`;
  for (const l of lights) {
    const k = cell(l.x, l.z);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(l);
  }
  return {
    lights,
    // How far ahead (to the stop line) the car at (x, z), heading (fx, fz) with its nose `nose` metres ahead of it,
    // has to stop for a red light (or an amber one it can still stop for), else Infinity.
    stopAt(x, z, fx, fz, nose) {
      let best = Infinity;
      const i0 = Math.floor(x / C), j0 = Math.floor(z / C);
      for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) {
        for (const l of grid.get(`${i},${j}`) ?? []) {
          if (l.state === 'g') continue;
          const dx = l.x - x, dz = l.z - z, along = dx * fx + dz * fz - l.back;
          if (along < nose - 0.5 || along > 35 || Math.abs(dx * fz - dz * fx) > l.w / 2 + 1.5) continue;
          // the car has to run along the light's street, the way it stops
          const run = fx * l.ux + fz * l.uz;
          if (Math.abs(run) < 0.75 || (l.d && Math.sign(run) !== l.d)) continue;
          if (l.state === 'y' && along - nose < 6) continue; // too close to stop: go on
          best = Math.min(best, along);
        }
      }
      return best;
    },
  };
}
