// Ghent's landmarks drawn by hand, from photos: drawings of their walls in game metres (1.25 game
// metres to a real one), in the flat painted style of the rest of the city. See js/facades.js for
// the kit and js/landmarks.js for how they go on. Each design:
//
//   drawings    { key: { width, height, px, fit, draw(g, w, h) } }: the drawings, each w metres
//               across and h metres up, painted by draw() in metres (x from -w/2 to w/2, y up) and
//               laid on its walls by fit: 'centre' (true metres, centred on the wall, from the
//               ground), 'bays' (repeated a whole number of times across, stretched up the wall),
//               'fit' (once across the whole wall) or 'run' (repeated in true metres)
//   wall(w, t)  optional: which drawing a wall gets (w: { span, bottom, top, n, c, ... }, see
//               triangles() in js/landmarks.js), or 'stone' / 'slate' / nothing for the plain look;
//               without it every wall 3 m and wider gets the first drawing
//   part(t)     optional: the same for one triangle t = { n, c, r, wall, w }, before wall() is asked
//   props(lm, top)  optional: extra models on it, `top` the model's highest point
//   solid       optional: rings (flat [x, z, ...]) its props stand on, for riders to bump into
import * as THREE from 'three';
import { elevation, ashlar, lancet, stringCourse, balustrade, clock, archPath, shade, crossWindow, roundArch, pilaster, rose, niche, brick, rng } from '../core/js/facades.js';
import { gravensteen, CASTLE_WALL, CASTLE_STONE } from './gravensteen.js';
import { LANDMARKS } from './landmarks.js';
import { standing } from '../core/js/tour.js';

const BELFORT_STONE = '#b4ad9e';
const facing = (w, deg) => Math.cos(Math.atan2(w.n.z, w.n.x) - (deg * Math.PI) / 180) > 0.7; // within 45° of
const NORTH = -90, EAST = 0; // game x runs east, z south

