// The tour: the camera flies along a city's TOUR (see ghent/tour.js) over the streets, slows down at
// each stop for a card about what is there, and shows the name of the street below in passing.
// Played on its own (auto: each card stays a while, then the flight goes on) or interactively (the
// flight waits at each card until it is clicked away). No three.js in here: main.js points the
// camera where view() says.

const CRUISE = 30; // m/s along the path between the stops
const ACCEL = 7, DECEL = 4.5; // m/s², setting off from a stop and slowing down for the next
const PASS = 9; // m/s past a stop on autoplay, where it does not stop but slows down to look
const BRAKE = 12; // m/s² slowing down when told to wait (a card hovered on autoplay)
const WELCOME = 6; // seconds the welcome shows at the start, before it sets off properly
const CREEP = 4.8; // m/s it drifts forward meanwhile
const LOOK_AHEAD = 55; // metres ahead along the path the camera looks while flying
const TURN_IN = 90, TURN_OUT = 50; // metres before and after a stop over which the view turns to it and back
// Between two stops the camera climbs high over the roofs, and swoops back down for the next one
// (and at the start and the end of the path, down to the street itself).
const SOAR = 42; // metres higher than the path, at most, halfway between two stops
const SOAR_FROM = 25, SOAR_OVER = 140; // metres from a stop where the climb starts, and over which it gets there
const BANK = 0.22, BANK_MAX = 0.32; // roll into the bends: radians per radian a second of turning, and at most
const CARD_IN = 45, CARD_OUT = 55; // the card shows this far before a stop, and (auto) this far after it, in metres
const LOW_EASE = 60; // metres over which the camera climbs out of a low stretch, or comes down into it
const NAME_FOR = 60; // metres a street's name stays up after it is passed
const PACE = 1.5; // how much faster than the speeds above it all goes at 1x (the speed button: 0.5x to 1.5x of that)
// The camera turns to what it looks at like on a spring, never faster than TURN_MAX, so no bend or
// glance swings it round abruptly.
const AIM = 2.6, TURN_MAX = 1.3; // the spring's stiffness (1/s), and radians a second at most

const smooth = k => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));

// Centripetal Catmull-Rom through the path's points, sampled every metre or so: [{ x, y, z, s }],
// s the distance along it. y is the height, eased between the points that give one.
function sample(path, height) {
  let h = height;
  const P = path.map(([x, z, y]) => ({ x, z, y: (h = y ?? h) }));
  const out = [];
  let s = 0;
  for (let i = 0; i + 1 < P.length; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    const knot = (a, b) => Math.max(1e-3, Math.sqrt(Math.hypot(b.x - a.x, b.z - a.z)));
    const t1 = knot(p0, p1), t2 = t1 + knot(p1, p2), t3 = t2 + knot(p2, p3);
    const n = Math.max(2, Math.ceil(Math.hypot(p2.x - p1.x, p2.z - p1.z)));
    for (let k = i ? 1 : 0; k <= n; k++) {
      const t = t1 + (t2 - t1) * (k / n);
      const at = key => {
        const a1 = ((t1 - t) * p0[key] + t * p1[key]) / t1;
        const a2 = ((t2 - t) * p1[key] + (t - t1) * p2[key]) / (t2 - t1);
        const a3 = ((t3 - t) * p2[key] + (t - t2) * p3[key]) / (t3 - t2);
        const b1 = ((t2 - t) * a1 + t * a2) / t2;
        const b2 = ((t3 - t) * a2 + (t - t1) * a3) / (t3 - t1);
        return ((t2 - t) * b1 + (t - t1) * b2) / (t2 - t1);
      };
      const x = at('x'), z = at('z'), e = smooth(k / n);
      const prev = out[out.length - 1];
      if (prev) s += Math.hypot(x - prev.x, z - prev.z);
      out.push({ x, z, y: p1.y + (p2.y - p1.y) * e, s });
    }
  }
  return out;
}

