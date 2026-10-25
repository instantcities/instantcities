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
import { buildCity, buildScenery, tourBoat, rowingBoat, swimmer, drawAgain } from './scenery.js';
import { helicopter, heliShadow } from './heli.js';
import { carGroup, CAR_TYPES } from './cars.js';
import { createTumble, fallPose } from './tumble.js';
import { parkingRows, groundAt, rowAhead, rowEnd, BAND } from './parking.js';
import { findMouths, buildArrows } from './junctions.js';
import { Bikers, Cyclists } from './bikers.js';
import { LOW_POWER, SIGHT } from './device.js';
import { packNormals, tileUp, lookAround } from './tiles.js';
import { People, SHIRTS, alongside, busyPaths } from './people.js';
import { BUSY, PORTALS } from './city.js';
import { buildColliders, addCarColliders, collide, inWater, swimAt, waterLevel, bankAt, streetAt, clearLine, inPolygon } from './collide.js';
import { buildRelief, WADE, WATER } from './relief.js';
import { HILLS, useHills, fitToHills, lookFrom, hillsOn, heightAt, slopeAlong } from './terrain.js';
import { Particles } from './effects.js';
import { sfx, music } from './sound.js';
import { buzz } from './haptics.js';
import { Ambient } from './ambient.js';
import { Quest } from './quests.js';
import { QUESTS, PLACES, SIGHTS, SIGHT_PAGES, THEME, RUNS, CHARACTERS, LANDMARKS, SQUARES, MONUMENTS, FAMOUS, TRAM_STOPS, STOPS, TOUR, TOUR_PROPS, NAME, FREE_START, ROWING, DEMO, INSIDE } from './city.js';
import { LIGHT as INDOOR_LIGHT } from './interiors.js';
import { Tour, STANDING } from './tour.js';
import { hoopsAlong, Course, hoopMeshes } from './dragonfly.js';
import { Demo } from './demo.js';
import { behind } from './tramnet.js';
import { squareAt } from './squares.js';
import { splatHit, updateSplats, vehicleSplat, resetSplats } from './splat.js';
import { SECTION as TRAM_SECTION, W as TRAM_W } from './trams.js';
import { Weather, TIMES, WEATHERS, atmosphere, isNight, snowCover } from './weather.js';

// Every day/night and weather pair, as 'time:weather', and 'auto' for the sky that changes by itself.
// A city may leave some weather out (THEME.weathers: Lecce never sees snow), or some time of day
// (THEME.times: inside a church it is always day).
const DAYS = THEME.times ?? TIMES;
const COMBOS = DAYS.flatMap(tm => (THEME.weathers ?? WEATHERS).map(wx => `${tm}:${wx}`));
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
const SWIM_SPEED = 6; // swimming is slower still
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
// the police helicopter (the rescue quest): top speed, how quickly it gets there, climbing and
// sinking speed, how fast it turns, and how high it may go; below LOW it bumps into the buildings
const HELI_SPEED = 48, HELI_ACCEL = 16, HELI_CLIMB = 11, HELI_TURN = 1.5, HELI_TOP = 180, HELI_LOW = 18, HELI_RADIUS = 4;
// and how it flies, as stepHeli has it (rise, sink: how quickly it gets to its climbing speed and back)
const HELI = { speed: HELI_SPEED, accel: HELI_ACCEL, climb: HELI_CLIMB, rise: 14, sink: 9, turn: HELI_TURN, top: HELI_TOP, low: HELI_LOW, radius: HELI_RADIUS, floor: 0 };
// the golden dragon of the tour flown yourself (dragonfly.js): as the helicopter, but climbing and
// diving much more sharply, turning a little quicker, slimmer, and never down on the ground
const DRAGON = { speed: 42, accel: 20, climb: 28, rise: 45, sink: 30, turn: 1.8, top: 180, low: 18, radius: 2.2, floor: 2.5 };
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

// A link can open the menu on one kind, ?menu=tour (the site's "Virtual tour" buttons).
const linkKind = new URLSearchParams(location.search).get('menu');
const startKind = ['mission', 'race', 'tour'].includes(linkKind) ? linkKind : saved.kind;

const game = {
  state: 'menu', // menu | briefing (a quest, before you start) | countdown | race | paused | results | tour (flying the tour)
  resumeState: 'race',
  mode: clamp(Math.floor(saved.mode ?? 1), 1, MAX_PLAYERS), // number of human players chosen for races
  players: 1, // humans riding right now
  kind: startKind === 'race' && THEME.races !== false ? 'race' : startKind === 'tour' && TOUR ? 'tour' : 'mission', // mission: ride about the map, no race, no computer riders; tour: fly through the city
  tourMode: saved.tourMode === 'fly' && TOUR?.ride ? 'fly' : 'auto', // the tour plays on its own, or you fly it yourself, on the dragon through the hoops
  tourSpeed: [1, 1.5, 0.5].includes(saved.tourSpeed) ? saved.tourSpeed : 1, // how fast it plays (the round button by the menu)
  gameMusic: saved.gameMusic ?? false, // opt in through the hidden music settings
  paintball: saved.paintball ?? false, // car+paintball mode: a paintball gun (instead of tequila shots), and cars to borrow
  questsWon: Array.isArray(saved.questsWon) ? saved.questsWon : [], // the ids of the quests won at least once
  paintballUnlocked: saved.paintballUnlocked ?? false, // opened up early through the hidden settings
  tourMusic: saved.tourMusic ?? true, // the tour's own music plays along it (the round button by the speed's)
  // which mission: 0 is exploring freely, after it the quests (QUESTS[mission - 1])
  mission: clamp(Math.floor(saved.mission ?? (saved.kind === 'quest' ? (saved.quest ?? 0) + 1 : 0)), 0, QUESTS.length),
  mounts: [0, 1].map(p => (MOUNTS.includes(saved.mounts?.[p]) || (saved.mounts?.[p] === 'heli' && saved.questsWon?.includes('heli')) ? saved.mounts[p] : 'bike')), // what each player rides, or on foot (or flies)
  lang: saved.lang === 'nl' ? 'nl' : 'en', // English, unless Dutch was picked
  style: saved.style === 'pro' ? 'pro' : 'fun', // the look of the menus: playful, or professional (white and navy, a serif)
  trackIdx: clamp(Math.floor(saved.track ?? 0), 0, TRACKS.length - 1),
  laps: clamp(Math.floor(saved.laps ?? 3), 1, 9),
  weapons: saved.weapons ?? true, // false = a pure race: no items on the track
  cards: saved.cards ?? true, // the cards about the sights you ride up to while exploring (the pause menu's)
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


// ?watch: the tour plays by itself, without the menu, the buttons or the cards, and nothing is
// saved. For the site's pages, which show it behind their own words (an iframe; core/game.html marks
// the page early, core/style.css hides the rest); a page can pause it while it is out of sight.
// ?watch=cards: the whole tour with its cards, as from the menu, starting straight away (the
// site's "watch the tour" link).
const WATCH = new URLSearchParams(location.search).get('watch');
let watchPaused = false;

function saveSettings() {
  if (WATCH != null) return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      mode: game.mode, track: game.trackIdx, laps: game.laps, sound: sfx.sfxOn || sfx.musicOn, music: sfx.musicOn, sfx: sfx.sfxOn, gameMusic: game.gameMusic, paintball: game.paintball, questsWon: game.questsWon, paintballUnlocked: game.paintballUnlocked,
      picks: game.picks, playerNames: game.playerNames, weapons: game.weapons, cards: game.cards, lang: game.lang, style: game.style,
      kind: game.kind, mounts: game.mounts, mission: game.mission, sky: game.sky, tourMode: game.tourMode, tourSpeed: game.tourSpeed, tourMusic: game.tourMusic,
    }));
  } catch { /* private mode: settings just won't stick */ }
}

// Exploring freely starts again about where you last were in this city (kept in this browser every
// couple of seconds you ride about), or at the city's own spot the first time, and on Restart.
const SPOT_KEY = `ghent3d.spot.${NAME.en}`;
function lastSpot() {
  try {
    const s = JSON.parse(localStorage.getItem(SPOT_KEY));
    return [s?.x, s?.z, s?.yaw].every(Number.isFinite) ? s : null;
  } catch { return null; }
}
let spotT = 0;
function keepSpot(r, dt) {
  if (demo || (spotT -= dt) > 0) return; // (not where the demo rode)
  spotT = 2;
  if (riding(r) || r.afloat || r.y > 0.3) return; // not on the tram, in the water, on the cars or mid-jump
  try {
    localStorage.setItem(SPOT_KEY, JSON.stringify({ x: +r.pos.x.toFixed(1), z: +r.pos.z.toFixed(1), yaw: +r.yaw.toFixed(2) }));
  } catch { /* private mode: you start at the city's spot */ }
}

// ------------------------------------------------------------------ scene

