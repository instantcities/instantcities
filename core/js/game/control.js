// Control: the players' keys and sticks, and the computer riders, as steering, throttle and fire.

import { rowAhead, rowEnd, BAND } from '../parking.js';
import { MAX_ITEMS, clamp, approach, wrapAngle, rand, tmp } from './base.js';
import { game } from './settings.js';
import { freeStick, demo, world, track } from './worlds.js';
import { humans, field, ctl, traps } from './racers.js';
import { finalOrder } from './race.js';
import { jump } from './physics.js';
import { useItem } from './pickups.js';
import { pads, keys, touch } from './input.js';

export const held = list => list.some(k => keys.has(k));

export function humanControl(r) {
  const played = r.human === 0 && demo?.control(r); // the demo plays player 1
  if (played) return played;
  const k = ctl(r.human);
  let throttle = (held(k.up) ? 1 : 0) - (held(k.down) ? 1 : 0);
  let steer = (held(k.left) ? 1 : 0) - (held(k.right) ? 1 : 0);
  let lift = (held(k.jump) ? 1 : 0) - (held(k.fire) ? 1 : 0); // up and down, in the helicopter
  const pad = pads.input[r.human];
  if (pad) {
    throttle = clamp(throttle + pad.throttle, -1, 1);
    steer = clamp(steer + pad.steer, -1, 1);
  }
  if (touch.on && r.human === 0) {
    // On touch screens the horse gallops by itself in a race or a quest (but not the zombie missions), and pulling the stick down brakes;
    // exploring, the stick's up/down rides.
    throttle = freeStick() ? touch.throttle : touch.throttle < -0.5 ? -1 : 1;
    steer = clamp(steer + touch.steer, -1, 1);
    lift = clamp(lift + (touch.climb ? 1 : 0) - (touch.sink ? 1 : 0), -1, 1);
  }
  return { throttle, steer, lift };
}

export const gap = (fromIdx, toIdx) => (track.open ? toIdx - fromIdx : track.wrap(toIdx - fromIdx)) * track.spacing;

// The computer riders only ever attack each other, never a player.
export const canHit = (owner, r) => owner.human >= 0 || r.human < 0;

export function findTarget(r, backward) {
  let best = null, bestDs = backward ? 50 : 95;
  for (const o of field) {
    if (o === r || o.finished || !canHit(r, o)) continue;
    const ds = backward ? gap(o.idx, r.idx) : gap(r.idx, o.idx);
    if (ds > 3.5 && ds < bestDs) { best = o; bestDs = ds; } // skip horses right beside us
  }
  return best;
}

export function leaderExcept(r) {
  return finalOrder().find(o => o !== r && !o.finished && canHit(r, o)) ?? null;
}

function pickupAhead(r, maxDist) {
  let best = null, bestScore = Infinity;
  for (const pk of world.pickups) {
    if (!pk.active) continue;
    const ds = gap(r.idx, pk.idx);
    if (ds < 5 || ds > maxDist) continue;
    const score = ds + Math.abs(pk.lat - r.lat) * 3;
    if (score < bestScore) { bestScore = score; best = pk; }
  }
  return best;
}

// Steer around partial obstacles and hedgehogs, and decide when to jump.
function aiHazards(r, lane) {
  const lim = track.railLimit;
  const slow = r.speed < 12;
  const sp = Math.max(8, r.speed);
  let jumpFor = -1;
  const consider = (idx, lo, hi, full) => {
    const ds = gap(r.idx, idx);
    if (ds <= 0 || ds > 55) return;
    const covers = l => l > lo - 1.3 && l < hi + 1.3;
    // Ride around partial blocks: early at speed, or any time when too slow to clear them.
    if (!full && covers(lane) && (ds > 9 || slow)) lane = lo + lim > lim - hi ? (lo - lim) / 2 : (hi + lim) / 2;
    if (covers(r.lat) && ds < sp * 0.34 + 1.5 && ds > sp * 0.17 && (full || !slow)) jumpFor = idx;
  };
  for (const ob of world.obstacles) consider(ob.idx, ob.latMin, ob.latMax, ob.full);
  for (const t of traps) if (t.owner !== r || t.age > 1) consider(t.idx, t.lat - 1, t.lat + 1, false);
  for (const b of world.bikers?.list ?? []) if (b.state === 'ride' && r.y < 1) consider(b.idx, b.lat - 0.6, b.lat + 0.6, false);
  // a row of parked cars ahead: whoever is in an outer lane jumps up onto the roofs
  const row = r.y < 0.5 ? rowAhead(track.parking, track, r.idx, 55) : -1;
  if (row >= 0) {
    consider(row, track.hw - BAND, track.hw, true);
    consider(row, -track.hw, -track.hw + BAND, true);
  }
  // up on the roofs, nearly at the end of the row: jump across the gap to the next row
  const end = r.y > 0.8 ? rowEnd(track.parking, track, r.idx) : null;
  if (end && end.gap < 14 && end.toEnd < Math.max(3, sp * 0.15) && end.toEnd > 0) jumpFor = r.idx + 1e6;
  return { lane, jumpFor };
}

