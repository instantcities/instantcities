// The Taj Mahal (Shah Jahan's tomb for Mumtaz Mahal, 1632-1653), modelled by hand in place of the
// map's boxes, from its measurements and photos. Built in real metres and scaled to game metres
// (1.25) at the end, round the middle of the tomb, its front (the way to the garden) towards +z:
//   the terrace of red sandstone along the river, 1.4 m above the garden, with steps up from it
//   the white marble plinth, 104 m square, 6.5 m high, with a flight of steps on the garden side
//   the tomb: 57 m square with its corners cut off, 33 m to the roof. On each side a pishtaq, the
//     great portal, with a pointed iwan 24 m high and a smaller arch over it, and either side two
//     storeys of niches; on each cut corner the same two storeys again
//   the dome: the drum, the onion dome 24.5 m across, the lotus and the gold finial, 73 m above the
//     garden's terrace; four chhatris (domed kiosks) round it on the roof
//   the four minarets at the corners of the plinth, 40 m high: three storeys with balconies and a
//     chhatri on top
// Riders bump into the whole terrace; the way in to the tomb is not part of the game.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

export const S = 1.25; // game metres per real metre
const X = -91.3, Z = -253.8; // the middle of the tomb, in the map's metres

const MARBLE = '#fbf8f1', MARBLE2 = '#efeadf', INLAY = '#3a3a3a', GREEN = '#5d7d62', GOLD = '#d9a72e', SAND = '#b4523a', SAND2 = '#9f4631';
const TERRACE = 1.4, PLINTH = 7.9, HP = 52; // the terrace's top, the plinth's top (above the garden), its half width
const ROOF = PLINTH + 33; // the tomb's roof
const A = 28.5, C = 8; // half the tomb's side, how much of each corner is cut off

// the octagon of the tomb's faces, each one's outside to its right as it runs
const V = [[-A + C, -A], [A - C, -A], [A, -A + C], [A, A - C], [A - C, A], [-A + C, A], [-A, A - C], [-A, -A + C]];

const lathe = (kit, pts, hex, n = 48, x = 0, z = 0) => kit.add(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n), hex, x, 0, z);
const prism = (kit, pts, y0, y1, hex) => {
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  kit.add(new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false }).rotateX(-Math.PI / 2), hex, 0, y0, 0);
};
const rectRing = (s0, s1, y0, y1) => [[s0, y0], [s1, y0], [s1, y1], [s0, y1]];

// a pointed arch's frame, a band of dark inlay round the opening, laid on the wall's face at o
function frame(kit, path, s, w, y0, y1, o, pad = 0.55) {
  wall(kit, path, pointedRing(s, w + 2 * pad, y0, y1 + pad * 1.4, 1.25), { holes: [pointedRing(s, w, y0, y1, 1.25)], o0: o - 0.12, o1: o, hex: INLAY });
}

// one side of the tomb: its pishtaq in the middle if it is a long side, and the niches either side
function face(kit, i) {
  const a = V[i], b = V[(i + 1) % 8], path = linePath(a[0], a[1], b[0], b[1]), L = path.length, mid = L / 2;
  const slab = (s0, s1, holes, o0, o1, hex) => wall(kit, path, rectRing(s0, s1, PLINTH, ROOF), { holes, o0, o1, hex });
  if (L > 20) {
    // the pishtaq: 17.5 m wide, standing out 1.2 m, higher than the roof; the iwan cut deep into it
    const P = 8.75;
    wall(kit, path, rectRing(mid - P, mid + P, PLINTH, ROOF + 2.2), {
      holes: [pointedRing(mid, 10.4, PLINTH + 0.2, PLINTH + 24, 1.25), pointedRing(mid, 8.2, PLINTH + 26.2, PLINTH + 31.8, 1.25)],
      o0: -4.2, o1: 1.2, hex: MARBLE,
    });
    frame(kit, path, mid, 10.4, PLINTH + 0.2, PLINTH + 24, 1.25);
    frame(kit, path, mid, 8.2, PLINTH + 26.2, PLINTH + 31.8, 1.25);
    // the two bays either side of it, each with a niche over a niche
    for (const [s0, s1] of [[0, mid - P], [mid + P, L]]) {
      const c = (s0 + s1) / 2, w = (s1 - s0) * 0.62;
      slab(s0, s1, [], -4.2, -1.3, shade(MARBLE, -0.03));
      slab(s0, s1, [pointedRing(c, w, PLINTH + 1.6, PLINTH + 12.4, 1.25), pointedRing(c, w, PLINTH + 14.8, PLINTH + 26.2, 1.25)], -1.3, 0, MARBLE);
      frame(kit, path, c, w, PLINTH + 1.6, PLINTH + 12.4, 0.02, 0.4);
      frame(kit, path, c, w, PLINTH + 14.8, PLINTH + 26.2, 0.02, 0.4);
    }
  } else {
    // a cut corner: two niches one over the other
    const w = L * 0.5;
    slab(0, L, [], -4.2, -1.3, shade(MARBLE, -0.03));
    slab(0, L, [pointedRing(mid, w, PLINTH + 1.6, PLINTH + 12.4, 1.25), pointedRing(mid, w, PLINTH + 14.8, PLINTH + 26.2, 1.25)], -1.3, 0, MARBLE);
    frame(kit, path, mid, w, PLINTH + 1.6, PLINTH + 12.4, 0.02, 0.4);
    frame(kit, path, mid, w, PLINTH + 14.8, PLINTH + 26.2, 0.02, 0.4);
  }
}

