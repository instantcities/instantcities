// The big map (a click on the minimap): the whole map to pan and zoom about, the street names, and
// a click on a spot to teleport there; and the places index beside it, to search for a place.

import { local, getLang } from '../i18n.js';
import { groundAt } from '../parking.js';
import { PLACES, SIGHTS, LANDMARKS, SQUARES, MONUMENTS, FAMOUS, INSIDE } from '../city.js';
import { inPolygon } from '../collide.js';
import { sfx } from '../sound.js';
import { t_, clamp, $ } from './base.js';
import { game } from './settings.js';
import { particles, camYaw } from './scene.js';
import { roaming, questing, progressOf, world, track } from './worlds.js';
import { humans } from './racers.js';
import { setText } from './hud.js';
import { fitMap, paintTrack, mmRoam, paintCity, boxesOf, dot, drawMarks } from './minimap.js';
import { setPaused } from './race.js';
import { roomName, putAt } from './indoors.js';
import { touch } from './input.js';

// The big map: click the minimap to see the whole map, click a spot on it to teleport there.
export const bigEl = $('bigmap'), bigCv = $('bigCanvas'), bigCtx = bigCv.getContext('2d'), bigAsk = $('bigAsk');
export let big = null; // { w, h, map, unmap, pick, labels, tab, zoom }
// How much closer the big map comes than when it opens. Zoomed in, the map is not one picture scaled
// up (all of Ghent three times as sharp would be nine times the pixels, more than a phone allows a
// canvas) but the part in view drawn afresh from the map's own lines, with the street names along them.
const BIG_ZOOM = 3;


export function openBigMap() {
  if (game.state !== 'race' && game.state !== 'countdown') return;
  setPaused(true, false);
  bigEl.classList.remove('hidden');
  bigEl.classList.toggle('side', sideIndex());
  layoutBigMap();
  showBigTab(big.tab);
}

export function closeBigMap() {
  if (!big) return;
  big = null;
  bigEl.classList.add('hidden');
  bigAsk.classList.add('hidden');
}

// On a wide screen, riding about freely, the places index stands beside the map instead of on a tab.
const INDEX_W = 300;
// On a phone the big map is the whole screen, under a bar with the tabs and the way back to the game.
const phoneMap = () => innerWidth <= 760 || innerHeight <= 560;
export const sideIndex = () => roaming() && !questing() && innerWidth >= 760;

export function layoutBigMap(focus = null) {
  const full = phoneMap();
  bigEl.classList.toggle('full', full);
  const top = full ? $('bigTop').offsetHeight : 0;
  const maxW = full ? innerWidth : innerWidth - 32 - (sideIndex() ? INDEX_W + 12 : 0), maxH = full ? innerHeight - top : innerHeight - 110, dpr = Math.min(devicePixelRatio, 2);
  const pick = big?.pick ?? null, tab = big?.tab ?? 'map', zoomed = big?.zoom ?? 1;
  const zoom = (touch.on ? 2 : 1) * zoomed; // a phone's map is twice as close, and panned about where it does not fit
  let w, h, s, map0, unmap0, paint;
  if (mmRoam) {
    const { c, x0, z0, x1, z1 } = mmRoam;
    s = Math.min(maxW / (x1 - x0), maxH / (z1 - z0)) * zoom;
    w = (x1 - x0) * s;
    h = (z1 - z0) * s;
    map0 = (x, z) => [(x - x0) * s, (z - z0) * s];
    unmap0 = (px, py) => [x0 + px / s, z0 + py / s];
    paint = g => g.drawImage(c, 0, 0, w, h);
  } else {
    // as big as fits, in the shape of the track
    const pad = track.hw + 8, xs = track.points.map(p => p.x), zs = track.points.map(p => p.z);
    const bw = Math.max(...xs) - Math.min(...xs) + pad * 2, bh = Math.max(...zs) - Math.min(...zs) + pad * 2;
    s = Math.min(maxW / bw, maxH / bh) * zoom;
    w = bw * s;
    h = bh * s;
    ({ map: map0, unmap: unmap0 } = fitMap(track, w, h, pad));
    paint = (g, view) => paintTrack(g, w, h, view);
  }
  // the window onto the map: all of it, or the part of it the finger has panned to
  const vw = Math.min(w, maxW), vh = Math.min(h, maxH);
  let ox = big?.ox, oy = big?.oy;
  if (focus) { // zooming: the spot (x, z) stays where it was, at (px, py) on the canvas
    [ox, oy] = map0(focus.x, focus.z);
    ox -= focus.px;
    oy -= focus.py;
  } else if (ox === undefined) { // first time: centred on the riders
    const cx = humans.reduce((a, r) => a + r.pos.x, 0) / humans.length, cz = humans.reduce((a, r) => a + r.pos.z, 0) / humans.length;
    [ox, oy] = map0(cx, cz);
    ox -= vw / 2;
    oy -= vh / 2;
  }
  ox = clamp(ox, 0, w - vw);
  oy = clamp(oy, 0, h - vh);
  // (a canvas given its size anew is a new one, even at the same size)
  if (bigCv.width !== Math.round(vw * dpr)) bigCv.width = Math.round(vw * dpr);
  if (bigCv.height !== Math.round(vh * dpr)) bigCv.height = Math.round(vh * dpr);
  bigCv.style.width = vw + 'px';
  bigCv.style.height = vh + 'px';
  bigIndex.style.height = sideIndex() ? vh + 'px' : '';
  bigCv.classList.toggle('pan', w > vw + 1 || h > vh + 1);
  // not zoomed in: the whole map painted once, of which the canvas shows a part (kept while it fits)
  let base = null;
  if (zoomed === 1) {
    const key = `${w} ${h} ${dpr}`;
    base = big?.base?.key === key ? big.base : document.createElement('canvas');
    if (base.key !== key) {
      base.width = Math.round(w * dpr);
      base.height = Math.round(h * dpr);
      const g = base.getContext('2d');
      g.scale(dpr, dpr);
      paint(g);
      base.key = key;
    }
  }
  // zoomed in: what is in view, painted every time the map is drawn
  const view = g => {
    const [x0, z0] = unmap(0, 0), [x1, z1] = unmap(vw, vh), pad = 20 / s, box = [x0 - pad, z0 - pad, x1 + pad, z1 + pad];
    if (mmRoam) {
      g.fillStyle = '#6f7275';
      g.fillRect(0, 0, vw, vh);
      paintCity(g, s, x0, z0, box);
    } else {
      g.translate(-big.ox, -big.oy);
      paint(g, box);
    }
  };
  const map = (x, z) => { const [a, b] = map0(x, z); return [a - big.ox, b - big.oy]; };
  const unmap = (px, py) => unmap0(px + big.ox, py + big.oy);
  big = { ...big, w, h, s, vw, vh, ox, oy, dpr, base, view, map, unmap, pick, tab, zoom: zoomed };
  $('bigZoomIn').disabled = zoomed >= BIG_ZOOM;
  $('bigZoomOut').disabled = zoomed <= 1;
  drawBigMap();
}

