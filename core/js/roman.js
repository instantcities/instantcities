// A house front in the manner of a Roman town (Pompeii's), for a city whose LOOK has style: 'roman'
// (see js/scenery.js): plaster all over, a darker band along the foot of each storey (the dado, as
// the painted houses had), few and small windows high up, and on the ground floor a dark doorway
// (the fauces) between two pilasters, or a shop's wide opening with its counter. Drawn in a frame
// one house wide (128) and 80 a storey, like js/italian.js's; v picks the variant, so neighbours
// differ.

const STONE = 'rgba(255,248,232,0.5)', DADO = 'rgba(80,28,12,0.3)', SHADOW = 'rgba(40,28,16,0.35)';

// the storeys above the ground floor: a dado band and a small window or two under a thin cornice
export function romanUpper(g, floors, shutters, v, r) {
  for (let f = 0; f < floors - 1; f++) {
    const y = f * 80;
    g.fillStyle = DADO;
    g.fillRect(0, y + 62, 128, 18);
    g.fillStyle = SHADOW;
    g.fillRect(0, y + 79, 128, 1.5);
    const n = 1 + ((v + f) % 2);
    for (let k = 0; k < n; k++) {
      const x = 22 + ((v * 37 + f * 19 + k * 55) % 70);
      g.fillStyle = STONE;
      g.fillRect(x - 2, y + 18, 18, 26);
      g.fillStyle = '#2a2218';
      g.fillRect(x, y + 20, 14, 22);
    }
    g.fillStyle = STONE;
    g.fillRect(0, y, 128, 3);
  }
}

// the ground floor: a doorway, and on every third house a shop opening with its counter
export function romanGround(g, y0, door, v) {
  g.fillStyle = DADO;
  g.fillRect(0, y0 + 50, 128, 30);
  const dx = 14 + ((v * 29) % 48);
  g.fillStyle = STONE;
  g.fillRect(dx - 6, y0 + 20, 6, 60);
  g.fillRect(dx + 26, y0 + 20, 6, 60);
  g.fillRect(dx - 6, y0 + 16, 38, 5);
  g.fillStyle = '#1d1711';
  g.fillRect(dx, y0 + 21, 26, 59);
  g.fillStyle = door;
  g.fillRect(dx + 2, y0 + 60, 22, 20);
  if (v % 3 === 0) {
    const sx = dx > 50 ? 6 : 76;
    g.fillStyle = STONE;
    g.fillRect(sx - 3, y0 + 26, 48, 54);
    g.fillStyle = '#1d1711';
    g.fillRect(sx, y0 + 29, 42, 51);
    g.fillStyle = '#9b7a52'; // the counter
    g.fillRect(sx, y0 + 56, 42, 24);
    g.fillStyle = SHADOW;
    for (let x = sx + 4; x < sx + 40; x += 9) g.fillRect(x, y0 + 58, 5, 5); // the jars set into it
  }
}
