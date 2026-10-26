// Westminster Bridge (Thomas Page, 1862) over the Thames beside the Elizabeth Tower, modelled by
// hand along the map's deck (which stays, with its streets and railings), from its measurements
// and photos, in game metres (the real ones times 1.25): 308 m from bank to bank and 29 m wide.
// Painted green, the colour of the benches in the House of Commons:
//   on both faces the seven shallow elliptical arches of cast iron, the spandrels over them and
//     the band along the deck's edge, and the ribs of the arches underneath
//   the six granite piers with their pointed cutwaters, and the abutments at the banks
//   the Gothic parapet of cast iron along both edges
//   the lamp standards on the parapet over the piers and at the ends, three lanterns on each
// The river lies only 2.6 m under the deck in the game, so the arches are as flat as that leaves
// them. Riders ride over it on the map's deck, as before.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing, onMap, rect } from '../core/js/arcade.js';

const X = 279, Z = 455.8, TURN = -0.0509; // the middle of the river, the bridge running along +x
const W = 0, E = 1, ENDS = [-151, 157], HALF = 14.65, PIER = 5.5;
const DECK = 0.25, CROWN = -1.05, WATER = -2.6;
const GREEN = '#355e46', GREEN2 = '#4a7a5c', GRANITE = '#9a978f', GRANITE2 = '#86837c', GLASS = '#f2e7c0';

// the piers' and the spans' ends along the bridge: seven spans, wider towards the middle
const SPANS = (() => {
  const share = [0.86, 0.94, 1, 1.04, 1, 0.94, 0.86], sum = share.reduce((a, b) => a + b, 0);
  const unit = (ENDS[E] - ENDS[W] - 6 * PIER) / sum, out = [];
  let u = ENDS[W];
  for (const f of share) { out.push([u, u + f * unit]); u += f * unit + PIER; }
  return out;
})();

// a face of the bridge from the west end to the east, its arches cut in from below: the outline
// in (s, y) along a path from ENDS[W]
function face() {
  const ring = [[0, DECK], [ENDS[E] - ENDS[W], DECK]];
  for (const [a, b] of SPANS.slice().reverse()) {
    const s0 = a - ENDS[W], s1 = b - ENDS[W];
    ring.push([s1, WATER]);
    for (let k = 1; k < 16; k++) {
      const t = 1 - (2 * k) / 16; // from +1 (the east end of the span) to -1
      ring.push([(s0 + s1) / 2 + (t * (s1 - s0)) / 2, WATER + (CROWN - WATER) * Math.sqrt(1 - t * t)]);
    }
    ring.push([s0, WATER]);
  }
  return ring;
}

export function westminsterBridge() {
  const kit = new Kit();
  const ring = face(), L = ENDS[E] - ENDS[W];
  for (const v of [-HALF - 0.05, -7, 0, 7, HALF + 0.45]) { // each wall stands to the north of its line
    const outer = Math.abs(v) > 10;
    wall(kit, linePath(ENDS[W], v, ENDS[E], v), ring, { o0: 0, o1: outer ? 0.4 : 0.3, hex: GREEN });
  }
  // the band along the deck's edge, and the moulding along the arches
  for (const s of [-1, 1]) {
    kit.box(L, 0.35, 0.3, GREEN2, (ENDS[W] + ENDS[E]) / 2, DECK - 0.45, s * (HALF + 0.55));
    kit.box(L, 0.15, 0.25, GREEN2, (ENDS[W] + ENDS[E]) / 2, CROWN + 0.1, s * (HALF + 0.5));
  }
  // the piers, their cutwaters, and the abutments
  for (let k = 0; k + 1 < SPANS.length; k++) {
    const u = SPANS[k][1] + PIER / 2;
    kit.box(PIER, DECK - WATER - 0.5, 2 * HALF + 1.2, GRANITE, u, (WATER + DECK - 0.5) / 2, 0);
    for (const s of [-1, 1]) {
      kit.box(PIER / Math.SQRT2, DECK - WATER - 0.2, PIER / Math.SQRT2, GRANITE2, u, (WATER + DECK - 0.2) / 2, s * (HALF + 0.6), 0, Math.PI / 4);
      kit.add(new THREE.ConeGeometry(PIER / 2, 0.9, 4).rotateY(Math.PI / 4), GRANITE, u, DECK + 0.45, s * (HALF + 0.6));
    }
  }
  for (const u of ENDS) kit.box(4, DECK - WATER, 2 * HALF + 2, GRANITE, u + (u < 0 ? -1.5 : 1.5), (WATER + DECK) / 2, 0);
  // the Gothic parapet along both edges: pointed openings between little posts
  for (const s of [-1, 1]) {
    const path = s < 0 ? linePath(ENDS[W], -HALF - 0.45, ENDS[E], -HALF - 0.45) : linePath(ENDS[E], HALF + 0.45, ENDS[W], HALF + 0.45);
    const n = Math.round(L / 1.25), step = L / n, holes = [];
    for (let k = 0; k < n; k++) holes.push(pointedRing(step * (k + 0.5), step - 0.35, DECK + 0.25, DECK + 1.05, 1, 4));
    wall(kit, path, [[0, DECK], [L, DECK], [L, DECK + 1.3], [0, DECK + 1.3]], { holes, o0: 0, o1: 0.22, hex: GREEN });
    kit.box(L, 0.12, 0.4, GREEN2, (ENDS[W] + ENDS[E]) / 2, DECK + 1.36, s * (HALF + 0.56));
  }
  // the lamp standards: over every pier and at both ends, on both sides
  const lamps = [ENDS[W] + 1, ...SPANS.slice(0, -1).map(([, b]) => b + PIER / 2), ENDS[E] - 1];
  for (const u of lamps) {
    for (const s of [-1, 1]) {
      const v = s * (HALF + 0.55), top = DECK + 6.2;
      kit.box(0.9, 1.6, 0.9, GREEN, u, DECK + 0.8, v);
      kit.add(new THREE.CylinderGeometry(0.16, 0.24, 4.4, 8), GREEN, u, DECK + 3.8, v);
      kit.box(2.2, 0.12, 0.12, GREEN, u, top - 0.4, v);
      for (const du of [-1.05, 0, 1.05]) {
        const y = du ? top - 0.15 : top + 0.35;
        kit.add(new THREE.CylinderGeometry(0.24, 0.16, 0.6, 6), GLASS, u + du, y, v);
        kit.add(new THREE.ConeGeometry(0.3, 0.32, 6), GREEN, u + du, y + 0.45, v);
      }
    }
  }
  return kit.mesh(kitMat(0.6, 0.15));
}

export const WESTMINSTER_BRIDGE = [{
  id: 'westminster-bridge', name: 'Westminster Bridge', x: X, z: Z, turn: TURN, reach: 260,
  area: [onMap(X, Z, TURN, rect(ENDS[W], -HALF - 1, ENDS[E], HALF + 1))],
  foot: SPANS.slice(0, -1).flatMap(([, b]) => [-1, 1].map(s => onMap(X, Z, TURN, rect(b, s > 0 ? HALF + 0.4 : -HALF - 3, b + PIER, s > 0 ? HALF + 3 : -HALF - 0.4)))),
  make: westminsterBridge,
}];
