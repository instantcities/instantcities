// Travelbase's two neighbours on the Sassevaartstraat, drawn from Street View (October 2024) and
// photos, in place of the map's low boxes on the same outlines:
//  - to the west, the old AEG works: taller than Travelbase, red brick, a raised middle with AEG
//    in its panel, a great steel window over a gateway in a stone frame, round windows; tall
//    factory windows down its long sides
//  - to the east, across the passage with the ramp, the Dok Noord building: four floors of red
//    brick over round-arched shop windows, a glass floor set back on top, DOK NOORD on its front,
//    and on its side to the ramp a glass bay and the car park's blue signs
import * as THREE from 'three';
import { MAP } from './map.js';
import { elevation, brick, rng, letGo } from '../core/js/facades.js';
import { walls, slab } from './blocks.js';
import { Kit, kitMat } from '../core/js/kit.js';

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
const middle = ring => { const n = ring.length / 2; let x = 0, z = 0; for (let k = 0; k < n; k++) { x += ring[2 * k] / n; z += ring[2 * k + 1] / n; } return [x, z]; };

// a picture in metres (core/js/facades.js elevation), put back when the GPU forgets it
function picture(W, H, px, draw, repeat = false) {
  const t = elevation(W, H, px, draw);
  letGo(t, () => {
    const c = t.image; c.width = Math.ceil(W * px); c.height = Math.ceil(H * px);
    const g = c.getContext('2d'); g.setTransform(px, 0, 0, -px, (W / 2) * px, H * px); draw(g, W, H);
  });
  if (repeat) t.wrapS = THREE.RepeatWrapping;
  return t;
}
function label(g, text, f, y, size, color, weight = 800, family = 'sans-serif') {
  g.save(); g.scale(1, -1);
  g.font = `${weight} ${size}px ${family}`; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, f, -y);
  g.restore();
}
const mat = (map, extra = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.9, side: THREE.DoubleSide, ...extra });

// A flat front on the side of a ring from a to b (in the model's metres), standing `out` metres
// out from it, its outline `pts` ([f, y]: f across it as you face it, 0 in the middle) wearing a
// picture W wide and H tall drawn the same way, its foot at y0.
function face(a, b, centre, pts, tex, W, H, { out = 0.06, along = 0.5, y0 = 0, extra = {} } = {}) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
  let nx = dz / L, nz = -dx / L;
  const mx = a[0] + dx * along, mz = a[1] + dz * along;
  if ((mx - centre[0]) * nx + (mz - centre[1]) * nz < 0) { nx = -nx; nz = -nz; }
  tex.repeat.set(1 / W, 1 / H);
  tex.offset.set(0.5, -y0 / H);
  const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts.map(([f, y]) => new THREE.Vector2(f, y)))), mat(tex, extra));
  m.position.set(mx + nx * out, 0, mz + nz * out);
  m.rotation.y = Math.atan2(nx, nz); // facing out; its x then runs to your right as you face it
  m.castShadow = m.receiveShadow = true;
  return m;
}
const rect = (W, y0, y1) => [[-W / 2, y0], [W / 2, y0], [W / 2, y1], [-W / 2, y1]];

// ---- the AEG works ----------------------------------------------------------------------------

const AEG_FOOT = outline(700, -1885);
const AEG_MID = middle(AEG_FOOT);
const AEG = { top: 18, raised: 20.2, brick: '#9c4f3a' };

