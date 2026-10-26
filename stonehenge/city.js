// Stonehenge: everything the game needs to know about the site it is set in. The stone circle on
// Salisbury Plain in Wiltshire, England, begun about 3000 BC: the sarsen circle and the horseshoe of
// trilithons, the bluestones, the Heel Stone out on the axis to the midsummer sunrise, the bank and
// ditch round them, and the Avenue running north-east. A site, not a city: the map is the piece of
// OpenStreetMap round it, with the walks drawn in by hand (`streets` in area.json), and the stones
// are modelled by hand. The files in this folder:
//   city.js          this file: the look and its named places, and the rest gathered up
//   races.js         the race route             (hand-written)
//   tour.js          the tour: a flight round the stones and out along the Avenue (hand-written)
//   quests.js        the quests and their words (hand-written)
//   sights.js        the sights: the cards that tell you what you are looking at
//   area.json        what to download from OpenStreetMap, and the walks
//   map.js           the paths, the fields and the trees: made from area.json by
//                    `node tools/osm_map.mjs stonehenge`, do not edit by hand
//   frame.js         latitude and longitude, or metres from the middle of the circle, to the map's metres
//   stones.js        the stones, the Aubrey holes, the bank and the ditch, modelled by hand
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';
import { STONEHENGE } from './stones.js';
import { at } from './frame.js';

export const MONUMENTS = [...STONEHENGE];
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {};
export const STREET_FURNITURE = false; // no street lamps, benches or bins
export const NO_TREES = true; // open chalk downland, not a tree in sight
export const PARKED_BIKES = false;
export const FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the site's folder, and its name
export const ID = 'stonehenge';
export const NAME = { nl: 'Stonehenge', en: 'Stonehenge', fr: 'Stonehenge', es: 'Stonehenge' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Stonehenge', tag: 'Wandel of race rond de stenen van Stonehenge, op de vlakte van Salisbury.', 'tour.welcomeSub': 'Een vlucht rond de steencirkel en langs de Avenue, met de zon laag boven de vlakte. Leun achterover en geniet!' },
  en: { title: 'Instant Stonehenge', tag: 'Walk or race round the stones of Stonehenge, on Salisbury Plain.', 'tour.welcomeSub': 'A flight round the stone circle and out along the Avenue, with the sun low over the plain. Sit back and enjoy!' },
  fr: { title: 'Instant Stonehenge', tag: 'Promène-toi ou fais la course autour des pierres de Stonehenge, sur la plaine de Salisbury.', 'tour.welcomeSub': 'Un vol autour du cercle de pierres et le long de l’Avenue, le soleil bas sur la plaine. Installe-toi et profite !' },
  es: { title: 'Instant Stonehenge', tag: 'Pasea o corre alrededor de las piedras de Stonehenge, en la llanura de Salisbury.', 'tour.welcomeSub': 'Un vuelo alrededor del círculo de piedras y por la Avenida, con el sol bajo sobre la llanura. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the site gets: open chalk grassland, with a long view.
export const THEME = { ground: '#9aa266', paving: '#b9ad8c', verge: 0xb9ad8c, kerb: 0xc8bd9c, fog: [420, 2200], weathers: ['clear', 'rain'] };

// There are almost no houses; the colours are only for the few that the map has.
export const LOOK = {
  walls: [['#d8cdb2', false], ['#c9bda0', false]],
  bigWalls: ['#cfc4a8'],
  roofs: [0x6e6a60, 0x7a766a],
  doors: ['#3a3a3a'],
  shutters: ['#4a5a4a'],
  stone: '#8f8c82',
  flatRoof: 0x7a766a,
  spires: false,
  houseBlocks: true,
  grass: '#8c9a58', // chalk grassland, a little pale
};

// The visitors: walkers on the path round the stones and along the Avenue.
export const BUSY = {
  walkers: 60,
  cyclists: 0,
  streets: [
    { street: 'North Path', weight: 2, free: true },
    { street: 'East Path', weight: 2, free: true },
    { street: 'South Path', weight: 2, free: true },
    { street: 'West Path', weight: 2, free: true },
    { street: 'The Avenue', weight: 1, free: true },
  ],
};

// Places named on the big map when riding about freely: click a name to teleport there.
const place = (name, e, s, side) => ({ name, x: at(e, s)[0], z: at(e, s)[1], side });
export const PLACES = [
  place('The stone circle', 0, 0, 'r'),
  place('The Heel Stone', 58, -48, 'r'),
  place('The Avenue', 200, -160, 'r'),
  place('The ditch and bank', -54, 0, 'l'),
];
