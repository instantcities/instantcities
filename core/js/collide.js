import { CAR_TYPES } from './cars.js';
import { RAIL } from './hollows.js';

// Riding about freely on a real map: the walls of the buildings and the edge of the neighbourhood
// stop you, parked cars and trees are in the way, and the water slows you down to a wade (the
// bridges are roads, so they carry you over, between their parapets).

const CELL = 12;
const key = (i, j) => (i + 4096) * 8192 + (j + 4096);

// Something as wide as the river (one polygon round the whole city) would fill a million cells,
// hundreds of MB, enough for an iPhone to throw the page out; it goes on a short list of its own.
const WIDE = 1024;

class Grid {
  constructor() { this.cells = new Map(); this.wide = []; }
  add(item, x0, z0, x1, z1) {
    const i0 = Math.floor(Math.min(x0, x1) / CELL), i1 = Math.floor(Math.max(x0, x1) / CELL);
    const j0 = Math.floor(Math.min(z0, z1) / CELL), j1 = Math.floor(Math.max(z0, z1) / CELL);
    if ((i1 - i0 + 1) * (j1 - j0 + 1) > WIDE) { this.wide.push({ item, i0, i1, j0, j1 }); return; }
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        const k = key(i, j);
        if (!this.cells.has(k)) this.cells.set(k, []);
        this.cells.get(k).push(item);
      }
    }
  }
  near(x, z) {
    const i = Math.floor(x / CELL), j = Math.floor(z / CELL), cell = this.cells.get(key(i, j)) ?? [];
    if (!this.wide.length) return cell;
    const wide = this.wide.filter(w => i >= w.i0 && i <= w.i1 && j >= w.j0 && j <= w.j1).map(w => w.item);
    return wide.length ? cell.concat(wide) : cell;
  }
}

function segDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L));
  const cx = ax + t * dx, cz = az + t * dz;
  return { d: Math.hypot(px - cx, pz - cz), cx, cz };
}

export function inPolygon(x, z, p) {
  let hit = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const ax = p[i], az = p[i + 1], bx = p[j], bz = p[j + 1];
    if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) hit = !hit;
  }
  return hit;
}

// a car is a row of overlapping circles from nose to tail (two for a car, more for a lorry); kept on the car, so a stolen one can be taken away
export function addCarColliders(things, c) {
  const t0 = CAR_TYPES[c.type], f0 = t0.len / 2 - t0.w / 2, n = Math.max(1, Math.ceil(f0 / t0.w));
  c.cols = [];
  for (let k = -n; k <= n; k += 2) {
    const f = (f0 * k) / n, t = { x: c.x + Math.sin(c.yaw) * f, z: c.z + Math.cos(c.yaw) * f, r: t0.w / 2 + 0.1, h: t0.h };
    c.cols.push(t);
    things.add(t, t.x - 2, t.z - 2, t.x + 2, t.z + 2);
  }
}

