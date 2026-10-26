// The Glazen Straatje (Pieter Vanderdoncktdoorgang) and the red-light streets round it, by Zuid.
// The covered shopping gallery that Pieter Jan Vander Donckt had built from the Brabantdam (Louis
// Eyckens, 1846-52), the only one in Ghent under glass and iron, extended to the Vlaanderenstraat
// in 1886 (Ernest Leclerc). Its little shops have long been windows lit red and pink. The map has
// each covered arm as one building=roof outline, which the city would build as a solid block four
// storeys high: here they give way to an open gallery, its shop fronts along both sides under a
// glazed barrel vault on iron ribs, and a portal over each end. The houses round it, in the
// Schepenenvijverstraat, the Belgradostraat and the open end of the doorgang, get lit windows on
// their ground floors. Hand-written, game metres.
import * as THREE from 'three';
import { MAP } from './map.js';
import { elevation, rng, shade, letGo } from '../core/js/facades.js';
import { Kit, kitMat } from '../core/js/kit.js';

export const GALLERY_NAME = 'Pieter Vanderdoncktdoorgang';
const X = 660, Z = 545; // the gallery's middle, which its model is drawn round

// The two covered arms, from the street each opens on to the courtyard where they meet: the map's
// footway down its middle, a point inside the map's outline of its glass roof, how high the portal
// over its street end stands, and that portal's colours.
const ARMS = [
  { from: 'Brabantdam', line: [683.3, 497.5, 681.3, 504, 681, 505, 677.8, 515, 666.4, 551.2], inside: [674.5, 527], top: 13.6,
    stone: '#ddd3bd', trim: '#f1ead9' },
  { from: 'Vlaanderenstraat', line: [625.8, 575.4, 627.9, 574.5, 634.9, 571.4, 662.8, 559], inside: [649, 565.5], top: 11.8,
    stone: '#c8b49a', trim: '#ece2cf' },
];
const H = 6.8; // the shop fronts' height (a shop and a mezzanine), where the vault springs
const RIB = 3.2; // the iron ribs' spacing
const PORTAL = 4.4; // the underside of the portal over the way in

const inRing = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};

// where (x, z) is along a line: t how far along, s how far to its right (negative: its left)
function project(line, x, z) {
  let best = { d: Infinity }, run = 0;
  for (let k = 0; k + 3 < line.length; k += 2) {
    const ax = line[k], az = line[k + 1], dx = line[k + 2] - ax, dz = line[k + 3] - az, L = Math.hypot(dx, dz);
    const u = ((x - ax) * dx + (z - az) * dz) / L, c = Math.max(0, Math.min(L, u));
    const d = Math.hypot(x - ax - (dx * c) / L, z - az - (dz * c) / L);
    if (d < best.d) best = { d, t: run + u, s: ((x - ax) * -dz + (z - az) * dx) / L };
    run += L;
  }
  return best;
}

// Each arm's two sides, from the outline of its roof: the corners either side of the footway, in
// order along it. These corners are the ones the houses either side share, so the shop fronts
// stand on the houses' own walls. The few on the footway itself close the outline at its ends.
const GALLERY = ARMS.map(arm => {
  const i = MAP.buildings.findIndex(b => b.k === 'roof' && inRing(...arm.inside, b.p));
  const roof = MAP.buildings[i];
  const sides = [[], []];
  for (let k = 0; k < roof.p.length; k += 2) {
    const q = project(arm.line, roof.p[k], roof.p[k + 1]);
    if (Math.abs(q.s) > 0.9) sides[q.s < 0 ? 0 : 1].push({ x: roof.p[k], z: roof.p[k + 1], t: q.t });
  }
  for (const s of sides) s.sort((a, b) => a.t - b.t);
  return { ...arm, roof: i, sides: sides.map(s => s.filter((v, k) => !k || v.t - s[k - 1].t > 0.25)) };
});

// a side's point at t along its arm
function sideAt(side, t) {
  if (t <= side[0].t) return side[0];
  for (let k = 1; k < side.length; k++) {
    const a = side[k - 1], b = side[k];
    if (t <= b.t) { const f = (t - a.t) / (b.t - a.t); return { x: a.x + (b.x - a.x) * f, z: a.z + (b.z - a.z) * f }; }
  }
  return side.at(-1);
}

