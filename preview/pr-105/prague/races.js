// The race routes in Prague. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'staremesto',
    name: { nl: 'Oude Stad', en: 'Old Town', fr: 'Vieille ville', es: 'Ciudad Vieja' },
    blurb: {
      nl: 'Van het Oudestadsplein over de Pařížská door de Joodse wijk naar de rivier, langs de Karelsbrug en over de Karlova terug naar de astronomische klok.',
      en: 'From the Old Town Square up the Pařížská through the Jewish Quarter to the river, past the Charles Bridge and back along the Karlova to the astronomical clock.',
      fr: 'De la place de la Vieille-Ville par la Pařížská à travers le quartier juif jusqu’à la rivière, devant le pont Charles et retour par la Karlova jusqu’à l’horloge astronomique.',
      es: 'De la plaza de la Ciudad Vieja por la Pařížská a través del barrio judío hasta el río, junto al puente de Carlos y de vuelta por la Karlova hasta el reloj astronómico.',
    },
    seed: 10400,
    hw: 3.6,
    bikers: 4,
  },
];
