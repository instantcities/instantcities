// The minimap in the corner: the track or the city drawn once, and the riders as dots every frame.

import { PLAYER_COLORS } from '../horses.js';
import { hex, $ } from './base.js';
import { roaming, quest, world, track } from './worlds.js';
import { humans, field, thrown, traps, clouds } from './racers.js';
import { openBigMap } from './bigmap.js';
import { onMap } from './indoors.js';

// Minimap: track drawn once to an offscreen canvas, dots drawn every frame.
export const mm = $('minimap');
const mmCtx = mm.getContext('2d');
let MM_W = 220, MM_H = 116;
let mmBase, mmMap, mmDpr;

export function outline(g, t, map, width, color) {
  g.beginPath();
  t.points.forEach((p, i) => { const [x, y] = map(p.x, p.z); i ? g.lineTo(x, y) : g.moveTo(x, y); });
  if (!t.open) g.closePath();
  g.lineJoin = 'round';
  g.lineWidth = width;
  g.strokeStyle = color;
  g.stroke();
}

export function fitMap(t, w, h, pad) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of t.points) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
  }
  const s = Math.min(w / (maxX - minX + pad * 2), h / (maxZ - minZ + pad * 2));
  const ox = w / 2 - ((minX + maxX) / 2) * s, oz = h / 2 - ((minZ + maxZ) / 2) * s;
  return { s, map: (x, z) => [ox + x * s, oz + z * s], unmap: (px, py) => [(px - ox) / s, (py - oz) / s] };
}

export function setupMinimap() {
  const small = innerWidth < 760 || innerHeight < 560;
  // on a phone no wider than a third of the screen: the HUD's column, the cards beside it
  const w = Math.round(Math.min(150, innerWidth / 3 - 14));
  [MM_W, MM_H] = small ? [w, Math.round(w * 79 / 150)] : [220, 116];
  document.documentElement.style.setProperty('--mm-w', `${MM_W}px`);
  document.documentElement.style.setProperty('--mm-h', `${MM_H}px`);
  mmDpr = Math.min(devicePixelRatio, 2);
  mm.width = MM_W * mmDpr;
  mm.height = MM_H * mmDpr;
  mm.style.width = MM_W + 'px';
  mm.style.height = MM_H + 'px';
  if (roaming()) return setupRoamMap();
  mmRoam = null;
  mmBase = document.createElement('canvas');
  mmBase.width = mm.width;
  mmBase.height = mm.height;
  const g = mmBase.getContext('2d');
  g.scale(mmDpr, mmDpr);
  mmMap = paintTrack(g, MM_W, MM_H).map;
}

