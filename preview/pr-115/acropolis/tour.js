import { game } from './frame.js';
import { SIGHTS } from './sights.js';
export const TOUR = {
  path: [[-180, 10, 38], [-175, 65, 38], [85, 65, 38], [105, -90, 38], [-80, -90, 38], [-180, 10, 38]].map(([x,z,h]) => [...game(x,z),h]),
  stops: SIGHTS.map(s => ({ emoji: s.emoji, at: [s.x, s.z + 40], look: [s.x, 8, s.z], text: s.text })),
  names: [],
};
