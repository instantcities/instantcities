// The action button (touch screens): over the jump button, the one thing there is to do where you
// stand, and only while there is one: go in through the door you are by, back out of the building, or
// look at the painting before you full screen (game/artview.js). A tap does it (indoors.js doorAction).
// On a keyboard the door card in the middle of the screen says the same, with its key.

import { t_, $ } from './base.js';
import { ICONS } from './icons.js';

const el = $('tAction');
let now = null;

// kind: 'enter' | 'exit' | 'view', or null for nothing to do
export function showAction(kind) {
  if (kind === now || !el) return;
  now = kind;
  el.classList.toggle('show', !!kind);
  if (!kind) return;
  el.querySelector('.ico').innerHTML = ICONS[kind];
  el.querySelector('small').textContent = t_(`action.${kind}`);
  el.setAttribute('aria-label', t_(`action.${kind}`));
}
