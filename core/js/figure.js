import * as THREE from 'three';

// One person drawn properly, for the city's well-known characters (city.js CHARACTERS): rounded
// limbs that bend at the knees and elbows, hands and shoes, a face with a nose, ears, eyes and
// brows, hair, a beard, a long coat, and a crumpled plastic bag hanging from each hand. The
// walkers (js/people.js) use shared instanced parts; there is only ever one of these each.
// Facing +z, feet on y = 0, about 1.8 m tall at scale 1.

const std = (color, roughness = 0.85) => new THREE.MeshStandardMaterial({ color, roughness });

// a smooth limb hanging down from its joint at the origin: length L, radius r
const limb = (r, L) => new THREE.CapsuleGeometry(r, Math.max(0.01, L - 2 * r), 6, 14).translate(0, -L / 2, 0);

// a plastic shopping bag hanging from the origin by its handles: a body that is fuller at the
// bottom where the shopping is, creased all over, and two thin handles up to the hand
function bagGeometry(seed) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const body = new THREE.SphereGeometry(0.15, 22, 16), pos = body.attributes.position, v = new THREE.Vector3();
  const dents = Array.from({ length: 9 }, () => [rand() * Math.PI * 2, (rand() - 0.5) * 1.6, 0.03 + rand() * 0.06]);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const h = v.y / 0.15; // -1 at the bottom, 1 at the top
    // fuller and flat at the bottom, gathered in towards the handles at the top, flattened front to back
    const wide = h < 0 ? 1.12 : 1 - h * 0.55;
    v.x *= wide;
    v.z *= wide * 0.62;
    v.y = h < -0.75 ? -0.15 * 0.8 - (h + 0.75) * 0.02 : v.y * 1.25;
    // creases: a few dents pressed in here and there
    const a = Math.atan2(v.z, v.x);
    for (const [da, dh, depth] of dents) {
      const d = Math.hypot(Math.sin((a - da) / 2) * 2.2, (h - dh) * 1.4);
      if (d < 1) { const k = 1 - depth * (1 - d) ** 2 * 3; v.x *= k; v.z *= k; }
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  body.computeVertexNormals();
  body.translate(0, -0.33, 0);
  return body;
}

// hair and beard: every point pushed out a little more or less from the middle, so it is unkempt
function shaggy(geo, amount, seed) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pos = geo.attributes.position, v = new THREE.Vector3(), seen = new Map();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // the points on a seam are one point: they move together, so it stays closed
    const key = v.toArray().map(n => n.toFixed(4)).join();
    if (!seen.has(key)) seen.set(key, 1 + (rand() - 0.3) * amount);
    v.multiplyScalar(seen.get(key));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

