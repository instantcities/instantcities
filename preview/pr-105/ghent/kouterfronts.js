// The Kouter's fronts drawn by hand, from Mapillary photos (the 2019 panoramas round the square and
// the 2023-2024 walks along it): the square's banks, its concert hall and the grand houses between
// them, each standing in for its box from the map like the Graslei's (see ghent/fronts.js for what a
// front says). Going round: on the north side the new block with its deep balconies, the beige
// 1920s block with its bay windows, the yellow Handelsbeurs and the grey stone house beside it; on
// the east the BNP Paribas Fortis bank; on the south the long white palace with its gilded iron
// gates, the white house with barred windows, the grey bank with its oriel, Kouter 26-27 (LYNX), the
// cream house with the domed corner pavilion and the Standaard Boekhandel.
import { ashlar, roundArch, stringCourse, balustrade, pilaster, shade } from '../core/js/facades.js';

const SLATE = 0x464b52;
const GLASS = '#29313a', FRAME = '#efebe2';

// ------------------------------------------------------------------ the parts

// rusticated stone: courses with deep joints
function rustic(g, x0, x1, y0, y1, S, course = 0.75) {
  ashlar(g, x0, y0, x1, y1, S, { course, seed: 41, vary: 0.035 });
  g.fillStyle = shade(S, -0.35);
  for (let y = y0 + course; y < y1 - 0.01; y += course) g.fillRect(x0, y - 0.08, x1 - x0, 0.08);
}

// a window w by h from y in a stone surround: square-headed or round-arched (`arch`), white frames
// in `panes` rows, a fan in the arch's head; a sill below and over it a `head`: a cornice, a
// triangular pediment, a segmental one or a keystone; `bars` of iron over a ground-floor window
function win(g, cx, y, w, h, { S, frame = FRAME, glass = GLASS, arch = false, head = null, sill = true, bars = false, panes = 3, sur = 0.3 } = {}) {
  const L = cx - w / 2, lights = arch ? h - w / 2 : h;
  g.fillStyle = shade(S, 0.12);
  if (arch) roundArch(g, cx, y - sur, w + 2 * sur, h + 2 * sur, shade(S, 0.12)); else g.fillRect(L - sur, y - sur, w + 2 * sur, h + 2 * sur);
  if (arch) roundArch(g, cx, y, w, h, shade(S, -0.45)); else { g.fillStyle = shade(S, -0.45); g.fillRect(L, y, w, h); }
  const t = 0.09;
  if (arch) roundArch(g, cx, y + t, w - 2 * t, h - 2 * t, glass); else { g.fillStyle = glass; g.fillRect(L + t, y + t, w - 2 * t, h - 2 * t); }
  g.fillStyle = shade(glass, 0.16); // the sky in the upper panes
  g.fillRect(L + t, y + lights * 0.62, w / 2 - t, lights * 0.3);
  g.fillStyle = frame;
  g.fillRect(cx - 0.05, y, 0.1, lights);
  for (let k = 1; k < panes; k++) g.fillRect(L, y + (lights * k) / panes, w, 0.08);
  if (arch) {
    g.fillRect(L, y + lights - 0.04, w, 0.1);
    g.strokeStyle = frame; g.lineWidth = 0.07;
    g.beginPath();
    for (const a of [0.25, 0.5, 0.75]) { g.moveTo(cx, y + lights); g.lineTo(cx + Math.cos(a * Math.PI) * w / 2, y + lights + Math.sin(a * Math.PI) * w / 2); }
    g.stroke();
  }
  if (bars) { g.fillStyle = '#1c1f22'; for (let x = L + 0.25; x < L + w - 0.1; x += 0.3) g.fillRect(x, y, 0.05, lights); g.fillRect(L, y + lights * 0.5, w, 0.06); }
  if (sill) { g.fillStyle = shade(S, 0.18); g.fillRect(L - sur - 0.15, y - sur - 0.25, w + 2 * sur + 0.3, 0.25); }
  const top = y + h + sur, hw = w / 2 + sur + 0.25;
  g.fillStyle = shade(S, 0.16);
  if (head === 'cornice') g.fillRect(cx - hw, top + 0.1, 2 * hw, 0.32);
  if (head === 'pediment') { g.beginPath(); g.moveTo(cx - hw, top + 0.1); g.lineTo(cx, top + 0.1 + hw * 0.45); g.lineTo(cx + hw, top + 0.1); g.closePath(); g.fill(); }
  if (head === 'segment') { g.beginPath(); g.moveTo(cx - hw, top + 0.1); g.quadraticCurveTo(cx, top + 0.1 + hw * 0.7, cx + hw, top + 0.1); g.closePath(); g.fill(); }
  if (head === 'keystone') { g.beginPath(); g.moveTo(cx - 0.28, top - sur); g.lineTo(cx + 0.28, top - sur); g.lineTo(cx + 0.38, top + 0.5); g.lineTo(cx - 0.38, top + 0.5); g.closePath(); g.fill(); }
  if (head === 'pediment' || head === 'segment') { g.fillStyle = shade(S, -0.25); g.fillRect(cx - hw, top + 0.06, 2 * hw, 0.06); }
}

