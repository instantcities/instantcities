// The buildings in Venice you can go into (js/interiors.js): St Mark's Basilica, its door on Piazza
// San Marco; yaw is the way out, away from the building.
import { makeSanMarco, SIZE } from './inside/sanmarco.js';

const card = (emoji, x, z, r, en, nl) => ({ emoji, x, z, r, text: { en, nl } });

export const INSIDE = [
  {
    id: 'san-marco', emoji: '✨', make: makeSanMarco, size: SIZE, lookUp: 14,
    name: { en: 'St Mark’s Basilica', nl: 'De San Marcobasiliek' },
    door: { x: 189.5, z: 226.1, yaw: -Math.PI / 2, name: 'Piazza San Marco' },
    look: { hemi: [0xffe8c0, 0x8a6a3a, 1.9], horizon: 0x3a2a18 },
    exhibits: [
      card('✨', 0, 0, 8,
        { name: 'The golden church', text: 'Five domes on a Greek cross, after the Holy Apostles in Constantinople, consecrated in 1094. More than 8,000 m² of gold mosaic cover its vaults, the tesserae set a little crooked so they catch the candlelight.' },
        { name: 'De gouden kerk', text: 'Vijf koepels op een Grieks kruis, naar de Apostelenkerk in Constantinopel, ingewijd in 1094. Meer dan 8.000 m² gouden mozaïek bedekt de gewelven, de steentjes een beetje scheef gezet zodat ze het kaarslicht vangen.' }),
      card('🌊', 0, -18, 7,
        { name: 'The floor', text: 'Twelfth-century marble mosaic, animals and patterns, gone up and down like waves as the church settled into the mud of the lagoon.' },
        { name: 'De vloer', text: 'Marmermozaïek uit de 12de eeuw, dieren en patronen, op en neer gegaan als golven terwijl de kerk in de modder van de lagune zakte.' }),
      card('🦁', 0, 20, 6,
        { name: 'The Pala d’Oro', text: 'The golden altarpiece behind the high altar, made in Constantinople and Venice from 976 to 1345: some 250 enamels, about 1,900 pearls, garnets, emeralds and sapphires. St Mark himself lies under the altar, his body stolen from Alexandria in 828.' },
        { name: 'De Pala d’Oro', text: 'Het gouden altaarstuk achter het hoogaltaar, gemaakt in Constantinopel en Venetië van 976 tot 1345: een 250-tal emails, zo’n 1.900 parels, granaten, smaragden en saffieren. Sint-Marcus zelf ligt onder het altaar, zijn lichaam in 828 uit Alexandrië gestolen.' }),
    ],
  },
];
