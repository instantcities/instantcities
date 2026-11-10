// The Battistero di San Giovanni (begun 1152 by Diotisalvi, its Gothic upper storeys by Nicola and
// Giovanni Pisano in the 13th century), the biggest baptistery in Italy, modelled by hand in place of
// the map's pieces of it, from its measurements and photos, in game metres (the real ones times
// 1.25), on the map's outline: a drum 34 m across, 55 m high to the statue of St John on top. White
// marble with grey bands below, and four storeys:
//   the ground storey: twenty tall blind arches on half-columns, with windows and inlaid lozenges,
//     the four doors, the main one to the east facing the Duomo's front in its richer portal
//   the loggia: sixty little arches on columns, and over it the Gothic crown of gables and
//     pinnacles that the Pisani set on the Romanesque drum
//   the third storey with its twenty windows, each under a gable, pinnacles between them
//   the dome: half of it roofed in red tiles to the west, towards the sea, the other half in lead,
//     and the truncated cone of the inner dome rising through it, ribbed, up to the statue
// It stands on its own, so riders bump into it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { ellipsePath, wall, onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { panel, lancet, ngon } from '../florence/marble.js';
import { MARBLE, LEAD, DARK, blind, loggia, bands, strip } from './romanico.js';

const X = -424, Z = -643.8, TURN = 0; // the drum's middle
const R = 21.4; // the drum's radius
const LOW = 16.8, LOGGIA = 25.9, THIRD = 37.5, CONE = 64.5, TOP = 68.6; // storeys' tops
const STONE = shade(MARBLE, -0.07), TILE = '#b0583a';

// the gable over an opening at s: a pointed triangle w wide from y up to y + h, standing out at o
const gableAt = (kit, path, s, w, y, h, o) => wall(kit, path, [[s - w / 2, y], [s + w / 2, y], [s, y + h]], { o0: o, o1: o + 0.35, hex: MARBLE });

// a pinnacle standing at (s, o) on the path from y: a little shaft and its spire
function pinnacle(kit, path, s, o, y, h) {
  const p = path.at(s), x = p.x + o * p.tz, z = p.z - o * p.tx;
  kit.box(0.6, h * 0.55, 0.6, MARBLE, x, y + h * 0.275, z, 0, Math.atan2(-p.tz, p.tx));
  kit.add(new THREE.ConeGeometry(0.45, h * 0.45, 4), MARBLE, x, y + h * 0.775, z);
}

