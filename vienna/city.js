// Vienna: everything the game needs to know about the city it is set in. A first, small map of the
// Innere Stadt of Vienna: the Stephansdom and the Graben, the Hofburg on Michaelerplatz, the
// Ringstraße round to the State Opera and the Albertina. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs vienna`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs vienna`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs vienna`
//   inside.js        the buildings you can go into: St Stephen's Cathedral and the Kunsthistorisches Museum, their rooms in inside/ (hand-written)
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
export const ID = 'vienna';
export const NAME = { nl: 'Wenen', en: 'Vienna', fr: 'Vienne', es: 'Viena' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Vienna', tag: 'Exploreer of race te fiets, te voet of te paard door de binnenstad van Wenen!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Graben, Hofburg, Staatsopera, Albertina en Stephansdom. Leun achterover en geniet!' },
  en: { title: 'Instant Vienna', tag: 'Explore or race by bike, on foot or on horseback through the heart of Vienna!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Graben, Hofburg, State Opera, Albertina and Stephansdom. Sit back and enjoy!' },
  fr: { title: 'Instant Vienna', tag: 'Explore ou fais la course à vélo, à pied ou à cheval au cœur de Vienne !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Graben, Hofburg, State Opera, Albertina et Stephansdom. Installe-toi et profite !' },
  es: { title: 'Instant Vienna', tag: '¡Explora o corre en bici, a pie o a caballo por el corazón de Viena!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Graben, Hofburg, State Opera, Albertina y Stephansdom. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#9a9893', paving: '#c6c1b6', verge: 0xc6c1b6, kerb: 0xdad5ca, fog: [160, 620] };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): cream, pale
// yellow and grey stone and plaster for the palaces and the Ringstraße blocks, grey and
// copper-green roofs, no shutters.
export const LOOK = {
  walls: [
    ['#efe6cf', false], ['#e9d9a6', false], ['#f2ecdf', false], ['#ddd3bd', false], ['#e5d08e', false],
    ['#d6cfbf', false], ['#f5f0e4', false], ['#cfc6b0', false],
  ],
  bigWalls: ['#e6dcc4', '#ddd3bb', '#efe7d6', '#d2c8b0', '#e9e1cf', '#c9bea4'],
  roofs: [0x5e666e, 0x6f7780, 0x5f8a78, 0x4a4f55],
  doors: ['#3b2a1e', '#1d2f4a', '#2b2b2b', '#4a2e1c'],
  stone: '#ddd2bb',
  flatRoof: 0x8a8e91,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Stephansdom', x: 620, z: -308, side: 'r' },
  { name: 'Graben', x: 286, z: -336, side: 'l' },
  { name: 'Hofburg', x: -2, z: -239, side: 'l' },
  { name: 'Staatsoper', x: 240, z: 452, side: 'l' },
  { name: 'Albertina', x: 156, z: 244, side: 'l' },
  { name: 'Heldenplatz', x: -317, z: -32, side: 'l' },
  { name: 'Burgtheater', x: -484, z: -571, side: 'l' },
  { name: 'Am Hof', x: 119, z: -626, side: 'r' },
  { name: 'Kärntner Straße', x: 434, z: 106, side: 'r' },
];
