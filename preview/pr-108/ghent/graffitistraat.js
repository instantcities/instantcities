// Werregarenstraat / Graffitistraatje, drawn from the narrow, painted alley in reference photos.
// OSM's centreline is useful, but the generic road width and missing courtyard walls leave it open.
// Keep the downloaded map intact: the city applies this width and these walls at runtime.
import * as THREE from 'three';
import { MAP } from './map.js';
import { elevation, ashlar, rng, letGo } from '../core/js/facades.js';

export const ALLEY_NAME = 'Werregarenstraat';
export const ALLEY_WIDTH = 3; // game metres (2.4 real metres), clear between the wall faces
const THICK = 0.28, X = 73, Z = -297;

// Join OSM's split ways by their shared endpoints, retaining every bend, independent of way order.
const ways = MAP.roads.filter(r => MAP.names[r.n] === ALLEY_NAME).map(r => r.p);
const ends = new Map();
for (const p of ways) for (const k of [0, p.length - 2]) {
  const key = `${p[k]},${p[k + 1]}`;
  ends.set(key, (ends.get(key) ?? 0) + 1);
}
const start = [...ends].filter(([, n]) => n === 1).map(([p]) => p.split(',').map(Number)).sort((a, b) => a[1] - b[1])[0];
const line = start ? [...start] : [];
const remaining = [...ways];
while (remaining.length && line.length) {
  const [x, z] = line.slice(-2);
  const i = remaining.findIndex(p => (p[0] === x && p[1] === z) || (p.at(-2) === x && p.at(-1) === z));
  if (i < 0) throw new Error('Disconnected Werregarenstraat centreline');
  const p = remaining.splice(i, 1)[0];
  const points = Array.from({ length: p.length / 2 }, (_, k) => p.slice(k * 2, k * 2 + 2));
  if (p[0] !== x || p[1] !== z) points.reverse();
  line.push(...points.slice(1).flat());
}
// Leave both streets' carriageway and pavement clear: OSM joins the alley at their road centres,
// so stop the walls at the building lines, about 5 m out from Onderstraat's centre and 6.5 m from
// Hoogpoort's. A setback longer than the end segment drops that bend instead of folding back.
function trim(p, setback) {
  for (;;) {
    const dx = p[2] - p[0], dz = p[3] - p[1], d = Math.hypot(dx, dz);
    if (d > setback + 0.5 || p.length <= 4) {
      const t = Math.min(setback, d - 0.5) / d;
      p[0] += dx * t; p[1] += dz * t;
      return p;
    }
    setback = Math.max(0, setback - d);
    p.splice(0, 2);
  }
}
const reversed = p => Array.from({ length: p.length / 2 }, (_, k) => p.slice(p.length - k * 2 - 2, p.length - k * 2)).flat();
if (line.length) line.splice(0, line.length, ...reversed(trim(reversed(trim(line, 5)), 6.5)));
export const ALLEY_LINE = line;

// Mitered offsets keep both sides continuous through the bends, with matching collision rings.
function offset(distance) {
  return Array.from({ length: line.length / 2 }, (_, k) => {
    const normal = (a, b) => {
      const dx = line[b * 2] - line[a * 2], dz = line[b * 2 + 1] - line[a * 2 + 1], d = Math.hypot(dx, dz);
      return [-dz / d, dx / d];
    };
    const last = line.length / 2 - 1;
    const a = normal(Math.max(0, k - 1), k || 1), b = normal(k === last ? k - 1 : k, Math.min(last, k + 1));
    const nx = a[0] + b[0], nz = a[1] + b[1], divisor = nx * b[0] + nz * b[1];
    return [line[k * 2] + distance * nx / divisor, line[k * 2 + 1] + distance * nz / divisor];
  });
}
const sides = [-1, 1].map(side => ({ side, inner: offset(side * ALLEY_WIDTH / 2), outer: offset(side * (ALLEY_WIDTH / 2 + THICK)) }));
export const ALLEY_FOOT = sides.flatMap(({ inner, outer }) => inner.slice(1).map((b, k) => [...inner[k], ...b, ...outer[k + 1], ...outer[k]]));