// a wrought-iron balcony railing from x0 to x1, h high from y, on a stone slab
function iron(g, x0, x1, y, h = 1.05, S = '#ddd5c4') {
  g.fillStyle = shade(S, 0.12);
  g.fillRect(x0 - 0.2, y - 0.25, x1 - x0 + 0.4, 0.28);
  g.fillStyle = '#23272a';
  g.fillRect(x0, y + h - 0.08, x1 - x0, 0.08);
  g.fillRect(x0, y + 0.05, x1 - x0, 0.06);
  for (let x = x0; x <= x1; x += 0.14) g.fillRect(x, y, 0.03, h);
  g.strokeStyle = '#23272a'; g.lineWidth = 0.05;
  for (let x = x0 + 0.35; x < x1 - 0.2; x += 0.7) { g.beginPath(); g.arc(x, y + h / 2, 0.22, 0, Math.PI * 2); g.stroke(); }
}

// a cornice across at y: the frieze's lower moulding, brackets under the overhang, the overhang
function cornice(g, x0, x1, y, S, { brackets = 0.6, deep = 0.9 } = {}) {
  stringCourse(g, x0, x1, y - 1, S, 0.3);
  if (brackets) { g.fillStyle = shade(S, -0.3); for (let x = x0 + 0.15; x < x1; x += brackets) g.fillRect(x, y - 0.6, 0.22, 0.45); }
  g.fillStyle = shade(S, -0.38);
  g.fillRect(x0, y - 0.15, x1 - x0, 0.15);
  g.fillStyle = shade(S, 0.14);
  g.fillRect(x0, y, x1 - x0, deep * 0.6);
}

