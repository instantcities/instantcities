// The Pantheon from the inside, simplified: the portico of granite columns, the bronze doors, and
// the rotunda, as wide as it is high (43.3 m), under its coffered concrete dome with the oculus open
// to the sky, a shaft of sunlight falling through it. Round the wall the niches with their altars,
// the tombs of Raphael and of Italy's first kings, the floor of granite, porphyry and giallo antico.
//
// Game metres, x across and z along; the portico at -z, the door out (to the Piazza della
// Rotonda) between its front columns, the rotunda's middle at (0, ROT).
import * as THREE from 'three';
import { Parts, floorMat } from '../../core/js/inside/gothic.js';
import { patternFloor, roundWall, framed, rope, visitors, plinth } from '../../core/js/inside/rooms.js';
import { pantheonFloor, rotondaView, oldMaster } from '../../core/js/inside/art.js';
import { roman } from '../../core/js/inside/statues.js';
import { candelabra } from '../../core/js/inside/props.js';

const R = 27, H = 27, ROT = 29, OCULUS = 5.5; // the rotunda's radius and the height of its wall, its middle, the oculus
const FRONT = -16; // the front of the portico
const TINT = { stone: 0xe6dcc8, pier: 0xdcd2bc, vault: 0xe8e0d0, rib: 0xd9cfba, wall: 0xe6dcc8 };
const GRANITE = 0x8a8a88, MARBLE = 0xf0ece2, GIALLO = 0xd8b870, PORPHYRY = 0x7a2a2a;

// a column: its base, a shaft of granite (or giallo antico), a white Corinthian capital
function column(p, x, z, r, h, shaft = GRANITE) {
  p.marble.add(new THREE.CylinderGeometry(r * 1.35, r * 1.45, 0.8, 14).translate(0, 0.4, 0), MARBLE, x, 0, z);
  p.stone.add(new THREE.CylinderGeometry(r * 0.88, r, h - 2.2, 14).translate(0, 0.8 + (h - 2.2) / 2, 0), shaft, x, 0, z);
  p.marble.add(new THREE.CylinderGeometry(r * 1.4, r * 0.9, 1.4, 14).translate(0, h - 0.7, 0), MARBLE, x, 0, z);
  p.marble.box(r * 3.1, 0.4, r * 3.1, MARBLE, x, h + 0.2, z);
  p.block(x, z, r * 1.2);
}

// the dome's inside: five rings of coffers stepping in, shaded, and the plain band up to the oculus
function cofferTexture() {
  const c = document.createElement('canvas');
  c.width = 1792; c.height = 320;
  const g = c.getContext('2d');
  g.fillStyle = '#d8d0c2'; g.fillRect(0, 0, c.width, c.height);
  const cols = 28, rows = 5, top = 70, cw = c.width / cols, rh = (c.height - top) / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const shrink = 1 - (rows - 1 - r) * 0.09, w = cw * 0.78 * shrink, h = rh * 0.8, x = k * cw + (cw - w) / 2, y = top + r * rh + (rh - h) / 2;
    for (let s = 0; s < 3; s++) { g.fillStyle = ['#b8b0a2', '#a8a092', '#988f82'][s]; g.fillRect(x + s * w * 0.1, y + s * h * 0.1, w * (1 - s * 0.2), h * (1 - s * 0.2)); }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.userData.shared = true;
  return tex;
}

