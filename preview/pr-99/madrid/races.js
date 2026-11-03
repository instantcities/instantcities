// The race routes in Madrid. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'sol',
    name: { nl: 'Sol en Oriente', en: 'Sol and Oriente', fr: 'Sol et Oriente', es: 'Sol y Oriente' },
    blurb: {
      nl: 'Van de Puerta del Sol over de Calle Mayor naar het Koninklijk Paleis, over de Plaza de Oriente, langs Santo Domingo naar Callao en de Calle del Carmen terug.',
      en: 'From the Puerta del Sol along the Calle Mayor to the Royal Palace, across the Plaza de Oriente, past Santo Domingo to Callao and back down the Calle del Carmen.',
      fr: 'De la Puerta del Sol par la Calle Mayor jusqu’au Palais royal, par la Plaza de Oriente, devant Santo Domingo jusqu’à Callao et retour par la Calle del Carmen.',
      es: 'De la Puerta del Sol por la Calle Mayor hasta el Palacio Real, por la Plaza de Oriente, junto a Santo Domingo hasta Callao y de vuelta por la Calle del Carmen.',
    },
    seed: 10900,
    hw: 4,
    bikers: 5,
  },
];
