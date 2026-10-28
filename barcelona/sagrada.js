// The Basílica de la Sagrada Família (Antoni Gaudí, from 1883, still being built) in the Eixample,
// modelled by hand in place of the map's stack of building parts, in game metres (the real ones
// times 1.25), on the map's outline of it. Its towers stand where OpenStreetMap has them and as
// high as they are now (2026): Jesus 172.5 m with its cross, the Virgin Mary 138 m with its star,
// the four evangelists 135 m, and the eight apostles of the two finished façades 98 to 112 m.
// Turned with the Eixample's grid: the nave runs from the apse on Carrer de Provença (north-west)
// to the Glory façade on Carrer de Mallorca (south-east), the Nativity façade faces Carrer de la
// Marina (north-east) and the Passion façade Carrer de Sardenya (south-west). In its own metres u
// runs along the nave towards the Glory façade and v across it towards the Passion façade, from
// the crossing under the tower of Jesus:
//   the low cloister round it, the aisles and transept, the nave and transept rising over them
//     under steep stone roofs, and the apse at the head with its pinnacles
//   the four spindle-shaped bell towers of each façade, their tops in coloured mosaic
//   the Nativity façade between its towers, its three portals and the green cypress on top; the
//     Passion façade's bare stone portico on its six leaning columns
//   the six central towers on the crossing and the apse, in the newer pale stone
//   the Glory façade still going up, with its cranes, and the round west sacristy
// Riders ride round it: its outline stops them.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap } from '../core/js/arcade.js';
import { shade } from '../core/js/facades.js';

const X = -40.8, Z = -3033.8, TURN = -Math.PI / 4; // the crossing, and the nave turned to the south-east
const STONE = '#c8b993', OLD = '#9f8f70', PALE = '#ddd6c6', DARK = '#3b352c', GLASS = '#9fb6c4';
const RED = '#b8392c', GOLD = '#d4a93a', WHITE = '#f3f0e8', GREEN = '#3f7a43', CRANE = '#e2b52b';
const AISLE = 38, NAVE = 56, RIDGE = 74; // the aisles' and the nave's walls, and the nave's roof

// the outline of the whole church with its cloister, in its own metres (from OpenStreetMap)
const OUTLINE = [[25.5, 50], [21.5, 50], [19, 53.5], [11, 52.5], [9.5, 54.5], [4.5, 50.5], [-0.5, 49.5], [-4, 50.5], [-9, 55], [-10.5, 52.5], [-17.5, 54], [-20, 51], [-64, 51], [-65.5, 48], [-65.5, 26.5], [-55, 26], [-55.5, 21.5], [-53.5, 19.5], [-51, 19.5], [-49, 21.5], [-50, 25], [-46.5, 25.5], [-40.5, 31.5], [-40.5, 41.5], [-21, 41.5], [-18.5, 36], [-20, 27.5], [-24.5, 29], [-30, 27.5], [-33, 27.5], [-38, 26], [-40, 22], [-45.5, 20], [-46.5, 16.5], [-50, 14], [-52.5, 11], [-54, 3.5], [-56, -1], [-51.5, -5.5], [-54, -9], [-51.5, -13.5], [-46.5, -14.5], [-43.5, -21.5], [-38.5, -20.5], [-37, -22.5], [-33.5, -26], [-29.5, -22.5], [-25.5, -29], [-21.5, -29], [-18.5, -27.5], [-18.5, -36], [-24.5, -40], [-24.5, -48.5], [-17, -49], [-15.5, -46.5], [-11, -46.5], [-8, -49], [-4.5, -44], [5.5, -44.5], [9, -49], [11, -47], [17, -47], [18, -49.5], [25.5, -49.5], [25, -40.5], [19.5, -37], [20, -29], [65, -30], [68, -25], [66, -23], [67.5, -13.5], [66, -9], [69, -1.5], [69, 3], [66, 8.5], [68, 13], [66, 20], [68, 24.5], [66, 28.5], [20.5, 29], [20.5, 35.5], [22.5, 37], [20.5, 39], [22, 41], [57.5, 40.5], [57.5, 50]];

