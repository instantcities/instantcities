// Salerno: everything the game needs to know about the city it is set in. A first, small map of
// the middle of Salerno, on its gulf at the start of the Amalfi Coast: the Duomo of San Matteo, the
// medieval lanes of Via dei Mercanti, the Corso Vittorio Emanuele, the Villa Comunale and the Teatro
// Verdi, and the palm-lined Lungomare Trieste along the sea, out to the Molo Manfredi where the ferries
// leave for Amalfi. Made like Lecce (see docs/lecce-exercise.md), from OpenStreetMap only. The files in
// this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings, trees and the sea: made from area.json by
//                    `node tools/osm_map.mjs salerno`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs salerno`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs salerno`
// No sights, monuments or fronts yet: empty lists for those, and for what only Ghent has. The town
// climbs the hill behind the sea, but the map is flat, like every city's outside Flanders.
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
export const ID = 'salerno';
export const NAME = { nl: 'Salerno', en: 'Salerno', fr: 'Salerne', es: 'Salerno' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Salerno', tag: 'Exploreer of race te fiets, te voet of te paard door Salerno, tussen de zee en de heuvels!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs de Via dei Mercanti, de Corso Vittorio Emanuele, de Lungomare, de Villa Comunale en de Duomo. Leun achterover en geniet!' },
  en: { title: 'Instant Salerno', tag: 'Explore or race by bike, on foot or on horseback through Salerno, between the sea and the hills!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Via dei Mercanti, the Corso Vittorio Emanuele, the Lungomare, the Villa Comunale and the Duomo. Sit back and enjoy!' },
  fr: { title: 'Instant Salerno', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans Salerne, entre la mer et les collines !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant la Via dei Mercanti, le Corso Vittorio Emanuele, le Lungomare, la Villa Comunale et le Duomo. Installe-toi et profite !' },
  es: { title: 'Instant Salerno', tag: '¡Explora o corre en bici, a pie o a caballo por Salerno, entre el mar y las colinas!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a la Via dei Mercanti, el Corso Vittorio Emanuele, el Lungomare, la Villa Comunale y el Duomo. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets: the bright light of the south, and now and then rain off the sea.
export const THEME = { ground: '#a59c8c', paving: '#cbbfa8', verge: 0xcbbfa8, kerb: 0xdcd2bf, fog: [180, 680], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): Vespas, old Fiat 500s, and white taxis.
export const TRAFFIC = { mix: [['vespa', 0.45], ['cinquecento', 0.12]], taxis: 0.25, taxi: { type: 'taxi', colors: [0xf5f5f5] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): the plaster of
// the Campanian coast in warm ochre, salmon pink, pale yellow and cream, the grey tufa of the
// churches, green and brown shutters and roofs of terracotta tiles.
export const LOOK = {
  walls: [
    ['#e8c48a', false], ['#e7b299', false], ['#f0dcae', false], ['#dba26e', false], ['#f2e6cc', false],
    ['#d98f6a', false], ['#efd28e', false], ['#e9cdb8', false], ['#c99a6b', false], ['#f4ecd8', false],
  ],
  bigWalls: ['#d9c3a0', '#c8ad86', '#e6d6b8', '#bfa27c', '#e2c8a2', '#a8a092'],
  roofs: [0xa95a3c, 0x9a5236, 0xb86742, 0x8c4b32],
  doors: ['#4a2e1c', '#2e4a3a', '#5a3a22', '#3a3a3a'],
  shutters: ['#3f6b45', '#2f5a3a', '#6b4a2c', '#5a7a5a'],
  stone: '#a8a092',
  flatRoof: 0xcbbc9e,
  water: 0x3f6f86, // the sea, bluer than the canals' green
  spires: false,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Duomo di San Matteo', x: 118, z: -269, side: 'r' },
  { name: 'Via dei Mercanti', x: 150, z: -135, side: 'r' },
  { name: 'Piazza Portanova', x: 330, z: -40, side: 'r' },
  { name: 'Corso Vittorio Emanuele', x: 600, z: 40, side: 'r' },
  { name: 'Lungomare Trieste', x: 96, z: 109, side: 'r' },
  { name: 'Villa Comunale', x: -573, z: -83, side: 'l' },
  { name: 'Teatro Verdi', x: -759, z: -142, side: 'l' },
  { name: 'Piazza della Libertà', x: -591, z: 200, side: 'l' },
  { name: 'Molo Manfredi', x: -729, z: 504, side: 'l' },
  { name: 'Giardino della Minerva', x: -576, z: -451, side: 'l' },
  { name: 'Stazione', x: 1290, z: 455, side: 'l' },
];
