// A house front in the manner of a Roman town (Pompeii's), for a city whose LOOK has style: 'roman'
// (see js/scenery.js): plaster that has weathered, with exposed masonry where it has come off and
// hairline cracks; a dado of painted red or black along the foot of the wall and panels of fresco
// above it; on the ground floor a doorway between brick pilasters, dark inside, under a lintel and a
// painted notice, or a shop's wide opening with its masonry counter and jars; above, small windows
// with wooden shutters, and on some houses a wooden balcony. Drawn in a frame one house wide (128)
// and 80 a storey, like js/italian.js's; v picks the variant, so neighbours differ.

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
