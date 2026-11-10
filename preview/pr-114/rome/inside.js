// The buildings in Rome you can go into (js/interiors.js): the Pantheon (inside/pantheon.js), its
// door between the portico's front columns on the Piazza della Rotonda, and the Sistine Chapel
// (inside/sistina.js), which lies in the Vatican, west of what the map holds: the big map takes you
// in, and its door out lets you into the city on the Piazza Adriana by the Castel Sant'Angelo, the
// way from it. yaw is the way out, away from the door.
import { makePantheon } from './inside/pantheon.js';
import { makeSistina } from './inside/sistina.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'pantheon', emoji: '🏛️', make: makePantheon, lookUp: 22, size: [-41, -29, 41, 57],
    name: { en: 'The Pantheon', nl: 'Het Pantheon' },
    door: { x: -162.5, z: -27.5, yaw: Math.PI, name: 'Piazza della Rotonda' },
    look: { hemi: [0xfff6e6, 0xd0c4b0, 2.4], horizon: 0xbcd4e8, fog: [150, 520] },
    exhibits: [
      card('⛩️', 0, -8, 9,
        { name: 'The portico', text: 'Sixteen columns of Egyptian granite, each cut in one piece and shipped from the eastern desert down the Nile and across the sea. M·AGRIPPA on the front names the first temple here; Hadrian built this one around AD 125.' },
        { name: 'De zuilengang', text: 'Zestien zuilen van Egyptisch graniet, elk uit één stuk, uit de oostelijke woestijn over de Nijl en de zee aangevoerd. M·AGRIPPA op de voorkant noemt de eerste tempel hier; Hadrianus bouwde deze rond 125 n.Chr.' }),
      card('☀️', 0, 29, 13,
        { name: 'The dome', text: 'Still the biggest dome of unreinforced concrete in the world, 43.3 m across and exactly as high, lighter towards the top where pumice is mixed into the concrete. Through the oculus the rain falls in, and drains away through 22 holes in the floor.' },
        { name: 'De koepel', text: 'Nog altijd de grootste koepel van ongewapend beton ter wereld, 43,3 m breed en precies even hoog, naar boven toe lichter met puimsteen in het beton. Door het oculus valt de regen binnen, die wegloopt door 22 gaatjes in de vloer.' }),
      card('🎨', -23.9, 19.1, 6,
        { name: 'Raphael’s tomb', text: 'Raphael died in 1520 at 37 and asked to be buried here. The Latin on it: “Here lies Raphael, by whom Nature feared to be outdone while he lived, and to die when he died.”' },
        { name: 'Het graf van Rafaël', text: 'Rafaël stierf in 1520, 37 jaar oud, en vroeg om hier begraven te worden. Het Latijn erop: “Hier ligt Rafaël, door wie de Natuur vreesde overtroffen te worden toen hij leefde, en te sterven toen hij stierf.”' }),
    ],
  },
  {
    id: 'sistina', emoji: '🎨', make: makeSistina, lookUp: 14, size: [-9, -26, 9, 26],
    name: { en: 'The Sistine Chapel', nl: 'De Sixtijnse Kapel' },
    out: { x: -1053.3, z: -569.6, yaw: Math.PI / 2, name: 'Piazza Adriana' },
    look: { hemi: [0xfff0dc, 0xb8a890, 2.0], horizon: 0x4a4038 },
    exhibits: [
      card('🙌', 0, -14, 10,
        { name: 'The ceiling', text: 'Michelangelo painted it from 1508 to 1512, standing on a scaffold he designed himself, not lying down: nine stories from Genesis down the middle, the prophets and sibyls round them, more than 300 figures.' },
        { name: 'Het plafond', text: 'Michelangelo schilderde het van 1508 tot 1512, rechtop op een stelling die hij zelf ontwierp, niet liggend: negen verhalen uit Genesis in het midden, de profeten en sibillen eromheen, meer dan 300 figuren.' }),
      card('☝️', 0, 2, 7,
        { name: 'The Creation of Adam', text: 'Above you, the fourth story from the altar: God reaching out to Adam, their fingers not quite touching. Some see the shape of a human brain in the cloak full of angels round God.' },
        { name: 'De schepping van Adam', text: 'Boven je, het vierde verhaal vanaf het altaar: God die naar Adam reikt, hun vingers raken elkaar net niet. Sommigen zien in de mantel vol engelen rond God de vorm van een menselijk brein.' }),
      card('⚖️', 0, 16, 8,
        { name: 'The Last Judgment', text: 'Michelangelo came back at 60 to paint the altar wall (1536–1541): Christ raising the saved and casting down the damned. Its nudes caused such a scandal that after his death another painter was paid to add loincloths.' },
        { name: 'Het Laatste Oordeel', text: 'Michelangelo kwam op zijn 60ste terug om de altaarwand te beschilderen (1536–1541): Christus die de geredden opheft en de verdoemden neerwerpt. Het naakt zorgde voor zo’n schandaal dat na zijn dood een andere schilder lendendoeken moest bijschilderen.' }),
      card('🗳️', 0, -20, 6,
        { name: 'The conclave', text: 'Here the cardinals lock themselves in to elect a new pope. Their ballots are burnt in a stove in the chapel: black smoke over the roof for no pope yet, white smoke for “Habemus papam”.' },
        { name: 'Het conclaaf', text: 'Hier sluiten de kardinalen zich op om een nieuwe paus te kiezen. Hun stembriefjes worden in een kachel in de kapel verbrand: zwarte rook boven het dak voor nog geen paus, witte rook voor “Habemus papam”.' }),
    ],
  },
];
