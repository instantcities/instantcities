// The tram tracks as a network for the trams to drive on, and the driving itself (no drawing: see
// trams.js). OpenStreetMap draws a double track as two ways side by side, one per direction, joined
// by switches and crossovers. Each way becomes an edge one-way on the right, as trams drive in
// Belgium: the other track lies to its left. A tram drives on along whichever edge carries on from
// where its edge ends, so trams follow each other round and never meet head-on; a single track
// with no twin can be driven both ways.

const TWIN = 12; // metres: a parallel track this near is the other direction's
const JOIN = 1.2; // track ends this near are joined
const TURN = 0.75; // radians: the sharpest bend a tram takes onto the next track
const BACK = 30; // metres: at the end of the line, the track back may lie this far off
const STUB = 60; // metres: a shorter track that leads nowhere is a siding, left out

// a point on a polyline by distance along it
function sampler(pts, s) {
  let k = 0;
  return (d, out) => {
    d = Math.max(0, Math.min(s.at(-1), d));
    while (k > 0 && s[k] > d) k--;
    while (k < s.length - 2 && s[k + 1] < d) k++;
    const f = (d - s[k]) / (s[k + 1] - s[k] || 1), a = pts[k], b = pts[k + 1];
    out.x = a[0] + (b[0] - a[0]) * f;
    out.y = a[1] + (b[1] - a[1]) * f;
    out.z = a[2] + (b[2] - a[2]) * f;
    return out;
  };
}

// the nearest point of a polyline to (x, z): [distance, along, segment]
function nearest(e, x, z) {
  let best = [Infinity, 0, 0];
  for (let i = 0; i + 1 < e.pts.length; i++) {
    const [ax, , az] = e.pts[i], [bx, , bz] = e.pts[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1e-9;
    const f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)), d = Math.hypot(x - ax - dx * f, z - az - dz * f);
    if (d < best[0]) best = [d, e.s[i] + f * (e.s[i + 1] - e.s[i]), i];
  }
  return best;
}

// the way along an edge at distance d, going dir (unit [x, z])
function heading(e, d, dir) {
  let i = 0;
  while (i < e.s.length - 2 && e.s[i + 1] <= d + (dir > 0 ? 0 : -1e-6)) i++;
  if (dir < 0 && i > 0 && e.s[i] >= d) i--;
  const [ax, , az] = e.pts[i], [bx, , bz] = e.pts[i + 1], L = Math.hypot(bx - ax, bz - az) || 1;
  return [((bx - ax) / L) * dir, ((bz - az) / L) * dir];
}

