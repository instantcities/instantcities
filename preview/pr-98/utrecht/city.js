// Utrecht: everything the game needs to know about the city it is set in. A first, small map of the
// middle of Utrecht: the Dom Tower and the Domplein, the Oudegracht with its wharves, the Janskerkhof,
// the Pieterskerk and the Paushuize on the Kromme Nieuwegracht, and the Neude. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings, canals and trees: made from area.json by
//                    `node tools/osm_map.mjs utrecht`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs utrecht`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs utrecht`
//   domtoren.js      the Domtoren, modelled by hand on core/js/arcade.js, in place of the map's blocks of it
//   domkerk.js       the Domkerk's choir and transept, in place of the map's blocks of them
//   pandhof.js       the Pandhof, the Dom's cloister and its garden, in place of the map's block of it
// No sights or fronts yet: empty lists for those, and for what only Ghent has. The wharves of
// the Oudegracht lie low at the water in real life; here the canal is the game's usual one.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
import { DOMTOREN } from './domtoren.js';
import { DOMKERK } from './domkerk.js';
import { PANDHOF } from './pandhof.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const MONUMENTS = [...DOMTOREN, ...DOMKERK, ...PANDHOF];
export const SIGHTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'utrecht';
export const NAME = { nl: 'Utrecht', en: 'Utrecht', fr: 'Utrecht', es: 'Utrecht' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Utrecht', tag: 'Exploreer of race te fiets, te voet of te paard door Utrecht, rond de Dom!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs het Janskerkhof, de Pieterskerk, het Paushuize, de Domtoren en de Oudegracht. Leun achterover en geniet!' },
  en: { title: 'Instant Utrecht', tag: 'Explore or race by bike, on foot or on horseback through Utrecht, round the Dom!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past the Janskerkhof, the Pieterskerk, the Paushuize, the Dom Tower and the Oudegracht. Sit back and enjoy!' },
  fr: { title: 'Instant Utrecht', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans Utrecht, autour du Dom !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant le Janskerkhof, la Pieterskerk, le Paushuize, la tour du Dom et l’Oudegracht. Installe-toi et profite !' },
  es: { title: 'Instant Utrecht', tag: '¡Explora o corre en bici, a pie o a caballo por Utrecht, alrededor del Dom!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto al Janskerkhof, la Pieterskerk, el Paushuize, la torre del Dom y el Oudegracht. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#8f9192', fog: [160, 620] };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): red and brown
// brick, some fronts plastered white, cream or grey, dark doors and roofs of red and grey tiles.
export const LOOK = {
  walls: [
    ['#7a3a28', true], ['#8c4632', true], ['#6a3224', true], ['#9a5238', true], ['#5e2f22', true],
    ['#a35e40', true], ['#efe9dc', false], ['#e2d8c4', false], ['#c9c1b2', false],
  ],
  roofs: [0x8a4030, 0x3d3f42, 0x6a3a2a, 0x4a3b33],
  doors: ['#1c1c1c', '#1f3d2e', '#5a1f1f', '#1d2f4a'],
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Domtoren', x: -155, z: 141, side: 'l' },
  { name: 'Domkerk', x: -57, z: 111, side: 'r' },
  { name: 'Oudegracht', x: -240, z: 60, side: 'l' },
  { name: 'Janskerkhof', x: -101, z: -243, side: 'r' },
  { name: 'Neude', x: -452, z: -132, side: 'l' },
  { name: 'Pieterskerk', x: 122, z: 42, side: 'r' },
  { name: 'Paushuize', x: 98, z: 166, side: 'r' },
  { name: 'Museum Speelklok', x: -332, z: 150, side: 'l' },
  { name: 'Stadhuis', x: -301, z: -51, side: 'l' },
  { name: 'Catharijneconvent', x: 160, z: 540, side: 'r' },
  { name: 'Centraal Museum', x: 248, z: 1105, side: 'r' },
  { name: 'Utrecht Centraal', x: -1008, z: 349, side: 'l' },
];
