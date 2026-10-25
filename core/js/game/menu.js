// The menu: picking what to play, the riders, the sky and the language.

import * as THREE from 'three';
import { TRACKS } from '../tracks.js';
import { STABLE, MOUNTS, MOUNT_COLORS, PLAYER_COLORS, ITALIAN } from '../horses.js';
import { LANGS, local, applyStatic, setLang, getLang } from '../i18n.js';
import { helicopter } from '../heli.js';
import { QUESTS, THEME, TOUR, DEMO } from '../city.js';
import { hillsOn } from '../terrain.js';
import { sfx, music } from '../sound.js';
import {
  t_, qt, DAYS, COMBOS, SKIES, MENU_SKY_EVERY, RIDE_SKY_EVERY, WET, MAX_PLAYERS, hex, clamp, fmtTime, $,
} from './base.js';
import { game, saveSettings } from './settings.js';
import { renderer, scene, menuLook } from './scene.js';
import {
  trackShapes, roaming, questing, exploring, heliMode, touring, flying, touringNow, demo, worlds, applySky,
  fadeSky, setTrack,
} from './worlds.js';
import {
  playerName, createRider, racers, assignField, refreshWho, humans, setHumans, field, setField, ctl,
} from './racers.js';
import { refreshHints } from './hud.js';
import { outline, fitMap } from './minimap.js';
import { openBigMap } from './bigmap.js';
import { resetRace, beginQuest, startRace, toMenu, setPaused } from './race.js';
import { tourSky, tour, tourNext } from './touring.js';
import { paintballUnlocked, syncJumpButton } from './physics.js';
import { touch, shareSpot } from './input.js';
import { playDemo } from './demofilm.js';

export const menuEl = $('menu'), pauseEl = $('pause'), resultsEl = $('results'), briefEl = $('brief');
const menuRows = () => touring() ? ['kind', 'tour', 'audio', 'lang', 'start'] : ['mode', 'kind', ...(roaming() ? [] : [...(TRACKS[game.trackIdx].open ? [] : ['laps']), 'weapons']), ...(roaming() ? ['quest', ...(paintballUnlocked() ? ['gun'] : [])] : []), 'ride', 'animals', ...(roaming() ? [] : ['track']), 'audio', 'lang', 'start'];
// The arrows only go from Missions / Race / Tour to the missions, the routes or the ways to take the
// tour, and on to the start button; everything else on the menu is for the mouse.
export const navRows = () => ['kind', touring() ? 'tour' : roaming() ? 'quest' : 'track', 'start'];
export let menuRow = 0;
const focusRow = name => { const i = navRows().indexOf(name); if (i >= 0) menuRow = i; };
const thumbs = new Map(); // character and mount -> portrait
const THUMB_SCALE = { bike: 1.55, vespa: 1.5, foot: 1.65, heli: 0.32 }; // in the picker, as tall as a rider on a horse (the helicopter: in the picture whole)
let studio = null;

// A portrait for the character picker, rendered from its real 3D model (a fresh one, so the model
// riding about in the scene stays where it is).
function thumbOf(h, mount) {
  const key = h.id + ':' + mount + ':' + roaming();
  if (thumbs.has(key)) return thumbs.get(key);
  const W = 240, H = 180;
  if (!studio) {
    const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4 });
    rt.texture.colorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a68, 1.7));
    const light = new THREE.DirectionalLight(0xffffff, 2.2);
    light.position.set(3, 5, 4);
    scene.add(light);
    const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 50);
    cam.position.set(5.2, 2.7, 4.6);
    cam.lookAt(0, 1.6, 0.25);
    studio = { rt, scene, cam, buf: new Uint8Array(W * H * 4) };
  }
  const m = mount === 'heli' ? { root: helicopter(), animate() {} } : createRider(h, mount);
  m.root.scale.setScalar(THUMB_SCALE[mount] ?? 1);
  m.animate(0, 0, 0, 0);
  studio.scene.add(m.root);
  const clear = renderer.getClearColor(new THREE.Color()), alpha = renderer.getClearAlpha();
  renderer.setScissorTest(false);
  renderer.setClearColor(0x000000, 0);
  renderer.setRenderTarget(studio.rt);
  renderer.clear();
  hillsOn(false);
  renderer.render(studio.scene, studio.cam);
  hillsOn(true);
  renderer.readRenderTargetPixels(studio.rt, 0, 0, W, H, studio.buf);
  renderer.setRenderTarget(null);
  renderer.setClearColor(clear, alpha);
  studio.scene.remove(m.root);
  m.root.traverse(o => { o.geometry?.dispose(); for (const x of [o.material].flat()) { x?.map?.dispose(); x?.dispose(); } });
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d'), img = g.createImageData(W, H);
  for (let y = 0; y < H; y++) img.data.set(studio.buf.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
  g.putImageData(img, 0, 0);
  thumbs.set(key, c.toDataURL());
  return thumbs.get(key);
}

