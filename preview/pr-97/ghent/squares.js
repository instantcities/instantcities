// Ghent's car-free squares, paved by hand: OpenStreetMap only has the streets across them, so the
// map would draw them as streets with kerbs, asphalt and parked cars. Each square is
// { id, name, p: its outline as flat [x, z, ...] in game metres (it may run in under the buildings
// round it, they stand on top), paving: { stone, joint: colours, slab: [length, width] in game
// metres } for slabs, or { sett: true, stone?, joint? } for cobbles, walls }. Inside it the ground, the streets and
// the raced road are all its paving, there are no kerbs and nobody parks; a fountain the map has on
// it springs from the stones (see js/squares.js).
//   walls   the long fronts round it, drawn by hand: { id, name?, at: the middle of a building's
//           outline in map.js (game metres, within 3 m), faces: the way its front looks (degrees,
//           0 east, 90 south), top: how high the drawing stands (above the roof: gables, statues),
//           px?, draw(g, w, h, eaves) }. One drawing goes across every edge of the outline that
//           looks that way, w metres wide and h tall, x from -w/2 to w/2 and y up from the ground,
//           eaves the height of the map's box; what draw leaves clear lets the sky through.
import { ashlar, brick, crossWindow, roundArch, pilaster, stringCourse, balustrade, shade } from '../core/js/facades.js';

export const SQUARES = [
  // Sint-Baafsplein, between the Lakenhalle, the NTGent Schouwburg, the cathedral and the houses on
  // the Sint-Baafssteeg: one floor of long pale grey slabs with the tram set in it, and a fountain
  // whose jets spring straight from the stones; they run on to the cathedral's walls and in under
  // its west front, so it stands on them and not on a dark strip of street
  {
    id: 'sint-baafsplein',
    name: 'Sint-Baafsplein',
    p: [142, -62, 238, 4, 244, 12, 249, 31, 245, 50, 226, 57, 224, 80, 214, 84, 186, 74, 180, 61, 146, 58, 140, 22, 112, 14, 94, -12, 106, -26, 116, -26, 140, -60],
    paving: { stone: '#c3c1bb', joint: '#8f8c86', slab: [1.5, 0.75] },
    walls: [
      // the NTGent Schouwburg (Edmond De Vigne, 1897-1899), on the north side
      { id: 'ntgent', name: 'NTGent Schouwburg', at: [187.7, -45.3], faces: 123, top: 42, px: 16, draw: schouwburg },
      // the south side, from the Sint-Baafssteeg to the tram
      { id: 'sint-baafsplein-zuid', at: [162.6, 69.2], faces: -74, top: 23, draw: (g, w, h, e) => row(g, w, h, e, SOUTH_ROW) },
      // the west side, along the Sint-Baafssteeg up to the Belfort
      { id: 'sint-baafsplein-west', at: [134.6, 43.0], faces: 28, top: 27, draw: (g, w, h, e) => row(g, w, h, e, WEST_ROW) },
    ],
  },
  // Korenmarkt, from the Sint-Niklaaskerk up to the old post office and the Sint-Michielsbrug: no
  // street at all, only grey cobbles wall to wall with the tram rails set in them (the pedestrian
  // area OpenStreetMap has for it, way 107539767)
  {
    id: 'korenmarkt',
    name: 'Korenmarkt',
    p: [-140.8, -218.3, -125.3, -213.1, -130.9, -193.1, -140.9, -138.7, -115.2, -133.3, -122.8, -103.1, -125.7, -102.5, -124.4, -99.2,
      -127, -88.6, -129.7, -86.3, -127.4, -84.5, -134.1, -57.3, -134.6, -46.9, -193.7, -59.3, -195.1, -93.9, -188.6, -191.8, -181.9, -218.2,
      -164.2, -263, -165.8, -266.5, -162.2, -276, -143, -304.8, -137.5, -304, -132.9, -301.2, -135.4, -297.2, -130.2, -295, -142.4, -266.3,
      -153, -232.5, -151.7, -226.7, -148, -221.5],
    paving: { sett: true, stone: '#a9a8a4', joint: '#6f6e6b' },
  },
];

const GLASS = '#2c3540';

// ------------------------------------------------------------------ Sint-Baafsplein

