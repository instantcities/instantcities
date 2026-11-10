// The squares that lie lower than their streets (<city>/landmarks.js, measured by
// tools/gent3d.mjs from the DHMV II's bare ground): the Emile Braunplein's lawns slope down from
// the streets to the forecourt of the cellar under the Stadshal, behind a railing. Each hollow is
// a grid of depths; every cell is two triangles, the ground sloping evenly across each.
import * as THREE from 'three';
import { HOLLOWS } from './city.js';
import { settTexture } from './track.js';
import { onGround, GROUND } from './ground.js';
import { WATER } from './relief.js';

const STEEP = 1.2; // a cell rising more than this from one corner to another is a wall, not a slope
export const RAIL = 1.05; // how high the railing along the top of the walls stands
const FRONT = 3; // a wall dropping further than this is a front of glass, of what is in under the street

const depth = (h, i, j) => h.d[j * (h.nx + 1) + i] / (h.per ?? 10); // in steps of 1/per m (decimetres unless said)
const sunkCell = (h, i, j) => Math.min(depth(h, i, j), depth(h, i + 1, j), depth(h, i, j + 1), depth(h, i + 1, j + 1)) < 0;
const drop = (h, i, j) => {
  const c = [depth(h, i, j), depth(h, i + 1, j), depth(h, i, j + 1), depth(h, i + 1, j + 1)];
  return Math.max(...c) - Math.min(...c);
};
const steepCell = (h, i, j) => drop(h, i, j) > STEEP;
// a cell's two triangles, as [i, j] corners: split along the diagonal whose ends lie most nearly
// level, so a wall running across the cell comes out one slope, not a fold
const halves = (h, i, j) => (Math.abs(depth(h, i, j) - depth(h, i + 1, j + 1)) <= Math.abs(depth(h, i + 1, j) - depth(h, i, j + 1))
  ? [[[i, j], [i + 1, j], [i + 1, j + 1]], [[i, j], [i + 1, j + 1], [i, j + 1]]]
  : [[[i, j], [i + 1, j], [i, j + 1]], [[i + 1, j], [i + 1, j + 1], [i, j + 1]]]);

// How far below the street (x, z) lies: 0 outside the hollows (quays: with those along the water).
export function sunk(x, z, quays = true) {
  for (const h of HOLLOWS) {
    if (!quays && h.quay) continue;
    const fx = (x - h.x0) / h.cell, fz = (z - h.z0) / h.cell;
    if (!(fx >= 0 && fz >= 0 && fx < h.nx && fz < h.nz)) continue;
    const i = Math.floor(fx), j = Math.floor(fz);
    // on the plane of whichever of its triangles holds the point (barycentric weights)
    for (const t of halves(h, i, j)) {
      const [[ai, aj], [bi, bj], [ci, cj]] = t, det = (bj - cj) * (ai - ci) + (ci - bi) * (aj - cj);
      const wa = ((bj - cj) * (fx - ci) + (ci - bi) * (fz - cj)) / det, wb = ((cj - aj) * (fx - ci) + (ai - ci) * (fz - cj)) / det, wc = 1 - wa - wb;
      if (wa >= -1e-9 && wb >= -1e-9 && wc >= -1e-9) return wa * depth(h, ai, aj) + wb * depth(h, bi, bj) + wc * depth(h, ci, cj);
    }
  }
  return 0;
}