const canvas = $('game');
// Phones and tablets skip the multisampling and draw fewer pixels: both cost a lot of GPU memory.
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !LOW_POWER, stencil: true, powerPreference: 'high-performance' }); // stencil: the holes for the water
renderer.setPixelRatio(Math.min(devicePixelRatio, LOW_POWER ? 1.25 : 2));
canvas.addEventListener('webglcontextrestored', drawAgain); // the city's canvases, shrunk once uploaded: drawn again
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
// in the helicopter: the rescue quest, or riding about freely in it once that quest is won
const heliMode = () => (questing() && !!QUESTS[game.mission - 1]?.heli) || (exploring() && game.mounts[0] === 'heli');
const freeStick = () => exploring() || (questing() && (!!QUESTS[game.mission - 1]?.zombies || !!QUESTS[game.mission - 1]?.heli)); // the touch stick rides forward and back itself, no automatic forward (exploring, and the zombie missions)
const touring = () => game.kind === 'tour';
// A sight's own page, where the city has them (SIGHT_PAGES in its city.js: the address the sight's id
// goes after). '' when the city has no such pages.
const sightPage = id => (SIGHT_PAGES ? `${SIGHT_PAGES}${id}/` : '');
const flying = () => touring() && game.tourMode === 'fly'; // the tour flown yourself (dragonfly.js)
const touringNow = () => game.state === 'tour' || (game.state === 'paused' && game.resumeState === 'tour'); // flying the tour, or paused in it
const aerial = () => game.state === 'menu' || touringNow(); // the camera flies over the city, nobody rides it
const KINDS = ['mission', ...(THEME.races === false ? [] : ['race']), ...(TOUR ? ['tour'] : [])]; // (a city can have no races: THEME.races false, inside a church)
let quest = null; // the quest being played (see js/quests.js)
let demo = null; // the film about the game, playing (?demo, see js/demo.js)
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
// Riding about (exploring or on a quest) every animal has its species' own coat instead: a brown
// horse, a white cow, a pink pig...
function createRider(h, mount) {
  const def = { ...h, number: STABLE.indexOf(h) + 1, labelLayer: 1, standardCoat: roaming() };
  if (mount === 'foot' || mount === 'heli') return createWalker(def, STABLE.indexOf(h)); // (in the helicopter, out of sight)
  if (mount === 'bike') return createCyclist(def, STABLE.indexOf(h));
  return createAnimal({ ...def, species: mount });
}
// one model per character and mount, made when first needed
const riderModels = new Map();
const riderModel = (h, mount) => {
  const key = h.id + ':' + mount + ':' + roaming();
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
    if (this.model) scene.remove(this.model.root);
    this.def = h;
    this.mount = mount;
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
    if (this.car) { scene.remove(this.car.model); this.car.model = null; this.car = null; sfx.engine(null); } // a stolen car you were in is gone
    this.carNear = null;
    if (this.heliModel) { scene.remove(this.heliModel, this.heliShadow); this.heliModel = this.heliShadow = null; }
    this.heli = false;
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
      tram: null, tramQuiet: false, railTime: 0, railCd: 0, railSide: 1, railDown: false,
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

// the sights' cards' icon (and the tour's): an eye, something to look at here
const EYE = '<svg class="sight-eye" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3.2"/></svg>';
const LM_PILL = '<div class="lmp hidden"><span class="lma">➤</span><span class="lme"></span><b></b><small></small></div>';
const huds = [0, 1].map(buildHud);
// the tram card answers a click or a tap: wait for the tram, get on the bus, or get off; its
// button takes you inside the tram to sit by a window, or back out for the view from outside
huds.forEach((h, p) => h.tram.addEventListener('pointerdown', e => {
  e.stopPropagation();
  if (game.state === 'race') tramAction(humans[p]);
}));
// the door card goes through the door
huds.forEach((h, p) => h.door.addEventListener('pointerdown', e => {
  e.stopPropagation();
  if (game.state === 'race') doorAction(humans[p]);
}));
huds.forEach((h, p) => h.tramSeat.addEventListener('pointerdown', e => {
  e.stopPropagation();
  const r = humans[p];
  if (game.state !== 'race') return;
  if (r.tram?.ask || r.bus?.ask) { if (r.tram) r.tram.ask = null; if (r.bus) r.bus.ask = null; sfx.ui(); } // asked where to get off: no, stay on
  else toggleSeat(r);
}));
// the sight card: ✕ puts it away until you ride on to another sight; Read more opens the site's page
// about it in a new tab. Neither lets the tap through to the steering under it.
huds.forEach(h => {
  h.sight.addEventListener('pointerdown', e => e.stopPropagation());
  // ✕ folds the card into its small ⓘ; the ⓘ opens it again and keeps it open until ✕ or until you ride off
  h.sightX.addEventListener('click', () => { h.sightMini = true; h.sightPinned = false; });
  h.sightI.addEventListener('click', () => { h.sightMini = false; h.sightPinned = true; });
});
huds.forEach((h, p) => h.sightEnter.addEventListener('click', e => {
  e.preventDefault();
  const room = h.sightRoom;
  if (room && game.state === 'race') { putAt(humans[p], room.inside.x, room.inside.z, room.inside.yaw); hudMsg(p, `${room.emoji} ${roomName(room)}`); }
}));

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
    <div class="qhp hidden"><span class="heart">❤</span><i></i><i></i><i></i></div>
    <div class="qfries"></div>
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
    <div class="sight"><button class="sight-i" type="button" aria-label="Info">ⓘ</button><button class="sight-x" type="button">✕</button><div class="sight-head">${EYE}<b></b></div><div class="sight-text"></div><div class="sight-btns"><a class="chip sight-more" target="_blank" rel="noopener"></a><a class="chip sight-enter"></a></div></div>
    <div class="tramcard"><div class="tram-head"></div><div class="tram-row"><span class="tram-badge"></span><div class="tram-info"><small></small><b></b><p></p></div></div><div class="tram-btns"><button class="chip tram-go" type="button"></button><button class="chip tram-seat" type="button" hidden></button></div></div>
    <button class="doorcard" type="button"><span class="door-emoji"></span><span><small></small><b></b></span><kbd></kbd></button>`;
  el.insertAdjacentHTML('afterbegin', '<div class="seatview"><div class="pane"></div><div class="sill"></div><div class="pole"></div><div class="seatback"></div></div>'
    + '<div class="cabview"><div class="roof"></div><div class="pillar l"></div><div class="pillar r"></div><div class="mirror"></div><div class="dash"></div><div class="wheel"></div></div>');
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
    flash: q('.flash'), qnav: q('.qnav'), qarrow: q('.qarrow'), qinfo: q('.qinfo'), qhp: q('.qhp'), qbars: [...el.querySelectorAll('.qhp i')], qfries: q('.qfries'), street, streetNow: street.querySelector('.now'), streetNext: street.querySelector('.next'),
    door: q('.doorcard'), doorEmoji: q('.door-emoji'), doorLabel: q('.doorcard small'), doorName: q('.doorcard b'), doorKey: q('.doorcard kbd'),
    tram: q('.tramcard'), tramBadge: q('.tram-badge'), tramLabel: q('.tramcard small'), tramName: q('.tramcard b'), tramText: q('.tramcard p'), tramSeat: q('.tram-seat'), tramHead: q('.tram-head'), tramGo: q('.tram-go'), seatView: q('.seatview'), cabView: q('.cabview'),
    sight: q('.sight'), sightName: q('.sight b'), sightText: q('.sight-text'), sightX: q('.sight-x'), sightMore: q('.sight-more'), sightEnter: q('.sight-enter'), sightI: q('.sight-i'), sightMini: false, sightPinned: false, sightAt: null, sightShut: null,
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
    // bottom left on a keyboard: the keys this mission needs (the paint gun and borrowing a car, the bus, a tequila shot)
    const hint = paintballActive() && roaming() ? 'hint.paint' : busQuest() ? 'hint.bus' : heliMode() ? 'hint.heli' : questing() && QUESTS[game.mission - 1]?.tequila ? 'hint.tequila' : game.weapons && !roaming() ? 'hint.full' : 'hint.jump';
    h.hint.innerHTML = t_(hint, { fire: k.fire, jump: k.jump, back: k.back });
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

// A sight's card shows in full for a moment (its fade in, then 2 s) and folds into a small ⓘ, which
// stays while you are at the sight; a tap on it opens the card again. Riding off puts it away; at
// the next sight it shows in full again.
const SIGHT_FOR = 2.5;
function updateSight(h, r) {
  const s = roaming() && !questing() && game.cards ? sightAt(r, h.sightAt) : null;
  if (s !== h.sightAt) { h.sightSince = game.time; h.sightMini = false; h.sightPinned = false; }
  h.sightAt = s;
  if (s && !h.sightPinned && game.time - h.sightSince > SIGHT_FOR) h.sightMini = true;
  const show = !!s, changed = show !== h.sightShown || h.sightMini !== h.sightWasMini;
  h.sightShown = show;
  h.sightWasMini = h.sightMini;
  h.sight.classList.toggle('show', show);
  h.sight.classList.toggle('mini', h.sightMini);
  if (show) {
    const words = local(s.text);
    setText(h.sightName, words.name);
    // three short facts where there are, as on the tour, or else the sight's own words
    const facts = s.facts && local(s.facts);
    const key = facts ? facts.join('\n') : words.text;
    if (h.sightText._v !== key) {
      h.sightText._v = key;
      if (!facts) h.sightText.textContent = words.text;
      else {
        const ul = document.createElement('ul');
        for (const f of facts) ul.append(Object.assign(document.createElement('li'), { textContent: f }));
        h.sightText.replaceChildren(ul);
      }
    }
    const href = s.secret || s.inside ? '' : sightPage(s.id); // (what hangs inside a building has no page of its own)
    if (h.sightMore._href !== href) {
      h.sightMore._href = href;
      h.sightMore.hidden = !href;
      if (href) h.sightMore.href = href;
      h.sightX.title = h.sightX.ariaLabel = t_('sight.close');
    }
    setText(h.sightMore, t_('sight.more'));
    // a building you can go into (<city>/inside.js) has a button for that, which takes you in
    h.sightRoom = (s.enter && INSIDE.list.find(b => b.id === s.enter)) || null;
    h.sightEnter.hidden = !h.sightRoom;
    setText(h.sightEnter, t_('sight.enter'));
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
      if (s.inside !== r.room) continue; // inside a building, only what is in it; outside, nothing inside
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
    updateDoorCard(h, r, p);
    h.hint.classList.toggle('hidden', riding(r)); // no jumping off a moving tram
    h.seatView.classList.toggle('show', seated(r) && p < game.players);
    h.cabView.classList.toggle('show', !!cabOf(r) && game.state !== 'menu' && p < game.players);
    h.cabView.dataset.type = r.car?.type ?? '';
    if (roaming()) {
      setText(h.streetNow, r.room ? `${r.room.emoji} ${roomName(r.room)}` : r.street || '…'); // inside a building: its name
      setText(h.streetNext, quest ? questHud(r) : t_('roam.hud'));
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
  // the health bar: a heart and a line for each hit you can still take, blinking just after one
  const hp = quest.health(r);
  h.qhp.classList.toggle('hidden', !hp);
  if (hp) {
    h.qbars.forEach((b, i) => {
      b.classList.toggle('hidden', i >= hp.of);
      b.classList.toggle('on', i < hp.hp);
    });
    h.qhp.classList.toggle('hit', hp.safe > 0);
  }
  // the julientje: ready, or how long it is still charging
  const fries = quest.friesIn(r);
  if (fries !== null) {
    const label = fries > 0 ? `${t_('quest.charging')} ${Math.ceil(fries)}s` : t_('quest.fries');
    h.qfries.innerHTML = fries > 0 ? `<img src="/core/img/julientje.svg" alt=""> ${label}` : `<img src="/core/img/julientje.svg" alt=""> <kbd>${ctl(p).label.fire}</kbd> ${label}`;
    h.qfries.classList.toggle('charging', fries > 0);
    if (p === 0) {
      setText(tFriesLabel, fries > 0 ? label : t_('quest.friesShort'));
      tFries.classList.toggle('charging', fries > 0);
    }
  }
  const shot = quest.tequilaIn(r);
  if (shot !== null) {
    const gun = paintballActive(); // with the paintball gun the shoot key throws, not jump
    h.qfries.innerHTML += `<br>${gun ? '🔫' : '<img src="/core/img/tequila.svg" alt="">'} ${shot > 0 ? `${t_('quest.charging')} ${Math.ceil(shot)}s` : `<kbd>${gun ? ctl(p).label.fire : ctl(p).label.jump}</kbd> ${t_(gun ? 'audio.paintball' : 'quest.tequila')}`}`;
  }
  if (p === 0 && shot !== null && !paintballActive()) {
    const button = $('tJump');
    setText(button.querySelector('small'), shot > 0 ? `${t_('quest.charging')} ${Math.ceil(shot)}s` : t_('quest.tequila'));
    button.classList.toggle('charging', shot > 0);
  }
  const to = quest.target(r), score = !to && quest.tally; // the paint fight: no arrow, only the score
  h.qnav.classList.toggle('hidden', (!to && !score) || quest.over);
  h.qarrow.classList.toggle('hidden', !to);
  if (score) return setText(h.qinfo, `${quest.def.icon ?? '🎓'} ${score.got}/${score.of}`);
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
function paintTrack(g, w, h, view = null) {
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
let mmRoam = null;
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
function paintCity(g, k, x0, z0, view = null) {
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
function boxesOf(list) {
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
function drawMarks(g, map) {
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

// The big map: click the minimap to see the whole map, click a spot on it to teleport there.
const bigEl = $('bigmap'), bigCv = $('bigCanvas'), bigCtx = bigCv.getContext('2d'), bigAsk = $('bigAsk');
let big = null; // { w, h, map, unmap, pick, labels, tab, zoom }
// How much closer the big map comes than when it opens. Zoomed in, the map is not one picture scaled
// up (all of Ghent three times as sharp would be nine times the pixels, more than a phone allows a
// canvas) but the part in view drawn afresh from the map's own lines, with the street names along them.
const BIG_ZOOM = 3;


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
// On a phone the big map is the whole screen, under a bar with the tabs and the way back to the game.
const phoneMap = () => innerWidth <= 760 || innerHeight <= 560;
const sideIndex = () => roaming() && !questing() && innerWidth >= 760;

function layoutBigMap(focus = null) {
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
function zoomBigMap(z, clientX, clientY) {
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

function drawBigMap() {
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
function placeLanding(pl) {
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
function landingAt(x, z) {
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

function teleport(pick) {
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

mm.addEventListener('pointerdown', e => {
  e.stopPropagation();
  e.preventDefault(); // or the click takes the focus back from the search box that opens with the map
  openBigMap();
});
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
const BIG_STEP = Math.sqrt(BIG_ZOOM);
$('bigZoomIn').addEventListener('click', () => zoomBigMap(big.zoom * BIG_STEP));
$('bigZoomOut').addEventListener('click', () => zoomBigMap(big.zoom / BIG_STEP));
bigEl.addEventListener('pointerdown', e => { if (e.target === bigEl) closeBigMapAndPlay(); });
$('bigYes').addEventListener('click', () => confirmTeleport());
$('bigNo').addEventListener('click', () => { big.pick = null; bigList.querySelector('.listask')?.remove(); drawBigMap(); });
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

function showBigTab(tab) {
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

function confirmTeleport() {
  if (!big?.pick?.ok) return;
  const pick = big.pick;
  closeBigMapAndPlay();
  if (pick.room) humans.slice(0, game.players).forEach((r, p) => { const at = pick.room.inside; putAt(r, at.x + (game.players > 1 ? (p ? 1.2 : -1.2) : 0), at.z, at.yaw); });
  else teleport(pick);
}

function closeBigMapAndPlay() {
  closeBigMap();
  setPaused(false);
}

// ------------------------------------------------------------------ menu

const menuEl = $('menu'), pauseEl = $('pause'), resultsEl = $('results'), briefEl = $('brief');
const menuRows = () => touring() ? ['kind', 'tour', 'audio', 'lang', 'start'] : ['mode', 'kind', ...(roaming() ? [] : [...(TRACKS[game.trackIdx].open ? [] : ['laps']), 'weapons']), ...(roaming() ? ['quest', ...(paintballUnlocked() ? ['gun'] : [])] : []), 'ride', 'animals', ...(roaming() ? [] : ['track']), 'audio', 'lang', 'start'];
// The arrows only go from Missions / Race / Tour to the missions, the routes or the ways to take the
// tour, and on to the start button; everything else on the menu is for the mouse.
const navRows = () => ['kind', touring() ? 'tour' : roaming() ? 'quest' : 'track', 'start'];
let menuRow = 0;
const focusRow = name => { const i = navRows().indexOf(name); if (i >= 0) menuRow = i; };
const thumbs = new Map(); // character and mount -> portrait
const THUMB_SCALE = { bike: 1.55, foot: 1.65, heli: 0.32 }; // in the picker, as tall as a rider on a horse (the helicopter: in the picture whole)
let studio = null;

// A portrait for the character picker, rendered from its real 3D model (a fresh one, so the model
// riding about in the scene stays where it is).
function thumbOf(h, mount) {
  const key = h.id + ':' + mount + ':' + roaming();
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
  const m = mount === 'heli' ? { root: helicopter(), animate() {} } : createRider(h, mount);
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
  wrap.innerHTML = ['🗺️', ...QUESTS.map(q => q.emoji)].map((emoji, i) => `<button class="qcard" data-i="${i}"><span class="qemoji">${emoji}</span><b></b></button>`).join('');
  wrap.querySelectorAll('.qcard').forEach((card, i) => card.addEventListener('click', () => {
    card.blur();
    focusRow('quest');
    selectMission(i);
  }));
}

// The tour's two cards: it plays on its own, or you fly it yourself on the city's dragon, through
// the hoops along it (a city with one: TOUR.ride); and beside them, in a city with a DEMO, the
// trailer, which plays straight away.
const TOUR_MODES = ['auto', ...(TOUR?.ride ? ['fly'] : [])];
function buildTourCards() {
  const wrap = $('tourCards');
  wrap.innerHTML = [...TOUR_MODES, ...(DEMO ? ['trailer'] : [])].map(m => `<button class="qcard" data-m="${m}"><span class="qemoji">${{ auto: '🎬', fly: '🐉', trailer: '🎞️' }[m]}</span><b></b><small></small></button>`).join('');
  wrap.querySelectorAll('.qcard').forEach(card => card.addEventListener('click', () => {
    card.blur();
    if (card.dataset.m === 'trailer') return playDemo();
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
  $('kindOpts').querySelector('[data-k="race"]').classList.toggle('hidden', THEME.races === false); // or without races

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
  $('styleBtn').addEventListener('click', () => openStyleList($('styleList').classList.contains('hidden')));
  document.querySelectorAll('#styleList button').forEach(b => b.addEventListener('click', () => { openStyleList(false); game.style = b.dataset.style; sfx.ui(); saveSettings(); renderMenu(); }));
  document.addEventListener('pointerdown', e => { if (!$('styleOpts').contains(e.target)) openStyleList(false); });
  document.querySelectorAll('#modeOpts button').forEach(b => b.addEventListener('click', () => {
    setMode(Number(b.dataset.v));
  }));
  document.querySelectorAll('.laps .arrow').forEach(b => b.addEventListener('click', () => setLaps(game.laps + Number(b.dataset.d))));
  document.querySelectorAll('#kindOpts button').forEach(b => b.addEventListener('click', () => {
    focusRow('kind');
    setKind(b.dataset.k);
  }));
  document.querySelectorAll('#weaponOpts button').forEach(b => b.addEventListener('click', () => setWeapons(b.dataset.w === '1')));
  bindSoundButton($('soundBtn'));
  $('startBtn').addEventListener('click', () => startRace());
  $('briefBtn').addEventListener('click', () => beginQuest());
  $('briefMenuBtn').addEventListener('click', () => toMenu());
  $('tourNext').addEventListener('click', () => tourNext());
  $('tourMenu').addEventListener('click', () => toMenu());
  // the pause menu first: from there "back to menu" leaves the race
  $('menuBtn').addEventListener('click', () => (game.state === 'race' || game.state === 'countdown' || game.state === 'tour' || game.state === 'paused') ? setPaused(true) : toMenu());
  $('resumeBtn').addEventListener('click', () => setPaused(false));
  $('restartBtn').addEventListener('click', () => startRace(true)); // exploring: back at the city's own spot
  $('pauseTitleBtn').addEventListener('click', () => toMenu());
  $('pauseCloseBtn').addEventListener('click', () => setPaused(false));
  $('pauseSettingsBtn').addEventListener('click', () => {
    const open = $('pauseSettings').classList.toggle('hidden') === false;
    $('pauseSettingsBtn').setAttribute('aria-expanded', open);
    $('pauseSettingsBtn').querySelector('.caret').textContent = open ? '▴' : '▾';
  });
  bindSoundButton($('pauseSoundBtn'));
  $('musicSettingsBack').addEventListener('click', () => $('musicSettings').close());
  $('soundEffectsSetting').addEventListener('change', e => { sfx.unlock(); sfx.setSfx(e.target.checked); audioSettingsChanged(); });
  $('backgroundMusicSetting').addEventListener('change', e => {
    sfx.unlock();
    game.gameMusic = e.target.checked;
    if (game.gameMusic) sfx.setMusic(true);
    if (game.state !== 'menu' && game.state !== 'tour' && !(game.state === 'paused' && game.resumeState === 'tour')) syncGameplayMusic();
    audioSettingsChanged();
  });
  // car+paintball mode everywhere: switched on and off on the main menu, where it shows once the hidden
  // settings opened it up (otherwise the paint gun is only in its own mission, the paint fight)
  const setPaintball = on => {
    game.paintball = on;
    sfx.ui(); saveSettings(); syncJumpButton(); renderMenu();
    if (on) $('gunInfo').showModal(); // what it does: the gun, borrowing cars, and where
  };
  $('gunInfoOk').addEventListener('click', () => { sfx.ui(); $('gunInfo').close(); });
  $('paintballSetting').addEventListener('change', e => { game.paintballUnlocked = e.target.checked; sfx.ui(); saveSettings(); syncJumpButton(); renderMenu(); });
  $('gunModeSetting').addEventListener('change', e => setPaintball(e.target.checked));
  $('pauseMountPrev').addEventListener('click', () => switchMount(-1));
  $('pauseMountNext').addEventListener('click', () => switchMount(1));
  $('pauseCardsBtn').addEventListener('click', () => { game.cards = !game.cards; sfx.ui(); saveSettings(); renderMenu(); });
  // the big map, as the minimap opens it: out of the pause menu and straight onto the map
  $('pauseMapBtn').addEventListener('click', () => {
    if (game.state !== 'paused') return;
    setPaused(false);
    openBigMap();
  });
  $('pauseShareBtn').addEventListener('click', shareSpot);
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
    c.classList.toggle('won', !!q && game.questsWon.includes(q.id));
    c.querySelector('b').textContent = q ? qt(q, 'title') : t_('mission.free');
  });
  document.querySelectorAll('#tourCards .qcard').forEach(c => {
    c.classList.toggle('on', c.dataset.m === game.tourMode);
    c.querySelector('b').textContent = t_('tour.' + c.dataset.m);
    c.querySelector('small').textContent = t_('tour.' + c.dataset.m + 'Sub');
  });
  document.body.classList.toggle('pro', game.style === 'pro');
  document.querySelectorAll('#styleList button').forEach(b => b.classList.toggle('on', b.dataset.style === game.style));
  $('styleBtn').textContent = t_('style.' + game.style) + ' ▾';
  $('langBtn').textContent = LANGS[getLang()] + ' ▾';
  document.querySelectorAll('#langList button').forEach(b => b.classList.toggle('on', b.dataset.lang === getLang()));
  $('skySelect').querySelectorAll('option').forEach(o => {
    const [tm, wx] = o.value.split(':');
    o.textContent = (o.value === 'auto' ? t_('sky.auto') : `${t_('time.' + tm)} · ${t_('wx.' + wx)}`).replace(/\p{Extended_Pictographic}\uFE0F?\s*/gu, '');
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
  $('pauseMountName').textContent = t_('mount.' + game.mounts[0]);
  $('playerCols').dataset.n = game.players;
  $('lapCount').textContent = game.laps === 1 ? t_('laps1') : t_('lapsN', { n: game.laps });
  const soundOn = soundEnabled();
  for (const id of ['soundBtn', 'pauseSoundBtn']) {
    $(id).title = t_('audio.hold');
    $(id).setAttribute('aria-haspopup', 'dialog');
  }
  $('soundEffectsSetting').checked = sfx.sfxOn;
  $('backgroundMusicSetting').checked = game.gameMusic && sfx.musicOn;
  $('paintballSetting').checked = game.paintballUnlocked;
  // car+paintball mode everywhere: only there once the hidden settings opened it up, see menuRows
  $('gunModeSetting').checked = game.paintball && paintballUnlocked();
  $('gunMode').title = t_('menu.gunMode');
  $('gunModeSetting').setAttribute('aria-label', t_('menu.gunMode'));
  $('soundBtn').textContent = t_(soundOn ? 'sound.on' : 'sound.off');
  $('soundBtn').classList.toggle('on', soundOn);
  // the pause menu: plain line icons, no emoji
  const plain = k => t_(k).replace(/^[^\p{L}]+/u, '');
  const icon = d => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  $('pauseSoundBtn').innerHTML = icon(soundOn
    ? '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'
    : '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="m16 9 5 6M21 9l-5 6"/>') + `<span>${plain(soundOn ? 'sound.on' : 'sound.off')}</span>`;
  $('pauseSoundBtn').classList.toggle('on', soundOn);
  $('pauseCardsBtn').innerHTML = icon('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>' + (game.cards ? '' : '<path d="M4 20 20 4"/>')) + `<span>${plain(game.cards ? 'cards.on' : 'cards.off')}</span>`;
  $('pauseCardsBtn').classList.toggle('on', game.cards);
  for (const el of document.querySelectorAll('#pause [data-i18n]')) el.textContent = plain(el.dataset.i18n);
  $('startBtn').textContent = t_('start.go');
}

function openLangList(open) {
  $('langList').classList.toggle('hidden', !open);
  $('langBtn').setAttribute('aria-expanded', String(open));
}

function openStyleList(open) {
  $('styleList').classList.toggle('hidden', !open);
  $('styleBtn').setAttribute('aria-expanded', String(open));
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
  if (!others.length) return;
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
  if (game.state === 'tour' && flying()) return setSky(tourSky('day:clear'), false); // flown yourself: a clear day, to see the hoops from afar
  if (game.state === 'tour') return setSky(tourSky(tour.sky ?? 'day:clear'), false); // the tour's own sky where it starts, or a clear day (updateTour fades over to the next)
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
  setSky(`${step === 2 && DAYS.includes('night') ? 'night' : 'day'}:${wx}`, fade);
  game.skyTimer = RIDE_SKY_EVERY;
}

function tickSky(dt) {
  if ((game.state !== 'menu' && game.sky !== 'auto') || touringNow()) return;
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
  document.body.classList.toggle('fries', questing() && !!QUESTS[game.mission - 1]?.fries);
  const tequila = questing() && !!QUESTS[game.mission - 1]?.tequila;
  document.body.classList.toggle('tequila', tequila);
  document.body.classList.toggle('heli', heliMode());
  syncJumpButton();
  $('tJump').classList.remove('charging');
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
// A phone's narrow picker only offers the three the missions use. Riding about freely, the
// helicopter comes after them once its rescue quest has been won.
const PHONE_MOUNTS = ['foot', 'bike', 'horse'];
const withHeli = list => (exploring() && game.questsWon.includes('heli') ? [...list, 'heli'] : list);
function syncHeli() {
  document.body.classList.toggle('heli', heliMode());
  syncJumpButton();
  refreshHints();
}
function cycleMount(p, d, base = MOUNTS) {
  const list = withHeli(base);
  const i = list.indexOf(game.mounts[p]);
  game.mounts[p] = list[i < 0 ? 0 : (i + d + list.length) % list.length];
  const colors = MOUNT_COLORS[game.mounts[p]]; // unless the other player already has them
  if (colors && !game.picks.some((q, i) => i !== p && i < game.players && q === colors)) game.picks[p] = colors;
  assignField();
  resetRace();
  syncHeli();
  sfx.ui();
  saveSettings();
  renderMenu();
}

// From the pause menu while riding about (exploring or on a quest): ride something else from where you are (they are all equally fast).
// Only the model is swapped, so the quest, the position and the character carry on as they were.
function switchMount(d) {
  if (!roaming() || touringNow() || game.state !== 'paused') return;
  if (questing() && QUESTS[game.mission - 1]?.heli) return; // the rescue is flown
  const list = withHeli(MOUNTS), i = list.indexOf(game.mounts[0]);
  game.mounts[0] = list[(i + d + list.length) % list.length];
  const r = humans[0];
  scene.remove(r.model.root);
  r.setHorse(r.def, game.mounts[0]);
  r.heli = exploring() && game.mounts[0] === 'heli';
  if (!r.heli && r.heliModel) { scene.remove(r.heliModel, r.heliShadow); r.heliModel = r.heliShadow = null; r.vy = 0; } // out of it, wherever it was
  syncHeli();
  $('pauseMountName').textContent = t_('mount.' + game.mounts[0]);
  sfx.ui();
  saveSettings();
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

// A short tap keeps the simple all-sound switch. A two-second hold opens the mixer.
function bindSoundButton(button) {
  let timer = null, held = false, origin = null;
  const cancel = () => { clearTimeout(timer); timer = null; };
  button.addEventListener('pointerdown', e => {
    if (!e.isPrimary || e.button !== 0) return;
    cancel();
    held = false;
    origin = { x: e.clientX, y: e.clientY };
    timer = setTimeout(() => {
      timer = null;
      held = true;
      $('musicSettings').showModal();
    }, 2000);
  });
  button.addEventListener('pointermove', e => {
    if (origin && Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > 12) cancel();
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) button.addEventListener(type, cancel);
  addEventListener('blur', cancel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  button.addEventListener('contextmenu', e => e.preventDefault());
  button.addEventListener('click', e => {
    if (held) { held = false; e.preventDefault(); return; }
    toggleSound();
  });
}

function audioSettingsChanged() {
  sfx.ui();
  saveSettings();
  renderMenu();
  showAudioBadge();
}

function soundEnabled() {
  const tourActive = game.state === 'tour' || (game.state === 'paused' && game.resumeState === 'tour');
  return sfx.sfxOn || (sfx.musicOn && (game.state === 'menu' || (tourActive ? game.tourMusic : game.gameMusic)));
}

function syncGameplayMusic() {
  if (demo) return; // the demo's music goes on
  if (game.gameMusic) music.play('race');
  else music.stop();
}

function toggleSound() {
  sfx.unlock();
  const on = !soundEnabled();
  sfx.setMusic(on);
  sfx.setSfx(on);
  sfx.ui();
  saveSettings();
  renderMenu();
  showAudioBadge();
}

function showAudioBadge() {
  $('mute').textContent = t_('mute');
  $('mute').classList.toggle('hidden', soundEnabled() || game.state === 'menu');
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

function resetRace(fresh = false) {
  clearEntities();
  world.pickups.forEach(p => { p.reset(); p.group.visible = game.weapons && !roaming(); });
  world.arrows?.show(!roaming());
  if (track.gate) track.gate.visible = !roaming(); // free roam has no start or finish
  for (const ob of world.obstacles) ob.group.visible = !roaming(); // nor anything to jump over
  if (roaming() && !world.colliders) world.colliders = buildColliders(world.cfg.map, track.parkedCars ?? [], getCity().posts);
  field.forEach((r, i) => r.reset(GRID_LANES[i]));
  quest?.dispose();
  quest = null;
  dropQuestBus();
  // everyone the paint (or a borrowed car) knocked over is back on their feet, the paint off the cars
  world.people?.resetHits();
  resetSplats(city?.targets);
  if (questing()) {
    quest = new Quest(QUESTS[game.mission - 1], { scene, map: world.cfg.map, colliders: world.colliders, relief: world.relief, particles });
    if (quest.busSpot) placeQuestBus(quest);
    if (quest.def.heli) humans.forEach(r => { r.heli = true; });
    placeRiders(quest.spawn);
  } else if (exploring() && !fresh && lastSpot()) {
    placeRiders(lastSpot());
  } else if (roaming() && FREE_START) {
    // exploring freely starts at the city's own spot, not where the last race route did
    const { at: [x, z], look: [lx, lz] } = FREE_START;
    placeRiders({ x, z, yaw: Math.atan2(lx - x, lz - z) });
  }
  if (exploring()) humans.forEach((r, p) => { r.heli = game.mounts[p] === 'heli' && game.questsWon.includes('heli'); }); // flying about freely
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
  if (questBus) busDriverRuns();
}

// The line under the street name in a quest: its own words, or for the bus driver and the courier
// the name of the next stop, so who knows Ghent knows where to go
function questHud(r) {
  const next = quest.halts?.[quest.served];
  if (quest.rescue) {
    const say = quest.rescue.high ? qt(quest.def, 'lower') : (qt(quest.def, 'legs')[quest.served] ?? qt(quest.def, 'hud'));
    return `${say} · ↕ ${Math.round(r.y)} m`; // and how high up the helicopter is
  }
  if (!next || quest.over) return qt(quest.def, 'hud');
  if (quest.bus && r.car !== quest.bus) return t_('bus.getIn');
  return t_(quest.bus ? 'bus.next' : 'deliver.next', { stop: next.name });
}

// What happened in the quest this frame: a cap picked up, a student about to throw up, the end.
function questEvents() {
  for (const e of quest.take()) {
    if (e.type === 'collect') {
      hudMsg(e.r.human, `${quest.def.icon ?? '🎓'} ${e.stop ? `${e.stop} ✓ ` : ''}${e.n}/${quest.tally.of}`, 'gold');
      sfx.pickup('bunny', PAN[e.r.human]); buzz('tap');
    } else if (e.type === 'fries') {
      // a julientje on the ground: the students round about go for it
      const r = humans.reduce((b, h) => (Math.hypot(h.pos.x - e.x, h.pos.z - e.z) < Math.hypot(b.pos.x - e.x, b.pos.z - e.z) ? h : b));
      sfx.drop(PAN[r.human]);
    } else if (e.type === 'tequila') {
      const r = humans.reduce((b, h) => Math.hypot(h.pos.x - e.x, h.pos.z - e.z) < Math.hypot(b.pos.x - e.x, b.pos.z - e.z) ? h : b);
      hudMsg(r.human, t_(e.paint ? 'quest.paintHit' : 'quest.tequilaHit'), e.paint ? 'blue' : 'gold');
      sfx.drop(PAN[r.human]);
    } else if (e.type === 'hurt') {
      // one line of health off; the last one ends the quest (the 'lose' event right after)
      if (e.hp > 0) {
        hudMsg(e.r.human, e.why === 'puke' ? t_('quest.puked') : t_('quest.ran'), 'bad');
        sfx.crash(PAN[e.r.human]); buzz('crash');
      }
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
    if (!demo && !game.questsWon.includes(quest.def.id)) { game.questsWon.push(quest.def.id); saveSettings(); }
    sfx.finish(r ? PAN[r.human] : 0); buzz('win');
    const at = r ?? humans[0];
    particles.burst(at.pos.x, 3, at.pos.z, 40, { color: [0xe53935, 0xfdd835, 0x1e88e5, 0x43a047, 0xffffff, 0xff80ab], speed: 9, up: 9, gravity: 14, life: 1.6, size: 0.16, drag: 1 });
  } else { sfx.crash(0); buzz('lose'); }
  game.endTimer = 2.6;
}

// fresh: over again from the start, also when exploring (not where you last were)
function startRace(fresh = false) {
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
  resetRace(fresh);
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
  syncGameplayMusic(); // sound effects only unless the hidden setting opted into music
  sfx.duck(false);
  showAudioBadge();
}

function toMenu() {
  sfx.engine(null);
  sfx.rotor(null);
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
  hideTour();
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
let tourFlyer = null, tourRunner = null; // the city's dragon flying along and Artevelde running along (TOUR flyer, runner), made when first needed
// what the city puts out only for the tour (city.js TOUR_PROPS: Ghent's Christmas market, the Stroppendragers), made when it first starts
let tourProps = [];

// ?shots=<metres>: a quality tour (.claude/skills/quality-tour). One round of the tour on autoplay,
// a picture of the scene every that many metres along its path, sent to the local server (serve.py
// keeps them in tools/cache/tourshots/<city>/) with where the camera stood and looked.
const SHOTS = Number(new URLSearchParams(location.search).get('shots')) || 0;
let nextShot = 0, shotNo = 0;
function takeShot() {
  if (!SHOTS || game.state !== 'tour' || !tour || tour.done || tour.s < nextShot) return;
  nextShot = tour.s + SHOTS;
  const dir = new THREE.Vector3();
  menuCam.getWorldDirection(dir);
  const meta = { i: shotNo++, s: Math.round(tour.s), x: +menuCam.position.x.toFixed(1), y: +menuCam.position.y.toFixed(1), z: +menuCam.position.z.toFixed(1),
    dx: +dir.x.toFixed(3), dy: +dir.y.toFixed(3), dz: +dir.z.toFixed(3), name: tour.name()?.name ?? '' };
  // (taken straight after the frame is drawn, before the browser clears it)
  renderer.domElement.toBlob(blob => fetch(`/__tourshot?city=${encodeURIComponent(location.pathname.split('/').filter(Boolean)[0] ?? 'ghent')}&meta=${encodeURIComponent(JSON.stringify(meta))}`, { method: 'POST', body: blob })
    .catch(() => {}), 'image/jpeg', 0.85);
}

// off the tour: its bars and cards, and all it put in the city for itself
function hideTour() {
  tourEl.classList.add('hidden');
  if (tourBoatMesh) tourBoatMesh.visible = false;
  for (const m of tourFleet) m.visible = false;
  if (tourBusMesh) tourBusMesh.visible = false;
  if (tourTumble) tourTumble.root.visible = false;
  for (const m of [tourFlyer, tourRunner]) if (m) m.root.visible = false;
  if (fly) fly.dragon.root.visible = fly.rings.root.visible = false;
  document.body.classList.remove('dragonfly');
}

function startTour() {
  sfx.unlock();
  sfx.duck(false); // (started again from the pause menu)
  if (!tour) {
    tour = new Tour(TOUR);
    buildTourBar();
    tourProps = (TOUR_PROPS ?? []).map(p => {
      const m = p.make();
      m.position.set(p.x, Math.max(0, world.relief?.at(p.x, p.z) ?? 0), p.z);
      m.rotation.y = p.turn ?? 0;
      scene.add(m);
      return m;
    });
  }
  tour.reset();
  nextShot = 0; shotNo = 0;
  for (const el of [menuEl, pauseEl, resultsEl, briefEl]) el.classList.add('hidden');
  showRaceChrome(false);
  $('menuBtn').classList.remove('hidden');
  tourEl.classList.remove('hidden');
  tourEl.classList.toggle('auto', game.tourMode === 'auto');
  tourEl.classList.toggle('fly', flying());
  document.body.classList.toggle('dragonfly', flying());
  game.state = 'tour';
  tourEndAt = 0;
  showTourCard(null);
  menuCam.fov = 56;
  showTourSpeed();
  if (!demo) { // (the demo's own music goes on under all its shots)
    music.stop(); // (so it begins again from the start)
    if (game.tourMusic) music.play('tour'); // its own music (js/music.js RECORDINGS)
  }
  $('tourWelcomeTitle').textContent = flying() ? t_('tour.flyWelcome') : t_('tour.welcome', { city: local(NAME) });
  $('tourWelcomeSub').textContent = flying() ? t_(touch.on ? 'tour.flyHintTouch' : 'tour.flyHint') : t_('tour.welcomeSub');
  if (flying()) startFly();
  startSky();
  report('tour_start', { mode: game.tourMode, touch: touch.on });
}

function updateTour(dt) {
  if (flying()) return updateFly(dt);
  const auto = game.tourMode === 'auto';
  tour.update(dt, auto, game.tourSpeed);
  // a character it glances at (Zakman on the Korenlei): put in place in time, and looked at where they walk
  for (const g of tour.meeting()) world.people?.put(g.who.name, g.who.put, g.who.to);
  for (const g of tour.glances) {
    const p = g.who && world.people?.where(g.who.name);
    if (p) g.look = [p.x, 1.4, p.z];
  }
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
  // the one running along until he is up on his statue (Artevelde on the Vrijdagmarkt)
  const run = tour.runner();
  if (run && !run.done && !tourRunner) scene.add((tourRunner = TOUR.runner.make()).root);
  if (tourRunner) {
    tourRunner.root.visible = !!run && !run.done;
    if (tourRunner.root.visible) tourRunner.pose(dt, run, (x, z) => Math.max(0, world.relief?.at(x, z) ?? 0));
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
  // the one flying along, low in the picture, until it flies off to its place and lands there (Ghent's dragon on the Belfort's spire)
  const fly = tour.flyer();
  if (fly && !fly.landed && !tourFlyer) scene.add((tourFlyer = TOUR.flyer.make()).root);
  if (tourFlyer) {
    tourFlyer.root.visible = !!fly && fly.in > 0 && !fly.landed;
    if (tourFlyer.root.visible) {
      // where it lands, and which way it sits there (its turn about y), from the one standing there
      const perch = STANDING.get(TOUR.flyer.stands), home = new THREE.Vector3(...TOUR.flyer.home);
      let rest = 0;
      if (perch?.parent) {
        perch.getWorldPosition(home);
        const x = new THREE.Vector3(1, 0, 0).applyQuaternion(perch.getWorldQuaternion(new THREE.Quaternion()));
        rest = Math.atan2(-x.z, x.x);
      }
      menuCam.updateMatrixWorld();
      tourFlyer.pose(dt, fly, menuCam, home, rest);
    }
  }
  menuCam.fov += (56 + tour.v * 0.4 - menuCam.fov) * (1 - Math.exp(-dt * 3)); // wider the faster it goes
  menuLook.set(pos.x, 1.5, pos.z); // the sun's shadows and the hills: round where the camera is
  // the sky fades over to the one the tour asks for there (ghent/tour.js skies)
  const sky = tour.sky && tourSky(tour.sky);
  if (sky && sky !== `${game.daytime}:${game.weather}`) setSky(sky); // fading over
  $('tourWelcome').classList.toggle('show', tour.welcoming);
  if (tour.done && !tourEndAt) { tourEndAt = game.time; music.stop(); } // the music ends with the tour, no repeat
  // info cards off (the pause menu): playing on its own it flies past the stops without them; when
  // it waits at each for a click, and at the end, the card has the buttons, so it always shows
  const quiet = auto && !game.cards;
  const card = tour.done ? TOUR_END : tour.welcoming || quiet ? null : tour.card(auto);
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
  if (tour.done && auto && game.time - tourEndAt > (WATCH === '' ? 1 : TOUR_AGAIN) && !demo) startTour(); // and round again
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
      startSky(); // the sky the tour has there, straight away
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
  m.textContent = `${on ? '🎵' : '🔇'} ${t_('tour.music')}`;
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
    if (!tour.done) music.play('tour'); // (not once the tour is over)
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
  const words = st.fly ? { name: t_('tour.flyEnd'), text: t_('tour.flyEndText', { hits: fly.course.hits, total: fly.course.hoops.length, time: fmtTime(fly.endAt).replace(/\.\d+$/, '') }) }
    : st.end ? { name: t_('tour.end'), text: t_('tour.endText') } : local((sight ?? st).text);
  $('tourEmoji').innerHTML = st.end ? '🏁' : EYE; // the eye, as on the sights' cards; the flag at the end
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
  $('tourNext').classList.toggle('hidden', game.tourMode === 'auto' && !st.end); // autoplay moves on by itself
  $('tourMenu').classList.toggle('hidden', !st.end);
}

// The card's button (or Space / Enter): on to the next stop (autoplay: away with the card, and on
// if it was waiting for it), or the tour once more at the end.
function tourNext() {
  if (game.state !== 'tour') return;
  if (flying()) return void (fly.course.done && startTour()); // flown yourself, only its last card has a button: once more
  if (tour.done) return startTour();
  if (game.tourMode === 'auto') {
    if (tourShown) { tour.dismiss(tourShown); sfx.ui(); }
  } else if (tour.go()) sfx.ui();
}

// On autoplay the flight waits while a card is read: the mouse over it, or a tap on it.
tourCardEl.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && game.tourMode === 'auto' && tourShown) tour.paused = true; });
tourCardEl.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && tour) tour.paused = false; });
tourCardEl.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && game.tourMode === 'auto' && tourShown && !e.target.closest('button, a')) tour.paused = true; });

// ------------------------------------------------------------------ the tour, flown yourself

// The tour's Fly card (dragonfly.js): the player flies the city's golden dragon (TOUR.ride) the way
// the helicopter is flown (stepHeli, as the DRAGON), through the hoops hung along the tour's
// path, the camera behind it. Once through (or past) the last hoop, a card says how it went.
const FLY_WELCOME = 6; // seconds the welcome, with the keys, shows at the start
const FLY_END = { end: true, fly: true }; // the last card
let fly = null; // { dragon, rings, course, r: where it flies, as stepHeli has a rider, t, endAt, camYaw, camUp }
const flyGround = (x, z) => Math.max(0, world.relief?.at(x, z) ?? 0);

function startFly() {
  if (!fly) {
    const course = new Course(hoopsAlong(tour, flyGround));
    fly = { dragon: TOUR.ride(), rings: hoopMeshes(course.hoops), course, r: { pos: new THREE.Vector3(), human: 0 } };
    scene.add(fly.dragon.root, fly.rings.root);
  }
  const a = tour.at(0), b = tour.at(12), r = fly.r;
  r.pos.set(a.x, 0, a.z);
  Object.assign(r, { yaw: Math.atan2(b.x - a.x, b.z - a.z), speed: 0, vy: 0, steer: 0, tilt: 0, bank: 0, base: flyGround(a.x, a.z) + DRAGON.floor, y: Math.max(0, a.y - DRAGON.floor), street: '' });
  fly.course.reset();
  fly.t = fly.endAt = 0;
  fly.camYaw = r.yaw;
  fly.camUp = 0;
  fly.dragon.root.visible = fly.rings.root.visible = true;
  $('tourTimer').style.transform = 'scaleX(0)';
  $('tJump').querySelector('small').textContent = t_('tb.up'); // (the jump button climbs)
  showFlyHud();
}

// The keys, a gamepad or the touch stick, as for the helicopter: forward and back, left and right,
// and up (Space, a pad's X or RB, ⤒) and down (E, Shift or Enter, a pad's Y or LB, ⤓).
function flyControl() {
  const pad = pads.input[0];
  let throttle = (held(SOLO.up) ? 1 : 0) - (held(SOLO.down) ? 1 : 0);
  let steer = (held(SOLO.left) ? 1 : 0) - (held(SOLO.right) ? 1 : 0);
  let lift = (held(SOLO.jump) ? 1 : 0) - (held(SOLO.fire) ? 1 : 0);
  if (pad) {
    throttle += pad.throttle;
    steer += pad.steer;
    lift += pad.lift;
  }
  if (touch.on) {
    throttle += touch.throttle;
    steer += touch.steer;
    lift += (touch.climb ? 1 : 0) - (touch.sink ? 1 : 0);
  }
  return { throttle: clamp(throttle, -1, 1), steer: clamp(steer, -1, 1), lift: clamp(lift, -1, 1) };
}

function updateFly(dt) {
  const r = fly.r, c = flyControl(), from = { x: r.pos.x, y: r.base + r.y, z: r.pos.z };
  r.fx = Math.sin(r.yaw); r.fz = Math.cos(r.yaw); // (which way it heads, for bumping into the buildings)
  stepHeli(r, dt, c, DRAGON);
  fly.t += dt;
  const at = { x: r.pos.x, y: r.base + r.y, z: r.pos.z };
  if (!fly.course.done) {
    const pass = fly.course.pass(from, at);
    if (pass?.hit) {
      sfx.pickup('cloud', 0);
      particles.burst(pass.hoop.x, pass.hoop.y, pass.hoop.z, 30, { color: [0xffd23f, 0xffe680, 0xffffff], speed: 8, up: 2, gravity: 4, life: 0.8, size: 0.3, drag: 2 });
    } else if (pass) sfx.bump(0);
    if (fly.course.done) {
      fly.endAt = fly.t;
      sfx.finish(0);
      music.stop();
      showTourCard(FLY_END);
    }
    if (pass) showFlyHud();
  }
  fly.rings.update(fly.course, game.time);
  fly.dragon.pose(dt, { ...at, yaw: r.yaw, vy: r.vy, speed: r.speed, bank: r.bank });
  // behind and a little above it, swinging round after it; climbing it drops below the dragon and
  // tilts up steeply after it, diving it rises over it and looks right down (easing into either)
  fly.camYaw += wrapAngle(r.yaw - fly.camYaw) * (1 - Math.exp(-dt * 3));
  fly.camUp += (clamp(r.vy / DRAGON.climb, -1, 1) - fly.camUp) * (1 - Math.exp(-dt * 2.5));
  const fx = Math.sin(fly.camYaw), fz = Math.cos(fly.camYaw), up = fly.camUp, back = 11 - Math.abs(up) * 2;
  menuCam.position.set(r.pos.x - fx * back, Math.max(at.y + 3.2 - up * 6.5, flyGround(r.pos.x, r.pos.z) + 1.5), r.pos.z - fz * back);
  menuCam.lookAt(r.pos.x + fx * 14, at.y + 1 + up * 17, r.pos.z + fz * 14);
  menuCam.fov += (60 + (Math.max(0, r.speed) / DRAGON.speed) * 12 - menuCam.fov) * (1 - Math.exp(-dt * 3)); // wider the faster it goes
  menuLook.set(r.pos.x, 1.5, r.pos.z); // the sun's shadows and the hills: round where it flies
  $('tourWelcome').classList.toggle('show', fly.t < FLY_WELCOME);
  if (!fly.course.done && fly.t % 0.25 < dt) showFlyHud(); // (the metres to the next hoop, a few times a second)
  const name = r.street ?? '';
  if ($('tourName').dataset.name !== name) {
    $('tourName').dataset.name = name;
    $('tourName').textContent = name;
    $('tourName').classList.toggle('show', !!name);
  }
}

// top right: the hoops flown through out of all of them, and how far it is to the next one
function showFlyHud() {
  const { course, r } = fly, h = course.target;
  const far = h ? Math.round(Math.hypot(h.x - r.pos.x, h.y - r.base - r.y, h.z - r.pos.z)) : 0;
  $('flyHud').textContent = `🟡 ${course.hits} / ${course.hoops.length}` + (h ? ` · ${t_('tour.flyNext', { m: far })}` : '');
}

// The pause menu's three buttons, left to right; the arrows move between them, Space/Enter picks one.
const pauseBtns = ['restartBtn', 'resumeBtn'].map($);
let pauseSel = 1;
function selectPause(i) {
  pauseSel = clamp(i, 0, pauseBtns.length - 1);
  pauseBtns.forEach((b, j) => b.classList.toggle('psel', j === pauseSel));
}

function setPaused(on, menu = true) {
  if (demo && on) return; // the demo plays on, whatever happens
  if (on && (game.state === 'race' || game.state === 'countdown' || game.state === 'tour')) {
    game.resumeState = game.state;
    game.state = 'paused';
    renderMenu();
    $('pauseMapBtn').classList.toggle('hidden', game.resumeState === 'tour'); // no riding to teleport on the tour
    $('pauseMountRow').classList.toggle('hidden', !roaming() || game.resumeState === 'tour'); // riding about, exploring or on a quest, you can swap what you ride
    $('pauseMountName').textContent = t_('mount.' + game.mounts[0]);
    if (menu) { selectPause(1); pauseEl.classList.remove('hidden'); }
    sfx.duck(true);
  } else if (on && big && menu) {
    // leaving the window with the big map open: the pause menu over it
    selectPause(1);
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
  const played = r.human === 0 && demo?.control(r); // the demo plays player 1
  if (played) return played;
  const k = ctl(r.human);
  let throttle = (held(k.up) ? 1 : 0) - (held(k.down) ? 1 : 0);
  let steer = (held(k.left) ? 1 : 0) - (held(k.right) ? 1 : 0);
  let lift = (held(k.jump) ? 1 : 0) - (held(k.fire) ? 1 : 0); // up and down, in the helicopter
  const pad = pads.input[r.human];
  if (pad) {
    throttle = clamp(throttle + pad.throttle, -1, 1);
    steer = clamp(steer + pad.steer, -1, 1);
  }
  if (touch.on && r.human === 0) {
    // On touch screens the horse gallops by itself in a race or a quest (but not the zombie missions), and pulling the stick down brakes;
    // exploring, the stick's up/down rides.
    throttle = freeStick() ? touch.throttle : touch.throttle < -0.5 ? -1 : 1;
    steer = clamp(steer + touch.steer, -1, 1);
    lift = clamp(lift + (touch.climb ? 1 : 0) - (touch.sink ? 1 : 0), -1, 1);
  }
  return { throttle, steer, lift };
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

// ------------------------------------------------------------------ inside buildings

// The buildings you can go into (<city>/inside.js) stand out of the city's sight (js/interiors.js):
// by a door in the street a card says which one it is, and riding into the door, the card, or the
// item key takes you in, on foot and at a walk. The door inside takes you back out to the street,
// on what you rode in on. Not in a quest: its targets are all in the streets.
const INSIDE_PACE = 0.7;
const DOOR_NEAR = 9, DOOR_REACH = 2.2; // where the card shows, and how close riding into it goes through
const roomName = b => (typeof b.name === 'string' ? b.name : local(b.name));

// which building a rider is in, if any; walking in and out of one is on foot, whatever you ride
function inRoom(r) {
  const room = INSIDE.at(r.pos.x, r.pos.z);
  if (room === r.room) return;
  r.room = room;
  const mount = room ? 'foot' : game.mounts[r.human];
  if (r.mount !== mount && r.def) r.setHorse(r.def, mount);
}

// the door a player is by: the nearest within DOOR_NEAR, while riding about freely
function doorBy(r) {
  if (!exploring() || riding(r) || game.state !== 'race') return null;
  let best = null, bd = DOOR_NEAR;
  for (const d of INSIDE.doors) {
    const k = Math.hypot(r.pos.x - d.x, r.pos.z - d.z);
    if (k < bd) { best = d; bd = k; }
  }
  return best;
}

// riding into a door, heading the way into it, takes you through
function intoDoor(r) {
  const d = doorBy(r);
  if (!d || Math.hypot(r.pos.x - d.x, r.pos.z - d.z) > DOOR_REACH) return;
  const into = -(Math.sin(r.yaw) * Math.sin(d.yaw) + Math.cos(r.yaw) * Math.cos(d.yaw)) * r.speed;
  if (into > 0.5) through(r, d);
}

// the card, the item key or the touch button: through the door you are by. False when there is none.
function doorAction(r) {
  const d = doorBy(r);
  if (d) through(r, d);
  return !!d;
}

function through(r, d) {
  if (d.way === 'in') {
    const at = d.room.inside;
    putAt(r, at.x, at.z, at.yaw);
    hudMsg(r.human, `${d.room.emoji} ${roomName(d.room)}`);
  } else {
    const s = d.room.street;
    putAt(r, s.x + Math.sin(s.yaw) * 2.5, s.z + Math.cos(s.yaw) * 2.5, s.yaw);
    hudMsg(r.human, `🚪 ${s.name ?? NAME?.[getLang()] ?? ''}`);
  }
  report('door', { room: d.room.id, way: d.way });
}

// one rider put down somewhere else, standing still (teleport() puts both players side by side)
function putAt(r, x, z, yaw) {
  r.tram = null;
  r.pos.x = x;
  r.pos.z = z;
  r.onRoute = undefined;
  r.streetT = 0;
  Object.assign(r, { yaw, speed: 0, steer: 0, y: 0, vy: 0, ground: 0, base: world.relief?.at(x, z) ?? 0, baseV: 0 });
  camYaw[r.human] = yaw;
  inRoom(r);
  particles.burst(x, 1, z, 24, { color: 0xffe680, speed: 5, up: 3, life: 0.7, size: 0.25, grow: 0.5, opacity: 0.9, drag: 3 });
  if (loud()) sfx.jump(PAN[r.human]);
}

// where a rider shows on the maps: inside a building, at its door in the street
const onMap = r => (r.room ? r.room.street : r.pos);

// The light inside, for one player's view (render()): the building's own, no rain or snow and no
// lamp carried, in place of the sky outside. Gives back what puts the outside back.
function lightInside(room) {
  const L = { ...INDOOR_LIGHT, ...room.look };
  const was = {
    bg: scene.background.clone(), fog: scene.fog.color.clone(), near: scene.fog.near, far: scene.fog.far,
    sky: hemi.color.clone(), ground: hemi.groundColor.clone(), hemi: hemi.intensity, sunColor: sun.color.clone(), sun: sun.intensity,
    rain: weather.rain.visible, snow: weather.snow.visible, lamps: headlamps.map(l => l.visible),
  };
  scene.background.set(L.horizon);
  scene.fog.color.set(L.horizon);
  [scene.fog.near, scene.fog.far] = L.fog;
  hemi.color.set(L.hemi[0]);
  hemi.groundColor.set(L.hemi[1]);
  hemi.intensity = L.hemi[2];
  sun.color.set(L.sun[0]);
  sun.intensity = L.sun[1];
  weather.rain.visible = weather.snow.visible = false;
  headlamps.forEach(l => (l.visible = false));
  return () => {
    scene.background.copy(was.bg);
    scene.fog.color.copy(was.fog);
    [scene.fog.near, scene.fog.far] = [was.near, was.far];
    hemi.color.copy(was.sky);
    hemi.groundColor.copy(was.ground);
    hemi.intensity = was.hemi;
    sun.color.copy(was.sunColor);
    sun.intensity = was.sun;
    weather.rain.visible = was.rain;
    weather.snow.visible = was.snow;
    headlamps.forEach((l, k) => (l.visible = was.lamps[k]));
  };
}

// ------------------------------------------------------------------ physics

// car+paintball mode everywhere can be picked on the menu once the hidden settings opened it up
const paintballUnlocked = () => game.paintballUnlocked;
// the paint fight: the mission with the paintball gun (and cars to borrow)
const paintQuest = () => questing() && QUESTS[game.mission - 1]?.kind === 'paint';

// the paintball gun (car+paintball mode) in hand, whatever you ride, exploring and in every quest
const paintballActive = () => paintQuest() || (game.paintball && paintballUnlocked()); // the paint fight, or switched on everywhere
const paintballOn = r => paintballActive() && r.human >= 0 && game.kind === 'mission' && !r.car;

// Free roaming with the paintball gun: shots fly on until they hit a wall, a walker or a cyclist, who is covered in blue and falls.
const paintShots = [];
const PAINT_BALL = new THREE.SphereGeometry(0.1, 8, 6), PAINT_MAT = new THREE.MeshStandardMaterial({ color: 0x8a8f98, roughness: 0.4, metalness: 0.5 });
function firePaint(r) {
  if ((r.paintCd ?? 0) > 0 || game.state !== 'race') return false;
  r.paintCd = 0.12;
  const fx = Math.sin(r.yaw), fz = Math.cos(r.yaw), mesh = new THREE.Mesh(PAINT_BALL, PAINT_MAT);
  const shot = { r, x: r.pos.x + fx * 0.5, y: r.base + r.y + 1.35, z: r.pos.z + fz * 0.5, vx: fx * 42, vz: fz * 42, vy: 0.4, age: 0, mesh };
  mesh.position.set(shot.x, shot.y, shot.z);
  scene.add(mesh);
  paintShots.push(shot);
  return true;
}
// the shoot button: paint at the walkers and cyclists, or in a quest with shots to throw (the zombies) the quest's own paintballs
function shoot(r) {
  if (!paintballOn(r) || game.state !== 'race') return;
  const ok = quest?.def.tequila ? quest.throwTequila(r, true) : firePaint(r);
  if (ok) { sfx.throw(PAN[r.human]); buzz('tap'); }
}
function updatePaint(dt) {
  for (const r of humans) if (r.paintCd > 0) r.paintCd -= dt;
  for (let i = paintShots.length - 1; i >= 0; i--) {
    const s = paintShots[i], nx = s.x + s.vx * dt, nz = s.z + s.vz * dt;
    s.vy -= 3 * dt;
    const ny = s.y + s.vy * dt;
    s.age += dt;
    const hit = world.people?.paintHit(s.x, s.z, nx, nz, s.y) ?? world.cyclists?.paintHit(s.x, s.z, nx, nz, s.y) ?? splatHit(city?.targets, s.x, s.z, nx, nz, s.y);
    const splat = !hit && vehicleSplat(paintBoxes(s.x, s.z), s.x, s.z, nx, nz, s.y); // (a car, a bus or a tram: the paint sticks)
    const blocked = !hit && !splat && world.colliders && clearLine(world.colliders, s.x, s.z, nx, nz) < 1;
    // in the paint fight: a point for a person, more for a car or bus or a tram (each once)
    if (hit) quest?.score?.(s.r, hit, 1);
    else if (splat) quest?.score?.(s.r, splat.box.who, splat.box.pts, true);
    if (splat) particles.burst(splat.x, splat.y, splat.z, 6, { color: [0x1e66f5, 0x4f8cff], speed: 3, up: 2, gravity: 9, life: 0.5, size: 0.14, drag: 1.5 });
    if (hit) {
      particles.burst(hit.x, hit.y, hit.z, 10, { color: [0x1e66f5, 0x4f8cff, 0x0d3fb8], speed: 5, up: 3, gravity: 9, life: 0.8, size: 0.18, drag: 1.5 });
      if (loud()) sfx.drop(0);
    }
    if (hit || splat || blocked || s.age > 1.5 || ny < 0.05) {
      scene.remove(s.mesh);
      paintShots.splice(i, 1);
    } else {
      Object.assign(s, { x: nx, y: ny, z: nz });
      s.mesh.position.set(nx, ny, nz);
    }
  }
}

// The cars, buses and trams near a shot at (x, z), as boxes for the paint to stick to (splat.js): the parked
// cars, the traffic (its paint in a group that follows the car, see carPaint) and the trams' sections
const paintedCars = new Set(); // the traffic's cars with paint on
function paintBoxes(x, z) {
  const boxes = [], near = (px, pz, R = 30) => (px - x) ** 2 + (pz - z) ** 2 < R * R;
  const size = type => { const t = CAR_TYPES[type]; return { len: t.len, w: t.w, h: t.tall ? 3.15 : 1.5 }; };
  // a group at the car, turned with it: stuck to the scene where it stands, or to its model once borrowed
  const holder = (c, x, y, z, yaw) => () => {
    if (!c.paint) {
      c.paint = new THREE.Group();
      if (c.model) c.model.add(c.paint);
      else { c.paint.position.set(x, y, z); c.paint.rotation.y = yaw; scene.add(c.paint); }
    }
    return c.paint;
  };
  for (const c of track.parkedCars ?? []) {
    if (c.stolen || !near(c.x, c.z)) continue;
    const y = c.model ? c.model.position.y : world.relief?.at(c.x, c.z) ?? 0;
    boxes.push({ x: c.x, y, z: c.z, yaw: c.yaw, ...size(c.type), who: c, pts: 2, holder: holder(c, c.x, y, c.z, c.yaw) });
  }
  for (const c of city?.traffic?.cars ?? []) {
    if (!c.on || !near(c.pos.x, c.pos.z)) continue;
    boxes.push({ x: c.pos.x, y: c.pos.y, z: c.pos.z, yaw: c.yaw, ...size(c.type), who: c, pts: 2, holder: () => {
      if (!c.paint) { c.paint = new THREE.Group(); scene.add(c.paint); }
      paintedCars.add(c);
      c.paint.position.copy(c.pos);
      c.paint.rotation.set(0, c.yaw, 0);
      return c.paint;
    } });
  }
  for (const t of city?.trams?.fleet.list ?? []) {
    if (!near(t.nose[0], t.nose[2], 80)) continue;
    for (const m of t.sections) {
      if (near(m.position.x, m.position.z, 34)) boxes.push({ x: m.position.x, y: m.position.y, z: m.position.z, yaw: m.rotation.y, len: TRAM_SECTION, w: TRAM_W, h: 3.3, who: t, pts: 3, mesh: m, holder: () => m }); // (hit on its mesh: the nose sticks out past the box)
    }
  }
  return boxes;
}
// the paint on the traffic's cars follows them; gone when the car is (or jumps off somewhere else)
function carPaint() {
  for (const c of paintedCars) {
    if (!c.on || c.pos.distanceToSquared(c.paint.position) > 100) { c.paint.removeFromParent(); c.paint = null; paintedCars.delete(c); continue; }
    c.paint.position.copy(c.pos);
    c.paint.rotation.set(0, c.yaw, 0);
  }
}

// Stealing a parked car (with the paintball gun on, free roaming): the car's instance is hidden and a car of its own
// drives off with you in it; get out and it stays standing where you left it.
const NO_CAR = new THREE.Matrix4().makeScale(0, 0, 0);
const ejected = []; // the ones thrown out of their car, running off
function stealCar(r, c) {
  let speed0 = 0;
  if (c.p) {
    // a car (or bus) that is driving: out goes whoever was at the wheel, who runs off shouting
    const t = CAR_TYPES[c.type], right = { x: Math.cos(c.yaw), z: -Math.sin(c.yaw) };
    const who = createWalker({ name: t_('car.he'), silk: SHIRTS[Math.floor(Math.random() * SHIRTS.length)], cap: 0x222222, labelLayer: 0 }, Math.floor(Math.random() * 8));
    who.root.position.set(c.pos.x + right.x * (t.w / 2 + 1), c.pos.y, c.pos.z + right.z * (t.w / 2 + 1));
    who.root.rotation.y = Math.atan2(right.x, right.z);
    scene.add(who.root);
    ejected.push({ who, vx: right.x * 3.2, vz: right.z * 3.2, age: 0 });
    speed0 = c.speed;
    c.on = false;
    const paint = c.paint;
    if (paint) { paintedCars.delete(c); c.paint = null; } // its paint comes along
    c = { type: c.type, c: c.c ?? 0xffffff, x: c.pos.x, z: c.pos.z, yaw: c.yaw, paint };
    track.parkedCars?.push(c);
  }
  c.stolen = true;
  for (const [im, i] of c.slots ?? []) { im.setMatrixAt(i, NO_CAR); im.instanceMatrix.needsUpdate = true; }
  for (const t of c.cols ?? []) t.dead = true;
  const model = c.model ?? carGroup(c.type, c.c ?? 0xdddddd);
  c.model = model;
  scene.add(model);
  if (c.paint && c.paint.parent !== model) { model.add(c.paint); c.paint.position.set(0, 0, 0); c.paint.rotation.set(0, 0, 0); } // the paint on it drives off with it
  r.car = c;
  r.carNear = null;
  r.speedFactor = 1.5; // a car is quicker than you on foot
  r.pos.x = c.x;
  r.pos.z = c.z;
  r.yaw = c.yaw;
  r.speed = speed0;
  if (loud()) { sfx.bump(PAN[r.human]); buzz('tap'); }
  syncJumpButton();
}
function leaveCar(r) {
  const c = r.car, side = 2.6;
  Object.assign(c, { x: r.pos.x, z: r.pos.z, yaw: r.yaw, stolen: false });
  c.model.visible = true; // (hidden from the cab while you drove it)
  addCarColliders(world.colliders.things, c); // it stands there now
  r.car = null;
  r.speedFactor = 1;
  sfx.engine(null);
  r.pos.x += Math.cos(r.yaw) * side;
  r.pos.z -= Math.sin(r.yaw) * side;
  r.speed = 0;
  syncJumpButton();
}
// A borrowed bus or bin lorry is driven from its seat, looking out through the windscreen: where the
// driver's eyes are (metres ahead of the middle, to the left, and up)
const CABS = { bus: { z: 4.9, x: 0.62, y: 2.3 }, bins: { z: 3.55, x: 0.6, y: 2.5 } };
const cabOf = r => (r.car && CABS[r.car.type]) || null;

// which parked car, if any, is within reach (looked up a few times a second)
function carTick(dt) {
  for (let i = ejected.length - 1; i >= 0; i--) {
    const e = ejected[i], p = e.who.root.position;
    e.age += dt;
    p.x += e.vx * dt;
    p.z += e.vz * dt;
    e.who.animate(dt, 3.2, 0, e.age);
    if (e.age > 5) { scene.remove(e.who.root); ejected.splice(i, 1); }
  }
  const driver = humans.find(h => h.car && h.human === 0), pilot = humans.find(h => h.heli && h.human === 0);
  // the helicopter's rotor, or a car's engine
  const sounding = game.state === 'race' && sfx.sfxOn;
  sfx.rotor(pilot && sounding ? clamp(Math.abs(pilot.speed) / HELI_SPEED + Math.abs(pilot.vy) / HELI_CLIMB, 0, 1) : null);
  sfx.engine(driver && !pilot && sounding ? clamp(Math.abs(driver.speed) / (MAX_SPEED * 1.5), 0, 1) : null);
  for (const r of humans) {
    if (r.human < 0 || !borrowActive() || game.kind !== 'mission' || r.car) { if (r.carNear) r.carNear = null; continue; }
    if ((r.carT = (r.carT ?? 0) - dt) > 0) continue;
    r.carT = 0.2;
    let best = null, bd = Infinity;
    // the bus driver mission: only its bus (reached from its door side, it is long)
    if (busQuest() && questBus && !questBus.stolen && r.y < 0.8 && (questBus.x - r.pos.x) ** 2 + (questBus.z - r.pos.z) ** 2 < 7 * 7) best = questBus;
    if (paintballOn(r) && r.y < 0.8) for (const c of track.parkedCars ?? []) {
      if (c.stolen) continue;
      const d = (c.x - r.pos.x) ** 2 + (c.z - r.pos.z) ** 2;
      if (d < 4.5 * 4.5 && d < bd) { bd = d; best = c; }
    }
    // and the cars and buses on the road, within reach of their sides
    if (paintballOn(r) && r.y < 0.8) for (const c of city?.traffic?.cars ?? []) {
      if (!c.on) continue;
      const reach = CAR_TYPES[c.type].len / 2 + 3.5, d = (c.pos.x - r.pos.x) ** 2 + (c.pos.z - r.pos.z) ** 2;
      if (d < reach * reach && d < bd) { bd = d; best = c; }
    }
    if (best !== r.carNear) { r.carNear = best; if (r.human === 0) syncJumpButton(); }
  }
}

// The bus driver: the mission's bus, standing at its stop, a parked car to borrow (stealCar), and its
// driver, who runs off to the toilet the moment the mission starts
let questBus = null;
function placeQuestBus(q) {
  const { x, z, yaw } = q.busSpot, c = { type: 'bus', c: 0xf4f4f2, x, z, yaw, model: carGroup('bus', 0xf4f4f2) };
  c.model.position.set(x, world.relief?.at(x, z) ?? 0, z);
  c.model.rotation.y = yaw;
  scene.add(c.model);
  track.parkedCars?.push(c);
  q.bus = questBus = c;
}
function dropQuestBus() {
  if (!questBus) return;
  scene.remove(questBus.model);
  const list = track.parkedCars ?? [], i = list.indexOf(questBus);
  if (i >= 0) list.splice(i, 1);
  questBus = null;
}
function busDriverRuns() {
  const c = questBus, t = CAR_TYPES.bus, right = { x: Math.cos(c.yaw), z: -Math.sin(c.yaw) };
  const who = createWalker({ name: t_('bus.driver'), silk: 0xf4f4f2, cap: 0xffd200, labelLayer: 0 }, 3);
  who.root.position.set(c.x + right.x * (t.w / 2 + 0.8), c.model.position.y, c.z + right.z * (t.w / 2 + 0.8));
  const away = c.yaw + Math.PI * 0.75; // off along the pavement, behind the bus
  who.root.rotation.y = away;
  scene.add(who.root);
  ejected.push({ who, vx: Math.sin(away) * 3.4, vz: Math.cos(away) * 3.4, age: 0 });
  humans.forEach((h, p) => hudMsg(p, t_('bus.toilet'), 'gold'));
}

// Borrowing a car: with the paint gun on (any car or bus), or in the bus driver mission (only its bus)
const busQuest = () => questing() && QUESTS[game.mission - 1]?.kind === 'bus';
const borrowActive = () => paintballActive() || busQuest();

// the round button by the stick: jump, or a tequila shot, or (with the paintball gun on) stealing a car and getting out of it
let jumpKey = '';
function syncJumpButton() {
  const me = humans[0], free = !!me && game.kind === 'mission' && borrowActive();
  document.body.classList.toggle('gunfree', free && paintballOn(me)); // (not from inside a borrowed car)
  if (free && (me.car || me.carNear)) {
    const label = t_(me.car ? 'car.exit' : 'car.steal'), icon = me.car ? '🚪' : '🚗';
    if (jumpKey === label) return;
    jumpKey = label;
    $('tJump').querySelector('span').innerHTML = icon;
    setText($('tJump').querySelector('small'), label);
    $('tJump').setAttribute('aria-label', label);
    return;
  }
  jumpKey = '';
  // (with the gun the shots go on the shoot button, and this one jumps)
  const tequila = questing() && !!QUESTS[game.mission - 1]?.tequila && !paintballActive();
  const label = tequila ? t_('quest.tequila') : me?.heli ? t_('tb.up') : t_('tb.jump');
  $('tJump').querySelector('span').innerHTML = tequila ? '<img src="/core/img/tequila.svg" alt="">' : '⤒';
  $('tJump').classList.remove('charging');
  setText($('tJump').querySelector('small'), label);
  $('tJump').setAttribute('aria-label', label);
}

function jump(r) {
  if (r.heli) return; // in the helicopter the jump key climbs (humanControl)
  if (game.state === 'race' && game.kind === 'mission' && borrowActive() && r.human >= 0) {
    // with the gun on (or the bus to drive): the jump button borrows the car beside you, and gets you out of it again
    if (r.car) return leaveCar(r);
    if (r.carNear) return stealCar(r, r.carNear);
  }
  if (game.state === 'race' && quest?.def.tequila && !paintballActive()) {
    if (quest.throwTequila(r)) { sfx.throw(PAN[r.human]); buzz('tap'); }
    return;
  }
  if (onTram(r)) return toggleSeat(r); // on the tram: inside to a seat, or back out
  if (riding(r) || !r.grounded || r.spinTime > 0 || r.rearTime > 0 || r.stunTime > 0) return;
  r.vy = JUMP_V;
  r.y += 0.001;
  if (r.human >= 0 && game.state === 'race') sfx.jump(PAN[r.human]);
}

function stepRacer(r, dt, c) {
  if (r.heli) return stepHeli(r, dt, c);
  for (const k of ['stunTime', 'rearTime', 'stumbleTime', 'soakTime', 'invuln', 'obstacleCd', 'wallTimer', 'railTime', 'railCd']) {
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
  if (r.railDown && r.railTime <= 0) {
    r.railDown = false; // back up and on the bike
    r.model.stars.visible = false;
  }
  if (r.railTime > 0) {
    // come off on the tram rails: lying on the cobbles, the bike sliding to a stop
    c.throttle = 0;
    c.steer = 0;
    r.speed = approach(r.speed, 0, RAIL_SLOW * dt);
  }

  const airborne = !r.grounded;
  if (!airborne) {
    const max = MAX_SPEED * (world.cfg.pace ?? 1) * r.speedFactor * (r.soakTime > 0 ? SOAK_SLOW : 1) * (r.room ? INSIDE_PACE : 1);
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
  if (roaming()) { roamAbout(r, dt); if (!throughPortal(r, was)) railCheck(r, was); }
  else followTrack(r, dt);
  if (r.human >= 0) { inRoom(r); if (roaming()) intoDoor(r); }
  if (!roaming() && r.onRoute !== false) hitObstacles(r);
  stepHeight(r, dt, was, airborne);
  stepRelief(r, dt);
}

// Flying the police helicopter: forward and back, turning on the spot, up and down (c.lift), with
// some weight to it. r.base is the ground below (or the water), r.y the height above it; low down
// the buildings are in the way, higher up it flies over them. f: how it flies (HELI, or the DRAGON)
function stepHeli(r, dt, c, f = HELI) {
  const ground = (world.relief?.at(r.pos.x, r.pos.z) ?? 0) + f.floor;
  const low = world.colliders && inWater(world.colliders, r.pos.x, r.pos.z) ? (waterLevel(world.colliders, r.pos.x, r.pos.z) ?? WATER) + Math.max(1.5, f.floor) : ground; // (it does not set down on the water)
  const alt = r.base + r.y, landed = alt <= low + 0.02;
  // pressing on near the ground lifts off by itself, so it goes as soon as you press forward
  const lift = (c.lift ?? 0) || (c.throttle > 0 && alt - low < 6 ? 1 : 0);
  r.heliFloor = low === ground ? ground : low - 1.5; // where its shadow falls: the ground, or the water
  r.vy = approach(r.vy, lift * f.climb, (lift ? f.rise : f.sink) * dt);
  const top = landed && lift <= 0 && !f.floor ? 4 : f.speed; // on its skids it only shuffles about
  const want = c.throttle > 0 ? c.throttle * top : c.throttle < 0 ? c.throttle * top * 0.3 : 0;
  r.speed = approach(r.speed, want, (want * r.speed < 0 ? f.accel * 1.5 : want ? f.accel : f.accel * 0.7) * dt); // pulling back brakes hard
  r.steer = approach(r.steer, c.steer, 4 * dt);
  r.yaw = wrapAngle(r.yaw + r.steer * f.turn * dt);
  r.pos.x += Math.sin(r.yaw) * r.speed * dt;
  r.pos.z += Math.cos(r.yaw) * r.speed * dt;
  const h = clamp(alt + r.vy * dt, low, low + f.top);
  if (h === low && r.vy < 0) r.vy = 0;
  r.base = low;
  r.y = h - low;
  r.tilt = approach(r.tilt ?? 0, (want - r.speed) / f.speed * 0.6 + r.speed / f.speed * 0.12, 2 * dt); // nose down speeding up, up slowing down
  r.bank = approach(r.bank ?? 0, -r.steer * Math.min(1, Math.abs(r.speed) / 15) * 0.3, 2 * dt);
  if (r.y < f.low && world.colliders) {
    const into = collide(world.colliders, r, f.radius);
    if (into > 0) r.speed *= Math.exp(-into * 2.8 * dt);
  }
  if (r.human >= 0 && (r.streetT = (r.streetT ?? 0) - dt) <= 0) {
    r.streetT = 0.3;
    r.street = streetAt(world.colliders, r.pos.x, r.pos.z) || r.street;
  }
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
  // the trams too, but not the one just got off, still standing at the stop
  const left = game.time < (r.tramLeftAt ?? -1) + 4 ? r.tramLeft : null;
  const into = Math.max(collide(world.colliders, r, HORSE_RADIUS), city.traffic?.push(r, HORSE_RADIUS) ?? 0, city.trams?.push?.(r, HORSE_RADIUS, left) ?? 0);
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
  // (in the Blaarmeersen's lake you swim, on the Watersportbaan you row)
  r.vessel = !r.afloat ? null : swimAt(world.colliders, r.pos.x, r.pos.z) ? 'swim'
    : ROWING && r.pos.x > ROWING[0] && r.pos.z > ROWING[1] && r.pos.x < ROWING[2] && r.pos.z < ROWING[3] ? 'row' : 'tour';
  if (r.afloat) {
    r.speed = approach(r.speed, clamp(r.speed, -REVERSE_MAX, r.vessel === 'swim' ? SWIM_SPEED : BOAT_SPEED), 30 * dt);
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

// A city's portals (<city>/city.js PORTALS; one with an href is a door to another page): ride into one's mouth, down where it opens, and you come
// out at the other end, a little way up from its mouth, facing away from it at the speed you had (the
// Kouter's car park and Dok Noord's are one in Ghent). `was` (where the rider was a step ago) goes
// along, so nothing puts them back across town.
const PORTAL_REACH = 2.2, PORTAL_OUT = 3.5;
let goingTo = 0; // a door with an href (below) is on its way to the other page
addEventListener('pageshow', e => { if (e.persisted) goingTo = 0; }); // back from it, from the browser's cache: the door works again
function throughPortal(r, was) {
  if (!PORTALS || r.human < 0 || game.state !== 'race' || riding(r)) return false;
  for (const pt of PORTALS) {
    if (Math.hypot(r.pos.x - pt.x, r.pos.z - pt.z) > PORTAL_REACH || (r.base > -1 && !pt.href)) continue; // (a car park's mouth is down on its ramp; a door is at street level)
    // heading into the mouth, not up the ramp away from it
    const into = -(Math.sin(r.yaw) * Math.sin(pt.yaw) + Math.cos(r.yaw) * Math.cos(pt.yaw)) * r.speed;
    if (into < 0.5) continue;
    if (pt.href) { // a door to another page: the inside of the church (ghentinside), or back out to the street
      hudMsg(r.human, `${pt.icon ?? '🚪'} ${pt.name}`);
      if (loud()) sfx.jump(PAN[r.human]);
      r.speed = 0;
      if (!goingTo) goingTo = setTimeout(() => location.assign(pt.href), 350);
      return true;
    }
    const { x, z, yaw } = pt.to;
    r.pos.x = was.x = x + Math.sin(yaw) * PORTAL_OUT;
    r.pos.z = was.z = z + Math.cos(yaw) * PORTAL_OUT;
    Object.assign(r, { yaw, speed: Math.abs(r.speed), onRoute: undefined, streetT: 0, base: world.relief?.at(r.pos.x, r.pos.z) ?? 0, baseV: 0 });
    if (track.distTo(r.pos.x, r.pos.z) < track.hw + 4) {
      r.idx = was.idx = track.nearest(r.pos.x, r.pos.z);
      r.lat = was.lat = track.lateral(r.pos.x, r.pos.z, r.idx);
    }
    camYaw[r.human] = yaw;
    particles.burst(r.pos.x, r.base + 1, r.pos.z, 24, { color: 0xffe680, speed: 5, up: 3, life: 0.7, size: 0.25, grow: 0.5, opacity: 0.9, drag: 3 });
    if (loud()) sfx.jump(PAN[r.human]);
    hudMsg(r.human, `${pt.icon ?? '🅿️'} ${pt.name}`);
    return true;
  }
  return false;
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

// ------------------------------------------------------------------ tram rails

// On a bike, riding over the tram rails at too shallow an angle: the front wheel drops into the
// rail's groove and you come off, as the cyclist in the tour does (js/tumble.js). Straight across,
// or near enough, is fine.
const RAIL_GAUGE = 1.435 * 1.25; // as the rails are laid (js/scenery.js osmTrams)
const RAIL_ANGLE = 0.3; // radians, about 17 degrees: any shallower and the wheel goes in
const RAIL_FALL = 2.6; // seconds on the ground before you are back on the bike
const RAIL_SLOW = 6; // m/s², how fast the slide comes to a stop
const RAIL_AGAIN = 10; // seconds back on the bike before the rails can throw you again
let railCells = null;
// the rails' segments in a grid, to find the ones near a point
function railsNear(x, z) {
  const C = 20, key = (i, j) => i * 100003 + j;
  if (!railCells) {
    railCells = new Map();
    for (const t of TRACKS[0].map?.trams ?? []) {
      for (let k = 0; k + 3 < t.p.length; k += 2) {
        const ax = t.p[k], az = t.p[k + 1], bx = t.p[k + 2], bz = t.p[k + 3], L = Math.hypot(bx - ax, bz - az);
        if (L < 1e-6) continue;
        const seg = { ax, az, ux: (bx - ax) / L, uz: (bz - az) / L, L, y: Math.max(t.y?.[k / 2] ?? 0, t.y?.[k / 2 + 1] ?? 0) };
        for (let i = Math.floor((Math.min(ax, bx) - 2) / C); i <= Math.floor((Math.max(ax, bx) + 2) / C); i++) {
          for (let j = Math.floor((Math.min(az, bz) - 2) / C); j <= Math.floor((Math.max(az, bz) + 2) / C); j++) {
            if (!railCells.has(key(i, j))) railCells.set(key(i, j), []);
            railCells.get(key(i, j)).push(seg);
          }
        }
      }
    }
  }
  return railCells.get(key(Math.floor(x / C), Math.floor(z / C))) ?? [];
}

// Did this step take the bike over a rail, and at what angle?
function railCheck(r, was) {
  if (r.human < 0 || game.state !== 'race' || r.model.species !== 'bike') return;
  if (r.railTime > 0 || r.railCd > 0 || !r.grounded || riding(r) || r.afloat || Math.abs(r.speed) < 1.5) return;
  for (const g of railsNear(r.pos.x, r.pos.z)) {
    if (Math.abs(r.base - g.y) > 1) continue; // up on a bridge over the tracks, or under one
    const along = (r.pos.x - g.ax) * g.ux + (r.pos.z - g.az) * g.uz;
    if (along < 0 || along > g.L) continue;
    const d1 = (r.pos.z - g.az) * g.ux - (r.pos.x - g.ax) * g.uz, d0 = (was.z - g.az) * g.ux - (was.x - g.ax) * g.uz;
    const over = [-1, 1].some(side => (d0 - side * RAIL_GAUGE / 2) * (d1 - side * RAIL_GAUGE / 2) < 0);
    if (!over) continue;
    // the angle between the bike and the rail
    if (Math.abs(Math.sin(r.yaw) * g.uz - Math.cos(r.yaw) * g.ux) < Math.sin(RAIL_ANGLE)) railFall(r);
    return;
  }
}

function railFall(r) {
  r.railTime = RAIL_FALL;
  r.railDown = true;
  r.railCd = RAIL_FALL + RAIL_AGAIN; // and once back on the bike, not again for a while
  r.stunTime = Math.max(r.stunTime, RAIL_FALL);
  r.railSide = Math.random() < 0.5 ? 1 : -1;
  r.speed = Math.sign(r.speed) * Math.min(Math.abs(r.speed), 4); // the bike stops dead, it slides on a little
  particles.burst(r.pos.x + r.fx, 0.3 + r.base, r.pos.z + r.fz, 12, { color: [0xb0a99f, 0x8d8379, 0xffd740], speed: 3, up: 3, gravity: 12, life: 0.6, size: 0.15, drag: 1 });
  shout(true);
  sfx.crash(PAN[r.human]); buzz('crash');
  hudMsg(r.human, t_('msg.rails'), 'bad');
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

// A julientje thrown to the students (the zombie quest): true when one went.
function throwFries(r) {
  if (game.state !== 'race' || !quest?.def.fries || !quest.throwFries(r)) return false;
  sfx.throw(PAN[r.human]); buzz('tap');
  return true;
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

// Riding about freely: come onto a tram stop's platform (or by its sign) and you are asked straight
// away whether you want to wait for the tram; say yes and the next one along comes soon: one already
// close up the line, or else one put on the line at most TRAM_SUMMON metres off. Once it halts you are on
// board, the camera swings out for the view while it takes you through the city, and you get off
// whenever you like, at the stop nearest where the tram is (at the end of the line, everybody off).
// r.tram: { sign } being asked, { sign, edge, at, t } waiting, { riding, t, edge, view } on board.
const TRAM_NEAR = 7; // metres from the sign, or from the platform's middle line, that count as at the stop
const TRAM_GIVE_UP = 20; // metres from the platform: ride further off than this and you no longer wait
const TRAM_SUMMON = 50; // metres up the line from you: the furthest a tram you wait for is brought from
const tramsOn = () => (exploring() && city?.trams && TRAM_STOPS?.length ? city.trams : null);
const onTram = r => !!r.tram?.riding;
const riding = r => onTram(r) || onBus(r); // on a tram or a bus: it takes you along
const seated = r => onBus(r) || !!r.tram?.seat; // inside, by a window
const tramPos = new THREE.Vector3(), tramAhead = new THREE.Vector3();

// how far the rider is from stop s: from its sign, its post, or anywhere along its platform (tramstops.js)
function stopDist(s, r) {
  let d = Math.hypot(s.x - r.pos.x, s.z - r.pos.z);
  if (s.post) d = Math.min(d, Math.hypot(s.post.x - r.pos.x, s.post.z - r.pos.z));
  if (s.platform) {
    const [ax, az, bx, bz] = s.platform, dx = bx - ax, dz = bz - az;
    const f = clamp(((r.pos.x - ax) * dx + (r.pos.z - az) * dz) / (dx * dx + dz * dz || 1), 0, 1);
    d = Math.min(d, Math.hypot(ax + dx * f - r.pos.x, az + dz * f - r.pos.z));
  }
  return d;
}
// the stop within reach of the rider, nearest first
function signNear(r, reach = TRAM_NEAR) {
  let best = null, bd = reach;
  for (const s of TRAM_STOPS) {
    const d = stopDist(s, r);
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
  if (onTram(r)) return rideTram(r, T, dt);
  if (onBus(r)) { r.tram = null; return; }
  const w = r.tram;
  if (w?.edge) {
    // waiting: for the tram summoned, until it halts here with its doors open
    if (stopDist(w.sign, r) > TRAM_GIVE_UP) { r.tram = null; return; }
    if (!w.t || w.t.edge !== w.edge || w.t.head > w.at + T.LENGTH / 2 + 1) w.t = T.fleet.summon(w.edge, w.at, r.pos.x, r.pos.z, busyTrams(r), TRAM_SUMMON + 30, TRAM_SUMMON + T.LENGTH / 2);
    if (w.t?.stopped && Math.abs(w.t.served - (w.at + T.LENGTH / 2)) < 1) boardTram(r, w.t, w.edge);
    return;
  }
  // beside a tram that is halting, or nearly: get on it? Always (only not the one you got off a
  // moment ago). At a stop with no tram there, still or riding along its platform: wait for one?
  // (After you said no, or got off here, not that again until you have left the stop.)
  const ok = !r.afloat && r.y < 0.3;
  const sign = ok ? signNear(r) : null, near = ok ? tramBeside(T, r, sign, game.time < (r.tramLeftAt ?? -1) + 4 ? r.tramLeft : null) : null;
  if (!signNear(r, TRAM_NEAR + 6)) r.tramQuiet = false;
  r.tram = near ? { sign, near } : sign && !r.tramQuiet ? { sign } : null;
}

// A tram standing still or nearly, alongside the rider: within a few metres of its side, or, with
// the rider at stop `sign`, alongside that stop's platform. The nearest.
const TRAM_BESIDE = 4.5, TRAM_SLOW = 4; // metres from its middle line; m/s
function tramBeside(T, r, sign, but = null) {
  const at = sign?.platform ? [(sign.platform[0] + sign.platform[2]) / 2, (sign.platform[1] + sign.platform[3]) / 2] : sign ? [sign.x, sign.z] : null;
  let best = null, bd = Infinity;
  for (const t of T.fleet.list) {
    if (t === but || t.ended || t.v > TRAM_SLOW || (t.nose[0] - r.pos.x) ** 2 + (t.nose[2] - r.pos.z) ** 2 > (T.LENGTH + 40) ** 2) continue;
    for (let k = 1; k < T.LENGTH; k += 3) {
      behind(t, k, tramPos);
      const d = Math.hypot(tramPos.x - r.pos.x, tramPos.z - r.pos.z);
      // by the platform: some of the tram within the platform's half-length plus a bit of its middle
      const by = at && Math.hypot(tramPos.x - at[0], tramPos.z - at[1]) < 24;
      if ((d < TRAM_BESIDE || by) && d < bd) { best = t; bd = d; }
    }
  }
  return best;
}

const busyTrams = (but = null) => new Set(humans.filter(o => o !== but && o.tram?.t).map(o => o.tram.t));

// The fire key (or a tap on the card): yes, wait for the tram; or, on board, get off. False when
// there is no tram to answer, so the key does what it always does.
function tramAction(r) {
  const T = tramsOn();
  if (r.bus && busAction(r)) return true;
  if (!T || !r.tram) return false;
  if (onTram(r)) {
    // get off: first which stop it would be, then (yes) out at it
    if (r.tram.ask) leaveTram(r, false, r.tram.ask);
    else r.tram.ask = exitStop(T, r.tram);
    sfx.ui();
  } else if (r.tram.near) boardTram(r, r.tram.near, r.tram.near.edge);
  else if (r.tram.edge) { r.tram = null; r.tramQuiet = true; } // changed your mind: not asked again till you ride on
  else {
    const sign = r.tram.sign, [, [run, at]] = nextTram(T, sign), edge = T.net.edges[run];
    toPlatform(r, sign);
    r.tram = { sign, edge, at, t: T.fleet.summon(edge, at, r.pos.x, r.pos.z, busyTrams(r), TRAM_SUMMON + 30, TRAM_SUMMON + T.LENGTH / 2) };
    sfx.ui();
  }
  return true;
}

// Off to wait on stop s's platform: from wherever by the stop onto the nearest spot along its middle
// (clear of its ends), looking along the track, and there you sit down to wait.
function toPlatform(r, s) {
  let x = s.post?.x ?? s.x, z = s.post?.z ?? s.z, yaw = r.yaw;
  if (s.platform) {
    const [ax, az, bx, bz] = s.platform, dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1;
    const f = clamp(((r.pos.x - ax) * dx + (r.pos.z - az) * dz) / (L * L), Math.min(0.5, 3 / L), Math.max(0.5, 1 - 3 / L));
    [x, z] = [ax + dx * f, az + dz * f];
    yaw = Math.atan2(dx, dz);
    if (Math.cos(yaw - r.yaw) < 0) yaw = wrapAngle(yaw + Math.PI); // the way along it you were going
  }
  if (Math.hypot(x - r.pos.x, z - r.pos.z) > 0.5) {
    particles.burst(r.pos.x, 1, r.pos.z, 16, { color: 0xffe680, speed: 4, up: 3, life: 0.6, size: 0.22, grow: 0.5, opacity: 0.9, drag: 3 });
    r.pos.x = x;
    r.pos.z = z;
    r.base = world.relief?.at(x, z) ?? r.base; // up on the platform
    r.baseV = 0;
  }
  Object.assign(r, { yaw, speed: 0, steer: 0, vy: 0, y: 0 });
  if (r.human >= 0) camYaw[r.human] = yaw;
}

function boardTram(r, t, edge) {
  r.tram = { riding: true, t, edge, view: 0, cam: null, seat: false, ask: null };
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

// The stops of the tram's line with how far along it they are, and where the tram is (its middle).
function lineStops(T, ride) {
  const run = T.net.edges.indexOf(ride.edge), here = ride.t.head - T.LENGTH / 2, list = [];
  for (const s of TRAM_STOPS) for (const [k, at] of s.serves) if (k === run) list.push({ s, at });
  return { here, list };
}
const EXIT_NEAR = 20; // metres: a stop this close (coming up, or halted at) is where you get off
// Where you get off when you ask: the stop the tram is at or nearly at, or else the last one it passed.
function exitStop(T, ride) {
  const { here, list } = lineStops(T, ride);
  let near = null, last = null;
  for (const o of list) {
    if (!near || Math.abs(o.at - here) < Math.abs(near.at - here)) near = o;
    if (o.at < here && (!last || o.at > last.at)) last = o;
  }
  return (near && Math.abs(near.at - here) <= EXIT_NEAR ? near : last ?? near)?.s ?? null;
}

// Off the tram: at the stop given, or else at its stop nearest where it is now. Beside the sign,
// facing the way the tram went.
function leaveTram(r, end = false, stop = null) {
  const T = city?.trams, ride = r.tram;
  r.tram = null;
  r.tramQuiet = true;
  if (ride?.riding) Object.assign(r, { tramLeft: ride.t, tramLeftAt: game.time });
  if (!ride?.riding || !T) return;
  let best = stop, bd = Infinity;
  if (!best) {
    const { here, list } = lineStops(T, ride);
    for (const o of list) if (Math.abs(o.at - here) < bd) { best = o.s; bd = Math.abs(o.at - here); }
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

// By a door: which building it is and how to go in, or, inside, the way back out to the street.
function updateDoorCard(h, r, p) {
  const d = p < game.players ? doorBy(r) : null;
  h.door.classList.toggle('show', !!d);
  if (!d) return;
  const out = d.way === 'out';
  setText(h.doorEmoji, out ? '🚪' : d.room.emoji);
  setText(h.doorLabel, t_(out ? 'door.out' : 'door.in'));
  setText(h.doorName, out ? d.room.street.name ?? NAME?.[getLang()] ?? '' : roomName(d.room));
  setText(h.doorKey, touch.on && p === 0 ? t_('door.tap') : ctl(p).label.fire);
}

// Inside the tram, sitting by a window, or back out for the view from outside (the jump key, or the
// card's button). On a bus you are always inside.
function toggleSeat(r) {
  if (!onTram(r)) return;
  r.tram.seat = !r.tram.seat;
  r.tram.cam = null; // the outside view starts again from where the camera is
  sfx.ui();
}

// ------------------------------------------------------------------ riding the bus

// Riding about freely, pass close by a bus and you are asked whether you want to get on; say yes
// and you are sitting inside by a window, looking out at the city going by. Ask to get off and
// you do at its next stop (straight away when it is standing still), on the pavement beside it.
// r.bus: { c } being asked, { riding, c, off, x, z, yaw, y } on board (where it last was).
const BUS_NEAR = 3.5; // metres from its side, nose or tail
const busesOn = () => (exploring() && city?.traffic ? city.traffic : null);
const onBus = r => !!r.bus?.riding;

// the bus within reach of the rider, nearest first, and how far off it is
function busNear(r, reach) {
  let best = null, bd = reach;
  for (const c of city.traffic.cars) {
    if (!c.on || !c.bus) continue;
    const dx = r.pos.x - c.pos.x, dz = r.pos.z - c.pos.z, fx = Math.sin(c.yaw), fz = Math.cos(c.yaw);
    const along = Math.abs(dx * fx + dz * fz) - 6, side = Math.abs(dx * fz - dz * fx) - 1.3;
    const d = Math.hypot(Math.max(0, along), Math.max(0, side));
    if (d < bd) { best = c; bd = d; }
  }
  return [best, bd];
}

function updateBus(r, dt) {
  const T = busesOn();
  if (!T) { if (r.bus) leaveBus(r); return; }
  if (onBus(r)) return rideBus(r, dt);
  // not while on the tram or waiting for one, nor afloat or in the air
  if (r.tram || r.afloat || r.y > 0.3) { r.bus = null; return; }
  const [c] = busNear(r, BUS_NEAR);
  // the one you said no to, or just got off, does not ask again until you are clear of it
  if (r.busQuiet && busNear(r, BUS_NEAR + 4)[0] !== r.busQuiet) r.busQuiet = null;
  r.bus = c && c !== r.busQuiet ? { c } : null;
}

// The fire key (or a tap on the card) by a bus: get on; on board: get off (at the next stop).
function busAction(r) {
  if (!busesOn() || !r.bus) return false;
  if (!onBus(r)) boardBus(r, r.bus.c);
  else if (r.bus.ask) {
    // confirmed: back at the last stop, straight away; or at the one it is at / coming up, when it halts
    const { at, back } = r.bus.ask;
    r.bus.ask = null;
    if (back) leaveBus(r, false, at);
    else if (r.bus.c.wait > 0 || r.bus.c.speed < 0.5) leaveBus(r);
    else r.bus.off = true;
  } else if (r.bus.off) r.bus.off = false; // not stopping after all
  else r.bus.ask = busExitStop(r.bus);
  sfx.ui();
  return true;
}

function boardBus(r, c) {
  r.tram = null;
  r.bus = { riding: true, c, off: false, x: c.pos.x, z: c.pos.z, y: c.pos.y, yaw: c.yaw };
  Object.assign(r, { speed: 0, steer: 0, vy: 0, y: 0, stumbleTime: 0, spinTime: 0 });
  r.model.stars.visible = false;
  hudMsg(r.human, t_('bus.on'), 'good');
  sfx.jump(PAN[r.human]);
}

// On board: the rider goes where the bus is, looking the way it goes. It may be gone (the end of
// its line), or taken off for a street somewhere else: then off you get where it last was.
function rideBus(r, dt) {
  const b = r.bus, c = b.c;
  if (!c.on || Math.hypot(c.pos.x - b.x, c.pos.z - b.z) > 20) return leaveBus(r, true);
  if (b.off && c.wait > 0) return leaveBus(r);
  Object.assign(b, { x: c.pos.x, z: c.pos.z, y: c.pos.y, yaw: c.yaw });
  r.pos.set(c.pos.x, 0, c.pos.z);
  r.base = c.pos.y;
  r.yaw = c.yaw;
  r.speed = c.speed;
  if ((r.streetT = (r.streetT ?? 0) - dt) <= 0) {
    r.streetT = 0.3;
    r.street = streetAt(world.colliders, r.pos.x, r.pos.z) || r.street;
  }
}

// Where you get off when you ask, as the tram does: the stop it is at or nearly at (it halts there,
// or is about to), or else the last one it halted at. { stop, back }: back when it is behind us.
function busExitStop(b) {
  const T = city.traffic, c = b.c;
  const at = T.nextStop(c), next = at && busStopNear(at.x, at.z, 40);
  if (next && (c.wait > 0 || Math.hypot(at.x - c.pos.x, at.z - c.pos.z) <= EXIT_NEAR)) return { stop: next, back: false };
  const was = T.prevStop(c), prev = was && busStopNear(was.x, was.z, 40);
  if (prev) return { stop: prev, back: true, at: was };
  return next ? { stop: next, back: false } : { stop: null, back: false };
}

// Off the bus: on the pavement to the right of it, by its middle door, facing the way it goes; or,
// at a stop given (the last one), on the pavement there.
function leaveBus(r, end = false, at = null) {
  const b = r.bus;
  r.bus = null;
  if (!b?.riding) return;
  r.busQuiet = b.c;
  const fx = Math.sin(b.yaw), fz = Math.cos(b.yaw);
  if (at) r.pos.set(at.x - fz * 2.4, 0, at.z + fx * 2.4);
  else r.pos.set(b.x - fz * 2.4, 0, b.z + fx * 2.4);
  Object.assign(r, { yaw: b.yaw, speed: 0, steer: 0, y: 0, vy: 0, ground: 0, base: world.relief?.at(r.pos.x, r.pos.z) ?? 0, baseV: 0, onRoute: undefined });
  camYaw[r.human] = b.yaw;
  const stop = !end && busStopNear(r.pos.x, r.pos.z, 30);
  hudMsg(r.human, end ? t_('bus.end') : stop ? t_('bus.offAt', { name: stop.name }) : t_('bus.off'), 'good');
  particles.burst(r.pos.x, 1, r.pos.z, 18, { color: 0xffe680, speed: 4, up: 3, life: 0.6, size: 0.22, grow: 0.5, opacity: 0.9, drag: 3 });
}

// the bus stop (the city's STOPS) nearest (x, z), within reach metres
function busStopNear(x, z, reach) {
  let best = null, bd = reach;
  for (const s of STOPS ?? []) {
    if (s.kind !== 'bus') continue;
    const d = Math.hypot(s.x - x, s.z - z);
    if (d < bd) { best = s; bd = d; }
  }
  return best;
}

// The card for the tram or the bus: a big TRAM (or BUS) over the question at a stop, the tram on
// its way, or one halting there to get on; and a button for it, as well as the key. On board it is a
// bar right across the top instead, with nothing else up there: where it goes, the next stop, and
// the button to get off (or Enter, or Escape), which first asks at which stop: yes, or no after all.
function updateTramCard(h, r, p) {
  const T = tramsOn(), w = r.tram, keys = !(touch.on && p === 0);
  const c = r.bus && busesOn() ? busCard(r) : T && w ? tramCard(T, r, w, keys) : null;
  const on = !!c?.on;
  h.tram.classList.toggle('show', !!c);
  h.tram.classList.toggle('aboard', on);
  h.el.classList.toggle('aboard', on);
  h.el.classList.toggle('tramnear', !!c); // the sight's card makes way for it
  h.street.classList.toggle('aboard', on);
  if (!c) return;
  if (!on) placeTramCard(h);
  else if (h.tram.style.top) h.tram.style.top = '';
  setText(h.tramHead, c.head);
  badge(h, c.line, c.icon);
  setText(h.tramLabel, c.label);
  setText(h.tramName, c.name);
  setHtml(h.tramText, c.text ?? '');
  const key = ctl(p).label.fire;
  setText(h.tramGo, keys ? `${c.go} · ${on && !c.cancel ? `${key} / ESC` : key}` : c.go);
  h.tramSeat.hidden = !c.seat && !c.cancel;
  if (c.cancel) setText(h.tramSeat, keys ? `${c.cancel} · ESC` : c.cancel);
  else if (c.seat) setText(h.tramSeat, `${w.seat ? t_('tram.stand') : t_('tram.sit')}${keys ? ` · ${ctl(p).label.jump}` : ''}`);
}

function tramCard(T, r, w, keys) {
  if (onTram(r)) {
    const l = w.edge.line, along = w.t.head - T.LENGTH / 2;
    const next = l.stops.find(st => st.at > along + 5);
    // asked to get off: at which stop, yes or no
    if (w.ask) return { on: true, head: t_('tram.headOn'), line: l, label: '', name: t_('tram.askOff', { name: w.ask.name }), go: t_('tram.btnYes'), cancel: t_('tram.btnCancel') };
    return {
      on: true, seat: true, head: t_('tram.headOn'), line: l,
      label: next ? t_('tram.next', { name: next.name }) : '',
      name: `→ ${l.to}`,
      text: keys && !w.seat ? t_('tram.lookKey') : '',
      go: t_('tram.btnGetOff'),
    };
  }
  if (w.near) {
    const l = w.near.edge.line;
    return { head: t_('tram.head'), line: l, label: w.sign ? `${t_('tram.stop')} · ${w.sign.name}` : t_('tram.label'), name: t_('tram.board', { ref: l.ref, to: l.to }), go: t_('tram.btnBoard') };
  }
  if (w.edge) {
    const l = w.edge.line, d = w.t ? Math.max(0, w.at + T.LENGTH / 2 - w.t.head) : null;
    return {
      head: t_('tram.head'), line: l, label: `${t_('tram.stop')} · ${w.sign.name}`, name: `→ ${l.to}`,
      text: t_('tram.coming') + (d != null && d > 15 ? ` · ${Math.round(d / 10) * 10} m` : ''), go: t_('tram.btnCancel'),
    };
  }
  const via = [...new Map(w.sign.serves.map(([run]) => T.net.edges[run].line).map(l => [l.ref + l.to, l])).values()];
  return { head: t_('tram.head'), label: t_('tram.stop'), name: w.sign.name, text: via.map(l => `${l.ref} → ${l.to}`).join(' · '), go: t_('tram.btnWait') };
}

function busCard(r) {
  const b = r.bus, ref = b.c.p.ref, line = ref ? { ref } : null;
  if (!onBus(r)) return { head: t_('bus.head'), line, icon: '🚌', label: t_('bus.label'), name: t_('bus.ask'), go: t_('bus.btnBoard') };
  if ((b.nextT = (b.nextT ?? 0) - 1) <= 0) {
    b.nextT = 20; // every so many frames: where it halts next
    const at = city.traffic.nextStop(b.c);
    b.next = at && busStopNear(at.x, at.z, 40);
  }
  if (b.ask?.stop) return { on: true, head: t_('bus.headOn'), line, icon: '🚌', label: '', name: t_('tram.askOff', { name: b.ask.stop.name }), go: t_('tram.btnYes'), cancel: t_('tram.btnCancel') };
  return {
    on: true, head: t_('bus.headOn'), line, icon: '🚌',
    label: b.next ? t_('tram.next', { name: b.next.name }) : t_('bus.label'),
    name: ref ? t_('bus.line', { ref }) : t_('bus.label'),
    text: b.off ? t_('bus.stopping') : '',
    go: b.off ? t_('tram.btnStay') : t_('tram.btnOff'),
  };
}
// Under what sits at the top above it (the minimap, and the street sign with the 🗺️ label under it:
// in the middle, or on a phone down the left), never over it.
function placeTramCard(h) {
  const box = h.el.getBoundingClientRect(), card = h.tram.getBoundingClientRect();
  let low = 0;
  for (const e of [$('minimap'), h.street]) {
    const b = e.getBoundingClientRect();
    if (b.height && b.left < card.right && b.right > card.left) low = Math.max(low, b.bottom);
  }
  const top = low ? `${Math.round(low - box.top + 10)}px` : '';
  if (h.tram.style.top !== top) h.tram.style.top = top;
}
function badge(h, line, icon = '🚋') {
  h.tramBadge.classList.toggle('plain', !line);
  setText(h.tramBadge, line ? line.ref : icon);
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
  if (r.heli) {
    // flying the helicopter, its rotors turning faster the harder it works
    if (!r.heliModel) scene.add(r.heliModel = helicopter());
    const hm = r.heliModel;
    hm.position.set(r.pos.x, r.base + r.y, r.pos.z);
    hm.rotation.set(r.tilt ?? 0, r.yaw, r.bank ?? 0, 'YXZ');
    hm.userData.spin(t, game.state === 'race' || r.y > 0.1 ? 1 : 0.2);
    hm.userData.rope(quest?.rope(r) ?? 0);
    // its shadow on the ground (or the water) right below, sharp and dark close down, fading higher up
    if (!r.heliShadow) scene.add(r.heliShadow = heliShadow());
    const fade = clamp(1 - r.y / 70, 0, 1);
    r.heliShadow.visible = fade > 0;
    r.heliShadow.position.set(r.pos.x, (r.heliFloor ?? r.base) + 0.08, r.pos.z);
    r.heliShadow.rotation.y = r.yaw;
    r.heliShadow.scale.setScalar(1 + r.y / 160); // a little wider the higher it flies
    r.heliShadow.material.opacity = 0.45 * fade;
    m.root.visible = false;
    if (r.boat) r.boat.visible = false;
    return;
  }
  if (r.car) {
    // driving a stolen car: the car goes where the rider goes
    r.car.model.position.set(r.pos.x, r.base + r.y, r.pos.z);
    r.car.model.rotation.set(0, r.yaw, 0);
    r.car.model.visible = !(cabOf(r) && game.players === 1); // driving from the cab: the view is out through the windscreen, not the bus's own insides
    m.root.visible = false;
    return;
  }
  m.root.position.set(r.pos.x, r.base + r.y, r.pos.z);
  m.root.rotation.y = r.yaw;
  // in the water the rider is in a boat of the Bootjes van Gent instead, at its wheel
  if (r.boat && r.afloat && r.boat.userData.vessel !== r.vessel) { scene.remove(r.boat); r.boat = null; }
  if (r.afloat && !r.boat) {
    scene.add(r.boat = r.vessel === 'swim' ? swimmer() : r.vessel === 'row' ? rowingBoat() : tourBoat());
    r.boat.userData.vessel = r.vessel;
  }
  if (r.boat) {
    r.boat.visible = r.afloat;
    if (r.afloat) {
      r.boat.position.set(r.pos.x, (r.water ?? WATER) + r.y + Math.sin(t * 1.3 + r.i) * 0.05, r.pos.z);
      r.boat.rotation.set(Math.sin(t * 0.9 + r.i) * 0.015, r.yaw, -r.steer * Math.min(1, Math.abs(r.speed) / BOAT_SPEED) * 0.08, 'YXZ');
      r.boat.userData.stroke?.(t, r.speed);
      m.root.visible = false;
      return;
    }
  }
  if (r.railTime > 0) {
    // come off on the tram rails: over on its side, the rider on the cobbles (js/tumble.js)
    fallPose(m, RAIL_FALL - r.railTime, t, r.railSide, 0);
    m.root.visible = true;
    return;
  }
  if (r.spinTime > 0) {
    const k = 1 - r.spinTime / SPIN_TIME;
    m.spin.rotation.y = (1 - Math.pow(1 - k, 3)) * Math.PI * 4;
    m.spin.position.y = Math.sin(k * Math.PI) * 0.6;
  } else {
    m.spin.rotation.set(0, 0, 0);
    m.spin.position.set(0, 0, 0);
  }
  m.root.visible = !(r.invuln > 0 && r.spinTime <= 0 && r.rearTime <= 0 && Math.floor(t * 16) % 2 === 0);

  const before = Math.floor(m.phase / (Math.PI / 2));
  // waiting for the tram, standing still: off the mount and sat on the ground beside it
  r.sitK = (r.sitK ?? 0) + ((r.tram?.edge && !riding(r) && Math.abs(r.speed) < 0.5 ? 1 : 0) - (r.sitK ?? 0)) * Math.min(1, dt * 2.5);
  m.animate(dt, r.speed, r.steer, t, {
    sit: r.sitK > 0.01 ? r.sitK : 0,
    air: clamp((r.y - r.ground) / 0.4, 0, 1),
    vy: r.vy,
    rear: r.rearTime > 0 ? 1 - r.rearTime / REAR_TIME : 0,
    stumble: r.stumbleTime > 0 ? 1 - r.stumbleTime / STUMBLE_TIME : 0,
    gun: paintballOn(r),
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
    } else if (r.heli && !r.finished) {
      // behind and above the helicopter, swinging round after it, looking down a little more the higher it flies
      camYaw[p] += wrapAngle(r.yaw - camYaw[p]) * (1 - Math.exp(-dt * 2.5));
      const fx = Math.sin(camYaw[p]), fz = Math.cos(camYaw[p]), up = Math.min(1, r.y / 60);
      const back = 20 + up * 8, alt = r.base + r.y;
      cam.position.set(r.pos.x - fx * back, alt + 7 + up * 6, r.pos.z - fz * back);
      cam.lookAt(r.pos.x + fx * 14, alt + 2 - up * 8, r.pos.z + fz * 14);
      fov = 64 + (Math.max(0, r.speed) / HELI_SPEED) * 8;
    } else if (cabOf(r)) {
      // at the wheel of a borrowed bus or bin lorry: from the driver's seat, out through the windscreen
      // (the cab's pillars, dashboard and steering wheel are drawn over it: .cabview)
      const cab = cabOf(r), fx = Math.sin(r.yaw), fz = Math.cos(r.yaw), lx = fz, lz = -fx;
      const shake = Math.sin(t * 17) * 0.012 * Math.min(1, Math.abs(r.speed) / 8);
      cam.position.set(r.pos.x + fx * cab.z + lx * cab.x, r.base + r.y + cab.y + shake, r.pos.z + fz * cab.z + lz * cab.x);
      cam.lookAt(cam.position.x + fx * 20, cam.position.y - 1.4, cam.position.z + fz * 20);
      camYaw[p] = r.yaw;
      fov = 72;
    } else if (seated(r)) {
      // sitting inside by a window on the right, looking out at the street going by: a fixed view,
      // swaying a little as it goes (the window's dark glass and its frame are drawn over it: .seatview)
      const fx = Math.sin(r.yaw), fz = Math.cos(r.yaw), rx = -fz, rz = fx;
      const sway = Math.sin(t * 6.5) * 0.015 * Math.min(1, Math.abs(r.speed) / 6);
      cam.position.set(r.pos.x + rx * 0.45 + fx * 0.3, r.base + 1.9 + sway, r.pos.z + rz * 0.45 + fz * 0.3);
      cam.lookAt(cam.position.x + rx * 10 + fx * 3.5, cam.position.y - 0.3, cam.position.z + rz * 10 + fz * 3.5);
      camYaw[p] = r.yaw;
      fov = 60;
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
      // sat down waiting for the tram: the camera comes slowly round to the front, to see them sit
      const sit = r.sitK ?? 0;
      camYaw[p] += wrapAngle(r.yaw + sit * 2.3 - camYaw[p]) * (1 - Math.exp(-dt * (sit > 0.05 ? 1.2 : 6)));
      const fx = Math.sin(camYaw[p]), fz = Math.cos(camYaw[p]);
      let back = (world.cfg.theme.camBack ?? 8.5) * (r.afloat ? 1.6 : 1); // a boat is long: further back
      // riding about freely the camera can swing behind a wall: keep it on this side
      if (roaming() && world.colliders) back *= Math.max(0.15, clearLine(world.colliders, r.pos.x, r.pos.z, r.pos.x - fx * (back + 0.6), r.pos.z - fz * (back + 0.6)) - 0.06);
      // on a hill the camera keeps its height over the street behind, and looks up or down the street ahead
      const here = heightAt(r.pos.x, r.pos.z), behind = heightAt(r.pos.x - fx * back, r.pos.z - fz * back) - here;
      const ahead = heightAt(r.pos.x + fx * 6, r.pos.z + fz * 6) - here;
      // inside a building that is all about its ceiling (the Sistine's, the Pantheon's dome), standing
      // still, the camera comes down and looks up at it
      const still = r.room?.lookUp && Math.abs(r.speed) < 0.6;
      r.lookUp = approach(r.lookUp ?? 0, still ? 1 : 0, dt * (still ? 0.45 : 2.5));
      const up = r.lookUp * r.lookUp * (3 - 2 * r.lookUp);
      cam.position.set(r.pos.x - fx * back * (1 - up * 0.5), r.base + 4.1 + (r.afloat ? 1.8 : 0) + r.y * 0.5 + behind - up * 2.6, r.pos.z - fz * back * (1 - up * 0.5));
      cam.lookAt(r.pos.x + fx * 6, r.base + 1.7 + r.y * 0.7 + ahead + up * (r.room?.lookUp ?? 0), r.pos.z + fz * 6);
      fov = 66 + (Math.max(0, r.speed) / MAX_SPEED) * 10;
    }
    cam.fov += (fov - cam.fov) * Math.min(1, dt * 4);
  });
}

// On a big map the shadows only cover the area round the riders, so the sun moves along with them.
function followSun() {
  // (the shadows go with the players out in the streets: a building inside lies far off)
  const out = humans.filter(r => !r.room), theme = world.cfg.theme, who = aerial() ? [menuLook] : (out.length ? out : humans).map(r => r.pos);
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
    const room = !aerial() && INSIDE.at(from.x, from.z), outside = room && lightInside(room);
    renderer.render(scene, cam);
    outside?.();
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
    if (r.human >= 0 && game.state === 'race' && !r.heli) { updateTram(r, dt); updateBus(r, dt); }
    if (r.human === 0 && game.state === 'race' && exploring()) keepSpot(r, dt);
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
  if (city.trams) city.trams.riders = roaming() ? field.filter(r => !riding(r)) : []; // to halt for: whoever is riding about on the rails ahead
  city.update(dt, t);
  city.traffic?.update(dt, aerial() ? [menuCam.position] : cams.slice(0, game.players).map(c => c.position), field.filter(r => !riding(r)).concat(game.state === 'tour' ? tourProps.flatMap(m => m.userData.walkers ?? []) : [])); // not for whoever is on board; on the tour, those walking in the street (the Stroppendragers)
  world.scenery.update(dt, t);
  world.arrows?.update(t);
  world.bikers?.update(dt, t, track, field, bikerHit);
  // the cyclists about the old town, but not in a race's way
  for (const im of Object.values(world.cyclists?.parts ?? {})) im.visible = roaming();
  if (roaming()) world.cyclists?.update(dt, t, field, bikerHit);
  if (paintShots.length || humans.some(h => h.paintCd > 0)) updatePaint(dt);
  updateSplats(dt); // those hit, standing still, falling over (splat.js)
  if (paintedCars.size) carPaint();
  carTick(dt);
  world.people?.update(dt, t, field, pedestrianBump, (r, size) => r.human >= 0 && loud() && sfx.bark(PAN[r.human], size));
  if (game.state === 'tour') updateTour(dt);
  // the dragon on the Belfort and Artevelde on his pedestal: on the tour, only once they have got there themselves
  const touring = tour && (game.state === 'tour' || (game.state === 'paused' && game.resumeState === 'tour'));
  for (const [name, obj] of STANDING) obj.visible = !touring || (flying() ? name !== TOUR.flyer?.stands : tour.home(name)); // (flown yourself: the dragon off the Belfort is the one ridden)
  for (const m of tourProps) {
    m.visible = game.state === 'tour'; // (still there while it is paused)
    if (m.visible && tour) m.userData.update?.(tour, t, (x, z) => Math.max(0, world.relief?.at(x, z) ?? 0)); // (those that walk along with it)
  }
  updateCameras(dt, t, order);

  // on board (everybody playing): the tram's bar is all there is at the top of the screen
  document.body.classList.toggle('aboard', !aerial() && game.state === 'race' && humans.slice(0, game.players).every(riding));
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
  if ($('musicSettings').open) return;
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
      lift: (now.x || now.rb ? 1 : 0) - (now.y || now.lb ? 1 : 0), // up and down, on the dragon
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
        if ((edge('y') || edge('lb')) && !doorAction(humans[k]) && !tramAction(humans[k]) && !throwFries(humans[k])) useItem(humans[k], pads.input[k].back);
      }
    } else if (game.state === 'tour' && flying()) {
      if (edge('start')) setPaused(true); // (A, B and the rest fly it: flyControl)
    } else if (game.state === 'tour') {
      if (edge('a') || edge('right')) tourNext();
      else if (edge('start')) setPaused(true);
      else if (edge('b')) toMenu();
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
    // in the film, the police car player 1 drives has its siren going too
    const cop = demo && humans.find(h => h.human === 0 && h.car?.type === 'police');
    if (cop) src.push({ key: cop, kind: 'siren', x: cop.pos.x, z: cop.pos.z, speed: Math.abs(cop.speed) });
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

// A tram with someone standing on its track just ahead rings its bell three times, quickly; once
// per tram until the way is clear again.
const BELL_AHEAD = 14, BELL_SIDE = 1.8;
function updateTramBells() {
  const T = city?.trams;
  if (!T || !loud() || game.state === 'paused') return;
  for (const t of T.fleet.list) {
    if (!t.nose) continue;
    const [hx, hz] = T.net.heading(t.edge, t.head, t.dir);
    const who = field.find(r => {
      if (r.human < 0 || riding(r)) return false;
      const dx = r.pos.x - t.nose[0], dz = r.pos.z - t.nose[2], ahead = dx * hx + dz * hz;
      return ahead > 0 && ahead < BELL_AHEAD && Math.abs(dx * hz - dz * hx) < BELL_SIDE;
    });
    if (!who) { t.belled = false; continue; }
    if (t.belled) continue;
    t.belled = true;
    sfx.tramBell(game.players > 1 ? PAN[who.human] : 0);
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (watchPaused) return requestAnimationFrame(frame);
  if (RECORD && demo) return requestAnimationFrame(frame); // filmed: demoFrame steps it
  demo?.update(dt);
  if (demo?.done) endDemo();
  pollPads();
  step(dt * (demo?.pace ?? 1)); // (the demo plays some shots a little faster)
  tickFade(dt);
  weather.update(dt);
  updateAmbient(dt);
  updateTramBells();
  updateTouchLayer();
  if (!big || !bigEl.classList.contains('full')) render(); // not behind the big map where it covers the screen
  takeShot();
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------------ the demo

// ?demo: the city's DEMO (<city>/demo.js) plays, a film of about a minute cut from the tour and the
// quests (js/demo.js), to the tour's music, from a click (for the browser to allow the music);
// &shots=3-5: only those shots (from 0). ?demo=record: frame by frame instead, a step each time
// tools/demo.mjs asks (ghent3d.demoFrame) and takes a picture, the music put under it afterwards.
const DEMO_LINK = new URLSearchParams(location.search).get('demo');
const RECORD = DEMO_LINK === 'record';
// what the demo changes as it goes, put back when it is over
const DEMO_KEEPS = ['kind', 'mission', 'mounts', 'picks', 'trackIdx', 'tourMode', 'tourSpeed', 'cards', 'mode'];
let demoKept = null;
// wait: black with a ▶ until a click (a link to it), or straight away (the menu's trailer card)
function startDemo(wait) {
  demoKept = Object.fromEntries(DEMO_KEEPS.map(k => [k, structuredClone(game[k])]));
  game.cards = true;
  game.mode = 1;
  demo = new Demo(DEMO, {
    tour(at, speed, { welcome, cards }) {
      game.kind = 'tour';
      game.tourMode = 'auto';
      game.tourSpeed = speed;
      game.cards = cards;
      startTour();
      if (!welcome) tour.seekTo(at);
      startSky(); // the tour's sky there, straight away
      showTourCard(null);
    },
    music(t) {
      music.stop();
      music.play(DEMO.music?.name ?? 'tour', (DEMO.music?.from ?? 0) + t);
    },
    tire() { if (quest?.thief && quest.def.zigzag != null) quest.thief.age = quest.def.zigzag + 4; }, // weaving from the start
    quest(id, mount) { ride(QUESTS.findIndex(q => q.id === id) + 1, mount); },
    race(id, mount) {
      hideTour();
      game.kind = 'race';
      game.trackIdx = Math.max(0, TRACKS.findIndex(t => t.id === id));
      if (mount) game.mounts[0] = mount;
      setTrack(game.trackIdx);
      startRace(true);
    },
    ai: (r, dt) => aiControl(r, dt, false),
    begin: () => beginQuest(),
    explore([x, z], [lx, lz], mount) {
      ride(0, mount);
      placeRiders({ x, z, yaw: Math.atan2(lx - x, lz - z) });
    },
    warm(seconds) { for (let k = 0; k < seconds * 30; k++) step(1 / 30); },
    car(type) {
      const r = humans[0];
      stealCar(r, { type, c: 0xf4f4f2, x: r.pos.x, z: r.pos.z, yaw: r.yaw });
    },
    board() { if (questBus && !humans[0].car) stealCar(humans[0], questBus); },
    // the traffic's cars off a route [[x, z], ...] (within 6 m of it), but those within near
    // metres of the camera (none: all of them, before the shot shows)
    unblock(pts, near = 0) {
      const cam = cams[0].position;
      for (const c of city.traffic?.cars ?? []) {
        if (!c.on || (near && (c.pos.x - cam.x) ** 2 + (c.pos.z - cam.z) ** 2 < near * near)) continue;
        for (let k = 0; k + 1 < pts.length; k++) {
          const [ax, az] = pts[k], [bx, bz] = pts[k + 1], dx = bx - ax, dz = bz - az;
          const f = clamp(((c.pos.x - ax) * dx + (c.pos.z - az) * dz) / (dx * dx + dz * dz || 1), 0, 1);
          if (Math.hypot(ax + dx * f - c.pos.x, az + dz * f - c.pos.z) < 6) { c.on = false; break; }
        }
      }
    },
    steady() { humans[0].railCd = Infinity; }, // (until the next shot's reset)
    place([x, z], yaw, speed = 0) {
      placeRiders({ x, z, yaw });
      humans[0].speed = speed;
    },
    // where the thief is, and (ax, az) a little ahead on the street they run along, not weaving
    thief() {
      const th = quest?.thief, g = quest?.g;
      if (!th || th.b == null) return th ?? null;
      const dx = g.X[th.b] - g.X[th.a], dz = g.Z[th.b] - g.Z[th.a], L = Math.hypot(dx, dz) || 1, k = (th.s + 4) / L;
      return { x: th.x, z: th.z, ax: g.X[th.a] + dx * k, az: g.Z[th.a] + dz * k };
    },
    over: () => !!quest?.over,
    halt: () => quest?.halts?.[quest.served] ?? null,
    cars: () => (city.traffic?.cars ?? []).filter(c => c.on).map(c => c.pos),
    walkers: () => world.people?.walkers ?? [],
    clear: (x0, z0, x1, z1) => clearLine(world.colliders, x0, z0, x1, z1) >= 1,
    shoot,
    local,
  }, { wait, close: !RECORD && endDemo, bar: !RECORD, shots: new URLSearchParams(location.search).get('shots')?.split('-').map(Number) });
  // a mission (0: riding about freely), off the tour
  function ride(mission, mount) {
    hideTour();
    game.kind = 'mission';
    game.mission = mission;
    missionPlayer();
    if (mount) game.mounts[0] = mount;
    setTrack(game.trackIdx);
    startRace(true);
  }
  if (wait) addEventListener('pointerdown', () => demo?.waiting && go(), { once: true });
}
// on with the film, and its music (a click or key press lets the browser play it)
function go() {
  sfx.unlock();
  music.stop();
  music.play(DEMO.music?.name ?? 'tour', DEMO.music?.from ?? 0);
  demo.go();
}
// the menu's trailer card
function playDemo() {
  startDemo(false);
  go();
}
// Over, or stopped (Esc, ✕): back to the menu as it was.
function endDemo() {
  demo.remove();
  demo = null;
  Object.assign(game, demoKept);
  missionPlayer();
  setTrack(game.trackIdx);
  toMenu();
}
// One frame of the demo being filmed: dt seconds on, and drawn (unless draw is false: a frame not
// kept). Returns whether it is over.
function demoFrame(dt, draw = true) {
  demo.update(dt);
  step(dt * demo.pace);
  tickFade(dt);
  weather.update(dt);
  if (draw) render();
  return demo.done;
}

// ------------------------------------------------------------------ input

const keys = new Set();
const isStart = code => code === 'Space' || code === 'Enter' || code === 'NumpadEnter';

function onPress(code) {
  if ($('musicSettings').open) return;
  sfx.unlock();
  if (demo && !RECORD) { // the demo: Esc stops it, and on a link to it any key starts it
    if (code === 'Escape') endDemo();
    else if (demo.waiting) go();
    return;
  }
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
      if (flying()) { // Space and Enter fly up and down (flyControl)
        if (code === 'Escape') setPaused(true);
        else if (code === 'KeyT') toMenu();
        break;
      }
      if (isStart(code) || code === 'Escape') setPaused(true); // the pause menu, and Space/Enter again carries on
      else if (code === 'ArrowRight' || code === 'KeyD') tourNext();
      else if (code === 'KeyT') toMenu();
      break;
    case 'briefing':
      if (isStart(code)) beginQuest();
      else if (code === 'Escape' || code === 'KeyT') toMenu();
      break;
    case 'countdown':
    case 'race':
      if (code === 'Escape') {
        // on board: get off (as Enter does), or not after all when it asks where; otherwise the pause menu
        const aboard = game.state === 'race' ? humans.slice(0, game.players).filter(riding) : [];
        if (aboard.length) aboard.forEach(r => { if (r.tram?.ask) r.tram.ask = null; else if (r.bus?.ask) r.bus.ask = null; else tramAction(r); });
        else setPaused(true);
        break;
      }
      if (code === 'KeyK') { openBigMap(); break; } // K for kaart
      if (game.state !== 'race') break;
      humans.forEach((r, p) => {
        const k = ctl(p);
        if (r.heli) return; // in the helicopter jump and fire are up and down (humanControl)
        if (k.fire.includes(code) && (doorAction(r) || tramAction(r))) return; // by a door, at a tram stop, or on the tram
        if (k.fire.includes(code) && throwFries(r)) return;
        if (k.fire.includes(code) && paintballOn(r)) return shoot(r);
        if (k.fire.includes(code)) useItem(r, held(k.down));
        if (k.jump.includes(code)) jump(r);
      });
      break;
    case 'paused':
      if (big && pauseEl.classList.contains('hidden')) {
        // on the big map: Enter teleports, Escape forgets the spot and then closes the map
        if (isStart(code)) confirmTeleport();
        else if (code === 'Equal' || code === 'NumpadAdd') zoomBigMap(big.zoom * BIG_STEP);
        else if (code === 'Minus' || code === 'NumpadSubtract') zoomBigMap(big.zoom / BIG_STEP);
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
  if ($('musicSettings').open) return;
  if (e.target instanceof HTMLInputElement) {
    if (e.key === 'Enter' || e.key === 'Escape') e.target.blur();
    return;
  }
  // on the big map on a desktop, typing a letter goes straight to the search for a place (the character lands in it)
  if (big && !touch.on && roaming() && !questing() && e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (bigIndex.classList.contains('hidden')) showBigTab('index');
    bigSearch.focus();
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
const tFries = $('tFries'), tFriesLabel = tFries.querySelector('small');
const STICK_R = 60;

function setTouchMode(on) {
  if (touch.on === on) return;
  touch.on = on;
  document.body.classList.toggle('touch', on);
  if (on && game.mode > 1 && game.state === 'menu') setMode(1);
  renderMenu();
}

function updateTouchLayer() {
  const show = touch.on && (((game.state === 'race' || game.state === 'countdown' || game.state === 'paused') && !touringNow()) || (game.state === 'tour' && flying()));
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
  touch.originY = e.clientY + (freeStick() ? Math.max(0, touch.throttle) * STICK_R : 0);
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
  touch.throttle = freeStick() && touch.throttle > 0.15 ? touch.throttle : 0;
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
touchButton($('tJump'), () => { touch.climb = racers[0].heli || flying(); if (game.state === 'race') jump(racers[0]); }, () => { touch.climb = false; });
touchButton(tItem, () => { if (game.state === 'race' && !doorAction(racers[0])) useItem(racers[0], touch.throttle < -0.5); });
touchButton(tFries, () => throwFries(racers[0]));
touchButton($('tSink'), () => { touch.sink = true; }, () => { touch.sink = false; });
touchButton($('tShoot'), () => shoot(racers[0]));
touchEl.addEventListener('contextmenu', e => e.preventDefault());

addEventListener('touchstart', () => setTouchMode(true), { passive: true, capture: true });
addEventListener('touchend', () => sfx.unlock(), { passive: true }); // iOS only unlocks audio on touchend
addEventListener('click', () => sfx.unlock());

// The pause menu's Share: a link to right where you are, facing the way you face, copied for
// pasting (?pos=<x>,<z>&yaw=<radians>&n=<the street>); whoever opens it rides about freely from there.
// On the tour it is a link to the tour itself (?tour=auto), which opens straight on it, playing on its own.
function shareSpot() {
  const onTour = game.resumeState === 'tour', r = humans[0];
  if (!onTour && !r) return;
  const name = r?.street ? `&n=${encodeURIComponent(r.street)}` : '';
  const url = onTour ? `${location.origin}${location.pathname}?tour=auto`
    : `${location.origin}${location.pathname}?pos=${r.pos.x.toFixed(1)},${r.pos.z.toFixed(1)}&yaw=${r.yaw.toFixed(2)}${name}`;
  const btn = $('pauseShareBtn'), label = btn.querySelector('span');
  const done = () => {
    label.textContent = t_(onTour ? 'pause.copiedTour' : 'pause.copied');
    btn.classList.add('copied');
    setTimeout(() => { label.textContent = t_('pause.share'); btn.classList.remove('copied'); }, 3000);
  };
  report('share_spot', { tour: onTour });
  // copied straight away; where the clipboard is not to be had, the link to copy by hand
  (navigator.clipboard?.writeText(url) ?? Promise.reject()).then(done, () => window.prompt(t_('pause.share'), url));
}

// A link to one sight, ?at=<its id> (the site's page about it has one), into a building, ?inside=<its id>, or to any place,
// ?pos=<x>,<z>&n=<its name> (the site's map page): straight into riding about freely, alone, on a
// street a little way back from it (so it is in view, not a wall up close) and looking at it.
// A link shared from the pause menu also has &yaw=<radians>: it puts you on that very spot, facing
// that way, as whoever shared it was. Nothing of it is saved in the settings.
function visitFromLink() {
  const q = new URLSearchParams(location.search);
  // ?inside=<id>: straight in through a building's door (<city>/inside.js)
  const room = q.get('inside') && INSIDE.list.find(b => b.id === q.get('inside'));
  if (room) {
    report('visit_from_link', { sight: `inside:${room.id}` });
    Object.assign(game, { kind: 'mission', mission: 0, mode: 1 });
    missionPlayer();
    setTrack(game.trackIdx);
    startRace();
    putAt(humans[0], room.inside.x, room.inside.z, room.inside.yaw);
    return;
  }
  const sight = q.get('at') && SIGHTS?.find(s => s.id === q.get('at'));
  const [px, pz] = (q.get('pos') || '').split(',').map(Number);
  const yaw = Number(q.get('yaw'));
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
  const exact = !sight && q.has('yaw') && Number.isFinite(yaw) && landingAt(place.x, place.z);
  if (exact?.ok) {
    humans.forEach(r => { r.yaw = yaw; });
    teleport(exact);
    return;
  }
  const back = place.r * 0.6, spots = [];
  for (const rd of world.cfg.map.roads) {
    for (let k = 0; k < rd.p.length; k += 2) spots.push([Math.abs(Math.hypot(rd.p[k] - place.x, rd.p[k + 1] - place.z) - back), rd.p[k], rd.p[k + 1]]);
  }
  spots.sort((a, b) => a[0] - b[0]);
  // Enclosed sights can provide a safe arrival inside their passage, looking along it.
  const arrival = sight?.arrival && landingAt(sight.arrival.x, sight.arrival.z);
  const pick = arrival?.ok ? arrival : spots.slice(0, 50).map(([, x, z]) => landingAt(x, z)).find(p => p.ok) ?? placeLanding(place);
  const look = arrival?.ok ? sight.arrival.look : [place.x, place.z];
  humans.forEach(r => { r.yaw = Math.atan2(look[0] - pick.x, look[1] - pick.z); });
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
if (WATCH != null && TOUR) {
  game.tourMode = 'auto';
  game.tourMusic = false;
  game.tourSpeed = 1;
  startTour();
  // the page around it says when it scrolls out of sight, and back
  addEventListener('message', e => {
    if (e.origin === location.origin && e.data?.type === 'instant-cities:watch') watchPaused = !e.data.on;
  });
}
// ?shots= (above), or ?tour=auto, the tour shared from the pause menu: straight onto the tour, playing on its own
if (TOUR && (SHOTS || new URLSearchParams(location.search).get('tour') === 'auto')) { game.kind = 'tour'; game.tourMode = 'auto'; startTour(); }
if (DEMO_LINK !== null && DEMO) startDemo(!RECORD);
await bootStep('paint');
requestAnimationFrame(frame);
music.ahead = 0.15; // loaded: back to short notice, so the music stops as soon as a game starts
// The menu is filled in and the first frame is drawn: drop the loading screen.
requestAnimationFrame(() => requestAnimationFrame(() => {
  document.body.classList.remove('booting');
  setTimeout(() => document.getElementById('loader').remove(), 500);
  // and to the page around it, watching: it can show the tour now
  if (WATCH != null && parent !== window) parent.postMessage({ type: 'instant-cities:ready' }, location.origin);
}));

// Handy for poking at the game from the dev console.
window.ghent3d = { INSIDE, get city() { return city; }, touch, setTouchMode, setLanguage, pickAnimal, cycleAnimal, pads, pollPads, game, racers, get field() { return field; }, traps, thrown, clouds, get world() { return world; }, get tour() { return tour; }, get quest() { return quest; }, setSky, startRace, toMenu, selectTrack, setMode, setKind, useItem, jump, music, sfx, renderer, scene, step, render, menuCam, menuLook, get demo() { return demo; }, demoFrame };
window.__pr = { teleport, get world() { return world; }, get humans() { return humans; }, game, stealCar }; // DEBUG-RELIEF
