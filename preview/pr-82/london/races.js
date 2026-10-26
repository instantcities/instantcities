// The race routes in London. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'westminster',
    name: { nl: 'Westminster', en: 'Westminster', fr: 'Westminster', es: 'Westminster' },
    blurb: {
      nl: 'Van Charing Cross over Whitehall langs Downing Street naar Parliament Square en de Big Ben, en langs de Theems over de Victoria Embankment terug.',
      en: 'From Charing Cross down Whitehall past Downing Street to Parliament Square and Big Ben, and back along the Thames on the Victoria Embankment.',
      fr: 'De Charing Cross par Whitehall devant Downing Street jusqu’à Parliament Square et Big Ben, et retour le long de la Tamise par le Victoria Embankment.',
      es: 'De Charing Cross por Whitehall junto a Downing Street hasta Parliament Square y el Big Ben, y de vuelta junto al Támesis por el Victoria Embankment.',
    },
    seed: 9900,
    hw: 4.5,
    bikers: 4,
  },
];
