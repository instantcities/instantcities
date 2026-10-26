// The famous pictures, drawn from memory with a few shapes on a canvas, after the real ones: the
// Mona Lisa, the Wedding at Cana, the Raft of the Medusa and Liberty Leading the People (the Louvre),
// the Birth of Venus and Primavera (the Uffizi), Michelangelo's ceiling and Last Judgment (the
// Sistine Chapel), the Rosetta Stone and the Parthenon's frieze (the British Museum), the
// Sunflowers, the Hay Wain, the Arnolfini and the Temeraire (the National Gallery), Bruegel's Babel,
// Hunters and Wedding (Vienna), the Night Watch, Las Meninas, Saturn and the Garden of Earthly
// Delights, the churches' rose windows, San Marco's gold and the Ishtar Gate's blue bricks, and any
// number of old masters to fill the walls round them. Far too simple, and meant to be seen from a few metres
// off, like the Lam Gods (lamgods.js). The famous ones (REAL below) get their real photo painted over
// the drawing as soon as it has loaded (photo.js); the drawing stays where it cannot load. The rest of
// the famous ones (famous()) have no drawing of their own, only a dim canvas until their photo is in.
import * as THREE from 'three';
import { photo } from './photo.js';

const rngOf = seed => () => ((seed = (seed * 16807 + 11) % 2147483647) / 2147483647);
const CACHE = new Map();

// The ones with a real photo to paint over the drawing once it has loaded (photo.js), by their key
// here: the id of the piece on the site (/preview/pr-83/art/<id>/), and how the photo goes on.
const BAY = 2048 / 9; // the Sistine ceiling's bays, along its canvas
const REAL = {
  monalisa: 'mona-lisa', cana: 'the-wedding-at-cana', medusa: 'the-raft-of-the-medusa', liberty: 'liberty-leading-the-people',
  venus: 'the-birth-of-venus', primavera: 'primavera',
  sistine: ['the-creation-of-adam', { fit: 'contain', ground: '#c8c0a8', rect: [5 * BAY + 10, 150, BAY - 20, 212], turn: true, stretch: 2 }],
  judgment: 'the-last-judgment',
  sunflowers: 'sunflowers', haywain: 'the-hay-wain', arnolfini: 'the-arnolfini-portrait', temeraire: 'the-fighting-temeraire',
  babel: 'the-tower-of-babel', hunters: 'the-hunters-in-the-snow', pwedding: 'the-peasant-wedding',
  nightwatch: 'the-night-watch', meninas: 'las-meninas', saturn: 'saturn-devouring-his-son', delights: 'the-garden-of-earthly-delights',
  paladoro: 'pala-d-oro', hawkwood: 'sir-john-hawkwood',
};

// a canvas w × h, drawn once by draw(g, w, h) and kept under `key`
function art(key, w, h, draw) {
  if (CACHE.has(key)) return CACHE.get(key);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.userData.shared = true; // the tiles let go of a texture when what uses it goes, unless it is shared (js/tiles.js)
  CACHE.set(key, tex);
  if (REAL[key]) photo(tex, ...[REAL[key]].flat());
  return tex;
}

// ------------------------------------------------------------------ bits to paint with

const ellipse = (g, x, y, rx, ry, fill, rot = 0) => { g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, 7); g.fill(); };
const poly = (g, pts, fill) => { g.fillStyle = fill; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const varnish = (g, w, h, a = 0.35) => {
  // old varnish: warm and darker at the edges
  const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(255,220,150,0.04)'); v.addColorStop(1, `rgba(40,25,5,${a})`);
  g.fillStyle = v; g.fillRect(0, 0, w, h);
};
// a figure from far off: a robe falling from the shoulders to the ground, a head; in light or in shade
function figure(g, x, y, s, robe, { skin = '#e2b48c', hair = '#3d2a1a', arm = 0, kneel = false } = {}) {
  const foot = y + (kneel ? 70 : 110) * s;
  poly(g, [[x - 18 * s, y + 18 * s], [x + 18 * s, y + 18 * s], [x + 30 * s, foot], [x - 30 * s, foot]], robe);
  if (arm) { g.strokeStyle = robe; g.lineWidth = 9 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 12 * s * Math.sign(arm), y + 26 * s); g.lineTo(x + 40 * s * arm, y + 10 * s); g.stroke(); ellipse(g, x + 42 * s * arm, y + 9 * s, 5 * s, 5 * s, skin); }
  ellipse(g, x, y, 11 * s, 13 * s, skin);
  ellipse(g, x, y - 5 * s, 12 * s, 9 * s, hair);
}
const sky = (g, w, h, top, bottom, y0 = 0, y1 = h) => { const s = g.createLinearGradient(0, y0, 0, y1); s.addColorStop(0, top); s.addColorStop(1, bottom); g.fillStyle = s; g.fillRect(0, y0, w, y1 - y0); };

// ------------------------------------------------------------------ the Louvre

// The Mona Lisa (Leonardo, c. 1503–1519): a woman in dark clothes, her hands folded, her face and
// hands lit, the hazy blue-green landscape of winding roads and a bridge behind her.
export const monaLisa = () => art('monalisa', 400, 600, (g, w, h) => {
  sky(g, w, h, '#a7b48c', '#6f7c52', 0, h * 0.5);
  // the far hills, a lake on the left, a road winding down on the right
  poly(g, [[0, 250], [60, 205], [120, 230], [170, 215], [170, 300], [0, 320]], '#8a9a72');
  poly(g, [[250, 230], [320, 195], [400, 215], [400, 320], [240, 300]], '#83946b');
  ellipse(g, 70, 255, 70, 18, '#c2c9a8');
  g.strokeStyle = '#a8845a'; g.lineWidth = 6; g.beginPath(); g.moveTo(330, 260); g.quadraticCurveTo(290, 300, 340, 330); g.quadraticCurveTo(380, 350, 360, 380); g.stroke();
  poly(g, [[0, 300], [400, 300], [400, 600], [0, 600]], '#5a5a32');
  // the parapet behind her, and her dark dress and veil
  g.fillStyle = '#4a4128'; g.fillRect(0, 470, w, 130);
  poly(g, [[110, 600], [95, 330], [150, 250], [250, 250], [305, 330], [290, 600]], '#2b2416');
  poly(g, [[140, 250], [200, 225], [260, 250], [250, 300], [150, 300]], '#3a2c18');
  // the neckline and the lit chest
  poly(g, [[158, 300], [242, 300], [228, 345], [172, 345]], '#d8a878');
  // her face, the hair falling either side, the veil over it
  ellipse(g, 200, 200, 40, 52, '#dcae7a');
  poly(g, [[150, 170], [160, 140], [200, 128], [240, 140], [252, 175], [250, 300], [236, 300], [234, 190], [166, 190], [164, 300], [150, 300]], '#2e2012');
  ellipse(g, 200, 160, 46, 30, 'rgba(40,30,15,0.5)');
  // eyes, and that smile
  ellipse(g, 186, 195, 6, 3, '#4a3018'); ellipse(g, 214, 195, 6, 3, '#4a3018');
  g.strokeStyle = '#8a5a3a'; g.lineWidth = 2; g.beginPath(); g.moveTo(188, 228); g.quadraticCurveTo(200, 233, 213, 226); g.stroke();
  // the folded hands, right over left, in the light
  ellipse(g, 190, 455, 52, 22, '#dcae7a', -0.15);
  ellipse(g, 228, 445, 30, 15, '#e2b886', -0.3);
  poly(g, [[120, 470], [280, 470], [290, 600], [110, 600]], '#2b2416');
  g.fillStyle = '#6a3a1a'; g.fillRect(118, 480, 170, 30);
  varnish(g, w, h, 0.55);
});

