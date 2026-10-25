import * as THREE from 'three';
import { tileOf } from './tiles.js';
import { SHIRTS, PANTS, SKINS, HAIRS } from './people.js';
import { SQUARES, MONUMENTS, PLACES, BEACHES } from './city.js';
import { inPolygon } from './collide.js';
import { sunk } from './hollows.js';

// People sitting down: on the café chairs, on the quay walls of the Graslei and the Korenlei with
// their legs over the water, on the steps down to it, on the cobbles of the squares and on the
// steps of a statue, and lying on their towels on the beaches. They look like the walkers (js/people.js), only seated: a thigh and a shin
// for each leg, so the knees bend. Every body part is one instanced mesh for all of them in a tile
// of the city; only the arms, the heads and the dangling legs move, and only near whoever is looking.

const NEAR = 90; // how close a camera comes before the sitters round it move
const GLASSES = [0xf2b233, 0xf2b233, 0x7b1e2b, 0xf5f1e8, 0xd8e6ee, 0x6d3b1e]; // beer, wine, a cup, water, cola

// How each kind of seat is sat on, round the hip: thigh and shin tilts (radians, - is forward and
// up), how far the body leans back, where the arms rest (rx forward/back, rz out), and how high
// the hip is above what is sat on.
const SEATS = {
  chair: { thigh: 0, shin: 0, lean: 0.05, arm: [-0.8, 0.08], hip: 0.075 },
  edge: { thigh: 0, shin: 0, lean: -0.04, arm: [0.12, 0.28], hip: 0.075 }, // hands on the stone beside them
  step: { thigh: 0, shin: -0.5, lean: 0, arm: [-0.75, 0.1], hip: 0.075 }, // elbows on the knees
  ground: { thigh: -0.6, shin: -0.74, lean: 0.28, arm: [0.5, 0.2], hip: 0.08 }, // leaning back on the hands
  lie: { thigh: Math.PI / 2, shin: 0, lean: 0, arm: [0, 0.14], hip: 0.12 }, // stretched out, the whole body rolled flat (s.roll)
};
const TOWELS = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xff7043, 0xf5f5f5, 0x26c6da, 0xec407a, 0x7e57c2];
const ACTS = ['drink', 'drink', 'talk', 'talk', 'look', 'phone'];

const mat = () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
const smooth = x => x * x * (3 - 2 * x);

// the seats: { x, y (of what is sat on), z, yaw (facing), seat }
function terraceSeats(ctx, out, glasses) {
  for (const c of ctx.chairs ?? []) {
    if (ctx.r() > 0.5) continue;
    const s = { x: c.x, y: 0.03 + 0.485, z: c.z, yaw: c.yaw ?? 0, seat: 'chair', table: true };
    out.push(s);
    // something to drink on the table in front, unless it is in the hand
    if (ctx.r() < 0.75) {
      const fx = Math.sin(s.yaw), fz = Math.cos(s.yaw), side = ctx.r() < 0.5 ? -0.12 : 0.12;
      glasses.push({ x: c.x + fx * 0.36 + fz * side, z: c.z + fz * 0.36 - fx * side, y: 0.03 + 0.76, c: GLASSES[Math.floor(ctx.r() * GLASSES.length)] });
    }
  }
}

// is (x, z) inside a building (only those near the old centre are looked at)
function indoors(map, cx, cz, R) {
  const near = map.buildings.filter(b => Math.hypot(b.p[0] - cx, b.p[1] - cz) < R + 60);
  return (x, z) => near.some(b => inPolygon(x, z, b.p));
}

