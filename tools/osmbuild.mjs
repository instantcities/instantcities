// Turn a part of a city from OpenStreetMap into a map for the game (<city>/map.js), for
// tools/osm_map.mjs. The map keeps the real street layout, scaled up a little so the streets are
// wide enough to race in. Each race route is a list of street names in riding order; the loop
// closes on the first, unless the route is open: then it runs from one end to the other.
// Map data © OpenStreetMap contributors, available under the ODbL.

export const ROAD_WIDTH = { // real metres of asphalt
  primary: 12, secondary: 10, tertiary: 9, residential: 6.5, living_street: 6,
  unclassified: 6, service: 4, pedestrian: 6, footway: 2.5, path: 2.5, cycleway: 2.5,
  primary_link: 7, secondary_link: 7, steps: 2,
};
const PAVED_FOOT = new Set(['pedestrian', 'footway', 'path', 'cycleway', 'steps']);
const GREEN = {
  leisure: new Set(['park', 'garden', 'nature_reserve', 'dog_park', 'common']),
  landuse: new Set(['grass', 'village_green', 'meadow', 'forest', 'recreation_ground', 'cemetery']),
  natural: new Set(['wood', 'scrub', 'grassland', 'wetland', 'heath']),
};
const WOODED = [['landuse', 'forest'], ['natural', 'wood'], ['natural', 'scrub']];
const SHEDS = new Set(['garage', 'garages', 'shed', 'roof', 'carport', 'hut']);
// OpenStreetMap shop and amenity types -> the kind of shop front the game draws ('shop' for the rest)
export const SHOP_KINDS = {
  restaurant: 'restaurant', cafe: 'cafe', pub: 'cafe', bar: 'cafe', biergarten: 'cafe',
  fast_food: 'snack', ice_cream: 'snack', bakery: 'bakery', pastry: 'bakery', confectionery: 'bakery',
  pharmacy: 'pharmacy', chemist: 'pharmacy', hairdresser: 'hair', beauty: 'hair',
  convenience: 'grocer', supermarket: 'grocer', greengrocer: 'grocer', butcher: 'grocer', kiosk: 'grocer', deli: 'grocer',
  florist: 'florist', books: 'books', clothes: 'clothes', shoes: 'clothes',
};
const ONEWAY = new Set(['yes', '1', '-1']);
// Closed to cars: a pedestrian street, or one where cars may not go (Ghent tags its car-free centre
// vehicle=private, permit holders only). The most specific of the access tags counts. extra: the
// area's car_free street names, for the streets OSM doesn't tag that way.
const NO_CARS = new Set(['no', 'private', 'permit', 'delivery']);
const carFree = (t, extra = []) => PAVED_FOOT.has(t.highway) || NO_CARS.has(t.motorcar ?? t.motor_vehicle ?? t.vehicle ?? t.access) || extra.includes(t.name);
// streets laid in cobbles (kasseien), drawn as such
const SETT = new Set(['sett', 'cobblestone', 'unhewn_cobblestone', 'cobblestone:flattened', 'pebblestone', 'sett;asphalt']);
// big flat stone slabs, as in the lanes of southern old towns (Lecce's chianche): road.c = 2
const SLABS = new Set(['paving_stones', 'paving_stones:30', 'stone', 'flagstone']);
// old houses, which get a stepped gable (trapgevel) facing the street
const OLD_STYLE = /gothic|renaissance|baroque|brabant|medieval|romanesque/;
const OLD_KINDS = new Set(['yes', 'house', 'residential', 'terrace', 'apartments', 'detached', 'semidetached_house', 'commercial', 'retail']);
const colour = c => (/^#[0-9a-f]{6}$/i.test(c ?? '') ? c.toLowerCase() : null);
const MIN_LEG = 25; // real metres each route street is ridden for, at least

export const DEFAULTS = {
  scale: 1.25, // real metres -> game metres
  hw: 4.5, // half width of the raced street in game metres
  corner: 11, // radius the route's street corners are rounded to
  zone_margin: 35, // real metres beyond the zone roads, so the far side of them is built too
  margin: 160, // without zone roads: real metres of neighbourhood kept around the route
};

// A friendly error: `code` picks the message, `streets` says which streets it is about.
export class MapError extends Error {
  constructor(code, streets = []) {
    super(`${code}: ${streets.join(', ')}`);
    this.code = code;
    this.streets = streets;
  }
}

// ------------------------------------------------------------------ geometry helpers

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function hull(points) {
  const seen = new Set(), pts = [];
  for (const p of points) {
    const k = p[0] + ',' + p[1];
    if (!seen.has(k)) { seen.add(k); pts.push(p); }
  }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

function inside([x, y], poly) {
  let hit = false;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length];
    if ((ay > y) !== (by > y) && x < ax + ((y - ay) * (bx - ax)) / (by - ay)) hit = !hit;
  }
  return hit;
}

function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1e-12;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function polyDist(p, poly) {
  let m = Infinity;
  for (let i = 0; i < poly.length; i++) m = Math.min(m, segDist(p, poly[i], poly[(i + 1) % poly.length]));
  return m;
}

function polyArea(poly) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(s) / 2;
}

function centroid(poly) {
  let x = 0, y = 0;
  for (const p of poly) { x += p[0]; y += p[1]; }
  return [x / poly.length, y / poly.length];
}

// Smallest rotated rectangle around a polygon: [cx, cz, angle, length along angle, width].
function minBox(poly) {
  const h = hull(poly);
  let best = null;
  for (let i = 0; i < h.length; i++) {
    const a = h[i], b = h[(i + 1) % h.length];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), c = Math.cos(ang), s = Math.sin(ang);
    const us = h.map(p => p[0] * c + p[1] * s), vs = h.map(p => -p[0] * s + p[1] * c);
    const L = Math.max(...us) - Math.min(...us), W = Math.max(...vs) - Math.min(...vs);
    if (!best || L * W < best[0]) {
      const mu = (Math.max(...us) + Math.min(...us)) / 2, mv = (Math.max(...vs) + Math.min(...vs)) / 2;
      best = [L * W, mu * c - mv * s, mu * s + mv * c, ang, L, W];
    }
  }
  return best.slice(1);
}

function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  let k = 0, dk = -1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = segDist(pts[i], pts[0], pts[pts.length - 1]);
    if (d > dk) { dk = d; k = i - 1; }
  }
  if (dk < tol) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, k + 2), tol).slice(0, -1), ...simplify(pts.slice(k + 1), tol)];
}

