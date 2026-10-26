// The tour: a flight round the stone circle at 95 m, in over the Heel Stone and the Avenue's start,
// once low round the stones themselves, up the axis to the Heel Stone and back (hand-written). The
// path is [x, z, height] in game metres; see ghent/tour.js for everything a tour can have.
import { at } from './frame.js';

const C = at(0, 0);
const around = (r, h, from, to, n) => Array.from({ length: n + 1 }, (_, k) => {
  const t = from + ((to - from) * k) / n;
  return [Math.round(C[0] + r * Math.cos(t)), Math.round(C[1] + r * Math.sin(t)), h];
});
const on = (e, s, h) => [...at(e, s).map(Math.round), h];

export const TOUR = {
  path: [
    on(260, -215, 14), on(180, -150, 18), on(110, -90, 14), on(68, -56, 10),
    // in past the Heel Stone, once round the circle low between the bank and the stones, then the outside
    ...around(32 * 1.25, 8, -0.7, -0.7 + 2 * Math.PI, 20),
    ...around(75 * 1.25, 24, -0.7, -0.7 + 1.3, 6),
    on(110, -90, 14), on(180, -150, 18), on(260, -215, 14),
  ],
  stops: [
    {
      emoji: '🌅', at: on(110, -90, 14).slice(0, 2), look: [at(58, -48)[0], 4, at(58, -48)[1]],
      text: {
        en: { name: 'The Heel Stone', text: 'A single stone out on the axis, 77 metres from the middle. At midsummer the sun comes up over its tip, and its light runs straight down the Avenue into the stones.' },
        nl: { name: 'De Heel Stone', text: 'Een enkele steen op de as, 77 meter van het midden. Op midzomerdag komt de zon boven de top op en schijnt het licht langs de Avenue recht in de stenen.' },
      },
    },
    {
      emoji: '🪨', at: on(40, -30, 8).slice(0, 2), look: [C[0], 5, C[1]],
      text: {
        en: { name: 'The sarsen circle', text: 'Thirty great stones from the Marlborough Downs, 4 metres high and weighing about 25 tonnes each, with a ring of lintels across their tops. Only 17 still stand.' },
        nl: { name: 'De sarsencirkel', text: 'Dertig enorme stenen van de Marlborough Downs, 4 meter hoog en zo’n 25 ton per stuk, met een ring van dekstenen erbovenop. Er staan er nog maar 17.' },
      },
    },
    {
      emoji: '⛰️', at: on(-60, 40, 24).slice(0, 2), look: [at(-4, 1)[0], 5, at(-4, 1)[1]],
      text: {
        en: { name: 'The trilithons', text: 'Inside the circle stand five pairs of even taller stones, each pair with a lintel across it, set in a horseshoe. The tallest, at the back, was over 7 metres high.' },
        nl: { name: 'De trilithons', text: 'Binnen de cirkel staan vijf paren nog hogere stenen, elk met een deksteen, in een hoefijzer. De hoogste, achteraan, was meer dan 7 meter hoog.' },
      },
    },
  ],
  names: [],
};
