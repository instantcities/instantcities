import * as THREE from 'three';
import { SIGHT } from './device.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { liftShader } from './terrain.js';

// Vehicle models. Each is drawn as side profiles (a rounded outline in the length/height plane,
// wheel arches cut out of it) pulled out across the vehicle's width, so bonnets slope, windscreens
// rake and corners are round. Measures in metres, the nose towards +z, centred on the vehicle. A
// row of parked cars is also something to ride over, so heightAt says how high a car's top is at
// any point along it.

// A profile point: [z, y, corner radius]. The outline runs from the nose's bottom corner up over
// the top to the tail's bottom corner; the bottom edge back to the nose has the wheel arches.
// part: { p: points, w: width, m: 'paint' | 'glass' | 0xcolour, arches?: true, top?: true }
// Boxes are [width, y0, y1, z0, z1, material] for stripes, pillars, lights and such.

const car = (len, w, wheel, axles, lights, body, glass, roof, pillars, extra = {}) => ({
  len, w, wheel, axles, lights,
  parts: [
    { p: body, w, m: 'paint', arches: true, top: true },
    { p: glass, w: w - 0.2, m: 'glass', top: true },
    { p: roof, w: w - 0.14, m: 'paint', top: true },
  ],
  boxes: pillars.map(z => [w - 0.17, glass[0][1], roof[0][1], z - 0.06, z + 0.06, 'paint']),
  ...extra,
});

// The word LIJN in grey, as boxes, h high with its bottom at y: on both sides (side: the half-width
// it stands out at, centred at z), each reading from the nose's end or the tail's as you face it,
// or on the nose (front: its z, centred at x).
const LIJN = [ // each letter's strokes [u0, u1, v0, v1] for letters 1 high, and its width
  [[[0, 0.2, 0, 1], [0, 0.62, 0, 0.2]], 0.62],
  [[[0, 0.2, 0, 1]], 0.2],
  [[[0.42, 0.62, 0, 1], [0, 0.62, 0, 0.2], [0, 0.2, 0, 0.45]], 0.62],
  [[[0, 0.2, 0, 1], [0.5, 0.7, 0, 1], ...[0, 1, 2, 3, 4].map(i => [0.14 + 0.06 * i, 0.28 + 0.06 * i, 0.8 - 0.2 * i, 1 - 0.2 * i])], 0.7],
];
function lijn({ side, front, z = 0, x = 0, y, h }) {
  const rects = [];
  let u = 0;
  for (const [strokes, gw] of LIJN) {
    for (const [u0, u1, v0, v1] of strokes) rects.push([u + u0, u + u1, v0, v1]);
    u += gw + 0.2;
  }
  const half = (u - 0.2) / 2, out = [], GREY = 0x6b7378;
  for (const [u0, u1, v0, v1] of rects) {
    const a = (u0 - half) * h, b = (u1 - half) * h, y0 = y + v0 * h, y1 = y + v1 * h;
    if (front != null) out.push([b - a, y0, y1, front - 0.04, front, GREY, x + (a + b) / 2]);
    // facing the right side (+x) you read towards the tail, facing the left towards the nose
    else for (const s of [-1, 1]) out.push([0.012, y0, y1, Math.min(z - s * a, z - s * b), Math.max(z - s * a, z - s * b), GREY, s * (side - 0.005)]);
  }
  return out;
}

