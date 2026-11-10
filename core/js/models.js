// The game's vehicles on a city's models page (_layouts/models.html): each <canvas data-model="id">
// shows that model (an id of _data/vehicles.json: police-nl, bus-delijn, tram-gvb, double, ...),
// turning slowly; drag it to turn it yourself. Only the ones on the screen are drawn.
//
// core/models.html?model=<id> shows one, standing still, for tools/vehicles.mjs to take its picture
// (assets/img/vehicles/<id>-model.webp, the picture shown before this has drawn it, and on the city's page).
import * as THREE from 'three';
import { carGroup, modelType, flashBeacons } from './cars.js';
import { tramModel } from './trams.js';
import { person, S } from './person.js';

const STILL = document.body.dataset.still != null;

function build(id) {
  if (id.startsWith('tram-')) return tramModel(id.slice(5));
  const m = modelType(id);
  return m ? carGroup(m.type, m.paint) : null;
}

// a soft shadow under it: a dark blur, as big as the vehicle
function shadow(box) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d'), grad = g.createRadialGradient(64, 64, 10, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.45)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const size = box.getSize(new THREE.Vector3());
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size.x * 1.5, size.z * 1.18), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.01;
  return m;
}

// A city street for it to stand in, the same for every vehicle: the vehicle on the road along z, the
// kerb, the pavement with people on it and a row of plain house fronts on the far side (x < 0, away
// from the camera), sky behind. Rails under a tram.
const SKY = 0xcfdde8, FRONTS = [0xc9b8a0, 0xa65d4a, 0xe3dccb, 0x9aa3a8, 0xd6b77a, 0x7d8a7a, 0xe8e2d6, 0xb07a5a];
function street(tram) {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const g = new THREE.Group(), mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 });
  const box = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); g.add(m); return m; };
  const L = 200, KERB = -6, FRONT = -10;
  box(40, 0.02, L, 0x55595d, 14, -0.01, 0);                     // the road
  box(KERB - FRONT, 0.16, L, 0xb5afa5, (KERB + FRONT) / 2, 0.08, 0); // the pavement
  box(0.25, 0.17, L, 0x8f8a83, KERB, 0.085, 0);                // the kerb
  if (tram) for (const x of [-0.72, 0.72]) box(0.08, 0.03, L, 0x3a3d40, x, 0.015, 0);
  else for (let z = -L / 2; z < L / 2; z += 6) box(0.14, 0.012, 3, 0xe8e8e8, 3.2, 0.006, z); // the lane line
  // the house fronts: three to five floors, a row of windows on each, a cornice on top
  for (let z = -L / 2; z < L / 2;) {
    const w = 6 + rand() * 4, floors = 3 + Math.floor(rand() * 3), h = floors * 3.4 + 0.8, c = FRONTS[Math.floor(rand() * FRONTS.length)];
    box(8, h, w - 0.08, c, FRONT - 4, h / 2, z + w / 2);
    box(0.3, 0.35, w, 0x6f6a64, FRONT + 0.1, h - 0.2, z + w / 2);
    const n = Math.max(2, Math.round(w / 2.4));
    for (let f = 0; f < floors; f++) for (let i = 0; i < n; i++) {
      const wz = z + (i + 0.5) * (w / n), y = f === 0 ? 1.5 : 1.2 + f * 3.4 + 0.6;
      box(0.06, f === 0 ? 2.2 : 1.5, f === 0 ? 1.4 : 0.95, f === 0 ? 0x2c3338 : 0x3a4650, FRONT + 0.02, y, wz);
    }
    z += w;
  }
  // people on the pavement, some walking along, some standing
  const TOPS = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xf5f5f5, 0x37474f, 0xad1457, 0x6d4c41, 0xff7043];
  const LEGS = [0x283593, 0x3e2723, 0x212121, 0x546e7a, 0x8d6e63];
  for (let k = 0; k < 14; k++) {
    const { g: p } = person({ top: TOPS[k % TOPS.length], legs: LEGS[k % LEGS.length], skin: [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac][k % 5], hair: [0x2b1d14, 0x5d4037, 0xd7b56d, 0x1d1a17][k % 4], long: k % 3 === 0 });
    p.scale.setScalar(S);
    p.position.set(FRONT + 0.8 + rand() * (KERB - FRONT - 1.4), 0.16, -26 + k * 3.7 + rand() * 2);
    p.rotation.y = rand() < 0.4 ? Math.PI / 2 + (rand() - 0.5) : rand() < 0.5 ? 0 : Math.PI;
    g.add(p);
  }
  return g;
}

