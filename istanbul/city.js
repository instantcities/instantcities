// Istanbul: everything the game needs to know about the city it is set in. A first, small map of the
// historic peninsula: Sultanahmet with the Hagia Sophia, the Blue Mosque and the Hippodrome, the
// Basilica Cistern, the gates of Topkapı Palace and Gülhane Park, the Divan Yolu up to the Column of
// Constantine and the Grand Bazaar, and down the hill to Sirkeci, Eminönü, the New Mosque, the Spice
// Bazaar and the foot of the Galata Bridge on the Golden Horn. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings, trees and the sea: made from area.json by
//                    `node tools/osm_map.mjs istanbul`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs istanbul`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs istanbul`
// No sights, monuments or fronts yet: empty lists for those, and for what only Ghent has. The mosques
// are the map's blocks, without their domes and minarets.
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
export const ID = 'istanbul';
export const NAME = { nl: 'Istanbul', en: 'Istanbul', fr: 'Istanbul', es: 'Estambul' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Istanbul', tag: 'Exploreer of race te fiets, te voet of te paard tussen de moskeeën en bazaars van Istanbul!', 'tour.welcomeSub': 'Een vlucht over de daken van het oude schiereiland, langs de Hagia Sophia, de Divan Yolu, de Grote Bazaar, Sirkeci, het Gülhanepark en het Topkapıpaleis. Leun achterover en geniet!' },
  en: { title: 'Instant Istanbul', tag: 'Explore or race by bike, on foot or on horseback between the mosques and bazaars of Istanbul!', 'tour.welcomeSub': 'A flight over the roofs of the old peninsula, past the Hagia Sophia, the Divan Yolu, the Grand Bazaar, Sirkeci, Gülhane Park and Topkapı Palace. Sit back and enjoy!' },
  fr: { title: 'Instant Istanbul', tag: 'Explore ou fais la course à vélo, à pied ou à cheval entre les mosquées et les bazars d’Istanbul !', 'tour.welcomeSub': 'Un vol au-dessus des toits de la vieille péninsule, devant Sainte-Sophie, le Divan Yolu, le Grand Bazar, Sirkeci, le parc de Gülhane et le palais de Topkapı. Installe-toi et profite !' },
  es: { title: 'Instant Estambul', tag: '¡Explora o corre en bici, a pie o a caballo entre las mezquitas y los bazares de Estambul!', 'tour.welcomeSub': 'Un vuelo sobre los tejados de la vieja península, junto a Santa Sofía, el Divan Yolu, el Gran Bazar, Sirkeci, el parque Gülhane y el palacio de Topkapı. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets: sun, and now and then rain.
export const THEME = { ground: '#a49a8a', paving: '#c8bca6', verge: 0xc8bca6, kerb: 0xddd2bd, fog: [180, 700], weathers: ['clear', 'rain'] };

// What drives here besides the usual cars (js/cars.js): Istanbul's yellow taxis, everywhere, and
// scooters weaving between them.
export const TRAFFIC = { mix: [['vespa', 0.15]], taxis: 0.7, taxi: { type: 'taxi', colors: [0xf2c200] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): Ottoman
// houses plastered in ochre, salmon pink, cream and dusty red, a few of them in dark wood, brown
// and green shutters, roofs of red tiles; the big stone buildings in pale limestone, and now and
// then a roof in the lead grey of the mosques' domes.
export const LOOK = {
  walls: [
    ['#e3b46c', false], ['#e7a894', false], ['#f1e2c0', false], ['#c9765a', false], ['#efd08f', false],
    ['#d99a7a', false], ['#f4ead6', false], ['#b25a45', false], ['#8a5a3c', false], ['#e8c9a8', false],
  ],
  bigWalls: ['#e2d8c4', '#d6cab2', '#ece4d2', '#cdbd9e', '#d9cdb5', '#bfb3a0'],
  roofs: [0xa9553a, 0x9c4c33, 0xb4603f, 0x8e472f, 0x8d9296],
  doors: ['#4a2e1c', '#2e4a3a', '#5a3a22', '#3a3a3a', '#6b3a28'],
  shutters: ['#6b4a2c', '#3f6b45', '#5a3a22', '#4f6a5a'],
  stone: '#d8ccb4',
  flatRoof: 0xc8baa0,
  water: 0x3e7390, // the Golden Horn and the Bosphorus, bluer than the canals' green
  spires: false,
  houseBlocks: true,
  style: 'italian', // the plastered house fronts of js/italian.js
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Ayasofya', x: 412, z: 361, side: 'r' },
  { name: 'Sultanahmet Camii', x: 61, z: 795, side: 'r' },
  { name: 'At Meydanı', x: -106, z: 726, side: 'l' },
  { name: 'Yerebatan Sarnıcı', x: 172, z: 388, side: 'l' },
  { name: 'Topkapı Sarayı', x: 750, z: -38, side: 'l' },
  { name: 'Gülhane Parkı', x: 555, z: -250, side: 'r' },
  { name: 'Çemberlitaş', x: -509, z: 370, side: 'l' },
  { name: 'Kapalıçarşı', x: -849, z: 74, side: 'r' },
  { name: 'Sirkeci', x: 82, z: -536, side: 'r' },
  { name: 'Mısır Çarşısı', x: -590, z: -742, side: 'l' },
  { name: 'Yeni Cami', x: -510, z: -794, side: 'r' },
  { name: 'Galata Köprüsü', x: -420, z: -990, side: 'l' },
];
