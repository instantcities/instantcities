// The hills under a city (its TERRAIN, made by tools/terrain.mjs): Ghent climbs some 20 m from the
// Leie up the Blandijnberg to the Boekentoren. The game itself stays flat: riders, cars, bridges and
// colliders all keep y = 0 for the street. Only what is drawn is lifted, in every vertex shader, by
// how much higher the ground lies there than where the camera's rider is (lookFrom). So round a
// rider nothing moves, and the streets ahead climb or fall away. A city without TERRAIN stays flat.
import * as THREE from 'three';
import { TERRAIN, MOUNDS } from './city.js';

let grid = null;
if (TERRAIN) {
  const bytes = Uint8Array.from(atob(TERRAIN.mm), ch => ch.charCodeAt(0));
  const mm = new Uint16Array(bytes.buffer), data = new Float32Array(mm.length);
  for (let k = 0; k < mm.length; k++) data[k] = mm[k] / 1000;
  grid = { ...TERRAIN, w: TERRAIN.nx + 1, data };
  for (const m of MOUNDS ?? []) raise(grid, m);
}

// A hill the terrain model leaves out (a city's MOUNDS: a heap of earth like the Karel Sabbeberg),
// put on the grid: { x, z, h, rx, rz, turn, flat }, its top h high at (x, z), its foot an ellipse rx
// by rz turned by `turn`, flat on top over `flat` of that, and smooth down to the foot.
function raise({ x0, z0, cell, nx, nz, w, data }, { x, z, h, rx, rz, turn = 0, flat = 0 }) {
  const c = Math.cos(turn), s = Math.sin(turn), R = Math.max(rx, rz);
  const i0 = Math.max(0, Math.floor((x - R - x0) / cell)), i1 = Math.min(nx, Math.ceil((x + R - x0) / cell));
  const j0 = Math.max(0, Math.floor((z - R - z0) / cell)), j1 = Math.min(nz, Math.ceil((z + R - z0) / cell));
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      const dx = x0 + i * cell - x, dz = z0 + j * cell - z, u = (dx * c + dz * s) / rx, v = (-dx * s + dz * c) / rz;
      const t = Math.min(1, Math.max(0, (Math.hypot(u, v) - flat) / (1 - flat)));
      data[j * w + i] += h * (1 - t * t * t * (t * (t * 6 - 15) + 10));
    }
  }
}
export const HILLS = !!grid;

// How high the ground lies at (x, z), in game metres (0 off the hills, or past the map's edge:
// the edge's height).
export function heightAt(x, z) {
  if (!grid) return 0;
  const { x0, z0, cell, nx, nz, w, data } = grid;
  const u = Math.max(0, Math.min(nx, (x - x0) / cell)), v = Math.max(0, Math.min(nz, (z - z0) / cell));
  const i = Math.min(nx - 1, Math.floor(u)), j = Math.min(nz - 1, Math.floor(v)), fu = u - i, fv = v - j;
  const k = j * w + i;
  return (1 - fv) * ((1 - fu) * data[k] + fu * data[k + 1]) + fv * ((1 - fu) * data[k + w] + fu * data[k + w + 1]);
}

// How steeply the ground climbs going (fx, fz) (a unit vector) from (x, z): metres up per metre.
export function slopeAlong(x, z, fx, fz) {
  if (!grid) return 0;
  return (heightAt(x + fx * 2, z + fz * 2) - heightAt(x - fx * 2, z - fz * 2)) / 4;
}

// ------------------------------------------------------------------ in the shaders

const U = {
  terrainMap: { value: null },
  terrainGrid: { value: new THREE.Vector4() }, // x0, z0, 1 / cell, the height the camera looks from
  terrainSize: { value: new THREE.Vector3() }, // nx, nz, and 1 to lift (0: flat, for the picker's studio)
};
const GLSL = `uniform highp sampler2D terrainMap;
uniform vec4 terrainGrid;
uniform vec3 terrainSize;
vec4 terrainLift(vec4 p) {
  vec2 u = clamp((p.xz - terrainGrid.xy) * terrainGrid.z, vec2(0.0), terrainSize.xy);
  ivec2 i = ivec2(min(floor(u), terrainSize.xy - 1.0));
  vec2 f = u - vec2(i);
  float a = texelFetch(terrainMap, i, 0).r, b = texelFetch(terrainMap, i + ivec2(1, 0), 0).r;
  float c = texelFetch(terrainMap, i + ivec2(0, 1), 0).r, d = texelFetch(terrainMap, i + ivec2(1, 1), 0).r;
  p.y += (mix(mix(a, b, f.x), mix(c, d, f.x), f.y) - terrainGrid.w) * terrainSize.z;
  return p;
}
`;

