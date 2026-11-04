// Het Provinciehuis of Oost-Vlaanderen in the old Leopoldskazerne, on the corner of the Charles de
// Kerchovelaan and the Kunstlaan, modelled by hand on the map's outlines and drawn from photos
// (Google Street View, 2026, and the province's own from the air): the barracks' red-brick wings
// with their slate mansards and towers, the big corner pavilion by the laan, the little castle on the
// corner of the Kunstlaan with its turrets, the new grey-green wing between it and the old ones,
// the low white wing with a green roof round the courtyard, and in the courtyard a raised garden
// with flags and PROVINCIEHUIS in big white letters. It joins the statues (ghent/monuments.js) in
// place of the map's boxes.
import * as THREE from 'three';
import { MAP } from './map.js';
import { brick, crossWindow, roundArch, stringCourse, ashlar, shade, rng } from '../core/js/facades.js';
import { Kit, kitMat } from '../core/js/kit.js';
import { walls, slab, along, ribbon, tiled, mat, mesh } from './blocks.js';

// the map's building nearest to (x, z), as its flat outline
function outline(x, z) {
  let best = null, dist = Infinity;
  for (const b of MAP.buildings) {
    const n = b.p.length / 2;
    let cx = 0, cz = 0;
    for (let k = 0; k < n; k++) { cx += b.p[2 * k] / n; cz += b.p[2 * k + 1] / n; }
    const d = Math.hypot(cx - x, cz - z);
    if (d < dist) { dist = d; best = b.p; }
  }
  return best;
}

// ------------------------------------------------------------------ lines and rings

// the line a -> b moved d metres to its left (looking from a to b)
function shift([ax, az, bx, bz], d) {
  const L = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / L * d, nz = (bx - ax) / L * d;
  return [ax + nx, az + nz, bx + nx, bz + nz];
}

// where two lines (each [ax, az, bx, bz], running on past their ends) cross
function meet([x1, z1, x2, z2], [x3, z3, x4, z4]) {
  const den = (x1 - x2) * (z3 - z4) - (z1 - z2) * (x3 - x4);
  const t = ((x1 - x3) * (z3 - z4) - (z1 - z3) * (x3 - x4)) / den;
  return [x1 + t * (x2 - x1), z1 + t * (z2 - z1)];
}

// a rectangle as a flat ring: centre (x, z), `len` along the way a (radians from +x towards +z), `wid` across
function rect(x, z, a, len, wid) {
  const ux = Math.cos(a), uz = Math.sin(a), vx = -uz, vz = ux;
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].flatMap(([p, q]) => [x + ux * p * len / 2 + vx * q * wid / 2, z + uz * p * len / 2 + vz * q * wid / 2]);
}

// a ring with its little steps and bumps (under `tol` metres) smoothed away (Douglas-Peucker)
function simplify(ring, tol) {
  const pts = [];
  for (let k = 0; k < ring.length; k += 2) pts.push([ring[k], ring[k + 1]]);
  const keep = new Set([0, pts.length >> 1]);
  const run = (i, j) => {
    let far = -1, d = tol;
    const [ax, az] = pts[i], [bx, bz] = pts[j % pts.length], L = Math.hypot(bx - ax, bz - az) || 1;
    for (let k = i + 1; k < j; k++) {
      const e = Math.abs((bx - ax) * (az - pts[k][1]) - (ax - pts[k][0]) * (bz - az)) / L;
      if (e > d) { d = e; far = k; }
    }
    if (far < 0) return;
    keep.add(far);
    run(i, far);
    run(far, j);
  };
  run(0, pts.length >> 1);
  run(pts.length >> 1, pts.length);
  return [...keep].sort((a, b) => a - b).flatMap(k => pts[k]);
}

// a ring drawn in by d metres, each corner along the line halfway between its two sides
function inset(ring, d) {
  const n = ring.length / 2;
  let area = 0;
  for (let k = 0; k < n; k++) area += ring[2 * k] * ring[(2 * k + 3) % ring.length] - ring[(2 * k + 2) % ring.length] * ring[2 * k + 1];
  const s = area > 0 ? 1 : -1, out = [];
  const normal = (a, b) => {
    const dx = ring[2 * b] - ring[2 * a], dz = ring[2 * b + 1] - ring[2 * a + 1], L = Math.hypot(dx, dz) || 1;
    return [(-dz / L) * s, (dx / L) * s];
  };
  for (let k = 0; k < n; k++) {
    const [p, q] = normal((k + n - 1) % n, k), [r, t] = normal(k, (k + 1) % n);
    const mx = p + r, mz = q + t, L = Math.hypot(mx, mz) || 1, c = Math.max(0.35, (mx / L) * p + (mz / L) * q);
    out.push(ring[2 * k] + (mx / L) * (d / c), ring[2 * k + 1] + (mz / L) * (d / c));
  }
  return out;
}

