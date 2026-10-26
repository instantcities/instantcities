// The perron (bordes) in front of the Stadhuis's Renaissance front on the Botermarkt (hand-written,
// from a photo): a stone landing standing out of the middle of the long ground floor, about 2.7 m
// up, a balustrade along its front, and from it two flights of steps down to either side, along the
// front, each with its balustrade and a square pier at its foot. Under the landing a rusticated
// wall with a small arched green door; at its top the great round-arched doorway, the city's arms
// above it. OpenStreetMap only has the footways over it, which lay flat on the ground and flickered
// there; they give way to it (`paths`, see js/landmarks.js openUp). Game metres, 1.25 to a real one.
import * as THREE from 'three';
import { elevation, ashlar, roundArch, shade } from '../core/js/facades.js';
import { Kit, kitMat } from '../core/js/kit.js';

const STONE = '#d3cab6', STEP = 0xc6bda9, COPING = 0xd8d0bd, DARK = 0x2a2420, DOOR_WOOD = 0x3d2a1b;

// the Botermarkt front of the Stadhuis's model (ghent/landmarks.js), north end first, and how far
// along it the middle of the landing lies (where OpenStreetMap has the way in)
const WALL = [[145.2, -156.7], [120.1, -111.2]], ALONG = 29.65;

// how it is laid out, from the wall out (o, game metres) and along it (a, from the middle)
const H = 3.4; // the landing's top
const N = 17, RISE = H / N, TREAD = 0.27; // risers up to it, each flight's treads
const RUN = (N - 1) * TREAD; // how far a flight runs along the wall
const LAND = 3.1; // half the landing's width
const DEEP = 3.9; // how far the landing stands out
const WIDE = 2.55; // how far the flights stand out, to the outside of their stringer
const PIER = 0.6; // a pier's side
const MID = 1.9; // the model's middle, out from the wall
const END = LAND + RUN + PIER; // how far from the middle its ends lie

const [[ax, az], [bx, bz]] = WALL, len = Math.hypot(bx - ax, bz - az);
const ux = (bx - ax) / len, uz = (bz - az) / len, nx = uz, nz = -ux; // along the wall, and out of it
const TURN = Math.atan2(nx, nz); // its +z out of the wall, its +x back along it
const X = ax + ux * ALONG + nx * MID, Z = az + uz * ALONG + nz * MID;

// a ring in its own metres ([a, o] pairs, o out from the wall) as flat world [x, z, ...]
const c = Math.cos(TURN), s = Math.sin(TURN);
const world = pts => pts.flatMap(([a, o]) => [X + a * c + (o - MID) * s, Z - a * s + (o - MID) * c]);

// what riders bump into: the flights, the landing standing out between them, the piers
const FOOT = world([[-END, -0.3], [END, -0.3], [END, WIDE], [LAND, WIDE], [LAND, DEEP], [-LAND, DEEP], [-LAND, WIDE], [-END, WIDE]]);
// the footways OpenStreetMap draws up it and onto the landing
const PATHS = world([[-END - 1, -1], [END + 1, -1], [END + 1, 5.4], [-END - 1, 5.4]]);

// the nosings' line up a flight: how high it is d metres from the landing's side
const nose = d => H - (d * RISE) / TREAD;

