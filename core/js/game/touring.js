// The tour: the flight along the city's sights with its cards (js/tour.js), and the tour flown
// yourself, on the dragon through the hoops (js/dragonfly.js).

import * as THREE from 'three';
import { local, getLang } from '../i18n.js';
import { tourBoat } from '../scenery.js';
import { carGroup } from '../cars.js';
import { createTumble } from '../tumble.js';
import { SIGHTS, TOUR, TOUR_PROPS, NAME } from '../city.js';
import { WATER } from '../relief.js';
import { sfx, music } from '../sound.js';
import { Tour, STANDING } from '../tour.js';
import { hoopsAlong, Course, hoopMeshes } from '../dragonfly.js';
import { t_, COMBOS, DRAGON, SOLO, clamp, wrapAngle, fmtTime, $ } from './base.js';
import { game, WATCH, saveSettings } from './settings.js';
import { renderer, scene, particles, menuCam, menuLook } from './scene.js';
import { tourPage, flying, demo, report, world } from './worlds.js';
import { EYE } from './hud.js';
import { menuEl, pauseEl, resultsEl, briefEl, setSky, startSky } from './menu.js';
import { showRaceChrome } from './race.js';
import { held } from './control.js';
import { stepHeli } from './physics.js';
import { pads, touch } from './input.js';

// The camera flies the city's TOUR (js/tour.js) over the streets; at each stop a card says what is
// there. On its own (auto) each card stays a while; interactively the flight waits for a click.
const tourEl = $('tour'), tourCardEl = $('tourCard');
const TOUR_SPEEDS = [1, 1.5, 0.5]; // the speed button goes round these
const TOUR_END = { end: true }; // the last card: the tour is over
const TOUR_AGAIN = 9; // seconds the last card stays before an auto tour starts over
// The sky the tour asks for (its skies), as this city has it: rain for snow where it never snows.
export const tourSky = sky => {
  const wet = sky.replace('snow', 'rain');
  return COMBOS.includes(sky) ? sky : COMBOS.includes(wet) ? wet : sky.split(':')[0] + ':clear';
};
export let tour = null, tourShown = null, tourEndAt = 0, tourGround = 0, tourBoatMesh = null, tourFleet = [], tourBusMesh = null, tourTumble = null;
let tourFlyer = null, tourRunner = null; // the city's dragon flying along and Artevelde running along (TOUR flyer, runner), made when first needed
// what the city puts out only for the tour (city.js TOUR_PROPS: Ghent's Christmas market, the Stroppendragers), made when it first starts
export let tourProps = [];

// ?shots=<metres>: a quality tour (.claude/skills/quality-tour). One round of the tour on autoplay,
// a picture of the scene every that many metres along its path, sent to the local server (serve.py
// keeps them in tools/cache/tourshots/<city>/) with where the camera stood and looked.
export const SHOTS = Number(new URLSearchParams(location.search).get('shots')) || 0;
let nextShot = 0, shotNo = 0;
export function takeShot() {
  if (!SHOTS || game.state !== 'tour' || !tour || tour.done || tour.s < nextShot) return;
  nextShot = tour.s + SHOTS;
  const dir = new THREE.Vector3();
  menuCam.getWorldDirection(dir);
  const meta = { i: shotNo++, s: Math.round(tour.s), x: +menuCam.position.x.toFixed(1), y: +menuCam.position.y.toFixed(1), z: +menuCam.position.z.toFixed(1),
    dx: +dir.x.toFixed(3), dy: +dir.y.toFixed(3), dz: +dir.z.toFixed(3), name: tour.name()?.name ?? '' };
  // (taken straight after the frame is drawn, before the browser clears it)
  renderer.domElement.toBlob(blob => fetch(`/__tourshot?city=${encodeURIComponent(location.pathname.split('/').filter(Boolean)[0] ?? 'ghent')}&meta=${encodeURIComponent(JSON.stringify(meta))}`, { method: 'POST', body: blob })
    .catch(() => {}), 'image/jpeg', 0.85);
}

