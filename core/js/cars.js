import * as THREE from 'three';
import { SIGHT } from './device.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { liftShader } from './terrain.js';
import { TRAFFIC } from './city.js';

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

// The vehicles a city is known for, which only drive where its TRAFFIC asks for them (<city>/city.js).
// colors: the paints it comes in, if not the usual greys and whites.
// London's black cab: tall and upright, a rounded bonnet, the amber TAXI sign on the roof
CAR_TYPES.cab = car(4.58, 1.88, 0.35, [-1.45, 1.42], [0.78, 2.3, 0.86, -2.26],
  [[2.25, 0.32, 0.16], [2.3, 0.8, 0.26], [2.02, 1.04, 0.38], [1.15, 1.1, 0.1], [-2.1, 1.12, 0.2], [-2.27, 0.88, 0.14], [-2.26, 0.32, 0.1]],
  [[1.16, 1.07, 0], [0.98, 1.76, 0.1], [-1.95, 1.8, 0.14], [-2.14, 1.08, 0]],
  [[1.0, 1.72, 0], [0.92, 1.9, 0.12], [-1.95, 1.92, 0.14], [-2.06, 1.72, 0]], [0.1, -1.0],
  { colors: [0x141414, 0x141414, 0x141414, 0x1d2a3a, 0x5a1720] });
CAR_TYPES.cab.boxes.push([0.5, 1.92, 2.06, 0.55, 0.8, 0xffb300], [0.72, 0.42, 0.86, 2.27, 2.33, 0xc0c4c8]); // the TAXI sign and the chrome grille
// London's red double-decker: two rows of windows all along, the route number lit over the windscreen
CAR_TYPES.double = {
  len: 10.6, w: 2.52, wheel: 0.5, axles: [-3.1, 3.4], lights: [0.75, 5.32, 0.95, -5.28], tall: true, colors: [0xc8102e],
  parts: [{ p: [[5.25, 0.32, 0.1], [5.32, 4.12, 0.4], [-5.15, 4.2, 0.4], [-5.3, 0.32, 0.1]], w: 2.52, m: 'paint', arches: true, top: true }],
  boxes: [
    [2.54, 1.25, 2.2, -4.8, 4.5, 'glass'], [2.54, 2.75, 3.75, -4.95, 4.95, 'glass'], // the two decks' windows
    [2.2, 1.15, 2.25, 5.22, 5.33, 'glass'], [2.2, 2.8, 3.8, 5.18, 5.33, 'glass'],   // the windscreen and the top deck's front
    [2.1, 1.3, 2.2, -5.33, -5.25, 'glass'], [2.1, 2.8, 3.75, -5.33, -5.2, 'glass'], // and the back
    [1.9, 2.32, 2.66, 5.26, 5.36, 0x1c1c1c], [1.2, 2.4, 2.58, 5.34, 5.37, 0xffa000], // the destination display
    [2.55, 0.3, 0.52, -5.25, 5.28, 0x3a3a3a], [2.6, 0.35, 2.25, 3.6, 4.5, 0x4a4f54], // the skirt and the door
  ],
};
// a Vespa and its rider (the paint is the scooter's and the helmet's): narrow, one wheel at each end
CAR_TYPES.vespa = {
  len: 1.85, w: 0.28, wheel: 0.24, axles: [-0.62, 0.64], lights: [0.95, 0.94, 0.62, -0.93], short: true,
  colors: [0x8ec9c0, 0xd32f2f, 0xf5f0e1, 0x9ccc65, 0x1565c0, 0xf5f5f5, 0x546e7a, 0xffca28],
  parts: [
    { p: [[0.92, 0.26, 0.05], [0.96, 0.6, 0.1], [0.8, 1.02, 0.05], [0.66, 1.04, 0], [0.58, 0.42, 0.05], [-0.18, 0.4, 0.05], [-0.42, 0.74, 0.15], [-0.9, 0.7, 0.15], [-0.93, 0.26, 0.08]], w: 0.62, m: 'paint', arches: true, top: true },
  ],
  boxes: [
    [0.66, 1.04, 1.09, 0.6, 0.68, 0x222222],                   // the handlebar
    [0.4, 0.74, 0.82, -0.78, -0.12, 0x3b2a1e],                 // the seat
    [0.38, 0.5, 0.86, -0.32, 0.3, 0x2b3a55],                   // the rider's legs, feet on the floor
    [0.42, 0.86, 1.46, -0.5, -0.16, 0x37474f],                 // the jacket
    [0.1, 1.1, 1.2, -0.26, 0.62, 0x37474f, -0.22], [0.1, 1.1, 1.2, -0.26, 0.62, 0x37474f, 0.22], // the arms, out to the handlebar
    [0.24, 1.46, 1.66, -0.44, -0.2, 0xf1c9a5],                 // the face
    [0.3, 1.58, 1.82, -0.48, -0.14, 'paint'],                  // the helmet
  ],
};
// the Fiat 500 of the 1960s: tiny and round
CAR_TYPES.cinquecento = car(2.97, 1.32, 0.27, [-0.92, 0.92], [0.6, 1.5, 0.66, -1.5],
  [[1.47, 0.26, 0.1], [1.5, 0.56, 0.16], [1.3, 0.74, 0.28], [0.6, 0.82, 0.1], [-1.25, 0.84, 0.25], [-1.49, 0.6, 0.14], [-1.48, 0.26, 0.08]],
  [[0.64, 0.8, 0], [0.25, 1.24, 0.12], [-0.85, 1.26, 0.14], [-1.15, 0.82, 0]],
  [[0.28, 1.2, 0], [0.18, 1.32, 0.08], [-0.85, 1.33, 0.1], [-0.95, 1.2, 0]], [],
  { colors: [0xf5f0e1, 0x8ec9c0, 0xd32f2f, 0xffca28, 0x90caf9, 0xf5f5f5, 0x2e7d32] });