// along the quays round the Graslei, close together; elsewhere in the old centre, now and then
function quaySeats(ctx, map, out) {
  const g = PLACES.find(p => p.name === 'Graslei'), k = PLACES.find(p => p.name === 'Korenmarkt');
  if (!g || !ctx.quays) return;
  const inside = indoors(map, g.x, g.z, 700), flights = ctx.flights ?? [];
  const taken = [];
  for (const q of ctx.quays) {
    const busy = Math.hypot(q.x - g.x, q.z - g.z) < 150 ? 0.45 : Math.hypot(q.x - k.x, q.z - k.z) < 700 ? 0.04 : 0;
    if (ctx.r() > busy) continue;
    if (flights.some(f => Math.hypot(f.x + f.ux * 1.5 - q.x, f.z + f.uz * 1.5 - q.z) < 4)) continue; // clear of the steps
    const n = 1 + Math.floor(ctx.r() * 3);
    for (let i = 0; i < n; i++) {
      const along = (i - (n - 1) / 2) * 0.6, x = q.x + q.ux * along - q.nx * 0.3, z = q.z + q.uz * along - q.nz * 0.3;
      if (inside(x, z) || ctx.track.distTo(x, z) < ctx.hw + 0.5 || taken.some(t => Math.hypot(t.x - x, t.z - z) < 0.55)) continue;
      const s = { x, y: 0.03, z, yaw: Math.atan2(q.nx, q.nz), seat: 'edge' };
      out.push(s);
      taken.push(s);
    }
  }
  // and a few on the steps down to the water, looking down them
  for (const f of flights) {
    if (Math.hypot(f.x - g.x, f.z - g.z) > 700) continue;
    for (let k = 0; k < 4; k++) {
      if (ctx.r() > 0.6) continue;
      const lx = (k + 0.5) * 0.5, lz = 0.3 + ctx.r() * 0.7, top = -(k / 6) * 1.3;
      out.push({ x: f.x + f.ux * lx + f.nx * lz, y: top, z: f.z + f.uz * lx + f.nz * lz, yaw: Math.atan2(f.ux, f.uz), seat: 'step' });
    }
  }
}

// groups sitting in a ring on the cobbles of the squares, clear of the raced streets
function squareSeats(ctx, map, out) {
  for (const sq of SQUARES) {
    const xs = sq.p.filter((_, i) => i % 2 === 0), zs = sq.p.filter((_, i) => i % 2 === 1);
    const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
    const inside = indoors(map, (x0 + x1) / 2, (z0 + z1) / 2, Math.max(x1 - x0, z1 - z0));
    for (let tries = 0, groups = 0; tries < 200 && groups < 7; tries++) {
      const cx = x0 + ctx.r() * (x1 - x0), cz = z0 + ctx.r() * (z1 - z0);
      if (!inPolygon(cx, cz, sq.p) || inside(cx, cz) || ctx.track.distTo(cx, cz) < ctx.hw + 4) continue;
      if (MONUMENTS.some(mo => Math.hypot(mo.x - cx, mo.z - cz) < 5)) continue; // not in among the bike racks
      const n = 2 + Math.floor(ctx.r() * 4), R = 0.7 + n * 0.15, a0 = ctx.r() * 6.3;
      for (let i = 0; i < n; i++) {
        const a = a0 + (i / n) * Math.PI * 2, x = cx + Math.sin(a) * R, z = cz + Math.cos(a) * R;
        out.push({ x, y: 0.046 - sunk(x, z), z, yaw: a + Math.PI, seat: 'ground' });
      }
      groups++;
    }
  }
}

// on the step round a statue's pedestal, looking out
function monumentSeats(ctx, out) {
  for (const mo of MONUMENTS) {
    if (!mo.seat) continue;
    const { half, y } = mo.seat, c = Math.cos(mo.turn ?? 0), s = Math.sin(mo.turn ?? 0);
    for (let side = 0; side < 4; side++) {
      for (let along = -half + 0.8; along < half - 0.6; along += 0.7) {
        if (ctx.r() > 0.3) continue;
        const a = side * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
        // local: out along +b from the middle, along the edge on a
        const la = along * ca + (half - 0.3) * sa, lb = -along * sa + (half - 0.3) * ca;
        out.push({ x: mo.x + la * c + lb * s, y, z: mo.z - la * s + lb * c, yaw: (mo.turn ?? 0) + a, seat: 'edge' });
      }
    }
  }
}