// The Wedding at Cana (Veronese, 1563): the biggest picture in the Louvre, a feast in a Venetian
// palace, a long white table full of guests under a balustrade, columns either side, a blue sky.
export const weddingAtCana = () => art('cana', 1024, 700, (g, w, h) => {
  sky(g, w, h, '#6f9ac8', '#d8e6ee', 0, 300);
  for (let k = 0; k < 8; k++) ellipse(g, 100 + k * 130, 60 + (k % 3) * 25, 70, 18, 'rgba(255,255,255,0.7)');
  // the balustrade up top, with people looking down over it, and the columns
  g.fillStyle = '#d8cbb0'; g.fillRect(0, 230, w, 40);
  for (let x = 20; x < w; x += 24) { g.fillStyle = '#c2b394'; g.fillRect(x, 238, 10, 28); }
  for (let k = 0; k < 14; k++) figure(g, 60 + k * 70, 205, 0.4, ['#a3202c', '#2f56b8', '#e8dcc0', '#2f7a45'][k % 4]);
  for (const x of [40, 160, 864, 984]) { g.fillStyle = '#e8dcc6'; g.fillRect(x - 22, 270, 44, 430); g.fillStyle = '#cfc0a2'; g.fillRect(x - 28, 270, 56, 20); }
  // the floor and the table, white cloth, the guests behind it in silk and gold
  poly(g, [[0, 560], [w, 560], [w, h], [0, h]], '#a89878');
  for (let k = 0; k < 22; k++) {
    const x = 210 + k * 28 + (k % 2) * 6;
    figure(g, x, 340 + (k % 3) * 8, 0.75, ['#a3202c', '#2f56b8', '#e8dcc0', '#2f7a45', '#d8a52c', '#5c2f86', '#d8506a'][k % 7]);
  }
  figure(g, 512, 320, 0.85, '#a3202c'); ellipse(g, 512, 312, 20, 20, 'rgba(255,230,140,0.5)'); // Christ in the middle, his halo
  g.fillStyle = '#f4f0e6'; g.fillRect(190, 420, 650, 60);
  g.fillStyle = '#d8d2c4'; g.fillRect(190, 478, 650, 80);
  for (let k = 0; k < 16; k++) ellipse(g, 220 + k * 40, 425, 9, 4, ['#d2a94a', '#c0c0c0', '#a3202c'][k % 3]);
  // the musicians in front, the servants pouring the wine at the sides
  for (let k = 0; k < 6; k++) figure(g, 380 + k * 52, 545, 0.6, ['#e8dcc0', '#2f56b8', '#a3202c'][k % 3]);
  for (const x of [110, 920]) figure(g, x, 470, 0.9, '#d8a52c', { arm: x < 500 ? 1 : -1 });
  varnish(g, w, h, 0.4);
});

// The Raft of the Medusa (Géricault, 1819): the shipwrecked heaped on a raft in a dark sea, a
// pyramid of bodies up to the one waving a cloth at a ship far off on the horizon.
export const raftOfMedusa = () => art('medusa', 900, 640, (g, w, h) => {
  sky(g, w, h, '#2a2418', '#a8804a', 0, 380);
  ellipse(g, 700, 300, 260, 90, 'rgba(230,190,120,0.45)');
  poly(g, [[0, 380], [w, 360], [w, h], [0, h]], '#22281e');
  for (let k = 0; k < 9; k++) ellipse(g, 100 * k + 40, 420 + (k % 3) * 40, 90, 14, 'rgba(120,130,110,0.35)', -0.1);
  poly(g, [[60, 560], [760, 500], [820, 560], [120, 620]], '#4a3a26'); // the raft
  g.strokeStyle = '#3a2a1a'; g.lineWidth = 8; g.beginPath(); g.moveTo(300, 540); g.lineTo(330, 140); g.stroke(); // the mast
  poly(g, [[330, 150], [460, 220], [330, 330]], '#c8b088'); // the sail
  // the heap of bodies, rising to the right
  for (let k = 0; k < 14; k++) {
    const x = 200 + k * 38, y = 500 - k * 18;
    ellipse(g, x, y, 34, 14, k % 2 ? '#c89a70' : '#b0825a', -0.5 + k * 0.05);
    ellipse(g, x + 18, y - 14, 9, 10, '#c89a70');
  }
  g.strokeStyle = '#c89a70'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(705, 260); g.lineTo(730, 200); g.stroke();
  poly(g, [[725, 205], [775, 190], [770, 215], [728, 222]], '#a3202c'); // the cloth waved at the ship
  ellipse(g, 840, 370, 6, 4, '#2a2418'); // the Argus, a speck on the horizon
  varnish(g, w, h, 0.5);
});

// Liberty Leading the People (Delacroix, 1830): Liberty bare-breasted with the tricolour and a
// musket, striding over the barricade, the people behind her in the smoke, Notre-Dame far off.
export const libertyLeading = () => art('liberty', 820, 650, (g, w, h) => {
  sky(g, w, h, '#b8a888', '#7a6a4e', 0, h);
  const rnd = rngOf(1830);
  for (let k = 0; k < 16; k++) ellipse(g, rnd() * w, 120 + rnd() * 300, 90, 40, 'rgba(230,215,180,0.25)');
  g.fillStyle = '#9a8a6e'; g.fillRect(620, 300, 24, 70); g.fillRect(660, 300, 24, 70); // the towers of Notre-Dame
  poly(g, [[0, 520], [w, 500], [w, h], [0, h]], '#4a3a2a'); // the barricade
  for (let k = 0; k < 7; k++) ellipse(g, 80 + k * 110, 560 + (k % 2) * 30, 60, 18, ['#5a4a3a', '#3a2a1a', '#6a5a4a'][k % 3]);
  // the people: a boy with pistols, a man in a top hat with a musket
  figure(g, 180, 320, 1.4, '#2a2a2a', { arm: 1 }); g.fillStyle = '#1a1a1a'; g.fillRect(160, 270, 40, 34); g.fillRect(150, 300, 60, 8);
  figure(g, 610, 360, 1.2, '#3a4a6a', { arm: 1 });
  // Liberty in yellow, the flag held high
  figure(g, 400, 230, 1.9, '#d8c08a', { skin: '#e2b48c', arm: 1 });
  g.strokeStyle = '#3a2a1a'; g.lineWidth = 6; g.beginPath(); g.moveTo(470, 210); g.lineTo(480, 30); g.stroke();
  for (const [k, c] of [[0, '#1f3f9c'], [1, '#f4f0e6'], [2, '#c23a3a']]) poly(g, [[480 + k * 70, 30 + k * 6], [550 + k * 70, 36 + k * 6], [548 + k * 70, 130 + k * 4], [478 + k * 70, 124 + k * 4]], c);
  ellipse(g, 400, 212, 14, 10, '#a3202c'); // her Phrygian cap
  varnish(g, w, h, 0.45);
});

// ------------------------------------------------------------------ the Uffizi

// The Birth of Venus (Botticelli, c. 1485): Venus on her scallop shell over a green sea, the winds
// blowing her ashore on the left, the Hora waiting with a cloak on the right, roses in the air.
export const birthOfVenus = () => art('venus', 1024, 640, (g, w, h) => {
  sky(g, w, h, '#a9c6c0', '#dfe6d6', 0, 330);
  poly(g, [[0, 330], [w, 330], [w, h], [0, h]], '#7aa898');
  for (let y = 350; y < h; y += 18) for (let x = (y % 36) / 2; x < w; x += 36) { g.strokeStyle = 'rgba(240,245,235,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 12, y - 6); g.lineTo(x + 24, y); g.stroke(); }
  poly(g, [[860, 330], [1024, 240], [1024, 640], [880, 640]], '#5a7a4a'); // the shore on the right, with orange trees
  for (let k = 0; k < 5; k++) ellipse(g, 900 + k * 30, 200 + k * 30, 40, 50, '#3f6a3a');
  // the shell, ribbed, and Venus standing on it, her long red-gold hair
  poly(g, [[380, 600], [640, 600], [600, 540], [420, 540]], '#e8d0a0');
  for (let k = 0; k < 9; k++) { g.strokeStyle = '#c8a870'; g.lineWidth = 3; g.beginPath(); g.moveTo(510, 600); g.lineTo(420 + k * 23, 545); g.stroke(); }
  ellipse(g, 510, 400, 42, 140, '#f2dcc6');
  ellipse(g, 505, 245, 26, 32, '#f4e0cc');
  poly(g, [[485, 225], [540, 220], [575, 380], [560, 470], [540, 360], [520, 260]], '#c9873a');
  // the winds on the left, entwined, blowing; roses falling
  ellipse(g, 220, 230, 110, 60, '#7aa0c0', -0.4); ellipse(g, 160, 200, 22, 24, '#f2d8c0'); ellipse(g, 220, 240, 20, 22, '#f2d8c0');
  for (const [x, y] of [[90, 170], [60, 260], [140, 300]]) poly(g, [[x, y], [x - 50, y - 40], [x - 20, y + 30]], '#a8b8c8');
  for (let k = 0; k < 12; k++) ellipse(g, 260 + k * 18, 150 + (k % 4) * 40, 7, 7, '#f0a8b8');
  // the Hora with the flowered cloak
  figure(g, 790, 210, 2.2, '#f4f0e0', { skin: '#f2d8c0', hair: '#c9873a', arm: -1 });
  poly(g, [[600, 300], [720, 260], [740, 480], [640, 520]], '#c23a5a');
  varnish(g, w, h, 0.25);
});

// Primavera (Botticelli, c. 1480): a dark orange grove, Venus in the middle under Cupid, the three
// Graces dancing on the left in white, Flora in her flowered dress strewing roses on the right.
export const primavera = () => art('primavera', 1024, 660, (g, w, h) => {
  g.fillStyle = '#1e2a1a'; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 40; k++) ellipse(g, (k * 97) % w, 60 + ((k * 53) % 300), 50, 40, '#2a3a22');
  for (let k = 0; k < 60; k++) ellipse(g, (k * 61) % w, 40 + ((k * 37) % 320), 7, 7, '#e8902a'); // the oranges
  poly(g, [[0, 540], [w, 540], [w, h], [0, h]], '#2f4a28');
  for (let k = 0; k < 120; k++) ellipse(g, (k * 43) % w, 550 + ((k * 29) % 100), 4, 4, ['#f4f0e0', '#e85a6a', '#f3e14a', '#a8c8f0'][k % 4]);
  // the Graces, in see-through white, hands joined
  for (let k = 0; k < 3; k++) figure(g, 150 + k * 80, 220, 2.6, 'rgba(240,236,224,0.85)', { skin: '#f2d8c0', hair: '#c9873a' });
  // Mercury on the far left, Venus in the middle in red and white, Cupid over her, Flora, Chloris and Zephyr on the right
  figure(g, 50, 200, 2.8, '#a3202c', { skin: '#e2b48c', arm: 1 });
  figure(g, 512, 240, 2.6, '#f4f0e0', { skin: '#f2d8c0', hair: '#c9873a' }); poly(g, [[470, 290], [560, 290], [590, 560], [450, 560]], '#a3202c');
  ellipse(g, 512, 90, 26, 20, '#f2d8c0'); poly(g, [[480, 90], [450, 60], [470, 110]], '#e8dcc0'); poly(g, [[544, 90], [574, 60], [554, 110]], '#e8dcc0');
  figure(g, 720, 230, 2.7, '#f4f0e0', { skin: '#f2d8c0', hair: '#e8c06a', arm: -1 });
  for (let k = 0; k < 40; k++) ellipse(g, 690 + (k * 13) % 80, 300 + (k * 17) % 240, 5, 5, ['#e85a6a', '#3f8f55', '#f3e14a'][k % 3]);
  figure(g, 860, 230, 2.6, 'rgba(240,236,224,0.8)', { skin: '#f2d8c0' });
  figure(g, 950, 160, 2.6, '#3a6a9a', { skin: '#8ab0c8', arm: -1 });
  varnish(g, w, h, 0.5);
});