// the sloping sides of a mansard: from the ring at y0 in to its inset by d at y1
function mansard(ring, d, y0, y1, ox, oz) {
  const top = inset(ring, d), pos = [], n = ring.length / 2;
  for (let k = 0; k < n; k++) {
    const j = (k + 1) % n;
    const A = [ring[2 * k] - ox, y0, ring[2 * k + 1] - oz], B = [ring[2 * j] - ox, y0, ring[2 * j + 1] - oz];
    const C = [top[2 * j] - ox, y1, top[2 * j + 1] - oz], D = [top[2 * k] - ox, y1, top[2 * k + 1] - oz];
    pos.push(...A, ...B, ...C, ...A, ...C, ...D);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return { geo: g, top };
}

// the half of a ring on the left of the line a -> b (Sutherland-Hodgman)
function clip(ring, [ax, az, bx, bz]) {
  const side = (x, z) => (bx - ax) * (z - az) - (bz - az) * (x - ax), out = [], n = ring.length / 2;
  for (let k = 0; k < n; k++) {
    const j = (k + 1) % n, x0 = ring[2 * k], z0 = ring[2 * k + 1], x1 = ring[2 * j], z1 = ring[2 * j + 1];
    const s0 = side(x0, z0), s1 = side(x1, z1);
    if (s0 >= 0) out.push(x0, z0);
    if ((s0 >= 0) !== (s1 >= 0)) { const f = s0 / (s0 - s1); out.push(x0 + (x1 - x0) * f, z0 + (z1 - z0) * f); }
  }
  return out;
}

// ------------------------------------------------------------------ where everything stands

// the map's outlines: the barracks' long wing along the courtyard, the corner pavilion by the
// laan, the wing along the Kunstlaan (the castle on its south tip, the new wing the rest) and the
// concrete terrace in front of the castle
const WING = outline(-53, 1753), PAVILION = outline(-127, 1764), KUNST = outline(-15, 1790), TERRACE = outline(-55, 1818);

// the courtyard's walls: the long wing's face along it and the Kunstlaan wing's, and the laan
const BACK = [-98.5, 1774, -5.4, 1760], SIDE = [-4.3, 1760.9, -42.8, 1807.7], LAAN = [-132.1, 1795.5, -61.5, 1854.6];
// the low white wing runs 8 m deep along both, and the garden keeps 3 m from it (a paved walk),
// 13 m from the laan's middle (its pavement and the cobbled forecourt where cars park) and 5 m
// from the corner pavilion
const LOW = 8;
const back = shift(BACK, LOW), side = shift(SIDE, LOW), Q = meet(back, side);
const LOW_RING = [-114.5, 1772.3, -98.5, 1774, ...meet(BACK, SIDE), -42.8, 1807.7, -44.1, 1806.6, ...meet(side, [-44.1, 1806.6, -54.6, 1809]), ...Q, ...meet(back, [-114.5, 1772.3, -112, 1790])];
const gb = shift(BACK, LOW + 3), gs = shift(SIDE, LOW + 3), gf = shift(LAAN, -13), gl = [-109, 1770, -106.5, 1795];
const GARDEN = [...meet(gl, gb), ...meet(gb, gs), ...meet(gs, gf), ...meet(gf, gl)];
const GARDEN_Y = 1.2;

// the castle on the tip of the Kunstlaan wing, square, the way the wing runs
const A = Math.atan2(1762.9 - 1827.1, 19 + 34.5), CASTLE_X = -49, CASTLE_Z = 1824, CASTLE_W = 24;
const CASTLE = rect(CASTLE_X, CASTLE_Z, A, CASTLE_W, CASTLE_W);
// the new wing: the rest of the Kunstlaan wing, from the castle's back on
const cut = [CASTLE_X + Math.cos(A) * (CASTLE_W / 2 - 0.5), CASTLE_Z + Math.sin(A) * (CASTLE_W / 2 - 0.5)];
const NEW = clip(KUNST, [cut[0] - Math.sin(A), cut[1] + Math.cos(A), cut[0] + Math.sin(A), cut[1] - Math.cos(A)]);

// the ground it all stands in for: the map's buildings on it give way
const AREA = [-142, 1745, -104, 1739, 26, 1725, 33, 1752, -38, 1846, -70, 1834, -142, 1778];

// ------------------------------------------------------------------ the drawings

const BRICK = '#a0533b', STONE = '#d3c8b2', SLATE = 0x4a4f56, GLASS = '#26303a';
const textures = {};
const tex = (key, make) => (textures[key] ??= make());

// a bay of the barracks, 4.5 m, `h` tall: red brick over a stone plinth, floors of tall
// stone-framed windows (the ground floor's round-headed), stone bands, a stone cornice
const barracks = h => tex('barracks' + h, () => tiled(4.5, h, 24, (g, w) => {
  brick(g, 0, 0, w, h, BRICK, { course: 0.25 });
  g.fillStyle = STONE;
  g.fillRect(0, 0, w, 1.1);
  const floors = Math.round((h - 1.5) / 4);
  const fh = (h - 1.5) / floors;
  for (let f = 0; f < floors; f++) {
    const y = 0.9 + f * fh;
    if (f) stringCourse(g, 0, w, y - 0.2, STONE, 0.35);
    if (!f) {
      roundArch(g, w / 2, y + 0.6, 2.1, 2.9, STONE);
      roundArch(g, w / 2, y + 0.75, 1.7, 2.6, GLASS);
    } else crossWindow(g, w / 2, y + 0.7, 1.5, fh - 1.7, { stone: STONE, glass: GLASS });
  }
  g.fillStyle = STONE;
  g.fillRect(0, h - 0.7, w, 0.7);
  g.fillStyle = shade(STONE, -0.25);
  g.fillRect(0, h - 0.85, w, 0.15);
}));

// the castle's walls: grey-brown rubble stone, pale stone round the windows and along the top a
// row of corbels under crenels
const castleBay = (w0, h) => tex('castle' + w0 + h, () => tiled(w0, h, 24, (g, w) => {
  ashlar(g, 0, 0, w, h, '#7f6e63', { course: 0.35, seed: 9, vary: 0.12 });
  g.fillStyle = '#b9ae9c';
  g.fillRect(0, 0, w, 0.9);
  for (const y of [1.6, 6.4]) {
    const wh = y < 2 ? 3.4 : 3.8;
    g.fillStyle = '#b9ae9c';
    g.fillRect(w / 2 - 1.1, y - 0.25, 2.2, wh + 0.5);
    roundArch(g, w / 2, y, 1.6, wh, GLASS);
    g.fillStyle = '#b9ae9c';
    g.fillRect(w / 2 - 0.08, y, 0.16, wh - 0.8);
  }
  g.fillStyle = '#a99d8a';
  g.fillRect(0, h - 2.6, w, 0.4);
  for (let x = 0.3; x < w; x += 0.9) { g.fillStyle = '#9b8e7c'; g.fillRect(x, h - 2.2, 0.35, 0.7); }
  g.fillStyle = '#8c7e6e';
  g.fillRect(0, h - 1.5, w, 1.5);
  g.fillStyle = shade('#8c7e6e', -0.4);
  for (let x = 0.25; x < w; x += 1.2) g.fillRect(x, h - 0.6, 0.55, 0.6); // the crenels
}));

// the turrets: the same stone, narrow slits
const turretTex = h => tex('turret' + h, () => tiled(3.6, h, 24, (g, w) => {
  ashlar(g, 0, 0, w, h, '#7a6a5f', { course: 0.35, seed: 4, vary: 0.12 });
  g.fillStyle = '#b9ae9c';
  g.fillRect(0, 0, w, 0.9);
  g.fillRect(0, h - 1.2, w, 0.5);
  for (const y of [3, 7.5, 12]) { g.fillStyle = '#b9ae9c'; g.fillRect(w / 2 - 0.4, y - 0.15, 0.8, 1.9); roundArch(g, w / 2, y, 0.45, 1.6, GLASS); }
}));

// the new wing: grey-green metal panels and long bands of windows, fins between them
const NEW_H = 17;
const newBay = () => tex('new', () => tiled(3, NEW_H, 24, (g, w, h) => {
  g.fillStyle = '#62796d';
  g.fillRect(0, 0, w, h);
  for (let y = 0.6; y + 3 < h; y += 4) {
    g.fillStyle = '#2b3836';
    g.fillRect(0.25, y + 0.6, w - 0.5, 2.6);
    g.fillStyle = shade('#2b3836', 0.15);
    g.fillRect(0.4, y + 2.3, w - 0.8, 0.7);
  }
  g.fillStyle = '#566b61';
  for (let x = 0; x < w; x += 0.75) g.fillRect(x, 0, 0.12, h);
  g.fillStyle = '#7a9184';
  g.fillRect(0, h - 0.6, w, 0.6);
}));

// PROVINCIEHUIS in white letters, on a transparent board
function lettersTex() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#f1efea';
  g.font = 'italic 900 118px Arial, Helvetica, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.fillText('PROVINCIEHUIS', 512, 116, 1010);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ------------------------------------------------------------------ the model

function provinciehuis(ox, oz) {
  const g = new THREE.Group(), kit = new Kit();
  const slate = mat({ color: SLATE, roughness: 0.7 }), concrete = mat({ color: 0xdedbd3 }), sedum = mat({ color: 0x7c8a4c });

  // the barracks: brick up to the eaves, a slate mansard over them, dormers in it
  const roofOf = (ring, y0, y1, d) => {
    const flat = simplify(ring, 0.9), m = mansard(flat, d, y0, y1, ox, oz);
    g.add(mesh(m.geo, slate));
    g.add(mesh(slab(m.top, y1 - 0.2, y1, ox, oz), slate));
    const n = flat.length / 2;
    for (let k = 0; k < n; k++) {
      const j = (k + 1) % n, ax = flat[2 * k], az = flat[2 * k + 1], bx = flat[2 * j], bz = flat[2 * j + 1];
      if (Math.hypot(bx - ax, bz - az) < 7) continue;
      const a = Math.atan2(bz - az, bx - ax), mid = inset(flat, d * 0.45);
      // a dormer every 4.5 m, standing out of the slope halfway up it
      for (const [x, z] of along([ax, az, bx, bz], 4.5, 3)) {
        const near = nearest(mid, x, z);
        kit.box(1.7, 2.2, 1.6, SLATE, near[0] - ox, y0 + (y1 - y0) * 0.45, near[1] - oz, 0, -a, 0);
        kit.box(1.2, 1.5, 1.62, 0x2a3138, near[0] - ox, y0 + (y1 - y0) * 0.42, near[1] - oz, 0, -a, 0);
      }
    }
  };
  g.add(mesh(walls(WING, 0, 13, 4.5, ox, oz), mat({ map: barracks(13) })));
  roofOf(WING, 13, 19.5, 2.4);
  g.add(mesh(walls(PAVILION, 0, 16, 4.5, ox, oz), mat({ map: barracks(16) })));
  roofOf(PAVILION, 16, 24, 2.8);
  // the towers along the courtyard: a storey higher, under steep slate spires with a finial
  const wingA = Math.atan2(BACK[3] - BACK[1], BACK[2] - BACK[0]);
  for (const [x, z] of [[-102, 1768.5], [-67, 1766.5], [-37, 1762], [-6, 1755]]) {
    const r = rect(x, z, wingA, 6.5, 6.5);
    g.add(mesh(walls(r, 0, 21, 4.5, ox, oz), mat({ map: barracks(21) })));
    kit.add(new THREE.ConeGeometry(4.9, 9, 4).rotateY(Math.PI / 4), SLATE, x - ox, 21 + 4.5, z - oz, 0, -wingA, 0);
    kit.rod([x - ox, 30, z - oz], [x - ox, 31.6, z - oz], 0.08, 0x3b3f44, 4);
  }

  // the castle: stone walls, a steep hipped slate roof, a round turret on every corner under a
  // pointed slate cap, and a big dormer to the laan
  g.add(mesh(walls(CASTLE, 0, 14, 6, ox, oz), mat({ map: castleBay(6, 14) })));
  kit.add(new THREE.ConeGeometry(CASTLE_W / Math.SQRT2 - 1.2, 10, 4).rotateY(Math.PI / 4), SLATE, CASTLE_X - ox, 14 + 5 - 0.6, CASTLE_Z - oz, 0, -A, 0);
  const turret = mat({ map: turretTex(17) });
  for (let k = 0; k < 4; k++) {
    const x = CASTLE[2 * k], z = CASTLE[2 * k + 1];
    const t = mesh(new THREE.CylinderGeometry(2.3, 2.3, 17, 16, 1, true), turret);
    t.position.set(x - ox, 8.5, z - oz);
    g.add(t);
    kit.add(new THREE.CylinderGeometry(2.6, 2.3, 0.8, 16), 0x8c7e6e, x - ox, 17.2, z - oz);
    kit.add(new THREE.ConeGeometry(2.8, 8.5, 16), SLATE, x - ox, 17.6 + 4.25, z - oz);
    kit.rod([x - ox, 25.8, z - oz], [x - ox, 27.2, z - oz], 0.07, 0x3b3f44, 4);
  }
  // the dormer to the laan, on the castle's south-west side
  const dx = CASTLE_X - Math.sin(A) * -(CASTLE_W / 2 - 2.5), dz = CASTLE_Z + Math.cos(A) * -(CASTLE_W / 2 - 2.5);
  kit.box(5, 5, 3, 0x7f6e63, dx - ox, 15.5, dz - oz, 0, -A, 0);
  kit.add(new THREE.ConeGeometry(3.8, 3.5, 4).rotateY(Math.PI / 4).scale(1, 1, 0.8), SLATE, dx - ox, 19.7, dz - oz, 0, -A, 0);

  // the new wing: grey-green, flat-roofed
  g.add(mesh(walls(NEW, 0, NEW_H, 3, ox, oz), mat({ map: newBay() })));
  g.add(mesh(slab(NEW, NEW_H - 0.3, NEW_H, ox, oz), [mat({ color: 0x8a8d88 }), mat({ color: 0x7a9184 })]));

  // the low white wing round the courtyard: a concrete roof with a green roof on it, on slender
  // columns, the glass set back under it; and the terrace in front of the castle the same
  const LOW_H = 4.6;
  g.add(mesh(slab(LOW_RING, LOW_H - 0.9, LOW_H, ox, oz), [sedum, concrete]));
  g.add(mesh(slab(TERRACE, LOW_H - 0.9, LOW_H, ox, oz), [sedum, concrete]));
  const front = [...meet(back, [-114.5, 1772.3, -112, 1790]), ...Q, ...meet(side, [-44.1, 1806.6, -54.6, 1809])];
  g.add(mesh(ribbon([...meet(shift(BACK, LOW - 2.5), [-114.5, 1772.3, -112, 1790]), ...meet(shift(BACK, LOW - 2.5), shift(SIDE, LOW - 2.5)), ...meet(shift(SIDE, LOW - 2.5), [-44.1, 1806.6, -54.6, 1809])], 0, 0, { h: LOW_H - 0.9, ox, oz }),
    mat({ color: 0x3a4650, metalness: 0.4, roughness: 0.2 })));
  for (const [x, z] of along(front, 5.5, 1)) kit.box(0.45, LOW_H - 0.9, 0.45, 0xe4e1da, x - ox, (LOW_H - 0.9) / 2, z - oz);
  {
    const n = TERRACE.length / 2;
    for (let k = 0; k < n; k += 3) kit.box(0.5, LOW_H - 0.9, 0.5, 0xe4e1da, TERRACE[2 * k] - ox, (LOW_H - 0.9) / 2, TERRACE[2 * k + 1] - oz);
  }

  // the garden in the courtyard, raised behind a low white concrete wall, planted with grasses,
  // shrubs and young trees
  g.add(mesh(slab(GARDEN, 0, GARDEN_Y, ox, oz), [mat({ color: 0x6f8f45 }), concrete]));
  const r = rng(21), gx = GARDEN.filter((_, k) => !(k % 2)), gz = GARDEN.filter((_, k) => k % 2);
  const inGarden = (x, z) => {
    let c = false;
    for (let i = 0, j = GARDEN.length - 2; i < GARDEN.length; j = i, i += 2) {
      if ((GARDEN[i + 1] > z) !== (GARDEN[j + 1] > z) && x < ((GARDEN[j] - GARDEN[i]) * (z - GARDEN[i + 1])) / (GARDEN[j + 1] - GARDEN[i + 1]) + GARDEN[i]) c = !c;
    }
    return c;
  };
  const greens = [0x5d7a3a, 0x7d9447, 0x4f6b34, 0x93a25a, 0x8c8a4f];
  const bush = new THREE.IcosahedronGeometry(1, 0);
  for (let k = 0, placed = 0; k < 600 && placed < 140; k++) {
    const x = Math.min(...gx) + r() * (Math.max(...gx) - Math.min(...gx)), z = Math.min(...gz) + r() * (Math.max(...gz) - Math.min(...gz));
    if (!inGarden(x, z) || !inGarden(x + 1.5, z) || !inGarden(x - 1.5, z) || !inGarden(x, z + 1.5) || !inGarden(x, z - 1.5)) continue;
    placed++;
    const s = 0.35 + r() * 0.45;
    kit.add(bush.clone().scale(s * 1.3, s * 0.8, s * 1.2), greens[placed % greens.length], x - ox, GARDEN_Y + s * 0.3, z - oz, 0, r() * 3, 0);
    if (placed % 16 === 0) {
      kit.rod([x - ox, GARDEN_Y, z - oz], [x - ox, GARDEN_Y + 4.5, z - oz], 0.12, 0x5a4a3a, 5);
      kit.add(bush.clone().scale(1.8, 2.2, 1.8), 0x6e9240, x - ox, GARDEN_Y + 5.2, z - oz);
    }
  }

  // PROVINCIEHUIS along the garden's front, to the laan, and the flags beside it
  const [fx0, fz0] = meet(gf, gl), [fx1, fz1] = meet(gs, gf);
  const fa = Math.atan2(fz1 - fz0, fx1 - fx0), nx = Math.sin(fa), nz = -Math.cos(fa); // in, away from the laan
  const L = 17, lx = fx0 + (fx1 - fx0) * 0.38 + nx * 2, lz = fz0 + (fz1 - fz0) * 0.38 + nz * 2;
  const letters = lettersTex();
  for (const [d, shadeBy] of [[0, 0xffffff], [0.3, 0xb9b7b2]]) {
    const p = mesh(new THREE.PlaneGeometry(L, L / 8), new THREE.MeshStandardMaterial({ map: letters, color: shadeBy, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 }));
    p.position.set(lx + nx * d - ox, GARDEN_Y + L / 16 - 0.1, lz + nz * d - oz);
    p.rotation.y = -fa;
    g.add(p);
  }
  // Belgium, Flanders, Europe and East Flanders
  const flags = [[0x1d1d1b, 0xf6d330, 0xd8232a], [0xf6d330], [0x1f3f9a], [0xf2f2f2]];
  flags.forEach((cols, k) => {
    const t = 0.66 + k * 0.045, x = fx0 + (fx1 - fx0) * t + nx * 4, z = fz0 + (fz1 - fz0) * t + nz * 4;
    kit.rod([x - ox, GARDEN_Y, z - oz], [x - ox, GARDEN_Y + 8, z - oz], 0.06, 0xd8d8d8, 6);
    cols.forEach((c, i) => kit.box(1.8 / cols.length, 1.2, 0.04, c, x - ox + Math.cos(fa) * (0.15 + (1.8 / cols.length) * (i + 0.5)), GARDEN_Y + 7.3, z - oz + Math.sin(fa) * (0.15 + (1.8 / cols.length) * (i + 0.5)), 0, -fa, 0));
  });

  g.add(kit.mesh(kitMat(0.8)));
  return g;
}

// the point of a ring nearest to (x, z), along its sides
function nearest(ring, x, z) {
  let best = [x, z], dist = Infinity;
  const n = ring.length / 2;
  for (let k = 0; k < n; k++) {
    const j = (k + 1) % n, ax = ring[2 * k], az = ring[2 * k + 1], bx = ring[2 * j], bz = ring[2 * j + 1];
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    const px = ax + dx * t, pz = az + dz * t, d = Math.hypot(px - x, pz - z);
    if (d < dist) { dist = d; best = [px, pz]; }
  }
  return best;
}

const X = -55, Z = 1790;

export const PROVINCIEHUIS = [{
  id: 'provinciehuis', name: 'Provinciehuis (Leopoldskazerne)', x: X, z: Z, turn: 0, reach: 110,
  area: [AREA], foot: [WING, PAVILION, CASTLE, NEW, LOW_RING, TERRACE, GARDEN], paths: [GARDEN],
  make: () => provinciehuis(X, Z),
}];
