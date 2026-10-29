// The small things the buildings are furnished with: figures in marble, pews, chandeliers,
// candelabras, altars. Each adds its shapes to a Parts (gothic.js): the kit it names, in game metres.
import * as THREE from 'three';

const CREAM = 0xf0ece2, GOLD = 0xd2a94a, OAK = 0x7a4f2a, OAK_DARK = 0x5a3a1e, BLACK = 0x1c1b1e;

// A saint in marble: on a little base, a robe falling in a cone to the floor, a head, the arms
// folded or held out, and a gold halo. scale 1 is about 1.8 m tall including its base.
export function saint(p, x, y, z, scale = 1, ry = 0, { robe = CREAM, base = 0xcfc7b4, halo = true, arms = 0.35 } = {}) {
  const k = p.marble, s = scale;
  const at = (dx, dy, dz) => [x + (dx * Math.cos(ry) + dz * Math.sin(ry)) * s, y + dy * s, z + (-dx * Math.sin(ry) + dz * Math.cos(ry)) * s];
  p.stone.add(new THREE.CylinderGeometry(0.38 * s, 0.42 * s, 0.3 * s, 8), base, x, y + 0.15 * s, z);
  k.add(new THREE.CylinderGeometry(0.2 * s, 0.36 * s, 1.15 * s, 8).translate(0, 0.575 * s, 0), robe, x, y + 0.3 * s, z);
  k.add(new THREE.SphereGeometry(0.17 * s, 8, 6), 0xf4f0e6, ...at(0, 1.62, 0));
  for (const side of [-1, 1]) k.rod(at(side * 0.2, 1.38, 0), at(side * arms, 1.15, 0.28), 0.06 * s, robe, 5);
  if (halo) p.gold.add(new THREE.TorusGeometry(0.2 * s, 0.03 * s, 4, 12), GOLD, ...at(0, 1.64, -0.08));
}

// a pew: seat, back, two ends, a kneeler; `len` along x before it is turned
export function pew(p, x, z, len, ry = 0) {
  const k = p.wood, c = Math.cos(ry), sn = Math.sin(ry);
  const at = (dx, dz) => [x + dx * c + dz * sn, z - dx * sn + dz * c];
  const [sx, sz] = at(0, 0);
  k.box(len, 0.12, 0.55, OAK, sx, 0.52, sz, 0, ry, 0);
  const [bx, bz] = at(0, -0.3);
  k.box(len, 0.9, 0.08, OAK_DARK, bx, 0.95, bz, 0, ry, 0);
  for (const side of [-1, 1]) {
    const [ex, ez] = at(side * len / 2, -0.05);
    k.box(0.1, 1.45, 0.75, OAK_DARK, ex, 0.72, ez, 0, ry, 0);
  }
  const [kx, kz] = at(0, 0.55);
  k.box(len - 0.2, 0.1, 0.3, OAK, kx, 0.18, kz, 0, ry, 0);
}

// a ring of candles hung from a vault on chains: r wide, hung at y, the chains up to `top`
export function chandelier(p, x, y, z, r = 1.3, top = 20, candles = 12) {
  p.gold.add(new THREE.TorusGeometry(r, 0.09, 6, 20), GOLD, x, y, z, Math.PI / 2, 0, 0);
  p.gold.add(new THREE.TorusGeometry(r * 0.45, 0.07, 6, 14), GOLD, x, y + 0.5, z, Math.PI / 2, 0, 0);
  p.gold.add(new THREE.SphereGeometry(0.3, 8, 6), GOLD, x, y - 0.5, z);
  for (let q = 0; q < 3; q++) {
    const a = (q / 3) * Math.PI * 2;
    p.dark.rod([x + Math.cos(a) * r, y, z + Math.sin(a) * r], [x, top, z], 0.03, 0x2a2622, 4);
  }
  for (let q = 0; q < candles; q++) {
    const a = (q / candles) * Math.PI * 2, cx = x + Math.cos(a) * r, cz = z + Math.sin(a) * r;
    p.marble.add(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 5), CREAM, cx, y + 0.24, cz);
    p.glow.add(new THREE.SphereGeometry(0.1, 5, 4), 0xfff0c0, cx, y + 0.5, cz);
  }
}

// a tall gold candelabra on a floor: a foot, a stem, five arms with candles
export function candelabra(p, x, z, h = 3.2) {
  p.gold.add(new THREE.CylinderGeometry(0.32, 0.45, 0.25, 8), GOLD, x, 0.12, z);
  p.gold.add(new THREE.CylinderGeometry(0.07, 0.1, h, 6), GOLD, x, h / 2, z);
  p.gold.add(new THREE.SphereGeometry(0.17, 6, 5), GOLD, x, 0.9, z);
  for (let q = -2; q <= 2; q++) {
    const ax = x + q * 0.34, ay = h + 0.1 - Math.abs(q) * 0.25;
    p.gold.rod([x, h - 0.1, z], [ax, ay, z], 0.04, GOLD, 4);
    p.marble.add(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 5), CREAM, ax, ay + 0.15, z);
    p.glow.add(new THREE.SphereGeometry(0.08, 5, 4), 0xfff0c0, ax, ay + 0.36, z);
  }
}

// a stack of steps up to a platform: `n` steps, the lowest of the given size, in marble
export function steps(p, x, z, w, d, n = 3, h = 0.28, color = 0xd8d2c4) {
  for (let q = 0; q < n; q++) {
    const sw = w - q * 0.9, sd = d - q * 0.9;
    p.marble.box(sw, h, sd, q % 2 ? 0xe4dfd2 : color, x, h / 2 + q * h, z);
  }
}

