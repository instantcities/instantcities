// The forecourt south of the great gate (the Jilaukhana): the two L-shaped halls either side of
// the way in, in red sandstone, in place of the map's two blocks of houses. Each is drawn from the
// outline the map has of it: a low block with a row of pointed arches along every side, a white
// band under the roof and a flat roof. In game metres.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { linePath, wall, pointedRing } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';
import { MAP } from './map.js';

const SAND = '#b4523a', SAND2 = '#8f3f2c', MARBLE = '#f1ede3';
const H = 9; // the hall's height

// the map's big blocks in the forecourt: south of the gate (z > 180) and north of the road across (z < 300)
const area = p => Math.abs(p.reduce((s, v, i) => (i % 2 ? s : s + v * p[(i + 3) % p.length] - p[(i + 2) % p.length] * p[i + 1]), 0)) / 2;
const HALLS = MAP.buildings.filter(b => {
  const xs = b.p.filter((_, i) => !(i % 2)), zs = b.p.filter((_, i) => i % 2);
  const cz = zs.reduce((s, v) => s + v, 0) / zs.length;
  return cz > 180 && cz < 330 && area(b.p) > 2500 && Math.min(...xs) > -330 && Math.max(...xs) < 160;
}).map(b => b.p);

const pairs = p => Array.from({ length: p.length / 2 }, (_, i) => [p[2 * i], p[2 * i + 1]]);
const signed = pts => pts.reduce((s, [x, z], i) => s + x * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * z, 0);

// the outline moved d metres inwards (a rectilinear one: each corner along its bisector)
function inset(pts, d) {
  const dir = signed(pts) > 0 ? 1 : -1;
  return pts.map((q, i) => {
    const a = pts[(i + pts.length - 1) % pts.length], b = pts[(i + 1) % pts.length];
    const n = (u, v) => { const l = Math.hypot(v[0] - u[0], v[1] - u[1]) || 1; return [-(v[1] - u[1]) / l * dir, (v[0] - u[0]) / l * dir]; };
    const n1 = n(a, q), n2 = n(q, b), m = [n1[0] + n2[0], n1[1] + n2[1]], k = d / Math.max(0.3, 1 + n1[0] * n2[0] + n1[1] * n2[1]);
    return [q[0] + m[0] * k, q[1] + m[1] * k];
  });
}

function hall(kit, p) {
  const pts = pairs(p);
  if (signed(pts) < 0) pts.reverse(); // clockwise on the map (x east, z south): the outside is on each edge's right-hand side
  const core = new THREE.Shape(inset(pts, 1.6).map(([x, z]) => new THREE.Vector2(x, -z)));
  kit.add(new THREE.ExtrudeGeometry(core, { depth: H, bevelEnabled: false }).rotateX(-Math.PI / 2), SAND2, 0, 0, 0);
  const roof = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  kit.add(new THREE.ExtrudeGeometry(roof, { depth: 0.8, bevelEnabled: false }).rotateX(-Math.PI / 2), shade(SAND, 0.1), 0, H, 0);
  pts.forEach(([x, z], i) => {
    const [x2, z2] = pts[(i + 1) % pts.length], path = linePath(x, z, x2, z2), L = path.length;
    if (L < 4) return;
    const n = Math.max(1, Math.round(L / 5.2)), bay = L / n, holes = [];
    for (let k = 0; k < n; k++) holes.push(pointedRing((k + 0.5) * bay, bay * 0.55, 0.3, H - 2.2, 1.25));
    wall(kit, path, [[0, 0], [L, 0], [L, H], [0, H]], { holes, o0: -1.6, o1: 0.1, hex: SAND, ends: false });
    wall(kit, path, [[0, H - 0.9], [L, H - 0.9], [L, H + 0.3], [0, H + 0.3]], { o0: -0.6, o1: 0.5, hex: MARBLE, ends: false });
  });
}

export function forecourt() {
  const kit = new Kit();
  for (const p of HALLS) hall(kit, p);
  return kit.mesh(kitMat(0.9));
}

const box = p => {
  const xs = p.filter((_, i) => !(i % 2)), zs = p.filter((_, i) => i % 2), [x0, x1, z0, z1] = [Math.min(...xs) - 1, Math.max(...xs) + 1, Math.min(...zs) - 1, Math.max(...zs) + 1];
  return [x0, z0, x1, z0, x1, z1, x0, z1].map(v => Math.round(v * 10) / 10);
};

// They stand in for the map's two blocks (area); riders bump into them (foot).
export const FORECOURT = HALLS.length ? [{
  id: 'forecourt', name: 'Forecourt', x: 0, z: 0, turn: 0, reach: 500,
  area: HALLS.map(box), // the map's block is dropped where its middle falls, which in an L is outside it: so the whole box
  foot: HALLS.map(p => p.map(v => Math.round(v * 10) / 10)),
  make: forecourt,
}] : [];
