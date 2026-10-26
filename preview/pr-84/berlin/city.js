// Berlin: everything the game needs to know about the city it is set in. A first, small map of the
// middle of Berlin: the Brandenburg Gate and the Reichstag, Unter den Linden, the Gendarmenmarkt
// and the Holocaust Memorial, out to Museum Island and the TV tower. Made like Lecce (see
// docs/lecce-exercise.md), from OpenStreetMap only. The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   tour.js          the tour: a flight along the race route (made from map.js once, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs berlin`, do not edit by hand
//   crossings.js     the traffic lights and crossings: `node tools/crossings.mjs berlin`, do not edit by hand
//   furniture.js     the bollards, post boxes, benches and bins: `node tools/furniture.mjs berlin`
//   inside.js        the buildings you can go into: the Neues Museum and the Pergamon Museum, their rooms in inside/ (hand-written)
//   tor.js           the Brandenburger Tor, modelled by hand on core/js/arcade.js, in place of the map's pieces of it
//   fernsehturm.js   the Fernsehturm, modelled by hand in place of the map's stack of prisms of it
// No sights or fronts yet: empty lists for those, and for what only Ghent has.
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { FURNITURE } from './furniture.js';
export { INSIDE } from './inside.js';
import { TOR } from './tor.js';
import { FERNSEHTURM } from './fernsehturm.js';

export { SITE_SIGHTS } from './site-sights.js'; // the cards from the site's landmark pages (tools/landmarks.mjs)
export const MONUMENTS = [...TOR, ...FERNSEHTURM];
export const SIGHTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the city's folder, and its name
export const ID = 'berlin';
export const NAME = { nl: 'Berlijn', en: 'Berlin', fr: 'Berlin', es: 'Berlín' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Berlin', tag: 'Exploreer of race te fiets, te voet of te paard door het hart van Berlijn!', 'tour.welcomeSub': 'Een vlucht over de daken van het centrum, langs Unter den Linden, Gendarmenmarkt en Holocaustmonument. Leun achterover en geniet!' },
  en: { title: 'Instant Berlin', tag: 'Explore or race by bike, on foot or on horseback through the heart of Berlin!', 'tour.welcomeSub': 'A flight over the roofs of the centre, past Unter den Linden, Gendarmenmarkt and Holocaust Memorial. Sit back and enjoy!' },
  fr: { title: 'Instant Berlin', tag: 'Explore ou fais la course à vélo, à pied ou à cheval au cœur de Berlin !', 'tour.welcomeSub': 'Un vol au-dessus des toits du centre, devant Unter den Linden, Gendarmenmarkt et Holocaust Memorial. Installe-toi et profite !' },
  es: { title: 'Instant Berlin', tag: '¡Explora o corre en bici, a pie o a caballo por el corazón de Berlín!', 'tour.welcomeSub': 'Un vuelo sobre los tejados del centro, junto a Unter den Linden, Gendarmenmarkt y Holocaust Memorial. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the city gets.
export const THEME = { ground: '#929497', fog: [170, 660] };

// What drives here besides the usual cars (js/cars.js): the odd Trabant, and cream-coloured taxis.
export const TRAFFIC = { mix: [['trabant', 0.12]], taxis: 0.6, taxi: { type: 'taxi', colors: [0xf2ead3] } };

// How the houses look (js/scenery.js; Ghent's brick and slate when a city has none): sandstone,
// grey and cream plaster and stone, big blocks, grey and copper-green roofs.
export const LOOK = {
  walls: [
    ['#e6dcc4', false], ['#d8cdb5', false], ['#c9c3b8', false], ['#efe7d6', false], ['#b8b0a2', false],
    ['#d4c39c', false], ['#a9a397', false], ['#e9e1cf', false],
  ],
  bigWalls: ['#e2ddd2', '#d8d2c6', '#c9c3b8', '#b8b0a2', '#d4c39c', '#a9a397'],
  roofs: [0x5e666e, 0x4a4f55, 0x5f8a78, 0x6f7780],
  doors: ['#2b2b2b', '#1d2f4a', '#3b2a1e'],
};

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Brandenburger Tor', x: -659, z: -199, side: 'l' },
  { name: 'Reichstag', x: -786, z: -517, side: 'l' },
  { name: 'Unter den Linden', x: 213, z: -296, side: 'r' },
  { name: 'Gendarmenmarkt', x: 611, z: 160, side: 'r' },
  { name: 'Holocaust-Mahnmal', x: -574, z: 132, side: 'l' },
  { name: 'Bebelplatz', x: 721, z: -227, side: 'r' },
  { name: 'Museumsinsel', x: 1111, z: -628, side: 'r' },
  { name: 'Berliner Dom', x: 1314, z: -586, side: 'r' },
  { name: 'Fernsehturm', x: 2025, z: -821, side: 'r' },
];
