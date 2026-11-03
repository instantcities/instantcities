// The stepping stones across Pompeii's streets: three blocks of lava in a row across the street, with
// room between them for a cart's wheels, so people could cross when the street ran with rainwater
// and what the town threw out. One every 80 m or so along the race route, which is the middle of the
// town's main streets. In game metres, on the route in map.js. Visual only: riders ride over them.
import { Kit, kitMat } from '../core/js/kit.js';
import { MAP } from './map.js';
import { THEME } from './appearance.js';

export function stones() {
  const kit = new Kit(), r = MAP.routes[0].route, top = THEME.raised;
  let walked = 40;
  for (let i = 1; i < r.length; i++) {
    const [x0, z0] = r[i - 1], [x1, z1] = r[i], d = Math.hypot(x1 - x0, z1 - z0);
    walked += d;
    if (walked < 80 || d < 1) continue;
    walked = 0;
    const ux = (x1 - x0) / d, uz = (z1 - z0) / d, yaw = Math.atan2(-uz, ux);
    for (const o of [-2.6, 0, 2.6]) {
      const x = x1 - uz * o, z = z1 + ux * o;
      // as high as the pavements either side (THEME.raised), so one steps across level
      kit.box(1.5, top - 0.02, 1.9, '#4e4c48', x, (top - 0.12) / 2, z, 0, yaw, 0);
      kit.box(1.4, 0.1, 1.8, '#5f5c57', x, top - 0.05, z, 0, yaw, 0);
    }
  }
  return kit.mesh(kitMat(0.95));
}

export const STONES = [{ id: 'stepping-stones', name: 'Stepping stones', x: 0, z: 0, turn: 0, reach: 220, make: stones }];