// cars: [{x, z, yaw}] parked cars to bump into (not the ones riders run over on the race route)
// posts: [{x, z, r, h}] the street lamps, bollards, bins and benches (js/furniture.js)
export function buildColliders(map, cars, posts = []) {
  const walls = new Grid(), ledges = new Grid(), things = new Grid(), water = new Grid(), roads = new Grid(), rails = new Grid();
  const wall = (p, grid = walls) => {
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      const s = [p[j], p[j + 1], p[i], p[i + 1]];
      grid.add(s, Math.min(s[0], s[2]) - 2, Math.min(s[1], s[3]) - 2, Math.max(s[0], s[2]) + 2, Math.max(s[1], s[3]) + 2);
    }
  };
  for (const b of map.buildings) if (!b.gone && !(b.b > 2 && !b.h)) wall(b.p); // not the floors over a passage
  for (const p of map.walls ?? []) wall(p);
  for (const p of map.ledges ?? []) wall(p, ledges); // the walls down into a hollow (js/hollows.js)
  wall(map.zone);
  for (const c of cars) addCarColliders(things, c);
  for (let k = 0; k < map.trees.length; k += 2) {
    const t = { x: map.trees[k], z: map.trees[k + 1], r: 0.5, h: 99 };
    things.add(t, t.x - 2, t.z - 2, t.x + 2, t.z + 2);
  }
  for (const t of posts) things.add(t, t.x - 1, t.z - 1, t.x + 1, t.z + 1);
  for (const w of map.water) {
    for (let k = 0; k + 3 < w.p.length; k += 2) {
      const s = { p: w.p.slice(k, k + 4), half: w.w / 2 };
      water.add(s, Math.min(s.p[0], s.p[2]) - s.half, Math.min(s.p[1], s.p[3]) - s.half, Math.max(s.p[0], s.p[2]) + s.half, Math.max(s.p[1], s.p[3]) + s.half);
    }
  }
  for (const a of map.areas) {
    if (a.k !== 'water') continue;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let k = 0; k < a.p.length; k += 2) { x0 = Math.min(x0, a.p[k]); x1 = Math.max(x1, a.p[k]); z0 = Math.min(z0, a.p[k + 1]); z1 = Math.max(z1, a.p[k + 1]); }
    water.add({ poly: a.p, level: a.level, bank: a.bank, swim: a.swim }, x0, z0, x1, z1);
  }
  for (const rd of map.roads) {
    if (rd.br) {
      // a bridge's parapets, at the height of its deck (the boats below pass under them)
      const half = rd.foot ? rd.w / 2 : rd.w / 2 + 1.3;
      for (let k = 0; k + 3 < rd.p.length; k += 2) {
        const [ax, az, bx, bz] = rd.p.slice(k, k + 4), L = Math.hypot(bx - ax, bz - az) || 1;
        const ux = (-(bz - az) / L) * half, uz = ((bx - ax) / L) * half;
        for (const s of [1, -1]) {
          const w = [ax + ux * s, az + uz * s, bx + ux * s, bz + uz * s, Math.min(rd.y[k / 2], rd.y[k / 2 + 1])];
          rails.add(w, Math.min(w[0], w[2]) - 2, Math.min(w[1], w[3]) - 2, Math.max(w[0], w[2]) + 2, Math.max(w[1], w[3]) + 2);
        }
      }
    }
    for (let k = 0; k + 3 < rd.p.length; k += 2) {
      const s = { p: rd.p.slice(k, k + 4), half: rd.w / 2 + (rd.foot ? 0 : 1.3), n: rd.n, raised: !!rd.y && (rd.y[k / 2] > 0.3 || rd.y[k / 2 + 1] > 0.3) };
      roads.add(s, Math.min(s.p[0], s.p[2]) - s.half, Math.min(s.p[1], s.p[3]) - s.half, Math.max(s.p[0], s.p[2]) + s.half, Math.max(s.p[1], s.p[3]) + s.half);
    }
  }
  return { walls, ledges, things, water, roads, rails, names: map.names };
}

// Push a rider of radius R at height y out of anything solid. Returns how hard it ran into it
// (0 for nothing), so the caller can slow it down like against a rail.
export function collide(col, r, R) {
  let hit = 0;
  const into = (nx, nz) => Math.max(0, -(r.fx * nx + r.fz * nz) * Math.sign(r.speed));
  for (let pass = 0; pass < 2; pass++) {
    const rails = col.rails.near(r.pos.x, r.pos.z).filter(s => Math.abs((r.base ?? 0) + r.y - s[4]) < 0.8);
    // a hollow's walls: jumped clear over the railing on top, already dropping down into it, or up
    // on a bridge across it, or afloat: a boat in the water below a quay lying lower (the Graslei)
    // has to be able to come up onto it
    const over = (r.base ?? 0) + r.y > RAIL - 0.25 || r.baseV < 0 || (r.base ?? 0) > 0.1 || r.afloat;
    for (const s of [...col.walls.near(r.pos.x, r.pos.z), ...(over ? [] : col.ledges.near(r.pos.x, r.pos.z)), ...rails]) {
      const { d, cx, cz } = segDist(r.pos.x, r.pos.z, s[0], s[1], s[2], s[3]);
      if (d >= R || d < 1e-6) continue;
      const nx = (r.pos.x - cx) / d, nz = (r.pos.z - cz) / d;
      r.pos.x = cx + nx * R;
      r.pos.z = cz + nz * R;
      hit = Math.max(hit, into(nx, nz));
    }
  }
  for (const t of col.things.near(r.pos.x, r.pos.z)) {
    if (t.dead || r.y > t.h - 0.3) continue; // (dead: its car was driven off) // jumped over it
    const dx = r.pos.x - t.x, dz = r.pos.z - t.z, d = Math.hypot(dx, dz), min = R * 0.8 + t.r;
    if (d >= min || d < 1e-6) continue;
    r.pos.x = t.x + (dx / d) * min;
    r.pos.z = t.z + (dz / d) * min;
    hit = Math.max(hit, into(dx / d, dz / d));
  }
  return hit;
}

