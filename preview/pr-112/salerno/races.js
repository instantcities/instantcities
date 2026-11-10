// The race routes in Salerno. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'salerno',
    name: { nl: 'Duomo en Lungomare', en: 'Duomo and Lungomare', fr: 'Duomo et Lungomare', es: 'Duomo y Lungomare' },
    blurb: {
      nl: 'Van onder de Duomo door de Via dei Mercanti en de Corso Vittorio Emanuele, naar beneden naar de zee, onder de palmen van de Lungomare Trieste en langs de Villa Comunale over de Via Roma terug.',
      en: 'From below the Duomo through Via dei Mercanti and along the Corso Vittorio Emanuele, down to the sea, under the palms of the Lungomare Trieste and back by the Villa Comunale along Via Roma.',
      fr: 'Du pied du Duomo par la Via dei Mercanti et le Corso Vittorio Emanuele, jusqu’à la mer, sous les palmiers du Lungomare Trieste et retour par la Villa Comunale et la Via Roma.',
      es: 'Desde el pie del Duomo por la Via dei Mercanti y el Corso Vittorio Emanuele, bajando al mar, bajo las palmeras del Lungomare Trieste y de vuelta por la Villa Comunale y la Via Roma.',
    },
    seed: 11000,
    hw: 3.6,
    bikers: 4,
  },
];
