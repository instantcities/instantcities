// What a museum's rooms are built from, on top of the churches' Parts (gothic.js): a hall of four
// walls with doorways in them, a flat, coffered, skylit or barrel-vaulted ceiling, pictures in gilt
// frames, statues' plinths, benches, a rope on posts before the famous one, glass cases, and the
// visitors standing about. A museum is a few of its key rooms joined by doorways, not its real plan.
//
// Game metres (1.25 to a real metre), x across and z along, the door out in the south (-z) wall.
import * as THREE from 'three';
import { person, SKINS, HAIRS } from '../person.js';
import { blobTex } from './gothic.js';

const GOLD = 0xc9a24a, BRASS = 0xb8963c, OAK = 0x6b4526, VELVET = 0x8a1f2b;
const CLOTHES = [0x2f4a6a, 0xa3202c, 0x3a3a3a, 0xe8dcc0, 0x2f7a45, 0x6a4a8a, 0xd8a52c, 0x1f2f4a, 0xf0f0ea];

// a doorway in a wall: an opening u - w/2 .. u + w/2, h high, as a hole outline [u, y] (square-headed,
// or round-headed with `arch`)
export function doorway(u, w = 4, h = 5, arch = false) {
  const pts = [[u - w / 2, 0], [u + w / 2, 0], [u + w / 2, h]];
  if (arch) for (let k = 1; k < 10; k++) { const a = (k / 10) * Math.PI; pts.push([u + Math.cos(a) * w / 2, h + Math.sin(a) * w / 2]); }
  pts.push([u - w / 2, h]);
  return pts;
}

// A rectangular hall over x0..x1 × z0..z1, `h` high: four walls in `color` (plaster), each with its
// doorways, `doors: { s, n, w, e }` lists of [u (along the wall from its west or south end), width,
// height?]; riders bump into the walls but not the doorways. Returns the hall's numbers.
export function hall(p, { x0, z0, x1, z1, h, color, doors = {}, t = 0.9, arch = false, windows = {} }) {
  const sides = {
    s: [[x0, z0], [x1, z0]], n: [[x0, z1], [x1, z1]],
    w: [[x0, z0], [x0, z1]], e: [[x1, z0], [x1, z1]],
  };
  for (const [side, [a, b]] of Object.entries(sides)) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ds = (doors[side] ?? []).map(([u, w, dh = Math.min(h - 1, 5.5)]) => ({ u, w, dh }));
    const holes = ds.map(d => doorway(d.u, d.w, d.dh, arch)), panes = [];
    for (const [u, w, y0, y1, glass = 5] of windows[side] ?? []) { panes.push([holes.length, glass]); holes.push([[u - w / 2, y0], [u + w / 2, y0], [u + w / 2, y1], [u - w / 2, y1]]); }
    p.rectWall(a, b, { y1: h + 0.3, t, holes, panes, color, solid: false });
    // the wall between the doorways, to bump into, and the shade along its foot and its top
    let from = 0;
    const at = u => [a[0] + ((b[0] - a[0]) * u) / L, a[1] + ((b[1] - a[1]) * u) / L];
    const inward = { s: [0, 1], n: [0, -1], w: [1, 0], e: [-1, 0] }[side];
    const solid = (u0, u1) => { p.wallRing(at(u0), at(u1), t); corners(p, at(u0), at(u1), inward, t / 2 + 0.02, h); };
    for (const d of [...ds].sort((m, n) => m.u - n.u)) {
      if (d.u - d.w / 2 > from + 0.1) solid(from, d.u - d.w / 2);
      from = d.u + d.w / 2;
    }
    if (L > from + 0.1) solid(from, L);
  }
  (p.halls ??= []).push({ x0, z0, x1, z1 }); // for the visitors walking round it (wanderers)
  return { x0, z0, x1, z1, h };
}

// The shade where a stretch of wall from a to b ([x, z]) meets the floor and the ceiling `h` up, its
// face `off` in from the line towards `inward`: on the floor along its foot, up the wall a little,
// and down from the top: the light from above reaches into a corner less.
function corners(p, a, b, [nx, nz], off, h) {
  const A = [a[0] + nx * off, a[1] + nz * off], B = [b[0] + nx * off, b[1] + nz * off], y = 0.075;
  p.shade([A[0], y, A[1]], [B[0], y, B[1]], [B[0] + nx * 1.6, y, B[1] + nz * 1.6], [A[0] + nx * 1.6, y, A[1] + nz * 1.6]);
  p.shade([A[0], y, A[1]], [B[0], y, B[1]], [B[0], 1.3, B[1]], [A[0], 1.3, A[1]]);
  p.shade([A[0], h, A[1]], [B[0], h, B[1]], [B[0], h - 1.8, B[1]], [A[0], h - 1.8, A[1]]);
}

