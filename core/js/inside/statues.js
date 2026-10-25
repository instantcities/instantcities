// Statues for the museums, from plain shapes in marble or stone, added to a Parts (gothic.js): the
// Venus de Milo, Michelangelo's David (out on Florence's Piazza della Signoria, florence/monuments.js),
// the Winged Victory of Samothrace on her ship's prow, a Roman marble of a god or an
// emperor, a portrait bust, the colossal bust of Ramesses II, a sarcophagus. Each stands at (x, y, z)
// with its feet at y (on a plinth: its height), facing ry (0: +z), `s` times life size in game metres.
import * as THREE from 'three';

const MARBLE = 0xf2eee4, SHADE = 0xe2dccd;
const lathe = (pts, n = 12) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n);

// a point of the figure, (dx, dy, dz) in its own metres, turned and put where it stands
const placer = (x, y, z, s, ry) => (dx, dy, dz = 0) => [x + (dx * Math.cos(ry) + dz * Math.sin(ry)) * s, y + dy * s, z + (-dx * Math.sin(ry) + dz * Math.cos(ry)) * s];

// a standing figure: legs or drapery to the hips, a torso, a head; arms: [left, right], each a
// pair [dx, dy, dz] of where the hand is, or null for none (broken off)
function body(k, at, s, { color = MARBLE, robe = true, arms = [[-0.35, 0.95, 0.15], [0.35, 0.95, 0.15]], head = true, lean = 0 } = {}) {
  if (robe) k.add(lathe([[0.001, 0], [0.32, 0], [0.3, 0.4], [0.24, 0.85], [0.2, 0.98], [0.001, 1.0]]).scale(s, s, s * 0.8), SHADE, ...at(0, 0, 0));
  else for (const side of [-1, 1]) k.rod(at(side * 0.1, 0.02, 0), at(side * 0.09 + lean * 0.1, 0.95, 0), 0.08 * s, color, 6);
  k.add(lathe([[0.001, 0.92], [0.18, 0.95], [0.16, 1.15], [0.2, 1.35], [0.14, 1.45], [0.001, 1.48]]).scale(s, s, s * 0.75), color, ...at(lean * 0.05, 0, 0));
  if (head) k.add(new THREE.SphereGeometry(0.12 * s, 10, 8), color, ...at(lean * 0.08, 1.6, 0));
  arms.forEach((hand, i) => { if (hand) k.rod(at(i ? 0.19 : -0.19, 1.4, 0), at(...hand), 0.045 * s, color, 5); });
}

// The Venus de Milo (c. 150–125 BC): armless, her body turned, the drapery slipping off her hips
export function venusDeMilo(p, x, y, z, s = 2.5, ry = 0) {
  const at = placer(x, y, z, s, ry), k = p.marble;
  k.add(lathe([[0.001, 0], [0.3, 0], [0.32, 0.3], [0.26, 0.7], [0.22, 0.92], [0.001, 0.98]]).scale(s, s, s * 0.85), SHADE, ...at(0, 0, 0));
  k.add(new THREE.TorusGeometry(0.21 * s, 0.05 * s, 6, 14).rotateX(Math.PI / 2 - 0.3), SHADE, ...at(0, 0.92, 0)); // the knot of the drapery
  k.add(lathe([[0.001, 0.9], [0.19, 0.95], [0.16, 1.15], [0.2, 1.35], [0.13, 1.47], [0.001, 1.5]]).scale(s, s, s * 0.7), MARBLE, ...at(0.02, 0, 0), 0, 0, -0.06);
  k.add(new THREE.SphereGeometry(0.115 * s, 10, 8), MARBLE, ...at(0.06, 1.62, 0.02));
  for (const side of [-1, 1]) k.add(new THREE.SphereGeometry(0.06 * s, 6, 5), MARBLE, ...at(side * 0.22, 1.4, 0)); // the stumps of her arms
}

