#!/usr/bin/env node
// The pictures of a quality tour (the game with ?shots=<metres>, see .claude/skills/quality-tour),
// laid out to look through: tools/cache/tourshots/<city>/index.html, one row per picture with where
// it was taken, the street, and what the real place looks like there: links to Mapillary and Google
// Street View at the spot the camera looked at, and with MAPILLARY_TOKEN set (or in .env), Mapillary's nearest
// photos of it beside the game's.
//
//     node tools/tourshots.mjs ghent
//
// Also prints the rows as text (number, path metres, street, game x/z, lat/lon looked at), for
// going through them without a browser.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
try { process.loadEnvFile(path.join(HERE, '..', '.env')); } catch {} // MAPILLARY_TOKEN, kept out of git
const city = process.argv[2];
const DIR = path.join(HERE, 'cache', 'tourshots', city ?? '');
if (!city || !fs.existsSync(path.join(DIR, 'shots.jsonl'))) {
  console.error('usage: node tools/tourshots.mjs <city>   (after a round of /<city>/?shots=60 on serve.py)');
  process.exit(1);
}
const { latLon } = mapCoords(path.join(HERE, '..', city), city);
const shots = fs.readFileSync(path.join(DIR, 'shots.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l)).sort((a, b) => a.i - b.i);

// what the camera looked at: where its line of sight meets the ground, at most 60 m off (it often
// looks along a street, or up at a tower)
function target(s) {
  const d = s.dy < -0.02 ? Math.min(60, s.y / -s.dy) : 40;
  return [s.x + s.dx * d, s.z + s.dz * d];
}

const TOKEN = process.env.MAPILLARY_TOKEN;
async function mapillary(lat, lon) {
  if (!TOKEN) return [];
  const r = 0.0003; // about 30 m
  const url = `https://graph.mapillary.com/images?access_token=${TOKEN}&fields=id,thumb_1024_url,captured_at&limit=3&bbox=${lon - r},${lat - r},${lon + r},${lat + r}`;
  try {
    const res = await fetch(url);
    return res.ok ? (await res.json()).data ?? [] : [];
  } catch { return []; }
}

const rows = [];
for (const s of shots) {
  const [tx, tz] = target(s);
  const [lat, lon] = latLon(tx, tz).map(v => +v.toFixed(6));
  const heading = Math.round(((Math.atan2(s.dx, -s.dz) * 180) / Math.PI + 360) % 360); // -z is north
  const real = await mapillary(lat, lon);
  rows.push({ ...s, lat, lon, heading, real });
  console.log(`${s.file}  ${String(s.s).padStart(5)} m  ${(s.name || '-').padEnd(24)}  game ${s.x},${s.z} h${s.y}  looks at ${lat},${lon} (${heading}°)${real.length ? `  mapillary ${real.length}` : ''}`);
}

const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const html = `<!doctype html><meta charset="utf-8"><title>Quality tour: ${esc(city)}</title>
<style>body{font:14px system-ui;margin:16px;background:#f4f1ea}.r{display:flex;gap:10px;margin-bottom:14px;align-items:flex-start}
.r img{width:480px;max-width:48vw;border-radius:6px}.real img{width:240px}b{font-size:16px}a{margin-right:8px}</style>
<h1>Quality tour: ${esc(city)} (${rows.length} pictures)</h1>
${rows.map(r => `<div class="r" id="${r.i}"><img src="${r.file}" loading="lazy"><div><b>${esc(r.file)} · ${r.s} m · ${esc(r.name || '')}</b><br>
game ${r.x}, ${r.z} (height ${r.y}) · looks at ${r.lat}, ${r.lon}, ${r.heading}°<br>
<a href="https://www.mapillary.com/app/?lat=${r.lat}&lng=${r.lon}&z=19" target="_blank">Mapillary</a>
<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${r.lat},${r.lon}&heading=${r.heading}" target="_blank">Street View</a>
<a href="http://localhost:8321/${city}/play/?pos=${Math.round(r.x)},${Math.round(r.z)}" target="_blank">ride there</a>
<div class="real">${r.real.map(m => `<a href="https://www.mapillary.com/app/?pKey=${m.id}" target="_blank"><img src="${m.thumb_1024_url}" loading="lazy"></a>`).join('')}</div></div></div>`).join('\n')}`;
fs.writeFileSync(path.join(DIR, 'index.html'), html);
console.log(`\n${path.relative(process.cwd(), path.join(DIR, 'index.html'))}${TOKEN ? '' : '  (no MAPILLARY_TOKEN: links only, no Mapillary photos)'}`);
