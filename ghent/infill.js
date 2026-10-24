// What the map gets wrong in the old town, put right by hand.
//
// BUILDINGS: a block OpenStreetMap leaves empty, built up again: the one between the Hoogpoort,
//   the Schepenhuisstraat, the Onderstraat and the Belfortstraat, beside the Stadhuis. A row of
//   houses along each of its streets, their fronts on the pavement, and lower back buildings in the
//   courtyard behind them. Game metres, as the map is (1.25 to a real metre).
// HIDDEN: points inside map outlines that are not to be built, because a landmark's model already
//   stands there: the chapels round Sint-Niklaas's east end, which the map has as a brick house
//   reaching into the church. They stay in the list (with gone: true), so the other buildings keep
//   their places in it, and their colours with them.
import { MAP } from './map.js';

const STREETS = [
  { line: [[172, -177], [170, -178], [126, -193]], w: 7.5 }, // Hoogpoort
  { line: [[126, -193], [145, -236], [155, -264], [158, -278], [162, -295], [170, -316]], w: 7.5 }, // Schepenhuisstraat
  { line: [[170, -316], [195, -297], [249, -262], [251, -261]], w: 7.5 }, // Onderstraat
  { line: [[251, -261], [175, -181], [172, -177]], w: 8.1 }, // Belfortstraat
];
const CENTRE = [182, -244];
// the block's outline, along the middle of its streets
const BLOCK = STREETS.flatMap(({ line }) => line.slice(1).flat());
const DEPTH = 14; // how deep a house goes back from the street
const WIDTHS = [8.5, 10, 7.5, 11, 9, 8, 12, 7.5, 9.5]; // the houses' fronts, one after the other
const PAVEMENT = 1.7; // from the street's edge to the fronts

const inside = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};
// how far (x, z) is from the street's middle, less half its width
const offStreet = (x, z) => Math.min(...STREETS.flatMap(({ line, w }) => line.slice(1).map((b, k) => {
  const a = line[k], dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L));
  return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) - w / 2;
})));
const corners = p => p.reduce((out, v, k) => (k % 2 ? out : [...out, [v, p[k + 1]]]), []);
const overlaps = (p, q) => corners(p).some(([x, z]) => inside(x, z, q)) || corners(q).some(([x, z]) => inside(x, z, p));

function block() {
  const out = [];
  const fits = p => corners(p).every(([x, z]) => offStreet(x, z) > PAVEMENT - 0.3) && !out.some(b => overlaps(p, b.p))
    && !MAP.buildings.some(b => Math.abs(b.p[0] - p[0]) < 80 && Math.abs(b.p[1] - p[1]) < 80 && overlaps(p, b.p));
  let n = 0;
  for (const { line, w } of STREETS) {
    for (let k = 0; k + 1 < line.length; k++) {
      const [ax, az] = line[k], [bx, bz] = line[k + 1], L = Math.hypot(bx - ax, bz - az);
      if (L < 6) continue;
      const ux = (bx - ax) / L, uz = (bz - az) / L;
      // the side of the street the block is on
      let nx = -uz, nz = ux;
      if (nx * (CENTRE[0] - ax) + nz * (CENTRE[1] - az) < 0) { nx = -nx; nz = -nz; }
      const front = w / 2 + PAVEMENT;
      for (let s = 0; s < L;) {
        // the next house, narrower where that one does not fit, or a little further on
        const placed = [WIDTHS[n % WIDTHS.length], 7, 5.5].some(wide => {
          if (s + wide > L + 2) return false;
          const fx = ax + ux * s + nx * front, fz = az + uz * s + nz * front;
          const p = [fx, fz, fx + ux * wide, fz + uz * wide, fx + ux * wide + nx * DEPTH, fz + uz * wide + nz * DEPTH, fx + nx * DEPTH, fz + nz * DEPTH].map(v => Math.round(v * 10) / 10);
          if (!fits(p)) return false;
          const cx = fx + ux * wide / 2 + nx * DEPTH / 2, cz = fz + uz * wide / 2 + nz * DEPTH / 2;
          out.push({ p, f: n % 3 ? 3 : 4, r: [Math.round(cx * 10) / 10, Math.round(cz * 10) / 10, Math.round(Math.atan2(uz, ux) * 1000) / 1000, wide, DEPTH], k: 'house' });
          n++;
          s += wide;
          return true;
        });
        if (!placed) s += 1.5;
      }
    }
  }
  // the courtyard: lower back buildings where the houses leave room, a few open yards between
  const yard = [];
  for (let x = 110; x < 260; x += 10) {
    for (let z = -320; z < -175; z += 10) {
      const p = [x, z, x + 9, z, x + 9, z + 9, x, z + 9];
      if (!corners(p).every(([px, pz]) => inside(px, pz, BLOCK) && offStreet(px, pz) > PAVEMENT + DEPTH + 1) || !fits(p)) continue;
      const h = Math.abs((x / 10) * 7 + (z / 10) * 3) % 5;
      if (h === 0) continue; // an open yard
      yard.push({ p, f: h === 3 ? 2 : 1, r: null, k: 'yes' });
    }
  }
  return [...out, ...yard];
}

export const BUILDINGS = block();
export const HIDDEN = [[-26, -92]];
