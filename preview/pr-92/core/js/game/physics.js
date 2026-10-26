// Physics: how a rider moves (riding, running, swimming, sailing, flying the helicopter), hitting the
// buildings, the cars and the people; the borrowed cars and the paintball gun; the tram rails that
// catch a front wheel; and the shouts as riders bump into each other.

import * as THREE from 'three';
import { TRACKS } from '../tracks.js';
import { createWalker } from '../riders.js';
import { getLang } from '../i18n.js';
import { carGroup, CAR_TYPES } from '../cars.js';
import { groundAt, BAND } from '../parking.js';
import { SHIRTS } from '../people.js';
import { PORTALS, QUESTS, ROWING } from '../city.js';
import { addCarColliders, collide, inWater, swimAt, waterLevel, bankAt, streetAt, clearLine } from '../collide.js';
import { WADE, WATER } from '../relief.js';
import { HILLS, slopeAlong } from '../terrain.js';
import { sfx } from '../sound.js';
import { buzz } from '../haptics.js';
import { splatHit, vehicleSplat } from '../splat.js';
import { SECTION as TRAM_SECTION, W as TRAM_W } from '../trams.js';
import {
  t_, MAX_SPEED, SWIM_SPEED, BOAT_SPEED, ACCEL, HILL_PULL, HILL_SLOW, BRAKE, COAST, REVERSE_MAX, TURN_RATE,
  HORSE_RADIUS, JUMP_V, HELI_SPEED, HELI_CLIMB, HELI, GRAVITY, STUMBLE_TIME, STEP_UP, STEP_DOWN, SOAK_SLOW, PAN,
  clamp, approach, wrapAngle, $,
} from './base.js';
import { game } from './settings.js';
import { scene, particles, camYaw } from './scene.js';
import { roaming, questing, quest, progressOf, world, city, track } from './worlds.js';
import { humans, field, ctl } from './racers.js';
import { setText, hudMsg } from './hud.js';
import { onLap } from './race.js';
import { INSIDE_PACE, INSIDE_COAST, inRoom, intoDoor } from './indoors.js';
import { loud } from './pickups.js';
import { onTram, riding, toggleSeat } from './transit.js';
import { touch } from './input.js';

// car+paintball mode everywhere can be picked on the menu once the hidden settings opened it up
export const paintballUnlocked = () => game.paintballUnlocked;
// the paint fight: the mission with the paintball gun (and cars to borrow)
const paintQuest = () => questing() && QUESTS[game.mission - 1]?.kind === 'paint';

// the paintball gun (car+paintball mode) in hand, whatever you ride, exploring and in every quest
export const paintballActive = () => paintQuest() || (game.paintball && paintballUnlocked()); // the paint fight, or switched on everywhere
export const paintballOn = r => paintballActive() && r.human >= 0 && game.kind === 'mission' && !r.car;

// Free roaming with the paintball gun: shots fly on until they hit a wall, a walker or a cyclist, who is covered in blue and falls.
export const paintShots = [];
const PAINT_BALL = new THREE.SphereGeometry(0.1, 8, 6), PAINT_MAT = new THREE.MeshStandardMaterial({ color: 0x8a8f98, roughness: 0.4, metalness: 0.5 });
function firePaint(r) {
  if ((r.paintCd ?? 0) > 0 || game.state !== 'race') return false;
  r.paintCd = 0.12;
  const fx = Math.sin(r.yaw), fz = Math.cos(r.yaw), mesh = new THREE.Mesh(PAINT_BALL, PAINT_MAT);
  const shot = { r, x: r.pos.x + fx * 0.5, y: r.base + r.y + 1.35, z: r.pos.z + fz * 0.5, vx: fx * 42, vz: fz * 42, vy: 0.4, age: 0, mesh };
  mesh.position.set(shot.x, shot.y, shot.z);
  scene.add(mesh);
  paintShots.push(shot);
  return true;
}
// the shoot button: paint at the walkers and cyclists, or in a quest with shots to throw (the zombies) the quest's own paintballs
export function shoot(r) {
  if (!paintballOn(r) || game.state !== 'race') return;
  const ok = quest?.def.tequila ? quest.throwTequila(r, true) : firePaint(r);
  if (ok) { sfx.throw(PAN[r.human]); buzz('tap'); }
}
export function updatePaint(dt) {
  for (const r of humans) if (r.paintCd > 0) r.paintCd -= dt;
  for (let i = paintShots.length - 1; i >= 0; i--) {
    const s = paintShots[i], nx = s.x + s.vx * dt, nz = s.z + s.vz * dt;
    s.vy -= 3 * dt;
    const ny = s.y + s.vy * dt;
    s.age += dt;
    const hit = world.people?.paintHit(s.x, s.z, nx, nz, s.y) ?? world.cyclists?.paintHit(s.x, s.z, nx, nz, s.y) ?? splatHit(city?.targets, s.x, s.z, nx, nz, s.y);
    const splat = !hit && vehicleSplat(paintBoxes(s.x, s.z), s.x, s.z, nx, nz, s.y); // (a car, a bus or a tram: the paint sticks)
    const blocked = !hit && !splat && world.colliders && clearLine(world.colliders, s.x, s.z, nx, nz) < 1;
    // in the paint fight: a point for a person, more for a car or bus or a tram (each once)
    if (hit) quest?.score?.(s.r, hit, 1);
    else if (splat) quest?.score?.(s.r, splat.box.who, splat.box.pts, true);
    if (splat) particles.burst(splat.x, splat.y, splat.z, 6, { color: [0x1e66f5, 0x4f8cff], speed: 3, up: 2, gravity: 9, life: 0.5, size: 0.14, drag: 1.5 });
    if (hit) {
      particles.burst(hit.x, hit.y, hit.z, 10, { color: [0x1e66f5, 0x4f8cff, 0x0d3fb8], speed: 5, up: 3, gravity: 9, life: 0.8, size: 0.18, drag: 1.5 });
      if (loud()) sfx.drop(0);
    }
    if (hit || splat || blocked || s.age > 1.5 || ny < 0.05) {
      scene.remove(s.mesh);
      paintShots.splice(i, 1);
    } else {
      Object.assign(s, { x: nx, y: ny, z: nz });
      s.mesh.position.set(nx, ny, nz);
    }
  }
}

