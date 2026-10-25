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
  BIKE_STREETS, SHEEP, FULL_PARKING, PARKED_CARS, TRAFFIC, BOATS, LOOKS, PORTALS, DEMO,
} = C;

// The buildings to go into (<city>/inside.js, js/interiors.js): their rooms stand on the map as
// monuments of their own, out of the city's sight, and the cards in them join the city's sights.
export const INSIDE = annex(C.INSIDE, C.MAP);
export const MONUMENTS = [...(C.MONUMENTS ?? []), ...INSIDE.monuments];
export const SIGHTS = [...(C.SIGHTS ?? []), ...INSIDE.sights];