// The view out of the Uffizi's window at the end of the corridor: the Arno, the Ponte Vecchio with
// its shops on it and the Vasari corridor over them, Oltrarno's houses and San Miniato's hill.
export const arnoView = () => art('arno', 512, 512, (g, w, h) => {
  sky(g, w, h, '#8ab4dc', '#e4ecf0', 0, 260);
  poly(g, [[0, 260], [140, 200], [300, 220], [512, 190], [512, 300], [0, 300]], '#6a8a5a');
  for (let k = 0; k < 14; k++) { g.fillStyle = ['#e8c89a', '#d8a878', '#f0dcb8', '#c88a5a'][k % 4]; g.fillRect(k * 38, 250 - (k % 3) * 12, 34, 60 + (k % 3) * 12); }
  poly(g, [[0, 330], [512, 330], [512, 512], [0, 512]], '#6a8a6a');
  for (let y = 350; y < h; y += 14) { g.fillStyle = 'rgba(220,235,225,0.25)'; g.fillRect(0, y, w, 2); }
  // the bridge: three arches, the shops on top in ochre with their back rooms hanging out
  g.fillStyle = '#c8a870'; g.fillRect(40, 300, 440, 30);
  for (let k = 0; k < 3; k++) { g.fillStyle = '#5a7a5a'; g.beginPath(); g.ellipse(110 + k * 150, 330, 55, 28, 0, Math.PI, 0); g.fill(); }
  for (let k = 0; k < 18; k++) { g.fillStyle = ['#d8a24a', '#c87a3a', '#e8b860', '#b8682a'][k % 4]; g.fillRect(40 + k * 24, 268 - (k % 2) * 6, 22, 34 + (k % 2) * 6); }
  g.fillStyle = '#e0c088'; g.fillRect(40, 255, 440, 12);
  // the stone frame of the window
  g.strokeStyle = '#d8d0c0'; g.lineWidth = 30; g.strokeRect(0, 0, w, h);
  g.lineWidth = 12; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
});

