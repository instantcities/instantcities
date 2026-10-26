// The city and its routes: the city built once, and a world per route (its track, pickups and
// obstacles), with the sky and the light as the time of day and the weather make them.

import * as THREE from 'three';
import { Track } from '../track.js';
import { TRACKS } from '../tracks.js';
import { ITEMS, rollItem, createItemModel } from '../items.js';
import { createObstacle } from '../obstacles.js';
import { buildCity, buildScenery } from '../scenery.js';
import { parkingRows, groundAt, BAND } from '../parking.js';
import { findMouths, buildArrows } from '../junctions.js';
import { Bikers, Cyclists } from '../bikers.js';
import { LOW_POWER, SIGHT } from '../device.js';
import { packNormals, tileUp } from '../tiles.js';
import { People, alongside, busyPaths } from '../people.js';
import { BUSY, QUESTS, SIGHTS, SIGHT_PAGES, THEME, RUNS, CHARACTERS, MONUMENTS, TOUR } from '../city.js';
import { inPolygon } from '../collide.js';
import { buildRelief } from '../relief.js';
import { fitToHills } from '../terrain.js';
import { squareAt } from '../squares.js';
import { atmosphere, isNight, snowCover } from '../weather.js';
import { t_, SKY_FADE } from './base.js';
import { game } from './settings.js';
import { scene, hemi, sun, weather, headlamps } from './scene.js';
import { setupMinimap } from './minimap.js';

export const trackShapes = TRACKS.map(cfg => new Track(cfg));
export const roaming = () => game.kind !== 'race'; // every mission rides about freely, exploring or on a quest (and behind the tour's menu, one rider does)
export const questing = () => game.kind === 'mission' && game.mission > 0;
export const exploring = () => roaming() && !questing();
// in the helicopter: the rescue quest, or riding about freely in it once that quest is won
export const heliMode = () => (questing() && !!QUESTS[game.mission - 1]?.heli) || (exploring() && game.mounts[0] === 'heli');
export const freeStick = () => exploring() || (questing() && (!!QUESTS[game.mission - 1]?.zombies || !!QUESTS[game.mission - 1]?.heli)); // the touch stick rides forward and back itself, no automatic forward (exploring, and the zombie missions)
export const touring = () => game.kind === 'tour';
// A sight's own page, where the city has them (SIGHT_PAGES in its city.js: the address the sight's id
// goes after), or the sight's own `page` where it has one ('' for none). '' when the city has no such pages.
export const sightPage = id => SIGHTS.find(s => s.id === id)?.page ?? (SIGHT_PAGES ? `${SIGHT_PAGES}${id}/` : '');
export const flying = () => touring() && game.tourMode === 'fly'; // the tour flown yourself (dragonfly.js)
export const touringNow = () => game.state === 'tour' || (game.state === 'paused' && game.resumeState === 'tour'); // flying the tour, or paused in it
export const aerial = () => game.state === 'menu' || touringNow(); // the camera flies over the city, nobody rides it
export const KINDS = ['mission', ...(THEME.races === false ? [] : ['race']), ...(TOUR ? ['tour'] : [])]; // (a city can have no races: THEME.races false, inside a church)
export let quest = null; // the quest being played (see js/quests.js)
export let demo = null; // the film about the game, playing (?demo, see js/demo.js)
// What is played, for Google Analytics (the page's gtag; not there on a dev server's copy without it).
export const report = (name, params = {}) => window.gtag?.('event', name, { city: location.pathname.split('/')[1], ...params });
export const lapsToRide = () => (track.open ? 1 : game.laps); // an open route is ridden once, start to finish
// how far round the race a rider is: laps and a fraction of one, or start to finish on an open route
export const progressOf = r => (track.open ? (r.idx - track.start) / (track.finish - track.start) : r.lap + r.idx / track.n);
export const worlds = [];
export let world = null;
export let city = null; // the city all the routes run through, built once (see getCity)
export let track = trackShapes[game.trackIdx];

