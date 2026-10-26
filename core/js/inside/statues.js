// Statues for the museums, added to a Parts (gothic.js): the Venus de Milo, the Venus de' Medici,
// Michelangelo's David (out on Florence's Piazza della Signoria, florence/monuments.js), the Winged
// Victory of Samothrace on her ship's prow, a Roman marble of an athlete, a citizen in his toga or
// an emperor in his breastplate, and portrait busts: carved (sculpt.js), soft forms melted into one
// body and shaded smooth, in polished marble (p.sculpt). The colossal bust of Ramesses II, Nefertiti,
// a sarcophagus and the Pergamon Altar from plain shapes. Each stands at (x, y, z) with its feet at y
// (on a plinth: its height), facing ry (0: +z), `s` times life size in game metres; a figure's own
// left is +x.
import * as THREE from 'three';
import { carve, cone, egg, slab } from './sculpt.js';

const MARBLE = 0xf2eee4, SHADE = 0xe2dccd;
const lathe = (pts, n = 12) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n);

// a point of the figure, (dx, dy, dz) in its own metres, turned and put where it stands
const placer = (x, y, z, s, ry) => (dx, dy, dz = 0) => [x + (dx * Math.cos(ry) + dz * Math.sin(ry)) * s, y + dy * s, z + (-dx * Math.sin(ry) + dz * Math.cos(ry)) * s];

// a carved figure (its shapes in its own metres, carved once under `key`) put up at (x, y, z), s
// times its size, facing ry
const ROUGH = { step: 0.03 }; // the many lesser marbles, carved coarser: fewer triangles
function put(p, key, shapes, x, y, z, s, ry, color = MARBLE, opts) {
  p.sculpt.add(carve(key, shapes, opts).clone().scale(s, s, s), color, x, y, z, 0, ry, 0);
}

// ------------------------------------------------------------------ a body to carve

