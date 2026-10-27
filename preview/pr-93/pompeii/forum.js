// The Forum of Pompeii and the Temple of Jupiter at its north end, modelled by hand in place of
// the map's boxes, in game metres (the real ones times 1.25), on the outline the map has of the
// Forum: a long square, 145 by 42, its axis turned from north a little towards the east, its
// south end (+v here) towards the Via dell'Abbondanza:
//   the ground, gravel and earth over the old paving, with pedestals standing along it where
//     the statues were, and drums and blocks of fallen columns lying about
//   a colonnade along both long sides, as the excavation has it: fluted columns of weathered
//     travertine, some still under their capitals with a length of architrave across, most
//     broken off at different heights, and behind them the broken wall of the portico
//   the Temple of Jupiter, Juno and Minerva: its podium with the flight of steps, a few of the
//     Corinthian columns still standing across the front with a piece of the entablature on them,
//     the stumps of the rest, and the cella's walls broken off; Mount Vesuvius stands behind it
// Riders bump into the temple's podium and ride between the columns of the colonnades.
import * as THREE from 'three';
import { Kit, kitMat } from '../core/js/kit.js';
import { onMap, rect } from '../core/js/arcade.js';
import { rng } from '../core/js/facades.js';
import { WallBatch, ruinWall, ruinTexture } from '../core/js/roman.js';
import { gravelTexture } from '../core/js/track.js';
import { column, fallen, pedestal } from './columns.js';

const X = -137, Z = 143.5, TURN = 0.4;
const HL = 72, HW = 29; // half its length and half its width, the colonnades' 8 m depth included
const STONE = '#c9b896';

export function forum() {
  const kit = new Kit(), r = rng(77), walls = new WallBatch();
  // the colonnades, one on each long side, 8 m deep: the columns on the side of the open square, 6 m
  // to the architrave, the back wall on the street's. Most are broken off, a run of them still stands
  // with the architrave across.
  for (const side of [-1, 1]) {
    const standing = [];
    let k = 0;
    for (let v = -HL + 6; v <= HL - 6; v += 4.6, k++) {
      const whole = (Math.floor(k / 5) + (side > 0 ? 2 : 0)) % 3 === 0 ? r() < 0.8 : r() < 0.12;
      column(kit, side * (HW - 8), v, whole ? 6 : 0.9 + r() * 3.8, 0.55, { capital: whole, rnd: r });
      standing.push(whole);
    }
    k = 0;
    for (let v = -HL + 6; v < HL - 6 - 4.6; v += 4.6, k++) {
      if (standing[k] && standing[k + 1]) kit.box(1.3, 1.1, 4.6, STONE, side * (HW - 8), 7.15, v + 2.3); // the architrave between two that stand
    }
    // the back wall of the portico, of brick and rubble, broken off along its top
    ruinWall(walls, side * (HW - 0.6), -HL + 4, side * (HW - 0.6), HL - 4, -side, 0, HL * 2 - 8, 0, 6.2, 91 + side, 0, (HL * 2 - 8) / 9 * (side > 0 ? 1 : -1), 1.2);
    // pedestals for the statues that stood along the open square, and the columns that fell
    for (let v = -HL + 10; v < HL - 6; v += 8 + r() * 5) pedestal(kit, side * (HW - 13), v, TURN * 0 + (r() - 0.5) * 0.1, r);
  }
  for (let k = 0; k < 90; k++) fallen(kit, (r() - 0.5) * (HW * 2 - 8), (r() - 0.5) * HL * 2, r, 0.7 + r() * 0.4);
  // the Temple of Jupiter: podium, steps, the columns that are left, the cella's walls
  const v0 = -HL - 4, depth = 34, w = 24, ph = 3.6; // the podium's front edge, depth, width and height
  kit.box(w, ph, depth, STONE, 0, ph / 2, v0 - depth / 2);
  kit.box(w + 1.2, 0.5, depth + 1.2, '#d3c3a0', 0, ph + 0.25, v0 - depth / 2);
  for (let k = 0; k < 6; k++) kit.box(12, 0.6, 1.2, '#d3c3a0', 0, 0.3 + 0.6 * k, v0 + 3.6 - 0.6 * k);
  const top = ph + 0.5;
  for (const row of [0, 1]) for (let k = 0; k < 6; k++) {
    const x = -8.5 + k * 3.4, z = v0 - 3.4 - row * 4.6;
    const up = row === 0 && (k === 1 || k === 2 || k === 4); // three of the front six still stand, with a piece of the entablature on them
    column(kit, x, z, up ? 11.5 : 1.2 + r() * 3.4, 0.9, { capital: up, rnd: r, y0: top });
  }
  kit.box(w - 1.5, 1.8, 3.2, STONE, 0, top + 13.4, v0 - 3.4); // the entablature across the three that stand
  const cv = v0 - 14; // the cella: its walls, broken off, round the floor
  ruinCell(walls, w - 5, depth - 16, cv, top);
  const group = new THREE.Group();
  const mesh = kit.mesh(kitMat(0.9));
  const pave = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2 - 8, HL * 2).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: paving(), roughness: 1 }));
  pave.position.y = 0.1;
  pave.receiveShadow = true;
  group.add(pave, mesh, walls.mesh(ruinTexture(4, '', 17)));
  return group;
}

// the Forum's ground: gravel and earth over the old slabs
let pave = null;
function paving() {
  if (pave) return pave;
  pave = gravelTexture(0xbfae88);
  pave.repeat.set((HW * 2 - 8) / 5, (HL * 2) / 5);
  return pave;
}

// the temple's cella: three walls and the back one, broken off, standing on the podium
function ruinCell(walls, cw, cd, cv, top) {
  const hx = cw / 2, back = cv - cd;
  const pts = [[-hx, cv], [-hx, back], [hx, back], [hx, cv]]; // from the front left, round the back
  pts.forEach(([x, z], i) => {
    if (i === pts.length - 1) return;
    const [x2, z2] = pts[i + 1], L = Math.hypot(x2 - x, z2 - z), nx = (z2 - z) / L, nz = -(x2 - x) / L;
    ruinWall(walls, x, z, x2, z2, nx, nz, L, top, 5.4, 33 + i, 0, L / 9, 1.4);
  });
}

const ring = pts => onMap(X, Z, TURN, pts);

// It stands in for the map's pieces of the Temple of Jupiter and the Forum's sides (area); riders
// bump into the podium (foot).
export const FORUM = [{
  id: 'forum', name: 'Forum', x: X, z: Z, turn: TURN, reach: 260,
  area: [ring(rect(-HW - 5, -HL - 42, HW + 5, HL + 4))],
  foot: [ring(rect(-12, -HL - 38, 12, -HL - 3))],
  make: forum,
}];
