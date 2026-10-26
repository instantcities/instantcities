#!/usr/bin/env node
// The plan of each site for its page on the site (/sites/<id>/): a drawing of the game's own map
// with its sights marked by number, assets/maps/<id>.svg, and the sights as a list for the page
// to show beside it, _data/site_places/<id>.json (English: each { n, id, emoji, name, text, x, z }).
// Reads <id>/map.js and <id>/sights.js for each site in _data/sites.yml that has a game.
//
//     node tools/sitemap.mjs            # every site
//     node tools/sitemap.mjs pompeii
//
// Run it after changing a site's map or its sights; its output is checked in.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2)
  : [...fs.readFileSync(path.join(ROOT, '_data', 'sites.yml'), 'utf8').matchAll(/^- id: (\S+)$/gm)].map(m => m[1]).filter(id => fs.existsSync(path.join(ROOT, id, 'sights.js')));

const r1 = v => Math.round(v * 10) / 10;
const pts = (p, f) => { const out = []; for (let i = 0; i < p.length; i += 2) out.push(`${r1(f.x(p[i]))},${r1(f.z(p[i + 1]))}`); return out.join(' '); };

for (const id of ids) {
  const { MAP } = await import(path.join(ROOT, id, 'map.js'));
  const { SIGHTS } = await import(path.join(ROOT, id, 'sights.js'));
  // the view: the sights and a margin, 16 to 10
  const xs = SIGHTS.map(s => s.x), zs = SIGHTS.map(s => s.z);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  const pad = Math.max(60, 0.12 * Math.max(x1 - x0, z1 - z0));
  x0 -= pad; x1 += pad; z0 -= pad; z1 += pad;
  let w = x1 - x0, h = z1 - z0;
  if (w / h < 1.6) { const nw = h * 1.6; x0 -= (nw - w) / 2; w = nw; } else { const nh = w / 1.6; z0 -= (nh - h) / 2; h = nh; }
  const W = 1200, k = W / w, H = Math.round(h * k);
  const f = { x: v => (v - x0) * k, z: v => (v - z0) * k };
  const inView = p => { for (let i = 0; i < p.length; i += 2) if (p[i] > x0 - 50 && p[i] < x0 + w + 50 && p[i + 1] > z0 - 50 && p[i + 1] < z0 + h + 50) return true; return false; };
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" font-family="Inter, system-ui, sans-serif">\n<rect width="${W}" height="${H}" fill="#efe9dc"/>\n`;
  const fill = { green: '#c9dcb0', wood: '#b4cc9a', water: '#a9cbe3', sea: '#a9cbe3', paved: '#ddd3bd', sand: '#e6d5a8' };
  for (const a of MAP.areas ?? []) if (inView(a.p)) s += `<polygon points="${pts(a.p, f)}" fill="${fill[a.k] ?? '#e3dccb'}"/>\n`;
  for (const wt of MAP.water ?? []) if (inView(wt.p)) s += `<polyline points="${pts(wt.p, f)}" fill="none" stroke="#a9cbe3" stroke-width="${r1(Math.max(2, (wt.w ?? 4) * k))}" stroke-linecap="round"/>\n`;
  for (const rd of MAP.roads ?? []) if (inView(rd.p)) s += `<polyline points="${pts(rd.p, f)}" fill="none" stroke="${rd.foot ? '#d7cbb2' : '#ffffff'}" stroke-width="${r1(Math.max(1.5, rd.w * k * 1.1))}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
  for (const b of MAP.buildings ?? []) if (inView(b.p)) s += `<polygon points="${pts(b.p, f)}" fill="#cfa98a" stroke="#b78d6d" stroke-width="0.6"/>\n`;
  // the monuments' feet: what stands there (the stones, the walls), from <id>/city.js (needs three in node_modules)
  try {
    const { MONUMENTS } = await import(path.join(ROOT, id, 'city.js'));
    for (const mo of MONUMENTS ?? []) for (const ft of mo.foot ?? []) if (inView(ft)) s += `<polygon points="${pts(ft, f)}" fill="#8a8578" stroke="#6d695e" stroke-width="0.8"/>\n`;
  } catch (e) { console.error(`${id}: no monuments on the plan (${String(e.message).slice(0, 60)})`); }
  for (const rt of MAP.routes ?? []) s += `<polyline points="${rt.route.map(([x, z]) => `${r1(f.x(x))},${r1(f.z(z))}`).join(' ')}" fill="none" stroke="#c4402a" stroke-width="3" stroke-dasharray="9 6" stroke-linecap="round"/>\n`;
  SIGHTS.forEach((sg, i) => {
    const x = r1(f.x(sg.x)), z = r1(f.z(sg.z));
    s += `<g><circle cx="${x}" cy="${z}" r="15" fill="#1d1a17" stroke="#fff" stroke-width="2.5"/><text x="${x}" y="${z + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">${i + 1}</text></g>\n`;
  });
  s += '</svg>\n';
  fs.mkdirSync(path.join(ROOT, 'assets', 'maps'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'assets', 'maps', id + '.svg'), s);
  fs.mkdirSync(path.join(ROOT, '_data', 'site_places'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, '_data', 'site_places', id + '.json'), JSON.stringify(SIGHTS.map((sg, i) => ({ n: i + 1, id: sg.id, emoji: sg.emoji, name: sg.text.en.name, text: sg.text.en.text })), null, 1) + '\n');
  console.log(`${id}: ${SIGHTS.length} places, ${(s.length / 1024).toFixed(0)} KB`);
}
