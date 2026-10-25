// Prague: everything the game needs to know about the city it is set in. A first, small map of the
// Old Town of Prague: the Old Town Square with its astronomical clock and the Týn church, the
// Jewish Quarter, and the river by the Charles Bridge. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs prague`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs prague`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs prague`
// No sights, monuments or fronts yet: empty lists for those, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';

export const SIGHTS = [], MONUMENTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'prague';
export const NAME = { nl: 'Praag', en: 'Prague', fr: 'Prague', es: 'Praga' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Prague', tag: 'Exploreer of race te fiets, te voet of te paard door de oude stad van Praag!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Oudestadsplein, Josefov, Klementinum en Astronomische klok. Leun achterover en geniet!' },
  en: { title: 'Instant Prague', tag: 'Explore or race by bike, on foot or on horseback through the Old Town of Prague!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Old Town Square, Josefov, Klementinum and Astronomical clock. Sit back and enjoy!' },
  fr: { title: 'Instant Prague', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans la vieille ville de Prague !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Old Town Square, Josefov, Klementinum et Astronomical clock. Installe-toi et profite !' },
  es: { title: 'Instant Prague', tag: '¡Explora o corre en bici, a pie o a caballo por la ciudad vieja de Praga!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Old Town Square, Josefov, Klementinum y Astronomical clock. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#9c9790', paving: '#c2bdb2', verge: 0xc2bdb2, kerb: 0xd6d1c6, fog: [160, 620] };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): baroque
// plaster in pastel yellow, pink, cream and pale green, red tiled roofs, no shutters, and the
// Gothic towers with their spires.
export const LOOK = {
  walls: [
    ['#efd98a', false], ['#e9b9a8', false], ['#f2e8d0', false], ['#cfe0c4', false], ['#e8c47a', false],
    ['#f0d2c0', false], ['#d9cdb0', false], ['#f5eedf', false], ['#c8d4dc', false], ['#e6c9a0', false],
  ],
  bigWalls: ['#e6dcc6', '#d9cdb3', '#efe7d4', '#cfc3aa', '#e8d9b8', '#c4b896'],
  roofs: [0xa9583a, 0x9c4f33, 0xb8653f, 0x8e4a30, 0x3d4248],
  doors: ['#4a2e1c', '#2e4a32', '#5a3a22', '#3f2a1a', '#1d2f4a'],
  stone: '#cfc6b4',
  flatRoof: 0xb4a894,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Staroměstské náměstí', x: 290, z: 32, side: 'r' },
  { name: 'Orloj', x: 245, z: 101, side: 'l' },
  { name: 'Týn', x: 415, z: 4, side: 'r' },
  { name: 'Karlův most', x: -594, z: 170, side: 'l' },
  { name: 'Josefov', x: 76, z: -327, side: 'l' },
  { name: 'Klementinum', x: -156, z: 184, side: 'l' },
  { name: 'Rudolfinum', x: -273, z: -314, side: 'l' },
  { name: 'Prašná brána', x: 843, z: 73, side: 'r' },
];
