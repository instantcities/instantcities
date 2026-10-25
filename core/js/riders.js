import * as THREE from 'three';
import { labelSprite, dizzyStars, cop, paintGun } from './horse.js';

// The other ways to get about: on foot, or on a bike. Each character of the stable keeps its name
// and colours (shirt in its silk, cap in its cap colour). The models work like the animals in
// horse.js: they face +Z, stand on y = 0 and offer the same root, spin, stars, label, animate.

const SKINS = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac, 0xe0ac69, 0xf1c27d, 0xc68642];
const mat = (color, roughness = 0.7, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

function part(geo, material, parent, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// A limb that swings from a pivot at (x, y, z), hanging down `len`.
function limb(parent, x, y, z, w, len, material) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);
  parent.add(pivot);
  part(new THREE.BoxGeometry(w, len, w * 1.1).translate(0, -len / 2, 0), material, pivot);
  return pivot;
}

// Head with a cap, its peak forward. A cop's peak is darker, with a badge above it and a moustache below.
function head(parent, y, z, c) {
  part(new THREE.SphereGeometry(0.17, 12, 10), c.skin, parent, 0, y, z);
  part(new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), c.cap, parent, 0, y + 0.03, z);
  part(new THREE.BoxGeometry(0.24, 0.03, 0.14), c.peak ?? c.cap, parent, 0, y + 0.05, z + 0.17);
  if (!c.badge) return;
  part(new THREE.SphereGeometry(0.035, 8, 6), c.badge, parent, 0, y + 0.13, z + 0.15);
  part(new THREE.BoxGeometry(0.15, 0.035, 0.05), c.tache, parent, 0, y - 0.06, z + 0.16);
}

function shell(def, i, labelY) {
  const root = new THREE.Group(), spin = new THREE.Group(), body = new THREE.Group();
  root.add(spin);
  spin.add(body);
  const stars = dizzyStars(root, labelY - 0.6);
  const label = labelSprite();
  label.userData.setText(def.name, def.silk);
  label.position.set(0, labelY, 0);
  label.layers.set(def.labelLayer);
  root.add(label);
  const colors = { shirt: mat(def.silk, 0.6), cap: mat(def.cap, 0.4), skin: mat(SKINS[i % SKINS.length], 0.8), pants: mat(def.cop ? 0x16243d : 0x2c3e66, 0.8), shoe: mat(0x1d1a17, 0.6) };
  if (def.cop) Object.assign(colors, cop());
  return { root, spin, body, stars, label, colors };
}

// Someone running: arms and legs swing, a little bounce in each stride.
export function createWalker(def, i) {
  const { root, spin, body, stars, label, colors: c } = shell(def, i, 2.45);
  const HIP = 0.95;
  const legs = [-0.12, 0.12].map(x => {
    const hip = limb(body, x, HIP, 0, 0.15, 0.5, c.pants);
    const knee = limb(hip, 0, -0.5, 0, 0.14, 0.45, c.pants);
    part(new THREE.BoxGeometry(0.16, 0.1, 0.28), c.shoe, knee, 0, -0.47, 0.06);
    return { hip, knee };
  });
  const torso = new THREE.Group();
  torso.position.y = HIP;
  body.add(torso);
  part(new THREE.BoxGeometry(0.44, 0.62, 0.26), c.shirt, torso, 0, 0.33, 0);
  head(torso, 0.82, 0.02, c);
  const arms = [-0.29, 0.29].map(x => {
    const arm = limb(torso, x, 0.6, 0, 0.11, 0.56, c.shirt);
    part(new THREE.SphereGeometry(0.065, 8, 6), c.skin, arm, 0, -0.58, 0);
    return arm;
  });
  const gun = paintGun(); // car+paintball mode: in the right hand, barrel along the arm (so it points ahead when the arm is raised)
  arms[1].add(gun);

  let phase = Math.random() * Math.PI * 2;
  function animate(dt, speed, steer, time, pose = {}) {
    const sp = Math.abs(speed), k = Math.min(1, sp / 8), air = pose.air || 0;
    const rearK = pose.rear ? Math.sin(pose.rear * Math.PI) : 0;
    const stumbleK = pose.stumble ? Math.sin(pose.stumble * Math.PI) : 0;
    phase += dt * (speed * 0.9 + Math.sign(speed) * (sp > 0.3 ? 2 : 0)) * (1 - air * 0.9);
    legs.forEach((L, s) => {
      const a = phase + s * Math.PI;
      let hip = Math.sin(a) * 0.9 * k, knee = Math.max(0, -Math.cos(a)) * 1.3 * k;
      // legs tucked up in a jump
      hip += (1.0 - hip) * air * (s ? 0.6 : 1);
      knee += (1.6 - knee) * air;
      L.hip.rotation.x = -hip;
      L.knee.rotation.x = knee;
    });
    arms.forEach((arm, s) => {
      arm.rotation.x = Math.sin(phase + s * Math.PI) * 0.9 * k - air * 0.6 - rearK * 2.6;
      arm.rotation.z = (s ? -1 : 1) * (0.08 + rearK * 0.5);
    });
    gun.visible = !!pose.gun;
    if (pose.gun) { arms[1].rotation.x = -1.45; arms[1].rotation.z = -0.05; arms[0].rotation.x = -1.35; arms[0].rotation.z = -0.35; } // aiming ahead, the other hand on the barrel
    const bob = Math.abs(Math.sin(phase)) * 0.09 * k * (1 - air);
    body.position.y = bob;
    torso.rotation.x = 0.12 * k + stumbleK * 0.6 - rearK * 0.35;
    body.rotation.z = -steer * 0.1 * k;
    // sat on the ground to wait (for the tram), legs out in front, hands on the ground behind
    const sit = pose.sit || 0, e = sit * sit * (3 - 2 * sit);
    if (e > 0) {
      for (const L of legs) {
        L.hip.rotation.x += (-1.45 - L.hip.rotation.x) * e;
        L.knee.rotation.x += (0.15 - L.knee.rotation.x) * e;
      }
      arms.forEach((arm, s) => {
        arm.rotation.x += (0.5 - arm.rotation.x) * e;
        arm.rotation.z += ((s ? -1 : 1) * 0.25 - arm.rotation.z) * e;
      });
      body.position.y += (0.12 - HIP - body.position.y) * e;
      torso.rotation.x += (-0.15 - torso.rotation.x) * e;
    }
    if (stars.visible) stars.rotation.y = time * 7;
  }

  return {
    root, spin, stars, label, animate, species: 'foot',
    setName: (name, color = def.silk) => label.userData.setText(name, color),
    get phase() { return phase; },
  };
}

