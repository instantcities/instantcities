// Shared by exploring and tour cards. Match stable ids or any of the card's translated names.
import { INFO_PAGES } from './info-pages.js';
import { ART, MUSEUM_PAGES } from './inside/artlist.js';
const key = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
export function infoPage(city, card) {
  if (!card) return '';
  if (card.page) return card.page;
  const pages = INFO_PAGES[city] ?? {};
  if (card.inside) {
    const b = card.inside, x = card.x - b.x, z = card.z - b.z;
    let best = null, distance = card.r + 3;
    for (const a of ART) {
      if (a.museum !== b.id) continue;
      const d = Math.hypot(a.view[2] - x, a.view[3] - z);
      if (d < distance) { best = a; distance = d; }
    }
    if (best) return `/preview/pr-98/art/${best.id}/`;
    return MUSEUM_PAGES[b.id] || pages[key(b.id)] || '';
  }
  for (const name of [card.id, ...Object.values(card.text ?? {}).map(t => t.name)].filter(Boolean)) {
    if (pages[key(name)]) return pages[key(name)];
  }
  return '';
}
