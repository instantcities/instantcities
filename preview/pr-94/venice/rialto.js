// The Ponte di Rialto (Antonio da Ponte, 1588-91), modelled by hand along the map's flat bridge, in
// game metres (the real ones times 1.25): 48 m long, 22 m wide. The race ends on it, so its streets
// stay the map's and level; what makes it is drawn round them:
//   the outer sides over the Grand Canal, the flat arch's opening with its archivolt and keystone,
//     the parapet climbing to the middle and down again
//   the two rows of shops between the middle street and the outer walks, under their lead roofs
//     stepping up towards the middle, their round-arched openings on both sides
//   the portico at the top, two great arches either way under its pediments, where the cross
//     passage meets the middle street
// The model's own metres: a along the bridge from its middle (towards the Rialto market, north-west
// is negative), b across it, y up.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, archRing, onMap, rect } from '../core/js/arcade.js';

const X = -140.4, Z = -265.1, TURN = -0.69;
const HALF = 31, SIDE = 13.9, SHOP0 = 3.9, SHOP1 = 10.1, PORCH = 3.5;
const STONE = '#ece6d8', STONE2 = '#d9d1bf', LEAD = '#7d8589', DARK = '#3c3632';
const hump = a => 4.6 * Math.max(0, 1 - (a / HALF) ** 2);