// What a character leaves on the pavement, against the wall (+z is away from the street): flattened
// cardboard to sit on, a few boxes, open and shut, piled up, and plastic bags full of things
// beside them. Its own corner of the pavement, about 1.6 by 0.9 m, on y = 0.
export function createStash(bagColors, seed = 1) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pile = new THREE.Group();
  pile.name = 'stash';
  const card = [0xb48a57, 0xa57b4a, 0xc29a68, 0x9c7346].map(c => std(c, 0.95)), tape = std(0xc9b58c, 0.6);
  const add = (geo, m, x, y, z, ry = 0, rx = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = mesh.receiveShadow = true;
    pile.add(mesh);
    return mesh;
  };
  // the flattened boxes, lying a little askew
  add(new THREE.BoxGeometry(1.1, 0.012, 0.7), card[2], -0.15, 0.006, 0.05, 0.08);
  add(new THREE.BoxGeometry(0.8, 0.012, 0.55), card[0], 0.25, 0.016, 0.12, -0.15);
  // a box: w x h x d, taped shut, or open with its flaps out
  const box = (w, h, d, x, y, z, ry, open, m) => {
    const fx = Math.cos(ry), fz = -Math.sin(ry);
    if (open) {
      // no lid: a bottom and four walls, so what is inside shows
      const t = 0.01, wall = (ww, dd, ox, oz) => add(new THREE.BoxGeometry(ww, h, dd), m, x + fx * ox - fz * oz, y + h / 2, z + fz * ox + fx * oz, ry);
      add(new THREE.BoxGeometry(w, t, d), m, x, y + t / 2, z, ry);
      wall(t, d, -w / 2, 0); wall(t, d, w / 2, 0); wall(w, t, 0, -d / 2); wall(w, t, 0, d / 2);
    } else add(new THREE.BoxGeometry(w, h, d), m, x, y + h / 2, z, ry);
    if (!open) return add(new THREE.BoxGeometry(0.06, 0.004, d + 0.004), tape, x, y + h + 0.002, z, ry);
    // the flaps, folded out and drooping on either side
    for (const side of [-1, 1]) {
      add(new THREE.BoxGeometry(w * 0.5, 0.008, d * 0.96), m, x + fx * side * (w * 0.5 + 0.02), y + h - 0.06, z + fz * side * (w * 0.5 + 0.02), ry, 0, side * 1.15);
    }
  };
  box(0.5, 0.36, 0.4, 0.42, 0.02, 0.18, 0.12 + rand() * 0.1, false, card[1]);
  box(0.42, 0.3, 0.34, 0.4, 0.38, 0.2, -0.1 + rand() * 0.2, false, card[3]);
  box(0.46, 0.32, 0.38, -0.25, 0.012, 0.22, -0.25, true, card[0]);
  box(0.34, 0.24, 0.3, 0.86, 0, 0.3, 0.5, false, card[2]);
  // the bags, standing about in front of the boxes and in the open one
  const bags = [[-0.62, 0.0, 0.1], [-0.42, 0.0, -0.14], [0.05, 0.0, -0.12], [0.75, 0.0, -0.1], [-0.25, 0.2, 0.22]];
  bags.forEach(([x, y, z], k) => {
    const g = new THREE.Group();
    const plastic = new THREE.MeshStandardMaterial({ color: bagColors[k % bagColors.length], roughness: 0.35 });
    const body = new THREE.Mesh(bagGeometry(seed * 13 + k * 7), plastic);
    body.castShadow = true;
    g.add(body);
    // full, so squat and round, the handles tied in a knot on top
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), plastic);
    knot.position.y = -0.14;
    knot.scale.set(1.3, 0.8, 1);
    g.add(knot);
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.05, 4, 6), plastic);
      ear.position.set(side * 0.03, -0.11, 0);
      ear.rotation.z = -side * 0.9;
      g.add(ear);
    }
    // standing on its bottom: lift it so it rests on y
    const k2 = 0.85 + (k % 3) * 0.12;
    g.position.set(x, y + 0.45 * 0.8 * k2, z);
    g.scale.set(1.3 * k2, 0.8 * k2, 1.3 * k2);
    g.rotation.set((rand() - 0.5) * 0.25, rand() * Math.PI * 2, (rand() - 0.5) * 0.25);
    pile.add(g);
  });
  return pile;
}

