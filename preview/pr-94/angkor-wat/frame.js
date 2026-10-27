// Where things are. The map is centred on its race route (see tools/osmbuild.mjs) and scaled up
// 1.25 from real metres to game metres; OpenStreetMap's own metres here are east and south of the
// map's origin in area.json (the temple's middle, near enough). `game` turns the one into the other.
// If the route in area.json changes how far it reaches, the centre below moves with it.
export const S = 1.25; // game metres per real metre
export const CENTRE = [-310, -64.5]; // the middle of the route's box: x from -780 to 150, z from -125 to -4
export const game = (x, z) => [Math.round((x - CENTRE[0]) * S * 10) / 10, Math.round((z - CENTRE[1]) * S * 10) / 10];
