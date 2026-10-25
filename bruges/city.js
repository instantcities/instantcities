// Bruges: everything the game needs to know about the city it is set in. A first, small map of the
// middle of Bruges: the Markt and its Belfry, the Burg, the Rozenhoedkaai and the Dijver along the
// canals, the Church of Our Lady and the Begijnhof. Made like Lecce (see docs/lecce-exercise.md),
// from OpenStreetMap, with every roof at its height in the Flemish height model (area.json: heights
// dhmv). The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs bruges`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs bruges`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs bruges`
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
export const ID = 'bruges';
export const NAME = { nl: 'Brugge', en: 'Bruges', fr: 'Bruges', es: 'Brujas' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Bruges', tag: 'Exploreer of race te fiets, te voet of te paard langs de reien van Brugge!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Belfort, Rozenhoedkaai, Gruuthuse en Onze-Lieve-Vrouwekerk. Leun achterover en geniet!' },
  en: { title: 'Instant Bruges', tag: 'Explore or race by bike, on foot or on horseback along the canals of Bruges!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Belfort, Rozenhoedkaai, Gruuthuse and Church of Our Lady. Sit back and enjoy!' },
  fr: { title: 'Instant Bruges', tag: 'Explore ou fais la course à vélo, à pied ou à cheval le long des canaux de Bruges !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Belfort, Rozenhoedkaai, Gruuthuse et Church of Our Lady. Installe-toi et profite !' },
  es: { title: 'Instant Bruges', tag: '¡Explora o corre en bici, a pie o a caballo junto a los canales de Brujas!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Belfort, Rozenhoedkaai, Gruuthuse y Church of Our Lady. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#929497', fog: [160, 620] };

// No LOOK: the houses look like Ghent's (js/scenery.js), dark brick and stepped gables, which fit
// Bruges as well (area.json measures every roof with the Flemish height model).

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Markt', x: -44, z: -306, side: 'l' },
  { name: 'Belfort', x: 0, z: -251, side: 'r' },
  { name: 'Burg', x: 217, z: -223, side: 'r' },
  { name: 'Rozenhoedkaai', x: 244, z: 12, side: 'r' },
  { name: 'Onze-Lieve-Vrouwekerk', x: -18, z: 275, side: 'l' },
  { name: 'Gruuthuse', x: 61, z: 178, side: 'r' },
  { name: 'Sint-Salvatorskathedraal', x: -236, z: 164, side: 'l' },
  { name: 'Begijnhof', x: -105, z: 717, side: 'l' },
  { name: 'Minnewater', x: 113, z: 786, side: 'r' },
  { name: '’t Zand', x: -672, z: 233, side: 'l' },
];
