// The race routes in Delft. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'delft',
    name: { nl: 'Grachten van Delft', en: 'Canals of Delft', fr: 'Canaux de Delft', es: 'Canales de Delft' },
    blurb: {
      nl: 'Over de Markt en langs de Voldersgracht, naar de scheve toren van de Oude Kerk, de Oude Delft af langs het Prinsenhof en over de Koornmarkt terug.',
      en: 'Across the Markt and along the Voldersgracht, up to the leaning tower of the Oude Kerk, down the Oude Delft past the Prinsenhof and back along the Koornmarkt.',
      fr: 'Par le Markt et le long de la Voldersgracht, jusqu’à la tour penchée de l’Oude Kerk, le long de l’Oude Delft devant le Prinsenhof et retour par le Koornmarkt.',
      es: 'Por el Markt y junto a la Voldersgracht, hasta la torre inclinada de la Oude Kerk, bajando la Oude Delft junto al Prinsenhof y de vuelta por el Koornmarkt.',
    },
    seed: 14000,
    hw: 3.2,
    bikers: 4,
  },
];