const ringGeo = new THREE.TorusGeometry(1.05, 0.09, 8, 36);
const glowGeo = new THREE.CircleGeometry(1.05, 32);

class Pickup {
  constructor(t, parent, frac, lat, lift = 0) {
    this.idx = t.atFrac(frac);
    // over a row of parked cars the outer items sit on the roofs
    this.y = groundAt(t.parking, t, this.idx, lat);
    if (this.y > 0) {
      lat = Math.sign(lat) * (t.hw - BAND / 2);
      lift = 0;
    }
    this.lat = lat;
    this.pos = t.at(this.idx, lat);
    this.yaw = t.yawAt(this.idx) + Math.PI;
    this.group = new THREE.Group();
    this.group.position.copy(this.pos);
    this.group.position.y = this.pos.y + this.y; // pos.y: on a bridge
    parent.add(this.group);
    this.ringMat = new THREE.MeshBasicMaterial();
    this.glowMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.35, depthWrite: false });
    const ring = new THREE.Mesh(ringGeo, this.ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1 + lift;
    const glow = new THREE.Mesh(glowGeo, this.glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.06 + lift;
    this.group.add(ring, glow);
    this.phase = Math.random() * 6;
    this.model = null;
    this.reset();
  }

  setKind(kind) {
    if (this.model) this.group.remove(this.model.group);
    this.kind = kind;
    this.model = createItemModel(kind);
    this.model.group.scale.setScalar(kind === 'cloud' ? 0.8 : kind === 'hedgehog' ? 1.35 : 1.25);
    this.model.group.rotation.y = this.yaw;
    this.group.add(this.model.group);
    this.ringMat.color.set(ITEMS[kind].ring);
    this.glowMat.color.set(ITEMS[kind].ring);
  }

  reset() {
    this.active = true;
    this.timer = 0;
    this.appear = 1;
    this.group.visible = true;
    this.setKind(rollItem());
  }
}

// Every route runs through the same city, so its buildings, ground and water are built once and
// always shown; each route's world only holds what lines that route.
export function getCity() {
  if (city) return city;
  const group = new THREE.Group();
  scene.add(group);
  const scenery = buildCity(group, trackShapes, TRACKS[0]);
  tileUp(group); // before the hills: they cut each tile's piece on its own, a lot less at once
  fitToHills(group);
  packNormals(group); // (after both: a quarter of the memory for the normals)
  return (city = { ...scenery, group, relief: buildRelief(TRACKS[0].map, scenery.ledges) });
}

function getWorld(i) {
  if (worlds[i]) return worlds[i];
  const cfg = TRACKS[i], t = trackShapes[i];
  const group = new THREE.Group();
  group.visible = false;
  // one-way streets: cars along both kerbs, kept clear where something stands across the whole street
  // real streets: openings where side streets come in, and no centre line along one-way stretches
  t.mouths = findMouths(t, cfg.map.roads, cfg.theme.pavement ?? 3.4);
  // bridges: the route climbs over them, and so does anyone riding about
  if (cfg.map.rise && !t.rise) t.setRise(cfg.map.rise);
  if (cfg.map.sett && !t.sett) t.setSett(cfg.map.sett);
  // across a car-free square the road is its stones: no kerbs, no lines, nobody parked
  t.paved ??= t.points.map(p => !!squareAt(p.x, p.z));
  const relief = getCity().relief;
  if (cfg.map.oneway) {
    t.parking = parkingRows(t, cfg.control, cfg.map.oneway, cfg.obstacles.filter(o => !o.lat).map(o => o.at), t.mouths, cfg.map.free);
    t.lineless = t.parking.lineless;
  }
  t.build(group, cfg.theme);
  const arrows = t.mouths ? buildArrows(group, t, t.mouths) : null;
  t.setBanner(t_('banner'), t_('bannerStart'));
  const scenery = buildScenery(group, t, cfg, getCity());
  tileUp(group); // its trees and parked bikes
  const obstacles = cfg.obstacles.map(o => createObstacle(t, o));

  for (const o of obstacles) group.add(o.group);
  const lanes = [-0.65, -0.22, 0.22, 0.65].map(f => f * t.hw);
  const pickups = cfg.pickups.flatMap(f => lanes.map(l => new Pickup(t, group, f, l, cfg.theme.lift)));
  scene.add(group);
  const bikers = cfg.bikers ? new Bikers(group, cfg.bikers) : null;
  // and cyclists about the busy old town (when riding about freely, not in a race)
  const cyclists = BUSY ? new Cyclists(group, cfg.map, BUSY, LOW_POWER ? Math.round(BUSY.cyclists / 3) : BUSY.cyclists, relief) : null;
  const people = walkers(group, t, cfg, relief);
  return (worlds[i] = { i, cfg, group, track: t, scenery, obstacles, pickups, arrows, bikers, cyclists, people, relief, streets: streetGuide(t, cfg) });
}