// The cars, buses and trams near a shot at (x, z), as boxes for the paint to stick to (splat.js): the parked
// cars, the traffic (its paint in a group that follows the car, see carPaint) and the trams' sections
export const paintedCars = new Set(); // the traffic's cars with paint on
function paintBoxes(x, z) {
  const boxes = [], near = (px, pz, R = 30) => (px - x) ** 2 + (pz - z) ** 2 < R * R;
  const size = type => { const t = CAR_TYPES[type]; return { len: t.len, w: t.w, h: t.tall ? 3.15 : 1.5 }; };
  // a group at the car, turned with it: stuck to the scene where it stands, or to its model once borrowed
  const holder = (c, x, y, z, yaw) => () => {
    if (!c.paint) {
      c.paint = new THREE.Group();
      if (c.model) c.model.add(c.paint);
      else { c.paint.position.set(x, y, z); c.paint.rotation.y = yaw; scene.add(c.paint); }
    }
    return c.paint;
  };
  for (const c of track.parkedCars ?? []) {
    if (c.stolen || !near(c.x, c.z)) continue;
    const y = c.model ? c.model.position.y : world.relief?.at(c.x, c.z) ?? 0;
    boxes.push({ x: c.x, y, z: c.z, yaw: c.yaw, ...size(c.type), who: c, pts: 2, holder: holder(c, c.x, y, c.z, c.yaw) });
  }
  for (const c of city?.traffic?.cars ?? []) {
    if (!c.on || !near(c.pos.x, c.pos.z)) continue;
    boxes.push({ x: c.pos.x, y: c.pos.y, z: c.pos.z, yaw: c.yaw, ...size(c.type), who: c, pts: 2, holder: () => {
      if (!c.paint) { c.paint = new THREE.Group(); scene.add(c.paint); }
      paintedCars.add(c);
      c.paint.position.copy(c.pos);
      c.paint.rotation.set(0, c.yaw, 0);
      return c.paint;
    } });
  }
  for (const t of city?.trams?.fleet.list ?? []) {
    if (!near(t.nose[0], t.nose[2], 80)) continue;
    for (const m of t.sections) {
      if (near(m.position.x, m.position.z, 34)) boxes.push({ x: m.position.x, y: m.position.y, z: m.position.z, yaw: m.rotation.y, len: TRAM_SECTION, w: TRAM_W, h: 3.3, who: t, pts: 3, mesh: m, holder: () => m }); // (hit on its mesh: the nose sticks out past the box)
    }
  }
  return boxes;
}
// the paint on the traffic's cars follows them; gone when the car is (or jumps off somewhere else)
export function carPaint() {
  for (const c of paintedCars) {
    if (!c.on || c.pos.distanceToSquared(c.paint.position) > 100) { c.paint.removeFromParent(); c.paint = null; paintedCars.delete(c); continue; }
    c.paint.position.copy(c.pos);
    c.paint.rotation.set(0, c.yaw, 0);
  }
}

// Stealing a parked car (with the paintball gun on, free roaming): the car's instance is hidden and a car of its own
// drives off with you in it; get out and it stays standing where you left it.
const NO_CAR = new THREE.Matrix4().makeScale(0, 0, 0);
const ejected = []; // the ones thrown out of their car, running off
export function stealCar(r, c) {
  let speed0 = 0;
  if (c.p) {
    // a car (or bus) that is driving: out goes whoever was at the wheel, who runs off shouting
    const t = CAR_TYPES[c.type], right = { x: Math.cos(c.yaw), z: -Math.sin(c.yaw) };
    const who = createWalker({ name: t_('car.he'), silk: SHIRTS[Math.floor(Math.random() * SHIRTS.length)], cap: 0x222222, labelLayer: 0 }, Math.floor(Math.random() * 8));
    who.root.position.set(c.pos.x + right.x * (t.w / 2 + 1), c.pos.y, c.pos.z + right.z * (t.w / 2 + 1));
    who.root.rotation.y = Math.atan2(right.x, right.z);
    scene.add(who.root);
    ejected.push({ who, vx: right.x * 3.2, vz: right.z * 3.2, age: 0 });
    speed0 = c.speed;
    c.on = false;
    const paint = c.paint;
    if (paint) { paintedCars.delete(c); c.paint = null; } // its paint comes along
    c = { type: c.type, c: c.c ?? 0xffffff, x: c.pos.x, z: c.pos.z, yaw: c.yaw, paint };
    track.parkedCars?.push(c);
  }
  c.stolen = true;
  for (const [im, i] of c.slots ?? []) { im.setMatrixAt(i, NO_CAR); im.instanceMatrix.needsUpdate = true; }
  for (const t of c.cols ?? []) t.dead = true;
  const model = c.model ?? carGroup(c.type, c.c ?? 0xdddddd);
  c.model = model;
  scene.add(model);
  if (c.paint && c.paint.parent !== model) { model.add(c.paint); c.paint.position.set(0, 0, 0); c.paint.rotation.set(0, 0, 0); } // the paint on it drives off with it
  r.car = c;
  r.carNear = null;
  r.speedFactor = 1.5; // a car is quicker than you on foot
  r.pos.x = c.x;
  r.pos.z = c.z;
  r.yaw = c.yaw;
  r.speed = speed0;
  if (loud()) { sfx.bump(PAN[r.human]); buzz('tap'); }
  syncJumpButton();
}
function leaveCar(r) {
  const c = r.car, side = 2.6;
  Object.assign(c, { x: r.pos.x, z: r.pos.z, yaw: r.yaw, stolen: false });
  c.model.visible = true; // (hidden from the cab while you drove it)
  addCarColliders(world.colliders.things, c); // it stands there now
  r.car = null;
  r.speedFactor = 1;
  sfx.engine(null);
  r.pos.x += Math.cos(r.yaw) * side;
  r.pos.z -= Math.sin(r.yaw) * side;
  r.speed = 0;
  syncJumpButton();
}
// A borrowed bus or bin lorry is driven from its seat, looking out through the windscreen: where the
// driver's eyes are (metres ahead of the middle, to the left, and up)
const CABS = { bus: { z: 4.9, x: 0.62, y: 2.3 }, bins: { z: 3.55, x: 0.6, y: 2.5 } };
export const cabOf = r => (r.car && CABS[r.car.type]) || null;

