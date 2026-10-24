// The city the game is set in. Each city is a folder at the top of the site (ghent/, lecce/) with
// its page and everything about it; the page's import map points the bare name 'city' at that
// folder's city.js (see core/game.html). Everything in core/ reads the city from here, so a
// city that lacks something (no landmarks, no LOOK) just leaves it undefined.
import * as C from 'city';

export const {
  ID, MAP, LANDMARKS, HOLLOWS, FACADES, MONUMENTS, FRONTS, SQUARES, SIGNALS, CROSSINGS, STOPS, TRAM_HALTS, TRAM_CENTRE, OLD_TOWN,
  BUS_LINES, FURNITURE, RACES, QUESTS, SIGHTS, NAME, THEME, PLACES, LOOK, WORDS, STREETS, AREAS, BEACHES, RUNS,
  TERRAIN, FAMOUS, TWO_LANES, TRAM_LINES, TRAM_STOPS, CHARACTERS, SIGHT_PAGES, MOUNDS, GROVES, TOUR, FREE_START, BUSY, QUARTERS,
  BIKE_STREETS, SHEEP, FULL_PARKING, PARKED_CARS,
} = C;
