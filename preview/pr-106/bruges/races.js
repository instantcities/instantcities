// The race routes in Bruges. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'brugge',
    name: { nl: 'Markt en Dijver', en: 'Markt and Dijver', fr: 'Markt et Dijver', es: 'Markt y Dijver' },
    blurb: {
      nl: 'Van de Markt onder het Belfort naar de Rozenhoedkaai, langs de Dijver en het Gruuthuse naar de Onze-Lieve-Vrouwekerk en over de Steenstraat terug.',
      en: 'From the Markt under the Belfry to the Rozenhoedkaai, along the Dijver past the Gruuthuse to the Church of Our Lady, and back up the Steenstraat.',
      fr: 'Du Markt sous le beffroi jusqu’au Rozenhoedkaai, le long du Dijver devant le Gruuthuse jusqu’à l’église Notre-Dame, et retour par la Steenstraat.',
      es: 'Del Markt bajo el campanario hasta el Rozenhoedkaai, por el Dijver junto al Gruuthuse hasta la iglesia de Nuestra Señora, y de vuelta por la Steenstraat.',
    },
    seed: 10000,
    hw: 3.6,
    bikers: 4,
  },
];
