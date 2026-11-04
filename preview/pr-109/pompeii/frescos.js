// The paintings and the mosaics of Pompeii's houses (houses.js), drawn on canvases.
//
// Walls, a bay PANEL metres wide repeated along a wall, from the floor up to the top of the plaster
// (texture v 0 at the floor, 1 at the top): the Fourth Style of the town's last years, a dark socle,
// big fields of one colour with a small picture in the middle, narrow dark bands between them with
// thin painted candelabra, and a light frieze along the top.
//   red, yellow, black, white: the field's colour
//   cupids: the black room of the House of the Vettii, its frieze of little cupids at work
//   garden: a painted garden, plants and birds behind a low trellis, on a garden's walls
//   masonry: the First Style of the House of the Faun, older: plaster modelled into blocks and
//     painted like coloured marble, under a cornice of little teeth
//   graffiti: the white walls of the Lupanare, scratched all over with names and tallies
// The walls, the bare masonry and the floors are drawn in a frame of 512 (256 a floor tile) on a canvas
// SHARP times that (core/js/device.js: twice on a computer, as is on a phone), so the thin lines of
// their candelabra, garlands and borders stay sharp up close.
// Pictures, one each, spread over a stretch of wall (u 0..1 across it):
//   menander: the poet Menander in his chair reading, on blue (House of Menander)
//   venus: Venus lying in a pink shell on the sea, with two cupids (House of Venus in the Shell)
//   lararium: the shrine painted over the counter of a thermopolium: Mercury, Bacchus, the house's
//     genius between two lares, and two snakes below
//   pyramus: Pyramus and Thisbe by the spring, the lioness behind (House of Octavius Quartio)
//   couples: the small pictures over the cells of the Lupanare: a couple on a bed (here, dressed)
// The real ones: artTexture(id) puts the photo of a piece of _data/art.json (assets/img/art/<id>.jpg,
// the alexander-mosaic, the venus-in-the-shell...) over the drawing of it, once it has loaded
// (core/js/inside/photo.js); offline the drawing stays.
// Floors, tiled every TILE metres (u, v = metres / TILE):
//   tesserae (white with a black band), black (black with white crosses), signinum (red-brown
//   cement with white tesserae set in it), sectile (cubes in three tones: the House of the Faun),
//   marble (bits of coloured marble set in the counter of a thermopolium), tiles (a roof's
//   terracotta, flat tiles with rounded ones over their joints, seen from below or above)
// Mosaics, one each, over their own rectangle (u, v 0..1):
//   cave: the black dog on a chain with CAVE CANEM, at the door of the House of the Tragic Poet
//   have: HAVE (welcome), in the pavement before the House of the Faun
//   alexander: the Alexander Mosaic, Alexander charging Darius in his chariot (House of the Faun)
import * as THREE from 'three';
import { photo } from '../core/js/inside/photo.js';
import { SHARP } from '../core/js/device.js';

export const PANEL = 3; // metres of wall a bay of painting covers
export const TILE = 2; // metres of floor a tile of pattern covers

const cache = new Map();
const texture = (key, w, h, draw, repeat = true) => {
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  let s = [...key].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) >>> 0;
  const r = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  draw(g, w, h, r);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  cache.set(key, t);
  return t;
};

// a drawing in its own frame, on a canvas SHARP times that
const sharp = draw => (g, w, h, r) => { g.scale(SHARP, SHARP); draw(g, w / SHARP, h / SHARP, r); };

// age: the plaster fading and come off here and there, showing the rubble behind
function age(g, w, h, r, { flakes = 10, fade = 0.12 } = {}) {
  g.fillStyle = `rgba(230,220,200,${fade})`;
  g.fillRect(0, 0, w, h);
  for (let k = 0; k < 2500; k++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,245,225,0.08)'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); }
  for (let k = 0; k < flakes; k++) {
    const x = r() * w, y = r() * h, rx = 6 + r() * 30, ry = 4 + r() * 18;
    g.fillStyle = '#8f7f68';
    g.beginPath();
    for (let a = 0; a < 12; a++) { const t = (a / 12) * Math.PI * 2, f = 0.6 + r() * 0.5; g.lineTo(x + Math.cos(t) * rx * f, y + Math.sin(t) * ry * f); }
    g.fill();
  }
}

// a small figure: head, a robe from the shoulders, arms; at (x, y) its feet, h tall
function figure(g, x, y, h, robe, skin = '#c98a5e', { arm = 0, lean = 0, hair = '#3a2414' } = {}) {
  const hd = h * 0.11, sh = y - h + hd * 2.2;
  g.fillStyle = robe;
  g.beginPath(); g.moveTo(x - h * 0.12 + lean, sh); g.lineTo(x + h * 0.12 + lean, sh); g.lineTo(x + h * 0.18, y); g.lineTo(x - h * 0.18, y); g.closePath(); g.fill();
  g.strokeStyle = skin; g.lineWidth = Math.max(2, h * 0.05); g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - h * 0.1 + lean, sh + h * 0.04); g.lineTo(x - h * 0.22 + lean, sh + h * (0.3 - arm)); g.stroke();
  g.beginPath(); g.moveTo(x + h * 0.1 + lean, sh + h * 0.04); g.lineTo(x + h * 0.24 + lean, sh + h * (0.28 - arm * 1.2)); g.stroke();
  g.fillStyle = skin; g.beginPath(); g.arc(x + lean, y - h + hd, hd, 0, Math.PI * 2); g.fill();
  g.fillStyle = hair; g.beginPath(); g.arc(x + lean, y - h + hd * 0.8, hd, Math.PI, 0); g.fill();
}

