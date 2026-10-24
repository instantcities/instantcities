// A cyclist who rides into the tram rails and comes off (the tour's, see core/js/tour.js fall()): the
// front wheel drops into the groove and stops dead, the bike goes over on its side and slides, the
// rider is thrown forward onto the cobbles and lies there seeing stars. Built on the riders' cyclist
// (js/riders.js), which faces +Z and stands on y = 0.
import { createCyclist } from './riders.js';

const SPEED = 5; // m/s, riding along before it happens
const ease = k => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));

export function createTumble() {
  const model = createCyclist({ name: '', silk: 0xd84315, cap: 0x37474f, labelLayer: 31 }, 3);
  model.label.visible = false;
  const { root, spin, stars } = model, body = spin.children[0];
  // the rider sits on the saddle in a group of its own (riders.js: at y 1.0, a little back)
  const rider = body.children.find(o => o.isGroup && o.position.y === 1 && o.position.z === -0.2);
  const side = Math.random() < 0.5 ? 1 : -1;

  // fallen: seconds since the wheel went into the rail, or below 0 while still riding
  function pose(dt, fallen, time) {
    if (fallen < 0) {
      spin.rotation.set(0, 0, 0);
      spin.position.set(0, 0, 0);
      stars.visible = false;
      model.animate(dt, SPEED, 0, time);
      return;
    }
    const over = ease(fallen / 0.55), slide = 1 - (1 - Math.min(1, fallen / 0.8)) ** 2, jolt = Math.sin(Math.min(1, fallen / 0.3) * Math.PI);
    // stopped dead, the back wheel kicking up, then over on its side and a little slide forward
    body.rotation.set(jolt * 0.35, 0, 0);
    spin.rotation.set(0, 0, side * 1.42 * over);
    spin.position.set(0, 0, 1.4 * slide);
    // the rider flung on over the handlebar, face down
    if (rider) {
      rider.position.set(0, 1.0 - 0.25 * over, -0.2 + 1.1 * over);
      rider.rotation.set(1.1 * over, 0, 0);
    }
    stars.visible = fallen > 0.9;
    if (stars.visible) stars.rotation.y = time * 7;
  }

  return { root, pose, speed: SPEED };
}