// Replace each corner of a closed polyline by a circular arc, sampled every few metres. An open
// one keeps its two ends.
function roundCorners(loop, radius, closed = true) {
  const n = loop.length, out = [];
  for (let i = 0; i < n; i++) {
    if (!closed && (i === 0 || i === n - 1)) { out.push(loop[i]); continue; }
    const p0 = loop[(i - 1 + n) % n], p = loop[i], p1 = loop[(i + 1) % n];
    let a = [p0[0] - p[0], p0[1] - p[1]], b = [p1[0] - p[0], p1[1] - p[1]];
    const la = Math.hypot(...a), lb = Math.hypot(...b);
    a = [a[0] / la, a[1] / la];
    b = [b[0] / lb, b[1] / lb];
    const turn = Math.PI - Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1])));
    if (turn < 0.08) { out.push(p); continue; }
    const cut = Math.min(radius * Math.tan(turn / 2), la * 0.48, lb * 0.48);
    const r = cut / Math.tan(turn / 2);
    const s = [p[0] + a[0] * cut, p[1] + a[1] * cut], e = [p[0] + b[0] * cut, p[1] + b[1] * cut];
    const bis = [a[0] + b[0], a[1] + b[1]], lbis = Math.hypot(...bis), cdist = r / Math.cos(turn / 2);
    const c = [p[0] + (bis[0] / lbis) * cdist, p[1] + (bis[1] / lbis) * cdist];
    const a0 = Math.atan2(s[1] - c[1], s[0] - c[0]), a1 = Math.atan2(e[1] - c[1], e[0] - c[0]);
    const da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
    const steps = Math.max(2, Math.trunc((Math.abs(da) * r) / 2.5));
    for (let k = 0; k <= steps; k++) {
      const t = a0 + (da * k) / steps;
      out.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]);
    }
  }
  return out;
}

