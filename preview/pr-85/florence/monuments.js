// Florence's statues out in the streets, built by hand (same shape as ghent/monuments.js): each
// { id, name, x, z (game metres, from its real position), turn (radians, 0 = facing south), size
// (the square of its base, which riders bump into), make() }.
import { Parts } from '../core/js/inside/gothic.js';
import { david } from '../core/js/inside/statues.js';

const PIETRA = 0x9c8460; // pietra forte, the brown sandstone of the Palazzo Vecchio
const PEDESTAL = 0xe6e0d2;

export const MONUMENTS = [
  // The copy of Michelangelo's David (1910) on the ringhiera of the Palazzo Vecchio, left of its
  // door, where the original stood from 1504 until it went to the Accademia in 1873; facing out
  // across Piazza della Signoria, away from the palace's front (/preview/pr-85/art/david/)
  { id: 'david', name: 'David', x: 256.5, z: 195.1, turn: -1.78, size: 4.4, make: statue },
];

// two steps of pietra forte, the marble pedestal with its moulding and cornice, David on top
function statue() {
  const p = new Parts({});
  p.stone.box(4.4, 0.4, 4.4, PIETRA, 0, 0.2, 0);
  p.stone.box(3.6, 0.4, 3.6, PIETRA, 0, 0.6, 0);
  p.marble.box(2.6, 0.3, 2.6, PEDESTAL, 0, 0.95, 0);
  p.marble.box(2.2, 1.8, 2.2, PEDESTAL, 0, 2.0, 0);
  p.marble.box(2.6, 0.3, 2.6, PEDESTAL, 0, 3.05, 0);
  david(p, 0, 3.2, 0);
  const g = p.mesh();
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