// which parked car, if any, is within reach (looked up a few times a second)
export function carTick(dt) {
  for (let i = ejected.length - 1; i >= 0; i--) {
    const e = ejected[i], p = e.who.root.position;
    e.age += dt;
    p.x += e.vx * dt;
    p.z += e.vz * dt;
    e.who.animate(dt, 3.2, 0, e.age);
    if (e.age > 5) { scene.remove(e.who.root); ejected.splice(i, 1); }
  }
  const driver = humans.find(h => h.car && h.human === 0), pilot = humans.find(h => h.heli && h.human === 0);
  // the helicopter's rotor, or a car's engine
  const sounding = game.state === 'race' && sfx.sfxOn;
  sfx.rotor(pilot && sounding ? clamp(Math.abs(pilot.speed) / HELI_SPEED + Math.abs(pilot.vy) / HELI_CLIMB, 0, 1) : null);
  sfx.engine(driver && !pilot && sounding ? clamp(Math.abs(driver.speed) / (MAX_SPEED * 1.5), 0, 1) : null);
  for (const r of humans) {
    if (r.human < 0 || !borrowActive() || game.kind !== 'mission' || r.car) { if (r.carNear) r.carNear = null; continue; }
    if ((r.carT = (r.carT ?? 0) - dt) > 0) continue;
    r.carT = 0.2;
    let best = null, bd = Infinity;
    // the bus driver mission: only its bus (reached from its door side, it is long)
    if (busQuest() && questBus && !questBus.stolen && r.y < 0.8 && (questBus.x - r.pos.x) ** 2 + (questBus.z - r.pos.z) ** 2 < 7 * 7) best = questBus;
    if (paintballOn(r) && r.y < 0.8) for (const c of track.parkedCars ?? []) {
      if (c.stolen) continue;
      const d = (c.x - r.pos.x) ** 2 + (c.z - r.pos.z) ** 2;
      if (d < 4.5 * 4.5 && d < bd) { bd = d; best = c; }
    }
    // and the cars and buses on the road, within reach of their sides
    if (paintballOn(r) && r.y < 0.8) for (const c of city?.traffic?.cars ?? []) {
      if (!c.on) continue;
      const reach = CAR_TYPES[c.type].len / 2 + 3.5, d = (c.pos.x - r.pos.x) ** 2 + (c.pos.z - r.pos.z) ** 2;
      if (d < reach * reach && d < bd) { bd = d; best = c; }
    }
    if (best !== r.carNear) { r.carNear = best; if (r.human === 0) syncJumpButton(); }
  }
}

// The bus driver: the mission's bus, standing at its stop, a parked car to borrow (stealCar), and its
// driver, who runs off to the toilet the moment the mission starts
export let questBus = null;
export function placeQuestBus(q) {
  const { x, z, yaw } = q.busSpot, c = { type: 'bus', c: 0xf4f4f2, x, z, yaw, model: carGroup('bus', 0xf4f4f2) };
  c.model.position.set(x, world.relief?.at(x, z) ?? 0, z);
  c.model.rotation.y = yaw;
  scene.add(c.model);
  track.parkedCars?.push(c);
  q.bus = questBus = c;
}
export function dropQuestBus() {
  if (!questBus) return;
  scene.remove(questBus.model);
  const list = track.parkedCars ?? [], i = list.indexOf(questBus);
  if (i >= 0) list.splice(i, 1);
  questBus = null;
}
export function busDriverRuns() {
  const c = questBus, t = CAR_TYPES.bus, right = { x: Math.cos(c.yaw), z: -Math.sin(c.yaw) };
  const who = createWalker({ name: t_('bus.driver'), silk: 0xf4f4f2, cap: 0xffd200, labelLayer: 0 }, 3);
  who.root.position.set(c.x + right.x * (t.w / 2 + 0.8), c.model.position.y, c.z + right.z * (t.w / 2 + 0.8));
  const away = c.yaw + Math.PI * 0.75; // off along the pavement, behind the bus
  who.root.rotation.y = away;
  scene.add(who.root);
  ejected.push({ who, vx: Math.sin(away) * 3.4, vz: Math.cos(away) * 3.4, age: 0 });
  humans.forEach((h, p) => hudMsg(p, t_('bus.toilet'), 'gold'));
}

// Borrowing a car: with the paint gun on (any car or bus), or in the bus driver mission (only its bus)
export const busQuest = () => questing() && QUESTS[game.mission - 1]?.kind === 'bus';
const borrowActive = () => paintballActive() || busQuest();

// the round button by the stick: jump, or a tequila shot, or (with the paintball gun on) stealing a car and getting out of it
let jumpKey = '';
export function syncJumpButton() {
  const me = humans[0], free = !!me && game.kind === 'mission' && borrowActive();
  document.body.classList.toggle('gunfree', free && paintballOn(me)); // (not from inside a borrowed car)
  if (free && (me.car || me.carNear)) {
    const label = t_(me.car ? 'car.exit' : 'car.steal'), icon = me.car ? '🚪' : '🚗';
    if (jumpKey === label) return;
    jumpKey = label;
    $('tJump').querySelector('span').innerHTML = icon;
    setText($('tJump').querySelector('small'), label);
    $('tJump').setAttribute('aria-label', label);
    return;
  }
  jumpKey = '';
  // (with the gun the shots go on the shoot button, and this one jumps)
  const tequila = questing() && !!QUESTS[game.mission - 1]?.tequila && !paintballActive();
  const label = tequila ? t_('quest.tequila') : me?.heli ? t_('tb.up') : t_('tb.jump');
  $('tJump').querySelector('span').innerHTML = tequila ? '<img src="/preview/pr-92/core/img/tequila.svg" alt="">' : '⤒';
  $('tJump').classList.remove('charging');
  setText($('tJump').querySelector('small'), label);
  $('tJump').setAttribute('aria-label', label);
}

