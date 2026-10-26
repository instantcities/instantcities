import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { addCars, randomCar, flashBeacons, CAR_TYPES } from './cars.js';
import { addTrams, nearTrams } from './trams.js';
import { addTraffic } from './traffic.js';
import { addSignals } from './signals.js';
import { addStops } from './stops.js';
import { addTramStops } from './tramstops.js';
import { addParkedBikes } from './bikers.js';
import { LOW_POWER, PARKED } from './device.js';
import { WATER } from './relief.js';
import { settTexture, slabTexture } from './track.js';
import { addLandmarks } from './landmarks.js';
import { later, TILE } from './tiles.js';
import { elevation, shade, letGo } from './facades.js';
import { liftShader } from './terrain.js';
export { drawAgain } from './facades.js';
import { SQUARES, SIGNALS, CROSSINGS, STOPS, TRAM_HALTS, TRAM_CENTRE, TRAM_LINES, TRAM_STOPS, OLD_TOWN, BUS_LINES, LOOK, TWO_LANES, BIKE_STREETS, SHEEP, GROVES, AREAS, QUARTERS, FULL_PARKING, PARKED_CARS, PARKED_BIKES, MAP_TREES, LOOKS, BOATS } from './city.js';
import { squareAt } from './squares.js';
import { sunk, hollowGround } from './hollows.js';
import { onGround, GROUND } from './ground.js';
import { addSitters } from './sitters.js';
import { Kit, kitMat } from './kit.js';
import { addFurniture, furnitureNight } from './furniture.js';
import { italianUpper, italianGround } from './italian.js';
import { romanUpper, romanGround } from './roman.js';

// A city whose LOOK has style 'italian' or 'roman' draws its house fronts as plaster in the manner of
// js/italian.js or js/roman.js, and not tinted (a texture per colour); the other cities' are Ghent's.
const PLASTER = LOOK?.style === 'italian' || LOOK?.style === 'roman';
const manner = LOOK?.style === 'roman' ? { upper: romanUpper, ground: romanGround } : { upper: italianUpper, ground: italianGround };

// Deterministic random so each course looks the same every time.
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mat = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });

function canvasTexture(w, h, draw, repeat = null) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const paint = () => {
    c.width = w; // (back from the 1 pixel letGo left, and cleared)
    c.height = h;
    draw(c.getContext('2d', { willReadFrequently: true }), w, h); // on the CPU: noise() reads its pixels back
  };
  paint();
  const t = letGo(new THREE.CanvasTexture(c), paint);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
  }
  return t;
}

function noise(g, w, h, r, amount, tint = [0.6, 1, 0.5]) {
  const img = g.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (r() - 0.5) * amount;
    d[i] += v * tint[0]; d[i + 1] += v * tint[1]; d[i + 2] += v * tint[2];
  }
  g.putImageData(img, 0, 0);
}

// A house front in the colour its photos show (LOOKS) is drawn in one texture with every house of
// its kind, whatever its colour: the wall in it is painted NEUTRAL and left half see-through
// (tintable), and tinted() colours it by the house's own colour, given to its corners, leaving what
// is drawn over it (windows, doors) as it is. A texture per colour, as it was, put hundreds of
// textures on a phone in a street of coloured fronts, more than it has the memory for.
const NEUTRAL = '#b4b4b4', NEUTRAL_LIN = new THREE.Color(NEUTRAL).r;
function tintable(g, w, h) {
  const img = g.getImageData(0, 0, w, h), d = img.data;
  for (let i = 3; i < d.length; i += 4) d[i] = 128;
  g.putImageData(img, 0, 0);
}
// its corners' colour: the wall's (linear, as three.js has it) over NEUTRAL's
const tintOf = hex => new THREE.Color(hex).multiplyScalar(1 / NEUTRAL_LIN);
const tintShader = s => {
  liftShader(s); // (onto the hills, as every material is)
  s.fragmentShader = s.fragmentShader.replace('#include <color_fragment>', '').replace('#include <map_fragment>', `#include <map_fragment>
    diffuseColor.rgb *= mix(vColor, vec3(1.0), clamp(sampledDiffuseColor.a * 2.0 - 1.0, 0.0, 1.0));
    diffuseColor.a = 1.0;`);
};
function tinted(map) {
  const m = mat(0xffffff, 0.9, { map, vertexColors: true });
  m.onBeforeCompile = tintShader;
  m.customProgramCacheKey = () => 'wallTint';
  return m;
}

function mesh(ctx, geo, material, x, y, z, { shadow = true, parent = ctx.group } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// still: it never changes after this, so js/tiles.js may cut it up
function instanced(ctx, geo, material, list, place, { shadow = true, color = null, still = true } = {}) {
  const im = new THREE.InstancedMesh(geo, material, Math.max(1, list.length));
  im.count = list.length;
  list.forEach((item, i) => {
    place(ctx.dummy, item);
    ctx.dummy.updateMatrix();
    im.setMatrixAt(i, ctx.dummy.matrix);
    if (color) im.setColorAt(i, color(item));
  });
  im.castShadow = shadow;
  im.userData.still = still;
  ctx.group.add(im);
  return im;
}

function resetDummy(d, x, y, z, rotY = 0, s = 1) {
  d.position.set(x, y, z);
  d.rotation.set(0, rotY, 0);
  d.scale.setScalar(s);
}

// ------------------------------------------------------------------ shared pieces

// The sky dome, and a way to repaint it for the night or a grey day (see js/weather.js).
function sky(ctx) {
  const geo = new THREE.SphereGeometry(900, 32, 16), p = geo.attributes.position;
  geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(p.count * 3), 3));
  const paint = (top, horizon) => {
    const t = new THREE.Color(top), hor = new THREE.Color(horizon), c = new THREE.Color(), cols = geo.attributes.color;
    for (let i = 0; i < p.count; i++) {
      c.copy(hor).lerp(t, Math.pow(Math.max(0, p.getY(i) / 900), 0.55));
      cols.setXYZ(i, c.r, c.g, c.b);
    }
    cols.needsUpdate = true;
  };
  paint(ctx.theme.sky, ctx.theme.horizon);
  const dome = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  // round whichever camera draws it, so its edge never shows a kilometre out from the middle of the map
  dome.frustumCulled = false;
  dome.onBeforeRender = (renderer, scene, camera) => {
    dome.position.set(camera.position.x, 0, camera.position.z);
    dome.updateMatrixWorld();
  };
  ctx.group.add(dome);
  return paint;
}

function ground(ctx) {
  const { r, theme } = ctx;
  const strokes = ['rgba(38,92,30,0.35)', 'rgba(160,215,110,0.3)'];
  const tex = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = theme.ground;
    g.fillRect(0, 0, w, h);
    noise(g, w, h, r, 26, [0.6, 1, 0.5]);
    for (let k = 0; k < 600; k++) {
      g.strokeStyle = strokes[Math.floor(r() * strokes.length)];
      g.lineWidth = 1;
      const x = r() * w, y = r() * h;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (r() - 0.5) * 3, y - 3 - r() * 4);
      g.stroke();
    }
  });
  // under the whole map (its zone, and some way past the edge you can see over), not only round
  // the middle, or far out the sky shows through between the streets
  const zone = ctx.cfg.map?.zone ?? [-900, -900, 900, 900];
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (let k = 0; k < zone.length; k += 2) { x0 = Math.min(x0, zone[k]); x1 = Math.max(x1, zone[k]); z0 = Math.min(z0, zone[k + 1]); z1 = Math.max(z1, zone[k + 1]); }
  const w = x1 - x0 + 600, d = z1 - z0 + 600;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(w / 11.25, d / 11.25); // a tile of the texture every 11.25 m
  const plane = mesh(ctx, new THREE.PlaneGeometry(w, d), onGround(mat(0xffffff, 1, { map: tex }), 0), (x0 + x1) / 2, 0, (z0 + z1) / 2, { shadow: false });
  plane.rotation.x = -Math.PI / 2;
  ctx.groundPlane = plane;
}

function plantTrees(ctx, list) {
  const { r } = ctx;
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 2.4, 6);
  trunkGeo.translate(0, 1.2, 0);
  list.snowpine ??= [];
  const all = [...list.pine, ...list.round, ...list.poplar, ...list.snowpine];
  const place = (d, t) => resetDummy(d, t.x, sunk(t.x, t.z), t.z, t.rot, t.s);
  instanced(ctx, trunkGeo, mat(0x6d4c33, 0.9), all, place);
  const pineGeo = new THREE.ConeGeometry(2.1, 5.8, 7);
  pineGeo.translate(0, 2.2 + 2.9, 0);
  const roundGeo = new THREE.IcosahedronGeometry(2.5, LOW_POWER ? 0 : 1); // a phone gets the coarse crown: there are thousands
  roundGeo.translate(0, 2.3 + 1.9, 0);
  const poplarGeo = new THREE.ConeGeometry(1.25, 10, 7);
  poplarGeo.translate(0, 2 + 5, 0);
  const leaf = mat(0xffffff, 0.85, { flatShading: true });
  instanced(ctx, pineGeo, leaf, list.pine, place, { color: () => new THREE.Color().setHSL(0.33 + r() * 0.05, 0.45, 0.22 + r() * 0.08) });
  instanced(ctx, roundGeo, leaf, list.round, place, { color: () => new THREE.Color().setHSL(0.24 + r() * 0.08, 0.5, 0.33 + r() * 0.1) });
  instanced(ctx, poplarGeo, leaf, list.poplar, place, { color: () => new THREE.Color().setHSL(0.27 + r() * 0.05, 0.5, 0.26 + r() * 0.08) });
  if (list.snowpine.length) {
    instanced(ctx, pineGeo, leaf, list.snowpine, place, { color: () => new THREE.Color().setHSL(0.36 + r() * 0.04, 0.4, 0.18 + r() * 0.06) });
    const capGeo = new THREE.ConeGeometry(1.25, 2.6, 7);
    capGeo.translate(0, 8.0 - 1.3 + 0.05, 0);
    const skirtGeo = new THREE.ConeGeometry(2.15, 0.9, 7, 1, true);
    skirtGeo.translate(0, 2.65, 0);
    instanced(ctx, capGeo, mat(0xf8fbff, 0.9, { flatShading: true }), list.snowpine, place);
    instanced(ctx, skirtGeo, mat(0xf8fbff, 0.9, { flatShading: true, side: THREE.DoubleSide }), list.snowpine, place);
  }
}

function clouds(ctx) {
  const { r } = ctx;
  const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: ctx.theme.clouds, fog: false });
  ctx.cloudMat = cloudMat;
  const list = [];
  for (let k = 0; k < 14; k++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 5; j++) {
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), cloudMat);
      const s = 8 + r() * 8;
      puff.scale.set(s * 1.4, s * 0.7, s);
      puff.position.set((j - 2) * 9 + r() * 4, r() * 4, r() * 8);
      cloud.add(puff);
    }
    const a = r() * Math.PI * 2, d = 250 + r() * 350;
    cloud.position.set(Math.cos(a) * d, 110 + r() * 60, Math.sin(a) * d);
    ctx.group.add(cloud);
    list.push(cloud);
  }
  ctx.updaters.push(dt => { for (const c of list) c.position.x += dt * 1.5; });
}

// Ghent's water: the Leie and the Schelde run a murky green-grey, never swimming-pool blue
function waterMaterial(ctx, color = 0x4f6b55) {
  const tex = canvasTexture(128, 128, (g, w, h) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(35,60,45,0.35)';
    for (let k = 0; k < 40; k++) {
      const x = ctx.r() * w, y = ctx.r() * h, len = 8 + ctx.r() * 20;
      g.lineWidth = 1 + ctx.r() * 2;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + len / 2, y - 3, x + len, y);
      g.stroke();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const drift = { value: 0 }; // the second ripple layer's scroll, against the first
  ctx.updaters.push(dt => { tex.offset.x += dt * 0.05; drift.value += dt * 0.03; });
  // the ripples also bend the surface (bumpMap), so the sun's highlight and the sky's sheen wobble
  const water = mat(color, 0.15, { metalness: 0.1, map: tex, bumpMap: tex, bumpScale: 1 });
  water.onBeforeCompile = shader => {
    shader.uniforms.drift = drift;
    shader.fragmentShader = shader.fragmentShader
      // a second, mirrored layer of ripples drifting the other way: the water shimmers, not slides
      .replace('void main() {', 'uniform float drift;\nvoid main() {')
      .replace('#include <map_fragment>', `#include <map_fragment>
      diffuseColor *= texture2D(map, vec2(-1.3 * vMapUv.x + drift, 1.3 * vMapUv.y + 0.37));`)
      // the sky's sheen at a low angle (fresnel), in the fog's colour, so it follows day, night and rain
      .replace('#include <fog_fragment>', `#ifdef USE_FOG
      float sheen = pow(1.0 - saturate(dot(normalize(vViewPosition), normal)), 4.0);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, 0.65 * sheen);
    #endif
    #include <fog_fragment>`);
  };
  return water;
}

const DOORS = LOOK?.doors ?? ['#1f5e3a', '#1d3f6e', '#7a1f1f', '#2b2b2b', '#c98a1b', '#3f6f78'];

// A unit gable roof: ridge along local x at y = 1, eaves at z = ±0.5, base at y = 0.
function roofGeometry() {
  const shape = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
  geo.translate(0, 0, -0.5);
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function groundMats(ctx) {
  const { r } = ctx;
  const tex = (draw, size = 128) => {
    const t = canvasTexture(size, size, draw);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const asphalt = tex((g, w, h) => { g.fillStyle = '#5a5d62'; g.fillRect(0, 0, w, h); noise(g, w, h, r, 26, [1, 1, 1]); });
  const red = tex((g, w, h) => { g.fillStyle = '#8a2f2c'; g.fillRect(0, 0, w, h); noise(g, w, h, r, 22, [1, 0.8, 0.8]); });
  const pavement = tex((g, w, h) => {
    g.fillStyle = ctx.theme.paving ?? '#c9c4ba';
    g.fillRect(0, 0, w, h);
    noise(g, w, h, r, 10, [1, 1, 1]);
    g.strokeStyle = ctx.theme.paving ? 'rgba(62,64,68,0.3)' : 'rgba(90,85,78,0.35)';
    g.lineWidth = 2;
    for (let k = 0; k <= w; k += 32) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k, h); g.stroke();
      g.beginPath(); g.moveTo(0, k); g.lineTo(w, k); g.stroke();
    }
  });
  const grass = color => tex((g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    noise(g, w, h, r, 24);
    for (let k = 0; k < 300; k++) {
      g.strokeStyle = r() < 0.5 ? 'rgba(38,92,30,0.35)' : 'rgba(160,215,110,0.3)';
      const x = r() * w, y = r() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 3 - r() * 3); g.stroke();
    }
  });
  const gravel = tex((g, w, h) => { g.fillStyle = '#d6c39a'; g.fillRect(0, 0, w, h); noise(g, w, h, r, 40, [1, 0.9, 0.7]); });
  return {
    asphalt: mat(0xffffff, 0.9, { map: asphalt }),
    bike: mat(0xffffff, 0.9, { map: red }),
    pavement: mat(0xffffff, 0.95, { map: pavement }),
    garden: mat(0xffffff, 1, { map: grass('#5f9f45') }),
    park: mat(0xffffff, 1, { map: grass('#6bb04c') }),
    gravel: mat(0xffffff, 1, { map: gravel }),
  };
}

// Parked cars of all sorts: cars without a type get one (no longer than a car, to fit its space).
function buildCars(ctx, cars) {
  for (const c of cars) if (!c.type) Object.assign(c, randomCar(ctx.r, { short: true }), c.c ? { c: c.c } : {});
  addCars(ctx.group, cars);
  ctx.updaters.push(flashBeacons);
}

// ------------------------------------------------------------------ A real neighbourhood (OpenStreetMap)

// Built from a map made by js/osmbuild.js: real street lines, building outlines, parks and water.
const BIG_WALLS = LOOK?.bigWalls ?? ['#c9c3b8', '#b8b0a2', '#d8d2c6', '#a9a397', '#e2ddd2', '#c4b5a0'];
const BIG_KINDS = new Set(['school', 'industrial', 'commercial', 'apartments', 'retail', 'warehouse', 'office', 'university',
  'public', 'civic', 'church', 'hospital', 'college', 'sports_hall', 'kindergarten', 'hotel']);
const SMALL_KINDS = new Set(['garage', 'garages', 'shed', 'roof', 'carport', 'hut', 'greenhouse']);
const STONE_KINDS = new Set(['church', 'cathedral', 'chapel', 'part']); // 'part': a tower or spire (building:part)
const BOAT_KINDS = new Set(['houseboat', 'boat', 'ship']); // moored in the water: drawn as boats (mooredBoats), not houses
const STONE_TILE = 9; // metres of wall per repeat of the stone texture
const FLOOR = 3.4; // game metres per storey (the map is scaled up a little)
const MODULE = 6.5; // one house front of the facade texture, in metres along a wall
const hashOf = i => ((Math.imul(i + 1, 2654435761) >>> 0) % 100000) / 100000;
// a building's key in LOOKS: the average of its outline's corners, to 0.1 m (as tools/street.mjs has it)
function centreKey(p) {
  let x = 0, z = 0;
  for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; }
  return `${+((2 * x) / p.length).toFixed(1)},${+((2 * z) / p.length).toFixed(1)}`;
}

// A front in a city whose LOOK has style: 'italian' (js/italian.js): plaster over the whole
// wall, then draw(g) in the usual frame (128 a house wide, 80 a storey), at twice the resolution,
// as its window frames and iron railings are finer than Ghent's bricks.
function italianTexture(wall, floors, r, draw) {
  return canvasTexture(256, 160 * floors, (g, w, h) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    noise(g, w, h, r, 12, [1, 0.9, 0.72]);
    g.scale(2, 2);
    draw(g);
  });
}

// A row-house front with the given number of storeys: two windows upstairs, a window and the door below.
function floorsTexture(wall, brick, door, floors, r, v = 0, tint = false) {
  if (PLASTER) {
    return italianTexture(wall, floors, r, g => {
      manner.upper(g, floors, LOOK.shutters, v, r);
      manner.ground(g, (floors - 1) * 80, door, v);
    });
  }
  return canvasTexture(128, 80 * floors, (g, w, h) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    noise(g, w, h, r, brick ? 24 : 10, [1, 0.85, 0.75]);
    if (brick) {
      g.fillStyle = 'rgba(255,255,255,0.08)';
      for (let y = 0; y < h; y += 5) g.fillRect(0, y, w, 1);
    }
    if (tint) tintable(g, w, h);
    const win = (x, y, ww, hh) => {
      g.fillStyle = '#f5f1e8';
      g.fillRect(x - 3, y - 3, ww + 6, hh + 6);
      const glass = g.createLinearGradient(x, y, x + ww, y + hh);
      glass.addColorStop(0, '#6f879a');
      glass.addColorStop(1, '#22303c');
      g.fillStyle = glass;
      g.fillRect(x, y, ww, hh);
      g.fillStyle = '#f5f1e8';
      g.fillRect(x + ww / 2 - 1.5, y, 3, hh);
      g.fillRect(x, y + hh * 0.38, ww, 3);
    };
    // where the city has them (LOOK.shutters), louvred shutters folded open beside the windows
    // upstairs, and a little stone balcony under one of them
    const shutters = LOOK?.shutters;
    for (let f = 0; f < floors - 1; f++) {
      for (const x of [18, 76]) {
        win(x, f * 80 + 16, 34, 46);
        if (!shutters) continue;
        g.fillStyle = shutters[(f + x) % shutters.length];
        g.fillRect(x - 12, f * 80 + 13, 9, 52);
        g.fillRect(x + 37, f * 80 + 13, 9, 52);
        g.fillStyle = 'rgba(0,0,0,0.25)';
        for (let y = f * 80 + 16; y < f * 80 + 63; y += 4) { g.fillRect(x - 12, y, 9, 1); g.fillRect(x + 37, y, 9, 1); }
      }
      if (shutters && f % 2 === 0) {
        g.fillStyle = 'rgba(255,250,235,0.9)';
        g.fillRect(70, f * 80 + 62, 46, 5);
        g.fillStyle = 'rgba(60,50,40,0.6)';
        for (let x = 72; x < 116; x += 6) g.fillRect(x, f * 80 + 67, 2, 9);
        g.fillRect(70, f * 80 + 75, 46, 2);
      }
    }
    const y0 = (floors - 1) * 80;
    win(14, y0 + 20, 50, 40);
    g.fillStyle = '#f5f1e8';
    g.fillRect(78, y0 + 10, 38, 70);
    g.fillStyle = door;
    g.fillRect(82, y0 + 14, 30, 66);
    g.fillStyle = '#e2c25a';
    g.fillRect(105, y0 + 50, 4, 4);
  });
}