// the bell towers: [u, v, radius, height], Nativity's on the north-east, Passion's on the south-west
const NATIVITY = [[-18.2, -42.1, 4.4, 122.5], [-8.8, -41.6, 4.4, 133.8], [10.3, -41.9, 4.4, 133.8], [19.5, -42.3, 4.4, 122.5]];
const PASSION = [[-17.7, 45.8, 5.4, 133.8], [-8.8, 45.6, 5.4, 140], [8.8, 44.8, 5.4, 140], [17.7, 44.7, 5.4, 133.8]];
// the evangelists' towers round the crossing: Luke's bull, John's eagle, Matthew's angel, Mark's lion
const EVANGELISTS = [[-13, -13.3], [14, -12.9], [13.1, 14.2], [-13.9, 13.4]];

// a tower turned on its axis from a profile of [radius, height] points, standing at (u, v)
function lathe(kit, profile, hex, u, v, sides = 12) {
  kit.add(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), sides), hex, u, 0, v);
}

// one of Gaudí's bell towers: round and straight, then narrowing like a spindle, the louvres of its
// stair winding up it, and on top the pinnacle in Venetian mosaic, a bishop's mitre with its cross
function bellTower(kit, [u, v, R, H], stone) {
  const top = 0.8 * H;
  const at = [[R, 0], [R, 0.38 * H], [0.9 * R, 0.52 * H], [0.7 * R, 0.64 * H], [0.45 * R, 0.73 * H], [0.24 * R, top], [0.12 * R, top + 2], [0, top + 2.2]];
  lathe(kit, at, stone, u, v);
  const r = y => { for (let k = 1; k < at.length; k++) if (y <= at[k][1]) { const t = (y - at[k - 1][1]) / (at[k][1] - at[k - 1][1]); return at[k - 1][0] + (at[k][0] - at[k - 1][0]) * t; } return 0; };
  for (let k = 0; k < 34; k++) {
    const a = k * 0.92, y = 0.3 * H + (k / 34) * 0.42 * H, rr = r(y) - 0.1;
    kit.box(0.9, 2.2, 0.4, DARK, u + rr * Math.cos(a), y, v + rr * Math.sin(a), 0, Math.PI / 2 - a);
  }
  // the pinnacle: a shaft in red and gold, the mitre, a ring of white balls and the cross
  kit.add(new THREE.CylinderGeometry(0.55 * R * 0.5, 0.3 * R, 0.07 * H, 8), RED, u, top + 0.035 * H, v);
  kit.add(new THREE.CylinderGeometry(0.5 * R * 0.5, 0.55 * R * 0.5, 0.05 * H, 8), GOLD, u, top + 0.095 * H, v);
  kit.add(new THREE.ConeGeometry(0.42 * R, 0.06 * H, 4), WHITE, u, top + 0.15 * H, v, 0, Math.PI / 4);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * 2 * Math.PI;
    kit.add(new THREE.SphereGeometry(0.32, 6, 4), WHITE, u + 0.5 * R * Math.cos(a), top + 0.12 * H, v + 0.5 * R * Math.sin(a));
  }
  const c = H - 0.02 * H;
  kit.box(0.4, 0.04 * H, 0.4, GOLD, u, c, v);
  kit.box(0.025 * H, 0.4, 0.4, GOLD, u, c + 0.005 * H, v);
  kit.box(0.4, 0.4, 0.025 * H, GOLD, u, c + 0.005 * H, v);
  kit.add(new THREE.SphereGeometry(0.5, 8, 6), WHITE, u, H, v);
}

// a central tower in the new pale stone, its tall windows in rows of slits
function centralTower(kit, u, v, profile, slits) {
  lathe(kit, profile, PALE, u, v, 16);
  const H = profile.at(-1)[1];
  for (const [y, r] of profile.slice(1, -2)) {
    if (y < 60) continue;
    for (let k = 0; k < slits; k++) {
      const a = (k / slits) * 2 * Math.PI;
      kit.box(0.7, 9, 0.3, GLASS, u + (r - 0.15) * Math.cos(a), y - 6, v + (r - 0.15) * Math.sin(a), 0, Math.PI / 2 - a);
    }
  }
  return H;
}

