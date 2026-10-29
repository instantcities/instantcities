// The HUD over each player's view: speed, place, laps, items, messages, the sight cards and the
// pointers to the sights out of view, and the countdown.

import { PLAYER_COLORS } from '../horses.js';
import { ordinal, local } from '../i18n.js';
import { ITEMS } from '../items.js';
import { QUESTS, SIGHTS, INSIDE } from '../city.js';
import { sfx } from '../sound.js';
import { t_, MAX_ITEMS, hex, clamp, wrapAngle, fmtTime, $ } from './base.js';
import { game } from './settings.js';
import { cams, camYaw } from './scene.js';
import { roaming, questing, heliMode, sightPage, quest, world, track } from './worlds.js';
import { humans, ctl, thrown, clouds } from './racers.js';
import { questHud } from './race.js';
import { roomName, doorAction, putAt } from './indoors.js';
import { paintballActive, cabOf, busQuest } from './physics.js';
import { riding, seated, tramAction, updateDoorCard, toggleSeat, updateTramCard } from './transit.js';
import { touch, tItem, tItemIco, tItemQueue, tFries, tFriesLabel } from './input.js';
import { ICONS } from './icons.js';

// the sights' cards' icon (and the tour's): an eye, something to look at here
export const EYE = '<svg class="sight-eye" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3.2"/></svg>';
const LM_PILL = '<div class="lmp hidden"><span class="lma">➤</span><span class="lme"></span><b></b><small></small></div>';
export const huds = [0, 1].map(buildHud);
// the tram card answers a click or a tap: wait for the tram, get on the bus, or get off; its
// button takes you inside the tram to sit by a window, or back out for the view from outside
huds.forEach((h, p) => h.tram.addEventListener('pointerdown', e => {
  e.stopPropagation();
  if (game.state === 'race') tramAction(humans[p]);
}));
// the door card goes through the door
huds.forEach((h, p) => h.door.addEventListener('pointerdown', e => {
  e.stopPropagation();
  if (game.state === 'race') doorAction(humans[p]);
}));
huds.forEach((h, p) => h.tramSeat.addEventListener('pointerdown', e => {
  e.stopPropagation();
  const r = humans[p];
  if (game.state !== 'race') return;
  if (r.tram?.ask || r.bus?.ask) { if (r.tram) r.tram.ask = null; if (r.bus) r.bus.ask = null; sfx.ui(); } // asked where to get off: no, stay on
  else toggleSeat(r);
}));
// the sight card: ✕ puts it away until you ride on to another sight; Read more opens the site's page
// about it in a new tab. Neither lets the tap through to the steering under it.
huds.forEach(h => {
  h.sight.addEventListener('pointerdown', e => e.stopPropagation());
  // ✕ folds the card into its small ⓘ; the ⓘ opens it again and keeps it open until ✕ or until you ride off
  h.sightX.addEventListener('click', () => { h.sightMini = true; h.sightPinned = false; });
  h.sightI.addEventListener('click', () => { h.sightMini = false; h.sightPinned = true; });
});
huds.forEach((h, p) => h.sightEnter.addEventListener('click', e => {
  e.preventDefault();
  const room = h.sightRoom;
  if (room && game.state === 'race') { putAt(humans[p], room.inside.x, room.inside.z, room.inside.yaw); hudMsg(p, `${room.emoji} ${roomName(room)}`); }
}));