export const FACADES = {
  // The Belfort (1380, its spire of 1913): a square stone tower, a pair of tall louvred lancets
  // above the Lakenhalle's roof, a gallery, the clock stage, four corner turrets and a dark spire
  // with the gilded dragon on top.
  belfort: {
    drawings: {
      tower: {
        width: 26,
        height: 73.5,
        px: 14,
        fit: 'centre',
        draw(g, w, h) {
          const L = -w / 2, R = w / 2, S = BELFORT_STONE;
          ashlar(g, L, 0, R, h, shade(S, -0.08), { seed: 11 });
          ashlar(g, L, 50, R, h, S, { seed: 12 }); // the upper stage, in lighter stone
          // the foot, mostly behind the Lakenhalle: a door and blind arches
          lancet(g, 0, 0, 3.4, 8, { stone: S, mullion: false, dark: '#3a3026' });
          for (const x of [-6, 6]) lancet(g, x, 9, 2.2, 9, { stone: S, dark: shade(S, -0.3), mullion: false });
          stringCourse(g, L, R, 22, S);
          // a pair of shorter lancets, then the tall louvred pair of the bell chamber
          for (const x of [-3.6, 3.6]) lancet(g, x, 25, 2.6, 9, { stone: S, louvres: true });
          stringCourse(g, L, R, 36.5, S);
          for (const x of [-3.6, 3.6]) lancet(g, x, 37.6, 3.4, 11.4, { stone: S, louvres: true });
          // thin buttress strips up the shaft, either side of the windows
          for (const x of [-7.2, 7.2]) {
            g.fillStyle = shade(S, 0.12); g.fillRect(x - 0.35, 0, 0.7, 50);
            g.fillStyle = shade(S, -0.3); g.fillRect(x + 0.35, 0, 0.18, 50);
          }
          // the first gallery, where the tower steps in
          stringCourse(g, L, R, 49.6, S, 0.7);
          balustrade(g, L, R, 50, 1.8, S);
          // the clock stage: a tall pointed recess, the clock in it and a lancet above
          g.fillStyle = shade(S, -0.22);
          archPath(g, 0, 52.2, 8.8, 18.3);
          g.fill();
          ashlar(g, -4, 52.2, 4, 64, shade(S, 0.04), { seed: 13 });
          g.fillStyle = shade(S, 0.1);
          g.fillRect(-4.6, 54.4, 9.2, 0.6); // the little balcony under the clock
          clock(g, 0, 59, 3.3);
          lancet(g, 0, 63.6, 2.2, 6, { stone: S, louvres: true, mullion: false });
          for (const x of [-6.2, 6.2]) lancet(g, x, 56, 1.3, 9, { stone: S, mullion: false, dark: shade(S, -0.35) });
          // the top: a cornice and the parapet between the turrets
          stringCourse(g, L, R, 71, S, 0.7);
          balustrade(g, L, R, 71.4, 2.1, S);
        },
      },
    },
    // above the parapet: the spire in the middle is dark slate, the turrets at the corners stone
    part: t => (t.c.y > 73 ? (t.r < 7.5 ? 'slate' : 'stone') : undefined),
    props: (lm, top) => { // (the tour keeps it out of sight until it lands there, its rod already waiting: ghent/tour.js flyer)
      const d = dragon(top);
      standing('dragon', d.userData.body);
      return d;
    },
  },

  // The Lakenhalle (1441, finished 1903): the cloth hall at the Belfort's foot, in pale Balegem
  // stone, bays between buttresses, cross windows below and tall traceried ones above, a pierced
  // parapet; on its slate roof a row of stone dormers, each a pointed gable between two pinnacles,
  // and a turret on every corner.
  lakenhalle: {
    drawings: {
      bay: { width: 5.3, height: 19.4, px: 16, fit: 'bays', draw: lakenhalBay },
    },
    wall: w => (w.span >= 3 ? 'bay' : undefined),
    props: lm => lakenhalRoof(hallFrame(lm)),
  },

  // The NTGent Schouwburg (Edmond De Vigne, 1899) on the Sint-Baafsplein: neo-Renaissance, a
  // rusticated ground floor of round arches, tall arched windows between paired columns above, a
  // balustrade under the slate roof.
  schouwburg: {
    drawings: {
      bay: { width: 6.2, height: 26, px: 14, fit: 'bays', draw: schouwburgBay },
    },
    wall: w => (w.span >= 3 ? 'bay' : undefined),
  },

  // The Stadhuis: on the Hoogpoort the flamboyant Gothic of Keldermans (1519), lace of tall windows,
  // niches with statues and an openwork parapet; on the Botermarkt the Renaissance front (1595),
  // three storeys of columns, Doric, Ionic and Corinthian, between rows of cross windows.
  stadhuis: {
    drawings: {
      gothic: { width: 6, height: 26, px: 16, fit: 'bays', draw: stadhuisGothic },
      renaissance: { width: 5, height: 26, px: 16, fit: 'bays', draw: stadhuisRenaissance },
    },
    wall: w => (w.span < 3 ? undefined : facing(w, NORTH) ? 'gothic' : 'renaissance'),
  },

  // The Postgebouw (Louis Cloquet, 1910-1925), the post office on the Korenmarkt: neo-Gothic in warm
  // sandstone, a ground floor of arched windows and doorways, two floors of tall mullioned windows
  // under string courses, a pierced parapet and a slate roof of stepped dormer gables; its corner
  // turret and clock tower are plainer, with narrow windows stacked up them.
  postgebouw: {
    drawings: {
      bay: { width: 6.2, height: 26, px: 14, fit: 'bays', draw: postBay },
      tower: { width: 12, height: 60, px: 10, fit: 'fit', draw: postTower },
    },
    wall: w => (w.span < 3 ? undefined : w.top - w.bottom > 38 && w.span < 16 ? 'tower' : 'bay'),
  },

  // Sint-Baafs: the west tower (1534) of Balegem stone, the great portal and west window, stages of
  // paired lancets and octagonal corner turrets; a nave of tall traceried windows between buttresses.
  'sint-baafs': church({
    stone: '#bdb5a3',
    towerFrom: 60,
    tower: (g, w, h) => {
      const S = '#c4bca9', L = -w / 2, R = w / 2;
      ashlar(g, L, 0, R, h, S, { seed: 21 });
      buttresses(g, w, h, S);
      lancet(g, 0, 0, 5.4, 14, { stone: S, mullion: false, dark: '#3b2f25' }); // the portal
      niche(g, 0, 10.5, 1.4, 3.2, S);
      lancet(g, 0, 17, 7, 20, { stone: S }); // the west window
      for (const x of [-1.75, 1.75]) lancet(g, x, 17.8, 2.6, 13, { stone: S, mullion: false });
      balustrade(g, L + 2, R - 2, 38.5, 1.6, S);
      for (const [y, hh] of [[42, 12], [56, 14]]) {
        for (const x of [-2.6, 2.6]) lancet(g, x, y, 2.6, hh, { stone: S, louvres: y > 50 });
        stringCourse(g, L, R, y + hh + 0.9, S);
      }
      balustrade(g, L, R, h - 2.4, 2.4, S);
    },
    gable: (g, w, h, S) => {
      lancet(g, 0, h * 0.18, w * 0.45, h * 0.62, { stone: S });
      for (const x of [-w * 0.11, w * 0.11]) lancet(g, x, h * 0.2, w * 0.15, h * 0.4, { stone: S, mullion: false });
    },
  }),

  // Sint-Niklaas: Scheldt Gothic in blue-grey Tournai stone, a lantern tower over the crossing with
  // its corner turrets, round-headed and pointed windows in rows
  'sint-niklaas': church({
    stone: '#8f9294',
    towerFrom: 45,
    spires: { id: 'sint-niklaas', tall: 4, crown: 8 }, // needles on its ten turrets, a steeper crossing roof
    tower: (g, w, h) => {
      const S = '#979a9b', L = -w / 2, R = w / 2;
      ashlar(g, L, 0, R, h, S, { seed: 31 });
      buttresses(g, w, h, S);
      for (const [y, hh, n] of [[h * 0.5, h * 0.18, 3], [h * 0.74, h * 0.2, 2]]) {
        const step = (w - 4) / n;
        for (let k = 0; k < n; k++) lancet(g, L + 2 + step * (k + 0.5), y, step * 0.55, hh, { stone: S, louvres: true, mullion: false });
        stringCourse(g, L, R, y - 0.8, S);
      }
      balustrade(g, L, R, h - 2, 2, S, 1.3);
    },
    gable: (g, w, h, S) => {
      for (const x of [-w * 0.22, 0, w * 0.22]) lancet(g, x, h * 0.15, w * 0.16, h * (x ? 0.5 : 0.58), { stone: S });
      rose(g, 0, h * 0.82, w * 0.12, { stone: S });
    },
  }),

  // Sint-Michiel: light Balegem stone, the west tower left unfinished with its flat top, tall nave
  // and transept windows
  'sint-michiel': church({
    stone: '#c2b9a4',
    towerFrom: 50,
    tower: (g, w, h) => {
      const S = '#c8bfab', L = -w / 2, R = w / 2;
      ashlar(g, L, 0, R, h, S, { seed: 41 });
      buttresses(g, w, h, S);
      lancet(g, 0, 0, w * 0.32, h * 0.2, { stone: S, mullion: false, dark: '#3b2f25' });
      lancet(g, 0, h * 0.25, w * 0.42, h * 0.3, { stone: S });
      for (const x of [-w * 0.16, w * 0.16]) lancet(g, x, h * 0.62, w * 0.2, h * 0.24, { stone: S, louvres: true });
      stringCourse(g, L, R, h * 0.58, S);
      g.fillStyle = shade(S, -0.15);
      g.fillRect(L, h - 1.2, w, 1.2); // the flat, unfinished top
    },
    gable: (g, w, h, S) => {
      lancet(g, 0, h * 0.15, w * 0.5, h * 0.66, { stone: S });
      for (const x of [-w * 0.125, w * 0.125]) lancet(g, x, h * 0.17, w * 0.2, h * 0.42, { stone: S, mullion: false });
    },
  }),

  // Sint-Jacobs (12th-15th century): the Romanesque west front of grey-brown stone, two square towers
  // with paired round-headed openings stacked up them and a central gable with a round window over
  // the portal; the nave and choir Gothic, tall traceried windows between buttresses; the spires slate.
  'sint-jacobs': jacobs(church({
    stone: '#9a9284',
    towerFrom: 18,
    tower: (g, w, h) => {
      const S = '#958c7d', L = -w / 2, R = w / 2, dark = '#2a2622';
      ashlar(g, L, 0, R, h, S, { seed: 81, course: 0.55, vary: 0.09 });
      buttresses(g, w, h, S);
      roundArch(g, 0, 0, w * 0.2, h * 0.12, '#3a2f26'); // a blind arch low down
      for (const [y, hh, n] of [[h * 0.22, h * 0.14, 1], [h * 0.46, h * 0.16, 2], [h * 0.7, h * 0.2, 3]]) {
        const step = (w - 3) / n;
        for (let k = 0; k < n; k++) {
          const x = L + 1.5 + step * (k + 0.5);
          roundArch(g, x, y, step * 0.4, hh, shade(S, -0.3));
          roundArch(g, x, y + 0.2, step * 0.3, hh - 0.3, dark);
        }
        stringCourse(g, L, R, y - 0.7, S, 0.4);
      }
    },
    gable: (g, w, h, S) => {
      // the Romanesque west front: the round portal, the round window above, blind arcade under the gable
      roundArch(g, 0, 0, w * 0.2, h * 0.28, shade(S, -0.3));
      roundArch(g, 0, 0, w * 0.15, h * 0.25, '#3a2b20');
      rose(g, 0, h * 0.52, w * 0.1, { stone: S, glass: '#2a2d36' });
      for (const x of [-w * 0.3, w * 0.3]) lancet(g, x, h * 0.1, w * 0.12, h * 0.34, { stone: S, mullion: false });
      for (let x = -w * 0.25; x <= w * 0.25; x += w * 0.1) roundArch(g, x, h * 0.74, w * 0.06, h * 0.1, shade(S, -0.25));
    },
  })),

  // The Sint-Pietersabdij on the Sint-Pietersplein: the abbey church (Pieter Huyssens, 1629-1720),
  // baroque in pale sandstone, its two-storey front of pilasters, portals and niches on the square,
  // tall round-headed windows down the nave, the drum of its dome ringed with round windows; behind
  // it the abbey's wings round the cloister, brick with stone cross windows under slate roofs.
  // Gent in 3D has church and abbey as one model, so the abbey's walls are told from the church's
  // by which outline they stand nearer, the church's or the abbey's (the landmark's two OSM ways).
  'sint-pietersabdij': {
    drawings: {
      front: { width: 30, height: 42, px: 10, fit: 'fit', draw: pietersFront },
      bay: { width: 7, height: 30, px: 12, fit: 'bays', draw: pietersBay },
      drum: { width: 5, height: 14, px: 14, fit: 'bays', draw: pietersDrum },
      dome: { width: 9, height: 57, px: 10, fit: 'bays', draw: pietersOctagon },
      tower: { width: 10, height: 75, px: 10, fit: 'fit', draw: pietersTower },
      wing: { width: 4.6, height: 24, px: 16, fit: 'bays', draw: abbeyWing },
    },
    // the model's normals point away from the middle of church and abbey together, so the church's
    // walls are told apart by where they stand: the front on its west end, the dome's octagon over
    // the west part (its faces run up from the roofs in one piece), the east tower over the choir
    wall: w => {
      if (w.span < 2.5) return undefined;
      if (fromRing(w.c.x, w.c.z, ABBEY) < fromRing(w.c.x, w.c.z, PIETERSKERK)) return w.top - w.bottom > 4 ? 'wing' : undefined;
      const west = Math.min(...PIETERSKERK.filter((_, k) => k % 2 === 0));
      if (Math.abs(w.n.x) > 0.7 && w.c.x < west + 17 && w.bottom < 12 && w.top < 50) return 'front';
      if (w.top > 60) return w.c.x - west > 60 ? 'tower' : 'dome';
      if (w.bottom > 30) return 'drum';
      return 'bay';
    },
  },

  // The Groot Vleeshuis (1406-1419), the meat hall on the Groentenmarkt: low walls of grey stone
  // with small shuttered windows under a huge steep slate roof, a row of stepped dormer gables along
  // both long sides; on the ends a tall stepped gable, two pointed windows high up and red doors.
  'groot-vleeshuis': {
    drawings: {
      bay: { width: 5.4, height: 6.3, px: 20, fit: 'bays', draw: vleeshuisBay },
      gable: { width: 17, height: 20.8, px: 12, fit: 'fit', draw: vleeshuisGable },
    },
    wall: w => (w.top - w.bottom > 10 ? 'gable' : w.top - w.bottom > 3 && w.span >= 3 ? 'bay' : undefined),
    props: lm => vleeshuisRoof(hallFrame(lm)),
  },

  // Vooruit (Ferdinand Dierkens, 1913), the socialists' festival palace on the Sint-Pietersnieuwstraat:
  // eclectic fronts of white stone on the street and on the Ketelvest, a great round-arched entrance,
  // three storeys of big arched windows between pilasters, balconies, two towers with domes; its long
  // sides yellow brick in red bands (the red VOORUIT letters across them are left out).
  vooruit: {
    drawings: {
      front: { width: 6.5, height: 44, px: 10, fit: 'bays', draw: vooruitFront },
      tower: { width: 5, height: 48, px: 10, fit: 'bays', draw: vooruitTower },
      side: { width: 9, height: 40, px: 10, fit: 'bays', draw: vooruitSide },
    },
    wall: w => {
      if (w.span < 2) return undefined;
      if (w.span < 8 && w.top > 48) return 'tower';
      return facing(w, EAST) || facing(w, 180) ? 'front' : 'side';
    },
  },

  // The Oud Gerechtsgebouw (Louis Roelandt, 1836-1846), the old law courts on the Koophandelsplein, by
  // the Leie: neoclassical in warm buff sandstone, a rusticated ground floor of round-arched windows
  // in white frames, a first floor of tall windows with pediments over little balustrades, a row of
  // small windows under the cornice; on the square the portico of six Corinthian columns under its
  // pediment, the sculpted tympanum in ochre (the model has it, low, on the portico's front).
  'oud-justitiepaleis': {
    drawings: {
      bay: { width: 6.2, height: 27, px: 14, fit: 'bays', draw: justitieBay },
      // the portico's front is two walls, either side of the pediment's peak: each its half
      porticoLeft: { width: 6.5, height: 29.8, px: 16, fit: 'fit', draw: (g, w, h) => { g.translate(w / 2, 0); justitiePortico(g, 2 * w, h); } },
      porticoRight: { width: 6.5, height: 29.8, px: 16, fit: 'fit', draw: (g, w, h) => { g.translate(-w / 2, 0); justitiePortico(g, 2 * w, h); } },
      plain: { width: 4, height: 27, px: 10, fit: 'run', draw: (g, w, h) => ashlar(g, -w / 2, 0, w / 2, h, JUSTITIE_STONE, { seed: 121, course: 0.6, vary: 0.04 }) },
    },
    wall: w => {
      if (facing(w, EAST) && w.c.x > -235.5 && w.c.z > 500 && w.c.z < 516) return w.c.z > PORTICO_PEAK ? 'porticoLeft' : 'porticoRight';
      return w.span >= 3 ? 'bay' : 'plain';
    },
  },

  // The Boekentoren (Henry van de Velde, 1933-1942), the university library's tower: a shaft of pale
  // concrete, cross-shaped with its corners stepped in, three long strips of windows up the middle
  // of each face; on top an overhanging slab and the glass belvedere with its copper rim.
  boekentoren: {
    drawings: {
      face: { width: 11, height: 70, px: 8, fit: 'fit', draw: boekentorenFace },
      side: { width: 7, height: 70, px: 8, fit: 'fit', draw: (g, w, h) => concrete(g, w, h, 0) },
    },
    wall: w => (w.span >= 9 ? 'face' : w.span >= 1.5 ? 'side' : undefined),
    props: lm => boekentorenTop(hallFrame(lm)),
  },

  // The Gravensteen (1180): pale grey ashlar with arrow slits, round-headed twin windows in the
  // keep, and battlements all round; its curtain wall and flanking towers, the keep turrets' roofs
  // and its flags are modelled in ghent/gravensteen.js.
  gravensteen: {
    drawings: {
      castle: { width: 9, height: 30, px: 14, fit: 'bays', draw: castle },
    },
    wall: w => (w.span >= 2 ? 'castle' : undefined),
    props: (lm, top) => gravensteen(lm, top),
    solid: [CASTLE_WALL],
  },
};

const POST_STONE = '#b8a888';

