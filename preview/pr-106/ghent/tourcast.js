// The two who come along on the tour and go to their places themselves (ghent/tour.js flyer and
// runner, core/js/tour.js says where they are): the Belfort's gilded dragon, which flies along with
// the camera from the Korenmarkt on and lands on top of the spire as it comes round it, and Jacob van
// Artevelde, alive, who runs with it down the Kammerstraat onto the
// Vrijdagmarkt, climbs his pedestal there, points out over the square and turns to bronze. Until then
// the ones standing there are kept out of sight (core/js/tour.js STANDING).
import * as THREE from 'three';
import { dragon } from './facades.js';
import { STATUE, FRONT } from './tourcast-config.js';

const smooth = k => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
const wrap = r => Math.atan2(Math.sin(r), Math.cos(r));

// The dragon flying: the same model as on the spire, without its rod, beating its wings, bobbing with
// each beat, its nose up a little. It swoops in from high on the right, down in front of the camera, to
// fly along with it, half its size and low in the picture, and grows
// to its own as it flies off to its place and lands. It breathes short bursts of fire while
// flying along, stopping before it settles on the spire. pose(dt, f, cam, home, rest): f from
// tour.flyer(), cam the camera, home its place (THREE.Vector3), rest the way it sits there (its
// rotation.y), which it turns to as it comes in to land.
const AHEAD = 14, LOW = 4.6, SMALL = 0.5; // metres in front of the camera and below its middle, and how big, flying along
const FROM = [16, 9, 6]; // where it comes flying in from: metres to the right of the camera, above it and in front of it
// A short jet from the open mouth, built once as a single instanced mesh. Amber
// flames stay bright without adding shadow lights or allocating particles each frame.
function dragonFire() {
  const count = 36, jet = new THREE.Group();
  jet.name = 'dragon-fire';
  jet.position.set(1.98, 2.62, 0); // the mouth, in the dragon model's frame; forward is +x
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72,
    depthWrite: false, toneMapped: false });
  const flames = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 7, 5), mat, count);
  flames.frustumCulled = false; // their matrices move along the jet
  flames.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  jet.add(flames);
  const p = new THREE.Object3D(), color = new THREE.Color();
  const yellow = new THREE.Color(0xffc83d), orange = new THREE.Color(0xff6204), red = new THREE.Color(0xff3301);
  function update(time, flying) {
    const phase = time % 6;
    const burst = smooth((phase - 0.5) / 0.25) * (1 - smooth((phase - 2) / 0.4));
    jet.visible = flying && burst > 0;
    if (!jet.visible) return;
    mat.opacity = 0.72 * burst;
    for (let i = 0; i < count; i++) {
      const u = ((i / count + time * 0.85) % 1), swirl = i * 2.4 + time * 8;
      const spread = u * 0.65, radius = (0.12 + u * 0.6) * Math.pow(1 - u, 0.7);
      p.position.set(u * 8 * burst, Math.sin(swirl) * spread + u * u * 0.8, Math.cos(swirl * 1.3) * spread);
      p.scale.set(radius * 2.8, radius, radius);
      p.updateMatrix();
      flames.setMatrixAt(i, p.matrix);
      color.copy(u < 0.4 ? yellow : orange).lerp(u < 0.4 ? orange : red, u < 0.4 ? u / 0.4 : (u - 0.4) / 0.6);
      flames.setColorAt(i, color);
    }
    flames.instanceMatrix.needsUpdate = true;
    flames.instanceColor.needsUpdate = true;
  }
  jet.visible = false;
  return { root: jet, update };
}

