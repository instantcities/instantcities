// The kit for drawing a landmark's facade by hand: an elevation of one wall, in metres, on a
// canvas, so a city's facades.js can say "a pair of lancet windows from 30 to 46 m" and the Belfort
// looks like the Belfort. Drawn from photos as a reference, in the same flat painted style as the
// rest of the city; no photo goes into the game.
import * as THREE from 'three';

// A canvas for an elevation `w` metres wide and `h` metres tall, at `px` pixels a metre, that draw()
// paints in metres: x from -w/2 to w/2 across the middle of the wall, y up from the ground.
export function elevation(w, h, px, draw) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * px);
  c.height = Math.ceil(h * px);
  const g = c.getContext('2d');
  g.setTransform(px, 0, 0, -px, (w / 2) * px, h * px);
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

// shade a colour (#rrggbb, or rgb() as shade gives back) by d (-1 darker .. 1 lighter)
export function shade(col, d) {
  const n = parseInt(col.slice(1), 16);
  const rgb = col[0] === '#' ? [n >> 16, (n >> 8) & 255, n & 255] : col.match(/\d+/g).map(Number);
  const f = v => Math.round(d < 0 ? v * (1 + d) : v + (255 - v) * d);
  return `rgb(${rgb.map(f).join(', ')})`;
}

// ashlar: courses of blocks, each a little lighter or darker than `hex`
export function ashlar(g, x0, y0, x1, y1, hex, { course = 0.6, seed = 3, vary = 0.07 } = {}) {
  const r = rng(seed);
  g.fillStyle = shade(hex, -0.18);
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0, row = 0; y < y1; y += course, row++) {
    let x = x0 - (row % 2 ? course * 1.1 : 0);
    while (x < x1) {
      const bw = course * (1.6 + r() * 1.4);
      g.fillStyle = shade(hex, (r() - 0.5) * 2 * vary);
      g.fillRect(Math.max(x, x0) + 0.04, y + 0.04, Math.min(x + bw, x1) - Math.max(x, x0) - 0.08, Math.min(course, y1 - y) - 0.08);
      x += bw;
    }
  }
}

// a pointed (equilateral) arch opening as a path: the sides from y0, the point at the top, h tall
export function archPath(g, cx, y0, w, h) {
  const r = w, spring = y0 + h - r * Math.sin(Math.PI / 3);
  g.beginPath();
  g.moveTo(cx - w / 2, y0);
  g.lineTo(cx - w / 2, spring);
  for (let a = 0; a <= 1.0001; a += 0.1) { // left half: an arc about the right-hand springing point
    const t = Math.PI - (Math.PI / 3) * a;
    g.lineTo(cx + w / 2 + r * Math.cos(t), spring + r * Math.sin(t));
  }
  for (let a = 1; a >= -0.0001; a -= 0.1) { // right half: about the left-hand one
    const t = (Math.PI / 3) * a;
    g.lineTo(cx - w / 2 + r * Math.cos(t), spring + r * Math.sin(t));
  }
  g.lineTo(cx + w / 2, y0);
  g.closePath();
}

// a tall Gothic lancet: a stone frame, a dark opening (louvred in a belfry), a mullion and a
// little trefoil in its point
export function lancet(g, cx, y0, w, h, { stone = '#b9b2a3', dark = '#24272d', louvres = false, mullion = true } = {}) {
  g.fillStyle = shade(stone, -0.25);
  archPath(g, cx, y0 - 0.3, w + 0.8, h + 0.6);
  g.fill();
  g.fillStyle = dark;
  archPath(g, cx, y0, w, h);
  g.fill();
  if (louvres) {
    g.save();
    archPath(g, cx, y0, w, h);
    g.clip();
    g.fillStyle = shade(dark, 0.22);
    for (let y = y0 + 0.4; y < y0 + h; y += 0.7) g.fillRect(cx - w / 2, y, w, 0.18);
    g.restore();
  }
  if (mullion) {
    const top = y0 + h - w * 0.75;
    g.fillStyle = stone;
    g.fillRect(cx - 0.12, y0, 0.24, top - y0);
    g.beginPath(); // the trefoil: three little rings in the point
    g.lineWidth = 0.2;
    g.strokeStyle = stone;
    const rr = w * 0.13;
    for (const [dx, dy] of [[-rr * 0.9, 0], [rr * 0.9, 0], [0, rr * 1.4]]) {
      g.moveTo(cx + dx + rr, top + w * 0.2 + dy);
      g.arc(cx + dx, top + w * 0.2 + dy, rr, 0, Math.PI * 2);
    }
    g.stroke();
    g.fillRect(cx - w / 2, top - 0.1, w, 0.2);
  }
}

