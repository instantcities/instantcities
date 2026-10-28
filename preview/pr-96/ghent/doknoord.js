// Dok Noord, the old harbour works on the Sassevaartstraat, drawn closer to life (Google Street View,
// October 2024). Two things the map leaves flat:
//  - Sassevaartstraat 44 (Route du Soleil, Travelbase on the ground floor), an old brick hall: one
//    tall gabled front to the street with a great round window over a glazed arch, a bay either
//    side with a blind arch and a little round window, orange brick bands round each opening and
//    in the gable, bluestone at its foot. The map has it as one low storey; it joins the statues
//    (ghent/monuments.js) in place of that box, on the same outline.
//  - the ramp down to the car park under Dok Noord's square, in the passage between that hall and
//    the Dok Noord building: a hollow (core/js/hollows.js) sloping down to the car park's mouth.
import * as THREE from 'three';
import { MAP } from './map.js';
import { elevation, brick, rng, shade, letGo } from '../core/js/facades.js';
import { Kit, kitMat } from '../core/js/kit.js';

// ---- The street ------------------------------------------------------------------------------

// The map has the Sassevaartstraat without its name, and in asphalt: the stretch in front of the
// hall and the bend up to the Muidelaan, both cobbled. They are known by their ends.
export const STREET_NAME = 'Sassevaartstraat';
const STRETCHES = [[737.3, -1937.3, 703.5, -1935.1], [737.9, -1935.1, 729.3, -1964]];
export const onSassevaartstraat = rd => rd.n === undefined && !rd.foot
  && STRETCHES.some(([ax, az, bx, bz]) => Math.hypot(rd.p[0] - ax, rd.p[1] - az) < 0.5 && Math.hypot(rd.p.at(-2) - bx, rd.p.at(-1) - bz) < 0.5);

// Behind the hall, between it and Dok Noord's square, it is an open lawn, a tree or two at its edges.
export const GRASS = { k: 'green', p: [712, -1912.5, 720.4, -1912.5, 720.4, -1903.8, 732.3, -1903.8, 732.3, -1876.5, 722, -1873, 721.5, -1853.5, 712, -1853.5] };
export const GRASS_TREES = [730.8, -1878, 715, -1862];

// ---- Sassevaartstraat 44 ----------------------------------------------------------------------

// the map's outline (Travelbase's shop sits on it), found by its middle
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
const FOOT = outline(721, -1916);
// Its front on the street is the outline's first side, from its north-west corner to its north-east
// one; the hall runs back from it to where the outline steps in, and a lower wing goes on behind
// that on the east half.
const [WX, WZ, EX, EZ] = FOOT.slice(0, 4);
const W = Math.hypot(EX - WX, EZ - WZ), ALONG = Math.atan2(EZ - WZ, EX - WX);
const X = (WX + EX) / 2, Z = (WZ + EZ) / 2;
const [BWX, BWZ] = FOOT.slice(-2); // the hall's back corner on the west
const BACK = FOOT[9]; // where the outline steps in: the hall's back wall
const east = z => EX + ((FOOT[4] - EX) * (z - EZ)) / (FOOT[5] - EZ); // the east wall, at z
const HALL = [WX, WZ, EX, EZ, east(BACK), BACK, FOOT[8], FOOT[9], BWX, BWZ];
const WING = [FOOT[8], FOOT[9], east(BACK), BACK, FOOT[4], FOOT[5], FOOT[6], FOOT[7]];

// The front, in metres across it (0 in the middle, as you look at it: + to the right, the west) and
// up. The gable's two slopes run up from shoulders over the corner piers to a pier in the middle.
const H = 19.3, PIER = 14.8, SHOULDER = 14.3, PEAK = 18.3, CAP = 19.2, MID = 1;
const pitch = (PEAK - SHOULDER) / (W / 2 - 0.9 - MID);
const coping = f => SHOULDER + (W / 2 - 0.9 - Math.abs(f)) * pitch; // the top of the gable, at f
const EAVE = coping(W / 2) - 0.35, RIDGE = coping(0) - 0.35; // the roof, just under it
const SILHOUETTE = [
  [-W / 2, 0], [W / 2, 0], [W / 2, PIER], [W / 2 - 0.9, PIER], [W / 2 - 0.9, SHOULDER], [MID, PEAK], [MID, CAP],
  [-MID, CAP], [-MID, PEAK], [-W / 2 + 0.9, SHOULDER], [-W / 2 + 0.9, PIER], [-W / 2, PIER],
];