export function makePantheon() {
  const p = new Parts(TINT), g = new THREE.Group();

  // ---- the portico: three rows of columns under its roof, the side walls, the square seen between the front columns
  p.floor(-17, FRONT, 17, 2, floorMat('#d8d2c4', '#c8c0b0', false, 2));
  p.floor(-40, FRONT - 12, 40, FRONT, floorMat('#a89a84', '#9a8c76', false, 1.2)); // the square in front
  for (let k = 0; k < 8; k++) column(p, -14 + k * 4, FRONT + 1.8, 0.95, 14.8);
  for (const z of [FRONT + 7, FRONT + 12]) for (const x of [-14, -6, 6, 14]) column(p, x, z, 0.95, 14.8);
  for (const s of [-1, 1]) { p.rectWall([s * 17, FRONT], [s * 17, 0], { y1: 18, color: 0xd8ccb4 }); }
  p.rectWall([-17, 0], [17, 0], { y1: 22, holes: [[[13.5, 0], [20.5, 0], [20.5, 14], [13.5, 14]]], color: 0xd8ccb4, solid: false });
  p.wallRing([-17, 0], [-3.5, 0], 0.9);
  p.wallRing([3.5, 0], [17, 0], 0.9);
  p.dark.box(34, 1.2, 18, 0x5a4a3a, 0, 15.8, FRONT + 9); // the roof over it, its bronze trusses below
  for (let x = -12; x <= 12; x += 6) p.dark.box(0.6, 1.2, 17, 0x6a5a40, x, 14.8, FRONT + 9);
  p.stone.box(36, 2.0, 1.4, MARBLE, 0, 16.2, FRONT + 1.6); // the architrave with M·AGRIPPA on it
  p.picture(rotondaView(), 84, 42, 0, 15, FRONT - 11.5, 0);
  p.wallRing([-17, FRONT + 0.3], [17, FRONT + 0.3], 0.6);
  // the passage into the rotunda and its bronze doors, standing open against the walls
  for (const s of [-1, 1]) {
    p.rectWall([s * 3.5, 0], [s * 3.5, 3.4], { y1: 14, color: 0xd8ccb4 });
    p.dark.box(0.25, 13, 3.3, 0x5a4a30, s * 3.2, 6.5, 1.9);
  }

  // ---- the rotunda: its wall in two orders, round its floor; the door's gap at the south
  p.floor(-R, ROT - R, R, ROT + R, patternFloor(pantheonFloor(), 3));
  const gap = Math.asin(3.6 / R);
  p.plaster.add(new THREE.CylinderGeometry(R, R, 12, 64, 1, true, Math.PI + gap, Math.PI * 2 - 2 * gap).translate(0, 6, 0), 0xe8dcc8, 0, 0, ROT);
  p.plaster.add(new THREE.CylinderGeometry(R, R, H - 12, 64, 1, true).translate(0, 12 + (H - 12) / 2, 0), 0xe2d6c0, 0, 0, ROT);
  p.plaster.add(new THREE.CylinderGeometry(R, R, 2, 64, 1, true, Math.PI - gap, 2 * gap).translate(0, 13, 0), 0xe2d6c0, 0, 0, ROT);
  p.marble.add(new THREE.TorusGeometry(R - 0.4, 0.5, 4, 64).rotateX(Math.PI / 2), MARBLE, 0, 12, ROT); // the cornice between the orders
  p.marble.add(new THREE.TorusGeometry(R - 0.4, 0.6, 4, 64).rotateX(Math.PI / 2), MARBLE, 0, H, ROT);
  roundWall(p, 0, ROT, R, 48, [[Math.PI - gap, Math.PI + gap]]);
  // the panels of coloured marble round the lower order, and the blind windows of the attic
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * Math.PI * 2;
    if (Math.abs(a - Math.PI) < gap + 0.05) continue;
    const x = Math.sin(a) * (R - 0.15), z = ROT + Math.cos(a) * (R - 0.15);
    p.marble.box(2.2, 4.5, 0.1, k % 2 ? GIALLO : 0xb8b0b8, x, 6, z, 0, a, 0);
    if (k % 2 === 0) p.marble.box(1.8, 3.5, 0.1, 0xcfc4b0, Math.sin(a) * (R - 0.1), 18.5, ROT + Math.cos(a) * (R - 0.1), 0, a, 0);
  }
  // the seven niches with their altars: two columns before each, an aedicule between them on the wall
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    if (k === 4) continue; // the door
    for (const d of [-0.07, 0.07]) column(p, Math.sin(a + d) * (R - 2.2), ROT + Math.cos(a + d) * (R - 2.2), 0.6, 10.8, k === 0 ? 0xc8a868 : GIALLO);
    p.dark.box(5.4, 9.6, 0.2, 0x3a302a, Math.sin(a) * (R - 0.25), 5.6, ROT + Math.cos(a) * (R - 0.25), 0, a, 0); // the niche's shadow
    if (k === 0) { // the high altar in the apse: a mosaic of gold and the icon of the Madonna
      p.gold.box(4.2, 4.2, 0.2, 0xd2a94a, Math.sin(a) * (R - 0.4), 6.6, ROT + Math.cos(a) * (R - 0.4), 0, a, 0);
      framed(p, oldMaster(4), 1.6, 2.1, Math.sin(a) * (R - 0.6), 6.6, ROT + Math.cos(a) * (R - 0.6), a + Math.PI, { f: 0.2, label: false });
      p.marble.box(4.4, 1.3, 1.6, MARBLE, Math.sin(a) * (R - 2.0), 0.65, ROT + Math.cos(a) * (R - 2.0), 0, a, 0);
      for (const d of [-1, 1]) candelabra(p, Math.sin(a) * (R - 2.0) + Math.cos(a) * d * 1.6, ROT + Math.cos(a) * (R - 2.0) - Math.sin(a) * d * 1.6, 1.8);
      rope(p, [-5, ROT + R - 5], [5, ROT + R - 5]);
    } else if (k % 2 === 0) { // a rectangular niche: a saint on a plinth
      const x = Math.sin(a) * (R - 1.6), z = ROT + Math.cos(a) * (R - 1.6), h = plinth(p, x, z, 1.6, 1.6, 1.4);
      roman(p, x, h, z, 2.2, a + Math.PI, k);
    }
  }
  // Raphael's tomb, under his Madonna del Sasso, between two niches on the left
  {
    const a = (5.5 / 8) * Math.PI * 2, x = Math.sin(a) * (R - 1.2), z = ROT + Math.cos(a) * (R - 1.2);
    p.marble.box(3.0, 1.4, 1.4, MARBLE, x, 0.7, z, 0, a, 0);
    p.glass.push({ w: 2.6, h: 1.0, d: 1.2, x, y: 1.9, z });
    const sx = Math.sin(a) * (R - 0.5), sz = ROT + Math.cos(a) * (R - 0.5);
    p.marble.add(new THREE.CylinderGeometry(0.3, 0.4, 1.0, 8), MARBLE, sx, 3.4, sz);
    p.marble.add(new THREE.SphereGeometry(0.4, 8, 6), MARBLE, sx, 4.3, sz);
    p.block(x, z, 1.8);
  }

  // ---- the dome, its coffers, the oculus open to the sky and the shaft of light through it
  const theta0 = Math.asin(OCULUS / R);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 18, 0, Math.PI * 2, theta0, Math.PI / 2 - theta0), new THREE.MeshStandardMaterial({ map: cofferTexture(), roughness: 0.95, side: THREE.DoubleSide }));
  dome.position.set(0, H, ROT);
  g.add(dome);
  p.dark.add(new THREE.TorusGeometry(OCULUS, 0.35, 6, 32).rotateX(Math.PI / 2), 0x6a5a40, 0, H + Math.cos(theta0) * R, ROT); // the bronze ring round it
  const from = new THREE.Vector3(0, H + R, ROT), to = new THREE.Vector3(9, 0.1, ROT + 7), d = new THREE.Vector3().subVectors(to, from), L = d.length();
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(OCULUS, OCULUS * 1.2, L, 32, 1, true).translate(0, -L / 2, 0), new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0.09, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  beam.position.copy(from);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.normalize());
  g.add(beam);
  const spot = new THREE.Mesh(new THREE.CircleGeometry(OCULUS * 1.25, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xfff4d8, transparent: true, opacity: 0.35, depthWrite: false }));
  spot.position.copy(to).y = 0.1;
  spot.scale.set(1, 1, 1.3);
  g.add(spot);

  // ---- visitors: looking up at the dome, standing in the light
  let seed = 41;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const spots = [];
  for (let k = 0; k < 28; k++) { const a = rnd() * Math.PI * 2, r = 4 + rnd() * (R - 9); spots.push([Math.sin(a) * r, ROT + Math.cos(a) * r, rnd() * Math.PI * 2]); }
  for (let k = 0; k < 8; k++) spots.push([-12 + rnd() * 24, FRONT + 3 + rnd() * 10, rnd() * Math.PI * 2]);
  g.add(visitors(spots, 27));

  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: FRONT + 3.6 } };
}