// a limb from a to b ([x, y, z], already placed), ra thick at a and rb at b
function limb(k, a, b, ra, rb, color) {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
  const g = new THREE.CylinderGeometry(rb, ra, L, 7).translate(0, L / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  k.add(g, color, ...a);
  k.add(new THREE.SphereGeometry(rb, 7, 5), color, ...b); // the joint
}

// Michelangelo's David (1501–1504): standing easy, his weight on his right leg against a tree
// stump, the left foot forward; the right arm hanging with the stone in his big hand, the left
// raised to his shoulder holding the sling, which runs down his back; his head of curls turned to
// his left, looking out for Goliath. 4.34 m real without its base, 5.4 here (s = 3.1); his left is +x.
export function david(p, x, y, z, s = 3.1, ry = 0) {
  const at = placer(x, y, z, s, ry), k = p.marble, r = v => v * s;
  // the rough marble he stands on, and the stump behind his right leg
  k.add(new THREE.CylinderGeometry(r(0.36), r(0.4), r(0.08), 9).translate(0, r(0.04), 0), SHADE, ...at(0, 0, 0));
  k.add(new THREE.CylinderGeometry(r(0.07), r(0.1), r(0.5), 7).translate(0, r(0.25), 0), SHADE, ...at(-0.15, 0.06, -0.12));
  // the legs: the right straight under him, the left knee bent forward, its foot out and ahead
  const [rHip, rKnee, rAnkle] = [at(-0.09, 0.92, 0), at(-0.1, 0.5, 0.01), at(-0.11, 0.1, 0)];
  const [lHip, lKnee, lAnkle] = [at(0.09, 0.89, 0), at(0.15, 0.48, 0.09), at(0.2, 0.1, 0.04)];
  limb(k, rHip, rKnee, r(0.085), r(0.055), MARBLE); limb(k, rKnee, rAnkle, r(0.055), r(0.035), MARBLE);
  limb(k, lHip, lKnee, r(0.085), r(0.055), MARBLE); limb(k, lKnee, lAnkle, r(0.055), r(0.035), MARBLE);
  k.add(new THREE.BoxGeometry(r(0.09), r(0.05), r(0.24)).translate(0, 0, r(0.06)), MARBLE, ...at(-0.11, 0.105, 0), 0, ry, 0);
  k.add(new THREE.BoxGeometry(r(0.09), r(0.05), r(0.24)).translate(0, 0, r(0.06)), MARBLE, ...at(0.21, 0.105, 0.05), 0, ry + 0.35, 0);
  // the hips, the right one higher, and the torso the other way: the left shoulder up
  k.add(new THREE.SphereGeometry(r(0.17), 10, 8).scale(1, 0.75, 0.7), MARBLE, ...at(0, 0.93, 0), 0, ry, -0.08);
  k.add(lathe([[0.001, 0.92], [0.17, 0.96], [0.15, 1.12], [0.19, 1.3], [0.21, 1.4], [0.12, 1.47], [0.001, 1.49]]).scale(s, s, s * 0.62), MARBLE, ...at(0, 0, 0), 0, ry + 0.1, 0.05);
  limb(k, at(0, 1.46, 0), at(0.01, 1.55, 0.01), r(0.05), r(0.045), MARBLE); // the neck
  // the head turned to his left, a nose to show which way he looks, a cap of curls
  const look = ry + 0.7;
  k.add(new THREE.SphereGeometry(r(0.1), 10, 8).scale(0.9, 1.15, 1), MARBLE, ...at(0.01, 1.63, 0.01));
  k.add(new THREE.ConeGeometry(r(0.022), r(0.06), 4).rotateX(Math.PI / 2), MARBLE, ...at(0.01 + Math.sin(0.7) * 0.095, 1.62, 0.01 + Math.cos(0.7) * 0.095), 0, look, 0);
  k.add(new THREE.SphereGeometry(r(0.105), 9, 7, 0, Math.PI * 2, 0, Math.PI * 0.55), SHADE, ...at(0, 1.65, -0.01), -0.3, look, 0);
  for (let q = 0; q < 7; q++) {
    const a = (q / 7) * Math.PI * 2;
    k.add(new THREE.SphereGeometry(r(0.035), 6, 4), SHADE, ...at(0.01 + Math.sin(a) * 0.07, 1.68 + (q % 2) * 0.02, -0.01 + Math.cos(a) * 0.065));
  }
  // the right arm down his side, the hand big, the stone in it
  const [rSh, rEl, rWr] = [at(-0.2, 1.39, 0), at(-0.25, 1.12, -0.01), at(-0.25, 0.88, 0.03)];
  limb(k, rSh, rEl, r(0.055), r(0.042), MARBLE); limb(k, rEl, rWr, r(0.042), r(0.03), MARBLE);
  k.add(new THREE.SphereGeometry(r(0.05), 7, 5).scale(0.8, 1.2, 0.9), MARBLE, ...at(-0.25, 0.83, 0.035));
  // the left arm bent up, the hand at his shoulder holding the sling
  const [lSh, lEl, lHand] = [at(0.21, 1.42, 0), at(0.29, 1.17, 0.1), at(0.16, 1.41, 0.1)];
  limb(k, lSh, lEl, r(0.055), r(0.042), MARBLE); limb(k, lEl, lHand, r(0.042), r(0.032), MARBLE);
  k.add(new THREE.SphereGeometry(r(0.042), 7, 5), MARBLE, ...lHand);
  // the sling over his left shoulder and down his back to his right hand
  const sling = [at(0.16, 1.44, 0.08), at(0.17, 1.51, -0.08), at(-0.08, 1.05, -0.14), at(-0.24, 0.86, -0.03)];
  for (let q = 1; q < sling.length; q++) k.rod(sling[q - 1], sling[q], r(0.012), SHADE, 4);
}

// The Winged Victory of Samothrace (c. 190 BC): no head, no arms, her wings spread behind her and
// her robe blown against her, stepping down onto the prow of a ship
export function victory(p, x, y, z, s = 2.6, ry = 0) {
  const at = placer(x, y, z, s, ry), k = p.marble, st = p.stone;
  // the prow, grey stone, a long block narrowing to the front
  st.add(new THREE.BoxGeometry(1.4 * s, 0.6 * s, 2.0 * s).translate(0, 0.3 * s, 0), 0xb8b2a6, ...at(0, 0, -0.2), 0, ry, 0);
  st.add(new THREE.CylinderGeometry(0.05 * s, 0.7 * s, 0.6 * s, 3, 1).rotateX(Math.PI / 2).translate(0, 0.3 * s, 0), 0xb8b2a6, ...at(0, 0, 1.2), 0, ry, 0);
  const top = 0.6;
  k.add(lathe([[0.001, 0], [0.34, 0], [0.26, 0.5], [0.22, 0.9], [0.001, 0.95]]).scale(s, s, s * 0.8), MARBLE, ...at(0, top, 0.1), -0.12, ry, 0);
  k.add(lathe([[0.001, 0.88], [0.2, 0.92], [0.18, 1.15], [0.21, 1.35], [0.12, 1.45], [0.001, 1.46]]).scale(s, s, s * 0.7), MARBLE, ...at(0, top, 0.15), -0.15, ry, 0);
  for (const side of [-1, 1]) {
    // a wing: feathers in rows, swept up and back
    for (let q = 0; q < 6; q++) {
      const len = (1.3 - q * 0.12) * s;
      k.add(new THREE.BoxGeometry(0.06 * s, len, 0.25 * s), q % 2 ? SHADE : MARBLE, ...at(side * (0.25 + q * 0.12), top + 1.2 + q * 0.08, -0.25 - q * 0.08), -0.6 - q * 0.05, ry + side * 0.5, side * (0.9 - q * 0.05));
    }
  }
}

// A Roman marble on its own: a god in a cloak, an athlete or an emperor in a breastplate, by seed
export function roman(p, x, y, z, s = 2.3, ry = 0, seed = 1) {
  const at = placer(x, y, z, s, ry), kind = seed % 3;
  if (kind === 0) body(p.marble, at, s, { robe: false, arms: [[-0.3, 0.85, 0.05], [0.45, 1.7, 0.1]], lean: 0.4 });
  else if (kind === 1) body(p.marble, at, s, { robe: true, arms: [[-0.4, 1.0, 0.25], null] });
  else {
    body(p.marble, at, s, { robe: true, arms: [[-0.25, 0.95, 0.2], [0.5, 1.6, 0.2]] });
    p.marble.add(new THREE.CylinderGeometry(0.21 * s, 0.19 * s, 0.4 * s, 10), SHADE, ...at(0, 1.2, 0)); // the breastplate
  }
}

// a portrait bust on a little column: an emperor, a philosopher
export function bust(p, x, z, s = 1.25, color = MARBLE) {
  p.marble.add(new THREE.CylinderGeometry(0.18 * s, 0.22 * s, 1.2 * s, 10).translate(0, 0.6 * s, 0), 0xd8d2c4, x, 0, z);
  p.marble.add(lathe([[0.001, 0], [0.3, 0], [0.26, 0.18], [0.1, 0.3], [0.001, 0.32]]).scale(s, s, s * 0.7), color, x, 1.2 * s, z);
  p.marble.add(new THREE.SphereGeometry(0.14 * s, 10, 8), color, x, 1.62 * s, z);
  p.block(x, z, 0.4);
}

// The Younger Memnon, the colossal bust of Ramesses II (c. 1250 BC): granite, two colours, the
// striped nemes headdress falling to his shoulders, the uraeus at his brow
export function ramesses(p, x, z, ry = 0, s = 1.25) {
  const at = placer(x, 0, z, s, ry), k = p.stone;
  k.add(new THREE.BoxGeometry(2.4 * s, 1.0 * s, 1.6 * s).translate(0, 0.5 * s, 0), 0x6a5a50, ...at(0, 0, 0), 0, ry, 0);
  k.add(lathe([[0.001, 1.0], [1.15, 1.0], [1.1, 1.6], [0.6, 2.0], [0.001, 2.05]]).scale(s, s, s * 0.6), 0x8a6a5a, ...at(0, 0, 0));
  k.add(new THREE.BoxGeometry(0.75 * s, 1.0 * s, 0.75 * s).translate(0, 2.5 * s, 0), 0xa88a6a, ...at(0, 0, 0.05), 0, ry, 0);
  k.add(new THREE.CylinderGeometry(0.5 * s, 0.8 * s, 1.2 * s, 4, 1).rotateY(Math.PI / 4).translate(0, 2.55 * s, 0), 0x7a6a5a, ...at(0, 0, -0.1), 0, ry, 0); // the nemes
  for (let q = 0; q < 6; q++) k.add(new THREE.BoxGeometry(1.3 * s, 0.05 * s, 0.8 * s), 0x9a8270, ...at(0, 2.1 + q * 0.18, -0.05), 0, ry, 0);
  k.add(new THREE.ConeGeometry(0.1 * s, 0.25 * s, 5), 0x6a5a50, ...at(0, 3.1, 0.38));
  p.block(x, z, 1.4 * s, 1.0 * s);
}

// a stone sarcophagus, its lid carved with the figure of the dead
export function sarcophagus(p, x, z, ry = 0, s = 1.25, color = 0x6a6258) {
  p.stone.box(1.3 * s, 1.0 * s, 2.6 * s, color, x, 0.5 * s, z, 0, ry, 0);
  p.stone.box(1.35 * s, 0.25 * s, 2.7 * s, 0x8a8070, x, 1.12 * s, z, 0, ry, 0);
  p.stone.box(0.6 * s, 0.2 * s, 2.0 * s, 0xa89878, x, 1.32 * s, z, 0, ry, 0);
  p.block(x, z, Math.abs(Math.cos(ry)) * 0.8 * s + Math.abs(Math.sin(ry)) * 1.5 * s, Math.abs(Math.sin(ry)) * 0.8 * s + Math.abs(Math.cos(ry)) * 1.5 * s);
}

// The bust of Nefertiti (Thutmose, c. 1345 BC): painted limestone, her long neck, the tall flat-topped
// blue crown with its gold band, the broad collar of coloured beads, one eye never set
export function nefertiti(p, x, y, z, ry = 0, s = 1.25) {
  const at = placer(x, y, z, s, ry), k = p.marble;
  k.add(lathe([[0.001, 0], [0.24, 0], [0.22, 0.1], [0.12, 0.2], [0.001, 0.22]], 16).scale(s, s, s * 0.7), 0xc8402a, ...at(0, 0, 0)); // the collar
  for (let q = 0; q < 4; q++) k.add(new THREE.TorusGeometry((0.2 - q * 0.025) * s, 0.012 * s, 4, 20).rotateX(Math.PI / 2 - 0.4).scale(1, 1, 0.7), [0x3a8a6a, 0xd8a52c, 0x2a56b8, 0xc8402a][q], ...at(0, 0.08 + q * 0.03, 0.02));
  k.add(new THREE.CylinderGeometry(0.055 * s, 0.07 * s, 0.22 * s, 10), 0xc89870, ...at(0, 0.3, 0.01), -0.25, ry, 0); // the neck
  k.add(new THREE.SphereGeometry(0.085 * s, 12, 10).scale(0.85, 1.1, 1), 0xc89870, ...at(0, 0.47, 0.04));
  k.add(new THREE.CylinderGeometry(0.11 * s, 0.075 * s, 0.24 * s, 12).scale(1, 1, 0.8), 0x2a4a8a, ...at(0, 0.6, -0.05), -0.45, ry, 0); // the crown, tipped back
  k.add(new THREE.TorusGeometry(0.083 * s, 0.01 * s, 4, 20).rotateX(Math.PI / 2 - 0.45), 0xd8a52c, ...at(0, 0.54, -0.01));
  k.add(new THREE.SphereGeometry(0.01 * s, 6, 5), 0x1a1a1a, ...at(-0.03, 0.49, 0.11));
}

// The Pergamon Altar (c. 170 BC): the broad marble stair up to the colonnade of Ionic columns, the
// frieze of the gods fighting the giants round its foot. Facing ry (0: the stair rising towards +z).
export function pergamonAltar(p, x, z, w, ry = 0) {
  const at = placer(x, 0, z, 1, ry);
  const n = 22, depth = 13, top = 6.5;
  for (let q = 0; q < n; q++) p.marble.box(w * 0.55, (top * (q + 1)) / n, depth / n + 0.02, q % 2 ? 0xe8e2d4 : 0xdcd6c8, ...at(0, (top * (q + 1)) / n / 2, (depth * q) / n + depth / n / 2), 0, ry, 0);
  for (const sd of [-1, 1]) p.marble.box(w * 0.22, top, depth + 6, 0xdcd6c8, ...at(sd * (w * 0.39), top / 2, depth / 2 + 3), 0, ry, 0); // the wings either side of the stair
  p.marble.box(w, 1.2, 6, 0xe8e2d4, ...at(0, top + 0.6, depth + 3), 0, ry, 0);
  for (let q = 0; q < 14; q++) {
    const u = -w / 2 + 1 + (q * (w - 2)) / 13;
    p.marble.add(new THREE.CylinderGeometry(0.35, 0.4, 5, 12).translate(0, 2.5, 0), 0xf0ece2, ...at(u, top + 1.2, depth + 1));
    p.marble.add(new THREE.BoxGeometry(1.0, 0.4, 1.0).translate(0, 5.2, 0), 0xf0ece2, ...at(u, top + 1.2, depth + 1), 0, ry, 0);
  }
  p.marble.box(w, 1.0, 1.6, 0xe8e2d4, ...at(0, top + 6.9, depth + 1), 0, ry, 0);
  p.block(...[at(0, 0, depth / 2 + 3)].map(([px, , pz]) => [px, pz])[0], Math.abs(Math.cos(ry)) * w / 2 + Math.abs(Math.sin(ry)) * (depth / 2 + 3), Math.abs(Math.sin(ry)) * w / 2 + Math.abs(Math.cos(ry)) * (depth / 2 + 3));
}
