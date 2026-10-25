// Rome: everything the game needs to know about the city it is set in. A first, small map of the
// centro storico of Rome, from Piazza Venezia past the Via del Corso, Piazza Colonna and the
// Pantheon to Largo di Torre Argentina, with the Forum and the Colosseum at the edge of the map.
// Made like Lecce (see docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs rome`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs rome`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs rome`
//   inside.js        the buildings you can go into: the Pantheon and the Sistine Chapel, their rooms in inside/ (hand-written)
//   colosseo.js      the Colosseo, modelled by hand on core/js/arcade.js, in place of the map's pieces of it
//   arco.js          the Arco di Costantino beside it, modelled the same way
// No sights or fronts yet, and two monuments, the Colosseo and the Arco di Costantino: empty lists
// for the rest, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
export { INSIDE } from './inside.js';
import { COLOSSEO } from './colosseo.js';
import { ARCO } from './arco.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const MONUMENTS = [...COLOSSEO, ...ARCO];
export const SIGHTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'rome';
export const NAME = { nl: 'Rome', en: 'Rome', fr: 'Rome', es: 'Roma' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Rome', tag: 'Exploreer of race te fiets, te voet of te paard door het oude Rome!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Piazza Venezia, Piazza Colonna, Pantheon en Largo di Torre Argentina. Leun achterover en geniet!' },
  en: { title: 'Instant Rome', tag: 'Explore or race by bike, on foot or on horseback through ancient Rome!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Piazza Venezia, Piazza Colonna, Pantheon and Largo di Torre Argentina. Sit back and enjoy!' },
  fr: { title: 'Instant Rome', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans la Rome antique !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Piazza Venezia, Piazza Colonna, Pantheon et Largo di Torre Argentina. Installe-toi et profite !' },
  es: { title: 'Instant Rome', tag: '¡Explora o corre en bici, a pie o a caballo por la Roma antigua!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Piazza Venezia, Piazza Colonna, Pantheon y Largo di Torre Argentina. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#a39a8c', paving: '#c9bda6', verge: 0xc9bda6, kerb: 0xddd3bf, fog: [160, 620], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): Vespas everywhere, old Fiat 500s, and white taxis.
export const TRAFFIC = { mix: [['vespa', 0.45], ['cinquecento', 0.12]], taxis: 0.25, taxi: { type: 'taxi', colors: [0xf5f5f5] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): plaster in
// ochre, terracotta, sienna and cream, green and brown shutters, low roofs of terracotta tiles,
// travertine for the big stone buildings.
export const LOOK = {
  walls: [
    ['#d9a25f', false], ['#c97f4a', false], ['#e3b877', false], ['#b8654a', false], ['#efd9a8', false],
    ['#d48c5c', false], ['#e8c99a', false], ['#a85a3c', false], ['#f0e2c2', false], ['#cf9b6a', false],
  ],
  bigWalls: ['#e6dcc6', '#d9cdb3', '#efe7d4', '#d4b896', '#e0c9a0', '#c9b48e'],
  roofs: [0xa9583a, 0x9c4f33, 0xb8653f, 0x8e4a30],
  doors: ['#4a2e1c', '#2e4a32', '#5a3a22', '#3f2a1a', '#6b4a2c'],
  shutters: ['#3f6b45', '#2f5a3a', '#6b4a2c', '#4f7a55'],
  stone: '#e2d7c0',
  flatRoof: 0xc4b59a,
  spires: false,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Piazza Venezia', x: 437, z: 419, side: 'r' },
  { name: 'Pantheon', x: -153, z: 32, side: 'l' },
  { name: 'Piazza Navona', x: -547, z: -51, side: 'l' },
  { name: 'Fontana di Trevi', x: 510, z: -286, side: 'r' },
  { name: 'Piazza Colonna', x: 168, z: -300, side: 'r' },
  { name: 'Campo de’ Fiori', x: -640, z: 447, side: 'l' },
  { name: 'Largo di Torre Argentina', x: -163, z: 461, side: 'l' },
  { name: 'Foro Romano', x: 717, z: 875, side: 'r' },
  { name: 'Colosseo', x: 1432, z: 1193, side: 'r' },
];
