// Florence's cathedral, Santa Maria del Fiore, from the inside, simplified: the nave of four huge
// bays, grey pietra serena on pale walls and almost bare, Uccello's clock over the west door running
// the old Italian hours, his fresco of Sir John Hawkwood on the north wall, the marble floor, and over
// the crossing Brunelleschi's dome, painted inside with Vasari's and Zuccari's Last Judgment.
//
// Game metres, x across and z towards the altar, from the middle of the crossing; the west door (to
// Piazza del Duomo, facing the Baptistery) at -z.
import * as THREE from 'three';
import { cruciform, floorMat } from '../../core/js/inside/gothic.js';
import { candelabra } from '../../core/js/inside/props.js';
import { pews, highAltar } from '../../core/js/inside/church.js';
import { lastJudgment, hawkwood } from '../../core/js/inside/art.js';
import { framed, visitors, rope } from '../../core/js/inside/rooms.js';

export const CONFIG = {
  pitch: 22, a: 10, aisle: 9, nave: 4, choir: 1, arm: 16,
  ySA: 22, rA: 9, ySV: 30, rV: 12,
  seed: 6, door: 6, organ: true, aisleWindow: 7, dome: true,
  tint: { stone: 0xe8e0d4, pier: 0x8a8c88, vault: 0xf2ece0, rib: 0x8a8c88, wall: 0xeee6da },
  floor: floorMat('#e8e4da', '#7a2a2a', true, 2.4),
  chapels: [{ x: 0, w: 14, d: 10 }],
};

// Uccello's clock (1443): one hand, going round the wrong way, the 24 hours of the day counted from
// sunset, four prophets' heads in the corners
function clockFace() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#3a5a8a'; g.fillRect(0, 0, 512, 512);
  for (const [x, y] of [[60, 60], [452, 60], [60, 452], [452, 452]]) { g.fillStyle = '#e2b48c'; g.beginPath(); g.arc(x, y, 32, 0, 7); g.fill(); g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(x, y, 40, 0, 7); g.lineWidth = 6; g.strokeStyle = '#d2a94a'; g.stroke(); }
  g.fillStyle = '#1a2a4a'; g.beginPath(); g.arc(256, 256, 200, 0, 7); g.fill();
  g.fillStyle = '#f0e8d0'; g.font = '700 26px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let k = 0; k < 24; k++) { const a = -Math.PI / 2 - (k / 24) * Math.PI * 2; g.fillText(['I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'VIIII', 'X', 'XI', 'XII', 'XIII', 'XIIII', 'XV', 'XVI', 'XVII', 'XVIII', 'XVIIII', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIIII'][k], 256 + Math.cos(a) * 170, 256 + Math.sin(a) * 170); }
  g.strokeStyle = '#d2a94a'; g.lineWidth = 10; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + 120, 256 - 60); g.stroke();
  g.fillStyle = '#d2a94a'; g.beginPath(); g.arc(256, 256, 16, 0, 7); g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.userData.shared = true;
  return tex;
}

export function makeDuomo() {
  const church = cruciform(CONFIG);
  const p = church.parts, { a, b, P, zW, zE, TA, ySV, rV } = church;
  const g = new THREE.Group();
  p.doors([-a, zW], [a, zW], a - 3, a + 3, 6.6, 2.6);
  p.picture(clockFace(), 6, 6, 0, 22, zW + 0.9, 0);
  pews(p, zW + 10, -a - 6, 6, 2);
  // Hawkwood on the north aisle wall, and his twin Niccolò da Tolentino beside him
  framed(p, hawkwood(), 6, 9.4, -b + 0.9, 7, -a - 2.4 * P, Math.PI / 2, { f: 0.3, color: 0x8a6a4a, label: false, lamp: false });
  framed(p, hawkwood(false), 6, 9.4, -b + 0.9, 7, -a - 3.2 * P, Math.PI / 2, { f: 0.3, color: 0x8a6a4a, label: false, lamp: false });

  // the dome: an octagon of painted vault over the crossing, the Last Judgment in rings up to the
  // lantern's eye, on its drum with the round windows
  const R = a * 1.08, y0 = ySV + rV + 6;
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 6, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.9, side: THREE.DoubleSide, flatShading: true }));
  drum.position.set(0, y0 - 3, 0);
  drum.rotation.y = Math.PI / 8;
  g.add(drum);
  for (let k = 0; k < 8; k++) { const t = (k / 8) * Math.PI * 2 + Math.PI / 8; p.daylight.add(new THREE.CircleGeometry(1.1, 16).rotateY(t + Math.PI), 0xf6f0dc, Math.sin(t) * (R - 0.2), y0 - 3, Math.cos(t) * (R - 0.2)); }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 8, 12, Math.PI / 8, Math.PI * 2, 0.08, Math.PI / 2 - 0.08), new THREE.MeshStandardMaterial({ map: lastJudgment(false), roughness: 0.9, side: THREE.DoubleSide, flatShading: true }));
  dome.position.set(0, y0, 0);
  dome.scale.y = 1.35;
  g.add(dome);
  p.daylight.add(new THREE.CircleGeometry(R * 0.09, 16).rotateX(Math.PI / 2), 0xfaf4e0, 0, y0 + R * 1.35 * Math.cos(0.08) - 0.1, 0); // the lantern's eye
  // under it the high altar and the choir's marble enclosure (Bandinelli), octagonal
  highAltar(p, 0, { w: 6 });
  for (let k = 0; k < 8; k++) {
    const t = (k / 8) * Math.PI * 2 + Math.PI / 8, n = (k + 1) / 8 * Math.PI * 2 + Math.PI / 8;
    if (k === 4) continue; // the way in, from the nave
    p.marble.box(2 * (a - 2) * Math.sin(Math.PI / 8), 2.4, 0.5, 0xf0ece2, Math.sin((t + n) / 2) * (a - 2) * Math.cos(Math.PI / 8), 1.2, Math.cos((t + n) / 2) * (a - 2) * Math.cos(Math.PI / 8), 0, (t + n) / 2, 0);
  }
  for (const [x, z] of [[-a + 1.6, -a + 1.6], [a - 1.6, -a + 1.6]]) candelabra(p, x, z, 3.2);
  rope(p, [-4, -a + 0.6], [4, -a + 0.6]);

  let s = 31;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const spots = [];
  for (let k = 0; k < 30; k++) spots.push([(rnd() - 0.5) * 2 * (b - 2), zW + 6 + rnd() * (-a - zW - 8), rnd() * Math.PI * 2]);
  for (let k = 0; k < 8; k++) spots.push([(rnd() < 0.5 ? -1 : 1) * (a + 2 + rnd() * (TA - 4)), (rnd() - 0.5) * 2 * (a - 2), rnd() * Math.PI * 2]);
  g.add(visitors(spots, 59));
  g.add(p.mesh());
  return { group: g, foot: p.foot, door: { x: 0, z: zW + 1.8 } };
}