// The map's roofs over the arms give way, and so do the made-up shop fronts of the houses either
// side that face into the gallery: its own shop fronts stand there instead.
const near = (x, z) => GALLERY.some(g => { const q = project(g.line, x, z); return q.d < 4.5 && q.t > 3; });
export function withGlazenStraatje(buildings) {
  return buildings.map((b, i) => {
    if (GALLERY.some(g => g.roof === i)) return { ...b, gone: true };
    if (b.fe == null || b.gone) return b;
    const n = b.p.length / 2, k = b.fe, mx = (b.p[k * 2] + b.p[((k + 1) % n) * 2]) / 2, mz = (b.p[k * 2 + 1] + b.p[((k + 1) % n) * 2 + 1]) / 2;
    return near(mx, mz) ? { ...b, fe: undefined, shop: undefined } : b;
  });
}
export const GALLERY_WIDTH = 4.6; // the footway between the shop fronts, wider than the map's 3.1

// --- the drawings --------------------------------------------------------------------------------

const BAY = 28.8, UNIT = 3.6, PX = 48;
// A unit's light: its neon tube and the glow of the room behind (most red or pink, now and then
// violet or blue), and whether its curtain is drawn.
const LIGHTS = [
  { tube: '#ff4d7e', room: '#e0204f', far: '#5c0a20' },
  { tube: '#ff78b4', room: '#e2408a', far: '#5a0c35' },
  { tube: '#ff3b3b', room: '#d3172a', far: '#4d0610' },
  { tube: '#c47cff', room: '#8a33d6', far: '#2b0c4a' },
  { tube: '#5fb2ff', room: '#2f6fd6', far: '#0d2147' },
];
const UNITS = [0, 1, 2, 0, 3, 0, 1, 2].map((l, k) => ({ light: LIGHTS[l], closed: k === 5 || k === 2, door: k % 2 }));

