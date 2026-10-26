// The Pantheon (Hadrian's, about AD 125), modelled by hand in place of the map's stack of building
// parts, from its measurements and photos, in game metres (the real ones times 1.25), on the map's
// outline of it: the round drum and the porch in front of it, its axis turned from north a little
// towards the east.
//   the porch: sixteen Corinthian columns, eight of grey granite across the front and two rows of
//     four of pink granite behind the outer ones, their white marble bases and capitals; over them
//     the entablature with M·AGRIPPA·L·F·COS·TERTIVM·FECIT on the frieze, the pediment, its tympanum
//     empty since the bronze eagle went, and the roof of lead sloping back to
//   the block between the porch and the drum, of brick with a second pediment higher up, its
//     bronze doors and the two big niches either side of them under the porch
//   the drum, brick, in three bands under its cornices, and over it the dome: the seven step-rings
//     round its foot, the lead-covered cap, and the oculus open at the top
// Riders bump into the drum, the block and the columns, and can ride in between the columns under
// the porch, up to the doors (the way in, rome/inside.js).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, onMap, rect } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = -160.2, Z = 36.8, TURN = 0.0614; // the drum's middle, and the axis turned from north
const R = 34.8, DRUM = 37.5, OCULUS = 5.6, TOP = 54.5; // the drum's radius and height, the oculus, the dome's top
const FRONT = -58.2, ROWS = [-58.2, -53, -47.8], BLOCK = [-40.3, -22], BW = 23.2; // the porch's rows, the block, its half width
const COLS = [-21.15, -15.1, -9.05, -3.02, 3.02, 9.05, 15.1, 21.15];
const FLOOR = 0.35, CAP = FLOOR + 17.7, ENT = CAP + 3.8, APEX = ENT + 7.2; // the porch's floor, the capitals' top, the entablature, the pediment
const BRICK = '#b19a82', BRICK2 = '#a68e77', MARBLE = '#e6e0d1', MARBLE2 = '#d8d0bd', GRANITE = '#8d8a85', PINK = '#a68b80', LEAD = '#8b8f8e', BRONZE = '#4f4232';

// a solid of revolution round the drum's axis: its profile [[r, y], ...] from the bottom up
const lathe = (kit, pts, hex, n = 64) => kit.add(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n), hex);

