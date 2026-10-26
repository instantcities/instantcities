// The race flow: lining up, the countdown, the race or the quest and its events, the pause menu,
// the laps and the finish, the results, and back to the menu.

import { TRACKS } from '../tracks.js';
import { PLAYER_COLORS } from '../horses.js';
import { ordinal, local } from '../i18n.js';
import { groundAt } from '../parking.js';
import { QUESTS, FREE_START } from '../city.js';
import { buildColliders } from '../collide.js';
import { sfx, music } from '../sound.js';
import { buzz } from '../haptics.js';
import { Quest } from '../quests.js';
import { resetSplats } from '../splat.js';
import { t_, qt, GRID_LANES, PAN, hex, clamp, fmtTime, $ } from './base.js';
import { game, saveSettings, lastSpot } from './settings.js';
import { scene, particles, camYaw, menuLook } from './scene.js';
import {
  roaming, questing, exploring, touring, quest, setQuest, demo, report, lapsToRide, world, city, track, getCity,
} from './worlds.js';
import { racers, assignField, humans, field, clearEntities } from './racers.js';
import { huds, hudMsg } from './hud.js';
import { mm } from './minimap.js';
import { big, closeBigMap } from './bigmap.js';
import {
  menuEl, pauseEl, resultsEl, briefEl, setMenuRow, renderMenu, startSky, applyMode, syncGameplayMusic,
  showAudioBadge,
} from './menu.js';
import { hideTour, startTour } from './touring.js';
import { questBus, placeQuestBus, dropQuestBus, busDriverRuns } from './physics.js';
import { touch } from './input.js';

export function showRaceChrome(on) {
  huds.forEach((h, p) => h.el.classList.toggle('hidden', !on || p >= game.players));
  $('divider').classList.toggle('hidden', !on || game.players < 2);
  $('menuBtn').classList.toggle('hidden', !on);
  $('streetbar').classList.toggle('hidden', !on);
  $('streetbar').classList.toggle('duo', game.players > 1);
  huds.forEach((h, p) => { if (p >= game.players) h.street.classList.add('hidden'); }); // updateHud only visits the players in play
  mm.classList.toggle('hidden', !on);
}

export function resetRace(fresh = false) {
  clearEntities();
  world.pickups.forEach(p => { p.reset(); p.group.visible = game.weapons && !roaming(); });
  world.arrows?.show(!roaming());
  if (track.gate) track.gate.visible = !roaming(); // free roam has no start or finish
  for (const ob of world.obstacles) ob.group.visible = !roaming(); // nor anything to jump over
  if (roaming() && !world.colliders) world.colliders = buildColliders(world.cfg.map, track.parkedCars ?? [], getCity().posts);
  field.forEach((r, i) => r.reset(GRID_LANES[i]));
  quest?.dispose();
  setQuest(null);
  dropQuestBus();
  // everyone the paint (or a borrowed car) knocked over is back on their feet, the paint off the cars
  world.people?.resetHits();
  resetSplats(city?.targets);
  if (questing()) {
    setQuest(new Quest(QUESTS[game.mission - 1], { scene, map: world.cfg.map, colliders: world.colliders, relief: world.relief, particles }));
    if (quest.busSpot) placeQuestBus(quest);
    if (quest.def.heli) humans.forEach(r => { r.heli = true; });
    placeRiders(quest.spawn);
  } else if (exploring() && !fresh && lastSpot()) {
    placeRiders(lastSpot());
  } else if (roaming() && FREE_START) {
    // exploring freely starts at the city's own spot, not where the last race route did
    const { at: [x, z], look: [lx, lz] } = FREE_START;
    placeRiders({ x, z, yaw: Math.atan2(lx - x, lz - z) });
  }
  if (exploring()) humans.forEach((r, p) => { r.heli = game.mounts[p] === 'heli' && game.questsWon.includes('heli'); }); // flying about freely
  world.bikers?.reset(track, field);
  Object.assign(game, { raceTime: 0, finishCount: 0, endTimer: 0, cd: 0, cdShown: '', questEnd: null });
  for (const h of huds) {
    h.finished.classList.remove('show');
    h.msg.className = 'msg';
    h.cd.textContent = '';
  }
}

