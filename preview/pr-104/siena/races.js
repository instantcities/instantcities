// The race routes in Siena. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'siena',
    name: { nl: 'Campo en Duomo', en: 'Campo and Duomo', fr: 'Campo et Duomo', es: 'Campo y Duomo' },
    blurb: {
      nl: 'Over de Banchi di Sopra naar de Loggia della Mercanzia, de Piazza del Campo op onder de Torre del Mangia, de Casato omhoog naar de Duomo en langs het Baptisterium en de Via delle Terme terug.',
      en: 'Down Banchi di Sopra to the Loggia della Mercanzia, into the Piazza del Campo below the Torre del Mangia, up the Casato to the Duomo and back past the Baptistery along Via delle Terme.',
      fr: 'Par les Banchi di Sopra jusqu’à la Loggia della Mercanzia, sur la Piazza del Campo au pied de la Torre del Mangia, par le Casato jusqu’au Duomo et retour devant le baptistère par la Via delle Terme.',
      es: 'Por Banchi di Sopra hasta la Loggia della Mercanzia, a la Piazza del Campo al pie de la Torre del Mangia, subiendo el Casato hasta el Duomo y de vuelta junto al baptisterio por la Via delle Terme.',
    },
    seed: 11500,
    hw: 3.2,
    bikers: 4,
  },
];