// trams: the map's tram ways ({ p: flat [x, z, ...], y? }); halts: flat [x, z, ...] of the stops.
export function tramNetwork(trams, halts = []) {
  let edges = (trams ?? []).map((t, id) => {
    const pts = [];
    for (let k = 0; k < t.p.length / 2; k++) pts.push([t.p[k * 2], t.y?.[k] ?? 0, t.p[k * 2 + 1]]);
    const s = [0];
    for (let k = 1; k < pts.length; k++) s.push(s[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][2] - pts[k - 1][2]));
    return { id, pts, s, len: s.at(-1), dir: 0, halts: [] };
  }).filter(e => e.len > 0.5);
  for (const e of edges) e.at = sampler(e.pts, e.s);

  // a grid of the edges, to find what lies near a point
  const C = 40, grid = new Map(), cell = (x, z) => `${Math.floor(x / C)},${Math.floor(z / C)}`;
  for (const e of edges) {
    const seen = new Set();
    for (const [x, , z] of e.pts) {
      const c = cell(x, z);
      if (!seen.has(c)) { seen.add(c); (grid.get(c) ?? grid.set(c, []).get(c)).push(e); }
    }
    // long straight segments cross cells without a point in them
    for (let i = 0; i + 1 < e.pts.length; i++) {
      const n = Math.ceil((e.s[i + 1] - e.s[i]) / (C / 2));
      for (let q = 1; q < n; q++) {
        const [ax, , az] = e.pts[i], [bx, , bz] = e.pts[i + 1], c = cell(ax + ((bx - ax) * q) / n, az + ((bz - az) * q) / n);
        if (!seen.has(c)) { seen.add(c); (grid.get(c) ?? grid.set(c, []).get(c)).push(e); }
      }
    }
  }
  const around = (x, z, r) => {
    const out = new Set();
    for (let i = Math.floor((x - r) / C); i <= Math.floor((x + r) / C); i++) {
      for (let j = Math.floor((z - r) / C); j <= Math.floor((z + r) / C); j++) for (const e of grid.get(`${i},${j}`) ?? []) out.add(e);
    }
    return [...out];
  };

  // sidings: short tracks with an end joined to nothing (again, as leaving one out can leave another)
  const joined = (e, d) => {
    const q = e.at(d, {});
    return around(q.x, q.z, JOIN).some(f => f !== e && !f.cut && nearest(f, q.x, q.z)[0] <= JOIN);
  };
  for (let again = true; again;) {
    again = false;
    for (const e of edges) if (!e.cut && e.len < STUB && (!joined(e, 0) || !joined(e, e.len))) e.cut = again = true;
  }
  edges = edges.filter(e => !e.cut);
  for (const list of grid.values()) list.splice(0, list.length, ...list.filter(e => !e.cut));

  // one-way on the right: the twin track to the left of the way the edge runs (x east, z south,
  // so to the left of heading (tx, tz) is where tx * vz - tz * vx < 0)
  const p = {};
  for (const e of edges) {
    let left = 0, right = 0;
    for (let d = Math.min(5, e.len / 2); d < e.len - Math.min(5, e.len / 2) + 1e-6; d += 8) {
      e.at(d, p);
      const [tx, tz] = heading(e, d, 1);
      let best = null;
      for (const f of around(p.x, p.z, TWIN)) {
        if (f === e) continue;
        const [dist, along] = nearest(f, p.x, p.z);
        if (dist < 2 || dist > TWIN || (best && dist >= best[0])) continue; // under 2 m: the same track
        const [ux, uz] = heading(f, along, 1);
        if (Math.abs(tx * ux + tz * uz) < 0.9) continue; // not running alongside
        const q = f.at(along, {});
        best = [dist, tx * (q.z - p.z) - tz * (q.x - p.x)];
      }
      if (best) best[1] < 0 ? left++ : right++;
    }
    if (left + right >= 2 && Math.max(left, right) >= 2 * Math.min(left, right)) e.dir = left > right ? 1 : -1;
  }
  // the short pieces between (switches, a bridge) take the way of the tracks they carry on from
  for (let pass = 0; pass < 4; pass++) {
    for (const e of edges) {
      if (e.dir || e.len > 60) continue;
      const votes = new Set();
      for (const [d, sign] of [[0, -1], [e.len, 1]]) {
        e.at(d, p);
        const [hx, hz] = heading(e, d, sign); // out of the edge at this end
        for (const f of around(p.x, p.z, JOIN)) {
          if (f === e || !f.dir) continue;
          for (const [fd] of [[0], [f.len]]) {
            const q = f.at(fd, {});
            if (Math.hypot(q.x - p.x, q.z - p.z) > JOIN) continue;
            const [fx, fz] = heading(f, fd, fd === 0 ? 1 : -1); // into f from this end
            if (hx * fx + hz * fz < Math.cos(TURN)) continue;
            // trams go into f here (f starts here) or come out of it (f ends here)
            const fIn = (fd === 0) === (f.dir > 0);
            votes.add(fIn ? sign : -sign);
          }
        }
      }
      if (votes.size === 1) e.dir = [...votes][0];
    }
  }

  // the stops along each edge
  for (const e of edges) {
    for (let k = 0; k < halts.length; k += 2) {
      const [dist, along] = nearest(e, halts[k], halts[k + 1]);
      if (dist < 2.5) e.halts.push(along);
    }
  }

  // Where a tram goes on from distance d along edge e, going dir: [edge, along, dir] candidates,
  // the straightest first; or, at the end of a line, the nearest track back the other way.
  const onward = (e, d, dir) => {
    const at = e.at(d, {}), [hx, hz] = heading(e, d, dir), out = [];
    for (const f of around(at.x, at.z, JOIN)) {
      if (f === e) continue;
      const [dist, along] = nearest(f, at.x, at.z);
      if (dist > JOIN) continue;
      for (const fdir of f.dir ? [f.dir] : [1, -1]) {
        if ((fdir > 0 ? f.len - along : along) < 1) continue;
        const [fx, fz] = heading(f, along, fdir), dot = hx * fx + hz * fz;
        if (dot > Math.cos(TURN)) out.push([f, along, fdir, dot]);
      }
    }
    return out.sort((a, b) => b[3] - a[3]);
  };
  const turnBack = (e, d, dir) => {
    const at = e.at(d, {}), [hx, hz] = heading(e, d, dir);
    let best = null;
    for (const f of around(at.x, at.z, BACK)) {
      if (f === e) continue;
      const [dist, along] = nearest(f, at.x, at.z);
      if (dist > BACK || (best && dist >= best[4])) continue;
      for (const fdir of f.dir ? [f.dir] : [1, -1]) {
        if ((fdir > 0 ? f.len - along : along) < 20) continue;
        const [fx, fz] = heading(f, along, fdir);
        if (hx * fx + hz * fz < -0.7) best = [f, along, fdir, 0, dist];
      }
    }
    return best;
  };
  // does any track lead into edge e at distance d, for trams going dir?
  const comesFrom = (e, d, dir) => {
    const at = e.at(d, {}), [hx, hz] = heading(e, d, dir);
    return around(at.x, at.z, JOIN).some(f => {
      if (f === e) return false;
      const [dist, along] = nearest(f, at.x, at.z);
      if (dist > JOIN) return false;
      return (f.dir ? [f.dir] : [1, -1]).some(fdir => {
        if ((fdir > 0 ? along : f.len - along) < 1) return false;
        const [fx, fz] = heading(f, along, -fdir);
        return -(hx * fx + hz * fz) > Math.cos(TURN);
      });
    });
  };
  // where lines come into the map: a tram at the end of the line with no track back starts again
  // at one of these
  const sources = [];
  for (const e of edges) {
    for (const dir of e.dir ? [e.dir] : [1, -1]) {
      const d = dir > 0 ? 0 : e.len;
      if (!comesFrom(e, d, dir) && e.len > 60) sources.push([e, d, dir]);
    }
  }
  return { edges, onward, turnBack, heading, sources };
}

