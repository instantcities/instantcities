import * as THREE from 'three';
import { onGround } from './ground.js';

const N = 2000;
const RUN_UP = 25; // an open route: metres from its start to the start line
const RUN_OUT = 60; // and from the finish line to its end

// A closed loop in the XZ plane, ridden counterclockwise seen from above (like a real racecourse),
// or an open route (cfg.open) from one place to another, with a start line near its beginning and
// a finish line near its end. Sample indices along an open route don't wrap round: they stop at
// its ends.
export class Track {
  constructor(cfg) {
    this.control = cfg.control;
    this.open = !!cfg.open;
    this.rise = null;
    const curve = new THREE.CatmullRomCurve3(
      cfg.control.map(([x, z]) => new THREE.Vector3(x, 0, z)), !this.open, 'centripetal');
    this.hw = cfg.hw;
    this.railLimit = cfg.hw - 0.9;
    this.length = curve.getLength();
    // a long open route gets more samples, so they stay as close together as on a loop
    const n = this.open ? Math.max(N, Math.ceil(this.length / 0.8)) : N;
    this.n = n;
    this.points = this.open ? curve.getSpacedPoints(n - 1) : curve.getSpacedPoints(n).slice(0, n);
    this.spacing = this.length / (this.open ? n - 1 : n);
    this.start = this.open ? Math.round(RUN_UP / this.spacing) : 0; // the start line
    this.finish = this.open ? n - 1 - Math.round(RUN_OUT / this.spacing) : n; // the finish line (a loop: back at the start)
    this.tangents = [];
    this.normals = []; // unit vector pointing to the left of the riding direction (= the infield)
    for (let i = 0; i < n; i++) {
      const a = this.points[this.wrap(i - 1)], b = this.points[this.wrap(i + 1)];
      const t = new THREE.Vector3(b.x - a.x, 0, b.z - a.z).normalize();
      this.tangents.push(t);
      this.normals.push(new THREE.Vector3(t.z, 0, -t.x));
    }
    const sub = this.points.filter((_, i) => i % 10 === 0);
    this.distTo = (x, z) => {
      let m = Infinity;
      for (const p of sub) m = Math.min(m, (p.x - x) ** 2 + (p.z - z) ** 2);
      return Math.sqrt(m);
    };
  }

  // Heights along the loop, from one for each control point: a route over a bridge on a real map.
  setRise(rise) {
    const C = this.control.length;
    let k = 0;
    const d2 = (c, p) => (c[0] - p.x) ** 2 + (c[1] - p.z) ** 2;
    this.rise = this.points.map(p => {
      while (d2(this.control[(k + 1) % C], p) < d2(this.control[k % C], p) && k < 2 * C) k++;
      const a = this.control[k % C], b = this.control[(k + 1) % C], dx = b[0] - a[0], dz = b[1] - a[1];
      const f = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
      return rise[k % C] + (rise[(k + 1) % C] - rise[k % C]) * f;
    });
  }

  // Cobbled stretches, from a flag for each control point: the flag of the nearest one.
  setSett(sett) {
    const C = this.control.length;
    let k = 0;
    const d2 = (c, p) => (c[0] - p.x) ** 2 + (c[1] - p.z) ** 2;
    this.sett = this.points.map(p => {
      while (d2(this.control[(k + 1) % C], p) < d2(this.control[k % C], p) && k < 2 * C) k++;
      return sett[k % C];
    });
  }

  riseAt(i) {
    return this.rise ? this.rise[this.wrap(Math.round(i))] : 0;
  }

  wrap(i) {
    if (this.open) return Math.max(0, Math.min(this.n - 1, i));
    return ((i % this.n) + this.n) % this.n;
  }

  // Sample index of a fraction of the race: of a lap, or of an open route from start to finish.
  atFrac(f) {
    return this.open ? Math.round(this.start + f * (this.finish - this.start)) : Math.round(f * this.n) % this.n;
  }

  // Metres from sample i to the nearest start or finish line.
  fromGate(i) {
    if (this.open) return Math.min(Math.abs(i - this.start), Math.abs(i - this.finish)) * this.spacing;
    return Math.min(i, this.n - i) * this.spacing;
  }

