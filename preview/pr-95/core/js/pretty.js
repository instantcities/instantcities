// The pretty mode (?pretty in the address): the same game, drawn with costlier light for a fast
// desktop GPU. A late afternoon sun, the sky lighting and reflecting in everything (an environment
// map made from the sky), a haze that is warmer towards the sun and thinner higher up, the river
// mirroring its quays, and a pass after the picture: contact shadows (GTAO), a little bloom, tone
// mapping. Off, nothing of it runs: the game is drawn as it always was.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { WATER } from './ground.js';
import { HILLS } from './terrain.js';

export const PRETTY = new URLSearchParams(location.search).has('pretty');

// Shared by every material's fog (see below): plain objects, not THREE.Vector3, so that the
// materials' copies of the uniforms keep pointing at these instead of cloning them.
const SUN_DIR = { x: 0, y: 1, z: 0 }, SUN_GLOW = { x: 0, y: 0, z: 0 };
const HEMI_K = 0.3; // the sky's light now comes mostly from the environment map: the hemisphere light dimmed to match

// ------------------------------------------------------------------ the haze

// The game's linear fog, turned into a haze: exponential, thinner higher up (towers stand out of it),
// and warmer looking towards the sun. It still closes in completely at the fog's far end, where the
// city stops being built.
if (PRETTY) {
  const C = THREE.ShaderChunk;
  C.fog_pars_vertex = `#ifdef USE_FOG
  varying float vFogDepth;
  varying vec3 vFogWorld;
#endif`;
  // (the world position from the view position: the view matrix's rotation turned back)
  C.fog_vertex = `#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  vFogWorld = ( vec4( mvPosition.xyz - viewMatrix[ 3 ].xyz, 0.0 ) * viewMatrix ).xyz;
#endif`;
  C.fog_pars_fragment = `#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  varying vec3 vFogWorld;
  uniform vec3 prettySunDir;
  uniform vec3 prettySunGlow;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
#endif`;
  C.fog_fragment = `#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
    vec3 hazeColor = fogColor;
  #else
    vec3 fogRay = vFogWorld - cameraPosition;
    float fogDist = length( fogRay );
    // density falls off by e every 45 m up; along the ray, its mean between the two heights
    float fall = 1.0 / 45.0, h0 = max( cameraPosition.y, 0.0 ) * fall, dh = fogRay.y * fall;
    float along = exp( - h0 ) * ( abs( dh ) > 1e-3 ? ( 1.0 - exp( - dh ) ) / dh : 1.0 );
    float thick = 2.6 / fogFar * max( fogDist - fogNear * 0.35, 0.0 ) * along;
    float fogFactor = max( 1.0 - exp( - thick ), smoothstep( fogFar * 0.72, fogFar, vFogDepth ) );
    float toSun = max( dot( fogRay / max( fogDist, 1e-3 ), prettySunDir ), 0.0 );
    vec3 hazeColor = fogColor + prettySunGlow * ( 0.35 * pow( toSun, 6.0 ) + 0.65 * pow( toSun, 40.0 ) );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, hazeColor, fogFactor );
#endif`;
  // into the uniforms every built-in material starts from
  for (const k in THREE.ShaderLib) Object.assign(THREE.ShaderLib[k].uniforms, { prettySunDir: { value: SUN_DIR }, prettySunGlow: { value: SUN_GLOW } });
}

// ------------------------------------------------------------------ the late afternoon

// The city's sunny day, a few hours later: the sun low in the west, warm, the shadows long, the
// horizon hazy gold. Night, rain and snow keep their own colours (they only override these).
const golden = new WeakSet();
export function goldenHour(theme) {
  if (!PRETTY || golden.has(theme)) return;
  golden.add(theme);
  const [x, , z] = theme.sun.pos, a = Math.atan2(z, x);
  theme.sun = { ...theme.sun, color: 0xffd2a2, intensity: theme.sun.intensity * 1.7, pos: [Math.cos(a) * 180, 95, Math.sin(a) * 180] };
  theme.sky = 0x3f78c4;
  theme.horizon = 0xe9d6bc;
  theme.hemi = [0xc6d6ee, 0x8c7a62, theme.hemi[2]];
  theme.shadow = theme.shadow.map(s => s * 1.35); // the long shadows of houses further off still fall in view
}

// ------------------------------------------------------------------ the sky

