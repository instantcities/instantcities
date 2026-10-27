// Acropolis: a playable site with its own map, monuments, race, tour and quest.
export { MAP } from './map.js';
export { MONUMENTS } from './monuments.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';
import { game } from './frame.js';
export const ID = 'acropolis';
export const NAME = { en: 'Acropolis', nl: 'Acropolis', fr: 'Acropolis', es: 'Acropolis' };
export const WORDS = { en: { title: 'Instant Acropolis', tag: "Walk among the temples on the Acropolis of Athens.", 'tour.welcomeSub': "The Parthenon, the Erechtheion and the western gateway stand on the rocky summit above Athens." } };
export const THEME = { pavement: .8, lampEvery: 1e9, ground: '#b5ab91', paving: '#c9bda5', verge: '#c9bda5', kerb: '#c9bda5', fog: [300, 1400], weathers: ['clear'] };
export const LOOK = { walls: [['#c0b397', false]], bigWalls: ['#c0b397'], roofs: [0x9c8c72], doors: ['#4c4134'], shutters: ['#675b48'], stone: '#bfb49e', flatRoof: 0xb7a68a, spires: false, houseBlocks: true, grass: '#b5ab91' };
export const STREET_FURNITURE = false, PARKED_BIKES = false, PARKED_CARS = [];
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {}, FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];
export const PLACES = [{"name": "Parthenon", "xy": [0, 0], "side": "r"}, {"name": "Erechtheion", "xy": [-20, -60], "side": "r"}, {"name": "Propylaea", "xy": [-140, 0], "side": "r"}, {"name": "Temple of Athena Nike", "xy": [-153, 36], "side": "r"}].map(({ xy, ...p }) => { const [x,z] = game(...xy); return { ...p, x, z }; });
