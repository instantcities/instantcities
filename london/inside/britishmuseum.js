// The British Museum from the inside, as three of its key rooms rather than its real plan: the
// Great Court under Norman Foster's roof of glass triangles (2000) round the drum of the old Reading
// Room, the Egyptian Sculpture Gallery with the Rosetta Stone and the bust of Ramesses II to the
// west, and the Duveen Gallery with the Parthenon's marbles to the east.
//
// Game metres, x across and z along, from the middle of the Reading Room; the door out (to Great
// Russell Street) in the court's south wall.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Parts, floorMat } from '../../core/js/inside/gothic.js';
import { hall, skylight, framed, plinth, bench, vitrine, roundWall, visitors, crowd, wanderers } from '../../core/js/inside/rooms.js';
import { rosettaStone, egyptWall, frieze } from '../../core/js/inside/art.js';
import { roman, ramesses, sarcophagus } from '../../core/js/inside/statues.js';
import { plaque } from '../../core/js/inside/pictures.js';

const PORTLAND = 0xece8dc; // the white Portland stone of the court's fronts
const TINT = { stone: PORTLAND, pier: 0xe4e0d4, vault: 0xf2f0ea, rib: 0xd9d5c8, wall: PORTLAND };

export const COURT = { x0: -46, z0: -38, x1: 46, z1: 38, h: 22 };
const DRUM = 16, DRUM_H = 20;
const EGYPT = { x0: -92, z0: -12, x1: -46.9, z1: 12, h: 12 };
const PARTHENON = { x0: 46.9, z0: -12, x1: 98, z1: 12, h: 12 };

