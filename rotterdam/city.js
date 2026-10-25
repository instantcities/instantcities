// Rotterdam: everything the game needs to know about the city it is set in. A first, small map of the
// middle of Rotterdam, on the Nieuwe Maas: the Coolsingel, the Blaak with the Markthal and Piet Blom's
// cube houses, the Oude Haven and the Witte Huis, the Laurenskerk, and the Leuvehaven down to the
// Erasmusbrug. The old centre burned out in the bombing of 14 May 1940, so most of what stands is
// post-war: brick, concrete and glass, with flat roofs (area.json has "roofs": "flat"). Made like Lecce
// (see docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings, trees, harbours and the river: made from area.json by
//                    `node tools/osm_map.mjs rotterdam`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs rotterdam`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs rotterdam`
// No sights, monuments or fronts yet: empty lists for those, and for what only Ghent has. Rotterdam is
// as flat as the map.
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
export const ID = 'rotterdam';
export const NAME = { nl: 'Rotterdam', en: 'Rotterdam', fr: 'Rotterdam', es: 'Róterdam' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Rotterdam', tag: 'Exploreer of race te fiets, te voet of te paard door Rotterdam, tussen de torens aan de Maas!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Plein 1940, het Witte Huis, de kubuswoningen, de Markthal en de Laurenskerk. Leun achterover en geniet!' },
  en: { title: 'Instant Rotterdam', tag: 'Explore or race by bike, on foot or on horseback through Rotterdam, among the towers on the Maas!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Plein 1940, the Witte Huis, the cube houses, the Markthal and the Laurenskerk. Sit back and enjoy!' },
  fr: { title: 'Instant Rotterdam', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans Rotterdam, entre les tours au bord de la Meuse !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant le Plein 1940, le Witte Huis, les maisons cubiques, le Markthal et la Laurenskerk. Installe-toi et profite !' },
  es: { title: 'Instant Rotterdam', tag: '¡Explora o corre en bici, a pie o a caballo por Róterdam, entre las torres junto al Mosa!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto al Plein 1940, el Witte Huis, las casas cubo, el Markthal y la Laurenskerk. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets: grey Dutch skies, and rain off the sea.
export const THEME = { ground: '#8f9192', fog: [180, 700], weathers: ['clear', 'rain'] };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): the brown and
// red brick of the rebuilt city, grey and white concrete, dark glass, black doors, flat roofs.
export const LOOK = {
  walls: [
    ['#7a4a35', true], ['#8c5a40', true], ['#5e3a2c', true], ['#9a6a4c', true], ['#6b5a50', true],
    ['#c9c6bf', false], ['#a9a7a2', false], ['#e8e6e0', false], ['#5f6870', false], ['#3f4a55', false],
  ],
  bigWalls: ['#a9a7a2', '#c9c6bf', '#5f6870', '#3f4a55', '#8c5a40', '#e8e6e0'],
  roofs: [0x3d3f42, 0x4a4b4d, 0x2f3134, 0x5a5650],
  doors: ['#1c1c1c', '#2a2f35', '#3a2a22', '#1d2f4a'],
  flatRoof: 0x6f706e,
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Stadhuis', x: -478, z: -423, side: 'l' },
  { name: 'Lijnbaan', x: -759, z: -25, side: 'l' },
  { name: 'Beursplein', x: -379, z: -160, side: 'l' },
  { name: 'Laurenskerk', x: 25, z: -297, side: 'r' },
  { name: 'Markthal', x: 150, z: -95, side: 'r' },
  { name: 'Kubuswoningen', x: 453, z: -121, side: 'r' },
  { name: 'Oude Haven', x: 607, z: 47, side: 'r' },
  { name: 'Witte Huis', x: 567, z: 82, side: 'l' },
  { name: 'Schielandshuis', x: -282, z: 65, side: 'l' },
  { name: 'Maritiem Museum', x: -210, z: 257, side: 'l' },
  { name: 'Plein 1940', x: -105, z: 473, side: 'r' },
  { name: 'Erasmusbrug', x: 43, z: 1341, side: 'r' },
];