// on the balustrade of a grand bridge (the Sint-Michielsbrug), round the middle of it, facing the
// street with their legs over its side: its top stands 1.15 m over the deck, (w + 2.6) / 2 out
// from the middle of the street (js/scenery.js, raisedSides)
function bridgeSeats(ctx, map, out) {
  for (const rd of map.roads) {
    if (rd.br !== 3 || !rd.y) continue;
    const p = rd.p, off = (rd.w + 2.6) / 2 - 0.15;
    let len = 0;
    for (let k = 0; k + 3 < p.length; k += 2) len += Math.hypot(p[k + 2] - p[k], p[k + 3] - p[k + 1]);
    let at = 0;
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], L = Math.hypot(p[k + 2] - ax, p[k + 3] - az);
      if (L < 0.01) continue;
      const fx = (p[k + 2] - ax) / L, fz = (p[k + 3] - az) / L;
      for (let d = 0.6; d < L; d += 1.3) {
        const u = (at + d) / len;
        if (u < 0.35 || u > 0.65 || ctx.r() > 0.25) continue;
        const y = rd.y[k / 2] + (rd.y[k / 2 + 1] - rd.y[k / 2]) * (d / L) + 1.15;
        for (const side of [1, -1]) {
          if (ctx.r() > 0.6) continue;
          const nx = -fz * side, nz = fx * side; // out to this side
          out.push({ x: ax + fx * d + nx * off, y, z: az + fz * d + nz * off, yaw: Math.atan2(-nx, -nz), seat: 'edge' });
        }
      }
      at += L;
    }
  }
}

// on the chairs of a pavilion's terrace (the Kouter's blue kiosk, SGOL's down in the Emile
// Braunplein's hollow: a chair's y is how far its floor lies from the street), nearly all of them taken
function pavilionSeats(ctx, out, glasses) {
  for (const mo of MONUMENTS) {
    if (!mo.chairs) continue;
    const c = Math.cos(mo.turn ?? 0), s = Math.sin(mo.turn ?? 0);
    for (const ch of mo.chairs) {
      if (ctx.r() > 0.8) continue;
      const x = mo.x + ch.x * c + ch.z * s, z = mo.z - ch.x * s + ch.z * c, yaw = ch.yaw + (mo.turn ?? 0);
      const y = ch.y ?? 0;
      out.push({ x, y: y + 0.03 + 0.485, z, yaw, seat: 'chair', table: true });
      if (ctx.r() < 0.6) glasses.push({ x: x + Math.sin(yaw) * 0.36, z: z + Math.cos(yaw) * 0.36, y: y + 0.03 + 0.76, c: GLASSES[Math.floor(ctx.r() * GLASSES.length)] });
    }
  }
}

// on the beaches (the Blaarmeersen's): most stretched out on a towel, on their back or their front,
// some sitting up in little groups, never closer than an arm's length to the next towel; and in the
// shade of the parasols stuck in the sand (a monument's poles), most of them taken
function beachSeats(ctx, out) {
  const poles = MONUMENTS.flatMap(mo => mo.poles ?? []);
  for (const p of BEACHES ?? []) {
    const xs = p.filter((_, i) => i % 2 === 0), zs = p.filter((_, i) => i % 2 === 1);
    const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
    let area = 0;
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) area += p[j] * p[i + 1] - p[i] * p[j + 1];
    const want = Math.min(160, Math.abs(area) / 2 / 18), taken = [];
    for (const [px, pz] of poles) {
      if (!inPolygon(px, pz, p)) continue;
      taken.push([px, pz]);
      if (ctx.r() > 0.7) continue;
      const a = ctx.r() * Math.PI * 2, x = px + Math.cos(a) * 1.1, z = pz + Math.sin(a) * 1.1;
      out.push({ x, y: 0.02, z, yaw: a + Math.PI / 2, seat: 'lie', roll: ctx.r() < 0.6 ? -Math.PI / 2 : Math.PI / 2, towel: TOWELS[Math.floor(ctx.r() * TOWELS.length)] });
      taken.push([x, z]);
    }
    for (let tries = 0, n = 0; tries < want * 30 && n < want; tries++) {
      const x = x0 + ctx.r() * (x1 - x0), z = z0 + ctx.r() * (z1 - z0);
      if (!inPolygon(x, z, p) || taken.some(t => Math.hypot(t[0] - x, t[1] - z) < 2.4)) continue;
      taken.push([x, z]);
      const yaw = ctx.r() * Math.PI * 2;
      if (ctx.r() < 0.8) {
        out.push({ x, y: 0.02, z, yaw, seat: 'lie', roll: ctx.r() < 0.6 ? -Math.PI / 2 : Math.PI / 2, towel: TOWELS[Math.floor(ctx.r() * TOWELS.length)] });
        n++;
      } else {
        for (const side of [-1, 1]) out.push({ x: x + Math.cos(yaw) * side * 0.5, y: 0.02, z: z - Math.sin(yaw) * side * 0.5, yaw: yaw + side * 0.4, seat: 'ground' });
        n += 2;
      }
    }
  }
}

