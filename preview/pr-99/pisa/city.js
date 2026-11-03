// Pisa: everything the game needs to know about the city it is set in. A first, small map of the
// middle of Pisa, from the Piazza dei Miracoli down to the Arno: the Leaning Tower, the Duomo, the
// Baptistery and the Camposanto on their lawn, Via Santa Maria, the Piazza dei Cavalieri and Borgo
// Stretto, the Lungarni on both banks with the Ponte di Mezzo and Santa Maria della Spina, and south
// of the river Corso Italia out to the station. Made like Lecce (see docs/lecce-exercise.md), from
// OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings, trees and the river: made from area.json by
//                    `node tools/osm_map.mjs pisa`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs pisa`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs pisa`
//   romanico.js      the parts the landmarks below share: blind arches, loggias, grey bands, lean-to roofs
//   torre.js         the Leaning Tower, modelled by hand and leaning, in place of the map's columns of it
//   duomo.js         the Duomo, its front of loggias and its elliptical dome, in place of the map's pieces of it
//   battistero.js    the Baptistery, its Gothic crown and its dome half of tiles, half of lead
//   camposanto.js    the Camposanto, its blind walls round the cloister and its lawn
//   spina.js         Santa Maria della Spina, the little Gothic oratory on the Lungarno
// No sights or fronts yet: empty lists for those, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
import { TORRE } from './torre.js';
import { DUOMO } from './duomo.js';
import { BATTISTERO } from './battistero.js';
import { CAMPOSANTO } from './camposanto.js';
import { SPINA } from './spina.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const MONUMENTS = [...TORRE, ...DUOMO, ...BATTISTERO, ...CAMPOSANTO, ...SPINA];
export const SIGHTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'pisa';
export const NAME = { nl: 'Pisa', en: 'Pisa', fr: 'Pise', es: 'Pisa' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Pisa', tag: 'Exploreer of race te fiets, te voet of te paard door Pisa, van de scheve toren tot aan de Arno!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs de scheve toren en de Duomo, de Via Santa Maria, de Lungarni, de Ponte di Mezzo en Santa Maria della Spina. Leun achterover en geniet!' },
  en: { title: 'Instant Pisa', tag: 'Explore or race by bike, on foot or on horseback through Pisa, from the Leaning Tower down to the Arno!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past the Leaning Tower and the Duomo, Via Santa Maria, the Lungarni, the Ponte di Mezzo and Santa Maria della Spina. Sit back and enjoy!' },
  fr: { title: 'Instant Pisa', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans Pise, de la tour penchée jusqu’à l’Arno !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant la tour penchée et le Duomo, la Via Santa Maria, les Lungarni, le Ponte di Mezzo et Santa Maria della Spina. Installe-toi et profite !' },
  es: { title: 'Instant Pisa', tag: '¡Explora o corre en bici, a pie o a caballo por Pisa, de la torre inclinada hasta el Arno!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a la torre inclinada y el Duomo, la Via Santa Maria, los Lungarni, el Ponte di Mezzo y Santa Maria della Spina. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets: Tuscan sun, and now and then rain blowing in from the sea.
export const THEME = { ground: '#a39a8c', paving: '#c6bba6', verge: 0xc6bba6, kerb: 0xd9d0bd, fog: [170, 640], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): Vespas, old Fiat 500s, and white taxis.
export const TRAFFIC = { mix: [['vespa', 0.4], ['cinquecento', 0.1]], taxis: 0.25, taxi: { type: 'taxi', colors: [0xf5f5f5] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): the plaster
// of the Lungarni in yellow ochre, deep gold, salmon pink and cream, grey verrucano stone, green
// shutters and roofs of terracotta tiles. The white and grey marble belongs to the Duomo's square,
// not to the houses.
export const LOOK = {
  walls: [
    ['#e9c77e', false], ['#e2b066', false], ['#efd9a8', false], ['#e3a58a', false], ['#f2e4c6', false],
    ['#d99a5e', false], ['#ecd08f', false], ['#e8c3a8', false], ['#c99b67', false], ['#f3ead6', false],
  ],
  bigWalls: ['#c9b48e', '#b8a07c', '#e0d0b0', '#d4c2a0', '#a69a88', '#e6dcc8'],
  roofs: [0xa9583a, 0x9c4f33, 0xb8653f, 0x8e4a30],
  doors: ['#4a2e1c', '#2e4a32', '#5a3a22', '#3f2a1a'],
  shutters: ['#3f6b45', '#2f5a3a', '#6b4a2c', '#4f7a55'],
  stone: '#a69a88',
  flatRoof: 0xc4b59a,
  spires: false,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Torre di Pisa', x: -179, z: -608, side: 'r' },
  { name: 'Duomo', x: -250, z: -647, side: 'l' },
  { name: 'Battistero', x: -423, z: -644, side: 'l' },
  { name: 'Camposanto', x: -338, z: -749, side: 'l' },
  { name: 'Piazza dei Cavalieri', x: 182, z: -107, side: 'r' },
  { name: 'Borgo Stretto', x: 389, z: 176, side: 'r' },
  { name: 'Ponte di Mezzo', x: 352, z: 373, side: 'r' },
  { name: 'Logge di Banchi', x: 298, z: 467, side: 'r' },
  { name: 'Santa Maria della Spina', x: -178, z: 469, side: 'l' },
  { name: 'Corso Italia', x: 185, z: 773, side: 'r' },
  { name: 'Piazza Vittorio Emanuele II', x: 63, z: 1100, side: 'r' },
  { name: 'Stazione', x: 17, z: 1395, side: 'l' },
];
