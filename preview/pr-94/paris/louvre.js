// The Palais du Louvre, modelled by hand in place of the map's one outline of it (which fills in all
// its courtyards, the Cour Carrée too) and of the underground Carrousel's box on the square, from
// the map's outlines and its measurements, in game metres (the real ones times 1.25):
//   the Cour Carrée at the east end, open in the middle again with a passage through each wing, its
//     flat roofs behind their balustrades, Perrault's colonnade of paired columns along its east
//     front, and the Pavillon de l'Horloge with its square dome over the west wing
//   the Richelieu and Denon wings either side of the Cour Napoléon and the pyramid, the Rivoli wing
//     and the Grande Galerie along the Seine running west to the Pavillons de Marsan and de Flore,
//     all under mansards with dormers, three storeys of windows, round-headed below
//   their pavilions under tall steep roofs with gilt crests: Richelieu and Denon facing the pyramid,
//     Colbert, Daru, Turgot and Mollien at the corners, those either side of the Guichets, Marsan
//     and Flore at the ends
//   the Guichets, the passages through the Rivoli wing and the Grande Galerie that the streets take
//   the Arc de Triomphe du Carrousel on the square, its pink marble columns and its quadriga
// The model's own metres: u along the Louvre's axis from the pyramid east, v across it (south), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { MAP } from './map.js';

const X = -960.5, Z = -598.8, TURN = -0.437; // the pyramid's middle, and the axis turned from east
const STONE = '#e3d7bc', STONE2 = '#d0c3a6', SLATE = '#59626b', LEAD = '#6b737a', DARK = '#33363a', GOLD = '#cda748', MARBLE = '#c88f8a';
const EAVES = 27, ROOF = 36;

// the wings, each a quadrilateral [u, v] going round: its west end, its east end
const RIVOLI = [[-290, -177], [-118, -175], [-118, -149], [-290, -148]], GALERIE = [[-445, 191], [-100, 167], [-100, 191], [-445, 216]];
const GUICHETS = [-176, -131]; // the passages for the streets through both wings, the Guichets de Rohan and du Carrousel
// a wing's stretch from u0 to u1 (its first two corners along the top, the last two along the bottom)
const cut = (q, u0, u1) => {
  const at = (a, b, u) => [u, a[1] + ((b[1] - a[1]) * (u - a[0])) / (b[0] - a[0])];
  return [at(q[0], q[1], u0), at(q[0], q[1], u1), at(q[3], q[2], u1), at(q[3], q[2], u0)];
};
const WINGS = [
  [[-452, -184], [-290, -181], [-290, -145], [-452, -142]], // the Rivoli wing from Marsan
  cut(RIVOLI, -290, GUICHETS[0]), cut(RIVOLI, GUICHETS[1], -118),
  [[-118, -178], [131, -172], [135, -90], [-116, -76]], // Richelieu
  [[131, -110], [152, -108], [155, -88], [134, -90]],
  [[-100, 89], [150, 74], [160, 160], [-100, 175]], // Denon
  [[150, 78], [169, 76], [170, 92], [152, 94]],
  cut(GALERIE, -445, GUICHETS[0]), cut(GALERIE, GUICHETS[1], -100), // the Grande Galerie
  [[-300, 159], [-208, 153], [-208, 182], [-300, 188]],
];
const OVER = [cut(RIVOLI, ...GUICHETS), cut(GALERIE, ...GUICHETS)], ARCH = 10; // the wings over the passages, from this high
const CARREE = [[150, -107], [353, -142], [375, 71], [169, 93]], DEEP = 26, GATE = 7; // the Cour Carrée's outer corners, its wings' depth, its passages
// the pavilions: middle [u, v], size along u and v, its walls' and its roof's height
const PAVILIONS = [
  [[-438, -162], 33, 44, EAVES + 4, 18], [[-440, 207], 30, 41, EAVES + 4, 18], // Marsan, Flore
  [[8, -92], 30, 22, EAVES + 3, 16], [[8, 91], 30, 22, EAVES + 3, 16], // Richelieu, Denon
  [[-105, -86], 22, 22, EAVES + 2, 13], [[124, -98], 22, 22, EAVES + 2, 13], [[-90, 98], 22, 22, EAVES + 2, 13], [[143, 84], 22, 22, EAVES + 2, 13],
  [[-186, 185], 22, 32, EAVES + 3, 15], [[-121, 180], 22, 32, EAVES + 3, 15], // beside the Guichets du Carrousel
  [[-186, -163], 22, 32, EAVES + 3, 15], [[-121, -162], 22, 32, EAVES + 3, 15], // and those of Rohan
];
const HORLOGE = [172, -8], ARC = [-286, 24.3];