// Someone on a bike: the wheels turn, the legs pedal, the bike leans into the corners.
export function createCyclist(def, i) {
  const { root, spin, body, stars, label, colors: c } = shell(def, i, 2.6);
  const frame = mat(def.silk, 0.35, { metalness: 0.3 }), tyre = mat(0x1d1a17, 0.9), steel = mat(0x9ea3a8, 0.3, { metalness: 0.7 });
  const R = 0.36;
  const wheels = [0.58, -0.58].map(z => {
    const w = new THREE.Group();
    w.position.set(0, R, z);
    body.add(w);
    part(new THREE.TorusGeometry(R, 0.05, 6, 20).rotateY(Math.PI / 2), tyre, w);
    for (let k = 0; k < 3; k++) part(new THREE.BoxGeometry(0.02, R * 1.9, 0.02), steel, w).rotation.x = (k * Math.PI) / 3;
    return w;
  });
  part(new THREE.BoxGeometry(0.06, 0.06, 1.0), frame, body, 0, 0.66, 0);
  part(new THREE.BoxGeometry(0.06, 0.6, 0.06), frame, body, 0, 0.64, -0.14).rotation.x = -0.25;
  part(new THREE.BoxGeometry(0.06, 0.55, 0.06), frame, body, 0, 0.78, 0.5).rotation.x = 0.3;
  part(new THREE.BoxGeometry(0.6, 0.05, 0.05), steel, body, 0, 1.06, 0.44); // handlebar
  part(new THREE.BoxGeometry(0.2, 0.07, 0.3), c.shoe, body, 0, 0.98, -0.22); // saddle
  // the rider, leaning forward over the handlebar
  const rider = new THREE.Group();
  rider.position.set(0, 1.0, -0.2);
  body.add(rider);
  const torso = part(new THREE.BoxGeometry(0.42, 0.6, 0.26), c.shirt, rider, 0, 0.32, 0.12);
  torso.rotation.x = 0.45;
  head(rider, 0.78, 0.4, c);
  for (const x of [-0.21, 0.21]) part(new THREE.BoxGeometry(0.1, 0.1, 0.52), c.shirt, rider, x, 0.36, 0.42).rotation.x = 0.6;
  const gun = paintGun(true); // car+paintball mode: in the right hand, along the handlebar and ahead
  gun.position.set(0.2, 0.2, 0.62);
  rider.add(gun);
  const crank = new THREE.Group();
  crank.position.set(0, 0.42, 0.02);
  body.add(crank);
  const legs = [-0.13, 0.13].map(x => {
    const hip = limb(rider, x, 0, 0.02, 0.14, 0.46, c.pants);
    const knee = limb(hip, 0, -0.46, 0, 0.13, 0.44, c.pants);
    part(new THREE.BoxGeometry(0.15, 0.09, 0.26), c.shoe, knee, 0, -0.45, 0.06);
    return { hip, knee };
  });

  let phase = Math.random() * Math.PI * 2, roll = 0;
  const sitAt = new THREE.Vector3(0.75, 0.12, 0.1);
  function animate(dt, speed, steer, time, pose = {}) {
    const sp = Math.abs(speed), air = pose.air || 0;
    const rearK = pose.rear ? Math.sin(pose.rear * Math.PI) : 0;
    const stumbleK = pose.stumble ? Math.sin(pose.stumble * Math.PI) : 0;
    roll += (speed / R) * dt * 0.8;
    for (const w of wheels) w.rotation.x = roll;
    // pedalling: slower than the wheels, and not at all when freewheeling in the air
    phase += dt * speed * 0.55 * (1 - air);
    crank.rotation.x = phase;
    legs.forEach((L, s) => {
      const a = phase + s * Math.PI;
      L.hip.rotation.x = -0.9 + Math.sin(a) * 0.45;
      L.knee.rotation.x = 1.3 + Math.cos(a) * 0.45;
    });
    const k = Math.min(1, sp / 10);
    body.rotation.z = -steer * 0.28 * k;
    // a wheelie when it rears up, nose down in a stumble, front up a little in a jump
    body.rotation.x = -rearK * 0.5 + stumbleK * 0.25 - air * 0.15;
    body.position.z = rearK * 0.2;
    rider.position.set(0, 1.0 + Math.abs(Math.sin(phase)) * 0.03, -0.2);
    rider.rotation.set(0, 0, 0);
    gun.visible = !!pose.gun;
    // off the bike, sat on the ground beside it to wait (for the tram), legs out in front
    const sit = pose.sit || 0, e = sit * sit * (3 - 2 * sit);
    if (e > 0) {
      for (const L of legs) {
        L.hip.rotation.x += (-1.45 - L.hip.rotation.x) * e;
        L.knee.rotation.x += (0.15 - L.knee.rotation.x) * e;
      }
      rider.position.lerp(sitAt, e);
      rider.rotation.set(-0.35 * e, -0.4 * e, 0);
    }
    if (stars.visible) stars.rotation.y = time * 7;
  }

  return {
    root, spin, stars, label, animate, body, rider, species: 'bike', quiet: true, // no footsteps
    setName: (name, color = def.silk) => label.userData.setText(name, color),
    get phase() { return phase; },
  };
}

