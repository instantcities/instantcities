#!/usr/bin/env node
// A street's house fronts and the photos to draw them from, in one go: finds every building along
// a street of the map (<city>/map.js), the edge of each that looks onto the street, and
// pulls the Mapillary photos that look straight at it into tools/streets/<city>/<street>/ (street.json is checked in;
// the photos are not, past the streets done before that: .gitignore).
//
//     node tools/street.mjs ghent Sint-Baafsplein
//     node tools/street.mjs ghent Veldstraat --n 3 --reach 14
//     node tools/street.mjs ghent korenmarkt              # a spot of spots.json (the top places, by id)
//
// --n 3        photos kept per front
// --reach 14   how far from the street's middle line a front may stand, metres (beyond half its width;
//              a spot of spots.json can set its own)
// --dry        list the fronts only, no photos
//
// Where no flat photo looks at a front (a narrow street, driven down with a 360° camera), a view
// is cut out of the nearest panorama instead, level and 90° wide, square on to the front: it is
// kept as photos/<panorama id>-<compass>.jpg and shows up like any other photo.
//
// Writes street.json (the fronts: where, how wide, how tall, which way, and the photos that show
// each, with the slice of the photo it fills) and every photo once, as photos/<mapillary id>.jpg,
// 512 px (macOS sips scales them down; elsewhere they stay 1024 px). A photo that shows three
// houses in a row is kept once and listed for all three. facade-lab.html shows all of it. Needs
// MAPILLARY_TOKEN, a free access token from mapillary.com/dashboard/developers; the photos are
// CC BY-SA 4.0, with author and link in street.json for the credits.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { mapCoords } from './mapcoords.mjs';
import { readImage, writeJpeg, panoView } from './img.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
try { process.loadEnvFile(path.join(HERE, '..', '.env')); } catch {} // MAPILLARY_TOKEN, kept out of git
const HEADERS = { 'User-Agent': 'instant-gent street tool (https://github.com/woutersmet/instant-gent)' };
const args = process.argv.slice(2), opts = {}, ids = [];
for (let k = 0; k < args.length; k++) {
  if (args[k] === '--dry') opts.dry = true;
  else if (args[k].startsWith('--')) opts[args[k].slice(2)] = args[++k];
  else ids.push(args[k]);
}
const [city, ...nameParts] = ids, street = nameParts.join(' ');
const DIR = path.join(HERE, '..', city ?? '');
if (!city || !street || !fs.existsSync(path.join(DIR, 'area.json'))) {
  console.error('usage: node tools/street.mjs <city> <street name> [--n 3] [--reach 14] [--dry]');
  process.exit(1);
}
const N = Number(opts.n ?? 3);
const { MAP, S, latLon } = mapCoords(DIR, city);
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ------------------------------------------------------------------ the fronts along the street

// a spot of <city>/spots.json (an id: one or more streets), else a street by its name
const spotsFile = path.join(DIR, 'spots.json');
const spot = fs.existsSync(spotsFile) ? JSON.parse(fs.readFileSync(spotsFile, 'utf8')).spots.find(s => s.id === slug(street)) : null;
const streetNames = spot ? spot.streets : [street];
// a square needs a longer reach than a street: a spot can say how far ("reach": 30)
const REACH = Number(opts.reach ?? spot?.reach ?? 14);
const nameIdx = new Set(streetNames.map(s => MAP.names.findIndex(n => slug(n) === slug(s))));
if (nameIdx.has(-1)) { console.error(`no street "${streetNames[[...nameIdx].indexOf(-1)]}" in the map of ${city}`); process.exit(1); }
const roads = MAP.roads.filter(r => nameIdx.has(r.n));

function nearestOnSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
  return [ax + t * dx, az + t * dz];
}
// the closest point of the street's lines to (x, z): { d, x, z, w }
function onStreet(x, z) {
  let best = null;
  for (const r of roads) for (let k = 0; k + 3 < r.p.length; k += 2) {
    const [qx, qz] = nearestOnSegment(x, z, r.p[k], r.p[k + 1], r.p[k + 2], r.p[k + 3]), d = Math.hypot(qx - x, qz - z);
    if (!best || d < best.d) best = { d, x: qx, z: qz, w: r.w };
  }
  return best;
}

