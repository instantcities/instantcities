// Ghent's pavilions, modelled by hand: the Kouter's bandstand and its blue kiosk, the bus station
// canopies at Zuid, the flower sellers' stalls on the Kouter and the Vrijdagmarkt, and the two
// neuzekes carts and the Bij Filip chip shop on the Groentenmarkt. They join
// the statues (ghent/monuments.js), with what they add to them:
//   chairs  [{ x, z, yaw }] the terrace chairs in the model (its own metres, before turning), for
//           people to sit on (js/sitters.js)
//   posts   [[x, z], ...] a roof on posts: riders go in under it and only bump into those, not
//           into its base
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { flowerStall, STALL_SIZE } from '../core/js/stall.js';

const BLUE = 0x23308f, NAVY = 0x18225f, CREAM = 0xf1ece0, IRON = 0x2c4537, STONE = 0xc9c2b2, ZINC = 0x56636b;

// ------------------------------------------------------------------ the Kouter's bandstand

// The muziekkiosk in the middle of the Kouter, where the brass bands play on Sunday mornings over
// the flower market: an octagon, longer than it is wide, on a stone plinth with steps up at the
// front, slender cast-iron columns, a railing, a white frieze and an ogee roof of zinc with a
// little lantern on top. rx, rz: how far its corners reach along and across.
const BAND = { rx: 7.2, rz: 4.8 };

function bandstand() {
  const k = new Kit(), { rx, rz } = BAND, th0 = Math.PI / 8;
  const oct = (r0, r1, h, y, hex) => k.add(new THREE.CylinderGeometry(r0, r1, h, 8, 1, false, th0).scale(rx, 1, rz), hex, 0, y + h / 2, 0);
  const corner = (i, f = 1) => { const a = th0 + (i / 8) * Math.PI * 2; return [Math.sin(a) * rx * f, Math.cos(a) * rz * f]; };
  oct(1, 1.02, 1.25, 0, STONE); // the plinth
  oct(1.04, 1.04, 0.14, 1.25, 0xb3ab99); // its coping
  // the steps up at the front, between the two front corners
  for (let s = 0; s < 4; s++) k.box(3, 0.31, 0.4, 0xb3ab99, 0, 0.31 * s + 0.155, rz * 0.924 + 1.4 - s * 0.38);
  // the columns at the corners and the railing between them (not across the front, the steps)
  const y0 = 1.39, y1 = 5.7;
  for (let i = 0; i < 8; i++) {
    const [x, z] = corner(i, 0.94), [x2, z2] = corner(i + 1, 0.94);
    k.rod([x, y0, z], [x, y1, z], 0.1, IRON, 8);
    k.add(new THREE.SphereGeometry(0.2, 8, 6), IRON, x, y1 - 0.1, z); // its capital
    // the arched brackets between the columns, under the frieze
    k.rod([x, y1 - 0.7, z], [(x + x2) / 2, y1, (z + z2) / 2], 0.05, IRON);
    k.rod([x2, y1 - 0.7, z2], [(x + x2) / 2, y1, (z + z2) / 2], 0.05, IRON);
    if (i === 7) continue; // corners 7 and 0 frame the front
    k.rod([x, y0 + 0.95, z], [x2, y0 + 0.95, z2], 0.05, IRON);
    k.rod([x, y0 + 0.1, z], [x2, y0 + 0.1, z2], 0.04, IRON);
    for (let t = 0.1; t < 0.95; t += 0.1) {
      const bx = x + (x2 - x) * t, bz = z + (z2 - z) * t;
      k.rod([bx, y0 + 0.1, bz], [bx, y0 + 0.95, bz], 0.025, IRON, 4);
    }
  }
  // the frieze: a white band with a green edge, and the eaves over it
  oct(0.97, 0.97, 0.55, y1, CREAM);
  oct(0.98, 0.98, 0.1, y1 - 0.05, IRON);
  oct(1.06, 0.97, 0.18, y1 + 0.55, IRON);
  // the ogee roof, the lantern and the finial
  const prof = [[1.06, 0], [1.0, 0.25], [0.86, 0.8], [0.62, 1.5], [0.38, 2.1], [0.24, 2.6], [0.18, 2.8]].map(([r, y]) => new THREE.Vector2(r, y));
  k.add(new THREE.LatheGeometry(prof, 8, th0).scale(rx, 1, rz), ZINC, 0, y1 + 0.73, 0);
  const ly = y1 + 0.73 + 2.8;
  k.add(new THREE.CylinderGeometry(0.85, 0.85, 0.9, 8, 1, false, th0), CREAM, 0, ly + 0.45, 0);
  k.add(new THREE.ConeGeometry(1.0, 1.3, 8, 1, false, th0), ZINC, 0, ly + 1.55, 0);
  k.rod([0, ly + 2.1, 0], [0, ly + 2.9, 0], 0.05, 0xc9a43a);
  k.add(new THREE.SphereGeometry(0.16, 8, 6), 0xc9a43a, 0, ly + 2.95, 0);
  // the floor inside, boards
  oct(0.93, 0.93, 0.04, 1.39, 0x8a6a4a);
  const m = k.mesh(kitMat(0.7));
  m.name = 'kouter-bandstand';
  return m;
}

