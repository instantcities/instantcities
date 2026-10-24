// The developer page (dev.html): not the game, just its models one at a time on a turntable, so we
// can work on the landmarks, the riders, the cars and the items without riding to them.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { addLandmarks } from './landmarks.js';
import { LANDMARKS, MONUMENTS, FRONTS } from './city.js';
import { createAnimal } from './horse.js';
import { createWalker, createCyclist } from './riders.js';
import { STABLE, MOUNTS } from './horses.js';
import { CAR_TYPES, carGroup } from './cars.js';
import { ITEMS, createItemModel, createBolt } from './items.js';
import { tramPlatform } from './tramplatform.js';

const $ = id => document.getElementById(id);
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe8f5);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7d6a, 1.4));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun, sun.target);

const ground = new THREE.Mesh(new THREE.CircleGeometry(1, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb8b2a6, roughness: 1 }));
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(1, 10, 0x555555, 0x888888);
scene.add(grid);

const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 5000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// The landmarks come as one group from addLandmarks, each mesh named after its landmark and
// standing where it stands in the city; the viewer takes them out one by one.
const city = new THREE.Group();
addLandmarks(city);
const rider = (h, mount) => {
  const def = { ...h, number: STABLE.indexOf(h) + 1, labelLayer: 1 }; // the label stays off camera layer 0
  if (mount === 'foot') return createWalker(def, STABLE.indexOf(h));
  if (mount === 'bike') return createCyclist(def, STABLE.indexOf(h));
  return createAnimal({ ...def, species: mount });
};

// Each asset: a label and a make() that returns { obj, animate? }.
const SECTIONS = [
  ['Landmarks', LANDMARKS.map(lm => ({ id: lm.id, label: lm.name, info: `look: ${lm.look}${lm.open ? ', open' : ''}`, make: () => ({ obj: city.getObjectByName(lm.id).clone() }) }))
    .concat(MONUMENTS.filter(mo => mo.name).map(mo => ({ id: mo.id, label: mo.name, info: 'statue', make: () => ({ obj: city.getObjectByName(mo.id).clone() }) })))
    .concat(FRONTS.filter(fr => fr.name && city.getObjectByName(fr.id)).map(fr => ({ id: fr.id, label: fr.name, info: 'house front', make: () => ({ obj: city.getObjectByName(fr.id).clone() }) })))],
  ['Riders', MOUNTS.map(m => ({ id: m, label: m, make: () => { const r = rider(STABLE[0], m); return { obj: r.root, animate: r.animate }; } }))],
  ['Characters', STABLE.map(h => ({ id: h.id, label: h.name, make: () => { const r = rider(h, 'horse'); return { obj: r.root, animate: r.animate }; } }))],
  ['Street', [{ id: 'tram-platform', label: 'Tramperron', info: 'tramplatform.js', make: () => {
    const lines = [{ ref: '1', colour: '#e4002b', to: 'Evergem Brielken' }, { ref: '4', colour: '#009a44', to: 'Gent UZ' }];
    const obj = tramPlatform({ lines, name: 'Korenmarkt' });
    obj.userData.board.draw([{ ...lines[0], min: 0 }, { ...lines[1], min: 3 }, { ...lines[0], min: 9 }]);
    return { obj };
  } }]],
  ['Cars', Object.keys(CAR_TYPES).map(type => ({ id: type, label: type, make: () => ({ obj: carGroup(type, 0xc0392b) }) }))],
  ['Items', [...Object.keys(ITEMS).map(kind => ({ id: kind, label: `${ITEMS[kind].emoji} ${ITEMS[kind].name}`, make: () => ({ obj: createItemModel(kind).group }) })),
    { id: 'bolt', label: '⚡ Bolt', make: () => ({ obj: createBolt() }) }]],
];
const ALL = SECTIONS.flatMap(([, list]) => list);

let current = null, pick = null, spinning = false, moving = false;
const turntable = new THREE.Group();
scene.add(turntable);

// The box round what the camera draws: not the hidden name tag or dizzy stars of a rider.
function measure(obj) {
  const box = new THREE.Box3();
  obj.updateWorldMatrix(true, true);
  obj.traverseVisible(m => { if (m.isMesh && m.layers.test(camera.layers)) box.expandByObject(m, false); });
  return box;
}

function show(id) {
  const asset = ALL.find(a => a.id === id) ?? ALL[0];
  if (current) turntable.remove(current.obj);
  turntable.rotation.y = 0;
  current = asset.make();
  pick = asset;
  const obj = current.obj;
  obj.position.set(0, 0, 0);
  obj.traverse(m => { if (m.isMesh) m.castShadow = m.receiveShadow = true; });
  // stand it in the middle, on the ground
  const box = measure(obj);
  const c = box.getCenter(new THREE.Vector3());
  obj.position.set(-c.x, -box.min.y, -c.z);
  box.translate(obj.position);
  turntable.add(obj);
  current.animate?.(0, 0, 0, 0);

  const size = box.getSize(new THREE.Vector3()), r = Math.max(size.x, size.y, size.z, 0.5);
  ground.scale.setScalar(r * 2);
  grid.scale.setScalar(r * 2.5);
  grid.position.y = 0.002;
  const s = sun.shadow.camera;
  s.left = s.bottom = -r * 1.5; s.right = s.top = r * 1.5; s.near = 0.1; s.far = r * 10;
  s.updateProjectionMatrix();
  sun.position.set(r * 1.5, r * 3, r * 2);
  camera.position.set(r * 1.4, r * 0.9, r * 1.8);
  controls.target.set(0, size.y / 2, 0);
  controls.update();

  let tris = 0;
  obj.traverse(m => { if (m.isMesh) tris += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3; });
  $('info').textContent = `${asset.label}${asset.info ? ` · ${asset.info}` : ''}\n${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)} m · ${Math.round(tris).toLocaleString()} triangles`;
  document.querySelectorAll('#lists .chip').forEach(b => b.classList.toggle('on', b.dataset.id === asset.id));
  history.replaceState(null, '', `#${asset.id}`);
}

$('lists').innerHTML = SECTIONS.map(([title, list]) =>
  `<h2>${title}</h2>${list.map(a => `<button class="chip" data-id="${a.id}">${a.label}</button>`).join('')}`).join('');
document.querySelectorAll('#lists .chip').forEach(b => b.addEventListener('click', () => show(b.dataset.id)));

const toggle = (btn, get, set) => $(btn).addEventListener('click', e => { set(!get()); e.currentTarget.classList.toggle('on', get()); });
toggle('spinBtn', () => spinning, v => { spinning = v; });
toggle('gridBtn', () => grid.visible, v => { grid.visible = v; });
let wire = false;
toggle('wireBtn', () => wire, v => {
  wire = v;
  turntable.traverse(m => { if (m.isMesh) [].concat(m.material).forEach(mt => { mt.wireframe = wire; }); });
});
$('gridBtn').classList.add('on');
// riders can gallop on the spot
const gallop = document.createElement('button');
gallop.className = 'chip';
gallop.textContent = 'gallop';
$('spinBtn').after(gallop);
gallop.addEventListener('click', () => { moving = !moving; gallop.classList.toggle('on', moving); });

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();
const fromHash = () => show(decodeURIComponent(location.hash.slice(1)));
addEventListener('hashchange', () => { if (location.hash.slice(1) !== pick?.id) fromHash(); });
fromHash();

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  if (spinning) turntable.rotation.y += dt * 0.5;
  current?.animate?.(dt, moving ? 20 : 0, 0, clock.elapsedTime);
  controls.update();
  renderer.render(scene, camera);
});
