// The race routes in San Francisco. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'sanfrancisco',
    name: { nl: 'Van Chinatown naar de baai', en: 'Chinatown to the Bay', fr: 'De Chinatown à la baie', es: 'De Chinatown a la bahía' },
    blurb: {
      nl: 'Grant Avenue af door Chinatown tot aan de Dragon Gate, Bush Street langs de torens van het Financial District, Market Street af naar het Ferry Building, langs de baai over de Embarcadero en via Washington Street, langs de Transamerica Pyramid en Portsmouth Square, terug naar Chinatown.',
      en: 'Down Grant Avenue through Chinatown to the Dragon Gate, along Bush Street between the towers of the Financial District, down Market Street to the Ferry Building, along the bay on the Embarcadero and back along Washington Street, past the Transamerica Pyramid and Portsmouth Square, into Chinatown.',
      fr: 'Grant Avenue à travers Chinatown jusqu’à la Dragon Gate, Bush Street entre les tours du Financial District, Market Street jusqu’au Ferry Building, le long de la baie sur l’Embarcadero et retour par Washington Street, devant la Transamerica Pyramid et Portsmouth Square, vers Chinatown.',
      es: 'Por Grant Avenue a través de Chinatown hasta la Dragon Gate, por Bush Street entre las torres del Financial District, bajando Market Street hasta el Ferry Building, junto a la bahía por el Embarcadero y de vuelta por Washington Street, junto a la Transamerica Pyramid y Portsmouth Square, hasta Chinatown.',
    },
    seed: 17000,
    hw: 4.5,
    bikers: 4,
  },
];