// A standing body from its joints ([x, y, z] in its own metres, about 1.75 tall): legs from hip to
// knee to ankle with their feet, a pelvis, waist, ribcage and shoulders that may each lean and tilt
// a little the other way from the hips (contrapposto), arms from shoulder to elbow to wrist (or a
// stump, or none), the neck and the head turned to look somewhere, hair.
//   o: { female, legs: { r: [hip, knee, ankle], l: [...] } (none under drapery), sway (the upper
//   body's lean, x), tilt (the shoulders' slope, + left up), arms: { r: [elbow, wrist, hand?] |
//   'stump', l }, look (the head's turn, + to its left), nod (+ down), hair: 'bun' | 'curls' | 'short',
//   head: false for none }
function bodyShapes(o) {
  const F = o.female, sw = o.sway ?? 0, out = [];
  const W = F ? 1 : 1.12; // a man's shoulders broader
  // the legs, the calves and the feet
  for (const [side, leg] of Object.entries(o.legs ?? {})) {
    if (!leg) continue;
    const [hip, knee, ankle] = leg;
    out.push(cone(hip, knee, F ? 0.095 : 0.09, 0.055), cone(knee, ankle, 0.056, 0.036));
    const calf = [knee[0] * 0.7 + ankle[0] * 0.3, knee[1] * 0.7 + ankle[1] * 0.3, knee[2] * 0.7 + ankle[2] * 0.3 - 0.012];
    out.push(egg(calf, [0.05, 0.11, 0.055]));
    out.push(slab([ankle[0], 0.03, ankle[2] + 0.06], [0.04, 0.025, 0.11], 0.02, 0.03, side === 'l' ? 0.12 : -0.12));
  }
  // the trunk: pelvis, waist, ribcage, shoulders, each with the sway
  const at = (x, y, z, k = 1) => [x + sw * k, y, z];
  out.push(egg(at(0, 0.95, -0.005, 0.2), F ? [0.175, 0.12, 0.125] : [0.16, 0.11, 0.115], 0.06));
  out.push(egg(at(0, 1.1, 0, 0.5), F ? [0.125, 0.12, 0.095] : [0.14, 0.13, 0.1], 0.07));
  out.push(egg(at(0, 1.26, -0.005, 0.8), [0.15 * W, 0.15, 0.105], 0.06));
  out.push(egg(at(0, 1.405, -0.01, 1), [0.19 * W, 0.06, 0.085], 0.05));
  if (F) for (const sd of [-1, 1]) out.push(egg(at(sd * 0.072, 1.285, 0.075, 0.85), [0.06, 0.056, 0.052], 0.035));
  else for (const sd of [-1, 1]) out.push(egg(at(sd * 0.075, 1.31, 0.065, 0.85), [0.085, 0.06, 0.04], 0.04));
  if (!F) out.push(egg(at(0, 1.13, 0.06, 0.5), [0.08, 0.1, 0.035], 0.04)); // his belly's muscles
  // the shoulders, sloping
  const ty = o.tilt ?? 0, sh = sd => at(sd * 0.185 * W, 1.405 + sd * ty, -0.01, 1);
  for (const sd of [-1, 1]) out.push(egg(sh(sd), [0.065, 0.06, 0.065], 0.05));
  // the arms
  for (const [side, arm] of Object.entries(o.arms ?? {})) {
    const sd = side === 'l' ? 1 : -1, s0 = sh(sd);
    if (!arm) continue;
    if (arm === 'stump') { out.push(cone(s0, [s0[0] + sd * 0.035, s0[1] - 0.1, s0[2] + 0.01], 0.052, 0.046)); continue; }
    const [el, wr, hand = true] = arm;
    out.push(cone(s0, el, 0.05, 0.04), cone(el, wr, 0.04, 0.028));
    if (hand) out.push(egg([wr[0] + (wr[0] - el[0]) * 0.25, wr[1] + (wr[1] - el[1]) * 0.25, wr[2] + (wr[2] - el[2]) * 0.25], [0.035, 0.055, 0.025], 0.03));
  }
  if (o.head === false) return out;
  // the neck and the head, the jaw, the nose and the brows the way it looks
  const lk = o.look ?? 0, nd = o.nod ?? 0, hx = sw + Math.sin(lk) * 0.01, hz = 0.015 + nd * 0.03;
  out.push(cone(at(0, 1.43, -0.005, 1), [hx, 1.565, hz * 0.6], 0.056, 0.048));
  const head = [hx, 1.645 - nd * 0.01, hz], fx = Math.sin(lk), fz = Math.cos(lk);
  out.push(egg(head, [0.088, 0.112, 0.102], 0.03, lk, nd));
  out.push(egg([head[0] + fx * 0.04, head[1] - 0.06, head[2] + fz * 0.04], [0.055, 0.04, 0.05], 0.03, lk));
  out.push(cone([head[0] + fx * 0.085, head[1] + 0.01, head[2] + fz * 0.085], [head[0] + fx * 0.103, head[1] - 0.025, head[2] + fz * 0.103], 0.01, 0.016, 0.012));
  for (const sd of [-1, 1]) out.push(egg([head[0] + fx * 0.07 + fz * sd * 0.032, head[1] + 0.022, head[2] + fz * 0.07 - fx * sd * 0.032], [0.022, 0.012, 0.012], 0.008, lk));
  // the hair
  const back = [head[0] - fx * 0.012, head[1] + 0.03, head[2] - fz * 0.012];
  out.push(egg(back, [0.091, 0.084, 0.099], 0.02, lk));
  if (o.hair === 'curls') {
    // the curls, in two rings round the crown, none over the face
    for (let q = 0; q < 16; q++) {
      const a = (q / 16) * Math.PI * 2 + lk, r = q % 2 ? 0.06 : 0.082, up = q % 2 ? 0.065 : 0.025;
      if (Math.cos(a - lk) > 0.75 && q % 2 === 0) continue;
      out.push(egg([back[0] + Math.sin(a) * r, back[1] + up, back[2] + Math.cos(a) * r], [0.034, 0.03, 0.034], 0.025));
    }
  } else if (o.hair === 'bun') {
    out.push(egg([head[0] - fx * 0.1, head[1] + 0.01, head[2] - fz * 0.1], [0.05, 0.045, 0.045], 0.02));
    out.push(cone([head[0] - fx * 0.03 - fz * 0.07, head[1] + 0.06, head[2] - fz * 0.03 + fx * 0.07], [head[0] - fx * 0.03 + fz * 0.07, head[1] + 0.06, head[2] - fz * 0.03 - fx * 0.07], 0.02, 0.02, 0.02)); // the band
  }
  return out;
}

