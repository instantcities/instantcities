// The quests in Antwerp: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'brabo', emoji: '🖐️', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'statue', time: 150, start: [16, -179], thief: [-29, -219],
    text: {
      nl: {
        title: 'Wie heeft Brabo?',
        where: 'Start op de Grote Markt. Vang de dief met Brabo.',
        story: 'De fontein op de Grote Markt is leeg: iemand is ervandoor met Brabo, de held die de hand van de reus in de Schelde gooide. Daar gaan ze, naar de stroom. Vang hem voor Brabo zelf in het water belandt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🖐️',
        win: '🖐️ Brabo staat terug op zijn fontein, de hand in de lucht.',
        lose: '🦹 De dief is ontsnapt. Brabo is weg…',
      },
      en: {
        title: 'Who took Brabo?',
        where: 'Start on the Grote Markt. Catch the thief with Brabo.',
        story: 'The fountain on the Grote Markt is empty: someone has made off with Brabo, the hero who threw the giant’s hand into the Scheldt. There they go, towards the river. Catch them before Brabo ends up in the water himself.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🖐️',
        win: '🖐️ Brabo is back on his fountain, hand in the air.',
        lose: '🦹 The thief got away. Brabo is gone…',
      },
    },
  },
];
