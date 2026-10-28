// The race routes in New York. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json: the avenues are wide.
export const RACES = [
  {
    id: 'midtown',
    name: { nl: 'Rondje Midtown', en: 'Midtown Loop', fr: 'Boucle de Midtown', es: 'Vuelta a Midtown' },
    blurb: {
      nl: 'Door Times Square de Seventh Avenue af, over 34th Street naar de Empire State Building, Fifth Avenue op langs de bibliotheek, over 42nd Street langs Grand Central naar de Chrysler Building, en terug over 49th Street langs Rockefeller Center.',
      en: 'Down Seventh Avenue through Times Square, along 34th Street to the Empire State Building, up Fifth Avenue past the Public Library, along 42nd Street past Grand Central to the Chrysler Building, and back along 49th Street by Rockefeller Center.',
      fr: 'Par Times Square en descendant la Septième Avenue, le long de la 34e Rue jusqu’à l’Empire State Building, en remontant la Cinquième Avenue devant la bibliothèque, le long de la 42e Rue devant Grand Central jusqu’au Chrysler Building, et retour par la 49e Rue au Rockefeller Center.',
      es: 'Por Times Square bajando la Séptima Avenida, por la calle 34 hasta el Empire State Building, subiendo la Quinta Avenida junto a la biblioteca, por la calle 42 junto a Grand Central hasta el Chrysler Building, y de vuelta por la calle 49 junto al Rockefeller Center.',
    },
    seed: 16000,
    hw: 6.5,
    bikers: 5,
  },
];