export class Tour {
  // def: the city's TOUR; height: how high over the street it flies where its path does not say
  constructor(def, { height = 22 } = {}) {
    this.pts = sample(def.path, height);
    this.length = this.pts[this.pts.length - 1].s;
    // where along the path a point is: the nearest the path comes to it, from s = from on (the path
    // goes over some streets twice, so each list finds its points in order)
    const along = ([x, z], from = 0) => {
      const pts = this.pts.filter(p => p.s >= from), d = p => Math.hypot(p.x - x, p.z - z);
      const near = Math.min(...pts.map(d));
      return pts.find(p => d(p) < near + 0.5).s; // the first time, where it passes twice (the start and the end)
    };
    const inOrder = list => { let s = 0; return (list ?? []).map(it => ({ ...it, s: (s = along(it.at, s)) })); };
    this.stops = inOrder(def.stops);
    this.names = inOrder(def.names);
    // the tour's parts, each from s to end
    this.phases = inOrder(def.phases ?? [{ at: def.path[0] }]).map((p, i, all) => ({ ...p, end: all[i + 1]?.s ?? this.length }));
    this.anchors = [0, ...this.stops.map(st => st.s), this.length]; // where the camera comes down
    // glances: on the way, without stopping, the camera slows down and looks aside for a moment
    this.glances = inOrder(def.glances).map(g => ({ before: 35, after: 25, slow: 9, ...g }));
    // low: stretches where it skims the street or the water instead of climbing over the roofs
    this.low = (def.low ?? []).map(([a, b]) => { const sa = along(a); return [sa, along(b, sa)]; });
    this.endLook = def.end?.look; // what it turns to look at as it comes to the end
    this.skies = inOrder(def.skies); // the sky from s on
    // boat: a stretch where the camera goes along behind one of the Bootjes van Gent, at its speed;
    // past it the boat sails on by itself, along `away`
    if (def.boat) {
      const sa = along(def.boat.from), sb = along(def.boat.to, sa);
      this.boatRun = { ahead: 16, speed: 7, ...def.boat, sa, sb };
    }
    // fall: a cyclist riding a line who comes off at its end just as the camera gets to `at`
    if (def.fall) {
      const line = def.fall.line, cum = [0];
      for (let k = 1; k < line.length; k++) cum.push(cum[k - 1] + Math.hypot(line[k][0] - line[k - 1][0], line[k][1] - line[k - 1][1]));
      this.fallRun = { pace: 0.35, gone: 700, ...def.fall, cum, s: along(def.fall.at) };
    }
    this.fleet = def.boats ?? []; // more of them on the water, moored or sailing a line of their own
    // bus: one that drives along beside the camera from the start, on a line of its own
    if (def.bus) {
      const line = def.bus.line, cum = [0];
      for (let k = 1; k < line.length; k++) cum.push(cum[k - 1] + Math.hypot(line[k][0] - line[k - 1][0], line[k][1] - line[k - 1][1]));
      this.busRun = { ahead: 8, lane: 2, pace: 1, gone: 600, ...def.bus, cum };
    }
    this.reset();
  }

  reset() {
    this.s = 0;
    this.v = 0;
    this.next = 0; // the stop flown to (or waiting at)
    this.held = false; // waiting at that stop
    this.done = false; // at the end of the path
    this.roll = 0;
    this.t = 0; // seconds since it set off
    this.paused = false; // waiting while its card is read (auto: hovered)
    this.dismissed = null; // the stop whose card was clicked away (auto)
    this.wait = 0; // seconds left hovering at a glance that holds
    this.waited = new Set(); // the glances it has hovered at
    this.boatT = 0; // seconds the boat has sailed on by itself
    this.clock = 0; // seconds of the tour played, at its speed (the fleet sails by it)
    this.fellAt = null; // the clock when the cyclist came off
    this.aim = null; // where the camera looks: { yaw, pitch, vy, vp, d }, turned towards view() on a spring
  }