// a gold sunburst: rays from a point, in a plane facing +z (turned by ry)
export function sunburst(p, x, y, z, r, ry = 0, rays = 24) {
  const c = Math.cos(ry), s = Math.sin(ry);
  for (let q = 0; q < rays; q++) {
    const a = (q / rays) * Math.PI * 2, rr = r * (q % 2 ? 0.7 : 1);
    p.gold.rod([x, y, z], [x + Math.cos(a) * rr * c, y + Math.sin(a) * rr, z - Math.cos(a) * rr * s], 0.05, GOLD, 4);
  }
  p.gold.add(new THREE.SphereGeometry(r * 0.16, 10, 8), 0xf3d77a, x, y, z);
}

// A pipe organ on a west wall: a gallery on carved posts, behind it the case with its towers and
// flats of pipes, facing +z (into the church) from the wall at z. w wide, its pipes up to `top`.
export function organ(p, x, z, w, y0, top, { wall = 1 } = {}) {
  const k = p.dark, gold = p.gold;
  const zf = z + 0.7 * wall;
  p.wood.box(w, 0.5, 3.2, OAK_DARK, x, y0, z + 1.6 * wall);
  p.gold.box(w + 0.2, 0.18, 3.3, GOLD, x, y0 + 0.3, z + 1.6 * wall);
  for (const s of [-1, 1]) for (const dz of [0.4, 2.8]) p.wood.add(new THREE.CylinderGeometry(0.28, 0.32, y0, 8).translate(0, y0 / 2, 0), OAK_DARK, x + s * (w / 2 - 0.5), 0, z + dz * wall);
  p.wood.box(w, top - y0, 0.8, OAK_DARK, x, (y0 + top) / 2, z + 0.4 * wall); // the case
  // the pipes: five towers and flats between them, each a row of rods from its foot to its mouth, taller in the middle
  const pipes = (cx, cw, n, h0, h1) => {
    for (let q = 0; q < n; q++) {
      const u = n === 1 ? 0 : q / (n - 1) - 0.5, h = h0 + (h1 - h0) * (1 - Math.abs(u) * 2);
      p.dark.add(new THREE.CylinderGeometry(0.2, 0.2, h, 8).translate(0, h / 2, 0), 0xc4bfae, cx + u * cw, y0 + 0.5, zf);
      p.gold.add(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 8), GOLD, cx + u * cw, y0 + 0.5 + h * 0.3, zf);
    }
  };
  const u = w / 5;
  for (let q = 0; q < 5; q++) pipes(x + (q - 2) * u, u * 0.78, 7, (q % 2 ? 0.45 : 0.7) * (top - y0) * 0.55, (q === 2 ? 1 : q % 2 ? 0.7 : 0.85) * (top - y0 - 1));
  p.gold.box(w, 0.5, 1.0, GOLD, x, top + 0.2, z + 0.5 * wall);
}

// a simple oak pulpit on a pier, with a canopy: stairs aside
export function pulpit(p, x, z, ry = 0) {
  p.wood.add(new THREE.CylinderGeometry(0.8, 0.5, 3.2, 8).translate(0, 1.6, 0), OAK_DARK, x, 0, z);
  p.wood.add(new THREE.CylinderGeometry(1.6, 1.0, 1.4, 8).translate(0, 3.9, 0), OAK, x, 0, z);
  p.gold.add(new THREE.TorusGeometry(1.6, 0.1, 5, 16).rotateX(Math.PI / 2), GOLD, x, 4.65, z);
  p.wood.add(new THREE.CylinderGeometry(0.3, 2.4, 1.0, 8, 1, true).translate(0, 8.6, 0), OAK, x, 0, z);
  p.wood.rod([x, 9.0, z], [x, 4.7, z], 0.1, OAK_DARK, 5);
  p.gold.add(new THREE.SphereGeometry(0.35, 6, 5), GOLD, x, 9.3, z);
  // the stair climbs round the pier in eight steps
  for (let q = 0; q < 8; q++) {
    const t = ry + 0.4 + q * 0.3;
    p.wood.box(1.0, 0.14, 0.55, OAK, x + Math.cos(t) * 2.3, 0.3 + q * 0.5, z + Math.sin(t) * 2.3, 0, -t + Math.PI / 2, 0);
  }
  p.block(x, z, 2.0);
}

// chairs for a concert, row on row: `rows` rows of `n` chairs, the rows along x, starting at the corner (x, z) and going on in +z, 0.9 apart in the row, 1.3 between rows
export function chairs(p, x0, z0, n, rows) {
  for (let r = 0; r < rows; r++) {
    for (let q = 0; q < n; q++) {
      const x = x0 + q * 0.95, z = z0 + r * 1.35;
      p.wood.box(0.55, 0.08, 0.55, OAK, x, 0.52, z);
      p.wood.box(0.55, 0.7, 0.07, OAK_DARK, x, 0.9, z - 0.27);
      p.dark.box(0.06, 0.5, 0.06, 0x2a2622, x - 0.24, 0.25, z + 0.22);
      p.dark.box(0.06, 0.5, 0.06, 0x2a2622, x + 0.24, 0.25, z + 0.22);
      p.dark.box(0.06, 0.5, 0.06, 0x2a2622, x - 0.24, 0.25, z - 0.22);
      p.dark.box(0.06, 0.5, 0.06, 0x2a2622, x + 0.24, 0.25, z - 0.22);
    }
  }
  p.block(x0 + ((n - 1) * 0.95) / 2, z0 + ((rows - 1) * 1.35) / 2, (n * 0.95) / 2, (rows * 1.35) / 2);
}
