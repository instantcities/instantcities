// Shared, smooth silhouettes for people. Crowd parts remain one geometry per moving part,
// so shaping a face or a sleeve does not add a draw call for every person in the city.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function ellipsoid(x, y, z, segments = 16, rings = 12) {
  return new THREE.SphereGeometry(1, segments, rings).scale(x, y, z);
}

export function profile(points, depth = 1, segments = 16, smooth = false) {
  const outline = smooth
    ? new THREE.CatmullRomCurve3(points.map(([r, y]) => new THREE.Vector3(r, y, 0))).getPoints(48).map(p => new THREE.Vector2(Math.max(0, p.x), p.y))
    : points.map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(outline, segments).scale(1, 1, depth);
}

// Centred at the waist/chest midpoint, with a rounded hem, waist, shoulders and neckline.
export function humanTorso(width = 0.42, height = 0.62, depth = 0.25) {
  return profile([[0, -0.5], [0.34, -0.5], [0.4, -0.46], [0.37, -0.25],
    [0.44, 0.18], [0.49, 0.32], [0.48, 0.39], [0.3, 0.47], [0.18, 0.5], [0, 0.5]]
    .map(([r, y]) => [r * width, y * height]), depth / width);
}

// A sleeve or trouser leg hanging from the origin. Subtle changes in radius suggest
// the elbow/knee and wrist/ankle instead of a straight rectangular bar.
export function humanLimb(width, length) {
  return profile([[0, -length - width * 0.12], [width * 0.29, -length], [width * 0.34, -length * 0.94],
    [width * 0.42, -length * 0.65], [width * 0.36, -length * 0.49],
    [width * 0.49, -length * 0.26], [width * 0.5, -length * 0.08],
    [width * 0.44, 0], [width * 0.3, width * 0.2], [0, width * 0.3]], 1.06, 12);
}

export function humanShoe(width = 0.14, height = 0.09, length = 0.26) {
  return ellipsoid(width * 0.52, height * 0.56, length * 0.53, 12, 8).translate(0, 0, length * 0.08);
}

// Face along +Z, including a chin, ears and nose. Eyes and lips are fused into a
// separate geometry so ordinary meshes and instanced crowds can share the same face.
export function humanHead(radius = 0.15, segments = 16, rings = 12) {
  const shape = (x, y, z) => ellipsoid(x, y, z, segments, rings);
  const skull = shape(0.91, 1.12, 0.92), p = skull.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const jaw = Math.max(0, -p.getY(i) - 0.15);
    p.setX(i, p.getX(i) * (1 - jaw * 0.16));
    if (p.getZ(i) > 0) p.setZ(i, p.getZ(i) + jaw * 0.1);
  }
  skull.computeVertexNormals();
  return mergeGeometries([
    skull,
    shape(0.38, 0.44, 0.37).translate(0, -1.15, -0.06),
    shape(0.15, 0.23, 0.16).translate(-0.9, -0.05, 0),
    shape(0.15, 0.23, 0.16).translate(0.9, -0.05, 0),
    shape(0.15, 0.26, 0.23).translate(0, -0.02, 0.88),
  ]).scale(radius, radius, radius);
}

export function humanFeatures(radius = 0.15) {
  return mergeGeometries([
    ...[-1, 1].flatMap(s => [
      ellipsoid(0.085, 0.055, 0.04, 8, 6).translate(s * 0.34, 0.16, 0.856),
      ellipsoid(0.14, 0.025, 0.035, 8, 6).rotateZ(s * -0.1).translate(s * 0.34, 0.32, 0.84),
    ]),
    ellipsoid(0.2, 0.024, 0.025, 8, 6).translate(0, -0.44, 0.89),
  ]).scale(radius, radius, radius);
}

export function humanHair(radius = 0.16) {
  const geo = new THREE.SphereGeometry(radius, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.63);
  // A higher hairline at the face, longer at the nape.
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), front = Math.max(0, p.getZ(i) / radius);
    p.setY(i, y + front * Math.max(0, 1 - y / radius) * radius * 0.35);
  }
  geo.computeVertexNormals();
  return geo.scale(0.94, 1.08, 0.95);
}

export function tube(points, radius, segments = 20, sides = 8) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), segments, radius, sides, false);
}

// Neutral vertex tints multiply each person's chosen skin/clothing colour. This keeps
// tiny facial features and shoe soles in the existing crowd draw calls.
export function shaded(geometry, shade = 1) {
  const colors = new Float32Array(geometry.attributes.position.count * 3).fill(shade);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function humanFace(radius = 0.15) {
  return mergeGeometries([shaded(humanHead(radius, 10, 8)), shaded(humanFeatures(radius), 0.075)]);
}

export function trouserLeg(width = 0.14, length = 0.82) {
  return mergeGeometries([
    shaded(humanLimb(width, length - 0.035)),
    shaded(humanShoe(width, 0.085, width * 1.8).translate(0, -length + 0.025, 0.045), 0.14),
  ]);
}