export function makeBritishMuseum() {
  const p = new Parts(TINT), g = new THREE.Group();

  // ---- the Great Court: the four fronts with their columns, the drum in the middle, the roof
  {
    const C = COURT;
    p.floor(C.x0, C.z0, C.x1, C.z1, floorMat('#e8e4da', '#dedad0', false, 3));
    hall(p, { ...C, color: PORTLAND, doors: { s: [[46, 4.4, 5]], w: [[38, 6, 7]], e: [[38, 6, 7]] } });
    for (const s of [-1, 1]) p.dark.box(2.1, 5, 0.14, 0x2a2622, s * 1.1, 2.5, C.z0 - 0.1);
    p.wallRing([-2.2, C.z0], [2.2, C.z0], 0.4);
    // the south portico, its columns against the wall, and the fronts' pilasters all round
    for (let k = 0; k < 8; k++) { const x = -14 + k * 4; if (Math.abs(x) < 3) continue; p.stone.add(new THREE.CylinderGeometry(0.8, 0.9, 16, 14).translate(0, 8, 0), 0xe4e0d4, x, 0, C.z0 + 1.6); p.block(x, C.z0 + 1.6, 1.0); }
    p.stone.box(36, 2.4, 3.4, PORTLAND, 0, 17.2, C.z0 + 1.6);
    for (const [a, b, ry] of [[[C.x0, C.z1], [C.x1, C.z1], Math.PI], [[C.x0, C.z0], [C.x0, C.z1], Math.PI / 2], [[C.x1, C.z0], [C.x1, C.z1], -Math.PI / 2]]) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.round(L / 6);
      for (let k = 1; k < n; k++) { const t = k / n, x = a[0] + (b[0] - a[0]) * t + Math.sin(ry) * 0.6, z = a[1] + (b[1] - a[1]) * t + Math.cos(ry) * 0.6; p.stone.box(1.2, C.h - 2, 0.5, 0xe4e0d4, x, (C.h - 2) / 2, z, 0, ry, 0); }
    }
    for (const [x, z, ry] of [[0, C.z1 - 0.47, Math.PI]]) p.picture(plaque(['THE BRITISH MUSEUM', 'Great Court'], 768, 220), 8, 2.3, x, 9, z, ry);
    p.picture(plaque(['EGYPT · Room 4'], 512, 140), 4.4, 1.2, C.x0 + 0.47, 9.2, 0, Math.PI / 2);
    p.picture(plaque(['GREECE · Parthenon · Room 18'], 640, 140), 5.4, 1.2, C.x1 - 0.47, 9.2, 0, -Math.PI / 2);
    // the Reading Room's drum, clad in stone, its doors, and the stairs curving up round it
    p.stone.add(new THREE.CylinderGeometry(DRUM, DRUM, DRUM_H, 48, 1, true).translate(0, DRUM_H / 2, 0), PORTLAND, 0, 0, 0);
    p.stone.add(new THREE.CylinderGeometry(DRUM + 0.4, DRUM + 0.4, 1.2, 48, 1, true).translate(0, DRUM_H, 0), 0xe0dcd0, 0, 0, 0);
    p.plaster.add(new THREE.CircleGeometry(DRUM, 48).rotateX(-Math.PI / 2).translate(0, DRUM_H, 0), 0xe0dcd0, 0, 0, 0);
    roundWall(p, 0, 0, DRUM + 0.3, 40);
    p.dark.box(4, 6, 0.3, 0x2a2622, 0, 3, -DRUM - 0.2);
    for (const side of [-1, 1]) for (let q = 0; q < 26; q++) {
      const a = Math.PI + side * (0.6 + q * 0.06), r = DRUM + 2.2, y = 0.2 + q * 0.4;
      p.stone.box(4, 0.3, 1.4, 0xe4e0d4, Math.sin(a) * r, y, Math.cos(a) * r, 0, a, 0);
    }
    roundWall(p, 0, 0, DRUM + 3.6, 48, [[0, Math.PI - 2.2], [Math.PI - 0.55, Math.PI + 0.55], [Math.PI + 2.2, Math.PI * 2]]); // the stairs' outer edge
    // the roof: a net of glass triangles from the fronts to the drum, rising as it goes in
    g.add(roof(C, DRUM, C.h, DRUM_H + 1.2));
    g.add(visitors([[-10, -26, 0.2], [-8, -24, -0.6], [12, -28, 0.4], [20, -10, 1.2], [-24, 8, -1.4], [26, 18, 2.4], [-18, -30, 0], [6, 24, 3], [30, -20, -2.2], [-30, 26, 2.6], [0, -22, 0], [2, -20, 3.1]], 51));
  }

  // ---- the Egyptian Sculpture Gallery: sandstone walls in sunk relief, the Rosetta Stone in its
  // case by the door, Ramesses II halfway along, sarcophagi and statues of the gods
  {
    const E = EGYPT;
    p.floor(E.x0, E.z0, E.x1, E.z1, floorMat('#cfc6b4', '#c4baa6', false, 2.2));
    hall(p, { ...E, color: 0xe0d4bc, doors: { e: [[12, 6, 7]] } });
    skylight(p, E.x0, E.z0, E.x1, E.z1, E.h, { color: 0xe8e2d4, along: 'x', glass: 0.4 });
    const relief = egyptWall();
    relief.repeat.set(6, 1);
    for (const [z, ry] of [[E.z0 + 0.47, 0], [E.z1 - 0.47, Math.PI]]) p.picture(relief, E.x1 - E.x0 - 2, 3, (E.x0 + E.x1) / 2, 8.5, z, ry);
    // the Rosetta Stone, upright in its case, a crowd round it
    const rx = -54, base = vitrine(p, rx, 0, 2.6, 2.0, 3.6, 1.0);
    p.dark.box(0.3, 2.0, 1.4, 0x3a3a3e, rx, base + 1.0, 0);
    p.picture(rosettaStone(), 1.4, 2.0, rx + 0.17, base + 1.0, 0, Math.PI / 2); // its face to the door, towards the court
    g.add(crowd(rx, 0, 10, 2.6, 5, -Math.PI, Math.PI, 53));
    ramesses(p, -72, 7, Math.PI, 1.4);
    for (const [x, z, ry] of [[-64, -7, 0], [-80, -7, 0], [-86, 6, Math.PI]]) sarcophagus(p, x, z, ry);
    for (const x of [-60, -68, -76, -84]) { const h = plinth(p, x, E.z0 + 2, 1.6, 1.6, 1.2, 0x5a5a5e); roman(p, x, h, E.z0 + 2, 2.4, 0, 1); }
    // the granite scarab, and a great arm of a statue on the floor
    p.stone.add(new THREE.SphereGeometry(1.4, 12, 8).scale(1, 0.6, 1.4), 0x4a4a4e, -90, 1.0, 0);
    p.block(-90, 0, 1.6, 2.2);
  }

  // ---- the Duveen Gallery: the Parthenon's frieze round the walls at eye height, the figures of
  // its pediments on low plinths at both ends, the metopes over the doors
  {
    const P = PARTHENON;
    p.floor(P.x0, P.z0, P.x1, P.z1, floorMat('#b8b4a8', '#aca89c', false, 2.6));
    hall(p, { ...P, color: 0xd8d4c8, doors: { w: [[12, 6, 7]] } });
    skylight(p, P.x0, P.z0, P.x1, P.z1, P.h, { color: 0xe6e4dc, along: 'x', glass: 0.5 });
    const strip = frieze();
    strip.repeat.set(5, 1);
    for (const [z, ry] of [[P.z0 + 0.47, 0], [P.z1 - 0.47, Math.PI]]) p.picture(strip, P.x1 - P.x0 - 2, 1.4, (P.x0 + P.x1) / 2, 3.2, z, ry);
    // the pediments: reclining and seated gods along a long plinth at each end
    // (the west one in two halves, either side of the way in from the court)
    for (const [x, ry, z0, z1] of [[P.x1 - 3, -Math.PI / 2, -9, 9], [P.x0 + 6, Math.PI / 2, -9.5, -3.5], [P.x0 + 6, Math.PI / 2, 3.5, 9.5]]) {
      p.marble.box(2.4, 1.2, z1 - z0, 0xa8a49a, x, 0.6, (z0 + z1) / 2);
      p.block(x, (z0 + z1) / 2, 1.5, (z1 - z0) / 2 + 0.2);
      for (let z = z0 + 1.5, q = 0; z < z1; z += 3, q++) roman(p, x, 1.2, z, 1.8 + (q % 2) * 0.3, ry, q + 7);
    }
    for (let k = 0; k < 4; k++) framed(p, frieze(), 1.6, 1.5, P.x0 + 14 + k * 9, 9, P.z0 + 0.47, 0, { f: 0.12, color: 0xbab6aa, label: false });
    bench(p, (P.x0 + P.x1) / 2, 0, 5, Math.PI / 2);
    g.add(visitors([[60, 6, Math.PI], [64, -6, 0], [72, 7, Math.PI], [84, -5, 0.2], [88, 3, 1.6]], 57));
  }

  g.add(wanderers(p, 19));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: COURT.z0 + 1.6 } };
}

