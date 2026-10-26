// Where things are. The map is centred on its race route and scaled up 1.25 from real metres to game
// metres (tools/osmbuild.mjs); map.geo says where its middle is, so a place can be given by its
// latitude and longitude.
import { MAP } from './map.js';

const G = MAP.geo;
export const S = G.s;
export const game = (lat, lon) => [
  Math.round(((lon - G.lon) * G.kx * G.s - G.cx) * 10) / 10,
  Math.round((-(lat - G.lat) * G.kz * G.s - G.cz) * 10) / 10,
];
