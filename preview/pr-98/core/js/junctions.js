import * as THREE from 'three';

// Where side streets meet the raced street. There the pavement and kerb open up so the street grid
// reads as real streets, and big floating arrows over each opening show which way the race goes
// (the rail along the raced street still keeps the riders in).

// Every opening along the raced street: the sample range it spans and on which side (+1 = left).
export function findMouths(track, roads, pavement) {
  const hw = track.hw, out = [];
  const edgeLat = (x, z, hint) => {
    const i = track.nearest(x, z, hint);
    return { i, lat: track.lateral(x, z, i) };
  };
  for (const rd of roads) {
    if (rd.foot) continue;
    const p = rd.p, n = p.length / 2;
    for (let k = 0; k < n; k++) {
      const x = p[k * 2], z = p[k * 2 + 1];
      if (track.distTo(x, z) > hw + 6) continue;
      const near = edgeLat(x, z);
      if (Math.abs(near.lat) > hw + 1.5 && track.distTo(x, z) > hw + 1.5) continue; // not on the route
      for (const j of [k - 1, k + 1]) {
        if (j < 0 || j >= n) continue;
        const ux = p[j * 2], uz = p[j * 2 + 1], L = Math.hypot(ux - x, uz - z);
        if (L < 1) continue;
        const dx = (ux - x) / L, dz = (uz - z) / L;
        // walk out along the side street until it leaves the raced street's pavement
        let hit = null, hint = near.i;
        for (let s = 0.5; s <= Math.min(L, 40); s += 0.5) {
          const e = edgeLat(x + dx * s, z + dz * s, hint);
          hint = e.i;
          if (Math.abs(e.lat) > hw + pavement + 0.5 && track.distTo(x + dx * s, z + dz * s) > hw + pavement) { hit = { s, ...e }; break; }
        }
        if (!hit) continue; // this piece runs along the route itself
        const t = track.tangents[hit.i], across = Math.abs(dx * t.z - dz * t.x);
        const half = rd.w / 2 + 1.3; // its asphalt plus a pavement on each side
        out.push({ idx: hit.i, side: Math.sign(hit.lat), along: Math.min(14, half / Math.max(0.35, across)) });
      }
    }
  }
  // the same opening found from both ends of a road piece: keep one
  const kept = [];
  for (const m of out) {
    if (!kept.some(o => o.side === m.side && Math.abs(track.delta(o.idx, m.idx)) * track.spacing < 3)) kept.push(m);
  }
  const at = new Int8Array(track.n); // bit 1: left side open, bit 2: right side open
  for (const m of kept) {
    const span = Math.round(m.along / track.spacing);
    for (let d = -span; d <= span; d++) at[track.wrap(m.idx + d)] |= m.side > 0 ? 1 : 2;
  }
  return { list: kept, at };
}

export const isOpen = (mouths, i, side) => !!mouths && (mouths.at[i] & (side > 0 ? 1 : 2)) !== 0;

function arrowGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 1.2);
  s.lineTo(1.0, 0);
  s.lineTo(0.42, 0);
  s.lineTo(0.42, -1.1);
  s.lineTo(-0.42, -1.1);
  s.lineTo(-0.42, 0);
  s.lineTo(-1.0, 0);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: false }); // upright, pointing up, facing +z
}

// One arrow floating over each opening, facing the riders as they come, pointing the way the race
// goes from there: up for straight on, left or right where the route turns.
export function buildArrows(group, track, mouths) {
  const geo = arrowGeometry();
  const fill = new THREE.MeshBasicMaterial({ color: 0xffd740 });
  const edge = new THREE.MeshBasicMaterial({ color: 0x1d1a17 });
  const list = [];
  const look = Math.round(12 / track.spacing);
  for (const m of mouths.list) {
    const before = track.tangents[track.wrap(m.idx - look)], after = track.tangents[track.wrap(m.idx + look)];
    const left = track.normals[track.wrap(m.idx - look)];
    const turn = after.x * left.x + after.z * left.z; // > 0: the route bends left here
    const p = track.at(m.idx, m.side * (track.hw + 0.3));
    const a = new THREE.Group();
    a.position.set(p.x, p.y + 2.4, p.z);
    a.rotation.y = Math.atan2(before.x, before.z) + Math.PI; // its face towards the riders coming
    const sign = new THREE.Group();
    sign.rotation.z = turn > 0.5 ? Math.PI / 2 : turn < -0.5 ? -Math.PI / 2 : 0;
    sign.scale.setScalar(0.8);
    const back = new THREE.Mesh(geo, edge);
    back.scale.set(1.2, 1.2, 1);
    back.position.z = -0.05;
    sign.add(back, new THREE.Mesh(geo, fill));
    a.add(sign);
    group.add(a);
    list.push({ a, phase: m.idx, y: p.y });
  }
  return {
    update(t) {
      for (const { a, phase, y } of list) a.position.y = y + 2.4 + Math.sin(t * 3 + phase) * 0.2;
    },
    show(on) {
      for (const { a } of list) a.visible = on;
    },
  };
}