let dome = null, sunDisc = null;
// The sky dome (scenery.js) gets the sun on it: a bright disc (which blooms) and its glow, the same
// glow the haze has towards the sun, so the horizon and the haze meet without a seam.
export function prettyDome(mesh) {
  if (!PRETTY || dome) return;
  dome = mesh;
  sunDisc = { value: 0 };
  const lift = mesh.material.onBeforeCompile; // the hills' (terrain.js), if any
  mesh.material.onBeforeCompile = (sh, r) => {
    lift.call(mesh.material, sh, r);
    Object.assign(sh.uniforms, { prettySunDir: { value: SUN_DIR }, prettySunGlow: { value: SUN_GLOW }, sunDisc });
    sh.vertexShader = sh.vertexShader
      .replace('void main() {', 'varying vec3 vSkyDir;\nvoid main() {')
      .replace('#include <project_vertex>', '#include <project_vertex>\n  vSkyDir = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz - cameraPosition;');
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', 'varying vec3 vSkyDir;\nuniform vec3 prettySunDir;\nuniform vec3 prettySunGlow;\nuniform float sunDisc;\nvoid main() {')
      .replace('#include <opaque_fragment>', `#include <opaque_fragment>
      vec3 d = normalize( vSkyDir );
      float toSun = max( dot( d, prettySunDir ), 0.0 );
      float low = 1.0 - smoothstep( 0.0, 0.5, d.y );
      gl_FragColor.rgb += prettySunGlow * ( low * ( 0.35 * pow( toSun, 6.0 ) + 0.65 * pow( toSun, 40.0 ) ) + 0.25 * pow( toSun, 300.0 ) );
      gl_FragColor.rgb += prettySunGlow * sunDisc * smoothstep( 0.9993, 0.99965, toSun );`);
  };
  mesh.material.needsUpdate = true;
}

// The environment map: the sky's colours round a sphere, the ground's below, and the sun, blurred
// for the rough materials by the PMREM generator. Made again when the look changes (not more than a
// few times a second while it fades), and only while outside: indoors has its own.
const envScene = new THREE.Scene();
const envSky = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true }));
const envSun = new THREE.Mesh(new THREE.SphereGeometry(3.5, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
envSky.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(envSky.geometry.attributes.position.count * 3), 3));
envScene.add(envSky, envSun);
let pmrem = null, outsideEnv = null, envLook = null, envOf = null, envT = -1e9;

// Called with the look each time the sky changes (worlds.js).
export function prettyLook(L, hemi) {
  if (!PRETTY) return;
  envLook = L;
  hemi.intensity = L.hemi * HEMI_K;
}

function paintEnv(L, scene) {
  const p = envSky.geometry.attributes.position, c = envSky.geometry.attributes.color, col = new THREE.Color();
  const ground = L.hemiGround.clone().multiplyScalar(0.55), skyGrey = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 50;
    if (y >= 0) col.copy(L.horizon).lerp(skyGrey.copy(L.sky).lerp(L.horizon, 0.45), Math.pow(y, 0.55));
    else col.copy(L.horizon).lerp(ground, Math.min(1, -y * 6));
    c.setXYZ(i, col.r, col.g, col.b);
  }
  c.needsUpdate = true;
  envSun.position.set(SUN_DIR.x, SUN_DIR.y, SUN_DIR.z).multiplyScalar(45);
  envSun.material.color.copy(L.sunColor).multiplyScalar(L.sun * 6);
  envSun.visible = SUN_DIR.y > -0.05;
  const env = pmrem.fromScene(envScene, 0.02, 1, 100).texture;
  if (scene.environment === outsideEnv) scene.environment = env;
  outsideEnv?.dispose();
  outsideEnv = env;
}

// ------------------------------------------------------------------ the river's mirror