// cloth falling from round a waist at height y0 (radius r0) to the ground (radius r1), in n folds;
// (dx, dz) where it hangs, top: how far below y0 the folds start
function drapery(y0, r0, r1, n, { dx = 0, dz = 0, top = 0.05 } = {}) {
  // (its foot flat on the ground: a round cone's end would be a ball under it)
  const out = [cone([dx, r1 * 0.8, dz], [dx, y0, dz], r1 * 0.8, r0 * 0.92, 0.08), slab([dx, 0.07, dz], [r1 * 0.95, 0.06, r1 * 0.9], 0.03, 0.08)];
  for (let q = 0; q < n; q++) {
    const a = (Math.PI * 2 * (q + 0.5)) / n, w = 0.035 + (q % 3) * 0.008;
    out.push(cone([dx + Math.sin(a) * r1, w * 1.4, dz + Math.cos(a) * r1], [dx + Math.sin(a) * r0 * 0.85, y0 - top, dz + Math.cos(a) * r0 * 0.85], w * 1.4, w * 0.7, 0.05));
  }
  return out;
}

// ------------------------------------------------------------------ the famous ones

// The Venus de Milo (c. 150–125 BC): her arms long gone, her weight on her right leg, the left knee
// pushing forward through the drapery slipping off her hips, her body turned and her head to her left
export function venusDeMilo(p, x, y, z, s = 2.5, ry = 0) {
  put(p, 'venus-de-milo', () => [
    ...bodyShapes({ female: true, sway: -0.02, tilt: -0.015, arms: { r: 'stump', l: [[0.25, 1.24, 0.03], [0.25, 1.24, 0.03], false] }, look: 0.35, nod: 0.1, hair: 'bun' }),
    // the drapery from the hips down, rolled at the top, the left knee forward under it
    ...drapery(0.86, 0.19, 0.3, 11, { dz: 0.01 }),
    egg([0.01, 0.88, 0.01], [0.2, 0.05, 0.14], 0.04, 0, 0.12),
    ...[...Array(9)].map((_, q) => { const a = (q / 9) * Math.PI * 2; return egg([Math.sin(a) * 0.17, 0.9 + Math.sin(a) * 0.04, Math.cos(a) * 0.12], [0.06, 0.04, 0.05], 0.03); }),
    cone([0.09, 0.85, 0.02], [0.12, 0.5, 0.17], 0.105, 0.085, 0.06),
    cone([0.12, 0.5, 0.17], [0.15, 0.1, 0.2], 0.08, 0.07, 0.05),
    slab([0.15, 0.04, 0.27], [0.045, 0.03, 0.09], 0.02, 0.02, 0.15), // her left foot, on a step
    slab([-0.1, 0.03, 0.22], [0.04, 0.025, 0.06], 0.02, 0.02, -0.2),
  ], x, y, z, s, ry);
}

