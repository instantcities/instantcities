// Ghent from the inside: the Sint-Baafskathedraal, the Sint-Niklaaskerk and the Stadhuis, in one
// map, the three buildings side by side, 120 m apart. The game is the same; what differs is that there
// is a roof over you (always daylight, never rain), and nothing outside. The files in this folder:
//   city.js       this file: the look and the named places, and the rest gathered up
//   map.js        the map: nearly empty, a footway in each building for the routes (hand-written)
//   races.js      the routes, one a building (hand-written)
//   quests.js     the missions: none yet
//   sights.js     the sights, and what a card tells you about each when you ride up (hand-written)
//   monuments.js  the buildings put up on the map, each with its walls to bump into
//   gothic.js     what the churches are built from: pointed arches, wall panels with windows, rib
//                 vaults, stained glass, a cruciform plan from a few numbers
//   baafs.js, niklaas.js, stadhuis.js   the three buildings (hand-written)
import { MAP } from './map.js';
import { MONUMENTS as BUILDINGS, AT } from './monuments.js';

export { MAP };
export const MONUMENTS = BUILDINGS;
export { RACES } from './races.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';

export const LANDMARKS = [], HOLLOWS = [], FACADES = [], FRONTS = [], SQUARES = [], SIGNALS = [], CROSSINGS = [], STOPS = [], TRAM_HALTS = [], BUS_LINES = [], FURNITURE = [], AREAS = [], BEACHES = [], RUNS = [];

export const ID = 'ghentinside';
export const NAME = { nl: 'Gent binnen', en: 'Ghent inside', fr: 'Gand à l’intérieur', es: 'Gante por dentro' };

export const WORDS = {
  nl: { title: 'Instant Gent Binnen', tag: 'Rij door de Sint-Baafs, de Sint-Niklaaskerk en het stadhuis!' },
  en: { title: 'Instant Ghent Inside', tag: 'Ride through St Bavo’s, St Nicholas’ and the City Hall!' },
  fr: { title: 'Instant Gand Intérieur', tag: 'Parcours Saint-Bavon, Saint-Nicolas et l’hôtel de ville !' },
  es: { title: 'Instant Gante Dentro', tag: '¡Recorre San Bavón, San Nicolás y el Ayuntamiento!' },
};

// Always daylight, never rain, and no races: you are under a roof. The light is a soft warm one from all round
// (the hemisphere), the fog the dark of the vaults far off, the ground the stone of the floors.
export const THEME = {
  ground: '#8f8a80', fog: [60, 240], times: ['day'], weathers: ['clear'], races: false,
  sky: 0x3a3028, horizon: 0x3a3028,
  hemi: [0xfff2dc, 0xb5a692, 2.1],
  sun: { color: 0xffe6c0, intensity: 0.4, pos: [-40, 120, 30] },
  camBack: 7,
};

export const PLACES = [
  { name: 'Sint-Baafskathedraal', x: AT.baafs[0], z: AT.baafs[1] - 40, side: 'r' },
  { name: 'Sint-Niklaaskerk', x: AT.niklaas[0], z: AT.niklaas[1] - 20, side: 'r' },
  { name: 'Stadhuis', x: AT.stadhuis[0], z: AT.stadhuis[1] - 10, side: 'r' },
];

// where riding about freely starts: inside the cathedral's west door, looking up the nave
export const FREE_START = { at: [AT.baafs[0], AT.baafs[1] - 52], look: [AT.baafs[0], AT.baafs[1]] };

// The doors out, back to the street: ride into one and the page for Ghent opens at the door, facing
// away from it (ghent/city.js has the doors in). x, z: where it is just inside, yaw: which way is
// into the building (the doors are all in the south walls).
const OUT = {
  'baafs-binnen': { to: [221, 49, -Math.PI / 2], name: 'Sint-Baafsplein' },
  'niklaas-binnen': { to: [-57.6, -53.2, -0.243], name: 'Veldstraat' },
  'stadhuis-binnen': { to: [118, -104, 0], name: 'Botermarkt' },
};
const toGhent = ([x, z, yaw]) => `/preview/pr-85/ghent/play/?pos=${x},${z}&yaw=${yaw.toFixed(3)}`;
export const PORTALS = MONUMENTS.map(m => ({ x: m.door.x, z: m.door.z, yaw: 0, href: toGhent(OUT[m.id].to), name: OUT[m.id].name, icon: '🚪' }));
export const TRAM_CENTRE = { x: 0, z: 0, r: 1 };
export const OLD_TOWN = { x: 0, z: 0, r: 1 };