// People on the pavements: along both sides of the race route, on streets all about, and many more
// in the busy old town (city.js BUSY).
function walkers(group, t, cfg, relief) {
  let seed = cfg.seed;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pav = cfg.theme.pavement ?? 3.4, lift = cfg.theme.lift ?? 0, paths = [];
  for (const side of [1, -1]) {
    const points = [];
    for (let i = 0; i < t.n; i += 6) { const p = t.at(i, side * (t.hw + pav * 0.45)); points.push([p.x, p.z]); }
    paths.push({ points, closed: !t.open, y: lift + 0.012, weight: 12 }); // most people where the race goes by
  }
  const roads = cfg.map.roads.filter(rd => !rd.foot && rd.p.length >= 4);
  for (let k = 0; k < 40 && roads.length; k++) {
    const rd = roads[Math.floor(rand() * roads.length)];
    paths.push({ points: alongside(rd.p, (rand() < 0.5 ? 1 : -1) * (rd.w / 2 + 0.65)), closed: false, y: 0.03 });
  }
  // (a phone over half as many: they are instanced, a few draw calls for all of them, and cost it little)
  const crowd = BUSY ? busyPaths(cfg.map, BUSY, LOW_POWER ? Math.round(BUSY.walkers * 0.55) : BUSY.walkers, rand, MONUMENTS ?? []) : [];
  const busy = crowd.reduce((n, p) => n + p.weight, 0);
  paths.push(...crowd);
  for (const run of RUNS ?? []) paths.push({ points: run.points, closed: true, y: 0.03, runners: run.runners }); // and the runners' laps
  // the people everyone knows, up and down their own street on its outer pavement (away from the
  // other carriageway, where a street has two)
  for (const who of CHARACTERS ?? []) {
    const line = streetLine(cfg.map, who.street, who.near);
    if (!line) continue;
    const points = alongside(who.flip ? line.p.flatMap((_, k, p) => (k % 2 ? [] : [p[p.length - 2 - k], p[p.length - 1 - k]])) : line.p, line.w / 2 + 1.2 - (who.inset ?? 0));
    paths.push({ points, closed: false, y: 0.03, weight: 0, who, stash: who.stash != null ? stashSpot(cfg.map, points, who.stash) : null });
  }
  return new People(group, paths, (cfg.walkers ?? 64) + busy, rand, relief);
}

