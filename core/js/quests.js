import * as THREE from 'three';
import { createWalker } from './riders.js';
import { clearLine, inWater, waterLevel } from './collide.js';
import { WATER } from './relief.js';
import { tourBoat, swimmer } from './scenery.js';
import { STOPS } from './city.js';

// Quests: a short mission somewhere in the city, against the clock. The quests themselves, where
// they start and their words, are the city's (<city>/quests.js); here is how each kind plays.

// The same dice for every run of a quest, so it is set up the same way each time.
function seeded(text) {
  let a = 0;
  for (const ch of text) a = (Math.imul(a, 31) + ch.charCodeAt(0)) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CATCH = 3.2; // how close you have to get to the thief
const ZIG_AMP = 3, ZIG_W = (2 * Math.PI) / 1.8; // the tired thief's weave: metres to either side, and how fast (one side and back in 1.8 s)
const PICK = 3.2; // and to a thing to pick it up
const HALT = 9, HALT_SPEED = 3; // the bus at a stop: this close to its pole, and (nearly) standing still
// the helicopter rescue: flying through a swimmer's circle (the quest's radius) no higher than this
// over the water picks them up there and then, at any speed; at the end land in the drop's circle
const WINCH_LOW = 35;
const ROPE_HANG = 4; // and how far below the door they hang on the way back

// ------------------------------------------------------------------ the streets as a graph

// Every road's points are nodes, joined along each road; roads that meet share a point, so this is
// the street network. Only the biggest connected piece is kept, the rest are odd bits of path.
let graph = null;
function getGraph(map) {
  if (graph) return graph;
  const id = new Map(), X = [], Z = [], adj = [], street = new Set(); // street: on a road, not a footpath
  const node = (x, z) => {
    const k = Math.round(x * 2) * 100003 + Math.round(z * 2);
    let i = id.get(k);
    if (i === undefined) { i = X.length; id.set(k, i); X.push(x); Z.push(z); adj.push([]); }
    return i;
  };
  for (const rd of map.roads) {
    let prev = -1;
    for (let k = 0; k < rd.p.length; k += 2) {
      const i = node(rd.p[k], rd.p[k + 1]);
      if (!rd.foot) street.add(i);
      if (prev >= 0 && prev !== i) {
        const L = Math.hypot(X[i] - X[prev], Z[i] - Z[prev]);
        adj[i].push([prev, L]);
        adj[prev].push([i, L]);
      }
      prev = i;
    }
  }
  // the biggest connected piece
  const comp = new Int32Array(X.length).fill(-1), sizes = [];
  for (let s = 0; s < X.length; s++) {
    if (comp[s] >= 0) continue;
    const c = sizes.length, stack = [s];
    comp[s] = c;
    let n = 0;
    while (stack.length) {
      const u = stack.pop();
      n++;
      for (const [v] of adj[u]) if (comp[v] < 0) { comp[v] = c; stack.push(v); }
    }
    sizes.push(n);
  }
  const main = sizes.indexOf(Math.max(...sizes));
  // a grid of the kept nodes, to find the nearest one quickly
  const CELL = 40, cells = new Map(), ck = (i, j) => i * 100003 + j;
  for (let i = 0; i < X.length; i++) {
    if (comp[i] !== main) continue;
    const k = ck(Math.floor(X[i] / CELL), Math.floor(Z[i] / CELL));
    if (!cells.has(k)) cells.set(k, []);
    cells.get(k).push(i);
  }
  // onStreet: only a node on a road, for a start or a goal (a footpath may squeeze between buildings)
  const nearest = (x, z, onStreet = false) => {
    const ci = Math.floor(x / CELL), cj = Math.floor(z / CELL);
    for (let ring = 0; ring < 40; ring++) {
      let best = -1, bd = Infinity;
      for (let i = ci - ring; i <= ci + ring; i++) {
        for (let j = cj - ring; j <= cj + ring; j++) {
          if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== ring) continue;
          for (const n of cells.get(ck(i, j)) ?? []) {
            if (onStreet && !street.has(n)) continue;
            const d = (X[n] - x) ** 2 + (Z[n] - z) ** 2;
            if (d < bd) { bd = d; best = n; }
          }
        }
      }
      if (best >= 0) return best;
    }
    return 0;
  };
  return (graph = { X, Z, adj, nearest });
}

// Shortest distances along the streets from node s, and the way back from each node.
function dijkstra(g, s) {
  const dist = new Float64Array(g.X.length).fill(Infinity), prev = new Int32Array(g.X.length).fill(-1);
  const heap = [[0, s]];
  dist[s] = 0;
  const push = e => {
    heap.push(e);
    for (let i = heap.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ;) {
        const a = 2 * i + 1, b = a + 1;
        let m = i;
        if (a < heap.length && heap[a][0] < heap[m][0]) m = a;
        if (b < heap.length && heap[b][0] < heap[m][0]) m = b;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, u] = pop();
    if (d > dist[u]) continue;
    for (const [v, L] of g.adj[u]) {
      if (d + L < dist[v]) { dist[v] = d + L; prev[v] = u; push([dist[v], v]); }
    }
  }
  return { dist, prev };
}

// ------------------------------------------------------------------ models

const mat = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

function add(parent, geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}

// The Ghent Altarpiece, or rather its middle panel: the Lamb on its altar in a green meadow.
function painting() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 180;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 90);
  sky.addColorStop(0, '#f4d77a');
  sky.addColorStop(1, '#cfe3c0');
  g.fillStyle = sky;
  g.fillRect(0, 0, 256, 90);
  g.fillStyle = '#3f7a2e';
  g.fillRect(0, 80, 256, 100);
  g.fillStyle = '#2c5a20';
  for (let k = 0; k < 40; k++) g.fillRect((k * 53) % 256, 90 + ((k * 31) % 85), 6, 4);
  // the rays of the dove
  g.strokeStyle = 'rgba(255, 236, 140, 0.9)';
  g.lineWidth = 2;
  for (let a = 0; a < 14; a++) {
    g.beginPath();
    g.moveTo(128, 22);
    g.lineTo(128 + Math.cos(a / 13 * Math.PI) * 140, 22 + Math.sin(a / 13 * Math.PI) * 110);
    g.stroke();
  }
  g.fillStyle = '#fff';
  g.beginPath();
  g.arc(128, 22, 7, 0, Math.PI * 2);
  g.fill();
  // the altar in red, the lamb on it
  g.fillStyle = '#9e1c22';
  g.fillRect(96, 100, 64, 36);
  g.fillStyle = '#fbf6ea';
  g.beginPath();
  g.ellipse(128, 92, 20, 11, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(146, 84, 7, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#ffd640';
  g.beginPath();
  g.arc(146, 82, 11, 0, Math.PI * 2);
  g.globalAlpha = 0.5;
  g.fill();
  g.globalAlpha = 1;
  // the crowds coming from the sides
  const folk = ['#7b1f1f', '#1f3d7b', '#d9c38a', '#5b2b6b', '#f1ede4'];
  for (let k = 0; k < 18; k++) {
    g.fillStyle = folk[k % folk.length];
    const x = k < 9 ? 8 + k * 9 : 168 + (k - 9) * 9, y = 120 + (k % 3) * 14;
    g.fillRect(x, y, 7, 16);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const group = new THREE.Group();
  add(group, new THREE.BoxGeometry(1.5, 1.1, 0.08), mat(0xc8a03a, 0.35, { metalness: 0.6 }));
  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.92), new THREE.MeshBasicMaterial({ map: tex }));
  canvas.position.z = 0.045;
  group.add(canvas);
  const back = canvas.clone();
  back.rotation.y = Math.PI;
  back.position.z = -0.045;
  group.add(back);
  return group;
}

// The cartapesta (papier-mâché) statue of Sant’Oronzo, Lecce's patron saint, as carried at his
// feast: a bishop in a gold cape and white robe on a red plinth, mitre on his head, one hand up.
function statue() {
  const gold = mat(0xe0b030, 0.35, { metalness: 0.5 }), red = mat(0xb3202a, 0.6), white = mat(0xf6f1e4, 0.7), flesh = mat(0xe8c4a0, 0.8);
  const group = new THREE.Group();
  add(group, new THREE.BoxGeometry(0.5, 0.14, 0.4), red, 0, 0.07, 0);
  add(group, new THREE.BoxGeometry(0.54, 0.04, 0.44), gold, 0, 0.16, 0);
  // the robe, wide at the foot, and the cape over it
  add(group, new THREE.CylinderGeometry(0.15, 0.24, 0.6, 12), white, 0, 0.48, 0);
  add(group, new THREE.CylinderGeometry(0.17, 0.27, 0.46, 12, 1, true), gold, 0, 0.56, -0.02).material.side = THREE.DoubleSide;
  add(group, new THREE.BoxGeometry(0.3, 0.05, 0.16), red, 0, 0.78, 0.1); // the stole
  add(group, new THREE.SphereGeometry(0.1, 10, 8), flesh, 0, 0.9, 0);
  // the mitre: a gold cone with a red band
  add(group, new THREE.CylinderGeometry(0.01, 0.1, 0.24, 4), gold, 0, 1.06, 0);
  add(group, new THREE.CylinderGeometry(0.102, 0.102, 0.04, 8), red, 0, 0.96, 0);
  // the blessing hand held up, the other one on the crook
  const arm = add(group, new THREE.BoxGeometry(0.06, 0.3, 0.06), white, 0.2, 0.78, 0.04);
  arm.rotation.z = -0.5;
  add(group, new THREE.SphereGeometry(0.045, 8, 6), flesh, 0.3, 0.93, 0.04);
  add(group, new THREE.BoxGeometry(0.03, 0.8, 0.03), gold, -0.2, 0.55, 0.1);
  group.scale.setScalar(1.3);
  return group;
}

