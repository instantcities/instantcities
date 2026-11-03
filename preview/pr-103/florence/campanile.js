// Giotto's Campanile (1334-59) beside the Duomo, modelled by hand in place of the map's pieces of it,
// from its measurements and photos, in game metres (the real ones times 1.25), on the map's outline:
// a shaft 14.45 m square, 84.7 m high. White, green and pink marble, in its tiers:
//   an octagonal buttress up each corner, the whole height, banded like the walls
//   the two lower tiers with their rows of reliefs, hexagons below and lozenges above
//   the tier of niches with their statues
//   two tiers each with a pair of tall two-light windows to a face, under their gables
//   the tall top tier with one great three-light window to a face
//   the top cornice standing out on its brackets, and the low parapet over it
// It stands on its own, so riders bump into it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { square, wall, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { MARBLE, VERDE, ROSA, panel, inlay, lancet, shell } from './marble.js';

const X = 235.8, Z = -297.5, TURN = -0.0188; // its middle, and its faces turned from east (local +x)
const H = 8.1, B = 1.1; // half its width between the buttresses, and how far they stand out
// the tiers' tops: the hexagons, the lozenges, the niches, the two tiers of windows, the great one
const T = [1, 17.5, 30, 42.5, 56, 69.5, 100.4], TOP = 105.9;
const STONE = shade(MARBLE, -0.06);

