// The items: picked up on the course and used on the others (traps, clouds, hedgehogs, shots).

import { createBunny } from '../bunny.js';
import { ITEMS, rollItem, createHedgehog, createCloud, createBolt } from '../items.js';
import { sfx } from '../sound.js';
import { buzz } from '../haptics.js';
import {
  t_, SPIN_TIME, REAR_TIME, STUMBLE_TIME, SOAK_TIME, MAX_ITEMS, PICKUP_RESPAWN, MAX_TRAPS, PAN, clamp, wrapAngle,
  tmp,
} from './base.js';
import { game } from './settings.js';
import { scene, particles } from './scene.js';
import { roaming, quest, world, track } from './worlds.js';
import { field, thrown, traps, clouds } from './racers.js';
import { huds, restartAnim, hudMsg } from './hud.js';
import { gap, canHit, findTarget, leaderExcept } from './control.js';

export const loud = () => game.state === 'race';

export function updatePickups(dt, t) {
  if (!game.weapons || roaming()) return;
  for (const pk of world.pickups) {
    if (!pk.active) {
      if ((pk.timer -= dt) <= 0) {
        pk.active = true;
        pk.appear = 0;
        pk.group.visible = true;
        pk.setKind(rollItem());
      }
      continue;
    }
    pk.appear = Math.min(1, pk.appear + dt * 3);
    const a = pk.appear;
    pk.group.scale.setScalar(1 + 2.7 * Math.pow(a - 1, 3) + 1.7 * Math.pow(a - 1, 2)); // ease-out-back
    const g = pk.model.group;
    if (pk.kind === 'cloud') {
      g.position.y = 1.6 + Math.sin(t * 2 + pk.phase) * 0.25;
      g.rotation.y += dt * 0.8;
    } else {
      g.position.y = 0.15 + Math.abs(Math.sin(t * (pk.kind === 'hedgehog' ? 3 : 4) + pk.phase)) * (pk.kind === 'hedgehog' ? 0.35 : 0.7);
      g.rotation.y += dt * 1.2;
    }
    for (const r of field) {
      if (r.items.length >= MAX_ITEMS) continue;
      const dx = r.pos.x - pk.pos.x, dz = r.pos.z - pk.pos.z;
      if (dx * dx + dz * dz < 2.3 * 2.3 && Math.abs(r.y - pk.y) < 1.4) { collect(r, pk); break; }
    }
  }
}

function collect(r, pk) {
  r.items.push(pk.kind);
  if (r.items.length === 1) r.aiHold = 0;
  pk.active = false;
  pk.timer = PICKUP_RESPAWN;
  pk.group.visible = false;
  particles.burst(pk.pos.x, 1, pk.pos.z, 10, { color: [0xffffff, ITEMS[pk.kind].ring], speed: 4, up: 3, life: 0.5, size: 0.18, drag: 3 });
  if (r.human >= 0 && loud()) {
    sfx.pickup(pk.kind, PAN[r.human]); buzz('tap');
    restartAnim(huds[r.human].items, 'bump');
  }
}

// A julientje thrown to the students (the zombie quest): true when one went.
export function throwFries(r) {
  if (game.state !== 'race' || !quest?.def.fries || !quest.throwFries(r)) return false;
  sfx.throw(PAN[r.human]); buzz('tap');
  return true;
}

export function useItem(r, backward) {
  if (!game.weapons || !r.items.length || r.spinTime > 0 || r.rearTime > 0 || r.finished) return;
  const kind = r.items.shift();
  r.aiHold = 0;
  if (kind === 'bunny') throwBunny(r, backward);
  else if (kind === 'hedgehog') dropHedgehog(r);
  else sendCloud(r);
}

function throwBunny(r, backward) {
  const dir = backward ? -1 : 1;
  const model = createBunny();
  model.group.scale.setScalar(1.15);
  scene.add(model.group);
  const x = r.pos.x + r.fx * 2.8 * dir, z = r.pos.z + r.fz * 2.8 * dir;
  const idx = track.nearest(x, z, r.idx);
  thrown.push({
    model, owner: r, backward, x, z, y: 2.4 + r.y, y0: 2.4 + r.y, idx,
    lat: track.lateral(x, z, idx),
    yaw: backward ? r.yaw + Math.PI : r.yaw,
    speed: backward ? 30 : Math.max(48, r.speed + 22),
    target: findTarget(r, backward),
    life: 3.6, age: 0, hop: 0, trail: 0,
  });
  if (r.human >= 0 && loud()) sfx.throw(PAN[r.human]);
}

