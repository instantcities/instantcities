import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ellipsoid, profile, tube, humanTorso, humanLimb, humanHead, humanFeatures, humanShoe } from './anatomy.js';

const mat = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

function textTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const css = c => '#' + c.toString(16).padStart(6, '0');

function numberTexture(num, silk) {
  return textTexture(128, 128, g => {
    g.fillStyle = css(silk);
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#fff';
    g.beginPath();
    g.arc(64, 64, 40, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#1d1a17';
    g.font = 'bold 60px system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(num), 64, 68);
  });
}

// Black-and-white cow patches or tiger stripes, painted onto the coat.
function coatTexture(pattern, base) {
  const t = textTexture(256, 256, (g, w, h) => {
    g.fillStyle = css(base);
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#16120f';
    if (pattern === 'patches') {
      for (let k = 0; k < 11; k++) {
        const x = Math.random() * w, y = Math.random() * h, r = 18 + Math.random() * 30;
        g.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.5) {
          const rr = r * (0.7 + Math.random() * 0.5);
          g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        }
        g.fill();
      }
    } else if (pattern === 'stripes') {
      for (let y = 8; y < h; y += 26) {
        g.beginPath();
        g.moveTo(0, y);
        for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.08 + y) * 6);
        for (let x = w; x >= 0; x -= 16) g.lineTo(x, y + 9 + Math.sin(x * 0.11 + y) * 4);
        g.fill();
      }
    }
    // Fine, low-contrast hair grain catches the light without covering the coat colour.
    let seed = 37;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    g.globalAlpha = 0.045;
    for (let i = 0; i < 2400; i++) {
      g.strokeStyle = i % 2 ? '#fff3dc' : '#25170f';
      const x = random() * w, y = random() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1, y + 2 + random() * 3); g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function labelSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const draw = (label, color) => {
    const g = canvas.getContext('2d');
    g.clearRect(0, 0, 256, 64);
    g.fillStyle = css(color);
    g.strokeStyle = '#1d1a17';
    g.lineWidth = 6;
    g.beginPath();
    g.roundRect(4, 4, 248, 56, 26);
    g.fill();
    g.stroke();
    g.fillStyle = '#fff';
    let size = 34;
    do g.font = `bold ${size--}px system-ui, sans-serif`; while (g.measureText(label).width > 226 && size > 16);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(label, 128, 34);
    map.needsUpdate = true;
  };
  // Fixed on-screen size, so an animal right in front of the camera doesn't get a giant tag.
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, depthWrite: false, sizeAttenuation: false }));
  sprite.scale.set(0.15, 0.0375, 1);
  sprite.userData.setText = draw;
  return sprite;
}

// Dizzy stars over a rider's head, shown while spinning out.
// A paintball machine gun (car+paintball mode), its barrel along -Y from the shoulder at the origin:
// receiver, shroud, long barrel with a muzzle, a drum magazine underneath, a stock and a blue hopper on top.
// Held in a walker's raised arm; mounted riders hold it forward with paintGun(true): grip at the origin, barrel along +Z.
export function paintGun(forward = false) {
  const gunMat = mat(0x2b2f36, 0.5, { metalness: 0.4 }), gunBlue = mat(0x1e66f5, 0.4), gunTan = mat(0x6b5a3c, 0.7), gun = new THREE.Group();
  part(new THREE.BoxGeometry(0.1, 0.4, 0.14), gunMat, gun, 0, -0.7, 0);
  part(new THREE.BoxGeometry(0.08, 0.34, 0.09), gunMat, gun, 0, -1.08, 0.01);
  part(new THREE.CylinderGeometry(0.024, 0.024, 0.55, 8), gunMat, gun, 0, -1.5, 0.02);
  part(new THREE.CylinderGeometry(0.04, 0.04, 0.07, 8), gunMat, gun, 0, -1.8, 0.02);
  part(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 12).rotateZ(Math.PI / 2), gunMat, gun, 0, -0.74, -0.17); // drum
  part(new THREE.BoxGeometry(0.06, 0.28, 0.1), gunTan, gun, 0, -0.38, -0.02); // stock
  part(new THREE.BoxGeometry(0.05, 0.14, 0.06), gunMat, gun, 0, -0.62, -0.12).rotation.x = 0.35; // grip
  part(new THREE.SphereGeometry(0.075, 8, 6), gunBlue, gun, 0, -0.78, 0.15);
  gun.visible = false;
  if (!forward) return gun;
  const held = new THREE.Group();
  gun.visible = true;
  gun.position.y = 0.62;
  held.add(gun);
  held.rotation.x = -Math.PI / 2;
  held.scale.setScalar(0.8);
  held.visible = false;
  return held;
}