// off the tour: its bars and cards, and all it put in the city for itself
export function hideTour() {
  tourEl.classList.add('hidden');
  if (tourBoatMesh) tourBoatMesh.visible = false;
  for (const m of tourFleet) m.visible = false;
  if (tourBusMesh) tourBusMesh.visible = false;
  if (tourTumble) tourTumble.root.visible = false;
  for (const m of [tourFlyer, tourRunner]) if (m) m.root.visible = false;
  if (fly) fly.dragon.root.visible = fly.rings.root.visible = false;
  document.body.classList.remove('dragonfly');
}

export function startTour() {
  sfx.unlock();
  sfx.duck(false); // (started again from the pause menu)
  if (!tour) {
    tour = new Tour(TOUR);
    buildTourBar();
    tourProps = (TOUR_PROPS ?? []).map(p => {
      const m = p.make();
      m.position.set(p.x, Math.max(0, world.relief?.at(p.x, p.z) ?? 0), p.z);
      m.rotation.y = p.turn ?? 0;
      scene.add(m);
      return m;
    });
  }
  tour.reset();
  nextShot = 0; shotNo = 0;
  for (const el of [menuEl, pauseEl, resultsEl, briefEl]) el.classList.add('hidden');
  showRaceChrome(false);
  $('menuBtn').classList.remove('hidden');
  tourEl.classList.remove('hidden');
  tourEl.classList.toggle('auto', game.tourMode === 'auto');
  tourEl.classList.toggle('fly', flying());
  document.body.classList.toggle('dragonfly', flying());
  game.state = 'tour';
  tourEndAt = 0;
  showTourCard(null);
  menuCam.fov = 56;
  showTourSpeed();
  if (!demo) { // (the demo's own music goes on under all its shots)
    music.stop(); // (so it begins again from the start)
    if (game.tourMusic) music.play('tour'); // its own music (js/music.js RECORDINGS)
  }
  $('tourWelcomeTitle').textContent = flying() ? t_('tour.flyWelcome') : t_('tour.welcome', { city: local(NAME) });
  $('tourWelcomeSub').textContent = flying() ? t_(touch.on ? 'tour.flyHintTouch' : 'tour.flyHint') : t_('tour.welcomeSub');
  if (flying()) startFly();
  startSky();
  report('tour_start', { mode: game.tourMode, touch: touch.on });
}