// a skylight ceiling: a flat ceiling with a long glazed lantern down the middle, bright as the day
// over it (the Louvre's galleries, the Uffizi's rooms)
export function skylight(p, x0, z0, x1, z1, y, { color = 0xf4efe2, along = 'z', glass = 0.45 } = {}) {
  const W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const gw = (along === 'z' ? W : D) * glass, gl = (along === 'z' ? D : W) - 2;
  // the ceiling either side of the lantern, and its coving
  for (const s of [-1, 1]) {
    const off = (((along === 'z' ? W : D) - gw) / 4 + gw / 2) * s, wid = ((along === 'z' ? W : D) - gw) / 2;
    if (along === 'z') p.plaster.box(wid, 0.3, D, color, cx + off, y + 0.15, cz);
    else p.plaster.box(W, 0.3, wid, color, cx, y + 0.15, cz + off);
  }
  // the glass: lit from above, in panes between iron bars
  if (along === 'z') {
    p.daylight.box(gw, 0.05, gl, 0xeef2f4, cx, y + 1.6, cz);
    for (let k = -4; k <= 4; k++) p.dark.box(0.08, 0.1, gl, 0x3a3a3a, cx + (k * gw) / 9, y + 1.55, cz);
    for (let z = z0 + 2; z < z1 - 1; z += 2.4) p.dark.box(gw, 0.1, 0.08, 0x3a3a3a, cx, y + 1.55, z);
    for (const s of [-1, 1]) p.plaster.box(0.3, 1.6, D, color, cx + (s * gw) / 2, y + 0.8, cz);
  } else {
    p.daylight.box(gl, 0.05, gw, 0xeef2f4, cx, y + 1.6, cz);
    for (let k = -4; k <= 4; k++) p.dark.box(gl, 0.1, 0.08, 0x3a3a3a, cx, y + 1.55, cz + (k * gw) / 9);
    for (let x = x0 + 2; x < x1 - 1; x += 2.4) p.dark.box(0.08, 0.1, gw, 0x3a3a3a, x, y + 1.55, cz);
    for (const s of [-1, 1]) p.plaster.box(W, 1.6, 0.3, color, cx, y + 0.8, cz + (s * gw) / 2);
  }
  return p;
}

