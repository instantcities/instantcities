// The buildings inside, each put up as a monument (core/js/landmarks.js) at its own place on the
// map, far from the others: ghentinside is one map with the three of them in a row. A monument's
// `foot` rings are what riders bump into, in the map's metres; make() builds it, round its own
// middle.
import { makeBaafs } from './baafs.js';
import { makeNiklaas } from './niklaas.js';
import { makeStadhuis } from './stadhuis.js';

// where each building's middle (the crossing of a church, the middle of a hall) lies
export const AT = { baafs: [0, 0], niklaas: [120, 0], stadhuis: [240, 0] };

const shift = (ring, x, z) => ring.map((v, k) => v + (k % 2 ? z : x));
const area = (x0, z0, x1, z1, [x, z]) => [x + x0, z + z0, x + x1, z + z0, x + x1, z + z1, x + x0, z + z1];

// (built once, on first asking: the rings are wanted when the map is made, the group when you come in sight)
function monument(id, name, at, box, build, extra = {}) {
  let built = null;
  const [x, z] = at, made = () => (built ??= build());
  return {
    id, name, x, z, turn: 0, size: 1, reach: 90,
    area: [area(...box, [x, z])],
    get foot() { return made().foot.map(r => shift(r, x, z)); },
    get door() { const d = made().door; return { x: x + d.x, z: z + d.z }; }, // just inside the door out, which rides out into the street (city.js PORTALS)
    make: () => made().group,
    ...extra,
  };
}

export const MONUMENTS = [
  monument('baafs-binnen', 'Sint-Baafskathedraal', AT.baafs, [-30, -62, 30, 56], makeBaafs),
  monument('stadhuis-binnen', 'Stadhuis', AT.stadhuis, [-15, -29, 15, 31], makeStadhuis),
  monument('niklaas-binnen', 'Sint-Niklaaskerk', AT.niklaas, [-26, -42, 26, 38], makeNiklaas),
];
