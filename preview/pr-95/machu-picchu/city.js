// Machu Picchu: a playable site with its own map, monuments, race, tour and quest.
export { MAP } from './map.js';
export { MONUMENTS } from './monuments.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';
import { game } from './frame.js';
export const ID = 'machu-picchu';
export const NAME = { en: 'Machu Picchu', nl: 'Machu Picchu', fr: 'Machu Picchu', es: 'Machu Picchu' };
export const WORDS = { en: { title: 'Instant Machu Picchu', tag: "Explore the Inca stone town and its terraces in the Andes.", 'tour.welcomeSub': "Roofless stone houses and temples sit between grassy terraces, with the steep profile of Huayna Picchu behind them." } };
export const THEME = { pavement: .8, lampEvery: 1e9, ground: '#82915a', paving: '#b7ae97', verge: '#b7ae97', kerb: '#b7ae97', fog: [300, 1400], weathers: ['clear'] };
export const LOOK = { walls: [['#c0b397', false]], bigWalls: ['#c0b397'], roofs: [0x9c8c72], doors: ['#4c4134'], shutters: ['#675b48'], stone: '#bfb49e', flatRoof: 0xb7a68a, spires: false, houseBlocks: true, grass: '#82915a' };
export const STREET_FURNITURE = false, PARKED_BIKES = false, PARKED_CARS = [];
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {}, FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];
export const PLACES = [{"name": "Sacred Plaza", "xy": [-35, -65], "side": "r"}, {"name": "Agricultural terraces", "xy": [110, 170], "side": "r"}, {"name": "Residential quarter", "xy": [25, 5], "side": "r"}, {"name": "Huayna Picchu", "xy": [15, -410], "side": "r"}].map(({ xy, ...p }) => { const [x,z] = game(...xy); return { ...p, x, z }; });
