// The map of a city's centre (_includes/city-map.html): pointing at a place in the list lights up its
// pin and its street on the map, and the other way round.
document.querySelectorAll('.citymap').forEach(map => {
  const light = (id, on) => map.querySelectorAll(`[data-place="${id}"]`).forEach(el => el.classList.toggle('hot', on));
  map.querySelectorAll('[data-place]').forEach(el => {
    el.addEventListener('mouseenter', () => light(el.dataset.place, true));
    el.addEventListener('mouseleave', () => light(el.dataset.place, false));
  });
});
