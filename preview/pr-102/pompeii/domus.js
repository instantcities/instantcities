// What the houses of houses.js are built from: walls of rubble and brick, broken off at different
// heights as the excavation left them, with doorways in them and their plaster painted (frescos.js);
// floors of mosaic, cement or earth; the columns round a garden, red below and white above; the pool
// under the open roof of an atrium; and a garden's beds and shrubs. Everything open to the sky.
//
// A house is drawn in its plot's frame (plots.js): x along the street its door is on, z into the
// block, in game metres. Riders bump into its walls (foot: a ring round every stretch of wall and
// every column, on the map) and go through its doorways.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wallTexture, pictureTexture, floorTexture, mosaicTexture, PANEL, TILE } from './frescos.js';

const RUBBLE = ['#8f7f68', '#9a8a70', '#857560', '#a08c72'], BRICK = '#9a5a40', MARBLE = '#e8e2d2', RED = '#9b2b1f', STUCCO = '#ece4d0';

export class Domus {
  constructor(plot, seed = 1) {
    this.plot = plot;
    this.kit = new Kit();
    this.foot = [];
    this.quads = new Map(); // texture key -> { tex, pos: [], uv: [] }
    let s = seed * 9973 + 17;
    this.r = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  }

  // a ring on the map round a rectangle in the plot's frame, turned: from a to b, t thick
  ringAlong(a, b, t) {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = (-dz / L) * t / 2, nz = (dx / L) * t / 2;
    this.foot.push([[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]].flatMap(([x, z]) => this.plot.at(x, z)).map(v => Math.round(v * 100) / 100));
  }

  // a quad of texture `key` (made by make()) with corners [x, y, z] and their [u, v]
  quad(key, make, corners, uvs) {
    if (!this.quads.has(key)) this.quads.set(key, { make, pos: [], uv: [] });
    const q = this.quads.get(key);
    for (const k of [0, 1, 2, 0, 2, 3]) { q.pos.push(...corners[k]); q.uv.push(...uvs[k]); }
  }