// A julientje: a white plastic tray heaped with fries, chunks of curryworst on top, crispy fried
// onions over it all and a big dollop of mayonnaise in one corner.
const tray = mat(0xf2efe6, 0.5, { side: THREE.DoubleSide }), fry = mat(0xf0c35a, 0.65), fryDark = mat(0xd9a03c, 0.7);
const worst = mat(0x6e3420, 0.55), worstCut = mat(0xa8673f, 0.7), onion = mat(0xa8692c, 0.9), mayo = mat(0xfbf3d5, 0.3);
function friesModel() {
  const root = new THREE.Group(), r = k => { const v = Math.sin(k * 12.9898) * 43758.5453; return v - Math.floor(v); }; // the same tray each time
  const W = 0.36, D = 0.25, H = 0.09, taper = 0.84; // across the top; the bottom a bit smaller
  // the tray: four sloping sides and a bottom, a lip round the top
  const box = (top, bottom, h, open) => new THREE.CylinderGeometry(Math.SQRT1_2 * top, Math.SQRT1_2 * bottom, h, 4, 1, open).rotateY(Math.PI / 4).scale(1, 1, D / W);
  add(root, box(W, W * taper, H, true), tray, 0, H / 2, 0);
  add(root, box(W * taper, W * taper, 0.006, false), tray, 0, 0.003, 0);
  add(root, box(W + 0.016, W, 0.01, true), tray, 0, H - 0.002, 0);
  // the fries: a bed of them filling the tray, more heaped on it, a few lying over the edge
  add(root, box(W * 0.97, W * taper, H * 0.75, false), fry, 0, H * 0.45, 0);
  for (let k = 0; k < 60; k++) {
    const x = (r(k) - 0.5) * W * 0.9, z = (r(k + 50) - 0.5) * D * 0.85, len = 0.06 + r(k + 100) * 0.06;
    const heap = Math.max(0, 1 - Math.hypot(x / W, z / D) * 1.6);
    const f = add(root, new THREE.BoxGeometry(0.018, 0.018, len), k % 4 ? fry : fryDark, x, H * 0.85 + heap * 0.04 + r(k + 150) * 0.015, z);
    f.rotation.set((r(k + 200) - 0.5) * 0.7, r(k + 250) * Math.PI, (r(k + 300) - 0.5) * 0.5);
  }
  // curryworst chunks, the cut side showing
  for (let k = 0; k < 8; k++) {
    const p = add(root, new THREE.CylinderGeometry(0.022, 0.022, 0.032, 10), worst, (r(k + 400) - 0.6) * W * 0.65, H + 0.02 + r(k + 450) * 0.012, (r(k + 500) - 0.5) * D * 0.6);
    p.rotation.set(Math.PI / 2 + (r(k + 550) - 0.5) * 0.8, r(k + 600) * Math.PI, 0);
    add(p, new THREE.CylinderGeometry(0.019, 0.019, 0.034, 10), worstCut);
  }
  // fried onions, scattered over the top
  for (let k = 0; k < 70; k++) {
    const o = add(root, new THREE.BoxGeometry(0.016, 0.005, 0.01), onion, (r(k + 700) - 0.6) * W * 0.75, H + 0.025 + r(k + 750) * 0.025, (r(k + 800) - 0.5) * D * 0.75);
    o.rotation.set(r(k + 850) * 3, r(k + 900) * 3, r(k + 950) * 3);
  }
  // the mayonnaise
  add(root, new THREE.SphereGeometry(0.065, 12, 8).scale(1.25, 0.5, 1.1), mayo, W * 0.32, H + 0.015, -D * 0.1);
  add(root, new THREE.SphereGeometry(0.04, 10, 6).scale(1, 0.65, 1), mayo, W * 0.33, H + 0.045, -D * 0.1);
  root.scale.setScalar(1.6);
  return root;
}

const shotGlass = mat(0xe7f6ff, 0.2, { transparent: true, opacity: 0.6, side: THREE.DoubleSide });
const tequila = mat(0xe9c15d, 0.3);
const bluePaint = mat(0x1e66f5, 0.35), bullet = mat(0x8a8f98, 0.4, { metalness: 0.5 });
const PAINT_BLUES = [0x1e66f5, 0x4f8cff, 0x0d3fb8];
// a paintball: a small blue ball
const paintBall = new THREE.SphereGeometry(0.09, 8, 6), paintBlob = new THREE.SphereGeometry(1, 6, 5); // shared: nothing built or uploaded per shot
function paintModel() {
  const root = new THREE.Group(), ball = new THREE.Mesh(paintBall, bullet);
  root.add(ball);
  return root;
}
function tequilaModel() {
  const root = new THREE.Group();
  add(root, new THREE.CylinderGeometry(0.12, 0.085, 0.25, 12, 1, true), shotGlass, 0, 0.125, 0);
  add(root, new THREE.CylinderGeometry(0.085, 0.085, 0.025, 12), shotGlass, 0, 0.0125, 0);
  add(root, new THREE.CylinderGeometry(0.105, 0.08, 0.16, 12), tequila, 0, 0.095, 0);
  return root;
}

// A student back from the cantus: white lab coat scribbled full, the club's sash across it, arms
// out in front, a little green about the face.
const SASHES = [[0xc62828, 0xffffff], [0x1565c0, 0xfdd835], [0x2e7d32, 0x1d1a17], [0x6a1b9a, 0xffffff], [0xef6c00, 0x1d1a17], [0xad1457, 0x90caf9]];
const coat = mat(0xf4f3ee, 0.85), jeans = mat(0x2c3e66, 0.8), shoe = mat(0x1d1a17, 0.6), skin = mat(0xb9cf98, 0.8), ink = mat(0x3a4a8a, 0.9);
const sashMats = SASHES.map(([a, b]) => [mat(a, 0.6), mat(b, 0.6)]);
function zombieModel(i, look = 'students') {
  if (look === 'pizzica') return dancerModel(i);
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body);
  const legs = [-0.12, 0.12].map(x => {
    const hip = new THREE.Group();
    hip.position.set(x, 0.95, 0);
    body.add(hip);
    add(hip, new THREE.BoxGeometry(0.16, 0.9, 0.18).translate(0, -0.45, 0), jeans);
    add(hip, new THREE.BoxGeometry(0.17, 0.1, 0.28), shoe, 0, -0.9, 0.05);
    return hip;
  });
  add(body, new THREE.BoxGeometry(0.52, 1.2, 0.32), coat, 0, 1.15, 0);
  // scribbles on the coat
  for (let k = 0; k < 3; k++) add(body, new THREE.BoxGeometry(0.16, 0.03, 0.01), ink, -0.12 + k * 0.11, 0.8 + k * 0.17, 0.165).rotation.z = 0.4 - k * 0.3;
  // the sash, over the left shoulder down to the right hip, in two colours
  const [a, b] = sashMats[i % sashMats.length];
  for (const [m, off] of [[a, -0.035], [b, 0.035]]) {
    const s = add(body, new THREE.BoxGeometry(0.07, 1.05, 0.36), m, off, 1.3, 0);
    s.rotation.z = 0.75;
  }
  const head = add(body, new THREE.SphereGeometry(0.18, 12, 10), skin, 0, 1.95, 0.02);
  if (i % 3 === 0) {
    // a student cap ("pet"), in the colours of the sash
    add(head, new THREE.CylinderGeometry(0.21, 0.19, 0.12, 14), a, 0, 0.14, 0);
    add(head, new THREE.BoxGeometry(0.26, 0.03, 0.14), shoe, 0, 0.09, 0.18);
  }
  const arms = [-0.32, 0.32].map(x => {
    const arm = new THREE.Group();
    arm.position.set(x, 1.68, 0);
    body.add(arm);
    add(arm, new THREE.BoxGeometry(0.13, 0.58, 0.14).translate(0, -0.29, 0), coat);
    add(arm, new THREE.SphereGeometry(0.07, 8, 6), skin, 0, -0.6, 0);
    return arm;
  });
  const glass = tequilaModel();
  glass.position.set(0, -0.6, 0);
  arms[0].add(glass);
  glass.visible = false;
  let phase = Math.random() * 6;
  return {
    root,
    // a paintball bursts on them: flat blobs of blue paint on the coat and face
    splat() {
      const side = Math.random() < 0.5 ? -1 : 1; // all on one side of them, where it hit
      for (let k = 0; k < 4; k++) {
        const b = new THREE.Mesh(paintBlob, bluePaint), r = 0.06 + Math.random() * 0.07;
        b.scale.set(r, r, r * 0.3);
        b.position.set(side * (0.04 + Math.random() * 0.2), 0.9 + Math.random() * 0.9, 0.17);
        body.add(b);
      }
    },
    // kneel: 0 standing, 1 on their knees at a julientje, eating
    animate(dt, speed, retch, kneel = 0, drink = 0, fallen = 0) {
      glass.visible = drink > 0 && fallen === 0;
      if (fallen > 0) {
        body.position.set(0, 0.3 * fallen, 0);
        body.rotation.set(-Math.PI / 2 * fallen, 0, 0);
        head.rotation.x = 0;
        legs.forEach(hip => { hip.rotation.x = 0; });
        arms.forEach(arm => { arm.rotation.x = -0.2; });
        return;
      }
      phase += dt * (1.5 + speed * 1.6);
      const k = Math.min(1, 0.25 + speed / 3);
      body.position.y = -0.45 * kneel;
      body.rotation.z = Math.sin(phase * 0.5) * 0.12 * (1 - kneel); // the sway of one beer too many
      body.rotation.x = 0.1 + retch * 0.5 + 0.3 * kneel; // bent over to throw up, or over the fries
      head.rotation.x = retch * 0.4 + 0.3 * kneel;
      if (drink > 0) head.rotation.x = -0.4 * drink;
      // on the knees: the hips down, the legs folded back just so far that the feet are on the ground
      const tilt = body.rotation.x, hipY = -0.45 * kneel + 0.95 * Math.cos(tilt);
      const back = Math.acos(Math.min(1, Math.max(0, (hipY - 0.2) / 0.9))) - tilt; // the shoe 20 cm up, so it lies on top
      legs.forEach((hip, s) => { hip.rotation.x = Math.sin(phase + s * Math.PI) * 0.5 * k * (1 - kneel) + back * kneel; });
      // one hand after the other from the tray to the mouth
      arms.forEach((arm, s) => { arm.rotation.x = (-1.35 - retch * 0.4 + Math.sin(phase * 0.7 + s) * 0.12) * (1 - kneel) + (-0.7 + Math.sin(phase * 2.2 + s * Math.PI) * 0.5) * kneel; });
      if (drink > 0) {
        arms[0].rotation.x = -2.6 * drink;
        glass.rotation.x = -0.7 * drink;
      }
    },
  };
}

