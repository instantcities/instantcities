import * as THREE from 'three';
import { CAR_TYPES, randomCar, carInstances } from './cars.js';
import { buildRelief } from './relief.js';
import { THEME } from './city.js';

// Traffic keeps to the right, or to the left where the city drives on the left (THEME.left: London).
const LEFT = !!THEME?.left;

// Cars driving about the city's streets, on the right (or the left, LEFT), turning off at junctions and keeping clear
// of the race routes. Few in the old centre, and those mostly taxis; more further out. Only the
// streets round whoever is watching have traffic: a fixed pool of cars, one instanced mesh per
// type, and a car that falls too far behind turns up again on some other street round the viewer.
// Buses drive the real bus lines the same way, halting at their stops.

const POOL = 60; // the most cars driving at once
const GONE = 380, AWAY = 180, DETAIL = 160; // metres from the viewer: gone, new ones appear beyond, full models within
const CELL = 40, MIN_W = 6.2; // spawn grid; narrower streets are alleys, with no room past the parked cars
const ACCEL = 2.5, BRAKE = 7;
const BINS_CRUISE = 3; // m/s: the bin lorry crawls from bin to bin, with everybody stuck behind it
const BUSES = 6, BUS_EVERY = 1500, DWELL = 9, BUS_BRAKE = 1.6; // at most; one per this many metres of line round the viewer; seconds at a stop; m/s²

// one key for points that are the same street corner
const key = (x, z) => `${Math.round(x * 2)},${Math.round(z * 2)}`;
// the parked cars' side of a two-way street (as osmCars in scenery.js picks it)
const hashOf = i => ((Math.imul(i + 1, 2654435761) >>> 0) % 100000) / 100000;

// Is (x, z) within d metres of any race route? A grid of the routes' points.
function nearRoutes(tracks, d) {
  const C = 20, cells = new Map();
  for (const t of tracks) for (const p of t.points) {
    const k = `${Math.floor(p.x / C)},${Math.floor(p.z / C)}`;
    if (!cells.has(k)) cells.set(k, []);
    cells.get(k).push(p);
  }
  const reach = Math.ceil(d / C);
  return (x, z) => {
    const i = Math.floor(x / C), j = Math.floor(z / C);
    for (let a = i - reach; a <= i + reach; a++) for (let b = j - reach; b <= j + reach; b++) {
      for (const p of cells.get(`${a},${b}`) ?? []) if ((p.x - x) ** 2 + (p.z - z) ** 2 < d * d) return true;
    }
    return false;
  };
}

// The streets as pieces to drive along: each road with the stretches near a race route cut out.
// A piece: { pts: [[x, y, z]], cum: distance along it at each point, one, speed, lane: [back, ahead] }
function network(map, tracks, hw) {
  const blocked = nearRoutes(tracks, hw + 4), pieces = [];
  map.roads.forEach((rd, i) => {
    if (rd.foot || rd.nc || rd.w < MIN_W) return; // nor through the car-free streets
    const pts = [];
    for (let k = 0; k < rd.p.length / 2; k++) pts.push([rd.p[k * 2], rd.y?.[k] ?? 0, rd.p[k * 2 + 1]]);
    // the lane on each side: clear of the parked cars where there are any (see osmCars)
    const parked = rd.one ? 0 : rd.w > 11.5 ? 2 : hashOf(i) < 0.5 ? 1 : -1;
    const lane = side => {
      if (rd.one) return 0;
      const free = rd.w / 2 - (side === parked ? 2.05 : 0.4);
      return Math.min(2.2, Math.max(free / 2, Math.min(1, free - 0.9)));
    };
    const piece = list => {
      const cum = [0];
      for (let k = 1; k < list.length; k++) cum.push(cum[k - 1] + Math.hypot(list[k][0] - list[k - 1][0], list[k][2] - list[k - 1][2]));
      if (cum.at(-1) < 12) return;
      pieces.push({ pts: list, cum, len: cum.at(-1), one: !!rd.one, speed: rd.c ? 6 : rd.w > 11 ? 12 : 8.5, lane: [lane(-1), lane(1)] });
    };
    let cur = null;
    for (let k = 0; k + 1 < pts.length; k++) {
      const [ax, , az] = pts[k], [bx, , bz] = pts[k + 1], n = Math.ceil(Math.hypot(bx - ax, bz - az) / 4);
      let ok = true;
      for (let q = 0; q <= n && ok; q++) ok = !blocked(ax + ((bx - ax) * q) / n, az + ((bz - az) * q) / n);
      if (ok) (cur ??= [pts[k]]).push(pts[k + 1]);
      else if (cur) { piece(cur); cur = null; }
    }
    if (cur) piece(cur);
  });
  // street corners: every point that more than one piece passes through
  const corners = new Map();
  pieces.forEach((p, pi) => p.pts.forEach(([x, , z], k) => {
    const c = key(x, z);
    if (!corners.has(c)) corners.set(c, []);
    corners.get(c).push([pi, k]);
  }));
  for (const p of pieces) p.turns = p.pts.map(([x, , z]) => corners.get(key(x, z)));
  return { pieces, grid: gridOf(pieces) };
}

