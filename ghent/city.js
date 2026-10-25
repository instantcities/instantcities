// Ghent, inside the R40 ring: everything the game needs to know about the city it is set in.
// The files in this folder:
//   city.js          this file: the city's look and its named places, and the rest gathered up
//   races.js         the race routes            (hand-written)
//   quests.js        the quests and their words (hand-written)
//   area.json        what to download from OpenStreetMap: the bounding box, the zone and the routes
//   landmarks.json   which buildings get their real 3D model, by their OpenStreetMap ways
//   map.js           the streets, buildings, water and trees: made from area.json by
//                    `node tools/osm_map.mjs ghent`, do not edit by hand
//   landmarks.js     the 3D models and the hollows (squares lower than their streets): made from landmarks.json by `node tools/gent3d.mjs ghent`
//   facades.js       the landmarks' walls, drawn by hand (hand-written)
//   monuments.js     the statues, modelled by hand (hand-written)
//   fronts.js        single houses' fronts drawn by hand, the Graslei's (hand-written)
//   kouterfronts.js  the Kouter's banks, the Handelsbeurs and the grand houses round it, drawn by hand (hand-written)
//   streets.js       fronts per street from a spec each, read off Mapillary photos (see facade-lab.html)
//   squares.js       the car-free squares, paved wall to wall (hand-written)
//   sights.js        the sights, and what a card tells you about each when you ride up (hand-written)
//   inside.js        the buildings you can go into, their doors and cards; their rooms in inside/ (hand-written)
//   tour.js          the tour: the flight through the old town and its stops (hand-written)
//   infill.js        a block the map leaves empty, built up, and a map house a landmark stands on (hand-written)
//   graffitistraat.js the narrow Werregarenstraat, with graffiti on both courtyard walls (hand-written)
//   glazenstraatje.js the Glazen Straatje's covered gallery, and the lit windows round it (hand-written)
//   doknoord.js      Route du Soleil's brick hall on the Sassevaartstraat and the ramp down to Dok Noord's car park (hand-written)
//   kouter.js        the Kouter's car park: its two glass pavilions and the ramps in and out (hand-written)
//   doknoordplein.js Dok Noord's square: the sawtooth shops, the glass hall and the Direkteurswoning (hand-written)
//   sassevaart.js    Travelbase's neighbours: the old AEG works and the Dok Noord building (hand-written)
//   passages.js      the passages through a building at street level, cut out of it (hand-written)
//   bridges.js       the bridges that stand higher than the street, which the map has level (hand-written)
//   lowquays.js      the quays that lie lower than the street beside them, by the water (hand-written)
//   underpasses.js   the paths that go down under a bridge the map has them crossing level (hand-written)
//   crossings.js     the traffic lights and crossings: made from the map download by
//                    `node tools/crossings.mjs ghent`, do not edit by hand
//   transit.js       the bus and tram stops and the bus lines: made by `node tools/transit.mjs ghent`,
//                    do not edit by hand
//   tramlines.json   the tram lines, by the places they run past, and the tracks the works took out (hand-written)
//   tramlines.js     those lines over the tracks, with their stops: made from tramlines.json by
//                    `node tools/tramlines.mjs ghent`, do not edit by hand
//   pavilions.js     the Kouter's bandstand and blue kiosk, the bus canopies at Zuid, the flower
//                    stalls and the neuzekes carts (hand-written)
//   stadshal.js      the grand piano under the Stadshal and SGOL, the restaurant in its cellar (hand-written)
//   banners.js       the city's banners on the schools, crèches and museums: made by
//                    `node tools/banners.mjs ghent`, do not edit by hand
//   stations.js      Gent-Sint-Pieters and Gent-Dampoort with their platforms, tracks and trains (hand-written)
//   krook.js         De Krook, the library on the Scheldt (hand-written)
//   provinciehuis.js the Provinciehuis in the old Leopoldskazerne (hand-written)
//   belgacomtoren.js the old Belgacom tower on the Sint-Jacobsnieuwstraat (hand-written)
//   opera.js         the Opera on the Schouwburgstraat (hand-written)
//   topsporthal.js   the Topsporthal by the Watersportbaan (hand-written)
//   vandewielebrug.js the Annie Vande Wielebrug over the Watersportbaan, its blue steel and arched girder (hand-written)
//   blocks.js        what those are built from: walls on an outline, slabs, ribbons along a line
//   railways.json    which station yards to take the tracks of (hand-written)
//   railways.js      the stations' tracks, platforms and platform roofs: made by `node tools/railways.mjs ghent`
//   sintbaafsplein.js the terraces of the three restaurants on the Sint-Baafsplein (hand-written)
//   graslei.js       the restaurants' terraces along the Graslei and on the Korenlei (hand-written)
//   veerleplein.js   the cafés' and restaurants' terraces on the Sint-Veerleplein (hand-written)
//   blaarmeersen.js  the Blaarmeersen's lake and beaches, its woods, and the runners' loop round the Watersportbaan
//   strand.js        the parasols on the Blaarmeersen's beaches and Le Beach House behind them (hand-written)
//   sabbeberg.js     the Karel Sabbeberg in the Blaarmeersen: the hill, the path up it, its woods and lookout tower (hand-written)
//   terrain.js       how high the ground lies, the hills: made by `node tools/terrain.mjs ghent`
//   famous.json      the well-known places for the big map's index: museums, restaurants, schools... (hand-written)
//   famous.js        those places on the map: made from famous.json by `node tools/famous.mjs ghent`
//   cederstraat.js   the Cederstraat drawn closer to life: every spot parked, two cars and a family put there by hand
//   kerstmarkt.js    the Christmas market on the Groentenmarkt, there only on the tour (hand-written)
//   stroppen.js      the Stroppendragers' procession up the Belfortstraat and across the Sint-Baafsplein, there only on the tour (hand-written)
//   buskers.js       buskers along the Belfortstraat, there only on the tour (hand-written)
//   demo.js          the film about the game: shots from the tour and the quests, played with ?demo (hand-written)
//   furniture.js     the bollards, post boxes, benches and bins OpenStreetMap has: made by `node tools/furniture.mjs ghent`
import { MAP as OSM } from './map.js';
import { TOUR_PROPS as KERSTMARKT } from './kerstmarkt.js';
import { STROPPEN } from './stroppen.js';
import { BUSKERS } from './buskers.js';
import { TRAM_TRACKS, TRAM_MOVED } from './tramlines.js';
import { PATHS as SABBE_PATHS, GROVES as SABBE_GROVES } from './sabbeberg.js';
import { GROVES as BLAARMEERSEN_GROVES } from './blaarmeersen.js';
import { CLEARINGS } from './strand.js';
import { BUILDINGS as INFILL, HIDDEN } from './infill.js';
import { withPassages } from './passages.js';
import { withUnderpasses } from './underpasses.js';
import { withRaisedBridges } from './bridges.js';
import { lowQuays } from './lowquays.js';
import { SQUARES as CITY_SQUARES } from './squares.js';
import { ALLEY_NAME, ALLEY_WIDTH, withAlleyClearance } from './graffitistraat.js';
import { GALLERY_NAME, GALLERY_WIDTH, withGlazenStraatje } from './glazenstraatje.js';
import { STREET_NAME as SASSEVAART, onSassevaartstraat, GRASS, GRASS_TREES } from './doknoord.js';
import { TREES as SQUARE_TREES, SQUARE } from './doknoordplein.js';
function insideRing(x, z, p) {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
}
// the map, with the tram tracks laid again where works took them out of OpenStreetMap (tramlines.js),
// the path up the Karel Sabbeberg, which it does not have (sabbeberg.js), and the block beside the
// Stadhuis it leaves empty, less what a landmark already stands on (infill.js)
// Streets the map has paved in stones (or slabs) that are asphalt in fact.
const ASPHALT = ['Kastanjestraat'];
const centre = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [(2 * x) / p.length, (2 * z) / p.length]; };
const hidden = b => HIDDEN.some(([x, z]) => insideRing(x, z, b.p));
// Canals that lie lower than the rest, between sloping grass banks instead of quay walls: the
// Coupure, and the Brugse Vaart it runs on into along the Groendreef (one body of water in the
// map). at: a point in the water, level: its surface in metres (the rest lies at WATER, js/relief.js),
// bank: how far in, in metres, the grass slopes down before it reaches below that.
const LOW_WATER = [{ name: 'Coupure', at: [-1231, 48], level: -2.4, bank: 5 }];
const lowWater = a => a.k === 'water' && LOW_WATER.find(w => insideRing(...w.at, a.p));
const lowAreas = OSM.areas.filter(lowWater);
// the map also has the canal as a line down its middle (a waterway), which would lay the usual
// water and quay walls over it: cut those lines where they run through it, keeping the rest
const outsideLow = ({ w, p }) => {
  const runs = [];
  let run = [];
  for (let k = 0; k + 3 < p.length; k += 2) {
    const mx = (p[k] + p[k + 2]) / 2, mz = (p[k + 1] + p[k + 3]) / 2;
    if (lowAreas.some(a => insideRing(mx, mz, a.p))) { if (run.length > 2) runs.push(run); run = []; continue; }
    if (!run.length) run.push(p[k], p[k + 1]);
    run.push(p[k + 2], p[k + 3]);
  }
  if (run.length > 2) runs.push(run);
  return runs.map(q => ({ w, p: q }));
};
// The Sint-Michielsbrug is 11.3 wide, the ramps up to it 7.5 in the map: their walls and kerbs did not meet
// the bridge's. Where a ramp climbs it is as wide as the bridge, then it eases back to its own width over
// the foot of the slope (the road cut in pieces, each sharing its end point with the next).
const BRIDGE = { name: 'Sint-Michielshelling', w: 11.3 };
const widenRamp = rd => {
  if (OSM.names[rd.n] !== BRIDGE.name || !rd.y || rd.br || rd.w >= BRIDGE.w) return [rd];
  const stage = h => (h >= 0.5 ? 2 : h >= 0.05 ? 1 : 0);
  const width = [rd.w, (rd.w + BRIDGE.w) / 2, BRIDGE.w];
  const out = [];
  for (let a = 0, n = rd.y.length; a < n - 1;) {
    let b = a + 1;
    while (b < n - 1 && stage(rd.y[b]) === stage(rd.y[a])) b++;
    const st = Math.max(stage(rd.y[a]), stage(rd.y[b - 1]));
    out.push({ ...rd, w: width[st], p: rd.p.slice(a * 2, b * 2 + 2), y: rd.y.slice(a, b + 1) });
    a = b;
  }
  return out;
};
// The Korenmarkt has no trees (OpenStreetMap has a few on it, and the game adds more to a paved
// square's edges): none on its paving, so the terraces round it have the room.
const TREELESS = CITY_SQUARES.find(sq => sq.id === 'korenmarkt');
// The houses round the Korenmarkt open onto it, café after café, but the map gives each the front
// of the nearest street, which is often the lane behind it: the square's walls are fronts (their
// shops' signs, awnings and terraces stand out onto the paving), and a house of it without a shop
// is a café, as the long rows of the square's south and east sides in fact are (the map is short
// of them: shops and cafés come from its points, and many a venue is missing, or closed).
const SQUARE_BOX = (() => { const p = TREELESS.p, xs = p.filter((_, k) => !(k % 2)), zs = p.filter((_, k) => k % 2); return [Math.min(...xs) - 8, Math.min(...zs) - 8, Math.max(...xs) + 8, Math.max(...zs) + 8]; })();
const SQUARE_CAFES = ['Brasserie Korenmarkt', 'Café Het Korenhuis'];
const faceSquare = (b, i) => {
  if (b.gone || b.k === 'part' || b.h || b.k === 'roof') return b;
  const p = b.p, n = p.length / 2, [x0, z0, x1, z1] = SQUARE_BOX;
  if (!(p[0] > x0 && p[0] < x1 && p[1] > z0 && p[1] < z1)) return b;
  let cx = 0, cz = 0;
  for (let k = 0; k < n; k++) { cx += p[2 * k] / n; cz += p[2 * k + 1] / n; }
  let best = null;
  for (let k = 0; k < n; k++) {
    const ax = p[2 * k], az = p[2 * k + 1], bx = p[(2 * k + 2) % p.length], bz = p[(2 * k + 3) % p.length], L = Math.hypot(bx - ax, bz - az);
    if (L < 3) continue;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    let nx = -(bz - az) / L, nz = (bx - ax) / L;
    if ((mx + nx - cx) ** 2 + (mz + nz - cz) ** 2 < (mx - nx - cx) ** 2 + (mz - nz - cz) ** 2) { nx = -nx; nz = -nz; } // out of the house
    if (insideRing(mx + nx * 3, mz + nz * 3, TREELESS.p) && !insideRing(mx - nx * 3, mz - nz * 3, TREELESS.p) && (!best || L > best.L)) best = { k, L };
  }
  if (!best) return b;
  const cafe = !b.shop && best.L < 13 && b.f >= 2 && ['house', 'yes', 'retail', 'commercial'].includes(b.k);
  return { ...b, fe: best.k, ...(cafe && { shop: ['cafe', SQUARE_CAFES[i % SQUARE_CAFES.length]] }) };
};
// Streets that are two lanes with a white line down the middle, with the parked cars in bays
// beside the carriageway on both sides, not in it: the map has them one-way, and the game then
// parks cars along both kerbs of the road itself (core/js/scenery.js osmCars). The dock's streets.
export const BAY_STREETS = ['Gasmeterlaan', 'Nieuwevaart', 'Blaisantvest', 'Sassekaai'];
const bayRoad = rd => (rd.one && !rd.foot && BAY_STREETS.includes(OSM.names[rd.n]) ? { ...rd, one: undefined, bay: 1 } : rd);
// the bridges that stand higher than the street (bridges.js), and the paths that go down under a
// bridge, in a trench (underpasses.js)
const UNDER = withUnderpasses(withRaisedBridges(OSM.roads, OSM.names), OSM.names);
export const MAP = {
  ...OSM,
  areas: [...OSM.areas.filter(a => a.k === 'water' || !insideRing(...centre(a.p), SQUARE)).map(a => { const w = lowWater(a); return w ? { ...a, level: w.level, bank: w.bank } : a; }), GRASS],
  trees: [...OSM.trees.filter((v, k, t) => { const [x, z] = k % 2 ? [t[k - 1], v] : [v, t[k + 1]]; return !insideRing(x, z, SQUARE) && !insideRing(x, z, GRASS.p) && !insideRing(x, z, TREELESS.p); }), ...GRASS_TREES, ...SQUARE_TREES],
  water: OSM.water.flatMap(outsideLow),
  trams: [...OSM.trams.map((t, i) => (TRAM_MOVED[i] ? { ...t, p: TRAM_MOVED[i] } : t)), ...TRAM_TRACKS],
  buildings: withPassages(withAlleyClearance(withGlazenStraatje([...OSM.buildings.map((b, i) => faceSquare(hidden(b) ? { ...b, gone: true } : b, i)), ...INFILL]))),
  names: [...OSM.names, SASSEVAART],
  roads: [...UNDER.roads.map(bayRoad).map(rd => (OSM.names[rd.n] === ALLEY_NAME ? { ...rd, w: ALLEY_WIDTH, foot: true, c: 2 } : OSM.names[rd.n] === GALLERY_NAME && rd.foot ? { ...rd, w: GALLERY_WIDTH, c: 2 } : ASPHALT.includes(OSM.names[rd.n]) && !rd.foot ? { ...rd, c: undefined }
    : onSassevaartstraat(rd) ? { ...rd, n: OSM.names.length, c: 1 } : onKouterRamp(rd) ? kouterRampRoad(rd) : rd)).flatMap(widenRamp), ...SABBE_PATHS],
};
export { MOUNDS } from './sabbeberg.js';
// where it is wooded, more thickly than the map's parks get (core/js/scenery.js): the Karel
// Sabbeberg's slopes, then the rest of the Blaarmeersen round it, clear of Le Beach House (strand.js)
export const GROVES = [...SABBE_GROVES, ...BLAARMEERSEN_GROVES.map(g => ({ ...g, keep: [...(g.keep ?? []), ...CLEARINGS] }))];
import { HOLLOWS as MEASURED_HOLLOWS } from './landmarks.js';
import { HOLLOWS as RAMPS, MOUTH as DOK_NOORD_MOUTH } from './doknoord.js';
import { HOLLOWS as KOUTER_RAMP, onRamp as onKouterRamp, rampRoad as kouterRampRoad, MOUTHS as KOUTER_MOUTHS } from './kouter.js';
// The car parks under the Kouter and under Dok Noord are one: ride into a mouth of the one and you
// come up the other's ramp (core/js/main.js); from Dok Noord, up the Kouter's way out. Each portal:
// where its mouth is, and where it lets you out.
// (The doors into Sint-Baafs, Sint-Niklaas and the Stadhuis are in inside.js: their rooms stand on
// this map, js/interiors.js.)
export const PORTALS = [
  ...KOUTER_MOUTHS.map(m => ({ ...m, to: DOK_NOORD_MOUTH, name: 'Parking Dok Noord' })),
  { ...DOK_NOORD_MOUTH, to: KOUTER_MOUTHS[0], name: 'Parking Kouter' },
];
export { LANDMARKS } from './landmarks.js';
// the squares lower than their streets (measured, landmarks.js), the ramps down to Dok Noord's and
// the Kouter's car parks (doknoord.js, kouter.js), the trenches the paths go down under a bridge in
// (underpasses.js) and the quays lying lower than their street (lowquays.js)
export const HOLLOWS = [...MEASURED_HOLLOWS, ...RAMPS, ...KOUTER_RAMP, ...UNDER.hollows, ...lowQuays(MAP)];
export { FACADES } from './facades.js';
export { MONUMENTS } from './monuments.js';
import { FRONTS as OLD_TOWN_FRONTS } from './fronts.js';
import { KOUTER_FRONTS } from './kouterfronts.js';
const HAND_FRONTS = [...OLD_TOWN_FRONTS, ...KOUTER_FRONTS];
import { STREETS } from './streets.js';
export { STREETS }; // for the facade lab (facade-lab.html)
import { specFronts } from '../core/js/facade-spec.js';
export { SQUARES } from './squares.js';
export { SIGNALS, CROSSINGS } from './crossings.js';
export { STOPS, TRAM_HALTS, BUS_LINES } from './transit.js';
export { TRAM_LINES, TRAM_STOPS } from './tramlines.js';
export { FURNITURE } from './furniture.js';
export { RACES } from './races.js';
export { QUESTS } from './quests.js';
export { SIGHTS } from './sights.js';
export { INSIDE } from './inside.js';
export { AREAS, BEACHES, RUNS, ROWING } from './blaarmeersen.js';
export { TERRAIN } from './terrain.js';
export { FAMOUS } from './famous.js';
import { TOUR as TOUR_PATH } from './tour.js';
import { flyingDragon, livingArtevelde, riddenDragon } from './tourcast.js';
// (ride: the dragon the tour is flown on yourself, through the hoops: core/js/dragonfly.js)
export const TOUR = { ...TOUR_PATH, flyer: { ...TOUR_PATH.flyer, make: flyingDragon }, runner: { ...TOUR_PATH.runner, make: livingArtevelde }, ride: riddenDragon };
export { DEMO } from './demo.js'; // the film about the game (?demo)
export const TOUR_PROPS = [...KERSTMARKT, ...STROPPEN, BUSKERS]; // the Christmas market, the Stroppendragers (on the Belfortstraat and the Sint-Baafsplein) and the buskers
export { FULL_PARKING, PARKED_CARS } from './cederstraat.js';
// the wall colours read off the photos of whole streets (tools/looks.mjs), of every street at once
import { LOOKS as STREET_LOOKS } from './looks.js';
export const LOOKS = Object.assign({}, ...Object.values(STREET_LOOKS));

