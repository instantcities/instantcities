// Ghent's statues, modelled by hand: each { id, name, x, z (game metres, from its real position),
// turn (radians, 0 = facing south), size (the square of its base, which riders bump into), seat?: a
// step people sit on, { half: how far its edge is from the middle, y: how high it is }, make() }.
import * as THREE from 'three';
import { elevation, ashlar, archPath, niche, shade } from '../core/js/facades.js';
import { bikeRack } from '../core/js/bikerack.js';
import { BIKE_RACKS } from './bikeracks.js';
import { PAVILIONS, STALLS } from './pavilions.js';
import { STADSHAL } from './stadshal.js';
import { STATIONS } from './stations.js';
import { KROOK } from './krook.js';
import { GRAFFITISTRAAT } from './graffitistraat.js';
import { GLAZEN_STRAATJE } from './glazenstraatje.js';
import { DOK_NOORD } from './doknoord.js';
import { DOK_NOORD_PLEIN } from './doknoordplein.js';
import { KOUTER } from './kouter.js';
import { SASSEVAART } from './sassevaart.js';
import { Kit, kitMat } from '../core/js/kit.js';
import { SINT_BAAFSPLEIN } from './sintbaafsplein.js';
import { GRASLEI } from './graslei.js';
import { VEERLEPLEIN } from './veerleplein.js';
import { SABBEBERG } from './sabbeberg.js';
import { STRAND } from './strand.js';
import { TOREKEN } from './toreken.js';
import { PROVINCIEHUIS } from './provinciehuis.js';
import { BELGACOMTOREN } from './belgacomtoren.js';
import { OPERA } from './opera.js';
import { TOPSPORTHAL } from './topsporthal.js';
import { VANDEWIELEBRUG } from './vandewielebrug.js';
import { wedding } from './wedding.js';
import { CEDERSTRAAT } from './cederstraat.js';
import { BORDES } from './bordes.js';
import { BANNERS } from './banners.js';
import { banner } from '../core/js/banner.js';
import { standing } from '../core/js/tour.js';
import { STATUE } from './tourcast-config.js';

export const MONUMENTS = [
  // Jacob van Artevelde (Pieter De Vigne, 1863) in the middle of the Vrijdagmarkt (OpenStreetMap
  // has him at 51.05694 N, 3.72583 E, a little east, but the game's square is wider there): the
  // brewer who led Ghent in 1338, in bronze on a neo-Gothic pedestal, his right arm out over the square
  { id: 'artevelde', name: 'Jacob van Artevelde', ...STATUE, size: 7.6, seat: { half: 3.8, y: 0.5 }, make: artevelde },
  // De Dulle Griet (15th century), the great red bombard on the Grootkanonplein just off the
  // Vrijdagmarkt (OpenStreetMap: 51.05730 N, 3.72412 E), lying on its three stone trestles along
  // the wall of the house behind it, behind a chain on low posts
  { id: 'dulle-griet', name: 'Dulle Griet', x: 28.1, z: -538.8, turn: -0.736, size: [7.4, 2.4], make: dulleGriet },
  // De Mammelokker (David 't Kindt, 1741; the stone recarved by Jan Anteunis in 1962): the relief over
  // the door of the old prison warders' house against the Lakenhalle, on the Goudenleeuwplein, in the
  // middle of its curved front (the second of the Lakenhalle's outlines in landmarks.js): Pero
  // feeding her father Cimon at her breast through the bars, as he starves in prison
  { id: 'mammelokker', name: 'Mammelokker', x: 105, z: -61.1, turn: Math.PI, size: 0.4, make: mammelokker },
  // a wedding party in front of the Stadhuis's Renaissance front on the Botermarkt, at the foot of its
  // perron (bordes.js), the couple with their backs to it and their guests round them, between the
  // steps and the street (wedding.js)
  { id: 'trouwfeest', name: 'Trouwfeest', x: 136.8, z: -127.5, turn: 1.067, size: [8.4, 6.4], make: wedding },
  // a family on the Cederstraat's pavement in the Brugse Poort, their cat and their long tail (cederstraat.js)
  CEDERSTRAAT,
];

