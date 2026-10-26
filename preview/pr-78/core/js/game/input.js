// Input: the gamepads, the keyboard and the mouse, and the touch controls on a phone.

import { LANGS, local, getLang } from '../i18n.js';
import { SIGHTS, INSIDE } from '../city.js';
import { sfx } from '../sound.js';
import { t_, MAX_PLAYERS, GAME_KEYS, clamp, $ } from './base.js';
import { game } from './settings.js';
import { renderer } from './scene.js';
import { roaming, questing, freeStick, flying, touringNow, KINDS, demo, report, world, setTrack } from './worlds.js';
import { racers, humans, ctl } from './racers.js';
import { setupMinimap } from './minimap.js';
import {
  bigEl, big, openBigMap, sideIndex, layoutBigMap, zoomBigMap, drawBigMap, placeLanding, landingAt, teleport,
  BIG_STEP, bigIndex, bigSearch, showBigTab, confirmTeleport, closeBigMapAndPlay,
} from './bigmap.js';
import {
  pauseEl, navRows, menuRow, setMenuRow, TOUR_MODES, setTourMode, renderMenu, setLanguage, setMode, setKind,
  missionPlayer, selectMission, selectTrack, toggleSound,
} from './menu.js';
import { beginQuest, startRace, toMenu, pauseBtns, pauseSel, selectPause, setPaused } from './race.js';
import { tourNext } from './touring.js';
import { held } from './control.js';
import { doorAction, putAt } from './indoors.js';
import { paintballOn, shoot, jump } from './physics.js';
import { throwFries, useItem } from './pickups.js';
import { riding, tramAction } from './transit.js';
import { RECORD, go, endDemo } from './demofilm.js';

// Gamepad k plays for player k. A (or RT, or stick up) runs, B/LT brakes, X/RB jumps,
// Y/LB uses the item (hold B to throw backwards), Start pauses. In the menu the d-pad moves around.
export const pads = { prev: [{}, {}], input: [null, null] };

export function pollPads() {
  if ($('musicSettings').open) return;
  const list = navigator.getGamepads ? [...navigator.getGamepads()].filter(gp => gp && gp.connected) : [];
  for (let k = 0; k < MAX_PLAYERS; k++) {
    const gp = list[k];
    if (!gp) { pads.input[k] = null; continue; }
    const b = i => !!gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5);
    const ax = gp.axes[0] ?? 0, ay = gp.axes[1] ?? 0;
    const now = {
      a: b(0), b: b(1), x: b(2), y: b(3), lb: b(4), rb: b(5), lt: b(6), rt: b(7), start: b(9),
      left: b(14) || ax < -0.5, right: b(15) || ax > 0.5, up: b(12) || ay < -0.5, down: b(13) || ay > 0.5,
    };
    const prev = pads.prev[k];
    const edge = key => now[key] && !prev[key];
    pads.prev[k] = now;
    if (Object.values(now).some(Boolean)) setTouchMode(false);
    pads.input[k] = {
      steer: clamp(Math.abs(ax) > 0.15 ? -ax : (now.left ? 1 : 0) - (now.right ? 1 : 0), -1, 1),
      throttle: (now.a || now.rt || now.up ? 1 : 0) - (now.b || now.lt || now.down ? 1 : 0),
      back: now.b || now.lt || now.down,
      lift: (now.x || now.rb ? 1 : 0) - (now.y || now.lb ? 1 : 0), // up and down, on the dragon
    };
    if (game.state === 'menu') {
      if (edge('up')) onPress('ArrowUp');
      if (edge('down')) onPress('ArrowDown');
      if (edge('left')) onPress('ArrowLeft');
      if (edge('right')) onPress('ArrowRight');
      if (edge('a') || edge('start')) onPress('Enter');
    } else if (game.state === 'race' || game.state === 'countdown') {
      if (edge('start')) onPress('Escape');
      if (game.state === 'race' && k < humans.length) {
        if (edge('x') || edge('rb')) jump(humans[k]);
        if ((edge('y') || edge('lb')) && !doorAction(humans[k]) && !tramAction(humans[k]) && !throwFries(humans[k])) useItem(humans[k], pads.input[k].back);
      }
    } else if (game.state === 'tour' && flying()) {
      if (edge('start')) setPaused(true); // (A, B and the rest fly it: flyControl)
    } else if (game.state === 'tour') {
      if (edge('a') || edge('right')) tourNext();
      else if (edge('start')) setPaused(true);
      else if (edge('b')) toMenu();
    } else if (game.state === 'briefing') {
      if (edge('a') || edge('start')) beginQuest();
      else if (edge('b')) toMenu();
    } else if (game.state === 'paused') {
      if (edge('start')) setPaused(false);
      else if (!pauseEl.classList.contains('hidden')) {
        if (edge('left') || edge('up')) onPress('ArrowLeft');
        if (edge('right') || edge('down')) onPress('ArrowRight');
        if (edge('a')) onPress('Enter');
      }
    } else if (game.state === 'results') {
      if (edge('a') || edge('start')) onPress('Enter');
      else if (edge('b')) onPress('KeyT');
    }
  }
}

