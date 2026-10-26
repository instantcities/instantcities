// Riding the tram and the bus: waiting at the stop, getting on, riding along and getting off.

import * as THREE from 'three';
import { getLang } from '../i18n.js';
import { TRAM_STOPS, STOPS, NAME } from '../city.js';
import { streetAt } from '../collide.js';
import { sfx } from '../sound.js';
import { behind } from '../tramnet.js';
import { t_, PAN, clamp, wrapAngle, $ } from './base.js';
import { game } from './settings.js';
import { particles, camYaw } from './scene.js';
import { exploring, world, city } from './worlds.js';
import { humans, ctl } from './racers.js';
import { setText, hudMsg } from './hud.js';
import { humanControl } from './control.js';
import { roomName, doorBy } from './indoors.js';
import { artBy } from './artview.js';
import { showAction } from './action.js';
import { touch } from './input.js';

// Riding about freely: come onto a tram stop's platform (or by its sign) and you are asked straight
// away whether you want to wait for the tram; say yes and the next one along comes soon: one already
// close up the line, or else one put on the line at most TRAM_SUMMON metres off. Once it halts you are on
// board, the camera swings out for the view while it takes you through the city, and you get off
// whenever you like, at the stop nearest where the tram is (at the end of the line, everybody off).
// r.tram: { sign } being asked, { sign, edge, at, t } waiting, { riding, t, edge, view } on board.
const TRAM_NEAR = 7; // metres from the sign, or from the platform's middle line, that count as at the stop
const TRAM_GIVE_UP = 20; // metres from the platform: ride further off than this and you no longer wait
const TRAM_SUMMON = 50; // metres up the line from you: the furthest a tram you wait for is brought from
const tramsOn = () => (exploring() && city?.trams && TRAM_STOPS?.length ? city.trams : null);
export const onTram = r => !!r.tram?.riding;
export const riding = r => onTram(r) || onBus(r); // on a tram or a bus: it takes you along
export const seated = r => onBus(r) || !!r.tram?.seat; // inside, by a window
const tramPos = new THREE.Vector3(), tramAhead = new THREE.Vector3();

// how far the rider is from stop s: from its sign, its post, or anywhere along its platform (tramstops.js)
function stopDist(s, r) {
  let d = Math.hypot(s.x - r.pos.x, s.z - r.pos.z);
  if (s.post) d = Math.min(d, Math.hypot(s.post.x - r.pos.x, s.post.z - r.pos.z));
  if (s.platform) {
    const [ax, az, bx, bz] = s.platform, dx = bx - ax, dz = bz - az;
    const f = clamp(((r.pos.x - ax) * dx + (r.pos.z - az) * dz) / (dx * dx + dz * dz || 1), 0, 1);
    d = Math.min(d, Math.hypot(ax + dx * f - r.pos.x, az + dz * f - r.pos.z));
  }
  return d;
}
// the stop within reach of the rider, nearest first
function signNear(r, reach = TRAM_NEAR) {
  let best = null, bd = reach;
  for (const s of TRAM_STOPS) {
    const d = stopDist(s, r);
    if (d < bd) { best = s; bd = d; }
  }
  return best;
}

// the line stopping here whose next tram is nearest: [how far that tram still is (metres, or
// Infinity when none is coming), [line, metres along it]]
function nextTram(T, sign) {
  let best = [Infinity, sign.serves[0]];
  for (const serve of sign.serves) {
    const [run, at] = serve, e = T.net.edges[run], nose = at + T.LENGTH / 2;
    for (const t of T.fleet.list) {
      const d = nose - t.head;
      if (t.edge === e && d > -0.5 && d < best[0] && t.served !== nose) best = [d, serve];
    }
  }
  return best;
}

