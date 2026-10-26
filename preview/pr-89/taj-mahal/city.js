// Taj Mahal: everything the game needs to know about the site it is set in. The Taj Mahal and its
// garden in Agra, India: the great gate, the charbagh with its canals and pools, the tomb on its
// platform with the four minarets, and the mosque and the Jawab on either side. A site, not a
// city: the map is the complex's own piece of OpenStreetMap, with its garden walks drawn in by hand
// (`streets` in area.json), and the buildings are modelled by hand. The files in this folder:
//   city.js          this file: the look and its named places, and the rest gathered up
//   races.js         the race route             (hand-written)
//   tour.js          the tour: a flight over the garden to the tomb (hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap, and the garden walks
//   taj.js           the tomb with its dome and minarets, on its plinth and the terrace, modelled by hand
//   mosque.js        the mosque and the Jawab either side of it
//   gate.js          the great gate, Darwaza-i-Rauza
//   garden.js        the garden's wall and its pavilions
//   forecourt.js     the two halls of the forecourt south of the gate, in place of the map's blocks
//   map.js           the streets, buildings and trees: made from area.json by
//                    `node tools/osm_map.mjs taj-mahal`, do not edit by hand
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
import { TAJ } from './taj.js';
import { MOSQUES } from './mosque.js';
import { GATE } from './gate.js';
import { GARDEN } from './garden.js';
import { FORECOURT } from './forecourt.js';

export const MONUMENTS = [...TAJ, ...MOSQUES, ...GATE, ...GARDEN, ...FORECOURT];
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {};
export const PARKED_BIKES = false; // no bikes parked along the walks
export const MAP_TREES = 'poplar'; // the garden's trees are cypresses
export const SIGHTS = [], FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the site's folder, and its name
export const ID = 'taj-mahal';
export const NAME = { nl: 'Taj Mahal', en: 'Taj Mahal', fr: 'Taj Mahal', es: 'Taj Mahal' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Taj Mahal', tag: 'Wandel of race door de tuinen van de Taj Mahal, tot aan de witte marmeren tombe.', 'tour.welcomeSub': 'Een vlucht over de tuin, langs de kanalen naar de tombe en haar vier minaretten. Leun achterover en geniet!' },
  en: { title: 'Instant Taj Mahal', tag: 'Walk or race through the gardens of the Taj Mahal, up to the white marble tomb.', 'tour.welcomeSub': 'A flight over the garden, along the canals to the tomb and its four minarets. Sit back and enjoy!' },
  fr: { title: 'Instant Taj Mahal', tag: 'Promène-toi ou fais la course dans les jardins du Taj Mahal, jusqu’au tombeau de marbre blanc.', 'tour.welcomeSub': 'Un vol au-dessus du jardin, le long des canaux jusqu’au tombeau et à ses quatre minarets. Installe-toi et profite !' },
  es: { title: 'Instant Taj Mahal', tag: 'Pasea o corre por los jardines del Taj Mahal, hasta la tumba de mármol blanco.', 'tour.welcomeSub': 'Un vuelo sobre el jardín, por los canales hasta la tumba y sus cuatro minaretes. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the site gets.
export const THEME = { ground: '#b5a27a', paving: '#d8c8a8', verge: 0xd8c8a8, kerb: 0xe8dcc2, fog: [220, 900], weathers: ['clear'] };

// How the houses around it look: low plastered houses in sand, pink and cream with flat roofs.
export const LOOK = {
  walls: [
    ['#d9c19a', false], ['#e0b8a0', false], ['#cdb48c', false], ['#e8d4b0', false], ['#c9a384', false],
    ['#d8b890', false], ['#efe0c0', false], ['#d2a98c', false],
  ],
  bigWalls: ['#e0b090', '#d8a888', '#e8c8a0', '#cba07c'],
  roofs: [0xb08a60, 0xa57a52],
  doors: ['#4a2e1c', '#2e4a5a', '#5a3a22'],
  shutters: ['#3f6b6b', '#6b4a2c'],
  stone: '#d8a888',
  flatRoof: 0xc0a98a,
  spires: false,
  houseBlocks: true,
};

// Places named on the big map when riding about freely: click a name to teleport there.
export const PLACES = [
  { name: 'The great gate', x: -91, z: 196, side: 'r' },
  { name: 'The long canal', x: -91, z: 0, side: 'r' },
  { name: 'The tomb', x: -91, z: -254, side: 'r' },
  { name: 'The mosque', x: -264, z: -254, side: 'l' },
  { name: 'The Jawab', x: 82, z: -254, side: 'r' },
];
