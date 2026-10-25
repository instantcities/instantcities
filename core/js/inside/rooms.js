// What a museum's rooms are built from, on top of the churches' Parts (gothic.js): a hall of four
// walls with doorways in them, a flat, coffered, skylit or barrel-vaulted ceiling, pictures in gilt
// frames, statues' plinths, benches, a rope on posts before the famous one, glass cases, and the
// visitors standing about. A museum is a few of its key rooms joined by doorways, not its real plan.
//
// Game metres (1.25 to a real metre), x across and z along, the door out in the south (-z) wall.
import * as THREE from 'three';
import { person, SKINS, HAIRS } from '../person.js';

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
    // the wall between the doorways, to bump into
    let from = 0;
    const at = u => [a[0] + ((b[0] - a[0]) * u) / L, a[1] + ((b[1] - a[1]) * u) / L];
    for (const d of [...ds].sort((m, n) => m.u - n.u)) {
      if (d.u - d.w / 2 > from + 0.1) p.wallRing(at(from), at(d.u - d.w / 2), t);
      from = d.u + d.w / 2;
    }
    if (L > from + 0.1) p.wallRing(at(from), at(L), t);
  }
  return { x0, z0, x1, z1, h };
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
// the frame `f` wide; a little label beside it. Painted on the wall, so nobody bumps into it.
export function framed(p, tex, w, h, x, y, z, ry = 0, { f = 0.35, color = GOLD, label = true } = {}) {
  const c = Math.cos(ry), s = Math.sin(ry), off = 0.06;
  p.picture(tex, w, h, x + s * off, y, z + c * off, ry);
  const put = (bw, bh, dx, dy) => p.gold.box(bw, bh, 0.16, color, x + c * dx, y + dy, z - s * dx, 0, ry, 0);
  put(w + 2 * f, f, 0, h / 2 + f / 2);
  put(w + 2 * f, f, 0, -h / 2 - f / 2);
  put(f, h, -w / 2 - f / 2, 0);
  put(f, h, w / 2 + f / 2, 0);
  if (label) p.marble.box(0.5, 0.3, 0.05, 0xf4f0e6, x + c * (w / 2 + f + 0.6) + s * 0.03, Math.min(y, 1.6), z - s * (w / 2 + f + 0.6) + c * 0.03, 0, ry, 0);
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
    const k = Math.floor(rnd() * 1000);
    const skirt = rnd() < 0.3 ? [CLOTHES[(k + 3) % CLOTHES.length], 0.5 + rnd() * 0.3, 0.05] : null;
    const phone = rnd() < 0.35;
    const who = person({
      top: CLOTHES[k % CLOTHES.length], legs: CLOTHES[(k * 7 + 1) % CLOTHES.length], skin: SKINS[k % SKINS.length], hair: HAIRS[(k * 3) % HAIRS.length],
      long: rnd() < 0.4, short: rnd() < 0.3, tall: 0.9 + rnd() * 0.15, arms: phone ? ['down', 'front'] : ['down', 'down'], ...(skirt ? { skirt } : {}),
    });
    if (phone) who.arms[1].add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.015), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 })).translateY(-0.6));
    who.g.position.set(x, 0.06, z);
    who.g.rotation.y = yaw;
    who.g.scale.multiplyScalar(1.25);
    who.g.traverse(m => { m.castShadow = false; });
    g.add(who.g);
  }
  return g;
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
