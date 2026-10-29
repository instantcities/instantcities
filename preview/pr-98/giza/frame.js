// Local real metres east and south of the site's origin; the map builder centres the race.
import { MAP } from './map.js';
export const S = 1.25;
const ORIGIN = [29.9792, 31.1342];
export function game(x, z) {
  const g = MAP.geo;
  const lat = ORIGIN[0] - z / 110540, lon = ORIGIN[1] + x / (111320 * Math.cos(ORIGIN[0] * Math.PI / 180));
  return [(lon - g.lon) * g.kx * g.s - g.cx, -(lat - g.lat) * g.kz * g.s - g.cz];
}