// letters on a board, centred on cx, the board h high from y
function sign(g, cx, y, w, h, text, bg, fg, font = 'bold') {
  if (bg) { g.fillStyle = bg; g.fillRect(cx - w / 2, y, w, h); }
  g.save(); g.scale(1, -1);
  g.fillStyle = fg; g.font = `${font} ${h * 0.7}px Georgia, serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, cx, -(y + h / 2), w * 0.92);
  g.restore();
}

// a shop window: a dark frame, the lit shop inside
function shop(g, x0, x1, y0, y1, frame = '#1e1e1f', inside = '#5a4434') {
  g.fillStyle = frame; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.fillStyle = inside; g.fillRect(x0 + 0.15, y0 + 0.15, x1 - x0 - 0.3, y1 - y0 - 0.3);
  g.fillStyle = shade(inside, 0.25); g.fillRect(x0 + 0.15, y1 - 1.0, x1 - x0 - 0.3, 0.5);
}

// the bays' middles across a front w wide, n of them
const bays = (w, n) => Array.from({ length: n }, (_, k) => -w / 2 + (w * (k + 0.5)) / n);

// a plinth of grey stone with a basement's small barred windows under the ground floor's
const plinth = (g, w, h, xs, hex = '#8f8c86') => {
  g.fillStyle = hex; g.fillRect(-w / 2, 0, w, h);
  g.fillStyle = shade(hex, 0.15); g.fillRect(-w / 2, h - 0.15, w, 0.15);
  for (const x of xs) { g.fillStyle = '#25282b'; g.fillRect(x - 0.45, 0.2, 0.9, Math.min(0.55, h - 0.45)); g.fillStyle = shade(hex, -0.3); for (let b = -0.35; b <= 0.36; b += 0.17) g.fillRect(x + b, 0.2, 0.04, Math.min(0.55, h - 0.45)); }
};

// ------------------------------------------------------------------ the north side

// De Handelsbeurs (1737-1739, the concert hall since 2003): Louis XV in ochre yellow with its
// trim in white, a blue-grey plinth; two storeys of tall arched windows with fan lights, white
// pilasters, a wrought-iron balcony across the middle; over the cornice the wings' curved gables
// with an oval window each and the middle raised with three arched attic windows under a sculpted
// curved pediment
const HB_Y = '#d6a63e', HB_W = '#f1ece1';
function handelsbeurs(g, w, h, e) {
  const L = -w / 2, n = 9, xs = bays(w, n), bw = w / n;
  g.fillStyle = HB_Y; g.fillRect(L, 0, w, h);
  g.fillStyle = '#6f7983'; g.fillRect(L, 0, w, 1.5); // the plinth
  for (const x of xs) win(g, x, 1.9, 1.85, 5.6, { S: HB_Y, frame: HB_W, arch: true, sur: 0.22, head: 'keystone', sill: false });
  stringCourse(g, L, -L, 8.2, HB_W, 0.35);
  for (const x of xs) win(g, x, 8.8, 1.75, 4.9, { S: HB_Y, frame: HB_W, arch: true, sur: 0.22, head: 'keystone' });
  iron(g, xs[3] - 1.2, xs[5] + 1.2, 8.6, 1.0, HB_W);
  // the white pilasters: at the ends and either side of the middle three bays
  for (const x of [L + 0.3, -L - 0.3, xs[3] - bw / 2, xs[5] + bw / 2, xs[2] - bw / 2, xs[6] + bw / 2]) pilaster(g, x, 1.5, e - 0.6, 0.55, HB_W);
  cornice(g, L, -L, e - 0.5, HB_W, { brackets: 0.8 });
  // the wings' curved gables, an oval window in each, a garland
  for (const x of [L + bw * 1.5, -L - bw * 1.5]) {
    g.fillStyle = HB_W; g.beginPath(); g.ellipse(x, e + 1.4, 1.05, 0.85, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = GLASS; g.beginPath(); g.ellipse(x, e + 1.4, 0.75, 0.6, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = HB_W; g.lineWidth = 0.18; g.beginPath(); g.moveTo(x - 2.6, e + 0.6); g.quadraticCurveTo(x - 1.6, e - 0.1, x - 1.1, e + 0.9); g.moveTo(x + 2.6, e + 0.6); g.quadraticCurveTo(x + 1.6, e - 0.1, x + 1.1, e + 0.9); g.stroke();
  }
  // the raised middle: three arched attic windows between pilasters, the pediment's carving
  const m0 = xs[3] - bw / 2, m1 = xs[5] + bw / 2;
  for (const x of xs.slice(3, 6)) win(g, x, e + 0.6, 1.35, 3.6, { S: HB_Y, frame: HB_W, arch: true, sur: 0.18, panes: 2 });
  for (const x of [m0 + 0.3, m1 - 0.3, xs[3] + bw / 2, xs[4] + bw / 2]) pilaster(g, x, e, e + 5, 0.45, HB_W);
  stringCourse(g, m0, m1, e + 5.2, HB_W, 0.4);
  g.fillStyle = HB_W; g.beginPath(); g.ellipse(0, e + 6.6, 1.6, 1.1, 0, 0, Math.PI * 2); g.fill(); // the cartouche
  g.fillStyle = shade(HB_Y, -0.15); g.beginPath(); g.ellipse(0, e + 6.6, 1.1, 0.75, 0, 0, Math.PI * 2); g.fill();
  for (const s of [-1, 1]) { g.fillStyle = HB_W; g.beginPath(); g.ellipse(s * 2.4, e + 6.1, 1.1, 0.4, s * 0.3, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = HB_W; g.lineWidth = 0.25; g.beginPath(); g.moveTo(m0, e + 5.4); g.quadraticCurveTo(0, h + 1.2, m1, e + 5.4); g.stroke();
  // the red banners of the concert hall
  for (const x of [xs[2], xs[6]]) { g.fillStyle = '#b8322b'; g.fillRect(x - 0.45, 8.9, 0.9, 3.6); g.fillStyle = '#f2e6d6'; g.fillRect(x - 0.3, 11.6, 0.6, 0.5); }
}

// the grey stone house east of the Handelsbeurs (with the Albert Heijn behind): shops along the
// ground floor, two storeys of tall windows, a row of round-arched ones, small windows under the
// cornice, dormers in its slate mansard
const AH_S = '#d5cfc2';
function greyHouse(g, w, h, e) {
  const L = -w / 2, n = 10, xs = bays(w, n);
  ashlar(g, L, 0, -L, h, AH_S, { course: 0.6, seed: 51, vary: 0.03 });
  for (let k = 0; k < n; k += 2) shop(g, xs[k] - w / n / 2 + 0.25, xs[k + 1] + w / n / 2 - 0.25, 0.3, 4.6, '#2a2d30', '#4d4a45');
  stringCourse(g, L, -L, 5.2, AH_S, 0.45);
  for (const [y, hh, arch, head] of [[5.9, 3.1, false, 'cornice'], [9.7, 2.9, false, 'cornice'], [13.3, 2.9, true, null], [16.7, 1.6, false, null]]) {
    for (const x of xs) win(g, x, y, 1.55, hh, { S: AH_S, arch, head, panes: arch ? 2 : 3, sur: 0.2 });
  }
  cornice(g, L, -L, e - 0.6, AH_S, { brackets: 0.7 });
  g.fillStyle = '#4a4f55'; g.fillRect(L, e, w, h - e); // the mansard
  for (const x of xs.filter((_, k) => k % 2)) { g.fillStyle = shade(AH_S, 0.05); g.fillRect(x - 0.7, e + 0.4, 1.4, 1.8); g.fillStyle = GLASS; g.fillRect(x - 0.5, e + 0.5, 1, 1.4); }
}

// the beige 1920s block on the corner of the Kouter and the Vogelenzang: six storeys of stone over
// black shop fronts, two tall bay windows running up four of them, French windows with iron rails
const BAY_S = '#dcd0b9';
function bayBlock(g, w, h, e) {
  const L = -w / 2, n = 8, xs = bays(w, n), bw = w / n;
  ashlar(g, L, 0, -L, h, BAY_S, { course: 0.6, seed: 61, vary: 0.03 });
  g.fillStyle = '#1b1b1c'; g.fillRect(L, 0, w, 4.6);
  shop(g, xs[1] - bw / 2 + 0.3, xs[2] + bw / 2 - 0.3, 0.2, 4.2, '#141414', '#7a5a3c');
  shop(g, xs[5] - bw / 2 + 0.3, xs[6] + bw / 2 - 0.3, 0.2, 4.2, '#141414', '#6a5240');
  sign(g, xs[6] + 0.6, 3.1, 3, 0.9, 'ICE ICE AMY', null, '#f4f0e6');
  g.fillStyle = shade(BAY_S, 0.1); for (const x of [L + 0.3, xs[3] + bw / 2, -L - 0.3]) g.fillRect(x - 0.3, 0, 0.6, 4.6);
  const floors = 6, fh = (e - 1.2 - 4.8) / floors;
  for (let f = 0; f < floors; f++) {
    const y = 4.9 + f * fh + 0.6;
    for (let k = 0; k < n; k++) {
      const oriel = f < 4 && (k === 1 || k === 2 || k === 5 || k === 6);
      if (oriel && (k === 1 || k === 5)) { // the bay window's front, standing out of the wall: lit, its sides in shadow
        g.fillStyle = shade(BAY_S, 0.1); g.fillRect(xs[k] - bw / 2 + 0.1, y - 0.6, 2 * bw - 0.2, fh);
        g.fillStyle = shade(BAY_S, -0.25); g.fillRect(xs[k] - bw / 2 + 0.1, y - 0.6, 0.35, fh); g.fillRect(xs[k + 1] + bw / 2 - 0.45, y - 0.6, 0.35, fh);
      }
      win(g, xs[k], y, oriel ? 1.9 : 1.6, fh - 1.1, { S: BAY_S, frame: '#3b3f44', sur: 0.15, panes: 2, head: f === 4 ? 'cornice' : null });
      if (!oriel && f > 0) iron(g, xs[k] - 0.8, xs[k] + 0.8, y, 0.8, BAY_S);
    }
    if (f === 3) stringCourse(g, L, -L, y + fh - 0.5, BAY_S, 0.4);
  }
  cornice(g, L, -L, e - 0.3, BAY_S, { brackets: 0 });
}

// the new block (about 2020) on the old ACEC site: a frame of beige concrete, every floor a deep
// balcony behind a glass rail, a dark glazed ground floor of shops between the piers
const NEW_S = '#cec4b2';
function balconyBlock(g, w, h, e) {
  const L = -w / 2, n = 8, xs = bays(w, n), bw = w / n, floors = 5, fh = (e - 4.6) / floors;
  g.fillStyle = NEW_S; g.fillRect(L, 0, w, h);
  g.fillStyle = '#25282a'; g.fillRect(L, 0, w, 4.2);
  for (const x of xs) { g.fillStyle = '#3c4247'; g.fillRect(x - bw / 2 + 0.7, 0.2, bw - 1.4, 3.8); g.fillStyle = '#58606a'; g.fillRect(x - bw / 2 + 0.9, 2.4, bw - 1.8, 1.2); }
  for (const x of xs) { g.fillStyle = shade(NEW_S, 0.05); g.fillRect(x - bw / 2, 0, 0.7, 4.4); }
  sign(g, xs[3], 3.4, 2.4, 0.6, 'beobank', null, '#e9473f', 'bold');
  for (let f = 0; f < floors; f++) {
    const y = 4.6 + f * fh;
    for (const [k, x] of xs.entries()) {
      const off = f % 2 ? (k % 2 ? 0.4 : -0.4) : 0; // the balconies' fronts step from floor to floor
      g.fillStyle = '#2e3236'; g.fillRect(x - bw / 2 + 0.55 + off, y + 0.55, bw - 1.1, fh - 0.55); // the deep recess
      g.fillStyle = '#4b5660'; g.fillRect(x - bw / 2 + 0.75 + off, y + 1.4, bw - 1.5, fh - 1.6); // the glass behind it
      g.fillStyle = 'rgba(160, 178, 186, 0.45)'; g.fillRect(x - bw / 2 + 0.55 + off, y + 0.55, bw - 1.1, 1.0); // the glass rail
      g.fillStyle = shade(NEW_S, 0.1); g.fillRect(x - bw / 2 + off, y, bw, 0.55); // the slab's edge
    }
  }
  g.fillStyle = shade(NEW_S, 0.12); g.fillRect(L, e - 0.2, w, h - e + 0.2);
}

// ------------------------------------------------------------------ the east side

// the BNP Paribas Fortis bank, the old Banque de Flandre: white stone in the grand manner, a basement
// with barred windows, the banking hall's tall round-arched windows with keystones in a rusticated
// ground floor, giant pilasters up the two storeys over it, pedimented windows, a deep bracketed
// cornice and a balustrade along the top
const BNP_S = '#e7e2d6';
function bank(g, w, h, e) {
  const L = -w / 2, n = Math.max(2, Math.round(w / 4.1)), xs = bays(w, n), bw = w / n;
  ashlar(g, L, 0, -L, h, BNP_S, { course: 0.6, seed: 71, vary: 0.03 });
  plinth(g, w, 2, xs, '#b9b5ab');
  rustic(g, L, -L, 2, 8.8, BNP_S, 0.8);
  for (const x of xs) win(g, x, 2.6, 2.5, 5.6, { S: BNP_S, arch: true, head: 'keystone', frame: '#2d3236', sur: 0.25, sill: false });
  stringCourse(g, L, -L, 9.1, BNP_S, 0.6);
  for (let k = 0; k <= n; k++) pilaster(g, L + k * bw + (k === 0 ? 0.4 : k === n ? -0.4 : 0), 9.3, e - 1.3, 0.7, BNP_S);
  xs.forEach((x, k) => win(g, x, 10.2, 2.0, 4.0, { S: BNP_S, head: k % 2 ? 'segment' : 'pediment', frame: '#2d3236', sur: 0.25 }));
  for (const x of xs) balustrade(g, x - 1.2, x + 1.2, 9.3, 0.8, BNP_S, 0.45);
  for (const x of xs) win(g, x, 15.3, 1.7, 2.2, { S: BNP_S, frame: '#2d3236', sur: 0.2, panes: 2 });
  cornice(g, L, -L, e - 0.4, BNP_S, { brackets: 0.9, deep: 1.1 });
  if (h - e < 1) return; // a side wall: drawn to the eaves only
  balustrade(g, L, -L, e + 0.4, h - e - 0.6, BNP_S, 0.6);
  g.fillStyle = shade(BNP_S, 0.1); g.fillRect(L, h - 0.3, w, 0.3);
}

// ------------------------------------------------------------------ the south side

// the long white palace at the square's south-east corner (a bank too, its windows now an office's):
// a rusticated ground floor of round-arched windows, three gilded iron gates under a carved curved
// pediment at its west end, a long stone balcony on consoles in the middle, tall windows with
// pediments and segments by turns over little balustrades, small windows under a bracketed cornice
const PAL_S = '#e4dccb';
function palace(g, w, h, e) {
  const L = -w / 2, n = 20, xs = bays(w, n), bw = w / n;
  ashlar(g, L, 0, -L, h, PAL_S, { course: 0.6, seed: 81, vary: 0.03 });
  plinth(g, w, 1.1, xs, '#a9a59d');
  rustic(g, L, -L, 1.1, 7.6, PAL_S);
  const gates = [n - 4, n - 3, n - 2]; // the right (west) end, seen from the square
  xs.forEach((x, k) => {
    if (gates.includes(k)) {
      g.fillStyle = shade(PAL_S, 0.1); g.fillRect(x - 1.35, 0.9, 2.7, 6.1);
      g.fillStyle = '#1f2326'; g.fillRect(x - 1.1, 1.1, 2.2, 5.7);
      g.strokeStyle = '#c9a548'; g.lineWidth = 0.08; // the gilded scrolls in the ironwork
      for (const y of [2.2, 3.9, 5.6]) { g.beginPath(); g.arc(x - 0.5, y, 0.32, 0, Math.PI * 2); g.arc(x + 0.5, y, 0.32, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = '#c9a548'; g.fillRect(x - 1.1, 3.0, 2.2, 0.08); g.fillRect(x - 0.03, 1.1, 0.06, 5.7);
    } else win(g, x, 1.9, 2.0, 4.9, { S: PAL_S, arch: true, head: 'keystone', frame: '#2b3034', sur: 0.25, sill: false });
  });
  // the carved pediment over the gates, on the first floor's sill
  const gx = xs[gates[1]], gw = bw * 3;
  g.fillStyle = shade(PAL_S, 0.14); g.beginPath(); g.moveTo(gx - gw / 2, 7.6); g.quadraticCurveTo(gx, 10.6, gx + gw / 2, 7.6); g.closePath(); g.fill();
  g.fillStyle = shade(PAL_S, -0.12); g.beginPath(); g.ellipse(gx, 8.4, 1.1, 0.55, 0, 0, Math.PI * 2); g.fill();
  stringCourse(g, L, -L, 7.9, PAL_S, 0.5);
  // the balcony on its consoles over the middle five bays
  const c0 = xs[n / 2 - 3] - bw / 2, c1 = xs[n / 2 + 2] + bw / 2;
  g.fillStyle = shade(PAL_S, -0.2); for (let x = c0 + 0.4; x < c1; x += bw / 2) g.fillRect(x - 0.2, 6.9, 0.4, 1.0);
  balustrade(g, c0, c1, 8.2, 1.0, PAL_S, 0.45);
  xs.forEach((x, k) => {
    if (x < c0 || x > c1) balustrade(g, x - 1.0, x + 1.0, 8.2, 0.7, PAL_S, 0.4);
    win(g, x, 9.2, 1.75, 3.9, { S: PAL_S, head: gates.includes(k) ? 'cornice' : k % 2 ? 'segment' : 'pediment', frame: '#2b3034', sur: 0.22 });
  });
  stringCourse(g, L, -L, 14.1, PAL_S, 0.4);
  for (const x of xs) win(g, x, 14.6, 1.5, 2.5, { S: PAL_S, head: 'cornice', frame: '#2b3034', sur: 0.2, panes: 2 });
  for (const x of [L + 0.5, -L - 0.5]) { g.fillStyle = shade(PAL_S, 0.08); for (let y = 7.9; y < e - 1; y += 1.0) g.fillRect(x - 0.5, y, 1.0, 0.85); } // the quoins
  cornice(g, L, -L, e - 0.4, PAL_S, { brackets: 0.7, deep: 1.0 });
  g.fillStyle = shade(PAL_S, 0.05); g.fillRect(L, e + 0.2, w, h - e - 0.2);
  for (const x of xs.filter((_, k) => k % 3 === 1)) balustrade(g, x - 1.6, x + 1.6, e + 0.4, h - e - 0.7, PAL_S, 0.4);
}

// the white house between the palace and the grey bank: tall barred windows on the ground floor
// and a round-arched carriage gate at its west end, two storeys of plain framed windows over it
const WH_S = '#ebe6da';
function whiteHouse(g, w, h, e) {
  const L = -w / 2, n = 8, xs = bays(w, n);
  ashlar(g, L, 0, -L, h, WH_S, { course: 0.55, seed: 91, vary: 0.025 });
  plinth(g, w, 1, xs, '#c4c0b6');
  g.fillStyle = shade(WH_S, -0.08); for (let y = 1.8; y < 7; y += 0.9) g.fillRect(L, y, w, 0.06);
  xs.forEach((x, k) => {
    if (k === n - 1) { roundArch(g, x, 0.6, 2.8, 6.4, shade(WH_S, 0.1)); roundArch(g, x, 0.7, 2.4, 6.1, '#3b2c22'); }
    else win(g, x, 1.4, 1.9, 5.2, { S: WH_S, bars: true, frame: '#2b3034', sur: 0.25, head: 'cornice' });
  });
  stringCourse(g, L, -L, 7.6, WH_S, 0.5);
  for (const x of xs) win(g, x, 8.4, 1.6, 3.4, { S: WH_S, head: 'cornice', frame: '#f4f2ec', sur: 0.22 });
  for (const x of xs) win(g, x, 12.8, 1.5, 2.6, { S: WH_S, frame: '#f4f2ec', sur: 0.2, panes: 2 });
  cornice(g, L, -L, e - 0.3, WH_S, { brackets: 0.6 });
  g.fillStyle = shade(WH_S, 0.05); g.fillRect(L, e + 0.3, w, h - e - 0.3);
}

// the grey bank next door: blue-grey stone, a great round-arched door on the left with an oriel
// window over it, up three storeys, cream stone above the ground floor, dormers in a slate mansard
const GB_S = '#d3cec2', GB_G = '#9d9b94';
function greyBank(g, w, h, e) {
  const L = -w / 2, n = 4, xs = bays(w, n), bw = w / n;
  ashlar(g, L, 0, -L, h, GB_S, { course: 0.6, seed: 95, vary: 0.03 });
  rustic(g, L, -L, 0, 7.4, GB_G, 0.8);
  roundArch(g, xs[0], 0.2, 2.9, 6.4, shade(GB_G, -0.2)); roundArch(g, xs[0], 0.35, 2.4, 6.0, '#5e3a24');
  g.fillStyle = '#4a2c1b'; g.fillRect(xs[0] - 0.04, 0.35, 0.08, 4.6);
  for (const x of xs.slice(1)) win(g, x, 1.3, 2.0, 5.0, { S: GB_G, frame: '#2b3034', sur: 0.25, sill: false });
  // the oriel over the door: its front lit, its sides in shadow
  g.fillStyle = shade(GB_S, 0.1); g.fillRect(xs[0] - bw / 2 + 0.2, 7.6, bw - 0.4, 10.4);
  g.fillStyle = shade(GB_S, -0.25); g.fillRect(xs[0] - bw / 2 + 0.2, 7.6, 0.3, 10.4); g.fillRect(xs[0] + bw / 2 - 0.5, 7.6, 0.3, 10.4);
  for (const y of [8.2, 11.6, 15]) win(g, xs[0], y, bw - 1.4, 2.6, { S: GB_S, frame: '#2b3034', sur: 0.15, panes: 2, sill: false });
  for (const [y, hh, head] of [[8.4, 3.0, 'cornice'], [11.9, 2.7, 'cornice'], [15.2, 2.4, null]]) for (const x of xs.slice(1)) win(g, x, y, 1.55, hh, { S: GB_S, head, frame: '#2b3034', sur: 0.2 });
  cornice(g, L, -L, e - 0.3, GB_S, { brackets: 0.6 });
  g.fillStyle = '#4a4f55'; g.fillRect(L, e, w, h - e);
  for (const x of xs) { g.fillStyle = shade(GB_S, 0.05); g.fillRect(x - 0.75, e + 0.5, 1.5, 2.1); g.fillStyle = GLASS; g.fillRect(x - 0.55, e + 0.6, 1.1, 1.7); }
}

// Kouter 26-27 (the LYNX offices): beige stone, a rusticated ground floor round its arched oak door
// in the middle and tall arched windows, a long iron balcony on carved consoles across the first
// floor, its windows under curved heads, small windows under the cornice
const LX_S = '#d8cfba';
function lynx(g, w, h, e) {
  const L = -w / 2, n = 5, xs = bays(w, n);
  ashlar(g, L, 0, -L, h, LX_S, { course: 0.6, seed: 97, vary: 0.03 });
  plinth(g, w, 1.0, xs.filter((_, k) => k !== 2), '#a19d93');
  rustic(g, L, -L, 1.0, 7.0, LX_S);
  xs.forEach((x, k) => {
    if (k === 2) { roundArch(g, x, 0.2, 2.6, 6.2, shade(LX_S, 0.12)); roundArch(g, x, 0.3, 2.2, 5.9, '#6b3f22'); g.fillStyle = GLASS; g.beginPath(); g.arc(x, 0.3 + 5.9 - 1.1, 1.0, 0, Math.PI); g.fill(); g.fillStyle = '#4e2d18'; g.fillRect(x - 0.04, 0.3, 0.08, 4.6); }
    else win(g, x, 1.5, 1.9, 4.9, { S: LX_S, arch: true, frame: '#3a2a20', head: 'keystone', sur: 0.25, sill: false });
  });
  g.fillStyle = shade(LX_S, -0.25); for (let x = xs[1] - 1; x <= xs[3] + 1.01; x += 1) g.fillRect(x - 0.18, 6.7, 0.36, 0.8);
  stringCourse(g, L, -L, 7.6, LX_S, 0.5);
  iron(g, xs[1] - 1.3, xs[3] + 1.3, 7.8, 1.0, LX_S);
  for (const x of xs) win(g, x, 8.2, 1.7, 3.9, { S: LX_S, head: 'segment', frame: '#3a2a20', sur: 0.25 });
  stringCourse(g, L, -L, 13.4, LX_S, 0.4);
  for (const x of xs) win(g, x, 14, 1.5, 2.6, { S: LX_S, head: 'cornice', frame: '#3a2a20', sur: 0.2, panes: 2 });
  cornice(g, L, -L, e - 0.3, LX_S, { brackets: 0.6 });
  g.fillStyle = shade(LX_S, 0.04); g.fillRect(L, e + 0.3, w, h - e - 0.3);
  win(g, 0, e + 0.6, 1.3, h - e - 1.1, { S: LX_S, frame: '#3a2a20', sur: 0.2, panes: 1, sill: false });
}

// the cream house with the corner pavilion (the restaurant Ha'): neo-Renaissance, tall French
// windows of the restaurant over a grey plinth, round-arched windows behind an iron balcony on the
// first floor, pedimented ones above, a bracketed cornice and a row of attic windows
const CR_S = '#e8e1c8';
function creamHouse(g, w, h, e) {
  const L = -w / 2, n = 11, xs = bays(w, n);
  ashlar(g, L, 0, -L, h, CR_S, { course: 0.6, seed: 99, vary: 0.03 });
  g.fillStyle = '#8d8c87'; g.fillRect(L, 0, w, 0.9);
  rustic(g, L, -L, 0.9, 7.0, CR_S, 0.9);
  for (const x of xs) win(g, x, 0.9, 2.1, 5.4, { S: CR_S, frame: '#f6f4ee', glass: '#3a332c', sur: 0.25, sill: false, head: 'keystone' });
  stringCourse(g, L, -L, 7.4, CR_S, 0.6);
  iron(g, xs[3] - 1.4, xs[n - 1] + 1.3, 7.6, 1.0, CR_S);
  for (const x of xs) win(g, x, 8.0, 1.95, 4.8, { S: CR_S, arch: true, frame: '#f6f4ee', sur: 0.25 });
  for (let k = 1; k < n; k++) pilaster(g, L + (k * w) / n, 7.8, 17, 0.45, CR_S);
  stringCourse(g, L, -L, 13.7, CR_S, 0.4);
  for (const x of xs) win(g, x, 14.2, 1.55, 2.6, { S: CR_S, head: 'pediment', frame: '#f6f4ee', sur: 0.2, panes: 2 });
  cornice(g, L, -L, e - 0.4, CR_S, { brackets: 0.55, deep: 1.0 });
  g.fillStyle = shade(CR_S, 0.04); g.fillRect(L, e + 0.2, w, h - e - 0.2);
  for (const x of xs) win(g, x, e + 0.5, 1.0, h - e - 1.0, { S: CR_S, frame: '#f6f4ee', sur: 0.15, panes: 1, sill: false });
}

// the corner pavilion's own walls, standing out of the cream house's front: its stone, a tall
// arched window a storey, and the mansard dome's foot along the top
function pavilion(g, w, h, e) {
  const L = -w / 2;
  ashlar(g, L, 0, -L, h, CR_S, { course: 0.6, seed: 101, vary: 0.03 });
  g.fillStyle = '#8d8c87'; g.fillRect(L, 0, w, 0.9);
  rustic(g, L, -L, 0.9, 7.0, CR_S, 0.9);
  const k = Math.max(1, Math.round(w / 3.4));
  for (const x of bays(w, k)) {
    win(g, x, 1.2, Math.min(2.4, w / k - 0.8), 5.2, { S: CR_S, arch: true, frame: '#f6f4ee', sur: 0.25, sill: false });
    win(g, x, 8.0, Math.min(2.2, w / k - 0.8), 5.6, { S: CR_S, arch: true, frame: '#f6f4ee', sur: 0.3, head: 'keystone' });
    win(g, x, 14.4, Math.min(1.6, w / k - 1), 2.4, { S: CR_S, frame: '#f6f4ee', sur: 0.2, panes: 2 });
  }
  cornice(g, L, -L, e - 0.4, CR_S, { brackets: 0.55 });
}

// De Standaard Boekhandel, the bookshop in the 1950s block of beige stone: black granite round the
// shop windows and the car park's door, the white sign with the owl, six storeys of windows each
// with a little iron rail
const SB_S = '#d9ceb6';
function standaard(g, w, h, e) {
  const L = -w / 2, n = 11, xs = bays(w, n), bw = w / n;
  ashlar(g, L, 0, -L, h, SB_S, { course: 0.8, seed: 103, vary: 0.02 });
  g.fillStyle = '#1d1c1b'; g.fillRect(L, 0, w, 5.2);
  for (let k = 0; k < n; k++) {
    if (k === n - 3) { g.fillStyle = '#9da29a'; g.fillRect(xs[k] - bw / 2 + 0.3, 0, bw - 0.6, 3.4); continue; } // the car park's door
    shop(g, xs[k] - bw / 2 + 0.25, xs[k] + bw / 2 - 0.25, 0.2, 3.9, '#151515', k % 2 ? '#c7744f' : '#d5a46b');
  }
  sign(g, xs[2] + bw / 2, 4.1, bw * 4, 0.95, 'Standaard Boekhandel', '#f3f1ec', '#1c1c1c');
  g.fillStyle = '#e8463a'; g.fillRect(xs[4] + bw - 0.2, 4.15, 0.85, 0.85); // the owl's red square
  const floors = 6, fh = (e - 5.8) / floors;
  for (let f = 0; f < floors; f++) {
    const y = 5.8 + f * fh + 0.45;
    for (const x of xs) { win(g, x, y, 2.0, fh - 1.0, { S: SB_S, frame: '#f2efe8', sur: 0.12, panes: 2, sill: false }); iron(g, x - 1.0, x + 1.0, y, 0.75, SB_S); }
  }
  g.fillStyle = shade(SB_S, 0.1); g.fillRect(L, e - 0.4, w, h - e + 0.4);
}

// ------------------------------------------------------------------ the fronts

const stone = hex => `stone:${hex}`;
export const KOUTER_FRONTS = [
  // the north side, west to east
  { id: 'kouter-nieuwbouw', at: [-66.5, 370.7], faces: 91, line: [-101.7, 410.9, -40.7, 411.6], gable: 'flat', wall: stone(NEW_S), roof: SLATE, eaves: 20, top: 21, px: 16, draw: balconyBlock },
  { id: 'kouter-vogelenzang', at: [-3, 383.4], faces: 83, line: [13, 405.7, -14.5, 409], gable: 'flat', wall: stone(BAY_S), roof: SLATE, eaves: 24, top: 25.2, draw: bayBlock },
  { id: 'handelsbeurs', name: 'Handelsbeurs', at: [26.3, 396], faces: 75, line: [42.2, 397.7, 13, 405.7], wall: stone(HB_Y), roof: SLATE, eaves: 15, top: 24,
    gable: ['row', [{ share: 3, gable: 'arc', rise: 3.2 }, { share: 3, gable: ['arc', 5.4], rise: 8.8 }, { share: 3, gable: 'arc', rise: 3.2 }]], draw: handelsbeurs },
  { id: 'kouter-grijs', at: [54.5, 369.6], faces: 71, line: [77.5, 386, 42.6, 398], gable: ['mansard', 1, 1], wall: stone(AH_S), roof: SLATE, eaves: 19, top: 22.4, draw: greyHouse },
  // the east side
  { id: 'kouter-bnp', name: 'BNP Paribas Fortis', at: [144.1, 479.6], faces: 174, line: [123.3, 469.3, 120.7, 444.9], gable: 'flat', wall: stone(BNP_S), roof: SLATE, eaves: 20, top: 22.5,
    draw: bank, side: bank },
  // the south side, east to west
  { id: 'kouter-paleis', at: [73.7, 490], faces: 263, line: [50.6, 478.5, 123.3, 469.3], gable: 'flat', wall: stone(PAL_S), roof: SLATE, eaves: 20, top: 22, px: 16, draw: palace },
  { id: 'kouter-wit', at: [33.6, 497.1], faces: 263, line: [15.2, 482.8, 44.1, 479.2], gable: 'flat', wall: stone(WH_S), roof: SLATE, eaves: 17, top: 18.2, draw: whiteHouse },
  { id: 'kouter-grijze-bank', at: [0, 511.8], faces: 263, line: [-11.1, 485.9, 5, 484], gable: ['mansard', 1.2, 1.2], wall: stone(GB_S), roof: SLATE, eaves: 19, top: 22.6, draw: greyBank },
  { id: 'kouter-lynx', at: [-14.2, 523.9], faces: 263, line: [-30, 488.2, -11.1, 485.9], gable: 'flat', wall: stone(LX_S), roof: SLATE, eaves: 18.5, top: 20.6, draw: lynx },
  { id: 'kouter-paviljoen', at: [-47.4, 512.4], faces: 263, line: [-69.1, 493.3, -30, 488.2], gable: 'flat', wall: stone(CR_S), roof: SLATE, eaves: 19, top: 21, draw: creamHouse, side: pavilion },
  { id: 'standaard-boekhandel', name: 'Standaard Boekhandel', at: [-87.5, 505], faces: 263, line: [-76.5, 494.3, -110.7, 498.4], gable: 'flat', wall: stone(SB_S), roof: SLATE, eaves: 24, top: 24.8, draw: standaard },
];