// The players at a quest's start, side by side, looking the way they have to go.
export function placeRiders({ x, z, yaw }) {
  humans.forEach((r, p) => {
    const side = humans.length > 1 ? (p ? 1.2 : -1.2) : 0;
    r.pos.x = x + Math.cos(yaw) * side;
    r.pos.z = z - Math.sin(yaw) * side;
    r.onRoute = undefined;
    const near = track.distTo(r.pos.x, r.pos.z) < track.hw + 4;
    if (near) {
      r.idx = track.nearest(r.pos.x, r.pos.z);
      r.lat = track.lateral(r.pos.x, r.pos.z, r.idx);
    }
    const onCars = near && Math.abs(r.lat) <= track.hw + 0.3 ? groundAt(track.parking, track, r.idx, r.lat, true) : 0;
    Object.assign(r, { yaw, speed: 0, steer: 0, y: onCars, vy: 0, ground: onCars, base: world.relief?.at(r.pos.x, r.pos.z) ?? 0, baseV: 0, streetT: 0 });
    camYaw[p] = yaw;
  });
}

// A quest begins with what it is about, and the START button.
function showBriefing() {
  const q = quest.def;
  $('briefEmoji').textContent = q.emoji;
  $('briefTitle').textContent = qt(q, 'title');
  $('briefStory').textContent = qt(q, 'story');
  $('briefTime').textContent = t_('quest.time', { time: fmtTime(q.time).replace(/\.\d+$/, '') });
  $('briefFoot').textContent = t_(touch.on ? 'quest.footTap' : 'quest.foot');
  briefEl.classList.remove('hidden');
}

export function beginQuest() {
  if (game.state !== 'briefing') return;
  briefEl.classList.add('hidden');
  game.state = 'race';
  sfx.countdown(true);
  if (questBus) busDriverRuns();
}

// The line under the street name in a quest: its own words, or for the bus driver and the courier
// the name of the next stop, so who knows Ghent knows where to go
export function questHud(r) {
  const next = quest.halts?.[quest.served];
  if (quest.rescue) {
    const say = quest.rescue.high ? qt(quest.def, 'lower') : (qt(quest.def, 'legs')[quest.served] ?? qt(quest.def, 'hud'));
    return `${say} · ↕ ${Math.round(r.y)} m`; // and how high up the helicopter is
  }
  if (!next || quest.over) return qt(quest.def, 'hud');
  if (quest.bus && r.car !== quest.bus) return t_('bus.getIn');
  return t_(quest.bus ? 'bus.next' : 'deliver.next', { stop: next.name });
}

// What happened in the quest this frame: a cap picked up, a student about to throw up, the end.
export function questEvents() {
  for (const e of quest.take()) {
    if (e.type === 'collect') {
      hudMsg(e.r.human, `${quest.def.icon ?? '🎓'} ${e.stop ? `${e.stop} ✓ ` : ''}${e.n}/${quest.tally.of}`, 'gold');
      sfx.pickup('bunny', PAN[e.r.human]); buzz('tap');
    } else if (e.type === 'fries') {
      // a julientje on the ground: the students round about go for it
      const r = humans.reduce((b, h) => (Math.hypot(h.pos.x - e.x, h.pos.z - e.z) < Math.hypot(b.pos.x - e.x, b.pos.z - e.z) ? h : b));
      sfx.drop(PAN[r.human]);
    } else if (e.type === 'tequila') {
      const r = humans.reduce((b, h) => Math.hypot(h.pos.x - e.x, h.pos.z - e.z) < Math.hypot(b.pos.x - e.x, b.pos.z - e.z) ? h : b);
      hudMsg(r.human, t_(e.paint ? 'quest.paintHit' : 'quest.tequilaHit'), e.paint ? 'blue' : 'gold');
      sfx.drop(PAN[r.human]);
    } else if (e.type === 'hurt') {
      // one line of health off; the last one ends the quest (the 'lose' event right after)
      if (e.hp > 0) {
        hudMsg(e.r.human, e.why === 'puke' ? t_('quest.puked') : t_('quest.ran'), 'bad');
        sfx.crash(PAN[e.r.human]); buzz('crash');
      }
    } else if (e.type === 'retch') {
      const r = humans.reduce((b, h) => (Math.hypot(h.pos.x - e.x, h.pos.z - e.z) < Math.hypot(b.pos.x - e.x, b.pos.z - e.z) ? h : b));
      sfx.voice(0, { type: 'sawtooth', from: 160, peak: 110, to: 70, dur: 0.5, formant: 500, vol: 0.18, wobble: 12 });
      if (Math.hypot(r.pos.x - e.x, r.pos.z - e.z) < 12) hudMsg(r.human, t_('quest.retch'), 'bad');
    } else endQuest(e.type === 'win', e.why, e.r);
  }
  if (!quest.over && game.raceTime >= quest.def.time) {
    quest.over = true;
    endQuest(false, 'time');
  }
}