// A grid of the pieces' stretches, to find a street near a spot.
function gridOf(pieces) {
  const grid = new Map();
  pieces.forEach((p, pi) => {
    for (let k = 0; k + 1 < p.pts.length; k++) {
      for (let s = p.cum[k]; s < p.cum[k + 1]; s += CELL / 2) {
        const f = (s - p.cum[k]) / (p.cum[k + 1] - p.cum[k] || 1), x = p.pts[k][0] + (p.pts[k + 1][0] - p.pts[k][0]) * f, z = p.pts[k][2] + (p.pts[k + 1][2] - p.pts[k][2]) * f;
        const c = `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`;
        if (!grid.has(c)) grid.set(c, []);
        grid.get(c).push([pi, k]);
      }
    }
  });
  return grid;
}

// The bus lines as pieces like the streets': one way, no turning off, with their stops along them.
// Their heights are the streets' under them (relief: js/relief.js), a point every few metres, so a
// bus climbs over a bridge's arch as the street does instead of going through it.
function busNetwork(lines, relief) {
  const pieces = lines.map(l => {
    const pts = [];
    for (let k = 0; k < l.p.length / 2; k++) {
      const x = l.p[k * 2], z = l.p[k * 2 + 1], y = l.y?.[k] ?? 0;
      const prev = pts.at(-1);
      if (relief && prev) {
        const n = Math.floor(Math.hypot(x - prev[0], z - prev[2]) / 3);
        for (let i = 1; i < n; i++) {
          const f = i / n, px = prev[0] + (x - prev[0]) * f, pz = prev[2] + (z - prev[2]) * f;
          pts.push([px, relief.at(px, pz, pts.at(-1)[1]), pz]);
        }
      }
      pts.push([x, relief ? relief.at(x, z, prev ? prev[1] : y) : y, z]);
    }
    const cum = [0];
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][2] - pts[k - 1][2]));
    return { pts, cum, len: cum.at(-1), one: true, speed: 9, lane: [l.lane, l.lane], turns: [], stops: l.stops, ref: l.ref };
  });
  return { pieces, grid: gridOf(pieces) };
}

