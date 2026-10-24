import * as THREE from 'three';
import { Track } from './track.js';
import { TRACKS } from './tracks.js';
import { createAnimal } from './horse.js';
import { createWalker, createCyclist } from './riders.js';
import { STABLE, MOUNTS, MOUNT_COLORS, PLAYER_COLORS } from './horses.js';
import { LANGS, t, ordinal, local, applyStatic, setLang, getLang } from './i18n.js';

const t_ = t; // plain t is often a track or a time below; t_ always means translate
// a quest's own words (its `text` in the city's quests.js), in the language picked
const qt = (q, key) => local(q.text)[key] ?? q.text.en[key] ?? '';
import { createBunny } from './bunny.js';
import { ITEMS, rollItem, createItemModel, createHedgehog, createCloud, createBolt } from './items.js';
import { createObstacle } from './obstacles.js';
import { buildCity, buildScenery, tourBoat } from './scenery.js';
import { carGroup } from './cars.js';
import { createTumble } from './tumble.js';
import { parkingRows, groundAt, rowAhead, rowEnd, BAND } from './parking.js';
import { findMouths, buildArrows } from './junctions.js';
import { Bikers, Cyclists } from './bikers.js';
import { LOW_POWER, SIGHT } from './device.js';
import { tileUp, lookAround } from './tiles.js';
import { People, alongside, busyPaths } from './people.js';
import { BUSY } from './city.js';
import { buildColliders, collide, inWater, waterLevel, bankAt, streetAt, clearLine, inPolygon } from './collide.js';
import { buildRelief, WADE, WATER } from './relief.js';
import { HILLS, useHills, fitToHills, lookFrom, hillsOn, heightAt, slopeAlong } from './terrain.js';
import { Particles } from './effects.js';
import { sfx, music } from './sound.js';
import { buzz } from './haptics.js';
import { Ambient } from './ambient.js';
import { Quest } from './quests.js';
import { QUESTS, PLACES, SIGHTS, SIGHT_PAGES, THEME, RUNS, CHARACTERS, LANDMARKS, SQUARES, MONUMENTS, FAMOUS, TRAM_STOPS, TOUR, NAME, FREE_START } from './city.js';
import { Tour } from './tour.js';
import { behind } from './tramnet.js';
import { squareAt } from './squares.js';
import { Weather, TIMES, WEATHERS, atmosphere, isNight, snowCover } from './weather.js';

// Every day/night and weather pair, as 'time:weather', and 'auto' for the sky that changes by itself.
// A city may leave some weather out (THEME.weathers: Lecce never sees snow).
const COMBOS = TIMES.flatMap(tm => (THEME.weathers ?? WEATHERS).map(wx => `${tm}:${wx}`));
const SKIES = ['auto', ...COMBOS];
const MENU_SKY_EVERY = 20, RIDE_SKY_EVERY = 120; // seconds between changes: behind the title, and while riding
// While riding on auto the sky goes round: dry day, then rain or snow by day, then the same by night,
// and back to a dry day. A city without rain or snow just stays dry.
const WET = (THEME.weathers ?? WEATHERS).filter(wx => wx !== 'clear');
const SKY_FADE = 8; // seconds one sky takes to fade into the next

// Tick off a step on the loading screen, and give the browser a moment to show it before the
// next busy stretch (the fallback timer covers a hidden tab, where frames never come).
function bootStep(key) {
  window.bootStep?.(key);
  return new Promise(r => { requestAnimationFrame(() => setTimeout(r)); setTimeout(r, 100); });
}

// ------------------------------------------------------------------ tuning

const MAX_SPEED = 30;
const BOAT_SPEED = 14; // in the water you sail a boat of the Bootjes van Gent, slower than on the street
const ACCEL = 17;
const HILL_PULL = 30; // m/s² of speed lost (or gained) per unit of slope, up (or down) a hill
const HILL_SLOW = 4; // and the top speed lost per unit of slope going up: a 10% climb takes 40% off
const BRAKE = 34;
const COAST = 7;
const REVERSE_MAX = 7;
const TURN_RATE = 2.3;
const HORSE_RADIUS = 1.15;
const JUMP_V = 10;
const GRAVITY = 30;
const SPIN_TIME = 1.5;
const REAR_TIME = 0.9;
const STUMBLE_TIME = 0.6;
const STEP_UP = 0.7; // a horse steps up this much without jumping (from bonnet to roof); more and it bumps
const STEP_DOWN = 0.35; // drops bigger than this are a fall, not a step
const SOAK_TIME = 3.5;
const SOAK_SLOW = 0.6;
const MAX_ITEMS = 3;
const PICKUP_RESPAWN = 4;
const MAX_TRAPS = 12;

const SLOTS = 4; // horses per race: the players' picks plus computer riders
const MAX_PLAYERS = 2; // split screen is two side-by-side halves
const AI_SKILL = [0.95, 0.95, 0.96, 0.945];
const GRID_LANES = [-0.24, 0.24, -0.7, 0.7];

const CONTROLS = [
  {
    up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'],
    fire: ['KeyE', 'ShiftLeft', 'KeyQ'], jump: ['Space'],
    label: { ride: 'WASD', jump: 'SPACE', fire: 'E', back: 'S' },
  },
  {
    up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'],
    fire: ['Enter', 'Period'], jump: ['ShiftRight', 'Slash'],
    label: { ride: '↑←↓→', jump: 'R-SHIFT', fire: 'ENTER', back: '↓' },
  },
];
// One player may use either side of the keyboard.
const SOLO = {
  ...Object.fromEntries(['up', 'down', 'left', 'right', 'fire', 'jump'].map(k => [k, [...CONTROLS[0][k], ...CONTROLS[1][k]]])),
  label: { ride: '↑←↓→', jump: 'SPACE', fire: 'ENTER', back: '↓' },
};
const PAN = [-0.55, 0.55];
const GAME_KEYS = new Set(['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Slash', 'Period', 'Quote']);

const hex = c => '#' + c.toString(16).padStart(6, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const approach = (v, t, d) => (v < t ? Math.min(t, v + d) : Math.max(t, v - d));
const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
const rand = (a, b) => a + Math.random() * (b - a);
const fmtTime = s => {
  const m = Math.floor(s / 60), sec = s - m * 60;
  return `${m}:${sec.toFixed(2).padStart(5, '0')}`;
};
const tmp = new THREE.Vector3();
const $ = id => document.getElementById(id);

// ------------------------------------------------------------------ settings

const SETTINGS_KEY = 'ghent3d.settings.v1';
const saved = (() => {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; }
})();

const game = {
  state: 'menu', // menu | briefing (a quest, before you start) | countdown | race | paused | results | tour (flying the tour)
  resumeState: 'race',
  mode: clamp(Math.floor(saved.mode ?? 1), 1, MAX_PLAYERS), // number of human players chosen for races
  players: 1, // humans riding right now
  kind: saved.kind === 'race' ? 'race' : saved.kind === 'tour' && TOUR ? 'tour' : 'mission', // mission: ride about the map, no race, no computer riders; tour: fly through the city
  tourMode: saved.tourMode === 'click' ? 'click' : 'auto', // the tour plays on its own, or waits at each card for a click
  tourSpeed: [1, 1.5, 0.5].includes(saved.tourSpeed) ? saved.tourSpeed : 1, // how fast it plays (the round button by the menu)
  tourMusic: saved.tourMusic ?? true, // the menu's music plays on along the tour (the round button by the speed's)
  // which mission: 0 is exploring freely, after it the quests (QUESTS[mission - 1])
  mission: clamp(Math.floor(saved.mission ?? (saved.kind === 'quest' ? (saved.quest ?? 0) + 1 : 0)), 0, QUESTS.length),
  mounts: [0, 1].map(p => (MOUNTS.includes(saved.mounts?.[p]) ? saved.mounts[p] : 'bike')), // what each player rides, or on foot
  lang: saved.lang === 'nl' ? 'nl' : 'en', // English, unless Dutch was picked
  trackIdx: clamp(Math.floor(saved.track ?? 0), 0, TRACKS.length - 1),
  laps: clamp(Math.floor(saved.laps ?? 3), 1, 9),
  weapons: saved.weapons ?? true, // false = a pure race: no items on the track
  sky: SKIES.includes(saved.sky) ? saved.sky : 'auto', // the pause menu's pick: auto, or one fixed 'time:weather'
  daytime: 'day', // day | night, what the sky shows right now
  weather: 'clear', // clear | rain | snow
  skyTimer: 0, // seconds until the sky changes by itself
  skyStep: 0, // where the ride is in the auto round: 0 dry day, 1 wet day, 2 wet night
  picks: ['hagelslag', 'stroopwafel'].map((d, p) => (STABLE.some(h => h.id === saved.picks?.[p]) ? saved.picks[p] : d)), // the character each player seat has chosen
  playerNames: [0, 1].map(p => (typeof saved.playerNames?.[p] === 'string' ? saved.playerNames[p] : '')), // '' = "Player 1"/"Player 2" in the current language
  time: 0,
  cd: 0,
  cdShown: '',
  raceTime: 0,
  finishCount: 0,
  endTimer: 0,
  resultsAt: 0,
};


function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      mode: game.mode, track: game.trackIdx, laps: game.laps, sound: sfx.musicOn,
      picks: game.picks, playerNames: game.playerNames, weapons: game.weapons, lang: game.lang,
      kind: game.kind, mounts: game.mounts, mission: game.mission, sky: game.sky, tourMode: game.tourMode, tourSpeed: game.tourSpeed, tourMusic: game.tourMusic,
    }));
  } catch { /* private mode: settings just won't stick */ }
}

// ------------------------------------------------------------------ scene

