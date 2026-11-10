// The facade lab (facade-lab.html): a street's fronts from tools/street.mjs, each with its Mapillary
// photos and, next to them, its drawing from the spec in the city's streets.js (ghent/streets.js). Edit the spec in
// the box and the drawing follows; copy it into streets.js when it looks like the photos.
import { elevation, shade } from './facades.js';
import { outline, rowParts } from './fronts.js';
import { drawSpec, defaultSpec } from './facade-spec.js';
import { ID, STREETS } from './city.js';

// the page is in the city's play/ folder: its spots.json is one folder up, the photos in tools/
const BASE = `../../tools/streets/${ID}`, FLOOR = 3.4;
const $ = id => document.getElementById(id);
let street = null, current = null;

// the top spots of spots.json; the ones tools/street.mjs has fetched are in index.json
const spots = (await fetch('../spots.json').then(r => r.json()).catch(() => ({ spots: [] }))).spots;
const index = await fetch(`${BASE}/index.json`).then(r => r.ok ? r.json() : []).catch(() => []);
const ids = [...spots.map(s => s.id), ...index.filter(i => !spots.some(s => s.id === i))];
$('street').innerHTML = ids.map(id => `<option value="${id}">${index.includes(id) ? '' : '(not fetched) '}${spots.find(s => s.id === id)?.name ?? id}</option>`).join('');
$('street').onchange = () => load($('street').value);
$('listBtn').onclick = () => list();
if (ids.length) { $('street').value = index.includes('korenmarkt') ? 'korenmarkt' : index[0] ?? ids[0]; load($('street').value); }

async function load(slug) {
  const res = await fetch(`${BASE}/${slug}/street.json`);
  if (!res.ok) { $('fronts').innerHTML = ''; $('main').innerHTML = `<p>Not fetched yet: <code>node tools/street.mjs ghent ${slug}</code> (needs MAPILLARY_TOKEN).</p>`; return; }
  street = await res.json();
  street.specs = new Map((STREETS?.[slug] ?? []).map(s => [s.id, s]));
  $('fronts').innerHTML = '';
  for (const f of street.fronts) {
    const b = document.createElement('button');
    b.className = 'f';
    b.innerHTML = `${f.id.replace(slug + '-', '')} <small>${f.width} m, ${f.floors ?? '?'} fl., ${f.photos.length} 📷</small><span class="tick">${street.specs.has(f.id) ? '✓' : ''}</span>`;
    b.onclick = () => show(f, b);
    f.btn = b;
    $('fronts').append(b);
  }
  list();
}

// every front of the street: its size, the photos found, and whether its spec is written yet
function list() {
  for (const b of document.querySelectorAll('nav button.f')) b.classList.remove('on');
  const done = street.fronts.filter(f => street.specs.has(f.id)).length, shot = street.fronts.filter(f => f.photos.length).length, n = Object.keys(street.photos).length;
  $('main').innerHTML = `<h2>${street.street}</h2><div class="meta">${street.fronts.length} fronts · ${shot} with photos (${n} different) · ${done} drawn from a spec</div><table><tr><th>front</th><th>width</th><th>floors</th><th>photos</th><th>spec</th></tr>${street.fronts.map(f => `<tr class="go" data-id="${f.id}"><td>${f.id}</td><td>${f.width} m</td><td>${f.floors ?? '?'}</td><td>${f.photos.length}</td><td>${street.specs.has(f.id) ? '✓' : f.photos.length ? 'to do' : 'no photo'}</td></tr>`).join('')}</table>`;
  for (const tr of document.querySelectorAll('tr.go')) tr.onclick = () => { const f = street.fronts.find(x => x.id === tr.dataset.id); show(f, f.btn); };
}

function show(f, btn) {
  current = f;
  for (const b of document.querySelectorAll('nav button.f')) b.classList.toggle('on', b === btn);
  const spec = street.specs.get(f.id) ?? defaultSpec(f);
  const eaves = f.eaves ?? (f.floors ?? 3) * FLOOR + 0.4;
  $('main').innerHTML = `
    <h2>${f.id}</h2>
    <div class="meta">${f.width} m wide · ${f.floors ?? '?'} floors · eaves ${eaves.toFixed(1)} m · faces ${f.faces}° · ${f.latLon.join(', ')} · ${street.specs.has(f.id) ? 'spec from streets.js' : 'default spec (nothing drawn yet)'}</div>
    <div class="photos">${f.photos.map(p => figure(f, p)).join('') || '<p>No Mapillary photo looks straight at this one.</p>'}</div>
    <div class="row"><div id="draw"></div><div><textarea id="spec" spellcheck="false"></textarea><div class="err" id="err"></div><button class="copy" id="copy">copy</button></div></div>`;
  for (const b of document.querySelectorAll('.photos button[data-id]')) b.onclick = () => { const g = street.fronts.find(x => x.id === b.dataset.id); show(g, g.btn); };
  $('spec').value = JSON.stringify(spec, null, 1).replace(/\n\s+/g, m => m.length > 8 ? m : ' ').replace(/\[\s+/g, '[').replace(/\s+\]/g, ']');
  $('spec').oninput = () => render(f, eaves);
  $('copy').onclick = () => navigator.clipboard.writeText($('spec').value + ',');
  render(f, eaves);
}

// a photo with, along its top, where each front of the street it shows should stand (this one in red).
// Mapillary's compass can be tens of degrees off, which slides them all sideways together: the order
// left to right holds better than the place.
function figure(f, p) {
  const ph = street.photos[p.id], short = g => g.id.replace(street.slug + '-', '');
  const shown = street.fronts.map(g => ({ g, q: g.photos.find(q => q.id === p.id) })).filter(x => x.q).sort((a, b) => a.q.span[0] - b.q.span[0]);
  const marks = shown.map(({ g, q: { span: [u0, u1] } }) => `<div class="span${g === f ? ' on' : ''}" style="left:${u0 * 100}%;width:${(u1 - u0) * 100}%">${short(g)}</div>`).join('');
  const others = shown.filter(x => x.g !== f);
  return `<figure><a href="${ph.page}" target="_blank"><div class="shot"><img src="${BASE}/${street.slug}/${ph.file}">${marks}</div></a>` +
    `<figcaption>${ph.author}, ${ph.date}, ${p.metres} m, CC BY-SA 4.0` +
    (others.length ? `<br>also shows ${others.map(({ g }) => `<button data-id="${g.id}">${short(g)}</button>`).join(' ')}` : '') +
    `</figcaption></figure>`;
}

function render(f, eaves) {
  let spec;
  try { spec = JSON.parse($('spec').value); $('err').textContent = ''; } catch (e) { $('err').textContent = e.message; return; }
  const S = { ...defaultSpec(f), ...spec }, e = S.eaves ?? eaves, w = f.width;
  const gable = S.row ? ['row', S.row] : S.gable;
  const top = S.top ?? (S.row ? e + Math.max(...rowParts(gable, w).map(p => p.rise)) : f.top ?? (S.gable === 'flat' ? e + 2.6 : e + w * 0.75));
  const tex = elevation(w, top, 40, (g, w, h) => {
    g.save();
    // clip to the gable's outline, as the game does
    const pts = outline(gable, w, e, top);
    g.beginPath();
    pts.forEach(([u, y], k) => (k ? g.lineTo(u - w / 2, y) : g.moveTo(u - w / 2, y)));
    g.closePath(); g.clip();
    drawSpec(S)(g, w, h, e);
    g.restore();
  });
  const c = tex.image;
  c.style.width = `${Math.min(c.width, 480)}px`; c.style.height = 'auto';
  $('draw').replaceChildren(c);
}