export function jump(r) {
  if (r.heli) return; // in the helicopter the jump key climbs (humanControl)
  if (game.state === 'race' && game.kind === 'mission' && borrowActive() && r.human >= 0) {
    // with the gun on (or the bus to drive): the jump button borrows the car beside you, and gets you out of it again
    if (r.car) return leaveCar(r);
    if (r.carNear) return stealCar(r, r.carNear);
  }
  if (game.state === 'race' && quest?.def.tequila && !paintballActive()) {
    if (quest.throwTequila(r)) { sfx.throw(PAN[r.human]); buzz('tap'); }
    return;
  }
  if (onTram(r)) return toggleSeat(r); // on the tram: inside to a seat, or back out
  if (riding(r) || !r.grounded || r.spinTime > 0 || r.rearTime > 0 || r.stunTime > 0) return;
  r.vy = JUMP_V;
  r.y += 0.001;
  if (r.human >= 0 && game.state === 'race') sfx.jump(PAN[r.human]);
}

export function stepRacer(r, dt, c) {
  if (r.heli) return stepHeli(r, dt, c);
  for (const k of ['stunTime', 'rearTime', 'stumbleTime', 'soakTime', 'invuln', 'obstacleCd', 'wallTimer', 'railTime', 'railCd']) {
    r[k] = Math.max(0, r[k] - dt);
  }
  if (r.spinTime > 0) {
    r.spinTime -= dt;
    c.throttle = 0;
    c.steer = 0;
    r.speed *= Math.exp(-2.2 * dt);
    if (r.spinTime <= 0) r.model.stars.visible = false;
  }
  if (r.stunTime > 0) c.throttle = 0;
  if (r.railDown && r.railTime <= 0) {
    r.railDown = false; // back up and on the bike
    r.model.stars.visible = false;
  }
  if (r.railTime > 0) {
    // come off on the tram rails: lying on the cobbles, the bike sliding to a stop
    c.throttle = 0;
    c.steer = 0;
    r.speed = approach(r.speed, 0, RAIL_SLOW * dt);
  }

  const airborne = !r.grounded;
  if (!airborne) {
    const max = MAX_SPEED * (world.cfg.pace ?? 1) * r.speedFactor * (r.soakTime > 0 ? SOAK_SLOW : 1) * (r.room ? INSIDE_PACE : 1);
    if (c.throttle > 0) {
      if (r.speed < 0) r.speed += BRAKE * dt;
      else if (r.speed < max) r.speed = Math.min(max, r.speed + ACCEL * c.throttle * (1 - 0.55 * r.speed / MAX_SPEED) * dt);
      else r.speed = approach(r.speed, max, 12 * dt);
    } else if (c.throttle < 0) {
      r.speed = r.speed > 0 ? r.speed - BRAKE * dt : Math.max(-REVERSE_MAX, r.speed - 10 * dt);
    } else {
      r.speed = approach(r.speed, 0, COAST * (r.room ? INSIDE_COAST : 1) * dt);
    }
    if (r.soakTime > 0 && r.speed > max) r.speed = approach(r.speed, max, 25 * dt);
    if (HILLS) {
      // up a hill is hard going and down it runs away with you
      const climb = slopeAlong(r.pos.x, r.pos.z, Math.sin(r.yaw), Math.cos(r.yaw)) * Math.sign(r.speed || 1);
      r.speed -= Math.sign(r.speed) * HILL_PULL * climb * dt;
      if (climb > 0 && Math.abs(r.speed) > max * (1 - HILL_SLOW * climb)) r.speed = approach(r.speed, Math.sign(r.speed) * max * Math.max(0.5, 1 - HILL_SLOW * climb), 10 * dt);
    }
  }

  r.steer = approach(r.steer, c.steer, 7 * dt);
  const sp = Math.abs(r.speed);
  const turn = TURN_RATE * Math.min(1, 0.3 + sp / 7) * (1 - 0.3 * Math.min(1, sp / MAX_SPEED)) * (airborne ? 0.45 : 1);
  r.yaw = wrapAngle(r.yaw + r.steer * turn * dt * (r.speed < -0.3 ? -1 : 1));
  const was = { x: r.pos.x, z: r.pos.z, idx: r.idx, lat: r.lat };
  r.pos.x += Math.sin(r.yaw) * r.speed * dt;
  r.pos.z += Math.cos(r.yaw) * r.speed * dt;
  if (roaming()) { roamAbout(r, dt); if (!throughPortal(r, was)) railCheck(r, was); }
  else followTrack(r, dt);
  if (r.human >= 0) { inRoom(r); if (roaming()) intoDoor(r); }
  if (!roaming() && r.onRoute !== false) hitObstacles(r);
  stepHeight(r, dt, was, airborne);
  stepRelief(r, dt);
}