export function rialto() {
  const kit = new Kit();
  // the outer sides: their opening over the water, the archivolt round it, the climbing parapet
  for (const sb of [-1, 1]) {
    const p = sb > 0 ? linePath(HALF + 3, SIDE, -HALF - 3, SIDE) : linePath(-HALF - 3, -SIDE, HALF + 3, -SIDE), L = p.length; // its outside to the right
    const top = [], N = 24;
    for (let k = N; k >= 0; k--) { const s = (k / N) * L; top.push([s, 0.9 + hump(s - L / 2)]); }
    const opening = [[3, -3.3], [L - 3, -3.3]];
    for (let k = 0; k <= 16; k++) { const t = (k / 16) * Math.PI; opening.push([L / 2 + (L / 2 - 3) * Math.cos(t), -3.1 + 2.9 * Math.sin(t)]); }
    wall(kit, p, [[0, -3.6], [L, -3.6], ...top], { o0: -0.6, o1: 0, hex: STONE, holes: [opening] });
    const band = [];
    for (let k = 0; k <= 16; k++) { const t = (k / 16) * Math.PI; band.push([L / 2 + (L / 2 - 2.4) * Math.cos(t), -3 + 4 * Math.sin(t)]); }
    for (let k = 16; k >= 0; k--) { const t = (k / 16) * Math.PI; band.push([L / 2 + (L / 2 - 3) * Math.cos(t), -3.1 + 2.9 * Math.sin(t)]); }
    wall(kit, p, band, { o0: 0, o1: 0.3, hex: STONE2 });
    wall(kit, p, [[L / 2 - 0.8, -0.3], [L / 2 + 0.8, -0.3], [L / 2 + 1.1, 1.3], [L / 2 - 1.1, 1.3]], { o0: 0, o1: 0.5, hex: STONE2 }); // the keystone
    // the coping along the parapet, and its balusters
    for (let k = 0; k < N; k++) {
      const s0 = (k / N) * L, s1 = ((k + 1) / N) * L, y0 = 0.9 + hump(s0 - L / 2), y1 = 0.9 + hump(s1 - L / 2);
      const a = p.at(s0), b = p.at(s1);
      kit.rod([a.x - a.tz * 0.3, y0 + 0.1, a.z + a.tx * 0.3], [b.x - b.tz * 0.3, y1 + 0.1, b.z + b.tx * 0.3], 0.35, STONE2, 4);
    }
  }

  // the shops: two rows of three on either half, each under its lead roof, stepping up to the middle
  const shop = (a0, a1, sb) => {
    const am = (a0 + a1) / 2, h = 3.6 + hump(am), bm = sb * (SHOP0 + SHOP1) / 2, d = SHOP1 - SHOP0, w = a1 - a0;
    kit.box(w, h, d, STONE, am, 0.2 + h / 2, bm);
    const roof = new THREE.Shape([new THREE.Vector2(-d / 2 - 0.4, 0), new THREE.Vector2(d / 2 + 0.4, 0), new THREE.Vector2(0, 1.8)]);
    kit.add(new THREE.ExtrudeGeometry(roof, { depth: w + 0.4, bevelEnabled: false }), LEAD, a0 - 0.2, 0.2 + h, bm, 0, Math.PI / 2);
    kit.box(w + 0.3, 0.4, d + 0.3, STONE2, am, 0.2 + h - 0.2, bm);
    for (const face of [sb * SHOP0, sb * SHOP1]) for (const da of [-w / 4, w / 4]) {
      kit.box(2.4, 2.6, 0.2, DARK, am + da, 1.5, face + Math.sign(face - bm) * 0.1);
      kit.add(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 10, 1, false, 0, Math.PI), DARK, am + da, 2.8, face + Math.sign(face - bm) * 0.1, 0, Math.PI / 2, Math.PI / 2);
    }
  };
  const CUTS = [PORCH, 11, 18.5, 26];
  for (const sb of [-1, 1]) for (let k = 0; k < 3; k++) { shop(CUTS[k], CUTS[k + 1], sb); shop(-CUTS[k + 1], -CUTS[k], sb); }

  // the portico at the top: its piers, its arches both ways, the vault over them and the pediments
  const TOP = 0.2 + 3.6 + hump(0) + 1.4;
  for (const sa of [-1, 1]) for (const sb of [-1, 1]) kit.box(PORCH - 1.6, TOP, SHOP1 - SHOP0, STONE, sa * (PORCH + 1.6) / 2, TOP / 2, sb * (SHOP1 + SHOP0) / 2);
  kit.box(2 * PORCH, 2, 2 * SHOP1, STONE, 0, TOP + 1, 0);
  for (const sa of [-1, 1]) {
    const p = sa > 0 ? linePath(PORCH, -SHOP1, PORCH, SHOP1) : linePath(-PORCH, SHOP1, -PORCH, -SHOP1);
    wall(kit, p, [[0, -0.3], [2 * SHOP1, -0.3], [2 * SHOP1, TOP + 2], [0, TOP + 2]], { o0: -0.6, o1: 0, hex: STONE, holes: [archRing(SHOP1, 2 * SHOP0, -0.1, TOP - 0.6, 14)] });
    const ped = new THREE.Shape([new THREE.Vector2(-SHOP1, 0), new THREE.Vector2(SHOP1, 0), new THREE.Vector2(0, 3.6)]);
    kit.add(new THREE.ExtrudeGeometry(ped, { depth: 0.8, bevelEnabled: false }), STONE2, sa * PORCH - (sa > 0 ? 0 : 0.8), TOP + 2, 0, 0, Math.PI / 2);
  }
  for (const sb of [-1, 1]) {
    const p = sb > 0 ? linePath(PORCH, SHOP1, -PORCH, SHOP1) : linePath(-PORCH, -SHOP1, PORCH, -SHOP1);
    wall(kit, p, [[0, -0.3], [2 * PORCH, -0.3], [2 * PORCH, TOP + 2], [0, TOP + 2]], { o0: -0.6, o1: 0, hex: STONE, holes: [archRing(PORCH, 3.1, -0.1, TOP - 1.6, 10)] });
  }
  const roof = new THREE.Shape([new THREE.Vector2(-PORCH - 0.4, 0), new THREE.Vector2(PORCH + 0.4, 0), new THREE.Vector2(0, 3.2)]);
  kit.add(new THREE.ExtrudeGeometry(roof, { depth: 2 * SHOP1, bevelEnabled: false }), LEAD, 0, TOP + 2, -SHOP1);
  return kit.mesh(kitMat(0.88));
}

// a rectangle between two corners given in any order
const box = (a0, b0, a1, b1) => rect(Math.min(a0, a1), Math.min(b0, b1), Math.max(a0, a1), Math.max(b0, b1));
export const RIALTO = [{
  id: 'ponte-di-rialto', name: 'Ponte di Rialto', x: X, z: Z, turn: TURN, reach: 60,
  area: [onMap(X, Z, TURN, rect(-28, -SHOP1 - 0.5, 28, SHOP1 + 0.5))],
  foot: [...[-1, 1].flatMap(sb => [box(PORCH, sb * SHOP0, 26, sb * SHOP1), box(-PORCH, sb * SHOP0, -26, sb * SHOP1)]), // the shops
    ...[-1, 1].flatMap(sa => [-1, 1].map(sb => box(sa * 1.6, sb * SHOP0, sa * PORCH, sb * SHOP1)))].map(r => onMap(X, Z, TURN, r)), // the portico's piers
  make: rialto,
}];