// The Great Court's roof: a grid from the court's edge (a rectangle) in to the drum (a circle),
// each cell two glass triangles, rising from `y0` at the edge to `y1` at the drum.
function roof(C, r, y0, y1) {
  const N = 64, M = 9, pts = [];
  const edge = a => {
    // the point of the rectangle straight out from the middle at angle a
    const dx = Math.sin(a), dz = Math.cos(a), t = Math.min(C.x1 / Math.abs(dx || 1e-6), C.z1 / Math.abs(dz || 1e-6));
    return [dx * t, dz * t];
  };
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2, [ex, ez] = edge(a), row = [];
    for (let j = 0; j <= M; j++) {
      const t = j / M, x = ex + (Math.sin(a) * r - ex) * t, z = ez + (Math.cos(a) * r - ez) * t;
      row.push(new THREE.Vector3(x, y0 + (y1 - y0) * Math.sin((t * Math.PI) / 2), z));
    }
    pts.push(row);
  }
  const pos = [], bars = [];
  const bar = (a, b) => { const d = new THREE.Vector3().subVectors(b, a), L = d.length(); bars.push(new THREE.CylinderGeometry(0.07, 0.07, L, 4).translate(0, L / 2, 0).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())).translate(a.x, a.y, a.z)); };
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = pts[i][j], b = pts[i + 1][j], c = pts[i][j + 1], d = pts[i + 1][j + 1];
    pos.push(...a.toArray(), ...b.toArray(), ...d.toArray(), ...a.toArray(), ...d.toArray(), ...c.toArray());
    bar(a, b); bar(a, c); bar(a, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  const g = new THREE.Group(), glass = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xdfeaf0, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }));
  glass.renderOrder = 2;
  g.add(glass, new THREE.Mesh(mergeGeometries(bars), new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.5, metalness: 0.3 })));
  return g;
}