export function dizzyStars(parent, y, z = 0) {
  const stars = new THREE.Group();
  stars.position.set(0, y, z);
  stars.visible = false;
  parent.add(stars);
  const starMat = new THREE.MeshBasicMaterial({ color: 0xffe14d });
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), starMat);
    s.position.set(Math.cos(a) * 0.7, Math.sin(k * 2.1) * 0.08, Math.sin(a) * 0.7);
    stars.add(s);
  }
  return stars;
}

function part(geo, material, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}

// Body proportions per species. Legs: hip height = upper + lower + hoof.
// gait = phase offsets of [front-left, front-right, hind-left, hind-right].
const SPECIES = {
  horse: { hipY: 1.3, upper: 0.65, lower: 0.58, legR: 1, legX: 0.24, legZ: 0.78, bodyR: 0.46, bodyLen: 1.35, neckLen: 0.75, neckTilt: 0.62, headTilt: 1.45, head: 'long', tail: 0.75, gait: [2.2, 2.75, 0, 0.55] },
  cow: { hipY: 1.12, upper: 0.55, lower: 0.5, legR: 1.25, legX: 0.3, legZ: 0.72, bodyR: 0.58, bodyLen: 1.25, neckLen: 0.4, neckTilt: 1.05, headTilt: 0.95, head: 'cow', tail: 0.85, gait: [0, Math.PI, Math.PI, 0] },
  pig: { hipY: 0.76, upper: 0.38, lower: 0.32, legR: 1.2, legX: 0.26, legZ: 0.56, bodyR: 0.56, bodyLen: 0.95, neckLen: 0.18, neckTilt: 1.35, headTilt: 0.25, head: 'pig', tail: 0, gait: [0, Math.PI, Math.PI, 0] },
  tiger: { hipY: 1.0, upper: 0.5, lower: 0.45, legR: 1.15, legX: 0.24, legZ: 0.88, bodyR: 0.42, bodyLen: 1.5, neckLen: 0.3, neckTilt: 1.25, headTilt: 0.35, head: 'cat', tail: 1.2, gait: [0, 0.3, Math.PI, Math.PI + 0.3] },
};
SPECIES.unicorn = { ...SPECIES.horse, head: 'long' };

// The coat and mane every animal of a species has when `standardCoat` is set (riding about, not in a
// race): a brown horse, a white cow, a pink pig, a white unicorn, an orange tiger.
const COATS = {
  horse: { coat: 0x8b4a2b, mane: 0x2b1a10 },
  cow: { coat: 0xf6f3ee, mane: 0x16120f },
  pig: { coat: 0xf7b8c4, mane: 0xe98ea0 },
  unicorn: { coat: 0xfaf7ff, mane: 0xff80ab },
  tiger: { coat: 0xf08a24, mane: 0x16120f },
};

const RAINBOW = [0xe53935, 0xff9800, 0xfdd835, 0x43a047, 0x1e88e5, 0x8e24aa];

// What a cop wears on top of the uniform: the darker peak, the gold badge, the moustache.
export const cop = () => ({ peak: mat(0x16243d, 0.4), badge: mat(0xf2b632, 0.3, { metalness: 0.6 }), tache: mat(0x4a2c17, 0.9) });