// the East German Trabant: small, boxy and plastic, in pastels
CAR_TYPES.trabant = car(3.56, 1.5, 0.29, [-1.0, 1.02], [0.6, 1.78, 0.72, -1.78],
  [[1.78, 0.28, 0.08], [1.8, 0.62, 0.1], [1.6, 0.78, 0.1], [0.65, 0.84, 0.05], [-1.7, 0.86, 0.06], [-1.78, 0.7, 0.06], [-1.78, 0.28, 0.06]],
  [[0.7, 0.82, 0], [0.25, 1.32, 0.05], [-1.2, 1.33, 0.05], [-1.45, 0.84, 0]],
  [[0.3, 1.3, 0], [0.25, 1.4, 0.03], [-1.2, 1.41, 0.03], [-1.3, 1.3, 0]], [-0.45],
  { colors: [0xd7ccc8, 0x90caf9, 0xa5d6a7, 0xf5f5f5, 0xffe082, 0xef9a9a] });
// the Citroën 2CV: a tall rounded roof, the bonnet sloping away in front
CAR_TYPES.deuxcv = car(3.83, 1.48, 0.33, [-1.2, 1.18], [0.78, 1.9, 0.72, -1.9],
  [[1.88, 0.3, 0.1], [1.92, 0.62, 0.16], [1.5, 0.92, 0.35], [0.7, 1.0, 0.08], [-1.4, 0.96, 0.35], [-1.9, 0.62, 0.2], [-1.9, 0.3, 0.08]],
  [[0.75, 0.98, 0], [0.45, 1.48, 0.12], [-0.95, 1.52, 0.25], [-1.45, 0.98, 0]],
  [[0.48, 1.44, 0], [0.38, 1.58, 0.12], [-0.9, 1.6, 0.3], [-1.2, 1.3, 0]], [-0.25],
  { colors: [0x5d4037, 0xf5f0e1, 0x90a4ae, 0xd32f2f, 0xffca28, 0x1e3a5f] });
for (const t of Object.values(CAR_TYPES)) {
  t.h = Math.max(...t.parts.flatMap(p => p.p.map(q => q[1])), ...t.boxes.map(b => b[2]));
}

// the usual mix of vehicles, and what the city adds to it (its TRAFFIC.mix: [type, weight], e.g.
// Rome's Vespas and London's double-deckers)
const MIX = [['hatch', 0.3], ['sedan', 0.23], ['estate', 0.17], ['mini', 0.15], ['van', 0.11], ['police', 0.025], ['bins', 0.06], ...(TRAFFIC?.mix ?? [])];
const MIX_TOTAL = MIX.reduce((t, [, w]) => t + w, 0);
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
    let k = rand() * MIX_TOTAL;
    const type = (MIX.find(([, w]) => (k -= w) < 0) ?? MIX[0])[0], t = CAR_TYPES[type];
    if ((low && t.tall) || (short && t.len > 5)) continue;
    const colors = t.colors ?? COLORS;
    return { type, c: type === 'van' && rand() < 0.6 ? 0xf5f5f5 : colors[Math.floor(rand() * colors.length)] };
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