// Where a character's things go: beside their path, on its left (away from the street), as near as
// can be to `at` (0 to 1) along it where nothing is built: { x, z, yaw }, the pile's +z away from the
// street. Tried every 2 m, nearest first.
function stashSpot(map, points, at) {
  const spots = [];
  for (let k = 1; k < points.length; k++) {
    const [ax, az] = points[k - 1], [bx, bz] = points[k], L = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / L, dz = (bz - az) / L;
    for (let u = 0; u < L; u += 2) spots.push({ x: ax + dx * u - dz * 1.3, z: az + dz * u + dx * 1.3, dx, dz });
  }
  if (!spots.length) return null;
  const near = map.buildings.filter(b => Math.hypot(b.p[0] - spots[0].x, b.p[1] - spots[0].z) < 600);
  // the pile, 1.8 by 1 m, and a step behind it, all clear of the houses
  const clear = ({ x, z, dx, dz }) => [-1, 0, 1].every(a => [-0.5, 0.5, 1.2].every(b => {
    const px = x + dx * a - dz * b, pz = z + dz * a + dx * b;
    return !near.some(h => inPolygon(px, pz, h.p));
  }));
  const k0 = Math.round(at * (spots.length - 1));
  for (let d = 0; d < spots.length; d++) {
    for (const k of [k0 - d, k0 + d]) {
      const sp = spots[k];
      if (sp && clear(sp)) return { x: sp.x, z: sp.z, yaw: Math.atan2(-sp.dz, sp.dx) };
    }
  }
  return null;
}

// the longest run of a named street's pieces joined end to end: { p, w }, or null when there is no such
// street (near [x, z]: the run that comes nearest there instead)
function streetLine(map, name, near) {
  const pieces = map.roads.filter(rd => !rd.foot && map.names[rd.n] === name), runs = [];
  const meets = (p, k, q, j) => Math.hypot(p[k] - q[j], p[k + 1] - q[j + 1]) < 0.5;
  while (pieces.length) {
    const first = pieces.shift();
    let p = first.p;
    for (let grew = true; grew;) {
      grew = false;
      for (let i = 0; i < pieces.length; i++) {
        const q = pieces[i].p;
        if (meets(p, p.length - 2, q, 0)) p = [...p, ...q.slice(2)];
        else if (meets(q, q.length - 2, p, 0)) p = [...q, ...p.slice(2)];
        else continue;
        pieces.splice(i--, 1);
        grew = true;
      }
    }
    let len = 0;
    for (let k = 2; k < p.length; k += 2) len += Math.hypot(p[k] - p[k - 2], p[k + 1] - p[k - 1]);
    runs.push({ p, w: first.w, len });
  }
  if (near) {
    const d = r => Math.min(...r.p.filter((_, k) => k % 2 === 0).map((x, k) => Math.hypot(x - near[0], r.p[2 * k + 1] - near[1])));
    return runs.sort((a, b) => d(a) - d(b))[0] ?? null;
  }
  return runs.sort((a, b) => b.len - a.len)[0] ?? null;
}

// For a route along real streets: which street each sample is on, and the next one coming up.
function streetGuide(t, cfg) {
  const n = t.n, at = new Int16Array(n), next = new Int32Array(n), turn = new Int8Array(n);
  for (let i = 0; i < n; i++) {
    const p = t.points[i];
    let best = 0, bestD = Infinity;
    cfg.control.forEach(([x, z], k) => {
      const d = (x - p.x) ** 2 + (z - p.z) ** 2;
      if (d < bestD) { bestD = d; best = k; }
    });
    at[i] = cfg.map.street[best];
  }
  // walk backwards twice round, remembering where the street last changed (an open route once,
  // and along its last street there is no next one: -1)
  let change = -1;
  for (let k = (t.open ? n : 2 * n) - 1; k >= 0; k--) {
    const i = k % n, j = (i + 1) % n;
    if (at[i] !== at[j] && !(t.open && j === 0)) change = k + 1;
    next[i] = change;
  }
  for (let i = 0; i < n; i++) {
    if (next[i] < 0) continue;
    const c = next[i] % n, look = Math.round(15 / t.spacing);
    const before = t.tangents[t.wrap(c - look)], after = t.tangents[t.wrap(c + look)], left = t.normals[t.wrap(c - look)];
    turn[i] = after.x * left.x + after.z * left.z > 0.3 ? 1 : after.x * left.x + after.z * left.z < -0.3 ? -1 : 0;
  }
  return { names: cfg.map.streets, at, next, turn };
}