function dropHedgehog(r) {
  const x = r.pos.x - r.fx * 2.8, z = r.pos.z - r.fz * 2.8;
  const idx = track.nearest(x, z, r.idx);
  const lat = clamp(track.lateral(x, z, idx), -track.railLimit, track.railLimit);
  const p = track.at(idx, lat);
  const model = createHedgehog();
  model.group.scale.setScalar(1.3);
  model.group.rotation.y = r.yaw + Math.PI;
  model.group.position.set(p.x, 1.4 + r.y, p.z);
  scene.add(model.group);
  traps.push({ model, owner: r, x: p.x, z: p.z, idx, lat, age: 0, y0: 1.4 + r.y });
  if (traps.length > MAX_TRAPS) removeFrom(traps, 0, true);
  if (r.human >= 0 && loud()) sfx.drop(PAN[r.human]);
}

function sendCloud(r) {
  const target = leaderExcept(r);
  if (!target) return;
  const model = createCloud();
  model.group.scale.setScalar(1.5);
  scene.add(model.group);
  const bolt = createBolt();
  bolt.visible = false;
  scene.add(bolt);
  clouds.push({ model, bolt, owner: r, target, x: r.pos.x, y: 3.5 + r.y, z: r.pos.z, state: 'fly', rain: 0, fade: 0, boltTime: 0, dropAcc: 0 });
  if (loud()) {
    if (r.human >= 0) {
      sfx.puff(PAN[r.human]);
      hudMsg(r.human, `🌧️ ➜ ${target.name}`, 'good');
    }
  }
}

function removeFrom(list, k, poof = false) {
  const e = list[k];
  if (poof) particles.burst(e.model.group.position.x, e.model.group.position.y + 0.4, e.model.group.position.z, 8, { color: 0xffffff, speed: 3, up: 2, life: 0.4, size: 0.2, drag: 3 });
  scene.remove(e.model.group);
  if (e.bolt) scene.remove(e.bolt);
  list.splice(k, 1);
}

export function updateThrown(dt) {
  const look = Math.round(12 / track.spacing);
  for (let k = thrown.length - 1; k >= 0; k--) {
    const b = thrown[k];
    b.age += dt;
    b.life -= dt;
    const dir = b.backward ? -1 : 1;
    if (b.target && b.target.finished) b.target = null;

    // Chase the target directly when close, otherwise follow the track towards its lane.
    let ax, az;
    const t = b.target;
    const ds = t ? (b.backward ? gap(t.idx, b.idx) : gap(b.idx, t.idx)) : 0;
    if (t && (ds < 24 || ds > track.length - 8)) {
      ax = t.pos.x;
      az = t.pos.z;
    } else {
      track.at(b.idx + dir * look, clamp(t ? t.lat : b.lat, -0.75 * track.hw, 0.75 * track.hw), tmp);
      ax = tmp.x;
      az = tmp.z;
    }
    const diff = wrapAngle(Math.atan2(ax - b.x, az - b.z) - b.yaw);
    if (t && Math.abs(diff) > 2 && b.age > 0.3) b.target = null;
    const maxTurn = (b.target ? 3.2 : 5) * dt;
    b.yaw += clamp(diff, -maxTurn, maxTurn);
    b.x += Math.sin(b.yaw) * b.speed * dt;
    b.z += Math.cos(b.yaw) * b.speed * dt;
    b.idx = track.nearest(b.x, b.z, b.idx);
    b.lat = track.lateral(b.x, b.z, b.idx);

    const lim = track.hw - 0.5;
    if (Math.abs(b.lat) > lim) {
      const s = Math.sign(b.lat), m = track.normals[b.idx], push = b.lat - s * lim;
      b.x -= m.x * push;
      b.z -= m.z * push;
      b.lat = s * lim;
      let vx = Math.sin(b.yaw), vz = Math.cos(b.yaw);
      const vn = vx * m.x + vz * m.z;
      if (vn * s > 0) {
        vx -= 2 * vn * m.x;
        vz -= 2 * vn * m.z;
        b.yaw = Math.atan2(vx, vz);
      }
    }

    // First a tumbling throw from the jockey's hand, then low hops along the ground.
    b.hop += dt * 9;
    const arc = Math.abs(Math.sin(b.hop));
    if (b.hop < Math.PI) b.y = b.y0 + (0.25 - b.y0) * (b.hop / Math.PI) + Math.sin(b.hop) * 1.3;
    else b.y = 0.25 + arc * 1.3;
    const g = b.model.group;
    g.position.set(b.x, b.y, b.z);
    g.rotation.y = b.yaw;
    g.rotation.x = b.hop < Math.PI ? b.hop * 2 : Math.cos(b.hop * 2) * 0.25;
    for (const ear of b.model.ears) ear.rotation.x = -0.2 - arc * 0.7;
    if ((b.trail += dt) > 0.04) {
      b.trail = 0;
      particles.spawn(b.x, b.y + 0.5, b.z, { color: 0xffffff, life: 0.35, size: 0.16, grow: 0.25, opacity: 0.7 });
    }

    // A bunny that runs into a hedgehog takes it out.
    const trapHit = b.y < 1.2 ? traps.findIndex(tr => (tr.x - b.x) ** 2 + (tr.z - b.z) ** 2 < 1.3 * 1.3) : -1;
    if (trapHit >= 0) {
      removeFrom(traps, trapHit, true);
      removeFrom(thrown, k, true);
      continue;
    }

    let victim = null;
    for (const r of field) {
      if (r.finished || (r === b.owner && b.age < 0.8) || !canHit(b.owner, r)) continue;
      if (b.y < r.y - 0.2 || b.y > r.y + 2.6) continue; // jumped clean over it
      const dx = r.pos.x - b.x, dz = r.pos.z - b.z;
      if (dx * dx + dz * dz < 1.9 * 1.9) { victim = r; break; }
    }
    if (victim) {
      bunnyHit(victim, b.owner);
      removeFrom(thrown, k);
    } else if (b.life <= 0) {
      removeFrom(thrown, k, true);
    }
  }
}

