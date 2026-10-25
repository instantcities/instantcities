// A city's sights, for the cards that show while exploring (<city>/sights.js), from the places in
// _data/landmarks/<city>.json: the lat/lon goes through the city's map to game metres, the blurb is
// the card's text. Run `node tools/sights.mjs rome paris ...` (no names: every city with an empty
// SIGHTS in its city.js). Ghent and Lecce keep their own, hand-written sights.js.
import fs from 'node:fs';
import { mapCoords } from './mapcoords.mjs';

const R = 60; // game metres a rider has to be within
const cities = process.argv.slice(2);
if (!cities.length) {
  for (const d of fs.readdirSync('.')) {
    if (fs.existsSync(`${d}/city.js`) && /export const SIGHTS = \[\]/.test(fs.readFileSync(`${d}/city.js`, 'utf8'))) cities.push(d);
  }
}
for (const city of cities) {
  const { game } = mapCoords(city, city);
  const marks = JSON.parse(fs.readFileSync(`_data/landmarks/${city}.json`, 'utf8')).filter(l => l.kind === 'place');
  const out = marks.map(l => {
    const [x, z] = game(l.lat, l.lon);
    return `  {\n    id: ${JSON.stringify(l.id)}, emoji: ${JSON.stringify(l.emoji)}, x: ${x.toFixed(1)}, z: ${z.toFixed(1)}, r: ${R},\n` +
      `    text: { en: { name: ${JSON.stringify(l.name)}, text: ${JSON.stringify(l.blurb)} } },\n  },`;
  });
  fs.writeFileSync(`${city}/sights.js`,
    `// ${city[0].toUpperCase() + city.slice(1)}'s sights: ride up to one while exploring and a card tells you what you are looking at.\n` +
    `// Made by tools/sights.mjs from _data/landmarks/${city}.json; { id, emoji, x, z (game metres), r (how close), text: { <lang>: { name, text } } }.\n` +
    `export const SIGHTS = [\n${out.join('\n')}\n];\n`);
  const f = `${city}/city.js`;
  let src = fs.readFileSync(f, 'utf8');
  if (/export const SIGHTS = \[\]/.test(src)) {
    src = src.replace(/export const SIGHTS = \[\], /, `export { SIGHTS } from './sights.js';\nexport const `);
    fs.writeFileSync(f, src);
  }
  console.log(city, marks.length, marks.map(l => game(l.lat, l.lon).map(Math.round).join(',')).join(' '));
}
