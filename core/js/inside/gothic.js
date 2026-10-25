// What the churches and halls inside are built from (ghent/inside/baafs.js, niklaas.js and every
// city's rooms, js/interiors.js): masonry that wraps
// round any shape, pointed arches, wall panels with arched holes for the arcades and the windows,
// rib vaults, stained glass, and a cruciform church put together from a plan.
//
// Everything is in game metres (1.25 per real metre), x across the church and +z towards the altar,
// from the middle of the crossing; js/interiors.js puts it where it stands, out of the city's sight.
import * as THREE from 'three';
import { Kit } from '../kit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ------------------------------------------------------------------ textures and materials

function canvasTexture(size, draw, repeat = true) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(c);
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.userData.shared = true; // the tiles let go of a texture when what uses it goes, unless it is shared (js/tiles.js)
  return tex;
}
const rngOf = seed => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const TEXTURES = {};
// light ashlar in courses of blocks, each a shade of its own, the joints darker
const ashlar = () => (TEXTURES.ashlar ??= canvasTexture(256, (g, s) => {
  const rnd = rngOf(7);
  g.fillStyle = '#9a948a';
  g.fillRect(0, 0, s, s);
  const rows = 8, h = s / rows;
  for (let row = 0; row < rows; row++) {
    let x = row % 2 ? -h * 0.9 : 0;
    while (x < s) {
      const w = h * (1.6 + rnd() * 1.4), v = 214 + Math.floor(rnd() * 34);
      g.fillStyle = `rgb(${v}, ${v - 3}, ${v - 9})`;
      g.fillRect(x + 1.5, row * h + 1.5, w - 3, h - 3);
      x += w;
    }
  }
}));
// plaster for the vaults and the walls above the arcades: nearly flat, a little mottled
const plaster = () => (TEXTURES.plaster ??= canvasTexture(128, (g, s) => {
  const rnd = rngOf(3);
  g.fillStyle = '#f3f0ea';
  g.fillRect(0, 0, s, s);
  for (let k = 0; k < 400; k++) {
    const v = 226 + Math.floor(rnd() * 26);
    g.fillStyle = `rgba(${v}, ${v - 2}, ${v - 8}, 0.5)`;
    g.fillRect(rnd() * s, rnd() * s, 2 + rnd() * 10, 2 + rnd() * 6);
  }
}));
// oak boards, for the doors and the stalls
const oak = () => (TEXTURES.oak ??= canvasTexture(128, (g, s) => {
  const rnd = rngOf(11);
  for (let x = 0; x < s; x += 16) {
    g.fillStyle = x % 32 ? '#8a5a30' : '#7c4f29';
    g.fillRect(x, 0, 16, s);
    g.fillStyle = 'rgba(40,20,5,0.35)';
    g.fillRect(x, 0, 1.5, s);
    for (let k = 0; k < 6; k++) g.fillRect(x + 2 + rnd() * 12, rnd() * s, 1, 10 + rnd() * 30);
  }
}));
export const textures = { ashlar, plaster, oak };

// A masonry material: its texture laid on each face by the way it faces, in true metres (one repeat
// every `tile` metres), so a wall, a column and a rib all show the same blocks, whatever their UVs.
// vertexColors tint it, which is how a church gets its stone: warm cream, or Doornik's blue-grey.
const MASONRY = {};
export function masonry(kind = 'ashlar', tile = 3) {
  const key = `${kind}:${tile}`;
  if (MASONRY[key]) return MASONRY[key];
  const map = textures[kind]();
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true, side: THREE.DoubleSide });
  m.onBeforeCompile = sh => {
    sh.uniforms.uMap = { value: map };
    sh.uniforms.uScale = { value: 1 / tile };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWp;\nvarying vec3 vWn;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWn = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uMap;\nuniform float uScale;\nvarying vec3 vWp;\nvarying vec3 vWn;')
      .replace('#include <map_fragment>', `
        vec3 an = abs(vWn);
        an /= (an.x + an.y + an.z + 1e-5);
        diffuseColor *= texture2D(uMap, vWp.zy * uScale) * an.x + texture2D(uMap, vWp.xz * uScale) * an.y + texture2D(uMap, vWp.xy * uScale) * an.z;`);
  };
  m.customProgramCacheKey = () => `masonry-${kind}`;
  return (MASONRY[key] = m);
}

// plain vertex-coloured finishes for everything that is not stone
let DAYLIGHT = null;
const FINISH = {};
export const finish = (rough = 0.8, metal = 0, emissive = 0) => (FINISH[`${rough}:${metal}:${emissive}`] ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, metalness: metal, flatShading: true, emissive: new THREE.Color(emissive), side: THREE.DoubleSide }));
// like it, wrapped in oak boards (doors)
export const oakMat = () => (FINISH.oak ??= new THREE.MeshStandardMaterial({ map: oak(), roughness: 0.8, flatShading: true }));

