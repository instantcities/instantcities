// The race routes in Brussels. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'grandplace',
    name: { nl: 'Grote Markt', en: 'Grand-Place', fr: 'Grand-Place', es: 'Grand-Place' },
    blurb: {
      nl: 'Van de Grote Markt naar de Beurs, door de Zuidstraat naar Manneken Pis en via de Spoormakersstraat en de Grasmarkt terug.',
      en: 'From the Grand-Place to the Bourse, down the Rue du Midi to the Manneken Pis and back by the Rue des Éperonniers and the Marché aux Herbes.',
      fr: 'De la Grand-Place à la Bourse, par la rue du Midi jusqu’au Manneken Pis et retour par la rue des Éperonniers et le Marché aux Herbes.',
      es: 'De la Grand-Place a la Bolsa, por la Rue du Midi hasta el Manneken Pis y de vuelta por la Rue des Éperonniers y el Marché aux Herbes.',
    },
    seed: 10200,
    hw: 3.6,
    bikers: 4,
  },
];
