// The loop: one step of the game, and one frame of it (the step, the street's sounds, the tram
// bells, and drawing), and where you last rode, kept for next time.

import * as THREE from 'three';
import { TOUR } from '../city.js';
import { sfx } from '../sound.js';
import { Ambient } from '../ambient.js';
import { STANDING } from '../tour.js';
import { updateSplats } from '../splat.js';
import { PAN } from './base.js';
import { game, watchPaused, SPOT_KEY } from './settings.js';
import { particles, weather, cams, menuCam } from './scene.js';
import { roaming, exploring, flying, aerial, quest, demo, world, city, track, tickFade } from './worlds.js';
import { humans, field } from './racers.js';
import { updateHud, updateCountdown } from './hud.js';
import { drawMinimap } from './minimap.js';
import { bigEl, big } from './bigmap.js';
import { tickSky } from './menu.js';
import { questEvents, finalOrder, showResults } from './race.js';
import { tour, tourProps, takeShot, updateTour } from './touring.js';
import { humanControl, aiControl } from './control.js';
import {
  paintShots, updatePaint, paintedCars, carPaint, carTick, stepRacer, bikerHit, pedestrianBump, collideRacers,
} from './physics.js';
import { loud, updatePickups, updateThrown, updateTraps, updateClouds } from './pickups.js';
import { riding, updateTram, updateBus } from './transit.js';
import { updateVisuals, updateObstacles, updateCameras, render } from './cameras.js';
import { pollPads, updateTouchLayer } from './input.js';
import { RECORD, endDemo } from './demofilm.js';

let spotT = 0;
function keepSpot(r, dt) {
  if (demo || (spotT -= dt) > 0) return; // (not where the demo rode)
  spotT = 2;
  if (riding(r) || r.afloat || r.y > 0.3) return; // not on the tram, in the water, on the cars or mid-jump
  try {
    localStorage.setItem(SPOT_KEY, JSON.stringify({ x: +r.pos.x.toFixed(1), z: +r.pos.z.toFixed(1), yaw: +r.yaw.toFixed(2) }));
  } catch { /* private mode: you start at the city's spot */ }
}

// ------------------------------------------------------------------ loop

export function step(dt) {
  if (game.state === 'paused') return;
  game.time += dt;
  const t = game.time;
  if (game.state === 'countdown' && (game.cd += dt) >= 3.5) game.state = 'race';
  if (game.state === 'race') game.raceTime += dt;
  tickSky(dt);

  for (const r of field) {
    if (r.human >= 0 && game.state === 'race' && !r.heli) { updateTram(r, dt); updateBus(r, dt); }
    if (r.human === 0 && game.state === 'race' && exploring()) keepSpot(r, dt);
    if (riding(r)) continue; // the tram takes them along
    let c;
    if (game.state === 'countdown' || game.state === 'briefing') c = { throttle: 0, steer: 0 };
    else if (r.human >= 0 && game.state === 'race' && !r.finished) c = humanControl(r);
    else c = aiControl(r, dt, r.finished || game.state === 'results');
    stepRacer(r, dt, c);
  }
  collideRacers();
  updatePickups(dt, t);
  updateThrown(dt);
  updateTraps(dt, t);
  updateClouds(dt, t);
  updateObstacles(dt);
  if (quest) {
    quest.update(dt, t, humans, game.state === 'race');
    if (game.state === 'race') questEvents();
  }
  const order = finalOrder();
  order.forEach((r, i) => (r.place = i + 1));
  for (const r of field) updateVisuals(r, dt, t);
  particles.update(dt);
  if (city.trams) city.trams.riders = roaming() ? field.filter(r => !riding(r)) : []; // to halt for: whoever is riding about on the rails ahead
  city.update(dt, t);
  city.traffic?.update(dt, aerial() ? [menuCam.position] : cams.slice(0, game.players).map(c => c.position), field.filter(r => !riding(r)).concat(game.state === 'tour' ? tourProps.flatMap(m => m.userData.walkers ?? []) : [])); // not for whoever is on board; on the tour, those walking in the street (the Stroppendragers)
  world.scenery.update(dt, t);
  world.arrows?.update(t);
  world.bikers?.update(dt, t, track, field, bikerHit);
  // the cyclists about the old town, but not in a race's way
  for (const im of Object.values(world.cyclists?.parts ?? {})) im.visible = roaming();
  if (roaming()) world.cyclists?.update(dt, t, field, bikerHit);
  if (paintShots.length || humans.some(h => h.paintCd > 0)) updatePaint(dt);
  updateSplats(dt); // those hit, standing still, falling over (splat.js)
  if (paintedCars.size) carPaint();
  carTick(dt);
  world.people?.update(dt, t, field, pedestrianBump, (r, size) => r.human >= 0 && loud() && sfx.bark(PAN[r.human], size));
  if (game.state === 'tour') updateTour(dt);
  // the dragon on the Belfort and Artevelde on his pedestal: on the tour, only once they have got there themselves
  const touring = tour && (game.state === 'tour' || (game.state === 'paused' && game.resumeState === 'tour'));
  for (const [name, obj] of STANDING) obj.visible = !touring || (flying() ? name !== TOUR.flyer?.stands : tour.home(name)); // (flown yourself: the dragon off the Belfort is the one ridden)
  for (const m of tourProps) {
    m.visible = game.state === 'tour'; // (still there while it is paused)
    if (m.visible && tour) m.userData.update?.(tour, t, (x, z) => Math.max(0, world.relief?.at(x, z) ?? 0)); // (those that walk along with it)
  }
  updateCameras(dt, t, order);

  // on board (everybody playing): the tram's bar is all there is at the top of the screen
  document.body.classList.toggle('aboard', !aerial() && game.state === 'race' && humans.slice(0, game.players).every(riding));
  if (!aerial()) {
    updateHud();
    updateCountdown();
    drawMinimap();
  }
  if (game.state === 'race' && game.endTimer > 0 && (game.endTimer -= dt) <= 0) showResults();
}

