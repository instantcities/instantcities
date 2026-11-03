// The race tracks, from the city's races (js/city.js): each along its route through the one map.
import { MAP, RACES, THEME, AREAS } from './city.js';
import { realTrack } from './realtrack.js';
import { openUp } from './landmarks.js';
import { paveSquares } from './squares.js';
import { sinkHollows } from './hollows.js';

// the city with one of its routes as the race route, and what the download leaves out (the
// Blaarmeersen's lake and beaches) laid on its ground. A city's area marked `instead` takes the place
// of the map's own one of that kind and outline (the Blaarmeersen's lake, which the map has without
// the hole of its wooded island, so the island's trees stood in the water).
const boxOf = p => { const b = [Infinity, Infinity, -Infinity, -Infinity]; for (let k = 0; k < p.length; k += 2) { b[0] = Math.min(b[0], p[k]); b[1] = Math.min(b[1], p[k + 1]); b[2] = Math.max(b[2], p[k]); b[3] = Math.max(b[3], p[k + 1]); } return b; };
const instead = (AREAS ?? []).filter(a => a.instead).map(a => ({ k: a.k, b: boxOf(a.p) }));
const replaced = a => instead.some(i => i.k === a.k && boxOf(a.p).every((v, n) => Math.abs(v - i.b[n]) < 5));
const { routes, ...ground } = paveSquares(sinkHollows(openUp({ ...MAP, areas: MAP.areas.filter(a => !replaced(a)).concat(AREAS ?? []) })));

export const TRACKS = RACES.map(race => realTrack({ theme: THEME, ...race, map: { ...ground, ...routes.find(rt => rt.id === race.id) } }));