// Flying the police helicopter: forward and back, turning on the spot, up and down (c.lift), with
// some weight to it. r.base is the ground below (or the water), r.y the height above it; low down
// the buildings are in the way, higher up it flies over them. f: how it flies (HELI, or the DRAGON)
export function stepHeli(r, dt, c, f = HELI) {
  const ground = (world.relief?.at(r.pos.x, r.pos.z) ?? 0) + f.floor;
  const low = world.colliders && inWater(world.colliders, r.pos.x, r.pos.z) ? (waterLevel(world.colliders, r.pos.x, r.pos.z) ?? WATER) + Math.max(1.5, f.floor) : ground; // (it does not set down on the water)
  const alt = r.base + r.y, landed = alt <= low + 0.02;
  // pressing on near the ground lifts off by itself, so it goes as soon as you press forward
  const lift = (c.lift ?? 0) || (c.throttle > 0 && alt - low < 6 ? 1 : 0);
  r.heliFloor = low === ground ? ground : low - 1.5; // where its shadow falls: the ground, or the water
  r.vy = approach(r.vy, lift * f.climb, (lift ? f.rise : f.sink) * dt);
  const top = landed && lift <= 0 && !f.floor ? 4 : f.speed; // on its skids it only shuffles about
  const want = c.throttle > 0 ? c.throttle * top : c.throttle < 0 ? c.throttle * top * 0.3 : 0;
  r.speed = approach(r.speed, want, (want * r.speed < 0 ? f.accel * 1.5 : want ? f.accel : f.accel * 0.7) * dt); // pulling back brakes hard
  r.steer = approach(r.steer, c.steer, 4 * dt);
  r.yaw = wrapAngle(r.yaw + r.steer * f.turn * dt);
  r.pos.x += Math.sin(r.yaw) * r.speed * dt;
  r.pos.z += Math.cos(r.yaw) * r.speed * dt;
  const h = clamp(alt + r.vy * dt, low, low + f.top);
  if (h === low && r.vy < 0) r.vy = 0;
  r.base = low;
  r.y = h - low;
  r.tilt = approach(r.tilt ?? 0, (want - r.speed) / f.speed * 0.6 + r.speed / f.speed * 0.12, 2 * dt); // nose down speeding up, up slowing down
  r.bank = approach(r.bank ?? 0, -r.steer * Math.min(1, Math.abs(r.speed) / 15) * 0.3, 2 * dt);
  if (r.y < f.low && world.colliders) {
    const into = collide(world.colliders, r, f.radius);
    if (into > 0) r.speed *= Math.exp(-into * 2.8 * dt);
  }
  if (r.human >= 0 && (r.streetT = (r.streetT ?? 0) - dt) <= 0) {
    r.streetT = 0.3;
    r.street = streetAt(world.colliders, r.pos.x, r.pos.z) || r.street;
  }
}

// Up onto a bridge and down again. r.y is the height above the street; r.base is how high the
// street is. Off the side of a bridge the rider drops to the ground below.
function stepRelief(r, dt) {
  let target = r.room ? 0 : roaming() ? (world.relief?.at(r.pos.x, r.pos.z, r.base) ?? 0) : track.riseAt(r.idx);
  // into the water, down between the quay walls (or under a bridge); never inside a building, though
  // the map's water may run on under where it stands (js/interiors.js)
  const bank = roaming() && !r.room && target < 0.05 && world.colliders ? bankAt(world.colliders, r.pos.x, r.pos.z) : undefined;
  if (bank !== undefined) target = bank; // down the grass slope of a canal's bank, on foot still
  else if (roaming() && !r.room && target < 0.05 && world.colliders && inWater(world.colliders, r.pos.x, r.pos.z)) {
    r.water = waterLevel(world.colliders, r.pos.x, r.pos.z) ?? WATER;
    target = r.water + WADE - WATER;
  }
  if (target >= r.base - 0.25) {
    r.base = target;
    r.baseV = 0;
  } else {
    r.baseV -= GRAVITY * dt;
    r.base = Math.max(target, r.base + r.baseV * dt);
    if (r.base === target) r.baseV = 0;
  }
}

// Free roam: no rails, the buildings are the walls. Near the race route the rider still has a
// place on it, for the parked cars to ride over and the barriers to jump.
function roamAbout(r, dt) {
  const near = track.distTo(r.pos.x, r.pos.z) < track.hw + 4;
  if (near) {
    r.idx = track.nearest(r.pos.x, r.pos.z, r.onRoute ? r.idx : -1);
    r.lat = track.lateral(r.pos.x, r.pos.z, r.idx);
  }
  r.onRoute = near && Math.abs(r.lat) < track.hw + 0.3;
  // the trams too, but not the one just got off, still standing at the stop
  const left = game.time < (r.tramLeftAt ?? -1) + 4 ? r.tramLeft : null;
  const into = Math.max(collide(world.colliders, r, HORSE_RADIUS), city.traffic?.push(r, HORSE_RADIUS) ?? 0, city.trams?.push?.(r, HORSE_RADIUS, left) ?? 0);
  if (into > 0) {
    r.speed *= Math.exp(-into * 2.8 * dt);
    if (into * Math.abs(r.speed) > 7 && r.wallTimer <= 0) {
      r.wallTimer = 0.5;
      r.speed *= 0.85;
      if (r.human >= 0 && loud()) { sfx.bump(PAN[r.human]); buzz('tap'); }
    }
  }
  // in the water you take a boat of the Bootjes van Gent: slower, with a wake behind it (but not
  // in the quest of the last boat: the boat you have to catch is the one waiting at the quay)
  r.afloat = r.base < 0.3 && !quest?.def.boat && !r.room && inWater(world.colliders, r.pos.x, r.pos.z);
  // (in the Blaarmeersen's lake you swim, on the Watersportbaan you row)
  r.vessel = !r.afloat ? null : swimAt(world.colliders, r.pos.x, r.pos.z) ? 'swim'
    : ROWING && r.pos.x > ROWING[0] && r.pos.z > ROWING[1] && r.pos.x < ROWING[2] && r.pos.z < ROWING[3] ? 'row' : 'tour';
  if (r.afloat) {
    r.speed = approach(r.speed, clamp(r.speed, -REVERSE_MAX, r.vessel === 'swim' ? SWIM_SPEED : BOAT_SPEED), 30 * dt);
    if (r.y < 0.3 && Math.random() < dt * Math.abs(r.speed) * 1.2) {
      const side = Math.random() < 0.5 ? -1 : 1;
      particles.spawn(r.pos.x - r.fx * 6 + r.fz * side * 0.8, (r.water ?? WATER) + 0.15, r.pos.z - r.fz * 6 - r.fx * side * 0.8, {
        color: 0xe4eee8, vy: 0.6, vx: -r.fx * 1.5 + r.fz * side * 1.2, vz: -r.fz * 1.5 - r.fx * side * 1.2, life: 1.1, size: 0.2, grow: 0.8, opacity: 0.7, drag: 1.5,
      });
    }
  }
  if (r.human >= 0 && (r.streetT = (r.streetT ?? 0) - dt) <= 0) {
    r.streetT = 0.3;
    r.street = streetAt(world.colliders, r.pos.x, r.pos.z) || r.street;
  }
}

