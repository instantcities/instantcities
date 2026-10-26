// Giza's sights: ride up to one while exploring and a card tells you what you are looking at.
// Each { id, emoji, x, z (game metres, where the card counts from), r (how close you have to be, game
// metres), text: { <lang>: { name, text } } }. In English and Dutch; the other languages show the English.
import { game } from './frame.js';

const s = (id, emoji, lat, lon, r, text) => ({ id, emoji, x: game(lat, lon)[0], z: game(lat, lon)[1], r, text });
export const SIGHTS = [
  s('khufu', '🔺', 29.97917, 31.13417, 230, {
    en: { name: 'The Great Pyramid', text: 'The tomb of King Khufu, about 2560 BC. It stands 230 metres a side and is 139 metres high now. Some 2.3 million blocks of limestone make it up, and it was the tallest building on Earth until Lincoln Cathedral passed it around 1300.' },
    nl: { name: 'De Grote Piramide', text: 'Het graf van koning Cheops, rond 2560 v.Chr. Hij is 230 meter breed en nu 139 meter hoog. Zo’n 2,3 miljoen blokken kalksteen vormen hem, en hij was het hoogste gebouw ter wereld tot de kathedraal van Lincoln hem rond 1300 voorbijstak.' },
  }),
  s('khafre', '⛰️', 29.97611, 31.13083, 220, {
    en: { name: 'The pyramid of Khafre', text: 'Khufu’s son’s pyramid is 136 metres high. It stands on higher ground, so it looks taller than the Great Pyramid. The smooth limestone casing that once covered all of them is still on its top.' },
    nl: { name: 'De piramide van Chefren', text: 'De piramide van Cheops’ zoon is 136 meter hoog. Hij staat op hoger gelegen grond en lijkt daardoor hoger dan de Grote Piramide. De gladde kalksteenbekleding die ze allemaal bedekte zit nog op de top.' },
  }),
  s('menkaure', '🔻', 29.97194, 31.12833, 140, {
    en: { name: 'The pyramid of Menkaure', text: 'The smallest of the three, 65 metres high, with its lower courses faced in red granite from Aswan. Its builders died before it was finished, and the casing was never smoothed.' },
    nl: { name: 'De piramide van Mykerinos', text: 'De kleinste van de drie, 65 meter hoog, met onderaan een bekleding van rood graniet uit Aswan. De bouwers stierven voor hij klaar was en de bekleding werd nooit glad gemaakt.' },
  }),
  s('queens', '👑', 29.9788, 31.1362, 90, {
    en: { name: 'The queens’ pyramids', text: 'Three small pyramids next to the Great Pyramid, built for the wives and family of Khufu. Each was about 30 metres high; now they are broken off at the top.' },
    nl: { name: 'De koninginnenpiramides', text: 'Drie kleine piramides naast de Grote Piramide, gebouwd voor de vrouwen en familie van Cheops. Elk was zo’n 30 meter hoog; nu zijn ze bovenaan afgebroken.' },
  }),
  s('sphinx', '🦁', 29.97530, 31.13760, 90, {
    en: { name: 'The Great Sphinx', text: 'A lion with the head of a king, probably Khafre, carved from the bedrock about 2500 BC. It is 73 metres long and 20 high, and it looks due east. Sand buried it to the chest for most of its history.' },
    nl: { name: 'De Grote Sfinx', text: 'Een leeuw met het hoofd van een koning, waarschijnlijk Chefren, rond 2500 v.Chr. uit de rotsbodem gehouwen. Hij is 73 meter lang en 20 hoog en kijkt recht naar het oosten. Het grootste deel van zijn geschiedenis zat hij tot zijn borst in het zand.' },
  }),
  s('town', '🏘️', 29.9757, 31.1415, 120, {
    en: { name: 'Nazlet el-Semman', text: 'The town at the foot of the plateau, right up against the Sphinx. The pyramids were once out in the desert; now a street of houses runs to the edge of the site.' },
    nl: { name: 'Nazlet el-Semman', text: 'De stad aan de voet van het plateau, vlak tegen de Sfinx. De piramides stonden ooit midden in de woestijn; nu loopt een straat vol huizen tot aan de rand van het terrein.' },
  }),
];