// Every frame for each player, riding about freely: on board, waiting, or standing at a stop.
export function updateTram(r, dt) {
  const T = tramsOn();
  if (!T) { if (r.tram) leaveTram(r); return; }
  if (onTram(r)) return rideTram(r, T, dt);
  if (onBus(r)) { r.tram = null; return; }
  const w = r.tram;
  if (w?.edge) {
    // waiting: for the tram summoned, until it halts here with its doors open
    if (stopDist(w.sign, r) > TRAM_GIVE_UP) { r.tram = null; return; }
    if (!w.t || w.t.edge !== w.edge || w.t.head > w.at + T.LENGTH / 2 + 1) w.t = T.fleet.summon(w.edge, w.at, r.pos.x, r.pos.z, busyTrams(r), TRAM_SUMMON + 30, TRAM_SUMMON + T.LENGTH / 2);
    if (w.t?.stopped && Math.abs(w.t.served - (w.at + T.LENGTH / 2)) < 1) boardTram(r, w.t, w.edge);
    return;
  }
  // beside a tram that is halting, or nearly: get on it? Always (only not the one you got off a
  // moment ago). At a stop with no tram there, still or riding along its platform: wait for one?
  // (After you said no, or got off here, not that again until you have left the stop.)
  const ok = !r.afloat && r.y < 0.3;
  const sign = ok ? signNear(r) : null, near = ok ? tramBeside(T, r, sign, game.time < (r.tramLeftAt ?? -1) + 4 ? r.tramLeft : null) : null;
  if (!signNear(r, TRAM_NEAR + 6)) r.tramQuiet = false;
  r.tram = near ? { sign, near } : sign && !r.tramQuiet ? { sign } : null;
}

// A tram standing still or nearly, alongside the rider: within a few metres of its side, or, with
// the rider at stop `sign`, alongside that stop's platform. The nearest.
const TRAM_BESIDE = 4.5, TRAM_SLOW = 4; // metres from its middle line; m/s
function tramBeside(T, r, sign, but = null) {
  const at = sign?.platform ? [(sign.platform[0] + sign.platform[2]) / 2, (sign.platform[1] + sign.platform[3]) / 2] : sign ? [sign.x, sign.z] : null;
  let best = null, bd = Infinity;
  for (const t of T.fleet.list) {
    if (t === but || t.ended || t.v > TRAM_SLOW || (t.nose[0] - r.pos.x) ** 2 + (t.nose[2] - r.pos.z) ** 2 > (T.LENGTH + 40) ** 2) continue;
    for (let k = 1; k < T.LENGTH; k += 3) {
      behind(t, k, tramPos);
      const d = Math.hypot(tramPos.x - r.pos.x, tramPos.z - r.pos.z);
      // by the platform: some of the tram within the platform's half-length plus a bit of its middle
      const by = at && Math.hypot(tramPos.x - at[0], tramPos.z - at[1]) < 24;
      if ((d < TRAM_BESIDE || by) && d < bd) { best = t; bd = d; }
    }
  }
  return best;
}

const busyTrams = (but = null) => new Set(humans.filter(o => o !== but && o.tram?.t).map(o => o.tram.t));

// The fire key (or a tap on the card): yes, wait for the tram; or, on board, get off. False when
// there is no tram to answer, so the key does what it always does.
export function tramAction(r) {
  const T = tramsOn();
  if (r.bus && busAction(r)) return true;
  if (!T || !r.tram) return false;
  if (onTram(r)) {
    // get off: first which stop it would be, then (yes) out at it
    if (r.tram.ask) leaveTram(r, false, r.tram.ask);
    else r.tram.ask = exitStop(T, r.tram);
    sfx.ui();
  } else if (r.tram.near) boardTram(r, r.tram.near, r.tram.near.edge);
  else if (r.tram.edge) { r.tram = null; r.tramQuiet = true; } // changed your mind: not asked again till you ride on
  else {
    const sign = r.tram.sign, [, [run, at]] = nextTram(T, sign), edge = T.net.edges[run];
    toPlatform(r, sign);
    r.tram = { sign, edge, at, t: T.fleet.summon(edge, at, r.pos.x, r.pos.z, busyTrams(r), TRAM_SUMMON + 30, TRAM_SUMMON + T.LENGTH / 2) };
    sfx.ui();
  }
  return true;
}

