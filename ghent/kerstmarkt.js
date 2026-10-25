// A Christmas market on the Groentenmarkt, only for the tour (it flies over it in the snow at
// night): wooden chalets with their counters lit, fairy lights along their eaves and snow on their
// roofs, round a big Christmas tree, and a few smaller trees, between the real trees on the square
// (map.js) and clear of the camera's path (hand-written). Real metres, 1.25 to a game metre.
//
// TOUR_PROPS: what the tour puts in the city while it flies (core/js/main.js shows them only then):
// each { id, x, z (game metres), turn (radians, 0 = facing +z), make() }.
import * as THREE from 'three';

const S = 1.25; // game metres to a real metre
const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
const glow = (color, strength = 1.6) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: strength, roughness: 0.6 });

const WOOD = std(0x8a5a34), DARK = std(0x5a3a22), ROOF = std(0x4a3426), SNOW = std(0xf4f7fb, { roughness: 0.95 });
const INSIDE = glow(0xffc779, 1.1), BULB = glow(0xffe2a0, 2.2), RED = glow(0xff4a3a, 1.8), STAR = glow(0xffd84a, 2.4);
const NEEDLES = std(0x1d5a35), TRUNK = std(0x5b3d27);
const GOODS = [0xc0392b, 0xf1c40f, 0x2e86c1, 0xe67e22, 0x27ae60, 0xffffff].map(c => std(c));

function box(g, w, h, d, mat, x, y, z, ry = 0, rz = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), mat);
  m.position.set(x * S, y * S, z * S);
  m.rotation.set(0, ry, rz);
  m.castShadow = true;
  g.add(m);
  return m;
}

// One chalet, 3 m wide and 2.2 m deep, its front (+z) open over a counter with the light on inside,
// a pitched roof with snow on it, fairy lights along the front's eaves and things for sale on the counter.
function chalet(seed) {
  const g = new THREE.Group(), W = 3, D = 2.2, H = 2.3;
  box(g, W, 0.15, D, DARK, 0, 0.075, 0); // the floor
  box(g, W, H, 0.08, WOOD, 0, H / 2, -D / 2); // the back
  for (const s of [-1, 1]) box(g, 0.08, H, D, WOOD, s * W / 2, H / 2, 0); // the sides
  box(g, W - 0.1, 1.0, 0.08, WOOD, 0, 0.5, D / 2); // below the counter
  box(g, W + 0.2, 0.08, 0.5, DARK, 0, 1.04, D / 2 + 0.15); // the counter
  box(g, W - 0.2, H - 1.1, 0.04, INSIDE, 0, 1.1 + (H - 1.1) / 2, -D / 2 + 0.06); // the light inside, on the back wall
  box(g, W, 0.35, 0.08, WOOD, 0, H - 0.17, D / 2); // the lintel over the opening
  // the roof: two slopes, and snow on each
  const run = D / 2 + 0.35, pitch = 0.5;
  for (const s of [-1, 1]) {
    const slope = Math.hypot(run, run * Math.tan(pitch));
    const z = s * run / 2, y = H + run * Math.tan(pitch) / 2;
    box(g, W + 0.5, 0.1, slope, ROOF, 0, y, z, 0, 0).rotation.x = s * pitch;
    box(g, W + 0.5, 0.12, slope * 0.95, SNOW, 0, y + 0.1, z, 0, 0).rotation.x = s * pitch;
  }
  // fairy lights along the front's eaves
  const bulb = new THREE.SphereGeometry(0.06 * S, 8, 6);
  for (let k = 0; k <= 12; k++) {
    const m = new THREE.Mesh(bulb, k % 4 === 2 ? RED : BULB);
    m.position.set((-W / 2 - 0.2 + (W + 0.4) * k / 12) * S, (H - 0.05 - Math.sin(k / 12 * Math.PI) * 0.12) * S, (run + 0.02) * S);
    g.add(m);
  }
  // things for sale on the counter
  for (let k = 0; k < 6; k++) box(g, 0.28, 0.18 + ((seed * 7 + k * 3) % 4) * 0.06, 0.25, GOODS[(seed + k) % GOODS.length], -1.2 + k * 0.48, 1.16, D / 2 + 0.12);
  return g;
}

// A Christmas tree, h real metres tall: three tiers of needles, snow on them, lights all over and
// a star on top (big: more lights).
function tree(h, lights) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * h / 4 * S, 0.16 * h / 4 * S, h * 0.2 * S, 8), TRUNK);
  trunk.position.y = h * 0.1 * S;
  g.add(trunk);
  const tiers = [[0.42, 0.16, 0.45], [0.32, 0.4, 0.38], [0.2, 0.62, 0.32]]; // radius and base height (of h), height of the cone
  for (const [r, y, c] of tiers) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r * h * S, c * h * S, 14), NEEDLES);
    cone.position.y = (y + c / 2) * h * S;
    cone.castShadow = true;
    g.add(cone);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(r * h * 0.55 * S, c * h * 0.45 * S, 14), SNOW);
    cap.position.y = (y + c * 0.78) * h * S;
    g.add(cap);
  }
  // the lights, spiralling round the tiers
  const bulb = new THREE.SphereGeometry(0.07 * S * Math.max(1, h / 5), 8, 6);
  for (let k = 0; k < lights; k++) {
    const u = k / lights, y = 0.18 + u * 0.72, r = (0.42 - u * 0.36) * h * 0.95, a = k * 2.4;
    const m = new THREE.Mesh(bulb, k % 5 === 0 ? RED : BULB);
    m.position.set(Math.cos(a) * r * S, y * h * S, Math.sin(a) * r * S);
    g.add(m);
  }
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.06 * h * S), STAR);
  star.position.y = (0.94 + 0.04) * h * S;
  g.add(star);
  return g;
}

// The market: the chalets facing the way the camera comes in from (east, up the Langemunt), the big
// tree among them, small trees round them. Laid out in game metres round the big tree.
const CENTRE = [-140, -347];
const CHALETS = [[-144, -338], [-136, -340], [-152, -354], [-155, -328], [-158, -346], [-145, -362]];
const SMALL = [[-151, -331], [-161, -356], [-160, -325], [-149, -357]];

function market() {
  const g = new THREE.Group(), [cx, cz] = CENTRE;
  const big = tree(9, 70);
  g.add(big);
  CHALETS.forEach(([x, z], i) => {
    const c = chalet(i);
    c.position.set(x - cx, 0, z - cz);
    c.rotation.y = Math.atan2(-118 - x, -347 - z); // towards the Langemunt side
    g.add(c);
  });
  for (const [x, z] of SMALL) {
    const t = tree(3.2, 18);
    t.position.set(x - cx, 0, z - cz);
    g.add(t);
  }
  return g;
}

export const TOUR_PROPS = [{ id: 'kerstmarkt', x: CENTRE[0], z: CENTRE[1], turn: 0, make: market }];