// one bay of the Postgebouw's long walls: a pointed arch on the ground floor, then two tall windows
// above each other, a parapet on top
function postBay(g, w, h) {
  const S = POST_STONE, L = -w / 2, R = w / 2, dark = '#2a2f38';
  ashlar(g, L, 0, R, h, S, { seed: 71, course: 0.5, vary: 0.05 });
  g.fillStyle = shade(S, -0.2);
  g.fillRect(L, 0, w, 0.9); // the plinth
  // the ground floor: two arched windows of dark glass with a mullion
  for (const x of [-1.5, 1.5]) lancet(g, x, 1.6, 2.1, 4.6, { stone: S, dark, mullion: false });
  stringCourse(g, L, R, 7.2, S, 0.5);
  // first and second floor: a tall window of four lights, a transom, a hood above
  for (const y of [8.4, 14.6]) {
    g.fillStyle = shade(S, -0.3);
    g.fillRect(-1.95, y - 0.3, 3.9, 5.2);
    g.fillStyle = dark;
    g.fillRect(-1.6, y, 3.2, 4.5);
    g.fillStyle = S;
    g.fillRect(-0.09, y, 0.18, 4.5);
    g.fillRect(-1.6, y + 3.1, 3.2, 0.16);
    g.fillStyle = shade(S, 0.15);
    g.fillRect(-2.1, y + 4.9, 4.2, 0.35);
  }
  stringCourse(g, L, R, 14.0, S, 0.4);
  // the dormer storey: a smaller window, and the pierced parapet above
  g.fillStyle = shade(S, -0.3);
  g.fillRect(-0.95, 20.7, 1.9, 3.1);
  g.fillStyle = dark;
  g.fillRect(-0.7, 20.9, 1.4, 2.7);
  stringCourse(g, L, R, h - 2.3, S, 0.4);
  balustrade(g, L, R, h - 1.9, 1.9, S, 1.0);
  for (const x of [L, R]) pilaster(g, x, 0, h - 2.3, 0.8, S);
}

// the Postgebouw's turret and clock tower: plain stone, narrow lancets stacked up it, a gallery
// near the top
function postTower(g, w, h) {
  const S = shade(POST_STONE, -0.04), L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 72, course: 0.55 });
  lancet(g, 0, 0, w * 0.34, 8, { stone: S, mullion: false, dark: '#3a3026' });
  for (const [y, hh] of [[11, 7], [22, 7], [33, 8]]) {
    for (const x of [-w * 0.2, w * 0.2]) lancet(g, x, y, w * 0.2, hh, { stone: S, mullion: false, dark: '#262b33' });
    stringCourse(g, L, R, y - 1, S, 0.5);
  }
  for (const x of [L + 0.7, R - 0.7]) { g.fillStyle = shade(S, 0.12); g.fillRect(x - 0.5, 0, 1, h); }
  balustrade(g, L, R, h * 0.82, 2, S, 1.2);
  stringCourse(g, L, R, h * 0.82, S, 0.5);
}

// a church whose spires (the walls that start high up, above its towers' square part) are slate
function jacobs(design) {
  const wall = design.wall;
  return { ...design, wall: (w, t) => (w.bottom > 30 ? 'slate' : wall(w, t)) };
}

// A church: its tower walls (above towerFrom), its tall end walls (the great window of a gable),
// and every other wall as bays of a tall window between two buttresses. With `spires` (see
// spired()) its round turrets end in sharp needles instead of the model's domed caps.
function church({ stone, towerFrom, tower, gable, spires }) {
  return {
    ...(spires && { part: spired(spires) }),
    drawings: {
      tower: { width: 19, height: 72, px: 10, fit: 'fit', draw: tower },
      gable: { width: 20, height: 40, px: 10, fit: 'fit', draw: (g, w, h) => {
        ashlar(g, -w / 2, 0, w / 2, h, stone, { seed: 51 });
        gable(g, w, h, stone);
      } },
      bay: { width: 7, height: 30, px: 12, fit: 'bays', draw: (g, w, h) => {
        ashlar(g, -w / 2, 0, w / 2, h, stone, { seed: 52 });
        lancet(g, 0, h * 0.2, w * 0.46, h * 0.66, { stone });
        stringCourse(g, -w / 2, w / 2, h * 0.17, stone);
        for (const x of [-w / 2, w / 2]) pilaster(g, x, 0, h * 0.94, 0.9, stone); // the buttresses, half on each side
        g.fillStyle = shade(stone, -0.2);
        g.fillRect(-w / 2, h * 0.95, w, h * 0.05);
      } },
    },
    wall: w => {
      const tall = w.top - w.bottom;
      if (w.top > towerFrom && w.span < 24) return 'tower';
      if (w.span >= 10 && w.span < 26 && tall > 28) return 'gable';
      return w.span >= 3 ? 'bay' : undefined;
    },
  };
}

// Gent in 3D caps a church's round corner turrets with domes, which read as rounded tops from the
// street. spired({ id, tall, crown }) gives a design a part() that reshapes them, corner by corner,
// before the model is built: each dome becomes an octagonal needle `tall` times as high as its
// turret is wide, standing on the same base ring (and slate), and the model's highest point (the
// crossing tower's roof) goes up `crown` metres so that roof is steeper. A turret is one of the
// model's loose pieces, narrow (under 6 m across) and tall (over 30 m); its dome starts at the
// lowest ring of it with many corners (the shaft below it has only a few).
function spired({ id, tall = 4, crown = 0 }) {
  let found;
  const turrets = () => (found ??= domes(LANDMARKS.find(lm => lm.id === id)));
  const SIDE = Math.PI / 4;
  const move = q => {
    const { list, top } = turrets();
    if (crown && q.y > top[1] - 3 && Math.hypot(q.x - top[0], q.z - top[2]) < 1.5) { q.y += crown; return true; }
    for (const d of list) {
      const dx = q.x - d.x, dz = q.z - d.z;
      if (q.y < d.from - 0.01 || q.y > d.top + 0.01 || Math.hypot(dx, dz) > d.r + 0.6) continue;
      const s = (q.y - d.from) / (d.top - d.from), a = Math.atan2(dz, dx);
      // on the octagon whose sides just touch the base ring, shrinking to nothing at the tip
      const r = (d.r * (1 - s)) / Math.cos((((a % SIDE) + SIDE) % SIDE) - SIDE / 2);
      q.set(d.x + r * Math.cos(a), d.from + s * d.r * 2 * tall, d.z + r * Math.sin(a));
      return 'needle';
    }
    return false;
  };
  return t => {
    const moved = t.q.map(move);
    if (!moved.some(Boolean)) return undefined;
    // its normal again, outwards, for how the slate is laid on it
    const n = new THREE.Vector3().subVectors(t.q[2], t.q[1]).cross(new THREE.Vector3().subVectors(t.q[0], t.q[1]));
    if (n.lengthSq() > 1e-12) t.n.copy(n.normalize().multiplyScalar(n.y < 0 ? -1 : 1));
    return moved.every(m => m === 'needle') ? 'slate' : undefined;
  };
}

// the turrets of a model (see spired()): { x, z: its axis, r: its dome's base radius, from, top:
// where the dome starts and ends }, and the model's highest point
function domes(lm) {
  const V = lm.v, I = lm.i, at = k => [V[k * 3], V[k * 3 + 1], V[k * 3 + 2]];
  const ids = new Map(), up = [], vid = [];
  for (let k = 0; k < V.length / 3; k++) {
    const key = at(k).map(c => c.toFixed(2)).join();
    if (!ids.has(key)) { ids.set(key, ids.size); up.push(ids.size - 1); }
    vid.push(ids.get(key));
  }
  const find = a => (up[a] === a ? a : (up[a] = find(up[a])));
  for (let t = 0; t < I.length; t += 3) for (const j of [1, 2]) up[find(vid[I[t + j]])] = find(vid[I[t]]);
  const parts = new Map();
  let top = [0, -Infinity, 0];
  for (let k = 0; k < V.length / 3; k++) {
    const p = at(k), list = parts.get(find(vid[k])) ?? [];
    list.push(p);
    parts.set(find(vid[k]), list);
    if (p[1] > top[1]) top = p;
  }
  const list = [];
  for (const ps of parts.values()) {
    const xs = ps.map(p => p[0]), zs = ps.map(p => p[2]), ys = ps.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs), hi = Math.max(...ys);
    if (x1 - x0 > 6 || z1 - z0 > 6 || hi < 30) continue;
    const rings = new Map();
    for (const p of ps) if (p[1] > 1) {
      const y = Math.round(p[1] * 20) / 20;
      rings.set(y, (rings.get(y) ?? new Set()).add(`${p[0].toFixed(2)},${p[2].toFixed(2)}`));
    }
    const ring = Math.min(...[...rings].filter(([, s]) => s.size >= 16).map(([y]) => y));
    if (!(ring < hi - 1)) continue;
    const base = ps.filter(p => Math.abs(p[1] - ring) < 0.03), from = Math.min(...base.map(p => p[1]));
    const x = (x0 + x1) / 2, z = (z0 + z1) / 2, r = Math.max(...base.map(p => Math.hypot(p[0] - x, p[2] - z)));
    list.push({ x, z, r, from, top: hi });
  }
  return { list, top };
}

// thin buttress strips up a tower's corners
function buttresses(g, w, h, S) {
  for (const x of [-w / 2 + 0.6, w / 2 - 0.6]) {
    g.fillStyle = shade(S, 0.12); g.fillRect(x - 0.6, 0, 1.2, h);
    g.fillStyle = shade(S, -0.3); g.fillRect(x + 0.6, 0, 0.2, h);
  }
}

function stadhuisGothic(g, w, h) {
  const S = '#c9c0ab', L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 61, course: 0.5 });
  // two storeys of tall windows, each under a pointed arch of blind tracery
  for (const [y, hh] of [[2.5, 8.5], [12.5, 8]]) {
    g.fillStyle = shade(S, -0.12);
    archPath(g, 0, y - 0.5, 4.2, hh + 2.6);
    g.fill();
    crossWindow(g, 0, y, 2.6, hh - 1.4, { stone: S, lintel: false });
    g.strokeStyle = shade(S, 0.25);
    g.lineWidth = 0.14;
    archPath(g, 0, y + hh - 1.2, 2.6, 2.6);
    g.stroke();
  }
  // the buttresses between the bays, statues in niches up them
  for (const x of [L, R]) {
    pilaster(g, x, 0, h - 2.5, 1.2, S);
    for (const y of [6, 16]) niche(g, x, y, 1, 2.6, S);
  }
  stringCourse(g, L, R, 11.7, S, 0.4);
  stringCourse(g, L, R, h - 2.6, S, 0.5);
  balustrade(g, L, R, h - 2.4, 2.4, S, 1.2);
}

function stadhuisRenaissance(g, w, h) {
  const S = '#d3cab6', L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 62, course: 0.55 });
  // three storeys, each an entablature on two columns, a cross window between them
  for (const [y, hh] of [[0.8, 7], [8.6, 7], [16.4, 6.8]]) {
    crossWindow(g, 0, y + 1.2, 2.4, hh - 2.6, { stone: S });
    for (const x of [L + 0.5, R - 0.5]) pilaster(g, x, y, y + hh - 0.6, 0.65, S);
    g.fillStyle = shade(S, 0.14);
    g.fillRect(L, y + hh - 0.6, w, 0.6);
    g.fillStyle = shade(S, -0.32);
    g.fillRect(L, y + hh - 0.75, w, 0.15);
  }
  balustrade(g, L, R, h - 2.2, 2.2, S, 0.9);
}