export function sagrada() {
  const kit = new Kit();
  // the cloister round it all, low, then the aisles and the transept, and the apse at the head
  const shape = new THREE.Shape(OUTLINE.map(([u, v]) => new THREE.Vector2(u, -v)));
  kit.add(new THREE.ExtrudeGeometry(shape, { depth: 12, bevelEnabled: false }).rotateX(-Math.PI / 2), shade(STONE, -0.08));
  kit.box(86, AISLE, 56, STONE, 23, AISLE / 2, 0);
  kit.box(38, AISLE, 88, STONE, 0, AISLE / 2, 0);
  kit.add(new THREE.CylinderGeometry(27, 27, AISLE, 24, 1, false, Math.PI, Math.PI), STONE, -19, AISLE / 2, 0);
  // the nave and the transept over them, their steep roofs, and the apse's half cone
  kit.box(86, NAVE - AISLE, 22, STONE, 23, (NAVE + AISLE) / 2, 0);
  kit.frustum(86, 22, 86, 0, RIDGE - NAVE, shade(STONE, -0.12), 23, NAVE, 0);
  kit.box(22, NAVE - AISLE, 88, STONE, 0, (NAVE + AISLE) / 2, 0);
  kit.frustum(22, 88, 0, 88, RIDGE - NAVE, shade(STONE, -0.12), 0, NAVE, 0);
  kit.add(new THREE.CylinderGeometry(11, 11, NAVE - AISLE, 16, 1, false, Math.PI, Math.PI), STONE, -19, (NAVE + AISLE) / 2, 0);
  kit.add(new THREE.ConeGeometry(11, RIDGE - NAVE, 16, 1, false, Math.PI, Math.PI), shade(STONE, -0.12), -19, NAVE + (RIDGE - NAVE) / 2, 0);
  // the tall windows down the aisles and the nave, and the pinnacles along their tops crowned
  // with bowls of fruit in mosaic
  const FRUIT = [RED, GOLD, '#d9732f', '#7a3f8f', GREEN];
  for (let u = 26; u <= 62; u += 9) {
    for (const s of [-1, 1]) {
      kit.box(4.4, 20, 0.4, DARK, u, 17, s * 28.1);
      kit.box(3.6, 12, 0.4, GLASS, u, 46, s * 11.1);
      kit.add(new THREE.ConeGeometry(1.4, 9, 6), STONE, u - 4.5, AISLE + 4.5, s * 27);
      kit.add(new THREE.SphereGeometry(1.1, 7, 5), FRUIT[(u / 9 + (s > 0 ? 2 : 0)) % FRUIT.length | 0], u - 4.5, AISLE + 9.6, s * 27);
      kit.add(new THREE.ConeGeometry(1, 7, 6), STONE, u - 4.5, NAVE + 3.5, s * 10.5);
      kit.add(new THREE.SphereGeometry(0.9, 7, 5), FRUIT[(u / 9 + (s > 0 ? 0 : 3)) % FRUIT.length | 0], u - 4.5, NAVE + 7.6, s * 10.5);
    }
  }
  // the apse's pinnacles, round its head
  for (let k = 0; k <= 6; k++) {
    const a = Math.PI / 2 + (k / 6) * Math.PI, u = -19 + 27 * Math.cos(a), v = 27 * Math.sin(a);
    kit.add(new THREE.ConeGeometry(2, 22, 8), STONE, u, AISLE + 11, v);
    kit.add(new THREE.SphereGeometry(0.9, 6, 4), WHITE, u, AISLE + 22.5, v);
  }

  // the Nativity façade: weathered, crowded with carving, three portals, the cypress on top
  for (const t of NATIVITY) bellTower(kit, t, OLD);
  kit.box(30, 52, 6, OLD, 0.6, 26, -46.5);
  kit.frustum(30, 6, 6, 4, 18, OLD, 0.6, 52, -46.5);
  for (const [u, w, h] of [[-9.5, 6, 22], [0.6, 8, 30], [10.7, 6, 22]]) {
    kit.box(w, h, 0.6, DARK, u, h / 2, -49.6);
    kit.frustum(w + 2, 1.2, 0, 1.2, h * 0.5, OLD, u, h, -49.2);
  }
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 140; k++) {
    kit.add(new THREE.IcosahedronGeometry(0.5 + rnd() * 0.6, 0), shade(OLD, (rnd() - 0.5) * 0.2), -13.5 + rnd() * 28, 3 + rnd() * 47, -49.6 + rnd() * 0.4);
  }
  kit.add(new THREE.ConeGeometry(4, 18, 8), GREEN, 0.6, 79, -46.5);
  for (let k = 0; k < 8; k++) kit.add(new THREE.SphereGeometry(0.55, 6, 4), WHITE, 0.6 + 3.4 * Math.cos(k * 0.8), 71 + k * 1.3, -46.5 + 3.4 * Math.sin(k * 0.8) * 0.6);

  // the Passion façade: bare pale stone, its portico on six leaning columns, bone-like
  for (const t of PASSION) bellTower(kit, t, STONE);
  kit.box(30, 46, 6, STONE, 0, 23, 49);
  for (let k = 0; k < 6; k++) {
    const u = -15 + k * 6, lean = (k - 2.5) * 0.8;
    kit.rod([u, 0, 57], [u + lean, 26, 54], 1.1, PALE, 7);
  }
  kit.box(38, 3.5, 7, PALE, 0, 27.5, 54);
  for (let k = 0; k < 18; k++) kit.rod([-17 + k * 2, 29, 55], [-17 + k * 2, 37, 54], 0.45, PALE, 5);
  kit.box(38, 3, 6, PALE, 0, 38.5, 53);

  // the central towers: the Virgin Mary's over the apse with its star, the four evangelists' round
  // the crossing, and Jesus's in their middle with its cross
  centralTower(kit, -28.8, 1.5, [[10, 0], [10, 100], [8, 125], [6, 145], [4, 158], [1.5, 164], [0, 165]], 10);
  kit.add(new THREE.IcosahedronGeometry(3.4, 0), WHITE, -28.8, 168.5, 1.5);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * 2 * Math.PI;
    kit.rod([-28.8, 168.5, 1.5], [-28.8 + 5.4 * Math.cos(a), 168.5 + 3.2 * Math.sin(a * 2), 1.5 + 5.4 * Math.sin(a)], 0.5, WHITE, 4);
  }
  for (const [u, v] of EVANGELISTS) {
    centralTower(kit, u, v, [[6.4, 0], [6.4, 105], [5.4, 130], [3.8, 150], [1.5, 160], [0, 161]], 8);
    kit.add(new THREE.SphereGeometry(2.6, 8, 6), GOLD, u, 164, v);
    kit.box(6.5, 1.2, 1.4, WHITE, u, 165, v, 0, TURN); // its wings
  }
  centralTower(kit, 0, 0, [[18, 0], [18, 80], [16, 100], [14, 125], [12.5, 150], [10, 168], [7, 186], [3, 198], [0, 199]], 14);
  kit.box(3.4, 18, 3.4, WHITE, 0, 207, 0);
  kit.box(13, 3.4, 3.4, WHITE, 0, 209, 0);
  kit.box(3.4, 3.4, 13, WHITE, 0, 209, 0);
  kit.box(2.2, 2.2, 2.2, GLASS, 0, 209, 0, Math.PI / 4, Math.PI / 4);

  // the Glory façade still going up, and two of the cranes over it
  kit.box(6, 46, 58, shade(PALE, -0.05), 66, 23, 0);
  for (const v of [-21, -7, 7, 21]) lathe(kit, [[4, 0], [4, 60], [3, 80], [0, 82]], PALE, 66, v, 10);
  for (const [u, v, h, a] of [[80, -22, 150, 2.4], [82, 24, 132, -0.4]]) {
    kit.box(2.2, h, 2.2, CRANE, u, h / 2, v);
    kit.box(2.4, 5, 2.4, '#e9e6de', u, h - 2, v);
    kit.box(60, 1.6, 1.6, CRANE, u + 18 * Math.cos(a), h + 0.8, v + 18 * Math.sin(a), 0, -a);
    kit.box(4, 3, 4, '#77756f', u - 11 * Math.cos(a), h - 1.5, v - 11 * Math.sin(a));
  }

  // the round west sacristy by the apse, ribbed, a little lantern on top
  lathe(kit, [[10, 0], [10, 12], [9, 20], [6.5, 28], [3, 34], [1.4, 36], [0, 37.5]], STONE, -56.9, 38.1, 12);
  kit.add(new THREE.SphereGeometry(1, 6, 4), GOLD, -56.9, 39, 38.1);
  return kit.mesh(kitMat(0.85));
}

const outline = onMap(X, Z, TURN, OUTLINE);
export const SAGRADA = [{
  // seen from all over the city, hazy on the horizon (js/skyline.js)
  id: 'sagrada-familia', name: 'Sagrada Família', x: X, z: Z, turn: TURN, reach: 220, far: 10, loom: 1.6,
  area: [outline], foot: [outline], paths: [outline], make: sagrada,
}];
