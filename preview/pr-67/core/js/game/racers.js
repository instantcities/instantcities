// The racers: the players and the computer riders, their animals, bikes and names.

import * as THREE from 'three';
import { createAnimal } from '../horse.js';
import { createWalker, createCyclist, createScooterist } from '../riders.js';
import { STABLE, PLAYER_COLORS } from '../horses.js';
import { sfx } from '../sound.js';
import { t_, SLOTS, AI_SKILL, CONTROLS, SOLO, hex, rand } from './base.js';
import { game } from './settings.js';
import { scene } from './scene.js';
import { roaming, track } from './worlds.js';
import { huds } from './hud.js';

// What a player is called: the name they typed in the menu, or "Player 1"/"Player 2".
export const playerName = p => game.playerNames[p] || t_('player', { n: p + 1 });
// A character on a mount: an animal in the character's colours, or the character on foot or on a bike.
// Riding about (exploring or on a quest) every animal has its species' own coat instead: a brown
// horse, a white cow, a pink pig...
export function createRider(h, mount) {
  const def = { ...h, number: STABLE.indexOf(h) + 1, labelLayer: 1, standardCoat: roaming() };
  if (mount === 'foot' || mount === 'heli') return createWalker(def, STABLE.indexOf(h)); // (in the helicopter, out of sight)
  if (mount === 'bike') return createCyclist(def, STABLE.indexOf(h));
  if (mount === 'vespa') return createScooterist(def, STABLE.indexOf(h));
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

export const racers = Array.from({ length: SLOTS }, (_, i) => new Racer(i));

// Fill the four slots: the players' own animals first, then random horses for the computer
// (the computer always rides horses, and there are always enough left over).
export function assignField() {
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

export function refreshWho() {
  humans.forEach((r, p) => {
    huds[p].el.style.setProperty('--c', hex(PLAYER_COLORS[p]));
    huds[p].who.textContent = game.players > 1 ? r.name : ''; // one player needs no name
  });
}
export let humans = [racers[0], racers[1]];
export let field = racers; // everyone on the course: all four in a race, only the players in free roam
export const ctl = p => (game.players === 1 ? SOLO : CONTROLS[p]);

export const thrown = []; // bunnies
export const traps = []; // hedgehogs
export const clouds = []; // rain clouds

export function clearEntities() {
  for (const list of [thrown, traps, clouds]) {
    for (const e of list) {
      scene.remove(e.model.group);
      if (e.bolt) scene.remove(e.bolt);
    }
    list.length = 0;
  }
}

// for the other modules, which may read these but not assign them
export function setHumans(v) { humans = v; }
export function setField(v) { field = v; }
