// Pompeii's columns and the stone lying about them: fluted shafts of stuccoed tufa and travertine in
// warm browns, built of drums that are not quite one colour, some standing under their capital,
// some broken off, and the drums, blocks and pedestals fallen or left where they stood.
import * as THREE from 'three';

const SHAFTS = ['#a98c6a', '#b79a77', '#9c8264', '#bfa583', '#a88a68', '#94795c'];
const STONES = ['#9a8b74', '#b3a285', '#8a7d68', '#c1b08f', '#a89878'];

// a shaft r thick at the foot, h high, with 20 flutes (every second corner of its 40 pulled in)
const fluted = (r0, r1, h) => {
  const g = new THREE.CylinderGeometry(r1, r0, h, 40, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = Math.round((Math.atan2(p.getZ(i), p.getX(i)) / (2 * Math.PI)) * 40);
    if (k % 2) { p.setX(i, p.getX(i) * 0.93); p.setZ(i, p.getZ(i) * 0.93); }
  }
  return g;
};

// A column at (x, z): h high to its capital (the shaft alone if the capital is false, as when it
// has been broken off), r thick at the foot. Its drums, a metre or so each, are in different tones.
export function column(kit, x, z, h, r, { capital = h > 4, rnd = Math.random, y0 = 0, tone = SHAFTS[Math.floor(rnd() * SHAFTS.length)] } = {}) {
  const drum = 1.1 + rnd() * 0.5, c = new THREE.Color(tone);
  kit.box(r * 2.5, 0.35, r * 2.5, STONES[Math.floor(rnd() * STONES.length)], x, y0 + 0.17, z); // the base
  const top = y0 + h, span = Math.max(h, 1);
  for (let y = y0 + 0.35; y < top - 0.05; y += drum) {
    const d = Math.min(drum, top - y);
    const tint = c.clone().offsetHSL((rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.08, (rnd() - 0.5) * 0.07);
    kit.add(fluted(r * (1 - 0.18 * ((y - y0) / span)), r * (1 - 0.18 * ((y + d - y0) / span)), d), tint, x, y + d / 2, z, (rnd() - 0.5) * 0.02, rnd() * 6, 0);
  }
  if (capital) {
    kit.add(new THREE.CylinderGeometry(r * 1.3, r * 0.82, 0.7, 12), '#d0b88e', x, top + 0.35, z);
    kit.box(r * 2.9, 0.4, r * 2.9, '#c9b48e', x, top + 0.9, z);
  } else if (rnd() < 0.5) { // a broken top: a stub leaning off it
    kit.box(r * 1.2, 0.25 + rnd() * 0.35, r * 0.9, tone, x + r * 0.3, top + 0.1, z, 0, rnd() * 3);
  }
}

// a lone drum lying on its side, a block or two beside it
export function fallen(kit, x, z, rnd, scale = 1) {
  const kind = rnd();
  if (kind < 0.4) {
    const r = (0.4 + rnd() * 0.15) * scale, l = 0.6 + rnd() * 0.9;
    kit.add(fluted(r, r * 0.95, l), SHAFTS[Math.floor(rnd() * SHAFTS.length)], x, r * 0.9, z, 0, rnd() * 6, Math.PI / 2);
  } else {
    const w = (0.5 + rnd() * 0.9) * scale, h = (0.3 + rnd() * 0.5) * scale, d = (0.4 + rnd() * 0.7) * scale;
    kit.box(w, h, d, STONES[Math.floor(rnd() * STONES.length)], x, h / 2 - 0.03, z, (rnd() - 0.5) * 0.15, rnd() * 3, (rnd() - 0.5) * 0.15);
  }
}

// a low stone pedestal for a statue that is gone
export function pedestal(kit, x, z, turn, rnd) {
  const h = 0.9 + rnd() * 0.7, w = 1.5 + rnd() * 0.5, c = STONES[Math.floor(rnd() * STONES.length)];
  kit.box(w + 0.3, 0.25, w + 0.3, c, x, 0.12, z, 0, turn);
  kit.box(w, h, w, c, x, h / 2 + 0.25, z, 0, turn);
  kit.box(w + 0.3, 0.2, w + 0.3, '#c1b08f', x, h + 0.35, z, 0, turn);
}