// A dancer of the pizzica, the taranta dance: a white dress and a red sash and scarf, arms out and
// spinning on the spot. It moves like a student does, so the same code can drive it.
const dress = mat(0xfaf6ee, 0.85), redSash = mat(0xc62828, 0.6), hair = mat(0x2a1a14, 0.9), tan = mat(0xd9a77c, 0.8);
function dancerModel(i) {
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body);
  add(body, new THREE.CylinderGeometry(0.2, 0.46, 0.95, 14), dress, 0, 0.62, 0);
  add(body, new THREE.BoxGeometry(0.42, 0.5, 0.26), dress, 0, 1.38, 0);
  add(body, new THREE.CylinderGeometry(0.24, 0.24, 0.1, 12), redSash, 0, 1.1, 0);
  add(body, new THREE.BoxGeometry(0.1, 0.34, 0.03), redSash, 0.14, 0.9, 0.2); // the ends of the sash
  // the scarf over one shoulder, in red, or on the head for every other dancer
  const head = add(body, new THREE.SphereGeometry(0.17, 12, 10), tan, 0, 1.85, 0);
  if (i % 2) add(head, new THREE.SphereGeometry(0.185, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), redSash, 0, 0.02, -0.01);
  else add(head, new THREE.SphereGeometry(0.185, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, 0, 0.02, -0.02);
  add(body, new THREE.BoxGeometry(0.5, 0.07, 0.1), redSash, 0, 1.58, 0).rotation.z = 0.3;
  const arms = [-0.3, 0.3].map(x => {
    const arm = new THREE.Group();
    arm.position.set(x, 1.55, 0);
    body.add(arm);
    add(arm, new THREE.BoxGeometry(0.11, 0.55, 0.12).translate(0, -0.27, 0), dress);
    add(arm, new THREE.SphereGeometry(0.06, 8, 6), tan, 0, -0.57, 0);
    return arm;
  });
  let phase = Math.random() * 6, turn = Math.random() * 6;
  return {
    root,
    animate(dt, speed, retch) {
      phase += dt * (1.5 + speed * 1.6);
      // the spin, which is what makes it the pizzica; fast when it has seen you
      turn += dt * (2.2 + speed * 2.4 + retch * 5);
      body.rotation.y = turn;
      arms.forEach((arm, s) => { arm.rotation.z = (s ? -1 : 1) * (1.2 + Math.sin(phase * 0.7 + s) * 0.25); });
      body.position.y = Math.abs(Math.sin(phase)) * 0.08;
      body.rotation.x = retch * 0.3;
    },
  };
}

// A lost student cap, spinning a little above the street, with a glow round it on the ground.
const capTop = mat(0x8e1b1b, 0.5), capBand = mat(0xfdd835, 0.4);
const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd640, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide });
function capModel() {
  const root = new THREE.Group(), spin = new THREE.Group();
  root.add(spin);
  spin.position.y = 1.4;
  spin.scale.setScalar(2.2);
  add(spin, new THREE.CylinderGeometry(0.24, 0.22, 0.14, 16), capTop, 0, 0.05, 0);
  add(spin, new THREE.CylinderGeometry(0.225, 0.225, 0.05, 16), capBand, 0, -0.04, 0);
  add(spin, new THREE.BoxGeometry(0.3, 0.025, 0.16), shoe, 0, -0.05, 0.22);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.6, 32).rotateX(-Math.PI / 2), glowMat);
  ring.position.y = 0.08;
  root.add(ring);
  return { root, spin };
}

// A lost pasticciotto, Lecce's oval custard pastry, spinning a little above the street, with a glow
// round it on the ground.
const pastry = mat(0xd9962e, 0.35), glaze = mat(0xf3c45a, 0.2, { metalness: 0.1 }), sugar = mat(0xfff6dc, 0.8);
function pasticciottoModel() {
  const root = new THREE.Group(), spin = new THREE.Group();
  root.add(spin);
  spin.position.y = 1.4;
  spin.scale.setScalar(2.2);
  // an oval, fat in the middle, with a shiny golden top and a dusting of sugar
  add(spin, new THREE.SphereGeometry(0.2, 16, 10).scale(1.5, 0.75, 1), pastry, 0, 0, 0);
  add(spin, new THREE.SphereGeometry(0.19, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1.45, 0.8, 0.95), glaze, 0, 0.04, 0);
  for (let k = 0; k < 4; k++) add(spin, new THREE.BoxGeometry(0.03, 0.01, 0.03), sugar, -0.18 + k * 0.12, 0.16 - Math.abs(k - 1.5) * 0.03, (k % 2 - 0.5) * 0.1);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.6, 32).rotateX(-Math.PI / 2), glowMat);
  ring.position.y = 0.08;
  root.add(ring);
  return { root, spin };
}

// An arrow lying on the street in front of a rider, pointing at the nearest cap.
const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffd640, transparent: true, opacity: 0.85, depthWrite: false });
function groundArrow() {
  const sh = new THREE.Shape();
  sh.moveTo(0, 1.6);
  sh.lineTo(1.1, 0.2);
  sh.lineTo(0.38, 0.2);
  sh.lineTo(0.38, -1.2);
  sh.lineTo(-0.38, -1.2);
  sh.lineTo(-0.38, 0.2);
  sh.lineTo(-1.1, 0.2);
  sh.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2).rotateY(Math.PI), arrowMat); // tip along +z
  m.renderOrder = 2;
  m.scale.setScalar(1.4);
  return m;
}

// Where to go: a tall column of light, seen from far over the roofs, and a ring on the ground.
function beacon(radius) {
  const group = new THREE.Group();
  const light = new THREE.MeshBasicMaterial({ color: 0xffd640, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  group.add(new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.35, radius * 0.5, 160, 32, 1, true).translate(0, 80, 0), light));
  const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 0.8, radius, 48).rotateX(-Math.PI / 2), glowMat.clone());
  ring.position.y = 0.1;
  group.add(ring);
  return { group, light, ring };
}

// The City Run: thousands of runners in bright shirts, as instanced boxes, one mesh per body part,
// so a stream of them across half the city stays cheap to draw.
const SHIRTS = [0xff7043, 0xfdd835, 0x26c6da, 0xec407a, 0x9ccc65, 0xffffff, 0xe53935, 0x1e88e5, 0xab47bc, 0xffa726];
const SKINS = [0xf1c7a5, 0xe0ac87, 0xc68863, 0x8d5a3b, 0x5c3a24, 0xf6d6bd];
const RUN_SPREAD = 2.6; // how far either side of the middle of the street they run
const RUN_HIT = 1.2; // how close you can come to one
const RUN_SEE = 240; // only the runners this close to a player are drawn and moved
const ZOMBIE_HEALTH = 3; // zombie missions allow three hits; runner missions end on the first collision
const SAFE = 2; // seconds after a hit before the next one counts
const FRIES_EVERY = 10; // seconds before the next julientje (a bakje friet to throw) is ready
const SHOT_EVERY = 0.2; // seconds before the next tequila shot glass can be thrown
const FRIES_EAT = 5; // seconds the students kneel round it, eating
const FRIES_LURE = 14; // how close a student has to be to smell it
function runnerMeshes(n) {
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
  const make = (geo, count, shadow) => {
    const m = new THREE.InstancedMesh(geo, white, count);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false; // the instances are all over the map, not round the mesh's own origin
    m.castShadow = shadow;
    m.count = 0;
    return m;
  };
  return {
    torso: make(new THREE.BoxGeometry(0.42, 0.62, 0.26), n, true),
    head: make(new THREE.SphereGeometry(0.15, 10, 8), n, false),
    legs: make(new THREE.BoxGeometry(0.15, 0.92, 0.17).translate(0, -0.46, 0), n * 2, true), // hung from the hip
    arms: make(new THREE.BoxGeometry(0.11, 0.56, 0.12).translate(0, -0.28, 0), n * 2, false), // from the shoulder
  };
}