// a barrel vault along z over x0..x1 from its springing at y, `rise` high at the crown, with a band
// across it every `bay` (the Grande Galerie, the Uffizi's corridor); skylight: a glazed strip at the top
export function barrel(p, x0, z0, x1, z1, y, rise, { color = 0xf2ecde, band = 0xe0d4ba, bay = 8, skylight = 0, n = 16 } = {}) {
  const W = x1 - x0, D = z1 - z0, pos = [];
  const at = (i, z) => { const a = Math.PI * (i / n); return [x0 + W * (1 - Math.cos(a)) / 2, y + Math.sin(a) * rise, z]; };
  const open = i => skylight && Math.abs(i / n - 0.5) < skylight / 2;
  for (let i = 0; i < n; i++) {
    if (open(i) && open(i + 1)) continue;
    const a = at(i, z0), b = at(i + 1, z0), c = at(i, z1), d = at(i + 1, z1);
    pos.push(...a, ...c, ...b, ...b, ...c, ...d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  p.plaster.add(g, color);
  // the bands across
  for (let z = z0; z <= z1 + 0.01; z += bay) {
    for (let i = 0; i < n; i++) {
      const a = at(i, z), b = at(i + 1, z), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      p.stone.box(L, 0.5, 0.7, band, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.2, z, 0, 0, Math.atan2(b[1] - a[1], b[0] - a[0]));
    }
  }
  if (skylight) {
    const gw = W * skylight;
    p.daylight.box(gw, 0.05, D, 0xeef2f4, (x0 + x1) / 2, y + rise + 0.3, (z0 + z1) / 2);
    for (let z = z0 + 1.2; z < z1; z += 2.4) p.dark.box(gw, 0.12, 0.08, 0x3a3a3a, (x0 + x1) / 2, y + rise + 0.25, z);
  }
  // the cornice it springs from
  for (const x of [x0, x1]) p.stone.box(1.0, 0.6, D, band, x + (x === x0 ? 0.5 : -0.5), y - 0.1, (z0 + z1) / 2);
  return p;
}

// A picture in a gilt frame on a wall: tex w × h metres, its middle at (x, y, z), facing ry (0: +z),
// the frame `f` wide; a little label beside it, a brass lamp over it lighting the wall round it (but
// not over a fresco: lamp false). Painted on the wall, so nobody bumps into it.
export function framed(p, tex, w, h, x, y, z, ry = 0, { f = 0.35, color = GOLD, label = true, lamp = true } = {}) {
  const c = Math.cos(ry), s = Math.sin(ry), off = 0.06;
  p.picture(tex, w, h, x + s * off, y, z + c * off, ry);
  if (lamp) {
    // a brass picture lamp over the frame on two arms, and its warm light on the wall round it
    const top = y + h / 2 + f, lw = Math.min(1.6, w * 0.45);
    p.gold.box(lw, 0.12, 0.14, BRASS, x + s * 0.42, top + 0.32, z + c * 0.42, 0, ry, 0);
    p.glow.box(lw * 0.92, 0.03, 0.08, 0xfff1d0, x + s * 0.44, top + 0.25, z + c * 0.44, 0, ry, 0);
    for (const e of [-1, 1]) p.gold.box(0.04, 0.04, 0.42, BRASS, x + c * e * lw * 0.35 + s * 0.22, top + 0.32, z - s * e * lw * 0.35 + c * 0.22, 0, ry, 0);
    p.wash(x + s * 0.035, y + 0.25, z + c * 0.035, ry, w + 2 * f + 2.2, h + 2 * f + 1.6);
  }
  const put = (bw, bh, dx, dy) => p.gold.box(bw, bh, 0.16, color, x + c * dx, y + dy, z - s * dx, 0, ry, 0);
  put(w + 2 * f, f, 0, h / 2 + f / 2);
  put(w + 2 * f, f, 0, -h / 2 - f / 2);
  put(f, h, -w / 2 - f / 2, 0);
  put(f, h, w / 2 + f / 2, 0);
  if (label) p.marble.box(0.5, 0.3, 0.05, 0xf4f0e6, x + c * (w / 2 + f + 0.6) + s * 0.03, Math.min(y, 1.6), z - s * (w / 2 + f + 0.6) + c * 0.03, 0, ry, 0);
  (p.sights ??= []).push([x, z]); // something for the visitors to stop and look at (wanderers)
  return p;
}

// a row of pictures along a wall from a to b ([x, z]) facing `ry`, each from the list of
// [tex, w, h], spaced evenly, their middles at y
export function hang(p, a, b, ry, pics, y = 3.2) {
  const n = pics.length;
  pics.forEach(([tex, w, h], k) => {
    const t = (k + 0.5) / n;
    framed(p, tex, w, h, a[0] + (b[0] - a[0]) * t, y + (h > 4 ? (h - 4) / 2 : 0), a[1] + (b[1] - a[1]) * t, ry);
  });
}

// a plinth for a statue: w × d, h high, in marble, and the ring to bump into
export function plinth(p, x, z, w = 1.6, d = w, h = 1.2, color = 0xe8e2d4) {
  p.marble.box(w, h, d, color, x, h / 2, z);
  p.marble.box(w + 0.2, 0.12, d + 0.2, 0xd8d2c4, x, 0.06, z);
  p.marble.box(w + 0.15, 0.1, d + 0.15, 0xd8d2c4, x, h - 0.05, z);
  p.block(x, z, w / 2 + 0.3, d / 2 + 0.3);
  (p.sights ??= []).push([x, z]);
  return h;
}

// a museum bench: a long padded seat on legs, `len` along x before turning by ry
export function bench(p, x, z, len = 3.2, ry = 0) {
  const c = Math.cos(ry), s = Math.sin(ry);
  p.dark.box(len, 0.22, 0.75, 0x3a3230, x, 0.55, z, 0, ry, 0);
  for (const e of [-1, 1]) p.dark.box(0.12, 0.45, 0.6, 0x2a2420, x + c * e * (len / 2 - 0.2), 0.22, z - s * e * (len / 2 - 0.2), 0, ry, 0);
  p.block(x, z, Math.abs(c) * len / 2 + Math.abs(s) * 0.4 + 0.1, Math.abs(s) * len / 2 + Math.abs(c) * 0.4 + 0.1);
}

// brass posts with a red rope between them along a → b, keeping you back from the famous one
export function rope(p, a, b, every = 2.2) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / every));
  for (let k = 0; k <= n; k++) {
    const x = a[0] + ((b[0] - a[0]) * k) / n, z = a[1] + ((b[1] - a[1]) * k) / n;
    p.gold.add(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6).translate(0, 0.5, 0), BRASS, x, 0, z);
    p.gold.add(new THREE.CylinderGeometry(0.18, 0.2, 0.06, 8), BRASS, x, 0.03, z);
    p.gold.add(new THREE.SphereGeometry(0.08, 6, 5), BRASS, x, 1.02, z);
    if (k < n) p.dark.rod([x, 0.92, z], [a[0] + ((b[0] - a[0]) * (k + 1)) / n, 0.92, a[1] + ((b[1] - a[1]) * (k + 1)) / n], 0.04, VELVET, 5);
  }
  p.wallRing(a, b, 0.3);
}