// ------------------------------------------------------------------ the blue kiosk

// The blue kiosk on the Kouter: a wooden pavilion painted deep ultramarine, panelled below and
// glazed all round above a counter, under a low roof with a scalloped valance and little white
// dormers, now a bar. Its terrace round it, tables and chairs, full on a sunny day.
const KIOSK = { w: 6.4, d: 3 }; // a small one: half the ground of a market hall's bar

// where the terrace chairs stand, the kiosk's own metres: tables in rows in front and behind, a
// chair on either side of each, facing the table
function kioskChairs() {
  const chairs = [], tables = [];
  for (const side of [-1, 1]) {
    for (const row of [1, 2]) {
      for (let x = -3.15; x <= 3.15; x += 2.1) {
        const z = side * (KIOSK.d / 2 + 0.9 + row * 1.9), tx = x + (row % 2 ? 0 : 1.05);
        if (Math.abs(tx) > 3.4) continue;
        tables.push([tx, z]);
        chairs.push({ x: tx - 0.55, z, yaw: Math.PI / 2 }, { x: tx + 0.55, z, yaw: -Math.PI / 2 });
      }
    }
  }
  // and at the two ends, a few round the high tables
  for (const end of [-1, 1]) for (const z of [-1.2, 1.2]) {
    const tx = end * (KIOSK.w / 2 + 1.6);
    tables.push([tx, z]);
    chairs.push({ x: tx, z: z - 0.55, yaw: 0 }, { x: tx, z: z + 0.55, yaw: Math.PI });
  }
  return { chairs, tables };
}

