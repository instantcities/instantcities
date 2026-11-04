// The Uffizi (Vasari, 1560-81) between Piazza della Signoria and the Arno, modelled by hand in place
// of the map's block of it, from its measurements and photos, in game metres (the real ones times
// 1.25), on the map's outline: two long wings either side of the narrow Piazzale degli Uffizi,
// joined at the river by the short wing that opens onto the Arno. White plaster and grey pietra
// serena:
//   the portico along the courtyard, Doric columns between piers, the piers' niches with the famous
//     Tuscans in them
//   over it the mezzanine's small windows, the piano nobile's tall ones under pediments, triangular
//     and round in turn, the second floor's, and the top floor's long gallery of windows between
//     pilasters under the deep eaves
//   at the river end the serliana: the great arch between two square openings, two storeys high
//   the other sides plainer, with the same rows of windows, and the roofs of red tiles
// It stands on its own, so riders bump into it (the column line of the portico along the courtyard).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, column, archRing, onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { GLASS, TILE, sides, panel, prism, gable } from './marble.js';

const X = 213.2, Z = 311.9, TURN = 1.242; // the outline's middle, and the courtyard turned from east (local +x, to the piazza)
const PORT = 9, MEZZ = 13.6, NOB = 22, SEC = 27.5, TOP = 33.5, RIDGE = 39; // the storeys' tops
const COURT = [-0.2, 16.5]; // the courtyard's sides (v)
const BAY = 3.95; // the bays along the courtyard
const PLASTER = '#e9e1cd', SERENA = '#8b8c86', DARK = shade(SERENA, -0.2), OPEN = '#3b3e40';

// the map's outline, in the model's metres
const FOOT = [[-86.3, -16.4], [-96.1, -16.4], [-95.8, 8.6], [-95.5, 23.7], [-95.1, 49.8], [-56.6, 55.9], [-30.2, 59.8], [-18.9, 57.4], [46, 57.6], [58.9, 57.9], [58.5, 61.8], [78.8, 62.5], [79.3, 49.7], [93.6, 51], [94.4, 42.6], [95.7, 25.6], [96, 19.9], [96.1, 15.3], [93.2, 15.3], [7.5, 16.3], [-81, 17.1], [-81.4, 8.5], [-81.4, -0.2], [13.9, -0.3], [90.5, -0.1], [90.5, -1.7], [92.9, -1.9], [93.8, -16.5], [91.8, -16.6], [82.5, -16.4], [70.4, -15.5], [73.2, -31.6], [70.5, -31.9], [56.7, -35.5], [45.2, -14.1], [36.7, -14.1], [37.4, -27.1], [31.9, -26.9], [15, -26.9], [12.8, -26.9], [11.1, -26.7], [-3.3, -26.3], [-3.3, -29.2], [-8.6, -29.3], [-12.4, -29.4], [-12.4, -33.7], [-12.5, -37.9], [-18.5, -37.2], [-18.8, -41.1], [-55.3, -41.4], [-52.4, -52.2], [-51, -57.6], [-72, -61.4], [-77.8, -62.5], [-78.7, -55], [-79.9, -44.9]];

// which side of the building a path is: 'court' along the courtyard, 'river' to the Arno, or 'plain'
function kind(path) {
  const m = path.at(path.length / 2), nu = m.tz, nv = -m.tx;
  if (m.x > -82 && m.x < 92 && m.z > COURT[0] - 1.5 && m.z < COURT[1] + 1.5 && Math.abs(nv) > 0.95) return 'court';
  if (m.x < -80 && m.x > -82 && nu > 0.95) return 'court'; // the courtyard's end against the river wing
  if (m.x < -90 && nu < -0.95) return 'river';
  return 'plain';
}

