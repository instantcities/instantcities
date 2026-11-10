// The city's car-free squares (<city>/squares.js): one floor of stone wall to wall, where
// the map only knows the streets across them.
import { SQUARES, STREET_PAVING, MAP } from './city.js';
import { inPolygon } from './collide.js';

// the square (x, z) is on, if any
export const squareAt = (x, z) => SQUARES.find(sq => inPolygon(x, z, sq.p));

// Whether (x, z) is on a street the city has paved wall to wall (STREET_PAVING, drawn by js/scenery.js
// with its kerbs): a race route along it leaves it its own stones, as across a square.
const PAVED = (() => {
  const names = new Set(Object.keys(STREET_PAVING ?? {}).map(n => MAP?.names?.indexOf(n)));
  return (MAP?.roads ?? []).filter(rd => names.has(rd.n) && rd.n >= 0).map(rd => ({ p: rd.p, r: (rd.foot ? rd.w : rd.w + 2.6) / 2 }));
})();
export function pavedStreetAt(x, z) {
  for (const { p, r } of PAVED) {
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], dx = p[k + 2] - ax, dz = p[k + 3] - az;
      const f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
      if (Math.hypot(ax + dx * f - x, az + dz * f - z) < r) return true;
    }
  }
  return false;
}

function centre(p) {
  let x = 0, z = 0;
  for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; }
  return [(2 * x) / p.length, (2 * z) / p.length];
}

// The map with its squares paved: a fountain on one is no water to wade through but jets out of
// the stones (map.fountains, its outlines), and the square itself is a paved area like any other.
export function paveSquares(map) {
  const fountain = a => a.k === 'water' && squareAt(...centre(a.p));
  return {
    ...map,
    areas: map.areas.filter(a => !fountain(a)).concat(SQUARES.map(sq => ({ k: 'paved', p: sq.p }))),
    fountains: map.areas.filter(fountain).map(a => a.p),
  };
}