// The tram lines (<city>/tramlines.js, made by tools/tramlines.mjs) as a network of their own: each
// line each way one edge, its stops the halts. A tram keeps to its line: at the end of it, it
// turns round onto the same line back. Same shape as tramNetwork's, for tramFleet.
export function lineNetwork(lines) {
  const edges = lines.map((l, id) => {
    const pts = [];
    for (let k = 0; k < l.p.length / 2; k++) pts.push([l.p[k * 2], l.y?.[k] ?? 0, l.p[k * 2 + 1]]);
    const s = [0];
    for (let k = 1; k < pts.length; k++) s.push(s[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][2] - pts[k - 1][2]));
    const e = { id, pts, s, len: s.at(-1), dir: 1, halts: l.stops.map(st => st.at), line: l };
    e.at = sampler(pts, s);
    return e;
  });
  // the same line the other way: the one with the same number, from where this one goes to
  for (const e of edges) e.back = edges.find(f => f !== e && f.line.ref === e.line.ref && f.line.to === e.line.from) ?? null;
  return {
    edges,
    onward: () => [],
    turnBack: e => (e.back ? [e.back, 0, 1] : null),
    heading,
    sources: edges.map(e => [e, 0, 1]),
  };
}

// A tram's nose at distance head along its edge, and a trail of where the nose has been, for the
// sections behind it. LENGTH: the whole tram.
export function placeTram(net, edge, along, dir, LENGTH) {
  const t = { edge, head: along, dir, wait: 0, trail: [] };
  // the trail: back along the edge, then straight on behind its start
  const p = {};
  for (let b = LENGTH + 2; b >= 0; b -= 1) {
    const d = along - dir * b, over = dir > 0 ? -d : d - edge.len;
    edge.at(d, p);
    if (over > 0) {
      const [hx, hz] = net.heading(edge, Math.max(0, Math.min(edge.len, d)), dir);
      t.trail.push([p.x - hx * over, p.y, p.z - hz * over]);
    } else t.trail.push([p.x, p.y, p.z]);
  }
  t.nose = t.trail.at(-1);
  return t;
}

// the point dist metres behind the nose, along the trail
export function behind(t, dist, out) {
  const tr = t.trail;
  let left = dist;
  for (let i = tr.length; i > 0; i--) {
    const a = i === tr.length ? t.nose : tr[i], b = tr[i - 1], L = Math.hypot(a[0] - b[0], a[2] - b[2]);
    if (L >= left) {
      const f = L ? left / L : 0;
      out.x = a[0] + (b[0] - a[0]) * f; out.y = a[1] + (b[1] - a[1]) * f; out.z = a[2] + (b[2] - a[2]) * f;
      return out;
    }
    left -= L;
  }
  const a = tr[0];
  out.x = a[0]; out.y = a[1]; out.z = a[2];
  return out;
}