// The gallery's shop fronts, eight units a bay, in the painted plaster and fluted pilasters of the
// 1850s: a big window with its door beside it, a mezzanine window over it, a cornice under the vault.
// paint() draws the wall as it is by day, glow() what lights itself up (on black).
function shopFronts(g, w, h, seed, glow) {
  const r = rng(seed), L = -w / 2;
  if (!glow) {
    g.fillStyle = '#e2d6bc'; g.fillRect(L, 0, w, h);
    for (let i = 0; i < 260; i++) { g.fillStyle = r() < 0.5 ? '#d5c7aa' : '#ece2cc'; g.globalAlpha = 0.35; g.fillRect(L + r() * w, r() * h, 0.05 + r() * 0.5, 0.05 + r() * 0.3); }
    g.globalAlpha = 1;
    g.fillStyle = '#8c867a'; g.fillRect(L, 0, w, 0.42); // the plinth
    g.fillStyle = '#cfc2a5'; g.fillRect(L, 3.15, w, 0.42); g.fillStyle = '#efe6d2'; g.fillRect(L, 3.5, w, 0.1); // the fascia
    g.fillStyle = '#d3c6a8'; g.fillRect(L, h - 0.75, w, 0.75); g.fillStyle = '#f2ead8'; g.fillRect(L, h - 0.2, w, 0.2); // the cornice
    g.fillStyle = '#b9ac90';
    for (let x = L + 0.1; x < w / 2; x += 0.3) g.fillRect(x, h - 0.45, 0.14, 0.16); // its dentils
  } else { g.fillStyle = '#000'; g.fillRect(L, 0, w, h); }
  for (let k = 0; k < w / UNIT; k++) {
    const u = UNITS[(k + seed) % UNITS.length], c = L + (k + 0.5) * UNIT, flip = u.door ? 1 : -1;
    const wx0 = c - 1.4 * flip, wx1 = c + 0.5 * flip, x0 = Math.min(wx0, wx1), ww = Math.abs(wx1 - wx0), dx = c + 1.05 * flip;
    if (!glow) {
      // a fluted pilaster between the units
      const px = L + k * UNIT;
      g.fillStyle = '#efe7d4'; g.fillRect(px - 0.24, 0.42, 0.48, h - 1.15);
      g.fillStyle = '#cbbd9f'; for (let f = -0.15; f < 0.2; f += 0.1) g.fillRect(px + f, 0.9, 0.03, h - 2.3);
      g.fillStyle = '#f6efdf'; g.fillRect(px - 0.32, h - 1.05, 0.64, 0.3);
      // the window: a dark wooden frame, the red room behind, curtains at its sides
      g.fillStyle = '#2b201d'; g.fillRect(x0 - 0.1, 0.5, ww + 0.2, 2.5);
      g.fillStyle = u.light.far; g.fillRect(x0, 0.58, ww, 2.34);
      g.fillStyle = shade(u.light.far, 0.25);
      if (u.closed) g.fillRect(x0, 0.58, ww, 2.34);
      else { g.fillRect(x0, 0.58, 0.32, 2.34); g.fillRect(x0 + ww - 0.32, 0.58, 0.32, 2.34); }
      g.fillStyle = '#2b201d'; g.fillRect(x0 - 0.1, 1.05, ww + 0.2, 0.05); // the transom bar
      // the door, its fanlight, and the bell beside it
      g.fillStyle = '#3a2a22'; g.fillRect(dx - 0.42, 0.05, 0.84, 2.55);
      g.fillStyle = '#25303a'; g.fillRect(dx - 0.32, 2.1, 0.64, 0.38);
      g.fillStyle = '#4a3a30'; for (const y of [0.35, 1.2]) g.fillRect(dx - 0.3, y, 0.6, 0.7);
      g.fillStyle = '#c9b77f'; g.fillRect(dx + 0.25 * flip - 0.03, 1.15, 0.06, 0.06);
      // the mezzanine's window, round-headed, under the cornice
      g.fillStyle = '#efe6d2'; g.beginPath(); g.moveTo(c - 0.62, 3.95); g.lineTo(c - 0.62, 5.25); g.arc(c, 5.25, 0.62, Math.PI, 0, true); g.lineTo(c + 0.62, 3.95); g.fill();
      g.fillStyle = '#29303a'; g.beginPath(); g.moveTo(c - 0.48, 4.05); g.lineTo(c - 0.48, 5.25); g.arc(c, 5.25, 0.48, Math.PI, 0, true); g.lineTo(c + 0.48, 4.05); g.fill();
      g.fillStyle = '#d6cbb3'; g.fillRect(c - 0.03, 4.05, 0.06, 1.65); g.fillRect(c - 0.48, 4.95, 0.96, 0.05);
    } else {
      // the room's glow, brightest in the middle, and the neon tube round the window
      const glowing = g.createRadialGradient(x0 + ww / 2, 1.6, 0.1, x0 + ww / 2, 1.6, 1.9);
      glowing.addColorStop(0, shade(u.light.room, u.closed ? -0.45 : 0.2)); glowing.addColorStop(1, shade(u.light.room, u.closed ? -0.75 : -0.35));
      g.fillStyle = glowing; g.fillRect(x0, 0.58, ww, 2.34);
      if (!u.closed) { g.fillStyle = shade(u.light.room, -0.55); g.fillRect(x0, 0.58, 0.32, 2.34); g.fillRect(x0 + ww - 0.32, 0.58, 0.32, 2.34); }
      g.strokeStyle = u.light.tube; g.lineWidth = 0.07; g.strokeRect(x0 - 0.2, 0.42, ww + 0.4, 2.68);
      g.globalAlpha = 0.35; g.lineWidth = 0.2; g.strokeRect(x0 - 0.2, 0.42, ww + 0.4, 2.68); g.globalAlpha = 1;
      g.fillStyle = '#000'; g.fillRect(x0 - 0.1, 1.05, ww + 0.2, 0.05);
      // a faint light in the door's fanlight, and in a mezzanine window now and then
      g.fillStyle = '#4a2a20'; g.fillRect(dx - 0.32, 2.1, 0.64, 0.38);
      if (r() < 0.4) { g.fillStyle = '#5e3a1c'; g.beginPath(); g.moveTo(c - 0.48, 4.05); g.lineTo(c - 0.48, 5.25); g.arc(c, 5.25, 0.48, Math.PI, 0, true); g.lineTo(c + 0.48, 4.05); g.fill(); }
    }
  }
}

// a texture drawn with draw(g, w, h), and drawn again should the GPU lose it
function canvasTexture(w, h, px, draw) {
  const t = elevation(w, h, px, draw);
  letGo(t, () => {
    const c = t.image; c.width = Math.ceil(w * px); c.height = Math.ceil(h * px);
    const g = c.getContext('2d'); g.setTransform(px, 0, 0, -px, (w / 2) * px, h * px); draw(g, w, h);
  });
  return t;
}

