// The Rudolfinum (Zítek and Schulz, 1885), the concert hall and gallery on the Vltava at náměstí
// Jana Palacha, modelled by hand in place of the map's block of it and its parts, from its
// measurements and photos, in game metres (the real ones times 1.25), on the map's outlines: a
// Neo-Renaissance block of sandstone 57 m by 95 m, its cornice at 18 m.
//   the rusticated ground floor, the tall arched windows of the main floor between Corinthian
//     pilasters, the small windows over them, the cornice and the balustrade on top with the statues
//     of composers and artists
//   the pavilions at the corners and in the middle of each side, an attic higher, under low roofs
//   the gallery's top-lit halls in the middle, their glass roofs, and the Dvořák Hall at the south
//     end rising over the rest, its rounded end to the square
// The model's own metres: +v runs south along the river to the square, +u east, away from the river.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wall, sweep, archRing } from '../core/js/arcade.js';
import { outlines, buildings, mid, inside, local, sides, prism, roof, shrink } from './outline.js';

const X = -231.6, Z = -303.3, TURN = -0.27; // the middle of the map's outline, and its sides turned from east
const MAIN = outlines('civic', -234.9, -295.7, 4)[0] ?? [];
const PARTS = MAIN.length ? buildings('part', X, Z, 70).filter(b => inside(mid(b.p), MAIN)) : []; // the pavilions and halls on it, with their heights
const CORNICE = 22.5;
const STONE = '#dccda7', STONE2 = '#cdbc93', RUSTIC = '#c1b08a', DARK = '#2d2c2a', ROOF = '#5b6661', GLASS = '#9fb3b8';

function figure(kit, x, y, z, h, hex = '#e4dac3') {
  kit.add(new THREE.CylinderGeometry(h * 0.15, h * 0.22, h * 0.8, 7), hex, x, y + h * 0.4, z);
  kit.add(new THREE.SphereGeometry(h * 0.12, 7, 5), hex, x, y + h * 0.88, z);
}

// the fronts along a ring's sides: the ground floor, the main floor, the storey over it, the
// cornice and the balustrade with its statues (from y0, `tall` for the halls rising over the roof)
function fronts(kit, ring, { y0 = 0, top = CORNICE, statues = true, tall = false } = {}) {
  for (const path of sides(ring, 3)) {
    const len = path.length, n = Math.max(1, Math.round(len / 4.4)), bay = len / n;
    if (!tall) {
      // the rusticated ground floor, its joints, and the string course over it
      wall(kit, path, [[0, 0], [len, 0], [len, 7], [0, 7]], { o0: 0, o1: 0.25, hex: RUSTIC });
      for (const y of [1.8, 3.6, 5.4]) wall(kit, path, [[0, y], [len, y], [len, y + 0.12], [0, y + 0.12]], { o0: 0.25, o1: 0.28, hex: STONE2 });
      sweep(kit, path, 0, len, [[-0.1, 7], [0.55, 7], [0.55, 7.7], [-0.1, 7.7]], STONE2, { step: len });
    }
    for (let k = 0; k < n; k++) {
      const s = (k + 0.5) * bay;
      if (!tall) {
        wall(kit, path, [[s - 0.8, 2], [s + 0.8, 2], [s + 0.8, 5.4], [s - 0.8, 5.4]], { o0: 0.25, o1: 0.32, hex: DARK });
        // the main floor's arched window in its frame, the small one over it
        if (bay > 3) {
          wall(kit, path, archRing(s, 2.4, 8.3, 15.2, 10), { o0: 0, o1: 0.12, hex: STONE2 });
          wall(kit, path, archRing(s, 1.8, 8.6, 14.7, 10), { o0: 0, o1: 0.2, hex: DARK });
          wall(kit, path, [[s - 1.4, 8], [s + 1.4, 8], [s + 1.4, 8.3], [s - 1.4, 8.3]], { o0: 0, o1: 0.45, hex: STONE2 });
          wall(kit, path, [[s - 0.8, 16.8], [s + 0.8, 16.8], [s + 0.8, 19], [s - 0.8, 19]], { o0: 0, o1: 0.2, hex: DARK });
        }
      } else if (bay > 3) wall(kit, path, archRing(s, 1.8, y0 + 1.2, top - 2, 10), { o0: 0, o1: 0.2, hex: DARK });
      // the pilasters between the windows, with their capitals
      const p0 = tall ? y0 : 7.7, p1 = top - 2.2;
      for (const ps of k ? [k * bay] : [0.35, ...(n === 1 ? [len - 0.35] : [])]) {
        const at = Math.min(Math.max(ps, 0.35), len - 0.35);
        wall(kit, path, [[at - 0.35, p0], [at + 0.35, p0], [at + 0.35, p1], [at - 0.35, p1]], { o0: 0, o1: 0.3, hex: STONE2 });
        wall(kit, path, [[at - 0.5, p1 - 0.6], [at + 0.5, p1 - 0.6], [at + 0.5, p1], [at - 0.5, p1]], { o0: 0, o1: 0.45, hex: STONE2 });
      }
      if (k === n - 1 && n > 1) wall(kit, path, [[len - 0.7, p0], [len, p0], [len, p1], [len - 0.7, p1]], { o0: 0, o1: 0.3, hex: STONE2 });
    }
    // the entablature and cornice, and the balustrade on it
    sweep(kit, path, 0, len, [[-0.1, top - 2.2], [0.4, top - 2.2], [0.4, top - 0.7], [0.9, top - 0.4], [0.9, top], [-0.1, top]], STONE2, { step: len });
    // (the balusters a dark band behind the rail, between posts)
    wall(kit, path, [[0, top + 0.4], [len, top + 0.4], [len, top + 1.2], [0, top + 1.2]], { o0: 0.2, o1: 0.35, hex: '#8f8268' });
    for (const [y0, y1] of [[top, top + 0.4], [top + 1.2, top + 1.6]]) wall(kit, path, [[0, y0], [len, y0], [len, y1], [0, y1]], { o0: 0.2, o1: 0.6, hex: STONE });
    for (let k = 0, m = Math.max(1, Math.round(len / 2.6)); k <= m; k++) {
      const s = Math.min(Math.max((k * len) / m, 0.25), len - 0.25);
      wall(kit, path, [[s - 0.25, top + 0.4], [s + 0.25, top + 0.4], [s + 0.25, top + 1.2], [s - 0.25, top + 1.2]], { o0: 0.2, o1: 0.6, hex: STONE });
    }
    if (statues && len > 9) for (let s = len / 4; s < len - 1; s += len / 4) {
      const p = path.at(s);
      figure(kit, p.x + 0.4 * p.tz, top + 1.6, p.z - 0.4 * p.tx, 2.3);
    }
  }
}