  // Where the boat is, if it is in the picture: { x, z, yaw }.
  boat() {
    const b = this.boatRun;
    if (!b || this.s < b.sa - 250) return null;
    const along = s => {
      const p = this.at(s), q = this.at(s + 2), r = this.at(s - 2);
      return { x: p.x, z: p.z, yaw: Math.atan2(q.x - r.x, q.z - r.z) };
    };
    if (this.s <= b.sb) return along(Math.max(b.sa, this.s) + b.ahead); // waiting for the camera, then just ahead of it
    // on by itself, from where it was along its way out
    const start = along(b.sb + b.ahead), line = [[start.x, start.z], ...(b.away ?? [])];
    let d = this.boatT * b.speed;
    for (let k = 0; k + 1 < line.length; k++) {
      const [ax, az] = line[k], [bx, bz] = line[k + 1], L = Math.hypot(bx - ax, bz - az);
      if (d <= L) return { x: ax + (bx - ax) * d / L, z: az + (bz - az) * d / L, yaw: Math.atan2(bx - ax, bz - az) };
      d -= L;
    }
    return null; // gone round the bend
  }

  // Where the bus is, while it is in the picture: { x, z, yaw }, its lane right of its line. It sets
  // off level with the camera (ahead of it), goes pace times as far as it does, and halts at the end
  // of its line.
  bus() {
    const b = this.busRun;
    if (!b || this.s > b.gone) return null;
    const { line, cum } = b, L = cum.at(-1), cam = this.at(this.s);
    // how far along its line the camera is: the nearest point on it
    let best = Infinity, d = 0;
    for (let k = 1; k < line.length; k++) {
      const [ax, az] = line[k - 1], [bx, bz] = line[k], len = cum[k] - cum[k - 1] || 1;
      const u = Math.max(0, Math.min(1, ((cam.x - ax) * (bx - ax) + (cam.z - az) * (bz - az)) / (len * len)));
      const e = Math.hypot(ax + (bx - ax) * u - cam.x, az + (bz - az) * u - cam.z);
      if (e < best) { best = e; d = cum[k - 1] + u * len; }
    }
    // slower than the camera (pace): beside it at the start, then left behind
    if (b.from == null) b.from = d;
    d = Math.min(L - 0.01, b.from + (d - b.from) * b.pace + b.ahead);
    let k = 1;
    while (k < line.length - 1 && cum[k] < d) k++;
    const [ax, az] = line[k - 1], [bx, bz] = line[k], len = cum[k] - cum[k - 1] || 1, u = (d - cum[k - 1]) / len;
    const tx = (bx - ax) / len, tz = (bz - az) / len;
    return { x: ax + (bx - ax) * u - tz * b.lane, z: az + (bz - az) * u + tx * b.lane, yaw: Math.atan2(tx, tz) }; // (-z is north)
  }

  // Where the cyclist who comes off is: { x, z, yaw, fallen: seconds since, or -1 while riding }, or
  // null out of the picture. Riding, it goes pace times as far as the camera, so it gets to the end of
  // its line, the rails, as the camera gets to `at`; after that it lies there a while.
  fall() {
    const f = this.fallRun;
    if (!f || this.s > f.gone) return null;
    const { line, cum } = f, L = cum.at(-1), d = L + (this.s - f.s) * f.pace;
    if (d < 0) return null; // not yet set off
    if (d >= L && this.fellAt == null) this.fellAt = this.clock;
    const e = Math.min(d, L - 0.01);
    let k = 1;
    while (k < line.length - 1 && cum[k] < e) k++;
    const [ax, az] = line[k - 1], [bx, bz] = line[k], len = cum[k] - cum[k - 1] || 1, u = (e - cum[k - 1]) / len;
    return { x: ax + (bx - ax) * u, z: az + (bz - az) * u, yaw: Math.atan2(bx - ax, bz - az), fallen: d >= L ? this.clock - this.fellAt : -1 };
  }