// The Venus de' Medici (1st century BC): a nude Venus just out of the sea, covering herself with her
// hands, her head turned to her left, a dolphin beside her left leg holding her up
export function venusDeMedici(p, x, y, z, s = 2.2, ry = 0) {
  put(p, 'venus-de-medici', () => [
    ...bodyShapes({
      female: true, sway: 0.015, tilt: 0.01,
      legs: { r: [[-0.09, 0.93, 0], [-0.08, 0.5, 0.02], [-0.07, 0.08, 0]], l: [[0.09, 0.91, 0.01], [0.06, 0.5, 0.08], [0.1, 0.09, 0.03]] },
      arms: { r: [[-0.16, 1.22, 0.12], [-0.03, 1.26, 0.16]], l: [[0.22, 1.12, 0.06], [0.06, 0.92, 0.13]] }, look: 0.55, nod: 0.15, hair: 'bun',
    }),
    // the dolphin, head down, its tail up against her leg, on the base
    cone([0.24, 0.06, 0.02], [0.2, 0.45, -0.04], 0.07, 0.05, 0.05), egg([0.24, 0.12, 0.05], [0.07, 0.09, 0.08], 0.04),
    cone([0.2, 0.45, -0.04], [0.16, 0.6, -0.08], 0.04, 0.02, 0.03),
    slab([0, 0.02, 0], [0.32, 0.02, 0.24], 0.02, 0.02),
  ], x, y, z, s, ry);
}

// Michelangelo's David (1501–1504): standing easy, his weight on his right leg against a tree
// stump, the left foot forward; the right arm hanging with the stone in his big hand, the left
// raised to his shoulder holding the sling, which runs down his back; his head of curls turned to
// his left, looking out for Goliath. 4.34 m real without its base, 5.4 here (s = 3.1).
export function david(p, x, y, z, s = 3.1, ry = 0) {
  put(p, 'david', () => {
    const out = bodyShapes({
      sway: 0.01, tilt: 0.025,
      legs: { r: [[-0.09, 0.93, 0], [-0.1, 0.51, 0.01], [-0.11, 0.08, 0]], l: [[0.09, 0.9, 0], [0.15, 0.49, 0.09], [0.2, 0.08, 0.04]] },
      arms: { r: [[-0.25, 1.13, -0.01], [-0.255, 0.9, 0.03], false], l: [[0.29, 1.18, 0.1], [0.17, 1.4, 0.1]] }, look: 0.7, hair: 'curls',
    });
    out.push(egg([-0.255, 0.84, 0.035], [0.045, 0.065, 0.04], 0.03)); // his big right hand, the stone in it
    // the sling over his left shoulder and down his back to his right hand
    const sling = [[0.16, 1.44, 0.08], [0.17, 1.51, -0.08], [-0.08, 1.05, -0.14], [-0.24, 0.86, -0.03]];
    for (let q = 1; q < sling.length; q++) out.push(cone(sling[q - 1], sling[q], 0.013, 0.013, 0.01));
    // the rough marble he stands on, and the stump behind his right leg
    out.push(slab([0.03, 0.035, 0.02], [0.34, 0.035, 0.3], 0.03, 0.02));
    out.push(cone([-0.16, 0.06, -0.12], [-0.15, 0.52, -0.11], 0.1, 0.07, 0.04));
    return out;
  }, x, y, z, s, ry);
}