// In the water? A street at the level of the water's edge covers it; a bridge above does not.
export function inWater(col, x, z) {
  if (bankAt(col, x, z) !== undefined) return false; // a canal's grass bank, down to the water, is land
  const wet = col.water.near(x, z).some(s => (s.poly ? inPolygon(x, z, s.poly) : segDist(x, z, ...s.p).d < s.half));
  return wet && !col.roads.near(x, z).some(s => !s.raised && segDist(x, z, ...s.p).d < s.half);
}

// On the grass bank of a canal lying lower (its map area's bank and level, see sunkenWater in
// js/scenery.js): how high the ground is at (x, z), down the slope from 0 at the top, then wading
// in the shallows along it; undefined further out. The shallows reach BANK_WADE metres past where
// the slope goes under, more than a boat's length from its middle (js/scenery.js boatGeometry),
// so the boat you sail never sticks out over the bank.
const BANK_WADE = 6, WADE_DEPTH = 0.6;
export function bankAt(col, x, z) {
  for (const s of col.water.near(x, z)) {
    if (!s.bank || !inPolygon(x, z, s.poly)) continue;
    const drop = -s.level + 0.4, reach = s.bank * -s.level / drop + BANK_WADE; // the slope meets the water at reach
    let d = Infinity;
    for (let k = 0, j = s.poly.length - 2; k < s.poly.length && d >= reach; j = k, k += 2) d = Math.min(d, segDist(x, z, s.poly[j], s.poly[j + 1], s.poly[k], s.poly[k + 1]).d);
    if (d < reach) return Math.max(-drop * d / s.bank, s.level - WADE_DEPTH);
  }
  return undefined;
}

// How high the water's surface lies at (x, z): the level of a canal that lies lower than the rest
// (a city's own, on its map area), else undefined for the usual WATER (js/relief.js).
export function waterLevel(col, x, z) {
  return col.water.near(x, z).find(s => s.poly && s.level !== undefined && inPolygon(x, z, s.poly))?.level;
}

// Is (x, z) in a lake for swimming (a map area marked swim), not for rowing?
export function swimAt(col, x, z) {
  return col.water.near(x, z).some(s => s.swim && inPolygon(x, z, s.poly));
}

// Name of the street at (x, z), or '' away from the streets.
export function streetAt(col, x, z) {
  let best = null, bestD = 14;
  for (const s of col.roads.near(x, z)) {
    if (s.n === undefined) continue;
    const { d } = segDist(x, z, ...s.p);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best ? col.names[best.n] : '';
}

// How far along the line from (ax, az) to (bx, bz) the first wall is, as a fraction (1: none),
// so the camera behind a rider never ends up inside a building.
export function clearLine(col, ax, az, bx, bz) {
  let best = 1;
  const seen = new Set();
  for (let k = 0; k <= 4; k++) {
    const x = ax + ((bx - ax) * k) / 4, z = az + ((bz - az) * k) / 4;
    for (const s of [...col.walls.near(x, z), ...col.ledges.near(x, z)]) {
      if (seen.has(s)) continue;
      seen.add(s);
      const rx = bx - ax, rz = bz - az, sx = s[2] - s[0], sz = s[3] - s[1];
      const den = rx * sz - rz * sx;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((s[0] - ax) * sz - (s[1] - az) * sx) / den, u = ((s[0] - ax) * rz - (s[1] - az) * rx) / den;
      if (t > 0 && t < best && u >= 0 && u <= 1) best = t;
    }
  }
  return best;
}

