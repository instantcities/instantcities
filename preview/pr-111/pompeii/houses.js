// Ten of Pompeii's best-known houses and shops, built by hand on their own blocks of the map
// (plots.js) in place of the plain ruins the map would put there, open to the sky as the
// excavation left them, to walk (or ride) into through their doors:
//   the House of the Faun, the biggest in the town: its HAVE at the door, two atria, the bronze faun
//     dancing in the pool, two peristyles and between them the Alexander Mosaic
//   the House of the Vettii: its atrium with the two strongboxes, the garden, the black room with
//     the frieze of cupids
//   the House of the Tragic Poet, small, with CAVE CANEM at its door
//   the Lupanare: a corridor with five cells, a stone bed in each, small pictures over their doors
//   the House of Menander: its big peristyle, and Menander himself painted in an exedra
//   the Thermopolium of Vetutius Placidus: the L-shaped counter with its jars set in it, and the
//     shrine painted on the wall behind
//   the Fullery of Stephanus: the vats where cloth was washed and trodden
//   the Bakery of Popidius Priscus: four lava mills and the oven
//   the House of Octavius Quartio: its long garden down a canal under a pergola
//   the House of Venus in the Shell: Venus painted on the garden wall
// In game metres, each in its plot's frame: x along the street with its door, z into the block.
// The houses' plans follow the real ones in their main rooms, simplified, and they are furnished
// with what was found in them or in houses like them (domus.js). Their famous pictures and mosaics
// are photos of the real ones (art: an id in _data/art.json, its photo from tools/art.mjs), to look
// at full screen when you stand before one (game/artview.js), and each has its card. The House of
// the Vettii, of Menander, of Venus in the Shell, the Lupanare and the Thermopolium have been
// rebuilt and roofed again (whole: their walls at full height, roofs over atrium and colonnades).
import * as THREE from 'three';
import { plot } from './plots.js';
import { MAP } from '/pompeii/map.js';
import { Domus } from './domus.js';

const BRONZE = '#4f5a3a', LAVA = '#4a4640', TUFA = '#b7a585', WOOD = '#6b4526', MARBLE = '#e8e2d2';

// the outer walls of a plot W by D, its doorways in each side (doors.s/n/w/e) and the paint inside
function outer(d, W, D, { doors = {}, paint = {}, h = 4.5 } = {}) {
  d.door ??= doors.s?.[0]; // the front door, [x, width]: where a link to the house puts you (HOUSE_SIGHTS' arrival)
  d.wall([0, 0], [W, 0], { h, doors: doors.s, paint: { l: paint.s } });
  d.wall([W, 0], [W, D], { h, doors: doors.e, paint: { l: paint.e } });
  d.wall([0, D], [W, D], { h, doors: doors.n, paint: { r: paint.n } });
  d.wall([0, 0], [0, D], { h, doors: doors.w, paint: { r: paint.w } });
}

// a wall along x (z fixed) or along z (x fixed); l and r: paint on its +z / -z side (along x) or
// its -x / +x side (along z)
const wx = (d, z, x0, x1, o = {}) => d.wall([x0, z], [x1, z], { ...o, paint: { l: o.l, r: o.r } });
const wz = (d, x, z0, z1, o = {}) => d.wall([x, z0], [x, z1], { ...o, paint: { l: o.l, r: o.r } });

// the bronze faun, dancing, arms up, on his base in the pool
function faun(d, x, z) {
  const k = d.kit;
  k.box(0.9, 0.5, 0.9, MARBLE, x, 0.25, z);
  k.rod([x - 0.12, 0.5, z], [x - 0.2, 1.25, z + 0.1], 0.07, BRONZE);
  k.rod([x + 0.12, 0.5, z], [x + 0.08, 1.25, z - 0.05], 0.07, BRONZE);
  k.add(new THREE.CylinderGeometry(0.14, 0.12, 0.6, 8), BRONZE, x - 0.05, 1.55, z, 0.1, 0, 0.15);
  k.add(new THREE.SphereGeometry(0.13, 8, 6), BRONZE, x - 0.12, 2.0, z + 0.05);
  k.rod([x - 0.15, 1.75, z], [x - 0.45, 2.3, z + 0.1], 0.05, BRONZE);
  k.rod([x + 0.05, 1.75, z], [x + 0.35, 2.25, z - 0.1], 0.05, BRONZE);
  k.rod([x - 0.15, 1.3, z - 0.1], [x - 0.3, 1.5, z - 0.3], 0.03, BRONZE); // the tail
  d.ringAlong([x - 0.45, z], [x + 0.45, z], 0.9);
}

// a lava mill: the cone on its round base and the hourglass turned over it, the beams to push it round
function mill(d, x, z) {
  const k = d.kit;
  k.add(new THREE.CylinderGeometry(1.0, 1.05, 0.45, 16), TUFA, x, 0.22, z);
  k.add(new THREE.CylinderGeometry(0.2, 0.75, 1.1, 14), LAVA, x, 1.0, z);
  k.add(new THREE.CylinderGeometry(0.8, 0.35, 0.75, 14), LAVA, x, 1.35, z);
  k.add(new THREE.CylinderGeometry(0.35, 0.8, 0.75, 14), LAVA, x, 2.1, z);
  k.box(0.25, 0.25, 2.6, WOOD, x, 1.72, z);
  d.ringAlong([x - 1.05, z], [x + 1.05, z], 2.1);
}

// a stone bed with a pillow at one end, along x from x0, at z, in a cell of the Lupanare
function bed(d, x0, z, len, dir = 1) {
  d.solid(x0 + (dir * len) / 2, z, len, 1.1, 0.65, '#cbbd9e');
  d.kit.box(0.5, 0.2, 1.1, '#d8ccb0', x0 + dir * 0.3, 0.75, z);
}

// a cart: two spoked wheels, its bed, the shafts resting on the ground
function cart(d, x, z) {
  const k = d.kit;
  for (const s of [-1, 1]) {
    k.add(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 16), WOOD, x + s * 0.75, 0.62, z, 0, 0, Math.PI / 2);
    k.add(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8), '#3a2a1a', x + s * 0.75, 0.62, z, 0, 0, Math.PI / 2);
  }
  k.box(1.3, 0.12, 1.8, WOOD, x, 0.95, z);
  for (const s of [-1, 1]) { k.box(0.06, 0.4, 1.8, WOOD, x + s * 0.62, 1.2, z); k.rod([x + s * 0.35, 0.9, z + 0.9], [x + s * 0.3, 0.05, z + 2.8], 0.05, WOOD, 4); }
  d.ringAlong([x - 0.85, z], [x + 0.85, z], 2);
}

// a grey donkey, harnessed to a mill, walking round it
function donkey(d, x, z, yaw) {
  const k = d.kit, fx = Math.sin(yaw), fz = Math.cos(yaw), GREY = '#7a726a';
  k.box(0.45, 0.5, 1.1, GREY, x, 0.95, z, 0, yaw, 0);
  for (const [a, b] of [[-0.15, 0.4], [0.15, 0.4], [-0.15, -0.4], [0.15, -0.4]]) k.rod([x + Math.cos(yaw) * a + fx * b, 0.75, z - Math.sin(yaw) * a + fz * b], [x + Math.cos(yaw) * a + fx * b, 0, z - Math.sin(yaw) * a + fz * b], 0.06, '#5a524a', 4);
  k.rod([x + fx * 0.5, 1.1, z + fz * 0.5], [x + fx * 0.8, 1.45, z + fz * 0.8], 0.13, GREY, 5); // the neck
  k.box(0.26, 0.26, 0.5, GREY, x + fx * 0.95, 1.4, z + fz * 0.95, 0.5, yaw, 0);
  for (const s of [-1, 1]) k.box(0.05, 0.3, 0.08, '#4a443e', x + fx * 0.8 + Math.cos(yaw) * s * 0.09, 1.7, z + fz * 0.8 - Math.sin(yaw) * s * 0.09, 0, yaw, 0);
  k.rod([x - fx * 0.55, 1.05, z - fz * 0.55], [x - fx * 0.75, 0.6, z - fz * 0.75], 0.03, '#4a443e', 4); // the tail
}