// ctx: the city's context (group, r); tracks: every race route, for the cars to keep off;
// busLines: the city's BUS_LINES (<city>/transit.js), if any; signals: the traffic
// lights to stop at (js/signals.js), if any.
export function addTraffic(ctx, map, tracks, busLines = [], signals = null) {
  const { pieces, grid } = network(map, tracks, ctx.hw), lines = busNetwork(busLines, buildRelief(map));
  if (!pieces.length) return null;
  const r = ctx.r;
  // the middle of the old centre: the middle of the centre route
  const cx = map.route.reduce((s, p) => s + p[0], 0) / map.route.length, cz = map.route.reduce((s, p) => s + p[1], 0) / map.route.length;
  const fromCentre = (x, z) => Math.hypot(x - cx, z - cz);
  const density = (x, z) => { const d = fromCentre(x, z); return d < 450 ? 0.15 : Math.min(1, 0.15 + ((d - 450) / 700) * 0.85); };
  const taxis = (x, z) => { const d = fromCentre(x, z); return d < 550 ? 0.75 : d < 950 ? 0.3 : 0.05; };

  const meshes = {};
  for (const type of Object.keys(CAR_TYPES)) {
    meshes[type] = carInstances(type, POOL);
    for (const im of Object.values(meshes[type])) if (im) ctx.group.add(im);
  }
  // the cars, then the buses: a few places at the end of the pool are theirs
  const cars = Array.from({ length: POOL + BUSES }, (_, i) => ({ on: false, bus: i >= POOL, pos: new THREE.Vector3(), yaw: 0 }));
  let target = 0, buses = 0, sampleT = 0, last = [];

  // Where a car is: the point s along its piece, offset to its lane. Writes x, y, z, yaw into out.
  const where = (c, out) => {
    const p = c.p, pts = p.pts;
    while (c.k > 0 && p.cum[c.k] > c.s) c.k--;
    while (c.k < pts.length - 2 && p.cum[c.k + 1] < c.s) c.k++;
    const a = pts[c.k], b = pts[c.k + 1], L = p.cum[c.k + 1] - p.cum[c.k] || 1, f = Math.max(0, Math.min(1, (c.s - p.cum[c.k]) / L));
    const ux = ((b[0] - a[0]) / L) * c.dir, uz = ((b[2] - a[2]) / L) * c.dir, lane = LEFT ? -p.lane[c.dir > 0 ? 0 : 1] : p.lane[c.dir > 0 ? 1 : 0];
    out.x = a[0] + (b[0] - a[0]) * f - uz * lane;
    out.y = a[1] + (b[1] - a[1]) * f;
    out.z = a[2] + (b[2] - a[2]) * f + ux * lane;
    out.yaw = Math.atan2(ux, uz);
    return out;
  };
  const spot = {};
  const cruiseOn = (c, p) => c.type === 'bins' ? BINS_CRUISE * (0.8 + r() * 0.4) : p.speed * (0.85 + r() * 0.3);

  // Put car c on a street round one of the viewers, at least min metres from all of them. With
  // density deciding how likely a spot is taken, the outskirts get more cars than the centre.
  const spawn = (c, viewers, min) => {
    const net = c.bus ? lines : { pieces, grid };
    for (let tries = 0; tries < 30; tries++) {
      const v = viewers[Math.floor(r() * viewers.length)], a = r() * Math.PI * 2, d = min + r() * (GONE - 30 - min);
      const cell = net.grid.get(`${Math.floor((v.x + Math.cos(a) * d) / CELL)},${Math.floor((v.z + Math.sin(a) * d) / CELL)}`);
      if (!cell) continue;
      const [pi, k] = cell[Math.floor(r() * cell.length)], p = net.pieces[pi];
      Object.assign(c, { p, k, s: p.cum[k] + r() * (p.cum[k + 1] - p.cum[k]), dir: p.one || r() < 0.5 ? 1 : -1, wait: 0, served: -1 });
      where(c, spot);
      if (!c.bus && r() > density(spot.x, spot.z)) continue;
      if (viewers.some(o => (o.x - spot.x) ** 2 + (o.z - spot.z) ** 2 < min * min)) continue;
      if (cars.some(o => o.on && (o.pos.x - spot.x) ** 2 + (o.pos.z - spot.z) ** 2 < (c.bus ? 400 : 144))) continue;
      const pick = c.bus ? { type: 'bus', c: 0xffffff } : r() < taxis(spot.x, spot.z) ? { type: 'taxi', c: r() < 0.8 ? 0x1c1c1c : 0xf5f5f5 } : randomCar(r);
      Object.assign(c, pick, { on: true, speed: p.speed * 0.8, yaw: spot.yaw });
      c.cruise = cruiseOn(c, p);
      c.pos.set(spot.x, spot.y, spot.z);
      return true;
    }
    return false;
  };

  // At the end of a stretch, point index j of its piece: carry on, or turn off into another street.
  const corner = (c, j) => {
    const p = c.p, ways = [];
    if (c.dir > 0 ? j < p.pts.length - 1 : j > 0) ways.push([p, j, c.dir, 3]);
    for (const [pi, k] of p.turns[j] ?? []) {
      const q = pieces[pi];
      if (q === p) continue;
      if (k < q.pts.length - 1) ways.push([q, k, 1, 1]);
      if (k > 0 && !q.one) ways.push([q, k, -1, 1]);
    }
    if (!ways.length) {
      if (p.one) return false; // the end of a one-way street: gone
      c.dir = -c.dir; // a dead end, or the race route ahead: turn round
      return true;
    }
    let w = r() * ways.reduce((n, x) => n + x[3], 0);
    const [q, k, dir] = ways.find(x => (w -= x[3]) < 0) ?? ways[0];
    Object.assign(c, { p: q, k: Math.min(k, q.pts.length - 2), s: q.cum[k], dir });
    if (q !== p) c.cruise = cruiseOn(c, q);
    return true;
  };

  const drive = (c, dt, riders) => {
    const fx = Math.sin(c.yaw), fz = Math.cos(c.yaw);
    let want = c.cruise;
    // slow for the corner coming up
    const j = c.dir > 0 ? c.k + 1 : c.k, next = Math.abs(c.p.cum[j] - c.s);
    if (c.p.turns[j]?.length > 1 || j === 0 || j === c.p.pts.length - 1) want = Math.min(want, 3.5 + next * 0.5);
    // and stop behind whatever is in the way: a car, or somebody riding about
    const ahead = (x, z, room) => {
      const dx = x - c.pos.x, dz = z - c.pos.z, along = dx * fx + dz * fz;
      if (along > 0 && along < 16 && Math.abs(dx * fz - dz * fx) < 1.7) want = Math.min(want, Math.max(0, (along - room) * 1.1));
    };
    for (const o of cars) if (o !== c && o.on) ahead(o.pos.x, o.pos.z, (CAR_TYPES[c.type].len + CAR_TYPES[o.type].len) / 2 + 1.5);
    for (const o of riders) ahead(o.pos.x, o.pos.z, CAR_TYPES[c.type].len / 2 + 2.5);
    // and at the stop line of a red light
    const half = CAR_TYPES[c.type].len / 2, stop = signals ? signals.stopAt(c.pos.x, c.pos.z, fx, fz, half) : Infinity;
    if (stop < Infinity) want = Math.min(want, Math.max(0, (stop - half - 0.3) * 1.1));
    // a bus halts at its stops, doors open for a while
    if (c.bus) {
      if (c.wait > 0) { c.wait -= dt; want = 0; }
      else {
        const next = c.p.stops.find(s => s > c.served && s > c.s - 0.5);
        if (next !== undefined) {
          const d = next - c.s;
          if (d < 0.4 && c.speed < 0.6) { c.served = next; c.wait = DWELL; want = 0; }
          else want = Math.min(want, Math.sqrt(2 * BUS_BRAKE * Math.max(0, d)) + 0.2);
        }
      }
    }
    c.speed += Math.max(-BRAKE * dt, Math.min(ACCEL * dt, want - c.speed));
    c.s += c.dir * c.speed * dt;
    // past the end of the stretch
    for (let n = 0; n < 4; n++) {
      const p = c.p;
      if (c.dir > 0 ? c.s < p.cum[c.k + 1] : c.s > p.cum[c.k]) break;
      const at = c.dir > 0 ? c.k + 1 : c.k;
      if (c.dir > 0 ? at < p.pts.length - 1 : at > 0) {
        // a point along the same piece: maybe a corner to turn at
        if (p.turns[at]?.length > 1 && r() < 0.5) { if (!corner(c, at)) return false; break; }
        c.k += c.dir;
        continue;
      }
      if (!corner(c, at)) return false;
      break;
    }
    // steer smoothly onto the spot on the street, round corners and turning round
    where(c, spot);
    const ease = 1 - Math.exp(-dt * 6);
    const ox = c.pos.x, oz = c.pos.z;
    c.pos.x += (spot.x - c.pos.x) * ease;
    c.pos.y += (spot.y - c.pos.y) * ease;
    c.pos.z += (spot.z - c.pos.z) * ease;
    const mx = c.pos.x - ox, mz = c.pos.z - oz;
    if (mx * mx + mz * mz > 1e-6) {
      let d = Math.atan2(mx, mz) - c.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      c.yaw += d * Math.min(1, dt * 8);
    }
    return true;
  };

  const d = new THREE.Object3D(), paint = new THREE.Color(), counts = {};
  return {
    cars, // the whole pool; the ones driving have on set
    signals, // the traffic lights they stop at
    // viewers: where the cameras are (Vector3s); riders: everybody riding, to stop for
    update(dt, viewers, riders) {
      dt = Math.min(dt, 0.1);
      if (!viewers.length) return;
      // a new view (another race, the menu): start afresh
      const jumped = viewers.length !== last.length || viewers.some((v, i) => (v.x - last[i].x) ** 2 + (v.z - last[i].z) ** 2 > 80 * 80);
      last = viewers.map(v => ({ x: v.x, z: v.z }));
      if (jumped) for (const c of cars) c.on = false;
      // how many cars the streets round here have room for
      if (jumped || (sampleT -= dt) <= 0) {
        sampleT = 0.5;
        let sum = 0, n = 0;
        for (const v of viewers) for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2, rad = k % 2 ? 120 : 260;
          sum += density(v.x + Math.cos(a) * rad, v.z + Math.sin(a) * rad);
          n++;
        }
        target = Math.round(POOL * (sum / n));
        // as many buses as there is bus line round here
        let metres = 0;
        for (const v of viewers) {
          for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) metres += (lines.grid.get(`${Math.floor(v.x / CELL) + i},${Math.floor(v.z / CELL) + j}`)?.length ?? 0) * (CELL / 2);
        }
        buses = Math.min(BUSES, Math.round(metres / BUS_EVERY));
      }
      let on = 0, busesOn = 0;
      for (const c of cars) {
        if (!c.on) continue;
        const far = Math.min(...viewers.map(v => (v.x - c.pos.x) ** 2 + (v.z - c.pos.z) ** 2));
        if (far > GONE * GONE || !drive(c, dt, riders)) c.on = false;
        else if (c.bus) busesOn++;
        else on++;
      }
      // too many for round here: drop one that is out of sight
      if (on > target + 3) {
        const c = cars.find(o => o.on && !o.bus && viewers.every(v => (v.x - o.pos.x) ** 2 + (v.z - o.pos.z) ** 2 > AWAY * AWAY));
        if (c) { c.on = false; on--; }
      }
      for (let spawned = 0; on < target && spawned < (jumped ? POOL : 2); spawned++) {
        const c = cars.find(o => !o.on && !o.bus);
        if (!c || !spawn(c, viewers, jumped ? 20 : AWAY)) break;
        on++;
      }
      if (busesOn < buses) {
        const c = cars.find(o => !o.on && o.bus);
        if (c) spawn(c, viewers, jumped ? 20 : AWAY);
      }
      // draw them: the full model close by, boxes further off
      for (const type in meshes) counts[type] = [0, 0];
      for (const c of cars) {
        if (!c.on) continue;
        const m = meshes[c.type], near = viewers.some(v => (v.x - c.pos.x) ** 2 + (v.z - c.pos.z) ** 2 < DETAIL * DETAIL);
        d.position.copy(c.pos);
        d.rotation.set(0, c.yaw, 0);
        d.updateMatrix();
        const n = counts[c.type][near ? 0 : 1]++;
        for (const im of near ? [m.near, m.beacons] : [m.far]) {
          if (!im) continue;
          im.setMatrixAt(n, d.matrix);
          if (im.instanceColor) im.setColorAt(n, paint.setHex(c.c ?? 0xffffff));
        }
      }
      for (const type in meshes) {
        const m = meshes[type], [nn, nf] = counts[type];
        for (const [im, n] of [[m.near, nn], [m.beacons, nn], [m.far, nf]]) {
          if (!im) continue;
          im.count = n;
          im.instanceMatrix.needsUpdate = true;
          if (im.instanceColor) im.instanceColor.needsUpdate = true;
        }
      }
    },

    // Push a rider of radius R out of the cars (riding about freely). Returns how hard it hit one.
    push(rider, R) {
      let hit = 0;
      for (const c of cars) {
        if (!c.on) continue;
        const t = CAR_TYPES[c.type], dx = rider.pos.x - c.pos.x, dz = rider.pos.z - c.pos.z;
        if (dx * dx + dz * dz > 49 || rider.y > t.h - 0.3) continue;
        const fx = Math.sin(c.yaw), fz = Math.cos(c.yaw), along = dx * fx + dz * fz, side = dx * fz - dz * fx;
        const pa = t.len / 2 + R * 0.8 - Math.abs(along), ps = t.w / 2 + R * 0.8 - Math.abs(side);
        if (pa <= 0 || ps <= 0) continue;
        // out the nearer way: past the nose or tail, or off its side
        let nx, nz, depth;
        if (pa < ps) { nx = fx * Math.sign(along); nz = fz * Math.sign(along); depth = pa; }
        else { nx = fz * Math.sign(side); nz = -fx * Math.sign(side); depth = ps; }
        rider.pos.x += nx * depth;
        rider.pos.z += nz * depth;
        hit = Math.max(hit, Math.max(0, -(rider.fx * nx + rider.fz * nz) * Math.sign(rider.speed)));
      }
      return hit;
    },
  };
}