// One card per route.
function buildTrackCards() {
  const wrap = $('trackCards');
  wrap.innerHTML = TRACKS.map((tr, i) => `
    <button class="tcard" data-i="${i}">
      <canvas width="240" height="120"></canvas>
      <b></b><small></small>
    </button>`).join('');
  wrap.querySelectorAll('.tcard[data-i]').forEach((card, i) => {
    const c = card.querySelector('canvas'), g = c.getContext('2d');
    const tr = trackShapes[i], { s, map } = fitMap(tr, 120, 60, tr.hw + 4);
    g.scale(2, 2);
    outline(g, tr, map, tr.hw * 2 * s + 3, '#1d1a17');
    outline(g, tr, map, tr.hw * 2 * s, TRACKS[i].theme.dirt);
    card.addEventListener('click', e => {
      card.blur();
      focusRow('track');
      selectTrack(i);
    });
  });
}

// One card per mission: exploring freely first, then the quests.
function buildQuestCards() {
  const wrap = $('questCards');
  wrap.innerHTML = ['🗺️', ...QUESTS.map(q => q.emoji)].map((emoji, i) => `<button class="qcard" data-i="${i}"><span class="qemoji">${emoji}</span><b></b><small></small></button>`).join('');
  wrap.querySelectorAll('.qcard').forEach((card, i) => card.addEventListener('click', () => {
    card.blur();
    focusRow('quest');
    selectMission(i);
  }));
}

// The tour's two cards: it plays on its own, or you fly it yourself on the city's dragon, through
// the hoops along it (a city with one: TOUR.ride); and beside them, in a city with a DEMO, the
// trailer, which plays straight away.
export const TOUR_MODES = ['auto', ...(TOUR?.ride ? ['fly'] : [])];
function buildTourCards() {
  const wrap = $('tourCards');
  wrap.innerHTML = [...TOUR_MODES, ...(DEMO ? ['trailer'] : [])].map(m => `<button class="qcard" data-m="${m}"><span class="qemoji">${{ auto: '🎬', fly: '🐉', trailer: '🎞️' }[m]}</span><b></b><small></small></button>`).join('');
  wrap.querySelectorAll('.qcard').forEach(card => card.addEventListener('click', () => {
    card.blur();
    if (card.dataset.m === 'trailer') return playDemo();
    focusRow('tour');
    setTourMode(card.dataset.m);
  }));
}

export function setTourMode(m) {
  game.tourMode = m;
  sfx.ui();
  saveSettings();
  renderMenu();
}

