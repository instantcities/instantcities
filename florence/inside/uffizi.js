// The Uffizi from the inside, as four of its key rooms rather than its real plan: the hall at the
// top of Vasari's stair, the long east corridor under its painted vault with the Medici's Roman
// marbles down both sides and the window at its end over the Arno and the Ponte Vecchio, the
// Tribuna (the octagon of red velvet under its dome of mother-of-pearl, the Venus de' Medici in its
// middle) and the Botticelli room with the Birth of Venus and Primavera.
//
// Game metres, x across and z along; the door out (to the Piazzale degli Uffizi) in the hall's
// south wall, the corridor going north from it.
import * as THREE from 'three';
import { Parts, floorMat } from '../../core/js/inside/gothic.js';
import { hall, skylight, framed, plinth, bench, rope, visitors, crowd, paintedVault, wanderers } from '../../core/js/inside/rooms.js';
import { birthOfVenus, primavera, arnoView, grotesques, oldMaster, masterSize, famous } from '../../core/js/inside/art.js';
import { venusDeMedici, roman, bust } from '../../core/js/inside/statues.js';
import { plaque } from '../../core/js/inside/pictures.js';

const TINT = { stone: 0xdcd4c4, pier: 0xd4ccba, vault: 0xf2ecde, rib: 0xd9cfba, wall: 0xece6d8 };
const PIETRA = 0x8a8c88; // pietra serena, Florence's grey sandstone, for the frames of doors and windows
const RED = 0x8a1f2b;

export const ENTRY = { x0: -8, z0: -14, x1: 8, z1: 0, h: 8 };
const CORRIDOR = { x0: -6, z0: 0.9, x1: 6, z1: 110, h: 8 };
const TRIBUNA = { x: -16.5, z: 30, r: 7.5 };
const BOTTICELLI = { x0: -34, z0: 56, x1: -6.9, z1: 84, h: 9 };

