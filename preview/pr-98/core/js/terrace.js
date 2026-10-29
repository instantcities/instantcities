// A restaurant's terrace, written by hand in a city's folder (Ghent's Sint-Baafsplein, its Graslei):
// rows of tables and chairs out from a house's front, parasols over them, a planter at each end.
// It stands as a monument (see ghent/monuments.js), and its chairs are sat on (js/sitters.js).
import * as THREE from 'three';
import { Kit, kitMat } from './kit.js';

// Each terrace: { id, wall: [x0, z0, x1, z1] (the edge of the house's outline in map.js the front is
// drawn on, or the kerb it stands out from), rows, chair, leg, top (colours), round (tables), cloth
// (the parasols', null for none), out?: [dx, dz] roughly the way it stands out from the wall (south
// when not given), shade?: how far out the lines of parasols stand (one line between the first two
// rows when not given), plates?: the tables laid, deep?: the whole terrace stands in the way, so the
// riders, the lamps and the bins keep out of it and the walkers go round it (else only a strip
// along the wall does, and riders can ride in among the tables) }.
export function terraces(list) {
  return list.map(t => {
    const [x0, z0, x1, z1] = t.wall, w = Math.hypot(x1 - x0, z1 - z0), [ox, oz] = t.out ?? [0, 1];
    // out from the wall, the terrace's +z; x then runs along the wall
    let nx = (z1 - z0) / w, nz = -(x1 - x0) / w;
    if (nx * ox + nz * oz < 0) { nx = -nx; nz = -nz; }
    const turn = Math.atan2(nx, nz), { chairs, tables, parasols } = layout(w, t.rows, t.shade);
    const spec = { ...t, w, chairs, tables, parasols }, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    // the ground a deep terrace takes, from the wall out past its last row: its foot (js/landmarks.js)
    const depth = 0.6 + t.rows * 1.8, ux = (x1 - x0) / w, uz = (z1 - z0) / w, half = w / 2 - 0.1;
    const foot = t.deep && [[[-half, 0], [half, 0], [half, depth], [-half, depth]].flatMap(([a, b]) => [mx + ux * a + nx * b, mz + uz * a + nz * b])];
    // size: just a strip against the wall
    return { id: t.id, x: mx, z: mz, turn, size: [w * 0.8, 0.2], ...(foot && { foot }), chairs, make: () => terrace(spec) };
  });
}

// where the chairs and tables stand, the terrace's own metres (x along the wall, z out from it):
// rows of tables out from the wall, a chair either side of each, facing it, every
// other row shifted half a table so the waiters can get through
function layout(w, rows, shade = [2.4]) {
  const chairs = [], tables = [], parasols = [];
  for (let r = 0; r < rows; r++) {
    const z = 1.5 + r * 1.8, shift = r % 2 ? 1.1 : 0;
    for (let x = -w / 2 + 1.2 + shift; x <= w / 2 - 1.1; x += 2.2) {
      tables.push([x, z]);
      chairs.push({ x: x - 0.55, z, yaw: Math.PI / 2 }, { x: x + 0.55, z, yaw: -Math.PI / 2 });
    }
  }
  // parasols between the rows, one for every two tables, every other line shifted half a parasol
  shade.forEach((z, k) => {
    for (let x = -w / 2 + 2.3 + (k % 2) * 2.2; x <= w / 2 - 1.5; x += 4.4) parasols.push([x, z]);
  });
  return { chairs, tables, parasols };
}

const PLATE = 0xf7f5ef, FOOD = [0xc98a3c, 0x8a4b2a, 0xe8d27a, 0x5f8f3a, 0xb8432f, 0xdcb98a]; // fries, stew, an omelette, a salad, a pasta, bread

function terrace(t) {
  const k = new Kit(), { w, chairs, tables, parasols } = t;
  for (const [x, z] of tables) {
    if (t.round) k.add(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 14), t.top, x, 0.76, z);
    else k.box(0.7, 0.04, 0.7, t.top, x, 0.76, z);
    k.add(new THREE.CylinderGeometry(0.03, 0.03, 0.74, 6), t.leg, x, 0.39, z);
    k.box(0.4, 0.03, 0.4, t.leg, x, 0.02, z);
  }
  for (const c of chairs) {
    const s = Math.sin(c.yaw), co = Math.cos(c.yaw), at = (lx, lz) => [c.x + lx * co + lz * s, c.z - lx * s + lz * co];
    k.box(0.42, 0.05, 0.42, t.chair, c.x, 0.49, c.z, 0, c.yaw);
    const [bx, bz] = at(0, -0.2);
    k.box(0.42, 0.45, 0.05, t.chair, bx, 0.73, bz, 0, c.yaw);
    for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) { const [px, pz] = at(lx, lz); k.box(0.03, 0.46, 0.03, t.leg, px, 0.26, pz); }
  }
  // the tables laid: a plate at most places, most with something on it, now and then a bottle of
  // wine or water in the middle
  if (t.plates) {
    let n = [...t.id].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261); // dice of its own for every terrace
    const r = () => ((n = (Math.imul(n, 1103515245) + 12345) >>> 0) / 4294967296);
    for (const c of chairs) {
      if (r() > 0.75) continue;
      // on the table in front, a little to the right, so the glass (js/sitters.js) stands beside it
      const fx = Math.sin(c.yaw), fz = Math.cos(c.yaw), x = c.x + fx * 0.4 + fz * 0.15, z = c.z + fz * 0.4 - fx * 0.15;
      k.add(new THREE.CylinderGeometry(0.12, 0.1, 0.015, 12), PLATE, x, 0.788, z);
      if (r() < 0.8) k.add(new THREE.SphereGeometry(0.07, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), FOOD[Math.floor(r() * FOOD.length)], x, 0.795, z);
    }
    for (const [x, z] of tables) {
      if (r() > 0.35) continue;
      k.add(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 8), r() < 0.5 ? 0x2d4a2a : 0xcfe3e8, x, 0.9, z);
    }
  }
  // the parasols: a pole on a heavy foot between the tables, a square cloth, a valance round it
  if (t.cloth != null) {
    for (const [x, z] of parasols) {
      k.box(0.5, 0.08, 0.5, 0x3a3a3a, x, 0.04, z);
      k.rod([x, 0, z], [x, 2.55, z], 0.035, 0xd8d4cc);
      k.add(new THREE.ConeGeometry(1.22 * Math.SQRT2, 0.45, 4, 1, false, Math.PI / 4), t.cloth, x, 2.62, z);
      for (const sd of [-1, 1]) {
        k.box(2.45, 0.16, 0.02, t.cloth, x, 2.33, z + sd * 1.22);
        k.box(0.02, 0.16, 2.45, t.cloth, x + sd * 1.22, 2.33, z);
      }
    }
  }
  // a low planter at each end, between this terrace and the next
  for (const sd of [-1, 1]) {
    const x = sd * (w / 2 - 0.15);
    k.box(0.35, 0.5, 2.6, 0x4a4540, x, 0.25, 2.6);
    k.box(0.3, 0.3, 2.5, 0x4d7a3a, x, 0.6, 2.6);
  }
  return k.mesh(kitMat(0.6));
}