const centroid = p => { let x = 0, z = 0; for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; } return [+((2 * x) / p.length).toFixed(1), +((2 * z) / p.length).toFixed(1)]; };
const fronts = [];
for (const [bi, b] of MAP.buildings.entries()) {
  const p = b.p, n = p.length / 2;
  if (n < 3) continue;
  let sign = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) sign += p[2 * j] * p[2 * i + 1] - p[2 * i] * p[2 * j + 1];
  let best = null;
  for (let k = 0; k < n; k++) {
    const ax = p[2 * k], az = p[2 * k + 1], bx = p[((k + 1) % n) * 2], bz = p[((k + 1) % n) * 2 + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 3.5) continue;
    const nx = (sign > 0 ? bz - az : az - bz) / L, nz = (sign > 0 ? ax - bx : bx - ax) / L; // outwards
    const mx = (ax + bx) / 2, mz = (az + bz) / 2, s = onStreet(mx, mz);
    if (!s || s.d > s.w / 2 + REACH) continue;
    // the wall must look at the street, not away from it or along it
    const cos = ((s.x - mx) * nx + (s.z - mz) * nz) / (s.d || 1);
    if (cos < 0.6) continue;
    const score = L - s.d * 0.1; // the longest wall looking at the street is the front
    if (!best || score > best.score) best = { score, ax, az, bx, bz, L, nx, nz, mx, mz, d: s.d };
  }
  if (!best) continue;
  const east = Math.atan2(best.nz, best.nx) * 180 / Math.PI; // faces: degrees, 0 east, 90 south (game z runs south)
  fronts.push({
    mapIndex: bi, at: [best.mx, best.mz], centre: centroid(p), width: +best.L.toFixed(1), faces: Math.round((east + 360) % 360), toStreet: +best.d.toFixed(1),
    floors: b.f ?? null, eaves: b.e || null, top: b.t ?? null, kind: b.k, ring: b.p,
  });
}
// walk them along the street, one side then the other, so the ids read like a house row
const alongKey = f => { const s = onStreet(f.at[0], f.at[1]); return s ? Math.round(s.x / 6) * 6 + s.z * 1e-6 : 0; };
fronts.sort((a, b) => a.faces - b.faces || alongKey(a) - alongKey(b) || a.at[0] - b.at[0]);
const sideOf = f => Math.round(f.faces / 45) % 8;
const counts = {};
for (const f of fronts) {
  const s = sideOf(f); counts[s] = (counts[s] ?? 0) + 1;
  f.id = `${slug(street)}-${f.faces}-${String(counts[s]).padStart(2, '0')}`;
  f.latLon = latLon(f.at[0], f.at[1]).map(v => +v.toFixed(6));
}
console.log(`${street}: ${roads.length} road pieces, ${fronts.length} fronts`);
if (!fronts.length) process.exit(1);

// ------------------------------------------------------------------ geometry on the ground

const R = 6371000, rad = d => (d * Math.PI) / 180;
function dist([la1, lo1], [la2, lo2]) {
  const x = rad(lo2 - lo1) * Math.cos(rad((la1 + la2) / 2)), y = rad(la2 - la1);
  return Math.hypot(x, y) * R;
}
function bearing([la1, lo1], [la2, lo2]) {
  const x = rad(lo2 - lo1) * Math.cos(rad((la1 + la2) / 2)), y = rad(la2 - la1);
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
}
const turn = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
// compass bearing of a front's outward normal (faces: 0 east, 90 south)
const normalBearing = f => (90 + f.faces) % 360;

const dir = path.join(HERE, 'streets', city, slug(street));
if (opts.dry) {
  for (const f of fronts) console.log(`  ${f.id}  ${f.width} m wide, ${f.floors ?? '?'} floors, ${f.toStreet} m from the street, ${f.latLon.join(',')}`);
  process.exit(0);
}

// ------------------------------------------------------------------ Mapillary, once for the street

const token = process.env.MAPILLARY_TOKEN;
if (!token) { console.error('MAPILLARY_TOKEN is not set (free token: mapillary.com/dashboard/developers)'); process.exit(1); }
const lats = fronts.map(f => f.latLon[0]), lons = fronts.map(f => f.latLon[1]);
const pad = 0.0004, tiles = [];
// Mapillary refuses a big bbox: ask in squares of about 0.002 degrees (150 m)
for (let la = Math.min(...lats) - pad; la < Math.max(...lats) + pad; la += 0.002)
  for (let lo = Math.min(...lons) - pad; lo < Math.max(...lons) + pad; lo += 0.002) tiles.push([lo, la, lo + 0.002, la + 0.002]);
