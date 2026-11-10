// The terraces on the Sint-Baafsplein, along the north side under the cathedral: three restaurants
// side by side, 't Vosken under its stepped gable and the two next to it towards the Biezekapelstraat
// (their fronts in ghent/fronts.js), each with its own tables and chairs out on the pavement and
// big parasols over them. They join the statues (ghent/monuments.js) and their chairs are sat on
// (js/sitters.js), nearly all of them taken.
import { terraces } from '../core/js/terrace.js';

// Each terrace: the wall it stands against ([x0, z0, x1, z1], the edge of the house's outline in
// map.js the front is drawn on), and how it looks: the chairs, the tables (round or square), the
// parasols' cloth (js/terrace.js). They stand out onto the square, to the south, and only a strip
// along the wall is in the way, so riders can still ride in among the tables.
const TERRACES = [
  { id: 'terras-vosken', wall: [198.1, -16.6, 206.7, -11.1], chair: 0x2f4a36, leg: 0x1e2a22, top: 0x8a6a4a, round: false, cloth: 0xefe6cf, rows: 3 },
  { id: 'terras-bridge', wall: [206.7, -11.1, 213.2, -7.4], chair: 0x9a7a52, leg: 0x3a3430, top: 0xe9e4da, round: true, cloth: 0x7d2a2a, rows: 3 },
  { id: 'terras-rechters', wall: [213.2, -7.4, 221.5, -5.0], chair: 0x1f2124, leg: 0x1f2124, top: 0xf5f1e8, round: false, cloth: 0x2b2f36, rows: 3 },
];

export const SINT_BAAFSPLEIN = terraces(TERRACES);