export const CAR_TYPES = {
  hatch: car(3.9, 1.76, 0.33, [-1.25, 1.22], [0.66, 1.98, 0.82, -1.98],
    [[1.95, 0.3, 0.12], [1.97, 0.62, 0.14], [1.7, 0.84, 0.3], [0.75, 0.96, 0.1], [-1.85, 0.98, 0.1], [-1.96, 0.8, 0.1], [-1.95, 0.3, 0.1]],
    [[0.82, 0.9, 0], [0.15, 1.45, 0.12], [-1.55, 1.47, 0.12], [-1.85, 0.9, 0]],
    [[0.2, 1.41, 0], [0.12, 1.53, 0.06], [-1.55, 1.55, 0.07], [-1.7, 1.41, 0]], [-0.4]),
  sedan: car(4.6, 1.8, 0.34, [-1.45, 1.5], [0.64, 2.34, 0.7, -2.32],
    [[2.3, 0.3, 0.12], [2.32, 0.62, 0.14], [2.05, 0.82, 0.3], [0.95, 0.93, 0.1], [-1.25, 0.95, 0.1], [-2.15, 0.9, 0.2], [-2.31, 0.62, 0.12], [-2.3, 0.3, 0.1]],
    [[1.0, 0.89, 0], [0.25, 1.4, 0.12], [-0.85, 1.42, 0.15], [-1.35, 0.89, 0]],
    [[0.32, 1.36, 0], [0.22, 1.47, 0.06], [-0.82, 1.48, 0.08], [-1.0, 1.36, 0]], [-0.3]),
  estate: car(4.7, 1.82, 0.34, [-1.5, 1.5], [0.64, 2.39, 0.86, -2.38],
    [[2.35, 0.3, 0.12], [2.37, 0.62, 0.14], [2.1, 0.84, 0.3], [1.0, 0.96, 0.1], [-2.25, 0.98, 0.1], [-2.36, 0.82, 0.1], [-2.35, 0.3, 0.1]],
    [[1.05, 0.92, 0], [0.35, 1.45, 0.1], [-2.0, 1.48, 0.1], [-2.25, 0.92, 0]],
    [[0.4, 1.41, 0], [0.3, 1.53, 0.05], [-2.02, 1.55, 0.06], [-2.15, 1.41, 0]], [-0.2, -1.4]),
  mini: car(3.3, 1.62, 0.3, [-1.05, 1.05], [0.62, 1.68, 0.78, -1.68],
    [[1.65, 0.28, 0.1], [1.67, 0.6, 0.12], [1.45, 0.8, 0.25], [0.65, 0.9, 0.08], [-1.55, 0.92, 0.08], [-1.66, 0.78, 0.08], [-1.65, 0.28, 0.08]],
    [[0.7, 0.86, 0], [0.25, 1.4, 0.1], [-1.25, 1.42, 0.12], [-1.52, 0.86, 0]],
    [[0.3, 1.37, 0], [0.22, 1.5, 0.06], [-1.27, 1.51, 0.06], [-1.38, 1.37, 0]], [-0.45]),
  van: {
    len: 5.0, w: 1.95, wheel: 0.36, axles: [-1.7, 1.65], lights: [0.85, 2.55, 0.95, -2.53], tall: true,
    parts: [
      { p: [[2.5, 0.35, 0.12], [2.53, 0.78, 0.15], [2.25, 1.08, 0.3], [1.62, 1.25, 0.12], [1.0, 2.08, 0.3], [-2.42, 2.14, 0.15], [-2.5, 0.35, 0.1]], w: 1.95, m: 'paint', arches: true, top: true },
      // windscreen and front side windows, standing proud of the body
      { p: [[1.71, 1.22, 0], [1.1, 2.03, 0], [0.3, 2.03, 0], [0.3, 1.2, 0]], w: 1.98, m: 'glass' },
    ],
    boxes: [[1.98, 1.25, 1.85, -2.2, -0.6, 'glass']],
  },
  // a Belgian police estate: white, with the blue and fluorescent yellow band and a light bar
  police: {
    len: 4.7, w: 1.84, wheel: 0.34, axles: [-1.5, 1.5], lights: [0.64, 2.39, 0.86, -2.38], livery: true,
    parts: [
      { p: [[2.35, 0.3, 0.12], [2.37, 0.62, 0.14], [2.1, 0.84, 0.3], [1.0, 0.96, 0.1], [-2.25, 0.98, 0.1], [-2.36, 0.82, 0.1], [-2.35, 0.3, 0.1]], w: 1.84, m: 0xf5f5f5, arches: true, top: true },
      { p: [[1.05, 0.92, 0], [0.35, 1.45, 0.1], [-2.0, 1.48, 0.1], [-2.25, 0.92, 0]], w: 1.64, m: 'glass', top: true },
      { p: [[0.4, 1.41, 0], [0.3, 1.53, 0.05], [-2.02, 1.55, 0.06], [-2.15, 1.41, 0]], w: 1.7, m: 0xf5f5f5, top: true },
    ],
    boxes: [
      [1.67, 0.92, 1.53, -0.26, -0.14, 0xf5f5f5], [1.67, 0.92, 1.53, -1.46, -1.34, 0xf5f5f5],
      [1.87, 0.5, 0.68, -2.2, 1.95, 0x0d47a1], [1.87, 0.68, 0.76, -2.2, 1.95, 0xd4e000], // the band
      [1.2, 1.55, 1.6, -0.75, -0.45, 0x263238], // the light bar
      [0.5, 1.6, 1.72, -0.72, -0.48, 'blue', -0.36], [0.5, 1.6, 1.72, -0.72, -0.48, 'blue', 0.36],
      [0.12, 1.6, 1.68, -0.72, -0.48, 0xeceff1],
    ],
  },
  // an orange bin lorry: a cab up front, the rubbish body behind it, three axles
  bins: {
    len: 8.6, w: 2.45, wheel: 0.52, axles: [-3.05, -1.8, 3.1], lights: [0.85, 4.37, 1.1, -4.32], tall: true, livery: true,
    parts: [
      { p: [[4.32, 0.55, 0.08], [4.35, 2.0, 0.12], [4.18, 2.9, 0.35], [2.35, 2.95, 0.1], [2.35, 0.55, 0]], w: 2.45, m: 0xf57c00, arches: true, top: true },
      { p: [[4.39, 2.0, 0], [4.24, 2.75, 0], [3.2, 2.75, 0], [3.2, 2.0, 0]], w: 2.47, m: 'glass' },
      { p: [[2.35, 0.55, 0], [2.35, 1.3, 0], [-4.2, 1.3, 0], [-4.2, 0.55, 0.05]], w: 2.3, m: 0x37474f, arches: true },
      { p: [[2.2, 1.28, 0.05], [2.2, 3.05, 0.2], [1.8, 3.25, 0.25], [-3.8, 3.25, 0.35], [-4.3, 2.6, 0.25], [-4.3, 1.28, 0.05]], w: 2.45, m: 0xf57c00, top: true },
    ],
    boxes: [
      [2.48, 2.05, 2.25, -3.9, 2.0, 0xf5f5f5], // a white band along the body
      [2.3, 0.55, 0.85, 4.25, 4.45, 0x263238], // the bumper
      [2.0, 1.4, 2.3, -4.42, -4.28, 0x263238], // the hopper's mouth
      [0.35, 2.95, 3.12, 2.9, 3.2, 'amber', -0.7], [0.35, 2.95, 3.12, 2.9, 3.2, 'amber', 0.7],
    ],
  },
  // a De Lijn city bus: white, yellow panels below the windows here and there, LIJN in grey on its
  // sides and nose, dark glass all along and at the back, the line's number lit over the
  // windscreen, two axles
  bus: {
    len: 12, w: 2.55, wheel: 0.5, axles: [-3.4, 3.2], lights: [0.75, 6.02, 0.95, -5.98], tall: true,
    parts: [
      { p: [[5.98, 0.32, 0.1], [6.04, 2.95, 0.3], [5.85, 3.12, 0.15], [-5.85, 3.12, 0.15], [-6, 2.9, 0.15], [-6, 0.32, 0.1]], w: 2.55, m: 0xf4f4f2, arches: true, top: true },
      { p: [[6.07, 0.95, 0], [6.07, 2.7, 0], [5.4, 2.7, 0], [5.4, 0.95, 0]], w: 2.42, m: 'glass' },
    ],
    boxes: [
      [2.57, 1.2, 2.7, -5.5, 5.0, 'glass'],             // the windows all along
      [2.1, 1.3, 2.65, -6.07, -5.98, 'glass'],          // the back window
      [2.58, 0.5, 1.2, 5.2, 5.97, 0xffc400],            // the yellow panels: by the nose,
      [2.58, 0.5, 1.2, -2.75, -1.55, 0xffc400],         // ahead of the back wheels
      [2.58, 0.5, 1.2, -5.95, -4.6, 0xffc400],          // and at the back corner
      [0.4, 0.35, 0.95, 5.95, 6.035, 0xffc400, 0.4],    // and one on the nose
      [2.56, 0.3, 0.5, -5.95, 5.97, 0x4a4f54],          // the skirt
      [1.9, 2.74, 2.98, 5.98, 6.08, 0x1c1c1c],          // the destination display
      [1.3, 2.79, 2.93, 6.05, 6.09, 0xffa000],          // its lit letters
      [2.6, 0.35, 2.7, 4.3, 5.2, 0x5d666d], [2.6, 0.35, 2.7, -0.6, 0.6, 0x5d666d], // the doors
      [1.9, 3.1, 3.42, -3.2, 0.4, 0xe2e2e0],            // the roof box
      ...lijn({ side: 1.3, z: 1.6, y: 0.68, h: 0.36 }), // between the middle door and the front wheels
      ...lijn({ side: 1.3, z: -5.27, y: 0.68, h: 0.36 }), // on the back corner's yellow
      ...lijn({ front: 6.04, x: -0.25, y: 0.6, h: 0.22 }),
    ],
  },
};
// a taxi: the saloon with a lit sign on its roof (only driving about, never parked)
CAR_TYPES.taxi = { ...CAR_TYPES.sedan, boxes: [...CAR_TYPES.sedan.boxes, [0.62, 1.46, 1.64, -0.5, -0.2, 0xffe36e]] };
for (const t of Object.values(CAR_TYPES)) {
  t.h = Math.max(...t.parts.flatMap(p => p.p.map(q => q[1])), ...t.boxes.map(b => b[2]));
}

