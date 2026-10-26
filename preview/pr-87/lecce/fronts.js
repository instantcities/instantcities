// Lecce's big baroque fronts drawn by hand, each standing in for the box the map has on its outline (see
// js/fronts.js and Ghent's ghent/fronts.js for the shape). Each { id, name, at: the middle of its
// outline in map.js (game metres), line: [x0, z0, x1, z1] the stretch of wall the front goes on (the
// church outlines have it cut up in short edges), faces: the way it looks (degrees, 0 east, 90 south),
// gable, wall, roof, eaves, top, draw(g, w, h, eaves) }. The fronts are in pietra leccese, the honey-coloured
// limestone, carved so thick it looks like lace: drawn from photos as a reference, in flat paint.
import { ashlar, pilaster, stringCourse, roundArch, rose, shade } from '../core/js/facades.js';

const TILES = 0xb0603f, FLAT = 0xcfc2a8;
const STONE = '#e6d3a4', LIGHT = '#efe1bb', DARK = '#3a2f24';

export const FRONTS = [
  // Basilica di Santa Croce (1549-1695, Zimbalo, Riccardi): the front of the baroque, two orders of
  // columns, a long balcony on carved animals and figures, a great rose window with a frame of carving
  // ... on the west end, towards the Via Umberto I
  { id: 'santa-croce', name: 'Basilica di Santa Croce', at: [483.2, -117.1], line: [446.7, -103.8, 444.9, -124.8], faces: 180, gable: 'flat', wall: 'stone:#dcc79a', roof: TILES, eaves: 20, top: 26.8, px: 24, draw: santaCroce },
  // Palazzo dei Celestini (the old convent of Santa Croce, now the Prefettura), the long front on the Via Umberto I
  // just north of the basilica: plain, with a rich band of windows with balconies
  { id: 'celestini', name: 'Palazzo dei Celestini', at: [486.7, -186.7], line: [441.9, -139, 437.9, -197], faces: 180, gable: 'flat', wall: 'stone:#dcc79a', roof: FLAT, eaves: 13, top: 14.2, px: 16, draw: celestini },
  // The Duomo (Santa Maria Assunta, front of 1659-1670 by Giuseppe Zimbalo), the side towards its square,
  // closed on three sides: a high front with a big portal, statues of the saints and a cornice round the top
  { id: 'duomo', name: 'Duomo di Lecce', at: [68.3, 284.5], line: [27.3, 286.6, 35.2, 315.2], faces: 165, gable: 'flat', wall: 'stone:#dcc79a', roof: TILES, eaves: 17, top: 24.2, px: 22, draw: duomo },
];

// a ground of dressed stone, then a carved field: dots like the lace of the carving
function ground(g, w, h, hex = STONE) {
  ashlar(g, -w / 2, 0, w / 2, h, hex, { course: 0.55, vary: 0.035, seed: 11 });
}