const BRICK = '#7b4536', BAND = '#b0603c', STONE = '#8e9194', GLASS = '#1c2329', FRAME = '#16191b';
const ARCH = { w: 7.6, spring: 5.0 }, OCULUS = { y: 12.0, r: 1.95 };

// dark purple and brown headers through the red, as the old brick is
function oldBrick(g, x0, y0, x1, y1, seed) {
  brick(g, x0, y0, x1, y1, BRICK, { course: 0.2, seed });
  const r = rng(seed + 7);
  for (let i = 0; i < (x1 - x0) * (y1 - y0) * 2.2; i++) {
    g.fillStyle = ['#5a3434', '#6b3a2e', '#93553f', '#4f3a3d'][i % 4];
    g.globalAlpha = 0.55;
    g.fillRect(x0 + r() * (x1 - x0), y0 + Math.floor(r() * (y1 - y0) / 0.2) * 0.2 + 0.02, 0.27, 0.16);
  }
  g.globalAlpha = 1;
}

// a ring of orange brick on edge round an opening: an arch's head, or all the way round
function ringBand(g, cx, cy, r, w, from = 0, to = Math.PI * 2) {
  g.strokeStyle = BAND;
  g.lineWidth = w;
  g.beginPath(); g.arc(cx, cy, r + w / 2, from, to); g.stroke();
  g.strokeStyle = shade(BAND, -0.3); // the joints between the bricks on edge
  g.lineWidth = 0.025;
  const n = Math.round(((to - from) * (r + w / 2)) / 0.13);
  g.beginPath();
  for (let k = 0; k <= n; k++) {
    const a = from + ((to - from) * k) / n;
    g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    g.lineTo(cx + Math.cos(a) * (r + w), cy + Math.sin(a) * (r + w));
  }
  g.stroke();
}

