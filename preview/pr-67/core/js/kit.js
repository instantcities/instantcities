// A model put together from plain shapes, each in its own colour, merged into one mesh: one draw
// call for a whole market stall or kiosk instead of one per plank.
import * as THREE from 'three';

const MATS = {};
// one vertex-coloured material per finish, shared by every model
export const kitMat = (rough = 0.8, metal = 0) => (MATS[`${rough}:${metal}`] ??= new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, metalness: metal, flatShading: true }));

export class Kit {
  constructor() { this.pieces = []; }

  // add geo in colour hex, turned (rx, ry, rz) and then moved to (x, y, z)
  add(geo, hex, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')));
    g.translate(x, y, z);
    const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) c.toArray(a, i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    this.pieces.push(g);
    return this;
  }

  box(w, h, d, hex, x, y, z, rx, ry, rz) { return this.add(new THREE.BoxGeometry(w, h, d), hex, x, y, z, rx, ry, rz); }

  // a post or a rod from a to b ([x, y, z]), r thick
  rod(a, b, r, hex, sides = 6) {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
    const g = new THREE.CylinderGeometry(r, r, L, sides).translate(0, L / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    return this.add(g, hex, ...a);
  }

  // a block w0 by d0 at the bottom narrowing to w1 by d1 at the top, h high, standing at (x, y, z)
  // and turned ry: a mansard or a hipped roof (w1 or d1 0 for a ridge), a pavilion's tall roof
  frustum(w0, d0, w1, d1, h, hex, x = 0, y = 0, z = 0, ry = 0) {
    const b = [[-w0, -d0], [w0, -d0], [w0, d0], [-w0, d0]].map(([a, c]) => [a / 2, 0, c / 2]);
    const t = [[-w1, -d1], [w1, -d1], [w1, d1], [-w1, d1]].map(([a, c]) => [a / 2, h, c / 2]);
    const pos = [];
    const quad = (p, q, r, s) => pos.push(...p, ...q, ...r, ...p, ...r, ...s);
    for (let k = 0; k < 4; k++) quad(b[k], t[k], t[(k + 1) % 4], b[(k + 1) % 4]);
    quad(t[0], t[3], t[2], t[1]);
    quad(b[0], b[1], b[2], b[3]);
    const g = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return this.add(g, hex, x, y, z, 0, ry);
  }

  // everything added so far as one geometry (position, normal, color)
  geometry() {
    const count = this.pieces.reduce((n, g) => n + g.attributes.position.count, 0);
    const pos = new Float32Array(count * 3), nor = new Float32Array(count * 3), col = new Float32Array(count * 3);
    let o = 0;
    for (const g of this.pieces) {
      if (!g.attributes.normal) g.computeVertexNormals();
      pos.set(g.attributes.position.array, o);
      nor.set(g.attributes.normal.array, o);
      col.set(g.attributes.color.array, o);
      o += g.attributes.position.count * 3;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return out;
  }

  mesh(material = kitMat()) {
    const m = new THREE.Mesh(this.geometry(), material);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
}