// Some OSM building corners sit on the alley's centreline; one thin outline represents a
// boundary wall as a five-storey building. Replace that strip with our wall, and tuck the other
// nearby corners behind the new wall faces so the full-size rider can pass.
export function withAlleyClearance(buildings) {
  const clearance = ALLEY_WIDTH / 2 + THICK + 0.08;
  const nearest = (x, z) => {
    let best = { d: Infinity };
    for (let k = 0; k + 3 < line.length; k += 2) {
      const ax = line[k], az = line[k + 1], dx = line[k + 2] - ax, dz = line[k + 3] - az;
      const length = Math.hypot(dx, dz), t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / length ** 2));
      const cx = ax + dx * t, cz = az + dz * t, d = Math.hypot(x - cx, z - cz);
      if (d < best.d) best = { d, cx, cz, nx: -dz / length, nz: dx / length };
    }
    return best;
  };
  const xs = line.filter((_, k) => k % 2 === 0), zs = line.filter((_, k) => k % 2 === 1);
  const minX = Math.min(...xs) - clearance, maxX = Math.max(...xs) + clearance;
  const minZ = Math.min(...zs) - clearance, maxZ = Math.max(...zs) + clearance;
  const street = MAP.names.indexOf(ALLEY_NAME);
  return buildings.map(b => {
    // These are courtyard backs: generic shop signs and awnings must not project into the lane.
    if (b.st === street) b = { ...b, shop: undefined, fe: undefined };
    // A guessed rectangular roof must not bridge over this open-air passage.
    if (b.r) {
      const [cx, cz, angle, length, width] = b.r, c = Math.cos(angle), s = Math.sin(angle);
      const spills = line.some((x, k) => {
        if (k % 2) return false;
        const dx = x - cx, dz = line[k + 1] - cz;
        return Math.abs(dx * c + dz * s) < length / 2 + 0.4 && Math.abs(-dx * s + dz * c) < width / 2 + 0.4;
      });
      if (spills) b = { ...b, r: null };
    }
    if (b.gone || !b.p.some((x, k) => k % 2 === 0 && x >= minX && x <= maxX && b.p[k + 1] >= minZ && b.p[k + 1] <= maxZ)) return b;
    const points = Array.from({ length: b.p.length / 2 }, (_, k) => b.p.slice(k * 2, k * 2 + 2));
    if (!points.some(([x, z]) => nearest(x, z).d < clearance)) return b;
    if (points.every(([x, z]) => nearest(x, z).d < clearance)) return { ...b, gone: true };
    const cx = points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const cz = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    const p = points.flatMap(([x, z]) => {
      const q = nearest(x, z);
      if (q.d >= clearance) return [x, z];
      const cross = (x - q.cx) * q.nx + (z - q.cz) * q.nz;
      const side = Math.sign(Math.abs(cross) > 0.05 ? cross : (cx - q.cx) * q.nx + (cz - q.cz) * q.nz) || 1;
      return [q.cx + q.nx * side * clearance, q.cz + q.nz * side * clearance];
    });
    return { ...b, p, r: null, fe: undefined };
  });
}

