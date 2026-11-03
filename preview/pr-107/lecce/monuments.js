// Lecce's statues and gates, modelled by hand in the same flat painted style as Ghent's (same shape
// as ghent/monuments.js): each { id, name, x, z (game metres, from its real position),
// turn (radians, 0 = facing south), size (the square of its base, or [along, across], which riders
// bump into), solid?: [[along, across, width, depth], ...] the rectangles riders bump into instead of
// the whole base (a gate with the way through left open), make() }.
import * as THREE from 'three';
import { elevation, ashlar, stringCourse, pilaster, roundArch, shade } from '../core/js/facades.js';

const STONE = '#e3cfa4'; // pietra leccese
const MARBLE = '#eee6d2';

export const MONUMENTS = [
  // La Colonna di Sant’Oronzo (1666-1739) on Piazza Sant’Oronzo: one of the two Roman columns that
  // ended the Appian Way at Brindisi, given to Lecce when the saint saved it from the plague. About
  // 29 m real (36 here), on a high pedestal with four niches, the bronze saint on top, blessing the town
  { id: 'colonna-santoronzo', name: 'Colonna di Sant’Oronzo', x: 431, z: 126, turn: 0, size: 7.4, seat: { half: 3.7, y: 0.45 }, make: colonna },
  // L’Obelisco (1822), at the Porta Napoli end of the old town, for Ferdinand I of the Two Sicilies: a
  // granite-grey obelisk on a stepped stone base (about 18 m real)
  { id: 'obelisco', name: 'Obelisco', x: -143.9, z: -421.9, turn: 0.3, size: 5.6, make: obelisco },
  // Porta Napoli (Arco di Carlo V, 1548), the triumphal arch on the way to Naples, about 20 m high:
  // two piers and a round arch between them, four columns, an attic with the emperor’s inscription
  // and a pediment on top. The road runs through it, so only the piers are solid.
  { id: 'porta-napoli', name: 'Porta Napoli', x: -16.2, z: -364.6, turn: 1.13, size: [17, 6.4], solid: [[-5.4, 0, 5.2, 6.2], [5.4, 0, 5.2, 6.2]], make: portaNapoli },
];

function kit() {
  const g = new THREE.Group();
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true, ...extra });
  const add = (geo, m, x, y, z) => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    o.castShadow = o.receiveShadow = true;
    g.add(o);
    return o;
  };
  return { g, mat, add };
}

// a side of a pedestal: ashlar, a framed panel and (niche) a dark round-headed niche with a little
// bronze saint standing in it
function sideTexture(w, h, niche) {
  return elevation(w, h, 24, (g, W, H) => {
    ashlar(g, -W / 2, 0, W / 2, H, STONE, { course: 0.5, seed: 17 });
    g.fillStyle = shade(STONE, -0.3);
    g.fillRect(-W / 2 + 0.35, 0.9, W - 0.7, H - 1.9);
    g.fillStyle = shade(STONE, 0.1);
    g.fillRect(-W / 2 + 0.55, 1.1, W - 1.1, H - 2.3);
    if (niche) {
      roundArch(g, 0, 1.6, W * 0.46, H - 3.4, '#4a3b2a');
      g.fillStyle = '#6a7a52'; // the saint, bronze
      g.beginPath(); g.moveTo(-0.45, 1.7); g.lineTo(-0.3, 3.6); g.lineTo(0.3, 3.6); g.lineTo(0.45, 1.7); g.fill();
      g.beginPath(); g.arc(0, 4, 0.28, 0, Math.PI * 2); g.fill();
    } else {
      g.fillStyle = '#4a4033';
      g.fillRect(-W * 0.3, 2.4, W * 0.6, 1.6); // an inscription
      g.fillStyle = shade(STONE, 0.3);
      for (let k = 0; k < 4; k++) g.fillRect(-W * 0.26, 2.7 + k * 0.32, W * 0.52 * (k === 3 ? 0.6 : 1), 0.1);
    }
    g.fillStyle = shade(STONE, 0.18);
    g.fillRect(-W / 2, H - 0.4, W, 0.4);
  });
}

