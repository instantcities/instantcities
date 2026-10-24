// A tram platform, De Lijn's: a slab of concrete a little above the street with a white line along
// the edge by the track, on it the tall white-and-yellow stop sign (TRAM on its yellow head, the
// numbers of the lines stopping there in their colours, the stop's name) and a black board with the
// next trams in amber, and a few people waiting. Like the bike rack (bikerack.js), one asset made to
// size and put down anywhere: tramstops.js puts one at every stop of the city's tram lines.
//
// In its own metres: the tram passes along x = 0 going -z; the platform lies beside it from x = FROM
// (its kerb, on the tram's right where the doors open) to FROM + width, from z = -length/2 to
// length/2, its top `HIGH` up. One mesh for all of it, and one each for the faces of the sign and of
// the board, both sides.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { PERSON, dressed } from './stops.js';

export const HIGH = 0.22; // metres: how high the platform is
export const FROM = 1.6;  // metres from the middle of the track to the platform's kerb
const CONCRETE = 0xd2cdc2, KERB = 0x8a8680, EDGE = 0xfbfaf6, DARK = 0x2c2f33, YELLOW = 0xffc400, WHITE = 0xf7f7f5;

let mats;
function materials() {
  return (mats ??= {
    body: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0.05 }),
  });
}

const tint = (geo, hex) => {
  const g = geo.index ? geo.toNonIndexed() : geo, c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) c.toArray(a, i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(k)) g.deleteAttribute(k);
  return g;
};
// (`cut` pieces along z, for one bent along a track: see tramstops.js)
const box = (w, h, d, x, y, z, hex, cut = 1) => tint(new THREE.BoxGeometry(w, h, d, 1, 1, cut).translate(x, y, z), hex);

// lines: [{ ref, colour }] stopping there; name: the stop's; seed: who is waiting. Returns the group,
// its userData { length, width, post (where to wait: by the sign, on the platform), ledge (its top,
// for the ground: [x, z, x, z, half its width], down its middle), board: { draw(rows) } }, rows
// being [{ ref, colour, to, min (0: here now) }], the next trams.
export function tramPlatform({ length = 36, width = 2.6, lines = [], name = '', seed = 1 } = {}) {
  const g = new THREE.Group(), IN = FROM, OUT = FROM + width, L = length / 2;
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);

  // the slab: its top (the white line by the kerb), the kerb and the outer side and the ends
  const cut = Math.ceil(length / 2);
  const parts = [
    box(0.35, HIGH, length, IN + 0.175, HIGH / 2, 0, EDGE, cut),
    box(width - 0.35, HIGH, length, IN + 0.35 + (width - 0.35) / 2, HIGH / 2, 0, CONCRETE, cut),
    box(0.04, HIGH - 0.02, length + 0.02, IN - 0.01, (HIGH - 0.02) / 2, 0, KERB, cut),
    box(0.04, HIGH - 0.02, length + 0.02, OUT + 0.01, (HIGH - 0.02) / 2, 0, KERB, cut),
  ];
  // the sign towards the front of the tram (it goes -z), the board further back, both read along it
  const signZ = -length * 0.12, boardZ = length * 0.2;
  const signX = Math.min(OUT - 0.45, IN + width * 0.75), boardX = IN + width / 2 + Math.min(0.3, width / 6);
  parts.push(
    box(0.09, 3.35, 0.09, signX, HIGH + 1.675, signZ, YELLOW),
    box(0.56, 1.26, 0.06, signX, HIGH + 2.55, signZ, WHITE),
    box(0.4, 0.5, 0.05, signX, HIGH + 1.45, signZ, 0xe9e9e6), // the timetable
    box(0.42, 0.04, 0.07, signX, HIGH + 1.72, signZ, YELLOW),
    box(0.08, 2.4, 0.08, boardX, HIGH + 1.2, boardZ, DARK),
    box(1.36, 0.58, 0.06, boardX, HIGH + 2.62, boardZ, DARK),
  );
  // people waiting, looking out for the tram
  const n = 1 + Math.floor(rnd() * 4);
  for (let k = 0; k < n; k++) {
    const c = dressed(rnd), size = 0.9 + rnd() * 0.2, turn = Math.PI + (rnd() - 0.5) * 1.8;
    const x = IN + 0.9 + rnd() * Math.max(0.1, width - 1.3), z = (rnd() - 0.5) * length * 0.7;
    ['legs', 'body', 'head'].forEach((part, j) => parts.push(tint(PERSON[part].clone().scale(size, size, size).rotateY(turn).translate(x, HIGH, z), c[j])));
  }
  const body = new THREE.Mesh(mergeGeometries(parts), materials().body);
  body.castShadow = body.receiveShadow = true;
  body.name = 'tram platform';
  g.add(body);

  // the faces, front and back, a little off the panels
  const faces = (w, h, x, y, z, material) => {
    const plane = (turn, dz) => new THREE.PlaneGeometry(w, h).rotateY(turn).translate(x, y, z + dz);
    const m = new THREE.Mesh(mergeGeometries([plane(0, 0.035), plane(Math.PI, -0.035)]), material);
    m.name = 'tram platform face';
    g.add(m);
  };
  faces(0.52, 1.2, signX, HIGH + 2.55, signZ, new THREE.MeshStandardMaterial({ map: signTexture(lines, name), roughness: 0.5 }));
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  faces(1.24, 0.46, boardX, HIGH + 2.62, boardZ, new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  const board = { draw: rows => { drawBoard(canvas, rows); texture.needsUpdate = true; } };
  board.draw([]);

  g.userData = { length, width, post: new THREE.Vector3(signX, HIGH, signZ), ledge: [IN + width / 2, -L, IN + width / 2, L, width / 2], board };
  return g;
}