function castle(g, w, h) {
  const S = shade(CASTLE_STONE, -0.06), L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 71, course: 0.7, vary: 0.1 });
  g.fillStyle = '#1e1f22';
  for (const [x, y] of [[-2.4, 6], [2.1, 11], [-1, 17]]) g.fillRect(x - 0.17, y, 0.34, 2.2); // arrow slits
  roundArch(g, -0.75, 20.5, 1.1, 2.8, '#1e1f22'); // a round-headed twin window
  roundArch(g, 0.75, 20.5, 1.1, 2.8, '#1e1f22');
  g.fillStyle = shade(S, 0.12);
  g.fillRect(-0.12, 20.5, 0.24, 2.3);
  // the battlements: a corbel line, then merlons against the sky-dark crenels
  g.fillStyle = shade(S, -0.35);
  g.fillRect(L, h - 3.6, w, 0.35);
  g.fillStyle = shade(S, -0.55);
  for (let x = L + 0.9; x < R; x += 2.25) g.fillRect(x, h - 1.4, 1, 1.4);
}

const LAKENHAL_STONE = '#cbc3b0';

// one bay of the Lakenhalle: a buttress either side, two cross windows on the ground floor, a tall
// window under a pointed arch of blind tracery above, the pierced parapet on top
function lakenhalBay(g, w, h) {
  const S = LAKENHAL_STONE, L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 81, course: 0.5 });
  g.fillStyle = shade(S, -0.18);
  g.fillRect(L, 0, w, 1.1); // the plinth
  for (const x of [-1.15, 1.15]) crossWindow(g, x, 1.8, 1.3, 4.4, { stone: S });
  stringCourse(g, L, R, 7.6, S, 0.45);
  g.fillStyle = shade(S, -0.14);
  archPath(g, 0, 8.6, 3.3, 8.4);
  g.fill();
  crossWindow(g, 0, 9, 2.3, 5.6, { stone: S, lintel: false });
  g.strokeStyle = shade(S, 0.25);
  g.lineWidth = 0.13;
  for (const x of [-0.6, 0.6]) { archPath(g, x, 14.7, 1.1, 1.6); g.stroke(); }
  archPath(g, 0, 14.7, 2.3, 2.2);
  g.stroke();
  for (const x of [L, R]) pilaster(g, x, 0, h - 1.6, 0.9, S);
  stringCourse(g, L, R, h - 1.9, S, 0.4);
  balustrade(g, L, R, h - 1.6, 1.6, S, 1.3);
}

// A long hall's frame, from its model: the rectangle round its outline (lm.foot[0]), lined up with
// its longest wall, as { o: a corner, u: the way along it, n: across it, len, wide, eaves: the
// highest point of the model on its long walls, ridge: its highest point }
function hallFrame(lm) {
  const p = lm.foot[0], n = p.length / 2, pt = k => [p[2 * (k % n)], p[2 * (k % n) + 1]];
  let u = [1, 0], best = 0;
  for (let k = 0; k < n; k++) {
    const [a, b] = [pt(k), pt(k + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L > best) { best = L; u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; }
  }
  const nv = [-u[1], u[0]], along = q => q[0] * u[0] + q[1] * u[1], across = q => q[0] * nv[0] + q[1] * nv[1];
  const pts = Array.from({ length: n }, (_, k) => pt(k)), us = pts.map(along), vs = pts.map(across);
  const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)];
  let eaves = 0, ridge = 0;
  for (let k = 0; k < lm.v.length; k += 3) {
    ridge = Math.max(ridge, lm.v[k + 1]);
    const c = across([lm.v[k], lm.v[k + 2]]);
    if (Math.min(Math.abs(c - v0), Math.abs(c - v1)) < 0.6) eaves = Math.max(eaves, lm.v[k + 1]);
  }
  return { o: [u[0] * u0 + nv[0] * v0, u[1] * u0 + nv[1] * v0], u, n: nv, len: u1 - u0, wide: v1 - v0, eaves, ridge };
}

// the Lakenhalle's dormers and turrets, on its frame (see hallFrame)
function lakenhalRoof(hall) {
  const S = LAKENHAL_STONE, roof = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: shade(S, -0.04), roughness: 0.9, flatShading: true });
  const slate = new THREE.MeshStandardMaterial({ color: 0x3d4248, roughness: 0.8, flatShading: true });
  const [ux, uz] = hall.u, [nx, nz] = hall.n, e = hall.eaves;
  const place = (obj, a, c, y, turn) => {
    obj.position.set(hall.o[0] + ux * a + nx * c, y, hall.o[1] + uz * a + nz * c);
    obj.rotation.y = turn;
    obj.castShadow = true;
    roof.add(obj);
    return obj;
  };
  // a dormer: its front a pointed gable 2.6 wide and 5.8 high, standing on the parapet and running
  // 4 m back into the roof, a window drawn on it
  const dw = 2.6, dh = 5.8, shoulder = 3.4;
  const shape = new THREE.Shape([[-dw / 2, 0], [dw / 2, 0], [dw / 2, shoulder], [0, dh], [-dw / 2, shoulder]].map(([x, y]) => new THREE.Vector2(x, y)));
  const dormer = new THREE.ExtrudeGeometry(shape, { depth: 4, bevelEnabled: false });
  const uv = dormer.attributes.uv, pos = dormer.attributes.position;
  for (let k = 0; k < pos.count; k++) uv.setXY(k, pos.getX(k) / dw + 0.5, pos.getY(k) / dh);
  const front = new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true, map: elevation(dw, dh, 24, (g, w, h) => {
    ashlar(g, -w / 2, 0, w / 2, h, S, { seed: 82, course: 0.45 });
    crossWindow(g, 0, 0.7, 1.2, 2.4, { stone: S, lintel: false });
    g.fillStyle = shade(S, -0.25);
    archPath(g, 0, 3.6, 0.7, 1.4);
    g.fill();
    g.fillStyle = shade(S, 0.18); // the copings up the gable
    g.beginPath(); g.moveTo(-w / 2, shoulder - 0.3); g.lineTo(0, h - 0.3); g.lineTo(w / 2, shoulder - 0.3); g.lineTo(w / 2, shoulder); g.lineTo(0, h); g.lineTo(-w / 2, shoulder); g.fill();
  }) });
  // a pinnacle: a slim square shaft and a pointed top
  const shaft = new THREE.BoxGeometry(0.45, 2.2, 0.45), spike = new THREE.ConeGeometry(0.34, 1.6, 4);
  const pinnacle = (a, c, y) => {
    place(new THREE.Mesh(shaft, stone), a, c, y + 1.1, 0);
    place(new THREE.Mesh(spike, stone), a, c, y + 3, Math.PI / 4);
  };
  const bays = Math.max(1, Math.round(hall.len / 5.3)), step = hall.len / bays;
  for (const [c, turn, inset] of [[0, Math.atan2(nx, nz) + Math.PI, 0.25], [hall.wide, Math.atan2(nx, nz), -0.25]]) {
    for (let k = 0; k < bays; k++) {
      const a = step * (k + 0.5);
      // the front at the wall, the extrusion running into the roof: the shape's +z points inwards
      const d = place(new THREE.Mesh(dormer, [front, stone]), a, c + inset, e - 0.4, turn + Math.PI);
      d.receiveShadow = true;
      // its little roof: two slate slopes from the gable's shoulders to its point, back into the roof
      const r = new THREE.Mesh(dormerRoof(dw, shoulder, dh, 4), slate);
      d.add(r);
    }
    for (let k = 1; k < bays; k++) pinnacle(step * k, c + inset, e);
  }
  // the turrets: an octagon on each corner, from below the eaves to a slate spire
  const body = new THREE.CylinderGeometry(1.1, 1.1, 7, 8), spire = new THREE.ConeGeometry(1.25, 5.5, 8);
  for (const a of [0, hall.len]) for (const c of [0, hall.wide]) {
    place(new THREE.Mesh(body, stone), a, c, e - 1, Math.PI / 8);
    place(new THREE.Mesh(spire, slate), a, c, e + 5.2, Math.PI / 8);
  }
  roof.name = 'lakenhalle-roof';
  return roof;
}

// a dormer's pitched roof: from the shoulders (y = s, x = ±w/2) up to the ridge (y = top) and back
// `depth` along +z, a little proud of the gable
function dormerRoof(w, s, top, depth) {
  const o = 0.12, P = [[-w / 2 - o, s - o, -o], [0, top, -o], [w / 2 + o, s - o, -o], [-w / 2 - o, s - o, depth], [0, top, depth], [w / 2 + o, s - o, depth]];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 1, 4, 0, 4, 3, 1, 2, 5, 1, 5, 4].flatMap(k => P[k]), 3));
  geo.computeVertexNormals();
  return geo;
}

// one bay of the Schouwburg: round arches in banded stone below, a tall arched window between two
// columns above, an entablature and a balustrade on top
function schouwburgBay(g, w, h) {
  const S = '#d7cfbd', L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 101, course: 0.55 });
  g.fillStyle = shade(S, -0.1); // the rusticated ground floor
  for (let y = 0.9; y < 7; y += 0.9) g.fillRect(L, y - 0.08, w, 0.08);
  roundArch(g, 0, 0, 3.4, 5.6, shade(S, -0.35));
  roundArch(g, 0, 0, 2.8, 5.2, '#2c3540');
  stringCourse(g, L, R, 7.2, S, 0.6);
  balustrade(g, L + 0.6, R - 0.6, 7.8, 1.3, S, 0.8);
  roundArch(g, 0, 9.2, 2.8, 8.6, shade(S, -0.3));
  crossWindow(g, 0, 9.5, 2.2, 6.5, { stone: S, lintel: false });
  for (const x of [L + 0.7, R - 0.7]) pilaster(g, x, 7.8, 19, 0.7, S);
  stringCourse(g, L, R, 19, S, 0.8);
  crossWindow(g, 0, 20.4, 1.8, 2.8, { stone: S });
  stringCourse(g, L, R, h - 2.2, S, 0.5);
  balustrade(g, L, R, h - 1.8, 1.8, S, 0.9);
}

