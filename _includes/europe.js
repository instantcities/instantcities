// On a narrow screen the map of Europe (_includes/europe.html) is wider than the page and scrolls
    // sideways: start it with the cities in the middle of the view.
    for (const map of document.querySelectorAll('[data-europe]')) map.scrollLeft = (map.scrollWidth - map.clientWidth) * 0.55;
    // Beside a list of the cities (the home page), pointing at a city in either lights up the other.
    for (const link of document.querySelectorAll('.city-list [data-city], .europe .pin[data-city]')) {
      const light = on => document.querySelectorAll(`[data-city="${link.dataset.city}"]`).forEach(el => el.classList.toggle('lit', on));
      link.addEventListener('pointerenter', () => light(true));
      link.addEventListener('pointerleave', () => light(false));
      link.addEventListener('focus', () => light(true));
      link.addEventListener('blur', () => light(false));
    }
