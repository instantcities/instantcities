// The tour: a flight over the plateau, from the Sphinx up past the Great Pyramid, round it once, over
// Khafre's and down to Menkaure's, and back along the south side (hand-written). The path is
// [x, z, height] in game metres; see ghent/tour.js for everything a tour can have.
import { game } from './frame.js';

const g = (lat, lon, h) => [...game(lat, lon), h];
const khufu = game(29.97917, 31.13417), khafre = game(29.97611, 31.13083), menkaure = game(29.97194, 31.12833), sphinx = game(29.97530, 31.13760);
const around = ([cx, cz], r, h, from, to, n) => Array.from({ length: n + 1 }, (_, k) => {
  const t = from + ((to - from) * k) / n;
  return [Math.round(cx + r * Math.cos(t)), Math.round(cz + r * Math.sin(t)), h];
});

export const TOUR = {
  path: [
    [sphinx[0] + 160, sphinx[1] + 60, 30], [sphinx[0] + 60, sphinx[1] + 10, 22], [sphinx[0] - 10, sphinx[1] - 40, 40],
    // up to the Great Pyramid and once round it
    ...around(khufu, 330, 130, Math.PI * 0.55, Math.PI * 0.55 + 2 * Math.PI, 24),
    // over the plateau to Khafre's, round it, and down to Menkaure's
    [khafre[0] + 50, khafre[1] - 280, 120], ...around(khafre, 290, 110, -Math.PI * 0.3, Math.PI * 1.2, 12),
    [menkaure[0] + 200, menkaure[1] - 200, 90], ...around(menkaure, 170, 70, -Math.PI * 0.4, Math.PI * 1.1, 10),
    [(menkaure[0] + sphinx[0]) / 2, menkaure[1] + 30, 80], [sphinx[0] - 130, sphinx[1] + 120, 50], [sphinx[0] + 160, sphinx[1] + 60, 30],
  ],
  stops: [
    {
      emoji: '🦁', at: [sphinx[0] + 60, sphinx[1] + 10], look: [sphinx[0] + 20, 20, sphinx[1]],
      text: {
        en: { name: 'The Great Sphinx', text: 'A lion with a king’s head, 73 metres long and 20 high, carved out of the bedrock about 4,500 years ago. It was buried to its neck in sand for most of its life, and its nose has been gone for centuries.' },
        nl: { name: 'De Grote Sfinx', text: 'Een leeuw met het hoofd van een koning, 73 meter lang en 20 hoog, zo’n 4500 jaar geleden uit de rotsbodem gehouwen. Het grootste deel van zijn bestaan zat hij tot zijn nek in het zand, en zijn neus is al eeuwen weg.' },
      },
    },
    {
      emoji: '🔺', at: [khufu[0] - 200, khufu[1] + 300], look: [khufu[0], 70, khufu[1]],
      text: {
        en: { name: 'The Great Pyramid', text: 'Built for King Khufu about 2560 BC from some 2.3 million blocks. It was the tallest building in the world for almost 4,000 years, at 146 metres. Now it is 139, as the top and the smooth casing are gone.' },
        nl: { name: 'De Grote Piramide', text: 'Gebouwd voor koning Cheops rond 2560 v.Chr. uit zo’n 2,3 miljoen blokken. Bijna 4000 jaar lang was het met 146 meter het hoogste gebouw ter wereld. Nu is hij 139 meter, want de top en de gladde bekleding zijn weg.' },
      },
    },
    {
      emoji: '⛰️', at: [khafre[0] + 40, khafre[1] - 290], look: [khafre[0], 100, khafre[1]],
      text: {
        en: { name: 'The pyramid of Khafre', text: 'Khufu’s son built the second pyramid on higher ground, so it looks the tallest. The smooth casing is still on its top, and the granite course at its foot.' },
        nl: { name: 'De piramide van Chefren', text: 'Cheops’ zoon bouwde de tweede piramide op hoger gelegen grond, zodat hij het hoogst lijkt. De gladde bekleding zit nog op de top, en de granieten laag aan de voet.' },
      },
    },
  ],
  names: [],
};
