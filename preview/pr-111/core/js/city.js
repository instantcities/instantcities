// The city the game is set in. Each city is a folder at the top of the site (ghent/, lecce/) with
// its page and everything about it; the page's import map points the bare name 'city' at that
// folder's city.js (see core/game.html). Everything in core/ reads the city from here, so a
// city that lacks something (no landmarks, no LOOK) just leaves it undefined.
import * as C from 'city';
import { annex } from './interiors.js';

export const {
  ID, MAP, LANDMARKS, HOLLOWS, FACADES, FRONTS, SQUARES, SIGNALS, CROSSINGS, STOPS, TRAM_HALTS, TRAM_CENTRE, OLD_TOWN,
  BUS_LINES, FURNITURE, RACES, QUESTS, NAME, THEME, PLACES, LOOK, WORDS, STREETS, AREAS, BEACHES, RUNS, ROWING,
  TERRAIN, FAMOUS, TWO_LANES, TRAM_LINES, TRAM_STOPS, CHARACTERS, SIGHT_PAGES, MOUNDS, GROVES, TOUR, TOUR_PROPS, FREE_START, BUSY, QUARTERS,
  BIKE_STREETS, SHEEP, FULL_PARKING, PARKED_CARS, PARKED_BIKES, MAP_TREES, STREET_FURNITURE, TRAFFIC, BOATS, LOOKS, PORTALS, DEMO,
  ART_SPOTS, // famous pieces out in the open, where the city's models put them: [{ id, spot }] (game/artview.js)
} = C;

// The buildings to go into (<city>/inside.js, js/interiors.js): their rooms stand on the map as
// monuments of their own, out of the city's sight, and the cards in them join the city's sights.
export const INSIDE = annex(C.INSIDE, C.MAP);
export const MONUMENTS = [...(C.MONUMENTS ?? []), ...INSIDE.monuments];
// The cards from the city's landmark pages on the site (<city>/site-sights.js, tools/landmarks.mjs),
// for a city without hand-written ones there: one that stands where a hand-written sight is gives way.
const own = C.SIGHTS ?? [];
const SITE = (C.SITE_SIGHTS ?? []).filter(s => !own.some(o => Math.hypot(o.x - s.x, o.z - s.z) < o.r));
export const SIGHTS = [...own, ...SITE, ...INSIDE.sights];
// Where everybody goes on foot, whatever they ride (a city's ON_FOOT: flat [x, z, ...] rings, the
// houses of Pompeii built to walk into on their own ground), as in the buildings of INSIDE.
const FOOT = (C.ON_FOOT ?? []).map(p => {
  const xs = p.filter((_, k) => !(k % 2)), zs = p.filter((_, k) => k % 2);
  return { p, box: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)] };
});
export function onFootAt(x, z) {
  for (const { p, box } of FOOT) {
    if (x < box[0] || z < box[1] || x > box[2] || z > box[3]) continue;
    let c = false;
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
    if (c) return true;
  }
  return false;
}
