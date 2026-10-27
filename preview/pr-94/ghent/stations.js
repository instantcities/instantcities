// Ghent's two railway stations, modelled by hand on their real outlines and drawn from photos
// (Wikimedia Commons, in tools/cache/photos/): each joins the statues (ghent/monuments.js) as one
// model standing in for the map's boxes on its ground (its `area`), with its own outlines to bump
// into (its `foot`): the building, the platforms and the trains waiting at them.
//
//   Gent-Sint-Pieters  Louis Cloquet's station of 1912 in red brick and white stone, its round
//                      clock tower on the square, the long wings with corner pavilions, and behind
//                      it the platforms under their canopies and the big new roof over the middle
//   Gent-Dampoort      the low station of pale brick under a white fascia, its entrance canopy on
//                      steel trusses, the four coloured pillars that say GENT-DAMPOORT, and the
//                      island platform under its teal roof
//
// The tracks, platforms and platform roofs are OpenStreetMap's (ghent/railways.js, made by
// tools/railways.mjs); the station buildings' outlines the map's own.
import * as THREE from 'three';
import { MAP } from './map.js';
import { RAILWAYS } from './railways.js';
import { brick, crossWindow, roundArch, stringCourse, clock, shade, rng } from '../core/js/facades.js';
import { Kit, kitMat } from '../core/js/kit.js';
import { S, walls, slab, grow, inside, spine, ribbon, along, tiled, mat, mesh } from './blocks.js';

// the map's building of this kind nearest to (x, z), as its flat outline
function outline(kind, x, z) {
  let best = null, dist = Infinity;
  for (const b of MAP.buildings) {
    if (b.k !== kind) continue;
    const n = b.p.length / 2;
    let cx = 0, cz = 0;
    for (let k = 0; k < n; k++) { cx += b.p[2 * k] / n; cz += b.p[2 * k + 1] / n; }
    const d = Math.hypot(cx - x, cz - z);
    if (d < dist) { dist = d; best = b.p; }
  }
  return dist < 40 ? best : null;
}

const middle = ring => {
  const n = ring.length / 2;
  let x = 0, z = 0;
  for (let k = 0; k < n; k++) { x += ring[2 * k] / n; z += ring[2 * k + 1] / n; }
  return [x, z];
};

// a rectangle as a flat ring: centre (x, z), `len` along the way a (radians from +x towards +z), `wid` across
function rect(x, z, a, len, wid) {
  const ux = Math.cos(a), uz = Math.sin(a), vx = -uz, vz = ux;
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].flatMap(([p, q]) => [x + ux * p * len / 2 + vx * q * wid / 2, z + uz * p * len / 2 + vz * q * wid / 2]);
}

// a saddle roof `len` long (along x), `wid` across, its ridge `h` above the eaves at y = 0
function saddle(len, wid, h) {
  const t = new THREE.Shape([new THREE.Vector2(-wid / 2, 0), new THREE.Vector2(wid / 2, 0), new THREE.Vector2(0, h)]);
  return new THREE.ExtrudeGeometry(t, { depth: len, bevelEnabled: false }).translate(0, 0, -len / 2).rotateY(Math.PI / 2);
}

// ------------------------------------------------------------------ what both stations share

const PLATFORM = 0.76 * S; // the high platforms of today, 76 cm above the rails
const GAUGE = 1.435 * S;

const textures = {};
const tex = (key, make) => (textures[key] ??= make());

// the ballast and sleepers under a track, one sleeper a tile, across the width of the bed
const bedTex = () => tex('bed', () => tiled(3.4, 0.8, 40, (g, w, h) => {
  const r = rng(11);
  g.fillStyle = '#6f675e';
  g.fillRect(0, 0, w, h);
  for (let k = 0; k < 220; k++) {
    g.fillStyle = shade('#7b7268', (r() - 0.5) * 0.5);
    g.fillRect(r() * w, r() * h, 0.06, 0.05);
  }
  g.fillStyle = '#9b968c';
  g.fillRect(0.4, 0.22, w - 0.8, 0.34);
  g.fillStyle = '#6d6962';
  g.fillRect(0.4, 0.22, w - 0.8, 0.05);
}));

