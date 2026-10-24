import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LOW_POWER } from './device.js';

// Cyclists pedalling along the raced street, slower than the horses: ride round them, or jump them.
// Ride into one and both of you go down.

const JACKETS = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xff7043, 0x8e24aa, 0x26c6da, 0xf5f5f5];
const SKINS = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
const mat = (color, roughness = 0.7) => new THREE.MeshStandardMaterial({ color, roughness });

function add(parent, geo, material, x, y, z) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}

// A bike with its rider, facing +z.
function createBiker(k) {
  const root = new THREE.Group(), lean = new THREE.Group();
  root.add(lean);
  const frame = mat([0x37474f, 0xc62828, 0x1565c0, 0x2e7d32][k % 4], 0.4), tyre = mat(0x1d1a17, 0.9);
  const wheelGeo = new THREE.TorusGeometry(0.34, 0.045, 6, 18).rotateY(Math.PI / 2);
  const wheels = [0.55, -0.55].map(z => add(lean, wheelGeo, tyre, 0, 0.38, z));
  add(lean, new THREE.BoxGeometry(0.06, 0.06, 1.0), frame, 0, 0.62, 0);
  add(lean, new THREE.BoxGeometry(0.06, 0.55, 0.06), frame, 0, 0.62, -0.12).rotation.x = -0.25;
  add(lean, new THREE.BoxGeometry(0.06, 0.5, 0.06), frame, 0, 0.75, 0.48).rotation.x = 0.3;
  add(lean, new THREE.BoxGeometry(0.55, 0.05, 0.05), frame, 0, 1.0, 0.42); // handlebar
  add(lean, new THREE.BoxGeometry(0.2, 0.06, 0.28), mat(0x1d1a17), 0, 0.92, -0.2); // saddle
  const jacket = mat(JACKETS[k % JACKETS.length]), skin = mat(SKINS[(k * 3) % SKINS.length]), jeans = mat(0x3949ab);
  const body = add(lean, new THREE.BoxGeometry(0.42, 0.62, 0.26), jacket, 0, 1.3, -0.08);
  body.rotation.x = 0.35;
  add(lean, new THREE.SphereGeometry(0.15, 10, 8), skin, 0, 1.72, 0.06);
  add(lean, new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(JACKETS[(k + 3) % JACKETS.length], 0.4), 0, 1.76, 0.06);
  for (const x of [-0.2, 0.2]) {
    const arm = add(lean, new THREE.BoxGeometry(0.09, 0.09, 0.5), jacket, x, 1.28, 0.2);
    arm.rotation.x = 0.5;
  }
  const legs = [-0.12, 0.12].map(x => {
    const hip = new THREE.Group();
    hip.position.set(x, 0.95, -0.18);
    lean.add(hip);
    add(hip, new THREE.BoxGeometry(0.12, 0.6, 0.13), jeans, 0, -0.3, 0.05);
    return hip;
  });
  root.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
  return { root, lean, wheels, legs };
}

