// Pompeii: everything the game needs to know about the site it is set in. The Roman town near Naples,
// buried by Vesuvius in AD 79 and dug out again: its streets, the Forum with the Temple of Jupiter,
// the baths, the houses and the amphitheatre. A site, not a city: the map is the excavation's own
// piece of OpenStreetMap (the streets are named there, and the houses are drawn as ruins, which
// `ruins_as_buildings` in area.json turns into houses), and the main monuments are modelled by hand.
// The files in this folder:
//   city.js          this file: the look and its named places, and the rest gathered up
//   races.js         the race route             (hand-written)
//   tour.js          the tour: a flight along the route over the roofs (made from map.js, then hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap, and the route
//   map.js           the streets, houses and trees: made from area.json by
//                    `node tools/osm_map.mjs pompeii`, do not edit by hand
//   sights.js        the sights: the cards that tell you what you are looking at
//   frame.js         latitude and longitude to the map's metres
//   forum.js         the Forum's colonnades and the Temple of Jupiter
//   amphitheatre.js  the amphitheatre
//   public.js        the theatres, the Basilica, the Temple of Apollo and the other public buildings
//   ruins.js         the houses and shops as ruins: walls open to the sky, in tiles
//   stones.js        the stepping stones across the streets
//   vesuvius.js      Vesuvius on the horizon
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
import { FORUM } from './forum.js';
import { AMPHITHEATRE } from './amphitheatre.js';
import { VESUVIUS } from './vesuvius.js';
import { PUBLICS } from './public.js';
import { STONES } from './stones.js';
import { RUINED_TOWN } from './ruins.js';

export const MONUMENTS = [...FORUM, ...AMPHITHEATRE, ...PUBLICS, ...RUINED_TOWN, ...STONES, ...VESUVIUS];
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {};
export const STREET_FURNITURE = false; // no street lamps, benches or bins
export const PARKED_BIKES = false; // no bikes parked along the streets
export { SIGHTS } from './sights.js';
export const FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the site's folder, and its name
export const ID = 'pompeii';
export const NAME = { nl: 'Pompeii', en: 'Pompeii', fr: 'Pompéi', es: 'Pompeya' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Pompeii', tag: 'Wandel of race door de Romeinse straten van Pompeii, met de Vesuvius op de achtergrond.', 'tour.welcomeSub': 'Een vlucht over de daken van de stad, van het Forum langs de Via dell’Abbondanza. Leun achterover en geniet!' },
  en: { title: 'Instant Pompeii', tag: 'Walk or race through the Roman streets of Pompeii, with Vesuvius behind.', 'tour.welcomeSub': 'A flight over the roofs of the town, from the Forum along the Via dell’Abbondanza. Sit back and enjoy!' },
  fr: { title: 'Instant Pompéi', tag: 'Promène-toi ou fais la course dans les rues romaines de Pompéi, avec le Vésuve derrière.', 'tour.welcomeSub': 'Un vol au-dessus des toits de la ville, du Forum le long de la Via dell’Abbondanza. Installe-toi et profite !' },
  es: { title: 'Instant Pompeya', tag: 'Pasea o corre por las calles romanas de Pompeya, con el Vesubio detrás.', 'tour.welcomeSub': 'Un vuelo sobre los tejados de la ciudad, del Foro por la Via dell’Abbondanza. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the site gets.
export const THEME = { ground: '#b4ab97', paving: '#9b9484', verge: 0x9b9484, kerb: 0xaaa392, fog: [300, 1500], weathers: ['clear'] };

// How the houses look: plaster in Pompeian red, ochre, yellow and cream, flat roofs of terracotta tiles.
export const LOOK = {
  walls: [
    ['#c55a36', false], ['#d9a85a', false], ['#e8d8b0', false], ['#d98e6a', false], ['#e0c070', false],
    ['#b8643e', false], ['#ecdcb8', false], ['#cf9a60', false], ['#c9824f', false], ['#d8c090', false],
    ['#bf6b45', false], ['#e2cf9e', false],
  ],
  bigWalls: ['#dccaa0', '#d4b98a', '#c9a678', '#e0cfa8'],
  roofs: [0xb4623c, 0xa5563a, 0xc0704a],
  doors: ['#4a2e1c', '#3a2a1c'],
  shutters: ['#5a3a22', '#6b4a2c'],
  stone: '#d8cdb2',
  flatRoof: 0xb4623c,
  spires: false,
  houseBlocks: true,
  style: 'roman', // the house fronts of js/roman.js
  grass: '#b1a893', // the open ground is bare dust and gravel, not grass
};

// The visitors: it is a busy day, with crowds along the main streets and round the Forum and the baths.
export const BUSY = {
  walkers: 320,
  cyclists: 0,
  streets: [
    { street: 'Via dell\'Abbondanza', weight: 4, free: true },
    { street: 'Via Stabiana', weight: 3, free: true },
    { street: 'Via del Foro', weight: 4, free: true, across: 20 },
    { street: 'Via della Fortuna', weight: 3, free: true },
    { street: 'Via di Mercurio', weight: 2, free: true },
    { street: 'Via dei Teatri', weight: 2, free: true },
    { street: 'Via delle Terme', weight: 2, free: true },
    { street: 'Via Consolare', weight: 1.5, free: true },
    { street: 'Via Marina', weight: 1.5, free: true },
    { street: 'Via di Nola', weight: 1.5, free: true },
    { street: 'Via di Nocera', weight: 1.5, free: true },
    { street: 'Vicolo di Mercurio', weight: 1, free: true },
    { street: 'Vicolo del Lupanare', weight: 1.5, free: true },
    { street: 'Vicolo del Fauno', weight: 1, free: true },
    { street: 'Vicolo di Modesto', weight: 1, free: true },
  ],
};

// Places named on the big map when riding about freely: click a name to teleport there.
import { game } from './frame.js';
const at = (name, lat, lon, side) => ({ name, x: game(lat, lon)[0], z: game(lat, lon)[1], side });
export const PLACES = [
  at('The Forum', 40.7508, 14.4850, 'l'),
  at('Via dell’Abbondanza', 40.7517, 14.4905, 'r'),
  at('Stabian Baths', 40.7510, 14.4896, 'r'),
  at('Great Theatre', 40.7481, 14.4915, 'r'),
  at('Amphitheatre', 40.7498, 14.4990, 'r'),
];