// a little winged cupid
function cupid(g, x, y, s, r) {
  g.fillStyle = 'rgba(240,235,220,0.85)';
  g.beginPath(); g.ellipse(x - s * 0.25, y - s * 0.7, s * 0.28, s * 0.14, -0.6, 0, Math.PI * 2); g.fill();
  figure(g, x, y, s, '#d9a074', '#d9a074', { arm: 0.15 + r() * 0.2, hair: '#a0602a' });
}

function bird(g, x, y, s, c) {
  g.fillStyle = c;
  g.beginPath(); g.ellipse(x, y, s, s * 0.55, -0.2, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(x + s * 0.9, y - s * 0.35, s * 0.4, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(x - s * 0.8, y); g.lineTo(x - s * 1.8, y + s * 0.3); g.lineTo(x - s * 0.8, y + s * 0.4); g.fill();
}

// ------------------------------------------------------------------ walls

const FIELDS = { red: '#9b2b1f', yellow: '#d49a2e', black: '#1f1b17', white: '#e6dcc6', cupids: '#1f1b17' };

export function wallTexture(style) {
    const S = 512 * SHARP;
  if (style === 'garden') return texture('garden', S, S, sharp(gardenWall));
  if (style === 'masonry') return texture('wall-masonry', S, S, sharp(masonryWall));
  if (style === 'graffiti') return texture('wall-graffiti', S, S, sharp(graffitiWall));
  return texture('wall-' + style, S, S, sharp((g, w, h, r) => {
    const field = FIELDS[style], dark = style === 'black' || style === 'cupids' ? '#7d2218' : '#1f1b17';
    const socle = h * 0.8, frieze = h * 0.18; // canvas y: 0 at the top
    g.fillStyle = field; g.fillRect(0, 0, w, h);
    // the frieze along the top: light, with thin painted architecture
    g.fillStyle = style === 'white' ? '#efe7d4' : '#e9dfc8'; g.fillRect(0, 0, w, frieze);
    g.strokeStyle = '#7d2218'; g.lineWidth = 2;
    for (let x = 20; x < w; x += 64) { g.strokeRect(x, frieze * 0.3, 30, frieze * 0.6); g.beginPath(); g.moveTo(x + 15, frieze * 0.3); g.lineTo(x + 15, 4); g.stroke(); }
    g.fillStyle = '#1f1b17'; g.fillRect(0, frieze - 6, w, 6);
    // the socle
    g.fillStyle = dark; g.fillRect(0, socle, w, h - socle);
    g.strokeStyle = 'rgba(230,200,120,0.6)'; g.lineWidth = 2;
    for (let x = 0; x < w; x += w / 3) { g.strokeRect(x + 10, socle + 12, w / 3 - 20, h - socle - 24); }
    // the narrow bands between the fields, with a candelabrum each
    const band = 46;
    for (const x of [0, w - band / 2]) {
      g.fillStyle = dark; g.fillRect(x, frieze, band / 2, socle - frieze);
    }
    g.fillStyle = dark; g.fillRect(w / 2 - band / 2, frieze, band, socle - frieze);
    g.strokeStyle = '#d4b060'; g.lineWidth = 2;
    for (const cx of [w / 2, 0, w]) {
      g.beginPath(); g.moveTo(cx, frieze + 20); g.lineTo(cx, socle - 10); g.stroke();
      for (let y = frieze + 40; y < socle - 20; y += 50) { g.beginPath(); g.ellipse(cx, y, 9, 3, 0, 0, Math.PI * 2); g.stroke(); }
    }
    // a thin border inside each field, and a small picture in its middle
    g.strokeStyle = style === 'white' ? '#9b2b1f' : 'rgba(240,225,180,0.7)'; g.lineWidth = 3;
    for (const x0 of [band / 2 + 14, w / 2 + band / 2 + 14]) {
      const fw = w / 2 - band - 28;
      g.strokeRect(x0, frieze + 18, fw, socle - frieze - 36);
      const cx = x0 + fw / 2, cy = (frieze + socle) / 2;
      // a fine dotted line just inside the border, and a garland hung across the top of the field
      g.save(); g.strokeStyle = style === 'white' ? 'rgba(155,43,31,0.7)' : 'rgba(240,225,180,0.55)'; g.lineWidth = 0.8; g.setLineDash([1.5, 2.5]);
      g.strokeRect(x0 + 6, frieze + 24, fw - 12, socle - frieze - 48); g.restore();
      garland(g, x0 + 10, x0 + fw - 10, frieze + 30, 22, r);
      if (style === 'cupids') continue;
      if (r() < 0.5) bird(g, cx, cy, 9, style === 'white' ? '#5a7a4a' : '#e6dcc6');
      else {
        g.fillStyle = style === 'white' ? '#cfc3a6' : 'rgba(235,225,200,0.85)';
        g.fillRect(cx - 26, cy - 30, 52, 60);
        figure(g, cx, cy + 26, 48, ['#5a7a9a', '#9b2b1f', '#d49a2e', '#6a8a5a'][Math.floor(r() * 4)]);
      }
    }
    // the Vettii's cupids: a band of them at work over the socle
    if (style === 'cupids') {
      g.fillStyle = '#1f1b17'; g.fillRect(0, socle - 70, w, 70);
      g.strokeStyle = '#7d2218'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, socle - 70); g.lineTo(w, socle - 70); g.stroke();
      for (let x = 24; x < w; x += 46) {
        cupid(g, x, socle - 10, 44, r);
        g.fillStyle = ['#c9a24a', '#8a5a2a', '#e6dcc6', '#9b2b1f'][Math.floor(r() * 4)];
        g.fillRect(x + 8, socle - 24, 14, 12); // what each works at: an anvil, a jar, a garland
      }
    }
    // little rosettes where the candelabra cross the frieze and the socle
    for (const cx of [0, w / 2, w]) for (const y of [frieze + 10, socle + 6]) rosette(g, cx, y, 5, '#d4b060');
    age(g, w, h, r);
  }));
}

// a garland of leaves sagging between x0 and x1 from y, `sag` deep, with ribbons at its ends
function garland(g, x0, x1, y, sag, r) {
  const n = 26;
  for (let k = 0; k <= n; k++) {
    const t = k / n, x = x0 + (x1 - x0) * t, yy = y + Math.sin(Math.PI * t) * sag;
    g.fillStyle = ['#4f6e3a', '#6a8a4a', '#3f5e33'][k % 3];
    g.beginPath(); g.ellipse(x, yy, 3.4, 2.2, (t - 0.5) * 1.4 + (r() - 0.5), 0, Math.PI * 2); g.fill();
    if (k % 6 === 3) { g.fillStyle = '#c0392b'; g.beginPath(); g.arc(x, yy + 1.5, 1.6, 0, Math.PI * 2); g.fill(); }
  }
  g.strokeStyle = '#c0392b'; g.lineWidth = 1;
  for (const x of [x0, x1]) { g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 3, y + 10, x - 2, y + 18); g.stroke(); }
}