function resample(loop, step, closed = true) {
  const out = [];
  for (let i = 0; i < loop.length - (closed ? 0 : 1); i++) {
    const a = loop[i], b = loop[(i + 1) % loop.length];
    const k = Math.max(1, Math.trunc(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  if (!closed) out.push(loop[loop.length - 1]);
  return out;
}

// Rounding like Python's round(): halves go to the even neighbour, on the exact decimal value.
const r1 = v => {
  const x = Math.round(v * 10) / 10;
  return Object.is(x, -0) ? 0 : x;
};

// Shortest path between two nodes of one street's graph (Dijkstra). cost can make some edges dearer.
function shortest(g, a, b, cost = (u, v, L) => L) {
  const D = new Map([[a, 0]]), prev = new Map(), heap = [[0, a]];
  const less = (x, y) => x[0] < y[0] || (x[0] === y[0] && x[1] < y[1]);
  const push = e => {
    heap.push(e);
    for (let i = heap.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (!less(heap[i], heap[p])) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && less(heap[l], heap[m])) m = l;
        if (r < heap.length && less(heap[r], heap[m])) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, u] = pop();
    if (u === b) break;
    if (d > D.get(u)) continue;
    for (const [v, L] of g.get(u) ?? []) {
      const dv = d + cost(u, v, L);
      if (dv < (D.get(v) ?? 1e18)) {
        D.set(v, dv);
        prev.set(v, u);
        push([dv, v]);
      }
    }
  }
  if (!D.has(b)) return [null, 1e18];
  const out = [b];
  while (out[out.length - 1] !== a) out.push(prev.get(out[out.length - 1]));
  return [out.reverse(), D.get(b)];
}

// Every combination of one item per list, in order (like itertools.product).
function* product(lists, i = 0, acc = []) {
  if (i === lists.length) { yield acc.slice(); return; }
  for (const x of lists[i]) {
    acc.push(x);
    yield* product(lists, i + 1, acc);
    acc.pop();
  }
}

// ------------------------------------------------------------------ the route only

// The street graph of the route streets in OSM data: { P: id -> [x, z] real metres, streets, oneway }.
function routeStreets(nodes, ways, route, project, extraFree = []) {
  const P = new Map();
  for (const [k, v] of nodes) P.set(k, project(v));
  const streets = new Map(), onewayEdges = new Set(), freeEdges = new Set();
  for (const wy of ways) {
    const t = wy.tags ?? {};
    if (t.highway in ROAD_WIDTH && route.includes(t.name)) {
      const ns = wy.nodes.map(String).filter(i => P.has(i));
      if (!streets.has(t.name)) streets.set(t.name, []);
      streets.get(t.name).push(ns);
      // one-way for cars, so parked along both kerbs; but nobody parks in a car-free street, oneway or not
      const free = carFree(t, extraFree);
      for (let i = 0; i + 1 < ns.length; i++) {
        if (free) freeEdges.add(edgeKey(ns[i], ns[i + 1]));
        else if (ONEWAY.has(t.oneway)) onewayEdges.add(edgeKey(ns[i], ns[i + 1]));
      }
    }
  }
  return { P, streets, onewayEdges, freeEdges };
}

const edgeKey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);

// The race loop through the route streets, as lists of node ids per street (the legs). An open
// route (ends: { from, to }, each [x, z] real metres or null) has no corner from its last street
// back to the first: it starts on its first street at the node nearest `from` (or else the one
// farthest from the next street) and ends likewise on its last street near `to`.
function routeLoop(P, streets, route, ends = null) {
  const missing = route.filter(nm => !streets.has(nm));
  if (missing.length) throw new MapError('missing', missing);
  const graphs = new Map(route.map(name => {
    const g = new Map();
    for (const ns of streets.get(name)) {
      for (let i = 0; i + 1 < ns.length; i++) {
        const a = ns[i], b = ns[i + 1], d = dist(P.get(a), P.get(b));
        if (!g.has(a)) g.set(a, []);
        if (!g.has(b)) g.set(b, []);
        g.get(a).push([b, d]);
        g.get(b).push([a, d]);
      }
    }
    return [name, g];
  }));
  const junctions = route.slice(0, ends ? -1 : undefined).map((nm, i) => {
    const nxt = route[(i + 1) % route.length], other = graphs.get(nxt);
    const common = [...graphs.get(nm).keys()].filter(k => other.has(k)).sort();
    if (!common.length) throw new MapError('apart', [nm, nxt]);
    return common;
  });
  // Choose one junction per corner so that the whole loop is shortest, but ride every street for
  // a real stretch: a street skipped at a single junction its neighbours share doesn't count.
  const L = route.length;
  const endNode = (name, at, junction) => {
    const ids = [...graphs.get(name).keys()];
    const score = at ? k => -dist(P.get(k), at) : k => dist(P.get(k), P.get(junction));
    return ids.reduce((a, b) => (score(b) > score(a) ? b : a));
  };
  let best = null, bestShort = null, tries = 0;
  const rode = new Set(); // the streets some pick of junctions could ride along, to name the ones none could
  for (const pick of product(junctions)) {
    if (++tries > 200000) break; // streets that cross many times: settle for the best so far
    const legs = [];
    let total = 0, ok = true, short = false;
    for (let i = 0; i < L; i++) {
      const a = ends && i === 0 ? endNode(route[0], ends.from, pick[0]) : pick[(i - 1 + L) % L];
      const b = ends && i === L - 1 ? endNode(route[L - 1], ends.to, pick[L - 2]) : pick[i];
      const [seg, d] = shortest(graphs.get(route[i]), a, b);
      if (!seg) { ok = false; break; }
      rode.add(i);
      legs.push(seg);
      total += d;
      if (d < MIN_LEG) short = true;
    }
    if (!ok) continue;
    if (!short && (!best || total < best[0])) best = [total, legs];
    if (short && (!bestShort || total < bestShort[0])) bestShort = [total, legs];
  }
  // name the first street no pick could get along (it is in pieces between its neighbours), or else all
  if (!best && !bestShort) {
    const stuck = route.filter((_, i) => !rode.has(i));
    throw new MapError('noloop', stuck.length ? stuck.slice(0, 1) : route);
  }
  return (best ?? bestShort)[1];
}

// ------------------------------------------------------------------ bridges

// OSM has no heights, but it does mark bridges. Most of them lie level with the street, on railings;
// the area's `bridges` names the others ({ name: type }): a hump whose deck stands above the street,
// arched in the middle, with the streets that lead onto it climbing to it over the last few metres.
export const BRIDGES = { // in real metres: how high the deck stands above the street, how much higher its middle is, over how far the streets climb to it
  arched: { code: 1, deck: 2.4, arch: 0.6, ramp: 28 }, // a hump over a canal
  flat: { code: 2, deck: 0.15, arch: 0, ramp: 3 }, // the usual: level with the quays, on railings (Hoofdbrug, Grasbrug)
  // high and wide, a stone balustrade with lamps on it (Sint-Michielsbrug); only the street of its own
  // name climbs to it (the helling), the quays beside it stay down by the water
  grand: { code: 3, deck: 3.8, arch: 1.4, ramp: 45, width: 9, own: true },
};
const isBridge = t => !!t.bridge && t.bridge !== 'no' && (parseInt(t.layer, 10) || 1) > 0;
const bridgeType = (t, types = {}) => (isBridge(t) ? BRIDGES[types[t.name]] ?? BRIDGES.flat : null);
const ease = t => t * t * (3 - 2 * t);

// How far along the streets each node lies from each kind of bridge (only those closer than its
// ramp), and a way with its heights: profile(ns, type) -> [[x, z, height]] in real metres, a point
// every few metres where it climbs. bridge: its type, from BRIDGES, or null for a street; name: the way's.
function bridges(ways, P, types) {
  const g = new Map(), from = new Map(Object.values(BRIDGES).map(b => [b, []])), names = new Map(Object.values(BRIDGES).map(b => [b, new Set()]));
  for (const wy of ways) {
    const t = wy.tags ?? {};
    if (!(t.highway in ROAD_WIDTH) || t.area === 'yes') continue;
    const ns = wy.nodes.map(String).filter(i => P.has(i));
    const type = bridgeType(t, types);
    if (type) { from.get(type).push(...ns); names.get(type).add(t.name); continue; }
    for (let i = 0; i + 1 < ns.length; i++) {
      const a = ns[i], b = ns[i + 1], L = dist(P.get(a), P.get(b));
      for (const [u, v] of [[a, b], [b, a]]) {
        if (!g.has(u)) g.set(u, []);
        g.get(u).push([v, L, t.name]);
      }
    }
  }
  // the nodes nearest a bridge first (a plain list is quick enough for the few hundred near one)
  const reach = (start, ramp, own) => {
    const D = new Map(start.map(k => [k, 0])), todo = [...D.keys()];
    while (todo.length) {
      let bi = 0;
      for (let i = 1; i < todo.length; i++) if (D.get(todo[i]) < D.get(todo[bi])) bi = i;
      const u = todo[bi];
      todo[bi] = todo[todo.length - 1];
      todo.pop();
      for (const [v, L, name] of g.get(u) ?? []) {
        if (own && !own.has(name)) continue;
        const d = D.get(u) + L;
        if (d < ramp && d < (D.get(v) ?? Infinity)) {
          if (!D.has(v)) todo.push(v);
          D.set(v, d);
        }
      }
    }
    return D;
  };
  const near = [...from].map(([b, start]) => [b, reach(start, b.ramp, b.own && names.get(b))]);
  // how high a street is between nodes a and b, f of the way along its L metres (the highest of the climbs onto the bridges near it)
  const climb = (a, b, f, L, name) => Math.max(0, ...near.map(([br, D]) => {
    if (br.own && !names.get(br).has(name)) return 0;
    const d = Math.min((D.get(a) ?? Infinity) + f * L, (D.get(b) ?? Infinity) + (1 - f) * L);
    return d < br.ramp ? br.deck * ease(1 - d / br.ramp) : 0;
  }));
  const climbs = id => near.some(([br, D]) => (D.get(id) ?? Infinity) < br.ramp);
  const along = (a, b, n, at) => {
    const out = [];
    for (let j = 0; j < n; j++) out.push([a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n, at(j / n)]);
    return out;
  };
  const profile = (ns, bridge, name) => {
    const out = [];
    if (bridge) {
      let total = 0;
      for (let i = 0; i + 1 < ns.length; i++) total += dist(P.get(ns[i]), P.get(ns[i + 1]));
      let s = 0;
      for (let i = 0; i + 1 < ns.length; i++) {
        const a = P.get(ns[i]), b = P.get(ns[i + 1]), L = dist(a, b);
        out.push(...along(a, b, Math.max(1, Math.round(L / 3)), f => bridge.deck + bridge.arch * Math.sin((Math.PI * (s + f * L)) / Math.max(total, 1))));
        s += L;
      }
    } else {
      for (let i = 0; i + 1 < ns.length; i++) {
        const a = P.get(ns[i]), b = P.get(ns[i + 1]), L = dist(a, b);
        const n = climbs(ns[i]) || climbs(ns[i + 1]) ? Math.max(1, Math.round(L / 3)) : 1;
        out.push(...along(a, b, n, f => climb(ns[i], ns[i + 1], f, L, name)));
      }
    }
    const k = ns[ns.length - 1], last = P.get(k);
    if (last) out.push([last[0], last[1], bridge ? bridge.deck : climb(k, k, 0, 0, name)]);
    return out;
  };
  return profile;
}

// Where on Earth a route lies:{ bbox: [s, w, n, e] } around its loop, `margin` metres wider.
// Takes OSM data of just the route streets (ways with their nodes).
export function routeBounds(data, route, margin = DEFAULTS.margin) {
  const nodes = nodeMap(data);
  const lat0 = avg([...nodes.values()].map(v => v.lat)), lon0 = avg([...nodes.values()].map(v => v.lon));
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180), kz = 110574;
  const { P, streets } = routeStreets(nodes, data.ways, route, v => [(v.lon - lon0) * kx, -(v.lat - lat0) * kz]);
  const legs = routeLoop(P, streets, route);
  let s = 90, w = 180, n = -90, e = -180;
  for (const id of legs.flat()) {
    const v = nodes.get(id);
    s = Math.min(s, v.lat); n = Math.max(n, v.lat); w = Math.min(w, v.lon); e = Math.max(e, v.lon);
  }
  const dl = margin / kz, dw = margin / kx;
  return { bbox: [s - dl, w - dw, n + dl, e + dw], length: legs.reduce((sum, seg) => sum + seg.slice(1).reduce((L, id, i) => L + dist(P.get(seg[i]), P.get(id)), 0), 0) };
}

