// The flat layers on the ground (grass, pavements, cobbles, asphalt, squares) lie a millimetre or
// two over one another. Close by that is enough to say which is on top, but a few dozen metres off
// the depth buffer can no longer tell 1 mm apart and two of them flicker where they overlap. So
// each layer is also pushed back in the depth buffer, the lower it lies the further: an offset in
// the buffer's own steps, so it still sorts them out where the millimetres no longer do.
const TOP = 0.1; // above the highest layer, the race track lifted over the street map
const STEPS_PER_MM = 2;

// How high each kind of street lies (the areas between them, grass, sand and the like, are lower,
// in osmGround in js/scenery.js): no two the same, so that where two meet one of them is on top.
// The canals and the river lie well below the streets, as in Ghent (about 2 m: the Leie by the
// Graslei at 6 m above sea level, its quays at 8, measured from the DHMV; game metres are 1.25 real).
// Here, with nothing to import, so a city's own files can read it too (ghent/lowquays.js).
export const WATER = -2.4;
export const WADE = WATER - 0.6; // and a horse wading in them stands on the bottom, up to its belly
export const GROUND = { kerbs: 0.028, foot: 0.03, footSetts: 0.032, footSlabs: 0.033, asphalt: 0.04, bike: 0.0405, setts: 0.041, slabs: 0.042, lines: 0.044, squares: 0.046, wet: 0.05 };

// The material for a layer y metres up, as a copy (the same material may lie at several heights).
export function onGround(material, y) {
  const m = material.clone();
  m.polygonOffset = true;
  m.polygonOffsetFactor = 0;
  m.polygonOffsetUnits = Math.max(0, Math.round((TOP - y) * 1000 * STEPS_PER_MM));
  return m;
}