// ------------------------------------------------------------------ a quest being played

// ctx: { scene, map, colliders, relief, particles }
export class Quest {
  constructor(def, ctx) {
    this.def = def;
    this.ctx = ctx;
    this.g = getGraph(ctx.map);
    this.group = new THREE.Group();
    ctx.scene.add(this.group);
    this.events = [];
    this.over = false;
    this.clearCache = new Map();
    this.hp = new Map(); // rider → { hp, safe }
    this.fries = []; // julientjes thrown, flying or on the ground: { x, y, z, vx, vy, vz, landed, age, model }
    this.shots = [];
    this.shotsCd = new Map();
    this.friesCd = new Map(); // rider → seconds before the next julientje is ready
    this.rand = seeded(def.id);
    const g = this.g, s = g.nearest(...def.start, true);
    this.startNode = s;
    if (def.kind === 'reach') this.setupReach(s);
    else if (def.kind === 'thief') this.setupThief(s);
    else if (def.kind === 'paint') this.setupPaint(s);
    else if (def.kind === 'bus') this.setupBus(s);
    else if (def.kind === 'deliver') this.setupDeliver(s);
    else if (def.kind === 'rescue') this.setupRescue();
    else this.setupCollect(s);
  }

  // where the players start: { x, z, yaw }
  get spawn() { return this._spawn; }

  // the node `metres` along the way from the start towards node `to`
  along(path, metres) {
    const g = this.g;
    let d = 0;
    for (let k = 1; k < path.length; k++) {
      d += Math.hypot(g.X[path[k]] - g.X[path[k - 1]], g.Z[path[k]] - g.Z[path[k - 1]]);
      if (d >= metres) return path[k];
    }
    return path[path.length - 1];
  }

  facing(from, to) {
    const g = this.g;
    return Math.atan2(g.X[to] - g.X[from], g.Z[to] - g.Z[from]);
  }

  // the paint fight: the paintball gun in hand (main.js shoots, splat.js hits), points for every hit
  setupPaint(s) {
    const g = this.g, n = g.adj?.[s]?.[0];
    this._spawn = { x: g.X[s], z: g.Z[s], yaw: n !== undefined ? this.facing(s, typeof n === 'number' ? n : n[0]) : 0 };
    this.points = 0;
    this.scored = new WeakSet(); // the cars, buses and trams that have already scored: each counts once
  }

  // Paint hit `who` (a person, or a car, bus or tram: `once`), worth `pts`: a 'collect' event with the
  // score, and won at def.count.
  score(r, who, pts, once = false) {
    if (!this.scored || this.over) return;
    if (once) { if (this.scored.has(who)) return; this.scored.add(who); }
    this.points = Math.min(this.def.count, this.points + pts);
    this.events.push({ type: 'collect', r, n: this.points, pts });
    if (this.points >= this.def.count) this.finish('win', r);
  }

  // the bus driver: the city's bus stops by name (`bus`: where the bus stands, `stops`: where to halt,
  // in order). main.js puts the bus there (this.bus, a parked car to borrow) and its driver running off.
  setupBus() {
    const def = this.def, stop = name => STOPS.find(st => st.name === name && st.kind === 'bus');
    const at = stop(def.bus), ux = Math.cos(at.a), uz = Math.sin(at.a);
    // the street is on the left of the way the sign faces (stops.js): the bus there, along the kerb
    this.busSpot = { x: at.x + uz * 2.2, z: at.z - ux * 2.2, yaw: Math.atan2(ux, uz) };
    this._spawn = { x: at.x - ux * 6 - uz * 0.5, z: at.z - uz * 6 + ux * 0.5, yaw: Math.atan2(ux, uz) };
    this.halts = def.stops.map(name => { const st = stop(name); return { x: st.x, z: st.z, name }; });
    this.served = 0;
    this.beacon = beacon(HALT);
    this.group.add(this.beacon.group);
    this.placeHalt();
  }

  // the courier: deliver at each of `drops` ([x, z, name], on the street nearest) in turn; the same
  // stops-in-a-row as the bus, without the bus, and riding through is enough
  setupDeliver(s) {
    const g = this.g, def = this.def;
    this.halts = def.drops.map(([x, z, name]) => { const n = g.nearest(x, z, true); return { x: g.X[n], z: g.Z[n], name }; });
    const first = g.nearest(this.halts[0].x, this.halts[0].z, true), { prev } = dijkstra(g, s), path = [];
    for (let n = first; n >= 0; n = prev[n]) path.unshift(n);
    this._spawn = { x: g.X[s], z: g.Z[s], yaw: this.facing(s, this.along(path, 20)) };
    this.served = 0;
    this.beacon = beacon(def.radius);
    this.group.add(this.beacon.group);
    this.placeHalt();
  }

  // the helicopter rescue: from the pad (`pad`) to each swimmer in trouble in turn (`victims`, [x, z,
  // name]), winching each up, and then on to land at `drop` ([x, z, name]) with all of them. The
  // swimmers and the landing are halts, like the bus's stops.
  setupRescue() {
    const def = this.def, [px, pz] = def.pad, [vx, vz] = def.victims[0], col = this.ctx.colliders;
    this._spawn = { x: px, z: pz, yaw: Math.atan2(vx - px, vz - pz) };
    this.halts = [...def.victims, def.drop].map(([x, z, name]) => ({ x, z, name }));
    this.served = 0;
    this.rescue = {
      carrier: null, carried: 0,
      swimmers: def.victims.map(([x, z]) => {
        const model = swimmer(), water = waterLevel(col, x, z) ?? WATER;
        model.position.set(x, water, z);
        this.group.add(model);
        return { model, water };
      }),
    };
    this.beacon = beacon(def.radius);
    this.group.add(this.beacon.group);
    this.placeHalt();
  }

  // Through the next swimmer's circle, low enough: up they come; with them all aboard, landed on
  // the drop: won.
  updateRescue(dt, t, riders, playing) {
    const res = this.rescue, h = this.halts[this.served];
    res.swimmers.forEach((sw, i) => {
      const m = sw.model;
      if (i < res.carried) {
        // hanging on the rope under the helicopter, each one below the one winched up before
        const r = res.carrier;
        // (set down on the ground beside it, one after the other, when it comes down low)
        const out = 1.6 + Math.max(0, ROPE_HANG + i * 1.9 - r.y - 1.2) * 0.8;
        m.position.set(r.pos.x + Math.cos(r.yaw) * out, Math.max(r.base + 0.2, r.base + r.y + 1.2 - ROPE_HANG - i * 1.9), r.pos.z - Math.sin(r.yaw) * out);
        m.rotation.set(-Math.PI / 2.4, r.yaw + i * 0.8, Math.sin(t * 2 + i) * 0.15);
        m.userData.stroke?.(t * 0.3, 0);
      } else {
        // treading water, waving for help
        m.position.y = sw.water + Math.sin(t * 2.2 + i) * 0.12;
        m.rotation.set(-0.9, t * 0.4 + i, Math.sin(t * 5 + i) * 0.3);
        m.userData.stroke?.(t * 1.6, 6);
      }
    });
    if (!playing || this.over || !h) return;
    for (const r of riders) {
      const d = Math.hypot(r.pos.x - h.x, r.pos.z - h.z);
      if (this.served < res.swimmers.length) {
        if (res.carrier && res.carrier !== r) continue; // the one with the others aboard picks up the rest
        const low = r.base + r.y - res.swimmers[this.served].water < WINCH_LOW, over = d < this.def.radius;
        res.high = over && !low; // over the swimmer but too high up: the HUD says to come down
        if (!over || !low) continue;
        res.carrier = r;
        res.carried++;
        res.high = false;
      } else if (r !== res.carrier || d > this.def.radius || r.y > 0.3) continue;
      this.served++;
      this.events.push({ type: 'collect', r, n: this.served, stop: h.name });
      this.placeHalt();
      if (this.served >= this.halts.length) this.finish('win', r);
      return;
    }
  }

  // How long the winch rope hangs down from rider r's helicopter, in metres (0: wound up).
  rope(r) {
    const res = this.rescue;
    return res?.carrier === r ? ROPE_HANG + (res.carried - 1) * 1.9 : 0;
  }

  // the beacon on the next stop to halt at
  placeHalt() {
    const h = this.halts[this.served];
    if (!h) { this.beacon.group.visible = false; return; }
    this.beacon.group.position.set(h.x, this.ctx.relief?.at(h.x, h.z) ?? 0, h.z);
  }

  // the bus at the next stop, standing still: a 'collect' event (n of all), and won at the last
  updateBus(riders, playing) {
    if (!playing || this.over) return;
    const h = this.halts[this.served], bus = this.def.kind === 'bus', R = bus ? HALT : this.def.radius;
    for (const r of riders) {
      if (!h || Math.hypot(r.pos.x - h.x, r.pos.z - h.z) > R) continue;
      if (bus && (r.car !== this.bus || Math.abs(r.speed) > HALT_SPEED)) continue; // in the bus, standing still
      this.served++;
      this.events.push({ type: 'collect', r, n: this.served, stop: h.name });
      this.placeHalt();
      if (this.served >= this.halts.length) this.finish('win', r);
      return;
    }
  }

