// The bar of a page's sections (.subnav, under the hero of a city's pages): it sticks under the top
// bar, and the link of the section in view is marked (and scrolled into sight on a narrow screen).
const subnav = document.querySelector('.subnav');
if (subnav) {
  const links = [...subnav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
  // right under the top bar, however tall it is on this screen
  const fit = () => { subnav.style.top = document.querySelector('.top').offsetHeight + 'px'; };
  addEventListener('resize', fit); fit();
  const mark = () => {
    const line = subnav.getBoundingClientRect().bottom + 40;
    let current = null;
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
    for (const a of links) {
      const on = current && a.hash === '#' + current.id;
      if (on && !a.hasAttribute('aria-current')) a.parentElement.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
      on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
    }
    subnav.classList.toggle('stuck', subnav.getBoundingClientRect().top <= document.querySelector('.top').offsetHeight + 1);
  };
  addEventListener('scroll', mark, { passive: true }); mark();
}
