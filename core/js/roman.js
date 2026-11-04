// A house front in the manner of a Roman town (Pompeii's), for a city whose LOOK has style: 'roman'
// (see js/scenery.js): plaster that has weathered, with exposed masonry where it has come off and
// hairline cracks; a dado of painted red or black along the foot of the wall and panels of fresco
// above it; on the ground floor a doorway between brick pilasters, dark inside, under a lintel and a
// painted notice, or a shop's wide opening with its masonry counter and jars; above, small windows
// with wooden shutters, and on some houses a wooden balcony. Drawn in a frame one house wide (128)
// and 80 a storey, like js/italian.js's; v picks the variant, so neighbours differ.

import * as THREE from 'three';
import { SHARP } from './device.js';

const STONE = 'rgba(255,248,232,0.5)', SHADOW = 'rgba(40,28,16,0.35)';
const DADOS = ['rgba(120,28,18,0.55)', 'rgba(40,22,18,0.5)', 'rgba(150,50,28,0.5)'];
const PANELS = ['rgba(210,160,60,0.28)', 'rgba(190,60,40,0.22)', 'rgba(240,225,170,0.3)'];
const BRICKS = ['#a65d44', '#b3694d', '#94533d', '#9c6a50', '#7f7a70', '#8c8478'];
const WOOD = '#5a3b24', DARK = '#1d1711';