function colonna() {
  const { g, mat, add } = kit();
  const stone = mat(STONE), marble = mat(MARBLE), bronze = mat(0x5a6648, { metalness: 0.45, roughness: 0.5 });
  const side = () => new THREE.MeshStandardMaterial({ map: sideTexture(4.4, 7, true), roughness: 0.9 });
  // three steps, the pedestal (the saint and three more in niches on its sides), its cornice
  add(new THREE.BoxGeometry(7.4, 0.5, 7.4), stone, 0, 0.25, 0);
  add(new THREE.BoxGeometry(6.4, 0.5, 6.4), stone, 0, 0.75, 0);
  add(new THREE.BoxGeometry(5.4, 0.5, 5.4), stone, 0, 1.25, 0);
  const sides = [side(), side(), stone, stone, side(), side()];
  add(new THREE.BoxGeometry(4.4, 7, 4.4), sides, 0, 5.5, 0);
  add(new THREE.BoxGeometry(4.9, 0.5, 4.9), stone, 0, 1.75 + 0.05, 0);
  add(new THREE.BoxGeometry(5.0, 0.7, 5.0), stone, 0, 9.35, 0);
  add(new THREE.BoxGeometry(4.2, 0.4, 4.2), stone, 0, 9.9, 0);
  // little bronze saints stepping out at the pedestal's four corners
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.3, 0.45, 1.8, 8), bronze, sx * 2.55, 2.8, sz * 2.55);
    add(new THREE.SphereGeometry(0.28, 8, 6), bronze, sx * 2.55, 3.9, sz * 2.55);
    add(new THREE.BoxGeometry(0.9, 0.3, 0.9), stone, sx * 2.55, 1.85, sz * 2.55);
  }
  // the shaft, white marble, a base ring and rings between the drums, tapering up
  const y0 = 10.1, hs = 17;
  add(new THREE.CylinderGeometry(1.15, 1.25, 0.5, 14), marble, 0, y0 + 0.25, 0);
  add(new THREE.CylinderGeometry(0.88, 1.0, hs, 14), marble, 0, y0 + 0.5 + hs / 2, 0);
  for (let k = 1; k < 6; k++) add(new THREE.CylinderGeometry(1.0, 1.0, 0.22, 14), marble, 0, y0 + 0.5 + (hs * k) / 6 + 0.1 * 0, 0).scale.set(0.97 - k * 0.012, 1, 0.97 - k * 0.012);
  // the composite capital: a ring, a flare of leaves with a volute at each corner, the abacus
  const top = y0 + 0.5 + hs;
  add(new THREE.CylinderGeometry(0.98, 0.9, 0.3, 14), marble, 0, top + 0.15, 0);
  add(new THREE.CylinderGeometry(1.5, 0.95, 1.5, 12), marble, 0, top + 1.05, 0);
  for (let a = 0; a < 4; a++) {
    const t = (a * Math.PI) / 2 + Math.PI / 4;
    add(new THREE.BoxGeometry(0.5, 0.6, 0.5), marble, Math.cos(t) * 1.55, top + 1.65, Math.sin(t) * 1.55).rotation.y = -t;
  }
  add(new THREE.BoxGeometry(3.3, 0.35, 3.3), marble, 0, top + 2.0, 0);
  // an upper block under the saint, with a cornice
  add(new THREE.BoxGeometry(2.2, 1.6, 2.2), stone, 0, top + 2.95, 0);
  add(new THREE.BoxGeometry(2.7, 0.3, 2.7), stone, 0, top + 3.9, 0);
  // the saint, 5 m, in a bishop’s long robe and cope, the right hand raised in blessing, the left on a crozier
  const y = top + 4.05;
  add(new THREE.CylinderGeometry(0.55, 0.95, 2.4, 10), bronze, 0, y + 1.2, 0);
  add(new THREE.CylinderGeometry(0.62, 0.75, 1.7, 10), bronze, 0, y + 2.6, 0);
  add(new THREE.BoxGeometry(1.5, 0.4, 0.8), bronze, 0, y + 3.4, 0); // the shoulders
  const cope = add(new THREE.BoxGeometry(1.6, 3.3, 0.2), bronze, 0, y + 1.9, -0.62);
  cope.rotation.x = -0.1;
  add(new THREE.CylinderGeometry(0.14, 0.18, 0.3, 8), bronze, 0, y + 3.7, 0);
  add(new THREE.SphereGeometry(0.36, 12, 10), bronze, 0, y + 4.05, 0.02);
  add(new THREE.ConeGeometry(0.4, 0.9, 4).rotateY(Math.PI / 4), bronze, 0, y + 4.7, 0); // the mitre
  add(new THREE.BoxGeometry(0.22, 0.3, 0.1), bronze, 0, y + 4.5, 0.32);
  const arm = (len, x, rx, rz, hand) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y + 3.35, 0.05);
    pivot.rotation.set(rx, 0, rz);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, len, 8), bronze);
    m.position.y = -len / 2;
    m.castShadow = true;
    const h = new THREE.Mesh(new THREE.BoxGeometry(...hand), bronze);
    h.position.y = -len - hand[1] / 2;
    h.castShadow = true;
    pivot.add(m, h);
    g.add(pivot);
  };
  arm(1.6, -0.85, 0, -2.7, [0.32, 0.5, 0.12]); // the right arm up and out, the hand flat in blessing
  arm(1.4, 0.85, -0.5, 0.2, [0.28, 0.28, 0.28]); // the left forward, holding the crozier
  add(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 6), bronze, 1.0, y + 1.9, 0.75);
  add(new THREE.TorusGeometry(0.25, 0.05, 5, 12, Math.PI * 1.5), bronze, 1.0, y + 4.1, 0.75);
  g.name = 'colonna-santoronzo';
  return g;
}

