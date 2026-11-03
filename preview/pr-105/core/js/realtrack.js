// A race track along real streets, from a map made by js/osmbuild.js: the look all real
// neighbourhoods share, and items and obstacles placed to suit the map's one-way stretches.

export const OSM_THEME = {
  pavement: 1.6, lift: 0.06, lampEvery: 30, menuCam: [24, 26], camBack: 7.5,
  sky: 0x4a95dd, horizon: 0xd8e6ef, fog: [130, 520],
  hemi: [0xe8f1ff, 0x8a8478, 1.4],
  sun: { color: 0xfff1dc, intensity: 2.5, pos: [-90, 150, 70] },
  shadow: [110, 90],
  ground: '#6f9a52', dirt: '#55585e', // the ground between the streets is back gardens
  // pavements and squares in grey concrete and stone, as in Ghent, not beige
  verge: 0xa9abad, paving: '#a9abad', kerb: 0xc4c6c8,
  clouds: 0x9aa9b8, dust: 0xb5b0a6,
};

const PICKUPS = [0.15, 0.34, 0.6, 0.82];
const BARRIERS = [0.07, 0.42, 0.9];

// Stretches of the loop that are two-way, as [from, to] fractions of a lap.
function twoWay(oneway) {
  const runs = [], n = oneway.length;
  let start = null;
  for (let i = 0; i <= n; i++) {
    const two = i < n && !oneway[i];
    if (two && start == null) start = i;
    else if (!two && start != null) { runs.push([start / n, i / n]); start = null; }
  }
  return runs;
}

// Barriers across the whole street anywhere; a lone parked car or planters only where the street is
// two-way, since along one-way stretches the cars already line both kerbs. No car in a car-free street.
export function placeObstacles(map, hw) {
  const obstacles = BARRIERS.map(at => ({ at, type: 'barrier' }));
  const taken = [...BARRIERS, ...PICKUPS];
  const lone = [{ type: 'car', lat: [hw * 0.49, hw * 0.96] }, { type: 'planters', lat: [-hw * 0.98, -hw * 0.31] }];
  for (const [a, b] of twoWay(map.oneway ?? [])) {
    for (let at = Math.max(a + 0.03, 0.14); at < b - 0.03 && lone.length; at += 0.01) {
      if (taken.some(f => Math.abs(f - at) < 0.06)) continue;
      const k = lone.findIndex(o => o.type !== 'car' || !map.free?.[Math.floor(at * map.free.length)]);
      if (k < 0) continue;
      obstacles.push({ at: Math.round(at * 100) / 100, ...lone.splice(k, 1)[0] });
      taken.push(at);
    }
  }
  return obstacles.sort((x, y) => x.at - y.at);
}

// A full track definition. name and blurb: { nl, en, fr, es }. A map whose route is open runs from
// one end to the other: one go from start to finish, no laps.
export function realTrack({ id, name, blurb, map, seed = 9100, theme = {}, ...rest }) {
  const hw = rest.hw ?? 4.5;
  return {
    id, name, blurb,
    level: 'tricky',
    hw,
    pace: 0.78, // narrow streets with tight corners: a canter, not a gallop
    bikers: 3, // cyclists pedalling along the route
    seed,
    map,
    control: map.route,
    open: !!map.open,
    theme: { ...OSM_THEME, ...theme },
    pickups: PICKUPS,
    obstacles: placeObstacles(map, hw),
    ...rest,
  };
}
