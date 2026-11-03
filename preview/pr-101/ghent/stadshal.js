// Round the Stadshal on the Emile Braunplein, modelled by hand: the grand piano under its roof,
// where anyone may sit down and play (and someone always is), and SGOL, the restaurant in the
// cellar under the hall, its glass front looking out on the sunken forecourt below the lawns. Both
// join the statues (ghent/monuments.js); SGOL's terrace chairs are sat on (js/sitters.js), each
// at its own height down in the hollow (chair.y).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { HOLLOWS } from './landmarks.js';

// the Stadshal's long side runs at this angle (game radians, as a statue's turn), and the glass
// front of the cellar along its north-west edge, facing the forecourt (local +z)
const HALL_TURN = -0.47;

// How far below the street (x, z) lies in the Emile Braunplein's hollow, from its grid of depths
// (a plain bilinear look, enough to stand a table on; js/hollows.js has the exact one).
function floor(x, z) {
  const h = HOLLOWS.find(h => h.id === 'emile-braunplein');
  if (!h) return 0;
  const fx = (x - h.x0) / h.cell, fz = (z - h.z0) / h.cell;
  if (!(fx >= 0 && fz >= 0 && fx < h.nx && fz < h.nz)) return 0;
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, d = (a, b) => h.d[b * (h.nx + 1) + a] / 10;
  return (d(i, j) * (1 - u) + d(i + 1, j) * u) * (1 - v) + (d(i, j + 1) * (1 - u) + d(i + 1, j + 1) * u) * v;
}

const local = (mo, a, b) => {
  const c = Math.cos(mo.turn), s = Math.sin(mo.turn);
  return [mo.x + a * c + b * s, mo.z - a * s + b * c];
};

// ------------------------------------------------------------------ the piano under the Stadshal

const BLACK = 0x111214, KEY = 0xf4f1e8, BRASS = 0xb8963e;
const SHIRT = 0xf2efe8, SUIT = 0x23262b, SKIN = 0xe0ac69, HAIR = 0x2b1d14;

// a grand piano's case seen from above, the keyboard along z = 0 and the tail towards +z: the
// straight bass side on the left (x < 0), the bentside curving in on the right
function caseShape() {
  const s = new THREE.Shape();
  // in the shape's own plane y = -z, so that turned flat (rotateX(-PI/2)) it reaches towards +z
  s.moveTo(-0.76, 0);
  s.lineTo(0.76, 0);
  s.lineTo(0.76, -0.45);
  s.bezierCurveTo(0.76, -0.95, 0.05, -1.0, 0.0, -1.55);
  s.bezierCurveTo(-0.05, -2.0, -0.3, -2.1, -0.5, -2.08);
  s.bezierCurveTo(-0.7, -2.05, -0.76, -1.95, -0.76, -1.8);
  s.lineTo(-0.76, 0);
  return s;
}

