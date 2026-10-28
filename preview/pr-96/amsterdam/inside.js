// The buildings in Amsterdam you can go into (js/interiors.js): the Rijksmuseum, as three of its
// key rooms. It stands on the Museumplein, south of what the map holds, so it has no door in the
// street: the big map takes you in, and its door out lets you into the city on the Leidsestraat by
// the Prinsengracht, the way to it.
import { makeRijksmuseum } from './inside/rijksmuseum.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'rijksmuseum', emoji: '🖼️', make: makeRijksmuseum, size: [-15, -15, 15, 96],
    name: { en: 'The Rijksmuseum', nl: 'Het Rijksmuseum' },
    out: { x: -500.7, z: 762.3, yaw: Math.PI, name: 'Leidsestraat' },
    look: { hemi: [0xfff6ea, 0xc8bca8, 2.3], horizon: 0x6a6258 },
    exhibits: [
      card('🏛️', 0, -7, 7,
        { name: 'The Rijksmuseum', text: 'Pierre Cuypers built it in 1885, and it was so like a cathedral that King William III would not open it. A bike path still runs right through it, under the building.' },
        { name: 'Het Rijksmuseum', text: 'Pierre Cuypers bouwde het in 1885, en het leek zo op een kathedraal dat koning Willem III weigerde het te openen. Er loopt nog altijd een fietspad dwars onder het gebouw door.' }),
      card('🥛', 0, 35, 12,
        { name: 'The Gallery of Honour', text: 'The Golden Age in its alcoves: Vermeer’s Milkmaid and Little Street, Frans Hals, Jan Steen, and Rembrandt’s Jewish Bride, all leading up to the Night Watch at the end.' },
        { name: 'De Eregalerij', text: 'De Gouden Eeuw in de nissen: het Melkmeisje en Het straatje van Vermeer, Frans Hals, Jan Steen en Het Joodse bruidje van Rembrandt, allemaal op weg naar de Nachtwacht aan het einde.' }),
      card('🛡️', 0, 88, 8,
        { name: 'The Night Watch', text: 'Rembrandt, 1642: the militia company of Captain Frans Banninck Cocq marching out. It is not a night scene at all, the varnish went dark. In 1715 it was cut down on every side to fit a wall in the town hall.' },
        { name: 'De Nachtwacht', text: 'Rembrandt, 1642: de schutterij van kapitein Frans Banninck Cocq die uitrukt. Het is helemaal geen nachttafereel, het vernis werd donker. In 1715 werd het aan alle kanten bijgesneden om op een muur in het stadhuis te passen.' }),
    ],
  },
];