function makeParts(group, n, drinkers, glasses, towels) {
  const P = (geo, count, shadow = true) => {
    const im = new THREE.InstancedMesh(geo, mat(), Math.max(1, count));
    im.castShadow = shadow;
    group.add(im);
    return im;
  };
  return {
    thigh: P(new THREE.BoxGeometry(0.15, 0.15, 0.46).translate(0, 0, 0.23), n * 2, false),
    shin: P(new THREE.BoxGeometry(0.14, 0.46, 0.15).translate(0, -0.23, 0), n * 2),
    torso: P(new THREE.BoxGeometry(0.42, 0.62, 0.24), n),
    arm: P(new THREE.BoxGeometry(0.1, 0.58, 0.11).translate(0, -0.29, 0), n * 2),
    head: P(new THREE.SphereGeometry(0.15, 8, 6), n),
    hair: P(new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.04, -0.01), n, false),
    glass: P(new THREE.CylinderGeometry(0.035, 0.03, 0.12, 6), drinkers, false),
    tableGlass: P(new THREE.CylinderGeometry(0.035, 0.03, 0.12, 6).translate(0, 0.06, 0), glasses, false),
    towel: P(new THREE.BoxGeometry(0.9, 0.02, 1.9), towels, false),
  };
}

class Sitters {
  constructor(group, seats, glasses, r) {
    const pick = a => a[Math.floor(r() * a.length)];
    this.seats = seats;
    let d = 0;
    for (const s of seats) {
      Object.assign(s, {
        scale: 0.92 + r() * 0.16, phase: r() * 20, period: 6 + r() * 6, act: pick(ACTS), kick: s.seat === 'edge' && r() < 0.5,
        turn: (r() - 0.5) * 1.2, colors: { shirt: pick(SHIRTS), pants: pick(PANTS), skin: pick(SKINS), hair: pick(HAIRS) },
      });
      if (s.seat === 'lie') s.act = 'rest'; // sunbathing: nothing moves
      if (s.act === 'drink') s.glass = d++;
    }
    const towels = seats.filter(s => s.towel);
    this.parts = makeParts(group, seats.length, d, glasses.length, towels.length);
    this.m = new THREE.Matrix4();
    this.local = new THREE.Matrix4();
    this.tmp = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.e = new THREE.Euler();
    this.lying = new THREE.Euler(0, 0, 0, 'YXZ'); // rolled flat, then turned
    this.v = new THREE.Vector3();
    this.one = new THREE.Vector3(1, 1, 1);
    this.eyes = [];
    // colours never change, and neither do the thighs, the torsos and the glasses on the tables
    const c = new THREE.Color(), set = (im, i, hex) => im.setColorAt(i, c.setHex(hex));
    seats.forEach((s, i) => {
      for (const k of [0, 1]) { set(this.parts.thigh, i * 2 + k, s.colors.pants); set(this.parts.shin, i * 2 + k, s.colors.pants); set(this.parts.arm, i * 2 + k, s.colors.shirt); }
      set(this.parts.torso, i, s.colors.shirt);
      set(this.parts.head, i, s.colors.skin);
      set(this.parts.hair, i, s.colors.hair);
      if (s.glass != null) set(this.parts.glass, s.glass, pick(GLASSES));
      this.still(s, i);
      this.move(s, i, 0);
    });
    // the towels under the sunbathers, centred on the hip, along the body
    towels.forEach((s, i) => {
      this.m.compose(this.v.set(s.x, s.y + 0.01, s.z), this.q.setFromEuler(this.e.set(0, s.yaw, 0)), this.one.set(1, 1, 1));
      this.parts.towel.setMatrixAt(i, this.m);
      set(this.parts.towel, i, s.towel);
    });
    glasses.forEach((g, i) => {
      this.m.makeTranslation(g.x, g.y, g.z);
      this.parts.tableGlass.setMatrixAt(i, this.m);
      set(this.parts.tableGlass, i, g.c);
    });
    // the sitters move only near a camera that draws them: note where those cameras are
    this.parts.torso.onBeforeRender = (renderer, scene, camera) => { if (this.eyes.length < 4) this.eyes.push(camera.position.clone()); };
  }