function grandPiano() {
  const g = new THREE.Group(), k = new Kit(), shape = caseShape();
  // the case, the rim of black lacquer with the gilded frame and the strings showing inside
  k.add(new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false, curveSegments: 10 }).rotateX(-Math.PI / 2), BLACK, 0, 0.62, 0);
  k.add(new THREE.ShapeGeometry(shape, 10).rotateX(-Math.PI / 2).scale(0.92, 1, 0.94), BRASS, -0.02, 0.905, 0.03);
  for (let x = -0.6; x < 0.6; x += 0.05) k.box(0.01, 0.01, 1.1 - Math.abs(x) * 0.5, 0xd8d2c0, x, 0.91, 0.65 - x * 0.35);
  // the lid, hinged along the bass side and propped open towards the right, and its stick
  k.add(new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false, curveSegments: 10 }).rotateX(-Math.PI / 2).translate(0.76, 0, 0).rotateZ(0.62).translate(-0.76, 0.93, 0), BLACK);
  k.rod([0.55, 0.93, 0.7], [0.62, 1.82, 0.7], 0.012, BLACK, 4);
  // three legs on brass castors, and the lyre with its pedals
  for (const [x, z] of [[-0.62, 0.16], [0.62, 0.16], [-0.45, 1.8]]) {
    k.add(new THREE.CylinderGeometry(0.07, 0.05, 0.6, 8), BLACK, x, 0.32, z);
    k.add(new THREE.SphereGeometry(0.04, 6, 4), BRASS, x, 0.03, z);
  }
  k.box(0.22, 0.5, 0.04, BLACK, 0, 0.35, 0.3);
  for (const x of [-0.06, 0, 0.06]) k.box(0.03, 0.015, 0.1, BRASS, x, 0.1, 0.24);
  // the keyboard: the key bed, 52 white keys and the black ones in their twos and threes,
  // the cheek blocks at either end and the music stand
  k.box(1.52, 0.08, 0.32, BLACK, 0, 0.66, -0.12);
  const white = 1.36 / 52;
  for (let n = 0; n < 52; n++) {
    const x = -0.68 + (n + 0.5) * white;
    k.box(white * 0.92, 0.025, 0.15, KEY, x, 0.715, -0.18);
    if ([0, 1, 3, 4, 5].includes((n + 5) % 7) && n < 51) k.box(white * 0.55, 0.025, 0.09, BLACK, x + white / 2, 0.735, -0.15);
  }
  for (const side of [-1, 1]) k.box(0.07, 0.1, 0.32, BLACK, side * 0.725, 0.73, -0.12);
  k.box(1.4, 0.06, 0.06, BLACK, 0, 0.78, -0.02); // the fallboard, folded back
  k.box(0.7, 0.3, 0.02, BLACK, 0, 1.06, 0.06, -0.3);
  k.box(0.4, 0.28, 0.005, 0xf7f3e8, 0, 1.07, 0.04, -0.3); // the music on it
  // the bench, and the pianist on it: seated, feet at the pedals, leaning in a little
  k.box(0.8, 0.06, 0.36, BLACK, 0, 0.5, -0.72);
  for (const [x, z] of [[-0.35, -0.86], [0.35, -0.86], [-0.35, -0.58], [0.35, -0.58]]) k.box(0.04, 0.48, 0.04, BLACK, x, 0.24, z);
  for (const side of [-1, 1]) {
    k.box(0.15, 0.13, 0.46, SUIT, side * 0.1, 0.6, -0.55); // the thigh
    k.box(0.13, 0.52, 0.13, SUIT, side * 0.1, 0.3, -0.32); // the shin
    k.box(0.11, 0.07, 0.24, 0x1a1a1a, side * 0.1, 0.04, -0.24); // the shoe
  }
  k.box(0.4, 0.5, 0.24, SUIT, 0, 0.84, -0.76, 0.12); // the jacket
  k.box(0.14, 0.38, 0.02, SHIRT, 0, 0.92, -0.65, 0.12); // the shirt front
  k.add(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 6), SKIN, 0, 1.12, -0.73);
  g.add(k.mesh(kitMat(0.35)));
  // the head and the arms move with the music, so they are pieces of their own
  const head = new Kit();
  head.add(new THREE.SphereGeometry(0.11, 10, 8), SKIN, 0, 0.1, 0);
  head.add(new THREE.SphereGeometry(0.115, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), HAIR, 0, 0.12, -0.01, -0.4);
  const h = head.mesh(kitMat(0.8));
  h.position.set(0, 1.16, -0.72);
  g.add(h);
  const arms = [-1, 1].map(side => {
    const a = new Kit();
    // from the shoulder down to the elbow, then forward to the hand over the keys
    a.rod([0, 0, 0], [side * 0.03, -0.3, 0.2], 0.045, SUIT, 6);
    a.rod([side * 0.03, -0.3, 0.2], [side * 0.03, -0.3, 0.52], 0.038, SUIT, 6);
    a.box(0.08, 0.035, 0.11, SKIN, side * 0.03, -0.31, 0.6);
    const m = a.mesh(kitMat(0.7));
    m.position.set(side * 0.21, 1.03, -0.72);
    g.add(m);
    return m;
  });
  // playing: each hand sweeping up and down its half of the keys, the fingers striking, the head
  // swaying with it (set whenever the piano is drawn, so only when someone is looking)
  arms[0].onBeforeRender = () => {
    const t = performance.now() / 1000;
    arms.forEach((m, k) => {
      const side = k ? 1 : -1;
      m.rotation.y = side * -0.18 + 0.22 * Math.sin(t * (1.1 + k * 0.4) + k * 2);
      m.rotation.x = 0.06 * Math.sin(t * (8 + k * 3)) - 0.03;
    });
    h.rotation.z = 0.08 * Math.sin(t * 1.3);
    h.rotation.x = 0.1 + 0.05 * Math.sin(t * 2.6);
  };
  return g;
}