const MIX = [['hatch', 0.3], ['sedan', 0.23], ['estate', 0.17], ['mini', 0.15], ['van', 0.11], ['police', 0.025], ['bins', 0.06]];
// Mostly greys and whites, like real streets; a bright colour now and then.
const COLORS = [
  0xf5f5f5, 0xfafafa, 0xeceff1, 0xe0e0e0, 0xcfd8dc, 0xbdbdbd, 0xb0bec5, 0x9e9e9e, 0x90a4ae, 0x757575,
  0x616161, 0x546e7a, 0x455a64, 0x37474f, 0x263238, 0x212121, 0xf5f5f5, 0xeceff1, 0x9e9e9e, 0x424242,
  0xd32f2f, 0x1565c0, 0xfdd835,
];

// A random vehicle type and colour; rand returns 0..1. low: true keeps to the ones low enough to
// ride over, short: true to the ones no longer than a car.
export function randomCar(rand, { low = false, short = false } = {}) {
  for (;;) {
    let k = rand();
    const type = (MIX.find(([, w]) => (k -= w) < 0) ?? MIX[0])[0], t = CAR_TYPES[type];
    if ((low && t.tall) || (short && t.len > 5)) continue;
    return { type, c: type === 'van' && rand() < 0.6 ? 0xf5f5f5 : COLORS[Math.floor(rand() * COLORS.length)] };
  }
}