function blueKiosk() {
  const k = new Kit(), { w, d } = KIOSK;
  // the panelled lower walls, the counter all round, and the glazing above it
  k.box(w, 1.1, d, BLUE, 0, 0.55, 0);
  for (const side of [-1, 1]) {
    for (let x = -w / 2 + 0.55; x < w / 2 - 0.3; x += 1.0) k.box(0.8, 0.7, 0.03, NAVY, x + 0.2, 0.55, side * (d / 2 + 0.01));
    for (let z = -d / 2 + 0.55; z < d / 2 - 0.3; z += 1.0) k.box(0.03, 0.7, 0.8, NAVY, side * (w / 2 + 0.01), 0.55, z + 0.2);
  }
  k.box(w + 0.4, 0.07, d + 0.4, BLUE, 0, 1.13, 0);
  k.box(w - 0.1, 1.45, d - 0.1, 0xa9bfcc, 0, 1.9, 0); // the glass
  for (const side of [-1, 1]) {
    for (let x = -w / 2; x <= w / 2 + 0.01; x += 0.9) k.box(0.09, 1.5, 0.09, BLUE, x, 1.9, side * d / 2);
    for (let z = -d / 2; z <= d / 2 + 0.01; z += 0.84) k.box(0.09, 1.5, 0.09, BLUE, side * w / 2, 1.9, z);
    k.box(w, 0.07, 0.07, BLUE, 0, 2.3, side * d / 2); // the transom bar
    k.box(0.07, 0.07, d, BLUE, side * w / 2, 2.3, 0);
  }
  // the frieze, the eaves and the scalloped valance hanging from them
  k.box(w + 0.1, 0.35, d + 0.1, BLUE, 0, 2.8, 0);
  k.box(w + 1.3, 0.12, d + 1.3, NAVY, 0, 3.02, 0);
  for (const side of [-1, 1]) {
    for (let x = -w / 2 - 0.55; x < w / 2 + 0.6; x += 0.3) k.add(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 8, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2), BLUE, x, 2.96, side * (d / 2 + 0.65));
    for (let z = -d / 2 - 0.55; z < d / 2 + 0.6; z += 0.3) k.add(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 8, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).rotateY(Math.PI / 2), BLUE, side * (w / 2 + 0.65), 2.96, z);
  }
  // the low hipped roof, and its white dormers
  const roof = new THREE.ConeGeometry(1, 0.9, 4, 1, false, Math.PI / 4).scale((w + 1.2) / Math.SQRT2, 1, (d + 1.2) / Math.SQRT2);
  k.add(roof, NAVY, 0, 3.53, 0);
  for (const side of [-1, 1]) for (const x of [-1.8, 1.8]) {
    k.box(1.0, 0.6, 0.5, CREAM, x, 3.45, side * (d / 2 - 0.1));
    k.add(new THREE.ConeGeometry(0.75, 0.35, 4, 1, false, Math.PI / 4).scale(1, 1, 0.5), NAVY, x, 3.92, side * (d / 2 - 0.1));
  }
  // its name over the counter, and round white badges on the end panels
  for (const side of [-1, 1]) {
    k.box(1.6, 0.4, 0.04, CREAM, side * -1.6, 2.8, side * (d / 2 + 0.07));
    k.add(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 12).rotateZ(Math.PI / 2), CREAM, side * (w / 2 + 0.03), 0.6, 0);
  }
  // glasses ready on the counter
  for (let x = -w / 2 + 0.6; x < w / 2 - 0.4; x += 0.24) k.add(new THREE.CylinderGeometry(0.035, 0.03, 0.14, 6), 0xe8eef0, x, 1.24, d / 2 + 0.1);
  // the terrace: round white tables on a dark leg, brown chairs
  const { chairs, tables } = kioskChairs();
  for (const [x, z] of tables) {
    k.add(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 12), 0xf5f1e8, x, 0.76, z);
    k.add(new THREE.CylinderGeometry(0.04, 0.06, 0.74, 6), 0x37474f, x, 0.4, z);
  }
  for (const c of chairs) {
    const s = Math.sin(c.yaw), co = Math.cos(c.yaw), at = (lx, lz) => [c.x + lx * co + lz * s, c.z - lx * s + lz * co];
    k.box(0.42, 0.05, 0.42, 0x6d4c41, c.x, 0.49, c.z, 0, c.yaw);
    const [bx, bz] = at(0, -0.2);
    k.box(0.42, 0.45, 0.05, 0x6d4c41, bx, 0.73, bz, 0, c.yaw);
    for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) { const [px, pz] = at(lx, lz); k.box(0.04, 0.46, 0.04, 0x4e342e, px, 0.26, pz); }
  }
  const m = k.mesh(kitMat(0.6));
  m.name = 'blauwe-kiosk';
  return m;
}

// ------------------------------------------------------------------ the bus station at Zuid

