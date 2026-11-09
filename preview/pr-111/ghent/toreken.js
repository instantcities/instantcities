// Het Toreken, the round stone stair tower on the Vrijdagmarkt, against Ons Huis: pale limestone with
// narrow slits, a timber lookout gallery in red and white under a slate cone, and a golden finial.
// OpenStreetMap has it as a round house outline, which the game dressed as a brick tower with
// house windows: this stands in its place, and its base covers that outline (hand-written).
import * as THREE from 'three';

const R = 2.7; // the tower's radius, game metres
export const TOREKEN = [
  { id: 'toreken', name: 'Het Toreken', x: 201, z: -433, turn: 0, size: R * 2, reach: 90, make: toreken },
];

function toreken() {
  const g = new THREE.Group();
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true, ...extra });
  const stone = std(0xd2cdbd), band = std(0xbdb6a3), slate = std(0x3a3e45), dark = std(0x1b1d20), red = std(0xb3412f), white = std(0xf1ece0), gold = std(0xd8b04a, { metalness: 0.6, roughness: 0.4 });
  const add = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const BODY = 17, GALLERY = 2.4;
  add(new THREE.CylinderGeometry(R, R * 1.06, BODY, 20), stone, 0, BODY / 2, 0);
  for (const y of [0.9, 6.5, 12, BODY - 0.2]) add(new THREE.CylinderGeometry(R * 1.04, R * 1.04, 0.35, 20), band, 0, y, 0); // string courses
  // narrow slits, winding up the stair, on every side
  for (let k = 0; k < 7; k++) {
    const a = k * 2.4 + 0.5, y = 3.5 + k * 1.9;
    const slit = add(new THREE.BoxGeometry(0.2, 1.1, 0.25), dark, Math.sin(a) * R, y, Math.cos(a) * R);
    slit.rotation.y = a;
  }
  // the gallery: a ring of red and white boards between posts, under a little brim
  add(new THREE.CylinderGeometry(R * 0.92, R * 1.0, 0.4, 20), band, 0, BODY + 0.1, 0);
  const top = BODY + 0.3;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, x = Math.sin(a) * R * 0.9, z = Math.cos(a) * R * 0.9;
    add(new THREE.BoxGeometry(0.22, GALLERY, 0.22), dark, x, top + GALLERY / 2, z);
    const panel = add(new THREE.BoxGeometry(1.0, GALLERY * 0.8, 0.12), k % 2 ? white : red, Math.sin(a + 0.26) * R * 0.9, top + GALLERY / 2, Math.cos(a + 0.26) * R * 0.9);
    panel.rotation.y = a + 0.26;
  }
  add(new THREE.CylinderGeometry(R * 1.05, R * 1.05, 0.3, 12), dark, 0, top + GALLERY, 0);
  // the slate cone, and its gilded finial
  add(new THREE.ConeGeometry(R * 1.08, 6.2, 12), slate, 0, top + GALLERY + 3.1, 0);
  add(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 5), gold, 0, top + GALLERY + 6.7, 0);
  add(new THREE.SphereGeometry(0.2, 8, 6), gold, 0, top + GALLERY + 6.3, 0);
  return g;
}
