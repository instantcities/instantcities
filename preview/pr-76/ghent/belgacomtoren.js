// The old Belgacom tower on the Sint-Jacobsnieuwstraat by the Reep (the "telefoontoren", 1970s,
// Ghent's notoriously ugly office slab; the city has long wanted it gone), modelled by hand on its
// outline from photos: a slab of fourteen storeys, its two long fronts each floor a deep balcony
// with ochre fascia over a dark glazed recess, the ends blank board-marked concrete, a ground floor
// in glass behind slim concrete piers, and a plain flat roof with a lift house and aerials.
// It joins the statues (ghent/monuments.js) in place of the map's box, which the map draws as a
// Gothic tower for lack of a better kind (OpenStreetMap has it as a building:part).
import * as THREE from 'three';
import { MAP } from './map.js';
import { inside } from './blocks.js';

const FLOORS = 14, GROUND = 6, ROOF = 1.1; // storeys, the ground floor's height, the roof's parapet
const BAY = 3.6; // metres of front to a bay (a window and its balcony)
const SETBACK = 1.9; // how far the glazed recess lies behind the balconies' edge
const PIER = 2.6; // how far the ground floor's glass lies behind the piers

// the map's outline of it: the tallest building part near the Reep's bridge
function ring() {
  let best = null, top = 0;
  for (const b of MAP.buildings) {
    if (b.k !== 'part' || !(b.h > 50)) continue;
    const n = b.p.length / 2;
    let cx = 0, cz = 0;
    for (let k = 0; k < n; k++) { cx += b.p[2 * k] / n; cz += b.p[2 * k + 1] / n; }
    if (Math.hypot(cx - 701, cz + 54) < 40 && b.h > top) { top = b.h; best = b; }
  }
  return best;
}

const canvas = (w, h, draw) => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

// one bay of a floor's recess: dark balcony, a glazed door and a window beside it
function recessTexture() {
  return canvas(128, 128, (g, w, h) => {
    g.fillStyle = '#1c2024';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2d3238'; // the balcony's back wall
    g.fillRect(0, 0, w, h * 0.12);
    const pane = (x, y, pw, ph) => {
      g.fillStyle = '#a2a8a8'; g.fillRect(x - 3, y - 3, pw + 6, ph + 6);
      const grad = g.createLinearGradient(x, y, x + pw, y + ph);
      grad.addColorStop(0, '#6f8190'); grad.addColorStop(1, '#3d4954');
      g.fillStyle = grad; g.fillRect(x, y, pw, ph);
      g.fillStyle = '#a2a8a8'; g.fillRect(x + pw / 2 - 1.5, y, 3, ph);
    };
    pane(w * 0.14, h * 0.3, w * 0.34, h * 0.62); // the door to the balcony
    pane(w * 0.58, h * 0.4, w * 0.3, h * 0.38); // the window
  });
}

// the ground floor's glass, between the piers
function glassTexture() {
  return canvas(128, 128, (g, w, h) => {
    g.fillStyle = '#22272c';
    g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += w / 2) {
      const grad = g.createLinearGradient(x, 0, x + w / 2, h);
      grad.addColorStop(0, '#5b6c78'); grad.addColorStop(1, '#2c363e');
      g.fillStyle = grad; g.fillRect(x + 3, 6, w / 2 - 6, h * 0.8);
    }
  });
}

// grey board-marked concrete
function concreteTexture() {
  return canvas(128, 128, (g, w, h) => {
    g.fillStyle = '#8f9091';
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) {
      g.fillStyle = `rgba(0,0,0,${0.06 + ((y / 16) % 3) * 0.025})`;
      g.fillRect(0, y, w, 2);
      g.fillStyle = 'rgba(255,255,255,0.05)';
      g.fillRect(0, y + 2, w, 1);
    }
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(w - 2, 0, 2, h); // a panel joint
  });
}

