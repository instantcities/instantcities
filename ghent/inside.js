// The buildings in Ghent you can go into (js/interiors.js): Sint-Baafs with Het Lam Gods, the
// Stadhuis and the Sint-Niklaaskerk, built by hand in inside/ (from Instant Gent's ghentinside).
// Each door is where its real one is: the cathedral's west door on the Sint-Baafsplein, the
// Stadhuis's Renaissance front on the Botermarkt, the Niklaaskerk's south door on the Veldstraat;
// yaw is the way out of the building, away from the door.
import { makeBaafs } from './inside/baafs.js';
import { makeNiklaas } from './inside/niklaas.js';
import { makeStadhuis } from './inside/stadhuis.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'sint-baafs', emoji: '🖼️', make: makeBaafs, size: [-30, -62, 30, 56],
    name: { en: 'St Bavo’s Cathedral', nl: 'Sint-Baafskathedraal' },
    door: { x: 226.2, z: 49, yaw: -Math.PI / 2, name: 'Sint-Baafsplein' },
    exhibits: [
      card('⛪', 0, -45, 10,
        { name: 'The nave', text: 'The nave dates from the 15th and 16th centuries. The black and white marble floor was laid in the 18th century, on the diagonal. Walk through the aisles and round the choir to the chapels at the back.' },
        { name: 'Het schip', text: 'Het schip is in zijn huidige vorm van de 15de en 16de eeuw. De zwart-witte marmeren vloer werd in de 18de eeuw gelegd, op de diagonaal. Loop door de zijbeuken en rond het koor naar de kapellen achteraan.' }),
      card('🌳', -4.3, -33, 6,
        { name: 'The pulpit', text: 'Laurent Delvaux carved it in oak and marble (1745): Truth wakes Time, under a tree full of the Tree of Knowledge’s snakes and apples.' },
        { name: 'De preekstoel', text: 'Laurent Delvaux sneed hem in eik en marmer (1745): de Waarheid wekt de Tijd, onder een boom vol slangen en appels van de Boom der Kennis.' }),
      card('✨', 0, 26, 8,
        { name: 'The high altar', text: 'Baroque, in black and white marble, with St Bavo going up to heaven on a cloud (Hendrik Frans Verbrugghen, 1702–1719).' },
        { name: 'Het hoogaltaar', text: 'Barok, in zwart en wit marmer, met Sint-Baafs die op een wolk ten hemel gaat (Hendrik Frans Verbrugghen, 1702–1719).' }),
      card('🐑', 0, 47, 7,
        { name: 'The Ghent Altarpiece', text: 'Hubert and Jan van Eyck finished it in 1432. Thieves have taken it, armies carried it off and Napoleon hung it in the Louvre; one panel, the Just Judges, stolen in 1934, has never been found.' },
        { name: 'Het Lam Gods', text: 'Hubert en Jan van Eyck voltooiden het in 1432. Het werd gestolen, door legers meegenomen en door Napoleon in het Louvre gehangen; één paneel, de Rechtvaardige Rechters, gestolen in 1934, is nooit teruggevonden.' }),
    ],
  },
  {
    id: 'stadhuis', emoji: '🏛️', make: makeStadhuis, size: [-15, -29, 15, 31],
    name: { en: 'City Hall', nl: 'Stadhuis' },
    door: { x: 118, z: -111.1, yaw: 0, name: 'Botermarkt' },
    exhibits: [
      card('📜', 0, 0, 10,
        { name: 'The Pacification Hall', text: 'Here the Pacification of Ghent was signed on 8 November 1576: the provinces of the Low Countries made peace with each other, against the Spanish troops.' },
        { name: 'De Pacificatiezaal', text: 'Hier werd op 8 november 1576 de Pacificatie van Gent getekend: de Nederlandse gewesten sloten vrede met elkaar, tegen de Spaanse troepen.' }),
      card('💍', 0, 20, 7,
        { name: 'The wedding hall', text: 'Ghent’s couples still marry here, in the old chapel of the city hall.' },
        { name: 'De trouwzaal', text: 'Gentse koppels trouwen hier nog altijd, in de oude kapel van het stadhuis.' }),
    ],
  },
  {
    id: 'sint-niklaas', emoji: '⛪', make: makeNiklaas, size: [-26, -42, 26, 38],
    name: { en: 'St Nicholas’ Church', nl: 'Sint-Niklaaskerk' },
    door: { x: -56.7, z: -56.8, yaw: -0.243, name: 'Veldstraat' },
    exhibits: [
      card('⛪', 0, -10, 12,
        { name: 'Scheldt Gothic', text: 'Blue-grey Tournai stone, shipped up the Scheldt. The lantern tower stands over the crossing; the nave is tall, light and almost bare. Today it is also a place for concerts and exhibitions.' },
        { name: 'Scheldegotiek', text: 'Blauwgrijze Doornikse steen, over de Schelde aangevoerd. Boven de viering staat de lantaarntoren; het schip is hoog, licht en bijna kaal. Vandaag is het ook een plek voor concerten en tentoonstellingen.' }),
    ],
  },
];