// the hand-drawn fronts, then the fronts the streets' specs make for the buildings they left
export const FRONTS = [...HAND_FRONTS, ...specFronts(STREETS, HAND_FRONTS)];

// the city's folder, and its name
export const ID = 'ghent';
export const NAME = { nl: 'Gent', en: 'Ghent', fr: 'Gand', es: 'Gante' };

// Each sight's page on instantgent.be (in English): the sight's id goes after it. A sight's card in
// the game links there (Read more); a city without these pages leaves it out, and the link with it.
export const SIGHT_PAGES = 'https://instantgent.be/en/sights/';

// The colours of the open ground (paved, so grey) and how far the fog lets you see, in game metres.
// A race can bring its own.
export const THEME = { ground: '#929497', fog: [160, 620] };

// The tour boats on the Leie and the canals carry the name of the Bootjes van Gent (js/scenery.js).
export const BOATS = { name: 'Bootjes van Gent' };

// People everyone in town knows, each always on their own street: walking it up and down, end to
// end, on its pavement, each drawn in full (js/figure.js): shirt is the coat, then a beard, a bag
// in each hand (bagSize: how much bigger than usual), a cap, and stash: how far along the street (0 to 1)
// their things stand on the pavement. near [x, z]: the stretch of the street that comes nearest there
// (one in several pieces), flip: on its other pavement, inset: that many metres in from the pavement's edge.
export const CHARACTERS = [
  // Zakman, the grey-bearded man in a woolly cap walking to and fro with a big plastic bag in each
  // hand, here on the Korenlei across the Leie from the Graslei, on the quay side (the tour's boat
  // sails past it), a little in from the quay's edge, clear of the people sitting on it; his yellow
  // coat makes him easy to spot, and his boxes and bags stand on the quay.
  // bagSize: how much bigger his bags are
  { name: 'Zakman', street: 'Korenlei', near: [-322, -140], flip: true, inset: 2, speed: 0.85, colors: { shirt: 0xf2c230, pants: 0x4a4038, skin: 0xd49f7c, hair: 0xb8b3aa }, beard: 0xcdc8bf, bags: [0xf2f2ee, 0x2f6fc0], bagSize: 1.6, cap: 0x3d4a5a, stash: 0.1 },
];