// Gent Zuid, where most of De Lijn's city buses start and end: long flat canopies on two rows of
// slim grey posts, a yellow edge all round the roof, benches under it and the platform number on
// a post at each end. len along the platform.
function canopy(len, w, perrons) {
  const k = new Kit(), h = 3.8, posts = [];
  for (let x = -len / 2 + 1.5; x <= len / 2 - 1.4; x += (len - 3) / Math.round((len - 3) / 5.5)) {
    for (const z of [-w * 0.22, w * 0.22]) { k.rod([x, 0, z], [x, h, z], 0.09, 0x8f979c, 8); posts.push([x, z]); }
    k.box(1.8, 0.06, 0.4, 0x9b7653, x + 2.7, 0.45, 0); // a bench between the posts
    k.box(1.8, 0.4, 0.06, 0x9b7653, x + 2.7, 0.7, -0.2);
  }
  k.box(len, 0.28, w, 0xe9ecee, 0, h + 0.14, 0);
  for (const z of [-w / 2, w / 2]) k.box(len + 0.06, 0.32, 0.06, 0xffcc00, 0, h + 0.14, z);
  for (const x of [-len / 2, len / 2]) k.box(0.06, 0.32, w + 0.06, 0xffcc00, x, h + 0.14, 0);
  // the platform signs at the ends: a post, a yellow box with the number in a white square
  perrons.forEach((n, i) => {
    const x = (i ? 1 : -1) * (len / 2 - 0.6);
    k.rod([x, 0, 0], [x, 2.9, 0], 0.05, 0x5f666b);
    k.box(0.6, 0.6, 0.12, 0xffcc00, x, 2.9, 0);
    k.box(0.36, 0.36, 0.14, 0xffffff, x, 2.9, 0);
    for (let d = 0; d < String(n).length; d++) k.box(0.05, 0.22, 0.16, 0x1d1a17, x - 0.06 * (String(n).length - 1) + d * 0.12, 2.9, 0);
  });
  const m = k.mesh(kitMat(0.5, 0.15));
  m.name = 'zuid-canopy';
  return { m, posts };
}

// ------------------------------------------------------------------ the neuzekes carts

// The two cuberdon carts (neuzekes, the purple cone-shaped sweets Ghent is known for) that stand
// side by side on the Groentenmarkt, in front of Tierenteyn's mustard shop and the 3.14 café,
// rivals for decades: a wooden
// handcart on two big spoked wheels, its sloping tray piled with rows of purple neuzekes and a few
// trays of other colours, a striped awning on four poles, the seller behind it, and on top a
// placard with a drawn neuzeke on both faces. 2.2 m wide along x, the customers' side towards +z.
const CART = { w: 2.2, d: 1.1 };
const CARTS = [
  { body: 0x8e1b2a, canvas: [0x8e1b2a, 0xf5efe0], board: '#fbf3df', ink: '#5b1a5e', shirt: 0xf5f5f5, hair: 0x5d4037 },
  { body: 0x1f5135, canvas: [0x1f5135, 0xf5efe0], board: '#fff7d6', ink: '#7a1f3d', shirt: 0x1e88e5, hair: 0x2b1d14 },
];
const PURPLE = 0x7b1f6a, FLAVOURS = [0xc2185b, 0x2e7d32, 0xf9a825, 0x1565c0, 0x6a1b9a];