const avg = xs => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

// nodes as a Map id -> node, from either { nodes: {id: node} } (the cache) or a list of elements
function nodeMap(data) {
  if (data.nodes instanceof Map) return data.nodes;
  if (Array.isArray(data.nodes)) return new Map(data.nodes.map(v => [String(v.id), v]));
  return new Map(Object.entries(data.nodes));
}

// OSM JSON from the main API or Overpass ({ elements }) -> { nodes, ways }, keeping only what's used.
// A multipolygon relation (a building, a park, a square: whole old towns are mapped that way, Lecce's
// for one) becomes one way per outer ring, carrying the relation's tags; its holes are left out.
export function fromElements(elements) {
  const nodes = new Map(), ways = [], relations = [];
  for (const el of elements) {
    if (el.type === 'node' && el.lat != null) nodes.set(String(el.id), el);
    else if (el.type === 'way') ways.push(el);
    else if (el.type === 'relation' && el.tags?.type === 'multipolygon') relations.push(el);
  }
  const byId = new Map(ways.map(wy => [wy.id, wy]));
  const seen = new Set();
  for (const rel of relations) {
    if (seen.has(rel.id)) continue;
    seen.add(rel.id);
    const { type, ...tags } = rel.tags;
    const parts = rel.members.filter(m => m.type === 'way' && m.role !== 'inner').map(m => byId.get(m.ref)?.nodes).filter(Boolean);
    // a made-up way id, far above OSM's own
    rings(parts).forEach((ns, k) => ways.push({ type: 'way', id: 1e11 + rel.id * 10 + Math.min(k, 9), nodes: ns, tags, rel: rel.id }));
  }
  return { nodes, ways };
}

// Closed rings from the pieces of a multipolygon's outline (lists of node ids), joined end to end.
// Pieces that never close (members outside the download) are dropped.
function rings(parts) {
  const left = parts.map(p => p.slice()), out = [];
  while (left.length) {
    let ring = left.shift();
    for (let grew = true; grew && ring[0] !== ring[ring.length - 1];) {
      grew = false;
      for (let i = 0; i < left.length; i++) {
        const p = left[i], end = ring[ring.length - 1];
        if (p[0] === end) ring = ring.concat(p.slice(1));
        else if (p[p.length - 1] === end) ring = ring.concat(p.slice(0, -1).reverse());
        else continue;
        left.splice(i, 1);
        grew = true;
        break;
      }
    }
    if (ring.length > 3 && ring[0] === ring[ring.length - 1]) out.push(ring);
  }
  return out;
}

// The sea, as polygons in the coordinates of P: OSM draws the coast as lines (natural=coastline)
// with the land on their left, so the water lies to the right of them. Each line that crosses the
// box [x0, z0, x1, z1] (x east, z south) is cut to it and closed round the box's edge on its right,
// clockwise on the map. Islands (closed lines) are left out.
function sea(ways, P, [x0, z0, x1, z1]) {
  const parts = ways.filter(wy => wy.tags?.natural === 'coastline').map(wy => wy.nodes.map(String).filter(i => P.has(i)));
  // join the pieces end to start, keeping their direction
  const lines = [];
  while (parts.length) {
    let line = parts.shift();
    for (let i = 0; i < parts.length; i++) {
      if (parts[i][0] === line[line.length - 1]) line = line.concat(parts.splice(i, 1)[0].slice(1));
      else if (parts[i][parts[i].length - 1] === line[0]) line = parts.splice(i, 1)[0].slice(0, -1).concat(line);
      else continue;
      i = -1;
    }
    if (line[0] !== line[line.length - 1]) lines.push(line.map(i => P.get(i)));
  }
  const inBox = ([x, z]) => x > x0 && x < x1 && z > z0 && z < z1;
  const clamp = ([x, z]) => [Math.min(x1, Math.max(x0, x)), Math.min(z1, Math.max(z0, z))];
  const W = x1 - x0, H = z1 - z0;
  // where a point on the box's edge lies along it, clockwise from the north-west corner
  const along = ([x, z]) => (z <= z0 ? x - x0 : x >= x1 ? W + z - z0 : z >= z1 ? W + H + x1 - x : 2 * W + H + z1 - z);
  const corners = [[x1, z0], [x1, z1], [x0, z1], [x0, z0]].map(c => [along(c) || 2 * (W + H), c]);
  const out = [];
  for (const line of lines) {
    const a = line.findIndex(inBox), b = line.findLastIndex(inBox);
    if (a < 0 || a === 0 || b === line.length - 1) continue; // it has to come in and go out again
    const poly = [clamp(line[a - 1]), ...line.slice(a, b + 1), clamp(line[b + 1])];
    // round the edge clockwise, from where the coast leaves the box to where it came in
    const t0 = along(poly[poly.length - 1]), t1 = along(poly[0]), lap = 2 * (W + H);
    const ahead = t => (t - t0 + lap) % lap;
    corners.filter(([t]) => ahead(t) < ahead(t1)).sort((p, q) => ahead(p[0]) - ahead(q[0])).forEach(([, c]) => poly.push(c));
    out.push(poly);
  }
  return out;
}

// ------------------------------------------------------------------ the map

