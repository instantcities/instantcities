// The buildings in Paris you can go into (js/interiors.js): the Louvre, as five of its key rooms
// (inside/louvre.js), its door at the foot of the glass pyramid in the Cour Napoléon, on its west
// face between the pools; yaw is the way out, away from the pyramid.
import { makeLouvre } from './inside/louvre.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'louvre', emoji: '🖼️', make: makeLouvre, size: [-23, -23, 33, 211],
    name: { en: 'The Louvre', nl: 'Het Louvre' },
    door: { x: -984.8, z: -607.5, yaw: -1.93, name: 'Cour Napoléon' },
    look: { hemi: [0xfff6e8, 0xc8bca8, 2.3], horizon: 0x8a8478, fog: [80, 420] },
    exhibits: [
      card('🔺', 0, -6, 14,
        { name: 'Hall Napoléon', text: 'Under I. M. Pei’s glass pyramid (1989): from here the three wings go off, Denon to the north with the Mona Lisa, the Venus de Milo and the Winged Victory. Some nine million people come every year, the most of any museum in the world.' },
        { name: 'Hall Napoléon', text: 'Onder de glazen piramide van I. M. Pei (1989): van hier vertrekken de drie vleugels, Denon naar het noorden met de Mona Lisa, de Venus van Milo en de Nikè. Zo’n negen miljoen bezoekers per jaar, meer dan in welk museum ook.' }),
      card('🗿', 0, 36, 6,
        { name: 'Venus de Milo', text: 'Found by a farmer on the Greek island of Milos in 1820, in two pieces, her arms already gone. Carved around 150–125 BC, probably by Alexandros of Antioch.' },
        { name: 'Venus van Milo', text: 'In 1820 door een boer gevonden op het Griekse eiland Milos, in twee stukken, haar armen al verdwenen. Gebeiteld rond 150–125 v.Chr., wellicht door Alexandros van Antiochië.' }),
      card('🪽', 0, 58, 9,
        { name: 'Winged Victory of Samothrace', text: 'Nike, goddess of victory, landing on the prow of a warship, around 190 BC. Her head and arms were never found; one hand turned up in 1950 and is in a case nearby.' },
        { name: 'Nikè van Samothrace', text: 'Nikè, godin van de overwinning, landt op de boeg van een oorlogsschip, rond 190 v.Chr. Haar hoofd en armen werden nooit gevonden; één hand dook in 1950 op en ligt in een vitrine vlakbij.' }),
      card('🖼️', 20, 100, 12,
        { name: 'The Grande Galerie', text: 'Built along the Seine in the 1590s to join the Louvre to the Tuileries palace, nearly 450 m long. Italian paintings hang here, Leonardo, Raphael, Titian.' },
        { name: 'De Grande Galerie', text: 'In de jaren 1590 langs de Seine gebouwd om het Louvre met het Tuilerieënpaleis te verbinden, bijna 450 m lang. Hier hangen Italiaanse schilderijen: Leonardo, Rafaël, Titiaan.' }),
      card('⛵', 20, 150, 7,
        { name: 'The Raft of the Medusa · Liberty', text: 'Géricault’s raft of the shipwrecked (1819) faces Delacroix’s Liberty Leading the People (1830), the July Revolution with the tricolour held high.' },
        { name: 'Het vlot van de Medusa · De Vrijheid', text: 'Het vlot met de schipbreukelingen van Géricault (1819) hangt tegenover De Vrijheid leidt het volk van Delacroix (1830): de Julirevolutie met de driekleur hoog.' }),
      card('😊', 16, 196, 7,
        { name: 'The Mona Lisa', text: 'Leonardo painted Lisa Gherardini from about 1503 and never gave the picture away. It is only 77 by 53 cm. Stolen in 1911 by a handyman who hid it under his coat, it came back two years later.' },
        { name: 'De Mona Lisa', text: 'Leonardo schilderde Lisa Gherardini vanaf zo’n 1503 en gaf het schilderij nooit weg. Het is maar 77 op 53 cm. In 1911 gestolen door een klusjesman die het onder zijn jas verstopte, twee jaar later terug.' }),
      card('🍷', 8, 176, 6,
        { name: 'The Wedding at Cana', text: 'Veronese, 1563: the biggest painting in the Louvre, almost 10 m wide, with 130 guests. Napoleon’s soldiers cut it in two to carry it off from Venice in 1797.' },
        { name: 'De bruiloft te Kana', text: 'Veronese, 1563: het grootste schilderij van het Louvre, bijna 10 m breed, met 130 gasten. De soldaten van Napoleon sneden het in 1797 in twee om het uit Venetië mee te nemen.' }),
    ],
  },
];