export function updateTour(dt) {
  if (flying()) return updateFly(dt);
  const auto = game.tourMode === 'auto';
  tour.update(dt, auto, game.tourSpeed);
  // a character it glances at (Zakman on the Korenlei): put in place in time, and looked at where they walk
  for (const g of tour.meeting()) world.people?.put(g.who.name, g.who.put, g.who.to);
  for (const g of tour.glances) {
    const p = g.who && world.people?.where(g.who.name);
    if (p) g.look = [p.x, 1.4, p.z];
  }
  const { pos, look, roll } = tour.steer(dt);
  // the path's heights are over the street: over a bridge's deck, then, where it climbs
  tourGround += (Math.max(0, world.relief?.at(pos.x, pos.z) ?? 0) - tourGround) * (1 - Math.exp(-dt * 3));
  menuCam.position.set(pos.x, pos.y + tourGround, pos.z);
  // one of the Bootjes van Gent on the Leie, the camera along behind it
  const boat = tour.boat();
  if (boat && !tourBoatMesh) scene.add(tourBoatMesh = tourBoat());
  if (tourBoatMesh) {
    tourBoatMesh.visible = !!boat;
    if (boat) {
      tourBoatMesh.position.set(boat.x, WATER + Math.sin(game.time * 1.3) * 0.05, boat.z);
      tourBoatMesh.rotation.set(Math.sin(game.time * 0.9) * 0.015, boat.yaw, 0, 'YXZ');
    }
  }
  // a bus beside the camera from the start, on the street (over the bridge's deck)
  const bus = tour.bus();
  if (bus && !tourBusMesh) scene.add(tourBusMesh = carGroup('bus', 0xffffff));
  if (tourBusMesh) {
    tourBusMesh.visible = !!bus;
    if (bus) {
      tourBusMesh.position.set(bus.x, Math.max(0, world.relief?.at(bus.x, bus.z) ?? 0), bus.z);
      tourBusMesh.rotation.y = bus.yaw;
    }
  }
  // the cyclist who rides into the tram rails on the Korenmarkt and comes off
  const fall = tour.fall();
  if (fall && !tourTumble) scene.add((tourTumble = createTumble()).root);
  if (tourTumble) {
    tourTumble.root.visible = !!fall;
    if (fall) {
      tourTumble.root.position.set(fall.x, Math.max(0, world.relief?.at(fall.x, fall.z) ?? 0), fall.z);
      tourTumble.root.rotation.y = fall.yaw;
      tourTumble.pose(dt, fall.fallen, game.time);
    }
  }
  // the one running along until he is up on his statue (Artevelde on the Vrijdagmarkt)
  const run = tour.runner();
  if (run && !run.done && !tourRunner) scene.add((tourRunner = TOUR.runner.make()).root);
  if (tourRunner) {
    tourRunner.root.visible = !!run && !run.done;
    if (tourRunner.root.visible) tourRunner.pose(dt, run, (x, z) => Math.max(0, world.relief?.at(x, z) ?? 0));
  }
  // and more of them on the Leie, moored at the Graslei or sailing
  tour.boats().forEach((b, i) => {
    if (!tourFleet[i]) scene.add(tourFleet[i] = tourBoat());
    const m = tourFleet[i];
    m.visible = !!b;
    if (!b) return;
    m.position.set(b.x, WATER + Math.sin(game.time * 1.3 + i * 2) * 0.05, b.z);
    m.rotation.set(Math.sin(game.time * 0.9 + i) * 0.015, b.yaw, 0, 'YXZ');
  });
  menuCam.lookAt(look.x, look.y, look.z);
  menuCam.rotateZ(roll); // banking into the bends
  // the one flying along, low in the picture, until it flies off to its place and lands there (Ghent's dragon on the Belfort's spire)
  const fly = tour.flyer();
  if (fly && !fly.landed && !tourFlyer) scene.add((tourFlyer = TOUR.flyer.make()).root);
  if (tourFlyer) {
    tourFlyer.root.visible = !!fly && fly.in > 0 && !fly.landed;
    if (tourFlyer.root.visible) {
      // where it lands, and which way it sits there (its turn about y), from the one standing there
      const perch = STANDING.get(TOUR.flyer.stands), home = new THREE.Vector3(...TOUR.flyer.home);
      let rest = 0;
      if (perch?.parent) {
        perch.getWorldPosition(home);
        const x = new THREE.Vector3(1, 0, 0).applyQuaternion(perch.getWorldQuaternion(new THREE.Quaternion()));
        rest = Math.atan2(-x.z, x.x);
      }
      menuCam.updateMatrixWorld();
      tourFlyer.pose(dt, fly, menuCam, home, rest);
    }
  }
  menuCam.fov += (56 + tour.v * 0.4 - menuCam.fov) * (1 - Math.exp(-dt * 3)); // wider the faster it goes
  menuLook.set(pos.x, 1.5, pos.z); // the sun's shadows and the hills: round where the camera is
  // the sky fades over to the one the tour asks for there (ghent/tour.js skies)
  const sky = tour.sky && tourSky(tour.sky);
  if (sky && sky !== `${game.daytime}:${game.weather}`) setSky(sky); // fading over
  $('tourWelcome').classList.toggle('show', tour.welcoming);
  if (tour.done && !tourEndAt) { tourEndAt = game.time; music.stop(); } // the music ends with the tour, no repeat
  // info cards off (the pause menu): playing on its own it flies past the stops without them; when
  // it waits at each for a click, and at the end, the card has the buttons, so it always shows
  const quiet = auto && !game.cards;
  const card = tour.done ? TOUR_END : tour.welcoming || quiet ? null : tour.card(auto);
  if (card !== tourShown) showTourCard(card);
  if (!card) tour.paused = false;
  tourCardEl.classList.toggle('paused', tour.paused);
  const left = tour.done ? 1 - (game.time - tourEndAt) / TOUR_AGAIN : card ? tour.cardLeft(card) : 0;
  $('tourTimer').style.transform = `scaleX(${clamp(left, 0, 1)})`;
  tour.phases.forEach((p, i) => (tourBarFills[i].style.transform = `scaleX(${clamp((tour.s - p.s) / (p.end - p.s), 0, 1)})`));
  const name = tour.name()?.name ?? '';
  if ($('tourName').dataset.name !== name) {
    $('tourName').dataset.name = name;
    $('tourName').textContent = name;
    $('tourName').classList.toggle('show', !!name);
  }
  if (tour.done && auto && game.time - tourEndAt > (WATCH === '' ? 1 : TOUR_AGAIN) && !demo) startTour(); // and round again
}