// The gilded dragon (1380, a weathervane) on top of the Belfort's spire, after the original: a
// stout barrel of riveted copper plates, a short neck in a studded collar, a blocky dog's head with
// its jaws wide open and its tongue sticking straight out as the vane's arrow, two stubby front
// legs, a pair of raised bat wings cut into hooked scallops and a tail curling up behind them. It
// turns on a rod out of its belly. About 4 m from the tail's curl to the tongue's tip; x runs
// forward, y up, z to its left. All of it one mesh.
export function dragon([x, y, z]) {
  const gold = new THREE.MeshStandardMaterial({ color: 0xe0ad3c, metalness: 0.55, roughness: 0.32, emissive: 0x3a2804 });
  const V = (a, b, c) => new THREE.Vector3(a, b, c);
  const parts = [];
  const put = (geo, m) => parts.push(m ? geo.applyMatrix4(m) : geo);
  const at = (px, py, pz, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(V(px, py, pz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(1, 1, 1));
  const stud = () => new THREE.SphereGeometry(0.03, 6, 4);
  const AXIS = 2.2; // the body's axis, this high over the rod's foot

  // the body, a barrel turned round the x axis, plumpest at the shoulders
  const BODY = [[-1.0, 0], [-0.98, 0.13], [-0.8, 0.2], [-0.55, 0.28], [-0.3, 0.35], [0, 0.4], [0.3, 0.42], [0.55, 0.4], [0.75, 0.34], [0.9, 0.24], [0.93, 0]];
  const girth = u => { // its radius at x = u
    for (let i = 1; i < BODY.length; i++) if (u <= BODY[i][0]) {
      const [u0, r0] = BODY[i - 1], [u1, r1] = BODY[i];
      return r0 + ((r1 - r0) * (u - u0)) / (u1 - u0);
    }
    return 0;
  };
  put(new THREE.LatheGeometry(BODY.map(([u, r]) => new THREE.Vector2(r, u)), 18).rotateZ(-Math.PI / 2), at(0, AXIS, 0));
  for (const u of [-0.6, -0.15, 0.35]) { // the riveted seams between its plates
    const r = girth(u);
    put(new THREE.TorusGeometry(r, 0.022, 4, 28), at(u, AXIS, 0, 0, Math.PI / 2));
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      put(stud(), at(u + 0.06, AXIS + Math.cos(a) * girth(u + 0.06), Math.sin(a) * girth(u + 0.06)));
    }
  }
  for (let u = -0.8; u < 0.7; u += 0.2) put(stud(), at(u, AXIS + girth(u) + 0.01, 0)); // a row along the spine

  // the neck, short and thick, and its collar of rivets
  put(taper([[0.7, 2.28, 0], [0.98, 2.44, 0], [1.22, 2.56, 0]], t => 0.29 - 0.05 * t, 8, 14));
  const collar = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), V(1, 0.55, 0).normalize());
  put(new THREE.TorusGeometry(0.29, 0.035, 5, 24), new THREE.Matrix4().compose(V(0.95, 2.42, 0), collar, V(1, 1, 1)));
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    put(stud(), new THREE.Matrix4().compose(V(Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0).applyQuaternion(collar).add(V(0.95, 2.42, 0)), collar, V(1, 1, 1)));
  }

  // the head: a block of a skull, the upper jaw thrown up and the lower one down, a pig's snout
  put(new THREE.BoxGeometry(0.5, 0.42, 0.44), at(1.36, 2.64, 0));
  const upper = (px, py, pz) => at(1.5, 2.66, 0, 0, 0, 0.18).multiply(at(px, py, pz)); // in the upper jaw's frame
  const lower = (px, py, pz) => at(1.5, 2.5, 0, 0, 0, -0.3).multiply(at(px, py, pz));
  put(new THREE.BoxGeometry(0.5, 0.17, 0.32), upper(0.25, 0, 0));
  put(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 12).rotateZ(-Math.PI / 2), upper(0.5, 0.01, 0)); // the snout
  put(new THREE.BoxGeometry(0.44, 0.1, 0.28), lower(0.22, 0, 0));
  for (const u of [0.16, 0.3, 0.42]) for (const s of [-1, 1]) { // a few small teeth, top and bottom
    put(new THREE.ConeGeometry(0.025, 0.08, 4).rotateZ(Math.PI), upper(u, -0.12, s * 0.12));
    put(new THREE.ConeGeometry(0.022, 0.07, 4), lower(u - 0.04, 0.08, s * 0.1));
  }
  for (const s of [-1, 1]) {
    put(new THREE.SphereGeometry(0.085, 10, 8), at(1.44, 2.78, s * 0.2)); // the bulging eyes
    put(new THREE.BoxGeometry(0.24, 0.05, 0.12), at(1.42, 2.875, s * 0.17, 0, 0, -0.15)); // under a brow
    put(taper([[1.28, 2.8, s * 0.15], [1.18, 3.0, s * 0.22], [1.0, 3.1, s * 0.26], [0.9, 3.02, s * 0.27]], t => 0.075 - 0.06 * t, 10, 7)); // an ear swept back
  }

  // the tongue, straight out of the mouth as a flat blade, ending in the vane's barbed arrow
  put(new THREE.BoxGeometry(0.6, 0.07, 0.025), at(1.88, 2.6, 0));
  const arrow = new THREE.Shape();
  arrow.moveTo(0, 0); arrow.lineTo(-0.08, 0.16); arrow.lineTo(0.3, 0); arrow.lineTo(-0.08, -0.16); arrow.lineTo(0, 0);
  put(new THREE.ExtrudeGeometry(arrow, { depth: 0.03, bevelEnabled: false }).translate(0, 0, -0.015), at(2.18, 2.6, 0));

  // two stubby front legs hanging down, blunt hooves
  for (const s of [-1, 1]) {
    put(taper([[0.42, 2.1, s * 0.24], [0.55, 1.82, s * 0.27], [0.62, 1.58, s * 0.28]], t => 0.15 - 0.04 * t, 8, 10));
    put(new THREE.CylinderGeometry(0.12, 0.15, 0.12, 12), at(0.63, 1.52, s * 0.28));
    put(new THREE.TorusGeometry(0.13, 0.02, 4, 16), at(0.6, 1.66, s * 0.28, Math.PI / 2)); // a band of copper
  }

  // the tail, out of the back and curling up behind the wings, a little arrow at its tip
  const tail = taperCurve([[-0.9, 2.2, 0], [-1.22, 2.26, 0], [-1.46, 2.52, 0], [-1.42, 2.86, 0], [-1.2, 2.97, 0], [-1.08, 2.8, 0]]);
  put(taper(tail, t => 0.17 - 0.14 * t, 40, 10));
  const tip = tail.getPointAt(1), out = tail.getTangentAt(1);
  put(new THREE.ConeGeometry(0.07, 0.16, 4).scale(1, 1, 0.4).translate(0, 0.08, 0), new THREE.Matrix4().compose(tip, new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), out), V(1, 1, 1)));

  // the wings, raised at the shoulders: a flat plate with ribs fanning out from its root, the
  // trailing edge cut into big scallops ending in hooks, and round holes between the ribs
  const ROOT = new THREE.Vector2(0.1, 0.05), TOP = new THREE.Vector2(0.6, 1.55);
  const HOOKS = [[0.05, 1.45], [-0.4, 1.15], [-0.72, 0.65], [-0.78, 0.18]].map(([u, v]) => new THREE.Vector2(u, v));
  const inward = (a, b, k) => a.clone().add(b).multiplyScalar(0.5).lerp(new THREE.Vector2(0.25, 0.85), k); // a scallop's deepest point
  const wing = new THREE.Shape();
  wing.moveTo(-0.5, 0); wing.lineTo(0.45, 0); wing.quadraticCurveTo(0.78, 0.8, TOP.x, TOP.y);
  wing.lineTo(TOP.x + 0.1, TOP.y + 0.1); wing.lineTo(TOP.x - 0.06, TOP.y + 0.02); // the hooked tip
  let from = TOP;
  for (const h of HOOKS) {
    const c = inward(from, h, 0.45);
    wing.quadraticCurveTo(c.x, c.y, h.x, h.y);
    wing.lineTo(h.x - 0.05, h.y - 0.13); wing.lineTo(h.x - 0.11, h.y - 0.04); // a hook curling down
    from = new THREE.Vector2(h.x - 0.11, h.y - 0.04);
  }
  wing.quadraticCurveTo(-0.6, 0.05, -0.5, 0);
  const ribs = [TOP, ...HOOKS];
  for (let i = 0; i < 3; i++) { // the holes, between the ribs
    const c = ribs[i].clone().add(ribs[i + 1]).multiplyScalar(0.5).sub(ROOT).multiplyScalar(0.5).add(ROOT);
    const hole = new THREE.Path();
    hole.absarc(c.x, c.y, 0.07, 0, Math.PI * 2, true);
    wing.holes.push(hole);
  }
  // each its own mesh on a hinge at its root, so the one flying along on the tour can beat them
  const plate = new THREE.ExtrudeGeometry(wing, { depth: 0.04, bevelEnabled: false, curveSegments: 5 }).translate(0, 0, -0.02);
  const wingParts = [plate];
  for (const r of ribs) {
    const end = r.clone().lerp(ROOT, 0.06);
    wingParts.push(taper([[ROOT.x, ROOT.y, 0], [(ROOT.x + end.x) / 2, (ROOT.y + end.y) / 2, 0.015], [end.x, end.y, 0]], t => 0.045 - 0.025 * t, 8, 6));
  }
  const wingGeo = merged(wingParts);
  const wings = [-1, 1].map(s => {
    const hinge = new THREE.Group();
    hinge.position.set(0.15, 2.5, s * 0.2);
    hinge.rotation.x = s * 0.38;
    hinge.userData.side = s;
    const m = new THREE.Mesh(wingGeo, gold);
    m.castShadow = true;
    hinge.add(m);
    return hinge;
  });


  const mesh = new THREE.Mesh(merged(parts), gold);
  mesh.castShadow = true;
  // the rod it turns on, out of its belly (its own mesh: the one flying along on the tour has none)
  const rod = new THREE.Mesh(merged([new THREE.CylinderGeometry(0.05, 0.06, 2.0, 8).translate(0, 1.0, 0), new THREE.SphereGeometry(0.1, 10, 6).translate(0, 0.35, 0)]), gold);
  const body = new THREE.Group(); // all of it but the rod
  body.add(mesh, ...wings);
  const d = new THREE.Group();
  d.add(body, rod);
  Object.assign(d.userData, { wings, rod, body });
  d.position.set(x, y - 0.3, z);
  d.rotation.y = 0.7;
  d.name = 'dragon';
  return d;
}

// a smooth curve through points [x, y, z]
function taperCurve(points) {
  return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
}

// a tube along a curve (or points [x, y, z]) whose radius changes along it, radius(t) for t 0..1
function taper(path, radius, segments, sides) {
  const curve = Array.isArray(path) ? taperCurve(path) : path;
  const { normals, binormals } = curve.computeFrenetFrames(segments, false);
  const pos = [], nor = [], index = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments, p = curve.getPointAt(t), r = radius(t);
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      const n = normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(binormals[i], Math.sin(a));
      pos.push(p.x + n.x * r, p.y + n.y * r, p.z + n.z * r);
      nor.push(n.x, n.y, n.z);
    }
  }
  for (let i = 0; i < segments; i++) for (let j = 0; j < sides; j++) {
    const a = i * (sides + 1) + j, b = a + sides + 1;
    index.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setIndex(index);
  return geo;
}

