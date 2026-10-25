// Florence: everything the game needs to know about the city it is set in. A first, small map of
// the middle of Florence: the Duomo and the Baptistery, Piazza della Signoria and the Uffizi, the
// Ponte Vecchio over the Arno, out to Santa Croce and Santa Maria Novella. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs florence`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs florence`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs florence`
//   inside.js        the buildings you can go into: the Uffizi, its rooms in inside/ (hand-written)
// No sights, monuments or fronts yet: empty lists for those, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
export { INSIDE } from './inside.js';

export const SIGHTS = [], MONUMENTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'florence';
export const NAME = { nl: 'Florence', en: 'Florence', fr: 'Florence', es: 'Florencia' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Florence', tag: 'Exploreer of race te fiets, te voet of te paard door het Florence van de renaissance!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Baptisterium, Piazza della Signoria, Ponte Vecchio, Piazza della Repubblica en Duomo. Leun achterover en geniet!' },
  en: { title: 'Instant Florence', tag: 'Explore or race by bike, on foot or on horseback through Renaissance Florence!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Baptistery, Piazza della Signoria, Ponte Vecchio, Piazza della Repubblica and Duomo. Sit back and enjoy!' },
  fr: { title: 'Instant Florence', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans la Florence de la Renaissance !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Baptistery, Piazza della Signoria, Ponte Vecchio, Piazza della Repubblica et Duomo. Installe-toi et profite !' },
  es: { title: 'Instant Florence', tag: '¡Explora o corre en bici, a pie o a caballo por la Florencia del Renacimiento!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Baptistery, Piazza della Signoria, Ponte Vecchio, Piazza della Repubblica y Duomo. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#a39a8c', paving: '#c4b9a4', verge: 0xc4b9a4, kerb: 0xd8cfbb, fog: [160, 620], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): Vespas, old Fiat 500s, and white taxis.
export const TRAFFIC = { mix: [['vespa', 0.4], ['cinquecento', 0.1]], taxis: 0.25, taxi: { type: 'taxi', colors: [0xf5f5f5] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): plaster in
// cream, ochre and pale yellow, the brown pietra forte of the palazzi, green shutters and roofs of
// terracotta tiles.
export const LOOK = {
  walls: [
    ['#ead9b4', false], ['#e2c89a', false], ['#f0e3c6', false], ['#d9b98a', false], ['#e8cf9f', false],
    ['#c9a878', false], ['#f2ead8', false], ['#dcc6a0', false], ['#b89a72', false], ['#e6d2aa', false],
  ],
  bigWalls: ['#b8a07c', '#a88f6a', '#c9b48e', '#d4c2a0', '#9c8460', '#e0d0b0'],
  roofs: [0xa9583a, 0x9c4f33, 0xb8653f, 0x8e4a30],
  doors: ['#4a2e1c', '#2e4a32', '#5a3a22', '#3f2a1a'],
  shutters: ['#3f6b45', '#2f5a3a', '#6b4a2c', '#4f7a55'],
  stone: '#b8a07c',
  flatRoof: 0xc4b59a,
  spires: false,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Duomo', x: 266, z: -332, side: 'r' },
  { name: 'Battistero', x: 156, z: -332, side: 'l' },
  { name: 'Piazza della Signoria', x: 246, z: 152, side: 'r' },
  { name: 'Uffizi', x: 196, z: 400, side: 'r' },
  { name: 'Ponte Vecchio', x: -25, z: 373, side: 'l' },
  { name: 'Piazza della Repubblica', x: 55, z: -97, side: 'l' },
  { name: 'Santa Croce', x: 889, z: 290, side: 'r' },
  { name: 'Santa Maria Novella', x: -417, z: -526, side: 'l' },
  { name: 'Palazzo Pitti', x: -337, z: 774, side: 'l' },
];