function viewer(canvas) {
  const id = canvas.dataset.model, model = build(id);
  if (!model) return null;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: STILL });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), turn = new THREE.Group();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.Fog(SKY, 70, 220);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7d6a, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(6, 10, 8);
  scene.add(sun);
  const box = new THREE.Box3().setFromObject(model), centre = box.getCenter(new THREE.Vector3());
  model.position.set(-centre.x, 0, -centre.z);
  turn.add(model, shadow(box), street(id.startsWith('tram-')));
  scene.add(turn);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 500);
  const long = box.max.z - box.min.z > 8; // a bus or a tram: seen more from the front
  let yaw = long ? 0.5 : 0.85;

  // as near as it can stand with the whole vehicle in view, from the front and to the right, a little up
  const corners = [];
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x - centre.x, y, z - centre.z));
  const look = new THREE.Vector3(0, (box.max.y - box.min.y) * 0.42, 0);
  function frame() {
    const w = canvas.clientWidth || 640, h = canvas.clientHeight || 360;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const el = 0.22, u = new THREE.Vector3(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el));
    const r = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), u).normalize(), v = new THREE.Vector3().crossVectors(u, r);
    const tv = Math.tan((camera.fov * Math.PI) / 360), th = tv * camera.aspect;
    let d = 0;
    for (const p of corners) {
      const q = p.clone().sub(look);
      d = Math.max(d, q.dot(u) + Math.abs(q.dot(r)) / th, q.dot(u) + Math.abs(q.dot(v)) / tv);
    }
    // never so near that the street round it is lost (a Vespa)
    camera.position.copy(look).addScaledVector(u, Math.max(d * 1.12, 9));
    camera.lookAt(look);
  }

  // it swings slowly to and fro (the street with it, as if you walked round it), never round to the
  // far side where the houses would stand in the way; dragging turns it, and a while after letting go
  // it swings on by itself again
  const mid = yaw - 1.0, amp = 0.75, clamp = a => Math.max(mid - amp - 0.2, Math.min(mid + amp + 0.2, a));
  let drag = null, idle = 0, phase = Math.asin(-mid / amp);
  canvas.addEventListener('pointerdown', e => { drag = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (drag == null) return;
    turn.rotation.y = clamp(turn.rotation.y + (e.clientX - drag) * 0.01);
    drag = e.clientX;
    idle = 0;
  });
  canvas.addEventListener('pointerup', () => {
    drag = null;
    phase = Math.asin(Math.max(-1, Math.min(1, (turn.rotation.y - mid) / amp)));
  });
  const draw = () => { frame(); renderer.render(scene, camera); };
  return {
    draw,
    step(dt) {
      idle += dt;
      if (drag == null && idle > 2) turn.rotation.y = mid + amp * Math.sin((phase += dt * 0.3));
      draw();
    },
  };
}

const canvases = [...document.querySelectorAll('canvas[data-model]')];
if (STILL) {
  for (const c of canvases) viewer(c)?.draw();
  document.body.dataset.ready = '1';
} else {
  const shown = new Map();
  const io = new IntersectionObserver(es => {
    for (const e of es) {
      if (e.isIntersecting && !shown.has(e.target)) {
        const v = viewer(e.target);
        if (v) { shown.set(e.target, v); e.target.classList.add('drawn'); }
      }
      if (shown.has(e.target)) shown.get(e.target).on = e.isIntersecting;
    }
  }, { rootMargin: '100px' });
  canvases.forEach(c => io.observe(c));
  let last = performance.now();
  const loop = now => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    flashBeacons();
    for (const v of shown.values()) if (v.on) v.step(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
