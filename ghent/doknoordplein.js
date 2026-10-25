// Dok Noord's square, drawn closer to life (photos of the square): the map has the old harbour
// works round it as one low outline. In its place:
//  - along the south side, across the square from Travelbase, two floors of shops behind a
//    gallery, and over them four glass sawtooth gables, a lattice of metal slats on their roofs
//    running out over the square on slender black columns; behind them the rest of the old works,
//    plain and flat
//  - along the east side a long hall, all glass to the square under a dark pitched roof
//  - across the square on the west side the Direkteurswoning, the old director's house: a red
//    brick gable with a great arched window and its name in white, in place of the map's block there
//  - young trees on the square in wooden frames
// All of it is one monument (ghent/monuments.js) on the map's outlines, which it stands in for.
import * as THREE from 'three';
import { elevation, brick, rng, letGo } from '../core/js/facades.js';
import { Kit, kitMat } from '../core/js/kit.js';
import { sides } from './doknoord.js';

// The square's south-east corner, where the hall along the east meets the shops along the south
// (the map's corner of its outline there), and the far ends of those two sides.
const CORNER = [802, -1784.5], NORTH = [765.8, -1914.5], WEST = [730.3, -1762.6];
// The rest of the old works, round behind the shops: the map's outline from the shops' west end
// round to the back of the hall.
const WORKS = [[719.6, -1759.4], [720.3, -1756.8], [722.2, -1750.1], [738.8, -1690.9], [741.2, -1678], [801.1, -1687], [810.8, -1690],
  [872.4, -1708.5], [878.2, -1710.2], [876.2, -1717.9], [882.8, -1719.9], [855.8, -1805.5]];

// A side of the square as a frame: x along its front (to your left as you face it from the
// square), z into the building, y up; a group turned by `turn` has these as its own axes.
function frame(from, to) {
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]), u = [(to[0] - from[0]) / L, (to[1] - from[1]) / L];
  const n = [-u[1], u[0]]; // a quarter turn from u: into the building on both sides here
  return { from, L, turn: Math.atan2(-u[1], u[0]), at: (x, z) => [from[0] + u[0] * x + n[0] * z, from[1] + u[1] * x + n[1] * z] };
}
const EAST = frame(CORNER, NORTH); // x north along the hall, z east
const SOUTH = frame(WEST, CORNER); // x east along the shops, z south

// the shops along the south side, in metres along it from its west end: the four sawtooth gables
// in the middle of its length
const SAW = { teeth: 4, w: 18, base: 12, valley: 17.5, peak: 26, depth: 36, over: 3.5 };
SAW.x0 = (SOUTH.L - SAW.teeth * SAW.w) / 2;
// the outline along the east side, in its frame: the hall's front, then round the back clear of the
// Dok Noord building at the north end and of the houses along the water
const EAST_END = 112;
const BACK = [[0, 0], [EAST_END, 0], [106.5, 19], [106.8, 33.4], [107.5, 51.9], [0, 50]];
const HALL = { x1: 106.5, depth: 24, eave: 11, ridge: 17.2 };
// The Direkteurswoning stands on the other block on the west side: the broad former works
// at the square's south-west corner, not the taller block just north of it. Its gable faces
// the square along the east edge of this map outline.
const DIR_FOOT = [654.9, -1787.1, 654.5, -1790.4, 658.9, -1790.9, 677.4, -1792.4, 685, -1793.1,
  719.2, -1796.3, 725.9, -1797, 728.8, -1765.4, 675.8, -1760.9, 663.4, -1759.6, 657.4, -1759.2, 656.6, -1767.5];
const WESTSIDE = frame([725.9, -1797], [728.8, -1765.4]); // x south along its front, z west
const DIR = { x0: 0, x1: 22, depth: 20, eave: 12.8, peak: 17.6, top: 18.3, wing: 7 };

const world = (f, pts) => pts.flatMap(([x, z]) => f.at(x, z));
const EAST_FOOT = world(EAST, BACK);
const WORKS_FOOT = [...CORNER, ...WEST, ...WORKS.flat(), ...EAST.at(0, 50)];
const X = 790, Z = -1800;