// Lifts a material's vertices onto the hills. Every material gets it (see useHills); one with an
// onBeforeCompile of its own calls it from there.
export function liftShader(sh) {
  if (!U.terrainMap.value) return;
  let vs = sh.vertexShader;
  vs = vs.replace('mvPosition = modelViewMatrix * mvPosition;', 'mvPosition = viewMatrix * terrainLift(modelMatrix * mvPosition);') // project_vertex
    .replace('worldPosition = modelMatrix * worldPosition;', 'worldPosition = terrainLift(modelMatrix * worldPosition);') // worldpos_vertex (the shadows)
    .replace('vec4 mvPosition = modelViewMatrix[ 3 ];', 'vec4 mvPosition = viewMatrix * terrainLift(modelMatrix[ 3 ]);'); // a sprite
  vs = vs.replace('#include <project_vertex>', THREE.ShaderChunk.project_vertex.replace('mvPosition = modelViewMatrix * mvPosition;', 'mvPosition = viewMatrix * terrainLift(modelMatrix * mvPosition);'))
    .replace('#include <worldpos_vertex>', THREE.ShaderChunk.worldpos_vertex.replace('worldPosition = modelMatrix * worldPosition;', 'worldPosition = terrainLift(modelMatrix * worldPosition);'));
  if (!vs.includes('terrainLift(')) return;
  sh.vertexShader = GLSL + vs;
  Object.assign(sh.uniforms, U);
}

// Turns the hills on for every material from now on (the game's page calls it; the dev pages
// stay flat).
export function useHills() {
  if (!grid) return;
  const tex = new THREE.DataTexture(grid.data, grid.w, grid.nz + 1, THREE.RedFormat, THREE.FloatType);
  tex.needsUpdate = true;
  U.terrainMap.value = tex;
  U.terrainGrid.value.set(grid.x0, grid.z0, 1 / grid.cell, 0);
  U.terrainSize.value.set(grid.nx, grid.nz, 1);
  THREE.Material.prototype.onBeforeCompile = liftShader;
}

// The camera looks from (x, z): what lies there is drawn where the game has it, the rest higher or
// lower by how the ground climbs from there.
export function lookFrom(x, z) {
  U.terrainGrid.value.w = heightAt(x, z);
}

// Off (false) for a picture of a single rider, on again after.
export function hillsOn(on) {
  U.terrainSize.value.z = on ? 1 : 0;
}

// ------------------------------------------------------------------ the city's meshes

// Lifting bends a surface only at its corners: a square or a long wall with none in between would
// cut straight through a hill, or float over a dip. So where the ground bends under them the
// city's meshes are cut up, until nowhere is a surface more than BEND off the ground's own shape.
// Flat ground and even slopes are left as they are.
// A mesh can allow more (its userData.bend), like the water down between its quays.
const BEND = 0.02; // metres: about how far apart the ground's layers lie
const SHORT = 4; // metres: an edge shorter than this is never cut (nor a triangle with none longer looked at)
export function fitToHills(group) {
  if (!grid) return;
  grid.bent ??= bentness();
  const done = new Map();
  group.updateMatrixWorld(true);
  group.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.geometry?.attributes.position) return;
    if ([o.material].flat().some(m => m.side === THREE.BackSide)) return; // the sky
    const g = o.geometry;
    if (g.morphAttributes.position || Object.values(g.attributes).some(a => a.isInterleavedBufferAttribute)) return;
    const key = g.uuid + o.matrixWorld.elements.join();
    if (!done.has(key)) done.set(key, cut(g, o.matrixWorld, o.userData.bend ?? BEND));
    o.geometry = done.get(key);
  });
}