// The Winged Victory of Samothrace (c. 190 BC): no head, no arms, her wings spread behind her and
// her robe blown against her by the wind off the sea, stepping down onto the prow of a ship
export function victory(p, x, y, z, s = 2.6, ry = 0) {
  const at = placer(x, y, z, s, ry), st = p.stone;
  // the prow, grey stone, a long block narrowing to the front
  st.add(new THREE.BoxGeometry(1.4 * s, 0.6 * s, 2.0 * s).translate(0, 0.3 * s, 0), 0xb8b2a6, ...at(0, 0, -0.2), 0, ry, 0);
  st.add(new THREE.CylinderGeometry(0.05 * s, 0.7 * s, 0.6 * s, 3, 1).rotateX(Math.PI / 2).translate(0, 0.3 * s, 0), 0xb8b2a6, ...at(0, 0, 1.2), 0, ry, 0);
  put(p, 'victory', () => {
    const out = bodyShapes({
      female: true, tilt: 0.01, head: false,
      legs: { r: [[-0.09, 0.95, 0.03], [-0.1, 0.56, 0.2], [-0.1, 0.1, 0.16]], l: [[0.09, 0.95, -0.02], [0.13, 0.52, -0.14], [0.13, 0.15, -0.33]] },
      arms: { r: 'stump', l: 'stump' },
    });
    // the robe pressed against her body and blown back between her legs, folds all over it
    out.push(cone([0, 0.92, -0.04], [0.03, 0.12, -0.5], 0.13, 0.17, 0.08));
    for (let q = 0; q < 8; q++) {
      const sd = q % 2 ? 1 : -1, u = q / 8;
      out.push(cone([sd * (0.06 + u * 0.06), 0.9 - u * 0.1, 0.08 - u * 0.1], [sd * (0.12 + u * 0.08), 0.15 + u * 0.15, -0.35 - u * 0.25], 0.03, 0.05, 0.04));
    }
    for (let q = 0; q < 5; q++) out.push(cone([-0.1 + q * 0.05, 1.08 + (q % 2) * 0.04, 0.085], [-0.04 + q * 0.04, 0.94, 0.12], 0.026, 0.03, 0.04)); // folds over her belly
    out.push(cone([-0.16, 1.38, 0.06], [0.1, 1.2, 0.11], 0.025, 0.02, 0.03)); // the strap across her chest
    // the wings: their leading edge rising from her shoulder blades up and back to the tip, the long
    // feathers hanging from it down and back, a row of short ones over them
    for (const sd of [-1, 1]) {
      const edge = u => [sd * (0.14 + 0.3 * u), 1.36 + 0.95 * u - 0.25 * u * u, -0.12 - 0.85 * u];
      for (let q = 0; q <= 20; q++) {
        const u = q / 20, a = edge(u), len = 0.25 + 0.7 * Math.sin(Math.PI * Math.min(1, u * 1.1) * 0.85);
        out.push(cone(a, [a[0] + sd * 0.05, a[1] - len * 0.75, a[2] - len * 0.62], 0.05, 0.03, 0.06));
        if (q % 3 === 0) out.push(cone(a, [a[0] + sd * 0.04, a[1] - len * 0.35, a[2] - len * 0.3], 0.06, 0.04, 0.05));
      }
      for (let q = 0; q < 6; q++) out.push(cone(edge(q / 6), edge((q + 1) / 6), 0.05, 0.045, 0.05)); // the leading edge, thick
      out.push(cone([sd * 0.12, 1.38, -0.1], [sd * 0.2, 1.45, -0.2], 0.07, 0.05, 0.05)); // where the wing grows from her back
    }
    return out;
  }, x, y + 0.6 * s, z, s, ry, MARBLE, { step: 0.024 });
}