  setupReach(s) {
    const g = this.g, def = this.def, goal = g.nearest(...def.goal, true);
    const { prev } = dijkstra(g, s);
    const path = [];
    for (let n = goal; n >= 0; n = prev[n]) path.unshift(n);
    this._spawn = { x: g.X[s], z: g.Z[s], yaw: this.facing(s, this.along(path, 20)) };
    if (def.stand) {
      // standing somewhere off the street, looking at `look` (or down the way to go)
      const [x, z] = def.stand, n = this.along(path, 40), [lx, lz] = def.look ?? [g.X[n], g.Z[n]];
      this._spawn = { x, z, yaw: Math.atan2(lx - x, lz - z) };
    }
    this.goal = { x: g.X[goal], z: g.Z[goal], r: def.radius };
    this.beacon = beacon(def.radius);
    this.beacon.group.position.set(this.goal.x, this.ctx.relief?.at(this.goal.x, this.goal.z) ?? 0, this.goal.z);
    this.group.add(this.beacon.group);
    if (def.boat) this.placeBoat(goal);
    if (def.runners) this.setupRunners(def.runners);
  }

  // The course along the streets through its waypoints, and the runners spread out along all of it.
  setupRunners({ route, per }) {
    const g = this.g, nodes = [];
    for (let k = 1; k < route.length; k++) {
      const a = g.nearest(...route[k - 1], true), b = g.nearest(...route[k], true), { prev } = dijkstra(g, a), leg = [];
      for (let n = b; n >= 0; n = prev[n]) leg.unshift(n);
      nodes.push(...(k > 1 ? leg.slice(1) : leg));
    }
    const X = nodes.map(n => g.X[n]), Z = nodes.map(n => g.Z[n]), cum = [0];
    for (let k = 1; k < nodes.length; k++) cum.push(cum[k - 1] + Math.hypot(X[k] - X[k - 1], Z[k] - Z[k - 1]));
    const total = cum[cum.length - 1], n = Math.round(total * per);
    const list = [];
    for (let i = 0; i < n; i++) {
      const s = this.rand() * total;
      let seg = 1;
      while (cum[seg] < s) seg++;
      list.push({
        s, seg, side: (this.rand() * 2 - 1) * RUN_SPREAD, speed: 3 + this.rand() * 2, phase: this.rand() * 7,
        x: 0, z: 0, y: 0, yaw: 0, shirt: new THREE.Color(SHIRTS[i % SHIRTS.length]), skin: new THREE.Color(SKINS[(i * 7) % SKINS.length]),
      });
    }
    this.run = { X, Z, cum, total, list, parts: runnerMeshes(n) };
    for (const m of Object.values(this.run.parts)) this.group.add(m);
  }

  // The last boat waits in the water by the quay, lying along it.
  placeBoat(n) {
    const g = this.g, col = this.ctx.colliders, x = g.X[n], z = g.Z[n];
    let spot = null;
    for (let rad = 4; rad < 50 && !spot; rad += 2) {
      for (let a = 0; a < 32; a++) {
        const px = x + Math.cos(a / 16 * Math.PI) * rad, pz = z + Math.sin(a / 16 * Math.PI) * rad;
        if (inWater(col, px, pz)) { spot = [px, pz, Math.cos(a / 16 * Math.PI), Math.sin(a / 16 * Math.PI)]; break; }
      }
    }
    if (!spot) return;
    const [nb] = g.adj[n].reduce((b, e) => (e[1] > b[1] ? e : b));
    this.boat = tourBoat();
    this.water = waterLevel(col, spot[0], spot[1]) ?? WATER;
    this.boat.position.set(spot[0] + spot[2] * 3, this.water, spot[1] + spot[3] * 3); // its middle a bit out from the edge
    this.boat.rotation.y = this.facing(n, nb);
    this.group.add(this.boat);
  }

  setupThief(s) {
    const g = this.g, def = this.def;
    // the thief already has a head start: to where the quest says, or down the street
    let a = s, from = -1, d = 0;
    this.thief = { x: g.X[s], z: g.Z[s], dx: 0, dz: 0 };
    if (def.thief) {
      a = g.nearest(...def.thief, true);
      from = dijkstra(g, s).prev[a];
      d = Infinity;
    }
    while (d < 18) {
      const b = this.nextNode(a, from, [{ pos: { x: g.X[s], z: g.Z[s] } }]);
      d += Math.hypot(g.X[b] - g.X[a], g.Z[b] - g.Z[a]);
      from = a;
      a = b;
    }
    const model = createWalker({ name: '', silk: 0x262626, cap: 0x111111, labelLayer: 0 }, 3);
    model.label.visible = false;
    const art = def.loot === 'statue' ? statue() : painting();
    art.position.set(0, def.loot === 'statue' ? 2.3 : 2.75, 0);
    art.rotation.y = Math.PI; // its face to whoever is chasing
    model.root.add(art);
    this.group.add(model.root);
    // at the far end of the last stretch of that head start
    Object.assign(this.thief, { model, a: from, b: a, s: Math.hypot(g.X[a] - g.X[from], g.Z[a] - g.Z[from]) - 0.01, x: g.X[a], z: g.Z[a], y: 0, yaw: this.facing(from, a), speed: 0 });
    this._spawn = { x: g.X[s], z: g.Z[s], yaw: this.facing(s, a) };
    if (def.stand) {
      // standing somewhere off the street, looking at `look` (or after the thief)
      const [x, z] = def.stand, [lx, lz] = def.look ?? [g.X[a], g.Z[a]];
      this._spawn = { x, z, yaw: Math.atan2(lx - x, lz - z) };
    }
  }

  setupCollect(s) {
    const g = this.g, def = this.def, { dist } = dijkstra(g, s);
    const pool = [];
    for (let n = 0; n < g.X.length; n++) if (dist[n] < 700) pool.push(n);
    pool.sort(() => this.rand() - 0.5);
    const far = (list, n, min) => list.every(p => Math.hypot(p.x - g.X[n], p.z - g.Z[n]) >= min);
    const at = n => ({ x: g.X[n], z: g.Z[n] });
    this.caps = [];
    for (const n of pool) {
      if (this.caps.length >= def.count) break;
      if (dist[n] > 90 && dist[n] < 600 && far(this.caps, n, 55)) this.caps.push({ ...at(n), n, got: false });
    }
    // the students: one or two hanging about near each cap, the rest all over
    this.zombies = [];
    const zs = [];
    for (const c of this.caps) {
      const near = pool.filter(n => { const d = Math.hypot(g.X[n] - c.x, g.Z[n] - c.z); return d > 7 && d < 22; });
      for (const n of near.slice(0, 2)) if (far(zs, n, 6)) zs.push(at(n));
    }
    for (const n of pool) {
      if (zs.length >= def.zombies) break;
      if (dist[n] > 35 && far(zs, n, 16)) zs.push(at(n));
    }
    if (def.crowd) zs.push(...this.crowd(def.crowd, s));
    const students = def.zombieDensity ? zs.filter((_, i) => Math.floor((i + 1) * def.zombieDensity) > Math.floor(i * def.zombieDensity)) : zs;
    students.forEach((p, i) => {
      const model = zombieModel(i, def.look);
      this.group.add(model.root);
      this.zombies.push({ ...p, model, yaw: this.rand() * 6, y: 0, state: 'idle', timer: 0, cool: this.rand() * (def.pukeEvery ?? 2), speed: 0, gulp: 0 });
    });
    for (const c of this.caps) {
      c.model = def.item === 'pasticciotto' ? pasticciottoModel() : capModel();
      c.model.root.position.set(c.x, this.ctx.relief?.at(c.x, c.z) ?? 0, c.z);
      this.group.add(c.model.root);
    }
    // facing the nearest cap
    const first = this.caps.reduce((b, c) => (dist[c.n] < dist[b.n] ? c : b), this.caps[0]);
    this._spawn = { x: g.X[s], z: g.Z[s], yaw: first ? Math.atan2(first.x - g.X[s], first.z - g.Z[s]) : 0 };
  }

  // The street itself packed with students, every few metres along it and spread across its width,
  // except for a bit of room round the start so nobody is sick on you before you've set off.
  crowd({ street, every, clear }, s) {
    const map = this.ctx.map, name = map.names.indexOf(street), g = this.g, out = [];
    for (const rd of map.roads) {
      if (rd.n !== name) continue;
      for (let k = 2; k < rd.p.length; k += 2) {
        const ax = rd.p[k - 2], az = rd.p[k - 1], dx = rd.p[k] - ax, dz = rd.p[k + 1] - az, L = Math.hypot(dx, dz);
        for (let d = this.rand() * every; d < L; d += every * (0.7 + this.rand() * 0.6)) {
          const side = (this.rand() - 0.5) * rd.w * 0.8;
          const x = ax + (dx * d) / L - (dz / L) * side, z = az + (dz * d) / L + (dx / L) * side;
          if (Math.hypot(x - g.X[s], z - g.Z[s]) > clear) out.push({ x, z });
        }
      }
    }
    return out;
  }

