// The Stroppendragers on the Belfortstraat and across the Sint-Baafsplein, only for the tour: the procession of the Gentse Feesten
// that remembers how Charles V made Ghent's aldermen walk to him in 1540, barefoot, in a white shirt
// with a noose (a strop) round their neck. A file of them in white, barefoot, the rope hanging down their
// chest, and beside them the men in black with a white ruff, a tall black hat and a halberd
// (hand-written, after the photos). They walk towards the camera coming the other way.
// Each kind of figure is one merged, vertex-coloured mesh, drawn as one instanced mesh for all of them:
// four draw calls for a whole procession.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { person, add, std } from './wedding.js';

const S = 1.25; // game metres to a real metre
const PACE = 0.1; // how fast they walk, the camera's 1
// Each procession: line, the way they walk, [x, z]; at: where the camera is on its path when the
// head of it is head metres along the line
const WAYS = {
  // up the Belfortstraat from the Vrijdagmarkt's end, some 20 m from the Botermarkt as the camera leaves the wedding
  belfortstraat: { line: [[312, -325], [251, -261], [175, -181]], at: [151, -131], head: 180 },
  // across the middle of the Sint-Baafsplein from the cathedral towards the Belfort, ahead as the camera comes from the Emile Braunplein
  'sint-baafsplein': { line: [[210, 22], [160, -2], [120, -20]], at: [40, -24], head: 28 },
};

// one figure's parts, merged into one geometry with its colours on its corners (buskers.js too)
export function bake(g) {
  g.updateMatrixWorld(true);
  const parts = [];
  g.traverse(o => {
    if (!o.isMesh) return;
    const geo = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld);
    for (const k of Object.keys(geo.attributes)) if (k !== 'position' && k !== 'normal') geo.deleteAttribute(k);
    const c = o.material.color, n = geo.attributes.position.count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    parts.push(geo);
  });
  return mergeGeometries(parts);
}

// barefoot, in a long white shirt, arms down, the noose round the neck and its rope hanging down the chest
function stroppendrager(k) {
  const skins = [0xefcfb4, 0xe2b896, 0xd9b08f], hairs = [0xb8b3aa, 0xdedbd5, 0x5a3a22, 0x8a8278];
  const skin = skins[k % skins.length];
  const p = person({ top: 0xf6f5f1, skirt: [0xf6f5f1, 0.82, 0.12], skin, hair: hairs[k % hairs.length], shoes: skin, arms: ['down', 'down'], tall: 0.97 + (k % 3) * 0.03 });
  const rope = std(0xd9c79a, 0.9);
  add(p.g, new THREE.TorusGeometry(0.1, 0.018, 6, 16), rope, 0, 1.46, 0, Math.PI / 2 - 0.25); // round the neck
  add(p.g, new THREE.CylinderGeometry(0.016, 0.016, 0.42, 6), rope, 0, 1.2, 0.16); // hanging down the chest
  return p.g;
}

// in black, a white ruff, a tall black hat with a brim, and a halberd held upright in the right hand
function guard() {
  const black = 0x161617;
  const p = person({ top: black, skirt: [black, 0.55, 0.14], legs: black, skin: 0xe2b896, hair: 0x5a3a22, arms: ['down', 'front'], tall: 1.02 });
  add(p.g, new THREE.CylinderGeometry(0.2, 0.17, 0.08, 16), std(0xf6f5f1, 0.7), 0, 1.47, 0); // the ruff
  for (const s of [-1, 1]) add(p.g, new THREE.CylinderGeometry(0.075, 0.075, 0.5, 8), std(black), s * 0.095, 0.25, 0); // boots
  add(p.head, new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16), std(black), 0, 0.08, 0); // the hat's brim
  add(p.head, new THREE.ConeGeometry(0.1, 0.32, 12), std(black), 0, 0.24, 0);
  const wood = std(0xc97a2b, 0.7), iron = std(0xc9ccd0, 0.4);
  add(p.g, new THREE.CylinderGeometry(0.02, 0.02, 2.4, 6), wood, 0.24, 1.3, 0.35); // the halberd's shaft
  add(p.g, new THREE.ConeGeometry(0.03, 0.3, 6), iron, 0.24, 2.65, 0.35); // its point
  add(p.g, new THREE.BoxGeometry(0.02, 0.22, 0.2), iron, 0.24, 2.38, 0.45); // its axe
  return p.g;
}

