// The Stadshal's shell, from the cross-section measured over its roof (tools/gent3d.mjs's dhmvRoof):
// the long sides one steep slope of glass from a Corten band at the underside straight up to each
// ridge, hollow inside: from underneath you look up into both gables, timber all over, the valley
// between them hanging down as a keel. The gable ends are timber walls with a wide opening shaped
// like an upturned V.
//
// tops: the measured ridges and valleys, [across, up] in metres; len: how wide the hall is across;
// under: the height of its underside; thick: how thick the shell is; foot: how wide its flat
// underside is along each long side; apex: how high the opening in the gable ends reaches, as a
// share of the way from the underside to the highest ridge; margin: where it starts, from the sides;
// vert(across, along, up): a vertex (along 0 at one gable end, 1 at the other). Returns { I, skin }: the triangles, and per triangle what it is: g the glass,
// e the Corten band and frames, t the timber of the gable ends, w the timber inside.
export function hallShell({ tops, len, under, thick = 0.8, foot = 1.2, apex = 0.4, band = 0.5, margin = 0.4 }, vert) {
  const peak = Math.max(...tops.map(t => t[1]));
  const outer = [[0, under], [0, under + band], ...tops, [len, under + band], [len, under]];
  // the inside: the tops let down by the shell's thickness, rising from the flat underside's edge
  const inner = [[0, under], [foot, under], ...tops.map(([s, h]) => [s, h - thick]), [len - foot, under], [len, under]];
  const opening = [[0, under], [margin, under], [len / 2, under + apex * (peak - under)], [len - margin, under], [len, under]];
  // a cross-section's height at `s` across (on an upright step, the top of it)
  const height = (line, s) => {
    for (let k = line.length - 1; k > 0; k--) {
      const [a, b] = [line[k - 1], line[k]];
      if (s >= a[0] && s <= b[0]) return b[0] > a[0] ? a[1] + ((b[1] - a[1]) * (s - a[0])) / (b[0] - a[0]) : Math.max(a[1], b[1]);
    }
    return under;
  };
  const I = [];
  let skin = '';
  const quad = (kind, a, b, c, d) => { I.push(a, b, c, a, c, d); skin += kind + kind; };
  const at = ([s, h], along) => vert(s, along, h);
  // the long sides, the band at their foot Corten
  for (let k = 0; k + 1 < outer.length; k++) {
    const kind = k === 0 || k === outer.length - 2 ? 'e' : 'g';
    quad(kind, at(outer[k], 0), at(outer[k + 1], 0), at(outer[k + 1], 1), at(outer[k], 1));
  }
  // the underside: a flat Corten strip along each side, the timber inside of the gables between them
  for (let k = 0; k + 1 < inner.length; k++) {
    const kind = inner[k][1] === under && inner[k + 1][1] === under ? 'e' : 'w';
    quad(kind, at(inner[k], 0), at(inner[k], 1), at(inner[k + 1], 1), at(inner[k + 1], 0));
  }
  // the gable ends, in upright strips between the opening and the roof: a Corten frame round the
  // opening, timber above it
  const cuts = [...new Set([...outer, ...opening].map(p => p[0]))].sort((a, b) => a - b);
  for (const e of [0, 1]) {
    for (let k = 0; k + 1 < cuts.length; k++) {
      const [s0, s1] = [cuts[k], cuts[k + 1]];
      const lo = [height(opening, s0), height(opening, s1)], hi = [height(outer, s0), height(outer, s1)];
      const mid = [0, 1].map(j => Math.min(lo[j] + band, hi[j]));
      quad('e', at([s0, lo[0]], e), at([s1, lo[1]], e), at([s1, mid[1]], e), at([s0, mid[0]], e));
      quad('t', at([s0, mid[0]], e), at([s1, mid[1]], e), at([s1, hi[1]], e), at([s0, hi[0]], e));
    }
  }
  return { I, skin };
}
