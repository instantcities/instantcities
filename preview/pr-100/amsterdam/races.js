// The race routes in Amsterdam. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'grachten',
    name: { nl: 'Dam en Singel', en: 'Dam and Singel', fr: 'Dam et Singel', es: 'Dam y Singel' },
    blurb: {
      nl: 'Van de Dam langs het Paleis naar het Singel, langs de gracht naar het Spui en over het Rokin terug naar de Dam.',
      en: 'From the Dam past the Royal Palace to the Singel, along the canal to the Spui and back up the Rokin to the Dam.',
      fr: 'Du Dam devant le Palais royal jusqu’au Singel, le long du canal jusqu’au Spui et retour par le Rokin.',
      es: 'Del Dam junto al Palacio Real hasta el Singel, a lo largo del canal hasta el Spui y de vuelta por el Rokin.',
    },
    seed: 9600,
    hw: 3.6,
    bikers: 5,
  },
];
