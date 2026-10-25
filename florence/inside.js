// The buildings in Florence you can go into (js/interiors.js): the Uffizi, as four of its key rooms
// (inside/uffizi.js), its door under the colonnade of the Piazzale degli Uffizi, and the Duomo, its
// west door facing the Baptistery. yaw is the way out, away from the door.
import { makeUffizi } from './inside/uffizi.js';
import { makeDuomo, CONFIG as DUOMO } from './inside/duomo.js';
import { cruciformBox } from '../core/js/inside/church.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'uffizi', emoji: '🖼️', make: makeUffizi, size: [-35, -15, 7, 111],
    name: { en: 'The Uffizi', nl: 'De Uffizi' },
    door: { x: 222.8, z: 326.9, yaw: -1.89, name: 'Piazzale degli Uffizi' },
    look: { hemi: [0xfff6e8, 0xc8bca8, 2.2], horizon: 0x6a6258 },
    exhibits: [
      card('🏛️', 0, -6, 7,
        { name: 'Galleria degli Uffizi', text: 'Vasari built the “offices” for Cosimo I de’ Medici’s magistrates in 1560. The top floor became the family’s gallery, and in 1737 the last of the Medici, Anna Maria Luisa, left it all to Florence, on condition that nothing ever leaves the city.' },
        { name: 'Galleria degli Uffizi', text: 'Vasari bouwde de “kantoren” voor de magistraten van Cosimo I de’ Medici in 1560. De bovenste verdieping werd de galerij van de familie, en in 1737 schonk de laatste Medici, Anna Maria Luisa, alles aan Firenze, op voorwaarde dat er nooit iets de stad verlaat.' }),
      card('🎨', 0, 16, 7,
        { name: 'The east corridor', text: 'Roman marbles collected by the Medici line both walls, under a vault painted with grotesques in the 1580s: little figures, birds and monsters, copied from the ruins of Nero’s Golden House.' },
        { name: 'De oostelijke gang', text: 'Romeinse beelden uit de verzameling van de Medici staan langs beide muren, onder een gewelf vol groteske schilderingen uit de jaren 1580: figuurtjes, vogels en monsters, nagetekend uit de ruïnes van het Gouden Huis van Nero.' }),
      card('🐚', -16.5, 30, 6,
        { name: 'The Tribuna', text: 'Buontalenti’s octagon (1584) for the Medici’s greatest treasures: walls of red velvet, a dome inlaid with some 6,000 mother-of-pearl shells, and the Venus de’ Medici in the middle, a Roman copy of a Greek original.' },
        { name: 'De Tribuna', text: 'De achthoek van Buontalenti (1584) voor de grootste schatten van de Medici: wanden van rood fluweel, een koepel ingelegd met zo’n 6.000 schelpen van parelmoer, en in het midden de Venus de’ Medici, een Romeinse kopie van een Grieks origineel.' }),
      card('🌊', 0, 104, 7,
        { name: 'The window over the Arno', text: 'From the end of the corridor you look down on the Ponte Vecchio, with Vasari’s corridor running over its shops to the Pitti palace, so the Medici could cross the river without meeting their subjects.' },
        { name: 'Het raam boven de Arno', text: 'Vanaf het einde van de gang kijk je neer op de Ponte Vecchio, met de gang van Vasari over de winkeltjes naar het Palazzo Pitti, zodat de Medici de rivier konden oversteken zonder hun onderdanen tegen te komen.' }),
      card('🐚', -20.5, 78, 7,
        { name: 'The Birth of Venus', text: 'Botticelli, about 1485: the goddess of love blown ashore on a scallop shell by the winds. One of the first big paintings since antiquity of a naked goddess, on canvas rather than wood.' },
        { name: 'De geboorte van Venus', text: 'Botticelli, rond 1485: de godin van de liefde, door de winden op een schelp aan land geblazen. Een van de eerste grote schilderijen sinds de oudheid van een naakte godin, op doek in plaats van hout.' }),
      card('🌸', -28, 70, 6,
        { name: 'Primavera', text: 'Botticelli’s spring, about 1480: Venus in her orange grove, the three Graces dancing, Flora strewing flowers. Botanists have counted some 500 plants in it, about 190 of them different flowers.' },
        { name: 'Primavera', text: 'De lente van Botticelli, rond 1480: Venus in haar sinaasappelgaard, de drie Gratiën die dansen, Flora die bloemen strooit. Botanici telden er zo’n 500 planten in, waarvan een 190-tal verschillende bloemen.' }),
    ],
  },
  {
    id: 'duomo', emoji: '⛪', make: makeDuomo, size: cruciformBox(DUOMO), lookUp: 30,
    name: { en: 'The Duomo', nl: 'De Dom' },
    door: { x: 223.7, z: -332.2, yaw: -Math.PI / 2, name: 'Piazza del Duomo' },
    look: { hemi: [0xfff4e4, 0xc8bca8, 2.3], horizon: 0x7a7266, fog: [120, 480] },
    exhibits: [
      card('⛪', 0, -60, 16,
        { name: 'Santa Maria del Fiore', text: 'Begun in 1296 and big enough for 30,000 people. Inside it is almost bare: the Florentines spent their money on the outside, the marble of white, green and pink.' },
        { name: 'Santa Maria del Fiore', text: 'Begonnen in 1296 en groot genoeg voor 30.000 mensen. Binnen is ze bijna kaal: de Florentijnen staken hun geld in de buitenkant, het marmer in wit, groen en roze.' }),
      card('🕰️', 0, -88, 8,
        { name: 'Uccello’s clock', text: 'Paolo Uccello painted it in 1443. Its one hand turns the wrong way round, and it counts the 24 hours of the old Italian day, which ended at sunset.' },
        { name: 'De klok van Uccello', text: 'Paolo Uccello schilderde ze in 1443. Haar ene wijzer draait de verkeerde kant op, en ze telt de 24 uur van de oude Italiaanse dag, die bij zonsondergang eindigde.' }),
      card('🐎', -15, -71, 7,
        { name: 'Sir John Hawkwood', text: 'An English mercenary who led Florence’s army, promised a bronze statue and given, after his death, this fresco painted to look like one (Uccello, 1436).' },
        { name: 'Sir John Hawkwood', text: 'Een Engelse huurling die het leger van Firenze aanvoerde, aan wie een bronzen ruiterbeeld beloofd was. Na zijn dood kreeg hij dit fresco dat er een moest lijken (Uccello, 1436).' }),
      card('🔭', 0, 0, 9,
        { name: 'Brunelleschi’s dome', text: 'Built from 1420 to 1436 without scaffolding from the ground, a dome inside a dome, 45 m across: still the biggest masonry dome in the world. Vasari and Zuccari painted the Last Judgment inside it (1572–1579).' },
        { name: 'De koepel van Brunelleschi', text: 'Gebouwd van 1420 tot 1436 zonder steigers vanaf de grond, een koepel in een koepel, 45 m breed: nog altijd de grootste gemetselde koepel ter wereld. Vasari en Zuccari schilderden er het Laatste Oordeel in (1572–1579).' }),
    ],
  },
];