// The bike racks (ghent/bikeracks.json, placed by tools/bikeracks.mjs): size is [along, across]
// the rack, so riders bump into its rectangle. Only the first is named, so the developer page lists one.
MONUMENTS.push(...BIKE_RACKS.map((r, k) => ({
  id: `fietsenstalling-${k + 1}`, name: k ? undefined : 'Fietsenstalling', x: r.x, z: r.z, turn: r.turn, size: [5.6, 3.6], make: () => bikeRack(8, k + 1),
})));

// The city's banners on its schools, crèches and museums (ghent/banners.js, placed by
// tools/banners.mjs), sticking out from the wall high over the pavement: nothing to bump into
// (no foot), and only the first named, so the developer page lists one.
MONUMENTS.push(...BANNERS.map((b, k) => ({
  id: `banner-${k + 1}`, name: k ? undefined : 'Banner', x: b.x, z: b.z, turn: b.turn, size: 0.2, foot: [], reach: 15, make: () => banner(b),
})));

// the Kouter's bandstand and blue kiosk, the bus canopies at Zuid, the flower stalls and the
// neuzekes carts
// (js/cities/gent/pavilions.js)
MONUMENTS.push(...PAVILIONS, ...STALLS);

// the piano under the Stadshal and SGOL in the cellar under it (ghent/stadshal.js)
MONUMENTS.push(...STADSHAL);

// the two railway stations and De Krook, modelled by hand on their outlines in place of the map's
// boxes (ghent/stations.js, ghent/krook.js)
MONUMENTS.push(...STATIONS, ...KROOK);
// the courtyard walls enclosing the narrow Graffitistraatje
MONUMENTS.push(...GRAFFITISTRAAT);
// the Glazen Straatje's covered gallery, its portals, and the lit windows in the streets round it
MONUMENTS.push(...GLAZEN_STRAATJE);
// Route du Soleil's brick hall on the Sassevaartstraat, and the car park's mouth at the foot of the ramp beside it (ghent/doknoord.js)
MONUMENTS.push(...DOK_NOORD);
// Dok Noord's square: the shops under their sawtooth glass gables, the glass hall and the Direkteurswoning (ghent/doknoordplein.js)
MONUMENTS.push(...DOK_NOORD_PLEIN);
// the Kouter's car park: the glass pavilions over its stairs and the mouth at the foot of its ramp (ghent/kouter.js)
MONUMENTS.push(...KOUTER);
// Travelbase's neighbours on the Sassevaartstraat: the old AEG works and the Dok Noord building (ghent/sassevaart.js)
MONUMENTS.push(...SASSEVAART);
// the three restaurants' terraces on the Sint-Baafsplein, 't Vosken's and its neighbours' (ghent/sintbaafsplein.js)
MONUMENTS.push(...SINT_BAAFSPLEIN);
// the restaurants' terraces along the Graslei, and a few across the Leie on the Korenlei (ghent/graslei.js)
MONUMENTS.push(...GRASLEI);
// the cafés' and restaurants' terraces on the Sint-Veerleplein, under the Gravensteen (ghent/veerleplein.js)
MONUMENTS.push(...VEERLEPLEIN);
// the perron in front of the Stadhuis on the Botermarkt (ghent/bordes.js)
MONUMENTS.push(...BORDES);
// the lookout tower on the Karel Sabbeberg (ghent/sabbeberg.js)
MONUMENTS.push(...SABBEBERG);
// the parasols on the Blaarmeersen's beaches and Le Beach House behind the long one (ghent/strand.js)
MONUMENTS.push(...STRAND);
// the Toreken on the Vrijdagmarkt, in place of the brick tower the map's outline made (ghent/toreken.js)
MONUMENTS.push(...TOREKEN);
// the Provinciehuis in the old Leopoldskazerne on the Charles de Kerchovelaan, in place of the map's
// boxes (ghent/provinciehuis.js)
MONUMENTS.push(...PROVINCIEHUIS);
// the old Belgacom tower on the Sint-Jacobsnieuwstraat, in place of the map's box (ghent/belgacomtoren.js)
MONUMENTS.push(...BELGACOMTOREN);
// the Opera on the Schouwburgstraat, in place of the map's boxes (ghent/opera.js)
MONUMENTS.push(...OPERA);
// the Topsporthal by the Watersportbaan, in place of the map's box (ghent/topsporthal.js), and the
// Annie Vande Wielebrug's blue steel and arched girder along the map's deck (ghent/vandewielebrug.js)
MONUMENTS.push(...TOPSPORTHAL, ...VANDEWIELEBRUG);

