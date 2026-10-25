// How high the ground is under a rider on a real map: the bridges and the streets that climb onto
// them (roads with heights, see js/osmbuild.js), and the squares lying lower than their streets
// (js/hollows.js); everywhere else is flat at 0. A street that passes under a bridge stays low, so a
// rider is only lifted onto a surface it can step up to.
import { HOLLOWS } from './city.js';
import { sunk } from './hollows.js';

const CELL = 12;
const key = (i, j) => (i + 4096) * 8192 + (j + 4096);
export { WATER, WADE } from './ground.js';
export const STEP = 0.7; // how far a rider steps up in one go: more than that is a bridge overhead

// ledges: more surfaces to step onto, each [ax, az, bx, bz, height at a, at b, half its width] (the
// tram platforms, see tramstops.js).
export function buildRelief(map, ledges = []) {
  const cells = new Map();
  const add = s => {
    const half = s[6];
    for (let i = Math.floor((Math.min(s[0], s[2]) - half) / CELL); i <= Math.floor((Math.max(s[0], s[2]) + half) / CELL); i++) {
      for (let j = Math.floor((Math.min(s[1], s[3]) - half) / CELL); j <= Math.floor((Math.max(s[1], s[3]) + half) / CELL); j++) {
        const kk = key(i, j);
        if (!cells.has(kk)) cells.set(kk, []);
        cells.get(kk).push(s);
      }
    }
  };
  for (const s of ledges ?? []) add(s);
  for (const rd of map.roads) {
    if (!rd.y) continue;
    const half = rd.w / 2 + (rd.foot ? 0 : 1.3); // the pavements climb with the street
    for (let k = 0; k + 1 < rd.y.length; k++) {
      const s = [rd.p[2 * k], rd.p[2 * k + 1], rd.p[2 * k + 2], rd.p[2 * k + 3], rd.y[k], rd.y[k + 1], half];
      if (s[4] < 0.01 && s[5] < 0.01) continue;
      add(s);
    }
  }
  if (!cells.size && !HOLLOWS.length) return null;
  return {
    // the highest surface at (x, z) no more than STEP above `from` (Infinity: the highest of all)
    at(x, z, from = Infinity) {
      let h = sunk(x, z);
      for (const [ax, az, bx, bz, ha, hb, half] of cells.get(key(Math.floor(x / CELL), Math.floor(z / CELL))) ?? []) {
        const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
        if (Math.hypot(x - ax - t * dx, z - az - t * dz) > half) continue;
        const y = ha + (hb - ha) * t;
        if (y > h && y <= from + STEP) h = y;
      }
      return h;
    },
  };
}
