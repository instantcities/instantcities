// What the houses of houses.js are built from: walls of rubble and brick, broken off at different
// heights as the excavation left them, with doorways in them and their plaster painted (frescos.js);
// floors of mosaic, cement or earth; the columns round a garden, red below and white above; the pool
// under the open roof of an atrium; and a garden's beds and shrubs. Open to the sky, but for the
// houses that have been rebuilt.
//
// A house is drawn in its plot's frame (plots.js): x along the street its door is on, z into the
// block, in game metres. Riders bump into its walls (foot: a ring round every stretch of wall and
// every column, on the map) and go through its doorways.
//
// Inside, what was found there or is known from others like it: a white sill in every doorway, the
// marble table and the well-head by the pool, the shrine of the household gods, couches round a
// dining room, bronze lamp stands and braziers, statues and fountains in the gardens, amphorae
// against the walls. A house that has been rebuilt (whole) keeps its walls to their full height,
// under tiled roofs over its atrium and its colonnades; seen from below a roof is a ceiling of planks
// on rafters, from above its tiles, so the camera behind you (4.1 metres up) never looks into one:
// keep them higher than that. A famous picture or mosaic (art: an id in _data/art.json) is its
// photo, and standing before it shows the photo full screen (this.art: [{ id, spot }], for
// city.js ART_SPOTS, game/artview.js).
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { wallTexture, pictureTexture, floorTexture, mosaicTexture, artTexture, rubbleTexture, PICTURE_DRAW, MOSAIC_DRAW, PANEL, TILE, RUBBLE_M } from './frescos.js';

const BRONZE = '#5a5236', TERRACOTTA = '#b0643a', WOOD = '#6b4526';
const RUBBLE = ['#8f7f68', '#9a8a70', '#857560', '#a08c72'], BRICK = '#9a5a40', MARBLE = '#e8e2d2', RED = '#9b2b1f', STUCCO = '#ece4d0';

