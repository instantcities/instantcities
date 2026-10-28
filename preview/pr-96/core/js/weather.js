import * as THREE from 'three';

// Day or night, dry, rain or snow: the light and sky for each, and the rain and snowflakes that
// fall round whoever is looking.

export const TIMES = ['day', 'night'];
export const WEATHERS = ['clear', 'rain', 'snow'];

// What changes from the route's own sunny theme: sky, horizon, fog, hemisphere light, sun (or
// moon) and the tint of the clouds.
const LOOKS = {
  'day:rain': {
    sky: 0x76838f, horizon: 0xa7b0b8, fog: [60, 320],
    hemi: [0xc8d2dc, 0x5d5e60, 1.25], sun: { color: 0xdde4ec, intensity: 0.8 }, clouds: 0x6f7b87,
  },
  'day:snow': {
    sky: 0xaab6c2, horizon: 0xdde3ea, fog: [55, 300],
    hemi: [0xeef3ff, 0xd5dbe3, 1.5], sun: { color: 0xf1f4ff, intensity: 1.2 }, clouds: 0xa6b0bb,
  },
  'night:clear': {
    sky: 0x050b1e, horizon: 0x1b2742, fog: [90, 460],
    hemi: [0x5b6f9c, 0x16161c, 0.5], sun: { color: 0x9fb4ff, intensity: 0.45 }, clouds: 0x161d2c,
  },
  'night:rain': {
    sky: 0x080c14, horizon: 0x161d29, fog: [45, 250],
    hemi: [0x56647c, 0x14151a, 0.45], sun: { color: 0x8c9cc0, intensity: 0.2 }, clouds: 0x10141c,
  },
  'night:snow': {
    sky: 0x111827, horizon: 0x2b3446, fog: [45, 250],
    hemi: [0x7484a6, 0x3a4152, 0.6], sun: { color: 0xa9b8e0, intensity: 0.3 }, clouds: 0x1d2433,
  },
};

export const isNight = time => time === 'night';

export function atmosphere(theme, time, weather) {
  const look = LOOKS[`${time}:${weather}`];
  return look ? { ...theme, ...look, sun: { ...theme.sun, ...look.sun } } : theme;
}

// ------------------------------------------------------------------ rain and snow

// Drops are scattered through a box that follows the camera. Each keeps its own spot in the world
// and wraps round the box, so riding through the rain the drops stream past instead of riding along.
const BOX = new THREE.Vector3(70, 36, 70);

const VERTEX = /* glsl */ `
  uniform float uTime, uSpeed, uSway, uSize, uMaxSize, uTail;
  uniform vec3 uCenter, uBox;
  uniform vec2 uWind;
  attribute vec4 seed; // a spot in the box, and a phase
  attribute float tail; // rain: 0 the drop's head, 1 the end of its streak
  varying float vFade;
  void main() {
    float speed = uSpeed * (0.8 + 0.4 * seed.w);
    vec3 p = seed.xyz * uBox;
    p.y -= uTime * speed;
    p.xz += uWind * uTime;
    p.x += sin(uTime * 1.3 + seed.w * 6.283) * uSway;
    p.z += cos(uTime * 1.1 + seed.w * 9.0) * uSway;
    vec3 low = uCenter - uBox * 0.5;
    p = low + mod(p - low, uBox);
    p += vec3(-uWind.x, speed, -uWind.y) * uTail * tail;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // never bigger than uMaxSize pixels: a flake right in front of the camera would fill much of the
    // screen, a big soft blot that costs a phone's GPU dear
    gl_PointSize = min(uSize * (0.6 + 0.8 * seed.w) / -mv.z, uMaxSize);
    // thin out towards the edge of the box, so it has no hard walls
    vec2 d = abs(p.xz - uCenter.xz) / (uBox.xz * 0.5);
    vFade = 1.0 - smoothstep(0.6, 1.0, max(d.x, d.y));
  }
`;

const fragment = round => /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float a = uOpacity * vFade;
    ${round ? 'a *= 1.0 - smoothstep(0.25, 0.5, length(gl_PointCoord - 0.5));' : ''}
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

