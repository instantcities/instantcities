// The city's car-free squares (<city>/squares.js): one floor of stone wall to wall, where
// the map only knows the streets across them.
import { SQUARES } from './city.js';
import { inPolygon } from './collide.js';

// the square (x, z) is on, if any
export const squareAt = (x, z) => SQUARES.find(sq => inPolygon(x, z, sq.p));

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