// Height of the car's top u metres from its tail (0 beyond either end).
export function heightAt(type, u) {
  const t = CAR_TYPES[type], z = u - t.len / 2;
  let h = 0;
  for (const part of t.parts) {
    if (!part.top) continue;
    const p = part.p;
    for (let i = 0; i < p.length; i++) {
      const [z0, y0] = p[i], [z1, y1] = p[(i + 1) % p.length];
      if (z0 === z1 || z < Math.min(z0, z1) || z > Math.max(z0, z1)) continue;
      h = Math.max(h, y0 + ((z - z0) / (z1 - z0)) * (y1 - y0));
    }
  }
  return h;
}

// The outline of a profile, its corners rounded, the wheel arches cut out of the bottom edge.
export function outline(pts, arches, cy, R) {
  const n = pts.length, s = new THREE.Shape();
  const cs = pts.map(([x, y, r], i) => {
    const [px, py] = pts[(i + n - 1) % n], [nx, ny] = pts[(i + 1) % n];
    const a = Math.hypot(px - x, py - y), b = Math.hypot(nx - x, ny - y);
    const ka = Math.min(r, a / 2) / a, kb = Math.min(r, b / 2) / b;
    return { x, y, in: [x + (px - x) * ka, y + (py - y) * ka], out: [x + (nx - x) * kb, y + (ny - y) * kb] };
  });
  const turn = c => { s.lineTo(...c.in); s.quadraticCurveTo(c.x, c.y, ...c.out); };
  s.moveTo(...cs[0].out);
  for (let i = 1; i < n; i++) turn(cs[i]);
  const y0 = pts[0][1];
  for (const z of arches) {
    if (z - R < pts[n - 1][0] || z + R > pts[0][0]) continue; // this axle is under another part
    s.lineTo(z - R, y0);
    s.absarc(z, cy, R, Math.PI, 0, true);
    s.lineTo(z + R, y0);
  }
  turn(cs[0]);
  return s;
}

