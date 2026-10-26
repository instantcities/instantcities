// Things drawn on canvases to hang up in the Stadhuis: a woven tapestry, a plaque with words on it,
// a coat of arms.
import * as THREE from 'three';

const rngOf = seed => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
function texture(c) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.userData.shared = true;
  return tex;
}
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };

// A tapestry: a ground in deep blue or red, a border of leaves and flowers, and a scene of horsemen
// riding through a wood in the middle; threads in the weave.
export function tapestry(seed = 1, ground = '#1f3a5a') {
  const [c, g] = canvas(768, 512), rnd = rngOf(seed);
  g.fillStyle = ground; g.fillRect(0, 0, 768, 512);
  for (let y = 0; y < 512; y += 3) { g.fillStyle = `rgba(0,0,0,${0.06 + rnd() * 0.05})`; g.fillRect(0, y, 768, 1); }
  // a border
  g.fillStyle = '#8a6a2a'; g.fillRect(0, 0, 768, 40); g.fillRect(0, 472, 768, 40); g.fillRect(0, 0, 40, 512); g.fillRect(728, 0, 40, 512);
  for (let x = 20; x < 768; x += 56) for (const y of [20, 492]) { g.fillStyle = ['#a3202c', '#2f7a45', '#e8dcc0'][(x / 56) % 3 | 0]; g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); }
  for (let y = 70; y < 512; y += 56) for (const x of [20, 748]) { g.fillStyle = ['#a3202c', '#2f7a45', '#e8dcc0'][(y / 56) % 3 | 0]; g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); }
  // trees and flowers in the field
  for (let k = 0; k < 24; k++) {
    const x = 70 + rnd() * 630, y = 70 + rnd() * 360;
    g.fillStyle = ['#2f7a45', '#3f8f55', '#256038'][k % 3]; g.beginPath(); g.ellipse(x, y, 30 + rnd() * 20, 22 + rnd() * 16, rnd(), 0, 7); g.fill();
    g.fillStyle = ['#d8506a', '#f3e14a', '#e8dcc0'][k % 3]; g.beginPath(); g.arc(x + 6, y - 3, 4, 0, 7); g.fill();
  }
  // horsemen riding left to right
  for (let k = 0; k < 3; k++) {
    const x = 170 + k * 190, y = 300 - (k % 2) * 40;
    g.fillStyle = ['#e8dcc0', '#6a4a2a', '#2a2420'][k]; g.beginPath(); g.ellipse(x, y, 50, 26, -0.1, 0, 7); g.fill(); g.fillRect(x + 28, y - 52, 16, 50);
    g.beginPath(); g.ellipse(x + 46, y - 56, 17, 11, 0.5, 0, 7); g.fill(); for (const lx of [-34, -14, 14, 34]) g.fillRect(x + lx - 4, y + 16, 8, 38);
    g.fillStyle = ['#a3202c', '#d8a52c', '#2f56b8'][k]; g.fillRect(x - 12, y - 62, 24, 40);
    g.fillStyle = '#ecc6a0'; g.beginPath(); g.arc(x, y - 72, 11, 0, 7); g.fill();
    g.fillStyle = '#3a2a1a'; g.fillRect(x - 12, y - 86, 24, 8);
  }
  g.strokeStyle = '#d8b04c'; g.lineWidth = 6; g.strokeRect(3, 3, 762, 506);
  return texture(c);
}

// A plaque of words in gold letters on dark stone, lines of text centred: for the walls and the doors
export function plaque(lines, w = 640, h = 256) {
  const [c, g] = canvas(w, h);
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#2a2622'); bg.addColorStop(1, '#1a1714');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d2a94a'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = '#e6c870'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const size = Math.min(48, (h - 60) / lines.length * 0.7);
  g.font = `700 ${size}px Georgia, serif`;
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.3));
  return texture(c);
}

// A coat of arms: a shield, gold with a black lion rampant, a crown on it, ribbons below
export function arms() {
  const [c, g] = canvas(384, 448);
  g.clearRect(0, 0, 384, 448);
  const sh = () => { g.beginPath(); g.moveTo(40, 80); g.lineTo(344, 80); g.lineTo(344, 250); g.quadraticCurveTo(344, 380, 192, 430); g.quadraticCurveTo(40, 380, 40, 250); g.closePath(); };
  g.fillStyle = '#e8c04a'; sh(); g.fill();
  g.strokeStyle = '#2a2018'; g.lineWidth = 10; sh(); g.stroke();
  // the lion: a body, a head, legs, a tail, in black
  g.fillStyle = '#1a1612';
  g.beginPath(); g.ellipse(190, 250, 58, 78, -0.15, 0, 7); g.fill(); // body
  g.beginPath(); g.arc(205, 160, 38, 0, 7); g.fill(); // head
  g.beginPath(); g.moveTo(180, 130); g.lineTo(170, 100); g.lineTo(200, 120); g.fill(); g.beginPath(); g.moveTo(222, 125); g.lineTo(240, 95); g.lineTo(245, 130); g.fill();
  g.lineWidth = 22; g.strokeStyle = '#1a1612'; g.lineCap = 'round';
  for (const [x1, y1, x2, y2] of [[225, 220, 290, 190], [240, 250, 295, 262], [160, 300, 130, 360], [200, 310, 215, 370]]) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  g.lineWidth = 14; g.beginPath(); g.moveTo(135, 280); g.quadraticCurveTo(70, 250, 95, 170); g.quadraticCurveTo(105, 140, 130, 150); g.stroke();
  g.fillStyle = '#a3202c'; g.beginPath(); g.ellipse(228, 165, 12, 7, 0, 0, 7); g.fill(); // the tongue
  // the crown over it
  g.fillStyle = '#d2a94a'; g.fillRect(120, 28, 144, 36);
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(120 + k * 48, 28); g.lineTo(144 + k * 48, 2); g.lineTo(168 + k * 48, 28); g.fill(); }
  return texture(c);
}