export function pantheon() {
  const kit = new Kit();

  // the drum in its three bands, a cornice over each, the step-rings and the cap of the dome
  lathe(kit, [[R, 0], [R, 15]], BRICK);
  lathe(kit, [[R, 15], [R + 0.6, 15.2], [R + 0.6, 15.9], [R, 16.1]], MARBLE2);
  lathe(kit, [[R, 16.1], [R, 30]], BRICK2);
  lathe(kit, [[R, 30], [R + 0.7, 30.2], [R + 0.7, 31], [R, 31.2]], MARBLE2);
  lathe(kit, [[R, 31.2], [R - 0.3, 31.2], [R - 0.3, DRUM - 1.1], [R + 0.5, DRUM - 0.7], [R + 0.5, DRUM]], BRICK);
  const steps = [[R + 0.5, DRUM]];
  for (let k = 0; k < 7; k++) {
    const r = R - 0.6 - k * 1.25, y = DRUM + 0.9 + k * 0.95;
    steps.push([r + 0.6, steps.at(-1)[1]], [r + 0.6, y], [r, y]);
  }
  lathe(kit, steps, shade(MARBLE2, -0.12));
  // the cap: a shallow dome from the last step to the oculus, and its rim
  const r0 = steps.at(-1)[0] - 0.6, y0 = steps.at(-1)[1], cap = [[r0 + 0.6, y0]];
  for (let k = 0; k <= 10; k++) {
    const t = k / 10, r = r0 + (OCULUS - r0) * t;
    cap.push([r, y0 + (TOP - y0) * Math.sin((t * Math.PI) / 2)]);
  }
  cap.push([OCULUS, TOP + 0.5], [OCULUS - 0.6, TOP + 0.5], [OCULUS - 0.6, TOP - 3]);
  lathe(kit, cap, LEAD);
  // the dark of the rotunda seen down through the oculus
  kit.add(new THREE.CircleGeometry(OCULUS - 0.5, 24).rotateX(-Math.PI / 2), '#3d3830', 0, TOP - 3, 0);

  // the block between the porch and the drum, with its second pediment
  kit.box(BW * 2, 31, BLOCK[1] - BLOCK[0], BRICK, 0, 15.5, (BLOCK[0] + BLOCK[1]) / 2);
  kit.box(BW * 2 + 1.2, 1.1, BLOCK[1] - BLOCK[0] + 1.2, MARBLE2, 0, 31.2, (BLOCK[0] + BLOCK[1]) / 2 - 0.6);
  pediment(kit, BLOCK[0] - 0.3, 31.7, 37.6, BW + 0.6, BRICK2, 6);
  // its front under the porch: the marble facing, the doors and the two niches
  const face = BLOCK[0] - 0.15;
  kit.box(BW * 2, ENT - FLOOR, 0.3, MARBLE, 0, (ENT + FLOOR) / 2, face);
  kit.box(7.8, 12.4, 0.5, MARBLE2, 0, FLOOR + 6.2, face - 0.3);
  kit.box(6.2, 10.6, 0.5, BRONZE, 0, FLOOR + 5.3, face - 0.5);
  kit.box(0.25, 10.6, 0.55, shade(BRONZE, 0.15), 0, FLOOR + 5.3, face - 0.55);
  for (const u of [-10.6, 10.6]) {
    kit.box(5, 11, 0.4, '#8a8172', u, FLOOR + 6.5, face - 0.1);
    kit.box(5.8, 0.5, 0.7, MARBLE2, u, FLOOR + 1, face - 0.35);
  }

  // the porch: its floor, the columns, the entablature and the pediment, the roof back to the block
  kit.box(BW * 2 + 1, FLOOR, BLOCK[0] - FRONT + 3, MARBLE2, 0, FLOOR / 2, (FRONT + BLOCK[0]) / 2 - 1.5);
  for (const [k, v] of ROWS.entries()) {
    // the shafts, each of one piece of granite, on their white bases under their white capitals
    for (const u of k ? [-21.15, -15.1, 15.1, 21.15] : COLS) {
      kit.add(new THREE.CylinderGeometry(0.82, 0.95, CAP - FLOOR - 2.6, 12), k ? PINK : GRANITE, u, (FLOOR + 0.7 + CAP - 1.9) / 2, v);
      kit.add(new THREE.CylinderGeometry(1.3, 1.4, 0.8, 12), MARBLE, u, FLOOR + 0.4, v);
      kit.add(new THREE.CylinderGeometry(1.5, 0.95, 1.9, 12), MARBLE, u, CAP - 0.95, v);
      kit.box(2.9, 0.45, 2.9, MARBLE, u, CAP + 0.2, v);
    }
  }
  const depth = BLOCK[0] - FRONT + 2.2, mid = (FRONT - 1.4 + BLOCK[0]) / 2;
  kit.box(BW * 2 - 0.4, 1.4, depth, MARBLE, 0, CAP + 0.7, mid); // the architrave
  kit.box(BW * 2 - 0.4, 1.4, depth, MARBLE2, 0, CAP + 2.1, mid); // the frieze
  kit.box(BW * 2 + 0.6, 1, depth + 1, MARBLE, 0, ENT - 0.5, mid - 0.5); // the cornice
  // the inscription's letters, once bronze, along the front of the frieze
  const words = 'M·AGRIPPA·L·F·COS·TERTIVM·FECIT', step = 1.28, u0 = -((words.length - 1) * step) / 2;
  [...words].forEach((ch, i) => {
    if (ch === '·') kit.box(0.22, 0.22, 0.1, '#5d5446', u0 + i * step, CAP + 2.1, FRONT - 1.43);
    else kit.box(0.7, 1, 0.1, '#5d5446', u0 + i * step, CAP + 2.1, FRONT - 1.43);
  });
  pediment(kit, FRONT - 1.4, ENT, APEX, BW + 0.3, MARBLE, depth);
  // the roof: two slopes of lead from the pediment's ridge back to the block
  const slope = Math.atan2(APEX - ENT, BW + 0.3), run = Math.hypot(APEX - ENT, BW + 0.3);
  for (const side of [-1, 1]) {
    kit.box(run + 0.6, 0.4, depth - 0.8, LEAD, (side * (BW + 0.3)) / 2, (ENT + APEX) / 2 + 0.45, mid + 0.4, 0, 0, -side * slope);
  }
  return kit.mesh(kitMat(0.9));
}

// a pediment across the front at v (its face), from its foot at y0 to its apex at y1, hw wide either
// side of the axis, d deep: the tympanum, the cornices along its foot and up its two slopes
function pediment(kit, v, y0, y1, hw, hex, d) {
  const path = linePath(-hw, v, hw, v), s = u => u + hw;
  // the tympanum, set back a little behind the cornices (o is out in front of the face, to -v)
  wall(kit, path, [[s(-hw), y0], [s(hw), y0], [s(0), y1]], { o0: -d, o1: -0.4, hex: shade(hex, -0.06) });
  kit.box(2 * hw, 0.8, 1.4, hex, 0, y0 + 0.4, v - 0.2);
  const slope = Math.atan2(y1 - y0, hw), run = Math.hypot(y1 - y0, hw);
  for (const side of [-1, 1]) kit.box(run + 0.8, 0.9, 1.6, hex, (side * hw) / 2, (y0 + y1) / 2 + 0.2, v - 0.1, 0, 0, -side * slope);
}

// its outline on the map: the drum as a ring, and the porch and the block
const circle = (r, n = 40) => Array.from({ length: n }, (_, k) => [r * Math.cos((k / n) * 2 * Math.PI), r * Math.sin((k / n) * 2 * Math.PI)]);
const column_ = (u, v) => onMap(X, Z, TURN, rect(u - 1.1, v - 1.1, u + 1.1, v + 1.1));

// It stands in for the map's parts of it (area): riders bump into the drum and the block (foot) and
// into the columns, between which they ride in under the porch.
export const PANTHEON = [{
  id: 'pantheon', name: 'Pantheon', x: X, z: Z, turn: TURN, reach: 90,
  area: [onMap(X, Z, TURN, circle(R + 10)), onMap(X, Z, TURN, rect(-BW - 2.5, FRONT - 4, BW + 2.5, BLOCK[1]))],
  foot: [onMap(X, Z, TURN, circle(R)), onMap(X, Z, TURN, rect(-BW, BLOCK[0], BW, BLOCK[1] + 2)),
    ...COLS.map(u => column_(u, ROWS[0])), ...ROWS.slice(1).flatMap(v => [-21.15, -15.1, 15.1, 21.15].map(u => column_(u, v)))],
  make: pantheon,
}];
