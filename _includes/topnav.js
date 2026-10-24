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
    // Once the page is scrolled the bar casts a light shadow.
    const onScroll = () => topBar.classList.toggle('scrolled', scrollY > 4);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