  // A street piece without a wall across it (some paths run through a building).
  clear(a, b) {
    const k = a < b ? a * 1e6 + b : b * 1e6 + a;
    let ok = this.clearCache.get(k);
    if (ok === undefined) {
      const g = this.g;
      ok = clearLine(this.ctx.colliders, g.X[a], g.Z[a], g.X[b], g.Z[b]) >= 1;
      this.clearCache.set(k, ok);
    }
    return ok;
  }

  // Where the thief runs next from node a: away from whoever is closest, mostly straight on.
  nextNode(a, from, riders) {
    const g = this.g, t = this.thief;
    let near = null, nd = Infinity;
    for (const r of riders) {
      const d = Math.hypot(r.pos.x - g.X[a], r.pos.z - g.Z[a]);
      if (d < nd) { nd = d; near = r; }
    }
    const ax = g.X[a] - near.pos.x, az = g.Z[a] - near.pos.z, al = Math.hypot(ax, az) || 1;
    let best = -1, bs = -Infinity;
    for (const [v, L] of g.adj[a]) {
      if (v === from || !this.clear(a, v)) continue;
      const dx = (g.X[v] - g.X[a]) / (L || 1), dz = (g.Z[v] - g.Z[a]) / (L || 1);
      const score = (dx * ax + dz * az) / al + 0.7 * (dx * t.dx + dz * t.dz) + this.rand() * 0.6;
      if (score > bs) { bs = score; best = v; }
    }
    if (best < 0) best = from >= 0 ? from : g.adj[a][0][0]; // a dead end: back the way it came
    t.dx = (g.X[best] - g.X[a]) / (Math.hypot(g.X[best] - g.X[a], g.Z[best] - g.Z[a]) || 1);
    t.dz = (g.Z[best] - g.Z[a]) / (Math.hypot(g.X[best] - g.X[a], g.Z[best] - g.Z[a]) || 1);
    return best;
  }

  // riders: the players; each needs pos, base and y. Fills this.events.
  update(dt, t, riders, playing) {
    if (this.beacon) {
      this.beacon.light.opacity = 0.16 + Math.sin(t * 3) * 0.06;
      this.beacon.ring.rotation.y = t * 0.5;
    }
    if (this.boat) {
      this.boat.position.y = this.water + Math.sin(t * 1.3) * 0.05;
      if (this.over) this.boat.position.addScaledVector(new THREE.Vector3(Math.sin(this.boat.rotation.y), 0, Math.cos(this.boat.rotation.y)), dt * 2.2); // off it goes
    }
    for (const h of this.hp.values()) h.safe = Math.max(0, h.safe - dt);
    if (this.thief) this.runThief(dt, t, riders, playing);
    if (this.fries.length || this.friesCd.size) this.updateFries(dt);
    if (this.shots.length || this.shotsCd.size) this.updateTequila(dt);
    if (this.caps) this.updateCollect(dt, t, riders, playing);
    if (this.run) this.updateRunners(dt, riders, playing);
    if (this.rescue) this.updateRescue(dt, t, riders, playing);
    else if (this.halts) this.updateBus(riders, playing);
    if (!playing || this.over) return;
    if (this.goal) {
      for (const r of riders) {
        if (Math.hypot(r.pos.x - this.goal.x, r.pos.z - this.goal.z) < this.goal.r) return this.finish('win', r);
      }
    }
  }

  // A player's health, in quests where something can hurt you (the students, the runners): { hp, of,
  // safe }, safe the seconds still to go before another hit counts. Null in the other quests.
  health(r) {
    if (!this.zombies?.length && !this.run) return null;
    const lives = this.zombies?.length ? ZOMBIE_HEALTH : 1;
    if (!this.hp.has(r)) this.hp.set(r, { hp: lives, safe: 0 });
    return { ...this.hp.get(r), of: lives };
  }

  // Hit by `why` ('puke', 'run'): one line of health off, and out of it at none. False while still
  // safe from the last hit.
  hurt(r, why) {
    this.health(r);
    const h = this.hp.get(r);
    if (h.safe > 0 || this.over) return false;
    h.hp--;
    h.safe = SAFE;
    this.events.push({ type: 'hurt', r, why, hp: h.hp });
    if (h.hp <= 0) this.finish('lose', r, why);
    return true;
  }

  // Seconds before a player's next julientje is ready (0: ready), or null in quests without them.
  friesIn(r) { return this.def.fries ? this.friesCd.get(r) ?? 0 : null; }

  // Throw a julientje ahead, from rider r (pos, base, y, yaw, speed). False when not ready.
  throwFries(r) {
    if (!this.def.fries || this.over || this.friesIn(r) > 0) return false;
    this.friesCd.set(r, FRIES_EVERY);
    const fx = Math.sin(r.yaw), fz = Math.cos(r.yaw), v = 9 + Math.max(0, r.speed ?? 0) * 0.6;
    const model = friesModel();
    this.group.add(model);
    this.fries.push({ x: r.pos.x + fx * 0.8, y: r.base + r.y + 1.4, z: r.pos.z + fz * 0.8, vx: fx * v, vy: 4.5, vz: fz * v, landed: false, age: 0, model });
    return true;
  }

  // The julientjes: through the air, and on the ground until eaten up (or left a while).
  updateFries(dt) {
    for (const [r, s] of this.friesCd) this.friesCd.set(r, Math.max(0, s - dt));
    const relief = this.ctx.relief, col = this.ctx.colliders;
    for (const f of [...this.fries]) {
      f.age += dt;
      if (!f.landed) {
        const nx = f.x + f.vx * dt, nz = f.z + f.vz * dt;
        // against a wall: it drops down there
        if (clearLine(col, f.x, f.z, nx, nz) < 1) { f.vx = 0; f.vz = 0; } else { f.x = nx; f.z = nz; }
        f.vy -= 14 * dt;
        f.y += f.vy * dt;
        f.model.rotation.y += dt * 9;
        const ground = relief?.at(f.x, f.z) ?? 0;
        if (f.y <= ground) {
          f.y = ground;
          f.landed = true;
          f.age = 0;
          f.model.rotation.y = 0;
          // the students round about smell it and go for it
          for (const z of this.zombies) {
            if (['puke', 'snack', 'eat', 'drink', 'splat', 'sleep'].includes(z.state)) continue;
            if (Math.hypot(z.x - f.x, z.z - f.z) < FRIES_LURE) { z.state = 'snack'; z.fries = f; z.timer = 6; }
          }
          this.events.push({ type: 'fries', x: f.x, z: f.z });
        }
      }
      f.model.position.set(f.x, f.y, f.z);
      // gone when nobody is (still) after it any more
      if (f.landed && f.age > 1 && !this.zombies.some(z => z.fries === f)) {
        this.group.remove(f.model);
        this.fries.splice(this.fries.indexOf(f), 1);
      }
    }
  }

  tequilaIn(r) { return this.def.tequila ? this.shotsCd.get(r) ?? 0 : null; }

  // paint: the paintball gun instead of a shot glass (faster and flatter, and it knocks them over)
  throwTequila(r, paint = false) {
    if (!this.def.tequila || this.over || this.tequilaIn(r) > 0) return false;
    this.shotsCd.set(r, SHOT_EVERY);
    const fx = Math.sin(r.yaw), fz = Math.cos(r.yaw), model = paint ? paintModel() : tequilaModel(), v = paint ? 30 : 18;
    this.group.add(model);
    const shot = { x: r.pos.x + fx * 0.8, y: r.base + r.y + 1.5, z: r.pos.z + fz * 0.8, vx: fx * v, vz: fz * v, vy: paint ? 0.5 : 2, age: 0, model, paint };
    model.position.set(shot.x, shot.y, shot.z);
    this.shots.push(shot);
    return true;
  }

  updateTequila(dt) {
    for (const [r, s] of this.shotsCd) this.shotsCd.set(r, Math.max(0, s - dt));
    for (const shot of [...this.shots]) {
      const nx = shot.x + shot.vx * dt, nz = shot.z + shot.vz * dt;
      shot.vy -= 5 * dt;
      const ny = shot.y + shot.vy * dt;
      let hit = null, best = Infinity;
      const blocked = clearLine(this.ctx.colliders, shot.x, shot.z, nx, nz) < 1;
      if (!blocked && !this.over) for (const z of this.zombies) {
        if (z.state === 'drink' || z.state === 'splat' || z.state === 'sleep') continue;
        // Swept collision catches students even if the glass crosses them in one frame.
        const dx = nx - shot.x, dz = nz - shot.z;
        const u = Math.max(0, Math.min(1, ((z.x - shot.x) * dx + (z.z - shot.z) * dz) / (dx * dx + dz * dz || 1)));
        const y = shot.y + (ny - shot.y) * u;
        if (u < best && Math.hypot(z.x - shot.x - dx * u, z.z - shot.z - dz * u) < 0.65 && y > z.y + 0.3 && y < z.y + 2.3) { hit = z; best = u; }
      }
      shot.age += dt;
      if (hit && shot.paint) {
        // splats open on them, a moment's staggering, and down they go
        hit.state = 'splat'; hit.timer = 0.6; hit.speed = 0; hit.fries = null;
        hit.model.splat?.();
        this.ctx.particles.burst(hit.x, hit.y + 1.5, hit.z, 10, { color: PAINT_BLUES, speed: 5, up: 3, gravity: 9, life: 0.8, size: 0.18, drag: 1.5 });
        this.events.push({ type: 'tequila', x: hit.x, z: hit.z, paint: true });
      } else if (hit) {
        hit.state = 'drink'; hit.timer = 1.2; hit.speed = 0; hit.fries = null;
        this.events.push({ type: 'tequila', x: hit.x, z: hit.z });
      }
      if (hit || blocked || ny <= (this.ctx.relief?.at(nx, nz) ?? 0) || shot.age > 3) {
        this.group.remove(shot.model);
        if (!shot.paint) shot.model.traverse(o => o.geometry?.dispose());
        this.shots.splice(this.shots.indexOf(shot), 1);
      } else {
        Object.assign(shot, { x: nx, y: ny, z: nz });
        shot.model.position.set(nx, ny, nz);
      }
    }
  }

