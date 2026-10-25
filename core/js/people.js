import * as THREE from 'three';
import { createFigure, createStash } from './figure.js';
import { inPolygon } from './collide.js';

// People walking along the pavements, some with a dog on a lead, and runners doing their laps, and the
// city's well-known characters up and down their own street (city.js CHARACTERS), each drawn in full (js/figure.js). They step aside when a horse comes
// close. Every body part is one instanced mesh for all walkers, posed again each frame.

export const SHIRTS = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xff7043, 0x8e24aa, 0x26c6da, 0xf5f5f5, 0x37474f, 0xad1457, 0x6d4c41];
export const PANTS = [0x283593, 0x3e2723, 0x212121, 0x546e7a, 0x8d6e63, 0x1565c0];
export const SKINS = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
export const HAIRS = [0x2b1d14, 0x5d4037, 0xd7b56d, 0x1d1a17, 0xb0a99f, 0xa0522d];
const DOGS = [0x8d6e63, 0x3e2723, 0xf5e6c8, 0x1d1a17, 0xd7a35b];
const LEAP = 0.35; // seconds for a walker's leap out of a borrowed car's way
const SPLASH = new THREE.SphereGeometry(1, 6, 5); // the paint on a character's chest

// A path to walk along: a polyline of [x, z] points, closed or not.
function makePath(points, closed) {
  const pts = closed ? [...points, points[0]] : points, cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return {
    closed, length: cum.at(-1),
    at(s) {
      s = closed ? ((s % this.length) + this.length) % this.length : Math.max(0, Math.min(this.length, s));
      let lo = 0, hi = cum.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
      const a = pts[lo], b = pts[hi], L = cum[hi] - cum[lo] || 1, t = (s - cum[lo]) / L;
      return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, dx: (b[0] - a[0]) / L, dz: (b[1] - a[1]) / L };
    },
  };
}

// a flat [x, z, x, z, ...] line moved off sideways, to the left of its direction (+off), every other point
export function alongside(p, off) {
  const points = [];
  for (let q = 0; q + 1 < p.length; q += 2) {
    // offset each point sideways, using the direction of the road there
    const a = Math.max(0, q - 2), b = Math.min(p.length - 2, q + 2);
    const dx = p[b] - p[a], dz = p[b + 1] - p[a + 1], L = Math.hypot(dx, dz) || 1;
    points.push([p[q] - (dz / L) * off, p[q + 1] + (dx / L) * off]);
  }
  return points;
}