function bunnyHit(r, owner) {
  particles.burst(r.pos.x, 1.8 + r.y, r.pos.z, 18, { color: [0xffffff, 0xffe14d, 0xff9ccb], speed: 7, up: 5, gravity: 8, life: 0.7, size: 0.2, drag: 2 });
  if (r.invuln > 0) return;
  r.spinTime = SPIN_TIME;
  r.invuln = SPIN_TIME + 1.2;
  r.speed *= 0.3;
  r.model.stars.visible = true;
  if (!loud()) return;
  if (r.human >= 0) {
    sfx.hit(PAN[r.human]); buzz('knock');
    sfx.animal(r.model.species, PAN[r.human]);
    hudMsg(r.human, t_('msg.bonk'), 'bad');
    restartAnim(huds[r.human].flash, 'on');
  } else {
    sfx.hit(owner.human >= 0 ? PAN[owner.human] : 0, owner.human >= 0 ? 0.7 : 0.3);
  }
  if (owner.human >= 0 && owner !== r) hudMsg(owner.human, t_('msg.hit', { name: r.name }), 'good');
}

export function updateTraps(dt, t) {
  for (let k = traps.length - 1; k >= 0; k--) {
    const tr = traps[k];
    tr.age += dt;
    const g = tr.model.group;
    // drop to the ground with a little bounce, then breathe
    const fall = 0.28;
    g.position.y = tr.age < fall
      ? tr.y0 * (1 - (tr.age / fall) ** 2)
      : Math.abs(Math.sin((tr.age - fall) * 12)) * 0.25 * Math.exp(-(tr.age - fall) * 6);
    tr.model.body.scale.y = 1 + Math.sin(t * 3 + tr.x) * 0.04;
    if (tr.age > 40) { removeFrom(traps, k, true); continue; }
    if (tr.age < fall) continue;
    const victim = field.find(r => !r.finished && r.y < 0.35 && !(r === tr.owner && tr.age < 1.2) && canHit(tr.owner, r)
      && (r.pos.x - tr.x) ** 2 + (r.pos.z - tr.z) ** 2 < 1.5 * 1.5);
    if (!victim) continue;
    removeFrom(traps, k, true);
    hedgehogHit(victim, tr.owner);
  }
}