const paverTex = () => tex('pavers', () => tiled(4, 4, 24, (g, w, h) => {
  const r = rng(5);
  g.fillStyle = '#8f8d88';
  g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 0.5) for (let x = 0; x < w; x += 0.5) {
    g.fillStyle = shade('#b4b1aa', (r() - 0.5) * 0.12);
    g.fillRect(x + 0.02, y + 0.02, 0.46, 0.46);
  }
}));

// The tracks of a station: each a bed of ballast and sleepers with its two rails on it, the
// overhead wire above it on masts beside it every 60 m.
function tracks(rails, ox, oz) {
  const g = new THREE.Group();
  const bed = [], rail = [], wire = [], k = new Kit();
  rails.forEach((line, i) => {
    const y = 0.03 + (i % 7) * 0.004; // where two tracks' beds overlap, at the points
    bed.push(ribbon(line, 3.4, y, { rep: 0.8, ox, oz }));
    for (const side of [-GAUGE / 2, GAUGE / 2]) {
      rail.push(ribbon(line, 0.18, y, { h: 0.2, side, ox, oz }));
      rail.push(ribbon(line, 0.1, y + 0.2, { side, ox, oz }));
    }
    wire.push(ribbon(line, 0.06, 6.4, { h: 0.06, ox, oz }));
    for (const [x, z, a] of along(line, 60, 20 + (i % 3) * 15)) {
      const lx = -Math.sin(a), lz = Math.cos(a), mx = x - ox + lx * 2.6, mz = z - oz + lz * 2.6;
      k.box(0.35, 7.6, 0.35, 0x8d9296, mx, 3.8, mz, 0, -a, 0);
      k.rod([mx, 6.9, mz], [x - ox, 6.9, z - oz], 0.06, 0x8d9296, 4);
      k.rod([mx, 7.4, mz], [x - ox, 6.6, z - oz], 0.04, 0x8d9296, 4);
    }
  });
  const merge = list => {
    const out = new THREE.BufferGeometry(), pos = [], uv = [];
    for (const geo of list) { pos.push(...geo.attributes.position.array); uv.push(...geo.attributes.uv.array); }
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    out.computeVertexNormals();
    return out;
  };
  const bedTx = bedTex();
  g.add(mesh(merge(bed), mat({ map: bedTx, roughness: 1 }), false));
  g.add(mesh(merge(rail), mat({ color: 0x8b8580, metalness: 0.6, roughness: 0.4 }), false));
  g.add(mesh(merge(wire), mat({ color: 0x2d2f31 }), false));
  g.add(k.mesh(kitMat(0.6, 0.3)));
  return g;
}

// the platforms, raised to their height, paved on top
function platforms(list, ox, oz) {
  const g = new THREE.Group(), top = mat({ map: paverTex() }), side = mat({ color: 0x8a8781 });
  for (const pl of list) g.add(mesh(slab(pl.p, 0, PLATFORM, ox, oz), [top, side]));
  return g;
}

