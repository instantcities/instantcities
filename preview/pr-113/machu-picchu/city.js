// Machu Picchu: a playable site with its own map, monuments, race, tour and quest.
export { MAP } from './map.js';
import { MONUMENTS as MODELS } from './monuments.js';
import { dressMonuments } from '../core/js/site-style.js';
export const MONUMENTS = dressMonuments(MODELS, 'machu-picchu');
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';
import { game } from './frame.js';
export const ID = 'machu-picchu';
export const NAME = { en: 'Machu Picchu', nl: 'Machu Picchu', fr: 'Machu Picchu', es: 'Machu Picchu' };
export const WORDS = { en: { title: 'Instant Machu Picchu', tag: "Explore the Inca stone town and its terraces in the Andes.", 'tour.welcomeSub': "Roofless stone houses and temples sit between grassy terraces, with the steep profile of Huayna Picchu behind them." } };
export { THEME } from './appearance.js';
export const LOOK = { walls: [['#c0b397', false]], bigWalls: ['#c0b397'], roofs: [0x9c8c72], doors: ['#4c4134'], shutters: ['#675b48'], stone: '#bfb49e', flatRoof: 0xb7a68a, spires: false, houseBlocks: true, grass: '#82915a' };
export const STREET_FURNITURE = false, PARKED_BIKES = false, PARKED_CARS = [];
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {}, FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], BEACHES = [], RUNS = [];
export const PLACES = [{"name": "Sacred Plaza", "xy": [-35, -65], "side": "r"}, {"name": "Agricultural terraces", "xy": [110, 170], "side": "r"}, {"name": "Residential quarter", "xy": [25, 5], "side": "r"}, {"name": "Huayna Picchu", "xy": [15, -410], "side": "r"}].map(({ xy, ...p }) => { const [x,z] = game(...xy); return { ...p, x, z }; });

// Visitors favour the main approach and the viewing paths.
export const BUSY = {
  "walkers": 90,
  "cyclists": 0,
  "streets": [
    {
      "street": "Citadel walk 1",
      "weight": 4,
      "free": true
    },
    {
      "street": "Citadel walk 2",
      "weight": 2,
      "free": true
    },
    {
      "street": "Citadel walk 3",
      "weight": 2,
      "free": true
    },
    {
      "street": "Citadel walk 4",
      "weight": 2,
      "free": true
    },
    {
      "street": "Citadel walk 5",
      "weight": 2,
      "free": true
    }
  ]
};

// Keep the ceremonial and residential ridge clear of generic park trees.
export const AREAS = [{k: "green", p: [[-85,-185],[85,-185],[95,155],[-85,155]].flatMap(p=>game(...p))}];
export { TERRAIN } from "./terrain.js";