// geometries into one, keeping only positions and normals
function merged(geos) {
  const flat = geos.map(g => (g.index ? g.toNonIndexed() : g));
  const n = flat.reduce((s, g) => s + g.attributes.position.array.length, 0);
  const pos = new Float32Array(n), nor = new Float32Array(n);
  let o = 0;
  for (const g of flat) {
    pos.set(g.attributes.position.array, o);
    nor.set(g.attributes.normal.array, o);
    o += g.attributes.position.array.length;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return geo;
}

const VLEESHUIS_STONE = '#a9a79c';

// one bay of the Groot Vleeshuis's long walls, under one dormer: grey ashlar on a darker plinth, a
// small window with dark-green shutters, a little slit lower down
function vleeshuisBay(g, w, h) {
  const S = VLEESHUIS_STONE, L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 91, course: 0.42, vary: 0.12 });
  g.fillStyle = shade(S, -0.25);
  g.fillRect(L, 0, w, 0.7); // the plinth
  shuttered(g, 0, h - 2.7, 1.3, 1.9, S);
  g.fillStyle = '#25282b';
  g.fillRect(-0.2, 1.4, 0.4, 1.1); // a light slit into the cellar
  stringCourse(g, L, R, h - 0.35, S, 0.35);
}

// a small stone-framed window, its dark-green shutters open beside it
function shuttered(g, cx, y0, w, h, S) {
  g.fillStyle = shade(S, 0.15);
  g.fillRect(cx - w / 2 - 0.15, y0 - 0.15, w + 0.3, h + 0.3);
  g.fillStyle = '#23272b';
  g.fillRect(cx - w / 2, y0, w, h);
  g.fillStyle = shade(S, 0.15);
  g.fillRect(cx - 0.05, y0, 0.1, h);
  g.fillStyle = '#2f3d33';
  for (const s of [-1, 1]) g.fillRect(cx + s * (w / 2 + 0.2) - (s < 0 ? w / 2 : 0), y0, w / 2, h);
}

// an end gable of the Groot Vleeshuis: the red doors below, two tall pointed windows, a small one
// near the top (the stepped edge itself is modelled in vleeshuisRoof)
function vleeshuisGable(g, w, h) {
  const S = VLEESHUIS_STONE, L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 92, course: 0.45, vary: 0.12 });
  g.fillStyle = shade(S, -0.25);
  g.fillRect(L, 0, w, 0.7);
  for (const x of [-w * 0.24, w * 0.24]) {
    g.fillStyle = shade(S, -0.35);
    archPath(g, x, 0, 2.6, 4.6);
    g.fill();
    g.fillStyle = '#8c2a22'; // the red doors
    archPath(g, x, 0, 2.2, 4.2);
    g.fill();
    lancet(g, x, 6.2, 2.6, 6, { stone: S, dark: '#262a2e' });
  }
  stringCourse(g, L, R, 5.6, S, 0.35);
  lancet(g, 0, 13.6, 1.6, 3.4, { stone: S, dark: '#262a2e', mullion: false });
}

// the Groot Vleeshuis's roof: a stepped dormer gable over every bay of both long walls, and the
// stepped edges of its two end gables
function vleeshuisRoof(hall) {
  const S = VLEESHUIS_STONE, roof = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: shade(S, -0.06), roughness: 0.95, flatShading: true });
  const slate = new THREE.MeshStandardMaterial({ color: 0x484c50, roughness: 0.8, flatShading: true });
  const [ux, uz] = hall.u, [nx, nz] = hall.n, e = hall.eaves;
  const place = (obj, a, c, y, turn) => {
    obj.position.set(hall.o[0] + ux * a + nx * c, y, hall.o[1] + uz * a + nz * c);
    obj.rotation.y = turn;
    obj.castShadow = true;
    roof.add(obj);
    return obj;
  };
  // a dormer: a stepped gable front 3.6 wide and 5.4 high, running 4 m back into the roof
  const dw = 3.6, shoulder = 2.2, dh = 5.4, steps = 3, sw = dw / 2 / (steps + 0.5), sh = (dh - shoulder) / steps;
  const outline = [[-dw / 2, 0], [dw / 2, 0]];
  for (let k = 0; k < steps; k++) outline.push([dw / 2 - k * sw, shoulder + k * sh], [dw / 2 - (k + 1) * sw, shoulder + k * sh]);
  outline.push([sw / 2, dh], [-sw / 2, dh]);
  for (let k = steps - 1; k >= 0; k--) outline.push([-dw / 2 + (k + 1) * sw, shoulder + k * sh], [-dw / 2 + k * sw, shoulder + k * sh]);
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y))), { depth: 4, bevelEnabled: false });
  const uv = geo.attributes.uv, pos = geo.attributes.position;
  for (let k = 0; k < pos.count; k++) uv.setXY(k, pos.getX(k) / dw + 0.5, pos.getY(k) / dh);
  const front = new THREE.MeshStandardMaterial({ roughness: 0.95, flatShading: true, map: elevation(dw, dh, 24, (g, w, h) => {
    ashlar(g, -w / 2, 0, w / 2, h, S, { seed: 93, course: 0.42, vary: 0.12 });
    shuttered(g, 0, 0.6, 1.1, 1.5, S);
    g.fillStyle = '#25282b';
    g.fillRect(-0.12, 3.3, 0.24, 0.8); // a hoist hatch high up
  }) });
  const bays = Math.max(1, Math.round(hall.len / 5.4)), step = hall.len / bays;
  for (const [c, turn, inset] of [[0, Math.atan2(nx, nz) + Math.PI, 0.2], [hall.wide, Math.atan2(nx, nz), -0.2]]) {
    for (let k = 0; k < bays; k++) {
      const d = place(new THREE.Mesh(geo, [front, stone]), step * (k + 0.5), c + inset, e - 0.3, turn + Math.PI);
      d.receiveShadow = true;
      d.add(new THREE.Mesh(dormerRoof(dw * 0.8, shoulder, dh - 0.9, 4), slate));
    }
  }
  // the end gables' stepped edges: blocks up both rakes from the eaves to the ridge, a chimney-like
  // block on top
  const ridge = hall.ridge, n = 6, half = hall.wide / 2, bw = half / n;
  const rake = c => e + (ridge - e) * (1 - Math.abs(c - half) / half);
  for (const a of [0.35, hall.len - 0.35]) {
    for (let k = 0; k < n; k++) for (const s of [-1, 1]) {
      const c0 = half + s * (half - k * bw), c1 = half + s * (half - (k + 1) * bw), top = rake(c1) + 0.4, bottom = rake(c0) - 0.6;
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.7, top - bottom, bw), stone);
      place(b, a, (c0 + c1) / 2, (top + bottom) / 2, Math.atan2(nx, nz));
    }
    place(new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, bw), stone), a, half, ridge + 0.3, Math.atan2(nx, nz));
  }
  roof.name = 'groot-vleeshuis-roof';
  return roof;
}

const VOORUIT_STONE = '#dedad0';

// one bay of Vooruit's fronts: a great round arch below (the entrance, its glass in red-brown
// frames), a balcony, three storeys of big arched windows between pilasters, the cornice and a
// parapet with little urns
function vooruitFront(g, w, h) {
  const S = VOORUIT_STONE, L = -w / 2, R = w / 2, frame = '#7a3a28', glass = '#2b3440';
  ashlar(g, L, 0, R, h, S, { seed: 111, course: 0.6, vary: 0.04 });
  g.fillStyle = shade(S, -0.08);
  for (let y = 0.9; y < 10.5; y += 0.9) g.fillRect(L, y - 0.07, w, 0.07); // the banded ground floor
  roundArch(g, 0, 0, 5.2, 10, shade(S, -0.35));
  roundArch(g, 0, 0, 4.6, 9.6, glass);
  g.fillStyle = frame;
  for (const x of [-1.15, 0, 1.15]) g.fillRect(x - 0.08, 0, 0.16, 7.4);
  for (const y of [2.6, 5.2]) g.fillRect(-2.3, y, 4.6, 0.14);
  stringCourse(g, L, R, 10.6, S, 0.7);
  balustrade(g, L + 0.4, R - 0.4, 11.3, 1.3, S, 0.7);
  for (const [y, hh, ww] of [[13, 7.5, 3.6], [22, 7, 3.6], [31, 6.5, 3.2]]) {
    roundArch(g, 0, y - 0.3, ww + 0.6, hh + 0.6, shade(S, -0.25));
    roundArch(g, 0, y, ww, hh, glass);
    g.fillStyle = frame;
    g.fillRect(-0.07, y, 0.14, hh - ww / 2);
    g.fillRect(-ww / 2, y + (hh - ww / 2) * 0.6, ww, 0.13);
    stringCourse(g, L, R, y - 0.6, S, 0.4);
  }
  for (const x of [L + 0.55, R - 0.55]) pilaster(g, x, 11.3, h - 4.4, 0.9, S);
  stringCourse(g, L, R, h - 4.4, S, 1.0);
  balustrade(g, L, R, h - 3.2, 2.2, S, 0.8);
  g.fillStyle = shade(S, 0.12);
  for (const x of [L + 0.6, R - 0.6]) g.fillRect(x - 0.35, h - 1.1, 0.7, 1.1); // the urns on the posts
}

// one face of a Vooruit tower: narrow arched windows stacked up it, a gallery and a dark cornice
function vooruitTower(g, w, h) {
  const S = shade(VOORUIT_STONE, -0.03), L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 112, course: 0.6, vary: 0.04 });
  for (let y = 3; y < h - 10; y += 7) {
    roundArch(g, 0, y, 1.5, 4.6, shade(S, -0.3));
    roundArch(g, 0, y + 0.2, 1.1, 4.2, '#2b3440');
    stringCourse(g, L, R, y - 0.8, S, 0.35);
  }
  for (const x of [-0.8, 0.8]) roundArch(g, x, h - 9, 1.1, 4, '#2b3440');
  balustrade(g, L, R, h - 4.6, 1.3, S, 0.7);
  g.fillStyle = '#3a3a3c';
  g.fillRect(L, h - 1.4, w, 1.4); // the dark eaves under the dome
}