// a floor of squares laid on the diagonal (as in the cathedral) or straight, in two colours, one repeat every 2 squares
const FLOORS = {};
export function floorMat(a, b, diagonal = true, square = 1.6) {
  const key = `${a}:${b}:${diagonal}:${square}`;
  if (FLOORS[key]) return FLOORS[key];
  const map = canvasTexture(128, (g, s) => {
    g.fillStyle = a; g.fillRect(0, 0, s, s);
    g.fillStyle = b; g.fillRect(0, 0, s / 2, s / 2); g.fillRect(s / 2, s / 2, s / 2, s / 2);
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1.5;
    g.strokeRect(0, 0, s / 2, s / 2); g.strokeRect(s / 2, s / 2, s / 2, s / 2); g.strokeRect(s / 2, 0, s / 2, s / 2); g.strokeRect(0, s / 2, s / 2, s / 2);
  });
  map.userData.diagonal = diagonal;
  const m = new THREE.MeshStandardMaterial({ map, roughness: 0.95, metalness: 0 });
  m.userData = { square, diagonal };
  return (FLOORS[key] = m);
}

// ------------------------------------------------------------------ stained glass

const JEWELS = ['#1f3f9c', '#2a56b8', '#a3202c', '#c23a3a', '#d8a52c', '#e5c15a', '#2f7a45', '#5c2f86', '#dfe8f0', '#e8dccb', '#2b7f9a'];
// a lancet of leaded glass: jewel-coloured quarries in a lattice, a pale figure up the middle,
// the tracery's circles at the top, all outlined in lead. variant: which colours lead
function glassTexture(variant) {
  if (variant >= 5) return leadedClear(variant);
  return canvasTexture(256, (g, s) => {
    const rnd = rngOf(40 + variant * 13);
    const lead = '#1a1714';
    const dom = [[0, 1, 2, 4], [2, 3, 4, 5], [1, 6, 4, 8], [7, 0, 5, 9], [10, 1, 8, 4]][variant % 5];
    const pick = () => JEWELS[rnd() < 0.7 ? dom[Math.floor(rnd() * dom.length)] : Math.floor(rnd() * JEWELS.length)];
    g.fillStyle = lead;
    g.fillRect(0, 0, s, s);
    const cols = 6, rows = 12, w = s / cols, h = s / rows;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        g.fillStyle = pick();
        g.beginPath();
        g.moveTo(i * w + w / 2, j * h + 2); g.lineTo((i + 1) * w - 2, j * h + h / 2); g.lineTo(i * w + w / 2, (j + 1) * h - 2); g.lineTo(i * w + 2, j * h + h / 2);
        g.closePath(); g.fill();
      }
    }
    // a figure: a robed shape with a halo, lighter, in the middle
    g.fillStyle = 'rgba(245,235,205,0.85)';
    g.beginPath(); g.ellipse(s / 2, s * 0.38, s * 0.07, s * 0.07, 0, 0, 7); g.fill();
    g.fillStyle = ['rgba(163,32,44,0.9)', 'rgba(31,63,156,0.9)', 'rgba(47,122,69,0.9)'][variant % 3];
    g.beginPath(); g.moveTo(s * 0.42, s * 0.46); g.lineTo(s * 0.58, s * 0.46); g.lineTo(s * 0.66, s * 0.9); g.lineTo(s * 0.34, s * 0.9); g.closePath(); g.fill();
    g.strokeStyle = lead; g.lineWidth = 5;
    g.strokeRect(0, 0, s, s);
    // the mullion between the two lights, and the tracery at the top
    g.beginPath(); g.moveTo(s / 2, s * 0.28); g.lineTo(s / 2, s); g.stroke();
    g.beginPath(); g.arc(s / 2, s * 0.14, s * 0.1, 0, 7); g.stroke();
    g.fillStyle = 'rgba(255,230,160,0.8)'; g.beginPath(); g.arc(s / 2, s * 0.14, s * 0.07, 0, 7); g.fill();
  }, false);
}
// clear glass in lead: pale diamonds with a faint tint, bright with the day behind (the Stadhuis's windows)
function leadedClear(variant) {
  return canvasTexture(256, (g, s) => {
    const rnd = rngOf(90 + variant);
    g.fillStyle = '#3a342c';
    g.fillRect(0, 0, s, s);
    const n = variant === 5 ? 8 : 6;
    for (let j = -1; j < n * 2; j++) for (let i = -1; i < n; i++) {
      const cx = (i + (j % 2 ? 0.5 : 0)) * (s / n) + s / n / 2, cy = (j * s) / n / 1.2 / 2 * 1.2 + 8, w = s / n / 2 - 2, h = s / n * 0.58;
      const t = 232 + rnd() * 22;
      g.fillStyle = `rgb(${t}, ${t + 4 - rnd() * 8}, ${t - 12 + rnd() * 10})`;
      g.beginPath(); g.moveTo(cx, cy - h); g.lineTo(cx + w, cy); g.lineTo(cx, cy + h); g.lineTo(cx - w, cy); g.closePath(); g.fill();
    }
  }, false);
}
const GLASS = [];
export const glassMat = i => (GLASS[i % 7] ??= new THREE.MeshBasicMaterial({ map: glassTexture(i % 7), side: THREE.DoubleSide, color: 0xf0e6d8 }));

