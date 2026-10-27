// Visuals and cameras: the riders' models posed each frame, and each player's camera following.

import { tourBoat, rowingBoat, swimmer } from '../scenery.js';
import { helicopter, heliShadow } from '../heli.js';
import { fallPose } from '../tumble.js';
import { lookAround } from '../tiles.js';
import { INSIDE } from '../city.js';
import { clearLine } from '../collide.js';
import { WATER } from '../relief.js';
import { HILLS, lookFrom, heightAt } from '../terrain.js';
import { drawView } from '../pretty.js';
import { sfx } from '../sound.js';
import {
  MAX_SPEED, BOAT_SPEED, HELI_SPEED, SPIN_TIME, REAR_TIME, STUMBLE_TIME, PAN, clamp, approach, wrapAngle, tmp,
} from './base.js';
import { game } from './settings.js';
import { renderer, scene, sun, particles, weather, headlamps, cams, menuCam, camYaw, menuLook } from './scene.js';
import { roaming, aerial, quest, world } from './worlds.js';
import { humans } from './racers.js';
import { lightInside } from './indoors.js';
import { paintballOn, cabOf, RAIL_FALL } from './physics.js';
import { loud } from './pickups.js';
import { riding, seated } from './transit.js';

export function updateVisuals(r, dt, t) {
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
  // in the water the rider is in a boat of the Bootjes van Gent instead, at its wheel (in Venice a gondola)
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

export function updateObstacles(dt) {
  for (const ob of world.obstacles) {
    ob.tick?.(dt);
    if (!ob.wobble) continue;
    ob.wobble = Math.max(0, ob.wobble - dt);
    ob.group.rotation.x = Math.sin(ob.wobble * 40) * 0.12 * ob.wobble;
  }
}

export function updateCameras(dt, t, order) {
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

export function render() {
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
    const room = aerial() ? null : INSIDE.at(from.x, from.z), outside = room && lightInside(room); // (null, not false: false?.() throws)
    drawView(renderer, scene, cam, vw, vh, vw === w && vh === h, !!room, sun);
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