export function flyingDragon() {
  const d = dragon([0, 0, 0]);
  d.rotation.set(0, 0, 0);
  d.userData.rod.visible = false;
  const fire = dragonFire();
  d.add(fire.root);
  const wings = d.userData.wings, model = new THREE.Group();
  // green while it flies, turning to its gold once it has settled on the spire
  const skin = d.userData.body.children[0].material, gold = { color: skin.color.clone(), emissive: skin.emissive.clone(), metalness: skin.metalness, roughness: skin.roughness };
  const green = { color: new THREE.Color(0x3f9a3a), emissive: new THREE.Color(0x0b2a08), metalness: 0.15, roughness: 0.55 };
  let gilt = -1;
  const gild = k => {
    if (k === gilt) return;
    gilt = k;
    skin.color.copy(green.color).lerp(gold.color, k);
    skin.emissive.copy(green.emissive).lerp(gold.emissive, k);
    skin.metalness = green.metalness + (gold.metalness - green.metalness) * k;
    skin.roughness = green.roughness + (gold.roughness - green.roughness) * k;
  };
  model.add(d);
  const right = new THREE.Vector3(), up = new THREE.Vector3(), back = new THREE.Vector3(), at = new THREE.Vector3();
  let beat = 0, t = 0, fireTime = 0;
  function pose(dt, f, cam, home, rest) {
    t += dt;
    gild(smooth(f.settle));
    const breathing = f.in > 0.85 && f.k < 0.65;
    fireTime = breathing ? fireTime + dt : 0;
    fire.update(fireTime, breathing);
    const settle = smooth((f.k - 0.7) / 0.3); // coming in to land: wings slowing, turning to how it sits
    const flap = 1 - smooth((f.k - 0.85) / 0.15);
    beat += dt * Math.PI * 2 * (1.6 + 0.8 * settle * flap);
    const down = 0.5 + 0.5 * Math.sin(beat);
    for (const w of wings) w.rotation.x = w.userData.side * (0.38 + flap * (1 - down) * 0.95);
    d.position.y = flap * Math.sin(beat + 0.6) * 0.18; // (its place, where the one on the spire stands)
    d.rotation.z = flap * (0.12 + 0.05 * Math.sin(beat)); // (x is its way forward: nose up)
    // along with the camera: ahead of it and low in the picture, weaving a little from side to side
    // (having come in from the top right: swooping down in a curve, and turning to fly the camera's way)
    cam.matrixWorld.extractBasis(right, up, back);
    const e = smooth(f.in), sweep = Math.sin(e * Math.PI) * 3; // (bowing out towards the camera's way on its way in)
    const side = FROM[0] + (Math.sin(t * 0.5) * 1.4 - FROM[0]) * e, rise = FROM[1] + (-LOW + Math.sin(t * 0.8) * 0.4 - FROM[1]) * smooth(Math.min(1, f.in * 1.4));
    at.copy(cam.position).addScaledVector(back, -(FROM[2] + (AHEAD - FROM[2]) * e + sweep)).addScaledVector(right, side).addScaledVector(up, rise);
    const fwd = Math.atan2(-back.x, -back.z), across = Math.atan2(-right.x - back.x * 0.6, -right.z - back.z * 0.6); // the camera's way, and flying in: across and on
    const head = across + wrap(fwd - across) * smooth((f.in - 0.4) / 0.6), to = Math.atan2(home.x - at.x, home.z - at.z);
    // and from there off to its place
    model.position.copy(at).lerp(home, f.k);
    model.scale.setScalar(SMALL + (1 - SMALL) * smooth(f.k));
    const yaw = head + wrap(to - head) * smooth(f.k / 0.3);
    model.rotation.y = rest + wrap(yaw - Math.PI / 2 - rest) * (1 - settle);
  }
  return { root: model, pose };
}

