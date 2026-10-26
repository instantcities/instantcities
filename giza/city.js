// Giza: everything the game needs to know about the site it is set in. The pyramid fields on the
// plateau west of Cairo, in Egypt: the three great pyramids and the queens' pyramids, the Great
// Sphinx and its temple, the tombs round them and, below the plateau to the east, the edge of the
// town. A site, not a city: the map is the piece of OpenStreetMap round it, with the roads over the
// plateau drawn in by hand (`streets` in area.json), and the monuments are modelled by hand. The
// files in this folder:
//   city.js          this file: the look and its named places, and the rest gathered up
//   races.js         the race route             (hand-written)
//   tour.js          the tour: a flight over the plateau (hand-written)
//   quests.js        the quests and their words (hand-written)
//   sights.js        the sights: the cards that tell you what you are looking at
//   area.json        what to download from OpenStreetMap, and the roads
//   map.js           the roads, the town's houses and the tombs: made from area.json by
//                    `node tools/osm_map.mjs giza`, do not edit by hand
//   frame.js         latitude and longitude to the map's metres
//   pyramids.js      the six pyramids, modelled by hand
//   sphinx.js        the Sphinx and its temple
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';
import { PYRAMIDS } from './pyramids.js';
import { SPHINX } from './sphinx.js';
import { game } from './frame.js';

export const MONUMENTS = [...PYRAMIDS, ...SPHINX];
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {};
export const STREET_FURNITURE = false; // no street lamps, benches or bins
export const NO_TREES = true; // desert, not a tree on the plateau
export const PARKED_BIKES = false;
export const FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the site's folder, and its name
export const ID = 'giza';
export const NAME = { nl: 'Gizeh', en: 'Giza', fr: 'Gizeh', es: 'Guiza' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Gizeh', tag: 'Wandel of race over het plateau van Gizeh, langs de piramides en de Sfinx.', 'tour.welcomeSub': 'Een vlucht over het plateau, langs de drie grote piramides en de Sfinx. Leun achterover en geniet!' },
  en: { title: 'Instant Giza', tag: 'Walk or race over the Giza plateau, past the pyramids and the Sphinx.', 'tour.welcomeSub': 'A flight over the plateau, past the three great pyramids and the Sphinx. Sit back and enjoy!' },
  fr: { title: 'Instant Gizeh', tag: 'Promène-toi ou fais la course sur le plateau de Gizeh, devant les pyramides et le Sphinx.', 'tour.welcomeSub': 'Un vol au-dessus du plateau, devant les trois grandes pyramides et le Sphinx. Installe-toi et profite !' },
  es: { title: 'Instant Guiza', tag: 'Pasea o corre por la meseta de Guiza, junto a las pirámides y la Esfinge.', 'tour.welcomeSub': 'Un vuelo sobre la meseta, junto a las tres grandes pirámides y la Esfinge. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the site gets: sand and limestone, a hazy long view.
export const THEME = { ground: '#d8c18c', paving: '#cfc09a', verge: 0xcfc09a, kerb: 0xdbcda8, fog: [500, 3200], weathers: ['clear'] };

// The few houses at the edge of the town: flat-roofed, in sand and cream.
export const LOOK = {
  walls: [['#d9c9a4', false], ['#cdb98f', false], ['#e2d5b4', false], ['#c4ae84', false], ['#d4b896', false]],
  bigWalls: ['#d0bf9a', '#c9b48a'],
  roofs: [0xb9a47c, 0xc4b08a],
  doors: ['#4a3a2a', '#2e4a5a'],
  shutters: ['#5a4a3a'],
  stone: '#c6ad7c',
  flatRoof: 0xc2b08a,
  spires: false,
  houseBlocks: true,
  grass: '#d3bb84', // the open ground is sand
};

// Places named on the big map when riding about freely: click a name to teleport there.
const place = (name, lat, lon, side) => ({ name, x: game(lat, lon)[0], z: game(lat, lon)[1], side });
export const PLACES = [
  place('The Great Pyramid', 29.97917, 31.13417, 'r'),
  place('Pyramid of Khafre', 29.97611, 31.13083, 'l'),
  place('Pyramid of Menkaure', 29.97194, 31.12833, 'l'),
  place('The Sphinx', 29.97530, 31.13760, 'r'),
];
