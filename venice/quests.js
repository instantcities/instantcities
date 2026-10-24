// The quests in Venice: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'tintoretto', emoji: '🖼️', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'painting', time: 150, start: [296, 337], thief: [241, 313],
    text: {
      nl: {
        title: 'Een Tintoretto op de vlucht',
        where: 'Start aan het Dogepaleis. Vang de dief voor de Rialto.',
        story: 'Iemand is het Dogepaleis uit geglipt met een schilderij van Tintoretto en duikt het doolhof van calli in. In Venetië zijn er geen auto’s om mee te vluchten: vang hem, over de bruggen, voor hij de Rialto haalt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🖼️',
        win: '🖼️ De Tintoretto gaat terug naar het Dogepaleis.',
        lose: '🦹 De dief is verdwenen in de calli…',
      },
      en: {
        title: 'A Tintoretto on the run',
        where: 'Start at the Doge’s Palace. Catch the thief before the Rialto.',
        story: 'Someone has slipped out of the Doge’s Palace with a painting by Tintoretto and is heading into the maze of calli. In Venice there are no cars to escape in: catch them on foot, over the bridges, before they reach the Rialto.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🖼️',
        win: '🖼️ The Tintoretto goes back to the Doge’s Palace.',
        lose: '🦹 The thief vanished into the calli…',
      },
    },
  },
];
