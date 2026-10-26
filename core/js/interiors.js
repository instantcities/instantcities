// The buildings you can go into: a city's INSIDE (<city>/inside.js), each a few of its key rooms
// built by hand (the Louvre is not mapped floor by floor: the pyramid's hall, the Grande Galerie and
// the Mona Lisa's room, joined by doorways). They all stand in one row on the same map, far out
// east of the city where nobody sees them from its streets (the annex): a door in the street takes
// you there and the door inside brings you back, with no page to load, and the big map lists them
// to teleport into. Inside, everybody goes on foot, under a roof: always daylight, never rain (the
// look below, put on per player's view in game/indoors.js).
//
// A city's INSIDE: [{
//   id, name (a string, or { <lang>: … }), emoji,
//   make() -> { group, foot (rings to bump into), door: { x, z } (just inside the door out) },
//              in the building's own metres, the door in its south wall: you come in facing +z
//   size: [x0, z0, x1, z1]   the floor the rooms cover, in the same metres
//   door?: { x, z, yaw, name? }  where its door is in the street (game metres, just outside it) and
//              yaw the way out of the building; none when the building lies off the map (the
//              Sistine Chapel, past Rome's west edge): then only the big map takes you in, and
//   out?: { x, z, yaw, name }    is where its door out lets you into the city
//   exhibits?: [{ emoji, x, z, r, text: { <lang>: { name, text } } }]  the cards in its rooms,
//              in its own metres
//   look?: { hemi, sun, fog, horizon }   its light, in place of LIGHT below
//   lookUp?: for a building that is all about its ceiling, how far up the camera looks when you
//              stand still in it (game metres, at 6 m ahead)
// }]
//
// annex(INSIDE, MAP) puts them on the map: the monuments to build, the cards, the doors, and which
// one a spot is in.

// a soft warm light from all round and the day's from above (it throws the shadows: game/indoors.js),
// the dark of the far end of a hall for the fog
export const LIGHT = { hemi: [0xfff2dc, 0xb5a692, 2.1], sun: [0xffe6c0, 0.85], fog: [60, 260], horizon: 0x3a3028 };

const GAP = 2000; // game metres from the city's east edge to the row (past what a camera draws)
const ROW = 320; // and from one building to the next

const area = (x0, z0, x1, z1, x, z) => [x + x0, z + z0, x + x1, z + z0, x + x1, z + z1, x + x0, z + z1];
const shift = (ring, x, z) => ring.map((v, k) => v + (k % 2 ? z : x));

export function annex(INSIDE, MAP) {
  if (!INSIDE?.length) return { monuments: [], sights: [], doors: [], at: () => null, list: [] };
  let x1 = -Infinity, z0 = Infinity;
  for (let k = 0; k < MAP.zone.length; k += 2) { x1 = Math.max(x1, MAP.zone[k]); z0 = Math.min(z0, MAP.zone[k + 1]); }
  const list = INSIDE.map((b, i) => {
    const x = Math.round(x1 + GAP), z = Math.round(z0 + i * ROW);
    let built = null;
    const made = () => (built ??= b.make());
    const [bx0, bz0, bx1, bz1] = b.size;
    const room = {
      ...b, x, z, box: [x + bx0, z + bz0, x + bx1, z + bz1],
      // just inside its door out, facing in; got from the building, which is made for it
      get inside() { const d = made().door; return { x: x + d.x, z: z + d.z + 1.5, yaw: 0 }; },
      get exit() { const d = made().door; return { x: x + d.x, z: z + d.z - 1.2 }; },
      // where you come out in the city: before its door, facing away from it
      get street() { return b.door ?? b.out; },
    };
    room.monument = {
      id: `inside-${b.id}`, name: '', x, z, turn: 0, size: 1,
      reach: Math.hypot(bx1 - bx0, bz1 - bz0) / 2 + 60,
      area: [area(bx0, bz0, bx1, bz1, x, z)],
      get foot() { return made().foot.map(r => shift(r, x, z)); },
      make: () => made().group,
    };
    return room;
  });
  const sights = list.flatMap(b => (b.exhibits ?? []).map((e, k) => ({
    id: `${b.id}-${k}`, emoji: e.emoji, x: b.x + e.x, z: b.z + e.z, r: e.r ?? 8, text: e.text, inside: b,
  })));
  // the ways through: in from the street, and out again from the door inside
  const doors = list.flatMap(b => [
    ...(b.door ? [{ way: 'in', x: b.door.x, z: b.door.z, yaw: b.door.yaw, room: b }] : []),
    { way: 'out', get x() { return b.exit.x; }, get z() { return b.exit.z; }, yaw: Math.PI, room: b },
  ]);
  const at = (x, z) => list.find(b => x > b.box[0] - 4 && x < b.box[2] + 4 && z > b.box[1] - 4 && z < b.box[3] + 4) ?? null;
  return { monuments: list.map(b => b.monument), sights, doors, at, list };
}
