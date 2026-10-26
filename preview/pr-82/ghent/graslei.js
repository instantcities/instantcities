// The terraces on the Graslei, the restaurants' in the guild houses along the Leie: rows of tables
// out on the quay in front of the houses, from the old post office to De Witte Leeuw, under big
// parasols, the tables laid. Between them and the water the quay stays free to walk along (the
// Graslei is car-free), and people still sit on its edge with their legs over the water
// (js/sitters.js). They join the statues (ghent/monuments.js) and their chairs are sat on
// (js/sitters.js), nearly all of them taken.
import { terraces } from '../core/js/terrace.js';

// Each terrace (js/terrace.js): the house front it stands against, the edge of its outline in map.js
// the way it stands out, and how it looks.
// They are deep: the riders, the lamps and the bins keep out from in among the tables, the walkers go round.
const W = [-1, 0];
const TERRACES = [
  // on the Graslei, out to the west over the quay, before the guild houses and the houses beside
  // them: three rows deep before the Korenmetershuis and the Spijker, where the quay is widest, two
  // before the others
  { id: 'terras-graslei-15', wall: [-257.4, -140.8, -256.3, -154.7], out: W, rows: 2, chair: 0x1f2124, leg: 0x1f2124, top: 0xf5f1e8, round: true, cloth: 0x7d2a2a },
  { id: 'terras-vrije-schippers', wall: [-257.1, -154.7, -256.7, -167.9], out: W, rows: 2, chair: 0x9a7a52, leg: 0x3a3430, top: 0xe9e4da, round: false, cloth: 0xefe6cf },
  { id: 'terras-korenmetershuis', wall: [-256.6, -170.5, -255.3, -185.9], out: W, rows: 3, chair: 0x2f4a36, leg: 0x1e2a22, top: 0x8a6a4a, round: false, cloth: 0x2b2f36 },
  { id: 'terras-spijker', wall: [-255.0, -189.3, -249.6, -209.3], out: W, rows: 3, chair: 0x6d4c41, leg: 0x2a2420, top: 0x5a3e2b, round: false, cloth: 0xf2ede2 },
  // further south, where the quay turns to the south-east
  { id: 'terras-graslei-8', wall: [-244.8, -220.4, -240.4, -230.5], out: W, rows: 2, chair: 0x2f4a36, leg: 0x1e2a22, top: 0xf5f1e8, round: true, cloth: 0x2f4a36 },
  { id: 'terras-graslei-7', wall: [-237.0, -230.8, -232.0, -241.4], out: W, rows: 2, chair: 0x1f2124, leg: 0x1f2124, top: 0x8a6a4a, round: false, cloth: 0xf2ede2 },
  { id: 'terras-witte-leeuw', wall: [-232.0, -241.4, -227.3, -251.0], out: W, rows: 2, chair: 0x6d4c41, leg: 0x2a2420, top: 0xe9e4da, round: true, cloth: 0x7d2a2a },
].map(t => ({ ...t, deep: true, plates: true, shade: t.rows > 2 ? [2.4, 5.1] : [2.4] }));

export const GRASLEI = terraces(TERRACES);
