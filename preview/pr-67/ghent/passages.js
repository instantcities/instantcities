// Passages through a building at street level (OpenStreetMap's tunnel=building_passage), which the
// map draws as one solid block with the path running into its wall. Each is cut out of its
// building: the parts either side of the path stand as before, and over the path a bridge of the
// same building starts a storey up, so you walk or ride through underneath (the path itself is
// already in the map). Hand-written, game metres.
//   from, to: the path through the building, w: how wide the gap is.
// The first part keeps the building's place in the map's list (and so its colours, which go by
// that place); the others go at the end of it.
const PASSAGES = [
  // from the end of the Kastanjestraat into the Pierkespark, under the houses on its corner
  { from: [-1967, -764], to: [-1948, -745], w: 4 },
];
const STOREY = 3.4; // a storey, as the houses have them (core/js/scenery.js FLOOR)

const inside = (x, z, p) => {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
  }
  return c;
};

// the part of outline p where side(x, z) >= 0 (Sutherland-Hodgman, against one line)
function clip(p, side) {
  const out = [];
  for (let i = 0, n = p.length / 2; i < n; i++) {
    const ax = p[i * 2], az = p[i * 2 + 1], bx = p[((i + 1) % n) * 2], bz = p[((i + 1) % n) * 2 + 1];
    const sa = side(ax, az), sb = side(bx, bz);
    if (sa >= 0) out.push(ax, az);
    if ((sa >= 0) !== (sb >= 0)) {
      const t = sa / (sa - sb);
      out.push(Math.round((ax + (bx - ax) * t) * 10) / 10, Math.round((az + (bz - az) * t) * 10) / 10);
    }
  }
  return out.length >= 6 ? out : null;
}

export function withPassages(buildings) {
  const list = [...buildings], extra = [];
  for (const { from: [ax, az], to: [bx, bz], w } of PASSAGES) {
    const mx = (ax + bx) / 2, mz = (az + bz) / 2, L = Math.hypot(bx - ax, bz - az);
    const i = list.findIndex(b => !b.gone && inside(mx, mz, b.p));
    if (i < 0) continue;
    const b = list[i], nx = -(bz - az) / L, nz = (bx - ax) / L;
    const off = (x, z) => (x - ax) * nx + (z - az) * nz; // across the path
    const left = clip(b.p, (x, z) => -off(x, z) - w / 2), right = clip(b.p, (x, z) => off(x, z) - w / 2);
    const over = clip(clip(b.p, (x, z) => w / 2 - off(x, z)) ?? [], (x, z) => off(x, z) + w / 2);
    const part = p => ({ ...b, p, r: null, fe: undefined });
    const parts = [left, right].filter(Boolean).map(part);
    list[i] = parts[0] ?? { ...b, gone: true };
    extra.push(...parts.slice(1));
    // the bridge over it, a storey up, as high as the rest
    if (over) extra.push({ ...part(over), b: STOREY, f: Math.max(1, b.f - 1), k: 'house' });
  }
  return [...list, ...extra];
}