// Off to wait on stop s's platform: from wherever by the stop onto the nearest spot along its middle
// (clear of its ends), looking along the track, and there you sit down to wait.
function toPlatform(r, s) {
  let x = s.post?.x ?? s.x, z = s.post?.z ?? s.z, yaw = r.yaw;
  if (s.platform) {
    const [ax, az, bx, bz] = s.platform, dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1;
    const f = clamp(((r.pos.x - ax) * dx + (r.pos.z - az) * dz) / (L * L), Math.min(0.5, 3 / L), Math.max(0.5, 1 - 3 / L));
    [x, z] = [ax + dx * f, az + dz * f];
    yaw = Math.atan2(dx, dz);
    if (Math.cos(yaw - r.yaw) < 0) yaw = wrapAngle(yaw + Math.PI); // the way along it you were going
  }
  if (Math.hypot(x - r.pos.x, z - r.pos.z) > 0.5) {
    particles.burst(r.pos.x, 1, r.pos.z, 16, { color: 0xffe680, speed: 4, up: 3, life: 0.6, size: 0.22, grow: 0.5, opacity: 0.9, drag: 3 });
    r.pos.x = x;
    r.pos.z = z;
    r.base = world.relief?.at(x, z) ?? r.base; // up on the platform
    r.baseV = 0;
  }
  Object.assign(r, { yaw, speed: 0, steer: 0, vy: 0, y: 0 });
  if (r.human >= 0) camYaw[r.human] = yaw;
}

function boardTram(r, t, edge) {
  r.tram = { riding: true, t, edge, view: 0, cam: null, seat: false, ask: null };
  t.wait = Math.min(t.wait, 2.5); // the doors close behind you
  Object.assign(r, { speed: 0, steer: 0, vy: 0, y: 0, stumbleTime: 0, spinTime: 0 });
  r.model.stars.visible = false;
  hudMsg(r.human, t_('tram.on'), 'good');
  sfx.jump(PAN[r.human]);
}

// On board: the rider goes where the middle of the tram is, looking the way it goes.
function rideTram(r, T, dt) {
  const { t } = r.tram;
  if (t.ended || t.edge !== r.tram.edge) return leaveTram(r, true);
  behind(t, T.LENGTH / 2, tramPos);
  behind(t, T.LENGTH / 2 - 4, tramAhead);
  r.pos.set(tramPos.x, 0, tramPos.z);
  r.base = tramPos.y;
  r.yaw = Math.atan2(tramAhead.x - tramPos.x, tramAhead.z - tramPos.z);
  r.speed = t.v;
  const c = humanControl(r);
  // the arrow keys turn the view round the tram; let go and it drifts back to looking ahead
  r.tram.view = wrapAngle(r.tram.view + c.steer * 1.4 * dt);
  if (Math.abs(c.steer) < 0.1) r.tram.view *= Math.exp(-dt * 0.5);
  if ((r.streetT = (r.streetT ?? 0) - dt) <= 0) {
    r.streetT = 0.3;
    r.street = streetAt(world.colliders, r.pos.x, r.pos.z) || r.street;
  }
}

// The stops of the tram's line with how far along it they are, and where the tram is (its middle).
function lineStops(T, ride) {
  const run = T.net.edges.indexOf(ride.edge), here = ride.t.head - T.LENGTH / 2, list = [];
  for (const s of TRAM_STOPS) for (const [k, at] of s.serves) if (k === run) list.push({ s, at });
  return { here, list };
}
const EXIT_NEAR = 20; // metres: a stop this close (coming up, or halted at) is where you get off
// Where you get off when you ask: the stop the tram is at or nearly at, or else the last one it passed.
function exitStop(T, ride) {
  const { here, list } = lineStops(T, ride);
  let near = null, last = null;
  for (const o of list) {
    if (!near || Math.abs(o.at - here) < Math.abs(near.at - here)) near = o;
    if (o.at < here && (!last || o.at > last.at)) last = o;
  }
  return (near && Math.abs(near.at - here) <= EXIT_NEAR ? near : last ?? near)?.s ?? null;
}