// Closer or further off, to z times as close as the map opens, round the point (clientX, clientY)
// (the middle of the map when left out), which stays put under the mouse or between the fingers.
export function zoomBigMap(z, clientX, clientY) {
  z = clamp(z, 1, BIG_ZOOM);
  if (!big || Math.abs(z - big.zoom) < 0.01) return;
  if (Math.abs(z - Math.round(z)) < 0.03) z = Math.round(z); // not to stop a hair off a whole step
  let r = bigCv.getBoundingClientRect();
  const cx = clientX ?? r.left + r.width / 2, cy = clientY ?? r.top + r.height / 2;
  const [x, zz] = big.unmap(cx - r.left, cy - r.top), vw = big.vw, vh = big.vh;
  big.zoom = z;
  // the canvas may grow as the map comes closer, round its middle
  layoutBigMap({ x, z: zz, px: cx - r.left + (big.vw - vw) / 2, py: cy - r.top + (big.vh - vh) / 2 });
  r = bigCv.getBoundingClientRect(); // and if it grew any other way, put the spot back under the pointer
  const [px, py] = big.map(x, zz), dx = px - (cx - r.left), dy = py - (cy - r.top);
  if (Math.abs(dx) + Math.abs(dy) < 1) return;
  big.ox = clamp(big.ox + dx, 0, big.w - big.vw);
  big.oy = clamp(big.oy + dy, 0, big.h - big.vh);
  drawBigMap();
}

export function drawBigMap() {
  const g = bigCtx, { base, dpr, map, pick } = big;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, bigCv.width, bigCv.height);
  if (base) g.drawImage(base, Math.round(big.ox * dpr), Math.round(big.oy * dpr), bigCv.width, bigCv.height, 0, 0, bigCv.width, bigCv.height);
  else {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.save();
    big.view(g);
    g.restore();
    if (big.s >= STREET_NAMES_FROM && world.cfg.map?.names) drawStreetNames(g, map);
  }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawMarks(g, map);
  big.labels = mmRoam && !questing() ? drawPlaces(g, map) : []; // in a quest the yellow dots are the targets
  if (big.hover) lightUp(g, map, big.hover);
  bigAsk.classList.toggle('hidden', !pick);
  if (!pick) return;
  // a pin where you will land
  const [px, py] = map(pick.x, pick.z);
  g.beginPath();
  g.arc(px, py, 9, 0, Math.PI * 2);
  g.fillStyle = pick.ok ? 'rgba(255, 214, 64, 0.55)' : 'rgba(230, 60, 50, 0.55)';
  g.fill();
  g.lineWidth = 3;
  g.strokeStyle = '#1d1a17';
  g.stroke();
  setText($('bigAskText'), pick.place ? t_('bigmap.askTo', { name: pick.place }) : t_(pick.ok ? 'bigmap.ask' : 'bigmap.blocked'));
  $('bigYes').classList.toggle('hidden', !pick.ok);
  const r = bigCv.getBoundingClientRect(), box = bigEl.getBoundingClientRect();
  bigAsk.style.left = clamp(r.left - box.left + px, 120, box.width - 120) + 'px';
  bigAsk.style.top = (r.top - box.top + py + (py > big.vh - 90 ? -70 : 18)) + 'px';
}