// ------------------------------------------------------------------ arches

// the height of a pointed arch, 1 at its crown and 0 at its feet, across s from -1 to 1: two arcs
// centred c beyond the opposite feet (0 would be a round arch, 1 the equilateral)
export function pointed(s, c = 0.9) {
  const a = Math.abs(s);
  if (a >= 1) return 0;
  const R = 1 + c;
  return Math.sqrt(R * R - (a + c) ** 2) / Math.sqrt(R * R - c * c);
}

// the outline of an opening from u0 to u1: up from y0 to the springing line and over the arch
export function archOutline(u0, u1, y0, ySpring, rise, n = 8, c = 0.9) {
  const pts = [[u0, y0], [u1, y0], [u1, ySpring]];
  for (let i = n - 1; i >= 1; i--) {
    const s = -1 + (2 * i) / n;
    pts.push([u0 + ((s + 1) / 2) * (u1 - u0), ySpring + rise * pointed(s, c)]);
  }
  pts.push([u0, ySpring]);
  return pts;
}

// ------------------------------------------------------------------ a church's parts

// The pieces of a building: stone (masonry, tinted), plaster (the vaults), glass panes by variant,
// the doors, and the rings the riders bump into. Building parts are added to it, then mesh() makes
// the group.
export class Parts {
  constructor(tint) {
    this.tint = tint;
    this.stone = new Kit();
    this.plaster = new Kit();
    this.gold = new Kit();
    this.wood = new Kit();
    this.marble = new Kit();
    this.glow = new Kit(); // candle flames and lamps: lit from within
    this.daylight = new Kit(); // skylights: the day outside, as bright as its colour, unlit
    this.dark = new Kit(); // black marble, bronze, iron
    this.leaves = []; // doors: geometries in oak
    this.pictures = []; // hung pictures: { tex, w, h, x, y, z, ry, bright }
    this.glass = []; // the glass of the cases: boxes { w, h, d, x, y, z }
    this.panes = {};
    this.foot = [];
    this.floors = [];
  }

