// The race routes in Florence. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'firenze',
    name: { nl: 'Duomo en Ponte Vecchio', en: 'Duomo and Ponte Vecchio', fr: 'Duomo et Ponte Vecchio', es: 'Duomo y Ponte Vecchio' },
    blurb: {
      nl: 'Van de Duomo over de Via dei Calzaiuoli naar de Piazza della Signoria, naar de Ponte Vecchio, langs de Arno en via Santa Trinita terug naar het Baptisterium.',
      en: 'From the Duomo down the Via dei Calzaiuoli to Piazza della Signoria, on to the Ponte Vecchio, along the Arno and back by Santa Trinita to the Baptistery.',
      fr: 'Du Duomo par la Via dei Calzaiuoli jusqu’à la Piazza della Signoria, puis au Ponte Vecchio, le long de l’Arno et retour par Santa Trinita jusqu’au baptistère.',
      es: 'Del Duomo por la Via dei Calzaiuoli hasta la Piazza della Signoria, luego al Ponte Vecchio, junto al Arno y de vuelta por Santa Trinita hasta el baptisterio.',
    },
    seed: 10300,
    hw: 3.6,
    bikers: 4,
  },
];