export function buildMenu() {
  buildTrackCards();
  buildQuestCards();
  buildTourCards();
  $('kindOpts').querySelector('[data-k="tour"]').classList.toggle('hidden', !TOUR); // a city without a tour
  $('kindOpts').querySelector('[data-k="race"]').classList.toggle('hidden', THEME.races === false); // or without races

  // One column per player seat, in that player's colour.
  $('playerCols').innerHTML = [0, 1].map(p => `
    <div class="pcol" data-p="${p}" style="--c:${hex(PLAYER_COLORS[p])}">
      <div class="phead"><span></span><input maxlength="12" spellcheck="false" autocomplete="off" enterkeyhint="done"></div>
      <div class="ppick" data-row="ride"><button class="arrow" data-m="-1">‹</button><img alt=""><button class="arrow" data-m="1">›</button></div>
      <div class="pmount" data-row="ride"><button class="arrow" data-m="-1">‹</button><b></b><button class="arrow" data-m="1">›</button></div>
      <div class="pcolor" data-row="animals"><button class="arrow" data-d="-1">‹</button><b><span class="dot"></span><i></i></b><button class="arrow" data-d="1">›</button></div>
      <div class="pkeys"></div>
    </div>`).join('');
  document.querySelectorAll('.pcol[data-p]').forEach(col => {
    const p = Number(col.dataset.p), input = col.querySelector('input');
    // the arrows beside the picture change what you are, the ones below it your colours
    col.querySelectorAll('.ppick .arrow').forEach(b => b.addEventListener('click', () => cycleMount(p, Number(b.dataset.m))));
    col.querySelectorAll('.pmount .arrow').forEach(b => b.addEventListener('click', () => cycleMount(p, Number(b.dataset.m), PHONE_MOUNTS)));
    col.querySelectorAll('.pcolor .arrow').forEach(b => b.addEventListener('click', () => cycleAnimal(p, Number(b.dataset.d))));
    col.querySelector('img').addEventListener('click', () => cycleMount(p, 1));
    input.addEventListener('input', () => renamePlayer(p, input.value));
    input.addEventListener('change', () => { renamePlayer(p, input.value); renderMenu(); });
    input.addEventListener('focus', () => renderMenu());
  });

  $('skySelect').innerHTML = SKIES.map(v => `<option value="${v}"></option>`).join('');
  $('skySelect').addEventListener('change', e => pickSky(e.target.value));
  // Language: a dropdown, only the current one shows until it is clicked or tapped.
  $('langList').innerHTML = Object.entries(LANGS).map(([code, label]) => `<button class="chip" role="option" data-lang="${code}">${label}</button>`).join('');
  $('langBtn').addEventListener('click', () => openLangList($('langList').classList.contains('hidden')));
  document.querySelectorAll('#langList button').forEach(b => b.addEventListener('click', () => { openLangList(false); setLanguage(b.dataset.lang); }));
  document.addEventListener('pointerdown', e => { if (!$('langOpts').contains(e.target)) openLangList(false); });
  $('styleBtn').addEventListener('click', () => openStyleList($('styleList').classList.contains('hidden')));
  document.querySelectorAll('#styleList button').forEach(b => b.addEventListener('click', () => { openStyleList(false); game.style = b.dataset.style; sfx.ui(); saveSettings(); renderMenu(); }));
  document.addEventListener('pointerdown', e => { if (!$('styleOpts').contains(e.target)) openStyleList(false); });
  document.querySelectorAll('#modeOpts button').forEach(b => b.addEventListener('click', () => {
    setMode(Number(b.dataset.v));
  }));
  document.querySelectorAll('.laps .arrow').forEach(b => b.addEventListener('click', () => setLaps(game.laps + Number(b.dataset.d))));
  document.querySelectorAll('#kindOpts button').forEach(b => b.addEventListener('click', () => {
    focusRow('kind');
    setKind(b.dataset.k);
  }));
  document.querySelectorAll('#weaponOpts button').forEach(b => b.addEventListener('click', () => setWeapons(b.dataset.w === '1')));
  bindSoundButton($('soundBtn'));
  $('startBtn').addEventListener('click', () => startRace());
  $('briefBtn').addEventListener('click', () => beginQuest());
  $('briefMenuBtn').addEventListener('click', () => toMenu());
  $('tourNext').addEventListener('click', () => tourNext());
  $('tourMenu').addEventListener('click', () => toMenu());
  // the pause menu first: from there "back to menu" leaves the race
  $('menuBtn').addEventListener('click', () => (game.state === 'race' || game.state === 'countdown' || game.state === 'tour' || game.state === 'paused') ? setPaused(true) : toMenu());
  $('resumeBtn').addEventListener('click', () => setPaused(false));
  $('restartBtn').addEventListener('click', () => startRace(true)); // exploring: back at the city's own spot
  $('pauseTitleBtn').addEventListener('click', () => toMenu());
  $('pauseCloseBtn').addEventListener('click', () => setPaused(false));
  // come from a page on the site (a landmark's "See it in 3D", ?from=<its id>, or any other link to the
  // game there): the pause menu gets a button back to that page, and the website links go there too.
  // The tab remembers it, so it is still there after a reload or a trip through a door and back.
  const back = siteBack();
  if (back) {
    document.querySelectorAll('[data-site-link], #pauseSiteBtn').forEach(a => { a.href = back; });
    $('pauseSiteRow').classList.remove('hidden');
  }
  $('pauseSettingsBtn').addEventListener('click', () => {
    const open = $('pauseSettings').classList.toggle('hidden') === false;
    $('pauseSettingsBtn').setAttribute('aria-expanded', open);
    $('pauseSettingsBtn').querySelector('.caret').textContent = open ? '▴' : '▾';
  });
  bindSoundButton($('pauseSoundBtn'));
  $('musicSettingsBack').addEventListener('click', () => $('musicSettings').close());
  $('soundEffectsSetting').addEventListener('change', e => { sfx.unlock(); sfx.setSfx(e.target.checked); audioSettingsChanged(); });
  $('backgroundMusicSetting').addEventListener('change', e => {
    sfx.unlock();
    game.gameMusic = e.target.checked;
    if (game.gameMusic) sfx.setMusic(true);
    if (game.state !== 'menu' && game.state !== 'tour' && !(game.state === 'paused' && game.resumeState === 'tour')) syncGameplayMusic();
    audioSettingsChanged();
  });
  // car+paintball mode everywhere: switched on and off on the main menu, where it shows once the hidden
  // settings opened it up (otherwise the paint gun is only in its own mission, the paint fight)
  const setPaintball = on => {
    game.paintball = on;
    sfx.ui(); saveSettings(); syncJumpButton(); renderMenu();
    if (on) $('gunInfo').showModal(); // what it does: the gun, borrowing cars, and where
  };
  $('gunInfoOk').addEventListener('click', () => { sfx.ui(); $('gunInfo').close(); });
  $('paintballSetting').addEventListener('change', e => { game.paintballUnlocked = e.target.checked; sfx.ui(); saveSettings(); syncJumpButton(); renderMenu(); });
  $('gunModeSetting').addEventListener('change', e => setPaintball(e.target.checked));
  $('pauseMountPrev').addEventListener('click', () => switchMount(-1));
  $('pauseMountNext').addEventListener('click', () => switchMount(1));
  $('pauseCardsBtn').addEventListener('click', () => { game.cards = !game.cards; sfx.ui(); saveSettings(); renderMenu(); });
  // the big map, as the minimap opens it: out of the pause menu and straight onto the map
  $('pauseMapBtn').addEventListener('click', () => {
    if (game.state !== 'paused') return;
    setPaused(false);
    openBigMap();
  });
  $('pauseShareBtn').addEventListener('click', shareSpot);
  $('againBtn').addEventListener('click', () => { if (game.time - game.resultsAt > 0.8) startRace(); });
  $('resultsTitleBtn').addEventListener('click', () => toMenu());
  // Never leave a clicked button focused, or Space/Enter would press it again mid-race.
  document.querySelectorAll('button').forEach(b => b.addEventListener('click', () => b.blur()));
}