  finish(result, r, why = '') {
    if (this.over) return;
    this.over = true;
    this.events.push({ type: result, r, why });
  }

  runThief(dt, t, riders, playing) {
    const g = this.g, th = this.thief, relief = this.ctx.relief;
    const nd = Math.min(...riders.map(r => Math.hypot(r.pos.x - th.x, r.pos.z - th.z)));
    // close behind: a sprint; left far behind: a breather, to taunt you; and every so often a burst
    // nearly as fast as you, for a few seconds, so catching up takes more than just riding at them
    if (playing && !this.over && (th.burst = (th.burst ?? 4) - dt) < -2.5) th.burst = 5 + this.rand() * 6;
    const want = !playing ? 0 : this.over ? 0 : th.burst < 0 ? 27 : nd < 22 ? 22 : nd > 80 ? 11 : 17;
    th.speed += (want - th.speed) * Math.min(1, dt * 3);
    // after a while (the quest's zigzag, in seconds) the thief tires and weaves from side to side across
    // the street: the weaving costs him ground, so riding straight at him catches him up
    if (playing && !this.over) th.age = (th.age ?? 0) + dt;
    const zig = this.def.zigzag != null ? ZIG_AMP * Math.min(1, Math.max(0, ((th.age ?? 0) - this.def.zigzag) / 4)) : 0;
    th.zig = (th.zig ?? 0) + dt * ZIG_W * (zig > 0 ? 1 : 0);
    const side = th.speed > 0.5 ? (zig * ZIG_W * Math.cos(th.zig)) / th.speed : 0; // the share of his speed that goes sideways
    th.s += th.speed * dt * Math.sqrt(Math.max(0.3, 1 - side * side));
    let L = Math.hypot(g.X[th.b] - g.X[th.a], g.Z[th.b] - g.Z[th.a]);
    while (th.s >= L) {
      th.s -= L;
      const next = this.nextNode(th.b, th.a, riders);
      th.a = th.b;
      th.b = next;
      L = Math.hypot(g.X[th.b] - g.X[th.a], g.Z[th.b] - g.Z[th.a]) || 0.01;
    }
    const f = th.s / L, cx = g.X[th.a] + (g.X[th.b] - g.X[th.a]) * f, cz = g.Z[th.a] + (g.Z[th.b] - g.Z[th.a]) * f;
    // the sideways step, kept short of the walls on either side
    const ux = (g.X[th.b] - g.X[th.a]) / L, uz = (g.Z[th.b] - g.Z[th.a]) / L;
    let lat = zig * Math.sin(th.zig);
    if (lat) lat *= Math.max(0, clearLine(this.ctx.colliders, cx, cz, cx + uz * lat * 1.4, cz - ux * lat * 1.4) - 0.3) / 0.7;
    th.lat = (th.lat ?? 0) + (lat - (th.lat ?? 0)) * Math.min(1, dt * 8);
    const px = th.x, pz = th.z;
    th.x = cx + uz * th.lat;
    th.z = cz - ux * th.lat;
    th.y = relief?.at(th.x, th.z, th.y) ?? 0;
    const yaw = zig > 0 && Math.hypot(th.x - px, th.z - pz) > 1e-3 ? Math.atan2(th.x - px, th.z - pz) : this.facing(th.a, th.b);
    th.yaw += Math.atan2(Math.sin(yaw - th.yaw), Math.cos(yaw - th.yaw)) * Math.min(1, dt * 10);
    th.model.root.position.set(th.x, th.y, th.z);
    th.model.root.rotation.y = th.yaw;
    th.model.animate(dt, th.speed, 0, t);
    if (playing && !this.over) {
      for (const r of riders) {
        if (Math.hypot(r.pos.x - th.x, r.pos.z - th.z) < CATCH && Math.abs(r.base + r.y - th.y) < 2.5) {
          this.ctx.particles.burst(th.x, th.y + 2.5, th.z, 30, { color: [0xffd640, 0xffffff, 0xc8a03a], speed: 6, up: 5, gravity: 10, life: 1.2, size: 0.18, drag: 1 });
          return this.finish('win', r);
        }
      }
    }
  }

  updateCollect(dt, t, riders, playing) {
    const relief = this.ctx.relief, col = this.ctx.colliders, P = this.ctx.particles;
    this.arrows ??= [];
    riders.forEach((r, i) => {
      const a = (this.arrows[i] ??= this.group.add(groundArrow()).children.at(-1)), to = this.target(r);
      a.visible = playing && !this.over && !!to;
      if (!a.visible) return;
      const yaw = Math.atan2(to.x - r.pos.x, to.z - r.pos.z), ahead = 9 + Math.sin(t * 5) * 0.5;
      const x = r.pos.x + Math.sin(yaw) * ahead, z = r.pos.z + Math.cos(yaw) * ahead;
      a.position.set(x, (relief?.at(x, z) ?? r.base) + 0.15, z);
      a.rotation.y = yaw;
    });
    for (const c of this.caps) {
      if (c.got) continue;
      c.model.spin.rotation.y = t * 2 + c.x;
      c.model.spin.position.y = 1.4 + Math.sin(t * 2.5 + c.z) * 0.2;
      if (!playing || this.over) continue;
      for (const r of riders) {
        if (Math.hypot(r.pos.x - c.x, r.pos.z - c.z) < PICK) {
          c.got = true;
          this.group.remove(c.model.root);
          P.burst(c.x, 1.6, c.z, 18, { color: [0xffd640, 0x8e1b1b, 0xffffff], speed: 5, up: 4, gravity: 8, life: 0.8, size: 0.16, drag: 2 });
          const n = this.caps.filter(q => q.got).length;
          this.events.push({ type: 'collect', r, n });
          if (n === this.caps.length) return this.finish('win', r);
          break;
        }
      }
    }
    for (const z of this.zombies) {
      z.cool = Math.max(0, z.cool - dt);
      let near = null, nd = Infinity;
      for (const r of riders) {
        const d = Math.hypot(r.pos.x - z.x, r.pos.z - z.z);
        if (d < nd) { nd = d; near = r; }
      }
      const sees = playing && !this.over && nd < 30 && clearLine(col, z.x, z.z, near.pos.x, near.pos.z) >= 1;
      const toward = near ? Math.atan2(near.pos.x - z.x, near.pos.z - z.z) : z.yaw;
      const turn = (target, rate) => { z.yaw += Math.atan2(Math.sin(target - z.yaw), Math.cos(target - z.yaw)) * Math.min(1, dt * rate); };
      let retch = 0;
      // students are sick in green, dancers throw red and white scarves and petals
      const puke = this.def.look === 'pizzica' ? [0xc62828, 0xfaf6ee, 0xe57373] : [0xa4c639, 0xd4d36a, 0x7f9a2c];
      if (z.state === 'drink') {
        z.speed = 0;
        if ((z.timer -= dt) <= 0) z.state = 'sleep';
      } else if (z.state === 'splat') {
        z.speed = 0;
        if ((z.timer -= dt) <= 0) z.state = 'sleep';
      } else if (z.state === 'sleep') {
        z.speed = 0;
      } else if (z.state === 'snack') {
        // off to the julientje, as fast as their legs will go
        const d = Math.hypot(z.fries.x - z.x, z.fries.z - z.z);
        turn(Math.atan2(z.fries.x - z.x, z.fries.z - z.z), 5);
        z.speed += (3.6 - z.speed) * Math.min(1, dt * 3);
        const step = Math.min(z.speed * dt, Math.max(0, d - 0.9));
        if (clearLine(col, z.x, z.z, z.x + Math.sin(z.yaw) * 1.2, z.z + Math.cos(z.yaw) * 1.2) >= 1) {
          z.x += Math.sin(z.yaw) * step;
          z.z += Math.cos(z.yaw) * step;
        }
        if (d < 1.3) { z.state = 'eat'; z.timer = FRIES_EAT; }
        else if ((z.timer -= dt) <= 0) { z.state = 'idle'; z.fries = null; } // can't get to it
      } else if (z.state === 'eat') {
        // on their knees round it, eating: no eye for anyone
        z.speed = 0;
        turn(Math.atan2(z.fries.x - z.x, z.fries.z - z.z), 4);
        if ((z.timer -= dt) <= 0) { z.state = 'idle'; z.fries = null; z.cool = 1; }
      } else if (z.state === 'wind') {
        // the cheeks puff up...
        turn(toward, 4);
        retch = 1 - z.timer / 0.4;
        if ((z.timer -= dt) <= 0) { z.state = 'puke'; z.timer = 0.9; }
      } else if (z.state === 'puke') {
        // ...and out it comes, in a stream in front of them
        retch = 1;
        const fx = Math.sin(z.yaw), fz = Math.cos(z.yaw), hy = z.y + 1.8;
        for (let k = 0; k < 2; k++) {
          P.spawn(z.x + fx * 0.4, hy, z.z + fz * 0.4, {
            color: k ? puke[0] : puke[1], vx: fx * 7 + (Math.random() - 0.5) * 1.5, vy: 1.5 + Math.random(), vz: fz * 7 + (Math.random() - 0.5) * 1.5,
            gravity: 9, life: 0.7, size: 0.16, grow: 0.15, drag: 0.5,
          });
        }
        if (!this.over && playing) {
          for (const r of riders) {
            const dx = r.pos.x - z.x, dz = r.pos.z - z.z, d = Math.hypot(dx, dz);
            if (d < 5.5 && d > 0.01 && (dx * fx + dz * fz) / d > 0.82 && Math.abs(r.base + r.y - z.y) < 2 && this.hurt(r, 'puke')) {
              P.burst(r.pos.x, r.base + r.y + 2, r.pos.z, 30, { color: [puke[0], puke[1], puke[2]], speed: 4, up: 3, gravity: 9, life: 1, size: 0.2, drag: 1 });
            }
          }
        }
        if ((z.timer -= dt) <= 0) { z.state = 'idle'; z.cool = (this.def.pukeEvery ?? 3.7) - 1.3; }
      } else if (sees && nd < 8 && z.cool <= 0) {
        z.state = 'wind';
        z.timer = 0.4;
        this.events.push({ type: 'retch', x: z.x, z: z.z });
      } else if (sees) {
        // stagger towards you
        turn(toward, 2.5);
        z.speed += (3.2 - z.speed) * Math.min(1, dt * 2);
        z.x += Math.sin(z.yaw) * z.speed * dt;
        z.z += Math.cos(z.yaw) * z.speed * dt;
      } else {
        // shuffle about, slowly, turning round at a wall
        z.speed += (0.7 - z.speed) * Math.min(1, dt * 2);
        turn(z.yaw + Math.sin(t * 0.4 + z.x * 3) * 0.8, 0.6);
        const fx = Math.sin(z.yaw), fz = Math.cos(z.yaw);
        if (clearLine(col, z.x, z.z, z.x + fx * 1.5, z.z + fz * 1.5) < 1) z.yaw += Math.PI;
        else {
          z.x += fx * z.speed * dt;
          z.z += fz * z.speed * dt;
        }
      }
      z.y = relief?.at(z.x, z.z, z.y) ?? 0;
      z.model.root.position.set(z.x, z.y, z.z);
      z.model.root.rotation.y = z.yaw;
      z.kneel = (z.kneel ?? 0) + ((z.state === 'eat' ? 1 : 0) - (z.kneel ?? 0)) * Math.min(1, dt * 5);
      z.fallen = Math.min(1, (z.fallen ?? 0) + (z.state === 'sleep' ? dt * 2 : 0));
      z.model.animate(dt, z.speed, retch, z.kneel, z.state === 'drink' ? Math.min(1, (1.2 - z.timer) * 4) : 0, z.fallen);
    }
  }

