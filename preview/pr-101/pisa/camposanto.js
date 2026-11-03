// The Camposanto Monumentale (begun 1278 by Giovanni di Simone), the cemetery cloister on the north
// side of the Piazza dei Miracoli, said to be built round earth that the crusaders brought back from
// Golgotha, modelled by hand in place of the map's block of it, from its measurements and photos, in
// game metres (the real ones times 1.25), on the map's outline: a long low box of white marble 126 m
// by 44 m round a lawn:
//   the outer wall, blind all round: a row of tall round arches on pilasters
//     under the cornice
//   the two doors on the south side, the main one to the east under its Gothic tabernacle with the
//     Madonna and four saints
//   the lead roofs over the galleries, sloping down to the courtyard
//   the courtyard's walls: tall round arches with their Gothic tracery of three slender mullions,
//     open on the galleries, round the lawn
//   the Cappella Dal Pozzo standing out from the east end, under its little dome
// Riders bump into its outer wall.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { panel, prism } from '../florence/marble.js';
import { MARBLE, LEAD, DARK, blind, slope } from './romanico.js';

const X = -349.8, Z = -744.6, TURN = -0.099; // its middle; its long axis runs east (local +x)
const U = 82, V0 = -27.6, V1 = 27.2, G = 12.5; // half its length, its north and south sides, the galleries' depth
const WALL = 13.5, EAVES = 14.6, INNER = 11; // the outer wall's top, the roof's top over it, its foot at the courtyard
const CAP = [U, -6.6, 93.6, 6.4]; // the chapel at the east end: u0, v0, u1, v1
const STONE = shade(MARBLE, -0.07), LAWN = '#6fa556';

// the four sides of a rectangle, each running with its outside to the right (or inside, `inward`)
function sides4(u0, v0, u1, v1, inward = false) {
  const c = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
  const ring = inward ? c.slice().reverse() : c;
  return ring.map((p, i) => linePath(...p, ...ring[(i + 1) % 4]));
}

