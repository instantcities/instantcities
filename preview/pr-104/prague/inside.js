// The buildings in Prague you can go into (js/interiors.js): St Vitus Cathedral, in the castle up on
// the hill just west of what the map holds. It has no door in the street: the big map takes you in,
// and its door out lets you into the city at the foot of the Old Castle Steps, the way down from it.
import { makeSvatyVit, CONFIG as SVATY_VIT } from './inside/svatyvit.js';
import { cruciformBox } from '../core/js/inside/church.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'st-vitus', emoji: '⛪', make: makeSvatyVit, size: cruciformBox(SVATY_VIT),
    name: { en: 'St Vitus Cathedral', nl: 'De Sint-Vituskathedraal' },
    out: { x: -895.3, z: -608.2, yaw: Math.PI / 2, name: 'Staré zámecké schody' },
    look: { hemi: [0xfff4e8, 0xc0b8a8, 2.2], horizon: 0x5a564c },
    exhibits: [
      card('⛪', 0, -30, 12,
        { name: 'Six centuries in the building', text: 'Begun in 1344 under Charles IV, the choir by Peter Parler; the nave, the west front and its towers were only finished in 1929, for the thousandth anniversary of St Wenceslas’s death.' },
        { name: 'Zes eeuwen in de steigers', text: 'Begonnen in 1344 onder Karel IV, het koor van Peter Parler; het schip, de westgevel en zijn torens werden pas in 1929 voltooid, duizend jaar na de dood van Sint-Wenceslas.' }),
      card('🎨', -11, -24, 5,
        { name: 'Mucha’s window', text: 'Alfons Mucha designed it in 1931: Saints Cyril and Methodius, who brought writing to the Slavs, in the Art Nouveau colours he was famous for in Paris. It was paid for by a bank.' },
        { name: 'Het raam van Mucha', text: 'Alfons Mucha ontwierp het in 1931: de heiligen Cyrillus en Methodius, die het schrift naar de Slaven brachten, in de art-nouveaukleuren waarmee hij in Parijs beroemd werd. Een bank betaalde het.' }),
      card('🥈', 9.5, 36, 5,
        { name: 'St John of Nepomuk', text: 'His tomb (1736) is made of some two tonnes of silver. In 1393 the king had him thrown off Charles Bridge into the river, for keeping the queen’s confession secret, the story goes.' },
        { name: 'Johannes Nepomuk', text: 'Zijn graf (1736) is gemaakt van zo’n twee ton zilver. In 1393 liet de koning hem van de Karelsbrug in de rivier gooien, omdat hij de biecht van de koningin geheim hield, zegt het verhaal.' }),
      card('💎', -11.5, 0, 5,
        { name: 'The St Wenceslas Chapel', text: 'Its walls are set with more than 1,300 jasper and amethyst stones. A door in its corner, with seven locks whose keys are held by seven people, leads up to the Bohemian crown jewels.' },
        { name: 'De Wenceslaskapel', text: 'De muren zijn ingelegd met meer dan 1.300 stukken jaspis en amethist. Een deur in de hoek, met zeven sloten waarvan zeven mensen de sleutels hebben, leidt naar de Boheemse kroonjuwelen.' }),
    ],
  },
];