  // the matrix of sitter s's hip: where, which way and how big (and, hit by a paintball, toppled
  // over sideways, off a chair onto the ground)
  base(s) {
    const k = SEATS[s.seat], fall = s.hitT === undefined ? 0 : smooth(Math.min(1, Math.max(0, (s.hitT - 0.25) * 2.5)));
    const turn = s.roll ? this.lying.set(s.roll, s.yaw, 0) : this.e.set(0, s.yaw, fall * s.fallSide * 1.35);
    const drop = s.seat === 'chair' ? 0.4 * fall : 0;
    this.m.compose(this.v.set(s.x, s.y + k.hip * s.scale - drop, s.z), this.q.setFromEuler(turn), this.one.set(s.scale, s.scale, s.scale));
  }

  // pose what never moves of sitter s (number i): the thighs and the torso
  still(s, i) {
    const k = SEATS[s.seat], a = k.lean;
    this.base(s);
    for (const side of [0, 1]) this.pose('thigh', i * 2 + side, side ? 0.1 : -0.1, 0, 0, k.thigh);
    this.pose('torso', i, 0, 0.31 * Math.cos(a), -0.31 * Math.sin(a), -a);
  }

  // a target for the paintball gun (js/splat.js) for each who sits up (not the sunbathers)
  targets() {
    return this.seats.flatMap((s, i) => s.seat === 'lie' ? [] : [{
      down: false,
      at: () => ({ x: s.x, y: s.y - (s.seat === 'chair' ? 0.5 : 0), z: s.z, h: (s.seat === 'chair' ? 1.45 : 1) * s.scale, r: 0.5 * s.scale + 0.3 }),
      hit: (x0, z0) => {
        // over to the side away from the shooter, blue on the side they were hit
        s.fallSide = (x0 - s.x) * Math.cos(s.yaw) - (z0 - s.z) * Math.sin(s.yaw) >= 0 ? 1 : -1; // +1: the shooter on their right (+x)
        s.hitT = 0;
        s.was ??= { act: s.act, kick: s.kick };
        s.act = 'look';
        s.kick = false;
        const c = new THREE.Color(0x1e66f5);
        this.parts.torso.setColorAt(i, c);
        this.parts.arm.setColorAt(i * 2 + (s.fallSide > 0 ? 1 : 0), c);
        this.parts.torso.instanceColor.needsUpdate = this.parts.arm.instanceColor.needsUpdate = true;
        this.falling = true;
      },
      reset: () => {
        // sitting up again, in their own colours
        const c = new THREE.Color();
        Object.assign(s, s.was ?? {}, { hitT: undefined });
        this.parts.torso.setColorAt(i, c.setHex(s.colors.shirt));
        for (const k of [0, 1]) this.parts.arm.setColorAt(i * 2 + k, c.setHex(s.colors.shirt));
        this.parts.torso.instanceColor.needsUpdate = this.parts.arm.instanceColor.needsUpdate = true;
        this.still(s, i);
        this.move(s, i, 0);
        for (const k of ['thigh', 'torso', 'shin', 'arm', 'head', 'hair', 'glass']) this.parts[k].instanceMatrix.needsUpdate = true;
      },
    }]);
  }

  // set instance i of part to the hip's matrix * (position, rotation)
  pose(part, i, x, y, z, rx = 0, ry = 0, rz = 0) {
    this.local.compose(this.v.set(x, y, z), this.q.setFromEuler(this.e.set(rx, ry, rz)), this.one.set(1, 1, 1));
    this.parts[part].setMatrixAt(i, this.tmp.multiplyMatrices(this.m, this.local));
  }

