#!/usr/bin/env node
// Turn a built site (_site) into a pull request's preview, served from a folder of the gh-pages
// branch (/preview/pr-<n>/) instead of the root (.github/workflows/preview.yml runs it).
// node tools/preview.mjs <site dir> <base, e.g. /preview/pr-12> [<production site dir>]
// The site links with paths from the root (/core/..., /ghent/play/), so every such path in the
// pages, scripts and styles is moved under the base. With the production site at hand, the files
// under assets/ that the pull request leaves as they are drop out of the preview (most of the
// site's weight), and their links keep pointing at production; so do the big files elsewhere that
// it leaves as they are and that are only ever named by a plain path (the cities' map.js).
import fs from 'node:fs';
import path from 'node:path';
const [site, base, prod] = process.argv.slice(2);
if (!site || !/^\/[\w./-]+[^/]$/.test(base || '')) throw new Error('usage: node tools/preview.mjs <site dir> <base, e.g. /preview/pr-12> [<production site dir>]');

// The domain is production's; left in a preview, it would outlive the preview (the deploy action
// never deletes a CNAME), so the folder would stay behind after the PR closes.
fs.rmSync(path.join(site, 'CNAME'), { force: true });

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);

let dropped = 0;
if (prod && fs.existsSync(path.join(prod, 'assets'))) {
  for (const file of walk(path.join(site, 'assets'))) {
    const there = path.join(prod, path.relative(site, file));
    if (fs.existsSync(there) && fs.readFileSync(there).equals(fs.readFileSync(file))) { fs.rmSync(file); dropped++; }
  }
  const prune = dir => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) prune(path.join(dir, e.name)); if (!fs.readdirSync(dir).length) fs.rmdirSync(dir); };
  if (fs.existsSync(path.join(site, 'assets'))) prune(path.join(site, 'assets'));
}

// Outside assets/ too, a big file the pull request leaves as it is (a city's map.js, the tour's music)
// drops out when it has no links of its own (no import, fetch or URL in it) and every mention of its
// name in the preview's pages and scripts is a path to a file ('./map.js', '../sounds/x.mp3',
// '/ghent/map.js'): those that lead to it then lead to production's copy. A name also written some
// other way (built from a variable, say) keeps every file of that name in the preview.
const TEXT = ['.html', '.js', '.mjs', '.css', '.json', '.webmanifest'];
const REF = /(["'`(])((?:\.{1,2}\/)+[^"'`)\s<>]*|\/(?![/\s])[^"'`)\s<>]*)/g;
const rel = f => path.relative(site, f).split(path.sep).join('/');
const target = (file, ref) => {
  const clean = ref.split(/[?#]/)[0];
  return clean.startsWith('/') ? clean.slice(1) : rel(path.resolve(path.dirname(file), clean));
};
const away = new Set();
if (prod && fs.existsSync(prod)) {
  const all = walk(site), names = new Set(all.map(rel)), texts = all.filter(f => TEXT.includes(path.extname(f)));
  // the candidates: big, the same as production's, and with no links of their own
  const big = all.filter(f => {
    const r = rel(f), there = path.join(prod, r), ext = path.extname(f);
    if (r.startsWith('assets/') || fs.statSync(f).size < 100000 || (TEXT.includes(ext) && ext !== '.js')) return false;
    if (!fs.existsSync(there) || !fs.readFileSync(there).equals(fs.readFileSync(f))) return false;
    return ext !== '.js' || !/\bimport\b|\bfetch\(|new URL\(|importScripts/.test(fs.readFileSync(f, 'utf8'));
  });
  // their names, where a text file mentions one other than inside a path to a file of the site or a comment
  const wanted = new Set(big.map(f => path.basename(f))), loose = new Set();
  for (const f of texts) {
    const body = fs.readFileSync(f, 'utf8');
    const here = [...wanted].filter(n => body.includes(n));
    if (!here.length) continue;
    // the paths in it, and its comments (a name mentioned in a comment is no link)
    const spans = [...body.matchAll(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|(?<![:"'`\\])\/\/[^\n]*/g)].map(m => [m.index, m.index + m[0].length]);
    for (const m of body.matchAll(REF)) if (names.has(target(f, m[2]))) spans.push([m.index, m.index + m[0].length]);
    for (const n of here) for (let i = body.indexOf(n); i >= 0; i = body.indexOf(n, i + 1)) {
      if (!spans.some(([x, y]) => i >= x && i + n.length <= y)) loose.add(n);
    }
  }
  for (const f of big) if (!loose.has(path.basename(f))) away.add(rel(f));
  for (const f of texts) {
    const before = fs.readFileSync(f, 'utf8');
    const text = before.replace(REF, (m, q, ref) => away.has(target(f, ref)) ? `${q}/${target(f, ref)}${ref.slice(ref.split(/[?#]/)[0].length)}` : m);
    if (text !== before) fs.writeFileSync(f, text);
  }
  for (const r of away) { dropped++; fs.rmSync(path.join(site, r)); }
}

// A path moves under the base when its first folder is in the preview; under assets/ only when that
// very file is (the rest stays on production, also a folder that a script adds a file name to), and
// never to a file left to production above.
const tops = new Set(fs.readdirSync(site));
const moves = rest => {
  if (rest.startsWith('${')) return true; // `/${city.id}/play/`
  if (away.has(rest.split(/[?#]/)[0])) return false;
  const top = rest.split(/[/?#]/)[0];
  if (top === 'assets') return fs.statSync(path.join(site, rest.split(/[?#]/)[0]), { throwIfNoEntry: false })?.isFile() ?? false;
  return tops.has(top);
};
let rewritten = 0;
for (const file of walk(site)) {
  const ext = path.extname(file);
  if (!['.html', '.js', '.mjs', '.css', '.json', '.webmanifest'].includes(ext)) continue;
  const before = fs.readFileSync(file, 'utf8');
  let text = before.replace(/(["'`(])\/(?![/\s])([^"'`)\s<>]*)/g, (m, q, rest) => moves(rest) ? `${q}${base}/${rest}` : m);
  // A relative path into assets/ (new URL('../../../assets/img/art/', import.meta.url)) goes to
  // production when the preview does not have that file.
  text = text.replace(/(["'`(])((?:\.\.\/)+)(assets\/[^"'`)\s<>]*)/g, (m, q, up, rest) =>
    path.resolve(path.dirname(file), up) === path.resolve(site) && !moves(rest) ? `${q}/${rest}` : m);
  if (ext === '.html') {
    // The home page: href="/", href="/#cities"
    text = text.replace(/((?:href|action)=["'])\/(?=["'#?])/g, `$1${base}/`);
    // <meta http-equiv="refresh" content="0; url=/en/">
    text = text.replace(/(content=["']\d+;\s*url=)\/(?!\/)([^"'\s]*)/gi, (m, pre, rest) => moves(rest) || !rest ? `${pre}${base}/${rest}` : m);
    // Search engines leave previews alone.
    text = text.replace(/<head(\s[^>]*)?>/i, h => `${h}\n<meta name="robots" content="noindex, nofollow">`);
  }
  if (text !== before) { fs.writeFileSync(file, text); rewritten++; }
}
console.log(`${base}: ${rewritten} files rewritten, ${dropped} unchanged files left to production`);
