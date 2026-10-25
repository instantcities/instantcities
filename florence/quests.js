// The quests in Florence: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'david', emoji: '🗿', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'statue', time: 150, start: [246, 152], thief: [234, 211],
    text: {
      nl: {
        title: 'Kleine David op de vlucht',
        where: 'Start op de Piazza della Signoria. Vang de dief.',
        story: 'Het mooiste stuk van een souvenirverkoper, een marmeren David van een meter hoog, is net van zijn kraam op de Piazza della Signoria gegrist. De dief gaat richting Ponte Vecchio. Vang hem voor David aan de overkant van de Arno belandt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🗿',
        win: '🗿 David staat terug op zijn kraam, even trots als altijd.',
        lose: '🦹 De dief is de Arno over…',
      },
      en: {
        title: 'Little David on the run',
        where: 'Start on Piazza della Signoria. Catch the thief.',
        story: 'A souvenir seller’s best piece, a marble David a metre tall, has just been snatched from his stall on Piazza della Signoria. The thief is heading for the Ponte Vecchio. Catch them before David ends up across the Arno.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🗿',
        win: '🗿 David is back on his stall, as proud as ever.',
        lose: '🦹 The thief got away across the Arno…',
      },
    },
  },
];