const BEVEL = 0.04;
// A profile pulled out across width w, centred on x = 0, its long edges rounded off (bevel).
export function slab(shape, w, bevel = true) {
  const b = bevel ? BEVEL : 0, d = w - 2 * b;
  return new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bevel, bevelThickness: b, bevelSize: b * 0.6, bevelSegments: 1, curveSegments: 3 })
    .rotateY(-Math.PI / 2).translate(d / 2, 0, 0);
}
export const boxGeo = (w, y0, y1, z0, z1) => new THREE.BoxGeometry(w, y1 - y0, z1 - z0).translate(0, (y0 + y1) / 2, (z0 + z1) / 2);

// Geometry in a vertex colour, ready to merge. painted: it takes each car's own paint colour.
export function tinted(geo, hex, painted = false) {
  const g = geo.index ? geo.toNonIndexed() : geo, c = new THREE.Color(hex), n = g.attributes.position.count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  g.setAttribute('carPaint', new THREE.BufferAttribute(new Float32Array(n).fill(painted ? 1 : 0), 1));
  return g;
}

// One material for a whole vehicle: the parts in vertex colours, and where a part is painted
// (carPaint 1) each instance's own colour on top. One draw call per type instead of one per part.
const CAR_MAT = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.2, vertexColors: true });
CAR_MAT.customProgramCacheKey = () => 'carPaint';
CAR_MAT.onBeforeCompile = sh => {
  liftShader(sh);
  sh.vertexShader = 'attribute float carPaint;\n' + sh.vertexShader.replace('#include <color_vertex>',
    THREE.ShaderChunk.color_vertex.replace('vColor.xyz *= instanceColor.xyz;', 'vColor.xyz *= mix(vec3(1.0), instanceColor.xyz, carPaint);'));
};
// the flashing lights on police cars and bin lorries, in their own colours
const BEACON_MAT = new THREE.MeshBasicMaterial({ vertexColors: true });
const GLASS = 0x1f2b38, BEACONS = { blue: 0x2a4bff, amber: 0xffa000 };

// Call it every frame, for the flashing lights.
export function flashBeacons() {
  BEACON_MAT.color.setScalar(Math.floor(performance.now() / 330) % 2 ? 1 : 0.25);
}

// Every vehicle type's geometry: near (all of it, merged), beacons (or null) and far (a few boxes,
// for out in the distance).
const built = {};
function geometry(type) {
  if (built[type]) return built[type];
  const t = CAR_TYPES[type], near = [], beacons = [], far = [];
  const add = (m, geo) => (BEACONS[m] ? beacons : near).push(tinted(geo, m === 'paint' ? 0xffffff : m === 'glass' ? GLASS : BEACONS[m] ?? m, m === 'paint'));
  const R = t.wheel + 0.07;
  for (const part of t.parts) {
    add(part.m, slab(outline(part.p, part.arches ? t.axles : [], t.wheel, R), part.w, part.m !== 'glass'));
    const zs = part.p.map(q => q[0]), ys = part.p.map(q => q[1]);
    far.push(tinted(boxGeo(part.w, Math.min(...ys), Math.max(...ys), Math.min(...zs), Math.max(...zs)), part.m === 'paint' ? 0xffffff : part.m === 'glass' ? GLASS : part.m, part.m === 'paint'));
  }
  for (const [w, y0, y1, z0, z1, m, x = 0] of t.boxes) add(m, boxGeo(w, y0, y1, z0, z1).translate(x, 0, 0));
  // the wheels: a tyre and a hub cap, inside the arches
  const xw = t.w / 2 - 0.14;
  for (const z of t.axles) for (const s of [-1, 1]) {
    add(0x1e1e1e, new THREE.CylinderGeometry(t.wheel, t.wheel, 0.24, 10, 1, true).rotateZ(Math.PI / 2).translate(s * xw, t.wheel, z));
    add(0x1e1e1e, new THREE.CircleGeometry(t.wheel, 10).rotateY(s * Math.PI / 2).translate(s * (xw + 0.12), t.wheel, z));
    add(0xb0b5ba, new THREE.CircleGeometry(t.wheel * 0.6, 10).rotateY(s * Math.PI / 2).translate(s * (xw + 0.125), t.wheel, z));
  }
  const [fy, fz, ry, rz] = t.lights;
  for (const s of [-1, 1]) {
    add(0xfffbe6, boxGeo(0.34, fy - 0.07, fy + 0.07, fz - 0.03, fz + 0.03).translate(s * t.w * 0.33, 0, 0));
    add(0xe00000, boxGeo(0.3, ry - 0.06, ry + 0.06, rz - 0.03, rz + 0.03).translate(s * t.w * 0.36, 0, 0));
  }
  return (built[type] = { near: mergeGeometries(near), beacons: beacons.length ? mergeGeometries(beacons) : null, far: mergeGeometries(far) });
}