  // pose what moves of sitter s (number i) at time t: the shins, the arms, the head and a glass
  move(s, i, t) {
    const k = SEATS[s.seat], a = k.lean, ca = Math.cos(a), sa = Math.sin(a), T = t + s.phase;
    this.base(s);
    // a shin hangs from its knee; over the water they swing now and then
    const kx = 0, ky = -Math.sin(k.thigh) * 0.46, kz = Math.cos(k.thigh) * 0.46;
    for (const side of [0, 1]) {
      const swing = s.kick ? Math.sin(T * 1.7 + side * 2.2) * 0.3 - 0.1 : 0;
      this.pose('shin', i * 2 + side, (side ? 0.1 : -0.1) + kx, ky, kz, k.shin + swing);
    }
    // the arms rest, but now and then one lifts a glass, or gestures while talking, or both hold a phone
    let [rx, rz] = k.arm, R = [rx, rz], L = [rx, -rz], hx = 0, hy = 0;
    const lift = smooth(Math.max(0, Math.sin((T / s.period) * Math.PI * 2) * 2 - 1)); // 0 most of the time, up to 1
    if (s.act === 'drink') R = [rx + (-1.9 - rx) * lift, rz + (-0.35 - rz) * lift];
    else if (s.act === 'talk') {
      R = [rx - lift * (0.6 + Math.sin(T * 5) * 0.25), rz - lift * 0.2];
      hy = s.turn;
      hx = Math.sin(T * 3.1) * 0.06;
    } else if (s.act === 'phone') {
      R = [-1.1, -0.28];
      L = [-1.1, 0.28];
      hx = 0.45;
    } else if (s.act !== 'rest') hy = Math.sin(T * 0.35) * 0.8; // looking round
    if (s.act === 'drink') hx = -lift * 0.25; // the head tips back to drink
    const sy = 0.57 * ca, sz = -0.57 * sa;
    this.pose('arm', i * 2, -0.28, sy, sz, L[0], 0, L[1]);
    this.pose('arm', i * 2 + 1, 0.28, sy, sz, R[0], 0, R[1]);
    this.pose('head', i, 0, 0.78 * ca, -0.78 * sa, hx - a, hy);
    this.pose('hair', i, 0, 0.78 * ca, -0.78 * sa, hx - a, hy);
    if (s.glass == null) return;
    // the glass in the right hand, at the end of the arm
    const cz = Math.cos(R[1]);
    this.pose('glass', s.glass, 0.28 + 0.58 * Math.sin(R[1]), sy - 0.58 * cz * Math.cos(R[0]), sz - 0.58 * cz * Math.sin(R[0]) + 0.02);
  }

  update(dt, t) {
    // those hit by a paintball, on their way down
    if (this.falling) {
      this.falling = false;
      this.seats.forEach((s, i) => {
        if (s.hitT === undefined || s.hitT > 1) return;
        s.hitT += dt;
        this.falling = true;
        this.still(s, i);
        this.move(s, i, t);
      });
      for (const k of ['thigh', 'torso', 'shin', 'arm', 'head', 'hair', 'glass']) this.parts[k].instanceMatrix.needsUpdate = true;
    }
    const eyes = this.eyes;
    if (!eyes.length) return; // nobody looking
    let moved = false;
    this.odd = !this.odd; // half of them each frame: they move slowly
    this.seats.forEach((s, i) => {
      if ((i & 1) === +this.odd || !eyes.some(e => (e.x - s.x) ** 2 + (e.z - s.z) ** 2 < NEAR * NEAR)) return;
      this.move(s, i, t);
      moved = true;
    });
    if (this.odd) this.eyes = [];
    if (!moved) return;
    for (const k of ['shin', 'arm', 'head', 'hair', 'glass']) this.parts[k].instanceMatrix.needsUpdate = true;
  }
}

// Seat people all over the city: ctx.chairs, ctx.quays and ctx.flights come from js/scenery.js.
export function addSitters(ctx, map) {
  const seats = [], glasses = [];
  terraceSeats(ctx, seats, glasses);
  quaySeats(ctx, map, seats);
  squareSeats(ctx, map, seats);
  monumentSeats(ctx, seats);
  bridgeSeats(ctx, map, seats);
  pavilionSeats(ctx, seats, glasses);
  beachSeats(ctx, seats);
  if (!seats.length) return null;
  // a crowd per tile of the city (js/tiles.js): only those near the camera are drawn, and move
  const tiles = new Map(), at = it => tileOf(ctx.group, it.x, it.z);
  for (const [k, list] of [[0, seats], [1, glasses]]) {
    for (const it of list) {
      if (!tiles.has(at(it))) tiles.set(at(it), [[], []]);
      tiles.get(at(it))[k].push(it);
    }
  }
  const crowds = [...tiles].filter(([, [here]]) => here.length).map(([tile, [here, gl]]) => new Sitters(tile, here, gl, ctx.r));
  ctx.updaters.push((dt, t) => { for (const c of crowds) c.update(dt, t); });
  for (const c of crowds) ctx.targets?.push(...c.targets());
  return crowds;
}