// For every cell, how sharply the ground bends round it (metres per metre per metre, the most of
// its corners' second differences): a straight line L long across ground bending b at most is off
// it by no more than about b L² / 8, and by b cell L / 4 where it crosses from one cell to the next.
function bentness() {
  const { nx, nz, w, cell, data } = grid, at = (i, j) => data[Math.max(0, Math.min(nz, j)) * w + Math.max(0, Math.min(nx, i))];
  const node = new Float32Array(w * (nz + 1)), out = new Float32Array(nx * nz);
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const h = at(i, j);
      node[j * w + i] = Math.max(Math.abs(at(i + 1, j) - 2 * h + at(i - 1, j)), Math.abs(at(i, j + 1) - 2 * h + at(i, j - 1)),
        Math.abs(at(i + 1, j + 1) - at(i + 1, j - 1) - at(i - 1, j + 1) + at(i - 1, j - 1)) / 4) / (cell * cell);
    }
  }
  for (let j = 0; j < nz; j++) {
    for (let i = 0; i < nx; i++) out[j * nx + i] = Math.max(node[j * w + i], node[j * w + i + 1], node[(j + 1) * w + i], node[(j + 1) * w + i + 1]);
  }
  return out;
}
// the most the ground bends anywhere in the box (Infinity: too big a box to look over quickly)
function bentIn(x0, z0, x1, z1) {
  const { x0: gx, z0: gz, cell, nx, nz, bent } = grid;
  const i0 = Math.max(0, Math.floor((x0 - gx) / cell)), i1 = Math.min(nx - 1, Math.floor((x1 - gx) / cell));
  const j0 = Math.max(0, Math.floor((z0 - gz) / cell)), j1 = Math.min(nz - 1, Math.floor((z1 - gz) / cell));
  if (i1 < i0 || j1 < j0) return 0; // off the map: flat
  if ((i1 - i0 + 1) * (j1 - j0 + 1) > 64) return Infinity;
  let most = 0;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) most = Math.max(most, bent[j * nx + i]);
  return most;
}