// a round window: the band, pale glass with the sky in it, iron bars like a spider's web
function roundWindow(g, cx, cy, r, spokes) {
  ringBand(g, cx, cy, r, Math.max(0.3, r * 0.22));
  const sky = g.createLinearGradient(cx - r, cy + r, cx + r, cy - r);
  sky.addColorStop(0, '#5f86b8'); sky.addColorStop(0.55, '#a9c3df'); sky.addColorStop(1, '#e6eef5');
  g.fillStyle = sky;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#2b2e31';
  g.lineWidth = Math.max(0.05, r * 0.045);
  g.beginPath();
  for (let k = 0; k < spokes; k++) {
    const a = (k / spokes) * Math.PI * 2;
    g.moveTo(cx + Math.cos(a) * r * 0.22, cy + Math.sin(a) * r * 0.22);
    g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  for (const f of r > 1 ? [0.22, 0.48, 0.75] : [0.3, 0.65]) { g.moveTo(cx + r * f, cy); g.arc(cx, cy, r * f, 0, Math.PI * 2); }
  g.stroke();
}

// a blind round arch in a side bay: a recess of darker brick, the band over it, a stone sill and
// stone blocks where the arch springs
function blindArch(g, cx, y0, w, h, seed) {
  const spring = y0 + h - w / 2;
  g.save();
  g.beginPath();
  g.moveTo(cx - w / 2, y0); g.lineTo(cx - w / 2, spring); g.arc(cx, spring, w / 2, Math.PI, 0, true); g.lineTo(cx + w / 2, y0);
  g.closePath();
  g.clip();
  oldBrick(g, cx - w / 2, y0, cx + w / 2, y0 + h, seed);
  g.fillStyle = 'rgba(20, 10, 8, 0.28)';
  g.fillRect(cx - w / 2, y0, w, h);
  g.restore();
  ringBand(g, cx, spring, w / 2, 0.32, 0, Math.PI);
  g.fillStyle = STONE;
  g.fillRect(cx - w / 2 - 0.25, y0 - 0.22, w + 0.5, 0.26);
  for (const s of [-1, 1]) g.fillRect(cx + s * (w / 2 + 0.16) - 0.3, spring - 0.25, 0.6, 0.32);
}

// an iron wall anchor, an eight-pointed star
function anchor(g, x, y) {
  g.fillStyle = '#3a3c3f';
  g.beginPath();
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, r = k % 2 ? 0.09 : 0.26;
    g[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  g.fill();
}

function drawFront(g) {
  const half = W / 2;
  oldBrick(g, -half, 0, half, H, 44);
  // the gable: a sunk panel framed in orange brick under the slopes, and the stone coping on top
  const panel = (inset, y0) => {
    const reach = half - 0.9 - (y0 + inset - SHOULDER) / pitch; // where the slope, `inset` under the coping, comes down to y0
    return [[-reach, y0], [reach, y0], [MID + 0.2, coping(MID + 0.2) - inset], [-MID - 0.2, coping(MID + 0.2) - inset]];
  };
  const poly = pts => { g.beginPath(); pts.forEach(([x, y], k) => g[k ? 'lineTo' : 'moveTo'](x, y)); g.closePath(); };
  poly(panel(1.0, 15.0));
  g.fillStyle = 'rgba(30, 12, 8, 0.22)'; g.fill();
  g.strokeStyle = BAND; g.lineWidth = 0.28; g.stroke();
  poly(panel(1.55, 15.5));
  g.lineWidth = 0.18; g.stroke();
  g.strokeStyle = BAND; g.lineWidth = 0.3; // a band along each slope, under the coping
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * (half - 0.9), SHOULDER - 0.55); g.lineTo(s * MID, PEAK - 0.55); g.stroke(); }
  g.strokeStyle = '#a29c90'; g.lineWidth = 0.42; // the coping, half of it off the edge
  g.beginPath();
  SILHOUETTE.slice(2).forEach(([x, y], k) => g[k ? 'lineTo' : 'moveTo'](x, y));
  g.stroke();
  // pilasters at the corners and either side of the middle bay, a little lighter and standing out
  for (const [x, w, top] of [[-half + 0.45, 0.9, PIER], [half - 0.45, 0.9, PIER], [-4.95, 0.7, coping(4.95)], [4.95, 0.7, coping(4.95)]]) {
    g.fillStyle = 'rgba(255, 220, 200, 0.07)'; g.fillRect(x - w / 2, 0, w, top);
    g.fillStyle = 'rgba(25, 10, 5, 0.3)'; g.fillRect(x + w / 2 - 0.08, 0, 0.08, top);
  }
  // the great arch: bluestone jambs, the band over it, the glass in black frames, the shop's name
  const { w, spring } = ARCH, r = w / 2;
  g.fillStyle = GLASS;
  g.beginPath(); g.moveTo(-r, 0); g.lineTo(-r, spring); g.arc(0, spring, r, Math.PI, 0, true); g.lineTo(r, 0); g.closePath(); g.fill();
  g.save(); g.clip();
  g.fillStyle = '#d8dad6'; g.fillRect(-2.6, 0, 1.0, 4.3); // a white wall inside, behind the doors
  g.fillStyle = '#e9e6d8'; // strip lights on the ceiling of the mezzanine
  for (let x = -3; x < 3.2; x += 1.25) g.fillRect(x, 7.1, 0.7, 0.07);
  g.fillStyle = 'rgba(70, 110, 70, 0.55)'; g.beginPath(); g.arc(-3.0, 5.9, 0.7, 0, Math.PI * 2); g.arc(2.9, 6.4, 0.55, 0, Math.PI * 2); g.fill(); // plants
  g.fillStyle = 'rgba(190, 215, 235, 0.16)'; // the street's reflection low in the doors
  g.beginPath(); g.moveTo(-r, 0); g.lineTo(-r, 2.6); g.lineTo(r, 1.0); g.lineTo(r, 0); g.fill();
  g.fillStyle = FRAME;
  for (let k = 0; k <= 6; k++) g.fillRect(-r + (w * k) / 6 - 0.06, 0, 0.12, spring + r);
  g.fillRect(-r, 4.2, w, 0.62); // the transom, with the name on it
  g.fillRect(-r, 2.35, w, 0.07);
  g.fillRect(-r, 7.6, w, 0.1);
  g.restore();
  g.save(); g.scale(1, -1);
  g.fillStyle = '#e8e8e4'; g.font = '700 0.36px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('T R A V E L B A S E', 0.3, -4.51);
  g.restore();
  ringBand(g, 0, spring, r, 0.62, 0, Math.PI);
  g.fillStyle = STONE;
  for (const s of [-1, 1]) {
    g.fillRect(s * (r + 0.32) - 0.32, 0, 0.64, spring);
    g.fillStyle = shade(STONE, -0.25);
    for (let y = 0.9; y < spring; y += 0.9) g.fillRect(s * (r + 0.32) - 0.32, y, 0.64, 0.04);
    g.fillStyle = STONE;
    g.fillRect(s * (r + 0.35) - 0.42, spring - 0.3, 0.84, 0.36); // the impost
  }
  // the great round window over it, and a smaller one in each bay
  roundWindow(g, 0, OCULUS.y, OCULUS.r, 16);
  roundWindow(g, -7.1, 10.4, 1.0, 12);
  roundWindow(g, 7.1, 8.2, 0.55, 8);
  blindArch(g, -7.1, 1.1, 2.5, 5.2, 3);
  blindArch(g, 7.1, 1.1, 2.5, 5.2, 9);
  g.fillStyle = '#6f6e6a'; g.fillRect(5.8, 8.9, 0.9, 0.6); // a stone plaque
  g.fillStyle = '#25282b'; g.fillRect(4.3, 2.4, 0.35, 0.3); // the letter box
  for (const [x, y] of [[-3.1, 10.0], [3.1, 10.0], [0, 9.55], [-5.6, 12.4], [5.6, 12.4], [-8.3, 8.6], [8.3, 8.6]]) anchor(g, x, y);
  // the bluestone plinth, and the downpipe at the west corner
  g.fillStyle = STONE; g.fillRect(-half, 0, half - r - 0.64, 0.55); g.fillRect(r + 0.64, 0, half - r - 0.64, 0.55);
  g.fillStyle = '#c9cbc8'; g.fillRect(half - 0.22, 0, 0.13, EAVE);
}