// The busy streets (city.js BUSY) as paths to walk: along both pavements of each, down the middle
// too where no cars come, and straight across a square from one side to the other. A path stops
// where it runs into a house, a tree or something standing there (things: [{ x, z, size }], city.js
// MONUMENTS: statues, stalls, terraces) and goes on past it as a path of its own. Each path's weight
// is its length times how busy its street is, all of them together `walkers`.
export function busyPaths(map, busy, walkers, rand, things = []) {
  const how = new Map(busy.streets.map(b => [b.street, b]));
  const pieces = map.roads.filter(rd => rd.p.length >= 4 && how.has(map.names[rd.n]));
  if (!pieces.length) return [];
  // the houses, trees and things near them, by 20 m cell
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const rd of pieces) for (let k = 0; k < rd.p.length; k += 2) {
    x0 = Math.min(x0, rd.p[k] - 30); x1 = Math.max(x1, rd.p[k] + 30); z0 = Math.min(z0, rd.p[k + 1] - 30); z1 = Math.max(z1, rd.p[k + 1] + 30);
  }
  const cells = new Map(), cell = (x, z) => Math.floor(x / 20) * 100000 + Math.floor(z / 20);
  const put = (o, ax, az, bx, bz) => {
    if (bx < x0 || ax > x1 || bz < z0 || az > z1) return;
    for (let i = Math.floor(ax / 20); i <= Math.floor(bx / 20); i++) for (let j = Math.floor(az / 20); j <= Math.floor(bz / 20); j++) {
      const k = i * 100000 + j;
      if (!cells.has(k)) cells.set(k, []);
      cells.get(k).push(o);
    }
  };
  for (const b of map.buildings) {
    if (b.gone) continue;
    let ax = Infinity, az = Infinity, bx = -Infinity, bz = -Infinity;
    for (let k = 0; k < b.p.length; k += 2) { ax = Math.min(ax, b.p[k]); bx = Math.max(bx, b.p[k]); az = Math.min(az, b.p[k + 1]); bz = Math.max(bz, b.p[k + 1]); }
    put({ p: b.p }, ax, az, bx, bz);
  }
  for (let k = 0; k < map.trees.length; k += 2) {
    const x = map.trees[k], z = map.trees[k + 1];
    put({ x, z, r: 0.8 }, x - 1, z - 1, x + 1, z + 1);
  }
  for (const t of things) {
    // round the whole of its base, whichever way it is turned
    const r = (Array.isArray(t.size) ? Math.hypot(t.size[0], t.size[1]) : t.size * Math.SQRT2) / 2 + 0.6;
    put({ x: t.x, z: t.z, r }, t.x - r, t.z - r, t.x + r, t.z + r);
  }
  const blocked = (x, z) => (cells.get(cell(x, z)) ?? []).some(o => (o.p ? inPolygon(x, z, o.p) : (x - o.x) ** 2 + (z - o.z) ** 2 < o.r * o.r));
  // a line cut up where it is blocked, every 1.5 m: the clear runs of it at least 8 m long
  const clear = points => {
    const runs = [];
    let run = [];
    const end = () => {
      let len = 0;
      for (let k = 1; k < run.length; k++) len += Math.hypot(run[k][0] - run[k - 1][0], run[k][1] - run[k - 1][1]);
      if (len >= 8) runs.push({ points: run, len });
      run = [];
    };
    for (let k = 1; k < points.length; k++) {
      const [ax, az] = points[k - 1], [bx, bz] = points[k], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 1.5));
      for (let i = k === 1 ? 0 : 1; i <= n; i++) {
        const x = ax + ((bx - ax) * i) / n, z = az + ((bz - az) * i) / n;
        if (blocked(x, z)) end();
        else run.push([x, z]);
      }
    }
    end();
    return runs;
  };
  const paths = [];
  const add = (points, weight) => { for (const run of clear(points)) paths.push({ points: run.points, closed: false, y: 0.03, weight: run.len * weight }); };
  for (const rd of pieces) {
    const b = how.get(map.names[rd.n]), kerb = rd.w / 2 + 0.65;
    // a footpath is walked along itself; a street along its pavements, and its middle where no cars come
    const offs = rd.foot ? [0] : b.free ? [kerb, 1.4, -1.4, -kerb] : [kerb, -kerb];
    for (const off of offs) add(alongside(rd.p, off), b.weight);
  }
  // across the squares: from a point on one of its streets to another 20 to 100 m off, wherever
  // that goes clear all the way
  for (const b of busy.streets) {
    if (!b.across) continue;
    const spots = pieces.filter(rd => !rd.foot && map.names[rd.n] === b.street).flatMap(rd => alongside(rd.p, 0));
    for (let n = 0, tries = 0; n < b.across && tries < b.across * 60 && spots.length > 1; tries++) {
      const a = spots[Math.floor(rand() * spots.length)], c = spots[Math.floor(rand() * spots.length)], d = Math.hypot(c[0] - a[0], c[1] - a[1]);
      if (d < 20 || d > 100) continue;
      const runs = clear([a, c]);
      if (runs.length !== 1 || runs[0].len < d - 0.1) continue;
      paths.push({ points: [a, c], closed: false, y: 0.03, weight: d * b.weight });
      n++;
    }
  }
  // all together as many as `walkers`
  const total = paths.reduce((n, p) => n + p.weight, 0);
  for (const p of paths) p.weight *= walkers / total;
  return paths;
}

const mat = color => new THREE.MeshStandardMaterial({ color, roughness: 0.8 });

