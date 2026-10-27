import { game } from './frame.js';
import { SIGHTS } from './sights.js';
export const TOUR = {
  path: [[0, 65, 38], [-55, 45, 38], [-65, -30, 38], [-20, -65, 38], [55, -45, 38], [65, 30, 38], [0, 65, 38]].map(([x,z,h]) => [...game(x,z),h]),
  stops: SIGHTS.map(s => ({ emoji: s.emoji, at: [s.x, s.z + 40], look: [s.x, 8, s.z], text: s.text })),
  names: [],
};
