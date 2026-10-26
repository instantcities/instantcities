// The shared parts of New York's Art Deco towers (empire-state.js, chrysler.js): a tower stacked, as the
// map stacks it, from OpenStreetMap's building parts, each an outline standing from one height to
// another, but dressed as the real one is: the stone between its piers, and the windows and their
// metal spandrels running up in unbroken stripes from one setback to the next.
// A part is [from, to, ring]: its heights and its outline as a flat [x, z, x, z, ...] ring in the
// model's metres (the city's, from the monument's x, z: no turn).
import * as THREE from 'three';

// the outline turned outwards: +1 when its corners run so that (dz, -dx) points out of it
const outward = ring => {
  let a = 0;
  for (let i = 0; i < ring.length; i += 2) {
    const j = (i + 2) % ring.length;
    a += ring[i] * ring[j + 1] - ring[j] * ring[i + 1];
  }
  return a > 0 ? 1 : -1;
};

// a part as a solid block, flat-topped
export function prism(kit, [y0, y1, ring], hex) {
  const shape = new THREE.Shape();
  for (let i = 0; i < ring.length; i += 2) shape[i ? 'lineTo' : 'moveTo'](ring[i], -ring[i + 1]);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, y0, 0);
  return kit.add(geo, hex);
}

// The stripes up a part's sides: on every side at least `min` long, a stripe w wide every `every`
// metres, standing `out` proud of the wall, from a little over the part's foot to a little under its
// top; and the band of stone or metal along its top edge (`cap`, its height).
export function stripes(kit, [y0, y1, ring], { every = 2.6, w = 1.2, out = 0.12, hex, min = 4, cap = 0, capHex, from = y0 + 1.2, to = y1 - 1.2 }) {
  const sign = outward(ring), n = ring.length / 2;
  for (let i = 0; i < n; i++) {
    const ax = ring[2 * i], az = ring[2 * i + 1], bx = ring[(2 * i + 2) % ring.length], bz = ring[(2 * i + 3) % ring.length];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < min) continue;
    const dx = (bx - ax) / L, dz = (bz - az) / L, nx = sign * dz, nz = -sign * dx, ry = Math.atan2(-dz, dx);
    const k = Math.max(1, Math.floor(L / every));
    if (to > from) for (let j = 0; j < k; j++) {
      const s = ((j + 0.5) * L) / k;
      kit.box(w, to - from, 0.2, hex, ax + dx * s + nx * out, (from + to) / 2, az + dz * s + nz * out, 0, ry);
    }
    if (cap) kit.box(L + 0.3, cap, 0.5, capHex ?? hex, (ax + bx) / 2 + nx * 0.2, y1 - cap / 2, (az + bz) / 2 + nz * 0.2, 0, ry);
  }
  return kit;
}

// a ring in the model's metres moved onto the map at (x, z), for area and foot
export const placed = (x, z, ring) => ring.map((v, k) => Math.round((v + (k % 2 ? z : x)) * 10) / 10);
