// The Graslei's and the Korenlei's houses drawn by hand, from photos, each standing in for its box from the map (see
// js/fronts.js). Each { id, name, at: the middle of its outline in map.js (game metres), gable,
// wall: its side walls (a brick colour, or 'stone:#hex'), roof, eaves / top (game metres, else the
// map's), draw(g, w, h, eaves): the front, in metres, x from -w/2 to w/2, y up; props(house, f, top) }.
// The front goes on the side looking out over the Leie. The guild houses are drawn after their
// own photos; the houses between them in the Graslei's manner, brick and white stone.
import * as THREE from 'three';
import { brick, ashlar, archPath, crossWindow, roundArch, pilaster, stringCourse, balustrade, lancet, rose, rng, shade } from '../core/js/facades.js';

const SLATE = 0x3d4248, TILES = 0x7a3a2a;

export const FRONTS = [
  // Gildehuis van de Vrije Schippers (Graslei 14, 1531): Brabantine Gothic in pale sandstone, tall
  // traceried bays, a ship carved over the door, a stepped gable and a golden ship on top
  { id: 'vrije-schippers', name: 'Gildehuis van de Vrije Schippers', at: [-248.0, -159.7], gable: ['stepped', 4], wall: 'stone:#cbbd9b', roof: SLATE,
    draw: vrijeSchippers, props: (house, f, top) => house.add(at(f, f.w / 2, top, ship())) },
  // Het Korenmetershuis (Graslei 12-13): warm brown stone, nearly all windows, carved friezes
  // between the storeys, a steep stepped gable
  { id: 'korenmetershuis', name: 'Korenmetershuis', at: [-243.1, -177.2], gable: ['stepped', 7], wall: 'stone:#8e6248', roof: SLATE, draw: korenmetershuis },
  // Het Tolhuisje (Graslei 11, 1682): the little toll house, Flemish Renaissance, red brick banded
  // with white stone, a bell gable with the lion of Flanders
  { id: 'tolhuisje', name: 'Tolhuisje', at: [-233.8, -185.5], gable: 'bell', wall: '#9a4a33', roof: TILES, top: 10.5, draw: tolhuisje },
  // Het Spijker (Koornstapelhuis, Graslei 10, about 1200): the Romanesque grain store of grey
  // Tournai stone, rough rubble walling, a row of round arches below, small windows in rows up its
  // tall stepped gable of seven steps
  { id: 'spijker', name: 'Het Spijker', at: [-238.0, -199.9], gable: ['stepped', 7], wall: 'stone:#85898a', roof: SLATE, top: 28, draw: spijker },
  // the houses between and at both ends
  // Graslei 15, by the old post office: neo-Gothic, pale stone, a balustrade and a pointed gable
  { id: 'graslei-15', at: [-245.4, -146.5], gable: 'point', wall: 'stone:#ddd3bd', roof: SLATE, top: 21, draw: graslei15 },
  { id: 'graslei-8', at: [-225.0, -219.0], gable: ['stepped', 6], wall: '#7a3326', roof: TILES, eaves: 10, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#7a3326' }) },
  { id: 'graslei-7', at: [-221.9, -229.1], gable: 'bell', wall: 'stone:#e6dcc6', roof: SLATE, eaves: 10, top: 20, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#ece4d2', plaster: true }) },
  { id: 'graslei-6', at: [-214.6, -239.7], gable: ['stepped', 5], wall: '#9a4a33', roof: TILES, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#9a4a33' }) },
  { id: 'graslei-5', at: [-206.6, -248.0], gable: 'point', wall: 'stone:#efe9dc', roof: SLATE, top: 19, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#f1ece1', plaster: true }) },
  { id: 'graslei-1', at: [-238.2, -300.6], gable: 'flat', wall: 'stone:#dccdab', roof: SLATE, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#dccdab', plaster: true }) },

  // the Korenlei, across the water, from the Sint-Michielsbrug north
  { id: 'korenlei-1', at: [-279.8, -311.6], gable: 'flat', wall: 'stone:#e6dcc6', roof: SLATE, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#e6dcc6', plaster: true }) },
  { id: 'korenlei-4', at: [-307.2, -289.8], gable: ['stepped', 5], wall: '#7a3326', roof: TILES, top: 25, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#7a3326' }) },
  { id: 'korenlei-5', at: [-313.8, -279.9], gable: 'bell', wall: 'stone:#efe9dc', roof: SLATE, top: 25, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#f1ece1', plaster: true }) },
  { id: 'korenlei-6', at: [-314.0, -270.5], gable: ['stepped', 6], wall: '#9a4a33', roof: TILES, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#9a4a33' }) },
  // Gildehuis van de Onvrije Schippers (Korenlei 7, 1739): Baroque, pale stone, a bell gable with a
  // golden ship on top (the house the map gives no number, between nos. 6 and 10)
  { id: 'onvrije-schippers', name: 'Gildehuis van de Onvrije Schippers', at: [-319.4, -250.5], gable: 'bell', wall: 'stone:#ddd4c0', roof: SLATE, top: 21,
    draw: korenmeters, props: (house, f, top) => house.add(at(f, f.w / 2, top, ship())) },
  { id: 'korenlei-9', at: [-329.9, -240.7], gable: 'point', wall: '#8c3b2a', roof: TILES, top: 23, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#8c3b2a' }) },
  { id: 'korenlei-10', at: [-329.3, -225.1], gable: 'flat', wall: 'stone:#dccdab', roof: SLATE, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#dccdab', plaster: true }) },
  { id: 'korenlei-14', at: [-334.6, -217.5], gable: ['stepped', 5], wall: '#6e3b2c', roof: TILES, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#6e3b2c' }) },

  // Sint-Baafsplein, the north side from the Schouwburg to the cathedral: two cafés under tall
  // gables, then two tall houses in white plaster on the corner of the Biezekapelstraat
  { id: 'sint-baafsplein-vosken', name: "'t Vosken", at: [207.3, -23.2], faces: 123, gable: ['stepped', 5], wall: '#8c3b2a', roof: TILES, eaves: 12, top: 22, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#8c3b2a' }) },
  { id: 'sint-baafsplein-bridge', at: [216.1, -16.9], faces: 120, gable: 'bell', wall: 'stone:#e6dcc6', roof: SLATE, eaves: 11.5, top: 21.5, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#ece4d2', plaster: true }) },
  { id: 'sint-baafsplein-rechters', at: [219.1, -10.3], faces: 106, gable: 'flat', wall: 'stone:#efe9dc', roof: SLATE, top: 23.5, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#f1ece1', plaster: true }) },
  { id: 'sint-baafsplein-hoek', at: [226.9, -8.4], faces: 103, gable: 'flat', wall: 'stone:#e2ddd2', roof: SLATE, top: 25.8, draw: (g, w, h, e) => house(g, w, h, e, { wall: '#e6e1d6', plaster: true }) },
];

const DARK = '#2c3540';

// a prop placed on the front: u across it, y up
function at(f, u, y, obj) {
  obj.position.set(f.a[0] + f.right[0] * u, y, f.a[1] + f.right[1] * u);
  obj.rotation.y = Math.atan2(-f.right[1], f.right[0]); // its x along the front
  return obj;
}

// storeys of cross windows across a front, from y0 up to y1
function rows(g, w, y0, y1, { stone, glass = DARK, n, gap = 3.4, win = 0.55 } = {}) {
  const per = n ?? Math.max(1, Math.round(w / 2.7)), step = w / per;
  for (let y = y0; y + gap * 0.7 <= y1; y += gap) {
    for (let k = 0; k < per; k++) crossWindow(g, -w / 2 + step * (k + 0.5), y + 0.7, Math.min(step * win, 1.6), gap * 0.58, { stone, glass });
  }
}

// a door on the ground floor
function door(g, x, w, h, hex) {
  roundArch(g, x, 0, w, h, shade(hex, -0.3));
  roundArch(g, x, 0, w - 0.4, h - 0.2, '#3a2b20');
}

// a Graslei house: brick (or plaster) with white stone string courses at the sills, tall cross
// windows in white stone frames under brick relieving arches, wall anchors, a café's dark wooden
// shop front on the ground floor, and in the gable fewer windows each step up
function house(g, w, h, e, { wall, plaster = false }) {
  const trim = '#ece6d8', L = -w / 2, R = w / 2;
  if (plaster) { g.fillStyle = wall; g.fillRect(L, 0, w, h); } else brick(g, L, 0, R, h, wall);
  const floors = Math.max(1, Math.round((e - 4) / 3.3)), fh = (e - 4) / floors, per = Math.max(2, Math.round(w / 3.4)), step = w / per;
  // the ground floor: a wooden shop front across most of it, the door to one side
  g.fillStyle = '#3b2a20';
  g.fillRect(L + 0.5, 0.3, w - 1, 3.3);
  g.fillStyle = DARK;
  for (let x = L + 0.8; x < R - 2.2; x += 1.6) g.fillRect(x, 0.9, 1.3, 2.4);
  g.fillStyle = '#5a3a28';
  g.fillRect(R - 2.0, 0.3, 1.2, 2.9);
  g.fillStyle = plaster ? shade(wall, -0.2) : trim;
  g.fillRect(L, 3.7, w, 0.25);
  // the storeys
  for (let f = 0; f < floors; f++) {
    const y = 4 + f * fh;
    g.fillStyle = plaster ? shade(wall, -0.12) : trim;
    g.fillRect(L, y + 0.25, w, 0.16); // the sill course
    for (let k = 0; k < per; k++) window4(g, L + step * (k + 0.5), y + 0.45, Math.min(step * 0.56, 1.7), fh * 0.7, { plaster, wall, trim });
    if (!plaster) for (let k = 0; k <= per; k++) anchor(g, L + step * k, y + fh - 0.3);
  }
  // the gable: rows of windows getting fewer, a little round window near the top
  let n = Math.max(1, per - 1);
  for (let y = e + 0.6; y < h - 3.2 && n > 0; y += 3.1, n--) {
    const sp = (w * (1 - (y - e) / (h - e))) / (n + 0.6);
    for (let k = 0; k < n; k++) window4(g, (k - (n - 1) / 2) * sp, y, Math.min(sp * 0.5, 1.3), 2.1, { plaster, wall, trim });
  }
  g.fillStyle = plaster ? shade(wall, -0.25) : trim;
  g.beginPath(); g.arc(0, h - 2.1, 0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = DARK;
  g.beginPath(); g.arc(0, h - 2.1, 0.34, 0, Math.PI * 2); g.fill();
}

// a tall window in a white stone frame, mullion and transom, small leaded panes in the upper
// lights, a brick relieving arch over it (on brick)
function window4(g, cx, y0, ww, hh, { plaster, wall, trim }) {
  if (!plaster) {
    g.fillStyle = shade(wall, -0.18);
    g.beginPath(); g.arc(cx, y0 + hh + 0.1, ww / 2 + 0.35, 0, Math.PI); g.fill();
  }
  g.fillStyle = plaster ? shade(wall, -0.3) : trim;
  g.fillRect(cx - ww / 2 - 0.18, y0 - 0.18, ww + 0.36, hh + 0.36);
  g.fillStyle = DARK;
  g.fillRect(cx - ww / 2, y0, ww, hh);
  g.fillStyle = '#4b5966'; // the upper lights catch the sky
  g.fillRect(cx - ww / 2, y0 + hh * 0.66, ww, hh * 0.34);
  g.fillStyle = plaster ? shade(wall, -0.3) : trim;
  g.fillRect(cx - 0.06, y0, 0.12, hh);
  g.fillRect(cx - ww / 2, y0 + hh * 0.64, ww, 0.12);
  g.fillStyle = 'rgba(20,24,28,0.6)'; // the leading
  for (let x = cx - ww / 2 + ww / 4; x < cx + ww / 2; x += ww / 4) g.fillRect(x - 0.015, y0 + hh * 0.66, 0.03, hh * 0.34);
}

// a wrought-iron wall anchor: a black S
function anchor(g, x, y) {
  g.strokeStyle = '#1d1a17';
  g.lineWidth = 0.09;
  g.beginPath(); g.moveTo(x - 0.18, y + 0.3); g.quadraticCurveTo(x + 0.25, y + 0.15, x, y); g.quadraticCurveTo(x - 0.25, y - 0.15, x + 0.18, y - 0.3); g.stroke();
}

// a stepped gable's coping: a cap on the top of every step, `steps` up each side (as js/fronts.js
// cuts the outline)
function stepCaps(g, w, e, h, steps, hex) {
  const sw = w / (2 * steps + 1), sh = (h - e) / (steps + 1);
  g.fillStyle = hex;
  for (let k = 0; k <= steps; k++) {
    const y = k < steps ? e + (k + 1) * sh : h, u = k < steps ? w - (k + 1) * sw : steps * sw;
    const span = k < steps ? sw : w - 2 * steps * sw;
    g.fillRect(-w / 2 + u - 0.1, y - 0.35, span + 0.2, 0.35); // the right side's step (or the top)
    if (k < steps) g.fillRect(-w / 2 + k * sw - 0.1, y - 0.35, sw + 0.2, 0.35); // and its twin on the left
  }
}

// rubble walling: rough stones of every size, grey with lighter and browner ones among them
function rubble(g, x0, y0, x1, y1, hex, seed) {
  const r = rng(seed);
  g.fillStyle = shade(hex, -0.3);
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0; y < y1; y += 0.32) {
    for (let x = x0 - r() * 0.5; x < x1;) {
      const sw = 0.35 + r() * 0.75, sh = 0.22 + r() * 0.18, v = (r() - 0.5) * 0.36, warm = r() < 0.15;
      g.fillStyle = warm ? shade('#9a8c7a', v) : shade(hex, v);
      g.fillRect(x + 0.03, y + 0.03 + (r() - 0.5) * 0.06, sw - 0.06, sh);
      x += sw;
    }
  }
}

// Graslei 15, on the corner by the old post office: neo-Gothic in pale stone, two tall pointed
// windows a storey, a balustrade along the eaves and a pointed gable with a little rose window
function graslei15(g, w, h, e) {
  const S = '#ddd3bd', L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { course: 0.45, seed: 95, vary: 0.05 });
  lancet(g, 0, 0, 2.4, 4.4, { stone: S, mullion: false, dark: '#3a2b20' });
  for (const x of [L + 1.2, R - 1.2]) { g.fillStyle = DARK; g.fillRect(x - 0.6, 0.8, 1.2, 2.8); }
  stringCourse(g, L, R, 5, S, 0.35);
  for (const y of [5.6, 10.2]) for (const x of [-w / 4, w / 4]) lancet(g, x, y, w * 0.3, 4.0, { stone: S });
  for (const x of [L + 0.25, 0, R - 0.25]) pilaster(g, x, 5, e - 1, 0.3, S);
  balustrade(g, L, R, e - 1, 1, S, 0.5);
  stringCourse(g, L, R, e, S, 0.35);
  rose(g, 0, e + (h - e) * 0.42, Math.min(1.4, w * 0.16), { stone: shade(S, -0.1) });
  for (const x of [-w * 0.22, w * 0.22]) lancet(g, x, e + 0.6, 0.8, 2.2, { stone: S, mullion: false });
}

// Gildehuis van de Vrije Schippers (1531): Brabantine Gothic in pale sandstone, the whole front
// windows between slender colonnettes, three storeys of five tall traceried lights, blind
// tracery panels between them, the ship carved over the door, a stepped gable
function vrijeSchippers(g, w, h, e) {
  const S = '#dccca3', L = -w / 2, R = w / 2, bays = 5, step = w / bays;
  ashlar(g, L, 0, R, h, S, { course: 0.42, seed: 91, vary: 0.05 });
  // the ground floor: the door under a pointed arch, the ship over it, windows either side
  lancet(g, 0, 0, 2.2, 4.4, { stone: S, mullion: false, dark: '#3a2b20' });
  shipRelief(g, 0, 4.9, 1.8);
  for (const k of [0, 1, 3, 4]) crossWindow(g, L + step * (k + 0.5), 1.1, step * 0.66, 3.2, { stone: S, lintel: false });
  // three storeys of tall lights, each under a pointed head with a trefoil, a blind panel under it
  const storeys = [[6.0, 3.0], [10.0, 2.8], [13.7, 2.5]];
  for (const [y, hh] of storeys) {
    stringCourse(g, L, R, y - 0.9, S, 0.25);
    for (let k = 0; k < bays; k++) {
      const x = L + step * (k + 0.5);
      for (let j = 0; j < 4; j++) { g.fillStyle = shade(S, -0.22); archPath(g, x - step * 0.3 + j * step * 0.2, y - 0.75, step * 0.16, 0.6); g.fill(); } // blind tracery
      g.fillStyle = shade(S, -0.28);
      archPath(g, x, y - 0.1, step * 0.82, hh + 0.4);
      g.fill();
      lancet(g, x, y, step * 0.72, hh, { stone: S });
      g.fillStyle = S; g.fillRect(x - step * 0.36, y + hh * 0.45, step * 0.72, 0.1); // the transom
    }
  }
  for (let k = 0; k <= bays; k++) pilaster(g, L + step * k, 0.2, e, 0.26, S);
  stringCourse(g, L, R, e, S, 0.4);
  // the gable: three lancets, then two, then one, between colonnettes, the top steps with their caps
  let n = 3;
  for (let y = e + 0.7; y < h - 2.4 && n > 0; y += 2.6, n--) {
    for (let j = 0; j < n; j++) lancet(g, (j - (n - 1) / 2) * 1.8, y, 1.1, 2.0, { stone: S });
  }
  stepCaps(g, w, e, h, 4, shade(S, -0.2));
}

// Het Korenmetershuis (Graslei 12-13): the grain measurers' house, warm brown stone, its front
// nearly all windows: four cross windows a storey in moulded frames, carved friezes between the
// storeys, and a steep stepped gable full of windows too
function korenmetershuis(g, w, h, e) {
  const S = '#8e6248', C = '#d8c7a6', L = -w / 2, R = w / 2, per = 4, step = w / per;
  ashlar(g, L, 0, R, h, S, { course: 0.4, seed: 96, vary: 0.08 });
  door(g, -w / 4, 1.6, 3.2, C);
  crossWindow(g, w / 5, 0.9, 2.2, 2.4, { stone: C });
  const fh = (e - 3.6) / 3;
  for (let f = 0; f < 3; f++) {
    const y = 3.6 + f * fh;
    g.fillStyle = C; g.fillRect(L, y - 0.1, w, 0.5); // the frieze, lozenges carved in it
    g.fillStyle = shade(C, -0.3);
    for (let x = L + 0.4; x < R; x += 0.8) { g.beginPath(); g.moveTo(x, y + 0.15); g.lineTo(x + 0.2, y + 0.33); g.lineTo(x + 0.4, y + 0.15); g.lineTo(x + 0.2, y - 0.03); g.fill(); }
    for (let k = 0; k < per; k++) window4(g, L + step * (k + 0.5), y + 0.75, step * 0.7, fh - 1.2, { plaster: true, wall: C, trim: C });
  }
  for (let k = 0; k <= per; k++) pilaster(g, L + step * k, 3.6, e, 0.22, C);
  let n = 3;
  for (let y = e + 0.6; y < h - 2.2 && n > 0; y += 2.5, n--) {
    for (let j = 0; j < n; j++) window4(g, (j - (n - 1) / 2) * 1.9, y, 1.2, 1.8, { plaster: true, wall: C, trim: C });
  }
  g.fillStyle = C;
  g.beginPath(); g.arc(0, h - 1.4, 0.5, 0, Math.PI * 2); g.fill();
  stepCaps(g, w, e, h, 7, C);
}

// a three-masted ship in gold, carved in the stone
function shipRelief(g, x, y, s) {
  g.fillStyle = '#c99a32';
  g.beginPath();
  g.moveTo(x - s * 0.6, y + s * 0.18); g.lineTo(x + s * 0.6, y + s * 0.18); g.lineTo(x + s * 0.42, y); g.lineTo(x - s * 0.42, y);
  g.fill();
  for (const [dx, mh] of [[-0.3, 0.6], [0, 0.78], [0.3, 0.55]]) {
    g.fillRect(x + dx * s - 0.03, y + s * 0.18, 0.06, mh * s);
    g.fillRect(x + dx * s - s * 0.12, y + s * (0.18 + mh * 0.35), s * 0.24, s * mh * 0.4); // the sail
  }
}

function korenmeters(g, w, h, e) {
  const S = '#e1d9c6', L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { course: 0.5, seed: 92, vary: 0.04 });
  door(g, 0, 1.8, 3.2, S);
  rows(g, w, 3.4, e, { stone: shade(S, 0.1), n: Math.max(2, Math.round(w / 2.4)) });
  for (const x of [L + 0.3, R - 0.3]) pilaster(g, x, 0, e, 0.5, S);
  stringCourse(g, L, R, e, S, 0.5);
  // the bell gable: a round window, swags of carved fruit either side
  const cy = e + (h - e) * 0.45, r = Math.min(w * 0.12, 1.1);
  g.fillStyle = shade(S, -0.3);
  g.beginPath(); g.arc(0, cy, r * 1.25, 0, Math.PI * 2); g.fill();
  g.fillStyle = DARK;
  g.beginPath(); g.arc(0, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = shade(S, -0.25);
  g.lineWidth = 0.22;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.arc(s * (r + 1.1), cy + 0.4, 0.8, Math.PI, 0, true);
    g.stroke();
  }
  crossWindow(g, 0, e + 0.6, 1.3, 1.6, { stone: S, lintel: false });
}

function tolhuisje(g, w, h, e) {
  const B = '#9a4a33', S = '#e9e1cf', L = -w / 2, R = w / 2;
  brick(g, L, 0, R, h, B);
  for (let y = 0.9; y < h; y += 1.1) { g.fillStyle = S; g.fillRect(L, y, w, 0.3); } // the white stone bands
  door(g, 0, 1.3, 2.7, S);
  crossWindow(g, 0, e + 0.4, w * 0.42, 1.9, { stone: S });
  // the lion of Flanders on a shield, near the top
  g.fillStyle = '#d9a72e';
  const y = h - 2.1;
  g.beginPath(); g.moveTo(-0.5, y + 1); g.lineTo(0.5, y + 1); g.lineTo(0.5, y + 0.4); g.lineTo(0, y); g.lineTo(-0.5, y + 0.4); g.fill();
  g.fillStyle = '#1c1c1c';
  g.beginPath(); g.ellipse(0, y + 0.55, 0.2, 0.28, 0.3, 0, Math.PI * 2); g.fill();
}

function spijker(g, w, h, e) {
  const S = '#8d8f8c', L = -w / 2, R = w / 2;
  rubble(g, L, 0, R, h, S, 93);
  // a row of round arches along the ground floor, and a stone bench of a step in front
  const n = 9, step = (w * 0.9) / n;
  for (let k = 0; k < n; k++) {
    const x = -w * 0.45 + step * (k + 0.5);
    roundArch(g, x, 0.5, step * 0.62 + 0.3, 3.4, shade(S, 0.12));
    roundArch(g, x, 0.5, step * 0.62, 3.2, '#26221f');
  }
  g.fillStyle = shade(S, -0.15); g.fillRect(L, 0, w, 0.5);
  // two rows of small square windows above, deep in the thick wall
  const win = (x, y, ww, hh) => {
    g.fillStyle = shade(S, 0.18); g.fillRect(x - ww / 2 - 0.15, y - 0.15, ww + 0.3, hh + 0.3);
    g.fillStyle = DARK; g.fillRect(x - ww / 2, y, ww, hh);
    g.fillStyle = shade(S, 0.18); g.fillRect(x - 0.05, y, 0.1, hh);
  };
  for (const [y, m] of [[6.2, 7], [10.2, 7]]) for (let k = 0; k < m; k++) win(-w * 0.4 + (w * 0.8 / m) * (k + 0.5), y, 0.9, 1.5);
  // the gable: five windows, then three, two and one
  [[e + 1.2, 5], [e + 4.4, 3], [e + 7.4, 2], [e + 10.2, 1]].forEach(([y, m]) => {
    if (y > h - 1.8) return;
    for (let k = 0; k < m; k++) win((k - (m - 1) / 2) * 2.4, y, 0.8, 1.4);
  });
  stepCaps(g, w, e, h, 7, '#8a4a36');
}

// the gilded ship on top of the Vrije Schippers' gable
function ship() {
  const gold = new THREE.MeshStandardMaterial({ color: 0xe0ad3c, metalness: 0.55, roughness: 0.32, emissive: 0x3a2804, side: THREE.DoubleSide });
  const s = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.35), gold);
  hull.position.y = 0.9;
  s.add(hull);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), gold);
  rod.position.y = 0.4;
  s.add(rod);
  for (const [x, mh] of [[-0.45, 0.9], [0, 1.2], [0.45, 0.8]]) {
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.45, mh * 0.7), gold);
    sail.position.set(x, 1.1 + mh * 0.45, 0);
    s.add(sail);
  }
  s.children.forEach(m => { m.castShadow = true; });
  return s;
}
