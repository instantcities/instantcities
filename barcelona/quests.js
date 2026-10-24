// The quests in Barcelona: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'ferry', emoji: '⛴️', player: { mount: 'bike', pick: 'karamel' }, kind: 'reach', time: 400, start: [-495, -740], goal: [320, 808], radius: 22,
    text: {
      nl: {
        title: 'De boot naar Mallorca',
        where: 'Van de Plaça de Catalunya naar de haven bij het Columbusmonument.',
        story: 'Je ferry naar Mallorca vertrekt uit de haven onderaan de Rambla, en jij staat nog bovenaan. Naar beneden dan, langs de bloemenkraampjes, de Boqueria en het Liceu, tussen de drukte door, tot waar Columbus naar zee wijst.',
        hud: '⛴️ Naar de haven!',
        done: 'AAN BOORD! ⛴️',
        win: '⛴️ De loopplank gaat net achter je omhoog. ¡Bon viatge!',
        lose: '⛴️ De ferry is al op zee…',
      },
      en: {
        title: 'The boat to Mallorca',
        where: 'From Plaça de Catalunya down to the port by the Columbus monument.',
        story: 'Your ferry to Mallorca leaves from the port at the bottom of the Rambla, and you are still at the top. Down you go, past the flower stalls, the Boqueria and the Liceu, between the crowds, to where Columbus points out to sea.',
        hud: '⛴️ To the port!',
        done: 'ON BOARD! ⛴️',
        win: '⛴️ The ramp goes up just behind you. ¡Bon viatge!',
        lose: '⛴️ The ferry is already out at sea…',
      },
    },
  },
];