// The dragon the player rides on the tour flown yourself (core/js/dragonfly.js): the one off the
// spire, golden, its body's middle at its root so it flies through the hoops with its body. Its
// wings beat faster climbing and spread out gliding down; it noses up and down and leans into the
// turns. pose(dt, f): f { x, y, z, yaw, vy, speed, bank }.
export function riddenDragon() {
  const d = dragon([0, 0, 0]);
  d.rotation.set(0, 0, 0);
  d.position.set(0, -2.3, 0); // (its body's axis at the root)
  d.userData.rod.visible = false;
  const wings = d.userData.wings, model = new THREE.Group();
  model.add(d);
  let beat = 0;
  function pose(dt, f) {
    const climb = Math.max(-1, Math.min(1, f.vy / 20)), glide = smooth(-climb * 1.5);
    beat += dt * Math.PI * 2 * (1.5 + Math.max(0, climb) * 1.6 + Math.min(1, Math.abs(f.speed) / 40) * 0.5) * (1 - glide * 0.8);
    const down = 0.5 + 0.5 * Math.sin(beat);
    for (const w of wings) w.rotation.x = w.userData.side * (0.2 + (1 - glide) * (1 - down) * 1.0 + glide * 0.15);
    d.position.y = -2.3 + (1 - glide) * Math.sin(beat + 0.6) * 0.18;
    model.position.set(f.x, f.y, f.z);
    const pitch = Math.atan2(f.vy, Math.max(8, Math.abs(f.speed))) * 0.8; // nose up climbing (x is its way forward)
    model.rotation.set(f.bank * 1.6, f.yaw - Math.PI / 2, pitch, 'YXZ');
  }
  return { root: model, pose };
}

// Artevelde's statue on the Vrijdagmarkt (monuments.js): where it stands and which way it faces
const S = 2.68; // the statue's figure is this much bigger than him

// Up the pedestal (monuments.js artevelde: two steps to 1 m, the shaft to 7 m, its cornice standing
// out to 2.45 m from the middle at 7 to 7.6 m, and the plinth on it to 8.4 m), in the statue's own
// frame (z out of its front, y up): [seconds, x, y, z, which way he faces (0: out of the front), how]
const CLIMB = [
  [0, 0, 0, FRONT, Math.PI, 'hop'],
  [0.2, 0, 0.5, 3.5, Math.PI, 'hop'],
  [0.42, 0, 1.0, 2.75, Math.PI, 'hop'],
  [0.6, 0, 1.0, 2.5, Math.PI, 'climb'],
  [2.05, 0, 6.6, 2.6, Math.PI, 'climb'],
  [2.35, 0, 7.6, 2.4, Math.PI, 'clamber'],
  [2.6, 0, 7.6, 1.8, Math.PI, 'clamber'],
  [2.85, 0, 8.4, 0.6, Math.PI, 'clamber'],
  [3.0, 0, 8.4, 0, Math.PI, 'stand'],
  [3.4, 0, 8.4, 0, 0, 'stand'],
  [3.8, 0, 8.4, 0, 0, 'point'],
];
const POINT = 0.3; // seconds he takes to raise his arm, up there
const GROW = [3.95, 4.6]; // then he grows to the statue's size and turns to bronze