// ------------------------------------------------------------------ SGOL, under the Stadshal

// The glass front of the cellar runs along the Stadshal's north-west side, 4.6 m below the street,
// from about (27, -87) to (66, -67). SGOL's name is over the middle of it, and its terrace is out
// on the forecourt in front: small square tables in a row along the glass, two chairs at each.
const SGOL = { x: 45.3, z: -76.9, turn: HALL_TURN };

function sgolTerrace() {
  const chairs = [], tables = [];
  for (let u = -15; u <= 15; u += 2.6) {
    for (const v of [2.3, 4.3]) {
      const tu = u + (v > 3 ? 1.3 : 0), [x, z] = local(SGOL, tu, v);
      // only where the forecourt is flat and down at the bottom, not on the lawn's slope
      const ys = [-0.6, 0, 0.6].flatMap(du => [-0.4, 0.4].map(dv => floor(...local(SGOL, tu + du, v + dv))));
      if (Math.max(...ys) > -3.9 || Math.max(...ys) - Math.min(...ys) > 0.35) continue;
      const y = floor(x, z);
      tables.push([tu, v, y]);
      chairs.push({ x: tu - 0.5, z: v, y, yaw: Math.PI / 2 }, { x: tu + 0.5, z: v, y, yaw: -Math.PI / 2 });
    }
  }
  return { chairs, tables };
}

function signTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#16181b';
  g.fillRect(0, 0, 512, 128);
  g.fillStyle = '#f3e7c9';
  g.shadowColor = '#ffd27a'; g.shadowBlur = 18;
  g.font = 'bold 92px Georgia, "Times New Roman", serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('S G O L', 256, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const { chairs: SGOL_CHAIRS, tables: SGOL_TABLES } = sgolTerrace();

function sgol() {
  const g = new THREE.Group(), k = new Kit();
  // the name, lit, on a dark board over the glass
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.1), new THREE.MeshStandardMaterial({ map: signTexture(), emissive: 0xffffff, emissiveMap: signTexture(), emissiveIntensity: 0.6, roughness: 0.5 }));
  sign.position.set(0, -1.15, 1.05);
  g.add(sign);
  k.box(4.6, 1.3, 0.08, 0x0d0e10, 0, -1.15, 1.0);
  for (const u of [-1.8, 1.8]) k.rod([u, -0.5, 1.0], [u, 0, 0], 0.02, 0x0d0e10, 4); // hung from the railing
  // the terrace: square white tables on a black leg, black chairs, each at the floor's height
  for (const [x, z, y] of SGOL_TABLES) {
    k.box(0.7, 0.04, 0.7, 0xf5f1e8, x, y + 0.76, z);
    k.add(new THREE.CylinderGeometry(0.03, 0.03, 0.74, 6), 0x1c1d20, x, y + 0.39, z);
    k.box(0.4, 0.03, 0.4, 0x1c1d20, x, y + 0.02, z);
  }
  for (const c of SGOL_CHAIRS) {
    const s = Math.sin(c.yaw), co = Math.cos(c.yaw), at = (lx, lz) => [c.x + lx * co + lz * s, c.z - lx * s + lz * co];
    k.box(0.42, 0.05, 0.42, 0x26282c, c.x, c.y + 0.49, c.z, 0, c.yaw);
    const [bx, bz] = at(0, -0.2);
    k.box(0.42, 0.45, 0.05, 0x26282c, bx, c.y + 0.73, bz, 0, c.yaw);
    for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) { const [px, pz] = at(lx, lz); k.box(0.03, 0.46, 0.03, 0x1c1d20, px, c.y + 0.26, pz); }
  }
  g.add(k.mesh(kitMat(0.6)));
  return g;
}

export const STADSHAL = [
  // the piano in the middle under the Stadshal's roof, between its four pillars, along the hall
  { id: 'stadshal-piano', name: 'Piano onder de Stadshal', x: 54, z: -87.5, turn: HALL_TURN, size: [1.7, 2.9], make: grandPiano },
  // SGOL: the sign on its glass front and the terrace on the forecourt (size: just the sign,
  // against the wall, so riders down there can still ride in among the tables)
  { id: 'sgol', name: 'SGOL', ...SGOL, size: [4.6, 0.3], chairs: SGOL_CHAIRS, make: sgol },
];