export class Domus {
  constructor(plot, seed = 1, { whole = false } = {}) {
    this.plot = plot;
    this.whole = whole;
    this.kit = new Kit();
    this.foot = [];
    this.art = [];
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
      const len = u1 - u0, [cx, cz] = at((u0 + u1) / 2), sh = this.whole ? h : h * (0.72 + this.r() * 0.28);
      this.kit.box(len, sh, t, RUBBLE[Math.floor(this.r() * RUBBLE.length)], cx, sh / 2, cz, 0, yaw, 0);
      // a step broken off along the top, and the brick quoins at the ends of it
      if (len > 2.5 && !this.whole) {
        const sl = len * (0.2 + this.r() * 0.4), off = (this.r() - 0.5) * (len - sl), [sx, sz] = at((u0 + u1) / 2 + off);
        this.kit.box(sl, 0.5 + this.r() * 0.8, t * 0.96, RUBBLE[Math.floor(this.r() * RUBBLE.length)], sx, sh + 0.3, sz, 0, yaw, 0);
      }
      for (const e of [u0 + 0.3, u1 - 0.3]) { const [ex, ez] = at(e); this.kit.box(0.6, sh, t + 0.02, BRICK, ex, sh / 2, ez, 0, yaw, 0); }
      this.ringAlong(at(u0), at(u1), t);
      // the painted plaster on either face, up to ph (and not above the wall)
      const top = Math.min(ph, sh - 0.15);
      for (const [side, s] of [['l', 1], ['r', -1]]) {
        const style = paint[side];
        // the bare masonry: all of a face without plaster, or what is above the plaster
        const from = style ? top : 0;
        if (sh - from > 0.1) {
          const o = (t / 2 + 0.008) * s, [x0, z0] = at(u0), [x1, z1] = at(u1);
          const c = [[x0 + nx * o, from, z0 + nz * o], [x1 + nx * o, from, z1 + nz * o], [x1 + nx * o, sh, z1 + nz * o], [x0 + nx * o, sh, z0 + nz * o]];
          const uv = [[u0 / RUBBLE_M, from / RUBBLE_M], [u1 / RUBBLE_M, from / RUBBLE_M], [u1 / RUBBLE_M, sh / RUBBLE_M], [u0 / RUBBLE_M, sh / RUBBLE_M]];
          if (s < 0) { c.reverse(); uv.reverse(); }
          this.quad('rubble', rubbleTexture, c, uv);
        }
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
    // a sill of white stone in each doorway
    for (const [u, w] of doors) {
      const [dx, dz] = at(u);
      this.kit.box(w, 0.07, t + 0.12, '#d8d0bc', dx, 0.035, dz, 0, yaw, 0);
    }
    for (const pic of pics) {
      const s = pic.side === 'l' ? 1 : -1, o = (t / 2 + 0.03) * s, [x0, z0] = at(pic.u0), [x1, z1] = at(pic.u1);
      const c = [[x0 + nx * o, pic.y0, z0 + nz * o], [x1 + nx * o, pic.y0, z1 + nz * o], [x1 + nx * o, pic.y1, z1 + nz * o], [x0 + nx * o, pic.y1, z0 + nz * o]];
      // read from its side: from that side the wall runs from a to b leftwards, so the other way round
      const uv = s > 0 ? [[0, 0], [1, 0], [1, 1], [0, 1]] : [[1, 0], [0, 0], [0, 1], [1, 1]];
      if (s < 0) { c.reverse(); uv.reverse(); }
      if (pic.art) {
        // the real one, in a frame of dark red; and where you stand to look at it, before it
        const pw = Math.abs(pic.u1 - pic.u0), ph = pic.y1 - pic.y0, [mx, mz] = at((pic.u0 + pic.u1) / 2);
        this.quad('art-' + pic.art, () => artTexture(pic.art, pw / ph, pic.name && PICTURE_DRAW(pic.name)), c, uv);
        // (its face between the plaster's, t / 2 + 0.015 out, and the photo's, + 0.03)
        this.kit.box(pw + 0.16, ph + 0.16, 0.03, '#5a1a12', mx + nx * (t / 2 + 0.007) * s, (pic.y0 + pic.y1) / 2, mz + nz * (t / 2 + 0.007) * s, 0, yaw, 0);
        const back = Math.max(2.2, Math.min(4.5, Math.max(pw, ph) * 1.2));
        this.see(pic.art, [mx + nx * s * back, mz + nz * s * back], [mx, mz]);
      } else this.quad('pic-' + pic.name, () => pictureTexture(pic.name), c, uv);
    }
  }

  // a famous piece seen from [x, z] (the plot's frame), at [tx, tz]: for the full-screen photo
  see(id, from, to) {
    this.art.push({ id, spot: [...this.plot.at(...from), ...this.plot.at(...to)] });
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
  // art: the id of its photo in _data/art.json, over the drawing until it loads
  mosaic(x0, z0, x1, z1, name, y = 0.06, art = null) {
    const make = art ? () => artTexture(art, (x1 - x0) / (z1 - z0), MOSAIC_DRAW(name)) : () => mosaicTexture(name);
    this.quad(art ? 'art-' + art : 'mosaic-' + name, make, [[x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]], [[1, 0], [1, 1], [0, 1], [0, 0]]);
    // seen from just before its lower edge, as you come in
    if (art) this.see(art, [(x0 + x1) / 2, z0 - 1.6], [(x0 + x1) / 2, (z0 + z1) / 2]);
  }

  // a column: plain and red below, white and fluted above, under its capital; or broken off
  column(x, z, h = 4.2, r = 0.3, broken = false) {
    const k = this.kit, top = broken ? h * (0.4 + this.r() * 0.4) : h;
    k.box(r * 2.6, 0.25, r * 2.6, MARBLE, x, 0.12, z);
    const red = Math.min(top, h * 0.33);
    k.add(new THREE.CylinderGeometry(r, r * 1.04, red, 28), RED, x, 0.25 + red / 2, z);
    if (top > red) k.add(new THREE.CylinderGeometry(r * 0.88, r, top - red - 0.25, 28), STUCCO, x, 0.25 + red + (top - red - 0.25) / 2, z);
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
    this.floor(x0, z0, x1, z1, 'soil', 0.05); // over the floor of the walks round it
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

  // ---------------------------------------------------------------- roofs

  // a roof sloping from lo along a..b (the columns' line, [x, z]) up to hi `depth` metres to its
  // left (towards the wall): tiles on top, a ceiling of planks under it, rafters between
  roofStrip(a, b, depth, lo, hi) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
    const c = [[a[0], lo, a[1]], [b[0], lo, b[1]], [b[0] + nx * depth, hi, b[1] + nz * depth], [a[0] + nx * depth, hi, a[1] + nz * depth]];
    this.roofQuad(c, L, Math.hypot(depth, hi - lo));
    // the beam over the columns, the rafters up to the wall, the antefixes along the eaves
    const yaw = Math.atan2(-uz, ux);
    this.kit.box(L, 0.3, 0.3, WOOD, (a[0] + b[0]) / 2, lo - 0.2, (a[1] + b[1]) / 2, 0, yaw, 0);
    for (let u = 0.4; u < L; u += 1.1) this.kit.rod([a[0] + ux * u, lo - 0.12, a[1] + uz * u], [a[0] + ux * u + nx * depth, hi - 0.12, a[1] + uz * u + nz * depth], 0.08, WOOD, 4);
    for (let u = 0.5; u < L; u += 0.9) this.kit.box(0.18, 0.22, 0.05, TERRACOTTA, a[0] + ux * u - nx * 0.05, lo + 0.08, a[1] + uz * u - nz * 0.05, 0, yaw, 0);
  }

  // corners c (four [x, y, z] round it): tiles seen from above, planks from below
  roofQuad(c, w, d) {
    let uv = [[0, 0], [w / TILE, 0], [w / TILE, d / TILE], [0, d / TILE]];
    // wound to face up: (c1 - c0) × (c2 - c0) pointing up
    const ax = c[1][0] - c[0][0], az = c[1][2] - c[0][2], bx = c[2][0] - c[0][0], bz = c[2][2] - c[0][2];
    if (az * bx - ax * bz < 0) { c = [...c].reverse(); uv = [...uv].reverse(); }
    this.quad('roof-tiles', () => floorTexture('tiles'), c, uv);
    this.quad('roof-planks', () => floorTexture('planks'), c.map(([x, y, z]) => [x, y - 0.06, z]).reverse(), [...uv].reverse());
  }

  // the roof of an atrium, sloping in from its walls (x0..x1 × z0..z1, at hi) to the opening over
  // its pool (px0..px1 × pz0..pz1, at lo), where the rain ran in
  atriumRoof(x0, z0, x1, z1, px0, pz0, px1, pz1, hi, lo) {
    const sides = [
      [[px1, lo, pz0], [px0, lo, pz0], [x0, hi, z0], [x1, hi, z0]],
      [[px1, lo, pz1], [px1, lo, pz0], [x1, hi, z0], [x1, hi, z1]],
      [[px0, lo, pz1], [px1, lo, pz1], [x1, hi, z1], [x0, hi, z1]],
      [[px0, lo, pz0], [px0, lo, pz1], [x0, hi, z1], [x0, hi, z0]],
    ];
    for (const c of sides) this.roofQuad(c, Math.hypot(c[3][0] - c[2][0], c[3][2] - c[2][2]), Math.hypot(Math.max(x1 - px1, z1 - pz1), hi - lo));
    // the beams round the opening, and the spouts at its corners
    const k = this.kit, mx = (px0 + px1) / 2, mz = (pz0 + pz1) / 2;
    k.box(px1 - px0 + 0.3, 0.3, 0.3, WOOD, mx, lo - 0.18, pz0); k.box(px1 - px0 + 0.3, 0.3, 0.3, WOOD, mx, lo - 0.18, pz1);
    k.box(0.3, 0.3, pz1 - pz0, WOOD, px0, lo - 0.18, mz); k.box(0.3, 0.3, pz1 - pz0, WOOD, px1, lo - 0.18, mz);
    for (const [x, z] of [[px0, pz0], [px1, pz0], [px0, pz1], [px1, pz1]]) k.box(0.22, 0.22, 0.45, TERRACOTTA, x + Math.sign(mx - x) * 0.25, lo - 0.02, z + Math.sign(mz - z) * 0.25, 0, Math.atan2(mx - x, mz - z), 0);
  }

  // ---------------------------------------------------------------- what stood in the rooms

  // the marble table (cartibulum) at the far side of an atrium's pool, on two carved legs
  table(x, z, yaw = 0) {
    const k = this.kit, c = Math.cos(yaw), s = Math.sin(yaw);
    k.box(1.6, 0.12, 0.7, '#ece6d6', x, 0.92, z, 0, yaw, 0);
    for (const e of [-0.6, 0.6]) {
      k.box(0.18, 0.86, 0.55, '#ddd5c2', x + c * e, 0.43, z - s * e, 0, yaw, 0);
      k.box(0.24, 0.16, 0.62, '#ece6d6', x + c * e, 0.08, z - s * e, 0, yaw, 0); // a lion's paw
    }
    this.ringAlong([x - c * 0.8, z + s * 0.8], [x + c * 0.8, z - s * 0.8], 0.7);
  }

  // the round well-head (puteal) over the cistern
  puteal(x, z) {
    this.kit.add(new THREE.CylinderGeometry(0.42, 0.45, 0.8, 14), '#e2dccb', x, 0.4, z);
    this.kit.add(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 12), '#1f1b17', x, 0.81, z);
    this.ringAlong([x - 0.45, z], [x + 0.45, z], 0.9);
  }

  // the shrine of the household gods (lararium): a little temple against a wall, facing `yaw`
  // (0: +z), on a podium: two columns before a red niche, a pediment, the snakes painted below,
  // the little altar before it with an offering on it
  lararium(x, z, yaw = 0) {
    const k = this.kit, fx = Math.sin(yaw), fz = Math.cos(yaw), lx = Math.cos(yaw), lz = -Math.sin(yaw);
    const at = (u, v) => [x + lx * u + fx * v, z + lz * u + fz * v];
    k.box(1.5, 1.2, 0.8, '#d8cbb0', x, 0.6, z, 0, yaw, 0);
    const [nx, nz] = at(0, -0.3); k.box(1.3, 1.1, 0.12, '#9b2b1f', nx, 1.75, nz, 0, yaw, 0);
    for (const u of [-0.52, 0.52]) { const [cx, cz] = at(u, 0.25); k.add(new THREE.CylinderGeometry(0.07, 0.08, 1.05, 8), '#ece6d6', cx, 1.72, cz); }
    const [px, pz] = at(0, 0.05);
    k.box(1.5, 0.14, 0.75, '#ece6d6', px, 2.3, pz, 0, yaw, 0);
    k.frustum(1.5, 0.75, 0.05, 0.75, 0.38, '#ece6d6', px, 2.37, pz, yaw); // the pediment
    const [sx, sz] = at(0, 0.41); k.box(1.0, 0.25, 0.02, '#6a8a3a', sx, 0.7, sz, 0, yaw, 0);
    const [ax, az] = at(0, 0.9);
    k.box(0.45, 0.6, 0.45, '#cbbd9e', ax, 0.3, az, 0, yaw, 0);
    k.add(new THREE.SphereGeometry(0.09, 8, 6), '#c9a24a', ax, 0.66, az);
    this.ringAlong(at(-0.8, 0.3), at(0.8, 0.3), 1.4);
  }

  // the masonry couches of a dining room round three sides of x0..x1 × z0..z1, open on the side
  // `open` ('s', 'n', 'e', 'w'), their mattresses and cushions, and the round table in the middle
  triclinium(x0, z0, x1, z1, open = 's') {
    const k = this.kit, w = 1.3, h = 0.65, cols = ['#9b2b1f', '#d49a2e', '#3a5a8a'];
    const benches = { s: [x0, z0, x1, z0 + w], n: [x0, z1 - w, x1, z1], w: [x0, z0, x0 + w, z1], e: [x1 - w, z0, x1, z1] };
    let n = 0;
    for (const [side, [a0, b0, a1, b1]] of Object.entries(benches)) {
      if (side === open) continue;
      const cx = (a0 + a1) / 2, cz = (b0 + b1) / 2, bw = a1 - a0, bd = b1 - b0, along = bw > bd, len = Math.max(bw, bd);
      this.solid(cx, cz, bw, bd, h, '#cbbd9e');
      k.box(bw - 0.1, 0.16, bd - 0.1, ['#e6dcc6', '#d8cbb0'][n % 2], cx, h + 0.08, cz);
      for (let u = 0.6; u < len - 0.3; u += 1.2) k.box(along ? 0.5 : 0.4, 0.22, along ? 0.4 : 0.5, cols[(n + Math.round(u)) % 3], along ? a0 + u : cx, h + 0.27, along ? cz : b0 + u);
      n++;
    }
    k.add(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 16), '#ece6d6', (x0 + x1) / 2, 0.7, (z0 + z1) / 2);
    k.add(new THREE.CylinderGeometry(0.06, 0.12, 0.68, 8), '#ece6d6', (x0 + x1) / 2, 0.34, (z0 + z1) / 2);
  }