const STONE = '#c3bcab';

function artevelde() {
  const g = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0xc3bcab, roughness: 0.9, flatShading: true });
  const bronze = new THREE.MeshStandardMaterial({ color: 0x55664f, metalness: 0.45, roughness: 0.5, flatShading: true });
  const side = new THREE.MeshStandardMaterial({ map: elevation(4.2, 6, 24, pedestalSide), roughness: 0.9 });
  const add = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };
  // two steps, the pedestal with a pinnacle at each corner, its cornice and a plinth for the figure
  add(new THREE.BoxGeometry(7.6, 0.5, 7.6), stone, 0, 0.25, 0);
  add(new THREE.BoxGeometry(6.4, 0.5, 6.4), stone, 0, 0.75, 0);
  add(new THREE.BoxGeometry(4.2, 6, 4.2), [side, side, stone, stone, side, side], 0, 4, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(new THREE.BoxGeometry(0.7, 6.4, 0.7), stone, sx * 2.2, 4.2, sz * 2.2);
    add(new THREE.ConeGeometry(0.42, 1.6, 4).rotateY(Math.PI / 4), stone, sx * 2.2, 8.2, sz * 2.2);
  }
  add(new THREE.BoxGeometry(4.9, 0.6, 4.9), stone, 0, 7.3, 0);
  add(new THREE.BoxGeometry(3, 0.8, 3), stone, 0, 8, 0);
  // a moulded base under the shaft, a frieze of little pointed arches under the cornice, crockets
  // up the pinnacles, and on each side a bronze plaque standing proud of the stone
  add(new THREE.BoxGeometry(4.6, 0.35, 4.6), stone, 0, 1.18, 0);
  for (let k = 0; k < 4; k++) {
    const turn = (k * Math.PI) / 2, cx = Math.sin(turn), cz = Math.cos(turn);
    for (let a = -1.5; a <= 1.5; a += 0.5) {
      const arch = add(new THREE.ConeGeometry(0.2, 0.34, 4).rotateY(Math.PI / 4), stone, cx * 2.18 + cz * a, 6.85, cz * 2.18 - cx * a);
      arch.scale.set(1, 1, 0.4);
      arch.rotation.y = turn;
    }
    const plaque = add(new THREE.BoxGeometry(1.7, 2.3, 0.12), bronze, cx * 2.14, 4.3, cz * 2.14);
    plaque.rotation.y = turn;
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (let h = 7.7; h < 8.8; h += 0.35) {
      const out = 0.42 * (9 - h) / 1.6 * 0.75; // on the pinnacle's corner edge, outward
      add(new THREE.BoxGeometry(0.12, 0.12, 0.12), stone, sx * (2.2 + out), h, sz * (2.2 + out));
    }
    add(new THREE.SphereGeometry(0.12, 6, 4), stone, sx * 2.2, 9.05, sz * 2.2); // the finial
  }

  // the figure, 5 m tall: a long robe, a cloak, a hood-like hat, the right arm stretched out
  const n = g.children.length, y = 8.4;
  add(new THREE.CylinderGeometry(0.55, 0.95, 2.7, 10), bronze, 0, y + 1.35, 0);
  add(new THREE.CylinderGeometry(0.6, 0.55, 1.4, 10), bronze, 0, y + 3.4, 0);
  add(new THREE.BoxGeometry(1.5, 0.35, 0.75), bronze, 0, y + 4.05, 0); // the shoulders
  const cloak = add(new THREE.BoxGeometry(1.5, 3.9, 0.18), bronze, 0, y + 2.2, -0.62);
  cloak.rotation.x = -0.12;
  add(new THREE.CylinderGeometry(0.16, 0.2, 0.3, 8), bronze, 0, y + 4.3, 0); // the neck
  add(new THREE.SphereGeometry(0.38, 12, 10), bronze, 0, y + 4.7, 0.03);
  add(new THREE.CylinderGeometry(0.44, 0.4, 0.38, 12), bronze, 0, y + 5.0, 0); // the hat
  add(new THREE.CylinderGeometry(0.2, 0.44, 0.3, 12), bronze, 0, y + 5.3, -0.05);
  add(new THREE.TorusGeometry(0.46, 0.06, 6, 16).rotateX(Math.PI / 2), bronze, 0, y + 4.85, 0); // its brim
  add(new THREE.BoxGeometry(0.1, 0.14, 0.12), bronze, 0, y + 4.66, 0.4); // the nose
  // the robe in folds down to the feet, the shoes peeping out under it
  for (let a = 0; a < 10; a++) {
    const t = (a / 10) * Math.PI * 2;
    add(new THREE.CylinderGeometry(0.07, 0.12, 2.6, 5), bronze, Math.sin(t) * 0.78, y + 1.32, Math.cos(t) * 0.78).rotation.set(Math.cos(t) * 0.14, 0, -Math.sin(t) * 0.14);
  }
  for (const sx of [-0.25, 0.25]) add(new THREE.BoxGeometry(0.26, 0.18, 0.55), bronze, sx, y + 0.09, 0.75);
  // a belt with a purse and a dagger on it, a fur collar, and the cloak's hem rolled at the bottom
  add(new THREE.TorusGeometry(0.62, 0.07, 6, 18).rotateX(Math.PI / 2), bronze, 0, y + 2.75, 0);
  add(new THREE.BoxGeometry(0.22, 0.14, 0.08), bronze, 0, y + 2.75, 0.66); // the buckle
  add(new THREE.BoxGeometry(0.26, 0.34, 0.14), bronze, 0.42, y + 2.5, 0.48); // the purse
  add(new THREE.BoxGeometry(0.07, 0.75, 0.05), bronze, -0.55, y + 2.35, 0.38).rotation.z = 0.12; // the dagger
  add(new THREE.TorusGeometry(0.62, 0.17, 8, 18).rotateX(Math.PI / 2), bronze, 0, y + 4.15, -0.02);
  add(new THREE.CylinderGeometry(0.1, 0.1, 1.6, 8).rotateZ(Math.PI / 2), bronze, 0, y + 0.35, -0.85);
  const arm = (len, x, rx, rz) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y + 3.95, 0);
    pivot.rotation.set(rx, 0, rz);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.19, len, 8), bronze);
    m.position.y = -len / 2;
    m.castShadow = true;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6), bronze);
    hand.position.y = -len - 0.1;
    pivot.add(m, hand);
    g.add(pivot);
  };
  arm(2, -0.8, -2.0, -0.35); // the right arm, out and up over the square
  arm(1.7, 0.8, -0.25, 0.25); // the left down at his side, holding the cloak
  // the figure on its own, which the tour keeps out of sight until he has climbed up there himself (ghent/tour.js runner)
  const figure = new THREE.Group();
  figure.add(...g.children.slice(n));
  g.add(standing('artevelde', figure));
  g.name = 'artevelde';
  return g;
}

