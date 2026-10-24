// The live tours behind the heroes (_includes/live.html): each iframe goes in once the page has
    // loaded, fades in when the game says it is ready, and pauses while it is scrolled out of sight.
    // Not for someone who asked for less motion, or whose browser saves data: they keep the poster.
    const liveTours = document.querySelectorAll('.live[data-src]');
    if (liveTours.length && !matchMedia('(prefers-reduced-motion: reduce)').matches && !navigator.connection?.saveData) {
      addEventListener('load', () => {
        for (const live of liveTours) {
          const frame = document.createElement('iframe');
          Object.assign(frame, { src: live.dataset.src, tabIndex: -1, title: 'A flight over the city' });
          live.append(frame);
          addEventListener('message', e => {
            if (e.source === frame.contentWindow && e.data?.type === 'instant-cities:ready') live.classList.add('ready');
          });
          new IntersectionObserver(([seen]) => {
            frame.contentWindow?.postMessage({ type: 'instant-cities:watch', on: seen.isIntersecting }, location.origin);
          }).observe(live);
        }
      });
    }