function drawAegFront(g, W, H) {
  const half = W / 2;
  brick(g, -half, 0, half, H, AEG.brick, { course: 0.2, seed: 61 });
  const r = rng(3);
  for (let i = 0; i < 900; i++) { g.fillStyle = ['#7f3e2f', '#b8664a', '#6e3a30'][i % 3]; g.globalAlpha = 0.45; g.fillRect(-half + r() * W, Math.floor(r() * H / 0.2) * 0.2 + 0.02, 0.27, 0.16); }
  g.globalAlpha = 1;
  // pilasters at the corners and either side of the raised middle, a cornice under the parapet
  for (const f of [-half + 0.5, half - 0.5, -5.2, 5.2]) { g.fillStyle = 'rgba(255, 210, 180, 0.1)'; g.fillRect(f - 0.5, 0, 1, f > -6 && f < 6 ? AEG.raised : AEG.top); g.fillStyle = 'rgba(40, 15, 10, 0.25)'; g.fillRect(f + 0.4, 0, 0.1, AEG.top); }
  g.fillStyle = '#b9b2a6'; g.fillRect(-half, AEG.top - 0.35, W, 0.35); g.fillRect(-5.7, AEG.raised - 0.35, 11.4, 0.35);
  g.fillStyle = 'rgba(40, 15, 10, 0.3)'; g.fillRect(-half, AEG.top - 1.3, W, 0.18);
  // the panel up in the raised middle, with the firm's name
  g.fillStyle = '#b57a5e'; g.fillRect(-3.6, 16.2, 7.2, 2.6);
  g.strokeStyle = '#7a3c2c'; g.lineWidth = 0.15; g.strokeRect(-3.6, 16.2, 7.2, 2.6);
  label(g, 'A E G', 0, 17.5, 1.9, '#d9cdbd', 900, 'Georgia, serif');
  // the great steel window: three lights in a grid of thin bars, a stone sill
  const wx = 3.4, wy0 = 9.0, wy1 = 15.0;
  g.fillStyle = '#2d3a42'; g.fillRect(-wx, wy0, wx * 2, wy1 - wy0);
  g.fillStyle = 'rgba(170, 195, 210, 0.3)'; g.fillRect(-wx, wy0 + 3, wx * 2, 2.4);
  g.strokeStyle = '#15191b'; g.lineWidth = 0.08; g.beginPath();
  for (let f = -wx; f <= wx + 0.01; f += (wx * 2) / 12) { g.moveTo(f, wy0); g.lineTo(f, wy1); }
  for (let y = wy0; y <= wy1 + 0.01; y += 0.75) { g.moveTo(-wx, y); g.lineTo(wx, y); }
  g.stroke();
  g.fillStyle = '#121518'; for (const f of [-wx / 3, wx / 3]) g.fillRect(f - 0.15, wy0, 0.3, wy1 - wy0);
  g.fillStyle = '#a7a196'; g.fillRect(-wx - 0.3, wy0 - 0.35, wx * 2 + 0.6, 0.35);
  // the gateway: a bluestone frame, the courtyard's dim brick through it
  g.fillStyle = '#8f9295'; g.fillRect(-3.9, 0, 7.8, 7.6);
  g.fillStyle = '#4a2c24'; g.fillRect(-3.2, 0, 6.4, 6.9);
  g.fillStyle = 'rgba(0, 0, 0, 0.35)'; g.fillRect(-3.2, 5.6, 6.4, 1.3);
  // a round window either side, a little one higher on the right
  for (const [f, y, rr] of [[-8.2, 12.2, 1.0], [8.2, 12.2, 1.0], [8.2, 4.6, 0.55]]) {
    g.fillStyle = '#b8664a'; g.beginPath(); g.arc(f, y, rr + 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5f7f9a'; g.beginPath(); g.arc(f, y, rr, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#1d2124'; g.lineWidth = 0.07; g.beginPath(); g.moveTo(f - rr, y); g.lineTo(f + rr, y); g.moveTo(f, y - rr); g.lineTo(f, y + rr); g.stroke();
  }
  g.fillStyle = '#8f9295'; g.fillRect(-half, 0, W, 0.5); // the plinth
}

// its long sides: tall steel factory windows, two to a bay
function drawAegBay(g, W, H) {
  brick(g, -W / 2, 0, W / 2, H, AEG.brick, { course: 0.2, seed: 62 });
  g.fillStyle = 'rgba(255, 210, 180, 0.1)'; g.fillRect(-W / 2, 0, 0.6, H);
  for (const f of [-1.2, 1.2]) {
    g.fillStyle = '#2d3a42'; g.fillRect(f - 0.8, 2.2, 1.6, 12.5);
    g.strokeStyle = '#15191b'; g.lineWidth = 0.06; g.beginPath();
    for (let y = 2.2; y < 14.7; y += 0.7) { g.moveTo(f - 0.8, y); g.lineTo(f + 0.8, y); }
    g.moveTo(f, 2.2); g.lineTo(f, 14.7); g.stroke();
    g.fillStyle = '#a7a196'; g.fillRect(f - 1.0, 1.9, 2.0, 0.3);
  }
  g.fillStyle = '#b9b2a6'; g.fillRect(-W / 2, H - 0.35, W, 0.35);
  g.fillStyle = '#8f9295'; g.fillRect(-W / 2, 0, W, 0.5);
}

function aeg() {
  const g = new THREE.Group(), [ox, oz] = AEG_MID;
  const ring = AEG_FOOT.map((v, k) => v - (k % 2 ? oz : ox));
  const bay = picture(5, AEG.top, 24, drawAegBay, true);
  g.add(new THREE.Mesh(walls(ring, 0, AEG.top, 5), mat(bay)));
  g.add(new THREE.Mesh(slab(ring, AEG.top - 0.2, AEG.top), mat(null, { color: 0x6c6a66 })));
  // its front on the street: the outline's first side, from its north-west corner
  const a = [ring[0], ring[1]], b = [ring[2], ring[3]], W = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const pts = [[-W / 2, 0], [W / 2, 0], [W / 2, AEG.top], [5.7, AEG.top], [5.7, AEG.raised], [-5.7, AEG.raised], [-5.7, AEG.top], [-W / 2, AEG.top]];
  g.add(face(a, b, [0, 0], pts, picture(W, AEG.raised, 40, (c, w, h) => drawAegFront(c, w, h)), W, AEG.raised, { out: 0.08 }));
  g.traverse(m => { m.castShadow = m.receiveShadow = true; });
  return g;
}

// ---- the Dok Noord building -------------------------------------------------------------------

const DOK_FOOT = outline(793.4, -1920.6);
const DOK_EXTRA = outline(793.0, -1921.6); // the map draws it twice, a little differently: both go
const DOK_MID = middle(DOK_FOOT);
const DOK = { top: 13.6, glass: 17.2, brick: '#94503d' };

// one bay of its brick: a round-arched shop window, three floors of windows over it
function drawDokBay(g, W, H) {
  brick(g, -W / 2, 0, W / 2, H, DOK.brick, { course: 0.2, seed: 71 });
  const r = rng(9);
  for (let i = 0; i < 120; i++) { g.fillStyle = ['#7a4032', '#ad6450'][i % 2]; g.globalAlpha = 0.45; g.fillRect(-W / 2 + r() * W, Math.floor(r() * H / 0.2) * 0.2 + 0.02, 0.27, 0.16); }
  g.globalAlpha = 1;
  g.fillStyle = '#2f3940';
  g.beginPath(); g.moveTo(-1.3, 0.3); g.lineTo(-1.3, 2.9); g.arc(0, 2.9, 1.3, Math.PI, 0, true); g.lineTo(1.3, 0.3); g.closePath(); g.fill();
  g.strokeStyle = '#c47a5e'; g.lineWidth = 0.25; g.beginPath(); g.arc(0, 2.9, 1.43, 0, Math.PI); g.stroke();
  g.fillStyle = 'rgba(255, 230, 190, 0.25)'; g.fillRect(-1.2, 0.3, 2.4, 1.6);
  for (const y of [5.4, 8.3, 11.1]) {
    g.fillStyle = '#d8d4cc'; g.fillRect(-0.85, y - 0.1, 1.7, 2.0);
    g.fillStyle = '#26323a'; g.fillRect(-0.75, y, 1.5, 1.8);
    g.fillStyle = 'rgba(170, 195, 210, 0.3)'; g.fillRect(-0.75, y + 1.0, 0.7, 0.8);
  }
  g.fillStyle = '#c9c4ba'; g.fillRect(-W / 2, H - 0.3, W, 0.3);
}
function drawDokGlass(g, W, H) {
  g.fillStyle = '#4d6070'; g.fillRect(-W / 2, 0, W, H);
  g.fillStyle = 'rgba(200, 220, 235, 0.35)'; g.fillRect(-W / 2, H * 0.55, W, H * 0.3);
  g.fillStyle = '#1b1f22'; g.fillRect(-W / 2, 0, 0.08, H); g.fillRect(-W / 2, H - 0.2, W, 0.2);
}

// a ring set in by d metres all round, each corner moved along its two sides' inward normals
function inset(ring, d) {
  const n = ring.length / 2, P = k => [ring[2 * ((k + n) % n)], ring[2 * ((k + n) % n) + 1]];
  let area = 0;
  for (let k = 0; k < n; k++) { const [ax, az] = P(k), [bx, bz] = P(k + 1); area += ax * bz - bx * az; }
  const s = Math.sign(area);
  const normal = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(-(b[1] - a[1]) / L) * s, ((b[0] - a[0]) / L) * s]; };
  return Array.from({ length: n }, (_, k) => {
    const p = P(k), n1 = normal(P(k - 1), p), n2 = normal(p, P(k + 1));
    const mx = n1[0] + n2[0], mz = n1[1] + n2[1], dot = mx * n2[0] + mz * n2[1];
    const f = Math.min(3, d / Math.max(0.3, dot));
    return [p[0] + mx * f, p[1] + mz * f];
  }).flat();
}

