// The Blaarmeersen's beaches in summer: striped parasols stuck in the sand, a lounger or two under
// some, and on the grass behind the long beach Le Beach House, the beach bar and restaurant, with its
// deck out towards the sand and the lake. They join the statues (ghent/monuments.js); the
// sunbathers lie in the parasols' shade (js/sitters.js, the poles) and sit at its tables (chairs).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { BEACHES } from './blaarmeersen.js';

const inside = (x, z, p) => {
  let hit = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) hit = !hit;
  }
  return hit;
};
// how far (x, z) is from the outline's edge
const edge = (x, z, p) => {
  let d = Infinity;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const ax = p[j], az = p[j + 1], dx = p[i] - ax, dz = p[i + 1] - az, L2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    d = Math.min(d, Math.hypot(x - ax - t * dx, z - az - t * dz));
  }
  return d;
};

// ------------------------------------------------------------------ the parasols

const STRIPES = [[0xd8322f, 0xf6f1e4], [0x1f5fa8, 0xf6f1e4], [0xf0b429, 0xf6f1e4], [0x2a9d8f, 0xf6f1e4], [0xe76f51, 0xfdf3d8], [0x6a4c93, 0xf6f1e4]];

// where they stand on a beach: one every 9 m or so, not right at its edge, about half the spots taken
function spots(p, seed) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const xs = p.filter((_, i) => !(i % 2)), zs = p.filter((_, i) => i % 2), out = [];
  for (let x = Math.min(...xs); x < Math.max(...xs); x += 9) {
    for (let z = Math.min(...zs); z < Math.max(...zs); z += 9) {
      const px = x + rand() * 6, pz = z + rand() * 6;
      if (rand() < 0.45 || !inside(px, pz, p) || edge(px, pz, p) < 3) continue;
      out.push({ x: px, z: pz, colors: STRIPES[Math.floor(rand() * STRIPES.length)], tilt: (rand() - 0.5) * 0.3, turn: rand() * Math.PI * 2, lounger: rand() < 0.35 });
    }
  }
  return out;
}

// one parasol at (x, z) of the kit: a pole stuck in the sand, leaning a little, under a round cloth of
// eight panels in two colours, and maybe a white lounger in its shade
function parasol(k, { x, z, colors, tilt, turn, lounger }) {
  const top = [x + Math.sin(turn) * tilt * 2.3, 2.3, z + Math.cos(turn) * tilt * 2.3];
  k.rod([x, 0, z], top, 0.03, 0xe8e2d4);
  for (let w = 0; w < 8; w++) {
    k.add(new THREE.ConeGeometry(1.35, 0.42, 3, 1, false, (w / 8) * Math.PI * 2, Math.PI / 4), colors[w % 2], top[0], top[1] + 0.12, top[2], Math.sin(turn) * tilt * 0.5, 0, -Math.cos(turn) * tilt * 0.5);
  }
  k.add(new THREE.SphereGeometry(0.05, 6, 4), 0xe8e2d4, top[0], top[1] + 0.35, top[2]);
  if (!lounger) return;
  // the lounger: a slatted frame, its back raised, beside the pole
  const ly = turn + Math.PI / 2, c = Math.cos(ly), s = Math.sin(ly), at = (a, b) => [x + 1.0 * Math.cos(turn) + a * s + b * c, z - 1.0 * Math.sin(turn) + a * c - b * s];
  const [mx, mz] = at(0, 0), [bx, bz] = at(0.75, 0);
  k.box(0.62, 0.06, 1.3, 0xf4f2ec, mx, 0.32, mz, 0, ly);
  k.box(0.62, 0.06, 0.65, 0xf4f2ec, bx, 0.52, bz, -0.7, ly);
  for (const [a, b] of [[-0.6, -0.27], [-0.6, 0.27], [0.5, -0.27], [0.5, 0.27]]) { const [px, pz] = at(a, b); k.box(0.04, 0.3, 0.04, 0xd9d6cf, px, 0.15, pz); }
}

