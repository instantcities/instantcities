// The game: its parts are the modules in js/game/ (base.js the tuning, settings.js the state, and on up
// from the scene and the city to the menu, the race, the tour, physics, input and the loop); this boots it.

import { setLang } from './i18n.js';
import { LOW_POWER } from './device.js';
import { TOUR, DEMO, INSIDE } from './city.js';
import { sfx, music } from './sound.js';
import { game, WATCH, setWatchPaused } from './game/settings.js';
import { renderer, scene, menuCam, menuLook } from './game/scene.js';
import { quest, demo, world, city, setTrack } from './game/worlds.js';
import { racers, humans, field, thrown, traps, clouds } from './game/racers.js';
import { teleport } from './game/bigmap.js';
import { buildMenu, pickAnimal, cycleAnimal, setLanguage, setSky, setMode, setKind, selectTrack } from './game/menu.js';
import { startRace, toMenu } from './game/race.js';
import { tour, SHOTS, startTour } from './game/touring.js';
import { stealCar, jump } from './game/physics.js';
import { useItem } from './game/pickups.js';
import { render } from './game/cameras.js';
import { step, frame } from './game/loop.js';
import { pads, pollPads, touch, setTouchMode, visitFromLink } from './game/input.js';
import { DEMO_LINK, RECORD, startDemo, demoFrame } from './game/demofilm.js';

// Tick off a step on the loading screen, and give the browser a moment to show it before the
// next busy stretch (the fallback timer covers a hidden tab, where frames never come).
function bootStep(key) {
  window.bootStep?.(key);
  return new Promise(r => { requestAnimationFrame(() => setTimeout(r)); setTimeout(r, 100); });
}

// ------------------------------------------------------------------ boot

setLang(game.lang);
await bootStep('horses');
buildMenu();
await bootStep('city');
setTrack(game.trackIdx);
setLanguage(game.lang);
toMenu();
setTouchMode(LOW_POWER);
visitFromLink();
if (WATCH != null && TOUR) {
  game.tourMode = 'auto';
  game.tourMusic = false;
  game.tourSpeed = 1;
  startTour();
  // the page around it says when it scrolls out of sight, and back
  addEventListener('message', e => {
    if (e.origin === location.origin && e.data?.type === 'instant-cities:watch') setWatchPaused(!e.data.on);
  });
}
// ?shots= (game/touring.js), or ?tour=auto, the tour shared from the pause menu: straight onto the tour, playing on its own
if (TOUR && (SHOTS || new URLSearchParams(location.search).get('tour') === 'auto')) { game.kind = 'tour'; game.tourMode = 'auto'; startTour(); }
if (DEMO_LINK !== null && DEMO) startDemo(!RECORD);
await bootStep('paint');
requestAnimationFrame(frame);
music.ahead = 0.15; // loaded: back to short notice, so the music stops as soon as a game starts
// The menu is filled in and the first frame is drawn: drop the loading screen.
requestAnimationFrame(() => requestAnimationFrame(() => {
  document.body.classList.remove('booting');
  setTimeout(() => document.getElementById('loader').remove(), 500);
  // and to the page around it, watching: it can show the tour now
  if (WATCH != null && parent !== window) parent.postMessage({ type: 'instant-cities:ready' }, location.origin);
}));

// Handy for poking at the game from the dev console.
window.ghent3d = { INSIDE, get city() { return city; }, touch, setTouchMode, setLanguage, pickAnimal, cycleAnimal, pads, pollPads, game, racers, get field() { return field; }, traps, thrown, clouds, get world() { return world; }, get tour() { return tour; }, get quest() { return quest; }, setSky, startRace, toMenu, selectTrack, setMode, setKind, useItem, jump, music, sfx, renderer, scene, step, render, menuCam, menuLook, get demo() { return demo; }, demoFrame };
window.__pr = { teleport, get world() { return world; }, get humans() { return humans; }, game, stealCar }; // DEBUG-RELIEF
