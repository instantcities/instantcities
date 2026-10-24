// The race routes in Lecce. Each runs along the real streets of one of the routes in area.json (same
// id), in riding order; the loop closes on the first street, unless the route is open (from/to in
// area.json): then it is ridden once from a START gate to a FINISH gate. seed: the dice for the items and
// obstacles on it; anything else is passed to realTrack (js/realtrack.js), e.g. bikers. hw: half the
// raced street's width, as in area.json (Lecce's lanes are narrower than Ghent's).
export const RACES = [
  {
    id: 'leccecentro',
    name: { nl: 'Lecce Centro', en: 'Lecce Centre', fr: 'Centre de Lecce', es: 'Centro de Lecce' },
    blurb: {
      nl: 'Rond het barokke centrum: van de Piazza Sant’Oronzo langs de Duomo, door de Porta Rudiae naar buiten, door de Porta Napoli weer binnen en langs de Santa Croce terug.',
      en: 'Round the baroque old town: from Piazza Sant’Oronzo past the Duomo, out through Porta Rudiae, back in through Porta Napoli and home past Santa Croce.',
      fr: 'Le tour du centre baroque : de la Piazza Sant’Oronzo devant le Duomo, sortie par la Porta Rudiae, retour par la Porta Napoli et devant Santa Croce.',
      es: 'Vuelta al centro barroco: de la Piazza Sant’Oronzo junto al Duomo, salida por la Porta Rudiae, vuelta por la Porta Napoli y de regreso junto a Santa Croce.',
    },
    seed: 9300,
    hw: 3.6,
    bikers: 4,
  },
  // the open route: from one place to another, start to finish
  {
    id: 'stazionecastello',
    name: { nl: 'Stazione → Sant’Oronzo', en: 'Stazione → Sant’Oronzo', fr: 'Stazione → Sant’Oronzo', es: 'Stazione → Sant’Oronzo' },
    blurb: {
      nl: 'Van het station van Lecce over de ring, door de Porta Rudiae en langs de Duomo naar de Piazza Sant’Oronzo, tot bij het Castello Carlo V.',
      en: 'From Lecce station along the ring road, in through Porta Rudiae and past the Duomo to Piazza Sant’Oronzo, on to the Castello Carlo V.',
      fr: 'De la gare de Lecce par les boulevards, entrée par la Porta Rudiae et devant le Duomo jusqu’à la Piazza Sant’Oronzo, puis vers le Castello Carlo V.',
      es: 'De la estación de Lecce por la ronda, entrada por la Porta Rudiae y junto al Duomo hasta la Piazza Sant’Oronzo, hacia el Castello Carlo V.',
    },
    seed: 9350,
    hw: 3.6,
    bikers: 5,
  },
];