const PAINT = ['#cc536f', '#299c98', '#d7ad38', '#8258a3', '#c65d37', '#428dab', '#d7d9c6'];
const BAY = 24, HIGH = 7.2, PIXELS = 64;
function graffiti(g, w, h, seed, side) {
  const r = rng(seed), pick = () => PAINT[Math.floor(r() * PAINT.length)];
  ashlar(g, -w / 2, 0, w / 2, h, side < 0 ? '#746858' : '#b7b5a8', { course: 0.16, seed, vary: 0.2 });
  // Uneven whitewash, old murals, and repainting: paint almost obliterates the brick below.
  for (let i = 0; i < 140; i++) {
    const x = -w / 2 + r() * w, y = r() * h, wide = 0.4 + r() * 3, high = 0.4 + r() * 2.3;
    g.globalAlpha = 0.25 + r() * 0.5; g.fillStyle = i % 5 === 0 ? '#d9d5c4' : pick();
    g.beginPath(); g.moveTo(x, y);
    g.lineTo(x + wide, y + r() * 0.15); g.lineTo(x + wide - r() * 0.2, y + high);
    g.lineTo(x - r() * 0.2, y + high - r() * 0.3); g.closePath(); g.fill();
  }
  g.globalAlpha = 1;
  // Broad pieces use real letter silhouettes, each with its own scale, slant, fill and outline.
  const words = ['GENT', 'FLOW', 'ART', '9000', 'FREE', 'ZONE', 'YES', 'SOUL', 'NOIR'];
  for (let i = 0; i < 23; i++) {
    g.save(); g.translate(-w / 2 + r() * w, 0.7 + r() * 4.7); g.scale(0.6 + r() * 0.6, -1);
    g.transform(1, (r() - 0.5) * 0.18, (r() - 0.5) * 0.5, 1, 0, 0);
    const size = 0.65 + r() * 1.25, word = words[i % words.length];
    g.font = `900 ${size}px ${i % 3 ? 'sans-serif' : 'serif'}`;
    g.lineJoin = 'round'; g.lineWidth = 0.17; g.strokeStyle = '#ece1c9'; g.strokeText(word, 0.08, 0.05);
    g.lineWidth = 0.09; g.strokeStyle = '#29242d'; g.strokeText(word, 0, 0);
    const gradient = g.createLinearGradient(0, -size, 0, 0.1); gradient.addColorStop(0, pick()); gradient.addColorStop(1, pick());
    g.fillStyle = gradient; g.fillText(word, 0, 0); g.restore();
  }
  // Hundreds of loose handstyle strokes cross the earlier pieces; no regular rows or repeated bubbles.
  for (let i = 0; i < 190; i++) {
    const x = -w / 2 + r() * w, y = 0.15 + r() * 5.8, size = 0.18 + r() * 0.55;
    g.strokeStyle = i % 4 === 0 ? '#ded7c3' : i % 3 === 0 ? '#302732' : pick();
    g.lineWidth = 0.018 + r() * 0.04; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y);
    for (let j = 0; j < 5; j++) {
      const xx = x + j * size * 0.55;
      g.bezierCurveTo(xx - size * 0.4, y + size, xx + size * 0.7, y - size * 0.5, xx + size * 0.5, y + size * (r() - 0.5));
    }
    g.stroke();
    if (i % 3 === 0) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + size * 3.2, y - size * 0.3); g.stroke(); }
    if (i % 4 === 0) { g.fillStyle = g.strokeStyle; g.fillRect(x, y - 0.3 - r() * 0.6, 0.025, 0.3 + r() * 0.6); }
  }
  // Mortar still shows through the paint, together with flecks of exposed brick and weathering.
  g.globalAlpha = 0.18; g.strokeStyle = '#302c29'; g.lineWidth = 0.012;
  for (let y = 0; y < h; y += 0.16) { g.beginPath(); g.moveTo(-w / 2, y); g.lineTo(w / 2, y); g.stroke(); }
  for (let i = 0; i < 1800; i++) { g.fillStyle = i % 2 ? '#ddd2bc' : '#433f36'; g.fillRect(-w / 2 + r() * w, r() * h, 0.01 + r() * 0.07, 0.02 + r() * 0.05); }
  g.globalAlpha = 1;
  // The worn, painted plinth and pale sloping coping visible in the reference photos.
  g.fillStyle = '#3d3937'; g.globalAlpha = 0.62; g.fillRect(-w / 2, 0, w, 0.48); g.globalAlpha = 1;
  g.strokeStyle = '#bdb8a5'; g.lineWidth = 0.08; g.beginPath(); g.moveTo(-w / 2, 0.5); g.lineTo(w / 2, 0.5); g.stroke();
  // Painted service doors, framed in dark metal, break up the long courtyard walls.
  for (const x of [-8.3, 3.2]) {
    g.strokeStyle = '#33332f'; g.lineWidth = 0.09; g.strokeRect(x, 0.05, 1.1, 2.75);
    g.fillStyle = '#252c2c'; g.fillRect(x + 0.08, 0.08, 0.94, 2.6); g.globalAlpha = 0.8;
    g.strokeStyle = pick(); g.lineWidth = 0.04;
    for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(x + 0.5, 0.35 + i * 0.27, 0.35, 0.2, i * 0.8, 0, Math.PI * 2); g.stroke(); }
    g.globalAlpha = 1; g.fillStyle = '#a49c83'; g.fillRect(x + 0.85, 1.1, 0.15, 0.05);
  }
}

