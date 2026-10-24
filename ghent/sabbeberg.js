// The Karel Sabbeberg in the Blaarmeersen: the man-made hill where Ghent skied on brush mats until
// 2003, named in 2019 after the ultrarunner Karel Sabbe, who ran up it thousands of times in
// training. Some 26 m above the park (34 m above sea level), with a lookout tower on top since 2009.
// OpenStreetMap leaves the hill out, and the terrain model (ghent/terrain.js) keeps only the
// Blandijnberg, so it is raised here (MOUNDS, see core/js/terrain.js), with the path winding up it
// from the park's paths, woods on its slopes, and the tower.
// And at the top of the tower, if you look: De Rechtvaardige Rechters, the panel of the Lam Gods
// stolen in 1934 and never found.
import * as THREE from 'three';

// game metres, from the hill's top at 51.04190 N, 3.68534 E
const TOP = { x: -3361, z: 1586 };

// A hill: its top at (x, z), h high, its foot an ellipse rx by rz (turned by `turn`), with a flat
// top `flat` of that; the slopes are smooth, steepest halfway down.
export const MOUNDS = [{ name: 'Karel Sabbeberg', x: TOP.x, z: TOP.z, h: 33, rx: 175, rz: 130, turn: 0.35, flat: 0.06 }];

// how far out the foot of the hill is, as a share of its ellipse, going `a` radians round
const [M] = MOUNDS;
const onHill = (a, f) => {
  const ex = Math.cos(a) * M.rx * f, ez = Math.sin(a) * M.rz * f, c = Math.cos(M.turn), s = Math.sin(M.turn);
  return [M.x + ex * c - ez * s, M.z + ex * s + ez * c];
};

// The path: from the park's path to the north-east, to the foot of the hill, and round and up it,
// nearly twice round, to the tower. A footpath (game metres, flat [x, z, ...]) as the map has them.
const UP = [];
UP.push(-3027, 1748, -3110, 1735, -3190, 1712);
for (let k = 0; k <= 64; k++) {
  const t = k / 64, a = -0.55 - t * Math.PI * 3.6, f = 1 - t * 0.9;
  UP.push(...onHill(a, f).map(v => Math.round(v * 10) / 10));
}
export const PATHS = [{ w: 2.5, foot: true, p: UP }];

// Trees all over its slopes, thick, but clear of the path (core/js/scenery.js keeps them off it) and
// of the grassy top round the tower, so it can be seen and seen from: a grove on the hill's outline.
const FOOT = [];
for (let k = 0; k < 48; k++) FOOT.push(...onHill((k / 48) * Math.PI * 2, 0.97));
export const GROVES = [{ p: FOOT, every: 60, open: 0.3, pines: 0.25, keep: [[TOP.x, TOP.z, 42]] }];

// ------------------------------------------------------------------ the tower and the panel

const STEEL = 0x9aa3a8, WOOD = 0x8a6a48;
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });

// a beam from a to b ([x, y, z]), w thick
function beam(g, m, a, b, w = 0.12) {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, L, w), m);
  mesh.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  mesh.castShadow = true;
  g.add(mesh);
  return mesh;
}