// The street names, along their streets, once the map is close enough to read them: the widest streets
// first, each name in the middle of its stretch in view (and more often along a long one), never over
// another name, and never round a bend sharper than a letter can follow.
const STREET_NAMES_FROM = 0.28; // pixels per metre
const streetCache = new WeakMap();
function drawStreetNames(g, map) {
  const vw = big.vw, vh = big.vh, chains = streetChains(world.cfg.map);
  g.font = '800 11px Nunito, system-ui, sans-serif';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.lineJoin = 'round';
  const placed = []; // the box round each name put down
  const [vx0, vz0] = big.unmap(0, 0), [vx1, vz1] = big.unmap(vw, vh);
  for (const ch of chains) {
    if (ch.box[0] > vx1 || ch.box[2] < vx0 || ch.box[1] > vz1 || ch.box[3] < vz0) continue;
    // the street on screen, with how far along it each point lies
    const xs = [], ys = [], at = [0];
    for (let k = 0; k < ch.p.length; k += 2) {
      const [x, y] = map(ch.p[k], ch.p[k + 1]);
      if (xs.length) at.push(at[at.length - 1] + Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1]));
      xs.push(x); ys.push(y);
    }
    const len = at[at.length - 1];
    const widths = ch.widths ??= [...ch.name].map(c => g.measureText(c).width), tw = widths.reduce((a, b) => a + b, 0);
    if (len < tw + 12) continue;
    // a point d along the street, and the way it runs there
    let seg = 0;
    const pointAt = d => {
      if (d < at[seg]) seg = 0;
      while (seg < at.length - 2 && at[seg + 1] < d) seg++;
      const f = (d - at[seg]) / ((at[seg + 1] - at[seg]) || 1);
      return [xs[seg] + (xs[seg + 1] - xs[seg]) * f, ys[seg] + (ys[seg + 1] - ys[seg]) * f, Math.atan2(ys[seg + 1] - ys[seg], xs[seg + 1] - xs[seg])];
    };
    const tries = Math.max(1, Math.floor(len / Math.max(tw + 200, 360)));
    for (let t = 0; t < tries; t++) {
      const mid = len * (t + 0.5) / tries, start = mid - tw / 2;
      // read left to right: if the street runs the other way here, the letters go along it backwards
      const a = pointAt(start), b = pointAt(start + tw), back = b[0] < a[0];
      const letters = [];
      let d = 0, ok = true, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i < widths.length && ok; i++) {
        const [x, y, ang0] = pointAt(back ? start + tw - d - widths[i] / 2 : start + d + widths[i] / 2), ang = back ? ang0 + Math.PI : ang0;
        if (letters.length) {
          const turn = Math.abs(((ang - letters[letters.length - 1][2] + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
          if (turn > 0.6) ok = false;
        }
        if (x < 4 || y < 4 || x > vw - 4 || y > vh - 4) ok = false;
        letters.push([x, y, ang]);
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        d += widths[i];
      }
      if (!ok) continue;
      x0 -= 7; y0 -= 7; x1 += 7; y1 += 7;
      if (placed.some(p => x0 < p[2] && x1 > p[0] && y0 < p[3] && y1 > p[1])) continue;
      placed.push([x0, y0, x1, y1]);
      for (const pass of ['stroke', 'fill']) {
        [...ch.name].forEach((c, i) => {
          const [x, y, ang] = letters[i];
          g.setTransform(big.dpr, 0, 0, big.dpr, 0, 0);
          g.translate(x, y);
          g.rotate(ang);
          if (pass === 'stroke') {
            g.lineWidth = 3;
            g.strokeStyle = 'rgba(255, 250, 240, 0.9)';
            g.strokeText(c, 0, 0);
          } else {
            g.fillStyle = '#1d1a17';
            g.fillText(c, 0, 0);
          }
        });
      }
    }
  }
  g.setTransform(big.dpr, 0, 0, big.dpr, 0, 0);
  g.textAlign = 'left';
}