// The Schouwburg's front: three tall storeys of five bays in pale sandstone on a blue-stone plinth.
// The middle three stand out: three arches into the foyer, round-headed windows between columns
// above them, four statues of men in 17th-century dress by Louis Mast (the city's four chambers of
// rhetoric) beside them, and over it all the great gable with its round tympanum, the mosaic of
// Apollo in his chariot among the nine Muses, and the bronze Genius of Music with her lyre on top.
function schouwburg(g, w, h, e) {
  const S = '#e4dac3', B = '#7f8487', L = -w / 2, R = w / 2, c = w * 0.3; // c: half the middle part
  ashlar(g, L, 0, R, e, S, { course: 0.55, seed: 101, vary: 0.05 });
  ashlar(g, L, 0, R, 1.4, B, { course: 0.7, seed: 102 });
  // the middle part stands a little proud: lit on its left edge, in shade on its right
  g.fillStyle = shade(S, 0.12); g.fillRect(-c - 0.3, 0, 0.3, e);
  g.fillStyle = shade(S, -0.3); g.fillRect(c, 0, 0.3, e);
  const bay = (2 * c) / 3, side = [(L + -c) / 2, (R + c) / 2];
  // the ground floor: the three arches, the side bays' doors and windows
  for (let k = 0; k < 3; k++) {
    const x = -c + bay * (k + 0.5);
    roundArch(g, x, 1.4, bay * 0.66 + 0.6, 7.2, shade(S, -0.25));
    roundArch(g, x, 1.4, bay * 0.66, 6.9, '#33302c');
    g.fillStyle = '#5a4a38'; // the doors, under fanlights
    g.fillRect(x - bay * 0.26, 1.4, bay * 0.52, 3.8);
    g.fillStyle = GLASS;
    g.fillRect(x - bay * 0.22, 1.6, bay * 0.18, 3.3); g.fillRect(x + bay * 0.04, 1.6, bay * 0.18, 3.3);
  }
  for (const x of side) crossWindow(g, x, 2.6, 2.6, 4.4, { stone: S });
  stringCourse(g, L, R, 9.4, S, 0.6);
  // the first floor: a balcony along the middle, three tall round-headed windows between columns
  balustrade(g, -c, c, 9.6, 1.3, S, 0.9);
  for (let k = 0; k < 3; k++) {
    const x = -c + bay * (k + 0.5);
    roundArch(g, x, 10.6, 3.7, 6.8, shade(S, -0.3));
    roundArch(g, x, 10.9, 3.1, 6.3, GLASS);
    g.fillStyle = S;
    g.fillRect(x - 0.1, 10.9, 0.2, 5); g.fillRect(x - 1.55, 14.2, 3.1, 0.18);
  }
  for (let k = 0; k <= 3; k++) pilaster(g, -c + bay * k, 9.6, 18.4, 0.7, S);
  for (const x of side) crossWindow(g, x, 11.4, 2.4, 4.8, { stone: S });
  stringCourse(g, L, R, 18.6, S, 0.7);
  // the second floor: shorter windows, and over the middle the date in a frieze
  for (let k = 0; k < 3; k++) crossWindow(g, -c + bay * (k + 0.5), 19.6, 2.8, 3.4, { stone: S });
  for (const x of side) crossWindow(g, x, 19.6, 2.2, 3.4, { stone: S });
  for (let k = 0; k <= 3; k++) pilaster(g, -c + bay * k, 18.8, e - 1.6, 0.6, S);
  // the four statues, on brackets at the outer columns of the middle, on both upper storeys
  for (const x of [-c - 0.9, c + 0.9]) for (const y of [10.4, 19.4]) statue(g, x, y, 3.3, shade(S, 0.06));
  // the cornice, the side bays' balustrades with urns
  g.fillStyle = shade(S, -0.35); g.fillRect(L, e - 1.6, w, 0.35);
  g.fillStyle = shade(S, 0.14); g.fillRect(L - 0.2, e - 1.25, w + 0.4, 1.25);
  for (const [x0, x1] of [[L, -c], [c, R]]) {
    balustrade(g, x0, x1, e, 1.5, S, 0.8);
    for (const x of [x0 + 0.5, x1 - 0.5]) urn(g, x, e + 1.5, S);
  }
  gable(g, c, e, h, S);
  text(g, 'ANNO 1897', 0, e - 0.95, 0.75, shade(S, -0.55));
}