function buildHud(p) {
  const el = document.createElement('div');
  el.className = `hud hidden${p % 2 ? ' right' : ''}`;
  el.id = `hud${p}`;
  el.innerHTML = `
    <div class="hud-top">
      <div class="placebox"><div class="place"><span class="n">4</span><span class="suf">th</span></div><div class="who"></div>
</div>
      <div class="stats"><div class="lap"><span class="lapl">LAP</span> <b>1</b><span class="of">/<i>3</i></span></div><div class="time">0:00.00</div></div>
    </div>
    <div class="cd"></div>
    <div class="qnav"><div class="qarrow">➤</div><div class="qinfo"></div></div>
    <div class="qhp hidden"><span class="heart">❤</span><i></i><i></i><i></i></div>
    <div class="qfries"></div>
    <div class="msg"></div>
    <div class="alert wrong">WRONG WAY!</div>
    <div class="alert incoming"></div>
    <div class="finished"></div>
    <div class="hud-bottom">
      <div class="items">${'<span class="slot"><span class="ico"></span></span>'.repeat(MAX_ITEMS)}</div>
      <div class="hint"></div>
    </div>
    <div class="flash"></div>
    <div class="lm l">${LM_PILL.repeat(2)}</div><div class="lm r">${LM_PILL.repeat(2)}</div>
    <div class="sight"><button class="sight-i" type="button" aria-label="Info">${EYE}</button><button class="sight-x" type="button">✕</button><div class="sight-head">${EYE}<b></b></div><div class="sight-text"></div><div class="sight-btns"><a class="chip sight-more" target="_blank" rel="noopener"></a><a class="chip sight-enter"></a></div></div>
    <div class="tramcard"><div class="tram-head"></div><div class="tram-row"><span class="tram-badge"></span><div class="tram-info"><small></small><b></b><p></p></div></div><div class="tram-btns"><button class="chip tram-go" type="button"></button><button class="chip tram-seat" type="button" hidden></button></div></div>
    <button class="doorcard" type="button"><span class="door-emoji"></span><span><small></small><b></b></span><kbd></kbd></button>`;
  el.insertAdjacentHTML('afterbegin', '<div class="seatview"><div class="pane"></div><div class="sill"></div><div class="pole"></div><div class="seatback"></div></div>'
    + '<div class="cabview"><div class="roof"></div><div class="pillar l"></div><div class="pillar r"></div><div class="mirror"></div><div class="dash"></div><div class="wheel"></div></div>');
  document.body.appendChild(el);
  // each player's street sign sits in the bar under the minimap
  const street = document.createElement('div');
  street.className = 'street hidden';
  street.style.setProperty('--c', hex(PLAYER_COLORS[p]));
  street.innerHTML = '<div class="now"></div><div class="next"></div>';
  $('streetbar').appendChild(street);
  const q = s => el.querySelector(s);
  return {
    el, who: q('.who'), lapLabel: q('.lapl'), lapOf: q('.lap .of'), place: q('.place'), placeN: q('.place .n'), placeSuf: q('.place .suf'),
    lap: q('.lap b'), laps: q('.lap i'), time: q('.time'), cd: q('.cd'), msg: q('.msg'),
    wrong: q('.wrong'), incoming: q('.incoming'), finished: q('.finished'), hint: q('.hint'),
    items: q('.items'), slots: [...el.querySelectorAll('.slot')], icons: [...el.querySelectorAll('.ico')],
    flash: q('.flash'), qnav: q('.qnav'), qarrow: q('.qarrow'), qinfo: q('.qinfo'), qhp: q('.qhp'), qbars: [...el.querySelectorAll('.qhp i')], qfries: q('.qfries'), street, streetNow: street.querySelector('.now'), streetNext: street.querySelector('.next'),
    door: q('.doorcard'), doorEmoji: q('.door-emoji'), doorLabel: q('.doorcard small'), doorName: q('.doorcard b'), doorKey: q('.doorcard kbd'),
    tram: q('.tramcard'), tramBadge: q('.tram-badge'), tramLabel: q('.tramcard small'), tramName: q('.tramcard b'), tramText: q('.tramcard p'), tramSeat: q('.tram-seat'), tramHead: q('.tram-head'), tramGo: q('.tram-go'), seatView: q('.seatview'), cabView: q('.cabview'),
    sight: q('.sight'), sightName: q('.sight b'), sightText: q('.sight-text'), sightX: q('.sight-x'), sightMore: q('.sight-more'), sightEnter: q('.sight-enter'), sightI: q('.sight-i'), sightMini: false, sightPinned: false, sightAt: null, sightShut: null,
    // the pointers to the sights out of view: [left, right], two each
    lm: [...el.querySelectorAll('.lm')].map(c => [...c.querySelectorAll('.lmp')].map(e => ({
      el: e, arrow: e.querySelector('.lma'), emoji: e.querySelector('.lme'), name: e.querySelector('b'), dist: e.querySelector('small'),
    }))),
    lmOut: new Map(), // sight → the side its pointer is on
  };
}

// an icon (icons.js) and words after it, set only when they change
export function setIconText(el, icon, text) {
  const v = icon + text;
  if (el._v === v) return;
  el._v = v;
  el.innerHTML = icon;
  el.append(document.createTextNode(text));
}
// words without the emoji they start with (where an icon stands for it)
const bare = s => s.replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, '');

export function setText(el, v) {
  v = String(v);
  if (el._v !== v) { el._v = v; el.textContent = v; }
}