// A picture of a front, drawn in metres as you look at it (see core/js/facades.js elevation), put
// back when the GPU forgets it
function picture(W, H, px, draw) {
  const t = elevation(W, H, px, draw);
  letGo(t, () => {
    const c = t.image; c.width = Math.ceil(W * px); c.height = Math.ceil(H * px);
    const g = c.getContext('2d'); g.setTransform(px, 0, 0, -px, (W / 2) * px, H * px); draw(g, W, H);
  });
  return t;
}
function label(g, text, f, y, size, color = '#fff', weight = 700, align = 'center', family = 'sans-serif') {
  g.save(); g.scale(1, -1);
  g.font = `${weight} ${size}px ${family}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle';
  g.fillText(text, f, -y);
  g.restore();
}

// A front in a frame's own metres: a flat outline (pts [x, y], or the rectangle) from x0 to x1 and
// y0 to y1 wearing a picture drawn as you face it (its left at x1), a little out from z.
function front(x0, x1, y0, y1, tex, mat = {}, pts = null, z = -0.04) {
  const shape = new THREE.Shape((pts ?? [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]).map(([x, y]) => new THREE.Vector2(x, y)));
  const W = x1 - x0, H = y1 - y0;
  tex.repeat.set(-1 / W, 1 / H);
  tex.offset.set((x0 + x1) / 2 / W + 0.5, -y0 / H);
  const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, side: THREE.DoubleSide, ...mat }));
  m.position.z = z;
  m.receiveShadow = true;
  return m;
}
// a flat outline ([x, y] points) standing at z, in one colour
function flatWall(pts, z, mat) {
  const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))), mat);
  m.position.z = z;
  return m;
}
// a quad from four [x, y, z] corners, uv laid `tile` metres to a repeat along a-b and a-d
function quad(a, b, c, d, mat, tile = 4) {
  const la = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), ld = Math.hypot(d[0] - a[0], d[1] - a[1], d[2] - a[2]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, la / tile, 0, la / tile, ld / tile, 0, 0, la / tile, ld / tile, 0, ld / tile], 2));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}
// walls and a flat roof on an outline of [x, z] points (sides `skip` left out)
function block(pts, h, wall, roof, skip = []) {
  const g = new THREE.Group(), ring = pts.flat();
  const w = new THREE.Mesh(sides(ring, 0, h, skip), wall);
  w.castShadow = w.receiveShadow = true;
  g.add(w);
  const top = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)))).rotateX(-Math.PI / 2).translate(0, h, 0);
  g.add(new THREE.Mesh(top, roof));
  return g;
}
function inFrame(f) {
  const g = new THREE.Group();
  g.position.set(f.from[0] - X, 0, f.from[1] - Z);
  g.rotation.y = f.turn;
  return g;
}

// ---- the shops along the south side -------------------------------------------------------------

// Who is where, unit by unit from the east end (a tenth of the front each), as the photos show them and as far as
// the shops' own addresses tell (Dok-Noord 7): on the ground floor, then up on the gallery.
// Action's name runs big along the gallery's edge over its two units.
const GROUND = ['', 'STANDAARD BOEKHANDEL', 'GO SPORT', 'COURIR', 'OR COFFEE', 'APOTHEEK DOK NOORD', 'RAW SALAD COMPANY', 'ATITA', 'GIKS MODE', 'PARTYWINKEL'];
const GALLERY = ['ROYAL GYM', 'XOOON', 'DAVID & GOLIATH', 'TIME 2 SLEEP', 'HENDERS & HAZEL', 'IXINA', 'DOK INTERIORS', 'AVANCE', 'ELECTROSTOCK', 'TISSUS DU MONDE'];
function drawShops(g, W) {
  const half = W / 2, r = rng(31), U = W / GROUND.length;
  g.fillStyle = '#cfcfca'; g.fillRect(-half, 0, W, 12);
  // the shops on the ground floor, in under the gallery: glass, warm light, white frames
  for (let k = 0, f = -half; k < GROUND.length; k++, f += U) {
    const light = g.createLinearGradient(0, 0, 0, 4.3);
    light.addColorStop(0, '#5a4a3a'); light.addColorStop(1, r() < 0.5 ? '#c9a46a' : '#8c8f8a');
    g.fillStyle = light; g.fillRect(f, 0, U, 4.3);
    g.fillStyle = 'rgba(255, 240, 200, 0.5)';
    for (let k = 0; k < 3; k++) g.fillRect(f + 1 + r() * (U - 3), 3.2 + r() * 0.6, 1.2, 0.08);
    g.fillStyle = '#eceae4';
    for (let x = f; x < f + U; x += U / 4) g.fillRect(x, 0, 0.08, 4.3);
    g.fillStyle = '#dcdcd7'; g.fillRect(f - 0.3, 0, 0.6, 5.4); // the pillar between two shops
  }
  g.fillStyle = '#e6e6e1'; g.fillRect(-half, 4.3, W, 1.1); // the band for their names
  g.fillStyle = '#b5b5b0'; g.fillRect(-half, 5.4, W, 1.0); // the gallery's edge
  g.fillStyle = 'rgba(0, 0, 0, 0.18)'; g.fillRect(-half, 5.4, W, 0.12);
  // the gallery: shops behind glass, a glass balustrade along its edge
  g.fillStyle = '#4c5359'; g.fillRect(-half, 6.4, W, 4.8);
  for (let k = 0, f = -half; k < GALLERY.length; k++, f += U) {
    g.fillStyle = r() < 0.6 ? 'rgba(220, 200, 160, 0.35)' : 'rgba(150, 170, 180, 0.3)'; g.fillRect(f + 0.4, 6.9, U - 0.8, 3.0);
    g.fillStyle = '#e8e8e4'; g.fillRect(f + 0.4, 9.9, U - 0.8, 0.55); // a sign over each
    g.fillStyle = '#2b3034'; for (let x = f; x < f + U; x += U / 6) g.fillRect(x, 6.4, 0.06, 4.8);
  }
  g.fillStyle = 'rgba(190, 210, 215, 0.45)'; g.fillRect(-half, 6.4, W, 1.15);
  g.fillStyle = '#7d868c'; g.fillRect(-half, 7.5, W, 0.07);
  g.fillStyle = '#c4c4bf'; g.fillRect(-half, 11.2, W, 0.8);
  GROUND.forEach((name, k) => name && label(g, name, -half + U / 2 + k * U, 4.85, name.length > 14 ? 0.32 : 0.46, '#2b2f33', 600));
  GALLERY.forEach((name, k) => label(g, name, -half + U / 2 + k * U, 10.17, name.length > 12 ? 0.3 : 0.4, '#2b2f33', 600));
  g.fillStyle = '#0f6db3'; g.fillRect(-half + 1.5, 5.5, 2 * U - 3, 0.8); // Action's blue band, its name in white
  label(g, 'ACTION', -half + U, 5.92, 0.66, '#fff', 800);
}

function drawSawGlass(g, W) {
  const half = W / 2, r = rng(8);
  const sky = g.createLinearGradient(0, 0, 0, 14);
  sky.addColorStop(0, '#4f5c66'); sky.addColorStop(0.35, '#8796a2'); sky.addColorStop(1, '#c8d1d8');
  g.fillStyle = sky; g.fillRect(-half, 0, W, 14);
  // inside, through the glass: the floor's ceiling lights and its dark back
  g.fillStyle = 'rgba(30, 34, 38, 0.55)'; g.fillRect(-half, 0, W, 3.6);
  g.fillStyle = 'rgba(255, 245, 220, 0.6)';
  for (let i = 0; i < 40; i++) g.fillRect(-half + r() * W, 4.4 + r() * 0.3, 0.9, 0.06);
  g.strokeStyle = '#2c3135';
  g.lineWidth = 0.09;
  g.beginPath();
  for (let f = -half; f <= half; f += 1.5) { g.moveTo(f, 0); g.lineTo(f, 14); }
  for (const y of [0.1, 2.75, 5.5, 8.25, 11]) { g.moveTo(-half, y); g.lineTo(half, y); }
  g.stroke();
  // O'Learys up in the glass, its bowling and sportbar over the shops: its name on the middle two
  // gables, what there is to do on a banner between
  for (const f of [-9, 9]) label(g, "O'Learys", f, 9.2, 1.7, '#f4f1e8', 700, 'center', 'Georgia, serif');
  g.fillStyle = 'rgba(25, 30, 34, 0.75)'; g.fillRect(-11, 5.3, 22, 2.2);
  label(g, 'Sportbar · Restaurant · Events & Banquets', 0, 6.85, 0.62, '#f4f1e8', 600);
  label(g, 'Bowling · Ice hockey · Minigolf', 0, 5.95, 0.62, '#f4f1e8', 600);
  g.fillStyle = 'rgba(255, 255, 255, 0.12)'; // a glint across it
  g.beginPath(); g.moveTo(-half, 8); g.lineTo(half, 2); g.lineTo(half, 3.5); g.lineTo(-half, 10); g.fill();
}

// the slats over the sawtooth roofs: square openings between light metal bars, 1.2 m to a repeat
let lattice = null;
function latticeMap() {
  if (lattice) return lattice;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  x.clearRect(0, 0, 64, 64);
  x.fillStyle = '#dfe2e2';
  x.fillRect(0, 0, 64, 9); // the slat
  x.fillRect(0, 0, 7, 64); // the rail
  x.fillStyle = '#9da3a6';
  x.fillRect(0, 9, 64, 2);
  lattice = new THREE.CanvasTexture(c);
  lattice.wrapS = lattice.wrapT = THREE.RepeatWrapping;
  lattice.colorSpace = THREE.SRGBColorSpace;
  return lattice;
}

function shops(wallMat, roofMat) {
  const g = inFrame(SOUTH), kit = new Kit(), L = SOUTH.L;
  g.name = 'dok-noord-shops';
  // the two floors of shops, the whole length of the south side
  g.add(block([[0, 0], [L, 0], [L, SAW.depth], [0, SAW.depth]], SAW.base, wallMat, roofMat, [0]));
  g.add(front(0, L, 0, SAW.base, picture(L, SAW.base, 16, (c, W) => drawShops(c, W)), { roughness: 0.8 }));
  // the sawtooth: a glass floor over the shops, the four glass gables on it
  const x1 = SAW.x0 + SAW.teeth * SAW.w, outline = [[SAW.x0, SAW.base], [x1, SAW.base]];
  for (let t = SAW.teeth - 1; t >= 0; t--) {
    const a = SAW.x0 + t * SAW.w;
    outline.push([a + SAW.w, SAW.valley], [a + SAW.w / 2, SAW.peak]);
  }
  outline.push([SAW.x0, SAW.valley]);
  const glass = picture(x1 - SAW.x0, SAW.peak - SAW.base, 16, (c, W) => drawSawGlass(c, W));
  g.add(front(SAW.x0, x1, SAW.base, SAW.peak, glass, { roughness: 0.15, metalness: 0.35 }, outline));
  const grey = new THREE.MeshStandardMaterial({ color: 0x8a8d8f, roughness: 0.8, side: THREE.DoubleSide });
  g.add(flatWall(outline, SAW.depth, grey));
  for (const x of [SAW.x0, x1]) {
    g.add(quad([x, SAW.base, 0], [x, SAW.base, SAW.depth], [x, SAW.valley, SAW.depth], [x, SAW.valley, 0], grey));
  }
  // the roofs, and the slats over them, out over the square
  const slats = new THREE.MeshStandardMaterial({ map: latticeMap(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.4 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x4d5257, roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide });
  for (let t = 0; t < SAW.teeth; t++) {
    const a = SAW.x0 + t * SAW.w, m = a + SAW.w / 2, b = a + SAW.w;
    for (const [p, q] of [[a, m], [b, m]]) {
      g.add(quad([p, SAW.valley, 0], [q, SAW.peak, 0], [q, SAW.peak, SAW.depth], [p, SAW.valley, SAW.depth], metal));
      const lift = 0.35;
      const s = quad([p, SAW.valley + lift, -SAW.over], [q, SAW.peak + lift, -SAW.over], [q, SAW.peak + lift, SAW.depth], [p, SAW.valley + lift, SAW.depth], slats, 1.2);
      s.castShadow = true;
      g.add(s);
      kit.rod([p, SAW.valley + lift - 0.1, -SAW.over], [q, SAW.peak + lift - 0.1, -SAW.over], 0.14, 0x25282b); // the edge beam
    }
  }
  // the black columns under the slats, at every valley, and the beam along the front
  for (let t = 0; t <= SAW.teeth; t++) {
    const x = SAW.x0 + t * SAW.w;
    kit.box(0.4, SAW.valley + 0.3, 0.4, 0x25282b, x, (SAW.valley + 0.3) / 2, -SAW.over);
  }
  g.add(kit.mesh(kitMat(0.6, 0.2)));
  return g;
}
// The square itself is open paving: the map's beds and trees on it give way to those few young ones.
export const SQUARE = [742, -1905, 771, -1895, ...CORNER, ...WEST, 741, -1800];
// where the trees stand, in the east frame (out on the square, so z < 0)
const TREE_SPOTS = [[18, -13], [40, -24], [62, -14], [84, -23], [30, -38]];
export const TREES = TREE_SPOTS.flatMap(([x, z]) => EAST.at(x, z));

// ---- the Direkteurswoning ---------------------------------------------------------------------

const RED = '#b0624a';
function drawDirecteur(g, W, H) {
  const half = W / 2;
  brick(g, -half, 0, half, H, RED, { course: 0.2, seed: 17 });
  const r = rng(5);
  for (let i = 0; i < 700; i++) { g.fillStyle = ['#9a5040', '#c47258', '#8c4a3c'][i % 3]; g.globalAlpha = 0.5; g.fillRect(-half + r() * W, Math.floor(r() * H / 0.2) * 0.2 + 0.02, 0.27, 0.16); }
  g.globalAlpha = 1;
  // a pier at each corner, the coping along the gable
  g.fillStyle = 'rgba(255, 220, 200, 0.08)'; g.fillRect(-half, 0, 0.8, DIR.eave); g.fillRect(half - 0.8, 0, 0.8, DIR.eave);
  g.strokeStyle = '#9b8f84'; g.lineWidth = 0.35;
  g.beginPath(); g.moveTo(-half, DIR.eave); g.lineTo(-half + 0.6, DIR.eave); g.lineTo(-2.8, DIR.peak); g.lineTo(-2.8, DIR.top); g.lineTo(2.8, DIR.top); g.lineTo(2.8, DIR.peak); g.lineTo(half - 0.6, DIR.eave); g.lineTo(half, DIR.eave); g.stroke();
  // the great window under a flat arch: dark glass in a grid of black bars
  const wx0 = -4.8, wx1 = 3.0, wy0 = 7.4, wy1 = 12.0, rise = 0.9;
  const arch = () => { g.beginPath(); g.moveTo(wx0, wy0); g.lineTo(wx1, wy0); g.lineTo(wx1, wy1); g.quadraticCurveTo((wx0 + wx1) / 2, wy1 + rise * 2, wx0, wy1); g.closePath(); };
  g.strokeStyle = '#c2725a'; g.lineWidth = 0.6; arch(); g.stroke();
  g.fillStyle = '#2c3a40'; arch(); g.fill();
  g.save(); arch(); g.clip();
  g.fillStyle = 'rgba(170, 190, 200, 0.35)'; g.fillRect(wx0, wy0 + 2.4, 3.2, 3);
  g.strokeStyle = '#121416'; g.lineWidth = 0.09; g.beginPath();
  for (let x = wx0; x <= wx1; x += (wx1 - wx0) / 7) { g.moveTo(x, wy0); g.lineTo(x, wy1 + rise * 2); }
  for (let y = wy0; y <= wy1 + rise; y += 1.0) { g.moveTo(wx0, y); g.lineTo(wx1, y); }
  g.stroke(); g.restore();
  g.fillStyle = '#9b8f84'; g.fillRect(wx0 - 0.3, wy0 - 0.25, wx1 - wx0 + 0.6, 0.25); // the sill
  // its name in white, with the little drawn house before it
  label(g, 'DIREKTEURSWONING', 0.5, 6.2, 0.62, '#f4f4f0', 700);
  g.strokeStyle = '#f4f4f0'; g.lineWidth = 0.06; g.strokeRect(-5.6, 5.95, 0.45, 0.45);
  // a small square window up on the left, the door under its arch, tall arched windows
  g.fillStyle = '#1e2326'; g.fillRect(-8.9, 5.0, 1.8, 2.8);
  g.strokeStyle = '#c2725a'; g.lineWidth = 0.3; g.strokeRect(-8.9, 5.0, 1.8, 2.8);
  const archOpening = (cx, w, h, fill) => {
    g.beginPath(); g.moveTo(cx - w / 2, 0.2); g.lineTo(cx - w / 2, h - w / 2); g.arc(cx, h - w / 2, w / 2, Math.PI, 0, true); g.lineTo(cx + w / 2, 0.2); g.closePath();
    g.fillStyle = fill; g.fill(); g.strokeStyle = '#c2725a'; g.lineWidth = 0.28; g.stroke();
  };
  archOpening(-2.6, 2.3, 4.4, '#23292c');
  g.fillStyle = '#5a646a'; g.fillRect(-3.5, 0.2, 1.8, 2.9); // the glass door
  for (const cx of [-9.1, -6.9, 5.4, 7.6]) archOpening(cx, 1.3, 3.6, '#2d3a40');
  g.fillStyle = '#8e9194'; g.fillRect(-half, 0, W, 0.35); // the plinth
}

function direkteurswoning(roofMat) {
  const g = inFrame(WESTSIDE);
  g.name = 'direkteurswoning';
  const wall = new THREE.MeshStandardMaterial({ map: redBrick(), roughness: 0.95, side: THREE.DoubleSide });
  // the house in the middle of the outline's front, lower brick wings on the rest of it
  const house = new THREE.Group();
  house.position.x = (WESTSIDE.L - (DIR.x1 - DIR.x0)) / 2;
  g.add(house);
  const ring = [];
  for (let k = 0; k < DIR_FOOT.length; k += 2) ring.push([DIR_FOOT[k] - WESTSIDE.from[0], DIR_FOOT[k + 1] - WESTSIDE.from[1]]);
  const wing = block(ring, DIR.wing, wall, roofMat);
  wing.rotation.y = -WESTSIDE.turn; // (in the city's own axes, the frame turned back)
  g.add(wing);
  directorsHouse(house, wall, roofMat);
  return g;
}
function directorsHouse(g, wall, roofMat) {
  const half = (DIR.x1 - DIR.x0) / 2, mid = (DIR.x0 + DIR.x1) / 2;
  // its gable, as you see it (x the other way round)
  const outline = [[-half, 0], [half, 0], [half, DIR.eave], [half - 0.6, DIR.eave], [2.8, DIR.peak], [2.8, DIR.top], [-2.8, DIR.top], [-2.8, DIR.peak], [-half + 0.6, DIR.eave], [-half, DIR.eave]]
    .map(([f, y]) => [mid - f, y]);
  const H = DIR.top + 0.4;
  g.add(front(DIR.x0, DIR.x1, 0, H, picture(DIR.x1 - DIR.x0, H, 36, (c, W) => drawDirecteur(c, W, H)), { roughness: 0.9 }, outline, -0.05));
  // the side walls and the back, the roof, and a chimney at the top of the gable
  const ring = [DIR.x0, 0, DIR.x1, 0, DIR.x1, DIR.depth, DIR.x0, DIR.depth];
  const w = new THREE.Mesh(sides(ring, 0, DIR.eave, [0]), wall);
  w.castShadow = w.receiveShadow = true;
  g.add(w);
  const ridge = DIR.peak - 0.3, back = flatWall([[DIR.x0, 0], [DIR.x1, 0], [DIR.x1, DIR.eave], [mid, ridge], [DIR.x0, DIR.eave]], DIR.depth, wall);
  g.add(back);
  g.add(quad([DIR.x0, DIR.eave, 0], [mid, ridge, 0], [mid, ridge, DIR.depth], [DIR.x0, DIR.eave, DIR.depth], roofMat));
  g.add(quad([DIR.x1, DIR.eave, 0], [mid, ridge, 0], [mid, ridge, DIR.depth], [DIR.x1, DIR.eave, DIR.depth], roofMat));
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 1.4), wall);
  chimney.position.set(mid + 1.2, DIR.top + 0.6, 1.2);
  g.add(chimney);
}
let redMap = null;
function redBrick() {
  if (redMap) return redMap;
  const draw = c => brick(c, -2, 0, 2, 4, RED, { course: 0.2, seed: 23 });
  redMap = picture(4, 4, 40, draw);
  redMap.wrapS = redMap.wrapT = THREE.RepeatWrapping;
  return redMap;
}

// ---- the glass hall along the east side -------------------------------------------------------

function drawHall(g, W) {
  const half = W / 2, r = rng(44);
  const glass = g.createLinearGradient(0, 0, 0, HALL.eave);
  glass.addColorStop(0, '#2a3238'); glass.addColorStop(0.6, '#55636d'); glass.addColorStop(1, '#8c9aa4');
  g.fillStyle = glass; g.fillRect(-half, 0, W, HALL.eave);
  // the showroom inside: sofas, tables, lamps hanging from the roof
  for (let i = 0; i < 26; i++) {
    const f = -half + r() * W;
    g.fillStyle = ['#8a7a66', '#b9b2a4', '#5d4a3a', '#a86a4a', '#6c7a6a'][i % 5]; g.globalAlpha = 0.7;
    g.fillRect(f, 0.3, 1.4 + r() * 1.4, 0.5 + r() * 0.5);
    g.fillStyle = '#e8dcb8'; g.fillRect(f + 0.5, 4.0 + r() * 1.5, 0.35, 0.25);
    g.fillStyle = '#222'; g.fillRect(f + 0.66, 4.25, 0.03, 4);
  }
  g.globalAlpha = 1;
  g.strokeStyle = '#1b1e20'; g.lineWidth = 0.1; g.beginPath();
  for (let f = -half; f <= half; f += W / 40) { g.moveTo(f, 0); g.lineTo(f, HALL.eave); }
  for (const y of [0.1, 3.6, 7.4]) { g.moveTo(-half, y); g.lineTo(half, y); }
  g.stroke();
  g.fillStyle = '#cfcfcb'; g.fillRect(-half, HALL.eave - 0.55, W, 0.55); // the eaves' white edge
}

function hall(roofMat, wallMat) {
  const g = inFrame(EAST), L = HALL.x1, { depth, eave, ridge } = HALL, kit = new Kit();
  g.name = 'dok-noord-hall';
  // the rest of the old works behind it, low and flat, up to the Dok Noord building
  g.add(block(BACK, 10, wallMat, roofMat));
  g.add(front(0, L, 0, eave, picture(L, eave, 18, (c, W) => drawHall(c, W)), { roughness: 0.2, metalness: 0.3 }));
  const ends = [[0, 0], [0, depth], [L, depth], [L, 0]];
  const w = new THREE.Mesh(sides(ends.flat(), 0, eave, [3]), wallMat);
  w.castShadow = w.receiveShadow = true;
  g.add(w);
  // the dark roof, its ridge halfway back, the gables at its two ends
  g.add(quad([0, eave, -0.4], [L, eave, -0.4], [L, ridge, depth / 2], [0, ridge, depth / 2], roofMat));
  g.add(quad([0, eave, depth], [L, eave, depth], [L, ridge, depth / 2], [0, ridge, depth / 2], roofMat));
  for (const x of [0, L]) {
    const end = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, eave), new THREE.Vector2(depth, eave), new THREE.Vector2(depth / 2, ridge)])), wallMat);
    end.rotation.y = -Math.PI / 2;
    end.position.x = x;
    g.add(end);
  }
  // the young trees on the square, each in its wooden frame (the trees are in city.js)
  for (const [x, z] of TREE_SPOTS) {
    for (const [dx, dz] of [[-0.6, -0.6], [0.6, -0.6], [0.6, 0.6], [-0.6, 0.6]]) kit.box(0.09, 1.7, 0.09, 0xb08a5a, x + dx, 0.85, z + dz);
    for (const [dx, dz, w, d] of [[0, -0.6, 1.3, 0.08], [0, 0.6, 1.3, 0.08], [-0.6, 0, 0.08, 1.3], [0.6, 0, 0.08, 1.3]]) kit.box(w, 0.08, d, 0xb08a5a, x + dx, 1.62, z + dz);
  }
  g.add(kit.mesh(kitMat(0.6, 0.2)));
  return g;
}

function square() {
  const g = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ map: greyBrick(), roughness: 0.95, side: THREE.DoubleSide });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x3f4246, roughness: 0.8, side: THREE.DoubleSide });
  g.add(shops(wallMat, roofMat), hall(roofMat, wallMat), direkteurswoning(roofMat));
  // the rest of the old works behind the shops, low and flat, in the city's own metres
  const works = [];
  for (let k = 0; k < WORKS_FOOT.length; k += 2) works.push([WORKS_FOOT[k] - X, WORKS_FOOT[k + 1] - Z]);
  g.add(block(works, 10, wallMat, roofMat, [0, works.length - 1]));
  return g;
}
let greyMap = null;
function greyBrick() {
  if (greyMap) return greyMap;
  const draw = c => brick(c, -2, 0, 2, 4, '#8a6a5c', { course: 0.2, seed: 29 });
  greyMap = picture(4, 4, 32, draw);
  greyMap.wrapS = greyMap.wrapT = THREE.RepeatWrapping;
  return greyMap;
}

export const DOK_NOORD_PLEIN = [{ id: 'dok-noord-plein', name: 'Dok Noord', x: X, z: Z, turn: 0, reach: 160, area: [EAST_FOOT, WORKS_FOOT, DIR_FOOT], foot: [EAST_FOOT, WORKS_FOOT, DIR_FOOT], make: square }];