  // a wall panel on the line a→b (x, z each): its foot at y0, its top a pointed arch over the whole
  // span (springing ySpring, rise), holes: outlines in [u along it, y]; panes: the glass in some
  // of the holes, [hole index, variant]; solid: whether riders bump into it
  panel(a, b, { y0 = 0, ySpring, rise, t = 1.6, holes = [], panes = [], kit = this.stone, color = this.tint.stone, solid = true, c = 0.9 }) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    const shape = new THREE.Shape();
    shape.moveTo(0, y0);
    shape.lineTo(L, y0);
    shape.lineTo(L, ySpring);
    const n = Math.max(8, Math.round(L));
    for (let i = n - 1; i >= 1; i--) {
      const s = -1 + (2 * i) / n;
      shape.lineTo(((s + 1) / 2) * L, ySpring + rise * pointed(s, c));
    }
    shape.lineTo(0, ySpring);
    shape.closePath();
    for (const h of holes) shape.holes.push(new THREE.Path(h.map(([u, y]) => new THREE.Vector2(u, y))));
    const put = g => { g.translate(0, 0, -t / 2); g.rotateY(ang); g.translate(a[0], 0, a[1]); return g; };
    kit.add(put(new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false })), color);
    for (const [hole, variant] of panes) {
      const pts = holes[hole].map(([u, y]) => new THREE.Vector2(u, y));
      const g = new THREE.ShapeGeometry(new THREE.Shape(pts));
      const box = new THREE.Box3().setFromPoints(pts.map(p => new THREE.Vector3(p.x, p.y, 0)));
      const uv = g.attributes.uv, pos = g.attributes.position;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, (pos.getX(k) - box.min.x) / (box.max.x - box.min.x), (pos.getY(k) - box.min.y) / (box.max.y - box.min.y));
      (this.panes[variant % 7] ??= []).push(put(g));
    }
    if (solid) this.wallRing(a, b, t);
    return this;
  }

  // a flat-topped wall on the line a→b from y0 to y1 (a room's wall), with holes [u, y] outlines in it and panes in some
  rectWall(a, b, { y0 = 0, y1, t = 0.9, holes = [], panes = [], kit = this.plaster, color = this.tint.wall, solid = true }) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    const shape = new THREE.Shape();
    shape.moveTo(0, y0); shape.lineTo(L, y0); shape.lineTo(L, y1); shape.lineTo(0, y1); shape.closePath();
    for (const h of holes) shape.holes.push(new THREE.Path(h.map(([u, y]) => new THREE.Vector2(u, y))));
    const put = g => { g.translate(0, 0, -t / 2); g.rotateY(ang); g.translate(a[0], 0, a[1]); return g; };
    kit.add(put(new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false })), color);
    for (const [hole, variant] of panes) {
      const pts = holes[hole].map(([u, y]) => new THREE.Vector2(u, y));
      const g = new THREE.ShapeGeometry(new THREE.Shape(pts));
      const box = new THREE.Box3().setFromPoints(pts.map(q => new THREE.Vector3(q.x, q.y, 0)));
      const uv = g.attributes.uv, pos = g.attributes.position;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, (pos.getX(k) - box.min.x) / (box.max.x - box.min.x), (pos.getY(k) - box.min.y) / (box.max.y - box.min.y));
      (this.panes[variant % 7] ??= []).push(put(g));
    }
    if (solid) this.wallRing(a, b, t);
    return this;
  }

  // a flat coffered ceiling over x0..x1 × z0..z1 at height y: a plain slab, with beams across it both ways
  // every `bx` and `bz` metres, deeper than the slab
  ceiling(x0, z0, x1, z1, y, { color = this.tint.vault, beam = 0x4a2f1c, bx = 4, bz = 4, w = 0.5, drop = 0.45, rosettes = true } = {}) {
    this.plaster.box(x1 - x0, 0.3, z1 - z0, color, (x0 + x1) / 2, y + 0.15, (z0 + z1) / 2);
    const nx = Math.max(1, Math.round((x1 - x0) / bx)), nz = Math.max(1, Math.round((z1 - z0) / bz));
    for (let i = 0; i <= nx; i++) this.wood.box(w, drop, z1 - z0, beam, x0 + ((x1 - x0) * i) / nx, y - drop / 2, (z0 + z1) / 2);
    for (let j = 0; j <= nz; j++) this.wood.box(x1 - x0, drop, w, beam, (x0 + x1) / 2, y - drop / 2, z0 + ((z1 - z0) * j) / nz);
    if (rosettes) for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) this.gold.add(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 8), 0xd2a94a, x0 + ((x1 - x0) * (i + 0.5)) / nx, y - 0.02, z0 + ((z1 - z0) * (j + 0.5)) / nz);
    return this;
  }

  // the ring of a wall along a→b, t thick, for the riders to bump into
  wallRing(a, b, t = 1.6) {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = (-dz / L) * (t / 2), nz = (dx / L) * (t / 2);
    this.foot.push([a[0] + nx, a[1] + nz, b[0] + nx, b[1] + nz, b[0] - nx, b[1] - nz, a[0] - nx, a[1] - nz]);
  }

  // a square ring (centre, half-sides) to bump into
  block(x, z, hx, hz = hx) { this.foot.push([x - hx, z - hz, x + hx, z - hz, x + hx, z + hz, x - hx, z + hz]); }

  // a column from the floor up to `top`: a base, the shaft, a capital under the springing
  column(x, z, r, top, { capital = true, solid = true } = {}) {
    const k = this.stone, col = this.tint.pier;
    k.add(new THREE.CylinderGeometry(r * 1.3, r * 1.4, 0.9, 12).translate(0, 0.45, 0), col, x, 0, z);
    k.add(new THREE.CylinderGeometry(r, r * 1.05, top - 0.9, 12).translate(0, 0.9 + (top - 0.9) / 2, 0), col, x, 0, z);
    if (capital) {
      k.add(new THREE.CylinderGeometry(r * 1.55, r, 1.0, 12).translate(0, top - 0.5, 0), col, x, 0, z);
      k.add(new THREE.BoxGeometry(r * 3.4, 0.35, r * 3.4).translate(0, top + 0.1, 0), col, x, 0, z);
    }
    if (solid) this.block(x, z, r * 1.15);
    return this;
  }

  // a groin vault over x0..x1 × z0..z1 from its springing line, with the ribs along its diagonals
  // and across its two ends
  vault(x0, z0, x1, z1, ySpring, rise, { n = 12, ribs = true, c = 0.9, color = this.tint.vault, rib = this.tint.rib } = {}) {
    const W = x1 - x0, D = z1 - z0, pos = [];
    const at = (i, j) => {
      const sx = (i / n) * 2 - 1, sz = (j / n) * 2 - 1;
      return [x0 + (W * i) / n, ySpring + rise * Math.max(pointed(sx, c), pointed(sz, c)), z0 + (D * j) / n];
    };
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const a = at(i, j), b = at(i + 1, j), d = at(i, j + 1), e = at(i + 1, j + 1);
        pos.push(...a, ...d, ...b, ...b, ...d, ...e);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    this.plaster.add(g, color);
    if (!ribs) return this;
    const tube = pts => this.stone.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), pts.length * 2, 0.2, 4, false), rib);
    const m = 10;
    for (const flip of [false, true]) {
      const d = [];
      for (let q = 0; q <= m; q++) {
        const t = q / m, s = 2 * t - 1;
        d.push([x0 + W * t, ySpring + rise * pointed(s, c) - 0.05, flip ? z1 - D * t : z0 + D * t]);
      }
      tube(d);
    }
    // the arches across both ends, and the ridge rib along the long way
    const along = (fixed, from, to, axis) => {
      const p = [];
      for (let q = 0; q <= m; q++) {
        const t = q / m, s = 2 * t - 1, v = from + (to - from) * t;
        p.push(axis === 'x' ? [v, ySpring + rise * pointed(s, c) - 0.05, fixed] : [fixed, ySpring + rise * pointed(s, c) - 0.05, v]);
      }
      tube(p);
    };
    along(z0, x0, x1, 'x'); along(z1, x0, x1, 'x'); along(x0, z0, z1, 'z'); along(x1, z0, z1, 'z');
    // a gilded boss where the diagonals cross
    this.gold.add(new THREE.SphereGeometry(0.55, 8, 6), 0xd9b04a, (x0 + x1) / 2, ySpring + rise - 0.1, (z0 + z1) / 2);
    return this;
  }

  // a picture hung up: a canvas texture w × h metres, its middle at (x, y, z), turned ry
  picture(tex, w, h, x, y, z, ry = 0) { this.pictures.push({ tex, w, h, x, y, z, ry }); return this; }

  // a pair of closed doors in a pointed opening u0..u1 of the wall panel along a→b: oak, set into the wall's thickness
  doors(a, b, u0, u1, ySpring, rise) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    const pts = archOutline(u0 + 0.12, u1 - 0.12, 0, ySpring, rise, 8, 0.9).map(([u, y]) => new THREE.Vector2(u, y));
    const g = new THREE.ShapeGeometry(new THREE.Shape(pts));
    const uv = g.attributes.uv, pos = g.attributes.position;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, pos.getX(k) / 3, pos.getY(k) / 4);
    g.rotateY(ang); g.translate(a[0], 0, a[1]);
    this.leaves.push(g);
    // the two leaves meet in the middle, in iron-strapped boards
    const mid = (u0 + u1) / 2, c = Math.cos(-ang), sn = Math.sin(-ang);
    const at = (u, y, d = 0.08) => [a[0] + c * u - sn * d, y, a[1] + sn * u + c * d];
    this.dark.rod(at(mid, 0.1), at(mid, ySpring + rise * 0.9), 0.07, 0x1b1a18, 5);
    for (const y of [1.6, 3.6, 5.4]) for (const side of [-1, 1]) this.dark.rod(at(mid + side * 0.15, y), at(mid + side * (u1 - u0) / 2 * 0.92, y), 0.06, 0x1b1a18, 4);
    this.gold.add(new THREE.TorusGeometry(0.28, 0.06, 6, 12), 0xc9a24a, ...at(mid - 0.6, 2.9, 0.12));
    this.gold.add(new THREE.TorusGeometry(0.28, 0.06, 6, 12), 0xc9a24a, ...at(mid + 0.6, 2.9, 0.12));
    return this;
  }

  // a floor, rectangle x0..x1 × z0..z1, in the floor material
  floor(x0, z0, x1, z1, mat) { this.floors.push({ x0, z0, x1, z1, mat }); }

  // the finished group
  mesh() {
    const g = new THREE.Group();
    const add = (kit, mat) => { if (!kit.pieces.length) return; const m = kit.mesh(mat); m.receiveShadow = false; m.castShadow = false; g.add(m); };
    add(this.stone, masonry('ashlar'));
    add(this.plaster, masonry('plaster', 4));
    add(this.gold, finish(0.35, 0.7, 0x2a1d05));
    add(this.wood, finish(0.7));
    add(this.marble, finish(0.28, 0.05));
    add(this.dark, finish(0.35, 0.3));
    add(this.glow, finish(0.6, 0, 0xffd070));
    add(this.daylight, DAYLIGHT ??= new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    if (this.leaves.length) g.add(new THREE.Mesh(mergeGeometries(this.leaves), oakMat()));
    for (const pic of this.pictures) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(pic.w, pic.h), new THREE.MeshBasicMaterial({ map: pic.tex, side: THREE.DoubleSide, color: 0xf2ece0, alphaTest: 0.1 }));
      m.position.set(pic.x, pic.y, pic.z);
      m.rotation.y = pic.ry;
      g.add(m);
    }
    if (this.glass.length) {
      const geo = mergeGeometries(this.glass.map(c => new THREE.BoxGeometry(c.w, c.h, c.d).translate(c.x, c.y, c.z)));
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xdfeef0, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.18, depthWrite: false }));
      m.renderOrder = 2;
      g.add(m);
    }
    for (const [variant, geos] of Object.entries(this.panes)) {
      g.add(new THREE.Mesh(mergeGeometries(geos.map(geo => (geo.index ? geo : geo))), glassMat(Number(variant))));
    }
    for (const f of this.floors) {
      const geo = new THREE.PlaneGeometry(f.x1 - f.x0, f.z1 - f.z0).rotateX(-Math.PI / 2);
      const s = f.mat.userData.square, uv = geo.attributes.uv, p = geo.attributes.position;
      for (let k = 0; k < uv.count; k++) {
        const x = p.getX(k) + (f.x0 + f.x1) / 2, z = p.getZ(k) + (f.z0 + f.z1) / 2;
        // laid on the diagonal: turned an eighth of a turn
        const u = f.mat.userData.diagonal ? (x + z) * Math.SQRT1_2 : x, v = f.mat.userData.diagonal ? (z - x) * Math.SQRT1_2 : z;
        uv.setXY(k, u / (2 * s), v / (2 * s));
      }
      const m = new THREE.Mesh(geo, f.mat);
      m.position.set((f.x0 + f.x1) / 2, 0.06, (f.z0 + f.z1) / 2);
      m.receiveShadow = false;
      g.add(m);
    }
    return g;
  }
}