function perron() {
  const k = new Kit(), g = new THREE.Group();
  const o = z => z - MID; // from the wall to the model's own z
  // the landing: a solid block from under the ground, its front a rusticated wall drawn with the
  // little door; a cornice round its top
  const plain = new THREE.MeshStandardMaterial({ color: shade(STONE, -0.04), roughness: 0.9, flatShading: true });
  const front = new THREE.MeshStandardMaterial({ map: elevation(2 * LAND, H + 0.1, 40, rusticated), roughness: 0.9, flatShading: true });
  const block = new THREE.Mesh(new THREE.BoxGeometry(2 * LAND, H + 0.1, DEEP + 0.3), [plain, plain, plain, plain, front, plain]);
  block.position.set(0, (H - 0.1) / 2, o((DEEP - 0.3) / 2));
  block.castShadow = block.receiveShadow = true;
  g.add(block);
  k.box(2 * LAND + 0.24, 0.16, 0.2, COPING, 0, H - 0.25, o(DEEP + 0.04)); // the cornice under its edge
  k.box(0.2, 0.16, DEEP - WIDE + 0.1, COPING, LAND + 0.04, H - 0.25, o((DEEP + WIDE) / 2));
  k.box(0.2, 0.16, DEEP - WIDE + 0.1, COPING, -LAND - 0.04, H - 0.25, o((DEEP + WIDE) / 2));

  // its balustrade: a plinth, short round balusters, a rail; along the front and back to the flights
  const rail = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2;
    k.box(L + 0.3, 0.2, 0.3, COPING, (x0 + x1) / 2, H + 0.08, (z0 + z1) / 2, 0, ry, 0); // sunk a little into the landing
    k.box(L + 0.3, 0.15, 0.32, COPING, (x0 + x1) / 2, H + 0.95, (z0 + z1) / 2, 0, ry, 0);
    const n = Math.max(1, Math.round(L / 0.3));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      baluster(k, x0 + (x1 - x0) * t, H + 0.17, z0 + (z1 - z0) * t, 0.72);
    }
  };
  const e = DEEP - 0.15; // the balustrade's line, just in from the landing's edge
  rail(-LAND + 0.15, o(e), LAND - 0.15, o(e));
  for (const side of [-1, 1]) rail(side * (LAND - 0.15), o(WIDE - 0.15), side * (LAND - 0.15), o(e));

  // the flights, one each side, down along the wall
  for (const side of [-1, 1]) {
    // the steps: each a block from under the ground up to its tread, all of them reaching in under
    // the landing, so no two faces lie in one plane where they show
    for (let i = 1; i < N; i++) {
      const d1 = (N - i) * TREAD, d0 = -0.05, top = i * RISE;
      k.box(d1 - d0, top + 0.1, WIDE - 0.25 + 0.3, STEP, side * (LAND + (d0 + d1) / 2), (top - 0.1) / 2, o((WIDE - 0.25 - 0.3) / 2));
    }
    // the stringer on the outside: a solid wall from the ground up to the nosings' line, and a
    // coping on it
    const wall = new THREE.Shape([[-0.05, -0.1], [RUN + TREAD, -0.1], [RUN + TREAD, nose(RUN + TREAD) + 0.05], [-0.05, nose(-0.05) + 0.05]].map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(wall, { depth: 0.36, bevelEnabled: false }).translate(0, 0, -0.18);
    k.add(geo, STEP, side * LAND, 0, o(WIDE - 0.2), 0, side < 0 ? Math.PI : 0); // turned round for the left one
    const slope = Math.atan(RISE / TREAD), cl = RUN / Math.cos(slope), mid = RUN / 2;
    k.box(cl, 0.3, 0.42, COPING, side * (LAND + mid), nose(mid) + 0.2, o(WIDE - 0.2), 0, 0, -side * slope);
    // balusters on the coping, a rail above them parallel to it
    for (let d = 0.3; d < RUN - 0.1; d += 0.32) baluster(k, side * (LAND + d), nose(d) + 0.33, o(WIDE - 0.2), 0.58);
    k.box(cl, 0.15, 0.32, COPING, side * (LAND + mid), nose(mid) + 0.95, o(WIDE - 0.2), 0, 0, -side * slope);
    // the pier at its foot: a square post on a base, a cap and a ball
    const px = side * (LAND + RUN + PIER / 2);
    k.box(PIER + 0.12, 0.3, PIER + 0.12, COPING, px, 0.05, o(WIDE - PIER / 2));
    k.box(PIER, 1.3, PIER, STEP, px, 0.75, o(WIDE - PIER / 2));
    k.box(PIER + 0.16, 0.14, PIER + 0.16, COPING, px, 1.47, o(WIDE - PIER / 2));
    k.add(new THREE.SphereGeometry(0.2, 8, 6), COPING, px, 1.72, o(WIDE - PIER / 2));
  }

  // the great doorway at the top: two leaves under a round arch, in a stone surround standing out
  // of the wall, columns either side and a cornice over it, the city's arms above
  const dw = 2.1, dh = 3.2, y = H - 0.05; // sunk a little into the landing
  k.box(dw, dh, 0.16, DOOR_WOOD, 0, y + dh / 2, o(0.04));
  k.add(new THREE.CylinderGeometry(dw / 2, dw / 2, 0.16, 12, 1, false, -Math.PI / 2, Math.PI), DARK, 0, y + dh, o(0.04), -Math.PI / 2);
  k.box(0.04, dh - 0.2, 0.2, DARK, 0, y + dh / 2, o(0.05)); // between the leaves
  for (const side of [-1, 1]) {
    k.box(0.35, dh, 0.3, COPING, side * (dw / 2 + 0.17), y + dh / 2, o(0.1)); // the jambs
    k.add(new THREE.CylinderGeometry(0.2, 0.22, dh + 0.5, 8), COPING, side * (dw / 2 + 0.65), y + (dh + 0.5) / 2, o(0.2)); // a column
  }
  k.add(new THREE.TorusGeometry(dw / 2 + 0.17, 0.18, 4, 12, Math.PI), COPING, 0, y + dh, o(0.1));
  k.box(dw + 1.9, 0.3, 0.5, COPING, 0, y + dh + 1.45, o(0.2)); // the cornice
  // the arms: a stone cartouche, Ghent's shield on it (a white lion on black), a crown on top
  const ay = y + dh + 2.6;
  k.box(1.5, 1.7, 0.2, COPING, 0, ay, o(0.1));
  k.box(0.95, 0.75, 0.12, 0x1c1c1c, 0, ay + 0.15, o(0.26));
  k.add(new THREE.ConeGeometry(0.67, 0.5, 4, 1).rotateY(Math.PI / 4).scale(1, 1, 0.18), 0x1c1c1c, 0, ay - 0.47, o(0.26), Math.PI);
  k.box(0.32, 0.45, 0.08, 0xe8e4da, 0, ay + 0.05, o(0.34));
  k.box(0.9, 0.22, 0.25, 0xc9a54a, 0, ay + 0.98, o(0.14));

  g.add(k.mesh(kitMat(0.9)));
  return g;
}

