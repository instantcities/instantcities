#!/usr/bin/env node
// Photos of a landmark or a house front, to draw its facade by hand from (<city>/facades.js
// and fronts.js): from Wikimedia Commons (the pictures taken near it, and those its name finds) and
// from Mapillary (street-level photos looking straight at it), into tools/cache/photos/<id>/.
//
//     node tools/photos.mjs ghent belfort                  # a landmark in landmarks.json
//     node tools/photos.mjs ghent graslei-15 spijker       # fronts in fronts.js, by their id
//     node tools/photos.mjs ghent korenmarkt-7 --at 51.05473,3.72083 --search "Korenmarkt 7 Gent"
//
// --at lat,lon      where it stands, for an id that is not in landmarks.json or fronts.js
// --search "..."    what to look for on Commons (default: its name, or its id as an address, + city)
// --category "..."  a Commons category to take the pictures from as well (without "Category:")
// --n 8             how many photos to keep from each source
//
// Mapillary needs a free access token (mapillary.com/dashboard/developers) in MAPILLARY_TOKEN;
// without it only Commons is asked. Each folder gets a sources.json with the author, licence and
// link of every photo, for the credits.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const MAPILLARY = 'https://graph.mapillary.com/images';
const HEADERS = { 'User-Agent': 'instant-gent photo tool (https://github.com/woutersmet/instant-gent)' };

const args = process.argv.slice(2), opts = {}, ids = [];
for (let k = 0; k < args.length; k++) {
  if (args[k].startsWith('--')) opts[args[k].slice(2)] = args[++k];
  else ids.push(args[k]);
}
const [city, ...targets] = ids;
const DIR = path.join(HERE, '..', city ?? '');
if (!city || !targets.length || !fs.existsSync(path.join(DIR, 'area.json'))) {
  console.error('usage: node tools/photos.mjs <city> <id>... [--at lat,lon] [--search "..."] [--category "..."] [--n 8]');
  process.exit(1);
}
const N = Number(opts.n ?? 8);
const { area, latLon } = mapCoords(DIR, city);

// ------------------------------------------------------------------ where each target stands

const conf = fs.existsSync(path.join(DIR, 'landmarks.json')) ? JSON.parse(fs.readFileSync(path.join(DIR, 'landmarks.json'), 'utf8')) : { landmarks: [] };
const frontsSrc = fs.existsSync(path.join(DIR, 'fronts.js')) ? fs.readFileSync(path.join(DIR, 'fronts.js'), 'utf8') : '';