function rosette(g, x, y, s, c) {
  g.fillStyle = c;
  for (let a = 0; a < 6; a++) { const t = (a / 6) * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(t) * s * 0.55, y + Math.sin(t) * s * 0.55, s * 0.45, s * 0.25, t, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#7d2218'; g.beginPath(); g.arc(x, y, s * 0.25, 0, Math.PI * 2); g.fill();
}

// the First Style: courses of blocks in relief, each painted like a coloured stone, a tall dado of
// upright slabs below, a cornice of dentils along the top; light falls from above on each block
function masonryWall(g, w, h, r) {
  // mostly white and ochre, a red, purple or dark green block here and there, all faded
  const STONES = [['#ddd2bb', '#c4b79c'], ['#ddd2bb', '#c4b79c'], ['#c9ad74', '#a8875a'], ['#c9ad74', '#a8875a'], ['#8e3b2c', '#74301f'], ['#6a4e5e', '#523b48'], ['#4a5a4a', '#3a4a3a']];
  g.fillStyle = '#e6dcc6'; g.fillRect(0, 0, w, h);
  const vein = (x, y, bw, bh, c) => {
    g.strokeStyle = c; g.lineWidth = 0.8;
    for (let k = 0; k < 5; k++) { g.beginPath(); let px = x + r() * bw, py = y + r() * bh; g.moveTo(px, py); for (let i = 0; i < 4; i++) { px += (r() - 0.3) * bw * 0.3; py += (r() - 0.5) * bh * 0.4; g.lineTo(Math.min(x + bw, Math.max(x, px)), Math.min(y + bh, Math.max(y, py))); } g.stroke(); }
  };
  const block = (x, y, bw, bh, [c, d]) => {
    g.fillStyle = d; g.fillRect(x, y, bw, bh);
    g.fillStyle = c; g.fillRect(x + 2, y + 2, bw - 5, bh - 5);
    vein(x + 2, y + 2, bw - 5, bh - 5, 'rgba(255,250,235,0.35)'); vein(x + 2, y + 2, bw - 5, bh - 5, 'rgba(0,0,0,0.18)');
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 2, y + 2, bw - 5, 2); // lit from above
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x + 2, y + bh - 4, bw - 5, 2);
  };
  // the cornice: a band of dentils
  g.fillStyle = '#efe7d4'; g.fillRect(0, 0, w, 36);
  for (let x = 2; x < w; x += 12) { g.fillStyle = '#d8cbb0'; g.fillRect(x, 18, 8, 12); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 7, 18, 1.5, 12); }
  g.fillStyle = '#c8b898'; g.fillRect(0, 32, w, 4);
  // courses of blocks, each course offset by half a block
  const top = 40, dado = h * 0.62, ch = (dado - top) / 4;
  for (let row = 0; row < 4; row++) {
    const bw = w / 3, off = row % 2 ? -bw / 2 : 0;
    for (let x = off; x < w; x += bw) block(x, top + row * ch, bw, ch, STONES[Math.floor(r() * STONES.length)]);
  }
  // the dado of tall slabs, and the plinth
  g.fillStyle = '#cbbd9e'; g.fillRect(0, dado, w, 6);
  for (let x = 0; x < w; x += w / 4) block(x, dado + 6, w / 4, h * 0.3, STONES[[1, 3, 2, 0][Math.floor(x / (w / 4)) % 4]]);
  g.fillStyle = '#3a3430'; g.fillRect(0, h * 0.93, w, h * 0.07);
  age(g, w, h, r, { flakes: 7, fade: 0.2 });
}