// brick for the side and back walls, 4 m to a repeat
let brickMap = null;
function wallBrick() {
  if (brickMap) return brickMap;
  const draw = g => oldBrick(g, -2, 0, 2, 4, 21);
  brickMap = elevation(4, 4, 40, draw);
  letGo(brickMap, () => { const c = brickMap.image; c.width = c.height = 160; const g = c.getContext('2d'); g.setTransform(40, 0, 0, -40, 80, 160); draw(g); });
  brickMap.wrapS = brickMap.wrapT = THREE.RepeatWrapping;
  return brickMap;
}

// walls along the sides of a ring (flat [x, z, ...], in the model's metres), skipping the sides
// `skip` lists, from y0 up to y1, brick laid in true metres
export function sides(ring, y0, y1, skip = []) {
  const pos = [], uv = [], n = ring.length / 2;
  let run = 0;
  for (let k = 0; k < n; k++) {
    const ax = ring[2 * k], az = ring[2 * k + 1], bx = ring[(2 * k + 2) % ring.length], bz = ring[(2 * k + 3) % ring.length];
    const L = Math.hypot(bx - ax, bz - az);
    if (!skip.includes(k)) {
      pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y0, az, bx, y1, bz, ax, y1, az);
      const [u0, u1, v0, v1] = [run / 4, (run + L) / 4, y0 / 4, y1 / 4];
      uv.push(u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1);
    }
    run += L;
  }
  return soup(pos, uv);
}
export function soup(pos, uv) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  return geo;
}
const local = ring => ring.map((v, k) => v - (k % 2 ? Z : X));