// a glass case on a dark base: w × d, the glass up to h; what is in it is added by whoever puts it up
export function vitrine(p, x, z, w, d, h = 2.4, base = 0.9) {
  p.dark.box(w, base, d, 0x2a2622, x, base / 2, z);
  p.glass.push({ w, h: h - base, d, x, y: base + (h - base) / 2, z });
  p.block(x, z, w / 2 + 0.2, d / 2 + 0.2);
  return base;
}

// A floor in big stone slabs, laid straight: two colours in a pattern of squares `square` across.
export { floorMat } from './gothic.js';

// The visitors: people standing about looking, each at a spot [x, z, yaw] (yaw 0 faces +z), in
// everyday clothes, some with a bag or a phone held up to take a picture. One group, in real metres
// scaled to the game's.
export function visitors(spots, seed = 3) {
  const g = new THREE.Group();
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (const [x, z, yaw] of spots) {
    const who = visitor(rnd);
    who.g.position.set(x, 0.06, z);
    who.g.rotation.y = yaw;
    who.g.traverse(m => { m.castShadow = false; });
    g.add(who.g);
  }
  return g;
}

let BLOB = null, BLOB_MAT = null;
// one visitor in everyday clothes, at the game's scale; some hold up a phone (phones: whether they may)
function visitor(rnd, phones = true) {
  const k = Math.floor(rnd() * 1000);
  const skirt = rnd() < 0.3 ? [CLOTHES[(k + 3) % CLOTHES.length], 0.5 + rnd() * 0.3, 0.05] : null;
  const phone = rnd() < 0.35 && phones;
  const who = person({
    top: CLOTHES[k % CLOTHES.length], legs: CLOTHES[(k * 7 + 1) % CLOTHES.length], skin: SKINS[k % SKINS.length], hair: HAIRS[(k * 3) % HAIRS.length],
    long: rnd() < 0.4, short: rnd() < 0.3, tall: 0.9 + rnd() * 0.15, arms: phone ? ['down', 'front'] : ['down', 'down'], ...(skirt ? { skirt } : {}),
  });
  if (phone) who.arms[1].add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.015), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 })).translateY(-0.6));
  // a soft shadow on the floor under them
  const blob = new THREE.Mesh(BLOB ??= new THREE.PlaneGeometry(0.85, 0.85).rotateX(-Math.PI / 2), BLOB_MAT ??= new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false }));
  blob.position.y = 0.012;
  blob.renderOrder = 1;
  who.g.add(blob);
  who.g.scale.multiplyScalar(1.25);
  return who;
}

// people round a spot (x, z) at a distance from r0 to r1, facing it: a crowd at the Mona Lisa
export function crowd(x, z, n, r0, r1, from = -Math.PI, to = 0, seed = 5) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const spots = [];
  for (let k = 0; k < n; k++) {
    const a = from + (to - from) * ((k + rnd() * 0.7) / n), d = r0 + rnd() * (r1 - r0);
    const px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d;
    spots.push([px, pz, Math.atan2(x - px, z - pz)]);
  }
  return visitors(spots, seed);
}

