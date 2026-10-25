// Copenhagen: everything the game needs to know about the city it is set in. A first, small map of
// the middle of Copenhagen: Kongens Nytorv and Nyhavn, Børsen and Christiansborg on Slotsholmen,
// the City Hall Square and the Strøget, with Amalienborg and Tivoli at the edges. Made like Lecce
// (see docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs copenhagen`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs copenhagen`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs copenhagen`
//   rundetaarn.js    the Rundetårn, modelled by hand on core/js/arcade.js, in place of the map's pieces of it
// No sights or fronts yet, and one monument, the Rundetårn: empty lists for the rest, and for what
// only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
import { RUNDETAARN } from './rundetaarn.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const MONUMENTS = [...RUNDETAARN];
export const SIGHTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'copenhagen';
export const NAME = { nl: 'Kopenhagen', en: 'Copenhagen', fr: 'Copenhague', es: 'Copenhague' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Copenhagen', tag: 'Exploreer of race te fiets, te voet of te paard door Kopenhagen, de fietsstad!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Nyhavn, Børsen, Christiansborg en Amagertorv. Leun achterover en geniet!' },
  en: { title: 'Instant Copenhagen', tag: 'Explore or race by bike, on foot or on horseback through Copenhagen, the city of bikes!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Nyhavn, Børsen, Christiansborg and Amagertorv. Sit back and enjoy!' },
  fr: { title: 'Instant Copenhagen', tag: 'Explore ou fais la course à vélo, à pied ou à cheval dans Copenhague, la ville du vélo !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Nyhavn, Børsen, Christiansborg et Amagertorv. Installe-toi et profite !' },
  es: { title: 'Instant Copenhagen', tag: '¡Explora o corre en bici, a pie o a caballo por Copenhague, la ciudad de las bicis!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Nyhavn, Børsen, Christiansborg y Amagertorv. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#929497', fog: [160, 620] };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): plaster in
// Nyhavn’s yellow, red, blue and ochre, some red brick, red tiled and copper-green roofs.
export const LOOK = {
  walls: [
    ['#e8c25a', false], ['#c45a3c', false], ['#6f8fae', false], ['#e39a4a', false], ['#efe6cf', false],
    ['#9c3a2a', true], ['#d9cdb0', false], ['#b8463a', false], ['#f2e3b0', false], ['#8a3a2a', true],
  ],
  bigWalls: ['#e6dcc4', '#d8cdb5', '#b8463a', '#efe7d6', '#c9bea4', '#9c3a2a'],
  roofs: [0xa9583a, 0x9c4f33, 0x5f8a78, 0x3d4248],
  doors: ['#1f3d2e', '#2b2b2b', '#5a1f1f', '#1d2f4a'],
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Nyhavn', x: 693, z: -258, side: 'r' },
  { name: 'Kongens Nytorv', x: 355, z: -216, side: 'l' },
  { name: 'Christiansborg', x: -92, z: 254, side: 'l' },
  { name: 'Børsen', x: 159, z: 309, side: 'r' },
  { name: 'Rundetaarn', x: -429, z: -465, side: 'l' },
  { name: 'Amagertorv', x: -170, z: -92, side: 'l' },
  { name: 'Rådhuspladsen', x: -963, z: 309, side: 'l' },
  { name: 'Tivoli', x: -1026, z: 586, side: 'l' },
  { name: 'Amalienborg', x: 928, z: -838, side: 'r' },
];