// a wall that lights itself up: its paint, and its glow on black
function litMaterial(w, h, px, draw, wrap = true) {
  const [map, emissiveMap] = [false, true].map(glow => {
    const t = canvasTexture(w, h, px, (g, ww, hh) => draw(g, ww, hh, glow));
    if (wrap) t.wrapS = THREE.RepeatWrapping;
    return t;
  });
  return new THREE.MeshStandardMaterial({ map, emissiveMap, emissive: 0xffffff, emissiveIntensity: 1, roughness: 0.85 });
}

// The portal over an arm's street end, the bridge of the house between its neighbours: its front
// to the street with a fanlight over the way in, a tall window over that, a cornice at the top.
function portalFront(g, w, h, glow, { stone, trim }) {
  if (glow) {
    g.fillStyle = '#000'; g.fillRect(-w / 2, 0, w, h);
    g.fillStyle = '#5a3a20'; g.fillRect(-0.7, 3.6, 1.4, 2.6); // a light behind the tall window
    return;
  }
  g.fillStyle = stone; g.fillRect(-w / 2, 0, w, h);
  g.fillStyle = shade(stone, -0.12);
  for (let y = 0.55; y < h - 1; y += 0.55) g.fillRect(-w / 2, y, w, 0.03); // the courses of the rustication
  // the fanlight: a half-round of glass in iron spokes, over the way in
  const r = Math.min(w / 2 - 0.25, 1.9);
  g.fillStyle = shade(trim, -0.15); g.beginPath(); g.arc(0, 0, r + 0.28, 0, Math.PI); g.fill();
  g.fillStyle = '#26303a'; g.beginPath(); g.arc(0, 0, r, 0, Math.PI); g.fill();
  g.strokeStyle = '#1b1d1f'; g.lineWidth = 0.06; g.beginPath();
  for (let k = 1; k < 8; k++) { const a = (k / 8) * Math.PI; g.moveTo(0, 0); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  g.stroke(); g.beginPath(); g.arc(0, 0, r * 0.4, 0, Math.PI); g.stroke();
  g.fillStyle = trim; g.fillRect(-0.32, r, 0.64, 0.36); // the keystone
  // the tall window, on a little balustrade, under a pediment
  g.fillStyle = trim; g.fillRect(-0.95, 3.1, 1.9, 0.18); g.fillRect(-0.85, 3.3, 1.7, 3.2);
  g.fillStyle = '#29303a'; g.fillRect(-0.7, 3.45, 1.4, 2.9);
  g.fillStyle = trim; g.fillRect(-0.04, 3.45, 0.08, 2.9); g.fillRect(-0.7, 5.3, 1.4, 0.07);
  g.beginPath(); g.moveTo(-1.1, 6.6); g.lineTo(0, 7.25); g.lineTo(1.1, 6.6); g.fill();
  for (let x = -0.75; x <= 0.75; x += 0.3) g.fillRect(x - 0.05, 2.55, 0.1, 0.55);
  g.fillRect(-0.9, 2.5, 1.8, 0.08);
  // the cornice
  g.fillStyle = shade(stone, -0.18); g.fillRect(-w / 2, h - 1.1, w, 0.4);
  g.fillStyle = trim; g.fillRect(-w / 2, h - 0.7, w, 0.7);
}

// --- the model -----------------------------------------------------------------------------------

// quads with their texture coordinates, built up and then made one mesh
class Quads {
  constructor() { this.pos = []; this.uv = []; }
  // the four corners in order round the quad; faces the side they go round anticlockwise
  add(a, b, c, d, ua = [0, 0], ub = [1, 0], uc = [1, 1], ud = [0, 1]) {
    for (const [p, u] of [[a, ua], [b, ub], [c, uc], [a, ua], [c, uc], [d, ud]]) { this.pos.push(...p); this.uv.push(...u); }
    return this;
  }
  mesh(material) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, material);
    m.receiveShadow = true;
    return m;
  }
}

// an upright quad on the line a -> b ([x, z]), from y0 to y1, facing (nx, nz); u from u0 to u1
function upright(q, a, b, y0, y1, n, u0, u1, v0 = 0, v1 = 1) {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  if (-dz * n[0] + dx * n[1] < 0) [a, b, u0, u1] = [b, a, u1, u0];
  q.add([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], [u0, v0], [u1, v0], [u1, v1], [u0, v1]);
}

