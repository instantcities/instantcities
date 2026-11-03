// Acropolis: a playable site with its own map, monuments, race, tour and quest.
export { MAP } from './map.js';
import { MONUMENTS as MODELS } from './monuments.js';
import { dressMonuments } from '../core/js/site-style.js';
export const MONUMENTS = dressMonuments(MODELS, 'acropolis');
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';
import { game } from './frame.js';
export const ID = 'acropolis';
export const NAME = { en: 'Acropolis', nl: 'Acropolis', fr: 'Acropolis', es: 'Acropolis' };
export const WORDS = { en: { title: 'Instant Acropolis', tag: "Walk among the temples on the Acropolis of Athens.", 'tour.welcomeSub': "The Parthenon, the Erechtheion and the western gateway stand on the rocky summit above Athens." } };
export { THEME } from './appearance.js';
export const LOOK = { walls: [['#c0b397', false]], bigWalls: ['#c0b397'], roofs: [0x9c8c72], doors: ['#4c4134'], shutters: ['#675b48'], stone: '#bfb49e', flatRoof: 0xb7a68a, spires: false, houseBlocks: true, grass: '#b5ab91' };
export const STREET_FURNITURE = false, PARKED_BIKES = false, PARKED_CARS = [];
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {}, FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], BEACHES = [], RUNS = [];
export const PLACES = [{"name": "Parthenon", "xy": [0, 0], "side": "r"}, {"name": "Erechtheion", "xy": [-20, -60], "side": "r"}, {"name": "Propylaea", "xy": [-140, 0], "side": "r"}, {"name": "Temple of Athena Nike", "xy": [-153, 36], "side": "r"}].map(({ xy, ...p }) => { const [x,z] = game(...xy); return { ...p, x, z }; });

// Visitors favour the main approach and the viewing paths.
export const BUSY = {
  "walkers": 110,
  "cyclists": 0,
  "streets": [
    {
      "street": "Summit walk 1",
      "weight": 4,
      "free": true
    },
    {
      "street": "Summit walk 2",
      "weight": 2,
      "free": true
    },
    {
      "street": "Summit walk 3",
      "weight": 2,
      "free": true
    },
    {
      "street": "Summit walk 4",
      "weight": 2,
      "free": true
    },
    {
      "street": "Summit walk 5",
      "weight": 2,
      "free": true
    }
  ]
};

// The summit is bare limestone. Trees remain on the surrounding slopes.
export const AREAS = [{k: "paved", p: [[-205,-100],[115,-100],[130,90],[-195,95]].flatMap(p=>game(...p))}];
export { TERRAIN } from "./terrain.js";