// Off the tram: at the stop given, or else at its stop nearest where it is now. Beside the sign,
// facing the way the tram went.
function leaveTram(r, end = false, stop = null) {
  const T = city?.trams, ride = r.tram;
  r.tram = null;
  r.tramQuiet = true;
  if (ride?.riding) Object.assign(r, { tramLeft: ride.t, tramLeftAt: game.time });
  if (!ride?.riding || !T) return;
  let best = stop, bd = Infinity;
  if (!best) {
    const { here, list } = lineStops(T, ride);
    for (const o of list) if (Math.abs(o.at - here) < bd) { best = o.s; bd = Math.abs(o.at - here); }
  }
  if (!best) return;
  const ux = Math.cos(best.a), uz = Math.sin(best.a), yaw = Math.atan2(ux, uz);
  // on the platform by its sign, or beside the sign where it has none
  if (best.post) r.pos.set(best.post.x - ux * 1.6, 0, best.post.z - uz * 1.6);
  else r.pos.set(best.x - ux * 1.6, 0, best.z - uz * 1.6);
  Object.assign(r, { yaw, speed: 0, steer: 0, y: 0, vy: 0, ground: 0, base: world.relief?.at(r.pos.x, r.pos.z) ?? 0, baseV: 0, onRoute: undefined });
  camYaw[r.human] = yaw;
  hudMsg(r.human, end ? t_('tram.end') : t_('tram.off', { name: best.name }), 'good');
  particles.burst(r.pos.x, 1, r.pos.z, 18, { color: 0xffe680, speed: 4, up: 3, life: 0.6, size: 0.22, grow: 0.5, opacity: 0.9, drag: 3 });
}

// By a door: which building it is and how to go in, or, inside, the way back out to the street.
// Inside, before a famous piece and no door: its name, and the key that shows it full screen.
export function updateDoorCard(h, r, p) {
  const d = p < game.players ? doorBy(r) : null;
  const a = !d && p === 0 && exploring() && game.state === 'race' ? artBy(r) : null;
  // on a touch screen the action button over the jump button does it, and the card stays away
  const tap = touch.on && p === 0;
  if (p === 0) showAction(tap ? (d ? (d.way === 'out' ? 'exit' : 'enter') : a ? 'view' : null) : null);
  h.door.classList.toggle('show', !tap && !!(d || a));
  if (a) {
    setText(h.doorEmoji, '🖼️');
    setText(h.doorLabel, t_('art.view'));
    setText(h.doorName, a.title);
    setText(h.doorKey, ctl(p).label.fire);
    return;
  }
  if (!d) return;
  const out = d.way === 'out';
  setText(h.doorEmoji, out ? '🚪' : d.room.emoji);
  setText(h.doorLabel, t_(out ? 'door.out' : 'door.in'));
  setText(h.doorName, out ? d.room.street.name ?? NAME?.[getLang()] ?? '' : roomName(d.room));
  setText(h.doorKey, touch.on && p === 0 ? t_('door.tap') : ctl(p).label.fire);
}

// Inside the tram, sitting by a window, or back out for the view from outside (the jump key, or the
// card's button). On a bus you are always inside.
export function toggleSeat(r) {
  if (!onTram(r)) return;
  r.tram.seat = !r.tram.seat;
  r.tram.cam = null; // the outside view starts again from where the camera is
  sfx.ui();
}

// ------------------------------------------------------------------ riding the bus

// Riding about freely, pass close by a bus and you are asked whether you want to get on; say yes
// and you are sitting inside by a window, looking out at the city going by. Ask to get off and
// you do at its next stop (straight away when it is standing still), on the pavement beside it.
// r.bus: { c } being asked, { riding, c, off, x, z, yaw, y } on board (where it last was).
const BUS_NEAR = 3.5; // metres from its side, nose or tail
const busesOn = () => (exploring() && city?.traffic ? city.traffic : null);
const onBus = r => !!r.bus?.riding;

