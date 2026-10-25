// A wedding in front of the Stadhuis, as there so often is on a Saturday: the couple just married
// on the pavement before its Renaissance front on the Botermarkt, she in a long white dress with a
// veil and a bouquet, he in a dark suit with a bow tie, family and friends round them in their best
// clothes, one taking a picture, one throwing confetti, and confetti all over the stones
// (hand-written). Facing +z, the Stadhuis behind them at -z; real metres, 1.25 to a game metre.
import * as THREE from 'three';

const S = 1.25; // game metres to a real metre
export const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const SKINS = [0xe9c3a3, 0xd49f7c, 0xa8724f, 0x7a4b32, 0xf0d0b5];
const HAIRS = [0x2b1d14, 0x5a3a22, 0xc9a35e, 0x1a1412, 0x8a5a3a, 0xb8b3aa];

export function add(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  parent.add(m);
  return m;
}
const limb = (r, L) => new THREE.CapsuleGeometry(r, Math.max(0.01, L - 2 * r), 4, 10).translate(0, -L / 2, 0);
const lathe = (pts, n = 20) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n);

// One person standing, facing +z, feet at y = 0, about 1.75 m: legs (or a skirt), a body, arms,
// a head with hair. o: { top, legs, skin, hair, skirt?: [colour, length, flare], shorts?: their colour
// (then legs is unused), short?: short sleeves, long?: hair, arms?: [left, right] each 'down' | 'front' | 'up', tall? }
export function person(o) {
  const g = new THREE.Group(), tall = o.tall ?? 1;
  const top = std(o.top), skin = std(o.skin, 0.6), hair = std(o.hair, 0.95), shoes = std(o.shoes ?? 0x1c1a19, 0.4);
  if (o.skirt) {
    const [color, length, flare] = o.skirt;
    // (from the hem up, like the body: a lathe drawn from the top down faces inwards, and was seen from inside through its back)
    add(g, lathe([[0.001, 0.96 - length], [0.22 + flare, 0.96 - length], [0.2 + flare * 0.3, 0.96 - length * 0.5], [0.17, 0.96], [0.001, 0.96]]), std(color, 0.75));
    if (length < 0.8) for (const s of [-1, 1]) add(g, limb(0.05, 0.96 - length), skin, s * 0.08, 0.96 - length);
  } else if (o.shorts) {
    for (const s of [-1, 1]) {
      add(g, limb(0.085, 0.36), std(o.shorts, 0.85), s * 0.095, 0.96);
      add(g, limb(0.065, 0.66), skin, s * 0.095, 0.68);
    }
  } else {
    for (const s of [-1, 1]) add(g, limb(0.075, 0.9), std(o.legs, 0.85), s * 0.095, 0.94);
  }
  for (const s of [-1, 1]) add(g, new THREE.BoxGeometry(0.1, 0.07, 0.24), shoes, s * 0.095, 0.035, 0.04);
  // the body, a little fuller at the chest and shoulders
  add(g, lathe([[0.001, 0.92], [0.17, 0.92], [0.18, 1.1], [0.19, 1.3], [0.2, 1.42], [0.12, 1.5], [0.001, 1.52]]), top).scale.z = 0.7;
  add(g, limb(0.05, 0.12).translate(0, 0.12, 0), skin, 0, 1.47);
  const head = new THREE.Group();
  head.position.set(0, 1.66, 0);
  g.add(head);
  add(head, new THREE.SphereGeometry(0.1, 18, 14), skin).scale.set(0.92, 1.1, 1);
  add(head, new THREE.SphereGeometry(0.106, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 0.01, -0.012);
  if (o.long) add(head, new THREE.CylinderGeometry(0.1, 0.12, 0.3, 14, 1, true, Math.PI * 0.6, Math.PI * 0.8), hair, 0, -0.12, -0.01);
  for (const s of [-1, 1]) add(head, new THREE.SphereGeometry(0.009, 6, 5), std(0x16120f, 0.3), s * 0.033, 0.015, 0.093);
  // the arms: hanging down, held out in front (holding something), or up in the air
  const arms = (o.arms ?? ['down', 'down']).map((pose, k) => {
    const s = k ? 1 : -1, shoulder = new THREE.Group();
    shoulder.position.set(s * 0.21, 1.42, 0);
    shoulder.rotation.set(pose === 'front' ? -0.9 : pose === 'up' ? -2.7 : 0, 0, s * (pose === 'up' ? 0.25 : 0.08));
    g.add(shoulder);
    if (o.short) {
      add(shoulder, limb(0.06, 0.2), top);
      add(shoulder, limb(0.045, 0.4).translate(0, -0.16, 0), skin);
    } else add(shoulder, limb(0.055, 0.56), top);
    add(shoulder, new THREE.SphereGeometry(0.045, 10, 8), skin, 0, -0.58, 0);
    return shoulder;
  });
  g.scale.setScalar(tall);
  return { g, head, arms };
}

function bride() {
  const p = person({ top: 0xfbfaf6, skin: 0xefcfb4, hair: 0x6a4428, long: true, skirt: [0xfbfaf6, 0.94, 0.42], shoes: 0xf2efe8, arms: ['front', 'front'], tall: 0.97 });
  const white = std(0xfbfaf6, 0.6, { side: THREE.DoubleSide }), veil = std(0xffffff, 0.5, { transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
  // the train behind her, and the veil from a little tiara down her back
  add(p.g, new THREE.CircleGeometry(0.5, 24).rotateX(-Math.PI / 2), white, 0, 0.02, -0.35).scale.set(0.8, 1, 1.6); // (flat and facing up: the cone it was came out black)
  add(p.head, new THREE.ConeGeometry(0.34, 1.2, 20, 1, true, Math.PI * 0.55, Math.PI * 0.9), veil, 0, -0.5, -0.12, -0.12);
  add(p.head, new THREE.TorusGeometry(0.08, 0.008, 6, 16, Math.PI), std(0xd8c27a, 0.3, { metalness: 0.6 }), 0, 0.09, 0.01, -0.4);
  // the bouquet, held in both hands in front: roses on a ribbon
  const roses = [0xf2d3d8, 0xffffff, 0xe7a9b4, 0xf7e7ea, 0xd98b9b];
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2, r = k ? 0.06 : 0;
    add(p.g, new THREE.SphereGeometry(0.035, 8, 6), std(roses[k % roses.length], 0.7), Math.cos(a) * r, 1.12 + (k ? 0 : 0.02), 0.36 + Math.sin(a) * r * 0.6);
  }
  add(p.g, new THREE.ConeGeometry(0.045, 0.16, 8), std(0x4f7a3a), 0, 1.02, 0.36, Math.PI);
  return p.g;
}

function groom() {
  const p = person({ top: 0x1b2230, legs: 0x1b2230, skin: 0xe2b896, hair: 0x2b1d14, arms: ['down', 'front'], tall: 1.04 });
  // the white shirt in the jacket's opening, a bow tie, a flower in the buttonhole
  add(p.g, new THREE.PlaneGeometry(0.11, 0.3), std(0xffffff, 0.6), 0, 1.33, 0.142);
  add(p.g, new THREE.BoxGeometry(0.11, 0.04, 0.03), std(0x111111, 0.4), 0, 1.47, 0.14);
  add(p.g, new THREE.SphereGeometry(0.025, 8, 6), std(0xf2d3d8, 0.7), 0.1, 1.38, 0.13);
  return p.g;
}

// the guests: their best clothes, in a half circle round the couple
const GUESTS = [
  // x, z, facing (radians, 0 is +z), and the person
  [-2.0, 1.1, 2.2, { top: 0x2f5d8c, legs: 0x2f5d8c, arms: ['down', 'front'] }], // with a camera
  [-1.6, 2.2, 2.6, { top: 0xd94f70, skirt: [0xd94f70, 0.55, 0.12], long: true, arms: ['up', 'down'] }], // throwing confetti
  [-0.6, 2.8, 3.1, { top: 0x3a3a3a, legs: 0x3a3a3a }],
  [0.7, 2.9, 3.3, { top: 0xf2c94c, skirt: [0xf2c94c, 0.5, 0.15], long: true, arms: ['front', 'down'] }],
  [1.8, 2.1, 3.7, { top: 0x5b7f4a, skirt: [0x5b7f4a, 0.62, 0.1], arms: ['up', 'up'] }],
  [2.3, 0.9, 4.1, { top: 0x6b4a8a, legs: 0x26262a }],
  [-2.5, -0.2, 1.7, { top: 0x8a2f2f, legs: 0x2a2a2e, tall: 1.05 }],
  [2.6, -0.4, 4.6, { top: 0x9fc5e8, skirt: [0x9fc5e8, 0.7, 0.2], long: true, tall: 0.95 }],
  [0.1, 3.6, 3.2, { top: 0x7a5230, legs: 0x3b3b3b, tall: 0.6 }], // a child
];

export function wedding() {
  // the couple stand at the back of the party, the guests round them in front: the whole party
  // centred on the middle of where they stand
  const outer = new THREE.Group(), group = new THREE.Group();
  group.position.z = -2.1;
  outer.add(group);
  const b = bride(), gr = groom();
  b.position.set(0.3, 0, 0);
  b.rotation.y = -0.15;
  gr.position.set(-0.35, 0, 0);
  gr.rotation.y = 0.15;
  group.add(b, gr);
  GUESTS.forEach(([x, z, yaw, o], k) => {
    const p = person({ skin: SKINS[k % SKINS.length], hair: HAIRS[(k * 3) % HAIRS.length], ...o });
    p.g.position.set(x, 0, z);
    p.g.rotation.y = yaw;
    // the one with the camera holds it up to their face
    if (k === 0) add(p.g, new THREE.BoxGeometry(0.14, 0.09, 0.08), std(0x111111, 0.4), 0.08, 1.62, 0.2);
    group.add(p.g);
  });
  // confetti on the stones and in the air above the couple
  const colors = [0xffffff, 0xf2d3d8, 0xffe08a, 0xa8d8f0, 0xf4a7b9], confetti = new THREE.Group();
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const geo = new THREE.PlaneGeometry(0.035, 0.035), mats = colors.map(c => std(c, 0.8, { side: THREE.DoubleSide }));
  for (let k = 0; k < 160; k++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 2.6, up = k < 40 ? 1.6 + r() * 1.2 : 0.045; // 5.6 cm up: over the footways (3 cm) and the asphalt (4 cm), not lost in them
    const m = new THREE.Mesh(geo, mats[k % mats.length]);
    m.position.set(Math.cos(a) * d, up, Math.sin(a) * d + 0.6);
    m.rotation.set(up > 0.1 ? r() * 6 : -Math.PI / 2, r() * 6, 0);
    confetti.add(m);
  }
  group.add(confetti);
  outer.scale.setScalar(S);
  return outer;
}
