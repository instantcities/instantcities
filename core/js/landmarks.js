// The city's landmarks as their real 3D models (<city>/landmarks.js, made by
// tools/gent3d.mjs from Stad Gent's "Gent in 3D"), standing in for the boxes the map would build from their outlines.
import * as THREE from 'three';
import { LANDMARKS, FACADES, MONUMENTS, FRONTS, MAP } from './city.js';
import { elevation } from './facades.js';
import { addFronts } from './fronts.js';

const TILE = 6; // game metres per repeat of the stone texture

function texture(draw) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  draw(c.getContext('2d'), 256);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// grey ashlar, block by block a little lighter or darker, like the Gravensteen's
const LOOKS = {
  stone: () => texture((g, s) => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    g.fillStyle = '#5d5a55';
    g.fillRect(0, 0, s, s);
    const rows = 8, h = s / rows;
    for (let row = 0; row < rows; row++) {
      let x = row % 2 ? -h * 0.9 : 0;
      while (x < s) {
        const w = h * (1.4 + rnd() * 1.2), v = 128 + Math.floor(rnd() * 34);
        g.fillStyle = `rgb(${v}, ${v - 4}, ${v - 12})`;
        g.fillRect(x + 1.5, row * h + 1.5, w - 3, h - 3);
        x += w;
      }
    }
  }),
  // dark slate or zinc, in long strips
  slate: () => texture((g, s) => {
    g.fillStyle = '#4a4e52';
    g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 16) {
      g.fillStyle = x % 32 ? '#53575c' : '#464a4e';
      g.fillRect(x, 0, 14, s);
    }
  }),
  // small panes of blue-grey glass in a grid, each catching the sky a little differently (the
  // Stadshal's roof)
  glass: () => texture((g, s) => {
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    g.fillStyle = '#3c4650';
    g.fillRect(0, 0, s, s);
    const cols = 5, rows = 10, w = s / cols, h = s / rows;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const v = rnd();
        g.fillStyle = `rgb(${92 + v * 40}, ${110 + v * 40}, ${132 + v * 38})`;
        g.fillRect(col * w + 2, row * h + 2, w - 4, h - 4);
      }
    }
  }),
  // warm timber in slats: the underside of the Stadshal's roof
  wood: () => texture((g, s) => {
    g.fillStyle = '#6b4a2e';
    g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 8) {
      g.fillStyle = x % 16 ? '#8a6240' : '#7a5636';
      g.fillRect(x, 0, 6, s);
    }
  }),
  edge: () => texture((g, s) => { g.fillStyle = '#2c2b29'; g.fillRect(0, 0, s, s); }),
  concrete: () => texture((g, s) => {
    g.fillStyle = '#cfccc4';
    g.fillRect(0, 0, s, s);
    g.fillStyle = '#bdb9b0';
    for (let y = 16; y < s; y += 32) for (let x = 16; x < s; x += 32) g.fillRect(x - 2, y - 2, 4, 4);
  }),
};
// what a model's skin letters stand for (see tools/gent3d.mjs)
const SKIN = { g: 'glass', w: 'wood', e: 'edge', p: 'concrete', r: 'slate' };

// Is the point inside one of these flat [x, z, x, z, ...] rings?
function within(x, z, rings) {
  return rings.some(p => {
    let c = false;
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
    }
    return c;
  });
}