// where along the procession each walks: [metres behind the head, metres right of the middle]
const FILE = Array.from({ length: 10 }, (_, k) => [2.4 + k * 1.5, 0]);
const GUARDS = [[0, -0.8], [0, 0.8], [6, -1.3], [10.5, 1.3], [15, -1.3], [17.5, 1.3]];

export function procession({ line: LINE, at: AT, head: HEAD }) {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 });
  // (the white men differ: three of them baked, taking turns down the file)
  const kinds = [0, 1, 2].map(k => new THREE.InstancedMesh(bake(stroppendrager(k)), mat, Math.ceil(FILE.length / 3)));
  const guards = new THREE.InstancedMesh(bake(guard()), mat, GUARDS.length);
  const g = new THREE.Group();
  for (const m of [...kinds, guards]) {
    m.frustumCulled = false; // (its instances are put far from where the mesh is)
    m.castShadow = true;
    g.add(m);
  }
  const cum = [0];
  for (let k = 1; k < LINE.length; k++) cum.push(cum[k - 1] + Math.hypot(LINE[k][0] - LINE[k - 1][0], LINE[k][1] - LINE[k - 1][1]));
  // where on LINE, d metres along it, and the way it goes there
  const along = d => {
    let k = 1;
    while (k < LINE.length - 1 && cum[k] < d) k++;
    const [ax, az] = LINE[k - 1], [bx, bz] = LINE[k], L = cum[k] - cum[k - 1], t = Math.max(0, Math.min(1, (d - cum[k - 1]) / L));
    return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, dx: (bx - ax) / L, dz: (bz - az) / L };
  };
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), pos = new THREE.Vector3(), one = new THREE.Vector3(S, S, S), none = new THREE.Vector3(0, 0, 0);
  let at = null; // the tour's s at AT
  // where each of them is, for the traffic to stop for ({ pos: { x, z } }, as the riders)
  const walkers = g.userData.walkers = [...FILE, ...GUARDS].map(() => ({ pos: { x: 0, z: 0 } }));
  // tour: where the camera is; t: seconds; ground(x, z): how high the ground is
  g.userData.update = (tour, t, ground) => {
    if (at === null) {
      let best = Infinity;
      for (const p of tour.pts) { const d = Math.hypot(p.x - AT[0], p.z - AT[1]); if (d < best) { best = d; at = p.s; } }
    }
    g.position.set(0, 0, 0); // (its figures are put in the world's own metres)
    g.rotation.set(0, 0, 0);
    const head = HEAD + (tour.s - at) * PACE;
    let n = 0;
    const put = (mesh, i, [back, right], step) => {
      const da = head - back * S, w = along(da), d = right * S, on = da >= 0 && da <= cum[cum.length - 1]; // (off the street's ends: not drawn)
      const x = w.x + w.dz * d, z = w.z - w.dx * d; // (on their right, facing the way they go)
      const bob = Math.abs(Math.sin(t * 3.4 + step)) * 0.04;
      pos.set(x, ground(x, z) + bob, z);
      walkers[n].pos.x = on ? x : 1e6; // (nobody for the cars to stop for)
      walkers[n++].pos.z = z;
      q.setFromAxisAngle(up, Math.atan2(w.dx, w.dz) + Math.sin(t * 3.4 + step) * 0.04); // facing the way they go
      mesh.setMatrixAt(i, m4.compose(pos, q, on ? one : none));
    };
    FILE.forEach((f, k) => put(kinds[k % 3], Math.floor(k / 3), f, k * 1.3));
    GUARDS.forEach((f, k) => put(guards, k, f, k * 2.1));
    for (const m of [...kinds, guards]) m.instanceMatrix.needsUpdate = true;
  };
  return g;
}

export const STROPPEN = Object.entries(WAYS).map(([id, way]) => ({ id: `stroppendragers-${id}`, x: way.line[0][0], z: way.line[0][1], make: () => procession(way) }));
