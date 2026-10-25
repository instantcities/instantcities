// Madrid: everything the game needs to know about the city it is set in. A first, small map of the
// Madrid de los Austrias: the Puerta del Sol, the Calle Mayor and the Plaza Mayor, the Palacio Real
// and the Almudena cathedral, the Plaza de Oriente and the Teatro Real, up to the Gran Vía at
// Callao. Made like Lecce (see docs/lecce-exercise.md), from OpenStreetMap only. The files in this
// folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs madrid`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs madrid`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs madrid`
// No sights, monuments or fronts yet: empty lists for those, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';

export { SIGHTS } from './sights.js';
export const MONUMENTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'madrid';
export const NAME = { nl: 'Madrid', en: 'Madrid', fr: 'Madrid', es: 'Madrid' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Madrid', tag: 'Exploreer of race te fiets, te voet of te paard door het oude Madrid!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Puerta del Sol, Plaza Mayor, Almudenakathedraal, Koninklijk Paleis, Teatro Real en Callao. Leun achterover en geniet!' },
  en: { title: 'Instant Madrid', tag: 'Explore or race by bike, on foot or on horseback through old Madrid!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Puerta del Sol, Plaza Mayor, Almudena Cathedral, Royal Palace, Teatro Real and Callao. Sit back and enjoy!' },
  fr: { title: 'Instant Madrid', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans le vieux Madrid !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Puerta del Sol, Plaza Mayor, Almudena Cathedral, Royal Palace, Teatro Real et Callao. Installe-toi et profite !' },
  es: { title: 'Instant Madrid', tag: '¡Explora o corre en bici, a pie o a caballo por el Madrid de los Austrias!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Puerta del Sol, Plaza Mayor, Almudena Cathedral, Royal Palace, Teatro Real y Callao. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#a39b8f', paving: '#cbc2b2', verge: 0xcbc2b2, kerb: 0xddd5c6, fog: [170, 660], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): scooters, and white taxis.
export const TRAFFIC = { mix: [['vespa', 0.12]], taxis: 0.5, taxi: { type: 'taxi', colors: [0xf5f5f5] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): plaster in
// ochre, cream and Madrid red, the brick and granite of the Plaza Mayor, iron balconies, roofs of
// slate and terracotta.
export const LOOK = {
  walls: [
    ['#e3b97a', false], ['#efe2c4', false], ['#c46a4e', false], ['#e8cfa0', false], ['#b8553f', false],
    ['#f2ead8', false], ['#d9a46f', false], ['#9c4a36', false], ['#e6d6b8', false],
  ],
  bigWalls: ['#e6dcc4', '#d9cdb3', '#efe7d4', '#c9bea4', '#d4c39c', '#b8553f'],
  roofs: [0x4a4f55, 0x3d4248, 0xa9583a, 0x9c4f33],
  doors: ['#3b2a1e', '#2e4a32', '#4a2e1c', '#1d2f4a'],
  shutters: ['#3f6b45', '#5a3a22', '#2f4a5a'],
  stone: '#c9c0ae',
  flatRoof: 0xb4a894,
  spires: false,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Puerta del Sol', x: 529, z: 135, side: 'r' },
  { name: 'Plaza Mayor', x: 116, z: 328, side: 'r' },
  { name: 'Palacio Real', x: -615, z: -17, side: 'l' },
  { name: 'Catedral de la Almudena', x: -647, z: 301, side: 'l' },
  { name: 'Plaza de Oriente', x: -371, z: -86, side: 'r' },
  { name: 'Teatro Real', x: -265, z: -72, side: 'r' },
  { name: 'Mercado de San Miguel', x: -54, z: 342, side: 'l' },
  { name: 'Plaza de la Villa', x: -170, z: 356, side: 'l' },
  { name: 'Callao', x: 275, z: -280, side: 'r' },
];