// A Roman marble on its own, by seed: a nude athlete leaning on his spear, a citizen in his toga, or
// an emperor in his breastplate, his arm raised to speak
export function roman(p, x, y, z, s = 2.3, ry = 0, seed = 1) {
  const kind = ((seed % 3) + 3) % 3;
  if (kind === 0) {
    put(p, 'roman-athlete', () => [
      ...bodyShapes({
        sway: 0.02, tilt: -0.02,
        legs: { r: [[-0.09, 0.93, 0], [-0.09, 0.5, 0.02], [-0.09, 0.08, 0]], l: [[0.09, 0.9, 0], [0.13, 0.5, 0.07], [0.17, 0.09, -0.03]] },
        arms: { r: [[-0.28, 1.12, 0.02], [-0.3, 0.88, 0.06]], l: [[0.3, 1.58, 0.05], [0.42, 1.78, 0.08]] }, look: -0.4, hair: 'curls',
      }),
      cone([0.43, 0.06, 0.06], [0.44, 2.05, 0.09], 0.016, 0.014, 0.01), // the spear
      cone([-0.15, 0.06, -0.12], [-0.14, 0.5, -0.11], 0.09, 0.07, 0.04), // the stump the copyist added to hold him up
    ], x, y, z, s, ry, MARBLE, ROUGH);
  } else if (kind === 1) {
    put(p, 'roman-toga', () => [
      ...bodyShapes({ arms: { r: [[-0.24, 1.15, 0.08], [-0.16, 1.05, 0.28]], l: [[0.24, 1.14, 0.04], [0.2, 0.95, 0.15]] }, look: 0.2, hair: 'short' }),
      // the toga: from the shoulders to the feet, its folds hanging and swept across him
      ...drapery(1.42, 0.2, 0.3, 12, { top: 0.25 }),
      cone([0.2, 1.42, 0.02], [-0.18, 0.95, 0.15], 0.06, 0.05, 0.04), cone([0.18, 1.35, 0.06], [-0.2, 0.7, 0.18], 0.05, 0.04, 0.04),
      cone([0.21, 1.4, -0.02], [0.24, 0.9, 0.12], 0.07, 0.06, 0.04), // its end over his left arm
      ...[-1, 1].map(sd => slab([sd * 0.09, 0.03, 0.28], [0.04, 0.025, 0.06], 0.02, 0.02)), // his feet out under it
    ], x, y, z, s, ry, MARBLE, ROUGH);
  } else {
    put(p, 'roman-emperor', () => [
      ...bodyShapes({
        sway: 0.01,
        legs: { r: [[-0.09, 0.93, 0], [-0.09, 0.5, 0.02], [-0.09, 0.08, 0]], l: [[0.09, 0.91, 0], [0.12, 0.5, -0.05], [0.14, 0.12, -0.2]] },
        arms: { r: [[-0.3, 1.5, 0.15], [-0.33, 1.78, 0.32]], l: [[0.27, 1.15, 0.05], [0.24, 1.0, 0.22]] }, look: -0.25, hair: 'short',
      }),
      // the breastplate and the leather strips hanging from it, the cloak round his hips and over his arm
      egg([0, 1.25, 0.005], [0.2, 0.22, 0.13], 0.04),
      ...[...Array(10)].map((_, q) => { const a = -1.4 + (q * 2.8) / 9; return cone([Math.sin(a) * 0.17, 1.02, Math.cos(a) * 0.12], [Math.sin(a) * 0.2, 0.8, Math.cos(a) * 0.15], 0.035, 0.035, 0.015); }),
      cone([-0.18, 1.0, 0.1], [0.24, 1.05, 0.1], 0.06, 0.07, 0.05), cone([0.24, 1.05, 0.1], [0.26, 0.55, 0.15], 0.07, 0.05, 0.05),
      cone([-0.15, 0.06, -0.1], [-0.14, 0.45, -0.1], 0.08, 0.06, 0.04), // a stump at his leg to hold him up
    ], x, y, z, s, ry, MARBLE, ROUGH);
  }
}

// a portrait bust on a little column: an emperor or a bearded philosopher in his cloak
export function bust(p, x, z, s = 1.25, color = MARBLE) {
  p.marble.add(new THREE.CylinderGeometry(0.18 * s, 0.22 * s, 1.2 * s, 10).translate(0, 0.6 * s, 0), 0xd8d2c4, x, 0, z);
  const kind = Math.abs(Math.round(x * 7 + z * 3)) % 2;
  put(p, `bust${kind}`, () => [
    slab([0, 0.03, 0], [0.12, 0.03, 0.09], 0.02, 0.02),
    cone([0, 0.06, 0], [0, 0.16, 0], 0.07, 0.05, 0.03),
    egg([0, 0.2, 0], [0.2, 0.13, 0.12], 0.06), // the chest, cut off below the shoulders
    ...[-1, 1].map(sd => egg([sd * 0.15, 0.28, -0.01], [0.09, 0.06, 0.09], 0.06)),
    ...(kind ? [cone([-0.22, 0.28, 0.02], [0.2, 0.22, 0.11], 0.04, 0.035, 0.03), cone([0.2, 0.3, 0], [0.24, 0.18, 0.06], 0.05, 0.04, 0.03)] : []), // a cloak pinned at the shoulder
    ...bodyShapes({ look: kind ? -0.2 : 0.15, hair: kind ? 'curls' : 'short' })
      .filter(sh => (sh.t === 0 ? sh.b[1] : sh.c[1]) > 1.42).map(sh => lift(sh, -1.1)),
    ...(kind ? [egg([0, 0.475, 0.06], [0.07, 0.06, 0.05], 0.03)] : []), // his beard
  ], x, 1.2 * s, z, s * 1.4, 0, color, ROUGH);
  p.block(x, z, 0.4);
}