export function makeUffizi() {
  const p = new Parts(TINT), g = new THREE.Group();
  const floor = floorMat('#b89c78', '#a88c68', false, 1.4); // terracotta tiles

  // ---- the hall at the top of the stair: the Medici arms, the busts of the family
  {
    const E = ENTRY;
    p.floor(E.x0, E.z0, E.x1, E.z1, floor);
    hall(p, { ...E, color: 0xece6d8, doors: { s: [[8, 3.6, 4.6]], n: [[8, 5, 6]] } });
    p.ceiling(E.x0, E.z0, E.x1, E.z1, E.h, { color: 0xf4efe2, beam: 0xe0d6c2, bx: 4, bz: 3.5, w: 0.4, rosettes: false });
    for (const s of [-1, 1]) p.dark.box(1.75, 4.6, 0.14, 0x4a3426, s * 0.9, 2.3, E.z0 - 0.1);
    p.wallRing([-1.8, E.z0], [1.8, E.z0], 0.4);
    p.picture(plaque(['GALLERIA DEGLI UFFIZI'], 768, 180), 5.6, 1.3, 0, 6.2, E.z1 - 0.47, Math.PI);
    for (const x of [-5.5, 5.5]) for (const z of [-10, -4]) bust(p, x, z, 1.3);
  }

  // ---- the east corridor: the grotesques on the vault, statues and busts along both walls, windows
  // onto the courtyard, and at its end the window over the Arno
  {
    const C = CORRIDOR;
    p.floor(C.x0, C.z0, C.x1, C.z1, floor);
    const win = Array.from({ length: 9 }, (_, k) => [10 + k * 11, 2.2, 2.6, 6.4, 5]);
    hall(p, { ...C, color: 0xf0eadc, doors: { s: [[6, 5, 6]], w: [[TRIBUNA.z - C.z0, 3.4, 5], [70 - C.z0, 5, 6]] }, windows: { e: win } });
    g.add(paintedVault(C.x0 + 0.45, C.z0, C.x1 - 0.45, C.z1 - 0.45, C.h, 3.2, grotesques(), { repeat: [24, 1] }));
    framed(p, arnoView(), 5.2, 5.2, 0, 4.4, C.z1 - 0.47, Math.PI, { f: 0.4, color: PIETRA, label: false });
    let k = 0;
    for (let z = C.z0 + 6; z < C.z1 - 4; z += 5.5, k++) {
      if (Math.abs(z - TRIBUNA.z) < 3.5 || Math.abs(z - 70) < 4) continue; // the doorways
      const ph = plinth(p, C.x0 + 1.3, z, 1.1, 1.1, 1.0);
      if (k % 2) roman(p, C.x0 + 1.3, ph, z, 1.9, Math.PI / 2, k); else bust(p, C.x0 + 1.3, z, 1.3);
      const ph2 = plinth(p, C.x1 - 1.3, z + 2.7, 1.1, 1.1, 1.0);
      if (k % 2) bust(p, C.x1 - 1.3, z + 2.7, 1.3); else roman(p, C.x1 - 1.3, ph2, z + 2.7, 1.9, -Math.PI / 2, k + 1);
    }
    // the portraits of the famous men up under the vault, a row along each wall
    let s = 200;
    for (const [x, ry] of [[C.x0 + 0.47, Math.PI / 2], [C.x1 - 0.47, -Math.PI / 2]]) for (let z = C.z0 + 4; z < C.z1 - 3; z += 3.2) framed(p, oldMaster(5 * (s++ % 40)), 1.1, 1.4, x, 7.2, z, ry, { f: 0.12, label: false });
    g.add(visitors([[0, 12, 0.2], [-2, 22, -0.4], [3, 40, 1.4], [-1.5, 55, 0], [2, 64, -0.8], [0.5, 88, 0.1], [-2.5, 100, 0], [1.5, 104, 0.3]], 12));
  }

  // ---- the Tribuna: eight walls of red velvet, the paintings close-hung on them, the dome inlaid
  // with mother-of-pearl shells, the Venus de' Medici in the middle
  {
    const { x, z, r } = TRIBUNA, ap = r * Math.cos(Math.PI / 8), h = 9;
    p.floor(x - r, z - r, x + r, z + r, floorMat('#e8e2d4', '#7a2a2a', true, 0.9));
    const corner = k => { const a = Math.PI / 8 + (k * Math.PI) / 4; return [x + Math.sin(a) * r, z + Math.cos(a) * r]; };
    for (let k = 0; k < 8; k++) {
      const a = corner(k), b = corner(k + 1), side = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const east = k === 1; // the side towards the corridor, with the doorway
      p.rectWall(a, b, { y1: h, color: RED, holes: east ? [[[side / 2 - 1.7, 0], [side / 2 + 1.7, 0], [side / 2 + 1.7, 5], [side / 2 - 1.7, 5]]] : [], solid: !east });
      if (east) { p.wallRing(a, [a[0] + (b[0] - a[0]) * 0.18, a[1] + (b[1] - a[1]) * 0.18], 0.9); p.wallRing([a[0] + (b[0] - a[0]) * 0.82, a[1] + (b[1] - a[1]) * 0.82], b, 0.9); continue; }
      // pictures on it, two rows, facing in
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], ry = Math.atan2(x - mid[0], z - mid[1]), ix = mid[0] + Math.sin(ry) * 0.47, iz = mid[1] + Math.cos(ry) * 0.47;
      framed(p, oldMaster(300 + k), 1.4, 1.8, ix, 2.6, iz, ry, { f: 0.15, label: false });
      for (const d of [-1, 1]) framed(p, oldMaster(310 + k * 2 + d), 1.0, 1.2, ix + Math.cos(ry) * d * 1.2, 5.0, iz - Math.sin(ry) * d * 1.2, ry, { f: 0.12, label: false });
    }
    // the passage from the corridor
    for (const s of [-1, 1]) p.rectWall([x + ap - 0.2, z + s * 1.7], [CORRIDOR.x0, z + s * 1.7], { y1: 5.5, color: 0xece6d8 });
    p.floor(x + ap - 0.5, z - 1.7, CORRIDOR.x0, z + 1.7, floor);
    // the dome: eight panels rising to a lantern, red with gold ribs, shells of mother-of-pearl set in them
    const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8, Math.PI / 8, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9a2a36, roughness: 0.5, side: THREE.DoubleSide, flatShading: true }));
    dome.scale.y = 0.75;
    dome.position.set(x, h, z);
    g.add(dome);
    let s = 3;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let q = 0; q < 140; q++) {
      const a = rnd() * Math.PI * 2, t = 0.1 + rnd() * 1.35, rr = r * 0.97;
      p.daylight.add(new THREE.SphereGeometry(0.2, 6, 4).scale(1, 1, 0.4), [0xf4f0f8, 0xe8eef8, 0xf8eef0][q % 3], x + Math.sin(a) * Math.sin(t) * rr, h + Math.cos(t) * rr * 0.75, z + Math.cos(a) * Math.sin(t) * rr);
    }
    p.glow.add(new THREE.CylinderGeometry(1.0, 1.0, 0.4, 8), 0xfff4dc, x, h + r * 0.75 - 0.1, z); // the lantern
    const vh = plinth(p, x, z, 1.5, 1.5, 1.3, 0xd8d0c0);
    venusDeMedici(p, x, vh, z, 2.2, Math.PI); // facing the way in
    rope(p, [x - 2.4, z - 2.4], [x + 2.4, z - 2.4]);
  }

  // ---- the Botticelli room: high and skylit, the Birth of Venus on the north wall, Primavera on
  // the west, his Madonnas round them, a crowd before the Venus
  {
    const B = BOTTICELLI;
    p.floor(B.x0, B.z0, B.x1, B.z1, floorMat('#9a7a5a', '#8a6a4a', false, 0.8));
    hall(p, { ...B, color: 0xd8d4cc, doors: { e: [[70 - B.z0, 5, 6]] } });
    skylight(p, B.x0, B.z0, B.x1, B.z1, B.h, { color: 0xe8e4dc, along: 'x', glass: 0.55 });
    const cx = (B.x0 + B.x1) / 2;
    framed(p, birthOfVenus(), 10.8, 6.8, cx, 4.6, B.z1 - 0.47, Math.PI, { f: 0.35 });
    framed(p, primavera(), 9.9, 6.4, B.x0 + 0.47, 4.6, (B.z0 + B.z1) / 2, Math.PI / 2, { f: 0.35 });
    for (const [x, sd] of [[cx - 7, 401], [cx + 7, 403]]) { const [w, h] = masterSize(4); framed(p, oldMaster(sd * 5 - 1), w * 1.4, h * 1.4, x, 3.6, B.z0 + 0.47, 0); }
    // Leonardo's Annunciation between them; on the east wall Titian's Venus of Urbino and Caravaggio's Medusa
    framed(p, famous('the-annunciation', 3.6, 1.63), 3.6, 1.63, cx, 3.2, B.z0 + 0.47, 0, { f: 0.3 });
    framed(p, famous('venus-of-urbino', 2.6, 1.88), 2.6, 1.88, B.x1 - 0.47, 3.4, 79, -Math.PI / 2, { f: 0.3 });
    framed(p, famous('medusa', 1.1, 1.1), 1.1, 1.1, B.x1 - 0.47, 2.8, 61, -Math.PI / 2, { f: 0.2 });
    rope(p, [cx - 6, B.z1 - 3.4], [cx + 6, B.z1 - 3.4]);
    bench(p, cx, (B.z0 + B.z1) / 2, 5, 0);
    g.add(crowd(cx, B.z1, 12, 4.6, 8.4, Math.PI * 0.68, Math.PI * 1.32, 91));
    g.add(visitors([[B.x0 + 5, 70, -Math.PI / 2], [B.x0 + 6.5, 67, -Math.PI / 2 + 0.3]], 93));
  }

  g.add(wanderers(p, 17));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: ENTRY.z0 + 1.6 } };
}
