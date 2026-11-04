// Phones and tablets: a lighter scene, so they keep a smooth frame rate and stay within their memory.
export const LOW_POWER = matchMedia('(pointer: coarse)').matches;

// How many times finer the hand-drawn textures of Pompeii (its ruins' walls, its paving, its houses'
// paintings) are drawn on a computer than on a phone: the same picture, more pixels to a metre.
export const SHARP = LOW_POWER ? 1 : 2;

// How many of the cars and bikes a full city would have parked along its streets: half, which
// still reads as busy and costs half as much. ?full in the address parks them all, to compare.
export const PARKED = new URLSearchParams(location.search).has('full') ? 1 : 0.5;

// How far a phone sees before the fog closes in, of what a computer sees: less city to draw.
export const SIGHT = LOW_POWER ? 0.7 : 1;
