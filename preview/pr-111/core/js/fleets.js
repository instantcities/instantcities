// The police car, the bus and the tram of each city, in the colours they have there (from photos of
// them on Wikimedia Commons: _data/vehicles.json, tools/vehicles.mjs, shown next to the models on the
// city's models page). Plain data: cars.js and trams.js build the models from it, and
// tools/vehicles.mjs reads FLEETS for which models each city's page shows.

// city id → its police car (POLICE), bus (BUSES) and tram (TRAMS). A city without a tram or a bus
// line in the game has none here. London's bus is the red double-decker (CAR_TYPES.double).
export const FLEETS = {
  ghent: { police: 'be', bus: 'delijn', tram: 'delijn' },
  antwerp: { police: 'be', tram: 'delijn' },
  bruges: { police: 'be' },
  brussels: { police: 'be', tram: 'stib' },
  amsterdam: { police: 'nl', tram: 'gvb' },
  rotterdam: { police: 'nl', tram: 'ret' },
  delft: { police: 'nl', tram: 'htm' },
  utrecht: { police: 'nl' },
  paris: { police: 'fr' },
  avignon: { police: 'fr', tram: 'avignon' },
  london: { police: 'uk', bus: 'double' },
  berlin: { police: 'de', tram: 'bvg' },
  rome: { police: 'it', tram: 'atac' },
  florence: { police: 'it', tram: 'firenze' },
  venice: { police: 'it' },
  pisa: { police: 'it' },
  siena: { police: 'it' },
  salerno: { police: 'it' },
  pompeii: { police: 'it' },
  lecce: { police: 'it', bus: 'lecce' },
  madrid: { police: 'es' },
  barcelona: { police: 'cat' },
  prague: { police: 'cz', tram: 'dpp' },
  vienna: { police: 'at', tram: 'wl' },
  copenhagen: { police: 'dk' },
  istanbul: { police: 'tr', tram: 'istanbul' },
  'new-york': { police: 'nypd' },
  'san-francisco': { police: 'sfpd', tram: 'muni' },
};

// Police cars: an estate, its body (and roof) in a colour, and on its sides
//   bands:  [y0, y1, colour, z0?, z1?]   stripes along it (cut short round the wheel arches)
//   checks: [y0, y1, rows, squares, colour, colour]  a chequered band (Battenburg)
//   slants: [z at the bottom, z at the top, y0, y1, width, colour]  slanting stripes
//   chevrons: [z of the point, y of the point, reach, rise, width, colour]  a < (two slants)
//   word:   [text, z, y, height, colour]  in block letters (cars.js knows A C D E I L N O P S T Y Z)
// Metres along the car from its middle, + towards the nose (2.37); its sides run up to about y 0.95.
const NAVY = 0x1d3a8a;
const chevrons = (z, n, step, colour, rise = 0.27) => Array.from({ length: n }, (_, i) => [z + i * step, 0.66, 0.3, rise, 0.1, colour]);
const slants = (z, n, step, colours, y0 = 0.38, y1 = 0.92, lean = 0.32, w = 0.13) => Array.from({ length: n }, (_, i) => [z + i * step, z + i * step + lean, y0, y1, w, colours[i % colours.length]]);
export const POLICE = {
  // white, dark blue chevrons on the back door edged in light blue, "Police" on the front door
  be: { body: 0xf5f5f5, chevrons: [...chevrons(-1.02, 3, 0.26, NAVY), [-0.24, 0.66, 0.3, 0.27, 0.05, 0x7fb0e0]], word: ['POLICE', 0.55, 0.6, 0.13, NAVY] },
  // white, blue and red-orange stripes slanting across the front door
  nl: { body: 0xf5f5f5, slants: slants(0.05, 4, 0.24, [0x1f3c88, 0xe8461e]), word: ['POLITIE', -0.65, 0.62, 0.11, 0x1f3c88] },
  // white, a navy band low down, blue-white-red at the back
  fr: { body: 0xf5f5f5, bands: [[0.42, 0.6, 0x1d2c6b]], slants: slants(-1.02, 3, 0.13, [0x1d2c6b, 0xf5f5f5, 0xd52b1e], 0.6, 0.95, 0.28, 0.12), word: ['POLICE', 0.35, 0.66, 0.14, 0x1d2c6b] },
  // Battenburg: two rows of blue and fluorescent yellow squares
  uk: { body: 0xf5f5f5, checks: [[0.42, 0.86, 2, 10, 0x1d3f9e, 0xd8f000]] },
  // silver, a broad blue band, POLIZEI in white on it
  de: { body: 0xcfd4d8, bands: [[0.45, 0.86, 0x1f4fa0]], word: ['POLIZEI', 0.3, 0.57, 0.17, 0xf5f5f5] },
  // azure all over, a thin white line low down, POLIZIA in white
  it: { body: 0x2a62b8, bands: [[0.46, 0.5, 0xf5f5f5]], word: ['POLIZIA', -0.1, 0.6, 0.18, 0xf5f5f5] },
  // navy all over, light blue over the front wing, POLICIA in white
  es: { body: 0x1b2d5c, bands: [[0.47, 0.5, 0xf2c400]], slants: slants(1.15, 1, 0, [0x3d82c8], 0.38, 0.9, -0.45, 0.35), word: ['POLICIA', -0.25, 0.62, 0.15, 0xf5f5f5] },
  // Mossos d'Esquadra: white, the roof and a band under the windows navy, red and white squares low down
  cat: { body: 0xf5f5f5, roof: 0x1c2a5a, bands: [[0.84, 0.97, 0x1c2a5a]], checks: [[0.37, 0.47, 1, 18, 0xd32f2f, 0xf5f5f5]] },
  // silver, yellow and blue stripes on the back door, POLICIE in blue
  cz: { body: 0xd2d6d9, bands: [[0.4, 0.48, 0x1f4fa0]], slants: slants(-1.0, 4, 0.2, [0xf2c500, 0x1f4fa0], 0.48, 0.92, 0.3, 0.1), word: ['POLICIE', 0.45, 0.66, 0.13, 0x1f4fa0] },
  // silver, a blue band with a red line over it, POLIZEI in white
  at: { body: 0xcfd3d6, bands: [[0.48, 0.78, 0x1d3f8f], [0.78, 0.85, 0xd52b1e]], word: ['POLIZEI', 0, 0.56, 0.15, 0xf5f5f5] },
  // white, a row of blue blocks, fluorescent yellow on the nose, POLITI in navy
  dk: { body: 0xf5f5f5, checks: [[0.42, 0.72, 1, 9, 0x1d3f9e, 0xf5f5f5]], bands: [[0.42, 0.72, 0xc8e000, 1.95, 2.25]], word: ['POLITI', 0.35, 0.77, 0.12, 0x1d3f9e] },
  // white, blue sweeps at the back, POLIS in blue
  tr: { body: 0xf5f5f5, bands: [[0.4, 0.48, 0x1f5fc0]], chevrons: chevrons(-1.05, 3, 0.22, 0x1f5fc0, 0.22), word: ['POLIS', 0.55, 0.62, 0.15, 0x1f5fc0] },
  // NYPD: white, a blue and a light blue line along it, NYPD in blue
  nypd: { body: 0xf5f5f5, bands: [[0.6, 0.66, 0x1d3f9e], [0.54, 0.6, 0x7fb2e5]], word: ['NYPD', 0.65, 0.73, 0.15, 0x1d3f9e], beacons: ['red', 'blue'] },
  // SFPD: black and white, the doors and the roof white
  sfpd: { body: 0x141414, roof: 0xf5f5f5, bands: [[0.32, 0.95, 0xf5f5f5, -1.05, 1.05]], beacons: ['red', 'blue'] },
};