let toastTimer = 0;
function toast(text) {
  $('toast').textContent = text;
  $('toast').classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.add('hidden'), 3500);
}
addEventListener('gamepadconnected', e => toast(t_('pad', { n: Math.min(MAX_PLAYERS, e.gamepad.index + 1) })));

// ------------------------------------------------------------------ input

export const keys = new Set();
const isStart = code => code === 'Space' || code === 'Enter' || code === 'NumpadEnter';

function onPress(code) {
  if ($('musicSettings').open) return;
  sfx.unlock();
  if (demo && !RECORD) { // the demo: Esc stops it, and on a link to it any key starts it
    if (code === 'Escape') endDemo();
    else if (demo.waiting) go();
    return;
  }
  if (code === 'KeyM') return toggleSound();
  switch (game.state) {
    case 'menu': {
      const up = code === 'KeyW' || code === 'ArrowUp', down = code === 'KeyS' || code === 'ArrowDown';
      const left = code === 'KeyA' || code === 'ArrowLeft', right = code === 'KeyD' || code === 'ArrowRight';
      const rows = navRows();
      if (up || down) {
        setMenuRow((menuRow + (down ? 1 : -1) + rows.length) % rows.length);
        sfx.ui();
        renderMenu();
      } else if (left || right) {
        const d = right ? 1 : -1, row = rows[menuRow];
        if (row === 'track') selectTrack(game.trackIdx + d);
        else if (row === 'kind') setKind(KINDS[(KINDS.indexOf(game.kind) + d + KINDS.length) % KINDS.length]);
        else if (row === 'quest') selectMission(game.mission + d);
        else if (row === 'tour') setTourMode(TOUR_MODES[(TOUR_MODES.indexOf(game.tourMode) + d + TOUR_MODES.length) % TOUR_MODES.length]);
        else if (row === 'lang') { const codes = Object.keys(LANGS); setLanguage(codes[(codes.indexOf(getLang()) + d + codes.length) % codes.length]); }
      } else if (isStart(code)) startRace();
      break;
    }
    case 'tour':
      if (flying()) { // Space and Enter fly up and down (flyControl)
        if (code === 'Escape') setPaused(true);
        else if (code === 'KeyT') toMenu();
        break;
      }
      if (isStart(code) || code === 'Escape') setPaused(true); // the pause menu, and Space/Enter again carries on
      else if (code === 'ArrowRight' || code === 'KeyD') tourNext();
      else if (code === 'KeyT') toMenu();
      break;
    case 'briefing':
      if (isStart(code)) beginQuest();
      else if (code === 'Escape' || code === 'KeyT') toMenu();
      break;
    case 'countdown':
    case 'race':
      if (code === 'Escape') {
        // on board: get off (as Enter does), or not after all when it asks where; otherwise the pause menu
        const aboard = game.state === 'race' ? humans.slice(0, game.players).filter(riding) : [];
        if (aboard.length) aboard.forEach(r => { if (r.tram?.ask) r.tram.ask = null; else if (r.bus?.ask) r.bus.ask = null; else tramAction(r); });
        else setPaused(true);
        break;
      }
      if (code === 'KeyK') { openBigMap(); break; } // K for kaart
      if (game.state !== 'race') break;
      humans.forEach((r, p) => {
        const k = ctl(p);
        if (r.heli) return; // in the helicopter jump and fire are up and down (humanControl)
        if (k.fire.includes(code) && (doorAction(r) || tramAction(r))) return; // by a door, at a tram stop, or on the tram
        if (k.fire.includes(code) && throwFries(r)) return;
        if (k.fire.includes(code) && paintballOn(r)) return shoot(r);
        if (k.fire.includes(code)) useItem(r, held(k.down));
        if (k.jump.includes(code)) jump(r);
      });
      break;
    case 'paused':
      if (big && pauseEl.classList.contains('hidden')) {
        // on the big map: Enter teleports, Escape forgets the spot and then closes the map
        if (isStart(code)) confirmTeleport();
        else if (code === 'Equal' || code === 'NumpadAdd') zoomBigMap(big.zoom * BIG_STEP);
        else if (code === 'Minus' || code === 'NumpadSubtract') zoomBigMap(big.zoom / BIG_STEP);
        else if (code === 'Escape' || code === 'KeyP' || code === 'KeyK') {
          if (big.pick && code === 'Escape') { big.pick = null; drawBigMap(); }
          else closeBigMapAndPlay();
        }
        break;
      }
      if (code === 'Escape') setPaused(false);
      else if (code === 'ArrowLeft' || code === 'ArrowUp') selectPause(pauseSel - 1);
      else if (code === 'ArrowRight' || code === 'ArrowDown') selectPause(pauseSel + 1);
      else if (isStart(code)) pauseBtns[pauseSel].click();
      break;
    case 'results':
      if (game.time - game.resultsAt < 1.2) break;
      if (isStart(code)) startRace();
      else if (code === 'KeyT') toMenu();
      break;
  }
}