export function battistero() {
  const kit = new Kit();
  const ring = ellipsePath(R, R), L = ring.length;
  // the plinth and the steps, the solid drum inside the storeys
  kit.add(new THREE.CylinderGeometry(R + 1.4, R + 1.6, 0.5, 48), shade(MARBLE, -0.12), 0, 0.25, 0);
  kit.add(new THREE.CylinderGeometry(R + 0.8, R + 0.8, 0.5, 48), shade(MARBLE, -0.1), 0, 0.75, 0);
  kit.add(new THREE.CylinderGeometry(R - 0.05, R - 0.05, LOGGIA - 1, 48), MARBLE, 0, (LOGGIA + 1) / 2, 0);
  kit.add(new THREE.CylinderGeometry(R - 0.6, R - 0.6, THIRD - LOGGIA, 48), MARBLE, 0, (THIRD + LOGGIA) / 2, 0);
  // the ground storey: twenty blind arches with the grey bands behind them; a window in every
  // other one, an inlaid lozenge in the rest, and the doors east, north, west and south
  const n = 20, bay = L / n, doors = [0, 5, 10, 15]; // bay 0 is centred east (+x), and they run round to the south
  bands(kit, ring, 0, L, 1.5, LOW - 2.2, { step: 1.5 });
  blind(kit, ring, -bay / 2, L - bay / 2, 1, LOW - 0.9, n, {
    arch: 0.72, depth: 0.6,
    win: (i, c, w, top) => {
      if (doors.includes(i)) {
        const big = i === 0, dw = big ? 3.4 : 2.6, dh = big ? 7.6 : 6.4;
        panel(kit, ring, c - dw / 2 - 0.7, c + dw / 2 + 0.7, 1, dh + 1.8, STONE, 0, 0.7);
        panel(kit, ring, c - dw / 2, c + dw / 2, 1, dh, '#5a4430', 0.5, 0.3);
        if (big) for (const d of [-1, 1]) {
          const p = ring.at(c + d * (dw / 2 + 1.1));
          kit.add(new THREE.CylinderGeometry(0.4, 0.45, dh + 1.2, 10), shade(MARBLE, 0.03), p.x + 1.1 * p.tz, 1 + (dh + 1.2) / 2, p.z - 1.1 * p.tx);
        }
        wall(kit, ring, [[c - dw / 2 - 1, dh + 1.8], [c + dw / 2 + 1, dh + 1.8], [c, dh + 4.2]], { o0: 0, o1: 0.9, hex: MARBLE });
      } else if (i % 2) lancet(kit, ring, c, 1.2, top - 5, top - 1.4, { frame: STONE, glass: DARK, rim: 0.25, round: true, o: 0.05 });
      else wall(kit, ring, [[c, top - 4.6], [c + 1, top - 3.2], [c, top - 1.8], [c - 1, top - 3.2]], { o0: 0.05, o1: 0.12, hex: '#6f7d78' });
    },
  });
  for (let i = 0; i < n; i++) {
    const p = ring.at((i - 0.5) * bay), x = p.x + 0.75 * p.tz, z = p.z - 0.75 * p.tx;
    kit.add(new THREE.CylinderGeometry(0.42, 0.48, LOW - 2.4, 10), MARBLE, x, (LOW - 2.4) / 2 + 1, z);
    kit.box(1.1, 0.5, 1.1, STONE, x, LOW - 1.15, z);
  }
  strip(kit, ring, 0, L, LOW - 0.9, LOW, STONE, 0, 1.1);
  // the loggia of sixty arches, and the Gothic crown over it: twenty gables, a pinnacle between each
  loggia(kit, ring, 0, L, LOW, LOGGIA - 1.4, 60, { o: 0.9 });
  for (let i = 0; i < n; i++) {
    const c = (i + 0.5) * bay;
    gableAt(kit, ring, c, bay * 0.86, LOGGIA - 1.4, 4.4, 1.2);
    lancet(kit, ring, c, 0.7, LOGGIA - 0.6, LOGGIA + 1.2, { frame: STONE, glass: DARK, rim: 0.15, o: 1.55 });
    pinnacle(kit, ring, i * bay, 1.3, LOGGIA - 1.6, 6.2);
  }
  // the third storey: a window under a gable in every bay, a pinnacle between each
  const third = ellipsePath(R - 0.55, R - 0.55), b3 = third.length / n;
  strip(kit, third, 0, third.length, LOGGIA - 0.2, LOGGIA + 0.4, STONE, 0, 0.6);
  for (let i = 0; i < n; i++) {
    const c = (i + 0.5) * b3;
    lancet(kit, third, c, 1.6, LOGGIA + 3.6, THIRD - 3.2, { frame: STONE, glass: DARK, rim: 0.4, o: 0.05 });
    gableAt(kit, third, c, b3 * 0.7, THIRD - 2.6, 4.6, 0.1);
    pinnacle(kit, third, i * b3, 0.3, THIRD - 3, 6);
  }
  strip(kit, third, 0, third.length, THIRD - 0.7, THIRD, STONE, 0, 0.5);
  // the dome: red tiles to the west, lead to the east, and the ribs between its quarters
  const prof = Array.from({ length: 10 }, (_, k) => {
    const t = (k / 9) * (Math.PI / 2) * 0.68;
    return new THREE.Vector2((R - 1.4) * Math.cos(t), THIRD + 1 + 21 * Math.sin(t) * 0.86);
  });
  prof.unshift(new THREE.Vector2(R - 0.4, THIRD), new THREE.Vector2(R - 1.4, THIRD + 0.6));
  kit.add(new THREE.LatheGeometry(prof, 24, Math.PI, Math.PI), TILE);
  kit.add(new THREE.LatheGeometry(prof, 24, 0, Math.PI), LEAD);
  const top = prof.at(-1);
  for (let k = 0; k < 12; k++) {
    const t = (k / 12) * 2 * Math.PI, at = v => [v.x * Math.sin(t) * 1.01, v.y + 0.1, v.x * Math.cos(t) * 1.01];
    for (let j = 1; j + 1 < prof.length; j++) kit.rod(at(prof[j]), at(prof[j + 1]), 0.22, STONE, 4);
  }
  // the cone rising through it, ribbed, its little drum and the statue of St John
  kit.add(new THREE.CylinderGeometry(top.x, top.x + 0.3, 1, 24), STONE, 0, top.y + 0.2, 0);
  kit.add(new THREE.CylinderGeometry(4.7, top.x, CONE - top.y, 24, 1, true), LEAD, 0, (top.y + CONE) / 2, 0);
  for (let k = 0; k < 16; k++) {
    const t = (k / 16) * 2 * Math.PI;
    kit.rod([top.x * Math.cos(t), top.y, top.x * Math.sin(t)], [4.75 * Math.cos(t), CONE, 4.75 * Math.sin(t)], 0.16, STONE, 4);
  }
  kit.add(new THREE.CylinderGeometry(5, 5, 0.5, 24), STONE, 0, CONE + 0.25, 0);
  kit.add(new THREE.CylinderGeometry(2.4, 3, 1.6, 12), MARBLE, 0, CONE + 1.3, 0);
  kit.add(new THREE.CylinderGeometry(0.45, 0.6, 2.4, 6), '#8a7a5a', 0, CONE + 3.3, 0);
  kit.add(new THREE.SphereGeometry(0.42, 8, 6), '#8a7a5a', 0, TOP - 0.2, 0);
  return kit.mesh(kitMat(0.85));
}

// it stands in for the map's pieces of it (area), and riders bump into its round foot
export const BATTISTERO = [{
  id: 'battistero', name: 'Battistero di Pisa', x: X, z: Z, turn: TURN, reach: 140,
  area: [onMap(X, Z, TURN, ngon(R + 4, 16))], foot: [onMap(X, Z, TURN, ngon(R + 1.6, 16))],
  make: battistero,
}];
