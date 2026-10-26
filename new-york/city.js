// New York: everything the game needs to know about the city it is set in. A first, small map of
// Midtown Manhattan round 42nd Street: Times Square, Bryant Park and the Public Library, Grand Central
// and the Chrysler Building, the Empire State Building on 34th Street and Rockefeller Center up to
// 50th Street. Made like Lecce (see docs/lecce-exercise.md), from OpenStreetMap only. The files in
// this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings, trees and parks: made from area.json by
//                    `node tools/osm_map.mjs new-york`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs new-york`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs new-york`
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
export const ID = 'new-york';
export const NAME = { nl: 'New York', en: 'New York', fr: 'New York', es: 'Nueva York' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant New York', tag: 'Exploreer of race te fiets, te voet of te paard tussen de wolkenkrabbers van Manhattan!', 'tour.welcomeSub': 'Een vlucht tussen de torens van Midtown, langs Times Square, de Empire State Building, de bibliotheek aan Bryant Park, Grand Central, de Chrysler Building en Rockefeller Center. Leun achterover en geniet!' },
  en: { title: 'Instant New York', tag: 'Explore or race by bike, on foot or on horseback among the skyscrapers of Manhattan!', 'tour.welcomeSub': 'A flight among the towers of Midtown, past Times Square, the Empire State Building, the library on Bryant Park, Grand Central, the Chrysler Building and Rockefeller Center. Sit back and enjoy!' },
  fr: { title: 'Instant New York', tag: 'Explore ou fais la course à vélo, à pied ou à cheval entre les gratte-ciel de Manhattan !', 'tour.welcomeSub': 'Un vol entre les tours de Midtown, devant Times Square, l’Empire State Building, la bibliothèque de Bryant Park, Grand Central, le Chrysler Building et le Rockefeller Center. Installe-toi et profite !' },
  es: { title: 'Instant New York', tag: '¡Explora o corre en bici, a pie o a caballo entre los rascacielos de Manhattan!', 'tour.welcomeSub': 'Un vuelo entre las torres de Midtown, junto a Times Square, el Empire State Building, la biblioteca de Bryant Park, Grand Central, el Chrysler Building y el Rockefeller Center. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets: hot clear summers, rain, and snow in winter. Traffic keeps right.
export const THEME = { ground: '#8e8f90', paving: '#b9b8b3', verge: 0xb9b8b3, kerb: 0xcfcdc6, fog: [200, 760], weathers: ['clear', 'rain', 'snow'] };

// The yellow cabs: in Midtown three cars in four are taxis.
export const TRAFFIC = { taxis: 1, taxi: { type: 'taxi', colors: [0xf7b500] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): brownstone and
// red brick for the walk-ups, Indiana limestone and grey granite for the old office blocks, dark glass
// and steel for the new towers; dark doors and flat, tarred roofs. The towers OSM gives a height are
// drawn in stone (LOOK.stone, a pale limestone) without a spire on top: the Empire State's mast and the
// Chrysler's crown are building parts of their own.
export const LOOK = {
  walls: [
    ['#6e4a3a', true], ['#7d5444', true], ['#5c3b2f', true], ['#8a4a35', true], ['#9a5a42', true],
    ['#c9c2b2', false], ['#b3ad9f', false], ['#d8d2c4', false], ['#4f5a64', false], ['#36414b', false],
  ],
  bigWalls: ['#c9c2b2', '#b3ad9f', '#8f8a80', '#4f5a64', '#36414b', '#6e4a3a', '#d8d2c4'],
  roofs: [0x2f3134, 0x3d3f42, 0x45474a, 0x2a2b2d],
  doors: ['#1c1c1c', '#2a2f35', '#3a2a22', '#4a3a2a'],
  flatRoof: 0x58595a,
  stone: '#bdb6a8',
  spires: false,
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Times Square', x: -399, z: -489, side: 'l' },
  { name: 'Bryant Park', x: -183, z: 92, side: 'l' },
  { name: 'Public Library', x: -57, z: 160, side: 'r' },
  { name: 'Grand Central', x: 421, z: 260, side: 'r' },
  { name: 'Chrysler Building', x: 674, z: 408, side: 'r' },
  { name: 'Empire State Building', x: -456, z: 821, side: 'l' },
  { name: 'Herald Square', x: -643, z: 575, side: 'l' },
  { name: 'Morgan Library', x: 26, z: 717, side: 'r' },
  { name: 'Rockefeller Center', x: 307, z: -606, side: 'r' },
  { name: 'St. Patrick’s Cathedral', x: 597, z: -554, side: 'r' },
  { name: 'Radio City', x: 266, z: -731, side: 'l' },
  { name: 'Diamond District', x: 132, z: -415, side: 'l' },
];
