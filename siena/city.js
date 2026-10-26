// Siena: everything the game needs to know about the city it is set in. A first, small map of the
// middle of Siena, on its three hills in Tuscany: the Piazza del Campo with the Palazzo Pubblico and
// the Torre del Mangia, Banchi di Sopra and the Loggia della Mercanzia, the striped cathedral and
// Santa Maria della Scala, and San Domenico across the valley of Fontebranda. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs siena`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs siena`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs siena`
// No sights, monuments or fronts yet: empty lists for those, and for what only Ghent has. The town
// climbs and falls on every street, but the map is flat, like every city's outside Flanders.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const SIGHTS = [], MONUMENTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'siena';
export const NAME = { nl: 'Siena', en: 'Siena', fr: 'Sienne', es: 'Siena' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Siena', tag: 'Exploreer of race te fiets, te voet of te paard door Siena, rond de Piazza del Campo!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs de Loggia della Mercanzia, de Piazza del Campo, de Duomo, Santa Maria della Scala en San Domenico. Leun achterover en geniet!' },
  en: { title: 'Instant Siena', tag: 'Explore or race by bike, on foot or on horseback through Siena, round the Piazza del Campo!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past the Loggia della Mercanzia, the Piazza del Campo, the Duomo, Santa Maria della Scala and San Domenico. Sit back and enjoy!' },
  fr: { title: 'Instant Siena', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans Sienne, autour de la Piazza del Campo !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant la Loggia della Mercanzia, la Piazza del Campo, le Duomo, Santa Maria della Scala et San Domenico. Installe-toi et profite !' },
  es: { title: 'Instant Siena', tag: '¡Explora o corre en bici, a pie o a caballo por Siena, alrededor de la Piazza del Campo!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a la Loggia della Mercanzia, la Piazza del Campo, el Duomo, Santa Maria della Scala y San Domenico. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets: the Campo's red brick underfoot, and the clear light of Tuscany.
export const THEME = { ground: '#a8907a', paving: '#c09a7e', verge: 0xc09a7e, kerb: 0xd2bba4, fog: [160, 620], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): the centre is closed to cars, so mostly
// Vespas, a few old Fiat 500s, and white taxis.
export const TRAFFIC = { mix: [['vespa', 0.5], ['cinquecento', 0.1]], taxis: 0.2, taxi: { type: 'taxi', colors: [0xf5f5f5] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): the burnt
// sienna of the brick and the plaster, in red-brown, rust and warm ochre, the grey-white travertine
// of the palaces, dark green shutters and roofs of terracotta tiles.
export const LOOK = {
  walls: [
    ['#b8714e', false], ['#c4835c', false], ['#a8603f', false], ['#d39a6c', false], ['#c98f63', false],
    ['#e0b88a', false], ['#b56b48', false], ['#d8a679', false], ['#9e5a3c', false], ['#e6c9a0', false],
  ],
  bigWalls: ['#b0704f', '#a46446', '#c08460', '#d8c4a6', '#9c5c40', '#cdb796'],
  roofs: [0xa9583a, 0x9c4f33, 0xb8653f, 0x8e4a30],
  doors: ['#4a2e1c', '#2e3f32', '#5a3a22', '#3f2a1a'],
  shutters: ['#3a5a3e', '#2f4a36', '#6b4a2c', '#4a5f4a'],
  stone: '#cdbfa6',
  flatRoof: 0xc4a88a,
  spires: false,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Piazza del Campo', x: 191, z: -54, side: 'r' },
  { name: 'Torre del Mangia', x: 243, z: -24, side: 'r' },
  { name: 'Fonte Gaia', x: 159, z: -84, side: 'l' },
  { name: 'Loggia della Mercanzia', x: 138, z: -118, side: 'r' },
  { name: 'Piazza Salimbeni', x: 100, z: -440, side: 'r' },
  { name: 'Duomo', x: -106, z: 81, side: 'l' },
  { name: 'Santa Maria della Scala', x: -167, z: 155, side: 'l' },
  { name: 'Facciatone', x: -1, z: 110, side: 'r' },
  { name: 'San Domenico', x: -287, z: -223, side: 'l' },
  { name: 'Fontebranda', x: -213, z: -171, side: 'l' },
  { name: 'Fortezza Medicea', x: -642, z: -586, side: 'l' },
];
