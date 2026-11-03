// Het Lam Gods, the Ghent Altarpiece (Hubert and Jan van Eyck, finished 1432), drawn from memory
// with a few shapes on a canvas: the open polyptych, the upper row of Adam, the singing angels, the
// Virgin, God, John the Baptist, the angels with instruments and Eve, over the lower row where
// the Adoration of the Mystic Lamb fills the middle, the Just Judges and the Knights of Christ on its
// left and the Holy Hermits and the Pilgrims on its right. Far too simple, and meant to be seen from a
// few metres behind glass.
import * as THREE from 'three';

const rngOf = seed => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// people in a group: robes in a few colours, heads in skin and hair, standing in a crowd
function crowd(g, x, y, w, h, rnd, robes, { rows = 2, per = 6, hats = false } = {}) {
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < per; i++) {
      const px = x + ((i + 0.5 + (rnd() - 0.5) * 0.4) / per) * w, ph = h * (0.42 - r * 0.04), py = y + h * (0.52 + r * 0.14), pw = (w / per) * 0.95;
      g.fillStyle = robes[Math.floor(rnd() * robes.length)];
      g.beginPath(); g.moveTo(px - pw / 2, py + ph); g.lineTo(px - pw * 0.28, py); g.lineTo(px + pw * 0.28, py); g.lineTo(px + pw / 2, py + ph); g.closePath(); g.fill();
      g.fillStyle = ['#e2b48c', '#d79f78', '#ecc6a0'][Math.floor(rnd() * 3)];
      g.beginPath(); g.arc(px, py - pw * 0.12, pw * 0.2, 0, 7); g.fill();
      g.fillStyle = hats ? robes[Math.floor(rnd() * robes.length)] : ['#3d2a1a', '#8a6a3a', '#c9c2b0'][Math.floor(rnd() * 3)];
      g.beginPath(); g.arc(px, py - pw * 0.2, pw * 0.2, Math.PI, 0); g.fill();
    }
  }
}

function sky(g, x, y, w, h, top = '#7aa5d8', low = '#bfd8e8') {
  const grad = g.createLinearGradient(0, y, 0, y + h * 0.5);
  grad.addColorStop(0, top); grad.addColorStop(1, low);
  g.fillStyle = grad; g.fillRect(x, y, w, h * 0.5);
}

function meadow(g, x, y, w, h, rnd, tone = 1) {
  const grad = g.createLinearGradient(0, y + h * 0.45, 0, y + h);
  grad.addColorStop(0, `rgb(${110 * tone | 0}, ${160 * tone | 0}, ${70 * tone | 0})`); grad.addColorStop(1, `rgb(${40 * tone | 0}, ${100 * tone | 0}, ${40 * tone | 0})`);
  g.fillStyle = grad; g.fillRect(x, y + h * 0.45, w, h * 0.55);
  for (let k = 0; k < w * 0.7; k++) {
    g.fillStyle = ['#f3e14a', '#f4f0e6', '#d8506a', '#8fcf6a'][Math.floor(rnd() * 4)];
    g.fillRect(x + rnd() * w, y + h * (0.5 + rnd() * 0.5), 2, 2);
  }
}