// a chhatri: a domed kiosk on eight pillars, its floor at y
function chhatri(kit, x, y, z, r, h, dome) {
  kit.add(new THREE.CylinderGeometry(r + 0.5, r + 0.6, 0.7, 8), MARBLE, x, y + 0.35, z);
  for (let k = 0; k < 8; k++) {
    const t = (k / 8) * 2 * Math.PI + Math.PI / 8;
    kit.add(new THREE.CylinderGeometry(0.28, 0.32, h, 6), MARBLE, x + r * Math.cos(t), y + 0.7 + h / 2, z + r * Math.sin(t));
  }
  const top = y + 0.7 + h;
  kit.add(new THREE.CylinderGeometry(r + 0.35, r + 0.35, 0.6, 8), MARBLE, x, top + 0.3, z);
  const pts = [[r + 0.2, 0], [r + 0.85, 0.5], [r + 1.05, 1.3], [r + 0.5, dome * 0.55], [r * 0.5, dome * 0.85], [0.35, dome]];
  lathe(kit, pts.map(([q, v]) => [q, top + 0.6 + v]), MARBLE, 16, x, z).add(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 5), GOLD, x, top + 0.6 + dome + 0.5, z);
}

function dome(kit) {
  // the drum, 16-sided
  lathe(kit, [[10.4, ROOF], [10.4, ROOF + 8], [10.1, ROOF + 8]], MARBLE2, 16);
  kit.add(new THREE.CylinderGeometry(10.4, 10.4, 8, 16), MARBLE2, 0, ROOF + 4, 0);
  kit.add(new THREE.CylinderGeometry(11.2, 11.2, 0.7, 16), MARBLE, 0, ROOF + 0.35, 0);
  // the onion dome, up to the lotus
  const base = ROOF + 8;
  const pts = [[10.3, 0], [11.4, 1.5], [12.1, 3.4], [12.3, 6], [11.9, 9], [10.8, 12], [9, 14.8], [6.9, 17.4], [4.8, 19.6], [3.1, 21.3], [2, 22.4], [1.3, 23]];
  lathe(kit, pts.map(([r, y]) => [r, base + y]), MARBLE, 40);
  // the lotus, and the finial: gold, three balls on a spire with the crescent
  const t = base + 23;
  lathe(kit, [[1.7, t - 0.4], [2.1, t + 0.4], [1.2, t + 1.2], [0.5, t + 1.5]], MARBLE, 12);
  kit.add(new THREE.CylinderGeometry(0.18, 0.3, 8, 6), GOLD, 0, t + 5, 0);
  for (const [y, r] of [[t + 2.3, 0.75], [t + 4.4, 0.55], [t + 6.2, 0.4]]) kit.add(new THREE.SphereGeometry(r, 8, 6), GOLD, 0, y, 0);
  kit.add(new THREE.TorusGeometry(0.9, 0.12, 5, 14, Math.PI * 1.5), GOLD, 0, t + 8.4, 0, 0, 0, Math.PI * 0.75);
  // the four chhatris on the roof
  for (const [x, z] of [[-17.5, -17.5], [17.5, -17.5], [-17.5, 17.5], [17.5, 17.5]]) chhatri(kit, x, ROOF, z, 3, 5.4, 4.4);
}

