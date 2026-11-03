import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { boxGeo, outline, slab, tinted } from './cars.js';
import { tramNetwork, lineNetwork, tramFleet, behind } from './tramnet.js';
import { letGo } from './facades.js';

// Trams on the map's tram tracks: Ghent's long white De Lijn trams, five sections on bogies with
// bellows between them and a cab at both ends. They drive on the right, each track one way, round
// the network (see tramnet.js): halting at the stops, keeping their distance, and at the end of the
// line crossing over to the track back. More of them, and slower, in the city centre. Where the city
// has its tram lines (tramlines.js) each tram keeps to one, and can be ridden (see game/transit.js).

export const SECTION = 7.6, GAP = 0.5, SECTIONS = 5, W = 2.65;
const LENGTH = SECTIONS * SECTION + (SECTIONS - 1) * GAP;

const WHITE = 0xf2f2ee, GLASS = 0x1c252d, YELLOW = 0xffcc00, GREY = 0xa7adb3, DARK = 0x2f3437;

function rod(a, b, th, hex) {
  const dy = b[1] - a[1], dz = b[2] - a[2];
  return tinted(new THREE.BoxGeometry(th, Math.hypot(dy, dz), th).rotateX(Math.atan2(dz, dy))
    .translate(0, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), hex);
}

// One section, its nose towards +z when it is a cab (end), with the pantograph when it has one.
function sectionGeometry(end, pantograph) {
  const h = SECTION / 2, parts = [];
  const add = (geo, hex) => parts.push(tinted(geo, hex));
  const body = end
    ? [[h - 0.1, 0.35, 0.15], [h + 0.25, 1.2, 0.5], [h, 3.1, 0.6], [-h, 3.25, 0], [-h, 0.35, 0]]
    : [[h, 0.35, 0], [h, 3.25, 0.12], [-h, 3.25, 0.12], [-h, 0.35, 0]];
  add(slab(outline(body, [], 0, 0), W), WHITE);
  // the window band all along both sides, and a windscreen across the cab's nose
  add(boxGeo(W + 0.03, 1.2, 2.65, -h + 0.35, end ? h - 0.7 : h - 0.35), GLASS);
  if (end) add(slab(outline([[h + 0.33, 1.35, 0], [h + 0.12, 2.85, 0], [h - 0.9, 2.85, 0], [h - 0.9, 1.35, 0]], [], 0, 0), W - 0.35), GLASS);
  // a pair of doors, the yellow skirt, the bogie and the roof boxes
  add(boxGeo(W + 0.05, 0.42, 2.7, -0.7, 0.7), 0x5d666d);
  add(boxGeo(W + 0.06, 1.2, 2.6, -0.03, 0.03), WHITE);
  add(boxGeo(W + 0.02, 0.4, 0.7, -h + 0.05, end ? h - 0.25 : h - 0.05), YELLOW);
  add(boxGeo(W - 0.4, 0.05, 0.4, -1.6, 1.6), DARK);
  add(boxGeo(W - 0.7, 3.2, 3.5, -h + 0.8, h - 1.4), GREY);
  // the bellows to the next section behind (the cab at the back is turned round, so its bellows
  // fill the same gap as the section before it)
  add(boxGeo(W - 0.25, 0.45, 3.05, -h - GAP - 0.1, -h + 0.1), DARK);
  if (pantograph) {
    parts.push(rod([0, 3.5, -0.9], [0, 4.9, 0.3], 0.07, DARK), rod([0, 4.9, 0.3], [0, 6.12, -0.1], 0.06, DARK));
    add(boxGeo(1.5, 6.1, 6.16, -0.15, -0.05), DARK);
  }
  return mergeGeometries(parts);
}