// a band of moulding across the wall: a light top, a shadow under it
export function stringCourse(g, x0, x1, y, hex, h = 0.5) {
  g.fillStyle = shade(hex, -0.35);
  g.fillRect(x0, y - h * 0.6, x1 - x0, h * 0.6);
  g.fillStyle = shade(hex, 0.15);
  g.fillRect(x0, y, x1 - x0, h * 0.5);
}

// an openwork stone parapet: a rail and a row of quatrefoils between posts
export function balustrade(g, x0, x1, y0, h, hex, step = 1.6) {
  g.fillStyle = shade(hex, 0.08);
  g.fillRect(x0, y0, x1 - x0, h);
  g.fillStyle = shade(hex, -0.55);
  const r = Math.min(step, h) * 0.32;
  for (let x = x0 + step / 2; x < x1; x += step) {
    g.beginPath();
    for (const [dx, dy] of [[-r * 0.5, 0], [r * 0.5, 0], [0, -r * 0.5], [0, r * 0.5]]) {
      g.moveTo(x + dx + r * 0.55, y0 + h / 2 + dy);
      g.arc(x + dx, y0 + h / 2 + dy, r * 0.55, 0, Math.PI * 2);
    }
    g.fill();
  }
  g.fillStyle = shade(hex, 0.2);
  g.fillRect(x0, y0 + h - 0.25, x1 - x0, 0.25);
}

// a clock face: a gilded ring, a dark dial, gold hour marks and hands at ten past ten
export function clock(g, cx, cy, r, { gold = '#d9a72e', dial = '#1d2533' } = {}) {
  g.fillStyle = shade(gold, -0.3);
  g.beginPath(); g.arc(cx, cy, r * 1.08, 0, Math.PI * 2); g.fill();
  g.fillStyle = gold;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = dial;
  g.beginPath(); g.arc(cx, cy, r * 0.82, 0, Math.PI * 2); g.fill();
  g.fillStyle = gold;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, s = k % 3 ? 0.07 : 0.11;
    g.beginPath(); g.arc(cx + Math.cos(a) * r * 0.68, cy + Math.sin(a) * r * 0.68, r * s, 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = gold;
  g.lineCap = 'round';
  for (const [a, l, wd] of [[Math.PI * 0.5 - (10 / 12) * Math.PI * 2, 0.42, 0.09], [Math.PI * 0.5 - (2 / 12) * Math.PI * 2, 0.6, 0.06]]) {
    g.lineWidth = r * wd;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r * l, cy + Math.sin(a) * r * l); g.stroke();
  }
}

// a rectangular stone-cross window (Flemish, Renaissance): a frame, glass in four lights, a
// lintel above
export function crossWindow(g, cx, y0, w, h, { stone = '#cfc6b2', glass = '#2c3540', lintel = true } = {}) {
  g.fillStyle = shade(stone, -0.3);
  g.fillRect(cx - w / 2 - 0.35, y0 - 0.35, w + 0.7, h + 0.7);
  g.fillStyle = glass;
  g.fillRect(cx - w / 2, y0, w, h);
  g.fillStyle = shade(glass, 0.18); // a glint in the upper lights
  g.fillRect(cx - w / 2 + 0.15, y0 + h * 0.7, w / 2 - 0.3, h * 0.25);
  g.fillStyle = stone;
  g.fillRect(cx - 0.11, y0, 0.22, h);
  g.fillRect(cx - w / 2, y0 + h * 0.66, w, 0.2);
  if (lintel) {
    g.fillStyle = shade(stone, 0.1);
    g.fillRect(cx - w / 2 - 0.5, y0 + h + 0.35, w + 1, 0.35);
  }
}