// A vault painted all over (the Sistine ceiling, the Uffizi's grotesques): a barrel along z over
// x0..x1 from its springing at y, `rise` high at the crown, the picture laid on it with u along z and
// v across, `repeat` times each way. Its own mesh, to add to the building's group.
export function paintedVault(x0, z0, x1, z1, y, rise, tex, { repeat = [1, 1], n = 24, flat = 0 } = {}) {
  const W = x1 - x0, pos = [], uv = [];
  // flat: how much of the crown is flattened (the Sistine's vault is low and wide)
  const at = i => { const a = Math.PI * (i / n); return [x0 + (W * (1 - Math.cos(a))) / 2, y + Math.pow(Math.sin(a), 1 - flat) * rise]; };
  for (let i = 0; i < n; i++) {
    const [xa, ya] = at(i), [xb, yb] = at(i + 1), va = (i / n) * repeat[1], vb = ((i + 1) / n) * repeat[1];
    pos.push(xa, ya, z0, xa, ya, z1, xb, yb, z0, xb, yb, z0, xa, ya, z1, xb, yb, z1);
    uv.push(0, va, repeat[0], va, 0, vb, 0, vb, repeat[0], va, repeat[0], vb);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide }));
}

// a floor material from a picture that repeats every `square` × 2 metres (Parts.floor lays it)
export function patternFloor(tex, square = 2) {
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
  m.userData = { square, diagonal: false };
  return m;
}

// a round wall to bump into: n stretches round (x, z) at radius r, leaving out the gaps
// [from, to] (angles, 0 towards +z, going round towards +x)
export function roundWall(p, x, z, r, n = 32, gaps = [], t = 1.2) {
  const open = a => gaps.some(([g0, g1]) => a > g0 && a < g1);
  for (let k = 0; k < n; k++) {
    const a0 = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2;
    if (open((a0 + a1) / 2)) continue;
    p.wallRing([x + Math.sin(a0) * r, z + Math.cos(a0) * r], [x + Math.sin(a1) * r, z + Math.cos(a1) * r], t);
  }
}

// Visitors walking round the rooms, stopping a while before a picture or a statue (the ones hung
// with framed() and put up on a plinth()) and going on to the next: round each hall() with
// something in it to see, on a ring a few metres in from its walls, kept clear of what stands in
// the room (p.foot). One about every `per` square metres of floor, at most `max` to a room. Add it
// after everything is up, before p.mesh(); they walk as long as the building is in sight.
export function wanderers(p, seed = 7, { per = 90, max = 6 } = {}) {
  const g = new THREE.Group(), walkers = [];
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const sights = p.sights ?? [];
  for (const R of p.halls ?? []) {
    const inRoom = sights.filter(([x, z]) => x > R.x0 && x < R.x1 && z > R.z0 && z < R.z1);
    const W = R.x1 - R.x0, D = R.z1 - R.z0, n = Math.min(max, Math.round((W * D) / per));
    if (!inRoom.length || n < 1) continue;
    const ring = clearRing(p, R);
    if (!ring) continue;
    // the stops: for each sight the nearest spot on the ring, facing it
    const stops = inRoom.map(([x, z]) => { const t = ring.nearest(x, z), [px, pz] = ring.at(t); return { t, yaw: Math.atan2(x - px, z - pz) }; }).sort((a, b) => a.t - b.t);
    for (let k = 0; k < n; k++) {
      const who = visitor(rnd, false);
      who.g.traverse(m => { m.castShadow = false; });
      g.add(who.g);
      const stop = Math.floor(rnd() * stops.length);
      walkers.push({ who, ring, stops, stop, t: stops[stop].t, dir: rnd() < 0.5 ? 1 : -1, wait: rnd() * 8, speed: 1.2 + rnd() * 0.5, phase: rnd() * 6, yaw: stops[stop].yaw });
    }
  }
  // one step for all of them each frame they are drawn (a mesh drawing nothing, never culled, calls
  // it); a second view in split screen the same frame does not step them again
  let last = 0;
  const tick = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial());
  tick.frustumCulled = false;
  tick.onBeforeRender = () => {
    const now = performance.now() / 1000, dt = Math.min(0.1, now - (last || now));
    last = now;
    if (dt > 0) for (const w of walkers) stroll(w, dt, rnd);
  };
  g.add(tick);
  for (const w of walkers) stroll(w, 0, rnd);
  return g;
}

