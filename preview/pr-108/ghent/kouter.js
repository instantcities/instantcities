// The Kouter's car park, drawn closer to life. The map has two low boxes on the square and the
// ways in and out as flat little streets; they are:
//  - the two glass pavilions over the stairs and the lift down to Parking Kouter, one by the way
//    out at the square's east end and one by the way in at its west end: a box of glass in a slim
//    dark frame under a flat white roof, the lift's grey shaft inside, a blue P on the fascia. They
//    join the statues (ghent/monuments.js) in place of the map's boxes, on their outlines.
//  - the ramps: hollows (core/js/hollows.js) along the map's little one-way streets, from the level
//    of the square down to the car park's mouth (as at Dok Noord, ghent/doknoord.js): the way out
//    east of the bandstand, the way in from the Kouter's west side. Nobody parks on them.
import * as THREE from 'three';
import { MAP } from './map.js';
import { Kit, kitMat } from '../core/js/kit.js';
import { lineHollow } from '../core/js/hollows.js';

// ---- the ramps ---------------------------------------------------------------------------------

// Each ramp from the street (where it is level with the square) down to its end, along the map's
// little one-way street (`map`: its points as the map has them, the way the cars drive): at the east
// end the way out, at the west end the way in, from the Kouter's west side. `top` and `foot`: where
// it starts and stops sloping, metres along it; `half` how far its walls stand out from its middle.
const RAMPS = [
  { id: 'kouter-ramp', p: [95.2, 448, 66.9, 451.6], map: [66.9, 451.6, 95.2, 448], half: 3, top: 1.5, foot: 19.5 },
  // narrower, past the glass pavilion's south front
  { id: 'kouter-inrit', p: [-98.2, 475.1, -82.9, 472.2, -53.8, 466.7], map: [-98.2, 475.1, -82.9, 472.2, -53.8, 466.7], half: 2.75, top: 14, foot: 34 },
].map(r => {
  const at = [0];
  for (let k = 2; k < r.p.length; k += 2) at.push(at.at(-1) + Math.hypot(r.p[k] - r.p[k - 2], r.p[k + 1] - r.p[k - 1]));
  const ux = (r.p.at(-2) - r.p.at(-4)) / (at.at(-1) - at.at(-2)), uz = (r.p.at(-1) - r.p.at(-3)) / (at.at(-1) - at.at(-2));
  return { ...r, len: at.at(-1), at, ux, uz, end: at.at(-1) - 0.4 }; // ux, uz: the way down its last stretch
});
const DOWN = 3.0;
// the ramp's middle line from its start to s metres along it
function upTo(r, s) {
  const q = [r.p[0], r.p[1]];
  for (let k = 1; k < r.at.length; k++) {
    if (r.at[k] < s) { q.push(r.p[2 * k], r.p[2 * k + 1]); continue; }
    const f = (s - r.at[k - 1]) / (r.at[k] - r.at[k - 1]);
    q.push(r.p[2 * k - 2] + (r.p[2 * k] - r.p[2 * k - 2]) * f, r.p[2 * k - 1] + (r.p[2 * k + 1] - r.p[2 * k - 1]) * f);
    break;
  }
  return q;
}
const point = (r, s) => upTo(r, s).slice(-2);
// The street on it: nobody parks on it, and it stops a little way out from the mouth, with its
// round end (as wide as its kerbs) on the ramp's floor, not up on the square past the end wall.
const STOP = 4;
const rampOf = rd => !rd.foot && RAMPS.find(r => rd.p.length === r.map.length && rd.p.every((v, k) => Math.abs(v - r.map[k]) < 0.5));
export const onRamp = rd => !!rampOf(rd);
export const rampRoad = rd => {
  const r = rampOf(rd), q = upTo(r, r.end - STOP);
  const flip = Math.hypot(r.map[0] - r.p[0], r.map[1] - r.p[1]) > 0.5; // the map has it up the ramp
  return { ...rd, nc: 1, p: flip ? q.flatMap((v, k) => (k % 2 ? [] : [q[q.length - 2 - k], q[q.length - 1 - k]])) : q };
};
const slope = r => s => -DOWN * Math.max(0, Math.min(1, (s - r.top) / (r.foot - r.top)));
export const HOLLOWS = RAMPS.map(r => lineHollow({ id: r.id, name: 'Parking Kouter', p: r.p, s1: r.end, reach: r.half, cell: 0.25, depth: slope(r) }));