// a short round baluster standing at (x, y, z), h tall: swelling in the middle, open-ended (the
// plinth and the rail cover its ends)
function baluster(k, x, y, z, h) {
  k.add(new THREE.CylinderGeometry(0.06, 0.09, h, 6, 1, true), COPING, x, y + h / 2, z);
}

// the wall under the landing: rusticated blocks with deep joints, the little arched door in green
function rusticated(g, w, h) {
  const S = STONE;
  ashlar(g, -w / 2, 0, w / 2, h, shade(S, -0.03), { seed: 64, course: 0.5, vary: 0.05 });
  g.fillStyle = shade(S, -0.35);
  for (let y = 0.5; y < h - 0.3; y += 0.5) g.fillRect(-w / 2, y - 0.04, w, 0.08); // the deep joints
  g.fillStyle = shade(S, 0.12);
  g.fillRect(-w / 2, h - 0.4, w, 0.3); // under the cornice
  roundArch(g, 0, 0, 1.6, 2.5, shade(S, 0.08)); // the door's stone surround
  roundArch(g, 0, 0, 1.15, 2.2, '#2f5a3c');
  g.strokeStyle = '#21402b';
  g.lineWidth = 0.05;
  g.beginPath(); g.moveTo(0, 0.05); g.lineTo(0, 1.6); g.stroke();
  for (const x of [-0.3, 0.3]) g.strokeRect(x - 0.18, 0.3, 0.36, 0.9); // its panels
}

export const BORDES = [{ id: 'stadhuis-bordes', x: X, z: Z, turn: TURN, size: [2 * END, DEEP + 0.4], foot: [FOOT], paths: [PATHS], make: perron }];