// the bus within reach of the rider, nearest first, and how far off it is
function busNear(r, reach) {
  let best = null, bd = reach;
  for (const c of city.traffic.cars) {
    if (!c.on || !c.bus) continue;
    const dx = r.pos.x - c.pos.x, dz = r.pos.z - c.pos.z, fx = Math.sin(c.yaw), fz = Math.cos(c.yaw);
    const along = Math.abs(dx * fx + dz * fz) - 6, side = Math.abs(dx * fz - dz * fx) - 1.3;
    const d = Math.hypot(Math.max(0, along), Math.max(0, side));
    if (d < bd) { best = c; bd = d; }
  }
  return [best, bd];
}

export function updateBus(r, dt) {
  const T = busesOn();
  if (!T) { if (r.bus) leaveBus(r); return; }
  if (onBus(r)) return rideBus(r, dt);
  // not while on the tram or waiting for one, nor afloat or in the air
  if (r.tram || r.afloat || r.y > 0.3) { r.bus = null; return; }
  const [c] = busNear(r, BUS_NEAR);
  // the one you said no to, or just got off, does not ask again until you are clear of it
  if (r.busQuiet && busNear(r, BUS_NEAR + 4)[0] !== r.busQuiet) r.busQuiet = null;
  r.bus = c && c !== r.busQuiet ? { c } : null;
}

// The fire key (or a tap on the card) by a bus: get on; on board: get off (at the next stop).
function busAction(r) {
  if (!busesOn() || !r.bus) return false;
  if (!onBus(r)) boardBus(r, r.bus.c);
  else if (r.bus.ask) {
    // confirmed: back at the last stop, straight away; or at the one it is at / coming up, when it halts
    const { at, back } = r.bus.ask;
    r.bus.ask = null;
    if (back) leaveBus(r, false, at);
    else if (r.bus.c.wait > 0 || r.bus.c.speed < 0.5) leaveBus(r);
    else r.bus.off = true;
  } else if (r.bus.off) r.bus.off = false; // not stopping after all
  else r.bus.ask = busExitStop(r.bus);
  sfx.ui();
  return true;
}

function boardBus(r, c) {
  r.tram = null;
  r.bus = { riding: true, c, off: false, x: c.pos.x, z: c.pos.z, y: c.pos.y, yaw: c.yaw };
  Object.assign(r, { speed: 0, steer: 0, vy: 0, y: 0, stumbleTime: 0, spinTime: 0 });
  r.model.stars.visible = false;
  hudMsg(r.human, t_('bus.on'), 'good');
  sfx.jump(PAN[r.human]);
}

// On board: the rider goes where the bus is, looking the way it goes. It may be gone (the end of
// its line), or taken off for a street somewhere else: then off you get where it last was.
function rideBus(r, dt) {
  const b = r.bus, c = b.c;
  if (!c.on || Math.hypot(c.pos.x - b.x, c.pos.z - b.z) > 20) return leaveBus(r, true);
  if (b.off && c.wait > 0) return leaveBus(r);
  Object.assign(b, { x: c.pos.x, z: c.pos.z, y: c.pos.y, yaw: c.yaw });
  r.pos.set(c.pos.x, 0, c.pos.z);
  r.base = c.pos.y;
  r.yaw = c.yaw;
  r.speed = c.speed;
  if ((r.streetT = (r.streetT ?? 0) - dt) <= 0) {
    r.streetT = 0.3;
    r.street = streetAt(world.colliders, r.pos.x, r.pos.z) || r.street;
  }
}

// Where you get off when you ask, as the tram does: the stop it is at or nearly at (it halts there,
// or is about to), or else the last one it halted at. { stop, back }: back when it is behind us.
function busExitStop(b) {
  const T = city.traffic, c = b.c;
  const at = T.nextStop(c), next = at && busStopNear(at.x, at.z, 40);
  if (next && (c.wait > 0 || Math.hypot(at.x - c.pos.x, at.z - c.pos.z) <= EXIT_NEAR)) return { stop: next, back: false };
  const was = T.prevStop(c), prev = was && busStopNear(was.x, was.z, 40);
  if (prev) return { stop: prev, back: true, at: was };
  return next ? { stop: next, back: false } : { stop: null, back: false };
}