// The Schouwburg's gable over the middle, from the eaves e up to h: an attic storey, scrolls either
// side, the round tympanum with its mosaic, and the Genius of Music on top.
function gable(g, c, e, h, S) {
  const top = h - 4.2, r = Math.min(c * 0.62, top - e - 3.4), cy = top - r, A = e + 3.2;
  g.fillStyle = S;
  g.fillRect(-c, e, 2 * c, A - e); // the attic, as wide as the middle
  g.beginPath(); g.arc(0, cy, r + 1.1, 0, Math.PI); g.lineTo(-r - 1.1, A); g.lineTo(r + 1.1, A); g.fill();
  g.fillRect(-r - 1.1, A, 2 * r + 2.2, cy - A);
  // the scrolls, from the attic's ends up to the tympanum's foot
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(s * c, A); g.quadraticCurveTo(s * (r + 1.1), A, s * (r + 1.1), cy);
    g.lineTo(s * (r + 1.1), A); g.fill();
    g.fillStyle = shade(S, -0.3);
    g.beginPath(); g.arc(s * (c - 0.9), A + 0.6, 0.55, 0, Math.PI * 2); g.fill();
    g.fillStyle = S;
    obelisk(g, s * (c - 0.6), A, S);
  }
  ashlar(g, -c, e, c, A, S, { course: 0.55, seed: 103, vary: 0.04 });
  for (let x = -c + 1.6; x < c - 1; x += 2.2) { g.fillStyle = shade(S, -0.28); g.fillRect(x - 0.45, e + 0.7, 0.9, 1.6); } // the attic's little windows
  stringCourse(g, -r - 1.1, r + 1.1, A, S, 0.45);
  // the mosaic: Apollo's sun and chariot in the middle, the Muses round it, all on gold
  g.fillStyle = shade(S, -0.35);
  g.beginPath(); g.arc(0, cy, r + 0.4, 0, Math.PI); g.lineTo(-r - 0.4, A + 0.5); g.lineTo(r + 0.4, A + 0.5); g.closePath(); g.fill();
  g.fillStyle = '#c69a3a';
  g.beginPath(); g.arc(0, cy, r, 0, Math.PI); g.lineTo(-r, A + 0.7); g.lineTo(r, A + 0.7); g.closePath(); g.fill();
  g.fillStyle = '#3d5f8f';
  g.beginPath(); g.arc(0, cy, r * 0.8, 0, Math.PI); g.lineTo(-r * 0.8, A + 1.4); g.lineTo(r * 0.8, A + 1.4); g.closePath(); g.fill();
  g.fillStyle = '#f2c94c';
  g.beginPath(); g.arc(0, cy + r * 0.25, r * 0.28, 0, Math.PI * 2); g.fill(); // the sun behind Apollo
  g.fillStyle = '#f5f0e6';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * 0.22, A + 2.2, r * 0.13, r * 0.07, 0, 0, Math.PI * 2); g.fill(); } // his horses
  const muses = ['#b6413a', '#e8e2d2', '#4f7a4a', '#d98c3a', '#7b4b8f', '#e8e2d2', '#2f6d8f', '#c75b7a', '#d9c25a'];
  muses.forEach((col, k) => {
    const x = -r * 0.82 + (k + (k >= 4 ? 1 : 0)) * (r * 1.64 / 9), y = A + 1.5;
    if (Math.abs(x) < r * 0.15) return;
    g.fillStyle = col;
    g.beginPath(); g.moveTo(x - 0.35, y); g.lineTo(x - 0.15, y + 1.6); g.lineTo(x + 0.15, y + 1.6); g.lineTo(x + 0.35, y); g.fill();
    g.fillStyle = '#e9c9a5';
    g.beginPath(); g.arc(x, y + 1.85, 0.22, 0, Math.PI * 2); g.fill();
  });
  // on top, the bronze Genius of Music on her plinth, the lyre up in her hand
  const BR = '#4c5b4a';
  g.fillStyle = S;
  g.fillRect(-1.1, top, 2.2, 0.9);
  g.fillStyle = BR;
  g.beginPath(); g.moveTo(-0.7, top + 0.9); g.lineTo(-0.3, top + 3.2); g.lineTo(0.3, top + 3.2); g.lineTo(0.75, top + 0.9); g.fill();
  g.beginPath(); g.arc(0, top + 3.5, 0.32, 0, Math.PI * 2); g.fill();
  g.lineWidth = 0.2; g.strokeStyle = BR;
  g.beginPath(); g.moveTo(0.2, top + 2.9); g.lineTo(0.9, top + 3.9); g.stroke();
  g.beginPath(); g.moveTo(0.9, top + 3.6); g.lineTo(0.9, top + 4.2); g.moveTo(1.3, top + 3.6); g.lineTo(1.3, top + 4.2); g.moveTo(0.8, top + 3.6); g.quadraticCurveTo(1.1, top + 3.3, 1.4, top + 3.6); g.stroke();
}

