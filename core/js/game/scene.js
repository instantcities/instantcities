// The scene: the renderer, the lights, the weather and the cameras (one per player, and the menu's).

import * as THREE from 'three';
import { drawAgain } from '../scenery.js';
import { LOW_POWER } from '../device.js';
import { useHills } from '../terrain.js';
import { Particles } from '../effects.js';
import { Weather } from '../weather.js';
import { SLOTS, $ } from './base.js';
import { prettyRenderer } from '../pretty.js';

const canvas = $('game');
// Phones and tablets skip the multisampling and draw fewer pixels: both cost a lot of GPU memory.
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: !LOW_POWER, stencil: true, powerPreference: 'high-performance' }); // stencil: the holes for the water
renderer.setPixelRatio(Math.min(devicePixelRatio, LOW_POWER ? 1.25 : 2));
canvas.addEventListener('webglcontextrestored', drawAgain); // the city's canvases, shrunk once uploaded: drawn again
renderer.setSize(innerWidth, innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = LOW_POWER ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false; // refreshed once per frame, shared by both viewports
useHills(); // the city's hills, lifted in every shader (js/terrain.js)

export const scene = new THREE.Scene();
prettyRenderer(renderer, scene);
scene.background = new THREE.Color();
scene.fog = new THREE.Fog(0xffffff, 170, 620);
export const hemi = new THREE.HemisphereLight();
scene.add(hemi);
export const sun = new THREE.DirectionalLight();
sun.castShadow = true;
sun.shadow.mapSize.setScalar(LOW_POWER ? 1024 : 4096);
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

export const particles = new Particles(scene, 420);
export const weather = new Weather(scene, LOW_POWER);
// at night each player carries a lamp, so the street round them is lit
export const headlamps = [0, 1].map(() => {
  const l = new THREE.PointLight(0xffe2b0, 40, 24, 1.6);
  l.visible = false;
  scene.add(l);
  return l;
});

// Each racer's name tag lives on its own layer, so a player never sees their own tag.
export const cams = [0, 1].map(p => {
  const cam = new THREE.PerspectiveCamera(68, 1, 0.5, 1300);
  for (let j = 0; j < SLOTS; j++) if (j !== p) cam.layers.enable(1 + j);
  return cam;
});
export const menuCam = new THREE.PerspectiveCamera(50, 1, 0.5, 1300);
for (let j = 0; j < SLOTS; j++) menuCam.layers.enable(1 + j);
export const camYaw = [0, 0, 0, 0];
export const menuLook = new THREE.Vector3();