// a window from s - w/2 to s + w/2, y0 to y1, in its frame of pietra serena, with a pediment or not
function window(kit, path, s, w, y0, y1, o, pediment) {
  panel(kit, path, s - w / 2 - 0.4, s + w / 2 + 0.4, y0 - 0.4, y1 + 0.3, SERENA, o, 0.12);
  panel(kit, path, s - w / 2, s + w / 2, y0, y1, GLASS, o, 0.2);
  panel(kit, path, s - w / 2 - 0.7, s + w / 2 + 0.7, y0 - 0.7, y0 - 0.3, SERENA, o, 0.35);
  if (pediment === 'tri') wall(kit, path, [[s - w / 2 - 0.9, y1 + 0.3], [s + w / 2 + 0.9, y1 + 0.3], [s, y1 + 1.6]], { o0: o, o1: o + 0.4, hex: SERENA });
  if (pediment === 'round') {
    const a = archRing(s, w + 1.8, y1 + 0.3, y1 + 1.5, 8).slice(2);
    wall(kit, path, [[s - w / 2 - 0.9, y1 + 0.3], [s + w / 2 + 0.9, y1 + 0.3], ...a.slice(1, -1)], { o0: o, o1: o + 0.4, hex: SERENA });
  }
}

// the storeys of a side, s0 to s1, over its ground floor: windows to every bay, the cornices
function storeys(kit, path, s0, s1, court) {
  const n = Math.max(1, Math.round((s1 - s0) / BAY)), step = (s1 - s0) / n;
  for (let k = 0; k < n; k++) {
    const s = s0 + (k + 0.5) * step;
    window(kit, path, s, 0.9, PORT + 1.2, MEZZ - 1, 0, null);
    window(kit, path, s, 1.5, MEZZ + 1.8, NOB - 2.4, 0, k % 2 ? 'round' : 'tri');
    window(kit, path, s, 1.2, NOB + 1.2, SEC - 1.2, 0, null);
    if (court) {
      // the long gallery under the roof: glass between pilasters
      panel(kit, path, s - step / 2 + 0.3, s + step / 2 - 0.3, SEC + 1, TOP - 1.2, shade(GLASS, 0.15), 0, 0.15);
      panel(kit, path, s - step / 2 - 0.3, s - step / 2 + 0.3, SEC + 0.4, TOP - 0.8, SERENA, 0, 0.35);
    } else window(kit, path, s, 1, SEC + 1.4, TOP - 1.8, 0, null);
  }
  for (const [y, h, d] of [[PORT, 0.7, 0.5], [MEZZ, 0.6, 0.35], [NOB, 0.5, 0.3], [SEC, 0.7, 0.45]]) panel(kit, path, s0, s1, y - h, y, SERENA, 0, d);
  // the eaves, deep over the courtyard
  panel(kit, path, s0, s1, TOP - 0.8, TOP, PLASTER, 0, court ? 2.2 : 0.9);
  panel(kit, path, s0, s1, TOP - 0.25, TOP + 0.15, DARK, court ? 2.2 : 0.9, 0.2);
}