// A long tail, the cargo bike Ghent's parents take their children to school on, facing +z: smaller
// wheels set further apart, a low step-through frame with its battery on the down tube, and behind
// the saddle a long deck with a rail round it to hold on to, footboards and a black bag either side.
// The frame is white where it takes the bike's colour and dark (its vertex colour) where it does not.
export const LONG_TAIL = { wheel: 0.3, axles: [0.66, -0.74] };
let longTailGeo = null;
export function longTailFrame() {
  if (longTailGeo) return longTailGeo;
  const part = (g, dark = false) => {
    const c = dark ? 0.09 : 1, n = g.attributes.position.count;
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(n * 3).fill(c), 3));
    return g.index ? g.toNonIndexed() : g;
  };
  const box = (w, h, d, x, y, z, rx = 0, dark = false) => part(new THREE.BoxGeometry(w, h, d).rotateX(rx).translate(x, y, z), dark);
  longTailGeo = mergeGeometries([
    box(0.06, 0.06, 0.8, 0, 0.56, 0.24, 0.62), // the step-through down tube, from the head down to the cranks
    box(0.09, 0.1, 0.36, 0, 0.6, 0.27, 0.62, true), // the battery on it
    box(0.05, 0.05, 0.78, 0, 0.36, -0.36), // the chain stay to the back wheel
    box(0.06, 0.6, 0.06, 0, 0.6, -0.1, -0.25), // the seat tube
    box(0.06, 0.72, 0.06, 0, 0.62, 0.6, 0.3), // the fork and head tube
    box(0.06, 0.2, 0.06, 0, 1.02, 0.5, -0.4), // the stem, up and back
    box(0.6, 0.05, 0.05, 0, 1.08, 0.46, 0, true), // the handlebar
    box(0.22, 0.07, 0.28, 0, 0.92, -0.2, 0, true), // the saddle
    box(0.34, 0.04, 0.92, 0, 0.72, -0.78), // the deck
    ...[-0.19, 0.19].flatMap(x => [
      box(0.03, 0.03, 0.88, x, 1.0, -0.8), // the rail along the top
      ...[-0.36, -0.8, -1.22].map(z => box(0.03, 0.28, 0.03, x, 0.86, z)), // its posts
      box(0.08, 0.025, 0.6, x * 1.25, 0.32, -0.6), // the footboard
      box(0.05, 0.3, 0.62, x * 1.2, 0.54, -0.82, 0, true), // the bag
    ]),
    box(0.4, 0.03, 0.03, 0, 1.0, -1.22), // the rail across the back
  ]);
  return longTailGeo;
}

// Parked bikes, instanced: a frame in the bike's colour and two wheels. bikes: [{x, z, yaw, c, long?}],
// long: a long tail. There are tens of thousands across the city, so a phone parks half of them,
// with coarser wheels and no shadows.
export function addParkedBikes(group, bikes) {
  if (LOW_POWER) bikes = bikes.filter((_, k) => k % 2 === 0);
  const longs = bikes.filter(b => b.long);
  if (longs.length) {
    parkBikes(group, longs, longTailFrame(), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, vertexColors: true }), LONG_TAIL.wheel, LONG_TAIL.axles);
    bikes = bikes.filter(b => !b.long);
  }
  if (!bikes.length) return;
  const frameGeo = mergeGeometries([
    new THREE.BoxGeometry(0.06, 0.06, 1.0).translate(0, 0.62, 0),
    new THREE.BoxGeometry(0.06, 0.55, 0.06).rotateX(-0.25).translate(0, 0.62, -0.12),
    new THREE.BoxGeometry(0.06, 0.5, 0.06).rotateX(0.3).translate(0, 0.75, 0.48),
    new THREE.BoxGeometry(0.55, 0.05, 0.05).translate(0, 1.0, 0.42),
    new THREE.BoxGeometry(0.2, 0.06, 0.28).translate(0, 0.92, -0.2),
    new THREE.BoxGeometry(0.34, 0.04, 0.4).translate(0, 0.72, -0.62), // carrier over the back wheel
  ]);
  parkBikes(group, bikes, frameGeo, mat(0xffffff, 0.4), 0.34, [0.55, -0.55]);
}