function alley() {
  const group = new THREE.Group();
  const plain = new THREE.MeshStandardMaterial({ color: 0x817a71, roughness: 1 });
  const coping = new THREE.MeshStandardMaterial({ color: 0xb5b1a1, roughness: 1 });
  const paints = sides.map(({ side }) => {
    const draw = (g, w, h) => graffiti(g, w, h, side < 0 ? 37 : 138, side);
    const texture = elevation(BAY, HIGH, PIXELS, draw);
    letGo(texture, () => {
      const c = texture.image; c.width = Math.ceil(BAY * PIXELS); c.height = Math.ceil(HIGH * PIXELS);
      const g = c.getContext('2d'); g.setTransform(PIXELS, 0, 0, -PIXELS, BAY / 2 * PIXELS, HIGH * PIXELS); draw(g, BAY, HIGH);
    });
    texture.wrapS = THREE.RepeatWrapping;
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 1 });
  });
  const distances = [0];
  for (let k = 2; k < line.length; k += 2) distances.push(distances.at(-1) + Math.hypot(line[k] - line[k - 2], line[k + 1] - line[k - 1]));
  sides.forEach(({ side, inner, outer }, s) => inner.slice(1).forEach((b, k) => {
    const a = inner[k], height = (side < 0 ? 6.3 : 5.2) + [0, 0.6, -0.3, 0.35][Math.floor(distances[k] / 16) % 4];
    const p = [...a, ...b, ...outer[k + 1], ...outer[k]];
    const shape = new THREE.Shape(Array.from({ length: 4 }, (_, i) => new THREE.Vector2(p[i * 2] - X, -(p[i * 2 + 1] - Z))));
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
    geometry.rotateX(-Math.PI / 2);
    const wall = new THREE.Mesh(geometry, plain); wall.castShadow = wall.receiveShadow = true; group.add(wall);
    const capGeometry = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false }); capGeometry.rotateX(-Math.PI / 2);
    const cap = new THREE.Mesh(capGeometry, coping); cap.position.y = height; cap.castShadow = true; group.add(cap);
    const dx = b[0] - a[0], dz = b[1] - a[1], length = Math.hypot(dx, dz);
    const face = new THREE.PlaneGeometry(length, height), uv = face.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (distances[k] + uv.getX(i) * length) / BAY, uv.getY(i) * height / HIGH);
    const mural = new THREE.Mesh(face, paints[s]);
    mural.position.set((a[0] + b[0]) / 2 - X + side * dz / length * 0.012, height / 2, (a[1] + b[1]) / 2 - Z - side * dx / length * 0.012);
    mural.rotation.y = -Math.atan2(dz, dx) + (side > 0 ? Math.PI : 0); mural.receiveShadow = true; group.add(mural);
  }));
  return group;
}

export const GRAFFITISTRAAT = [{ id: 'graffitistraatje', name: 'Graffitistraatje', x: X, z: Z, turn: 0, reach: 85, area: ALLEY_FOOT, foot: ALLEY_FOOT, make: alley }];
