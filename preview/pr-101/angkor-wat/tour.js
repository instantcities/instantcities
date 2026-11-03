// The tour: a flight from the moat's far side over the causeway, through the outer gopura and along
// the processional way to the temple, once round its three levels and its five towers, and back
// (hand-written). The path is [x, z, height] in game metres; see ghent/tour.js for everything a
// tour can have. Places are given in OpenStreetMap's metres from the map's origin (frame.js).
import { game } from './frame.js';

const C = game(-7.5, 5.5); // the middle of the third level
const on = (x, h) => [...game(x, -4), h]; // a point on the causeway, h up
const around = (r, h, from, to, n) => Array.from({ length: n + 1 }, (_, k) => {
  const t = from + ((to - from) * k) / n;
  return [Math.round(C[0] + r * Math.cos(t)), Math.round(C[1] + r * Math.sin(t)), h];
});

export const TOUR = {
  path: [
    on(-770, 10), on(-690, 14), on(-620, 24), on(-565, 34), on(-500, 22), on(-420, 14), on(-340, 12), on(-260, 16), on(-190, 30), on(-120, 62),
    // up to the temple's west side, then once round it clockwise from there
    ...around(230, 96, Math.PI, Math.PI + 2 * Math.PI, 20),
    on(-110, 60), on(-250, 22), on(-420, 16), on(-565, 30), on(-690, 14),
  ],
  stops: [
    {
      emoji: '🚪', at: on(-565, 34).slice(0, 2), look: [game(-565, -3)[0], 20, game(-565, -3)[1]],
      text: {
        en: { name: 'The western gopura', text: 'The long gate in the outer wall, with a tower over the way through. Behind you the moat is 190 metres wide.' },
        nl: { name: 'De westelijke poort', text: 'De lange poort in de buitenmuur, met een toren boven de doorgang. Achter je is de slotgracht 190 meter breed.' },
      },
    },
    {
      emoji: '🐍', at: on(-340, 12).slice(0, 2), look: [game(-150, -4)[0], 40, game(-150, -4)[1]],
      text: {
        en: { name: 'The causeway', text: 'A stone road 350 metres long from the gate to the temple, with a low wall along each side. The temple stands at the end of it.' },
        nl: { name: 'De dam', text: 'Een stenen weg van 350 meter van de poort naar de tempel, met aan beide kanten een lage muur. Aan het eind staat de tempel.' },
      },
    },
    {
      emoji: '🛕', at: on(-190, 30).slice(0, 2), look: [C[0], 40, C[1]],
      text: {
        en: { name: 'Angkor Wat', text: 'Built in the early 1100s for the Khmer king Suryavarman II. Three levels of galleries rise to five towers. The middle one is 65 metres high.' },
        nl: { name: 'Angkor Wat', text: 'Gebouwd in het begin van de 12de eeuw voor de Khmerkoning Suryavarman II. Drie niveaus galerijen rijzen op naar vijf torens. De middelste is 65 meter hoog.' },
      },
    },
  ],
  names: [],
};