  updateRunners(dt, riders, playing) {
    const { X, Z, cum, total, list, parts } = this.run, relief = this.ctx.relief;
    const base = this._m ??= new THREE.Matrix4(), part = this._p ??= new THREE.Matrix4(), out = this._o ??= new THREE.Matrix4();
    const pos = this._v ??= new THREE.Vector3(), rot = this._q ??= new THREE.Quaternion(), up = this._u ??= new THREE.Vector3(0, 1, 0), one = this._1 ??= new THREE.Vector3(1, 1, 1);
    let shown = 0;
    for (const r of list) {
      // on along the course, back to its start at the end: a stream that never stops
      r.s += r.speed * dt;
      if (r.s >= total) { r.s -= total; r.seg = 1; }
      while (cum[r.seg] < r.s) r.seg++;
      const k = r.seg, L = cum[k] - cum[k - 1] || 1, f = (r.s - cum[k - 1]) / L;
      const dx = (X[k] - X[k - 1]) / L, dz = (Z[k] - Z[k - 1]) / L;
      r.x = X[k - 1] + (X[k] - X[k - 1]) * f - dz * r.side;
      r.z = Z[k - 1] + (Z[k] - Z[k - 1]) * f + dx * r.side;
      let near = Infinity;
      for (const p of riders) near = Math.min(near, Math.abs(p.pos.x - r.x) + Math.abs(p.pos.z - r.z));
      if (near > RUN_SEE) continue;
      r.y = relief?.at(r.x, r.z, r.y) ?? 0;
      const yaw = Math.atan2(dx, dz);
      r.yaw += Math.atan2(Math.sin(yaw - r.yaw), Math.cos(yaw - r.yaw)) * Math.min(1, dt * 6);
      r.phase += dt * r.speed * 2.2;
      const swing = Math.sin(r.phase) * 0.8;
      base.compose(pos.set(r.x, r.y + Math.abs(Math.cos(r.phase)) * 0.08, r.z), rot.setFromAxisAngle(up, r.yaw), one);
      const put = (mesh, i, lx, ly, a) => mesh.setMatrixAt(i, out.multiplyMatrices(base, part.makeRotationX(a).setPosition(lx, ly, 0)));
      put(parts.torso, shown, 0, 1.24, 0.12);
      put(parts.head, shown, 0, 1.74, 0);
      put(parts.legs, shown * 2, -0.1, 0.94, swing);
      put(parts.legs, shown * 2 + 1, 0.1, 0.94, -swing);
      put(parts.arms, shown * 2, -0.28, 1.5, -swing);
      put(parts.arms, shown * 2 + 1, 0.28, 1.5, swing);
      parts.torso.setColorAt(shown, r.shirt);
      parts.head.setColorAt(shown, r.skin);
      parts.legs.setColorAt(shown * 2, r.skin);
      parts.legs.setColorAt(shown * 2 + 1, r.skin);
      parts.arms.setColorAt(shown * 2, r.skin);
      parts.arms.setColorAt(shown * 2 + 1, r.skin);
      shown++;
      if (!playing || this.over) continue;
      for (const p of riders) {
        if (Math.hypot(p.pos.x - r.x, p.pos.z - r.z) < RUN_HIT && Math.abs(p.base + p.y - r.y) < 2 && this.hurt(p, 'run')) {
          this.ctx.particles.burst(r.x, r.y + 1.5, r.z, 24, { color: [0xffffff, r.shirt.getHex()], speed: 5, up: 4, gravity: 10, life: 0.8, size: 0.16, drag: 1.5 });
          break;
        }
      }
    }
    for (const m of Object.values(parts)) {
      m.count = m === parts.torso || m === parts.head ? shown : shown * 2;
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }

  // What the arrow on screen points at, for a rider: the thief, the goal or the nearest cap (none in the paint fight).
  target(r) {
    if (this.scored) return null;
    if (this.halts) { // first to the bus, then to the next stop
      if (this.bus && r.car !== this.bus) return { x: this.bus.x, z: this.bus.z };
      return this.halts[this.served] ?? null;
    }
    if (this.thief) return { x: this.thief.x, z: this.thief.z };
    if (this.goal) return { x: this.goal.x, z: this.goal.z };
    let best = null, bd = Infinity;
    for (const c of this.caps) {
      if (c.got) continue;
      const d = Math.hypot(c.x - r.pos.x, c.z - r.pos.z);
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  }

  // How far along: { got, of } for collecting, null otherwise.
  get tally() {
    if (this.scored) return { got: this.points, of: this.def.count };
    if (this.halts) return { got: this.served, of: this.halts.length };
    return this.caps ? { got: this.caps.filter(c => c.got).length, of: this.caps.length } : null;
  }

  // Dots for the maps: { x, z, r, fill }.
  marks() {
    const out = [];
    if (this.goal) out.push({ x: this.goal.x, z: this.goal.z, r: 6, fill: '#ffd640' });
    for (const h of (this.halts ?? []).slice(this.served)) out.push({ x: h.x, z: h.z, r: 5, fill: '#ffd640' });
    if (this.thief) out.push({ x: this.thief.x, z: this.thief.z, r: 5.5, fill: '#e53935' });
    for (const c of this.caps ?? []) if (!c.got) out.push({ x: c.x, z: c.z, r: 4, fill: '#ffd640' });
    for (const z of this.zombies ?? []) out.push({ x: z.x, z: z.z, r: 2.6, fill: '#a4c639' });
    // the course, as a dotted line where the runners are
    if (this.run) for (let k = 0; k < this.run.list.length; k += 24) out.push({ x: this.run.list[k].x, z: this.run.list[k].z, r: 2.4, fill: '#ff7043' });
    return out;
  }

  take() {
    const e = this.events;
    this.events = [];
    return e;
  }

  dispose() {
    this.ctx.scene.remove(this.group);
    for (const shot of this.shots) shot.model.traverse(o => o.geometry?.dispose());
    for (const z of this.zombies ?? []) z.model.root.traverse(o => { if (o.material === shotGlass || o.material === tequila) o.geometry?.dispose(); });
    for (const m of Object.values(this.run?.parts ?? {})) { m.geometry.dispose(); m.dispose(); }
  }
}
