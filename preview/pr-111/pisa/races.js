// The race routes in Pisa. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'pisa',
    name: { nl: 'Toren en Arno', en: 'Tower and Arno', fr: 'Tour et Arno', es: 'Torre y Arno' },
    blurb: {
      nl: 'Over de Via Roma naar de scheve toren op de Piazza dei Miracoli, door de Via Santa Maria naar de Arno, over de Ponte di Mezzo, langs Santa Maria della Spina en over de Ponte Solferino terug.',
      en: 'Up Via Roma to the Leaning Tower on the Piazza dei Miracoli, down Via Santa Maria to the Arno, across the Ponte di Mezzo, past Santa Maria della Spina and back over the Ponte Solferino.',
      fr: 'Par la Via Roma jusqu’à la tour penchée sur la Piazza dei Miracoli, la Via Santa Maria jusqu’à l’Arno, le Ponte di Mezzo, devant Santa Maria della Spina et retour par le Ponte Solferino.',
      es: 'Por la Via Roma hasta la torre inclinada en la Piazza dei Miracoli, por la Via Santa Maria hasta el Arno, cruzando el Ponte di Mezzo, junto a Santa Maria della Spina y de vuelta por el Ponte Solferino.',
    },
    seed: 12000,
    hw: 3.2,
    bikers: 4,
  },
];
