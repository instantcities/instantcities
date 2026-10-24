// The race tracks, from the city's races (js/city.js): each along its route through the one map.
import { MAP, RACES, THEME, AREAS } from './city.js';
import { realTrack } from './realtrack.js';
import { openUp } from './landmarks.js';
import { paveSquares } from './squares.js';
import { sinkHollows } from './hollows.js';

// the city with one of its routes as the race route, and what the download leaves out (the
// Blaarmeersen's lake and beaches) laid on its ground
const { routes, ...ground } = paveSquares(sinkHollows(openUp({ ...MAP, areas: MAP.areas.concat(AREAS ?? []) })));

export const TRACKS = RACES.map(race => realTrack({ theme: THEME, ...race, map: { ...ground, ...routes.find(rt => rt.id === race.id) } }));
