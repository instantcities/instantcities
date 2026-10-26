// Where things are. The map is centred on its race route and scaled up 1.25 from real metres to game
// metres (tools/osmbuild.mjs); map.geo says where its middle is, so a place can be given by its
// latitude and longitude, or by metres east and south of the middle of the stone circle.
import { MAP } from './map.js';

const G = MAP.geo;
export const S = G.s;
const ORIGIN = [51.17888, -1.82616]; // the middle of the circle
export const game = (lat, lon) => [
  Math.round(((lon - G.lon) * G.kx * G.s - G.cx) * 10) / 10,
  Math.round((-(lat - G.lat) * G.kz * G.s - G.cz) * 10) / 10,
];
export const CENTRE = game(...ORIGIN);
// metres east and south of the middle of the circle (real ones), in the map's metres
export const at = (east, south) => [CENTRE[0] + east * S, CENTRE[1] + south * S];