export function rudolfinum() {
  const kit = new Kit();
  const ring = local(MAIN, X, Z, TURN), parts = PARTS.map(b => ({ ring: local(b.p, X, Z, TURN), h: b.h ?? 27.5 }));
  prism(kit, ring, 0, CORNICE, STONE);
  prism(kit, shrink(ring, 0.03), CORNICE, CORNICE + 0.4, ROOF);
  fronts(kit, ring);
  for (const { ring: r, h } of parts) {
    if (h < 30) {
      // a pavilion: an attic over the cornice, its own little cornice and a low roof
      prism(kit, r, CORNICE, h - 2, STONE);
      for (const path of sides(r, 3)) sweep(kit, path, 0, path.length, [[-0.1, h - 3], [0.6, h - 2.6], [0.6, h - 2], [-0.1, h - 2]], STONE2, { step: path.length });
      roof(kit, shrink(r, -0.03), shrink(r, 0.45), h - 2, h, ROOF);
    } else if (h < 35) {
      // a gallery hall, top-lit: its walls over the roof, a roof of glass
      prism(kit, r, CORNICE, h - 3.5, STONE);
      fronts(kit, r, { y0: CORNICE + 0.4, top: h - 3.5, statues: false, tall: true });
      roof(kit, shrink(r, -0.02), shrink(r, 0.3), h - 3.5, h - 0.3, ROOF, { cap: false });
      prism(kit, shrink(r, 0.3), h - 0.4, h - 0.2, GLASS);
    } else {
      // the Dvořák Hall: tall windows over the roof, and its hipped roof
      prism(kit, r, CORNICE, h - 6, STONE);
      fronts(kit, r, { y0: CORNICE + 0.4, top: h - 6, statues: true, tall: true });
      roof(kit, shrink(r, -0.02), shrink(r, 0.4), h - 6, h, ROOF);
    }
  }
  return kit.mesh(kitMat(0.86));
}

export const RUDOLFINUM = [{
  id: 'rudolfinum', name: 'Rudolfinum', x: X, z: Z, turn: TURN, reach: 220,
  area: [MAIN, ...PARTS.map(b => b.p)].filter(p => p.length), foot: MAIN.length ? [MAIN] : [],
  make: rudolfinum,
}];