// A hollow along a line (a path in a trench, a quay lower than its street), in `cell` cells over
// the stretch of p (flat [x, z, ...]) from s0 to s1 metres along it, reaching `reach` metres
// either side of it: each corner's depth (metres, <= 0) is depth(s, d, x, z), s how far along p
// its nearest point lies and d how far from p the corner is; the corners further off (and those
// round the edge of the grid) are outside(x, z) deep, 0 unless said otherwise. per: the depths'
// steps a metre (10, decimetres; 100 for a gentle slope running across the grid, which in whole
// decimetres comes out as a saw).
export function lineHollow({ id, name, p, s0 = 0, s1 = Infinity, reach, cell = 0.5, per = 10, depth, outside = () => 0, ...rest }) {
  const at = [0];
  for (let k = 2; k < p.length; k += 2) at.push(at[at.length - 1] + Math.hypot(p[k] - p[k - 2], p[k + 1] - p[k - 1]));
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (let k = 0; k < p.length; k += 2) {
    const lo = k ? at[k / 2 - 1] : 0, hi = k + 2 < p.length ? at[k / 2 + 1] : at[k / 2];
    if (hi < s0 - 4 || lo > s1 + 4) continue; // a point of a segment that runs through the stretch
    x0 = Math.min(x0, p[k]); x1 = Math.max(x1, p[k]); z0 = Math.min(z0, p[k + 1]); z1 = Math.max(z1, p[k + 1]);
  }
  x0 = Math.floor(x0 - reach - 2); z0 = Math.floor(z0 - reach - 2);
  const nx = Math.ceil((x1 + reach + 2 - x0) / cell), nz = Math.ceil((z1 + reach + 2 - z0) / cell), d = [];
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const x = x0 + i * cell, z = z0 + j * cell;
      let bd = Infinity, bs = 0;
      for (let k = 0; k + 3 < p.length; k += 2) {
        const ax = p[k], az = p[k + 1], dx = p[k + 2] - ax, dz = p[k + 3] - az, L = dx * dx + dz * dz || 1e-9;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L)), dd = Math.hypot(x - ax - t * dx, z - az - t * dz);
        if (dd < bd) { bd = dd; bs = at[k / 2] + t * (at[k / 2 + 1] - at[k / 2]); }
      }
      const edge = i === 0 || j === 0 || i === nx || j === nz;
      d.push(Math.min(0, Math.round((edge || bd > reach || bs < s0 || bs > s1 ? outside(x, z) : depth(bs, bd, x, z)) * per)));
    }
  }
  return { id, name, x0, z0, cell, nx, nz, d, ...(per !== 10 && { per }), ...rest };
}

// The foot of the wall at (x, z), if a wall stands there.
function wallAt(x, z) {
  for (const h of HOLLOWS) {
    const i = Math.floor((x - h.x0) / h.cell), j = Math.floor((z - h.z0) / h.cell);
    if (i >= 0 && j >= 0 && i < h.nx && j < h.nz && steepCell(h, i, j)) return Math.min(depth(h, i, j), depth(h, i + 1, j), depth(h, i, j + 1), depth(h, i + 1, j + 1));
  }
  return null;
}

// The map with its hollows let in: the streets and paths across them go down with the ground, in
// pieces half a cell long and a little under it (a strip is flat from kerb to kerb, the ground
// is not: hollowGround lays them on the slope instead), the water in them is left out (it would
// float), and their walls are for bumping into (map.ledges, rings like a building's): from below
// always, from the street only until you jump the railing on top (js/collide.js). A bridge stays
// up: it spans a hollow (a path going down under it, <city>/underpasses.js).
export function sinkHollows(map) {
  if (!HOLLOWS.length) return map;
  const inBox = (x, z) => HOLLOWS.some(h => x >= h.x0 - 1 && z >= h.z0 - 1 && x <= h.x0 + h.nx * h.cell + 1 && z <= h.z0 + h.nz * h.cell + 1);
  const roads = map.roads.map(rd => {
    if (rd.br) return rd;
    const p = rd.p;
    let through = false;
    for (let k = 0; k + 3 < p.length && !through; k += 2) {
      for (let t = 0; t <= 1; t += 0.05) {
        const x = p[k] + (p[k + 2] - p[k]) * t, z = p[k + 1] + (p[k + 3] - p[k + 1]) * t;
        through ||= inBox(x, z) && sunk(x, z) < 0; // one that only passes the hollow by stays as it is
      }
    }
    if (!through) return rd;
    // under the ground, and in a wall under its foot (a strip would cut through it)
    const under = (x, z) => { const d = sunk(x, z), w = wallAt(x, z); return (w ?? d) + Math.max(-0.6, 3 * d); };
    const q = [p[0], p[1]], y = [(rd.y?.[0] ?? 0) + under(p[0], p[1])];
    for (let k = 0; k + 3 < p.length; k += 2) {
      const n = Math.max(1, Math.ceil(Math.hypot(p[k + 2] - p[k], p[k + 3] - p[k + 1]) / 0.75));
      const ya = rd.y?.[k / 2] ?? 0, yb = rd.y?.[k / 2 + 1] ?? 0;
      for (let s = 1; s <= n; s++) {
        const x = p[k] + ((p[k + 2] - p[k]) * s) / n, z = p[k + 1] + ((p[k + 3] - p[k + 1]) * s) / n;
        q.push(x, z);
        y.push(ya + ((yb - ya) * s) / n + under(x, z));
      }
    }
    return { ...rd, p: q, y };
  });
  // (but the water beside a quay lying lower, which reaches a little way out over it, stays)
  const dry = a => a.k !== 'water' || !a.p.some((v, k) => k % 2 === 0 && sunk(v, a.p[k + 1], false) < 0);
  const walls = [];
  for (const h of HOLLOWS) {
    for (let j = 0; j < h.nz; j++) {
      for (let i = 0; i < h.nx; i++) {
        if (!steepCell(h, i, j)) continue;
        const x = h.x0 + i * h.cell, z = h.z0 + j * h.cell, c = h.cell;
        walls.push([x, z, x + c, z, x + c, z + c, x, z + c]);
      }
    }
  }
  return { ...map, roads, areas: map.areas.filter(dry), ledges: [...(map.ledges ?? []), ...walls] };
}