  // Samples from a to b along the riding direction, in (-n/2, n/2] round a loop.
  delta(a, b) {
    if (this.open) return b - a;
    let d = this.wrap(b - a);
    if (d > this.n / 2) d -= this.n;
    return d;
  }

  // Index of the centerline sample closest to (x, z). With a hint only a window around it is searched.
  nearest(x, z, hint = -1) {
    const n = this.n, P = this.points;
    let best = 0, bestD = Infinity;
    if (hint < 0) {
      for (let i = 0; i < n; i += 5) {
        const d = (P[i].x - x) ** 2 + (P[i].z - z) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      }
      hint = best;
    }
    const W = 30;
    for (let pass = 0; pass < 6; pass++) {
      bestD = Infinity;
      for (let k = -W; k <= W; k++) {
        const i = this.wrap(hint + k);
        const d = (P[i].x - x) ** 2 + (P[i].z - z) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best !== this.wrap(hint - W) && best !== this.wrap(hint + W)) break;
      hint = best;
    }
    return best;
  }

  // Signed sideways offset from the centerline, positive towards the infield.
  lateral(x, z, i) {
    const p = this.points[i], m = this.normals[i];
    return (x - p.x) * m.x + (z - p.z) * m.z;
  }

  at(i, lat, out = new THREE.Vector3()) {
    i = this.wrap(i);
    const p = this.points[i], m = this.normals[i];
    return out.set(p.x + m.x * lat, this.rise ? this.rise[i] : 0, p.z + m.z * lat);
  }

  yawAt(i) {
    const t = this.tangents[this.wrap(i)];
    return Math.atan2(t.x, t.z);
  }