// Flats, schools and workshops: bands of wide windows, no front doors.
function blockTexture(wall, floors, r, v = 0) {
  // in an Italian town the big buildings are palazzi: the same fronts, a grander door
  if (PLASTER) {
    return italianTexture(wall, floors, r, g => {
      manner.upper(g, floors, LOOK.shutters, v + 1, r);
      manner.ground(g, (floors - 1) * 80, DOORS[v % DOORS.length], v);
    });
  }
  return canvasTexture(128, 64 * floors, (g, w, h) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    noise(g, w, h, r, 12, [1, 1, 1]);
    for (let f = 0; f < floors; f++) {
      for (let k = 0; k < 3; k++) {
        g.fillStyle = '#2f3d4a';
        g.fillRect(8 + k * 40, f * 64 + 14, 32, 34);
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.fillRect(8 + k * 40, f * 64 + 14, 32, 6);
      }
      g.fillStyle = 'rgba(0,0,0,0.12)';
      g.fillRect(0, f * 64 + 58, w, 3);
    }
  });
}

// A narrow workers' house (a QUARTER's front: 'worker'): downstairs a door with a fanlight to one
// side and one wide window beside it, under shallow arches, over a dark plinth; upstairs one wide
// window over the one below, and sometimes a small one over the door. `flip` puts the door on the
// right, `small` adds the window over it, `white` gives it a white door of frosted panels, `knee`
// a low strip of wall over the top storey, under the eaves, with a small window in it (KNEE pixels).
const KNEE = 28;
// (tint: wall is NEUTRAL, tintable, and light says whether the colour it is tinted is a light one)
function workerTexture(wall, brick, door, floors, r, { flip = false, small = false, white = false, knee = false, tint = false, light: lit } = {}) {
  const K = knee ? KNEE : 0;
  return canvasTexture(128, 80 * floors + K, (g, w, h) => {
    const light = lit ?? rgbOf(wall).reduce((s, v) => s + v, 0) > 560;
    g.fillStyle = wall;
    g.fillRect(0, 0, w, h);
    noise(g, w, h, r, brick ? 22 : 8, [1, 0.9, 0.8]);
    if (brick) {
      // courses and staggered joints: dark mortar on white glazed brick, pale on red
      g.fillStyle = light ? 'rgba(60,60,60,0.16)' : 'rgba(255,255,255,0.1)';
      for (let y = 0; y < h; y += 5) {
        g.fillRect(0, y, w, 1);
        for (let x = (y / 5) % 2 ? 0 : 6; x < w; x += 12) g.fillRect(x, y, 1, 5);
      }
    }
    if (tint) tintable(g, w, h);
    if (flip) { g.translate(w, 0); g.scale(-1, 1); }
    const trim = '#f4f2ec', sill = '#55595c';
    // a shallow arch over an opening: rowlock bricks on brick, a darker reveal on plaster
    const arched = (x, y, ww, hh, rise) => {
      g.beginPath();
      g.moveTo(x, y + hh); g.lineTo(x, y + rise); g.quadraticCurveTo(x + ww / 2, y - rise, x + ww, y + rise); g.lineTo(x + ww, y + hh);
      g.closePath();
    };
    const head = (x, y, ww, hh) => {
      g.fillStyle = brick ? shade(wall, light ? -0.12 : -0.2) : shade(wall, -0.15);
      // (part of the wall, so tinted with it)
      if (tint) g.globalCompositeOperation = 'source-atop';
      arched(x - 3, y - 4, ww + 6, hh + 4, 4); g.fill();
      g.globalCompositeOperation = 'source-over';
    };
    const glass = (x, y, ww, hh) => {
      const gr = g.createLinearGradient(x, y, x + ww, y + hh);
      gr.addColorStop(0, '#7890a2'); gr.addColorStop(1, '#22303c');
      g.fillStyle = gr;
      g.fillRect(x, y, ww, hh);
    };
    // a wide window: white frame, a fanlight over two casements, a blue stone sill
    const win = (x, y, ww, hh) => {
      head(x, y, ww, hh);
      g.fillStyle = trim; arched(x, y, ww, hh, 3); g.fill();
      g.save(); arched(x + 3, y + 3, ww - 6, hh - 6, 3); g.clip(); glass(x, y, ww, hh); g.restore();
      g.fillStyle = trim;
      g.fillRect(x, y + hh * 0.3, ww, 3);
      g.fillRect(x + ww / 2 - 1.5, y + hh * 0.3, 3, hh * 0.7);
      g.fillStyle = sill; g.fillRect(x - 3, y + hh, ww + 6, 3);
    };
    if (knee) {
      // the knee wall's small window, over the upstairs one
      g.fillStyle = trim; g.fillRect(66, 9, 36, 15);
      glass(69, 12, 30, 9);
      g.fillStyle = trim; g.fillRect(83, 12, 2, 9);
      g.fillStyle = sill; g.fillRect(64, 24, 40, 2);
      g.translate(0, K);
    }
    for (let f = 0; f < floors - 1; f++) {
      const y = f * 80;
      win(62, y + 14, 44, 50);
      if (small) win(16, y + 22, 20, 36);
    }
    // the ground floor
    const G = (floors - 1) * 80;
    g.fillStyle = brick ? sill : '#4a5562'; g.fillRect(-2, G + 66, w + 4, 14); // the plinth
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(-2, G + 66, w + 4, 2);
    win(62, G + 10, 44, 46);
    // the door: frame, fanlight, then a wooden door or a white one with frosted panels, a step
    head(14, G + 8, 24, 70);
    g.fillStyle = trim; arched(14, G + 8, 24, 70, 3); g.fill();
    g.save(); arched(17, G + 11, 18, 12, 3); g.clip(); glass(17, G + 6, 18, 18); g.restore();
    g.fillStyle = white ? '#ecebe6' : door;
    g.fillRect(17, G + 25, 18, 51);
    if (white) {
      g.fillStyle = '#c3ccd1';
      for (let k = 0; k < 3; k++) g.fillRect(20, G + 28 + k * 16, 12, 13);
    } else {
      g.fillStyle = shade(door, -0.25);
      g.fillRect(20, G + 29, 12, 18); g.fillRect(20, G + 52, 12, 20);
    }
    g.fillStyle = white ? '#9aa1a6' : '#e2c25a'; g.fillRect(31, G + 50, 2, 6); // the handle
    g.fillStyle = sill; g.fillRect(12, G + 76, 28, 4); // the step
    // the gutter along the top
    g.fillStyle = '#2a2c2e'; g.fillRect(-2, -K, w + 4, 3);
    g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(-2, 3 - K, w + 4, 2);
  });
}

// The fronts a QUARTER (<city>/city.js) can give its houses, by name: (wall, brick, door, floors, r, variant)
const QUARTER_FRONTS = { worker: workerTexture };
// edge k of an outline: its start, direction and length
function edgeOf(p, k) {
  const n = p.length / 2, ax = p[k * 2], az = p[k * 2 + 1], dx = p[((k + 1) % n) * 2] - ax, dz = p[((k + 1) % n) * 2 + 1] - az;
  return { ax, az, dx, dz, L: Math.hypot(dx, dz) };
}
// how many house fronts `module` wide a street front L long takes, when they fit on it without
// being squeezed or stretched by more than a quarter (else 0)
function fitFronts(L, module) {
  const n = Math.max(1, Math.round(L / module)), w = L / n;
  return w > module * 0.75 && w < module * 1.25 ? n : 0;
}
// the quarter a house stands in, by its first corner
const quarterOf = (x, z) => (QUARTERS ?? []).find(q => QUARTER_FRONTS[q.front] && pointIn(x, z, q.ring));

// Grey Gothic stone: courses of blocks and a tall pointed window, repeated up the wall.
function stoneTexture(r) {
  const t = canvasTexture(128, 160, (g, w, h) => {
    g.fillStyle = LOOK?.stone ?? '#b3ab9c';
    g.fillRect(0, 0, w, h);
    noise(g, w, h, r, 26, [1, 0.97, 0.9]);
    g.fillStyle = 'rgba(60,50,40,0.18)';
    for (let y = 0; y < h; y += 16) {
      g.fillRect(0, y, w, 2);
      for (let x = (y / 16) % 2 ? 0 : 20; x < w; x += 40) g.fillRect(x, y, 2, 16);
    }
    g.fillStyle = '#3a4048';
    g.beginPath();
    g.moveTo(46, 140);
    g.lineTo(46, 52);
    g.quadraticCurveTo(46, 22, 64, 14);
    g.quadraticCurveTo(82, 22, 82, 52);
    g.lineTo(82, 140);
    g.fill();
    g.fillStyle = 'rgba(200,190,170,0.5)';
    g.fillRect(62, 24, 4, 116);
    g.fillRect(46, 80, 36, 3);
  });
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Vertices for one merged mesh.
// Numbers pushed onto a typed array that doubles when full: half the memory of a plain array while
// the city is built, and there are millions of them.
class Grow {
  constructor(Type) { this.Type = Type; this.a = new Type(256); this.length = 0; }
  room(n) {
    if (this.length + n <= this.a.length) return;
    const b = new this.Type(Math.max(this.a.length * 2, this.length + n));
    b.set(this.a);
    this.a = b;
  }
  push(...v) {
    this.room(v.length);
    for (const x of v) this.a[this.length++] = x;
  }
  done() { return this.a.slice(0, this.length); } // trimmed to size
}

// (coloured: its corners take the colour of this.tint, a THREE.Color, as they come)
class Batch {
  constructor(coloured = false) {
    this.pos = new Grow(Float32Array); this.nrm = new Grow(Float32Array); this.uv = new Grow(Float32Array); this.idx = new Grow(Uint32Array);
    this.col = coloured ? new Grow(Float32Array) : null;
  }
  get count() { return this.pos.length / 3; }
  vert(x, y, z, nx, ny, nz, u, v) {
    this.pos.push(x, y, z);
    this.nrm.push(nx, ny, nz);
    this.uv.push(u, v);
    this.col?.push(this.tint.r, this.tint.g, this.tint.b);
    return this.pos.length / 3 - 1;
  }
  // a triangle facing up, whichever way round its corners come
  up(a, b, c) {
    const P = this.pos.a;
    const ny = (P[b * 3 + 2] - P[a * 3 + 2]) * (P[c * 3] - P[a * 3]) - (P[b * 3] - P[a * 3]) * (P[c * 3 + 2] - P[a * 3 + 2]);
    if (ny >= 0) this.idx.push(a, b, c);
    else this.idx.push(a, c, b);
  }
  mesh(ctx, material, { shadow = false } = {}) {
    if (!this.idx.length) return null;
    const geo = new THREE.BufferGeometry(), idx = this.idx.done();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos.done(), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(this.nrm.done(), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(this.uv.done(), 2));
    if (this.col) geo.setAttribute('color', new THREE.BufferAttribute(this.col.done(), 3));
    geo.setIndex(new THREE.BufferAttribute(this.count > 65535 ? idx : Uint16Array.from(idx), 1));
    this.pos = this.nrm = this.uv = this.idx = this.col = null; // built: let the numbers go
    const m = new THREE.Mesh(geo, material);
    m.castShadow = shadow;
    m.receiveShadow = true;
    m.userData.still = true; // it never changes, so js/tiles.js may cut it up
    ctx.group.add(m);
    return m;
  }
}

// A flat polygon (x, z pairs) lying at height y.
function flatPolygon(batch, p, y, tile) {
  const contour = [];
  for (let k = 0; k < p.length; k += 2) contour.push(new THREE.Vector2(p[k], p[k + 1]));
  const tris = THREE.ShapeUtils.triangulateShape(contour, []);
  const base = batch.count;
  for (const v of contour) batch.vert(v.x, y, v.y, 0, 1, 0, v.x / tile, v.y / tile);
  for (const [a, b, c] of tris) batch.up(base + a, base + b, base + c);
}

// A polyline painted on the ground w wide, with round joints. ys: a height for each point (bridges).
function groundStrip(batch, p, w, y, tile, ys = null) {
  const v = (x, z, k) => batch.vert(x, y + (ys ? ys[k / 2] : 0), z, 0, 1, 0, x / tile, z / tile);
  for (let k = 0; k + 3 < p.length; k += 2) {
    const ax = p[k], az = p[k + 1], bx = p[k + 2], bz = p[k + 3];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) continue;
    const nx = (-(bz - az) / L) * w / 2, nz = ((bx - ax) / L) * w / 2;
    const a = v(ax + nx, az + nz, k), b = v(ax - nx, az - nz, k), c = v(bx - nx, bz - nz, k + 2), d = v(bx + nx, bz + nz, k + 2);
    batch.up(a, b, c);
    batch.up(a, c, d);
  }
  // which way the segment from point i to point j runs, or null
  const dir = (i, j) => {
    if (!ys || j < 0 || j >= p.length) return null;
    const dx = p[j] - p[i], dz = p[j + 1] - p[i + 1], L = Math.hypot(dx, dz);
    return L < 0.01 ? null : [dx / L, dz / L, j > i ? 2 : -2];
  };
  // how much higher the street is d metres on from point i, going on by step (2 or -2): following
  // its points, so a joint wider than the segments lies on a bridge's arch instead of above it
  const rise = (i, step, d) => {
    let k = i;
    while (d > 0 && k + step >= 0 && k + step < p.length) {
      const L = Math.max(Math.hypot(p[k + step] - p[k], p[k + step + 1] - p[k + 1]), 0.01);
      if (d <= L) return ys[k / 2] + ((ys[(k + step) / 2] - ys[k / 2]) * d) / L - ys[i / 2];
      d -= L;
      k += step;
    }
    return ys[k / 2] - ys[i / 2];
  };
  for (let k = 0; k < p.length; k += 2) {
    const c = v(p[k], p[k + 1], k), ring = [];
    // on a slope a joint tilts with the street, else half of it would poke up through the street
    const ahead = dir(k, k + 2), behind = dir(k, k - 2);
    // up a slope a joint is only drawn where the street turns: a round end, or one where it runs
    // straight on, would stick out over the street carrying on at another slope
    if (ys && (ys[k / 2] > 0.05 || (ahead && ys[k / 2 + 1] > 0.05) || (behind && ys[k / 2 - 1] > 0.05))) {
      if (!ahead || !behind || ahead[0] * behind[0] + ahead[1] * behind[1] < -0.985) continue;
    }
    for (let s = 0; s < 8; s++) {
      const ox = Math.cos(s * Math.PI / 4) * w / 2, oz = Math.sin(s * Math.PI / 4) * w / 2;
      // follow whichever of the two segments this side of the joint lies along
      let h = 0, best = 0;
      for (const sl of [ahead, behind]) {
        const along = sl ? ox * sl[0] + oz * sl[1] : 0;
        if (along > best) { best = along; h = rise(k, sl[2], along); }
      }
      const q = v(p[k] + ox, p[k + 1] + oz, k);
      batch.pos.a[q * 3 + 1] += h;
      ring.push(q);
    }
    for (let s = 0; s < 8; s++) batch.up(c, ring[s], ring[(s + 1) % 8]);
  }
}

// The sides of a raised street w wide: walls down to the ground where it climbs, a deck `thick`
// deep under a bridge, and a parapet `parapet` high along a bridge's edges. A flat bridge (rd.br 2)
// lies level with the quays: its deck reaches down below them, towards the water.
function raisedSides(walls, rd, w, thick, parapet) {
  const p = rd.p, ys = rd.y, low = rd.br === 2 ? -0.05 : 0.1;
  const quad = (ax, az, ay0, ay1, bx, bz, by0, by1, nx, nz) => {
    const a = walls.vert(ax, ay0, az, nx, 0, nz, 0, 0), b = walls.vert(bx, by0, bz, nx, 0, nz, 1, 0);
    const c = walls.vert(bx, by1, bz, nx, 0, nz, 1, 1), d = walls.vert(ax, ay1, az, nx, 0, nz, 0, 1);
    walls.idx.push(a, b, c, a, c, d);
  };
  for (let k = 0; k + 3 < p.length; k += 2) {
    const ha = ys[k / 2], hb = ys[k / 2 + 1];
    if (ha < low && hb < low) continue;
    const ax = p[k], az = p[k + 1], bx = p[k + 2], bz = p[k + 3], L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) continue;
    const ux = -(bz - az) / L, uz = (bx - ax) / L;
    for (const s of [1, -1]) {
      const ox = ux * s * w / 2, oz = uz * s * w / 2;
      const down = h => (!thick ? 0 : rd.br === 2 ? h - thick : Math.max(0, h - thick));
      quad(ax + ox, az + oz, down(ha), ha + 0.04, bx + ox, bz + oz, down(hb), hb + 0.04, ux * s, uz * s);
      if (parapet) quad(ax + ox, az + oz, ha, ha + parapet, bx + ox, bz + oz, hb, hb + parapet, ux * s, uz * s);
    }
  }
}

// The railings of a flat bridge, w apart: a handrail and a bottom rail on a post every 1.5 m.
function railings(batch, rd, w) {
  const p = rd.p, ys = rd.y, H = 1.05, bar = 0.07;
  const quad = (ax, az, ay0, ay1, bx, bz, by0, by1, nx, nz) => {
    const a = batch.vert(ax, ay0, az, nx, 0, nz, 0, 0), b = batch.vert(bx, by0, bz, nx, 0, nz, 1, 0);
    const c = batch.vert(bx, by1, bz, nx, 0, nz, 1, 1), d = batch.vert(ax, ay1, az, nx, 0, nz, 0, 1);
    batch.idx.push(a, b, c, a, c, d);
  };
  let run = 0;
  for (let k = 0; k + 3 < p.length; k += 2) {
    const ha = ys[k / 2], hb = ys[k / 2 + 1];
    const ax = p[k], az = p[k + 1], bx = p[k + 2], bz = p[k + 3], L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) continue;
    const tx = (bx - ax) / L, tz = (bz - az) / L, ux = -tz, uz = tx;
    for (const s of [1, -1]) {
      const ox = ux * s * w / 2, oz = uz * s * w / 2;
      for (const y of [H - bar, 0.18]) quad(ax + ox, az + oz, ha + y, ha + y + bar, bx + ox, bz + oz, hb + y, hb + y + bar, ux * s, uz * s);
      for (let d = (1.5 - (run % 1.5)) % 1.5; d < L; d += 1.5) {
        const x = ax + tx * d + ox, z = az + tz * d + oz, y = ha + (hb - ha) * (d / L);
        quad(x - tx * 0.03, z - tz * 0.03, y, y + H, x + tx * 0.03, z + tz * 0.03, y, y + H, ux * s, uz * s);
      }
    }
    run += L;
  }
}

function pointIn(x, z, p) {
  let hit = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const ax = p[i], az = p[i + 1], bx = p[j], bz = p[j + 1];
    if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) hit = !hit;
  }
  return hit;
}

// pointIn for a polygon asked about many times: its edges sorted into bands BAND metres deep
// across z, so each point only looks at the edges in its own band (a river's outline has thousands).
function inside(p, BAND = 8) {
  const bands = new Map();
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const lo = Math.floor(Math.min(p[i + 1], p[j + 1]) / BAND), hi = Math.floor(Math.max(p[i + 1], p[j + 1]) / BAND);
    for (let b = lo; b <= hi; b++) {
      if (!bands.has(b)) bands.set(b, []);
      bands.get(b).push(p[i], p[i + 1], p[j], p[j + 1]);
    }
  }
  return (x, z) => {
    const e = bands.get(Math.floor(z / BAND));
    let hit = false;
    if (e) {
      for (let k = 0; k < e.length; k += 4) {
        const ax = e[k], az = e[k + 1], bx = e[k + 2], bz = e[k + 3];
        if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) hit = !hit;
      }
    }
    return hit;
  };
}

function polyArea(p) {
  let a = 0;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) a += p[j] * p[i + 1] - p[i] * p[j + 1];
  return a / 2; // signed
}

// Shops, cafés and restaurants for the ground floor of a house front on a shopping street. Their
// signs carry a name, never the trade: the window, the awning and the terrace tell what it is.
const SHOPS = [
  { names: ['De Gouden Korst', 'Van Hecke & Zn', 'Het Korenaar'], color: '#c98a1b' }, // bakery
  { names: ["'t Pakske", 'Bij Marcel', 'Chez Nadia'], color: '#e53935', terrace: true }, // chip shop
  { names: ['De Vlaamsche Leeuw', "'t Hoekske", 'Pallieter'], color: '#2e7d32', terrace: true }, // café
  { names: ['Da Mario', 'Napoli', 'Bella Vita'], color: '#c62828', terrace: true }, // pizzeria
  { names: ['Van Damme', 'De Mortel'], color: '#43a047' }, // chemist
  { names: ['Studio Lisa', 'Salon Yasmine', 'Knipkunst'], color: '#1e88e5' }, // hairdresser
  { names: ['Anadolu', 'Kervan', 'Bazaar Ege'], color: '#f57c00' }, // grocer
  { names: ['De Lelie', 'Madelief', 'Flora'], color: '#ad1457' }, // florist
  { names: ['Den Draak', 'De Vos', 'Kiekenhof'], color: '#6a1b9a', terrace: true }, // bar
  { names: ['Le Petit Gand', 'Sofra', 'De Smaak'], color: '#5d4037', terrace: true }, // restaurant
  { names: ['Nonstop', 'Ali & Zn', 'Star'], color: '#00838f' }, // night shop
  { names: ['Istanbul', 'Antalya', 'Bosporus'], color: '#ff7043', terrace: true }, // kebab
  { names: ['Gaziantep', 'Saray', 'Tatlı'], color: '#8d6e63' }, // baklava
  { names: ['Paginae', 'Het Leesbeest'], color: '#3949ab' }, // books
];
const SHOP_SHARE = 0.55; // of the house fronts on a shopping street