// the Lupanare's white walls: a red band at the socle, and scratched into the plaster, names, tallies,
// boasts, as visitors left them
function graffitiWall(g, w, h, r) {
  g.fillStyle = '#e6dcc6'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#9b2b1f'; g.fillRect(0, h * 0.82, w, h * 0.18);
  g.fillStyle = '#7d2218'; g.fillRect(0, h * 0.8, w, 5);
  const words = ['FELIX', 'HIC', 'BENE', 'MVRTIS', 'FORTVNATA', 'VICTOR', 'ATTICE', 'SALVE', 'CRESCENS', 'IIII', 'XII', 'PRIMA', 'SVCCESSVS', 'AMPLIATVS', 'VALE', 'SABINA'];
  g.textBaseline = 'middle';
  for (let k = 0; k < 34; k++) {
    const x = r() * w * 0.9, y = h * (0.12 + r() * 0.62), s = 9 + r() * 9;
    g.save(); g.translate(x, y); g.rotate((r() - 0.5) * 0.35);
    g.font = `${s}px serif`;
    g.fillStyle = 'rgba(70,55,45,0.55)'; g.fillText(words[Math.floor(r() * words.length)], 0, 0);
    g.restore();
  }
  // tally marks and a few drawn lines
  g.strokeStyle = 'rgba(70,55,45,0.5)'; g.lineWidth = 0.8;
  for (let k = 0; k < 10; k++) { const x = r() * w, y = h * (0.2 + r() * 0.55); for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x + i * 3, y); g.lineTo(x + i * 3 + 1, y + 10); g.stroke(); } }
  age(g, w, h, r, { flakes: 12, fade: 0.1 });
}

// bare masonry, where no plaster is left: rubble stones of lava and limestone in rough courses, a band
// of brick every so often, on a canvas RUBBLE_M metres square (repeated)
export const RUBBLE_M = 3;
export function rubbleTexture() {
  return texture('rubble', 512 * SHARP, 512 * SHARP, sharp((g, w, h, r) => {
    const STONES = ['#8f7d66', '#7d6f5c', '#a08a6c', '#6f6558', '#8a8278', '#9b6a50', '#5e5650', '#b09878', '#847159'], BR = ['#a65d44', '#b3694d', '#94533d', '#9c6a50'];
    g.fillStyle = '#6a5d4c'; g.fillRect(0, 0, w, h);
    let y = 0, row = 0;
    while (y < h) {
      const brick = row % 9 === 7, rh = brick ? 9 : 14 + r() * 10;
      for (let x = -r() * 30; x < w; ) {
        const sw = brick ? 34 + r() * 8 : 22 + r() * 36;
        g.fillStyle = brick ? BR[Math.floor(r() * BR.length)] : STONES[Math.floor(r() * STONES.length)];
        g.beginPath(); g.roundRect(x + 1, y + 1, sw - 2, rh - 2, brick ? 1 : 4); g.fill();
        const d = (r() - 0.5) * 18; g.fillStyle = d > 0 ? `rgba(255,240,215,${d / 90})` : `rgba(0,0,0,${-d / 90})`; g.fill();
        g.fillStyle = 'rgba(255,245,225,0.14)'; g.fillRect(x + 2, y + 1.5, sw - 4, 2);
        x += sw;
      }
      y += rh; row++;
    }
    // (rows of the same height top and bottom, so it repeats up the wall without a seam)
    for (let k = 0; k < 1500; k++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,245,225,0.07)'; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); }
  }));
}

function gardenWall(g, w, h, r) {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#bcd4d0'); sky.addColorStop(0.7, '#d9e3d2'); sky.addColorStop(1, '#a7b88e');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 18; k++) { // shrubs and trees
    const x = r() * w, y = h * (0.35 + r() * 0.4), s = 30 + r() * 60;
    g.fillStyle = ['#4f6e3a', '#5e7f45', '#3f5e33', '#6f8a4a'][k % 4];
    g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill();
  }
  for (let k = 0; k < 40; k++) { g.fillStyle = ['#e8d6a0', '#d0583a', '#f2efe4'][k % 3]; g.beginPath(); g.arc(r() * w, h * (0.3 + r() * 0.5), 3, 0, Math.PI * 2); g.fill(); }
  for (let k = 0; k < 4; k++) bird(g, r() * w, h * (0.2 + r() * 0.4), 9, ['#3a5a8a', '#e8e0c8', '#8a3a2a'][k % 3]);
  // the low trellis fence in front
  g.strokeStyle = '#efe6cf'; g.lineWidth = 4;
  for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, h * 0.78); g.lineTo(x + 32, h * 0.92); g.moveTo(x + 32, h * 0.78); g.lineTo(x, h * 0.92); g.stroke(); }
  g.fillStyle = '#1f1b17'; g.fillRect(0, h * 0.92, w, h * 0.08);
  age(g, w, h, r);
}

// ------------------------------------------------------------------ pictures on a wall

