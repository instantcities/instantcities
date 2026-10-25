// Walls, arcades and mouldings laid along a path: the shared parts of the landmarks built of rows of
// arches (the Colosseo's rings now; St Peter's colonnade, the Procuratie, an aqueduct later). Every
// piece goes into a Kit (kit.js), so a whole landmark is one mesh.
//
// A path is a line on the ground in the model's own metres: `length`, and at(s) giving the point s
// metres along it, { x, z, tx, tz } (tx, tz the way it runs) with the normal n = (tz, -tx) to its
// right, which is outward on an ellipse. Everything is placed in (s, o, y): s along the path, o
// out along its normal (negative is inward), y up. Rings at different o of one path share their
// s, so the bays of an inner ring stand right behind those of the outer one.
import * as THREE from 'three';
import { rng } from './facades.js';

// An ellipse of half-axes a (along x) and b (along z) about the origin, s = 0 at (a, 0), running
// towards +z (so its normal points out). Closed: s wraps round.
export function ellipsePath(a, b) {
  const N = 2048, th = new Float32Array(N + 1), len = new Float32Array(N + 1);
  for (let k = 1; k <= N; k++) {
    th[k] = (k / N) * 2 * Math.PI;
    len[k] = len[k - 1] + Math.hypot(a * (Math.cos(th[k]) - Math.cos(th[k - 1])), b * (Math.sin(th[k]) - Math.sin(th[k - 1])));
  }
  const L = len[N];
  return {
    length: L, closed: true,
    at(s) {
      s = ((s % L) + L) % L;
      let lo = 0, hi = N;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (len[m] <= s) lo = m; else hi = m; }
      const t = th[lo] + ((s - len[lo]) / (len[hi] - len[lo] || 1)) * (th[hi] - th[lo]);
      const dx = -a * Math.sin(t), dz = b * Math.cos(t), d = Math.hypot(dx, dz);
      return { x: a * Math.cos(t), z: b * Math.sin(t), tx: dx / d, tz: dz / d };
    },
  };
}

// a straight path from (x0, z0) to (x1, z1); its normal is to the right as it runs
export function linePath(x0, z0, x1, z1) {
  const L = Math.hypot(x1 - x0, z1 - z0), tx = (x1 - x0) / L, tz = (z1 - z0) / L;
  return { length: L, closed: false, at: s => ({ x: x0 + tx * s, z: z0 + tz * s, tx, tz }) };
}

// the point at (s, o, y)
const point = (path, s, o, y) => {
  const p = path.at(s);
  return new THREE.Vector3(p.x + o * p.tz, y, p.z - o * p.tx);
};

// a triangle facing `want` (turned round when it does not)
const AB = new THREE.Vector3(), AC = new THREE.Vector3();
function tri(out, a, b, c, want) {
  AB.subVectors(b, a); AC.subVectors(c, a);
  const flip = AB.cross(AC).dot(want) < 0;
  out.push(a.x, a.y, a.z, ...(flip ? [c.x, c.y, c.z, b.x, b.y, b.z] : [b.x, b.y, b.z, c.x, c.y, c.z]));
}
const quad = (out, a, b, c, d, want) => { tri(out, a, b, c, want); tri(out, a, c, d, want); };
const area2 = ring => ring.reduce((sum, [s, y], i) => { const [s2, y2] = ring[(i + 1) % ring.length]; return sum + s * y2 - s2 * y; }, 0);
const geometry = pos => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));

