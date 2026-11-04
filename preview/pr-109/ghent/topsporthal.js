// The Topsporthal Vlaanderen on the Zuiderlaan by the Watersportbaan, modelled by hand on the map's
// outline and drawn from photos: at its west end a lower round drum in dark blue with a row of
// small square windows, the rest a tall hall clad in silver ribbed metal over a band of glass, a
// dark blue slab leaning against its north front by the east corner, and on that front, facing the
// water and the Annie Vande Wielebrug, the blue swoosh and TOPSPORTHAL in big dark blue letters.
// It joins the statues (ghent/monuments.js) in place of the map's box.
import * as THREE from 'three';
import { MAP } from './map.js';
import { Kit, kitMat } from '../core/js/kit.js';
import { walls, slab, tiled, mat, mesh } from './blocks.js';

const DRUM = 14, HALL = 19; // how high the drum and the hall stand
const NAVY = '#1f3266', SILVER = '#c9ccd0';

// the map's outline: the big sports hall south of the Watersportbaan
function ring() {
  let best = null, dist = Infinity;
  for (const b of MAP.buildings) {
    if (b.k !== 'sports_centre') continue;
    const n = b.p.length / 2;
    let cx = 0, cz = 0;
    for (let k = 0; k < n; k++) { cx += b.p[2 * k] / n; cz += b.p[2 * k + 1] / n; }
    const d = Math.hypot(cx + 2724, cz - 936);
    if (d < dist) { dist = d; best = b.p; }
  }
  return dist < 30 ? best : null;
}

// the hall runs along its long north front, from its west corner A
const A = [-2766.3, 848.7], U = [0.946, 0.326]; // the way the front runs, east-north-east
const along = (x, z) => (x - A[0]) * U[0] + (z - A[1]) * U[1];

// the part of a ring on one side of the line across the hall `cut` metres along from A (side -1:
// the west end, 1: the rest)
function clip(ring, cut, side) {
  const out = [], n = ring.length / 2, f = k => side * (along(ring[2 * k], ring[2 * k + 1]) - cut);
  for (let k = 0; k < n; k++) {
    const j = (k + 1) % n, fa = f(k), fb = f(j);
    if (fa >= 0) out.push(ring[2 * k], ring[2 * k + 1]);
    if ((fa >= 0) !== (fb >= 0)) {
      const t = fa / (fa - fb);
      out.push(ring[2 * k] + (ring[2 * j] - ring[2 * k]) * t, ring[2 * k + 1] + (ring[2 * j + 1] - ring[2 * k + 1]) * t);
    }
  }
  return out;
}

// silver ribbed cladding over a band of glass at the foot, 8 m a bay
const cladding = () => tiled(8, HALL, 24, (g, w, h) => {
  g.fillStyle = SILVER;
  g.fillRect(0, 0, w, h);
  for (let y = 3.6; y < h; y += 0.45) { g.fillStyle = 'rgba(60,64,70,0.22)'; g.fillRect(0, y, w, 0.08); }
  g.fillStyle = '#8d9298'; g.fillRect(0, 3.2, w, 0.4); // the band over the glass
  g.fillStyle = '#3c4852'; g.fillRect(0, 0, w, 3.2);
  for (let x = 0; x < w; x += 2) { g.fillStyle = '#5d6b77'; g.fillRect(x + 0.1, 0.1, 1.8, 2.9); }
  g.fillStyle = '#a7acb1'; g.fillRect(0, h - 0.6, w, 0.6); // the coping
});

// the drum's dark blue, a row of small square windows high up, 4 m apart
const drum = () => tiled(4, DRUM, 24, (g, w, h) => {
  g.fillStyle = '#2c3f78';
  g.fillRect(0, 0, w, h);
  for (let y = 0.9; y < h; y += 0.9) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, y, w, 0.06); }
  g.fillStyle = '#e6e9ee'; g.fillRect(1.3, 8.6, 1.4, 1.4);
  g.fillStyle = '#6f8395'; g.fillRect(1.45, 8.75, 1.1, 1.1);
  g.fillStyle = '#9aa3ad'; g.fillRect(0, h - 0.5, w, 0.5);
});

