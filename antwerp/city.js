// Antwerp: everything the game needs to know about the city it is set in. A first, small map of the
// old town of Antwerp: the Grote Markt and its guild houses, Het Steen on the Scheldt, Groenplaats
// and the cathedral, out to the Meir and the Rubenshuis. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap, with every roof at its height in the Flemish height
// model (area.json: heights dhmv). The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs antwerp`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs antwerp`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs antwerp`
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
export const ID = 'antwerp';
export const NAME = { nl: 'Antwerpen', en: 'Antwerp', fr: 'Anvers', es: 'Amberes' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Antwerp', tag: 'Exploreer of race te fiets, te voet of te paard door het oude Antwerpen!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Grote Markt, Groenplaats en Onze-Lieve-Vrouwekathedraal. Leun achterover en geniet!' },
  en: { title: 'Instant Antwerp', tag: 'Explore or race by bike, on foot or on horseback through old Antwerp!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Grote Markt, Groenplaats and Cathedral of Our Lady. Sit back and enjoy!' },
  fr: { title: 'Instant Antwerp', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans le vieil Anvers !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Grote Markt, Groenplaats et Cathedral of Our Lady. Installe-toi et profite !' },
  es: { title: 'Instant Antwerp', tag: '¡Explora o corre en bici, a pie o a caballo por el viejo Amberes!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Grote Markt, Groenplaats y Cathedral of Our Lady. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#929497', fog: [160, 620] };

// No LOOK: the houses look like Ghent's (js/scenery.js), brick, whitewash and stepped gables,
// measured roof by roof with the Flemish height model.

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Grote Markt', x: 16, z: -179, side: 'l' },
  { name: 'Kathedraal', x: 173, z: -41, side: 'r' },
  { name: 'Het Steen', x: -202, z: -373, side: 'l' },
  { name: 'Groenplaats', x: 130, z: 139, side: 'r' },
  { name: 'Vleeshuis', x: -62, z: -442, side: 'r' },
  { name: 'Plantin-Moretus', x: -132, z: 235, side: 'l' },
  { name: 'Meir', x: 653, z: 208, side: 'r' },
  { name: 'Rubenshuis', x: 966, z: 346, side: 'r' },
];