export function restartAnim(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

export function hudMsg(p, text, cls = '') {
  if (humans[p]?.finished) return; // the FINISH banner owns the screen now
  const m = huds[p].msg;
  m.textContent = text;
  m.className = 'msg';
  void m.offsetWidth;
  m.className = `msg show ${cls}`;
}

export function refreshHints() {
  huds.forEach((h, p) => {
    const k = ctl(p).label;
    // bottom left on a keyboard: the keys this mission needs (the paint gun and borrowing a car, the bus, a tequila shot)
    const hint = paintballActive() && roaming() ? 'hint.paint' : busQuest() ? 'hint.bus' : heliMode() ? 'hint.heli' : questing() && QUESTS[game.mission - 1]?.tequila ? 'hint.tequila' : game.weapons && !roaming() ? 'hint.full' : 'hint.jump';
    h.hint.innerHTML = t_(hint, { fire: k.fire, jump: k.jump, back: k.back });
    setText(h.lapLabel, t_(track.open ? 'toGo' : 'lap'));
    h.wrong.textContent = t_('wrongWay');
  });
}

// The sight a rider is at while exploring: the nearest one they are inside of, and the one they are
// already reading until they are a little past its edge, so the card does not flicker at the rim.
function sightAt(r, now) {
  let best = null, bd = Infinity;
  for (const s of SIGHTS) {
    const d = Math.hypot(r.pos.x - s.x, r.pos.z - s.z);
    // a secret one, found, goes before the one it is hidden in
    const by = d - s.r - (s.secret ? 1e4 : 0);
    if (d < s.r + (s === now ? 15 : 0) && by < bd) { best = s; bd = by; }
  }
  return best;
}

// A sight's card shows in full for a moment (its fade in, then 2 s) and folds into a small ⓘ, which
// stays while you are at the sight; a tap on it opens the card again. Riding off puts it away; at
// the next sight it shows in full again.
const SIGHT_FOR = 2.5;
function updateSight(h, r) {
  const s = roaming() && !questing() && game.cards ? sightAt(r, h.sightAt) : null;
  if (s !== h.sightAt) { h.sightSince = game.time; h.sightMini = false; h.sightPinned = false; }
  h.sightAt = s;
  if (s && !h.sightPinned && game.time - h.sightSince > SIGHT_FOR) h.sightMini = true;
  const show = !!s, changed = show !== h.sightShown || h.sightMini !== h.sightWasMini;
  h.sightShown = show;
  h.sightWasMini = h.sightMini;
  h.sight.classList.toggle('show', show);
  h.sight.classList.toggle('mini', h.sightMini);
  if (show) {
    const words = local(s.text);
    setText(h.sightName, words.name);
    // three short facts where there are, as on the tour, or else the sight's own words
    const facts = s.facts && local(s.facts);
    const key = facts ? facts.join('\n') : words.text;
    if (h.sightText._v !== key) {
      h.sightText._v = key;
      if (!facts) h.sightText.textContent = words.text;
      else {
        const ul = document.createElement('ul');
        for (const f of facts) ul.append(Object.assign(document.createElement('li'), { textContent: f }));
        h.sightText.replaceChildren(ul);
      }
    }
    // a landmark's card (site-sights.js) has its page on the site; one inside a building, the page of
    // the famous piece it is about, or else of the museum
    const href = sightPage(s.id);
    if (h.sightMore._href !== href) {
      h.sightMore._href = href;
      h.sightMore.hidden = !href;
      if (href) h.sightMore.href = href;
      h.sightX.title = h.sightX.ariaLabel = t_('sight.close');
    }
    setText(h.sightMore, t_('sight.more'));
    // a building you can go into (<city>/inside.js) has a button for that, which takes you in
    h.sightRoom = (s.enter && INSIDE.list.find(b => b.id === s.enter)) || null;
    h.sightEnter.hidden = !h.sightRoom;
    setText(h.sightEnter, t_('sight.enter'));
  }
  // the pointers in the card's corner make room for it
  if (changed) h.el.style.setProperty('--sight-h', show ? `${h.sight.offsetHeight}px` : '0px');
}

// While exploring, the bottom corners point the way to the sights nearby that are out of view: up
// to two on each side, nearest first, on the side you would turn to.
const POINT_NEAR = 600; // game metres
function updatePointers(h, r, p) {
  const cam = cams[p];
  const fov = cam.fov + (cam.aspect < 1 ? (1 - cam.aspect) * 40 : 0); // as render() widens it in portrait
  const half = Math.atan(Math.tan(fov * Math.PI / 360) * cam.aspect);
  const sides = [[], []];
  if (roaming() && !questing() && !r.finished) {
    for (const s of SIGHTS) {
      if (s.secret) continue; // to be found, not pointed to
      if (s.inside !== r.room) continue; // inside a building, only what is in it; outside, nothing inside
      const dx = s.x - r.pos.x, dz = s.z - r.pos.z, d = Math.hypot(dx, dz);
      const a = wrapAngle(Math.atan2(dx, dz) - camYaw[p]); // > 0 is to the left
      // out of view a little past the screen's edge, back in view right at it: no flicker at the rim
      const out = s !== h.sightAt && d < POINT_NEAR && Math.abs(a) > half + (h.lmOut.has(s) ? 0 : 0.12);
      if (!out) { h.lmOut.delete(s); continue; }
      // right behind you it keeps the side it was on, until it is clearly on the other one
      const was = h.lmOut.get(s), side = was !== undefined && Math.abs(a) > 2.8 ? was : a > 0 ? 0 : 1;
      h.lmOut.set(s, side);
      sides[side].push({ s, a, d });
    }
  }
  sides.forEach((list, k) => {
    list.sort((x, y) => x.d - y.d);
    h.lm[k].forEach((pt, i) => {
      const it = list[i];
      pt.el.classList.toggle('hidden', !it);
      if (!it) return;
      setText(pt.emoji, it.s.emoji);
      setText(pt.name, local(it.s.text).name);
      setText(pt.dist, `${Math.max(10, Math.round(it.d / 10) * 10)} m`);
      pt.arrow.style.transform = `rotate(${(-it.a * 180 / Math.PI - 90).toFixed(0)}deg)`;
    });
  });
}

export function updateHud() {
  const bunnyTargets = new Set(thrown.map(b => b.target));
  const cloudTargets = new Set(clouds.filter(c => c.state === 'fly').map(c => c.target));
  humans.forEach((r, p) => {
    const h = huds[p];
    setText(h.placeN, r.place);
    setText(h.placeSuf, ordinal(r.place));
    h.place.dataset.p = r.place;
    const st = world.streets;
    h.street.classList.toggle('hidden', (!st && !roaming()) || p >= game.players);
    updateSight(h, r);
    updatePointers(h, r, p);
    updateTramCard(h, r, p);
    updateDoorCard(h, r, p);
    h.hint.classList.toggle('hidden', riding(r)); // no jumping off a moving tram
    h.seatView.classList.toggle('show', seated(r) && p < game.players);
    h.cabView.classList.toggle('show', !!cabOf(r) && game.state !== 'menu' && p < game.players);
    h.cabView.dataset.type = r.car?.type ?? '';
    if (roaming()) {
      // where you are (inside a building: its name) and what you are doing, each with its icon
      setIconText(h.streetNow, r.room ? ICONS.building : ICONS.pin, r.room ? roomName(r.room) : r.street || '…');
      setIconText(h.streetNext, quest ? ICONS.mission : ICONS.explore, bare(quest ? questHud(r) : t_('roam.hud')));
      h.streetNext.classList.remove('soon');
    } else if (st) {
      const i = r.idx, last = st.next[i] < 0, ahead = ((last ? track.finish : st.next[i]) - i) * track.spacing;
      setIconText(h.streetNow, ICONS.race, st.names[st.at[i]]);
      const arrow = last ? '🏁' : st.turn[i] > 0 ? '↰' : st.turn[i] < 0 ? '↱' : '↑';
      setText(h.streetNext, `${arrow} ${last ? t_('banner') : st.names[st.at[st.next[i] % track.n]]} · ${Math.max(10, Math.round(Math.max(0, ahead) / 10) * 10)} m`);
      h.streetNext.classList.toggle('soon', ahead < 40);
    }
    setText(h.lapLabel, t_(track.open ? 'toGo' : 'lap'));
    if (track.open) {
      // an open route: how far it is still to the finish
      const left = Math.max(0, track.finish - r.idx) * track.spacing;
      setText(h.lap, r.finished ? '0 m' : left >= 1000 ? `${(left / 1000).toFixed(1)} km` : `${Math.round(left / 10) * 10} m`);
    } else {
      setText(h.lap, clamp(r.lap, 1, game.laps));
      setText(h.laps, game.laps);
    }
    h.lapOf.classList.toggle('hidden', track.open);
    setText(h.time, fmtTime(r.finished ? r.finishTime : game.raceTime));
    if (quest) updateQuestHud(h, r, p);
    h.slots.forEach((s, i) => {
      const kind = r.items[i];
      s.classList.toggle('full', !!kind);
      s.classList.toggle('next', i === 0 && !!kind);
      setText(h.icons[i], kind ? ITEMS[kind].emoji : '');
    });
    h.wrong.classList.toggle('show', r.wrongWay > 0.8 && !r.finished);
    if (p === 0 && touch.on) {
      setText(tItemIco, r.items[0] ? ITEMS[r.items[0]].emoji : '🐰');
      setText(tItemQueue, r.items.slice(1).map(k => ITEMS[k].emoji).join(''));
      tItem.classList.toggle('empty', !r.items.length);
    }
    const warn = r.finished ? '' : cloudTargets.has(r) ? t_('incoming.cloud') : bunnyTargets.has(r) ? t_('incoming.bunny') : '';
    setText(h.incoming, warn);
    h.incoming.classList.toggle('show', !!warn);
  });
}

// A quest's HUD: the time left instead of the time taken, and an arrow to where you have to go.
function updateQuestHud(h, r, p) {
  const left = Math.max(0, quest.def.time - (game.questEnd ?? game.raceTime));
  setText(h.time, '⏱ ' + fmtTime(left).replace(/\.\d+$/, ''));
  h.time.classList.toggle('low', left < 10 && !quest.over);
  // the health bar: a heart and a line for each hit you can still take, blinking just after one
  const hp = quest.health(r);
  h.qhp.classList.toggle('hidden', !hp);
  if (hp) {
    h.qbars.forEach((b, i) => {
      b.classList.toggle('hidden', i >= hp.of);
      b.classList.toggle('on', i < hp.hp);
    });
    h.qhp.classList.toggle('hit', hp.safe > 0);
  }
  // the julientje: ready, or how long it is still charging
  const fries = quest.friesIn(r);
  if (fries !== null) {
    const label = fries > 0 ? `${t_('quest.charging')} ${Math.ceil(fries)}s` : t_('quest.fries');
    h.qfries.innerHTML = fries > 0 ? `<img src="/preview/pr-97/core/img/julientje.svg" alt=""> ${label}` : `<img src="/preview/pr-97/core/img/julientje.svg" alt=""> <kbd>${ctl(p).label.fire}</kbd> ${label}`;
    h.qfries.classList.toggle('charging', fries > 0);
    if (p === 0) {
      setText(tFriesLabel, fries > 0 ? label : t_('quest.friesShort'));
      tFries.classList.toggle('charging', fries > 0);
    }
  }
  const shot = quest.tequilaIn(r);
  if (shot !== null) {
    const gun = paintballActive(); // with the paintball gun the shoot key throws, not jump
    h.qfries.innerHTML += `<br>${gun ? '🔫' : '<img src="/preview/pr-97/core/img/tequila.svg" alt="">'} ${shot > 0 ? `${t_('quest.charging')} ${Math.ceil(shot)}s` : `<kbd>${gun ? ctl(p).label.fire : ctl(p).label.jump}</kbd> ${t_(gun ? 'audio.paintball' : 'quest.tequila')}`}`;
  }
  if (p === 0 && shot !== null && !paintballActive()) {
    const button = $('tJump');
    setText(button.querySelector('small'), shot > 0 ? `${t_('quest.charging')} ${Math.ceil(shot)}s` : t_('quest.tequila'));
    button.classList.toggle('charging', shot > 0);
  }
  const to = quest.target(r), score = !to && quest.tally; // the paint fight: no arrow, only the score
  h.qnav.classList.toggle('hidden', (!to && !score) || quest.over);
  h.qarrow.classList.toggle('hidden', !to);
  if (score) return setText(h.qinfo, `${quest.def.icon ?? '🎓'} ${score.got}/${score.of}`);
  if (!to) return;
  // straight up on screen is the way the camera looks
  const a = wrapAngle(Math.atan2(to.x - r.pos.x, to.z - r.pos.z) - camYaw[p]);
  h.qarrow.style.transform = `rotate(${(-a * 180 / Math.PI - 90).toFixed(1)}deg)`;
  const d = Math.hypot(to.x - r.pos.x, to.z - r.pos.z), tally = quest.tally;
  setText(h.qinfo, (tally ? `${quest.def.icon ?? '🎓'} ${tally.got}/${tally.of} · ` : '') + `${Math.round(d)} m`);
}

export function updateCountdown() {
  let text = '';
  if (game.state === 'countdown' && game.cd > 0.5) text = String(3 - Math.floor(game.cd - 0.5));
  else if (game.state === 'race' && game.raceTime < 1) text = t_('go');
  if (text === game.cdShown) return;
  game.cdShown = text;
  for (const h of huds) {
    h.cd.textContent = text;
    h.cd.classList.toggle('go', text === t_('go'));
    if (text) restartAnim(h.cd, 'pop');
  }
  if (text) sfx.countdown(text === t_('go'));
}