// A train waiting at a platform, its cars along the track from `s` metres in: a Desiro of NMBS,
// white with yellow fronts and doors and a dark band of windows. Returns { group, foot }.
function train(line, s, cars, ox, oz) {
  const L = 26 * S, W = 2.9 * S, H = 3.9 * S, k = new Kit(), foot = [];
  const pts = [];
  let run = 0;
  for (let i = 0; i + 3 < line.length; i += 2) {
    const len = Math.hypot(line[i + 2] - line[i], line[i + 3] - line[i + 1]);
    pts.push([run, line[i], line[i + 1], line[i + 2], line[i + 3], len]);
    run += len;
  }
  const at = t => {
    const p = pts.find(q => t <= q[0] + q[5]) ?? pts.at(-1), f = Math.min(1, Math.max(0, (t - p[0]) / p[5]));
    return [p[1] + (p[3] - p[1]) * f, p[2] + (p[4] - p[2]) * f];
  };
  for (let c = 0; c < cars; c++) {
    const a0 = at(s + c * (L + 0.8)), a1 = at(s + c * (L + 0.8) + L);
    const x = (a0[0] + a1[0]) / 2 - ox, z = (a0[1] + a1[1]) / 2 - oz, a = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
    const ry = -a, ux = Math.cos(a), uz = Math.sin(a), vx = -uz, vz = ux;
    const put = (w, h, d, hex, along = 0, y = 0, across = 0) => k.box(w, h, d, hex, x + ux * along + vx * across, y, z + uz * along + vz * across, 0, ry, 0);
    const base = 1.1;
    put(L - 2, 0.7, W * 0.8, 0x2a2b2d, 0, base - 0.1); // the bogies and the skirt
    put(L, H - 1.2, W, 0xf1f1ee, 0, base + (H - 1.2) / 2);
    put(L - 0.4, 0.9, W - 0.3, 0xdcdcd8, 0, base + H - 0.75); // the roof
    put(L - 1.2, 1.3, W + 0.04, 0x1f2a33, 0, base + 2.6); // the windows
    put(L - 1.2, 0.25, W + 0.05, 0xd8a400, 0, base + 1.5); // a yellow line
    for (const d of [-L * 0.3, L * 0.3]) put(1.6, 2.6, W + 0.06, 0xf3c300, d, base + 1.6); // the doors
    if (c === 0 || c === cars - 1) {
      const end = c === 0 ? -1 : 1;
      put(2.2, H - 1, W - 0.1, 0xf3c300, end * (L / 2 - 0.9), base + (H - 1) / 2 + 0.2); // the yellow nose
      put(0.3, 1.2, W - 0.6, 0x1b2329, end * (L / 2 + 0.1), base + 2.7); // the windscreen
      for (const q of [-0.9, 0.9]) put(0.2, 0.3, 0.4, 0xfff6d8, end * (L / 2 + 0.1), base + 1.2, q);
    }
    if (c === 1) k.rod([x, base + H, z], [x + ux * 1.5, base + H + 1.6, z + uz * 1.5], 0.05, 0x333333, 4); // the pantograph
    foot.push(rect(x + ox, z + oz, a, L, W));
  }
  return { group: k.mesh(kitMat(0.5, 0.15)), foot };
}

// ------------------------------------------------------------------ Gent-Sint-Pieters

const BRICK = '#a54e39', STONE = '#d6cfc0', SLATE = 0x4b5056, SP_EAVES = 13 * S, SP_PARAPET = 14.4 * S;

// a bay of the wings, 4.5 m: brick over a stone plinth, three floors of stone-framed windows (the
// ground floor's round-headed), stone bands and a stone parapet with merlons along the top
const spBay = () => tex('spBay', () => tiled(4.5, SP_PARAPET, 24, (g, w, h) => {
  brick(g, 0, 0, w, h, BRICK, { course: 0.25 });
  g.fillStyle = STONE;
  g.fillRect(0, 0, w, 1.2);
  for (const y of [5.6, 10.6, 15.0]) stringCourse(g, 0, w, y, STONE, 0.5);
  for (const y of [3.4, 8.4, 12.8]) { g.fillStyle = shade(STONE, -0.05); g.fillRect(0, y, w, 0.22); }
  roundArch(g, w / 2, 1.5, 2.3, 3.8, STONE);
  roundArch(g, w / 2, 1.7, 1.8, 3.4, '#2a333c');
  g.fillStyle = STONE;
  g.fillRect(w / 2 - 0.07, 1.7, 0.14, 2.6);
  crossWindow(g, w / 2, 6.6, 1.7, 2.9, { stone: STONE });
  crossWindow(g, w / 2, 11.5, 1.5, 2.4, { stone: STONE });
  g.fillStyle = shade(STONE, 0.05);
  g.fillRect(0, SP_EAVES - 0.3, w, h - SP_EAVES + 0.3);
  g.fillStyle = shade(STONE, -0.5);
  for (const x of [0.5, 2.75]) g.fillRect(x, h - 1.1, 1.25, 1.1); // the gaps between the merlons
}));

// the hall's sides: a great round-arched window of many lights under a stone gable band
const hallBay = () => tex('hallBay', () => tiled(11, 20 * S, 16, (g, w, h) => {
  brick(g, 0, 0, w, h, BRICK, { course: 0.25 });
  g.fillStyle = STONE;
  g.fillRect(0, 0, w, 1.2);
  roundArch(g, w / 2, 2.5, 8.4, 17, STONE);
  roundArch(g, w / 2, 2.9, 7.6, 16.2, '#2c3641');
  g.fillStyle = STONE;
  for (let x = w / 2 - 3; x <= w / 2 + 3.1; x += 1.5) g.fillRect(x - 0.08, 2.9, 0.16, 13.2);
  for (const y of [7, 11.5]) g.fillRect(w / 2 - 3.8, y, 7.6, 0.18);
  stringCourse(g, 0, w, h - 3, STONE, 0.7);
  g.fillStyle = shade(STONE, 0.05);
  g.fillRect(0, h - 1.4, w, 1.4);
}));