// a little generator of its own, so the same house is the same every time
const lcg = seed => { let s = (seed * 2654435761) >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

// a patch of bare masonry (opus incertum: irregular stones, or brick) with a ragged top edge
function masonry(g, x, y, w, h, rnd) {
  g.save();
  g.beginPath();
  g.moveTo(x, y + h);
  for (let k = 0; k <= w; k += 6) g.lineTo(x + k, y + rnd() * 5);
  g.lineTo(x + w, y + h);
  g.closePath();
  g.clip();
  g.fillStyle = '#8a7c68';
  g.fillRect(x, y, w, h);
  for (let yy = y; yy < y + h; yy += 5) {
    for (let xx = x - ((yy / 5) % 2) * 4; xx < x + w; xx += 7 + rnd() * 5) {
      g.fillStyle = BRICKS[Math.floor(rnd() * BRICKS.length)];
      g.fillRect(xx + 0.5, yy + 0.5, 5 + rnd() * 4, 3.6);
    }
  }
  g.restore();
}

// hairline cracks and weathering: dark streaks under the cornice and from the sills
function weather(g, w, h, rnd, n) {
  g.strokeStyle = 'rgba(50,35,22,0.32)';
  g.lineWidth = 0.7;
  for (let k = 0; k < n; k++) {
    let x = rnd() * w, y = rnd() * h * 0.6;
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 5; s++) { x += (rnd() - 0.5) * 7; y += 3 + rnd() * 6; g.lineTo(x, y); }
    g.stroke();
  }
  const grad = g.createLinearGradient(0, 0, 0, 14);
  grad.addColorStop(0, 'rgba(60,40,25,0.22)');
  grad.addColorStop(1, 'rgba(60,40,25,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, 14);
}

// a fresco panel: a frame a little lighter than the wall and a tint inside
function panel(g, x, y, w, h, tint) {
  g.fillStyle = tint;
  g.fillRect(x, y, w, h);
  g.strokeStyle = 'rgba(255,248,232,0.5)';
  g.lineWidth = 1.4;
  g.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  g.strokeStyle = 'rgba(60,30,20,0.3)';
  g.lineWidth = 0.8;
  g.strokeRect(x + 4, y + 4, w - 8, h - 8);
}

// a painted notice (an election slogan in red capitals), as lines of small marks
function notice(g, x, y, w, rnd) {
  g.fillStyle = 'rgba(170,35,25,0.85)';
  for (let row = 0; row < 2; row++) {
    for (let xx = x; xx < x + w * (row ? 0.7 : 1); xx += 2.6) if (rnd() > 0.18) g.fillRect(xx, y + row * 5, 1.5, 3.6);
  }
}

// the storeys above the ground floor: windows with shutters, a balcony on some, panels, a cornice
export function romanUpper(g, floors, shutters, v, r) {
  const rnd = lcg(v * 977 + floors * 31 + 5);
  for (let f = 0; f < floors - 1; f++) {
    const y = f * 80;
    // fresco panels over a dado, between the windows
    g.fillStyle = DADOS[(v + f) % DADOS.length];
    g.fillRect(0, y + 62, 128, 18);
    g.fillStyle = 'rgba(255,248,232,0.45)';
    g.fillRect(0, y + 61, 128, 1.5);
    const wins = 1 + ((v + f) % 3 === 0 ? 1 : 0) + (rnd() < 0.4 ? 1 : 0);
    const spans = wins === 1 ? [[26 + rnd() * 50]] : wins === 2 ? [[18], [78]] : [[12], [52], [92]];
    if (rnd() < 0.7) panel(g, 6, y + 12, 116, 42, PANELS[Math.floor(rnd() * PANELS.length)]);
    for (const [x] of spans) {
      g.fillStyle = STONE;
      g.fillRect(x - 3, y + 17, 24, 32); // the frame
      g.fillStyle = DARK;
      g.beginPath();
      g.moveTo(x, y + 47); g.lineTo(x, y + 26); g.arc(x + 9, y + 26, 9, Math.PI, 0); g.lineTo(x + 18, y + 47); g.fill();
      g.fillStyle = WOOD; // a shutter half open
      g.fillRect(x + (rnd() < 0.5 ? 0 : 9), y + 27, 9, 20);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      for (let yy = y + 29; yy < y + 46; yy += 3) g.fillRect(x + 1, yy, 16, 0.8);
      g.fillStyle = STONE;
      g.fillRect(x - 3, y + 47, 24, 3); // the sill
    }
    // a wooden balcony (a pergula) on some storeys: a plank floor on beams, a rail with posts
    if (f === 0 && floors > 2 && v % 4 === 1) {
      g.fillStyle = WOOD;
      g.fillRect(0, y + 52, 128, 4);
      g.fillStyle = 'rgba(30,18,10,0.5)';
      g.fillRect(0, y + 56, 128, 2);
      for (let x = 4; x < 128; x += 14) g.fillRect(x, y + 56, 3, 6);
    }
    g.fillStyle = STONE;
    g.fillRect(0, y, 128, 3); // the cornice
    g.fillStyle = SHADOW;
    g.fillRect(0, y + 79, 128, 1.5);
  }
  weather(g, 128, floors * 80, rnd, 3 + floors);
}

// the ground floor: dado and panels, a doorway between brick pilasters, or a shop opening with its counter
export function romanGround(g, y0, door, v) {
  const rnd = lcg(v * 1213 + 7);
  g.fillStyle = DADOS[v % DADOS.length];
  g.fillRect(0, y0 + 46, 128, 34);
  g.fillStyle = 'rgba(255,248,232,0.5)';
  g.fillRect(0, y0 + 45, 128, 1.5);
  if (rnd() < 0.55) panel(g, 4, y0 + 8, 52, 34, PANELS[Math.floor(rnd() * PANELS.length)]);
  // plaster come off at the foot: bare masonry
  if (rnd() < 0.75) masonry(g, rnd() * 70, y0 + 68, 30 + rnd() * 50, 12, rnd);
  const dx = 16 + ((v * 29) % 44), shop = v % 3 === 0;
  // the doorway: brick pilasters, a plaster lintel with a notice over it, the dark hall inside, a stone threshold
  const pil = (x) => {
    for (let yy = y0 + 18; yy < y0 + 80; yy += 4) {
      g.fillStyle = BRICKS[Math.floor(rnd() * 4)];
      g.fillRect(x, yy, 7, 3.2);
    }
  };
  pil(dx - 7); pil(dx + 26);
  g.fillStyle = STONE;
  g.fillRect(dx - 8, y0 + 13, 42, 5);
  g.fillStyle = DARK;
  g.fillRect(dx, y0 + 18, 26, 62);
  const hall = g.createLinearGradient(0, y0 + 18, 0, y0 + 80);
  hall.addColorStop(0, 'rgba(0,0,0,0)');
  hall.addColorStop(1, 'rgba(210,170,110,0.22)'); // the light of the atrium far inside
  g.fillStyle = hall;
  g.fillRect(dx, y0 + 18, 26, 62);
  g.fillStyle = door;
  if (rnd() < 0.5) g.fillRect(dx, y0 + 40, 7, 40); // one leaf standing open
  g.fillStyle = '#9b9283';
  g.fillRect(dx - 2, y0 + 78, 30, 2); // the threshold
  notice(g, dx - 14, y0 + 5, 54, rnd);
  if (shop) {
    const sx = dx > 50 ? 4 : 76;
    g.fillStyle = STONE;
    g.fillRect(sx - 2, y0 + 22, 50, 58);
    g.fillStyle = DARK;
    g.fillRect(sx + 2, y0 + 26, 42, 54);
    g.fillStyle = '#847561'; // the counter, rendered masonry with the jars set in its top
    g.fillRect(sx + 2, y0 + 56, 42, 24);
    g.fillStyle = 'rgba(255,248,232,0.25)';
    g.fillRect(sx + 2, y0 + 56, 42, 3);
    g.fillStyle = DARK;
    for (let x = sx + 6; x < sx + 40; x += 9) { g.beginPath(); g.ellipse(x + 2, y0 + 58, 3.2, 1.6, 0, 0, Math.PI * 2); g.fill(); }
    // shutter grooves each side, and an amphora painted by the door
    g.fillStyle = 'rgba(0,0,0,0.4)';
    g.fillRect(sx - 1, y0 + 24, 1.5, 56); g.fillRect(sx + 45, y0 + 24, 1.5, 56);
    g.fillStyle = 'rgba(160,70,40,0.8)';
    g.beginPath(); g.ellipse(sx + 22, y0 + 40, 5, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(sx + 20.5, y0 + 28, 3, 5);
  }
}

// --- Ruins -------------------------------------------------------------------------------------
// With LOOK.ruins a city's houses are what the excavation has left of them: walls of rubble stone
// and brick, the plaster come off in patches (still painted red, ochre and cream where it holds),
// broken off along their tops at different heights, no roof, earth for a floor.

// Dry ground: grit, pebbles, bare patches and tufts of straw and weed, drawn over the ground's colour.
export function dryGround(g, w, h, r) {
  for (let k = 0; k < w * h / 2400; k++) { // big soft patches: darker earth, paler dust, a stain of green
    const c = r();
    g.fillStyle = c < 0.4 ? 'rgba(110,88,55,0.16)' : c < 0.75 ? 'rgba(235,215,170,0.2)' : 'rgba(105,115,55,0.16)';
    g.beginPath(); g.ellipse(r() * w, r() * h, 12 + r() * 30, 8 + r() * 22, r() * 3, 0, Math.PI * 2); g.fill();
  }
  for (let k = 0; k < w * h / 500; k++) { // bare patches, paler or darker
    g.fillStyle = r() < 0.5 ? 'rgba(225,205,160,0.16)' : 'rgba(90,70,40,0.12)';
    g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 10, 2 + r() * 6, r() * 3, 0, Math.PI * 2); g.fill();
  }
  for (let k = 0; k < w * h / 110; k++) { // pebbles
    const v = 100 + r() * 110;
    g.fillStyle = `rgba(${v},${v * 0.95},${v * 0.85},0.7)`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2.2, 1 + r() * 1.6);
  }
  const tufts = ['rgba(200,180,110,0.55)', 'rgba(140,140,70,0.5)', 'rgba(95,105,50,0.45)', 'rgba(230,215,150,0.4)'];
  for (let k = 0; k < w * h / 90; k++) {
    g.strokeStyle = tufts[Math.floor(r() * tufts.length)];
    g.lineWidth = 1;
    const x = r() * w, y = r() * h;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y - 3 - r() * 5); g.stroke();
  }
}

