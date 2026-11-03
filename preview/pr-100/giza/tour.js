import { game } from './frame.js';
import { SIGHTS } from './sights.js';
export const TOUR = {
  path: [[210, 150, 105], [210, -165, 105], [-700, -165, 105], [-850, 890, 105], [450, 890, 105], [450, 150, 105], [210, 150, 105]].map(([x,z,h]) => [...game(x,z),h]),
  stops: SIGHTS.map(s => ({ emoji: s.emoji, at: [s.x, s.z + 120], look: [s.x, 40, s.z], text: s.text })),
  names: [],
};