// one bay of Vooruit's long sides: yellow brick in red bands, a red lozenge, a row of white-framed
// windows near the top and a plain cornice
function vooruitSide(g, w, h) {
  const B = '#c69c55', red = '#9a3b29', L = -w / 2, R = w / 2;
  brick(g, L, 0, R, h, B, { course: 0.3, seed: 113 });
  g.fillStyle = red;
  for (let y = 6; y < h - 6; y += 6.5) g.fillRect(L, y, w, 0.45);
  g.beginPath(); // the lozenge
  g.moveTo(0, h - 12); g.lineTo(1.4, h - 10.6); g.lineTo(0, h - 9.2); g.lineTo(-1.4, h - 10.6); g.closePath();
  g.fill();
  for (const x of [-2.4, 2.4]) {
    g.fillStyle = '#ece8de';
    g.fillRect(x - 1.1, h - 7.4, 2.2, 4.2);
    g.fillStyle = '#2b3440';
    g.fillRect(x - 0.85, h - 7.15, 1.7, 3.7);
    g.fillStyle = '#ece8de';
    g.fillRect(x - 0.06, h - 7.15, 0.12, 3.7);
  }
  stringCourse(g, L, R, h - 2.2, '#d8d2c2', 0.8);
  g.fillStyle = '#d8d2c2';
  g.fillRect(L, h - 1.2, w, 1.2);
}

const BOEKENTOREN_CONCRETE = '#bab39f';

// a face of the Boekentoren's shaft: pale concrete in its formwork courses, weathered in patches;
// `seed` picks the patches
function concrete(g, w, h, seed) {
  const C = BOEKENTOREN_CONCRETE, L = -w / 2, R = w / 2, r = rng(131 + seed);
  g.fillStyle = C;
  g.fillRect(L, 0, w, h);
  for (let k = 0; k < 40; k++) {
    g.fillStyle = shade(C, (r() - 0.6) * 0.14);
    g.fillRect(L + r() * w, r() * h, 0.6 + r() * 2.4, 0.3 + r() * 1.4);
  }
  g.fillStyle = shade(C, -0.08);
  for (let y = 1.1; y < h; y += 1.1) g.fillRect(L, y, w, 0.05);
  g.fillStyle = shade(C, -0.2);
  g.fillRect(L, 0, w, 0.8); // the foot
}

// ------------------------------------------------------------------ the Oud Gerechtsgebouw

const JUSTITIE_STONE = '#d4c39c';
const PORTICO_PEAK = 508; // the model's portico front peaks here (game z), looking out east over the Koophandelsplein

// a window in a white frame with glazing bars, w by h from y0 (a round head when `arched`)
function sash(g, cx, y0, w, h, arched, S) {
  if (arched) roundArch(g, cx, y0 - 0.25, w + 0.5, h + 0.5, shade(S, -0.3));
  else { g.fillStyle = shade(S, -0.3); g.fillRect(cx - w / 2 - 0.25, y0 - 0.25, w + 0.5, h + 0.5); }
  if (arched) roundArch(g, cx, y0, w, h, '#eeebe2'); else { g.fillStyle = '#eeebe2'; g.fillRect(cx - w / 2, y0, w, h); }
  const t = 0.14, glass = '#2d353d';
  const lights = arched ? h - w / 2 : h;
  g.fillStyle = glass;
  for (const [x0, x1] of [[cx - w / 2 + t, cx - t / 2], [cx + t / 2, cx + w / 2 - t]]) {
    for (let y = y0 + t, k = 0; y < y0 + lights - t; y += (lights - t) / 3, k++) g.fillRect(x0, y, x1 - x0, (lights - t) / 3 - t);
  }
  if (arched) roundArch(g, cx, y0 + lights + t, w - 2 * t, (w - 2 * t) / 2, glass); // the fanlight
  if (arched) { g.fillStyle = '#eeebe2'; g.fillRect(cx - t / 2, y0 + lights, t, w / 2); }
}

// a bay of its walls: rusticated ground floor with an arched window, the tall pedimented window
// over its balustrade, a small window above, the cornice
function justitieBay(g, w, h) {
  const S = JUSTITIE_STONE, L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 122, course: 0.6, vary: 0.04 });
  ashlar(g, L, 0, R, 9.6, shade(S, -0.03), { seed: 123, course: 0.8, vary: 0.05 });
  g.fillStyle = shade(S, -0.4);
  for (let y = 0.8; y < 9.6; y += 0.8) g.fillRect(L, y - 0.1, w, 0.1); // its deep joints
  g.fillStyle = '#8d8a83';
  g.fillRect(L, 0, w, 1.2); // a plinth of bluestone
  sash(g, 0, 1.8, 2.6, 6.2, true, S);
  g.fillStyle = shade(S, 0.14);
  g.fillRect(-0.35, 7.6, 0.7, 1.4); // the keystone
  stringCourse(g, L, R, 9.9, S, 0.7);
  balustrade(g, -1.8, 1.8, 10.3, 1.3, S, 0.6);
  sash(g, 0, 11.7, 2.3, 5.8, false, S);
  g.fillStyle = shade(S, 0.12);
  g.fillRect(-1.75, 17.75, 3.5, 0.35);
  g.beginPath(); g.moveTo(-1.9, 18.1); g.lineTo(0, 19.3); g.lineTo(1.9, 18.1); g.closePath(); g.fill();
  g.fillStyle = shade(S, -0.22);
  g.beginPath(); g.moveTo(-1.35, 18.2); g.lineTo(0, 18.95); g.lineTo(1.35, 18.2); g.closePath(); g.fill();
  stringCourse(g, L, R, 20.4, S, 0.5);
  sash(g, 0, 21.2, 1.8, 2.4, false, S);
  g.fillStyle = shade(S, 0.05);
  g.fillRect(L, 24.1, w, 0.9);
  stringCourse(g, L, R, 25.4, S, 1.0);
  g.fillStyle = shade(S, -0.35);
  for (let x = L + 0.1; x < R; x += 0.45) g.fillRect(x, 24.6, 0.22, 0.32); // dentils under the cornice
}

// the portico on the Koophandelsplein: a rusticated base with three arched doorways, six
// Corinthian columns before the dark loggia and its windows, the entablature, and the low pediment
// with its sculpted tympanum
function justitiePortico(g, w, h) {
  const S = JUSTITIE_STONE, L = -w / 2, R = w / 2, base = 5.2, cap = 23.6, ent = 26.8;
  ashlar(g, L, 0, R, h, S, { seed: 124, course: 0.6, vary: 0.04 });
  // the loggia behind the columns, in shadow, a window between each pair
  ashlar(g, L + 0.4, base, R - 0.4, cap, shade(S, -0.42), { seed: 125, course: 0.6, vary: 0.04 });
  const step = (w - 1.6) / 5;
  for (let k = 0; k < 5; k++) {
    const x = L + 0.8 + step * (k + 0.5);
    roundArch(g, x, base + 2.2, 1.2, 6.6, '#23292e');
    g.fillStyle = '#23292e';
    g.fillRect(x - 0.55, base + 11.6, 1.1, 3.8);
  }
  // the base, a stair up the middle
  ashlar(g, L, 0, R, base, shade(S, -0.03), { seed: 126, course: 0.8, vary: 0.05 });
  g.fillStyle = shade(S, -0.4);
  for (let y = 0.8; y < base; y += 0.8) g.fillRect(L, y - 0.1, w, 0.1);
  for (const x of [-step, 0, step]) { roundArch(g, x, 0, 1.8, 4.2, shade(S, -0.35)); roundArch(g, x, 0, 1.4, 3.9, '#3a2b22'); }
  stringCourse(g, L, R, base, S, 0.5);
  // the columns: a base, the fluted shaft, the capital's leaves
  for (let k = 0; k < 6; k++) {
    const x = L + 0.8 + step * k, cw = 1.5;
    g.fillStyle = shade(S, 0.1);
    g.fillRect(x - cw * 0.75, base, cw * 1.5, 0.5);
    g.fillStyle = shade(S, 0.08);
    g.fillRect(x - cw / 2, base + 0.5, cw, cap - base - 1.6);
    g.fillStyle = shade(S, -0.12);
    for (const f of [-0.3, 0, 0.3]) g.fillRect(x + f * cw - 0.03, base + 0.8, 0.06, cap - base - 2.2);
    g.fillStyle = shade(S, -0.3);
    g.fillRect(x + cw / 2 - 0.2, base + 0.5, 0.2, cap - base - 1.6);
    g.fillStyle = shade(S, 0.16);
    g.fillRect(x - cw * 0.8, cap - 1.1, cw * 1.6, 1.1);
    g.fillStyle = shade(S, -0.2);
    for (const f of [-0.5, 0, 0.5]) { g.beginPath(); g.arc(x + f * cw, cap - 0.65, 0.22, 0, Math.PI * 2); g.fill(); }
  }
  // the entablature: architrave, frieze, cornice
  g.fillStyle = shade(S, 0.1);
  g.fillRect(L, cap, w, 1);
  g.fillStyle = shade(S, 0.02);
  g.fillRect(L, cap + 1, w, 1.4);
  stringCourse(g, L, R, ent - 0.2, S, 0.8);
  // the pediment: its raking cornices, the tympanum full of figures in ochre
  const peak = h - 0.25, eave = ent + 0.3;
  g.fillStyle = '#c7924e';
  g.beginPath(); g.moveTo(L + 1, eave + 0.1); g.lineTo(0, peak - 0.55); g.lineTo(R - 1, eave + 0.1); g.closePath(); g.fill();
  g.fillStyle = '#e0b46c';
  for (let x = L + 2; x < R - 2; x += 0.9) {
    const top = eave + 0.15 + (peak - 0.6 - eave) * (1 - Math.abs(x) / (R - 1)) * 0.85;
    g.fillRect(x - 0.2, eave + 0.15, 0.4, Math.max(0, top - eave - 0.15));
    g.beginPath(); g.arc(x, top, 0.24, 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = shade(S, 0.15);
  g.lineWidth = 0.35;
  g.beginPath(); g.moveTo(L, eave); g.lineTo(0, peak); g.lineTo(R, eave); g.stroke();
}

// a broad face of the Boekentoren: three tall strips of small panes up its middle
function boekentorenFace(g, w, h) {
  concrete(g, w, h, 1);
  for (const x of [-w * 0.22, 0, w * 0.22]) {
    g.fillStyle = shade(BOEKENTOREN_CONCRETE, -0.3);
    g.fillRect(x - 0.75, 5.6, 1.5, h - 9.2);
    g.fillStyle = '#3a4550';
    g.fillRect(x - 0.6, 5.8, 1.2, h - 9.6);
    g.fillStyle = '#7b8a96';
    for (let y = 6.9; y < h - 3.8; y += 1.25) g.fillRect(x - 0.6, y, 1.2, 0.09); // the glazing bars
    g.fillRect(x - 0.04, 5.8, 0.08, h - 9.6);
  }
}

// the Boekentoren's top, on its frame (see hallFrame): the overhanging slab, the glass belvedere
// with its copper rim, a low glass room at either end and the mast
function boekentorenTop(hall) {
  const top = new THREE.Group(), [ux, uz] = hall.u, [nx, nz] = hall.n, e = hall.eaves;
  const turn = Math.atan2(-uz, ux); // a box's x along the frame's u, its z along n
  const add = (geo, mat, a, c, y) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(hall.o[0] + ux * a + nx * c, y, hall.o[1] + uz * a + nz * c);
    m.rotation.y = turn;
    m.castShadow = true;
    top.add(m);
  };
  const slab = new THREE.MeshStandardMaterial({ color: shade(BOEKENTOREN_CONCRETE, -0.08), roughness: 0.95, flatShading: true });
  const copper = new THREE.MeshStandardMaterial({ color: 0x6f9e88, roughness: 0.6, flatShading: true });
  const panes = (w, h) => new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.3, map: elevation(w, h, 16, (g, W, H) => {
    g.fillStyle = '#e4e2da';
    g.fillRect(-W / 2, 0, W, H);
    g.fillStyle = '#5d7385';
    for (let x = -W / 2 + 0.1; x < W / 2 - 0.3; x += 1.2) for (let y = 0.3; y < H - 0.3; y += 1.1) g.fillRect(x + 0.06, y + 0.06, 1.06, 0.96);
  }) });
  const [a, c] = [hall.len / 2, hall.wide / 2];
  add(new THREE.BoxGeometry(hall.len + 2.4, 1.1, hall.wide + 2.4), slab, a, c, e + 0.55);
  const bl = hall.len * 0.6, bw = hall.wide * 0.6, bh = 7;
  const glass = panes(bl, bh), side = panes(bw, bh);
  add(new THREE.BoxGeometry(bl, bh, bw), [side, side, slab, slab, glass, glass], a, c, e + 1.1 + bh / 2);
  add(new THREE.BoxGeometry(bl + 0.5, 0.7, bw + 0.5), copper, a, c, e + 1.1 + bh + 0.35);
  for (const s of [-1, 1]) {
    const rl = hall.len * 0.16, rw = hall.wide * 0.5, rh = 3.2, g = panes(rw, rh);
    add(new THREE.BoxGeometry(rl, rh, rw), [g, g, slab, slab, panes(rl, rh), panes(rl, rh)], a + s * (bl / 2 + rl / 2 + 0.4), c, e + 1.1 + rh / 2);
    add(new THREE.BoxGeometry(rl + 0.4, 0.5, rw + 0.4), copper, a + s * (bl / 2 + rl / 2 + 0.4), c, e + 1.1 + rh + 0.25);
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 12, 6), new THREE.MeshStandardMaterial({ color: 0x8a8d90, metalness: 0.6, roughness: 0.4 }));
  mast.position.set(hall.o[0] + ux * a + nx * c, e + 1.1 + bh + 6.7, hall.o[1] + uz * a + nz * c);
  top.add(mast);
  top.name = 'boekentoren-top';
  return top;
}