// A front's { name, at } from its line in fronts.js (read as text: the file needs three.js)
function front(id) {
  const line = frontsSrc.split('\n').find(l => l.includes(`id: '${id}'`));
  const at = line?.match(/at: \[(-?[\d.]+), (-?[\d.]+)\]/);
  if (!at) return null;
  return { name: line.match(/name: (['"])(.*?)\1/)?.[2], at: latLon(Number(at[1]), Number(at[2])) };
}

// A landmark's middle, from the outlines of its OSM ways (the map's cache, else the OSM API)
async function landmark(id) {
  const lm = conf.landmarks.find(l => l.id === id);
  if (!lm) return null;
  const cache = path.join(HERE, 'cache', city + '.json');
  const osm = fs.existsSync(cache) ? JSON.parse(fs.readFileSync(cache, 'utf8')) : { ways: [], nodes: {} };
  const ways = new Map(osm.ways.map(w => [w.id, w]));
  const pts = [];
  for (const wid of lm.osm) {
    const w = ways.get(wid);
    if (w) { pts.push(...w.nodes.map(n => [osm.nodes[n].lat, osm.nodes[n].lon])); continue; }
    const file = path.join(HERE, 'cache', 'osm-ways', `${wid}.json`);
    if (!fs.existsSync(file)) {
      const res = await fetch(`https://api.openstreetmap.org/api/0.6/way/${wid}/full.json`, { headers: HEADERS });
      if (!res.ok) throw new Error(`OSM way ${wid}: ${res.status}`);
      const els = (await res.json()).elements, nodes = new Map(els.filter(e => e.type === 'node').map(e => [e.id, e]));
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(els.find(e => e.type === 'way').nodes.map(n => [nodes.get(n).lat, nodes.get(n).lon])));
    }
    pts.push(...JSON.parse(fs.readFileSync(file, 'utf8')));
  }
  const at = [0, 1].map(k => pts.reduce((a, p) => a + p[k], 0) / pts.length);
  // how far its walls reach from the middle, so Mapillary looks wide enough around a big one
  const reach = Math.max(...pts.map(p => dist(at, p)));
  return { name: lm.name, at, reach };
}

// "graslei-15" -> "Graslei 15"
const address = id => id.replace(/-(\d+)$/, ' $1').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());

// ------------------------------------------------------------------ geometry on the ground

const R = 6371000, rad = d => (d * Math.PI) / 180;
function dist([la1, lo1], [la2, lo2]) {
  const x = rad(lo2 - lo1) * Math.cos(rad((la1 + la2) / 2)), y = rad(la2 - la1);
  return Math.hypot(x, y) * R;
}
// compass bearing from a to b, degrees clockwise from north
function bearing([la1, lo1], [la2, lo2]) {
  const x = rad(lo2 - lo1) * Math.cos(rad((la1 + la2) / 2)), y = rad(la2 - la1);
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
}
const turn = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

// ------------------------------------------------------------------ Wikimedia Commons

async function commons(params) {
  const url = `${COMMONS}?${new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'imageinfo|coordinates', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '1600', colimit: 'max', ...params })}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  return (await res.json()).query?.pages ?? [];
}

async function fromCommons(t) {
  const strip = s => (s ?? '').replace(/<[^>]+>/g, '').trim();
  const found = [];
  const add = (pages, why) => {
    for (const p of pages) {
      const ii = p.imageinfo?.[0];
      if (!ii || !/jpeg|png/.test(ii.mime) || found.some(f => f.title === p.title)) continue;
      if (Math.min(ii.width, ii.height) < 600) continue;
      const m = ii.extmetadata ?? {}, c = p.coordinates?.[0];
      if (Number(strip(m.DateTimeOriginal?.value).match(/\b(1[5-9]|20)\d\d\b/)?.[0] ?? 2000) < 1990) continue; // old postcards: the fronts have changed
      found.push({
        source: 'commons', why, title: p.title, url: ii.thumburl ?? ii.url, page: ii.descriptionurl,
        author: strip(m.Artist?.value), licence: strip(m.LicenseShortName?.value), date: strip(m.DateTimeOriginal?.value).slice(0, 10),
        metres: c ? Math.round(dist(t.at, [c.lat, c.lon])) : null,
      });
    }
  };
  if (t.category) add(await commons({ generator: 'categorymembers', gcmtitle: `Category:${t.category}`, gcmtype: 'file', gcmlimit: '50' }), 'category');
  add(await commons({ generator: 'search', gsrsearch: `${t.search} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '20' }), 'search');
  add(await commons({ generator: 'geosearch', ggscoord: t.at.join('|'), ggsradius: String(Math.round(40 + t.reach)), ggsnamespace: '6', ggslimit: '50' }), 'nearby');
  // the category and the name first, in their own order; then what was taken nearest
  const rank = f => (f.why === 'nearby' ? 1e6 + (f.metres ?? 1e5) : 0);
  return found.map((f, k) => ({ f, k })).sort((a, b) => rank(a.f) - rank(b.f) || a.k - b.k).map(x => x.f);
}

// ------------------------------------------------------------------ Mapillary