function hedgehogHit(r, owner) {
  particles.burst(r.pos.x, 0.8, r.pos.z, 14, { color: [0x5a3d2b, 0xe8c9a0, 0xffffff], speed: 5, up: 5, gravity: 12, life: 0.6, size: 0.16, drag: 1 });
  if (r.invuln > 0) return;
  r.rearTime = REAR_TIME;
  r.stunTime = REAR_TIME;
  r.invuln = REAR_TIME + 1;
  r.speed *= 0.2;
  if (!loud()) return;
  if (r.human >= 0) {
    sfx.ouch(PAN[r.human], r.model.species); buzz('knock');
    hudMsg(r.human, t_('msg.ouch'), 'bad');
    restartAnim(huds[r.human].flash, 'on');
  } else if (owner.human >= 0) {
    sfx.ouch(PAN[owner.human], r.model.species);
  }
  if (owner.human >= 0 && owner !== r) hudMsg(owner.human, t_('msg.trap', { name: r.name }), 'good');
}

export function updateClouds(dt, t) {
  for (let k = clouds.length - 1; k >= 0; k--) {
    const c = clouds[k], g = c.model.group;
    if (c.state === 'fly' && c.target.finished) {
      c.target = leaderExcept(c.owner);
      if (!c.target) c.state = 'fade';
    }
    const r = c.target;
    if (c.state === 'fly') {
      const dx = r.pos.x - c.x, dz = r.pos.z - c.z, d = Math.hypot(dx, dz), step = 62 * dt;
      if (d <= step + 0.5) cloudArrives(c);
      else {
        c.x += (dx / d) * step;
        c.z += (dz / d) * step;
        g.rotation.y = Math.atan2(dx, dz);
      }
      c.y += (7.5 - c.y) * Math.min(1, dt * 3);
    } else if (c.state === 'rain') {
      c.x += (r.pos.x - c.x) * Math.min(1, dt * 12);
      c.z += (r.pos.z - c.z) * Math.min(1, dt * 12);
      c.y = 7 + r.y + Math.sin(t * 2) * 0.2;
      g.rotation.y += dt * 0.5;
      c.dropAcc += dt * 40;
      while (c.dropAcc > 1) {
        c.dropAcc -= 1;
        particles.spawn(c.x + (Math.random() - 0.5) * 3, c.y - 0.8, c.z + (Math.random() - 0.5) * 3, { color: 0x6ec6ff, vy: -20, life: 0.3, size: 0.08, opacity: 0.9 });
      }
      if ((c.rain -= dt) <= 0) c.state = 'fade';
    } else {
      c.fade += dt;
      g.scale.setScalar(1.5 * Math.max(0, 1 - c.fade / 0.4));
      if (c.fade > 0.4) { removeFrom(clouds, k); continue; }
    }
    g.position.set(c.x, c.y, c.z);
    for (const [i, drop] of c.model.drops.entries()) drop.position.y = -0.8 - ((t * 2 + i * 0.33) % 1) * 0.5;
    c.boltTime -= dt;
    c.bolt.visible = c.boltTime > 0 && Math.floor(c.boltTime * 30) % 2 === 0;
    if (c.bolt.visible) {
      c.bolt.position.set(c.x, c.y - 0.6, c.z);
      c.bolt.scale.set(1, Math.max(0.3, (c.y - 3 - r.y) / 4.6), 1);
      c.bolt.rotation.y = t * 3;
    }
  }
}

function cloudArrives(c) {
  const r = c.target;
  c.state = 'rain';
  c.rain = SOAK_TIME;
  c.boltTime = 0.35;
  r.soakTime = SOAK_TIME;
  r.stumbleTime = STUMBLE_TIME;
  r.speed *= 0.6;
  if (!loud()) return;
  const pan = r.human >= 0 ? PAN[r.human] : c.owner.human >= 0 ? PAN[c.owner.human] : 0;
  sfx.thunder(pan);
  sfx.rain(pan, SOAK_TIME);
  if (r.human >= 0) {
    sfx.animal(r.model.species, pan);
    hudMsg(r.human, t_('msg.soaked'), 'bad');
    restartAnim(huds[r.human].flash, 'on');
  }
  if (c.owner.human >= 0 && c.owner !== r) hudMsg(c.owner.human, t_('msg.rained', { name: r.name }), 'good');
}