// the car parks' mouths on the ramps' floors, just out from the end wall, and which way is up the
// ramp from each (portals, ghent/city.js)
export const MOUTHS = RAMPS.map(r => { const [x, z] = point(r, r.end - 1); return { x, z, yaw: Math.atan2(-r.ux, -r.uz) }; });

// the car park's mouth in the ramp's end wall: a dark opening under a concrete lintel, its blue
// sign, and the yellow bar for the height under it. Its own metres: x across the ramp, +z out up
// the ramp.
function rampMouth(w) {
  const g = new THREE.Group();
  const plane = (pw, ph, y, z, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat); m.position.set(0, y, z); g.add(m); return m; };
  plane(w - 1.2, 2.45, -DOWN + 1.225, 0, new THREE.MeshBasicMaterial({ color: 0x101214 }));
  plane(w, 0.6, -0.3, 0.01, new THREE.MeshStandardMaterial({ color: 0xb4b1a9, roughness: 1 }));
  const c = document.createElement('canvas');
  c.width = 256; c.height = 32;
  const x = c.getContext('2d');
  x.fillStyle = '#1f4fa3'; x.fillRect(0, 0, 256, 32);
  x.fillStyle = '#fff'; x.fillRect(4, 3, 26, 26);
  x.fillStyle = '#1f4fa3'; x.font = 'bold 24px sans-serif'; x.textBaseline = 'middle'; x.fillText('P', 9, 17);
  x.fillStyle = '#fff'; x.font = 'bold 18px sans-serif'; x.fillText('KOUTER', 52, 17);
  const sign = new THREE.CanvasTexture(c);
  sign.colorSpace = THREE.SRGBColorSpace;
  plane(3.6, 0.45, -0.3, 0.02, new THREE.MeshBasicMaterial({ map: sign }));
  const bar = new THREE.Mesh(new THREE.BoxGeometry(w - 1.2, 0.16, 0.1), new THREE.MeshStandardMaterial({ color: 0xe0b020, roughness: 0.6 }));
  bar.position.set(0, -0.68, 0.08);
  g.add(bar);
  return g;
}

// ---- the glass pavilions -----------------------------------------------------------------------

// the map's box, found by its middle
function outline(x, z) {
  let best = null, dist = Infinity;
  for (const b of MAP.buildings) {
    const n = b.p.length / 2;
    let cx = 0, cz = 0;
    for (let k = 0; k < n; k++) { cx += b.p[2 * k] / n; cz += b.p[2 * k + 1] / n; }
    const d = Math.hypot(cx - x, cz - z);
    if (d < dist) { dist = d; best = b.p; }
  }
  return best;
}