export function lamGodsTexture() {
  const W = 1536, H = 900, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d'), rnd = rngOf(1432);
  const gold = '#d8b04c';
  g.fillStyle = '#3b2616'; g.fillRect(0, 0, W, H); // the frame
  const pad = 14;
  // the panels: x, y, w, h. The lower row's middle is as wide as two of the others.
  const low = [0, 0, 0, 0, 0], lowW = [1, 1, 2, 1, 1], tw = 6, lowY = 360, lowH = H - lowY - pad;
  let x = pad;
  const unit = (W - 2 * pad) / tw;
  const lowPanels = lowW.map((u, i) => { const p = { x, y: lowY, w: u * unit - 6, h: lowH }; x += u * unit; return p; });
  const upW = [1, 1, 1.2, 1.2, 1.2, 1, 1], upTotal = upW.reduce((a, b) => a + b, 0);
  x = pad;
  const upPanels = upW.map(u => { const p = { x, y: pad, w: (u / upTotal) * (W - 2 * pad) - 6, h: lowY - pad - 8 }; x += (u / upTotal) * (W - 2 * pad); return p; });

  // ---- the lower row
  const [judges, knights, lamb, hermits, pilgrims] = lowPanels;
  for (const p of lowPanels) { sky(g, p.x, p.y, p.w, p.h); meadow(g, p.x, p.y, p.w, p.h, rnd, p === lamb ? 1.1 : 0.9); }
  // far hills, a town and trees behind the lamb
  g.fillStyle = '#7fa66a'; g.beginPath(); g.moveTo(lamb.x, lamb.y + lamb.h * 0.5); g.quadraticCurveTo(lamb.x + lamb.w * 0.3, lamb.y + lamb.h * 0.3, lamb.x + lamb.w * 0.5, lamb.y + lamb.h * 0.46); g.quadraticCurveTo(lamb.x + lamb.w * 0.8, lamb.y + lamb.h * 0.32, lamb.x + lamb.w, lamb.y + lamb.h * 0.5); g.fill();
  for (let k = 0; k < 9; k++) {
    const bx = lamb.x + lamb.w * (0.15 + k * 0.09), bh = 24 + rnd() * 30;
    g.fillStyle = ['#c9b79a', '#b8a58a', '#d4c4a8'][k % 3]; g.fillRect(bx, lamb.y + lamb.h * 0.45 - bh, 22, bh);
    g.fillStyle = '#9a4a3a'; g.beginPath(); g.moveTo(bx - 3, lamb.y + lamb.h * 0.45 - bh); g.lineTo(bx + 11, lamb.y + lamb.h * 0.45 - bh - 16); g.lineTo(bx + 25, lamb.y + lamb.h * 0.45 - bh); g.fill();
  }
  // the fountain of life in the foreground, the altar with the Lamb above it
  const cx = lamb.x + lamb.w / 2;
  g.fillStyle = '#9fc7d8'; g.beginPath(); g.ellipse(cx, lamb.y + lamb.h * 0.84, lamb.w * 0.09, lamb.h * 0.045, 0, 0, 7); g.fill();
  g.strokeStyle = '#4a86b0'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, lamb.y + lamb.h * 0.84, lamb.w * 0.09, lamb.h * 0.045, 0, 0, 7); g.stroke();
  g.fillStyle = '#e4efe9'; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(cx + (rnd() - 0.5) * 18, lamb.y + lamb.h * (0.7 + k * 0.02), 3, 0, 7); g.fill(); }
  g.fillStyle = '#c4b190'; g.fillRect(cx - 62, lamb.y + lamb.h * 0.53, 124, lamb.h * 0.12); // the altar
  g.fillStyle = '#e2d3a8'; g.fillRect(cx - 70, lamb.y + lamb.h * 0.51, 140, 10);
  g.fillStyle = '#f7f5ef'; g.beginPath(); g.ellipse(cx, lamb.y + lamb.h * 0.47, 30, 20, 0, 0, 7); g.fill(); // the Lamb
  g.beginPath(); g.arc(cx + 24, lamb.y + lamb.h * 0.43, 9, 0, 7); g.fill();
  g.fillStyle = '#b3262e'; g.fillRect(cx + 14, lamb.y + lamb.h * 0.49, 5, 14);
  g.fillStyle = '#d8b04c'; g.beginPath(); g.arc(cx, lamb.y + lamb.h * 0.52, 48, 0, Math.PI, true); g.globalAlpha = 0.25; g.fill(); g.globalAlpha = 1; // the glow
  // the dove and its rays above
  g.strokeStyle = 'rgba(255,230,140,0.55)'; g.lineWidth = 3;
  for (let k = -8; k <= 8; k++) { g.beginPath(); g.moveTo(cx, lamb.y + 14); g.lineTo(cx + k * 38, lamb.y + lamb.h * 0.46); g.stroke(); }
  g.fillStyle = '#fbfaf6'; g.beginPath(); g.ellipse(cx, lamb.y + 24, 18, 9, 0, 0, 7); g.fill();
  // angels with the instruments of the Passion, kneeling round the altar, the apostles and martyrs in crowds either side
  const wings = ['#f6efe2', '#d94a4a', '#3d6fb8'];
  for (const side of [-1, 1]) for (let k = 0; k < 4; k++) {
    const ax = cx + side * (84 + k * 20), ay = lamb.y + lamb.h * (0.58 + (k % 2) * 0.05);
    g.fillStyle = wings[k % 3]; g.beginPath(); g.moveTo(ax - 9, ay + 38); g.lineTo(ax, ay); g.lineTo(ax + 9, ay + 38); g.fill();
    g.fillStyle = '#ecc6a0'; g.beginPath(); g.arc(ax, ay - 4, 7, 0, 7); g.fill();
  }
  crowd(g, lamb.x + 4, lamb.y + 60, lamb.w * 0.34, lamb.h * 0.6, rnd, ['#a3202c', '#2f56b8', '#d8d2c0', '#2f7a45', '#d8a52c'], { rows: 2, per: 5 });
  crowd(g, lamb.x + lamb.w * 0.66 - 4, lamb.y + 60, lamb.w * 0.34, lamb.h * 0.6, rnd, ['#a3202c', '#2f56b8', '#d8d2c0', '#5c2f86', '#d8a52c'], { rows: 2, per: 5 });
  // the four side panels: horsemen and walkers coming in from left and right
  crowd(g, judges.x, judges.y, judges.w, judges.h, rnd, ['#2d2a3a', '#7a2d32', '#4a3a2a', '#2f56b8'], { rows: 3, per: 4, hats: true });
  crowd(g, knights.x, knights.y, knights.w, knights.h, rnd, ['#8a8f98', '#a3202c', '#2f56b8', '#d8d2c0'], { rows: 3, per: 4, hats: true });
  crowd(g, hermits.x, hermits.y, hermits.w, hermits.h, rnd, ['#6a5a42', '#8a7a5a', '#3d3a30', '#7a6a4a'], { rows: 3, per: 4 });
  crowd(g, pilgrims.x, pilgrims.y, pilgrims.w, pilgrims.h, rnd, ['#6a4a2a', '#a38a5a', '#3d5a3a', '#b8a078'], { rows: 3, per: 4 });
  // horses for the judges and the knights: two brown shapes
  for (const [p, n] of [[judges, 2], [knights, 3]]) for (let k = 0; k < n; k++) {
    const hx = p.x + p.w * (0.2 + k * 0.28), hy = p.y + p.h * 0.62;
    g.fillStyle = ['#7a4a2a', '#e6dfd0', '#4a2f1c'][k % 3]; g.beginPath(); g.ellipse(hx, hy, 24, 13, 0, 0, 7); g.fill(); g.fillRect(hx + 12, hy - 28, 9, 24);
    g.beginPath(); g.ellipse(hx + 20, hy - 30, 9, 6, 0.4, 0, 7); g.fill();
  }

  // ---- the upper row: gold ground behind the three enthroned figures and the angels, Adam and Eve in niches
  const [adam, angL, mary, god, john, angR, eve] = upPanels;
  for (const p of upPanels) {
    const grad = g.createLinearGradient(0, p.y, 0, p.y + p.h);
    if (p === adam || p === eve) { grad.addColorStop(0, '#2a2a2e'); grad.addColorStop(1, '#4a4a52'); }
    else { grad.addColorStop(0, '#e8c96a'); grad.addColorStop(1, '#b88f34'); }
    g.fillStyle = grad; g.fillRect(p.x, p.y, p.w, p.h);
  }
  // brocade pattern on the gold
  g.strokeStyle = 'rgba(120,80,10,0.25)'; g.lineWidth = 1.5;
  for (const p of [angL, mary, god, john, angR]) for (let yy = p.y + 10; yy < p.y + p.h; yy += 22) for (let xx = p.x + 8; xx < p.x + p.w; xx += 22) { g.beginPath(); g.arc(xx, yy, 7, 0, 7); g.stroke(); }
  // the three: God (red robe, tiara, in the middle), the Virgin (blue, crowned, left), John the Baptist (green, right)
  const throne = (p, robe, mantle, crown) => {
    const px = p.x + p.w / 2, base = p.y + p.h * 0.93, bh = p.h * 0.8;
    g.fillStyle = mantle; g.beginPath(); g.moveTo(px - p.w * 0.42, base); g.lineTo(px - p.w * 0.16, base - bh * 0.7); g.lineTo(px + p.w * 0.16, base - bh * 0.7); g.lineTo(px + p.w * 0.42, base); g.closePath(); g.fill();
    g.fillStyle = robe; g.beginPath(); g.moveTo(px - p.w * 0.22, base); g.lineTo(px - p.w * 0.12, base - bh * 0.7); g.lineTo(px + p.w * 0.12, base - bh * 0.7); g.lineTo(px + p.w * 0.22, base); g.closePath(); g.fill();
    g.fillStyle = '#ecc6a0'; g.beginPath(); g.arc(px, base - bh * 0.82, p.w * 0.12, 0, 7); g.fill();
    g.fillStyle = '#4a3220'; g.beginPath(); g.arc(px, base - bh * 0.86, p.w * 0.13, Math.PI * 0.95, Math.PI * 0.05 + Math.PI * 2); g.fill();
    g.fillStyle = crown; g.fillRect(px - p.w * 0.13, base - bh * 0.97, p.w * 0.26, p.h * 0.05);
    for (let k = 0; k < 5; k++) { g.fillStyle = '#f7e6a0'; g.fillRect(px - p.w * 0.13 + k * p.w * 0.065, base - bh * 0.97 - 10, 4, 10); }
  };
  throne(god, '#b3262e', '#8a1a26', '#fff1b0');
  throne(mary, '#2f56b8', '#3a63c6', '#f3d77a');
  throne(john, '#2f7a45', '#a3202c', '#d8c890');
  // angels singing and playing, in white and rose and blue, with the organ and harp
  for (const p of [angL, angR]) for (let k = 0; k < 4; k++) {
    const ax = p.x + p.w * (0.2 + (k % 2) * 0.55), ay = p.y + p.h * (0.2 + Math.floor(k / 2) * 0.4);
    g.fillStyle = ['#f6efe2', '#e8a0b0', '#a8c4e8', '#f3d77a'][k]; g.beginPath(); g.moveTo(ax - 14, ay + p.h * 0.34); g.lineTo(ax, ay + 12); g.lineTo(ax + 14, ay + p.h * 0.34); g.fill();
    g.fillStyle = '#ecc6a0'; g.beginPath(); g.arc(ax, ay, 12, 0, 7); g.fill();
    g.fillStyle = '#b8862a'; g.fillRect(ax - 11, ay - 14, 22, 6);
  }
  // Adam on the left, Eve on the right: a pale standing figure in a stone niche
  for (const [p, hair] of [[adam, '#3d2a1a'], [eve, '#c9a24a']]) {
    const px = p.x + p.w / 2;
    g.fillStyle = '#d6ac86'; g.beginPath(); g.ellipse(px, p.y + p.h * 0.62, p.w * 0.16, p.h * 0.28, 0, 0, 7); g.fill();
    g.beginPath(); g.arc(px, p.y + p.h * 0.28, p.w * 0.11, 0, 7); g.fill();
    g.fillStyle = hair; g.beginPath(); g.arc(px, p.y + p.h * 0.25, p.w * 0.12, Math.PI, 0); g.fill();
    g.fillStyle = '#e8d8b0'; g.fillRect(px - p.w * 0.05, p.y + p.h * 0.62, p.w * 0.1, p.h * 0.1); // a fig leaf
  }
  // gold frames round every panel
  g.strokeStyle = gold; g.lineWidth = 7;
  for (const p of [...lowPanels, ...upPanels]) g.strokeRect(p.x + 3, p.y + 3, p.w - 6, p.h - 6);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.userData.shared = true;
  return tex;
}