const canvas = $('game');
// Phones and tablets skip the multisampling and draw fewer pixels: both cost a lot of GPU memory.
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !LOW_POWER, stencil: true, powerPreference: 'high-performance' }); // stencil: the holes for the water
renderer.setPixelRatio(Math.min(devicePixelRatio, LOW_POWER ? 1.25 : 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = LOW_POWER ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false; // refreshed once per frame, shared by both viewports
useHills(); // the city's hills, lifted in every shader (js/terrain.js)

const scene = new THREE.Scene();
scene.background = new THREE.Color();
scene.fog = new THREE.Fog(0xffffff, 170, 620);
const hemi = new THREE.HemisphereLight();
scene.add(hemi);
const sun = new THREE.DirectionalLight();
sun.castShadow = true;
sun.shadow.mapSize.setScalar(LOW_POWER ? 1024 : 4096);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

const particles = new Particles(scene, 420);
const weather = new Weather(scene, LOW_POWER);
// at night each player carries a lamp, so the street round them is lit
const headlamps = [0, 1].map(() => {
  const l = new THREE.PointLight(0xffe2b0, 40, 24, 1.6);
  l.visible = false;
  scene.add(l);
  return l;
});

// Each racer's name tag lives on its own layer, so a player never sees their own tag.
const cams = [0, 1].map(p => {
  const cam = new THREE.PerspectiveCamera(68, 1, 0.5, 1300);
  for (let j = 0; j < SLOTS; j++) if (j !== p) cam.layers.enable(1 + j);
  return cam;
});
const menuCam = new THREE.PerspectiveCamera(50, 1, 0.5, 1300);
for (let j = 0; j < SLOTS; j++) menuCam.layers.enable(1 + j);
const camYaw = [0, 0, 0, 0];
const menuLook = new THREE.Vector3();

// ------------------------------------------------------------------ worlds (one per route)

const trackShapes = TRACKS.map(cfg => new Track(cfg));
const roaming = () => game.kind !== 'race'; // every mission rides about freely, exploring or on a quest (and behind the tour's menu, one rider does)
const questing = () => game.kind === 'mission' && game.mission > 0;
const exploring = () => roaming() && !questing();
const touring = () => game.kind === 'tour';
// A sight's own page, where the city has them (SIGHT_PAGES in its city.js: the address the sight's id
// goes after). '' when the city has no such pages.
const sightPage = id => (SIGHT_PAGES ? `${SIGHT_PAGES}${id}/` : '');
const aerial = () => game.state === 'menu' || game.state === 'tour'; // the camera flies over the city, nobody rides it
const KINDS = ['mission', 'race', ...(TOUR ? ['tour'] : [])];
let quest = null; // the quest being played (see js/quests.js)
// What is played, for Google Analytics (the page's gtag; not there on a dev server's copy without it).
const report = (name, params = {}) => window.gtag?.('event', name, { city: location.pathname.split('/')[1], ...params });
const lapsToRide = () => (track.open ? 1 : game.laps); // an open route is ridden once, start to finish
// how far round the race a rider is: laps and a fraction of one, or start to finish on an open route
const progressOf = r => (track.open ? (r.idx - track.start) / (track.finish - track.start) : r.lap + r.idx / track.n);
const worlds = [];
let world = null;
let city = null; // the city all the routes run through, built once (see getCity)
let track = trackShapes[game.trackIdx];

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
function getCity() {
  if (city) return city;
  const group = new THREE.Group();
  scene.add(group);
  const scenery = buildCity(group, trackShapes, TRACKS[0]);
  tileUp(group); // before the hills: they cut each tile's piece on its own, a lot less at once
  fitToHills(group);
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
  const crowd = BUSY ? busyPaths(cfg.map, BUSY, LOW_POWER ? Math.round(BUSY.walkers / 3) : BUSY.walkers, rand, MONUMENTS ?? []) : [];
  const busy = crowd.reduce((n, p) => n + p.weight, 0);
  paths.push(...crowd);
  for (const run of RUNS ?? []) paths.push({ points: run.points, closed: true, y: 0.03, runners: run.runners }); // and the runners' laps
  // the people everyone knows, up and down their own street on its outer pavement (away from the
  // other carriageway, where a street has two)
  for (const who of CHARACTERS ?? []) {
    const line = streetLine(cfg.map, who.street, who.near);
    if (!line) continue;
    const points = alongside(who.flip ? line.p.flatMap((_, k, p) => (k % 2 ? [] : [p[p.length - 2 - k], p[p.length - 1 - k]])) : line.p, line.w / 2 + 1.2);
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
function applySky() {
  applyTheme(atmosphere(world.cfg.theme, game.daytime, game.weather));
  skyFade = null;
  showLook(lookOf(game.daytime, game.weather));
}

// The same, fading over from whatever shows now.
function fadeSky() {
  if (!shownLook) return applySky();
  skyFade = { from: shownLook, to: lookOf(game.daytime, game.weather), t: 0 };
}

// Every frame, paused or not, so a sky picked in the pause menu fades in behind it.
function tickFade(dt) {
  if (!skyFade) return;
  const f = skyFade, x = Math.min(1, (f.t += dt) / SKY_FADE);
  showLook(mixLooks(f.from, f.to, x * x * (3 - 2 * x)));
  if (x >= 1) skyFade = null;
}

function setTrack(i) {
  if (world) world.group.visible = false;
  world = getWorld(i);
  track = world.track;
  world.group.visible = true;
  applySky();
  setupMinimap();
}

// ------------------------------------------------------------------ racers

// What a player is called: the name they typed in the menu, or "Player 1"/"Player 2".
const playerName = p => game.playerNames[p] || t_('player', { n: p + 1 });
// A character on a mount: an animal in the character's colours, or the character on foot or on a bike.
function createRider(h, mount) {
  const def = { ...h, number: STABLE.indexOf(h) + 1, labelLayer: 1 };
  if (mount === 'foot') return createWalker(def, STABLE.indexOf(h));
  if (mount === 'bike') return createCyclist(def, STABLE.indexOf(h));
  return createAnimal({ ...def, species: mount });
}
// one model per character and mount, made when first needed
const riderModels = new Map();
const riderModel = (h, mount) => {
  const key = h.id + ':' + mount;
  if (!riderModels.has(key)) riderModels.set(key, createRider(h, mount));
  return riderModels.get(key);
};

class Racer {
  constructor(i) {
    this.i = i;
    this.human = -1;
    this.skill = AI_SKILL[i];
    this.model = null;
    this.pos = new THREE.Vector3();
  }

  setHorse(h, mount) {
    this.def = h;
    this.model = riderModel(h, mount);
    this.model.label.layers.set(1 + this.i); // this slot's camera never shows its own tag
    scene.add(this.model.root);
    this.refreshName();
  }

  // Players are "Player 1"/"Player 2" or what they typed, the others "Computer 1", "Computer 2"...
  // Only in a two-player game does anyone get a tag over their head: the players, so each sees the other.
  refreshName() {
    this.name = this.rider;
    const tag = this.human >= 0 && game.players > 1;
    this.model.label.visible = tag;
    if (tag) this.model.setName(this.name, PLAYER_COLORS[this.human]);
  }

  get rider() { return this.human >= 0 ? playerName(this.human) : t_('computer', { n: this.i - game.players + 1 }); }

  reset(laneFrac) {
    const lane = laneFrac * track.hw;
    this.idx = track.wrap(track.start - Math.round(7 / track.spacing));
    track.at(this.idx, lane, this.pos);
    this.yaw = track.yawAt(this.idx);
    Object.assign(this, {
      speed: 0, steer: 0, lat: lane, y: 0, vy: 0, base: this.pos.y, baseV: 0, afloat: false,
      lap: 0, bestLap: 0, progress: this.idx / track.n, ground: 0, onRoute: undefined, street: '',
      finished: false, finishTime: 0, place: 0, items: [],
      spinTime: 0, stunTime: 0, rearTime: 0, stumbleTime: 0, soakTime: 0, invuln: 0,
      speedFactor: 1, wallTimer: 0, obstacleCd: 0, wrongWay: 0, dustAcc: 0,
      aiLane: lane, aiLaneTarget: lane, aiLaneTimer: rand(1, 3), aiItemTimer: rand(1, 3), aiHold: 0,
      aiJumpFor: -1, aiJumpOk: true, aiRowFor: -1, aiRoof: 0,
      tram: null, tramSign: null, tramStill: 0, tramQuiet: false,
    });
    this.model.stars.visible = false;
  }

  get fx() { return Math.sin(this.yaw); }
  get fz() { return Math.cos(this.yaw); }
  get grounded() { return this.y <= this.ground + 1e-3 && this.vy <= 0; }
}

const racers = Array.from({ length: SLOTS }, (_, i) => new Racer(i));

// Fill the four slots: the players' own animals first, then random horses for the computer
// (the computer always rides horses, and there are always enough left over).
function assignField() {
  const used = new Set();
  for (let p = 0; p < game.players; p++) {
    let i = Math.max(0, STABLE.findIndex(h => h.id === game.picks[p]));
    while (used.has(STABLE[i].id)) i = (i + 1) % STABLE.length;
    game.picks[p] = STABLE[i].id;
    used.add(game.picks[p]);
  }
  const picks = game.picks.slice(0, game.players).map(id => STABLE.find(h => h.id === id));
  const rest = STABLE.filter(h => !picks.includes(h)).sort(() => Math.random() - 0.5);
  for (const r of racers) if (r.model) scene.remove(r.model.root);
  racers.forEach((r, i) => {
    if (field.includes(r)) r.setHorse(picks[i] ?? rest.shift(), i < game.players ? game.mounts[i] : 'horse'); // the computer rides horses
    else Object.assign(r, { def: null, model: null }); // sits this one out (free roam)
  });
  refreshWho();
}

function refreshWho() {
  humans.forEach((r, p) => {
    huds[p].el.style.setProperty('--c', hex(PLAYER_COLORS[p]));
    huds[p].who.textContent = game.players > 1 ? r.name : ''; // one player needs no name
  });
}
let humans = [racers[0], racers[1]];
let field = racers; // everyone on the course: all four in a race, only the players in free roam
const ctl = p => (game.players === 1 ? SOLO : CONTROLS[p]);

const thrown = []; // bunnies
const traps = []; // hedgehogs
const clouds = []; // rain clouds

function clearEntities() {
  for (const list of [thrown, traps, clouds]) {
    for (const e of list) {
      scene.remove(e.model.group);
      if (e.bolt) scene.remove(e.bolt);
    }
    list.length = 0;
  }
}

// ------------------------------------------------------------------ HUD

const LM_PILL = '<div class="lmp hidden"><span class="lma">➤</span><span class="lme"></span><b></b><small></small></div>';
const huds = [0, 1].map(buildHud);
// the tram card answers a click or a tap: wait for the tram, or get off
huds.forEach((h, p) => h.tram.addEventListener('pointerdown', e => {
  e.stopPropagation();
  if (game.state === 'race') tramAction(humans[p]);
}));
// the sight card: ✕ puts it away until you ride on to another sight; Read more opens the site's page
// about it in a new tab. Neither lets the tap through to the steering under it.
huds.forEach(h => {
  h.sight.addEventListener('pointerdown', e => e.stopPropagation());
  h.sightX.addEventListener('click', () => { h.sightShut = h.sightAt; h.sight.classList.remove('show'); h.el.style.setProperty('--sight-h', '0px'); });
});

function buildHud(p) {
  const el = document.createElement('div');
  el.className = `hud hidden${p % 2 ? ' right' : ''}`;
  el.id = `hud${p}`;
  el.innerHTML = `
    <div class="hud-top">
      <div class="placebox"><div class="place"><span class="n">4</span><span class="suf">th</span></div><div class="who"></div>
</div>
      <div class="stats"><div class="lap"><span class="lapl">LAP</span> <b>1</b><span class="of">/<i>3</i></span></div><div class="time">0:00.00</div></div>
    </div>
    <div class="cd"></div>
    <div class="qnav"><div class="qarrow">➤</div><div class="qinfo"></div></div>
    <div class="msg"></div>
    <div class="alert wrong">WRONG WAY!</div>
    <div class="alert incoming"></div>
    <div class="finished"></div>
    <div class="hud-bottom">
      <div class="items">${'<span class="slot"><span class="ico"></span></span>'.repeat(MAX_ITEMS)}</div>
      <div class="hint"></div>
    </div>
    <div class="flash"></div>
    <div class="lm l">${LM_PILL.repeat(2)}</div><div class="lm r">${LM_PILL.repeat(2)}</div>
    <div class="sight"><button class="sight-x" type="button">✕</button><div class="sight-head"><span class="sight-emoji"></span><div><small></small><b></b></div></div><p></p><a class="chip sight-more" target="_blank" rel="noopener"></a></div>
    <div class="tramcard"><span class="tram-badge"></span><div><small></small><b></b><p></p></div></div>`;
  document.body.appendChild(el);
  // each player's street sign sits in the bar under the minimap
  const street = document.createElement('div');
  street.className = 'street hidden';
  street.style.setProperty('--c', hex(PLAYER_COLORS[p]));
  street.innerHTML = '<div class="now"></div><div class="next"></div>';
  $('streetbar').appendChild(street);
  const q = s => el.querySelector(s);
  return {
    el, who: q('.who'), lapLabel: q('.lapl'), lapOf: q('.lap .of'), place: q('.place'), placeN: q('.place .n'), placeSuf: q('.place .suf'),
    lap: q('.lap b'), laps: q('.lap i'), time: q('.time'), cd: q('.cd'), msg: q('.msg'),
    wrong: q('.wrong'), incoming: q('.incoming'), finished: q('.finished'), hint: q('.hint'),
    items: q('.items'), slots: [...el.querySelectorAll('.slot')], icons: [...el.querySelectorAll('.ico')],
    flash: q('.flash'), qnav: q('.qnav'), qarrow: q('.qarrow'), qinfo: q('.qinfo'), street, streetNow: street.querySelector('.now'), streetNext: street.querySelector('.next'),
    tram: q('.tramcard'), tramBadge: q('.tram-badge'), tramLabel: q('.tramcard small'), tramName: q('.tramcard b'), tramText: q('.tramcard p'),
    sight: q('.sight'), sightEmoji: q('.sight-emoji'), sightLabel: q('.sight small'), sightName: q('.sight b'), sightText: q('.sight p'), sightX: q('.sight-x'), sightMore: q('.sight-more'), sightAt: null, sightShut: null,
    // the pointers to the sights out of view: [left, right], two each
    lm: [...el.querySelectorAll('.lm')].map(c => [...c.querySelectorAll('.lmp')].map(e => ({
      el: e, arrow: e.querySelector('.lma'), emoji: e.querySelector('.lme'), name: e.querySelector('b'), dist: e.querySelector('small'),
    }))),
    lmOut: new Map(), // sight → the side its pointer is on
  };
}

function setText(el, v) {
  v = String(v);
  if (el._v !== v) { el._v = v; el.textContent = v; }
}

function restartAnim(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function hudMsg(p, text, cls = '') {
  if (humans[p]?.finished) return; // the FINISH banner owns the screen now
  const m = huds[p].msg;
  m.textContent = text;
  m.className = 'msg';
  void m.offsetWidth;
  m.className = `msg show ${cls}`;
}

function refreshHints() {
  huds.forEach((h, p) => {
    const k = ctl(p).label;
    h.hint.innerHTML = t_(game.weapons && !roaming() ? 'hint.full' : 'hint.jump', { fire: k.fire, jump: k.jump, back: k.back });
    setText(h.lapLabel, t_(track.open ? 'toGo' : 'lap'));
    h.wrong.textContent = t_('wrongWay');
  });
}

// The sight a rider is at while exploring: the nearest one they are inside of, and the one they are
// already reading until they are a little past its edge, so the card does not flicker at the rim.
function sightAt(r, now) {
  let best = null, bd = Infinity;
  for (const s of SIGHTS) {
    const d = Math.hypot(r.pos.x - s.x, r.pos.z - s.z);
    // a secret one, found, goes before the one it is hidden in
    const by = d - s.r - (s.secret ? 1e4 : 0);
    if (d < s.r + (s === now ? 15 : 0) && by < bd) { best = s; bd = by; }
  }
  return best;
}

function updateSight(h, r) {
  const s = roaming() && !questing() ? sightAt(r, h.sightAt) : null;
  const changed = s !== h.sightAt;
  h.sightAt = s;
  if (s !== h.sightShut) h.sightShut = null; // put away until you leave it: at another sight, it shows again
  const show = !!s && !h.sightShut;
  h.sight.classList.toggle('show', show);
  if (show) {
    const words = local(s.text);
    setText(h.sightEmoji, s.emoji);
    // a secret one is not counted among the others
    const shown = SIGHTS.filter(o => !o.secret);
    setText(h.sightLabel, s.secret ? `🔎 ${t_('sight.secret')}` : `📍 ${t_('sight.label')} ${shown.indexOf(s) + 1}/${shown.length}`);
    setText(h.sightName, words.name);
    setText(h.sightText, words.text);
    const href = s.secret ? '' : sightPage(s.id);
    if (h.sightMore._href !== href) {
      h.sightMore._href = href;
      h.sightMore.hidden = !href;
      if (href) h.sightMore.href = href;
      h.sightX.title = h.sightX.ariaLabel = t_('sight.close');
    }
    setText(h.sightMore, t_('sight.more'));
  }
  // the pointers in the card's corner make room for it
  if (changed) h.el.style.setProperty('--sight-h', show ? `${h.sight.offsetHeight}px` : '0px');
}

// While exploring, the bottom corners point the way to the sights nearby that are out of view: up
// to two on each side, nearest first, on the side you would turn to.
const POINT_NEAR = 600; // game metres
function updatePointers(h, r, p) {
  const cam = cams[p];
  const fov = cam.fov + (cam.aspect < 1 ? (1 - cam.aspect) * 40 : 0); // as render() widens it in portrait
  const half = Math.atan(Math.tan(fov * Math.PI / 360) * cam.aspect);
  const sides = [[], []];
  if (roaming() && !questing() && !r.finished) {
    for (const s of SIGHTS) {
      if (s.secret) continue; // to be found, not pointed to
      const dx = s.x - r.pos.x, dz = s.z - r.pos.z, d = Math.hypot(dx, dz);
      const a = wrapAngle(Math.atan2(dx, dz) - camYaw[p]); // > 0 is to the left
      // out of view a little past the screen's edge, back in view right at it: no flicker at the rim
      const out = s !== h.sightAt && d < POINT_NEAR && Math.abs(a) > half + (h.lmOut.has(s) ? 0 : 0.12);
      if (!out) { h.lmOut.delete(s); continue; }
      // right behind you it keeps the side it was on, until it is clearly on the other one
      const was = h.lmOut.get(s), side = was !== undefined && Math.abs(a) > 2.8 ? was : a > 0 ? 0 : 1;
      h.lmOut.set(s, side);
      sides[side].push({ s, a, d });
    }
  }
  sides.forEach((list, k) => {
    list.sort((x, y) => x.d - y.d);
    h.lm[k].forEach((pt, i) => {
      const it = list[i];
      pt.el.classList.toggle('hidden', !it);
      if (!it) return;
      setText(pt.emoji, it.s.emoji);
      setText(pt.name, local(it.s.text).name);
      setText(pt.dist, `${Math.max(10, Math.round(it.d / 10) * 10)} m`);
      pt.arrow.style.transform = `rotate(${(-it.a * 180 / Math.PI - 90).toFixed(0)}deg)`;
    });
  });
}

function updateHud() {
  const bunnyTargets = new Set(thrown.map(b => b.target));
  const cloudTargets = new Set(clouds.filter(c => c.state === 'fly').map(c => c.target));
  humans.forEach((r, p) => {
    const h = huds[p];
    setText(h.placeN, r.place);
    setText(h.placeSuf, ordinal(r.place));
    h.place.dataset.p = r.place;
    const st = world.streets;
    h.street.classList.toggle('hidden', (!st && !roaming()) || p >= game.players);
    updateSight(h, r);
    updatePointers(h, r, p);
    updateTramCard(h, r, p);
    h.hint.classList.toggle('hidden', riding(r)); // no jumping off a moving tram
    if (roaming()) {
      setText(h.streetNow, r.street || '…');
      setText(h.streetNext, quest ? qt(quest.def, 'hud') : t_('roam.hud'));
      h.streetNext.classList.remove('soon');
    } else if (st) {
      const i = r.idx, last = st.next[i] < 0, ahead = ((last ? track.finish : st.next[i]) - i) * track.spacing;
      setText(h.streetNow, st.names[st.at[i]]);
      const arrow = last ? '🏁' : st.turn[i] > 0 ? '↰' : st.turn[i] < 0 ? '↱' : '↑';
      setText(h.streetNext, `${arrow} ${last ? t_('banner') : st.names[st.at[st.next[i] % track.n]]} · ${Math.max(10, Math.round(Math.max(0, ahead) / 10) * 10)} m`);
      h.streetNext.classList.toggle('soon', ahead < 40);
    }
    setText(h.lapLabel, t_(track.open ? 'toGo' : 'lap'));
    if (track.open) {
      // an open route: how far it is still to the finish
      const left = Math.max(0, track.finish - r.idx) * track.spacing;
      setText(h.lap, r.finished ? '0 m' : left >= 1000 ? `${(left / 1000).toFixed(1)} km` : `${Math.round(left / 10) * 10} m`);
    } else {
      setText(h.lap, clamp(r.lap, 1, game.laps));
      setText(h.laps, game.laps);
    }
    h.lapOf.classList.toggle('hidden', track.open);
    setText(h.time, fmtTime(r.finished ? r.finishTime : game.raceTime));
    if (quest) updateQuestHud(h, r, p);
    h.slots.forEach((s, i) => {
      const kind = r.items[i];
      s.classList.toggle('full', !!kind);
      s.classList.toggle('next', i === 0 && !!kind);
      setText(h.icons[i], kind ? ITEMS[kind].emoji : '');
    });
    h.wrong.classList.toggle('show', r.wrongWay > 0.8 && !r.finished);
    if (p === 0 && touch.on) {
      setText(tItemIco, r.items[0] ? ITEMS[r.items[0]].emoji : '🐰');
      setText(tItemQueue, r.items.slice(1).map(k => ITEMS[k].emoji).join(''));
      tItem.classList.toggle('empty', !r.items.length);
    }
    const warn = r.finished ? '' : cloudTargets.has(r) ? t_('incoming.cloud') : bunnyTargets.has(r) ? t_('incoming.bunny') : '';
    setText(h.incoming, warn);
    h.incoming.classList.toggle('show', !!warn);
  });
}

// A quest's HUD: the time left instead of the time taken, and an arrow to where you have to go.
function updateQuestHud(h, r, p) {
  const left = Math.max(0, quest.def.time - (game.questEnd ?? game.raceTime));
  setText(h.time, '⏱ ' + fmtTime(left).replace(/\.\d+$/, ''));
  h.time.classList.toggle('low', left < 10 && !quest.over);
  const to = quest.target(r);
  h.qnav.classList.toggle('hidden', !to || quest.over);
  if (!to) return;
  // straight up on screen is the way the camera looks
  const a = wrapAngle(Math.atan2(to.x - r.pos.x, to.z - r.pos.z) - camYaw[p]);
  h.qarrow.style.transform = `rotate(${(-a * 180 / Math.PI - 90).toFixed(1)}deg)`;
  const d = Math.hypot(to.x - r.pos.x, to.z - r.pos.z), tally = quest.tally;
  setText(h.qinfo, (tally ? `${quest.def.icon ?? '🎓'} ${tally.got}/${tally.of} · ` : '') + `${Math.round(d)} m`);
}

function updateCountdown() {
  let text = '';
  if (game.state === 'countdown' && game.cd > 0.5) text = String(3 - Math.floor(game.cd - 0.5));
  else if (game.state === 'race' && game.raceTime < 1) text = t_('go');
  if (text === game.cdShown) return;
  game.cdShown = text;
  for (const h of huds) {
    h.cd.textContent = text;
    h.cd.classList.toggle('go', text === t_('go'));
    if (text) restartAnim(h.cd, 'pop');
  }
  if (text) sfx.countdown(text === t_('go'));
}

// Minimap: track drawn once to an offscreen canvas, dots drawn every frame.
const mm = $('minimap');
const mmCtx = mm.getContext('2d');
let MM_W = 220, MM_H = 116;
let mmBase, mmMap, mmDpr;

function outline(g, t, map, width, color) {
  g.beginPath();
  t.points.forEach((p, i) => { const [x, y] = map(p.x, p.z); i ? g.lineTo(x, y) : g.moveTo(x, y); });
  if (!t.open) g.closePath();
  g.lineJoin = 'round';
  g.lineWidth = width;
  g.strokeStyle = color;
  g.stroke();
}

function fitMap(t, w, h, pad) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of t.points) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
  }
  const s = Math.min(w / (maxX - minX + pad * 2), h / (maxZ - minZ + pad * 2));
  const ox = w / 2 - ((minX + maxX) / 2) * s, oz = h / 2 - ((minZ + maxZ) / 2) * s;
  return { s, map: (x, z) => [ox + x * s, oz + z * s], unmap: (px, py) => [(px - ox) / s, (py - oz) / s] };
}

function setupMinimap() {
  const small = innerWidth < 760 || innerHeight < 560;
  [MM_W, MM_H] = small ? [150, 79] : [220, 116];
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

// The race track with the streets round it, fitted into w x h.
function paintTrack(g, w, h) {
  const fit = fitMap(track, w, h, track.hw + 8), { s, map } = fit;
  if (world.cfg.map) {
    g.strokeStyle = '#9a9ca0';
    g.lineCap = g.lineJoin = 'round';
    for (const rd of world.cfg.map.roads) {
      if (rd.foot) continue;
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
let mmRoam = null;
function setupRoamMap() {
  const map = world.cfg.map, k = ROAM_SCALE * mmDpr;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < map.zone.length; i += 2) {
    x0 = Math.min(x0, map.zone[i]); x1 = Math.max(x1, map.zone[i]);
    z0 = Math.min(z0, map.zone[i + 1]); z1 = Math.max(z1, map.zone[i + 1]);
  }
  x0 -= 60; z0 -= 60; x1 += 60; z1 += 60;
  const c = document.createElement('canvas');
  c.width = Math.ceil((x1 - x0) * k);
  c.height = Math.ceil((z1 - z0) * k);
  const g = c.getContext('2d'), P = (x, z) => [(x - x0) * k, (z - z0) * k];
  g.fillStyle = '#6f7275';
  g.fillRect(0, 0, c.width, c.height);
  const poly = (p, fill) => {
    g.beginPath();
    for (let i = 0; i < p.length; i += 2) { const [x, y] = P(p[i], p[i + 1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.closePath();
    g.fillStyle = fill;
    g.fill();
  };
  for (const a of map.areas) poly(a.p, a.k === 'water' ? '#5b7d68' : a.k === 'paved' ? '#8a8c8e' : a.k === 'sand' ? '#e2cf9c' : '#5f8f4a');
  g.lineCap = g.lineJoin = 'round';
  const line = (p, w, color) => {
    g.lineWidth = Math.max(1, w * k);
    g.strokeStyle = color;
    g.beginPath();
    for (let i = 0; i < p.length; i += 2) { const [x, y] = P(p[i], p[i + 1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  };
  for (const w of map.water) line(w.p, w.w, '#5b7d68');
  for (const rd of map.roads) line(rd.p, rd.w, rd.foot ? '#9a9c9e' : '#d8d6d0');
  for (const b of map.buildings) poly(b.p, '#a8836a');
  mmRoam = { c, x0, z0, x1, z1, k };
}

function dot(g, x, z, rad, fill, stroke = null, map = mmMap) {
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

function drawMinimap() {
  const g = mmCtx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, mm.width, mm.height);
  if (mmRoam) {
    // centred on the riders
    const cx = humans.reduce((s, r) => s + r.pos.x, 0) / humans.length, cz = humans.reduce((s, r) => s + r.pos.z, 0) / humans.length;
    const { c, x0, z0, k } = mmRoam;
    g.drawImage(c, (cx - x0) * k - mm.width / 2, (cz - z0) * k - mm.height / 2, mm.width, mm.height, 0, 0, mm.width, mm.height);
    mmMap = (x, z) => [MM_W / 2 + (x - cx) * ROAM_SCALE, MM_H / 2 + (z - cz) * ROAM_SCALE];
  } else {
    g.drawImage(mmBase, 0, 0);
  }
  g.setTransform(mmDpr, 0, 0, mmDpr, 0, 0);
  drawMarks(g, mmMap);
}

// Everybody and everything that moves, as dots on a map.
function drawMarks(g, map) {
  for (const b of thrown) dot(g, b.x, b.z, 2.2, '#fff', null, map);
  for (const t of traps) dot(g, t.x, t.z, 2.4, '#6d4c33', null, map);
  for (const b of world.bikers?.list ?? []) {
    const p = track.at(b.idx, b.lat);
    dot(g, p.x, p.z, 2.2, '#40c4ff', null, map);
  }
  const drawOrder = [...field].sort((a, b) => (a.human >= 0) - (b.human >= 0));
  for (const r of drawOrder) {
    const [x, y] = dot(g, r.pos.x, r.pos.z, r.human >= 0 ? 6.5 : 4.5, hex(r.human >= 0 ? PLAYER_COLORS[r.human] : r.def.silk), '#1d1a17', map);
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

// The big map: click the minimap to see the whole map, click a spot on it to teleport there.
const bigEl = $('bigmap'), bigCv = $('bigCanvas'), bigCtx = bigCv.getContext('2d'), bigAsk = $('bigAsk');
let big = null; // { w, h, map, unmap, pick, labels, tab }


function openBigMap() {
  if (game.state !== 'race' && game.state !== 'countdown') return;
  setPaused(true, false);
  bigEl.classList.remove('hidden');
  bigEl.classList.toggle('side', sideIndex());
  layoutBigMap();
  showBigTab(big.tab);
}

function closeBigMap() {
  if (!big) return;
  big = null;
  bigEl.classList.add('hidden');
  bigAsk.classList.add('hidden');
}

// On a wide screen, riding about freely, the places index stands beside the map instead of on a tab.
const INDEX_W = 300;
const sideIndex = () => roaming() && !questing() && innerWidth >= 760;

function layoutBigMap() {
  const maxW = innerWidth - 32 - (sideIndex() ? INDEX_W + 12 : 0), maxH = innerHeight - 110, dpr = Math.min(devicePixelRatio, 2);
  const pick = big?.pick ?? null, tab = big?.tab ?? 'map';
  let w, h, map, unmap, paint;
  if (mmRoam) {
    const { c, x0, z0, x1, z1 } = mmRoam, s = Math.min(maxW / (x1 - x0), maxH / (z1 - z0));
    w = (x1 - x0) * s;
    h = (z1 - z0) * s;
    map = (x, z) => [(x - x0) * s, (z - z0) * s];
    unmap = (px, py) => [x0 + px / s, z0 + py / s];
    paint = g => g.drawImage(c, 0, 0, w, h);
  } else {
    // as big as fits, in the shape of the track
    const pad = track.hw + 8, xs = track.points.map(p => p.x), zs = track.points.map(p => p.z);
    const bw = Math.max(...xs) - Math.min(...xs) + pad * 2, bh = Math.max(...zs) - Math.min(...zs) + pad * 2;
    const s = Math.min(maxW / bw, maxH / bh);
    w = bw * s;
    h = bh * s;
    ({ map, unmap } = fitMap(track, w, h, pad));
    paint = g => paintTrack(g, w, h);
  }
  bigCv.width = Math.round(w * dpr);
  bigCv.height = Math.round(h * dpr);
  bigCv.style.width = w + 'px';
  bigCv.style.height = h + 'px';
  bigIndex.style.height = sideIndex() ? h + 'px' : '';
  const base = document.createElement('canvas');
  base.width = bigCv.width;
  base.height = bigCv.height;
  const g = base.getContext('2d');
  g.scale(dpr, dpr);
  paint(g);
  big = { ...big, w, h, dpr, base, map, unmap, pick, tab };
  drawBigMap();
}

function drawBigMap() {
  const g = bigCtx, { base, dpr, map, pick } = big;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, bigCv.width, bigCv.height);
  g.drawImage(base, 0, 0);
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
  bigAsk.style.top = (r.top - box.top + py + (py > big.h - 90 ? -70 : 18)) + 'px';
}

// The named places as dots with their names, returning where each name sits so a click can find it.
function drawPlaces(g, map) {
  g.font = '900 13px Nunito, system-ui, sans-serif';
  g.textBaseline = 'middle';
  g.lineJoin = 'round';
  return PLACES.map(pl => {
    const [px, py] = dot(g, pl.x, pl.z, 4, '#ffd640', '#1d1a17', map);
    const w = g.measureText(pl.name).width, tx = pl.side === 'l' ? px - 8 - w : px + 8;
    g.lineWidth = 4;
    g.strokeStyle = '#1d1a17';
    g.strokeText(pl.name, tx, py);
    g.fillStyle = '#fffaf0';
    g.fillText(pl.name, tx, py);
    return { pl, x0: Math.min(tx, px - 8), x1: Math.max(tx + w, px + 8), y0: py - 10, y1: py + 10 };
  });
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
  const w = g.measureText(it.name).width, tx = px + 20 + w > big.w ? px - 20 - w : px + 20;
  g.lineWidth = 5;
  g.strokeStyle = ink;
  g.strokeText(it.name, tx, py);
  g.fillStyle = glow;
  g.fillText(it.name, tx, py);
  g.restore();
}

// Landing at a named place: on the nearest bit of road you can stand on, so never inside the
// building itself (some paths run straight through a castle or a station).
function placeLanding(pl) {
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
function landingAt(x, z) {
  if (!roaming()) {
    const idx = track.nearest(x, z), lat = clamp(track.lateral(x, z, idx), -track.railLimit, track.railLimit);
    const p = track.at(idx, lat);
    return { x: p.x, z: p.z, idx, lat, ok: true };
  }
  const map = world.cfg.map;
  const ok = inPolygon(x, z, map.zone) && !map.buildings.some(b => inPolygon(x, z, b.p));
  return { x, z, ok };
}

function teleport(pick) {
  humans.forEach((r, p) => {
    r.tram = null; // off the tram, or no longer waiting for one
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

mm.addEventListener('pointerdown', e => {
  e.stopPropagation();
  openBigMap();
});
bigCv.addEventListener('pointerdown', e => {
  e.stopPropagation();
  if (questing()) return; // a look at the map, but no teleporting your way through a quest
  const r = bigCv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
  const label = big.labels.find(l => px >= l.x0 && px <= l.x1 && py >= l.y0 && py <= l.y1);
  const [x, z] = big.unmap(px, py);
  big.pick = label ? placeLanding(label.pl) : landingAt(x, z);
  drawBigMap();
});
bigEl.addEventListener('pointerdown', e => { if (e.target === bigEl) closeBigMapAndPlay(); });
$('bigYes').addEventListener('click', () => confirmTeleport());
$('bigNo').addEventListener('click', () => { big.pick = null; drawBigMap(); });
$('bigClose').addEventListener('click', () => closeBigMapAndPlay());

// ------------------------------------------------------------------ the places index

// The big map's second tab when riding about freely: every place of note and every street, in
// alphabetical lists to look a name up in, and a click on one shows it on the map and asks to teleport there.
const bigIndex = $('bigIndex'), bigSearch = $('bigSearch'), bigList = $('bigList');
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
  return [
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

function showBigTab(tab) {
  const side = sideIndex(), index = side || (tab === 'index' && roaming() && !questing());
  big.tab = index && !side ? 'index' : 'map';
  $('bigTabs').classList.toggle('hidden', !roaming() || questing()); // a race or a quest: just the map
  $('bigTabMap').classList.toggle('on', !index);
  $('bigTabIndex').classList.toggle('on', index);
  bigCv.classList.toggle('hidden', index && !side);
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
function pickEntry(i) {
  const pick = i && placeLanding(i);
  if (!pick?.ok) return;
  if (!sideIndex()) showBigTab('map');
  big.pick = pick;
  drawBigMap();
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
  if (b) pickEntry(big.found[+b.dataset.k]);
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

function confirmTeleport() {
  if (!big?.pick?.ok) return;
  const pick = big.pick;
  closeBigMapAndPlay();
  teleport(pick);
}

function closeBigMapAndPlay() {
  closeBigMap();
  setPaused(false);
}

// ------------------------------------------------------------------ menu

const menuEl = $('menu'), pauseEl = $('pause'), resultsEl = $('results'), briefEl = $('brief');
const menuRows = () => touring() ? ['kind', 'tour', 'audio', 'lang', 'start'] : ['mode', 'kind', ...(roaming() ? [] : [...(TRACKS[game.trackIdx].open ? [] : ['laps']), 'weapons']), ...(roaming() ? ['quest'] : []), 'ride', 'animals', ...(roaming() ? [] : ['track']), 'audio', 'lang', 'start'];
// The arrows only go from Missions / Race / Tour to the missions, the routes or the ways to take the
// tour, and on to the start button; everything else on the menu is for the mouse.
const navRows = () => ['kind', touring() ? 'tour' : roaming() ? 'quest' : 'track', 'start'];
let menuRow = 0;
const focusRow = name => { const i = navRows().indexOf(name); if (i >= 0) menuRow = i; };
const thumbs = new Map(); // character and mount -> portrait
const THUMB_SCALE = { bike: 1.55, foot: 1.65 }; // in the picker, as tall as a rider on a horse
let studio = null;

// A portrait for the character picker, rendered from its real 3D model (a fresh one, so the model
// riding about in the scene stays where it is).
function thumbOf(h, mount) {
  const key = h.id + ':' + mount;
  if (thumbs.has(key)) return thumbs.get(key);
  const W = 240, H = 180;
  if (!studio) {
    const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4 });
    rt.texture.colorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a68, 1.7));
    const light = new THREE.DirectionalLight(0xffffff, 2.2);
    light.position.set(3, 5, 4);
    scene.add(light);
    const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 50);
    cam.position.set(5.2, 2.7, 4.6);
    cam.lookAt(0, 1.6, 0.25);
    studio = { rt, scene, cam, buf: new Uint8Array(W * H * 4) };
  }
  const m = createRider(h, mount);
  m.root.scale.setScalar(THUMB_SCALE[mount] ?? 1);
  m.animate(0, 0, 0, 0);
  studio.scene.add(m.root);
  const clear = renderer.getClearColor(new THREE.Color()), alpha = renderer.getClearAlpha();
  renderer.setScissorTest(false);
  renderer.setClearColor(0x000000, 0);
  renderer.setRenderTarget(studio.rt);
  renderer.clear();
  hillsOn(false);
  renderer.render(studio.scene, studio.cam);
  hillsOn(true);
  renderer.readRenderTargetPixels(studio.rt, 0, 0, W, H, studio.buf);
  renderer.setRenderTarget(null);
  renderer.setClearColor(clear, alpha);
  studio.scene.remove(m.root);
  m.root.traverse(o => { o.geometry?.dispose(); for (const x of [o.material].flat()) { x?.map?.dispose(); x?.dispose(); } });
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d'), img = g.createImageData(W, H);
  for (let y = 0; y < H; y++) img.data.set(studio.buf.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
  g.putImageData(img, 0, 0);
  thumbs.set(key, c.toDataURL());
  return thumbs.get(key);
}

// One card per route.
function buildTrackCards() {
  const wrap = $('trackCards');
  wrap.innerHTML = TRACKS.map((tr, i) => `
    <button class="tcard" data-i="${i}">
      <canvas width="240" height="120"></canvas>
      <b></b><small></small>
    </button>`).join('');
  wrap.querySelectorAll('.tcard[data-i]').forEach((card, i) => {
    const c = card.querySelector('canvas'), g = c.getContext('2d');
    const tr = trackShapes[i], { s, map } = fitMap(tr, 120, 60, tr.hw + 4);
    g.scale(2, 2);
    outline(g, tr, map, tr.hw * 2 * s + 3, '#1d1a17');
    outline(g, tr, map, tr.hw * 2 * s, TRACKS[i].theme.dirt);
    card.addEventListener('click', e => {
      card.blur();
      focusRow('track');
      selectTrack(i);
    });
  });
}

// One card per mission: exploring freely first, then the quests.
function buildQuestCards() {
  const wrap = $('questCards');
  wrap.innerHTML = ['🗺️', ...QUESTS.map(q => q.emoji)].map((emoji, i) => `<button class="qcard" data-i="${i}"><span class="qemoji">${emoji}</span><b></b><small></small></button>`).join('');
  wrap.querySelectorAll('.qcard').forEach((card, i) => card.addEventListener('click', () => {
    card.blur();
    focusRow('quest');
    selectMission(i);
  }));
}

// The tour's two cards: it plays on its own, or waits at each stop until you click on.
const TOUR_MODES = ['auto', 'click'];
function buildTourCards() {
  const wrap = $('tourCards');
  wrap.innerHTML = TOUR_MODES.map(m => `<button class="qcard" data-m="${m}"><span class="qemoji">${m === 'auto' ? '🎬' : '👆'}</span><b></b><small></small></button>`).join('');
  wrap.querySelectorAll('.qcard').forEach(card => card.addEventListener('click', () => {
    card.blur();
    focusRow('tour');
    setTourMode(card.dataset.m);
  }));
}

function setTourMode(m) {
  game.tourMode = m;
  sfx.ui();
  saveSettings();
  renderMenu();
}

function buildMenu() {
  buildTrackCards();
  buildQuestCards();
  buildTourCards();
  $('kindOpts').querySelector('[data-k="tour"]').classList.toggle('hidden', !TOUR); // a city without a tour

  // One column per player seat, in that player's colour.
  $('playerCols').innerHTML = [0, 1].map(p => `
    <div class="pcol" data-p="${p}" style="--c:${hex(PLAYER_COLORS[p])}">
      <div class="phead"><span></span><input maxlength="12" spellcheck="false" autocomplete="off" enterkeyhint="done"></div>
      <div class="ppick" data-row="ride"><button class="arrow" data-m="-1">‹</button><img alt=""><button class="arrow" data-m="1">›</button></div>
      <div class="pmount" data-row="ride"><button class="arrow" data-m="-1">‹</button><b></b><button class="arrow" data-m="1">›</button></div>
      <div class="pcolor" data-row="animals"><button class="arrow" data-d="-1">‹</button><b><span class="dot"></span><i></i></b><button class="arrow" data-d="1">›</button></div>
      <div class="pkeys"></div>
    </div>`).join('');
  document.querySelectorAll('.pcol[data-p]').forEach(col => {
    const p = Number(col.dataset.p), input = col.querySelector('input');
    // the arrows beside the picture change what you are, the ones below it your colours
    col.querySelectorAll('.ppick .arrow').forEach(b => b.addEventListener('click', () => cycleMount(p, Number(b.dataset.m))));
    col.querySelectorAll('.pmount .arrow').forEach(b => b.addEventListener('click', () => cycleMount(p, Number(b.dataset.m), PHONE_MOUNTS)));
    col.querySelectorAll('.pcolor .arrow').forEach(b => b.addEventListener('click', () => cycleAnimal(p, Number(b.dataset.d))));
    col.querySelector('img').addEventListener('click', () => cycleMount(p, 1));
    input.addEventListener('input', () => renamePlayer(p, input.value));
    input.addEventListener('change', () => { renamePlayer(p, input.value); renderMenu(); });
    input.addEventListener('focus', () => renderMenu());
  });

  $('skySelect').innerHTML = SKIES.map(v => `<option value="${v}"></option>`).join('');
  $('skySelect').addEventListener('change', e => pickSky(e.target.value));
  // Language: a dropdown, only the current one shows until it is clicked or tapped.
  $('langList').innerHTML = Object.entries(LANGS).map(([code, label]) => `<button class="chip" role="option" data-lang="${code}">${label}</button>`).join('');
  $('langBtn').addEventListener('click', () => openLangList($('langList').classList.contains('hidden')));
  document.querySelectorAll('#langList button').forEach(b => b.addEventListener('click', () => { openLangList(false); setLanguage(b.dataset.lang); }));
  document.addEventListener('pointerdown', e => { if (!$('langOpts').contains(e.target)) openLangList(false); });
  document.querySelectorAll('#modeOpts button').forEach(b => b.addEventListener('click', () => {
    setMode(Number(b.dataset.v));
  }));
  document.querySelectorAll('.laps .arrow').forEach(b => b.addEventListener('click', () => setLaps(game.laps + Number(b.dataset.d))));
  document.querySelectorAll('#kindOpts button').forEach(b => b.addEventListener('click', () => {
    focusRow('kind');
    setKind(b.dataset.k);
  }));
  document.querySelectorAll('#weaponOpts button').forEach(b => b.addEventListener('click', () => setWeapons(b.dataset.w === '1')));
  $('soundBtn').addEventListener('click', () => toggleSound());
  $('startBtn').addEventListener('click', () => startRace());
  $('briefBtn').addEventListener('click', () => beginQuest());
  $('briefMenuBtn').addEventListener('click', () => toMenu());
  $('tourNext').addEventListener('click', () => tourNext());
  $('tourMenu').addEventListener('click', () => toMenu());
  // the pause menu first: from there "back to menu" leaves the race
  $('menuBtn').addEventListener('click', () => (game.state === 'race' || game.state === 'countdown' || game.state === 'paused') ? setPaused(true) : toMenu());
  $('resumeBtn').addEventListener('click', () => setPaused(false));
  $('restartBtn').addEventListener('click', () => startRace());
  $('pauseTitleBtn').addEventListener('click', () => toMenu());
  $('pauseSoundBtn').addEventListener('click', () => toggleSound());
  // the big map, as the minimap opens it: out of the pause menu and straight onto the map
  $('pauseMapBtn').addEventListener('click', () => {
    if (game.state !== 'paused') return;
    setPaused(false);
    openBigMap();
  });
  $('againBtn').addEventListener('click', () => { if (game.time - game.resultsAt > 0.8) startRace(); });
  $('resultsTitleBtn').addEventListener('click', () => toMenu());
  // Never leave a clicked button focused, or Space/Enter would press it again mid-race.
  document.querySelectorAll('button').forEach(b => b.addEventListener('click', () => b.blur()));
}

const pickOf = p => STABLE.find(h => h.id === game.picks[p]);

function pickAnimal(p, id) {
  const other = game.picks.findIndex((q, i) => i !== p && i < game.players && q === id);
  if (other >= 0) game.picks[other] = game.picks[p]; // taking someone's animal swaps the two
  game.picks[p] = id;
  assignField();
  if (game.state === 'menu') resetRace();
  sfx.ui();
  saveSettings();
  renderMenu();
}

function cycleAnimal(p, d) {
  const taken = new Set(game.picks.filter((q, i) => i !== p && i < game.players));
  let i = STABLE.indexOf(pickOf(p));
  do i = (i + d + STABLE.length) % STABLE.length; while (taken.has(STABLE[i].id));
  pickAnimal(p, STABLE[i].id);
}

function renamePlayer(p, text) {
  const name = text.replace(/[^\p{L}\p{N} '\-]/gu, '').trim().slice(0, 12);
  game.playerNames[p] = name === t_('player', { n: p + 1 }) ? '' : name;
  field.forEach(r => r.refreshName());
  refreshWho();
  saveSettings();
}

// The keys under a player's card: steering, jumping, and items when there are any.
function keyLine(p) {
  const k = ctl(p).label;
  const item = game.weapons && !roaming() ? ` · <kbd>${k.fire}</kbd> ${t_('key.item')}` : '';
  const pad = game.players > 1 ? ` · <span class="pad">🎮${p + 1}</span>` : '';
  return `<kbd>${k.ride}</kbd> · <kbd>${k.jump}</kbd> ${t_('key.jump')}${item}${pad}`;
}

function renderMenu() {
  const rows = menuRows(), nav = navRows();
  menuRow = clamp(menuRow, 0, nav.length - 1);
  document.querySelectorAll('#menu [data-row]').forEach(el => {
    el.classList.toggle('focus', el.dataset.row === nav[menuRow]);
    el.classList.toggle('hidden', !rows.includes(el.dataset.row));
  });
  document.querySelectorAll('#modeOpts button').forEach(b => {
    const n = Number(b.dataset.v);
    b.textContent = n === 1 ? t_('players1') : t_('playersN', { n });
    b.classList.toggle('on', n === game.mode);
  });
  document.querySelectorAll('#weaponOpts button').forEach(b => b.classList.toggle('on', (b.dataset.w === '1') === game.weapons));
  document.querySelectorAll('#kindOpts button').forEach(b => b.classList.toggle('on', b.dataset.k === game.kind));
  document.body.classList.toggle('noweapons', !game.weapons || roaming());
  document.querySelectorAll('.tcard[data-i]').forEach((c, i) => {
    const cfg = TRACKS[i];
    c.classList.toggle('on', i === game.trackIdx);
    c.querySelector('b').textContent = local(cfg.name);
    c.querySelector('small').textContent = `${t_('level.' + cfg.level)} · ${Math.round(trackShapes[i].length)} m`;
  });
  $('trackLabel').textContent = t_('row.track');
  document.querySelectorAll('.qcard[data-i]').forEach((c, i) => {
    const q = QUESTS[i - 1];
    c.classList.toggle('on', i === game.mission);
    c.querySelector('b').textContent = q ? qt(q, 'title') : t_('mission.free');
    c.querySelector('small').textContent = q ? '⏱ ' + fmtTime(q.time).replace(/\.\d+$/, '') : t_('mission.freeTime');
  });
  document.querySelectorAll('#tourCards .qcard').forEach(c => {
    c.classList.toggle('on', c.dataset.m === game.tourMode);
    c.querySelector('b').textContent = t_('tour.' + c.dataset.m);
    c.querySelector('small').textContent = t_('tour.' + c.dataset.m + 'Sub');
  });
  $('langBtn').textContent = LANGS[getLang()] + ' ▾';
  document.querySelectorAll('#langList button').forEach(b => b.classList.toggle('on', b.dataset.lang === getLang()));
  $('skySelect').querySelectorAll('option').forEach(o => {
    const [tm, wx] = o.value.split(':');
    o.textContent = o.value === 'auto' ? t_('sky.auto') : `${t_('time.' + tm)} · ${t_('wx.' + wx)}`;
  });
  $('skySelect').value = game.sky;
  document.querySelectorAll('.pcol[data-p]').forEach(col => {
    const p = Number(col.dataset.p), input = col.querySelector('input');
    col.classList.toggle('hidden', p >= game.players);
    // one player needs no name; two can each type theirs into their card's header
    col.querySelector('.phead span').textContent = game.players > 1 ? '✏️' : t_('solo');
    input.classList.toggle('hidden', game.players === 1);
    if (document.activeElement !== input) input.value = playerName(p);
    input.placeholder = t_('player', { n: p + 1 });
    input.title = t_('rename');
    const h = pickOf(p), mount = game.mounts[p];
    col.querySelector('img').src = thumbOf(h, mount);
    col.querySelector('img').title = t_('mount.' + mount);
    col.querySelector('.pmount b').textContent = t_('mount.' + mount);
    col.querySelector('.pcolor .dot').style.background = hex(h.silk);
    col.querySelector('.pcolor i').textContent = t_('color');
    col.querySelector('.pkeys').innerHTML = keyLine(p);
  });
  $('playerCols').dataset.n = game.players;
  $('lapCount').textContent = game.laps === 1 ? t_('laps1') : t_('lapsN', { n: game.laps });
  ['soundBtn', 'pauseSoundBtn'].forEach(id => {
    $(id).textContent = t_(sfx.sfxOn ? 'sound.on' : 'sound.off');
    $(id).classList.toggle('on', sfx.sfxOn);
  });
  $('startBtn').textContent = t_((touch.on ? 'start.tap' : 'start.keys') + (touring() ? 'Tour' : questing() ? 'Quest' : roaming() ? 'Roam' : ''));
}

function openLangList(open) {
  $('langList').classList.toggle('hidden', !open);
  $('langBtn').setAttribute('aria-expanded', String(open));
}

function setLanguage(code) {
  setLang(code);
  game.lang = getLang();
  applyStatic();
  for (const w of worlds) w?.track.setBanner(t_('banner'), t_('bannerStart'));
  field.forEach(r => r.def && r.refreshName());
  refreshWho();
  refreshHints();
  saveSettings();
  renderMenu();
  showAudioBadge();
}

function setSky(combo, fade = true) {
  [game.daytime, game.weather] = combo.split(':');
  if (fade) fadeSky();
  else applySky();
}

// A different sky than the one showing, at random.
function rollSky(every, fade = true) {
  const others = COMBOS.filter(c => c !== `${game.daytime}:${game.weather}`);
  setSky(others[Math.floor(Math.random() * others.length)], fade);
  game.skyTimer = every;
}

// The pause menu's dropdown: auto, or one sky that stays.
function pickSky(v) {
  game.sky = v;
  if (v === 'auto') rideSky(0);
  else setSky(v);
  sfx.ui();
  saveSettings();
  renderMenu();
}

// A ride starts dry and sunny on auto, or on the fixed sky; the title screen just keeps changing.
// Either way the first sky is there straight away, the later ones fade in.
function startSky() {
  if (game.state === 'menu') return rollSky(MENU_SKY_EVERY, false);
  if (game.state === 'tour') return setSky(COMBOS.includes('night:snow') ? 'night:snow' : 'night:clear', false); // and fades into the day as the tour sets off (updateTour)
  if (game.sky === 'auto') return rideSky(0, false);
  setSky(game.sky, false);
}

// One step of the auto round while riding. Rain or snow is picked as the day turns wet, and the
// night keeps it.
function rideSky(step, fade = true) {
  game.skyStep = step;
  const wx = step === 0 || !WET.length ? 'clear'
    : step === 1 ? WET[Math.floor(Math.random() * WET.length)]
    : game.weather;
  setSky(`${step === 2 ? 'night' : 'day'}:${wx}`, fade);
  game.skyTimer = RIDE_SKY_EVERY;
}

function tickSky(dt) {
  if ((game.state !== 'menu' && game.sky !== 'auto') || game.state === 'tour') return;
  if ((game.skyTimer -= dt) > 0) return;
  if (game.state === 'menu') rollSky(MENU_SKY_EVERY);
  else rideSky((game.skyStep + 1) % 3);
}

function setWeapons(on) {
  game.weapons = on;
  if (game.state === 'menu') resetRace();
  sfx.ui();
  saveSettings();
  renderMenu();
}

function setMode(m) {
  game.mode = clamp(m, 1, touch.on ? 1 : MAX_PLAYERS);
  applyMode();
  assignField();
  if (game.state === 'menu') resetRace();
  sfx.ui();
  saveSettings();
  renderMenu();
}

function applyMode() {
  game.players = game.mode;
  racers.forEach((r, i) => { r.human = i < game.players ? i : -1; });
  humans = racers.slice(0, game.players);
  field = roaming() ? humans : racers;
  document.body.classList.toggle('solo', game.players === 1);
  document.body.classList.toggle('roaming', roaming());
  document.body.classList.toggle('questing', questing());
  document.body.classList.toggle('touring', touring());
  refreshHints();
}

function setKind(kind) {
  game.kind = kind;
  if (roaming()) missionPlayer();
  applyMode();
  setTrack(game.trackIdx);
  assignField();
  resetRace();
  menuLook.set(racers[0].pos.x, 1.5, racers[0].pos.z);
  sfx.ui();
  saveSettings();
  renderMenu();
}

// What a player rides: any animal, or on foot, or on a bike. They are all equally fast.
// A phone's narrow picker only offers the three the missions use.
const PHONE_MOUNTS = ['foot', 'bike', 'horse'];
function cycleMount(p, d, list = MOUNTS) {
  const i = list.indexOf(game.mounts[p]);
  game.mounts[p] = list[i < 0 ? 0 : (i + d + list.length) % list.length];
  const colors = MOUNT_COLORS[game.mounts[p]]; // unless the other player already has them
  if (colors && !game.picks.some((q, i) => i !== p && i < game.players && q === colors)) game.picks[p] = colors;
  assignField();
  resetRace();
  sfx.ui();
  saveSettings();
  renderMenu();
}

// Each mission has player 1 start out as someone: free exploring on a red horse, the quests as their
// city's quests.js says. Picking a mission puts that back, whatever was chosen for the one before.
const FREE_PLAYER = { mount: 'horse', pick: 'hagelslag' };
function missionPlayer() {
  const { mount, pick } = QUESTS[game.mission - 1]?.player ?? FREE_PLAYER;
  game.mounts[0] = mount;
  const other = game.picks.indexOf(pick, 1);
  if (other > 0) game.picks[other] = game.picks[0]; // player 2 had those colours: the two swap
  game.picks[0] = pick;
}

function selectMission(i) {
  const n = QUESTS.length + 1;
  game.mission = ((i % n) + n) % n;
  missionPlayer();
  applyMode();
  assignField();
  resetRace();
  menuLook.set(racers[0].pos.x, 1.5, racers[0].pos.z);
  sfx.ui();
  saveSettings();
  renderMenu();
}

function selectTrack(i) {
  const n = TRACKS.length;
  game.trackIdx = ((i % n) + n) % n;
  setTrack(game.trackIdx);
  resetRace();
  menuLook.set(racers[0].pos.x, 1.5, racers[0].pos.z);
  sfx.ui();
  saveSettings();
  renderMenu();
}

function setLaps(n) {
  game.laps = clamp(n, 1, 9);
  sfx.ui();
  saveSettings();
  renderMenu();
}

// One switch for music and effects together.
function toggleSound() {
  sfx.unlock();
  const on = !sfx.sfxOn;
  sfx.setMusic(on);
  sfx.sfxOn = on;
  sfx.ui();
  saveSettings();
  renderMenu();
  showAudioBadge();
}

function showAudioBadge() {
  $('mute').textContent = t_('mute');
  $('mute').classList.toggle('hidden', sfx.sfxOn || game.state === 'menu');
}

// ------------------------------------------------------------------ race flow

function showRaceChrome(on) {
  huds.forEach((h, p) => h.el.classList.toggle('hidden', !on || p >= game.players));
  $('divider').classList.toggle('hidden', !on || game.players < 2);
  $('menuBtn').classList.toggle('hidden', !on);
  $('streetbar').classList.toggle('hidden', !on);
  $('streetbar').classList.toggle('duo', game.players > 1);
  huds.forEach((h, p) => { if (p >= game.players) h.street.classList.add('hidden'); }); // updateHud only visits the players in play
  mm.classList.toggle('hidden', !on);
}

function resetRace() {
  clearEntities();
  world.pickups.forEach(p => { p.reset(); p.group.visible = game.weapons && !roaming(); });
  world.arrows?.show(!roaming());
  if (track.gate) track.gate.visible = !roaming(); // free roam has no start or finish
  for (const ob of world.obstacles) ob.group.visible = !roaming(); // nor anything to jump over
  if (roaming() && !world.colliders) world.colliders = buildColliders(world.cfg.map, track.parkedCars ?? [], getCity().posts);
  field.forEach((r, i) => r.reset(GRID_LANES[i]));
  quest?.dispose();
  quest = null;
  if (questing()) {
    quest = new Quest(QUESTS[game.mission - 1], { scene, map: world.cfg.map, colliders: world.colliders, relief: world.relief, particles });
    placeRiders(quest.spawn);
  } else if (roaming() && FREE_START) {
    // exploring freely starts at the city's own spot, not where the last race route did
    const { at: [x, z], look: [lx, lz] } = FREE_START;
    placeRiders({ x, z, yaw: Math.atan2(lx - x, lz - z) });
  }
  world.bikers?.reset(track, field);
  Object.assign(game, { raceTime: 0, finishCount: 0, endTimer: 0, cd: 0, cdShown: '', questEnd: null });
  for (const h of huds) {
    h.finished.classList.remove('show');
    h.msg.className = 'msg';
    h.cd.textContent = '';
  }
}

// The players at a quest's start, side by side, looking the way they have to go.
function placeRiders({ x, z, yaw }) {
  humans.forEach((r, p) => {
    const side = humans.length > 1 ? (p ? 1.2 : -1.2) : 0;
    r.pos.x = x + Math.cos(yaw) * side;
    r.pos.z = z - Math.sin(yaw) * side;
    r.onRoute = undefined;
    const near = track.distTo(r.pos.x, r.pos.z) < track.hw + 4;
    if (near) {
      r.idx = track.nearest(r.pos.x, r.pos.z);
      r.lat = track.lateral(r.pos.x, r.pos.z, r.idx);
    }
    const onCars = near && Math.abs(r.lat) <= track.hw + 0.3 ? groundAt(track.parking, track, r.idx, r.lat, true) : 0;
    Object.assign(r, { yaw, speed: 0, steer: 0, y: onCars, vy: 0, ground: onCars, base: world.relief?.at(r.pos.x, r.pos.z) ?? 0, baseV: 0, streetT: 0 });
    camYaw[p] = yaw;
  });
}

// A quest begins with what it is about, and the START button.
function showBriefing() {
  const q = quest.def;
  $('briefEmoji').textContent = q.emoji;
  $('briefTitle').textContent = qt(q, 'title');
  $('briefStory').textContent = qt(q, 'story');
  $('briefTime').textContent = t_('quest.time', { time: fmtTime(q.time).replace(/\.\d+$/, '') });
  $('briefFoot').textContent = t_(touch.on ? 'quest.footTap' : 'quest.foot');
  briefEl.classList.remove('hidden');
}

function beginQuest() {
  if (game.state !== 'briefing') return;
  briefEl.classList.add('hidden');
  game.state = 'race';
  sfx.countdown(true);
}

// What happened in the quest this frame: a cap picked up, a student about to throw up, the end.
function questEvents() {
  for (const e of quest.take()) {
    if (e.type === 'collect') {
      hudMsg(e.r.human, `${quest.def.icon ?? '🎓'} ${e.n}/${quest.tally.of}`, 'gold');
      sfx.pickup('bunny', PAN[e.r.human]); buzz('tap');
    } else if (e.type === 'retch') {
      const r = humans.reduce((b, h) => (Math.hypot(h.pos.x - e.x, h.pos.z - e.z) < Math.hypot(b.pos.x - e.x, b.pos.z - e.z) ? h : b));
      sfx.voice(0, { type: 'sawtooth', from: 160, peak: 110, to: 70, dur: 0.5, formant: 500, vol: 0.18, wobble: 12 });
      if (Math.hypot(r.pos.x - e.x, r.pos.z - e.z) < 12) hudMsg(r.human, t_('quest.retch'), 'bad');
    } else endQuest(e.type === 'win', e.why, e.r);
  }
  if (!quest.over && game.raceTime >= quest.def.time) {
    quest.over = true;
    endQuest(false, 'time');
  }
}

function endQuest(won, why, r) {
  game.questEnd = game.raceTime;
  game.questWon = won;
  game.questWhy = why;
  report('quest_end', { quest: quest.def.id, won, why, seconds: Math.round(game.raceTime) });
  const text = won ? qt(quest.def, 'done') : why === 'puke' ? t_('quest.puked') : why === 'run' ? t_('quest.ran') : t_('quest.late');
  humans.forEach((h, p) => hudMsg(p, text, won ? 'good' : 'bad'));
  if (won) {
    sfx.finish(r ? PAN[r.human] : 0); buzz('win');
    const at = r ?? humans[0];
    particles.burst(at.pos.x, 3, at.pos.z, 40, { color: [0xe53935, 0xfdd835, 0x1e88e5, 0x43a047, 0xffffff, 0xff80ab], speed: 9, up: 9, gravity: 14, life: 1.6, size: 0.16, drag: 1 });
  } else { sfx.crash(0); buzz('lose'); }
  game.endTimer = 2.6;
}

function startRace() {
  if (touring()) return startTour();
  sfx.unlock();
  if (touch.on) {
    game.mode = 1; // split screen needs a keyboard or gamepads
    const root = document.documentElement;
    // not in the iOS app: it is full screen already, and iOS would only show its 'swipe down to exit'
    // banner, which takes the focus away and so pauses the game
    if (!document.fullscreenElement && root.requestFullscreen && !window.Capacitor?.isNativePlatform?.()) {
      root.requestFullscreen({ navigationUI: 'hide' })
        .then(() => screen.orientation?.lock?.('landscape'))
        .catch(() => { /* not allowed here (e.g. iPhone Safari): play in the browser window */ });
    }
  }
  applyMode();
  assignField();
  resetRace();
  menuEl.classList.add('hidden');
  pauseEl.classList.add('hidden');
  resultsEl.classList.add('hidden');
  briefEl.classList.add('hidden');
  showRaceChrome(true);
  field.forEach((r, i) => { camYaw[i] = r.yaw; });
  game.state = questing() ? 'briefing' : roaming() ? 'race' : 'countdown'; // free roam: off you go
  report('game_start', {
    kind: questing() ? 'quest' : roaming() ? 'explore' : 'race',
    quest: quest?.def.id, track: roaming() ? undefined : TRACKS[game.trackIdx].id,
    players: game.players, mount: game.mounts[0], touch: touch.on,
  });
  startSky();
  if (questing()) showBriefing();
  music.stop(); // the music is for the menu only
  sfx.duck(false);
  showAudioBadge();
}

function toMenu() {
  applyMode();
  assignField();
  resetRace();
  game.state = 'menu';
  menuRow = 0;
  startSky();
  closeBigMap();
  pauseEl.classList.add('hidden');
  resultsEl.classList.add('hidden');
  briefEl.classList.add('hidden');
  tourEl.classList.add('hidden');
  if (tourBoatMesh) tourBoatMesh.visible = false;
  for (const m of tourFleet) m.visible = false;
  if (tourBusMesh) tourBusMesh.visible = false;
  if (tourTumble) tourTumble.root.visible = false;
  menuEl.classList.remove('hidden');
  showRaceChrome(false);
  menuLook.set(racers[0].pos.x, 1.5, racers[0].pos.z);
  music.play('menu');
  sfx.duck(false);
  renderMenu();
  showAudioBadge();
}

// ------------------------------------------------------------------ the tour

// The camera flies the city's TOUR (js/tour.js) over the streets; at each stop a card says what is
// there. On its own (auto) each card stays a while; interactively the flight waits for a click.
const tourEl = $('tour'), tourCardEl = $('tourCard');
const TOUR_SPEEDS = [1, 1.5, 0.5]; // the speed button goes round these
const TOUR_END = { end: true }; // the last card: the tour is over
const TOUR_AGAIN = 9; // seconds the last card stays before an auto tour starts over
// The sky the tour asks for (its skies), as this city has it: rain for snow where it never snows.
const tourSky = sky => {
  const wet = sky.replace('snow', 'rain');
  return COMBOS.includes(sky) ? sky : COMBOS.includes(wet) ? wet : sky.split(':')[0] + ':clear';
};
let tour = null, tourShown = null, tourEndAt = 0, tourGround = 0, tourBoatMesh = null, tourFleet = [], tourBusMesh = null, tourTumble = null;

function startTour() {
  sfx.unlock();
  if (!tour) {
    tour = new Tour(TOUR);
    buildTourBar();
  }
  tour.reset();
  for (const el of [menuEl, pauseEl, resultsEl, briefEl]) el.classList.add('hidden');
  showRaceChrome(false);
  $('menuBtn').classList.remove('hidden');
  tourEl.classList.remove('hidden');
  tourEl.classList.toggle('auto', game.tourMode === 'auto');
  game.state = 'tour';
  tourEndAt = 0;
  showTourCard(null);
  menuCam.fov = 56;
  showTourSpeed();
  if (game.tourMusic) music.play('menu');
  else music.stop();
  $('tourWelcomeTitle').textContent = t_('tour.welcome', { city: local(NAME) });
  startSky();
  report('tour_start', { mode: game.tourMode, touch: touch.on });
}

function updateTour(dt) {
  const auto = game.tourMode === 'auto';
  tour.update(dt, auto, game.tourSpeed);
  const { pos, look, roll } = tour.steer(dt);
  // the path's heights are over the street: over a bridge's deck, then, where it climbs
  tourGround += (Math.max(0, world.relief?.at(pos.x, pos.z) ?? 0) - tourGround) * (1 - Math.exp(-dt * 3));
  menuCam.position.set(pos.x, pos.y + tourGround, pos.z);
  // one of the Bootjes van Gent on the Leie, the camera along behind it
  const boat = tour.boat();
  if (boat && !tourBoatMesh) scene.add(tourBoatMesh = tourBoat());
  if (tourBoatMesh) {
    tourBoatMesh.visible = !!boat;
    if (boat) {
      tourBoatMesh.position.set(boat.x, WATER + Math.sin(game.time * 1.3) * 0.05, boat.z);
      tourBoatMesh.rotation.set(Math.sin(game.time * 0.9) * 0.015, boat.yaw, 0, 'YXZ');
    }
  }
  // a bus beside the camera from the start, on the street (over the bridge's deck)
  const bus = tour.bus();
  if (bus && !tourBusMesh) scene.add(tourBusMesh = carGroup('bus', 0xffffff));
  if (tourBusMesh) {
    tourBusMesh.visible = !!bus;
    if (bus) {
      tourBusMesh.position.set(bus.x, Math.max(0, world.relief?.at(bus.x, bus.z) ?? 0), bus.z);
      tourBusMesh.rotation.y = bus.yaw;
    }
  }
  // the cyclist who rides into the tram rails on the Korenmarkt and comes off
  const fall = tour.fall();
  if (fall && !tourTumble) scene.add((tourTumble = createTumble()).root);
  if (tourTumble) {
    tourTumble.root.visible = !!fall;
    if (fall) {
      tourTumble.root.position.set(fall.x, Math.max(0, world.relief?.at(fall.x, fall.z) ?? 0), fall.z);
      tourTumble.root.rotation.y = fall.yaw;
      tourTumble.pose(dt, fall.fallen, game.time);
    }
  }
  // and more of them on the Leie, moored at the Graslei or sailing
  tour.boats().forEach((b, i) => {
    if (!tourFleet[i]) scene.add(tourFleet[i] = tourBoat());
    const m = tourFleet[i];
    m.visible = !!b;
    if (!b) return;
    m.position.set(b.x, WATER + Math.sin(game.time * 1.3 + i * 2) * 0.05, b.z);
    m.rotation.set(Math.sin(game.time * 0.9 + i) * 0.015, b.yaw, 0, 'YXZ');
  });
  menuCam.lookAt(look.x, look.y, look.z);
  menuCam.rotateZ(roll); // banking into the bends
  menuCam.fov += (56 + tour.v * 0.4 - menuCam.fov) * (1 - Math.exp(-dt * 3)); // wider the faster it goes
  menuLook.set(pos.x, 1.5, pos.z); // the sun's shadows and the hills: round where the camera is
  // the sky fades over to the one the tour asks for there (ghent/tour.js skies)
  const sky = tour.sky && tourSky(tour.sky);
  if (sky && sky !== `${game.daytime}:${game.weather}`) setSky(sky); // fading over
  $('tourWelcome').classList.toggle('show', tour.welcoming);
  if (tour.done && !tourEndAt) tourEndAt = game.time;
  const card = tour.done ? TOUR_END : tour.welcoming ? null : tour.card(auto);
  if (card !== tourShown) showTourCard(card);
  if (!card) tour.paused = false;
  tourCardEl.classList.toggle('paused', tour.paused);
  const left = tour.done ? 1 - (game.time - tourEndAt) / TOUR_AGAIN : card ? tour.cardLeft(card) : 0;
  $('tourTimer').style.transform = `scaleX(${clamp(left, 0, 1)})`;
  tour.phases.forEach((p, i) => (tourBarFills[i].style.transform = `scaleX(${clamp((tour.s - p.s) / (p.end - p.s), 0, 1)})`));
  const name = tour.name()?.name ?? '';
  if ($('tourName').dataset.name !== name) {
    $('tourName').dataset.name = name;
    $('tourName').textContent = name;
    $('tourName').classList.toggle('show', !!name);
  }
  if (tour.done && auto && game.time - tourEndAt > TOUR_AGAIN) startTour(); // and round again
}

// The bar at the top: the tour's phases side by side, each as long as it is, with a gap between
// them; a click on one goes back (or on) to its start.
let tourBarFills = [];
function buildTourBar() {
  const bar = $('tourBar');
  bar.innerHTML = tour.phases.map((p, i) => `<button data-i="${i}" style="flex-grow:${p.end - p.s}"><i><b></b></i></button>`).join('');
  tourBarFills = [...bar.querySelectorAll('b')];
  bar.querySelectorAll('button').forEach((b, i) => {
    b.dataset.name = tour.phases[i].name ?? ''; // shown as it is hovered (style.css)
    b.addEventListener('click', () => {
      if (game.state !== 'tour') return;
      tour.seek(tour.phases[i]);
      tourEndAt = 0;
      showTourCard(null);
      sfx.ui();
    });
  });
}

// The round button by the menu's: 1×, 1.5× or 0.5× as fast, round and round.
function showTourSpeed() {
  const el = $('tourSpeed'), r = $('menuBtn').getBoundingClientRect();
  el.textContent = `${game.tourSpeed}×`;
  if (r.width) Object.assign(el.style, { left: `${r.right + 8}px`, top: `${r.top + r.height / 2 - el.offsetHeight / 2}px` });
  const m = $('tourMusic'), on = game.tourMusic && sfx.musicOn;
  m.textContent = on ? '🎵' : '🔇';
  m.classList.toggle('off', !on);
  if (r.width) Object.assign(m.style, { left: `${r.right + 8 + el.offsetWidth + 8}px`, top: el.style.top });
}
addEventListener('resize', () => game.state === 'tour' && showTourSpeed());
// The round button beside it: the music on or off, nothing else.
$('tourMusic').addEventListener('click', () => {
  sfx.unlock();
  game.tourMusic = !(game.tourMusic && sfx.musicOn);
  if (game.tourMusic) {
    if (!sfx.musicOn) sfx.setMusic(true);
    music.play('menu');
  } else music.stop();
  showTourSpeed();
  saveSettings();
});
$('tourSpeed').addEventListener('click', () => {
  game.tourSpeed = TOUR_SPEEDS[(TOUR_SPEEDS.indexOf(game.tourSpeed) + 1) % TOUR_SPEEDS.length];
  showTourSpeed();
  saveSettings();
  sfx.ui();
});

function showTourCard(st) {
  tourShown = st;
  tourCardEl.classList.toggle('show', !!st);
  if (!st) return;
  const sight = st.sight && SIGHTS?.find(x => x.id === st.sight);
  const words = st.end ? { name: t_('tour.end'), text: t_('tour.endText') } : local((sight ?? st).text);
  $('tourEmoji').textContent = st.end ? '🏁' : (sight ?? st).emoji;
  $('tourLabel').textContent = st.end ? t_('tour.label') : `📍 ${t_('tour.label')} ${tour.stops.indexOf(st) + 1}/${tour.stops.length}`;
  $('tourTitle').textContent = words.name;
  // three short facts where the tour has them, or else the sight's own words
  const facts = !st.end && st.facts && local(st.facts);
  if (facts) {
    const ul = document.createElement('ul');
    for (const f of facts) ul.append(Object.assign(document.createElement('li'), { textContent: f }));
    $('tourText').replaceChildren(ul);
  } else $('tourText').textContent = words.text;
  // the sight's own page on the site, in the game's language; a stop without one keeps its link
  const link = (st.sight && sightPage(st.sight)) || (st.link && (st.link[getLang()] ?? st.link.nl));
  $('tourMore').classList.toggle('hidden', !link);
  if (link) $('tourMore').href = link;
  $('tourNext').textContent = t_(st.end ? 'tour.again' : 'tour.next');
  $('tourMenu').classList.toggle('hidden', !st.end);
}

// The card's button (or Space / Enter): on to the next stop (autoplay: away with the card, and on
// if it was waiting for it), or the tour once more at the end.
function tourNext() {
  if (game.state !== 'tour') return;
  if (tour.done) return startTour();
  if (game.tourMode === 'auto') {
    if (tourShown) { tour.dismiss(tourShown); sfx.ui(); }
  } else if (tour.go()) sfx.ui();
}

// On autoplay the flight waits while a card is read: the mouse over it, or a tap on it.
tourCardEl.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && game.tourMode === 'auto' && tourShown) tour.paused = true; });
tourCardEl.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && tour) tour.paused = false; });
tourCardEl.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && game.tourMode === 'auto' && tourShown && !e.target.closest('button, a')) tour.paused = true; });

// The pause menu's three buttons, left to right; the arrows move between them, Space/Enter picks one.
const pauseBtns = ['pauseTitleBtn', 'restartBtn', 'resumeBtn'].map($);
let pauseSel = 2;
function selectPause(i) {
  pauseSel = clamp(i, 0, pauseBtns.length - 1);
  pauseBtns.forEach((b, j) => b.classList.toggle('psel', j === pauseSel));
}

function setPaused(on, menu = true) {
  if (on && (game.state === 'race' || game.state === 'countdown')) {
    game.resumeState = game.state;
    game.state = 'paused';
    if (menu) { selectPause(2); pauseEl.classList.remove('hidden'); }
    sfx.duck(true);
  } else if (on && big && menu) {
    // leaving the window with the big map open: the pause menu over it
    selectPause(2);
    pauseEl.classList.remove('hidden');
  } else if (!on && game.state === 'paused') {
    closeBigMap();
    game.state = game.resumeState;
    pauseEl.classList.add('hidden');
    sfx.unlock(); // the sound may have been stopped while the game was away (a phone call, another app)
    sfx.duck(false);
  }
}

function finalOrder() {
  return [...field].sort((a, b) => {
    if (a.finished !== b.finished) return a.finished ? -1 : 1;
    return a.finished ? a.finishTime - b.finishTime : b.progress - a.progress;
  });
}

function showResults() {
  game.state = 'results';
  game.resultsAt = game.time;
  resultsEl.classList.remove('hidden');
  $('resultTable').classList.toggle('hidden', !!quest);
  if (quest) {
    const q = quest.def;
    $('winner').textContent = game.questWon ? qt(q, 'win') : qt(q, 'lose' + ({ puke: 'Puke', run: 'Run' }[game.questWhy] ?? ''));
    $('duel').textContent = game.questWon ? t_('quest.inTime', { time: fmtTime(game.questEnd) }) : qt(q, 'title');
    return;
  }
  const order = finalOrder();
  report('race_finish', { track: TRACKS[game.trackIdx].id, place: order.indexOf(humans[0]) + 1, laps: lapsToRide() });
  const medals = ['🥇', '🥈', '🥉', `4${ordinal(4)}`];
  $('resultTable').innerHTML = order.map((r, i) => `
    <tr class="${r.human >= 0 ? 'human' : ''}">
      <td>${medals[i]}</td>
      <td class="name"><span class="dot" style="background:${hex(r.human >= 0 ? PLAYER_COLORS[r.human] : r.def.silk)}"></span>${r.name}</td>
      <td>${r.finished ? fmtTime(r.finishTime) : '—'}</td>
    </tr>`).join('');
  const w = order[0];
  if (game.players === 1) {
    const me = racers[0];
    $('winner').textContent = w === me ? t_('win.solo') : t_('win.ai', { name: w.name });
    $('duel').textContent = t_('solo.place', { place: me.place + ordinal(me.place), track: local(TRACKS[game.trackIdx].name) });
  } else {
    $('winner').textContent = w.human >= 0 ? t_('win.player', { rider: w.name }) : t_('win.ai', { name: w.name });
    const ranked = [...humans].sort((a, b) => a.place - b.place);
    const [a, b] = ranked;
    $('duel').textContent = t_('duel', { a: a.name, b: b.name });
  }
}

function onLap(r, d) {
  r.lap += d;
  if (d < 0 || game.state !== 'race' || r.finished || r.lap <= r.bestLap) return;
  r.bestLap = r.lap;
  if (r.lap > lapsToRide()) return finishRacer(r);
  if (r.human >= 0 && r.lap >= 2) {
    const final = r.lap === lapsToRide();
    hudMsg(r.human, final ? t_('msg.final') : t_('msg.lap', { n: r.lap }), final ? 'gold' : '');
    sfx.lap(PAN[r.human], final);
  }
}

function finishRacer(r) {
  r.finished = true;
  r.finishTime = game.raceTime;
  const place = ++game.finishCount;
  if (r.human >= 0) {
    const h = huds[r.human];
    h.finished.innerHTML = `<div class="f1">${t_('finish')}</div><div class="f2">${place}<sup>${ordinal(place)}</sup></div>`;
    h.finished.classList.add('show');
    sfx.finish(PAN[r.human]); buzz('win');
    particles.burst(r.pos.x, 3, r.pos.z, 40, {
      color: [0xe53935, 0xfdd835, 0x1e88e5, 0x43a047, 0xffffff, 0xff80ab],
      speed: 9, up: 9, gravity: 14, life: 1.6, size: 0.16, drag: 1,
    });
  }
  if (humans.every(h => h.finished)) game.endTimer = 3.2;
}

// ------------------------------------------------------------------ control

const held = list => list.some(k => keys.has(k));

function humanControl(r) {
  const k = ctl(r.human);
  let throttle = (held(k.up) ? 1 : 0) - (held(k.down) ? 1 : 0);
  let steer = (held(k.left) ? 1 : 0) - (held(k.right) ? 1 : 0);
  const pad = pads.input[r.human];
  if (pad) {
    throttle = clamp(throttle + pad.throttle, -1, 1);
    steer = clamp(steer + pad.steer, -1, 1);
  }
  if (touch.on && r.human === 0) {
    // On touch screens the horse gallops by itself in a race or a quest, and pulling the stick down brakes;
    // exploring, the stick's up/down rides.
    throttle = exploring() ? touch.throttle : touch.throttle < -0.5 ? -1 : 1;
    steer = clamp(steer + touch.steer, -1, 1);
  }
  return { throttle, steer };
}

const gap = (fromIdx, toIdx) => (track.open ? toIdx - fromIdx : track.wrap(toIdx - fromIdx)) * track.spacing;

// The computer riders only ever attack each other, never a player.
const canHit = (owner, r) => owner.human >= 0 || r.human < 0;

function findTarget(r, backward) {
  let best = null, bestDs = backward ? 50 : 95;
  for (const o of field) {
    if (o === r || o.finished || !canHit(r, o)) continue;
    const ds = backward ? gap(o.idx, r.idx) : gap(r.idx, o.idx);
    if (ds > 3.5 && ds < bestDs) { best = o; bestDs = ds; } // skip horses right beside us
  }
  return best;
}

function leaderExcept(r) {
  return finalOrder().find(o => o !== r && !o.finished && canHit(r, o)) ?? null;
}

function pickupAhead(r, maxDist) {
  let best = null, bestScore = Infinity;
  for (const pk of world.pickups) {
    if (!pk.active) continue;
    const ds = gap(r.idx, pk.idx);
    if (ds < 5 || ds > maxDist) continue;
    const score = ds + Math.abs(pk.lat - r.lat) * 3;
    if (score < bestScore) { bestScore = score; best = pk; }
  }
  return best;
}

// Steer around partial obstacles and hedgehogs, and decide when to jump.
function aiHazards(r, lane) {
  const lim = track.railLimit;
  const slow = r.speed < 12;
  const sp = Math.max(8, r.speed);
  let jumpFor = -1;
  const consider = (idx, lo, hi, full) => {
    const ds = gap(r.idx, idx);
    if (ds <= 0 || ds > 55) return;
    const covers = l => l > lo - 1.3 && l < hi + 1.3;
    // Ride around partial blocks: early at speed, or any time when too slow to clear them.
    if (!full && covers(lane) && (ds > 9 || slow)) lane = lo + lim > lim - hi ? (lo - lim) / 2 : (hi + lim) / 2;
    if (covers(r.lat) && ds < sp * 0.34 + 1.5 && ds > sp * 0.17 && (full || !slow)) jumpFor = idx;
  };
  for (const ob of world.obstacles) consider(ob.idx, ob.latMin, ob.latMax, ob.full);
  for (const t of traps) if (t.owner !== r || t.age > 1) consider(t.idx, t.lat - 1, t.lat + 1, false);
  for (const b of world.bikers?.list ?? []) if (b.state === 'ride' && r.y < 1) consider(b.idx, b.lat - 0.6, b.lat + 0.6, false);
  // a row of parked cars ahead: whoever is in an outer lane jumps up onto the roofs
  const row = r.y < 0.5 ? rowAhead(track.parking, track, r.idx, 55) : -1;
  if (row >= 0) {
    consider(row, track.hw - BAND, track.hw, true);
    consider(row, -track.hw, -track.hw + BAND, true);
  }
  // up on the roofs, nearly at the end of the row: jump across the gap to the next row
  const end = r.y > 0.8 ? rowEnd(track.parking, track, r.idx) : null;
  if (end && end.gap < 14 && end.toEnd < Math.max(3, sp * 0.15) && end.toEnd > 0) jumpFor = r.idx + 1e6;
  return { lane, jumpFor };
}

function aiControl(r, dt, passive) {
  r.aiLaneTimer -= dt;
  if (r.aiLaneTimer <= 0) {
    r.aiLaneTarget = rand(-0.65, 0.65) * track.hw;
    r.aiLaneTimer = rand(2, 5);
  }
  let lane = r.aiLaneTarget;
  const armed = !passive && game.weapons;
  if (armed && r.items.length < MAX_ITEMS) {
    const pk = pickupAhead(r, 70);
    if (pk) lane = pk.lat;
  }
  for (const o of field) {
    if (o === r) continue;
    const ds = gap(r.idx, o.idx);
    if (ds > 0 && ds < 9 && Math.abs(o.lat - lane) < 2.6) lane = o.lat + (o.lat > r.lat ? -3.2 : 3.2);
  }
  // a row of parked cars coming up: about half the time, go for the roofs
  const row = r.y < 0.5 ? rowAhead(track.parking, track, r.idx, 60) : -1;
  if (row >= 0 && row !== r.aiRowFor) {
    r.aiRowFor = row;
    r.aiRoof = Math.random() < 0.5 ? (Math.sign(r.lat) || 1) : 0;
  }
  if (r.aiRoof && (row >= 0 || r.y > 0.3)) lane = r.aiRoof * (track.hw - BAND / 2); // also mid-jump
  const hz = aiHazards(r, clamp(lane, -track.railLimit + 1, track.railLimit - 1));
  lane = clamp(hz.lane, -track.railLimit + 0.6, track.railLimit - 0.6);
  if (track.parking?.rowAt[r.idx] >= 0) {
    // along a row: up on the roofs stay on them, down in the street stay between them
    const inner = track.hw - BAND - 0.9, s = Math.sign(r.lat) || 1;
    lane = r.y > 0.8 ? s * (track.hw - BAND / 2) : clamp(lane, -inner, inner);
  }
  r.aiLane = approach(r.aiLane, lane, 7 * dt);
  if (r.y > 0.8 && track.parking?.rowAt[r.idx] >= 0) r.aiLane = lane; // no drifting off the roofs
  if (hz.jumpFor >= 0) {
    if (r.aiJumpFor !== hz.jumpFor) {
      r.aiJumpFor = hz.jumpFor;
      r.aiJumpOk = r.human >= 0 || Math.random() < 0.9; // bots sometimes misjudge a jump
    }
    if (r.aiJumpOk) jump(r);
  } else {
    r.aiJumpFor = -1; // roll again next time we meet this obstacle
  }

  // past the finish of an open route: pull up before the end of the street
  if (track.open && (track.n - 1 - r.idx) * track.spacing < 35) return { throttle: r.speed > 1 ? -1 : 0, steer: 0 };

  const look = 8 + Math.abs(r.speed) * 0.45;
  track.at(r.idx + Math.round(look / track.spacing), r.aiLane, tmp);
  const diff = wrapAngle(Math.atan2(tmp.x - r.pos.x, tmp.z - r.pos.z) - r.yaw);

  // Rubber band against the human players so the race stays close.
  let band = 1;
  if (game.state === 'race' && r.human < 0 && !r.finished) {
    const best = Math.max(...humans.map(h => h.progress)), worst = Math.min(...humans.map(h => h.progress));
    if (r.progress - best > 0.04) band = 1 - Math.min(0.14, (r.progress - best - 0.04) * 0.9);
    else if (worst - r.progress > 0.04) band = 1 + Math.min(0.1, (worst - r.progress - 0.04) * 0.9);
  }
  r.speedFactor = (r.finished ? 0.8 : r.skill) * band;

  if (armed) aiItems(r, dt);
  return { throttle: Math.abs(diff) > 1.4 ? 0.4 : 1, steer: clamp(diff * 3, -1, 1) };
}

function aiItems(r, dt) {
  const kind = r.items[0];
  if (!kind || r.spinTime > 0 || r.rearTime > 0) return;
  r.aiHold += dt;
  if ((r.aiItemTimer -= dt) > 0) return;
  r.aiItemTimer = rand(0.4, 1);
  const ahead = findTarget(r, false), behind = findTarget(r, true);
  if (kind === 'bunny') {
    if (ahead && gap(r.idx, ahead.idx) < 45 && Math.random() < 0.8) useItem(r, false);
    else if (behind && gap(behind.idx, r.idx) < 14 && Math.random() < 0.35) useItem(r, true);
  } else if (kind === 'hedgehog') {
    if ((behind && gap(behind.idx, r.idx) < 22 && Math.random() < 0.6) || r.aiHold > 9) useItem(r, false);
  } else if (kind === 'cloud') {
    if (r.place > 1 || r.aiHold > 10) useItem(r, false);
  }
  if (r.items[0] !== kind) r.aiItemTimer = rand(1.2, 3.5);
}

// ------------------------------------------------------------------ physics

function jump(r) {
  if (riding(r) || !r.grounded || r.spinTime > 0 || r.rearTime > 0 || r.stunTime > 0) return;
  r.vy = JUMP_V;
  r.y += 0.001;
  if (r.human >= 0 && game.state === 'race') sfx.jump(PAN[r.human]);
}

function stepRacer(r, dt, c) {
  for (const k of ['stunTime', 'rearTime', 'stumbleTime', 'soakTime', 'invuln', 'obstacleCd', 'wallTimer']) {
    r[k] = Math.max(0, r[k] - dt);
  }
  if (r.spinTime > 0) {
    r.spinTime -= dt;
    c.throttle = 0;
    c.steer = 0;
    r.speed *= Math.exp(-2.2 * dt);
    if (r.spinTime <= 0) r.model.stars.visible = false;
  }
  if (r.stunTime > 0) c.throttle = 0;

  const airborne = !r.grounded;
  if (!airborne) {
    const max = MAX_SPEED * (world.cfg.pace ?? 1) * r.speedFactor * (r.soakTime > 0 ? SOAK_SLOW : 1);
    if (c.throttle > 0) {
      if (r.speed < 0) r.speed += BRAKE * dt;
      else if (r.speed < max) r.speed = Math.min(max, r.speed + ACCEL * c.throttle * (1 - 0.55 * r.speed / MAX_SPEED) * dt);
      else r.speed = approach(r.speed, max, 12 * dt);
    } else if (c.throttle < 0) {
      r.speed = r.speed > 0 ? r.speed - BRAKE * dt : Math.max(-REVERSE_MAX, r.speed - 10 * dt);
    } else {
      r.speed = approach(r.speed, 0, COAST * dt);
    }
    if (r.soakTime > 0 && r.speed > max) r.speed = approach(r.speed, max, 25 * dt);
    if (HILLS) {
      // up a hill is hard going and down it runs away with you
      const climb = slopeAlong(r.pos.x, r.pos.z, Math.sin(r.yaw), Math.cos(r.yaw)) * Math.sign(r.speed || 1);
      r.speed -= Math.sign(r.speed) * HILL_PULL * climb * dt;
      if (climb > 0 && Math.abs(r.speed) > max * (1 - HILL_SLOW * climb)) r.speed = approach(r.speed, Math.sign(r.speed) * max * Math.max(0.5, 1 - HILL_SLOW * climb), 10 * dt);
    }
  }

  r.steer = approach(r.steer, c.steer, 7 * dt);
  const sp = Math.abs(r.speed);
  const turn = TURN_RATE * Math.min(1, 0.3 + sp / 7) * (1 - 0.3 * Math.min(1, sp / MAX_SPEED)) * (airborne ? 0.45 : 1);
  r.yaw = wrapAngle(r.yaw + r.steer * turn * dt * (r.speed < -0.3 ? -1 : 1));
  const was = { x: r.pos.x, z: r.pos.z, idx: r.idx, lat: r.lat };
  r.pos.x += Math.sin(r.yaw) * r.speed * dt;
  r.pos.z += Math.cos(r.yaw) * r.speed * dt;
  if (roaming()) roamAbout(r, dt);
  else followTrack(r, dt);
  if (!roaming() && r.onRoute !== false) hitObstacles(r);
  stepHeight(r, dt, was, airborne);
  stepRelief(r, dt);
}

// Up onto a bridge and down again. r.y is the height above the street; r.base is how high the
// street is. Off the side of a bridge the rider drops to the ground below.
function stepRelief(r, dt) {
  let target = roaming() ? (world.relief?.at(r.pos.x, r.pos.z, r.base) ?? 0) : track.riseAt(r.idx);
  // into the water, down between the quay walls (or under a bridge)
  const bank = roaming() && target < 0.05 && world.colliders ? bankAt(world.colliders, r.pos.x, r.pos.z) : undefined;
  if (bank !== undefined) target = bank; // down the grass slope of a canal's bank, on foot still
  else if (roaming() && target < 0.05 && world.colliders && inWater(world.colliders, r.pos.x, r.pos.z)) {
    r.water = waterLevel(world.colliders, r.pos.x, r.pos.z) ?? WATER;
    target = r.water + WADE - WATER;
  }
  if (target >= r.base - 0.25) {
    r.base = target;
    r.baseV = 0;
  } else {
    r.baseV -= GRAVITY * dt;
    r.base = Math.max(target, r.base + r.baseV * dt);
    if (r.base === target) r.baseV = 0;
  }
}

// Free roam: no rails, the buildings are the walls. Near the race route the rider still has a
// place on it, for the parked cars to ride over and the barriers to jump.
function roamAbout(r, dt) {
  const near = track.distTo(r.pos.x, r.pos.z) < track.hw + 4;
  if (near) {
    r.idx = track.nearest(r.pos.x, r.pos.z, r.onRoute ? r.idx : -1);
    r.lat = track.lateral(r.pos.x, r.pos.z, r.idx);
  }
  r.onRoute = near && Math.abs(r.lat) < track.hw + 0.3;
  const into = Math.max(collide(world.colliders, r, HORSE_RADIUS), city.traffic?.push(r, HORSE_RADIUS) ?? 0);
  if (into > 0) {
    r.speed *= Math.exp(-into * 2.8 * dt);
    if (into * Math.abs(r.speed) > 7 && r.wallTimer <= 0) {
      r.wallTimer = 0.5;
      r.speed *= 0.85;
      if (r.human >= 0 && loud()) { sfx.bump(PAN[r.human]); buzz('tap'); }
    }
  }
  // in the water you take a boat of the Bootjes van Gent: slower, with a wake behind it (but not
  // in the quest of the last boat: the boat you have to catch is the one waiting at the quay)
  r.afloat = r.base < 0.3 && !quest?.def.boat && inWater(world.colliders, r.pos.x, r.pos.z);
  if (r.afloat) {
    r.speed = approach(r.speed, clamp(r.speed, -REVERSE_MAX, BOAT_SPEED), 30 * dt);
    if (r.y < 0.3 && Math.random() < dt * Math.abs(r.speed) * 1.2) {
      const side = Math.random() < 0.5 ? -1 : 1;
      particles.spawn(r.pos.x - r.fx * 6 + r.fz * side * 0.8, (r.water ?? WATER) + 0.15, r.pos.z - r.fz * 6 - r.fx * side * 0.8, {
        color: 0xe4eee8, vy: 0.6, vx: -r.fx * 1.5 + r.fz * side * 1.2, vz: -r.fz * 1.5 - r.fx * side * 1.2, life: 1.1, size: 0.2, grow: 0.8, opacity: 0.7, drag: 1.5,
      });
    }
  }
  if (r.human >= 0 && (r.streetT = (r.streetT ?? 0) - dt) <= 0) {
    r.streetT = 0.3;
    r.street = streetAt(world.colliders, r.pos.x, r.pos.z) || r.street;
  }
}

// Up and down: jumps, and riding over the roofs of parked cars. Riding into a car you are too low
// for puts you back where you were, like running into a wall.
function stepHeight(r, dt, was, airborne) {
  const up = r.y > 0.8;
  const ground = () => (r.onRoute === false ? 0 : groundAt(track.parking, track, r.idx, r.lat, up));
  let g = ground();
  const y0 = r.y;
  if (airborne) {
    r.vy -= GRAVITY * dt;
    r.y += r.vy * dt;
  }
  if (g > Math.max(y0, r.y) + STEP_UP) {
    const row = track.parking.rowAt[r.idx];
    if (row >= 0 && track.parking.rowAt[was.idx] === row) {
      // into the side of the row: back to its edge, still moving along
      r.lat = Math.sign(r.lat) * (track.hw - BAND - 0.02);
    } else {
      // into the front of the row: stop going forwards, but you can still step aside
      r.idx = was.idx;
    }
    track.at(r.idx, r.lat, r.pos);
    g = ground();
    r.aiRoof = 0; // the computer gives up on these roofs
    if (r.obstacleCd <= 0) {
      r.obstacleCd = 0.8;
      r.speed *= 0.35;
      r.stumbleTime = STUMBLE_TIME;
      if (r.human >= 0 && game.state === 'race') {
        sfx.crash(PAN[r.human]); buzz('crash');
        hudMsg(r.human, touch.on && r.human === 0 ? t_('msg.carTap') : t_('msg.carKey', { key: ctl(r.human).label.jump }), 'bad');
      }
    }
  }
  if (airborne && r.y <= g) {
    r.y = g;
    r.vy = 0;
    particles.burst(r.pos.x, r.base + g + 0.3, r.pos.z, 8, { color: g > 0 ? 0xffffff : 0xc9a77c, speed: 3, up: 1.5, life: 0.5, size: 0.2, grow: 0.5, opacity: 0.5, drag: 3 });
    if (r.human >= 0 && game.state === 'race') { sfx.land(PAN[r.human]); buzz('tap'); }
  } else if (!airborne && g >= r.y - STEP_DOWN) {
    r.y = g; // steps over bonnets and roofs
  }
  // a bigger drop (off the end of a row) leaves the horse in the air: it falls next frame
  r.ground = g;
}

function followTrack(r, dt) {
  const prev = r.idx;
  r.idx = track.nearest(r.pos.x, r.pos.z, r.idx);
  if (track.open) {
    // over the start line, and later the finish line, in either direction
    for (const line of [track.start, track.finish]) {
      if (prev < line && r.idx >= line) onLap(r, 1);
      else if (prev >= line && r.idx < line) onLap(r, -1);
    }
    endOfRoute(r);
  } else if (prev - r.idx > track.n / 2) onLap(r, 1);
  else if (r.idx - prev > track.n / 2) onLap(r, -1);

  let lat = track.lateral(r.pos.x, r.pos.z, r.idx);
  const lim = track.railLimit;
  if (Math.abs(lat) > lim) {
    const s = Math.sign(lat), m = track.normals[r.idx];
    const push = lat - s * lim;
    r.pos.x -= m.x * push;
    r.pos.z -= m.z * push;
    lat = s * lim;
    const into = (r.fx * m.x + r.fz * m.z) * s * Math.sign(r.speed);
    if (into > 0) {
      r.speed *= Math.exp(-into * 2.8 * dt);
      if (r.speed > 0) r.yaw -= s * into * 1.8 * dt; // slide along the rail
      if (into * Math.abs(r.speed) > 7 && r.wallTimer <= 0) {
        r.wallTimer = 0.5;
        r.speed *= 0.85;
        if (r.human >= 0 && game.state === 'race') { sfx.bump(PAN[r.human]); buzz('tap'); }
      }
    }
  }
  r.lat = lat;
  r.progress = progressOf(r);
  const t = track.tangents[r.idx];
  const along = r.fx * t.x + r.fz * t.z;
  const wrong = (along < -0.35 && r.speed > 2) || (along > 0.35 && r.speed < -2);
  r.wrongWay = wrong ? r.wrongWay + dt : 0;
}

// The two ends of an open route: the street is closed off there, like a rail across it.
function endOfRoute(r) {
  const end = r.idx === 0 ? -1 : r.idx === track.n - 1 ? 1 : 0;
  if (!end) return;
  const p = track.points[r.idx], t = track.tangents[r.idx];
  const past = ((r.pos.x - p.x) * t.x + (r.pos.z - p.z) * t.z) * end;
  if (past <= 0) return;
  r.pos.x -= t.x * past * end;
  r.pos.z -= t.z * past * end;
  if (Math.sign(r.speed) === Math.sign((r.fx * t.x + r.fz * t.z) * end)) r.speed *= 0.5;
}

function hitObstacles(r) {
  const lim = track.railLimit;
  for (const ob of world.obstacles) {
    const ds = track.delta(ob.idx, r.idx) * track.spacing; // > 0 once the horse is past its middle
    const halfD = ob.depth / 2 + 1.1;
    const lo = ob.latMin - 0.6, hi = ob.latMax + 0.6;
    if (Math.abs(ds) > halfD || r.lat < lo || r.lat > hi || r.y > ob.height - 0.25) continue;
    if (ob.solid) {
      // Push out along whichever direction needs the smallest move (never through a rail).
      const along = halfD - Math.abs(ds);
      let best = along, how = 'along';
      if (lo > -lim && r.lat - lo < best) { best = r.lat - lo; how = 'lo'; }
      if (hi < lim && hi - r.lat < best) { best = hi - r.lat; how = 'hi'; }
      const m = track.normals[r.idx], tg = track.tangents[r.idx];
      if (how === 'along') {
        const sgn = ds < 0 ? -1 : 1;
        r.pos.x += tg.x * sgn * along;
        r.pos.z += tg.z * sgn * along;
      } else {
        const sgn = how === 'lo' ? -1 : 1;
        r.pos.x += m.x * sgn * best;
        r.pos.z += m.z * sgn * best;
        r.lat += sgn * best;
      }
    }
    if (r.obstacleCd > 0) continue;
    r.obstacleCd = 1;
    r.stumbleTime = STUMBLE_TIME;
    r.stunTime = Math.max(r.stunTime, 0.35);
    r.speed *= ob.solid ? 0.35 : 0.3;
    ob.wobble = 0.6;
    const bits = ob.kind === 'barrier' ? [0xd32f2f, 0xffffff] : ob.kind === 'car' ? [0xcfd8dc, 0x90a4ae, 0xffffff] : [0x4f8f3a, 0xb9b5ad, 0xff80ab];
    particles.burst(r.pos.x, 1, r.pos.z, 12, { color: bits, speed: 5, up: 4, gravity: 12, life: 0.7, size: 0.18, drag: 1 });
    if (r.human >= 0 && game.state === 'race') {
      sfx.crash(PAN[r.human]); buzz('crash');
      hudMsg(r.human, touch.on && r.human === 0 ? t_('msg.oofTap') : t_('msg.oofKey', { key: ctl(r.human).label.jump }), 'bad');
    }
  }
}

// A horse ran into a cyclist: the bike goes over, the horse stumbles.
function bikerHit(r, b, p) {
  if (riding(r)) return;
  particles.burst(p.x, 1, p.z, 14, { color: [0xffffff, 0x90a4ae, 0xffd740], speed: 5, up: 4, gravity: 12, life: 0.6, size: 0.16, drag: 1 });
  r.stumbleTime = STUMBLE_TIME;
  r.stunTime = Math.max(r.stunTime, 0.3);
  r.speed *= 0.35;
  r.invuln = Math.max(r.invuln, 0.8);
  shout(r.human >= 0);
  if (r.human >= 0 && game.state === 'race') {
    sfx.crash(PAN[r.human]); buzz('crash');
    hudMsg(r.human, t_('msg.bike'), 'bad');
  }
}

// A horse ran into somebody on the pavement (riding about freely): they jump aside and shout.
function pedestrianBump(r, x, y, z) {
  if (riding(r)) return;
  shout(r.human >= 0);
  r.speed *= 0.75;
  r.stumbleTime = Math.max(r.stumbleTime, STUMBLE_TIME * 0.6);
}

// ------------------------------------------------------------------ shouts

// Somebody got startled: when a player caused it they say something out loud, picked at random.
const SHOUTS = {
  nl: ['Hé!', 'Hallo!', 'Hela!', 'Amai!', 'Pas op!', 'Oei!', 'Allee zeg!', 'Seg!', 'Goeiendag!', 'Wow!', 'Rustig!', 'Mijn hoed!'],
  en: ['Hey!', 'Hello!', 'Oi!', 'Watch it!', 'Whoa!', 'Oops!', 'Careful!', 'Good day!', 'Wow!', 'Easy there!', 'My hat!', 'Hi there!'],
  fr: ['Hé !', 'Bonjour !', 'Attention !', 'Oh là là !', 'Oups !', 'Doucement !', 'Holà !', 'Salut !', 'Ouah !', 'Mon chapeau !'],
  es: ['¡Eh!', '¡Hola!', '¡Cuidado!', '¡Ay!', '¡Uy!', '¡Ojo!', '¡Despacio!', '¡Buenas!', '¡Madre mía!', '¡Mi sombrero!'],
};
const VOICE = { nl: 'nl-BE', en: 'en-GB', fr: 'fr-BE', es: 'es-ES' };
let lastSpoken = 0;

function shout(loudly) {
  if (!loudly || !loud() || !sfx.sfxOn || !('speechSynthesis' in window) || game.time - lastSpoken < 0.5) return;
  lastSpoken = game.time;
  const lines = SHOUTS[getLang()] ?? SHOUTS.en;
  try {
    const say = new SpeechSynthesisUtterance(lines[Math.floor(Math.random() * lines.length)]);
    say.lang = VOICE[getLang()] ?? 'nl-BE';
    say.pitch = 0.6 + Math.random() * 1.2; // all sorts of voices
    say.rate = 1.25;
    speechSynthesis.cancel(); // never a queue of hey's behind the action
    speechSynthesis.speak(say);
  } catch { /* no speech here */ }
}

function collideRacers() {
  const min = HORSE_RADIUS * 2;
  for (let a = 0; a < field.length; a++) {
    for (let b = a + 1; b < field.length; b++) {
      const A = field[a], B = field[b];
      if (Math.abs(A.y - B.y) > 1.2 || riding(A) || riding(B)) continue; // one is jumping over the other, or on the tram
      const dx = B.pos.x - A.pos.x, dz = B.pos.z - A.pos.z, d2 = dx * dx + dz * dz;
      if (d2 >= min * min || d2 < 1e-6) continue;
      const d = Math.sqrt(d2), o = (min - d) / 2, nx = dx / d, nz = dz / d;
      A.pos.x -= nx * o; A.pos.z -= nz * o;
      B.pos.x += nx * o; B.pos.z += nz * o;
      const aInto = (A.fx * nx + A.fz * nz) * A.speed, bInto = -(B.fx * nx + B.fz * nz) * B.speed;
      if (aInto > 0) A.speed -= aInto * 0.08;
      if (bInto > 0) B.speed -= bInto * 0.08;
    }
  }
}

// ------------------------------------------------------------------ items

const loud = () => game.state === 'race';

function updatePickups(dt, t) {
  if (!game.weapons || roaming()) return;
  for (const pk of world.pickups) {
    if (!pk.active) {
      if ((pk.timer -= dt) <= 0) {
        pk.active = true;
        pk.appear = 0;
        pk.group.visible = true;
        pk.setKind(rollItem());
      }
      continue;
    }
    pk.appear = Math.min(1, pk.appear + dt * 3);
    const a = pk.appear;
    pk.group.scale.setScalar(1 + 2.7 * Math.pow(a - 1, 3) + 1.7 * Math.pow(a - 1, 2)); // ease-out-back
    const g = pk.model.group;
    if (pk.kind === 'cloud') {
      g.position.y = 1.6 + Math.sin(t * 2 + pk.phase) * 0.25;
      g.rotation.y += dt * 0.8;
    } else {
      g.position.y = 0.15 + Math.abs(Math.sin(t * (pk.kind === 'hedgehog' ? 3 : 4) + pk.phase)) * (pk.kind === 'hedgehog' ? 0.35 : 0.7);
      g.rotation.y += dt * 1.2;
    }
    for (const r of field) {
      if (r.items.length >= MAX_ITEMS) continue;
      const dx = r.pos.x - pk.pos.x, dz = r.pos.z - pk.pos.z;
      if (dx * dx + dz * dz < 2.3 * 2.3 && Math.abs(r.y - pk.y) < 1.4) { collect(r, pk); break; }
    }
  }
}

function collect(r, pk) {
  r.items.push(pk.kind);
  if (r.items.length === 1) r.aiHold = 0;
  pk.active = false;
  pk.timer = PICKUP_RESPAWN;
  pk.group.visible = false;
  particles.burst(pk.pos.x, 1, pk.pos.z, 10, { color: [0xffffff, ITEMS[pk.kind].ring], speed: 4, up: 3, life: 0.5, size: 0.18, drag: 3 });
  if (r.human >= 0 && loud()) {
    sfx.pickup(pk.kind, PAN[r.human]); buzz('tap');
    restartAnim(huds[r.human].items, 'bump');
  }
}

function useItem(r, backward) {
  if (!game.weapons || !r.items.length || r.spinTime > 0 || r.rearTime > 0 || r.finished) return;
  const kind = r.items.shift();
  r.aiHold = 0;
  if (kind === 'bunny') throwBunny(r, backward);
  else if (kind === 'hedgehog') dropHedgehog(r);
  else sendCloud(r);
}

function throwBunny(r, backward) {
  const dir = backward ? -1 : 1;
  const model = createBunny();
  model.group.scale.setScalar(1.15);
  scene.add(model.group);
  const x = r.pos.x + r.fx * 2.8 * dir, z = r.pos.z + r.fz * 2.8 * dir;
  const idx = track.nearest(x, z, r.idx);
  thrown.push({
    model, owner: r, backward, x, z, y: 2.4 + r.y, y0: 2.4 + r.y, idx,
    lat: track.lateral(x, z, idx),
    yaw: backward ? r.yaw + Math.PI : r.yaw,
    speed: backward ? 30 : Math.max(48, r.speed + 22),
    target: findTarget(r, backward),
    life: 3.6, age: 0, hop: 0, trail: 0,
  });
  if (r.human >= 0 && loud()) sfx.throw(PAN[r.human]);
}

function dropHedgehog(r) {
  const x = r.pos.x - r.fx * 2.8, z = r.pos.z - r.fz * 2.8;
  const idx = track.nearest(x, z, r.idx);
  const lat = clamp(track.lateral(x, z, idx), -track.railLimit, track.railLimit);
  const p = track.at(idx, lat);
  const model = createHedgehog();
  model.group.scale.setScalar(1.3);
  model.group.rotation.y = r.yaw + Math.PI;
  model.group.position.set(p.x, 1.4 + r.y, p.z);
  scene.add(model.group);
  traps.push({ model, owner: r, x: p.x, z: p.z, idx, lat, age: 0, y0: 1.4 + r.y });
  if (traps.length > MAX_TRAPS) removeFrom(traps, 0, true);
  if (r.human >= 0 && loud()) sfx.drop(PAN[r.human]);
}

function sendCloud(r) {
  const target = leaderExcept(r);
  if (!target) return;
  const model = createCloud();
  model.group.scale.setScalar(1.5);
  scene.add(model.group);
  const bolt = createBolt();
  bolt.visible = false;
  scene.add(bolt);
  clouds.push({ model, bolt, owner: r, target, x: r.pos.x, y: 3.5 + r.y, z: r.pos.z, state: 'fly', rain: 0, fade: 0, boltTime: 0, dropAcc: 0 });
  if (loud()) {
    if (r.human >= 0) {
      sfx.puff(PAN[r.human]);
      hudMsg(r.human, `🌧️ ➜ ${target.name}`, 'good');
    }
  }
}

function removeFrom(list, k, poof = false) {
  const e = list[k];
  if (poof) particles.burst(e.model.group.position.x, e.model.group.position.y + 0.4, e.model.group.position.z, 8, { color: 0xffffff, speed: 3, up: 2, life: 0.4, size: 0.2, drag: 3 });
  scene.remove(e.model.group);
  if (e.bolt) scene.remove(e.bolt);
  list.splice(k, 1);
}

function updateThrown(dt) {
  const look = Math.round(12 / track.spacing);
  for (let k = thrown.length - 1; k >= 0; k--) {
    const b = thrown[k];
    b.age += dt;
    b.life -= dt;
    const dir = b.backward ? -1 : 1;
    if (b.target && b.target.finished) b.target = null;

    // Chase the target directly when close, otherwise follow the track towards its lane.
    let ax, az;
    const t = b.target;
    const ds = t ? (b.backward ? gap(t.idx, b.idx) : gap(b.idx, t.idx)) : 0;
    if (t && (ds < 24 || ds > track.length - 8)) {
      ax = t.pos.x;
      az = t.pos.z;
    } else {
      track.at(b.idx + dir * look, clamp(t ? t.lat : b.lat, -0.75 * track.hw, 0.75 * track.hw), tmp);
      ax = tmp.x;
      az = tmp.z;
    }
    const diff = wrapAngle(Math.atan2(ax - b.x, az - b.z) - b.yaw);
    if (t && Math.abs(diff) > 2 && b.age > 0.3) b.target = null;
    const maxTurn = (b.target ? 3.2 : 5) * dt;
    b.yaw += clamp(diff, -maxTurn, maxTurn);
    b.x += Math.sin(b.yaw) * b.speed * dt;
    b.z += Math.cos(b.yaw) * b.speed * dt;
    b.idx = track.nearest(b.x, b.z, b.idx);
    b.lat = track.lateral(b.x, b.z, b.idx);

    const lim = track.hw - 0.5;
    if (Math.abs(b.lat) > lim) {
      const s = Math.sign(b.lat), m = track.normals[b.idx], push = b.lat - s * lim;
      b.x -= m.x * push;
      b.z -= m.z * push;
      b.lat = s * lim;
      let vx = Math.sin(b.yaw), vz = Math.cos(b.yaw);
      const vn = vx * m.x + vz * m.z;
      if (vn * s > 0) {
        vx -= 2 * vn * m.x;
        vz -= 2 * vn * m.z;
        b.yaw = Math.atan2(vx, vz);
      }
    }

    // First a tumbling throw from the jockey's hand, then low hops along the ground.
    b.hop += dt * 9;
    const arc = Math.abs(Math.sin(b.hop));
    if (b.hop < Math.PI) b.y = b.y0 + (0.25 - b.y0) * (b.hop / Math.PI) + Math.sin(b.hop) * 1.3;
    else b.y = 0.25 + arc * 1.3;
    const g = b.model.group;
    g.position.set(b.x, b.y, b.z);
    g.rotation.y = b.yaw;
    g.rotation.x = b.hop < Math.PI ? b.hop * 2 : Math.cos(b.hop * 2) * 0.25;
    for (const ear of b.model.ears) ear.rotation.x = -0.2 - arc * 0.7;
    if ((b.trail += dt) > 0.04) {
      b.trail = 0;
      particles.spawn(b.x, b.y + 0.5, b.z, { color: 0xffffff, life: 0.35, size: 0.16, grow: 0.25, opacity: 0.7 });
    }

    // A bunny that runs into a hedgehog takes it out.
    const trapHit = b.y < 1.2 ? traps.findIndex(tr => (tr.x - b.x) ** 2 + (tr.z - b.z) ** 2 < 1.3 * 1.3) : -1;
    if (trapHit >= 0) {
      removeFrom(traps, trapHit, true);
      removeFrom(thrown, k, true);
      continue;
    }

    let victim = null;
    for (const r of field) {
      if (r.finished || (r === b.owner && b.age < 0.8) || !canHit(b.owner, r)) continue;
      if (b.y < r.y - 0.2 || b.y > r.y + 2.6) continue; // jumped clean over it
      const dx = r.pos.x - b.x, dz = r.pos.z - b.z;
      if (dx * dx + dz * dz < 1.9 * 1.9) { victim = r; break; }
    }
    if (victim) {
      bunnyHit(victim, b.owner);
      removeFrom(thrown, k);
    } else if (b.life <= 0) {
      removeFrom(thrown, k, true);
    }
  }
}

function bunnyHit(r, owner) {
  particles.burst(r.pos.x, 1.8 + r.y, r.pos.z, 18, { color: [0xffffff, 0xffe14d, 0xff9ccb], speed: 7, up: 5, gravity: 8, life: 0.7, size: 0.2, drag: 2 });
  if (r.invuln > 0) return;
  r.spinTime = SPIN_TIME;
  r.invuln = SPIN_TIME + 1.2;
  r.speed *= 0.3;
  r.model.stars.visible = true;
  if (!loud()) return;
  if (r.human >= 0) {
    sfx.hit(PAN[r.human]); buzz('knock');
    sfx.animal(r.model.species, PAN[r.human]);
    hudMsg(r.human, t_('msg.bonk'), 'bad');
    restartAnim(huds[r.human].flash, 'on');
  } else {
    sfx.hit(owner.human >= 0 ? PAN[owner.human] : 0, owner.human >= 0 ? 0.7 : 0.3);
  }
  if (owner.human >= 0 && owner !== r) hudMsg(owner.human, t_('msg.hit', { name: r.name }), 'good');
}

function updateTraps(dt, t) {
  for (let k = traps.length - 1; k >= 0; k--) {
    const tr = traps[k];
    tr.age += dt;
    const g = tr.model.group;
    // drop to the ground with a little bounce, then breathe
    const fall = 0.28;
    g.position.y = tr.age < fall
      ? tr.y0 * (1 - (tr.age / fall) ** 2)
      : Math.abs(Math.sin((tr.age - fall) * 12)) * 0.25 * Math.exp(-(tr.age - fall) * 6);
    tr.model.body.scale.y = 1 + Math.sin(t * 3 + tr.x) * 0.04;
    if (tr.age > 40) { removeFrom(traps, k, true); continue; }
    if (tr.age < fall) continue;
    const victim = field.find(r => !r.finished && r.y < 0.35 && !(r === tr.owner && tr.age < 1.2) && canHit(tr.owner, r)
      && (r.pos.x - tr.x) ** 2 + (r.pos.z - tr.z) ** 2 < 1.5 * 1.5);
    if (!victim) continue;
    removeFrom(traps, k, true);
    hedgehogHit(victim, tr.owner);
  }
}

function hedgehogHit(r, owner) {
  particles.burst(r.pos.x, 0.8, r.pos.z, 14, { color: [0x5a3d2b, 0xe8c9a0, 0xffffff], speed: 5, up: 5, gravity: 12, life: 0.6, size: 0.16, drag: 1 });
  if (r.invuln > 0) return;
  r.rearTime = REAR_TIME;
  r.stunTime = REAR_TIME;
  r.invuln = REAR_TIME + 1;
  r.speed *= 0.2;
  if (!loud()) return;
  if (r.human >= 0) {
    sfx.ouch(PAN[r.human], r.model.species); buzz('knock');
    hudMsg(r.human, t_('msg.ouch'), 'bad');
    restartAnim(huds[r.human].flash, 'on');
  } else if (owner.human >= 0) {
    sfx.ouch(PAN[owner.human], r.model.species);
  }
  if (owner.human >= 0 && owner !== r) hudMsg(owner.human, t_('msg.trap', { name: r.name }), 'good');
}

function updateClouds(dt, t) {
  for (let k = clouds.length - 1; k >= 0; k--) {
    const c = clouds[k], g = c.model.group;
    if (c.state === 'fly' && c.target.finished) {
      c.target = leaderExcept(c.owner);
      if (!c.target) c.state = 'fade';
    }
    const r = c.target;
    if (c.state === 'fly') {
      const dx = r.pos.x - c.x, dz = r.pos.z - c.z, d = Math.hypot(dx, dz), step = 62 * dt;
      if (d <= step + 0.5) cloudArrives(c);
      else {
        c.x += (dx / d) * step;
        c.z += (dz / d) * step;
        g.rotation.y = Math.atan2(dx, dz);
      }
      c.y += (7.5 - c.y) * Math.min(1, dt * 3);
    } else if (c.state === 'rain') {
      c.x += (r.pos.x - c.x) * Math.min(1, dt * 12);
      c.z += (r.pos.z - c.z) * Math.min(1, dt * 12);
      c.y = 7 + r.y + Math.sin(t * 2) * 0.2;
      g.rotation.y += dt * 0.5;
      c.dropAcc += dt * 40;
      while (c.dropAcc > 1) {
        c.dropAcc -= 1;
        particles.spawn(c.x + (Math.random() - 0.5) * 3, c.y - 0.8, c.z + (Math.random() - 0.5) * 3, { color: 0x6ec6ff, vy: -20, life: 0.3, size: 0.08, opacity: 0.9 });
      }
      if ((c.rain -= dt) <= 0) c.state = 'fade';
    } else {
      c.fade += dt;
      g.scale.setScalar(1.5 * Math.max(0, 1 - c.fade / 0.4));
      if (c.fade > 0.4) { removeFrom(clouds, k); continue; }
    }
    g.position.set(c.x, c.y, c.z);
    for (const [i, drop] of c.model.drops.entries()) drop.position.y = -0.8 - ((t * 2 + i * 0.33) % 1) * 0.5;
    c.boltTime -= dt;
    c.bolt.visible = c.boltTime > 0 && Math.floor(c.boltTime * 30) % 2 === 0;
    if (c.bolt.visible) {
      c.bolt.position.set(c.x, c.y - 0.6, c.z);
      c.bolt.scale.set(1, Math.max(0.3, (c.y - 3 - r.y) / 4.6), 1);
      c.bolt.rotation.y = t * 3;
    }
  }
}

function cloudArrives(c) {
  const r = c.target;
  c.state = 'rain';
  c.rain = SOAK_TIME;
  c.boltTime = 0.35;
  r.soakTime = SOAK_TIME;
  r.stumbleTime = STUMBLE_TIME;
  r.speed *= 0.6;
  if (!loud()) return;
  const pan = r.human >= 0 ? PAN[r.human] : c.owner.human >= 0 ? PAN[c.owner.human] : 0;
  sfx.thunder(pan);
  sfx.rain(pan, SOAK_TIME);
  if (r.human >= 0) {
    sfx.animal(r.model.species, pan);
    hudMsg(r.human, t_('msg.soaked'), 'bad');
    restartAnim(huds[r.human].flash, 'on');
  }
  if (c.owner.human >= 0 && c.owner !== r) hudMsg(c.owner.human, t_('msg.rained', { name: r.name }), 'good');
}

// ------------------------------------------------------------------ riding the tram

// Riding about freely: stand still by a tram stop's sign for a moment and you are asked whether you
// want to wait for the tram; say yes and the next one along comes soon. Once it halts you are on
// board, the camera swings out for the view while it takes you through the city, and you get off
// whenever you like, at the stop nearest where the tram is (at the end of the line, everybody off).
// r.tram: { sign } being asked, { sign, edge, at, t } waiting, { riding, t, edge, view } on board.
const TRAM_NEAR = 7; // metres from the sign that count as standing at the stop
const TRAM_ASK = 1.5; // seconds standing still there before you are asked
const TRAM_GIVE_UP = 20; // metres: ride further off than this and you no longer wait
const tramsOn = () => (exploring() && city?.trams && TRAM_STOPS?.length ? city.trams : null);
const riding = r => !!r.tram?.riding;
const tramPos = new THREE.Vector3(), tramAhead = new THREE.Vector3();

// the stop within reach of the rider (its sign, or its post on the platform: tramstops.js), nearest first
function signNear(r) {
  let best = null, bd = TRAM_NEAR;
  for (const s of TRAM_STOPS) {
    const d = Math.min(Math.hypot(s.x - r.pos.x, s.z - r.pos.z), s.post ? Math.hypot(s.post.x - r.pos.x, s.post.z - r.pos.z) : Infinity);
    if (d < bd) { best = s; bd = d; }
  }
  return best;
}

// the line stopping here whose next tram is nearest: [how far that tram still is (metres, or
// Infinity when none is coming), [line, metres along it]]
function nextTram(T, sign) {
  let best = [Infinity, sign.serves[0]];
  for (const serve of sign.serves) {
    const [run, at] = serve, e = T.net.edges[run], nose = at + T.LENGTH / 2;
    for (const t of T.fleet.list) {
      const d = nose - t.head;
      if (t.edge === e && d > -0.5 && d < best[0] && t.served !== nose) best = [d, serve];
    }
  }
  return best;
}

// Every frame for each player, riding about freely: on board, waiting, or standing at a stop.
function updateTram(r, dt) {
  const T = tramsOn();
  if (!T) { if (r.tram) leaveTram(r); return; }
  if (riding(r)) return rideTram(r, T, dt);
  const w = r.tram;
  if (w?.edge) {
    // waiting: for the tram summoned, until it halts here with its doors open
    if (Math.hypot(w.sign.x - r.pos.x, w.sign.z - r.pos.z) > TRAM_GIVE_UP) { r.tram = null; return; }
    if (!w.t || w.t.edge !== w.edge || w.t.head > w.at + T.LENGTH / 2 + 1) w.t = T.fleet.summon(w.edge, w.at, r.pos.x, r.pos.z, busyTrams(r));
    if (w.t?.stopped && Math.abs(w.t.served - (w.at + T.LENGTH / 2)) < 1) boardTram(r, w.t, w.edge);
    return;
  }
  // standing still at a stop: after a moment, the question (not again until you have ridden on)
  const sign = Math.abs(r.speed) < 0.5 && !r.afloat ? signNear(r) : null;
  if (Math.abs(r.speed) > 3) r.tramQuiet = false;
  r.tramStill = sign && sign === r.tramSign && !r.tramQuiet ? r.tramStill + dt : 0;
  r.tramSign = sign;
  r.tram = r.tramStill > TRAM_ASK ? { sign } : null;
}

const busyTrams = (but = null) => new Set(humans.filter(o => o !== but && o.tram?.t).map(o => o.tram.t));

// The fire key (or a tap on the card): yes, wait for the tram; or, on board, get off. False when
// there is no tram to answer, so the key does what it always does.
function tramAction(r) {
  const T = tramsOn();
  if (!T || !r.tram) return false;
  if (riding(r)) leaveTram(r);
  else if (r.tram.edge) { r.tram = null; r.tramQuiet = true; } // changed your mind: not asked again till you ride on
  else {
    const sign = r.tram.sign, [, [run, at]] = nextTram(T, sign), edge = T.net.edges[run];
    r.tram = { sign, edge, at, t: T.fleet.summon(edge, at, r.pos.x, r.pos.z, busyTrams(r)) };
    sfx.ui();
  }
  return true;
}

function boardTram(r, t, edge) {
  r.tram = { riding: true, t, edge, view: 0, cam: null };
  t.wait = Math.min(t.wait, 2.5); // the doors close behind you
  Object.assign(r, { speed: 0, steer: 0, vy: 0, y: 0, stumbleTime: 0, spinTime: 0 });
  r.model.stars.visible = false;
  hudMsg(r.human, t_('tram.on'), 'good');
  sfx.jump(PAN[r.human]);
}

// On board: the rider goes where the middle of the tram is, looking the way it goes.
function rideTram(r, T, dt) {
  const { t } = r.tram;
  if (t.ended || t.edge !== r.tram.edge) return leaveTram(r, true);
  behind(t, T.LENGTH / 2, tramPos);
  behind(t, T.LENGTH / 2 - 4, tramAhead);
  r.pos.set(tramPos.x, 0, tramPos.z);
  r.base = tramPos.y;
  r.yaw = Math.atan2(tramAhead.x - tramPos.x, tramAhead.z - tramPos.z);
  r.speed = t.v;
  const c = humanControl(r);
  // the arrow keys turn the view round the tram; let go and it drifts back to looking ahead
  r.tram.view = wrapAngle(r.tram.view + c.steer * 1.4 * dt);
  if (Math.abs(c.steer) < 0.1) r.tram.view *= Math.exp(-dt * 0.5);
  if ((r.streetT = (r.streetT ?? 0) - dt) <= 0) {
    r.streetT = 0.3;
    r.street = streetAt(world.colliders, r.pos.x, r.pos.z) || r.street;
  }
}

// Off the tram, at its stop nearest where it is now: beside the sign, facing the way the tram went.
function leaveTram(r, end = false) {
  const T = city?.trams, ride = r.tram;
  r.tram = null;
  r.tramQuiet = true;
  if (!ride?.riding || !T) return;
  const run = T.net.edges.indexOf(ride.edge), here = ride.t.head - T.LENGTH / 2;
  let best = null, bd = Infinity;
  for (const s of TRAM_STOPS) {
    for (const [k, at] of s.serves) if (k === run && Math.abs(at - here) < bd) { best = s; bd = Math.abs(at - here); }
  }
  if (!best) return;
  const ux = Math.cos(best.a), uz = Math.sin(best.a), yaw = Math.atan2(ux, uz);
  // on the platform by its sign, or beside the sign where it has none
  if (best.post) r.pos.set(best.post.x - ux * 1.6, 0, best.post.z - uz * 1.6);
  else r.pos.set(best.x - ux * 1.6, 0, best.z - uz * 1.6);
  Object.assign(r, { yaw, speed: 0, steer: 0, y: 0, vy: 0, ground: 0, base: world.relief?.at(r.pos.x, r.pos.z) ?? 0, baseV: 0, onRoute: undefined });
  camYaw[r.human] = yaw;
  hudMsg(r.human, end ? t_('tram.end') : t_('tram.off', { name: best.name }), 'good');
  particles.burst(r.pos.x, 1, r.pos.z, 18, { color: 0xffe680, speed: 4, up: 3, life: 0.6, size: 0.22, grow: 0.5, opacity: 0.9, drag: 3 });
}

// The card: the question at a stop, then the tram on its way, then where it goes and stops next.
function updateTramCard(h, r, p) {
  const T = tramsOn(), w = r.tram;
  h.tram.classList.toggle('show', !!(T && w));
  if (!T || !w) return;
  const hint = (key, tap) => (touch.on && p === 0 ? t_(tap) : t_(key, { key: ctl(p).label.fire }));
  if (riding(r)) {
    const l = w.edge.line, along = w.t.head - T.LENGTH / 2;
    const next = l.stops.find(st => st.at > along + 5);
    badge(h, l);
    setText(h.tramLabel, next ? t_('tram.next', { name: next.name }) : '');
    setText(h.tramName, `→ ${l.to}`);
    setHtml(h.tramText, hint('tram.exitKey', 'tram.exitTap'));
  } else if (w.edge) {
    const l = w.edge.line, d = w.t ? Math.max(0, w.at + T.LENGTH / 2 - w.t.head) : null;
    badge(h, l);
    setText(h.tramLabel, `${t_('tram.stop')} · ${w.sign.name}`);
    setText(h.tramName, `→ ${l.to}`);
    setText(h.tramText, t_('tram.coming') + (d != null && d > 15 ? ` · ${Math.round(d / 10) * 10} m` : ''));
  } else {
    badge(h, null);
    setText(h.tramLabel, t_('tram.stop'));
    setText(h.tramName, w.sign.name);
    const via = [...new Map(w.sign.serves.map(([run]) => T.net.edges[run].line).map(l => [l.ref + l.to, l])).values()];
    setHtml(h.tramText, `${via.map(l => `${l.ref} → ${l.to}`).join(' · ')}<br>${hint('tram.askKey', 'tram.askTap')}`);
  }
}
function badge(h, line) {
  h.tramBadge.classList.toggle('plain', !line);
  setText(h.tramBadge, line ? line.ref : '🚋');
  h.tramBadge.style.setProperty('--line', line?.colour ?? '');
}
function setHtml(el, v) {
  if (el._v !== v) { el._v = v; el.innerHTML = v; }
}

// ------------------------------------------------------------------ visuals & cameras

function updateVisuals(r, dt, t) {
  const m = r.model;
  if (riding(r)) {
    // inside the tram, out of sight
    m.root.visible = false;
    if (r.boat) r.boat.visible = false;
    return;
  }
  m.root.position.set(r.pos.x, r.base + r.y, r.pos.z);
  m.root.rotation.y = r.yaw;
  // in the water the rider is in a boat of the Bootjes van Gent instead, at its wheel
  if (r.afloat && !r.boat) scene.add(r.boat = tourBoat());
  if (r.boat) {
    r.boat.visible = r.afloat;
    if (r.afloat) {
      r.boat.position.set(r.pos.x, (r.water ?? WATER) + r.y + Math.sin(t * 1.3 + r.i) * 0.05, r.pos.z);
      r.boat.rotation.set(Math.sin(t * 0.9 + r.i) * 0.015, r.yaw, -r.steer * Math.min(1, Math.abs(r.speed) / BOAT_SPEED) * 0.08, 'YXZ');
      m.root.visible = false;
      return;
    }
  }
  if (r.spinTime > 0) {
    const k = 1 - r.spinTime / SPIN_TIME;
    m.spin.rotation.y = (1 - Math.pow(1 - k, 3)) * Math.PI * 4;
    m.spin.position.y = Math.sin(k * Math.PI) * 0.6;
  } else {
    m.spin.rotation.y = 0;
    m.spin.position.y = 0;
  }
  m.root.visible = !(r.invuln > 0 && r.spinTime <= 0 && r.rearTime <= 0 && Math.floor(t * 16) % 2 === 0);

  const before = Math.floor(m.phase / (Math.PI / 2));
  m.animate(dt, r.speed, r.steer, t, {
    air: clamp((r.y - r.ground) / 0.4, 0, 1),
    vy: r.vy,
    rear: r.rearTime > 0 ? 1 - r.rearTime / REAR_TIME : 0,
    stumble: r.stumbleTime > 0 ? 1 - r.stumbleTime / STUMBLE_TIME : 0,
  });
  const sp = Math.abs(r.speed);
  if (r.human >= 0 && !m.quiet && loud() && r.grounded && sp > 2 && Math.floor(m.phase / (Math.PI / 2)) !== before) {
    sfx.hoof(Math.min(1, sp / MAX_SPEED), PAN[r.human]);
  }

  if (sp > 6 && r.grounded) {
    r.dustAcc += dt * sp * 0.7;
    while (r.dustAcc > 1) {
      r.dustAcc -= 1;
      const side = (Math.random() - 0.5) * 0.9;
      particles.spawn(r.pos.x - r.fx * 1.1 + r.fz * side, r.base + r.ground + 0.25, r.pos.z - r.fz * 1.1 - r.fx * side, {
        color: world.cfg.theme.dust, life: 0.6, size: 0.16, grow: 0.6, opacity: 0.4,
        vx: -r.fx * 2 + (Math.random() - 0.5), vy: 1 + Math.random(), vz: -r.fz * 2 + (Math.random() - 0.5), drag: 2,
      });
    }
  }
}

function updateObstacles(dt) {
  for (const ob of world.obstacles) {
    ob.tick?.(dt);
    if (!ob.wobble) continue;
    ob.wobble = Math.max(0, ob.wobble - dt);
    ob.group.rotation.x = Math.sin(ob.wobble * 40) * 0.12 * ob.wobble;
  }
}

function updateCameras(dt, t, order) {
  if (game.state === 'tour') return; // updateTour points it
  if (game.state === 'menu') {
    menuCam.fov = 50;
    const a = t * 0.12;
    const lead = order[0];
    menuLook.lerp(tmp.set(lead.pos.x, 1.5 + lead.base + lead.y * 0.5, lead.pos.z), 1 - Math.exp(-dt * 2));
    const [rad, up] = world.cfg.theme.menuCam ?? [26, 10];
    const mx = menuLook.x + Math.cos(a) * rad, mz = menuLook.z + Math.sin(a) * rad;
    menuCam.position.set(mx, up + menuLook.y - 1.5 + heightAt(mx, mz) - heightAt(menuLook.x, menuLook.z), mz);
    menuCam.lookAt(menuLook);
    return;
  }
  humans.forEach((r, p) => {
    const cam = cams[p];
    let fov = 68;
    if (game.state === 'countdown' || (game.state === 'paused' && game.resumeState === 'countdown')) {
      // Swing round from the horse's face to behind it while the lights count down.
      const k = clamp(game.cd / 3.1, 0, 1), e = k * k * (3 - 2 * k);
      const a = (1 - e) * Math.PI * (p % 2 ? -1 : 1);
      const bx = -r.fx, bz = -r.fz;
      const ox = bx * Math.cos(a) + bz * Math.sin(a), oz = -bx * Math.sin(a) + bz * Math.cos(a);
      const dist = 8.5 + (1 - e) * 3;
      cam.position.set(r.pos.x + ox * dist, r.base + 4.1 + (1 - e) * 1.2, r.pos.z + oz * dist);
      cam.lookAt(r.pos.x + r.fx * 6 * e, r.base + 1.7, r.pos.z + r.fz * 6 * e);
      camYaw[p] = r.yaw;
    } else if (riding(r)) {
      // the view from outside the tram as it goes, high up behind it and off to one side, swung
      // round as the player turns it, and easing after the tram through the bends
      const ride = r.tram;
      camYaw[p] += wrapAngle(r.yaw + ride.view - camYaw[p]) * (1 - Math.exp(-dt * 2));
      const fx = Math.sin(camYaw[p]), fz = Math.cos(camYaw[p]);
      const want = tmp.set(r.pos.x - fx * 24 + fz * 7, r.base + 10.5, r.pos.z - fz * 24 - fx * 7);
      if (!ride.cam) ride.cam = cam.position.clone();
      ride.cam.lerp(want, 1 - Math.exp(-dt * 2.5));
      cam.position.copy(ride.cam);
      // in a narrow street or round a corner: closer in and higher up rather than behind a wall
      if (world.colliders) {
        const k = Math.max(0.15, clearLine(world.colliders, r.pos.x, r.pos.z, ride.cam.x, ride.cam.z) - 0.06);
        cam.position.set(r.pos.x + (ride.cam.x - r.pos.x) * k, ride.cam.y + (1 - k) * 9, r.pos.z + (ride.cam.z - r.pos.z) * k);
      }
      cam.lookAt(r.pos.x + fx * 14, r.base + 2.5, r.pos.z + fz * 14);
      fov = 62;
    } else if (r.finished) {
      const a = t * 0.45 + p * Math.PI;
      cam.position.set(r.pos.x + Math.cos(a) * 11, r.base + 5, r.pos.z + Math.sin(a) * 11);
      cam.lookAt(r.pos.x, r.base + 1.6, r.pos.z);
    } else {
      camYaw[p] += wrapAngle(r.yaw - camYaw[p]) * (1 - Math.exp(-dt * 6));
      const fx = Math.sin(camYaw[p]), fz = Math.cos(camYaw[p]);
      let back = (world.cfg.theme.camBack ?? 8.5) * (r.afloat ? 1.6 : 1); // a boat is long: further back
      // riding about freely the camera can swing behind a wall: keep it on this side
      if (roaming() && world.colliders) back *= Math.max(0.15, clearLine(world.colliders, r.pos.x, r.pos.z, r.pos.x - fx * (back + 0.6), r.pos.z - fz * (back + 0.6)) - 0.06);
      // on a hill the camera keeps its height over the street behind, and looks up or down the street ahead
      const here = heightAt(r.pos.x, r.pos.z), behind = heightAt(r.pos.x - fx * back, r.pos.z - fz * back) - here;
      const ahead = heightAt(r.pos.x + fx * 6, r.pos.z + fz * 6) - here;
      cam.position.set(r.pos.x - fx * back, r.base + 4.1 + (r.afloat ? 1.8 : 0) + r.y * 0.5 + behind, r.pos.z - fz * back);
      cam.lookAt(r.pos.x + fx * 6, r.base + 1.7 + r.y * 0.7 + ahead, r.pos.z + fz * 6);
      fov = 66 + (Math.max(0, r.speed) / MAX_SPEED) * 10;
    }
    cam.fov += (fov - cam.fov) * Math.min(1, dt * 4);
  });
}

// On a big map the shadows only cover the area round the riders, so the sun moves along with them.
function followSun() {
  const theme = world.cfg.theme, who = aerial() ? [menuLook] : humans.map(r => r.pos);
  const x = Math.round(who.reduce((s, p) => s + p.x, 0) / who.length);
  const z = Math.round(who.reduce((s, p) => s + p.z, 0) / who.length);
  sun.target.position.set(x, 0, z);
  sun.target.updateMatrixWorld();
  sun.position.set(x + theme.sun.pos[0], theme.sun.pos[1], z + theme.sun.pos[2]);
}

function render() {
  const w = innerWidth, h = innerHeight;
  followSun();
  headlamps.forEach((l, p) => {
    const r = aerial() ? null : humans[p];
    if (!r) return l.position.set(menuLook.x, 3, menuLook.z);
    l.position.set(r.pos.x + Math.sin(r.yaw) * 2, r.base + r.y + 2.6, r.pos.z + Math.cos(r.yaw) * 2);
  });
  renderer.shadowMap.needsUpdate = true;
  // x, y from the top-left corner, in CSS pixels; WebGL counts y from the bottom.
  const view = (cam, x, y, vw, vh, from) => {
    if (HILLS) {
      // the hills are drawn as seen from this viewport's rider, so its shadows are too
      lookFrom(from.x, from.z);
      renderer.shadowMap.needsUpdate = true;
    }
    renderer.setViewport(x, h - y - vh, vw, vh);
    renderer.setScissor(x, h - y - vh, vw, vh);
    cam.aspect = vw / vh;
    const fov = cam.fov;
    if (cam.aspect < 1) cam.fov = fov + (1 - cam.aspect) * 40; // keep a usable sideways view in portrait
    cam.updateProjectionMatrix();
    weather.follow(cam);
    renderer.render(scene, cam);
    cam.fov = fov;
  };
  renderer.setScissorTest(true);
  const hw = Math.floor(w / 2);
  lookAround((aerial() ? [menuCam] : cams.slice(0, game.players)).map(c => c.position)); // build what came into sight
  if (aerial()) view(menuCam, 0, 0, w, h, menuLook);
  else if (game.players === 1) view(cams[0], 0, 0, w, h, humans[0].pos);
  else {
    view(cams[0], 0, 0, hw, h, humans[0].pos);
    view(cams[1], hw, 0, w - hw, h, humans[1].pos);
  }
}

// ------------------------------------------------------------------ loop

function step(dt) {
  if (game.state === 'paused') return;
  game.time += dt;
  const t = game.time;
  if (game.state === 'countdown' && (game.cd += dt) >= 3.5) game.state = 'race';
  if (game.state === 'race') game.raceTime += dt;
  tickSky(dt);

  for (const r of field) {
    if (r.human >= 0 && game.state === 'race') updateTram(r, dt);
    if (riding(r)) continue; // the tram takes them along
    let c;
    if (game.state === 'countdown' || game.state === 'briefing') c = { throttle: 0, steer: 0 };
    else if (r.human >= 0 && game.state === 'race' && !r.finished) c = humanControl(r);
    else c = aiControl(r, dt, r.finished || game.state === 'results');
    stepRacer(r, dt, c);
  }
  collideRacers();
  updatePickups(dt, t);
  updateThrown(dt);
  updateTraps(dt, t);
  updateClouds(dt, t);
  updateObstacles(dt);
  if (quest) {
    quest.update(dt, t, humans, game.state === 'race');
    if (game.state === 'race') questEvents();
  }
  const order = finalOrder();
  order.forEach((r, i) => (r.place = i + 1));
  for (const r of field) updateVisuals(r, dt, t);
  particles.update(dt);
  city.update(dt, t);
  city.traffic?.update(dt, aerial() ? [menuCam.position] : cams.slice(0, game.players).map(c => c.position), field);
  world.scenery.update(dt, t);
  world.arrows?.update(t);
  world.bikers?.update(dt, t, track, field, bikerHit);
  // the cyclists about the old town, but not in a race's way
  for (const im of Object.values(world.cyclists?.parts ?? {})) im.visible = roaming();
  if (roaming()) world.cyclists?.update(dt, t, field, bikerHit);
  world.people?.update(dt, t, field, pedestrianBump, (r, size) => r.human >= 0 && loud() && sfx.bark(PAN[r.human], size));
  if (game.state === 'tour') updateTour(dt);
  updateCameras(dt, t, order);

  if (!aerial()) {
    updateHud();
    updateCountdown();
    drawMinimap();
  }
  if (game.state === 'race' && game.endTimer > 0 && (game.endTimer -= dt) <= 0) showResults();
}

// ------------------------------------------------------------------ gamepads

// Gamepad k plays for player k. A (or RT, or stick up) runs, B/LT brakes, X/RB jumps,
// Y/LB uses the item (hold B to throw backwards), Start pauses. In the menu the d-pad moves around.
const pads = { prev: [{}, {}], input: [null, null] };

function pollPads() {
  const list = navigator.getGamepads ? [...navigator.getGamepads()].filter(gp => gp && gp.connected) : [];
  for (let k = 0; k < MAX_PLAYERS; k++) {
    const gp = list[k];
    if (!gp) { pads.input[k] = null; continue; }
    const b = i => !!gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.5);
    const ax = gp.axes[0] ?? 0, ay = gp.axes[1] ?? 0;
    const now = {
      a: b(0), b: b(1), x: b(2), y: b(3), lb: b(4), rb: b(5), lt: b(6), rt: b(7), start: b(9),
      left: b(14) || ax < -0.5, right: b(15) || ax > 0.5, up: b(12) || ay < -0.5, down: b(13) || ay > 0.5,
    };
    const prev = pads.prev[k];
    const edge = key => now[key] && !prev[key];
    pads.prev[k] = now;
    if (Object.values(now).some(Boolean)) setTouchMode(false);
    pads.input[k] = {
      steer: clamp(Math.abs(ax) > 0.15 ? -ax : (now.left ? 1 : 0) - (now.right ? 1 : 0), -1, 1),
      throttle: (now.a || now.rt || now.up ? 1 : 0) - (now.b || now.lt || now.down ? 1 : 0),
      back: now.b || now.lt || now.down,
    };
    if (game.state === 'menu') {
      if (edge('up')) onPress('ArrowUp');
      if (edge('down')) onPress('ArrowDown');
      if (edge('left')) onPress('ArrowLeft');
      if (edge('right')) onPress('ArrowRight');
      if (edge('a') || edge('start')) onPress('Enter');
    } else if (game.state === 'race' || game.state === 'countdown') {
      if (edge('start')) onPress('Escape');
      if (game.state === 'race' && k < humans.length) {
        if (edge('x') || edge('rb')) jump(humans[k]);
        if ((edge('y') || edge('lb')) && !tramAction(humans[k])) useItem(humans[k], pads.input[k].back);
      }
    } else if (game.state === 'tour') {
      if (edge('a') || edge('right')) tourNext();
      else if (edge('b') || edge('start')) toMenu();
    } else if (game.state === 'briefing') {
      if (edge('a') || edge('start')) beginQuest();
      else if (edge('b')) toMenu();
    } else if (game.state === 'paused') {
      if (edge('start')) setPaused(false);
      else if (!pauseEl.classList.contains('hidden')) {
        if (edge('left') || edge('up')) onPress('ArrowLeft');
        if (edge('right') || edge('down')) onPress('ArrowRight');
        if (edge('a')) onPress('Enter');
      }
    } else if (game.state === 'results') {
      if (edge('a') || edge('start')) onPress('Enter');
      else if (edge('b')) onPress('KeyT');
    }
  }
}

let toastTimer = 0;
function toast(text) {
  $('toast').textContent = text;
  $('toast').classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.add('hidden'), 3500);
}
addEventListener('gamepadconnected', e => toast(t_('pad', { n: Math.min(MAX_PLAYERS, e.gamepad.index + 1) })));

// The street's own sounds: cars and bikes going by, and your own bike, heard from each player's camera.
const ambient = new Ambient(sfx);
const ambientSources = [], lookDir = new THREE.Vector3();
function updateAmbient(dt) {
  const on = loud() && game.state !== 'paused';
  const listeners = on ? cams.slice(0, game.players).map((cam, k) => {
    cam.getWorldDirection(lookDir);
    const n = Math.hypot(lookDir.x, lookDir.z) || 1;
    return { x: cam.position.x, z: cam.position.z, dx: lookDir.x / n, dz: lookDir.z / n, pan: game.players > 1 ? PAN[k] : 0 };
  }) : [];
  const src = ambientSources;
  src.length = 0;
  if (on) {
    for (const c of city?.traffic?.cars ?? []) {
      if (!c.on) continue;
      src.push({ key: c, kind: 'car', x: c.pos.x, z: c.pos.z, speed: c.speed });
      if (c.type === 'police') src.push({ key: c, kind: 'siren', x: c.pos.x, z: c.pos.z, speed: c.speed });
    }
    for (const b of world.bikers?.list ?? []) {
      if (b.state === 'ride') src.push({ key: b, kind: 'bike', x: b.model.root.position.x, z: b.model.root.position.z, speed: b.speed });
    }
    for (const r of field) {
      if (r.model.species !== 'bike' || !r.grounded || riding(r)) continue; // on the tram the bike is out of sight
      src.push({ key: r, kind: 'bike', x: r.pos.x, z: r.pos.z, speed: Math.abs(r.speed), own: r.human >= 0 && r.human < game.players ? r.human : null });
    }
  }
  ambient.update(dt, on, listeners, src);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  pollPads();
  step(dt);
  tickFade(dt);
  weather.update(dt);
  updateAmbient(dt);
  updateTouchLayer();
  render();
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------------ input

const keys = new Set();
const isStart = code => code === 'Space' || code === 'Enter' || code === 'NumpadEnter';

function onPress(code) {
  sfx.unlock();
  if (code === 'KeyM') return toggleSound();
  switch (game.state) {
    case 'menu': {
      const up = code === 'KeyW' || code === 'ArrowUp', down = code === 'KeyS' || code === 'ArrowDown';
      const left = code === 'KeyA' || code === 'ArrowLeft', right = code === 'KeyD' || code === 'ArrowRight';
      const rows = navRows();
      if (up || down) {
        menuRow = (menuRow + (down ? 1 : -1) + rows.length) % rows.length;
        sfx.ui();
        renderMenu();
      } else if (left || right) {
        const d = right ? 1 : -1, row = rows[menuRow];
        if (row === 'track') selectTrack(game.trackIdx + d);
        else if (row === 'kind') setKind(KINDS[(KINDS.indexOf(game.kind) + d + KINDS.length) % KINDS.length]);
        else if (row === 'quest') selectMission(game.mission + d);
        else if (row === 'tour') setTourMode(TOUR_MODES[(TOUR_MODES.indexOf(game.tourMode) + d + TOUR_MODES.length) % TOUR_MODES.length]);
        else if (row === 'lang') { const codes = Object.keys(LANGS); setLanguage(codes[(codes.indexOf(getLang()) + d + codes.length) % codes.length]); }
      } else if (isStart(code)) startRace();
      break;
    }
    case 'tour':
      if (isStart(code) || code === 'ArrowRight' || code === 'KeyD') tourNext();
      else if (code === 'Escape' || code === 'KeyT') toMenu();
      break;
    case 'briefing':
      if (isStart(code)) beginQuest();
      else if (code === 'Escape' || code === 'KeyT') toMenu();
      break;
    case 'countdown':
    case 'race':
      if (code === 'Escape') { setPaused(true); break; }
      if (code === 'KeyK') { openBigMap(); break; } // K for kaart
      if (game.state !== 'race') break;
      humans.forEach((r, p) => {
        const k = ctl(p);
        if (k.fire.includes(code) && tramAction(r)) return; // at a tram stop, or on the tram
        if (k.fire.includes(code)) useItem(r, held(k.down));
        if (k.jump.includes(code)) jump(r);
      });
      break;
    case 'paused':
      if (big && pauseEl.classList.contains('hidden')) {
        // on the big map: Enter teleports, Escape forgets the spot and then closes the map
        if (isStart(code)) confirmTeleport();
        else if (code === 'Escape' || code === 'KeyP' || code === 'KeyK') {
          if (big.pick && code === 'Escape') { big.pick = null; drawBigMap(); }
          else closeBigMapAndPlay();
        }
        break;
      }
      if (code === 'Escape') setPaused(false);
      else if (code === 'ArrowLeft' || code === 'ArrowUp') selectPause(pauseSel - 1);
      else if (code === 'ArrowRight' || code === 'ArrowDown') selectPause(pauseSel + 1);
      else if (isStart(code)) pauseBtns[pauseSel].click();
      break;
    case 'results':
      if (game.time - game.resultsAt < 1.2) break;
      if (isStart(code)) startRace();
      else if (code === 'KeyT') toMenu();
      break;
  }
}

addEventListener('keydown', e => {
  if (e.target instanceof HTMLInputElement) {
    if (e.key === 'Enter' || e.key === 'Escape') e.target.blur();
    return;
  }
  if (GAME_KEYS.has(e.code)) e.preventDefault();
  if (e.isTrusted) setTouchMode(false); // a real keyboard: show keyboard controls again
  keys.add(e.code);
  if (!e.repeat) onPress(e.code);
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('pointerdown', e => {
  sfx.unlock();
  // a mouse click anywhere on the race pauses it (touch steers, so only the mouse)
  if (e.pointerType !== 'touch' && (game.state === 'race' || game.state === 'countdown')
    && !e.target.closest('button, #minimap, #touch, .tramcard')) setPaused(true);
});
// a click beside the pause card carries on (and must not reach the click-to-pause above)
pauseEl.addEventListener('pointerdown', e => {
  if (e.target.closest('.card, a')) return;
  e.stopPropagation();
  setPaused(false);
});
addEventListener('blur', () => {
  keys.clear();
  setPaused(true);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) setPaused(true);
  else if (sfx.ctx) sfx.unlock(); // the menu's music, back after the phone stopped it (iOS)
});
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight, false);
  if (world) setupMinimap();
  if (big) {
    bigEl.classList.toggle('side', sideIndex());
    layoutBigMap();
    showBigTab(big.tab);
  }
});

// ------------------------------------------------------------------ touch controls

const touch = { on: false, shown: false, steer: 0, throttle: 0, steerId: null, originX: 0, zoneLeft: 0 };
const touchEl = $('touch'), steerZone = $('steerZone'), stick = $('stick'), knob = $('knob');
const tItem = $('tItem'), tItemIco = tItem.querySelector('.ico'), tItemQueue = tItem.querySelector('.queue');
const STICK_R = 60;

function setTouchMode(on) {
  if (touch.on === on) return;
  touch.on = on;
  document.body.classList.toggle('touch', on);
  if (on && game.mode > 1 && game.state === 'menu') setMode(1);
  renderMenu();
}

function updateTouchLayer() {
  const show = touch.on && (game.state === 'race' || game.state === 'countdown' || game.state === 'paused');
  if (show === touch.shown) return;
  touch.shown = show;
  touchEl.classList.toggle('hidden', !show);
  if (!show) {
    touch.steer = 0;
    touch.throttle = 0;
    knob.style.transform = '';
  }
}

// A floating stick: it appears under the thumb, and follows it once dragged past its edge.
// Pushing it up rides forward and down backs up (in a race or a quest the horse gallops anyway, so down brakes).
function steerTo(x, y) {
  let dx = x - touch.originX, dy = y - touch.originY;
  const d = Math.hypot(dx, dy);
  if (d > STICK_R) {
    dx *= STICK_R / d;
    dy *= STICK_R / d;
    touch.originX = x - dx;
    touch.originY = y - dy;
    stick.style.left = touch.originX - touch.zoneLeft + 'px';
    stick.style.top = touch.originY - touch.zoneTop + 'px';
  }
  touch.steer = -dx / STICK_R;
  touch.throttle = -dy / STICK_R;
  knob.style.transform = `translate(${dx}px, ${dy}px)`;
}

steerZone.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (touch.steerId !== null) return;
  touch.steerId = e.pointerId;
  try { steerZone.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
  const rect = steerZone.getBoundingClientRect();
  touch.zoneLeft = rect.left;
  touch.zoneTop = rect.top;
  touch.originX = e.clientX;
  // riding on by itself: carry on at that pace from wherever the thumb comes down
  touch.originY = e.clientY + (exploring() ? Math.max(0, touch.throttle) * STICK_R : 0);
  stick.style.left = e.clientX - rect.left + 'px';
  stick.style.top = e.clientY - rect.top + 'px';
  stick.classList.remove('rest');
  stick.classList.add('on');
  steerZone.classList.add('active');
  steerTo(e.clientX, e.clientY);
});
steerZone.addEventListener('pointermove', e => { if (e.pointerId === touch.steerId) steerTo(e.clientX, e.clientY); });
const endSteer = e => {
  if (e.pointerId !== touch.steerId) return;
  touch.steerId = null;
  touch.steer = 0;
  // exploring, let go of the stick while riding forward and the horse keeps going at that pace,
  // the knob left up where it was, until the stick is pulled back
  touch.throttle = exploring() && touch.throttle > 0.15 ? touch.throttle : 0;
  knob.style.transform = touch.throttle ? `translate(0, ${-touch.throttle * STICK_R}px)` : '';
  stick.style.left = stick.style.top = '';
  stick.classList.remove('on');
  stick.classList.add('rest');
  steerZone.classList.remove('active');
  steerZone.classList.add('used'); // the hint is only for the start
};
steerZone.addEventListener('pointerup', endSteer);
steerZone.addEventListener('pointercancel', endSteer);

function touchButton(el, down, up = () => {}) {
  el.addEventListener('pointerdown', e => {
    e.preventDefault();
    sfx.unlock();
    try { el.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    el.classList.add('pressed');
    down();
  });
  const release = () => { el.classList.remove('pressed'); up(); };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
}
touchButton($('tJump'), () => { if (game.state === 'race') jump(racers[0]); });
touchButton(tItem, () => { if (game.state === 'race') useItem(racers[0], touch.throttle < -0.5); });
touchEl.addEventListener('contextmenu', e => e.preventDefault());

addEventListener('touchstart', () => setTouchMode(true), { passive: true, capture: true });
addEventListener('touchend', () => sfx.unlock(), { passive: true }); // iOS only unlocks audio on touchend
addEventListener('click', () => sfx.unlock());

// A link to one sight, ?at=<its id> (the site's page about it has one), or to any place,
// ?pos=<x>,<z>&n=<its name> (the site's map page): straight into riding about freely, alone, on a
// street a little way back from it (so it is in view, not a wall up close) and looking at it.
// Nothing of it is saved in the settings.
function visitFromLink() {
  const q = new URLSearchParams(location.search);
  const sight = q.get('at') && SIGHTS?.find(s => s.id === q.get('at'));
  const [px, pz] = (q.get('pos') || '').split(',').map(Number);
  const place = sight ? { x: sight.x, z: sight.z, r: sight.r, name: local(sight.text).name }
    : Number.isFinite(px) && Number.isFinite(pz) ? { x: px, z: pz, r: 30, name: (q.get('n') || '').slice(0, 80) } : null;
  if (!place) return;
  report('visit_from_link', { sight: sight?.id ?? 'map' });
  game.kind = 'mission';
  game.mission = 0;
  game.mode = 1;
  missionPlayer();
  setTrack(game.trackIdx); // the minimap, for riding about freely
  startRace();
  const back = place.r * 0.6, spots = [];
  for (const rd of world.cfg.map.roads) {
    for (let k = 0; k < rd.p.length; k += 2) spots.push([Math.abs(Math.hypot(rd.p[k] - place.x, rd.p[k + 1] - place.z) - back), rd.p[k], rd.p[k + 1]]);
  }
  spots.sort((a, b) => a[0] - b[0]);
  const pick = spots.slice(0, 50).map(([, x, z]) => landingAt(x, z)).find(p => p.ok) ?? placeLanding(place);
  humans.forEach(r => { r.yaw = Math.atan2(place.x - pick.x, place.z - pick.z); });
  teleport(pick);
}

// ------------------------------------------------------------------ boot

setLang(game.lang);
await bootStep('horses');
buildMenu();
await bootStep('city');
setTrack(game.trackIdx);
setLanguage(game.lang);
toMenu();
setTouchMode(LOW_POWER);
visitFromLink();
await bootStep('paint');
requestAnimationFrame(frame);
music.ahead = 0.15; // loaded: back to short notice, so the music stops as soon as a game starts
// The menu is filled in and the first frame is drawn: drop the loading screen.
requestAnimationFrame(() => requestAnimationFrame(() => {
  document.body.classList.remove('booting');
  setTimeout(() => document.getElementById('loader').remove(), 500);
}));

// Handy for poking at the game from the dev console.
window.ghent3d = { touch, setTouchMode, setLanguage, pickAnimal, cycleAnimal, pads, pollPads, game, racers, get field() { return field; }, traps, thrown, clouds, get world() { return world; }, get tour() { return tour; }, setSky, startRace, toMenu, selectTrack, setMode, setKind, useItem, jump, music, sfx, renderer, scene, step, render };
window.__pr = { teleport, get world() { return world; }, get humans() { return humans; }, game }; // DEBUG-RELIEF
