// The buildings in Paris you can go into (js/interiors.js): the Louvre, as five of its key rooms
// (inside/louvre.js), its door at the foot of the glass pyramid in the Cour Napoléon, on its west
// face between the pools; Notre-Dame, its west doors on the Parvis; the Sainte-Chapelle, its door on
// the north side, in the Palais de la Cité. The Île de la Cité is water on the map where no street
// covers it, so both doors stand on a street. yaw is the way out, away from the building.
import { makeLouvre } from './inside/louvre.js';
import { makeNotreDame, CONFIG as NOTRE_DAME } from './inside/notredame.js';
import { makeSainteChapelle, SIZE as SAINTE_CHAPELLE } from './inside/saintechapelle.js';
import { cruciformBox } from '../core/js/inside/church.js';

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
  {
    id: 'notre-dame', emoji: '⛪', make: makeNotreDame, size: cruciformBox(NOTRE_DAME),
    name: { en: 'Notre-Dame', nl: 'Notre-Dame' },
    door: { x: 261.4, z: 518.2, yaw: -Math.PI / 2, name: 'Parvis Notre-Dame' },
    look: { hemi: [0xfff8ee, 0xd0c8b8, 2.4], horizon: 0x6a6458 },
    exhibits: [
      card('⛪', 0, -50, 14,
        { name: 'The nave', text: 'Begun in 1163, the vault 33 m up. After the fire of 15 April 2019 brought down the spire and much of the roof, the cathedral was rebuilt in five years and reopened in December 2024, its stone cleaned paler than anyone alive had seen it.' },
        { name: 'Het schip', text: 'Begonnen in 1163, het gewelf 33 m hoog. Na de brand van 15 april 2019, die de spits en een groot deel van het dak deed instorten, werd de kathedraal in vijf jaar herbouwd en in december 2024 heropend, de steen lichter gereinigd dan iemand die nu leeft ze ooit zag.' }),
      card('🌹', -10, 0, 8,
        { name: 'The rose windows', text: 'The north rose (about 1250) still has most of its medieval glass, the Virgin among the prophets of the Old Testament, almost 13 m across. All three roses came through the fire.' },
        { name: 'De roosvensters', text: 'Het noordelijke roosvenster (rond 1250) heeft nog het meeste van zijn middeleeuwse glas, Maria tussen de profeten van het Oude Testament, bijna 13 m breed. Alle drie de rozen kwamen de brand door.' }),
      card('✨', 0, 2, 7,
        { name: 'The new altar', text: 'A round table of bronze by the designer Guillaume Bardet, consecrated at the reopening in 2024, under the crossing where the burning spire fell through the vault.' },
        { name: 'Het nieuwe altaar', text: 'Een ronde tafel van brons van ontwerper Guillaume Bardet, ingewijd bij de heropening in 2024, onder de viering waar de brandende spits door het gewelf viel.' }),
      card('🕊️', 0, 42, 7,
        { name: 'The Pietà', text: 'Nicolas Coustou’s Virgin with her dead son across her knees (1723), at the end of the choir under the gold cross, Louis XIII and Louis XIV kneeling on either side. It stood right below the fire and was found unharmed.' },
        { name: 'De piëta', text: 'Maria met haar dode zoon op haar schoot, van Nicolas Coustou (1723), aan het einde van het koor onder het gouden kruis, met Lodewijk XIII en Lodewijk XIV geknield ernaast. Ze stond recht onder de brand en werd ongedeerd teruggevonden.' }),
    ],
  },
  {
    id: 'sainte-chapelle', emoji: '💎', make: makeSainteChapelle, size: SAINTE_CHAPELLE,
    name: { en: 'The Sainte-Chapelle', nl: 'De Sainte-Chapelle' },
    door: { x: -129.1, z: 158.9, yaw: Math.PI, name: 'Palais de la Cité' },
    look: { hemi: [0xe8e4ff, 0x8a7a9a, 2.0], horizon: 0x2a2440 },
    exhibits: [
      card('🪟', 0, -4, 12,
        { name: 'Walls of glass', text: 'Louis IX built it in seven years (1241–1248) as a reliquary to walk into. Its 15 windows, each 15 m high, hold 1,113 scenes from the Bible in some 600 m² of glass, two-thirds of it still the original.' },
        { name: 'Wanden van glas', text: 'Lodewijk IX liet ze in zeven jaar bouwen (1241–1248), als een reliekschrijn om in te lopen. De 15 ramen, elk 15 m hoog, tonen 1.113 taferelen uit de Bijbel in zo’n 600 m² glas, waarvan tweederde nog origineel.' }),
      card('👑', 0, 15, 5,
        { name: 'The Crown of Thorns', text: 'The king bought it in 1239 from the emperor of Constantinople for 135,000 livres, more than the chapel cost to build, and kept it on the tribune here. It has been kept at Notre-Dame since the Revolution, and was carried out of the fire in 2019.' },
        { name: 'De doornenkroon', text: 'De koning kocht ze in 1239 van de keizer van Constantinopel voor 135.000 livres, meer dan de hele kapel kostte, en bewaarde ze hier op de tribune. Sinds de Revolutie wordt ze in de Notre-Dame bewaard, en in 2019 werd ze uit de brand gedragen.' }),
    ],
  },
];