function gallery() {
  const group = new THREE.Group();
  const fronts = litMaterial(BAY, H, PX, (g, w, h, glow) => shopFronts(g, w, h, 0, glow));
  const glass = new THREE.MeshStandardMaterial({ color: 0xd9ecef, transparent: true, opacity: 0.22, roughness: 0.08, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false });
  const lamp = new THREE.MeshStandardMaterial({ color: 0xffe2c8, emissive: 0xffb07a, emissiveIntensity: 0.9 });
  const IRON = '#28322f', iron = new Kit(), walls = new Quads(), panes = new Quads(), lamps = new Kit();
  const at = (x, z) => [x - X, z - Z];
  for (const arm of GALLERY) {
    const [left, right] = arm.sides, end = Math.min(left.at(-1).t, right.at(-1).t);
    // the shop fronts, a few centimetres off the houses' walls, facing into the gallery
    for (const side of arm.sides) {
      let run = 0;
      for (let k = 1; k < side.length; k++) {
        const a = side[k - 1], b = side[k], L = Math.hypot(b.x - a.x, b.z - a.z);
        const mid = sideAt(side === left ? right : left, (a.t + b.t) / 2), nx0 = mid.x - (a.x + b.x) / 2, nz0 = mid.z - (a.z + b.z) / 2;
        const nl = Math.hypot(nx0, nz0), n = [nx0 / nl, nz0 / nl], o = 0.03;
        upright(walls, at(a.x + n[0] * o, a.z + n[1] * o), at(b.x + n[0] * o, b.z + n[1] * o), 0, H, n, run / BAY, (run + L) / BAY);
        // the wall plate the ribs stand on
        iron.rod([a.x - X + n[0] * 0.15, H, a.z - Z + n[1] * 0.15], [b.x - X + n[0] * 0.15, H, b.z - Z + n[1] * 0.15], 0.11, IRON, 4);
        run += L;
      }
    }
    // the barrel vault: an iron rib every few metres, purlins between them, glass over it all
    const ribs = [], N = 10, t0 = Math.max(left[0].t, right[0].t) + 0.2;
    const count = Math.max(1, Math.round((end - t0) / RIB));
    for (let i = 0; i <= count; i++) {
      const t = t0 + ((end - t0) * i) / count, l = sideAt(left, t), r = sideAt(right, t);
      const mx = (l.x + r.x) / 2, mz = (l.z + r.z) / 2, half = Math.hypot(r.x - l.x, r.z - l.z) / 2;
      ribs.push(Array.from({ length: N + 1 }, (_, j) => {
        const a = (Math.PI * j) / N, c = Math.cos(a);
        return [mx + (l.x - mx) * c - X, H + half * 0.9 * Math.sin(a), mz + (l.z - mz) * c - Z];
      }));
      // a lamp hangs from every other rib
      if (i % 2 && i < count) {
        lamps.rod([mx - X, H + half * 0.9, mz - Z], [mx - X, H - 0.6, mz - Z], 0.02, IRON, 4);
        lamps.add(new THREE.SphereGeometry(0.22, 10, 8), '#ffffff', mx - X, H - 0.8, mz - Z);
      }
    }
    for (let i = 0; i < ribs.length; i++) {
      const rib = ribs[i];
      for (let j = 0; j < N; j++) {
        iron.rod(rib[j], rib[j + 1], 0.07, IRON, 4);
        if (i + 1 < ribs.length) {
          const next = ribs[i + 1];
          panes.add(rib[j], next[j], next[j + 1], rib[j + 1]);
          if (j) iron.rod(rib[j], next[j], 0.035, IRON, 4);
        }
      }
    }
    // the portal over the way in: the floors of the house over it, on its own street
    const a = left[0], b = right[0], dir = [arm.line[2] - arm.line[0], arm.line[3] - arm.line[1]], dl = Math.hypot(...dir);
    const inward = [dir[0] / dl, dir[1] / dl], deep = 1.4, w = Math.hypot(b.x - a.x, b.z - a.z), out = [-inward[0], -inward[1]];
    const front = litMaterial(w, arm.top - PORTAL, 40, (g, ww, hh, glow) => portalFront(g, ww, hh, glow, arm), false);
    const shape = new THREE.Shape([[a.x, a.z], [b.x, b.z], [b.x + inward[0] * deep, b.z + inward[1] * deep], [a.x + inward[0] * deep, a.z + inward[1] * deep]]
      .map(([x, z]) => new THREE.Vector2(x - X, -(z - Z))));
    const body = new THREE.ExtrudeGeometry(shape, { depth: arm.top - PORTAL, bevelEnabled: false });
    body.rotateX(-Math.PI / 2); body.translate(0, PORTAL, 0);
    const block = new THREE.Mesh(body, new THREE.MeshStandardMaterial({ color: arm.stone, roughness: 0.95 }));
    block.castShadow = block.receiveShadow = true; group.add(block);
    const face = new Quads();
    upright(face, at(a.x + out[0] * 0.02, a.z + out[1] * 0.02), at(b.x + out[0] * 0.02, b.z + out[1] * 0.02), PORTAL, arm.top, out, 0, 1);
    // drawn left to right as seen from the street
    if ((b.x - a.x) * out[1] - (b.z - a.z) * out[0] < 0) face.uv = face.uv.map((v, k) => (k % 2 ? v : 1 - v));
    group.add(face.mesh(front));
    // its colossal pilasters, either side of the way in, and the entablature they carry
    const deco = new Kit(), across = [(b.x - a.x) / w, (b.z - a.z) / w], turn = Math.atan2(-across[1], across[0]);
    for (const [p, s] of [[a, -1], [b, 1]]) {
      const cx = p.x + across[0] * s * 0.35 + out[0] * 0.15 - X, cz = p.z + across[1] * s * 0.35 + out[1] * 0.15 - Z;
      deco.box(0.8, arm.top - 1.4, 0.3, arm.trim, cx, (arm.top - 1.4) / 2, cz, 0, turn);
      deco.box(1.0, 0.5, 0.42, shade(arm.trim, -0.1), cx, 0.25, cz, 0, turn);
      deco.box(1.0, 0.45, 0.42, arm.trim, cx, arm.top - 1.6, cz, 0, turn);
      for (const f of [-0.24, 0, 0.24]) deco.box(0.07, arm.top - 3, 0.04, shade(arm.trim, -0.2), cx + across[0] * f + out[0] * 0.16, (arm.top - 1.4) / 2, cz + across[1] * f + out[1] * 0.16, 0, turn);
    }
    const mx = (a.x + b.x) / 2 + out[0] * 0.25 - X, mz = (a.z + b.z) / 2 + out[1] * 0.25 - Z;
    deco.box(w + 2.6, 0.6, 0.5, arm.trim, mx, arm.top - 1.1, mz, 0, turn);
    deco.box(w + 3, 0.25, 0.7, shade(arm.trim, 0.05), mx, arm.top - 0.68, mz, 0, turn);
    group.add(deco.mesh(kitMat(0.9)));
  }
  const ironwork = iron.mesh(kitMat(0.6, 0.4)); ironwork.receiveShadow = false; group.add(ironwork);
  group.add(walls.mesh(fronts));
  const roof = panes.mesh(glass); roof.receiveShadow = false; roof.renderOrder = 1; group.add(roof);
  const lit = lamps.mesh(lamp); lit.castShadow = false; group.add(lit);
  return group;
}