class Soup {
  constructor() { this.pos = []; this.uv = []; }
  quad(a, b, c, d, u = 1, v = 1) {
    this.pos.push(...a, ...b, ...c, ...a, ...c, ...d);
    this.uv.push(0, 0, u, 0, u, v, 0, 0, u, v, 0, v);
  }
  mesh(group, material) {
    if (!this.pos.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, material);
    m.castShadow = m.receiveShadow = true;
    group.add(m);
  }
}

function tower(foot, h, ox, oz) {
  const g = new THREE.Group(), n = foot.length / 2;
  const ring = [];
  for (let k = 0; k < n; k++) ring.push([foot[2 * k] - ox, foot[2 * k + 1] - oz]);
  const mat = (color, rough = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, side: THREE.DoubleSide, ...extra });
  const ochre = mat(0xd2a95a, 0.8), concrete = new THREE.MeshStandardMaterial({ map: concreteTexture(), roughness: 0.95, side: THREE.DoubleSide });
  const recess = new THREE.MeshStandardMaterial({ map: recessTexture(), roughness: 0.5, metalness: 0.1, side: THREE.DoubleSide });
  const glass = new THREE.MeshStandardMaterial({ map: glassTexture(), roughness: 0.25, metalness: 0.3, side: THREE.DoubleSide });
  const grey = mat(0x74777a, 0.95), pale = mat(0xb9b4a4, 0.9);
  const S = { ochre: new Soup(), concrete: new Soup(), recess: new Soup(), glass: new Soup(), grey: new Soup(), pale: new Soup() };
  const storey = (h - GROUND - ROOF) / (FLOORS - 1); // the upper floors
  // the long axis: the way the longest edge runs
  let ax = 1, az = 0, best = 0;
  for (let k = 0; k < n; k++) {
    const [x0, z0] = ring[k], [x1, z1] = ring[(k + 1) % n], L = Math.hypot(x1 - x0, z1 - z0);
    if (L > best) { best = L; ax = (x1 - x0) / L; az = (z1 - z0) / L; }
  }
  for (let k = 0; k < n; k++) {
    const [x0, z0] = ring[k], [x1, z1] = ring[(k + 1) % n], L = Math.hypot(x1 - x0, z1 - z0);
    if (L < 0.05) continue;
    const tx = (x1 - x0) / L, tz = (z1 - z0) / L;
    // the way out of the building: the side of the edge that is not inside
    let nx = -tz, nz = tx;
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    if (inside(mx + nx * 0.4, mz + nz * 0.4, ring.flat())) { nx = -nx; nz = -nz; }
    const front = Math.abs(tx * ax + tz * az) > 0.9 && L > 5; // a long front: balconies
    const P = (d, y, t = 0) => [x0 + tx * t * L - nx * d, y, z0 + tz * t * L - nz * d]; // d metres in from the outline
    if (!front) {
      S.concrete.quad(P(0, 0), P(0, 0, 1), P(0, h, 1), P(0, h, 0), L / 4, h / 4);
      S.concrete.quad(P(0, h), P(0, h, 1), P(0.3, h, 1), P(0.3, h, 0), 1, 1);
      continue;
    }
    const bays = Math.max(1, Math.round(L / BAY));
    // the ground floor: glass behind piers
    S.glass.quad(P(PIER, 0), P(PIER, 0, 1), P(PIER, GROUND, 1), P(PIER, GROUND, 0), bays, 1);
    S.concrete.quad(P(PIER, GROUND - 0.1), P(0, GROUND - 0.1, 0), P(0, GROUND - 0.1, 1), P(PIER, GROUND - 0.1, 1), 1, 1); // the soffit
    const piers = Math.max(1, Math.round(L / 6));
    for (let j = 0; j <= piers; j++) {
      const t = j / piers, w = 0.35;
      const at = (d, y, s) => [x0 + tx * (t * L + s * w) - nx * d, y, z0 + tz * (t * L + s * w) - nz * d];
      S.concrete.quad(at(0, 0, -1), at(0, 0, 1), at(0, GROUND, 1), at(0, GROUND, -1), 1, 3); // the pier's face
      S.concrete.quad(at(PIER, 0, -1), at(0, 0, -1), at(0, GROUND, -1), at(PIER, GROUND, -1), 1, 3);
      S.concrete.quad(at(0, 0, 1), at(PIER, 0, 1), at(PIER, GROUND, 1), at(0, GROUND, 1), 1, 3);
    }
    // the floors above: a recess with its glazing, and over each a balcony slab with an ochre fascia
    for (let f = 0; f < FLOORS - 1; f++) {
      const y0 = GROUND + f * storey, y1 = y0 + storey, fascia = Math.min(1.7, storey * 0.4);
      S.recess.quad(P(SETBACK, y0 + 0.25), P(SETBACK, y0 + 0.25, 1), P(SETBACK, y1 - 0.2, 1), P(SETBACK, y1 - 0.2, 0), bays, 1);
      // the slab: its front (ochre), its underside and its top (concrete)
      S.ochre.quad(P(0, y1 - fascia), P(0, y1 - fascia, 1), P(0, y1, 1), P(0, y1, 0), 1, 1);
      S.concrete.quad(P(0, y1 - fascia), P(SETBACK, y1 - fascia, 0), P(SETBACK, y1 - fascia, 1), P(0, y1 - fascia, 1), L / 4, 1);
      S.concrete.quad(P(0, y1), P(0, y1, 1), P(SETBACK, y1, 1), P(SETBACK, y1, 0), L / 4, 1);
      // slim pale piers between the bays, up the front of the balcony
      for (let j = 0; j <= bays; j++) {
        const t = j / bays, w = 0.18;
        const at = (d, y, s) => [x0 + tx * (t * L + s * w) - nx * d, y, z0 + tz * (t * L + s * w) - nz * d];
        S.pale.quad(at(0, y0 + 0.25, -1), at(0, y0 + 0.25, 1), at(0, y1 - fascia, 1), at(0, y1 - fascia, -1), 1, 1);
      }
    }
    S.concrete.quad(P(SETBACK, h - ROOF), P(SETBACK, h - ROOF, 1), P(SETBACK, h, 1), P(SETBACK, h, 0), L / 4, 1);
  }
  // the roof: a flat slab inside a low parapet, a lift house and aerials
  const shape = new THREE.Shape();
  ring.forEach(([x, z], k) => (k ? shape.lineTo : shape.moveTo).call(shape, x, -z));
  const roofGeo = new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2).translate(0, h, 0);
  const roof = new THREE.Mesh(roofGeo, grey);
  roof.castShadow = roof.receiveShadow = true;
  g.add(roof);
  const materials = { ochre, concrete, recess, glass, grey, pale };
  for (const [name, soup] of Object.entries(S)) soup.mesh(g, materials[name]);
  // the lift house, off the middle towards one end, and the aerials on it
  let cx = 0, cz = 0;
  ring.forEach(([x, z]) => { cx += x / n; cz += z / n; });
  const lift = new THREE.Mesh(new THREE.BoxGeometry(9, 3.4, 6), concrete);
  lift.position.set(cx + ax * 8, h + 1.7, cz + az * 8);
  lift.rotation.y = -Math.atan2(az, ax);
  lift.castShadow = true;
  g.add(lift);
  for (const [d, hh] of [[-4, 7], [3, 5], [6, 9]]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, hh, 5), grey);
    mast.position.set(cx + ax * (8 + d * 0.6) - az * 1.2, h + 3.4 + hh / 2, cz + az * (8 + d * 0.6) + ax * 1.2);
    g.add(mast);
  }
  return g;
}

const B = ring();
const FOOT = B?.p ?? [];
const H = B?.h ?? 0;
const [X, Z] = (() => {
  const n = FOOT.length / 2;
  let x = 0, z = 0;
  for (let k = 0; k < n; k++) { x += FOOT[2 * k] / n; z += FOOT[2 * k + 1] / n; }
  return [x, z];
})();

export const BELGACOMTOREN = B ? [{ id: 'belgacomtoren', name: 'Belgacomtoren', x: X, z: Z, turn: 0, reach: 130, area: [FOOT], foot: [FOOT], make: () => tower(FOOT, H, X, Z) }] : [];
