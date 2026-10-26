// Venice: everything the game needs to know about the city it is set in. A first, small map of the
// San Marco sestiere of Venice: the piazza and the Doge’s Palace, the Mercerie to the Rialto
// bridge, and the calli and canals around them. Made like Lecce (see docs/lecce-exercise.md), from
// OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs venice`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs venice`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs venice`
//   inside.js        the buildings you can go into: St Mark's Basilica, its rooms in inside/ (hand-written)
//   campanile.js     the Campanile di San Marco and its Loggetta, modelled by hand on core/js/arcade.js, in place of the map's pieces of them
//   basilica.js, ducale.js, rialto.js  the Basilica, the Palazzo Ducale and the Ponte di Rialto, the same way
//   piazza.js        the Ponte dei Sospiri, the Torre dell'Orologio, the columns and the flagpoles
//   fenice.js        La Fenice's front, dressed on the map's block
// No sights or fronts yet, and one monument, the Campanile: empty lists for the rest, and for what
// only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
export { INSIDE } from './inside.js';
import { CAMPANILE } from './campanile.js';
import { BASILICA } from './basilica.js';
import { DUCALE } from './ducale.js';
import { RIALTO } from './rialto.js';
import { PIAZZA } from './piazza.js';
import { FENICE } from './fenice.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const MONUMENTS = [...CAMPANILE, ...BASILICA, ...DUCALE, ...RIALTO, ...PIAZZA, ...FENICE];
export const SIGHTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'venice';
export const NAME = { nl: 'Venetië', en: 'Venice', fr: 'Venise', es: 'Venecia' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Venice', tag: 'Exploreer of race te fiets, te voet of te paard door de calli van Venetië!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Piazza San Marco, Basilica di San Marco, Campo San Bartolomeo en Ponte di Rialto. Leun achterover en geniet!' },
  en: { title: 'Instant Venice', tag: 'Explore or race by bike, on foot or on horseback through the calli of Venice!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Piazza San Marco, Basilica di San Marco, Campo San Bartolomeo and Ponte di Rialto. Sit back and enjoy!' },
  fr: { title: 'Instant Venice', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans les calli de Venise !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Piazza San Marco, Basilica di San Marco, Campo San Bartolomeo et Ponte di Rialto. Installe-toi et profite !' },
  es: { title: 'Instant Venice', tag: '¡Explora o corre en bici, a pie o a caballo por las calli de Venecia!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Piazza San Marco, Basilica di San Marco, Campo San Bartolomeo y Ponte di Rialto. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#a19a90', paving: '#b9b2a6', verge: 0xb9b2a6, kerb: 0xd8d2c6, fog: [140, 560], weathers: ['clear', 'rain'] };

// No cars in Venice: gondolas on the canals instead of tour boats (js/scenery.js).
export const BOATS = { kind: 'gondola' };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): plaster in
// Venetian red, rose, ochre and cream over brick, white Istrian stone round the windows, green
// shutters and roofs of curved terracotta tiles.
export const LOOK = {
  walls: [
    ['#b5523f', false], ['#d98a73', false], ['#e7b98f', false], ['#c46a4e', false], ['#efd9b8', false],
    ['#e4a58f', false], ['#d7c3a0', false], ['#a8473a', false], ['#f2e6d0', false],
  ],
  bigWalls: ['#efe6d4', '#e4d8c0', '#d9c8a8', '#f2ebe0', '#e8d2b8', '#d4b49a'],
  roofs: [0xa9583a, 0x9c4f33, 0xb8653f],
  doors: ['#3b2a1e', '#2e4a32', '#4a2e1c', '#6b4a2c'],
  shutters: ['#3f6b45', '#2f5a3a', '#6b4a2c', '#4f7a55'],
  stone: '#ece6da',
  flatRoof: 0xc4b59a,
  spires: false,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Piazza San Marco', x: 140, z: 268, side: 'l' },
  { name: 'Basilica di San Marco', x: 228, z: 226, side: 'r' },
  { name: 'Palazzo Ducale', x: 296, z: 337, side: 'r' },
  { name: 'Ponte dei Sospiri', x: 345, z: 295, side: 'r' },
  { name: 'Ponte di Rialto', x: -144, z: -258, side: 'l' },
  { name: 'Campo San Bartolomeo', x: -46, z: -230, side: 'r' },
  { name: 'Campo San Luca', x: -280, z: -23, side: 'l' },
  { name: 'La Fenice', x: -368, z: 337, side: 'l' },
];