// A wall standing along the path between o0 (its back) and o1 (its face): its outline `ring`, a
// flat [[s, y], ...] in the path's metres, with `holes` (rings too) cut right through it. Its two
// ends (the outline's sides at the lowest and highest s) are left open when `ends` is false, for a
// wall that the next bay carries on.
export function wall(kit, path, ring, { holes = [], o0, o1, hex, ends = true }) {
  const pos = [], flat = [ring, ...holes].map(r => r.map(([s, y]) => new THREE.Vector2(s, y)));
  const all = flat.flat(), faces = THREE.ShapeUtils.triangulateShape(flat[0], flat.slice(1));
  for (const [o, side] of [[o1, 1], [o0, -1]]) {
    const v = all.map(p => point(path, p.x, o, p.y));
    for (const [i, j, k] of faces) {
      const m = path.at((all[i].x + all[j].x + all[k].x) / 3);
      tri(pos, v[i], v[j], v[k], new THREE.Vector3(m.tz * side, 0, -m.tx * side));
    }
  }
  const sMin = Math.min(...ring.map(p => p[0])), sMax = Math.max(...ring.map(p => p[0]));
  [ring, ...holes].forEach((r, h) => {
    const out = (area2(r) > 0) === (h === 0) ? 1 : -1; // away from the stone: out of the outline, into a hole
    r.forEach(([s, y], i) => {
      const [s2, y2] = r[(i + 1) % r.length];
      if (!ends && h === 0 && s === s2 && (Math.abs(s - sMin) < 1e-6 || Math.abs(s - sMax) < 1e-6)) return;
      const m = path.at((s + s2) / 2), ds = (y2 - y) * out, dy = -(s2 - s) * out;
      const want = new THREE.Vector3(m.tx * ds, dy, m.tz * ds);
      quad(pos, point(path, s, o1, y), point(path, s2, o1, y2), point(path, s2, o0, y2), point(path, s, o0, y), want);
    });
  });
  return kit.add(geometry(pos), hex);
}

// A moulding or a slab swept along the path from s0 to s1: its section `profile`, [[o, y], ...]
// going round anticlockwise (o to the right, y up), or an open line seen from its right-hand side
// (a slope of seats from the top down). Bent along the path in pieces of at most `step` metres;
// the ends are closed when the profile is.
export function sweep(kit, path, s0, s1, profile, hex, { closed = true, step = 2 } = {}) {
  const pos = [], n = Math.max(1, Math.ceil((s1 - s0) / step));
  const at = k => s0 + ((s1 - s0) * k) / n;
  const edges = profile.length - (closed ? 0 : 1);
  for (let k = 0; k < n; k++) {
    const m = path.at((at(k) + at(k + 1)) / 2);
    for (let e = 0; e < edges; e++) {
      const [o, y] = profile[e], [o2, y2] = profile[(e + 1) % profile.length];
      const want = new THREE.Vector3(m.tz * (y2 - y), -(o2 - o), -m.tx * (y2 - y));
      quad(pos, point(path, at(k), o, y), point(path, at(k), o2, y2), point(path, at(k + 1), o2, y2), point(path, at(k + 1), o, y), want);
    }
  }
  if (closed) {
    const cap = THREE.ShapeUtils.triangulateShape(profile.map(([o, y]) => new THREE.Vector2(o, y)), []);
    for (const [s, side] of [[s0, -1], [s1, 1]]) {
      const m = path.at(s), want = new THREE.Vector3(m.tx * side, 0, m.tz * side);
      for (const [i, j, k] of cap) tri(pos, ...[i, j, k].map(q => point(path, s, ...profile[q])), want);
    }
  }
  return kit.add(geometry(pos), hex);
}

// A wall across the path at s (a pier, a buttress, the wall between two rows of seats): its outline
// `ring` flat in (o, y), `thick` metres along the path.
export function fin(kit, path, s, ring, thick, hex) {
  const m = path.at(s), shape = new THREE.Shape(ring.map(([o, y]) => new THREE.Vector2(o, y)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false });
  // shape x along the normal, y up, extruded along the path
  geo.applyMatrix4(new THREE.Matrix4().set(m.tz, 0, m.tx, m.x - m.tx * thick / 2, 0, 1, 0, 0, -m.tx, 0, m.tz, m.z - m.tz * thick / 2, 0, 0, 0, 1));
  return kit.add(geo, hex);
}

// a round arch's opening as a ring in (s, y): w wide, from y0 to its crown at y1
export function archRing(s, w, y0, y1, n = 10) {
  const r = w / 2, spring = Math.max(y0, y1 - r), ring = [[s - r, y0], [s + r, y0], [s + r, spring]];
  for (let k = 1; k < n; k++) ring.push([s + r * Math.cos((k / n) * Math.PI), spring + r * Math.sin((k / n) * Math.PI)]);
  ring.push([s - r, spring]);
  return ring;
}

