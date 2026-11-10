// The Centre Pompidou (Piano and Rogers, 1971-77), modelled by hand in place of the map's block of
// it, from its measurements, in game metres (the real ones times 1.25), on the map's outline: 166 m
// by 60 m (207 by 75 here), 42 m high, its insides turned out:
//   the glass box of its six floors inside a white steel frame, the columns in thirteen bays down
//     both long sides, the beams at every floor and the crosses of bracing over the fronts
//   on the piazza side the escalator climbing the front in its glass tube, flight by flight
//   on the Rue du Renard side the pipes in their colours: blue for the air, green for the water,
//     yellow for the electricity, red for the lifts, and the big white air shafts on the roof
// The model's own metres: u along the long sides (north), v across them (east, away from the
// piazza), y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = 555.7, Z = -533.4, TURN = 1.223;
const HU = 104.5, HV = 37.5, H = 52.5, FLOOR = H / 6, BAY = (2 * HU) / 13;
const WHITE = '#eef0ee', GLASS = '#7d93a3', BLUE = '#2f6bc4', GREEN = '#3c9a4c', YELLOW = '#e7c63a', RED = '#c9302c', TUBE = '#bfd3dc';

export function pompidou() {
  const kit = new Kit();
  // the glass box, a little in from the frame
  kit.box(2 * HU - 3, H - 1, 2 * HV - 9, GLASS, 0, (H - 1) / 2, 0);
  kit.box(2 * HU - 3, 0.8, 2 * HV - 9, '#9aa4a8', 0, H - 0.6, 0);
  // the frame: the columns down both sides, the beams at each floor, the crosses on the long fronts
  for (const sv of [-1, 1]) {
    const v = sv * (HV - 1);
    for (let k = 0; k <= 13; k++) kit.add(new THREE.CylinderGeometry(0.45, 0.45, H, 6), WHITE, -HU + k * BAY, H / 2, v);
    for (let f = 1; f <= 6; f++) kit.box(2 * HU, 0.6, 0.6, WHITE, 0, f * FLOOR, v);
    for (let k = 0; k < 13; k++) for (let f = 0; f < 6; f++) {
      const u0 = -HU + k * BAY, u1 = u0 + BAY, y0 = f * FLOOR, y1 = y0 + FLOOR;
      kit.rod([u0, y0, v + sv * 0.3], [u1, y1, v + sv * 0.3], 0.12, WHITE, 4).rod([u1, y0, v + sv * 0.3], [u0, y1, v + sv * 0.3], 0.12, WHITE, 4);
    }
  }
  // the ends' columns and beams
  for (const su of [-1, 1]) for (let f = 1; f <= 6; f++) kit.box(0.6, 0.6, 2 * HV, WHITE, su * HU, f * FLOOR, 0);
  // the gerberettes: the brackets at every floor that carry the frame out over the fronts
  for (let k = 0; k <= 13; k++) for (let f = 1; f <= 6; f++) for (const sv of [-1, 1]) kit.box(0.5, 0.5, 4.5, '#d9dcda', -HU + k * BAY, f * FLOOR - 0.6, sv * (HV - 3.2));

  // the escalator on the piazza front: five flights rising from the south end to the north, each
  // its glass tube on its truss, the landings between them
  const front = -HV - 1.2, flights = 5, run = (2 * HU - 24) / flights;
  for (let k = 0; k < flights; k++) {
    const dir = 1, u0 = -HU + 10 + k * run, y0 = 2 + k * FLOOR * 1.12, u1 = u0 + run * dir, y1 = y0 + FLOOR * 1.12;
    const a = [u0, y0, front], b = [u1, y1, front];
    kit.rod(a, b, 1.7, TUBE, 8);
    kit.rod([u0, y0 - 1.9, front], [u1, y1 - 1.9, front], 0.45, RED, 4);
    kit.box(4, 0.6, 3.4, WHITE, u1 + 1.5, y1 - 1.6, front);
  }
  kit.rod([-HU + 4, 0, front - 2], [-HU + 10, 2, front], 1.7, TUBE, 8);

  // the pipes on the back: vertical ducts in their colours, bunched by bays, and the cross ducts
  const back = HV + 1.5, COLOURS = [BLUE, GREEN, BLUE, YELLOW, GREEN, BLUE, RED, BLUE, GREEN, YELLOW, BLUE, GREEN, BLUE];
  for (let k = 0; k < 13; k++) {
    const u = -HU + (k + 0.5) * BAY, hex = COLOURS[k];
    kit.add(new THREE.CylinderGeometry(1.6, 1.6, H + 6, 10), hex, u - 2.6, (H + 6) / 2, back + 0.8);
    kit.add(new THREE.CylinderGeometry(0.9, 0.9, H, 8), COLOURS[(k + 3) % 13], u + 1.6, H / 2, back + 0.4);
    kit.add(new THREE.CylinderGeometry(0.55, 0.55, H, 6), COLOURS[(k + 5) % 13], u + 3.6, H / 2, back);
    if (k % 3 === 0) kit.add(new THREE.CylinderGeometry(1.1, 1.1, BAY * 2.4, 8), hex, u + BAY, FLOOR * (1 + (k % 4)), back + 2.4, 0, 0, Math.PI / 2);
  }
  // the red lift cages and their trusses at the back's corners
  for (const u of [-HU + 4, HU - 4]) kit.box(4, H + 4, 4, RED, u, (H + 4) / 2, back + 1);
  // the air shafts on the roof, white, turned towards the sky
  for (let k = 0; k < 6; k++) {
    const u = -HU + 18 + k * 34, v = k % 2 ? 14 : 22;
    kit.add(new THREE.CylinderGeometry(2.4, 2.4, 7, 12), WHITE, u, H + 3.5, v);
    kit.add(new THREE.TorusGeometry(2.4, 2.4, 8, 12, Math.PI / 2), WHITE, u + 2.4, H + 7, v, Math.PI / 2, 0, Math.PI);
  }
  return kit.mesh(kitMat(0.6, 0.1));
}

export const POMPIDOU = [{
  id: 'centre-pompidou', name: 'Centre Pompidou', x: X, z: Z, turn: TURN, reach: 120,
  area: [onMap(X, Z, TURN, rect(-HU - 3, -HV - 4, HU + 3, HV + 4))],
  foot: [onMap(X, Z, TURN, rect(-HU, -HV - 2.5, HU, HV + 3))],
  make: pompidou,
}];