// The busy heart of the old town, where far more people walk than anywhere else and cyclists ride
// both ways (core/js/people.js busyPaths, core/js/bikers.js Cyclists). walkers: how many walk here,
// besides everyone on the other streets; cyclists: how many ride here (a phone gets a third of each).
// streets: { street: its name in map.js, weight: how busy it is, per metre, compared with the others,
// free?: no cars, so people walk down the middle too and not only along the pavements, across?: an
// open square, crossed that many times straight from one side to the other }. The few side streets
// in it (weight 0.4) join the rest up, so a cyclist can get from any of them to any other.
export const BUSY = {
  walkers: 140,
  cyclists: 14,
  streets: [
    { street: 'Korenmarkt', weight: 3, free: true, across: 8 },
    { street: 'Veldstraat', weight: 3, free: true },
    { street: 'Langemunt', weight: 2.5, free: true },
    { street: 'Vrijdagmarkt', weight: 2, free: true, across: 10 },
    { street: 'Sint-Baafsplein', weight: 2, free: true, across: 6 },
    { street: 'Emile Braunplein', weight: 2, free: true, across: 4 },
    { street: 'Groentenmarkt', weight: 2, free: true, across: 3 },
    { street: 'Cataloniëstraat', weight: 2, free: true },
    { street: 'Graslei', weight: 2.5, free: true },
    { street: 'Korenlei', weight: 1.5 },
    { street: 'Sint-Michielshelling', weight: 2 }, // and the Sint-Michielsbrug, which is part of it
    { street: 'Botermarkt', weight: 1.5 },
    { street: 'Belfortstraat', weight: 1.2 },
    { street: 'Hoogpoort', weight: 1.2 },
    { street: 'Kammerstraat', weight: 1 },
    { street: 'Jan Breydelstraat', weight: 1 },
    { street: 'Hooiaard', weight: 0.4 },
    { street: 'Pensmarkt', weight: 0.4 },
    { street: 'Donkersteeg', weight: 0.4 },
    { street: 'Klein Turkije', weight: 0.4 },
    { street: 'Grasbrug', weight: 0.4 },
    { street: 'Mageleinstraat', weight: 0.4 },
    { street: 'Limburgstraat', weight: 0.4 },
  ],
};

