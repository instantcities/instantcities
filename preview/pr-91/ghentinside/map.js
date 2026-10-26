// The map of ghentinside: not downloaded but laid out by hand. There is no city here, only the
// floors of the buildings (ghentinside/monuments.js) side by side in a row, so the map is
// nearly empty: a footway along each building's aisles for the routes to run on, a zone round the
// whole row, and no houses, trees or water.
import { AT } from './monuments.js';

// A closed loop through these corners, a point every `step` metres.
function loop(corners, step = 3) {
  const out = [];
  corners.forEach((c, i) => {
    const d = corners[(i + 1) % corners.length], n = Math.max(1, Math.round(Math.hypot(d[0] - c[0], d[1] - c[1]) / step));
    for (let k = 0; k < n; k++) out.push([+(c[0] + ((d[0] - c[0]) * k) / n).toFixed(1), +(c[1] + ((d[1] - c[1]) * k) / n).toFixed(1)]);
  });
  return out;
}

// each building's walk: a loop that stays clear of the piers, through the aisles (a church) or round the halls,
// which the visitors walk
const WALKS = [
  { id: 'baafs', street: 'Beuk van de Sint-Baafs', at: AT.baafs, corners: [[-11, -52], [11, -52], [11, 36], [-11, 36]] },
  { id: 'niklaas', street: 'Beuk van de Sint-Niklaas', at: AT.niklaas, corners: [[-9, -34], [9, -34], [9, 24], [-9, 24]] },
  { id: 'stadhuis', street: 'Gang van het Stadhuis', at: AT.stadhuis, corners: [[-12, -22], [12, -22], [12, 22], [-12, 22]] },
];

const names = WALKS.map(w => w.street);
const roads = WALKS.map((w, n) => ({ w: 3, foot: true, n, p: loop(w.corners.map(([x, z]) => [x + w.at[0], z + w.at[1]])).flat() }));
// The routes the game wants to put a track on lie outside the walls, where nobody sees the asphalt
// and the street lamps along it, a loop each south of its building; the footways are inside.
const OUT = 100;
const routes = WALKS.map((w, n) => {
  const route = loop([[-9, 0], [9, 0], [9, 30], [-9, 30]].map(([x, z]) => [x + w.at[0], z + w.at[1] + OUT]));
  return { id: w.id, route, oneway: route.map(() => 0), streets: [w.street], street: route.map(() => 0), sett: route.map(() => 0) };
});

export const MAP = {
  routes, buildings: [], roads, names, areas: [], water: [], trees: [], shopStreets: [],
  zone: [-80, -140, 320, -140, 320, 140, -80, 140],
};
