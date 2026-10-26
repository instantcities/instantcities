// The race routes in Antwerp. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json.
export const RACES = [
  {
    id: 'antwerpen',
    name: { nl: 'Grote Markt en Schelde', en: 'Grote Markt and Scheldt', fr: 'Grote Markt et Escaut', es: 'Grote Markt y Escalda' },
    blurb: {
      nl: 'Van de Grote Markt naar Het Steen, langs de Schelde naar het zuiden, door de straatjes naar de Groenplaats en langs de kathedraal terug.',
      en: 'From the Grote Markt to Het Steen, south along the Scheldt, through the lanes to Groenplaats and back past the cathedral.',
      fr: 'Du Grote Markt jusqu’au Steen, vers le sud le long de l’Escaut, par les ruelles jusqu’à la Groenplaats et retour devant la cathédrale.',
      es: 'Del Grote Markt al Steen, hacia el sur junto al Escalda, por las callejuelas hasta la Groenplaats y de vuelta junto a la catedral.',
    },
    seed: 10100,
    hw: 4,
    bikers: 4,
  },
];