  // a bronze lamp stand: three feet, a thin shaft, a dish at the top with an oil lamp on it
  candelabrum(x, z, h = 1.4) {
    const k = this.kit;
    for (let a = 0; a < 3; a++) { const t = (a / 3) * Math.PI * 2; k.rod([x, 0.12, z], [x + Math.cos(t) * 0.18, 0.02, z + Math.sin(t) * 0.18], 0.025, BRONZE, 4); }
    k.rod([x, 0.1, z], [x, h, z], 0.025, BRONZE, 6);
    k.add(new THREE.CylinderGeometry(0.13, 0.08, 0.04, 10), BRONZE, x, h, z);
    k.box(0.14, 0.05, 0.07, '#8a6a3a', x, h + 0.04, z);
  }

  // a bronze brazier on four legs, its pan of charcoal
  brazier(x, z) {
    const k = this.kit;
    k.box(0.9, 0.12, 0.6, BRONZE, x, 0.5, z);
    k.box(0.8, 0.04, 0.5, '#2a2420', x, 0.57, z);
    for (const [dx, dz] of [[-0.38, -0.24], [0.38, -0.24], [-0.38, 0.24], [0.38, 0.24]]) k.rod([x + dx, 0, z + dz], [x + dx * 0.9, 0.48, z + dz * 0.9], 0.03, BRONZE, 4);
  }