// area: { bbox: [s, w, n, e], routes: [{ id, route: [street names] }] (or one route: [street names]),
// zone_roads? or zone_points: [[lat, lon]], shop_streets?, scale?, hw?, corner?, ... }
// One map holds every race route through it; everything is centred on the first.
// Returns { map, info } where info has each route's length and counts, for a report.
export function buildMap(data, area) {
  const A = { ...DEFAULTS, ...area };
  const nodes = nodeMap(data), ways = data.ways;
  const S = A.scale, [s, w, n, e] = A.bbox;
  const lat0 = (s + n) / 2, lon0 = (w + e) / 2;
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180), kz = 110574;
  // x east, z south (so north is up on the minimap), in real metres for now
  const project = v => [(v.lon - lon0) * kx, -(v.lat - lat0) * kz];
  const routes = A.routes ?? [{ id: 'main', route: A.route }];
  const { P, streets, onewayEdges, freeEdges } = routeStreets(nodes, ways, routes.flatMap(rt => rt.route), project, A.car_free);
  const pts = wy => wy.nodes.map(String).filter(i => P.has(i)).map(i => P.get(i));
  const tag = wy => wy.tags ?? {};
  const profile = bridges(ways, P, A.bridges);

  // Each race route, street by street: from the junction with the previous street to the next one.
  // It starts in the middle of its first street, riding the way the list goes. One-way streets are
  // narrower, with cars parked along both kerbs: mark them along the loop, and which street each
  // point is on, for the street names on screen.
  const loops = routes.map(({ route, from, to }) => {
    const open = !!(from || to);
    const at = ll => (ll ? project({ lat: ll[0], lon: ll[1] }) : null);
    const legs = routeLoop(P, streets, route, open ? { from: at(from), to: at(to) } : null), raw = [], edges = [];
    route.forEach((name, li) => {
      const seg = legs[li];
      raw.push(...seg.slice(0, open && li === route.length - 1 ? undefined : -1).map(k => P.get(k)));
      for (let i = 0; i + 1 < seg.length; i++) {
        const a = P.get(seg[i]), b = P.get(seg[i + 1]);
        edges.push([[a[0] * S, a[1] * S], [b[0] * S, b[1] * S], onewayEdges.has(edgeKey(seg[i], seg[i + 1])), name, freeEdges.has(edgeKey(seg[i], seg[i + 1]))]);
      }
    });
    let loop = raw.map(([x, z]) => [x * S, z * S]);
    if (open) {
      // from one end to the other
      loop = resample(roundCorners(simplify(loop, 0.6), A.corner, false), 3, false);
    } else {
      loop = simplify([...loop, loop[0]], 0.6).slice(0, -1);
      loop = resample(roundCorners(loop, A.corner), 3);
      const mid = P.get(legs[0][Math.floor(legs[0].length / 2)]), midG = [mid[0] * S, mid[1] * S];
      let k0 = 0;
      loop.forEach((p, i) => { if (dist(p, midG) < dist(loop[k0], midG)) k0 = i; });
      loop = [...loop.slice(k0), ...loop.slice(0, k0)];
    }
    const oneway = [], street = [], free = [];
    for (const q of loop) {
      let best = edges[0], bd = Infinity;
      for (const ed of edges) {
        const d = segDist(q, ed[0], ed[1]);
        if (d < bd) { bd = d; best = ed; }
      }
      oneway.push(best[2] ? 1 : 0);
      street.push(route.indexOf(best[3]));
      free.push(best[4] ? 1 : 0);
    }
    return { route, raw, loop, oneway, street, free, open };
  });

  // The zone: everything inside the roads that enclose the neighbourhood, or else around the routes.
  let zone, zoneMargin = A.zone_margin;
  if (A.zone_roads?.length) {
    zone = hull(ways.filter(wy => A.zone_roads.includes(tag(wy).name)).flatMap(pts));
  } else if (A.zone_points?.length) {
    zone = hull(A.zone_points.map(([lat, lon]) => project({ lat, lon })));
  } else {
    zone = hull(loops.flatMap(l => l.raw));
    zoneMargin = A.margin;
  }
  if (zone.length < 3) throw new MapError('zone', A.zone_roads ?? []);
  const near = p => inside(p, zone) || polyDist(p, zone) < zoneMargin;

  // Centre everything on the first route, so the shadows and the sun sit over the race.
  const xs = loops[0].loop.map(p => p[0]), zs = loops[0].loop.map(p => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  for (const l of loops) l.loop = l.loop.map(([x, z]) => [x - cx, z - cz]);
  const G = p => [p[0] * S - cx, p[1] * S - cz]; // real metres -> game metres

  // Coarse grid over the routes, to test what comes too close to a raced street.
  const cell = 20, grid = new Map();
  const cellKey = (i, j) => i + ',' + j;
  for (const l of loops) {
    l.loop.forEach((p, i) => {
      const key = cellKey(Math.floor(p[0] / cell), Math.floor(p[1] / cell));
      if (!grid.has(key)) grid.set(key, []);
      if (i < l.loop.length - 1 || !l.open) grid.get(key).push([l.loop, i]); // an open route has no last segment
    });
  }
  const routeDist = q => {
    const gx = Math.floor(q[0] / cell), gz = Math.floor(q[1] / cell);
    let bd = 1e9;
    for (let i = gx - 1; i <= gx + 1; i++) {
      for (let j = gz - 1; j <= gz + 1; j++) {
        for (const [loop, k] of grid.get(cellKey(i, j)) ?? []) bd = Math.min(bd, segDist(q, loop[k], loop[(k + 1) % loop.length]));
      }
    }
    return bd;
  };
  // the nearest point on a route to q, and how far it is
  const routeNear = q => {
    const gx = Math.floor(q[0] / cell), gz = Math.floor(q[1] / cell);
    let bd = 1e9, near = null;
    for (let i = gx - 1; i <= gx + 1; i++) {
      for (let j = gz - 1; j <= gz + 1; j++) {
        for (const [loop, k] of grid.get(cellKey(i, j)) ?? []) {
          const a = loop[k], b = loop[(k + 1) % loop.length], dx = b[0] - a[0], dz = b[1] - a[1];
          const u = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dz) / Math.max(1e-9, dx * dx + dz * dz)));
          const p = [a[0] + u * dx, a[1] + u * dz], d = dist(q, p);
          if (d < bd) { bd = d; near = p; }
        }
      }
    }
    return [near, bd];
  };

  const hw = A.hw;
  const out = {
    routes: loops.map((l, i) => ({ id: routes[i].id, route: l.loop.map(p => [r1(p[0]), r1(p[1])]), oneway: l.oneway, streets: l.route, street: l.street, ...(l.free.some(f => f) ? { free: l.free } : {}), ...(l.open ? { open: 1 } : {}) })),
    buildings: [], roads: [], names: [], areas: [], water: [], trees: [],
  };
  const flat = g => g.flatMap(p => [r1(p[0]), r1(p[1])]);

  // nearest street direction, so a gable roof's ridge can run along the street; and the named
  // streets, for which street each building fronts
  const rgrid = new Map(), ngrid = new Map();
  const addTo = (grid, a, b, item) => {
    const key = cellKey(Math.floor((a[0] + b[0]) / 2 / 40), Math.floor((a[1] + b[1]) / 2 / 40));
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(item);
  };
  for (const wy of ways) {
    const t = tag(wy);
    if (t.highway in ROAD_WIDTH && !PAVED_FOOT.has(t.highway)) {
      const q = pts(wy).map(G);
      if (t.name && !out.names.includes(t.name)) out.names.push(t.name);
      for (let i = 0; i + 1 < q.length; i++) {
        addTo(rgrid, q[i], q[i + 1], [q[i], q[i + 1]]);
        if (t.name) addTo(ngrid, q[i], q[i + 1], [q[i], q[i + 1], out.names.indexOf(t.name)]);
      }
    }
  }
  // the wall nearest a named street: [distance, which edge is the front, which street it faces]
  const front = g => {
    let best = null;
    for (let e = 0; e < g.length; e++) {
      const a = g[e], b = g[(e + 1) % g.length], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const gx = Math.floor(m[0] / 40), gz = Math.floor(m[1] / 40);
      for (let i = gx - 1; i <= gx + 1; i++) {
        for (let j = gz - 1; j <= gz + 1; j++) {
          for (const [sa, sb, k] of ngrid.get(cellKey(i, j)) ?? []) {
            const d = segDist(m, sa, sb);
            if (d < 12 && (!best || d < best[0])) best = [d, e, k];
          }
        }
      }
    }
    return best;
  };
  const streetAngle = q => {
    const gx = Math.floor(q[0] / 40), gz = Math.floor(q[1] / 40);
    let best = null, bd = Infinity;
    for (let i = gx - 1; i <= gx + 1; i++) {
      for (let j = gz - 1; j <= gz + 1; j++) {
        for (const sg of rgrid.get(cellKey(i, j)) ?? []) {
          const d = segDist(q, sg[0], sg[1]);
          if (d < bd) { bd = d; best = sg; }
        }
      }
    }
    return best && Math.atan2(best[1][1] - best[0][1], best[1][0] - best[0][0]);
  };

  // Building parts with a height: towers, spires, the nave of a church. A building split into
  // parts is drawn from its parts, like 3D maps do.
  // (a building or part under the ground, such as a subway station, is left out: it would stand on the street)
  const underground = t => t.location === 'underground' || parseFloat(t.layer) < 0;
  const parts = [];
  for (const wy of ways) {
    const t = tag(wy);
    if (!('building:part' in t) || 'building' in t || !(parseFloat(t.height) > 0) || underground(t)) continue;
    const ring = pts(wy);
    if (ring.length < 4 || ring[0] !== ring[ring.length - 1] || !near(centroid(ring))) continue;
    const g = ring.slice(0, -1).map(G);
    parts.push({ wy, t, g, c: centroid(g), a: polyArea(g), parent: null });
  }

  // The real shops, cafés and restaurants: points tagged shop=* or a food and drink amenity.
  const shops = [], sgrid = new Map();
  for (const v of nodes.values()) {
    const t = v.tags ?? {}, type = t.shop ?? t.amenity;
    if (!type || (!t.shop && !SHOP_KINDS[type])) continue;
    const real = [(v.lon - lon0) * kx, -(v.lat - lat0) * kz];
    if (!near(real)) continue;
    const sh = { p: G(real), kind: SHOP_KINDS[type] ?? 'shop', name: t.name ?? '', used: false };
    shops.push(sh);
    const key = cellKey(Math.floor(sh.p[0] / 20), Math.floor(sh.p[1] / 20));
    if (!sgrid.has(key)) sgrid.set(key, []);
    sgrid.get(key).push(sh);
  }
  // the shop whose point lies inside this building, or just outside its walls
  const shopIn = g => {
    const [cx_, cz_] = centroid(g);
    let best = null;
    for (let i = Math.floor(cx_ / 20) - 2; i <= Math.floor(cx_ / 20) + 2; i++) {
      for (let j = Math.floor(cz_ / 20) - 2; j <= Math.floor(cz_ / 20) + 2; j++) {
        for (const sh of sgrid.get(cellKey(i, j)) ?? []) {
          if (sh.used) continue;
          const d = inside(sh.p, g) ? 0 : polyDist(sh.p, g);
          if (d < 3 && (!best || d < best[0])) best = [d, sh];
        }
      }
    }
    return best?.[1];
  };

  // The measured roof, where the map comes with heights (A.surface(lat, lon): metres above the
  // ground, from a height model such as Flanders' DHMV): sampled every metre inside the walls,
  // keeping clear of them. The walls go up to where the roof starts, the ridge to its top, and a
  // pitched roof's ridge runs the way the heights say: they fall away across it, not along it.
  // Where the building faces a street (fe: its front wall), the walls are as high as the heights
  // just behind that wall say: an outline in the old town often takes in the whole plot, and the
  // low sheds and covered yards at the back of it are not where the front's walls stop.
  const toLatLon = q => [lat0 - (q[1] + cz) / S / kz, lon0 + (q[0] + cx) / S / kx];
  const measure = (g, box, fe) => {
    if (!A.surface) return null;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const q of g) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]); }
    const step = S, hs = [], at = [];
    for (let x = x0 + step / 2; x < x1; x += step) {
      for (let z = z0 + step / 2; z < z1; z += step) {
        const q = [x, z];
        if (!inside(q, g) || polyDist(q, g) < 0.8 * S) continue;
        const v = A.surface(...toLatLon(q));
        if (Number.isFinite(v)) { hs.push(v); at.push(q); }
      }
    }
    if (hs.length < 6) return null;
    const sorted = [...hs].sort((a, b) => a - b), pct = f => sorted[Math.min(sorted.length - 1, Math.floor(f * sorted.length))];
    const top = pct(0.95);
    if (top < 2.5) return null; // built after the flights, or not there at all
    let eave = pct(0.1), mid = pct(0.5);
    if (fe != null) {
      const a = g[fe], b = g[(fe + 1) % g.length];
      const band = hs.filter((_, i) => segDist(at[i], a, b) < 3 * S).sort((x, y) => x - y);
      if (band.length >= 4) {
        // the lower part of the band, so a ridge that runs along the front still starts at its eaves
        eave = band[Math.floor(0.2 * band.length)];
        mid = band[band.length >> 1];
      }
    }
    const m = { e: eave, t: top, mid };
    if (box && top - eave > 1.5) {
      // pitched: the roof stands higher along one centre line of the box than out by its walls,
      // and the ridge runs along the centre line it is highest on (dormers and back extensions
      // muddle a plane fit, the middle of the heights holds up)
      m.pitched = true;
      const [bcx, bcz, ang, bl, bw] = box, ca = Math.cos(ang), sa = Math.sin(ang);
      const median = a => (a.length ? a.sort((x, y) => x - y)[a.length >> 1] : NaN);
      const rise = across => {
        const half = (across ? bw : bl) / 2, inner = [], outer = [];
        at.forEach((q, i) => {
          const d = Math.abs(across ? -(q[0] - bcx) * sa + (q[1] - bcz) * ca : (q[0] - bcx) * ca + (q[1] - bcz) * sa);
          (d < half * 0.4 ? inner : outer).push(hs[i]);
        });
        return inner.length >= 3 && outer.length >= 3 ? median(inner) - median(outer) : 0;
      };
      const [ra, rb] = [rise(true), rise(false)];
      if (Math.max(ra, rb) > 0.6) m.along = ra >= rb;
    }
    return m;
  };

  let dropped = 0;
  const addBuilding = (wy, t, g, kind) => {
    const across = loops.some(l => l.loop.some((p, i) => i % 3 === 0 && dist(p, g[0]) < 120 && inside(p, g)));
    if (!across && polyArea(g) > 400 && Math.min(...g.map(routeDist)) < hw + 0.4) {
      // a whole block in one outline (old towns are mapped that way) whose corners reach into the
      // raced street: pull those corners back to its kerb rather than lose the block
      g = g.map(q => {
        const [p, d] = routeNear(q);
        return d >= hw + 0.4 ? q : d < 0.01 ? null : [p[0] + ((q[0] - p[0]) * (hw + 0.6)) / d, p[1] + ((q[1] - p[1]) * (hw + 0.6)) / d];
      });
      if (g.includes(null)) return void dropped++;
    }
    if (across || Math.min(...g.map(routeDist)) < hw + 0.4) {
      dropped++;
      return;
    }
    const a = polyArea(g);
    const lv = t['building:levels'], levels = lv != null && lv.trim() !== '' ? Number(lv) : NaN;
    let floors;
    if (Number.isFinite(levels)) {
      floors = Math.max(1, Math.min(8, roundHalfEven(levels)));
    } else {
      const h = Number((BigInt(wy.id) * 2654435761n) % 1000n) / 1000;
      floors = a > 900 ? 4 : a > 250 ? 3 : h < 0.45 ? 2 : 3;
      if (A.floors) floors = Math.min(floors, A.floors); // a town of lower houses than Ghent's
      if (SHEDS.has(kind)) floors = 1;
    }
    const b = { p: flat(g), f: floors, r: null, k: kind };
    const fr = front(g);
    const height = parseFloat(t.height), base = parseFloat(t.min_height);
    if (height >= 20 || kind === 'part') {
      // belfries, church towers: their real height, standing on top of what is below them
      b.h = r1(height * S);
      if (base > 0) b.b = r1(base * S);
    } else {
      const box = minBox(g), [bcx, bcz, ang, L, W] = box;
      const old = OLD_KINDS.has(kind) && (!!t.heritage || OLD_STYLE.test(t['building:architecture'] ?? ''));
      // a town of roof terraces (area roofs: 'flat') has a pitched roof only where the map says so
      const sa = streetAngle([bcx, bcz]), flatRoof = t['roof:shape'] === 'flat' || (A.roofs === 'flat' && !t['roof:shape']);
      const boxy = a / Math.max(1, L * W) > 0.82 && a < 450 && (kind === 'hut' || !SHEDS.has(kind));
      const m = measure(g, !flatRoof && boxy && box, fr?.[1]);
      if (m) {
        // measured: walls up to the eaves, a pitched roof only where the heights show one
        b.e = r1((m.pitched ? m.e : m.mid) * S);
        if (m.pitched) b.t = r1(m.t * S);
        b.f = floors = Math.max(1, Math.min(12, Math.round((m.pitched ? m.e : m.mid) / 3)));
      }
      if (flatRoof) {
        // a flat roof: no ridge
      } else if (old && A.gables !== false && sa != null && a / Math.max(1, L * W) > 0.7 && a < 700 && floors <= 5 && (!m || m.pitched)) {
        // an old house: its gable end faces the street, behind a stepped gable, if it is narrow enough
        const along = Math.abs(Math.cos(sa - ang)) > 0.7;
        const [ridge, span, rang] = along ? [W, L, ang + Math.PI / 2] : [L, W, ang];
        if (span <= 13 * S) {
          b.r = [r1(bcx), r1(bcz), Math.round(rang * 1000) / 1000, r1(ridge), r1(span)];
          b.sg = 1;
        }
      }
      if (!b.r && !flatRoof && (m ? m.pitched : boxy && floors <= 4)) {
        // ridge the way the roof was measured, else along the street if we know where it is,
        // else along the long side
        const along = m?.along ?? (sa == null ? L >= W : Math.abs(Math.cos(sa - ang)) > 0.7);
        const [ridge, span, rang] = along ? [L, W, ang] : [W, L, ang + Math.PI / 2];
        b.r = [r1(bcx), r1(bcz), Math.round(rang * 1000) / 1000, r1(ridge), r1(span)];
      }
    }
    // the colours a few buildings have in the map
    const wc = colour(t['building:colour']), rc = colour(t['roof:colour']);
    if (wc) b.wc = wc;
    if (rc) b.rc = rc;
    if (fr) [b.st, b.fe] = [fr[2], fr[1]];
    const sh = shopIn(g);
    if (sh) {
      sh.used = true;
      b.shop = [sh.kind, sh.name];
      // no street to face found: the wall nearest the shop's point, where its door usually is
      if (b.fe == null) b.fe = g.reduce((best, _, e) => (segDist(sh.p, g[e], g[(e + 1) % g.length]) < segDist(sh.p, g[best], g[(best + 1) % g.length]) ? e : best), 0);
    }
    out.buildings.push(b);
  };

  for (const wy of ways) {
    const t = tag(wy);
    let ring = pts(wy);
    const closed = ring.length >= 4 && ring[0] === ring[ring.length - 1];
    if (closed) ring = ring.slice(0, -1);
    if ('building' in t && closed && ring.length >= 3) {
      if (!near(centroid(ring)) || underground(t)) continue;
      const g = ring.map(G), a = polyArea(g);
      const mine = parts.filter(q => !q.parent && inside(q.c, g));
      if (mine.reduce((sum, q) => sum + q.a, 0) > 0.5 * a) {
        for (const q of mine) q.parent = t.building;
        continue;
      }
      addBuilding(wy, t, g, t.building);
      continue;
    }

    const hwy = t.highway;
    if (hwy in ROAD_WIDTH && t.area !== 'yes') {
      const ns = wy.nodes.map(String).filter(i => P.has(i));
      const bridge = bridgeType(t, A.bridges), prof = ns.length >= 2 ? profile(ns, bridge, t.name) : [];
      const q = prof.map(G);
      if (q.length >= 2 && q.some(([x, z]) => near([(x + cx) / S, (z + cz) / S]))) {
        const road = { w: r1((bridge?.width ?? ROAD_WIDTH[hwy]) * S), foot: PAVED_FOOT.has(hwy), p: flat(q) };
        // bridges and the climb onto them: a height for every point
        if (prof.some(v => v[2] > 0.04)) road.y = prof.map(v => r1(v[2] * S));
        if (bridge) road.br = bridge.code;
        if (SETT.has(t.surface)) road.c = 1;
        else if (SLABS.has(t.surface)) road.c = 2;
        if (t.name) {
          // street names by number, for the street sign when riding about freely
          if (!out.names.includes(t.name)) out.names.push(t.name);
          road.n = out.names.indexOf(t.name);
        }
        // closed to cars: nobody parked, no traffic
        if (!road.foot && carFree(t, A.car_free)) road.nc = 1;
        else if (ONEWAY.has(t.oneway) && !road.foot) {
          // one-way: a narrower street, with cars parked along both kerbs
          road.one = 1;
          road.w = r1(Math.min(ROAD_WIDTH[hwy], 5.5) * S);
        }
        out.roads.push(road);
      }
      continue;
    }

    // tram tracks, over the bridges too
    if (t.railway === 'tram') {
      const ns = wy.nodes.map(String).filter(i => P.has(i));
      const prof = ns.length >= 2 ? profile(ns, bridgeType(t, A.bridges), t.name) : [];
      const q = prof.map(G);
      if (q.length >= 2 && q.some(([x, z]) => near([(x + cx) / S, (z + cz) / S]))) {
        const tram = { p: flat(q) };
        if (prof.some(v => v[2] > 0.04)) tram.y = prof.map(v => r1(v[2] * S));
        (out.trams ??= []).push(tram);
      }
      continue;
    }

    const ww = { canal: 26, river: 30, stream: 3, ditch: 1.6 }[t.waterway];
    if (ww && !closed) {
      const q = pts(wy).map(G);
      if (q.length >= 2) out.water.push({ w: r1(ww * S), p: flat(q) });
      continue;
    }

    if (!closed || ring.length < 3 || !ring.some(near)) continue;
    let kind = null;
    if (t.natural === 'water' || t.water || t.waterway === 'riverbank') kind = 'water';
    else if (t.leisure === 'pitch') kind = 'pitch';
    else if (t.leisure === 'playground') kind = 'sand';
    else if (t.amenity === 'parking' || (hwy === 'pedestrian' && t.area === 'yes')) kind = 'paved';
    else if (t.landuse === 'allotments') kind = 'allotments';
    else if (Object.entries(GREEN).some(([k, v]) => v.has(t[k]))) kind = WOODED.some(([k, v]) => t[k] === v) ? 'wood' : 'green';
    if (kind) out.areas.push({ k: kind, p: flat(ring.map(G)) });
  }
  // the sea along the coast, out to a little beyond the box
  const [bx0, bz1] = project({ lat: s, lon: w }), [bx1, bz0] = project({ lat: n, lon: e });
  for (const poly of sea(ways, P, [bx0 - 200, bz0 - 200, bx1 + 200, bz1 + 200])) out.areas.push({ k: 'water', sea: 1, p: flat(poly.map(G)) });

  // church parts are stone like their church; tall parts of anything else are towers too
  const STONE = new Set(['church', 'cathedral', 'chapel']);
  // A part never floats: where OSM maps the top of a tower but not what holds it up (common in New
  // York), its base comes down onto the highest part or building below it, or onto the ground.
  const drawn = parts.filter(q => q.parent || parseFloat(q.t.height) >= 20);
  const under = out.buildings.map(b => ({ g: Array.from({ length: b.p.length / 2 }, (_, i) => [b.p[2 * i], b.p[2 * i + 1]]), top: b.h != null ? b.h / S : b.f * 3 }));
  for (const q of drawn) {
    const base = parseFloat(q.t.min_height);
    if (!(base > 0)) continue;
    const below = [
      ...drawn.filter(o => o !== q && !(parseFloat(o.t.min_height) >= base) && inside(q.c, o.g)).map(o => parseFloat(o.t.height)),
      ...under.filter(o => inside(q.c, o.g)).map(o => o.top),
    ].filter(top => top <= base + 0.5);
    const top = Math.max(0, ...below);
    if (top < base - 2) q.t = { ...q.t, min_height: String(top) };
  }
  for (const q of drawn) {
    addBuilding(q.wy, q.t, q.g, STONE.has(q.parent) || parseFloat(q.t.height) >= 20 ? 'part' : q.parent);
  }

  for (const [k, v] of nodes) {
    if (v.tags?.natural === 'tree' && P.has(k) && near(P.get(k))) {
      const q = G(P.get(k));
      if (routeDist(q) > hw + 1.5) out.trees.push(r1(q[0]), r1(q[1]));
    }
  }
  for (const wy of ways) {
    if (tag(wy).natural !== 'tree_row') continue;
    const q = pts(wy).map(G);
    for (let j = 0; j + 1 < q.length; j++) {
      const a = q[j], b = q[j + 1], L = dist(a, b);
      for (let i = 0; i <= Math.trunc(L / 7); i++) {
        const f = (i * 7) / Math.max(L, 1), p = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
        if (routeDist(p) > hw + 1.5) out.trees.push(r1(p[0]), r1(p[1]));
      }
    }
  }

  // how high the route runs at each point, where it goes over a bridge, and whether it is
  // cobbled (1) or paved in slabs (2): from the stretch of the street it is on
  const hgrid = new Map();
  for (const rd of out.roads) {
    if ((!rd.y && !rd.c) || rd.n == null) continue;
    for (let k = 0; k + 1 < rd.p.length / 2; k++) {
      const a = [rd.p[2 * k], rd.p[2 * k + 1]], b = [rd.p[2 * k + 2], rd.p[2 * k + 3]];
      addTo(hgrid, a, b, [a, b, rd.y?.[k] ?? 0, rd.y?.[k + 1] ?? 0, out.names[rd.n], rd.c ?? 0]);
    }
  }
  if (hgrid.size) {
    loops.forEach((l, li) => {
      const on = l.loop.map((q, i) => {
        const gx = Math.floor(q[0] / 40), gz = Math.floor(q[1] / 40), name = l.route[l.street[i]];
        let best = null, bd = 6;
        for (let a = gx - 1; a <= gx + 1; a++) {
          for (let b = gz - 1; b <= gz + 1; b++) {
            for (const sg of hgrid.get(cellKey(a, b)) ?? []) {
              if (sg[4] !== name) continue;
              const d = segDist(q, sg[0], sg[1]);
              if (d < bd) { bd = d; best = sg; }
            }
          }
        }
        if (!best) return [0, 0];
        const [a, b, ha, hb, , c] = best, L = dist(a, b) || 1;
        const f = Math.max(0, Math.min(1, ((q[0] - a[0]) * (b[0] - a[0]) + (q[1] - a[1]) * (b[1] - a[1])) / (L * L)));
        return [ha + (hb - ha) * f, c];
      });
      if (on.some(([h]) => h > 0.05)) out.routes[li].rise = on.map(([h]) => r1(h));
      if (on.some(([, c]) => c)) out.routes[li].sett = on.map(([, c]) => c);
    });
  }

  out.zone = flat(zone.map(G));
  // streets lined with shops, cafés and restaurants (scattered among the houses)
  out.shopStreets = (A.shop_streets ?? []).filter(nm => out.names.includes(nm)).map(nm => out.names.indexOf(nm));
  // each route's length, and its one-way stretches as fractions of a lap
  const routeInfo = loops.map((l, i) => {
    let length = 0;
    l.loop.forEach((p, k) => { if (k + 1 < l.loop.length || !l.open) length += dist(p, l.loop[(k + 1) % l.loop.length]); });
    const runs = [];
    let start = null;
    [...l.oneway, 0].forEach((f, k) => {
      if (f && start == null) start = k;
      else if (!f && start != null) { runs.push([start / l.loop.length, k / l.loop.length]); start = null; }
    });
    return { id: routes[i].id, length, oneway: runs };
  });
  return {
    map: out,
    info: { routes: routeInfo, buildings: out.buildings.length, measured: out.buildings.filter(b => b.e != null).length, dropped, shops: `${shops.filter(sh => sh.used).length} of ${shops.length}`, roads: out.roads.length, areas: out.areas.length, water: out.water.length, trams: out.trams?.length ?? 0, stepped: out.buildings.filter(b => b.sg).length, cobbled: out.roads.filter(r => r.c).length, carFree: out.roads.filter(r => r.nc).length, trees: out.trees.length / 2 },
  };
}

function roundHalfEven(x) {
  const f = Math.floor(x), d = x - f;
  if (d > 0.5) return f + 1;
  if (d < 0.5) return f;
  return f % 2 === 0 ? f : f + 1;
}
