// One person standing, from plain shapes: legs or a skirt, a body, arms, a head with hair, in
// real metres (1.25 to a game metre). Ghent's wedding party and the people of Cederstraat are made of
// them, and the visitors in the buildings you can go into (js/inside/rooms.js).
import * as THREE from 'three';

export const S = 1.25; // game metres to a real metre
export const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
export const SKINS = [0xe9c3a3, 0xd49f7c, 0xa8724f, 0x7a4b32, 0xf0d0b5];
export const HAIRS = [0x2b1d14, 0x5a3a22, 0xc9a35e, 0x1a1412, 0x8a5a3a, 0xb8b3aa];

export function add(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  parent.add(m);
  return m;
}
export const limb = (r, L) => new THREE.CapsuleGeometry(r, Math.max(0.01, L - 2 * r), 4, 10).translate(0, -L / 2, 0);
export const lathe = (pts, n = 20) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n);

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