// A city's portals (<city>/city.js PORTALS; one with an href is a door to another page): ride into one's mouth, down where it opens, and you come
// out at the other end, a little way up from its mouth, facing away from it at the speed you had (the
// Kouter's car park and Dok Noord's are one in Ghent). `was` (where the rider was a step ago) goes
// along, so nothing puts them back across town.
const PORTAL_REACH = 2.2, PORTAL_OUT = 3.5;
let goingTo = 0; // a door with an href (below) is on its way to the other page
addEventListener('pageshow', e => { if (e.persisted) goingTo = 0; }); // back from it, from the browser's cache: the door works again
function throughPortal(r, was) {
  if (!PORTALS || r.human < 0 || game.state !== 'race' || riding(r)) return false;
  for (const pt of PORTALS) {
    if (Math.hypot(r.pos.x - pt.x, r.pos.z - pt.z) > PORTAL_REACH || (r.base > -1 && !pt.href)) continue; // (a car park's mouth is down on its ramp; a door is at street level)
    // heading into the mouth, not up the ramp away from it
    const into = -(Math.sin(r.yaw) * Math.sin(pt.yaw) + Math.cos(r.yaw) * Math.cos(pt.yaw)) * r.speed;
    if (into < 0.5) continue;
    if (pt.href) { // a door to another page: the inside of the church (ghentinside), or back out to the street
      hudMsg(r.human, `${pt.icon ?? '🚪'} ${pt.name}`);
      if (loud()) sfx.jump(PAN[r.human]);
      r.speed = 0;
      if (!goingTo) goingTo = setTimeout(() => location.assign(pt.href), 350);
      return true;
    }
    const { x, z, yaw } = pt.to;
    r.pos.x = was.x = x + Math.sin(yaw) * PORTAL_OUT;
    r.pos.z = was.z = z + Math.cos(yaw) * PORTAL_OUT;
    Object.assign(r, { yaw, speed: Math.abs(r.speed), onRoute: undefined, streetT: 0, base: world.relief?.at(r.pos.x, r.pos.z) ?? 0, baseV: 0 });
    if (track.distTo(r.pos.x, r.pos.z) < track.hw + 4) {
      r.idx = was.idx = track.nearest(r.pos.x, r.pos.z);
      r.lat = was.lat = track.lateral(r.pos.x, r.pos.z, r.idx);
    }
    camYaw[r.human] = yaw;
    particles.burst(r.pos.x, r.base + 1, r.pos.z, 24, { color: 0xffe680, speed: 5, up: 3, life: 0.7, size: 0.25, grow: 0.5, opacity: 0.9, drag: 3 });
    if (loud()) sfx.jump(PAN[r.human]);
    hudMsg(r.human, `${pt.icon ?? '🅿️'} ${pt.name}`);
    return true;
  }
  return false;
}

// Up and down: jumps, and riding over the roofs of parked cars. Riding into a car you are too low
// for puts you back where you were, like running into a wall.
function stepHeight(r, dt, was, airborne) {
  const up = r.y > 0.8;
  const ground = () => (r.onRoute === false ? 0 : groundAt(track.parking, track, r.idx, r.lat, up));
  let g = ground();
  const y0 = r.y;
  if (airborne) {
    r.vy -= GRAVITY * dt;
    r.y += r.vy * dt;
  }
  if (g > Math.max(y0, r.y) + STEP_UP) {
    const row = track.parking.rowAt[r.idx];
    if (row >= 0 && track.parking.rowAt[was.idx] === row) {
      // into the side of the row: back to its edge, still moving along
      r.lat = Math.sign(r.lat) * (track.hw - BAND - 0.02);
    } else {
      // into the front of the row: stop going forwards, but you can still step aside
      r.idx = was.idx;
    }
    track.at(r.idx, r.lat, r.pos);
    g = ground();
    r.aiRoof = 0; // the computer gives up on these roofs
    if (r.obstacleCd <= 0) {
      r.obstacleCd = 0.8;
      r.speed *= 0.35;
      r.stumbleTime = STUMBLE_TIME;
      if (r.human >= 0 && game.state === 'race') {
        sfx.crash(PAN[r.human]); buzz('crash');
        hudMsg(r.human, touch.on && r.human === 0 ? t_('msg.carTap') : t_('msg.carKey', { key: ctl(r.human).label.jump }), 'bad');
      }
    }
  }
  if (airborne && r.y <= g) {
    r.y = g;
    r.vy = 0;
    particles.burst(r.pos.x, r.base + g + 0.3, r.pos.z, 8, { color: g > 0 ? 0xffffff : 0xc9a77c, speed: 3, up: 1.5, life: 0.5, size: 0.2, grow: 0.5, opacity: 0.5, drag: 3 });
    if (r.human >= 0 && game.state === 'race') { sfx.land(PAN[r.human]); buzz('tap'); }
  } else if (!airborne && g >= r.y - STEP_DOWN) {
    r.y = g; // steps over bonnets and roofs
  }
  // a bigger drop (off the end of a row) leaves the horse in the air: it falls next frame
  r.ground = g;
}

function followTrack(r, dt) {
  const prev = r.idx;
  r.idx = track.nearest(r.pos.x, r.pos.z, r.idx);
  if (track.open) {
    // over the start line, and later the finish line, in either direction
    for (const line of [track.start, track.finish]) {
      if (prev < line && r.idx >= line) onLap(r, 1);
      else if (prev >= line && r.idx < line) onLap(r, -1);
    }
    endOfRoute(r);
  } else if (prev - r.idx > track.n / 2) onLap(r, 1);
  else if (r.idx - prev > track.n / 2) onLap(r, -1);

  let lat = track.lateral(r.pos.x, r.pos.z, r.idx);
  const lim = track.railLimit;
  if (Math.abs(lat) > lim) {
    const s = Math.sign(lat), m = track.normals[r.idx];
    const push = lat - s * lim;
    r.pos.x -= m.x * push;
    r.pos.z -= m.z * push;
    lat = s * lim;
    const into = (r.fx * m.x + r.fz * m.z) * s * Math.sign(r.speed);
    if (into > 0) {
      r.speed *= Math.exp(-into * 2.8 * dt);
      if (r.speed > 0) r.yaw -= s * into * 1.8 * dt; // slide along the rail
      if (into * Math.abs(r.speed) > 7 && r.wallTimer <= 0) {
        r.wallTimer = 0.5;
        r.speed *= 0.85;
        if (r.human >= 0 && game.state === 'race') { sfx.bump(PAN[r.human]); buzz('tap'); }
      }
    }
  }
  r.lat = lat;
  r.progress = progressOf(r);
  const t = track.tangents[r.idx];
  const along = r.fx * t.x + r.fz * t.z;
  const wrong = (along < -0.35 && r.speed > 2) || (along > 0.35 && r.speed < -2);
  r.wrongWay = wrong ? r.wrongWay + dt : 0;
}