  // Where the fleet's boats are: [{ x, z, yaw }], null for one that has sailed its line to the end.
  // A moored one lies along its line, at its start.
  boats() {
    return this.fleet.map(b => {
      let d = (b.speed ?? 0) * this.clock;
      for (let k = 0; k + 1 < b.line.length; k++) {
        const [ax, az] = b.line[k], [bx, bz] = b.line[k + 1], L = Math.hypot(bx - ax, bz - az);
        if (d <= L) return { x: ax + (bx - ax) * d / L, z: az + (bz - az) * d / L, yaw: Math.atan2(bx - ax, bz - az) };
        d -= L;
      }
      return null;
    });
  }

  // how much higher than the path the camera flies at s: nothing at a stop, the most between two
  soar(s) {
    const d = Math.min(...this.anchors.map(a => Math.abs(s - a)));
    const low = Math.max(0, ...this.low.map(([a, b]) => smooth(1 - Math.max(a - s, s - b, 0) / LOW_EASE)));
    return SOAR * smooth((d - SOAR_FROM) / SOAR_OVER) * (1 - low);
  }

  // how much the camera looks aside to a glance at s (0 to 1), and which
  glanceAt(s) {
    let w = 0, on = null;
    for (const g of this.glances) {
      const d = s - g.s, k = d < 0 ? smooth(1 + d / g.before) : smooth(1 - d / g.after);
      if (k > w) { w = k; on = g; }
    }
    return { w, on };
  }

  // which way the path turns at s, in radians per metre (positive: to the left)
  bend(s) {
    const a = this.at(s - 6), b = this.at(s), c = this.at(s + 6);
    const x1 = b.x - a.x, z1 = b.z - a.z, x2 = c.x - b.x, z2 = c.z - b.z;
    return Math.atan2(z1 * x2 - x1 * z2, x1 * x2 + z1 * z2) / 12;
  }