// ------------------------------------------------------------------ a cruciform church

// A church from its plan. Nave, crossing and choir along z, a bay each `pitch` long, the piers of
// the arcades at x = ±a, the aisles outside them out to x = ±b; a transept arm each side of the
// crossing; behind the choir a screen of arches and the ambulatory round it; chapels behind that.
//
//   pitch, a (half the clear width of the nave), aisle (an aisle's width), nave, choir (bays),
//   arm (how far a transept arm reaches out past the arcades), ySA/rA (the aisle arches' springing
//   and rise), ySV/rV (the vault of the nave's), chapels: [{ x, w, d, name }], tint: colours;
//   lantern (a tall vault over the crossing) or dome (none: the crossing open for a dome to stand on).
//
// Returns { parts (a Parts: add the furniture to it, then parts.mesh() is the building), foot, and the plan's numbers }.
export function cruciform(cfg) {
  const { pitch: P, a, aisle: Wa, nave: N, choir: C, arm: TA, ySA, rA, ySV, rV } = cfg;
  const b = a + Wa, tint = cfg.tint, p = new Parts(tint);
  const zW = -a - N * P, zE = a + C * P, zA = zE + Wa; // west wall, the screen across the choir, the ambulatory's outer wall
  const winY0 = 3.2;
  const up = cfg.bareStone ? p.stone : p.plaster; // the walls above the arcades: bare Tournai stone, or plastered
  let seed = cfg.seed ?? 1;
  const glass = () => (seed = (seed * 7 + 3) % 5);

  // a lancet window as a hole in a panel `w` wide: from u0 to u1, y0 to its springing and rise
  const window = (u0, u1, y0, ySpring, rise) => archOutline(u0, u1, y0, ySpring, rise, 8, 0.9);

  // ---- floors
  p.floor(-b, zW, b, zA, cfg.floor);
  p.floor(b, -a, a + TA, a, cfg.floor);
  p.floor(-a - TA, -a, -b, a, cfg.floor);

  // ---- the piers
  const crossing = [[-a, -a], [a, -a], [-a, a], [a, a]];
  for (const [x, z] of crossing) p.column(x, z, 1.7, ySA, {});
  for (const s of [-1, 1]) {
    for (let k = 1; k <= N; k++) p.column(s * a, -a - k * P, 1.15, ySA);
    for (let j = 1; j <= C; j++) p.column(s * a, a + j * P, 1.15, ySA);
  }
  p.column(0, zE, 1.15, ySA);
  // the shafts that carry the vault ribs up the nave's walls from each pier's capital
  const shaft = (x, z, dx, dz) => {
    p.stone.add(new THREE.CylinderGeometry(0.4, 0.4, ySV - ySA, 8).translate(0, ySA + (ySV - ySA) / 2, 0), tint.pier, x + dx, 0, z + dz);
    p.stone.add(new THREE.CylinderGeometry(0.62, 0.4, 0.8, 8).translate(0, ySV - 0.4, 0), tint.pier, x + dx, 0, z + dz);
  };
  for (const s of [-1, 1]) {
    for (let k = 0; k <= N; k++) shaft(s * a, -a - k * P, -s * 1.3, 0);
    for (let j = 0; j <= C; j++) shaft(s * a, a + j * P, -s * 1.3, 0);
  }
  for (const [x, z] of crossing) {
    shaft(x, z, -Math.sign(x) * 1.9, 0);
    shaft(x, z, 0, -Math.sign(z) * 1.9);
  }

  // ---- the arcade panels: nave and choir, both sides, a bay each, with the clerestory above
  const arcade = (a0, a1) => {
    const L = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]);
    const cl = window(1.9, L - 1.9, ySA + rA + 2.4, ySV + 1.2, rV - 3.6);
    const arch = archOutline(1.25, L - 1.25, 0, ySA, rA, 8, 0.9);
    p.panel(a0, a1, { ySpring: ySV, rise: rV, holes: [arch, cl], panes: [[1, glass()]], solid: false, kit: up, color: tint.wall });
  };
  for (const s of [-1, 1]) {
    for (let k = 0; k < N; k++) arcade([s * a, -a - k * P], [s * a, -a - (k + 1) * P]);
    for (let j = 0; j < C; j++) arcade([s * a, a + j * P], [s * a, a + (j + 1) * P]);
  }
  // the screen across the east end of the choir, in two bays
  arcade([-a, zE], [0, zE]);
  arcade([0, zE], [a, zE]);

  // ---- vaults over the nave, the choir and the crossing
  for (let k = 0; k < N; k++) p.vault(-a, -a - (k + 1) * P, a, -a - k * P, ySV, rV);
  if (cfg.dome) {
    // a dome over the crossing (Florence's): no vault there, walls closing it up to the top of the
    // nave's vault over the four arches and across the corners, an octagon for the dome to stand on
    const L = 2 * a, open = archOutline(1.9, L - 1.9, 0, ySV, rV, 8, 0.9), t = Math.tan(Math.PI / 8) * a;
    for (const [from, to] of [[[-a, -a], [a, -a]], [[-a, a], [a, a]], [[-a, -a], [-a, a]], [[a, -a], [a, a]]]) {
      p.panel(from, to, { ySpring: ySV, rise: rV, holes: [open], kit: up, color: tint.wall, solid: false });
    }
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) p.rectWall([sx * t, sz * a], [sx * a, sz * t], { y0: ySV - 4, y1: ySV + rV, kit: up, color: tint.wall, solid: false });
  } else if (cfg.lantern) {
    // a lantern tower over the crossing: a taller vault, and walls closing the gap over each of the four arches, windowed
    p.vault(-a, -a, a, a, ySV, cfg.lantern);
    const L = 2 * a, open = archOutline(1.9, L - 1.9, 0, ySV, rV, 8, 0.9), lw = window(3.4, L - 3.4, ySV + rV + 3.4, ySV + rV + 5.6, 2.4);
    for (const [from, to] of [[[-a, -a], [a, -a]], [[-a, a], [a, a]], [[-a, -a], [-a, a]], [[a, -a], [a, a]]]) {
      p.panel(from, to, { ySpring: ySV, rise: cfg.lantern, holes: [open, lw], panes: [[1, 4]], kit: up, color: tint.wall, solid: false, c: 0.9 });
    }
  } else p.vault(-a, -a, a, a, ySV, rV);
  for (let j = 0; j < C; j++) p.vault(-a, a + j * P, a, a + (j + 1) * P, ySV, rV);

  // ---- the aisles: outer wall with a window a bay, and a lower vault
  const outer = (s, z0, z1) => {
    const L = Math.abs(z1 - z0), e = cfg.aisleWindow ?? 2.2;
    const hole = window(e, L - e, winY0, ySA, rA - 1.5);
    p.panel([s * b, z0], [s * b, z1], { ySpring: ySA, rise: rA, holes: [hole], panes: [[0, glass()]], kit: p.stone });
  };
  for (const s of [-1, 1]) {
    for (let k = 0; k < N; k++) {
      outer(s, -a - k * P, -a - (k + 1) * P);
      p.vault(Math.min(s * a, s * b), -a - (k + 1) * P, Math.max(s * a, s * b), -a - k * P, ySA, rA, { n: 8, ribs: false });
    }
    for (let j = 0; j < C; j++) {
      outer(s, a + j * P, a + (j + 1) * P);
      p.vault(Math.min(s * a, s * b), a + j * P, Math.max(s * a, s * b), a + (j + 1) * P, ySA, rA, { n: 8, ribs: false });
    }
  }
  // ---- the ambulatory behind the choir
  for (const [x0, x1] of [[-b, -a], [-a, 0], [0, a], [a, b]]) p.vault(x0, zE, x1, zA, ySA, rA, { n: 8, ribs: false });

  // ---- the transept arms
  for (const s of [-1, 1]) {
    const x0 = s * a, x1 = s * (a + TA);
    p.vault(Math.min(x0, x1), -a, Math.max(x0, x1), a, ySV, rV);
    // the end wall under a great window
    const big = window(2.6, 2 * a - 2.6, 6, ySV + 2, rV - 3.5);
    p.panel([x1, -a], [x1, a], { ySpring: ySV, rise: rV, holes: [big], panes: [[0, glass()]], kit: up, color: tint.wall });
    // the walls along the nave and the choir sides: solid, with the aisle's arch let into it
    for (const [z, face] of [[-a, 1], [a, -1]]) {
      const lo = Math.min(x0, x1), hi = Math.max(x0, x1), L = hi - lo;
      const wa = Math.abs(b - a);
      const aisleArch = archOutline(s > 0 ? 0.9 : L - wa + 0.9, s > 0 ? wa - 0.9 : L - 0.9, 0, ySA, rA, 8, 0.9);
      const win = s > 0 ? window(wa + 2.2, L - 2.4, winY0 + 4, ySV, rV - 4) : window(2.4, L - wa - 2.2, winY0 + 4, ySV, rV - 4);
      p.panel([lo, z], [hi, z], { ySpring: ySV, rise: rV, holes: [aisleArch, win], panes: [[1, glass()]], solid: false, kit: up, color: tint.wall });
      // (solid only beyond the aisles)
      p.wallRing(s > 0 ? [b, z] : [lo, z], s > 0 ? [hi, z] : [-b, z], 1.6);
    }
  }

  // ---- the west wall: the aisles' and the nave's, a great window over the doors
  const doorW = cfg.door ?? 5.4;
  const bigWest = window(2.2, 2 * a - 2.2, 12, ySV + 2.5, rV - 4);
  const door = archOutline(a - doorW / 2, a + doorW / 2, 0, 6.2, 2.4, 8, 0.9);
  p.panel([-a, zW], [a, zW], { ySpring: ySV, rise: rV, holes: cfg.organ ? [door] : [bigWest, door], panes: cfg.organ ? [] : [[0, glass()]], kit: up, color: tint.wall, solid: false });
  p.wallRing([-a, zW], [a, zW], 1.6);
  for (const s of [-1, 1]) {
    const win = window(2.2, Wa - 2.2, winY0, ySA, rA - 1.5);
    p.panel(s > 0 ? [a, zW] : [-b, zW], s > 0 ? [b, zW] : [-a, zW], { ySpring: ySA, rise: rA, holes: [win], panes: [[0, glass()]], kit: p.stone });
  }

  // ---- the ambulatory's outer wall: along it, a window in each stretch of plain wall and an arch
  // open onto each chapel, in pieces that meet end to end
  const chapels = [...(cfg.chapels ?? [])].sort((m, n) => m.x - n.x);
  const pieces = [];
  let from = -b;
  for (const ch of chapels) { pieces.push({ x0: from, x1: ch.x - ch.w / 2 }); pieces.push({ x0: ch.x - ch.w / 2, x1: ch.x + ch.w / 2, ch }); from = ch.x + ch.w / 2; }
  pieces.push({ x0: from, x1: b });
  for (const { x0, x1, ch } of pieces) {
    const L = x1 - x0;
    if (L < 0.2) continue;
    if (ch) {
      p.panel([x0, zA], [x1, zA], { ySpring: ySA, rise: rA, holes: [archOutline(0.9, L - 0.9, 0, ySA - 1.5, rA - 0.6, 8, 0.9)], solid: false, kit: p.stone });
      p.wallRing([x0, zA], [x0 + 0.9, zA]); p.wallRing([x1 - 0.9, zA], [x1, zA]);
    } else {
      const win = L > 5 ? [window(2, L - 2, winY0, ySA, rA - 1.5)] : [];
      p.panel([x0, zA], [x1, zA], { ySpring: ySA, rise: rA, holes: win, panes: win.length ? [[0, glass()]] : [], kit: p.stone });
    }
  }
  for (const ch of chapels) {
    const x0 = ch.x - ch.w / 2, x1 = ch.x + ch.w / 2, z1 = zA + ch.d, hy = ySA - 0.5;
    p.vault(x0, zA, x1, z1, hy, rA - 0.5, { n: 8, ribs: false });
    p.floor(x0, zA, x1, z1, ch.floor ?? cfg.floor);
    // the end wall under its window, the two side walls
    p.panel([x0, z1], [x1, z1], { ySpring: hy, rise: rA - 0.5, holes: [window(1.4, ch.w - 1.4, winY0 - 0.4, hy, rA - 2)], panes: [[0, ch.glass ?? glass()]], kit: p.stone });
    p.panel([x0, zA], [x0, z1], { ySpring: hy, rise: rA - 0.5, kit: p.stone });
    p.panel([x1, zA], [x1, z1], { ySpring: hy, rise: rA - 0.5, kit: p.stone });
  }
  // the ends of the ambulatory
  for (const s of [-1, 1]) p.panel([s * b, zE], [s * b, zA], { ySpring: ySA, rise: rA, kit: p.stone });

  return {
    parts: p, foot: p.foot,
    a, b, P, zW, zE, zA, TA, N, C, ySA, rA, ySV, rV,
  };
}