// The bar at the top: the tour's phases side by side, each as long as it is, with a gap between
// them; a click on one goes back (or on) to its start.
let tourBarFills = [];
function buildTourBar() {
  const bar = $('tourBar');
  bar.innerHTML = tour.phases.map((p, i) => `<button data-i="${i}" style="flex-grow:${p.end - p.s}"><i><b></b></i></button>`).join('');
  tourBarFills = [...bar.querySelectorAll('b')];
  bar.querySelectorAll('button').forEach((b, i) => {
    b.dataset.name = tour.phases[i].name ?? ''; // shown as it is hovered (style.css)
    b.addEventListener('click', () => {
      if (game.state !== 'tour') return;
      tour.seek(tour.phases[i]);
      startSky(); // the sky the tour has there, straight away
      tourEndAt = 0;
      showTourCard(null);
      sfx.ui();
    });
  });
}

// The round button by the menu's: 1×, 1.5× or 0.5× as fast, round and round.
function showTourSpeed() {
  const el = $('tourSpeed'), r = $('menuBtn').getBoundingClientRect();
  el.textContent = `${game.tourSpeed}×`;
  if (r.width) Object.assign(el.style, { left: `${r.right + 8}px`, top: `${r.top + r.height / 2 - el.offsetHeight / 2}px` });
  const m = $('tourMusic'), on = game.tourMusic && sfx.musicOn;
  m.textContent = `${on ? '🎵' : '🔇'} ${t_('tour.music')}`;
  m.classList.toggle('off', !on);
  if (r.width) Object.assign(m.style, { left: `${r.right + 8 + el.offsetWidth + 8}px`, top: el.style.top });
}
addEventListener('resize', () => game.state === 'tour' && showTourSpeed());
// The round button beside it: the music on or off, nothing else.
$('tourMusic').addEventListener('click', () => {
  sfx.unlock();
  game.tourMusic = !(game.tourMusic && sfx.musicOn);
  if (game.tourMusic) {
    if (!sfx.musicOn) sfx.setMusic(true);
    if (!tour.done) music.play('tour'); // (not once the tour is over)
  } else music.stop();
  showTourSpeed();
  saveSettings();
});
$('tourSpeed').addEventListener('click', () => {
  game.tourSpeed = TOUR_SPEEDS[(TOUR_SPEEDS.indexOf(game.tourSpeed) + 1) % TOUR_SPEEDS.length];
  showTourSpeed();
  saveSettings();
  sfx.ui();
});