// the placard's drawing: a big purple neuzeke with its shine, and NEUZEKES under it
function placardTexture({ board, ink }) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 192;
  const g = c.getContext('2d');
  g.fillStyle = board; g.fillRect(0, 0, 256, 192);
  g.strokeStyle = ink; g.lineWidth = 8; g.strokeRect(6, 6, 244, 180);
  // the neuzeke: a cone with a rounded tip and a bulging base, purple going dark at the edges
  const grad = g.createLinearGradient(80, 0, 176, 0);
  grad.addColorStop(0, '#4a0f45'); grad.addColorStop(0.45, '#9c2a8a'); grad.addColorStop(1, '#3d0b38');
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(128, 22);
  g.quadraticCurveTo(140, 22, 150, 50);
  g.quadraticCurveTo(178, 110, 176, 122);
  g.quadraticCurveTo(128, 146, 80, 122);
  g.quadraticCurveTo(78, 110, 106, 50);
  g.quadraticCurveTo(116, 22, 128, 22);
  g.fill();
  g.strokeStyle = '#2b0727'; g.lineWidth = 3; g.stroke();
  // the shine down its side
  g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(120, 42); g.quadraticCurveTo(104, 80, 98, 112); g.stroke();
  g.fillStyle = ink;
  g.font = 'bold 34px "Arial Black", Arial, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('NEUZEKES', 128, 166);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function neuzekesCart(i) {
  const look = CARTS[i % CARTS.length], k = new Kit(), { w, d } = CART;
  const WOOD = 0x8d6e4a, POLE = 0x8a8f94, top = 0.95;
  // the two big spoked wheels, one each side, and the axle
  for (const sx of [-1, 1]) {
    const x = sx * (w / 2 + 0.06);
    k.add(new THREE.TorusGeometry(0.42, 0.04, 6, 16), 0x3a2b20, x, 0.46, 0, 0, Math.PI / 2);
    k.add(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8), 0x3a2b20, x, 0.46, 0, 0, 0, Math.PI / 2);
    for (let s = 0; s < 6; s++) k.box(0.03, 0.82, 0.03, WOOD, x, 0.46, 0, s * (Math.PI / 6), 0, 0);
  }
  k.rod([-w / 2 - 0.06, 0.46, 0], [w / 2 + 0.06, 0.46, 0], 0.025, 0x3a2b20);
  // the cart's painted body, a trim along its top, and the shafts sticking out at the back
  k.box(w, 0.42, d, look.body, 0, top - 0.21, 0);
  k.box(w + 0.04, 0.05, d + 0.04, 0xd8c08a, 0, top, 0);
  for (const sx of [-0.7, 0.7]) k.rod([sx, top - 0.3, -d / 2], [sx, 0.7, -d / 2 - 0.9], 0.03, WOOD);
  // a leg at the front so it stands level
  for (const sx of [-0.8, 0.8]) k.box(0.05, top - 0.42, 0.05, WOOD, sx, (top - 0.42) / 2, d / 2 - 0.1);
  // the tray, sloping up to the back, and the neuzekes on it in rows: mostly purple, the front
  // row of trays in other flavours
  const tilt = 0.28;
  k.box(w - 0.1, 0.04, d - 0.1, 0xe8dcc0, 0, top + 0.15, 0, tilt);
  const cone = new THREE.ConeGeometry(0.045, 0.1, 6);
  for (let row = 0; row < 7; row++) {
    const z = d / 2 - 0.12 - row * 0.13, y = top + 0.22 - z * Math.tan(tilt);
    for (let x = -w / 2 + 0.12; x < w / 2 - 0.08; x += 0.1) {
      const hex = row === 0 ? FLAVOURS[Math.floor((x + w / 2) / 0.44) % FLAVOURS.length] : PURPLE;
      k.add(cone, hex, x, y, z);
    }
  }
  // the awning: four poles and a striped canvas sloping down to the front
  const H = 2.15;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (w / 2 - 0.04), z = sz * (d / 2 - 0.04);
    k.rod([x, top, z], [x, H + (sz < 0 ? 0.3 : 0), z], 0.022, POLE);
  }
  const slope = Math.atan2(0.3, d), len = Math.hypot(d, 0.3) + 0.3, n = 7;
  for (let s = 0; s < n; s++) {
    const x = -w / 2 - 0.1 + ((s + 0.5) * (w + 0.2)) / n, c = look.canvas[s % 2];
    k.box((w + 0.2) / n, 0.03, len, c, x, H + 0.17, 0.08, slope);
    k.box((w + 0.2) / n, 0.22, 0.02, c, x, H - 0.08, d / 2 + 0.18);
  }
  // the placard's frame and its two posts, standing on the awning
  const PY = H + 0.75;
  for (const sx of [-0.45, 0.45]) k.rod([sx, H + 0.3, -0.1], [sx, PY + 0.4, -0.1], 0.02, 0x3a2b20);
  k.box(1.24, 0.92, 0.05, 0x3a2b20, 0, PY, -0.1);
  // the seller, behind the cart
  const z = -d / 2 - 0.4;
  for (const lx of [-0.1, 0.1]) k.box(0.14, 0.82, 0.15, 0x37474f, lx, 0.41, z);
  k.box(0.42, 0.62, 0.24, look.shirt, 0, 1.13, z);
  k.box(0.38, 0.7, 0.02, 0xf5f5f5, 0, 1.0, z + 0.13);
  for (const lx of [-0.28, 0.28]) k.box(0.1, 0.56, 0.11, 0xe0ac69, lx, 1.12, z + 0.08, -0.35);
  k.add(new THREE.SphereGeometry(0.15, 8, 6), 0xe0ac69, 0, 1.6, z);
  k.add(new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), look.hair, 0, 1.64, z - 0.01);
  const g = new THREE.Group();
  g.add(k.mesh(kitMat(0.8)));
  // the drawing on both faces of the placard
  const mat = new THREE.MeshStandardMaterial({ map: placardTexture(look), roughness: 0.85 });
  for (const face of [1, -1]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 0.84), mat);
    p.position.set(0, PY, -0.1 + face * 0.03);
    if (face < 0) p.rotation.y = Math.PI;
    g.add(p);
  }
  return g;
}

