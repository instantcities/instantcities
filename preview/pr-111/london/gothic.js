// The parts Westminster's Gothic buildings share, the Houses of Parliament and Westminster Abbey,
// built on core/js/arcade.js: a range of walls with rows of pointed windows, buttresses that rise
// through the parapet as pinnacles, and a steep roof; a roof of its own; a pinnacle; a tower's
// corner turret. Everything is in the model's own metres, on rectangles [u0, v0, u1, v1] (u along
// its x, v along its z).
import * as THREE from 'three';
import { linePath, wall, sweep, pointedRing } from '../core/js/arcade.js';

// the four sides of a rectangle, each a path with the outside to its right: north, east, south, west
export const sides = ([u0, v0, u1, v1]) => [linePath(u0, v0, u1, v0), linePath(u1, v0, u1, v1), linePath(u1, v1, u0, v1), linePath(u0, v1, u0, v0)];

// A roof over [u0, v0, u1, v1] from y up to its ridge at `ridge`, the ridge along the longer side
// (along u with along = 'u', along v with 'v'); hipped at the ends with hip, a pyramid when the
// rectangle is square and hipped.
export function roof(kit, [u0, v0, u1, v1], y, ridge, hex, { along, hip = false } = {}) {
  along ??= u1 - u0 >= v1 - v0 ? 'u' : 'v';
  const long = along === 'u', L = (long ? u1 - u0 : v1 - v0) / 2, S = (long ? v1 - v0 : u1 - u0) / 2;
  const r = hip ? Math.max(0, L - S) : L, cu = (u0 + u1) / 2, cv = (v0 + v1) / 2;
  const P = (a, h, b) => new THREE.Vector3(...(long ? [cu + a, h, cv + b] : [cu + b, h, cv + a]));
  const c = [P(-L, y, -S), P(L, y, -S), P(L, y, S), P(-L, y, S)], top = [P(-r, ridge, 0), P(r, ridge, 0)];
  const tris = [[c[0], top[0], top[1]], [c[0], top[1], c[1]], [c[2], top[1], top[0]], [c[2], top[0], c[3]], [c[1], top[1], c[2]], [c[3], top[0], c[0]]];
  const pos = [], mid = new THREE.Vector3(cu, y, cv);
  for (const [a, b, q] of tris) {
    const n = new THREE.Vector3().crossVectors(b.clone().sub(a), q.clone().sub(a));
    if (n.lengthSq() < 1e-9) continue;
    const out = a.clone().add(b).add(q).divideScalar(3).sub(mid);
    pos.push(...a.toArray(), ...(n.dot(out) >= 0 ? [...b.toArray(), ...q.toArray()] : [...q.toArray(), ...b.toArray()]));
  }
  return kit.add(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)), hex);
}

// a pinnacle at (x, z) from y: a little square shaft and its spirelet, w across, h high in all
export function pinnacle(kit, x, y, z, w, h, hex, tip = hex) {
  kit.box(w, h * 0.4, w, hex, x, y + h * 0.2, z);
  kit.add(new THREE.ConeGeometry(w * 0.72, h * 0.6, 4).rotateY(Math.PI / 4), tip, x, y + h * 0.7, z);
  return kit;
}

// an octagonal turret at (x, z) from y0 to y1, r out to its corners, with a cap of `cap` metres:
// a spirelet (or an ogee dome with dome), on a little parapet
export function turret(kit, x, z, y0, y1, r, hex, capHex, { cap = r * 2.4, dome = false, slit = null } = {}) {
  kit.add(new THREE.CylinderGeometry(r, r, y1 - y0, 8).rotateY(Math.PI / 8), hex, x, (y0 + y1) / 2, z);
  kit.add(new THREE.CylinderGeometry(r * 1.15, r * 1.15, 0.6, 8).rotateY(Math.PI / 8), hex, x, y1 + 0.3, z);
  if (slit) for (let k = 0; k < 4; k++) {
    const a = Math.PI / 8 + (k * Math.PI) / 2 + Math.PI / 8;
    kit.box(0.35, (y1 - y0) * 0.5, 0.1, slit, x + r * 0.93 * Math.cos(a), (y0 + y1) / 2, z + r * 0.93 * Math.sin(a), 0, -a + Math.PI / 2);
  }
  if (dome) kit.add(new THREE.SphereGeometry(r * 1.05, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, cap / r, 1), capHex, x, y1 + 0.6, z);
  else kit.add(new THREE.ConeGeometry(r * 1.05, cap, 8).rotateY(Math.PI / 8), capHex, x, y1 + 0.6 + cap / 2, z);
  return kit;
}

