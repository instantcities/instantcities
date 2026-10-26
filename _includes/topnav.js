// On narrow screens the hamburger menu closes again on a click outside it, or on Escape.
    const topBar = document.querySelector('.top');
    const burger = document.querySelector('[data-burger]');
    const setMenu = open => { topBar.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open); };
    burger.addEventListener('click', () => setMenu(!topBar.classList.contains('menu-open')));
    document.addEventListener('click', e => {
      if (!burger.contains(e.target) && !document.getElementById('menu').contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && topBar.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
    });
    // Once the page is scrolled the bar casts a light shadow. Over a live hero it is see-through at
    // the top and fills in white (--solid, 0 to 1) by the time the hero has scrolled away under it.
    const liveHero = document.querySelector('.over-live .live-hero');
    const onScroll = () => {
      topBar.classList.toggle('scrolled', scrollY > 4);
      if (!liveHero) return;
      const solid = Math.min(1, scrollY / Math.max(1, liveHero.offsetHeight - topBar.offsetHeight));
      topBar.style.setProperty('--solid', solid.toFixed(3));
      topBar.classList.toggle('solid', solid > 0.6);
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    // A language picked in the bar is the one the site's old addresses (/, /about/, ...) send this
    // visitor to from now on (_layouts/lang-redirect.html).
    for (const a of document.querySelectorAll('.langs [data-lang]')) {
      a.addEventListener('click', () => { try { localStorage.setItem('site-lang', a.dataset.lang); } catch {} });
    }
