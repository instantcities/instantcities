// The Louvre from the inside, as five of its key rooms in a row rather than its real plan (a
// visit to all of it is some 15 km of galleries): the Hall Napoléon under the glass pyramid with its
// spiral stair, the gallery of the Venus de Milo, the Daru staircase with the Winged Victory at its
// top, the Grande Galerie of paintings along the Seine, and the Salle des États, where the Mona Lisa
// hangs behind her glass across the room from the Wedding at Cana.
//
// Game metres, x across and z along, from the middle of the hall under the pyramid; the door out
// (to the Cour Napoléon) in its south wall.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Parts, floorMat } from '../../core/js/inside/gothic.js';
import { hall, skylight, barrel, framed, hang, plinth, bench, rope, vitrine, visitors, crowd, wanderers } from '../../core/js/inside/rooms.js';
import { monaLisa, weddingAtCana, raftOfMedusa, libertyLeading, oldMaster, masterSize, famous } from '../../core/js/inside/art.js';
import { venusDeMilo, victory, roman, bust } from '../../core/js/inside/statues.js';
import { plaque } from '../../core/js/inside/pictures.js';

const STONE = 0xe2d8c4, CREAM = 0xebe3d2, LOUVRE_BLUE = 0x2c4664;
const TINT = { stone: 0xe0d6c2, pier: 0xd8ceb8, vault: 0xf2ecde, rib: 0xd9cfba, wall: STONE };

// the rooms, in game metres: x0, z0, x1, z1 and the height of their walls
export const HALL = { x0: -22, z0: -22, x1: 22, z1: 22, h: 8 }; // the Hall Napoléon
const VENUS = { x0: -9, z0: 22, x1: 9, z1: 48, h: 10 };
const DARU = { x0: -12, z0: 48, x1: 12, z1: 82, h: 20 };
const GALERIE = { x0: 12.9, z0: 48, x1: 27, z1: 168, h: 9 }; // the Grande Galerie, beside the stair
const ETATS = { x0: 0, z0: 168.9, x1: 32, z1: 210, h: 11 }; // the Salle des États

