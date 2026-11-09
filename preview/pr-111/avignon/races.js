// The race routes in Avignon. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'intramuros',
    name: { nl: 'Intra-muros', en: 'Intra-muros', fr: 'Intra-muros', es: 'Intra-muros' },
    blurb: {
      nl: 'Van de Place de l’Horloge in de schaduw van het Pausenpaleis de Rue de la République af, over de Rue Joseph Vernet en via de Rue Saint-Agricol terug.',
      en: 'From the Place de l’Horloge in the shadow of the Palais des Papes down the Rue de la République, along the Rue Joseph Vernet and back up the Rue Saint-Agricol.',
      fr: 'De la place de l’Horloge, à l’ombre du palais des Papes, par la rue de la République, la rue Joseph-Vernet et retour par la rue Saint-Agricol.',
      es: 'De la Place de l’Horloge, a la sombra del Palacio de los Papas, por la Rue de la République, la Rue Joseph Vernet y de vuelta por la Rue Saint-Agricol.',
    },
    seed: 10800,
    hw: 3.6,
    bikers: 4,
  },
];