// A Gothic range on [u0, v0, u1, v1], its walls up to h: on each side named in `faces` ('nesw',
// north, east, south, west) a wall of stone with a pointed window in every bay of every storey
// (storeys: their floors, from the ground; seg: how many pieces each side of its arch has), the
// glass dark behind them; a string course at every floor; a buttress between the bays, standing up
// through the parapet as a pinnacle; the parapet, and the roof up to `ridge` (none when ridge is not
// above h). The sides left out of `walls` get no wall at all (one built apart, with a great window).
export function range(kit, box, { h, ridge = h, storeys = [0, h], bay = 4.5, win = 0.48, seg = 5, faces = 'nesw', walls = 'nesw', stone, stone2 = stone, glass, roofHex, hip = false, along, parapet = 1.3, pinnacles = true }) {
  const [u0, v0, u1, v1] = box;
  kit.box(u1 - u0 - 0.8, h, v1 - v0 - 0.8, glass, (u0 + u1) / 2, h / 2, (v0 + v1) / 2);
  sides(box).forEach((path, f) => {
    const len = path.length, n = Math.max(1, Math.round(len / bay)), b = len / n, on = faces.includes('nesw'[f]);
    if (!walls.includes('nesw'[f])) return;
    const holes = [];
    if (on) for (let k = 0; k + 1 < storeys.length; k++) {
      const y0 = storeys[k] + (k ? 0.9 : 1.2), y1 = storeys[k + 1] - 0.7;
      if (y1 - y0 < b * win * 0.9) continue;
      for (let i = 0; i < n; i++) holes.push(pointedRing(b * (i + 0.5), b * win, y0, y1, 1, seg));
    }
    wall(kit, path, [[0, 0], [len, 0], [len, h + parapet], [0, h + parapet]], { holes, o0: -0.4, o1: 0, hex: stone });
    if (!on) return;
    for (const y of [...storeys.slice(1, -1), h]) {
      sweep(kit, path, 0, len, [[-0.1, y - 0.25], [0.22, y - 0.25], [0.22, y + 0.12], [-0.1, y + 0.12]], stone2, { step: len });
    }
    for (let i = 1; i < n; i++) {
      const p = path.at(b * i), x = p.x + 0.25 * p.tz, z = p.z - 0.25 * p.tx;
      kit.box(0.6, h + parapet, 0.6, stone2, x, (h + parapet) / 2, z, 0, Math.atan2(-p.tz, p.tx));
      if (pinnacles) pinnacle(kit, x, h + parapet, z, 0.75, 3.2, stone2);
    }
  });
  for (const [u, v] of [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]) {
    kit.box(1.2, h + parapet, 1.2, stone2, u, (h + parapet) / 2, v);
    if (pinnacles) pinnacle(kit, u, h + parapet, v, 1.3, 5, stone2);
  }
  if (ridge > h) roof(kit, [u0 + 0.4, v0 + 0.4, u1 - 0.4, v1 - 0.4], h, ridge, roofHex, { along, hip });
  else kit.box(u1 - u0 - 0.6, 0.3, v1 - v0 - 0.6, roofHex, (u0 + u1) / 2, h + 0.15, (v0 + v1) / 2);
  return kit;
}

// the gable at the end of a roof: a triangle of wall on the path (a side of the range, from sides),
// its foot at h and its point at ridge, with a cross on top
export function gable(kit, path, h, ridge, hex, { holes = [], cross = true } = {}) {
  const len = path.length, m = path.at(len / 2);
  wall(kit, path, [[0, h], [len, h], [len / 2, ridge]], { holes, o0: -0.6, o1: 0.2, hex });
  if (cross) kit.box(0.35, 2.4, 0.35, hex, m.x, ridge + 1, m.z).box(1.4, 0.35, 0.35, hex, m.x, ridge + 1.4, m.z, 0, Math.atan2(-m.tz, m.tx));
  return kit;
}

// a rose window on the path at s, its middle at y, r across, on the wall's face o out from the
// path: the glass, the stone ring round it and its spokes
export function rose(kit, path, s, y, r, stone, glass, o = 0) {
  const p = path.at(s), ry = Math.atan2(-p.tz, p.tx) + Math.PI; // turned to face out along the normal
  const at = o => [p.x + o * p.tz, p.z - o * p.tx];
  const [gx, gz] = at(o + 0.05), [sx, sz] = at(o + 0.12);
  kit.add(new THREE.CircleGeometry(r, 24).rotateY(ry), glass, gx, y, gz);
  kit.add(new THREE.RingGeometry(r, r + 0.6, 24).rotateY(ry), stone, sx, y, sz);
  kit.add(new THREE.RingGeometry(r * 0.3, r * 0.42, 12).rotateY(ry), stone, sx, y, sz);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * 2 * Math.PI;
    kit.box(0.18, r * 0.6, 0.12, stone, sx + Math.cos(ry) * Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, sz - Math.sin(ry) * Math.cos(a) * r * 0.7, 0, ry, a + Math.PI / 2);
  }
  return kit;
}