// One kind of bike, parked: its frames in their colours, wheels of radius `wheel` at `axles` (z).
function parkBikes(group, bikes, frameGeo, frameMat, wheel, axles) {
  const d = new THREE.Object3D();
  const frames = new THREE.InstancedMesh(frameGeo, frameMat, bikes.length);
  const wheels = new THREE.InstancedMesh(new THREE.TorusGeometry(wheel, 0.045, LOW_POWER ? 3 : 4, LOW_POWER ? 8 : 10).rotateY(Math.PI / 2), mat(0x1d1a17, 0.9), bikes.length * 2);
  bikes.forEach((b, k) => {
    const y = (b.y ?? 0) + 0.03;
    d.position.set(b.x, y, b.z);
    d.rotation.set(0, b.yaw, 0.08); // leaning a little on the stand
    d.updateMatrix();
    frames.setMatrixAt(k, d.matrix);
    frames.setColorAt(k, new THREE.Color(b.c));
    axles.forEach((z, w) => {
      d.position.set(b.x + Math.sin(b.yaw) * z, y + wheel + 0.04, b.z + Math.cos(b.yaw) * z);
      d.updateMatrix();
      wheels.setMatrixAt(k * 2 + w, d.matrix);
    });
  });
  frames.castShadow = wheels.castShadow = !LOW_POWER;
  frames.userData.still = wheels.userData.still = true; // js/tiles.js cuts them up by where they stand
  group.add(frames, wheels);
}

export class Bikers {
  constructor(parent, count) {
    this.list = Array.from({ length: count }, (_, k) => {
      const model = createBiker(k);
      parent.add(model.root);
      return { model, k, idx: 0, s: 0, lat: 0, target: 0, speed: 6, state: 'ride', timer: 0, crank: k };
    });
  }

  // lane room for a bike at sample i: between the parked cars where there are any
  room(track, i) {
    return track.parking?.rowAt[i] >= 0 ? track.hw - 2.1 - 0.5 : track.hw - 1.2;
  }

  place(b, track, from, min, max) {
    b.idx = track.wrap(from + Math.round((min + Math.random() * (max - min)) / track.spacing));
    b.s = 0;
    const room = this.room(track, b.idx);
    b.lat = b.target = (Math.random() * 2 - 1) * room;
    b.speed = 5 + Math.random() * 2.5;
    b.state = 'ride';
    b.model.lean.rotation.z = 0;
  }

  reset(track, field) {
    const lead = Math.max(...field.map(r => r.idx));
    this.list.forEach((b, k) => this.place(b, track, lead, 90 + k * 140, 150 + k * 160));
  }

  // onHit(rider, bike) is called when a horse runs into a cyclist
  update(dt, t, track, field, onHit) {
    const sp = track.spacing;
    // where the field is: the horse furthest back, and the one in front
    let back = field[0], front = field[0];
    for (const r of field) {
      if (track.delta(back.idx, r.idx) < 0) back = r;
      if (track.delta(front.idx, r.idx) > 0) front = r;
    }
    for (const b of this.list) {
      if (b.state === 'fall') {
        b.timer += dt;
        b.model.lean.rotation.z = Math.min(1, b.timer / 0.35) * 1.45 * b.fallSide;
        if (b.timer > 2.2) this.place(b, track, front.idx, 160, 320);
      } else {
        // pedal on, now and then drifting to another spot in the lane
        b.s += b.speed * dt;
        const step = Math.floor(b.s / sp);
        b.s -= step * sp;
        b.idx = track.wrap(b.idx + step);
        const room = this.room(track, b.idx);
        if (Math.random() < dt * 0.3) b.target = (Math.random() * 2 - 1) * room;
        b.target = Math.max(-room, Math.min(room, b.target));
        b.lat += Math.max(-dt * 0.8, Math.min(dt * 0.8, b.target - b.lat));
        b.lat = Math.max(-room, Math.min(room, b.lat));
        b.crank += dt * b.speed * 1.6;
        // overtaken by everybody and left far behind: off to somewhere ahead of the race again
        if (track.delta(back.idx, b.idx) * sp < -40) this.place(b, track, front.idx, 160, 320);
      }
      const p = track.at(b.idx, b.lat), m = b.model;
      m.root.position.set(p.x, p.y + 0.08, p.z);
      m.root.rotation.y = track.yawAt(b.idx) + (b.target - b.lat) * 0.3;
      m.legs.forEach((leg, i) => { leg.rotation.x = Math.sin(b.crank + i * Math.PI) * 0.6 - 0.5; });
      for (const w of m.wheels) w.rotation.x -= dt * b.speed * 3 * (b.state === 'ride' ? 1 : 0);
      if (b.state !== 'ride') continue;
      for (const r of field) {
        if (r.y > 1.6 || r.invuln > 0) continue; // jumped clean over
        const dx = r.pos.x - p.x, dz = r.pos.z - p.z;
        if (dx * dx + dz * dz > 1.5 * 1.5) continue;
        b.state = 'fall';
        b.timer = 0;
        b.fallSide = Math.sign(b.lat - r.lat) || 1;
        onHit(r, b, p);
        break;
      }
    }
  }
}