const PIETERS_STONE = '#d2c8b2', ABBEY_BRICK = '#9a5a40', ABBEY_STONE = '#ddd5c2';
// the outlines (flat [x, z, ...]) of the church and the abbey, the landmark's two OSM ways
const [PIETERSKERK, ABBEY] = LANDMARKS.find(lm => lm.id === 'sint-pietersabdij').foot;

// how far the point is from this flat [x, z, ...] ring: 0 inside it
function fromRing(x, z, p) {
  let c = false, d = Infinity;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    if ((p[i + 1] > z) !== (p[j + 1] > z) && x < ((p[j] - p[i]) * (z - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) c = !c;
    const dx = p[i] - p[j], dz = p[i + 1] - p[j + 1];
    const t = Math.max(0, Math.min(1, ((x - p[j]) * dx + (z - p[j + 1]) * dz) / (dx * dx + dz * dz || 1)));
    d = Math.min(d, Math.hypot(x - p[j] - t * dx, z - p[j + 1] - t * dz));
  }
  return c ? 0 : d;
}

// the church's front on the square: two storeys of paired pilasters, the round-headed portal with
// a niche either side and a smaller door further out, an entablature; above, the great window
// between niches, a second entablature and the pediment's round window
function pietersFront(g, w, h) {
  const S = PIETERS_STONE, L = -w / 2, R = w / 2, dark = '#3a2f26', y1 = h * 0.45;
  ashlar(g, L, 0, R, h, S, { seed: 91, course: 0.55, vary: 0.05 });
  g.fillStyle = shade(S, -0.08);
  g.fillRect(L, 0, w, 1.2); // the plinth
  // the lower storey
  roundArch(g, 0, 0, w * 0.17, y1 * 0.62, shade(S, -0.25));
  roundArch(g, 0, 0, w * 0.13, y1 * 0.58, dark);
  for (const s of [-1, 1]) {
    niche(g, s * w * 0.18, y1 * 0.3, w * 0.07, y1 * 0.4, S);
    roundArch(g, s * w * 0.36, 0, w * 0.08, y1 * 0.42, dark);
    crossWindow(g, s * w * 0.36, y1 * 0.56, w * 0.07, y1 * 0.24, { stone: S });
  }
  for (const x of [-0.46, -0.27, -0.1, 0.1, 0.27, 0.46]) pilaster(g, x * w, 1.2, y1 - 0.8, w * 0.035, S);
  stringCourse(g, L, R, y1 - 0.8, S, 1.2);
  // the upper storey, narrower, with the great window
  const u = w * 0.3, y2 = h * 0.82;
  roundArch(g, 0, y1 + 1.5, w * 0.16, (y2 - y1) * 0.72, shade(S, -0.25));
  roundArch(g, 0, y1 + 1.8, w * 0.13, (y2 - y1) * 0.68, '#2c3540');
  g.fillStyle = S;
  g.fillRect(-0.12, y1 + 1.8, 0.24, (y2 - y1) * 0.6);
  for (const s of [-1, 1]) niche(g, s * w * 0.2, y1 + 3, w * 0.07, (y2 - y1) * 0.5, S);
  for (const x of [-u, -u * 0.45, u * 0.45, u]) pilaster(g, x, y1, y2 - 0.6, w * 0.03, S);
  stringCourse(g, -u - 1.5, u + 1.5, y2 - 0.6, S, 1);
  // the pediment, its round window, and scrolls down to the lower storey's ends
  g.fillStyle = shade(S, -0.12);
  g.beginPath(); g.moveTo(-u - 1.5, y2 + 0.4); g.lineTo(0, h - 0.2); g.lineTo(u + 1.5, y2 + 0.4); g.closePath(); g.fill();
  rose(g, 0, y2 + (h - y2) * 0.4, (h - y2) * 0.22, { stone: S, glass: '#2c3540' });
  g.strokeStyle = shade(S, -0.2);
  g.lineWidth = 0.8;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(s * (u + 0.5), y1 + (y2 - y1) * 0.6);
    g.quadraticCurveTo(s * (u + 1), y1 + 0.6, s * w * 0.45, y1 + 0.2);
    g.stroke();
  }
}

// a bay of the nave: a tall round-headed window between pilasters, a cornice on top
function pietersBay(g, w, h) {
  const S = PIETERS_STONE, L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 92, course: 0.55, vary: 0.05 });
  g.fillStyle = shade(S, -0.08);
  g.fillRect(L, 0, w, 1);
  roundArch(g, 0, h * 0.3, w * 0.42, h * 0.55, shade(S, -0.25));
  roundArch(g, 0, h * 0.31, w * 0.36, h * 0.53, '#2c3540');
  g.fillStyle = S;
  g.fillRect(-0.08, h * 0.31, 0.16, h * 0.45);
  g.fillRect(-w * 0.18, h * 0.55, w * 0.36, 0.16);
  for (const x of [L, R]) pilaster(g, x, 0, h * 0.92, 0.9, S);
  stringCourse(g, L, R, h * 0.92, S, h * 0.06);
}

// a bay of the dome's drum: a round window between pilasters
function pietersDrum(g, w, h) {
  const S = PIETERS_STONE;
  ashlar(g, -w / 2, 0, w / 2, h, S, { seed: 93 });
  rose(g, 0, h * 0.5, w * 0.24, { stone: S, glass: '#2c3540' });
  for (const x of [-w / 2, w / 2]) pilaster(g, x, 0, h * 0.9, 0.6, S);
  stringCourse(g, -w / 2, w / 2, h * 0.9, S, h * 0.08);
}

// a face of the dome's octagon, from the church's roofs to the cupola: plain stone, a tall
// round-headed window low down, the drum's round window high up between pilasters
function pietersOctagon(g, w, h) {
  const S = PIETERS_STONE, L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 96 });
  roundArch(g, 0, h * 0.3, w * 0.34, h * 0.22, '#2c3540');
  stringCourse(g, L, R, h * 0.6, S, 0.8);
  rose(g, 0, h * 0.78, w * 0.2, { stone: S, glass: '#2c3540' });
  for (const x of [L, R]) pilaster(g, x, h * 0.6, h * 0.95, 0.7, S);
  stringCourse(g, L, R, h * 0.95, S, h * 0.03);
}

// the tower over the choir: plain stone stages, louvred round-headed openings near the top
function pietersTower(g, w, h) {
  const S = PIETERS_STONE, L = -w / 2, R = w / 2;
  ashlar(g, L, 0, R, h, S, { seed: 94 });
  buttresses(g, w, h, S);
  for (const y of [h * 0.3, h * 0.5]) { roundArch(g, 0, y, w * 0.18, h * 0.08, '#2c3540'); stringCourse(g, L, R, y - 1, S); }
  stringCourse(g, L, R, h * 0.7, S);
  for (const x of [-w * 0.2, w * 0.2]) {
    roundArch(g, x, h * 0.72, w * 0.24, h * 0.16, shade(S, -0.3));
    g.fillStyle = shade(S, -0.1);
    for (let y = h * 0.74; y < h * 0.84; y += 0.9) g.fillRect(x - w * 0.1, y, w * 0.2, 0.25);
  }
  stringCourse(g, L, R, h * 0.92, S, 1);
}

// a bay of the abbey's wings: brick on a stone plinth, a stone cross window on each floor, a
// cornice under the roof
function abbeyWing(g, w, h) {
  const L = -w / 2, R = w / 2;
  brick(g, L, 0, R, h, ABBEY_BRICK, { seed: 95 });
  g.fillStyle = shade(ABBEY_STONE, -0.1);
  g.fillRect(L, 0, w, 1.1);
  const floors = Math.max(2, Math.round(h / 8)), fh = (h - 2) / floors;
  for (let k = 0; k < floors; k++) crossWindow(g, 0, 1.6 + k * fh + fh * 0.12, w * 0.4, fh * 0.6, { stone: ABBEY_STONE });
  stringCourse(g, L, R, h - 0.9, ABBEY_STONE, 0.9);
}
