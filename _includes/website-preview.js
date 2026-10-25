// One decoded video at a time; the browser caches the compiled clips on subsequent loops.
{
  const host = document.querySelector('.website-preview');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (host && !motion.matches && !navigator.connection?.saveData) {
    const playlist = JSON.parse(host.querySelector('.preview-playlist').textContent);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'none';
    video.tabIndex = -1;
    host.append(video);
    let index = 0, visible = false, started = false, failures = 0, stopped = false;
    const hero = host.closest('.hero');
    const caption = hero.querySelector('.live-caption');
    const watch = hero.querySelector('.watch');
    function active() { return visible && !document.hidden && !motion.matches && !stopped; }
    function play() {
      if (active()) video.play().catch(() => { host.classList.remove('ready'); });
      else video.pause();
    }
    function load() {
      host.classList.remove('ready');
      const city = playlist[index];
      host.querySelector('.poster').src = `/assets/previews/${city.id}.jpg`;
      caption.textContent = `Preview: ${city.name}`;
      caption.href = `/${city.id}/`;
      watch.href = `/${city.id}/play/?watch=cards`;
      video.src = city.src;
      video.load();
      play();
    }
    video.addEventListener('playing', () => {
      failures = 0;
      const city = playlist[index];
      caption.textContent = `Preview: ${city.name}`;
      caption.href = `/${city.id}/`;
      watch.href = `/${city.id}/play/?watch=cards`;
      host.classList.add('ready');
    });
    function next() {
      index = (index + 1) % playlist.length;
      load();
    }
    video.addEventListener('ended', next);
    // Also cap a mistakenly overlong replacement asset at 20 seconds.
    video.addEventListener('timeupdate', () => { if (video.currentTime >= 20) next(); });
    video.addEventListener('error', () => {
      if (++failures < playlist.length) next();
      else { stopped = true; host.classList.remove('ready'); video.removeAttribute('src'); video.load(); }
    });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!started && active()) { started = true; load(); }
      else play();
    }).observe(host);
    document.addEventListener('visibilitychange', play);
    motion.addEventListener('change', () => {
      if (motion.matches) host.classList.remove('ready');
      play();
    });
  }
}
