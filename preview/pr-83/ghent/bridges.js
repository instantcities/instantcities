// Bridges that stand higher than the street, which the map has level with it. OpenStreetMap marks
// bridges but gives no heights, so tools/osmbuild.mjs lays a bridge flat on the quays unless the
// area names it (area.json `bridges`); these are lifted here instead, on the map as it is: the
// street's deck, the footbridges beside it (the pavements, which OpenStreetMap draws as bridges of
// their own), and the streets and paths that lead onto them, climbing to the deck over the last
// `ramp` metres along them. Hand-written, game metres.
//   name: the street over the bridge, at: a point on it (the bridge of that name nearest it),
//   deck: how high it stands above the street at its ends, arch: how much higher its middle is,
//   ramp: how far along the streets onto it they climb, beside: how far from the street's sides the
//   footbridges alongside it may lie (6 m when it does not say).
const RAISED = [
  // the Napoleon de Pauwbrug over the Handelsdok, from the Schoolkaai to the Dok-Noord side
  { name: 'Napoleon de Pauwbrug', at: [1040, -376], deck: 1.8, arch: 0.5, ramp: 26 },
  // the Oktrooiplein's bridge at the Dampoort, where the Schoolkaai comes out on it
  { name: 'Oktrooiplein', at: [1290, -425], deck: 1.8, arch: 0.5, ramp: 26 },
  // the Ketelbrug over the Ketelvest at the end of the Nederkouter, with the footway along the water
  // going under it (that stays at the quay's height, 2.4 m under the deck's ends)
  { name: 'Ketelbrug', at: [-221.5, 587], deck: 2.4, arch: 0.4, ramp: 32 },
  // the Lammerstraat's bridge by the Zuid, with the paths along the water passing under it at the
  // quay's height (as at the Ketelbrug) instead of crossing the street on a level
  { name: 'Lammerstraat', at: [444, 738], deck: 2.4, arch: 0.4, ramp: 32 },
  // the bridge over the Reep between the Oude Beestenmarkt and the Keizer Karelstraat
  { name: 'Oude Beestenmarkt', at: [633, -62], deck: 1.8, arch: 0.4, ramp: 26 },
  // the Rooigemlaan's bridge over the Leie, one deck per carriageway, a little higher so the fietsbrug
  // along the Leiekaai (LOWERED, below) can pass under it
  { name: 'Rooigemlaan', at: [-2221.6, -13.2], deck: 0.7, arch: 0, ramp: 30 },
  { name: 'Rooigemlaan', at: [-2224.1, -36.5], deck: 0.7, arch: 0, ramp: 30 },
  // the Muidelaan's high bridge over the Verbindingskanaal by Dok Noord, for the ships to pass under:
  // two decks side by side, one each way, each with its footway (the south one further out and
  // longer). Low at its ends and high in the middle, so the corner of the Dok-Noord street by its
  // west end climbs only a little.
  { name: 'Muidelaan', at: [916, -2011], deck: 2, arch: 4.5, ramp: 45 },
  { name: 'Muidelaan', at: [912, -2028], deck: 2, arch: 4.5, ramp: 45, beside: 15 },
  // the Citadellaan's bridge over the Schelde, one deck per carriageway, a little higher so the
  // fietsbrug along the water (LOWERED, below) can pass under it, as at the Rooigemlaan
  { name: 'Citadellaan', at: [525, 2070.3], deck: 0.7, arch: 0, ramp: 30 },
  { name: 'Citadellaan', at: [520, 2056], deck: 0.7, arch: 0, ramp: 30 },
];
// Footbridges (flat ones, on iron railings) that pass under another bridge instead of crossing it
// at the same height, where their railings would stand through each other: the deck dips by
// `depth` below its level around `at`, over `ramp` metres each way.
const LOWERED = [
  // the fietsbrug along the Leiekaai under the Rooigemlaan's bridge
  { at: [-2225, -30], depth: 2.4, ramp: 26 },
  // the fietsbrug along the Schelde under the Citadellaan's two decks
  { at: [511, 2063], depth: 2.4, ramp: 30 },
];
const STEP = 3; // a point every so many metres where a street climbs

const ease = t => t * t * (3 - 2 * t);
const key = (x, z) => `${Math.round(x * 10)},${Math.round(z * 10)}`;
// where on segment a-b point (x, z) comes nearest: [distance, t]
const near = (x, z, ax, az, bx, bz) => {
  const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1e-9;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
  return [Math.hypot(x - ax - t * dx, z - az - t * dz), t];
};
const lengths = p => { const at = [0]; for (let k = 2; k < p.length; k += 2) at.push(at[at.length - 1] + Math.hypot(p[k] - p[k - 2], p[k + 1] - p[k - 1])); return at; };

