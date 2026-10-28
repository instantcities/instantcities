// Barcelona: everything the game needs to know about the city it is set in. The Ciutat Vella of
// Barcelona: the Rambla from Plaça de Catalunya down to the Columbus monument, the Gothic Quarter
// with the cathedral and Plaça de Sant Jaume, and Portal de l’Àngel; north of it the Eixample up
// Passeig de Gràcia to the Sagrada Família, and east of it the port, Barceloneta and its beach. Made like
// Lecce (see docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs barcelona`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs barcelona`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs barcelona`
//   colom.js         the Monument a Colom, modelled by hand on core/js/arcade.js, in place of the map's rings of it
//   sagrada.js       the Sagrada Família, modelled by hand in place of the map's building parts of it
// No sights or fronts yet, and two monuments, the Monument a Colom and the Sagrada Família: empty
// lists for the rest, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
import { MAP } from './map.js';
import { COLOM } from './colom.js';
import { SAGRADA } from './sagrada.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const MONUMENTS = [...COLOM, ...SAGRADA];
// the beaches of Barceloneta, from the map: people lie out on them (js/sitters.js)
export const BEACHES = MAP.areas.filter(a => a.beach).map(a => a.p);
export const SIGHTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], RUNS = [];

// the city's folder, and its name
export const ID = 'barcelona';
export const NAME = { nl: 'Barcelona', en: 'Barcelona', fr: 'Barcelone', es: 'Barcelona' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Barcelona', tag: 'Exploreer of race te fiets, te voet of te paard over de Rambla!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Liceu, Monument a Colom, Plaça Reial, Plaça de Sant Jaume en Catedral, dan naar de Sagrada Família en het strand van Barceloneta. Leun achterover en geniet!' },
  en: { title: 'Instant Barcelona', tag: 'Explore or race by bike, on foot or on horseback down the Rambla!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Liceu, Monument a Colom, Plaça Reial, Plaça de Sant Jaume and Catedral, then on to the Sagrada Família and the beach of Barceloneta. Sit back and enjoy!' },
  fr: { title: 'Instant Barcelona', tag: 'Explore ou fais la course à vélo, à pied ou à cheval sur la Rambla !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Liceu, Monument a Colom, Plaça Reial, Plaça de Sant Jaume et Catedral, puis jusqu’à la Sagrada Família et la plage de la Barceloneta. Installe-toi et profite !' },
  es: { title: 'Instant Barcelona', tag: '¡Explora o corre en bici, a pie o a caballo por la Rambla!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Liceu, Monument a Colom, Plaça Reial, Plaça de Sant Jaume y Catedral, y luego hasta la Sagrada Família y la playa de la Barceloneta. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#a49d92', paving: '#c9c1b2', verge: 0xc9c1b2, kerb: 0xddd6c8, fog: [160, 620], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): scooters, and black taxis.
export const TRAFFIC = { mix: [['vespa', 0.2]], taxis: 0.5, taxi: { type: 'taxi', colors: [0x141414] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): plaster and
// sandstone in cream, ochre and pale rose, the dark stone of the Gothic Quarter, green and brown
// shutters, iron balconies and flat roof terraces (area.json has roofs: flat).
export const LOOK = {
  walls: [
    ['#e8d6b4', false], ['#dcc39a', false], ['#efe2c8', false], ['#e3b994', false], ['#d4c0a0', false],
    ['#f2e9d8', false], ['#c9b08c', false], ['#e7cfae', false], ['#b8a588', false],
  ],
  bigWalls: ['#ddd0b5', '#cfc0a2', '#e8dfcc', '#c2b090', '#b0a088', '#d8c9ab'],
  roofs: [0xb0603f, 0xa4583a],
  doors: ['#4a2e1c', '#2e4a32', '#3b2a1e', '#5a3a22'],
  shutters: ['#3f6b45', '#6b4a2c', '#4f7a55', '#7a5a35'],
  stone: '#b8a988',
  flatRoof: 0xc9bea8,
  spires: false,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Plaça de Catalunya', x: -495, z: -740, side: 'r' },
  { name: 'La Boqueria', x: -328, z: -22, side: 'l' },
  { name: 'Liceu', x: -129, z: 144, side: 'l' },
  { name: 'Plaça Reial', x: 48, z: 213, side: 'r' },
  { name: 'Catedral', x: 152, z: -326, side: 'r' },
  { name: 'Plaça de Sant Jaume', x: 236, z: -146, side: 'r' },
  { name: 'Monument a Colom', x: 320, z: 808, side: 'r' },
  { name: 'Palau de la Música', x: 58, z: -810, side: 'r' },
  { name: 'Casa Batlló', x: -1022, z: -1383, side: 'l' },
  { name: 'La Pedrera', x: -1335, z: -1881, side: 'l' },
  { name: 'Sagrada Família', x: -35, z: -3035, side: 'r' },
  { name: 'Arc de Triomf', x: 612, z: -1307, side: 'r' },
  { name: 'Barceloneta', x: 1489, z: 158, side: 'l' },
  { name: 'Platja de la Barceloneta', x: 1959, z: 227, side: 'r' },
];
