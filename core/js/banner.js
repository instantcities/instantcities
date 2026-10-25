// The city's banner (the "gent:" flag over the pavement at a school, crèche or museum): a tall cloth
// in one bright colour between two iron rods sticking out from the wall, a white box with the city's
// logo at the top, the name in white running up it, and a white foot with the kind of place's sign.
// Built in its own metres: the wall at x = 0, the banner sticking out along +x, its foot at `y`.
import * as THREE from 'three';
import { elevation } from './facades.js';

const COLOURS = { school: '#e2492f', kindergarten: '#4fa83d', childcare: '#ee8a12', museum: '#1f8fd0' };
const KINDS = { school: 'School', kindergarten: 'Kleuterschool', childcare: 'Kinderopvang', museum: 'Museum' };
// a name that already says what the place is gets no line saying it again
const SAYS = { school: /school|college|atheneum|instituut|lyceum|humaniora|campus|academ|kask|luca/i, kindergarten: /kleuter|school/i, childcare: /kinder|crèche|creche|opvang|kribbe/i, museum: /museum|musea|kunsthal|smak|s\.m\.a\.k|stam|gum/i };
const W = 0.95, OUT = 0.15; // how wide the cloth is, and how far from the wall it starts

let iron;
export function banner({ name, sub, kind, y, h }) {
  iron ??= new THREE.MeshStandardMaterial({ color: 0x55595e, roughness: 0.5, metalness: 0.6 });
  const g = new THREE.Group();
  // the rods, top and bottom, each with its plate on the wall
  for (const ry of [y + h + 0.04, y - 0.04]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, OUT + W + 0.08, 6), iron);
    rod.rotation.z = Math.PI / 2;
    rod.position.set((OUT + W + 0.08) / 2, ry, 0);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.12), iron);
    plate.position.set(0.02, ry, 0);
    g.add(rod, plate);
  }
  // the cloth, the drawing on both faces (the back one turned round, so it reads the right way too)
  const tex = elevation(W, h, 110, (c, w, hh) => cloth(c, w, hh, name, sub, kind));
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
  for (const back of [false, true]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(W, h), mat);
    m.position.set(OUT + W / 2, y + h / 2, back ? -0.004 : 0.004);
    if (back) m.rotation.y = Math.PI;
    m.castShadow = true;
    g.add(m);
  }
  return g;
}

// the drawing, in metres: x from -w/2 to w/2, y up from the foot
function cloth(g, w, h, name, given, kind) {
  const col = COLOURS[kind] ?? COLOURS.school, L = -w / 2;
  g.fillStyle = col;
  g.fillRect(L, 0, w, h);
  // the white foot, with the sign of the kind of place in the colour
  const foot = Math.min(0.55, h * 0.16);
  g.fillStyle = '#f4f4f1';
  g.fillRect(L, 0, w, foot);
  sign(g, kind, foot / 2, foot * 0.6, col);
  // the logo: a white box near the top, "gent:" in the colour
  const box = Math.min(0.42, h * 0.13), boxTop = h - 0.1;
  g.fillStyle = '#f4f4f1';
  g.fillRect(L + 0.12, boxTop - box, w - 0.24, box);
  text(g, 'gent:', 0, boxTop - box / 2, `bold ${box * 0.62}px sans-serif`, col, w - 0.36);
  // the name running up the middle, and in a thin line beside it what kind of place it is (or `given`)
  const label = name || KINDS[kind] || '', sub = given ?? (name && !SAYS[kind]?.test(name) ? KINDS[kind] : '');
  const from = foot + 0.18, to = boxTop - box - 0.18, len = to - from;
  if (len < 0.4) return;
  const lines = split(label);
  const size = lines.length > 1 ? 0.27 : 0.36;
  g.save();
  g.translate(0, (from + to) / 2);
  g.rotate(Math.PI / 2); // up the cloth, as on the real ones: read with your head on your left shoulder
  // the thin line on top (to the left on the cloth), the name under it
  const across = lines.length * size * 1.05 + (sub ? 0.2 : 0);
  let v = across / 2;
  if (sub) { text(g, sub, 0, v - 0.08, '0.15px sans-serif', 'rgba(255,255,255,0.85)', len); v -= 0.2; }
  for (const line of lines) {
    text(g, line, 0, v - size * 0.52, `bold ${size}px sans-serif`, '#ffffff', len);
    v -= size * 1.05;
  }
  g.restore();
}

// a long name over two lines, broken at the space nearest its middle
function split(s) {
  if (s.length <= 14 || !s.includes(' ')) return [s];
  let at = -1;
  for (let k = 0; k < s.length; k++) if (s[k] === ' ' && (at < 0 || Math.abs(k - s.length / 2) < Math.abs(at - s.length / 2))) at = k;
  return [s.slice(0, at), s.slice(at + 1)];
}

// text centred on (x, y), upright in the drawing's y-up metres, squeezed to fit `max`
function text(g, s, x, y, font, fill, max) {
  g.save();
  g.translate(x, y);
  g.scale(1, -1);
  g.font = font;
  g.fillStyle = fill;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(s, 0, 0, max);
  g.restore();
}

// the foot's sign: a little temple for a museum, an open book for a school, a fountain of dots
// (as De Bron's) for a crèche
function sign(g, kind, cy, s, col) {
  g.fillStyle = g.strokeStyle = col;
  g.lineWidth = s * 0.08;
  if (kind === 'museum') {
    g.beginPath(); g.moveTo(-s * 0.55, cy + s * 0.2); g.lineTo(0, cy + s * 0.5); g.lineTo(s * 0.55, cy + s * 0.2); g.fill();
    for (const x of [-0.4, -0.13, 0.13, 0.4]) g.fillRect(x * s - s * 0.05, cy - s * 0.35, s * 0.1, s * 0.5);
    g.fillRect(-s * 0.55, cy - s * 0.5, s * 1.1, s * 0.12);
  } else if (kind === 'school') {
    for (const d of [-1, 1]) {
      g.beginPath(); g.moveTo(0, cy - s * 0.35); g.quadraticCurveTo(d * s * 0.3, cy - s * 0.2, d * s * 0.6, cy - s * 0.3);
      g.lineTo(d * s * 0.6, cy + s * 0.35); g.quadraticCurveTo(d * s * 0.3, cy + s * 0.45, 0, cy + s * 0.3); g.closePath(); g.stroke();
    }
  } else {
    for (let k = 0; k < 9; k++) {
      const a = Math.PI * (0.15 + (0.7 * k) / 8), r = s * 0.45;
      g.beginPath(); g.arc(Math.cos(a) * r, cy + Math.sin(a) * r * 0.6 - s * 0.05, s * 0.05, 0, Math.PI * 2); g.fill();
    }
    g.fillRect(-s * 0.03, cy - s * 0.5, s * 0.06, s * 0.6);
  }
}