// Street-level photos from 4 to 60 m off (more for a big landmark) whose camera looks at the target,
// best first: looking straight at it, close, recent; at most two from one drive or walk.
async function fromMapillary(t) {
  const token = process.env.MAPILLARY_TOKEN;
  if (!token) return null;
  const far = 60 + t.reach, dLat = far / 111320, dLon = far / (111320 * Math.cos(rad(t.at[0])));
  const bbox = [t.at[1] - dLon, t.at[0] - dLat, t.at[1] + dLon, t.at[0] + dLat].map(v => v.toFixed(6)).join(',');
  const url = `${MAPILLARY}?${new URLSearchParams({ bbox, limit: '2000', fields: 'id,thumb_2048_url,computed_geometry,computed_compass_angle,captured_at,is_pano,sequence,creator' })}`;
  const res = await fetch(url, { headers: { ...HEADERS, Authorization: `OAuth ${token}` } });
  if (!res.ok) throw new Error(`Mapillary ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const seen = new Map(), out = [];
  const shots = (await res.json()).data
    .filter(i => !i.is_pano && i.computed_geometry && i.computed_compass_angle != null && i.thumb_2048_url)
    .map(i => {
      const cam = [i.computed_geometry.coordinates[1], i.computed_geometry.coordinates[0]];
      const d = dist(cam, t.at), off = turn(bearing(cam, t.at), i.computed_compass_angle);
      const years = (Date.now() - i.captured_at) / 3.15e10;
      return { i, d, off, score: off / 25 + d / far + years / 8 };
    })
    .filter(s => s.d >= 4 && s.d <= far && s.off <= 25)
    .sort((a, b) => a.score - b.score);
  for (const s of shots) {
    const n = seen.get(s.i.sequence) ?? 0;
    if (n >= 2) continue;
    seen.set(s.i.sequence, n + 1);
    out.push({
      source: 'mapillary', title: s.i.id, url: s.i.thumb_2048_url, page: `https://www.mapillary.com/app/?pKey=${s.i.id}`,
      author: s.i.creator?.username ?? '', licence: 'CC BY-SA 4.0', date: new Date(s.i.captured_at).toISOString().slice(0, 10),
      metres: Math.round(s.d), off: Math.round(s.off),
    });
  }
  return out;
}

// ------------------------------------------------------------------ each target

for (const id of targets) {
  const t = { id, reach: 0, ...(opts.at ? { at: opts.at.split(',').map(Number) } : (await landmark(id)) ?? front(id) ?? {}) };
  if (!t.at) { console.error(`${id}: not in landmarks.json or fronts.js, give --at lat,lon`); process.exitCode = 1; continue; }
  t.search = opts.search ?? `${t.name ?? address(id)} ${area.city}`;
  t.category = opts.category;
  const dir = path.join(HERE, 'cache', 'photos', id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const mapillary = await fromMapillary(t);
  const picked = [...(await fromCommons(t)).slice(0, N), ...(mapillary ?? []).slice(0, N)];
  const kept = [];
  for (const [k, p] of picked.entries()) {
    const file = `${String(k + 1).padStart(2, '0')}-${p.source}.jpg`;
    const res = await fetch(p.url, { headers: HEADERS });
    if (!res.ok) { console.error(`  ${p.title}: ${res.status}`); continue; }
    fs.writeFileSync(path.join(dir, file), Buffer.from(await res.arrayBuffer()));
    const { url, ...rest } = p;
    kept.push({ file, ...rest });
  }
  fs.writeFileSync(path.join(dir, 'sources.json'), JSON.stringify({ id, name: t.name, at: t.at.map(v => +v.toFixed(6)), search: t.search, photos: kept }, null, 2) + '\n');
  const count = s => kept.filter(p => p.source === s).length;
  console.log(`${id}: ${count('commons')} from Commons, ${mapillary ? count('mapillary') + ' from Mapillary' : 'Mapillary skipped (no MAPILLARY_TOKEN)'} -> ${path.relative(process.cwd(), dir)}/`);
  for (const p of kept) console.log(`  ${p.file}  ${p.source === 'commons' ? p.title.replace(/^File:/, '') : `${p.metres} m, ${p.off}° off`}  ${p.date}`);
}