// --- the windows round about ---------------------------------------------------------------------

// The streets round the gallery where the houses have windows on their ground floor, each how much
// of them (by the city's count in 2015: some forty, in the Schepenenvijverstraat, the
// Belgradostraat, the doorgang and on the corner of the Belgradostraat and the Brabantdam). The
// Belgradostraat only towards that corner.
const STREETS = [
  { name: GALLERY_NAME, share: 1 },
  { name: 'Schepenenvijverstraat', share: 0.75 },
  { name: 'Belgradostraat', share: 0.65, within: [[600, 472], 130] },
];

// one window's front: its neon tube, the room behind, curtains either side
function vitrine(g, w, h, glow, light) {
  if (!glow) {
    g.fillStyle = '#2b201d'; g.fillRect(-w / 2, 0, w, h);
    g.fillStyle = light.far; g.fillRect(-w / 2 + 0.12, 0.12, w - 0.24, h - 0.24);
    g.fillStyle = shade(light.far, 0.25); g.fillRect(-w / 2 + 0.12, 0.12, 0.35, h - 0.24); g.fillRect(w / 2 - 0.47, 0.12, 0.35, h - 0.24);
    return;
  }
  g.fillStyle = '#000'; g.fillRect(-w / 2, 0, w, h);
  const glowing = g.createRadialGradient(0, h / 2, 0.1, 0, h / 2, h * 0.75);
  glowing.addColorStop(0, shade(light.room, 0.2)); glowing.addColorStop(1, shade(light.room, -0.4));
  g.fillStyle = glowing; g.fillRect(-w / 2 + 0.12, 0.12, w - 0.24, h - 0.24);
  g.fillStyle = shade(light.room, -0.55); g.fillRect(-w / 2 + 0.12, 0.12, 0.35, h - 0.24); g.fillRect(w / 2 - 0.47, 0.12, 0.35, h - 0.24);
  g.strokeStyle = light.tube; g.lineWidth = 0.07; g.strokeRect(-w / 2 + 0.05, 0.05, w - 0.1, h - 0.1);
}