// plaster and dado colours of the wall variants: cream, ochre, Pompeian red, yellow, grey-white, and
// one that has lost nearly all of it
// one that has lost nearly all of it; fields: the colours of the painted fields; net: a stretch of
// opus reticulatum in the masonry
const RUIN_WALLS = [
  { plaster: '#d9c9a2', dado: '#8e2f22', cover: 0.62, fields: ['#9b2b1f', '#c99a3e'] },
  { plaster: '#cf9d52', dado: '#4b2f25', cover: 0.55, fields: ['#c9923a', '#2a2420'], net: true },
  { plaster: '#a8402c', dado: '#58301f', cover: 0.5, fields: ['#9b2b1f', '#2a2420'] },
  { plaster: '#e0cd8a', dado: '#9a4a30', cover: 0.6, fields: ['#d49a2e', '#e6dcc6'] },
  { plaster: '#d2c9b4', dado: '#6a3a30', cover: 0.4, fields: ['#e6dcc6', '#9b2b1f'], net: true },
  { plaster: '#d4c39a', dado: '#6a4a38', cover: 0.12, fields: ['#b0703a'], net: true },
];
export const RUIN_VARIANTS = RUIN_WALLS.length;
export const RUIN_TILE = [9, 6]; // metres across and up that a ruin texture covers: 512 by 342 px, 57 px to a metre (times SHARP)
export const RUIN_CAP = 0.985; // the v of a wall's broken top: a strip of bare stone at the top of the texture
const STONES = ['#8f7d66', '#7d6f5c', '#a08a6c', '#6f6558', '#8a8278', '#9b6a50', '#5e5650', '#b09878', '#847159'];