export function showTourCard(st) {
  tourShown = st;
  tourCardEl.classList.toggle('show', !!st);
  if (!st) return;
  const sight = st.sight && SIGHTS?.find(x => x.id === st.sight);
  const words = st.fly ? { name: t_('tour.flyEnd'), text: t_('tour.flyEndText', { hits: fly.course.hits, total: fly.course.hoops.length, time: fmtTime(fly.endAt).replace(/\.\d+$/, '') }) }
    : st.end ? { name: t_('tour.end'), text: t_('tour.endText') } : local((sight ?? st).text);
  $('tourEmoji').innerHTML = st.end ? '🏁' : EYE; // the eye, as on the sights' cards; the flag at the end
  $('tourLabel').textContent = st.end ? t_('tour.label') : `📍 ${t_('tour.label')} ${tour.stops.indexOf(st) + 1}/${tour.stops.length}`;
  $('tourTitle').textContent = words.name;
  // three short facts where the tour has them, or else the sight's own words
  const facts = !st.end && st.facts && local(st.facts);
  if (facts) {
    const ul = document.createElement('ul');
    for (const f of facts) ul.append(Object.assign(document.createElement('li'), { textContent: f }));
    $('tourText').replaceChildren(ul);
  } else $('tourText').textContent = words.text;
  // the sight's own page on the site, in the game's language; a stop without one keeps its link
  const link = tourPage(st) || (st.link && (st.link[getLang()] ?? st.link.en ?? st.link.nl));
  $('tourMore').classList.toggle('hidden', !link);
  if (link) $('tourMore').href = link;
  $('tourNext').textContent = t_(st.end ? 'tour.again' : 'tour.next');
  $('tourNext').classList.toggle('hidden', game.tourMode === 'auto' && !st.end); // autoplay moves on by itself
  $('tourMenu').classList.toggle('hidden', !st.end);
}

// The card's button (or Space / Enter): on to the next stop (autoplay: away with the card, and on
// if it was waiting for it), or the tour once more at the end.
export function tourNext() {
  if (game.state !== 'tour') return;
  if (flying()) return void (fly.course.done && startTour()); // flown yourself, only its last card has a button: once more
  if (tour.done) return startTour();
  if (game.tourMode === 'auto') {
    if (tourShown) { tour.dismiss(tourShown); sfx.ui(); }
  } else if (tour.go()) sfx.ui();
}

// On autoplay the flight waits while a card is read: the mouse over it, or a tap on it.
tourCardEl.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && game.tourMode === 'auto' && tourShown) tour.paused = true; });
tourCardEl.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && tour) tour.paused = false; });
tourCardEl.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && game.tourMode === 'auto' && tourShown && !e.target.closest('button, a')) tour.paused = true; });

// ------------------------------------------------------------------ the tour, flown yourself

// The tour's Fly card (dragonfly.js): the player flies the city's golden dragon (TOUR.ride) the way
// the helicopter is flown (stepHeli, as the DRAGON), through the hoops hung along the tour's
// path, the camera behind it. Once through (or past) the last hoop, a card says how it went.
const FLY_WELCOME = 6; // seconds the welcome, with the keys, shows at the start
const FLY_END = { end: true, fly: true }; // the last card
let fly = null; // { dragon, rings, course, r: where it flies, as stepHeli has a rider, t, endAt, camYaw, camUp }
const flyGround = (x, z) => Math.max(0, world.relief?.at(x, z) ?? 0);

function startFly() {
  if (!fly) {
    const course = new Course(hoopsAlong(tour, flyGround));
    fly = { dragon: TOUR.ride(), rings: hoopMeshes(course.hoops), course, r: { pos: new THREE.Vector3(), human: 0 } };
    scene.add(fly.dragon.root, fly.rings.root);
  }
  const a = tour.at(0), b = tour.at(12), r = fly.r;
  r.pos.set(a.x, 0, a.z);
  Object.assign(r, { yaw: Math.atan2(b.x - a.x, b.z - a.z), speed: 0, vy: 0, steer: 0, tilt: 0, bank: 0, base: flyGround(a.x, a.z) + DRAGON.floor, y: Math.max(0, a.y - DRAGON.floor), street: '' });
  fly.course.reset();
  fly.t = fly.endAt = 0;
  fly.camYaw = r.yaw;
  fly.camUp = 0;
  fly.dragon.root.visible = fly.rings.root.visible = true;
  $('tourTimer').style.transform = 'scaleX(0)';
  $('tJump').querySelector('small').textContent = t_('tb.up'); // (the jump button climbs)
  showFlyHud();
}