// A column standing against the wall at (s, o) from y0 to y1, r thick, in one of the orders: a
// Tuscan one plain with a square abacus, an Ionic one with a wider flat capital, a Corinthian one
// flaring out under its abacus, a pilaster flat against the wall.
export function column(kit, path, s, o, y0, y1, r, hex, order = 'tuscan') {
  const p = point(path, s, o, 0), m = path.at(s), turn = Math.atan2(-m.tz, m.tx); // a box's x along the path
  const h = y1 - y0, cap = Math.min(h * 0.09, r * 1.6), base = r * 0.7;
  if (order === 'pilaster') {
    kit.box(r * 2, h, r * 0.7, hex, p.x, y0 + h / 2, p.z, 0, turn);
    kit.box(r * 2.5, cap * 0.6, r * 1, hex, p.x, y1 - cap * 0.3, p.z, 0, turn);
    return kit;
  }
  kit.add(new THREE.CylinderGeometry(r * 1.25, r * 1.3, base, 10), hex, p.x, y0 + base / 2, p.z);
  kit.add(new THREE.CylinderGeometry(r * 0.88, r, h - base - cap, 10), hex, p.x, y0 + base + (h - base - cap) / 2, p.z);
  if (order === 'corinthian') kit.add(new THREE.CylinderGeometry(r * 1.45, r * 0.9, cap, 10), hex, p.x, y1 - cap / 2, p.z);
  else kit.box(r * (order === 'ionic' ? 3 : 2.4), cap * (order === 'ionic' ? 0.7 : 0.6), r * 2.2, hex, p.x, y1 - cap * 0.35, p.z, 0, turn);
  return kit;
}

// An arcade of `bays` equal bays along the path, the first centred on s = `start`, of which bays
// `from` up to (not including) `to` are built (on a closed path `to` may run on past `bays`), each
// with its storeys one on top of the other:
//   storeys: [{ h, arch: width as a share of the bay (none: a blank storey), crown: the arch's
//              crown above the storey's floor, sill: its foot (a parapet under upper arches),
//              order: the columns between the bays ('tuscan', 'ionic', 'corinthian', 'pilaster'),
//              window: { w, y0, y1, every } a square window in every `every`th bay,
//              corbels: how many brackets to a bay along the top, frieze: its entablature's depth }]
//   o:      the wall's face, depth: how thick it is
//   hex(i, k): the stone of bay i, storey k
//   stand(i, k): how much of bay i's storey k still stands: 1 all, 0 nothing, in between broken
//              off at about that share of the storey (a ruin, see broken)
export function arcade(kit, path, { bays, start = 0, from = 0, to = bays, storeys, o = 0, depth = 2.4, r, hex, stand = () => 1 }) {
  const bay = path.length / bays;
  for (let i = from; i < to; i++) {
    const s0 = start + (i - 0.5) * bay, s1 = s0 + bay, sc = s0 + bay / 2;
    let y = 0;
    for (const [k, st] of storeys.entries()) {
      const f = stand(i % bays, k), c = hex(i % bays, k), y0 = y, y1 = y + st.h;
      y = y1;
      if (f <= 0) break;
      const w = st.arch ? st.arch * bay : 0, frieze = st.frieze ?? 0;
      if (f < 1) {
        broken(kit, path, { s0, s1, sc, y0, h: st.h, w, sill: st.sill ?? 0, crown: st.crown, o, depth, hex: c,
          // each pier as high as the bays on either side of it allow (up to the top beside a bay
          // that still stands whole), less a little of its own
          top: (j, g) => {
            const share = g >= 1 ? 1 : g <= 0 ? f : (f + g) / 2;
            return y0 + st.h * share - (share < 1 ? st.h * 0.22 * rng((((j % bays) + bays) % bays) * 7 + k * 131 + 11)() : 0);
          },
          left: stand((i + bays - 1) % bays, k), right: stand((i + 1) % bays, k), i });
        break;
      }
      const holes = [];
      if (w) holes.push(archRing(sc, w, y0 + (st.sill ?? 0), y0 + st.crown));
      if (st.window && i % st.window.every === 0) {
        const { w: ww, y0: wy0, y1: wy1 } = st.window;
        holes.push([[sc - ww / 2, y0 + wy0], [sc + ww / 2, y0 + wy0], [sc + ww / 2, y0 + wy1], [sc - ww / 2, y0 + wy1]]);
      }
      const ends = stand((i + bays - 1) % bays, k) < 1 || stand((i + 1) % bays, k) < 1 || i === from || i === to - 1;
      wall(kit, path, [[s0, y0], [s1, y0], [s1, y1 - frieze], [s0, y1 - frieze]], { holes, o0: o - depth, o1: o, hex: c, ends });
      if (frieze) {
        // the entablature over the storey, standing a little proud, and its cornice
        sweep(kit, path, s0, s1, [[o - depth, y1 - frieze], [o + 0.35, y1 - frieze], [o + 0.35, y1 - 0.4], [o + 0.75, y1 - 0.4], [o + 0.75, y1], [o - depth, y1]], c, { step: bay });
      }
      if (w && !st.order) {
        // the arch's imposts, where it springs from the piers
        const spring = y0 + st.crown - w / 2;
        for (const [a, b] of [[s0, sc - w / 2], [sc + w / 2, s1]]) sweep(kit, path, a, b, [[o - 0.2, spring - 0.35], [o + 0.15, spring - 0.35], [o + 0.15, spring], [o - 0.2, spring]], c, { step: bay });
      }
      if (st.order) {
        // a column on each pier: the one on the far side of the bay only where no bay follows
        const last = i === to - 1 || stand((i + 1) % bays, k) < 1;
        for (const s of last ? [s0, s1] : [s0]) column(kit, path, s, o, y0 + (st.plinth ?? 0), y1 - frieze, r ?? bay * 0.07, c, st.order);
      }
      if (st.order && st.plinth) {
        // the pedestal course the upper columns stand on
        sweep(kit, path, s0, s1, [[o - 0.1, y0], [o + 0.4, y0], [o + 0.4, y0 + st.plinth], [o - 0.1, y0 + st.plinth]], c, { step: bay });
      }
      for (let q = 0; q < (st.corbels ?? 0); q++) {
        const p = point(path, s0 + (bay * (q + 0.5)) / st.corbels, o + 0.3, y1 - frieze - 1.2), m = path.at(s0);
        kit.box(0.45, 0.55, 0.6, c, p.x, p.y, p.z, 0, Math.atan2(-m.tz, m.tx));
      }
    }
  }
  return kit;
}

