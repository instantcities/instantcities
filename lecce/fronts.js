// Lecce's big baroque fronts drawn by hand, each standing in for the box the map has on its outline (see
// js/fronts.js and Ghent's ghent/fronts.js for the shape). Each { id, name, at: the middle of its
// outline in map.js (game metres), line: [x0, z0, x1, z1] the stretch of wall the front goes on (the
// church outlines have it cut up in short edges), faces: the way it looks (degrees, 0 east, 90 south),
// gable, wall, roof, eaves, top, draw(g, w, h, eaves) }. The fronts are in pietra leccese, the honey-coloured
// limestone, carved so thick it looks like lace: drawn from photos as a reference, in flat paint.
// (Santa Croce's and the Duomo's are modelled in 3D now: santa-croce.js, duomo.js.)
import { ashlar, stringCourse, roundArch, shade } from '../core/js/facades.js';

const FLAT = 0xcfc2a8;
const STONE = '#e6d3a4';

export const FRONTS = [
  // Palazzo dei Celestini (the old convent of Santa Croce, now the Prefettura), the long front on the Via Umberto I
  // just north of the basilica: plain, with a rich band of windows with balconies
  { id: 'celestini', name: 'Palazzo dei Celestini', at: [486.7, -186.7], line: [441.9, -139, 437.9, -197], faces: 180, gable: 'flat', wall: 'stone:#dcc79a', roof: FLAT, eaves: 13, top: 14.2, px: 16, draw: celestini },
];

// a ground of dressed stone
function ground(g, w, h, hex = STONE) {
  ashlar(g, -w / 2, 0, w / 2, h, hex, { course: 0.55, vary: 0.035, seed: 11 });
}

// a baluster rail: a bar, a row of bottles, a bar on top
function rail(g, x0, x1, y0, h) {
  g.fillStyle = shade(STONE, 0.12);
  g.fillRect(x0, y0, x1 - x0, 0.2);
  g.fillRect(x0, y0 + h - 0.22, x1 - x0, 0.22);
  for (let x = x0 + 0.3; x < x1; x += 0.5) {
    g.fillStyle = shade(STONE, -0.35);
    g.fillRect(x - 0.1, y0 + 0.2, 0.2, h - 0.42);
    g.fillStyle = shade(STONE, 0.05);
    g.beginPath(); g.arc(x, y0 + h * 0.5, 0.13, 0, Math.PI * 2); g.fill();
  }
}

// a window with a frame, a lintel and a triangular or curved pediment, or an arched one
function window(g, cx, y0, w, h, { arch = false, pediment = 'tri', glass = '#2c3540' } = {}) {
  g.fillStyle = shade(STONE, -0.35);
  g.fillRect(cx - w / 2 - 0.35, y0 - 0.3, w + 0.7, h + 0.6);
  if (arch) roundArch(g, cx, y0, w, h, glass);
  else { g.fillStyle = glass; g.fillRect(cx - w / 2, y0, w, h); }
  g.fillStyle = shade(glass, 0.2);
  g.fillRect(cx - 0.05, y0, 0.1, h - (arch ? w / 2 : 0));
  g.fillStyle = shade(STONE, 0.1);
  g.fillRect(cx - w / 2 - 0.55, y0 + h + 0.3, w + 1.1, 0.3);
  if (pediment === 'tri') {
    g.fillStyle = shade(STONE, -0.12);
    g.beginPath(); g.moveTo(cx - w / 2 - 0.6, y0 + h + 0.6); g.lineTo(cx + w / 2 + 0.6, y0 + h + 0.6); g.lineTo(cx, y0 + h + 0.6 + w * 0.4); g.closePath(); g.fill();
  } else if (pediment === 'curve') {
    g.fillStyle = shade(STONE, -0.12);
    g.beginPath(); g.arc(cx, y0 + h + 0.6, w / 2 + 0.6, Math.PI, 0, true); g.closePath(); g.fill();
  }
}

// the Celestini: three storeys of windows, the middle one with a balcony and a pediment, a grand door
function celestini(g, w, h) {
  ground(g, w, h, '#e0cb9c');
  g.fillStyle = shade(STONE, -0.2);
  g.fillRect(-w / 2, 0, w, 0.5);
  const n = Math.max(3, Math.round(w / 4.4)), step = w / n;
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + step * (k + 0.5);
    if (k === Math.floor(n / 2)) {
      roundArch(g, x, 0, 3.0, 5.2, shade(STONE, -0.4));
      roundArch(g, x, 0, 2.5, 4.9, '#3a2b20');
    } else window(g, x, 0.9, 1.4, 3.2, { arch: true, pediment: 'none' });
    window(g, x, 5.4, 1.4, 2.6, { pediment: k % 2 ? 'tri' : 'curve' });
    window(g, x, 9.6, 1.3, 2.2, { pediment: 'none' });
    g.fillStyle = shade(STONE, 0.1);
    g.fillRect(x - 1.1, 4.7, 2.2, 0.25); // a balcony shelf under the middle windows
  }
  stringCourse(g, -w / 2, w / 2, 4.6, STONE, 0.4);
  stringCourse(g, -w / 2, w / 2, 8.9, STONE, 0.4);
  stringCourse(g, -w / 2, w / 2, 12.2, STONE, 0.7);
  rail(g, -w / 2, w / 2, 12.9, 1.2);
}