export function camposanto() {
  const kit = new Kit();
  // the outer wall all round: its plinth, the grey bands, the blind arches, the cornice
  for (const path of sides4(-U, V0, U, V1)) {
    const len = path.length, n = Math.round(len / 3.8);
    wall(kit, path, [[0, 0], [len, 0], [len, WALL], [0, WALL]], { o0: -1.2, o1: 0, hex: MARBLE });
    panel(kit, path, 0, len, 0, 0.8, STONE, 0, 0.5);
    blind(kit, path, 0, len, 0.8, WALL - 0.8, n, { arch: 0.8, depth: 0.35, crown: WALL - 2.6 });
    panel(kit, path, 0, len, WALL - 0.9, WALL, STONE, 0, 0.7);
  }
  // the south side's two doors, and the tabernacle over the main one
  const south = sides4(-U, V0, U, V1)[2]; // runs west along v = V1, s from the east end
  for (const [s, main] of [[U - 52, true], [U + 46, false]]) {
    panel(kit, south, s - 2.6, s + 2.6, 0.8, 7.4, STONE, 0.3, 0.4);
    panel(kit, south, s - 1.8, s + 1.8, 0.8, 6.4, '#5a4430', 0.5, 0.3);
    if (!main) continue;
    wall(kit, south, [[s - 3.4, 7.8], [s + 3.4, 7.8], [s + 3.4, WALL + 1], [s, WALL + 6], [s - 3.4, WALL + 1]], { o0: 0, o1: 1.2, hex: MARBLE });
    for (let k = 0; k < 5; k++) {
      const p = south.at(s - 2.4 + k * 1.2), h = k === 2 ? 2.6 : 2;
      panel(kit, south, s - 2.4 + k * 1.2 - 0.45, s - 2.4 + k * 1.2 + 0.45, WALL - 2.8, WALL - 2.8 + h + 0.6, DARK, 1.2, 0.05);
      kit.add(new THREE.CylinderGeometry(0.28, 0.36, h, 6), shade(MARBLE, 0.04), p.x + 1.4 * p.tz, WALL - 2.6 + h / 2, p.z - 1.4 * p.tx);
    }
    for (const d of [-3.4, 3.4]) {
      const p = south.at(s + d);
      kit.add(new THREE.ConeGeometry(0.5, 3.4, 4), MARBLE, p.x + 0.6 * p.tz, WALL + 2.7, p.z - 0.6 * p.tx);
    }
  }
  // the courtyard's walls, facing in: tall arches on the galleries, each with its three mullions
  const iu = U - G, iv0 = V0 + G, iv1 = V1 - G;
  for (const path of sides4(-iu, iv0, iu, iv1, true)) {
    const len = path.length, n = Math.round(len / 5.2);
    panel(kit, path, 0, len, 0, INNER, DARK, -1.2, 0.05);
    blind(kit, path, 0, len, 0, INNER, n, {
      arch: 0.78, depth: 1, crown: INNER - 1.1,
      win: (i, c, w, top) => {
        for (const d of [-w / 4, 0, w / 4]) panel(kit, path, c + d - 0.12, c + d + 0.12, 0, top - w / 2 - 0.3, MARBLE, 0.2, 0.25);
        panel(kit, path, c - w / 2, c + w / 2, 0, 0.9, MARBLE, 0, 0.6);
      },
    });
    panel(kit, path, 0, len, INNER - 0.4, INNER + 0.2, STONE, 0, 1.3);
  }
  // the galleries' ceilings and the lawn
  prism(kit, rect(-iu + 1, iv0 + 1, iu - 1, iv1 - 1), 0, 0.12, LAWN);
  // the roofs, sloping from over the outer wall down to the courtyard
  const r = 1.1, o = [[-U - r, V0 - r], [U + r, V0 - r], [U + r, V1 + r], [-U - r, V1 + r]], i = [[-iu, iv0], [iu, iv0], [iu, iv1], [-iu, iv1]];
  for (let k = 0; k < 4; k++) {
    const a = o[k], b = o[(k + 1) % 4], c = i[(k + 1) % 4], d = i[k];
    slope(kit, [a[0], EAVES, a[1]], [b[0], EAVES, b[1]], [c[0], INNER + 0.2, c[1]], [d[0], INNER + 0.2, d[1]], LEAD);
  }
  for (const path of sides4(-U - r, V0 - r, U + r, V1 + r)) panel(kit, path, 0, path.length, WALL, EAVES, MARBLE, -1.1, 1.1);
  // the Cappella Dal Pozzo out from the east end, its blind arches, its drum and dome
  const [a0, b0, a1, b1] = CAP;
  prism(kit, rect(a0, b0, a1, b1), 0, WALL, MARBLE);
  for (const path of sides4(a0, b0, a1, b1).slice(0, 3)) {
    blind(kit, path, 0, path.length, 0.8, WALL - 0.8, Math.max(2, Math.round(path.length / 3.8)), { arch: 0.8, depth: 0.35, crown: WALL - 2.6 });
    panel(kit, path, 0, path.length, WALL - 0.9, WALL, STONE, 0, 0.7);
  }
  const cx = (a0 + a1) / 2, cz = (b0 + b1) / 2;
  prism(kit, rect(a0, b0, a1, b1), WALL, WALL + 1, STONE);
  kit.add(new THREE.CylinderGeometry(4.2, 4.2, 3, 8), MARBLE, cx, WALL + 2.5, cz);
  kit.add(new THREE.SphereGeometry(4.2, 12, 6, 0, 2 * Math.PI, 0, Math.PI / 2), LEAD, cx, WALL + 4, cz);
  kit.add(new THREE.CylinderGeometry(0.6, 0.8, 1.6, 8), MARBLE, cx, WALL + 9, cz);
  kit.box(0.16, 1.4, 0.16, '#c9a24a', cx, WALL + 10.4, cz).box(0.16, 0.16, 0.8, '#c9a24a', cx, WALL + 10.7, cz);
  return kit.mesh(kitMat(0.85));
}

// it stands in for the map's block of it (area), and riders bump into its outer wall (foot)
const FOOT = onMap(X, Z, TURN, rect(-U - 0.6, V0 - 0.3, U + 0.6, V1 + 0.6)), CHAPEL = onMap(X, Z, TURN, rect(U, CAP[1] - 0.4, CAP[2] + 0.4, CAP[3] + 0.4));
export const CAMPOSANTO = [{
  id: 'camposanto', name: 'Camposanto', x: X, z: Z, turn: TURN, reach: 200,
  area: [onMap(X, Z, TURN, rect(-U - 4, V0 - 3, U + 4, V1 + 3)), CHAPEL], foot: [FOOT, CHAPEL],
  make: camposanto,
}];
