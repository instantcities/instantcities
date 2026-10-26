// The quests at Stonehenge: a short mission, against the clock (the rules for each kind are in
// core/js/quests.js, and lecce/quests.js says what each field means). Positions are game metres on
// this site's map, as [x, z]. Words in English and Dutch; the other languages show the English.
import { at } from './frame.js';

export const QUESTS = [
  {
    id: 'solstice', emoji: '🌅', player: { mount: 'foot', pick: 'karamel' }, kind: 'reach', time: 130, start: at(-70, 60), goal: at(58, -48), radius: 14,
    text: {
      nl: {
        title: 'Zonsopgang op midzomer',
        where: 'Van de westkant van de stenen naar de Heel Stone, voor de zon opkomt.',
        story: 'Het is midzomermorgen, de kortste nacht van het jaar. Duizenden mensen staan al aan de oostkant om de zon boven de Heel Stone te zien opkomen. Ren door de stenen en sta bij de Heel Stone voor het licht erover valt.',
        hud: '🌅 Naar de Heel Stone!',
        done: 'Daar is de zon! 🌅',
        win: '🌅 De eerste stralen vallen langs de Avenue de cirkel in. Zo deden ze het al 4000 jaar.',
        lose: '☁️ Te laat: de zon staat al boven de heuvel.',
      },
      en: {
        title: 'Midsummer sunrise',
        where: 'From the west side of the stones to the Heel Stone, before the sun comes up.',
        story: 'It is midsummer morning, the shortest night of the year. Thousands of people already stand by the Heel Stone to watch the sun rise over it. Run through the stones and get to it before the light does.',
        hud: '🌅 To the Heel Stone!',
        done: 'There is the sun! 🌅',
        win: '🌅 The first rays run down the Avenue and into the circle, as they have for 4,000 years.',
        lose: '☁️ Too late: the sun is already over the hill.',
      },
    },
  },
];