function obelisco() {
  const { g, mat, add } = kit();
  const stone = mat(STONE), grey = mat('#cfc7b4'), bronze = mat(0x5a6648, { metalness: 0.45, roughness: 0.5 });
  const side = new THREE.MeshStandardMaterial({ map: sideTexture(3.6, 4.2, false), roughness: 0.9 });
  add(new THREE.BoxGeometry(5.6, 0.5, 5.6), stone, 0, 0.25, 0);
  add(new THREE.BoxGeometry(4.8, 0.5, 4.8), stone, 0, 0.75, 0);
  add(new THREE.BoxGeometry(3.6, 4.2, 3.6), [side, side, stone, stone, side, side], 0, 3.1, 0);
  add(new THREE.BoxGeometry(4.2, 0.45, 4.2), stone, 0, 5.4, 0);
  add(new THREE.BoxGeometry(3.0, 0.5, 3.0), stone, 0, 5.85, 0);
  // little balls on the corners of the lower steps
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(new THREE.SphereGeometry(0.28, 8, 6), stone, sx * 2.45, 1.2, sz * 2.45);
    add(new THREE.CylinderGeometry(0.22, 0.28, 0.4, 6), stone, sx * 2.45, 1.0, sz * 2.45);
  }
  // the shaft: a four-sided taper with a pyramid on top (22.5 m in all)
  const h = 15.2;
  add(new THREE.CylinderGeometry(0.7, 1.15, h, 4).rotateY(Math.PI / 4), grey, 0, 6.1 + h / 2, 0);
  add(new THREE.ConeGeometry(0.72, 1.4, 4).rotateY(Math.PI / 4), grey, 0, 6.1 + h + 0.7, 0);
  add(new THREE.SphereGeometry(0.2, 8, 6), bronze, 0, 6.1 + h + 1.55, 0);
  g.name = 'obelisco';
  return g;
}

// the gate: its drawing on the two faces (a transparent texture, laid a hand's breadth proud)
function gateFace(W, H) {
  return elevation(W, H, 22, (g, w, h) => {
    const c = STONE, dark = '#3c3226';
    // the entablature and the cornice of the lower order, the string course above the arch
    stringCourse(g, -w / 2, w / 2, 12.2, c, 0.7);
    stringCourse(g, -w / 2, w / 2, 15, c, 0.9);
    // four columns on tall bases, two each side of the arch
    for (const x of [-7.3, -3.8, 3.8, 7.3]) {
      g.fillStyle = shade(c, -0.25);
      g.fillRect(x - 0.7, 0, 1.4, 2.2);
      pilaster(g, x, 2.2, 12.2, 1.0, '#ede2c4');
    }
    // the arch: a ring of voussoirs round the opening, a keystone, a relief in each spandrel
    g.strokeStyle = shade(c, -0.4);
    g.lineWidth = 0.18;
    for (let k = 0; k <= 8; k++) {
      const a = Math.PI * (k / 8);
      g.beginPath();
      g.moveTo(Math.cos(a) * 2.6, 8.4 + Math.sin(a) * 2.6);
      g.lineTo(Math.cos(a) * 3.3, 8.4 + Math.sin(a) * 3.3);
      g.stroke();
    }
    g.fillStyle = shade(c, 0.15);
    g.fillRect(-0.45, 11.5, 0.9, 1.0);
    g.fillStyle = shade(c, -0.2);
    for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 5.4, 10.3, 0.9, 0, Math.PI * 2); g.fill(); }
    // the attic: a dark panel with the inscription between pilasters, a coat of arms
    g.fillStyle = shade(c, -0.1);
    g.fillRect(-6.3, 15.45, 12.6, 4.0);
    g.fillStyle = dark;
    g.fillRect(-4.4, 16.0, 8.8, 2.4);
    g.fillStyle = shade(c, 0.3);
    for (let k = 0; k < 3; k++) g.fillRect(-4.0, 16.45 + k * 0.6, k === 2 ? 5 : 8, 0.18);
    for (const x of [-5.3, 5.3]) pilaster(g, x, 15.5, 19.4, 0.8, '#ede2c4');
    // the pediment: a niche with the shield of Charles V in it
    g.fillStyle = shade(c, -0.25);
    g.beginPath(); g.moveTo(-2, 19.9); g.lineTo(2, 19.9); g.lineTo(0, 22.7); g.closePath(); g.fill();
    g.fillStyle = '#5d4a2c';
    g.beginPath(); g.arc(0, 20.9, 0.55, 0, Math.PI * 2); g.fill();
  });
}