export function campanile() {
  const kit = new Kit();
  kit.box(2 * H + 1.6, 1, 2 * H + 1.6, shade(MARBLE, -0.12), 0, 0.5, 0);
  kit.box(2 * H - 0.6, TOP - 1, 2 * H - 0.6, MARBLE, 0, (TOP + 1) / 2, 0);
  square(H, H, 0).forEach(path => {
    const len = path.length, c = len / 2;
    wall(kit, path, [[0, 1], [len, 1], [len, T[6]], [0, T[6]]], { o0: -0.6, o1: 0, hex: MARBLE });
    // the bands between the tiers
    for (let k = 1; k < 6; k++) {
      panel(kit, path, 0, len, T[k] - 0.6, T[k] + 0.6, STONE, 0, 0.5);
      panel(kit, path, 0, len, T[k] - 1.4, T[k] - 0.6, VERDE, 0, 0.2);
    }
    // the reliefs: seven hexagons a face, then seven lozenges, in their frames
    inlay(kit, path, 1, len - 1, T[0] + 0.5, T[1] - 2, { cols: 7, rows: 2, w: 0.4, hex: VERDE });
    for (let k = 0; k < 7; k++) {
      const s = 1 + (len - 2) * ((k + 0.5) / 7), y = T[0] + 0.5 + (T[1] - 2.5 - T[0]) * 0.75, r = 0.85;
      wall(kit, path, Array.from({ length: 6 }, (_, j) => [s + r * Math.cos((j / 6) * 2 * Math.PI), y + r * Math.sin((j / 6) * 2 * Math.PI)]), { o0: 0, o1: 0.2, hex: ROSA });
      const y2 = (T[1] + T[2]) / 2 - 0.4;
      wall(kit, path, [[s, y2 - 1.6], [s + 0.85, y2], [s, y2 + 1.6], [s - 0.85, y2]], { o0: 0, o1: 0.2, hex: '#4c6f99' });
    }
    inlay(kit, path, 1, len - 1, T[1] + 0.6, T[2] - 1.4, { cols: 7, rows: 1, w: 0.35, hex: ROSA });
    // the niches, four a face, with their prophets and sibyls
    inlay(kit, path, 1, len - 1, T[2] + 0.6, T[3] - 1.4, { cols: 4, rows: 1, w: 0.4, hex: VERDE });
    for (let k = 0; k < 4; k++) {
      const s = 1 + (len - 2) * ((k + 0.5) / 4);
      lancet(kit, path, s, 1.8, T[2] + 1.6, T[3] - 2.4, { frame: ROSA, glass: shade(MARBLE, -0.32), rim: 0.35, r: 0.9 });
      const p = path.at(s);
      kit.add(new THREE.CylinderGeometry(0.42, 0.55, 3.8, 6), shade(MARBLE, 0.04), p.x + 0.25 * p.tz, T[2] + 3.6, p.z - 0.25 * p.tx);
    }
    // the two tiers with two two-light windows a face, and the great three-light window
    for (const k of [3, 4]) {
      inlay(kit, path, 1, len - 1, T[k] + 0.6, T[k + 1] - 1.4, { cols: 2, rows: 2, w: 0.4, hex: VERDE });
      for (const s of [len * 0.29, len * 0.71]) {
        const y0 = T[k] + 2.4, y1 = T[k + 1] - 3.6;
        lancet(kit, path, s, 2.6, y0, y1, { frame: ROSA, rim: 0.4, r: 0.9, o: 0.1 });
        panel(kit, path, s - 0.15, s + 0.15, y0, y1 - 1.8, MARBLE, 0.3, 0.15);
        wall(kit, path, [[s - 2.2, y1 + 0.2], [s + 2.2, y1 + 0.2], [s, y1 + 3]], { o0: 0, o1: 0.3, hex: MARBLE }); // its gable
      }
    }
    inlay(kit, path, 1, len - 1, T[5] + 0.6, T[6] - 1, { cols: 3, rows: 4, w: 0.45, hex: VERDE });
    const y0 = T[5] + 3, y1 = T[6] - 6;
    panel(kit, path, c - 4.6, c + 4.6, y0 - 1.4, y1 + 1, MARBLE, 0.1, 0.15);
    lancet(kit, path, c, 7, y0, y1, { frame: ROSA, rim: 0.6, r: 0.85, o: 0.25 });
    for (const d of [-1.2, 1.2]) panel(kit, path, c + d - 0.15, c + d + 0.15, y0, y1 - 4, MARBLE, 0.45, 0.15);
    wall(kit, path, [[c - 5.4, y1 + 0.8], [c + 5.4, y1 + 0.8], [c, y1 + 5.4]], { o0: 0.1, o1: 0.5, hex: MARBLE });
    lancet(kit, path, c, 1.6, y1 + 1.6, y1 + 3.6, { frame: ROSA, glass: '#4c6f99', rim: 0.2, round: true, o: 0.5 });
    // the brackets under the cornice
    for (let s = 0.8; s < len; s += 1.6) panel(kit, path, s - 0.3, s + 0.3, T[6] + 0.2, T[6] + 1.6, STONE, 0, 1);
  });
  // the octagonal buttresses at the corners, banded, with their own little cornices
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const cx = x * (H + 0.2), cz = z * (H + 0.2), opts = { cx, cz };
    shell(kit, [[B, 1], [B, T[6]]], MARBLE, opts);
    for (let k = 1; k < 6; k++) {
      shell(kit, [[B + 0.25, T[k] - 0.6], [B + 0.25, T[k] + 0.6]], STONE, opts);
      shell(kit, [[B + 0.1, T[k] - 1.4], [B + 0.1, T[k] - 0.6]], VERDE, opts);
    }
  }
  // the cornice, the parapet of little arches, the roof
  kit.box(2 * H + 4.4, 1.6, 2 * H + 4.4, STONE, 0, T[6] + 2.4, 0);
  kit.box(2 * H + 4, 0.5, 2 * H + 4, VERDE, 0, T[6] + 1.4, 0);
  kit.box(2 * H + 3.6, TOP - T[6] - 3.2, 2 * H + 3.6, MARBLE, 0, (TOP + T[6] + 3.2) / 2, 0);
  square(H + 1.8, H + 1.8, 0).forEach(path => {
    for (let s = 0.4; s < path.length - 0.4; s += 1.25) panel(kit, path, s, s + 0.7, T[6] + 3.6, TOP - 0.6, VERDE, 0, 0.12);
  });
  kit.box(2 * H + 4, 0.6, 2 * H + 4, STONE, 0, TOP - 0.3, 0);
  kit.box(2 * H, 0.4, 2 * H, '#8f8a80', 0, TOP + 0.2, 0);
  return kit.mesh(kitMat(0.85));
}

// it stands in for the map's pieces of the tower (area), and riders bump into its square (foot)
const FOOT = onMap(X, Z, TURN, rect(-H - 1, -H - 1, H + 1, H + 1));
export const CAMPANILE = [{
  id: 'campanile-di-giotto', name: 'Campanile di Giotto', x: X, z: Z, turn: TURN, reach: 160, area: [FOOT], foot: [FOOT],
  make: campanile,
}];