// Each street as long lines to write its name along: the bits of road with one name joined end to end
// (the map has a street in many short pieces), the widest streets first. Worked out once.
function streetChains(map) {
  if (streetCache.has(map)) return streetCache.get(map);
  const byName = new Map();
  for (const rd of map.roads) {
    if (rd.n === undefined || !map.names[rd.n]) continue;
    if (!byName.has(rd.n)) byName.set(rd.n, []);
    byName.get(rd.n).push({ w: rd.w, p: rd.p });
  }
  const same = (p, i, q, j) => Math.abs(p[i] - q[j]) < 0.5 && Math.abs(p[i + 1] - q[j + 1]) < 0.5;
  const back = p => { const r = []; for (let i = p.length - 2; i >= 0; i -= 2) r.push(p[i], p[i + 1]); return r; };
  const chains = [];
  for (const [n, ways] of byName) {
    for (let joined = true; joined;) {
      joined = false;
      for (let a = 0; a < ways.length && !joined; a++) {
        for (let b = a + 1; b < ways.length && !joined; b++) {
          const p = ways[a].p, q = ways[b].p, pe = p.length - 2, qe = q.length - 2;
          const r = same(p, pe, q, 0) ? p.concat(q.slice(2))
            : same(q, qe, p, 0) ? q.concat(p.slice(2))
            : same(p, 0, q, 0) ? back(q).concat(p.slice(2))
            : same(p, pe, q, qe) ? p.concat(back(q).slice(2)) : null;
          if (!r) continue;
          ways[a] = { w: Math.max(ways[a].w, ways[b].w), p: r };
          ways.splice(b, 1);
          joined = true;
        }
      }
    }
    for (const { w, p } of ways) chains.push({ name: map.names[n], w, p });
  }
  const bb = boxesOf(chains);
  chains.forEach((ch, i) => { ch.box = bb.subarray(i * 4, i * 4 + 4); ch.len = Math.hypot(ch.box[2] - ch.box[0], ch.box[3] - ch.box[1]); });
  chains.sort((a, b) => b.w - a.w || b.len - a.len);
  streetCache.set(map, chains);
  return chains;
}

// The named places as dots with their names, returning where each name sits so a click can find it.
function drawPlaces(g, map) {
  g.font = '900 13px Nunito, system-ui, sans-serif';
  g.textBaseline = 'middle';
  g.lineJoin = 'round';
  const labels = PLACES.map(pl => {
    const [px, py] = dot(g, pl.x, pl.z, 4, '#ffd640', '#1d1a17', map);
    const w = g.measureText(pl.name).width, tx = pl.side === 'l' ? px - 8 - w : px + 8;
    g.lineWidth = 4;
    g.strokeStyle = '#1d1a17';
    g.strokeText(pl.name, tx, py);
    g.fillStyle = '#fffaf0';
    g.fillText(pl.name, tx, py);
    return { pl, x0: Math.min(tx, px - 8), x1: Math.max(tx + w, px + 8), y0: py - 10, y1: py + 10 };
  });
  // the doors into buildings: a door on a white disc where each is, to click on (the index has their names)
  g.font = '16px system-ui, sans-serif';
  g.textAlign = 'center';
  for (const b of INSIDE.list) {
    const [px, py] = dot(g, b.street.x, b.street.z, 11, '#fffaf0', '#1d1a17', map);
    g.fillText('🚪', px, py + 1);
    labels.push({ pl: { name: roomName(b), x: b.street.x, z: b.street.z, room: b }, x0: px - 12, x1: px + 12, y0: py - 12, y1: py + 12 });
  }
  g.textAlign = 'start';
  return labels;
}

