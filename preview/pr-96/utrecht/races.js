// The race routes in Utrecht. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'utrecht',
    name: { nl: 'Rond de Dom', en: 'Round the Dom', fr: 'Autour du Dom', es: 'Alrededor del Dom' },
    blurb: {
      nl: 'Van het Janskerkhof over de Drift en langs de Kromme Nieuwegracht, voorbij de Pieterskerk en het Paushuize, over het Domplein onder de Domtoren door en langs de Vismarkt aan de Oudegracht terug.',
      en: 'From the Janskerkhof along the Drift and the Kromme Nieuwegracht, past the Pieterskerk and the Paushuize, across the Domplein below the Dom Tower and back along the Vismarkt by the Oudegracht.',
      fr: 'Du Janskerkhof par la Drift et le long de la Kromme Nieuwegracht, devant la Pieterskerk et le Paushuize, par le Domplein au pied de la tour du Dom et retour par le Vismarkt au bord de l’Oudegracht.',
      es: 'Desde el Janskerkhof por la Drift y a lo largo de la Kromme Nieuwegracht, junto a la Pieterskerk y el Paushuize, por el Domplein al pie de la torre del Dom y de vuelta por el Vismarkt junto al Oudegracht.',
    },
    seed: 12500,
    hw: 3.4,
    bikers: 4,
  },
];