function minaret(kit, x, z) {
  // an octagonal base, the shaft in three storeys with a balcony each, and the chhatri on top
  const y0 = PLINTH;
  kit.add(new THREE.CylinderGeometry(4.5, 4.8, 3.6, 8), MARBLE2, x, y0 + 1.8, z, 0, Math.PI / 8);
  kit.add(new THREE.CylinderGeometry(4.0, 4.5, 0.8, 8), MARBLE, x, y0 + 4, z, 0, Math.PI / 8);
  const balconies = [y0 + 12.6, y0 + 22.8, y0 + 32.2];
  let from = y0 + 4.4, r0 = 3.4;
  balconies.forEach((by, k) => {
    const r1 = r0 - 0.35;
    kit.add(new THREE.CylinderGeometry(r1, r0, by - from, 8), k % 2 ? MARBLE : MARBLE2, x, (from + by) / 2, z, 0, Math.PI / 8);
    kit.add(new THREE.CylinderGeometry(r1 + 1.3, r1 + 0.9, 0.9, 8), MARBLE, x, by + 0.45, z, 0, Math.PI / 8);
    // the balcony's rail: a ring of small pillars
    for (let q = 0; q < 8; q++) {
      const t = (q / 8) * 2 * Math.PI + Math.PI / 8;
      kit.add(new THREE.CylinderGeometry(0.14, 0.14, 1.1, 5), MARBLE, x + (r1 + 1.05) * Math.cos(t), by + 1.4, z + (r1 + 1.05) * Math.sin(t));
    }
    from = by + 0.9; r0 = r1;
  });
  const top = y0 + 40 - 6.6;
  kit.add(new THREE.CylinderGeometry(r0, r0 + 0.1, top - from, 8), MARBLE2, x, (from + top) / 2, z, 0, Math.PI / 8);
  chhatri(kit, x, top, z, 2.3, 4.6, 3.2);
}

export function taj() {
  const kit = new Kit();

  // the terrace, with its steps at the front
  kit.box(318, TERRACE, 122, SAND, 0, TERRACE / 2, -4);
  kit.box(318.8, 0.4, 122.8, shade(SAND, 0.1), 0, TERRACE + 0.01 - 0.2, -4);
  for (let k = 0; k < 3; k++) kit.box(40 - k * 4, 0.4, 1.2, shade(SAND2, 0.04), 0, 0.2 + k * 0.4, 58.4 + 1 - k * 0.9);

  // the plinth, a lower and an upper course, with the steps up from the garden side
  kit.box(HP * 2 + 2, 1.2, HP * 2 + 2, MARBLE2, 0, TERRACE + 0.6, 0);
  kit.box(HP * 2, PLINTH - TERRACE - 1.2, HP * 2, MARBLE, 0, (TERRACE + 1.2 + PLINTH) / 2, 0);
  kit.box(HP * 2 + 1, 0.6, HP * 2 + 1, MARBLE2, 0, PLINTH - 0.3, 0);
  for (let k = 0; k < 4; k++) kit.box(24 - k, 0.5, 1.4, MARBLE2, 0, PLINTH - 0.25 - 0.5 * k - 0.3, HP + 1.4 + 0.5 + k * 1.2);
  // inlaid bands along the plinth's face
  kit.box(HP * 2 + 0.2, 0.4, HP * 2 + 0.2, INLAY, 0, TERRACE + 3.4, 0);
  kit.box(HP * 2 + 0.2, 0.4, HP * 2 + 0.2, GREEN, 0, PLINTH - 1.6, 0);

  // the tomb: a core a little inside its faces, the faces on it, the cornice and the roof
  const k = 4.2;
  prism(kit, [[-A + C - 1.5, -A + k], [A - C + 1.5, -A + k], [A - k, -A + C - 1.5], [A - k, A - C + 1.5], [A - C + 1.5, A - k], [-A + C - 1.5, A - k], [-A + k, A - C + 1.5], [-A + k, -A + C - 1.5]], PLINTH, ROOF, MARBLE2);
  for (let i = 0; i < 8; i++) face(kit, i);
  prism(kit, V.map(([x, z]) => [x * 1.02, z * 1.02]), ROOF - 0.3, ROOF + 0.4, MARBLE);
  prism(kit, V.map(([x, z]) => [x * 0.94, z * 0.94]), ROOF, ROOF + 0.9, MARBLE2);
  dome(kit);

  for (const sx of [-1, 1]) for (const sz of [-1, 1]) minaret(kit, sx * 47.5, sz * 47.5);

  const m = kit.mesh(kitMat(0.85));
  m.scale.setScalar(S);
  return m;
}

// in the map's metres, from a model's real ones
const ring = pts => onMap(X, Z, 0, pts.map(([u, v]) => [u * S, v * S]));

// It stands in for the map's pieces of the tomb, the plinth and the minarets (area); riders bump
// into the whole terrace (foot).
export const TAJ = [{
  id: 'taj-mahal', name: 'Taj Mahal', x: X, z: Z, turn: 0, reach: 520,
  area: [ring(rect(-62, -66, 62, 62))],
  foot: [ring(rect(-159, -65, 159, 57))],
  make: taj,
}];