// The photo of a famous piece (aspect: the width of the place it fills over its height), over the
// drawing `draw` makes (one of PICTURES or MOSAICS) until it has loaded, and for good offline.
export function artTexture(id, aspect = 1, draw = null) {
  const key = 'art-' + id;
  if (cache.has(key)) return cache.get(key);
  const W = 512, H = Math.max(64, Math.round(512 / aspect));
  return photo(texture(key, W, H, (g, w, h, r) => { if (draw) draw(g, w, h, r); else { g.fillStyle = '#8a6a4a'; g.fillRect(0, 0, w, h); } }, false), id);
}
export const PICTURE_DRAW = name => (g, w, h, r) => PICTURES[name](g, w, h, r);
export const MOSAIC_DRAW = name => (g, w, h, r) => MOSAICS[name](g, w, h, r);

export function pictureTexture(name) {
  return texture('pic-' + name, 1024, 512, (g, w, h, r) => PICTURES[name](g, w, h, r), false);
}

const frame = (g, w, h, colour = '#9b2b1f') => {
  g.fillStyle = colour; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f1b17'; g.fillRect(0, h * 0.82, w, h * 0.18);
};

const PICTURES = {
  menander(g, w, h, r) {
    frame(g, w, h, '#7a8a5a');
    g.fillStyle = '#6f9ab0'; g.fillRect(w * 0.3, h * 0.08, w * 0.4, h * 0.7);
    g.strokeStyle = '#e6dcc6'; g.lineWidth = 6; g.strokeRect(w * 0.3, h * 0.08, w * 0.4, h * 0.7);
    // the chair, and the poet in a pale yellow cloak, a scroll in his hand, a wreath of ivy
    g.fillStyle = '#7a4a22'; g.fillRect(w * 0.44, h * 0.5, w * 0.14, h * 0.05); g.fillRect(w * 0.45, h * 0.55, 8, h * 0.2); g.fillRect(w * 0.56, h * 0.55, 8, h * 0.2);
    g.fillStyle = '#e9d9a0';
    g.beginPath(); g.moveTo(w * 0.45, h * 0.28); g.lineTo(w * 0.55, h * 0.28); g.lineTo(w * 0.6, h * 0.72); g.lineTo(w * 0.42, h * 0.72); g.fill();
    g.fillStyle = '#c98a5e'; g.beginPath(); g.arc(w * 0.5, h * 0.22, h * 0.06, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#4f6e3a'; g.beginPath(); g.arc(w * 0.5, h * 0.18, h * 0.06, Math.PI, 0); g.fill();
    g.fillStyle = '#f2ecd8'; g.fillRect(w * 0.4, h * 0.42, w * 0.06, h * 0.03);
    g.fillStyle = '#e6dcc6'; g.font = `bold ${h * 0.05}px serif`; g.textAlign = 'center'; g.fillText('MENANDER', w * 0.5, h * 0.8);
    age(g, w, h, r, { flakes: 6 });
  },
  venus(g, w, h, r) {
    frame(g, w, h, '#1f1b17');
    const sea = g.createLinearGradient(0, h * 0.05, 0, h * 0.8);
    sea.addColorStop(0, '#9cc4d0'); sea.addColorStop(1, '#3f7a9a');
    g.fillStyle = sea; g.fillRect(w * 0.08, h * 0.05, w * 0.84, h * 0.75);
    for (let k = 0; k < 30; k++) { g.strokeStyle = 'rgba(240,250,255,0.5)'; g.lineWidth = 2; const x = w * (0.1 + r() * 0.8), y = h * (0.3 + r() * 0.45); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 15, y - 6, x + 30, y); g.stroke(); }
    // the shell, and Venus lying in it, her red cloak blowing over her
    g.fillStyle = '#f0c8b4';
    g.beginPath(); g.moveTo(w * 0.35, h * 0.62); g.quadraticCurveTo(w * 0.5, h * 0.25, w * 0.66, h * 0.62); g.closePath(); g.fill();
    g.strokeStyle = '#d8a090'; g.lineWidth = 3;
    for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(w * 0.505, h * 0.62); g.lineTo(w * (0.36 + k * 0.037), h * 0.5 - Math.sin((k / 8) * Math.PI) * h * 0.18); g.stroke(); }
    g.fillStyle = '#f3dcc4';
    g.beginPath(); g.ellipse(w * 0.5, h * 0.52, w * 0.12, h * 0.05, -0.15, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(w * 0.39, h * 0.47, h * 0.04, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8a5a2a'; g.beginPath(); g.arc(w * 0.39, h * 0.455, h * 0.04, Math.PI, 0); g.fill();
    g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(w * 0.42, h * 0.38); g.quadraticCurveTo(w * 0.55, h * 0.2, w * 0.6, h * 0.4); g.lineTo(w * 0.55, h * 0.45); g.closePath(); g.fill();
    cupid(g, w * 0.25, h * 0.62, h * 0.18, r);
    cupid(g, w * 0.76, h * 0.62, h * 0.18, r);
    age(g, w, h, r, { flakes: 8 });
  },
  lararium(g, w, h, r) {
    frame(g, w, h, '#e6dcc6');
    g.fillStyle = '#d49a2e'; g.fillRect(w * 0.2, h * 0.05, w * 0.6, h * 0.08); // the pediment
    figure(g, w * 0.3, h * 0.6, h * 0.4, '#3a5a8a', '#c98a5e', { arm: 0.15 }); // Mercury, with his purse
    g.fillStyle = '#d49a2e'; g.beginPath(); g.arc(w * 0.26, h * 0.42, 8, 0, Math.PI * 2); g.fill();
    figure(g, w * 0.7, h * 0.6, h * 0.4, '#7a3a8a', '#c98a5e', { arm: 0.2 }); // Bacchus, with his cup
    figure(g, w * 0.5, h * 0.62, h * 0.44, '#e9e0c8', '#c98a5e', { arm: 0.1 }); // the genius, veiled, at the altar
    for (const x of [0.4, 0.6]) figure(g, w * x, h * 0.6, h * 0.34, '#2f7a45', '#c98a5e', { arm: 0.3 }); // the dancing lares
    g.strokeStyle = '#4f6e3a'; g.lineWidth = 8; // the snakes
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(w * 0.5 + s * w * 0.35, h * 0.75);
      for (let k = 1; k <= 8; k++) g.lineTo(w * 0.5 + s * w * (0.35 - k * 0.035), h * 0.75 + Math.sin(k * 1.4) * 12);
      g.stroke();
    }
    age(g, w, h, r, { flakes: 5 });
  },
  pyramus(g, w, h, r) {
    frame(g, w, h, '#e6dcc6');
    g.fillStyle = '#a7b88e'; g.fillRect(w * 0.1, h * 0.08, w * 0.8, h * 0.7);
    g.fillStyle = '#4f6e3a'; g.beginPath(); g.arc(w * 0.75, h * 0.35, h * 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8fa8b8'; g.fillRect(w * 0.15, h * 0.62, w * 0.25, h * 0.08); // the spring
    // Pyramus lying dead, Thisbe falling on his sword
    g.fillStyle = '#c98a5e'; g.fillRect(w * 0.3, h * 0.66, w * 0.25, h * 0.05);
    g.fillStyle = '#c0392b'; g.fillRect(w * 0.33, h * 0.64, w * 0.15, h * 0.04);
    figure(g, w * 0.55, h * 0.7, h * 0.4, '#e9d9a0', '#e2b08a', { lean: -20, arm: 0.2 });
    g.fillStyle = '#c9a24a'; g.beginPath(); g.ellipse(w * 0.8, h * 0.66, w * 0.07, h * 0.05, 0, 0, Math.PI * 2); g.fill(); // the lioness
    age(g, w, h, r, { flakes: 6 });
  },
  couples(g, w, h, r) {
    frame(g, w, h, '#e6dcc6');
    for (let k = 0; k < 4; k++) {
      const x = w * (0.04 + k * 0.245), pw = w * 0.2;
      g.strokeStyle = '#9b2b1f'; g.lineWidth = 6; g.strokeRect(x, h * 0.15, pw, h * 0.55);
      g.fillStyle = '#d8cbb0'; g.fillRect(x + 6, h * 0.15 + 6, pw - 12, h * 0.55 - 12);
      g.fillStyle = '#7a4a22'; g.fillRect(x + 20, h * 0.5, pw - 40, h * 0.06); // the bed
      g.fillStyle = '#e9e0c8'; g.fillRect(x + 22, h * 0.45, pw - 44, h * 0.06);
      figure(g, x + pw * 0.38, h * 0.5, h * 0.24, ['#9b2b1f', '#3a5a8a', '#2f7a45', '#d49a2e'][k], '#c98a5e', { lean: 6 });
      figure(g, x + pw * 0.62, h * 0.5, h * 0.22, ['#e6c8a0', '#c0392b', '#7a3a8a', '#e9e0c8'][k], '#e2b08a', { lean: -6, hair: '#5a3018' });
    }
    age(g, w, h, r, { flakes: 9 });
  },
};

// ------------------------------------------------------------------ floors

export function floorTexture(kind) {
  return texture('floor-' + kind, 256 * SHARP, 256 * SHARP, sharp((g, w, h, r) => FLOORS[kind](g, w, h, r)));
}

// tesserae a few pixels each, in one colour give or take
function tesserae(g, w, h, r, colour, size = 6, vary = 14) {
  const [cr, cg, cb] = colour;
  for (let y = 0; y < h; y += size) for (let x = 0; x < w; x += size) {
    const v = (r() - 0.5) * vary;
    g.fillStyle = `rgb(${cr + v},${cg + v},${cb + v})`;
    g.fillRect(x + 0.6, y + 0.6, size - 1.2, size - 1.2);
  }
}

const FLOORS = {
  tesserae(g, w, h, r) {
    g.fillStyle = '#6b6258'; g.fillRect(0, 0, w, h);
    tesserae(g, w, h, r, [232, 226, 210]);
    g.fillStyle = 'rgba(30,26,22,0.9)';
    g.fillRect(0, 0, w, 12); g.fillRect(0, 0, 12, h); // a black band, seen as a grid of squares tiled
  },
  black(g, w, h, r) {
    g.fillStyle = '#2a2622'; g.fillRect(0, 0, w, h);
    tesserae(g, w, h, r, [42, 38, 34], 6, 10);
    g.fillStyle = '#e8e2d2';
    for (let y = 32; y < h; y += 64) for (let x = 32; x < w; x += 64) { g.fillRect(x - 9, y - 3, 18, 6); g.fillRect(x - 3, y - 9, 6, 18); }
  },
  signinum(g, w, h, r) {
    g.fillStyle = '#9a5240'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 3000; k++) { g.fillStyle = r() < 0.5 ? 'rgba(60,20,10,0.15)' : 'rgba(220,170,140,0.15)'; g.fillRect(r() * w, r() * h, 2, 2); }
    g.fillStyle = '#efe8d8';
    for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x < w; x += 32) g.fillRect(x - 2, y - 2, 5, 5);
  },
  sectile(g, w, h) {
    // cubes seen from above a corner: each a rhombus top and two sides, in three tones
    const s = 32, tones = ['#ece6d6', '#3a3430', '#2f6a4a'];
    g.fillStyle = tones[1]; g.fillRect(0, 0, w, h);
    for (let row = -1; row < h / (s * 1.5) + 1; row++) {
      for (let col = -1; col < w / (s * Math.sqrt(3)) + 1; col++) {
        const cx = col * s * Math.sqrt(3) + (row % 2 ? (s * Math.sqrt(3)) / 2 : 0), cy = row * s * 1.5;
        const hx = (s * Math.sqrt(3)) / 2;
        const faces = [[[cx, cy - s], [cx + hx, cy - s / 2], [cx, cy], [cx - hx, cy - s / 2]], [[cx - hx, cy - s / 2], [cx, cy], [cx, cy + s], [cx - hx, cy + s / 2]], [[cx + hx, cy - s / 2], [cx + hx, cy + s / 2], [cx, cy + s], [cx, cy]]];
        faces.forEach((f, k) => { g.fillStyle = tones[k]; g.beginPath(); f.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.fill(); });
      }
    }
  },
  marble(g, w, h, r) {
    g.fillStyle = '#e8e0cc'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 160; k++) {
      g.fillStyle = ['#d8d0bc', '#b8a890', '#9a8a7a', '#c8b8a0', '#7a8a7a', '#c09080', '#f0ece0'][k % 7];
      const x = r() * w, y = r() * h, s = 8 + r() * 20;
      g.beginPath(); for (let a = 0; a < 5; a++) { const t = (a / 5) * Math.PI * 2 + r(); g.lineTo(x + Math.cos(t) * s, y + Math.sin(t) * s); } g.fill();
    }
  },
  lava(g, w, h, r) {
    g.fillStyle = '#4a4640'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 40) for (let x = (y / 40) % 2 ? 20 : 0; x < w + 40; x += 50 + r() * 20) {
      const v = 70 + r() * 30; g.fillStyle = `rgb(${v},${v - 3},${v - 6})`; g.fillRect(x + 2, y + 2, 44 + r() * 10, 36);
    }
  },
  planks(g, w, h, r) {
    // the boards of a ceiling, seen from below, along u
    for (let y = 0; y < h; y += 32) { const v = (r() - 0.5) * 20; g.fillStyle = `rgb(${120 + v},${84 + v * 0.7},${52 + v * 0.5})`; g.fillRect(0, y, w, 31); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, y + 30, w, 2); }
    for (let k = 0; k < 300; k++) { g.fillStyle = 'rgba(60,35,20,0.15)'; g.fillRect(r() * w, r() * h, 10 + r() * 30, 1); }
  },
  tiles(g, w, h, r) {
    // flat tiles (tegulae) in rows, a rounded tile (imbrex) over each joint, along v
    g.fillStyle = '#8a4a2e'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) for (let y = 0; y < h; y += 48) {
      const v = (r() - 0.5) * 24; g.fillStyle = `rgb(${172 + v},${92 + v * 0.6},${58 + v * 0.4})`; g.fillRect(x + 1, y + 1, 30, 46);
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + 1, y + 40, 30, 7);
    }
    for (let x = 0; x < w; x += 32) {
      const grd = g.createLinearGradient(x - 6, 0, x + 6, 0); grd.addColorStop(0, '#6a3420'); grd.addColorStop(0.5, '#c0704a'); grd.addColorStop(1, '#6a3420');
      g.fillStyle = grd; g.fillRect(x - 6, 0, 12, h);
    }
  },
  soil(g, w, h, r) {
    g.fillStyle = '#7a6a4a'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { g.fillStyle = ['#5f7f45', '#6f8f4f', '#8a7a5a', '#4f6e3a'][k % 4]; g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); }
  },
};

