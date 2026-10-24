// The Gravensteen's curtain wall (1180, restored 1893-1913), modelled by hand from photos: Gent in
// 3D has the keep, the count's residence, the gatehouse and the round tower, but not the wall round
// them, which is what makes it a castle. Its line is OpenStreetMap's (way 87239553, an open ring
// from the gatehouse's north side, round the moat and back to its south side), in game metres.
// Every half-round bump in that line is one of its flanking towers: a plain shaft up the wall, with
// round blind arches low down, and on top a turret corbelled out, crenellated, with wooden shutters
// hung in the crenels.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { elevation, ashlar, roundArch, shade } from '../core/js/facades.js';

export const CASTLE_WALL = [
  -231.6, -504.1, -230.4, -510.8, -229.2, -510.4, -227.8, -510.4, -227.2, -511.2, -227, -512.4,
  -227.4, -513.4, -228.1, -513.9, -229, -513.9, -229.8, -513.7, -228.5, -520.7, -227.7, -520.5,
  -226.6, -520.6, -225.6, -521.7, -225.8, -523, -226.5, -523.8, -227.2, -523.8, -228.4, -523.6,
  -228.2, -529.9, -227, -529.9, -226, -530.4, -226, -531.8, -226.5, -533, -227.3, -533.2, -228.5,
  -533, -229.2, -540, -227.8, -540.1, -226.8, -541.2, -227.1, -542.5, -227.9, -543.4, -228.9,
  -543.8, -230, -543.3, -232, -549.1, -231.1, -549.9, -230.7, -550.9, -230.8, -552.3, -232.1,
  -553.2, -233.3, -553.1, -234.2, -552.3, -237.5, -556.5, -236.6, -557.3, -236.3, -558.6, -237.3,
  -559.9, -238.8, -560.5, -240, -560, -240.8, -559.2, -241, -558.3, -247, -560.9, -246.4, -561.9,
  -246.5, -563, -247, -564.1, -248.5, -564.7, -250, -564.4, -250.9, -563.5, -251, -562.3, -252.7,
  -562.7, -255.9, -563.3, -255.4, -564.6, -255.8, -565.8, -257, -566.5, -258.5, -566.7, -259.8,
  -566.1, -260.2, -565.3, -260.1, -564, -266.4, -564.4, -266.2, -565.6, -267, -566.8, -268.8,
  -567.1, -270.4, -566.4, -270.8, -565.6, -270.5, -564.5, -276.4, -563.4, -276.7, -564.5, -277.4,
  -565.2, -279.1, -564.8, -280, -564.2, -280.5, -563.3, -280.1, -562, -283.4, -560.8, -283.6,
  -561.8, -284.4, -562.6, -285.8, -562.2, -286.8, -561.1, -286.8, -560.1, -286.2, -559.5, -288.9,
  -557.5, -289.5, -558.4, -290.5, -558.4, -291.8, -557.8, -292.7, -556.7, -292.7, -555.4, -291.8,
  -554.6, -294, -552.8, -294.9, -553.6, -295.8, -553.4, -297, -552.4, -297.3, -551, -296.3, -550.2,
  -298.1, -547, -299.3, -547.4, -300, -547.1, -300.9, -545.9, -300.6, -544.6, -299.1, -544.1,
  -300.1, -539.6, -301, -540, -301.9, -540, -302.6, -538.9, -302.4, -537.5, -301.6, -537.1, -300.7,
  -536.9, -301.2, -532.8, -302.5, -533.2, -303.3, -532.7, -303.8, -531.4, -303.6, -530.1, -302.5,
  -529.3, -301.4, -529.1, -301.5, -526.2, -302.5, -526.4, -303.4, -525.2, -303.2, -523.6, -302.3,
  -522.9, -301.2, -523.1, -300.9, -518.7, -302, -518.8, -302.8, -517.4, -302.6, -515.7, -301.8,
  -514.7, -300.6, -514.9, -299.8, -505.6, -301.1, -505.1, -301.7, -503.7, -301.4, -501.9, -300.3,
  -500.9, -299.1, -500.8, -297.9, -493.7, -300.9, -493, -300.4, -490.6, -298.8, -489.1, -297.5,
  -488.3, -297.3, -486.7, -296.6, -485.6, -295.5, -484.6, -294.2, -484.3, -292.9, -484.3, -292,
  -482.9, -292, -480.3, -291.6, -479.4, -290.7, -479.1, -288.8, -479.5, -286.3, -477.9, -286.7,
  -477.3, -286.8, -475.8, -285.5, -474.1, -283.6, -474.2, -282.8, -475.2, -277.7, -472.9, -277.5,
  -471.6, -276.9, -469.9, -275.7, -469, -273.9, -469.1, -273.1, -470.1, -272.8, -471.2, -268,
  -470.8, -267.3, -469.5, -265.9, -468.9, -264.1, -468.9, -263.2, -470, -262.8, -470.9, -258.9,
  -472.2, -258.5, -471.6, -257.5, -471.1, -256.3, -470.8, -254.8, -471.3, -253.8, -472.4, -253.4,
  -474, -248.9, -476, -247.8, -475.4, -246.6, -475.2, -245.4, -475.6, -244.5, -476.3, -244.1,
  -477.7, -244.4, -478.9, -242.2, -481.8, -240.1, -481.5, -239, -482, -238, -483.1, -237.7, -484,
  -238.7, -486.5, -234.5, -492
];

