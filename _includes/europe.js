// On a narrow screen the map of Europe (_includes/europe.html) is wider than the page and scrolls
    // sideways: start it with the cities in the middle of the view.
    for (const map of document.querySelectorAll('[data-europe]')) map.scrollLeft = (map.scrollWidth - map.clientWidth) * 0.55;