// A place picked out in the index, lit up on the map: a street along its whole length, a landmark or
// a square by its outline and a ring round its spot, anything else by the ring alone. Its name beside it.
function lightUp(g, map, it) {
  const glow = '#ffd640', ink = '#1d1a17';
  const outline = p => {
    g.beginPath();
    for (let k = 0; k < p.length; k += 2) { const [px, py] = map(p[k], p[k + 1]); k ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.closePath();
  };
  g.save();
  g.lineJoin = g.lineCap = 'round';
  if (it.street) {
    const { roads, names } = world.cfg.map;
    for (const [w, c] of [[9, ink], [5, glow]]) {
      g.lineWidth = w;
      g.strokeStyle = c;
      for (const rd of roads) {
        if (names[rd.n] !== it.street) continue;
        g.beginPath();
        for (let k = 0; k < rd.p.length; k += 2) { const [px, py] = map(rd.p[k], rd.p[k + 1]); k ? g.lineTo(px, py) : g.moveTo(px, py); }
        g.stroke();
      }
    }
  } else if (it.outline) {
    outline(it.outline);
    g.fillStyle = 'rgba(255, 214, 64, 0.75)';
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = ink;
    g.stroke();
  }
  const [px, py] = map(it.x, it.z);
  if (!it.street) { // an outline too, which is small on the whole map
    for (const [r, w, c] of [[14, 7, ink], [14, 4, glow]]) {
      g.beginPath();
      g.arc(px, py, r, 0, Math.PI * 2);
      g.lineWidth = w;
      g.strokeStyle = c;
      g.stroke();
    }
  }
  dot(g, it.x, it.z, 5, glow, ink, map);
  g.font = '900 15px Nunito, system-ui, sans-serif';
  g.textBaseline = 'middle';
  const w = g.measureText(it.name).width, tx = px + 20 + w > big.vw ? px - 20 - w : px + 20;
  g.lineWidth = 5;
  g.strokeStyle = ink;
  g.strokeText(it.name, tx, py);
  g.fillStyle = glow;
  g.fillText(it.name, tx, py);
  g.restore();
}

// Landing at a named place: on the nearest bit of road you can stand on, so never inside the
// building itself (some paths run straight through a castle or a station).
export function placeLanding(pl) {
  if (pl.room) return { x: pl.x, z: pl.z, ok: true, place: pl.name, room: pl.room }; // through its door
  const spots = [];
  for (const rd of world.cfg.map.roads) {
    for (let k = 0; k < rd.p.length; k += 2) spots.push([(rd.p[k] - pl.x) ** 2 + (rd.p[k + 1] - pl.z) ** 2, rd.p[k], rd.p[k + 1]]);
  }
  spots.sort((a, b) => a[0] - b[0]);
  for (const [, x, z] of spots.slice(0, 50)) {
    const pick = landingAt(x, z);
    if (pick.ok) return { ...pick, place: pl.name };
  }
  return landingAt(pl.x, pl.z);
}

// Where you would land when you click (x, z): on the track in a race, anywhere outside the
// buildings when riding about freely.
export function landingAt(x, z) {
  if (!roaming()) {
    const idx = track.nearest(x, z), lat = clamp(track.lateral(x, z, idx), -track.railLimit, track.railLimit);
    const p = track.at(idx, lat);
    return { x: p.x, z: p.z, idx, lat, ok: true };
  }
  const free = (x, z) => inPolygon(x, z, map.zone) && !map.buildings.some(b => inPolygon(x, z, b.p));
  const map = world.cfg.map;
  if (free(x, z)) return { x, z, ok: true };
  // somewhere you cannot stand: give it a best shot at a street nearby, else at any open spot around it
  const spots = [];
  for (const rd of map.roads) {
    for (let k = 0; k < rd.p.length; k += 2) spots.push([(rd.p[k] - x) ** 2 + (rd.p[k + 1] - z) ** 2, rd.p[k], rd.p[k + 1]]);
  }
  spots.sort((a, b) => a[0] - b[0]);
  for (const [, sx, sz] of spots.slice(0, 50)) if (free(sx, sz)) return { x: sx, z: sz, ok: true };
  for (let r = 4; r <= 120; r += 4) {
    for (let a = 0; a < 16; a++) {
      const sx = x + Math.cos(a * Math.PI / 8) * r, sz = z + Math.sin(a * Math.PI / 8) * r;
      if (free(sx, sz)) return { x: sx, z: sz, ok: true };
    }
  }
  return { x, z, ok: false };
}

export function teleport(pick) {
  humans.forEach((r, p) => {
    r.tram = null; // off the tram, or no longer waiting for one
    r.bus = null; // and off the bus
    // two players land side by side
    const side = humans.length > 1 ? (p ? 1.2 : -1.2) : 0;
    let { x, z } = pick, yaw = r.yaw;
    if (pick.idx !== undefined) {
      const lat = clamp(pick.lat + side, -track.railLimit, track.railLimit);
      track.at(pick.idx, lat, r.pos);
      yaw = track.yawAt(pick.idx);
      Object.assign(r, { idx: pick.idx, lat });
      r.progress = progressOf(r);
    } else {
      r.pos.x = x + Math.cos(yaw) * side;
      r.pos.z = z - Math.sin(yaw) * side;
      r.onRoute = undefined;
      if (track.distTo(r.pos.x, r.pos.z) < track.hw + 4) {
        r.idx = track.nearest(r.pos.x, r.pos.z);
        r.lat = track.lateral(r.pos.x, r.pos.z, r.idx);
      }
      r.streetT = 0;
    }
    const onCars = r.onRoute !== false && Math.abs(r.lat) <= track.hw + 0.3 ? groundAt(track.parking, track, r.idx, r.lat, true) : 0;
    const base = pick.idx !== undefined ? track.riseAt(pick.idx) : (world.relief?.at(r.pos.x, r.pos.z) ?? 0); // on top of a bridge
    Object.assign(r, { yaw, speed: 0, steer: 0, y: onCars, vy: 0, ground: onCars, wrongWay: 0, base, baseV: 0 });
    camYaw[p] = yaw;
    particles.burst(r.pos.x, 1, r.pos.z, 24, { color: 0xffe680, speed: 5, up: 3, life: 0.7, size: 0.25, grow: 0.5, opacity: 0.9, drag: 3 });
  });
  sfx.jump(0);
}

function pickOnBigMap(clientX, clientY) {
  if (questing()) return; // a look at the map, but no teleporting your way through a quest
  const r = bigCv.getBoundingClientRect(), px = clientX - r.left, py = clientY - r.top;
  const label = big.labels.find(l => px >= l.x0 && px <= l.x1 && py >= l.y0 && py <= l.y1);
  const [x, z] = big.unmap(px, py);
  big.pick = label ? placeLanding(label.pl) : landingAt(x, z);
  drawBigMap();
}
// Panning and zooming at most once a frame, however many moves the fingers or the wheel send.
let bigFrame = 0, bigNext = null;
function onBigFrame(fn) {
  bigNext = fn;
  bigFrame ||= requestAnimationFrame(() => {
    bigFrame = 0;
    const f = bigNext;
    bigNext = null;
    if (big) f();
  });
}
// A press might be the start of panning the map about, so a spot is picked on release, and only if
// the pointer did not move. Two fingers pinch the map closer or further off.
let bigDrag = null, bigPinch = null;
const bigFingers = new Map();
const pinchOf = () => {
  const [a, b] = bigFingers.values();
  return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
};
bigCv.addEventListener('pointerdown', e => {
  e.stopPropagation();
  bigCv.setPointerCapture(e.pointerId);
  bigFingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (bigFingers.size === 2) {
    bigDrag = null;
    bigPinch = { ...pinchOf(), zoom: big.zoom };
  } else if (bigFingers.size === 1) {
    bigDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: big.ox, oy: big.oy, moved: false, mouse: e.pointerType === 'mouse' };
  }
});
bigCv.addEventListener('pointermove', e => {
  if (!bigFingers.has(e.pointerId)) return;
  bigFingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (bigPinch && bigFingers.size >= 2) {
    const p = pinchOf(), z = bigPinch.zoom * p.d / Math.max(bigPinch.d, 1);
    return onBigFrame(() => zoomBigMap(z, p.x, p.y));
  }
  if (!bigDrag || e.pointerId !== bigDrag.id) return;
  const dx = e.clientX - bigDrag.x, dy = e.clientY - bigDrag.y;
  if (!bigDrag.moved && Math.hypot(dx, dy) < (bigDrag.mouse ? 4 : 8)) return;
  bigDrag.moved = true;
  bigCv.classList.add('dragging');
  const { ox, oy } = bigDrag;
  onBigFrame(() => {
    big.ox = clamp(ox - dx, 0, big.w - big.vw);
    big.oy = clamp(oy - dy, 0, big.h - big.vh);
    drawBigMap();
  });
});
const bigLift = e => {
  bigFingers.delete(e.pointerId);
  bigCv.classList.remove('dragging');
  if (bigPinch) { // the pinch is over once a finger is off: the other one does not pan or pick
    if (!bigFingers.size) bigPinch = null;
    return null;
  }
  if (!bigDrag || e.pointerId !== bigDrag.id) return null;
  const d = bigDrag;
  bigDrag = null;
  return d;
};
bigCv.addEventListener('pointerup', e => {
  const d = bigLift(e);
  if (d && !d.moved) pickOnBigMap(e.clientX, e.clientY);
});
bigCv.addEventListener('pointercancel', bigLift);
bigCv.addEventListener('wheel', e => {
  e.preventDefault();
  if (!big) return;
  big.wheel = (bigFrame ? big.wheel : big.zoom) * Math.exp(-clamp(e.deltaY * (e.deltaMode ? 33 : 1), -120, 120) * 0.004);
  const z = big.wheel, { clientX, clientY } = e;
  onBigFrame(() => zoomBigMap(z, clientX, clientY));
}, { passive: false });
// the buttons go in two steps of √3 from as the map opens to three times as close
export const BIG_STEP = Math.sqrt(BIG_ZOOM);
$('bigZoomIn').addEventListener('click', () => zoomBigMap(big.zoom * BIG_STEP));
$('bigZoomOut').addEventListener('click', () => zoomBigMap(big.zoom / BIG_STEP));
bigEl.addEventListener('pointerdown', e => { if (e.target === bigEl) closeBigMapAndPlay(); });
$('bigYes').addEventListener('click', () => confirmTeleport());
$('bigNo').addEventListener('click', () => { big.pick = null; bigList.querySelector('.listask')?.remove(); drawBigMap(); });
$('bigClose').addEventListener('click', () => closeBigMapAndPlay());

