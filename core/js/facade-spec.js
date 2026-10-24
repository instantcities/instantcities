// A house front from a spec: the parametric tier between the hand-drawn landmarks and the plain
// boxes of the map. A spec is a few plain facts read off a photo (see facade-lab.html, which shows
// the photos next to the drawing), and drawSpec() paints them in the same flat style as the rest.
//
//   { id, at: [x, z] the middle of the building in map.js, faces?: degrees (0 east, 90 south),
//     floors,                      storeys including the ground floor
//     wall: { material: 'brick' | 'plaster' | 'stone', color },
//     trim,                        window frames, bands, cornice
//     roof,                        colour of the roof and its dormers
//     gable: 'flat' | 'bell' | 'point' | ['stepped', n],
//     eaves?, top?,                game metres, else the map's
//     ground: { type: 'shop' | 'door' | 'arch' | 'none', color, door: 'left'|'centre'|'right',
//               sign?: { text, bg, fg } },
//     windows: { cols, style: 'tall' | 'cross' | 'square', glass, shutters?: colour, bars?: false },
//     bands?: true                 a stone band at every floor
//     cornice?: true,  balcony?: { floor, cols? },  dormers?: n,  bay?: { floor, col },
//     sides?: 'stone:#hex' | colour  the outline's other walls, where they are not the front's own
//                                   (houses built against a church: the walls round them are its) }
//   row?: [{ share?, rise?, ...any of the above }, ...]  a front the map has as one long outline that
//     is really several houses side by side: each drawn with the spec and its own changes, its own gable
import { brick, ashlar, crossWindow, roundArch, shade } from './facades.js';
import { rowParts } from './fronts.js';

const GLASS = '#2c3540';

// What a front gets with nothing known but the map: the brick house with its windows in rows
export function defaultSpec(front) {
  const w = front.width ?? 8, floors = Math.max(2, front.floors ?? 3);
  return {
    id: front.id, at: front.centre ?? front.at, faces: front.faces, floors,
    wall: { material: 'brick', color: '#9a4a33' }, trim: '#e6dfd0', roof: '#3d4248', gable: 'flat',
    ground: { type: 'shop', color: '#2b2a2a', door: 'left' },
    windows: { cols: Math.max(1, Math.round(w / 2.6)), style: 'tall', glass: GLASS },
    cornice: true,
  };
}

// The painter for a spec: draw(g, w, h, eaves), x from -w/2 to w/2 and y up from the ground
export function drawSpec(spec) {
  const S = { ...defaultSpec({ id: spec.id }), ...spec };
  if (S.row) return (g, w, h, e) => {
    for (const [k, p] of rowParts(['row', S.row], w).entries()) {
      g.save(); g.translate(-w / 2 + p.u0 + p.w / 2, 0);
      // a sign the houses share hangs on the first of them only
      const ground = p.ground ?? (k ? { ...S.ground, sign: undefined } : S.ground);
      drawSpec({ ...S, row: undefined, ...p, ground })(g, p.w, e + p.rise, e);
      g.restore();
    }
  };
  return (g, w, h, e) => {
    const L = -w / 2, R = w / 2, wall = S.wall, trim = S.trim, win = { cols: 3, style: 'tall', glass: GLASS, ...S.windows };
    // the wall, the roof above the eaves
    if (wall.material === 'plaster') { g.fillStyle = wall.color; g.fillRect(L, 0, w, h); }
    else if (wall.material === 'stone') ashlar(g, L, 0, R, h, wall.color, { course: 0.5, seed: 11, vary: 0.04 });
    else brick(g, L, 0, R, h, wall.color);
    const flat = [].concat(S.gable)[0] === 'flat';
    if (flat && h > e) roofBand(g, L, R, e, h, S.roof, S.dormers ?? 0, trim, win);
    else if (!flat) gableWindow(g, w, e, h, trim, win);

    // storeys: the ground floor, then the rest up to the eaves
    const groundH = S.ground.type === 'none' ? 3.4 : S.ground.type === 'shop' ? 3.9 : 3.5;
    const upper = Math.max(1, S.floors - 1), floorH = (e - groundH) / upper;
    const cols = Math.max(1, win.cols), step = w / cols;
    for (let f = 1; f <= upper; f++) {
      const y0 = groundH + (f - 1) * floorH;
      if (S.bands) band(g, L, R, y0, trim, 0.3);
      for (let k = 0; k < cols; k++) {
        const cx = L + step * (k + 0.5);
        if (S.bay && S.bay.floor === f && S.bay.col === k) { bay(g, cx, y0 + 0.5, step * 0.8, floorH * 0.85, wall.color, trim); continue; }
        window(g, cx, y0 + floorH * 0.17, Math.min(step * 0.56, 1.5), floorH * (win.style === 'square' ? 0.5 : 0.66), win, trim, f === 1 && win.style === 'tall');
      }
      if (S.balcony && S.balcony.floor === f) {
        const n = S.balcony.cols ?? cols;
        for (let k = 0; k < n; k++) balcony(g, L + (w / n) * (k + 0.5), y0 + floorH * 0.17, Math.min(w / n * 0.8, 2.6));
      }
    }
    if (S.cornice) cornice(g, L, R, e, trim);
    ground(g, w, groundH, S.ground, trim, wall.color);
  };
}