// the two carts side by side on the Groentenmarkt, along the fronts of Tierenteyn and the 3.14 on
// the square's east side (their shared corner, from OpenStreetMap), the sellers' backs to the
// shops and their customers on the square
function carts({ x, z, turn, gap }) {
  const c = Math.cos(turn), s = Math.sin(turn);
  return [-gap / 2, gap / 2].map((u, i) => ({
    id: `neuzekeskraam-${i + 1}`, name: i ? undefined : 'Neuzekeskraam', x: x + u * c, z: z - u * s, turn,
    size: [CART.w + 0.4, CART.d + 1.6], make: () => neuzekesCart(i),
  }));
}

// ------------------------------------------------------------------ Bij Filip

// Frituur Bij Filip (Pensmarkt 8), the little wooden chip shop built against the Groot Vleeshuis
// where it meets the Groentenmarkt: an oak box with panelled sides under a brown lean-to roof, a
// white counter in front of a big window, the flap over it propped up on two rods as an awning,
// the frier behind the glass and a black bin beside it. W along the hall's wall, its back against
// it, the counter side towards +z.
const FRIT = { w: 4.4, d: 2.6 };

function filipSign() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const g = c.getContext('2d');
  g.fillStyle = '#f4efe2'; g.fillRect(0, 0, 512, 96);
  g.fillStyle = '#7a2a1c';
  g.font = 'bold 54px Georgia, "Times New Roman", serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('Bij Filip', 256, 50);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function frituurFilip() {
  const k = new Kit(), { w, d } = FRIT, f = d / 2;
  const OAK = 0x9a6233, OAK_DARK = 0x6e4322, BROWN = 0x4e3322, ALU = 0xa7abad, WHITE = 0xeeeeea, CREAM = 0xe9dfc4, STEEL = 0xb8bcbf;
  const BASE = 1.0, TOP = 2.35, H = 2.75;
  // the oak base, its panels framed in darker strips, front and sides
  k.box(w, BASE, d, OAK, 0, BASE / 2, 0);
  for (let i = 0; i < 4; i++) k.box(0.06, BASE - 0.1, 0.03, OAK_DARK, -w / 2 + (w / 4) * (i + 0.5) - w / 8 + 0.02, BASE / 2, f + 0.01);
  for (const y of [0.08, BASE - 0.06]) k.box(w, 0.08, 0.04, OAK_DARK, 0, y, f + 0.01);
  for (const sx of [-1, 1]) {
    k.box(0.04, 0.08, d, OAK_DARK, sx * (w / 2 + 0.01), BASE - 0.06, 0);
    k.box(0.03, BASE - 0.1, 0.06, OAK_DARK, sx * (w / 2 + 0.01), BASE / 2, 0);
  }
  // the white counter, sticking out over the base
  k.box(w - 0.3, 0.06, 0.6, WHITE, -0.1, BASE + 0.03, f + 0.18);
  // the walls round the window: oak sides, a narrow oak post at the right end where the door is,
  // the brown band over the glass, and the back against the hall
  for (const sx of [-1, 1]) k.box(0.08, TOP - BASE, d, OAK, sx * (w / 2 - 0.04), (BASE + TOP) / 2, 0);
  k.box(0.5, TOP - BASE, 0.08, OAK, w / 2 - 0.25, (BASE + TOP) / 2, f - 0.04);
  k.box(w, H - TOP, d, BROWN, 0, (TOP + H) / 2, 0);
  k.box(w, H - BASE, 0.08, CREAM, 0, (BASE + H) / 2, -f + 0.04);
  // the window's aluminium frame: posts and a sill
  for (const x of [-w / 2 + 0.1, -0.35, w / 2 - 0.52]) k.box(0.06, TOP - BASE, 0.06, ALU, x, (BASE + TOP) / 2, f - 0.03);
  k.box(w - 0.6, 0.05, 0.06, ALU, -0.2, TOP - 0.03, f - 0.03);
  // inside: the frier and its hood, a shelf, the lamp
  k.box(1.6, 0.35, 0.6, STEEL, -0.6, BASE + 0.175, -f + 0.45);
  k.box(1.7, 0.35, 0.7, STEEL, -0.6, TOP - 0.25, -f + 0.45);
  k.box(1.2, 0.04, 0.35, OAK_DARK, 1.1, BASE + 0.8, -f + 0.25);
  // the roof: a brown lean-to falling to the front, overhanging all round
  const RW = w + 0.4, RD = d + 0.5, fall = 0.3;
  k.box(RW, 0.08, Math.hypot(RD, fall), BROWN, 0, H + 0.12, 0.1, Math.atan2(fall, RD));
  // the flap over the counter, propped up on two rods as an awning, and a lamp under it
  const FL = 1.35, tilt = 0.42;
  const fz = f + Math.cos(tilt) * FL / 2, fy = TOP + 0.05 + Math.sin(tilt) * FL / 2;
  k.box(w - 0.5, 0.05, FL, BROWN, -0.2, fy, fz, -tilt);
  for (const sx of [-1, 1]) k.rod([sx * (w / 2 - 0.4), BASE + 0.1, f], [sx * (w / 2 - 0.4), TOP + 0.05 + Math.sin(tilt) * FL - 0.03, f + Math.cos(tilt) * FL - 0.05], 0.025, 0x1f1f1f);
  k.box(0.3, 0.12, 0.2, 0x2a2a2a, -0.2, fy - 0.1, fz);
  // the seller behind the counter
  const z = f - 0.75;
  k.box(0.44, 0.62, 0.26, 0x2f3b4a, 0.2, BASE + 0.4, z);
  k.add(new THREE.SphereGeometry(0.15, 8, 6), 0xe0ac69, 0.2, BASE + 0.9, z);
  k.add(new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), 0x4a3b30, 0.2, BASE + 0.94, z - 0.01);
  // the black bin beside it on the square, with its lid
  k.add(new THREE.CylinderGeometry(0.33, 0.28, 0.85, 12), 0x1b1b1b, w / 2 + 0.45, 0.425, f + 0.9);
  k.add(new THREE.CylinderGeometry(0.36, 0.36, 0.05, 12), 0x111111, w / 2 + 0.45, 0.87, f + 0.9);
  const g = new THREE.Group();
  g.add(k.mesh(kitMat(0.8)));
  // the glass, lit a little from inside
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.8, TOP - BASE - 0.1),
    new THREE.MeshStandardMaterial({ color: 0xcfe2e6, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.35, emissive: 0x332a10 }));
  glass.position.set(-0.3, (BASE + TOP) / 2, f - 0.02);
  g.add(glass);
  // the name on a board hanging from the flap's front edge
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3), new THREE.MeshStandardMaterial({ map: filipSign(), roughness: 0.85 }));
  sign.position.set(-0.2, TOP + Math.sin(tilt) * FL - 0.15, f + Math.cos(tilt) * FL + 0.03);
  g.add(sign);
  return g;
}

