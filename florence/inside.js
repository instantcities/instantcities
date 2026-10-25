// The buildings in Florence you can go into (js/interiors.js): the Uffizi, as four of its key rooms
// (inside/uffizi.js), its door under the colonnade of the Piazzale degli Uffizi; yaw is the way out,
// away from the door.
import { makeUffizi } from './inside/uffizi.js';

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
];