function cut(g, matrix, bend) {
  const pos = g.attributes.position, n0 = pos.count, e = matrix.elements;
  // every corner across the ground (world x and z), and how high the ground is there (looked up
  // when first needed: most meshes lie where the ground hardly bends, and are never cut)
  let wx = new Float64Array(n0), wz = new Float64Array(n0), wh = new Float64Array(n0).fill(NaN);
  const plain = !pos.normalized && pos.itemSize === 3, p = pos.array; // (read straight from it when it can be)
  for (let k = 0; k < n0; k++) {
    const x = plain ? p[k * 3] : pos.getX(k), y = plain ? p[k * 3 + 1] : pos.getY(k), z = plain ? p[k * 3 + 2] : pos.getZ(k);
    wx[k] = e[0] * x + e[4] * y + e[8] * z + e[12];
    wz[k] = e[2] * x + e[6] * y + e[10] * z + e[14];
  }
  const h = k => (wh[k] === wh[k] ? wh[k] : (wh[k] = heightAt(wx[k], wz[k])));
  const len2 = (a, b) => (wx[a] - wx[b]) ** 2 + (wz[a] - wz[b]) ** 2;
  // how far the ground bends away from the straight line a-b, looked at every few metres
  const edgeBend = (a, b) => {
    const n = Math.min(24, Math.ceil(Math.sqrt(len2(a, b)) / 4));
    let most = 0;
    for (let s = 1; s < n; s++) {
      const t = s / n;
      most = Math.max(most, Math.abs(heightAt(wx[a] + (wx[b] - wx[a]) * t, wz[a] + (wz[b] - wz[a]) * t) - (h(a) + (h(b) - h(a)) * t)));
    }
    return most;
  };
  // and from the triangle's plane, inside it
  const IN = [[1 / 3, 1 / 3, 1 / 3], [2 / 3, 1 / 6, 1 / 6], [1 / 6, 2 / 3, 1 / 6], [1 / 6, 1 / 6, 2 / 3]];
  const faceBend = (a, b, c) => {
    let most = 0;
    for (const [u, v, w] of IN) {
      most = Math.max(most, Math.abs(heightAt(u * wx[a] + v * wx[b] + w * wx[c], u * wz[a] + v * wz[b] + w * wz[c]) - (u * h(a) + v * h(b) + w * h(c))));
    }
    return most;
  };
  const ekey = (a, b) => (a < b ? a * 1e7 + b : b * 1e7 + a);
  // (views on the index until the first cut, which makes plain lists of them)
  const index = g.index ? g.index.array : Uint32Array.from({ length: n0 }, (_, k) => k);
  const groups = g.groups.length ? g.groups : [{ start: 0, count: index.length, materialIndex: 0 }];
  let tris = groups.map(gr => index.subarray(gr.start, gr.start + gr.count));
  let fresh = 0; // the corners from here on are new: only triangles with one of them are looked at again
  let attrs = null;
  for (let pass = 0; pass < 16; pass++) {
    // the edges to cut in two: those the ground bends away from, and the longest of a triangle it
    // bends away from inside
    const marked = new Set();
    const X = wx, Z = wz; // (this pass's, held close: this loop sees every triangle of the city)
    for (const list of tris) {
      for (let t = 0; t < list.length; t += 3) {
        const a = list[t], b = list[t + 1], c = list[t + 2];
        if (a < fresh && b < fresh && c < fresh) continue;
        const xa = X[a], xb = X[b], xc = X[c], za = Z[a], zb = Z[b], zc = Z[c];
        const ab = (xa - xb) ** 2 + (za - zb) ** 2, bc = (xb - xc) ** 2 + (zb - zc) ** 2, ca = (xc - xa) ** 2 + (zc - za) ** 2, top = Math.max(ab, bc, ca);
        if (top <= SHORT * SHORT) continue;
        // where the ground hardly bends, a triangle cannot be far off it
        const L = Math.sqrt(top), most = bentIn(Math.min(xa, xb, xc), Math.min(za, zb, zc), Math.max(xa, xb, xc), Math.max(za, zb, zc));
        if (most * Math.max(L * L / 8, grid.cell * L / 4) <= bend) continue;
        if (ab > SHORT * SHORT && edgeBend(a, b) > bend) marked.add(ekey(a, b));
        if (bc > SHORT * SHORT && edgeBend(b, c) > bend) marked.add(ekey(b, c));
        if (ca > SHORT * SHORT && edgeBend(c, a) > bend) marked.add(ekey(c, a));
        if (faceBend(a, b, c) > bend) marked.add(top === ab ? ekey(a, b) : top === bc ? ekey(b, c) : ekey(c, a));
      }
    }
    if (!marked.size) break;
    if (!attrs) [wx, wz, wh] = [Array.from(wx), Array.from(wz), Array.from(wh)]; // to grow
    fresh = wx.length;
    attrs ??= Object.entries(g.attributes).map(([name, a]) => ({ name, a, size: a.itemSize, data: Array.from(a.array) }));
    const mids = new Map();
    const mid = (a, b) => {
      const k = ekey(a, b);
      if (mids.has(k)) return mids.get(k);
      const m = wx.length;
      wx.push((wx[a] + wx[b]) / 2);
      wz.push((wz[a] + wz[b]) / 2);
      wh.push(heightAt(wx[m], wz[m]));
      for (const { name, size, data } of attrs) {
        const v = [];
        for (let s = 0; s < size; s++) v.push((data[a * size + s] + data[b * size + s]) / 2);
        if (name === 'normal') {
          const l = Math.hypot(...v) || 1;
          for (let s = 0; s < size; s++) v[s] /= l;
        }
        data.push(...v);
      }
      mids.set(k, m);
      return m;
    };
    tris = tris.map(list => {
      const out = [];
      for (let t = 0; t < list.length; t += 3) {
        const a = list[t], b = list[t + 1], c = list[t + 2];
        if (Math.max(len2(a, b), len2(b, c), len2(c, a)) <= SHORT * SHORT) { out.push(a, b, c); continue; }
        const ab = marked.has(ekey(a, b)), bc = marked.has(ekey(b, c)), ca = marked.has(ekey(c, a));
        if (ab && bc && ca) {
          const p = mid(a, b), q = mid(b, c), r = mid(c, a);
          out.push(a, p, r, p, b, q, r, q, c, p, q, r);
        } else if (ab && bc) {
          const p = mid(a, b), q = mid(b, c);
          out.push(a, p, c, p, b, q, p, q, c);
        } else if (bc && ca) {
          const q = mid(b, c), r = mid(c, a);
          out.push(a, b, r, b, q, r, r, q, c);
        } else if (ca && ab) {
          const r = mid(c, a), p = mid(a, b);
          out.push(a, p, r, p, b, c, r, p, c);
        } else if (ab) {
          const p = mid(a, b);
          out.push(a, p, c, p, b, c);
        } else if (bc) {
          const q = mid(b, c);
          out.push(a, b, q, a, q, c);
        } else if (ca) {
          const r = mid(c, a);
          out.push(a, b, r, r, b, c);
        } else out.push(a, b, c);
      }
      return out;
    });
  }
  if (!attrs) return g;
  const out = new THREE.BufferGeometry();
  for (const { name, a, size, data } of attrs) out.setAttribute(name, new THREE.BufferAttribute(new a.array.constructor(data), size, a.normalized));
  out.setIndex(tris.flat());
  if (g.groups.length) {
    let start = 0;
    tris.forEach((list, k) => {
      out.addGroup(start, list.length, groups[k].materialIndex);
      start += list.length;
    });
  }
  out.computeBoundingSphere();
  out.computeBoundingBox();
  // still its tile's own (tiles.js: let go of when far), and a geometry of its own (packNormals)
  out.userData = { ...g.userData, fitted: true };
  return out;
}