// ------------------------------------------------------------------ the places index

// The big map's second tab when riding about freely: every place of note and every street, in
// alphabetical lists to look a name up in, and a click on one shows it on the map and asks to teleport there.
export const bigIndex = $('bigIndex'), bigSearch = $('bigSearch'), bigList = $('bigList');
let streetIndex = null; // the streets, worked out once: they do not change with the language

// the middle of a flat [x, z, x, z, ...] outline
function middle(p) {
  let x = 0, z = 0;
  for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; }
  return [(x * 2) / p.length, (z * 2) / p.length];
}

// each street at the middle of its longest stretch
function streets() {
  if (streetIndex) return streetIndex;
  const { roads, names, zone } = world.cfg.map, best = new Map();
  for (const rd of roads) {
    const name = names[rd.n];
    if (!name) continue;
    let len = 0;
    for (let k = 2; k < rd.p.length; k += 2) len += Math.hypot(rd.p[k] - rd.p[k - 2], rd.p[k + 1] - rd.p[k - 1]);
    if (len > (best.get(name)?.len ?? 0)) best.set(name, { rd, len });
  }
  streetIndex = [];
  for (const [name, { rd }] of best) {
    const k = Math.floor(rd.p.length / 4) * 2, x = rd.p[k], z = rd.p[k + 1];
    if (inPolygon(x, z, zone)) streetIndex.push({ name, x, z });
  }
  return streetIndex;
}