// a shape moved up or down by dy
function lift(sh, dy) {
  if (sh.t === 0) return { ...sh, a: [sh.a[0], sh.a[1] + dy, sh.a[2]], b: [sh.b[0], sh.b[1] + dy, sh.b[2]] };
  return { ...sh, c: [sh.c[0], sh.c[1] + dy, sh.c[2]] };
}

// The Younger Memnon, the colossal bust of Ramesses II (c. 1250 BC): granite, two colours, the
// striped nemes headdress falling to his shoulders, the uraeus at his brow
export function ramesses(p, x, z, ry = 0, s = 1.25) {
  const at = placer(x, 0, z, s, ry), k = p.stone;
  k.add(new THREE.BoxGeometry(2.4 * s, 1.0 * s, 1.6 * s).translate(0, 0.5 * s, 0), 0x6a5a50, ...at(0, 0, 0), 0, ry, 0);
  k.add(lathe([[0.001, 1.0], [1.15, 1.0], [1.1, 1.6], [0.6, 2.0], [0.001, 2.05]]).scale(s, s, s * 0.6), 0x8a6a5a, ...at(0, 0, 0));
  k.add(new THREE.BoxGeometry(0.75 * s, 1.0 * s, 0.75 * s).translate(0, 2.5 * s, 0), 0xa88a6a, ...at(0, 0, 0.05), 0, ry, 0);
  k.add(new THREE.CylinderGeometry(0.5 * s, 0.8 * s, 1.2 * s, 4, 1).rotateY(Math.PI / 4).translate(0, 2.55 * s, 0), 0x7a6a5a, ...at(0, 0, -0.1), 0, ry, 0); // the nemes
  for (let q = 0; q < 6; q++) k.add(new THREE.BoxGeometry(1.3 * s, 0.05 * s, 0.8 * s), 0x9a8270, ...at(0, 2.1 + q * 0.18, -0.05), 0, ry, 0);
  k.add(new THREE.ConeGeometry(0.1 * s, 0.25 * s, 5), 0x6a5a50, ...at(0, 3.1, 0.38));
  p.block(x, z, 1.4 * s, 1.0 * s);
}

// a stone sarcophagus, its lid carved with the figure of the dead
export function sarcophagus(p, x, z, ry = 0, s = 1.25, color = 0x6a6258) {
  p.stone.box(1.3 * s, 1.0 * s, 2.6 * s, color, x, 0.5 * s, z, 0, ry, 0);
  p.stone.box(1.35 * s, 0.25 * s, 2.7 * s, 0x8a8070, x, 1.12 * s, z, 0, ry, 0);
  p.stone.box(0.6 * s, 0.2 * s, 2.0 * s, 0xa89878, x, 1.32 * s, z, 0, ry, 0);
  p.block(x, z, Math.abs(Math.cos(ry)) * 0.8 * s + Math.abs(Math.sin(ry)) * 1.5 * s, Math.abs(Math.sin(ry)) * 0.8 * s + Math.abs(Math.cos(ry)) * 1.5 * s);
}

