// The buildings in London you can go into (js/interiors.js): the British Museum, as three of its
// key rooms (inside/britishmuseum.js). It stands in Bloomsbury, north of what the map holds, so it
// has no door in the street: the big map takes you in, and its door out lets you into the city at
// the top of Charing Cross Road, the way to it.
import { makeBritishMuseum } from './inside/britishmuseum.js';

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
];