// Jacob van Artevelde alive, about 2 m tall: a crimson tunic to the knees and belted, with a purse
// and a dagger, dark hose and boots, a green cloak, a fur collar and the round hat with its brim of
// the statue. pose(dt, r, ground): r from tour.runner(), ground(x, z) the street's height.
export function livingArtevelde() {
  const bronze = new THREE.Color(0x55664f), mats = [];
  const mat = (c, rough = 0.8) => {
    const m = new THREE.MeshStandardMaterial({ color: c, roughness: rough, flatShading: true });
    m.userData.from = new THREE.Color(c);
    mats.push(m);
    return m;
  };
  const tunic = mat(0x8a1f2c), cloakM = mat(0x2f5238), hose = mat(0x3b2c22), boots = mat(0x2a1c13, 0.6), skin = mat(0xe2b896, 0.7);
  const hatM = mat(0x1d1b1a), fur = mat(0x8a6a48, 1), gold = mat(0xd9a93a, 0.4), leather = mat(0x5e3d22), hair = mat(0x4a3020, 0.95), dark = mat(0x16120f, 0.4);
  const add = (parent, geo, m, x = 0, y = 0, z = 0) => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    parent.add(o);
    return o;
  };
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body);
  const legs = [-1, 1].map(s => {
    const hip = new THREE.Group();
    hip.position.set(s * 0.11, 0.95, 0);
    body.add(hip);
    add(hip, new THREE.CylinderGeometry(0.075, 0.062, 0.85, 8), hose, 0, -0.43, 0);
    add(hip, new THREE.CylinderGeometry(0.08, 0.075, 0.3, 8), boots, 0, -0.75, 0);
    add(hip, new THREE.BoxGeometry(0.13, 0.11, 0.28), boots, 0, -0.9, 0.05);
    return hip;
  });
  add(body, new THREE.CylinderGeometry(0.2, 0.33, 0.56, 12), tunic, 0, 0.8, 0); // the skirt of the tunic
  add(body, new THREE.CylinderGeometry(0.24, 0.2, 0.5, 12), tunic, 0, 1.3, 0).scale.z = 0.8;
  add(body, new THREE.TorusGeometry(0.205, 0.035, 6, 16).rotateX(Math.PI / 2), leather, 0, 1.07, 0).scale.z = 0.85; // the belt
  add(body, new THREE.BoxGeometry(0.09, 0.07, 0.03), gold, 0, 1.07, 0.18); // its buckle
  add(body, new THREE.BoxGeometry(0.12, 0.15, 0.06), leather, 0.17, 0.95, 0.13); // the purse
  add(body, new THREE.BoxGeometry(0.035, 0.34, 0.025), dark, -0.21, 0.9, 0.1).rotation.z = 0.12; // the dagger
  add(body, new THREE.BoxGeometry(0.56, 0.12, 0.28), tunic, 0, 1.51, 0); // the shoulders
  add(body, new THREE.TorusGeometry(0.19, 0.065, 8, 16).rotateX(Math.PI / 2), fur, 0, 1.56, -0.01).scale.z = 0.85; // the fur collar
  add(body, new THREE.CylinderGeometry(0.065, 0.075, 0.12, 8), skin, 0, 1.63, 0);
  add(body, new THREE.SphereGeometry(0.13, 14, 10), skin, 0, 1.77, 0.01).scale.set(0.92, 1.08, 1);
  add(body, new THREE.SphereGeometry(0.135, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, 0, 1.78, -0.02);
  add(body, new THREE.BoxGeometry(0.04, 0.06, 0.05), skin, 0, 1.76, 0.135); // the nose
  for (const s of [-1, 1]) add(body, new THREE.SphereGeometry(0.014, 6, 5), dark, s * 0.045, 1.79, 0.12);
  add(body, new THREE.CylinderGeometry(0.155, 0.145, 0.13, 14), hatM, 0, 1.89, 0); // the hat
  add(body, new THREE.CylinderGeometry(0.07, 0.155, 0.11, 14), hatM, 0, 2.0, -0.02);
  add(body, new THREE.TorusGeometry(0.165, 0.024, 6, 18).rotateX(Math.PI / 2), hatM, 0, 1.84, 0); // its brim
  const cloak = new THREE.Group(); // hanging from the shoulders, out behind him as he runs
  cloak.position.set(0, 1.52, -0.17);
  body.add(cloak);
  add(cloak, new THREE.BoxGeometry(0.54, 1.25, 0.04), cloakM, 0, -0.62, 0);
  const arms = [-1, 1].map(s => { // the right one first (he faces +z: his right is -x)
    const shoulder = new THREE.Group();
    shoulder.position.set(s * 0.3, 1.5, 0);
    body.add(shoulder);
    add(shoulder, new THREE.CylinderGeometry(0.07, 0.062, 0.58, 8), tunic, 0, -0.29, 0);
    add(shoulder, new THREE.SphereGeometry(0.065, 8, 6), skin, 0, -0.62, 0);
    return shoulder;
  });
  const [right, left] = arms;

  let stride = 0, last = null, speed = 0, yaw = null, grown = -1;
  const limbs = (rx, lx, rArm, lArm, cloakX, lean) => {
    legs[0].rotation.set(rx, 0, 0);
    legs[1].rotation.set(lx, 0, 0);
    right.rotation.set(...rArm);
    left.rotation.set(...lArm);
    cloak.rotation.x = cloakX;
    body.rotation.x = lean;
  };
  // his colours, k of the way to bronze
  const tint = k => {
    if (k === grown) return;
    grown = k;
    for (const m of mats) {
      m.color.copy(m.userData.from).lerp(bronze, k);
      m.metalness = 0.45 * k;
      m.roughness = 0.8 - 0.3 * k;
    }
  };

  function pose(dt, r, ground) {
    if (r.climb < 0) {
      // on the way: running, or waiting for the camera and waving to it
      const moved = last && dt > 0 ? Math.hypot(r.x - last.x, r.z - last.z) : 0;
      last = { x: r.x, z: r.z };
      speed += ((dt > 0 ? Math.min(moved / dt, 40) : 0) - speed) * (1 - Math.exp(-dt * 6));
      yaw = yaw == null ? r.yaw : yaw + wrap(r.yaw - yaw) * (1 - Math.exp(-dt * 8));
      root.position.set(r.x, ground(r.x, r.z), r.z);
      root.rotation.y = yaw;
      root.scale.setScalar(1);
      tint(0);
      const run = smooth(speed / 3);
      stride += Math.min(moved * 2.3, dt * Math.PI * 2 * 3.4); // (his legs going no faster than they can)
      const sw = Math.sin(stride), wave = Math.sin(performance.now() / 120);
      limbs(-sw * 0.9 * run, sw * 0.9 * run,
        run > 0.5 ? [sw * 0.8, 0, -0.1] : [-2.8, 0, -0.25 + wave * 0.35], // the right waving to the camera, waiting
        [-sw * 0.8 * run, 0, 0.1], 0.25 + run * 0.9, run * 0.22);
      root.position.y += Math.abs(Math.cos(stride)) * 0.08 * run;
      return;
    }
    // up the pedestal, in the statue's frame
    const t = r.climb;
    let i = 0;
    while (i < CLIMB.length - 2 && CLIMB[i + 1][0] <= t) i++;
    const a = CLIMB[i], b = CLIMB[i + 1], k = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
    const lx = a[1] + (b[1] - a[1]) * k, ly = a[2] + (b[2] - a[2]) * k, lz = a[3] + (b[3] - a[3]) * k;
    const c = Math.cos(STATUE.turn), s = Math.sin(STATUE.turn);
    root.position.set(STATUE.x + lx * c + lz * s, ground(STATUE.x, STATUE.z) + ly, STATUE.z - lx * s + lz * c);
    root.rotation.y = STATUE.turn + a[4] + wrap(b[4] - a[4]) * smooth(k);
    const how = t >= CLIMB.at(-1)[0] ? 'point' : a[5];
    // hand over hand: one arm reaching up while the other pulls down, the legs pushing in turn
    const reach = Math.sin(t * 11), sway = Math.cos(t * 11);
    if (how === 'hop') limbs(-0.9, -0.3, [-1.3 - reach * 0.6, 0, -0.3], [-1.3 + reach * 0.6, 0, 0.3], 0.4, 0.15);
    else if (how === 'climb') limbs(-0.7 - reach * 0.6, -0.7 + reach * 0.6, [-2.5 - reach * 0.6, 0, -0.2 - sway * 0.2], [-2.5 + reach * 0.6, 0, 0.2 - sway * 0.2], 0.1, -0.05);
    else if (how === 'clamber') limbs(-1.3 - reach * 0.4, -0.4 + reach * 0.4, [-1.9 - reach * 0.5, 0, -0.25], [-1.6 + reach * 0.5, 0, 0.25], 0.2, 0.3);
    else if (how === 'stand') limbs(0, 0, [0, 0, -0.08], [0, 0, 0.08], 0.05, 0);
    else { // pointing out over the square, as the statue does
      const up = smooth((t - CLIMB.at(-1)[0]) / POINT);
      limbs(0, 0, [-2.0 * up, 0, -0.08 - 0.27 * up], [-0.25 * up, 0, 0.08 + 0.17 * up], 0.05, 0);
    }
    // and then grows to the statue's size and turns to bronze
    const g = smooth((t - GROW[0]) / (GROW[1] - GROW[0]));
    root.scale.setScalar(1 + (S - 1) * g);
    tint(g);
    last = null;
    speed = 0;
  }
  return { root, pose };
}