// The wing at the back, two floors of offices behind glass: its south and east walls (sides 2 and
// 1 of its ring) are panes between slim black frames, and through them you see the wooden desks,
// the screens, the people at work, and the lights on the ceilings.
const WING_TOP = 9.4, STOREY = 4.7;
function office(ring) {
  const g = new THREE.Group(), kit = new Kit();
  const [nwx, nwz, nex, nez, sex, sez, swx, swz] = ring;
  // the panes, a little in from the outline so the frames stand on it
  const pane = (ax, az, bx, bz) => {
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, a = -Math.atan2(uz, ux);
    for (let t = 0; t <= L + 0.01; t += L / Math.max(1, Math.round(L / 1.6))) kit.box(0.09, WING_TOP, 0.12, 0x1d1f21, ax + ux * t, WING_TOP / 2, az + uz * t, 0, a, 0);
    for (const y of [0.08, STOREY, WING_TOP - 0.15]) kit.box(L, y === STOREY ? 0.45 : 0.16, 0.16, y === STOREY ? 0xc9c7c2 : 0x1d1f21, (ax + bx) / 2, y, (az + bz) / 2, 0, a, 0);
    const geo = new THREE.PlaneGeometry(L, WING_TOP);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x9db4c4, roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }));
    m.position.set((ax + bx) / 2, WING_TOP / 2, (az + bz) / 2);
    m.rotation.y = a;
    g.add(m);
  };
  pane(nex, nez, sex, sez);
  pane(sex, sez, swx, swz);
  // the floors, the ceilings, and the desks along the glass, four to a floor, with someone at most
  const x0 = Math.max(nwx, swx) + 0.4, x1 = Math.min(nex, sex) - 0.4, z0 = Math.max(nwz, nez) + 0.3, z1 = Math.min(sez, swz) - 0.3;
  const w = x1 - x0, d = z1 - z0;
  const r = rng(12), SHIRTS = [0x3c6e9e, 0xd8d4c8, 0x8a3b3b, 0x2f2f33, 0x6f8f5a, 0xe2b04a], SKIN = [0xe2b896, 0xc08a64, 0x8a5a3c, 0xf0cfb2];
  for (const [f, y] of [[0, 0], [1, STOREY]]) {
    kit.box(w + 0.8, 0.12, d + 0.6, f ? 0xbfb9ae : 0x8b8378, x0 + w / 2, y + 0.06, z0 + d / 2);
    kit.box(w + 0.8, 0.1, d + 0.6, 0xf1efe8, x0 + w / 2, y + STOREY - 0.12, z0 + d / 2);
    for (let k = 0; k < 3; k++) kit.box(0.5, 0.04, d * 0.7, 0xfffbe8, x0 + w * (k + 0.5) / 3, y + STOREY - 0.19, z0 + d / 2); // the light strips
    for (const [i, j] of [[0, 1], [1, 1], [2, 1], [2, 0]]) {
      const cx = x0 + w * (i + 0.5) / 3, cz = z0 + d * (j ? 0.72 : 0.3), seat = r() < 0.8;
      kit.box(1.7, 0.06, 0.85, 0xb5895a, cx, y + 0.78, cz); // the oak top
      for (const sx of [-0.78, 0.78]) kit.box(0.06, 0.72, 0.75, 0x2b2b2b, cx + sx, y + 0.42, cz);
      kit.box(0.6, 0.38, 0.04, 0x161718, cx, y + 1.08, cz - 0.25); // the screen, facing the glass
      kit.box(0.06, 0.12, 0.06, 0x161718, cx, y + 0.86, cz - 0.25);
      kit.box(0.5, 0.08, 0.5, 0x2a2c30, cx, y + 0.5, cz - 0.75); // the chair
      kit.box(0.5, 0.5, 0.07, 0x2a2c30, cx, y + 0.78, cz - 1.0);
      if (!seat) continue;
      // someone at the desk, back to the hall, facing the screen and the glass beyond it
      const shirt = SHIRTS[Math.floor(r() * SHIRTS.length)], skin = SKIN[Math.floor(r() * SKIN.length)];
      kit.box(0.44, 0.62, 0.26, shirt, cx, y + 0.86, cz - 0.82);
      kit.box(0.16, 0.42, 0.14, shirt, cx - 0.26, y + 0.92, cz - 0.6, -1.1, 0, 0);
      kit.box(0.16, 0.42, 0.14, shirt, cx + 0.26, y + 0.92, cz - 0.6, -1.1, 0, 0);
      kit.box(0.4, 0.16, 0.5, 0x33363d, cx, y + 0.6, cz - 0.6); // the thighs, on the seat
      kit.add(new THREE.SphereGeometry(0.13, 10, 8), skin, cx, y + 1.33, cz - 0.82);
      kit.add(new THREE.SphereGeometry(0.135, 10, 8, 0, Math.PI * 2, 0, 1.5), r() < 0.5 ? 0x2a1d14 : 0x8a6a3a, cx, y + 1.36, cz - 0.86);
    }
    // a plant in the corner, and a shelf against the brick
    kit.box(0.4, 0.45, 0.4, 0xe9e5dc, x1 - 0.3, y + 0.22, z1 - 0.3);
    kit.add(new THREE.IcosahedronGeometry(0.45, 0), 0x4f7a3e, x1 - 0.3, y + 0.85, z1 - 0.3);
    kit.box(0.4, 2.0, 2.4, 0x9a7650, x0 + 0.1, y + 1.0, z0 + d / 2);
  }
  g.add(kit.mesh(kitMat(0.75)));
  return g;
}

