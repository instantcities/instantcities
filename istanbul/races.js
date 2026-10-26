// The race routes in Istanbul. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'sultanahmet',
    name: { nl: 'Sultanahmet', en: 'Sultanahmet', fr: 'Sultanahmet', es: 'Sultanahmet' },
    blurb: {
      nl: 'Van de Hagia Sophia over de Divan Yolu naar de zuil van Constantijn en de Grote Bazaar, de Ankara Caddesi af naar Sirkeci, en langs het Gülhanepark en de poort van het Topkapıpaleis terug.',
      en: 'From the Hagia Sophia along the Divan Yolu to the Column of Constantine and the Grand Bazaar, down the Ankara Caddesi to Sirkeci, and back past Gülhane Park and the gate of Topkapı Palace.',
      fr: 'De Sainte-Sophie par le Divan Yolu jusqu’à la colonne de Constantin et le Grand Bazar, en descendant l’Ankara Caddesi jusqu’à Sirkeci, et retour par le parc de Gülhane et la porte du palais de Topkapı.',
      es: 'De Santa Sofía por el Divan Yolu hasta la columna de Constantino y el Gran Bazar, bajando la Ankara Caddesi hasta Sirkeci, y de vuelta junto al parque Gülhane y la puerta del palacio de Topkapı.',
    },
    seed: 15300,
    hw: 3.4,
    bikers: 4,
  },
];