// A storey of a bay broken off (arcade's stand): its top a line from the pier on its left, at
// top(i, left), to the one on its right, at top(i + 1, right). An arch whose crown is under that
// line keeps it; one cut through by it is left as the two piers with what is left of the arch's
// curve on them, over the parapet under it.
function broken(kit, path, { s0, s1, sc, y0, h, w, sill, crown, o, depth, hex, top, left, right, i }) {
  const ys = y0 + (w ? sill : 0), floor = ys + 0.4;
  const tl = Math.max(floor, top(i, left)), tr = Math.max(floor, top(i + 1, right));
  const cut = s => tl + ((tr - tl) * (s - s0)) / (s1 - s0);
  const opts = { o0: o - depth, o1: o, hex };
  if (!w) return wall(kit, path, [[s0, y0], [s1, y0], [s1, tr], [s0, tl]], opts);
  // the arch's outline from the foot of its right jamb, up and over, to the foot of its left one
  const arch = archRing(sc, w, ys, y0 + crown);
  const pts = [arch[1], ...arch.slice(2), arch[0]];
  const under = pts.map(([s, y]) => y < cut(s) - 0.3);
  if (under.every(Boolean)) return wall(kit, path, [[s0, y0], [s1, y0], [s1, tr], [s0, tl]], { ...opts, holes: [arch] });
  if (sill > 0) wall(kit, path, [[s0, y0], [s1, y0], [s1, ys], [s0, ys]], opts);
  // where the line crosses the arch, between point q and the one after it
  const cross = q => {
    const [sa, ya] = pts[q], [sb, yb] = pts[q + 1], da = ya - cut(sa), db = yb - cut(sb), t = da / (da - db || 1);
    return [sa + (sb - sa) * t, ya + (yb - ya) * t];
  };
  const a = under.indexOf(false), b = under.lastIndexOf(false);
  if (a > 0) wall(kit, path, [[pts[0][0], ys], [s1, ys], [s1, tr], cross(a - 1), ...pts.slice(1, a).reverse()], opts);
  else wall(kit, path, [[sc + w / 2, ys], [s1, ys], [s1, tr], [sc + w / 2, Math.max(floor, cut(sc + w / 2))]], opts);
  if (b < pts.length - 1) wall(kit, path, [[s0, ys], [pts.at(-1)[0], ys], ...pts.slice(b + 1, -1).reverse(), cross(b), [s0, tl]], opts);
  else wall(kit, path, [[s0, ys], [sc - w / 2, ys], [sc - w / 2, Math.max(floor, cut(sc - w / 2))], [s0, tl]], opts);
}