export function makeLouvre() {
  const p = new Parts(TINT), g = new THREE.Group();

  // ---- the Hall Napoléon: pale limestone, the pyramid over its middle, the spiral stair round its lift
  {
    const H = HALL;
    p.floor(H.x0, H.z0, H.x1, H.z1, floorMat('#dcd3c1', '#d2c8b4', false, 3));
    hall(p, { ...H, color: STONE, doors: { s: [[22, 4.4, 4.6]], n: [[22, 7, 6.5]] } });
    // the ceiling round the opening under the pyramid (30 across)
    const O = 15;
    for (const [x0, z0, x1, z1] of [[H.x0, H.z0, H.x1, -O], [H.x0, O, H.x1, H.z1], [H.x0, -O, -O, O], [O, -O, H.x1, O]]) p.plaster.box(x1 - x0, 0.6, z1 - z0, 0xd8cfbd, (x0 + x1) / 2, H.h + 0.3, (z0 + z1) / 2);
    g.add(pyramid(O, H.h + 0.6, 21));
    // the spiral stair: steps round a hollow drum, the round lift in it
    for (let q = 0; q < 34; q++) {
      const a = q * 0.36, y = 0.25 + q * 0.24;
      p.marble.box(3.4, 0.2, 1.2, 0xe8e2d4, Math.cos(a) * 4.6, y, Math.sin(a) * 4.6, 0, -a, 0);
    }
    p.marble.add(new THREE.CylinderGeometry(2.6, 2.6, 0.5, 20), 0xd8d2c4, 0, 0.25, 0);
    p.dark.add(new THREE.CylinderGeometry(0.25, 0.25, H.h, 8).translate(0, H.h / 2, 0), 0x8a8a8a, 0, 0, 0);
    p.block(0, 0, 6.4);
    // the ways off it, under their names, and the door out
    p.picture(plaque(['DENON', 'Joconde · Victoire · Vénus'], 768, 256), 7, 2.2, 0, 6.6, H.z1 - 0.47, Math.PI);
    p.picture(plaque(['SULLY'], 512, 160), 4.4, 1.3, H.x1 - 0.47, 6.2, 0, -Math.PI / 2);
    p.picture(plaque(['RICHELIEU'], 512, 160), 4.4, 1.3, H.x0 + 0.47, 6.2, 0, Math.PI / 2);
    p.picture(plaque(['SORTIE · EXIT'], 512, 160), 4.4, 1.3, 0, 6.2, H.z0 + 0.47, 0);
    for (const s of [-1, 1]) p.dark.box(2.1, 4.4, 0.12, 0x2a2622, s * 1.08, 2.2, H.z0 - 0.1); // the doors out, shut
    p.wallRing([-2.2, H.z0], [2.2, H.z0], 0.4);
    // the ticket desks and the queue
    for (const s of [-1, 1]) { p.wood.box(6, 1.1, 1.4, 0x3a3a3e, s * 13, 0.55, 10); p.block(s * 13, 10, 3.2, 0.9); }
    g.add(visitors([[-8, -8, 0.4], [-6.8, -9, 0.2], [9, -6, -2.6], [10, 12, 3.1], [-15, 6, 1.6], [14, -14, -0.5], [-3, 14, 0], [4, 15, -0.3], [16, 2, -1.8], [-17, -12, 0.9]], 11));
  }

  // ---- the gallery of the Venus de Milo: grey stone, Roman marbles along the walls, Venus in the middle
  {
    const V = VENUS;
    p.floor(V.x0, V.z0, V.x1, V.z1, floorMat('#cfc6b4', '#b8ad98', false, 1.8));
    hall(p, { ...V, color: 0xe6dfd0, doors: { s: [[9, 7, 6.5]], n: [[9, 6, 6.5]] }, arch: true });
    p.ceiling(V.x0, V.z0, V.x1, V.z1, V.h, { color: 0xeae4d6, beam: 0xd8cfbd, bx: 4.5, bz: 4.3, w: 0.5, rosettes: false });
    const h = plinth(p, 0, 36, 2.0, 2.0, 1.4, 0xd8d0c0);
    venusDeMilo(p, 0, h, 36, 2.6, Math.PI);
    for (const s of [-1, 1]) for (const z of [27, 33, 39, 45]) { const ph = plinth(p, s * 7.2, z, 1.3, 1.3, 1.0); roman(p, s * 7.2, ph, z, 2.1, -s * Math.PI / 2, z + (s > 0 ? 1 : 0)); }
    g.add(crowd(0, 36, 7, 3.4, 5.2, -2.4, 2.4, 21));
  }

  // ---- the Daru staircase: the stair climbs north to its landing, the Winged Victory on her prow at
  // the top, under a skylight; you look up at her from its foot
  {
    const D = DARU;
    p.floor(D.x0, D.z0, D.x1, D.z1, floorMat('#d8cfbd', '#cdc3ae', false, 2.4));
    hall(p, { ...D, color: 0xd8ccb4, doors: { s: [[12, 6, 6.5]], e: [[6, 6, 6.5]] }, arch: true });
    const top = 8, z0 = 60, z1 = 74, n = 24;
    for (let q = 0; q < n; q++) { const z = z0 + ((z1 - z0) * q) / n; p.marble.box(14, (top * (q + 1)) / n, (z1 - z0) / n + 0.02, q % 2 ? 0xe4ddce : 0xdcd4c4, 0, (top * (q + 1)) / n / 2, z + (z1 - z0) / n / 2); }
    p.marble.box(2 * D.x1 - 1, top, D.z1 - z1, 0xdcd4c4, 0, top / 2, (z1 + D.z1) / 2); // the landing
    for (const s of [-1, 1]) p.stone.box(1.2, top + 1.2, z1 - z0 + 2, 0xd2c6ae, s * 7.6, (top + 1.2) / 2, (z0 + z1) / 2); // the balustrades either side
    p.block(0, (z0 + D.z1) / 2, D.x1 - 0.5, (D.z1 - z0) / 2);
    victory(p, 0, top, 77, 2.8, Math.PI);
    skylight(p, D.x0, D.z0, D.x1, D.z1, D.h, { color: 0xe6dcc8 });
    g.add(visitors([[-3, 56, 0.1], [2.5, 57, -0.2], [5, 55, -0.5], [-6, 58, 0.4], [0.5, 54, 0]], 31));
  }

  // ---- the Grande Galerie: long and skylit under its vault, paintings close-hung along both walls,
  // marbles and benches down the middle, the Raft of the Medusa and Liberty at its far end
  {
    const G = GALERIE, cx = (G.x0 + G.x1) / 2;
    p.floor(G.x0, G.z0, G.x1, G.z1, floorMat('#8a5a32', '#7a4e2a', true, 0.55));
    hall(p, { ...G, color: CREAM, doors: { w: [[6, 6, 6.5]], n: [[cx - G.x0, 6, 6.5]] } });
    barrel(p, G.x0, G.z0, G.x1, G.z1, G.h, 5, { color: 0xf2ecde, band: 0xe0d4ba, bay: 12, skylight: 0.35 });
    let seed = 3;
    for (const [x, ry] of [[G.x0 + 0.47, Math.PI / 2], [G.x1 - 0.47, -Math.PI / 2]]) {
      for (let z = G.z0 + 12; z < G.z1 - 26; z += 6) {
        if (x < cx && z < 58) continue; // the doorway from the stair
        if ((x < cx && z === 72) || z === 132) continue; // the Virgin of the Rocks; the Horatii and the Odalisque
        const s1 = seed++, s2 = seed++, [w1, h1] = masterSize(s1), [w2, h2] = masterSize(s2);
        framed(p, oldMaster(s1), w1, h1, x, 3.0, z, ry);
        framed(p, oldMaster(s2), w2 * 0.8, h2 * 0.8, x, 6.0, z + 1.5, ry);
      }
    }
    // Leonardo's Virgin of the Rocks among the Italians; nearer the end David's Oath of the Horatii
    // facing Ingres's Grande Odalisque
    framed(p, famous('virgin-of-the-rocks', 1.55, 2.5), 1.55, 2.5, G.x0 + 0.47, 3.6, 72, Math.PI / 2, { f: 0.3 });
    framed(p, famous('oath-of-the-horatii', 5.3, 4.1), 5.3, 4.1, G.x0 + 0.47, 4.0, 132, Math.PI / 2, { f: 0.4 });
    framed(p, famous('la-grande-odalisque', 2.9, 1.65), 2.9, 1.65, G.x1 - 0.47, 3.4, 132, -Math.PI / 2, { f: 0.35 });
    // the two great ones at the end: the Raft facing Liberty
    framed(p, raftOfMedusa(), 9.0, 6.4, G.x0 + 0.47, 4.6, 150, Math.PI / 2, { f: 0.5 });
    framed(p, libertyLeading(), 7.6, 6.0, G.x1 - 0.47, 4.5, 150, -Math.PI / 2, { f: 0.5 });
    for (let z = G.z0 + 16; z < G.z1 - 30; z += 18) { const ph = plinth(p, cx, z, 1.2, 1.2, 1.0); roman(p, cx, ph, z, 2.0, z % 36 < 18 ? 0 : Math.PI, z); }
    for (let z = G.z0 + 25; z < G.z1 - 30; z += 18) bench(p, cx, z, 3.4, Math.PI / 2);
    bench(p, cx, 150, 4.2, Math.PI / 2);
    g.add(visitors([[16, 70, -1.6], [24, 84, 1.6], [20, 96, 0], [16.5, 110, -1.5], [23.5, 124, 1.5], [17, 148, -1.5], [18, 152, -1.4], [24, 149, 1.6], [22, 140, 0.2]], 41));
  }

  // ---- the Salle des États: dark blue walls, the Mona Lisa alone on her wall in the middle, behind
  // glass and a rope, a crowd of phones before her; the Wedding at Cana across the room
  {
    const E = ETATS, cx = (E.x0 + E.x1) / 2;
    p.floor(E.x0, E.z0, E.x1, E.z1, floorMat('#8a5a32', '#7a4e2a', true, 0.55));
    hall(p, { ...E, color: LOUVRE_BLUE, doors: { s: [[20 - E.x0, 6, 6.5]] } });
    skylight(p, E.x0, E.z0, E.x1, E.z1, E.h, { color: 0xe8e2d4, along: 'x', glass: 0.5 });
    // her wall: free-standing, the case let into it
    const mz = 202;
    p.plaster.box(10, 5.4, 1.0, LOUVRE_BLUE, cx, 2.7, mz + 0.5);
    p.block(cx, mz + 0.5, 5.2, 0.7);
    p.dark.box(1.6, 2.3, 0.3, 0x3a3226, cx, 2.6, mz - 0.1);
    framed(p, monaLisa(), 0.98, 1.4, cx, 2.6, mz - 0.28, Math.PI, { f: 0.16, label: false });
    p.glass.push({ w: 1.8, h: 2.6, d: 0.25, x: cx, y: 2.6, z: mz - 0.5 });
    rope(p, [cx - 5, mz - 3.2], [cx + 5, mz - 3.2]);
    p.dark.box(8.4, 1.0, 0.3, 0x4a4a4e, cx, 0.5, mz - 2.1); // the wooden rail before her
    g.add(crowd(cx, mz, 16, 4.2, 8.5, Math.PI * 0.62, Math.PI * 1.38, 61));
    // the Wedding at Cana over the whole south wall, west of the doorway
    framed(p, weddingAtCana(), 12.4, 8.5, 8.2, 5.4, E.z0 + 0.47, 0, { f: 0.5 });
    // and east of it David's Coronation of Napoleon (its real room, the Salle Daru, is next door)
    framed(p, famous('the-coronation-of-napoleon', 7.4, 4.68), 7.4, 4.68, 27.3, 4.6, E.z0 + 0.47, 0, { f: 0.3 });
    // Venetians on the side walls
    let seed = 80;
    for (const [x, ry] of [[E.x0 + 0.47, Math.PI / 2], [E.x1 - 0.47, -Math.PI / 2]]) {
      for (const z of [176, 186, 196, 205]) { const s = seed++, [w, h] = masterSize(s); framed(p, oldMaster(s), w * 1.3, h * 1.3, x, 3.8, z, ry); }
    }
    bench(p, cx, 182, 4.4, 0);
    g.add(visitors([[10, 178, Math.PI], [7, 179, Math.PI + 0.2], [26, 174, 0.3]], 71));
  }

  g.add(wanderers(p, 31));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: HALL.z0 + 1.6 } };
}