// white letters on a clear sign, for the brick
function letters(text, w, h, size) {
  return picture(w, h, 48, g => label(g, text, 0, h / 2, size, '#f4f2ec', 800));
}

function dokNoord() {
  const g = new THREE.Group(), [ox, oz] = DOK_MID;
  const ring = DOK_FOOT.map((v, k) => v - (k % 2 ? oz : ox));
  const bay = picture(4, DOK.top, 28, drawDokBay, true);
  g.add(new THREE.Mesh(walls(ring, 0, DOK.top, 4), mat(bay)));
  g.add(new THREE.Mesh(slab(ring, DOK.top - 0.25, DOK.top), mat(null, { color: 0x77736c })));
  // the glass floor on top, set back behind a railing
  const top = inset(ring, 2.2);
  const glass = picture(2, DOK.glass - DOK.top, 32, drawDokGlass, true);
  g.add(new THREE.Mesh(walls(top, DOK.top, DOK.glass, 2), mat(glass, { roughness: 0.2, metalness: 0.4 })));
  g.add(new THREE.Mesh(slab(top, DOK.glass, DOK.glass + 0.3), mat(null, { color: 0x3a3d40 })));
  const kit = new Kit();
  for (let k = 0; k < ring.length; k += 2) {
    const ax = ring[k], az = ring[k + 1], bx = ring[(k + 2) % ring.length], bz = ring[(k + 3) % ring.length];
    kit.rod([ax, DOK.top + 1.05, az], [bx, DOK.top + 1.05, bz], 0.05, 0x24272a, 4);
    const L = Math.hypot(bx - ax, bz - az);
    for (let t = 0; t < L; t += 1.6) kit.box(0.04, 1.05, 0.04, 0x24272a, ax + ((bx - ax) * t) / L, DOK.top + 0.52, az + ((bz - az) * t) / L);
  }
  // its front on the Sassevaartstraat (the ring's first side) and its side to the ramp (the last)
  const north = [[ring[0], ring[1]], [ring[2], ring[3]]], west = [[ring.at(-2), ring.at(-1)], [ring[0], ring[1]]];
  g.add(face(...north, [0, 0], rect(9, 9.6, 10.9), letters('DOK  NOORD', 9, 1.3, 1.05), 9, 1.3, { along: 0.12, out: 0.1, y0: 9.6, extra: { transparent: true, alphaTest: 0.3 } }));
  // the car park's signs at the foot of the side to the ramp: Indigo's P, the long blue PARKING
  const sign = picture(2.2, 2.6, 64, (c) => {
    c.fillStyle = '#f2f2f2'; c.fillRect(-1.1, 0, 2.2, 2.6);
    label(c, 'INDIGO', 0, 2.3, 0.28, '#1b4f9c', 800);
    c.fillStyle = '#1b4f9c'; c.fillRect(-1.0, 0.1, 2.0, 1.95);
    label(c, 'P', -0.25, 1.15, 1.5, '#fff', 800);
    label(c, 'DOK NOORD', 0, 0.3, 0.26, '#fff', 700);
  });
  g.add(face(...west, [0, 0], rect(2.2, 3.4, 6.0), sign, 2.2, 2.6, { along: 0.82, out: 0.12, y0: 3.4 }));
  const pole = picture(0.7, 3.6, 64, (c) => { c.fillStyle = '#1b4f9c'; c.fillRect(-0.35, 0, 0.7, 3.6); [...'PARKING'].forEach((ch, k) => label(c, ch, 0, 3.25 - k * 0.47, 0.4, '#fff', 800)); });
  g.add(face(...west, [0, 0], rect(0.7, 1.2, 4.8), pole, 0.7, 3.6, { along: 0.7, out: 0.12, y0: 1.2 }));
  // the glass bay standing out of that side, over the signs
  const [[ax, az], [bx, bz]] = west, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
  let nx = uz, nz = -ux;
  if ((ax + bx) / 2 * nx + (az + bz) / 2 * nz < 0) { nx = -nx; nz = -nz; }
  const at = 0.78, cx = ax + (bx - ax) * at + nx * 0.9, cz = az + (bz - az) * at + nz * 0.9;
  const box = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 1.8), new THREE.MeshStandardMaterial({ color: 0x5e7486, roughness: 0.1, metalness: 0.5 }));
  box.position.set(cx, 8.2, cz);
  box.rotation.y = Math.atan2(nx, nz);
  g.add(box);
  kit.box(4.4, 0.18, 2.0, 0x1b1f22, cx, 6.55, cz, 0, Math.atan2(nx, nz), 0);
  kit.box(4.4, 0.18, 2.0, 0x1b1f22, cx, 9.85, cz, 0, Math.atan2(nx, nz), 0);
  // its door, between the signs
  kit.box(1.4, 2.4, 0.1, 0x2a3036, ax + (bx - ax) * 0.76 + nx * 0.06, 1.2, az + (bz - az) * 0.76 + nz * 0.06, 0, Math.atan2(nx, nz), 0);
  g.add(kit.mesh(kitMat(0.6, 0.3)));
  g.traverse(m => { m.castShadow = m.receiveShadow = true; });
  return g;
}

export const SASSEVAART = [
  { id: 'aeg', name: 'AEG', x: AEG_MID[0], z: AEG_MID[1], turn: 0, reach: 90, area: [AEG_FOOT], foot: [AEG_FOOT], make: aeg },
  { id: 'dok-noord-gebouw', name: 'Dok Noord', x: DOK_MID[0], z: DOK_MID[1], turn: 0, reach: 90, area: [DOK_FOOT, DOK_EXTRA], foot: [DOK_FOOT], make: dokNoord },
];
