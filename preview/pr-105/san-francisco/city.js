// San Francisco: everything the game needs to know about the city it is set in. A first, small map of
// the north-east of San Francisco, by the bay: Union Square and the cable car turntable on Powell
// Street, Chinatown along Grant Avenue with the Dragon Gate, the Transamerica Pyramid and the towers
// of the Financial District, the Ferry Building on the Embarcadero, North Beach round Washington
// Square, and Telegraph Hill with Coit Tower. Made like Lecce (see docs/lecce-exercise.md), from
// OpenStreetMap only. The real city climbs over its hills; here it lies flat. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings, trees and the bay: made from area.json by
//                    `node tools/osm_map.mjs san-francisco`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs san-francisco`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs san-francisco`
//   transamerica.js  the Transamerica Pyramid, modelled by hand in place of the map's stack of it
//   ferry-building.js the Ferry Building and its clock tower, in place of the map's block and tower
//   coit-tower.js    Coit Tower on Telegraph Hill, in place of the map's tower and base
//   dragon-gate.js   the Dragon Gate across Grant Avenue at Bush Street
// No sights or fronts yet: empty lists for those, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
import { TRANSAMERICA } from './transamerica.js';
import { FERRY_BUILDING } from './ferry-building.js';
import { COIT_TOWER } from './coit-tower.js';
import { DRAGON_GATE } from './dragon-gate.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const MONUMENTS = [...TRANSAMERICA, ...FERRY_BUILDING, ...COIT_TOWER, ...DRAGON_GATE];
export const SIGHTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'san-francisco';
export const NAME = { nl: 'San Francisco', en: 'San Francisco', fr: 'San Francisco', es: 'San Francisco' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant San Francisco', tag: 'Exploreer of race te fiets, te voet of te paard door San Francisco, van Chinatown tot aan de baai!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Chinatown en de Dragon Gate, de torens van het Financial District, het Ferry Building aan de baai, de Transamerica Pyramid en Portsmouth Square. Leun achterover en geniet!' },
  en: { title: 'Instant San Francisco', tag: 'Explore or race by bike, on foot or on horseback through San Francisco, from Chinatown to the bay!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Chinatown and the Dragon Gate, the towers of the Financial District, the Ferry Building on the bay, the Transamerica Pyramid and Portsmouth Square. Sit back and enjoy!' },
  fr: { title: 'Instant San Francisco', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans San Francisco, de Chinatown jusqu’à la baie !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Chinatown et la Dragon Gate, les tours du Financial District, le Ferry Building au bord de la baie, la Transamerica Pyramid et Portsmouth Square. Installe-toi et profite !' },
  es: { title: 'Instant San Francisco', tag: '¡Explora o corre en bici, a pie o a caballo por San Francisco, de Chinatown a la bahía!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Chinatown y la Dragon Gate, las torres del Financial District, el Ferry Building junto a la bahía, la Transamerica Pyramid y Portsmouth Square. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets: bright days by the bay, and rain in winter. The fog that rolls in
// through the Golden Gate is not a weather of the game yet; the haze closes in sooner than in most
// cities instead.
export const THEME = { ground: '#9a9893', paving: '#c4c1ba', fog: [150, 620], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): yellow taxis, and now and then a green one.
// Traffic keeps to the right.
export const TRAFFIC = { taxis: 0.5, taxi: { type: 'taxi', colors: [0xf7b500, 0xf7b500, 0xf7b500, 0x2e7d32] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): the painted
// wooden houses of North Beach and Chinatown in pale blue, pink, mint, yellow, cream and white, a few
// red brick buildings from the Gold Rush, and the stone, concrete and glass of the Financial District
// for the big buildings; flat roofs (area.json).
export const LOOK = {
  walls: [
    ['#c9dbe3', false], ['#e6c9cf', false], ['#d7e3c8', false], ['#f1e3a8', false], ['#efe7d6', false],
    ['#f4f1ea', false], ['#b9c7d6', false], ['#d9b99a', false], ['#e3d0e3', false], ['#8c4632', true],
  ],
  bigWalls: ['#d8d2c4', '#c9c3b6', '#e6e1d6', '#8a97a3', '#5f6d7a', '#b9b2a3'],
  roofs: [0x4a4b4d, 0x3d3f42, 0x5a5650, 0x6e6c69],
  doors: ['#f4f1ea', '#1c1c1c', '#7a1f1f', '#1d2f4a', '#2e4a3a'],
  flatRoof: 0x6f706e,
  water: 0x4a7488, // the bay, grey-blue
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Union Square', x: -873, z: 777, side: 'l' },
  { name: 'Cable car turntable', x: -908, z: 1219, side: 'l' },
  { name: 'Dragon Gate', x: -651, z: 404, side: 'r' },
  { name: 'Chinatown', x: -774, z: -83, side: 'l' },
  { name: 'Portsmouth Square', x: -637, z: -170, side: 'r' },
  { name: 'Transamerica Pyramid', x: -355, z: -220, side: 'r' },
  { name: 'Jackson Square', x: -302, z: -421, side: 'r' },
  { name: 'City Lights', x: -766, z: -557, side: 'l' },
  { name: 'Washington Square', x: -1153, z: -989, side: 'l' },
  { name: 'Coit Tower', x: -690, z: -1215, side: 'r' },
  { name: 'Ferry Building', x: 672, z: -268, side: 'r' },
  { name: 'Embarcadero', x: 226, z: -746, side: 'r' },
  { name: 'Market Street', x: 6, z: 429, side: 'r' },
];