  // a statue of white marble on its pedestal, h tall: a draped figure, or a herm (a head on a pillar)
  statue(x, z, h = 1.3, { herm = false } = {}) {
    const k = this.kit;
    k.box(0.5, 0.9, 0.5, '#d8cbb0', x, 0.45, z);
    if (herm) {
      k.box(0.24, h * 0.75, 0.2, '#ece6d6', x, 0.9 + h * 0.375, z);
      k.add(new THREE.SphereGeometry(0.14, 10, 8), '#ece6d6', x, 0.9 + h * 0.85, z);
    } else {
      k.add(new THREE.CylinderGeometry(0.13, 0.22, h * 0.72, 10), '#ece6d6', x, 0.9 + h * 0.36, z);
      k.add(new THREE.CylinderGeometry(0.12, 0.13, h * 0.16, 10), '#ece6d6', x, 0.9 + h * 0.8, z);
      k.add(new THREE.SphereGeometry(0.11, 10, 8), '#ece6d6', x, 0.9 + h * 0.95, z);
      k.rod([x + 0.12, 0.9 + h * 0.8, z], [x + 0.2, 0.9 + h * 0.55, z + 0.08], 0.04, '#ece6d6', 5);
    }
    this.ringAlong([x - 0.25, z], [x + 0.25, z], 0.5);
  }