  ribbon(half, y, material, uvLength = 12, uvAcross = 2) {
    const n = this.n, q = this.quads;
    const pos = new Float32Array((q + 1) * 6), uv = new Float32Array((q + 1) * 4), index = [];
    for (let i = 0; i <= q; i++) {
      const p = this.points[i % n], m = this.normals[i % n], v = (i * this.spacing) / uvLength;
      const h = y + this.riseAt(i);
      pos.set([p.x + m.x * half, h, p.z + m.z * half, p.x - m.x * half, h, p.z - m.z * half], i * 6);
      uv.set([0, v, uvAcross, v], i * 4);
      if (i < q) { const a = i * 2; index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(index);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material);
    mesh.receiveShadow = true;
    return mesh;
  }

  // How many strips the road is drawn in: a loop closes back on its first sample.
  get quads() {
    return this.open ? this.n - 1 : this.n;
  }

  // What the gate banners say: the finish (or the one gate of a loop), and an open route's start.
  setBanner(text, start = 'START') {
    this.banner?.draw(text);
    this.startBanner?.draw(start);
  }

  build(group, theme) {
    this.buildStreet(group, theme);
    if (!this.open) {
      this.gate = this.buildGate(group, theme, 0);
      return;
    }
    // an open route: a start gate and a finish gate, shown and hidden together
    this.gate = new THREE.Group();
    group.add(this.gate);
    this.buildGate(this.gate, theme, this.start, 'startBanner');
    this.buildGate(this.gate, theme, this.finish);
  }

  // A city street: asphalt with white lines, kerbs, pavements and street lamps on both sides.
  // theme.pavement is how wide the pavements are; theme.lift raises it all above a street map below.
  buildStreet(group, theme) {
    const hw = this.hw, n = this.n, pav = theme.pavement ?? 3.4, y0 = theme.lift ?? 0;
    // a kerb stops where a side street comes in, and on a square there is none
    const open = (i, side) => !!this.paved?.[i] || (!!this.mouths && (this.mouths.at[i] & (side > 0 ? 1 : 2)) !== 0);
    const asphalt = opts => new THREE.MeshStandardMaterial({ map: asphaltTexture(theme.dirt, opts), roughness: 0.9 });
    // the road: no centre line along one-way stretches, and cobbles (kasseien) where the street has them
    // and across a square (this.paved) nothing: the road is the square's own stones, drawn with it
    // (sett 1), or big flat slabs (sett 2)
    const sett = new THREE.MeshStandardMaterial({ map: theme.roman ? lavaTexture() : settTexture(), roughness: 0.95 });
    const slabs = new THREE.MeshStandardMaterial({ map: theme.roman ? lavaTexture() : slabTexture(theme), roughness: 0.9 });
    const none = new THREE.MeshBasicMaterial({ visible: false });
    group.add(this.band(-hw, hw, y0 + 0.025, [asphalt(), asphalt({ centre: false }), sett, none, slabs].map(m => onGround(m, y0 + 0.025)), i => (this.paved?.[i] ? 3 : this.sett?.[i] === 2 ? 4 : this.sett?.[i] ? 2 : this.lineless?.[i] ? 1 : 0), 12, 1));
    // pavements, opening up into asphalt where a side street comes in
    const pavement = new THREE.MeshStandardMaterial({ color: 0xffffff, map: theme.roman ? gravelTexture(theme.verge) : pavementTexture(theme.verge), roughness: 0.95 });
    const plain = asphalt({ centre: false, edges: false });
    for (const side of [1, -1]) {
      const [a, b] = side > 0 ? [hw - 0.05, hw + pav] : [-hw - pav, -hw + 0.05];
      group.add(this.band(a, b, y0 + 0.015, [pavement, plain, none].map(m => onGround(m, y0 + 0.015)), i => (this.paved?.[i] ? 2 : open(i, side) ? 1 : 0), 3.4, 2 * pav / 3.4));
    }

    // kerbs, broken where the side streets come in
    const kerbMat = new THREE.MeshStandardMaterial({ color: theme.kerb ?? 0xd9d4ca, roughness: 0.8 });
    for (const side of [1, -1]) {
      const off = side * (hw + 0.12);
      const at = i => { const p = this.points[this.wrap(i)], m = this.normals[this.wrap(i)]; return new THREE.Vector3(p.x + m.x * off, y0 + 0.06 + this.riseAt(i), p.z + m.z * off); };
      const start = this.open ? -1 : [...Array(n).keys()].find(i => open(i, side));
      if (start === undefined) {
        const pts = [];
        for (let i = 0; i < n; i += 4) pts.push(at(i));
        group.add(this.kerb(new THREE.CatmullRomCurve3(pts, true), this.length, kerbMat, true));
        continue;
      }
      // walk once round from an opening (or along an open route from its start, with a last opening
      // just past its end), laying a kerb along every closed stretch
      let piece = [];
      for (let k = 1; k <= n; k++) {
        const i = this.wrap(start + k);
        if (!open(i, side) && !(this.open && k === n)) {
          if (k % 4 === 0 || !piece.length) piece.push(at(i));
        } else if (piece.length) {
          piece.push(at(i - 1));
          if (piece.length >= 2) group.add(this.kerb(new THREE.CatmullRomCurve3(piece), piece.length * 4 * this.spacing, kerbMat, false));
          piece = [];
        }
      }
    }

    // Street lamps, staggered on the two pavements, each leaning its lamp out over the road.
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.5, metalness: 0.3 });
    const count = Math.floor(this.length / (theme.lampEvery ?? 34));
    const lamps = [];
    for (let k = 0; k < count * 2; k++) {
      const side = k % 2 ? 1 : -1, i = Math.floor(((k + (side > 0 ? 0.5 : 0)) * n) / (count * 2)) % n;
      if (this.fromGate(i) < 40 * this.spacing || open(i, side)) continue; // keep the gates and the side streets clear
      lamps.push({ i, side });
    }
    const poleGeo = new THREE.CylinderGeometry(0.09, 0.13, 6, 6).translate(0, 3, 0);
    const armGeo = new THREE.BoxGeometry(0.1, 0.1, 1.6).translate(0, 5.9, 0.7);
    const headGeo = new THREE.BoxGeometry(0.42, 0.18, 0.8).translate(0, 5.8, 1.4);
    this.lampHead = new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0x6b6040, roughness: 0.4 });
    const parts = [[poleGeo, lampMat], [armGeo, lampMat], [headGeo, this.lampHead]];
    const d = new THREE.Object3D();
    for (const [geo, mat] of parts) {
      const im = new THREE.InstancedMesh(geo, mat, lamps.length);
      lamps.forEach(({ i, side }, k) => {
        const p = this.points[i], m = this.normals[i], off = side * (hw + pav * 0.8);
        d.position.set(p.x + m.x * off, this.riseAt(i), p.z + m.z * off);
        d.rotation.set(0, Math.atan2(-m.x * side, -m.z * side), 0); // local +z points at the road
        d.updateMatrix();
        im.setMatrixAt(k, d.matrix);
      });
      im.castShadow = true;
      group.add(im);
    }
    // the pool of light each lamp throws on the street, only shown at night
    const glow = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
      map: glowTexture(), color: 0xffc46b, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -4,
    }), lamps.length);
    lamps.forEach(({ i, side }, k) => {
      const p = this.points[i], m = this.normals[i], off = side * (hw + pav * 0.8 - 2.2);
      d.position.set(p.x + m.x * off, this.riseAt(i) + y0 + 0.18, p.z + m.z * off); // above the kerb, so it reaches onto the pavement
      d.rotation.set(0, 0, 0);
      d.scale.setScalar(7);
      d.updateMatrix();
      glow.setMatrixAt(k, d.matrix);
    });
    glow.visible = false;
    glow.renderOrder = 1;
    group.add(glow);
    this.lampGlow = glow;
  }

  // Lamps lit for the night, or dim by day.
  setNight(on) {
    if (!this.lampHead) return;
    this.lampHead.emissive.set(on ? 0xffd38a : 0x6b6040);
    this.lampHead.emissiveIntensity = on ? 2.2 : 1;
    this.lampGlow.visible = on;
  }

  kerb(curve, length, material, closed) {
    const kerb = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(2, Math.round(length / 1.5)), 0.16, 5, closed), material);
    kerb.receiveShadow = true;
    return kerb;
  }

  // A strip all round between two sideways offsets (a < b), each sample's quad drawn with
  // materials[pick(i)].
  band(a, b, y, materials, pick, uvLength, uvAcross) {
    const n = this.quads;
    const pos = new Float32Array((n + 1) * 6), uv = new Float32Array((n + 1) * 4), index = [];
    for (let i = 0; i <= n; i++) {
      const p = this.points[i % this.n], m = this.normals[i % this.n], v = (i * this.spacing) / uvLength;
      const h = y + this.riseAt(i);
      pos.set([p.x + m.x * b, h, p.z + m.z * b, p.x + m.x * a, h, p.z + m.z * a], i * 6);
      uv.set([0, v, uvAcross, v], i * 4);
    }
    const geo = new THREE.BufferGeometry();
    let start = 0;
    for (let i = 0; i <= n; i++) {
      if (i < n && (i === 0 || pick(i) === pick(i - 1))) continue;
      geo.addGroup(start * 6, (i - start) * 6, pick(start));
      start = i;
    }
    for (let i = 0; i < n; i++) { const q = i * 2; index.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(index);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, materials);
    mesh.receiveShadow = true;
    return mesh;
  }

  // A start / finish gate at sample i, its banner kept as this[banner] for setBanner.
  buildGate(group, theme, i, banner = 'banner') {
    const hw = this.hw, poleOff = Math.min(1.8, (theme.pavement ?? 3.4) * 0.55), y0 = theme.lift ?? 0;
    const gate = new THREE.Group();
    gate.position.copy(this.points[i]);
    gate.position.y = this.riseAt(i);
    gate.rotation.y = this.yawAt(i);
    group.add(gate);

    const line = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, 1.6),
      new THREE.MeshStandardMaterial({ map: checkerTexture(), roughness: 0.8 }));
    line.rotation.x = -Math.PI / 2;
    line.position.y = y0 + 0.035;
    line.receiveShadow = true;
    gate.add(line);

    const poleMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 });
    for (const s of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 8.2, 10), poleMat);
      pole.position.set(s * (hw + poleOff), 4.1, 0);
      pole.castShadow = true;
      gate.add(pole);
    }
    this[banner] = bannerTexture();
    const face = new THREE.MeshStandardMaterial({ map: this[banner].texture, roughness: 0.6 });
    const edge = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.6 });
    const board = new THREE.Mesh(new THREE.BoxGeometry((hw + poleOff) * 2 + 0.8, 1.9, 0.3), [edge, edge, edge, edge, face, face]);
    board.position.y = 7.4;
    board.castShadow = true;
    gate.add(board);
    return gate;
  }
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function asphaltTexture(color, { centre = true, edges = true } = {}) {
  const t = canvasTexture(256, 512, g => {
    g.fillStyle = color;
    g.fillRect(0, 0, 256, 512);
    const img = g.getImageData(0, 0, 256, 512), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() - 0.5) * 30;
      d[i] += v; d[i + 1] += v; d[i + 2] += v;
    }
    g.putImageData(img, 0, 0);
    // a few darker patches where the road was mended
    for (let k = 0; k < 5; k++) {
      g.fillStyle = 'rgba(30,32,36,0.18)';
      g.fillRect(20 + Math.random() * 180, Math.random() * 480, 20 + Math.random() * 50, 15 + Math.random() * 40);
    }
    g.fillStyle = 'rgba(245,245,240,0.9)';
    if (edges) {
      g.fillRect(9, 0, 5, 512);
      g.fillRect(242, 0, 5, 512);
    }
    if (centre) g.fillRect(126, 0, 4, 190); // dashed
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Cobbles in rows across the street, each row shifted half a stone, in greys and browns; or, given
// stone and joint colours, each cobble a little lighter or darker than stone.
export function settTexture(cols = 24, rows = 32, { stone, joint = '#3b3a37' } = {}) {
  const base = stone && [1, 3, 5].map(i => parseInt(stone.slice(i, i + 2), 16));
  const t = canvasTexture(256, 512, g => {
    const w = 256 / cols, h = 512 / rows;
    g.fillStyle = joint;
    g.fillRect(0, 0, 256, 512);
    for (let y = 0; y < rows; y++) {
      for (let x = -1; x < cols; x++) {
        const v = 92 + Math.random() * 46, tint = Math.random() * 14, d = (Math.random() - 0.5) * 30;
        g.fillStyle = base ? `rgb(${base[0] + d},${base[1] + d},${base[2] + d})` : `rgb(${v + tint},${v + tint * 0.6},${v})`;
        const x0 = (x + (y % 2) * 0.5) * w;
        g.beginPath();
        g.roundRect(x0 + 1, y * h + 1, w - 2, h - 2, 3);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.12)'; // worn smooth on top
        g.fillRect(x0 + 3, y * h + 3, w - 7, 2);
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Big flat stone slabs laid in courses across the street, in the colour of the city's pavements
// (theme.paving): the lanes of a southern old town, where nobody ever laid asphalt.
export function slabTexture(theme = {}) {
  return settTexture(5, 14, { stone: theme.paving ?? '#c9c4ba', joint: '#8f8676' });
}

// The street of a Roman town (Pompeii's): irregular blocks of dark lava laid close, their tops worn
// smooth and pale, with a joint of grey grit between, and the two ruts the cart wheels wore, a
// wheel apart, running along it. Drawn for a strip 6.4 m across and 12 m long (40 px to a metre).
export function lavaTexture() {
  const W = 256, H = 512, cols = 7, rows = 16, rnd = (() => { let s = 7; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
  const t = canvasTexture(W, H, g => {
    g.fillStyle = '#4f493f';
    g.fillRect(0, 0, W, H);
    // a lattice of corners, each moved a good way off its place: the quads between are the blocks
    const cw = W / cols, ch = H / rows, px = [], py = [];
    for (let j = 0; j <= rows; j++) {
      px.push([]); py.push([]);
      for (let i = 0; i <= cols; i++) {
        const wrap = i === cols ? 0 : i, row = j === rows ? 0 : j; // the last corners are the first again, so the tile meets itself
        const key = wrap * 31 + row;
        const r1 = ((Math.sin(key * 12.9898) * 43758.5453) % 1 + 1) % 1, r2 = ((Math.sin(key * 78.233) * 12543.131) % 1 + 1) % 1;
        px[j].push(i * cw + (r1 - 0.5) * cw * 0.45 + (j % 2) * cw * 0.2);
        py[j].push(j * ch + (r2 - 0.5) * ch * 0.42);
      }
    }
    for (let j = 0; j < rows; j++) {
      for (let i = -1; i < cols + 1; i++) {
        const a = Math.max(0, Math.min(cols, i)), b = Math.max(0, Math.min(cols, i + 1));
        if (a === b) continue;
        const v = 70 + rnd() * 34, warm = rnd() * 12, shift = i < 0 ? -W : i >= cols ? W : 0;
        const pts = [[px[j][a], py[j][a]], [px[j][b], py[j][b]], [px[j + 1][b], py[j + 1][b]], [px[j + 1][a], py[j + 1][a]]];
        for (const o of [0, -W]) { // (drawn again a tile over where it runs off the edge)
          const dx = shift + o;
          g.beginPath();
          const cx = pts.reduce((s, p) => s + p[0], 0) / 4 + dx, cy = pts.reduce((s, p) => s + p[1], 0) / 4;
          pts.forEach(([x, y], k) => { const X = cx + (x + dx - cx) * 0.95, Y = cy + (y - cy) * 0.95; k ? g.lineTo(X, Y) : g.moveTo(X, Y); });
          g.closePath();
          g.fillStyle = `rgb(${v + warm},${v + warm * 0.7},${v - 4})`;
          g.fill();
          g.fillStyle = 'rgba(210,200,180,0.13)'; // worn pale on top
          g.fill();
        }
      }
    }
    // grit and fine cracks
    for (let k = 0; k < 2600; k++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(225,215,195,0.14)'; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 1.5); }
    // the ruts: a smoother, paler groove each, a cart's wheel gauge apart (about 1.4 m)
    for (const x of [W * 0.5 - 28, W * 0.5 + 28]) {
      const rut = g.createLinearGradient(x - 11, 0, x + 11, 0);
      rut.addColorStop(0, 'rgba(0,0,0,0)'); rut.addColorStop(0.5, 'rgba(0,0,0,0.3)'); rut.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rut;
      g.fillRect(x - 11, 0, 22, H);
      g.fillStyle = 'rgba(190,180,160,0.1)';
      g.fillRect(x - 3, 0, 6, H);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// The pavements of a Roman town: raised, laid with grit and gravel, no slabs.
export function gravelTexture(color) {
  const t = canvasTexture(128, 128, g => {
    const [r, gr, b] = [color >> 16 & 255, color >> 8 & 255, color & 255];
    g.fillStyle = `rgb(${r},${gr},${b})`;
    g.fillRect(0, 0, 128, 128);
    for (let k = 0; k < 900; k++) {
      const v = (Math.random() - 0.5) * 60;
      g.fillStyle = `rgba(${r + v},${gr + v},${b + v * 0.8},0.75)`;
      g.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 3, 1 + Math.random() * 2.4);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function pavementTexture(color) {
  const t = canvasTexture(128, 128, g => {
    g.fillStyle = '#' + color.toString(16).padStart(6, '0');
    g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(90,85,78,0.35)';
    g.lineWidth = 2;
    for (let k = 0; k <= 128; k += 32) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 128); g.stroke();
      g.beginPath(); g.moveTo(0, k); g.lineTo(128, k); g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function checkerTexture() {
  return canvasTexture(500, 40, g => {
    for (let x = 0; x < 25; x++) for (let y = 0; y < 2; y++) {
      g.fillStyle = (x + y) % 2 ? '#111' : '#fafafa';
      g.fillRect(x * 20, y * 20, 20, 20);
    }
  });
}

function bannerTexture() {
  let g;
  const texture = canvasTexture(1024, 96, ctx => { g = ctx; });
  const draw = text => {
    g.fillStyle = '#c62828';
    g.fillRect(0, 0, 1024, 96);
    g.fillStyle = '#fff';
    g.fillRect(0, 6, 1024, 4);
    g.fillRect(0, 86, 1024, 4);
    g.font = 'bold 60px system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(`🐎  ${text}  🐰`, 512, 52);
    texture.needsUpdate = true;
  };
  draw('FINISH');
  return { texture, draw };
}

// A soft round light, brightest in the middle.
let glowTex = null;
function glowTexture() {
  return (glowTex ??= canvasTexture(64, 64, g => {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.45, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }));
}