// A black board with amber lights: a row per tram, its number in the line's colour, where it goes,
// and the minutes. Dutch, as De Lijn's.
function drawBoard(canvas, rows) {
  const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height, rh = H / 3, amber = '#ffb22e';
  g.fillStyle = '#0b0b0c';
  g.fillRect(0, 0, W, H);
  g.textBaseline = 'middle';
  if (!rows.length) {
    g.fillStyle = amber;
    g.font = 'bold 18px monospace';
    g.textAlign = 'center';
    g.fillText('Geen trams', W / 2, H / 2);
    return;
  }
  rows.slice(0, 3).forEach(({ ref, colour, to, min }, k) => {
    const y = rh * k + rh / 2;
    g.fillStyle = colour ?? amber;
    g.fillRect(6, y - 12, 26, 24);
    g.fillStyle = '#fff';
    g.font = 'bold 18px sans-serif';
    g.textAlign = 'center';
    g.fillText(ref, 19, y + 1);
    g.fillStyle = amber;
    g.font = 'bold 17px monospace';
    g.textAlign = 'left';
    g.fillText(to.length > 15 ? `${to.slice(0, 14)}.` : to, 40, y + 1);
    g.textAlign = 'right';
    g.fillText(min === 0 ? 'nu' : `${min}'`, W - 8, y + 1);
  });
}

// The sign's face: a yellow head saying TRAM, the lines in their colours, and the stop's name.
function signTexture(lines, name) {
  const canvas = document.createElement('canvas'), W = 128, H = 296;
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  g.fillStyle = '#f7f7f5';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#ffc400';
  g.fillRect(0, 0, W, 64);
  g.fillStyle = '#222';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = 'bold 30px sans-serif';
  g.fillText('TRAM', W / 2, 34);
  lines.slice(0, 3).forEach((l, k) => {
    const y = 100 + k * 52;
    g.fillStyle = l.colour ?? '#555';
    g.fillRect(W / 2 - 24, y - 22, 48, 44);
    g.fillStyle = '#fff';
    g.font = 'bold 34px sans-serif';
    g.fillText(l.ref, W / 2, y + 2);
  });
  // the name, in as many lines as it needs, at the bottom
  g.fillStyle = '#222';
  g.font = 'bold 15px sans-serif';
  const out = [];
  for (const w of name.split(' ')) {
    if (out.length && g.measureText(`${out.at(-1)} ${w}`).width < W - 12) out[out.length - 1] += ` ${w}`;
    else out.push(w);
  }
  out.slice(-3).forEach((t, k, all) => g.fillText(t, W / 2, H - 14 - (all.length - 1 - k) * 18, W - 8));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