// Real shops from the map, by the kind the map tool gives them: sign colours, and whether there
// are tables outside. Cafés, restaurants and snack bars show their name on the sign; other shops
// only now and then, else just the colour.
const SHOP_STYLES = {
  restaurant: { colors: ['#5d4037', '#c62828', '#2e7d32', '#1d1a17'], terrace: true, named: 1 },
  cafe: { colors: ['#2e7d32', '#6a1b9a', '#1d1a17', '#8d1c1c'], terrace: true, named: 1 },
  snack: { colors: ['#e53935', '#ff7043', '#f9a825'], terrace: true, named: 1 },
  bakery: { colors: ['#c98a1b', '#8d6e63'], named: 0.4 },
  pharmacy: { colors: ['#43a047'], named: 0.4 },
  hair: { colors: ['#1e88e5', '#ad1457', '#1d1a17'], named: 0.4 },
  grocer: { colors: ['#f57c00', '#00838f', '#2e7d32', '#c62828'], named: 0.4 },
  florist: { colors: ['#ad1457', '#7cb342'], named: 0.4 },
  books: { colors: ['#3949ab'], named: 0.4 },
  clothes: { colors: ['#1d1a17', '#6d4c41', '#3949ab'], named: 0.4 },
  shop: { colors: ['#00838f', '#5e35b1', '#455a64', '#c62828', '#f9a825'], named: 0.4 },
};

// A house front whose ground floor is a shop: a big window full of things, the door, and a blank
// band for the sign. The name goes on the band separately (shopSigns): a texture per shop name,
// over a thousand of them in Ghent, ran a phone out of memory.
function shopTexture(wall, brick, terrace, floors, r, v = 0, tint = false) {
  // in an Italian town the storeys above the shop are the houses' own (js/italian.js)
  const italian = PLASTER, k = italian ? 2 : 1;
  return canvasTexture(128 * k, 80 * floors * k, (g, cw, ch) => {
    g.fillStyle = wall;
    g.fillRect(0, 0, cw, ch);
    noise(g, cw, ch, r, brick ? 24 : 10, [1, 0.85, 0.75]);
    if (tint) tintable(g, cw, ch);
    g.scale(k, k);
    const w = 128;
    if (italian) {
      manner.upper(g, floors, LOOK.shutters, v, r);
    } else {
      const win = (x, y, ww, hh) => {
        g.fillStyle = '#f5f1e8';
        g.fillRect(x - 3, y - 3, ww + 6, hh + 6);
        g.fillStyle = '#2f3d4a';
        g.fillRect(x, y, ww, hh);
        g.fillStyle = '#f5f1e8';
        g.fillRect(x + ww / 2 - 1.5, y, 3, hh);
      };
      // where the city has them (LOOK.shutters), louvred shutters folded open beside the windows
      // upstairs, and a little stone balcony under one of them
      const shutters = LOOK?.shutters;
      for (let f = 0; f < floors - 1; f++) {
        for (const x of [18, 76]) {
          win(x, f * 80 + 16, 34, 46);
          if (!shutters) continue;
          g.fillStyle = shutters[(f + x) % shutters.length];
          g.fillRect(x - 12, f * 80 + 13, 9, 52);
          g.fillRect(x + 37, f * 80 + 13, 9, 52);
          g.fillStyle = 'rgba(0,0,0,0.25)';
          for (let y = f * 80 + 16; y < f * 80 + 63; y += 4) { g.fillRect(x - 12, y, 9, 1); g.fillRect(x + 37, y, 9, 1); }
        }
        if (shutters && f % 2 === 0) {
          g.fillStyle = 'rgba(255,250,235,0.9)';
          g.fillRect(70, f * 80 + 62, 46, 5);
          g.fillStyle = 'rgba(60,50,40,0.6)';
          for (let x = 72; x < 116; x += 6) g.fillRect(x, f * 80 + 67, 2, 9);
          g.fillRect(70, f * 80 + 75, 46, 2);
        }
      }
    }
    const y0 = (floors - 1) * 80;
    g.fillStyle = '#1d1a17';
    g.fillRect(0, y0 + 2, w, 18);
    // the shop window, lit warm for cafés and restaurants, with things on display
    const glass = g.createLinearGradient(0, y0 + 24, 0, y0 + 76);
    glass.addColorStop(0, terrace ? '#ffe7a8' : '#cfe3ee');
    glass.addColorStop(1, terrace ? '#d9913f' : '#6f879a');
    g.fillStyle = '#1d1a17';
    g.fillRect(6, y0 + 22, 82, 56);
    g.fillStyle = glass;
    g.fillRect(9, y0 + 25, 76, 52);
    for (let k = 0; k < 6; k++) {
      g.fillStyle = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#ffffff', '#8e24aa'][Math.floor(r() * 6)];
      g.fillRect(12 + k * 12, y0 + 58 + r() * 8, 8, 10);
    }
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(14, y0 + 28, 6, 30);
    // the door
    g.fillStyle = '#1d1a17';
    g.fillRect(94, y0 + 24, 28, 56);
    g.fillStyle = terrace ? '#ffe7a8' : '#9fc3d8';
    g.fillRect(98, y0 + 28, 20, 34);
  });
}

// The shop signs: every name once in one shared texture, on a thin board in front of the band
// that shopTexture leaves for it, once per house front along the wall.
const SIGN_W = 128, SIGN_H = 18, SIGN_PAD = 2;
function shopSigns(ctx, signs) {
  const cells = new Map();
  for (const s of signs) {
    const key = `${s.shop.color}|${s.shop.name}`;
    if (!cells.has(key)) cells.set(key, { shop: s.shop, i: cells.size });
  }
  const cw = SIGN_W + SIGN_PAD * 2, ch = SIGN_H + SIGN_PAD * 2, cols = 16;
  const W = cw * cols, H = ch * Math.ceil(cells.size / cols);
  const tex = canvasTexture(W, H, g => {
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (const { shop, i } of cells.values()) {
      const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
      g.fillStyle = shop.color; // into the padding too, so the smaller mipmaps keep the colour at the edges
      g.fillRect(x, y, cw, ch);
      if (!shop.name) continue;
      g.fillStyle = '#fff';
      // real names can be long: shrink until it fits on the sign
      let size = 13;
      do g.font = `900 ${size}px Nunito, system-ui, sans-serif`; while (g.measureText(shop.name).width > SIGN_W - 8 && --size > 7);
      g.fillText(shop.name, x + cw / 2, y + SIGN_PAD + 9.5);
    }
  });
  const batch = new Batch();
  for (const s of signs) {
    const { i } = cells.get(`${s.shop.color}|${s.shop.name}`);
    const x = (i % cols) * cw + SIGN_PAD, y = Math.floor(i / cols) * ch + SIGN_PAD;
    const uL = x / W, uR = (x + SIGN_W) / W, vT = 1 - y / H, vB = 1 - (y + SIGN_H) / H;
    const [ua, ub] = s.flip ? [uR, uL] : [uL, uR];
    const ox = s.nx * 0.03, oz = s.nz * 0.03;
    for (let j = 0; j < s.n; j++) {
      const t0 = j / s.n, t1 = (j + 1) / s.n;
      const x0 = s.ax + (s.bx - s.ax) * t0 + ox, z0 = s.az + (s.bz - s.az) * t0 + oz;
      const x1 = s.ax + (s.bx - s.ax) * t1 + ox, z1 = s.az + (s.bz - s.az) * t1 + oz;
      const a0 = batch.vert(x0, s.y0, z0, s.nx, 0, s.nz, ua, vB), b0 = batch.vert(x1, s.y0, z1, s.nx, 0, s.nz, ub, vB);
      const b1 = batch.vert(x1, s.y1, z1, s.nx, 0, s.nz, ub, vT), a1 = batch.vert(x0, s.y1, z0, s.nx, 0, s.nz, ua, vT);
      if (s.ccw) batch.idx.push(a0, b0, b1, a0, b1, a1);
      else batch.idx.push(a0, b1, b0, a0, a1, b1);
    }
  }
  batch.mesh(ctx, mat(0xffffff, 0.9, { map: tex }));
}

// Awnings over the shop windows, and tables and chairs outside the cafés and restaurants.
function shopFronts(ctx, fronts) {
  const stripes = canvasTexture(64, 16, (g, w, h) => {
    for (let x = 0; x < w; x += 16) {
      g.fillStyle = '#ffffff';
      g.fillRect(x, 0, 8, h);
      g.fillStyle = '#d8d8d8';
      g.fillRect(x + 8, 0, 8, h);
    }
  });
  stripes.wrapS = THREE.RepeatWrapping;
  stripes.repeat.set(4, 1);
  const d = ctx.dummy, awnings = [], tables = [], chairs = [], parasols = [], onRails = nearTrams(ctx.cfg.map.trams, 3.4);
  for (const f of fronts) {
    const len = Math.min(f.L - 0.6, 7);
    d.position.set(f.mx, f.y, f.mz);
    d.lookAt(f.mx + f.nx, f.y, f.mz + f.nz);
    d.rotateX(0.35);
    d.scale.set(len, 1, 1.4);
    d.updateMatrix();
    awnings.push({ m: d.matrix.clone(), c: f.shop.color });
    if (!f.shop.terrace) continue;
    // a table or two on the pavement; on a square, like the Korenmarkt, rows of them out under parasols
    for (let row = 0; row < 5; row++) {
      const out = 1.7 + row * 1.7, spots = row === 0 ? (len > 4 ? [-1.3, 1.3] : [0]) : [];
      for (let along = -len / 2 + 0.9; row > 0 && along <= len / 2 - 0.9; along += 1.9) spots.push(along);
      let placed = 0;
      spots.forEach((along, k) => {
        const x = f.mx + f.nx * out + f.ux * along, z = f.mz + f.nz * out + f.uz * along;
        if (ctx.track.distTo(x, z) < ctx.hw + 1.2) return; // no tables in the raced street
        // nor in another street (the streets across a square are its paving, but the tram's rails stay clear), the water or a house
        if (row > 0 && (!ctx.clear?.(x, z, 1, true) || ctx.track.distTo(x, z) < ctx.hw + 3.5 || onRails(x, z))) return;
        if (row > 0 && tables.some(q => Math.abs(q.x - x) < 1.6 && Math.abs(q.z - z) < 1.6)) return; // the next café's terrace
        tables.push({ x, z });
        for (const side of [-1, 1]) chairs.push({ x: x + f.ux * side * 0.55, z: z + f.uz * side * 0.55, yaw: Math.atan2(-f.ux * side, -f.uz * side) });
        if (row > 0 && k % 2 === 0) parasols.push({ x, z, c: f.shop.color });
        placed++;
      });
      if (row > 0 && !placed) break;
    }
  }
  const aw = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.06, 1).translate(0, 0, 0.5), mat(0xffffff, 0.8, { map: stripes }), Math.max(1, awnings.length));
  aw.count = awnings.length;
  awnings.forEach((a, k) => { aw.setMatrixAt(k, a.m); aw.setColorAt(k, new THREE.Color(a.c)); });
  aw.castShadow = true;
  ctx.group.add(aw);
  const place = (dd, t) => resetDummy(dd, t.x, 0.03, t.z, t.yaw ?? 0);
  instanced(ctx, new THREE.CylinderGeometry(0.38, 0.38, 0.04, 14).translate(0, 0.74, 0), mat(0xf5f1e8, 0.6), tables, place);
  instanced(ctx, new THREE.CylinderGeometry(0.04, 0.06, 0.74, 6).translate(0, 0.37, 0), mat(0x37474f, 0.5), tables, place);
  const chairGeo = mergeGeometries([
    new THREE.BoxGeometry(0.42, 0.05, 0.42).translate(0, 0.46, 0),
    new THREE.BoxGeometry(0.42, 0.45, 0.05).translate(0, 0.7, -0.2),
    ...[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z]) => new THREE.BoxGeometry(0.04, 0.46, 0.04).translate(x, 0.23, z)),
  ]);
  instanced(ctx, chairGeo, mat(0x6d4c41, 0.7), chairs, place);
  if (parasols.length) {
    instanced(ctx, new THREE.CylinderGeometry(0.03, 0.03, 2.3, 5).translate(0, 1.15, 0), mat(0xd7d2c8, 0.5), parasols, place, { shadow: false });
    instanced(ctx, new THREE.ConeGeometry(1.15, 0.45, 8).translate(0, 2.4, 0), mat(0xffffff, 0.8), parasols, place, { color: p => new THREE.Color(p.c).lerp(new THREE.Color(0xf5f1e8), 0.35) });
  }
  ctx.chairs = chairs; // for people to sit on (js/sitters.js)
}