export function createFigure(who) {
  const c = who.colors;
  const coat = std(c.shirt, 0.95), trousers = std(c.pants, 0.9), skin = std(c.skin, 0.7);
  const hair = std(c.hair, 1), beard = std(who.beard ?? c.hair, 1), shoe = std(0x2a2420, 0.6), dark = std(0x16120f, 0.3);
  const root = new THREE.Group();
  const add = (parent, geo, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const joint = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

  // the hips, 0.95 up: everything above hangs from here and bobs with each step
  const hips = joint(root, 0, 0.95, 0);
  const legs = [-1, 1].map(side => {
    const hip = joint(hips, side * 0.1, 0, 0);
    add(hip, limb(0.078, 0.46), trousers);
    const knee = joint(hip, 0, -0.44, 0);
    add(knee, limb(0.064, 0.46), trousers);
    const ankle = joint(knee, 0, -0.44, 0);
    add(ankle, new THREE.CapsuleGeometry(0.052, 0.17, 4, 10).rotateX(Math.PI / 2), shoe, 0, -0.035, 0.05, 1.05, 0.8, 1);
    return { hip, knee, ankle };
  });

  // the body, leaning a little forward the way an old man walks: a long coat, round at the
  // shoulders, open at the hem
  const torso = joint(hips, 0, 0, 0);
  torso.rotation.x = 0.1;
  const profile = [[0.0, -0.36], [0.235, -0.36], [0.225, -0.15], [0.205, 0.05], [0.215, 0.25], [0.225, 0.4], [0.2, 0.5], [0.13, 0.555], [0.065, 0.575], [0.0, 0.58]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  add(torso, new THREE.LatheGeometry(profile, 24), coat, 0, 0, 0, 1, 1, 0.66);
  // collar, turned up round the neck
  add(torso, new THREE.TorusGeometry(0.075, 0.03, 8, 18).rotateX(Math.PI / 2), coat, 0, 0.56, -0.005, 1.1, 1, 1);
  // buttons down the front
  for (let k = 0; k < 4; k++) add(torso, new THREE.SphereGeometry(0.012, 8, 6), dark, 0, 0.36 - k * 0.15, 0.142 - (k > 1 ? 0.004 : 0));

  // neck and head
  const neck = joint(torso, 0, 0.56, 0.01);
  add(neck, limb(0.05, 0.12).translate(0, 0.12, 0), skin);
  const head = joint(neck, 0, 0.19, 0.01);
  head.rotation.x = -0.1; // looking ahead, not down at the pavement
  add(head, new THREE.SphereGeometry(0.105, 24, 18), skin, 0, 0, 0, 0.92, 1.1, 1);
  add(head, new THREE.ConeGeometry(0.022, 0.06, 10).rotateX(Math.PI / 2), skin, 0, -0.005, 0.11, 1, 1.5, 1); // nose
  for (const side of [-1, 1]) {
    add(head, new THREE.SphereGeometry(0.026, 10, 8), skin, side * 0.097, 0, 0, 0.45, 1, 0.75); // ears
    add(head, new THREE.SphereGeometry(0.008, 8, 6), dark, side * 0.034, 0.018, 0.094); // eyes
    add(head, new THREE.CapsuleGeometry(0.01, 0.035, 4, 6).rotateZ(Math.PI / 2 - side * 0.15), hair, side * 0.037, 0.045, 0.094); // bushy brows
  }
  // a knitted cap (who.cap, its colour), pulled down to just above the brows, sitting back a little:
  // a dome over a turned-up rim, ribbed
  if (who.cap != null) {
    const wool = std(who.cap, 1), cap = joint(head, 0, 0, -0.006);
    cap.rotation.x = -0.14;
    add(cap, new THREE.SphereGeometry(0.1, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), wool, 0, 0.048, 0, 0.98, 1.08, 1.04);
    add(cap, new THREE.CylinderGeometry(0.104, 0.106, 0.042, 22), wool, 0, 0.06, 0, 0.98, 1, 1.04);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      add(cap, new THREE.BoxGeometry(0.008, 0.04, 0.006), wool, Math.sin(a) * 0.104, 0.06, Math.cos(a) * 0.108).rotation.y = a;
    }
  }
  // grey hair, thin on top, longer and untidy at the back and sides
  add(head, shaggy(new THREE.SphereGeometry(0.11, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.36), 0.12, 3), hair, 0, 0.008, -0.022, 0.95, 1.08, 1.02);
  add(head, shaggy(new THREE.SphereGeometry(0.106, 20, 12, Math.PI * 0.9, Math.PI * 1.2, Math.PI * 0.2, Math.PI * 0.55), 0.14, 5), hair, 0, -0.012, -0.008, 0.96, 1.1, 1.06);
  // the beard: full and long, from the cheeks down over the chin, with a moustache
  add(head, shaggy(new THREE.SphereGeometry(0.1, 20, 14, -Math.PI * 0.1, Math.PI * 1.2, Math.PI * 0.55, Math.PI * 0.45), 0.16, 9), beard, 0, -0.03, 0.012, 0.98, 1.05, 1.02);
  add(head, shaggy(new THREE.SphereGeometry(0.07, 16, 12), 0.22, 11), beard, 0, -0.11, 0.05, 1, 1.35, 0.75);
  for (const side of [-1, 1]) add(head, new THREE.CapsuleGeometry(0.013, 0.04, 4, 8).rotateZ(Math.PI / 2 + side * 0.35), beard, side * 0.02, -0.042, 0.103, 1, 1, 0.8); // the moustache, drooping

  // arms: from the shoulders, sleeves of the coat, bare hands; a bag in each
  const bags = who.bags ?? [];
  const arms = [-1, 1].map((side, k) => {
    const shoulder = joint(torso, side * 0.205, 0.48, 0);
    shoulder.rotation.z = side * 0.09; // a little out from the coat
    add(shoulder, new THREE.SphereGeometry(0.064, 14, 10), coat, 0, -0.015, 0, 1, 0.85, 1);
    add(shoulder, limb(0.062, 0.31), coat);
    const elbow = joint(shoulder, 0, -0.29, 0);
    add(elbow, limb(0.054, 0.27), coat);
    add(elbow, new THREE.CylinderGeometry(0.056, 0.058, 0.04, 14), coat, 0, -0.25, 0); // the cuff
    const wrist = joint(elbow, 0, -0.27, 0);
    add(wrist, new THREE.SphereGeometry(0.045, 14, 10), skin, 0, -0.04, 0.005, 0.75, 1.1, 1);
    let bag = null;
    if (bags.length) {
      bag = joint(wrist, 0, -0.07, 0);
      const plastic = new THREE.MeshStandardMaterial({ color: bags[k % bags.length], roughness: 0.35, metalness: 0 });
      bag.scale.setScalar(who.bagSize ?? 1);
      add(bag, bagGeometry(7 + k * 31), plastic);
      // the handles, two thin loops from the hand down into the bag
      for (const f of [-1, 1]) {
        const h = add(bag, new THREE.TorusGeometry(0.075, 0.007, 6, 16, Math.PI), plastic, 0, -0.1, f * 0.012);
        h.rotation.z = Math.PI;
        h.scale.set(0.55, 1.1, 1);
      }
    }
    return { shoulder, elbow, wrist, bag };
  });

  root.traverse(o => { o.frustumCulled = true; });
  return {
    group: root,
    // put him at (x, y, z) facing yaw, scale s, at stride phase `step` (radians, one step a half turn)
    // with his arms swinging `swing` (1 is a full swing) and bobbing `bob` metres
    walk(x, y, z, yaw, s, step, swing, bob) {
      root.position.set(x, y, z);
      root.rotation.y = yaw;
      root.scale.setScalar(s);
      hips.position.y = 0.95 + bob;
      hips.rotation.y = Math.sin(step) * 0.06 * swing;
      torso.rotation.y = -Math.sin(step) * 0.08 * swing;
      legs.forEach((l, k) => {
        const ph = step + k * Math.PI, fwd = Math.sin(ph); // forward when > 0
        l.hip.rotation.x = -fwd * 0.42 * swing;
        // the knee bends as the leg comes through, nearly straight as the heel goes down
        l.knee.rotation.x = (0.08 + Math.max(0, Math.cos(ph)) * 0.75) * swing;
        l.ankle.rotation.x = -(l.hip.rotation.x + l.knee.rotation.x) * 0.85 + 0.1 * swing * Math.max(0, -fwd);
      });
      arms.forEach((a, k) => {
        const fwd = Math.sin(step + (1 - k) * Math.PI); // opposite the leg on that side
        const w = a.bag ? 0.12 : 0.4; // bags keep the arms down
        a.shoulder.rotation.x = -fwd * w * swing;
        a.elbow.rotation.x = -(0.12 + Math.max(0, fwd) * 0.15) * swing;
        // the bag hangs straight down whatever the arm does, swaying a little behind it
        if (a.bag) a.bag.rotation.x = -(a.shoulder.rotation.x + a.elbow.rotation.x + torso.rotation.x) + Math.cos(step) * 0.08 * swing;
      });
    },
  };
}
