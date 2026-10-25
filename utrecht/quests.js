// The quests in Utrecht: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'domtoren', emoji: '🔔', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'reach', time: 120, start: [-452, -132], goal: [-155, 141], radius: 22,
    text: {
      nl: {
        title: 'Voor de klokken luiden',
        where: 'Van de Neude naar de Domtoren.',
        story: 'De rondleiding naar de top van de Domtoren vertrekt om twaalf uur, en jij staat nog met je fiets op de Neude. Door de straatjes naar het Domplein, voor de klokken luiden!',
        hud: '🔔 Naar de Domtoren!',
        done: 'NET OP TIJD! 🔔',
        win: '🔔 Je zet je fiets tegen de toren terwijl de gids de deur opendoet. 465 treden, daar ga je!',
        lose: '🔔 De klokken slaan twaalf, de groep is al naar boven…',
      },
      en: {
        title: 'Before the bells ring',
        where: 'From the Neude to the Dom Tower.',
        story: 'The tour to the top of the Dom Tower leaves at noon, and you are still on the Neude with your bike. Through the lanes to the Domplein, before the bells ring!',
        hud: '🔔 To the Dom Tower!',
        done: 'JUST IN TIME! 🔔',
        win: '🔔 You lean your bike against the tower as the guide opens the door. 465 steps, off you go!',
        lose: '🔔 The bells strike twelve, the group has gone up without you…',
      },
    },
  },
];