// parts: name -> [geometry, material, instances per walker or dog]
function makeParts(group, people, dogs) {
  const P = (geo, n, count) => {
    const im = new THREE.InstancedMesh(geo, mat(0xffffff), Math.max(1, count * n));
    im.count = count * n; // none drawn when nobody has one
    im.castShadow = true;
    im.frustumCulled = false; // they move about
    group.add(im);
    return im;
  };
  return {
    leg: P(new THREE.BoxGeometry(0.14, 0.82, 0.15).translate(0, -0.41, 0), 2, people),
    torso: P(new THREE.BoxGeometry(0.42, 0.62, 0.24), 1, people),
    arm: P(new THREE.BoxGeometry(0.1, 0.58, 0.11).translate(0, -0.29, 0), 2, people),
    head: P(new THREE.SphereGeometry(0.15, 8, 6), 1, people),
    hair: P(new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), 1, people),
    paint: P(new THREE.BoxGeometry(0.2, 0.5, 0.27), 1, people), // blue paint on one side of the chest, once hit
    dogBody: P(new THREE.BoxGeometry(0.26, 0.26, 0.62), 1, dogs),
    dogHead: P(new THREE.BoxGeometry(0.22, 0.22, 0.28), 1, dogs),
    dogLeg: P(new THREE.BoxGeometry(0.08, 0.32, 0.08).translate(0, -0.16, 0), 4, dogs),
    tail: P(new THREE.BoxGeometry(0.05, 0.05, 0.28).translate(0, 0, -0.14), 1, dogs),
    lead: P(new THREE.BoxGeometry(0.02, 0.02, 1), 1, dogs),
  };
}

