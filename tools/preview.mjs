#!/usr/bin/env node
// Turn a built site (_site) into a pull request's preview, served from a folder of the gh-pages
// branch (/preview/pr-<n>/) instead of the root (.github/workflows/preview.yml runs it).
// node tools/preview.mjs <site dir> <base, e.g. /preview/pr-12> [<production site dir>]
// The site links with paths from the root (/core/..., /ghent/play/), so every such path in the
// pages, scripts and styles is moved under the base. With the production site at hand, the files
// under assets/ that the pull request leaves as they are drop out of the preview (most of the
// site's weight), and their links keep pointing at production.
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

// A path moves under the base when its first folder is in the preview; under assets/ only when that
// very file is (the rest stays on production).
const tops = new Set(fs.readdirSync(site));
const moves = rest => {
  if (rest.startsWith('${')) return true; // `/${city.id}/play/`
  const top = rest.split(/[/?#]/)[0];
  if (top === 'assets') return fs.existsSync(path.join(site, rest.split(/[?#]/)[0]));
  return tops.has(top);
};
let rewritten = 0;
for (const file of walk(site)) {
  const ext = path.extname(file);
  if (!['.html', '.js', '.mjs', '.css', '.json', '.webmanifest'].includes(ext)) continue;
  const before = fs.readFileSync(file, 'utf8');
  let text = before.replace(/(["'`(])\/(?![/\s])([^"'`)\s<>]*)/g, (m, q, rest) => moves(rest) ? `${q}${base}/${rest}` : m);
  if (ext === '.html') {
    // The home page: href="/", href="/#cities"
    text = text.replace(/((?:href|action)=["'])\/(?=["'#?])/g, `$1${base}/`);
    // Search engines leave previews alone.
    text = text.replace(/<head(\s[^>]*)?>/i, h => `${h}\n<meta name="robots" content="noindex, nofollow">`);
  }
  if (text !== before) { fs.writeFileSync(file, text); rewritten++; }
}
console.log(`${base}: ${rewritten} files rewritten, ${dropped} unchanged assets left to production`);