// Off the bus: on the pavement to the right of it, by its middle door, facing the way it goes; or,
// at a stop given (the last one), on the pavement there.
function leaveBus(r, end = false, at = null) {
  const b = r.bus;
  r.bus = null;
  if (!b?.riding) return;
  r.busQuiet = b.c;
  const fx = Math.sin(b.yaw), fz = Math.cos(b.yaw);
  if (at) r.pos.set(at.x - fz * 2.4, 0, at.z + fx * 2.4);
  else r.pos.set(b.x - fz * 2.4, 0, b.z + fx * 2.4);
  Object.assign(r, { yaw: b.yaw, speed: 0, steer: 0, y: 0, vy: 0, ground: 0, base: world.relief?.at(r.pos.x, r.pos.z) ?? 0, baseV: 0, onRoute: undefined });
  camYaw[r.human] = b.yaw;
  const stop = !end && busStopNear(r.pos.x, r.pos.z, 30);
  hudMsg(r.human, end ? t_('bus.end') : stop ? t_('bus.offAt', { name: stop.name }) : t_('bus.off'), 'good');
  particles.burst(r.pos.x, 1, r.pos.z, 18, { color: 0xffe680, speed: 4, up: 3, life: 0.6, size: 0.22, grow: 0.5, opacity: 0.9, drag: 3 });
}

// the bus stop (the city's STOPS) nearest (x, z), within reach metres
function busStopNear(x, z, reach) {
  let best = null, bd = reach;
  for (const s of STOPS ?? []) {
    if (s.kind !== 'bus') continue;
    const d = Math.hypot(s.x - x, s.z - z);
    if (d < bd) { best = s; bd = d; }
  }
  return best;
}

// The card for the tram or the bus: a big TRAM (or BUS) over the question at a stop, the tram on
// its way, or one halting there to get on; and a button for it, as well as the key. On board it is a
// bar right across the top instead, with nothing else up there: where it goes, the next stop, and
// the button to get off (or Enter, or Escape), which first asks at which stop: yes, or no after all.
export function updateTramCard(h, r, p) {
  const T = tramsOn(), w = r.tram, keys = !(touch.on && p === 0);
  const c = r.bus && busesOn() ? busCard(r) : T && w ? tramCard(T, r, w, keys) : null;
  const on = !!c?.on;
  h.tram.classList.toggle('show', !!c);
  h.tram.classList.toggle('aboard', on);
  h.el.classList.toggle('aboard', on);
  h.el.classList.toggle('tramnear', !!c); // the sight's card makes way for it
  h.street.classList.toggle('aboard', on);
  if (!c) return;
  if (!on) placeTramCard(h);
  else if (h.tram.style.top) h.tram.style.top = '';
  setText(h.tramHead, c.head);
  badge(h, c.line, c.icon);
  setText(h.tramLabel, c.label);
  setText(h.tramName, c.name);
  setHtml(h.tramText, c.text ?? '');
  const key = ctl(p).label.fire;
  setText(h.tramGo, keys ? `${c.go} · ${on && !c.cancel ? `${key} / ESC` : key}` : c.go);
  h.tramSeat.hidden = !c.seat && !c.cancel;
  if (c.cancel) setText(h.tramSeat, keys ? `${c.cancel} · ESC` : c.cancel);
  else if (c.seat) setText(h.tramSeat, `${w.seat ? t_('tram.stand') : t_('tram.sit')}${keys ? ` · ${ctl(p).label.jump}` : ''}`);
}