// The keys, a gamepad or the touch stick, as for the helicopter: forward and back, left and right,
// and up (Space, a pad's X or RB, ⤒) and down (E, Shift or Enter, a pad's Y or LB, ⤓).
function flyControl() {
  const pad = pads.input[0];
  let throttle = (held(SOLO.up) ? 1 : 0) - (held(SOLO.down) ? 1 : 0);
  let steer = (held(SOLO.left) ? 1 : 0) - (held(SOLO.right) ? 1 : 0);
  let lift = (held(SOLO.jump) ? 1 : 0) - (held(SOLO.fire) ? 1 : 0);
  if (pad) {
    throttle += pad.throttle;
    steer += pad.steer;
    lift += pad.lift;
  }
  if (touch.on) {
    throttle += touch.throttle;
    steer += touch.steer;
    lift += (touch.climb ? 1 : 0) - (touch.sink ? 1 : 0);
  }
  return { throttle: clamp(throttle, -1, 1), steer: clamp(steer, -1, 1), lift: clamp(lift, -1, 1) };
}

function updateFly(dt) {
  const r = fly.r, c = flyControl(), from = { x: r.pos.x, y: r.base + r.y, z: r.pos.z };
  r.fx = Math.sin(r.yaw); r.fz = Math.cos(r.yaw); // (which way it heads, for bumping into the buildings)
  stepHeli(r, dt, c, DRAGON);
  fly.t += dt;
  const at = { x: r.pos.x, y: r.base + r.y, z: r.pos.z };
  if (!fly.course.done) {
    const pass = fly.course.pass(from, at);
    if (pass?.hit) {
      sfx.pickup('cloud', 0);
      particles.burst(pass.hoop.x, pass.hoop.y, pass.hoop.z, 30, { color: [0xffd23f, 0xffe680, 0xffffff], speed: 8, up: 2, gravity: 4, life: 0.8, size: 0.3, drag: 2 });
    } else if (pass) sfx.bump(0);
    if (fly.course.done) {
      fly.endAt = fly.t;
      sfx.finish(0);
      music.stop();
      showTourCard(FLY_END);
    }
    if (pass) showFlyHud();
  }
  fly.rings.update(fly.course, game.time);
  fly.dragon.pose(dt, { ...at, yaw: r.yaw, vy: r.vy, speed: r.speed, bank: r.bank });
  // behind and a little above it, swinging round after it; climbing it drops below the dragon and
  // tilts up steeply after it, diving it rises over it and looks right down (easing into either)
  fly.camYaw += wrapAngle(r.yaw - fly.camYaw) * (1 - Math.exp(-dt * 3));
  fly.camUp += (clamp(r.vy / DRAGON.climb, -1, 1) - fly.camUp) * (1 - Math.exp(-dt * 2.5));
  const fx = Math.sin(fly.camYaw), fz = Math.cos(fly.camYaw), up = fly.camUp, back = 11 - Math.abs(up) * 2;
  menuCam.position.set(r.pos.x - fx * back, Math.max(at.y + 3.2 - up * 6.5, flyGround(r.pos.x, r.pos.z) + 1.5), r.pos.z - fz * back);
  menuCam.lookAt(r.pos.x + fx * 14, at.y + 1 + up * 17, r.pos.z + fz * 14);
  menuCam.fov += (60 + (Math.max(0, r.speed) / DRAGON.speed) * 12 - menuCam.fov) * (1 - Math.exp(-dt * 3)); // wider the faster it goes
  menuLook.set(r.pos.x, 1.5, r.pos.z); // the sun's shadows and the hills: round where it flies
  $('tourWelcome').classList.toggle('show', fly.t < FLY_WELCOME);
  if (!fly.course.done && fly.t % 0.25 < dt) showFlyHud(); // (the metres to the next hoop, a few times a second)
  const name = r.street ?? '';
  if ($('tourName').dataset.name !== name) {
    $('tourName').dataset.name = name;
    $('tourName').textContent = name;
    $('tourName').classList.toggle('show', !!name);
  }
}

// top right: the hoops flown through out of all of them, and how far it is to the next one
function showFlyHud() {
  const { course, r } = fly, h = course.target;
  const far = h ? Math.round(Math.hypot(h.x - r.pos.x, h.y - r.base - r.y, h.z - r.pos.z)) : 0;
  $('flyHud').textContent = `🟡 ${course.hits} / ${course.hoops.length}` + (h ? ` · ${t_('tour.flyNext', { m: far })}` : '');
}
