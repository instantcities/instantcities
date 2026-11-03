// The parts that come back in Florence's landmarks modelled by hand (duomo.js, campanile.js,
// battistero.js, palazzo-vecchio.js, uffizi.js, santa-croce.js, santa-maria-novella.js), on top of
// core/js/arcade.js: the sides of a map outline as paths, flat slabs and panels laid on a wall's
// face (the white and green marble of the Duomo and the Baptistery), a block raised on an outline,
// octagonal shells (a dome, a roof) and pitched roofs.
import * as THREE from 'three';
import { linePath, wall, pointedRing, archRing } from '../core/js/arcade.js';

export const MARBLE = '#ebe6da', VERDE = '#4d6b58', ROSA = '#c89c8f', GLASS = '#2f3438', TILE = '#b0583a';

// twice the signed area of a flat ring [[u, v], ...]: positive when its sides run with the outside to
// their right (as square() in arcade.js does)
const area2 = ring => ring.reduce((sum, [u, v], i) => { const [u2, v2] = ring[(i + 1) % ring.length]; return sum + u * v2 - u2 * v; }, 0);

// the sides of a ring, each a straight path with the outside to its right, leaving out the ones
// shorter than `min`
export function sides(ring, min = 0.4) {
  const r = area2(ring) > 0 ? ring : ring.slice().reverse();
  return r.map((p, i) => linePath(...p, ...r[(i + 1) % r.length])).filter(path => path.length >= min);
}

// a slab on the wall's face from s0 to s1 and y0 to y1, standing o to o + d out from it
export function panel(kit, path, s0, s1, y0, y1, hex, o = 0, d = 0.12) {
  return wall(kit, path, [[s0, y0], [s1, y0], [s1, y1], [s0, y1]], { o0: o, o1: o + d, hex });
}

// the frame of the panels the marble is laid in: lines w wide round `cols` by `rows` rectangles
export function inlay(kit, path, s0, s1, y0, y1, { cols = 1, rows = 1, hex = VERDE, w = 0.5, o = 0 } = {}) {
  for (let k = 0; k <= cols; k++) {
    const s = s0 + ((s1 - s0) * k) / cols;
    panel(kit, path, Math.max(s0, s - w / 2), Math.min(s1, s + w / 2), y0, y1, hex, o, 0.1);
  }
  for (let k = 0; k <= rows; k++) {
    const y = y0 + ((y1 - y0) * k) / rows;
    panel(kit, path, s0, s1, Math.max(y0, y - w / 2), Math.min(y1, y + w / 2), hex, o, 0.1);
  }
}

// a Gothic window (or a door) at s: its dark opening laid on the face, in a frame `rim` wide
export function lancet(kit, path, s, w, y0, y1, { frame = VERDE, glass = GLASS, rim = 0.5, r = 1, round = false, o = 0 } = {}) {
  const ring = round ? (c, ww, a, b) => archRing(c, ww, a, b, 10) : (c, ww, a, b) => pointedRing(c, ww, a, b, r);
  wall(kit, path, ring(s, w + 2 * rim, y0 - rim, y1 + rim), { o0: o, o1: o + 0.12, hex: frame });
  wall(kit, path, ring(s, w, y0, y1), { o0: o, o1: o + 0.2, hex: glass });
}

// a round window: a disc of glass in a frame on the face, centred on (s, y)
export function oculus(kit, path, s, y, r, { frame = VERDE, glass = GLASS, rim = 0.6, o = 0 } = {}) {
  const disc = rr => Array.from({ length: 20 }, (_, k) => [s + rr * Math.cos((k / 20) * 2 * Math.PI), y + rr * Math.sin((k / 20) * 2 * Math.PI)]);
  wall(kit, path, disc(r + rim), { o0: o, o1: o + 0.12, hex: frame });
  wall(kit, path, disc(r), { o0: o, o1: o + 0.2, hex: glass });
}

// a flat ring [[u, v], ...] raised from y0 to y1, as a solid block
export function prism(kit, ring, y0, y1, hex) {
  const shape = new THREE.Shape(ring.map(([u, v]) => new THREE.Vector2(u, -v)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false }).rotateX(-Math.PI / 2);
  return kit.add(geo, hex, 0, y0, 0);
}

// the corners of a regular octagon (or n-gon) with apothem a round (cx, cz), its flats facing the
// axes when start is π / n
export function ngon(a, n = 8, start = Math.PI / n, cx = 0, cz = 0) {
  const R = a / Math.cos(Math.PI / n);
  return Array.from({ length: n }, (_, k) => [cx + R * Math.cos(start + (k / n) * 2 * Math.PI), cz + R * Math.sin(start + (k / n) * 2 * Math.PI)]);
}

// An n-sided shell through the rings of `profile`, [[a, y], ...] from the bottom up (a the apothem):
// a dome, a pyramid roof or a drum, its faces turned outward
export function shell(kit, profile, hex, { n = 8, start = Math.PI / n, cx = 0, cz = 0 } = {}) {
  const pos = [], AB = new THREE.Vector3(), AC = new THREE.Vector3();
  for (let k = 0; k + 1 < profile.length; k++) {
    const [a0, y0] = profile[k], [a1, y1] = profile[k + 1];
    const r0 = ngon(a0, n, start, cx, cz), r1 = ngon(a1, n, start, cx, cz);
    for (let j = 0; j < n; j++) {
      const i = (j + 1) % n;
      const p = [[r0[j], y0], [r0[i], y0], [r1[i], y1], [r1[j], y1]].map(([[x, z], y]) => new THREE.Vector3(x, y, z));
      // outward: from the axis through the face's middle, or up for a flat ring
      const out = new THREE.Vector3((r0[j][0] + r0[i][0] + r1[i][0] + r1[j][0]) / 4 - cx, 0, (r0[j][1] + r0[i][1] + r1[i][1] + r1[j][1]) / 4 - cz);
      if (Math.abs(a1 - a0) > 4 * Math.abs(y1 - y0)) out.set(0, a1 < a0 ? 1 : -1, 0);
      for (const [a, b, c] of [[0, 1, 2], [0, 2, 3]]) {
        if (a1 < 1e-6 && b === 2) continue; // the apex's empty triangle
        AB.subVectors(p[b], p[a]); AC.subVectors(p[c], p[a]);
        const [q, r, s] = AB.cross(AC).dot(out) < 0 ? [p[a], p[c], p[b]] : [p[a], p[b], p[c]];
        pos.push(q.x, q.y, q.z, r.x, r.y, r.z, s.x, s.y, s.z);
      }
    }
  }
  const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return kit.add(geo, hex);
}

// a pitched roof over a rectangle len (along x) by w (along z) centred on (x, z), its eaves at y and
// its ridge h above them, along x; turned by `turn` about y
export function gable(kit, x, y, z, len, w, h, hex, turn = 0) {
  const shape = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false }).translate(0, 0, -len / 2).rotateY(Math.PI / 2);
  return kit.add(geo, hex, x, y, z, 0, turn, 0);
}