// The lookout tower: four steel legs, braced crosswise at every storey, stairs going up in flights
// round the inside, and a wooden deck with a railing 9 m up. The panel stands on the deck, facing
// down the path (+z, as it is turned).
const DECK = 9, HALF = 1.9;
function tower() {
  const g = new THREE.Group(), steel = mat(STEEL, { metalness: 0.5 }), wood = mat(WOOD, { roughness: 0.85 });
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  // the legs, a little wider at the foot, on concrete feet
  const foot = HALF * 1.18, at = (c, y) => { const f = foot + (HALF - foot) * (y / DECK); return [c[0] * f, y, c[1] * f]; };
  for (const c of corners) {
    beam(g, steel, at(c, 0), at(c, DECK + 1.1), 0.2);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), mat(0xb9b6ae, { roughness: 0.95 }));
    pad.position.set(...at(c, 0.1));
    g.add(pad);
  }
  // braces: a ring and a cross on each side, every storey
  for (const y of [3, 6, DECK]) {
    for (let k = 0; k < 4; k++) {
      const a = corners[k], b = corners[(k + 1) % 4];
      beam(g, steel, at(a, y), at(b, y), 0.12);
      beam(g, steel, at(a, y - 3), at(b, y), 0.07);
      beam(g, steel, at(b, y - 3), at(a, y), 0.07);
    }
  }
  // the stairs: one flight up each side in turn, steps and a stringer
  for (let f = 0; f < 3; f++) {
    const side = corners[f], next = corners[(f + 1) % 4], y0 = f * 3, y1 = y0 + 3;
    const inset = 0.45, A = at(side, y0), B = at(next, y1);
    const toward = (p, q) => [p[0] + (q[0] - p[0]) * 0.12, p[1], p[2] + (q[2] - p[2]) * 0.12];
    const a = toward([A[0] * (1 - inset / HALF), y0, A[2] * (1 - inset / HALF)], B), b = [B[0] * (1 - inset / HALF), y1, B[2] * (1 - inset / HALF)];
    beam(g, steel, [a[0], a[1] + 0.1, a[2]], [b[0], b[1] + 0.1, b[2]], 0.08);
    for (let s = 1; s < 14; s++) {
      const t = s / 14, step = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.28), wood);
      step.position.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
      step.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2]);
      step.castShadow = true;
      g.add(step);
    }
  }
  // the deck, its planks running across, and the railing round it
  const deck = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2 + 0.5, 0.14, HALF * 2 + 0.5), wood);
  deck.position.y = DECK;
  deck.castShadow = deck.receiveShadow = true;
  g.add(deck);
  for (let k = 0; k < 4; k++) {
    const a = corners[k], b = corners[(k + 1) % 4], e = HALF + 0.22;
    beam(g, steel, [a[0] * e, DECK + 1.1, a[1] * e], [b[0] * e, DECK + 1.1, b[1] * e], 0.07);
    beam(g, steel, [a[0] * e, DECK + 0.55, a[1] * e], [b[0] * e, DECK + 0.55, b[1] * e], 0.04);
    for (let s = 0; s <= 8; s++) {
      const t = s / 8, x = (a[0] + (b[0] - a[0]) * t) * e, z = (a[1] + (b[1] - a[1]) * t) * e;
      beam(g, steel, [x, DECK, z], [x, DECK + 1.1, z], 0.035);
    }
  }
  // a sign at the foot of the stairs
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.05), new THREE.MeshStandardMaterial({ map: signTexture(), roughness: 0.7 }));
  sign.position.set(0, 1.4, foot + 0.8);
  g.add(sign);
  beam(g, steel, [0, 0, foot + 0.78], [0, 1.15, foot + 0.78], 0.06);
  const panel = justJudges();
  panel.position.set(0.3, DECK + 0.07, HALF - 0.35);
  panel.rotation.y = -0.15;
  g.add(panel);
  return g;
}

function signTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 140;
  const x = c.getContext('2d');
  x.fillStyle = '#2f5d3a'; x.fillRect(0, 0, 256, 140);
  x.strokeStyle = '#e8e4d8'; x.lineWidth = 6; x.strokeRect(8, 8, 240, 124);
  x.fillStyle = '#f2efe6'; x.textAlign = 'center';
  x.font = 'bold 30px sans-serif'; x.fillText('KAREL', 128, 56); x.fillText('SABBEBERG', 128, 92);
  x.font = '18px sans-serif'; x.fillText('uitkijktoren', 128, 120);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// De Rechtvaardige Rechters (the Just Judges, the bottom left panel of the Lam Gods, 149 by 55 cm),
