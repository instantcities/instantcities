// The race routes in Venice. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'mercerie',
    name: { nl: 'San Marco → Rialto', en: 'San Marco → Rialto', fr: 'San Marco → Rialto', es: 'San Marco → Rialto' },
    blurb: {
      nl: 'Van het Piazza San Marco onder de klokkentoren door, door de smalle winkelstraatjes van de Mercerie naar de Rialtobrug.',
      en: 'From Piazza San Marco under the clock tower, through the narrow shopping lanes of the Mercerie to the Rialto bridge.',
      fr: 'De la place Saint-Marc sous la tour de l’Horloge, par les ruelles commerçantes des Mercerie jusqu’au pont du Rialto.',
      es: 'De la Piazza San Marco bajo la torre del reloj, por las estrechas calles comerciales de las Mercerie hasta el puente de Rialto.',
    },
    seed: 9700,
    hw: 2.6,
    bikers: 3,
  },
];