  // a round marble basin with a jet in the middle, in a garden
  fountain(x, z, r = 0.8) {
    const k = this.kit;
    k.add(new THREE.CylinderGeometry(r, r * 1.05, 0.45, 18), '#ece6d6', x, 0.22, z);
    k.add(new THREE.CylinderGeometry(r * 0.88, r * 0.88, 0.02, 18), '#6f98a4', x, 0.43, z);
    k.add(new THREE.CylinderGeometry(0.07, 0.1, 0.9, 8), '#ece6d6', x, 0.45, z);
    k.add(new THREE.ConeGeometry(0.05, 0.35, 6), '#cfe2e8', x, 1.05, z);
    this.ringAlong([x - r, z], [x + r, z], r * 2);
  }

  // amphorae leaning on a wall, n of them in a row from [x, z] along x (dz: +1 or -1, the way they
  // lean, towards the wall) or along z (along: 'z', dx the way they lean)
  amphorae(x, z, n = 4, { along = 'x', lean = 1 } = {}) {
    const pts = [[0.02, 0], [0.09, 0.08], [0.2, 0.3], [0.22, 0.55], [0.15, 0.78], [0.07, 0.86], [0.06, 1.02], [0.08, 1.05]].map(([r, y]) => new THREE.Vector2(r, y));
    for (let i = 0; i < n; i++) {
      const ax = along === 'x' ? x + i * 0.48 : x, az = along === 'x' ? z : z + i * 0.48;
      const rx = along === 'x' ? lean * 0.14 : 0, rz = along === 'x' ? 0 : -lean * 0.14;
      this.kit.add(new THREE.LatheGeometry(pts, 10), [TERRACOTTA, '#a85a32', '#c0744a'][i % 3], ax, 0.02, az, rx, 0, rz);
    }
  }