const shots = new Map(), panos = new Map();
for (const bbox of tiles) {
  const url = `https://graph.mapillary.com/images?${new URLSearchParams({ bbox: bbox.map(v => v.toFixed(6)).join(','), limit: '2000', fields: 'id,thumb_1024_url,thumb_2048_url,computed_geometry,computed_compass_angle,captured_at,is_pano,sequence,creator,camera_parameters,width,height' })}`;
  const res = await fetch(url, { headers: { ...HEADERS, Authorization: `OAuth ${token}` } });
  if (!res.ok) { console.error(`Mapillary ${res.status}: ${(await res.text()).slice(0, 200)}`); process.exit(1); }
  for (const i of (await res.json()).data) {
    if (!i.computed_geometry || i.computed_compass_angle == null) continue;
    if (i.is_pano) { if (i.thumb_2048_url) panos.set(i.id, i); } else if (i.thumb_1024_url) shots.set(i.id, i);
  }
}
console.log(`${shots.size} Mapillary photos and ${panos.size} panoramas in the area`);

// For each front: 4 to 45 m off, the camera looking at its middle (within 22°) and looking against
// its normal (the wall faces the camera, within 40°), so the front is seen from the front. A photo
// the street already has counts as a bit worse, so the neighbours get another angle where there is one.
const used = new Set();
function pick(f) {
  const out = [], seen = new Map();
  const scored = [...shots.values()].map(i => {
    const cam = [i.computed_geometry.coordinates[1], i.computed_geometry.coordinates[0]];
    const d = dist(cam, f.latLon), off = turn(bearing(cam, f.latLon), i.computed_compass_angle);
    const square = turn((i.computed_compass_angle + 180) % 360, normalBearing(f));
    const years = (Date.now() - i.captured_at) / 3.15e10;
    return { i, d, off, square, score: off / 22 + square / 40 + d / 45 + years / 8 + (used.has(i.id) ? 0.5 : 0) };
  }).filter(s => s.d >= 4 && s.d <= 45 && s.off <= 22 && s.square <= 40).sort((a, b) => a.score - b.score);
  for (const s of scored) {
    const c = seen.get(s.i.sequence) ?? 0;
    if (c >= 1) continue; // one per drive or walk: different positions teach more
    seen.set(s.i.sequence, c + 1);
    out.push(s);
    used.add(s.i.id);
    if (out.length >= N) break;
  }
  return out;
}

