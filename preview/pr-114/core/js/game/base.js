// The game's tuning and small helpers, shared by every part of it (js/main.js and the rest of js/game/):
// the skies to pick from, how fast things go, the keys each player has, and the like.

import * as THREE from 'three';
import { t, local } from '../i18n.js';
import { THEME } from '../city.js';
import { TIMES, WEATHERS } from '../weather.js';

export const t_ = t; // plain t is often a track or a time in the game's code; t_ always means translate
// a quest's own words (its `text` in the city's quests.js), in the language picked
export const qt = (q, key) => local(q.text)[key] ?? q.text.en[key] ?? '';

// Every day/night and weather pair, as 'time:weather', and 'auto' for the sky that changes by itself.
// A city may leave some weather out (THEME.weathers: Lecce never sees snow), or some time of day
// (THEME.times: inside a church it is always day).
export const DAYS = THEME.times ?? TIMES;
export const COMBOS = DAYS.flatMap(tm => (THEME.weathers ?? WEATHERS).map(wx => `${tm}:${wx}`));
export const SKIES = ['auto', ...COMBOS];
export const MENU_SKY_EVERY = 20, RIDE_SKY_EVERY = 120; // seconds between changes: behind the title, and while riding
// While riding on auto the sky goes round: dry day, then rain or snow by day, then the same by night,
// and back to a dry day. A city without rain or snow just stays dry.
export const WET = (THEME.weathers ?? WEATHERS).filter(wx => wx !== 'clear');
export const SKY_FADE = 8; // seconds one sky takes to fade into the next

// ------------------------------------------------------------------ tuning

export const MAX_SPEED = 30;
export const SWIM_SPEED = 6; // swimming is slower still
export const BOAT_SPEED = 14; // in the water you sail a boat of the Bootjes van Gent, slower than on the street
export const ACCEL = 17;
export const HILL_PULL = 30; // m/s² of speed lost (or gained) per unit of slope, up (or down) a hill
export const HILL_SLOW = 4; // and the top speed lost per unit of slope going up: a 10% climb takes 40% off
export const BRAKE = 34;
export const COAST = 7;
export const REVERSE_MAX = 7;
export const TURN_RATE = 2.3;
export const HORSE_RADIUS = 1.15;
export const JUMP_V = 10;
// the police helicopter (the rescue quest): top speed, how quickly it gets there, climbing and
// sinking speed, how fast it turns, and how high it may go; below LOW it bumps into the buildings
export const HELI_SPEED = 48, HELI_ACCEL = 16, HELI_CLIMB = 11, HELI_TURN = 1.5, HELI_TOP = 180, HELI_LOW = 18, HELI_RADIUS = 4;
// and how it flies, as stepHeli has it (rise, sink: how quickly it gets to its climbing speed and back)
export const HELI = { speed: HELI_SPEED, accel: HELI_ACCEL, climb: HELI_CLIMB, rise: 14, sink: 9, turn: HELI_TURN, top: HELI_TOP, low: HELI_LOW, radius: HELI_RADIUS, floor: 0 };
// the golden dragon of the tour flown yourself (dragonfly.js): as the helicopter, but climbing and
// diving much more sharply, turning a little quicker, slimmer, and never down on the ground
export const DRAGON = { speed: 42, accel: 20, climb: 28, rise: 45, sink: 30, turn: 1.8, top: 180, low: 18, radius: 2.2, floor: 2.5 };
export const GRAVITY = 30;
export const SPIN_TIME = 1.5;
export const REAR_TIME = 0.9;
export const STUMBLE_TIME = 0.6;
export const STEP_UP = 0.7; // a horse steps up this much without jumping (from bonnet to roof); more and it bumps
export const STEP_DOWN = 0.35; // drops bigger than this are a fall, not a step
export const SOAK_TIME = 3.5;
export const SOAK_SLOW = 0.6;
export const MAX_ITEMS = 3;
export const PICKUP_RESPAWN = 4;
export const MAX_TRAPS = 12;

export const SLOTS = 4; // horses per race: the players' picks plus computer riders
export const MAX_PLAYERS = 2; // split screen is two side-by-side halves
export const AI_SKILL = [0.95, 0.95, 0.96, 0.945];
export const GRID_LANES = [-0.24, 0.24, -0.7, 0.7];

export const CONTROLS = [
  {
    up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
    fire: ['KeyE', 'ShiftLeft', 'KeyQ'], jump: ['Space'],
    label: { ride: 'WASD', jump: 'SPACE', fire: 'E', back: 'S' },
  },
  {
    up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
    fire: ['Enter', 'Period'], jump: ['ShiftRight', 'Slash'],
    label: { ride: '↑←↓→', jump: 'R-SHIFT', fire: 'ENTER', back: '↓' },
  },
];
// One player may use either side of the keyboard.
export const SOLO = {
  ...Object.fromEntries(['up', 'down', 'left', 'right', 'fire', 'jump'].map(k => [k, [...CONTROLS[0][k], ...CONTROLS[1][k]]])),
  label: { ride: '↑←↓→', jump: 'SPACE', fire: 'ENTER', back: '↓' },
};
export const PAN = [-0.55, 0.55];
export const GAME_KEYS = new Set(['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Slash', 'Period', 'Quote']);

export const hex = c => '#' + c.toString(16).padStart(6, '0');
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const approach = (v, t, d) => (v < t ? Math.min(t, v + d) : Math.max(t, v - d));
export const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
export const rand = (a, b) => a + Math.random() * (b - a);
export const fmtTime = s => {
  const m = Math.floor(s / 60), sec = s - m * 60;
  return `${m}:${sec.toFixed(2).padStart(5, '0')}`;
};
export const tmp = new THREE.Vector3();
export const $ = id => document.getElementById(id);