// A racing animal with a jockey. The model faces +Z and stands on y = 0.
export function createAnimal(def) {
  const species = def.species ?? 'horse';
  if (def.standardCoat) def = { ...def, ...COATS[species] };
  const P = SPECIES[species];
  const equine = species === 'horse' || species === 'unicorn';
  const pattern = species === 'cow' ? 'patches' : species === 'tiger' ? 'stripes' : null;
  const coat = mat(0xffffff, 0.72, { map: coatTexture(pattern, def.coat) });
  const mane = mat(def.mane, 0.9);
  const hoof = mat(species === 'unicorn' ? 0xf2c94c : species === 'pig' ? 0x7a4a3a : 0x2b2622, 0.6);
  const silk = mat(def.silk, 0.45);
  const cap = mat(def.cap, 0.35);
  const white = mat(def.cop ? 0x16243d : 0xf3f1ec, 0.7); // a cop rides in his uniform trousers
  const boot = mat(0x1f1b18, 0.5);
  const skin = mat(0xf0c8a0, 0.8);
  const dark = mat(0x111111, 0.3);
  const leather = mat(0x5b3a24, 0.6);
  const pink = mat(0xf4a3b5, 0.6);
  const muzzleMat = mat(new THREE.Color(def.coat).multiplyScalar(0.72).getHex(), 0.6);

  const bodyY = P.hipY + 0.2 + (P.bodyR - 0.46) * 0.5;
  const saddleY = bodyY + P.bodyR * 1.05 + 0.09;
  const jockeyY = saddleY + 0.03;

  const root = new THREE.Group();
  const spin = new THREE.Group(); // extra yaw while spinning out after a bunny hit
  root.add(spin);
  const body = new THREE.Group(); // bobs and leans
  spin.add(body);

  // Barrel, chest and haunches.
  const torso = part(equine ? profile([[0, -1.25], [0.24, -1.13], [0.46, -0.88], [0.49, -0.6], [0.44, 0.05], [0.47, 0.55], [0.4, 0.89], [0.24, 1.12], [0, 1.24]], 1.08, 28, true) : new THREE.CapsuleGeometry(P.bodyR, P.bodyLen, 8, 20), coat, body, 0, bodyY, 0);
  torso.rotation.x = Math.PI / 2;
  torso.scale.set(0.92, 1, 1.05);
  if (!equine) {
    part(new THREE.SphereGeometry(P.bodyR * 1.09, 20, 14), coat, body, 0, bodyY + 0.02, P.bodyLen * 0.58).scale.set(0.84, 1.06, 0.88);
    part(new THREE.SphereGeometry(P.bodyR * 1.15, 20, 14), coat, body, 0, bodyY + 0.1, -P.bodyLen * 0.53).scale.set(0.88, 1, 0.94);
  } else {
    // The barrel has one continuous surface; only the withers rise above it.
    part(ellipsoid(0.22, 0.18, 0.42), coat, body, 0, bodyY + 0.4, 0.48);
  }
  if (species === 'cow') part(new THREE.SphereGeometry(0.2, 10, 8), pink, body, 0, bodyY - P.bodyR * 0.95, -0.3).scale.set(1.2, 0.7, 1);

  // Neck and head.
  const neck = new THREE.Group();
  neck.position.set(0, bodyY + 0.25, P.bodyLen / 2 + 0.28);
  body.add(neck);
  part(equine ? profile([[0, -0.14], [0.23, -0.1], [0.26, 0.1], [0.22, 0.35], [0.16, 0.67], [0.13, 0.86], [0, 0.99]], 1.45, 24, true) : new THREE.CapsuleGeometry(0.24, P.neckLen, 6, 16), coat, neck, 0, equine ? 0 : P.neckLen * 0.6, 0).scale.set(equine ? 0.85 : 1.1, 1, 1.15);
  if (equine) {
    // The mane follows the crest and falls over one side in curved locks.
    const locks = Array.from({ length: 24 }, (_, i) => {
      const t = i / 23, y = 0.12 + t * 0.8, back = -0.41 + t * 0.22;
      const fall = 0.25 + Math.sin(i * 1.7) * 0.025;
      return tube([[0, y, back], [0.04, y - 0.05, back - 0.025], [0.13, y - 0.17, back + 0.02], [0.15, y - fall, back + 0.07]], 0.019, 8, 6);
    });
    if (species === 'unicorn') locks.forEach((geo, i) => part(geo, mat(RAINBOW[Math.floor(i / 4)], 0.85), neck));
    else part(mergeGeometries(locks), mane, neck);
  }

  const head = new THREE.Group();
  head.position.set(0, P.neckLen + 0.2, 0);
  head.rotation.x = P.headTilt;
  neck.add(head);
  const eyes = (x, y, z, r = 0.045) => { for (const s of [-1, 1]) part(new THREE.SphereGeometry(r, 8, 6), dark, head, s * x, y, z); };
  if (P.head === 'long') {
    part(profile([[0, -0.08], [0.14, -0.04], [0.19, 0.1], [0.18, 0.23], [0.135, 0.48], [0.14, 0.66], [0.11, 0.77], [0, 0.8]], 1.12, 24, true), coat, head);
    part(ellipsoid(0.155, 0.145, 0.14), muzzleMat, head, 0, 0.72, 0.01);
    // Cheek/jaw, small inset eyes and elongated nostrils.
    part(ellipsoid(0.16, 0.2, 0.17), coat, head, 0, 0.16, 0.055);
    for (const s of [-1, 1]) {
      const ear = part(ellipsoid(0.057, 0.155, 0.035), coat, head, s * 0.11, -0.01, -0.2);
      ear.rotation.x = -Math.PI / 2 + 0.35;
      const inner = part(ellipsoid(0.032, 0.105, 0.012), muzzleMat, head, s * 0.11, 0, -0.223);
      inner.rotation.x = ear.rotation.x;
      part(ellipsoid(0.013, 0.043, 0.025), dark, head, s * 0.137, 0.76, -0.04);
      part(ellipsoid(0.017, 0.024, 0.021), dark, head, s * 0.18, 0.18, -0.045);
      part(ellipsoid(0.004, 0.007, 0.007, 10), mat(0xfff4dc, 0.25), head, s * 0.194, 0.174, -0.054);
    }
    part(mergeGeometries(Array.from({ length: 5 }, (_, i) => tube([[(i - 2) * 0.026, -0.06, -0.15], [(i - 2) * 0.033, 0.07, -0.19], [(i - 2) * 0.025, 0.2, -0.16]], 0.023, 8, 6))), mane, head);
    // Noseband and cheek straps follow the head, so they move with every nod.
    part(new THREE.TorusGeometry(0.15, 0.013, 6, 24).rotateX(Math.PI / 2).scale(1, 1, 0.98), leather, head, 0, 0.61, 0);
    for (const s of [-1, 1]) part(tube([[s * 0.15, 0.61, 0.02], [s * 0.19, 0.26, 0.04], [s * 0.14, -0.05, 0.02]], 0.012, 12, 6), leather, head);
    if (species === 'unicorn') {
      const horn = part(new THREE.ConeGeometry(0.07, 0.5, 10), mat(0xf2c94c, 0.3, { metalness: 0.4 }), head, 0, 0.18, -0.32);
      horn.rotation.x = -Math.PI / 2 + 0.5;
    }
  } else if (P.head === 'cow') {
    part(new THREE.CapsuleGeometry(0.24, 0.32, 4, 10), coat, head, 0, 0.3, 0).scale.set(1.2, 1, 1);
    part(new THREE.SphereGeometry(0.22, 12, 8), pink, head, 0, 0.62, 0.02).scale.set(1.25, 0.8, 0.9);
    for (const s of [-1, 1]) {
      part(new THREE.SphereGeometry(0.035, 6, 4), dark, head, s * 0.09, 0.78, -0.06);
      const horn = part(new THREE.ConeGeometry(0.05, 0.26, 8), mat(0xf3e7c9, 0.5), head, s * 0.2, 0.08, -0.22);
      horn.rotation.set(-Math.PI / 2 + 0.2, 0, -s * 0.9);
      const ear = part(new THREE.SphereGeometry(0.1, 8, 6), coat, head, s * 0.33, 0.14, -0.08);
      ear.scale.set(1.4, 0.5, 0.8);
    }
    eyes(0.2, 0.28, -0.12, 0.05);
  } else if (P.head === 'pig') {
    part(new THREE.SphereGeometry(0.36, 14, 10), coat, head, 0, 0.18, 0);
    const snout = part(new THREE.CylinderGeometry(0.15, 0.16, 0.14, 14), pink, head, 0, 0.52, 0.02);
    for (const s of [-1, 1]) {
      part(new THREE.SphereGeometry(0.03, 6, 4), dark, head, s * 0.06, 0.6, 0.02);
      const ear = part(new THREE.ConeGeometry(0.12, 0.22, 4), coat, head, s * 0.2, 0.3, -0.27);
      ear.rotation.set(-0.6, 0, s * 0.5);
    }
    snout.rotation.x = 0;
    eyes(0.16, 0.42, -0.18, 0.045);
  } else {
    part(new THREE.SphereGeometry(0.33, 14, 10), coat, head, 0, 0.2, 0).scale.set(1.05, 0.95, 1);
    part(new THREE.SphereGeometry(0.17, 10, 8), white, head, 0, 0.44, 0.1).scale.set(1.2, 0.9, 0.9);
    part(new THREE.SphereGeometry(0.05, 8, 6), dark, head, 0, 0.58, 0.02);
    for (const s of [-1, 1]) {
      const ear = part(new THREE.SphereGeometry(0.1, 8, 6), coat, head, s * 0.2, 0.08, -0.28);
      ear.scale.set(1, 1, 0.5);
    }
    eyes(0.14, 0.42, -0.14, 0.045);
  }

  // Tail.
  const tail = new THREE.Group();
  tail.position.set(0, bodyY + 0.28, -(P.bodyLen / 2 + P.bodyR) + 0.05);
  body.add(tail);
  if (species === 'pig') {
    const curl = part(new THREE.TorusGeometry(0.1, 0.035, 6, 12, Math.PI * 1.6), pink, tail, 0, 0, -0.05);
    curl.rotation.y = Math.PI / 2;
  } else if (equine) {
    const strands = Array.from({ length: 8 }, (_, i) => {
      const x = (i - 3.5) * 0.024;
      return tube([[x * 0.4, 0, 0], [x, -0.23, -0.09], [x * 1.2, -0.65, -0.14], [x * 0.6, -0.96 + Math.abs(x), -0.06]], 0.034, 14, 6);
    });
    if (species === 'unicorn') strands.forEach((geo, i) => part(geo, mat(RAINBOW[i % 6], 0.85), tail));
    else part(mergeGeometries(strands), mane, tail);
  } else {
    const tailMat = species === 'tiger' ? coat : mane;
    part(new THREE.CapsuleGeometry(species === 'tiger' ? 0.08 : 0.1, P.tail, 4, 8), tailMat, tail, 0, -P.tail * 0.6, 0);
    if (species === 'cow') part(new THREE.SphereGeometry(0.12, 8, 6), mane, tail, 0, -P.tail * 1.15, 0);
    if (species === 'tiger') part(new THREE.SphereGeometry(0.09, 8, 6), dark, tail, 0, -P.tail * 1.15, 0);
  }

  // Legs: hip pivot -> knee pivot -> hoof (or paw).
  const r = P.legR;
  const legGeoUpper = humanLimb(0.25 * r, P.upper).translate(0, P.upper / 2, 0);
  const legGeoLower = profile([[0, -P.lower / 2], [0.067 * r, -P.lower / 2], [0.062 * r, -P.lower * 0.3], [0.047 * r, P.lower * 0.16], [0.07 * r, P.lower / 2], [0, P.lower / 2]], 1.05, 16);
  const hoofGeo = species === 'tiger' ? ellipsoid(0.12, 0.085, 0.14) : new THREE.CylinderGeometry(0.075 * r, 0.105 * r, 0.12, 16).scale(1, 1, 1.22);
  const legs = [
    [-P.legX, P.legZ, true, P.gait[0]], [P.legX, P.legZ, true, P.gait[1]],
    [-P.legX, -P.legZ, false, P.gait[2]], [P.legX, -P.legZ, false, P.gait[3]],
  ].map(([x, z, front, off]) => {
    const hip = new THREE.Group();
    hip.position.set(x, P.hipY, z);
    body.add(hip);
    part(equine ? humanLimb(front ? 0.3 : 0.38, P.upper).translate(0, P.upper / 2, 0) : legGeoUpper, coat, hip, 0, -P.upper / 2, 0);
    const knee = new THREE.Group();
    knee.position.y = -P.upper;
    hip.add(knee);
    part(ellipsoid(0.085 * r, 0.095 * r, 0.085 * r), coat, knee);
    part(legGeoLower, coat, knee, 0, -P.lower / 2, 0);
    part(hoofGeo, species === 'tiger' ? coat : hoof, knee, 0, -P.lower - 0.02, species === 'tiger' ? 0.04 : 0);
    return { hip, knee, front, off };
  });

  // Cloth drapes over the back instead of enclosing the horse in a rectangular box.
  const clothGeo = new THREE.PlaneGeometry(1, 0.8, 20, 2), cp = clothGeo.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    const angle = cp.getX(i) * Math.PI;
    cp.setXYZ(i, Math.sin(angle) * (P.bodyR + 0.025), Math.cos(angle) * (P.bodyR + 0.025), cp.getY(i));
  }
  clothGeo.computeVertexNormals();
  part(clothGeo, mat(def.silk, 0.85, { side: THREE.DoubleSide }), body, 0, bodyY, 0.05);
  const numberMat = mat(0xffffff, 0.85, { map: numberTexture(def.number, def.silk), side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    part(new THREE.PlaneGeometry(0.32, 0.29), numberMat, body, s * (P.bodyR + 0.03), bodyY + 0.13, 0.05).rotation.y = s * Math.PI / 2;
    part(tube([[s * 0.22, saddleY, 0.18], [s * (P.bodyR + 0.08), bodyY + 0.05, 0.28], [s * (P.bodyR + 0.09), bodyY - 0.1, 0.3]], 0.018, 12, 6), leather, body);
    part(new THREE.TorusGeometry(0.095, 0.013, 6, 16).scale(0.8, 1, 1), mat(0xa9a4a0, 0.35, { metalness: 0.7 }), body, s * (P.bodyR + 0.09), bodyY - 0.16, 0.3).rotation.y = Math.PI / 2;
  }
  part(ellipsoid(0.28, 0.07, 0.34), leather, body, 0, saddleY - 0.03, 0.05);
  part(ellipsoid(0.26, 0.12, 0.075), leather, body, 0, saddleY + 0.01, -0.23);
  part(ellipsoid(0.19, 0.1, 0.065), leather, body, 0, saddleY + 0.01, 0.32);

  // Jockey, crouched forward.
  const jockey = new THREE.Group();
  jockey.position.set(0, jockeyY, 0.05);
  body.add(jockey);
  for (const s of [-1, 1]) {
    const thigh = part(humanLimb(0.19, 0.5).rotateX(-Math.PI / 2).translate(0, 0, -0.25), white, jockey, s * P.bodyR * 0.6, 0.1, 0.12);
    thigh.rotation.x = 0.3;
    const shin = part(humanLimb(0.15, 0.42).translate(0, 0.21, 0), boot, jockey, s * (P.bodyR * 0.6 + 0.08), -0.1, 0.3);
    shin.rotation.x = -0.35;
    part(humanShoe(0.14, 0.09, 0.25), boot, jockey, s * (P.bodyR * 0.6 + 0.08), -0.3, 0.4);
    const arm = part(humanLimb(0.13, 0.48).rotateX(-Math.PI / 2).translate(0, 0, -0.24), silk, jockey, s * 0.21, 0.28, 0.68);
    arm.rotation.x = 0.55;
    part(ellipsoid(0.045, 0.055, 0.06), skin, jockey, s * 0.16, 0.14, 0.9);
    part(tube([[s * 0.16, 0.14, 0.9], [s * 0.24, 0.02, 1.18], [s * 0.16, 0.15, 1.45]], 0.01, 12, 6), leather, jockey);
  }
  const gun = paintGun(true); // car+paintball mode: in the right hand, pointing ahead past the head
  gun.position.set(0.18, 0.3, 0.85);
  jockey.add(gun);
  const torsoJ = part(humanTorso(0.44, 0.62, 0.3), silk, jockey, 0, 0.26, 0.22);
  torsoJ.rotation.x = 1.15;
  part(new THREE.CylinderGeometry(0.065, 0.075, 0.15, 12), skin, jockey, 0, 0.41, 0.5).rotation.x = 0.6;
  part(humanHead(0.135), skin, jockey, 0, 0.5, 0.62);
  part(humanFeatures(0.135), dark, jockey, 0, 0.5, 0.62);
  const helmet = part(new THREE.SphereGeometry(0.15, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), cap, jockey, 0, 0.53, 0.6);
  helmet.rotation.x = 0.35;
  if (def.cop) {
    const c = cop();
    part(ellipsoid(0.11, 0.016, 0.08), c.peak, jockey, 0, 0.57, 0.78);
    part(new THREE.SphereGeometry(0.03, 8, 6), c.badge, jockey, 0, 0.63, 0.73);
    part(ellipsoid(0.065, 0.015, 0.02), c.tache, jockey, 0, 0.45, 0.76);
  } else part(ellipsoid(0.11, 0.016, 0.08), cap, jockey, 0, 0.57, 0.78);

  const stars = dizzyStars(root, jockeyY + 1.15, 0.2);

  const label = labelSprite();
  label.userData.setText(def.name, def.silk);
  label.position.set(0, jockeyY + 1.8, 0);
  label.layers.set(def.labelLayer);
  root.add(label);

  let phase = Math.random() * Math.PI * 2;

  // Sitting down to wait (for the tram): the animal on its haunches, front legs straight, nose up,
  // and the jockey off it, on the ground beside it with the legs out. The pitch that puts the hind
  // hips just off the ground with the front hooves still on it; the jockey's place, in spin's frame.
  const SIT_HIP = 0.4, sitPitch = Math.asin(Math.max(-0.9, Math.min(0, (SIT_HIP - P.hipY) / (2 * P.legZ))));
  const sitAt = new THREE.Vector3(P.bodyR + 0.6, 0.14, 0.25);
  const sitTurn = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.9, -0.35, 0, 'YXZ')), q = new THREE.Quaternion(), inv = new THREE.Matrix4();

  // pose: { air: 0..1 how airborne, vy: vertical speed, rear: 0..1 progress of rearing up,
  //         stumble: 0..1 progress of a stumble, sit: 0..1 how far sat down to wait }
  function animate(dt, speed, steer, time, pose = {}) {
    const sp = Math.abs(speed);
    const k = Math.min(1, sp / 12);
    const air = pose.air || 0;
    const rearK = pose.rear ? Math.sin(pose.rear * Math.PI) : 0;
    const stumbleK = pose.stumble ? Math.sin(pose.stumble * Math.PI) : 0;
    phase += dt * (speed * 0.42 + Math.sign(speed) * (sp > 0.3 ? 2 : 0)) * (1 - air * 0.8) * (1.3 / (P.upper + P.lower) * 0.8 + 0.2);
    for (const L of legs) {
      const a = phase + L.off;
      const lift = Math.max(0, -Math.cos(a)) * k; // fold the leg while it swings forward
      let hip = Math.sin(a) * 0.75 * k;
      let knee = L.front ? lift * 1.3 : -lift * 1.1;
      // tuck the legs in the air: forelegs folded forward, hind legs stretched back
      hip += ((L.front ? -0.9 : 0.8) - hip) * air;
      knee += ((L.front ? 1.7 : -1.0) - knee) * air;
      if (L.front && rearK) {
        hip += (-1.1 - hip) * rearK;
        knee += (1.3 - knee) * rearK;
      }
      L.hip.rotation.x = hip;
      L.knee.rotation.x = knee;
    }
    // Rearing pivots around the hind feet so they stay on the ground.
    const rearPitch = -0.75 * rearK;
    const bob = Math.abs(Math.sin(phase)) * 0.14 * k * (1 - air);
    body.position.set(0, bob - P.legZ * Math.sin(rearPitch), -P.legZ + P.legZ * Math.cos(rearPitch));
    body.rotation.x = Math.sin(phase) * 0.05 * k * (1 - air) - ((pose.vy || 0) / 10) * 0.3 * air + stumbleK * 0.3 + rearPitch;
    body.rotation.z = -steer * 0.13 * k;
    neck.rotation.x = P.neckTilt + Math.sin(phase + 0.8) * 0.09 * k * (1 - air) + Math.sin(time * 1.3) * 0.03 * (1 - k)
      + stumbleK * 0.45 - rearK * 0.3 - air * 0.15;
    tail.rotation.x = (species === 'pig' ? -0.3 : 0.35 + 0.85 * Math.max(k, air)) + Math.sin(phase) * 0.12 * k;
    tail.rotation.z = Math.sin(time * 2.1) * 0.15 * (1 - k) + Math.sin(phase * 0.5) * 0.06 * k;
    jockey.position.set(0, jockeyY - bob * 0.7 + air * 0.12, 0.05);
    jockey.quaternion.identity();
    gun.visible = !!pose.gun;
    const sit = pose.sit || 0;
    if (sit > 0) {
      const e = sit * sit * (3 - 2 * sit), th = sitPitch * e;
      for (const L of legs) {
        L.hip.rotation.x += ((L.front ? -sitPitch : -1.2 - sitPitch) - L.hip.rotation.x) * e;
        L.knee.rotation.x += ((L.front ? 0 : 2.4) - L.knee.rotation.x) * e;
      }
      // turn about the hind hips, which come down to just off the ground
      const c = Math.cos(th), sn = Math.sin(th), hy = P.hipY * c + P.legZ * sn, hz = P.hipY * sn - P.legZ * c;
      body.position.set(0, body.position.y * (1 - e) + (SIT_HIP * e + P.hipY * (1 - e)) - hy, body.position.z * (1 - e) + (-P.legZ - hz));
      body.rotation.set(th + body.rotation.x * (1 - e), 0, body.rotation.z * (1 - e));
      tail.rotation.x += (-0.9 - tail.rotation.x) * e; // lying along the ground behind
      // the jockey: from the saddle (in the body's frame) to the ground beside it
      body.updateMatrix();
      inv.copy(body.matrix).invert();
      jockey.position.lerp(sitAt.clone().applyMatrix4(inv), e);
      q.setFromRotationMatrix(inv).multiply(sitTurn);
      jockey.quaternion.slerp(q, e);
    }
    if (stars.visible) stars.rotation.y = time * 7;
  }

  return {
    root, spin, stars, label, animate, species,
    setName: (name, color = def.silk) => label.userData.setText(name, color),
    get phase() { return phase; },
  };
}

export const createHorse = createAnimal;