// a side of the pedestal: ashlar, a pointed panel with a bronze relief and a shield under it
function pedestalSide(g, w, h) {
  ashlar(g, -w / 2, 0, w / 2, h, STONE, { course: 0.45, seed: 81 });
  g.fillStyle = shade(STONE, -0.3);
  archPath(g, 0, 1.2, 2.8, 4.2);
  g.fill();
  g.fillStyle = '#4f5f4a';
  archPath(g, 0, 1.4, 2.4, 3.8);
  g.fill();
  niche(g, 0, 2, 1.2, 2.6, '#7d8f74'); // a figure in the bronze relief
  g.fillStyle = '#1c1c1c'; // the shield: Ghent's lion, white on black
  g.beginPath();
  g.moveTo(-0.45, 0.95); g.lineTo(0.45, 0.95); g.lineTo(0.45, 0.6); g.lineTo(0, 0.25); g.lineTo(-0.45, 0.6);
  g.fill();
  g.fillStyle = '#e8e4da';
  g.beginPath(); g.ellipse(0, 0.66, 0.16, 0.2, 0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = shade(STONE, 0.15);
  g.fillRect(-w / 2, h - 0.35, w, 0.35);
}

// De Dulle Griet: 5 m of wrought iron bars hooped together, painted red, the bore 64 cm across; the
// powder chamber behind narrower and banded, the whole on three stone trestles with saddles cut
// for it. Along x, the muzzle at +x.
function dulleGriet() {
  const k = new Kit(), S = 1.25, RED = 0xb8432e, DARK = 0x8e2f20, STONE_GREY = 0xa7a49c, y = 1.25 * S;
  const len = 5 * S, chamber = 1.6 * S;
  // the barrel, a little wider at the muzzle, and its hoops
  k.add(new THREE.CylinderGeometry(0.5 * S, 0.47 * S, len - chamber, 24, 1, true), RED, len / 2 - (len - chamber) / 2, y, 0, 0, 0, Math.PI / 2);
  for (let x = -len / 2 + chamber + 0.2; x < len / 2 - 0.1; x += 0.55 * S) k.add(new THREE.CylinderGeometry(0.505 * S, 0.505 * S, 0.12, 24), DARK, x, y, 0, 0, 0, Math.PI / 2);
  // the muzzle: a thick ring round the black bore
  k.add(new THREE.TorusGeometry(0.42 * S, 0.09 * S, 8, 24), RED, len / 2, y, 0, 0, Math.PI / 2, 0);
  k.add(new THREE.CircleGeometry(0.34 * S, 20), 0x1a1311, len / 2 - 0.3, y, 0, 0, Math.PI / 2, 0);
  k.add(new THREE.CylinderGeometry(0.34 * S, 0.34 * S, 0.6, 20, 1, true), 0x2a1d18, len / 2 - 0.3, y, 0, 0, 0, Math.PI / 2);
  // the chamber behind, narrower, in a few broad bands, and its closed end
  k.add(new THREE.CylinderGeometry(0.4 * S, 0.43 * S, chamber, 20), RED, -len / 2 + chamber / 2, y, 0, 0, 0, Math.PI / 2);
  for (let x = -len / 2 + 0.25; x < -len / 2 + chamber; x += 0.45 * S) k.add(new THREE.CylinderGeometry(0.44 * S, 0.44 * S, 0.14, 20), DARK, x, y, 0, 0, 0, Math.PI / 2);
  k.add(new THREE.CylinderGeometry(0.44 * S, 0.5 * S, 0.3, 24), RED, -len / 2 + chamber + 0.1, y, 0, 0, 0, Math.PI / 2);
  // the three trestles: a stone block on a plinth, its sides curving in, a saddle on top
  for (const x of [-len / 2 + 0.9, 0.2, len / 2 - 0.9]) {
    k.box(1.0, 0.25, 1.9, STONE_GREY, x, 0.12, 0);
    k.add(new THREE.CylinderGeometry(0.42, 0.55, 0.9, 4).rotateY(Math.PI / 4).scale(1, 1, 1.9), STONE_GREY, x, 0.7, 0);
    k.box(0.9, 0.35, 1.55, STONE_GREY, x, y - 0.55 * S + 0.05, 0);
  }
  // the chain round it on low stone posts, a stone ball at each end
  const posts = [[-4.3, -1.8], [0, -1.8], [4.3, -1.8], [4.3, 1.8], [0, 1.8], [-4.3, 1.8]];
  posts.forEach(([x, z], i) => {
    k.add(new THREE.CylinderGeometry(0.16, 0.18, 0.9, 8), STONE_GREY, x, 0.45, z);
    const [nx, nz] = posts[(i + 1) % posts.length];
    if (i !== 2 && i !== 5) for (let t = 0; t < 1; t += 0.1) k.box(0.08, 0.05, 0.08, 0x3a3a3a, x + (nx - x) * (t + 0.05), 0.78 - Math.sin(Math.PI * (t + 0.05)) * 0.25, z + (nz - z) * (t + 0.05));
  });
  for (const x of [-4.9, 4.9]) k.add(new THREE.SphereGeometry(0.42, 10, 8), STONE_GREY, x, 0.42, 0);
  return k.mesh(kitMat(0.7, 0.2));
}

// The Mammelokker, high on the wall over the door (facing +z, its back against the wall at z = 0): a
// curved stone pediment, and in its field, carved in white stone, the barred window of the cell, old
// Cimon sitting chained on the left, his long beard on his chest, and his daughter Pero kneeling
// to him from the right, holding his head to her breast, her cloak falling behind her.
function mammelokker() {
  const g = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0xe9e4d6, roughness: 0.85 }), dark = new THREE.MeshStandardMaterial({ color: 0x3a3631, roughness: 0.9 });
  const Y = 7.2, W = 3.6, H = 2.1; // the pediment's foot, how wide and high
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.set(sx, sy, sz);
    mesh.castShadow = true;
    g.add(mesh);
    return mesh;
  };
  // the field, its top a flat arch, and the moulding round it
  const field = new THREE.Shape();
  field.moveTo(-W / 2, 0); field.lineTo(W / 2, 0); field.lineTo(W / 2, H * 0.55);
  field.quadraticCurveTo(0, H * 1.25, -W / 2, H * 0.55); field.lineTo(-W / 2, 0);
  add(new THREE.ExtrudeGeometry(field, { depth: 0.12, bevelEnabled: false }), stone, 0, Y, 0);
  const rim = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-W / 2 - 0.1, H * 0.55, 0), new THREE.Vector3(0, H * 1.3, 0), new THREE.Vector3(W / 2 + 0.1, H * 0.55, 0));
  add(new THREE.TubeGeometry(rim, 24, 0.09, 8), stone, 0, Y, 0.16);
  add(new THREE.BoxGeometry(W + 0.5, 0.18, 0.4), stone, 0, Y - 0.09, 0.14); // the cornice it sits on
  for (const side of [-1, 1]) add(new THREE.BoxGeometry(0.22, H * 0.6, 0.28), stone, side * (W / 2 + 0.05), Y + H * 0.3, 0.1);
  // the cell's window behind them, with its bars
  add(new THREE.BoxGeometry(0.7, 0.75, 0.02), dark, -0.25, Y + 1.25, 0.13);
  for (let k = 0; k < 4; k++) add(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 6), stone, -0.52 + k * 0.18, Y + 1.25, 0.16);
  // Cimon, seated on the left, in profile turned to her: his body, his legs, his bald head bowed,
  // his beard, his hands chained behind him
  const z = 0.22;
  add(new THREE.CapsuleGeometry(0.2, 0.42, 4, 10), stone, -0.85, Y + 0.72, z, 0, 0, -0.35, 1, 1, 0.55);
  add(new THREE.CapsuleGeometry(0.11, 0.42, 4, 8), stone, -0.62, Y + 0.32, z + 0.02, 0, 0, Math.PI / 2 - 0.15, 1, 1, 0.6); // thigh
  add(new THREE.CapsuleGeometry(0.09, 0.35, 4, 8), stone, -0.38, Y + 0.18, z + 0.02, 0, 0, 0.1, 1, 1, 0.6); // shin
  add(new THREE.SphereGeometry(0.15, 14, 10), stone, -0.64, Y + 1.18, z + 0.02, 0, 0, 0, 1, 1.05, 0.7); // head
  add(new THREE.ConeGeometry(0.11, 0.32, 10), stone, -0.55, Y + 0.98, z + 0.05, 0, 0, -0.5, 1, 1, 0.5); // beard
  add(new THREE.BoxGeometry(0.62, 0.32, 0.3), stone, -0.85, Y + 0.12, z - 0.05); // the bench
  add(new THREE.TorusGeometry(0.07, 0.018, 6, 12), dark, -1.05, Y + 0.62, z + 0.08, 0, 0, 0.6); // the chain at his wrists
  // Pero, kneeling on the right, leaning in to him: her body, her bent leg, her head turned down
  // to him, her hair gathered up, her arm round his head, the cloak behind her
  add(new THREE.CapsuleGeometry(0.19, 0.5, 4, 10), stone, -0.18, Y + 0.78, z, 0, 0, 0.45, 1, 1, 0.55);
  add(new THREE.CapsuleGeometry(0.12, 0.4, 4, 8), stone, 0.12, Y + 0.3, z + 0.02, 0, 0, Math.PI / 2 + 0.1, 1, 1, 0.6);
  add(new THREE.CapsuleGeometry(0.1, 0.32, 4, 8), stone, 0.34, Y + 0.12, z, 0, 0, 0, 1, 1, 0.6);
  add(new THREE.SphereGeometry(0.14, 14, 10), stone, -0.34, Y + 1.25, z + 0.03, 0, 0, 0, 0.95, 1.1, 0.7);
  add(new THREE.SphereGeometry(0.1, 10, 8), stone, -0.26, Y + 1.36, z, 0, 0, 0, 1, 0.8, 0.6); // her hair, gathered
  add(new THREE.CapsuleGeometry(0.06, 0.38, 4, 8), stone, -0.5, Y + 1.16, z + 0.1, 0, 0, 1.2, 1, 1, 0.7); // her arm round him
  const cloak = new THREE.Shape();
  cloak.moveTo(0, 0); cloak.quadraticCurveTo(0.55, 0.3, 0.45, 1.3); cloak.quadraticCurveTo(0.2, 0.9, -0.15, 0.95); cloak.lineTo(0, 0);
  add(new THREE.ExtrudeGeometry(cloak, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), stone, 0.05, Y + 0.05, 0.12);
  // on the right, the jailer's keys hanging on the wall, and on the left his water jug, empty
  add(new THREE.TorusGeometry(0.1, 0.02, 6, 14), stone, 1.1, Y + 1.0, 0.16);
  add(new THREE.CylinderGeometry(0.07, 0.11, 0.3, 10), stone, -1.4, Y + 0.15, 0.2);
  // and under it the door, in a stone surround with a step: the wall behind is the game's own,
  // which turns a corner here where the real front curves
  const wall = new THREE.MeshStandardMaterial({ color: 0xd8d0bc, roughness: 0.9 }), door = new THREE.MeshStandardMaterial({ color: 0x3b2a1c, roughness: 0.7 });
  add(new THREE.BoxGeometry(W + 0.2, Y - 0.18, 0.5), wall, 0, (Y - 0.18) / 2, -0.15);
  for (const side of [-1, 1]) add(new THREE.BoxGeometry(0.35, Y - 0.6, 0.18), stone, side * 1.15, (Y - 0.6) / 2 + 0.25, 0.15);
  add(new THREE.BoxGeometry(2.7, 0.4, 0.24), stone, 0, Y - 0.55, 0.15); // the lintel
  add(new THREE.BoxGeometry(1.8, 3.6, 0.08), door, 0, 1.95, 0.12);
  for (const side of [-1, 1]) for (const y of [1.1, 2.8]) add(new THREE.BoxGeometry(0.62, 1.2, 0.04), door, side * 0.42, y, 0.17); // its panels
  add(new THREE.BoxGeometry(2.8, 0.15, 0.6), stone, 0, 0.075, 0.25); // the step
  return g;
}