export function withRaisedBridges(roads, names) {
  const out = [...roads];
  for (const b of RAISED) {
    // the street's bridge, and the footbridges alongside it
    let bi = -1, best = Infinity;
    out.forEach((rd, i) => {
      if (!rd.br || names[rd.n] !== b.name) return;
      for (let k = 0; k + 3 < rd.p.length; k += 2) {
        const [d] = near(...b.at, ...rd.p.slice(k, k + 4));
        if (d < best) { best = d; bi = i; }
      }
    });
    if (bi < 0 || best > 10) continue;
    // a bridge OpenStreetMap draws in pieces, end to end: the pieces of the same street joined up
    const chain = [bi];
    let main = out[bi].p;
    for (let grew = true; grew;) {
      grew = false;
      out.forEach((rd, i) => {
        if (!rd.br || names[rd.n] !== b.name || chain.includes(i)) return;
        const n = main.length, m = rd.p.length;
        const same = (j, k) => key(main[j], main[j + 1]) === key(rd.p[k], rd.p[k + 1]);
        const rev = q => q.flatMap((_, k) => k % 2 ? [] : [q[q.length - 2 - k], q[q.length - 1 - k]]);
        if (same(n - 2, 0)) main = [...main, ...rd.p.slice(2)];
        else if (same(n - 2, m - 2)) main = [...main, ...rev(rd.p).slice(2)];
        else if (same(0, m - 2)) main = [...rd.p.slice(0, -2), ...main];
        else if (same(0, 0)) main = [...rev(rd.p).slice(0, -2), ...main];
        else return;
        chain.push(i);
        grew = true;
      });
    }
    const at = lengths(main), total = at[at.length - 1] || 1;
    // how high the deck is across from (x, z), and how far from the street's middle line that is
    const across = (x, z) => {
      let bd = Infinity, bs = 0;
      for (let k = 0; k + 3 < main.length; k += 2) {
        const [d, t] = near(x, z, ...main.slice(k, k + 4));
        if (d < bd) { bd = d; bs = at[k / 2] + t * (at[k / 2 + 1] - at[k / 2]); }
      }
      return [bd, b.deck + b.arch * Math.sin((Math.PI * Math.max(0, Math.min(total, bs))) / total)];
    };
    const decks = new Set(chain);
    out.forEach((rd, i) => {
      if (rd.br && rd.foot && rd.p.every((v, k) => k % 2 || across(v, rd.p[k + 1])[0] < out[bi].w / 2 + (b.beside ?? 6))) decks.add(i);
    });
    for (const i of decks) out[i] = { ...out[i], y: out[i].p.filter((_, k) => k % 2 === 0).map((x, k) => +across(x, out[i].p[k * 2 + 1])[1].toFixed(2)) };
    // how far along the streets each point lies from the decks' ends (only those within the ramp):
    // for a street along the streets only from the street's deck, for a path along everything from
    // any deck (else a path that meets a street partway along would lift it there in a bump)
    const reach = (foot) => {
      const graph = new Map(), D = new Map(), todo = [];
      const link = (a, c, L) => { if (!graph.has(a)) graph.set(a, []); graph.get(a).push([c, L]); };
      out.forEach((rd, i) => {
        if (decks.has(i) || rd.br || (rd.foot && !foot)) return;
        for (let k = 0; k + 3 < rd.p.length; k += 2) {
          const a = key(rd.p[k], rd.p[k + 1]), c = key(rd.p[k + 2], rd.p[k + 3]), L = Math.hypot(rd.p[k + 2] - rd.p[k], rd.p[k + 3] - rd.p[k + 1]);
          link(a, c, L); link(c, a, L);
        }
      });
      for (const i of foot ? decks : chain) for (const k of [0, out[i].p.length - 2]) { const s = key(out[i].p[k], out[i].p[k + 1]); D.set(s, 0); todo.push(s); }
      while (todo.length) {
        let m = 0;
        for (let j = 1; j < todo.length; j++) if (D.get(todo[j]) < D.get(todo[m])) m = j;
        const u = todo[m];
        todo[m] = todo[todo.length - 1];
        todo.pop();
        for (const [v, L] of graph.get(u) ?? []) {
          const d = D.get(u) + L;
          if (d < b.ramp && d < (D.get(v) ?? Infinity)) { if (!D.has(v)) todo.push(v); D.set(v, d); }
        }
      }
      return k => D.get(k) ?? Infinity;
    };
    const byStreet = reach(false), byAny = reach(true);
    // the streets onto them climb: a point every STEP metres where they do
    out.forEach((rd, i) => {
      if (decks.has(i) || rd.br) return;
      const p = rd.p, far = rd.foot ? byAny : byStreet;
      let climbs = false;
      for (let k = 0; k < p.length && !climbs; k += 2) climbs = far(key(p[k], p[k + 1])) < b.ramp;
      if (!climbs) return;
      const q = [p[0], p[1]], y = [];
      const lift = (old, d) => +Math.max(old, d < b.ramp ? b.deck * ease(1 - d / b.ramp) : 0).toFixed(2);
      y.push(lift(rd.y?.[0] ?? 0, far(key(p[0], p[1]))));
      for (let k = 0; k + 3 < p.length; k += 2) {
        const da = far(key(p[k], p[k + 1])), db = far(key(p[k + 2], p[k + 3])), L = Math.hypot(p[k + 2] - p[k], p[k + 3] - p[k + 1]);
        const ya = rd.y?.[k / 2] ?? 0, yb = rd.y?.[k / 2 + 1] ?? 0;
        const n = da < b.ramp || db < b.ramp ? Math.max(1, Math.round(L / STEP)) : 1;
        for (let s = 1; s <= n; s++) {
          const f = s / n;
          q.push(p[k] + (p[k + 2] - p[k]) * f, p[k + 1] + (p[k + 3] - p[k + 1]) * f);
          y.push(lift(ya + (yb - ya) * f, Math.min(da + f * L, db + (1 - f) * L)));
        }
      }
      out[i] = { ...rd, p: q.map(v => Math.round(v * 10) / 10), y };
    });
  }
  for (const l of LOWERED) {
    out.forEach((rd, i) => {
      if (!rd.br || !rd.foot || !rd.y) return;
      const y = rd.y.map((h, k) => {
        const d = Math.hypot(rd.p[k * 2] - l.at[0], rd.p[k * 2 + 1] - l.at[1]);
        return d < l.ramp ? +(h - l.depth * ease(1 - d / l.ramp)).toFixed(2) : h;
      });
      if (y.some((h, k) => h !== rd.y[k])) out[i] = { ...rd, y };
    });
  }
  return out;
}
