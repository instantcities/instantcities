// The race routes in Berlin. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'mitte',
    name: { nl: 'Mitte', en: 'Mitte', fr: 'Mitte', es: 'Mitte' },
    blurb: {
      nl: 'Over Unter den Linden naar de Gendarmenmarkt, door de straten van Mitte naar het Holocaustmonument en over de Wilhelmstraße terug naar Unter den Linden.',
      en: 'Along Unter den Linden to the Gendarmenmarkt, through the streets of Mitte to the Holocaust Memorial and up the Wilhelmstraße back to Unter den Linden.',
      fr: 'Par Unter den Linden jusqu’au Gendarmenmarkt, à travers les rues de Mitte jusqu’au mémorial de l’Holocauste et retour par la Wilhelmstraße.',
      es: 'Por Unter den Linden hasta el Gendarmenmarkt, por las calles de Mitte hasta el Monumento al Holocausto y de vuelta por la Wilhelmstraße.',
    },
    seed: 10700,
    hw: 4.5,
    bikers: 5,
  },
];