// on a little easel, its gilt frame catching the light: ten judges on horseback in red, blue and
// green, with fur hats and turbans, riding towards the Lamb through a green landscape under a pale sky.
function justJudges() {
  const g = new THREE.Group();
  const W = 0.69, H = 1.86; // the panel, at the game's scale
  const c = document.createElement('canvas');
  c.width = 220; c.height = 600;
  const x = c.getContext('2d');
  const sky = x.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#8fb2cf'); sky.addColorStop(1, '#e9e3c8');
  x.fillStyle = sky; x.fillRect(0, 0, 220, 600);
  // far hills and a town on one, then the green slope the judges ride on
  x.fillStyle = '#7d8f6a'; x.beginPath(); x.moveTo(0, 230); x.quadraticCurveTo(110, 180, 220, 215); x.lineTo(220, 600); x.lineTo(0, 600); x.fill();
  x.fillStyle = '#9a8f7a'; for (let k = 0; k < 6; k++) x.fillRect(120 + k * 12, 186 - (k % 3) * 8, 9, 22 + (k % 3) * 8);
  x.fillStyle = '#3f5a2c'; x.beginPath(); x.moveTo(0, 300); x.quadraticCurveTo(140, 260, 220, 290); x.lineTo(220, 600); x.lineTo(0, 600); x.fill();
  // the riders, three ranks of them going right, the front ones lowest
  const ROBES = ['#9b1c1c', '#1f3f7a', '#2f6b3a', '#7a1f4f', '#b07a1f', '#5a2a1a'], HORSES = ['#f2efe6', '#4a3424', '#8a6a48', '#d9d2c2', '#2a211b'];
  let n = 0;
  for (const [row, y0] of [[0, 360], [1, 430], [2, 505]]) {
    for (let k = 0; k < 4 - (row === 2 ? 1 : 0); k++) {
      const cx = 30 + k * 52 + row * 8, cy = y0 + (k % 2) * 6;
      x.fillStyle = HORSES[(n + row) % HORSES.length];
      x.beginPath(); x.ellipse(cx, cy + 34, 34, 15, 0, 0, Math.PI * 2); x.fill(); // the horse
      x.beginPath(); x.ellipse(cx + 34, cy + 20, 9, 14, 0.5, 0, Math.PI * 2); x.fill(); // its head
      x.fillRect(cx - 24, cy + 40, 6, 30); x.fillRect(cx + 18, cy + 40, 6, 30); // legs
      x.fillStyle = ROBES[n % ROBES.length];
      x.beginPath(); x.moveTo(cx - 14, cy + 36); x.lineTo(cx + 14, cy + 36); x.lineTo(cx + 9, cy - 4); x.lineTo(cx - 9, cy - 4); x.fill(); // the rider's robe
      x.fillStyle = '#e2b48c'; x.beginPath(); x.arc(cx, cy - 12, 7, 0, Math.PI * 2); x.fill(); // the face
      x.fillStyle = n % 3 === 0 ? '#2a1d14' : n % 3 === 1 ? '#c9a24a' : '#5a4632'; // fur hat, gold turban, beaver hat
      x.fillRect(cx - 9, cy - 26, 18, 10);
      n++;
    }
  }
  // the old varnish: a warm, darkened film over it all, and fine cracks
  x.fillStyle = 'rgba(90,60,20,0.18)'; x.fillRect(0, 0, 220, 600);
  x.strokeStyle = 'rgba(40,25,10,0.25)'; x.lineWidth = 1;
  for (let k = 0; k < 40; k++) { const a = (k * 53) % 220, b = (k * 137) % 600; x.beginPath(); x.moveTo(a, b); x.lineTo(a + 18, b + 3); x.stroke(); }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const paint = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }));
  const gold = mat(0xc9a03a, { metalness: 0.8, roughness: 0.3, emissive: 0x5a4210, emissiveIntensity: 0.6 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.04), mat(0x5a3f26));
  // the panel leans back a little on its easel
  const lean = new THREE.Group();
  lean.position.set(0, 0.35, 0);
  lean.rotation.x = -0.12;
  g.add(lean);
  back.position.set(0, H / 2, -0.03);
  paint.position.set(0, H / 2, 0);
  lean.add(back, paint);
  for (const [w, h, px, py] of [[W + 0.16, 0.08, 0, 0], [W + 0.16, 0.08, 0, H], [0.08, H, -W / 2 - 0.04, H / 2], [0.08, H, W / 2 + 0.04, H / 2]]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), gold);
    f.position.set(px, py, 0.01);
    f.castShadow = true;
    lean.add(f);
  }
  // the easel: two legs in front, one behind, and the ledge the panel stands on
  const easel = mat(0x6b4a2e, { roughness: 0.8 });
  beam(g, easel, [-0.3, 0, 0.12], [-0.22, 2.1, -0.18], 0.05);
  beam(g, easel, [0.3, 0, 0.12], [0.22, 2.1, -0.18], 0.05);
  beam(g, easel, [0, 0, -0.75], [0, 1.95, -0.2], 0.05);
  beam(g, easel, [-0.42, 0.33, 0.06], [0.42, 0.33, 0.06], 0.06);
  // a glint round it, so it can be spotted from the foot of the tower
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0xffe9a8, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.position.set(0, 1.3, 0.1);
  glow.scale.set(2.6, 3.2, 1);
  g.add(glow);
  return g;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// On the top of the hill, turned to face down the last stretch of the path.
export const SABBEBERG = [
  { id: 'sabbeberg-toren', name: 'Uitkijktoren Karel Sabbeberg', x: TOP.x, z: TOP.z, turn: 0.4, size: HALF * 2.5, reach: 120, make: tower },
];
