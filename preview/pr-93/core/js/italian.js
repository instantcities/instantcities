// A house front in the manner of an Italian historic town (Lecce's, but the same from Puglia to
// Tuscany), for a city whose LOOK has style: 'italian' (see js/scenery.js): plastered or stone
// walls with stone quoins at the corners, a rusticated ground floor, tall windows in stone frames
// under little pediments, louvred shutters (persiane) open or shut, a wrought-iron balcony on the
// first floor (the piano nobile) and a deep cornice under the roof terrace. Drawn in a frame one
// house wide (128) and 80 a storey, like the rest of scenery.js's fronts; v picks the variant, so
// neighbours differ.

const STONE = 'rgba(255,248,232,0.55)', SHADOW = 'rgba(70,50,30,0.28)', IRON = '#2a2522';

// a window w wide and h tall at (x, y): its stone frame, the glass, and its shutters, folded open
// against the wall or shut over it
function window_(g, x, y, w, h, shutter, shut) {
  g.fillStyle = STONE;
  g.fillRect(x - 3, y - 3, w + 6, h + 6);
  const glass = g.createLinearGradient(x, y, x, y + h);
  glass.addColorStop(0, '#5d7486');
  glass.addColorStop(1, '#1f2a33');
  g.fillStyle = glass;
  g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(245,238,224,0.85)'; // the frame's glazing bars
  g.fillRect(x + w / 2 - 1, y, 2, h);
  g.fillRect(x, y + h * 0.33, w, 2);
  g.fillRect(x, y + h * 0.66, w, 2);
  if (!shutter) return;
  const louvres = (sx, sw) => {
    g.fillStyle = shutter;
    g.fillRect(sx, y, sw, h);
    g.fillStyle = 'rgba(0,0,0,0.28)';
    for (let k = y + 3; k < y + h - 1; k += 3) g.fillRect(sx + 1, k, sw - 2, 1);
  };
  if (shut) {
    louvres(x, w / 2 - 0.5);
    louvres(x + w / 2 + 0.5, w / 2 - 0.5);
  } else {
    louvres(x - w / 2 - 4, w / 2);
    louvres(x + w + 4, w / 2);
  }
}

// what crowns a window: a triangular or a curved pediment, or a straight cornice
function head(g, x, y, w, kind) {
  g.fillStyle = STONE;
  if (kind === 0) {
    g.beginPath();
    g.moveTo(x - 6, y);
    g.lineTo(x + w / 2, y - 9);
    g.lineTo(x + w + 6, y);
    g.closePath();
    g.fill();
  } else if (kind === 1) {
    g.beginPath();
    g.moveTo(x - 6, y);
    g.quadraticCurveTo(x + w / 2, y - 12, x + w + 6, y);
    g.closePath();
    g.fill();
  }
  g.fillRect(x - 6, y - 1, w + 12, 3);
  g.fillStyle = SHADOW;
  g.fillRect(x - 6, y + 2, w + 12, 1.5);
}

// a balcony from x0 to x1 standing on a stone slab at y: an iron railing of bars and a top rail,
// on two carved brackets
function balcony(g, x0, x1, y) {
  g.fillStyle = STONE;
  g.fillRect(x0, y, x1 - x0, 4);
  g.fillStyle = SHADOW;
  g.fillRect(x0, y + 4, x1 - x0, 2);
  g.fillStyle = STONE;
  for (const bx of [x0 + 3, x1 - 7]) g.fillRect(bx, y + 4, 4, 6);
  g.fillStyle = IRON;
  g.fillRect(x0 + 1, y - 15, x1 - x0 - 2, 2);
  for (let bx = x0 + 3; bx < x1 - 2; bx += 4) g.fillRect(bx, y - 14, 1.2, 14);
  g.strokeStyle = IRON; // a curl in the middle of the railing
  g.lineWidth = 1;
  g.beginPath();
  g.arc((x0 + x1) / 2, y - 7, 4, 0, Math.PI * 2);
  g.stroke();
}