// The two ends of an open route: the street is closed off there, like a rail across it.
function endOfRoute(r) {
  const end = r.idx === 0 ? -1 : r.idx === track.n - 1 ? 1 : 0;
  if (!end) return;
  const p = track.points[r.idx], t = track.tangents[r.idx];
  const past = ((r.pos.x - p.x) * t.x + (r.pos.z - p.z) * t.z) * end;
  if (past <= 0) return;
  r.pos.x -= t.x * past * end;
  r.pos.z -= t.z * past * end;
  if (Math.sign(r.speed) === Math.sign((r.fx * t.x + r.fz * t.z) * end)) r.speed *= 0.5;
}

function hitObstacles(r) {
  const lim = track.railLimit;
  for (const ob of world.obstacles) {
    const ds = track.delta(ob.idx, r.idx) * track.spacing; // > 0 once the horse is past its middle
    const halfD = ob.depth / 2 + 1.1;
    const lo = ob.latMin - 0.6, hi = ob.latMax + 0.6;
    if (Math.abs(ds) > halfD || r.lat < lo || r.lat > hi || r.y > ob.height - 0.25) continue;
    if (ob.solid) {
      // Push out along whichever direction needs the smallest move (never through a rail).
      const along = halfD - Math.abs(ds);
      let best = along, how = 'along';
      if (lo > -lim && r.lat - lo < best) { best = r.lat - lo; how = 'lo'; }
      if (hi < lim && hi - r.lat < best) { best = hi - r.lat; how = 'hi'; }
      const m = track.normals[r.idx], tg = track.tangents[r.idx];
      if (how === 'along') {
        const sgn = ds < 0 ? -1 : 1;
        r.pos.x += tg.x * sgn * along;
        r.pos.z += tg.z * sgn * along;
      } else {
        const sgn = how === 'lo' ? -1 : 1;
        r.pos.x += m.x * sgn * best;
        r.pos.z += m.z * sgn * best;
        r.lat += sgn * best;
      }
    }
    if (r.obstacleCd > 0) continue;
    r.obstacleCd = 1;
    r.stumbleTime = STUMBLE_TIME;
    r.stunTime = Math.max(r.stunTime, 0.35);
    r.speed *= ob.solid ? 0.35 : 0.3;
    ob.wobble = 0.6;
    const bits = ob.kind === 'barrier' ? [0xd32f2f, 0xffffff] : ob.kind === 'car' ? [0xcfd8dc, 0x90a4ae, 0xffffff] : [0x4f8f3a, 0xb9b5ad, 0xff80ab];
    particles.burst(r.pos.x, 1, r.pos.z, 12, { color: bits, speed: 5, up: 4, gravity: 12, life: 0.7, size: 0.18, drag: 1 });
    if (r.human >= 0 && game.state === 'race') {
      sfx.crash(PAN[r.human]); buzz('crash');
      hudMsg(r.human, touch.on && r.human === 0 ? t_('msg.oofTap') : t_('msg.oofKey', { key: ctl(r.human).label.jump }), 'bad');
    }
  }
}

// A horse ran into a cyclist: the bike goes over, the horse stumbles.
export function bikerHit(r, b, p) {
  if (riding(r)) return;
  particles.burst(p.x, 1, p.z, 14, { color: [0xffffff, 0x90a4ae, 0xffd740], speed: 5, up: 4, gravity: 12, life: 0.6, size: 0.16, drag: 1 });
  r.stumbleTime = STUMBLE_TIME;
  r.stunTime = Math.max(r.stunTime, 0.3);
  r.speed *= 0.35;
  r.invuln = Math.max(r.invuln, 0.8);
  shout(r.human >= 0);
  if (r.human >= 0 && game.state === 'race') {
    sfx.crash(PAN[r.human]); buzz('crash');
    hudMsg(r.human, t_('msg.bike'), 'bad');
  }
}

// A horse ran into somebody on the pavement (riding about freely): they jump aside and shout.
export function pedestrianBump(r, x, y, z) {
  if (riding(r)) return;
  shout(r.human >= 0);
  r.speed *= 0.75;
  r.stumbleTime = Math.max(r.stumbleTime, STUMBLE_TIME * 0.6);
}

// ------------------------------------------------------------------ tram rails

// On a bike, riding over the tram rails at too shallow an angle: the front wheel drops into the
// rail's groove and you come off, as the cyclist in the tour does (js/tumble.js). Straight across,
// or near enough, is fine.
const RAIL_GAUGE = 1.435 * 1.25; // as the rails are laid (js/scenery.js osmTrams)
const RAIL_ANGLE = 0.3; // radians, about 17 degrees: any shallower and the wheel goes in
export const RAIL_FALL = 2.6; // seconds on the ground before you are back on the bike
const RAIL_SLOW = 6; // m/s², how fast the slide comes to a stop
const RAIL_AGAIN = 10; // seconds back on the bike before the rails can throw you again
let railCells = null;
// the rails' segments in a grid, to find the ones near a point
function railsNear(x, z) {
  const C = 20, key = (i, j) => i * 100003 + j;
  if (!railCells) {
    railCells = new Map();
    for (const t of TRACKS[0].map?.trams ?? []) {
      for (let k = 0; k + 3 < t.p.length; k += 2) {
        const ax = t.p[k], az = t.p[k + 1], bx = t.p[k + 2], bz = t.p[k + 3], L = Math.hypot(bx - ax, bz - az);
        if (L < 1e-6) continue;
        const seg = { ax, az, ux: (bx - ax) / L, uz: (bz - az) / L, L, y: Math.max(t.y?.[k / 2] ?? 0, t.y?.[k / 2 + 1] ?? 0) };
        for (let i = Math.floor((Math.min(ax, bx) - 2) / C); i <= Math.floor((Math.max(ax, bx) + 2) / C); i++) {
          for (let j = Math.floor((Math.min(az, bz) - 2) / C); j <= Math.floor((Math.max(az, bz) + 2) / C); j++) {
            if (!railCells.has(key(i, j))) railCells.set(key(i, j), []);
            railCells.get(key(i, j)).push(seg);
          }
        }
      }
    }
  }
  return railCells.get(key(Math.floor(x / C), Math.floor(z / C))) ?? [];
}

