// The places list (places.html): every shop, café and restaurant the game puts in a building, from
// the city's places.json (tools/places.mjs, one folder up from the page), by the kind of shop front
// the game draws for it, with what OpenStreetMap calls it and its address.
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"]/g, c => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[c]};`);

// the game's kinds (tools/osmbuild.mjs, SHOP_KINDS), in the order the list shows them
const KINDS = {
  restaurant: '🍽️ Restaurants', cafe: '🍺 Cafés and bars', snack: '🍟 Snack bars and ice cream', bakery: '🥐 Bakeries',
  grocer: '🛒 Groceries and supermarkets', pharmacy: '💊 Pharmacies', hair: '💇 Hairdressers and beauty', clothes: '👕 Clothes and shoes',
  florist: '💐 Florists', books: '📚 Books', shop: '🏪 Other shops',
};

const data = await fetch('../places.json').then(r => (r.ok ? r.json() : null)).catch(() => null);
if (!data) {
  $('main').innerHTML = '<p>No places.json for this city yet: <code>node tools/places.mjs &lt;city&gt;</code> (needs the map download in tools/cache/).</p>';
} else {
  const places = data.places.map(([kind, name, type, addr, x, z]) => ({ kind, name, type: type.replace(/_/g, ' '), addr, x, z }));
  const count = Object.fromEntries(Object.keys(KINDS).map(k => [k, places.filter(p => p.kind === k).length]));
  let pick = null;

  $('kinds').innerHTML = `<button class="f on" data-kind="">All places <small>${places.length}</small></button>`
    + Object.keys(KINDS).filter(k => count[k]).map(k => `<button class="f" data-kind="${k}">${KINDS[k]} <small>${count[k]}</small></button>`).join('');
  for (const b of document.querySelectorAll('#kinds button')) {
    b.onclick = () => {
      pick = b.dataset.kind || null;
      document.querySelectorAll('#kinds button').forEach(o => o.classList.toggle('on', o === b));
      draw();
    };
  }
  $('q').oninput = draw;

  function draw() {
    const q = $('q').value.trim().toLowerCase();
    const shown = places.filter(p => (!pick || p.kind === pick) && (!q || `${p.name} ${p.type} ${p.addr}`.toLowerCase().includes(q)));
    $('main').innerHTML = Object.keys(KINDS).map(k => {
      const list = shown.filter(p => p.kind === k);
      if (!list.length) return '';
      return `<h2>${KINDS[k]}</h2><div class="meta">${list.length} of ${count[k]}</div><table><tr><th>name</th><th>type</th><th>address</th></tr>`
        + list.map(p => `<tr><td>${p.name ? esc(p.name) : '<span class="none">no name</span>'}</td><td class="type">${esc(p.type)}</td>`
          + `<td title="game x ${p.x}, z ${p.z}">${p.addr ? esc(p.addr) : '<span class="none">unknown</span>'}</td></tr>`).join('')
        + '</table>';
    }).join('') || '<p>Nothing matches.</p>';
  }
  draw();
}