addEventListener('keydown', e => {
  if ($('musicSettings').open) return;
  if (e.target instanceof HTMLInputElement) {
    if (e.key === 'Enter' || e.key === 'Escape') e.target.blur();
    return;
  }
  // on the big map on a desktop, typing a letter goes straight to the search for a place (the character lands in it)
  if (big && !touch.on && roaming() && !questing() && e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (bigIndex.classList.contains('hidden')) showBigTab('index');
    bigSearch.focus();
    return;
  }
  if (GAME_KEYS.has(e.code)) e.preventDefault();
  if (e.isTrusted) setTouchMode(false); // a real keyboard: show keyboard controls again
  keys.add(e.code);
  if (!e.repeat) onPress(e.code);
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('pointerdown', e => {
  sfx.unlock();
  // a mouse click anywhere on the race pauses it (touch steers, so only the mouse)
  if (e.pointerType !== 'touch' && (game.state === 'race' || game.state === 'countdown')
    && !e.target.closest('button, #minimap, #touch, .tramcard')) setPaused(true);
});
addEventListener('blur', () => {
  keys.clear();
  setPaused(true);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) setPaused(true);
  else if (sfx.ctx) sfx.unlock(); // the menu's music, back after the phone stopped it (iOS)
});
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight, false);
  if (world) setupMinimap();
  if (big) {
    bigEl.classList.toggle('side', sideIndex());
    layoutBigMap();
    showBigTab(big.tab);
  }
});

// ------------------------------------------------------------------ touch controls

export const touch = { on: false, shown: false, steer: 0, throttle: 0, steerId: null, originX: 0, zoneLeft: 0 };
const touchEl = $('touch'), steerZone = $('steerZone'), stick = $('stick'), knob = $('knob');
export const tItem = $('tItem'), tItemIco = tItem.querySelector('.ico'), tItemQueue = tItem.querySelector('.queue');
export const tFries = $('tFries'), tFriesLabel = tFries.querySelector('small');
const STICK_R = 60;

export function setTouchMode(on) {
  if (touch.on === on) return;
  touch.on = on;
  document.body.classList.toggle('touch', on);
  if (on && game.mode > 1 && game.state === 'menu') setMode(1);
  renderMenu();
}

export function updateTouchLayer() {
  const show = touch.on && (((game.state === 'race' || game.state === 'countdown' || game.state === 'paused') && !touringNow()) || (game.state === 'tour' && flying()));
  if (show === touch.shown) return;
  touch.shown = show;
  touchEl.classList.toggle('hidden', !show);
  if (!show) {
    touch.steer = 0;
    touch.throttle = 0;
    knob.style.transform = '';
  }
}

