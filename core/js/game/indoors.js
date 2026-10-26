// Inside buildings: the doors, going in and out, and the light in the rooms (js/interiors.js).

import { local, getLang } from '../i18n.js';
import { NAME, INSIDE } from '../city.js';
import { sfx } from '../sound.js';
import { LIGHT as INDOOR_LIGHT } from '../interiors.js';
import { PAN } from './base.js';
import { game } from './settings.js';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { scene, renderer, hemi, sun, particles, weather, headlamps, camYaw } from './scene.js';
import { exploring, report, world } from './worlds.js';
import { hudMsg } from './hud.js';
import { loud } from './pickups.js';
import { riding } from './transit.js';
import { artBy, showArt } from './artview.js';

// The buildings you can go into (<city>/inside.js) stand out of the city's sight (js/interiors.js):
// by a door in the street a card says which one it is, and riding into the door, the card, or the
// item key takes you in, on foot and at a walk. The door inside takes you back out to the street,
// on what you rode in on. Not in a quest: its targets are all in the streets.
export const INSIDE_PACE = 0.5, INSIDE_COAST = 3; // walking slower, and stopping sooner (times COAST), so you stop where you want to
const DOOR_NEAR = 9, DOOR_REACH = 2.2; // where the card shows, and how close riding into it goes through
export const roomName = b => (typeof b.name === 'string' ? b.name : local(b.name));

// which building a rider is in, if any; walking in and out of one is on foot, whatever you ride
export function inRoom(r) {
  const room = INSIDE.at(r.pos.x, r.pos.z);
  if (room === r.room) return;
  r.room = room;
  const mount = room ? 'foot' : game.mounts[r.human];
  if (r.mount !== mount && r.def) r.setHorse(r.def, mount);
}

// the door a player is by: the nearest within DOOR_NEAR, while riding about freely
export function doorBy(r) {
  if (!exploring() || riding(r) || game.state !== 'race') return null;
  let best = null, bd = DOOR_NEAR;
  for (const d of INSIDE.doors) {
    const k = Math.hypot(r.pos.x - d.x, r.pos.z - d.z);
    if (k < bd) { best = d; bd = k; }
  }
  return best;
}

// riding into a door, heading the way into it, takes you through
export function intoDoor(r) {
  const d = doorBy(r);
  if (!d || Math.hypot(r.pos.x - d.x, r.pos.z - d.z) > DOOR_REACH) return;
  const into = -(Math.sin(r.yaw) * Math.sin(d.yaw) + Math.cos(r.yaw) * Math.cos(d.yaw)) * r.speed;
  if (into > 0.5) through(r, d);
}

// the card, the item key or the touch button: through the door you are by, or else a look at the
// famous piece you stand before (game/artview.js). False when there is neither.
export function doorAction(r) {
  const d = doorBy(r);
  if (d) through(r, d);
  const a = !d && r.human === 0 && exploring() && game.state === 'race' ? artBy(r) : null;
  if (a) { r.speed = 0; showArt(a); }
  return !!(d || a);
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
export function putAt(r, x, z, yaw) {
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
export const onMap = r => (r.room ? r.room.street : r.pos);

// The light inside, for one player's view (render()): the building's own, no rain or snow and no
// lamp carried, in place of the sky outside. Less of it from all round than the sky's and more from
// above, so what stands in the rooms throws its shadow (inside/gothic.js), and a room's soft
// reflections (three.js's RoomEnvironment) in the gilt frames, the polished marble and the floors.
// Gives back what puts the outside back.
const HEMI_INSIDE = 0.68, ENV_INSIDE = 0.3;
let roomEnv = null;
export function lightInside(room) {
  const L = { ...INDOOR_LIGHT, ...room.look };
  roomEnv ??= new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const was = {
    env: scene.environment, envI: scene.environmentIntensity,
    bg: scene.background.clone(), fog: scene.fog.color.clone(), near: scene.fog.near, far: scene.fog.far,
    sky: hemi.color.clone(), ground: hemi.groundColor.clone(), hemi: hemi.intensity, sunColor: sun.color.clone(), sun: sun.intensity,
    rain: weather.rain.visible, snow: weather.snow.visible, lamps: headlamps.map(l => l.visible),
  };
  scene.background.set(L.horizon);
  scene.fog.color.set(L.horizon);
  [scene.fog.near, scene.fog.far] = L.fog;
  hemi.color.set(L.hemi[0]);
  hemi.groundColor.set(L.hemi[1]);
  hemi.intensity = L.hemi[2] * HEMI_INSIDE;
  scene.environment = roomEnv;
  scene.environmentIntensity = ENV_INSIDE;
  sun.color.set(L.sun[0]);
  sun.intensity = L.sun[1];
  weather.rain.visible = weather.snow.visible = false;
  headlamps.forEach(l => (l.visible = false));
  return () => {
    scene.environment = was.env;
    scene.environmentIntensity = was.envI;
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
