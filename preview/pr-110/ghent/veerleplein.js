// The terraces on the Sint-Veerleplein, the square under the Gravensteen: nearly every house round
// it is a café or a restaurant these days, and their tables fill the square on a sunny day. Along
// the west side Neptune, 't Einde, Zénon and De Gans, along the south side 't Prison, Brasserie
// Paradijs and their neighbour, each with its own chairs and parasols. They join the statues
// (ghent/monuments.js) and their chairs are sat on (js/sitters.js).
import { terraces } from '../core/js/terrace.js';

// Each terrace (js/terrace.js): the house front it stands against, the edge of its outline in map.js,
// the way it stands out onto the square, and how it looks. The middle of the square stays open.
const E = [0.92, -0.39], N = [-0.3, -0.95];
const TERRACES = [
  // the west side, out to the east
  { id: 'terras-neptune', wall: [-255.9, -460.4, -251.4, -449.9], out: E, rows: 3, chair: 0x1f2124, leg: 0x1f2124, top: 0xf5f1e8, round: true, cloth: 0x2b2f36 },
  { id: 'terras-t-einde', wall: [-249.2, -444.8, -245.6, -436.7], out: E, rows: 2, chair: 0x6d4c41, leg: 0x2a2420, top: 0x5a3e2b, round: false, cloth: 0x7d2a2a },
  { id: 'terras-zenon-gans', wall: [-245.6, -436.7, -241.4, -426.7], out: E, rows: 2, chair: 0x2f4a36, leg: 0x1e2a22, top: 0x8a6a4a, round: false, cloth: 0xefe6cf },
  // the south side, out to the north
  { id: 'terras-veerleplein-5', wall: [-234.8, -428.4, -227.9, -430.1], out: N, rows: 2, chair: 0x9a7a52, leg: 0x3a3430, top: 0xe9e4da, round: true, cloth: 0x2f4a36 },
  { id: 'terras-prison', wall: [-227.8, -429.7, -220.7, -432.1], out: N, rows: 3, chair: 0x1f2124, leg: 0x1f2124, top: 0x8a6a4a, round: false, cloth: 0xf2ede2 },
  { id: 'terras-paradijs', wall: [-220.7, -432.1, -213.2, -434.6], out: N, rows: 3, chair: 0x6d4c41, leg: 0x2a2420, top: 0xf5f1e8, round: true, cloth: 0x7d2a2a },
].map(t => ({ ...t, deep: true, plates: true, shade: t.rows > 2 ? [2.4, 5.1] : [2.4] }));

export const VEERLEPLEIN = terraces(TERRACES);