  // A wall from a to b ([x, z]), h high, t thick. doors: [[u, w]], a doorway w wide with its middle
  // u metres from a. paint: { l, r }: the style painted on the face to the left (going from a to b)
  // and to the right, up to ph; pics: [{ side: 'l' | 'r', u0, u1, y0, y1, name }]: a picture over a
  // stretch of it. Each stretch between the doorways is broken off at its own height.
  wall(a, b, { h = 4, t = 0.5, doors = [], paint = {}, ph = 3, pics = [] } = {}) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 0.05) return;
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux, yaw = Math.atan2(-uz, ux);
    const at = u => [a[0] + ux * u, a[1] + uz * u];
    const stretches = [];
    let from = 0;
    for (const [u, w] of [...doors].sort((m, n) => m[0] - n[0])) {
      if (u - w / 2 > from + 0.05) stretches.push([from, u - w / 2]);
      from = Math.max(from, u + w / 2);
    }
    if (L > from + 0.05) stretches.push([from, L]);
    for (const [u0, u1] of stretches) {
      const len = u1 - u0, [cx, cz] = at((u0 + u1) / 2), sh = h * (0.72 + this.r() * 0.28);
      this.kit.box(len, sh, t, RUBBLE[Math.floor(this.r() * RUBBLE.length)], cx, sh / 2, cz, 0, yaw, 0);
      // a step broken off along the top, and the brick quoins at the ends of it
      if (len > 2.5) {
        const sl = len * (0.2 + this.r() * 0.4), off = (this.r() - 0.5) * (len - sl), [sx, sz] = at((u0 + u1) / 2 + off);
        this.kit.box(sl, 0.5 + this.r() * 0.8, t * 0.96, RUBBLE[Math.floor(this.r() * RUBBLE.length)], sx, sh + 0.3, sz, 0, yaw, 0);
      }
      for (const e of [u0 + 0.3, u1 - 0.3]) { const [ex, ez] = at(e); this.kit.box(0.6, sh, t + 0.02, BRICK, ex, sh / 2, ez, 0, yaw, 0); }
      this.ringAlong(at(u0), at(u1), t);
      // the painted plaster on either face, up to ph (and not above the wall)
      const top = Math.min(ph, sh - 0.15);
      for (const [side, s] of [['l', 1], ['r', -1]]) {
        const style = paint[side];
        if (!style) continue;
        const o = (t / 2 + 0.015) * s, [x0, z0] = at(u0 + 0.6), [x1, z1] = at(u1 - 0.6);
        const p0 = [x0 + nx * o, z0 + nz * o], p1 = [x1 + nx * o, z1 + nz * o];
        const v1 = top / ph, ua = (u0 + 0.6) / PANEL, ub = (u1 - 0.6) / PANEL;
        // wound to face out of the wall on its side
        const c = [[p0[0], 0.02, p0[1]], [p1[0], 0.02, p1[1]], [p1[0], top, p1[1]], [p0[0], top, p0[1]]];
        const uv = [[ua, 0], [ub, 0], [ub, v1], [ua, v1]];
        if (s < 0) { c.reverse(); uv.reverse(); }
        this.quad('wall-' + style, () => wallTexture(style), c, uv);
      }
    }
    for (const pic of pics) {
      const s = pic.side === 'l' ? 1 : -1, o = (t / 2 + 0.03) * s, [x0, z0] = at(pic.u0), [x1, z1] = at(pic.u1);
      const c = [[x0 + nx * o, pic.y0, z0 + nz * o], [x1 + nx * o, pic.y0, z1 + nz * o], [x1 + nx * o, pic.y1, z1 + nz * o], [x0 + nx * o, pic.y1, z0 + nz * o]];
      // read from its side: from that side the wall runs from a to b leftwards, so the other way round
      const uv = s > 0 ? [[0, 0], [1, 0], [1, 1], [0, 1]] : [[1, 0], [0, 0], [0, 1], [1, 1]];
      if (s < 0) { c.reverse(); uv.reverse(); }
      this.quad('pic-' + pic.name, () => pictureTexture(pic.name), c, uv);
    }
  }

  // A room: four walls round x0..x1 × z0..z1 (their middles on that line), doorways in each side
  // (doors.s/n/w/e: [[u, w]], u from the west or south end), painted inside in `paint`, with a floor.
  room(x0, z0, x1, z1, { h = 4, t = 0.5, doors = {}, paint, floor, ph, pics = {} } = {}) {
    const sides = { s: [[x0, z0], [x1, z0], 'l'], e: [[x1, z0], [x1, z1], 'l'], n: [[x0, z1], [x1, z1], 'r'], w: [[x0, z0], [x0, z1], 'r'] };
    for (const [k, [a, b, inner]] of Object.entries(sides)) {
      this.wall(a, b, { h, t, doors: doors[k] ?? [], paint: paint ? { [inner]: paint } : {}, ph, pics: (pics[k] ?? []).map(p => ({ ...p, side: inner })) });
    }
    if (floor) this.floor(x0 + t / 2, z0 + t / 2, x1 - t / 2, z1 - t / 2, floor);
  }

  // a floor of a pattern (frescos.js FLOORS), tiled
  floor(x0, z0, x1, z1, kind, y = 0.04) {
    this.quad('floor-' + kind + y, () => floorTexture(kind), [[x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]],
      [[x0 / TILE, z0 / TILE], [x0 / TILE, z1 / TILE], [x1 / TILE, z1 / TILE], [x1 / TILE, z0 / TILE]].map(([u, v]) => [u, -v]));
  }

  // a mosaic picture over a rectangle, read coming in from the street (its top towards z1: walking
  // in, +x is on the left)
  mosaic(x0, z0, x1, z1, name, y = 0.06) {
    this.quad('mosaic-' + name, () => mosaicTexture(name), [[x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]], [[1, 0], [1, 1], [0, 1], [0, 0]]);
  }

  // a column: plain and red below, white and fluted above, under its capital; or broken off
  column(x, z, h = 4.2, r = 0.3, broken = false) {
    const k = this.kit, top = broken ? h * (0.4 + this.r() * 0.4) : h;
    k.box(r * 2.6, 0.25, r * 2.6, MARBLE, x, 0.12, z);
    const red = Math.min(top, h * 0.33);
    k.add(new THREE.CylinderGeometry(r, r * 1.04, red, 14), RED, x, 0.25 + red / 2, z);
    if (top > red) k.add(new THREE.CylinderGeometry(r * 0.88, r, top - red - 0.25, 14), STUCCO, x, 0.25 + red + (top - red - 0.25) / 2, z);
    if (!broken) k.box(r * 2.8, 0.35, r * 2.8, STUCCO, x, h + 0.1, z);
    this.ringAlong([x - r, z], [x + r, z], r * 2);
  }

  // columns round a rectangle, `step` apart (a peristyle round its garden)
  colonnade(x0, z0, x1, z1, step = 3, h = 4.2, broken = 0.25) {
    const nx = Math.max(1, Math.round((x1 - x0) / step)), nz = Math.max(1, Math.round((z1 - z0) / step));
    for (let i = 0; i <= nx; i++) for (const z of [z0, z1]) this.column(x0 + ((x1 - x0) * i) / nx, z, h, 0.3, this.r() < broken);
    for (let j = 1; j < nz; j++) for (const x of [x0, x1]) this.column(x, z0 + ((z1 - z0) * j) / nz, h, 0.3, this.r() < broken);
  }

  // the pool under an atrium's open roof: a rim of white marble and the rainwater in it
  pool(x0, z0, x1, z1) {
    const k = this.kit, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
    k.box(w, 0.25, 0.35, MARBLE, cx, 0.12, z0); k.box(w, 0.25, 0.35, MARBLE, cx, 0.12, z1);
    k.box(0.35, 0.25, d, MARBLE, x0, 0.12, cz); k.box(0.35, 0.25, d, MARBLE, x1, 0.12, cz);
    k.box(w - 0.3, 0.05, d - 0.3, '#6f98a4', cx, 0.1, cz);
  }

  // a garden: earth, a few shrubs and small trees, a box hedge round its beds
  garden(x0, z0, x1, z1, { trees = 2, shrubs = 10 } = {}) {
    this.floor(x0, z0, x1, z1, 'soil', 0.03);
    const k = this.kit, rx = () => x0 + 1 + this.r() * (x1 - x0 - 2), rz = () => z0 + 1 + this.r() * (z1 - z0 - 2);
    for (let i = 0; i < shrubs; i++) { const s = 0.4 + this.r() * 0.5; k.add(new THREE.IcosahedronGeometry(s, 0), ['#4f6e3a', '#5e7f45', '#3f5e33'][i % 3], rx(), s * 0.8, rz()); }
    for (let i = 0; i < trees; i++) {
      const x = rx(), z = rz(), h = 3 + this.r() * 2;
      k.rod([x, 0, z], [x, h, z], 0.15, '#5a4030');
      k.add(new THREE.IcosahedronGeometry(1.4 + this.r(), 0), '#4f6e3a', x, h + 0.6, z);
    }
    for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      k.box(L, 0.35, 0.3, '#3f5e33', (a[0] + b[0]) / 2, 0.17, (a[1] + b[1]) / 2, 0, Math.atan2(-(b[1] - a[1]), b[0] - a[0]), 0);
    }
  }

  // a solid block to bump into (a counter, a bed, a millstone's base), drawn with the kit
  solid(x, z, w, d, h, colour, yaw = 0) {
    this.kit.box(w, h, d, colour, x, h / 2, z, 0, yaw, 0);
    const c = Math.cos(yaw), s = Math.sin(yaw), ax = (w / 2) * c, az = (-w / 2) * s;
    this.ringAlong([x - ax, z - az], [x + ax, z + az], d);
  }

  build() {
    const group = new THREE.Group();
    group.add(this.kit.mesh(kitMat(0.92)));
    for (const { make, pos, uv } of this.quads.values()) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: make(), roughness: 0.9 }));
      m.receiveShadow = true;
      group.add(m);
    }
    return group;
  }
}
