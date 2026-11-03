// The demo: the city's DEMO (see ghent/demo.js) played shot after shot, each set up out of sight
// under black, fading in and out in a flash, with words over it where the script says, its name
// in a corner all along, and a bar at the top with a part for each shot to go back or on to. Who
// plays in the shots from the game itself is played here too (drive), with the same throttle and
// steering a player has. No three.js in here: game/demofilm.js does what `api` says.
//
// api (game/demofilm.js): tour(at, speed, { welcome, cards }) the tour from a point on its path (welcome: from
// its very start, its welcome and all; cards: with the sights' cards), music(t) the music from t
// seconds into the film, tire() the quest's thief tired already, quest(id, mount) a quest from
// its start (on its own mount, or that one), begin() past its story card, race(id, mount) a race
// from its start, ai(r, dt) how a computer rider rides it, explore(at, look, mount) riding about,
// warm(seconds) play on out of sight, place(at, yaw, speed) player 1 there, over() the quest is won
// or lost, halt() where the quest's next stop is { x, z } (a swimmer to winch up, say), cars() the
// traffic's cars [{ x, z }], thief() where a quest's thief is (ax, az: a little ahead on their
// street, not weaving), walkers() the passers-by, clear(x0, z0, x1, z1) nothing in the way between,
// shoot(r), car(type) player 1 at the wheel of one (a police car, a bus), board() into the
// quest's bus, unblock(points, near) the traffic off a route (but within near metres of the
// camera), steady() no falling off the bike in the tram rails, local(text) in the player's language.

const SPRAY = 0.35; // radians off what it aims at that it already fires, spraying as it turns to it
const AIM_FOR = 1.5; // seconds it keeps at one before turning to another
const REACH = 4; // metres from a point of a route that count as got there
const CRUMB = 2; // metres between the points of the thief's trail
const AHEAD = 30; // metres of the thief's trail ahead it looks along for the furthest point in sight
const CAR_SIDE = 3; // metres to either side of a car in the way that it goes by
const HELI_NEAR = 60, HOVER = 20, CRUISE = 30; // metres from a swimmer it comes down within; how high over them it hovers, and flies between
const HELI_OVER = 7; // m/s it eases on at over a swimmer (the winch works below 20)
const HELI_TOP = 40; // m/s it flies at, at most
const WIDE = 1.2; // metres either side of a line of sight that must be clear too, to ride along it
const TYPE = 0.08; // seconds a letter of the welcome's typed-in word takes
const STUCK = 0.6, BACK = 0.9; // seconds stood still against a wall before backing off, and how long it backs