// ------------------------------------------------------------------ the pavilions and the stalls

const { chairs: KIOSK_CHAIRS } = kioskChairs();
const A = canopy(22.5, 6.7, [3, 4]), B = canopy(27.7, 6.8, [5, 6]);

export const PAVILIONS = [
  // the bandstand, on the OpenStreetMap outline in the middle of the Kouter (game metres), its long
  // side along the square
  { id: 'kouter-bandstand', name: 'Kiosk op de Kouter', x: 6.6, z: 460, turn: 0.12, size: [13.2, 8.8], make: bandstand },
  // the blue kiosk right in the Kouter's north-east corner, between the trees along the north side
  // and the glass pavilion over the car park's stairs (ghent/kouter.js)
  { id: 'blauwe-kiosk', name: 'Blauwe kiosk', x: 85, z: 431, turn: 0.12, size: [KIOSK.w + 0.6, KIOSK.d + 0.6], chairs: KIOSK_CHAIRS, make: blueKiosk },
  // the two canopies over the bus platforms at Zuid, on the outlines OpenStreetMap has for them
  { id: 'zuid-perron-3', name: 'Busstation Gent Zuid', x: 690.9, z: 715.2, turn: -1.207, size: [22.5, 6.7], posts: A.posts, make: () => A.m.clone() },
  { id: 'zuid-perron-5', x: 675.5, z: 717.8, turn: -1.22, size: [27.7, 6.8], posts: B.posts, make: () => B.m.clone() },
];