// cloth hung to dry on a line between two posts, from a to b ([x, z])
function clothLine(d, a, b, colours) {
  const k = d.kit, L = Math.hypot(b[0] - a[0], b[1] - a[1]), yaw = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
  for (const [x, z] of [a, b]) k.rod([x, 0, z], [x, 2.3, z], 0.06, WOOD, 5);
  k.rod([a[0], 2.2, a[1]], [b[0], 2.2, b[1]], 0.015, '#d8cbb0', 3);
  const n = colours.length;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
    k.box((L / n) * 0.85, 1.2, 0.03, colours[i], x, 1.6, z, 0, yaw, 0);
  }
}

// a dolium in a counter: its mouth, dark, round, in the top
const dolium = (d, x, z, y) => d.kit.add(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 14), '#2a1e16', x, y, z);

const HOUSES = [
  {
    id: 'faun', side: 'r', emoji: '🗿', name: 'House of the Faun',
    plot: { front: 'Via della Fortuna', left: 'Vicolo del Fauno', right: 'Vicolo del Labirinto', back: 'Vicolo di Mercurio', inside: [-150, -120] },
    card: {
      en: { name: 'House of the Faun', text: 'The biggest house in Pompeii, a whole block, about 3,000 square metres. HAVE (welcome) is set in the floor at the door. A small bronze faun dances in the pool of the main atrium; there is a second atrium beside it, then two gardens with columns all round. Between them, in the open room, lay the Alexander Mosaic: Alexander the Great charging the Persian king Darius, of a million and a half tiny stones. The real one is in the museum in Naples.' },
      nl: { name: 'Huis van de Faun', text: 'Het grootste huis van Pompeii, een heel bouwblok, zo’n 3000 vierkante meter. Bij de deur staat HAVE (welkom) in de vloer. In de vijver van het grote atrium danst een kleine bronzen faun; ernaast ligt een tweede atrium, daarna twee tuinen met zuilen rondom. Tussen de twee, in de open zaal, lag het Alexandermozaïek: Alexander de Grote die de Perzische koning Darius aanvalt, van anderhalf miljoen steentjes. Het echte ligt in het museum van Napels.' },
    },
    build(d, W, D) {
      outer(d, W, D, { doors: { s: [[13, 2.6], [30, 2.2], [3, 3], [37, 3]] }, paint: { e: 'masonry', w: 'masonry', n: 'garden' } });
      d.mosaic(11.8, 0.2, 14.2, 1.4, 'have');
      // the shops either side at the front, the fauces, the main atrium with the faun
      wz(d, 6, 0, 6, {}); wx(d, 6, 0, 6, {}); wz(d, 34, 0, 6, {}); wx(d, 6, 34, 40, {});
      // the fauces, its walls in the First Style: plaster blocks painted like marble
      wz(d, 11.4, 0, 8, { r: 'masonry' }); wz(d, 14.6, 0, 8, { l: 'masonry' });
      d.floor(11.4, 0.2, 14.6, 8, 'sectile');
      wx(d, 8, 6, 11.4, { l: 'masonry' }); wx(d, 8, 14.6, 23.5, { l: 'masonry' });
      wz(d, 4, 8, 30, { r: 'masonry', doors: [[4, 2], [11, 2], [18, 2]] });
      wx(d, 15, 0, 4, {}); wx(d, 22, 0, 4, {});
      wz(d, 23.5, 0, 30, { l: 'masonry', r: 'yellow', doors: [[22, 2.4]] });
      d.floor(4, 8, 23.5, 30, 'black');
      d.pool(10.5, 15.5, 16.5, 22.5);
      faun(d, 13.5, 19);
      d.see('dancing-faun', [13.5, 13.4], [13.5, 19]);
      // the marble table behind the pool, lamp stands in the corners, a brazier
      d.table(13.5, 24.2);
      for (const [x, z] of [[5.2, 9.2], [22.3, 9.2], [5.2, 28.8], [22.3, 28.8]]) d.candelabrum(x, z, 1.5);
      d.brazier(19.5, 26.5);
      // the tablinum at the back of the atrium, and the second atrium with its four columns
      wx(d, 30, 0, 40, { l: 'red', r: 'red', doors: [[13, 6], [32, 3]] });
      wx(d, 6, 23.5, 34, { l: 'yellow', doors: [[30, 2.2]] });
      d.floor(23.5, 6, 40, 30, 'tesserae');
      d.pool(28, 14, 35, 22);
      for (const [x, z] of [[28, 14], [35, 14], [28, 22], [35, 22]]) d.column(x, z, 5.5, 0.4);
      d.puteal(31.5, 25.5); d.lararium(39, 26, -Math.PI / 2);
      // the first peristyle, its garden in the middle
      d.colonnade(6, 35, 34, 55, 3.2, 4.4);
      d.garden(8, 37, 32, 53, { trees: 1, shrubs: 8 });
      d.fountain(20, 45, 1.1);
      for (const [x, z] of [[11, 40], [29, 40], [11, 50], [29, 50]]) d.statue(x, z, 1.1, { herm: true });
      d.floor(0.3, 30.3, 39.7, 59.7, 'signinum', 0.035);
      // the exedra with the Alexander Mosaic, between the two gardens, and a dining room either side
      wx(d, 60, 0, 40, { l: 'red', r: 'red', doors: [[20, 9], [7, 2.2], [33, 2.2]] });
      wz(d, 14, 60, 68, { l: 'black', r: 'black' }); wz(d, 26, 60, 68, { l: 'black', r: 'black' });
      d.floor(14.3, 60.3, 25.7, 67.7, 'black', 0.045);
      // the Alexander Mosaic, at its real size, 5.82 by 3.13 metres
      d.mosaic(17.09, 62.4, 22.91, 65.53, 'alexander', 0.06, 'alexander-mosaic');
      for (const x of [16, 24]) for (const z of [60.6, 67.4]) d.column(x, z, 4.6, 0.32);
      wx(d, 68, 0, 40, { l: 'red', r: 'red', doors: [[20, 9], [7, 2.2], [33, 2.2]] });
      d.floor(0.3, 60.3, 13.7, 67.7, 'tesserae', 0.045); d.floor(26.3, 60.3, 39.7, 67.7, 'tesserae', 0.045);
      // the dining rooms either side, their couches round three walls
      d.triclinium(1, 61.4, 12.8, 67.2, 's'); d.triclinium(27.2, 61.4, 39, 67.2, 's');
      // the second, great peristyle: a garden with trees, columns all round
      d.colonnade(3.5, 72, 36.5, D - 4, 3.6, 4.4, 0.35);
      d.garden(6, 74, 34, D - 6, { trees: 6, shrubs: 16 });
      for (const z of [80, 92]) for (const x of [9, 31]) d.statue(x, z, 1.3);
      d.fountain(20, 86, 1.2);
    },
    sights: [
      { emoji: '🗿', at: [13.5, 19], r: 7, art: 'dancing-faun', en: { name: 'The Dancing Faun', text: 'A bronze faun (a satyr), dancing with his arms raised and his head thrown back, in the rainwater pool of the atrium. The house is named after him. This is a copy; the original is in Naples.' }, nl: { name: 'De dansende faun', text: 'Een bronzen faun (een sater) die danst met zijn armen omhoog en zijn hoofd achterover, in het regenwaterbassin van het atrium. Het huis is naar hem genoemd. Dit is een kopie; het origineel staat in Napels.' } },
      { emoji: '⚔️', at: [20, 64], r: 7, art: 'alexander-mosaic', en: { name: 'The Alexander Mosaic', text: 'Alexander the Great on his horse Bucephalus charges the Persian king Darius, who turns in his chariot and flees, at the battle of Issus in 333 BC. About 1.5 million stones, over 5 by 3 metres, copied from a Greek painting. Part of it was already lost in Roman times.' }, nl: { name: 'Het Alexandermozaïek', text: 'Alexander de Grote op zijn paard Bucephalus valt de Perzische koning Darius aan, die zich in zijn strijdwagen omdraait en vlucht, in de slag bij Issus in 333 v.Chr. Zo’n anderhalf miljoen steentjes, ruim 5 bij 3 meter, naar een Grieks schilderij. Een deel was in de Romeinse tijd al verloren.' } },
    ],
  },
  {
    id: 'vettii', side: 'l', emoji: '💰', name: 'House of the Vettii', whole: true,
    plot: { front: 'Vicolo dei Vetti', left: 'Vicolo di Mercurio', back: 'Via del Vesuvio', inside: [-120, -250], width: 40, depth: 40 },
    card: {
      en: { name: 'House of the Vettii', text: 'The house of two freed slaves, the brothers Aulus Vettius Restitutus and Aulus Vettius Conviva, who grew rich in trade. Their two strongboxes stand in the atrium for all visitors to see. The garden with its columns and fountains has been replanted, and the dining room has the best-known paintings of the town: on black walls, a frieze of little cupids making perfume, gold and wine.' },
      nl: { name: 'Huis van de Vettii', text: 'Het huis van twee vrijgelaten slaven, de broers Aulus Vettius Restitutus en Aulus Vettius Conviva, die rijk werden in de handel. Hun twee geldkisten staan in het atrium, zodat elke bezoeker ze zag. De tuin met zuilen en fonteinen is opnieuw beplant, en de eetzaal heeft de bekendste schilderingen van de stad: op zwarte wanden een fries van kleine cupido’s die parfum, goud en wijn maken.' },
    },
    build(d, W, D) {
      // rebuilt: the walls to their full height, painted up to 4.6 metres, roofs over the atrium and the colonnade
      const H = 5.8, P = 4.6;
      outer(d, W, D, { h: H, doors: { s: [[8, 2.4]] }, paint: { e: 'red', n: 'red' } });
      d.doorLeaves(8, 2.4);
      wz(d, 6.4, 0, 5, { h: H, ph: P, r: 'red' }); wz(d, 9.6, 0, 5, { h: H, ph: P, l: 'red' });
      wx(d, 5, 0, 6.4, { h: H, ph: P, l: 'black' }); wx(d, 5, 9.6, 17, { h: H, ph: P, l: 'black' });
      wz(d, 17, 5, 20, { h: H, ph: P, l: 'black', doors: [[7.5, 4.5]] });
      wx(d, 20, 0, 17, { h: H, ph: P, r: 'black', doors: [[5, 2], [12, 2]] });
      d.floor(0.3, 5, 17, 20, 'signinum');
      d.pool(6, 10, 10.5, 15);
      d.atriumRoof(0, 5, 17, 20, 5.5, 9.5, 11, 15.5, H, 4.8);
      d.table(8.25, 16.2); d.candelabrum(1.2, 18.8, 1.5); d.candelabrum(15.8, 18.8, 1.5);
      for (const x of [2, 15]) { d.solid(x, 7, 1.4, 0.9, 1.0, '#5a4630'); d.kit.box(1.5, 0.12, 1.0, '#a0783a', x, 1.05, 7); } // the strongboxes, iron-bound
      // the peristyle and its garden
      d.colonnade(20, 4, 37, 28, 3, 4.3, 0);
      d.roofStrip([37, 4], [20, 4], 4, 4.55, 5.5); d.roofStrip([20, 28], [37, 28], 3, 4.55, 5.5);
      d.roofStrip([20, 4], [20, 28], 3, 4.55, 5.5); d.roofStrip([37, 28], [37, 4], 3, 4.55, 5.5);
      d.garden(22, 6, 35, 26, { trees: 2, shrubs: 14 });
      // the fountains and the little statues that spouted water into the basins round the garden
      d.fountain(28.5, 11, 0.9); d.fountain(28.5, 21, 0.9);
      for (const [x, z] of [[22.8, 7], [34.2, 7], [22.8, 25], [34.2, 25]]) d.statue(x, z, 0.9);
      d.floor(17.3, 0.3, 39.7, 31, 'signinum', 0.035);
      // the black dining room with the cupids, and the yellow room beside it
      wx(d, 31, 17, 40, { h: H, ph: P, l: 'cupids', r: 'red', doors: [[6.5, 4]] });
      // the room of Pentheus beside it, and the cupids themselves on the dining room's wall
      wz(d, 30, 31, 40, { h: H, ph: P, l: 'cupids', r: 'yellow', pics: [{ side: 'r', u0: 3.4, u1: 5.6, y0: 1.3, y1: 3.5, art: 'death-of-pentheus' }, { side: 'l', u0: 1.5, u1: 7.5, y0: 1.5, y1: 2.35, art: 'cupids-of-the-vettii' }] });
      d.floor(17.3, 31.3, 29.7, 39.7, 'black', 0.045); d.floor(30.3, 31.3, 39.7, 39.7, 'tesserae', 0.045);
      d.roofStrip([17, 31], [40, 31], 9, 5.5, 5.8);
      d.brazier(34, 37.5);
      // the kitchen and the servants' rooms behind the atrium, the shrine of the household in their court
      wz(d, 8, 20, 40, { h: H, doors: [[4, 1.8]] }); wx(d, 30, 0, 8, { h: H, doors: [[4, 1.6]] });
      d.lararium(0.75, 26, Math.PI / 2);
      d.amphorae(1, 39.4, 5, { lean: 1 });
    },
    sights: [
      { emoji: '👼', at: [24, 35], r: 6, art: 'cupids-of-the-vettii', en: { name: 'The cupids frieze', text: 'Along the black walls of the dining room runs a band of tiny cupids at work as craftsmen: making perfume, working gold, pressing grapes, racing on goats.' }, nl: { name: 'Het fries met cupido’s', text: 'Langs de zwarte wanden van de eetzaal loopt een band met kleine cupido’s aan het werk als ambachtslui: ze maken parfum, bewerken goud, persen druiven en houden een race op geiten.' } },
      { emoji: '🍇', at: [35, 35.5], r: 4, art: 'death-of-pentheus', en: { name: 'The Death of Pentheus', text: 'King Pentheus of Thebes, who forbade the worship of Bacchus, torn apart by the god’s women followers, his own mother among them. One of three cruel myths painted in this small room.' }, nl: { name: 'De dood van Pentheus', text: 'Koning Pentheus van Thebe, die de verering van Bacchus verbood, verscheurd door de vrouwen die de god volgden, onder wie zijn eigen moeder. Een van drie wrede mythen die in deze kleine kamer geschilderd zijn.' } },
    ],
  },
  {
    id: 'poeta', side: 'l', emoji: '🐕', name: 'House of the Tragic Poet',
    plot: { front: 'Via delle Terme', left: 'Vicolo della Fullonica', inside: [-235, -45], width: 17, depth: 30 },
    card: {
      en: { name: 'House of the Tragic Poet', text: 'A middle-sized house, named after a painting of a poet reading to an audience. At its door a black dog on a chain is set in the floor, with CAVE CANEM: beware of the dog. Shops either side of the entrance, an atrium with rooms round it, and a small garden at the back.' },
      nl: { name: 'Huis van de tragische dichter', text: 'Een middelgroot huis, genoemd naar een schildering van een dichter die voorleest. Bij de deur ligt een zwarte hond aan een ketting in de vloer, met CAVE CANEM: pas op voor de hond. Winkels aan weerszijden van de ingang, een atrium met kamers eromheen en een kleine tuin achteraan.' },
    },
    build(d, W, D) {
      outer(d, W, D, { doors: { s: [[8.5, 2.2], [2.6, 3], [14.4, 3]] }, paint: { e: 'yellow', w: 'yellow', n: 'garden' } });
      wz(d, 5.2, 0, 6, {}); wz(d, 11.8, 0, 6, {});
      wz(d, 7.2, 0, 6, { r: 'red' }); wz(d, 9.8, 0, 6, { l: 'red' });
      d.mosaic(7.6, 0.5, 9.4, 2.7, 'cave', 0.06, 'cave-canem');
      d.doorLeaves(8.5, 2.2, 3.2);
      d.floor(7.2, 3.4, 9.8, 6, 'tesserae');
      wx(d, 6, 0, 7.2, { l: 'yellow' }); wx(d, 6, 9.8, 17, { l: 'yellow' });
      wz(d, 13, 6, 18, { r: 'red', l: 'yellow', doors: [[3, 1.6], [9, 1.6]] }); wx(d, 12, 13, 17, {});
      d.floor(0.3, 6, 13, 18, 'tesserae');
      d.pool(6.5, 9.5, 10.5, 13.5);
      d.table(8.5, 14.4); d.candelabrum(1, 7, 1.4); d.candelabrum(12.2, 7, 1.4);
      wx(d, 18, 0, 17, { l: 'red', r: 'yellow', doors: [[8.5, 5]] });
      wx(d, 22, 0, 12, { l: 'red', r: 'red', doors: [[8.5, 4]] }); wz(d, 12, 18, 30, { r: 'black', l: 'red', doors: [[8, 2]] });
      d.floor(0.3, 18.3, 12, 22, 'black', 0.045); d.floor(12.3, 18.3, 16.7, 29.7, 'tesserae', 0.045);
      for (const x of [2.5, 6, 9.5]) d.column(x, 24, 3.6, 0.26);
      d.garden(0.6, 25, 11.4, 29.4, { trees: 1, shrubs: 5 });
      // the shrine in the garden's corner, and on its back wall the Sacrifice of Iphigenia, where it was
      d.lararium(10.2, 29.2, Math.PI);
      d.wall([0.4, D - 0.4], [8.6, D - 0.4], { h: 3.6, t: 0.12, paint: { r: 'garden' }, pics: [{ side: 'r', u0: 2.6, u1: 5.4, y0: 0.9, y1: 3.4, art: 'sacrifice-of-iphigenia' }] });
    },
    sights: [
      { emoji: '🐕', at: [8.5, 1.5], r: 4, art: 'cave-canem', en: { name: 'Cave canem', text: 'Beware of the dog: a black dog with a red collar straining at its chain, in black and white stones at the front door. A warning, and a joke for the guests.' }, nl: { name: 'Cave canem', text: 'Pas op voor de hond: een zwarte hond met een rode halsband die aan zijn ketting trekt, in zwarte en witte steentjes bij de voordeur. Een waarschuwing, en een grap voor de gasten.' } },
      { emoji: '🗡️', at: [4.4, 26.5], r: 3.5, art: 'sacrifice-of-iphigenia', en: { name: 'The Sacrifice of Iphigenia', text: 'King Agamemnon’s daughter is carried to the altar so that the wind will take the Greek fleet to Troy; her father turns away and hides his face. The original, painted here on the garden wall, is in Naples.' }, nl: { name: 'Het offer van Iphigeneia', text: 'De dochter van koning Agamemnon wordt naar het altaar gedragen opdat de wind de Griekse vloot naar Troje brengt; haar vader keert zich af en verbergt zijn gezicht. Het origineel, hier op de tuinmuur geschilderd, is in Napels.' } },
    ],
  },
  {
    id: 'lupanare', side: 'l', emoji: '🏮', name: 'Lupanare', whole: true,
    plot: { front: 'Vicolo del Lupanare', left: 'Vicolo del Balcone Pensile', inside: [70, 8], width: 12, depth: 10 },
    card: {
      en: { name: 'The Lupanare', text: 'The town’s brothel, the only one built for the purpose: a corridor with five small cells, each with a bed of stone on which a mattress lay. Over the doors are small paintings of couples; on the walls, over a hundred graffiti scratched by the visitors. Upstairs were five more rooms, reached by their own stair from the street.' },
      nl: { name: 'Het Lupanar', text: 'Het bordeel van de stad, het enige dat ervoor gebouwd werd: een gang met vijf kleine cellen, elk met een stenen bed waarop een matras lag. Boven de deuren hangen kleine schilderingen van paartjes; op de muren staan meer dan honderd graffiti die de bezoekers erin krasten. Boven waren nog vijf kamers, met een eigen trap vanaf de straat.' },
    },
    build(d, W, D) {
      // two storeys and a roof, as it stands: the cells below, the upper floor's windows over the lanes
      outer(d, W, D, { h: 8, doors: { s: [[6, 2.2]], n: [[6, 2]] }, paint: {} });
      wz(d, 4, 0, D, { h: 4.6, l: 'graffiti', r: 'graffiti', doors: [[2.5, 1.1], [7.2, 1.1]], pics: [{ side: 'r', u0: 0.8, u1: 8.8, y0: 2.3, y1: 3.2, name: 'couples' }] });
      wz(d, 8, 0, D, { h: 4.6, l: 'graffiti', r: 'graffiti', doors: [[2.5, 1.1], [7.2, 1.1]], pics: [{ side: 'l', u0: 0.8, u1: 8.8, y0: 2.3, y1: 3.2, name: 'couples' }] });
      for (const x0 of [0, 8]) wx(d, 5, x0, x0 + 4, { h: 4.6, l: 'graffiti', r: 'graffiti' });
      d.roofQuad([[0, 4.65, 0], [W, 4.65, 0], [W, 4.65, D], [0, 4.65, D]], W, D); // the upper floor, seen from below its beams
      for (let z = 0.8; z < D; z += 1.2) d.kit.box(W, 0.18, 0.16, '#6b4526', W / 2, 4.5, z);
      d.roofQuad([[-0.4, 7.6, -0.4], [W + 0.4, 7.6, -0.4], [W + 0.4, 8.6, D / 2], [-0.4, 8.6, D / 2]], W + 0.8, D / 2 + 0.6);
      d.roofQuad([[-0.4, 8.6, D / 2], [W + 0.4, 8.6, D / 2], [W + 0.4, 7.6, D + 0.4], [-0.4, 7.6, D + 0.4]], W + 0.8, D / 2 + 0.6);
      for (const x of [2, 6, 10]) for (const z of [-0.27, D + 0.27]) d.kit.box(0.9, 1.1, 0.06, '#2a2420', x, 6.2, z);
      // a lamp in the corridor, the latrine under the stair at its end
      d.candelabrum(6, 5, 1.6);
      d.solid(7.3, 9.3, 1.0, 0.7, 0.5, '#cbbd9e'); d.kit.add(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 10), '#1f1b17', 7.3, 0.51, 9.3);
      d.floor(0.3, 0.3, 11.7, 9.7, 'signinum');
      bed(d, 0.4, 2.6, 2.6, 1); bed(d, 0.4, 7.4, 2.6, 1); bed(d, 11.6, 2.6, 2.6, -1); bed(d, 11.6, 7.4, 2.6, -1);
    },
  },
  {
    id: 'menandro', side: 'r', emoji: '🎭', name: 'House of Menander', whole: true,
    plot: { front: 'Vicolo del Menandro', left: 'Vicolo del Citarista', right: 'Vicolo di Paquius Proculus', inside: [390, 95], from: 18, width: 46, depth: 46 },
    card: {
      en: { name: 'House of Menander', text: 'One of the grandest houses of the town, with its own bath suite and a big garden with columns all round. In an exedra off the garden the Greek comic poet Menander sits painted in his chair, reading. In 1930 a hoard of 118 pieces of silver tableware was found in the cellar.' },
      nl: { name: 'Huis van Menander', text: 'Een van de deftigste huizen van de stad, met eigen baden en een grote tuin met zuilen rondom. In een exedra aan de tuin zit de Griekse blijspeldichter Menander geschilderd in zijn stoel, aan het lezen. In 1930 vond men in de kelder een schat van 118 stukken zilveren tafelgerei.' },
    },
    build(d, W, D) {
      const H = 5.8, P = 4.4;
      outer(d, W, D, { h: H, doors: { s: [[12, 2.6]] }, paint: { w: 'red', n: 'red', e: 'yellow' } });
      d.doorLeaves(12, 2.6);
      wz(d, 10.6, 0, 4, { h: H, ph: P, r: 'red' }); wz(d, 13.4, 0, 4, { h: H, ph: P, l: 'red' });
      wx(d, 4, 0, 10.6, { h: H, ph: P, l: 'red' }); wx(d, 4, 13.4, 22, { h: H, ph: P, l: 'red' });
      wz(d, 22, 0, 20, { h: H, ph: P, l: 'red', doors: [[10, 2]] });
      wz(d, 4, 4, 20, { h: H, ph: P, r: 'red', doors: [[4, 1.8], [11, 1.8]] });
      d.floor(4, 4, 22, 20, 'signinum');
      d.pool(10, 9, 15, 14);
      d.atriumRoof(4, 4, 22, 20, 9.5, 8.5, 15.5, 14.5, H, 4.8);
      d.lararium(21.15, 17.6, -Math.PI / 2); // the shrine in the corner of the atrium
      d.table(12.5, 15.3); d.candelabrum(5, 18.8, 1.5); d.brazier(7, 6);
      wx(d, 20, 0, 22, { h: H, ph: P, r: 'black', l: 'red', doors: [[13, 6]] });
      d.floor(9, 20.3, 17, 24, 'black', 0.045);
      // the peristyle and its garden, the exedra with Menander at the back
      d.colonnade(4, 26, 40, 40, 3.3, 4.3, 0);
      d.roofStrip([40, 26], [4, 26], 6, 4.55, 5.6); d.roofStrip([4, 40], [40, 40], 2, 4.55, 5.2);
      d.roofStrip([4, 26], [4, 40], 4, 4.55, 5.5); d.roofStrip([40, 40], [40, 26], 6, 4.55, 5.6);
      d.garden(6.5, 28, 37.5, 38, { trees: 3, shrubs: 12 });
      d.fountain(22, 33, 1); for (const x of [9, 35]) d.statue(x, 33, 1.2, { herm: true });
      d.floor(0.3, 20.3, 45.7, 45.7, 'signinum', 0.035);
      wz(d, 28, 42, 46, { r: 'red', l: 'red' }); wz(d, 34, 42, 46, { r: 'red', l: 'red' });
      wx(d, 42, 0, 28, { l: 'red' }); wx(d, 42, 34, 46, { l: 'red' });
      d.wall([28, D - 0.3], [34, D - 0.3], { h: 4.5, t: 0.12, paint: { r: 'red' }, pics: [{ side: 'r', u0: 1.8, u1: 4.2, y0: 0.5, y1: 3.5, name: 'menander', art: 'menander' }] });
      // the bath rooms, off the atrium to the east, and the stable yard with its cart and amphorae
      wx(d, 12, 22, 46, { h: H, r: 'yellow', l: 'yellow', doors: [[6, 1.8]] }); wz(d, 34, 0, 12, { h: H, doors: [[6, 1.6]] });
      cart(d, 40, 4.5); d.amphorae(45.4, 1.2, 6, { along: 'z', lean: 1 });
    },
    sights: [
      { emoji: '📜', at: [31, 43.5], r: 5, art: 'menander', en: { name: 'Menander', text: 'The Greek poet Menander (342–290 BC), who wrote comedies about ordinary families, sits in his chair with a scroll, an ivy wreath on his head. His name is written under him.' }, nl: { name: 'Menander', text: 'De Griekse dichter Menander (342–290 v.Chr.), die blijspelen schreef over gewone families, zit in zijn stoel met een boekrol en een krans van klimop op zijn hoofd. Zijn naam staat eronder.' } },
    ],
  },
  {
    id: 'thermopolium', side: 'r', emoji: '🍷', name: 'Thermopolium', whole: true, // (on the big map; its card has the full name)
    plot: { front: "Via dell'Abbondanza", left: 'Vicolo del Efebo', inside: [425, -45], from: 12, width: 11, depth: 16 },
    arrive: { at: [4, 5.6], look: [3, 0] }, // behind the counter (the door is all counter), looking out over it
    card: {
      en: { name: 'Thermopolium of Vetutius Placidus', text: 'A street bar, one of about 150 in Pompeii, where people bought hot food and wine at the counter. Jars for the food are set in the counter’s top, which is clad with bits of coloured marble. On the wall behind, the shrine of the house: the god Mercury for profit, Bacchus for wine. The family lived in the rooms behind.' },
      nl: { name: 'Thermopolium van Vetutius Placidus', text: 'Een straatkroeg, een van de zo’n 150 in Pompeii, waar men aan de toog warm eten en wijn kocht. In het blad van de toog, bekleed met stukjes gekleurd marmer, zitten de potten voor het eten. Op de muur erachter het huisaltaar: de god Mercurius voor de winst, Bacchus voor de wijn. De familie woonde in de kamers erachter.' },
    },
    build(d, W, D) {
      outer(d, W, D, { h: 6, doors: { s: [[4.5, 7]] }, paint: { e: 'red', w: 'red' } });
      d.roofStrip([0, 0.1], [W, 0.1], 7, 5.2, 6); // the bar's roof, from the street front up to the back wall
      // the L-shaped counter, its marble top, the jars in it, and steps for the cups behind
      d.solid(3.6, 2.6, 5.2, 0.9, 1.05, '#c8b69a');
      d.solid(6.6, 3.9, 0.9, 3.5, 1.05, '#c8b69a');
      d.floor(1, 2.15, 6.2, 3.05, 'marble', 1.06); d.floor(6.15, 2.15, 7.05, 5.65, 'marble', 1.065);
      for (const x of [2, 3.6, 5.2]) dolium(d, x, 2.6, 1.08);
      dolium(d, 6.6, 4.4, 1.085);
      d.kit.box(4, 0.25, 0.5, '#c8b69a', 3.6, 1.25, 3.2); d.kit.box(4, 0.25, 0.4, '#c8b69a', 3.6, 1.5, 3.4);
      // on the steps the jugs and cups; behind the counter amphorae of wine, a brazier to keep the food hot
      for (let x = 1.9; x < 5.6; x += 0.45) d.kit.add(new THREE.CylinderGeometry(0.06, 0.05, 0.16, 8), x % 0.9 < 0.45 ? '#b0643a' : '#8a6a3a', x, 1.71, 3.4);
      for (let x = 2.1; x < 5.6; x += 0.7) d.kit.add(new THREE.CylinderGeometry(0.1, 0.08, 0.22, 8), '#a85a32', x, 1.48, 3.2);
      d.amphorae(7.6, 6.5, 6, { lean: 1 }); d.brazier(1.2, 5.6);
      wx(d, 7, 0, W, { h: 6, r: 'red', l: 'white', doors: [[9, 1.6]], pics: [{ side: 'r', u0: 3.2, u1: 6.2, y0: 1.2, y1: 3.6, name: 'lararium', art: 'lararium-of-vetutius-placidus' }] });
      d.floor(0.3, 0.3, W - 0.3, 7, 'signinum');
      // the dining room and the little garden behind
      wz(d, 6, 7, D, { l: 'red', r: 'yellow', doors: [[4, 1.6]] });
      d.floor(0.3, 7.3, 6, 15.7, 'tesserae', 0.045);
      d.garden(6.3, 7.3, 10.7, 15.7, { trees: 1, shrubs: 3 });
      d.triclinium(0.6, 8, 5.6, 15.4, 'e');
    },
    sights: [
      { emoji: '🐍', at: [4.7, 5], r: 3, art: 'lararium-of-vetutius-placidus', en: { name: 'The shrine behind the counter', text: 'The household gods of the bar, painted like a little temple: the genius of the master between two dancing lares, Mercury for profit on the left, Bacchus for wine on the right, two snakes below.' }, nl: { name: 'Het altaar achter de toog', text: 'De huisgoden van de kroeg, geschilderd als een tempeltje: de genius van de baas tussen twee dansende lares, links Mercurius voor de winst, rechts Bacchus voor de wijn, onderaan twee slangen.' } },
    ],
  },
  {
    id: 'fullonica', side: 'r', emoji: '🧺', name: 'Fullery of Stephanus',
    plot: { front: "Via dell'Abbondanza", left: 'Vicolo del Citarista', right: 'Vicolo di Paquius Proculus', inside: [315, 25], from: 26, width: 15, depth: 26 },
    card: {
      en: { name: 'Fullery of Stephanus', text: 'A laundry, set up in a house: cloth was washed in the big vats at the back, then trodden clean in the small tubs in a mix of water, clay and urine, which the fullers collected in jars in the street. A big press stood at the front, and the cloth dried on the roof.' },
      nl: { name: 'Wasserij van Stephanus', text: 'Een wasserij, ingericht in een woonhuis: in de grote kuipen achteraan werd stof gewassen, en in de kleine bakken schoongetrapt in een mengsel van water, klei en urine, die de wassers in kruiken op straat inzamelden. Vooraan stond een grote pers, en de stof droogde op het dak.' },
    },
    build(d, W, D) {
      outer(d, W, D, { doors: { s: [[7.5, 3.6]] }, paint: { e: 'white', w: 'white' } });
      // the press at the front
      d.kit.box(0.25, 2.6, 0.25, '#5a4030', 2, 1.3, 2.5); d.kit.box(0.25, 2.6, 0.25, '#5a4030', 4, 1.3, 2.5);
      d.kit.box(2.4, 0.3, 0.4, '#5a4030', 3, 2.5, 2.5); d.solid(3, 2.5, 2.2, 0.8, 0.8, '#6b4526');
      wx(d, 6, 0, W, { l: 'white', r: 'white', doors: [[7.5, 2.4]] });
      d.floor(0.3, 0.3, W - 0.3, 6, 'signinum');
      // the jars by the door, where passers-by left the urine the fullers washed with
      d.dolium(11.5, 1.2, 0.9); d.dolium(12.8, 1.4, 0.8); d.dolium(13.9, 1.1, 0.85);
      // the atrium, its pool made deeper to rinse in, cloth drying on lines either side
      d.pool(5, 9, 10, 13);
      clothLine(d, [1, 8], [1, 14.5], ['#e6dcc6', '#9b2b1f', '#e6dcc6', '#d49a2e']);
      clothLine(d, [14, 8], [14, 14.5], ['#3a5a8a', '#e6dcc6', '#7a3a8a', '#e6dcc6']);
      wx(d, 16, 0, W, { r: 'white', l: 'white', doors: [[7.5, 3]] });
      d.floor(0.3, 6.3, W - 0.3, 16, 'signinum');
      // the three big vats, and the treading tubs behind them
      for (const [x, w] of [[3, 3.6], [7.5, 3.6], [12, 3.6]]) {
        d.solid(x, 18.6, w, 0.3, 1.1, '#cbbd9e'); d.solid(x, 20.6, w, 0.3, 1.1, '#cbbd9e');
        d.kit.box(w - 0.2, 0.05, 1.8, '#7a9aa0', x, 0.8, 19.6);
      }
      for (let k = 0; k < 5; k++) { const x = 2 + k * 2.75; d.solid(x, 23.6, 1.6, 1.6, 0.85, '#bfae8e'); d.kit.box(1.2, 0.05, 1.2, '#8aa0a0', x, 0.87, 23.6); }
      d.floor(0.3, 16.3, W - 0.3, D - 0.3, 'lava', 0.035);
    },
  },
  {
    id: 'forno', side: 'r', emoji: '🍞', name: 'Bakery of Popidius Priscus',
    plot: { front: 'Vicolo Storto', inside: [-82, -60], width: 22, depth: 22 },
    card: {
      en: { name: 'Bakery of Popidius Priscus', text: 'One of the town’s 30 or so bakeries. Donkeys walked round the four mills of grey lava, turning the hourglass-shaped upper stone over the cone below, and flour ran out at the bottom. The bread was baked in the big oven behind them; loaves of it, burnt black, were found in another bakery in the town.' },
      nl: { name: 'Bakkerij van Popidius Priscus', text: 'Een van de zo’n 30 bakkerijen van de stad. Ezels liepen rond de vier molens van grijze lava en draaiden de zandlopervormige bovensteen over de kegel eronder, waarna het meel er onderaan uitliep. Het brood werd gebakken in de grote oven erachter; zwartgeblakerde broden werden in een andere bakkerij van de stad gevonden.' },
    },
    build(d, W, D) {
      outer(d, W, D, { doors: { s: [[11, 3]] }, paint: { e: 'white', w: 'white' } });
      d.floor(0.3, 0.3, W - 0.3, D - 0.3, 'lava');
      for (const [x, z] of [[5, 6], [11, 5], [17, 6], [11, 11]]) mill(d, x, z);
      donkey(d, 5 + 1.9, 6, 0); // walking round the first mill
      // the round loaves on a board before the oven's mouth, cut in eight, the wood for the fire,
      // the kneading table, sacks of grain and amphorae by the wall
      d.kit.box(1.8, 0.08, 0.6, '#8a6a3a', 11, 1.05, 14.9); d.kit.box(0.12, 1.0, 0.5, '#5a4030', 10.3, 0.5, 14.9); d.kit.box(0.12, 1.0, 0.5, '#5a4030', 11.7, 0.5, 14.9);
      for (const x of [10.4, 10.85, 11.3, 11.75]) d.kit.add(new THREE.CylinderGeometry(0.17, 0.19, 0.08, 10), '#8a5a2a', x, 1.13, 14.9);
      for (let k = 0; k < 7; k++) d.kit.rod([14.6 + (k % 3) * 0.05, 0.12 + Math.floor(k / 3) * 0.16, 16.2 + (k % 3) * 0.18], [16.2, 0.12 + Math.floor(k / 3) * 0.16, 16 + (k % 3) * 0.18], 0.07, '#6b4a30', 5);
      d.solid(19, 12, 2.4, 0.9, 0.85, '#7a5434'); d.kit.box(1.0, 0.12, 0.5, '#e6dcc6', 18.7, 0.92, 12);
      for (const [x, z] of [[20.8, 2], [20.8, 2.8], [20.2, 2.4]]) d.kit.add(new THREE.SphereGeometry(0.38, 8, 6), '#c8b69a', x, 0.34, z, 0, 0, 0);
      d.amphorae(1, 21.4, 7, { lean: 1 });
      // the oven: a block of brick with a dome and its dark mouth, the chimney
      const k = d.kit;
      d.solid(11, 18, 6, 4.5, 2.2, '#9a5a40');
      k.add(new THREE.SphereGeometry(2.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#a0624a', 11, 2.2, 18);
      k.box(1.6, 1.2, 0.2, '#1f1b17', 11, 1.4, 15.7);
      k.box(1.2, 2, 1.2, '#9a5a40', 13.5, 4, 19.5);
      wx(d, 14, 0, 6, { l: 'white', doors: [[3, 1.6]] }); wx(d, 14, 16, W, { l: 'white', doors: [[3, 1.6]] });
      wz(d, 6, 14, D, {}); wz(d, 16, 14, D, {});
    },
  },
  {
    id: 'quartio', side: 'r', emoji: '🌿', name: 'House of Octavius Quartio',
    sights: [
      { emoji: '💔', at: [3, 25], r: 3.5, art: 'pyramus-and-thisbe', en: { name: 'Pyramus and Thisbe', text: 'Two young lovers of Babylon: Pyramus, thinking Thisbe killed by a lioness, has stabbed himself, and she, coming back, raises the sword to follow him. Painted by the couch where the family ate outdoors.' }, nl: { name: 'Pyramus en Thisbe', text: 'Twee jonge geliefden uit Babylon: Pyramus, die dacht dat een leeuwin Thisbe had gedood, heeft zichzelf doorstoken, en zij komt terug en heft het zwaard om hem te volgen. Geschilderd bij het ligbed waar de familie buiten at.' } },
      { emoji: '🪞', at: [3, 28.8], r: 3.5, art: 'narcissus', en: { name: 'Narcissus', text: 'The beautiful hunter who turned everyone away and fell in love with his own reflection in a spring, and stayed looking at it until he died.' }, nl: { name: 'Narcissus', text: 'De mooie jager die iedereen afwees en verliefd werd op zijn eigen spiegelbeeld in een bron, en ernaar bleef kijken tot hij stierf.' } },
    ],
    plot: { front: "Via dell'Abbondanza", left: 'Vicolo di Octavius Quartio', back: 'Via di Castricio', inside: [680, -150], width: 38 },
    card: {
      en: { name: 'House of Octavius Quartio', text: 'A modest house in front, and behind it a garden almost the length of the block, laid out like a country villa’s: a long canal down the middle under a pergola of vines, with fountains, little statues and fishponds. At its head is an outdoor dining couch with paintings of Pyramus and Thisbe and of Narcissus.' },
      nl: { name: 'Huis van Octavius Quartio', text: 'Vooraan een bescheiden huis, en daarachter een tuin die bijna zo lang is als het bouwblok, aangelegd als die van een landhuis: een lang kanaal door het midden onder een pergola met wijnranken, met fonteinen, beeldjes en visvijvers. Bovenaan staat een buitenligbed om te eten, met schilderingen van Pyramus en Thisbe en van Narcissus.' },
    },
    build(d, W, D) {
      outer(d, W, D, { doors: { s: [[9, 2.6]] }, paint: { w: 'garden', e: 'garden', n: 'garden' } });
      d.doorLeaves(9, 2.6, 3.6); // the big double door on the street
      wz(d, 7.6, 0, 4, { r: 'red' }); wz(d, 10.4, 0, 4, { l: 'red' });
      wx(d, 4, 0, 7.6, { l: 'red' }); wx(d, 4, 10.4, 22, { l: 'red' });
      wz(d, 22, 0, 22, { l: 'red', doors: [[10, 2]] });
      d.floor(0.3, 4, 22, 22, 'signinum');
      d.pool(8, 9, 13, 14);
      d.table(10.5, 15.2); d.lararium(21.15, 18, -Math.PI / 2);
      wx(d, 22, 0, W, { r: 'red', l: 'white', doors: [[12, 3], [30, 3]] });
      // the upper terrace with its cross-canal, and the dining couch at its end under the paintings
      d.floor(0.3, 22.3, W - 0.3, 31, 'signinum', 0.035);
      d.solid(19, 26.5, 30, 1.2, 0.5, MARBLE); d.kit.box(29.6, 0.06, 0.8, '#6f98a4', 19, 0.52, 26.5);
      d.solid(2.2, 26.5, 1.4, 3.4, 0.7, '#cbbd9e'); d.solid(4.6, 28.6, 3.4, 1.4, 0.7, '#cbbd9e');
      // the paintings either side of the couch: Pyramus and Thisbe, and Narcissus at the spring
      d.wall([0.4, 23], [0.4, 30], { h: 3.6, t: 0.2, paint: { r: 'white' }, pics: [{ side: 'r', u0: 0.9, u1: 2.5, y0: 0.9, y1: 3.2, name: 'pyramus', art: 'pyramus-and-thisbe' }, { side: 'r', u0: 4.5, u1: 6.1, y0: 0.9, y1: 3.2, art: 'narcissus' }] });
      // the little shrine at the head of the canal, its temple front over a niche
      d.lararium(19, 28.3, 0);
      // the long canal down the garden, its rim, the pergola over it, and the beds either side
      const z0 = 33, z1 = D - 3;
      d.solid(19, (z0 + z1) / 2, 0.3, z1 - z0, 0.5, MARBLE, Math.PI / 2);
      d.kit.box(1.6, 0.4, z1 - z0, MARBLE, 19, 0.2, (z0 + z1) / 2);
      d.kit.box(1.2, 0.06, z1 - z0 - 0.4, '#6f98a4', 19, 0.42, (z0 + z1) / 2);
      for (let z = z0; z <= z1; z += 3.2) for (const x of [16.5, 21.5]) d.kit.box(0.3, 3, 0.3, STUCCO_POST, x, 1.5, z);
      for (const x of [16.5, 21.5]) d.kit.box(0.2, 0.2, z1 - z0, WOOD, x, 3.05, (z0 + z1) / 2);
      for (let z = z0; z <= z1; z += 1.6) d.kit.box(5.4, 0.12, 0.12, WOOD, 19, 3.15, z);
      d.garden(1.5, z0, 15, z1, { trees: 6, shrubs: 14 });
      d.garden(23, z0, W - 1.5, z1, { trees: 6, shrubs: 14 });
      // statues along the canal, the little fountains in it
      for (let z = z0 + 4; z < z1 - 2; z += 9) { d.statue(15.6, z, 0.9, { herm: (z / 9) % 2 < 1 }); d.statue(22.4, z + 4.5, 0.9, { herm: (z / 9) % 2 >= 1 }); }
      for (let z = z0 + 8; z < z1 - 2; z += 16) d.kit.add(new THREE.ConeGeometry(0.06, 0.6, 6), '#cfe2e8', 19, 0.75, z);
    },
  },
  {
    id: 'venere', side: 'l', emoji: '🐚', name: 'House of Venus in the Shell', whole: true,
    plot: { front: "Via dell'Abbondanza", left: 'Vicolo di Octavius Quartio', back: 'Via di Castricio', inside: [700, -175], from: 46, width: 34, depth: 64 },
    card: {
      en: { name: 'House of Venus in the Shell', text: 'A house with a garden on two sides of a colonnade, and on its back wall a big painting: Venus lying in a pink shell on a blue sea, with two cupids, between painted gardens full of birds. The house was found in 1952, damaged by bombs dropped on Pompeii in 1943.' },
      nl: { name: 'Huis van de Venus in de Schelp', text: 'Een huis met een tuin langs twee kanten van een zuilengang, en op de achtermuur een grote schildering: Venus die in een roze schelp op een blauwe zee ligt, met twee cupido’s, tussen geschilderde tuinen vol vogels. Het huis werd gevonden in 1952, beschadigd door de bommen die in 1943 op Pompeii vielen.' },
    },
    build(d, W, D) {
      outer(d, W, D, { h: 5.4, doors: { s: [[6, 2.4]] }, paint: { w: 'red', e: 'garden' } });
      d.doorLeaves(6, 2.4);
      wz(d, 4.6, 0, 4, { r: 'red' }); wz(d, 7.4, 0, 4, { l: 'red' });
      wx(d, 4, 0, 4.6, { l: 'red' }); wx(d, 4, 7.4, 16, { l: 'red' });
      wz(d, 16, 0, 18, { l: 'red', doors: [[9, 2]] });
      d.floor(0.3, 4, 16, 18, 'signinum');
      d.pool(6, 8, 10.5, 12.5);
      d.table(8.25, 13.6); d.candelabrum(1.2, 16.8, 1.4);
      wx(d, 18, 0, 16, { r: 'red', doors: [[8, 4]] });
      // the colonnade along the north and west of the garden, the garden, and Venus on the wall
      for (let x = 3; x <= W - 3; x += 3.4) d.column(x, 21, 4, 0.28);
      for (let z = 24.4; z <= D - 6; z += 3.4) d.column(3, z, 4, 0.28);
      d.roofStrip([W - 3, 21], [3, 21], 3, 4.45, 5.3); d.roofStrip([3, 21], [3, D - 6], 3, 4.45, 5.3);
      d.floor(0.3, 18.3, W - 0.3, 22.5, 'signinum', 0.035);
      d.garden(5, 23.5, W - 1.5, D - 1.5, { trees: 3, shrubs: 14 });
      d.fountain(19, 40, 1); d.statue(9, 30, 1.2);
      d.wall([0, D - 0.3], [W, D - 0.3], { h: 5, t: 0.2, paint: { r: 'garden' }, pics: [{ side: 'r', u0: 13.5, u1: 20.5, y0: 0.6, y1: 4.4, name: 'venus', art: 'venus-in-the-shell' }] });
    },
    sights: [
      { emoji: '🐚', at: [17, 60], r: 8, art: 'venus-in-the-shell', en: { name: 'Venus in the Shell', text: 'Venus, the goddess of love and the patron of Pompeii, lies naked in a pink shell on the sea, her red cloak blowing out behind her, with a cupid on either side. Painted on the garden wall so the garden seemed to run on into the sea.' }, nl: { name: 'Venus in de schelp', text: 'Venus, de godin van de liefde en beschermgodin van Pompeii, ligt naakt in een roze schelp op zee, met haar rode mantel die achter haar opwaait en aan elke kant een cupido. Op de tuinmuur geschilderd, zodat de tuin in de zee leek door te lopen.' } },
    ],
  },
];
const STUCCO_POST = '#e6dcc6';

// The map's ruins that reach into a house's plot, though their middle is outside it: they go too
// (js/landmarks.js takes away the buildings whose middle is on a monument's area: on their own outline)
const inside = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  return c;
};
const overlapping = ring => MAP.buildings.map(b => b.p).filter(p => {
  for (let k = 0; k < p.length; k += 2) if (inside(p[k], p[k + 1], ring)) return true;
  for (let k = 0; k < ring.length; k += 2) if (inside(ring[k], ring[k + 1], p)) return true;
  const cx = ring.filter((_, k) => !(k % 2)).reduce((a, v) => a + v, 0) / 4, cz = ring.filter((_, k) => k % 2).reduce((a, v) => a + v, 0) / 4;
  return inside(cx, cz, p);
});

