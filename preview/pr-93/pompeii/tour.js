// The tour: a flight along the race route over the roofs of Pompeii, slowing down at the Forum, the
// Stabian Baths and where Vesuvius shows over the town (hand-written, from the route in map.js). The
// path is [x, z, height] in game metres; see ghent/tour.js for everything a tour can have.
import { VESUVIUS } from './vesuvius.js';

const V = VESUVIUS[0];

export const TOUR = {
  path: [
    [118, 106, 6], [151, 93, 6], [184, 75, 16], [189, 40, 16], [165, 13, 16],
    [140, -14, 16], [116, -42, 16], [92, -70, 16], [68, -97, 16], [44, -125, 16],
    [20, -153, 16], [-12, -165, 16], [-43, -146, 16], [-74, -127, 16], [-105, -107, 16],
    [-136, -88, 16], [-167, -69, 16], [-197, -52, 16], [-189, -18, 16], [-175, 15, 16],
    [-162, 47, 16], [-146, 78, 16], [-126, 107, 16], [-112, 141, 16], [-95, 172, 16],
    [-62, 164, 16], [-27, 153, 16], [7, 142, 16], [41, 131, 16], [75, 120, 6],
    [110, 109, 6],
  ],
  stops: [
    {
      emoji: '🏛️', at: [-112, 141], look: [-176, 8, 52],
      text: {
        en: { name: 'The Forum', text: 'The square at the middle of Pompeii, 140 metres long, with the Temple of Jupiter at the far end. Shops, courts and the market stood round it.' },
        nl: { name: 'Het Forum', text: 'Het plein in het midden van Pompeii, 140 meter lang, met de Jupitertempel aan het uiteinde. Winkels, rechtbanken en de markt lagen eromheen.' },
      },
    },
    {
      emoji: '🛁', at: [151, 93], look: [148, 5, 52],
      text: {
        en: { name: 'The Stabian Baths', text: 'The oldest public baths in the town, with a gymnasium, hot and cold rooms and a swimming pool. Citizens came every day.' },
        nl: { name: 'De Stabiaanse thermen', text: 'De oudste openbare baden van de stad, met een sportplein, warme en koude zalen en een zwembad. De inwoners kwamen er elke dag.' },
      },
    },
    {
      emoji: '🌋', at: [-60, 60], look: [V.x * 0.1, 400, V.z * 0.1],
      text: {
        en: { name: 'Vesuvius', text: 'On 24 August AD 79 the mountain behind the town blew up. Ash and pumice buried Pompeii in a day and kept it as it was for 1,700 years.' },
        nl: { name: 'De Vesuvius', text: 'Op 24 augustus 79 ontplofte de berg achter de stad. As en puimsteen begroeven Pompeii in een dag en bewaarden het 1700 jaar zoals het was.' },
      },
    },
  ],
  names: [],
};
