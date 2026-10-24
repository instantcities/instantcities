import * as THREE from 'three';
import { tramPlatform } from './tramplatform.js';

// The tram stops of the city's tram lines (TRAM_STOPS, see tramlines.js): at each a platform
// (tramplatform.js) beside the track where the tram halts, on the side its doors open, its board
// counting down the next trams as they come. The platform is made straight; where the track bends
// it is bent along with it.
//
// Each stop gets a `post`: { x, z, y }, where its sign stands on the platform, the place to wait at
// (main.js); the platforms' tops are returned as ledges, for the ground to step up onto (relief.js).

const LONG = 36; // metres: a platform, a little shorter than the tram

// ctx: the scenery's context; stops: the city's TRAM_STOPS; trams: what addTrams returned.
export function addTramStops(ctx, stops, trams) {
  if (!stops?.length || !trams) return [];
  const { net, fleet, LENGTH } = trams;
  const ledges = [], boards = [];
  stops.forEach((s, k) => {
    const [run, at] = s.serves[0], e = net.edges[run];
    const lines = [...new Map(s.serves.map(([r]) => net.edges[r].line).map(l => [l.ref, l])).values()];
    const p = tramPlatform({ length: LONG, width: s.w ?? 2.6, lines, name: s.name, seed: k + 1 });
    const bend = along(e, at);
    p.traverse(m => { if (m.isMesh) m.geometry = bent(m.geometry, bend); });
    ctx.group.add(p);
    const { post, ledge, board } = p.userData, [ax, az, bx, bz, half] = ledge;
    const q = bend(post.x, post.y, post.z);
    s.post = { x: q[0], y: q[1], z: q[2] };
    // its top down its middle, a piece every 4 m
    for (let t = 0; t < 1; t += 0.125) {
      const l0 = bend(ax + (bx - ax) * t, post.y, az + (bz - az) * t), l1 = bend(ax + (bx - ax) * (t + 0.125), post.y, az + (bz - az) * (t + 0.125));
      ledges.push([l0[0], l0[2], l1[0], l1[2], l0[1], l1[1], half]);
    }
    boards.push({ s, board, text: null });
  });

  // the boards, a few each frame: when the next trams are due, from where they are now
  let next = 0;
  ctx.updaters.push(() => {
    for (let k = 0; k < 4 && boards.length; k++) {
      const b = boards[next++ % boards.length], rows = due(b.s, net, fleet, LENGTH);
      const text = rows.map(r => `${r.ref}${r.to}${r.min}`).join('|');
      if (text !== b.text) {
        b.text = text;
        b.board.draw(rows);
      }
    }
  });
  return ledges;
}

// Where (x, y, z) of a platform's own metres is in the city, put by the track of edge e with its
// middle at `at`: its -z on along the track, its x to the right of it. Also how its directions
// turn there, for the normals: [x, y, z, right x, right z, ahead x, ahead z].
function along(e, at) {
  const p = new THREE.Vector3(), q = new THREE.Vector3();
  return (x, y, z) => {
    e.at(at - z, p);
    e.at(at - z + 0.5, q);
    const L = Math.hypot(q.x - p.x, q.z - p.z) || 1, ux = (q.x - p.x) / L, uz = (q.z - p.z) / L;
    return [p.x - uz * x, p.y + y, p.z + ux * x, -uz, ux, ux, uz];
  };
}
function bent(geo, bend) {
  const g = geo.clone(), pos = g.attributes.position, nor = g.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const [x, y, z, rx, rz, ux, uz] = bend(pos.getX(i), pos.getY(i), pos.getZ(i));
    pos.setXYZ(i, x, y, z);
    if (nor) {
      const nx = nor.getX(i), nz = nor.getZ(i);
      nor.setXYZ(i, nx * rx - nz * ux, nor.getY(i), nx * rz - nz * uz);
    }
  }
  g.computeBoundingSphere();
  g.computeBoundingBox();
  return g;
}

// The trams coming to stop s, soonest first, at most three: { ref, colour, to, min (0: here now) }.
// One on the line's other way counts too: it comes round at the end.
function due(s, net, fleet, LENGTH) {
  const out = [];
  for (const [run, at] of s.serves) {
    const e = net.edges[run], nose = at + LENGTH / 2;
    for (const t of fleet.list) {
      let d = null;
      if (t.edge === e) {
        if (t.stopped && t.served === nose) d = 0;
        else if (nose - t.head > -0.5 && t.served !== nose) d = nose - t.head;
      } else if (t.edge === e.back) d = e.back.len - t.head + nose + 300; // and the wait at the end
      if (d == null) continue;
      // about 6 m/s, and a while at each stop on the way
      const stopsOn = e.halts.filter(h => h < at && h > at - d).length;
      const { ref, colour, to } = e.line;
      out.push({ ref, colour, to, min: d < 25 ? 0 : Math.max(1, Math.round((d / 6 + stopsOn * 12) / 60)) });
    }
  }
  return out.sort((x, y) => x.min - y.min).slice(0, 3);
}