  // a big storage jar (dolium), standing
  dolium(x, z, h = 1.1) {
    this.kit.add(new THREE.SphereGeometry(h / 2, 12, 10), '#a85a32', x, h / 2, z);
    this.kit.add(new THREE.CylinderGeometry(0.22, 0.24, 0.12, 12), '#8a4a2e', x, h, z);
    this.ringAlong([x - h / 2, z], [x + h / 2, z], h);
  }

  // the two leaves of the wooden street door, open inward, in a doorway [x, w] of the south wall:
  // planks with three cross-bars and bronze studs
  doorLeaves(x, w, h = 3.4) {
    const k = this.kit, lw = w / 2 - 0.05;
    for (const s of [-1, 1]) {
      const hx = x + s * (w / 2 - 0.1);
      k.box(0.08, h, lw, WOOD, hx, h / 2, 0.35 + lw / 2);
      for (const y of [0.5, h / 2, h - 0.5]) k.box(0.12, 0.1, lw, '#3a2a1a', hx - s * 0.02, y, 0.35 + lw / 2);
      for (let z = 0.15; z < lw; z += 0.35) for (const y of [h * 0.35, h * 0.65]) k.box(0.05, 0.05, 0.05, BRONZE, hx - s * 0.06, y, 0.35 + z);
    }
  }

  build() {
    const group = new THREE.Group();
    group.add(this.kit.mesh(kitMat(0.92)));
    for (const [key, { make, pos, uv }] of this.quads) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: make(), roughness: 0.9 }));
      m.receiveShadow = true;
      m.castShadow = key.startsWith('roof-'); // a roof shades the walk under it
      group.add(m);
    }
    return group;
  }
}