// Polygon p (flat [x, z, ...]) clipped to the convex triangle tri ([[x, z] x 3], either way round):
// Sutherland-Hodgman, one edge of the triangle at a time.
function clip(p, tri) {
  let pts = [];
  for (let k = 0; k < p.length; k += 2) pts.push([p[k], p[k + 1]]);
  const turn = Math.sign((tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1]) - (tri[1][1] - tri[0][1]) * (tri[2][0] - tri[0][0]));
  for (let e = 0; e < 3 && pts.length; e++) {
    const [a, b] = [tri[e], tri[(e + 1) % 3]];
    const side = q => turn * ((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]));
    const out = [];
    pts.forEach((q, k) => {
      const r = pts[(k + 1) % pts.length], sq = side(q), sr = side(r);
      if (sq >= 0) out.push(q);
      if ((sq >= 0) !== (sr >= 0)) {
        const t = sq / (sq - sr);
        out.push([q[0] + (r[0] - q[0]) * t, q[1] + (r[1] - q[1]) * t]);
      }
    });
    // without the points that came out twice (a corner on an edge), which the triangulation trips over
    pts = out.filter((q, k) => { const r = out[(k + 1) % out.length]; return Math.hypot(q[0] - r[0], q[1] - r[1]) > 1e-4; });
  }
  return pts.length >= 3 ? pts : null;
}

class Soup {
  constructor() { this.pos = []; this.uv = []; }
  tri(a, b, c, uv) {
    // facing up (or, for a wall, whichever way: it is drawn from both sides)
    const up = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]) >= 0;
    for (const q of up ? [a, b, c] : [a, c, b]) { this.pos.push(...q); this.uv.push(...uv(q)); }
  }
  mesh(group, material, shadow = false) {
    if (!this.pos.length) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, material);
    m.receiveShadow = true;
    m.castShadow = shadow;
    group.add(m);
    return m;
  }
}

// tall panes of dark glass between slim frames, 4 m to a repeat
function frontTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#2b3036';
  g.fillRect(0, 0, 128, 128);
  for (let x = 0; x < 128; x += 32) {
    const grad = g.createLinearGradient(x, 0, x + 32, 128);
    grad.addColorStop(0, '#4d5a66'); grad.addColorStop(1, '#27313a');
    g.fillStyle = grad;
    g.fillRect(x + 3, 3, 26, 122);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function railTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#2f3336';
  g.fillRect(0, 0, 128, 7); // the handrail
  g.fillRect(0, 56, 128, 5);
  for (let x = 4; x < 128; x += 16) g.fillRect(x, 0, 3, 64); // the bars
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// What lies flat on the ground in the hollows, as polygons to lay on its slope: the map's areas
// (layers: { kind: [batch, material, y, tile] }, as js/scenery.js draws them) and its streets and
// paths, a strip of quads with a round joint wherever they turn, drawn as js/scenery.js draws them.
function flatThings(map, layers, mats) {
  const things = [];
  for (const a of map.areas) {
    const layer = layers[a.k];
    if (!layer || a.k === 'water' || a.k === 'paved') continue;
    things.push({ p: a.p, key: a.k, material: layer[1], y: layer[2], tile: layer[3] });
  }
  const strip = (rd, w, key, material, y, tile) => {
    const p = rd.p;
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], bx = p[k + 2], bz = p[k + 3], L = Math.hypot(bx - ax, bz - az);
      if (L < 0.01) continue;
      const nx = (-(bz - az) / L) * w / 2, nz = ((bx - ax) / L) * w / 2;
      things.push({ p: [ax + nx, az + nz, ax - nx, az - nz, bx - nx, bz - nz, bx + nx, bz + nz], key, material, y, tile });
      // a round joint where it starts, turns or ends
      const turns = k === 0 || Math.abs(Math.sin(Math.atan2(bz - az, bx - ax) - Math.atan2(az - p[k - 1], ax - p[k - 2]))) > 0.08;
      for (const [cx, cz] of [...(turns ? [[ax, az]] : []), ...(k + 4 >= p.length ? [[bx, bz]] : [])]) {
        things.push({ p: [...Array(8).keys()].flatMap(s => [cx + (Math.cos((s * Math.PI) / 4) * w) / 2, cz + (Math.sin((s * Math.PI) / 4) * w) / 2]), key, material, y, tile });
      }
    }
  };
  for (const rd of map.roads) {
    if (!rd.y?.some(v => v < 0)) continue; // only those sunk by sinkHollows
    if (rd.foot) strip(rd, rd.w, rd.c ? 'footSetts' : 'foot', rd.c ? mats.setts : mats.pavement, rd.c ? GROUND.footSetts : GROUND.foot, rd.c ? 6 : 3);
    else {
      strip(rd, rd.w + 2.6, 'kerbs', mats.pavement, GROUND.kerbs, 3);
      strip(rd, rd.w, rd.c ? 'setts' : 'asphalt', rd.c ? mats.setts : mats.asphalt, rd.c ? GROUND.setts : GROUND.asphalt, rd.c ? 6 : 8);
    }
  }
  for (const t of things) {
    t.x0 = Infinity; t.x1 = -Infinity; t.z0 = Infinity; t.z1 = -Infinity;
    for (let k = 0; k < t.p.length; k += 2) { t.x0 = Math.min(t.x0, t.p[k]); t.x1 = Math.max(t.x1, t.p[k]); t.z0 = Math.min(t.z0, t.p[k + 1]); t.z1 = Math.max(t.z1, t.p[k + 1]); }
  }
  return things;
}