// Did this step take the bike over a rail, and at what angle?
function railCheck(r, was) {
  if (r.human < 0 || game.state !== 'race' || r.model.species !== 'bike') return;
  if (r.railTime > 0 || r.railCd > 0 || !r.grounded || riding(r) || r.afloat || Math.abs(r.speed) < 1.5) return;
  for (const g of railsNear(r.pos.x, r.pos.z)) {
    if (Math.abs(r.base - g.y) > 1) continue; // up on a bridge over the tracks, or under one
    const along = (r.pos.x - g.ax) * g.ux + (r.pos.z - g.az) * g.uz;
    if (along < 0 || along > g.L) continue;
    const d1 = (r.pos.z - g.az) * g.ux - (r.pos.x - g.ax) * g.uz, d0 = (was.z - g.az) * g.ux - (was.x - g.ax) * g.uz;
    const over = [-1, 1].some(side => (d0 - side * RAIL_GAUGE / 2) * (d1 - side * RAIL_GAUGE / 2) < 0);
    if (!over) continue;
    // the angle between the bike and the rail
    if (Math.abs(Math.sin(r.yaw) * g.uz - Math.cos(r.yaw) * g.ux) < Math.sin(RAIL_ANGLE)) railFall(r);
    return;
  }
}

function railFall(r) {
  r.railTime = RAIL_FALL;
  r.railDown = true;
  r.railCd = RAIL_FALL + RAIL_AGAIN; // and once back on the bike, not again for a while
  r.stunTime = Math.max(r.stunTime, RAIL_FALL);
  r.railSide = Math.random() < 0.5 ? 1 : -1;
  r.speed = Math.sign(r.speed) * Math.min(Math.abs(r.speed), 4); // the bike stops dead, it slides on a little
  particles.burst(r.pos.x + r.fx, 0.3 + r.base, r.pos.z + r.fz, 12, { color: [0xb0a99f, 0x8d8379, 0xffd740], speed: 3, up: 3, gravity: 12, life: 0.6, size: 0.15, drag: 1 });
  shout(true);
  sfx.crash(PAN[r.human]); buzz('crash');
  hudMsg(r.human, t_('msg.rails'), 'bad');
}

// ------------------------------------------------------------------ shouts

// Somebody got startled: when a player caused it they say something out loud, picked at random.
const SHOUTS = {
  nl: ['Hé!', 'Hallo!', 'Hela!', 'Amai!', 'Pas op!', 'Oei!', 'Allee zeg!', 'Seg!', 'Goeiendag!', 'Wow!', 'Rustig!', 'Mijn hoed!'],
  en: ['Hey!', 'Hello!', 'Oi!', 'Watch it!', 'Whoa!', 'Oops!', 'Careful!', 'Good day!', 'Wow!', 'Easy there!', 'My hat!', 'Hi there!'],
  fr: ['Hé !', 'Bonjour !', 'Attention !', 'Oh là là !', 'Oups !', 'Doucement !', 'Holà !', 'Salut !', 'Ouah !', 'Mon chapeau !'],
  es: ['¡Eh!', '¡Hola!', '¡Cuidado!', '¡Ay!', '¡Uy!', '¡Ojo!', '¡Despacio!', '¡Buenas!', '¡Madre mía!', '¡Mi sombrero!'],
};
const VOICE = { nl: 'nl-BE', en: 'en-GB', fr: 'fr-BE', es: 'es-ES' };
let lastSpoken = 0;

function shout(loudly) {
  if (!loudly || !loud() || !sfx.sfxOn || !('speechSynthesis' in window) || game.time - lastSpoken < 0.5) return;
  lastSpoken = game.time;
  const lines = SHOUTS[getLang()] ?? SHOUTS.en;
  try {
    const say = new SpeechSynthesisUtterance(lines[Math.floor(Math.random() * lines.length)]);
    say.lang = VOICE[getLang()] ?? 'nl-BE';
    say.pitch = 0.6 + Math.random() * 1.2; // all sorts of voices
    say.rate = 1.25;
    speechSynthesis.cancel(); // never a queue of hey's behind the action
    speechSynthesis.speak(say);
  } catch { /* no speech here */ }
}

export function collideRacers() {
  const min = HORSE_RADIUS * 2;
  for (let a = 0; a < field.length; a++) {
    for (let b = a + 1; b < field.length; b++) {
      const A = field[a], B = field[b];
      if (Math.abs(A.y - B.y) > 1.2 || riding(A) || riding(B)) continue; // one is jumping over the other, or on the tram
      const dx = B.pos.x - A.pos.x, dz = B.pos.z - A.pos.z, d2 = dx * dx + dz * dz;
      if (d2 >= min * min || d2 < 1e-6) continue;
      const d = Math.sqrt(d2), o = (min - d) / 2, nx = dx / d, nz = dz / d;
      A.pos.x -= nx * o; A.pos.z -= nz * o;
      B.pos.x += nx * o; B.pos.z += nz * o;
      const aInto = (A.fx * nx + A.fz * nz) * A.speed, bInto = -(B.fx * nx + B.fz * nz) * B.speed;
      if (aInto > 0) A.speed -= aInto * 0.08;
      if (bInto > 0) B.speed -= bInto * 0.08;
    }
  }
}