// Someone on a Vespa, in an Italian town: the scooter in the character's silk, sat upright with the
// feet on the floorboard behind the leg shield, hands on the handlebar. The small wheels turn, it
// leans into the corners and the engine shakes it a little.
export function createScooterist(def, i) {
  const { root, spin, body, stars, label, colors: c } = shell(def, i, 2.6);
  const paint = mat(def.silk, 0.25, { metalness: 0.2 }), tyre = mat(0x1d1a17, 0.9), chrome = mat(0xd8dde2, 0.2, { metalness: 0.9 });
  const seat = mat(0x2a211c, 0.6), mat_ = mat(0x2b2b2b, 0.9);
  const R = 0.24;
  const wheels = [0.62, -0.52].map(z => {
    const w = new THREE.Group();
    w.position.set(0, R, z);
    body.add(w);
    part(new THREE.TorusGeometry(R - 0.06, 0.07, 8, 20).rotateY(Math.PI / 2), tyre, w);
    part(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 14).rotateZ(Math.PI / 2), chrome, w);
    part(new THREE.BoxGeometry(0.11, 0.2, 0.04), chrome, w); // the hub's nuts, to see it turn
    return w;
  });
  // the step-through frame: floorboard, leg shield, the bulging cowls over the engine at the back
  part(new THREE.BoxGeometry(0.4, 0.07, 0.62), paint, body, 0, 0.3, 0.1);
  for (const x of [-0.08, 0, 0.08]) part(new THREE.BoxGeometry(0.03, 0.02, 0.56), mat_, body, x, 0.345, 0.1);
  const shield = part(new THREE.CylinderGeometry(0.34, 0.3, 0.8, 16, 1, true, -Math.PI * 0.42, Math.PI * 0.84), paint, body, 0, 0.7, 0.32);
  shield.scale.set(0.85, 1, 0.45);
  shield.rotation.x = -0.12;
  shield.material.side = THREE.DoubleSide;
  part(new THREE.SphereGeometry(0.3, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), paint, body, 0, 0.36, 0.62).scale.set(0.6, 0.8, 1.1); // front mudguard
  part(new THREE.BoxGeometry(0.1, 0.55, 0.1), paint, body, 0, 0.88, 0.5).rotation.x = -0.12; // steering column
  part(new THREE.SphereGeometry(0.42, 18, 12), paint, body, 0, 0.56, -0.38).scale.set(0.9, 0.75, 1.15); // the cowls
  part(new THREE.BoxGeometry(0.3, 0.12, 0.66), seat, body, 0, 0.86, -0.28);
  part(new THREE.BoxGeometry(0.34, 0.03, 0.3), chrome, body, 0, 0.82, -0.75); // the rack behind the seat
  part(new THREE.BoxGeometry(0.12, 0.07, 0.05), mat(0xd32f2f, 0.4, { emissive: 0x5a0d0d }), body, 0, 0.62, -0.85); // rear light
  // the handlebar with the round headlight in its middle, mirrors on stalks
  part(new THREE.BoxGeometry(0.66, 0.08, 0.14), paint, body, 0, 1.16, 0.46);
  part(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 16).rotateX(Math.PI / 2), chrome, body, 0, 1.17, 0.54);
  part(new THREE.CircleGeometry(0.07, 16), mat(0xfff6d8, 0.2, { emissive: 0x8a7d55 }), body, 0, 1.17, 0.575);
  for (const s of [-1, 1]) {
    part(new THREE.BoxGeometry(0.02, 0.22, 0.02), chrome, body, s * 0.3, 1.28, 0.44).rotation.z = s * -0.3;
    part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12).rotateX(Math.PI / 2), chrome, body, s * 0.34, 1.4, 0.44);
  }
  // the rider, sat upright
  const rider = new THREE.Group();
  rider.position.set(0, 0.9, -0.25);
  body.add(rider);
  const torso = part(new THREE.BoxGeometry(0.42, 0.6, 0.26), c.shirt, rider, 0, 0.32, 0);
  torso.rotation.x = 0.12;
  head(rider, 0.8, 0.08, c);
  for (const s of [-1, 1]) {
    part(new THREE.BoxGeometry(0.1, 0.1, 0.72), c.shirt, rider, s * 0.25, 0.4, 0.37).rotation.x = 0.46;
    part(new THREE.SphereGeometry(0.065, 8, 6), c.skin, rider, s * 0.3, 0.24, 0.71);
  }
  const gun = paintGun(true); // car+paintball mode: in the right hand, along the handlebar and ahead
  gun.position.set(0.2, 0.3, 0.72);
  rider.add(gun);
  // thighs forward along the seat, shins down to the floorboard
  const legs = [-0.12, 0.12].map(x => {
    const hip = limb(rider, x, 0.02, 0.02, 0.14, 0.46, c.pants);
    const knee = limb(hip, 0, -0.46, 0, 0.13, 0.44, c.pants);
    part(new THREE.BoxGeometry(0.15, 0.09, 0.26), c.shoe, knee, 0, -0.45, 0.06);
    return { hip, knee };
  });

  let roll = 0;
  const sitAt = new THREE.Vector3(0.75, 0.12, 0.1);
  function animate(dt, speed, steer, time, pose = {}) {
    const sp = Math.abs(speed), air = pose.air || 0;
    const rearK = pose.rear ? Math.sin(pose.rear * Math.PI) : 0;
    const stumbleK = pose.stumble ? Math.sin(pose.stumble * Math.PI) : 0;
    roll += (speed / R) * dt * 0.8;
    for (const w of wheels) w.rotation.x = roll;
    for (const L of legs) {
      L.hip.rotation.x = -1.35 + air * 0.25;
      L.knee.rotation.x = 1.25 - air * 0.3;
    }
    const k = Math.min(1, sp / 10);
    body.rotation.z = -steer * 0.3 * k;
    // a wheelie when it rears up, nose down in a stumble, front up a little in a jump
    body.rotation.x = -rearK * 0.45 + stumbleK * 0.25 - air * 0.15;
    body.position.z = rearK * 0.2;
    body.position.y = Math.sin(time * 70) * 0.006 * (1 - air); // the engine running
    rider.position.set(0, 0.9, -0.25);
    rider.rotation.set(0, 0, 0);
    gun.visible = !!pose.gun;
    // off the scooter, sat on the ground beside it to wait (for the tram), legs out in front
    const sit = pose.sit || 0, e = sit * sit * (3 - 2 * sit);
    if (e > 0) {
      for (const L of legs) {
        L.hip.rotation.x += (-1.45 - L.hip.rotation.x) * e;
        L.knee.rotation.x += (0.15 - L.knee.rotation.x) * e;
      }
      rider.position.lerp(sitAt, e);
      rider.rotation.set(-0.35 * e, -0.4 * e, 0);
    }
    if (stars.visible) stars.rotation.y = time * 7;
  }

  return {
    root, spin, stars, label, animate, body, rider, species: 'vespa', quiet: true, // no footsteps
    setName: (name, color = def.silk) => label.userData.setText(name, color),
    get phase() { return roll; },
  };
}
