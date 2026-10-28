// The race routes in Copenhagen. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'stroget',
    name: { nl: 'Nyhavn en Strøget', en: 'Nyhavn and Strøget', fr: 'Nyhavn et Strøget', es: 'Nyhavn y Strøget' },
    blurb: {
      nl: 'Van Kongens Nytorv langs Nyhavn, over Slotsholmen langs Børsen en Christiansborg naar het Raadhuisplein, en over de Strøget terug.',
      en: 'From Kongens Nytorv along Nyhavn, over Slotsholmen past Børsen and Christiansborg to the City Hall Square, and back along the Strøget.',
      fr: 'De Kongens Nytorv le long de Nyhavn, par Slotsholmen devant Børsen et Christiansborg jusqu’à la place de l’Hôtel de Ville, et retour par le Strøget.',
      es: 'De Kongens Nytorv junto a Nyhavn, por Slotsholmen junto a Børsen y Christiansborg hasta la plaza del Ayuntamiento, y de vuelta por el Strøget.',
    },
    seed: 10600,
    hw: 4,
    bikers: 6,
  },
];