// The map with the open landmarks opened up (the Stadshal: a roof on four pillars): the buildings
// on their outlines give way to their pillars, so riders go in under the roof and only bump into
// those. The model still hides the pillars' boxes, as they stand inside its outline. The statues'
// bases join the buildings too, so riders bump into them as well, and what a design's props stand
// on (its solid rings, the Gravensteen's curtain wall) joins the walls. A monument built by hand in
// place of the map's buildings (a station and its platforms) names the ground it stands in for,
// `area` (flat rings in the city's metres): the buildings on it give way to its own `foot` rings,
// and it says how far from its middle it `reach`es (30 m when it does not), so it is put up in time.
// A monument that stands where the map has footways drawn flat on the ground (the Stadhuis's
// perron) names `paths` (flat rings): the footways wholly inside them are left out.
export function openUp(map) {
  const open = LANDMARKS.filter(lm => lm.open);
  const solid = LANDMARKS.flatMap(lm => FACADES?.[lm.id]?.solid ?? []);
  if (!open.length && !MONUMENTS.length && !solid.length) return map;
  // a building under a monument that has `solid` rectangles (a gate) or is a roof on posts (a bus
  // canopy) goes: the monument stands in its place, and of a roof only its posts stop riders
  const gates = MONUMENTS.filter(mo => mo.solid || mo.posts || mo.area).flatMap(ground);
  const under = b => open.some(lm => within(...centre(b.p), lm.foot)) || within(...centre(b.p), gates);
  const paths = MONUMENTS.flatMap(mo => mo.paths ?? []);
  const roads = paths.length ? map.roads.filter(rd => !rd.foot || !rd.p.every((v, k) => k % 2 || within(v, rd.p[k + 1], paths))) : map.roads;
  return { ...map, roads, walls: [...(map.walls ?? []), ...solid], buildings: map.buildings.filter(b => !under(b))
    .concat(open.flatMap(lm => lm.open.map(p => ({ p, f: 1, k: 'pillar' }))))
    .concat(MONUMENTS.flatMap(mo => (mo.foot ?? (mo.posts ? posts(mo) : (mo.solid ?? [null]).map(r => base(mo, r)))).map(p => ({ p, f: 1, k: 'monument' })))) };
}

// a roof's posts, as small squares where the base would be
function posts(mo) {
  const c = Math.cos(mo.turn ?? 0), s = Math.sin(mo.turn ?? 0);
  return mo.posts.map(([a, b]) => base({ x: mo.x + a * c + b * s, z: mo.z - a * s + b * c, turn: mo.turn, size: 0.3 }));
}

// a statue's base, as a flat [x, z, ...] ring: a square of `size`, or a rectangle [along, across].
// With `r` = [along, across, width, depth] (from a monument's `solid`, in its own metres, e.g. the
// two piers of a gate with the way through between them) just that rectangle of it.
function base({ x, z, turn = 0, size }, r) {
  const c = Math.cos(turn), s = Math.sin(turn), [hw, hd] = r ? [r[2] / 2, r[3] / 2] : [].concat(size, size).map(v => v / 2);
  const [ox, oz] = r ?? [0, 0];
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].flatMap(([a, b]) => [x + (a + ox) * c + (b + oz) * s, z - (a + ox) * s + (b + oz) * c]);
}

// the ground a monument stands on, as flat rings: its area, or its base
const ground = mo => mo.area ?? [base(mo)];

function centre(p) {
  let x = 0, z = 0;
  for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; }
  return [(2 * x) / p.length, (2 * z) / p.length];
}

// Adds the models to the group, the statues and the houses drawn by hand (js/fronts.js) with them.
// covers(p): whether a building outline from the map (flat [x, z, ...]) belongs to one of them,
// so it is not built a second time. place(x, z, r, make): how each is put up, make() giving what
// stands at (x, z), within r metres; by default straight away (js/tiles.js's later() waits until
// it comes into sight).
export function addLandmarks(group, place = (x, z, r, make) => group.add(make())) {
  const rings = LANDMARKS.flatMap(lm => lm.foot).concat(MONUMENTS.flatMap(ground));
  const fronts = addFronts(group, MAP, FRONTS ?? [], place);
  for (const mo of MONUMENTS) {
    place(mo.x, mo.z, mo.reach ?? 30, () => {
      const m = mo.make();
      m.position.set(mo.x, 0, mo.z);
      m.rotation.y = mo.turn ?? 0;
      m.name = mo.id;
      return m;
    });
  }
  const mats = {};
  const look = key => (mats[key] ??= shared(new THREE.MeshStandardMaterial({ map: (LOOKS[key] ?? LOOKS.stone)(), roughness: 0.92, side: THREE.DoubleSide, flatShading: true })));
  for (const lm of LANDMARKS) {
    const box = new THREE.Box3().setFromArray(lm.v), mid = box.getCenter(new THREE.Vector3());
    place(mid.x, mid.z, Math.hypot(box.max.x - box.min.x, box.max.z - box.min.z) / 2, () => landmark(lm, look));
  }
  return {
    covers: p => fronts.includes(p) || within(...centre(p), rings),
  };
}

