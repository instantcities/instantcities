// The houses and shops of Pompeii as the excavation has them: ruins. Every building the map has,
// apart from the public ones modelled in public.js, the Forum and the amphitheatre, becomes
// walls open to the sky, 2 to 5 m high and broken along their tops, with the dado of painted red or
// black along the foot and the plaster above it, a doorway in the front, a stone floor inside, a
// cross wall or two between the rooms and, in the bigger houses, the pool (impluvium) of the atrium
// with the stumps of its columns. About one house in eight is still roofed, as restored ones are.
// They are made in tiles, so only the ones in sight are built; each stands in for the map's own
// outlines (area) and riders bump into the walls (foot). In game metres.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall } from '../core/js/arcade.js';
import { rng, shade } from '../core/js/facades.js';
import { MAP } from './map.js';
import { PUBLICS } from './public.js';
import { FORUM } from './forum.js';
import { AMPHITHEATRE } from './amphitheatre.js';

const TILE = 170;
const PLASTER = ['#8d8372', '#9a8f7c', '#7f7666', '#a39784', '#b09a78', '#9c8062', '#a98e72', '#c9a572', '#b8654a'];
const DADO = ['#5d4a3c', '#3a302a', '#6b4a3a', '#7a3a2c'];
const BRICK = ['#a07458', '#ab8062', '#94684e', '#8f8478'];
const FLOOR = ['#bdb39d', '#aca18b', '#c6bca6', '#a09684'];

const pickOf = (list, r) => list[Math.floor(r() * list.length) % list.length];
const pairs = p => Array.from({ length: p.length / 2 }, (_, i) => [p[2 * i], p[2 * i + 1]]);
const signed = pts => pts.reduce((s, [x, z], i) => s + x * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * z, 0);
const area = p => Math.abs(signed(pairs(p))) / 2;
const key = p => `${p[0]},${p[1]}`;
const hash = (x, z) => { const v = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return v - Math.floor(v); };

// the buildings that are ruins: not already something modelled by hand
const taken = new Set([...PUBLICS, ...FORUM, ...AMPHITHEATRE].flatMap(m => (m.foot ?? []).map(key)));
const inside = (x, z, poly) => { let hit = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit; } return hit; };
const byHand = [...PUBLICS, ...FORUM, ...AMPHITHEATRE].flatMap(m => (m.area ?? []).map(pairs));
const centre = p => { const q = pairs(p); return [q.reduce((s, v) => s + v[0], 0) / q.length, q.reduce((s, v) => s + v[1], 0) / q.length]; };

const RUINS = MAP.buildings.filter(b => {
  if (taken.has(key(b.p)) || b.k === 'part' || area(b.p) > 1800 || area(b.p) < 14) return false;
  const [cx, cz] = centre(b.p);
  if (hash(cx, cz) < 0.12) return false; // a restored one, roofed
  return !byHand.some(poly => inside(cx, cz, poly));
});