// Is (x, z) under a bridge's deck? No railing stands there: it would poke up through it.
function underDeck(map) {
  const decks = map.roads.filter(rd => rd.br);
  return (x, z) => decks.some(rd => {
    const half = rd.w / 2 + (rd.foot ? 0 : 1.3) + 0.3;
    for (let k = 0; k + 3 < rd.p.length; k += 2) {
      const [ax, az, bx, bz] = rd.p.slice(k, k + 4), dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
      if (Math.hypot(x - ax - t * dx, z - az - t * dz) < half) return true;
    }
    return false;
  });
}

// The hollows' ground, under a hole in the street's (a stencil mask like the water's, see
// sunkenWater in js/scenery.js), with what lies on it. mats: { pavement, asphalt }.
export function hollowGround(group, map, layers, mats) {
  if (!HOLLOWS.length) return;
  const covered = underDeck(map);
  mats = { ...mats, setts: new THREE.MeshStandardMaterial({ map: settTexture(16, 24), roughness: 0.95 }) };
  const mask = new Soup(), floor = new Soup(), walls = new Soup(), fronts = new Soup(), rails = new Soup(), laid = {};
  const flat = tile => q => [q[0] / tile, q[2] / tile];
  for (const h of HOLLOWS) {
    const x1 = h.x0 + h.nx * h.cell, z1 = h.z0 + h.nz * h.cell;
    const near = flatThings(map, layers, mats).filter(t => t.x1 > h.x0 && t.z1 > h.z0 && t.x0 < x1 && t.z0 < z1);
    let shore = null; // in a quay's cell on the water's edge: the quay's own depth, for its corners out in the water
    const P = (i, j, lift = 0) => [h.x0 + i * h.cell, (shore !== null && depth(h, i, j) < WATER ? shore : depth(h, i, j)) + lift, h.z0 + j * h.cell];
    const top = (i, j) => [h.x0 + i * h.cell, 0, h.z0 + j * h.cell];
    for (let j = 0; j < h.nz; j++) {
      for (let i = 0; i < h.nx; i++) {
        if (!sunkCell(h, i, j)) continue;
        // a quay's hollow goes on just under the water beside it, so its edge does not stick up out
        // of it: what lies wholly under the water there is not drawn, and a cell on the water's
        // edge is drawn level with the quay (its quay wall, js/scenery.js, goes down from there)
        const corners = [depth(h, i, j), depth(h, i + 1, j), depth(h, i, j + 1), depth(h, i + 1, j + 1)];
        if (h.quay && Math.max(...corners) < WATER) continue;
        shore = h.quay && Math.min(...corners) < WATER ? Math.min(...corners.filter(c => c >= WATER)) : null;
        const steep = shore === null && steepCell(h, i, j);
        for (const t of halves(h, i, j)) {
          mask.tri(...t.map(c => top(...c)), flat(1));
          const q = t.map(c => P(...c));
          if (steep) (drop(h, i, j) > FRONT ? fronts : walls).tri(...q, v => [(v[0] + v[2]) / 4, v[1] / 4]);
          else floor.tri(...q, flat(3));
        }
        // a railing along the top of a wall: the cell's edges that stay up at the street (or the
        // hollow's own railings, drawn below)
        if (steep) {
          if (h.rails) continue;
          for (const [a, b] of [[[i, j], [i + 1, j]], [[i + 1, j], [i + 1, j + 1]], [[i + 1, j + 1], [i, j + 1]], [[i, j + 1], [i, j]]]) {
            if (depth(h, ...a) < -0.3 || depth(h, ...b) < -0.3) continue;
            const [pa, pb] = [P(...a), P(...b)];
            if (covered((pa[0] + pb[0]) / 2, (pa[2] + pb[2]) / 2)) continue;
            const uv = q => [(q[0] + q[2]) / 2, q[1] / RAIL];
            rails.tri(pa, pb, [pb[0], pb[1] + RAIL, pb[2]], uv);
            rails.tri(pa, [pb[0], pb[1] + RAIL, pb[2]], [pa[0], pa[1] + RAIL, pa[2]], uv);
          }
          continue;
        }
        // the lawns and the paths, laid on the slope triangle by triangle
        const cx = h.x0 + i * h.cell, cz = h.z0 + j * h.cell;
        for (const thing of near) {
          if (thing.x1 < cx || thing.z1 < cz || thing.x0 > cx + h.cell || thing.z0 > cz + h.cell) continue;
          for (const t of halves(h, i, j)) {
            const [o, u, w] = t.map(c => P(...c, thing.y));
            const piece = clip(thing.p, [o, u, w].map(v => [v[0], v[2]]));
            if (!piece) continue;
            // the piece's points on the triangle's plane
            const du = [u[0] - o[0], u[1] - o[1], u[2] - o[2]], dw = [w[0] - o[0], w[1] - o[1], w[2] - o[2]];
            const det = du[0] * dw[2] - du[2] * dw[0];
            const lift = ([x, z]) => {
              const s = ((x - o[0]) * dw[2] - (z - o[2]) * dw[0]) / det, r = ((z - o[2]) * du[0] - (x - o[0]) * du[2]) / det;
              return [x, o[1] + s * du[1] + r * dw[1], z];
            };
            const tris = THREE.ShapeUtils.triangulateShape(piece.map(([x, z]) => new THREE.Vector2(x, z)), []);
            const soup = (laid[thing.key] ??= [new Soup(), onGround(thing.material, thing.y)]);
            for (const [ka, kb, kc] of tris) soup[0].tri(lift(piece[ka]), lift(piece[kb]), lift(piece[kc]), flat(thing.tile));
          }
        }
      }
    }
  }
  // a hollow that runs aslant the grid has its railings drawn smooth, as lines along its edges
  for (const line of HOLLOWS.flatMap(h => h.rails ?? [])) {
    for (let k = 0; k + 3 < line.length; k += 2) {
      const pa = [line[k], 0, line[k + 1]], pb = [line[k + 2], 0, line[k + 3]];
      if (covered((pa[0] + pb[0]) / 2, (pa[2] + pb[2]) / 2)) continue;
      const uv = q => [(q[0] + q[2]) / 2, q[1] / RAIL];
      rails.tri(pa, pb, [pb[0], RAIL, pb[2]], uv);
      rails.tri(pa, [pb[0], RAIL, pb[2]], [pa[0], RAIL, pa[2]], uv);
    }
  }
  const hole = mask.mesh(group, new THREE.MeshBasicMaterial({
    colorWrite: false, depthWrite: false, depthTest: false,
    stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
  }));
  if (hole) { hole.renderOrder = -10; hole.receiveShadow = false; }
  floor.mesh(group, onGround(mats.pavement, 0));
  walls.mesh(group, new THREE.MeshStandardMaterial({ color: 0x8f8676, roughness: 0.95, side: THREE.DoubleSide }), true);
  fronts.mesh(group, new THREE.MeshStandardMaterial({ map: frontTexture(), roughness: 0.35, metalness: 0.2, side: THREE.DoubleSide }), true);
  rails.mesh(group, new THREE.MeshStandardMaterial({ map: railTexture(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 }));
  for (const [soup, material] of Object.values(laid)) soup.mesh(group, material);
}