// The race track with the streets round it, fitted into w x h. Of the streets only those in view
// ([x0, z0, x1, z1] in metres; all of them when left out).
export function paintTrack(g, w, h, view = null) {
  const fit = fitMap(track, w, h, track.hw + 8), { s, map } = fit;
  if (world.cfg.map) {
    g.strokeStyle = '#9a9ca0';
    g.lineCap = g.lineJoin = 'round';
    const bb = boxesOf(world.cfg.map.roads);
    for (const [i, rd] of world.cfg.map.roads.entries()) {
      if (rd.foot) continue;
      if (view && (bb[i * 4] > view[2] || bb[i * 4 + 2] < view[0] || bb[i * 4 + 1] > view[3] || bb[i * 4 + 3] < view[1])) continue;
      g.lineWidth = Math.max(1, rd.w * s);
      g.beginPath();
      for (let k = 0; k < rd.p.length; k += 2) {
        const [x, y] = map(rd.p[k], rd.p[k + 1]);
        k ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
  }
  outline(g, track, map, track.hw * 2 * s + 4, '#fffaf0');
  outline(g, track, map, track.hw * 2 * s, world.cfg.theme.dirt);
  const tick = (idx, lo, hi, color, width) => {
    const a = track.at(idx, lo), b = track.at(idx, hi);
    const [ax, ay] = map(a.x, a.z), [bx, by] = map(b.x, b.z);
    g.lineWidth = width;
    g.strokeStyle = color;
    g.beginPath();
    g.moveTo(ax, ay);
    g.lineTo(bx, by);
    g.stroke();
  };
  tick(0, -track.hw, track.hw, '#fff', 3);
  for (const ob of world.obstacles) tick(ob.idx, ob.latMin, ob.latMax, ob.full ? '#2f6b22' : '#5b3a24', 2.5);
  return fit;
}

// Free roam: the whole map drawn once, of which the minimap shows the part round the riders.
const ROAM_SCALE = 0.4; // minimap pixels per metre
// at most this many pixels in the whole map's canvas: Ghent at 0.4 px/m on a sharp screen is some 24
// million, which a phone counts against the page (and Safari draws nothing past 16.7 million)
const ROAM_PIXELS = 6e6;
export let mmRoam = null;
function setupRoamMap() {
  const map = world.cfg.map;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < map.zone.length; i += 2) {
    x0 = Math.min(x0, map.zone[i]); x1 = Math.max(x1, map.zone[i]);
    z0 = Math.min(z0, map.zone[i + 1]); z1 = Math.max(z1, map.zone[i + 1]);
  }
  x0 -= 60; z0 -= 60; x1 += 60; z1 += 60;
  const k = Math.min(ROAM_SCALE * mmDpr, Math.sqrt(ROAM_PIXELS / ((x1 - x0) * (z1 - z0))));
  const c = document.createElement('canvas');
  c.width = Math.ceil((x1 - x0) * k);
  c.height = Math.ceil((z1 - z0) * k);
  const g = c.getContext('2d');
  g.fillStyle = '#6f7275';
  g.fillRect(0, 0, c.width, c.height);
  paintCity(g, k, x0, z0);
  mmRoam = { c, x0, z0, x1, z1, k };
}

// The city's map drawn into g at k pixels per metre with (x0, z0) at the top left, and of it only what
// lies in view ([x0, z0, x1, z1] in metres; all of it when left out).
const AREA_COLORS = { water: '#5b7d68', paved: '#8a8c8e', sand: '#e2cf9c' };
export function paintCity(g, k, x0, z0, view = null) {
  const map = world.cfg.map, { areas, cells } = cityPaths(map), ab = boxesOf(map.areas);
  const out = (b, o) => view && (b[o] > view[2] || b[o + 2] < view[0] || b[o + 1] > view[3] || b[o + 3] < view[1]);
  g.save();
  g.scale(k, k);
  g.translate(-x0, -z0);
  // the areas in their own order (a square in a park goes over it)
  areas.forEach((a, i) => {
    if (out(ab, i * 4)) return;
    g.fillStyle = a.fill;
    g.fill(a.path);
  });
  // the water, then the footpaths, then the roads over them, then the buildings
  const seen = cells.filter(c => !out(c.box, 0));
  g.lineCap = g.lineJoin = 'round';
  for (let layer = 0; layer < 3; layer++) {
    for (const c of seen) {
      for (const [key, path] of c.lines[layer]) {
        const [color, w] = key.split(' ');
        g.strokeStyle = color;
        g.lineWidth = Math.max(+w, 1 / k); // never thinner than a pixel
        g.stroke(path);
      }
    }
  }
  g.fillStyle = '#a8836a';
  for (const c of seen) g.fill(c.houses);
  g.restore();
}

// The city's map as paths in metres, made once: each area a path of its own, and the lines and the
// buildings by squares of CITY_CELL metres, so that a picture of any part at any scale only fills
// and strokes what is in view and makes nothing new. (Made afresh for every picture, a phone ran out
// of memory zooming in on the big map; and one path for many buildings is far quicker than one each.)
const CITY_CELL = 250;
let cityCache = null;
function cityPaths(map) {
  if (cityCache?.map === map) return cityCache;
  const trace = (path, p, close) => {
    for (let i = 0; i < p.length; i += 2) path[i ? 'lineTo' : 'moveTo'](p[i], p[i + 1]);
    if (close) path.closePath();
  };
  const areas = map.areas.map(a => {
    const path = new Path2D();
    trace(path, a.p, true);
    return { path, fill: AREA_COLORS[a.k] ?? '#5f8f4a' };
  });
  const grid = new Map();
  // the square a thing goes in, by its middle, and the square's box grown round it
  const cellOf = (bb, i) => {
    const key = `${Math.floor((bb[i] + bb[i + 2]) / 2 / CITY_CELL)} ${Math.floor((bb[i + 1] + bb[i + 3]) / 2 / CITY_CELL)}`;
    let c = grid.get(key);
    if (!c) grid.set(key, c = { box: [Infinity, Infinity, -Infinity, -Infinity], lines: [new Map(), new Map(), new Map()], houses: new Path2D() });
    c.box[0] = Math.min(c.box[0], bb[i]); c.box[1] = Math.min(c.box[1], bb[i + 1]);
    c.box[2] = Math.max(c.box[2], bb[i + 2]); c.box[3] = Math.max(c.box[3], bb[i + 3]);
    return c;
  };
  const line = (list, layer, color, pick = () => true) => {
    const bb = boxesOf(list);
    list.forEach((it, i) => {
      if (!pick(it)) return;
      const lines = cellOf(bb, i * 4).lines[layer], key = `${color} ${Math.round(it.w * 2) / 2}`;
      if (!lines.has(key)) lines.set(key, new Path2D());
      trace(lines.get(key), it.p, false);
    });
  };
  line(map.water, 0, '#5b7d68');
  line(map.roads, 1, '#9a9c9e', rd => rd.foot);
  line(map.roads, 2, '#d8d6d0', rd => !rd.foot);
  const bb = boxesOf(map.buildings);
  map.buildings.forEach((b, i) => trace(cellOf(bb, i * 4).houses, b.p, true));
  // a line's width reaches past its middle
  const pad = Math.max(0, ...map.roads.map(rd => rd.w), ...map.water.map(w => w.w)) / 2;
  const cells = [...grid.values()];
  for (const c of cells) { c.box[0] -= pad; c.box[1] -= pad; c.box[2] += pad; c.box[3] += pad; }
  return cityCache = { map, areas, cells };
}

// The box round each thing on the map (x0, z0, x1, z1), worked out once, to skip what is out of view.
const boxCache = new WeakMap();
export function boxesOf(list) {
  let bb = boxCache.get(list);
  if (bb) return bb;
  bb = new Float32Array(list.length * 4);
  list.forEach(({ p }, i) => {
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    for (let j = 0; j < p.length; j += 2) {
      a = Math.min(a, p[j]); c = Math.max(c, p[j]);
      b = Math.min(b, p[j + 1]); d = Math.max(d, p[j + 1]);
    }
    bb.set([a, b, c, d], i * 4);
  });
  boxCache.set(list, bb);
  return bb;
}

export function dot(g, x, z, rad, fill, stroke = null, map = mmMap) {
  const [px, py] = map(x, z);
  g.beginPath();
  g.arc(px, py, rad, 0, Math.PI * 2);
  g.fillStyle = fill;
  g.fill();
  if (stroke) {
    g.lineWidth = 2;
    g.strokeStyle = stroke;
    g.stroke();
  }
  return [px, py];
}

export function drawMinimap() {
  const g = mmCtx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, mm.width, mm.height);
  if (mmRoam) {
    // centred on the riders
    const cx = humans.reduce((s, r) => s + onMap(r).x, 0) / humans.length, cz = humans.reduce((s, r) => s + onMap(r).z, 0) / humans.length;
    const { c, x0, z0, k } = mmRoam, f = k / (ROAM_SCALE * mmDpr), sw = mm.width * f, sh = mm.height * f; // (f < 1: the map's canvas is coarser than the minimap)
    g.drawImage(c, (cx - x0) * k - sw / 2, (cz - z0) * k - sh / 2, sw, sh, 0, 0, mm.width, mm.height);
    mmMap = (x, z) => [MM_W / 2 + (x - cx) * ROAM_SCALE, MM_H / 2 + (z - cz) * ROAM_SCALE];
  } else {
    g.drawImage(mmBase, 0, 0);
  }
  g.setTransform(mmDpr, 0, 0, mmDpr, 0, 0);
  drawMarks(g, mmMap);
}