// A jagged blob: a closed path of about r wide, its edge broken in small steps
function blob(g, cx, cy, rx, ry, rnd) {
  const n = 14 + Math.floor(rnd() * 8);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2, j = 0.7 + rnd() * 0.5, step = k % 2 ? 0.85 : 1;
    const x = cx + Math.cos(a) * rx * j * step, y = cy + Math.sin(a) * ry * j * step;
    k ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath();
}

// How one variant of ruined wall is drawn on a 512 by 342 canvas: bare masonry all over (rubble with
// bands of brick, here and there a net of tufa blocks), plaster where it has held, painted in fields
// of colour, and with `door` a doorway between brick pilasters (or `shop`: the wide opening of a
// shop with its counter) in the middle of it, election notices painted beside it.
export function ruinPainter(variant, kind, seed) {
  const V = RUIN_WALLS[variant % RUIN_WALLS.length], rnd = lcg(seed * 7919 + variant * 101 + (kind === 'door' ? 3 : kind === 'shop' ? 5 : 0));
  return g => {
    const W = 512, H = 342;
    g.fillStyle = '#6a5d4c';
    g.fillRect(0, 0, W, H);
    // masonry in courses: rubble stone, with a band of brick every so often
    let y = 22, row = 0;
    while (y < H) {
      const bandBrick = row % 7 === 5, rh = bandBrick ? 6 : 8 + rnd() * 6;
      for (let x = -rnd() * 20; x < W; ) {
        const sw = bandBrick ? 22 + rnd() * 6 : 14 + rnd() * 24;
        g.fillStyle = bandBrick ? BRICKS[Math.floor(rnd() * 4)] : STONES[Math.floor(rnd() * STONES.length)];
        const d = (rnd() - 0.5) * 18;
        g.globalAlpha = 1;
        g.beginPath(); g.roundRect(x + 0.8, y + 0.8, sw - 1.6, rh - 1.6, bandBrick ? 0.5 : 2.4); g.fill();
        g.fillStyle = d > 0 ? `rgba(255,240,215,${d / 90})` : `rgba(0,0,0,${-d / 90})`;
        g.fill();
        g.fillStyle = 'rgba(255,245,225,0.13)'; // the top of each stone catching light
        g.fillRect(x + 1.5, y + 1, sw - 3, 1.2);
        x += sw;
      }
      y += rh; row++;
    }
    // on some walls a stretch of opus reticulatum: square tufa blocks set on the diagonal, in a net,
    // between quoins of brick
    if (V.net) {
      const x0 = rnd() * W * 0.4, x1 = x0 + W * (0.3 + rnd() * 0.3), y0 = 40 + rnd() * 40, s = 11;
      g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, H - y0); g.clip();
      g.fillStyle = '#6a5d4c'; g.fillRect(x0, y0, x1 - x0, H - y0);
      for (let yy = y0 - s; yy < H + s; yy += s / 2) for (let xx = x0 - s + ((Math.round((yy - y0) / (s / 2)) % 2) * s) / 2; xx < x1 + s; xx += s) {
        const v = (rnd() - 0.5) * 26;
        g.fillStyle = `rgb(${168 + v},${150 + v},${118 + v * 0.8})`;
        g.beginPath(); g.moveTo(xx, yy - s / 2 + 1); g.lineTo(xx + s / 2 - 1, yy); g.lineTo(xx, yy + s / 2 - 1); g.lineTo(xx - s / 2 + 1, yy); g.closePath(); g.fill();
      }
      g.restore();
      for (const x of [x0, x1 - 16]) for (let yy = y0; yy < H; yy += 6) { g.fillStyle = BRICKS[Math.floor(rnd() * 4)]; g.fillRect(x + ((yy / 6) % 2 ? 0 : 4), yy, 12, 5); }
    }
    // the plaster: blobs, a clip of their union, painted inside
    g.save();
    g.beginPath();
    const blobs = [];
    const big = Math.round(V.cover * 9);
    for (let k = 0; k < big + 2; k++) {
      const low = rnd() < 0.65, cx = rnd() * W, cy = low ? H * (0.55 + rnd() * 0.4) : H * (0.15 + rnd() * 0.4);
      const rx = 34 + rnd() * 80, ry = 26 + rnd() * 56;
      blobs.push([cx, cy, rx, ry]);
    }
    // a wall's foot: the plaster holds best low down, in a band, ragged along its top, with gaps in it
    for (let x = 0; x < W; x += 16) if (rnd() < V.cover + 0.1) blobs.push([x + 8, H * 0.9 + rnd() * 10, 16 + rnd() * 20, 24 + rnd() * 20]);
    blobs.forEach(([cx, cy, rx, ry]) => blob(g, cx, cy, rx, ry, rnd));
    g.clip('nonzero');
    // inside: plaster, a dado of paint at the foot, a lighter band over it, a faint panel above
    g.fillStyle = V.plaster;
    g.fillRect(0, 0, W, H);
    for (let k = 0; k < 520; k++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '255,245,220' : '70,50,30'},${0.05 + rnd() * 0.08})`; g.fillRect(rnd() * W, rnd() * H, 4 + rnd() * 18, 2 + rnd() * 8); }
    g.fillStyle = V.dado;
    g.globalAlpha = 0.78;
    g.fillRect(0, H * 0.8, W, H);
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(255,245,225,0.35)';
    g.fillRect(0, H * 0.8 - 2, W, 3);
    // what is left of the painting: big fields of colour between narrow bands, each band with a thin
    // candelabrum, each field with its border and, now and then, a small picture or a bird in it;
    // a pale frieze over them with a line of painted architecture
    const field = V.fields, top = H * 0.26, bottom = H * 0.78;
    g.fillStyle = 'rgba(240,228,200,0.55)'; g.fillRect(0, top - 22, W, 20);
    g.strokeStyle = 'rgba(125,34,24,0.55)'; g.lineWidth = 1;
    for (let x = 6; x < W; x += 26) { g.strokeRect(x, top - 18, 12, 12); g.beginPath(); g.moveTo(x + 6, top - 18); g.lineTo(x + 6, top - 22); g.stroke(); }
    for (let px = rnd() * 20; px < W; ) {
      const fw = 84 + rnd() * 30;
      g.fillStyle = field[Math.floor(rnd() * field.length)];
      g.globalAlpha = 0.8; g.fillRect(px, top, fw, bottom - top); g.globalAlpha = 1;
      g.strokeStyle = 'rgba(245,232,196,0.6)'; g.lineWidth = 1.5; g.strokeRect(px + 7, top + 7, fw - 14, bottom - top - 14);
      g.strokeStyle = 'rgba(245,232,196,0.35)'; g.lineWidth = 0.8; g.strokeRect(px + 11, top + 11, fw - 22, bottom - top - 22);
      const cx = px + fw / 2, cy = (top + bottom) / 2, pick = rnd();
      if (pick < 0.3) { // a small picture: a pale square with a figure
        g.fillStyle = 'rgba(232,220,190,0.85)'; g.fillRect(cx - 13, cy - 15, 26, 30);
        g.fillStyle = ['#5a7a9a', '#9b2b1f', '#6a8a5a'][Math.floor(rnd() * 3)]; g.fillRect(cx - 3, cy - 4, 6, 14);
        g.fillStyle = '#c98a5e'; g.beginPath(); g.arc(cx, cy - 7, 3, 0, Math.PI * 2); g.fill();
      } else if (pick < 0.55) { // a bird on a twig, or a flying figure
        g.fillStyle = 'rgba(238,228,205,0.8)'; g.beginPath(); g.ellipse(cx, cy, 6, 3.5, -0.3, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.arc(cx + 5, cy - 3, 2.4, 0, Math.PI * 2); g.fill();
      }
      // the narrow dark band after the field, with its candelabrum
      const bw = 12 + rnd() * 6, bx = px + fw;
      g.fillStyle = 'rgba(31,27,23,0.75)'; g.fillRect(bx, top, bw, bottom - top);
      g.strokeStyle = 'rgba(212,176,96,0.7)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(bx + bw / 2, top + 8); g.lineTo(bx + bw / 2, bottom - 6); g.stroke();
      for (let yy = top + 16; yy < bottom - 10; yy += 20) { g.beginPath(); g.ellipse(bx + bw / 2, yy, 4, 1.5, 0, 0, Math.PI * 2); g.stroke(); }
      px = bx + bw;
    }
    g.fillStyle = 'rgba(0,0,0,0.12)'; // dirt along the foot, and damp
    g.fillRect(0, H * 0.93, W, H);
    for (let k = 0; k < 120; k++) { // chips where the plaster has come away: bare stone showing through
      g.fillStyle = STONES[Math.floor(rnd() * STONES.length)];
      g.beginPath(); g.roundRect(rnd() * W, rnd() * H, 3 + rnd() * 12, 3 + rnd() * 8, 1.5); g.fill();
    }
    for (let k = 0; k < 18; k++) { // streaks from above
      const x = rnd() * W, len = 30 + rnd() * 80;
      const grad = g.createLinearGradient(0, 0, 0, len);
      grad.addColorStop(0, 'rgba(60,40,25,0.3)'); grad.addColorStop(1, 'rgba(60,40,25,0)');
      g.save(); g.translate(x, rnd() * H * 0.5); g.fillStyle = grad; g.fillRect(0, 0, 2 + rnd() * 4, len); g.restore();
    }
    g.restore();
    // a shadow line round each patch gives the plaster its thickness
    g.strokeStyle = 'rgba(40,28,16,0.45)'; g.lineWidth = 1.6;
    blobs.slice(0, big + 2).forEach(([cx, cy, rx, ry], i) => { g.beginPath(); blob(g, cx, cy, rx, ry, lcg(seed * 31 + i + variant)); g.stroke(); });
    if (kind) {
      const shop = kind === 'shop', cx = W / 2, dw = shop ? 170 : 88, dh = shop ? 134 : 150, left = cx - dw / 2;
      // pilasters of brick either side and a lintel over
      for (const x of [left - 14, left + dw]) for (let yy = H - dh - 14; yy < H; yy += 7) { g.fillStyle = BRICKS[Math.floor(rnd() * 4)]; g.fillRect(x, yy, 14, 6); }
      g.fillStyle = '#b6a98a';
      g.fillRect(left - 16, H - dh - 22, dw + 32, 8); // lintel of plaster or stone
      for (let k = 0; k < 7; k++) { g.fillStyle = BRICKS[k % 4]; g.fillRect(left + 3 + k * (dw - 6) / 7, H - dh - 14, (dw - 6) / 7 - 1, 6); } // a flat brick arch over the doorway
      g.fillStyle = DARK;
      g.fillRect(left, H - dh, dw, dh);
      const hall = g.createLinearGradient(0, H - dh, 0, H);
      hall.addColorStop(0, 'rgba(0,0,0,0.2)'); hall.addColorStop(1, 'rgba(235,200,140,0.4)'); // the light of the court far inside
      g.fillStyle = hall; g.fillRect(left, H - dh, dw, dh);
      if (shop) { // the masonry counter with the jars set into it
        g.fillStyle = '#847561'; g.fillRect(left, H - 62, dw, 62);
        g.fillStyle = 'rgba(255,248,232,0.3)'; g.fillRect(left, H - 62, dw, 4);
        g.fillStyle = DARK;
        for (let x = left + 20; x < left + dw - 12; x += 38) { g.beginPath(); g.ellipse(x, H - 56, 12, 4, 0, 0, Math.PI * 2); g.fill(); }
      }
      g.fillStyle = '#9b9283';
      g.fillRect(left - 10, H - 4, dw + 20, 4); // the threshold
      // beside the door, painted on a whitewashed patch in red capitals, an election notice: a name and
      // the office, and who asks you to vote for him (the town's walls are full of them)
      const NAMES = ['C IVLIVM POLYBIVM', 'CN HELVIVM SABINVM', 'M EPIDIVM SABINVM', 'A VETTIVM FIRMVM', 'L CEIVM SECVNDVM', 'M HOLCONIVM PRISCVM', 'Q POSTVMIVM MODESTVM'];
      const OFFICE = ['AED', 'IIVIR I D', 'AED D R P'], ASK = ['O V F', 'ROGAT', 'FACITE', 'VICINI ROGANT'];
      for (const side of [-1, 1]) {
        if (rnd() < 0.35) continue;
        const nw = 120 + rnd() * 30, nx = side < 0 ? left - 24 - nw : left + dw + 24, ny = H * (0.3 + rnd() * 0.22);
        if (nx < 4 || nx + nw > W - 4) continue;
        g.fillStyle = 'rgba(236,228,206,0.82)'; g.fillRect(nx, ny, nw, 40);
        g.fillStyle = 'rgba(150,32,22,0.88)'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = 'bold 12px serif'; g.fillText(NAMES[Math.floor(rnd() * NAMES.length)], nx + nw / 2, ny + 12, nw - 8);
        g.font = '10px serif'; g.fillText(`${OFFICE[Math.floor(rnd() * OFFICE.length)]} · ${ASK[Math.floor(rnd() * ASK.length)]}`, nx + nw / 2, ny + 29, nw - 8);
      }
      // and scratched lower down, by passers-by
      g.strokeStyle = 'rgba(40,30,20,0.45)'; g.lineWidth = 0.7; g.font = '9px serif'; g.fillStyle = 'rgba(40,30,20,0.5)';
      for (let k = 0; k < 4; k++) g.fillText(['VALE', 'FELIX', 'SALVE', 'HIC FVI', 'IIII'][Math.floor(rnd() * 5)], left - 40 + rnd() * (dw + 80), H * (0.62 + rnd() * 0.12));
    }
    // the top: a strip of bare stone (the broken top of a wall is the one row of it, so it varies along, not up)
    for (let x = 0; x < W; ) {
      const sw = 2 + rnd() * 7, v = (rnd() - 0.5) * 36;
      g.fillStyle = `rgb(${138 + v},${124 + v * 0.9},${102 + v * 0.8})`;
      g.fillRect(x, 0, sw, 22);
      x += sw;
    }
    // cracks, and a general dirt
    g.strokeStyle = 'rgba(30,20,12,0.4)'; g.lineWidth = 1;
    for (let k = 0; k < 9; k++) {
      let x = rnd() * W, yy = 30 + rnd() * H * 0.5;
      g.beginPath(); g.moveTo(x, yy);
      for (let s = 0; s < 6; s++) { x += (rnd() - 0.5) * 12; yy += 8 + rnd() * 14; g.lineTo(x, yy); }
      g.stroke();
    }
  };
}

// value noise on a lattice 1 apart, and a few octaves of it: what stands of a wall at (x, z)
const hash2 = (i, j, s) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 2246822519)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const smooth = t => t * t * (3 - 2 * t);
function vnoise(x, z, s) {
  const i = Math.floor(x), j = Math.floor(z), fx = smooth(x - i), fz = smooth(z - j);
  const a = hash2(i, j, s), b = hash2(i + 1, j, s), c = hash2(i, j + 1, s), d = hash2(i + 1, j + 1, s);
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}
// how high of its full height h the wall stands at (x, z): broken off in steps of 20 cm, some
// stretches nearly gone, others whole
export function ruinHeight(x, z, h, seed) {
  const n = 0.5 * vnoise(x * 0.16, z * 0.16, seed) + 0.32 * vnoise(x * 0.55, z * 0.55, seed + 1) + 0.18 * vnoise(x * 1.8, z * 1.8, seed + 2);
  const f = Math.min(1, Math.max(0, (n - 0.22) / 0.55));
  return Math.max(0.5, Math.round((h * (0.28 + 0.72 * smooth(f))) / 0.2) * 0.2);
}

// One face of a wall into the batch wb: four corners [x, y, z] going round, their [u, v], and the
// way it faces (n), the triangles turned so that their front is on that side.
function face(wb, q, uv, n) {
  const [a, b, c] = q, e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const cx = e1[1] * e2[2] - e1[2] * e2[1], cy = e1[2] * e2[0] - e1[0] * e2[2], cz = e1[0] * e2[1] - e1[1] * e2[0];
  const k = q.map((p, i) => wb.vert(p[0], p[1], p[2], n[0], n[1], n[2], uv[i][0], uv[i][1]));
  if (cx * n[0] + cy * n[1] + cz * n[2] >= 0) wb.idx.push(k[0], k[1], k[2], k[0], k[2], k[3]);
  else wb.idx.push(k[0], k[2], k[1], k[0], k[3], k[2]);
}

// One wall of a ruin into the batch wb (its vert(x, y, z, nx, ny, nz, u, v) and idx): from (ax, az)
// to (bx, bz), n its outward normal, standing y0 to at most y0 + h, in pieces of a metre or two each
// broken off at its own height. Each piece is solid masonry `thick` metres through (50 cm unless
// said): its outer face, its inner face, a cap of bare stone on top, and an end wherever it stands
// higher than the piece next to it (and at both ends of the wall), so no wall is a sheet without
// thickness seen from the side or from inside. u0, u1: where along the texture it starts and ends.
export function ruinWall(wb, ax, az, bx, bz, nx, nz, L, y0, h, seed, u0, u1, thick = 0.5) {
  const dx = (bx - ax) / L, dz = (bz - az) / L, top = RUIN_TILE[1], du = (thick / RUIN_TILE[0]) * Math.sign(u1 - u0 || 1);
  const pieces = [];
  for (let s = 0, k = 0; s < L - 0.01; k++) {
    const len = Math.min(L - s, 0.8 + hash2(k, Math.round(ax * 10), seed) * 2.2), s1 = s + len;
    const mx = ax + dx * (s + len / 2), mz = az + dz * (s + len / 2);
    pieces.push({ s, s1, H: Math.min(top - 0.5, ruinHeight(mx, mz, h, seed)) });
    s = s1;
  }
  const out = s => [ax + dx * s, az + dz * s], inn = s => [ax + dx * s - nx * thick, az + dz * s - nz * thick];
  const uAt = s => u0 + (u1 - u0) * (s / L);
  // the end of a wall piece at s, standing from y0 + lo to y0 + hi, facing along the wall (sgn: +1 forwards)
  const end = (s, lo, hi, sgn) => {
    const o = out(s), i = inn(s), u = uAt(s);
    face(wb, [[o[0], y0 + lo, o[1]], [i[0], y0 + lo, i[1]], [i[0], y0 + hi, i[1]], [o[0], y0 + hi, o[1]]],
      [[u, lo / top], [u + du, lo / top], [u + du, hi / top], [u, hi / top]], [dx * sgn, 0, dz * sgn]);
  };
  pieces.forEach(({ s, s1, H }, k) => {
    const pa = out(s), pb = out(s1), ia = inn(s), ib = inn(s1), ua = uAt(s), ub = uAt(s1), v1 = H / top, y1 = y0 + H;
    // the outside, and the inside (the same stones, seen from the room)
    face(wb, [[pa[0], y0, pa[1]], [pb[0], y0, pb[1]], [pb[0], y1, pb[1]], [pa[0], y1, pa[1]]], [[ua, 0], [ub, 0], [ub, v1], [ua, v1]], [nx, 0, nz]);
    face(wb, [[ia[0], y0, ia[1]], [ib[0], y0, ib[1]], [ib[0], y1, ib[1]], [ia[0], y1, ia[1]]], [[ua + du, 0], [ub + du, 0], [ub + du, v1], [ua + du, v1]], [-nx, 0, -nz]);
    // the cap: bare stone across the wall's thickness
    face(wb, [[pa[0], y1, pa[1]], [pb[0], y1, pb[1]], [ib[0], y1, ib[1]], [ia[0], y1, ia[1]]], [[ua, RUIN_CAP], [ub, RUIN_CAP], [ub, RUIN_CAP], [ua, RUIN_CAP]], [0, 1, 0]);
    // the broken ends: where this piece stands above its neighbour, and at the wall's two ends
    const before = k ? pieces[k - 1].H : 0, after = k < pieces.length - 1 ? pieces[k + 1].H : 0;
    if (H > before) end(s, before, H, -1);
    if (H > after) end(s1, after, H, 1);
  });
}

// What ruinWall draws into when there is no tile batch (the hand-modelled ruins): the vertices and
// indices as they come, and a mesh of them with the texture of a ruin's wall (roman ruinTexture).
export class WallBatch {
  constructor() { this.pos = []; this.nrm = []; this.uv = []; this.idx = []; }
  vert(x, y, z, nx, ny, nz, u, v) { this.pos.push(x, y, z); this.nrm.push(nx, ny, nz); this.uv.push(u, v); return this.pos.length / 3 - 1; }
  mesh(map) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    geo.setIndex(this.idx);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map, roughness: 0.95, side: THREE.DoubleSide }));
    m.castShadow = m.receiveShadow = true;
    return m;
  }
}

// the texture of one variant of a ruin's wall, plain or with a doorway or a shop's opening
export function ruinTexture(variant, kind = '', seed = 1) {
  const c = document.createElement('canvas');
  c.width = 512 * SHARP; c.height = 342 * SHARP; // drawn in a 512 by 342 frame, finer on a computer
  const g = c.getContext('2d');
  g.scale(SHARP, SHARP);
  ruinPainter(variant, kind, seed)(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