// a material the landmarks share: when one is let go, its texture stays for the others
function shared(m) {
  m.map.userData.shared = true;
  return m;
}

function landmark(lm, look) {
  const design = FACADES?.[lm.id], drawings = design?.drawings ?? {};
  const tris = triangles(lm);
  // one flat-shaded triangle soup, each triangle its own normal. A landmark with a design wears
  // its drawings on its walls (see <city>/facades.js for how each one is laid on);
  // everything else wears its look, laid out on whichever plane the triangle faces most.
  const parts = {};
  for (const t of tris) {
    let part = design?.part?.(t) ?? (t.w && design ? (design.wall ? design.wall(t.w, t) : fallback(drawings, t)) : undefined);
    part ??= SKIN[lm.skin?.[t.k]];
    part ??= lm.look === 'slate' || (design && !t.wall) ? 'slate' : lm.look;
    (parts[part] ??= []).push(t);
  }
  const order = Object.keys(parts);
  const pos = new Float32Array(tris.length * 9), uv = new Float32Array(tris.length * 6);
  const geo = new THREE.BufferGeometry();
  let k = 0;
  for (const part of order) {
    geo.addGroup(k * 3, parts[part].length * 3, order.indexOf(part));
    const d = drawings[part];
    for (const t of parts[part]) {
      t.q.forEach((q, j) => {
        q.toArray(pos, (k * 3 + j) * 3);
        const [u, v] = d && t.w ? onWall(d, t.w, q) : planar(q, t.n).map(c => c / TILE);
        uv[(k * 3 + j) * 2] = u;
        uv[(k * 3 + j) * 2 + 1] = v;
      });
      k++;
    }
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, order.map(part => {
    const d = drawings[part];
    if (!d) return look(part);
    const map = elevation(d.width, d.height, d.px ?? 12, d.draw);
    if (d.fit !== 'centre') map.wrapS = THREE.RepeatWrapping;
    return new THREE.MeshStandardMaterial({ map, roughness: 0.9, side: THREE.DoubleSide, flatShading: true });
  }));
  m.castShadow = m.receiveShadow = true;
  m.name = lm.id;
  const top = tris.reduce((a, t) => t.q.reduce((b, q) => (q.y > b[1] ? q.toArray() : b), a), [0, -Infinity, 0]);
  const props = design?.props?.(lm, top);
  if (props) m.add(props);
  return m;
}

// Without a wall() of its own, a design puts its first drawing on every wall at least 3 m wide
// (a centred one only up to its own height).
function fallback(drawings, t) {
  const [key, d] = Object.entries(drawings)[0] ?? [];
  return key && t.w.span >= 3 && (d.fit !== 'centre' || t.c.y < d.height) ? key : undefined;
}

// Where a point of a wall lands on a drawing, by how the drawing is laid on:
//   'centre'  in true metres, its middle on the wall's middle, y from the ground (one tower face)
//   'bays'    repeated a whole number of times across the wall, stretched up its full height
//   'fit'     once across the whole wall, stretched up its full height (a gable, a west front)
//   'run'     repeated across in true metres from the wall's left end, y from the ground (a row)
function onWall(d, w, q) {
  const s = q.x * w.right.x + q.z * w.right.z, up = (q.y - w.bottom) / Math.max(w.top - w.bottom, 0.1);
  if (d.fit === 'centre') return [(s - w.mid) / d.width + 0.5, q.y / d.height];
  if (d.fit === 'fit') return [(s - w.lo) / w.span, up];
  if (d.fit === 'run') return [(s - w.lo) / d.width, q.y / d.height];
  return [((s - w.lo) / w.span) * Math.max(1, Math.round(w.span / d.width)), up];
}