export class People {
  // paths: [{ points, closed, y, runners? }], count walkers spread over them; a path with runners
  // gets that many more, running, besides
  // relief: the bridges (js/relief.js), for walking over them
  constructor(group, paths, count, rand, relief = null) {
    this.relief = relief;
    // a path's weight: how many walkers it gets, compared with the others
    this.paths = paths.filter(p => p.points.length > 1).map(p => ({ ...makePath(p.points, p.closed), y: p.y ?? 0, weight: p.weight ?? (p.runners ? 0 : 1), runners: p.runners ?? 0, who: p.who, stash: p.stash }));
    const pick = a => a[Math.floor(rand() * a.length)];
    this.walkers = [];
    const walked = this.paths.filter(p => p.weight > 0), total = walked.reduce((n, p) => n + p.weight, 0);
    for (let k = 0; k < count && walked.length; k++) {
      let w = rand() * total;
      const path = walked.find(p => (w -= p.weight) < 0) ?? walked[0], kid = rand() < 0.15;
      this.walkers.push({
        path, s: rand() * path.length, dir: rand() < 0.5 ? 1 : -1, speed: (kid ? 1.5 : 1.1) + rand() * 0.5,
        scale: kid ? 0.68 : 0.92 + rand() * 0.16, off: 0, phase: rand() * 6,
        dog: !kid && rand() < 0.32 ? { color: pick(DOGS), size: 0.75 + rand() * 0.5 } : null,
        colors: { shirt: pick(SHIRTS), pants: pick(PANTS), skin: pick(SKINS), hair: pick(HAIRS) },
      });
    }
    // the runners: all one way round, in sports gear, at a jogger's pace or a bit quicker
    for (const path of this.paths) {
      for (let k = 0; k < path.runners; k++) {
        this.walkers.push({
          path, s: rand() * path.length, dir: 1, speed: 2.6 + rand() * 1.6, run: true,
          scale: 0.92 + rand() * 0.16, off: (rand() - 0.5) * 1.6, phase: rand() * 6, dog: null,
          colors: { shirt: pick([0xff4081, 0x00e5ff, 0xc6ff00, 0xff6d00, 0xffffff, 0x212121, 0x2979ff]), pants: pick([0x212121, 0x263238, 0x1a237e]), skin: pick(SKINS), hair: pick(HAIRS) },
        });
      }
    }
    // the characters: one each, somewhere along their street, never in a hurry
    for (const path of this.paths.filter(p => p.who)) {
      const { who } = path;
      this.walkers.push({
        path, s: rand() * path.length, dir: rand() < 0.5 ? 1 : -1, speed: who.speed ?? 1, scale: who.scale ?? 1, off: 0, phase: rand() * 6,
        dog: null, colors: who.colors, figure: createFigure(who),
      });
      group.add(this.walkers.at(-1).figure.group);
      // and their things, on the pavement beside their path (main.js finds the spot)
      if (path.stash) {
        const pile = createStash(who.bags ?? [0xf2f2ee], 3);
        pile.position.set(path.stash.x, path.y, path.stash.z);
        pile.rotation.y = path.stash.yaw;
        group.add(pile);
      }
    }
    const dogs = this.walkers.filter(w => w.dog).length;
    this.parts = makeParts(group, this.walkers.length, dogs);
    // colours never change: set them once
    const c = new THREE.Color(), set = (im, i, hex) => im.setColorAt(i, c.setHex(hex));
    let d = 0;
    this.walkers.forEach((w, i) => {
      for (const s of [0, 1]) { set(this.parts.leg, i * 2 + s, w.colors.pants); set(this.parts.arm, i * 2 + s, w.colors.shirt); }
      set(this.parts.torso, i, w.colors.shirt);
      set(this.parts.head, i, w.colors.skin);
      set(this.parts.hair, i, w.colors.hair);
      set(this.parts.paint, i, 0x1e66f5);
      this.parts.paint.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
      if (!w.dog) return;
      w.dog.i = d;
      for (const part of ['dogBody', 'dogHead', 'tail']) set(this.parts[part], d, w.dog.color);
      for (let q = 0; q < 4; q++) set(this.parts.dogLeg, d * 4 + q, w.dog.color);
      set(this.parts.lead, d, 0xc62828);
      d++;
    });
    // the characters have their own figure: their boxes stay folded away to nothing
    const none = new THREE.Matrix4().makeScale(0, 0, 0);
    this.walkers.forEach((w, i) => {
      if (!w.figure) return;
      for (const s of [0, 1]) { this.parts.leg.setMatrixAt(i * 2 + s, none); this.parts.arm.setMatrixAt(i * 2 + s, none); }
      for (const part of ['torso', 'head', 'hair']) this.parts[part].setMatrixAt(i, none);
    });
    this.m = new THREE.Matrix4();
    this.local = new THREE.Matrix4();
    this.tmp = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.e = new THREE.Euler();
    this.fe = new THREE.Euler(); // for the ones who fall over (yaw first, then tipping over)
    this.v = new THREE.Vector3();
    this.one = new THREE.Vector3(1, 1, 1);
  }

  // set instance i of part to base matrix * (position, rotation)
  pose(part, i, base, x, y, z, rx = 0, ry = 0) {
    this.local.compose(this.v.set(x, y, z), this.q.setFromEuler(this.e.set(rx, ry, 0)), this.one.set(1, 1, 1));
    this.parts[part].setMatrixAt(i, this.tmp.multiplyMatrices(base, this.local));
  }

  // Where one of the characters (city.js CHARACTERS) is, by name: { x, z }, or null.
  where(name) {
    const w = this.walkers.find(w => w.path.who?.name === name);
    return w ? w.path.at(w.s) : null;
  }

  // Put a character on the point of their path nearest [x, z], walking on towards [tx, tz].
  put(name, [x, z], [tx, tz]) {
    const w = this.walkers.find(w => w.path.who?.name === name);
    if (!w) return;
    let best = Infinity;
    for (let s = 0; s <= w.path.length; s += 0.5) {
      const p = w.path.at(s), d = Math.hypot(p.x - x, p.z - z);
      if (d < best) { best = d; w.s = s; }
    }
    const p = w.path.at(w.s);
    w.dir = p.dx * (tx - p.x) + p.dz * (tz - p.z) >= 0 ? 1 : -1;
  }