// Streets with two lanes each way, a dashed white line down the middle of each carriageway.
export const TWO_LANES = ['Rooigemlaan'];

// The fietsstraten: streets where the bike goes first and a car is a guest ("auto te gast"), laid
// in dark red asphalt with now and then a big blue disc painted on it, a white cyclist in front of
// a red car.
export const BIKE_STREETS = ['Coupure Links', 'Lindenlei', 'Bagattenstraat', 'Muinkkaai', 'Visserij'];

// Flocks of sheep grazing the grass banks of the Coupure and of the Brugse Vaart along the
// Groendreef, as the city keeps them there to mow (core/js/scenery.js bankSheep): at [x, z], game
// metres, on the bank nearest there; count: how many.
export const SHEEP = [{ at: [-1258, -150], count: 8 }, { at: [-1823, -1270], count: 7 }];

// Where riding about freely starts, game metres: at the foot of the Sint-Michielshelling on the
// Korenlei side, facing up over the Sint-Michielsbrug at the three towers (look: the Belfort).
export const FREE_START = { at: [-332, -65.3], look: [89, -41] };

// The city centre, where the trams run most often and slowest: round the Korenmarkt, game metres.
export const TRAM_CENTRE = { x: -40, z: -40, r: 650 };

// The old town, from the Gravensteen to Sint-Baafs and the Vrijdagmarkt, game metres: a narrow house
// here that turns its gable end to the street gets a stepped gable (trapgevel), not a bare roof end.
export const OLD_TOWN = { x: 0, z: -230, r: 500 };