// the two coordinates of a point on the plane a triangle faces most
function planar(q, n) {
  const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
  return ay >= ax && ay >= az ? [q.x, q.z] : ax >= az ? [q.z, q.y] : [q.x, q.y];
}

// A model's triangles, each { q: its corners, n: its normal turned outwards from the model's middle
// axis, c: its centre, r: how far that is from the axis, wall: whether it stands upright, w: the
// wall it is part of, k: its number in the model }. A wall is all the upright triangles that lie in one plane and hang together
// by their edges, so a drawing goes on the whole wall, not on each triangle: { right: the way along
// it to the right as you look at it, lo, hi, mid: where it starts, ends and has its middle along
// that, span: how wide it is, bottom, top: its lowest and highest point, n: which way it faces,
// c: its middle }.
function triangles(lm) {
  const V = lm.v, I = lm.i, tris = [];
  const box = new THREE.Box3().setFromArray(V), axis = box.getCenter(new THREE.Vector3());
  for (let t = 0; t < I.length; t += 3) {
    const q = [0, 1, 2].map(k => new THREE.Vector3().fromArray(V, I[t + k] * 3));
    const n = new THREE.Vector3().subVectors(q[2], q[1]).cross(new THREE.Vector3().subVectors(q[0], q[1]));
    if (n.lengthSq() < 1e-12) continue;
    n.normalize();
    const c = q[0].clone().add(q[1]).add(q[2]).divideScalar(3);
    if (n.x * (c.x - axis.x) + n.z * (c.z - axis.z) < 0) n.negate();
    const wall = Math.abs(n.y) < 0.35;
    tris.push({ q, n, c, r: Math.hypot(c.x - axis.x, c.z - axis.z), wall, w: null, k: t / 3 });
  }
  // the walls: join upright triangles sharing an edge and a plane
  const up = tris.map((_, k) => k), find = k => (up[k] === k ? k : (up[k] = find(up[k])));
  const key = v => `${Math.round(v.x * 20)},${Math.round(v.y * 20)},${Math.round(v.z * 20)}`;
  const edges = new Map();
  tris.forEach((t, k) => {
    if (!t.wall) return;
    const h = Math.hypot(t.n.x, t.n.z);
    t.right = { x: t.n.z / h, z: -t.n.x / h };
    t.d = (t.n.x * t.c.x + t.n.z * t.c.z) / h;
    for (let j = 0; j < 3; j++) {
      const e = [key(t.q[j]), key(t.q[(j + 1) % 3])].sort().join('|');
      for (const o of edges.get(e) ?? []) {
        const s = tris[o];
        if (t.right.x * s.right.x + t.right.z * s.right.z > 0.985 && Math.abs(t.d - s.d) < 0.4) up[find(k)] = find(o);
      }
      edges.set(e, [...(edges.get(e) ?? []), k]);
    }
  });
  const walls = new Map();
  tris.forEach((t, k) => {
    if (!t.wall) return;
    const w = walls.get(find(k)) ?? { lo: Infinity, hi: -Infinity, bottom: Infinity, top: -Infinity, right: t.right, n: t.n, c: new THREE.Vector3(), area: 0 };
    for (const q of t.q) {
      const s = q.x * w.right.x + q.z * w.right.z;
      w.lo = Math.min(w.lo, s); w.hi = Math.max(w.hi, s); w.bottom = Math.min(w.bottom, q.y); w.top = Math.max(w.top, q.y);
    }
    const a = new THREE.Vector3().subVectors(t.q[2], t.q[1]).cross(new THREE.Vector3().subVectors(t.q[0], t.q[1])).length();
    w.c.addScaledVector(t.c, a); w.area += a;
    t.w = w;
    walls.set(find(k), w);
  });
  for (const w of walls.values()) Object.assign(w, { mid: (w.lo + w.hi) / 2, span: w.hi - w.lo, c: w.c.divideScalar(w.area || 1) });
  return tris;
}