const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Demo {
  // wait: black with a ▶ until go() (a click, for the browser to allow the music); close: what the
  // ✕ in the corner does (none without it); bar: the shots' bar at the top (not in a film made of it);
  // shots: [first, last], only those of the script (from 0)
  constructor(def, api, { wait = false, close = null, bar = true, shots = null } = {}) {
    if (shots) def = { ...def, shots: def.shots.slice(shots[0], shots[1] + 1) };
    this.def = def;
    this.api = api;
    this.fade = def.fade ?? 0.2;
    let t = 0;
    this.shots = def.shots.map(s => ({ ...s, start: (t += s.for) - s.for }));
    this.length = t;
    this.t = 0;
    this.on = -1; // the shot playing
    this.done = false;
    this.el = document.createElement('div');
    this.el.id = 'demo';
    this.el.innerHTML = '<div class="shade"></div><div class="words"><b></b><small></small><em></em></div><div class="black"></div>';
    document.body.append(this.el);
    document.body.classList.add('demo');
    this.black = this.el.querySelector('.black');
    this.words = this.el.querySelector('.words');
    this.shade = this.el.querySelector('.shade');
    if (def.brand) {
      const b = document.createElement('div');
      b.className = 'brand';
      b.innerHTML = '<b></b><small></small>';
      b.querySelector('b').innerHTML = marked(api.local(def.brand.name));
      b.querySelector('small').textContent = def.brand.sub ? api.local(def.brand.sub) : '';
      this.el.append(b);
    }
    // the bar: a part for each shot, as long as it lasts, filling up as it plays; a click on one goes to its start
    this.fills = [];
    if (bar) {
      const el = document.createElement('div');
      el.id = 'demoBar';
      this.shots.forEach((s, i) => {
        const b = document.createElement('button');
        b.style.flexGrow = s.for;
        b.dataset.name = s.name ? api.local(s.name) : '';
        b.innerHTML = '<i><b></b></i>';
        b.addEventListener('click', () => this.seek(i));
        el.append(b);
        this.fills.push(b.querySelector('b'));
      });
      this.el.append(el);
    }
    if (close) {
      const x = document.createElement('button');
      x.className = 'close';
      x.textContent = '✕';
      x.addEventListener('click', close);
      this.el.append(x);
    }
    this.waiting = wait;
    if (wait) {
      this.words.querySelector('b').textContent = '▶';
      this.words.style.opacity = 1;
    }
  }

  go() { this.waiting = false; }

  // Back (or on) to the start of shot i, the music with it.
  seek(i) {
    this.t = this.shots[i].start;
    this.on = -1;
    this.done = false;
    if (!this.waiting) this.api.music(this.t);
  }

  // off the screen (game/demofilm.js puts the game back as it was)
  remove() {
    this.el.remove();
    document.body.classList.remove('demo');
  }

  // The shot at t, set up as it comes on; the black over it, and its words. Call once a frame,
  // before the game steps.
  update(dt) {
    if (this.done || this.waiting) return;
    this.t += dt;
    this.dt = dt;
    if (this.t >= this.length) {
      this.done = true;
      if (!this.shots.at(-1).hold) this.black.style.opacity = 1;
      return;
    }
    const i = this.shots.findLastIndex(s => s.start <= this.t);
    if (i !== this.on) this.cut(i);
    this.fills.forEach((f, k) => (f.style.transform = `scaleX(${clamp((this.t - this.shots[k].start) / this.shots[k].for, 0, 1)})`));
    const s = this.shots[i], into = this.t - s.start, left = s.start + s.for - this.t;
    // to black at the end of each shot and back at the start of the next; the first comes up and the
    // last goes down a little slower
    // (none at all with fadeIn 0, and none at the end of a last shot that holds: its card stays up)
    const last = i === this.shots.length - 1;
    const fin = i === 0 ? this.def.fadeIn ?? 1 : this.fade, fout = last ? (s.hold ? 0 : this.def.music?.out ?? 1) : this.fade;
    this.black.style.opacity = clamp(Math.max(fin ? 1 - into / fin : 0, fout ? 1 - left / fout : 0), 0, 1);
    // the tour's welcome up at once at the very start of the film (its first picture), not fading in
    if (s.welcome && into > 0.5) this.welcomeEl?.classList.remove('now');
    // and its *part* typed in, a letter at a time, from welcomeType seconds on (Dit is Gent → Dit is Instant Gent)
    if (this.typing) {
      const { el, text } = this.typing, at = this.def.welcomeType ?? 1.5;
      el.textContent = text.slice(0, clamp(Math.floor((into - at) / TYPE) + 1, 0, text.length));
    }
    if (s.brief && !s.begun && into >= s.brief) { s.begun = true; this.api.begin(); }
    if (s.board != null && !s.boarded && into >= s.board) { s.boarded = true; this.api.board(); }
    // (all of them on the first picture, still black from the cut: the traffic comes anew as the
    // camera jumps there; and then only those out of sight)
    if (s.unblock) this.api.unblock(s.drive.slice(this.route), into > this.dt * 1.5 ? 50 : 0);
    const w = s.title || s.sub ? clamp(Math.min((into - (s.at ?? 0.3)) / 0.4, s.hold && last ? 1 : (left - 0.3) / 0.4), 0, 1) : 0;
    this.words.style.opacity = w;
    this.words.style.setProperty('--rise', `${(1 - w) * 12}px`);
    this.shade.style.opacity = s.card ? w : 0;
  }

  // On to shot i: set it up, and play it on out of sight for its `pre` seconds.
  cut(i) {
    this.on = i;
    const s = this.shots[i], api = this.api;
    this.trail = [];
    this.route = 0;
    this.was = null;
    this.backing = 0;
    this.aim = null;
    this.shotCars = new Set();
    this.drive = s.drive ?? null;
    this.shot = s;
    this.pace = s.pace ?? 1; // how much faster than real time the game plays in this shot (game/demofilm.js steps it so)
    s.begun = !s.quest;
    s.boarded = false;
    if (s.tour) api.tour(s.tour, s.speed ?? 1, { welcome: !!s.welcome, cards: s.cards ?? true });
    else if (s.quest) {
      api.quest(s.quest, s.mount);
      if (!s.brief) { s.begun = true; api.begin(); }
      if (s.tired) api.tire();
    } else if (s.race) api.race(s.race, s.mount);
    else if (s.explore) api.explore(s.explore.at, s.explore.look, s.explore.mount ?? 'bike');
    if (s.car) api.car(s.car);
    if (s.steady) api.steady();
    if (s.pre) api.warm(s.pre);
    this.turning = s.turn ?? 0; // (once on screen)
    if (s.behind) this.closeIn(s.behind);
    const words = this.words;
    words.querySelector('b').innerHTML = s.title ? marked(api.local(s.title)) : '';
    words.querySelector('small').textContent = s.sub ? api.local(s.sub) : '';
    words.querySelector('em').innerHTML = s.cta ? marked(api.local(s.cta)) : '';
    this.el.classList.toggle('bigcard', !!s.card);
    // the tour's welcome in the film's own words (Dit is *Instant* Gent), up from the first picture
    this.welcomeEl = document.getElementById('tourWelcome');
    this.typing = null;
    if (s.welcome && this.def.welcome && this.welcomeEl) {
      const b = this.welcomeEl.querySelector('b');
      b.innerHTML = marked(api.local(this.def.welcome));
      const hl = b.querySelector('.hl');
      if (hl) { this.typing = { el: hl, text: hl.textContent }; hl.textContent = ''; }
      if (i === 0) this.welcomeEl.classList.add('now', 'show');
    }
  }

  // What player 1 does this frame, { throttle, steer, fire }, when the shot plays them; null when it does not.
  control(r) {
    if (!this.drive || this.done) return null;
    if (this.api.over()) return { throttle: 0, steer: 0 }; // won (or lost): stand and look
    if (this.drive === 'chase') return this.chase(r);
    if (this.drive === 'shoot') return this.shoot(r);
    if (this.drive === 'race') return this.api.ai(r, this.dt);
    if (this.drive === 'heli') return this.fly(r);
    return this.along(r);
  }

  // Keep the thief's trail: where the thief has run, a point every CRUMB metres.
  follow() {
    const th = this.drive === 'chase' && this.api.thief();
    if (!th) return;
    const last = this.trail.at(-1);
    if (!last || Math.hypot(th.x - last[0], th.z - last[1]) > CRUMB) this.trail.push([th.x, th.z]);
  }

  // After the thief: straight at them when nothing is in the way, else to the furthest point of
  // their trail that is in sight, so round the corners they took (and backing off a wall, stuck on one).
  chase(r) {
    this.follow();
    const th = this.api.thief();
    if (!th) return { throttle: 0, steer: 0 };
    const back = this.unstick(r);
    if (back) return back;
    const { x, z } = r.pos, clear = (x0, z0, x1, z1) => {
      // wide enough to ride along: the line, and one either side of it
      const n = Math.hypot(x1 - x0, z1 - z0) || 1, sx = (z1 - z0) / n * WIDE, sz = -(x1 - x0) / n * WIDE;
      return [0, 1, -1].every(k => this.api.clear(x0 + sx * k, z0 + sz * k, x1 + sx * k, z1 + sz * k));
    };
    // close by, straight at them; else along their trail: the trail behind the rider is done with,
    // and of the next AHEAD metres of it, to the furthest point in sight
    let to = Math.hypot(th.x - x, th.z - z) < AHEAD * 0.7 && this.api.clear(x, z, th.x, th.z) ? [th.ax ?? th.x, th.az ?? th.z] : null;
    if (!to) {
      const tr = this.trail, k = tr.findLastIndex(p => Math.hypot(p[0] - x, p[1] - z) < REACH);
      if (k >= 0) tr.splice(0, k + 1);
      for (let j = Math.min(tr.length, AHEAD / CRUMB) - 1; j >= 0 && !to; j--) if (clear(x, z, ...tr[j])) to = tr[j];
      to ??= tr[0] ?? [th.x, th.z];
    }
    return steerTo(r, this.round(r, to));
  }

  // Where to head for to get to `to` round a car in the way: past its side, the side it is nearest.
  round(r, to) {
    const { x, z } = r.pos, d = Math.hypot(to[0] - x, to[1] - z) || 1, ux = (to[0] - x) / d, uz = (to[1] - z) / d;
    for (const c of this.api.cars()) {
      const ahead = (c.x - x) * ux + (c.z - z) * uz, side = (c.x - x) * uz - (c.z - z) * ux;
      if (ahead < 0 || ahead > Math.min(d, 14) || Math.abs(side) > CAR_SIDE) continue;
      const k = side > 0 ? -1 : 1; // go by on the other side of it
      return [c.x + uz * k * CAR_SIDE, c.z - ux * k * CAR_SIDE];
    }
    return to;
  }

  // The rider put on the thief's trail, that many metres behind them, riding along it at full speed.
  closeIn(metres) {
    const tr = this.trail;
    let k = tr.length - 1, d = 0;
    while (k > 1 && d < metres) { d += Math.hypot(tr[k][0] - tr[k - 1][0], tr[k][1] - tr[k - 1][1]); k--; }
    if (k < 1) return;
    const [x, z] = tr[k], [nx, nz] = tr[k + 1];
    this.api.place([x, z], Math.atan2(nx - x, nz - z), 20);
    tr.splice(0, k);
  }

  // Stood still against a wall a while: back off it, turning the other way, for BACK seconds.
  unstick(r) {
    const dt = this.dt, was = this.was ?? { x: r.pos.x, z: r.pos.z };
    const moved = Math.hypot(r.pos.x - was.x, r.pos.z - was.z) / dt;
    this.was = { x: r.pos.x, z: r.pos.z };
    if (this.backing > 0) {
      this.backing -= dt;
      return { throttle: -1, steer: this.backSteer };
    }
    this.still = moved < 1 ? (this.still ?? 0) + dt : 0;
    if (this.still < STUCK) return null;
    this.still = 0;
    this.backing = BACK;
    this.backSteer = r.steer > 0 ? -1 : 1;
    return { throttle: -1, steer: this.backSteer };
  }

  // The paintball fight: turn to a passer-by still standing (or a car going by), nearest first, and
  // spray paint at them, walking up closer when they are far; on to the next once hit, or after a while.
  shoot(r) {
    const { x, z } = r.pos, api = this.api, aim = this.aim;
    const standing = w => w.hitT === undefined && w.x !== undefined;
    if (!aim || (aim.w && !standing(aim.w)) || (this.aimT -= this.dt) <= 0) {
      let best = null, bd = 32;
      for (const w of api.walkers()) {
        const d = Math.hypot(w.x - x, w.z - z);
        if (standing(w) && d < bd && d > 2 && api.clear(x, z, w.x, w.z)) { best = { w }; bd = d; }
      }
      for (const c of api.cars()) {
        const d = Math.hypot(c.x - x, c.z - z);
        if (d < bd && d > 4 && !this.shotCars.has(c) && api.clear(x, z, c.x, c.z)) { best = { c }; bd = d; }
      }
      this.aim = best;
      this.aimT = AIM_FOR;
      if (best?.c) this.shotCars.add(best.c); // each car once, as they count
    }
    const t = this.aim?.w ?? this.aim?.c;
    if (!t) return { throttle: 0.6, steer: 0 };
    const d = Math.hypot(t.x - x, t.z - z), off = wrap(Math.atan2(t.x - x, t.z - z) - r.yaw);
    if (Math.abs(off) < SPRAY) api.shoot(r);
    return { throttle: d > 18 && Math.abs(off) < 0.4 ? 1 : 0, steer: clamp(off * 4, -1, 1) };
  }

  // The helicopter rescue: up, over to the next swimmer (or on to where they are to be landed), down
  // low and slowing to a hover right over them until the winch has them, and up and away again.
  // (turn: first that many seconds round in a wide banking circle, up at its cruising height)
  fly(r) {
    const h = this.api.halt();
    if (!h) return { throttle: 0, steer: 0, lift: 0 };
    if (this.turning > 0) {
      this.turning -= this.dt;
      return { throttle: r.y > 6 ? 1 : 0.2, steer: this.shot.turnSide ?? 1, lift: clamp((CRUISE - r.y) / 4, -1, 1) };
    }
    const d = Math.hypot(h.x - r.pos.x, h.z - r.pos.z), off = wrap(Math.atan2(h.x - r.pos.x, h.z - r.pos.z) - r.yaw);
    const near = d < HELI_NEAR, want = near ? HOVER : CRUISE; // metres above the water or the ground
    // as fast as it can still stop over them, and only once turned their way
    const pace = Math.min(HELI_TOP, HELI_OVER + Math.sqrt(Math.max(0, d - 2) * 2 * 9)) * Math.max(0, Math.cos(off));
    const throttle = clamp((pace - r.speed) / 6, -1, 1);
    return { throttle, steer: clamp(off * 2, -1, 1), lift: clamp((want - r.y) / 4, -1, 1) };
  }

  // Along the shot's route, point after point, and straight on after the last.
  along(r) {
    const pts = this.drive, { x, z } = r.pos;
    while (this.route < pts.length - 1 && Math.hypot(pts[this.route][0] - x, pts[this.route][1] - z) < REACH) this.route++;
    return steerTo(r, this.round(r, pts[this.route])); // (round a car in the way)
  }
}

// the script's words as HTML, *this* in the accent colour
function marked(text) {
  const esc = text.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  return esc.replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');
}

// full ahead at a point, turning to it, slower in a sharp turn
function steerTo(r, [tx, tz]) {
  const off = wrap(Math.atan2(tx - r.pos.x, tz - r.pos.z) - r.yaw);
  return { throttle: Math.abs(off) > 1.2 ? 0.4 : 1, steer: clamp(off * 3, -1, 1) };
}