// The upper storeys and the cornice: everything above the ground floor.
export function italianUpper(g, floors, shutters, v, r) {
  const w = 128, kind = v % 3, shutAt = (v >> 2) % 4, colour = shutters?.[v % shutters.length];
  // the cornice under the roof terrace: a band of mouldings and little blocks (dentils) below it
  g.fillStyle = STONE;
  g.fillRect(0, 0, w, 7);
  g.fillStyle = SHADOW;
  g.fillRect(0, 7, w, 3);
  g.fillStyle = STONE;
  for (let x = 2; x < w; x += 6) g.fillRect(x, 10, 3, 3);
  for (let f = 0; f < floors - 1; f++) {
    const top = f * 80, nobile = f === floors - 2; // the first floor, just above the street
    // a string course between the storeys
    g.fillStyle = STONE;
    g.fillRect(0, top + 76, w, 4);
    const wh = nobile ? 48 : 42, wy = top + (nobile ? 22 : 24);
    for (const [i, x] of [[0, 24], [1, 82]]) {
      window_(g, x, wy, 22, wh, colour, (f + i + shutAt) % 4 === 0);
      head(g, x, wy - 4, 22, nobile ? kind : 2);
    }
    if (nobile) {
      // the piano nobile: one balcony across, or one under each window
      if (v % 2) balcony(g, 12, 116, wy + wh + 3);
      else for (const x of [24, 82]) balcony(g, x - 8, x + 30, wy + wh + 3);
    } else if (r() < 0.35) {
      balcony(g, 74, 112, wy + wh + 3);
    }
  }
  // stone quoins up both corners, where this house meets the next
  for (let y = 14; y < (floors - 1) * 80; y += 12) {
    g.fillStyle = STONE;
    const long = (y / 12) % 2 < 1;
    g.fillRect(0, y, long ? 9 : 6, 10);
    g.fillRect(w - (long ? 9 : 6), y, long ? 9 : 6, 10);
  }
}

// The ground floor of a house: courses of rusticated stone, a big arched doorway (the portone),
// and a small barred window.
export function italianGround(g, y0, door, v) {
  const w = 128;
  g.fillStyle = 'rgba(255,248,232,0.3)';
  g.fillRect(0, y0, w, 80);
  g.fillStyle = SHADOW;
  for (let y = y0 + 10; y < y0 + 80; y += 10) g.fillRect(0, y, w, 1.5);
  const dx = v % 2 ? 66 : 14, wx = v % 2 ? 18 : 88;
  // the portone: stone voussoirs round a round arch, the wooden doors inside
  g.fillStyle = STONE;
  g.beginPath();
  g.moveTo(dx - 5, y0 + 80);
  g.lineTo(dx - 5, y0 + 34);
  g.arc(dx + 21, y0 + 34, 26, Math.PI, 0);
  g.lineTo(dx + 47, y0 + 80);
  g.fill();
  g.fillStyle = door;
  g.beginPath();
  g.moveTo(dx + 1, y0 + 80);
  g.lineTo(dx + 1, y0 + 34);
  g.arc(dx + 21, y0 + 34, 20, Math.PI, 0);
  g.lineTo(dx + 41, y0 + 80);
  g.fill();
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(dx + 20.5, y0 + 30, 1.5, 50);
  for (let y = y0 + 44; y < y0 + 78; y += 12) { g.fillRect(dx + 4, y, 14, 1); g.fillRect(dx + 24, y, 14, 1); }
  g.fillStyle = SHADOW; // the joints of the voussoirs
  for (let a = Math.PI; a <= Math.PI * 2.01; a += Math.PI / 7) {
    g.fillRect(dx + 21 + Math.cos(a) * 23, y0 + 34 + Math.sin(a) * 23, 1.5, 1.5);
  }
  g.fillStyle = '#c9a54a';
  g.fillRect(dx + 16, y0 + 58, 3, 3);
  g.fillRect(dx + 24, y0 + 58, 3, 3);
  // a small window with an iron grille
  g.fillStyle = STONE;
  g.fillRect(wx - 3, y0 + 27, 28, 30);
  g.fillStyle = '#23303a';
  g.fillRect(wx, y0 + 30, 22, 24);
  g.fillStyle = IRON;
  for (let x = wx + 3; x < wx + 22; x += 5) g.fillRect(x, y0 + 30, 1.5, 24);
  g.fillRect(wx, y0 + 41, 22, 1.5);
}
