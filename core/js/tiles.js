import * as THREE from 'three';
import { THEME } from './city.js';
import { SIGHT } from './device.js';
import { fitToHills } from './terrain.js';

// The city is built as a few hundred big meshes, each spanning all of it (every wall with the same
// facade, all the asphalt, every tree), so the renderer can never leave one out and draws the whole
// city, kilometres of it behind the fog, every frame and again for the shadows. Here every such
// mesh that never changes (userData.still) is cut into square tiles, TILE metres a side, each tile
// one LOD that shows nothing once the camera is GONE metres away. Near tiles are then drawn, far
// ones skipped, and those off to the side or behind are left out by the frustum.
export const TILE = 400;
// metres from the camera to a tile's middle past which all of it lies in the fog (a clear day's,
// the farthest it gets)
export const GONE = (THEME?.fog?.[1] ?? 620) * SIGHT + TILE * 0.71;
const SEE = (THEME?.fog?.[1] ?? 620) * SIGHT; // how far anyone sees on the clearest day
const BIG = TILE * 0.75; // a mesh this wide (its bounding sphere's radius) is worth cutting up

const keyOf = (x, z) => `${Math.floor(x / TILE)},${Math.floor(z / TILE)}`;
const tilesOf = new WeakMap(); // group -> Map(key -> the tile's group)

// The group for what stands at (x, z) in group's tile there (group at the origin, unturned, as the
// city's is): what is put in it keeps the city's own coordinates.
export function tileOf(group, x, z) {
  if (!tilesOf.has(group)) tilesOf.set(group, new Map());
  const tiles = tilesOf.get(group), key = keyOf(x, z);
  if (tiles.has(key)) return tiles.get(key);
  const cx = (Math.floor(x / TILE) + 0.5) * TILE, cz = (Math.floor(z / TILE) + 0.5) * TILE;
  const lod = new THREE.LOD(), near = new THREE.Group();
  lod.position.set(cx, 0, cz);
  near.position.set(-cx, 0, -cz);
  lod.addLevel(near, 0);
  lod.addLevel(new THREE.Object3D(), GONE);
  group.add(lod);
  tiles.set(key, near);
  return near;
}

// Cut up the still meshes in group.
export function tileUp(group) {
  const big = [];
  group.traverse(o => {
    // (with one material its geometry's groups make no difference, and the pieces have none)
    if (!o.isMesh || !o.userData.still || Array.isArray(o.material)) return;
    if (o.geometry.morphAttributes.position) return;
    if (o.isInstancedMesh) o.computeBoundingSphere(); // round all its instances
    else if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    if ((o.isInstancedMesh ? o.boundingSphere : o.geometry.boundingSphere).radius < BIG) return;
    big.push(o);
  });
  group.updateMatrixWorld(true);
  for (const o of big) {
    if (!o.matrixWorld.equals(group.matrixWorld)) continue; // placed or turned on its own: leave it be
    const pieces = o.isInstancedMesh ? cutInstances(o) : cutMesh(o);
    if (!pieces) continue;
    for (const [[x, z], piece] of pieces) {
      piece.name = o.name;
      piece.castShadow = o.castShadow;
      piece.receiveShadow = o.receiveShadow;
      piece.renderOrder = o.renderOrder;
      piece.frustumCulled = o.frustumCulled;
      piece.userData = { ...o.userData };
      tileOf(group, x, z).add(piece);
    }
    o.removeFromParent();
  }
}