// The flower stalls in rows, laid out round a point in the square: (u, v) along and across
// the square, turned by `turn` like the statues (local x along, z across); face: 1 if the stall's
// customers are on the +v side, -1 the other.
function rows({ id, x, z, turn, rows }) {
  const c = Math.cos(turn), s = Math.sin(turn), out = [];
  for (const { v, face, from, to, step } of rows) {
    for (let u = from; u <= to + 0.01; u += step) {
      const k = out.length + 1;
      out.push({ id: `${id}-${k}`, name: k === 1 ? 'Bloemenkraam' : undefined, x: x + u * c + v * s, z: z - u * s + v * c, turn: turn + (face > 0 ? 0 : Math.PI), size: STALL_SIZE, make: () => flowerStall(k + id.length) });
    }
  }
  return out;
}

export const STALLS = [
  // the Kouter's Sunday flower market (the Bloemenmarkt): two rows facing each other across an
  // aisle, north of the bandstand, along the square
  ...rows({ id: 'bloemenmarkt', x: 6.6, z: 460, turn: 0.12, rows: [
    { v: -21, face: 1, from: -54, to: 45, step: 9 },
    { v: -12.5, face: -1, from: -54, to: 45, step: 9 },
  ] }),
  // a few on the Vrijdagmarkt, in the open middle of the square, inside its ring of trees
  ...rows({ id: 'vrijdagmarkt-kraam', x: 150, z: -505, turn: -0.532, rows: [
    { v: -6, face: 1, from: -20, to: 16, step: 6 },
    { v: 3.5, face: -1, from: -20, to: 16, step: 6 },
  ] }),
  // the two neuzekes carts on the Groentenmarkt
  ...carts({ x: -120, z: -318.9, turn: -2.209, gap: 3 }),
  // Bij Filip, against the Groot Vleeshuis's side on the Groentenmarkt, in the gap between two of
  // its low lean-tos (OpenStreetMap has Frituur Filip, Pensmarkt 8, at its corner), its back on
  // the hall's wall and its counter on the square
  { id: 'frituur-filip', name: 'Frituur Bij Filip', x: -181.1, z: -340, turn: 0.736, size: [FRIT.w + 1.4, FRIT.d + 0.8], make: frituurFilip },
];
