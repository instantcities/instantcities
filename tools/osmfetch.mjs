// Downloading OpenStreetMap data, for js/osmbuild.js. Works in the browser and in Node 18+.
// Overpass first (one request, only the kinds of things the game draws); when it is busy, the main
// OSM API in tiles. Both allow requests from a web page.
import { fromElements, routeBounds, MapError } from './osmbuild.mjs';

const OVERPASS = 'https://overpass-api.de/api/interpreter';
const OSM_API = 'https://api.openstreetmap.org/api/0.6/map.json';
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const HEADERS = typeof window === 'undefined' ? { 'User-Agent': 'instant-gent map tool' } : {};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function overpass(query, tries = 2, wait = 25000) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      // a busy server can keep a request hanging: give up after a while and fall back
      const res = await fetch(OVERPASS, { method: 'POST', headers: HEADERS, body: new URLSearchParams({ data: query }), signal: AbortSignal.timeout(wait) });
      const text = await res.text();
      if (res.ok && text.startsWith('{')) return JSON.parse(text).elements;
      last = new Error(`overpass ${res.status}`);
    } catch (e) {
      last = e;
    }
    if (i + 1 < tries) await sleep(2000); // the server is shared and often busy: try once more
  }
  throw last;
}

// A city or town by name: { name, areaId (for Overpass), bbox: [s, w, n, e], center: [lat, lon] }.
export async function findCity(name) {
  const url = `${NOMINATIM}?format=json&limit=5&q=${encodeURIComponent(name)}`;
  const hits = await (await fetch(url, { headers: HEADERS })).json();
  const hit = hits.find(h => h.osm_type === 'relation') ?? hits[0];
  if (!hit) return null;
  const [s, n, w, e] = hit.boundingbox.map(Number);
  return { name: hit.display_name, areaId: hit.osm_type === 'relation' ? 3600000000 + Number(hit.osm_id) : null, bbox: [s, w, n, e], center: [Number(hit.lat), Number(hit.lon)] };
}

const quote = s => s.replace(/[\\"]/g, '\\$&');
const regex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Just the named streets inside a city, with their nodes: enough to find the race loop.
export async function fetchStreets(city, names) {
  const where = city.areaId ? '(area.a)' : `(${city.bbox.join(',')})`;
  const pre = city.areaId ? `area(id:${city.areaId})->.a;` : '';
  const q = `[out:json][timeout:60];${pre}way["highway"]["name"~"^(${names.map(n => quote(regex(n))).join('|')})$"]${where};(._;>;);out body qt;`;
  return fromElements(await overpass(q));
}

// Where a race route lies: the bbox [s, w, n, e] around its loop, `margin` metres wider. Asks
// Overpass for just the route streets; when it is busy, Nominatim street by street, then the
// whole area around them.
export async function locateRoute(cityName, route, margin, onProgress = () => {}) {
  onProgress('city');
  const city = await findCity(cityName);
  if (!city) throw new MapError('city', [cityName]);
  onProgress('streets');
  try {
    return routeBounds(await fetchStreets(city, route), route, margin).bbox;
  } catch (e) {
    if (e instanceof MapError) throw e;
  }
  let box = null;
  const missing = [];
  for (const name of route) {
    const url = `${NOMINATIM}?format=json&limit=1&street=${encodeURIComponent(name)}&city=${encodeURIComponent(cityName)}`;
    const [hit] = await (await fetch(url, { headers: HEADERS })).json();
    await sleep(1000); // Nominatim asks for at most one request a second
    if (!hit) { missing.push(name); continue; }
    const [s, n, w, e] = hit.boundingbox.map(Number);
    box = box ? [Math.min(box[0], s), Math.min(box[1], w), Math.max(box[2], n), Math.max(box[3], e)] : [s, w, n, e];
  }
  if (missing.length) throw new MapError('missing', missing);
  if ((box[2] - box[0]) * 111 > 2.5 || (box[3] - box[1]) * 70 > 2.5) throw new MapError('big', route);
  const data = await fetchArea(box, onProgress);
  return routeBounds(data, route, margin).bbox;
}

// Everything the game draws inside a bounding box [s, w, n, e].
export async function fetchArea(bbox, onProgress = () => {}) {
  const b = bbox.join(',');
  const kinds = ['"building"', '"building:part"', '"highway"', '"waterway"', '"natural"', '"landuse"', '"leisure"', '"water"', '"amenity"="parking"', '"railway"="tram"'];
  // and the shops, cafés and restaurants, which are mostly points
  const places = `node[shop](${b});node[amenity~"^(restaurant|cafe|pub|bar|biergarten|fast_food|ice_cream|pharmacy)$"](${b});`;
  // and the multipolygons among them: some towns map most of their buildings that way
  const q = `[out:json][timeout:120];(${kinds.map(k => `way[${k}](${b});relation[${k}][type=multipolygon](${b});`).join('')}node[natural=tree](${b});${places});(._;>;);out body qt;`;
  try {
    onProgress('overpass');
    return fromElements(await overpass(q, 1, 40000));
  } catch {
    return fetchTiles(bbox, onProgress);
  }
}

// The main API caps the size of one request, so ask in tiles of about 400 m.
async function fetchTiles([s, w, n, e], onProgress) {
  const ky = Math.max(1, Math.ceil((n - s) / 0.0036)), kx = Math.max(1, Math.ceil((e - w) / 0.0057));
  const els = new Map();
  for (let i = 0; i < ky; i++) {
    for (let j = 0; j < kx; j++) {
      onProgress('tiles', i * kx + j + 1, kx * ky);
      const a = s + ((n - s) * i) / ky, b = s + ((n - s) * (i + 1)) / ky;
      const c = w + ((e - w) * j) / kx, d = w + ((e - w) * (j + 1)) / kx;
      const res = await fetch(`${OSM_API}?bbox=${c.toFixed(5)},${a.toFixed(5)},${d.toFixed(5)},${b.toFixed(5)}`, { headers: HEADERS });
      if (!res.ok) throw new Error(`osm api ${res.status}`);
      for (const el of (await res.json()).elements) els.set(el.type + el.id, el);
    }
  }
  return fromElements(els.values());
}