function band(g, x0, x1, y, hex, hh) {
  g.fillStyle = shade(hex, -0.12); g.fillRect(x0, y - hh, x1 - x0, hh * 0.45);
  g.fillStyle = shade(hex, 0.05); g.fillRect(x0, y - hh * 0.55, x1 - x0, hh * 0.55);
}

function cornice(g, x0, x1, y, hex) {
  g.fillStyle = shade(hex, -0.4); g.fillRect(x0 - 0.15, y - 0.5, x1 - x0 + 0.3, 0.2);
  g.fillStyle = hex; g.fillRect(x0 - 0.15, y - 0.3, x1 - x0 + 0.3, 0.45);
  g.fillStyle = shade(hex, 0.18); g.fillRect(x0 - 0.2, y + 0.15, x1 - x0 + 0.4, 0.12);
}

// one window with its frame, bars and shutters; `sill` puts a small ledge under the ones on the first floor
function window(g, cx, y0, w, h, win, trim, sill) {
  if (win.style === 'cross') { crossWindow(g, cx, y0, w, h, { stone: trim, glass: win.glass, lintel: true }); return; }
  g.fillStyle = shade(trim, -0.28); g.fillRect(cx - w / 2 - 0.16, y0 - 0.12, w + 0.32, h + 0.24); // the reveal
  g.fillStyle = trim; g.fillRect(cx - w / 2 - 0.1, y0 - 0.06, w + 0.2, h + 0.12);
  g.fillStyle = win.glass; g.fillRect(cx - w / 2, y0, w, h);
  g.fillStyle = shade(win.glass, 0.2); g.fillRect(cx - w / 2 + 0.06, y0 + h * 0.55, w * 0.45, h * 0.4);
  if (win.bars !== false && win.style === 'tall') {
    g.fillStyle = trim; g.fillRect(cx - 0.04, y0, 0.08, h); g.fillRect(cx - w / 2, y0 + h * 0.72, w, 0.08);
  }
  g.fillStyle = shade(trim, 0.12); g.fillRect(cx - w / 2 - 0.22, y0 + h + 0.06, w + 0.44, 0.16); // the lintel
  if (sill) { g.fillStyle = shade(trim, -0.1); g.fillRect(cx - w / 2 - 0.15, y0 - 0.2, w + 0.3, 0.12); }
  if (win.shutters) {
    for (const s of [-1, 1]) {
      const x = cx + s * (w / 2 + 0.1 + w * 0.2);
      g.fillStyle = win.shutters;
      g.fillRect(x - w * 0.2, y0, w * 0.4, h);
      g.fillStyle = shade(win.shutters, -0.25);
      for (let y = y0 + 0.15; y < y0 + h; y += 0.18) g.fillRect(x - w * 0.2, y, w * 0.4, 0.04);
    }
  }
}

function balcony(g, cx, y, w) {
  g.fillStyle = '#25282b'; g.fillRect(cx - w / 2, y, w, 0.12);
  g.strokeStyle = '#25282b'; g.lineWidth = 0.05;
  g.beginPath();
  for (let x = cx - w / 2 + 0.1; x < cx + w / 2; x += 0.22) { g.moveTo(x, y); g.lineTo(x, y + 0.85); }
  g.stroke();
  g.fillRect(cx - w / 2, y + 0.85, w, 0.07);
}

// a bay window: a slightly darker box across a storey, three lights
function bay(g, cx, y0, w, h, wall, trim) {
  g.fillStyle = shade(wall, -0.2); g.fillRect(cx - w / 2, y0 - 0.2, w, h + 0.4);
  g.fillStyle = trim; g.fillRect(cx - w / 2 + 0.1, y0, w - 0.2, h);
  g.fillStyle = GLASS;
  for (let k = 0; k < 3; k++) g.fillRect(cx - w / 2 + 0.2 + (k * (w - 0.4)) / 3, y0 + 0.15, (w - 0.4) / 3 - 0.08, h - 0.3);
}