function hall() {
  const group = new THREE.Group();
  const wall = new THREE.MeshStandardMaterial({ map: wallBrick(), roughness: 0.95, side: THREE.DoubleSide });
  const roof = new THREE.MeshStandardMaterial({ color: 0x4b4e52, roughness: 0.85, side: THREE.DoubleSide });
  const add = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; group.add(m); return m; };
  const hallRing = local(HALL), wingRing = local(WING);
  // the hall's sides and back up to the eaves (its front is the gable); the wing behind it is brick
  // only on the west, glass to the south and east, onto the grass and the ramp, with the office inside
  add(sides(hallRing, 0, EAVE, [0, 2, 3]), wall);
  add(sides(wingRing, 0, WING_TOP, [0, 1, 2]), wall);
  group.add(office(wingRing));
  const flat = new THREE.Shape(Array.from({ length: wingRing.length / 2 }, (_, k) => new THREE.Vector2(wingRing[2 * k], -wingRing[2 * k + 1])));
  const top = new THREE.ShapeGeometry(flat).rotateX(-Math.PI / 2).translate(0, WING_TOP, 0);
  add(top, roof);
  // the roof: two slopes from the eaves to the ridge, front to back, and the gable at the back
  const [fw, fwz, fe, fez, be, bez, , , bw, bwz] = hallRing;
  const ridgeF = [(fw + fe) / 2, (fwz + fez) / 2], ridgeB = [(bw + be) / 2, (bwz + bez) / 2];
  const P = (x, y, z) => [x, y, z];
  const quad = (a, b, c, d) => [...a, ...b, ...c, ...a, ...c, ...d];
  const slopes = [
    ...quad(P(fw, EAVE, fwz), P(ridgeF[0], RIDGE, ridgeF[1]), P(ridgeB[0], RIDGE, ridgeB[1]), P(bw, EAVE, bwz)),
    ...quad(P(fe, EAVE, fez), P(ridgeF[0], RIDGE, ridgeF[1]), P(ridgeB[0], RIDGE, ridgeB[1]), P(be, EAVE, bez)),
  ];
  add(soup(slopes, slopes.map((v, k) => (k % 3 === 1 ? 0 : v / 4)).filter((_, k) => k % 3 !== 1)), roof);
  group.add(rear([bw, bwz, be, bez]));
  // the front: the gable's outline, 0.6 m thick, wearing its drawing on the street side
  const shape = new THREE.Shape(SILHOUETTE.map(([f, y]) => new THREE.Vector2(-f, y)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false }).translate(0, 0, -0.1);
  const draw = g => drawFront(g);
  const tex = elevation(W, H, 48, draw);
  letGo(tex, () => { const c = tex.image; c.width = Math.ceil(W * 48); c.height = Math.ceil(H * 48); const g = c.getContext('2d'); g.setTransform(48, 0, 0, -48, (W / 2) * 48, H * 48); draw(g); });
  tex.repeat.set(-1 / W, 1 / H); // the shape's x runs east, the drawing's to the west (to your right, facing it)
  tex.offset.set(0.5, 0);
  const front = new THREE.Mesh(geo, [new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), wall]);
  front.rotation.y = -ALONG; // its x along the front, its -z out to the street
  front.castShadow = front.receiveShadow = true;
  group.add(front);
  group.add(rampMouth());
  return group;
}

// The back of the hall, onto the grass and Dok Noord's square: rendered white, TRAVELBASE in black
// letters on it, and over the glass offices a gable of glass up into the roof. A tall black steel
// frame stands at its east corner, by the ramp; on the grass, a concrete terrace with picnic tables,
// stepping stones out to the door, and tall grasses along the ramp's railing.
function drawRear(g, L, H) {
  const half = L / 2, rise = (RIDGE - EAVE) / half, roofline = f => RIDGE - Math.abs(f) * rise;
  g.fillStyle = '#e8e7e2'; g.fillRect(-half, 0, L, H);
  g.fillStyle = 'rgba(0, 0, 0, 0.05)'; g.fillRect(-half, 0, L, 0.4);
  g.fillStyle = '#2a2d30'; g.fillRect(-half, 4.6, half - 1, 0.12); // the dark line over the ground floor
  // the glass gable: sky and the houses across the square in it, between dark frames
  const left = -3.4, glass = () => {
    g.beginPath(); g.moveTo(left, WING_TOP); g.lineTo(half, WING_TOP); g.lineTo(half, EAVE); g.lineTo(0, RIDGE); g.lineTo(left, roofline(left)); g.closePath();
  };
  glass();
  const sky = g.createLinearGradient(0, WING_TOP, 0, RIDGE);
  sky.addColorStop(0, '#5a4a48'); sky.addColorStop(0.45, '#6f7f92'); sky.addColorStop(1, '#3d5f8e');
  g.fillStyle = sky; g.fill();
  g.save(); glass(); g.clip();
  g.fillStyle = 'rgba(140, 80, 60, 0.45)'; g.fillRect(-1, WING_TOP, 6, 4.5); // a brick house across the way, in the glass
  g.fillStyle = 'rgba(255, 245, 220, 0.6)'; for (let y = WING_TOP + 1; y < RIDGE; y += 1.6) g.fillRect(-2, y, 9, 0.05); // the lights inside
  g.strokeStyle = '#2a2d30'; g.lineWidth = 0.1; g.beginPath();
  for (let f = left; f <= half; f += 1.35) { g.moveTo(f, WING_TOP); g.lineTo(f, RIDGE); }
  for (let y = WING_TOP; y <= RIDGE; y += 2.3) { g.moveTo(left, y); g.lineTo(half, y); }
  g.stroke(); g.restore();
  g.strokeStyle = '#2a2d30'; g.lineWidth = 0.3; glass(); g.stroke();
  // the roof's dark edge down both slopes
  g.strokeStyle = '#33373b'; g.lineWidth = 0.5;
  g.beginPath(); g.moveTo(-half, EAVE); g.lineTo(0, RIDGE); g.lineTo(half, EAVE); g.stroke();
  g.save(); g.scale(1, -1);
  g.fillStyle = '#1f2224'; g.font = '700 0.8px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('T R A V E L B A S E', -6.4, -10.6);
  g.restore();
  g.fillStyle = '#1f2224'; // the little wall lights
  for (const [f, y] of [[-8.4, 12.5], [-5.6, 12.5], [-8.4, 7.7], [-4.4, 3.4]]) g.fillRect(f, y, 0.22, 0.22);
}

