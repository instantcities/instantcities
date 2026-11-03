// The race routes in Barcelona. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'rambla',
    name: { nl: 'Rambla en Barri Gòtic', en: 'Rambla and Gothic Quarter', fr: 'Rambla et quartier gothique', es: 'Rambla y Barrio Gótico' },
    blurb: {
      nl: 'Van de Plaça de Catalunya de Rambla af tot het standbeeld van Columbus, door de Gotische wijk langs de Plaça de Sant Jaume en de kathedraal en over de Portal de l’Àngel terug.',
      en: 'From Plaça de Catalunya down the Rambla to the Columbus monument, through the Gothic Quarter past Plaça de Sant Jaume and the cathedral, and back up Portal de l’Àngel.',
      fr: 'De la Plaça de Catalunya en descendant la Rambla jusqu’à la statue de Colomb, par le quartier gothique devant la Plaça de Sant Jaume et la cathédrale, et retour par le Portal de l’Àngel.',
      es: 'De la Plaça de Catalunya Rambla abajo hasta el monumento a Colón, por el Barrio Gótico junto a la Plaça de Sant Jaume y la catedral, y de vuelta por el Portal de l’Àngel.',
    },
    seed: 9800,
    hw: 4,
    bikers: 5,
  },
];
