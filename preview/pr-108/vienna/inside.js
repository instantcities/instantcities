// The buildings in Vienna you can go into (js/interiors.js): St Stephen's Cathedral, its Giant's
// Door on Stephansplatz, and the Kunsthistorisches Museum, as three of its key rooms, its door on
// Maria-Theresien-Platz. yaw is the way out, away from the building.
import { makeStephansdom, CONFIG as STEPHANSDOM } from './inside/stephansdom.js';
import { makeKHM } from './inside/khm.js';
import { cruciformBox } from '../core/js/inside/church.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'stephansdom', emoji: '⛪', make: makeStephansdom, size: cruciformBox(STEPHANSDOM),
    name: { en: 'St Stephen’s Cathedral', nl: 'De Stephansdom' },
    door: { x: 564.8, z: -312.6, yaw: -Math.PI / 2, name: 'Stephansplatz' },
    look: { hemi: [0xfff0dc, 0xb0a490, 2.1], horizon: 0x4a4238 },
    exhibits: [
      card('⛪', 0, -40, 12,
        { name: 'A hall church', text: 'The aisles are nearly as tall as the nave, so it is one great dim hall. Rebuilt after the fire of April 1945; Austrians paid for the new roof of 230,000 glazed tiles by buying them a tile at a time.' },
        { name: 'Een hallenkerk', text: 'De zijbeuken zijn bijna even hoog als het middenschip, zodat het één grote schemerige hal is. Herbouwd na de brand van april 1945; de Oostenrijkers betaalden het nieuwe dak van 230.000 geglazuurde pannen door ze pan per pan te kopen.' }),
      card('🗣️', -4, -29, 5,
        { name: 'Pilgram’s pulpit', text: 'Carved in stone around 1500, the four Fathers of the Church round its basket, toads and lizards climbing its rail. Under the stair a man leans out of a window: Anton Pilgram, its maker.' },
        { name: 'De preekstoel van Pilgram', text: 'Rond 1500 in steen gebeiteld, de vier kerkvaders rond de kuip, padden en hagedissen die de leuning op klimmen. Onder de trap leunt een man uit een raampje: Anton Pilgram, de maker.' }),
      card('✨', 0, 22, 6,
        { name: 'The high altar', text: 'Black marble from Poland (1647), and in its middle Tobias Pock’s painting of the stoning of St Stephen, the first Christian martyr, whom the cathedral is named after.' },
        { name: 'Het hoogaltaar', text: 'Zwart marmer uit Polen (1647), en in het midden het schilderij van Tobias Pock van de steniging van Sint-Stefanus, de eerste christelijke martelaar, naar wie de dom genoemd is.' }),
    ],
  },
  {
    id: 'kunsthistorisches', emoji: '🗼', make: makeKHM, size: [-15, -15, 41, 60],
    name: { en: 'The Kunsthistorisches Museum', nl: 'Het Kunsthistorisches Museum' },
    door: { x: -463.5, z: 315.0, yaw: -2.356, name: 'Maria-Theresien-Platz' },
    look: { hemi: [0xfff6ea, 0xc8bca8, 2.3], horizon: 0x6a6258 },
    exhibits: [
      card('🪜', 0, -6, 8,
        { name: 'The grand staircase', text: 'Opened by Emperor Franz Joseph in 1891 for the Habsburgs’ collections. High up between the columns are paintings by a young Gustav Klimt, with his brother Ernst and Franz Matsch.' },
        { name: 'De grote trap', text: 'In 1891 door keizer Franz Joseph geopend voor de verzamelingen van de Habsburgers. Hoog tussen de zuilen hangen schilderijen van een jonge Gustav Klimt, met zijn broer Ernst en Franz Matsch.' }),
      card('☕', 0, 43, 9,
        { name: 'The cupola hall', text: 'Under the dome, 60 m up to its top, the museum keeps a café, often called the most beautiful in the world.' },
        { name: 'De koepelhal', text: 'Onder de koepel, 60 m hoog tot de top, zit het café van het museum, vaak het mooiste ter wereld genoemd.' }),
      card('🗼', 35, 43, 6,
        { name: 'The Bruegel room', text: 'Twelve of Pieter Bruegel the Elder’s forty or so paintings hang here, the most anywhere: the Tower of Babel (1563), the Hunters in the Snow (1565) and the Peasant Wedding (1567).' },
        { name: 'De Bruegelzaal', text: 'Twaalf van de zowat veertig schilderijen van Pieter Bruegel de Oude hangen hier, nergens meer: de Toren van Babel (1563), De jagers in de sneeuw (1565) en De boerenbruiloft (1567).' }),
    ],
  },
];