function rear([wx, wz, ex, ez]) {
  const g = new THREE.Group(), L = Math.hypot(ex - wx, ez - wz), H = RIDGE + 0.2;
  const shape = new THREE.Shape([[-L / 2, 0], [L / 2, 0], [L / 2, EAVE], [0, RIDGE], [-L / 2, EAVE]].map(([x, y]) => new THREE.Vector2(x, y)));
  const tex = elevation(L, H, 40, (c) => drawRear(c, L, H));
  letGo(tex, () => { const c = tex.image; c.width = Math.ceil(L * 40); c.height = Math.ceil(H * 40); const x = c.getContext('2d'); x.setTransform(40, 0, 0, -40, (L / 2) * 40, H * 40); drawRear(x, L, H); });
  tex.repeat.set(1 / L, 1 / H);
  tex.offset.set(0.5, 0);
  const wall = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, side: THREE.DoubleSide }));
  wall.position.set((wx + ex) / 2, 0, (wz + ez) / 2);
  wall.rotation.y = -Math.atan2(ez - wz, ex - wx);
  wall.castShadow = wall.receiveShadow = true;
  g.add(wall);
  // what stands outside, in the city's metres less the hall's middle
  const kit = new Kit(), at = (x, z) => [x - X, z - Z], P = (x, y, z) => [x - X, y, z - Z];
  // the steel frame at the east corner: two tall black columns and the beam across their tops
  for (const z of [-1904.0, -1912.4]) kit.box(0.45, 17.5, 0.35, 0x23262a, ...P(731.35, 8.75, z));
  kit.box(0.4, 0.5, 8.8, 0x23262a, ...P(731.35, 17.3, -1908.2));
  // the terrace against the white wall, and two picnic tables on it
  const [tx, tz] = at(716.2, -1907.8);
  kit.box(8.0, 0.08, 9.4, 0xc8c5bc, tx, 0.04, tz);
  for (const [x, z] of [[714.6, -1909.8], [717.7, -1906.4]]) {
    const [px, pz] = at(x, z), wood = 0x8b6a48;
    kit.box(1.9, 0.06, 0.75, wood, px, 0.78, pz); // the top
    for (const s of [-1, 1]) {
      kit.box(1.9, 0.05, 0.28, wood, px, 0.46, pz + s * 0.66); // a bench
      kit.box(0.08, 0.06, 1.62, 0x765a3c, px + s * 0.7, 0.42, pz); // the bearer under both benches
      for (const t of [-1, 1]) kit.box(0.08, 0.9, 0.08, 0x765a3c, px + s * 0.7, 0.42, pz + t * 0.4, t * 0.5, 0, 0); // the splayed legs
    }
  }
  // the stepping stones from the door out across the grass
  for (let z = -1903.4; z < -1877; z += 1.15) { const [px, pz] = at(725.3 + Math.sin(z * 0.7) * 0.08, z); kit.box(1.3, 0.05, 0.45, 0xc9c7c1, px, 0.05, pz); }
  // tall grasses along the ramp's railing
  const r = rng(77);
  for (let z = -1903; z < -1879; z += 0.9) {
    const [px, pz] = at(731.7 + r() * 0.5, z + r() * 0.4), h = 0.8 + r() * 0.6;
    kit.add(new THREE.ConeGeometry(0.35, h, 6), r() < 0.5 ? 0xb3a66a : 0x8c9a5a, px, h / 2, pz);
  }
  g.add(kit.mesh(kitMat(0.8)));
  return g;
}

