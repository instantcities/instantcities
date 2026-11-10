// The game's vehicles on a city's models page (_layouts/models.html): each <canvas data-model="id">
// shows that model (an id of _data/vehicles.json: police-nl, bus-delijn, tram-gvb, double, ...),
// turning slowly; drag it to turn it yourself. Only the ones on the screen are drawn.
//
// core/models.html?model=<id> shows one, standing still, for tools/vehicles.mjs to take its picture
// (assets/img/vehicles/<id>-model.webp, the picture shown before this has drawn it, and on the city's page).
import * as THREE from 'three';
import { carGroup, modelType, flashBeacons } from './cars.js';
import { tramModel } from './trams.js';

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

function viewer(canvas) {
  const id = canvas.dataset.model, model = build(id);
  if (!model) return null;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: STILL });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), turn = new THREE.Group();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7d6a, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(6, 10, 8);
  scene.add(sun);
  const box = new THREE.Box3().setFromObject(model), centre = box.getCenter(new THREE.Vector3());
  model.position.set(-centre.x, 0, -centre.z);
  turn.add(model, shadow(box));
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
    camera.position.copy(look).addScaledVector(u, d * 1.06);
    camera.lookAt(look);
  }

  // dragging turns it; let go and it turns slowly on by itself again
  let drag = null, idle = 0;
  canvas.addEventListener('pointerdown', e => { drag = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (drag == null) return;
    turn.rotation.y += (e.clientX - drag) * 0.01;
    drag = e.clientX;
    idle = 0;
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  const draw = () => { frame(); renderer.render(scene, camera); };
  return {
    draw,
    step(dt) {
      idle += dt;
      if (drag == null && idle > 2) turn.rotation.y += dt * 0.25;
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