function endQuest(won, why, r) {
  game.questEnd = game.raceTime;
  game.questWon = won;
  game.questWhy = why;
  report('quest_end', { quest: quest.def.id, won, why, seconds: Math.round(game.raceTime) });
  const text = won ? qt(quest.def, 'done') : why === 'puke' ? t_('quest.puked') : why === 'run' ? t_('quest.ran') : t_('quest.late');
  humans.forEach((h, p) => hudMsg(p, text, won ? 'good' : 'bad'));
  if (won) {
    if (!demo && !game.questsWon.includes(quest.def.id)) { game.questsWon.push(quest.def.id); saveSettings(); }
    sfx.finish(r ? PAN[r.human] : 0); buzz('win');
    const at = r ?? humans[0];
    particles.burst(at.pos.x, 3, at.pos.z, 40, { color: [0xe53935, 0xfdd835, 0x1e88e5, 0x43a047, 0xffffff, 0xff80ab], speed: 9, up: 9, gravity: 14, life: 1.6, size: 0.16, drag: 1 });
  } else { sfx.crash(0); buzz('lose'); }
  game.endTimer = 2.6;
}

// fresh: over again from the start, also when exploring (not where you last were)
export function startRace(fresh = false) {
  if (touring()) return startTour();
  sfx.unlock();
  if (touch.on) {
    game.mode = 1; // split screen needs a keyboard or gamepads
    const root = document.documentElement;
    // not in the iOS app: it is full screen already, and iOS would only show its 'swipe down to exit'
    // banner, which takes the focus away and so pauses the game
    if (!document.fullscreenElement && root.requestFullscreen && !window.Capacitor?.isNativePlatform?.()) {
      root.requestFullscreen({ navigationUI: 'hide' })
        .then(() => screen.orientation?.lock?.('landscape'))
        .catch(() => { /* not allowed here (e.g. iPhone Safari): play in the browser window */ });
    }
  }
  applyMode();
  assignField();
  resetRace(fresh);
  menuEl.classList.add('hidden');
  pauseEl.classList.add('hidden');
  resultsEl.classList.add('hidden');
  briefEl.classList.add('hidden');
  showRaceChrome(true);
  field.forEach((r, i) => { camYaw[i] = r.yaw; });
  game.state = questing() ? 'briefing' : roaming() ? 'race' : 'countdown'; // free roam: off you go
  report('game_start', {
    kind: questing() ? 'quest' : roaming() ? 'explore' : 'race',
    quest: quest?.def.id, track: roaming() ? undefined : TRACKS[game.trackIdx].id,
    players: game.players, mount: game.mounts[0], touch: touch.on,
  });
  startSky();
  if (questing()) showBriefing();
  syncGameplayMusic(); // sound effects only unless the hidden setting opted into music
  sfx.duck(false);
  showAudioBadge();
}

export function toMenu() {
  sfx.engine(null);
  sfx.rotor(null);
  applyMode();
  assignField();
  resetRace();
  game.state = 'menu';
  setMenuRow(0);
  startSky();
  closeBigMap();
  pauseEl.classList.add('hidden');
  resultsEl.classList.add('hidden');
  briefEl.classList.add('hidden');
  hideTour();
  menuEl.classList.remove('hidden');
  showRaceChrome(false);
  menuLook.set(racers[0].pos.x, 1.5, racers[0].pos.z);
  music.play('menu');
  sfx.duck(false);
  renderMenu();
  showAudioBadge();
}

// The pause menu's three buttons, left to right; the arrows move between them, Space/Enter picks one.
export const pauseBtns = ['restartBtn', 'resumeBtn'].map($);
export let pauseSel = 1;
export function selectPause(i) {
  pauseSel = clamp(i, 0, pauseBtns.length - 1);
  pauseBtns.forEach((b, j) => b.classList.toggle('psel', j === pauseSel));
}

