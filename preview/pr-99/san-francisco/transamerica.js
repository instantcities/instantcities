// The Transamerica Pyramid (William Pereira, 1969-72), modelled by hand in place of the map's stack
// of boxes of it, from its measurements and photos, in game metres (the real ones times 1.25), on
// the map's outline: 260 m to the tip of its spire, the tallest tower of the city for 45 years.
//   the four faces of white quartz aggregate, leaning in from 46 m across at the street to 14 m at
//     the 48th floor, each with its rows of windows, 3,678 of them in all
//   the base: the lobby's glass set back behind the white legs that lean with the faces, and the
//     transfer truss over them
//   the two wings that stand out of the east and west faces from the 29th floor up, the lifts in
//     the east one and the stairs and a smoke tower in the west one
//   the spire of aluminium panels over the top floor, 65 m of it
// Riders bump into its foot.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';

const X = -354.6, Z = -216.4, TURN = 0.159; // its middle, and the street grid turned from east (local +u runs east along it)
const W0 = 28.8, W1 = 9, TOPF = 265, TIP = 325; // the half width at the street and at the top floor, the top floor, the tip
const BASE = 18; // the lobby's storeys under the transfer truss
const WHITE = '#ecebe5', WHITE2 = '#dcdbd4', GLASS = '#3b444d', SPIRE = '#d9dcdc';
const half = y => W0 + ((W1 - W0) * y) / TOPF; // the half width at height y

// the faces' windows: a tile of one storey (4.75 m) and two windows (4 m), white between them
let faceMat;
function material() {
  if (faceMat) return faceMat;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = WHITE;
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#56606a';
  for (const x of [5, 37]) g.fillRect(x, 18, 22, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return (faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75, side: THREE.DoubleSide }));
}

// the four faces from y0 up to the top floor, each a trapezoid leaning in, its windows in rows
function faces(y0) {
  const pos = [], uv = [];
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2, c = Math.cos(a), s = Math.sin(a);
    // a point on the face: x across it, at height y, out on the face's normal (c, s)
    const P = (x, y) => { const w = half(y); return [c * w - s * x, y, s * w + c * x]; };
    const b0 = half(y0), b1 = half(TOPF);
    const q = [[-b0, y0], [b0, y0], [b1, TOPF], [-b1, TOPF]];
    for (const i of [0, 1, 2, 0, 2, 3]) {
      pos.push(...P(...q[i]));
      uv.push(q[i][0] / 4, q[i][1] / 4.75);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, material());
  m.castShadow = m.receiveShadow = true;
  return m;
}

export function transamerica() {
  const kit = new Kit();
  // the lobby's glass behind the legs, the legs leaning with the faces, the truss over them
  kit.box(2 * (W0 - 4), BASE, 2 * (W0 - 4), GLASS, 0, BASE / 2, 0);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2, c = Math.cos(a), s = Math.sin(a);
    for (let j = 0; j < 9; j++) {
      const x = -W0 + 1 + (j * (2 * W0 - 2)) / 8, x1 = x * (half(BASE) / W0);
      kit.rod([c * W0 - s * x, 0, s * W0 + c * x], [c * half(BASE) - s * x1, BASE, s * half(BASE) + c * x1], 0.75, WHITE2, 6);
    }
  }
  kit.frustum(2 * half(BASE) + 0.6, 2 * half(BASE) + 0.6, 2 * half(BASE + 3), 2 * half(BASE + 3), 3, WHITE2, 0, BASE, 0);
  // the wings, east and west, standing out of the faces where these grow narrower than them
  for (const s of [-1, 1]) {
    kit.box(17, 128, 8, WHITE2, s * 8.5, 140 + 64, 0);
    kit.frustum(17, 8, 17, 4, 4, WHITE2, s * 8.5, 268, 0);
    for (let y = 150; y < 266; y += 9.5) kit.box(0.3, 0.6, 8.2, '#c8c7c0', s * 17, y, 0); // the joints of its panels
  }
  // the top floor's rim and the spire, with the beacon at its tip
  kit.box(2 * W1 + 0.6, 1, 2 * W1 + 0.6, WHITE2, 0, TOPF + 0.5, 0);
  kit.frustum(2 * W1, 2 * W1, 0, 0, TIP - TOPF - 1, SPIRE, 0, TOPF + 1, 0);
  kit.add(new THREE.SphereGeometry(0.5, 8, 6), '#c0392b', 0, TIP - 0.3, 0);
  const group = new THREE.Group();
  group.add(kit.mesh(kitMat(0.6)), faces(BASE + 3));
  return group;
}

// It stands in for the map's stack of it and the ring of walls drawn round its foot (area); riders
// bump into the legs (foot).
export const TRANSAMERICA = [{
  id: 'transamerica-pyramid', name: 'Transamerica Pyramid', x: X, z: Z, turn: TURN, reach: 1200,
  area: [onMap(X, Z, TURN, rect(-36, -36, 36, 36))],
  foot: [onMap(X, Z, TURN, rect(-W0, -W0, W0, W0))],
  make: transamerica,
}];