const PARASOLS = BEACHES.map((p, k) => {
  const list = spots(p, 11 + k * 17);
  const xs = list.map(o => o.x), zs = list.map(o => o.z);
  const x = (Math.min(...xs) + Math.max(...xs)) / 2, z = (Math.min(...zs) + Math.max(...zs)) / 2;
  return {
    id: `strand-parasols-${k + 1}`, x, z, turn: 0, size: 0.2, reach: 200,
    // the poles, for the sunbathers to lie by, and to bump into (foot); area too, so the map does not
    // also put up a building of its own on each
    poles: list.map(o => [o.x, o.z]),
    foot: list.map(o => [o.x - 0.15, o.z - 0.15, o.x + 0.15, o.z - 0.15, o.x + 0.15, o.z + 0.15, o.x - 0.15, o.z + 0.15]),
    get area() { return this.foot; },
    make: () => {
      const kit = new Kit();
      for (const o of list) parasol(kit, { ...o, x: o.x - x, z: o.z - z });
      return kit.mesh(kitMat(0.7));
    },
  };
});

// ------------------------------------------------------------------ Le Beach House

// On the grass just behind the middle of the long beach, its front to the beach and the lake (+z, as
// it is turned): 26 by 12 m, its middle at (x, z), the deck 9 m deep in front of it.
const HOUSE = { x: -3300, z: 1274, turn: -0.095, W: 26, D: 12, DECK: 9 };
const WOOD = 0xc9a173, BATTEN = 0x8a6644, DARK = 0x24272b, DECKWOOD = 0xa9835c, WHITE = 0xf3f1ea;

// where the tables and chairs stand on the deck (the house's own metres, y the deck's top)
function deckLayout() {
  const { W, D, DECK } = HOUSE, chairs = [], tables = [], parasols = [];
  for (let r = 0; r < 3; r++) {
    const z = D / 2 + 1.8 + r * 2.4, shift = r % 2 ? 1.3 : 0;
    for (let x = -W / 2 + 2 + shift; x <= W / 2 - 2; x += 2.6) {
      if (Math.abs(x) < 1.6) continue; // the way through to the steps
      tables.push([x, z]);
      chairs.push({ x: x - 0.6, z, yaw: Math.PI / 2, y: 0.18 }, { x: x + 0.6, z, yaw: -Math.PI / 2, y: 0.18 });
    }
  }
  for (let x = -W / 2 + 3.3; x <= W / 2 - 2; x += 5.2) if (Math.abs(x) > 1.6) parasols.push([x, D / 2 + 3]);
  return { chairs, tables, parasols };
}

function signTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#24272b'; x.fillRect(0, 0, 1024, 128);
  // a little sun going down over the water
  x.fillStyle = '#f0b429'; x.beginPath(); x.arc(150, 84, 34, Math.PI, 0); x.fill();
  x.fillStyle = '#5fb3c9'; for (let k = 0; k < 3; k++) x.fillRect(108 + k * 6, 92 + k * 9, 84 - k * 12, 4);
  x.fillStyle = '#f6f1e4'; x.font = 'bold 76px Georgia, serif'; x.textAlign = 'left'; x.textBaseline = 'middle';
  x.fillText('Le Beach House', 230, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function beachHouse() {
  const { W, D, DECK } = HOUSE, H = 4.2, g = new THREE.Group(), k = new Kit(), glass = new Kit();
  // the floor slab and the walls: the back and the sides clad in upright larch boards with dark
  // battens, a kitchen door and a few windows; the front all glass between thin black mullions
  k.box(W + 0.4, 0.3, D + 0.4, 0xb9b4a8, 0, 0.15, 0);
  k.box(W, H, 0.3, WOOD, 0, 0.3 + H / 2, -D / 2 + 0.15);
  for (const sd of [-1, 1]) k.box(0.3, H, D, WOOD, sd * (W / 2 - 0.15), 0.3 + H / 2, 0);
  for (let x = -W / 2 + 0.6; x < W / 2; x += 0.6) k.box(0.06, H, 0.05, BATTEN, x, 0.3 + H / 2, -D / 2 - 0.02);
  for (const sd of [-1, 1]) for (let z = -D / 2 + 0.6; z < D / 2; z += 0.6) k.box(0.05, H, 0.06, BATTEN, sd * (W / 2 + 0.02), 0.3 + H / 2, z);
  k.box(1.1, 2.3, 0.08, DARK, W / 2 - 3, 1.45, -D / 2 - 0.05); // the kitchen door
  for (const x of [-8, -3]) glass.box(2.2, 1.3, 0.06, 0x7fa6b3, x, 2.6, -D / 2 - 0.05);
  for (const sd of [-1, 1]) glass.box(0.06, 2.2, 5, 0x7fa6b3, sd * (W / 2 + 0.05), 2.2, 1.5);
  glass.box(W - 0.6, H - 0.2, 0.06, 0x8fb7c4, 0, 0.3 + H / 2, D / 2 - 0.15);
  for (let x = -W / 2 + 0.3; x <= W / 2 - 0.3; x += 2.6) k.box(0.1, H, 0.14, DARK, x, 0.3 + H / 2, D / 2 - 0.1);
  k.box(W, 0.12, 0.16, DARK, 0, 2.6, D / 2 - 0.1); // the transom
  k.box(2.4, 2.5, 0.08, DARK, 0, 1.55, D / 2 - 0.08); // the doors in the middle, open frames
  glass.box(2.2, 2.3, 0.06, 0xa9cbd6, 0, 1.5, D / 2 - 0.02);
  // the flat roof, reaching out over the front as a canopy on slim posts, a dark fascia with the sign
  const R = 0.3 + H;
  k.box(W + 0.8, 0.35, D + 3.4, WHITE, 0, R + 0.17, 1.5);
  k.box(W + 0.8, 0.9, 0.12, DARK, 0, R + 0.2, D / 2 + 3.2);
  for (let x = -W / 2 + 0.4; x <= W / 2; x += 6.4) k.rod([x, 0.3, D / 2 + 3], [x, R, D / 2 + 3], 0.07, DARK, 8);
  // the upper floor on the left: a glass box for the lounge, and on the right the roof terrace
  // behind a glass balustrade, with a few lounge chairs
  k.box(11, 0.3, 9, WOOD, -W / 2 + 6, R + 0.5, -0.8);
  glass.box(10.6, 2.8, 8.6, 0x86adbb, -W / 2 + 6, R + 2.05, -0.8);
  k.box(11.6, 0.3, 9.6, WHITE, -W / 2 + 6, R + 3.55, -0.8);
  for (let x = -W / 2 + 0.7; x < -W / 2 + 11.5; x += 2.2) k.box(0.1, 2.8, 0.1, DARK, x, R + 2.05, -0.8 + 4.35);
  glass.box(W - 12, 1.0, 0.04, 0xbfd7de, 5.5, R + 0.85, D / 2 + 1.4);
  glass.box(0.04, 1.0, D - 1, 0xbfd7de, W / 2 - 0.3, R + 0.85, 0.4);
  k.box(W - 12, 0.05, 0.08, DARK, 5.5, R + 1.37, D / 2 + 1.4);
  for (const x of [1.5, 4, 6.5, 9]) {
    k.box(0.7, 0.3, 1.8, 0xf4f2ec, x, R + 0.55, D / 2 - 0.6);
    k.box(0.7, 0.5, 0.15, 0xf4f2ec, x, R + 0.85, D / 2 - 1.45, -0.3);
  }
  // the deck, its planks across, a step down to the sand in the middle, a low rail round its edge
  k.box(W, 0.18, DECK, DECKWOOD, 0, 0.09, D / 2 + DECK / 2);
  for (let z = D / 2 + 0.25; z < D / 2 + DECK; z += 0.5) k.box(W, 0.01, 0.03, 0x8a6a48, 0, 0.185, z);
  k.box(3, 0.09, 0.8, DECKWOOD, 0, 0.045, D / 2 + DECK + 0.4);
  for (const sd of [-1, 1]) {
    k.box(W / 2 - 1.6, 0.08, 0.08, 0x8a6a48, sd * (W / 4 + 0.8), 1.0, D / 2 + DECK - 0.05);
    k.box(0.08, 0.08, DECK, 0x8a6a48, sd * (W / 2 - 0.05), 1.0, D / 2 + DECK / 2);
    for (let x = 1.6; x <= W / 2; x += 1.6) k.box(0.08, 0.82, 0.08, 0x8a6a48, sd * x, 0.59, D / 2 + DECK - 0.05);
    for (let z = D / 2 + 1.6; z < D / 2 + DECK; z += 1.6) k.box(0.08, 0.82, 0.08, 0x8a6a48, sd * (W / 2 - 0.05), 0.59, z);
  }
  // the tables, the rattan chairs, the big white parasols
  const { chairs, tables, parasols } = deckLayout(), Y = 0.18;
  for (const [x, z] of tables) {
    k.box(0.75, 0.04, 0.75, WHITE, x, Y + 0.76, z);
    k.add(new THREE.CylinderGeometry(0.03, 0.03, 0.74, 6), DARK, x, Y + 0.39, z);
    k.box(0.4, 0.03, 0.4, DARK, x, Y + 0.02, z);
  }
  for (const c of chairs) {
    const s = Math.sin(c.yaw), co = Math.cos(c.yaw), at = (lx, lz) => [c.x + lx * co + lz * s, c.z - lx * s + lz * co];
    k.box(0.46, 0.06, 0.46, 0xb08850, c.x, Y + 0.47, c.z, 0, c.yaw);
    const [bx, bz] = at(0, -0.21);
    k.box(0.46, 0.42, 0.05, 0xb08850, bx, Y + 0.7, bz, 0, c.yaw);
    for (const [lx, lz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) { const [px, pz] = at(lx, lz); k.box(0.035, 0.45, 0.035, 0x8a6a48, px, Y + 0.23, pz); }
  }
  for (const [x, z] of parasols) {
    k.box(0.5, 0.08, 0.5, 0x3a3a3a, x, Y + 0.04, z);
    k.rod([x, Y, z], [x, Y + 2.7, z], 0.04, 0xd8d4cc);
    k.add(new THREE.ConeGeometry(1.6 * Math.SQRT2, 0.5, 4, 1, false, Math.PI / 4), WHITE, x, Y + 2.78, z);
    for (const sd of [-1, 1]) {
      k.box(3.2, 0.18, 0.02, WHITE, x, Y + 2.45, z + sd * 1.6);
      k.box(0.02, 0.18, 3.2, WHITE, x + sd * 1.6, Y + 2.45, z);
    }
  }
  // palms in big pots at the deck's corners and by the steps
  for (const [x, z] of [[-W / 2 + 0.8, D / 2 + DECK - 0.8], [W / 2 - 0.8, D / 2 + DECK - 0.8], [-2.2, D / 2 + DECK - 0.7], [2.2, D / 2 + DECK - 0.7]]) {
    k.add(new THREE.CylinderGeometry(0.4, 0.3, 0.7, 10), 0xd9cbb3, x, Y + 0.35, z);
    k.rod([x, Y + 0.6, z], [x + 0.15, Y + 2.6, z + 0.1], 0.07, 0x7a5a3a);
    for (let f = 0; f < 7; f++) {
      const a = (f / 7) * Math.PI * 2;
      k.add(new THREE.ConeGeometry(0.16, 1.4, 4), 0x3f7a3a, x + 0.15 + Math.cos(a) * 0.55, Y + 2.5, z + 0.1 + Math.sin(a) * 0.55, Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2);
    }
  }
  const body = k.mesh(kitMat(0.75));
  const panes = glass.mesh(kitMat(0.1, 0.3));
  g.add(body, panes);
  // the name, on the fascia over the deck and over the door at the back
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 1), new THREE.MeshStandardMaterial({ map: signTexture(), roughness: 0.6 }));
  sign.position.set(0, R + 0.3, D / 2 + 3.27);
  g.add(sign);
  const back = sign.clone();
  back.position.set(0, 3.4, -D / 2 - 0.12);
  back.rotation.y = Math.PI;
  back.scale.setScalar(0.6);
  g.add(back);
  return g;
}

const DECK_CHAIRS = deckLayout().chairs;

export const STRAND = [
  ...PARASOLS,
  {
    id: 'le-beach-house', name: 'Le Beach House', x: HOUSE.x, z: HOUSE.z, turn: HOUSE.turn, size: [HOUSE.W, HOUSE.D], reach: 120,
    chairs: DECK_CHAIRS, make: beachHouse,
  },
];

// what the woods are kept off: the house, its deck and the grass round them
export const CLEARINGS = [[HOUSE.x, HOUSE.z + 4, 30]];
