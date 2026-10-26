// The game's state (game) and the settings kept in this browser, and ?watch, the tour on its own.

import { TRACKS } from '../tracks.js';
import { STABLE, MOUNTS } from '../horses.js';
import { LANGS } from '../i18n.js';
import { QUESTS, THEME, TOUR, NAME } from '../city.js';
import { sfx } from '../sound.js';
import { SKIES, MAX_PLAYERS, clamp } from './base.js';

const SETTINGS_KEY = 'ghent3d.settings.v1';
const saved = (() => {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; }
})();

// A link can open the menu on one kind, ?menu=tour (the site's "Virtual tour" buttons).
const linkKind = new URLSearchParams(location.search).get('menu');
const startKind = ['mission', 'race', 'tour'].includes(linkKind) ? linkKind : saved.kind;
// A site page in French or Dutch links with ?lang=fr, ?lang=nl: the game starts in that language.
const URL_LANG = new URLSearchParams(location.search).get('lang');

export const game = {
  state: 'menu', // menu | briefing (a quest, before you start) | countdown | race | paused | results | tour (flying the tour)
  resumeState: 'race',
  mode: clamp(Math.floor(saved.mode ?? 1), 1, MAX_PLAYERS), // number of human players chosen for races
  players: 1, // humans riding right now
  kind: startKind === 'race' && THEME.races !== false ? 'race' : startKind === 'tour' && TOUR ? 'tour' : 'mission', // mission: ride about the map, no race, no computer riders; tour: fly through the city
  tourMode: saved.tourMode === 'fly' && TOUR?.ride ? 'fly' : 'auto', // the tour plays on its own, or you fly it yourself, on the dragon through the hoops
  tourSpeed: [1, 1.5, 0.5].includes(saved.tourSpeed) ? saved.tourSpeed : 1, // how fast it plays (the round button by the menu)
  gameMusic: saved.gameMusic ?? false, // opt in through the hidden music settings
  paintball: saved.paintball ?? false, // car+paintball mode: a paintball gun (instead of tequila shots), and cars to borrow
  questsWon: Array.isArray(saved.questsWon) ? saved.questsWon : [], // the ids of the quests won at least once
  paintballUnlocked: saved.paintballUnlocked ?? false, // opened up early through the hidden settings
  tourMusic: saved.tourMusic ?? true, // the tour's own music plays along it (the round button by the speed's)
  // which mission: 0 is exploring freely, after it the quests (QUESTS[mission - 1])
  mission: clamp(Math.floor(saved.mission ?? (saved.kind === 'quest' ? (saved.quest ?? 0) + 1 : 0)), 0, QUESTS.length),
  mounts: [0, 1].map(p => (MOUNTS.includes(saved.mounts?.[p]) || (saved.mounts?.[p] === 'heli' && saved.questsWon?.includes('heli')) ? saved.mounts[p] : 'bike')), // what each player rides, or on foot (or flies)
  lang: [URL_LANG, saved.lang].find(l => Object.hasOwn(LANGS, l)) ?? 'en', // ?lang= (a site page in that language links so), else the one picked before
  style: saved.style === 'pro' ? 'pro' : 'fun', // the look of the menus: playful, or professional (white and navy, a serif)
  trackIdx: clamp(Math.floor(saved.track ?? 0), 0, TRACKS.length - 1),
  laps: clamp(Math.floor(saved.laps ?? 3), 1, 9),
  weapons: saved.weapons ?? true, // false = a pure race: no items on the track
  cards: saved.cards ?? true, // the cards about the sights you ride up to while exploring (the pause menu's)
  sky: SKIES.includes(saved.sky) ? saved.sky : 'auto', // the pause menu's pick: auto, or one fixed 'time:weather'
  daytime: 'day', // day | night, what the sky shows right now
  weather: 'clear', // clear | rain | snow
  skyTimer: 0, // seconds until the sky changes by itself
  skyStep: 0, // where the ride is in the auto round: 0 dry day, 1 wet day, 2 wet night
  picks: ['hagelslag', 'stroopwafel'].map((d, p) => (STABLE.some(h => h.id === saved.picks?.[p]) ? saved.picks[p] : d)), // the character each player seat has chosen
  playerNames: [0, 1].map(p => (typeof saved.playerNames?.[p] === 'string' ? saved.playerNames[p] : '')), // '' = "Player 1"/"Player 2" in the current language
  time: 0,
  cd: 0,
  cdShown: '',
  raceTime: 0,
  finishCount: 0,
  endTimer: 0,
  resultsAt: 0,
};


// ?watch: the tour plays by itself, without the menu, the buttons or the cards, and nothing is
// saved. For the site's pages, which show it behind their own words (an iframe; core/game.html marks
// the page early, core/style.css hides the rest); a page can pause it while it is out of sight.
// ?watch=cards: the whole tour with its cards, as from the menu, starting straight away (the
// site's "watch the tour" link).
export const WATCH = new URLSearchParams(location.search).get('watch');
export let watchPaused = false;

export function saveSettings() {
  if (WATCH != null) return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      mode: game.mode, track: game.trackIdx, laps: game.laps, sound: sfx.sfxOn || sfx.musicOn, music: sfx.musicOn, sfx: sfx.sfxOn, gameMusic: game.gameMusic, paintball: game.paintball, questsWon: game.questsWon, paintballUnlocked: game.paintballUnlocked,
      picks: game.picks, playerNames: game.playerNames, weapons: game.weapons, cards: game.cards, lang: game.lang, style: game.style,
      kind: game.kind, mounts: game.mounts, mission: game.mission, sky: game.sky, tourMode: game.tourMode, tourSpeed: game.tourSpeed, tourMusic: game.tourMusic,
    }));
  } catch { /* private mode: settings just won't stick */ }
}

// Exploring freely starts again about where you last were in this city (kept in this browser every
// couple of seconds you ride about), or at the city's own spot the first time, and on Restart.
export const SPOT_KEY = `ghent3d.spot.${NAME.en}`;
export function lastSpot() {
  try {
    const s = JSON.parse(localStorage.getItem(SPOT_KEY));
    return [s?.x, s?.z, s?.yaw].every(Number.isFinite) ? s : null;
  } catch { return null; }
}

// for the other modules, which may read these but not assign them
export function setWatchPaused(v) { watchPaused = v; }
