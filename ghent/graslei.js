// Two terraces on the Graslei, the restaurants' in the guild houses along the Leie: rows of tables
// out on the quay in front of the Korenmetershuis and the Spijker, under big parasols, the tables
// laid. Between them and the water the quay stays free to walk along (the Graslei is car-free), and
// people still sit on its edge with their legs over the water (js/sitters.js). They join the statues
// (ghent/monuments.js) and their chairs are sat on (js/sitters.js), nearly all of them taken.
import { terraces } from '../core/js/terrace.js';

// Each terrace (js/terrace.js): the house front it stands against, the edge of its outline in map.js
// the way it stands out, and how it looks.
// They are deep: the riders, the lamps and the bins keep out from in among the tables, the walkers go round.
const W = [-1, 0];
const TERRACES = [
  // two on the Graslei, before the Korenmetershuis and the Spijker, out to the west over the quay
  // (no more than two: each is many chairs, tables and people, and phones run short of memory)
  { id: 'terras-korenmetershuis', wall: [-256.6, -170.5, -255.3, -185.9], out: W, rows: 3, chair: 0x2f4a36, leg: 0x1e2a22, top: 0x8a6a4a, round: false, cloth: 0x2b2f36 },
  { id: 'terras-spijker', wall: [-255.0, -189.3, -249.6, -209.3], out: W, rows: 3, chair: 0x6d4c41, leg: 0x2a2420, top: 0x5a3e2b, round: false, cloth: 0xf2ede2 },
].map(t => ({ ...t, deep: true, plates: true, shade: t.rows > 2 ? [2.4, 5.1] : [2.4] }));

export const GRASLEI = terraces(TERRACES);