// No flat photo of a front: the panoramas 3 to 25 m off that see it most square on, one per drive,
// the newest first among the about equally good. The view is cut looking straight at its middle.
function pickPanos(f) {
  const out = [], seen = new Set();
  const scored = [...panos.values()].map(i => {
    const cam = [i.computed_geometry.coordinates[1], i.computed_geometry.coordinates[0]];
    const d = dist(cam, f.latLon), look = bearing(cam, f.latLon), square = turn((look + 180) % 360, normalBearing(f));
    const years = (Date.now() - i.captured_at) / 3.15e10;
    return { i, d, look, off: 0, square, score: square / 30 + d / 25 + years / 8 };
  }).filter(s => s.d >= 3 && s.d <= 25 && s.square <= 45).sort((a, b) => a.score - b.score);
  for (const s of scored) {
    if (seen.has(s.i.sequence)) continue;
    seen.add(s.i.sequence);
    out.push(s);
    if (out.length >= N) break;
  }
  return out;
}
const PANO_FOCAL = 0.5; // a 90° view: the focal length is half its width
const panoCache = path.join(HERE, 'cache', 'panos');
const panoImages = new Map();
async function panoImage(i) {
  if (panoImages.has(i.id)) return panoImages.get(i.id);
  fs.mkdirSync(panoCache, { recursive: true });
  const file = path.join(panoCache, `${i.id}.jpg`);
  if (!fs.existsSync(file)) {
    const res = await fetch(i.thumb_2048_url, { headers: HEADERS });
    if (!res.ok) return null;
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const img = readImage(file);
  if (panoImages.size > 8) panoImages.delete(panoImages.keys().next().value); // they are big: keep a few
  panoImages.set(i.id, img);
  return img;
}

// Which slice of the photo the front fills, left to right as 0..1 of its width: its two ends, turned
// into the camera's view (Mapillary's focal length is a fraction of the photo's longer side)
function span(f, i, compass = i.computed_compass_angle, focal0 = null) {
  const t = [-Math.sin(rad(f.faces)), Math.cos(rad(f.faces))], cam = [i.computed_geometry.coordinates[1], i.computed_geometry.coordinates[0]];
  const focal = focal0 ?? (i.camera_parameters?.[0] ?? 0.85) * Math.max(i.width ?? 4, i.height ?? 3) / (i.width ?? 4);
  const us = [-1, 1].map(k => {
    const end = latLon(f.at[0] + (k * f.width / 2) * t[0], f.at[1] + (k * f.width / 2) * t[1]);
    const a = ((bearing(cam, end) - compass + 540) % 360) - 180;
    return Math.min(1, Math.max(0, 0.5 + focal * Math.tan(rad(Math.max(-80, Math.min(80, a))))));
  }).sort((p, q) => p - q);
  return us.map(u => +u.toFixed(3));
}

const pdir = path.join(dir, 'photos'), photos = {};
fs.mkdirSync(pdir, { recursive: true });
let small = true;
for (const f of fronts) {
  f.photos = [];
  for (const s of pick(f)) {
    const id = s.i.id, file = path.join(pdir, `${id}.jpg`);
    if (!photos[id] && !fs.existsSync(file)) {
      const res = await fetch(s.i.thumb_1024_url, { headers: HEADERS });
      if (!res.ok) continue;
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      if (small) try { execFileSync('sips', ['-Z', '512', '-s', 'format', 'jpeg', '-s', 'formatOptions', '50', file, '--out', file], { stdio: 'ignore' }); }
      catch { small = false; console.log('  (no sips: photos stay 1024 px)'); }
    }
    photos[id] ??= {
      file: `photos/${id}.jpg`, page: `https://www.mapillary.com/app/?pKey=${id}`, author: s.i.creator?.username ?? '',
      licence: 'CC BY-SA 4.0', date: new Date(s.i.captured_at).toISOString().slice(0, 10),
      // where it was taken from and which way it looks: lat, lon, compass degrees, focal (of the width)
      cam: [...s.i.computed_geometry.coordinates.slice().reverse().map(v => +v.toFixed(7)), Math.round(s.i.computed_compass_angle), +((s.i.camera_parameters?.[0] ?? 0.85) * Math.max(s.i.width ?? 4, s.i.height ?? 3) / (s.i.width ?? 4)).toFixed(3)],
    };
    f.photos.push({ id, metres: Math.round(s.d), off: Math.round(s.off), span: span(f, s.i) });
  }
  if (!f.photos.length) for (const s of pickPanos(f)) {
    const look = Math.round(s.look), id = `${s.i.id}-${look}`, file = path.join(pdir, `${id}.jpg`);
    if (!photos[id] && !fs.existsSync(file)) {
      const img = await panoImage(s.i);
      if (!img) continue;
      writeJpeg(panoView(img, s.i.computed_compass_angle, look), file, 50);
    }
    photos[id] ??= {
      file: `photos/${id}.jpg`, page: `https://www.mapillary.com/app/?pKey=${s.i.id}`, author: s.i.creator?.username ?? '',
      licence: 'CC BY-SA 4.0', date: new Date(s.i.captured_at).toISOString().slice(0, 10), pano: true,
      cam: [...s.i.computed_geometry.coordinates.slice().reverse().map(v => +v.toFixed(7)), look, PANO_FOCAL],
    };
    f.photos.push({ id, metres: Math.round(s.d), off: 0, span: span(f, s.i, look, PANO_FOCAL) });
  }
  console.log(`  ${f.id}  ${f.width} m, ${f.floors ?? '?'} fl.  ${f.photos.length} photos`);
}
// photos of an earlier run that no front picks any more
for (const name of fs.readdirSync(pdir)) if (!photos[name.replace(/\.jpg$/, '')]) fs.rmSync(path.join(pdir, name));
console.log(`${Object.keys(photos).length} photos for ${fronts.filter(f => f.photos.length).length} of ${fronts.length} fronts`);
fs.writeFileSync(path.join(dir, 'street.json'), JSON.stringify({ city, street, slug: slug(street), photos, fronts }, null, 1) + '\n');
// the lab lists the streets it finds
const idx = path.join(HERE, 'streets', city, 'index.json');
const known = new Set(fs.existsSync(idx) ? JSON.parse(fs.readFileSync(idx, 'utf8')) : []);
known.add(slug(street));
fs.writeFileSync(idx, JSON.stringify([...known].sort()));
console.log(`-> ${path.relative(process.cwd(), dir)}/street.json`);
