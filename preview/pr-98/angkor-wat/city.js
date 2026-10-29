import { dressMonuments } from '../core/js/site-style.js';
// Angkor Wat: everything the game needs to know about the site it is set in. The temple in
// Cambodia, the biggest religious building in the world: the moat, the causeway over it, the three
// levels of galleries and the five towers. A site, not a city: the map is the temple's own piece of
// OpenStreetMap, with the walks drawn in by hand (`streets` in area.json), and the temple is
// modelled by hand. The files in this folder:
//   city.js          this file: the look and its named places, and the rest gathered up
//   races.js         the race route             (hand-written)
//   tour.js          the tour: a flight over the causeway and the temple (hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap, and the walks
//   map.js           the paths, the moat and the trees: made from area.json by
//                    `node tools/osm_map.mjs angkor-wat`, do not edit by hand
//   temple.js        the temple's three levels, galleries and towers, modelled by hand
//   causeway.js      the outer gopura at the west end of the causeway, and the causeway's balustrades
//   avenue.js        the two libraries beside the way to the temple and the Terrace of Honour
export { MAP } from './map.js';
export { RACES } from './races.js';
export { TOUR } from './tour.js';
export { QUESTS } from './quests.js';
import { TEMPLE } from './temple.js';
import { CAUSEWAY } from './causeway.js';
import { AVENUE } from './avenue.js';

export const MONUMENTS = dressMonuments([...TEMPLE, ...CAUSEWAY, ...AVENUE], 'angkor-wat');
export const SIGNALS = [], CROSSINGS = [], FURNITURE = {};
export const STREET_FURNITURE = false; // no street lamps, benches or bins
export const PARKED_BIKES = false; // no bikes parked along the walks
export { SIGHTS } from './sights.js';
export const FRONTS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [];
export const LANDMARKS = [], HOLLOWS = [], FACADES = [], SQUARES = [], AREAS = [], BEACHES = [], RUNS = [];

// the site's folder, and its name
export const ID = 'angkor-wat';
export const NAME = { nl: 'Angkor Wat', en: 'Angkor Wat', fr: 'Angkor Vat', es: 'Angkor Wat' };

// The game's name and tagline here, in place of Ghent's (js/i18n.js).
export const WORDS = {
  nl: { title: 'Instant Angkor Wat', tag: 'Wandel of race over de dam, langs de slotgracht en de torens van Angkor Wat.', 'tour.welcomeSub': 'Een vlucht over de dam en de drie niveaus van de tempel, naar de vijf torens. Leun achterover en geniet!' },
  en: { title: 'Instant Angkor Wat', tag: 'Walk or race over the causeway, past the moat and the towers of Angkor Wat.', 'tour.welcomeSub': 'A flight over the causeway and the three levels of the temple, up to the five towers. Sit back and enjoy!' },
  fr: { title: 'Instant Angkor Vat', tag: 'Promène-toi ou fais la course sur la chaussée, le long des douves et des tours d’Angkor Vat.', 'tour.welcomeSub': 'Un vol au-dessus de la chaussée et des trois niveaux du temple, jusqu’aux cinq tours. Installe-toi et profite !' },
  es: { title: 'Instant Angkor Wat', tag: 'Pasea o corre por la calzada, junto al foso y las torres de Angkor Wat.', 'tour.welcomeSub': 'Un vuelo sobre la calzada y los tres niveles del templo, hasta las cinco torres. ¡Ponte cómodo y disfruta!' },
};

// The colours of the open ground and the pavements, how far the fog lets you see (game metres)
// and the weathers the site gets.
export { THEME } from './appearance.js';

// The few houses that stand around it: wooden, with tin and tile roofs.
export const LOOK = {
  walls: [['#b79a72', false], ['#a8896a', false], ['#c4a77e', false], ['#9c8266', false], ['#d3bb94', false]],
  bigWalls: ['#a8896a', '#9c8266', '#b79a72'],
  roofs: [0x7a5a40, 0x6e5238, 0x8a6a4c],
  doors: ['#4a2e1c', '#2e4a3a'],
  shutters: ['#4f6b4a', '#6b4a2c'],
  stone: '#8f8271',
  flatRoof: 0x8a7a64,
  spires: false,
  houseBlocks: true,
};

// Places named on the big map when riding about freely: click a name to teleport there.
export const PLACES = [
  { name: 'The causeway', x: -520, z: 76, side: 'r' },
  { name: 'The western gopura', x: -319, z: 77, side: 'l' },
  { name: 'The libraries', x: -84, z: 83, side: 'l' },
  { name: 'Angkor Wat', x: 378, z: 88, side: 'r' },
];

// Visitors favour the main approach and the viewing paths.
export const BUSY = {
  "walkers": 135,
  "cyclists": 0,
  "streets": [
    {
      "street": "Western Causeway",
      "weight": 4,
      "free": true
    },
    {
      "street": "West Terrace",
      "weight": 2,
      "free": true
    },
    {
      "street": "North Walk",
      "weight": 2,
      "free": true
    },
    {
      "street": "East Walk",
      "weight": 2,
      "free": true
    }
  ]
};
