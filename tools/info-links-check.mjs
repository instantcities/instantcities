#!/usr/bin/env node
// Audit all game info cards without starting WebGL. Optional URL checks the built website too.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
if (process.argv[2] === '--city') {
  const { standIns } = await import('./nothree.mjs');
  standIns(process.argv[3]);
  const C = await import('../core/js/city.js');
  const { infoPage } = await import('../core/js/info-links.js');
  const cards = C.SIGHTS.map(s => ({ kind: 'sight', name: (s.text.en ?? s.text.nl).name, href: infoPage(C.ID, s) }));
  for (const s of C.TOUR?.stops ?? []) cards.push({ kind: 'tour', name: (s.text?.en ?? s.text?.nl)?.name ?? s.sight,
    href: (s.sight && infoPage(C.ID, C.SIGHTS.find(c => c.id === s.sight))) || infoPage(C.ID, s) || s.link?.en || s.link?.nl || '' });
  console.log(JSON.stringify(cards));
} else {
  let total = 0, missing = 0;
  const { ART } = await import('../core/js/inside/artlist.js');
  const urls = new Set();
  for (const city of fs.readdirSync(root).filter(c => fs.existsSync(new URL(`${c}/city.js`, root)))) {
    const cards = JSON.parse(execFileSync(process.execPath, [fileURLToPath(import.meta.url), '--city', city], { encoding: 'utf8' }));
    total += cards.length;
    for (const c of cards) {
      if (!c.href) { missing++; console.log(`NO PAGE: ${city} / ${c.kind} / ${c.name}`); continue; }
      urls.add(c.href);
      const [pathname, hash] = c.href.split('#');
      if (pathname.startsWith('/') && !fs.existsSync(new URL(`.${pathname}index.html`, root))) throw new Error(`Missing page: ${c.href}`);
      if (hash) {
        const id = pathname.split('/')[2];
        const places = JSON.parse(fs.readFileSync(new URL(`_data/site_places/${id}.json`, root)));
        if (!places.some(p => p.id === hash)) throw new Error(`Missing place: ${c.href}`);
      }
    }
  }
  for (const a of ART.filter(a => a.photo)) {
    const href = `/art/${a.id}/`;
    if (!fs.existsSync(new URL(`.${href}index.html`, root))) throw new Error(`Missing artwork page: ${href}`);
    total++; urls.add(href);
  }
  if (process.argv[2]) for (const href of urls) {
    const response = await fetch(new URL(href, process.argv[2]));
    if (!response.ok) throw new Error(`${response.status}: ${href}`);
    if (href.includes('#') && !(await response.text()).includes(`id="${href.split('#')[1]}"`)) throw new Error(`Missing rendered anchor: ${href}`);
  }
  console.log(`${total} cards; ${total - missing} linked; ${missing} without a matching page; ${urls.size} distinct destinations verified.`);
}