// The glass pyramid (I. M. Pei, 1989): four faces of glass in a lattice of steel, base `half` either
// side of the middle at height y, its apex `rise` over that; seen from outside (opacity) the glass
// gives back the sky. Paris's city.js puts it up in the Cour Napoléon too.
export function pyramid(half, y, rise, opacity = 0.28) {
  const g = new THREE.Group(), apex = new THREE.Vector3(0, y + rise, 0);
  const corners = [[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, z]) => new THREE.Vector3(x, y, z));
  const pos = [];
  for (let k = 0; k < 4; k++) { const a = corners[k], b = corners[(k + 1) % 4]; pos.push(a.x, a.y, a.z, b.x, b.y, b.z, apex.x, apex.y, apex.z); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  const glass = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xcfe0ea, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
  glass.renderOrder = 2;
  g.add(glass);
  // the lattice: bars from the base up each face, both ways, and the edges
  const steel = new THREE.MeshStandardMaterial({ color: 0x4a4e54, roughness: 0.4, metalness: 0.6 }), bars = [];
  const bar = (a, b, r = 0.06) => { const d = new THREE.Vector3().subVectors(b, a), L = d.length(); bars.push(new THREE.CylinderGeometry(r, r, L, 4).translate(0, L / 2, 0).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())).translate(a.x, a.y, a.z)); };
  for (let k = 0; k < 4; k++) {
    const a = corners[k], b = corners[(k + 1) % 4];
    bar(a, apex, 0.16);
    for (let q = 1; q < 12; q++) {
      const t = q / 12, onBase = new THREE.Vector3().lerpVectors(a, b, t);
      bar(onBase, new THREE.Vector3().lerpVectors(a, apex, t)); // the lattice runs both ways, each bar along one of the face's edges
      bar(onBase, new THREE.Vector3().lerpVectors(b, apex, 1 - t));
    }
  }
  g.add(new THREE.Mesh(mergeGeometries(bars), steel));
  return g;
}
