// Amsterdam: everything the game needs to know about the city it is set in. A first, small map of
// the old centre of Amsterdam inside the Herengracht, from the Dam and the Royal Palace along the
// Singel to the Spui and back up the Rokin, with the Westerkerk and the Nieuwmarkt at the edges.
// Made like Lecce (see docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs amsterdam`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs amsterdam`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs amsterdam`
//   inside.js        the buildings you can go into: the Rijksmuseum, its rooms in inside/ (hand-written)
// No sights, monuments or fronts yet: empty lists for those, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
export { INSIDE } from './inside.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const SIGHTS = [], MONUMENTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'amsterdam';
export const NAME = { nl: 'Amsterdam', en: 'Amsterdam', fr: 'Amsterdam', es: 'Ámsterdam' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Amsterdam', tag: 'Exploreer of race te fiets, te voet of te paard langs de grachten!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Dam, Koninklijk Paleis en Spui. Leun achterover en geniet!' },
  en: { title: 'Instant Amsterdam', tag: 'Explore or race by bike, on foot or on horseback along the canals!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Dam, Royal Palace and Spui. Sit back and enjoy!' },
  fr: { title: 'Instant Amsterdam', tag: 'Explore ou fais la course à vélo, à pied ou à cheval le long des canaux !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Dam, Royal Palace et Spui. Installe-toi et profite !' },
  es: { title: 'Instant Amsterdam', tag: '¡Explora o corre en bici, a pie o a caballo junto a los canales!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Dam, Royal Palace y Spui. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#8f9192', fog: [160, 620] };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): dark brown and
// red brick canal houses, some plastered white or grey, black and dark green doors, steep tiled and
// slate roofs; old houses get their gables (area.json keeps them).
export const LOOK = {
  walls: [
    ['#5e2f22', true], ['#6e3626', true], ['#4f2a20', true], ['#7d4030', true], ['#8a4a35', true],
    ['#3e2a24', true], ['#efe9dc', false], ['#d9d3c6', false], ['#b9b2a5', false],
  ],
  roofs: [0x3d3f42, 0x4a3b33, 0x2f3134, 0x6a3a2a],
  doors: ['#1c1c1c', '#1f3d2e', '#5a1f1f', '#1d2f4a'],
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Dam', x: 179, z: -356, side: 'r' },
  { name: 'Koninklijk Paleis', x: 68, z: -370, side: 'l' },
  { name: 'Spui', x: -76, z: 252, side: 'l' },
  { name: 'Bloemenmarkt', x: 68, z: 529, side: 'l' },
  { name: 'Westerkerk', x: -569, z: -577, side: 'l' },
  { name: 'Muntplein', x: 255, z: 459, side: 'r' },
  { name: 'Centraal Station', x: 833, z: -1185, side: 'r' },
  { name: 'Nieuwmarkt', x: 833, z: -273, side: 'r' },
];