function fall(count, perDrop, uniforms, round) {
  const seeds = new Float32Array(count * perDrop * 4), tails = new Float32Array(count * perDrop);
  for (let i = 0; i < count; i++) {
    const s = [Math.random(), Math.random(), Math.random(), Math.random()];
    for (let v = 0; v < perDrop; v++) {
      seeds.set(s, (i * perDrop + v) * 4);
      tails[i * perDrop + v] = v;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * perDrop * 3), 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seeds, 4));
  geo.setAttribute('tail', new THREE.BufferAttribute(tails, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uBox: { value: BOX },
      uSpeed: { value: 0 }, uWind: { value: new THREE.Vector2() }, uSway: { value: 0 },
      uSize: { value: 0 }, uMaxSize: { value: 1e4 }, uTail: { value: 0 }, uColor: { value: new THREE.Color() }, uOpacity: { value: 1 },
      ...Object.fromEntries(Object.entries(uniforms).map(([k, v]) => [k, { value: v }])),
    },
    vertexShader: VERTEX,
    fragmentShader: fragment(round),
    transparent: true,
    depthWrite: false,
  });
  const obj = perDrop === 2 ? new THREE.LineSegments(geo, material) : new THREE.Points(geo, material);
  obj.frustumCulled = false;
  obj.visible = false;
  obj.renderOrder = 2;
  return obj;
}

const DAY_RAIN = new THREE.Color(0xdde6f0), NIGHT_RAIN = new THREE.Color(0x9aa8bd);
const DAY_SNOW = new THREE.Color(0xffffff), NIGHT_SNOW = new THREE.Color(0xc9d3e6);

export class Weather {
  constructor(scene, lowPower) {
    this.rain = fall(lowPower ? 4000 : 9000, 2, {
      uSpeed: 24, uWind: new THREE.Vector2(3, 1.2), uTail: 0.04, uColor: new THREE.Color(0xdde6f0), uOpacity: 0.6,
    }, false);
    this.snow = fall(lowPower ? 1200 : 5000, 1, {
      uSpeed: 1.7, uWind: new THREE.Vector2(0.9, 0.3), uSway: 0.7, uSize: 260, uMaxSize: lowPower ? 24 : 40, uColor: new THREE.Color(0xffffff), uOpacity: 0.95,
    }, true);
    for (const o of [this.rain, this.snow]) o.userData.opacity = o.material.uniforms.uOpacity.value;
    scene.add(this.rain, this.snow);
    this.time = 0;
  }

  // How hard it rains and snows, each 0 to 1, and how far into the night (0 to 1): changing
  // weather fades one out and the other in.
  set(rain, snow, night) {
    for (const [o, amount, day, dark] of [[this.rain, rain, DAY_RAIN, NIGHT_RAIN], [this.snow, snow, DAY_SNOW, NIGHT_SNOW]]) {
      const u = o.material.uniforms;
      o.visible = amount > 0;
      u.uOpacity.value = o.userData.opacity * amount;
      u.uColor.value.copy(day).lerp(dark, night);
    }
  }

  update(dt) {
    this.time += dt;
    for (const o of [this.rain, this.snow]) o.material.uniforms.uTime.value = this.time;
  }

  // before each viewport is drawn: centre the box on its camera
  follow(cam) {
    for (const o of [this.rain, this.snow]) o.material.uniforms.uCenter.value.set(cam.position.x, cam.position.y - 4, cam.position.z);
  }
}

// ------------------------------------------------------------------ snow on the ground

// A white blanket for the grass and the gardens, swapped in for their own texture and back.
let snowImage = null;
function snowTexture(like) {
  snowImage ??= (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#eef2f7';
    g.fillRect(0, 0, 128, 128);
    const img = g.getImageData(0, 0, 128, 128), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() - 0.5) * 14;
      d[i] += v * 0.9; d[i + 1] += v * 0.95; d[i + 2] += v;
    }
    g.putImageData(img, 0, 0);
    return c;
  })();
  const t = new THREE.CanvasTexture(snowImage);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.copy(like.repeat);
  t.anisotropy = like.anisotropy;
  return t;
}

export function snowCover(materials, on) {
  for (const m of materials) {
    if (!m.map) continue;
    m.userData.dry ??= m.map;
    m.userData.snow ??= snowTexture(m.userData.dry);
    m.map = on ? m.userData.snow : m.userData.dry;
  }
}