// The street's own sounds: cars and bikes going by, and your own bike, heard from each player's camera.
const ambient = new Ambient(sfx);
const ambientSources = [], lookDir = new THREE.Vector3();
function updateAmbient(dt) {
  const on = loud() && game.state !== 'paused';
  const listeners = on ? cams.slice(0, game.players).map((cam, k) => {
    cam.getWorldDirection(lookDir);
    const n = Math.hypot(lookDir.x, lookDir.z) || 1;
    return { x: cam.position.x, z: cam.position.z, dx: lookDir.x / n, dz: lookDir.z / n, pan: game.players > 1 ? PAN[k] : 0 };
  }) : [];
  const src = ambientSources;
  src.length = 0;
  if (on) {
    for (const c of city?.traffic?.cars ?? []) {
      if (!c.on) continue;
      src.push({ key: c, kind: 'car', x: c.pos.x, z: c.pos.z, speed: c.speed });
      if (c.type === 'police') src.push({ key: c, kind: 'siren', x: c.pos.x, z: c.pos.z, speed: c.speed });
    }
    // in the film, the police car player 1 drives has its siren going too
    const cop = demo && humans.find(h => h.human === 0 && h.car?.type === 'police');
    if (cop) src.push({ key: cop, kind: 'siren', x: cop.pos.x, z: cop.pos.z, speed: Math.abs(cop.speed) });
    for (const b of world.bikers?.list ?? []) {
      if (b.state === 'ride') src.push({ key: b, kind: 'bike', x: b.model.root.position.x, z: b.model.root.position.z, speed: b.speed });
    }
    for (const r of field) {
      const kind = { bike: 'bike', vespa: 'scooter' }[r.model.species];
      if (!kind || !r.grounded || riding(r)) continue; // on the tram the bike is out of sight
      src.push({ key: r, kind, x: r.pos.x, z: r.pos.z, speed: Math.abs(r.speed), own: r.human >= 0 && r.human < game.players ? r.human : null });
    }
  }
  ambient.update(dt, on, listeners, src);
}

// A tram with someone standing on its track just ahead rings its bell three times, quickly; once
// per tram until the way is clear again.
const BELL_AHEAD = 14, BELL_SIDE = 1.8;
function updateTramBells() {
  const T = city?.trams;
  if (!T || !loud() || game.state === 'paused') return;
  for (const t of T.fleet.list) {
    if (!t.nose) continue;
    const [hx, hz] = T.net.heading(t.edge, t.head, t.dir);
    const who = field.find(r => {
      if (r.human < 0 || riding(r)) return false;
      const dx = r.pos.x - t.nose[0], dz = r.pos.z - t.nose[2], ahead = dx * hx + dz * hz;
      return ahead > 0 && ahead < BELL_AHEAD && Math.abs(dx * hz - dz * hx) < BELL_SIDE;
    });
    if (!who) { t.belled = false; continue; }
    if (t.belled) continue;
    t.belled = true;
    sfx.tramBell(game.players > 1 ? PAN[who.human] : 0);
  }
}

let last = performance.now();
export function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (watchPaused) return requestAnimationFrame(frame);
  if (RECORD && demo) return requestAnimationFrame(frame); // filmed: demoFrame steps it
  demo?.update(dt);
  if (demo?.done) endDemo();
  pollPads();
  step(dt * (demo?.pace ?? 1)); // (the demo plays some shots a little faster)
  tickFade(dt);
  weather.update(dt);
  updateAmbient(dt);
  updateTramBells();
  updateTouchLayer();
  if (!big || !bigEl.classList.contains('full')) render(); // not behind the big map where it covers the screen
  takeShot();
  requestAnimationFrame(frame);
}
