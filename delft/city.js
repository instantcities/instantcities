// Delft: everything the game needs to know about the city it is set in. A first, small map of the
// old town of Delft, an oval of canals between The Hague and Rotterdam: the Markt with the Stadhuis
// and the Nieuwe Kerk, the Voldersgracht and the Vermeer Centrum, the Oude Kerk with its leaning
// tower, the Oude Delft past the Prinsenhof, and the Koornmarkt. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings, trees and canals: made from area.json by
//                    `node tools/osm_map.mjs delft`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs delft`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs delft`
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
export const ID = 'delft';
export const NAME = { nl: 'Delft', en: 'Delft', fr: 'Delft', es: 'Delft' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Delft', tag: 'Exploreer of race te fiets, te voet of te paard langs de grachten van Delft!', 'tour.welcomeSub': 'Een vlucht over de daken van de binnenstad, langs de Markt, de Nieuwe Kerk, het Vermeer Centrum, de Oude Kerk, het Prinsenhof en de Koornmarkt. Leun achterover en geniet!' },
  en: { title: 'Instant Delft', tag: 'Explore or race by bike, on foot or on horseback along the canals of Delft!', 'tour.welcomeSub': 'A flight over the roofs of the old town, past the Markt, the Nieuwe Kerk, the Vermeer Centrum, the Oude Kerk, the Prinsenhof and the Koornmarkt. Sit back and enjoy!' },
  fr: { title: 'Instant Delft', tag: 'Explore ou fais la course à vélo, à pied ou à cheval le long des canaux de Delft !', 'tour.welcomeSub': 'Un vol au-dessus des toits de la vieille ville, devant le Markt, la Nieuwe Kerk, le Vermeer Centrum, l’Oude Kerk, le Prinsenhof et le Koornmarkt. Installe-toi et profite !' },
  es: { title: 'Instant Delft', tag: '¡Explora o corre en bici, a pie o a caballo junto a los canales de Delft!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del casco antiguo, junto al Markt, la Nieuwe Kerk, el Vermeer Centrum, la Oude Kerk, el Prinsenhof y el Koornmarkt. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets: grey Dutch skies, now and then rain.
export const THEME = { ground: '#8f9192', fog: [160, 620], weathers: ['clear', 'rain'] };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): red and brown
// brick canal houses, some plastered white, cream or grey, black and dark green doors, red tiled
// and dark slate roofs; old houses get their gables (area.json keeps them).
export const LOOK = {
  walls: [
    ['#7a3a28', true], ['#8c4632', true], ['#6a3224', true], ['#9a5038', true], ['#5e2f22', true],
    ['#a35a40', true], ['#efe9dc', false], ['#e3dccb', false], ['#c9c2b4', false],
  ],
  roofs: [0x8c3f2a, 0x3d3f42, 0x7a3a28, 0x2f3134],
  doors: ['#1c1c1c', '#1f3d2e', '#5a1f1f', '#1d2f4a'],
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Markt', x: 126, z: -180, side: 'r' },
  { name: 'Nieuwe Kerk', x: 237, z: -249, side: 'r' },
  { name: 'Stadhuis', x: 29, z: -115, side: 'l' },
  { name: 'Vermeer Centrum', x: 86, z: -195, side: 'r' },
  { name: 'Oude Kerk', x: -190, z: -292, side: 'l' },
  { name: 'Prinsenhof', x: -283, z: -244, side: 'l' },
  { name: 'Oude Delft', x: -156, z: -55, side: 'l' },
  { name: 'Koornmarkt', x: 24, z: 83, side: 'r' },
  { name: 'Beestenmarkt', x: 195, z: 69, side: 'r' },
  { name: 'Oostpoort', x: 621, z: 377, side: 'r' },
  { name: 'Station', x: -122, z: 525, side: 'l' },
];