// a man in 17th-century dress on a bracket: a broad hat, a cloak to the knees, boots
function statue(g, x, y, s, hex) {
  g.fillStyle = shade(hex, -0.15);
  g.fillRect(x - 0.55, y, 1.1, 0.35);
  g.fillStyle = hex;
  g.beginPath(); g.moveTo(x - 0.3, y + 0.35); g.lineTo(x - 0.45, y + s * 0.62); g.lineTo(x - 0.3, y + s * 0.8); g.lineTo(x + 0.3, y + s * 0.8); g.lineTo(x + 0.45, y + s * 0.62); g.lineTo(x + 0.3, y + 0.35); g.fill();
  g.beginPath(); g.arc(x, y + s * 0.87, s * 0.07, 0, Math.PI * 2); g.fill();
  g.fillRect(x - s * 0.13, y + s * 0.92, s * 0.26, s * 0.04); // the hat's brim
  g.fillRect(x - s * 0.06, y + s * 0.95, s * 0.12, s * 0.06);
  g.fillStyle = shade(hex, -0.3); // the shadow it casts in its corner
  g.fillRect(x + 0.45, y + 0.35, 0.12, s * 0.5);
}

function urn(g, x, y, S) {
  g.fillStyle = S;
  g.fillRect(x - 0.3, y, 0.6, 0.3);
  g.beginPath(); g.ellipse(x, y + 0.75, 0.38, 0.45, 0, 0, Math.PI * 2); g.fill();
  g.fillRect(x - 0.12, y + 1.1, 0.24, 0.35);
}

function obelisk(g, x, y, S) {
  g.fillStyle = S;
  g.fillRect(x - 0.45, y, 0.9, 0.7);
  g.beginPath(); g.moveTo(x - 0.3, y + 0.7); g.lineTo(x, y + 3.4); g.lineTo(x + 0.3, y + 0.7); g.fill();
  g.beginPath(); g.arc(x, y + 3.55, 0.18, 0, Math.PI * 2); g.fill();
}