// City buses, twelve metres long: the body, a band along the lower half (y 0.3 to 1.2 is under the
// windows), the skirt; De Lijn's own yellow panels and LIJN are drawn in cars.js.
export const BUSES = {
  delijn: { body: 0xf4f4f2, skirt: 0x4a4f54, roofBox: 0xe2e2e0, delijn: true },
  // Lecce's SGM: light blue below, white above
  lecce: { body: 0xf2f4f5, windowsFrom: 1.32, skirt: 0x3d6f93, roofBox: 0xe2e6e8, bands: [[0.3, 1.25, 0x6db3dd], [1.25, 1.32, 0x2f7fb8]] },
};

// Trams: five sections, each body (and roof boxes) in a colour, with
//   lower: [y1, colour]  the skirt, from the bottom up to y1 (the windows start at 1.2)
//   bands: [y0, y1, colour] along it, nose: [y1, colour] the cab's front part, from the bottom up
//   windows: the colour of the glass band (dark), doors: the doors' colour
export const TRAMS = {
  delijn: { body: 0xf2f2ee, lower: [0.7, 0xffcc00], lowerFrom: 0.4, doors: 0x5d666d },
  stib: { body: 0xb9bfc5, lower: [0.7, 0x8a8f94], nose: [2.9, 0xc9a24a], doors: 0xc9a24a },
  gvb: { body: 0xf5f6f7, lower: [1.15, 0x1f63c6], bands: [[1.15, 1.22, 0x163a7a]], doors: 0x1f63c6 },
  bvg: { body: 0xf6c700, lower: [0.6, 0x3a3d40], doors: 0xf6c700 },
  wl: { body: 0xf5f5f5, lower: [1.2, 0xc8102e], doors: 0xc8102e },
  dpp: { body: 0xd9dcdf, lower: [0.75, 0xd0202a], bands: [[0.75, 0.82, 0xf5f5f5]], nose: [1.0, 0xd0202a], doors: 0x8f959b },
  atac: { body: 0x8aa088, lower: [0.85, 0x3f5e45], bands: [[0.85, 0.9, 0xe0782a]], doors: 0x6c7e6a },
  firenze: { body: 0xc8ccd0, lower: [0.55, 0x8a8f94], nose: [1.15, 0xc8102e], doors: 0xc8102e },
  istanbul: { body: 0xe4e6e8, lower: [0.6, 0xc8102e], nose: [2.6, 0xc8102e], doors: 0x9aa0a6 },
  ret: { body: 0xc9cdd0, lower: [0.6, 0x55595d], nose: [0.9, 0xd2262e], doors: 0xd2262e },
  htm: { body: 0xf5f5f5, lower: [1.0, 0xd2262e], nose: [1.6, 0xd2262e], doors: 0x9aa0a6 },
  avignon: { body: 0xf5f5f5, lower: [0.55, 0x6a7075], doors: 0x6a7075 },
  muni: { body: 0xc9ccce, lower: [0.6, 0x55595d], bands: [[0.9, 1.1, 0xc8102e]], nose: [1.1, 0xc8102e], doors: 0x8f959b },
};