// Quarters whose ordinary houses share one kind of front (core/js/scenery.js QUARTER_FRONTS), each
// { name, front, module: metres of wall per house front, storeys?: how many every house has (else the
// map's), walls: [colour, brick?], ring: [x, z, ...] }.
// The Brugse Poort, between the Rooigemlaan, the Brugse Vaart and the Leie: narrow 19th-century
// workers' houses, a door with a fanlight to one side and one wide window beside it, one wide window
// over that upstairs, a low strip with a small window under the eaves, all as high as each other, in
// painted plaster over a dark plinth, or white glazed, cream or red brick.
export const QUARTERS = [
  {
    name: 'brugse-poort', front: 'worker', module: 5.2, storeys: 2,
    walls: [
      ['#9aa697', false], ['#e8e9e6', true], ['#d8ccb0', true], ['#3f4f48', false], ['#8c3b2a', true],
      ['#a5563b', true], ['#c9c7c0', false], ['#efe9dc', false], ['#8a6fc0', false], ['#b9c4cc', false],
    ],
    ring: [
      -2160, -1745, -2064, -1583, -1800, -1191, -1707, -1053, -1603, -1028, -1543, -953, -1488, -843, -1458, -754,
      -1399, -610, -1420, -560, -1493, -524, -1721, -431, -1887, -334, -2015, -198, -2156, -76, -2225, -40,
      -2320, -110, -2425, -235, -2690, -560, -2655, -1130, -2320, -1645,
    ],
  },
];

