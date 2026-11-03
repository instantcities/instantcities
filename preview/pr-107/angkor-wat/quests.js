// The quests at Angkor Wat: a short mission, against the clock (the rules for each kind are in
// core/js/quests.js, and lecce/quests.js says what each field means). Positions are game metres on
// this site's map, as [x, z]. Words in English and Dutch; the other languages show the English.
import { game } from './frame.js';

export const QUESTS = [
  {
    id: 'sunrise', emoji: '🌅', player: { mount: 'foot', pick: 'karamel' }, kind: 'reach', time: 200, start: game(-540, -4), goal: game(-190, -4), radius: 26,
    text: {
      nl: {
        title: 'Zonsopgang boven Angkor',
        where: 'Van de westelijke poort over de dam naar de tempel, voor de zon opkomt.',
        story: 'De beste foto van Angkor Wat maak je als de zon boven de vijf torens opkomt, en de poort is net open. Ren over de dam, voor de eerste bussen er zijn.',
        hud: '🌅 Naar de tempel!',
        done: 'Daar is de zon! 🌅',
        win: '🌅 De torens kleuren oranje. De vroege start was het waard.',
        lose: '🚌 Te laat: de eerste groepen staan al op je foto.',
      },
      en: {
        title: 'Sunrise over Angkor',
        where: 'From the western gate over the causeway to the temple, before the sun comes up.',
        story: 'The best photo of Angkor Wat is the one with the sun coming up behind the five towers, and the gate has just opened. Run along the causeway before the first coaches arrive.',
        hud: '🌅 To the temple!',
        done: 'There is the sun! 🌅',
        win: '🌅 The towers turn orange. Worth the early start.',
        lose: '🚌 Too late: the first groups are already in your picture.',
      },
    },
  },
];
