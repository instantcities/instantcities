// The quests in Bruges: a short mission somewhere in the city, against the clock (the
// rules for each kind are in core/js/quests.js, and lecce/quests.js says what each field means).
// Positions are game metres on this city's map, as [x, z]. Its words in English and Dutch; the other
// languages show the English.
export const QUESTS = [
  {
    id: 'madonna', emoji: '🗿', player: { mount: 'bike', pick: 'stroopwafel' }, kind: 'thief', loot: 'statue', time: 150, start: [-18, 275], thief: [20, 228],
    text: {
      nl: {
        title: 'De Madonna van Michelangelo',
        where: 'Start aan de Onze-Lieve-Vrouwekerk. Vang de dief met het beeld.',
        story: 'In 1944 droegen terugtrekkende Duitse soldaten de Madonna van Michelangelo de Onze-Lieve-Vrouwekerk uit, gewikkeld in matrassen, en pas de Monuments Men brachten haar terug. Nu loopt iemand er opnieuw mee weg. Vang hem voor hij de Markt haalt.',
        hud: '🦹 Vang de dief!',
        done: 'GEVANGEN! 🗿',
        win: '🗿 De Madonna staat terug in haar kapel.',
        lose: '🦹 De dief is ontsnapt met de Madonna…',
      },
      en: {
        title: 'Michelangelo’s Madonna',
        where: 'Start at the Church of Our Lady. Catch the thief with the statue.',
        story: 'In 1944 retreating German soldiers carried Michelangelo’s Madonna out of the Church of Our Lady, wrapped in mattresses, and only the Monuments Men brought her back. Now someone is running off with her again. Catch them before they reach the Markt.',
        hud: '🦹 Catch the thief!',
        done: 'CAUGHT! 🗿',
        win: '🗿 The Madonna is back in her chapel.',
        lose: '🦹 The thief got away with the Madonna…',
      },
    },
  },
];