// ------------------------------------------------------------------ mosaics

export function mosaicTexture(name) {
  const [w, h] = name === 'alexander' ? [1024, 544] : [512, 512];
  return texture('mosaic-' + name, w, h, (g, W, H, r) => MOSAICS[name](g, W, H, r), false);
}

const MOSAICS = {
  cave(g, w, h, r) {
    tesserae(g, w, h, r, [228, 222, 206], 5);
    g.fillStyle = '#1f1b17'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h);
    // the dog, black with its white patches and red collar, straining at its chain
    g.fillStyle = '#1f1b17';
    g.beginPath(); g.ellipse(w * 0.48, h * 0.48, w * 0.22, h * 0.1, -0.1, 0, Math.PI * 2); g.fill(); // body
    g.beginPath(); g.ellipse(w * 0.74, h * 0.36, w * 0.07, h * 0.06, 0.3, 0, Math.PI * 2); g.fill(); // head
    g.beginPath(); g.moveTo(w * 0.78, h * 0.32); g.lineTo(w * 0.86, h * 0.38); g.lineTo(w * 0.78, h * 0.42); g.fill(); // snout
    g.beginPath(); g.moveTo(w * 0.7, h * 0.3); g.lineTo(w * 0.72, h * 0.2); g.lineTo(w * 0.76, h * 0.3); g.fill(); // ear
    g.lineWidth = 12; g.strokeStyle = '#1f1b17'; g.lineCap = 'round';
    for (const [x0, x1] of [[0.32, 0.26], [0.38, 0.4], [0.58, 0.62], [0.64, 0.7]]) { g.beginPath(); g.moveTo(w * x0, h * 0.52); g.lineTo(w * x1, h * 0.7); g.stroke(); }
    g.beginPath(); g.moveTo(w * 0.27, h * 0.46); g.quadraticCurveTo(w * 0.15, h * 0.35, w * 0.18, h * 0.28); g.stroke(); // tail up
    g.fillStyle = '#efe8d8'; g.fillRect(w * 0.52, h * 0.46, 12, 8); g.fillRect(w * 0.43, h * 0.5, 10, 6);
    g.strokeStyle = '#b02a20'; g.lineWidth = 8; g.beginPath(); g.moveTo(w * 0.68, h * 0.33); g.lineTo(w * 0.69, h * 0.43); g.stroke();
    g.strokeStyle = '#4a4640'; g.lineWidth = 3; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(w * 0.69, h * 0.42); g.quadraticCurveTo(w * 0.5, h * 0.75, w * 0.12, h * 0.6); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#1f1b17'; g.font = `bold ${h * 0.11}px serif`; g.textAlign = 'center'; g.fillText('CAVE CANEM', w * 0.5, h * 0.9);
  },
  have(g, w, h, r) {
    tesserae(g, w, h, r, [214, 196, 160], 5);
    g.fillStyle = '#1f1b17'; g.font = `bold ${h * 0.45}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HAVE', w * 0.5, h * 0.55);
  },
  alexander(g, w, h, r) {
    // earth tones, the ground, the Persians' spears against a pale sky, the dead tree
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#d8cbb0'); sky.addColorStop(1, '#a88a62');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#4a3a2a'; g.lineWidth = 3;
    for (let k = 0; k < 18; k++) { const x = w * (0.45 + k * 0.025); g.beginPath(); g.moveTo(x, h * 0.75); g.lineTo(x + w * 0.05, h * 0.05); g.stroke(); }
    g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.3, h * 0.6); g.lineTo(w * 0.32, h * 0.05); g.moveTo(w * 0.31, h * 0.25); g.lineTo(w * 0.24, h * 0.12); g.stroke();
    const horse = (x, y, s, c, flip = 1) => {
      g.fillStyle = c;
      g.beginPath(); g.ellipse(x, y, s, s * 0.45, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(x + flip * s * 0.7, y - s * 0.2); g.lineTo(x + flip * s * 1.25, y - s * 0.85); g.lineTo(x + flip * s * 1.45, y - s * 0.65); g.lineTo(x + flip * s * 0.95, y + s * 0.05); g.fill();
      g.strokeStyle = c; g.lineWidth = s * 0.14;
      for (const dx of [-0.6, -0.3, 0.4, 0.7]) { g.beginPath(); g.moveTo(x + dx * s, y + s * 0.3); g.lineTo(x + dx * s + flip * s * 0.15, y + s * 1.05); g.stroke(); }
    };
    // Alexander, bareheaded on Bucephalus, charging from the left
    horse(w * 0.2, h * 0.58, w * 0.08, '#3a2a1e');
    figure(g, w * 0.22, h * 0.52, h * 0.3, '#8a6a3a', '#c98a5e', { arm: 0.2, lean: 6 });
    g.strokeStyle = '#2a1e14'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.24, h * 0.36); g.lineTo(w * 0.42, h * 0.52); g.stroke();
    // a Persian falling, run through
    horse(w * 0.42, h * 0.66, w * 0.07, '#6a5a4a', -1);
    figure(g, w * 0.44, h * 0.62, h * 0.24, '#b02a20', '#c98a5e', { lean: -14, arm: 0.35 });
    // Darius, in his chariot, turning back towards him, his horses fleeing to the right
    g.fillStyle = '#5a3a20'; g.fillRect(w * 0.6, h * 0.42, w * 0.12, h * 0.16);
    g.fillStyle = '#8a6a3a'; g.beginPath(); g.arc(w * 0.66, h * 0.62, h * 0.08, 0, Math.PI * 2); g.fill();
    figure(g, w * 0.66, h * 0.44, h * 0.26, '#7a2a6a', '#c98a5e', { arm: 0.4, hair: '#1f1b17' });
    for (const x of [0.78, 0.86]) horse(w * x, h * 0.62, w * 0.07, '#1f1b17');
    for (let k = 0; k < 6; k++) figure(g, w * (0.5 + k * 0.08), h * 0.38, h * 0.18, ['#b02a20', '#d49a2e', '#5a7a9a'][k % 3], '#c98a5e', { arm: 0.3 });
    // tesserae over it all, and the part lost at the lower left
    for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) { if (r() < 0.3) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,250,235'},0.12)`; g.fillRect(x, y, 3, 3); } }
    g.fillStyle = '#a89a80';
    g.beginPath(); g.moveTo(0, h * 0.55); g.lineTo(w * 0.12, h * 0.62); g.lineTo(w * 0.1, h * 0.8); g.lineTo(w * 0.3, h * 0.9); g.lineTo(w * 0.28, h); g.lineTo(0, h); g.fill();
    // the border of little cubes
    g.strokeStyle = '#efe8d8'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
    g.strokeStyle = '#1f1b17'; g.lineWidth = 4; g.strokeRect(16, 16, w - 32, h - 32);
  },
};