// Places named on the big map when riding about freely: click a name to teleport there.
// Game metres, from their OpenStreetMap positions; side is where the name sits next to its dot.
export const PLACES = [
  { name: 'Gravensteen', x: -264, z: -526, side: 'l' },
  { name: 'Korenmarkt', x: -151, z: -186, side: 'r' },
  { name: 'Graslei', x: -248, z: -190, side: 'l' },
  { name: 'Sint-Baafs', x: 292, z: 50, side: 'r' },
  { name: 'Vrijdagmarkt', x: 187, z: -474, side: 'r' },
  { name: 'Coupure', x: -1134, z: 328, side: 'l' },
  { name: 'Gent-Sint-Pieters', x: -1135, z: 2374, side: 'r' },
  { name: 'Gent-Dampoort', x: 1445, z: -363, side: 'r' },
  { name: 'Veldstraat', x: -137, z: 38, side: 'r' },
  { name: 'Citadelpark', x: -460, z: 2111, side: 'l' },
  { name: 'Bevrijdingslaan', x: -2087, z: -1178, side: 'r' },
  { name: 'Dok Noord', x: 747, z: -1773, side: 'r' },
  { name: 'Watersportbaan', x: -3286, z: 425, side: 'r' },
  { name: 'Heuvelpoort (R40)', x: 204, z: 2056, side: 'r' },
  { name: 'Zuid', x: 668, z: 742, side: 'r' },
  { name: 'Kouter', x: 6, z: 445, side: 'l' },
  { name: 'Vooruit', x: 302, z: 795, side: 'l' },
  { name: 'Sint-Pietersplein', x: 225, z: 1470, side: 'l' },
  { name: 'Blaarmeersen', x: -3160, z: 1335, side: 'r' },
  { name: 'Neuseplein (R40)', x: 318, z: -1925, side: 'l' },
  { name: 'Rooigemlaan (R40)', x: -2245, z: -45, side: 'l' },
  { name: 'Europabrug', x: -2501, z: 753, side: 'r' },
  { name: 'Rabot', x: -920, z: -965, side: 'r' },
];