// The painted vault of the Uffizi's corridors: grotesques, little figures, birds and garlands on a
// white ground between bands, a repeat of one bay
export const grotesques = () => {
  const tex = art('grotesques', 512, 256, (g, w, h) => {
    g.fillStyle = '#f2ece0'; g.fillRect(0, 0, w, h);
    const rnd = rngOf(17);
    g.strokeStyle = '#8a6a3a'; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16);
    for (let k = 0; k < 6; k++) { g.strokeStyle = ['#2f6a8a', '#a3202c', '#3f8f55'][k % 3]; g.lineWidth = 3; g.beginPath(); g.moveTo(20 + k * 82, 30); g.bezierCurveTo(60 + k * 82, 90, k * 82, 160, 40 + k * 82, 230); g.stroke(); }
    for (let k = 0; k < 30; k++) ellipse(g, 20 + rnd() * (w - 40), 20 + rnd() * (h - 40), 6 + rnd() * 10, 4 + rnd() * 8, ['#a3202c', '#2f6a8a', '#d8a52c', '#3f8f55', '#e8a0a0'][k % 5], rnd() * 3);
    for (let k = 0; k < 4; k++) { const x = 64 + k * 128; g.strokeStyle = '#8a6a3a'; g.lineWidth = 2; g.strokeRect(x - 30, h / 2 - 30, 60, 60); figure(g, x, h / 2 - 12, 0.35, '#a3202c'); }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

// ------------------------------------------------------------------ the Sistine Chapel

// one of the nine stories down the middle of the ceiling: figures in a frame, on a light ground
function story(g, x, y, w, h, seed, adam = false) {
  const rnd = rngOf(seed);
  g.fillStyle = '#d8cdb4'; g.fillRect(x, y, w, h);
  const ground = g.createLinearGradient(0, y, 0, y + h); ground.addColorStop(0, '#c8c4b0'); ground.addColorStop(1, '#a8a490');
  g.fillStyle = ground; g.fillRect(x, y, w, h);
  if (adam) {
    // The Creation of Adam: Adam reclining on the earth on the left, God in his red cloak full of
    // angels on the right, their fingers nearly touching in the middle
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = '#c8c0a8'; g.fillRect(x, y, w, h);
    poly(g, [[x, y + h], [x, y + h * 0.55], [x + w * 0.35, y + h * 0.62], [x + w * 0.45, y + h]], '#8a8a6a'); // the earth
    ellipse(g, x + w * 0.22, y + h * 0.62, w * 0.14, h * 0.08, '#d8a880', -0.2); // Adam's body
    ellipse(g, x + w * 0.1, y + h * 0.56, w * 0.035, h * 0.06, '#d8a880'); // his head
    g.strokeStyle = '#d8a880'; g.lineWidth = h * 0.05; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x + w * 0.28, y + h * 0.58); g.lineTo(x + w * 0.45, y + h * 0.5); g.stroke(); // his arm, limp, reaching
    g.beginPath(); g.moveTo(x + w * 0.3, y + h * 0.66); g.lineTo(x + w * 0.42, y + h * 0.78); g.stroke();
    ellipse(g, x + w * 0.72, y + h * 0.42, w * 0.22, h * 0.3, '#b8483a', 0.1); // the cloak
    for (let k = 0; k < 7; k++) ellipse(g, x + w * (0.62 + rnd() * 0.22), y + h * (0.25 + rnd() * 0.35), w * 0.025, h * 0.05, '#e2b48c');
    ellipse(g, x + w * 0.6, y + h * 0.35, w * 0.08, h * 0.08, '#f0ece0'); // God, white-haired
    ellipse(g, x + w * 0.58, y + h * 0.33, w * 0.03, h * 0.05, '#e2b48c');
    g.strokeStyle = '#e2b48c'; g.beginPath(); g.moveTo(x + w * 0.58, y + h * 0.42); g.lineTo(x + w * 0.485, y + h * 0.49); g.stroke(); // his arm, reaching out
    g.restore();
  } else {
    for (let k = 0; k < 3 + Math.floor(rnd() * 4); k++) figure(g, x + w * (0.15 + rnd() * 0.7), y + h * (0.2 + rnd() * 0.3), h / 260, ['#b8483a', '#5a7aa0', '#d8c08a', '#7a9a6a', '#e2b48c'][Math.floor(rnd() * 5)], { skin: '#d8a880', arm: rnd() < 0.5 ? 1 : -1 });
  }
  g.strokeStyle = '#8a7a5a'; g.lineWidth = 6; g.strokeRect(x, y, w, h);
}

// Michelangelo's ceiling (1508–1512), laid flat along the vault: the nine stories of Genesis down
// the middle, big and small by turns, the Creation of Adam the fourth from the altar; the prophets
// and sibyls on their thrones along both sides, the painted architecture of cornices and ribs
// between them, the nudes on its corners. The altar end at the right (+u: +z).
export const sistineCeiling = () => art('sistine', 2048, 512, (g, w, h) => {
  g.fillStyle = '#d6c8a8'; g.fillRect(0, 0, w, h);
  const bay = w / 9;
  for (let k = 0; k < 9; k++) {
    const big = k % 2 === 0, x = k * bay + (big ? 10 : 40), sw = bay - (big ? 20 : 80), y = 150 + (big ? 0 : 30), sh = 212 - (big ? 0 : 60);
    story(g, x, y, sw, sh, 101 + k, k === 5);
    // the painted ribs across, and the thrones of the prophets and sibyls along both sides
    g.fillStyle = '#c4b490'; g.fillRect(k * bay - 6, 0, 12, h);
    for (const top of [true, false]) {
      const ty = top ? 10 : h - 140;
      g.fillStyle = '#b8a888'; g.fillRect(k * bay + 40, ty, bay - 80, 130);
      figure(g, k * bay + bay / 2, ty + 40, 0.75, ['#5a7aa0', '#b8483a', '#7a9a6a', '#d8c08a', '#8a5a9a'][(k + (top ? 0 : 2)) % 5], { skin: '#d8a880' });
      g.fillStyle = '#e8dcc0'; g.fillRect(k * bay + 50, ty + (top ? 120 : 0), bay - 100, 10);
    }
    // the nudes on the corners of the stories
    for (const [dx, dy] of [[24, 130], [bay - 24, 130], [24, 372], [bay - 24, 372]]) ellipse(g, k * bay + dx, dy, 12, 18, '#d8a880');
  }
  g.strokeStyle = '#9a8a6a'; g.lineWidth = 10; g.strokeRect(0, 140, w, 232);
  varnish(g, w, h, 0.2);
});

// The Last Judgment (Michelangelo, 1536–1541), over the altar: a deep blue sky full of bodies,
// Christ raising his arm in the middle with Mary beside him, the saints round them, the saved rising
// on the left, the damned falling on the right, the trumpeting angels below, Charon's boat at the bottom.
// (real: false for the Duomo's dome, painted after it by Vasari and Zuccari, not the real one)
export const lastJudgment = (real = true) => art(real ? 'judgment' : 'judgment-dome', 1024, 1152, (g, w, h) => {
  sky(g, w, h, '#4a72b0', '#6a8ac0', 0, h * 0.8);
  poly(g, [[0, h * 0.8], [w, h * 0.8], [w, h], [0, h]], '#6a5a44');
  const rnd = rngOf(1541);
  // the two lunettes at the top: angels with the cross and the column
  for (const x of [w * 0.25, w * 0.75]) { g.fillStyle = 'rgba(240,230,200,0.35)'; g.beginPath(); g.arc(x, 130, 200, Math.PI, 0); g.fill(); for (let k = 0; k < 10; k++) ellipse(g, x - 150 + rnd() * 300, 30 + rnd() * 100, 18, 26, '#d8a880', rnd() * 3); }
  // Christ in the middle, in a glory of light, and the crowd of saints round him
  ellipse(g, w / 2, 420, 140, 120, 'rgba(255,240,190,0.55)');
  for (let k = 0; k < 70; k++) { const a = rnd() * Math.PI * 2, d = 170 + rnd() * 210; ellipse(g, w / 2 + Math.cos(a) * d * 1.4, 420 + Math.sin(a) * d * 0.7, 14, 22, rnd() < 0.8 ? '#d8a880' : ['#b8483a', '#d8c08a', '#5a7a5a'][k % 3], rnd() * 3); }
  ellipse(g, w / 2, 430, 40, 70, '#e2b48c'); ellipse(g, w / 2, 350, 20, 22, '#e2b48c');
  g.strokeStyle = '#e2b48c'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(w / 2 + 20, 390); g.lineTo(w / 2 + 75, 330); g.stroke();
  ellipse(g, w / 2 - 70, 440, 26, 42, '#5a7ab8'); // Mary, in blue
  // the saved rising on the left, the damned falling on the right
  for (let k = 0; k < 40; k++) ellipse(g, 80 + rnd() * 300, 620 + rnd() * 260, 13, 20, '#d8a880', rnd() * 3);
  for (let k = 0; k < 40; k++) ellipse(g, 650 + rnd() * 300, 620 + rnd() * 260, 13, 20, '#c89870', rnd() * 3);
  // the trumpeting angels in the middle
  for (let k = 0; k < 8; k++) ellipse(g, 400 + k * 30, 720 + (k % 2) * 20, 15, 22, '#e2b48c');
  // the earth below: the dead climbing from their graves, Charon's boat on the Styx, the mouth of hell
  poly(g, [[620, 1020], [900, 1000], [880, 1080], [640, 1090]], '#3a3022');
  for (let k = 0; k < 10; k++) ellipse(g, 660 + k * 22, 1000, 9, 14, '#c89870');
  ellipse(g, 500, 1050, 60, 40, '#1a1410');
  varnish(g, w, h, 0.25);
});

// a fresco on the chapel's side walls: a story in a frame, the life of Moses on the south wall or
// of Christ on the north, painted by Perugino, Botticelli, Ghirlandaio and Rosselli
export const chapelFresco = seed => art(`fresco${seed}`, 640, 384, (g, w, h) => {
  sky(g, w, h, '#a8c0d0', '#e8e4d4', 0, h * 0.5);
  const rnd = rngOf(seed * 31);
  poly(g, [[0, h * 0.5], [w, h * 0.45], [w, h], [0, h]], '#a8a07a');
  for (let k = 0; k < 3; k++) { g.fillStyle = '#e8dcc0'; g.fillRect(80 + rnd() * 460, 80 + rnd() * 40, 60 + rnd() * 60, 90); }
  for (let k = 0; k < 12; k++) figure(g, 30 + rnd() * (w - 60), 160 + rnd() * 80, 0.9, ['#b8483a', '#5a7aa0', '#d8c08a', '#7a9a6a', '#8a5a9a'][k % 5]);
  g.strokeStyle = '#c8a870'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12);
});

// the painted curtains on the lowest tier of the side walls, silver and gold, hanging in folds
export const drapery = () => {
  const tex = art('drapery', 256, 256, (g, w, h) => {
    g.fillStyle = '#d8d0b8'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) { const s = g.createLinearGradient(x, 0, x + 16, 0); s.addColorStop(0, '#bfb490'); s.addColorStop(0.5, '#ece4cc'); s.addColorStop(1, '#bfb490'); g.fillStyle = s; g.fillRect(x, 20, 16, h - 20); }
    g.fillStyle = '#c9a24a'; g.fillRect(0, 0, w, 20);
    for (let x = 8; x < w; x += 32) ellipse(g, x, 10, 6, 6, '#e8c870');
  });
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
};

// the floor of the chapel: Cosmatesque roundels of porphyry and green serpentine in white marble
export const cosmati = () => {
  const tex = art('cosmati', 256, 256, (g, w, h) => {
    g.fillStyle = '#ece6da'; g.fillRect(0, 0, w, h);
    for (const [cx, cy, r] of [[128, 128, 90], [128, 128, 60]]) { g.strokeStyle = r === 90 ? '#8a4a40' : '#5a7a5a'; g.lineWidth = 9; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); }
    ellipse(g, 128, 128, 30, 30, '#8a4a40');
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; ellipse(g, 128 + Math.cos(a) * 150, 128 + Math.sin(a) * 150, 26, 26, '#5a7a5a'); }
    g.strokeStyle = '#b8a888'; g.lineWidth = 6; g.strokeRect(0, 0, w, h);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

// ------------------------------------------------------------------ the British Museum

// The Rosetta Stone (196 BC): a broken slab of dark grey granodiorite, the same decree three times:
// in hieroglyphs at the top, in Demotic in the middle and in Greek at the bottom.
export const rosettaStone = () => art('rosetta', 360, 512, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  poly(g, [[30, 60], [120, 10], [250, 30], [330, 0], [350, 512], [10, 512], [0, 140]], '#3a3a3e');
  const rnd = rngOf(196);
  g.fillStyle = 'rgba(220,220,225,0.55)';
  for (let y = 70; y < 200; y += 12) for (let x = 40 + (y % 24); x < 320; x += 14) g.fillRect(x, y, 6 + rnd() * 6, 7); // hieroglyphs
  for (let y = 215; y < 340; y += 9) { let x = 20; while (x < 330) { const l = 6 + rnd() * 20; g.fillRect(x, y, l, 3); x += l + 4; } } // Demotic
  for (let y = 355; y < 500; y += 9) { let x = 18; while (x < 342) { const l = 3 + rnd() * 6; g.fillRect(x, y, l, 4); x += l + 2; } } // Greek
});

// a wall of hieroglyphs and figures in sunk relief, ochre on sandstone: the Egyptian galleries
export const egyptWall = () => {
  const tex = art('egypt', 512, 256, (g, w, h) => {
    g.fillStyle = '#d8c094'; g.fillRect(0, 0, w, h);
    const rnd = rngOf(1279);
    for (let k = 0; k < 5; k++) { figure(g, 50 + k * 100, 80, 0.9, ['#e8e0cc', '#c8a060', '#3a6a8a'][k % 3], { skin: '#a8603a', hair: '#1a1410', arm: 1 }); }
    g.fillStyle = 'rgba(90,60,30,0.6)';
    for (let y = 10; y < 60; y += 12) for (let x = 10; x < w - 10; x += 12) if (rnd() < 0.7) g.fillRect(x, y, 7, 8);
    g.fillStyle = '#3a6a8a'; g.fillRect(0, h - 20, w, 20);
  });
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
};