function stroll(w, dt, rnd) {
  const { who, ring } = w;
  let walking = false;
  if (w.wait > 0) {
    w.wait -= dt;
    w.yaw = turnTo(w.yaw, w.stops[w.stop].yaw, dt * 3);
  } else {
    // on along the ring to the next stop, the way it goes
    const next = w.stops[(w.stop + w.dir + w.stops.length) % w.stops.length];
    let gap = (next.t - w.t) * w.dir;
    if (gap < 0) gap += ring.length;
    const step = w.speed * dt;
    if (gap <= step) {
      w.t = next.t;
      w.stop = (w.stop + w.dir + w.stops.length) % w.stops.length;
      // stop to look a while, or now and then walk past it; once in a while turn back
      w.wait = rnd() < 0.75 ? 4 + rnd() * 10 : 0;
      if (rnd() < 0.15) w.dir = -w.dir;
    } else {
      w.t = (w.t + step * w.dir + ring.length) % ring.length;
      walking = true;
      const [ax, az] = ring.at(w.t), [bx, bz] = ring.at((w.t + 0.3 * w.dir + ring.length) % ring.length);
      w.yaw = turnTo(w.yaw, Math.atan2(bx - ax, bz - az), dt * 5);
    }
  }
  const [x, z] = ring.at(w.t);
  w.phase += walking ? dt * w.speed * 3.2 : 0;
  const swing = walking ? Math.sin(w.phase) : 0, a = swing * 0.45;
  who.g.position.set(x, 0.06 + (walking ? Math.abs(Math.cos(w.phase)) * 0.04 : 0), z);
  who.g.rotation.y = w.yaw;
  who.legs[0].rotation.x = a;
  who.legs[1].rotation.x = -a;
  who.arms[0].rotation.x = -a * 0.7;
  who.arms[1].rotation.x = a * 0.7;
}

const turnTo = (from, to, k) => { const d = Math.atan2(Math.sin(to - from), Math.cos(to - from)); return from + d * Math.min(1, k); };

// A ring round the inside of a room, the first a little way in from its walls that keeps clear of
// what stands in it (p.foot, but for the walls'), as { length, at(t) -> [x, z], nearest(x, z) -> t }
function clearRing(p, R) {
  const W = R.x1 - R.x0, D = R.z1 - R.z0;
  for (let ins = 2.2; ins < Math.min(W, D) / 2 - 0.6; ins += 0.4) {
    const ring = rectRing(R.x0 + ins, R.z0 + ins, R.x1 - ins, R.z1 - ins);
    let clear = true;
    for (let t = 0; t < ring.length && clear; t += 0.5) {
      const [x, z] = ring.at(t);
      clear = !p.foot.some(f => nearQuad(f, x, z, 0.55));
    }
    if (clear) return ring;
  }
  return null;
}

function rectRing(x0, z0, x1, z1) {
  const W = x1 - x0, D = z1 - z0, length = 2 * (W + D);
  const at = t => {
    t = ((t % length) + length) % length;
    if (t < W) return [x0 + t, z0];
    if ((t -= W) < D) return [x1, z0 + t];
    if ((t -= D) < W) return [x1 - t, z1];
    return [x0, z1 - (t - W)];
  };
  const nearest = (x, z) => {
    const cx = Math.min(x1, Math.max(x0, x)), cz = Math.min(z1, Math.max(z0, z));
    const d = [cz - z0, x1 - cx, z1 - cz, cx - x0], k = d.indexOf(Math.min(...d));
    return [cx - x0, W + cz - z0, W + D + x1 - cx, 2 * W + D + z1 - cz][k] % length;
  };
  return { length, at, nearest };
}

// whether (x, z) is within m of a ring to bump into (four corners, as Parts.block and wallRing make)
function nearQuad(f, x, z, m) {
  let pos = 0, neg = 0, best = Infinity;
  for (let k = 0; k < 8; k += 2) {
    const ax = f[k], az = f[k + 1], bx = f[(k + 2) % 8], bz = f[(k + 3) % 8];
    const ex = bx - ax, ez = bz - az, L2 = ex * ex + ez * ez || 1;
    const u = Math.max(0, Math.min(1, ((x - ax) * ex + (z - az) * ez) / L2));
    best = Math.min(best, Math.hypot(ax + ex * u - x, az + ez * u - z));
    if (ex * (z - az) - ez * (x - ax) < 0) neg++; else pos++;
  }
  return best < m || !pos || !neg; // (inside: on the same side of all four edges, whichever way round they go)
}
