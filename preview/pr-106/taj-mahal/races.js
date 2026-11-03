import { THEME } from './appearance.js';
// The race route at the Taj Mahal. It runs along the garden walks of area.json (same id), in riding
// order, and closes on the first. seed: the dice for the items and obstacles on it; anything else is
// passed to realTrack (js/realtrack.js). hw: half the walk's width, as in area.json.
export const RACES = [
  {
    id: 'garden',
    name: { nl: 'De tuin', en: 'The garden', fr: 'Le jardin', es: 'El jardín' },
    blurb: {
      nl: 'Langs het lange kanaal naar het witte marmeren platform, dan rond de oostelijke helft van de tuin en terug naar de grote poort.',
      en: 'Up the long canal towards the white marble platform, then round the eastern half of the garden and back to the great gate.',
      fr: 'Le long du grand canal vers la terrasse de marbre blanc, puis autour de la moitié est du jardin et retour à la grande porte.',
      es: 'Por el gran canal hacia la terraza de mármol blanco, luego alrededor de la mitad este del jardín y de vuelta a la gran puerta.',
    },
    seed: 7100,
    hw: 4,
    bikers: 0,
    theme: { ...THEME, pavement: 1.2, lampEvery: 1e9, paving: '#cbb892', verge: 0xcbb892 }, // a garden walk of sandstone slabs, no street lamps
  },
];