function portaNapoli() {
  const { g, mat, add } = kit();
  const W = 16, D = 6;
  const stone = mat(STONE), stoneTex = new THREE.MeshStandardMaterial({ map: wallTex(), roughness: 0.92, flatShading: true });
  // the body of the gate: a slab with a round-headed opening cut through it, along z
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2, 0); shape.lineTo(W / 2, 0); shape.lineTo(W / 2, 15); shape.lineTo(-W / 2, 15); shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-2.6, 0); hole.lineTo(2.6, 0); hole.lineTo(2.6, 8.4);
  hole.absarc(0, 8.4, 2.6, 0, Math.PI, false);
  hole.lineTo(-2.6, 0);
  shape.holes.push(hole);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false, curveSegments: 10 }), stoneTex);
  body.position.z = -D / 2;
  body.castShadow = body.receiveShadow = true;
  g.add(body);
  // the dark of the way through, so the inside of the vault reads
  add(new THREE.BoxGeometry(W + 1.2, 0.5, D + 0.9), stone, 0, 15.2, 0);
  add(new THREE.BoxGeometry(W - 0.3, 0.4, D - 0.4), stone, 0, 12.1, 0).scale.set(1, 1, 1.08);
  // the attic and its pediment, set back
  add(new THREE.BoxGeometry(12.6, 4, D - 0.2), stoneTex, 0, 17.4, 0);
  add(new THREE.BoxGeometry(13.6, 0.5, D), stone, 0, 19.65, 0);
  const pedi = new THREE.Shape();
  pedi.moveTo(-6.8, 0); pedi.lineTo(6.8, 0); pedi.lineTo(0, 3.2); pedi.closePath();
  const pm = new THREE.Mesh(new THREE.ExtrudeGeometry(pedi, { depth: D - 0.4, bevelEnabled: false }), stone);
  pm.position.set(0, 19.9, -(D - 0.4) / 2);
  pm.castShadow = true;
  g.add(pm);
  // pinnacles with balls at the cornice corners, a finial on the pediment
  for (const s of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.3, 0.4, 1.4, 6), stone, s * 7.4, 16.1, 0);
    add(new THREE.SphereGeometry(0.42, 8, 6), stone, s * 7.4, 17.0, 0);
  }
  add(new THREE.SphereGeometry(0.5, 8, 6), stone, 0, 23.4, 0);
  // columns standing proud of both faces, and the drawn face over each side
  for (const z of [-1, 1]) {
    for (const x of [-7.3, -3.8, 3.8, 7.3]) {
      add(new THREE.CylinderGeometry(0.5, 0.58, 10, 10), mat('#ede2c4'), x, 7.2, z * (D / 2 + 0.3));
      add(new THREE.BoxGeometry(1.5, 0.55, 1.1), stone, x, 12.2, z * (D / 2 + 0.3));
      add(new THREE.BoxGeometry(1.5, 2.2, 1.1), stone, x, 1.1, z * (D / 2 + 0.3));
    }
    const face = new THREE.Mesh(new THREE.PlaneGeometry(W, 24), new THREE.MeshStandardMaterial({ map: gateFace(W, 24), transparent: true, alphaTest: 0.4, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, side: THREE.DoubleSide }));
    face.position.set(0, 12, z * (D / 2 + 0.06));
    face.rotation.y = z > 0 ? 0 : Math.PI;
    g.add(face);
  }
  g.name = 'porta-napoli';
  return g;
}

function wallTex() {
  const t = elevation(4, 4, 24, (g, w, h) => ashlar(g, -2, 0, 2, 4, STONE, { course: 0.5, seed: 29 }));
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / 4, 1 / 4); // the extruded faces take their uv in metres
  return t;
}
