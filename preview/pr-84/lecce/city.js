// Lecce, the baroque old town inside its ring of viali: everything the game needs to know about the
// city it is set in. Made as a second city, to see how much of the game was Ghent-only (see
// docs/lecce-exercise.md). The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   sights.js        the sights, and what a card tells you about each when you ride up (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs lecce`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs lecce`, do not edit by hand
//   transit.js       the bus stops and lines: `node tools/transit.mjs lecce`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs lecce`
//   monuments.js     the column of Sant’Oronzo, the obelisk and Porta Napoli, modelled by hand (hand-written)
//   fronts.js        the baroque fronts drawn by hand onto the map's outlines: Santa Croce, the Duomo,
//                    the Celestini (hand-written)
// Ghent has more (3D landmarks and their facades, the hollow squares); Lecce exports empty lists
// for what it lacks.
import { MAP as OSM } from './map.js';
// its only water, the basins of a few fountains, lies just under the street, not down at the
// canals' level (core/js/ground.js WATER)
export const MAP = { ...OSM, areas: OSM.areas.map(a => (a.k === 'water' ? { ...a, level: -1 } : a)) };
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { STOPS, TRAM_HALTS, BUS_LINES } from './transit.js';
export { FURNITURE } from './furniture.js';
export { MONUMENTS } from './monuments.js';
export { FRONTS } from './fronts.js';

export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'lecce';
export const NAME = { nl: 'Lecce', en: 'Lecce', fr: 'Lecce', es: 'Lecce' };

// The game's name and tagline here, and the warnings of the dancers who pull you into the pizzica
// (the collect quest's crowd), in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Lecce', tag: 'Exploreer of race te fiets, te voet of te paard door het barokke Lecce!', 'quest.retch': '🌀 PAS OP, ZE TREKKEN JE DE DANS IN!', 'quest.puked': 'PIZZICA! 💃', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs de Porta Rudiae, de Duomo, Sant’Oronzo en de Santa Croce. Leun achterover en geniet!' },
  en: { title: 'Instant Lecce', tag: 'Explore or race by bike, on foot or on horseback through baroque Lecce!', 'quest.retch': '🌀 WATCH OUT, THEY’LL PULL YOU INTO THE DANCE!', 'quest.puked': 'PIZZICA! 💃', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Porta Rudiae, the Duomo, Sant’Oronzo and Santa Croce. Sit back and enjoy!' },
  fr: { title: 'Instant Lecce', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans la Lecce baroque !', 'quest.retch': '🌀 ATTENTION, ILS VONT T’ENTRAÎNER DANS LA DANSE !', 'quest.puked': 'PIZZICA ! 💃', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Porta Rudiae, the Duomo, Sant’Oronzo et Santa Croce. Installe-toi et profite !' },
  es: { title: 'Instant Lecce', tag: '¡Explora o corre en bici, a pie o a caballo por la Lecce barroca!', 'quest.retch': '🌀 ¡CUIDADO, TE VAN A METER EN EL BAILE!', 'quest.puked': '¡PIZZICA! 💃', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Porta Rudiae, the Duomo, Sant’Oronzo y Santa Croce. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground (the courtyards inside the blocks, paved) and how far the fog lets
// you see, in game metres. The pavements are the same pale limestone as the houses.
export const THEME = { ground: '#a59d8f', paving: '#cfc4ae', verge: 0xcfc4ae, kerb: 0xe2d9c4, fog: [160, 620], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): Vespas, old Fiat 500s, and white taxis.
export const TRAFFIC = { mix: [['vespa', 0.3], ['cinquecento', 0.12]], taxis: 0.3, taxi: { type: 'taxi', colors: [0xf5f5f5] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): the honey-coloured
// pietra leccese the whole old town is built of, a few houses plastered white or ochre, green and
// brown louvred shutters, flat roof terraces (area.json has roofs: 'flat') and bell towers that end
// flat, not in a spire. Whole blocks are mapped as one outline (houseBlocks): they get house fronts.
export const LOOK = {
  walls: [
    ['#e3cfa4', false], ['#dcc493', false], ['#e9d8b2', false], ['#d6bb88', false], ['#efe3c8', false],
    ['#e7c9a0', false], ['#f2ece0', false], ['#d9b98c', false], ['#c9a878', false], ['#ead39e', false],
  ],
  bigWalls: ['#e0cfa8', '#d8c49a', '#ebe0c6', '#cdb58a', '#f0e8d6', '#d4bd94'],
  roofs: [0xb0603f, 0xa4583a, 0xbf7552],
  doors: ['#5a3a22', '#3f5e3a', '#6b4a2c', '#2e4a32', '#7a5a35', '#4a3220'],
  shutters: ['#3f6b45', '#2f5a3a', '#6b4a2c', '#4f7a55'],
  stone: '#d8c39a',
  flatRoof: 0xcfc2a8,
  spires: false,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Piazza Sant’Oronzo', x: 431, z: 126, side: 'r' },
  { name: 'Duomo', x: 67, z: 286, side: 'l' },
  { name: 'Santa Croce', x: 482, z: -118, side: 'r' },
  { name: 'Porta Napoli', x: -15, z: -367, side: 'l' },
  { name: 'Porta Rudiae', x: -437, z: 344, side: 'l' },
  { name: 'Porta San Biagio', x: 416, z: 593, side: 'r' },
  { name: 'Castello Carlo V', x: 721, z: 224, side: 'r' },
  { name: 'Stazione', x: -254, z: 1094, side: 'l' },
];