const SPEED = 8, SLOW = 5, ACCEL = 1, BRAKE = 1.2; // m/s out of town and in the centre, m/s²
const WAIT = 8, DWELL = 12; // seconds at the end of the line and at a stop
const KEEP = 12; // metres: a tram keeps this far behind the one in front
const STUCK = 30; // seconds held up before a tram gives up waiting (two meeting on a single track)

// The trams on the network: one per `per` metres of track, and one more per `centrePer` metres of
// it within centre.r of the centre ({ x, z, r }), where they also go slower; at most max.
// LENGTH: a tram from nose to tail. rand: 0..1.
export function tramFleet(net, { LENGTH, centre = null, per = 800, centrePer = 250, max = 50, rand = Math.random }) {
  const inCentre = (x, z) => !!centre && (x - centre.x) ** 2 + (z - centre.z) ** 2 < centre.r ** 2;
  const p = {}, list = [];
  // spread out along the tracks, the way they run, with room behind for the tram
  const clear = (x, z, room) => list.every(o => o.trail.every(q => (q[0] - x) ** 2 + (q[2] - z) ** 2 > room * room));
  let carry = 0.5;
  const spots = [];
  for (const e of net.edges) {
    let n = e.len / per;
    for (let d = 0; d < e.len; d += 10) if (inCentre(...(e.at(d, p), [p.x, p.z]))) n += 10 / centrePer;
    carry += n;
    const k = Math.floor(carry);
    carry -= k;
    for (let i = 0; i < k; i++) spots.push([e, (e.len * (i + 0.5 + (rand() - 0.5) * 0.5)) / k]);
  }
  for (const [e, d] of spots.sort(() => rand() - 0.5)) {
    if (list.length >= max) break;
    const dir = e.dir || (rand() < 0.5 ? 1 : -1), head = Math.max(LENGTH + 2, Math.min(e.len, dir > 0 ? d : e.len - d));
    const along = dir > 0 ? head : e.len - head;
    if (head > e.len) continue; // too short a track to stand on
    e.at(along, p);
    if (!clear(p.x, p.z, LENGTH + KEEP)) continue;
    list.push(Object.assign(placeTram(net, e, along, dir, LENGTH), { id: list.length, v: 0, held: 0 }));
  }

  // is there room for tram t at s ([edge, along, dir]): its body there and the track just ahead?
  const room = (t, [e, along, dir]) => {
    const body = placeTram(net, e, along, dir, LENGTH).trail;
    for (let k = 2; k <= KEEP; k += 2) { e.at(along + dir * k, p); body.push([p.x, p.y, p.z]); }
    return list.every(o => o === t || o.trail.every(q => body.every(b => (q[0] - b[0]) ** 2 + (q[2] - b[2]) ** 2 > 2.5 * 2.5)));
  };
  let spawn = 0;
  const moveTo = (t, [e, along, dir]) => {
    Object.assign(t, placeTram(net, e, along, dir, LENGTH), { v: 0, served: null, wait: 2, onto: null });
  };
  // another tram's body within reach ahead of t's nose: 1 going the same way, -1 coming towards it
  const blocked = t => {
    const [hx, hz] = net.heading(t.edge, t.head, t.dir), n = t.nose;
    for (const o of list) {
      if (o === t) continue;
      for (const q of o.trail) {
        const dx = q[0] - n[0], dz = q[2] - n[2], ahead = dx * hx + dz * hz;
        if (ahead > 0 && ahead < KEEP && Math.abs(dx * hz - dz * hx) < 2.2) {
          const [ox, oz] = net.heading(o.edge, o.head, o.dir);
          return ox * hx + oz * hz < -0.5 ? -1 : 1;
        }
      }
    }
    return 0;
  };

  const step = dt => {
    dt = Math.min(dt, 0.1);
    for (const t of list) {
      if (t.hold) t.wait = Math.max(t.wait, dt + 0.01); // someone getting on: the doors stay open
      if (t.wait > 0) {
        if ((t.wait -= dt) > 0) continue;
        if (t.stopped) t.stopped = false; // off from the stop
        else if (t.ended) {
          // the end of the line: back along the other track, or in again where a line comes in
          t.ended = false;
          const back = net.turnBack(t.edge, t.head, t.dir);
          const free = s => room(t, s);
          let to = back && free(back) ? back : null;
          for (let k = 0; !back && !to && k < net.sources.length; k++) {
            const s = net.sources[(spawn + k) % net.sources.length];
            if (free(s)) { spawn += k + 1; to = s; }
          }
          if (to) moveTo(t, to);
          else Object.assign(t, { ended: true, wait: 2 }); // nowhere free yet
          continue;
        }
      }
      const e = t.edge, dir = t.dir;
      // the next stop: braking into it, then waiting there with the doors open
      let stop = Infinity;
      for (const h of e.halts) {
        const nose = h + (dir * LENGTH) / 2, d = dir * (nose - t.head);
        if (d > -0.05 && d < stop && nose !== t.served) { stop = d; t.next = nose; }
      }
      if (stop < 0.3 && t.v < 0.5) {
        t.served = t.next;
        t.wait = DWELL;
        t.stopped = true;
        t.v = 0;
        continue;
      }
      // where the track goes on from the end of this one, if it does
      const end = dir > 0 ? e.len - t.head : t.head;
      if (end < 60 && !t.onto) {
        const next = net.onward(e, dir > 0 ? e.len : 0, dir);
        t.onto = next.length ? next[t.id % next.length] : 'end';
      }
      const left = Math.min(stop, t.onto === 'end' ? end : Infinity);
      const wall = blocked(t);
      t.held = wall < 0 ? t.held + dt : 0;
      const n = t.trail.at(-1);
      let want = Math.min(inCentre(n[0], n[2]) ? SLOW : SPEED, Math.sqrt(2 * BRAKE * Math.max(0, left)) + (left === stop ? 0.15 : 0.4));
      if (wall > 0 || (wall < 0 && t.held < STUCK)) want = 0;
      t.v = want < t.v ? Math.max(want, t.v - 4 * BRAKE * dt) : Math.min(want, t.v + ACCEL * dt);
      let go = t.v * dt;
      if (left < Infinity) go = Math.min(go, Math.max(0, left));
      t.head += dir * go;
      // on past the end of the track, onto the next
      const over = dir > 0 ? t.head - e.len : -t.head;
      if (over >= 0) {
        if (t.onto && t.onto !== 'end') {
          const [f, along, fdir] = t.onto;
          t.edge = f;
          t.dir = fdir;
          t.head = along + fdir * over;
          t.served = null;
        } else {
          t.head = dir > 0 ? e.len : 0;
          t.wait = WAIT;
          t.ended = true;
          t.v = 0;
        }
        t.onto = null;
      }
      // the trail behind the nose
      t.edge.at(t.head, p);
      t.nose = [p.x, p.y, p.z];
      const last = t.trail.at(-1);
      if (Math.hypot(p.x - last[0], p.z - last[2]) >= 0.5) {
        t.trail.push(t.nose);
        let len = 0;
        for (let i = t.trail.length - 1; i > 0; i--) {
          len += Math.hypot(t.trail[i][0] - t.trail[i - 1][0], t.trail[i][2] - t.trail[i - 1][2]);
          if (len > LENGTH + 3) { t.trail.splice(0, i - 1); break; }
        }
      }
    }
  };
  // A tram for someone waiting at (x, z), at distance at along edge e: the next one coming along it,
  // if it is near enough; otherwise one brought there, a little way back, so it comes soon: the
  // one furthest from them, so they do not see it go. Not one in `busy` (being ridden). Null when
  // there is no room for one yet.
  const summon = (e, at, x, z, busy = new Set(), reach = 220) => {
    const nose = at + LENGTH / 2;
    let best = null;
    for (const t of list) {
      if (t.edge !== e || busy.has(t)) continue;
      const d = nose - t.head;
      if (d > -0.5 && d < reach && (!best || d < nose - best.head) && t.served !== nose) best = t;
    }
    if (best) return best;
    const far = t => (t.nose[0] - x) ** 2 + (t.nose[2] - z) ** 2;
    const pick = list.filter(t => !busy.has(t)).sort((a, b) => far(b) - far(a))[0];
    if (!pick) return null;
    for (const back of [120, 160, 80, 200, 50]) {
      const along = Math.max(LENGTH + 2, nose - back);
      if (along >= nose - 5) continue;
      const s = [e, along, 1];
      if (room(pick, s)) {
        moveTo(pick, s);
        pick.wait = 0;
        return pick;
      }
    }
    return null;
  };
  return { list, step, summon };
}