// One vehicle as a group of meshes (for a car standing on its own, like an obstacle).
export function carGroup(type, color) {
  const g = new THREE.Group(), geo = geometry(type), body = geo.near.clone();
  // bake the paint colour into the vertex colours
  const col = body.attributes.color, paint = body.attributes.carPaint, c = new THREE.Color(color);
  for (let i = 0; i < col.count; i++) if (paint.getX(i)) col.setXYZ(i, c.r, c.g, c.b);
  for (const [gm, m] of [[body, CAR_MAT], [geo.beacons, BEACON_MAT]]) {
    if (!gm) continue;
    const mesh = new THREE.Mesh(gm, m);
    mesh.castShadow = mesh.receiveShadow = true;
    g.add(mesh);
  }
  return g;
}

// Instanced meshes for up to count vehicles of one type that move about (see traffic.js): near (the
// full model), beacons (or null) and far (a few boxes). Each starts with none shown (count 0).
export function carInstances(type, count) {
  const geo = geometry(type), white = new THREE.Color(0xffffff);
  const make = (gm, m, shadow) => {
    if (!gm) return null;
    const im = new THREE.InstancedMesh(gm, m, count);
    if (m === CAR_MAT) for (let i = 0; i < count; i++) im.setColorAt(i, white);
    im.frustumCulled = false; // they move about
    im.castShadow = shadow;
    im.receiveShadow = true;
    im.count = 0;
    return im;
  };
  return { near: make(geo.near, CAR_MAT, true), beacons: make(geo.beacons, BEACON_MAT, false), far: make(geo.far, CAR_MAT, false) };
}

const CHUNK = 150, DETAIL = 170, GONE = 620 * SIGHT + 140; // metres: past the fog (a phone's is closer)
// Many vehicles at once, instanced per type, in chunks of the map: each chunk shows the full
// models up close, boxes further off, and nothing beyond the fog. cars: [{x, z, yaw, type, c}]
export function addCars(group, cars) {
  const d = new THREE.Object3D(), chunks = new Map();
  for (const c of cars) {
    const k = `${Math.floor(c.x / CHUNK)},${Math.floor(c.z / CHUNK)}`;
    if (!chunks.has(k)) chunks.set(k, []);
    chunks.get(k).push(c);
  }
  for (const list of chunks.values()) {
    const cx = list.reduce((s, c) => s + c.x, 0) / list.length, cz = list.reduce((s, c) => s + c.z, 0) / list.length;
    const lod = new THREE.LOD(), near = new THREE.Group(), far = new THREE.Group();
    lod.position.set(cx, 0, cz);
    for (const type of Object.keys(CAR_TYPES)) {
      const these = list.filter(c => c.type === type);
      if (!these.length) continue;
      const geo = geometry(type);
      for (const [parent, gm, m] of [[near, geo.near, CAR_MAT], [near, geo.beacons, BEACON_MAT], [far, geo.far, CAR_MAT]]) {
        if (!gm) continue;
        const im = new THREE.InstancedMesh(gm, m, these.length);
        these.forEach((c, i) => {
          d.position.set(c.x - cx, c.y ?? 0, c.z - cz);
          d.rotation.set(0, c.yaw, 0);
          d.updateMatrix();
          im.setMatrixAt(i, d.matrix);
          if (m === CAR_MAT) im.setColorAt(i, new THREE.Color(c.c ?? 0xffffff));
        });
        im.castShadow = im.receiveShadow = true;
        parent.add(im);
      }
    }
    lod.addLevel(near, 0);
    lod.addLevel(far, DETAIL);
    lod.addLevel(new THREE.Group(), GONE);
    group.add(lod);
  }
}
