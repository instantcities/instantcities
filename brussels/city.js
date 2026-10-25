// Brussels: everything the game needs to know about the city it is set in. A first, small map of
// the Îlot Sacré of Brussels: the Grand-Place, the Bourse, the Manneken Pis, the Galeries Royales
// Saint-Hubert and the cathedral, with the Mont des Arts at the edge. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs brussels`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs brussels`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs brussels`
// No sights, monuments or fronts yet: empty lists for those, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';

export { SIGHTS } from './sights.js';
export const MONUMENTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'brussels';
export const NAME = { nl: 'Brussel', en: 'Brussels', fr: 'Bruxelles', es: 'Bruselas' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Brussels', tag: 'Exploreer of race te fiets, te voet of te paard rond de Grote Markt van Brussel!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Grote Markt, Beurs en Manneken Pis. Leun achterover en geniet!' },
  en: { title: 'Instant Brussels', tag: 'Explore or race by bike, on foot or on horseback round the Grand-Place of Brussels!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Grand-Place, Bourse and Manneken Pis. Sit back and enjoy!' },
  fr: { title: 'Instant Brussels', tag: 'Explore ou fais la course à vélo, à pied ou à cheval autour de la Grand-Place de Bruxelles !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Grand-Place, Bourse et Manneken Pis. Installe-toi et profite !' },
  es: { title: 'Instant Brussels', tag: '¡Explora o corre en bici, a pie o a caballo alrededor de la Grand-Place de Bruselas!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Grand-Place, Bourse y Manneken Pis. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#929497', fog: [160, 620] };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): pale stone and
// white and grey plaster for the 19th-century streets, some brick, slate roofs.
export const LOOK = {
  walls: [
    ['#efe9dc', false], ['#e2dccd', false], ['#d6cfbf', false], ['#c9c3b8', false], ['#f6f3ec', false],
    ['#8c3b2a', true], ['#7a3326', true], ['#e6dcc6', false], ['#b8b0a2', false],
  ],
  bigWalls: ['#e2ddd2', '#d8d2c6', '#c9c3b8', '#efeadf', '#d4cbb8', '#bfb6a6'],
  roofs: [0x3d4248, 0x34383d, 0x4a4f55, 0x2c2f33],
  doors: ['#1f3d2e', '#2b2b2b', '#5a1f1f', '#1d2f4a'],
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Grand-Place', x: 118, z: 0, side: 'r' },
  { name: 'Hôtel de Ville', x: 48, z: 55, side: 'l' },
  { name: 'Manneken Pis', x: -101, z: 235, side: 'l' },
  { name: 'Bourse', x: -128, z: -221, side: 'l' },
  { name: 'Galeries Royales Saint-Hubert', x: 329, z: -179, side: 'r' },
  { name: 'Mont des Arts', x: 514, z: 373, side: 'r' },
  { name: 'Cathédrale Saints-Michel-et-Gudule', x: 777, z: -179, side: 'r' },
  { name: 'Sablon', x: 426, z: 788, side: 'r' },
];
