// Shared placement and timing for Artevelde's statue and its tour scene. No rendering imports,
// so the tour route remains usable by tools/tourcheck.mjs without browser dependencies.
export const STATUE = { x: 158, z: -506, turn: 0.6 };
export const FRONT = 5.2;
export const STATUE_FOOT = [STATUE.x + Math.sin(STATUE.turn) * FRONT, STATUE.z + Math.cos(STATUE.turn) * FRONT];
export const CLIMB_TIME = 4.7;