// letters cut in the stone, `size` metres tall, centred on x (the canvas is upside down: flip it)
function text(g, str, x, y, size, col) {
  g.save();
  g.translate(x, y);
  g.scale(1, -1);
  g.fillStyle = col;
  g.font = `bold ${size}px serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(str, 0, 0);
  g.restore();
}

// The houses along a side of the square, side by side, each { share of the width, wall colour,
// plaster or brick, gable: 'stepped' | 'bell' | 'point' | 'flat', rise: how far its gable stands
// above the eaves, shop: the colour of its shop front on the ground floor }.
const SOUTH_ROW = [
  { share: 0.2, wall: '#efe9dc', plaster: true, gable: 'flat', rise: 1.5, shop: '#2b4a3a' },
  { share: 0.16, wall: '#8c3b2a', gable: 'stepped', rise: 6.5, shop: '#7a1f1f' },
  { share: 0.24, wall: '#e6dcc6', plaster: true, gable: 'bell', rise: 6, shop: '#1d3f6e' },
  { share: 0.18, wall: '#9a4a33', gable: 'point', rise: 5, shop: '#3b3a37' },
  { share: 0.22, wall: '#dccdab', plaster: true, gable: 'flat', rise: 1.5, shop: '#6d4c41' },
];
const WEST_ROW = [
  { share: 0.13, wall: '#7a3326', gable: 'stepped', rise: 7, shop: '#4a2a1a' },
  { share: 0.17, wall: '#f1ece1', plaster: true, gable: 'bell', rise: 6.5, shop: '#1d3f6e' },
  { share: 0.14, wall: '#a5563b', gable: 'stepped', rise: 7.5, shop: '#2b2b2b' },
  { share: 0.2, wall: '#e2ddd2', plaster: true, gable: 'flat', rise: 1.5, shop: '#7a1f1f' },
  { share: 0.12, wall: '#8c3b2a', gable: 'point', rise: 6, shop: '#2e4d3a' },
  { share: 0.24, wall: '#dccdab', plaster: true, gable: 'flat', rise: 2, shop: '#3f6f78' },
];

function row(g, w, h, e, houses) {
  const sum = houses.reduce((a, d) => a + d.share, 0);
  let x = -w / 2;
  houses.forEach((d, k) => {
    const hw = (d.share / sum) * w;
    rowHouse(g, x, x + hw, e, Math.min(h, e + d.rise), d, k);
    x += hw;
  });
}

// One house of a row from x0 to x1: its front up to the eaves e, its gable up to top, storeys of
// windows, a shop on the ground floor
function rowHouse(g, x0, x1, e, top, d, seed) {
  const w = x1 - x0, cx = (x0 + x1) / 2, trim = d.plaster ? shade(d.wall, 0.35) : '#ece6d8';
  g.save();
  outline(g, x0, x1, e, top, d.gable);
  g.clip();
  if (d.plaster) { g.fillStyle = d.wall; g.fillRect(x0, 0, w, top); } else brick(g, x0, 0, x1, top, d.wall, { seed: 11 + seed });
  // the shop front: a band for its name, a wide window, the door
  g.fillStyle = d.shop;
  g.fillRect(x0 + 0.3, 0, w - 0.6, 4.2);
  g.fillStyle = shade(d.shop, 0.25);
  g.fillRect(x0 + 0.3, 3.4, w - 0.6, 0.6);
  g.fillStyle = GLASS;
  g.fillRect(x0 + 0.7, 0.5, w * 0.55, 2.6);
  g.fillStyle = shade(GLASS, 0.2);
  g.fillRect(x0 + 0.8, 2.3, w * 0.25, 0.7);
  g.fillStyle = '#3a2b20';
  g.fillRect(x1 - 0.6 - Math.min(1.4, w * 0.2), 0, Math.min(1.4, w * 0.2), 3.1);
  // the storeys up to the eaves, and one or two windows in the gable
  const per = Math.max(2, Math.round(w / 2.6)), step = w / per;
  for (let y = 4.6; y + 2.6 < e; y += 3.4) {
    for (let k = 0; k < per; k++) crossWindow(g, x0 + step * (k + 0.5), y + 0.4, Math.min(1.5, step * 0.55), 2.2, { stone: trim });
    if (!d.plaster) { g.fillStyle = trim; g.fillRect(x0, y - 0.15, w, 0.18); }
  }
  if (top - e > 3) crossWindow(g, cx, e + 0.6, 1.2, Math.min(2, top - e - 2.6), { stone: trim, lintel: false });
  g.restore();
  // a cornice where the front stops flat; a coping along a gable's edge
  g.fillStyle = shade(d.wall, -0.35);
  if (d.gable === 'flat') g.fillRect(x0, top - 0.5, w, 0.5);
  g.fillRect(x0, 0, 0.12, top * 0.98); // the line between two houses
}

// a house front's outline, from the ground up to its gable's top
function outline(g, x0, x1, e, top, kind) {
  const w = x1 - x0, cx = (x0 + x1) / 2, rise = top - e;
  g.beginPath();
  g.moveTo(x0, 0); g.lineTo(x0, e);
  if (kind === 'stepped') {
    const n = 4, sw = w / (2 * n + 1), sh = rise / (n + 1);
    for (let k = 0; k < n; k++) { g.lineTo(x0 + k * sw, e + (k + 1) * sh); g.lineTo(x0 + (k + 1) * sw, e + (k + 1) * sh); }
    g.lineTo(x0 + n * sw, top); g.lineTo(x1 - n * sw, top);
    for (let k = n - 1; k >= 0; k--) { g.lineTo(x1 - (k + 1) * sw, e + (k + 1) * sh); g.lineTo(x1 - k * sw, e + (k + 1) * sh); }
  } else if (kind === 'bell') {
    const neck = w * 0.2;
    g.quadraticCurveTo(cx - neck, e, cx - neck, e + rise * 0.7);
    g.arc(cx, e + rise * 0.7, neck, Math.PI, 0, true);
    g.quadraticCurveTo(cx + neck, e, x1, e);
  } else if (kind === 'point') {
    g.lineTo(cx, top);
  } else {
    g.lineTo(x0, top); g.lineTo(x1, top);
  }
  g.lineTo(x1, e); g.lineTo(x1, 0);
  g.closePath();
}