// a round-headed (Romanesque) opening, h tall from y0
export function roundArch(g, cx, y0, w, h, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(cx - w / 2, y0);
  g.lineTo(cx - w / 2, y0 + h - w / 2);
  g.arc(cx, y0 + h - w / 2, w / 2, Math.PI, 0, true);
  g.lineTo(cx + w / 2, y0);
  g.closePath();
  g.fill();
}

// a flat column standing out of the wall: a base, a shaft with a lit and a shaded side, a capital
export function pilaster(g, x, y0, y1, w, hex) {
  g.fillStyle = shade(hex, 0.12);
  g.fillRect(x - w / 2, y0, w, y1 - y0);
  g.fillStyle = shade(hex, -0.28);
  g.fillRect(x + w / 2 - w * 0.22, y0, w * 0.22, y1 - y0);
  g.fillStyle = shade(hex, 0.2);
  g.fillRect(x - w * 0.7, y0, w * 1.4, 0.4);
  g.fillRect(x - w * 0.75, y1 - 0.45, w * 1.5, 0.45);
}

// a rose window: a stone ring, dark glass, spokes and a ring of little foils
export function rose(g, cx, cy, r, { stone = '#b9b2a3', glass = '#28304a' } = {}) {
  g.fillStyle = shade(stone, -0.25);
  g.beginPath(); g.arc(cx, cy, r * 1.12, 0, Math.PI * 2); g.fill();
  g.fillStyle = glass;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = stone;
  g.lineWidth = r * 0.06;
  g.beginPath();
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    g.moveTo(cx + Math.cos(a) * r * 0.25, cy + Math.sin(a) * r * 0.25);
    g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.stroke();
  g.beginPath(); g.arc(cx, cy, r * 0.25, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(cx, cy, r * 0.62, 0, Math.PI * 2); g.stroke();
}

// brick courses, a header now and then a little darker
export function brick(g, x0, y0, x1, y1, hex, { course = 0.22, seed = 5 } = {}) {
  const r = rng(seed);
  g.fillStyle = shade(hex, 0.25); // the mortar
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0, row = 0; y < y1; y += course, row++) {
    for (let x = x0 - (row % 2 ? 0.3 : 0); x < x1; x += 0.6) {
      g.fillStyle = shade(hex, (r() - 0.5) * 0.2);
      g.fillRect(Math.max(x, x0) + 0.02, y + 0.02, 0.56, course - 0.04);
    }
  }
}

// a statue in an arched niche: a dark recess, a pale figure on a little bracket
export function niche(g, cx, y0, w, h, hex) {
  g.fillStyle = shade(hex, -0.45);
  archPath(g, cx, y0, w, h);
  g.fill();
  g.fillStyle = shade(hex, 0.22);
  g.fillRect(cx - w * 0.45, y0, w * 0.9, 0.25);
  const fw = w * 0.36, fh = h * 0.72;
  g.beginPath();
  g.moveTo(cx - fw / 2, y0 + 0.25);
  g.lineTo(cx - fw * 0.38, y0 + fh * 0.8);
  g.lineTo(cx + fw * 0.38, y0 + fh * 0.8);
  g.lineTo(cx + fw / 2, y0 + 0.25);
  g.fill();
  g.beginPath(); g.arc(cx, y0 + fh * 0.88, fw * 0.24, 0, Math.PI * 2); g.fill();
}
