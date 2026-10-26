// The race routes in Vienna. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'innerestadt',
    name: { nl: 'Binnenstad en Ring', en: 'Innere Stadt and Ring', fr: 'Centre et Ring', es: 'Centro y Ring' },
    blurb: {
      nl: 'Van de Stephansdom over de Graben naar de Hofburg, over de Ringstraße naar de Staatsopera en langs de Albertina en de Neuer Markt terug.',
      en: 'From the Stephansdom down the Graben to the Hofburg, round the Ringstraße to the State Opera and back past the Albertina and the Neuer Markt.',
      fr: 'De la cathédrale Saint-Étienne par le Graben jusqu’à la Hofburg, par le Ring jusqu’à l’Opéra et retour devant l’Albertina et le Neuer Markt.',
      es: 'De la catedral de San Esteban por el Graben hasta el Hofburg, por el Ring hasta la Ópera y de vuelta junto a la Albertina y el Neuer Markt.',
    },
    seed: 10500,
    hw: 4,
    bikers: 5,
  },
];