// The houses' colours, as [wall, brick?]: the city's own (its LOOK, <city>/city.js), else
// Ghent's: dark red-brown brick, whitewash, sandstone and the blue-grey of Doornik stone, under
// roofs that are mostly slate and dark tiles.
const GENT_WALLS = LOOK?.walls ?? [
  ['#8c3b2a', true], ['#7a3326', true], ['#9a4a33', true], ['#6e3b2c', true], ['#a5563b', true],
  ['#efe9dc', false], ['#e6dcc6', false], ['#dccdab', false], ['#8e949a', false], ['#f6f3ec', false],
];
const GENT_ROOFS = LOOK?.roofs ?? [0x3d4248, 0x34383d, 0x4a4f55, 0x2c2f33, 0x55504b, 0x7a3a2a, 0x8d4a35];
const rgbOf = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
// the wall colour nearest a building:colour from the map, or one read off a photo
function nearestWall(hex, walls = GENT_WALLS) {
  const c = rgbOf(hex);
  let best = 0, bd = Infinity;
  walls.forEach(([w], i) => {
    const d = rgbOf(w).reduce((sum, v, k) => sum + (v - c[k]) ** 2, 0);
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}
// A wall colour read off a photo (LOOKS), as it is rather than the nearest of the city's. Brick if
// it is red-brown (brick reads paler on a dull day than any of the palettes' bricks), else as the
// nearest of the palette's colours is.
function photoWall(hex, walls = GENT_WALLS) {
  const [r, g, b] = rgbOf(hex);
  return [hex, (r > g + 25 && r > b + 35) || walls[nearestWall(hex, walls)][1]];
}
// an Italian town's fronts are drawn otherwise (js/italian.js), and not tinted: a texture per colour
const TINTS = !PLASTER;

// The houses in the old town (OLD_TOWN, <city>/city.js) that turn a gable end to the street or a
// square, by their index: narrow enough for a stepped gable, with open ground just past an end of
// their ridge, so the street sees steps rather than the bare triangle of their roof.
function oldTownGables(map) {
  const found = new Set();
  if (!OLD_TOWN) return found;
  const CELL = 16, grid = new Map(), cell = (x, z) => `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`;
  const near = (x, z, r) => Math.hypot(x - OLD_TOWN.x, z - OLD_TOWN.z) < OLD_TOWN.r + r;
  map.buildings.forEach((b, i) => {
    const p = b.p;
    if (!near(p[0], p[1], 60)) return;
    let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
    for (let k = 0; k < p.length; k += 2) { x0 = Math.min(x0, p[k]); x1 = Math.max(x1, p[k]); z0 = Math.min(z0, p[k + 1]); z1 = Math.max(z1, p[k + 1]); }
    for (let x = Math.floor(x0 / CELL); x <= Math.floor(x1 / CELL); x++) {
      for (let z = Math.floor(z0 / CELL); z <= Math.floor(z1 / CELL); z++) {
        const key = `${x},${z}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(i);
      }
    }
  });
  const built = (x, z, self) => (grid.get(cell(x, z)) ?? []).some(j => j !== self && pointIn(x, z, map.buildings[j].p));
  map.buildings.forEach((b, i) => {
    if (!b.r || b.sg || b.h) return;
    const [cx, cz, ang, ridge, span] = b.r;
    if (span > 12 || !near(cx, cz, 0)) return;
    const o = ridge / 2 + 2.5, dx = Math.cos(ang) * o, dz = Math.sin(ang) * o;
    if (!built(cx + dx, cz + dz, i) || !built(cx - dx, cz - dz, i)) found.add(i);
  });
  return found;
}

// A stepped gable (trapgevel), steps steps up each side: width 1 along z, peak of the roof behind
// it at y = 1, a little higher itself, thickness 1 along x.
function steppedGableGeometry(steps = 5) {
  const w = 0.5 / (steps + 0.5), shape = new THREE.Shape();
  const top = k => 2 * (k + 1) * w + 0.08; // each step just above the roof line behind it
  shape.moveTo(-0.5, 0);
  for (let k = 0; k < steps; k++) {
    shape.lineTo(-0.5 + k * w, top(k));
    shape.lineTo(-0.5 + (k + 1) * w, top(k));
  }
  shape.lineTo(-w / 2, 1.14);
  shape.lineTo(w / 2, 1.14);
  for (let k = steps - 1; k >= 0; k--) {
    shape.lineTo(0.5 - (k + 1) * w, top(k));
    shape.lineTo(0.5 - k * w, top(k));
  }
  shape.lineTo(0.5, 0);
  return new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false }).translate(0, 0, -0.5).rotateY(Math.PI / 2);
}

// A gable end's attic windows, on a see-through picture laid just outside it: the windows only, as
// the gable behind may be stepped or plain. Across the gable (0 to 1) and up it (0 to 1, the ridge
// at the top), so a taller gable gets more rows, each inside the triangle. Made once, for all tiles.
const GABLE_ROWS = [
  [2.2, [[0.15, 0.5, [0.5], 0.16]]],
  [5, [[0.1, 0.33, [0.32, 0.68], 0.12], [0.45, 0.62, [0.5], 0.1]]],
  [9, [[0.08, 0.24, [0.3, 0.7], 0.1], [0.33, 0.47, [0.38, 0.62], 0.08], [0.57, 0.69, [0.5], 0.07]]],
];
const gableWindowTextures = [];
function gableWindows(kind) {
  if (gableWindowTextures[kind]) return gableWindowTextures[kind];
  const t = canvasTexture(256, 256, (g, w, h) => {
    for (const [v0, v1, us, ww] of GABLE_ROWS[kind][1]) {
      for (const u of us) {
        const x = (u - ww / 2) * w, y = (1 - v1) * h, cw = ww * w, ch = (v1 - v0) * h;
        g.fillStyle = '#f5f1e8';
        g.fillRect(x - 4, y - 4, cw + 8, ch + 8);
        const glass = g.createLinearGradient(x, y, x + cw, y + ch);
        glass.addColorStop(0, '#6f879a');
        glass.addColorStop(1, '#22303c');
        g.fillStyle = glass;
        g.fillRect(x, y, cw, ch);
        g.fillStyle = '#f5f1e8';
        g.fillRect(x + cw / 2 - 2, y, 4, ch);
        g.fillRect(x, y + ch * 0.4, cw, 4);
      }
    }
  });
  t.userData.shared = true;
  return (gableWindowTextures[kind] = t);
}
const gableKind = rh => GABLE_ROWS.findLastIndex(([min]) => rh >= min);

// The long fronts round a square, drawn by hand (a square's walls, see <city>/squares.js):
// the one whose `at` is this outline's middle, with the way it looks as a unit vector.
function dressFor(dressed, p) {
  let x = 0, z = 0;
  for (let k = 0; k < p.length; k += 2) { x += p[k]; z += p[k + 1]; }
  const c = [(2 * x) / p.length, (2 * z) / p.length], d = dressed.find(w => Math.hypot(w.at[0] - c[0], w.at[1] - c[1]) < 3);
  return d && { ...d, look: [Math.cos((d.faces * Math.PI) / 180), Math.sin((d.faces * Math.PI) / 180)] };
}

// Which edges of an outline (by their index) carry its drawn front: those looking its way, and of
// those only the ones out at the front, as a wing far behind looking the same way is a side of its own.
function frontEdges(p, signed, dress) {
  const n = p.length / 2, look = dress.look, cand = [];
  for (let k = 0; k < n; k++) {
    const ax = p[k * 2], az = p[k * 2 + 1], bx = p[((k + 1) % n) * 2], bz = p[((k + 1) % n) * 2 + 1];
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
    if (L < 0.05) continue;
    const nx = (signed > 0 ? dz : -dz) / L, nz = (signed > 0 ? -dx : dx) / L;
    if (nx * look[0] + nz * look[1] > 0.8) cand.push([k, ax * look[0] + az * look[1]]);
  }
  const first = Math.max(...cand.map(c => c[1]));
  return new Set(cand.filter(c => c[1] > first - 8).map(c => c[0]));
}

// One drawing across all the edges of an outline that look its way (a front that steps in and out
// is still one front): x across from its left end seen from the square, up to its top, which may
// stand above the roof (gables, statues: the drawing's clear parts let the sky through).
function dressWall(ctx, dress, edges, y0, h) {
  const right = [dress.look[1], -dress.look[0]], along = (x, z) => x * right[0] + z * right[1];
  let lo = Infinity, hi = -Infinity;
  for (const [ax, az, bx, bz] of edges) for (const s of [along(ax, az), along(bx, bz)]) { lo = Math.min(lo, s); hi = Math.max(hi, s); }
  const w = hi - lo, top = Math.max(h, dress.top ?? h), batch = new Batch();
  for (const [ax, az, bx, bz, nx, nz] of edges) {
    const ua = (along(ax, az) - lo) / w, ub = (along(bx, bz) - lo) / w;
    const a0 = batch.vert(ax, y0, az, nx, 0, nz, ua, y0 / top), b0 = batch.vert(bx, y0, bz, nx, 0, nz, ub, y0 / top);
    const b1 = batch.vert(bx, top, bz, nx, 0, nz, ub, 1), a1 = batch.vert(ax, top, az, nx, 0, nz, ua, 1);
    batch.idx.push(a0, b0, b1, a0, b1, a1);
  }
  const paint = () => elevation(w, top, dress.px ?? 14, (g, ww, hh) => dress.draw(g, ww, hh, h));
  const map = letGo(paint(), () => { map.image = paint().image; });
  const m = batch.mesh(ctx, mat(0xffffff, 0.9, { map, alphaTest: 0.5, side: THREE.DoubleSide }), { shadow: true });
  m.name = dress.id;
}

// The houses from the map. What each one is (its walls, its height, its shop, its roof) is worked
// out with the city, and so are the shops' signs, awnings and terraces (people sit at their
// tables); its walls and roof are only built when its tile of the city comes into sight
// (js/tiles.js), and let go again behind the riders.
function osmBuildings(ctx, map) {
  const signs = [], fronts = [], tiles = new Map();
  const shopStreets = new Set(map.shopStreets ?? []);
  const dressed = SQUARES.flatMap(sq => sq.walls ?? []), oldGables = oldTownGables(map);
  map.buildings.forEach((b, i) => {
    if (b.gone || ctx.landmarks.covers(b.p) || BOAT_KINDS.has(b.k)) return; // drawn as its real 3D model instead (gone: by the city's own say), or as a boat
    const p = b.p, signed = polyArea(p), area = Math.abs(signed);
    const dress = dressed.length ? dressFor(dressed, p) : null;
    // a large outline is flats or a school, unless the city maps whole blocks of houses as one
    // (LOOK.houseBlocks: an old town of terraced houses, Lecce's)
    // what the photos of its street say it looks like (LOOKS, <city>/looks.js): a wall colour, and
    // now and then what sort of front it is
    const look = LOOKS?.[centreKey(p)], t = look?.t;
    const big = t === 'block' || (!t && (BIG_KINDS.has(b.k) || (area > 700 && !LOOK?.houseBlocks))), small = SMALL_KINDS.has(b.k);
    const hv = hashOf(i);
    // measured walls (b.e, from a height model) can stand taller than the storeys guessed from OSM
    const floors = Math.max(1, Math.min(b.e != null ? 8 : big ? 6 : 5, b.f));
    const stone = t === 'stone' || !!b.h || (!t && STONE_KINDS.has(b.k)), y0 = b.b ?? 0;
    // a slim tower ends in a spire, inside its real height
    const spire = b.h && area < 400 && LOOK?.spires !== false ? Math.min(b.h * 0.35, Math.sqrt(area) * 1.3) : 0;
    // (a building standing on others, b.b, from there up: a tower on a church, the floors over a passage)
    let h = b.h ? b.h - spire : b.e != null ? Math.max(y0 + 2.5, b.e) : small ? y0 + 3 : y0 + floors * (big ? 3.7 : FLOOR) + 0.4;
    // a house's colours: as its photos show them, its own from the map if it has them, else Ghent's
    // (hc still picks the door, and the texture's variations)
    const hc = look ? nearestWall(look.c) : b.wc ? nearestWall(b.wc) : Math.floor(hv * GENT_WALLS.length);
    const own = look ? photoWall(look.c) : null;
    // its colour given to its corners, its texture shared with every house of its kind (tinted())
    const tint = look && TINTS ? tintOf(look.c) : null;
    let wall, module = MODULE, houseFronts = 0;
    const quarter = stone || big || small || (b.wc && !look) || b.fe == null ? null : quarterOf(p[0], p[1]);
    // the street front, along its edge b.fe
    const fa = b.fe == null ? null : edgeOf(p, b.fe), fit = quarter ? fitFronts(fa.L, quarter.module ?? MODULE) : 0;
    // the quarter's houses all stand as high (QUARTERS' storeys): the height model often has their
    // eaves far too low (3.4 m under a ridge at 14) or a storey too high; only flats stay as measured.
    // So does a house whose front the quarter's fronts do not fit on (a narrow corner house).
    const even = !!quarter?.storeys && !(b.e > 13);
    if (even) h = y0 + (quarter.storeys + KNEE / 80) * FLOOR;
    if (fit) {
      // a quarter's own kind of house front, a whole number of them across the street front (a
      // front they would not fit on keeps Ghent's), in its own colours, the door on either side
      const walls = quarter.walls ?? GENT_WALLS, qc = look ? nearestWall(look.c, walls) : Math.floor(hv * walls.length);
      const [wc, brick] = look ? photoWall(look.c, walls) : walls[qc];
      const flip = hashOf(i + 11) < 0.4, small = hashOf(i + 13) < 0.35, white = hashOf(i + 17) < 0.5;
      const qf = even ? quarter.storeys : floors, light = rgbOf(wc).reduce((s, v) => s + v, 0) > 560;
      wall = [`q${quarter.name}-${tint ? `t${qc}${+brick}${+light}` : look ? wc + +brick : qc}-${qf}-${+flip}${+small}${+white}${+even}`,
        rr => QUARTER_FRONTS[quarter.front](tint ? NEUTRAL : wc, brick, DOORS[qc % DOORS.length], qf, rr, { flip, small, white, knee: even, tint: !!tint, light }), !!tint];
      module = quarter.module ?? MODULE;
      houseFronts = fit;
    } else if (stone) {
      wall = ['stone', rr => stoneTexture(rr)];
    } else if (big || small) {
      const c = Math.floor(hv * BIG_WALLS.length), f = small ? 1 : floors;
      wall = [`b${c}-${f}`, rr => blockTexture(BIG_WALLS[c], f, rr, c)];
    } else {
      const [wc, brick] = own ?? GENT_WALLS[hc], wf = even ? quarter.storeys : floors;
      wall = [`h${tint ? `t${hc}${+brick}` : own ? wc + +brick : hc}-${wf}`, rr => floorsTexture(tint ? NEUTRAL : wc, brick, DOORS[hc % DOORS.length], wf, rr, hc, !!tint), !!tint];
    }
    // on a shopping street, about half the fronts get a shop on the ground floor
    let shop = null;
    if (dress) {
      // its front is drawn by hand, shops and all
    } else if (b.shop && !small && !stone) {
      // a real one: its kind and name from the map
      const [kind, name] = b.shop, st = SHOP_STYLES[kind] ?? SHOP_STYLES.shop;
      shop = { ...st, color: st.colors[Math.floor(hashOf(i + 5) * st.colors.length)], name: hashOf(i + 9) < st.named ? name : '' };
    } else if (!small && !stone && (t === 'shop' || (!t && shopStreets.has(b.st) && hashOf(i + 3) < SHOP_SHARE))) {
      // a map without shops in it, but with shopping streets: made-up ones
      const kind = SHOPS[Math.floor(hashOf(i + 5) * SHOPS.length)];
      shop = { ...kind, name: kind.names[Math.floor(hashOf(i + 9) * kind.names.length)] };
    }
    const shopFloors = Math.min(5, floors);
    let shopWall = null;
    if (shop) {
      const [wc, brick] = own ?? GENT_WALLS[hc];
      shopWall = [`s${tint ? `t${hc}${+brick}` : own ? wc + +brick : hc}-${shopFloors}-${!!shop.terrace}`, rr => shopTexture(tint ? NEUTRAL : wc, brick, !!shop.terrace, shopFloors, rr, hc, !!tint), !!tint];
    }
    let roof = null;
    if (!spire && b.r && (b.t != null || (!big && !small && !stone))) {
      let [cx, cz, ang, ridge, span] = b.r;
      // a row house outside the old town has its ridge along the street, even where the outline,
      // deeper than it is wide, made the map guess it runs back from it (a tall triangle to the street)
      const row = fa && !big && !small && !stone && !b.sg && !LOOK?.houseBlocks && !(OLD_TOWN && Math.hypot(cx - OLD_TOWN.x, cz - OLD_TOWN.z) < OLD_TOWN.r);
      if (row && Math.abs(Math.cos(Math.atan2(fa.dz, fa.dx) - ang)) < 0.5) [ang, ridge, span] = [ang + Math.PI / 2, span, ridge];
      const sg = !!b.sg || oldGables.has(i);
      // measured roofs rise as far as they do; an old house's gable end is steep, behind a stepped
      // gable in the colour of its walls
      let rh = b.t != null ? Math.max(1, b.t - h) : sg ? Math.min(8, Math.max(3, span * 0.7)) : Math.min(5, Math.max(2, span * 0.36));
      // an old-town gable over walls measured low would stand up like a needle: no steeper than 1.2 : 1
      if (!b.sg && sg) rh = Math.min(rh, span * 1.2);
      // and a row house's roof is a low one, about 30 degrees and at most 3 m, mostly out of sight from the street
      if (row) rh = Math.min(rh, 3, Math.max(1, span * 0.29));
      roof = { cx, cz, ang, ridge, span, h, rh, sg, wall: own?.[0] ?? GENT_WALLS[hc][0], c: b.rc ?? GENT_ROOFS[Math.floor(hashOf(i + 7) * GENT_ROOFS.length)] };
    }
    const house = { p, signed, stone, y0, h, spire, wall, tint, module, houseFronts, shop, shopWall, shopFloors, fe: b.fe, roof, dress, frontK: dress ? frontEdges(p, signed, dress) : null };
    eachWall(house, (k, ax, az, bx, bz, nx, nz, L, dx, dz) => {
      if (!shop || k !== b.fe) return;
      // the shop's front: its sign above the window, an awning, a terrace
      let u0 = 0, u1 = Math.max(1, Math.round(L / MODULE));
      const flip = dx * nz - dz * nx < 0, ccw = -dz * nx + dx * nz > 0;
      if (flip) [u0, u1] = [u1, u0];
      // the sign's band in shopTexture: 18 of the 80 pixels of the ground floor, 2 below its top
      const fh = (h - y0) / shopFloors;
      signs.push({ shop, ax, az, bx, bz, nx, nz, flip, ccw, n: Math.abs(u1 - u0), y0: y0 + fh * 60 / 80, y1: y0 + fh * 78 / 80 });
      fronts.push({ shop, L, mx: (ax + bx) / 2, mz: (az + bz) / 2, nx, nz, ux: dx / L, uz: dz / L, y: (h / shopFloors) * 0.7 });
    });
    const key = `${Math.floor(p[0] / TILE)},${Math.floor(p[1] / TILE)}`;
    if (!tiles.has(key)) tiles.set(key, []);
    tiles.get(key).push(house);
  });
  if (signs.length) shopSigns(ctx, signs);
  if (fronts.length) shopFronts(ctx, fronts);
  for (const [key, houses] of tiles) {
    const [i, j] = key.split(',').map(Number);
    // a house belongs to the tile its first corner stands in: give the ones reaching out of it room
    later(ctx.group, (i + 0.5) * TILE, (j + 0.5) * TILE, TILE * 0.71 + 60, () => buildHouses(ctx, houses));
  }
}

// Each wall of a house that is not drawn by hand (a square's dressed fronts are): f(k, its corners,
// its outward normal, its length, its direction).
function eachWall({ p, signed, frontK }, f) {
  const n = p.length / 2;
  for (let k = 0; k < n; k++) {
    const ax = p[k * 2], az = p[k * 2 + 1], bx = p[((k + 1) % n) * 2], bz = p[((k + 1) % n) * 2 + 1];
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
    if (L < 0.05 || frontK?.has(k)) continue;
    f(k, ax, az, bx, bz, (signed > 0 ? dz : -dz) / L, (signed > 0 ? -dx : dx) / L, L, dx, dz);
  }
}

// The walls' textures, shared by the tiles that use them and let go when none does. Each is drawn
// with its own random numbers, so it looks the same each time it is made.
const wallTextures = new Map(); // key -> { tex, users }
function takeWall([key, make]) {
  let w = wallTextures.get(key);
  if (!w) {
    w = { tex: make(mulberry32([...key].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261))), users: 0 };
    w.tex.wrapS = THREE.RepeatWrapping;
    w.tex.userData.shared = true;
    wallTextures.set(key, w);
  }
  w.users++;
  return w.tex;
}
function dropWall(key) {
  const w = wallTextures.get(key);
  if (--w.users) return;
  w.tex.dispose();
  wallTextures.delete(key);
}

// The walls and roofs of a tile's houses, as one group.
function buildHouses(city, houses) {
  const group = new THREE.Group(), ctx = { ...city, group };
  const walls = new Map(), roofCaps = new Batch(), spires = new Batch(), gables = [];
  const batchOf = wall => {
    if (!walls.has(wall[0])) walls.set(wall[0], { batch: new Batch(wall[2]), wall });
    return walls.get(wall[0]).batch;
  };
  for (const house of houses) {
    const { p, signed, stone, y0, h, spire, shop, roof } = house, n = p.length / 2, front = [];
    const batch = batchOf(house.wall), shopBatch = shop ? batchOf(house.shopWall) : null;
    batch.tint = house.tint;
    if (shopBatch) shopBatch.tint = house.tint;
    if (house.frontK) {
      for (let k = 0; k < n; k++) {
        if (!house.frontK.has(k)) continue;
        const ax = p[k * 2], az = p[k * 2 + 1], bx = p[((k + 1) % n) * 2], bz = p[((k + 1) % n) * 2 + 1], L = Math.hypot(bx - ax, bz - az);
        if (L >= 0.05) front.push([ax, az, bx, bz, (signed > 0 ? bz - az : az - bz) / L, (signed > 0 ? ax - bx : bx - ax) / L]);
      }
    }
    let along = 0;
    eachWall(house, (k, ax, az, bx, bz, nx, nz, L, dx, dz) => {
      const isShop = shop && k === house.fe, wb = isShop ? shopBatch : batch;
      // a shop's front, and a quarter's house fronts on the street, a whole number of house fronts across
      const whole = isShop ? Math.max(1, Math.round(L / MODULE)) : k === house.fe && house.houseFronts;
      let u0 = whole ? 0 : along / house.module, u1 = whole || (along + L) / house.module;
      along += L;
      // seen from the street the texture must run left to right, or the signs read backwards
      if (dx * nz - dz * nx < 0) [u0, u1] = [u1, u0];
      const v0 = stone ? y0 / STONE_TILE : 0, v1 = stone ? h / STONE_TILE : 1;
      const a0 = wb.vert(ax, y0, az, nx, 0, nz, u0, v0), b0 = wb.vert(bx, y0, bz, nx, 0, nz, u1, v0);
      const b1 = wb.vert(bx, h, bz, nx, 0, nz, u1, v1), a1 = wb.vert(ax, h, az, nx, 0, nz, u0, v1);
      if (-dz * nx + dx * nz > 0) wb.idx.push(a0, b0, b1, a0, b1, a1);
      else wb.idx.push(a0, b1, b0, a0, a1, b1);
    });
    if (front.length) dressWall(ctx, house.dress, front, y0, h);
    if (spire) {
      let cx = 0, cz = 0;
      for (let k = 0; k < n; k++) { cx += p[k * 2]; cz += p[k * 2 + 1]; }
      const top = spires.vert(cx / n, h + spire, cz / n, 0, 1, 0, 0.5, 1);
      for (let k = 0; k < n; k++) {
        const ax = p[k * 2], az = p[k * 2 + 1], bx = p[((k + 1) % n) * 2], bz = p[((k + 1) % n) * 2 + 1];
        const a = spires.vert(ax, h, az, 0, 1, 0, 0, 0), c = spires.vert(bx, h, bz, 0, 1, 0, 1, 0);
        if (signed > 0) spires.idx.push(a, top, c);
        else spires.idx.push(a, c, top);
      }
    } else if (roof) {
      gables.push(roof);
    } else {
      flatPolygon(roofCaps, p, h, 4);
    }
    if (y0 > 0.5 && !house.stone) flatPolygon(roofCaps, p, y0, 4); // the ceiling of a passage under it
  }
  for (const { batch, wall } of walls.values()) {
    if (!batch.idx.length) continue;
    batch.mesh(ctx, wall[2] ? tinted(takeWall(wall)) : mat(0xffffff, 0.9, { map: takeWall(wall) }), { shadow: true });
  }
  const used = [...walls.values()].filter(w => w.batch.pos === null).map(w => w.wall[0]); // built: its numbers let go
  group.userData.gone = () => used.forEach(dropWall);
  roofCaps.mesh(ctx, mat(LOOK?.flatRoof ?? 0x6e6c69, 0.9, { side: THREE.DoubleSide }), { shadow: true });
  spires.mesh(ctx, mat(0x4f5a5e, 0.7, { side: THREE.DoubleSide, flatShading: true }), { shadow: true });
  if (gables.length) {
    instanced(ctx, roofGeometry(), mat(0xffffff, 0.85, { flatShading: true }), gables, (d, g) => {
      d.position.set(g.cx, g.h, g.cz);
      d.rotation.set(0, -g.ang, 0);
      // behind a stepped gable the roof stops inside it
      d.scale.set(g.ridge + (g.sg ? -0.2 : 0.3), g.rh, g.span + 0.6);
    }, { color: g => new THREE.Color(g.c) });
  }
  // a plain gable's ends in the colour of its walls, over the roof's own (in the roof's colour)
  const ends = gables.flatMap(g => [{ ...g, e: 1 }, { ...g, e: -1 }]);
  const plain = ends.filter(g => !g.sg);
  if (plain.length) {
    const tri = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)])).rotateY(Math.PI / 2);
    instanced(ctx, tri, mat(0xffffff, 0.9), plain, (d, g) => {
      const o = g.e * ((g.ridge + 0.3) / 2 + 0.02);
      d.position.set(g.cx + Math.cos(g.ang) * o, g.h, g.cz + Math.sin(g.ang) * o);
      d.rotation.set(0, -g.ang + (g.e < 0 ? Math.PI : 0), 0);
      d.scale.set(1, g.rh, g.span + 0.6);
    }, { color: g => new THREE.Color(g.wall), shadow: false });
  }
  // and attic windows in every gable end, stepped or plain, as many rows as it is tall
  const quad = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0).rotateY(Math.PI / 2);
  for (let kind = 0; kind < GABLE_ROWS.length; kind++) {
    const these = ends.filter(g => gableKind(g.rh) === kind);
    if (!these.length) continue;
    instanced(ctx, quad, mat(0xffffff, 0.6, { map: gableWindows(kind), alphaTest: 0.5 }), these, (d, g) => {
      const o = g.e * (g.sg ? g.ridge / 2 + 0.06 : (g.ridge + 0.3) / 2 + 0.05);
      d.position.set(g.cx + Math.cos(g.ang) * o, g.h, g.cz + Math.sin(g.ang) * o);
      d.rotation.set(0, -g.ang + (g.e < 0 ? Math.PI : 0), 0);
      d.scale.set(1, g.rh, g.sg ? g.span + 0.3 : g.span + 0.6);
    }, { shadow: false });
  }
  // the stepped gables, at both ends of the ridge
  const stepped = ends.filter(g => g.sg);
  if (stepped.length) {
    instanced(ctx, steppedGableGeometry(), mat(0xffffff, 0.9), stepped, (d, g) => {
      const o = g.e * (g.ridge / 2 - 0.2);
      d.position.set(g.cx + Math.cos(g.ang) * o, g.h - 0.02, g.cz + Math.sin(g.ang) * o);
      d.rotation.set(0, -g.ang, 0);
      d.scale.set(0.45, g.rh, g.span + 0.3);
    }, { color: g => new THREE.Color(g.wall).multiplyScalar(0.9) });
  }
  return group;
}

// The canals and the river lie a little below the streets, between quay walls. The ground has a
// hole cut where the water is (a stencil mask drawn before it), so the water shows through.
// Is (x, z) on or next to a footpath, a quiet street or a paved square? For the steps down to the water.
function nearFoot(map) {
  const CELL = 16, grid = new Map(), key = (i, j) => (i + 4096) * 8192 + (j + 4096);
  const wide = []; // the river's polygon spans the whole map: in every cell it would cost ~70 MB
  const add = (b, x0, z0, x1, z1) => {
    const i0 = Math.floor(x0 / CELL), i1 = Math.floor(x1 / CELL), j0 = Math.floor(z0 / CELL), j1 = Math.floor(z1 / CELL);
    if ((i1 - i0 + 1) * (j1 - j0 + 1) > 1024) { wide.push({ b, i0, i1, j0, j1 }); return; }
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        if (!grid.has(key(i, j))) grid.set(key(i, j), []);
        grid.get(key(i, j)).push(b);
      }
    }
  };
  for (const rd of map.roads) {
    if ((!rd.foot && rd.w > 9) || rd.br) continue;
    for (let k = 0; k + 3 < rd.p.length; k += 2) {
      const b = { p: rd.p.slice(k, k + 4), half: rd.w / 2 + (rd.foot ? 2 : 3.5) };
      add(b, Math.min(b.p[0], b.p[2]) - b.half, Math.min(b.p[1], b.p[3]) - b.half, Math.max(b.p[0], b.p[2]) + b.half, Math.max(b.p[1], b.p[3]) + b.half);
    }
  }
  for (const a of map.areas) {
    if (a.k !== 'paved') continue;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let k = 0; k < a.p.length; k += 2) { x0 = Math.min(x0, a.p[k]); x1 = Math.max(x1, a.p[k]); z0 = Math.min(z0, a.p[k + 1]); z1 = Math.max(z1, a.p[k + 1]); }
    add({ poly: a.p }, x0, z0, x1, z1);
  }
  return (x, z) => (grid.get(key(Math.floor(x / CELL), Math.floor(z / CELL))) ?? []).some(b => {
    if (b.poly) return pointIn(x, z, b.poly);
    const [ax, az, bx, bz] = b.p, dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
    return Math.hypot(x - ax - t * dx, z - az - t * dz) < b.half;
  });
}

// A flight of steps down a quay wall to the water, like those along the Graslei: it runs along x
// from the top (x = 0) to the water (x = 3), sticking out 1.3 m into the water along +z.
function quayStepsGeometry() {
  const n = 6, depth = -WATER + 0.3, parts = [];
  for (let k = 0; k < n; k++) {
    const top = -(k / n) * depth;
    parts.push(new THREE.BoxGeometry(3 / n, top + depth, 1.3).translate((k + 0.5) * 3 / n, (top - depth) / 2, 0.65));
  }
  return mergeGeometries(parts);
}

function sunkenWater(ctx, map, layers, foot = () => false) {
  const bodies = []; // { poly } or { p: [ax, az, bx, bz], half }, to tell the water's edge
  // (a body spanning many cells is not put in each, but kept aside with the cells it spans)
  const grid = new Map(), wide = [], CELL = 16, key = (i, j) => (i + 4096) * 8192 + (j + 4096);
  const add = (b, x0, z0, x1, z1) => {
    b.n = bodies.push(b) - 1;
    const i0 = Math.floor(x0 / CELL), i1 = Math.floor(x1 / CELL), j0 = Math.floor(z0 / CELL), j1 = Math.floor(z1 / CELL);
    if ((i1 - i0 + 1) * (j1 - j0 + 1) > 256) { wide.push({ b, i0, i1, j0, j1 }); return; }
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        if (!grid.has(key(i, j))) grid.set(key(i, j), []);
        grid.get(key(i, j)).push(b);
      }
    }
  };
  const mask = new Batch(), water = layers.water[0];
  for (const a of map.areas) {
    if (a.k !== 'water') continue;
    flatPolygon(water, a.p, a.level ?? WATER, 12);
    flatPolygon(mask, a.p, 0, 12);
    const b = { poly: a.p, in: inside(a.p), level: a.level ?? WATER, bank: a.bank };
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let k = 0; k < a.p.length; k += 2) { x0 = Math.min(x0, a.p[k]); x1 = Math.max(x1, a.p[k]); z0 = Math.min(z0, a.p[k + 1]); z1 = Math.max(z1, a.p[k + 1]); }
    add(b, x0, z0, x1, z1);
  }
  for (const w of map.water) {
    groundStrip(water, w.p, w.w, WATER - 0.002, 12);
    groundStrip(mask, w.p, w.w, 0, 12);
    for (let k = 0; k + 3 < w.p.length; k += 2) {
      const b = { p: w.p.slice(k, k + 4), half: w.w / 2, level: WATER };
      add(b, Math.min(b.p[0], b.p[2]) - b.half, Math.min(b.p[1], b.p[3]) - b.half, Math.max(b.p[0], b.p[2]) + b.half, Math.max(b.p[1], b.p[3]) + b.half);
    }
  }
  if (!bodies.length) return;
  // the body of water at (x, z), or undefined on dry land (the first of them, if bodies overlap)
  const has = (x, z) => b => {
    if (b.poly) return b.in(x, z);
    const [ax, az, bx, bz] = b.p, dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
    return Math.hypot(x - ax - t * dx, z - az - t * dz) < b.half;
  };
  const wet = (x, z) => {
    const i = Math.floor(x / CELL), j = Math.floor(z / CELL), on = has(x, z);
    const near = (grid.get(key(i, j)) ?? []).find(on), far = wide.find(w => i >= w.i0 && i <= w.i1 && j >= w.j0 && j <= w.j1 && on(w.b))?.b;
    return near && far ? (near.n < far.n ? near : far) : near ?? far;
  };
  // quay walls: every outline of every water body, cut into short pieces, keeping those with
  // water on one side and dry land on the other (not where two bodies of water meet). A body with
  // a bank (a canal lying lower, its map area's bank and level) gets a slope of grass down to the
  // water instead, and a wall down from the other's water where it meets one lying higher.
  const walls = new Batch(), banks = new Batch(), landings = [];
  ctx.quays = []; // the quay edges along a pavement, for people to sit on (js/sitters.js)
  const wall = (ax, az, bx, bz) => {
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) return;
    const n = Math.max(1, Math.ceil(L / 2));
    for (let i = 0; i < n; i++) {
      const x0 = ax + ((bx - ax) * i) / n, z0 = az + ((bz - az) * i) / n, x1 = ax + ((bx - ax) * (i + 1)) / n, z1 = az + ((bz - az) * (i + 1)) / n;
      const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, nx = -(bz - az) / L * 0.3, nz = (bx - ax) / L * 0.3;
      const left = wet(mx + nx, mz + nz), right = wet(mx - nx, mz - nz);
      if (left === right || (left && right && left.level === right.level)) continue;
      if (left && right) { // two bodies of water, one lower: a wall from the higher one's surface down
        const [hi, lo] = left.level > right.level ? [left, right] : [right, left], s = hi === left ? -1 : 1;
        const a = walls.vert(x0, hi.level, z0, nx * s / 0.3, 0, nz * s / 0.3, 0, 1), b = walls.vert(x1, hi.level, z1, nx * s / 0.3, 0, nz * s / 0.3, 1, 1);
        const c = walls.vert(x1, lo.level - 0.1, z1, nx * s / 0.3, 0, nz * s / 0.3, 1, 0), d = walls.vert(x0, lo.level - 0.1, z0, nx * s / 0.3, 0, nz * s / 0.3, 0, 0);
        walls.idx.push(a, b, c, a, c, d);
        continue;
      }
      const s = left ? 1 : -1; // the wall faces the water
      const body = left || right;
      if (body.bank) {
        // the grass slope: from the edge, `bank` metres in towards the water (a little longer
        // than the piece, so that round a bend the pieces overlap), down to below its surface
        const ix = nx * s / 0.3, iz = nz * s / 0.3, ux = (x1 - x0) / L * n, uz = (z1 - z0) / L * n, e = 0.4;
        const drop = -body.level + 0.4, len = Math.hypot(drop, body.bank);
        const gx = ix * drop / len, gy = body.bank / len, gz = iz * drop / len;
        const v = (x, y, z) => banks.vert(x, y, z, gx, gy, gz, x / 6, z / 6);
        const p0x = x0 - ux * e, p0z = z0 - uz * e, p1x = x1 + ux * e, p1z = z1 + uz * e;
        const a = v(p0x, 0.01, p0z), b = v(p1x, 0.01, p1z), c = v(p1x + ix * body.bank, -drop, p1z + iz * body.bank), d = v(p0x + ix * body.bank, -drop, p0z + iz * body.bank);
        banks.idx.push(a, b, c, a, c, d);
        continue;
      }
      // steps down to the water where people walk along the quay
      if (L > 3 && foot(mx - nx * s * 3, mz - nz * s * 3)) landings.push({ x: x0, z: z0, ux: (bx - ax) / L, uz: (bz - az) / L, nx: nx * s / 0.3, nz: nz * s / 0.3 });
      if (foot(mx - nx * s * 3, mz - nz * s * 3)) ctx.quays.push({ x: mx, z: mz, ux: (bx - ax) / L, uz: (bz - az) / L, nx: nx * s / 0.3, nz: nz * s / 0.3 });
      // from the ground's height on the land side (a quay lying lower than the street, js/hollows.js)
      const top = (x, z) => Math.min(0, sunk(x - nx * s * 2, z - nz * s * 2)) + 0.01;
      const a = walls.vert(x0, top(x0, z0), z0, nx * s / 0.3, 0, nz * s / 0.3, 0, 1), b = walls.vert(x1, top(x1, z1), z1, nx * s / 0.3, 0, nz * s / 0.3, 1, 1);
      const c = walls.vert(x1, WATER - 0.1, z1, nx * s / 0.3, 0, nz * s / 0.3, 1, 0), d = walls.vert(x0, WATER - 0.1, z0, nx * s / 0.3, 0, nz * s / 0.3, 0, 0);
      walls.idx.push(a, b, c, a, c, d);
    }
  };
  for (const b of bodies) {
    if (b.poly) {
      const p = b.poly;
      for (let k = 0, j = p.length - 2; k < p.length; j = k, k += 2) wall(p[j], p[j + 1], p[k], p[k + 1]);
      continue;
    }
    const [ax, az, bx, bz] = b.p, L = Math.hypot(bx - ax, bz - az) || 1, ox = -(bz - az) / L * b.half, oz = (bx - ax) / L * b.half;
    wall(ax + ox, az + oz, bx + ox, bz + oz);
    wall(ax - ox, az - oz, bx - ox, bz - oz);
  }
  // and round the joints and ends of the waterways, like their round painted joints
  for (const w of map.water) {
    for (let k = 0; k < w.p.length; k += 2) {
      const at = s => [w.p[k] + Math.cos(s * Math.PI / 4) * w.w / 2, w.p[k + 1] + Math.sin(s * Math.PI / 4) * w.w / 2];
      for (let s = 0; s < 8; s++) wall(...at(s), ...at(s + 1));
    }
  }
  walls.mesh(ctx, mat(0x8f8676, 0.95, { side: THREE.DoubleSide }));
  banks.mesh(ctx, mat(0xffffff, 1, { map: layers.green[1].map, side: THREE.DoubleSide }));
  // a flight of steps every so often along those quays
  const flights = [];
  for (const q of landings) {
    if (flights.some(f => Math.hypot(f.x - q.x, f.z - q.z) < 70)) continue;
    flights.push(q);
  }
  instanced(ctx, quayStepsGeometry(), mat(0x9c9384, 0.95, { side: THREE.DoubleSide }), flights, (d, q) => {
    d.position.set(q.x, Math.min(0, sunk(q.x - q.nx * 0.6, q.z - q.nz * 0.6)) + 0.01, q.z); // down from a quay lying lower too
    // local x along the wall, local z out over the water
    d.rotation.set(0, Math.atan2(-q.uz, q.ux), 0);
    d.scale.set(1, 1, q.ux * q.nz - q.uz * q.nx > 0 ? 1 : -1);
  }, { shadow: false });
  ctx.flights = flights;
  const hole = mask.mesh(ctx, new THREE.MeshBasicMaterial({
    colorWrite: false, depthWrite: false, depthTest: false,
    stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
  }));
  hole.renderOrder = -10;
  hole.userData.bend = 0.05; // on hills only its edges need to follow the ground closely (js/terrain.js)
  hole.receiveShadow = false;
  // the ground, the parks and the gardens leave the hole open
  const cut = m => Object.assign(m, { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp });
  if (ctx.groundPlane) cut(ctx.groundPlane.material);
  return cut;
}

// Dual carriageways (the R40's lanen and the like): two one-way roads of the same name running
// side by side, opposite ways, for a good stretch. For each, its points every few metres with where
// the other carriageway lies opposite, so the strip between them can be a grassy median.
const DUAL_STEP = 4, DUAL_GAP = 32, DUAL_RUN = 60; // metres between samples; centre lines at most this far apart; for this long
const LONE = Object.freeze({ o: null }); // a sample with no other carriageway beside it
function dualCarriageways(map) {
  // the one-way segments of each named street, in a grid of DUAL_GAP cells
  const grid = new Map(), cellKey = (n, i, j) => n + ':' + i + ',' + j;
  const roads = map.roads.filter(rd => !rd.foot && rd.one && rd.n !== undefined && !rd.br);
  const ids = new Map(roads.map((rd, i) => [rd, i]));
  for (const rd of roads) {
    for (let k = 0; k + 3 < rd.p.length; k += 2) {
      const i0 = Math.floor(Math.min(rd.p[k], rd.p[k + 2]) / DUAL_GAP), i1 = Math.floor(Math.max(rd.p[k], rd.p[k + 2]) / DUAL_GAP);
      const j0 = Math.floor(Math.min(rd.p[k + 1], rd.p[k + 3]) / DUAL_GAP), j1 = Math.floor(Math.max(rd.p[k + 1], rd.p[k + 3]) / DUAL_GAP);
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const g = cellKey(rd.n, i, j);
        if (!grid.has(g)) grid.set(g, []);
        grid.get(g).push(rd, k);
      }
    }
  }
  // water between the two (a quay on either side of a canal) is no median
  const wet = [
    ...map.areas.filter(a => a.k === 'water').map(a => ({ p: a.p, poly: true })),
    ...map.water.map(w => ({ p: w.p, r: w.w / 2 })),
  ].map(o => {
    const b = [Infinity, Infinity, -Infinity, -Infinity], pad = o.r ?? 0;
    for (let k = 0; k < o.p.length; k += 2) {
      b[0] = Math.min(b[0], o.p[k] - pad); b[1] = Math.min(b[1], o.p[k + 1] - pad);
      b[2] = Math.max(b[2], o.p[k] + pad); b[3] = Math.max(b[3], o.p[k + 1] + pad);
    }
    return { ...o, b };
  });
  const isWet = (x, z) => wet.some(({ p, poly, r, b }) => {
    if (x < b[0] || z < b[1] || x > b[2] || z > b[3]) return false;
    if (poly) return pointIn(x, z, p);
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ex = p[k + 2] - p[k], ez = p[k + 3] - p[k + 1], M = ex * ex + ez * ez || 1;
      const t = Math.max(0, Math.min(1, ((x - p[k]) * ex + (z - p[k + 1]) * ez) / M));
      if (Math.hypot(p[k] + ex * t - x, p[k + 1] + ez * t - z) < r) return true;
    }
    return false;
  });
  const out = [];
  for (const rd of roads) {
    const pts = [], p = rd.p;
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], dx = p[k + 2] - ax, dz = p[k + 3] - az, L = Math.hypot(dx, dz);
      if (L < 0.01) continue;
      const ux = dx / L, uz = dz / L, n = Math.max(1, Math.round(L / DUAL_STEP));
      // the segments of the same street near this one that run the other way
      const near = [], seen = new Set();
      const i0 = Math.floor(Math.min(ax, ax + dx) / DUAL_GAP) - 1, i1 = Math.floor(Math.max(ax, ax + dx) / DUAL_GAP) + 1;
      const j0 = Math.floor(Math.min(az, az + dz) / DUAL_GAP) - 1, j1 = Math.floor(Math.max(az, az + dz) / DUAL_GAP) + 1;
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const cell = grid.get(cellKey(rd.n, i, j));
        if (cell) for (let c = 0; c < cell.length; c += 2) {
          const o = cell[c], q = cell[c + 1];
          if (o === rd) continue;
          const ex = o.p[q + 2] - o.p[q], ez = o.p[q + 3] - o.p[q + 1], M = ex * ex + ez * ez;
          const id = ids.get(o) * 1e5 + q; // a segment is in every cell it crosses
          if (M < 1e-4 || (ux * ex + uz * ez) / Math.sqrt(M) > -0.9 || seen.has(id)) continue;
          seen.add(id);
          near.push(o, q);
        }
      }
      for (let s = 0; s <= n; s++) {
        if (s === 0 && pts.length) continue;
        if (!near.length) { pts.push(LONE); continue; }
        const x = ax + (dx * s) / n, z = az + (dz * s) / n;
        // the nearest point on the other carriageway, if it runs the other way close by
        let best = null;
        for (let c = 0; c < near.length; c += 2) {
          const o = near[c], q = near[c + 1];
          const bx = o.p[q], bz = o.p[q + 1], ex = o.p[q + 2] - bx, ez = o.p[q + 3] - bz, M = ex * ex + ez * ez;
          const t = Math.max(0, Math.min(1, ((x - bx) * ex + (z - bz) * ez) / M));
          const qx = bx + ex * t, qz = bz + ez * t, d = Math.hypot(qx - x, qz - z);
          if (d < DUAL_GAP && (!best || d < best.d)) best = { x: qx, z: qz, d, w: o.w };
        }
        pts.push({ x, z, o: best && best.d > (rd.w + best.w) / 2 + 2.6 ? best : null });
      }
    }
    // only a long stretch side by side is a boulevard: one-way streets around a block pass close for
    // a bit; and with water between them, they are two quays of a canal
    for (let i = 0; i < pts.length;) {
      let j = i;
      while (j < pts.length && pts[j].o) j++;
      let drop = (j - i) * DUAL_STEP < DUAL_RUN;
      for (let k = i; k < j && !drop; k += 3) drop = isWet((pts[k].x + pts[k].o.x) / 2, (pts[k].z + pts[k].o.z) / 2);
      if (drop) for (let k = i; k < j; k++) pts[k].o = null;
      i = j + 1;
    }
    if (pts.some(q => q.o)) out.push({ rd, pts });
  }
  return out;
}

// The grass between the two carriageways, into batch at height y.
function medians(batch, duals, y) {
  const KERB = 1.3;
  for (const { rd, pts } of duals) {
    const edge = q => {
      const nx = (q.o.x - q.x) / q.o.d, nz = (q.o.z - q.z) / q.o.d;
      const a = rd.w / 2 + KERB, b = q.o.w / 2 + KERB;
      return [q.x + nx * a, q.z + nz * a, q.o.x - nx * b, q.o.z - nz * b];
    };
    for (let i = 0; i + 1 < pts.length; i++) {
      const p = pts[i], q = pts[i + 1];
      if (!p.o || !q.o || Math.abs(p.o.d - q.o.d) > 4) continue;
      const [ax, az, bx, bz] = edge(p), [cx, cz, dx, dz] = edge(q);
      const v = (x, z) => batch.vert(x, y, z, 0, 1, 0, x / 6, z / 6);
      const a = v(ax, az), b = v(bx, bz), c = v(dx, dz), d = v(cx, cz);
      batch.up(a, b, c);
      batch.up(a, c, d);
    }
  }
}

// The dashed line between the two lanes of each carriageway of the streets in TWO_LANES (a city's
// own list: the map doesn't say how many lanes a street has): 3 metres of paint, 6 of asphalt,
// broken off where another street or a path crosses.
function laneLines(batch, map, y) {
  const names = new Set((TWO_LANES ?? []).map(n => map.names.indexOf(n)));
  const roads = map.roads.filter(rd => !rd.foot && (rd.bay || (rd.one && names.has(rd.n)))); // and a bay street's centre line
  for (const rd of roads) names.add(rd.n);
  const CELL = 12, grid = new Map(), key = (i, j) => i + ',' + j;
  for (const rd of map.roads) {
    if (names.has(rd.n)) continue;
    for (let k = 0; k < rd.p.length; k += 2) {
      const g = key(Math.floor(rd.p[k] / CELL), Math.floor(rd.p[k + 1] / CELL));
      if (!grid.has(g)) grid.set(g, []);
      grid.get(g).push(rd.p[k], rd.p[k + 1], Math.max(rd.w / 2 + 2, 3));
    }
  }
  const crossed = (x, z) => {
    const i0 = Math.floor(x / CELL), j0 = Math.floor(z / CELL);
    for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) {
      const c = grid.get(key(i, j));
      if (c) for (let k = 0; k < c.length; k += 3) if (Math.hypot(c[k] - x, c[k + 1] - z) < c[k + 2]) return true;
    }
    return false;
  };
  const W = 0.18, DASH = 3, PERIOD = 9, END = 8;
  for (const rd of roads) {
    const p = rd.p;
    let total = 0;
    for (let k = 0; k + 3 < p.length; k += 2) total += Math.hypot(p[k + 2] - p[k], p[k + 3] - p[k + 1]);
    let run = 0;
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], dx = p[k + 2] - ax, dz = p[k + 3] - az, L = Math.hypot(dx, dz);
      if (L < 0.01) continue;
      const ux = dx / L, uz = dz / L, nx = -uz * W / 2, nz = ux * W / 2;
      const at = t => (rd.y ? rd.y[k / 2] + (rd.y[k / 2 + 1] - rd.y[k / 2]) * (t / L) : 0);
      // dashes start at whole periods along the street, so they carry on round its bends
      for (let s = Math.ceil(run / PERIOD) * PERIOD - run; s < L; s += PERIOD) {
        const s1 = Math.min(L, s + DASH);
        if (run + s < END || total - (run + s1) < END) continue;
        const x0 = ax + ux * s, z0 = az + uz * s, x1 = ax + ux * s1, z1 = az + uz * s1;
        if (crossed(x0, z0) || crossed(x1, z1)) continue;
        const y0 = y + at(s), y1 = y + at(s1);
        const v = (x, yy, z) => batch.vert(x, yy, z, 0, 1, 0, 0, 0);
        const a = v(x0 + nx, y0, z0 + nz), b = v(x0 - nx, y0, z0 - nz), c = v(x1 - nx, y1, z1 - nz), d = v(x1 + nx, y1, z1 + nz);
        batch.up(a, b, c);
        batch.up(a, c, d);
      }
      run += L;
    }
  }
}

// The blue discs painted on a fietsstraat's red (BIKE_STREETS): one every DISC_EVERY metres along
// each piece of it, the first a little way in, every other one turned round, so that whichever
// way you ride, every second disc reads the right way up. Not on a bridge's hump, nor on a piece
// too short to hold one clear of its ends.
const DISC = 3, DISC_EVERY = 50, DISC_FIRST = 18;
function bikeDiscs(batch, map, names, y) {
  for (const rd of map.roads) {
    if (rd.foot || rd.c || rd.y || !names.has(rd.n)) continue;
    const p = rd.p;
    let total = 0;
    for (let k = 0; k + 3 < p.length; k += 2) total += Math.hypot(p[k + 2] - p[k], p[k + 3] - p[k + 1]);
    if (total < 2 * DISC_FIRST) continue;
    let run = 0, next = Math.min(DISC_FIRST + ((total - 2 * DISC_FIRST) % DISC_EVERY) / 2, total / 2), n = 0;
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], dx = p[k + 2] - ax, dz = p[k + 3] - az, L = Math.hypot(dx, dz);
      if (L < 0.01) continue;
      const ux = dx / L, uz = dz / L, h = DISC / 2;
      for (; next < run + L && next <= total - DISC_FIRST + 0.01; next += DISC_EVERY, n++) {
        const cx = ax + ux * (next - run), cz = az + uz * (next - run), f = n % 2 ? -1 : 1;
        // u across the street, v along it: the picture's top ahead, or behind on a turned one
        const v = (s, t) => batch.vert(cx + ux * t * h - uz * s * h, y, cz + uz * t * h + ux * s * h, 0, 1, 0, (1 + f * s) / 2, (1 + f * t) / 2);
        const a = v(-1, -1), b = v(1, -1), c = v(1, 1), d = v(-1, 1);
        batch.up(a, b, c);
        batch.up(a, c, d);
      }
      run += L;
    }
  }
}

// The sheep that graze a canal's grass banks (a city's SHEEP): each flock on the bank of a lower
// canal nearest its spot, a metre or three down the slope, standing square to it, most of them
// along it, nibbling now and then.
function sheepGeometry() {
  const wool = 0xe8e2d2, face = 0xd8ccb6, dark = 0x3b342e, parts = [];
  const add = (g, color) => {
    const c = new THREE.Color(color), n = g.attributes.position.count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    parts.push(g.index ? g.toNonIndexed() : g);
  };
  add(new THREE.IcosahedronGeometry(0.5, 1).scale(0.72, 0.62, 1.05).translate(0, 0.78, 0), wool); // the fleece
  for (const [x, z] of [[-0.2, 0.32], [0.2, 0.32], [-0.2, -0.32], [0.2, -0.32]]) add(new THREE.CylinderGeometry(0.05, 0.045, 0.5, 5).translate(x, 0.25, z), dark);
  return mergeGeometries(parts);
}
function sheepHead() {
  const g = new THREE.Group(), m = mat(0xd8ccb6, 0.9), ear = mat(0xcbbda4, 0.9);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.4).translate(0, 0, 0.2), m);
  const poll = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0).translate(0, 0.08, 0.02), mat(0xe8e2d2, 1)); // wool on top
  for (const s of [-1, 1]) g.add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.08).translate(s * 0.17, 0.08, 0.06), ear));
  head.castShadow = true;
  g.add(head, poll);
  return g;
}
function bankSheep(ctx, map) {
  if (!SHEEP?.length) return;
  const banks = map.areas.filter(a => a.k === 'water' && a.bank);
  const body = sheepGeometry(), wool = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }), heads = [];
  for (const flock of SHEEP) {
    // the bank's edges within reach of the spot, each with the way in, towards the water
    const edges = [];
    for (const a of banks) {
      const p = a.p, drop = -a.level + 0.4;
      for (let k = 0, j = p.length - 2; k < p.length; j = k, k += 2) {
        const ax = p[j], az = p[j + 1], bx = p[k], bz = p[k + 1], L = Math.hypot(bx - ax, bz - az);
        if (L < 2 || Math.hypot((ax + bx) / 2 - flock.at[0], (az + bz) / 2 - flock.at[1]) > 30 + L / 2) continue;
        let nx = -(bz - az) / L, nz = (bx - ax) / L;
        if (!pointIn((ax + bx) / 2 + nx * 0.5, (az + bz) / 2 + nz * 0.5, p)) { nx = -nx; nz = -nz; }
        edges.push({ ax, az, ux: (bx - ax) / L, uz: (bz - az) / L, L, nx, nz, bank: a.bank, drop });
      }
    }
    if (!edges.length) continue;
    // the nearest edge to the spot, and the flock spread along it
    const near = e => Math.hypot(e.ax + e.ux * e.L / 2 - flock.at[0], e.az + e.uz * e.L / 2 - flock.at[1]);
    const e = edges.reduce((b, x) => (near(x) < near(b) ? x : b));
    const toward = Math.max(0, Math.min(e.L, (flock.at[0] - e.ax) * e.ux + (flock.at[1] - e.az) * e.uz));
    for (let i = 0; i < flock.count; i++) {
      const along = toward + (ctx.r() - 0.5) * 14, d = 0.9 + ctx.r() * 2.4;
      const x = e.ax + e.ux * along + e.nx * d, z = e.az + e.uz * along + e.nz * d, y = -e.drop * d / e.bank;
      const g = new THREE.Group();
      // square to the slope: its up the slope's normal, then turned about that
      const tilt = Math.atan2(e.drop, e.bank);
      g.position.set(x, y, z);
      g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(e.nx * Math.sin(tilt), Math.cos(tilt), e.nz * Math.sin(tilt)));
      const facing = ctx.r() < 0.7 ? Math.atan2(e.ux, e.uz) + (ctx.r() < 0.5 ? 0 : Math.PI) + (ctx.r() - 0.5) * 0.8 : Math.atan2(e.nx, e.nz) + (ctx.r() - 0.5) * 1.2;
      const spin = new THREE.Group();
      spin.rotation.y = facing;
      g.add(spin);
      const m = new THREE.Mesh(body, wool);
      m.castShadow = true;
      const head = sheepHead();
      head.position.set(0, 0.92, 0.48);
      spin.add(m, head);
      heads.push({ head, phase: ctx.r() * 20, rate: 0.25 + ctx.r() * 0.2 });
      ctx.group.add(g);
    }
  }
  // heads down in the grass most of the time, now and then up to look round
  let t = 0;
  ctx.updaters.push(dt => {
    t += dt;
    for (const h of heads) {
      const s = Math.sin(t * h.rate + h.phase), up = s > 0.6 ? (s - 0.6) / 0.4 : 0;
      h.head.rotation.x = 0.9 - up * 1.1 + Math.sin(t * 6 + h.phase) * 0.04 * (1 - up);
      h.head.rotation.y = up * Math.sin(t * 0.7 + h.phase) * 0.5;
    }
  });
}

// The disc itself, as on the sign: blue, a red car side on and a white cyclist in front of it,
// over the middle of the car, the wheels below its sills and the head above its roof.
function bikeDiscTexture() {
  return canvasTexture(256, 256, g => {
    g.translate(128, 128);
    g.fillStyle = '#2f5fae';
    g.beginPath(); g.arc(0, 0, 126, 0, Math.PI * 2); g.fill();
    // the car, behind
    g.fillStyle = '#d2342c';
    g.beginPath();
    g.moveTo(-94, 22); g.lineTo(-94, -2); g.quadraticCurveTo(-92, -12, -74, -14);
    g.lineTo(-52, -16); g.lineTo(-30, -42); g.lineTo(30, -42); g.lineTo(50, -16);
    g.lineTo(80, -12); g.quadraticCurveTo(94, -8, 94, 6); g.lineTo(94, 22); g.closePath();
    g.fill();
    g.fillStyle = '#2f5fae'; // its wheels, in the disc's blue
    for (const x of [-60, 60]) { g.beginPath(); g.arc(x, 24, 15, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#d2342c';
    for (const x of [-60, 60]) { g.beginPath(); g.arc(x, 24, 10, 0, Math.PI * 2); g.fill(); }
    // the cyclist, in front, riding to the right
    g.strokeStyle = '#f4f2ec'; g.fillStyle = '#f4f2ec'; g.lineCap = 'round'; g.lineJoin = 'round';
    g.lineWidth = 7;
    for (const x of [-40, 42]) { g.beginPath(); g.arc(x, 62, 25, 0, Math.PI * 2); g.stroke(); }
    g.beginPath(); g.moveTo(-40, 62); g.lineTo(-6, 62); g.lineTo(30, 24); g.lineTo(42, 62); // frame and fork
    g.moveTo(-6, 62); g.lineTo(-16, 22); g.moveTo(-26, 20); g.lineTo(-8, 20); // seat post and saddle
    g.moveTo(-6, 62); g.lineTo(30, 24); g.lineTo(-14, 30); // top tube
    g.moveTo(30, 24); g.lineTo(28, 10); g.lineTo(18, 10); g.stroke(); // handlebar
    g.lineWidth = 16;
    g.beginPath(); g.moveTo(-14, 12); g.lineTo(2, -46); g.stroke(); // back
    g.lineWidth = 10;
    g.beginPath(); g.moveTo(0, -40); g.lineTo(20, -10); g.lineTo(22, 8); g.stroke(); // arm
    g.beginPath(); g.moveTo(-12, 14); g.lineTo(18, 30); g.lineTo(2, 60); g.stroke(); // leg
    g.beginPath(); g.arc(8, -70, 15, 0, Math.PI * 2); g.fill(); // head
  });
}

function osmGround(ctx, map, m) {
  const water = waterMaterial(ctx, LOOK?.water); // a city on the sea can have it bluer than the canals' green
  const layers = {
    water: [new Batch(), water, 0.008, 12],
    green: [new Batch(), m.park, 0.012, 6], wood: [new Batch(), mat(0xffffff, 1, { map: m.garden.map }), 0.013, 6],
    allotments: [new Batch(), m.garden, 0.014, 6], pitch: [new Batch(), mat(0x5aa04a, 1), 0.016, 6],
    sand: [new Batch(), mat(0xe6c98e, 1), 0.017, 6], paved: [new Batch(), m.pavement, 0.018, 3],
  };
  for (const a of map.areas) {
    if (a.k === 'water') continue;
    const [batch, , y, tile] = layers[a.k];
    flatPolygon(batch, a.p, y, tile);
  }
  const duals = dualCarriageways(map);
  medians(layers.green[0], duals, layers.green[2]);
  const cut = sunkenWater(ctx, map, layers, nearFoot(map));
  hollowGround(ctx.group, map, layers, { pavement: m.pavement, asphalt: m.asphalt });
  for (const [k, [batch, material, y]] of Object.entries(layers)) {
    const m = batch.mesh(ctx, k === 'water' ? material : cut ? cut(onGround(material, y)) : onGround(material, y));
    if (m && k === 'water') m.userData.bend = 0.1; // down between the quays, a little off the hills' shape does not show
  }
  // each kind of street at a height of its own, so that where two meet one of them is on top:
  // cobbles over a plain footpath, cobbles over asphalt, flat slabs over cobbles
  const kerbs = new Batch(), asphalt = new Batch(), setts = new Batch(), slabs = new Batch(), foot = new Batch(), sides = new Batch(), iron = new Batch();
  const footSetts = new Batch(), footSlabs = new Batch(), bike = new Batch();
  const bikeNames = new Set((BIKE_STREETS ?? []).map(n => map.names.indexOf(n)));
  for (const rd of map.roads) {
    const up = rd.br ? 0.03 : 0; // a bridge's deck over the ends of the streets leading onto it
    if (rd.foot && !rd.c) groundStrip(foot, rd.p, rd.w, GROUND.foot + up, 3, rd.y);
    else if (rd.foot) groundStrip(rd.c === 2 ? footSlabs : footSetts, rd.p, rd.w, (rd.c === 2 ? GROUND.footSlabs : GROUND.footSetts) + up, 6, rd.y);
    else {
      groundStrip(kerbs, rd.p, rd.w + (rd.bay ? 2 * BAY_WIDTH : 2.6), GROUND.kerbs + up, 3, rd.y); // a bay street has its parking bays paved either side
      if (!rd.c && bikeNames.has(rd.n)) groundStrip(bike, rd.p, rd.w, GROUND.bike + up, 8, rd.y); // a fietsstraat's red
      else if (!rd.c) groundStrip(asphalt, rd.p, rd.w, GROUND.asphalt + up, 8, rd.y);
      else groundStrip(rd.c === 2 ? slabs : setts, rd.p, rd.w, (rd.c === 2 ? GROUND.slabs : GROUND.setts) + up, 6, rd.y); // cobbles, or big flat slabs
    }
    if (!rd.y) continue;
    // a bridge: the usual hump on a stone parapet (1), flat on iron railings (2), or high and grand
    // on a tall balustrade (3); else a street climbing to one
    const w = rd.foot ? rd.w : rd.w + 2.6;
    raisedSides(sides, rd, w, [0, 1.1, 0.95, 1.9][rd.br ?? 0], [0, 0.9, 0, 1.15][rd.br ?? 0]);
    if (rd.br === 2) railings(iron, rd, w);
  }
  kerbs.mesh(ctx, onGround(m.pavement, GROUND.kerbs));
  foot.mesh(ctx, onGround(m.pavement, GROUND.foot));
  asphalt.mesh(ctx, onGround(m.asphalt, GROUND.asphalt));
  bike.mesh(ctx, onGround(m.bike, GROUND.bike));
  const lines = new Batch();
  laneLines(lines, map, GROUND.lines);
  lines.mesh(ctx, onGround(mat(0xf2f2ee, 0.7), GROUND.lines));
  const discs = new Batch();
  bikeDiscs(discs, map, bikeNames, GROUND.lines);
  discs.mesh(ctx, onGround(mat(0xffffff, 0.8, { map: bikeDiscTexture(), alphaTest: 0.5 }), GROUND.lines));
  const settMat = mat(0xffffff, 0.95, { map: settTexture(16, 24) }), slabMat = mat(0xffffff, 0.95, { map: slabTexture(ctx.theme) });
  setts.mesh(ctx, onGround(settMat, GROUND.setts));
  slabs.mesh(ctx, onGround(slabMat, GROUND.slabs));
  footSetts.mesh(ctx, onGround(settMat, GROUND.footSetts));
  footSlabs.mesh(ctx, onGround(slabMat, GROUND.footSlabs));
  sides.mesh(ctx, mat(0x9b9184, 0.95, { side: THREE.DoubleSide }), { shadow: true });
  iron.mesh(ctx, mat(0x232628, 0.6, { side: THREE.DoubleSide }), { shadow: true });
  // the squares over it all, streets and kerbs included: one floor of stone wall to wall
  for (const sq of SQUARES) {
    const floor = new Batch();
    flatPolygon(floor, sq.p, GROUND.squares, PAVING_TILE);
    floor.mesh(ctx, onGround(mat(0xffffff, 0.92, { map: pavingTexture(sq.paving, ctx.r) }), GROUND.squares));
  }
  fountains(ctx, map.fountains ?? []);
}

// A square's slabs, in rows of slab[1] metres, each slab slab[0] long give or take, a little
// lighter or darker than the next, for PAVING_TILE metres each way; or with sett, cobbles.
const PAVING_TILE = 12;
function pavingTexture({ stone, joint, slab: [len, wide] = [1, 1], sett }, r) {
  if (sett) return settTexture(40, 40, { stone, joint }); // cobbles of about 30 cm, in rows
  const t = canvasTexture(512, 512, (g, w, h) => {
    const px = w / PAVING_TILE, [sr, sg, sb] = rgbOf(stone);
    g.fillStyle = joint;
    g.fillRect(0, 0, w, h);
    const rows = Math.round(PAVING_TILE / wide), rh = h / rows;
    for (let row = 0; row < rows; row++) {
      for (let x = -r() * len * px; x < w;) {
        const sw = len * px * (0.6 + r() * 0.8), v = (r() - 0.5) * 22;
        g.fillStyle = `rgb(${sr + v},${sg + v},${sb + v * 0.9})`;
        // the last slab of a row runs on round the edge, so the tiles meet without a seam
        for (const o of x + sw > w ? [0, -w] : [0]) g.fillRect(x + o + 1, row * rh + 1, sw - 2, rh - 2);
        x += sw;
      }
    }
    noise(g, w, h, r, 10, [1, 1, 1]);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// A fountain on a square: no basin, a patch of stones dark with water and a grid of jets springing
// straight out of them, rising and falling in a slow wave.
function fountains(ctx, list) {
  if (!list.length) return;
  const wet = new Batch(), jets = [];
  for (const p of list) {
    flatPolygon(wet, p, GROUND.wet, 3);
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let k = 0; k < p.length; k += 2) { x0 = Math.min(x0, p[k]); x1 = Math.max(x1, p[k]); z0 = Math.min(z0, p[k + 1]); z1 = Math.max(z1, p[k + 1]); }
    for (let x = x0 + 1; x < x1; x += 2.2) for (let z = z0 + 1; z < z1; z += 2.2) if (pointIn(x, z, p)) jets.push({ x, z, ph: x * 0.5 + z * 0.3 });
  }
  wet.mesh(ctx, onGround(mat(0x8e9194, 0.2, { metalness: 0.25 }), GROUND.wet));
  const geo = new THREE.CylinderGeometry(0.02, 0.07, 1, 6, 1, true).translate(0, 0.5, 0);
  const im = instanced(ctx, geo, mat(0xf2f8ff, 0.1, { transparent: true, opacity: 0.4, depthWrite: false }), jets, (d, j) => resetDummy(d, j.x, 0.05, j.z), { shadow: false, still: false });
  const d = ctx.dummy;
  ctx.updaters.push((dt, t) => {
    jets.forEach((j, k) => {
      d.position.set(j.x, 0.05, j.z);
      d.rotation.set(0, 0, 0);
      d.scale.set(1, 0.4 + 1.6 * (0.5 + 0.5 * Math.sin(t * 1.3 + j.ph)), 1);
      d.updateMatrix();
      im.setMatrixAt(k, d.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
  });
}

// Trees from the map, and more of them in its parks and woods.
function osmTrees(ctx, map) {
  const { r } = ctx;
  const list = { pine: [], round: [], poplar: [] };
  // (a map tree stands off the houses: its crown is 2.5 m across, and some stand against a front or in
  // a block the city built up again, as in the Belfortstraat)
  const cells = new Map(), cell = (x, z) => `${Math.floor(x / 24)},${Math.floor(z / 24)}`;
  for (const b of map.buildings) {
    if (b.gone) continue;
    const [x0, z0, x1, z1] = boxOf(b.p);
    for (let x = Math.floor((x0 - 3) / 24); x <= Math.floor((x1 + 3) / 24); x++) {
      for (let z = Math.floor((z0 - 3) / 24); z <= Math.floor((z1 + 3) / 24); z++) {
        const key = `${x},${z}`;
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push(b.p);
      }
    }
  }
  const onHouse = (x, z) => (cells.get(cell(x, z)) ?? []).some(p => pointIn(x, z, p) || nearLine(x, z, p, 2.5, true));
  // none in the city's own AREAS, laid over the map's ground (the Blaarmeersen's lake, which the map has as a wood)
  const over = (AREAS ?? []).map(a => a.p), overBoxes = over.map(boxOf);
  const underArea = (x, z) => over.some((p, i) => x > overBoxes[i][0] && x < overBoxes[i][2] && z > overBoxes[i][1] && z < overBoxes[i][3] && pointIn(x, z, p));
  for (let k = 0; k < map.trees.length; k += 2) {
    const x = map.trees[k], z = map.trees[k + 1], size = 0.8 + r() * 0.5, rot = r() * 6; // (drawn either way: the rest keep their sizes)
    // (a city's MAP_TREES = 'poplar' draws the map's own trees as tall narrow ones: the cypresses of a garden)
    if (!onHouse(x, z) && !underArea(x, z)) (MAP_TREES === 'poplar' ? list.poplar : list.round).push({ x, z, s: size, rot });
  }
  for (const a of map.areas) {
    if (a.k !== 'green' && a.k !== 'wood') continue;
    const p = a.p, count = Math.min(80, Math.floor(Math.abs(polyArea(p)) / (a.k === 'wood' ? 70 : 380)));
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let k = 0; k < p.length; k += 2) { x0 = Math.min(x0, p[k]); x1 = Math.max(x1, p[k]); z0 = Math.min(z0, p[k + 1]); z1 = Math.max(z1, p[k + 1]); }
    for (let n = 0, tries = 0; n < count && tries < count * 20; tries++) {
      const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
      if (!pointIn(x, z, p) || !ctx.free(x, z, 3) || underArea(x, z)) continue;
      (r() < 0.15 ? list.poplar : list.round).push({ x, z, s: 0.8 + r() * 0.7, rot: r() * 6 });
      n++;
    }
  }
  for (const grove of GROVES ?? []) groveTrees(ctx, map, grove, list);
  plantTrees(ctx, list);
}

// A city's GROVES: where it is wooded, more than the map's parks (80 trees at most each) can show:
// { p (a flat outline) or box ([x0, z0, x1, z1]: every green and wood area of the map in it), every
// (square metres of it for each tree, where it is wooded), open (0 to 1: how much of it is lawn,
// between the clumps of trees), keep ([[x, z, r], ...]: left clear) }. Never on a road or path, in
// a building, the water, the sand, a pitch or a paved square, nor right up against another tree.
function groveTrees(ctx, map, grove, list) {
  const { r } = ctx;
  const outlines = grove.p ? [grove.p] : map.areas.filter(a => (a.k === 'green' || a.k === 'wood') && boxOf(a.p).every((v, k) => (k < 2 ? v >= grove.box[k] - 1 : v <= grove.box[k] + 1))).map(a => a.p);
  if (!outlines.length) return;
  const [x0, z0, x1, z1] = outlines.map(boxOf).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
  const touches = p => { const b = boxOf(p); return b[0] < x1 + 20 && b[2] > x0 - 20 && b[1] < z1 + 20 && b[3] > z0 - 20; };
  // what is in the way: as outlines, and as lines with a width (the roads, the paths, the rivers)
  const lines = [...map.roads.filter(rd => touches(rd.p)).map(rd => ({ p: rd.p, half: rd.w / 2 + 2.5 })), ...map.water.filter(w => touches(w.p)).map(w => ({ p: w.p, half: (w.w ?? 0) / 2 + 3 }))];
  const solid = [...map.buildings.map(b => b.p), ...map.areas.filter(a => a.k !== 'green' && a.k !== 'wood').map(a => a.p), ...(AREAS ?? []).map(a => a.p)].filter(touches);
  const lineBoxes = lines.map(l => boxOf(l.p)), solidBoxes = solid.map(boxOf);
  const clear = (x, z) => {
    for (let i = 0; i < solid.length; i++) {
      const b = solidBoxes[i];
      if (x > b[0] - 3 && x < b[2] + 3 && z > b[1] - 3 && z < b[3] + 3 && (pointIn(x, z, solid[i]) || nearLine(x, z, solid[i], 3, true))) return false;
    }
    for (let i = 0; i < lines.length; i++) {
      const b = lineBoxes[i], h = lines[i].half;
      if (x > b[0] - h && x < b[2] + h && z > b[1] - h && z < b[3] + h && nearLine(x, z, lines[i].p, h)) return false;
    }
    return !(grove.keep ?? []).some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr);
  };
  // the trees already there, so the new ones keep their distance (a grid of 8 m cells)
  const taken = new Set(), key = (x, z) => `${Math.floor(x / 8)},${Math.floor(z / 8)}`;
  const all = [...list.pine, ...list.round, ...list.poplar];
  for (const t of all) if (t.x > x0 - 8 && t.x < x1 + 8 && t.z > z0 - 8 && t.z < z1 + 8) taken.add(key(t.x, t.z));
  // clumps and lawns: a smooth noise over the ground, wooded where it is high
  const seed = r() * 1000, wave = (x, z) => (Math.sin(x / 61 + seed) + Math.sin(z / 47 - seed) + Math.sin((x + z) / 89 + seed * 2) + Math.sin((x - z) / 37)) / 4;
  const step = Math.sqrt((grove.every ?? 120) / (LOW_POWER ? 0.5 : 1)), open = grove.open ?? 0;
  for (let gx = x0; gx < x1; gx += step) {
    for (let gz = z0; gz < z1; gz += step) {
      const x = gx + r() * step, z = gz + r() * step;
      if (wave(x, z) * 0.5 + 0.5 < open * (0.8 + r() * 0.4)) continue;
      if (taken.has(key(x, z)) || !outlines.some(p => pointIn(x, z, p)) || !ctx.free(x, z, 3) || !clear(x, z)) continue;
      taken.add(key(x, z));
      const k = r();
      (k < (grove.pines ?? 0.12) ? list.pine : k < (grove.pines ?? 0.12) + 0.12 ? list.poplar : list.round).push({ x, z, s: 0.75 + r() * 0.75, rot: r() * 6 });
    }
  }
}

// [x0, z0, x1, z1] round a flat [x, z, ...] outline
function boxOf(p) {
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (let k = 0; k < p.length; k += 2) { x0 = Math.min(x0, p[k]); x1 = Math.max(x1, p[k]); z0 = Math.min(z0, p[k + 1]); z1 = Math.max(z1, p[k + 1]); }
  return [x0, z0, x1, z1];
}

// is (x, z) within d of the line through the flat [x, z, ...] points (closed: round an outline)
function nearLine(x, z, p, d, closed = false) {
  const n = p.length / 2;
  for (let i = 0; i < n - (closed ? 0 : 1); i++) {
    const ax = p[2 * i], az = p[2 * i + 1], j = (i + 1) % n, bx = p[2 * j], bz = p[2 * j + 1];
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    if ((x - ax - t * dx) ** 2 + (z - az - t * dz) ** 2 < d * d) return true;
  }
  return false;
}

// Cars parked along the quieter streets: along one kerb, or both on a one-way street; none in a
// car-free street. On the race route the parked cars come from the track (see parking.js), because
// riders run over them. On the city's FULL_PARKING streets every spot is taken, nose to tail, and
// its PARKED_CARS stand where they are put, the others making room for them.
const BAY_WIDTH = 2.5; // how far out from the asphalt a parking bay reaches, on a street with them (BAY_STREETS)
function osmCars(ctx, map) {
  const { r, track, hw } = ctx;
  const placed = (PARKED_CARS ?? []).map(c => ({ ...c }));
  const cars = [...placed], onRails = nearTrams(map.trams, 2.6); // the trams need the room
  const full = new Set((FULL_PARKING ?? []).map(name => map.names.indexOf(name)));
  const taken = (x, z, len) => placed.some(c => Math.hypot(c.x - x, c.z - z) < (len + CAR_TYPES[c.type].len) / 2 + 0.5);
  // and the buses room to pull in at their stops
  const atStop = (x, z) => STOPS.some(st => (st.x - x) ** 2 + (st.z - z) ** 2 < 14 * 14);
  map.roads.forEach((rd, i) => {
    if (rd.foot || rd.nc || rd.w > 11.5) return;
    const sides = rd.one || rd.bay ? [1, -1] : [hashOf(i) < 0.5 ? 1 : -1], p = rd.p;
    for (const side of sides) {
      for (let k = 0; k + 3 < p.length; k += 2) {
        const ax = p[k], az = p[k + 1], bx = p[k + 2], bz = p[k + 3], L = Math.hypot(bx - ax, bz - az);
        const ux = (bx - ax) / L, uz = (bz - az) / L;
        for (let s = 4; s < L - 4;) {
          // on the carriageway's edge, or on a bay street in the middle of its bay beside it
          const car = randomCar(r), { len, w } = CAR_TYPES[car.type], off = side * (rd.bay ? rd.w / 2 + BAY_WIDTH / 2 : rd.w / 2 - w / 2 - 0.15);
          const x = ax + ux * (s + len / 2) - uz * off, z = az + uz * (s + len / 2) + ux * off;
          // nose to tail, or a gap (drawn all the same on a full street, to keep the rest as it was)
          const gap = r() > (rd.one || rd.bay ? 0.75 : 0.5) ? 4 + r() * 6 : 0;
          s += len + (gap && !full.has(rd.n) ? gap : 0.7);
          if (r() > PARKED && !full.has(rd.n)) continue; // a free spot
          if (s > L - 4 || taken(x, z, len) || track.distTo(x, z) < hw + 4 || onRails(x, z) || atStop(x, z) || squareAt(x, z) || (rd.y && (rd.y[k / 2] > 0.05 || rd.y[k / 2 + 1] > 0.05))) continue;
          // on a one-way street they all face the same way, on a two-way one with the traffic beside them
          cars.push({ x, z, yaw: Math.atan2(ux, uz) + (side > 0 || rd.one ? 0 : Math.PI), ...car });
        }
      }
    }
  });
  track.parkedCars = cars; // to bump into when riding about freely
  buildCars(ctx, [...(track.parking?.cars ?? []), ...cars]);
}

// Bikes parked along the pavements, against the house fronts, often a few together: this is Ghent.
// One in twelve is a long tail, in the calmer colours they come in.
const BIKE_COLORS = [0x1d1a17, 0x37474f, 0xc62828, 0x1565c0, 0x2e7d32, 0xf5f5f5, 0xfdd835, 0x6d4c41, 0x00838f, 0xad1457];
const LONG_TAIL_COLORS = [0x9fd3ef, 0xb9bdc0, 0x2b2f33, 0x6f8f6a, 0xe9e6df, 0x2f4f6f];
const LONG_TAILS = 1 / 12;
function osmBikes(ctx, map) {
  if (PARKED_BIKES === false) return; // a city (or a site) that has none: city.js says PARKED_BIKES = false
  const { r, track } = ctx;
  const bikes = [];
  const run = (along, at) => {
    // along: length of the kerb; at(s) gives the spot and direction s metres along it
    for (let s = 2; s < along - 2; s += 3) {
      if (r() > 0.1 * PARKED) continue;
      const n = 1 + Math.floor(r() * 4);
      for (let k = 0; k < n && s < along - 2; k++, s += 0.75) {
        const q = at(s);
        if (!q) continue;
        const c = BIKE_COLORS[Math.floor(r() * BIKE_COLORS.length)], h = hashOf(bikes.length + 31);
        // a long tail takes the room of two, and stands on its own
        if (h < LONG_TAILS && k === 0) { bikes.push({ ...q, long: true, c: LONG_TAIL_COLORS[Math.floor((h / LONG_TAILS) * LONG_TAIL_COLORS.length)] }); s += 0.75; break; }
        bikes.push({ ...q, c });
      }
    }
  };
  const pav = ctx.theme.pavement ?? 1.6, lift = ctx.theme.lift ?? 0;
  for (const side of [1, -1]) {
    run(track.length, s => {
      const i = track.wrap(Math.floor(s / track.spacing));
      if (track.mouths?.at[i] || track.paved?.[i]) return null; // no pavement to line on a square
      const p = track.at(i, side * (track.hw + pav - 0.35));
      return { x: p.x, z: p.z, yaw: track.yawAt(i), y: lift };
    });
  }
  for (const rd of map.roads) {
    if (rd.foot) continue;
    const side = r() < 0.5 ? 1 : -1, off = side * (rd.w / 2 + 1.0), p = rd.p;
    for (let k = 0; k + 3 < p.length; k += 2) {
      const ax = p[k], az = p[k + 1], L = Math.hypot(p[k + 2] - ax, p[k + 3] - az), ux = (p[k + 2] - ax) / L, uz = (p[k + 3] - az) / L;
      run(L, s => {
        const x = ax + ux * s - uz * off, z = az + uz * s + ux * off;
        return track.distTo(x, z) < ctx.hw + pav + 0.5 || (rd.y && (rd.y[k / 2] > 0.05 || rd.y[k / 2 + 1] > 0.05)) ? null : { x, z, yaw: Math.atan2(ux, uz) };
      });
    }
  }
  addParkedBikes(ctx.group, bikes);
}

// Is there room at (x, z), margin metres round: no building, no street for cars, no water?
function clearance(map) {
  const CELL = 16, grid = new Map(), key = (i, j) => (i + 4096) * 8192 + (j + 4096);
  const wide = []; // the river's polygon spans the whole map: in every cell it would cost ~70 MB
  const add = (b, x0, z0, x1, z1) => {
    const i0 = Math.floor(x0 / CELL), i1 = Math.floor(x1 / CELL), j0 = Math.floor(z0 / CELL), j1 = Math.floor(z1 / CELL);
    if ((i1 - i0 + 1) * (j1 - j0 + 1) > 1024) { wide.push({ b, i0, i1, j0, j1 }); return; }
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        if (!grid.has(key(i, j))) grid.set(key(i, j), []);
        grid.get(key(i, j)).push(b);
      }
    }
  };
  const poly = p => {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let k = 0; k < p.length; k += 2) { x0 = Math.min(x0, p[k]); x1 = Math.max(x1, p[k]); z0 = Math.min(z0, p[k + 1]); z1 = Math.max(z1, p[k + 1]); }
    add({ poly: p }, x0, z0, x1, z1);
  };
  const line = (p, half, road = false) => {
    for (let k = 0; k + 3 < p.length; k += 2) {
      const b = { p: p.slice(k, k + 4), half, road };
      add(b, Math.min(b.p[0], b.p[2]) - half, Math.min(b.p[1], b.p[3]) - half, Math.max(b.p[0], b.p[2]) + half, Math.max(b.p[1], b.p[3]) + half);
    }
  };
  for (const b of map.buildings) poly(b.p);
  for (const a of map.areas) if (a.k === 'water') poly(a.p);
  for (const w of map.water) line(w.p, w.w / 2);
  for (const rd of map.roads) if (!rd.foot) line(rd.p, rd.w / 2 + 0.3, true);
  const blocks = (x, z, skip) => b => {
    if (skip && b.road) return false; // a street across a square is the square's paving
    if (b.poly) return pointIn(x, z, b.poly);
    const [ax, az, bx, bz] = b.p, dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
    return Math.hypot(x - ax - t * dx, z - az - t * dz) < b.half;
  };
  const hit = (x, z, skip) => {
    const i = Math.floor(x / CELL), j = Math.floor(z / CELL), on = blocks(x, z, skip);
    return (grid.get(key(i, j)) ?? []).some(on) || wide.some(w => i >= w.i0 && i <= w.i1 && j >= w.j0 && j <= w.j1 && on(w.b));
  };
  // squares: the streets across a square (SQUARES, tables stand out on its paving) do not count
  return (x, z, m = 0, squares = false) => {
    const skip = squares && !!squareAt(x, z);
    return !hit(x, z, skip) && (!m || ![[m, 0], [-m, 0], [0, m], [0, -m]].some(([ox, oz]) => hit(x + ox, z + oz, skip)));
  };
}

// A polyline [x, z, x, z, ...] moved d metres to its left.
function offsetLine(p, d) {
  const out = [], n = p.length / 2;
  for (let k = 0; k < n; k++) {
    const a = Math.max(0, k - 1), b = Math.min(n - 1, k + 1);
    const dx = p[b * 2] - p[a * 2], dz = p[b * 2 + 1] - p[a * 2 + 1], L = Math.hypot(dx, dz) || 1;
    out.push(p[k * 2] - (dz / L) * d, p[k * 2 + 1] + (dx / L) * d);
  }
  return out;
}

// Tram tracks: two rails set in the street, and the contact wire above them on poles.
const GAUGE = 1.435 * 1.25; // standard gauge, in game metres
function osmTrams(ctx, map) {
  if (!map.trams?.length) return;
  const rails = new Batch(), grooves = new Batch(), wire = [], poles = [];
  for (const tr of map.trams) {
    // grooved rail: the steel head, with the dark slot for the wheel flange just inside it
    for (const side of [-1, 1]) {
      groundStrip(rails, offsetLine(tr.p, side * GAUGE / 2), 0.13, 0.1, 4, tr.y);
      groundStrip(grooves, offsetLine(tr.p, side * (GAUGE / 2 - 0.14)), 0.15, 0.1, 4, tr.y);
    }
    const y = k => (tr.y?.[k] ?? 0) + 6.2;
    let run = 18;
    for (let k = 0; k + 1 < tr.p.length / 2; k++) {
      const ax = tr.p[k * 2], az = tr.p[k * 2 + 1], bx = tr.p[k * 2 + 2], bz = tr.p[k * 2 + 3];
      const L = Math.hypot(bx - ax, bz - az);
      wire.push(ax, y(k), az, bx, y(k + 1), bz);
      // a pole beside the track every 35 m or so, where there is room for one
      for (run += L; run > 35; run -= 35) {
        const f = 1 - (run - 35) / Math.max(L, 1e-6), x = ax + (bx - ax) * f, z = az + (bz - az) * f;
        const nx = -(bz - az) / (L || 1), nz = (bx - ax) / (L || 1);
        for (const side of [1, -1]) {
          const px = x + nx * side * 4.2, pz = z + nz * side * 4.2;
          if (!ctx.free(px, pz, 2.6) || !ctx.clear(px, pz, 0.4)) continue; // off the raced street's pavement
          const h = (tr.y?.[k] ?? 0);
          poles.push({ x: px, z: pz, y: h });
          wire.push(px, h + 6.7, pz, x, h + 6.2, z); // the span wire out to the contact wire
          break;
        }
      }
    }
  }
  rails.mesh(ctx, mat(0x8d9196, 0.35, { metalness: 0.7 }));
  grooves.mesh(ctx, mat(0x26272a, 0.9));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(wire, 3));
  ctx.group.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x2b2d30 })));
  instanced(ctx, new THREE.CylinderGeometry(0.1, 0.14, 7, 6).translate(0, 3.5, 0), mat(0x4b5a52, 0.6, { metalness: 0.3 }), poles, (d, q) => resetDummy(d, q.x, q.y, q.z));
}

// A tour boat (rondvaartboot): a long, low, open boat with benches full of people. Its bow is +z.
export function painter(parts) {
  return (geo, hex) => {
    const g = geo.index ? geo.toNonIndexed() : geo, c = new THREE.Color(hex), n = g.attributes.position.count;
    g.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: n * 3 }, (_, i) => [c.r, c.g, c.b][i % 3]), 3));
    g.deleteAttribute('uv');
    parts.push(g);
  };
}

function boatGeometry(r) {
  const parts = [], paint = painter(parts);
  const outline = s => {
    const sh = new THREE.Shape();
    sh.moveTo(-1.5 * s, 5.5 * s);
    sh.lineTo(1.5 * s, 5.5 * s);
    sh.lineTo(1.5 * s, -3.6 * s);
    sh.quadraticCurveTo(1.2 * s, -5.3 * s, 0, -5.8 * s);
    sh.quadraticCurveTo(-1.2 * s, -5.3 * s, -1.5 * s, -3.6 * s);
    sh.closePath();
    return sh;
  };
  const slab = (s, y, h) => new THREE.ExtrudeGeometry(outline(s), { depth: h, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, y, 0);
  paint(slab(1, -0.4, 1.2), 0xf4f2ec); // the white hull, a little under water
  paint(slab(1.02, 0.75, 0.14), 0x1d3557); // its dark blue rim
  paint(slab(0.94, 0.86, 0.05), 0x8a6a48); // the wooden deck, inside the rim
  const shirts = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xffffff, 0x8e24aa, 0xff7043, 0x37474f];
  for (let row = 0; row < 5; row++) {
    const z = -2.6 + row * 1.6;
    paint(new THREE.BoxGeometry(2.4, 0.12, 0.4).translate(0, 0.95, z), 0x6d4c41);
    for (const x of [-0.75, 0, 0.75]) {
      if (r() < 0.25) continue;
      paint(new THREE.BoxGeometry(0.42, 0.55, 0.3).translate(x, 1.3, z + 0.05), shirts[Math.floor(r() * shirts.length)]);
      paint(new THREE.SphereGeometry(0.15, 8, 6).translate(x, 1.72, z + 0.05), r() < 0.5 ? 0xf1c9a5 : 0x9c6b4a);
    }
  }
  // the skipper at the back, at the wheel
  paint(new THREE.BoxGeometry(0.7, 0.9, 0.5).translate(0, 1.1, -4.6), 0xf1ede4);
  paint(new THREE.BoxGeometry(0.45, 0.6, 0.32).translate(0, 1.85, -5), 0x1d3557);
  paint(new THREE.SphereGeometry(0.16, 8, 6).translate(0, 2.3, -5), 0xf1c9a5);
  return mergeGeometries(parts);
}

// A gondola: long, slender and black, its ends curving up, the steel ferro on its bow, two
// passengers on red cushions and the gondolier standing at the back in a striped shirt and a straw
// hat, his oar in the water (left out with oar false, for a gondola that strokes its own). Its bow is +z.
function gondolaGeometry(r, oar = true) {
  const parts = [];
  const paint = (geo, hex) => {
    const g = geo.index ? geo.toNonIndexed() : geo, c = new THREE.Color(hex), n = g.attributes.position.count;
    g.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: n * 3 }, (_, i) => [c.r, c.g, c.b][i % 3]), 3));
    g.deleteAttribute('uv');
    parts.push(g);
  };
  const hull = new THREE.Shape();
  hull.moveTo(0, 5.4);
  hull.quadraticCurveTo(0.8, 2.5, 0.72, 0);
  hull.quadraticCurveTo(0.68, -3, 0, -5.2);
  hull.quadraticCurveTo(-0.62, -3, -0.66, 0);
  hull.quadraticCurveTo(-0.74, 2.5, 0, 5.4);
  paint(new THREE.ExtrudeGeometry(hull, { depth: 0.62, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -0.25, 0), 0x111111);
  // the ends rising out of the water, and the ferro on the bow
  paint(new THREE.BoxGeometry(0.14, 0.9, 1.2).rotateX(-0.6).translate(0, 0.55, 5.3), 0x111111);
  paint(new THREE.BoxGeometry(0.05, 0.75, 0.42).translate(0, 1.2, 5.75), 0xd8dde2);
  paint(new THREE.BoxGeometry(0.14, 0.6, 1.0).rotateX(0.5).translate(0, 0.4, -5.1), 0x111111);
  // the seats for the passengers, and the passengers
  paint(new THREE.BoxGeometry(0.9, 0.18, 1.6).translate(0, 0.45, 0.6), 0xb71c1c);
  const shirts = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0xffffff, 0x8e24aa, 0xff7043];
  for (const x of [-0.22, 0.22]) {
    if (r() < 0.3) continue;
    paint(new THREE.BoxGeometry(0.38, 0.5, 0.3).translate(x, 0.8, 0.5), shirts[Math.floor(r() * shirts.length)]);
    paint(new THREE.SphereGeometry(0.14, 8, 6).translate(x, 1.18, 0.5), r() < 0.5 ? 0xf1c9a5 : 0x9c6b4a);
  }
  // the gondolier, standing on the stern deck: dark trousers, a shirt of navy and white stripes
  const z = -3.9;
  paint(new THREE.BoxGeometry(0.36, 0.8, 0.26).translate(0, 0.75, z), 0x1d2a3a);
  for (let k = 0; k < 4; k++) paint(new THREE.BoxGeometry(0.42, 0.14, 0.3).translate(0, 1.22 + k * 0.14, z), k % 2 ? 0xffffff : 0x1d3557);
  paint(new THREE.SphereGeometry(0.15, 8, 6).translate(0, 1.92, z), 0xf1c9a5);
  paint(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 12).translate(0, 2.04, z), 0xe8c872); // the boater's brim
  paint(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12).translate(0, 2.1, z), 0xe8c872);
  paint(new THREE.CylinderGeometry(0.165, 0.165, 0.04, 12).translate(0, 2.06, z), 0xc62828); // its ribbon
  // the oar, from his hands down into the water on the right
  if (oar) paint(gondolaOar().translate(0.55, 0.8, z + 1.2), 0x8a6a48);
  return mergeGeometries(parts);
}
const gondolaOar = () => new THREE.BoxGeometry(0.06, 0.06, 4.2).rotateX(0.55).rotateY(0.25);

// The name across a boat's flat stern, under the rim, where you see it from behind: the city's
// boats' own (BOATS.name, <city>/city.js: Ghent's "Bootjes van Gent"), or none.
let nameMat = null;
function boatName() {
  if (!BOATS?.name) return new THREE.Group();
  if (!nameMat) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = '#1d3557';
    g.font = 'italic bold 44px Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(BOATS.name, 256, 34);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    nameMat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.7 });
  }
  const label = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.3), nameMat);
  label.position.set(0, 0.4, -5.52);
  label.rotation.y = Math.PI;
  return label;
}

// One tour boat on its own, its bow +z and its waterline at y = 0: the last boat of a quest, and
// the boat you sail when you ride into the water. In a city of gondolas (BOATS.kind, Venice) a
// gondola instead.
export function tourBoat() {
  if (BOATS?.kind === 'gondola') return gondola();
  const boat = new THREE.Mesh(boatGeometry(Math.random), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }));
  boat.add(boatName());
  return boat;
}

// A gondola on its own, its gondolier's oar a mesh of its own: its stroke(t, speed) sweeps the oar
// to and fro through the water, faster as the gondola goes faster.
function gondola() {
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 });
  const boat = new THREE.Mesh(gondolaGeometry(Math.random, false), material);
  const parts = [];
  painter(parts)(gondolaOar(), 0x8a6a48);
  // the oar turns about its top end, in the gondolier's hands
  const top = new THREE.Vector3(0, 0, -2.1).applyEuler(new THREE.Euler(0.55, 0.25, 0, 'YXZ')), at = new THREE.Vector3(0.55, 0.8, -2.7).add(top);
  const pivot = new THREE.Group();
  pivot.position.copy(at);
  pivot.add(new THREE.Mesh(mergeGeometries(parts).translate(-top.x, -top.y, -top.z), material));
  boat.add(pivot);
  boat.userData.stroke = (t, speed) => {
    const go = Math.min(1, Math.abs(speed) / 6), s = Math.sin(t * (1.2 + go * 1.6));
    pivot.rotation.set(s * 0.08 * go, s * 0.3 * go, 0);
  };
  return boat;
}

// A racing boat of the Watersportbaan: a long, narrow shell with a row of rowers one behind the
// other, each with an oar out to either side. Its bow is +z, its waterline y = 0.
export function rowingBoat() {
  const parts = [], paint = painter(parts);
  const hull = new THREE.Shape();
  hull.moveTo(-0.28, 0);
  hull.quadraticCurveTo(-0.3, 3.2, 0, 4.6);
  hull.quadraticCurveTo(0.3, 3.2, 0.28, 0);
  hull.quadraticCurveTo(0.3, -3.2, 0, -4.6);
  hull.quadraticCurveTo(-0.3, -3.2, -0.28, 0);
  paint(new THREE.ExtrudeGeometry(hull, { depth: 0.3, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -0.1, 0), 0xf2c230);
  const kits = [0xe53935, 0x1e88e5, 0xffffff, 0x43a047];
  for (let i = 0; i < 4; i++) {
    const z = -2.4 + i * 1.5, kit = kits[i];
    paint(new THREE.BoxGeometry(0.34, 0.5, 0.28).translate(0, 0.55, z), kit); // torso
    paint(new THREE.SphereGeometry(0.12, 8, 6).translate(0, 0.98, z), 0xf1c9a5); // head
    paint(new THREE.BoxGeometry(0.1, 0.1, 0.5).translate(-0.17, 0.5, z + 0.3), kit); // arms, reaching to the oar
    paint(new THREE.BoxGeometry(0.1, 0.1, 0.5).translate(0.17, 0.5, z + 0.3), kit);
    for (const s of [-1, 1]) { // the oar: a rigger, a long loom out to the side and a blade
      paint(new THREE.BoxGeometry(1.7, 0.04, 0.04).translate(s * 0.95, 0.4, z + 0.1), 0x4b5563);
      paint(new THREE.BoxGeometry(0.5, 0.02, 0.16).translate(s * 2.05, 0.1, z + 0.1), 0x1d3557);
    }
  }
  return new THREE.Mesh(mergeGeometries(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }));
}

// Someone swimming in the Blaarmeersen's lake in swimming trunks, bare-chested, doing the crawl.
// Facing +z, seen from behind and above, with the water at y = 0. Its stroke(t, speed) turns the
// arms and kicks the legs.
export function swimmer() {
  const skin = 0xf1c9a5, material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 });
  const part = (make, x, y, z) => { // a limb or the body, its own mesh turning about (x, y, z)
    const parts = [];
    make(painter(parts));
    const mesh = new THREE.Mesh(mergeGeometries(parts), material), pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    pivot.add(mesh);
    return pivot;
  };
  const group = new THREE.Group();
  group.add(part(paint => {
    paint(new THREE.BoxGeometry(0.5, 0.2, 0.5).translate(0, 0, -0.1), skin); // the bare back and shoulders
    paint(new THREE.BoxGeometry(0.44, 0.2, 0.4).translate(0, -0.02, -0.55), 0x1e88e5); // the swimming trunks
    paint(new THREE.SphereGeometry(0.13, 8, 6).translate(0, 0.05, 0.28), 0x5b3a29); // the head
  }, 0, 0, 0));
  const limb = (geo, x, y, z) => { const l = part(paint => paint(geo, skin), x, y, z); group.add(l); return l; };
  const arms = [-1, 1].map(s => limb(new THREE.BoxGeometry(0.12, 0.08, 0.6).translate(0, 0, 0.3), s * 0.34, 0.05, 0.1));
  const legs = [-1, 1].map(s => limb(new THREE.BoxGeometry(0.13, 0.1, 0.5).translate(0, 0, -0.25), s * 0.1, -0.05, -0.7));
  group.scale.setScalar(1.2);
  group.userData.stroke = (t, speed) => {
    const k = 3 + Math.min(1, Math.abs(speed) / 6) * 4; // strokes come faster as you swim faster
    arms.forEach((a, i) => { a.rotation.x = -t * k + i * Math.PI; });
    legs.forEach((l, i) => { l.rotation.x = Math.sin(t * k * 2.5 + i * Math.PI) * 0.35; });
    group.rotation.z = Math.sin(t * k) * 0.12; // rolling a little with each stroke
  };
  return group;
}

// The houseboats and the old ships moored along the quays, which the map has as buildings standing
// in the water: each a hull afloat on the water's surface, as long and wide as its outline, with
// a low cabin on its deck, a row of windows down each side and a flat roof. All of them one mesh.
function mooredBoats(ctx, map) {
  const boats = map.buildings.filter(b => BOAT_KINDS.has(b.k) && !b.gone);
  if (!boats.length) return;
  const pools = map.areas.filter(a => a.k === 'water' && a.level != null);
  const hulls = [0x22313f, 0x3b2a22, 0x1f3b2e, 0x6b1f1f, 0x2b2b2b], cabins = [0xece7da, 0xd8c6a0, 0x8fa89a, 0xa9bccf, 0x9a6b4a, 0xf2f0ea];
  const parts = [];
  boats.forEach((b, n) => {
    const p = b.p;
    // its outline's tightest box, turned along one of its edges: the hull
    let best = null;
    for (let k = 0; k < p.length; k += 2) {
      const j = (k + 2) % p.length, dx = p[j] - p[k], dz = p[j + 1] - p[k + 1], L = Math.hypot(dx, dz);
      if (L < 0.5) continue;
      const ux = dx / L, uz = dz / L;
      let a0 = Infinity, a1 = -Infinity, c0 = Infinity, c1 = -Infinity;
      for (let m = 0; m < p.length; m += 2) {
        const a = p[m] * ux + p[m + 1] * uz, c = -p[m] * uz + p[m + 1] * ux;
        a0 = Math.min(a0, a); a1 = Math.max(a1, a); c0 = Math.min(c0, c); c1 = Math.max(c1, c);
      }
      const box = { ux, uz, len: a1 - a0, wid: c1 - c0, ma: (a0 + a1) / 2, mc: (c0 + c1) / 2 };
      if (box.len < box.wid) Object.assign(box, { ux: -uz, uz: ux, len: box.wid, wid: box.len, ma: box.mc, mc: -box.ma });
      if (!best || box.len * box.wid < best.len * best.wid) best = box;
    }
    if (!best) return;
    const { ux, uz, len, wid } = best, cx = best.ma * ux - best.mc * uz, cz = best.ma * uz + best.mc * ux;
    const level = pools.find(a => pointIn(cx, cz, a.p))?.level ?? WATER;
    const h1 = hashOf(n + 7), h2 = hashOf(n + 19), kit = new Kit();
    const hull = hulls[Math.floor(h1 * hulls.length)], cabin = cabins[Math.floor(h2 * cabins.length)];
    kit.box(len, 1.3, wid, hull, 0, level - 0.25, 0); // the hull, half of it under water
    kit.box(len + 0.06, 0.12, wid + 0.06, 0xf4f2ec, 0, level + 0.36, 0); // a white band along its rim
    kit.box(len - 0.3, 0.06, wid - 0.3, 0x8a6a48, 0, level + 0.43, 0); // the deck
    // the cabin: most of its length, off towards the stern, a little in from the sides
    const cl = Math.max(2, len - Math.min(4, len * 0.25)), cw = Math.max(1.5, wid - 0.9), ch = len > 30 ? 2.6 : 2.3, co = -(len - cl) / 2 + 0.4;
    kit.box(cl, ch, cw, cabin, co, level + 0.46 + ch / 2, 0);
    kit.box(cl + 0.5, 0.16, cw + 0.5, 0x3a3d40, co, level + 0.46 + ch + 0.08, 0); // its flat roof, overhanging
    for (let x = -cl / 2 + 1.2; x <= cl / 2 - 1; x += 2.2) {
      for (const side of [1, -1]) kit.box(1.2, 0.85, 0.05, 0x2a3440, co + x, level + 0.46 + ch * 0.6, side * (cw / 2 + 0.02));
    }
    const geo = kit.geometry();
    geo.rotateY(Math.atan2(-uz, ux)).translate(cx, 0, cz);
    parts.push(geo);
  });
  if (parts.length) mesh(ctx, mergeGeometries(parts), kitMat(0.8), 0, 0, 0);
}

// Tour boats going slowly up and down the river and the canals, keeping to the right; or, where
// the city has them (BOATS.kind 'gondola': Venice), gondolas, more of them, slower, nearer the
// middle of the narrow canals.
function osmBoats(ctx, map) {
  const { r } = ctx, gondolas = BOATS?.kind === 'gondola';
  const lineLength = p => { let L = 0; for (let k = 0; k + 3 < p.length; k += 2) L += Math.hypot(p[k + 2] - p[k], p[k + 3] - p[k + 1]); return L; };
  const lines = map.water.filter(w => w.w >= 10).map(w => ({ ...w, L: lineLength(w.p) })).filter(w => w.L > (gondolas ? 40 : 80)).sort((a, b) => b.L - a.L);
  if (!lines.length) return;
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 });
  const most = gondolas ? 16 : 8, every = gondolas ? 160 : 400, boats = [];
  for (const w of lines) {
    for (let k = 0; k < Math.max(1, Math.round(w.L / every)) && boats.length < most; k++) boats.push({ w, s: r() * w.L, dir: r() < 0.5 ? 1 : -1, v: gondolas ? 0.9 + r() * 0.5 : 1.6 + r() * 0.8 });
    if (boats.length >= most) break;
  }
  for (const b of boats) {
    b.mesh = mesh(ctx, gondolas ? gondolaGeometry(r) : boatGeometry(r), material, 0, WATER, 0);
    if (!gondolas) b.mesh.add(boatName());
  }
  const at = (w, s) => {
    let k = 0;
    for (; k + 3 < w.p.length; k += 2) {
      const L = Math.hypot(w.p[k + 2] - w.p[k], w.p[k + 3] - w.p[k + 1]);
      if (s <= L || k + 5 >= w.p.length) {
        const f = Math.min(1, s / (L || 1));
        return [w.p[k] + (w.p[k + 2] - w.p[k]) * f, w.p[k + 1] + (w.p[k + 3] - w.p[k + 1]) * f, (w.p[k + 2] - w.p[k]) / (L || 1), (w.p[k + 3] - w.p[k + 1]) / (L || 1)];
      }
      s -= L;
    }
    return [w.p[0], w.p[1], 1, 0];
  };
  const place = (b, dt) => {
    b.s += b.dir * b.v * dt;
    if (b.s < 8 || b.s > b.w.L - 8) { b.dir = -b.dir; b.s = Math.max(8, Math.min(b.w.L - 8, b.s)); } // turn round at the end
    const [x, z, ux, uz] = at(b.w, b.s), dx = ux * b.dir, dz = uz * b.dir, off = b.w.w * (gondolas ? 0.06 : 0.22);
    // a turn takes a while: ease the heading round
    const yaw = Math.atan2(dx, dz);
    b.yaw = b.yaw == null ? yaw : b.yaw + Math.atan2(Math.sin(yaw - b.yaw), Math.cos(yaw - b.yaw)) * Math.min(1, dt * 0.8);
    b.mesh.position.set(x - dz * off, WATER, z + dx * off);
    b.mesh.rotation.y = b.yaw;
  };
  for (const b of boats) place(b, 0);
  ctx.updaters.push(dt => { for (const b of boats) place(b, Math.min(dt, 0.1)); });
}

function context(group, track, cfg, seed) {
  const ctx = { group, track, cfg, theme: cfg.theme, hw: track.hw, r: mulberry32(seed), dummy: new THREE.Object3D(), updaters: [] };
  ctx.free = (x, z, margin = 8) => track.distTo(x, z) > track.hw + margin;
  ctx.update = (dt, t) => { for (const u of ctx.updaters) u(dt, t); };
  return ctx;
}

// The city itself: the sky, the ground, the water, the buildings and what moves through the city on
// its own. It is the same for every route through the map, so it is built once (it takes seconds).
// tracks: every route, so the café terraces keep out of all the raced streets.
export function buildCity(group, tracks, cfg) {
  const all = { hw: tracks[0].hw, distTo: (x, z) => Math.min(...tracks.map(t => t.distTo(x, z))) };
  const ctx = context(group, all, cfg, 9000), map = cfg.map;
  ctx.clear = clearance(map);
  ctx.targets = []; // who stands or sits still and can be hit by a paintball (js/splat.js)
  const paintSky = sky(ctx);
  ground(ctx);
  const mats = groundMats(ctx);
  osmGround(ctx, map, mats);
  bankSheep(ctx, map);
  const trams = addTrams(ctx, map.trams, TRAM_HALTS, TRAM_CENTRE, TRAM_LINES);
  addStops(ctx, STOPS);
  // the tram lines' stops: a platform, the tall sign and the board with the next trams
  const ledges = addTramStops(ctx, TRAM_STOPS, trams);
  const signals = addSignals(ctx, SIGNALS, CROSSINGS);
  const traffic = addTraffic(ctx, map, tracks, BUS_LINES, signals);
  osmBoats(ctx, map);
  mooredBoats(ctx, map);
  ctx.landmarks = addLandmarks(ctx.group, (x, z, r, make) => later(ctx.group, x, z, r, make)); // each built once in sight
  osmBuildings(ctx, map);
  addSitters(ctx, map);
  const posts = addFurniture(ctx, map);
  clouds(ctx);
  return {
    clear: ctx.clear, update: ctx.update, traffic, trams, ledges, posts, targets: ctx.targets, setNight: furnitureNight,
    paintSky, cloudMat: ctx.cloudMat, grass: [ctx.groundPlane.material, mats.garden, mats.park], // what snow covers
  };
}

// What lines one route: the tram wires on poles clear of its pavements, the trees, the parked cars
// and the bikes.
export function buildScenery(group, track, cfg, city) {
  const ctx = context(group, track, cfg, cfg.seed), map = cfg.map;
  ctx.clear = city.clear;
  osmTrams(ctx, map);
  osmTrees(ctx, map);
  osmCars(ctx, map);
  osmBikes(ctx, map);
  return { update: ctx.update };
}
