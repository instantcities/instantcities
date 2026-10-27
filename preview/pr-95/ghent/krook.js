// De Krook, the city library on the Scheldt (RCR Arquitectes with Coussée & Goris, 2017), modelled
// by hand on its outline and drawn from photos (Wikimedia Commons, in tools/cache/photos/krook/):
// five floors of glass stacked up, each standing out a little further or less far than the one
// under it, and round every floor a gallery of bronze steel louvres, three bands a storey on
// slender fins. It joins the statues (ghent/monuments.js) in place of the map's box.
import * as THREE from 'three';
import { MAP } from './map.js';
import { Kit, kitMat } from '../core/js/kit.js';
import { S, walls, slab, grow, mat, mesh } from './blocks.js';

const FLOOR = 5.2 * S;
// how far each floor's edge stands out of the outline, ground floor first (the ground floor in
// under the first, the ones above jutting out unevenly)
const OUT = [-1.6, 0.6, -0.2, 1.1, 0.3];

function ring() {
  let best = null, dist = Infinity;
  for (const b of MAP.buildings) {
    const n = b.p.length / 2;
    let cx = 0, cz = 0;
    for (let k = 0; k < n; k++) { cx += b.p[2 * k] / n; cz += b.p[2 * k + 1] / n; }
    const d = Math.hypot(cx - 438, cz - 603);
    if (d < dist) { dist = d; best = b.p; }
  }
  return best;
}

function krook(foot, ox, oz) {
  const g = new THREE.Group(), fins = new Kit();
  const glass = mat({ color: 0x55656f, metalness: 0.5, roughness: 0.15 });
  const dark = mat({ color: 0x2f3539, metalness: 0.4, roughness: 0.3 });
  const edge = mat({ color: 0x6b6152, metalness: 0.3, roughness: 0.6 });
  const louvre = mat({ color: 0x5a5245, metalness: 0.45, roughness: 0.5 });
  OUT.forEach((o, i) => {
    const y0 = i * FLOOR, top = y0 + FLOOR;
    // the glass, set back behind the gallery; the ground floor's darker, in under the floor above
    g.add(mesh(walls(grow(foot, o - 1.5), y0, top - 0.7, 0, ox, oz), i ? glass : dark));
    // the floor's edge, a deep bronze band
    g.add(mesh(slab(grow(foot, o), top - 0.7, top, ox, oz), [mat({ color: 0x6f6a62 }), edge]));
    if (!i) return;
    // three bands of louvres a storey, on fins every 2.5 m
    const outer = grow(foot, o - 0.1);
    for (const y of [1.3, 2.5, 3.7]) g.add(mesh(walls(outer, y0 + y * S, y0 + y * S + 0.32, 0, ox, oz), louvre));
    const n = outer.length / 2;
    for (let k = 0; k < n; k++) {
      const ax = outer[2 * k], az = outer[2 * k + 1], bx = outer[(2 * k + 2) % outer.length], bz = outer[(2 * k + 3) % outer.length];
      const L = Math.hypot(bx - ax, bz - az), m = Math.max(1, Math.round(L / 2.5));
      for (let j = 0; j < m; j++) {
        const f = j / m, x = ax + (bx - ax) * f - ox, z = az + (bz - az) * f - oz;
        fins.box(0.08, FLOOR - 0.7, 0.35, 0x4d463b, x, y0 + (FLOOR - 0.7) / 2, z, 0, -Math.atan2(bz - az, bx - ax), 0);
      }
    }
  });
  // the flat roof
  g.add(mesh(slab(grow(foot, OUT.at(-1)), OUT.length * FLOOR - 0.1, OUT.length * FLOOR + 0.2, ox, oz), [mat({ color: 0x8b8b86 }), edge]));
  g.add(fins.mesh(kitMat(0.5, 0.4)));
  return g;
}

const FOOT = ring();
const [X, Z] = (() => {
  const n = FOOT.length / 2;
  let x = 0, z = 0;
  for (let k = 0; k < n; k++) { x += FOOT[2 * k] / n; z += FOOT[2 * k + 1] / n; }
  return [x, z];
})();

export const KROOK = [{ id: 'krook', name: 'De Krook', x: X, z: Z, turn: 0, reach: 80, area: [FOOT], foot: [FOOT], make: () => krook(FOOT, X, Z) }];
