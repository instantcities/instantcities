// The demo, the film about the game (?demo, the menu's trailer card): js/demo.js plays the city's
// DEMO and this sets each shot up in the game, and puts the game back as it was afterwards.

import { TRACKS } from '../tracks.js';
import { local } from '../i18n.js';
import { QUESTS, DEMO } from '../city.js';
import { clearLine } from '../collide.js';
import { sfx, music } from '../sound.js';
import { Demo } from '../demo.js';
import { clamp } from './base.js';
import { game } from './settings.js';
import { weather, cams } from './scene.js';
import { quest, demo, setDemo, world, city, tickFade, setTrack } from './worlds.js';
import { humans } from './racers.js';
import { startSky, missionPlayer } from './menu.js';
import { placeRiders, beginQuest, startRace, toMenu } from './race.js';
import { tour, hideTour, startTour, showTourCard } from './touring.js';
import { aiControl } from './control.js';
import { shoot, stealCar, questBus } from './physics.js';
import { render } from './cameras.js';
import { step } from './loop.js';

// ?demo: the city's DEMO (<city>/demo.js) plays, a film of about a minute cut from the tour and the
// quests (js/demo.js), to the tour's music, from a click (for the browser to allow the music);
// &shots=3-5: only those shots (from 0). ?demo=record: frame by frame instead, a step each time
// tools/demo.mjs asks (ghent3d.demoFrame) and takes a picture, the music put under it afterwards.
export const DEMO_LINK = new URLSearchParams(location.search).get('demo');
export const RECORD = DEMO_LINK === 'record';
// what the demo changes as it goes, put back when it is over
const DEMO_KEEPS = ['kind', 'mission', 'mounts', 'picks', 'trackIdx', 'tourMode', 'tourSpeed', 'cards', 'mode'];
let demoKept = null;
// wait: black with a ▶ until a click (a link to it), or straight away (the menu's trailer card)
export function startDemo(wait) {
  demoKept = Object.fromEntries(DEMO_KEEPS.map(k => [k, structuredClone(game[k])]));
  game.cards = true;
  game.mode = 1;
  setDemo(new Demo(DEMO, {
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
  }, { wait, close: !RECORD && endDemo, bar: !RECORD, shots: new URLSearchParams(location.search).get('shots')?.split('-').map(Number) }));
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
export function go() {
  sfx.unlock();
  music.stop();
  music.play(DEMO.music?.name ?? 'tour', DEMO.music?.from ?? 0);
  demo.go();
}
// the menu's trailer card
export function playDemo() {
  startDemo(false);
  go();
}
// Over, or stopped (Esc, ✕): back to the menu as it was.
export function endDemo() {
  demo.remove();
  setDemo(null);
  Object.assign(game, demoKept);
  missionPlayer();
  setTrack(game.trackIdx);
  toMenu();
}
// One frame of the demo being filmed: dt seconds on, and drawn (unless draw is false: a frame not
// kept). Returns whether it is over.
export function demoFrame(dt, draw = true) {
  demo.update(dt);
  step(dt * demo.pace);
  tickFade(dt);
  weather.update(dt);
  if (draw) render();
  return demo.done;
}