  // where along the path, as a point
  at(s) {
    const P = this.pts;
    s = Math.max(0, Math.min(this.length, s));
    let lo = 0, hi = P.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m].s <= s) lo = m; else hi = m; }
    const a = P[lo], b = P[hi], k = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k };
  }

  // Autoplay sweeps past the stops, slowing down to look, and only waits while told to (paused);
  // interactively it stops at each one until go().
  // rate: how fast it plays (the speed button), on top of PACE. The welcome and the waits at a glance
  // take the same seconds at any speed.
  update(dt, auto, rate = 1) {
    if (this.done) return;
    this.t += dt;
    const real = dt;
    dt *= PACE * rate;
    // bank into the bends, by how fast the camera turns
    // (hardly at all slowly: in a tight bend coming to a standstill it would lean over)
    const v = this.v * PACE * rate;
    const roll = Math.max(-BANK_MAX, Math.min(BANK_MAX, this.bend(this.s) * v * BANK)) * smooth(v / 25);
    this.roll += (roll - this.roll) * (1 - Math.exp(-real * 2.5));
    if (this.boatRun && this.s > this.boatRun.sb) this.boatT += dt;
    if (this.t >= WELCOME) this.clock += dt;
    if (this.held) return;
    if (this.t < WELCOME) { // while the welcome shows it already creeps along, ever so slowly
      this.v = CREEP * Math.min(1, this.t / 1.5);
      this.s += this.v * real;
      return;
    }
    if (this.wait > 0) { this.wait -= real; this.v = 0; return; } // hovering at a glance
    const stop = this.stops[this.next], left = this.stops[this.next - 1];
    const room = stop && !auto ? stop.s - this.s : this.length - this.s;
    let want = Math.min(CRUISE, Math.max(0.8, Math.sqrt(2 * DECEL * Math.max(0, room))));
    if (auto) {
      if (stop) want = Math.min(want, Math.sqrt(PASS ** 2 + 2 * DECEL * Math.max(0, stop.s - this.s)));
      if (left && this.s - left.s < 30) want = Math.min(want, PASS); // and slow a little after it
      if (this.paused) want = 0;
    }
    // slow down for a glance, and stay slow while it lasts
    for (const g of this.glances) {
      if (this.s > g.s + g.after) continue;
      if (g.reach) { if (this.s < g.s) want = Math.min(want, Math.sqrt(g.slow ** 2 + 2 * DECEL * (g.s - this.s))); } // slowly up to it, then off
      else if (g.hold && !this.waited.has(g)) want = Math.min(want, Math.max(0.6, Math.sqrt(2 * DECEL * Math.max(0, g.s - this.s)))); // to a standstill there
      else want = Math.min(want, Math.sqrt(g.slow ** 2 + 2 * DECEL * Math.max(0, g.s - g.before - this.s)));
    }
    // along behind the boat at its speed
    const b = this.boatRun;
    if (b && this.s < b.sb) want = Math.min(want, Math.sqrt(b.speed ** 2 + 2 * DECEL * Math.max(0, b.sa - this.s)));
    this.v = want > this.v ? Math.min(want, this.v + ACCEL * dt) : auto ? Math.max(want, this.v - BRAKE * dt) : want;
    this.s += this.v * dt;
    const g = this.glances.find(g => g.hold && !this.waited.has(g) && this.s >= g.s);
    if (g) {
      this.waited.add(g);
      Object.assign(this, { s: g.s, v: 0, wait: g.hold });
    }
    if (stop && auto && this.s >= stop.s) {
      this.next++; // past it: its card stays a little longer
    } else if (stop && !auto && this.s >= stop.s - 0.05) {
      Object.assign(this, { s: stop.s, v: 0, held: true });
    } else if (this.s >= this.length) {
      Object.assign(this, { s: this.length, v: 0, done: true });
    }
  }

  // Back (or on) to the start of a phase: the flight sets off from there, without the welcome but
  // from the very start.
  seek(phase) {
    this.reset();
    if (!phase.s) return;
    this.s = phase.s;
    this.t = WELCOME;
    this.clock = 1e4; // the fleet's boats that sail have long gone
    this.next = this.stops.findIndex(st => st.s >= phase.s);
    if (this.next < 0) this.next = this.stops.length;
    for (const g of this.glances) if (g.s < phase.s) this.waited.add(g);
    if (this.fallRun && phase.s > this.fallRun.s) this.fellAt = this.clock - 99; // long since come off
  }

  // Autoplay: a card clicked away, on without waiting for it any more.
  dismiss(st) {
    this.dismissed = st;
    this.paused = false;
  }

  // On from the stop waited at (its card clicked away), or past the one coming up when its card is
  // clicked away before getting there.
  go() {
    const coming = this.stops[this.next];
    if (!this.held && !(coming && coming.s - this.s < (coming.card ?? CARD_IN))) return false;
    this.held = false;
    this.next++;
    return true;
  }

  // Where the camera is and what it looks at: the path ahead, turning to a stop as it comes up.
  view() {
    const pos = this.at(this.s);
    pos.y += this.soar(this.s);
    // coming up to a glance it stands still or turns back at, it looks no further than there: not round the bend
    // the path makes after it, nor at the stop after that
    const gate = this.gate();
    const far = Math.min(this.s + LOOK_AHEAD, gate);
    const ahead = this.at(far), high = ahead.y + this.soar(far);
    // looking down at the street ahead from high up, and straight ahead skimming it
    const look = { x: ahead.x, y: Math.max(1.5, high - Math.min(14, high * 0.5)), z: ahead.z };
    if (this.s + LOOK_AHEAD > this.length) {
      // at the end the path runs out: keep looking the way it went
      const back = this.at(this.length - 8), end = this.at(this.length);
      const d = this.s + LOOK_AHEAD - this.length, n = Math.hypot(end.x - back.x, end.z - back.z) || 1;
      look.x = end.x + (end.x - back.x) / n * d;
      look.z = end.z + (end.z - back.z) / n * d;
    }
    let w = 0, stop = null;
    for (const st of this.stops) {
      if (st.s > gate) break;
      const d = this.s - st.s;
      const k = d < 0 ? smooth(1 + d / TURN_IN) : (this.stops.indexOf(st) < this.next ? smooth(1 - d / TURN_OUT) : 1);
      if (k > w) { w = k; stop = st; }
    }
    const g = this.glanceAt(this.s);
    if (g.w > w) { w = g.w; stop = g.on; }
    // the end: turn round to what it looks at there
    const e = this.endLook ? smooth(1 - (this.length - this.s) / TURN_IN) : 0;
    if (e > w) { w = e; stop = { look: this.endLook }; }
    if (stop) {
      const [x, y, z] = stop.look;
      look.x += (x - look.x) * w;
      look.y += (y - look.y) * w;
      look.z += (z - look.z) * w;
    }
    return { pos, look, roll: this.roll };
  }

  // where the glance it will stand still at, or turn back at, next is, if one comes up
  gate() { return this.glances.find(g => ((g.hold && !this.waited.has(g)) || g.reach) && g.s > this.s)?.s ?? Infinity; }

  // the sky at s, as 'time:weather' (null: the city's own)
  get sky() { return this.skies.findLast(k => k.s <= this.s + 0.01)?.sky ?? null; }

  // Where the camera is and what it looks at, turned towards view() smoothly (see AIM): call once a frame.
  steer(dt) {
    const { pos, look, roll } = this.view();
    const dx = look.x - pos.x, dy = look.y - pos.y, dz = look.z - pos.z, flat = Math.hypot(dx, dz);
    const yaw = Math.atan2(dx, dz), pitch = Math.atan2(dy, flat), d = Math.max(10, Math.hypot(flat, dy));
    const a = this.aim ??= { yaw, pitch, vy: 0, vp: 0, d, ty: yaw, tp: pitch };
    const wrap = r => Math.atan2(Math.sin(r), Math.cos(r)), cap = v => Math.max(-TURN_MAX, Math.min(TURN_MAX, v));
    // critically damped, and keeping up with what it looks at as that turns steadily (round the
    // Belfort) without lagging behind; a jump in what it looks at it turns to in its own time
    const spring = (from, to, v, was) => {
      const follow = dt > 0 ? cap(wrap(to - was) / dt) : 0;
      return cap(v + (AIM * AIM * wrap(to - from) + 2 * AIM * (follow - v)) * dt);
    };
    a.vy = spring(a.yaw, yaw, a.vy, a.ty);
    a.vp = spring(a.pitch, pitch, a.vp, a.tp);
    a.ty = yaw;
    a.tp = pitch;
    a.yaw += a.vy * dt;
    a.pitch += a.vp * dt;
    a.d += (d - a.d) * (1 - Math.exp(-dt * 3));
    const c = Math.cos(a.pitch) * a.d;
    return { pos, look: { x: pos.x + Math.sin(a.yaw) * c, y: pos.y + Math.sin(a.pitch) * a.d, z: pos.z + Math.cos(a.yaw) * c }, roll };
  }

  // The stop whose card shows now, if any: coming up to it, waiting at it, and (auto) just after it.
  card(auto) {
    if (this.held) return this.stops[this.next];
    const coming = this.stops[this.next];
    if (coming && coming !== this.dismissed && this.wait <= 0 && coming.s < this.gate() && coming.s - this.s < (coming.card ?? CARD_IN)) return coming; // not while it looks at something else
    const left = this.stops[this.next - 1];
    if (auto && left && left !== this.dismissed && this.s - left.s < CARD_OUT) return left;
    return null;
  }

  // how much longer the card shows, 0 to 1 (auto: it goes when the camera is far enough past)
  cardLeft(st) {
    const i = this.stops.indexOf(st);
    return i >= 0 && i < this.next ? 1 - (this.s - st.s) / CARD_OUT : 1;
  }

  get welcoming() { return this.t < WELCOME; }

  // The name of the street or square below, for a while after it comes up.
  name() {
    let on = null;
    for (const n of this.names) if (n.s <= this.s + 5 && this.s - n.s < NAME_FOR) on = n;
    return on;
  }

  // how far along, 0 to 1
  get progress() { return this.s / this.length; }
}
