// London: everything the game needs to know about the city it is set in. A first, small map of
// Westminster: from Trafalgar Square down Whitehall to Parliament Square, the Houses of Parliament
// and Westminster Abbey, and back along the Victoria Embankment, with the London Eye across the
// Thames. Made like Lecce (see docs/lecce-exercise.md), from OpenStreetMap only. The files in this
// folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs london`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs london`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs london`
//   inside.js        the buildings you can go into: the British Museum, its rooms in inside/ (hand-written)
//   elizabeth-tower.js the Elizabeth Tower (Big Ben), modelled by hand on core/js/arcade.js, in place of the map's pieces of it
// No sights or fronts yet, and one monument, the Elizabeth Tower: empty lists for the rest, and for
// what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
export { INSIDE } from './inside.js';
import { ELIZABETH_TOWER } from './elizabeth-tower.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const MONUMENTS = [...ELIZABETH_TOWER];
export const SIGHTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'london';
export const NAME = { nl: 'Londen', en: 'London', fr: 'Londres', es: 'Londres' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant London', tag: 'Exploreer of race te fiets, te voet of te paard door Westminster!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Horse Guards, Downing Street, Big Ben en Trafalgar Square. Leun achterover en geniet!' },
  en: { title: 'Instant London', tag: 'Explore or race by bike, on foot or on horseback through Westminster!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Horse Guards, Downing Street, Big Ben and Trafalgar Square. Sit back and enjoy!' },
  fr: { title: 'Instant London', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans Westminster !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Horse Guards, Downing Street, Big Ben et Trafalgar Square. Installe-toi et profite !' },
  es: { title: 'Instant London', tag: '¡Explora o corre en bici, a pie o a caballo por Westminster!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Horse Guards, Downing Street, Big Ben y Trafalgar Square. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#8f9193', fog: [150, 600], left: true };

// What drives here besides the usual cars (js/cars.js): red double-deckers among the traffic, and
// black cabs for taxis. Traffic keeps to the left (THEME.left).
export const TRAFFIC = { mix: [['double', 0.14]], taxi: { type: 'cab', colors: [0x141414, 0x141414, 0x141414, 0x1d2a3a] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): Portland stone
// for the ministries and the big buildings, London stock brick (yellow-grey) and red brick for the
// rest, slate roofs; traffic keeps to the left (THEME.left).
export const LOOK = {
  walls: [
    ['#b9a27a', true], ['#a8906a', true], ['#8c4a35', true], ['#9a5a40', true], ['#c4b08a', true],
    ['#efeadf', false], ['#e2dccd', false], ['#d6cfbf', false],
  ],
  bigWalls: ['#e6e0d2', '#ddd6c6', '#efeadf', '#d2cbbb', '#c9c2b2', '#e9e4d8'],
  roofs: [0x3d4248, 0x34383d, 0x4a4f55, 0x55504b],
  doors: ['#1c1c1c', '#1d2f4a', '#5a1f1f', '#1f3d2e'],
  stone: '#ddd6c4',
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Trafalgar Square', x: -267, z: -533, side: 'r' },
  { name: 'Big Ben', x: 36, z: 476, side: 'r' },
  { name: 'Westminster Abbey', x: -198, z: 669, side: 'l' },
  { name: 'Downing Street', x: -224, z: 103, side: 'l' },
  { name: 'Horse Guards', x: -189, z: -119, side: 'l' },
  { name: 'London Eye', x: 469, z: 116, side: 'r' },
  { name: 'Westminster Bridge', x: 270, z: 462, side: 'r' },
  { name: 'Charing Cross', x: 27, z: -533, side: 'r' },
];