const pickOf = p => STABLE.find(h => h.id === game.picks[p]);

export function pickAnimal(p, id) {
  const other = game.picks.findIndex((q, i) => i !== p && i < game.players && q === id);
  if (other >= 0) game.picks[other] = game.picks[p]; // taking someone's animal swaps the two
  game.picks[p] = id;
  assignField();
  if (game.state === 'menu') resetRace();
  sfx.ui();
  saveSettings();
  renderMenu();
}

export function cycleAnimal(p, d) {
  const taken = new Set(game.picks.filter((q, i) => i !== p && i < game.players));
  let i = STABLE.indexOf(pickOf(p));
  do i = (i + d + STABLE.length) % STABLE.length; while (taken.has(STABLE[i].id));
  pickAnimal(p, STABLE[i].id);
}

function renamePlayer(p, text) {
  const name = text.replace(/[^\p{L}\p{N} '\-]/gu, '').trim().slice(0, 12);
  game.playerNames[p] = name === t_('player', { n: p + 1 }) ? '' : name;
  field.forEach(r => r.refreshName());
  refreshWho();
  saveSettings();
}

// The keys under a player's card: steering, jumping, and items when there are any.
function keyLine(p) {
  const k = ctl(p).label;
  const item = game.weapons && !roaming() ? ` · <kbd>${k.fire}</kbd> ${t_('key.item')}` : '';
  const pad = game.players > 1 ? ` · <span class="pad">🎮${p + 1}</span>` : '';
  return `<kbd>${k.ride}</kbd> · <kbd>${k.jump}</kbd> ${t_('key.jump')}${item}${pad}`;
}

export function renderMenu() {
  const rows = menuRows(), nav = navRows();
  menuRow = clamp(menuRow, 0, nav.length - 1);
  document.querySelectorAll('#menu [data-row]').forEach(el => {
    el.classList.toggle('focus', el.dataset.row === nav[menuRow]);
    el.classList.toggle('hidden', !rows.includes(el.dataset.row));
  });
  document.querySelectorAll('#modeOpts button').forEach(b => {
    const n = Number(b.dataset.v);
    b.textContent = n === 1 ? t_('players1') : t_('playersN', { n });
    b.classList.toggle('on', n === game.mode);
  });
  document.querySelectorAll('#weaponOpts button').forEach(b => b.classList.toggle('on', (b.dataset.w === '1') === game.weapons));
  document.querySelectorAll('#kindOpts button').forEach(b => b.classList.toggle('on', b.dataset.k === game.kind));
  document.body.classList.toggle('noweapons', !game.weapons || roaming());
  document.querySelectorAll('.tcard[data-i]').forEach((c, i) => {
    const cfg = TRACKS[i];
    c.classList.toggle('on', i === game.trackIdx);
    c.querySelector('b').textContent = local(cfg.name);
    c.querySelector('small').textContent = `${t_('level.' + cfg.level)} · ${Math.round(trackShapes[i].length)} m`;
  });
  $('trackLabel').textContent = t_('row.track');
  document.querySelectorAll('.qcard[data-i]').forEach((c, i) => {
    const q = QUESTS[i - 1];
    c.classList.toggle('on', i === game.mission);
    c.classList.toggle('won', !!q && game.questsWon.includes(q.id));
    c.querySelector('b').textContent = q ? qt(q, 'title') : t_('mission.free');
    c.querySelector('small').textContent = q ? (q.time ? '⏱ ' + fmtTime(q.time).replace(/\.\d+$/, '') : '') : t_('mission.freeTime');
  });
  document.querySelectorAll('#tourCards .qcard').forEach(c => {
    c.classList.toggle('on', c.dataset.m === game.tourMode);
    c.querySelector('b').textContent = t_('tour.' + c.dataset.m);
    c.querySelector('small').textContent = t_('tour.' + c.dataset.m + 'Sub');
  });
  document.body.classList.toggle('pro', game.style === 'pro');
  document.querySelectorAll('#styleList button').forEach(b => b.classList.toggle('on', b.dataset.style === game.style));
  $('styleBtn').textContent = t_('style.' + game.style) + ' ▾';
  $('langBtn').textContent = LANGS[getLang()] + ' ▾';
  document.querySelectorAll('#langList button').forEach(b => b.classList.toggle('on', b.dataset.lang === getLang()));
  $('skySelect').querySelectorAll('option').forEach(o => {
    const [tm, wx] = o.value.split(':');
    o.textContent = (o.value === 'auto' ? t_('sky.auto') : `${t_('time.' + tm)} · ${t_('wx.' + wx)}`).replace(/\p{Extended_Pictographic}\uFE0F?\s*/gu, '');
  });
  $('skySelect').value = game.sky;
  document.querySelectorAll('.pcol[data-p]').forEach(col => {
    const p = Number(col.dataset.p), input = col.querySelector('input');
    col.classList.toggle('hidden', p >= game.players);
    // one player needs no name; two can each type theirs into their card's header
    col.querySelector('.phead span').textContent = game.players > 1 ? '✏️' : t_('solo');
    input.classList.toggle('hidden', game.players === 1);
    if (document.activeElement !== input) input.value = playerName(p);
    input.placeholder = t_('player', { n: p + 1 });
    input.title = t_('rename');
    const h = pickOf(p), mount = game.mounts[p];
    col.querySelector('img').src = thumbOf(h, mount);
    col.querySelector('img').title = t_('mount.' + mount);
    col.querySelector('.pmount b').textContent = t_('mount.' + mount);
    col.querySelector('.pcolor .dot').style.background = hex(h.silk);
    col.querySelector('.pcolor i').textContent = t_('color');
    col.querySelector('.pkeys').innerHTML = keyLine(p);
  });
  $('pauseMountName').textContent = t_('mount.' + game.mounts[0]);
  $('playerCols').dataset.n = game.players;
  $('lapCount').textContent = game.laps === 1 ? t_('laps1') : t_('lapsN', { n: game.laps });
  const soundOn = soundEnabled();
  for (const id of ['soundBtn', 'pauseSoundBtn']) {
    $(id).title = t_('audio.hold');
    $(id).setAttribute('aria-haspopup', 'dialog');
  }
  $('soundEffectsSetting').checked = sfx.sfxOn;
  $('backgroundMusicSetting').checked = game.gameMusic && sfx.musicOn;
  $('paintballSetting').checked = game.paintballUnlocked;
  // car+paintball mode everywhere: only there once the hidden settings opened it up, see menuRows
  $('gunModeSetting').checked = game.paintball && paintballUnlocked();
  $('gunMode').title = t_('menu.gunMode');
  $('gunModeSetting').setAttribute('aria-label', t_('menu.gunMode'));
  $('soundBtn').textContent = t_(soundOn ? 'sound.on' : 'sound.off');
  $('soundBtn').classList.toggle('on', soundOn);
  // the pause menu: plain line icons, no emoji
  const plain = k => t_(k).replace(/^[^\p{L}]+/u, '');
  const icon = d => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  $('pauseSoundBtn').innerHTML = icon(soundOn
    ? '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'
    : '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="m16 9 5 6M21 9l-5 6"/>') + `<span>${plain(soundOn ? 'sound.on' : 'sound.off')}</span>`;
  $('pauseSoundBtn').classList.toggle('on', soundOn);
  $('pauseCardsBtn').innerHTML = icon('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>' + (game.cards ? '' : '<path d="M4 20 20 4"/>')) + `<span>${plain(game.cards ? 'cards.on' : 'cards.off')}</span>`;
  $('pauseCardsBtn').classList.toggle('on', game.cards);
  for (const el of document.querySelectorAll('#pause [data-i18n]')) el.textContent = plain(el.dataset.i18n);
  $('startBtn').textContent = t_('start.btn');
}

function openLangList(open) {
  $('langList').classList.toggle('hidden', !open);
  $('langBtn').setAttribute('aria-expanded', String(open));
}

function openStyleList(open) {
  $('styleList').classList.toggle('hidden', !open);
  $('styleBtn').setAttribute('aria-expanded', String(open));
}

export function setLanguage(code) {
  setLang(code);
  game.lang = getLang();
  applyStatic();
  for (const w of worlds) w?.track.setBanner(t_('banner'), t_('bannerStart'));
  field.forEach(r => r.def && r.refreshName());
  refreshWho();
  refreshHints();
  saveSettings();
  renderMenu();
  showAudioBadge();
}

export function setSky(combo, fade = true) {
  [game.daytime, game.weather] = combo.split(':');
  if (fade) fadeSky();
  else applySky();
}

// A different sky than the one showing, at random.
function rollSky(every, fade = true) {
  const others = COMBOS.filter(c => c !== `${game.daytime}:${game.weather}`);
  if (!others.length) return;
  setSky(others[Math.floor(Math.random() * others.length)], fade);
  game.skyTimer = every;
}

// The pause menu's dropdown: auto, or one sky that stays.
function pickSky(v) {
  game.sky = v;
  if (v === 'auto') rideSky(0);
  else setSky(v);
  sfx.ui();
  saveSettings();
  renderMenu();
}

// A ride starts dry and sunny on auto, or on the fixed sky; the title screen just keeps changing.
// Either way the first sky is there straight away, the later ones fade in.
export function startSky() {
  if (game.state === 'menu') return rollSky(MENU_SKY_EVERY, false);
  if (game.state === 'tour' && flying()) return setSky(tourSky('day:clear'), false); // flown yourself: a clear day, to see the hoops from afar
  if (game.state === 'tour') return setSky(tourSky(tour.sky ?? 'day:clear'), false); // the tour's own sky where it starts, or a clear day (updateTour fades over to the next)
  if (game.sky === 'auto') return rideSky(0, false);
  setSky(game.sky, false);
}

// One step of the auto round while riding. Rain or snow is picked as the day turns wet, and the
// night keeps it.
function rideSky(step, fade = true) {
  game.skyStep = step;
  const wx = step === 0 || !WET.length ? 'clear'
    : step === 1 ? WET[Math.floor(Math.random() * WET.length)]
    : game.weather;
  setSky(`${step === 2 && DAYS.includes('night') ? 'night' : 'day'}:${wx}`, fade);
  game.skyTimer = RIDE_SKY_EVERY;
}

export function tickSky(dt) {
  if ((game.state !== 'menu' && game.sky !== 'auto') || touringNow()) return;
  if ((game.skyTimer -= dt) > 0) return;
  if (game.state === 'menu') rollSky(MENU_SKY_EVERY);
  else rideSky((game.skyStep + 1) % 3);
}

function setWeapons(on) {
  game.weapons = on;
  if (game.state === 'menu') resetRace();
  sfx.ui();
  saveSettings();
  renderMenu();
}

export function setMode(m) {
  game.mode = clamp(m, 1, touch.on ? 1 : MAX_PLAYERS);
  applyMode();
  assignField();
  if (game.state === 'menu') resetRace();
  sfx.ui();
  saveSettings();
  renderMenu();
}

export function applyMode() {
  game.players = game.mode;
  racers.forEach((r, i) => { r.human = i < game.players ? i : -1; });
  setHumans(racers.slice(0, game.players));
  setField(roaming() ? humans : racers);
  document.body.classList.toggle('solo', game.players === 1);
  document.body.classList.toggle('roaming', roaming());
  document.body.classList.toggle('questing', questing());
  document.body.classList.toggle('fries', questing() && !!QUESTS[game.mission - 1]?.fries);
  const tequila = questing() && !!QUESTS[game.mission - 1]?.tequila;
  document.body.classList.toggle('tequila', tequila);
  document.body.classList.toggle('heli', heliMode());
  syncJumpButton();
  $('tJump').classList.remove('charging');
  document.body.classList.toggle('touring', touring());
  refreshHints();
}

export function setKind(kind) {
  game.kind = kind;
  if (roaming()) missionPlayer();
  applyMode();
  setTrack(game.trackIdx);
  assignField();
  resetRace();
  menuLook.set(racers[0].pos.x, 1.5, racers[0].pos.z);
  sfx.ui();
  saveSettings();
  renderMenu();
}

// What a player rides: any animal, or on foot, or on a bike. They are all equally fast.
// A phone's narrow picker only offers the three the missions use. Riding about freely, the
// helicopter comes after them once its rescue quest has been won.
const PHONE_MOUNTS = ['foot', 'bike', ...(ITALIAN ? ['vespa'] : []), 'horse'];
const withHeli = list => (exploring() && game.questsWon.includes('heli') ? [...list, 'heli'] : list);
function syncHeli() {
  document.body.classList.toggle('heli', heliMode());
  syncJumpButton();
  refreshHints();
}
function cycleMount(p, d, base = MOUNTS) {
  const list = withHeli(base);
  const i = list.indexOf(game.mounts[p]);
  game.mounts[p] = list[i < 0 ? 0 : (i + d + list.length) % list.length];
  const colors = MOUNT_COLORS[game.mounts[p]]; // unless the other player already has them
  if (colors && !game.picks.some((q, i) => i !== p && i < game.players && q === colors)) game.picks[p] = colors;
  assignField();
  resetRace();
  syncHeli();
  sfx.ui();
  saveSettings();
  renderMenu();
}

// From the pause menu while riding about (exploring or on a quest): ride something else from where you are (they are all equally fast).
// Only the model is swapped, so the quest, the position and the character carry on as they were.
function switchMount(d) {
  if (!roaming() || touringNow() || game.state !== 'paused') return;
  if (questing() && QUESTS[game.mission - 1]?.heli) return; // the rescue is flown
  const list = withHeli(MOUNTS), i = list.indexOf(game.mounts[0]);
  game.mounts[0] = list[(i + d + list.length) % list.length];
  const r = humans[0];
  scene.remove(r.model.root);
  r.setHorse(r.def, game.mounts[0]);
  r.heli = exploring() && game.mounts[0] === 'heli';
  if (!r.heli && r.heliModel) { scene.remove(r.heliModel, r.heliShadow); r.heliModel = r.heliShadow = null; r.vy = 0; } // out of it, wherever it was
  syncHeli();
  $('pauseMountName').textContent = t_('mount.' + game.mounts[0]);
  sfx.ui();
  saveSettings();
}

// Each mission has player 1 start out as someone: free exploring on a red horse, the quests as their
// city's quests.js says. Picking a mission puts that back, whatever was chosen for the one before.
const FREE_PLAYER = { mount: 'horse', pick: 'hagelslag' };
export function missionPlayer() {
  const { mount, pick } = QUESTS[game.mission - 1]?.player ?? FREE_PLAYER;
  game.mounts[0] = mount;
  const other = game.picks.indexOf(pick, 1);
  if (other > 0) game.picks[other] = game.picks[0]; // player 2 had those colours: the two swap
  game.picks[0] = pick;
}

export function selectMission(i) {
  const n = QUESTS.length + 1;
  game.mission = ((i % n) + n) % n;
  missionPlayer();
  applyMode();
  assignField();
  resetRace();
  menuLook.set(racers[0].pos.x, 1.5, racers[0].pos.z);
  sfx.ui();
  saveSettings();
  renderMenu();
}

export function selectTrack(i) {
  const n = TRACKS.length;
  game.trackIdx = ((i % n) + n) % n;
  setTrack(game.trackIdx);
  resetRace();
  menuLook.set(racers[0].pos.x, 1.5, racers[0].pos.z);
  sfx.ui();
  saveSettings();
  renderMenu();
}

function setLaps(n) {
  game.laps = clamp(n, 1, 9);
  sfx.ui();
  saveSettings();
  renderMenu();
}

// A short tap keeps the simple all-sound switch. A two-second hold opens the mixer.
// The page on the site the game was opened from, for the pause menu's way back: a landmark's page
// (?from=<its id>), a painting's or a statue's (?from=art:<its id>), or the site page the link to the game was on (not another game's, say a door's,
// and not the game in the site's own little window, ?watch). Kept for the tab in sessionStorage, by
// the game's address, so a reload or a door out and back in keeps it. null when there is none.
function siteBack() {
  const key = `ghent3d.siteBack.${location.pathname}`;
  const from = new URLSearchParams(location.search).get('from');
  const art = /^art:([a-z0-9-]+)$/.exec(from ?? '')?.[1];
  let page = art ? new URL(`../../art/${art}/`, location.href).pathname
    : /^[a-z0-9-]+$/.test(from ?? '') ? new URL(`../landmark/${from}/`, location.href).pathname : null;
  if (!page && document.referrer && window === top) {
    const ref = new URL(document.referrer);
    if (ref.origin === location.origin && !/\/play\/|\.html$/.test(ref.pathname)) page = ref.pathname + ref.hash;
  }
  try {
    if (page) sessionStorage.setItem(key, page);
    else page = sessionStorage.getItem(key);
  } catch { /* no storage: only this visit's link */ }
  return page;
}

function bindSoundButton(button) {
  let timer = null, held = false, origin = null;
  const cancel = () => { clearTimeout(timer); timer = null; };
  button.addEventListener('pointerdown', e => {
    if (!e.isPrimary || e.button !== 0) return;
    cancel();
    held = false;
    origin = { x: e.clientX, y: e.clientY };
    timer = setTimeout(() => {
      timer = null;
      held = true;
      $('musicSettings').showModal();
    }, 2000);
  });
  button.addEventListener('pointermove', e => {
    if (origin && Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > 12) cancel();
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) button.addEventListener(type, cancel);
  addEventListener('blur', cancel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  button.addEventListener('contextmenu', e => e.preventDefault());
  button.addEventListener('click', e => {
    if (held) { held = false; e.preventDefault(); return; }
    toggleSound();
  });
}

function audioSettingsChanged() {
  sfx.ui();
  saveSettings();
  renderMenu();
  showAudioBadge();
}

function soundEnabled() {
  const tourActive = game.state === 'tour' || (game.state === 'paused' && game.resumeState === 'tour');
  return sfx.sfxOn || (sfx.musicOn && (game.state === 'menu' || (tourActive ? game.tourMusic : game.gameMusic)));
}

export function syncGameplayMusic() {
  if (demo) return; // the demo's music goes on
  if (game.gameMusic) music.play('race');
  else music.stop();
}

export function toggleSound() {
  sfx.unlock();
  const on = !soundEnabled();
  sfx.setMusic(on);
  sfx.setSfx(on);
  sfx.ui();
  saveSettings();
  renderMenu();
  showAudioBadge();
}

export function showAudioBadge() {
  $('mute').textContent = t_('mute');
  $('mute').classList.toggle('hidden', soundEnabled() || game.state === 'menu');
}

// a click beside the pause card carries on (and must not reach the click-to-pause in input.js)
pauseEl.addEventListener('pointerdown', e => {
  if (e.target.closest('.card, a')) return;
  e.stopPropagation();
  setPaused(false);
});

// for the other modules, which may read these but not assign them
export function setMenuRow(v) { menuRow = v; }
