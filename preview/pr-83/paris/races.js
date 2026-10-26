// The race routes in Paris. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'cite',
    name: { nl: 'Île de la Cité', en: 'Île de la Cité', fr: 'Île de la Cité', es: 'Île de la Cité' },
    blurb: {
      nl: 'Van het Hôtel de Ville over de Seine naar de Notre-Dame, langs de kades van het eiland naar de Pont Neuf en over de Rue de Rivoli terug.',
      en: 'From the Hôtel de Ville over the Seine to Notre-Dame, along the island’s quays to the Pont Neuf and back down the Rue de Rivoli.',
      fr: 'De l’Hôtel de Ville par-dessus la Seine jusqu’à Notre-Dame, le long des quais de l’île jusqu’au Pont Neuf et retour par la rue de Rivoli.',
      es: 'Del Hôtel de Ville sobre el Sena hasta Notre-Dame, por los muelles de la isla hasta el Pont Neuf y de vuelta por la Rue de Rivoli.',
    },
    seed: 9500,
    hw: 4.5,
    bikers: 4,
  },
];