export const CASTLE_STONE = '#a3a097';
const WALL_H = 13.75; // 11 m
const THICK = 2.2;
const TURRET_H = 4.2; // how far a turret rises above the wall walk
const WOOD = 0x5b4128;

// The two little round turrets against the keep's east side, under their brown conical roofs.
const KEEP_TURRETS = [[-250.8, -519.5, 2.2], [-249.2, -538.1, 2.2]];

// The ring as points, the towers as { c: [x, z], r, out: [nx, nz] } and the wall's line with the
// towers' bumps cut off (each bump replaced by its chord).
function plan() {
  const P = [];
  for (let k = 0; k < CASTLE_WALL.length; k += 2) P.push([CASTLE_WALL[k], CASTLE_WALL[k + 1]]);
  let area = 0;
  P.forEach((p, k) => { const q = P[(k + 1) % P.length]; area += p[0] * q[1] - q[0] * p[1]; });
  const turn = Math.sign(area); // which side of each segment is outside
  const outward = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(turn * (b[1] - a[1])) / L, (-turn * (b[0] - a[0])) / L]; };
  const short = P.slice(1).map((p, k) => Math.hypot(p[0] - P[k][0], p[1] - P[k][1]) < 2);
  const towers = [], line = [P[0]];
  for (let k = 0; k < short.length;) {
    if (!short[k]) { line.push(P[k + 1]); k++; continue; }
    let e = k;
    while (e < short.length && short[e]) e++;
    const a = P[k], b = P[e], chord = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (e - k >= 3 && chord > 2 && chord < 7) {
      towers.push({ c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], r: Math.max(1.6, chord / 2), out: outward(a, b) });
      line.push(b);
    } else {
      for (let j = k; j < e; j++) line.push(P[j + 1]);
    }
    k = e;
  }
  return { towers, line, outward };
}

// a BoxGeometry whose uvs run in metres over a drawing `tile` wide and `high` tall
function box(w, h, d, tile, high = h) {
  const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv;
  const faces = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let j = 0; j < 4; j++) {
    const k = f * 4 + j;
    uv.setXY(k, (uv.getX(k) * faces[f][0]) / tile, (uv.getY(k) * faces[f][1]) / high);
  }
  return geo;
}

// a cylinder's side with its uvs in metres round it
function drum(rTop, rBottom, h, sides, tile, high = h, open = false) {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, sides, 1, open), uv = geo.attributes.uv;
  const round = 2 * Math.PI * Math.max(rTop, rBottom);
  for (let k = 0; k < uv.count; k++) uv.setXY(k, (uv.getX(k) * round) / tile, (uv.getY(k) * h) / high);
  return geo;
}

function placed(geo, x, y, z, ry = 0) {
  return geo.rotateY(ry).translate(x, y, z);
}

// the wall: ashlar, a few arrow slits, the line of the wall walk's corbels under the battlements
function curtain(g, w, h) {
  const S = CASTLE_STONE;
  ashlar(g, -w / 2, 0, w / 2, h, S, { seed: 73, course: 0.75, vary: 0.09 });
  g.fillStyle = shade(S, -0.1); // a damp, darker plinth just above the water
  g.fillRect(-w / 2, 0, w, 1.2);
  g.fillStyle = '#25262a';
  g.fillRect(-1.6, 7.5, 0.3, 1.9);
  g.fillRect(2.2, 4.2, 0.3, 1.6);
  g.fillStyle = shade(S, -0.32);
  g.fillRect(-w / 2, h - 0.9, w, 0.3);
}

// a flanking tower's shaft: ashlar and, low down, a round blind arch of radiating voussoirs
function shaft(g, w, h) {
  const S = CASTLE_STONE;
  ashlar(g, -w / 2, 0, w / 2, h, S, { seed: 74, course: 0.75, vary: 0.09 });
  for (const x of [-w / 4, w / 4]) {
    roundArch(g, x, 4.4, 2.4, 2.6, shade(S, 0.14));
    roundArch(g, x, 4.4, 1.7, 2.2, shade(S, -0.42));
    roundArch(g, x, 4.4, 1.2, 1.9, shade(S, -0.2));
  }
  g.fillStyle = '#25262a';
  g.fillRect(-0.15, 9, 0.3, 1.6);
}

