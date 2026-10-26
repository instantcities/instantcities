// Google Analytics, only once the visitor says yes. Every site page and every city's game loads this:
// on the real site a bar at the bottom asks once, the answer stays in this browser (localStorage), and
// only a yes loads Google's tag. The privacy page's button asks again (window.icConsent.ask()).
// Not on localhost or the Netlify previews (add ?consent to the address to see the bar there anyway),
// and not in the game's ?watch tour, which the site's own pages show and count already.
(() => {
  const ID = 'G-GPP2SZPD0E';
  const KEY = 'instantcities.consent';
  const params = new URLSearchParams(location.search);
  const live = location.hostname === 'instantcities.net';
  if (params.has('watch') || !(live || params.has('consent'))) return;

  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, v); } catch {} };

  let loaded = false;
  function load() {
    if (loaded || !live) return;
    loaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.append(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', ID);
  }

  let bar;
  function ask() {
    if (bar) return;
    const css = document.createElement('style');
    css.textContent = `
      .ic-consent { position: fixed; z-index: 2147483000; left: 16px; right: 16px; bottom: 16px; margin: 0 auto; max-width: 560px;
        display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; padding: 14px 16px;
        font: 400 14px/1.45 'Inter', system-ui, -apple-system, sans-serif; color: #111; background: #fff;
        border: 1px solid #e2e2e0; border-radius: 10px; box-shadow: 0 6px 28px rgba(0, 0, 0, .18); }
      .ic-consent p { flex: 1 1 260px; margin: 0; }
      .ic-consent a { color: inherit; text-underline-offset: 3px; }
      .ic-consent div { display: flex; gap: 8px; margin-left: auto; }
      .ic-consent button { font: inherit; font-weight: 600; line-height: 1; padding: 10px 14px; border-radius: 6px; cursor: pointer;
        border: 1px solid #111; background: #fff; color: #111; }
      .ic-consent button.yes { background: #111; color: #fff; }
      .ic-consent button:hover { opacity: .85; }`;
    bar = document.createElement('div');
    bar.className = 'ic-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookies');
    bar.innerHTML = `<p>May Instant Cities count your visit with Google Analytics? It sets cookies.
      <a href="/privacy/#others">More about it</a>.</p>
      <div><button type="button" class="no">No thanks</button><button type="button" class="yes">That's fine</button></div>`;
    const answer = (v) => () => {
      save(v);
      bar.remove(); css.remove(); bar = null;
      if (v === 'yes') load();
      else if (loaded) location.reload(); // a no after a yes: start again without the tag
    };
    // The game listens for keys on the page; a click on the bar is the bar's, not the game's
    bar.addEventListener('pointerdown', (e) => e.stopPropagation());
    bar.addEventListener('keydown', (e) => e.stopPropagation());
    bar.querySelector('.no').addEventListener('click', answer('no'));
    bar.querySelector('.yes').addEventListener('click', answer('yes'));
    document.head.append(css);
    document.body.append(bar);
  }

  window.icConsent = { ask };
  const choice = read();
  if (choice === 'yes') load();
  else if (choice !== 'no') {
    if (document.body) ask();
    else document.addEventListener('DOMContentLoaded', ask);
  }
})();