  // A paintball flying from (x0, z0) to (x1, z1) at height y: the first walker it hits (the city's
  // characters too) is covered in blue and falls over, and stays down until resetHits. Generous in
  // height, as js/splat.js. Returns { x, y, z } or null.
  paintHit(x0, z0, x1, z1, y) {
    const dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz || 1;
    let best = null, bu = Infinity;
    this.walkers.forEach((w, i) => {
      if (w.hitT !== undefined || w.x === undefined) return;
      const u = Math.max(0, Math.min(1, ((w.x - x0) * dx + (w.z - z0) * dz) / L2));
      const h = y - (w.path.y + (w.up ?? 0));
      if (u < bu && Math.hypot(w.x - x0 - dx * u, w.z - z0 - dz * u) < 0.55 * w.scale + 0.3 && h > -1.2 && h < 1.9 * w.scale + 0.9) { best = { w, i }; bu = u; }
    });
    if (!best) return null;
    const { w, i } = best, c = new THREE.Color(0x1e66f5);
    w.hitT = 0;
    // on the side facing the shooter: half the chest and that arm
    w.paintSide = (x0 - w.x) * Math.cos(w.yaw ?? 0) - (z0 - w.z) * Math.sin(w.yaw ?? 0) >= 0 ? 1 : -1;
    if (w.figure) {
      // a character: a splash of blue on the chest, on the shooter's side
      w.splash = new THREE.Mesh(SPLASH, new THREE.MeshStandardMaterial({ color: 0x1e66f5, roughness: 0.5 }));
      w.splash.position.set(w.paintSide * 0.1, 1.2, 0.16);
      w.splash.scale.set(0.16, 0.18, 0.06);
      w.figure.group.add(w.splash);
      w.figure.group.rotation.order = 'YXZ';
    } else {
      this.parts.arm.setColorAt(i * 2 + (w.paintSide > 0 ? 1 : 0), c);
      this.parts.arm.instanceColor.needsUpdate = true;
    }
    return { x: w.x, y: y, z: w.z };
  }

  // A new round: everyone knocked over (by paint, or by a borrowed car) is up and walking again.
  resetHits() {
    const c = new THREE.Color();
    this.walkers.forEach((w, i) => {
      if (w.hitT === undefined) return;
      w.hitT = undefined;
      w.paintSide = 0;
      if (w.figure) {
        w.splash?.removeFromParent();
        w.splash = null;
        w.figure.group.rotation.x = 0;
        return;
      }
      for (const k of [0, 1]) this.parts.arm.setColorAt(i * 2 + k, c.setHex(w.colors.shirt));
      this.parts.arm.instanceColor.needsUpdate = true;
      this.parts.paint.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
      this.parts.paint.instanceMatrix.needsUpdate = true;
    });
  }