// a turret: ashlar, a band of corbels at its foot and arrow slits
function turret(g, w, h) {
  const S = shade(CASTLE_STONE, 0.04);
  ashlar(g, -w / 2, 0, w / 2, h, S, { seed: 75, course: 0.7, vary: 0.1 });
  g.fillStyle = '#25262a';
  for (let x = -w / 2 + w / 8; x < w / 2; x += w / 4) g.fillRect(x - 0.12, 1.4, 0.24, 1.2);
}

// a flag, its lion on it: Flanders' black on gold, Ghent's silver on black
function flag(field, lion, claws) {
  return elevation(3, 2, 64, (g, w, h) => {
    g.fillStyle = field;
    g.fillRect(-w / 2, 0, w, h);
    g.save();
    g.translate(0.05, 0.12);
    g.scale(0.9, 0.9);
    g.fillStyle = lion;
    g.beginPath(); // the body, rearing up to the left
    g.ellipse(0.05, 0.95, 0.42, 0.62, -0.5, 0, 2 * Math.PI);
    g.fill();
    g.beginPath(); // the head
    g.arc(-0.42, 1.68, 0.28, 0, 2 * Math.PI);
    g.fill();
    g.lineWidth = 0.14;
    g.lineCap = 'round';
    g.strokeStyle = lion;
    for (const [x0, y0, x1, y1] of [[-0.25, 1.3, -0.85, 1.55], [-0.15, 1.05, -0.8, 1.05], [0.2, 0.45, -0.2, 0.05], [0.35, 0.5, 0.45, 0.02]]) {
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); // the legs
    }
    g.beginPath(); // the tail, curled up behind
    g.moveTo(0.45, 0.65); g.quadraticCurveTo(0.95, 0.9, 0.7, 1.55);
    g.stroke();
    g.fillStyle = claws;
    g.beginPath(); g.arc(-0.62, 1.62, 0.07, 0, 2 * Math.PI); g.fill(); // the tongue
    g.restore();
  });
}

// a flag on a pole standing at [x, y, z], its cloth a little rippled
function flagpole(x, y, z, map, turn) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 6, 6), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6 }));
  pole.position.y = 3;
  const cloth = new THREE.PlaneGeometry(3, 2, 12, 1).translate(1.5, 0, 0), p = cloth.attributes.position;
  for (let k = 0; k < p.count; k++) p.setZ(k, Math.sin(p.getX(k) * 2.2) * 0.12 * p.getX(k));
  cloth.computeVertexNormals();
  const f = new THREE.Mesh(cloth, new THREE.MeshStandardMaterial({ map, roughness: 0.8, side: THREE.DoubleSide }));
  f.position.y = 4.9;
  g.add(pole, f);
  g.position.set(x, y, z);
  g.rotation.y = turn;
  g.traverse(m => { m.castShadow = true; });
  return g;
}

// the highest point of the model lm within r of (x, z), and of its rim (from r/2 out)
function heightAt(lm, x, z, r) {
  let peak = 0, rim = 0;
  for (let k = 0; k < lm.v.length; k += 3) {
    const d = Math.hypot(lm.v[k] - x, lm.v[k + 2] - z);
    if (d > r) continue;
    peak = Math.max(peak, lm.v[k + 1]);
    if (d > r / 2) rim = Math.max(rim, lm.v[k + 1]);
  }
  return { peak, rim };
}

