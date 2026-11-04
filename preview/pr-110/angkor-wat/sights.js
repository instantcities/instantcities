// Angkor Wat's sights: ride up to one while exploring and a card tells you what you are looking at.
// Each { id, emoji, x, z (game metres, where the card counts from), r (how close you have to be, game
// metres), text: { <lang>: { name, text } } }. In English and Dutch; the other languages show the English.
import { game } from './frame.js';

const at = (x, z) => game(x, z);
export const SIGHTS = [
  {
    id: 'moat', emoji: '💧', x: at(-700, -4)[0], z: at(-700, -4)[1], r: 130,
    text: {
      en: { name: 'The moat', text: 'A moat 190 metres wide runs right round the temple, 5.5 kilometres in all. It stands for the ocean round Mount Meru, home of the gods, and it kept the temple’s ground damp and firm.' },
      nl: { name: 'De slotgracht', text: 'Een gracht van 190 meter breed loopt helemaal rond de tempel, 5,5 kilometer lang. Ze staat voor de oceaan rond de berg Meru, het huis van de goden, en hield de grond onder de tempel vochtig en stevig.' },
    },
  },
  {
    id: 'gopura', emoji: '🚪', x: at(-565, -3)[0], z: at(-565, -3)[1], r: 90,
    text: {
      en: { name: 'The western gopura', text: 'The long gate in the outer wall, with three towers. Elephants could walk through the middle. Behind it a stone road runs 350 metres to the temple.' },
      nl: { name: 'De westelijke poort', text: 'De lange poort in de buitenmuur, met drie torens. Olifanten konden door het midden. Erachter loopt een stenen weg van 350 meter naar de tempel.' },
    },
  },
  {
    id: 'libraries', emoji: '📜', x: at(-377, 2)[0], z: at(-377, 2)[1], r: 90,
    text: {
      en: { name: 'The libraries', text: 'Two small buildings on either side of the road, called libraries. Nobody knows what they held: scrolls, or sacred objects.' },
      nl: { name: 'De bibliotheken', text: 'Twee kleine gebouwen aan weerszijden van de weg, de bibliotheken genoemd. Niemand weet wat erin lag: rollen, of heilige voorwerpen.' },
    },
  },
  {
    id: 'terrace', emoji: '🐍', x: at(-163, 3)[0], z: at(-163, 3)[1], r: 60,
    text: {
      en: { name: 'The Terrace of Honour', text: 'A cross-shaped terrace in front of the temple, where the king is thought to have met the people. Carved nagas, seven-headed snakes, guard the road.' },
      nl: { name: 'Het Terras van Eer', text: 'Een kruisvormig terras voor de tempel, waar de koning het volk zou hebben ontmoet. Gebeeldhouwde naga’s, slangen met zeven koppen, bewaken de weg.' },
    },
  },
  {
    id: 'galleries', emoji: '🖼️', x: at(-122, 5)[0], z: at(-122, 5)[1], r: 80,
    text: {
      en: { name: 'The galleries', text: 'The outer gallery is 800 metres long and carved with scenes from Hindu epics and the king’s battles: the longest stone relief in the world. Two more galleries rise above it.' },
      nl: { name: 'De galerijen', text: 'De buitenste galerij is 800 meter lang en bedekt met taferelen uit Hindoeïstische epen en de veldslagen van de koning: het langste stenen reliëf ter wereld. Twee galerijen rijzen erboven op.' },
    },
  },
  {
    id: 'angkor-wat', emoji: '🛕', x: at(-7.5, 5.5)[0], z: at(-7.5, 5.5)[1], r: 110,
    text: {
      en: { name: 'Angkor Wat', text: 'Built in the early 1100s for the Khmer king Suryavarman II, first as a Hindu temple and later a Buddhist one. Three levels rise to five towers, the middle one 65 metres high, in the shape of the mountain of the gods.' },
      nl: { name: 'Angkor Wat', text: 'Gebouwd in het begin van de 12de eeuw voor de Khmerkoning Suryavarman II, eerst als Hindoetempel en later als boeddhistische. Drie niveaus rijzen op naar vijf torens, de middelste 65 meter hoog, in de vorm van de berg van de goden.' },
    },
  },
];