// ---- The ramp down to the car park --------------------------------------------------------------

// A hollow (core/js/hollows.js) in 0.5 m cells, in the passage east of the hall: level with the
// street at its top, sloping down to 3 m under it, then flat to the car park's mouth in its far
// (south) end; walls down either side with a railing on top.
const RAMP = { x0: 733, z0: -1902, cell: 0.5, nx: 17, nz: 42, down: 3.0, top: -1901.5, foot: -1885 };
function rampDepths() {
  const d = [];
  for (let j = 0; j <= RAMP.nz; j++) {
    const z = RAMP.z0 + j * RAMP.cell, f = Math.max(0, Math.min(1, (z - RAMP.top) / (RAMP.foot - RAMP.top)));
    for (let i = 0; i <= RAMP.nx; i++) d.push(i === 0 || i === RAMP.nx || j === 0 || j === RAMP.nz ? 0 : -Math.round(f * RAMP.down * 10));
  }
  return d;
}
// the car park's mouth on the ramp's floor, just out from the end wall, and up the ramp from it (a
// portal, ghent/city.js): x, z and which way is up the ramp (yaw, north)
export const MOUTH = { x: RAMP.x0 + (RAMP.nx * RAMP.cell) / 2, z: RAMP.z0 + RAMP.nz * RAMP.cell - 1.5, yaw: Math.PI };
export const HOLLOWS = [{ id: 'dok-noord-ramp', name: 'Parking Dok Noord', x0: RAMP.x0, z0: RAMP.z0, cell: RAMP.cell, nx: RAMP.nx, nz: RAMP.nz, d: rampDepths() }];

// the car park's mouth in the ramp's end wall: a dark opening under a concrete lintel, its blue
// sign, and the yellow bar for the height under it
function rampMouth() {
  const g = new THREE.Group();
  const zEnd = RAMP.z0 + RAMP.nz * RAMP.cell - RAMP.cell - 0.03 - Z; // just out from the foot of the end wall
  const x0 = RAMP.x0 + RAMP.cell - X, x1 = RAMP.x0 + (RAMP.nx - 1) * RAMP.cell - X, mid = (x0 + x1) / 2, w = x1 - x0;
  const plane = (pw, ph, x, y, z, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat); m.position.set(x, y, z); m.rotation.y = Math.PI; g.add(m); return m; };
  plane(w - 1.2, 2.45, mid, -RAMP.down + 1.225, zEnd, new THREE.MeshBasicMaterial({ color: 0x101214 }));
  plane(w, 0.6, mid, -0.3, zEnd - 0.01, new THREE.MeshStandardMaterial({ color: 0xb4b1a9, roughness: 1 }));
  const c = document.createElement('canvas');
  c.width = 256; c.height = 32;
  const x = c.getContext('2d');
  x.fillStyle = '#1f4fa3'; x.fillRect(0, 0, 256, 32);
  x.fillStyle = '#fff'; x.fillRect(4, 3, 26, 26);
  x.fillStyle = '#1f4fa3'; x.font = 'bold 24px sans-serif'; x.textBaseline = 'middle'; x.fillText('P', 9, 17);
  x.fillStyle = '#fff'; x.font = 'bold 18px sans-serif'; x.fillText('DOK NOORD', 44, 17);
  const sign = new THREE.CanvasTexture(c);
  sign.colorSpace = THREE.SRGBColorSpace;
  plane(3.6, 0.45, mid, -0.3, zEnd - 0.02, new THREE.MeshBasicMaterial({ map: sign }));
  const bar = new THREE.Mesh(new THREE.BoxGeometry(w - 1.2, 0.16, 0.1), new THREE.MeshStandardMaterial({ color: 0xe0b020, roughness: 0.6 }));
  bar.position.set(mid, -0.68, zEnd - 0.08);
  g.add(bar);
  return g;
}

export const DOK_NOORD = [{ id: 'route-du-soleil', name: 'Route du Soleil', x: X, z: Z, turn: 0, reach: 110, area: [FOOT], foot: [FOOT], make: hall }];