// a ring turned to go anticlockwise (u east, v south seen from above: area > 0)
const ccw = r => (r.reduce((s, [a, b], i) => { const [c, d] = r[(i + 1) % r.length]; return s + a * d - c * b; }, 0) > 0 ? r : r.slice().reverse());
// a convex ring moved d in from each of its sides
function inset(r, d) {
  const n = r.length, lines = r.map((p, i) => {
    const q = r[(i + 1) % n], L = Math.hypot(q[0] - p[0], q[1] - p[1]), tx = (q[0] - p[0]) / L, tz = (q[1] - p[1]) / L;
    return [p[0] - tz * d, p[1] + tx * d, tx, tz]; // in: to the left going round
  });
  return lines.map((l, i) => {
    const m = lines[(i + n - 1) % n], det = m[2] * l[3] - m[3] * l[2];
    const t = ((l[0] - m[0]) * l[3] - (l[1] - m[1]) * l[2]) / det;
    return [m[0] + m[2] * t, m[1] + m[3] * t];
  });
}

export function louvre() {
  const kit = new Kit();
  // a block on a ring from y0 to y1, with walls up from the bottom ring to the top one (narrower
  // for a mansard) and a flat top
  const block = (lo, hi, y0, y1, hex, top = hex, under = false) => {
    const pos = [], P = (p, y) => [p[0], y, p[1]];
    for (let i = 0; i < lo.length; i++) {
      const j = (i + 1) % lo.length, a = P(lo[i], y0), b = P(lo[j], y0), c = P(hi[j], y1), d = P(hi[i], y1);
      pos.push(...a, ...c, ...b, ...a, ...d, ...c);
    }
    kit.add(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)), hex);
    const tri = THREE.ShapeUtils.triangulateShape(hi.map(p => new THREE.Vector2(p[0], p[1])), []), cap = [];
    for (let [i, j, k] of tri) {
      const up = (hi[j][0] - hi[i][0]) * (hi[k][1] - hi[i][1]) - (hi[j][1] - hi[i][1]) * (hi[k][0] - hi[i][0]) > 0;
      if (up) [j, k] = [k, j]; // facing the sky
      cap.push(...P(hi[i], y1), ...P(hi[j], y1), ...P(hi[k], y1));
      if (under) cap.push(...P(lo[i], y0), ...P(lo[k], y0), ...P(lo[j], y0)); // and facing the ground
    }
    kit.add(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(cap, 3)), top);
  };
  // the windows along a ring's sides (or a line's, not closed): three storeys, and every other one a
  // dormer in the mansard
  const windows = (r, dormers = true, closed = true, from = 0) => {
    for (let i = 0; i < r.length - (closed ? 0 : 1); i++) {
      const p = r[i], q = r[(i + 1) % r.length], L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const tx = (q[0] - p[0]) / L, tz = (q[1] - p[1]) / L, nx = tz, nz = -tx, ang = Math.atan2(-tz, tx), n = Math.floor(L / 4.4);
      for (let k = 0; k < n; k++) {
        const s = (k + 0.5) * (L / n), x = p[0] + tx * s, z = p[1] + tz * s;
        if (!from) {
          kit.box(2, 5, 0.3, DARK, x + nx * 0.1, 5, z + nz * 0.1, 0, ang);
          kit.add(new THREE.CylinderGeometry(1, 1, 0.3, 8, 1, false, 0, Math.PI), DARK, x + nx * 0.1, 7.5, z + nz * 0.1, 0, ang + Math.PI / 2, Math.PI / 2);
        }
        kit.box(1.9, 4.4, 0.3, DARK, x + nx * 0.1, 14, z + nz * 0.1, 0, ang);
        kit.box(1.7, 3.2, 0.3, DARK, x + nx * 0.1, 21.5, z + nz * 0.1, 0, ang);
        if (k % 2 === 0) kit.box(0.9, EAVES - 1 - from, 0.6, STONE2, x + tx * 2.2 + nx * 0.2, (EAVES - 1 + from) / 2, z + tz * 2.2 + nz * 0.2, 0, ang);
        if (dormers && k % 2 === 0) {
          kit.box(2.2, 3.2, 2.2, STONE2, x - nx * 2.4, EAVES + 3.2, z - nz * 2.4, 0, ang);
          kit.box(1.3, 2, 0.3, DARK, x - nx * 1.2, EAVES + 3, z - nz * 1.2, 0, ang);
        }
      }
      // the cornices between the storeys
      for (const y of [10.5, 18.5, EAVES - 0.5].filter(y => y > from)) kit.box(L, 0.7, 0.8, STONE2, (p[0] + q[0]) / 2 + nx * 0.3, y, (p[1] + q[1]) / 2 + nz * 0.3, 0, ang);
    }
  };
  // a wing under its mansard
  for (const w of WINGS.map(ccw)) {
    block(w, w, 0, EAVES, STONE);
    block(inset(w, -0.4), inset(w, 6), EAVES, ROOF, SLATE, LEAD);
    windows(w);
  }
  // the wings over the Guichets, their vaults' undersides and the arches at either end
  for (const w of OVER.map(ccw)) {
    block(w, w, ARCH, EAVES, STONE, STONE, true);
    block(inset(w, -0.4), inset(w, 6), EAVES, ROOF, SLATE, LEAD);
    windows(w, true, true, ARCH);
  }

  // the Cour Carrée: four wings round the open court, flat-roofed behind a balustrade
  const outer = ccw(CARREE), inner = inset(outer, DEEP);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4, w = [outer[i], outer[j], inner[j], inner[i]];
    block(w, w, 0, EAVES + 2, STONE, LEAD);
    windows([outer[i], outer[j]], false, false);
    windows([inner[j], inner[i]], false, false);
    // the balustrade along its outer side, and its passage through to the court
    const [a, b] = [outer[i], outer[j]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
    const nx = (b[1] - a[1]) / L, nz = -(b[0] - a[0]) / L;
    kit.box(L, 1.6, 0.6, STONE2, (a[0] + b[0]) / 2 - nx * 0.3, EAVES + 2.8, (a[1] + b[1]) / 2 - nz * 0.3, 0, ang);
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], c = [(inner[i][0] + inner[j][0]) / 2, (inner[i][1] + inner[j][1]) / 2];
    for (const [x, z, s] of [[m[0], m[1], 1], [c[0], c[1], -1]]) {
      kit.box(GATE, 8, 0.4, '#3d3a36', x + nx * 0.2 * s, 4, z + nz * 0.2 * s, 0, ang);
      kit.add(new THREE.CylinderGeometry(GATE / 2, GATE / 2, 0.4, 10, 1, false, 0, Math.PI), '#3d3a36', x + nx * 0.2 * s, 8, z + nz * 0.2 * s, 0, ang + Math.PI / 2, Math.PI / 2);
    }
  }
  // Perrault's colonnade along the east front: the podium, the paired columns, the entablature
  // and balustrade over them, and the pediment of its middle
  {
    const [a, b] = [outer[1], outer[2]].sort((p, q) => p[1] - q[1]), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const tx = (b[0] - a[0]) / L, tz = (b[1] - a[1]) / L, nx = tz * -1, nz = -tx * -1, ang = Math.atan2(-tz, tx);
    const at = (s, o) => [a[0] + tx * s + nx * o, a[1] + tz * s + nz * o];
    const out = nx * (a[0] - (outer[0][0] + outer[3][0]) / 2) + nz * (a[1] - (outer[0][1] + outer[3][1]) / 2) > 0 ? 1 : -1; // which way is out
    const [px, pz] = at(L / 2, out * 2.5);
    kit.box(L, 11, 5, STONE2, px, 5.5, pz, 0, ang);
    for (let s = 6; s < L - 4; s += 7.4) for (const d of [0, 1.9]) {
      const [x, z] = at(s + d, out * 4);
      kit.add(new THREE.CylinderGeometry(0.75, 0.85, EAVES - 11, 8), STONE, x, 11 + (EAVES - 11) / 2, z);
    }
    const [ex, ez] = at(L / 2, out * 2.6);
    kit.box(L, 3, 5.6, STONE2, ex, EAVES + 1.5, ez, 0, ang);
    kit.box(L, 1.4, 0.6, STONE, ...(([x, z]) => [x, EAVES + 3.7, z])(at(L / 2, out * 5)), 0, ang);
    const ped = new THREE.Shape([new THREE.Vector2(-16, 0), new THREE.Vector2(16, 0), new THREE.Vector2(0, 6)]);
    const [mx, mz] = at(L / 2, out * 5.4);
    kit.add(new THREE.ExtrudeGeometry(ped, { depth: 1.2, bevelEnabled: false }), STONE, mx, EAVES + 3, mz, 0, ang);
  }

  // a pavilion: its block, its tall roof, the gilt crest along its top
  const pavilion = ([u, v], w, d, wall, roof) => {
    kit.box(w, wall, d, STONE, u, wall / 2, v);
    kit.box(w + 1, 1.2, d + 1, STONE2, u, wall - 0.6, v);
    for (const su of [-1, 1]) for (const sv of [-1, 1]) kit.box(1.4, wall, 1.4, STONE2, u + su * (w / 2), wall / 2, v + sv * (d / 2));
    for (const [y, h] of [[5, 5], [14, 4.4], [21.5, 3.4]]) for (const k of [-1, 0, 1]) {
      kit.box(2, h, 0.3, DARK, u + k * w / 4, y, v + d / 2 + 0.1).box(2, h, 0.3, DARK, u + k * w / 4, y, v - d / 2 - 0.1);
      kit.box(0.3, h, 2, DARK, u + w / 2 + 0.1, y, v + k * d / 4).box(0.3, h, 2, DARK, u - w / 2 - 0.1, y, v + k * d / 4);
    }
    const tw = w * 0.3, td = d * 0.3;
    kit.frustum(w + 0.6, d + 0.6, tw, td, roof, SLATE, u, wall, v);
    kit.box(tw + 0.3, 0.5, td + 0.3, GOLD, u, wall + roof + 0.25, v);
    for (const su of [-1, 1]) for (const sv of [-1, 1]) kit.add(new THREE.ConeGeometry(0.3, 2, 4), GOLD, u + su * tw / 2, wall + roof + 1.4, v + sv * td / 2);
    // a pediment over its front on each long side, with a round window
    for (const sv of [-1, 1]) {
      kit.box(w * 0.5, 2.2, 1, STONE2, u, wall + 1.1, v + sv * (d / 2 + 0.3));
      kit.add(new THREE.CylinderGeometry(1.1, 1.1, 0.4, 10), DARK, u, wall + 4, v + sv * (d / 2 - 1.5), Math.PI / 2);
    }
  };
  for (const [c, w, d, wall, roof] of PAVILIONS) pavilion(c, w, d, wall, roof);

  // the Pavillon de l'Horloge over the Cour Carrée's west wing: its caryatids' storey and the square
  // dome in three stages with its lantern
  {
    const [u, v] = HORLOGE, R = -0.13;
    kit.add(new THREE.BoxGeometry(32, EAVES + 10, 34), STONE, u, (EAVES + 10) / 2, v, 0, R);
    for (const sv of [-1, 1]) for (let k = -2; k <= 2; k++) {
      const x = u + Math.cos(R) * (k * 3.2) + Math.sin(R) * sv * 17.3, z = v - Math.sin(R) * (k * 3.2) + Math.cos(R) * sv * 17.3;
      kit.add(new THREE.CylinderGeometry(0.6, 0.6, 6, 6), '#efe8d8', x, EAVES + 4, z);
    }
    for (const sx of [-1, 1]) for (let k = -2; k <= 2; k++) {
      const x = u + Math.cos(R) * sx * 16.3 + Math.sin(R) * (k * 3.2), z = v - Math.sin(R) * sx * 16.3 + Math.cos(R) * (k * 3.2);
      kit.add(new THREE.CylinderGeometry(0.6, 0.6, 6, 6), '#efe8d8', x, EAVES + 4, z);
    }
    const y0 = EAVES + 10;
    kit.frustum(33, 35, 26, 28, 7, SLATE, u, y0, v, R);
    kit.frustum(26, 28, 16, 17, 6, SLATE, u, y0 + 7, v, R);
    kit.frustum(16, 17, 5, 5, 4, SLATE, u, y0 + 13, v, R);
    kit.box(4, 4, 4, STONE2, u, y0 + 19, v, 0, R);
    kit.add(new THREE.ConeGeometry(2.6, 4, 4).rotateY(Math.PI / 4), SLATE, u, y0 + 23, v, 0, R);
    kit.add(new THREE.CylinderGeometry(2.4, 2.4, 0.4, 16), '#f0ebe0', u - 17.3 * Math.cos(R), y0 - 4, v + 17.3 * Math.sin(R), 0, 0, Math.PI / 2);
  }

  // the Arc de Triomphe du Carrousel: its three arches, the pink marble columns, the attic, the
  // quadriga on top. Its long side across the axis
  {
    const [u, v] = ARC, W = 28.8, D = 9.1, H = 18.8;
    kit.box(D, 15, W, '#e5ddcc', u, 7.5, v);
    for (const [dv, w, h] of [[0, 5.8, 11.5], [-9.4, 3.4, 8.2], [9.4, 3.4, 8.2]]) {
      for (const su of [-1, 1]) {
        kit.box(0.3, h, w, DARK, u + su * (D / 2 + 0.05), h / 2, v + dv);
        kit.add(new THREE.CylinderGeometry(w / 2, w / 2, 0.3, 10, 1, false, 0, Math.PI), DARK, u + su * (D / 2 + 0.05), h, v + dv, 0, 0, Math.PI / 2);
      }
      kit.box(D + 0.2, h + w / 2 - 0.6, w - 0.4, '#3f3b37', u, (h + w / 2 - 0.6) / 2, v + dv);
    }
    for (const su of [-1, 1]) for (const dv of [-12.9, -5.2, 5.2, 12.9]) {
      kit.add(new THREE.CylinderGeometry(0.6, 0.65, 12, 8), MARBLE, u + su * (D / 2 + 1), 1.5 + 6, v + dv);
      kit.box(1.4, 1.5, 1.4, '#e5ddcc', u + su * (D / 2 + 1), 0.75, v + dv);
      kit.add(new THREE.BoxGeometry(0.8, 2.2, 0.8), '#eae4d6', u + su * (D / 2 + 1), 15.6 + 1.1, v + dv);
    }
    kit.box(D + 2.6, 1.2, W + 1.4, '#e5ddcc', u, 14.2, v);
    kit.box(D, 3.8, W, '#e5ddcc', u, 16.7, v);
    // the quadriga: four horses and the chariot, gilt bronze
    for (const dv of [-2.4, -0.8, 0.8, 2.4]) {
      kit.box(2.6, 1.2, 0.8, GOLD, u - 1, H + 1.4, v + dv);
      kit.box(0.7, 1.3, 0.6, GOLD, u - 2.2, H + 2.4, v + dv, 0, 0, -0.5);
      for (const du of [-1.9, 0]) kit.box(0.3, 1, 0.3, GOLD, u + du, H + 0.3, v + dv);
    }
    kit.box(2.2, 1.6, 3.4, GOLD, u + 1.6, H + 1, v);
    kit.add(new THREE.CylinderGeometry(0.4, 0.5, 2.6, 6), GOLD, u + 1.8, H + 3, v);
  }
  return kit.mesh(kitMat(0.88));
}

