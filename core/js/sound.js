// The game's sound, started before the rest of the game loads, so the menu music already plays
// on the loading screen. index.html loads this ahead of main.js, which imports the same instances.
import { Sfx } from './audio.js';
import { Music } from './music.js';

const saved = (() => {
  try { return JSON.parse(localStorage.getItem('ghent3d.settings.v1')) || {}; } catch { return {}; }
})();

export const sfx = new Sfx();
// Separate preferences take precedence; migrate the previous single sound switch.
sfx.musicOn = saved.music ?? saved.sound ?? true;
sfx.sfxOn = saved.sfx ?? saved.sound ?? true;
export const music = new Music(sfx);
sfx.onUnlock = () => music.restart();

// Building the city keeps the page busy for seconds at a time: schedule the music further ahead
// meanwhile, so it plays on through. main.js turns this back down once the game is up.
music.ahead = 2;
music.play('menu');

// Browsers only allow sound after a click, tap or key; try now (it works when they allow it),
// and otherwise on the first one, also while loading.
sfx.unlock();
for (const type of ['pointerdown', 'keydown', 'click']) addEventListener(type, () => sfx.unlock(), { capture: true });
addEventListener('touchend', () => sfx.unlock(), { passive: true, capture: true });
