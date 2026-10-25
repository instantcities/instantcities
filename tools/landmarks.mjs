#!/usr/bin/env node
// Each city's landmark pages on the site, /<city>/landmark/<id>/, from _data/landmarks/<city>.json
// (_layouts/landmark.html draws them): one little index.html per landmark, saying which it is and,
// for one with a lat and lon inside the city's map, where it lies in the game (x, z), so its page can
// drop you there (/<city>/play/?pos=x,z). Pages of landmarks no longer in the list are removed.
//
//     node tools/landmarks.mjs            # every city with a _data/landmarks/<city>.json
//     node tools/landmarks.mjs venice
//
// A landmark: { id, name, local? (its name in the city's language, where that differs), emoji,
// kind ('place' | 'vehicle' | 'food' | 'tradition' | 'thing'), lat?, lon?, sight? (the id of the
// game's sight card, for ?at=), image? (a path on the site), blurb (a line or two, on the city's
// page), text (paragraphs), and optionally history (paragraphs), dates ([when, what]) and visit
// (paragraphs) }.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapCoords } from './mapcoords.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, '_data', 'landmarks');
const cities = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(DATA).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));

for (const city of cities) {
  const list = JSON.parse(fs.readFileSync(path.join(DATA, city + '.json'), 'utf8'));
  const dir = path.join(ROOT, city), out = path.join(dir, 'landmark');
  const { game, area } = fs.existsSync(path.join(dir, 'map.js')) ? mapCoords(dir, city) : {};
  // only a landmark inside the map can be ridden to (the Sagrada Família lies outside Barcelona's)
  const onMap = l => area && l.lat != null && l.lon != null && l.lat > area.bbox[0] && l.lat < area.bbox[2] && l.lon > area.bbox[1] && l.lon < area.bbox[3];
  const ids = new Set();
  for (const l of list) {
    if (!/^[a-z0-9-]+$/.test(l.id)) throw new Error(`${city}: landmark id "${l.id}" is not a-z, 0-9 and -`);
    if (ids.has(l.id)) throw new Error(`${city}: landmark id "${l.id}" twice`);
    ids.add(l.id);
    const front = ['---', 'layout: landmark', `city: ${city}`, `landmark: ${l.id}`];
    if (onMap(l)) {
      const [x, z] = game(l.lat, l.lon);
      front.push(`x: ${Math.round(x)}`, `z: ${Math.round(z)}`);
    }
    fs.mkdirSync(path.join(out, l.id), { recursive: true });
    fs.writeFileSync(path.join(out, l.id, 'index.html'), front.join('\n') + '\n---\n');
  }
  for (const old of fs.existsSync(out) ? fs.readdirSync(out) : []) {
    if (!ids.has(old)) fs.rmSync(path.join(out, old), { recursive: true });
  }
  console.error(`${city}: ${list.length} landmarks`);
}
