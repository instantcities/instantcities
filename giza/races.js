// The race route at Giza: round the plateau on its roads, along the four roads of area.json (same id),
// in riding order, and it closes on the first: past the Great Pyramid on the north, down to the
// Sphinx on the east, round below the pyramids of Khafre and Menkaure and back up the west side.
// seed: the dice for the items and obstacles on it; anything else is passed to realTrack
// (js/realtrack.js). hw: half the road's width, as in area.json.
export const RACES = [
  {
    id: 'plateau',
    name: { nl: 'Het plateau', en: 'The plateau', fr: 'Le plateau', es: 'La meseta' },
    blurb: {
      nl: 'Rond het plateau: langs de Grote Piramide, naar de Sfinx, onder de piramides van Chefren en Mykerinos door en terug langs de westkant.',
      en: 'Round the plateau: past the Great Pyramid, down to the Sphinx, below the pyramids of Khafre and Menkaure and back up the west side.',
      fr: 'Le tour du plateau : devant la Grande Pyramide, jusqu’au Sphinx, sous les pyramides de Khéphren et de Mykérinos et retour par l’ouest.',
      es: 'Vuelta a la meseta: junto a la Gran Pirámide, hasta la Esfinge, bajo las pirámides de Kefrén y Micerino y de vuelta por el oeste.',
    },
    seed: 7500,
    hw: 3.4,
    bikers: 0,
    theme: { pavement: 0.8, lampEvery: 1e9, paving: '#d4c7a0', pavingJoints: false, verge: 0xd4c7a0, ground: '#d8c18c', dirt: '#cdbd92', sky: 0x4a98e0, horizon: 0xf2e6c8 },
  },
];