// A floating stick: it appears under the thumb, and follows it once dragged past its edge.
// Pushing it up rides forward and down backs up (in a race or a quest the horse gallops anyway, so down brakes).
function steerTo(x, y) {
  let dx = x - touch.originX, dy = y - touch.originY;
  const d = Math.hypot(dx, dy);
  if (d > STICK_R) {
    dx *= STICK_R / d;
    dy *= STICK_R / d;
    touch.originX = x - dx;
    touch.originY = y - dy;
    stick.style.left = touch.originX - touch.zoneLeft + 'px';
    stick.style.top = touch.originY - touch.zoneTop + 'px';
  }
  touch.steer = -dx / STICK_R;
  touch.throttle = -dy / STICK_R;
  knob.style.transform = `translate(${dx}px, ${dy}px)`;
}

steerZone.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (touch.steerId !== null) return;
  touch.steerId = e.pointerId;
  try { steerZone.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
  const rect = steerZone.getBoundingClientRect();
  touch.zoneLeft = rect.left;
  touch.zoneTop = rect.top;
  touch.originX = e.clientX;
  // riding on by itself: carry on at that pace from wherever the thumb comes down
  touch.originY = e.clientY + (freeStick() ? Math.max(0, touch.throttle) * STICK_R : 0);
  stick.style.left = e.clientX - rect.left + 'px';
  stick.style.top = e.clientY - rect.top + 'px';
  stick.classList.remove('rest');
  stick.classList.add('on');
  steerZone.classList.add('active');
  steerTo(e.clientX, e.clientY);
});
steerZone.addEventListener('pointermove', e => { if (e.pointerId === touch.steerId) steerTo(e.clientX, e.clientY); });
const endSteer = e => {
  if (e.pointerId !== touch.steerId) return;
  touch.steerId = null;
  touch.steer = 0;
  // exploring, let go of the stick while riding forward and the horse keeps going at that pace,
  // the knob left up where it was, until the stick is pulled back
  touch.throttle = freeStick() && touch.throttle > 0.15 ? touch.throttle : 0;
  knob.style.transform = touch.throttle ? `translate(0, ${-touch.throttle * STICK_R}px)` : '';
  stick.style.left = stick.style.top = '';
  stick.classList.remove('on');
  stick.classList.add('rest');
  steerZone.classList.remove('active');
  steerZone.classList.add('used'); // the hint is only for the start
};
steerZone.addEventListener('pointerup', endSteer);
steerZone.addEventListener('pointercancel', endSteer);