// The destination display over the windscreen, at both ends: the line's number on its colour and
// where it goes, lit orange on black, as on the real ones. Turned to the line back when the tram
// turns round at the end of the line.
const SIGN_W = 2.1, SIGN_H = 0.34, SIGN_GEO = new THREE.PlaneGeometry(SIGN_W, SIGN_H);
function destinationSign(cab) {
  const m = new THREE.Mesh(SIGN_GEO, new THREE.MeshBasicMaterial({ map: signFor(null), toneMapped: false }));
  // just over the windscreen, leaning back with the nose
  m.position.set(0, 2.93, SECTION / 2 + 0.07);
  m.rotation.x = -0.13;
  cab.add(m);
  return m.material;
}
function drawSign(sign, line) {
  sign.map = signFor(line);
}

// one display for each line and way, which every tram on it shows (a canvas each was ~17 MB for
// the fleet), its canvas let go once on the GPU
const SIGNS = new Map();
function signFor(line) {
  const key = line ? `${line.ref}|${line.colour}|${line.to}` : '';
  if (SIGNS.has(key)) return SIGNS.get(key);
  const paint = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = Math.round((512 * SIGN_H) / SIGN_W);
    const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    g.fillStyle = '#0b0b0b';
    g.fillRect(0, 0, W, H);
    if (line) {
      const box = H * 1.6;
      g.fillStyle = line.colour || '#d32f2f';
      g.fillRect(4, 4, box, H - 8);
      g.font = `bold ${Math.round(H * 0.72)}px "Lilita One", system-ui, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = '#fff';
      g.fillText(line.ref, 4 + box / 2, H / 2 + 2, box - 8);
      g.textAlign = 'left';
      g.fillStyle = '#ffa31a';
      g.fillText(line.to, box + 18, H / 2 + 2, W - box - 26);
    }
    return canvas;
  };
  const tex = letGo(new THREE.CanvasTexture(paint()), () => { tex.image = paint(); });
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.userData.shared = true;
  SIGNS.set(key, tex);
  return tex;
}

// ctx: the scenery's context (group, r, updaters); trams: the map's tram ways; halts: where along
// the tracks the stops are, flat [x, z, ...]; centre: { x, z, r }, where more trams run, slower;
// lines: the city's TRAM_LINES, if it has them. Returns { fleet, net, LENGTH }, for riding one.
export function addTrams(ctx, trams, halts = [], centre = null, lines = null) {
  if (!trams?.length) return null;
  const net = lines?.length ? lineNetwork(lines) : tramNetwork(trams, halts);
  const fleet = tramFleet(net, { LENGTH, centre, rand: ctx.r });
  if (!fleet.list.length) return null;
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.15 });
  const geo = { end: sectionGeometry(true, false), mid: sectionGeometry(false, false), panto: sectionGeometry(false, true) };
  for (const t of fleet.list) {
    t.sections = [];
    for (let k = 0; k < SECTIONS; k++) {
      const g = k === 0 || k === SECTIONS - 1 ? geo.end : k === (SECTIONS >> 1) ? geo.panto : geo.mid;
      const m = new THREE.Mesh(g, material);
      m.castShadow = m.receiveShadow = true;
      m.rotation.order = 'YXZ';
      m.name = 'tram';
      ctx.group.add(m);
      t.sections.push(m);
    }
    // on the lines' trams the display at each end (the last cab is turned round: its own faces back)
    if (lines?.length) t.signs = [destinationSign(t.sections[0]), destinationSign(t.sections[SECTIONS - 1])];
  }

  // each section between two points on the trail of the nose, one at either end of it
  const f = new THREE.Vector3(), b = new THREE.Vector3();
  const place = t => {
    t.sections.forEach((m, k) => {
      const c = k * (SECTION + GAP) + SECTION / 2;
      behind(t, c - SECTION / 2, f);
      behind(t, c + SECTION / 2, b);
      m.position.set((f.x + b.x) / 2, (f.y + b.y) / 2, (f.z + b.z) / 2);
      // the last section is a cab too, turned to face backwards
      m.rotation.y = Math.atan2(f.x - b.x, f.z - b.z) + (k === t.sections.length - 1 ? Math.PI : 0);
      m.rotation.x = (k === t.sections.length - 1 ? 1 : -1) * Math.atan2(f.y - b.y, Math.hypot(f.x - b.x, f.z - b.z));
    });
  };
  const signs = t => {
    const line = t.edge?.line;
    if (!t.signs || t.signLine === line) return;
    t.signLine = line;
    for (const sg of t.signs) drawSign(sg, line);
  };
  for (const t of fleet.list) { place(t); signs(t); }
  const T = { fleet, net, LENGTH, riders: [] }; // riders: set each frame (game/loop.js), for the trams to halt for
  ctx.updaters.push(dt => {
    fleet.step(dt, T.riders);
    for (const t of fleet.list) { place(t); signs(t); }
  });

  // Push a rider of radius R out of the trams' sections (riding about freely), as js/traffic.js
  // does with the cars; not out of `but` (the one just got off). Returns how hard it hit one.
  const HALF = SECTION / 2 + GAP / 2, SIDE = W / 2, TALL = 3.3;
  T.push = (rider, R, but = null) => {
    let hit = 0;
    for (const t of fleet.list) {
      if (t === but) continue;
      const n = t.nose, far = LENGTH + 4;
      if ((rider.pos.x - n[0]) ** 2 + (rider.pos.z - n[2]) ** 2 > far * far) continue;
      t.sections.forEach((m, k) => {
        const dx = rider.pos.x - m.position.x, dz = rider.pos.z - m.position.z, y = (rider.base ?? 0) + rider.y - m.position.y;
        if (dx * dx + dz * dz > 36 || y > TALL - 0.3 || y < -2) return; // jumped over it, or down under its bridge
        const fx = Math.sin(m.rotation.y), fz = Math.cos(m.rotation.y), along = dx * fx + dz * fz, side = dx * fz - dz * fx;
        const pa = HALF + R * 0.8 - Math.abs(along), ps = SIDE + R * 0.8 - Math.abs(side);
        if (pa <= 0 || ps <= 0) return;
        // out the nearer way: past the nose or the tail (the cabs, the last one turned round, face
        // out along +z), or off its side; not between two sections, into the next
        let nx, nz, depth;
        if (pa < ps && along > 0 && (k === 0 || k === t.sections.length - 1)) { nx = fx * Math.sign(along); nz = fz * Math.sign(along); depth = pa; }
        else { nx = fz * Math.sign(side); nz = -fx * Math.sign(side); depth = ps; }
        rider.pos.x += nx * depth;
        rider.pos.z += nz * depth;
        hit = Math.max(hit, Math.max(0, -(rider.fx * nx + rider.fz * nz) * Math.sign(rider.speed)));
      });
    }
    return hit;
  };
  return T;
}

// Is (x, z) within d metres of a tram track? For keeping parked cars off the rails.
export function nearTrams(trams, d) {
  const cells = new Map(), C = 10, key = (i, j) => i * 100003 + j;
  for (const t of trams ?? []) {
    for (let k = 0; k + 3 < t.p.length; k += 2) {
      const seg = t.p.slice(k, k + 4);
      for (let i = Math.floor((Math.min(seg[0], seg[2]) - d) / C); i <= Math.floor((Math.max(seg[0], seg[2]) + d) / C); i++) {
        for (let j = Math.floor((Math.min(seg[1], seg[3]) - d) / C); j <= Math.floor((Math.max(seg[1], seg[3]) + d) / C); j++) {
          if (!cells.has(key(i, j))) cells.set(key(i, j), []);
          cells.get(key(i, j)).push(seg);
        }
      }
    }
  }
  return (x, z) => (cells.get(key(Math.floor(x / C), Math.floor(z / C))) ?? []).some(([ax, az, bx, bz]) => {
    const dx = bx - ax, dz = bz - az, f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    return Math.hypot(x - ax - dx * f, z - az - dz * f) < d;
  });
}