// the kinds of well-known places (<city>/famous.js), in the order the index lists them
const FAMOUS_KINDS = { museum: '🖼️', culture: '🎭', restaurant: '🍽️', cafe: '🍺', market: '🧺', park: '🌳', church: '⛪', school: '🎓', library: '📚', hospital: '🏥' };

// the index in groups, each in alphabetical order, every name only once
function placesIndex() {
  const seen = new Set(), zone = world.cfg.map.zone;
  const group = (key, items) => ({
    key,
    items: items.filter(i => {
      const k = i.name?.toLocaleLowerCase();
      if (!k || seen.has(k) || !inPolygon(i.x, i.z, zone)) return false;
      seen.add(k);
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name, getLang())),
  });
  // a landmark's footprint to light up on the map, where the index has one by that name
  const foot = new Map((LANDMARKS ?? []).filter(l => l.foot?.[0]).map(l => [l.name, l.foot[0]]));
  const rooms = { key: 'bigmap.inside', items: INSIDE.list.map(b => ({ name: roomName(b), x: b.street.x, z: b.street.z, emoji: b.emoji, room: b })) };
  return [
    ...(rooms.items.length ? [rooms] : []),
    group('bigmap.sights', [
      ...(SIGHTS ?? []).filter(s => !s.secret).map(s => ({ name: local(s.text).name, x: s.x, z: s.z, emoji: s.emoji })),
      ...(LANDMARKS ?? []).filter(l => l.foot?.[0]).map(l => { const [x, z] = middle(l.foot[0]); return { name: l.name, x, z, emoji: '🏛️', outline: l.foot[0] }; }),
      ...(MONUMENTS ?? []).filter(m => m.name && !m.id.startsWith('fietsenstalling')).map(m => ({ name: m.name, x: m.x, z: m.z, emoji: '🗿' })),
    ]),
    // the well-known places, a group for each kind
    ...Object.keys(FAMOUS_KINDS).map(kind => group(`bigmap.k.${kind}`,
      (FAMOUS ?? []).filter(f => f.kind === kind).map(f => ({ name: f.name, x: f.x, z: f.z, emoji: FAMOUS_KINDS[kind], outline: foot.get(f.name) })))),
    group('bigmap.places', [
      ...(PLACES ?? []).map(p => ({ name: p.name, x: p.x, z: p.z, emoji: '📍' })),
      ...(SQUARES ?? []).filter(q => q.name).map(q => { const [x, z] = middle(q.p); return { name: q.name, x, z, emoji: '⬜', outline: q.p }; }),
    ]),
    group('bigmap.streets', streets().map(st => ({ ...st, emoji: '🛣️', street: st.name }))),
  ];
}

// Strip accents and case, so "sint baafs" finds Sint-Baafsplein and "leontine" finds Léontine.
const fold = v => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function renderIndex() {
  const q = fold(bigSearch.value), out = [];
  big.found = [];
  for (const { key, items } of big.index) {
    const hits = q ? items.filter(i => fold(i.name).includes(q)) : items;
    if (!hits.length) continue;
    out.push(`<h3>${t_(key)}</h3>`);
    for (const i of hits) {
      out.push(`<button data-k="${big.found.length}"><span>${i.emoji}</span>${i.name.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</button>`);
      big.found.push(i);
    }
  }
  bigList.innerHTML = out.join('') || `<p class="none">${t_('bigmap.none')}</p>`;
  big.focus = 0;
  hoverEntry(q ? big.found[0] : null);
  bigList.querySelector('button')?.classList.add('focus');
  bigList.scrollTop = 0;
}

