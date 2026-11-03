// Westminster Abbey (the church of Henry III from 1245, the west towers by Hawksmoor, finished in
// 1745) beside Parliament Square, modelled by hand in place of the map's pieces of it, from its
// measurements and photos, in game metres (the real ones times 1.25), on the map's outlines: from
// the west towers to the end of the Lady Chapel 196 m, the towers 78 m to their parapets.
//   the two west towers: their storeys of windows, the belfry openings, the clock, the parapet and
//     the corner pinnacles, and the great west window and door between them
//   the nave and the choir under one steep lead roof, the clerestory over the aisles, and the
//     flying buttresses over the aisles from pinnacled piers
//   the crossing's low lantern tower under its pyramid
//   the north transept's front over its three portals with the rose window and its two turrets,
//     and the south transept with its rose
//   the apse at the east end with its ring of chapels, and Henry VII's Lady Chapel beyond it with
//     the turrets on its buttresses under their ogee domes
//   the octagonal Chapter House to the south-east, its huge windows, flying buttresses and roof
// Riders bump into it.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, onMap, rect } from '../core/js/arcade.js';
import { range, roof, pinnacle, turret, gable, rose, sides } from './gothic.js';

const X = -199.7, Z = 655.3, TURN = -0.0917; // the crossing, the nave running along -x to the west towers
const STONE = '#d8ceb6', STONE2 = '#c4b99f', GLASS = '#373c43', LEAD = '#7d8388', DOOR = '#4a3a2c';
const WALL = 31, RIDGE = 46, AISLE = 19, HALF = 8.3; // the main vessel's walls and ridge, the aisles', its half width
const NAVE = [-99, -HALF, -HALF, HALF], CHOIR = [HALF, -HALF, 40, HALF];
const N_TRANSEPT = [-HALF, -37.7, HALF, -HALF], S_TRANSEPT = [-HALF, HALF, HALF, 37.3];
const TOWERS = [[-101.5, -18.9, -88.5, -6.2], [-101.5, 6, -88.5, 19.1]];
const LADY = [53.7, -7.9, 83.5, 7.9], LADY_AISLES = [50.9, -15, 94.5, 15];
const CHAPTER = [26.7, 50.2, 13.4]; // the chapter house's middle and its radius
const look = { stone: STONE, stone2: STONE2, glass: GLASS, roofHex: LEAD };

// the flying buttresses along a vessel's side: from a pier on the aisle's outer wall up to the
// clerestory, at every bay along u (or v) from a to b
function flyers(kit, along, a, b, at, out, bay) {
  for (let s = a + bay; s < b - 0.5; s += bay) {
    const pier = at + out * 8, wallAt = at; // the aisle's outer wall, the clerestory's
    const P = (q, y, o) => (along === 'u' ? [q, y, o] : [o, y, q]);
    const [x, , z] = P(s, 0, pier);
    kit.box(1.4, AISLE + 5, 1.4, STONE2, x, (AISLE + 5) / 2, z);
    pinnacle(kit, x, AISLE + 5, z, 1.5, 5.5, STONE2);
    kit.rod(P(s, AISLE + 4, pier), P(s, WALL - 3, wallAt + out * 0.6), 0.45, STONE2, 4);
    kit.rod(P(s, AISLE + 1.5, pier), P(s, WALL - 7, wallAt + out * 0.6), 0.4, STONE2, 4);
  }
}

