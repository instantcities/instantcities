// The race routes in Rotterdam. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'rotterdam',
    name: { nl: 'Blaak en Markthal', en: 'Blaak and Markthal', fr: 'Blaak et Markthal', es: 'Blaak y Markthal' },
    blurb: {
      nl: 'Over de Coolsingel naar het Churchillplein, de Blaak af langs de Markthal naar de kubuswoningen, de Binnenrotte op en over de Hoogstraat langs de Laurenskerk terug naar de Beurs.',
      en: 'Down the Coolsingel to the Churchillplein, along the Blaak past the Markthal to the cube houses, up the Binnenrotte and back along the Hoogstraat past the Laurenskerk to the Beurs.',
      fr: 'Par le Coolsingel jusqu’au Churchillplein, le long du Blaak devant le Markthal jusqu’aux maisons cubiques, par la Binnenrotte et retour par la Hoogstraat devant la Laurenskerk jusqu’à la Bourse.',
      es: 'Por el Coolsingel hasta el Churchillplein, a lo largo del Blaak junto al Markthal hasta las casas cubo, por la Binnenrotte y de vuelta por la Hoogstraat junto a la Laurenskerk hasta la Bolsa.',
    },
    seed: 13000,
    hw: 4.2,
    bikers: 4,
  },
];
