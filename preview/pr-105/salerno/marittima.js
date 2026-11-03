// The Stazione Marittima, Zaha Hadid's ferry terminal on the Molo Manfredi (designed 2000, opened
// 2016), modelled by hand in place of the map's block of it, on the map's outline of it, in game
// metres (the real ones times 1.25). An oyster, its architects called it: a hard white shell over the
// soft inside, with no straight wall to it. Here its shell is lofted along the pier from section to
// section, each one as wide as the map's outline there, swelling from the low end on the land side up
// over the hall in the middle and running out in the long low tail towards the berths, with a ribbon
// of dark glass along its foot and filling its two ends.
// The model's own metres: u across the pier, to the east, v along it, to the south (out to sea), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { toLocal } from './outline.js';

const X = -770, Z = 495, TURN = 0.265;
// the map's outline of the terminal (the city's metres)
const RING = [-744.2,568.8,-743.1,568.8,-742.6,567.9,-751.6,542.8,-765.9,528.6,-770.4,516.8,-755.7,532.8,-753.4,531.1,-760.4,521.4,-755.4,520.8,-751.4,524.6,-729.6,521.5,-759.5,438.4,-764.3,429.1,-768.4,417,-802.3,429.3,-793.7,454.9,-792.9,461.2,-794.7,470.6,-775.6,517.2,-762.6,555.6];
const GLASS = 3.4; // the ribbon of glass along the foot
const WHITE = '#eeece6', GLAZE = '#33414c';

// the height of the shell's crown along the pier: low on the land side, highest over the hall, then
// falling away along the tail
const crown = v => {
  const k = [[-76, 10], [-50, 15], [-15, 22], [12, 25], [36, 17], [56, 10], [79, 4]];
  for (let i = 1; i < k.length; i++) if (v <= k[i][0]) { const t = (v - k[i - 1][0]) / (k[i][0] - k[i - 1][0]), e = t * t * (3 - 2 * t); return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * e; }
  return k.at(-1)[1];
};

// where the line at v crosses the outline: its westmost and eastmost u
function across(ring, v) {
  let lo = Infinity, hi = -Infinity;
  ring.forEach(([u0, v0], i) => {
    const [u1, v1] = ring[(i + 1) % ring.length];
    if ((v0 - v) * (v1 - v) > 0 || v0 === v1) return;
    const u = u0 + ((v - v0) / (v1 - v0)) * (u1 - u0);
    lo = Math.min(lo, u); hi = Math.max(hi, u);
  });
  return [lo, hi];
}

export function marittima() {
  const kit = new Kit(), ring = toLocal(RING, X, Z, TURN);
  const vs = ring.map(p => p[1]), v0 = Math.min(...vs) + 0.3, v1 = Math.max(...vs) - 0.3, n = Math.ceil((v1 - v0) / 2), M = 14;
  // each section: the glass at its foot on either side, and the shell's curve over it
  const sections = [];
  for (let i = 0; i <= n; i++) {
    const v = v0 + ((v1 - v0) * i) / n, [a, b] = across(ring, v), mid = (a + b) / 2, half = (b - a) / 2;
    const top = Math.max(GLASS + 0.6, Math.min(crown(v), GLASS + half * 1.6));
    const pts = [[a, 0]];
    for (let k = 0; k <= M; k++) {
      const x = -1 + (2 * k) / M, lean = 1 + 0.12 * x; // the crown leans a little to the east
      pts.push([mid + x * half, GLASS + (top - GLASS) * Math.pow(Math.max(0, 1 - x * x), 0.45) * lean]);
    }
    pts.push([b, 0]);
    sections.push({ v, pts });
  }
  const shell = [], glass = [];
  const tri = (out, p, q, r) => out.push(...p, ...q, ...r, ...p, ...r, ...q); // both faces
  for (let i = 0; i < n; i++) {
    const A = sections[i], B = sections[i + 1];
    for (let k = 0; k < A.pts.length - 1; k++) {
      const out = k === 0 || k === A.pts.length - 2 ? glass : shell;
      const p = [A.pts[k][0], A.pts[k][1], A.v], q = [A.pts[k + 1][0], A.pts[k + 1][1], A.v];
      const r = [B.pts[k + 1][0], B.pts[k + 1][1], B.v], s = [B.pts[k][0], B.pts[k][1], B.v];
      tri(out, p, q, r); tri(out, p, r, s);
    }
  }
  // the two ends, glazed
  for (const S of [sections[0], sections[n]]) {
    const c = [(S.pts[0][0] + S.pts.at(-1)[0]) / 2, 0, S.v];
    for (let k = 0; k < S.pts.length - 1; k++) tri(glass, c, [S.pts[k][0], S.pts[k][1], S.v], [S.pts[k + 1][0], S.pts[k + 1][1], S.v]);
  }
  const geo = arr => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
  kit.add(geo(shell), WHITE).add(geo(glass), GLAZE);
  // the shell's lip over the glass, standing out a little all along both sides
  for (const S of sections) for (const k of [1, S.pts.length - 2]) kit.box(0.6, 0.3, 2.1, WHITE, S.pts[k][0] + (k === 1 ? -0.3 : 0.3), GLASS, S.v);
  return kit.mesh(kitMat(0.6));
}

export const MARITTIMA = [{ id: 'stazione-marittima', name: 'Stazione Marittima', x: X, z: Z, turn: TURN, reach: 110, area: [RING], foot: [RING], make: marittima }];