// the map's own buildings this stands in for: the Louvre's one outline, the underground Carrousel's
// box and its inverted pyramid's square, the parts of the arch, and the kiosk west of it that the map
// makes three storeys
const mid = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
const model = ([x, z]) => { const dx = x - X, dz = z - Z, c = Math.cos(TURN), s = Math.sin(TURN); return [dx * c - dz * s, dx * s + dz * c]; };
const castle = MAP.buildings.find(b => b.k === 'castle' && b.p.length > 2000);
const carrousel = MAP.buildings.filter(b => b.k === 'yes' && b.f === 1 && (([u, v]) => u > -240 && u < -150 && v > -60 && v < 20)(model(mid(b.p))));
const AREA = [...(castle ? [castle.p, onMap(...mid(castle.p), 0, rect(-2, -2, 2, 2))] : []), ...carrousel.map(b => b.p), onMap(X, Z, TURN, rect(ARC[0] - 9, ARC[1] - 16, ARC[0] + 9, ARC[1] + 16)), onMap(X, Z, TURN, rect(-338, 6, -327, 18))];

// the court's wings, each in two halves either side of its passage
const COURT = (() => {
  const outer = ccw(CARREE), inner = inset(outer, DEEP), out = [];
  const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4, L = Math.hypot(outer[j][0] - outer[i][0], outer[j][1] - outer[i][1]), g = GATE / 2 / L;
    out.push([outer[i], lerp(outer[i], outer[j], 0.5 - g), lerp(inner[i], inner[j], 0.5 - g), inner[i]]);
    out.push([lerp(outer[i], outer[j], 0.5 + g), outer[j], inner[j], lerp(inner[i], inner[j], 0.5 + g)]);
  }
  return out;
})();
// the arch's four piers, between its three arches
const ARC_FEET = [[-14.4, -11.1], [-7.7, -2.9], [2.9, 7.7], [11.1, 14.4]].map(([a, b]) => rect(ARC[0] - 5.5, ARC[1] + a, ARC[0] + 5.5, ARC[1] + b));

export const LOUVRE = [{
  id: 'louvre', name: 'Palais du Louvre', x: X, z: Z, turn: TURN, reach: 480,
  area: AREA,
  foot: [...WINGS, ...COURT, ...PAVILIONS.map(([[u, v], w, d]) => rect(u - w / 2, v - d / 2, u + w / 2, v + d / 2)), ...ARC_FEET].map(r => onMap(X, Z, TURN, r)),
  make: louvre,
}];