export function westminsterAbbey() {
  const kit = new Kit();
  // the nave, the choir and the transepts: the main vessel's clerestory over the aisles
  range(kit, NAVE, { h: WALL, ridge: RIDGE, storeys: [AISLE, WALL], bay: 7.6, faces: 'ns', walls: 'nes', ...look });
  range(kit, CHOIR, { h: WALL, ridge: RIDGE, storeys: [AISLE, WALL], bay: 6.4, faces: 'ns', ...look });
  range(kit, N_TRANSEPT, { h: WALL, ridge: RIDGE, storeys: [AISLE, WALL], bay: 7.4, faces: 'ew', walls: 'esw', along: 'v', ...look });
  range(kit, S_TRANSEPT, { h: WALL, ridge: RIDGE, storeys: [AISLE, WALL], bay: 7.2, faces: 'ew', walls: 'new', along: 'v', ...look });
  // the aisles alongside, under flat roofs behind their parapets
  for (const s of [-1, 1]) {
    const v = s > 0 ? [HALF, 16.3] : [-16.3, -HALF];
    range(kit, [-88.5, v[0], -HALF, v[1]], { h: AISLE, bay: 7.6, faces: s > 0 ? 's' : 'n', pinnacles: false, ...look });
    range(kit, [HALF, v[0], 40, v[1]], { h: AISLE, bay: 6.4, faces: s > 0 ? 's' : 'n', pinnacles: false, ...look });
    range(kit, s > 0 ? [HALF, HALF, 17.6, 40] : [HALF, -40, 17.6, -HALF], { h: AISLE, bay: 7.4, faces: 'e', pinnacles: false, ...look });
    range(kit, s > 0 ? [-17.2, HALF, -HALF, 40] : [-17.1, -40, -HALF, -HALF], { h: AISLE, bay: 7.4, faces: 'w', pinnacles: false, ...look });
    flyers(kit, 'u', -88.5, -HALF, s * HALF, s, 7.6);
    flyers(kit, 'u', HALF, 40, s * HALF, s, 6.4);
    flyers(kit, 'v', s > 0 ? HALF : -37.7, s > 0 ? 37.3 : -HALF, s * HALF, s, 7.4);
    flyers(kit, 'v', s > 0 ? HALF : -37.7, s > 0 ? 37.3 : -HALF, -s * HALF, -s, 7.4);
  }
  // the crossing's lantern
  range(kit, [-HALF, -HALF, HALF, HALF], { h: 52, storeys: [RIDGE - 1, 52], bay: 5.5, ...look, pinnacles: true });
  roof(kit, [-HALF, -HALF, HALF, HALF], 52.4, 57, LEAD, { hip: true });
  kit.rod([0, 57, 0], [0, 61, 0], 0.15, '#c9a54a').add(new THREE.SphereGeometry(0.4, 6, 4), '#c9a54a', 0, 61, 0);
  // the west front between the towers: the great window over the door, the gable
  const west = sides(NAVE)[3];
  wall(kit, west, [[0, 0], [west.length, 0], [west.length, WALL + 1.3], [0, WALL + 1.3]], {
    holes: [pointedRing(west.length / 2, 9.6, 12, 29.5, 1, 10), pointedRing(west.length / 2, 4.4, 0, 9, 1, 8)], o0: -0.6, o1: 0.4, hex: STONE });
  kit.box(1, 8.8, 4.2, DOOR, NAVE[0] + 0.2, 4.4, 0);
  for (let k = 1; k < 5; k++) kit.box(0.3, 16, 0.3, STONE2, NAVE[0] - 0.1, 20.5, -4.8 + k * 1.92); // the west window's mullions
  gable(kit, west, WALL + 1.3, RIDGE, STONE);
  // the west towers
  for (const [u0, v0, u1, v1] of TOWERS) {
    range(kit, [u0, v0, u1, v1], { h: 58, storeys: [0, 9, 31, 44, 58], bay: 6.5, pinnacles: false, ...look });
    const cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, w = u1 - u0;
    // the belfry: a pointed opening on every side, louvred
    sides([u0 + 0.5, v0 + 0.5, u1 - 0.5, v1 - 0.5]).forEach(path => {
      const len = path.length;
      wall(kit, path, [[0, 58], [len, 58], [len, 75.5], [0, 75.5]], { holes: [pointedRing(len / 2, 5.2, 61, 73, 1, 8)], o0: -0.8, o1: 0, hex: STONE });
    });
    kit.box(w - 2.4, 17.5, w - 2.4, GLASS, cu, 66.75, cv);
    kit.box(w + 0.6, 0.8, w + 0.6, STONE2, cu, 75.9, cv);
    kit.box(w, 1.6, w, STONE, cu, 77.1, cv);
    for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) turret(kit, cu + su * (w / 2 - 0.9), cv + sv * (w / 2 - 0.9), 58, 78, 1.25, STONE2, STONE2, { cap: 7.5 });
    for (const [du, dv] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) pinnacle(kit, cu + (du * w) / 2, 77.9, cv + (dv * w) / 2, 1, 4, STONE2);
  }
  // the clock on the north tower, towards the west
  kit.add(new THREE.CircleGeometry(2, 20).rotateY(-Math.PI / 2), '#2a3a5a', TOWERS[0][0] - 0.05, 49, -12.55);
  kit.add(new THREE.RingGeometry(2, 2.3, 20).rotateY(-Math.PI / 2), '#c9a54a', TOWERS[0][0] - 0.06, 49, -12.55);
  // the transepts' fronts: the gables and the rose windows, the portals, the turrets
  for (const [box, f, s] of [[N_TRANSEPT, 0, -1], [S_TRANSEPT, 2, 1]]) {
    const end = sides(box)[f];
    const lancets = [-5.4, -1.8, 1.8, 5.4].map(d => pointedRing(end.length / 2 + d, 2.4, 11.5, 19.5, 1, 6));
    wall(kit, end, [[0, 0], [end.length, 0], [end.length, WALL + 1.3], [0, WALL + 1.3]], { holes: lancets, o0: -0.6, o1: 0.4, hex: STONE });
    gable(kit, end, WALL + 1.3, RIDGE, STONE);
    rose(kit, end, end.length / 2, 26.2, 5.6, STONE2, '#3b4a66', 0.4);
    const v = s < 0 ? box[1] : box[3];
    for (const u of [-6.2, 0, 6.2]) {
      kit.box(3.4, 7.6, 1.4, STONE2, u, 3.8, v + s * 0.6);
      kit.box(2.2, 5.6, 0.2, DOOR, u, 2.8, v + s * 1.32);
      kit.add(new THREE.ConeGeometry(2.3, 3, 4).rotateY(Math.PI / 4).scale(1, 1, 0.4), STONE2, u, 9.1, v + s * 0.6);
    }
    for (const u of [-HALF, HALF]) turret(kit, u, v, 0, 50, 1.9, STONE, STONE2, { cap: 8.5 });
    for (const u of [-13.2, 13.2]) turret(kit, u, v - s * 0.6, 0, 42, 1.4, STONE, STONE2, { cap: 7.5 });
  }
  // the apse and its chapels round the east end
  kit.add(new THREE.CylinderGeometry(HALF + 0.2, HALF + 0.2, WALL, 8).rotateY(Math.PI / 8), STONE, 40, WALL / 2, 0);
  for (const a of [-Math.PI / 4, 0, Math.PI / 4]) {
    const r = (HALF + 0.2) * Math.cos(Math.PI / 8) + 0.1;
    kit.box(0.2, 10, 2.4, GLASS, 40 + r * Math.cos(a), WALL - 6.5, r * Math.sin(a), 0, -a);
  }
  kit.add(new THREE.ConeGeometry(HALF + 0.6, RIDGE - WALL, 8).rotateY(Math.PI / 8), LEAD, 40, (WALL + RIDGE) / 2, 0);
  kit.add(new THREE.CylinderGeometry(17.5, 17.5, AISLE, 10).rotateY(Math.PI / 10), STONE, 38, AISLE / 2, 0);
  kit.add(new THREE.CylinderGeometry(17.8, 17.8, 0.6, 10).rotateY(Math.PI / 10), STONE2, 38, AISLE + 0.3, 0);
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2, c = (k + 0.5) / 10 * Math.PI * 2; // a side's middle, and the corner after it
    if (Math.cos(a) > 0) kit.box(0.25, 11, 3.6, GLASS, 38 + 16.75 * Math.cos(a), 9, 16.75 * Math.sin(a), 0, -a);
    if (Math.cos(c) > -0.1) pinnacle(kit, 38 + 17.6 * Math.cos(c), AISLE, 17.6 * Math.sin(c), 1.3, 5, STONE2);
  }
  // Henry VII's Lady Chapel: its aisles' bay windows, the chapel over them, the turrets
  range(kit, LADY_AISLES, { h: 14, bay: 5.4, pinnacles: false, ...look, faces: 'nse' });
  range(kit, LADY, { h: 26, ridge: 31, storeys: [14, 26], bay: 5, pinnacles: false, faces: 'nse', ...look });
  for (let u = LADY[0] + 2; u <= LADY[2] + 0.1; u += 4.95) {
    for (const v of [LADY[1], LADY[3]]) turret(kit, u, v, 14, 29.5, 0.85, STONE, STONE2, { dome: true, cap: 2.2 });
    for (const v of [LADY_AISLES[1], LADY_AISLES[3]]) turret(kit, u + 0.9, v, 0, 18, 0.8, STONE, STONE2, { dome: true, cap: 2 });
  }
  for (const v of [LADY[1] + 3, 0, LADY[3] - 3]) turret(kit, LADY_AISLES[2], v, 0, 18, 0.9, STONE, STONE2, { dome: true, cap: 2 });
  // the chapter house: its eight sides of window, the buttresses flying out, the roof
  const [cu, cv, cr] = CHAPTER;
  kit.add(new THREE.CylinderGeometry(cr - 0.6, cr - 0.6, 25, 8).rotateY(Math.PI / 8), GLASS, cu, 12.5, cv);
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) / 8) * Math.PI * 2, x = cu + cr * Math.cos(a), z = cv + cr * Math.sin(a); // a corner
    kit.box(1.5, 26, 1.5, STONE, x, 13, z, 0, -a);
    turret(kit, x, z, 26, 28, 0.9, STONE2, STONE2, { cap: 4 });
    const fx = cu + (cr + 9) * Math.cos(a), fz = cv + (cr + 9) * Math.sin(a);
    kit.box(1.4, 17, 1.4, STONE2, fx, 8.5, fz, 0, -a);
    pinnacle(kit, fx, 17, fz, 1.4, 5, STONE2);
    kit.rod([fx, 15.5, fz], [x, 23, z], 0.45, STONE2, 4);
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, c = Math.cos(Math.PI / 8) * cr; // the middle of a side
    kit.box(0.4, 2, 2 * cr * Math.sin(Math.PI / 8), STONE, cu + c * Math.cos(a), 1, cv + c * Math.sin(a), 0, -a);
    kit.box(0.4, 2.2, 2 * cr * Math.sin(Math.PI / 8), STONE, cu + c * Math.cos(a), 24.9, cv + c * Math.sin(a), 0, -a);
    for (const d of [-0.33, 0, 0.33]) kit.box(0.3, 21.5, 0.3, STONE2, cu + c * Math.cos(a) - d * 2 * cr * Math.sin(Math.PI / 8) * Math.sin(a), 12.5, cv + c * Math.sin(a) + d * 2 * cr * Math.sin(Math.PI / 8) * Math.cos(a));
  }
  kit.add(new THREE.ConeGeometry(cr + 0.6, 20, 8).rotateY(Math.PI / 8), LEAD, cu, 26 + 10, cv);
  range(kit, [21, 25.5, 32.2, 37], { h: 14, ridge: 19, bay: 4, pinnacles: false, along: 'v', ...look }); // the vestibule to the cloister
  return kit.mesh(kitMat(0.9));
}

const R = b => onMap(X, Z, TURN, rect(...b));
const OCT = Array.from({ length: 8 }, (_, k) => [CHAPTER[0] + (CHAPTER[2] + 1.5) * Math.cos(((k + 0.5) / 8) * Math.PI * 2), CHAPTER[1] + (CHAPTER[2] + 1.5) * Math.sin(((k + 0.5) / 8) * Math.PI * 2)]);
const SOLID = [[-101.5, -19, -88.5, 19.1], [-88.5, -16.3, 40, 16.3], [-17.6, -44, 17.6, 40.6], [40, -18, 56, 18], LADY_AISLES, [21, 25.5, 32.2, 37]];
export const WESTMINSTER_ABBEY = [{
  id: 'westminster-abbey', name: 'Westminster Abbey', x: X, z: Z, turn: TURN, reach: 320,
  area: [R([-106, -19.6, -88, 19.6]), R([-88.6, -17, 42, 17]), R([-17.8, -45, 17.8, 41]), R([38, -26.5, 56, 26.5]), R([50, -16, 95, 16]), R([10, 26, 49, 73])],
  foot: [...SOLID.map(R), onMap(X, Z, TURN, OCT)],
  make: westminsterAbbey,
}];
