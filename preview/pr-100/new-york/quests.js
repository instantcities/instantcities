// The quests in New York: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'century', emoji: '🚂', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 240, start: [-404, -482], goal: [400, 310], radius: 22,
    text: {
      nl: {
        title: 'De 20th Century Limited',
        where: 'Van Times Square naar Grand Central voor de trein vertrekt.',
        story: 'Het is 1938. Om zes uur vertrekt de 20th Century Limited uit Grand Central naar Chicago, en op het perron ligt al de rode loper voor de reizigers. Je tante staat erop te wachten, en jij hebt de kaartjes, midden op Times Square. Seventh Avenue af en over 42nd Street, langs de gele taxi’s!',
        hud: '🚂 Naar Grand Central!',
        done: 'INSTAPPEN! 🚂',
        win: '🚂 Over de rode loper de trein in, net voor de deuren dichtgaan. Morgenvroeg ben je in Chicago.',
        lose: '🚂 De trein is weg. Op het perron ligt alleen de rode loper nog…',
      },
      en: {
        title: 'The 20th Century Limited',
        where: 'From Times Square to Grand Central before the train leaves.',
        story: 'It is 1938. At six o’clock the 20th Century Limited leaves Grand Central for Chicago, and the red carpet is already rolled out on the platform for its passengers. Your aunt is waiting on it, and you have the tickets, in the middle of Times Square. Down Seventh Avenue and along 42nd Street, past the yellow cabs!',
        hud: '🚂 To Grand Central!',
        done: 'ALL ABOARD! 🚂',
        win: '🚂 Down the red carpet and onto the train just before the doors close. Chicago by morning.',
        lose: '🚂 The train has gone. All that is left on the platform is the red carpet…',
      },
    },
  },
];
