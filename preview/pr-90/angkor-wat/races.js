// The race route at Angkor Wat. An open route: it runs along the walks of area.json (same id), in
// riding order, from a START gate at the outer gopura to a FINISH gate east of the temple. seed: the
// dice for the items and obstacles on it; anything else is passed to realTrack (js/realtrack.js).
// hw: half the walk's width, as in area.json.
export const RACES = [
  {
    id: 'causeway',
    name: { nl: 'De dam', en: 'The causeway', fr: 'La chaussée', es: 'La calzada' },
    blurb: {
      nl: 'Van de westelijke poort over de 350 meter lange dam over de slotgracht naar de tempel, dan langs de noordkant ervan naar de oostkant.',
      en: 'From the western gate along the 350-metre causeway over the moat to the temple, then along its north side to the east.',
      fr: 'De la porte ouest par la chaussée de 350 mètres au-dessus des douves jusqu’au temple, puis le long de son côté nord vers l’est.',
      es: 'De la puerta oeste por la calzada de 350 metros sobre el foso hasta el templo, y luego por su lado norte hacia el este.',
    },
    seed: 7200,
    hw: 4,
    bikers: 0,
    theme: { pavement: 1.2, lampEvery: 1e9, paving: '#9a8d78', verge: 0x9a8d78 }, // stone slabs, no street lamps
  },
];