const H = 3.3; // up to the roof
// w along, d across, its own metres; the door in the -z side (onto the square), at x = door
function glassPavilion(w, d, door) {
  const g = new THREE.Group(), k = new Kit(), FRAME = 0x2b2f33;
  // the stone plinth, and the lift's grey shaft at the far end from the door, up through the roof
  k.box(w + 0.2, 0.12, d + 0.2, 0xa7a59f, 0, 0.06, 0);
  const lx = -Math.sign(door || 1) * (w / 2 - 1.5);
  k.box(2.2, H + 0.5, 2.2, 0x7d8185, lx, (H + 0.5) / 2, 0);
  k.box(1.0, 2.1, 0.04, 0x9aa3a8, lx, 1.17, -1.12); // its doors
  // the stairs' railing going down, along the middle
  for (const z of [-0.5, 0.5]) k.box(w / 2.2, 0.05, 0.05, 0x9aa3a8, -lx * 0.3, 1.0, z);
  // the frame: posts every metre and a bit, rails at the foot, at the transom and at the top
  for (const side of [-1, 1]) {
    const nx = Math.round(w / 1.2), nz = Math.round(d / 1.2);
    for (let i = 0; i <= nx; i++) k.box(0.08, H - 0.12, 0.08, FRAME, -w / 2 + (i * w) / nx, H / 2 + 0.06, side * d / 2);
    for (let i = 1; i < nz; i++) k.box(0.08, H - 0.12, 0.08, FRAME, side * w / 2, H / 2 + 0.06, -d / 2 + (i * d) / nz);
    for (const y of [0.16, 2.4]) {
      k.box(w, 0.08, 0.08, FRAME, 0, y, side * d / 2);
      k.box(0.08, 0.08, d, FRAME, side * w / 2, y, 0);
    }
  }
  // the door: a heavier frame and a push bar
  k.box(1.9, 0.12, 0.12, FRAME, door, 2.3, -d / 2);
  for (const x of [-0.95, 0, 0.95]) k.box(0.1, 2.2, 0.12, FRAME, door + x, 1.2, -d / 2);
  for (const x of [-0.45, 0.45]) k.box(0.6, 0.04, 0.06, 0xc9cdd0, door + x, 1.05, -d / 2 - 0.08);
  // the flat roof, with a deep white fascia
  k.box(w + 0.6, 0.35, d + 0.6, 0xe8e8e4, 0, H + 0.12, 0);
  // blue P signs on the fascia, on the long sides
  for (const side of [-1, 1]) {
    k.box(0.5, 0.5, 0.04, 0x1f4fa3, -lx, H + 0.12, side * (d / 2 + 0.32));
    k.box(0.12, 0.34, 0.05, 0xffffff, -lx - 0.08, H + 0.12, side * (d / 2 + 0.32));
    k.box(0.16, 0.16, 0.05, 0xffffff, -lx + 0.04, H + 0.2, side * (d / 2 + 0.32));
  }
  g.add(k.mesh(kitMat(0.5, 0.2)));
  // the glass all round, seen through
  const glass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, H - 0.2, d - 0.04).translate(0, H / 2 + 0.03, 0),
    new THREE.MeshStandardMaterial({ color: 0x9fc0cc, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.32, depthWrite: false }));
  glass.receiveShadow = true;
  g.add(glass);
  return g;
}

// the east one beside the ramp, along it: its side onto the ramp just clear of the ramp's wall,
// the door to the north; the west one on the map's outline, by the Schouwburgstraat
const [OUT] = RAMPS, along = (s, off) => [OUT.p[0] + OUT.ux * s - OUT.uz * off, OUT.p[1] + OUT.uz * s + OUT.ux * off]; // off: metres north of its middle
const TURN = Math.atan2(OUT.uz, -OUT.ux); // the pavilion's x east along the ramp
const [EX, EZ] = along(11.5, 6.45);

export const KOUTER = [
  { id: 'parking-kouter-oost', name: 'Parking Kouter', x: EX, z: EZ, turn: TURN, size: [12, 6.2], area: [outline(83.5, 443.8)], make: () => glassPavilion(12, 6.2, 3.6) },
  { id: 'parking-kouter-west', x: -71.9, z: 462.9, turn: 0.12, size: [12, 7.7], area: [outline(-71.9, 462.9)], make: () => glassPavilion(12, 7.7, 1.2) },
  // the mouths stand in the ramps' end walls: nothing to bump into but the wall
  ...RAMPS.map((r, k) => {
    const [x, z] = point(r, r.end - 0.5);
    return { id: `parking-kouter-mond-${k + 1}`, x, z, turn: Math.atan2(-r.ux, -r.uz), size: 0.2, foot: [], make: () => rampMouth(2 * r.half - 0.6) };
  }),
];
