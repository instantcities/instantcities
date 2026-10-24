// Paris: everything the game needs to know about the city it is set in. A first, small map of the
// Île de la Cité and both banks of the Seine around it: the Hôtel de Ville, Notre-Dame, the
// Sainte-Chapelle, the Pont Neuf and the Rue de Rivoli up to the Louvre. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs paris`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs paris`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs paris`
// No quests, sights, monuments or fronts yet: empty lists for those, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';

export const QUESTS = [], SIGHTS = [], MONUMENTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'paris';
export const NAME = { nl: 'Parijs', en: 'Paris', fr: 'Paris', es: 'París' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Paris', tag: 'Exploreer of race te fiets, te voet of te paard langs de Seine!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Hôtel de Ville, Notre-Dame, Sainte-Chapelle, Pont Neuf en Châtelet. Leun achterover en geniet!' },
  en: { title: 'Instant Paris', tag: 'Explore or race by bike, on foot or on horseback along the Seine!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Hôtel de Ville, Notre-Dame, Sainte-Chapelle, Pont Neuf and Châtelet. Sit back and enjoy!' },
  fr: { title: 'Instant Paris', tag: 'Explore ou fais la course à vélo, à pied ou à cheval au bord de la Seine !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Hôtel de Ville, Notre-Dame, Sainte-Chapelle, Pont Neuf et Châtelet. Installe-toi et profite !' },
  es: { title: 'Instant Paris', tag: '¡Explora o corre en bici, a pie o a caballo junto al Sena!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Hôtel de Ville, Notre-Dame, Sainte-Chapelle, Pont Neuf y Châtelet. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#9d9a93', paving: '#c8c2b6', verge: 0xc8c2b6, kerb: 0xdcd6ca, fog: [160, 620] };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): the cream
// limestone of Haussmann’s blocks, a few plastered houses, grey zinc and slate roofs, iron
// balconies, and the Gothic churches with their spires.
export const LOOK = {
  walls: [
    ['#e8dcc2', false], ['#e2d4b6', false], ['#efe6d2', false], ['#d9cbae', false], ['#f2ece0', false],
    ['#ddd0b8', false], ['#e6d9bd', false], ['#d2c3a4', false],
  ],
  bigWalls: ['#e6dbc4', '#ddd0b5', '#efe7d6', '#d4c6aa', '#e9e1cf', '#cfc1a3'],
  roofs: [0x6f7780, 0x5e666e, 0x7d858c, 0x555c63],
  doors: ['#1f3550', '#2b2b2b', '#3b2a1e', '#1f4a3a', '#5a2a24'],
  shutters: ['#d8d4c8', '#c9c5b9', '#4f6b78'],
  stone: '#ddd2bb',
  flatRoof: 0x8a8e91,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Notre-Dame', x: 326, z: 509, side: 'r' },
  { name: 'Hôtel de Ville', x: 536, z: 11, side: 'r' },
  { name: 'Louvre', x: -800, z: -542, side: 'l' },
  { name: 'Pont Neuf', x: -462, z: -72, side: 'l' },
  { name: 'Sainte-Chapelle', x: -123, z: 177, side: 'r' },
  { name: 'Place Saint-Michel', x: -242, z: 467, side: 'l' },
  { name: 'Châtelet', x: 60, z: -182, side: 'r' },
  { name: 'Centre Pompidou', x: 536, z: -542, side: 'r' },
];
