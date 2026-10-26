// The buildings in Madrid you can go into (js/interiors.js): the Prado, as five of its key rooms.
// It stands on the Paseo del Prado, east of what the map holds, so it has no door in the street:
// the big map takes you in, and its door out lets you into the city on Calle de las Huertas, the
// way to it.
import { makePrado } from './inside/prado.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'prado', emoji: '🖼️', make: makePrado, size: [-31, -13, 27, 81],
    name: { en: 'The Prado', nl: 'Het Prado' },
    out: { x: 1094.3, z: 608.1, yaw: -Math.PI / 2, name: 'Calle de las Huertas' },
    look: { hemi: [0xfff6ea, 0xc8bca8, 2.3], horizon: 0x6a6258 },
    exhibits: [
      card('🏛️', 0, 30, 10,
        { name: 'The Central Gallery', text: 'The Spanish kings’ collection, opened to the public in 1819. Titian and Rubens hang down this long skylit gallery; the kings collected them in their own time.' },
        { name: 'De centrale galerij', text: 'De verzameling van de Spaanse koningen, in 1819 voor het publiek geopend. Titiaan en Rubens hangen langs deze lange galerij met bovenlicht; de koningen verzamelden hen al toen ze leefden.' }),
      card('👧', -26, 40, 7,
        { name: 'Las Meninas', text: 'Velázquez, 1656: the little Infanta Margarita and her maids, and the painter himself at work. The king and queen are only in the mirror at the back, which puts you where they stand.' },
        { name: 'Las Meninas', text: 'Velázquez, 1656: de kleine infante Margarita en haar hofdames, en de schilder zelf aan het werk. De koning en de koningin staan alleen in de spiegel achteraan, waardoor jij staat waar zij staan.' }),
      card('😱', 23, 20, 5,
        { name: 'The Black Paintings', text: 'Goya painted them straight onto the walls of his house outside Madrid, old, deaf and alone, around 1820, and never showed them to anyone. They were taken off the plaster in 1874. Saturn devours his son.' },
        { name: 'De Zwarte Schilderijen', text: 'Goya schilderde ze rechtstreeks op de muren van zijn huis buiten Madrid, oud, doof en alleen, rond 1820, en toonde ze aan niemand. In 1874 werden ze van het pleisterwerk gehaald. Saturnus verslindt zijn zoon.' }),
      card('🍓', 17, 60, 6,
        { name: 'The Garden of Earthly Delights', text: 'Hieronymus Bosch from ’s-Hertogenbosch, around 1500: Eden, a garden full of pleasures, and hell, where a man is crucified on a harp. Philip II, who collected Bosch, hung it in his palace.' },
        { name: 'De Tuin der Lusten', text: 'Jheronimus Bosch uit ’s-Hertogenbosch, rond 1500: het paradijs, een tuin vol genot, en de hel, waar een man op een harp gekruisigd wordt. Filips II, die Bosch verzamelde, hing het in zijn paleis.' }),
    ],
  },
];