function tramCard(T, r, w, keys) {
  if (onTram(r)) {
    const l = w.edge.line, along = w.t.head - T.LENGTH / 2;
    const next = l.stops.find(st => st.at > along + 5);
    // asked to get off: at which stop, yes or no
    if (w.ask) return { on: true, head: t_('tram.headOn'), line: l, label: '', name: t_('tram.askOff', { name: w.ask.name }), go: t_('tram.btnYes'), cancel: t_('tram.btnCancel') };
    return {
      on: true, seat: true, head: t_('tram.headOn'), line: l,
      label: next ? t_('tram.next', { name: next.name }) : '',
      name: `→ ${l.to}`,
      text: keys && !w.seat ? t_('tram.lookKey') : '',
      go: t_('tram.btnGetOff'),
    };
  }
  if (w.near) {
    const l = w.near.edge.line;
    return { head: t_('tram.head'), line: l, label: w.sign ? `${t_('tram.stop')} · ${w.sign.name}` : t_('tram.label'), name: t_('tram.board', { ref: l.ref, to: l.to }), go: t_('tram.btnBoard') };
  }
  if (w.edge) {
    const l = w.edge.line, d = w.t ? Math.max(0, w.at + T.LENGTH / 2 - w.t.head) : null;
    return {
      head: t_('tram.head'), line: l, label: `${t_('tram.stop')} · ${w.sign.name}`, name: `→ ${l.to}`,
      text: t_('tram.coming') + (d != null && d > 15 ? ` · ${Math.round(d / 10) * 10} m` : ''), go: t_('tram.btnCancel'),
    };
  }
  const via = [...new Map(w.sign.serves.map(([run]) => T.net.edges[run].line).map(l => [l.ref + l.to, l])).values()];
  return { head: t_('tram.head'), label: t_('tram.stop'), name: w.sign.name, text: via.map(l => `${l.ref} → ${l.to}`).join(' · '), go: t_('tram.btnWait') };
}

function busCard(r) {
  const b = r.bus, ref = b.c.p.ref, line = ref ? { ref } : null;
  if (!onBus(r)) return { head: t_('bus.head'), line, icon: '🚌', label: t_('bus.label'), name: t_('bus.ask'), go: t_('bus.btnBoard') };
  if ((b.nextT = (b.nextT ?? 0) - 1) <= 0) {
    b.nextT = 20; // every so many frames: where it halts next
    const at = city.traffic.nextStop(b.c);
    b.next = at && busStopNear(at.x, at.z, 40);
  }
  if (b.ask?.stop) return { on: true, head: t_('bus.headOn'), line, icon: '🚌', label: '', name: t_('tram.askOff', { name: b.ask.stop.name }), go: t_('tram.btnYes'), cancel: t_('tram.btnCancel') };
  return {
    on: true, head: t_('bus.headOn'), line, icon: '🚌',
    label: b.next ? t_('tram.next', { name: b.next.name }) : t_('bus.label'),
    name: ref ? t_('bus.line', { ref }) : t_('bus.label'),
    text: b.off ? t_('bus.stopping') : '',
    go: b.off ? t_('tram.btnStay') : t_('tram.btnOff'),
  };
}
// Under what sits at the top above it (the minimap, and the street sign with the 🗺️ label under it:
// in the middle, or on a phone down the left), never over it.
function placeTramCard(h) {
  const box = h.el.getBoundingClientRect(), card = h.tram.getBoundingClientRect();
  let low = 0;
  for (const e of [$('minimap'), h.street]) {
    const b = e.getBoundingClientRect();
    if (b.height && b.left < card.right && b.right > card.left) low = Math.max(low, b.bottom);
  }
  const top = low ? `${Math.round(low - box.top + 10)}px` : '';
  if (h.tram.style.top !== top) h.tram.style.top = top;
}
function badge(h, line, icon = '🚋') {
  h.tramBadge.classList.toggle('plain', !line);
  setText(h.tramBadge, line ? line.ref : icon);
  h.tramBadge.style.setProperty('--line', line?.colour ?? '');
}
function setHtml(el, v) {
  if (el._v !== v) { el._v = v; el.innerHTML = v; }
}