const towerTex = () => tex('tower', () => tiled(16.3, 26 * S, 16, (g, w, h) => {
  brick(g, 0, 0, w, h, '#b05a43', { course: 0.25 });
  g.fillStyle = STONE;
  g.fillRect(0, 0, w, 1.3);
  for (let y = 2.5; y < h - 1; y += 2.4) g.fillRect(0, y, w, 0.35);
  for (const x of [w * 0.25, w * 0.75]) for (const y of [8, 17, 25]) {
    g.fillRect(x - 0.55, y - 0.2, 1.1, 2.4);
    roundArch(g, x, y, 0.6, 1.8, '#26303a');
  }
}));

const clockTex = () => tex('clock', () => {
  const t = tiled(6.6, 6, 32, (g, w, h) => {
    g.fillStyle = '#d9d0bc';
    g.fillRect(0, 0, w, h);
    g.fillStyle = shade('#d9d0bc', -0.2);
    g.fillRect(0, 0, w, 0.4);
    g.fillRect(0, h - 0.5, w, 0.5);
    for (const x of [0.4, w - 0.4]) g.fillRect(x - 0.25, 0, 0.5, h);
    clock(g, w / 2, h / 2, 2.3, { gold: '#2d2d2d', dial: '#f2efe4' });
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
});

function sintPieters() {
  const st = RAILWAYS['sint-pieters'];
  const ring = outline('train_station', -1134, 2390);
  const porch = outline('roof', -1121, 2360);
  const [ox, oz] = middle(ring);
  const g = new THREE.Group(), foot = [ring];
  const slate = mat({ color: SLATE, roughness: 0.7 });

  // the wings, on the building's own outline
  g.add(mesh(walls(ring, 0, SP_PARAPET, 4.5, ox, oz), mat({ map: spBay() })));
  g.add(mesh(slab(ring, SP_EAVES - 0.5, SP_EAVES, ox, oz), slate));
  // their roofs: long slate ridges behind the parapet, the way the wings run
  const a = Math.atan2(2433.2 - 2372.7, -1052.4 + 1223.3);
  const roof = new Kit();
  for (const [x, z, len] of [[-1184, 2372, 62], [-1076, 2408, 50]]) roof.add(saddle(len, 19, 6), SLATE, x - ox, SP_EAVES - 0.2, z - oz, 0, -a, 0);

  // the corner pavilions at both ends of the wings, a storey higher under steep pyramid roofs
  // with stone pinnacles at the corners
  for (const [x, z] of [[-1208, 2362], [-1056, 2416]]) {
    const pr = rect(x, z, a, 15, 16), h = SP_PARAPET + 3.5;
    g.add(mesh(walls(pr, 0, h, 4.5, ox, oz), mat({ map: spBay() })));
    roof.add(new THREE.ConeGeometry(10.5, 9, 4, 1).rotateY(Math.PI / 4).scale(15 / 14.8, 1, 16 / 14.8), SLATE, x - ox, h + 4.5, z - oz, 0, -a, 0);
    for (const [p, q] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const cx = x + Math.cos(a) * p * 7.5 - Math.sin(a) * q * 8, cz = z + Math.sin(a) * p * 7.5 + Math.cos(a) * q * 8;
      roof.box(1.1, 3.2, 1.1, 0xcfc8b8, cx - ox, h + 1.6, cz - oz);
      roof.add(new THREE.ConeGeometry(0.7, 1.8, 4), 0xcfc8b8, cx - ox, h + 4.1, cz - oz, 0, Math.PI / 4, 0);
    }
  }

  // the booking hall in the middle, higher than the wings, its great windows to the square and
  // the tracks, under a slate saddle roof
  const hx = -1118, hz = 2383, hall = rect(hx, hz, a, 30, 24), hh = 20 * S;
  g.add(mesh(walls(hall, 0, hh, 11, ox, oz), mat({ map: hallBay() })));
  roof.add(saddle(24.6, 30.6, 9), SLATE, hx - ox, hh - 0.2, hz - oz, 0, -a + Math.PI / 2, 0);

  // the glass canopy over the way in, on slender posts
  if (porch) {
    g.add(mesh(slab(porch, 5.4, 5.7, ox, oz), mat({ color: 0x9fb3bf, transparent: true, opacity: 0.55, metalness: 0.3, roughness: 0.2 }), false));
    const n = porch.length / 2;
    for (let k = 0; k < n; k += 4) roof.box(0.2, 5.4, 0.2, 0x5b6065, porch[2 * k] - ox, 2.7, porch[2 * k + 1] - oz);
  }

  // the clock tower on the square: a round shaft of brick banded in stone, the clock stage with a
  // dial on every side, and a lead dome with a lantern on top
  const tx = -1134.8, tz = 2368.2, shaft = 26 * S;
  const tower = mesh(new THREE.CylinderGeometry(2.6, 2.8, shaft, 20, 1, true), mat({ map: towerTex() }));
  tower.position.set(tx - ox, shaft / 2, tz - oz);
  g.add(tower);
  roof.add(new THREE.CylinderGeometry(3.4, 2.7, 1.2, 4).rotateY(Math.PI / 4), 0xcfc8b8, tx - ox, shaft + 0.6, tz - oz, 0, -a, 0);
  const stage = mesh(new THREE.BoxGeometry(6.6, 6, 6.6), mat({ map: clockTex() }));
  stage.position.set(tx - ox, shaft + 4.2, tz - oz);
  stage.rotation.y = -a;
  g.add(stage);
  roof.add(new THREE.CylinderGeometry(4.0, 3.4, 0.8, 4).rotateY(Math.PI / 4), 0xcfc8b8, tx - ox, shaft + 7.6, tz - oz, 0, -a, 0);
  roof.add(new THREE.SphereGeometry(3.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.95, 1), 0x9aa3a8, tx - ox, shaft + 8, tz - oz);
  roof.add(new THREE.CylinderGeometry(0.7, 0.8, 1.6, 8), 0x9aa3a8, tx - ox, shaft + 11.6, tz - oz);
  roof.add(new THREE.SphereGeometry(0.45, 8, 6), 0x9aa3a8, tx - ox, shaft + 12.7, tz - oz);
  roof.rod([tx - ox, shaft + 12.9, tz - oz], [tx - ox, shaft + 14.4, tz - oz], 0.08, 0x6b7176, 4);
  foot.push(rect(tx, tz, a, 6, 6));

  // the tracks and the platforms behind the station
  g.add(tracks(st.rails, ox, oz));
  g.add(platforms(st.platforms, ox, oz));
  foot.push(...st.platforms.map(pl => pl.p));

  // the big roof over the middle of the platforms, on tall white columns standing on them
  const big = st.roofs.map(rf => rf.p), under = (x, z) => big.some(r => inside(x, z, r));
  const steel = new Kit();
  for (const r of big) {
    g.add(mesh(slab(r, 12.4, 13.2, ox, oz), [mat({ color: 0xd9dcdc, metalness: 0.2, roughness: 0.5 }), mat({ color: 0x9aa0a4 })]));
  }
  // and the older canopies over the rest of each platform: a grey roof on a row of posts down
  // the middle, the departure boards hanging under it
  const canopy = pts => {
    const line = pts.flatMap(p => [p.x, p.z]), w = Math.min(7.5, Math.max(3, Math.min(...pts.map(p => p.w)) * 0.8));
    g.add(mesh(ribbon(line, w, PLATFORM + 4.3, { ox, oz }), mat({ color: 0x8e979c, roughness: 0.6 })));
    g.add(mesh(ribbon(line, w, PLATFORM + 4.6, { ox, oz }), mat({ color: 0x6c7377, roughness: 0.6 })));
  };
  for (const pl of st.platforms) {
    let run = [];
    spine(pl.p, 6).forEach((p, i) => {
      if (under(p.x, p.z)) {
        if (i % 4 === 0) steel.rod([p.x - ox, PLATFORM, p.z - oz], [p.x - ox, 12.4, p.z - oz], 0.4, 0xe8e8e4, 8);
      } else if (p.w > 3.5) {
        run.push(p);
        if (i % 2 === 0) steel.rod([p.x - ox, PLATFORM, p.z - oz], [p.x - ox, PLATFORM + 4.3, p.z - oz], 0.18, 0x6f7a80, 6);
        if (i % 10 === 5) steel.box(2.6, 0.6, 0.15, 0x1d2328, p.x - ox, PLATFORM + 3.3, p.z - oz, 0, -p.a + Math.PI / 2, 0);
        return;
      }
      if (run.length > 1) canopy(run);
      run = [];
    });
    if (run.length > 1) canopy(run);
  }

  // two trains waiting, one at each side of the middle platforms
  for (const [i, s, cars] of [[38, 90, 4], [39, 150, 3]]) {
    if (!st.rails[i]) continue;
    const t = train(st.rails[i], s, cars, ox, oz);
    g.add(t.group);
    foot.push(...t.foot);
  }
  g.add(roof.mesh(kitMat(0.75)));
  g.add(steel.mesh(kitMat(0.5, 0.4)));
  return { x: ox, z: oz, group: g, foot, area: [grow(ring, 1), ...(porch ? [porch] : []), ...big] };
}

// ------------------------------------------------------------------ Gent-Dampoort

const DP_WALL = 4.2 * S, DP_TOP = 5.4 * S;

// the station's front: pale yellow brick up to the sills, big windows in white frames above
const dpBay = () => tex('dpBay', () => tiled(6, DP_WALL, 24, (g, w, h) => {
  brick(g, 0, 0, w, h, '#d8cba5', { course: 0.2 });
  g.fillStyle = '#e9eef0';
  g.fillRect(0.2, 1.9, w - 0.4, h - 2.3);
  g.fillStyle = '#33424c';
  g.fillRect(0.35, 2.05, w - 0.7, h - 2.6);
  g.fillStyle = '#4c6170';
  g.fillRect(0.5, h - 1.3, w / 2 - 0.8, 0.6);
  g.fillStyle = '#e9eef0';
  g.fillRect(w / 2 - 0.06, 2.05, 0.12, h - 2.6);
}));

// the white fascia of ribbed steel round the top
const fasciaTex = () => tex('fascia', () => tiled(2, 1, 32, (g, w, h) => {
  g.fillStyle = '#eef0ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c9cdcc';
  for (let x = 0; x < w; x += 0.25) g.fillRect(x, 0, 0.06, h);
}));

// a pillar's lettering, GENT-DAMPOORT running up it, on both sides
const pillarTex = colour => tex('pillar' + colour, () => {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = colour;
  g.fillRect(0, 0, 256, 512);
  g.fillStyle = '#ffffff';
  g.font = 'bold 30px sans-serif';
  g.textAlign = 'center';
  for (const x of [64, 192]) {
    g.save();
    g.translate(x, 300);
    g.rotate(-Math.PI / 2);
    g.fillText('GENT-DAMPOORT', 0, 10);
    g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
});

function dampoort() {
  const st = RAILWAYS.dampoort;
  const ring = outline('train_station', 1447, -362);
  const front = outline('roof', 1437, -414);
  const [ox, oz] = middle(ring);
  const g = new THREE.Group(), k = new Kit(), foot = [ring];

  // the station: pale brick and glass, the white fascia standing a little proud of it, a flat roof
  g.add(mesh(walls(ring, 0, DP_WALL, 6, ox, oz), mat({ map: dpBay() })));
  g.add(mesh(walls(grow(ring, 0.35), DP_WALL, DP_TOP, 0, ox, oz), mat({ map: fasciaTex() })));
  g.add(mesh(slab(ring, DP_TOP - 0.3, DP_TOP - 0.1, ox, oz), mat({ color: 0x8c8f90 })));

  // the canopy over the way in: the same white fascia round a flat roof, on dark steel trusses
  // that fan out from a few columns
  if (front) {
    g.add(mesh(walls(front, DP_TOP - 1.2, DP_TOP, 0, ox, oz), mat({ map: fasciaTex() })));
    g.add(mesh(slab(front, DP_TOP - 1.2, DP_TOP - 1.0, ox, oz), mat({ color: 0x5d6266 })));
    const n = front.length / 2, [fx, fz] = middle(front);
    for (let i = 0; i < n; i += 3) {
      const px = front[2 * i] + (fx - front[2 * i]) * 0.15 - ox, pz = front[2 * i + 1] + (fz - front[2 * i + 1]) * 0.15 - oz;
      k.rod([px, 0, pz], [px, DP_TOP - 1.2, pz], 0.16, 0x2f3438, 6);
      k.rod([px, DP_TOP - 2.6, pz], [fx - ox, DP_TOP - 1.25, fz - oz], 0.08, 0x2f3438, 4);
      k.rod([front[2 * i] - ox, DP_TOP - 1.25, front[2 * i + 1] - oz], [px, DP_TOP - 2.6, pz], 0.08, 0x2f3438, 4);
    }
  }

  // the four pillars on their low plinth in front of the hall, blue, pink, orange and green
  const COLOURS = ['#1b9ad6', '#e0218a', '#f07c1b', '#7cc242'];
  const px0 = 1415.5, pz0 = -396;
  k.box(2.2, 0.35, 13.5, 0x9a9a96, px0 - ox, 0.17, pz0 + 5.4 - oz);
  COLOURS.forEach((c, i) => {
    const p = mesh(new THREE.CylinderGeometry(0.6, 0.6, 7.2, 20), mat({ map: pillarTex(c), roughness: 0.5 }));
    p.position.set(px0 - ox, 0.35 + 3.6, pz0 + i * 3.6 - oz);
    p.rotation.y = Math.PI / 2;
    g.add(p);
    foot.push(rect(px0, pz0 + i * 3.6, 0, 1.2, 1.2));
  });

  // the tracks and the island platform between them, under a teal steel roof by the station
  g.add(tracks(st.rails, ox, oz));
  g.add(platforms(st.platforms, ox, oz));
  foot.push(...st.platforms.map(pl => pl.p));
  for (const pl of st.platforms) {
    const sp = spine(pl.p, 6).filter(p => p.z > -470 && p.z < -250 && p.w > 4);
    if (sp.length < 2) continue;
    const line = sp.flatMap(p => [p.x, p.z]);
    g.add(mesh(ribbon(line, 6.5, PLATFORM + 4, { ox, oz }), mat({ color: 0xb9b2a2, roughness: 0.8 })));
    g.add(mesh(ribbon(line, 6.5, PLATFORM + 4.25, { ox, oz }), mat({ color: 0x7d8688 })));
    sp.forEach((p, i) => {
      if (i % 2) return;
      k.rod([p.x - ox, PLATFORM, p.z - oz], [p.x - ox, PLATFORM + 4, p.z - oz], 0.22, 0x3e8f86, 6);
      k.box(6.4, 0.35, 0.3, 0x3e8f86, p.x - ox, PLATFORM + 3.85, p.z - oz, 0, -p.a + Math.PI / 2, 0);
      if (i % 6 === 2) {
        // a glass shelter with a bench in it
        k.box(0.12, 2.2, 3.2, 0x7d868b, p.x - ox + Math.cos(p.a) * 1.6, PLATFORM + 1.1, p.z - oz + Math.sin(p.a) * 1.6, 0, -p.a, 0);
        k.box(1.4, 0.45, 3, 0x4c5357, p.x - ox, PLATFORM + 0.45, p.z - oz, 0, -p.a + Math.PI / 2, 0);
      }
    });
  }
  // a train waiting at the platform
  if (st.rails[5]) {
    const t = train(st.rails[5], 70, 3, ox, oz);
    g.add(t.group);
    foot.push(...t.foot);
  }
  g.add(k.mesh(kitMat(0.55, 0.2)));
  return { x: ox, z: oz, group: g, foot, area: [grow(ring, 1), ...(front ? [front] : [])] };
}

// ------------------------------------------------------------------ as monuments

// each built once, the first time anything asks for it (the map is read, the game builds it)
const built = {};
const station = (id, build) => {
  const once = () => (built[id] ??= build());
  const b = once();
  // how far from its middle it reaches: to the ends of its tracks, so it is built as they come into sight
  let reach = 0;
  for (const line of RAILWAYS[id].rails) for (let k = 0; k < line.length; k += 2) reach = Math.max(reach, Math.hypot(line[k] - b.x, line[k + 1] - b.z));
  return { id, name: id === 'sint-pieters' ? 'Station Gent-Sint-Pieters' : 'Station Gent-Dampoort', x: b.x, z: b.z, turn: 0, reach, area: b.area, foot: b.foot, make: () => once().group };
};

export const STATIONS = [station('sint-pieters', sintPieters), station('dampoort', dampoort)];