// The bust of Nefertiti (Thutmose, c. 1345 BC): painted limestone, her long neck, the tall flat-topped
// blue crown with its gold band, the broad collar of coloured beads, one eye never set
export function nefertiti(p, x, y, z, ry = 0, s = 1.25) {
  const at = placer(x, y, z, s, ry), k = p.marble;
  k.add(lathe([[0.001, 0], [0.24, 0], [0.22, 0.1], [0.12, 0.2], [0.001, 0.22]], 16).scale(s, s, s * 0.7), 0xc8402a, ...at(0, 0, 0)); // the collar
  for (let q = 0; q < 4; q++) k.add(new THREE.TorusGeometry((0.2 - q * 0.025) * s, 0.012 * s, 4, 20).rotateX(Math.PI / 2 - 0.4).scale(1, 1, 0.7), [0x3a8a6a, 0xd8a52c, 0x2a56b8, 0xc8402a][q], ...at(0, 0.08 + q * 0.03, 0.02));
  k.add(new THREE.CylinderGeometry(0.055 * s, 0.07 * s, 0.22 * s, 10), 0xc89870, ...at(0, 0.3, 0.01), -0.25, ry, 0); // the neck
  k.add(new THREE.SphereGeometry(0.085 * s, 12, 10).scale(0.85, 1.1, 1), 0xc89870, ...at(0, 0.47, 0.04));
  k.add(new THREE.CylinderGeometry(0.11 * s, 0.075 * s, 0.24 * s, 12).scale(1, 1, 0.8), 0x2a4a8a, ...at(0, 0.6, -0.05), -0.45, ry, 0); // the crown, tipped back
  k.add(new THREE.TorusGeometry(0.083 * s, 0.01 * s, 4, 20).rotateX(Math.PI / 2 - 0.45), 0xd8a52c, ...at(0, 0.54, -0.01));
  k.add(new THREE.SphereGeometry(0.01 * s, 6, 5), 0x1a1a1a, ...at(-0.03, 0.49, 0.11));
}

// The Pergamon Altar (c. 170 BC): the broad marble stair up to the colonnade of Ionic columns, the
// frieze of the gods fighting the giants round its foot. Facing ry (0: the stair rising towards +z).
export function pergamonAltar(p, x, z, w, ry = 0) {
  const at = placer(x, 0, z, 1, ry);
  const n = 22, depth = 13, top = 6.5;
  for (let q = 0; q < n; q++) p.marble.box(w * 0.55, (top * (q + 1)) / n, depth / n + 0.02, q % 2 ? 0xe8e2d4 : 0xdcd6c8, ...at(0, (top * (q + 1)) / n / 2, (depth * q) / n + depth / n / 2), 0, ry, 0);
  for (const sd of [-1, 1]) p.marble.box(w * 0.22, top, depth + 6, 0xdcd6c8, ...at(sd * (w * 0.39), top / 2, depth / 2 + 3), 0, ry, 0); // the wings either side of the stair
  p.marble.box(w, 1.2, 6, 0xe8e2d4, ...at(0, top + 0.6, depth + 3), 0, ry, 0);
  for (let q = 0; q < 14; q++) {
    const u = -w / 2 + 1 + (q * (w - 2)) / 13;
    p.marble.add(new THREE.CylinderGeometry(0.35, 0.4, 5, 12).translate(0, 2.5, 0), 0xf0ece2, ...at(u, top + 1.2, depth + 1));
    p.marble.add(new THREE.BoxGeometry(1.0, 0.4, 1.0).translate(0, 5.2, 0), 0xf0ece2, ...at(u, top + 1.2, depth + 1), 0, ry, 0);
  }
  p.marble.box(w, 1.0, 1.6, 0xe8e2d4, ...at(0, top + 6.9, depth + 1), 0, ry, 0);
  p.block(...[at(0, 0, depth / 2 + 3)].map(([px, , pz]) => [px, pz])[0], Math.abs(Math.cos(ry)) * w / 2 + Math.abs(Math.sin(ry)) * (depth / 2 + 3), Math.abs(Math.sin(ry)) * w / 2 + Math.abs(Math.cos(ry)) * (depth / 2 + 3));
}