// The triangles of a mesh, sorted into the tiles their middles lie in, each tile with only the
// corners it uses.
function cutMesh(o) {
  const g = o.geometry, pos = g.attributes.position, n = pos.count;
  const index = g.index ? g.index.array : null, count = index ? index.length : n;
  const at = k => (index ? index[k] : k);
  const byTile = new Map();
  for (let t = 0; t < count; t += 3) {
    const a = at(t), b = at(t + 1), c = at(t + 2);
    const x = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3, z = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3, key = keyOf(x, z);
    if (!byTile.has(key)) byTile.set(key, { at: [x, z], list: [] });
    byTile.get(key).list.push(t);
  }
  if (byTile.size < 2) return null;
  // stamp[v]: the last tile corner v was taken into, remap[v]: its number there
  const stamp = new Int32Array(n).fill(-1), remap = new Uint32Array(n), out = [];
  let tileNo = 0;
  for (const { at: where, list: starts } of byTile.values()) {
    const corners = [], idx = new Uint32Array(starts.length * 3);
    starts.forEach((t, s) => {
      for (let q = 0; q < 3; q++) {
        const v = at(t + q);
        if (stamp[v] !== tileNo) { stamp[v] = tileNo; remap[v] = corners.length; corners.push(v); }
        idx[s * 3 + q] = remap[v];
      }
    });
    const piece = new THREE.BufferGeometry();
    for (const [name, a] of Object.entries(g.attributes)) {
      const size = a.itemSize, src = a.array, dst = new src.constructor(corners.length * size);
      corners.forEach((v, k) => { for (let c = 0; c < size; c++) dst[k * size + c] = src[v * size + c]; });
      piece.setAttribute(name, new THREE.BufferAttribute(dst, size, a.normalized));
    }
    piece.setIndex(new THREE.BufferAttribute(corners.length > 65535 ? idx : Uint16Array.from(idx), 1));
    out.push([where, new THREE.Mesh(piece, o.material)]);
    tileNo++;
  }
  g.dispose();
  return out;
}

// The instances of an instanced mesh, sorted into the tiles they stand in.
function cutInstances(o) {
  const m = o.instanceMatrix.array, col = o.instanceColor?.array, byTile = new Map();
  for (let i = 0; i < o.count; i++) {
    const x = m[i * 16 + 12], z = m[i * 16 + 14], key = keyOf(x, z);
    if (!byTile.has(key)) byTile.set(key, { at: [x, z], list: [] });
    byTile.get(key).list.push(i);
  }
  if (byTile.size < 2) return null;
  const out = [];
  for (const { at: where, list } of byTile.values()) {
    const im = new THREE.InstancedMesh(o.geometry, o.material, list.length);
    list.forEach((i, k) => {
      im.instanceMatrix.array.set(m.subarray(i * 16, i * 16 + 16), k * 16);
    });
    if (col) {
      im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(list.length * 3), 3);
      list.forEach((i, k) => im.instanceColor.array.set(col.subarray(i * 3, i * 3 + 3), k * 3));
    }
    out.push([where, im]);
  }
  return out;
}

// ------------------------------------------------------------------ built when first in sight

// The heavy things (the landmarks with their drawn walls, the houses tile by tile) are not built
// with the city but when a camera first comes within sight of them, and let go again, their
// geometry and textures freed, once every camera is SLACK metres past that: a phone keeps only
// the city round the riders in memory, not all of it.
const SLACK = 200;
const waiting = []; // { parent, x, z, r, make, obj }

// make() returns what stands at (x, z), within r metres of it, to put in parent.
export function later(parent, x, z, r, make) {
  waiting.push({ parent, x, z, r, make, obj: null });
}

// Every frame, with where the cameras are: make what came into sight, nearest first, for at most
// ms milliseconds (at least one thing), and let go of what fell well behind. After a jump (the
// first view, a teleport) all of what is in sight is made at once, so nothing pops up in front.
let seen = [];
export function lookAround(eyes, ms = 6) {
  const jumped = eyes.some((e, k) => !seen[k] || Math.hypot(e.x - seen[k].x, e.z - seen[k].z) > 50);
  seen = eyes.map(e => ({ x: e.x, z: e.z }));
  const t0 = performance.now(), todo = [];
  for (const it of waiting) {
    let d = Infinity;
    for (const e of eyes) d = Math.min(d, Math.hypot(e.x - it.x, e.z - it.z) - it.r);
    if (it.obj && d > SEE + SLACK) {
      drop(it.obj);
      it.obj = null;
    } else if (!it.obj && d < SEE) todo.push([d, it]);
  }
  todo.sort((a, b) => a[0] - b[0]);
  for (const [, it] of todo) {
    it.obj = it.make();
    it.parent.add(it.obj);
    fitToHills(it.obj);
    if (!jumped && performance.now() - t0 > ms) break;
  }
}

// Free what something built took on the GPU and let the rest be collected. A texture several
// share (userData.shared) is theirs to let go. The materials are left be: disposing them would
// throw their compiled shaders away too, and compiling one again stalls a frame.
function drop(obj) {
  obj.removeFromParent();
  obj.traverse(o => {
    o.geometry?.dispose();
    for (const m of [o.material ?? []].flat()) {
      for (const k in m) if (m[k]?.isTexture && !m[k].userData.shared) m[k].dispose();
    }
  });
  obj.userData.gone?.();
}