export function setPaused(on, menu = true) {
  if (demo && on) return; // the demo plays on, whatever happens
  if (on && (game.state === 'race' || game.state === 'countdown' || game.state === 'tour')) {
    game.resumeState = game.state;
    game.state = 'paused';
    renderMenu();
    $('pauseMapBtn').classList.toggle('hidden', game.resumeState === 'tour'); // no riding to teleport on the tour
    $('pauseMountRow').classList.toggle('hidden', !roaming() || game.resumeState === 'tour'); // riding about, exploring or on a quest, you can swap what you ride
    $('pauseMountName').textContent = t_('mount.' + game.mounts[0]);
    if (menu) { selectPause(1); pauseEl.classList.remove('hidden'); }
    sfx.duck(true);
  } else if (on && big && menu) {
    // leaving the window with the big map open: the pause menu over it
    selectPause(1);
    pauseEl.classList.remove('hidden');
  } else if (!on && game.state === 'paused') {
    closeBigMap();
    game.state = game.resumeState;
    pauseEl.classList.add('hidden');
    sfx.unlock(); // the sound may have been stopped while the game was away (a phone call, another app)
    sfx.duck(false);
  }
}

export function finalOrder() {
  return [...field].sort((a, b) => {
    if (a.finished !== b.finished) return a.finished ? -1 : 1;
    return a.finished ? a.finishTime - b.finishTime : b.progress - a.progress;
  });
}

export function showResults() {
  game.state = 'results';
  game.resultsAt = game.time;
  resultsEl.classList.remove('hidden');
  $('resultTable').classList.toggle('hidden', !!quest);
  if (quest) {
    const q = quest.def;
    $('winner').textContent = game.questWon ? qt(q, 'win') : qt(q, 'lose' + ({ puke: 'Puke', run: 'Run' }[game.questWhy] ?? ''));
    $('duel').textContent = game.questWon ? t_('quest.inTime', { time: fmtTime(game.questEnd) }) : qt(q, 'title');
    return;
  }
  const order = finalOrder();
  report('race_finish', { track: TRACKS[game.trackIdx].id, place: order.indexOf(humans[0]) + 1, laps: lapsToRide() });
  const medals = ['🥇', '🥈', '🥉', `4${ordinal(4)}`];
  $('resultTable').innerHTML = order.map((r, i) => `
    <tr class="${r.human >= 0 ? 'human' : ''}">
      <td>${medals[i]}</td>
      <td class="name"><span class="dot" style="background:${hex(r.human >= 0 ? PLAYER_COLORS[r.human] : r.def.silk)}"></span>${r.name}</td>
      <td>${r.finished ? fmtTime(r.finishTime) : '—'}</td>
    </tr>`).join('');
  const w = order[0];
  if (game.players === 1) {
    const me = racers[0];
    $('winner').textContent = w === me ? t_('win.solo') : t_('win.ai', { name: w.name });
    $('duel').textContent = t_('solo.place', { place: me.place + ordinal(me.place), track: local(TRACKS[game.trackIdx].name) });
  } else {
    $('winner').textContent = w.human >= 0 ? t_('win.player', { rider: w.name }) : t_('win.ai', { name: w.name });
    const ranked = [...humans].sort((a, b) => a.place - b.place);
    const [a, b] = ranked;
    $('duel').textContent = t_('duel', { a: a.name, b: b.name });
  }
}

export function onLap(r, d) {
  r.lap += d;
  if (d < 0 || game.state !== 'race' || r.finished || r.lap <= r.bestLap) return;
  r.bestLap = r.lap;
  if (r.lap > lapsToRide()) return finishRacer(r);
  if (r.human >= 0 && r.lap >= 2) {
    const final = r.lap === lapsToRide();
    hudMsg(r.human, final ? t_('msg.final') : t_('msg.lap', { n: r.lap }), final ? 'gold' : '');
    sfx.lap(PAN[r.human], final);
  }
}

function finishRacer(r) {
  r.finished = true;
  r.finishTime = game.raceTime;
  const place = ++game.finishCount;
  if (r.human >= 0) {
    const h = huds[r.human];
    h.finished.innerHTML = `<div class="f1">${t_('finish')}</div><div class="f2">${place}<sup>${ordinal(place)}</sup></div>`;
    h.finished.classList.add('show');
    sfx.finish(PAN[r.human]); buzz('win');
    particles.burst(r.pos.x, 3, r.pos.z, 40, {
      color: [0xe53935, 0xfdd835, 0x1e88e5, 0x43a047, 0xffffff, 0xff80ab],
      speed: 9, up: 9, gravity: 14, life: 1.6, size: 0.16, drag: 1,
    });
  }
  if (humans.every(h => h.finished)) game.endTimer = 3.2;
}
