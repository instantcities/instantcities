// Stonehenge: a playable site with its own map, monuments, race, tour and quest.
export { MAP } from './map.js';
import { MONUMENTS as MODELS } from './monuments.js';
import { dressMonuments } from '../core/js/site-style.js';
export const MONUMENTS = dressMonuments(MODELS, 'stonehenge');
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';
import { game } from './frame.js';
export const ID = 'stonehenge';
export const NAME = { en: 'Stonehenge', nl: 'Stonehenge', fr: 'Stonehenge', es: 'Stonehenge' };
export const WORDS = { en: { title: 'Instant Stonehenge', tag: "Walk around the standing stones on Salisbury Plain.", 'tour.welcomeSub': "The surviving sarsen circle, five great trilithons and smaller bluestones, with the Heel Stone beside the approach." } };
export { THEME } from './appearance.js';
export const LOOK = { walls: [['#c0b397', false]], bigWalls: ['#c0b397'], roofs: [0x9c8c72], doors: ['#4c4134'], shutters: ['#675b48'], stone: '#bfb49e', flatRoof: 0xb7a68a, spires: false, houseBlocks: true, grass: '#8b9e62' };
export const STREET_FURNITURE = false, PARKED_BIKES = false, PARKED_CARS = [];
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {}, FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], BEACHES = [], RUNS = [];
export const PLACES = [{"name": "Stone circle", "xy": [0, 0], "side": "r"}, {"name": "Heel Stone", "xy": [40, -70], "side": "r"}, {"name": "The earthwork", "xy": [0, 53], "side": "r"}].map(({ xy, ...p }) => { const [x,z] = game(...xy); return { ...p, x, z }; });

// Visitors favour the main approach and the viewing paths.
export const BUSY = {
  "walkers": 65,
  "cyclists": 0,
  "streets": [
    {
      "street": "Stone circle viewing path",
      "weight": 4,
      "free": true
    },
    {
      "street": "Stone circle walk 1",
      "weight": 2,
      "free": true
    },
    {
      "street": "Stone circle walk 2",
      "weight": 2,
      "free": true
    },
    {
      "street": "Stone circle walk 3",
      "weight": 2,
      "free": true
    },
    {
      "street": "Stone circle walk 4",
      "weight": 2,
      "free": true
    },
    {
      "street": "Stone circle walk 5",
      "weight": 2,
      "free": true
    },
    {
      "street": "Stone circle walk 6",
      "weight": 2,
      "free": true
    }
  ]
};

// The stone setting and its earthwork stand in open grass. Suppress generic park trees here.
export const AREAS = [{k: "green", p: Array.from({length:48},(_,i)=>game(52*Math.cos(i*Math.PI/24),52*Math.sin(i*Math.PI/24))).flat()}];