// A big dark baroque painting, a saint in the light: for the transept wall (Rubens hangs there, in
// the real church). Warm browns, one bright diagonal of robes and a pale face.
export function darkPainting(seed = 1624) {
  const W = 768, H = 512, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d'), rnd = rngOf(seed);
  const bg = g.createRadialGradient(W * 0.45, H * 0.4, 20, W * 0.5, H * 0.5, W * 0.7);
  bg.addColorStop(0, '#7a5a3a'); bg.addColorStop(0.5, '#3a2616'); bg.addColorStop(1, '#14100c');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // clouds of smoke and light from the corner
  for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(${150 + rnd() * 80 | 0},${110 + rnd() * 60 | 0},${60 + rnd() * 40 | 0},0.07)`; g.beginPath(); g.ellipse(rnd() * W * 0.7, rnd() * H * 0.5, 40 + rnd() * 90, 20 + rnd() * 40, rnd(), 0, 7); g.fill(); }
  // figures: robes in red, blue and cream, heads lit from the left
  const robes = ['#a3202c', '#2f56b8', '#e8dcc0', '#8a6a2a', '#d8a52c'];
  for (let k = 0; k < 7; k++) {
    const x = 120 + k * 85 + rnd() * 30, y = 140 + (k % 3) * 55 + rnd() * 30, s = 0.9 + rnd() * 0.5;
    g.fillStyle = robes[k % robes.length]; g.beginPath(); g.moveTo(x - 50 * s, H); g.quadraticCurveTo(x - 40 * s, y + 60 * s, x, y + 40 * s); g.quadraticCurveTo(x + 40 * s, y + 60 * s, x + 50 * s, H); g.fill();
    g.fillStyle = '#e2b48c'; g.beginPath(); g.arc(x, y, 22 * s, 0, 7); g.fill();
    g.fillStyle = '#3d2a1a'; g.beginPath(); g.arc(x - 2, y - 8 * s, 22 * s, Math.PI, 0); g.fill();
  }
  const light = g.createLinearGradient(0, 0, W * 0.6, H);
  light.addColorStop(0, 'rgba(255,230,170,0.35)'); light.addColorStop(0.5, 'rgba(255,230,170,0)');
  g.fillStyle = light; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#d8b04c'; g.lineWidth = 14; g.strokeRect(7, 7, W - 14, H - 14);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.userData.shared = true;
  return tex;
}