const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// Each street's windows: on each house there without a real shop, along its street front (the
// edge the map has as its front), one to three of them across it, on the ground floor.
const WINDOWS = STREETS.map(street => {
  const st = MAP.names.indexOf(street.name), list = [];
  MAP.buildings.forEach((b, i) => {
    if (b.st !== st || b.fe == null || b.shop || b.k === 'roof' || b.k === 'shed' || hash(i) > street.share) return;
    const n = b.p.length / 2, k = b.fe, ax = b.p[k * 2], az = b.p[k * 2 + 1], bx = b.p[((k + 1) % n) * 2], bz = b.p[((k + 1) % n) * 2 + 1];
    const L = Math.hypot(bx - ax, bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (L < 3 || near(mx, mz)) return;
    if (street.within && Math.hypot(mx - street.within[0][0], mz - street.within[0][1]) > street.within[1]) return;
    // outwards: away from the inside of the house
    let nx = -(bz - az) / L, nz = (bx - ax) / L;
    if (inRing(mx + nx * 0.3, mz + nz * 0.3, b.p)) [nx, nz] = [-nx, -nz];
    const count = Math.min(3, Math.max(1, Math.floor((L - 1.2) / 2.8)));
    for (let j = 0; j < count; j++) {
      const f = (j + 0.5) / count, w = Math.min(2.2, L / count - 0.9);
      list.push({ x: ax + (bx - ax) * f + nx * 0.05, z: az + (bz - az) * f + nz * 0.05, dx: (bx - ax) / L, dz: (bz - az) / L, nx, nz, w, light: Math.floor(hash(i * 7 + j) * 3) });
    }
  });
  const xs = list.map(v => v.x), zs = list.map(v => v.z);
  const x = (Math.min(...xs) + Math.max(...xs)) / 2, z = (Math.min(...zs) + Math.max(...zs)) / 2;
  const reach = Math.max(...list.map(v => Math.hypot(v.x - x, v.z - z))) + 40;
  return { name: street.name, list, x, z, reach };
}).filter(s => s.list.length);

function windows(street) {
  const group = new THREE.Group(), quads = [0, 1, 2].map(() => new Quads());
  for (const v of street.list) {
    const a = [v.x - v.dx * v.w / 2 - street.x, v.z - v.dz * v.w / 2 - street.z], b = [v.x + v.dx * v.w / 2 - street.x, v.z + v.dz * v.w / 2 - street.z];
    // drawn left to right as seen from the street
    const flip = v.dx * v.nz - v.dz * v.nx < 0;
    upright(quads[v.light], a, b, 0.45, 2.75, [v.nx, v.nz], flip ? 1 : 0, flip ? 0 : 1);
  }
  quads.forEach((q, k) => {
    if (!q.pos.length) return;
    group.add(q.mesh(litMaterial(2.2, 2.3, 64, (g, w, h, glow) => vitrine(g, w, h, glow, LIGHTS[k]), false)));
  });
  return group;
}

export const GLAZEN_STRAATJE = [
  { id: 'glazen-straatje', name: 'Glazen Straatje', x: X, z: Z, turn: 0, size: 0.1, foot: [], reach: 90, make: gallery },
  ...WINDOWS.map(s => ({ id: `ramen-${s.name.toLowerCase().replace(/\W+/g, '-')}`, x: s.x, z: s.z, turn: 0, size: 0.1, foot: [], reach: s.reach, make: () => windows(s) })),
];
