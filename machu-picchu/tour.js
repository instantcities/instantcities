import { game } from './frame.js';
import { SIGHTS } from './sights.js';
export const TOUR = {
  path: [[70, 140, 38], [70, -150, 38], [0, -185, 38], [-70, -110, 38], [-70, 140, 38], [70, 140, 38]].map(([x,z,h]) => [...game(x,z),h]),
  stops: SIGHTS.map(s => ({ emoji: s.emoji, at: [s.x, s.z + 40], look: [s.x, 8, s.z], text: s.text })),
  names: [],
};
