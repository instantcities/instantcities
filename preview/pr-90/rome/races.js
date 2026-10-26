// The race routes in Rome. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'romacentro',
    name: { nl: 'Roma Centro', en: 'Rome Centre', fr: 'Centre de Rome', es: 'Centro de Roma' },
    blurb: {
      nl: 'Van de Piazza Venezia over de Via del Corso naar de zuil op de Piazza Colonna, langs het Pantheon en terug via Largo di Torre Argentina.',
      en: 'From Piazza Venezia up the Via del Corso to the column on Piazza Colonna, past the Pantheon and back by Largo di Torre Argentina.',
      fr: 'De la Piazza Venezia par la Via del Corso jusqu’à la colonne de la Piazza Colonna, devant le Panthéon et retour par le Largo di Torre Argentina.',
      es: 'De la Piazza Venezia por la Via del Corso hasta la columna de la Piazza Colonna, junto al Panteón y de vuelta por el Largo di Torre Argentina.',
    },
    seed: 9400,
    hw: 3.6,
    bikers: 4,
  },
];
