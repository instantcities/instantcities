// A monument tall enough to be seen from across the city (its `far` in <city>/city.js's MONUMENTS:
// the Eiffel Tower), kilometres away, far past the fog (620 m on a clear day) and the camera's
// reach (1300 m). Its materials draw it, seen from further than NEAR metres, shrunk towards the
// camera to NEAR metres away: the same size and the same outline as where it really stands, in
// front of the sky but behind the city's nearer roofs. And it fogs over by its real distance, far
// times as slowly as the rest, so it stands hazy on the horizon on a clear day and is gone in the
// rain, in the fog's colour by day and by night. Further off it looms larger than it would (loom
// times its size, LOOM_AT metres away and further), so it still reads as itself on the horizon.

import { farGround } from './terrain.js';

const NEAR = 850; // within the sky's dome (900 m) and the camera's reach
const LOOM_AT = 5000;

// Make what stands at (x, z) a far monument: built once and never left out, whatever its distance.
export function farOff(obj, x, z, far, loom = 1) {
  const mats = new Map();
  obj.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = false; // its bounds are where it stands, not where it is drawn
    const own = m => {
      if (!mats.has(m)) mats.set(m, hazed(m.clone(), x, z, far, loom));
      return mats.get(m);
    };
    o.material = Array.isArray(o.material) ? o.material.map(own) : own(o.material);
  });
  return obj;
}

// the material drawn shrunk and fogged as above (flat ground: none of the hills' lift, but as much
// lower as the camera stands up a hill, see terrain.js's farGround)
function hazed(m, x, z, far, loom) {
  const f = v => v.toFixed(1);
  m.onBeforeCompile = sh => {
    const drop = farGround(sh);
    sh.vertexShader = sh.vertexShader
      .replace('#include <project_vertex>', `
        vec3 farFoot = vec3( ${f(x)}, 0.0, ${f(z)} );
        float farD = distance( cameraPosition.xz, farFoot.xz );
        vec4 farWorld = modelMatrix * vec4( transformed, 1.0 );
        farWorld.xyz = farFoot + ( farWorld.xyz - farFoot ) * mix( 1.0, ${loom.toFixed(2)}, smoothstep( ${f(NEAR)}, ${f(LOOM_AT)}, farD ) );
        ${drop}
        float farS = farD > ${f(NEAR)} ? ${f(NEAR)} / farD : 1.0;
        vec4 mvPosition = viewMatrix * vec4( cameraPosition + ( farWorld.xyz - cameraPosition ) * farS, 1.0 );
        gl_Position = projectionMatrix * mvPosition;`)
      .replace('#include <fog_vertex>', `#include <fog_vertex>
        #ifdef USE_FOG
          vFogDepth = - ( viewMatrix * farWorld ).z;
        #endif`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <fog_fragment>', `
      #ifdef USE_FOG
        gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, smoothstep( fogNear * ${f(far)}, fogFar * ${f(far)}, vFogDepth ) );
      #endif`);
  };
  m.customProgramCacheKey = () => `far:${x},${z},${far},${loom}`;
  return m;
}
