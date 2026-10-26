// The quests at Giza: a short mission, against the clock (the rules for each kind are in
// core/js/quests.js, and lecce/quests.js says what each field means). Positions are game metres on
// this site's map, as [x, z]. Words in English and Dutch; the other languages show the English.
import { game } from './frame.js';

export const QUESTS = [
  {
    id: 'sunrise', emoji: '🌅', player: { mount: 'foot', pick: 'bliksem' }, kind: 'reach', time: 240, start: game(29.97194, 31.12833), goal: game(29.97530, 31.13760), radius: 40,
    text: {
      nl: {
        title: 'De Sfinx bij zonsopgang',
        where: 'Van de piramide van Mykerinos naar de Sfinx, voor de zon boven de vlakte staat.',
        story: 'De bussen komen pas over een uur, en de beste foto van de Sfinx maak je als de eerste zon op zijn gezicht valt. Ren over het plateau langs de piramides en sta bij zijn poten voor het licht verandert.',
        hud: '🌅 Naar de Sfinx!',
        done: 'Daar is hij! 🌅',
        win: '🌅 De zon valt op het gezicht dat naar het oosten kijkt, zoals al 4500 jaar.',
        lose: '🚌 Te laat: de eerste bussen staan al in je beeld.',
      },
      en: {
        title: 'The Sphinx at sunrise',
        where: 'From the pyramid of Menkaure to the Sphinx, before the sun is up over the plain.',
        story: 'The coaches are an hour away, and the best photo of the Sphinx is the one with the first sun on its face. Run across the plateau past the pyramids and be at its paws before the light changes.',
        hud: '🌅 To the Sphinx!',
        done: 'There it is! 🌅',
        win: '🌅 The sun lands on the face that looks east, as it has for 4,500 years.',
        lose: '🚌 Too late: the first coaches are already in your picture.',
      },
    },
  },
];