// Each house as a monument on the map: its model, the walls and columns to bump into, the ground it
// stands on in place of the map's buildings and paths, and its cards and its name for the big map.
// HOUSE_FRAMES: each house's plot (its at(x, z), W and D), by id, for the tools that look into them
// HOUSE_ART: where their famous pieces are, to see full screen (city.js ART_SPOTS, game/artview.js)
export const HOUSE_MONUMENTS = [], HOUSE_SIGHTS = [], HOUSE_PLACES = [], HOUSE_GROUNDS = [], HOUSE_FRAMES = {}, HOUSE_ART = [];
for (const [n, h] of HOUSES.entries()) {
  const p = plot(h.plot), d = new Domus(p, n + 1, { whole: h.whole });
  HOUSE_FRAMES[h.id] = p;
  h.build(d, p.W, p.D);
  const area = p.ring(-0.5, -0.5, p.W + 0.5, p.D + 0.5);
  HOUSE_GROUNDS.push(p.ring(0, 0.4, p.W, p.D)); // on foot from just inside the door
  HOUSE_MONUMENTS.push({
    id: 'house-' + h.id, name: '', x: p.x, z: p.z, turn: p.turn, reach: Math.hypot(p.W, p.D) + 90,
    area: [area, ...overlapping(area)], paths: [area], foot: d.foot, make: () => d.build(),
  });
  const [cx, cz] = p.at(p.W / 2, p.D / 2);
  // a link to the house (?at=house-<id>, from its page on the site) puts you just inside its front door,
  // looking in, or where the house says (arrive)
  const at = h.arrive?.at ?? (d.door && [d.door[0], 2.5]), look = h.arrive?.look ?? (d.door && [d.door[0], 12]);
  const [ax, az] = at ? p.at(...at) : [], arrival = at && { x: ax, z: az, look: p.at(...look) };
  // its card has a Go inside button (goIn), shown while you are not on its ground
  HOUSE_SIGHTS.push({ id: 'house-' + h.id, emoji: h.emoji, x: Math.round(cx), z: Math.round(cz), r: Math.round(Math.max(p.W, p.D) / 2 + 6), text: h.card, arrival, goIn: !!arrival, ground: HOUSE_GROUNDS.at(-1) });
  for (const [k, s] of (h.sights ?? []).entries()) {
    const [x, z] = p.at(...s.at);
    // a card for a piece (art) brings you, from its page on the site (?at=house-<id>-<k>), to where you see it
    const spot = s.art && d.art.find(a => a.id === s.art)?.spot;
    const arrival = spot && { x: spot[0], z: spot[1], look: [spot[2], spot[3]] };
    HOUSE_SIGHTS.push({ id: `house-${h.id}-${k}`, emoji: s.emoji, x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10, r: s.r, text: { en: s.en, nl: s.nl }, arrival });
  }
  HOUSE_PLACES.push({ name: h.name, x: Math.round(cx), z: Math.round(cz), side: h.side });
  // its famous pieces, to see full screen when you stand before one
  HOUSE_ART.push(...d.art);
}