// The water's material (scenery.js) gets the reflection: the city drawn upside down from under
// the water into a texture, which the water shows where it looks, rippled, more of it the flatter
// it is looked at (Fresnel).
const reflectRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, stencilBuffer: true });
const reflectMatrix = { value: new THREE.Matrix4() }, waterTime = { value: 0 };
const mirrorCam = new THREE.PerspectiveCamera();
const waters = new Set(); // the water's materials, left out of their own reflection
export function prettyWater(material) {
  if (!PRETTY || HILLS) return;
  waters.add(material);
  const own = material.onBeforeCompile;
  material.userData.sheen && (material.userData.sheen.value = 0.12); // the reflection is the sheen now
  material.onBeforeCompile = (sh, r) => {
    own.call(material, sh, r);
    Object.assign(sh.uniforms, { tReflect: { value: reflectRT.texture }, reflectMatrix, waterTime });
    sh.vertexShader = sh.vertexShader
      .replace('void main() {', 'uniform mat4 reflectMatrix;\nvarying vec4 vReflUv;\nvarying vec2 vWaterXZ;\nvoid main() {')
      .replace('#include <project_vertex>', `#include <project_vertex>
      vec4 waterWorld = modelMatrix * vec4( transformed, 1.0 );
      vReflUv = reflectMatrix * waterWorld;
      vWaterXZ = waterWorld.xz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', `uniform sampler2D tReflect;
uniform float waterTime;
varying vec4 vReflUv;
varying vec2 vWaterXZ;
// ripples: a few waves of different lengths and headings, their slope (at most 1)
vec2 ripple( vec2 p, float t ) {
  vec2 s = vec2( 0.0 );
  vec4 w[5] = vec4[5]( vec4( 0.8, 0.6, 0.31, 0.8 ), vec4( -0.5, 0.86, 0.47, 1.0 ), vec4( 0.97, -0.24, 0.73, 1.3 ),
                       vec4( -0.2, -0.98, 1.1, 1.6 ), vec4( 0.6, -0.8, 1.6, 1.9 ) );
  for ( int i = 0; i < 5; i++ ) {
    float k = w[i].z, ph = dot( w[i].xy, p ) * k + t * w[i].w;
    s += w[i].xy * cos( ph );
  }
  return s / 5.0;
}
void main() {`)
      .replace('#include <opaque_fragment>', `#include <opaque_fragment>
      {
        vec2 sl = ripple( vWaterXZ, waterTime );
        vec2 wob = sl * vec2( 0.006, 0.002 ); // a slight shiver: more breaks the mirror into blots
        vec3 refl = texture2D( tReflect, vReflUv.xy / vReflUv.w + wob ).rgb;
        float cosT = clamp( dot( normalize( -vViewPosition ), normalize( vNormal ) ), 0.0, 1.0 );
        float fres = 0.04 + 0.96 * pow( 1.0 - cosT, 5.0 );
        gl_FragColor.rgb = mix( gl_FragColor.rgb, refl * vec3( 0.86, 0.9, 0.88 ), clamp( 0.5 + fres, 0.0, 0.9 ) );
      }`);
  };
  material.customProgramCacheKey = () => 'pretty-water';
  material.needsUpdate = true;
}

const plane = new THREE.Plane(), clip = new THREE.Vector4(), q = new THREE.Vector4();
const camPos = new THREE.Vector3(), look = new THREE.Vector3(), rot = new THREE.Matrix4();
function reflect(renderer, scene, cam, w, h) {
  const level = WATER + 0.008;
  cam.getWorldPosition(camPos);
  if (!waters.size || camPos.y < level + 0.2) return;
  const pr = renderer.getPixelRatio(), rw = Math.round(w * pr * 0.5), rh = Math.round(h * pr * 0.5);
  if (reflectRT.width !== rw || reflectRT.height !== rh) reflectRT.setSize(rw, rh);
  // the camera mirrored in the water's plane
  rot.extractRotation(cam.matrixWorld);
  look.set(0, 0, -1).applyMatrix4(rot).add(camPos);
  mirrorCam.position.set(camPos.x, 2 * level - camPos.y, camPos.z);
  mirrorCam.up.set(0, 1, 0).applyMatrix4(rot);
  mirrorCam.up.y = -mirrorCam.up.y;
  mirrorCam.lookAt(look.x, 2 * level - look.y, look.z);
  mirrorCam.far = cam.far;
  mirrorCam.layers.mask = cam.layers.mask;
  mirrorCam.updateMatrixWorld();
  mirrorCam.projectionMatrix.copy(cam.projectionMatrix);
  reflectMatrix.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1)
    .multiply(mirrorCam.projectionMatrix).multiply(mirrorCam.matrixWorldInverse);
  // what lies under the water is cut off by the near plane, tilted onto the water (an oblique frustum)
  plane.set(new THREE.Vector3(0, 1, 0), -level).applyMatrix4(mirrorCam.matrixWorldInverse);
  clip.set(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
  const e = mirrorCam.projectionMatrix.elements;
  q.set((Math.sign(clip.x) + e[8]) / e[0], (Math.sign(clip.y) + e[9]) / e[5], -1, (1 + e[10]) / e[14]);
  clip.multiplyScalar(2 / clip.dot(q));
  e[2] = clip.x; e[6] = clip.y; e[10] = clip.z + 1 - 0.003; e[14] = clip.w;
  mirrorCam.projectionMatrixInverse.copy(mirrorCam.projectionMatrix).invert();
  const was = renderer.getRenderTarget();
  for (const m of waters) m.visible = false; // (and so no feedback loop: it reads the texture being drawn)
  renderer.setRenderTarget(reflectRT);
  renderer.render(scene, mirrorCam);
  renderer.setRenderTarget(was);
  for (const m of waters) m.visible = true;
}

// ------------------------------------------------------------------ the picture

let composer = null, renderPass = null, gtao = null;
const size = new THREE.Vector2();
// (sized in the drawing buffer's pixels, so its own pixel ratio is 1)
function makeComposer(renderer, scene, cam) {
  renderer.getDrawingBufferSize(size);
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, stencilBuffer: true, samples: 4 });
  composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(1);
  renderPass = new RenderPass(scene, cam);
  gtao = new GTAOPass(scene, cam, size.x, size.y);
  // (glows, glass and other see-through things cast no contact shadow)
  const hide = gtao.overrideVisibility;
  gtao.overrideVisibility = function () {
    hide.call(this);
    const see = m => m.transparent || !m.depthWrite || !m.colorWrite;
    this.scene.traverse(o => { if (o.visible && (o.isSprite || (o.isMesh && [].concat(o.material).some(see)))) o.visible = false; });
  };
  gtao.updateGtaoMaterial({ radius: 1.6, distanceExponent: 1.4, thickness: 1.5, scale: 1.1, samples: 12 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  gtao.blendIntensity = 0.85;
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), 0.32, 0.55, 1.05);
  composer.addPass(renderPass);
  composer.addPass(gtao);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
}

export function prettyRenderer(renderer, scene) {
  if (!PRETTY) return;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  pmrem = new THREE.PMREMGenerator(renderer);
  scene.environmentIntensity = 0.75;
}

// Draws one view (w x h CSS pixels, the viewport already set). `whole` when it is the only view,
// filling the screen: then through the passes, else (two players) straight. `inside` a building
// there is no river to mirror.
export function drawView(renderer, scene, cam, w, h, whole, inside, sun) {
  if (!PRETTY) return renderer.render(scene, cam);
  SUN_DIR.x = sun.position.x - sun.target.position.x;
  SUN_DIR.y = sun.position.y - sun.target.position.y;
  SUN_DIR.z = sun.position.z - sun.target.position.z;
  const n = Math.hypot(SUN_DIR.x, SUN_DIR.y, SUN_DIR.z) || 1;
  SUN_DIR.x /= n; SUN_DIR.y /= n; SUN_DIR.z /= n;
  const L = envLook;
  if (L) {
    // the glow round the sun: its colour, strongest when it is low, and none at night or under clouds
    const k = (1 - L.night) * (1 - L.rain) * (1 - L.snow) * (0.45 + 0.55 * (1 - Math.min(1, SUN_DIR.y * 2)));
    SUN_GLOW.x = L.sunColor.r * k; SUN_GLOW.y = L.sunColor.g * k * 0.85; SUN_GLOW.z = L.sunColor.b * k * 0.6;
    if (sunDisc) sunDisc.value = 14 * k;
    const now = performance.now();
    if (L !== envOf && scene.environment === outsideEnv && now - envT > 250) {
      paintEnv(L, scene);
      envOf = L;
      envT = now;
    }
  }
  waterTime.value = performance.now() / 1000;
  if (!inside) reflect(renderer, scene, cam, w, h);
  if (!whole) return renderer.render(scene, cam);
  if (!composer) makeComposer(renderer, scene, cam);
  renderer.getDrawingBufferSize(size);
  if (composer.renderTarget1.width !== size.x || composer.renderTarget1.height !== size.y) composer.setSize(size.x, size.y);
  renderPass.camera = gtao.camera = cam;
  renderer.setScissorTest(false);
  composer.render();
  renderer.setScissorTest(true);
}