// the roof seen from the front, above the eaves, with its dormers
function roofBand(g, x0, x1, e, h, color, dormers, trim, win) {
  g.fillStyle = color; g.fillRect(x0, e, x1 - x0, h - e);
  g.fillStyle = shade(color, -0.2);
  for (let y = e + 0.4; y < h; y += 0.4) g.fillRect(x0, y, x1 - x0, 0.04);
  for (let k = 0; k < dormers; k++) {
    const cx = x0 + ((x1 - x0) / dormers) * (k + 0.5), dh = Math.min(2.2, (h - e) * 0.7);
    g.fillStyle = trim; g.fillRect(cx - 0.8, e + 0.2, 1.6, dh);
    g.fillStyle = win.glass; g.fillRect(cx - 0.6, e + 0.4, 1.2, dh - 0.4);
    g.fillStyle = shade(color, -0.1);
    g.beginPath(); g.moveTo(cx - 1, e + 0.2 + dh); g.lineTo(cx + 1, e + 0.2 + dh); g.lineTo(cx, e + 0.2 + dh + 0.9); g.closePath(); g.fill();
  }
}

// one round window in the gable's neck
function gableWindow(g, w, e, h, trim, win) {
  const cy = e + (h - e) * 0.42, r = Math.min(w * 0.1, 0.9);
  g.fillStyle = shade(trim, -0.25); g.beginPath(); g.arc(0, cy, r * 1.25, 0, Math.PI * 2); g.fill();
  g.fillStyle = win.glass; g.beginPath(); g.arc(0, cy, r, 0, Math.PI * 2); g.fill();
}

// the ground floor: a shop front (a dark band of glass, a sign above, a door), a door in the wall, or an arch
function ground(g, w, gh, G, trim, wallColor) {
  const L = -w / 2, R = w / 2, col = G.color ?? '#2b2a2a';
  const doorX = G.door === 'right' ? R - 1.1 : G.door === 'centre' ? 0 : L + 1.1;
  if (G.type === 'none') return;
  if (G.type === 'shop') {
    const signH = G.sign ? 0.8 : 0.5;
    g.fillStyle = col; g.fillRect(L, 0, w, gh - 0.2);              // the shop front
    g.fillStyle = shade(col, 0.5); g.fillRect(L, 0, w, 0.4);       // the plinth
    g.fillStyle = '#d9c9a0'; g.globalAlpha = 0.55;                 // the lit window
    g.fillRect(L + 0.3, 0.55, w - 0.6, gh - 0.55 - signH - 0.5);
    g.globalAlpha = 1;
    g.fillStyle = shade(col, -0.4);
    g.fillRect(doorX - 0.6, 0, 1.2, gh - signH - 0.5);             // the door
    g.fillStyle = G.sign?.bg ?? shade(col, 0.1);
    g.fillRect(L + 0.2, gh - signH - 0.3, w - 0.4, signH);         // the sign board
    if (G.sign?.text) {
      g.save(); g.scale(1, -1);
      g.fillStyle = G.sign.fg ?? '#f2efe6'; g.font = `bold ${signH * 0.62}px sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(G.sign.text, 0, -(gh - signH / 2 - 0.3), w - 0.8);
      g.restore();
    }
    return;
  }
  g.fillStyle = shade(wallColor, -0.1); g.fillRect(L, 0, w, 0.5);
  if (G.type === 'arch') { roundArch(g, doorX, 0, 2.2, gh - 0.4, shade(trim, -0.3)); roundArch(g, doorX, 0, 1.8, gh - 0.6, col); return; }
  g.fillStyle = trim; g.fillRect(doorX - 0.85, 0, 1.7, gh - 0.8);
  g.fillStyle = col; g.fillRect(doorX - 0.7, 0, 1.4, gh - 0.95);
  g.fillStyle = shade(col, 0.3); g.fillRect(doorX - 0.7, gh - 1.6, 1.4, 0.4);
}

// FRONTS entries (the shape js/fronts.js takes) from the specs of a city's streets, leaving out any
// whose building already has a hand-drawn one in `existing`
export function specFronts(streets, existing = []) {
  const taken = d => existing.some(o => Math.hypot(o.at[0] - d.at[0], o.at[1] - d.at[1]) < 3);
  const out = [];
  for (const specs of Object.values(streets)) for (const s of specs) {
    if (taken(s)) continue;
    const S = { ...defaultSpec(s), ...s };
    out.push({
      id: S.id, at: S.at, faces: S.faces, gable: S.row ? ['row', S.row] : S.gable, wall: S.sides ?? (S.wall.material === 'stone' ? `stone:${S.wall.color}` : S.wall.color),
      roof: S.roof, eaves: S.eaves, top: S.top, draw: drawSpec(S),
    });
  }
  return out;
}
