// The buildings in London you can go into (js/interiors.js): the British Museum, as three of its
// key rooms (inside/britishmuseum.js). It stands in Bloomsbury, north of what the map holds, so it
// has no door in the street: the big map takes you in, and its door out lets you into the city at
// the top of Charing Cross Road, the way to it. Westminster Abbey, its great west door on Broad
// Sanctuary, and the National Gallery, its portico on Trafalgar Square.
import { makeBritishMuseum } from './inside/britishmuseum.js';
import { makeAbbey, CONFIG as ABBEY } from './inside/abbey.js';
import { makeNationalGallery } from './inside/nationalgallery.js';
import { cruciformBox } from '../core/js/inside/church.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'british-museum', emoji: '🏺', make: makeBritishMuseum, size: [-93, -39, 99, 39],
    name: { en: 'The British Museum', nl: 'Het British Museum' },
    out: { x: -262.8, z: -792.6, yaw: 0, name: 'Charing Cross Road' },
    look: { hemi: [0xf8f8f4, 0xc8c4b8, 2.4], horizon: 0xb8c4cc, fog: [100, 420] },
    exhibits: [
      card('🏛️', 0, -24, 14,
        { name: 'The Great Court', text: 'For 150 years an inner courtyard hidden behind the book stacks, roofed over in 2000 by Norman Foster with 3,312 panes of glass, no two the same shape. Around the round Reading Room in the middle, Marx wrote Das Kapital.' },
        { name: 'De Great Court', text: 'Anderhalve eeuw lang een binnenplaats verstopt achter de boekenrekken, in 2000 overdekt door Norman Foster met 3.312 glazen ruiten, geen twee van dezelfde vorm. In de ronde leeszaal in het midden schreef Marx Das Kapital.' }),
      card('🪨', -54, 0, 6,
        { name: 'The Rosetta Stone', text: 'A decree of 196 BC carved three times: in hieroglyphs, in Demotic and in Greek. Because the Greek could be read, Jean-François Champollion cracked the hieroglyphs with it in 1822. Found by French soldiers in 1799, taken by the British in 1801.' },
        { name: 'De Steen van Rosetta', text: 'Een decreet uit 196 v.Chr., drie keer gebeiteld: in hiërogliefen, in demotisch en in het Grieks. Omdat het Grieks te lezen was, kraakte Jean-François Champollion er in 1822 de hiërogliefen mee. In 1799 gevonden door Franse soldaten, in 1801 door de Britten meegenomen.' }),
      card('👑', -72, 5, 7,
        { name: 'Ramesses II', text: 'The “Younger Memnon”, 7 tonnes of granite from his temple at Thebes, about 1250 BC. Its arrival in 1818 is said to have inspired Shelley’s poem Ozymandias.' },
        { name: 'Ramses II', text: 'De “Jongere Memnon”, 7 ton graniet uit zijn tempel in Thebe, rond 1250 v.Chr. Zijn aankomst in 1818 zou Shelley geïnspireerd hebben tot het gedicht Ozymandias.' }),
      card('🐎', 72, 0, 12,
        { name: 'The Parthenon sculptures', text: 'Taken from the Parthenon in Athens by Lord Elgin’s agents from 1801: 75 m of the frieze with the procession to the goddess Athena, and the gods of the pediments. Greece has asked for them back ever since 1983.' },
        { name: 'De beelden van het Parthenon', text: 'Vanaf 1801 door de mannen van Lord Elgin van het Parthenon in Athene gehaald: 75 m van de fries met de processie naar de godin Athena, en de goden van de frontons. Griekenland vraagt ze sinds 1983 terug.' }),
    ],
  },
  {
    id: 'westminster-abbey', emoji: '👑', make: makeAbbey, size: cruciformBox(ABBEY),
    name: { en: 'Westminster Abbey', nl: 'Westminster Abbey' },
    door: { x: -272.3, z: 669.2, yaw: -Math.PI / 2, name: 'Broad Sanctuary' },
    look: { hemi: [0xfff4e4, 0xc0b4a0, 2.2], horizon: 0x5a5248 },
    exhibits: [
      card('🌺', 0, -70, 5,
        { name: 'The Unknown Warrior', text: 'A British soldier who fell in the First World War, nobody knows who, buried here in 1920 in earth brought from France. It is the only grave in the Abbey that nobody walks on.' },
        { name: 'De Onbekende Soldaat', text: 'Een Britse soldaat die sneuvelde in de Eerste Wereldoorlog, niemand weet wie, hier in 1920 begraven in aarde uit Frankrijk. Het is het enige graf in de Abbey waar niemand over loopt.' }),
      card('🪑', -10, -72, 5,
        { name: 'The Coronation Chair', text: 'Made in 1300 for Edward I, and nearly every English and British monarch since 1308 has been crowned on it, Charles III in 2023. Westminster schoolboys carved their names in it in the 1700s.' },
        { name: 'De kroningsstoel', text: 'Gemaakt in 1300 voor Edward I, en bijna elke Engelse en Britse vorst sinds 1308 werd erop gekroond, Charles III in 2023. Schooljongens van Westminster kerfden er in de 18de eeuw hun namen in.' }),
      card('✒️', 17, 0, 8,
        { name: 'Poets’ Corner', text: 'Chaucer was buried here in 1400, as clerk of the king’s works rather than as a poet; others followed him: Dickens, Kipling, Hardy. Shakespeare, Austen and the Brontës have memorials.' },
        { name: 'Poets’ Corner', text: 'Chaucer werd hier in 1400 begraven, als opzichter van de koninklijke bouwwerken eerder dan als dichter; anderen volgden: Dickens, Kipling, Hardy. Shakespeare, Austen en de Brontës hebben er een gedenkteken.' }),
      card('⛪', 0, 24, 7,
        { name: 'The high altar', text: 'Before it the coronations take place, and the royal weddings: William and Catherine in 2011, Elizabeth and Philip in 1947.' },
        { name: 'Het hoogaltaar', text: 'Ervoor vinden de kroningen plaats, en de koninklijke huwelijken: William en Catherine in 2011, Elizabeth en Philip in 1947.' }),
    ],
  },
  {
    id: 'national-gallery', emoji: '🌻', make: makeNationalGallery, size: [-27, -13, 31, 65],
    name: { en: 'The National Gallery', nl: 'De National Gallery' },
    door: { x: -284.5, z: -609.6, yaw: 0, name: 'Trafalgar Square' },
    look: { hemi: [0xfff6ea, 0xc8bca8, 2.3], horizon: 0x6a6258 },
    exhibits: [
      card('🏛️', 0, -6, 7,
        { name: 'The National Gallery', text: 'Free to walk into since 1824, when Parliament bought 38 paintings to start it. Now some 2,300, from the 1200s to 1900. In the war they were hidden in a Welsh slate mine, and one a month came back to be shown.' },
        { name: 'De National Gallery', text: 'Gratis binnen sinds 1824, toen het Parlement 38 schilderijen kocht om ermee te beginnen. Nu zo’n 2.300, van de 13de eeuw tot 1900. In de oorlog zaten ze verstopt in een leisteengroeve in Wales, en elke maand kwam er één terug om te tonen.' }),
      card('🪞', -22, 14, 6,
        { name: 'The Arnolfini Portrait', text: 'Jan van Eyck, 1434, painted in Bruges. Look into the convex mirror on the back wall: two more people stand in the doorway, and over it he wrote “Johannes de eyck fuit hic”, Jan van Eyck was here.' },
        { name: 'Het portret van Arnolfini', text: 'Jan van Eyck, 1434, geschilderd in Brugge. Kijk in de bolle spiegel op de achtermuur: er staan nog twee mensen in de deur, en erboven schreef hij “Johannes de eyck fuit hic”, Jan van Eyck was hier.' }),
      card('🐴', 19, 21, 6,
        { name: 'The Hay Wain · The Fighting Temeraire', text: 'Constable’s cart in the river Stour (1821), and facing it Turner’s old warship of Trafalgar towed off to be broken up (1839), voted Britain’s greatest painting in 2005.' },
        { name: 'De hooiwagen · De Temeraire', text: 'De kar van Constable in de rivier de Stour (1821), en ertegenover het oude oorlogsschip van Trafalgar dat Turner liet wegslepen om gesloopt te worden (1839), in 2005 verkozen tot het mooiste schilderij van Groot-Brittannië.' }),
      card('🌻', 0, 59, 7,
        { name: 'Sunflowers', text: 'Van Gogh painted them in Arles in August 1888, to hang in the room of his friend Gauguin, who was coming to stay. He painted four that month; this is one of the two he thought good enough to sign, on the vase.' },
        { name: 'Zonnebloemen', text: 'Van Gogh schilderde ze in Arles in augustus 1888, om op te hangen in de kamer van zijn vriend Gauguin, die zou komen logeren. Hij schilderde er die maand vier; dit is een van de twee die hij goed genoeg vond om te signeren, op de vaas.' }),
    ],
  },
];