// Everything the model is missing: the curtain wall and its towers, the keep turrets' roofs and the
// two flags on the keep (lm: the landmark, top: its highest point).
export function gravensteen(lm, top) {
  const out = new THREE.Group();
  out.name = 'curtain-wall';
  const { towers, line, outward } = plan();
  const stone = (draw, w, h) => {
    const map = elevation(w, h, 12, draw);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    return new THREE.MeshStandardMaterial({ map, roughness: 0.92, flatShading: true });
  };
  const wallMat = stone(curtain, 9, WALL_H), shaftMat = stone(shaft, 9, WALL_H), turretMat = stone(turret, 8, TURRET_H + 1.4);
  const plain = new THREE.MeshStandardMaterial({ color: CASTLE_STONE, roughness: 0.92, flatShading: true });
  const wood = new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.85, flatShading: true });
  const walls = [], shafts = [], turrets = [], corbels = [], merlons = [], shutters = [];
  const merlon = (x, z, ry, y) => merlons.push(placed(new THREE.BoxGeometry(1.1, 1.5, 0.6), x, y + 0.75, z, ry));
  // the shutter of a crenel facing out along (ox, oz), hinged at its top and propped a little open
  const shutter = (x, z, y, ox, oz) => {
    const geo = new THREE.BoxGeometry(1, 0.95, 0.1).translate(0, -0.47, 0).rotateX(-0.45);
    shutters.push(placed(geo, x + ox * 0.35, y + 1.45, z + oz * 0.35, Math.atan2(ox, oz)));
  };

  // the wall, a slab per stretch of its line laid inwards from it, with battlements on its outer edge
  for (let k = 0; k + 1 < line.length; k++) {
    const a = line[k], b = line[k + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 0.3) continue;
    const [nx, nz] = outward(a, b), ry = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
    const mx = (a[0] + b[0]) / 2 - (nx * THICK) / 2, mz = (a[1] + b[1]) / 2 - (nz * THICK) / 2;
    walls.push(placed(box(L + THICK * 0.6, WALL_H, THICK, 9, WALL_H), mx, WALL_H / 2, mz, ry));
    const n = Math.max(1, Math.round(L / 2.3));
    for (let j = 0; j < n; j++) {
      const t = (j + 0.5) / n, x = a[0] + (b[0] - a[0]) * t - nx * 0.3, z = a[1] + (b[1] - a[1]) * t - nz * 0.3;
      if (towers.some(tw => Math.hypot(tw.c[0] - x, tw.c[1] - z) < tw.r + 0.9)) continue;
      merlon(x, z, ry, WALL_H);
      if (j % 2) {
        const u = 0.5 / n, sx = a[0] + (b[0] - a[0]) * (t + u) - nx * 0.3, sz = a[1] + (b[1] - a[1]) * (t + u) - nz * 0.3;
        if (t + u < 1) shutter(sx, sz, WALL_H, nx, nz);
      }
    }
  }

  // the towers: an eight-sided shaft half out of the wall, and the round turret corbelled out on top
  for (const { c: [x, z], r, out: [nx, nz] } of towers) {
    const ry = Math.atan2(nx, nz), R = r * 1.18, y0 = WALL_H - 0.6;
    shafts.push(placed(drum(r, r, y0, 8, 9, WALL_H, true), x, y0 / 2, z, ry + Math.PI / 8));
    corbels.push(placed(new THREE.CylinderGeometry(R, r, 1.2, 14, 1, true), x, y0 + 0.6, z));
    turrets.push(placed(drum(R, R, TURRET_H + 1.4, 14, 8), x, y0 + 1.2 + (TURRET_H + 1.4) / 2, z));
    const yTop = y0 + 1.2 + TURRET_H + 1.4, n = Math.max(6, Math.round((2 * Math.PI * R) / 2.2));
    for (let j = 0; j < n; j++) {
      const a = (j / n) * 2 * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
      merlon(x + ca * (R - 0.3), z + sa * (R - 0.3), -a + Math.PI / 2, yTop);
      const b = a + Math.PI / n;
      if (Math.cos(b) * nx + Math.sin(b) * nz > -0.2) shutter(x + Math.cos(b) * (R - 0.3), z + Math.sin(b) * (R - 0.3), yTop, Math.cos(b), Math.sin(b));
    }
  }

  // the keep's two little turrets: a brown conical roof each, at their own height in the model
  const roof = new THREE.MeshStandardMaterial({ color: 0x6e4630, roughness: 0.85, flatShading: true });
  const roofs = KEEP_TURRETS.map(([x, z, r]) => {
    const { rim } = heightAt(lm, x, z, r + 0.3);
    return placed(new THREE.ConeGeometry(r * 1.2, r * 1.5, 16), x, rim + (r * 1.5) / 2 - 0.1, z);
  });

  const add = (geos, mat) => {
    if (!geos.length) return;
    const m = new THREE.Mesh(mergeGeometries(geos), mat);
    m.castShadow = m.receiveShadow = true;
    out.add(m);
  };
  add(walls, wallMat);
  add(shafts, shaftMat);
  add(turrets, turretMat);
  add(corbels, plain);
  add(merlons, plain);
  add(shutters, wood);
  add(roofs, roof);

  // the flags: Ghent's on the keep's highest turret, Flanders' on its far corner
  out.add(flagpole(top[0], top[1], top[2], flag('#151515', '#f2f2ee', '#d9b13a'), 0.4));
  let far = null;
  for (let k = 0; k < lm.v.length; k += 3) {
    const [x, y, z] = [lm.v[k], lm.v[k + 1], lm.v[k + 2]];
    if (Math.hypot(x - top[0], z - top[2]) > 14 && Math.hypot(x - top[0], z - top[2]) < 40 && y > top[1] - 12 && (!far || y > far[1])) far = [x, y, z];
  }
  if (far) out.add(flagpole(far[0], far[1], far[2], flag('#f4d21c', '#151515', '#d0242a'), 1.1));
  return out;
}