export function showBigTab(tab) {
  if (!big) return; // the map is closed (its tabs are hidden with it)
  const side = sideIndex(), index = side || (tab === 'index' && roaming() && !questing());
  big.tab = index && !side ? 'index' : 'map';
  $('bigTabs').classList.toggle('hidden', !roaming() || questing()); // a race or a quest: just the map
  $('bigTabMap').classList.toggle('on', !index);
  $('bigTabIndex').classList.toggle('on', index);
  bigCv.classList.toggle('hidden', index && !side);
  $('bigZoom').classList.toggle('hidden', index && !side);
  for (const [id, key] of [['bigZoomIn', 'bigmap.zoomIn'], ['bigZoomOut', 'bigmap.zoomOut']]) { $(id).title = t_(key); $(id).setAttribute('aria-label', t_(key)); }
  bigIndex.classList.toggle('hidden', !index);
  setText(bigEl.querySelector('.bighint'), t_(side ? 'bigmap.sideHint' : index ? 'bigmap.indexHint' : questing() ? 'bigmap.questHint' : 'bigmap.hint'));
  if (index) {
    big.pick = null;
    bigAsk.classList.add('hidden');
    big.index = placesIndex();
    bigSearch.placeholder = t_('bigmap.search');
    renderIndex();
    if (!touch.on) bigSearch.focus();
    if (side) drawBigMap();
  } else {
    bigSearch.blur();
    drawBigMap();
  }
}

// A place picked in the index: show it on the map with the same question a spot clicked on the map gets.
function pickEntry(i, k) {
  const pick = i && placeLanding(i);
  if (!pick?.ok) return;
  if (!sideIndex()) showBigTab('map');
  big.pick = pick;
  drawBigMap();
  listAsk(k ?? big.found.indexOf(i));
}

// The same question right in the list, in the line below the place just picked (when the list is beside the map).
function listAsk(k) {
  bigList.querySelector('.listask')?.remove();
  const b = sideIndex() && big.pick?.ok && bigList.querySelector(`button[data-k="${k}"]`);
  if (!b) return;
  const row = document.createElement('div');
  row.className = 'listask';
  row.innerHTML = `<span>${t_('bigmap.ask')}</span><button class="yes" aria-label="${t_('bigmap.yes')}">✓</button><button class="no" aria-label="${t_('bigmap.no')}">✗</button>`;
  b.after(row);
}

$('bigTabMap').addEventListener('click', () => showBigTab('map'));
$('bigTabIndex').addEventListener('click', () => showBigTab('index'));
bigSearch.addEventListener('input', renderIndex);
// pointing at a place in the index lights it up on the map beside it
function hoverEntry(it) {
  if (!big || big.hover === it) return;
  big.hover = it;
  if (!bigCv.classList.contains('hidden')) drawBigMap();
}
bigList.addEventListener('pointerover', e => {
  const b = e.target.closest('button');
  if (b) hoverEntry(big.found[+b.dataset.k]);
});
// and when the pointer leaves the list, what the search picked stays lit (the first hit, or the one ↑ ↓ went to)
bigList.addEventListener('pointerleave', () => hoverEntry(bigSearch.value ? big.found[big.focus] : null));
bigList.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.closest('.listask')) {
    if (b.classList.contains('yes')) return confirmTeleport();
    big.pick = null;
    bigList.querySelector('.listask')?.remove();
    return drawBigMap();
  }
  pickEntry(big.found[+b.dataset.k], +b.dataset.k);
});
// in the search field: ↑ ↓ go through what it found, Enter asks to teleport to the one picked, a second Enter goes
bigSearch.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const bs = bigList.querySelectorAll('button');
    if (!bs.length) return;
    bs[big.focus]?.classList.remove('focus');
    big.focus = clamp(big.focus + (e.key === 'ArrowDown' ? 1 : -1), 0, bs.length - 1);
    bs[big.focus].classList.add('focus');
    bs[big.focus].scrollIntoView({ block: 'nearest' });
    hoverEntry(big.found[big.focus]);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    const it = big.found[big.focus];
    if (big.pick?.ok && big.pick.place === it?.name) confirmTeleport();
    else pickEntry(it);
  }
});

export function confirmTeleport() {
  if (!big?.pick?.ok) return;
  const pick = big.pick;
  closeBigMapAndPlay();
  if (pick.room) humans.slice(0, game.players).forEach((r, p) => { const at = pick.room.inside; putAt(r, at.x + (game.players > 1 ? (p ? 1.2 : -1.2) : 0), at.z, at.yaw); });
  else teleport(pick);
}

export function closeBigMapAndPlay() {
  closeBigMap();
  setPaused(false);
}