  // onBump(rider, x, y, z): a horse ran into this walker, who shouts from (x, y, z)
  // onBark(rider, size): a dog barks at a horse going past
  update(dt, t, riders, onBump, onBark) {
    const base = this.m, M = new THREE.Matrix4();
    this.walkers.forEach((w, i) => {
      w.cool = Math.max(0, (w.cool ?? 0) - dt);
      if (w.dog) w.dog.barkCool = Math.max(0, (w.dog.barkCool ?? 0) - dt), w.dog.yap = Math.max(0, (w.dog.yap ?? 0) - dt);
      // step aside for a horse coming close
      let p = w.path.at(w.s);
      const nx = p.dz, nz = -p.dx;
      let target = 0;
      const struck = w.hitT !== undefined;
      if (struck) w.hitT += dt;
      const fall = struck ? Math.min(1, Math.max(0, (w.hitT - 0.5) * 2.5)) : 0; // a moment's staggering, then down
      if (!struck) for (const r of riders) {
        const dx = r.pos.x - p.x, dz = r.pos.z - p.z;
        if (dx * dx + dz * dz < 16) target = (dx * nx + dz * nz > 0 ? -1 : 1) * 1.1;
      }
      if (w.dog && !w.dog.barkCool) {
        const r = riders.find(o => (o.pos.x - p.x) ** 2 + (o.pos.z - p.z) ** 2 < 36);
        if (r) {
          w.dog.barkCool = 3 + Math.random() * 2;
          w.dog.yap = 0.5;
          onBark?.(r, w.dog.size);
        }
      }
      w.off += Math.max(-dt * 3, Math.min(dt * 3, target - w.off));
      const hurry = struck ? 0 : Math.abs(target) > 0 ? 0.3 : 1;
      w.s += w.dir * w.speed * hurry * dt;
      if (!w.path.closed && (w.s <= 0 || w.s >= w.path.length)) w.dir = -w.dir;
      p = w.path.at(w.s);
      // a borrowed car coming at them: a quick leap aside, out of its way (and back onto the pavement after)
      if (!struck && !w.leap && w.x !== undefined) {
        for (const r of riders) {
          if (!r.car || Math.abs(r.speed) < 3) continue;
          const fx = Math.sin(r.yaw) * Math.sign(r.speed), fz = Math.cos(r.yaw) * Math.sign(r.speed);
          const ax = w.x - r.pos.x, az = w.z - r.pos.z, ahead = ax * fx + az * fz, side = ax * fz - az * fx;
          if (ahead > -1 && ahead < 3 + Math.abs(r.speed) * 0.7 && Math.abs(side) < 2.6) {
            const away = (side === 0 ? (Math.random() < 0.5 ? 1 : -1) : Math.sign(side)) * (3.6 - Math.abs(side));
            w.leap = { t: 0, x: fz * away, z: -fx * away };
            w.lx ??= 0; w.lz ??= 0;
            w.leap.x0 = w.lx; w.leap.z0 = w.lz;
            break;
          }
        }
      }
      let hop = 0;
      if (w.leap) {
        const L = w.leap;
        L.t += dt;
        const k = Math.min(1, L.t / LEAP);
        w.lx = L.x0 + L.x * Math.sin((k * Math.PI) / 2);
        w.lz = L.z0 + L.z * Math.sin((k * Math.PI) / 2);
        hop = k < 1 ? Math.sin(k * Math.PI) * 0.55 : 0;
        if (L.t > LEAP + 1.5) w.leap = null; // a moment to get over the fright
      } else if (w.lx) {
        // drifting back onto the path
        const back = Math.max(0, 1 - dt * 0.8);
        w.lx *= back; w.lz *= back;
        if (Math.abs(w.lx) + Math.abs(w.lz) < 0.02) w.lx = w.lz = 0;
      }
      const yaw = Math.atan2(p.dx * w.dir, p.dz * w.dir), x = p.x + nx * w.off + (w.lx ?? 0), z = p.z + nz * w.off + (w.lz ?? 0);
      w.x = x;
      w.z = z;
      w.yaw = yaw;
      // run over by a borrowed car at speed (only those who couldn't leap clear): down they go
      const car = !struck && !hop && riders.find(o => o.car && Math.abs(o.speed) > 4 && o.y < 1.6 && (o.pos.x - x) ** 2 + (o.pos.z - z) ** 2 < 1.7 * 1.7);
      if (car) {
        w.hitT = 0;
        onBump?.(car, x, w.path.y + (w.up ?? 0) + 2.3 * w.scale, z);
        return;
      }
      if (!w.cool && !struck) {
        const r = riders.find(o => o.y < 1.6 && (o.pos.x - x) ** 2 + (o.pos.z - z) ** 2 < 1.3 * 1.3);
        if (r) {
          w.cool = 4;
          onBump?.(r, x, w.path.y + (w.up ?? 0) + 2.3 * w.scale, z);
        }
      }
      w.up = this.relief ? this.relief.at(x, z, w.up ?? 0) : 0;
      const stride = w.run ? 2.7 : 5.2, reach = w.run ? 0.85 : 0.55;
      const step = t * w.speed * stride + w.phase, swing = Math.sin(step) * reach * hurry, bob = struck ? 0 : Math.abs(Math.cos(step)) * (w.run ? 0.09 : 0.04);
      if (w.figure) {
        w.figure.walk(x, w.path.y + w.up + hop, z, yaw, w.scale, step, hurry, bob);
        if (struck) w.figure.group.rotation.x = -fall * 1.5; // knocked over: down on their back
        return;
      }
      base.compose(this.v.set(x, w.path.y + w.up + bob + hop + 0.12 * w.scale * fall, z), this.q.setFromEuler(this.fe.set(-fall * 1.5, yaw, 0, 'YXZ')), this.one.set(w.scale, w.scale, w.scale));
      this.pose('leg', i * 2, base, -0.1, 0.85, 0, swing);
      this.pose('leg', i * 2 + 1, base, 0.1, 0.85, 0, -swing);
      this.pose('torso', i, base, 0, 1.16, 0);
      if (w.paintSide) this.pose('paint', i, base, w.paintSide * 0.12, 1.16, 0.004);
      // the dog's side holds the lead; a runner's arms are bent and pump
      const arm = w.run ? -0.9 : 0;
      this.pose('arm', i * 2, base, -0.28, 1.42, 0, w.dog ? -0.6 : arm - swing * 0.8);
      this.pose('arm', i * 2 + 1, base, 0.28, 1.42, 0, arm + swing * 0.8);
      this.pose('head', i, base, 0, 1.63, 0);
      this.pose('hair', i, base, 0, 1.67, -0.01);
      if (!w.dog) return;
      // the dog trots beside, a little ahead (0.75 m to the walker's local -x side)
      const d = w.dog.i, s = w.dog.size;
      const dx = x - Math.cos(yaw) * 0.75 + Math.sin(yaw) * 0.6, dz = z + Math.sin(yaw) * 0.75 + Math.cos(yaw) * 0.6;
      M.compose(this.v.set(dx, w.path.y + w.up, dz), this.q.setFromEuler(this.e.set(0, yaw, 0)), this.one.set(s, s, s));
      const trot = Math.sin(t * w.speed * 9 + w.phase) * 0.6 * hurry;
      this.pose('dogBody', d, M, 0, 0.42, 0);
      const yap = w.dog.yap > 0 ? Math.abs(Math.sin(w.dog.yap * 25)) : 0; // the head jerks up with each woof
      this.pose('dogHead', d, M, 0, 0.58 + yap * 0.06, 0.4, -yap * 0.5);
      [[-0.09, 0.22, trot], [0.09, 0.22, -trot], [-0.09, -0.22, -trot], [0.09, -0.22, trot]].forEach(([lx, lz, a], q) => this.pose('dogLeg', d * 4 + q, M, lx, 0.32, lz, a));
      this.pose('tail', d, M, 0, 0.5, -0.3, -0.6, Math.sin(t * 12 + w.phase) * 0.6);
      // the lead, from the hand to the collar
      const hx = x - Math.cos(yaw) * 0.3 * w.scale, hz = z + Math.sin(yaw) * 0.3 * w.scale, hy = w.path.y + w.up + 0.85 * w.scale;
      const cx = dx + Math.sin(yaw) * 0.3 * s, cz = dz + Math.cos(yaw) * 0.3 * s, cy = w.path.y + w.up + 0.55 * s;
      const L = Math.hypot(cx - hx, cy - hy, cz - hz);
      const lead = this.leadDummy ??= new THREE.Object3D();
      lead.position.set((hx + cx) / 2, (hy + cy) / 2, (hz + cz) / 2);
      lead.lookAt(cx, cy, cz);
      lead.scale.set(1, 1, L);
      lead.updateMatrix();
      this.parts.lead.setMatrixAt(d, lead.matrix);
    });
    for (const im of Object.values(this.parts)) im.instanceMatrix.needsUpdate = true;
  }
}