export function aiControl(r, dt, passive) {
  r.aiLaneTimer -= dt;
  if (r.aiLaneTimer <= 0) {
    r.aiLaneTarget = rand(-0.65, 0.65) * track.hw;
    r.aiLaneTimer = rand(2, 5);
  }
  let lane = r.aiLaneTarget;
  const armed = !passive && game.weapons;
  if (armed && r.items.length < MAX_ITEMS) {
    const pk = pickupAhead(r, 70);
    if (pk) lane = pk.lat;
  }
  for (const o of field) {
    if (o === r) continue;
    const ds = gap(r.idx, o.idx);
    if (ds > 0 && ds < 9 && Math.abs(o.lat - lane) < 2.6) lane = o.lat + (o.lat > r.lat ? -3.2 : 3.2);
  }
  // a row of parked cars coming up: about half the time, go for the roofs
  const row = r.y < 0.5 ? rowAhead(track.parking, track, r.idx, 60) : -1;
  if (row >= 0 && row !== r.aiRowFor) {
    r.aiRowFor = row;
    r.aiRoof = Math.random() < 0.5 ? (Math.sign(r.lat) || 1) : 0;
  }
  if (r.aiRoof && (row >= 0 || r.y > 0.3)) lane = r.aiRoof * (track.hw - BAND / 2); // also mid-jump
  const hz = aiHazards(r, clamp(lane, -track.railLimit + 1, track.railLimit - 1));
  lane = clamp(hz.lane, -track.railLimit + 0.6, track.railLimit - 0.6);
  if (track.parking?.rowAt[r.idx] >= 0) {
    // along a row: up on the roofs stay on them, down in the street stay between them
    const inner = track.hw - BAND - 0.9, s = Math.sign(r.lat) || 1;
    lane = r.y > 0.8 ? s * (track.hw - BAND / 2) : clamp(lane, -inner, inner);
  }
  r.aiLane = approach(r.aiLane, lane, 7 * dt);
  if (r.y > 0.8 && track.parking?.rowAt[r.idx] >= 0) r.aiLane = lane; // no drifting off the roofs
  if (hz.jumpFor >= 0) {
    if (r.aiJumpFor !== hz.jumpFor) {
      r.aiJumpFor = hz.jumpFor;
      r.aiJumpOk = r.human >= 0 || Math.random() < 0.9; // bots sometimes misjudge a jump
    }
    if (r.aiJumpOk) jump(r);
  } else {
    r.aiJumpFor = -1; // roll again next time we meet this obstacle
  }

  // past the finish of an open route: pull up before the end of the street
  if (track.open && (track.n - 1 - r.idx) * track.spacing < 35) return { throttle: r.speed > 1 ? -1 : 0, steer: 0 };

  const look = 8 + Math.abs(r.speed) * 0.45;
  track.at(r.idx + Math.round(look / track.spacing), r.aiLane, tmp);
  const diff = wrapAngle(Math.atan2(tmp.x - r.pos.x, tmp.z - r.pos.z) - r.yaw);

  // Rubber band against the human players so the race stays close.
  let band = 1;
  if (game.state === 'race' && r.human < 0 && !r.finished) {
    const best = Math.max(...humans.map(h => h.progress)), worst = Math.min(...humans.map(h => h.progress));
    if (r.progress - best > 0.04) band = 1 - Math.min(0.14, (r.progress - best - 0.04) * 0.9);
    else if (worst - r.progress > 0.04) band = 1 + Math.min(0.1, (worst - r.progress - 0.04) * 0.9);
  }
  r.speedFactor = (r.finished ? 0.8 : r.skill) * band;

  if (armed) aiItems(r, dt);
  return { throttle: Math.abs(diff) > 1.4 ? 0.4 : 1, steer: clamp(diff * 3, -1, 1) };
}

function aiItems(r, dt) {
  const kind = r.items[0];
  if (!kind || r.spinTime > 0 || r.rearTime > 0) return;
  r.aiHold += dt;
  if ((r.aiItemTimer -= dt) > 0) return;
  r.aiItemTimer = rand(0.4, 1);
  const ahead = findTarget(r, false), behind = findTarget(r, true);
  if (kind === 'bunny') {
    if (ahead && gap(r.idx, ahead.idx) < 45 && Math.random() < 0.8) useItem(r, false);
    else if (behind && gap(behind.idx, r.idx) < 14 && Math.random() < 0.35) useItem(r, true);
  } else if (kind === 'hedgehog') {
    if ((behind && gap(behind.idx, r.idx) < 22 && Math.random() < 0.6) || r.aiHold > 9) useItem(r, false);
  } else if (kind === 'cloud') {
    if (r.place > 1 || r.aiHold > 10) useItem(r, false);
  }
  if (r.items[0] !== kind) r.aiItemTimer = rand(1.2, 3.5);
}