function touchButton(el, down, up = () => {}) {
  el.addEventListener('pointerdown', e => {
    e.preventDefault();
    sfx.unlock();
    try { el.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    el.classList.add('pressed');
    down();
  });
  const release = () => { el.classList.remove('pressed'); up(); };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
}
touchButton($('tJump'), () => { touch.climb = racers[0].heli || flying(); if (game.state === 'race') jump(racers[0]); }, () => { touch.climb = false; });
touchButton(tItem, () => { if (game.state === 'race') useItem(racers[0], touch.throttle < -0.5); });
touchButton(tFries, () => throwFries(racers[0]));
touchButton($('tAction'), () => { if (game.state === 'race') doorAction(racers[0]); }); // the action button: through the door, or the painting full screen (action.js)
touchButton($('tSink'), () => { touch.sink = true; }, () => { touch.sink = false; });
touchButton($('tShoot'), () => shoot(racers[0]));
touchEl.addEventListener('contextmenu', e => e.preventDefault());

addEventListener('touchstart', () => setTouchMode(true), { passive: true, capture: true });
addEventListener('touchend', () => sfx.unlock(), { passive: true }); // iOS only unlocks audio on touchend
addEventListener('click', () => sfx.unlock());

// The pause menu's Share: a link to right where you are, facing the way you face, copied for
// pasting (?pos=<x>,<z>&yaw=<radians>&n=<the street>); whoever opens it rides about freely from there.
// On the tour it is a link to the tour itself (?tour=auto), which opens straight on it, playing on its own.
export function shareSpot() {
  const onTour = game.resumeState === 'tour', r = humans[0];
  if (!onTour && !r) return;
  const name = r?.street ? `&n=${encodeURIComponent(r.street)}` : '';
  const url = onTour ? `${location.origin}${location.pathname}?tour=auto`
    : `${location.origin}${location.pathname}?pos=${r.pos.x.toFixed(1)},${r.pos.z.toFixed(1)}&yaw=${r.yaw.toFixed(2)}${name}`;
  const btn = $('pauseShareBtn'), label = btn.querySelector('span');
  const done = () => {
    label.textContent = t_(onTour ? 'pause.copiedTour' : 'pause.copied');
    btn.classList.add('copied');
    setTimeout(() => { label.textContent = t_('pause.share'); btn.classList.remove('copied'); }, 3000);
  };
  report('share_spot', { tour: onTour });
  // copied straight away; where the clipboard is not to be had, the link to copy by hand
  (navigator.clipboard?.writeText(url) ?? Promise.reject()).then(done, () => window.prompt(t_('pause.share'), url));
}

// A link to one sight, ?at=<its id> (the site's page about it has one), into a building, ?inside=<its id>, or to any place,
// ?pos=<x>,<z>&n=<its name> (the site's map page): straight into riding about freely, alone, on a
// street a little way back from it (so it is in view, not a wall up close) and looking at it.
// A link shared from the pause menu also has &yaw=<radians>: it puts you on that very spot, facing
// that way, as whoever shared it was. Nothing of it is saved in the settings.
export function visitFromLink() {
  const q = new URLSearchParams(location.search);
  // ?inside=<id>: straight in through a building's door (<city>/inside.js); with
  // &view=x,z,tx,tz standing at x, z in it looking at tx, tz (the building's own metres): before a
  // painting or a statue, from its page on the site (/preview/pr-78/art/<id>/)
  const room = q.get('inside') && INSIDE.list.find(b => b.id === q.get('inside'));
  if (room) {
    report('visit_from_link', { sight: `inside:${room.id}` });
    Object.assign(game, { kind: 'mission', mission: 0, mode: 1 });
    missionPlayer();
    setTrack(game.trackIdx);
    startRace();
    const [x, z, tx, tz] = (q.get('view') || '').split(',').map(Number);
    if ([x, z, tx, tz].every(Number.isFinite)) putAt(humans[0], room.x + x, room.z + z, Math.atan2(tx - x, tz - z));
    else putAt(humans[0], room.inside.x, room.inside.z, room.inside.yaw);
    return;
  }
  const sight = q.get('at') && SIGHTS?.find(s => s.id === q.get('at'));
  const [px, pz] = (q.get('pos') || '').split(',').map(Number);
  const yaw = Number(q.get('yaw'));
  const place = sight ? { x: sight.x, z: sight.z, r: sight.r, name: local(sight.text).name }
    : Number.isFinite(px) && Number.isFinite(pz) ? { x: px, z: pz, r: 30, name: (q.get('n') || '').slice(0, 80) } : null;
  if (!place) return;
  report('visit_from_link', { sight: sight?.id ?? 'map' });
  game.kind = 'mission';
  game.mission = 0;
  game.mode = 1;
  missionPlayer();
  setTrack(game.trackIdx); // the minimap, for riding about freely
  startRace();
  const exact = !sight && q.has('yaw') && Number.isFinite(yaw) && landingAt(place.x, place.z);
  if (exact?.ok) {
    humans.forEach(r => { r.yaw = yaw; });
    teleport(exact);
    return;
  }
  const back = place.r * 0.6, spots = [];
  for (const rd of world.cfg.map.roads) {
    for (let k = 0; k < rd.p.length; k += 2) spots.push([Math.abs(Math.hypot(rd.p[k] - place.x, rd.p[k + 1] - place.z) - back), rd.p[k], rd.p[k + 1]]);
  }
  spots.sort((a, b) => a[0] - b[0]);
  // Enclosed sights can provide a safe arrival inside their passage, looking along it.
  const arrival = sight?.arrival && landingAt(sight.arrival.x, sight.arrival.z);
  const pick = arrival?.ok ? arrival : spots.slice(0, 50).map(([, x, z]) => landingAt(x, z)).find(p => p.ok) ?? placeLanding(place);
  const look = arrival?.ok ? sight.arrival.look : [place.x, place.z];
  humans.forEach(r => { r.yaw = Math.atan2(look[0] - pick.x, look[1] - pick.z); });
  teleport(pick);
}