// Everybody and everything that moves, as dots on a map.
export function drawMarks(g, map) {
  for (const b of thrown) dot(g, b.x, b.z, 2.2, '#fff', null, map);
  for (const t of traps) dot(g, t.x, t.z, 2.4, '#6d4c33', null, map);
  for (const b of world.bikers?.list ?? []) {
    const p = track.at(b.idx, b.lat);
    dot(g, p.x, p.z, 2.2, '#40c4ff', null, map);
  }
  const drawOrder = [...field].sort((a, b) => (a.human >= 0) - (b.human >= 0));
  for (const r of drawOrder) {
    const [x, y] = dot(g, onMap(r).x, onMap(r).z, r.human >= 0 ? 6.5 : 4.5, hex(r.human >= 0 ? PLAYER_COLORS[r.human] : r.def.silk), '#1d1a17', map);
    if (r.human >= 0) {
      g.fillStyle = '#fff';
      g.font = '900 9px Nunito, system-ui, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(String(r.human + 1), x, y + 0.5);
    }
  }
  for (const c of clouds) dot(g, c.x, c.z, 3.4, '#bfe6ff', '#1d1a17', map);
  for (const m of quest?.marks() ?? []) dot(g, m.x, m.z, m.r, m.fill, '#1d1a17', map);
}

mm.addEventListener('pointerdown', e => {
  e.stopPropagation();
  e.preventDefault(); // or the click takes the focus back from the search box that opens with the map
  openBigMap();
});