function carve(g, x0, y0, x1, y1, step = 0.32) {
  g.fillStyle = shade(STONE, -0.3);
  for (let y = y0; y < y1; y += step) for (let x = x0 + ((y / step) % 2 ? step / 2 : 0); x < x1; x += step) { g.beginPath(); g.arc(x, y, step * 0.2, 0, Math.PI * 2); g.fill(); }
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

// a statue in a niche (a pale figure on a bracket), in a dark round-headed recess
function statue(g, cx, y0, w, h) {
  roundArch(g, cx, y0, w, h, shade(STONE, -0.5));
  g.fillStyle = shade(STONE, 0.18);
  g.fillRect(cx - w * 0.4, y0, w * 0.8, 0.2);
  const fw = w * 0.34;
  g.beginPath(); g.moveTo(cx - fw, y0 + 0.2); g.lineTo(cx - fw * 0.5, y0 + h * 0.62); g.lineTo(cx + fw * 0.5, y0 + h * 0.62); g.lineTo(cx + fw, y0 + 0.2); g.fill();
  g.beginPath(); g.arc(cx, y0 + h * 0.7, fw * 0.45, 0, Math.PI * 2); g.fill();
}

// a column: base, a lit and a shaded side, a capital; with a plinth
function column(g, x, y0, y1, w) {
  g.fillStyle = shade(STONE, -0.3);
  g.fillRect(x - w * 0.85, y0, w * 1.7, 0.9);
  pilaster(g, x, y0 + 0.9, y1, w, '#efe1bb');
  g.fillStyle = shade(STONE, -0.4);
  g.fillRect(x - w * 0.55, y0 + 0.9, 0.08, y1 - y0 - 1.3);
}

// the carved console figures under a balcony: a head and a body, leaning out
function figures(g, x0, x1, y0, y1, step) {
  g.fillStyle = shade(STONE, -0.3);
  for (let x = x0; x <= x1 + 0.01; x += step) {
    g.beginPath(); g.moveTo(x - 0.28, y1); g.lineTo(x + 0.28, y1); g.lineTo(x + 0.18, y0 + 0.5); g.lineTo(x, y0); g.lineTo(x - 0.18, y0 + 0.5); g.closePath(); g.fill();
    g.fillStyle = shade(STONE, -0.45);
    g.beginPath(); g.arc(x, y1 - 0.45, 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = shade(STONE, -0.3);
  }
}

// a scroll: a spiral of arcs, the baroque volute on the side of an upper order
function volute(g, cx, cy, r, dir) {
  g.strokeStyle = shade(STONE, -0.45);
  g.lineWidth = 0.28;
  g.beginPath();
  for (let a = 0; a < Math.PI * 3; a += 0.2) {
    const rr = r * (1 - a / (Math.PI * 3.4)), t = dir * a;
    g.lineTo(cx + Math.cos(t) * rr, cy + Math.sin(t) * rr);
  }
  g.stroke();
}

// Santa Croce: 21 m wide, 26.8 m tall
function santaCroce(g, w, h) {
  ground(g, w, h);
  // the lower order: columns each side of three doors, a big portal in the middle
  g.fillStyle = shade(STONE, -0.2);
  g.fillRect(-w / 2, 0, w, 0.45);
  for (const x of [-9.9, -5.6, -3.4, 3.4, 5.6, 9.9]) column(g, x, 0, 10.1, 0.95);
  for (const s of [-1, 1]) {
    statue(g, s * 4.5, 2.2, 1.5, 4.8); // a niche between each pair of columns
    roundArch(g, s * 7.75, 0, 2.0, 4.6, shade(STONE, -0.4)); // the side doors, narrow, with a window over
    roundArch(g, s * 7.75, 0, 1.5, 4.3, '#3a2b20');
    window(g, s * 7.75, 5.9, 1.4, 2.6, { pediment: 'curve' });
  }
  g.fillStyle = shade(STONE, -0.4); // the main portal: a dark arch under a broken pediment
  roundArch(g, 0, 0, 3.7, 6.6, shade(STONE, -0.4));
  roundArch(g, 0, 0, 3.1, 6.2, '#3a2b20');
  g.fillStyle = shade(STONE, -0.12);
  g.beginPath(); g.moveTo(-2.4, 7.2); g.lineTo(-0.4, 8.6); g.lineTo(-0.4, 7.9); g.lineTo(-2.4, 7.2); g.fill();
  g.beginPath(); g.moveTo(2.4, 7.2); g.lineTo(0.4, 8.6); g.lineTo(0.4, 7.9); g.lineTo(2.4, 7.2); g.fill();
  carve(g, -2.4, 7.3, 2.4, 9.6, 0.35);
  // its entablature, and under the balcony the carved animals and figures that hold it up
  stringCourse(g, -w / 2, w / 2, 10.1, STONE, 0.7);
  g.fillStyle = shade(STONE, -0.12);
  g.fillRect(-w / 2, 10.1, w, 0.0);
  figures(g, -9.9, 9.9, 10.2, 11.5, 1.1);
  g.fillStyle = shade(STONE, -0.3);
  g.fillRect(-w / 2, 11.5, w, 0.7); // the balcony slab
  g.fillStyle = shade(STONE, 0.15);
  g.fillRect(-w / 2, 12.2, w, 0.2);
  rail(g, -w / 2, w / 2, 12.4, 1.3);
  // the upper order: four columns and two outer ones, the rose window in a carved frame
  for (const x of [-9.9, -6.2, 6.2, 9.9]) column(g, x, 13.7, 23.2, 0.85);
  for (const x of [-4.3, 4.3]) column(g, x, 13.7, 23.2, 0.7);
  carve(g, -4.0, 14.0, 4.0, 23.0, 0.36);
  g.fillStyle = shade(STONE, -0.12);
  g.fillRect(-3.7, 14.3, 7.4, 8.4);
  rose(g, 0, 18.4, 2.7, { stone: '#d7bf8e', glass: '#28304a' });
  g.strokeStyle = shade(STONE, -0.45); // the frame: rings of carving
  g.lineWidth = 0.18;
  for (const rr of [3.4, 3.9]) { g.beginPath(); g.arc(0, 18.4, rr, 0, Math.PI * 2); g.stroke(); }
  carve(g, -3.7, 14.3, -2.8, 22.7, 0.28);
  carve(g, 2.8, 14.3, 3.7, 22.7, 0.28);
  g.fillStyle = shade(STONE, -0.2); // a coat of arms over the rose, in a shell
  g.beginPath(); g.arc(0, 22.0, 0.7, Math.PI, 0, true); g.fill();
  for (const s of [-1, 1]) {
    window(g, s * 8.05, 17.2, 1.5, 4.0, { arch: true, pediment: 'curve' });
    statue(g, s * 8.05, 21.0, 1.2, 1.9);
    volute(g, s * 10.35, 14.5, 0.9, -s);
  }
  // the cornice, the top balustrade with a statue over each column and the pediment's pedestal
  stringCourse(g, -w / 2, w / 2, 23.4, STONE, 0.9);
  g.fillStyle = shade(STONE, -0.25);
  g.fillRect(-w / 2, 23.0, w, 0.5);
  rail(g, -w / 2, w / 2, 24.4, 1.0);
  for (const x of [-9.9, -6.2, -4.3, 4.3, 6.2, 9.9]) {
    g.fillStyle = shade(STONE, -0.15);
    g.fillRect(x - 0.35, 24.4, 0.7, 1.4);
    g.beginPath(); g.arc(x, 26.1, 0.35, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = shade(STONE, -0.2);
  g.fillRect(-1.0, 24.4, 2.0, 1.4);
  g.beginPath(); g.moveTo(-1.2, 25.8); g.lineTo(1.2, 25.8); g.lineTo(0, 26.7); g.fill();
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

// the Duomo: 30 m wide; the central portal and three statues, the tall carved upper part
function duomo(g, w, h) {
  ground(g, w, h);
  g.fillStyle = shade(STONE, -0.2);
  g.fillRect(-w / 2, 0, w, 0.5);
  for (const x of [-12.8, -8, -4.3, 4.3, 8, 12.8]) column(g, x, 0, 9.4, 0.95);
  for (const s of [-1, 1]) {
    window(g, s * 6.1, 3.0, 1.5, 3.6, { arch: true, pediment: 'curve' });
    statue(g, s * 10.4, 2.2, 2.0, 5.4);
  }
  roundArch(g, 0, 0, 4.2, 7.2, shade(STONE, -0.4));
  roundArch(g, 0, 0, 3.5, 6.8, '#3a2b20');
  carve(g, -2.1, 7.5, 2.1, 9.2, 0.3);
  stringCourse(g, -w / 2, w / 2, 9.4, STONE, 0.7);
  g.fillStyle = shade(STONE, -0.3);
  g.fillRect(-w / 2, 10.1, w, 0.5);
  rail(g, -w / 2, w / 2, 10.6, 1.2);
  for (const x of [-12.8, -8, 8, 12.8]) column(g, x, 12.0, 21.2, 0.85);
  for (const s of [-1, 1]) {
    window(g, s * 10.4, 14.2, 1.8, 3.8, { arch: true, pediment: 'curve' });
    statue(g, s * 6.1, 14.6, 1.6, 3.4);
  }
  // the middle of the upper order: a carved frame round a big arched window and the saint above it
  carve(g, -3.3, 12.2, 3.3, 21.2, 0.33);
  g.fillStyle = shade(STONE, -0.12);
  g.fillRect(-2.6, 12.6, 5.2, 7.2);
  window(g, 0, 13.2, 3.0, 4.8, { arch: true, pediment: 'curve' });
  statue(g, 0, 18.2, 1.8, 2.8);
  stringCourse(g, -w / 2, w / 2, 21.4, STONE, 0.9);
  rail(g, -w / 2, w / 2, 22.3, 1.2);
  for (const x of [-12.8, -8, 0, 8, 12.8]) {
    g.fillStyle = shade(STONE, -0.15);
    g.fillRect(x - 0.35, 22.3, 0.7, 1.3);
    g.beginPath(); g.arc(x, 23.8, 0.3, 0, Math.PI * 2); g.fill();
  }
}
