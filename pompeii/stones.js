// The stepping stones across Pompeii's streets: three blocks of lava in a row across the street, with
// room between them for a cart's wheels, so people could cross when the street ran with rainwater
// and what the town threw out. One every 80 m or so along the race route, which is the middle of the
// town's main streets. In game metres, on the route in map.js. Visual only: riders ride over them.
import { Kit, kitMat } from '../core/js/kit.js';
import { MAP } from './map.js';

export function stones() {
  const kit = new Kit(), r = MAP.routes[0].route;
  let walked = 40;
  for (let i = 1; i < r.length; i++) {
    const [x0, z0] = r[i - 1], [x1, z1] = r[i], d = Math.hypot(x1 - x0, z1 - z0);
    walked += d;
    if (walked < 80 || d < 1) continue;
    walked = 0;
    const ux = (x1 - x0) / d, uz = (z1 - z0) / d, yaw = Math.atan2(-uz, ux);
    for (const o of [-2.6, 0, 2.6]) {
      const x = x1 - uz * o, z = z1 + ux * o;
      kit.box(1.5, 0.7, 1.9, '#55524c', x, 0.2, z, 0, yaw, 0);
      kit.box(1.55, 0.12, 1.95, '#6e6b64', x, 0.58, z, 0, yaw, 0);
    }
  }
  return kit.mesh(kitMat(0.95));
}

export const STONES = [{ id: 'stepping-stones', name: 'Stepping stones', x: 0, z: 0, turn: 0, reach: 220, make: stones }];