function applyTheme(theme) {
  scene.background.set(theme.horizon);
  scene.fog.color.set(theme.horizon);
  [scene.fog.near, scene.fog.far] = theme.fog.map(f => f * SIGHT);
  hemi.color.set(theme.hemi[0]);
  hemi.groundColor.set(theme.hemi[1]);
  hemi.intensity = theme.hemi[2];
  sun.color.set(theme.sun.color);
  sun.intensity = theme.sun.intensity;
  sun.position.set(...theme.sun.pos);
  const [sx, sy] = theme.shadow;
  Object.assign(sun.shadow.camera, { left: -sx, right: sx, top: sy, bottom: -sy, near: 10, far: 600 });
  sun.shadow.camera.updateProjectionMatrix();
}

// The route's theme as the time of day and the weather make it, as numbers and colours that can be
// blended: the light, the sky, the clouds, how dark it is and how hard it rains or snows.
function lookOf(daytime, wx) {
  const theme = atmosphere(world.cfg.theme, daytime, wx), night = isNight(daytime), c = v => new THREE.Color(v);
  return {
    sky: c(theme.sky), horizon: c(theme.horizon), fogNear: theme.fog[0], fogFar: theme.fog[1],
    hemiSky: c(theme.hemi[0]), hemiGround: c(theme.hemi[1]), hemi: theme.hemi[2],
    sunColor: c(theme.sun.color), sun: theme.sun.intensity,
    clouds: c(theme.clouds), cloudColor: c(night ? 0x3a4256 : 0xffffff),
    night: night ? 1 : 0, rain: wx === 'rain' ? 1 : 0, snow: wx === 'snow' ? 1 : 0,
  };
}

const mixLooks = (a, b, k) => Object.fromEntries(Object.entries(a).map(([key, v]) =>
  [key, v.isColor ? v.clone().lerp(b[key], k) : v + (b[key] - v) * k]));

// Put a look on screen. Headlamps and snow on the grass switch halfway through a fade, the street
// lamps fade with it.
let shownLook = null, skyFade = null;
function showLook(L) {
  shownLook = L;
  scene.background.copy(L.horizon);
  scene.fog.color.copy(L.horizon);
  [scene.fog.near, scene.fog.far] = [L.fogNear * SIGHT, L.fogFar * SIGHT];
  hemi.color.copy(L.hemiSky);
  hemi.groundColor.copy(L.hemiGround);
  hemi.intensity = L.hemi;
  sun.color.copy(L.sunColor);
  sun.intensity = L.sun;
  city.paintSky(L.sky, L.horizon);
  city.cloudMat.emissive.copy(L.clouds);
  city.cloudMat.color.copy(L.cloudColor);
  const night = L.night > 0.5;
  snowCover(city.grass, L.snow > 0.5);
  for (const w of worlds) w?.track.setNight(night);
  city.setNight(L.night); // the city's own lamps, coming on and going out as the sky fades
  weather.set(L.rain, L.snow, L.night);
  headlamps.forEach((l, p) => (l.visible = night && p < game.players));
}

// The sky for game.daytime and game.weather, straight away.
export function applySky() {
  applyTheme(atmosphere(world.cfg.theme, game.daytime, game.weather));
  skyFade = null;
  showLook(lookOf(game.daytime, game.weather));
}

// The same, fading over from whatever shows now.
export function fadeSky() {
  if (!shownLook) return applySky();
  skyFade = { from: shownLook, to: lookOf(game.daytime, game.weather), t: 0 };
}

// Every frame, paused or not, so a sky picked in the pause menu fades in behind it.
export function tickFade(dt) {
  if (!skyFade) return;
  const f = skyFade, x = Math.min(1, (f.t += dt) / SKY_FADE);
  showLook(mixLooks(f.from, f.to, x * x * (3 - 2 * x)));
  if (x >= 1) skyFade = null;
}

export function setTrack(i) {
  if (world) world.group.visible = false;
  world = getWorld(i);
  track = world.track;
  world.group.visible = true;
  applySky();
  setupMinimap();
}

// for the other modules, which may read these but not assign them
export function setQuest(v) { quest = v; }
export function setDemo(v) { demo = v; }