// the sign: the blue swoosh, and TOPSPORTHAL under it in big dark blue letters
function sign(w, h) {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = Math.round((2048 * h) / w);
  const g = c.getContext('2d'), W = c.width, H = c.height;
  // the swoosh: a C open to the right, a dark blue band with a light blue line along it, its top
  // running on along the sign and its foot stopping short, then a dash
  const y0 = H * 0.09, r = H * 0.13, cx = W * 0.16;
  for (const [col, lw] of [[NAVY, H * 0.1], ['#4f86c6', H * 0.035]]) {
    g.strokeStyle = col; g.lineWidth = lw;
    g.beginPath();
    g.moveTo(W * 0.94, y0);
    g.lineTo(cx, y0);
    g.arc(cx, y0 + r, r, -Math.PI / 2, Math.PI / 2, true);
    g.lineTo(W * 0.6, y0 + 2 * r);
    g.stroke();
  }
  g.fillStyle = NAVY; g.fillRect(W * 0.66, y0 + 2 * r - H * 0.05, W * 0.28, H * 0.1);
  g.fillStyle = NAVY;
  g.font = `italic bold ${Math.round(H * 0.54)}px Arial, Helvetica, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillText('TOPSPORTHAL', W / 2, H * 0.98, W * 0.96);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }));
}

function hall(foot, ox, oz) {
  const g = new THREE.Group(), kit = new Kit();
  const west = clip(foot, -5, -1), east = clip(foot, -5, 1);
  const roof = mat({ color: 0x9a9fa4 }), edge = mat({ color: 0xa7acb1 });
  g.add(mesh(walls(west, 0, DRUM, 4, ox, oz), mat({ map: drum() })));
  g.add(mesh(slab(west, DRUM - 0.3, DRUM, ox, oz), [roof, edge]));
  g.add(mesh(walls(east, 0, HALL, 8, ox, oz), mat({ map: cladding() })));
  g.add(mesh(slab(east, HALL - 0.3, HALL, ox, oz), [roof, edge]));
  // the north front's outward side, and a point s metres along it
  const N = [U[1], -U[0]], at = s => [A[0] + U[0] * s - ox, A[1] + U[1] * s - oz];
  const yaw = Math.atan2(N[0], N[1]);
  // the sign, over the west half of the front
  const sg = sign(66, 13), [sx, sz] = at(38);
  sg.position.set(sx + N[0] * 0.12, 11.6, sz + N[1] * 0.12);
  sg.rotation.y = yaw;
  g.add(sg);
  // the dark blue slab leaning against the front by the east corner, slanted like a sail, with a
  // strip of blue glass in it
  const [lx, lz] = at(81);
  kit.box(13, 18, 0.6, 0x24386b, lx + N[0] * 1.6, 8.6, lz + N[1] * 1.6, -0.12, yaw, -0.42);
  kit.box(3.2, 12, 0.2, 0x5c86b8, lx + N[0] * 2.0 + U[0] * 2, 8.2, lz + N[1] * 2.0 + U[1] * 2, -0.12, yaw, -0.42);
  // the stairs up the drum's side: a grey flight against the wall at the west end
  const [ex, ez] = at(-34);
  kit.box(8, 0.3, 2, 0x8c9094, ex + N[0] * 1.6, 5, ez + N[1] * 1.6, 0, Math.atan2(-U[1], U[0]), 0.55);
  g.add(kit.mesh(kitMat(0.5, 0.3)));
  return g;
}

const FOOT = ring();
const [X, Z] = (() => {
  if (!FOOT) return [0, 0];
  const n = FOOT.length / 2;
  let x = 0, z = 0;
  for (let k = 0; k < n; k++) { x += FOOT[2 * k] / n; z += FOOT[2 * k + 1] / n; }
  return [x, z];
})();

export const TOPSPORTHAL = FOOT ? [{ id: 'topsporthal', name: 'Topsporthal', x: X, z: Z, turn: 0, reach: 220, area: [FOOT], foot: [FOOT], make: () => hall(FOOT, X, Z) }] : [];
