// The quests at Pompeii: a short mission, against the clock (the rules for each kind are in
// core/js/quests.js, and lecce/quests.js says what each field means). Positions are game metres on
// this site's map, as [x, z]. Words in English and Dutch; the other languages show the English.
import { game } from './frame.js';

export const QUESTS = [
  {
    id: 'ash', emoji: '🌋', player: { mount: 'foot', pick: 'bliksem' }, kind: 'reach', time: 240, start: game(40.7508, 14.4850), goal: game(40.7498, 14.4975), radius: 28,
    text: {
      nl: {
        title: 'Weg voor de as',
        where: 'Van het Forum naar het amfitheater, voor de as valt.',
        story: 'De Vesuvius gromt en de eerste as valt al op het Forum. Ren door de Via dell’Abbondanza naar de poort bij het amfitheater en de weg uit de stad.',
        hud: '🌋 Naar de poort!',
        done: 'Je bent buiten! 🌋',
        win: '🌋 Je ziet de stad achter je onder de as verdwijnen. Je bent veilig.',
        lose: '💨 Te laat: de as is overal.',
      },
      en: {
        title: 'Ahead of the ash',
        where: 'From the Forum to the amphitheatre, before the ash falls.',
        story: 'Vesuvius is rumbling and the first ash is already falling on the Forum. Run along the Via dell’Abbondanza to the gate by the amphitheatre and the road out of town.',
        hud: '🌋 To the gate!',
        done: 'You are out! 🌋',
        win: '🌋 You watch the town vanish under the ash behind you. You are safe.',
        lose: '💨 Too late: the ash is everywhere.',
      },
    },
  },
];
