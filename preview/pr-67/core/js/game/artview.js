// The famous pieces in the buildings, up close: standing before one (inside/artlist.js, from
// _data/art.json), the door card says which it is and the item key, a click on the card or the
// touch screen's action button (action.js) shows its photo full screen, with its title, its
// painter and a link to its page on the site. Any key, a tap or ✕ puts it away.

import { ART } from '../inside/artlist.js';
import { t_ } from './base.js';
import { sfx } from '../sound.js';

const IMG = new URL('/assets/img/art/', import.meta.url);
const FACING = Math.cos((55 * Math.PI) / 180); // how far to one side of it you may look and still be before it

// the piece a rider stands before in the building they are in, if any: near where you would stand
// to see it (its view) or close up to it, and facing it; not from the next room, through a wall
export function artBy(r) {
  const room = r.room;
  if (!room) return null;
  let best = null, bd = Infinity;
  const fx = Math.sin(r.yaw), fz = Math.cos(r.yaw);
  for (const a of ART) {
    if (a.museum !== room.id || !a.photo) continue;
    const [sx, sz, tx, tz] = a.view, x = room.x + tx, z = room.z + tz;
    const dx = x - r.pos.x, dz = z - r.pos.z, d = Math.hypot(dx, dz);
    const fromStand = Math.hypot(room.x + sx - r.pos.x, room.z + sz - r.pos.z), far = Math.hypot(tx - sx, tz - sz);
    if ((d > 6 && fromStand > Math.max(5, 0.6 * far)) || d < 0.01 || (dx * fx + dz * fz) / d < FACING) continue;
    if (d < bd) { best = a; bd = d; }
  }
  return best;
}

let el = null, shown = null, at = 0;
export const artOpen = () => !!shown;

function build() {
  el = document.createElement('div');
  el.id = 'artview';
  el.className = 'hidden';
  el.innerHTML = '<button class="art-x" type="button" aria-label="Close">✕</button><img alt=""><div class="art-cap"><b></b><span></span><a class="chip" target="_blank" rel="noopener"></a></div>';
  document.body.appendChild(el);
  // a tap anywhere but on the link puts it away; nothing goes through to the steering under it
  el.addEventListener('pointerdown', e => e.stopPropagation());
  el.addEventListener('click', e => { if (!e.target.closest('a') && performance.now() - at > 350) closeArt(); }); // (not the tap that opened it)
  addEventListener('keydown', e => {
    if (!shown) return;
    // any key puts it away, and goes no further
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!e.repeat) closeArt();
  }, true);
}

export function showArt(a) {
  if (!el) build();
  shown = a;
  at = performance.now();
  const img = el.querySelector('img');
  img.src = new URL(`${a.id}.jpg`, IMG).href;
  img.alt = a.title;
  el.querySelector('b').textContent = a.title;
  el.querySelector('span').textContent = [a.artist, a.date, a.room].filter(Boolean).join(' · ');
  const more = el.querySelector('a');
  more.href = `/preview/pr-67/art/${a.id}/`;
  more.textContent = t_('art.more');
  el.classList.remove('hidden');
  sfx.ui();
}

export function closeArt() {
  if (!shown) return;
  shown = null;
  el.classList.add('hidden');
}