// the Parthenon's frieze (c. 440 BC): the Panathenaic procession in low relief on white marble,
// horsemen riding to the right, a strip of it as long as you like
export const frieze = () => {
  const tex = art('frieze', 1024, 128, (g, w, h) => {
    g.fillStyle = '#e4ddcc'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 10; k++) {
      const x = 40 + k * 100;
      ellipse(g, x, 78, 34, 16, '#cfc6b2', -0.15); // a horse
      ellipse(g, x + 34, 56, 10, 14, '#cfc6b2', 0.5);
      g.strokeStyle = '#cfc6b2'; g.lineWidth = 5;
      for (const lx of [-20, -8, 14, 26]) { g.beginPath(); g.moveTo(x + lx, 88); g.lineTo(x + lx + (lx > 0 ? 8 : -6), 118); g.stroke(); }
      ellipse(g, x - 2, 48, 8, 16, '#d8cfbb'); ellipse(g, x - 2, 28, 6, 7, '#d8cfbb'); // the rider
      g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, 78, 34, 16, -0.15, 0, 7); g.stroke();
    }
    g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6);
  });
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
};

// ------------------------------------------------------------------ old masters, to fill the walls

// A picture to hang among the famous ones: a portrait, a landscape, a scene with figures, a still
// life or a Madonna on gold, each from its seed.
export function oldMaster(seed) {
  const kinds = ['portrait', 'landscape', 'scene', 'still', 'madonna'], kind = kinds[seed % kinds.length];
  const [w, h] = kind === 'portrait' || kind === 'madonna' ? [320, 420] : [480, 340];
  return art(`master${seed}`, w, h, g => {
    const rnd = rngOf(seed * 97 + 13);
    if (kind === 'portrait') {
      g.fillStyle = ['#1a1612', '#2a3a2a', '#3a2a1a'][seed % 3]; g.fillRect(0, 0, w, h);
      const robe = ['#1a1a1a', '#5a1a1a', '#2a2a4a', '#4a3a1a'][Math.floor(rnd() * 4)];
      poly(g, [[60, h], [80, 260], [160, 220], [240, 260], [260, h]], robe);
      if (rnd() < 0.6) poly(g, [[120, 235], [200, 235], [215, 260], [105, 260]], '#f0ece0'); // a ruff
      ellipse(g, 160, 170, 50, 64, '#d8a880');
      ellipse(g, 160, 120, 56, 34, ['#2a1a10', '#5a3a1a', '#8a8a80'][Math.floor(rnd() * 3)]);
      if (rnd() < 0.4) { g.fillStyle = '#1a1a1a'; g.fillRect(100, 90, 120, 26); }
    } else if (kind === 'landscape') {
      sky(g, w, h, '#8aa8c8', '#f0e0c0', 0, h * 0.6);
      for (let k = 0; k < 5; k++) ellipse(g, rnd() * w, 40 + rnd() * 100, 60, 18, 'rgba(255,255,255,0.6)');
      poly(g, [[0, h * 0.6], [w * 0.3, h * 0.5], [w * 0.7, h * 0.58], [w, h * 0.5], [w, h], [0, h]], '#5a7a4a');
      for (let k = 0; k < 6; k++) ellipse(g, rnd() * w, h * (0.55 + rnd() * 0.2), 30, 40, '#3a5a32');
      if (rnd() < 0.5) { g.fillStyle = '#e8dcc0'; g.fillRect(w * 0.6, h * 0.42, 40, 50); poly(g, [[w * 0.6 - 4, h * 0.42], [w * 0.6 + 20, h * 0.35], [w * 0.6 + 44, h * 0.42]], '#a84a3a'); }
      ellipse(g, w * 0.4, h * 0.85, 120, 18, '#7a9ab0');
    } else if (kind === 'scene') {
      sky(g, w, h, '#3a2a1a', '#7a5a3a', 0, h);
      for (let k = 0; k < 5 + Math.floor(rnd() * 4); k++) figure(g, 40 + rnd() * (w - 80), 110 + rnd() * 80, 1.1, ['#a3202c', '#2f56b8', '#e8dcc0', '#2f7a45', '#d8a52c'][k % 5], { arm: rnd() < 0.5 ? 1 : -1 });
      const light = g.createLinearGradient(0, 0, w, h); light.addColorStop(0, 'rgba(255,230,170,0.3)'); light.addColorStop(0.6, 'rgba(0,0,0,0.2)'); g.fillStyle = light; g.fillRect(0, 0, w, h);
    } else if (kind === 'still') {
      g.fillStyle = '#1a1410'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#5a3a22'; g.fillRect(0, h * 0.65, w, h * 0.35);
      g.fillStyle = '#e8e4da'; g.fillRect(40, h * 0.6, w - 80, 20);
      for (let k = 0; k < 8; k++) ellipse(g, 80 + rnd() * (w - 160), h * 0.55 - rnd() * 40, 16 + rnd() * 16, 14 + rnd() * 14, ['#c23a3a', '#e8a02a', '#7a9a3a', '#5c2f86', '#e8d06a'][k % 5]);
      ellipse(g, w * 0.7, h * 0.35, 30, 80, 'rgba(200,210,210,0.5)');
    } else {
      g.fillStyle = '#c9a24a'; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(255,240,180,${rnd() * 0.15})`; g.fillRect(rnd() * w, rnd() * h, 4, 4); }
      poly(g, [[60, h], [90, 200], [160, 160], [230, 200], [260, h]], '#2a4a8a');
      ellipse(g, 160, 140, 36, 44, '#e2b48c'); ellipse(g, 160, 136, 52, 52, 'rgba(255,230,140,0.6)');
      ellipse(g, 140, 300, 30, 40, '#e8c8a0'); ellipse(g, 140, 260, 18, 20, '#e8c8a0');
      g.fillStyle = '#a3202c'; g.fillRect(90, 200, 140, 30);
    }
    varnish(g, w, h, 0.45);
  });
}
// One of the famous ones without a drawing of its own: hung w × h (game metres, its own shape), its
// real photo painted on as soon as it has loaded (photo.js); until then, and where it cannot load, a
// dim varnished canvas with a few soft shapes on it, from its id.
export function famous(id, w, h) {
  const W = w >= h ? 512 : Math.round((512 * w) / h), H = w >= h ? Math.round((512 * h) / w) : 512;
  const tex = art(`famous:${id}`, W, H, g => {
    const rnd = rngOf([...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 99991, 7));
    sky(g, W, H, ['#5a4a32', '#3a4a5a', '#6a5a3a', '#2a2a22'][Math.floor(rnd() * 4)], ['#2a2016', '#4a3a28', '#1a1612'][Math.floor(rnd() * 3)]);
    for (let k = 0; k < 9; k++) ellipse(g, rnd() * W, H * (0.3 + rnd() * 0.6), 20 + rnd() * W * 0.15, 20 + rnd() * H * 0.15, `rgba(${['230,200,150', '160,40,40', '60,80,140', '240,230,210'][k % 4]},${0.12 + rnd() * 0.2})`);
    varnish(g, W, H, 0.5);
  });
  if (!tex.userData.real) { tex.userData.real = id; photo(tex, id); }
  return tex;
}

// how wide and high an old master hangs, in game metres
export const masterSize = seed => (['portrait', 'landscape', 'scene', 'still', 'madonna'][seed % 5] === 'portrait' || seed % 5 === 4 ? [1.6, 2.1] : [2.6, 1.85]);

// ------------------------------------------------------------------ the Pantheon

// its floor: squares of grey granite with roundels and squares of porphyry and giallo antico in them
export const pantheonFloor = () => {
  const tex = art('pantheonfloor', 256, 256, (g, w, h) => {
    g.fillStyle = '#b8b4ac'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d8c48a'; g.fillRect(0, 0, w / 2, h / 2); g.fillRect(w / 2, h / 2, w / 2, h / 2);
    ellipse(g, w * 0.25, h * 0.25, 46, 46, '#7a2a2a');
    poly(g, [[w * 0.75 - 40, h * 0.75 - 40], [w * 0.75 + 40, h * 0.75 - 40], [w * 0.75 + 40, h * 0.75 + 40], [w * 0.75 - 40, h * 0.75 + 40]], '#5a6a5a');
    ellipse(g, w * 0.75, h * 0.25, 40, 40, '#d8c48a'); ellipse(g, w * 0.25, h * 0.75, 40, 40, '#b8b4ac');
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h); g.strokeRect(0, 0, w / 2, h / 2);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

// The Piazza della Rotonda as you see it between the portico's columns: the fountain with its
// obelisk, the café umbrellas and the ochre houses round the square under a blue sky
export const rotondaView = () => art('rotonda', 1024, 512, (g, w, h) => {
  sky(g, w, h, '#7aa8d8', '#dce8f0', 0, h * 0.55);
  for (let k = 0; k < 12; k++) { g.fillStyle = ['#e0a860', '#d88a4a', '#e8c890', '#c8784a', '#f0d8a8'][k % 5]; g.fillRect(k * 88, 140 + (k % 3) * 20, 86, 260); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { g.fillStyle = '#4a5a3a'; g.fillRect(k * 88 + 12 + c * 26, 170 + (k % 3) * 20 + r * 52, 12, 26); } }
  poly(g, [[0, 400], [w, 400], [w, h], [0, h]], '#a89a84');
  for (let k = 0; k < 6; k++) { poly(g, [[60 + k * 160, 380], [130 + k * 160, 340], [200 + k * 160, 380]], '#f0ece0'); g.fillStyle = '#3a3a3a'; g.fillRect(128 + k * 160, 380, 4, 40); }
  ellipse(g, w / 2, 430, 120, 26, '#d8d2c4'); ellipse(g, w / 2, 425, 100, 18, '#8ab0c8');
  poly(g, [[w / 2 - 10, 420], [w / 2 + 10, 420], [w / 2 + 5, 120], [w / 2, 100], [w / 2 - 5, 120]], '#d8c8a8');
});

// ------------------------------------------------------------------ the National Gallery

// Sunflowers (Van Gogh, 1888): fifteen sunflowers in a yellow pot on a yellow ground, some
// fresh, some going to seed
export const sunflowers = () => art('sunflowers', 380, 480, (g, w, h) => {
  g.fillStyle = '#e8c860'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8a83a'; g.fillRect(0, h * 0.68, w, h * 0.32);
  g.strokeStyle = '#3a6a8a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, h * 0.68); g.lineTo(w, h * 0.68); g.stroke();
  poly(g, [[110, 460], [270, 460], [285, 330], [95, 330]], '#e0b040'); // the pot
  g.fillStyle = '#c88a2a'; g.fillRect(95, 380, 190, 10);
  const rnd = rngOf(1888);
  for (let k = 0; k < 15; k++) {
    const x = 70 + rnd() * 240, y = 60 + rnd() * 240, r = 22 + rnd() * 18;
    g.strokeStyle = '#6a8a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(190, 340); g.lineTo(x, y); g.stroke();
    for (let q = 0; q < 14; q++) { const a = (q / 14) * Math.PI * 2 + rnd(); ellipse(g, x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.45, r * 0.16, k % 4 ? '#f0b020' : '#d88a1a', a); }
    ellipse(g, x, y, r * 0.6, r * 0.6, k % 3 ? '#8a5a1a' : '#5a3a12');
  }
  g.font = 'italic 700 22px Georgia, serif'; g.fillStyle = '#3a5aa8'; g.fillText('Vincent', 180, 420);
});

// The Hay Wain (Constable, 1821): a hay cart crossing the shallow mill stream, Willy Lott's
// cottage on the left, big white clouds over the fields of Suffolk
export const hayWain = () => art('haywain', 640, 440, (g, w, h) => {
  sky(g, w, h, '#7a9ac0', '#e8e8e0', 0, h * 0.55);
  const rnd = rngOf(1821);
  for (let k = 0; k < 9; k++) ellipse(g, 120 + rnd() * 480, 50 + rnd() * 120, 70 + rnd() * 50, 30 + rnd() * 20, 'rgba(250,250,245,0.85)');
  poly(g, [[0, 240], [640, 220], [640, 330], [0, 340]], '#6a8a3a');
  for (let k = 0; k < 7; k++) ellipse(g, 330 + k * 45, 200 + (k % 2) * 20, 50, 70, '#3a5a2a');
  ellipse(g, 120, 210, 90, 110, '#2f4a24');
  g.fillStyle = '#c8b090'; g.fillRect(40, 220, 110, 90); poly(g, [[30, 222], [95, 170], [160, 222]], '#8a5a3a'); // the cottage
  poly(g, [[0, 330], [640, 320], [640, 440], [0, 440]], '#5a6a4a');
  for (let y = 340; y < 440; y += 8) { g.fillStyle = 'rgba(200,210,200,0.25)'; g.fillRect(0, y, w, 2); }
  // the cart in the water, its horses
  poly(g, [[260, 300], [400, 296], [395, 340], [265, 345]], '#8a3a22'); ellipse(g, 300, 350, 22, 22, '#3a2a1a'); ellipse(g, 375, 348, 22, 22, '#3a2a1a');
  ellipse(g, 430, 320, 34, 16, '#4a3a2a'); ellipse(g, 455, 302, 9, 14, '#4a3a2a');
  varnish(g, w, h, 0.3);
});

// The Arnolfini Portrait (Van Eyck, 1434): the merchant and his wife in their room, she in green,
// he in a great black hat, the round mirror on the wall behind them and the brass chandelier
export const arnolfini = () => art('arnolfini', 340, 460, (g, w, h) => {
  g.fillStyle = '#4a3a24'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#6a4a2a'; g.fillRect(0, 300, w, 160);
  poly(g, [[0, 0], [70, 0], [70, 260], [0, 290]], '#c8b890'); // the window on the left
  poly(g, [[240, 90], [340, 60], [340, 330], [240, 310]], '#7a1a1a'); // the red bed
  ellipse(g, 170, 150, 26, 26, '#a89a7a'); ellipse(g, 170, 150, 20, 20, '#d8d0b8'); // the mirror
  g.strokeStyle = '#b8963c'; g.lineWidth = 3; for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI; g.beginPath(); g.moveTo(170, 40); g.lineTo(170 + Math.cos(a) * 40, 60 + Math.sin(a) * 10); g.stroke(); }
  // him on the left in his fur-trimmed black, the hat; her on the right in green over blue
  poly(g, [[70, 460], [90, 220], [150, 210], [160, 460]], '#2a1a22'); ellipse(g, 120, 190, 18, 22, '#e2c0a0'); poly(g, [[85, 178], [155, 178], [140, 120], [100, 120]], '#1a1210');
  g.strokeStyle = '#e2c0a0'; g.lineWidth = 7; g.beginPath(); g.moveTo(140, 250); g.lineTo(175, 240); g.stroke();
  poly(g, [[170, 460], [180, 230], [230, 220], [290, 460]], '#2f6a3a'); ellipse(g, 210, 200, 16, 20, '#f0d8c0'); ellipse(g, 210, 188, 22, 14, '#f4f0e6');
  ellipse(g, 120, 440, 20, 14, '#8a6a3a'); // the little dog
  varnish(g, w, h, 0.4);
});

// The Fighting Temeraire (Turner, 1839): the old warship, pale as a ghost, towed up the Thames by
// a black steam tug to be broken up, under a blazing sunset
export const temeraire = () => art('temeraire', 640, 480, (g, w, h) => {
  const s = g.createLinearGradient(0, 0, 0, h * 0.7); s.addColorStop(0, '#6a8ab0'); s.addColorStop(0.5, '#e8c070'); s.addColorStop(1, '#e8703a'); g.fillStyle = s; g.fillRect(0, 0, w, h * 0.7);
  ellipse(g, 470, 300, 40, 40, '#fff0b0'); ellipse(g, 470, 300, 160, 60, 'rgba(255,200,90,0.4)');
  poly(g, [[0, 330], [w, 330], [w, h], [0, h]], '#8a7a5a');
  for (let y = 340; y < h; y += 10) { g.fillStyle = 'rgba(255,200,120,0.18)'; g.fillRect(380, y, 180, 3); }
  // the Temeraire, pale, with its three masts
  poly(g, [[120, 330], [280, 330], [270, 290], [130, 280]], '#e8e0c8');
  g.strokeStyle = '#d8d0b8'; g.lineWidth = 4; for (const x of [160, 205, 245]) { g.beginPath(); g.moveTo(x, 285); g.lineTo(x, 110 + (x % 3) * 10); g.stroke(); }
  // the tug, black, with its tall funnel and its smoke
  poly(g, [[280, 340], [360, 340], [355, 318], [285, 318]], '#2a2420'); g.fillStyle = '#2a2420'; g.fillRect(320, 270, 10, 50);
  ellipse(g, 315, 250, 30, 18, 'rgba(60,40,30,0.7)'); ellipse(g, 290, 235, 40, 20, 'rgba(80,60,40,0.5)');
  varnish(g, w, h, 0.25);
});

// ------------------------------------------------------------------ the Kunsthistorisches, the Rijksmuseum, the Prado

// The Tower of Babel (Bruegel, 1563): the vast tower of arches rising in rings into the clouds
// over a Flemish port, unfinished on one side
export const towerOfBabel = () => art('babel', 640, 460, (g, w, h) => {
  sky(g, w, h, '#8aa8c0', '#e0e4dc', 0, h);
  poly(g, [[0, 400], [w, 380], [w, h], [0, h]], '#6a7a5a');
  ellipse(g, 560, 420, 90, 18, '#7a9ab0'); // the harbour
  for (let k = 0; k < 8; k++) {
    const y = 400 - k * 42, half = 230 - k * 24;
    g.fillStyle = k % 2 ? '#b8946a' : '#c8a47a'; g.fillRect(310 - half, y - 42, half * 2, 42);
    for (let x = 310 - half + 6; x < 310 + half - 10; x += 16) { g.fillStyle = '#5a3a22'; g.beginPath(); g.ellipse(x + 6, y - 14, 5, 10, 0, Math.PI, 0); g.fill(); g.fillRect(x + 1, y - 14, 10, 12); }
  }
  poly(g, [[310 - 40, 64], [310 + 40, 64], [310 + 20, 30], [310 - 15, 40]], '#c8a47a');
  ellipse(g, 250, 40, 90, 26, 'rgba(255,255,255,0.7)');
  varnish(g, w, h, 0.35);
});

// The Hunters in the Snow (Bruegel, 1565): three hunters and their dogs coming down the snowy hill
// past bare trees, the frozen ponds below full of skaters, the grey-green winter sky
export const huntersInSnow = () => art('hunters', 640, 460, (g, w, h) => {
  sky(g, w, h, '#a8b8a8', '#c8d0c0', 0, 200);
  poly(g, [[0, 180], [640, 220], [640, 460], [0, 460]], '#e8ecec');
  poly(g, [[300, 300], [640, 260], [640, 380], [260, 400]], '#9ab0a8'); poly(g, [[440, 250], [520, 120], [600, 250]], '#e8ecec');
  for (let k = 0; k < 24; k++) ellipse(g, 330 + (k * 37) % 300, 300 + (k * 23) % 80, 3, 6, '#2a2420');
  const tree = (x, y, s) => { g.strokeStyle = '#2a2018'; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 200 * s); g.stroke(); g.lineWidth = 2 * s; for (let q = 0; q < 6; q++) { g.beginPath(); g.moveTo(x, y - (60 + q * 25) * s); g.lineTo(x + (q % 2 ? 30 : -30) * s, y - (80 + q * 25) * s); g.stroke(); } };
  for (const [x, s] of [[110, 1.3], [200, 1.2], [280, 1.0], [360, 0.8]]) tree(x, 420 - (x / 8), s);
  for (let k = 0; k < 3; k++) { ellipse(g, 120 + k * 50, 390 - k * 10, 10, 22, '#3a2a1a'); ellipse(g, 120 + k * 50, 365 - k * 10, 6, 6, '#5a3a2a'); }
  for (let k = 0; k < 7; k++) ellipse(g, 90 + k * 30, 420 - k * 4, 12, 5, '#3a2a1a');
  for (let k = 0; k < 6; k++) ellipse(g, 30 + k * 8, 160 + k * 5, 6, 3, '#1a1a1a', 0.3); // the crows
  varnish(g, w, h, 0.25);
});

// The Peasant Wedding (Bruegel, 1567): the barn crowded with guests at a long table, the bride under
// her paper crown before the green cloth, two men carrying in the plates of porridge on a door
export const peasantWedding = () => art('pwedding', 640, 460, (g, w, h) => {
  g.fillStyle = '#b89a6a'; g.fillRect(0, 0, w, h);
  poly(g, [[0, 0], [640, 0], [640, 90], [0, 140]], '#d8c088'); // the stacked hay
  g.fillStyle = '#2f5a3a'; g.fillRect(300, 110, 90, 90); // the green cloth
  poly(g, [[140, 230], [640, 190], [640, 260], [140, 300]], '#e8dcc0'); // the table
  for (let k = 0; k < 12; k++) figure(g, 180 + k * 38, 150 + k * -3, 0.9, ['#a3202c', '#2f4a6a', '#d8c08a', '#3a3a3a', '#8a5a2a'][k % 5], { skin: '#d89a70' });
  figure(g, 345, 140, 1.0, '#1a1a1a', { skin: '#e8b890' });
  poly(g, [[320, 120], [370, 120], [360, 105], [330, 105]], '#e8d070'); // her crown
  poly(g, [[40, 380], [300, 360], [300, 380], [40, 400]], '#8a6a3a'); // the door with the plates
  for (let k = 0; k < 8; k++) ellipse(g, 70 + k * 30, 370, 12, 5, '#f0e8d0');
  figure(g, 50, 270, 1.4, '#a3202c', { skin: '#d89a70' }); figure(g, 290, 260, 1.4, '#e8dcc0', { skin: '#d89a70' });
  varnish(g, w, h, 0.35);
});

// The Night Watch (Rembrandt, 1642): Captain Banninck Cocq in black with a red sash striding out
// of the dark, his lieutenant in pale gold beside him, the militia with pikes and muskets behind,
// a girl in gold lit up among them
export const nightWatch = () => art('nightwatch', 820, 680, (g, w, h) => {
  const s = g.createRadialGradient(w * 0.45, h * 0.6, 40, w * 0.5, h * 0.5, w * 0.6); s.addColorStop(0, '#6a4a22'); s.addColorStop(1, '#140e08'); g.fillStyle = s; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3a2a1a'; g.lineWidth = 6;
  for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(200 + k * 50, 560); g.lineTo(150 + k * 60, 60 + (k % 3) * 30); g.stroke(); } // the pikes
  for (let k = 0; k < 14; k++) figure(g, 60 + k * 54, 260 + (k % 3) * 20, 1.4, ['#2a1a10', '#3a2a1a', '#4a3a2a'][k % 3], { skin: '#a8805a', hair: '#1a1208' });
  ellipse(g, 260, 340, 26, 60, '#e8c050'); ellipse(g, 260, 285, 16, 18, '#e8c090'); // the girl in gold
  figure(g, 380, 260, 2.6, '#141010', { skin: '#d8a878' }); poly(g, [[350, 330], [420, 300], [425, 318], [355, 348]], '#c82a2a'); // the captain and his sash
  figure(g, 480, 270, 2.5, '#e0c070', { skin: '#d8a878' }); // the lieutenant
  for (const [x, y] of [[380, 225], [480, 235]]) { ellipse(g, x, y - 18, 32, 8, '#1a1210'); }
  varnish(g, w, h, 0.6);
});

// Las Meninas (Velázquez, 1656): the little Infanta Margarita in her wide pale dress among her
// maids, a dwarf and the dog, Velázquez himself at his huge canvas on the left, the king and queen
// in the mirror at the back, a man on the stair in the bright doorway
export const lasMeninas = () => art('meninas', 560, 640, (g, w, h) => {
  g.fillStyle = '#3a3226'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a241c'; g.fillRect(0, 0, w, 300);
  for (let k = 0; k < 4; k++) { g.fillStyle = '#1e1a14'; g.fillRect(180 + k * 90, 70, 60, 50); }
  g.fillStyle = '#e8d8a0'; g.fillRect(380, 200, 50, 110); figure(g, 405, 230, 0.7, '#2a2018'); // the open door
  g.fillStyle = '#c8c0a0'; g.fillRect(300, 210, 40, 50); // the mirror
  poly(g, [[0, 120], [150, 100], [150, 600], [0, 620]], '#4a3a26'); // the back of the great canvas
  figure(g, 190, 330, 1.6, '#1a1612', { skin: '#d8b090' }); // Velázquez
  // the Infanta in the middle, the maids either side, the dwarfs and the dog on the right
  poly(g, [[230, 600], [250, 420], [330, 420], [350, 600]], '#e8e0c8'); ellipse(g, 290, 395, 22, 26, '#f0d8c0'); ellipse(g, 290, 380, 28, 18, '#e8d090');
  figure(g, 215, 400, 1.6, '#e0d8c0', { skin: '#f0d8c0', hair: '#d8b070' }); figure(g, 370, 400, 1.6, '#d8d0b8', { skin: '#f0d8c0', hair: '#c8a060' });
  figure(g, 440, 450, 1.2, '#2a3a5a', { skin: '#d8a878' }); figure(g, 490, 470, 1.1, '#a3202c', { skin: '#d8a878' });
  ellipse(g, 450, 600, 50, 22, '#a8885a');
  varnish(g, w, h, 0.4);
});

// Saturn Devouring His Son (Goya, c. 1820), one of the Black Paintings from the walls of his house:
// the wild-eyed giant in the dark, a body in his hands
export const saturn = () => art('saturn', 320, 520, (g, w, h) => {
  g.fillStyle = '#0e0c0a'; g.fillRect(0, 0, w, h);
  ellipse(g, 150, 280, 90, 200, '#5a4632');
  ellipse(g, 140, 110, 42, 50, '#6a5a44'); ellipse(g, 126, 100, 9, 9, '#f0e8d8'); ellipse(g, 158, 100, 9, 9, '#f0e8d8');
  ellipse(g, 140, 135, 18, 12, '#1a0e0a');
  ellipse(g, 160, 230, 30, 70, '#c8a088'); ellipse(g, 160, 200, 12, 14, '#a3202c');
  for (const s of [-1, 1]) ellipse(g, 150 + s * 50, 220, 22, 34, '#5a4632');
  varnish(g, w, h, 0.5);
});

// The Garden of Earthly Delights (Bosch, c. 1500), its three panels open: Eden on the left, the
// garden full of naked people, fruit, birds and strange fountains in the middle, hell in the dark on
// the right
export const gardenOfDelights = () => art('delights', 1024, 560, (g, w, h) => {
  const third = w / 3, rnd = rngOf(1500);
  sky(g, third, h, '#a8c8d8', '#7aa87a', 0, h); poly(g, [[0, 320], [third, 300], [third, h], [0, h]], '#6a9a5a');
  ellipse(g, third / 2, 200, 14, 60, '#e8b0b8'); figure(g, 120, 360, 1.2, '#f0d0b8', { skin: '#f0d0b8' }); figure(g, 220, 360, 1.2, '#f0d0b8', { skin: '#f0d0b8' });
  g.save(); g.translate(third, 0); sky(g, third, h, '#c8d8e0', '#8ab88a', 0, h);
  for (let k = 0; k < 5; k++) { ellipse(g, 60 + k * 60, 120, 14, 50, ['#e8b0b8', '#a8c8f0', '#e8d070'][k % 3]); }
  for (let k = 0; k < 90; k++) ellipse(g, rnd() * third, 200 + rnd() * 340, 4 + rnd() * 6, 6 + rnd() * 6, rnd() < 0.6 ? '#f0d0b8' : ['#c23a3a', '#e85a8a', '#3a8ac8', '#e8d070'][k % 4]);
  g.restore();
  g.save(); g.translate(2 * third, 0); g.fillStyle = '#140c08'; g.fillRect(0, 0, third, h);
  for (let k = 0; k < 10; k++) ellipse(g, rnd() * third, 40 + rnd() * 160, 30, 12, '#e86a1a');
  for (let k = 0; k < 40; k++) ellipse(g, rnd() * third, 220 + rnd() * 320, 5, 8, rnd() < 0.5 ? '#c8a088' : '#3a3a4a');
  ellipse(g, third / 2, 300, 50, 40, '#d8d0c0');
  g.restore();
  g.strokeStyle = '#3a2a1a'; g.lineWidth = 10; for (const x of [third, 2 * third]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  varnish(g, w, h, 0.3);
});

// ------------------------------------------------------------------ the churches

// A rose window: rings of petals and lancets of jewel-coloured glass round a figure in the middle,
// in a stone tracery; on a transparent ground, so it can be hung over a round hole
export const roseWindow = (seed = 1) => art(`rose${seed}`, 512, 512, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, R = w / 2 - 4, rnd = rngOf(seed * 77);
  const jewels = seed % 2 ? ['#1f3f9c', '#a3202c', '#2a56b8', '#d8a52c', '#5c2f86'] : ['#2a56b8', '#c23a3a', '#2f7a45', '#e5c15a', '#1f3f9c'];
  ellipse(g, cx, cy, R, R, '#1a1714');
  for (let ring = 0; ring < 4; ring++) {
    const r0 = R * (0.18 + ring * 0.2), r1 = r0 + R * 0.18, n = 12 * (ring + 1);
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2;
      g.fillStyle = jewels[Math.floor(rnd() * jewels.length)];
      g.beginPath(); g.arc(cx, cy, r1 - 3, a0 + 0.02, a1 - 0.02); g.arc(cx, cy, r0 + 3, a1 - 0.02, a0 + 0.02, true); g.closePath(); g.fill();
    }
  }
  ellipse(g, cx, cy, R * 0.16, R * 0.16, '#e5c15a'); ellipse(g, cx, cy, R * 0.08, R * 0.08, '#f0e6c8');
  g.strokeStyle = '#d8d0c0'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R - 2, 0, 7); g.stroke();
});

// gold mosaic for San Marco's domes and vaults: tesserae of gold, a little uneven, with a figure here
// and there in blue and red
export const goldMosaic = () => {
  const tex = art('goldmosaic', 512, 256, (g, w, h) => {
    const rnd = rngOf(1094);
    for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) { const v = 180 + rnd() * 60; g.fillStyle = `rgb(${v}, ${v * 0.78 | 0}, ${v * 0.3 | 0})`; g.fillRect(x, y, 4, 4); }
    for (let k = 0; k < 5; k++) { const x = 50 + k * 100; ellipse(g, x, 90, 14, 16, '#e8c8a8'); ellipse(g, x, 88, 22, 22, 'rgba(255,240,180,0.5)'); poly(g, [[x - 22, 230], [x - 14, 110], [x + 14, 110], [x + 22, 230]], k % 2 ? '#2a3a8a' : '#8a1a22'); }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

// The Pala d'Oro: the golden altarpiece of San Marco, enamels of saints in rows of gold frames,
// pearls and gems between them
export const palaDoro = () => art('paladoro', 640, 360, (g, w, h) => {
  g.fillStyle = '#c9a24a'; g.fillRect(0, 0, w, h);
  const rnd = rngOf(976);
  for (let row = 0; row < 3; row++) for (let k = 0; k < 10; k++) {
    const x = 20 + k * 61, y = 20 + row * 110;
    g.fillStyle = '#8a6a22'; g.fillRect(x, y, 52, 96);
    g.fillStyle = ['#1f3f9c', '#2f7a45', '#a3202c'][(row + k) % 3]; g.fillRect(x + 6, y + 6, 40, 84);
    ellipse(g, x + 26, y + 26, 9, 10, '#e8c8a8'); ellipse(g, x + 26, y + 24, 14, 14, 'rgba(255,230,140,0.6)');
    for (let q = 0; q < 4; q++) ellipse(g, x + 2 + rnd() * 48, y + rnd() * 96, 3, 3, rnd() < 0.5 ? '#f4f0e6' : '#c23a3a');
  }
  ellipse(g, w / 2, h / 2, 70, 90, '#e0b850'); ellipse(g, w / 2, h / 2 - 30, 16, 18, '#e8c8a8');
});

// The fresco of Sir John Hawkwood (Uccello, 1436) on the Duomo's north wall: the condottiere on his
// horse on a tall plinth, painted green-earth as if a bronze statue
// (real: false for his twin Niccolò da Tolentino beside him, Castagno's, drawn the same)
export const hawkwood = (real = true) => art(real ? 'hawkwood' : 'tolentino', 360, 560, (g, w, h) => {
  g.fillStyle = '#6a3a2a'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8b890'; g.fillRect(40, 300, 280, 240); g.fillStyle = '#b8a880'; g.fillRect(30, 290, 300, 20);
  ellipse(g, 180, 230, 110, 44, '#8a9a6a'); ellipse(g, 270, 170, 22, 36, '#8a9a6a', -0.4);
  for (const x of [100, 130, 230, 260]) { g.fillStyle = '#7a8a5a'; g.fillRect(x, 250, 14, 50); }
  ellipse(g, 170, 150, 20, 46, '#7a8a5a'); ellipse(g, 170, 98, 14, 16, '#8a9a6a');
  g.strokeStyle = '#d8c890'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
});

// Nefertiti's bust in her case: see statues.js. The glazed blue bricks of the Ishtar Gate of
// Babylon (575 BC): rows of yellow and white lions and aurochs on deep blue, bands of rosettes
export const ishtar = () => {
  const tex = art('ishtar', 512, 256, (g, w, h) => {
    const rnd = rngOf(575);
    for (let y = 0; y < h; y += 8) for (let x = (y / 8) % 2 ? -8 : 0; x < w; x += 16) { const v = rnd() * 20; g.fillStyle = `rgb(${30 + v}, ${70 + v}, ${140 + v})`; g.fillRect(x + 1, y + 1, 14, 6); }
    for (let k = 0; k < 4; k++) {
      const x = 30 + k * 125, y = 120, c = k % 2 ? '#e8c050' : '#f0ece0';
      ellipse(g, x + 40, y, 44, 20, c); ellipse(g, x + 88, y - 14, 14, 14, c);
      g.strokeStyle = c; g.lineWidth = 7; for (const lx of [10, 25, 55, 70]) { g.beginPath(); g.moveTo(x + lx, y + 14); g.lineTo(x + lx, y + 46); g.stroke(); }
      g.lineWidth = 4; g.beginPath(); g.moveTo(x, y - 4); g.quadraticCurveTo(x - 20, y - 30, x - 8, y - 40); g.stroke();
    }
    for (let x = 16; x < w; x += 32) { ellipse(g, x, 20, 9, 9, '#f0ece0'); ellipse(g, x, 20, 4, 4, '#e8c050'); ellipse(g, x, 236, 9, 9, '#f0ece0'); ellipse(g, x, 236, 4, 4, '#e8c050'); }
  });
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
};
