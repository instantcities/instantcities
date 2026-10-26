// Avignon: everything the game needs to know about the city it is set in. A first, small map of the
// walled town of Avignon: the Palais des Papes and the cathedral on the Rocher des Doms, the Place
// de l’Horloge, the Pont Saint-Bénezet on the Rhône and the Rue de la République. Made like Lecce
// (see docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs avignon`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs avignon`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs avignon`
// No sights, monuments or fronts yet: empty lists for those, and for what only Ghent has.
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
export const ID = 'avignon';
export const NAME = { nl: 'Avignon', en: 'Avignon', fr: 'Avignon', es: 'Aviñón' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Avignon', tag: 'Exploreer of race te fiets, te voet of te paard door de stad van de pausen!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Pausenpaleis, Place de l’Horloge en Rue de la République. Leun achterover en geniet!' },
  en: { title: 'Instant Avignon', tag: 'Explore or race by bike, on foot or on horseback through the city of the popes!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Palais des Papes, Place de l’Horloge and Rue de la République. Sit back and enjoy!' },
  fr: { title: 'Instant Avignon', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans la cité des papes !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Palais des Papes, Place de l’Horloge et Rue de la République. Installe-toi et profite !' },
  es: { title: 'Instant Avignon', tag: '¡Explora o corre en bici, a pie o a caballo por la ciudad de los papas!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Palais des Papes, Place de l’Horloge y Rue de la République. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#a8a090', paving: '#d2c7ae', verge: 0xd2c7ae, kerb: 0xe2d9c4, fog: [160, 620], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): Citroën 2CVs and scooters.
export const TRAFFIC = { mix: [['deuxcv', 0.1], ['vespa', 0.12]], taxis: 0.4 };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): Provençal
// limestone in honey and cream, plaster in pale ochre, shutters in Provence blue, green and grey,
// and roofs of curved terracotta tiles.
export const LOOK = {
  walls: [
    ['#e6d3a8', false], ['#ecdcb8', false], ['#dcc597', false], ['#f2e8d2', false], ['#e9c99a', false],
    ['#d8bf94', false], ['#efe2c4', false], ['#e2c9a2', false],
  ],
  bigWalls: ['#d9c49a', '#cfb98e', '#e4d3ae', '#c9b084', '#ddc9a2', '#d4bf96'],
  roofs: [0xb0603f, 0xa4583a, 0xbf7552],
  doors: ['#5a3a22', '#3f5e6e', '#6b4a2c', '#4a6a5a'],
  shutters: ['#7f9fb0', '#8fae9a', '#a9b0ad', '#6f8f9f'],
  stone: '#d9c49a',
  flatRoof: 0xcfc2a8,
  spires: false,
  houseBlocks: true,
  style: 'italian', // the house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Palais des Papes', x: 304, z: -517, side: 'r' },
  { name: 'Place de l’Horloge', x: 134, z: -310, side: 'l' },
  { name: 'Pont Saint-Bénezet', x: 44, z: -946, side: 'l' },
  { name: 'Rocher des Doms', x: 264, z: -821, side: 'r' },
  { name: 'Notre-Dame des Doms', x: 314, z: -642, side: 'r' },
  { name: 'Hôtel de Ville', x: 94, z: -282, side: 'l' },
  { name: 'Les Halles', x: 415, z: -75, side: 'r' },
  { name: 'Rue de la République', x: 144, z: 146, side: 'l' },
  { name: 'Musée Calvet', x: -156, z: 354, side: 'l' },
];