// Cyclists riding about the busy old town (city.js BUSY), not tied to any race: along its streets
// both ways, on the right-hand side (in this game -z is north and +x east), turning off at each
// junction into whichever busy street, the busier the likelier, and turning round at a dead end.
// Ride into one and both of you go down. They look like the bikers above, but every part is one
// instanced mesh for all of them, posed again each frame, like the walkers (js/people.js).
export class Cyclists {
  // relief: the bridges (js/relief.js), to ride over them
  constructor(group, map, busy, count, relief = null) {
    this.relief = relief;
    const how = new Map(busy.streets.map(b => [b.street, b.weight]));
    const pieces = map.roads.filter(rd => !rd.foot && rd.p.length >= 4 && how.has(map.names[rd.n]));
    // the streets cut into stretches between junctions: where a point is shared by more than one piece
    const key = (x, z) => `${x},${z}`, shared = new Map();
    for (const rd of pieces) for (let k = 0; k < rd.p.length; k += 2) shared.set(key(rd.p[k], rd.p[k + 1]), (shared.get(key(rd.p[k], rd.p[k + 1])) ?? 0) + 1);
    this.edges = [];
    this.ends = new Map(); // junction -> the stretches that meet there
    for (const rd of pieces) {
      let pts = [[rd.p[0], rd.p[1]]];
      for (let k = 2; k < rd.p.length; k += 2) {
        pts.push([rd.p[k], rd.p[k + 1]]);
        if (k < rd.p.length - 2 && shared.get(key(rd.p[k], rd.p[k + 1])) < 2) continue;
        const cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        if (cum.at(-1) > 0.5) {
          const e = { pts, cum, len: cum.at(-1), half: rd.w / 2, weight: how.get(map.names[rd.n]), a: key(...pts[0]), b: key(...pts.at(-1)) };
          this.edges.push(e);
          for (const end of [e.a, e.b]) {
            if (!this.ends.has(end)) this.ends.set(end, []);
            this.ends.get(end).push(e);
          }
        }
        pts = [[rd.p[k], rd.p[k + 1]]];
      }
    }
    // spread out along the streets by their length
    const total = this.edges.reduce((n, e) => n + e.len, 0);
    this.list = [];
    for (let k = 0; k < count && total; k++) {
      let s = Math.random() * total;
      const e = this.edges.find(o => (s -= o.len) < 0) ?? this.edges[0];
      const b = {
        k, e, fwd: Math.random() < 0.5, s: Math.random() * e.len, speed: 4 + Math.random() * 2, state: 'ride', timer: 0, crank: k,
        lane: 0.45 + Math.random() * 0.2, nx: 0, nz: 0, x: 0, z: 0, yaw: 0, up: 0, lean: 0, fallSide: 1,
        colors: { frame: [0x37474f, 0xc62828, 0x1565c0, 0x2e7d32, 0xf5f5f5, 0x1d1a17][k % 6], jacket: JACKETS[(k * 5) % JACKETS.length], skin: SKINS[(k * 3) % SKINS.length], top: JACKETS[(k * 7 + 3) % JACKETS.length], legs: [0x3949ab, 0x212121, 0x5d4037, 0x546e7a][k % 4] },
      };
      this.list.push(b);
      this.place(b, 0, true);
    }
    const n = Math.max(1, this.list.length);
    const P = (geo, per, roughness = 0.7) => {
      const im = new THREE.InstancedMesh(geo, mat(0xffffff, roughness), n * per);
      im.count = this.list.length * per;
      im.castShadow = true;
      im.frustumCulled = false; // they move about
      group.add(im);
      return im;
    };
    this.parts = {
      frame: P(mergeGeometries([
        new THREE.BoxGeometry(0.06, 0.06, 1.0).translate(0, 0.62, 0),
        new THREE.BoxGeometry(0.06, 0.55, 0.06).rotateX(-0.25).translate(0, 0.62, -0.12),
        new THREE.BoxGeometry(0.06, 0.5, 0.06).rotateX(0.3).translate(0, 0.75, 0.48),
        new THREE.BoxGeometry(0.55, 0.05, 0.05).translate(0, 1.0, 0.42),
        new THREE.BoxGeometry(0.2, 0.06, 0.28).translate(0, 0.92, -0.2),
      ]), 1, 0.4),
      wheel: P(new THREE.TorusGeometry(0.34, 0.045, 6, 14).rotateY(Math.PI / 2), 2, 0.9),
      // the body leans forward over the bars, the arms reach for them
      body: P(mergeGeometries([
        new THREE.BoxGeometry(0.42, 0.62, 0.26).rotateX(0.35).translate(0, 1.3, -0.08),
        ...[-0.2, 0.2].map(x => new THREE.BoxGeometry(0.09, 0.09, 0.5).rotateX(0.5).translate(x, 1.28, 0.2)),
      ]), 1),
      head: P(new THREE.SphereGeometry(0.15, 8, 6).translate(0, 1.72, 0.06), 1),
      top: P(new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 1.76, 0.06), 1, 0.4),
      leg: P(new THREE.BoxGeometry(0.12, 0.6, 0.13).translate(0, -0.3, 0.05), 2),
    };
    // colours never change: set them once
    const c = new THREE.Color();
    this.list.forEach((b, i) => {
      this.parts.frame.setColorAt(i, c.setHex(b.colors.frame));
      for (const s of [0, 1]) this.parts.wheel.setColorAt(i * 2 + s, c.setHex(0x1d1a17));
      for (const s of [0, 1]) this.parts.leg.setColorAt(i * 2 + s, c.setHex(b.colors.legs));
      this.parts.body.setColorAt(i, c.setHex(b.colors.jacket));
      this.parts.head.setColorAt(i, c.setHex(b.colors.skin));
      this.parts.top.setColorAt(i, c.setHex(b.colors.top));
    });
    this.base = new THREE.Matrix4();
    this.local = new THREE.Matrix4();
    this.tmp = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.e = new THREE.Euler(0, 0, 0, 'YXZ');
    this.v = new THREE.Vector3();
    this.one = new THREE.Vector3(1, 1, 1);
  }

  // where b is along its stretch: { x, z } on the street's middle, and the way it rides (hx, hz)
  spot(b) {
    const { pts, cum, len } = b.e, s = b.fwd ? b.s : len - b.s;
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
    const a = pts[lo], c = pts[hi], L = cum[hi] - cum[lo] || 1, t = (s - cum[lo]) / L, sg = b.fwd ? 1 : -1;
    return { x: a[0] + (c[0] - a[0]) * t, z: a[1] + (c[1] - a[1]) * t, hx: ((c[0] - a[0]) / L) * sg, hz: ((c[1] - a[1]) / L) * sg };
  }

  // on to the next stretch at the junction ahead, any but the one it came along (turning round at a
  // dead end); snap: put it straight there, without easing over
  place(b, ds = 0, snap = false) {
    if (!snap) {
      const at = b.fwd ? b.e.b : b.e.a, ways = (this.ends.get(at) ?? []).filter(e => e !== b.e);
      if (!ways.length) b.fwd = !b.fwd;
      else {
        let w = Math.random() * ways.reduce((n, e) => n + e.weight, 0);
        b.e = ways.find(e => (w -= e.weight) < 0) ?? ways[0];
        b.fwd = b.e.a === at;
      }
      b.s = ds;
    }
    const p = this.spot(b);
    if (snap) {
      // its right-hand side: the way it rides turned a quarter clockwise, seen from above
      b.nx = -p.hz;
      b.nz = p.hx;
      b.x = p.x + b.nx * b.lane * b.e.half;
      b.z = p.z + b.nz * b.lane * b.e.half;
      b.yaw = Math.atan2(p.hx, p.hz);
    }
  }

  // set instance i of part to the bike's matrix * (position, tilt forward)
  pose(part, i, x, y, z, rx = 0) {
    this.local.compose(this.v.set(x, y, z), this.q.setFromEuler(this.e.set(rx, 0, 0)), this.one.set(1, 1, 1));
    this.parts[part].setMatrixAt(i, this.tmp.multiplyMatrices(this.base, this.local));
  }

  // onHit(rider, bike, { x, y, z }) is called when a horse runs into a cyclist
  update(dt, t, riders, onHit) {
    this.list.forEach((b, i) => {
      if (b.state === 'fall') {
        b.timer += dt;
        b.lean = Math.min(1, b.timer / 0.35) * 1.45 * b.fallSide;
        if (b.timer > 2.2) b.state = 'ride', b.lean = 0;
      } else {
        b.s += b.speed * dt;
        while (b.s > b.e.len) this.place(b, b.s - b.e.len);
        b.crank += dt * b.speed * 1.6;
      }
      // ease round onto the right-hand side of the new way, so a corner is a curve and not a jump
      const p = this.spot(b), k = Math.min(1, dt * 4);
      b.nx += (-p.hz - b.nx) * k;
      b.nz += (p.hx - b.nz) * k;
      const x = p.x + b.nx * b.lane * b.e.half, z = p.z + b.nz * b.lane * b.e.half;
      if (b.state === 'ride' && (x - b.x) ** 2 + (z - b.z) ** 2 > 1e-6) {
        const want = Math.atan2(x - b.x, z - b.z);
        b.yaw += Math.atan2(Math.sin(want - b.yaw), Math.cos(want - b.yaw)) * Math.min(1, dt * 8);
      }
      b.x = x;
      b.z = z;
      b.up = this.relief ? this.relief.at(x, z, b.up) : 0;
      const y = b.up + 0.03;
      if (b.state === 'ride') {
        for (const r of riders) {
          if (r.y > 1.6 || r.invuln > 0) continue; // jumped clean over
          const dx = r.pos.x - x, dz = r.pos.z - z;
          if (dx * dx + dz * dz > 1.5 * 1.5) continue;
          b.state = 'fall';
          b.timer = 0;
          // over away from the horse
          b.fallSide = dx * Math.cos(b.yaw) - dz * Math.sin(b.yaw) > 0 ? 1 : -1;
          onHit?.(r, b, { x, y, z });
          break;
        }
      }
      this.base.compose(this.v.set(x, y, z), this.q.setFromEuler(this.e.set(0, b.yaw, b.lean)), this.one.set(1, 1, 1));
      this.pose('frame', i, 0, 0, 0);
      this.pose('wheel', i * 2, 0, 0.38, 0.55);
      this.pose('wheel', i * 2 + 1, 0, 0.38, -0.55);
      this.pose('body', i, 0, 0, 0);
      this.pose('head', i, 0, 0, 0);
      this.pose('top', i, 0, 0, 0);
      for (const s of [0, 1]) this.pose('leg', i * 2 + s, s ? 0.12 : -0.12, 0.95, -0.18, Math.sin(b.crank + s * Math.PI) * 0.6 - 0.5);
    });
    for (const im of Object.values(this.parts)) im.instanceMatrix.needsUpdate = true;
  }
}
