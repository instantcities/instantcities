// The race route at Pompeii. It runs along the real streets of the route in area.json (same id), in
// riding order, and closes on the first street. seed: the dice for the items and obstacles on it;
// anything else is passed to realTrack (js/realtrack.js). hw: half the street's width, as in area.json.
export const RACES = [
  {
    id: 'abbondanza',
    name: { nl: 'Via dell’Abbondanza', en: 'Via dell’Abbondanza', fr: 'Via dell’Abbondanza', es: 'Via dell’Abbondanza' },
    blurb: {
      nl: 'Over de lange hoofdstraat van Pompeii, langs de Stabiaanse thermen, dan de Via Stabiana en de Via della Fortuna naar het Forum en terug.',
      en: 'Along the long main street of Pompeii, past the Stabian Baths, then up the Via Stabiana and the Via della Fortuna to the Forum and back.',
      fr: 'Le long de la grande rue de Pompéi, devant les thermes de Stabies, puis par la Via Stabiana et la Via della Fortuna jusqu’au Forum et retour.',
      es: 'Por la larga calle principal de Pompeya, junto a las termas de Estabia, y luego por la Via Stabiana y la Via della Fortuna hasta el Foro y de vuelta.',
    },
    seed: 7300,
    hw: 3.2,
    bikers: 0,
    theme: { pavement: 1.2, lampEvery: 1e9 }, // no street lamps
  },
];
