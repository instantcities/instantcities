// Giza: a playable site with its own map, monuments, race, tour and quest.
export { MAP } from './map.js';
export { MONUMENTS } from './monuments.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';
import { game } from './frame.js';
export const ID = 'giza';
export const NAME = { en: 'Giza', nl: 'Giza', fr: 'Giza', es: 'Giza' };
export const WORDS = { en: { title: 'Instant Giza', tag: "Explore the pyramids and the Sphinx on the Giza plateau.", 'tour.welcomeSub': "Three pyramids rise above the desert, with smaller queens\u2019 pyramids, ruined temples and the Sphinx on the eastern side." } };
export const THEME = { pavement: .8, lampEvery: 1e9, ground: '#c7ad7b', paving: '#bca078', verge: '#bca078', kerb: '#bca078', fog: [300, 2400], weathers: ['clear'] };
export const LOOK = { walls: [['#c0b397', false]], bigWalls: ['#c0b397'], roofs: [0x9c8c72], doors: ['#4c4134'], shutters: ['#675b48'], stone: '#bfb49e', flatRoof: 0xb7a68a, spires: false, houseBlocks: true, grass: '#c7ad7b' };
export const STREET_FURNITURE = false, PARKED_BIKES = false, PARKED_CARS = [];
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {}, FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];
export const PLACES = [{"name": "Great Pyramid of Khufu", "xy": [0, 0], "side": "r"}, {"name": "Pyramid of Khafre", "xy": [-360, 350], "side": "r"}, {"name": "Great Sphinx", "xy": [250, 440], "side": "r"}, {"name": "Pyramid of Menkaure", "xy": [-570, 730], "side": "r"}].map(({ xy, ...p }) => { const [x,z] = game(...xy); return { ...p, x, z }; });