export function uffizi() {
  const kit = new Kit();
  for (const path of sides(FOOT)) {
    const len = path.length, what = kind(path);
    if (what === 'court') {
      // the portico: the back wall set in, the ceiling, the columns and piers on the courtyard's line
      wall(kit, path, [[0, 0], [len, 0], [len, PORT], [0, PORT]], { o0: -6.6, o1: -6, hex: PLASTER });
      panel(kit, path, 0, len, PORT - 0.6, PORT, shade(PLASTER, -0.1), -6, 6);
      wall(kit, path, [[0, PORT], [len, PORT], [len, TOP], [0, TOP]], { o0: -0.6, o1: 0, hex: PLASTER });
      const n = Math.max(1, Math.round(len / BAY)), step = len / n;
      for (let k = 0; k <= n; k++) {
        const s = Math.min(len - 0.7, Math.max(0.7, k * step));
        if (k % 3 === 0) {
          // a pier, with its niche and statue
          const p = path.at(s), turn = Math.atan2(-p.tz, p.tx);
          kit.box(2.2, PORT - 0.6, 1.4, SERENA, p.x - 0.7 * p.tz, (PORT - 0.6) / 2, p.z + 0.7 * p.tx, 0, turn);
          wall(kit, path, archRing(s, 1.3, 1.6, 6.2, 8), { o0: 0, o1: 0.05, hex: DARK });
          kit.add(new THREE.CylinderGeometry(0.32, 0.45, 3.3, 6), '#e4dfd4', p.x + 0.2 * p.tz, 3.3, p.z - 0.2 * p.tx);
        } else column(kit, path, s, -0.7, 0, PORT - 0.6, 0.55, SERENA, 'tuscan');
        // the doors in the back wall, every third bay
        if (k % 3 === 1 && k < n) panel(kit, path, s + step / 2 - 1.2, s + step / 2 + 1.2, 0, 5.4, '#4a3a2a', -6, 0.12);
      }
      panel(kit, path, 0, len, PORT - 1.4, PORT - 0.6, SERENA, -0.3, 0.6); // the architrave over the columns
      storeys(kit, path, 0, len, true);
    } else {
      wall(kit, path, [[0, 0], [len, 0], [len, TOP], [0, TOP]], { o0: -0.6, o1: 0, hex: PLASTER });
      if (len < 2.5) continue;
      panel(kit, path, 0, len, 0, 1, SERENA, 0, 0.3);
      const n = Math.max(1, Math.round(len / BAY)), step = len / n;
      if (what === 'river') {
        // the serliana over the courtyard's middle, the windows either side of it
        const p0 = path.at(0), s = (((COURT[0] + COURT[1]) / 2) - p0.z) / p0.tz;
        for (let k = 0; k < n; k++) {
          const q = (k + 0.5) * step;
          if (s > 0 && Math.abs(q - s) < 9) continue;
          window(kit, path, q, 1.4, 2.6, PORT - 1.6, 0, null);
        }
        if (s > 0 && s < len) {
          panel(kit, path, s - 9, s + 9, 0, NOB + 1, shade(PLASTER, -0.03), 0, 0.3);
          for (const d of [-9, 8.4]) panel(kit, path, s + d, s + d + 0.6, 0, NOB + 1, SERENA, 0.3, 0.12);
          wall(kit, path, archRing(s, 7.4, 0, NOB - 1, 12), { o0: 0, o1: 0.4, hex: OPEN });
          for (const d of [-1, 1]) {
            panel(kit, path, s + d * 6.2 - 1.8, s + d * 6.2 + 1.8, 0, PORT + 6, OPEN, 0, 0.4);
            for (const e of [-1, 1]) column(kit, path, s + d * (3.7 + 0.45) + e * 0.01, 0.5, 0, PORT + 6.3, 0.4, '#a3a49e', 'tuscan');
          }
          panel(kit, path, s - 9.6, s + 9.6, PORT + 6.2, PORT + 7, SERENA, 0, 0.7);
          // the window over it, on the piano nobile, with its balcony
          window(kit, path, s, 2.2, NOB + 1, SEC - 0.8, 0, 'round');
          panel(kit, path, s - 2.4, s + 2.4, NOB, NOB + 0.9, SERENA, 0, 1.2);
        }
      } else for (let k = 0; k < n; k++) window(kit, path, (k + 0.5) * step, 1.2, 2.6, PORT - 1.6, 0, null);
      storeys(kit, path, 0, len, false);
    }
  }
  // the roofs: flat tiles over the whole, and pitched roofs over the wings along the courtyard and
  // over the wing on the river
  prism(kit, FOOT, TOP - 0.2, TOP + 0.3, shade(TILE, -0.15));
  gable(kit, 7, TOP + 0.3, COURT[1] + 10, 176, 20.6, RIDGE - TOP - 0.3, TILE);
  gable(kit, 5, TOP + 0.3, COURT[0] - 10.5, 172, 21.4, RIDGE - TOP - 0.3, TILE);
  gable(kit, -88.6, TOP + 0.3, 16.6, 66, 15.4, RIDGE - TOP - 2, TILE, Math.PI / 2);
  return kit.mesh(kitMat(0.9));
}

// it stands in for the map's block of it (area), and riders bump into its outline (foot)
const RING = onMap(X, Z, TURN, FOOT);
export const UFFIZI = [{
  id: 'uffizi', name: 'Galleria degli Uffizi', x: X, z: Z, turn: TURN, reach: 160, area: [RING], foot: [RING],
  make: uffizi,
}];