// the walls of one outline, clockwise on the map: its outside on the right of each edge
function house(kit, p, seed) {
  const r = rng(Math.abs(Math.round(seed)) * 7919 + 12345), pts = pairs(p);
  r(); r(); r();
  if (signed(pts) < 0) pts.reverse();
  const plaster = pickOf(PLASTER, r), dado = pickOf(DADO, r), big = area(p) > 260;
  const floors = r() < 0.18 ? 2 : 1, h0 = (floors === 2 ? 6.5 : 3.4) * (0.75 + 0.35 * r());
  let longest = 0, door = 0;
  pts.forEach(([x, z], i) => { const [x2, z2] = pts[(i + 1) % pts.length], l = Math.hypot(x2 - x, z2 - z); if (l > longest) { longest = l; door = i; } });
  pts.forEach(([x, z], i) => {
    const [x2, z2] = pts[(i + 1) % pts.length], path = linePath(x, z, x2, z2), L = path.length;
    if (L < 1) return;
    // the top, broken: a height every few metres between 60 and 100 per cent, and now and then a drop
    const top = [];
    for (let s = L; s > 0.5; s -= 2.5 + 3.5 * r()) top.push([s, h0 * (0.62 + 0.38 * r()) - (r() < 0.1 ? h0 * 0.3 : 0)]);
    top.push([0, h0 * (0.62 + 0.38 * r())]);
    const ring = [[0, 0], [L, 0], ...top.map(([s, y]) => [s, Math.max(0.9, y)])];
    // a doorway on the longest side: cut the wall in two, 2.6 m apart, with a lintel stub over it
    if (i === door && L > 6) {
      const c = L * (0.25 + 0.5 * r()), g = 1.3;
      wall(kit, path, [[0, 0], [c - g, 0], [c - g, h0 * 0.85], [0, h0 * 0.8]], { o0: -0.9, o1: 0, hex: plaster });
      wall(kit, path, [[c + g, 0], [L, 0], [L, h0 * 0.8], [c + g, h0 * 0.9]], { o0: -0.9, o1: 0, hex: plaster });
      wall(kit, path, [[c - g, 2.7], [c + g, 2.7], [c + g, h0 * 0.85 + 0.2], [c - g, h0 * 0.85 + 0.2]], { o0: -0.9, o1: 0, hex: shade(plaster, -0.06) });
      wall(kit, path, [[0, 0], [c - g, 0], [c - g, 1.2], [0, 1.2]], { o0: -0.95, o1: 0.04, hex: dado });
      wall(kit, path, [[c + g, 0], [L, 0], [L, 1.2], [c + g, 1.2]], { o0: -0.95, o1: 0.04, hex: dado });
    } else {
      wall(kit, path, ring, { o0: -0.9, o1: 0, hex: plaster });
      wall(kit, path, [[0, 0], [L, 0], [L, 1.2], [0, 1.2]], { o0: -0.95, o1: 0.04, hex: dado });
    }
    // a patch of bare brick where the plaster is gone
    if (L > 5 && r() < 0.4) wall(kit, path, [[L * 0.3, 0.6], [L * 0.3 + 2.4, 0.6], [L * 0.3 + 2.4, 2.4], [L * 0.3, 2.2]], { o0: -0.92, o1: 0.03, hex: pickOf(BRICK, r) });
  });
  // the floor, a pool in the middle of the bigger houses and the stumps of columns round it, a cross wall
  const [cx, cz] = centre(p);
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  kit.add(new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2), pickOf(FLOOR, r), 0, 0.07, 0);
  if (big) {
    kit.box(3.6, 0.2, 2.4, '#5d6e73', cx, 0.1, cz);
    for (const [dx, dz] of [[-2.6, -2], [2.6, -2], [-2.6, 2], [2.6, 2]]) kit.add(new THREE.CylinderGeometry(0.32, 0.38, 1.2 + r() * 1.8, 8), '#e2d6b4', cx + dx, 0.8, cz + dz);
  }
  if (area(p) > 120) {
    const a = pts[door], b = pts[(door + 1) % pts.length], ux = (b[0] - a[0]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1), uz = (b[1] - a[1]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
    const ang = Math.atan2(-uz, ux), len = Math.sqrt(area(p)) * 0.8;
    kit.box(len * 0.5, h0 * 0.6, 0.6, '#d9c8a2', cx - uz * 3, h0 * 0.3, cz + ux * 3, 0, ang + Math.PI / 2, 0);
  }
}

// the tile of a building: by its middle
const tileOf = b => { const [x, z] = centre(b.p); return `${Math.floor(x / TILE)},${Math.floor(z / TILE)}`; };
const tiles = new Map();
for (const b of RUINS) { const k = tileOf(b); if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(b); }

const rounded = p => p.map(v => Math.round(v * 10) / 10);
const box = p => { const xs = p.filter((_, i) => !(i % 2)), zs = p.filter((_, i) => i % 2); return [Math.min(...xs) - 1, Math.min(...zs) - 1, Math.max(...xs) + 1, Math.min(...zs) - 1, Math.max(...xs) + 1, Math.max(...zs) + 1, Math.min(...xs) - 1, Math.max(...zs) + 1].map(v => Math.round(v * 10) / 10); };

export const RUINED_TOWN = [...tiles.entries()].map(([k, list]) => {
  const [tx, tz] = k.split(',').map(Number);
  return {
    id: `ruins-${k}`, name: 'Ruins', x: (tx + 0.5) * TILE, z: (tz + 0.5) * TILE, turn: 0, reach: TILE * 1.1,
    area: list.map(b => box(b.p)),
    foot: list.map(b => rounded(b.p)),
    // the meshes are built at their world places (the walls are in the map's metres), so the monument stands at the origin
    make: () => {
      const kit = new Kit();
      list.forEach((b, i) => house(kit, b.p, i * 17 + tx * 101 + tz * 37));
      const m = kit.mesh(kitMat(0.95));
      m.geometry.translate(-(tx + 0.5) * TILE, 0, -(tz + 0.5) * TILE); // (landmarks.js stands a monument at its x, z)
      return m;
    },
  };
});
